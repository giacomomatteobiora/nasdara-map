"""Tier-zone overlays (site/tiles/tiers/<tier>.png) from the mission's areaflags.map.

areaflags.map: 6 x u32 header (4096, 4096, 16384, 16384, 32, 0), then a u32 usage layer and a u8 value layer,
both 4096 x 4096 cells of 4 m, row 0 = south. Value bits follow cfglimitsdefinition: Tier1..Tier4, Unique.
"""
import os

import numpy as np
from PIL import Image, ImageFilter

MISSION = os.path.expanduser("~/DayZ-Badlands-1.30/DayZServer/mpmissions/dayzOffline.nasdara")
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "tiles", "tiers")
N = 4096
VALUES = ["Tier1", "Tier2", "Tier3", "Tier4", "Unique"]
COLOURS = {"Tier1": (76, 175, 80), "Tier2": (255, 214, 0), "Tier3": (255, 128, 0), "Tier4": (229, 57, 53),
           "Unique": (171, 71, 188)}
SIZE = 2048  # 8 m/px


def load_layers():
    d = np.fromfile(f"{MISSION}/areaflags.map", np.uint8, offset=24)
    usage = d[:4 * N * N].view("<u4").reshape(N, N)
    value = d[4 * N * N:].reshape(N, N)
    return usage, value


def main():
    _, value = load_layers()
    value = value[::-1]  # north on top
    os.makedirs(OUT, exist_ok=True)
    for bit, name in enumerate(VALUES):
        m = ((value >> bit) & 1).astype(np.uint8) * 255
        if np.count_nonzero(m) < 100:
            print(name, "not used")
            continue
        mask = Image.fromarray(m).resize((SIZE, SIZE), Image.BOX).point(lambda v: 255 if v >= 128 else 0)
        edge = np.asarray(mask.filter(ImageFilter.MaxFilter(3)), np.int16) - np.asarray(mask.filter(ImageFilter.MinFilter(3)), np.int16)
        a = np.where(edge > 0, 230, np.where(np.asarray(mask) > 0, 90, 0)).astype(np.uint8)
        rgb = np.array(COLOURS[name], np.float32)
        img = np.empty((SIZE, SIZE, 4), np.uint8)
        img[..., :3] = np.where((edge > 0)[..., None], rgb * 0.7, rgb).astype(np.uint8)
        img[..., 3] = a
        Image.fromarray(img, "RGBA").save(f"{OUT}/{name}.png", optimize=True)
        print(name, f"{(m > 0).mean() * 100:.1f}% of map")


if __name__ == "__main__":
    main()
