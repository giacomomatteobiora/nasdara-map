"""Loot-finder data (site/data/loot.json) from types.xml, mapgroupproto.xml, the event files and areaflags.map.

{"cats": [...], "tags": [...], "usages": [...], "values": [...],     (bit i of a mask = list entry i)
 "items": [[class, catIndex, nominal, usageMask, valueMask, tagMask, deloot, displayName, slots], ...],  (nominal > 0;
           slots = sum of sqrt(lootmax) over the containers in placed buildings that take the item, or for car parts
           the number of wreck dispatch slots listing it; 0 for deloot items)
 "protos": {"<buildings.json type index>": [groupLootmax, [[catMask, tagMask, points, lootmax, name], ...],
                                             [[itemIndex, dispatchSlots], ...]]},
 "bu": [usageMask per building], "bt": [valueMask per building],   (same order as buildings.json "b")
 "eprotos": [[usageMask, groupLootmax, conts], ...],                (loot groups of event objects)
 "events": [{"e": eventName, "w": spawn chance per position, "pick": "one"|"all",
             "pos": [[x, z, valueMask, areaUsageMask, [[eprotoIndex, avgLoot, delootOk], ...]], ...]}]}

Rules, checked against a real CE run (tools/lootdump_init.c + build/lootcheck.py, 24,960 items, 99% consistent):
- The economy places items, not points: an item below its nominal goes into a random container anywhere on the map
  that takes it, picked with weight sqrt(container lootmax) (that fit the real run best: per point overfills big
  buildings, uniform per container or per building underfills police/medical/military ones), capped by the container
  and group lootmax. The map has ~6x more points than items, so most stay empty.
- A container takes an item when it has the item's category, the item has no tags or the container has none or they
  share one, the building's usage overlaps the item's (no usage flags = anywhere, like vanilla soda cans) and the
  item's tiers (if any) include the zone.
- A building's usage is its proto group usage plus the areaflags usage at its position.
- Car parts (lootdispatch) only go to the <dispatch> proxies of the matching car wrecks.
- Items with deloot=1 only spawn at dynamic events.
Proto names are matched case-insensitively (mapgrouppos and mapgroupproto disagree on case for ~40 classes).
"""
import json
import os
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(__file__))
from build_data import EVENTS, MISSION, OUT, SCAN, placed_groups  # noqa: E402
from build_tiers import N, load_layers  # noqa: E402

CONVOY = "StaticMilitaryConvoy"  # children come from cfgeventgroups (per position group), all of them spawn


def names(root, path):
    return [e.get("name") for e in root.find(path)]


def item_names():
    """class -> display name from the server scan (itemnames.txt), if it ran."""
    out = {}
    try:
        for line in open(f"{SCAN}/itemnames.txt", encoding="utf-8", errors="replace"):
            p = line.rstrip("\n").split("\t")
            if len(p) == 2 and p[1] and not p[1].startswith("$STR"):
                out[p[0]] = p[1].strip()
    except FileNotFoundError:
        pass
    return out


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

    display = item_names()
    items = []
    for t in ET.parse(f"{MISSION}/db/types.xml").getroot():
        nominal = int(t.findtext("nominal") or 0)
        cat = t.find("category")
        if nominal <= 0 or cat is None or cat.get("name") not in cats:
            continue
        flags = t.find("flags")
        deloot = int(flags is not None and flags.get("deloot") == "1")
        items.append([t.get("name"), cats.index(cat.get("name")), nominal,
                      mask(t.findall("usage"), usages, groups["usageflags"]) or (1 << len(usages)) - 1,
                      mask(t.findall("value"), values, groups["valueflags"]),
                      mask(t.findall("tag"), tags), deloot, display.get(t.get("name"), "")])

    item_index = {it[0].lower(): k for k, it in enumerate(items)}
    proto = ET.parse(f"{MISSION}/mapgroupproto.xml").getroot()
    defaults = {d.get("name"): int(d.get("lootmax")) for d in proto.find("defaults")}
    group_usage, group_proto = {}, {}
    for g in proto.iter("group"):
        conts = []
        for c in g.findall("container"):
            cm = mask(c.findall("category"), cats)
            points = len(c.findall("point"))
            if cm and points:
                conts.append([cm, mask(c.findall("tag"), tags), points, int(c.get("lootmax", defaults["container"])),
                              c.get("name")])
        key = g.get("name").lower()
        group_usage[key] = mask(g.findall("usage"), usages)
        disp = g.find("dispatch")
        dispatch = {}
        for pr in (disp.findall("proxy") if disp is not None else []):
            k = pr.get("type").lower()
            if k in item_index:
                dispatch[item_index[k]] = dispatch.get(item_index[k], 0) + 1
        if conts or dispatch:
            group_proto[key] = [int(g.get("lootmax", defaults["group"])), conts, sorted(dispatch.items())]

    area_usage, area_value = load_layers()

    def cell(x, z):
        r, c = min(N - 1, max(0, int(z / 4))), min(N - 1, max(0, int(x / 4)))
        return int(area_value[r, c]), int(area_usage[r, c])

    btypes = [t[0].lower() for t in json.load(open(f"{OUT}/buildings.json"))["types"]]
    protos, bu, bt = {}, [], []
    for g in placed_groups():
        key = g.get("name").lower()
        x, _, z = (float(v) for v in g.get("pos").split())
        ti = btypes.index(key.removeprefix("land_"))
        if key in group_proto:
            protos[str(ti)] = group_proto[key]
        v, u = cell(x, z)
        bu.append(group_usage.get(key, 0) | u)
        bt.append(v)

    # containers each item can go into over the whole map, from the building signatures (container x usage x tier),
    # plus the wreck dispatch slots for car parts
    sigs, disp_slots = {}, {}
    for ti, u, v in zip((btypes.index(g.get("name").lower().removeprefix("land_")) for g in placed_groups()), bu, bt):
        pr = protos.get(str(ti))
        if not pr:
            continue
        for cm, tm, _, lm, _ in pr[1]:
            sigs[(cm, tm, u, v)] = sigs.get((cm, tm, u, v), 0) + lm ** 0.5
        for k, n in pr[2]:
            disp_slots[k] = disp_slots.get(k, 0) + n
    for k, it in enumerate(items):
        it.append(0 if it[6] else round(disp_slots.get(k, 0) + sum(
            n for (cm, tm, u, v), n in sigs.items()
            if (cm >> it[1]) & 1 and (not it[5] or not tm or it[5] & tm) and it[3] & u and (not it[4] or it[4] & v)), 2))
    nowhere = [it[0] for it in items if not it[6] and not it[8]]
    print(len(sigs), "building signatures;", len(nowhere), "items no building can take:", ", ".join(nowhere[:8]), "...")

    # ---- dynamic events ----
    eprotos, eindex = [], {}

    def eproto(cls):
        key = cls.lower()
        if key not in group_proto:
            return None
        if key not in eindex:
            eindex[key] = len(eprotos)
            eprotos.append([group_usage[key], *group_proto[key]])
        return eindex[key]

    evdefs = {e.get("name"): e for e in ET.parse(f"{MISSION}/db/events.xml").getroot()}
    spawns = {e.get("name"): e for e in ET.parse(f"{MISSION}/cfgeventspawns.xml").getroot().iter("event")}
    evgroups = {g.get("name"): g for g in ET.parse(f"{MISSION}/cfgeventgroups.xml").getroot()}
    events = []
    for name in EVENTS:
        ev, sp = evdefs[name], spawns[name]
        positions = sp.findall("pos")
        kids_default = []
        for c in ev.find("children"):
            i = eproto(c.get("type"))
            if i is not None and c.get("lootmax"):
                kids_default.append([i, (int(c.get("lootmin", 0)) + int(c.get("lootmax"))) / 2, 1])
        out = []
        for p in positions:
            x, z = float(p.get("x")), float(p.get("z"))
            kids = kids_default
            if name == CONVOY:
                kids = []
                for c in evgroups[p.get("group")].findall("child"):
                    i = eproto(c.get("type"))
                    if i is not None and c.get("lootmax"):
                        kids.append([i, (int(c.get("lootmin", 0)) + int(c.get("lootmax"))) / 2, int(c.get("deloot", "0") == "1")])
            if kids:
                v, u = cell(x, z)
                out.append([round(x), round(z), v, u, kids])
        if out:
            w = min(1.0, int(ev.findtext("nominal")) / len(positions))
            events.append({"e": name, "w": round(w, 4), "pick": "all" if name == CONVOY else "one", "pos": out})
        print(f"event {name}: {len(out)}/{len(positions)} positions with loot, chance {w:.2f}")

    with open(f"{OUT}/loot.json", "w") as f:
        json.dump({"cats": cats, "tags": tags, "usages": usages, "values": values, "items": items,
                   "protos": protos, "bu": bu, "bt": bt, "eprotos": eprotos, "events": events},
                  f, separators=(",", ":"), ensure_ascii=False)
    print("loot items", len(items), "named", sum(1 for i in items if i[7]), "protos", len(protos),
          "buildings", len(bu), "event protos", len(eprotos))


if __name__ == "__main__":
    main()
