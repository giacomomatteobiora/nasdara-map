// Nasdara map. World coordinates are DayZ metres: lat = Z (north), lng = X (east), 0..16384.
const WORLD = 16384;

// Symbols, 24x24 box. "d" is one path or a list of paths filled separately (so parts can overlap);
// "s" = stroke width for line glyphs, otherwise filled (even-odd, so inner subpaths cut holes).
const WHEELS = "M7 14.3a2.3 2.3 0 1 0 .01 0zM17 14.3a2.3 2.3 0 1 0 .01 0z";
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
  // vehicles (side views)
  sedan: { d: ["M1.5 14.5v-3.2l3.2-1.1 2.8-3.7h7.2l3.6 3.7 3.2.8v3.5z", WHEELS] },
  hatch: { d: ["M2 14.5v-3.5l2.4-.9 3.2-4.6h6.2l5 4.6 3.2.9v3.5z", WHEELS] },
  offroad: { d: ["M1.5 14.5v-4l1.5-.6 1.8-4.4H14v5h6.5l2 1.2v2.8z", WHEELS] },
  humvee: { d: ["M1 14.5v-3.8l3.4-1 1.6-3.2h11.5l1.6 3.2 3.9 1v3.8z", "M6.5 14a2.6 2.6 0 1 0 .01 0zM17.5 14a2.6 2.6 0 1 0 .01 0z"] },
  truck: { d: ["M1.5 15V5h12.5v10z", "M15 8h4.3l3.2 3.8V15H15z", "M5.5 14.5a2.3 2.3 0 1 0 .01 0zM18.5 14.5a2.3 2.3 0 1 0 .01 0z"] },
  moto: { d: ["M5.5 11.5a3.6 3.6 0 1 0 .01 0zM5.5 13.6a1.5 1.5 0 1 0 .01 0z", "M18.5 11.5a3.6 3.6 0 1 0 .01 0zM18.5 13.6a1.5 1.5 0 1 0 .01 0z", "M5.5 14.8L9.6 9h5.6l1.8-2.4h2.8l-1.8 2.6 1.4 5.6-1.6.4-1.6-4.2-3.4 4.6H9z"] },
  // events
  heli: { d: ["M2 4.5h20v1.7H2z", "M11.1 5.5h1.8v3h-1.8z", "M4 12.2c0-2.3 2-3.9 5-3.9h4.5c3.4 0 5.5 2.4 5.5 5.2 0 2.4-1.8 3.9-4.6 3.9H8.3C5.6 17.4 4 15.6 4 13.6z", "M18 11.6h4.5v1.8H18z", "M7 18.8h10.5v1.6H7z"] },
  heliBig: { d: ["M.8 4h10v1.6H.8zM13.2 4h10v1.6h-10z", "M5 5h1.6v3.2H5zM17.4 5H19v3.2h-1.6z", "M4 8h16c1.6 0 2.6 1.1 2.6 2.6v4.2c0 1.5-1 2.6-2.6 2.6H5.2c-2.3 0-3.8-1.6-3.8-3.7v-1.1C1.4 10.2 2.4 8 4 8z", "M5 18.7h14v1.6H5z"] },
  convoy: { d: ["M1 15.5V6.5h9.5v9z", "M11.5 9h3.3l2.7 3.3v3.2h-6z", "M4.5 15a2.1 2.1 0 1 0 .01 0zM14 15a2.1 2.1 0 1 0 .01 0z", "M19.2 4.5l3 2.5-3 2.5V8h-3V6h3z"] },
  policeCar: { d: ["M1.5 15.5v-3.2l3.2-1.1 2.8-3.7h7.2l3.6 3.7 3.2.8v3.5z", "M7 15.3a2.3 2.3 0 1 0 .01 0zM17 15.3a2.3 2.3 0 1 0 .01 0z", "M9.5 4h5v2.3h-5z"] },
  drop: { d: "M12 2.5C9 7.5 5.5 11 5.5 15a6.5 6.5 0 0 0 13 0c0-4-3.5-7.5-6.5-12.5zm-3 12.3a3 3 0 0 0 3 3v1.7a4.7 4.7 0 0 1-4.7-4.7z" },
  lock: { d: "M6.5 10.5V8a5.5 5.5 0 0 1 11 0v2.5H19v11H5v-11zm2.6 0h5.8V8a2.9 2.9 0 0 0-5.8 0zm1.7 4v3.5h2.4v-3.5z" },
  person: { d: ["M12 1.8a3 3 0 1 0 .01 0z", "M8 8h8l2 7.5h-2.7L14.5 22h-5l-.8-6.5H6z"] },
};

const GROUPS = [
  {
    id: "b", file: "buildings", title: "Loot buildings", buildings: true, shape: "circle",
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
    id: "v", file: "vehicles", title: "Vehicle spawns", points: true, shape: "square",
    types: {
      VehicleCivilianSedan: ["Olga 24 (sedan)", "#00e5ff", true, "sedan"],
      VehicleSedan02: ["Sarka 120", "#ffd400", true, "sedan"],
      VehicleHatchback02: ["Gunter 2", "#ff4fd8", true, "hatch"],
      VehicleOffroadHatchback: ["Ada 4x4", "#7cfc00", true, "offroad"],
      VehicleOffroad02: ["M1025 (Humvee)", "#ff8800", true, "humvee"],
      VehicleTruck01: ["V3S truck", "#ffffff", true, "truck"],
      VehicleMotorbike: ["Motorbike", "#b388ff", true, "moto"],
    },
  },
  {
    id: "e", file: "events", title: "Events", points: true, shape: "diamond",
    types: {
      StaticHeliCrash: ["Heli crash", "#ff1744", true, "heli"],
      StaticHeliCrashBig: ["Heli crash (big)", "#b71c1c", true, "heliBig"],
      StaticMilitaryConvoy: ["Military convoy", "#ff9100", true, "convoy"],
      StaticPoliceCar: ["Police car", "#2979ff", true, "policeCar"],
      StaticWaterTruck: ["Water truck", "#00b8d4", true, "drop"],
      StaticContainerLocked: ["Locked container", "#ffea00", true, "lock"],
    },
  },
  {
    id: "s", file: "spawns", title: "Player spawns", square: true, shape: "circle",
    types: { FreshSpawn: ["Fresh spawn area (200 × 200 m)", "#34d399", true, "person"] },
  },
  {
    id: "p", file: "powerlines", title: "Power lines", lines: true,
    types: {
      vhv: ["High-voltage (big pylons)", "#d9534f", true],
      hv: ["Power lines", "#d8c35a", true],
    },
  },
  {
    id: "t", title: "Tier zones", tiers: true,
    types: {
      Tier1: ["Tier 1 (basic loot)", "#4caf50", false],
      Tier2: ["Tier 2", "#ffd600", false],
      Tier3: ["Tier 3 (best loot)", "#ff8000", false],
      Unique: ["Unique spots", "#ab47bc", false],
    },
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
const GROUP = Object.fromEntries(GROUPS.map((g) => [g.id, g]));
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
map.createPane("tiers").style.zIndex = 380; // tier zones, loot heatmap, buildings, then the vector canvas (400)
map.createPane("heat").style.zIndex = 385;
map.createPane("buildings").style.zIndex = 390;
map.createPane("points").style.zIndex = 420; // vehicle / event / spawn icons
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
const dpr = () => window.devicePixelRatio || 1;

// Badge sprite: coloured frame (circle / rounded square / diamond, per group) + glyph,
// cached per group, type and size (in CSS px, drawn at devicePixelRatio). Returns a canvas of (2r + 2) CSS px.
const spriteCache = new Map();
function badge(gid, type, r) {
  const key = `${gid}/${type}/${r}`;
  let c = spriteCache.get(key);
  if (c) return c;
  const g = GROUP[gid];
  const [, color, , glyph] = g.types[type];
  const size = Math.ceil((r * 2 + 2) * dpr());
  c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.scale(dpr(), dpr());
  const m = r + 1;
  ctx.beginPath();
  if (g.shape === "diamond") {
    ctx.moveTo(m, 1); ctx.lineTo(m + r, m); ctx.lineTo(m, m + r); ctx.lineTo(1, m); ctx.closePath();
  } else if (g.shape === "square") {
    const h = r * 0.86, k = r * 0.32;
    ctx.roundRect(m - h, m - h, h * 2, h * 2, k);
  } else {
    ctx.arc(m, m, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r / 6);
  ctx.strokeStyle = "rgba(0,0,0,0.75)";
  ctx.stroke();
  if (r >= 4.5 && glyph) {
    const gl = GLYPHS[glyph];
    const k = (r * (g.shape === "diamond" ? 1.0 : 1.25)) / 24;
    ctx.translate(m - 12 * k, m - 12 * k);
    ctx.scale(k, k);
    const ink = isLight(color) ? "#2a2620" : "#fff";
    for (const d of [].concat(gl.d)) {
      const path = new Path2D(d);
      if (gl.s) {
        ctx.lineWidth = gl.s;
        ctx.lineCap = "round";
        ctx.strokeStyle = ink;
        ctx.stroke(path);
      } else {
        ctx.fillStyle = ink;
        ctx.fill(path, "evenodd");
      }
    }
  }
  spriteCache.set(key, c);
  return c;
}
function drawSprite(ctx, img, x, y) {
  const w = img.width / dpr();
  ctx.drawImage(img, x - w / 2, y - w / 2, w, w);
}

// ---- own canvas layers (buildings, point icons): one canvas in their pane, redrawn on move/zoom ----
const CanvasLayer = L.Renderer.extend({
  options: { padding: 0.3 },

  redraw() {
    if (this._map) this._update();
  },

  _initContainer() {
    this._container = document.createElement("canvas");
    this._container.className = "own-canvas";
    this._ctx = this._container.getContext("2d");
  },

  _destroyContainer() {
    L.DomUtil.remove(this._container);
    delete this._container;
  },

  _update() {
    if (this._map._animatingZoom && this._bounds) return;
    L.Renderer.prototype._update.call(this);
    const b = this._bounds, size = b.getSize(), d = dpr(), c = this._container;
    L.DomUtil.setPosition(c, b.min);
    c.width = Math.round(size.x * d);
    c.height = Math.round(size.y * d);
    c.style.width = `${size.x}px`;
    c.style.height = `${size.y}px`;
    this._ctx.setTransform(d, 0, 0, d, -b.min.x * d, -b.min.y * d);
    this._ctx.clearRect(b.min.x, b.min.y, size.x, size.y);
    this._draw();
  },

  _scale() {
    return (2 ** this._map.getZoom() * 256) / WORLD;
  },

  _toLayer(x, z) {
    const s = this._scale(), o = this._map.getPixelOrigin();
    return [x * s - o.x, (WORLD - z) * s - o.y];
  },
});

// ---- buildings: badges when zoomed out, real rotated footprints when zoomed in ----
const FOOTPRINT_SCALE = 0.7; // px per metre at which footprints replace badges (~zoom 5.5)
const LOOT_DOT_SCALE = 2; // px per metre from which loot points are drawn (zoom 7)
const DIM_DOT = "rgba(150,150,150,0.55)";

// even-odd point-in-polygon over all loops, or within tol metres of an edge
function insideLoops(loops, x, z, tol) {
  let inside = false;
  for (const p of loops) {
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, zi] = p[i], [xj, zj] = p[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
      const dx = xj - xi, dz = zj - zi, l2 = dx * dx + dz * dz;
      const t = l2 ? Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / l2)) : 0;
      if (Math.hypot(x - xi - t * dx, z - zi - t * dz) <= tol) return true;
    }
  }
  return inside;
}
const CELL = 512; // metres, spatial index cell

const BuildingLayer = CanvasLayer.extend({
  options: { pane: "buildings" },

  setData(data) {
    this._usages = data.usages;
    this._types = data.types;
    this._items = data.b.map(([x, z, yaw, ti, mask], i) => {
      const a = (yaw * Math.PI) / 180;
      return { i, x, z, cos: Math.cos(a), sin: Math.sin(a), t: data.types[ti], ti, mask };
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

  // loot finder: show only buildings with a score > 0 (all loot types), ringed by score; null = normal view
  setFocus(scores, max) {
    this._focus = scores;
    this._focusMax = max;
    this.redraw();
  },

  _shown(it) {
    return this._focus ? this._focus[it.i] > 0 : (it.mask & this._mask) !== 0;
  },

  // first loot type in priority order (enabled ones, or all when focused), or -1
  _style(it) {
    const m = this._focus ? it.mask : it.mask & this._mask;
    return m ? 31 - Math.clz32(m & -m) : -1;
  },

  _visible(cb) {
    if (!this._grid || (!this._mask && !this._focus)) return;
    const map = this._map, b = this._bounds;
    const nw = map.layerPointToLatLng(b.min), se = map.layerPointToLatLng(b.max);
    for (let cx = Math.floor(nw.lng / CELL) - 1; cx <= Math.floor(se.lng / CELL) + 1; cx++) {
      for (let cz = Math.floor(se.lat / CELL) - 1; cz <= Math.floor(nw.lat / CELL) + 1; cz++) {
        for (const it of this._grid.get(`${cx},${cz}`) || []) {
          if (this._shown(it)) cb(it, this._style(it));
        }
      }
    }
  },

  _badgeRadius() {
    return Math.max(2.5, Math.min(8, 2 + (this._map.getZoom() - 1) * 1.5));
  },

  // real outlines from the shape scan (model space), loot points, and a colour function for those points
  setShapes(shapes) {
    this._shapes = shapes;
    this.redraw();
  },

  setDotStyle(fn) {
    this._dotStyle = fn;
    this.redraw();
  },

  _loops(it) {
    const sh = this._shapes && this._shapes[it.ti];
    if (sh && sh.p) return sh.p;
    const [, x0, z0, x1, z1] = it.t;
    return [[[x0, z0], [x1, z0], [x1, z1], [x0, z1]]];
  },

  // model-space point -> layer px (yaw clockwise from north)
  _local(it, lx, lz, s, px, py) {
    return [px + (lx * it.cos + lz * it.sin) * s, py - (-lx * it.sin + lz * it.cos) * s];
  },

  _path(ctx, loops) {
    for (const p of loops) {
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
      ctx.closePath();
    }
  },

  _draw() {
    const ctx = this._ctx;
    const s = this._scale();
    const usages = this._usages;
    const rings = [];
    if (s >= FOOTPRINT_SCALE) {
      const byStyle = new Map(), badges = [], dots = [];
      const showDots = s >= LOOT_DOT_SCALE && this._shapes;
      this._visible((it, st) => {
        const [px, py] = this._toLayer(it.x, it.z);
        if (!byStyle.has(st)) byStyle.set(st, []);
        const loops = this._loops(it).map((lp) => lp.map(([lx, lz]) => this._local(it, lx, lz, s, px, py)));
        byStyle.get(st).push(loops);
        if (this._focus) rings.push([it, loops]);
        const [, x0, z0, x1, z1] = it.t;
        const minSide = Math.min(x1 - x0, z1 - z0) * s;
        if (showDots) {
          for (const [lx, lz, ci] of (this._shapes[it.ti] && this._shapes[it.ti].l) || []) {
            dots.push([...this._local(it, lx, lz, s, px, py), this._dotStyle ? this._dotStyle(it, ci) : "#fff"]);
          }
        } else if (minSide >= 16) {
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
          badges.push([st, ...this._local(it, cx, cz, s, px, py), Math.min(9, minSide / 2.6)]);
        }
      });
      for (const [st, list] of byStyle) {
        const color = GROUPS[0].types[usages[st]][1];
        ctx.beginPath();
        for (const loops of list) this._path(ctx, loops);
        ctx.globalAlpha = showDots ? 0.45 : 0.6;
        ctx.fillStyle = color;
        ctx.fill("evenodd");
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(15,12,8,0.9)";
        ctx.stroke();
      }
      for (const [it, loops] of rings) {
        ctx.beginPath();
        this._path(ctx, loops);
        this._ring(ctx, it);
      }
      // loot points: dim ones first, so matching (bright) ones stay on top
      const r = Math.max(1.6, Math.min(3.5, s * 0.45));
      dots.sort((a, b2) => (a[2] === DIM_DOT) - (b2[2] === DIM_DOT)).reverse();
      for (const [x, y, color] of dots) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.stroke();
      }
      for (const [st, x, y, br] of badges) drawSprite(ctx, badge("b", usages[st], Math.round(br * 2) / 2), x, y);
    } else {
      const r = Math.round(this._badgeRadius() * 2) / 2;
      const list = [];
      this._visible((it, st) => list.push([st, it]));
      // high-priority types (or, when focused, the best loot spots) drawn last, on top
      if (this._focus) list.sort((a, b2) => this._focus[a[1].i] - this._focus[b2[1].i]);
      else list.sort((a, b2) => b2[0] - a[0]);
      for (const [st, it] of list) {
        const [px, py] = this._toLayer(it.x, it.z);
        if (this._focus) {
          ctx.beginPath();
          ctx.arc(px, py, r + 1.5, 0, Math.PI * 2);
          this._ring(ctx, it);
        }
        drawSprite(ctx, badge("b", usages[st], r), px, py);
      }
    }
  },

  _ring(ctx, it) {
    const t = Math.min(1, this._focus[it.i] / this._focusMax);
    ctx.lineWidth = 1.5 + 3 * t;
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.65 * t})`;
    ctx.stroke();
  },

  hitTest(latlng) {
    if (!this._grid || (!this._mask && !this._focus)) return null;
    const s = this._scale();
    const x = latlng.lng, z = latlng.lat;
    let best = null, bestD = Infinity;
    if (s >= FOOTPRINT_SCALE) {
      const tol = 2 / s + 0.5; // ~2 px slack
      this._near(x, z, (it) => {
        const dx = x - it.x, dz = z - it.z;
        const lx = dx * it.cos - dz * it.sin, lz = dx * it.sin + dz * it.cos;
        const [, x0, z0, x1, z1] = it.t;
        if (lx >= x0 - tol && lx <= x1 + tol && lz >= z0 - tol && lz <= z1 + tol && insideLoops(this._loops(it), lx, lz, tol)) {
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
        for (const it of this._grid.get(`${i},${j}`) || []) if (this._shown(it)) cb(it);
      }
    }
  },

  usagesOf(it) {
    return this._usages.filter((u, i) => it.mask & (1 << i));
  },
});
const buildingLayer = new BuildingLayer().addTo(map);

// ---- vehicle / event / spawn icons: few hundred points, drawn as badges on one canvas ----
const PointLayer = CanvasLayer.extend({
  options: { pane: "points" },

  initialize(options) {
    L.Renderer.prototype.initialize.call(this, options);
    this._sets = new Map(); // key -> { gid, type, pts: [{x, z, info}] }
    this._keys = new Set();
  },

  setPoints(key, gid, type, pts) {
    this._sets.set(key, { gid, type, pts });
    this.redraw();
  },

  setVisible(key, on) {
    if (on) this._keys.add(key);
    else this._keys.delete(key);
    this.redraw();
  },

  _radius(gid) {
    const z = this._map.getZoom();
    if (gid === "s") return z < 3 ? 0 : Math.min(9, 5 + (z - 3) * 1.2);
    return Math.max(6, Math.min(12, 6 + (z - 1) * 1.3)) * (gid === "e" ? 1.15 : 1);
  },

  _each(cb) {
    for (const key of this._keys) {
      const set = this._sets.get(key);
      if (!set) continue;
      const r = Math.round(this._radius(set.gid) * 2) / 2;
      if (r) for (const p of set.pts) cb(set, p, r);
    }
  },

  // loot finder: event sites that can give the item, ringed by score (shown even when the event layer is off)
  // focus = [{ type, pts: [{x, z, s, info}] }], max = highest site score
  setFocus(focus, max) {
    this._focus = focus;
    this._focusMax = max;
    this.redraw();
  },

  _eachFocus(cb) {
    if (!this._focus) return;
    const r = Math.round(this._radius("e") * 2) / 2;
    for (const f of this._focus) for (const p of f.pts) cb(f, p, r);
  },

  _draw() {
    const ctx = this._ctx;
    // spawns at the bottom, vehicles, then events on top
    const order = { s: 0, v: 1, e: 2 };
    const list = [];
    this._each((set, p, r) => list.push([order[set.gid], set, p, r]));
    list.sort((a, b) => a[0] - b[0]);
    for (const [, set, p, r] of list) {
      const [px, py] = this._toLayer(p.x, p.z);
      drawSprite(ctx, badge(set.gid, set.type, r), px, py);
    }
    this._eachFocus((f, p, r) => {
      const [px, py] = this._toLayer(p.x, p.z);
      const t = Math.min(1, p.s / this._focusMax);
      ctx.beginPath();
      ctx.arc(px, py, r + 2.5, 0, Math.PI * 2);
      ctx.lineWidth = 2 + 3 * t;
      ctx.strokeStyle = `rgba(255,255,255,${0.45 + 0.55 * t})`;
      ctx.stroke();
      drawSprite(ctx, badge("e", f.type, r), px, py);
    });
  },

  hitTest(latlng) {
    if (!this._map) return null;
    const c = this._map.latLngToLayerPoint(latlng);
    let best = null, bestD = Infinity;
    this._each((set, p, r) => {
      const [px, py] = this._toLayer(p.x, p.z);
      const d = Math.hypot(px - c.x, py - c.y);
      if (d <= r + 2 && d <= bestD) { bestD = d; best = p; } // later (higher) sets win ties
    });
    this._eachFocus((f, p, r) => {
      const [px, py] = this._toLayer(p.x, p.z);
      const d = Math.hypot(px - c.x, py - c.y);
      if (d <= r + 2 && d <= bestD) { bestD = d; best = p; }
    });
    return best;
  },
});
const pointLayer = new PointLayer().addTo(map);

// ---- state (from URL hash) ----
// #zoom/X/Z/base/key1.key2.../loot   keys are "<groupId>-<type>", loot = loot-finder query (optional)
const enabled = new Set();
for (const g of GROUPS) for (const [t, [, , on]] of Object.entries(g.types)) if (on) enabled.add(`${g.id}-${t}`);
let initialView = null;
let initialLoot = "";
(function readHash() {
  const parts = location.hash.slice(1).split("/");
  if (parts.length < 4) return;
  const [z, x, zz, b, keys, loot] = parts;
  if (![z, x, zz].every((v) => Number.isFinite(+v))) return;
  initialView = { center: L.latLng(+zz, +x), zoom: +z };
  if (bases[b]) base = b;
  enabled.clear();
  for (const k of (keys || "").split(".")) if (k) enabled.add(decodeURIComponent(k));
  initialLoot = loot ? decodeURIComponent(loot) : "";
})();

let lootQuery = "";
function writeHash() {
  const c = map.getCenter();
  const loot = lootQuery ? `/${encodeURIComponent(lootQuery)}` : "";
  const h = `#${map.getZoom()}/${Math.round(c.lng)}/${Math.round(c.lat)}/${base}/${[...enabled].join(".")}${loot}`;
  history.replaceState(null, "", h);
}

// ---- layers ----
const layers = {}; // key -> { layer, built, group, type }
const dataPromise = {};
function loadData(file) {
  return (dataPromise[file] ??= fetch(`data/${file}.json`).then((r) => r.json()));
}

async function buildLayer(key) {
  const entry = layers[key];
  if (entry.built) return entry.layer;
  const { group: g, type } = entry;
  const [label, color] = g.types[type];
  if (g.tiers) {
    entry.layer = L.imageOverlay(`tiles/tiers/${type}.png`, bounds, { pane: "tiers", opacity: 0.85, interactive: false });
    entry.built = true;
    return entry.layer;
  }
  const data = await loadData(g.file);
  if (g.labels) {
    for (const [name, kind, x, z] of data) {
      if (NAME_KIND[kind] !== type) continue;
      const icon = L.divIcon({
        className: `place lbl-${type}${kind === "Capital" ? " capital" : ""}`,
        html: `<span>${esc(name)}</span>`, iconSize: null,
      });
      entry.layer.addLayer(L.marker([z, x], { icon, pane: "labels", interactive: false, keyboard: false }));
    }
  } else if (g.lines) {
    // thin, half-transparent lines so they don't fight with the map; pylons (sized in metres) when zoomed in
    const lines = data.lines.filter((l) => l.k === type).map((l) => l.p.map(([x, z]) => [z, x]));
    const big = type === "vhv";
    const opts = { renderer, interactive: false, lineCap: "round", lineJoin: "round" };
    for (const ll of lines) entry.layer.addLayer(L.polyline(ll, { ...opts, color, weight: big ? 2 : 1.5, opacity: 0.6 }));
    entry.poles = L.featureGroup();
    for (const [x, z, k] of data.poles) {
      if (k !== type) continue;
      entry.poles.addLayer(L.circle([z, x], { ...opts, radius: big ? 5 : 2, color: "#16130f", weight: 1, opacity: 0.6, fillColor: color, fillOpacity: 0.7 }));
    }
  } else {
    const types = data._types;
    const pts = (data[type] || []).map(([x, z, ti]) => ({ x, z, info: { label, cls: types[ti], x, z } }));
    if (g.square) {
      for (const p of pts) {
        const m = L.rectangle([[p.z - 100, p.x - 100], [p.z + 100, p.x + 100]], { renderer, color, weight: 2, fillOpacity: 0.2 });
        m.info = p.info;
        entry.layer.addLayer(m);
      }
    }
    pointLayer.setPoints(key, g.id, type, pts);
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
      syncPoles();
      if (entry.group.points || entry.group.square) pointLayer.setVisible(key, true);
      restack();
      if (entry.group.labels) requestAnimationFrame(declutterLabels);
    }
  } else {
    entry.layer?.remove();
    entry.poles?.remove();
    pointLayer.setVisible(key, false);
    if (entry.group.labels) requestAnimationFrame(declutterLabels);
  }
  writeHash();
}

// pylons only from zoom 6: further out they are sub-pixel and turn the lines into dotted ones
function syncPoles() {
  const show = map.getZoom() >= 6;
  for (const [key, entry] of Object.entries(layers)) {
    if (!entry.poles) continue;
    if (show && enabled.has(key)) entry.poles.addTo(map);
    else entry.poles.remove();
  }
}
map.on("zoomend", syncPoles);

// The shared canvas draws in insertion order: keep spawn squares at the bottom, power lines above them.
const STACK = ["p"];
function restack() {
  for (const id of STACK) {
    for (const entry of Object.values(layers)) {
      if (entry.group.id === id && entry.layer && map.hasLayer(entry.layer)) entry.layer.bringToFront();
      if (entry.poles && map.hasLayer(entry.poles)) entry.poles.bringToFront();
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
  let extra = "";
  const data = loot.data;
  if (data) {
    const tiers = data.values.filter((v, i) => data.bt[it.i] & (1 << i)).map((v) => v.replace("Tier", "Tier "));
    const proto = data.protos[it.ti];
    const spots = proto ? proto[1].reduce((a, c) => a + c[2], 0) : 0;
    extra += `<div class="sub">${tiers.length ? `Zone: ${esc(tiers.join(", "))} · ` : ""}` +
      (proto ? `${spots} loot spots · up to ${proto[0]} items` : "no loot spawns") + "</div>";
    if (loot.scores && loot.scores[it.i] > 0) {
      extra += `<div class="find">${esc(loot.label)}: ${(100 * loot.scores[it.i] / loot.total).toFixed(2)}% of the map's spawn chance</div>`;
    }
    if (proto) {
      // what this building gives, by category and the most likely items (share of its loot)
      const items = buildingItems(data, it.i, it.ti);
      const total = [...items.values()].reduce((a, b) => a + b, 0);
      const cats = new Map();
      for (const [x, n] of items) cats.set(x[1], (cats.get(x[1]) || 0) + n);
      const pct = (n) => `${Math.round((100 * n) / total)}%`;
      const top = [...items].sort((a, b) => b[1] - a[1]).slice(0, 8);
      extra += `<div class="loot-cats">${[...cats].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) =>
        `<span>${esc(CAT_LABELS[data.cats[c]] || data.cats[c])} <b>${pct(n)}</b></span>`).join("")}</div>` +
        `<ol class="loot-items">${top.map(([x, n]) => `<li><span>${esc(x[7] || x[0])}</span><b>${(100 * n / total).toFixed(1)}%</b></li>`).join("")}</ol>`;
    }
  }
  return `<b>${esc(prettyClass(it.t[0]))}</b><div class="tags">${types}</div>${extra}<div class="sub">${coordText(it.x, it.z)}</div>`;
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
  for (const [type, [label, color, , glyph]] of Object.entries(g.types)) {
    const key = `${g.id}-${type}`;
    if (g.buildings) {
      layers[key] = { group: g, type };
    } else {
      const layer = g.labels ? L.layerGroup() : g.tiers ? null : L.featureGroup();
      if (g.square) {
        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          L.popup().setLatLng(e.latlng).setContent(popupHtml(e.layer.info)).openOn(map);
        });
      }
      layers[key] = { layer, built: false, group: g, type };
    }

    const li = document.createElement("li");
    const swatchClass = g.square || g.tiers ? " square" : g.labels ? " text" : g.lines ? " line" : "";
    li.innerHTML = `<label><input type="checkbox"><span class="swatch${swatchClass}" style="background:${color}"></span>` +
      `<span>${esc(label)}</span><span class="count"></span></label>`;
    if (glyph) {
      const img = document.createElement("img");
      img.className = "swatch-icon";
      img.alt = "";
      img.src = badge(g.id, type, 8).toDataURL();
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

  if (!g.file) continue;
  loadData(g.file).then((data) => {
    let count, fmt = (n) => n.toLocaleString();
    if (g.buildings) {
      count = (type) => {
        const bit = 1 << data.usages.indexOf(type);
        return data.b.reduce((n, row) => n + ((row[4] & bit) ? 1 : 0), 0);
      };
    } else if (g.labels) {
      count = (type) => data.filter(([, kind]) => NAME_KIND[kind] === type).length;
    } else if (g.lines) {
      // total length in km
      count = (type) => data.lines.filter((l) => l.k === type).reduce((n, l) => n + l.p.reduce((m, p, i) =>
        i ? m + Math.hypot(p[0] - l.p[i - 1][0], p[1] - l.p[i - 1][1]) : m, 0), 0) / 1000;
      fmt = (km) => `${km.toFixed(0)} km`;
    } else {
      count = (type) => (data[type] || []).length;
    }
    let total = 0;
    for (const b of boxes) {
      const n = count(b.type);
      total += n;
      b.countEl.textContent = fmt(n);
      b.li.hidden = n === 0;
    }
    totalEl.textContent = g.buildings ? fmt(data.b.length) : fmt(total);
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

// ---- loot finder ----
// CE-like estimate from the vanilla Nasdara loot tables. A loot point can take an item when its container accepts
// the item's category (and one of its tags, if it has any), the loot group's usage overlaps the item's usage and
// the item's tiers (if any) include the zone. Items flagged deloot only spawn at dynamic events. Each point is
// shared between all items that fit, by nominal. Building points and event loot items count the same.
const DERIVED = [
  ["Ammo", (it) => it[0].startsWith("Ammo_")],
  ["Magazines", (it) => it[0].startsWith("Mag_")],
  ["Backpacks", (it) => /bag|backpack/i.test(it[0]) && !/sleeping|plastic|burlap|feed|garbage|cement|mortar|paper/i.test(it[0])],
];
const CAT_LABELS = {
  weapons: "Weapons", clothes: "Clothes & armour", tools: "Tools & medical", food: "Food & drink",
  containers: "Containers", explosives: "Explosives", books: "Books", lootdispatch: "Misc (attachments, parts…)",
};
const loot = { data: null, scores: null, ev: null, total: 0, label: "", heat: null, sums: null };
const itemLabel = (it) => (it[7] && it[7] !== it[0] ? `${it[7]} (${it[0]})` : it[0]);
const eventLabel = (e) => (GROUP.e.types[e] || [e])[0];

function lootQueries(data) {
  // text shown in the search box -> predicate over items; class name -> that text (for links)
  const q = new Map(), byClass = new Map();
  for (const [ci, c] of data.cats.entries()) q.set(`All ${CAT_LABELS[c] || c}`, (it) => it[1] === ci);
  for (const [label, pred] of DERIVED) q.set(`All ${label}`, pred);
  for (const it of [...data.items].sort((a, b) => itemLabel(a).localeCompare(itemLabel(b)))) {
    const label = itemLabel(it);
    if (!q.has(label)) q.set(label, (x) => x === it);
    byClass.set(it[0].toLowerCase(), label);
  }
  return { q, byClass };
}

// per container signature: d = nominal of all items that fit, n = nominal of the chosen ones among them
function makeSums(items, chosen) {
  const cache = new Map();
  return (cm, tm, u, v, ev) => {
    const key = `${cm}|${tm}|${u}|${v}|${ev}`;
    let r = cache.get(key);
    if (!r) {
      let d = 0, n = 0;
      for (const it of items) {
        if (!fits(it, cm, tm, u, v, ev)) continue;
        d += it[2];
        if (chosen.has(it)) n += it[2];
      }
      r = [n, d];
      cache.set(key, r);
    }
    return r;
  };
}
const fits = (it, cm, tm, u, v, ev) => ((cm >> it[1]) & 1) && (!it[5] || (it[5] & tm)) && (it[3] & u) &&
  (!it[4] || (it[4] & v)) && (ev || !it[6]);

// expected number of chosen items in one loot group: a building fills each container with min(points, lootmax)
// items (capped by the group lootmax); an event object spawns `amount` items spread over its containers by size
function groupScore(sums, groupMax, conts, u, v, ev, amount) {
  let slots = 0;
  for (const c of conts) slots += Math.min(c[2], c[3]);
  if (!slots) return 0;
  const scale = amount == null ? Math.min(1, groupMax / slots) : Math.min(amount, groupMax || amount) / slots;
  let s = 0;
  for (const [cm, tm, pts, lm] of conts) {
    const [n, d] = sums(cm, tm, u, v, ev);
    if (n) s += (Math.min(pts, lm) * n) / d;
  }
  return s * scale;
}

// every event site's loot groups: [eproto, avgLoot, deloot ok, weight]
function siteKids(ev, pos) {
  const kids = pos[4];
  const w = ev.w / (ev.pick === "one" ? kids.length : 1);
  return kids.map(([ep, amount, dOk]) => [ep, amount, dOk, w]);
}

function lootScores(data, pred) {
  const chosen = new Set(data.items.filter(pred));
  const sums = makeSums(data.items, chosen);
  const b = buildingLayer._items;
  const scores = new Float32Array(b.length);
  let total = 0, max = 0;
  for (let i = 0; i < b.length; i++) {
    const proto = data.protos[b[i].ti];
    if (!proto) continue;
    const s = groupScore(sums, proto[0], proto[1], data.bu[i], data.bt[i], 0, null);
    if (!s) continue;
    scores[i] = s;
    total += s;
    if (s > max) max = s;
  }
  let evMax = 0;
  const ev = data.events.map((e) => e.pos.map((pos) => {
    let s = 0;
    for (const [ep, amount, dOk, w] of siteKids(e, pos)) {
      const [usage, groupMax, conts] = data.eprotos[ep];
      s += w * groupScore(sums, groupMax, conts, usage || pos[3], pos[2], dOk, amount);
    }
    total += s;
    if (s > evMax) evMax = s;
    return s;
  }));
  return { scores, ev, total, max, evMax, chosen, sums };
}

// expected items of one building, by item (for the building popup)
function buildingItems(data, i, ti) {
  const proto = data.protos[ti];
  const out = new Map();
  if (!proto) return out;
  const [groupMax, conts] = proto, u = data.bu[i], v = data.bt[i];
  let slots = 0;
  for (const c of conts) slots += Math.min(c[2], c[3]);
  const scale = Math.min(1, groupMax / slots);
  for (const [cm, tm, pts, lm] of conts) {
    const list = data.items.filter((it) => fits(it, cm, tm, u, v, 0));
    const d = list.reduce((a, it) => a + it[2], 0);
    for (const it of list) out.set(it, (out.get(it) || 0) + (Math.min(pts, lm) * scale * it[2]) / d);
  }
  return out;
}

const HEAT_N = 256; // 64 m cells
function heatImage(scores, ev) {
  const g = new Float32Array(HEAT_N * HEAT_N);
  const splat = (x, z, s) => {
    const cx = Math.min(HEAT_N - 1, Math.max(0, Math.floor((x / WORLD) * HEAT_N)));
    const cy = Math.min(HEAT_N - 1, Math.max(0, Math.floor(((WORLD - z) / WORLD) * HEAT_N)));
    g[cy * HEAT_N + cx] += s;
  };
  for (const it of buildingLayer._items) if (scores[it.i]) splat(it.x, it.z, scores[it.i]);
  loot.data.events.forEach((e, k) => e.pos.forEach((p, j) => { if (ev[k][j]) splat(p[0], p[1], ev[k][j]); }));
  // separable gaussian blur, sigma 1.5 cells
  const R = 5, k = [];
  for (let i = -R; i <= R; i++) k.push(Math.exp(-(i * i) / (2 * 1.5 * 1.5)));
  const ks = k.reduce((a, b) => a + b, 0);
  const tmp = new Float32Array(g.length), out = new Float32Array(g.length);
  for (let y = 0; y < HEAT_N; y++) {
    for (let x = 0; x < HEAT_N; x++) {
      let a = 0;
      for (let i = -R; i <= R; i++) { const xx = x + i; if (xx >= 0 && xx < HEAT_N) a += g[y * HEAT_N + xx] * k[i + R]; }
      tmp[y * HEAT_N + x] = a / ks;
    }
  }
  for (let y = 0; y < HEAT_N; y++) {
    for (let x = 0; x < HEAT_N; x++) {
      let a = 0;
      for (let i = -R; i <= R; i++) { const yy = y + i; if (yy >= 0 && yy < HEAT_N) a += tmp[yy * HEAT_N + x] * k[i + R]; }
      out[y * HEAT_N + x] = a / ks;
    }
  }
  // scale to the 98th percentile of the warm cells, so one hotspot does not wash out the rest
  const warm = out.filter((v) => v > 0).sort();
  const max = warm.length ? warm[Math.floor(warm.length * 0.98)] : 0;
  const c = document.createElement("canvas");
  c.width = c.height = HEAT_N;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(HEAT_N, HEAT_N);
  for (let i = 0; i < out.length; i++) {
    const t = max ? Math.min(1, Math.sqrt(out[i] / max)) : 0;
    let j = 1;
    while (j < HEAT_RAMP.length - 1 && t > HEAT_RAMP[j][0]) j++;
    const [t0, c0] = HEAT_RAMP[j - 1], [t1, c1] = HEAT_RAMP[j];
    const f = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
    for (let ch = 0; ch < 4; ch++) img.data[i * 4 + ch] = c0[ch] + (c1[ch] - c0[ch]) * f;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}
// transparent -> blue -> cyan -> yellow -> red (on a sqrt scale so weaker areas still show)
const HEAT_RAMP = [[0, [40, 90, 255, 0]], [0.12, [40, 120, 255, 120]], [0.35, [0, 220, 220, 170]], [0.6, [255, 230, 0, 200]], [1, [255, 40, 20, 225]]];

async function topSpots(r) {
  const names = await loadData("names");
  const nearest = (x, z) => {
    let best = null, bd = Infinity;
    for (const [name, kind, nx, nz] of names) {
      if (kind === "Hill" || kind === "Marine") continue;
      const d = Math.hypot(nx - x, nz - z);
      if (d < bd) { bd = d; best = name; }
    }
    return bd < 1500 ? { name: best, near: bd >= 400 } : { name: `grid ${pad3(x)} ${pad3(z)}`, near: false };
  };
  // buildings: 400 m clusters named after the nearest place; clusters with the same name are merged
  const cells = new Map();
  for (const it of buildingLayer._items) {
    const s = r.scores[it.i];
    if (!s) continue;
    const k = `${Math.floor(it.x / 400)},${Math.floor(it.z / 400)}`;
    const c = cells.get(k) || { s: 0, n: 0, x: 0, z: 0 };
    c.s += s; c.n++; c.x += it.x * s; c.z += it.z * s;
    cells.set(k, c);
  }
  const spots = new Map();
  for (const c of [...cells.values()].sort((a, b) => b.s - a.s)) {
    const x = c.x / c.s, z = c.z / c.s, { name, near } = nearest(x, z);
    const sp = spots.get(name);
    if (sp) { sp.share += c.s / r.total; sp.n += c.n; } else spots.set(name, { x, z, share: c.s / r.total, n: c.n, name, near, unit: "bldg" });
  }
  // events: one row per event type (its sites are random), flying to all of them
  loot.data.events.forEach((e, k) => {
    const sites = e.pos.filter((p, j) => r.ev[k][j] > 0);
    const s = r.ev[k].reduce((a, b) => a + b, 0);
    if (s) spots.set(`event:${e.e}`, { sites, share: s / r.total, n: sites.length, name: `${eventLabel(e.e)} sites`, event: e.e, unit: "sites" });
  });
  return [...spots.values()].sort((a, b) => b.share - a.share).slice(0, 10);
}

const lootInput = document.getElementById("loot-q");
const lootList = document.getElementById("loot-list");
const lootRes = document.getElementById("loot-res");
const lootClear = document.getElementById("loot-clear");
let lootQ = null;

async function lootData() {
  if (!loot.data) {
    const [data] = await Promise.all([loadData("loot"), loadData("buildings")]);
    loot.data = data;
    lootQ = lootQueries(data);
    lootList.innerHTML = [...lootQ.q.keys()].map((k) => `<option value="${esc(k)}"></option>`).join("");
  }
  return loot.data;
}

function clearLoot() {
  lootQuery = "";
  loot.scores = loot.ev = loot.sums = null;
  if (loot.heat) { loot.heat.remove(); loot.heat = null; }
  buildingLayer.setFocus(null);
  pointLayer.setFocus(null);
  buildingLayer.redraw();
  lootRes.innerHTML = "";
  lootInput.value = "";
  lootClear.hidden = true;
  writeHash();
}

function lootLabelFor(q) {
  if (lootQ.q.has(q)) return q;
  const low = q.toLowerCase();
  return lootQ.byClass.get(low) || [...lootQ.q.keys()].find((k) => k.toLowerCase() === low) ||
    [...lootQ.q.keys()].find((k) => k.toLowerCase().includes(low));
}

async function runLoot(q) {
  const data = await lootData();
  const label = q && lootLabelFor(q);
  if (!label) {
    lootRes.innerHTML = q ? `<p class="hint">Nothing matches — pick an item or category from the list.</p>` : "";
    return;
  }
  const pred = lootQ.q.get(label);
  const chosen = data.items.filter(pred);
  const key = label.startsWith("All ") ? label : chosen[0][0]; // links keep the class name
  if (key === lootQuery && loot.scores) return; // Enter + change both fire
  lootQuery = key;
  lootInput.value = label;
  lootClear.hidden = false;
  const t0 = performance.now();
  const r = lootScores(data, pred);
  Object.assign(loot, { scores: r.scores, ev: r.ev, total: r.total, sums: r.sums, label: label.replace(/^All /, "") });
  if (loot.heat) loot.heat.remove();
  loot.heat = null;
  let html = "";
  if (chosen.length === 1) {
    const it = chosen[0];
    const flags = (mask, list) => list.filter((n, i) => mask & (1 << i));
    const tiers = flags(it[4], data.values).map((v) => v.replace("Tier", "T")).join(" ") || "any tier";
    html += `<p class="hint">${esc(CAT_LABELS[data.cats[it[1]]] || data.cats[it[1]])} · nominal ${it[2]} · ` +
      `${esc(flags(it[3], data.usages).join(", ") || "no usage")} · ${esc(tiers)}${it[6] ? " · <b>events only</b>" : ""}</p>`;
  } else {
    html += `<p class="hint">${chosen.length} item types</p>`;
  }
  if (!r.total) {
    buildingLayer.setFocus(null);
    pointLayer.setFocus(null);
    html += `<p class="hint">Nothing on Nasdara can spawn this in the vanilla loot tables. It only comes from ` +
      `infected, animals, crafting or contaminated zones, or isn't used on this map.</p>`;
  } else {
    buildingLayer.setFocus(r.scores, r.max);
    const focus = data.events.map((e, k) => ({
      type: e.e,
      pts: e.pos.map((p, j) => ({ x: p[0], z: p[1], s: r.ev[k][j], info: { label: eventLabel(e.e), cls: "", x: p[0], z: p[1] } })).filter((p) => p.s > 0),
    })).filter((f) => f.pts.length);
    pointLayer.setFocus(focus, r.evMax);
    loot.heat = L.imageOverlay(heatImage(r.scores, r.ev), bounds, { pane: "heat", opacity: heatOpacity(), interactive: false, className: "heat" }).addTo(map);
    const spots = await topSpots(r);
    html += `<ol class="spots">${spots.map((s, i) => `<li><button data-i="${i}"${s.event ? ' class="ev"' : ""}>` +
      `<span>${s.near ? "near " : ""}${esc(s.name)}</span>` +
      `<span class="count">${(s.share * 100).toFixed(1)}% · ${s.n} ${s.unit}</span></button></li>`).join("")}</ol>` +
      `<div class="legend"><span>less</span><i></i><span>more</span></div>`;
    lootRes.innerHTML = html + LOOT_NOTE;
    lootRes.querySelectorAll(".spots button").forEach((btn) => btn.addEventListener("click", () => {
      const s = spots[+btn.dataset.i];
      if (document.getElementById("panel").classList.contains("open")) toggle.click(); // phone: show the map
      if (s.event) map.flyToBounds(L.latLngBounds(s.sites.map((p) => [p[1], p[0]])).pad(0.15), { maxZoom: 5 });
      else map.flyTo([s.z, s.x], 5.5);
    }));
    console.debug(`loot finder ${lootQuery}: ${(performance.now() - t0).toFixed(0)} ms`);
    writeHash();
    return;
  }
  lootRes.innerHTML = html + LOOT_NOTE;
  writeHash();
}
// the heatmap is 64 m cells: fade it out when zoomed in, where the ringed buildings and loot points tell more
const heatOpacity = () => { const z = map.getZoom(); return z < 4.5 ? 0.8 : z < 5.5 ? 0.55 : z < 6.5 ? 0.3 : 0.15; };
map.on("zoomend", () => loot.heat && loot.heat.setOpacity(heatOpacity()));
const LOOT_NOTE = `<p class="hint note">Estimate from the vanilla Nasdara loot tables (buildings + events). Modded servers differ.</p>`;

// loot points inside buildings: by container type, or (while searching) bright where the item can spawn
buildingLayer.setDotStyle((it, ci) => {
  const data = loot.data, proto = data && data.protos[it.ti];
  const c = proto && proto[1][ci];
  if (!c) return "#ffffff";
  if (loot.sums) return loot.sums(c[0], c[1], data.bu[it.i], data.bt[it.i], 0)[0] ? "#7cfc00" : DIM_DOT;
  if (c[1] & (1 << data.tags.indexOf("shelves"))) return "#7fd3ff";
  if (c[0] === 1 << data.cats.indexOf("weapons")) return "#ff9f43";
  return "#ffffff";
});

lootInput.addEventListener("focus", lootData, { once: true });
lootInput.addEventListener("change", () => (lootInput.value ? runLoot(lootInput.value.trim()) : clearLoot()));
lootInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runLoot(lootInput.value.trim()); });
lootClear.addEventListener("click", clearLoot);

// ---- map events ----
const coordsEl = document.getElementById("coords");
map.on("mousemove", (e) => { coordsEl.textContent = coordText(e.latlng.lng, e.latlng.lat); });
map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  if (!bounds.contains(e.latlng)) return;
  coordsEl.textContent = coordText(lng, lat);
  const pt = pointLayer.hitTest(e.latlng);
  const hit = !pt && buildingLayer.hitTest(e.latlng);
  const html = pt ? popupHtml(pt.info) : hit ? buildingPopupHtml(hit) : `<div class="sub">${coordText(lng, lat)}</div>`;
  L.popup().setLatLng(pt ? [pt.z, pt.x] : e.latlng).setContent(html).openOn(map);
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
loadData("buildings").then((data) => {
  buildingLayer.setData(data);
  syncBuildings();
  if (initialLoot) runLoot(initialLoot);
});
loadData("loot").then(() => lootData()).then(() => buildingLayer.redraw()); // popups, loot point colours
loadData("shapes").then((shapes) => buildingLayer.setShapes(shapes));
for (const key of [...enabled]) {
  if (!layers[key]) enabled.delete(key);
  else if (!layers[key].group.buildings) setEnabled(key, true);
}
