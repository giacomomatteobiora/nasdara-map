"""Render the topographic terrain map (site/tiles/terrain/...) from the server height scan.

Input: heights.txt written by tools/mapscan_init.c on the local server (4096 x 4096 samples, 4 m apart,
rows north -> south, value = round(height_m * 10) * 2 + water bit).
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from build_tiles import WORLD, cut_pyramid  # noqa: E402

SCAN = os.path.expanduser("~/DayZ-Badlands-1.30/DayZServer/profiles-mapscan")
SIZE = 8192                       # output px (2 m/px) -> terrain zooms 0..5
PX = WORLD / SIZE

# hypsometric tint: (fraction of land height range, colour); mixed with blurred satellite ground colour
STOPS = [
    (0.00, (196, 186, 150)), (0.25, (184, 168, 124)), (0.45, (170, 140, 100)),
    (0.65, (146, 116, 88)), (0.82, (138, 130, 122)), (1.00, (236, 232, 226)),
]
GROUND_MIX = 0.55
WATER = np.array([74, 140, 196], np.float32)
CONTOUR_MINOR, CONTOUR_MAJOR = 10, 50
CONTOUR_COLOUR = np.array([70, 48, 30], np.float32)
GRID_COLOUR = np.array([255, 255, 255], np.float32)


def load_heights():
    with open(f"{SCAN}/heights.txt") as f:
        header = f.readline().split()
        n = int(header[3])
        rows = [np.array(f.readline().split()[:n], np.int32) for _ in range(n)]
    v = np.stack(rows)
    return (v >> 1).astype(np.float32) / 10, (v & 1).astype(np.float32)


def resize(a, mode=Image.BILINEAR):
    return np.asarray(Image.fromarray(a, "F").resize((SIZE, SIZE), mode))


def hillshade(gx, gy):
    gx, gy = gx * 1.6, gy * 1.6  # exaggerate relief
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gy, gx)
    alt = np.radians(45)
    out = np.zeros_like(gx)
    for az, w in ((315, 0.45), (270, 0.2), (0, 0.2), (225, 0.15)):
        a = np.radians(90 - az)
        out += w * (np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(a - aspect))
    return np.clip(out, 0, 1)


def tint(h, land):
    lo, hi = np.percentile(h[land], [0.5, 99.8])
    t = np.clip((h - lo) / (hi - lo), 0, 1)
    xs = [s for s, _ in STOPS]
    return np.stack([np.interp(t, xs, [c[i] for _, c in STOPS]).astype(np.float32) for i in range(3)], -1)


def contour_alpha(h, slope_px, step, width):
    """Anti-aliased contour lines: distance (px) to the nearest multiple of step, from the local slope."""
    d = np.abs(h - np.round(h / step) * step) / np.maximum(slope_px, 1e-3)
    flat_fade = np.clip(slope_px / 0.04, 0, 1)  # no blobs on flattened ground that sits exactly on a level
    return np.clip(width / 2 + 0.5 - d, 0, 1) * flat_fade


def ground_colour():
    """Blurred satellite colour (from the z2 tiles, 16 m/px) so sand, rock and fields keep their real tone."""
    tiles = os.path.join(os.path.dirname(__file__), "..", "site", "tiles", "sat", "2")
    sat = Image.new("RGB", (1024, 1024))
    for x in range(4):
        for y in range(4):
            sat.paste(Image.open(f"{tiles}/{x}/{y}.jpg"), (x * 256, y * 256))
    sat = sat.resize((256, 256), Image.LANCZOS).resize((SIZE, SIZE), Image.BICUBIC)
    g = np.asarray(sat, np.float32)
    grey = g.mean(-1, keepdims=True)
    return np.clip(grey + (g - grey) * 1.35, 0, 255) * 1.12  # a bit more saturated and lighter


def blend(img, mask, colour, alpha):
    a = (np.asarray(mask, np.float32) * alpha)[..., None]
    img *= 1 - a
    img += a * colour


def main():
    h4, w4 = load_heights()
    print(f"heights {h4.min():.1f}..{h4.max():.1f} m, water cells {int(w4.sum())}")
    h = resize(h4)
    water = resize(w4) > 0.5
    del h4, w4

    img = tint(h, ~water) * (1 - GROUND_MIX) + ground_colour() * GROUND_MIX
    gy, gx = np.gradient(h, PX)  # rows go south, so gy is -dz/dnorth
    img *= (0.45 + 0.75 * hillshade(gx, gy))[..., None]
    slope_px = np.hypot(gx, gy) * PX  # metres of height per pixel
    del gx, gy
    blend(img, water, WATER, 0.85)

    land = ~water
    blend(img, contour_alpha(h, slope_px, CONTOUR_MINOR, 1.0) * land, CONTOUR_COLOUR, 0.3)
    blend(img, contour_alpha(h, slope_px, CONTOUR_MAJOR, 1.8) * land, CONTOUR_COLOUR, 0.6)
    del h, slope_px

    grid = np.zeros((SIZE, SIZE), bool)
    step = int(1000 / PX)
    grid[::step, :] = grid[:, ::step] = True
    blend(img, grid, GRID_COLOUR, 0.35)

    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    del img
    out.resize((1024, 1024), Image.LANCZOS).save(os.path.join(os.path.dirname(__file__), "..", "build", "check_terrain.png"))
    cut_pyramid(out, "terrain", 88)


if __name__ == "__main__":
    main()
