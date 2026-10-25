// Paste over main() in a copy of mpmissions/dayzOffline.nasdara/init.c (keep CustomMission + CreateCustomMission).
// Needs $profile:buildings_in.txt (tools/build_data.py scan-input). Run the server with -profiles=profiles-mapscan, no -freezecheck.
// ---- MAP SCAN (one-off export for the Nasdara web map; not a playable mission) ----
void ScanNames()
{
	string world;
	GetGame().GetWorldName(world);
	string cfg = "CfgWorlds " + world + " Names";
	FileHandle f = OpenFile("$profile:names.txt", FileMode.WRITE);
	int count = GetGame().ConfigGetChildrenCount(cfg);
	for (int i = 0; i < count; i++)
	{
		string child, name, ntype;
		GetGame().ConfigGetChildName(cfg, i, child);
		GetGame().ConfigGetText(cfg + " " + child + " name", name);
		GetGame().ConfigGetText(cfg + " " + child + " type", ntype);
		TFloatArray p = {};
		GetGame().ConfigGetFloatArray(cfg + " " + child + " position", p);
		if (p.Count() >= 2)
			FPrintln(f, child + "\t" + ntype + "\t" + p[0] + "\t" + p[1] + "\t" + name);
	}
	FPrintln(f, "SCAN_DONE " + count);
	CloseFile(f);
}

Object FindBuilding(vector pos, string cls, float radius)
{
	array<Object> objs = new array<Object>;
	GetGame().GetObjectsAtPosition(pos, radius, objs, null);
	Object best;
	float bestDist = 1000000.0;
	foreach (Object o : objs)
	{
		string t = o.GetType();
		t.ToLower();
		if (t != cls)
			continue;
		float d = vector.Distance(o.GetPosition(), pos);
		if (d < bestDist)
		{
			bestDist = d;
			best = o;
		}
	}
	return best;
}

void ScanBuildings()
{
	FileHandle inp = OpenFile("$profile:buildings_in.txt", FileMode.READ);
	FileHandle f = OpenFile("$profile:buildings.txt", FileMode.WRITE);
	string line;
	int found = 0;
	int missed = 0;
	while (FGets(inp, line) > 0)
	{
		array<string> parts = new array<string>;
		line.Split(" ", parts);
		if (parts.Count() < 5)
			continue;
		string cls = parts[1];
		cls.ToLower();
		vector pos = Vector(parts[2].ToFloat(), parts[3].ToFloat(), parts[4].ToFloat());
		Object o = FindBuilding(pos, cls, 2);
		if (!o)
			o = FindBuilding(pos, cls, 8);
		if (!o)
		{
			FPrintln(f, parts[0] + " MISS");
			missed++;
			continue;
		}
		vector mm[2];
		string src = "col";
		if (!o.GetCollisionBox(mm))
		{
			o.ClippingInfo(mm);
			src = "clip";
		}
		vector op = o.GetPosition();
		vector ori = o.GetOrientation();
		FPrintln(f, parts[0] + " " + ori[0] + " " + op[0] + " " + op[2] + " " + mm[0][0] + " " + mm[0][2] + " " + mm[1][0] + " " + mm[1][2] + " " + src);
		found++;
	}
	FPrintln(f, "SCAN_DONE found=" + found + " missed=" + missed);
	CloseFile(inp);
	CloseFile(f);
}

// 4096 x 4096 samples at 4 m (cell centres), rows north -> south.
// Each value = round(height * 10) * 2 + water bit.
void ScanHeights()
{
	FileHandle f = OpenFile("$profile:heights.txt", FileMode.WRITE);
	float size = GetGame().GetWorld().GetWorldSize();
	int n = 4096;
	float step = size / n;
	FPrintln(f, "worldsize " + size + " n " + n);
	for (int row = 0; row < n; row++)
	{
		float z = size - step * (row + 0.5);
		string chunk = "";
		for (int col = 0; col < n; col++)
		{
			float x = step * (col + 0.5);
			int v = Math.Round(GetGame().SurfaceY(x, z) * 10) * 2;
			if (GetGame().SurfaceIsPond(x, z) || GetGame().SurfaceIsSea(x, z))
				v++;
			chunk += v.ToString() + " ";
			if (col % 32 == 31)
			{
				FPrint(f, chunk);
				chunk = "";
			}
		}
		FPrintln(f, "");
	}
	FPrintln(f, "SCAN_DONE");
	CloseFile(f);
}

// Every object whose model path looks like power infrastructure: "shape x y z yaw" (deduplicated later in Python).
// Grid sweep at 40 m; GetObjectsAtPosition is a 3D sphere, so radius 50 also catches tall towers and wires.
void ScanPowerlines()
{
	FileHandle f = OpenFile("$profile:powerlines.txt", FileMode.WRITE);
	float size = GetGame().GetWorld().GetWorldSize();
	float step = 40;
	int hits = 0;
	array<Object> objs = new array<Object>;
	for (float z = step / 2; z < size; z += step)
	{
		for (float x = step / 2; x < size; x += step)
		{
			objs.Clear();
			GetGame().GetObjectsAtPosition(Vector(x, GetGame().SurfaceY(x, z), z), 50, objs, null);
			foreach (Object o : objs)
			{
				string shape = o.GetShapeName();
				shape.ToLower();
				if (shape.Contains("power") || shape.Contains("powline") || shape.Contains("pole") || shape.Contains("wire") || shape.Contains("pylon"))
				{
					vector op = o.GetPosition();
					vector ori = o.GetOrientation();
					FPrintln(f, shape + " " + op[0] + " " + op[1] + " " + op[2] + " " + ori[0]);
					hits++;
				}
			}
		}
	}
	FPrintln(f, "SCAN_DONE " + hits);
	CloseFile(f);
}

// Top-down height map of one instance per building class: rays every 0.5 m over the collision box (model space);
// each cell gets the model-space height of the highest hit on the building itself (view geometry, proxies included).
// Also writes the model-space ce_center (CE loot points in mapgroupproto are relative to it; same fallback as
// Object.GetCenter()) and the model-space ground height under the instance's origin.
// Input $profile:shapes_in.txt: "class x y z". Output per class: "class x0 z0 step nx nz cx cy cz ground" + nz rows of
// space-separated decimetres (model y * 10), "." where the ray missed the building, "u" prefix = only found from below
// the terrain (underground part).
void ScanShapes()
{
	FileHandle inp = OpenFile("$profile:shapes_in.txt", FileMode.READ);
	FileHandle f = OpenFile("$profile:shapes.txt", FileMode.WRITE);
	string line;
	int done = 0;
	float step = 0.5;
	array<ref RaycastRVResult> results = new array<ref RaycastRVResult>;
	while (FGets(inp, line) > 0)
	{
		array<string> parts = new array<string>;
		line.Split(" ", parts);
		if (parts.Count() < 4)
			continue;
		string cls = parts[0];
		cls.ToLower();
		vector pos = Vector(parts[1].ToFloat(), parts[2].ToFloat(), parts[3].ToFloat());
		Object o = FindBuilding(pos, cls, 2);
		if (!o)
			o = FindBuilding(pos, cls, 8);
		if (!o)
		{
			FPrintln(f, parts[0] + " MISS");
			continue;
		}
		vector mm[2];
		if (!o.GetCollisionBox(mm))
			o.ClippingInfo(mm);
		vector c = "0 0.2 0";
		if (o.MemoryPointExists("ce_center"))
			c = o.GetMemoryPointPos("ce_center");
		vector op = o.GetPosition();
		float ground = o.WorldToModel(Vector(op[0], GetGame().SurfaceY(op[0], op[2]), op[2]))[1];
		float x0 = mm[0][0] - 1;
		float z0 = mm[0][2] - 1;
		int nx = Math.Ceil((mm[1][0] - mm[0][0] + 2) / step);
		int nz = Math.Ceil((mm[1][2] - mm[0][2] + 2) / step);
		FPrintln(f, parts[0] + " " + x0 + " " + z0 + " " + step + " " + nx + " " + nz + " " + c[0] + " " + c[1] + " " + c[2] + " " + ground);
		for (int iz = 0; iz < nz; iz++)
		{
			string row = "";
			float lz = z0 + (iz + 0.5) * step;
			for (int ix = 0; ix < nx; ix++)
			{
				float lx = x0 + (ix + 0.5) * step;
				vector top = o.ModelToWorld(Vector(lx, mm[1][1] + 3, lz));
				vector bottom = o.ModelToWorld(Vector(lx, mm[0][1] - 1, lz));
				// first contact per object; the building itself or one of its proxies, the highest one wins.
				// The ray stops at the terrain, so cells without a hit get more rays from below the ground (underground
				// bunker rooms and tunnels). A ray starting less than ~1 m under the surface still hits the terrain first.
				bool any = false;
				float best = -100000;
				int hitPass = 0;
				for (int pass = 0; pass < 3 && !any; pass++)
				{
					vector from = top;
					if (pass == 1)
						from = Vector(top[0], GetGame().SurfaceY(top[0], top[2]) - 1.0, top[2]);
					if (pass == 2)
						from = Vector(top[0], GetGame().SurfaceY(top[0], top[2]) - 2.5, top[2]);
					RaycastRVParams params = new RaycastRVParams(from, bottom, null);
					params.type = ObjIntersectView;
					params.flags = CollisionFlags.ALLOBJECTS;
					results.Clear();
					DayZPhysics.RaycastRVProxy(params, results);
					foreach (RaycastRVResult r : results)
					{
						if (r.obj != o && r.parent != o)
							continue;
						float y = o.WorldToModel(r.pos)[1];
						if (!any || y > best)
							best = y;
						any = true;
						hitPass = pass;
					}
				}
				if (any && hitPass > 0)
					row += "u" + Math.Round(best * 10).ToString() + " ";
				else if (any)
					row += Math.Round(best * 10).ToString() + " ";
				else
					row += ". ";
			}
			FPrintln(f, row);
		}
		done++;
	}
	FPrintln(f, "SCAN_DONE " + done);
	CloseFile(inp);
	CloseFile(f);
}

// Road map: 8192 x 8192 cells at 2 m (cell centres), rows north -> south. Per cell: the surface found just above
// the road surface height (road objects / building floors) and whether that surface sits above the terrain.
// Output: "names" line (surface name table), then one line per row of run-length pairs "code count", where
// code = nameIndex * 2 + (raised above terrain ? 1 : 0).
void ScanRoads()
{
	FileHandle f = OpenFile("$profile:roads.txt", FileMode.WRITE);
	float size = GetGame().GetWorld().GetWorldSize();
	int n = 8192;
	float step = size / n;
	map<string, int> index = new map<string, int>;
	TStringArray names = {};
	FPrintln(f, "worldsize " + size + " n " + n);
	for (int row = 0; row < n; row++)
	{
		float z = size - step * (row + 0.5);
		string chunk = "";
		int prev = -1;
		int count = 0;
		for (int col = 0; col < n; col++)
		{
			float x = step * (col + 0.5);
			float ty = GetGame().SurfaceY(x, z);
			float ry = GetGame().SurfaceRoadY(x, z);
			string type;
			GetGame().SurfaceGetType3D(x, ry + 0.05, z, type);
			int idx;
			if (!index.Find(type, idx))
			{
				idx = names.Count();
				names.Insert(type);
				index.Insert(type, idx);
			}
			int code = idx * 2;
			if (ry > ty + 0.02)
				code++;
			if (code == prev)
			{
				count++;
				continue;
			}
			if (count)
				chunk += prev.ToString() + " " + count.ToString() + " ";
			prev = code;
			count = 1;
			if (chunk.Length() > 4000)
			{
				FPrint(f, chunk);
				chunk = "";
			}
		}
		chunk += prev.ToString() + " " + count.ToString();
		FPrintln(f, chunk);
	}
	string all = "";
	foreach (string nm : names)
		all += nm + " ";
	FPrintln(f, "names " + all);
	FPrintln(f, "SCAN_DONE");
	CloseFile(f);
}

// Localised display names for item classes ($profile:items_in.txt, one class per line).
void ScanItemNames()
{
	FileHandle inp = OpenFile("$profile:items_in.txt", FileMode.READ);
	FileHandle f = OpenFile("$profile:itemnames.txt", FileMode.WRITE);
	string line;
	TStringArray roots = {"CfgVehicles", "CfgWeapons", "CfgMagazines", "CfgAmmo"};
	while (FGets(inp, line) > 0)
	{
		line.TrimInPlace();
		foreach (string root : roots)
		{
			string path = root + " " + line;
			if (GetGame().ConfigIsExisting(path))
			{
				string name;
				GetGame().ConfigGetText(path + " displayName", name);
				FPrintln(f, line + "\t" + name);
				break;
			}
		}
	}
	FPrintln(f, "SCAN_DONE");
	CloseFile(inp);
	CloseFile(f);
}

void main()
{
	int t0 = TickCount(0);
	// $profile:shapes_only / roads_only -> just those scans (the rest is already done)
	if (FileExist("$profile:shapes_only") || FileExist("$profile:roads_only"))
	{
		if (FileExist("$profile:shapes_only"))
		{
			ScanItemNames();
			Print("[MAPSCAN] item names done");
			ScanShapes();
			Print("[MAPSCAN] shapes done, ticks=" + TickCount(t0));
		}
		if (FileExist("$profile:roads_only"))
		{
			ScanRoads();
			Print("[MAPSCAN] roads done, ticks=" + TickCount(t0));
		}
		GetGame().RequestExit(0);
		return;
	}
	// $profile:powerlines_only -> skip the (already done) names/buildings/heights scans
	if (!FileExist("$profile:powerlines_only"))
	{
		ScanNames();
		Print("[MAPSCAN] names done");
		ScanBuildings();
		Print("[MAPSCAN] buildings done");
		ScanHeights();
		Print("[MAPSCAN] heights done, ticks=" + TickCount(t0));
	}
	ScanPowerlines();
	Print("[MAPSCAN] powerlines done, ticks=" + TickCount(t0));
	GetGame().RequestExit(0);
}
