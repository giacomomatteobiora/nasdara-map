// One-off check of the loot model: a copy of the vanilla Nasdara mission whose CE runs normally on a fresh storage;
// after a while every loose item in the world is written to $profile:lootdump_<n>.txt as "type x y z", then the
// server exits. Paste over main() in mpmissions/lootdump.nasdara/init.c (keep CustomMission + CreateCustomMission).
// Grid sweep at 40 m; GetObjectsAtPosition3D is a sphere, radius 50 also reaches upper floors.
void DumpLoot(int n)
{
	FileHandle f = OpenFile("$profile:lootdump_" + n + ".txt", FileMode.WRITE);
	float size = GetGame().GetWorld().GetWorldSize();
	float step = 40;
	set<Object> seen = new set<Object>;
	array<Object> objs = new array<Object>;
	int count = 0;
	for (float z = step / 2; z < size; z += step)
	{
		for (float x = step / 2; x < size; x += step)
		{
			objs.Clear();
			GetGame().GetObjectsAtPosition3D(Vector(x, GetGame().SurfaceY(x, z), z), 50, objs, null);
			foreach (Object o : objs)
			{
				EntityAI e = EntityAI.Cast(o);
				if (!e || !e.IsInventoryItem() || e.GetHierarchyParent() || seen.Find(o) != -1)
					continue;
				seen.Insert(o);
				vector p = o.GetPosition();
				FPrintln(f, o.GetType() + " " + p[0] + " " + p[1] + " " + p[2]);
				count++;
			}
		}
	}
	FPrintln(f, "SCAN_DONE " + count);
	CloseFile(f);
	Print("[LOOTDUMP] dump " + n + " items=" + count);
	if (n >= 2)
		GetGame().RequestExit(0);
}

void main()
{
	//INIT ECONOMY--------------------------------------
	Hive ce = CreateHive();
	if ( ce )
		ce.InitOffline();
	// dump the world's loot after 6 and 14 minutes (is the CE still filling the map?)
	GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY).CallLater(DumpLoot, 6 * 60 * 1000, false, 1);
	GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY).CallLater(DumpLoot, 14 * 60 * 1000, false, 2);
}
