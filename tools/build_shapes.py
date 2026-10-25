"""Real building outlines and loot points (site/data/shapes.json) from the server shape scan.

shapes.txt (tools/mapscan_init.c ScanShapes): per class "class x0 z0 step nx nz cx cy cz ground", then nz rows of
nx decimetre heights (model y * 10, "." = no hit, "u" prefix = underground, found only from below the terrain); row iz = model z0 + (iz + 0.5) * step, column ix = model
x0 + (ix + 0.5) * step; (cx, cy, cz) = model ce_center, ground = model y of the terrain under the origin.

shapes.json: {"<buildings.json type index>": {"p": [[[x, z], ...], ...],     outline loops (holes included, even-odd)
                                              "u": [[[x, z], ...], ...],     underground parts outside the outline
                                              "l": [[x, z, y, containerIndex], ...],   loot points (y above ground)
                                              "r": [ax, ay, w, h, x0, z0],   roof block in roofs.png + model corner
                                              "h": roofHeight, "d": depth (underground part, m), "a": area m²}}
All in the same model coordinates as the footprint boxes; containerIndex follows loot.json's proto containers.

roofs.png: RGBA atlas, 0.5 m per pixel, block rows in model z order (row 0 = z0). R * 256 + G = height above ground
in decimetres + 1000; A = 255 where the building was hit from above, 128 for underground parts (single-ray gaps filled).
"""
import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from build_data import MISSION, OUT, SCAN  # noqa: E402

SIMPLIFY = 0.35   # m, Douglas-Peucker tolerance
MIN_AREA = 1.5    # m², smaller blobs/holes are ray noise
ATLAS_W = 1024    # px
H_OFFSET = 1000   # dm, so underground parts stay positive in the atlas


def read_scan():
    out = {}
    with open(f"{SCAN}/shapes.txt") as f:
        lines = iter(f.read().split("\n"))
    for line in lines:
        p = line.split()
        if len(p) != 10:
            continue
        cls, (x0, z0, step), (nx, nz) = p[0], map(float, p[1:4]), map(int, p[4:6])
        cells = [next(lines).split()[:nx] for _ in range(nz)]
        h = np.array([[np.nan if c == "." else int(c.lstrip("u")) / 10 for c in r] for r in cells])
        under = np.array([[c.startswith("u") for c in r] for r in cells], bool)
        out[cls.lower()] = (x0, z0, step, h, under, tuple(map(float, p[6:9])), float(p[9]))
    return out


def close(grid):
    """Morphological closing (3x3) to fill single-ray gaps."""
    def shift_any(g, op):
        p = np.pad(g, 1)
        acc = p[1:-1, 1:-1].copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                s = p[1 + dy:p.shape[0] - 1 + dy, 1 + dx:p.shape[1] - 1 + dx]
                acc = op(acc, s)
        return acc
    return shift_any(shift_any(grid, np.logical_or), np.logical_and)


def loops(grid):
    """Boundary loops of the filled cells, as corner-index polygons (filled side on the left)."""
    nz, nx = grid.shape
    g = np.pad(grid, 1)
    nxt = defaultdict(list)
    for iz in range(nz):
        for ix in range(nx):
            if not g[iz + 1, ix + 1]:
                continue
            if not g[iz, ix + 1]:      # side at z = iz (below)
                nxt[(ix, iz)].append((ix + 1, iz))
            if not g[iz + 1, ix + 2]:  # side at x = ix + 1
                nxt[(ix + 1, iz)].append((ix + 1, iz + 1))
            if not g[iz + 2, ix + 1]:  # side at z = iz + 1
                nxt[(ix + 1, iz + 1)].append((ix, iz + 1))
            if not g[iz + 1, ix]:      # side at x = ix
                nxt[(ix, iz + 1)].append((ix, iz))
    out = []
    while nxt:
        start = next(iter(nxt))
        loop, cur, prev_dir = [start], start, None
        while True:
            options = nxt[cur]
            if len(options) > 1 and prev_dir:  # diagonal touch: keep turning left
                def turn(o):
                    d = (o[0] - cur[0], o[1] - cur[1])
                    return -(prev_dir[0] * d[1] - prev_dir[1] * d[0])
                options.sort(key=turn)
            nb = options.pop(0)
            if not options:
                del nxt[cur]
            prev_dir = (nb[0] - cur[0], nb[1] - cur[1])
            cur = nb
            if cur == start:
                break
            loop.append(cur)
        out.append(loop)
    return out


def fill_gaps(h, mask):
    """Heights for cells the closing added: the highest neighbour, repeated until every masked cell has one."""
    h = h.copy()
    for _ in range(4):
        todo = mask & np.isnan(h)
        if not todo.any():
            break
        p = np.pad(h, 1, constant_values=np.nan)
        nb = np.stack([p[1 + dy:p.shape[0] - 1 + dy, 1 + dx:p.shape[1] - 1 + dx]
                       for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx])
        with np.errstate(all="ignore"):
            best = np.nanmax(np.where(np.isnan(nb), -np.inf, nb), axis=0)
        h[todo & np.isfinite(best)] = best[todo & np.isfinite(best)]
    h[~mask] = np.nan
    return h


def pack(blocks):
    """Shelf packing of (key, w, h) blocks into ATLAS_W wide rows; returns {key: (x, y)} and the atlas height."""
    pos, x, y, shelf = {}, 0, 0, 0
    for key, w, h in sorted(blocks, key=lambda b: -b[2]):
        if x + w > ATLAS_W:
            x, y, shelf = 0, y + shelf + 1, 0
        pos[key] = (x, y)
        x += w + 1
        shelf = max(shelf, h)
    return pos, y + shelf


def area(poly):
    return 0.5 * sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(poly, poly[1:] + poly[:1]))


def dp(points, tol):
    """Douglas-Peucker on an open polyline."""
    if len(points) < 3:
        return points
    a, b = np.array(points[0]), np.array(points[-1])
    ab = b - a
    n = np.hypot(*ab)
    pts = np.array(points[1:-1])
    d = np.abs(ab[0] * (pts[:, 1] - a[1]) - ab[1] * (pts[:, 0] - a[0])) / n if n else np.hypot(*(pts - a).T)
    i = int(d.argmax())
    if d[i] <= tol:
        return [points[0], points[-1]]
    return dp(points[:i + 2], tol)[:-1] + dp(points[i + 1:], tol)


def simplify(loop, tol):
    # split the closed loop at its two most distant points, simplify both halves
    far = max(range(len(loop)), key=lambda i: (loop[i][0] - loop[0][0]) ** 2 + (loop[i][1] - loop[0][1]) ** 2)
    a = dp(loop[:far + 1], tol)
    b = dp(loop[far:] + [loop[0]], tol)
    return a[:-1] + b[:-1]


def main():
    scan = read_scan()
    btypes = [t[0].lower() for t in json.load(open(f"{OUT}/buildings.json"))["types"]]
    protos = {g.get("name").lower(): g for g in ET.parse(f"{MISSION}/mapgroupproto.xml").getroot().iter("group")}
    out, boxes_only, roofs = {}, 0, {}
    for ti, short in enumerate(btypes):
        cls = next((k for k in (f"land_{short}", short) if k in scan), None)
        entry = {}
        if cls:
            x0, z0, step, heights, under, centre, ground = scan[cls]
            grid = ~np.isnan(heights)
            closed = close(grid)
            # the outline is what stands above the terrain; underground rooms (bunkers, basements) are kept apart
            above = close(grid & ~under)
            if not above.any():
                above = closed
            below = closed & ~above
            if closed.any():
                # roof block, cropped to the building; heights relative to the ground under the origin
                rows, cols = np.nonzero(closed)
                r0, r1, c0, c1 = rows.min(), rows.max() + 1, cols.min(), cols.max() + 1
                rel = fill_gaps(heights, closed)[r0:r1, c0:c1] - ground
                roofs[ti] = (rel, below[r0:r1, c0:c1], round(x0 + c0 * step, 2), round(z0 + r0 * step, 2))
                top = rel[above[r0:r1, c0:c1] & np.isfinite(rel)]
                entry["h"] = round(float(np.percentile(top, 98)), 1) if top.size else 0
                low = rel[below[r0:r1, c0:c1] & np.isfinite(rel)]
                if low.size and low.min() < -1:
                    entry["d"] = round(float(-low.min()), 1)
                upolys = []
                for lp in loops(below):
                    metres = [(round(x0 + ix * step, 2), round(z0 + iz * step, 2)) for ix, iz in lp]
                    if abs(area(metres)) >= 4:
                        u = simplify(metres, SIMPLIFY)
                        if len(u) >= 3:
                            upolys.append([[round(x, 1), round(z, 1)] for x, z in u])
                if upolys:
                    entry["u"] = upolys
            polys = []
            for lp in loops(above):
                metres = [(round(x0 + ix * step, 2), round(z0 + iz * step, 2)) for ix, iz in lp]
                if abs(area(metres)) < MIN_AREA:
                    continue
                s = simplify(metres, SIMPLIFY)
                if len(s) >= 3:
                    polys.append([[round(x, 1), round(z, 1)] for x, z in s])
            if polys:
                entry["p"] = polys
                entry["a"] = round(abs(sum(area(p) for p in polys)))
            else:
                boxes_only += 1
            g = protos.get(cls)
            if g is None:
                g = protos.get(short)
            if g is not None:
                pts, ci = [], 0
                for c in g.findall("container"):
                    cpts = c.findall("point")
                    if not (c.findall("category") and cpts):
                        continue
                    for p in cpts:
                        px, py, pz = map(float, p.get("pos").split())
                        # proto points are stored rotated 90 degrees from model space: model (x, z) = (-pz, px)
                        # (checked over all classes: 86% land inside the outline this way, the best of all 8 axis mappings)
                        pts.append([round(centre[0] - pz, 1), round(centre[2] + px, 1),
                                    round(centre[1] + py - ground, 1), ci])
                    ci += 1
                if pts:
                    entry["l"] = pts
        if entry:
            out[str(ti)] = entry
    pos, atlas_h = pack([(ti, r[0].shape[1], r[0].shape[0]) for ti, r in roofs.items()])
    atlas = np.zeros((atlas_h, ATLAS_W, 4), np.uint8)
    for ti, (rel, below, bx, bz) in roofs.items():
        ax, ay = pos[ti]
        h, w = rel.shape
        hit = np.where(below, 128, 255) * np.isfinite(rel)
        dm = np.clip(np.round(np.nan_to_num(rel) * 10) + H_OFFSET, 0, 65535).astype(np.uint16)
        block = atlas[ay:ay + h, ax:ax + w]
        block[..., 0] = dm >> 8
        block[..., 1] = dm & 255
        block[..., 3] = hit
        out[str(ti)]["r"] = [ax, ay, w, h, bx, bz]
    Image.fromarray(atlas, "RGBA").save(f"{OUT}/roofs.png", optimize=True)
    print(f"roofs.png {ATLAS_W}x{atlas_h}, {len(roofs)} blocks")
    with open(f"{OUT}/shapes.json", "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print("shapes", sum(1 for e in out.values() if "p" in e), "classes with outlines,", boxes_only, "empty;",
          sum(len(e.get("l", [])) for e in out.values()), "loot points")


if __name__ == "__main__":
    main()
