"""Loot-finder data (site/data/loot.json) from types.xml, mapgroupproto.xml and areaflags.map.

{"cats": [...], "tags": [...], "usages": [...], "values": [...],     (bit i of a mask = list entry i)
 "items": [[class, catIndex, nominal, usageMask, valueMask, tagMask], ...],   (nominal > 0 only)
 "protos": {"<buildings.json type index>": [groupLootmax, [[catMask, tagMask, points, lootmax], ...]]},
 "bu": [usageMask per building], "bt": [valueMask per building]}   (same order as buildings.json "b")

A building's usage is its proto group usage, or the areaflags usage at its position when the group has none.
"""
import json
import os
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(__file__))
from build_data import MISSION, OUT, placed_groups  # noqa: E402
from build_tiers import N, load_layers  # noqa: E402


def names(root, path):
    return [e.get("name") for e in root.find(path)]


def main():
    limits = ET.parse(f"{MISSION}/cfglimitsdefinition.xml").getroot()
    cats, tags = names(limits, "categories"), names(limits, "tags")
    usages, values = names(limits, "usageflags"), names(limits, "valueflags")
    user = ET.parse(f"{MISSION}/cfglimitsdefinitionuser.xml").getroot()
    groups = {kind: {u.get("name"): [x.get("name") for x in u] for u in user.find(kind)}
              for kind in ("usageflags", "valueflags")}

    def mask(elems, names_, user_groups=None):
        m = 0
        for e in elems:
            n = e.get("name") or e.get("user")
            for real in (user_groups or {}).get(n, [n]):
                if real in names_:
                    m |= 1 << names_.index(real)
        return m

    items = []
    for t in ET.parse(f"{MISSION}/db/types.xml").getroot():
        nominal = int(t.findtext("nominal") or 0)
        cat = t.find("category")
        if nominal <= 0 or cat is None or cat.get("name") not in cats:
            continue
        items.append([t.get("name"), cats.index(cat.get("name")), nominal,
                      mask(t.findall("usage"), usages, groups["usageflags"]),
                      mask(t.findall("value"), values, groups["valueflags"]),
                      mask(t.findall("tag"), tags)])

    proto = ET.parse(f"{MISSION}/mapgroupproto.xml").getroot()
    defaults = {d.get("name"): int(d.get("lootmax")) for d in proto.find("defaults")}
    group_usage, group_proto = {}, {}
    for g in proto.iter("group"):
        conts = []
        for c in g.findall("container"):
            cm = mask(c.findall("category"), cats)
            points = len(c.findall("point"))
            if cm and points:
                conts.append([cm, mask(c.findall("tag"), tags), points, int(c.get("lootmax", defaults["container"]))])
        group_usage[g.get("name")] = mask(g.findall("usage"), usages)
        if conts:
            group_proto[g.get("name")] = [int(g.get("lootmax", defaults["group"])), conts]

    area_usage, area_value = load_layers()
    btypes = [t[0] for t in json.load(open(f"{OUT}/buildings.json"))["types"]]
    protos, bu, bt = {}, [], []
    for g in placed_groups():
        name = g.get("name")
        x, _, z = (float(v) for v in g.get("pos").split())
        r, c = min(N - 1, max(0, int(z / 4))), min(N - 1, max(0, int(x / 4)))
        ti = btypes.index(name.removeprefix("Land_"))
        if name in group_proto:
            protos[str(ti)] = group_proto[name]
        bu.append(group_usage.get(name) or int(area_usage[r, c]))
        bt.append(int(area_value[r, c]))

    with open(f"{OUT}/loot.json", "w") as f:
        json.dump({"cats": cats, "tags": tags, "usages": usages, "values": values, "items": items,
                   "protos": protos, "bu": bu, "bt": bt}, f, separators=(",", ":"))
    print("loot items", len(items), "protos", len(protos), "buildings", len(bu))


if __name__ == "__main__":
    main()
