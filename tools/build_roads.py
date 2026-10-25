"""Road network (site/data/roads.json) traced from the in-game paper map.

The server can't see Nasdara's roads (they sit flush with the terrain, so SurfaceRoadY / SurfaceGetType3D only report
terrain surfaces and field walls), and the roads shapefile is inside the encrypted worlds_nasdara.ebo. The paper map
(map_unfolded_nasdara_co.paa, 4096 px = 16384 m, 4 m/px) draws every road in saturated brown: main roads as a
cased band 3-7 px wide, tracks as a 1 px olive line. Contours (pale), the grid (grey) and labels (black) have low
saturation or are too light, so a colour threshold gives the road mask; it is thinned to a skeleton, traced into
polylines and classified by the band width under the skeleton.

roads.json: {"lines": [{"k": "main"|"road"|"track", "p": [[x, z], ...]}]}  (same shape as powerlines.json)
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import remove_small_objects, skeletonize

sys.path.insert(0, os.path.dirname(__file__))
import paa  # noqa: E402
import pbo  # noqa: E402
from build_shapes import dp  # noqa: E402
from build_tiles import DATA_PBO, WORLD  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "site", "data")
CHECK = os.path.join(os.path.dirname(__file__), "..", "build", "check_roads.png")
MAX_VALUE, MIN_SAT = 172, 0.40   # ink: darker and more saturated than paper, contours and grid
MIN_SAT_STRICT, MIN_CONTRAST = 0.45, 40   # road ink vs contours on the darker paper near the edges
BORDER = 15                      # px of paper frame ignored on every side
SPUR = 7                         # px; dangling skeleton branches shorter than this are thinning barbs
MIN_LEN = 5                      # px; bits shorter than this are label/ink noise
MIN_ISOLATED = 10                # px; a piece connected to nothing must be at least this long
SIMPLIFY = 0.45                  # px (~1.8 m), Douglas-Peucker tolerance
# band half-width (px, distance transform at the skeleton) -> class
CLASSES = [(2.2, "main"), (1.6, "road"), (0, "track")]

NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def road_mask(img):
    a = np.asarray(img).astype(np.int16)
    mx, mn = a.max(2), a.min(2)
    sat = (mx - mn) / np.maximum(mx, 1)
    ink = (mx < MAX_VALUE) & (sat > MIN_SAT)
    # local paper brightness from the surrounding non-ink pixels (the paper darkens towards the map edges, where
    # contours would otherwise pass): road ink is clearly darker than its paper, contours only a little
    paper = (~ink).astype(np.float32)
    bg = ndimage.uniform_filter(mx * paper, 25) / np.maximum(ndimage.uniform_filter(paper, 25), 1e-3)
    m = ink & (sat > MIN_SAT_STRICT) & (mx < bg - MIN_CONTRAST)
    m &= ~ndimage.binary_dilation(mx < 75, iterations=2)  # anti-aliased edges of the black labels
    m = ndimage.binary_closing(m, np.ones((3, 3), bool))  # bridge grid-line crossings and the light road centres
    m[:BORDER] = m[-BORDER:] = False  # the paper's frame
    m[:, :BORDER] = m[:, -BORDER:] = False
    return remove_small_objects(m, max_size=12)


def trace(skel):
    """Skeleton -> list of pixel paths between junctions/ends (each path is a list of (row, col))."""
    pts = set(zip(*np.nonzero(skel)))
    nbrs = {p: [(p[0] + dy, p[1] + dx) for dy, dx in NB if (p[0] + dy, p[1] + dx) in pts] for p in pts}
    nodes = {p for p, n in nbrs.items() if len(n) != 2}
    seen, paths = set(), []

    def walk(start, nxt):
        path, prev, cur = [start], start, nxt
        while True:
            seen.add(frozenset((prev, cur)))
            path.append(cur)
            if cur in nodes:
                return path
            cand = [n for n in nbrs[cur] if n != prev and frozenset((cur, n)) not in seen]
            if not cand:
                return path
            prev, cur = cur, cand[0]

    for n in nodes:
        for m in nbrs[n]:
            if frozenset((n, m)) not in seen:
                paths.append(walk(n, m))
    # closed loops without any junction (roundabouts, ring roads)
    for p in pts - nodes:
        if p in nbrs and nbrs[p] and frozenset((p, nbrs[p][0])) not in seen:
            path = walk(p, nbrs[p][0])
            if len(path) > 2:
                paths.append(path)
    return paths, nbrs


def length(path):
    return sum(np.hypot(a[0] - b[0], a[1] - b[1]) for a, b in zip(path, path[1:]))


def chaikin(p):
    if len(p) < 3:
        return p
    out = [p[0]]
    for a, b in zip(p, p[1:]):
        out += [(0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]), (0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1])]
    out.append(p[-1])
    return out


def main():
    files = {e[0].lower(): e[6] for e in pbo.read(DATA_PBO)[1]}
    img = paa.decode(files["map_unfolded_nasdara_co.paa"]).convert("RGB")
    px_m = WORLD / img.width
    mask = road_mask(img)
    half = ndimage.distance_transform_edt(mask)
    skel = skeletonize(mask)
    paths, nbrs = trace(skel)
    degree = {p: len(n) for p, n in nbrs.items()}
    lines, km = [], defaultdict(float)
    for path in paths:
        ends = [degree[path[0]], degree[path[-1]]]
        n = length(path)
        if n < MIN_LEN or (min(ends) == 1 and max(ends) > 2 and n < SPUR) or (max(ends) <= 1 and n < MIN_ISOLATED):
            continue
        w = float(np.median([half[r, c] for r, c in path]))
        kind = next(k for t, k in CLASSES if w >= t)
        simple = dp([(float(c), float(r)) for r, c in path], SIMPLIFY)
        smooth = chaikin(simple) if len(simple) > 2 else simple
        p = [[round((x + 0.5) * px_m), round(WORLD - (y + 0.5) * px_m)] for x, y in smooth]  # 4 m/px source
        lines.append({"k": kind, "p": p})
        km[kind] += n * px_m / 1000
    with open(f"{OUT}/roads.json", "w") as f:
        json.dump({"lines": lines}, f, separators=(",", ":"))
    # check image: mask grey, classified skeleton coloured (1/4 of the map around Nasdara city)
    chk = np.zeros(mask.shape + (3,), np.uint8)
    chk[mask] = (70, 70, 70)
    col = {"main": (255, 80, 40), "road": (255, 220, 0), "track": (80, 200, 255)}
    for ln in lines:
        for x, z in ln["p"]:
            chk[min(mask.shape[0] - 1, int((WORLD - z) / px_m)), min(mask.shape[1] - 1, int(x / px_m))] = col[ln["k"]]
    Image.fromarray(chk[2600:3800, 1800:3000]).save(CHECK)
    print("roads", len(lines), "lines,", sum(len(l["p"]) for l in lines), "points,",
          ", ".join(f"{k} {v:.0f} km" for k, v in km.items()))


if __name__ == "__main__":
    main()
