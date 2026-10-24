"""Build the map's marker layers (site/data/*.json) from the Nasdara server mission files.

Each output file is {"<sub-type>": [[x, z, typeIndex], ...], ..., "_types": [class names]}
with x/z in world metres (rounded) and typeIndex pointing into "_types".
"""
import json
import os
import xml.etree.ElementTree as ET
from collections import defaultdict

MISSION = os.path.expanduser("~/DayZ-Badlands-1.30/DayZServer/mpmissions/dayzOffline.nasdara")
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "data")

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


def buildings():
    usages = {g.get("name"): [u.get("name") for u in g.findall("usage")]
              for g in ET.parse(f"{MISSION}/mapgroupproto.xml").getroot().iter("group")}
    layer = Layer()
    for g in ET.parse(f"{MISSION}/mapgrouppos.xml").getroot().iter("group"):
        name = g.get("name")
        x, _, z = g.get("pos").split()
        for usage in usages.get(name) or ["Other"]:
            layer.add(usage, x, z, name.removeprefix("Land_"))
    layer.save("buildings")


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
    os.makedirs(OUT, exist_ok=True)
    buildings()
    events()
    spawns()
