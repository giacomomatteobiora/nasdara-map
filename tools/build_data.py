"""Build the map's marker layers (site/data/*.json) from the Nasdara server mission files.

vehicles/events/spawns.json: {"<sub-type>": [[x, z, typeIndex], ...], ..., "_types": [names]}
buildings.json: {"usages": [...], "types": [[class, minX, minZ, maxX, maxZ], ...],
                 "b": [[x, z, yawDeg, typeIndex, usageBitmask], ...]}  (one entry per building)
names.json: [[name, type, x, z], ...]

Building footprints, yaw and place names come from the one-off server scan (tools/mapscan_init.c):
run `build_data.py scan-input` first, then the scan, then `build_data.py`.
"""
import json
import os
import statistics
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict

SERVER = os.path.expanduser("~/DayZ-Badlands-1.30/DayZServer")
MISSION = f"{SERVER}/mpmissions/dayzOffline.nasdara"
SCAN = f"{SERVER}/profiles-mapscan"
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "data")

# priority order: a building with several loot types is drawn with the first enabled one
USAGES = ["Military", "MilitaryWest", "MilitaryEast", "Police", "Medic", "Firefighter", "Prison", "Industrial",
          "Office", "School", "Town", "Village", "Farm", "Hunting", "Coast", "Historical", "Other"]

VEHICLES = ["VehicleCivilianSedan", "VehicleSedan02", "VehicleHatchback02", "VehicleOffroadHatchback",
            "VehicleOffroad02", "VehicleTruck01", "VehicleMotorbike"]
EVENTS = ["StaticHeliCrash", "StaticHeliCrashBig", "StaticMilitaryConvoy", "StaticPoliceCar",
          "StaticWaterTruck", "StaticContainerLocked"]


class Layer:
    def __init__(self):
        self.groups = defaultdict(list)
        self.types = []
        self.index = {}

    def add(self, group, x, z, type_name):
        if type_name not in self.index:
            self.index[type_name] = len(self.types)
            self.types.append(type_name)
        self.groups[group].append([round(float(x)), round(float(z)), self.index[type_name]])

    def save(self, name, order=None):
        keys = order or sorted(self.groups, key=lambda k: -len(self.groups[k]))
        data = {k: self.groups[k] for k in keys if k in self.groups}
        data["_types"] = self.types
        with open(f"{OUT}/{name}.json", "w") as f:
            json.dump(data, f, separators=(",", ":"))
        print(name, {k: len(v) for k, v in data.items() if k != "_types"})


def placed_groups():
    return list(ET.parse(f"{MISSION}/mapgrouppos.xml").getroot().iter("group"))


def scan_input():
    """Building list the server scan reads: index, class, x y z."""
    with open(f"{SCAN}/buildings_in.txt", "w") as f:
        for i, g in enumerate(placed_groups()):
            f.write(f'{i} {g.get("name")} {g.get("pos")}\n')


def buildings():
    usages = {g.get("name"): [u.get("name") for u in g.findall("usage")]
              for g in ET.parse(f"{MISSION}/mapgroupproto.xml").getroot().iter("group")}
    scan = {}
    for line in open(f"{SCAN}/buildings.txt"):
        p = line.split()
        if len(p) >= 9:
            scan[int(p[0])] = [float(v) for v in p[1:8]]  # yaw, x, z, minX, minZ, maxX, maxZ

    groups = placed_groups()
    boxes = defaultdict(list)
    for i, g in enumerate(groups):
        if i in scan:
            boxes[g.get("name")].append(scan[i][3:])
    types, index, out = [], {}, []
    for i, g in enumerate(groups):
        name = g.get("name")
        if name not in index:
            box = [round(statistics.median(b[k] for b in boxes[name]), 1) for k in range(4)] if boxes[name] \
                else [-4, -4, 4, 4]
            index[name] = len(types)
            types.append([name.removeprefix("Land_")] + box)
        if i in scan:
            yaw, x, z = scan[i][:3]
        else:
            x, _, z = (float(v) for v in g.get("pos").split())
            yaw = float(g.get("rpy").split()[2])
        mask = 0
        for u in usages.get(name) or ["Other"]:
            mask |= 1 << USAGES.index(u)
        out.append([round(x, 1), round(z, 1), round(yaw) % 360, index[name], mask])
    with open(f"{OUT}/buildings.json", "w") as f:
        json.dump({"usages": USAGES, "types": types, "b": out}, f, separators=(",", ":"))
    print("buildings", len(out), "from scan", len(scan), "classes", len(types))


def names():
    out = []
    for line in open(f"{SCAN}/names.txt", encoding="utf-8", errors="replace"):
        p = line.rstrip("\n").split("\t")
        if len(p) == 5:
            out.append([p[4], p[1], round(float(p[2])), round(float(p[3]))])
    with open(f"{OUT}/names.json", "w") as f:
        json.dump(out, f, separators=(",", ":"), ensure_ascii=False)
    print("names", len(out))


def events():
    root = ET.parse(f"{MISSION}/cfgeventspawns.xml").getroot()
    by_name = {e.get("name"): e for e in root.iter("event")}
    for out, names in (("vehicles", VEHICLES), ("events", EVENTS)):
        layer = Layer()
        for name in names:
            for p in by_name[name].iter("pos"):
                layer.add(name, p.get("x"), p.get("z"), p.get("group") or "")
        layer.save(out, names)


def spawns():
    fresh = ET.parse(f"{MISSION}/cfgplayerspawnpoints.xml").getroot().find("fresh")
    layer = Layer()
    for p in fresh.find("generator_posbubbles").iter("pos"):
        layer.add("FreshSpawn", p.get("x"), p.get("z"), "")
    layer.save("spawns")


if __name__ == "__main__":
    if sys.argv[1:] == ["scan-input"]:
        scan_input()
        sys.exit()
    os.makedirs(OUT, exist_ok=True)
    buildings()
    names()
    events()
    spawns()
