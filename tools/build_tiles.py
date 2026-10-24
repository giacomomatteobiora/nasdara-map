"""Build Leaflet tile pyramids (site/tiles/{sat,paper}/{z}/{x}/{y}.jpg) from the game's Nasdara textures.

Run with DayZ and the local server closed: the satellite canvas needs ~1.7 GB RAM.
"""
import os
import sys
import time

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import paa  # noqa: E402
import pbo  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
GAME = os.path.expanduser("~/.var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps/common/DayZ")
DATA_PBO = f"{GAME}/nasdara/addons/worlds_nasdara_data.pbo"
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "tiles")

WORLD = 16384     # metres; satellite is 1 px = 1 m
SAT_TILES = 43    # S_000_000 .. S_042_042, first index = column, second = row (row 0 = north)
SAT_SIZE = 512
SAT_STEP = 384    # neighbouring tiles overlap by 128 px (exact pixel match)
SAT_PAD = 64      # stretched-edge padding before the real map starts


def stitch_satellite(files):
    canvas = np.zeros((SAT_TILES * SAT_STEP + SAT_SIZE - SAT_STEP,) * 2 + (3,), np.uint8)
    for x in range(SAT_TILES):
        for y in range(SAT_TILES):
            tile = paa.decode(files[rf"layers\s_{x:03d}_{y:03d}_lco.paa"])
            canvas[y * SAT_STEP:y * SAT_STEP + SAT_SIZE, x * SAT_STEP:x * SAT_STEP + SAT_SIZE] = np.asarray(tile)
    return Image.fromarray(canvas[SAT_PAD:SAT_PAD + WORLD, SAT_PAD:SAT_PAD + WORLD])


def cut_pyramid(img, name, quality):
    """img must be 256 * 2^maxzoom px square; writes zooms maxzoom..0."""
    zoom = (img.width // 256).bit_length() - 1
    while zoom >= 0:
        n = img.width // 256
        for tx in range(n):
            d = f"{OUT}/{name}/{zoom}/{tx}"
            os.makedirs(d, exist_ok=True)
            for ty in range(n):
                img.crop((tx * 256, ty * 256, tx * 256 + 256, ty * 256 + 256)).save(f"{d}/{ty}.jpg", quality=quality)
        print(f"  {name} z{zoom}: {n * n} tiles")
        if zoom:
            img = img.reduce(2)
        zoom -= 1


def main():
    t = time.time()
    files = {e[0].lower(): e[6] for e in pbo.read(DATA_PBO)[1]}
    print("paper map")
    cut_pyramid(paa.decode(files["map_unfolded_nasdara_co.paa"]), "paper", 85)
    print("satellite")
    cut_pyramid(stitch_satellite(files), "sat", 80)
    print(f"done in {time.time() - t:.0f}s")


if __name__ == "__main__":
    main()
