// Nasdara map. World coordinates are DayZ metres: lat = Z (north), lng = X (east), 0..16384.
const WORLD = 16384;

// Loot-type symbols, 24x24 box. "s" = stroke width for line glyphs, otherwise filled.
const GLYPHS = {
  star: { d: "M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z" },
  shield: { d: "M12 2.5l8 3v5.8c0 5-3.4 9.1-8 10.7-4.6-1.6-8-5.7-8-10.7V5.5z" },
  cross: { d: "M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" },
  flame: { d: "M12.5 2c.6 3.5 5.5 5.6 5.5 11a6 6 0 0 1-12 0c0-2.6 1.3-4.4 2.7-5.6.1 2 .9 3.3 2.1 3.8-.4-3.4.3-6.6 1.7-9.2z" },
  factory: { d: "M2.5 21V11l5 3v-3l5 3v-3l5 3V3.5h4V21z" },
  house: { d: "M12 3l9.5 8.5H19V21h-5v-6h-4v6H5v-9.5H2.5z" },
  hut: { d: "M12 5l8.5 7H18v8H6v-8H3.5z" },
  barn: { d: "M3 21V10l9-6.5L21 10v11h-6v-6H9v6z" },
  crosshair: { d: "M12 5.5a6.5 6.5 0 1 0 .01 0M12 2v6M12 16v6M2 12h6M16 12h6", s: 2.4 },
  anchor: { d: "M12 7v14M7.5 10.5h9M4.5 14a7.5 7.5 0 0 0 15 0M12 2.8a2.1 2.1 0 1 0 .01 0", s: 2.2 },
  briefcase: { d: "M9 4h6v3h5.5v13h-17V7H9zm1.8 1.6V7h2.4V5.6z" },
  book: { d: "M3 5l9 2 9-2v14l-9 2-9-2z" },
  bars: { d: "M6 3v18M10 3v18M14 3v18M18 3v18M3 4h18M3 20h18", s: 2 },
  column: { d: "M3.5 7L12 2.5 20.5 7v1.5h-17zM5.5 10h2.5v8H5.5zM10.75 10h2.5v8h-2.5zM16 10h2.5v8H16zM3.5 19.5h17V22h-17z" },
  car: { d: "M5 10.5l1.8-4.5h10.4l1.8 4.5h1.5v6h-1.8v2.5h-3v-2.5H8.3v2.5h-3v-2.5H3.5v-6z" },
};

const GROUPS = [
  {
    id: "b", file: "buildings", title: "Loot buildings", buildings: true,
    // [label, colour, on by default, glyph]
    types: {
      Military: ["Military", "#e5484d", true, "star"],
      MilitaryWest: ["Military (West)", "#c13584", true, "star"],
      MilitaryEast: ["Military (East)", "#ff7a59", true, "star"],
      Police: ["Police", "#3e8ef7", true, "shield"],
      Medic: ["Medical", "#ff6fb5", true, "cross"],
      Firefighter: ["Fire station", "#ff6d00", false, "flame"],
      Prison: ["Prison", "#6b7280", false, "bars"],
      Industrial: ["Industrial", "#6f7b87", false, "factory"],
      Office: ["Office", "#a78bfa", false, "briefcase"],
      School: ["School", "#8b5cf6", false, "book"],
      Town: ["Town", "#f2d14b", false, "house"],
      Village: ["Village", "#f4a261", false, "hut"],
      Farm: ["Farm", "#7ccf5a", false, "barn"],
      Hunting: ["Hunting", "#2e8b57", false, "crosshair"],
      Coast: ["Coast", "#39c5cf", false, "anchor"],
      Historical: ["Historical", "#8d6e63", false, "column"],
      Other: ["Other (wrecks etc.)", "#555c66", false, "car"],
    },
  },
  {
    id: "v", file: "vehicles", title: "Vehicle spawns", radius: 6, stroke: "#000", weight: 2,
    types: {
      VehicleCivilianSedan: ["Olga 24 (sedan)", "#00e5ff", true],
      VehicleSedan02: ["Sarka 120", "#ffd400", true],
      VehicleHatchback02: ["Gunter 2", "#ff4fd8", true],
      VehicleOffroadHatchback: ["Ada 4x4", "#7cfc00", true],
      VehicleOffroad02: ["M1025 (Humvee)", "#ff8800", true],
      VehicleTruck01: ["V3S truck", "#ffffff", true],
      VehicleMotorbike: ["Motorbike", "#b388ff", true],
    },
  },
  {
    id: "e", file: "events", title: "Events", radius: 7, stroke: "#fff", weight: 2,
    types: {
      StaticHeliCrash: ["Heli crash", "#ff1744", true],
      StaticHeliCrashBig: ["Heli crash (big)", "#b71c1c", true],
      StaticMilitaryConvoy: ["Military convoy", "#ff9100", true],
      StaticPoliceCar: ["Police car", "#2979ff", true],
      StaticWaterTruck: ["Water truck", "#00b8d4", true],
      StaticContainerLocked: ["Locked container", "#ffea00", true],
    },
  },
  {
    id: "s", file: "spawns", title: "Player spawns", square: true,
    types: { FreshSpawn: ["Fresh spawn area (200 × 200 m)", "#34d399", true] },
  },
  {
    id: "n", file: "names", title: "Place names", labels: true,
    types: {
      city: ["Cities", "#ffffff", true],
      village: ["Villages", "#e8e1d0", true],
      local: ["Local places & ruins", "#d9cfb8", true],
      terrain: ["Hills & rivers", "#9fd0ff", false],
    },
  },
];
const NAME_KIND = { Capital: "city", City: "city", Village: "village", Local: "local", Ruin: "local", Hill: "terrain", Marine: "terrain" };

const crs = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(256 / WORLD, 0, -256 / WORLD, 256),
});
const bounds = L.latLngBounds([0, 0], [WORLD, WORLD]);

const map = L.map("map", {
  crs, minZoom: 0, maxZoom: 8, zoomSnap: 0.5, zoomDelta: 0.5, wheelPxPerZoomLevel: 90,
  maxBounds: bounds.pad(0.15), maxBoundsViscosity: 0.8,
  preferCanvas: true, attributionControl: false, zoomControl: false,
});
L.control.zoom({ position: "topleft" }).addTo(map);
map.createPane("buildings").style.zIndex = 390; // below the vector canvas (overlayPane, 400)
map.createPane("labels").style.zIndex = 650; // above markers, below popups
const renderer = L.canvas({ padding: 0.5, tolerance: 4 });

const bases = {
  sat: L.tileLayer("tiles/sat/{z}/{x}/{y}.jpg", { maxNativeZoom: 6, maxZoom: 8, bounds, noWrap: true }),
  paper: L.tileLayer("tiles/paper/{z}/{x}/{y}.jpg", { maxNativeZoom: 4, maxZoom: 8, bounds, noWrap: true }),
  terrain: L.tileLayer("tiles/terrain/{z}/{x}/{y}.jpg", { maxNativeZoom: 5, maxZoom: 8, bounds, noWrap: true }),
};
let base = "sat";

// ---- helpers ----
const pad3 = (n) => String(Math.max(0, Math.floor(n / 100))).padStart(3, "0");
const coordText = (x, z) => `X ${Math.round(x)} · Z ${Math.round(z)} · grid ${pad3(x)} ${pad3(z)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const prettyClass = (s) => s.replace(/_/g, " ");
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 170;
};

// Badge sprite: coloured disc + glyph, cached per type and size (in CSS px, drawn at devicePixelRatio).
const spriteCache = new Map();
function badge(type, r) {
  const key = `${type}/${r}`;
  let c = spriteCache.get(key);
  if (c) return c;
  const [, color, , glyph] = GROUPS[0].types[type];
  const dpr = window.devicePixelRatio || 1;
  const size = Math.ceil((r * 2 + 2) * dpr);
  c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.beginPath();
  ctx.arc(r + 1, r + 1, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r / 6);
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.stroke();
  if (r >= 4.5) {
    const g = GLYPHS[glyph];
    const k = (r * 1.25) / 24;
    ctx.translate(r + 1 - 12 * k, r + 1 - 12 * k);
    ctx.scale(k, k);
    const ink = isLight(color) ? "#2a2620" : "#fff";
    const path = new Path2D(g.d);
    if (g.s) {
      ctx.lineWidth = g.s;
      ctx.lineCap = "round";
      ctx.strokeStyle = ink;
      ctx.stroke(path);
    } else {
      ctx.fillStyle = ink;
      ctx.fill(path, "evenodd");
    }
  }
  spriteCache.set(key, c);
  return c;
}

// ---- buildings: one canvas, badges when zoomed out, real rotated footprints when zoomed in ----
const FOOTPRINT_SCALE = 0.7; // px per metre at which footprints replace badges (~zoom 5.5)
const CELL = 512; // metres, spatial index cell

const BuildingLayer = L.Renderer.extend({
  options: { padding: 0.3, pane: "buildings" },

  setData(data) {
    this._usages = data.usages;
    this._types = data.types;
    this._items = data.b.map(([x, z, yaw, ti, mask]) => {
      const a = (yaw * Math.PI) / 180;
      return { x, z, cos: Math.cos(a), sin: Math.sin(a), t: data.types[ti], mask };
    });
    this._grid = new Map();
    for (const it of this._items) {
      const k = `${Math.floor(it.x / CELL)},${Math.floor(it.z / CELL)}`;
      if (!this._grid.has(k)) this._grid.set(k, []);
      this._grid.get(k).push(it);
    }
    this._mask = 0;
    this.redraw();
  },

  setEnabled(usages) {
    if (!this._usages) return;
    this._mask = 0;
    this._usages.forEach((u, i) => { if (usages.has(u)) this._mask |= 1 << i; });
    this.redraw();
  },

  redraw() {
    if (this._map) this._update();
  },

  _initContainer() {
    this._container = document.createElement("canvas");
    this._container.className = "building-canvas";
    this._ctx = this._container.getContext("2d");
  },

  _destroyContainer() {
    L.DomUtil.remove(this._container);
    delete this._container;
  },

  _update() {
    if (this._map._animatingZoom && this._bounds) return;
    L.Renderer.prototype._update.call(this);
    const b = this._bounds, size = b.getSize(), dpr = window.devicePixelRatio || 1, c = this._container;
    L.DomUtil.setPosition(c, b.min);
    c.width = Math.round(size.x * dpr);
    c.height = Math.round(size.y * dpr);
    c.style.width = `${size.x}px`;
    c.style.height = `${size.y}px`;
    this._ctx.setTransform(dpr, 0, 0, dpr, -b.min.x * dpr, -b.min.y * dpr);
    this._draw();
  },

  // first enabled loot type in priority order, or -1
  _style(it) {
    const m = it.mask & this._mask;
    return m ? 31 - Math.clz32(m & -m) : -1;
  },

  _visible(cb) {
    if (!this._grid || !this._mask) return;
    const map = this._map, b = this._bounds;
    const nw = map.layerPointToLatLng(b.min), se = map.layerPointToLatLng(b.max);
    for (let cx = Math.floor(nw.lng / CELL) - 1; cx <= Math.floor(se.lng / CELL) + 1; cx++) {
      for (let cz = Math.floor(se.lat / CELL) - 1; cz <= Math.floor(nw.lat / CELL) + 1; cz++) {
        for (const it of this._grid.get(`${cx},${cz}`) || []) {
          const s = this._style(it);
          if (s >= 0) cb(it, s);
        }
      }
    }
  },

  _scale() {
    return (2 ** this._map.getZoom() * 256) / WORLD;
  },

  _badgeRadius() {
    return Math.max(2.5, Math.min(8, 2 + (this._map.getZoom() - 1) * 1.5));
  },

  _toLayer(x, z) {
    const s = this._scale(), o = this._map.getPixelOrigin();
    return [x * s - o.x, (WORLD - z) * s - o.y];
  },

  // footprint corners in layer px
  _corners(it, s, px, py) {
    const [, x0, z0, x1, z1] = it.t;
    return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([lx, lz]) => [
      px + (lx * it.cos + lz * it.sin) * s,
      py - (-lx * it.sin + lz * it.cos) * s,
    ]);
  },

  _draw() {
    const ctx = this._ctx, b = this._bounds;
    ctx.clearRect(b.min.x, b.min.y, b.max.x - b.min.x, b.max.y - b.min.y);
    const s = this._scale();
    const usages = this._usages;
    if (s >= FOOTPRINT_SCALE) {
      const byStyle = new Map(), badges = [];
      this._visible((it, st) => {
        const [px, py] = this._toLayer(it.x, it.z);
        if (!byStyle.has(st)) byStyle.set(st, []);
        byStyle.get(st).push(this._corners(it, s, px, py));
        const [, x0, z0, x1, z1] = it.t;
        const minSide = Math.min(x1 - x0, z1 - z0) * s;
        if (minSide >= 16) {
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
          badges.push([st, px + (cx * it.cos + cz * it.sin) * s, py - (-cx * it.sin + cz * it.cos) * s, Math.min(9, minSide / 2.6)]);
        }
      });
      for (const [st, polys] of byStyle) {
        const color = GROUPS[0].types[usages[st]][1];
        ctx.beginPath();
        for (const p of polys) {
          ctx.moveTo(p[0][0], p[0][1]);
          for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]);
          ctx.closePath();
        }
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(15,12,8,0.9)";
        ctx.stroke();
      }
      for (const [st, x, y, r] of badges) {
        const img = badge(usages[st], Math.round(r * 2) / 2);
        const w = img.width / (window.devicePixelRatio || 1);
        ctx.drawImage(img, x - w / 2, y - w / 2, w, w);
      }
    } else {
      const r = Math.round(this._badgeRadius() * 2) / 2;
      const list = [];
      this._visible((it, st) => list.push([st, it]));
      list.sort((a, b2) => b2[0] - a[0]); // high-priority types drawn last (on top)
      for (const [st, it] of list) {
        const img = badge(usages[st], r);
        const w = img.width / (window.devicePixelRatio || 1);
        const [px, py] = this._toLayer(it.x, it.z);
        ctx.drawImage(img, px - w / 2, py - w / 2, w, w);
      }
    }
  },

  hitTest(latlng) {
    if (!this._grid || !this._mask) return null;
    const s = this._scale();
    const x = latlng.lng, z = latlng.lat;
    let best = null, bestD = Infinity;
    if (s >= FOOTPRINT_SCALE) {
      const tol = 2 / s + 0.5; // ~2 px slack
      this._near(x, z, (it) => {
        const dx = x - it.x, dz = z - it.z;
        const lx = dx * it.cos - dz * it.sin, lz = dx * it.sin + dz * it.cos;
        const [, x0, z0, x1, z1] = it.t;
        if (lx >= x0 - tol && lx <= x1 + tol && lz >= z0 - tol && lz <= z1 + tol) {
          const d = Math.hypot(lx - (x0 + x1) / 2, lz - (z0 + z1) / 2);
          if (d < bestD) { bestD = d; best = it; }
        }
      });
    } else {
      const maxD = (this._badgeRadius() + 2) / s;
      this._near(x, z, (it) => {
        const d = Math.hypot(x - it.x, z - it.z);
        if (d <= maxD && d < bestD) { bestD = d; best = it; }
      });
    }
    return best;
  },

  _near(x, z, cb) {
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    for (let i = cx - 1; i <= cx + 1; i++) {
      for (let j = cz - 1; j <= cz + 1; j++) {
        for (const it of this._grid.get(`${i},${j}`) || []) if (it.mask & this._mask) cb(it);
      }
    }
  },

  usagesOf(it) {
    return this._usages.filter((u, i) => it.mask & (1 << i));
  },
});
const buildingLayer = new BuildingLayer().addTo(map);

// ---- state (from URL hash) ----
// #zoom/X/Z/base/key1.key2...   keys are "<groupId>-<type>"
const enabled = new Set();
for (const g of GROUPS) for (const [t, [, , on]] of Object.entries(g.types)) if (on) enabled.add(`${g.id}-${t}`);
let initialView = null;
(function readHash() {
  const parts = location.hash.slice(1).split("/");
  if (parts.length < 4) return;
  const [z, x, zz, b, keys] = parts;
  if (![z, x, zz].every((v) => Number.isFinite(+v))) return;
  initialView = { center: L.latLng(+zz, +x), zoom: +z };
  if (bases[b]) base = b;
  enabled.clear();
  for (const k of (keys || "").split(".")) if (k) enabled.add(decodeURIComponent(k));
})();

function writeHash() {
  const c = map.getCenter();
  const h = `#${map.getZoom()}/${Math.round(c.lng)}/${Math.round(c.lat)}/${base}/${[...enabled].join(".")}`;
  history.replaceState(null, "", h);
}

// ---- layers ----
const layers = {}; // key -> { layer, built, group, type }
const dataPromise = {};
function loadData(g) {
  return (dataPromise[g.file] ??= fetch(`data/${g.file}.json`).then((r) => r.json()));
}

async function buildLayer(key) {
  const entry = layers[key];
  if (entry.built) return entry.layer;
  const { group: g, type } = entry;
  const data = await loadData(g);
  const [label, color] = g.types[type];
  if (g.labels) {
    for (const [name, kind, x, z] of data) {
      if (NAME_KIND[kind] !== type) continue;
      const icon = L.divIcon({
        className: `place lbl-${type}${kind === "Capital" ? " capital" : ""}`,
        html: `<span>${esc(name)}</span>`, iconSize: null,
      });
      entry.layer.addLayer(L.marker([z, x], { icon, pane: "labels", interactive: false, keyboard: false }));
    }
  } else {
    const types = data._types;
    for (const [x, z, ti] of data[type] || []) {
      const m = g.square
        ? L.rectangle([[z - 100, x - 100], [z + 100, x + 100]], { renderer, color, weight: 2, fillOpacity: 0.2 })
        : L.circleMarker([z, x], {
            renderer, radius: g.radius, color: g.stroke, weight: g.weight, fillColor: color, fillOpacity: 0.95,
          });
      m.info = { label, cls: types[ti], x, z };
      entry.layer.addLayer(m);
    }
  }
  entry.built = true;
  return entry.layer;
}

function syncBuildings() {
  buildingLayer.setEnabled(new Set([...enabled].filter((k) => k.startsWith("b-")).map((k) => k.slice(2))));
}

async function setEnabled(key, on) {
  const entry = layers[key];
  if (on) enabled.add(key);
  else enabled.delete(key);
  if (entry.group.buildings) {
    syncBuildings();
  } else if (on) {
    await buildLayer(key);
    if (enabled.has(key)) {
      entry.layer.addTo(map);
      restack();
      if (entry.group.labels) requestAnimationFrame(declutterLabels);
    }
  } else {
    entry.layer.remove();
    if (entry.group.labels) requestAnimationFrame(declutterLabels);
  }
  writeHash();
}

// The shared canvas draws in insertion order: keep spawns at the bottom, then vehicles, events on top.
const STACK = ["v", "e"];
function restack() {
  for (const id of STACK) {
    for (const entry of Object.values(layers)) {
      if (entry.group.id === id && map.hasLayer(entry.layer)) entry.layer.bringToFront();
    }
  }
}

function popupHtml({ label, cls, x, z }) {
  const sub = cls ? `<div class="sub">${esc(prettyClass(cls))}</div>` : "";
  return `<b>${esc(label)}</b>${sub}<div class="sub">${coordText(x, z)}</div>`;
}

function buildingPopupHtml(it) {
  const types = buildingLayer.usagesOf(it).map((u) => {
    const [label, color] = GROUPS[0].types[u];
    return `<span class="tag"><i style="background:${color}"></i>${esc(label)}</span>`;
  }).join("");
  return `<b>${esc(prettyClass(it.t[0]))}</b><div class="tags">${types}</div><div class="sub">${coordText(it.x, it.z)}</div>`;
}

// ---- panel ----
const panel = document.getElementById("layers");
for (const g of GROUPS) {
  const det = document.createElement("details");
  det.className = "group";
  det.open = g.id !== "b";
  const summary = document.createElement("summary");
  const master = document.createElement("input");
  master.type = "checkbox";
  master.setAttribute("aria-label", `All ${g.title}`);
  master.addEventListener("click", (e) => e.stopPropagation());
  summary.append(master, document.createTextNode(g.title));
  const totalEl = document.createElement("span");
  totalEl.className = "count";
  summary.append(totalEl);
  det.append(summary);

  const ul = document.createElement("ul");
  const boxes = [];
  for (const [type, [label, color]] of Object.entries(g.types)) {
    const key = `${g.id}-${type}`;
    if (!g.buildings) {
      const layer = g.labels ? L.layerGroup() : L.featureGroup();
      if (!g.labels) {
        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          L.popup().setLatLng(e.latlng).setContent(popupHtml(e.layer.info)).openOn(map);
        });
      }
      layers[key] = { layer, built: false, group: g, type };
    } else {
      layers[key] = { group: g, type };
    }

    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox"><span class="swatch${g.square ? " square" : ""}${g.labels ? " text" : ""}" style="background:${color}"></span>` +
      `<span>${esc(label)}</span><span class="count"></span></label>`;
    if (g.buildings) {
      const img = document.createElement("img");
      img.className = "swatch-icon";
      img.alt = "";
      img.src = badge(type, 8).toDataURL();
      li.querySelector(".swatch").replaceWith(img);
    }
    const box = li.querySelector("input");
    box.checked = enabled.has(key);
    box.addEventListener("change", () => { setEnabled(key, box.checked); syncMaster(); });
    boxes.push({ box, key, li, countEl: li.querySelector(".count"), type });
    ul.append(li);
  }
  det.append(ul);
  panel.append(det);

  function syncMaster() {
    const on = boxes.filter((b) => b.box.checked).length;
    master.checked = on === boxes.length;
    master.indeterminate = on > 0 && on < boxes.length;
  }
  master.addEventListener("change", () => {
    for (const b of boxes) if (b.box.checked !== master.checked) { b.box.checked = master.checked; setEnabled(b.key, master.checked); }
    syncMaster();
  });
  syncMaster();

  loadData(g).then((data) => {
    let count;
    if (g.buildings) {
      count = (type) => {
        const bit = 1 << data.usages.indexOf(type);
        return data.b.reduce((n, row) => n + ((row[4] & bit) ? 1 : 0), 0);
      };
    } else if (g.labels) {
      count = (type) => data.filter(([, kind]) => NAME_KIND[kind] === type).length;
    } else {
      count = (type) => (data[type] || []).length;
    }
    let total = 0;
    for (const b of boxes) {
      const n = count(b.type);
      total += n;
      b.countEl.textContent = n.toLocaleString();
      b.li.hidden = n === 0;
    }
    totalEl.textContent = (g.buildings ? data.b.length : total).toLocaleString();
  });
}

for (const input of document.querySelectorAll('input[name="base"]')) {
  input.checked = input.value === base;
  input.addEventListener("change", () => {
    bases[base].remove();
    base = input.value;
    bases[base].addTo(map).bringToBack();
    writeHash();
  });
}

const toggle = document.getElementById("panel-toggle");
toggle.addEventListener("click", () => {
  const open = document.getElementById("panel").classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Close" : "Layers";
});

// ---- map events ----
const coordsEl = document.getElementById("coords");
map.on("mousemove", (e) => { coordsEl.textContent = coordText(e.latlng.lng, e.latlng.lat); });
map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  if (!bounds.contains(e.latlng)) return;
  coordsEl.textContent = coordText(lng, lat);
  const hit = buildingLayer.hitTest(e.latlng);
  const html = hit ? buildingPopupHtml(hit) : `<div class="sub">${coordText(lng, lat)}</div>`;
  L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
});
map.on("moveend", writeHash);

// label density follows zoom: cities from 1.5, villages from 3, local names from 4;
// then labels that would overlap a more important one are hidden
const LABEL_RANK = ["capital", "lbl-city", "lbl-village", "lbl-local", "lbl-terrain"];
function labelZoom() {
  const z = map.getZoom();
  map.getContainer().dataset.lz = z < 1.5 ? 0 : z < 3 ? 1 : z < 4 ? 2 : 3;
  requestAnimationFrame(declutterLabels);
}
function declutterLabels() {
  const els = [...map.getPane("labels").querySelectorAll(".place")];
  for (const el of els) el.classList.remove("clash");
  const rank = (el) => LABEL_RANK.findIndex((c) => el.classList.contains(c));
  const placed = [];
  for (const el of els.sort((a, b) => rank(a) - rank(b))) {
    const r = el.firstElementChild.getBoundingClientRect();
    if (!r.width) continue; // hidden by zoom
    if (placed.some((p) => r.left < p.right + 4 && r.right > p.left - 4 && r.top < p.bottom && r.bottom > p.top)) {
      el.classList.add("clash");
    } else {
      placed.push(r);
    }
  }
}
map.on("zoomend", labelZoom);

// ---- start ----
bases[base].addTo(map);
if (initialView) map.setView(initialView.center, initialView.zoom);
else map.fitBounds(bounds.pad(-0.08));
labelZoom();
loadData(GROUPS[0]).then((data) => { buildingLayer.setData(data); syncBuildings(); });
for (const key of [...enabled]) {
  if (!layers[key]) enabled.delete(key);
  else if (!layers[key].group.buildings) setEnabled(key, true);
}
