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

void main()
{
	int t0 = TickCount(0);
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
