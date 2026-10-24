# Nasdara map

Fan-made interactive map of DayZ's Nasdara: satellite, paper and topographic terrain backgrounds; loot buildings drawn as their real rotated footprints with loot-type symbols; vehicle spawns, events, fresh player spawns and place names.

Static site in `site/` (Leaflet, no build step), hosted on GitHub Pages.

## Rebuilding

Needs DayZ (with Nasdara) installed and a copy of the Nasdara server mission (`dayzOffline.nasdara`). Paths are set at the top of each script.

```sh
python3 -m venv .venv && .venv/bin/pip install Pillow numpy
.venv/bin/python tools/build_tiles.py   # site/tiles/sat + paper  (~25 s, ~1.7 GB RAM)

# one-off scan on a local DayZ server (heights, building footprints/rotation, place names):
.venv/bin/python tools/build_data.py scan-input
#   copy dayzOffline.nasdara to mpmissions/mapscan.nasdara, replace main() with tools/mapscan_init.c,
#   run ./DayZServer -config=<cfg with template="mapscan.nasdara"> -profiles=profiles-mapscan -dologs
#   (no -freezecheck); it exits by itself after ~1 min.

.venv/bin/python tools/build_terrain.py # site/tiles/terrain  (~20 s)
.venv/bin/python tools/build_data.py    # site/data/
python3 -m http.server -d site 8000     # preview at http://localhost:8000
```

- `tools/paa.py`: decodes .paa textures (DXT1/DXT5 + LZO1X, pure Python).
- `tools/pbo.py`: reads .pbo archives.
- The satellite image is the 43×43 `layers/S_*_lco.paa` tiles from `worlds_nasdara_data.pbo`: 512 px each, 128 px overlap, 64 px edge padding, giving 16384 px for 16384 m.

Map data © Bohemia Interactive. Not affiliated with or endorsed by Bohemia Interactive.
