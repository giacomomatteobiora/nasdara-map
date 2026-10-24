# Nasdara map

Fan-made interactive map of DayZ's Nasdara: satellite and paper map backgrounds, with toggleable layers for loot buildings (by loot type), vehicle spawns, events and fresh player spawns.

Static site in `site/` (Leaflet, no build step), hosted on GitHub Pages.

## Rebuilding

Needs DayZ (with Nasdara) installed and a copy of the Nasdara server mission (`dayzOffline.nasdara`). Paths are set at the top of each script.

```sh
python3 -m venv .venv && .venv/bin/pip install Pillow numpy
.venv/bin/python tools/build_tiles.py   # site/tiles/  (~25 s, ~1.7 GB RAM)
.venv/bin/python tools/build_data.py    # site/data/
python3 -m http.server -d site 8000     # preview at http://localhost:8000
```

- `tools/paa.py`: decodes .paa textures (DXT1/DXT5 + LZO1X, pure Python).
- `tools/pbo.py`: reads .pbo archives.
- The satellite image is the 43×43 `layers/S_*_lco.paa` tiles from `worlds_nasdara_data.pbo`: 512 px each, 128 px overlap, 64 px edge padding, giving 16384 px for 16384 m.

Map data © Bohemia Interactive. Not affiliated with or endorsed by Bohemia Interactive.
