"""Build the map's marker layers (site/data/*.json) from the Nasdara server mission files.

vehicles/events/spawns.json: {"<sub-type>": [[x, z, typeIndex], ...], ..., "_types": [names]}
buildings.json: {"usages": [...], "types": [[class, minX, minZ, maxX, maxZ], ...],
                 "b": [[x, z, yawDeg, typeIndex, usageBitmask], ...]}  (one entry per building)
names.json: [[name, type, x, z], ...]
powerlines.json: {"lines": [{"k": "vhv"|"hv", "p": [[x, z], ...]}], "poles": [[x, z, kind], ...]}

Building footprints, yaw and place names come from the one-off server scan (tools/mapscan_init.c):
run `build_data.py scan-input` first, then the scan, then `build_data.py`.
"""
import json
import math
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


# power models from the scan -> line kind and max span (m); towers are drawn as poles, wire spans only as lines
POWER = {
    "power_vhv_tower_noproxy": ("vhv", 420, True), "power_vhv_tower_dam": ("vhv", 420, True),
    "power_vhv_end": ("vhv", 420, True),
    "power_hv3_tower1": ("hv", 90, True), "power_hv3_tower2": ("hv", 90, True), "power_hv3_tower2_dam": ("hv", 90, True),
    # wire spans hang between the hv3 towers (a span centre sits ~25 m from each tower): same network
    "power_wire_50": ("hv", 90, False), "power_wire_50_main": ("hv", 90, False),
    "power_wiretel_50_main": ("hv", 90, False), "power_pole_wood6_h": ("hv", 90, True),
}


def polylines(edges):
    """Join undirected edges into node chains, breaking at junctions (degree != 2)."""
    adj = defaultdict(set)
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    seen, chains = set(), []

    def walk(start, nxt):
        chain = [start, nxt]
        seen.add((min(start, nxt), max(start, nxt)))
        while len(adj[nxt]) == 2:
            following = next(n for n in adj[nxt] if n != chain[-2])
            e = (min(nxt, following), max(nxt, following))
            if e in seen:
                break
            seen.add(e)
            chain.append(following)
            nxt = following
        return chain

    for n in sorted(adj, key=lambda n: len(adj[n]) == 2):  # start at ends/junctions, loops last
        for m in adj[n]:
            if (min(n, m), max(n, m)) not in seen:
                chains.append(walk(n, m))
    return chains


def powerlines():
    """Chain towers / wire spans into lines: each support links to its nearest neighbour ahead and behind
    along its own yaw (lines bend gently, so allow 30 degrees), within the kind's max span."""
    pts = {}
    for line in open(f"{SCAN}/powerlines.txt"):
        p = line.split()
        if len(p) != 5:
            continue
        model = p[0].rsplit("\\", 1)[-1].removesuffix(".p3d")
        if model in POWER:
            pts.setdefault(POWER[model][0], []).append((float(p[1]), float(p[3]), float(p[4]), model))
    # the parallel wires of one span (and stacked copies) sit within a few metres: keep one per span
    for kind, raw in pts.items():
        kept, grid = [], defaultdict(list)
        for n in raw:
            key = (int(n[0] // 6), int(n[1] // 6))
            near = [grid[(key[0] + a, key[1] + b)] for a in (-1, 0, 1) for b in (-1, 0, 1)]
            if not any(math.hypot(m[0] - n[0], m[1] - n[1]) < 6 for cellpts in near for m in cellpts):
                grid[key].append(n)
                kept.append(n)
        pts[kind] = kept
    out, poles = [], []
    for kind in ("vhv", "hv"):
        nodes = pts.get(kind, [])
        span = max(POWER[n[3]][1] for n in nodes)
        cell = defaultdict(list)
        for i, (x, z, _, _) in enumerate(nodes):
            cell[(int(x // span), int(z // span))].append(i)
        edges = set()
        for i, (x, z, yaw, model) in enumerate(nodes):
            if POWER[model][2]:
                poles.append([round(x), round(z), kind])
            fx, fz = math.sin(math.radians(yaw)), math.cos(math.radians(yaw))
            best = {1: None, -1: None}
            for cx in range(int(x // span) - 1, int(x // span) + 2):
                for cz in range(int(z // span) - 1, int(z // span) + 2):
                    for j in cell[(cx, cz)]:
                        dx, dz = nodes[j][0] - x, nodes[j][1] - z
                        d = math.hypot(dx, dz)
                        if j == i or d < 5 or d > span:
                            continue
                        along = (dx * fx + dz * fz) / d
                        if abs(along) < math.cos(math.radians(30)):
                            continue
                        side = 1 if along > 0 else -1
                        if best[side] is None or d < best[side][0]:
                            best[side] = (d, j)
            for b in best.values():
                if b:
                    edges.add((min(i, b[1]), max(i, b[1])))
        chains = polylines(edges)
        out += [{"k": kind, "p": [[round(nodes[i][0]), round(nodes[i][1])] for i in c]} for c in chains]
        print("powerlines", kind, len(nodes), "supports/spans,", len(edges), "links,", len(chains), "lines")
    with open(f"{OUT}/powerlines.json", "w") as f:
        json.dump({"lines": out, "poles": poles}, f, separators=(",", ":"))


if __name__ == "__main__":
    if sys.argv[1:] == ["scan-input"]:
        scan_input()
        sys.exit()
    os.makedirs(OUT, exist_ok=True)
    buildings()
    names()
    events()
    spawns()
    powerlines()
