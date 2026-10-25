// Nasdara map. World coordinates are DayZ metres: lat = Z (north), lng = X (east), 0..16384.
const WORLD = 16384;
// bump together with the ?v= in index.html on every deploy, so browsers don't mix cached old files with new ones
const VERSION = 8;

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
  // bunkers: arched blast door with a wheel / a tunnel mouth
  bunker: { d: ["M3 21V10a9 9 0 0 1 18 0v11h-2.6V10a6.4 6.4 0 0 0-12.8 0V21z", "M7.6 21V10.5a4.4 4.4 0 0 1 8.8 0V21zM12 12.4a2.4 2.4 0 1 0 .01 0z"] },
  tunnel: { d: "M2 21V11a10 7 0 0 1 20 0v10h-4.5v-8a5.5 4.5 0 0 0-11 0v8z" },
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
    // the same building data, picked by class: code-locked bunkers (keypad code broadcast in Morse) and tunnel bunkers
    id: "k", file: "buildings", title: "Bunkers", bunkers: true, shape: "square",
    types: {
      shelter: ["Locked bunker (shelter)", "#2dd4bf", true, "bunker"],
      basement: ["Locked bunker (basement)", "#14b8a6", true, "bunker"],
      tunnel: ["Tunnel bunker", "#94a3b8", true, "tunnel"],
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
    // traced from the in-game paper map (tools/build_roads.py)
    id: "r", file: "roads", title: "Roads", lines: true, roads: true,
    types: {
      main: ["Highway & main roads", "#f39237", true],
      road: ["Roads", "#ffd75e", true],
      track: ["Tracks", "#8a6a45", true],
    },
  },
  {
    id: "p", file: "powerlines", title: "Power lines", lines: true,
    types: {
      vhv: ["High-voltage (big pylons)", "#a855f7", true],
      hv: ["Power lines", "#38bdf8", true],
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
  crs, minZoom: 0, maxZoom: 9, zoomSnap: 0.5, zoomDelta: 0.5, wheelPxPerZoomLevel: 90,
  maxBounds: bounds.pad(0.15), maxBoundsViscosity: 0.8,
  preferCanvas: true, attributionControl: false, zoomControl: false,
});
L.control.zoom({ position: "topleft" }).addTo(map);
map.createPane("roads").style.zIndex = 370; // roads, tier zones, loot heatmap, buildings, then the vector canvas (400)
map.createPane("tiers").style.zIndex = 380;
map.createPane("heat").style.zIndex = 385;
map.createPane("buildings").style.zIndex = 390;
map.createPane("points").style.zIndex = 420; // vehicle / event / spawn icons
map.createPane("labels").style.zIndex = 650; // above markers, below popups
const renderer = L.canvas({ padding: 0.5, tolerance: 4 });
const roadRenderer = L.canvas({ pane: "roads", padding: 0.5 }); // under the buildings

const bases = {
  sat: L.tileLayer("tiles/sat/{z}/{x}/{y}.jpg", { maxNativeZoom: 6, maxZoom: 9, bounds, noWrap: true }),
  paper: L.tileLayer("tiles/paper/{z}/{x}/{y}.jpg", { maxNativeZoom: 4, maxZoom: 9, bounds, noWrap: true }),
  terrain: L.tileLayer("tiles/terrain/{z}/{x}/{y}.jpg", { maxNativeZoom: 5, maxZoom: 9, bounds, noWrap: true }),
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

// ---- buildings: badges when zoomed out, real outlines when zoomed in, shaded roofs from the roof scan up close ----
const FOOTPRINT_SCALE = 0.7; // px per metre at which footprints replace badges (~zoom 5.5)
const LOOT_DOT_SCALE = 2; // px per metre from which loot points are drawn (zoom 7)
const ROOF_SCALE = 2; // px per metre from which buildings are drawn as their roofs, seen from above (zoom 7)
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

// roofs.png (tools/build_shapes.py): per class a block of 0.5 m cells, R*256+G = height above ground in dm + 1000,
// A = 255 above ground / 128 underground. Loaded once, when first zoomed in that far (or for a popup plan).
const roofAtlas = { data: null, width: 0, loading: null };
function loadRoofs() {
  return (roofAtlas.loading ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      roofAtlas.data = ctx.getImageData(0, 0, img.width, img.height).data;
      roofAtlas.width = img.width;
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `data/roofs.png?v=${VERSION}`;
  }));
}

const hexRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
// world direction towards the sun (east, up, north): from the north-west, 45° up, like the terrain hill shading
const SUN = [-0.5, Math.SQRT1_2, 0.5];
const ROOF_CELL = 0.5; // metres per roof pixel

// One building class as seen from above: grey roof ramp by height, tinted with its loot colour, lit by the sun
// (rotated into model space, so the sprite depends on the yaw), dark edges where the height jumps (walls, roof steps,
// chimneys) and hatched underground parts. Row 0 = model z0, drawn with a y-flipping transform.
const roofCache = new Map();
function roofSprite(sh, ti, yaw, color, showUnder) {
  if (!roofAtlas.data || !sh || !sh.r) return null;
  const key = `${ti}/${Math.round(yaw / 3) % 120}/${color}/${showUnder ? 1 : 0}`;
  let c = roofCache.get(key);
  if (c) return c;
  if (roofCache.size > 900) roofCache.clear();
  const [ax, ay, w, h] = sh.r, A = roofAtlas.data, W = roofAtlas.width;
  const H = new Float32Array(w * h).fill(NaN), U = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = ((ay + j) * W + ax + i) * 4;
      if (!A[k + 3]) continue;
      U[j * w + i] = A[k + 3] < 200;
      if (U[j * w + i] && !showUnder) continue;
      H[j * w + i] = (((A[k] << 8) | A[k + 1]) - 1000) / 10;
    }
  }
  const a = (Math.round(yaw / 3) * 3 * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  const sx = SUN[0] * cos - SUN[2] * sin, sz = SUN[0] * sin + SUN[2] * cos, sy = SUN[1];
  const tint = hexRgb(color);
  c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(w, h), D = img.data;
  const at = (i, j, d) => {
    if (i < 0 || j < 0 || i >= w || j >= h) return d;
    const v = H[j * w + i];
    return v === v ? v : d;
  };
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const v = H[j * w + i];
      if (v !== v) continue;
      const l = at(i - 1, j, v), r = at(i + 1, j, v), dn = at(i, j - 1, v), up = at(i, j + 1, v);
      const k = (j * w + i) * 4;
      let rgb, f;
      if (U[j * w + i]) {
        // underground: cool slate with diagonal hatching
        rgb = (i + j) % 4 < 2 ? [104, 116, 130] : [78, 88, 100];
        f = 1;
      } else {
        const gx = Math.max(-3, Math.min(3, (r - l) / (2 * ROOF_CELL))), gz = Math.max(-3, Math.min(3, (up - dn) / (2 * ROOF_CELL)));
        const lam = (-gx * sx + sy - gz * sz) / Math.hypot(gx, 1, gz);
        const t = Math.max(0, Math.min(1, v / 9));
        const g = [136 + 96 * t, 132 + 96 * t, 126 + 96 * t];
        rgb = g.map((x, ch) => x * 0.72 + tint[ch] * 0.28);
        const jump = Math.max(Math.abs(l - v), Math.abs(r - v), Math.abs(dn - v), Math.abs(up - v)) > 0.8;
        f = (0.42 + 0.75 * Math.max(0, lam)) * (jump ? 0.5 : 1);
      }
      D[k] = Math.min(255, rgb[0] * f);
      D[k + 1] = Math.min(255, rgb[1] * f);
      D[k + 2] = Math.min(255, rgb[2] * f);
      D[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  roofCache.set(key, c);
  return c;
}

// loot points grouped into levels (gaps > 1.8 m between heights); labels G, 1, 2 … above ground, B1, B2 … below
function lootLevels(pts) {
  const ys = [...new Set(pts.map((p) => p[2]))].sort((a, b) => a - b);
  const levels = [];
  for (const y of ys) {
    const last = levels[levels.length - 1];
    if (last && y - last.max <= 1.8) last.max = y;
    else levels.push({ min: y, max: y });
  }
  const gi = levels.findIndex((l) => l.max > -1.2), ground = gi < 0 ? levels.length : gi;
  levels.forEach((l, i) => { l.label = i < ground ? `B${ground - i}` : i === ground ? "G" : String(i - ground); });
  const of = (y) => levels.findIndex((l) => y >= l.min - 0.01 && y <= l.max + 0.01);
  return { levels, of };
}

const BuildingLayer = CanvasLayer.extend({
  options: { pane: "buildings" },

  setData(data) {
    this._usages = data.usages;
    this._types = data.types;
    this._bunkers = data.bunkers || {};
    this._broadcast = data.broadcast;
    this._typeCount = new Map();
    this._items = data.b.map(([x, z, yaw, ti, mask], i) => {
      const a = (yaw * Math.PI) / 180;
      this._typeCount.set(ti, (this._typeCount.get(ti) || 0) + 1);
      return { i, x, z, yaw, cos: Math.cos(a), sin: Math.sin(a), t: data.types[ti], ti, mask, bk: this._bunkers[ti] };
    });
    this._grid = new Map();
    for (const it of this._items) {
      const k = `${Math.floor(it.x / CELL)},${Math.floor(it.z / CELL)}`;
      if (!this._grid.has(k)) this._grid.set(k, []);
      this._grid.get(k).push(it);
    }
    this._mask = 0;
    this._kinds = new Set();
    this.redraw();
  },

  // usages: enabled loot types; kinds: enabled bunker kinds (shown whatever their loot type)
  setEnabled(usages, kinds) {
    if (!this._usages) return;
    this._mask = 0;
    this._usages.forEach((u, i) => { if (usages.has(u)) this._mask |= 1 << i; });
    this._kinds = kinds;
    this.redraw();
  },

  // loot finder: show only buildings with a score > 0 (all loot types), ringed by score; null = normal view
  setFocus(scores, max) {
    this._focus = scores;
    this._focusMax = max;
    this.redraw();
  },

  // clicked building: bright outline, its loot points always shown (optionally one level only)
  select(it, level = null) {
    this._sel = it;
    this._level = level;
    if (it) loadRoofs().then(() => this.redraw());
    this.redraw();
  },

  // "show all of this type": every instance shown and ringed
  highlightType(ti) {
    this._hiType = ti;
    this.redraw();
  },

  _shown(it) {
    if (it === this._sel || it.ti === this._hiType) return true;
    if (this._focus) return this._focus[it.i] > 0;
    return (it.mask & this._mask) !== 0 || (it.bk !== undefined && this._kinds.has(it.bk));
  },

  // "<group>/<type>" of the badge / colour: the bunker kind if that layer is on, else the first loot type in priority
  // order (enabled ones, or all when focused / highlighted)
  _style(it) {
    if (it.bk && (this._focus || this._kinds.has(it.bk))) return `k/${it.bk}`;
    const m = this._focus || it === this._sel || it.ti === this._hiType ? it.mask : it.mask & this._mask;
    return `b/${this._usages[m ? 31 - Math.clz32(m & -m) : this._usages.length - 1]}`;
  },

  // bunkers on top, then loot types in priority order
  _rank(st) {
    return st[0] === "k" ? -1 : this._usages.indexOf(st.slice(2));
  },

  _visible(cb) {
    if (!this._grid) return;
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

  shapeOf(it) {
    return this._shapes && this._shapes[it.ti];
  },

  _loops(it) {
    const sh = this.shapeOf(it);
    if (sh && sh.p) return sh.p;
    const [, x0, z0, x1, z1] = it.t;
    return [[[x0, z0], [x1, z0], [x1, z1], [x0, z1]]];
  },

  // underground parts are worth drawing for bunkers and buildings with loot below ground, not for foundations
  showUnder(it) {
    const sh = this.shapeOf(it);
    return !!(sh && sh.u && (it.bk || (sh.l || []).some((p) => p[2] < -1.5)));
  },

  // model-space point -> layer px (yaw clockwise from north)
  _local(it, lx, lz, s, px, py) {
    return [px + (lx * it.cos + lz * it.sin) * s, py - (-lx * it.sin + lz * it.cos) * s];
  },

  _path(ctx, loops, dx = 0, dy = 0) {
    for (const p of loops) {
      ctx.moveTo(p[0][0] + dx, p[0][1] + dy);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0] + dx, p[i][1] + dy);
      ctx.closePath();
    }
  },

  _color(st) {
    return GROUP[st[0]].types[st.slice(2)][1];
  },

  _dots(it, s, px, py, out) {
    const sh = this.shapeOf(it);
    if (!sh || !sh.l) return;
    const lv = it === this._sel && this._level != null ? lootLevels(sh.l) : null;
    for (const [lx, lz, y, ci] of sh.l) {
      if (lv && lv.of(y) !== this._level) continue;
      out.push([...this._local(it, lx, lz, s, px, py), this._dotStyle ? this._dotStyle(it, ci) : "#fff"]);
    }
  },

  _draw() {
    const ctx = this._ctx;
    const s = this._scale();
    const rings = [];
    if (s >= FOOTPRINT_SCALE) {
      const flat = new Map(), roofs = [], badges = [], dots = [];
      const showDots = s >= LOOT_DOT_SCALE && this._shapes;
      const useRoofs = s >= ROOF_SCALE && this._shapes;
      if (useRoofs && !roofAtlas.data) loadRoofs().then(() => this.redraw());
      this._visible((it, st) => {
        const [px, py] = this._toLayer(it.x, it.z);
        const sh = this.shapeOf(it);
        const loops = this._loops(it).map((lp) => lp.map(([lx, lz]) => this._local(it, lx, lz, s, px, py)));
        const under = useRoofs && this.showUnder(it) ? sh.u.map((lp) => lp.map(([lx, lz]) => this._local(it, lx, lz, s, px, py))) : null;
        const sprite = useRoofs && roofSprite(sh, it.ti, it.yaw, this._color(st), !!under);
        if (sprite) roofs.push({ it, st, loops, under, sprite, sh, px, py });
        else {
          if (!flat.has(st)) flat.set(st, []);
          flat.get(st).push(loops);
        }
        if (this._focus || it.ti === this._hiType) rings.push([it, loops]);
        const [, x0, z0, x1, z1] = it.t;
        const minSide = Math.min(x1 - x0, z1 - z0) * s;
        if (showDots || (it === this._sel && this._shapes)) this._dots(it, s, px, py, dots);
        else if (minSide >= 16 || it.bk) {
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
          badges.push([st, ...this._local(it, cx, cz, s, px, py), Math.max(it.bk ? 5 : 0, Math.min(9, minSide / 2.6))]);
        }
      });
      // soft shadows towards the south-east, as long as the building is high (capped), under all roofs
      if (roofs.length) {
        ctx.beginPath();
        for (const r of roofs) {
          const off = Math.min(8, Math.max(0.6, r.sh.h || 3) * 0.35) * s;
          this._path(ctx, r.loops, off, off);
        }
        ctx.fillStyle = "rgba(10,8,6,0.28)";
        ctx.fill();
      }
      for (const [st, list] of flat) {
        ctx.beginPath();
        for (const loops of list) this._path(ctx, loops);
        ctx.globalAlpha = showDots ? 0.45 : 0.6;
        ctx.fillStyle = this._color(st);
        ctx.fill("evenodd");
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(15,12,8,0.9)";
        ctx.stroke();
      }
      for (const r of roofs) {
        const { it, sh, sprite } = r;
        ctx.save();
        ctx.beginPath();
        this._path(ctx, r.loops);
        if (r.under) this._path(ctx, r.under);
        ctx.clip("evenodd");
        ctx.transform(s * it.cos, s * it.sin, s * it.sin, -s * it.cos, r.px, r.py);
        ctx.drawImage(sprite, sh.r[4], sh.r[5], sh.r[2] * ROOF_CELL, sh.r[3] * ROOF_CELL);
        ctx.restore();
        ctx.beginPath();
        this._path(ctx, r.loops);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(15,12,8,0.85)";
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = this._color(r.st);
        ctx.stroke();
        if (r.under) {
          ctx.beginPath();
          this._path(ctx, r.under);
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "rgba(200,215,230,0.9)";
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      for (const [it, loops] of rings) {
        ctx.beginPath();
        this._path(ctx, loops);
        this._ring(ctx, it);
      }
      if (this._sel && this._shown(this._sel)) {
        const it = this._sel, [px, py] = this._toLayer(it.x, it.z);
        ctx.beginPath();
        this._path(ctx, this._loops(it).map((lp) => lp.map(([lx, lz]) => this._local(it, lx, lz, s, px, py))));
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.stroke();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
      // loot points: dim ones first, so matching (bright) ones stay on top
      const r = Math.max(1.6, Math.min(4.5, s * 0.45));
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
      for (const [st, x, y, br] of badges) drawSprite(ctx, badge(st[0], st.slice(2), Math.round(br * 2) / 2), x, y);
    } else {
      const r = Math.round(this._badgeRadius() * 2) / 2;
      const list = [];
      this._visible((it, st) => list.push([st, it]));
      // high-priority types (or, when focused, the best loot spots) drawn last, on top; the selection last of all
      if (this._focus) list.sort((a, b2) => this._focus[a[1].i] - this._focus[b2[1].i]);
      else list.sort((a, b2) => this._rank(b2[0]) - this._rank(a[0]));
      list.sort((a, b2) => (a[1] === this._sel) - (b2[1] === this._sel));
      for (const [st, it] of list) {
        const [px, py] = this._toLayer(it.x, it.z);
        const br = it.bk && st[0] === "k" ? Math.max(r, 5.5) : r;
        if (this._focus || it.ti === this._hiType) {
          ctx.beginPath();
          ctx.arc(px, py, br + 1.5, 0, Math.PI * 2);
          this._ring(ctx, it);
        }
        if (it === this._sel) {
          ctx.beginPath();
          ctx.arc(px, py, br + 3, 0, Math.PI * 2);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "#fff";
          ctx.stroke();
        }
        drawSprite(ctx, badge(st[0], st.slice(2), br), px, py);
      }
    }
  },

  _ring(ctx, it) {
    const t = this._focus ? Math.min(1, this._focus[it.i] / this._focusMax) : 0.8;
    ctx.lineWidth = 1.5 + 3 * t;
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.65 * t})`;
    ctx.stroke();
  },

  hitTest(latlng) {
    if (!this._grid) return null;
    const s = this._scale();
    const x = latlng.lng, z = latlng.lat;
    let best = null, bestD = Infinity;
    if (s >= FOOTPRINT_SCALE) {
      const tol = 2 / s + 0.5; // ~2 px slack
      this._near(x, z, (it) => {
        const dx = x - it.x, dz = z - it.z;
        const lx = dx * it.cos - dz * it.sin, lz = dx * it.sin + dz * it.cos;
        const [, x0, z0, x1, z1] = it.t;
        const near = lx >= x0 - tol && lx <= x1 + tol && lz >= z0 - tol && lz <= z1 + tol;
        const under = s >= ROOF_SCALE && this.showUnder(it) && insideLoops(this.shapeOf(it).u, lx, lz, tol);
        if ((near && insideLoops(this._loops(it), lx, lz, tol)) || under) {
          const d = Math.hypot(lx - (x0 + x1) / 2, lz - (z0 + z1) / 2);
          if (d < bestD) { bestD = d; best = it; }
        }
      });
    } else {
      const maxD = (this._badgeRadius() + 2) / s;
      this._near(x, z, (it) => {
        const d = Math.hypot(x - it.x, z - it.z);
        if (d <= maxD * (it.bk ? 1.4 : 1) && d < bestD) { bestD = d; best = it; }
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
// #zoom/X/Z/base/key1.key2.../loot   keys are "<groupId>-<type>" plus the version marker, loot = loot-finder query
const HASH_V = "v5";
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
  const list = (keys || "").split(".");
  for (const k of list) if (k && k !== HASH_V) enabled.add(decodeURIComponent(k));
  // links from before v5 don't know the bunker and road layers: switch those on as for a fresh visit
  if (!list.includes(HASH_V)) {
    for (const id of ["k", "r"]) for (const [t, [, , on]] of Object.entries(GROUP[id].types)) if (on) enabled.add(`${id}-${t}`);
  }
  initialLoot = loot ? decodeURIComponent(loot) : "";
})();

let lootQuery = "";
function writeHash() {
  const c = map.getCenter();
  const loot = lootQuery ? `/${encodeURIComponent(lootQuery)}` : "";
  const h = `#${map.getZoom()}/${Math.round(c.lng)}/${Math.round(c.lat)}/${base}/${[...enabled, HASH_V].join(".")}${loot}`;
  history.replaceState(null, "", h);
}

// ---- layers ----
const layers = {}; // key -> { layer, built, group, type }
const dataPromise = {};
function loadData(file) {
  return (dataPromise[file] ??= fetch(`data/${file}.json?v=${VERSION}`).then((r) => r.json()));
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
  } else if (g.roads) {
    // own canvas under the buildings; main roads and roads cased, getting as wide as the real road when zoomed in
    const [core, metres] = { main: [3, 9], road: [2.2, 6], track: [1.2, 3] }[type];
    const lines = data.lines.filter((l) => l.k === type).map((l) => l.p.map(([x, z]) => [z, x]));
    const opts = { renderer: roadRenderer, interactive: false, lineCap: "round", lineJoin: "round" };
    const cased = type !== "track";
    const casings = cased ? lines.map((ll) => L.polyline(ll, { ...opts, color: "#4a3a28", opacity: 0.85 })) : [];
    entry.lines = lines.map((ll, i) => [casings[i], L.polyline(ll, { ...opts, color }), core, metres]);
    for (const c of casings) entry.layer.addLayer(c);
    for (const [, c] of entry.lines) entry.layer.addLayer(c);
    lineWeights(entry);
  } else if (g.lines) {
    // cool colours (violet / sky blue) that stand out on all bases, with a thin dark casing;
    // pylons (sized in metres) when zoomed in
    const lines = data.lines.filter((l) => l.k === type).map((l) => l.p.map(([x, z]) => [z, x]));
    const big = type === "vhv";
    const opts = { renderer, interactive: false, lineCap: "round", lineJoin: "round" };
    // all casings first, so a casing never cuts across another line's core
    const casings = lines.map((ll) => L.polyline(ll, { ...opts, color: "#0d0b09", opacity: 0.45 }));
    entry.lines = lines.map((ll, i) => [casings[i], L.polyline(ll, { ...opts, color, opacity: 0.9 }), big ? 2.5 : 1.75]);
    for (const c of casings) entry.layer.addLayer(c);
    for (const [, core] of entry.lines) entry.layer.addLayer(core);
    entry.poles = L.featureGroup();
    for (const [x, z, k] of data.poles) {
      if (k !== type) continue;
      entry.poles.addLayer(L.circle([z, x], { ...opts, radius: big ? 5 : 2, color: "#0d0b09", weight: 1, opacity: 0.7, fillColor: color, fillOpacity: 0.85 }));
    }
    lineWeights(entry);
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
  const of = (id) => new Set([...enabled].filter((k) => k.startsWith(`${id}-`)).map((k) => k.slice(2)));
  buildingLayer.setEnabled(of("b"), of("k"));
}

async function setEnabled(key, on) {
  const entry = layers[key];
  if (on) enabled.add(key);
  else enabled.delete(key);
  if (entry.group.buildings || entry.group.bunkers) {
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

// power line / road widths follow the zoom: core weight (+0.5 px from zoom 6), casing 2 px wider
// roads are what the terrain map lacks: full strength there, see-through over the satellite / paper map (which show
// roads already); tracks get dashed once zoomed in
function lineWeights(entry) {
  if (!entry.lines) return;
  const z = map.getZoom();
  const road = entry.group.roads, alpha = road ? (base === "terrain" ? 1 : 0.55) : 1;
  for (const [casing, core, w, metres] of entry.lines) {
    // roads get as wide as the real road once that is wider than the base weight
    const cw = Math.max(w * (road && z < 3 ? 0.7 : 1) + (z >= 6 ? 0.5 : 0), metres ? (metres * 2 ** z * 256) / WORLD : 0);
    core.setStyle({ weight: cw, ...(road && { opacity: alpha, dashArray: !casing && z >= 5 ? "6 5" : null }) });
    if (casing) casing.setStyle({ weight: cw + 2, ...(road && { opacity: 0.85 * alpha }) });
  }
}
const allLineWeights = () => { for (const entry of Object.values(layers)) lineWeights(entry); };
map.on("zoomend", allLineWeights);

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

// ---- building inspector popup ----
// Friendly names: a few notable classes by hand, the rest by rules over the class name.
const BUILDING_NAMES = {
  PoliceStation_Large_Takistan: "Police station (large)", PoliceStation_Small_Takistan: "Police station",
  HealthCare_Takistan: "Health clinic", Hospital_Takistan: "Hospital", City_FireStation_Takistan: "Fire station",
  Mil_Airfield_HQ: "Airfield HQ", Mil_ATC_Small_Desert: "Air traffic control tower", Airfield_Hangar_Desert: "Airfield hangar",
  Airport_Small_Hangar2: "Small hangar", Airfield_Radar_Tall: "Radar tower", Mil_GuardTower: "Guard tower",
  Mil_ContainerWatchTower: "Container watchtower", Mil_GuardShed: "Guard shed", Mil_GuardBox_Brown: "Guard box",
  Mil_GuardBox_Smooth: "Guard box", Mil_Fortified_Nest_Small: "Fortified nest", Mil_Fortified_Nest_Watchtower_Desert: "Fortified watchtower",
  HBarrierTower_TK: "HESCO watchtower", Mil_ContainerHabitat_Armory: "Container armory", Mil_ContainerHabitat_Medical: "Container med bay",
  Mil_ContainerHabitat_Office: "Container office", Medical_Tent_Big: "Field hospital tent", Medical_Tent_Shower: "Decontamination shower tent",
  Tisy_Barracks: "Barracks (Tisy type)", Tisy_HQ: "Military HQ (Tisy type)", Tisy_KitchenRoom: "Military kitchen",
  RocketBase_Barracks: "Rocket base barracks", RocketBase_FuelTank: "Rocket fuel tank", RocketBase_FuelTank_Camo: "Rocket fuel tank (camo)",
  RocketBase_Garages: "Rocket base garages", RocketBase_MissileStorage: "Missile storage", RocketBase_MissileStorage2: "Missile storage",
  ResearchInstitute_Mirnyy: "Research institute", Radio_building: "Radio station", Power_Station: "Power station", Water_Station: "Water station",
  Repair_Center: "Repair centre", Store_CarService: "Car service", Store_Street1: "Street shop", Store_Street2: "Street shop (2 floors)",
  FuelStation_Build_Takistan: "Fuel station", Workshop_FuelStation: "Fuel station workshop", Bazaar_Corner: "Bazaar (corner)",
  Bazaar_Flat_Half: "Bazaar stall row", Bazaar_Left: "Bazaar", Caravanserai_Back: "Caravanserai (back)", Caravanserai_Front: "Caravanserai (front)",
  Villa: "Villa", Mosque_Big_Main: "Grand mosque", Mosque_Big_Minaret2: "Minaret", Mosque_Big_Gate: "Mosque gate", Mosque_Big_Side: "Mosque side hall",
  Mosque_Big_Wall: "Mosque wall", Mosque_Big_Wall_Corner: "Mosque wall (corner)", TajbegPalace_Left: "Tajbeg Palace, west wing",
  TajbegPalace_Middle: "Tajbeg Palace, centre", TajbegPalace_Right: "Tajbeg Palace, east wing", TajbegPalace_Platform_Basement_01: "Tajbeg Palace basement",
  TajbegPalace_Platform_Basement_02: "Tajbeg Palace basement", Castle_Bastion2_Desert: "Castle bastion", Mausoleum_Small1: "Mausoleum",
  Mausoleum_Small2: "Mausoleum", KirovDam_PowerPlant: "Dam power plant", KirovDam_House_A: "Dam house", KirovDam_House_B: "Dam house",
  KirovDam_Outlet_A: "Dam outlet", KirovDam_Outlet_B: "Dam outlet", Bunker_Shelter_Storage: "Bunker shelter, storage",
  Bunker_Shelter_Medical: "Bunker shelter, medical", Bunker_Shelter_Office: "Bunker shelter, office", Bunker_Basement_Storage: "Basement bunker, storage",
  Bunker_Basement_Medical: "Basement bunker, medical", Bunker_Basement_Civilian: "Basement bunker, civilian", Tunnel_Single_Bunker: "Tunnel bunker",
  Tunnel_Maintenance_Room: "Tunnel maintenance room", Tunnel_Medical_Room: "Tunnel medical room", Oil_DrillTower: "Oil drill tower",
  Quarry_Main: "Quarry", Sawmill_Building: "Sawmill", Sawmill_Illuminanttower: "Sawmill floodlight tower", Factory_Lathes: "Machine shop",
  Factory_Small: "Small factory", Farm_Hopper2: "Grain hopper", Construction_Building: "Building site", Construction_Crane: "Construction crane",
  Construction_House1: "House under construction", Construction_House2: "House under construction", Misc_WoodenCrate_Spawn: "Wooden crate",
  Misc_Toilet_Dry: "Outhouse", Misc_Scaffolding: "Scaffolding", Boat_Small1: "Small boat", Pier_Crane_A: "Pier crane", Pier_Crane_B: "Pier crane",
  BusStation_building: "Bus station", BusStation_wall_bench: "Bus station shelter", BusStop_City: "Bus stop", Guardhouse: "Guardhouse",
  Garage_Big: "Big garage", Garage_Office: "Garage office", Garage_Row_Big: "Garage row", Garage_Row_Small: "Garage row (small)",
  Garage_Small: "Small garage", Garage_Tall: "Tall garage", Office1: "Office building", Office2: "Office block", HouseBlock_2C1: "Apartment block",
  HouseBlock_2C_Corner: "Apartment block (corner)", DieselPowerPlant_Tank_Small: "Diesel tank", Shed_Closed: "Warehouse", Shed_Closed2: "Warehouse",
};
const WRECKS = { pickup01: "pickup", sed01: "Olga sedan", sed02: "Sarka sedan", hb01: "Gunter hatchback", hb02: "hatchback", uaz: "UAZ",
  offroad02: "M1025 Humvee", caravan: "caravan", trailer: "trailer", ikarus: "Ikarus bus", truck01: "V3S truck" };
const BUILDING_RULES = [
  [/^House_(\d)[A-Z]\d/, (m) => (m[1] === "1" ? "Single-storey house" : `${m[1]}-storey house`)],
  [/^Wreck_?(\w+?)_/i, (m) => `Wreck: ${WRECKS[m[1].toLowerCase()] || m[1]}`],
  [/^wreck_(truck01)/i, () => "Wreck: V3S truck"],
  [/^Mil_Barracks/, () => "Barracks"], [/^Mil_Guard[Hh]ouse/, () => "Military guardhouse"], [/^Border_/, () => "Border guardhouse"],
  [/^Mil_Tent_Big/, () => "Military tent"], [/^Refugee_Tent/, () => "Refugee tent"], [/^Refugee_ContainerHabitat/, () => "Refugee container"],
  [/^TradTent_(\w+?)\d?$/, (m) => `Traditional tent (${m[1].toLowerCase()})`], [/^Slum_House/, () => "Slum house"],
  [/^Shed_W/, () => "Wooden shed"], [/^Shed_M/, () => "Metal shed"], [/^Shed_Closed_Small/, () => "Small warehouse"],
  [/^Workshop\d/, () => "Workshop"], [/^Container_1/, () => "Shipping container"], [/^CementWorks_(\w+)/, (m) => `Cement works: ${m[1].replace(/_/g, " ").replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase()}`],
  [/^Smokestack/, () => "Smokestack"], [/^WaterTower/, () => "Water tower"], [/^Tower_TC/, () => "Tower"], [/^Villa/, () => "Villa"],
  [/^Mausoleum/, () => "Mausoleum"], [/^HouseBlock/, () => "Apartment block"], [/^Store_Street/, () => "Street shop"], [/^Store_CarService/, () => "Car service"],
];
function buildingName(cls) {
  const damaged = /_Dam\d/.test(cls), ruin = /_Ghost$/.test(cls);
  const base = cls.replace(/_Dam\d$/, "").replace(/_Ghost$/, "");
  let name = BUILDING_NAMES[base];
  if (!name) {
    for (const [re, fn] of BUILDING_RULES) {
      const m = base.match(re);
      if (m) { name = fn(m); break; }
    }
  }
  name ??= prettyClass(base);
  return name + (ruin ? " (ruin)" : damaged ? " (damaged)" : "");
}

// nearest named place (towns, villages, local names; not hills or rivers), with distance and direction from it
const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function placeNear(names, x, z) {
  let best = null, bd = Infinity;
  for (const [name, kind, nx, nz] of names) {
    if (kind === "Hill" || kind === "Marine") continue;
    const d = Math.hypot(nx - x, nz - z);
    if (d < bd) { bd = d; best = { name, d, dir: COMPASS[Math.round((((Math.atan2(x - nx, z - nz) * 180) / Math.PI + 360) % 360) / 45) % 8] }; }
  }
  return best;
}

// loot point kinds, from the proto container (name, tags, categories): [label, colour]
const DOT_KINDS = [["Floor", "#ffffff"], ["Shelves", "#7fd3ff"], ["Weapon racks", "#ff9f43"], ["Floor & shelves", "#c4b5fd"]];
function dotKind(c) {
  const data = loot.data;
  if (!c || !data) return 0;
  const tag = (t) => (c[1] >> data.tags.indexOf(t)) & 1;
  const armsOnly = !(c[0] & ~((1 << data.cats.indexOf("weapons")) | (1 << data.cats.indexOf("explosives"))));
  if (/weap/i.test(c[4] || "") || armsOnly) return 2;
  if (tag("shelves")) return tag("floor") ? 3 : 1;
  return 0;
}

// top-down plan of one building, north up, fitted to the canvas: roof render + loot points (one level or all).
// opts: w, h (CSS px), mini (thumbnail: no north arrow / scale bar, small dots)
function drawPlan(cv, it, level, opts = {}) {
  const d = dpr(), W = opts.w || 252, H = opts.h || 156, mini = !!opts.mini, pad = mini ? 8 : 24;
  cv.width = W * d;
  cv.height = H * d;
  cv.style.width = `${W}px`;
  cv.style.height = `${H}px`;
  const ctx = cv.getContext("2d");
  ctx.scale(d, d);
  const sh = buildingLayer.shapeOf(it) || {};
  const loops = buildingLayer._loops(it), under = buildingLayer.showUnder(it) ? sh.u : [];
  const color = buildingLayer._color(buildingLayer._style(it));
  const lv = lootLevels(sh.l || []);
  const pts = (sh.l || []).filter((p) => level == null || lv.of(p[2]) === level);
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const [lx, lz] of [...loops.flat(), ...under.flat(), ...(sh.l || [])]) {
    const wx = lx * it.cos + lz * it.sin, wz = -lx * it.sin + lz * it.cos;
    x0 = Math.min(x0, wx); x1 = Math.max(x1, wx); z0 = Math.min(z0, wz); z1 = Math.max(z1, wz);
  }
  const k = Math.min((W - pad) / Math.max(1, x1 - x0), (H - pad) / Math.max(1, z1 - z0), mini ? 10 : 16);
  const cx = W / 2 - (k * (x0 + x1)) / 2, cy = H / 2 + (k * (z0 + z1)) / 2;
  const loc = (lx, lz) => buildingLayer._local(it, lx, lz, k, cx, cy);
  const path = (ls) => { for (const p of ls) { ctx.moveTo(...loc(...p[0])); for (const q of p.slice(1)) ctx.lineTo(...loc(...q)); ctx.closePath(); } };
  const sprite = roofSprite(sh, it.ti, it.yaw, color, under.length > 0);
  ctx.beginPath();
  path(loops);
  path(under);
  if (sprite) {
    ctx.save();
    ctx.clip("evenodd");
    ctx.transform(k * it.cos, k * it.sin, k * it.sin, -k * it.cos, cx, cy);
    ctx.drawImage(sprite, sh.r[4], sh.r[5], sh.r[2] * ROOF_CELL, sh.r[3] * ROOF_CELL);
    ctx.restore();
  } else {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    ctx.fill("evenodd");
    ctx.globalAlpha = 1;
  }
  ctx.beginPath();
  path(loops);
  ctx.lineWidth = mini ? 1.5 : 2.5;
  ctx.strokeStyle = "rgba(15,12,8,0.85)";
  ctx.stroke();
  ctx.lineWidth = mini ? 0.8 : 1.2;
  ctx.strokeStyle = color;
  ctx.stroke();
  if (under.length) {
    ctx.beginPath();
    path(under);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "rgba(200,215,230,0.9)";
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const r = mini ? Math.max(1.3, Math.min(2.2, k * 0.25)) : Math.max(2.2, Math.min(4.5, k * 0.35));
  for (const [lx, lz, , ci] of pts) {
    ctx.beginPath();
    ctx.arc(...loc(lx, lz), r, 0, Math.PI * 2);
    ctx.fillStyle = buildingLayer._dotStyle ? buildingLayer._dotStyle(it, ci) : "#fff";
    ctx.fill();
    ctx.lineWidth = mini ? 0.6 : 1;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.stroke();
  }
  if (!mini) {
    // north arrow and scale bar
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", W - 10, 12);
    ctx.beginPath();
    ctx.moveTo(W - 10, 15); ctx.lineTo(W - 13.5, 22); ctx.lineTo(W - 6.5, 22); ctx.closePath();
    ctx.fill();
    const len = [1, 2, 5, 10, 20, 50].filter((m) => m * k <= 70).pop() || 1;
    ctx.fillRect(8, H - 9, len * k, 2);
    ctx.textAlign = "left";
    ctx.fillText(`${len} m`, 8, H - 12);
  }
  if (!roofAtlas.data) loadRoofs().then(() => cv.isConnected && drawPlan(cv, it, level, opts));
}

// a building class as a stand-in item (its model orientation, usage/tier of its first instance), for the catalogue
const firstOfType = new Map();
function typeItem(ti) {
  if (!firstOfType.size) for (const it of buildingLayer._items) if (!firstOfType.has(it.ti)) firstOfType.set(it.ti, it);
  const f = firstOfType.get(ti);
  return { ti, t: buildingLayer._types[ti], yaw: 0, cos: 1, sin: 0, bk: f.bk, mask: f.mask, i: f.i, x: f.x, z: f.z };
}

// everything the popup / catalogue says about a building
function buildingFacts(it) {
  const sh = buildingLayer.shapeOf(it) || {};
  const data = loot.data, proto = data && data.protos[it.ti], pts = sh.l || [];
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const [lx, lz] of buildingLayer._loops(it).flat()) { x0 = Math.min(x0, lx); x1 = Math.max(x1, lx); z0 = Math.min(z0, lz); z1 = Math.max(z1, lz); }
  const [w, l] = [x1 - x0, z1 - z0].sort((a, b) => a - b);
  const under = buildingLayer.showUnder(it);
  const ringArea = (p) => p.reduce((a, q, i) => { const n = p[(i + 1) % p.length]; return a + q[0] * n[1] - n[0] * q[1]; }, 0) / 2;
  return {
    sh, proto, pts, lv: lootLevels(pts), name: buildingName(it.t[0]), w, l, area: sh.a, height: sh.h,
    underArea: under ? Math.abs(sh.u.reduce((a, p) => a + ringArea(p), 0)) : 0,
    depth: Math.max(under ? sh.d || 0 : 0, -Math.min(0, ...pts.map((p) => p[2] - 0.2))),
    spots: proto ? proto[1].reduce((a, c) => a + c[2], 0) : 0, maxItems: proto ? proto[0] : 0,
    count: buildingLayer._typeCount.get(it.ti) || 1,
    tiers: data ? data.values.filter((v, i) => data.bt[it.i] & (1 << i)).map((v) => v.replace("Tier", "Tier ")) : [],
  };
}

function tagsHtml(it) {
  const tags = buildingLayer.usagesOf(it).map((u) => {
    const [label, color] = GROUP.b.types[u];
    return `<span class="tag"><i style="background:${color}"></i>${esc(label)}</span>`;
  });
  if (it.bk) {
    const [label, color] = GROUP.k.types[it.bk];
    tags.unshift(`<span class="tag"><i style="background:${color}"></i>${esc(label)}</span>`);
  }
  return `<div class="tags">${tags.join("")}</div>`;
}

function bunkerNoteHtml(it) {
  if (it.bk === "shelter" || it.bk === "basement") {
    const bc = buildingLayer._broadcast;
    const when = bc ? bc.periods.map(([a, b]) => `${a.slice(0, 2)}:${a.slice(2)}–${b.slice(0, 2)}:${b.slice(2)}`).join(", ") : "";
    return `<div class="bunker-note"><b>Code-locked bunker</b>${bc ? `${bc.codeLength}-digit keypad, code broadcast in Morse on the radio ` +
      `${when} (in-game). ${bc.active} of ${bc.sites} bunkers active at a time.` : ""}</div>`;
  }
  if (it.bk === "tunnel") return `<div class="bunker-note"><b>Tunnel bunker</b>Underground military rooms off a tunnel, no keypad.</div>`;
  return "";
}

// one line: size · height · spots · tier
function summaryLine(f) {
  return [`${Math.round(f.l)} × ${Math.round(f.w)} m`, f.height ? `${f.height.toFixed(0)} m tall` : "",
    f.depth >= 1.5 ? `${f.depth.toFixed(0)} m underground` : "", f.spots ? `${f.spots} loot spots` : "no loot", f.tiers.join(", ")]
    .filter(Boolean).join(" · ");
}

function factsHtml(f, withLocation) {
  const chips = [
    ["Size", `${Math.round(f.l)} × ${Math.round(f.w)} m`],
    f.area ? ["Area", `${f.area.toLocaleString()} m²`] : null,
    f.underArea >= 4 ? ["Below ground", `${Math.round(f.underArea).toLocaleString()} m²`] : null,
    f.height ? ["Height", `${f.height.toFixed(1)} m`] : null,
    f.depth >= 1.5 ? ["Underground", `${f.depth.toFixed(0)} m deep`] : null,
    ["Loot spots", f.spots ? String(f.spots) : "none"],
    f.maxItems ? ["Max items", String(f.maxItems)] : null,
    f.lv.levels.length ? ["Loot levels", f.lv.levels.map((x) => x.label).join(" · ")] : null,
    ["On Nasdara", f.count === 1 ? "unique" : withLocation ? `1 of ${f.count}` : `${f.count} placed`],
    f.tiers.length ? ["Zone", f.tiers.join(", ")] : null,
    withLocation ? ["Location", `<span class="loc">…</span>`] : null,
  ];
  return `<dl class="chips">${chips.filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
}

// category bars + most likely items (share of this building's loot)
function lootHtml(it, top) {
  const data = loot.data, proto = data && data.protos[it.ti];
  if (!proto) return `<p class="sub">No loot spawns in this building.</p>`;
  const items = buildingItems(data, it.i, it.ti);
  const total = [...items.values()].reduce((a, b) => a + b, 0);
  const cats = new Map();
  for (const [x, v] of items) cats.set(x[1], (cats.get(x[1]) || 0) + v);
  const held = total < 1.5 ? total.toFixed(1) : String(Math.round(total));
  return `<p class="held">Usually holds ≈ ${held} item${held === "1" ? "" : "s"} at a time (max ${proto[0]})</p><div class="cat-bars">${[...cats].filter(([, v]) => v >= total * 0.005).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, v]) => {
    const p = (100 * v) / total;
    return `<div><span>${esc(CAT_LABELS[data.cats[c]] || data.cats[c])}</span><i style="--w:${p.toFixed(1)}%"></i><b>${Math.round(p)}%</b></div>`;
  }).join("")}</div>` +
    `<ol class="loot-items">${[...items].sort((a, b) => b[1] - a[1]).slice(0, top).map(([x, v]) =>
      `<li><span>${esc(x[7] || x[0])}</span><b>${(100 * v / total).toFixed(1)}%</b></li>`).join("")}</ol>`;
}

// plan canvas + legend + level buttons inside el; sync = also filter the dots on the map
function planBlock(el, it, opts = {}) {
  const f = buildingFacts(it);
  let html = `<div class="plan"><canvas></canvas></div>`;
  if (f.pts.length) {
    const counts = DOT_KINDS.map(() => 0);
    for (const p of f.pts) counts[dotKind(f.proto && f.proto[1][p[3]])]++;
    html += `<div class="plan-legend">${DOT_KINDS.map(([label, color], i) => counts[i] ? `<span><i style="background:${color}"></i>${label} ${counts[i]}</span>` : "").join("")}` +
      `${loot.sums ? `<span><i style="background:#7cfc00"></i>${esc(loot.label)}</span>` : ""}</div>`;
    if (f.lv.levels.length > 1) {
      html += `<div class="levels" role="group" aria-label="Loot level"><button type="button" class="on" data-l="">All</button>` +
        f.lv.levels.map((x, i) => `<button type="button" data-l="${i}" title="${x.min.toFixed(1)} to ${x.max.toFixed(1)} m">${x.label}</button>`).join("") + `</div>`;
    }
  } else {
    html += `<p class="sub">No loot spawns in this building.</p>`;
  }
  el.innerHTML = html;
  const cv = el.querySelector("canvas");
  let level = null;
  const redraw = () => drawPlan(cv, it, level, opts);
  redraw();
  el.querySelectorAll(".levels button").forEach((b) => b.addEventListener("click", () => {
    level = b.dataset.l === "" ? null : +b.dataset.l;
    el.querySelectorAll(".levels button").forEach((x) => x.classList.toggle("on", x === b));
    if (opts.sync) buildingLayer.select(it, level);
    redraw();
  }));
}

function placeText(p) {
  if (!p) return "—";
  return p.d < 450 ? `in ${p.name}` : `${p.d >= 1000 ? `${(p.d / 1000).toFixed(1)} km` : `${Math.round(p.d / 50) * 50} m`} ${p.dir} of ${p.name}`;
}

// accessible tab bar: buttons with role=tab, arrow keys move between them; onChange(id)
function tabs(el, ids, labels, current, onChange) {
  const bar = el.querySelector(".tabbar");
  bar.innerHTML = ids.map((id, i) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === current}" tabindex="${id === current ? 0 : -1}">${labels[i]}</button>`).join("");
  const show = (id, focus) => {
    bar.querySelectorAll("[role=tab]").forEach((b) => {
      const on = b.dataset.tab === id;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    el.querySelectorAll("[role=tabpanel]").forEach((p) => { p.hidden = p.dataset.tab !== id; });
    onChange(id);
  };
  bar.addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) show(b.dataset.tab); });
  bar.addEventListener("keydown", (e) => {
    const i = ids.indexOf(bar.querySelector("[aria-selected=true]").dataset.tab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      show(ids[(i + (e.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length], true);
      e.preventDefault();
    }
  });
  show(current);
}

let popupTab = "plan"; // remembered between popups
function buildingPopup(it) {
  const el = document.createElement("div");
  el.className = "bpop";
  const f = buildingFacts(it);
  const data = loot.data;
  const find = data && loot.scores && loot.scores[it.i] > 0
    ? `<div class="find">${esc(loot.label)}: ${(100 * loot.scores[it.i] / loot.total).toFixed(2)}% of the map's spawn chance</div>` : "";
  const typeBtn = () => (buildingLayer._hiType === it.ti ? "Stop showing this type" : f.count > 1 ? `Show all ${f.count} on the map` : "Highlight on the map");
  el.innerHTML = `<header><b>${esc(f.name)}</b><div class="sub cls">${esc(it.t[0])}</div>${tagsHtml(it)}` +
    `<div class="summary">${esc(summaryLine(f))}</div>${bunkerNoteHtml(it)}${find}</header>` +
    `<div class="tabbar" role="tablist" aria-label="Building details"></div>` +
    `<div role="tabpanel" data-tab="plan" class="tab-plan"></div>` +
    `<div role="tabpanel" data-tab="loot">${lootHtml(it, 10)}</div>` +
    `<div role="tabpanel" data-tab="info">${factsHtml(f, true)}<div class="sub">${coordText(it.x, it.z)}</div>` +
    `<div class="pop-actions"><button type="button" class="show-type">${typeBtn()}</button>` +
    `<button type="button" class="open-cat">Open in catalogue</button></div></div>`;
  planBlock(el.querySelector(".tab-plan"), it, { sync: true });
  tabs(el, ["plan", "loot", "info"], ["Top view", "Loot", "Info"], popupTab, (id) => { popupTab = id; });
  el.querySelector(".show-type").addEventListener("click", (e) => {
    buildingLayer.highlightType(buildingLayer._hiType !== it.ti ? it.ti : null);
    e.target.textContent = typeBtn();
  });
  el.querySelector(".open-cat").addEventListener("click", () => openCatalog(it.ti));
  loadData("names").then((names) => {
    const loc = el.querySelector(".loc");
    if (loc) loc.textContent = placeText(placeNear(names, it.x, it.z));
  });
  return el;
}

function openBuildingPopup(it, latlng) {
  L.popup({ maxWidth: 300, minWidth: 262, maxHeight: Math.max(280, Math.min(640, innerHeight - 120)), autoPanPadding: [16, 16] })
    .setLatLng(latlng || [it.z, it.x]).setContent(buildingPopup(it)).openOn(map);
  buildingLayer.select(it);
}

// ---- building catalogue: every building type in a window over the map ----
const catalog = { el: document.getElementById("catalog"), built: false, filter: "all", q: "", sort: "count", scroll: 0 };
let lastFocus = null;

async function openCatalog(ti = null) {
  lastFocus = document.activeElement;
  catalog.el.hidden = false;
  document.body.classList.add("catalog-open");
  const [, shapes, names] = await Promise.all([loadData("buildings"), loadData("shapes"), loadData("names"), lootData(), loadRoofs()]);
  if (!buildingLayer._items) buildingLayer.setData(await loadData("buildings"));
  if (!buildingLayer._shapes) buildingLayer.setShapes(shapes);
  catalog.names = names;
  if (!catalog.built) buildCatalog();
  if (ti != null) catalogDetail(ti);
  else catalogGrid();
}

function closeCatalog() {
  if (catalog.el.hidden) return;
  catalog.scroll = catalog.el.querySelector(".cat-body").scrollTop;
  catalog.el.hidden = true;
  document.body.classList.remove("catalog-open");
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

function buildCatalog() {
  const el = catalog.el;
  const usages = buildingLayer._usages.filter((u) => buildingLayer._items.some((it) => it.mask & (1 << buildingLayer._usages.indexOf(u))));
  catalog.filters = [["all", "All"], ["bunkers", "Bunkers"], ...usages.map((u) => [u, GROUP.b.types[u][0].replace(" (wrecks etc.)", " / wrecks")])];
  el.innerHTML = `<div class="cat-win">
    <header class="cat-head">
      <h2 id="catalog-title">Buildings</h2>
      <input class="cat-q" type="search" placeholder="Search buildings…" aria-label="Search buildings" autocomplete="off" spellcheck="false">
      <select class="cat-sort" aria-label="Sort">
        <option value="count">Most common</option><option value="spots">Most loot spots</option>
        <option value="area">Largest</option><option value="name">Name</option>
      </select>
      <button type="button" class="cat-close" aria-label="Close">✕</button>
    </header>
    <div class="cat-filters" role="group" aria-label="Filter">${catalog.filters.map(([id, label]) =>
      `<button type="button" data-f="${id}">${esc(label)}</button>`).join("")}</div>
    <div class="cat-body"></div>
  </div>`;
  el.querySelector(".cat-close").addEventListener("click", closeCatalog);
  el.addEventListener("click", (e) => { if (e.target === el) closeCatalog(); });
  el.querySelector(".cat-q").addEventListener("input", (e) => { catalog.q = e.target.value.trim().toLowerCase(); catalogGrid(true); });
  el.querySelector(".cat-sort").addEventListener("change", (e) => { catalog.sort = e.target.value; catalogGrid(true); });
  el.querySelector(".cat-filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { catalog.filter = b.dataset.f; catalogGrid(true); }
  });
  catalog.observer = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const cv = en.target;
      catalog.observer.unobserve(cv);
      drawPlan(cv, typeItem(+cv.dataset.ti), null, { w: 150, h: 104, mini: true });
    }
  }, { root: el.querySelector(".cat-body"), rootMargin: "200px" });
  catalog.built = true;
}

function catalogTypes() {
  const L2 = buildingLayer, q = catalog.q, f = catalog.filter;
  const list = [];
  for (let ti = 0; ti < L2._types.length; ti++) {
    if (!L2._typeCount.get(ti)) continue;
    const it = typeItem(ti), name = buildingName(it.t[0]);
    if (q && !name.toLowerCase().includes(q) && !it.t[0].toLowerCase().includes(q)) continue;
    if (f === "bunkers" ? !it.bk : f !== "all" && !(it.mask & (1 << L2._usages.indexOf(f)))) continue;
    const sh = L2.shapeOf(it) || {}, proto = loot.data && loot.data.protos[ti];
    list.push({ ti, it, name, count: L2._typeCount.get(ti), spots: proto ? proto[1].reduce((a, c) => a + c[2], 0) : 0, area: sh.a || 0 });
  }
  const by = { count: (a, b) => b.count - a.count, spots: (a, b) => b.spots - a.spots, area: (a, b) => b.area - a.area, name: (a, b) => a.name.localeCompare(b.name) };
  return list.sort((a, b) => by[catalog.sort](a, b) || a.name.localeCompare(b.name));
}

function catalogGrid(reset) {
  const el = catalog.el, body = el.querySelector(".cat-body");
  el.querySelector(".cat-q").value = catalog.q;
  el.querySelector(".cat-sort").value = catalog.sort;
  el.querySelectorAll(".cat-filters button").forEach((b) => b.classList.toggle("on", b.dataset.f === catalog.filter));
  el.querySelector(".cat-filters").hidden = false;
  const list = catalogTypes();
  body.innerHTML = `<p class="cat-count">${list.length} building type${list.length === 1 ? "" : "s"}</p><div class="cat-grid">${list.map((c) => {
    const dots = buildingLayer.usagesOf(c.it).map((u) => `<i style="background:${GROUP.b.types[u][1]}" title="${esc(GROUP.b.types[u][0])}"></i>`).join("");
    return `<button type="button" class="cat-card" data-ti="${c.ti}"><canvas data-ti="${c.ti}" width="150" height="104"></canvas>` +
      `<span class="cat-name">${esc(c.name)}</span><span class="cat-meta">${dots}<span>×${c.count}</span><span>${c.spots ? `${c.spots} spots` : "no loot"}</span>` +
      `${c.it.bk ? `<span class="cat-bunker">bunker</span>` : ""}</span></button>`;
  }).join("")}</div>`;
  body.querySelectorAll("canvas").forEach((cv) => catalog.observer.observe(cv));
  body.querySelectorAll(".cat-card").forEach((b) => b.addEventListener("click", () => {
    catalog.scroll = body.scrollTop;
    catalogDetail(+b.dataset.ti);
  }));
  body.scrollTop = reset ? 0 : catalog.scroll;
  if (!reset) el.querySelector(".cat-q").focus({ preventScroll: true });
}

function catalogDetail(ti) {
  const el = catalog.el, body = el.querySelector(".cat-body");
  el.querySelector(".cat-filters").hidden = true;
  const it = typeItem(ti), f = buildingFacts(it);
  // where they are: instances grouped by nearest place
  const groups = new Map();
  for (const b of buildingLayer._items) {
    if (b.ti !== ti) continue;
    const p = placeNear(catalog.names, b.x, b.z), key = p ? (p.d < 450 ? p.name : `near ${p.name}`) : "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }
  const places = [...groups].sort((a, b) => b[1].length - a[1].length);
  body.innerHTML = `<div class="cat-detail">
    <button type="button" class="cat-back">← All buildings</button>
    <div class="cat-title"><h3>${esc(f.name)}</h3><span class="sub cls">${esc(it.t[0])}</span></div>
    ${tagsHtml(it)}${bunkerNoteHtml(it)}
    <div class="cat-cols">
      <div><div class="cat-plan"></div>${factsHtml(f, false)}</div>
      <div>
        <h4>Loot <span class="sub">(typical, ${esc(f.tiers.join(", ") || "any zone")})</span></h4>${lootHtml(it, 12)}
        <h4>Where to find it <span class="sub">(${f.count})</span></h4>
        <ul class="cat-places">${places.map(([name, list], i) => `<li><button type="button" data-p="${i}"><span>${esc(name)}</span>` +
          `<span class="count">${list.length > 1 ? `×${list.length}` : coordText(list[0].x, list[0].z).split(" · grid")[0]}</span></button></li>`).join("")}</ul>
        <div class="pop-actions"><button type="button" class="cat-showall">Show all ${f.count} on the map</button></div>
      </div>
    </div>
  </div>`;
  const planW = Math.min(460, body.clientWidth - 40);
  planBlock(body.querySelector(".cat-plan"), it, { w: Math.max(240, planW > 700 ? 460 : planW), h: 290 });
  body.scrollTop = 0;
  body.querySelector(".cat-back").addEventListener("click", () => catalogGrid(false));
  body.querySelector(".cat-showall").addEventListener("click", () => {
    buildingLayer.highlightType(ti);
    closeCatalog();
    const all = buildingLayer._items.filter((b) => b.ti === ti);
    map.flyToBounds(L.latLngBounds(all.map((b) => [b.z, b.x])).pad(0.2), { maxZoom: 6 });
  });
  body.querySelectorAll(".cat-places button").forEach((b) => b.addEventListener("click", () => {
    const [, list] = places[+b.dataset.p];
    const target = list[0];
    if (list.length > 1) buildingLayer.highlightType(ti);
    closeCatalog();
    map.flyTo([target.z, target.x], 7.5);
    map.once("moveend", () => openBuildingPopup(target));
  }));
  body.querySelector(".cat-back").focus({ preventScroll: true });
}

// open buttons: panel header + a map control under the zoom buttons
document.getElementById("catalog-open").addEventListener("click", () => {
  if (document.getElementById("panel").classList.contains("open")) toggle.click(); // phone: close the panel first
  openCatalog();
});
const CatalogControl = L.Control.extend({
  options: { position: "topleft" },
  onAdd() {
    const box = L.DomUtil.create("div", "leaflet-bar");
    const a = L.DomUtil.create("a", "catalog-btn", box);
    a.href = "#";
    a.title = "All building types";
    a.setAttribute("aria-label", a.title);
    a.setAttribute("role", "button");
    a.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>`;
    L.DomEvent.on(a, "click", (e) => { L.DomEvent.preventDefault(e); L.DomEvent.stopPropagation(e); openCatalog(); });
    L.DomEvent.disableClickPropagation(box);
    return box;
  },
});
new CatalogControl().addTo(map);

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
    if (g.buildings || g.bunkers) {
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
    } else if (g.bunkers) {
      count = (type) => data.b.reduce((n, row) => n + (data.bunkers[row[3]] === type ? 1 : 0), 0);
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
    allLineWeights();
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
// the item's tiers (if any) include the zone; a container without tags takes items of any tag. Buildings: the economy
// places items, not points; an item below its nominal goes into a random container anywhere on the map that takes it,
// weighted by sqrt(container lootmax), so its expected count in one container is nominal * sqrt(lootmax) / item[8]
// (item[8] = that weight summed over all its containers on the map); most points stay empty. Container and building lootmax cap that. Car parts go to the dispatch slots of matching wrecks (proto[2]).
// Items flagged deloot only spawn at dynamic events, which spawn a fixed number of items picked by nominal.
// Checked against a real CE run (build/lootcheck.py).
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
const BUNKER_Q = "All bunker loot";
const itemLabel = (it) => (it[7] && it[7] !== it[0] ? `${it[7]} (${it[0]})` : it[0]);
const eventLabel = (e) => (GROUP.e.types[e] || [e])[0];

function lootQueries(data) {
  // text shown in the search box -> predicate over items; class name -> that text (for links)
  const q = new Map(), byClass = new Map();
  q.set(BUNKER_Q, () => true); // every item, but only bunker buildings count (see runLoot)
  for (const [ci, c] of data.cats.entries()) q.set(`All ${CAT_LABELS[c] || c}`, (it) => it[1] === ci);
  for (const [label, pred] of DERIVED) q.set(`All ${label}`, pred);
  for (const it of [...data.items].sort((a, b) => itemLabel(a).localeCompare(itemLabel(b)))) {
    const label = itemLabel(it);
    if (!q.has(label)) q.set(label, (x) => x === it);
    byClass.set(it[0].toLowerCase(), label);
  }
  return { q, byClass };
}

// per container signature: dens -> [chosen, all] expected items in one building container per unit of container
// weight (sum of nominal / item[8] over the items that fit); nom -> [chosen, all] nominal of the items that fit (event loot)
function makeSums(items, chosen) {
  const dc = new Map(), nc = new Map();
  return {
    chosen,
    dens(cm, tm, u, v) {
      const key = `${cm}|${tm}|${u}|${v}`;
      let r = dc.get(key);
      if (!r) {
        let a = 0, n = 0;
        for (const it of items) {
          if (!it[8] || !fits(it, cm, tm, u, v, 0)) continue;
          const e = it[2] / it[8];
          a += e;
          if (chosen.has(it)) n += e;
        }
        dc.set(key, (r = [n, a]));
      }
      return r;
    },
    nom(cm, tm, u, v, ev) {
      const key = `${cm}|${tm}|${u}|${v}|${ev}`;
      let r = nc.get(key);
      if (!r) {
        let d = 0, n = 0;
        for (const it of items) {
          if (!fits(it, cm, tm, u, v, ev)) continue;
          d += it[2];
          if (chosen.has(it)) n += it[2];
        }
        nc.set(key, (r = [n, d]));
      }
      return r;
    },
  };
}
const fits = (it, cm, tm, u, v, ev) => ((cm >> it[1]) & 1) && (!it[5] || !tm || (it[5] & tm)) && (it[3] & u) &&
  (!it[4] || (it[4] & v)) && (ev || !it[6]);

// expected [chosen, all] items in a building: density per container, capped by the container lootmax, then
// scaled down to the group lootmax; plus car parts in the wreck dispatch slots
function buildingScore(sums, groupMax, conts, u, v, dispatch, items) {
  let ch = 0, all = 0;
  for (const [cm, tm, , lm] of conts) {
    const [n, a] = sums.dens(cm, tm, u, v), w = Math.sqrt(lm);
    if (!a) continue;
    const cap = Math.min(1, lm / (a * w));
    ch += n * w * cap;
    all += a * w * cap;
  }
  const s = all > groupMax ? groupMax / all : 1;
  ch *= s;
  all *= s;
  for (const [k, slots] of dispatch || []) {
    const it = items[k], e = (it[2] * slots) / it[8];
    all += e;
    if (sums.chosen.has(it)) ch += e;
  }
  return [ch, all];
}

// expected number of chosen items from one event object: `amount` items spread over its containers by size,
// each container's items picked by nominal
function eventScore(sums, groupMax, conts, u, v, ev, amount) {
  let slots = 0;
  for (const c of conts) slots += Math.min(c[2], c[3]);
  if (!slots) return 0;
  const scale = Math.min(amount, groupMax || amount) / slots;
  let s = 0;
  for (const [cm, tm, pts, lm] of conts) {
    const [n, d] = sums.nom(cm, tm, u, v, ev);
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
    const s = buildingScore(sums, proto[0], proto[1], data.bu[i], data.bt[i], proto[2], data.items)[0];
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
      s += w * eventScore(sums, groupMax, conts, usage || pos[3], pos[2], dOk, amount);
    }
    total += s;
    if (s > evMax) evMax = s;
    return s;
  }));
  return { scores, ev, total, max, evMax, chosen, sums };
}

// expected count of each item in one building at a time (popup / catalogue), same model as buildingScore
function buildingItems(data, i, ti) {
  const proto = data.protos[ti];
  const out = new Map();
  if (!proto) return out;
  const [groupMax, conts, dispatch] = proto, u = data.bu[i], v = data.bt[i];
  let all = 0;
  for (const [cm, tm, , lm] of conts) {
    const list = data.items.filter((it) => it[8] && fits(it, cm, tm, u, v, 0));
    const w = Math.sqrt(lm), a = list.reduce((x, it) => x + (it[2] * w) / it[8], 0);
    if (!a) continue;
    const cap = Math.min(1, lm / a);
    for (const it of list) out.set(it, (out.get(it) || 0) + (it[2] * w * cap) / it[8]);
    all += a * cap;
  }
  if (all > groupMax) for (const [it, e] of out) out.set(it, (e * groupMax) / all);
  for (const [k, slots] of dispatch || []) {
    const it = data.items[k];
    out.set(it, (out.get(it) || 0) + (it[2] * slots) / it[8]);
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
    const p = placeNear(names, x, z);
    return p && p.d < 1500 ? { name: p.name, near: p.d >= 400 } : { name: `grid ${pad3(x)} ${pad3(z)}`, near: false };
  };
  // buildings: 400 m clusters named after the nearest place; clusters with the same name are merged
  const cells = new Map();
  for (const it of buildingLayer._items) {
    const s = r.scores[it.i];
    if (!s) continue;
    const k = `${Math.floor(it.x / 400)},${Math.floor(it.z / 400)}`;
    const c = cells.get(k) || { s: 0, n: 0, x: 0, z: 0, bs: 0 };
    c.s += s; c.n++; c.x += it.x * s; c.z += it.z * s;
    if (it.bk) c.bs += s;
    cells.set(k, c);
  }
  const spots = new Map();
  for (const c of [...cells.values()].sort((a, b) => b.s - a.s)) {
    const x = c.x / c.s, z = c.z / c.s, { name, near } = nearest(x, z);
    const sp = spots.get(name);
    if (sp) { sp.share += c.s / r.total; sp.n += c.n; } else spots.set(name, { x, z, share: c.s / r.total, n: c.n, name, near, unit: "bldg", bunker: c.bs > c.s / 2 });
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
  if (label === BUNKER_Q) {
    // only the bunkers: drop every other building and the events
    r.total = r.max = r.evMax = 0;
    buildingLayer._items.forEach((it) => {
      if (!it.bk) r.scores[it.i] = 0;
      r.total += r.scores[it.i];
      r.max = Math.max(r.max, r.scores[it.i]);
    });
    r.ev = r.ev.map((e) => e.map(() => 0));
  }
  Object.assign(loot, { scores: r.scores, ev: r.ev, total: r.total, sums: r.sums, label: label.replace(/^All /, "") });
  if (loot.heat) loot.heat.remove();
  loot.heat = null;
  let html = "";
  if (label === BUNKER_Q) {
    // what the bunkers give together: the most likely items over all of them
    const sum = new Map();
    for (const it of buildingLayer._items) {
      if (!it.bk) continue;
      for (const [x, v] of buildingItems(data, it.i, it.ti)) sum.set(x, (sum.get(x) || 0) + v);
    }
    const tot = [...sum.values()].reduce((a, b) => a + b, 0);
    const n = buildingLayer._items.filter((it) => it.bk).length;
    html += `<p class="hint">${n} bunkers · usually ≈ ${Math.round(tot)} items in them at a time. Most likely finds:</p>` +
      `<ol class="loot-items">${[...sum].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([x, v]) =>
        `<li><span>${esc(x[7] || x[0])}</span><b>${(100 * v / tot).toFixed(1)}%</b></li>`).join("")}</ol>`;
  } else if (chosen.length === 1) {
    const it = chosen[0];
    const flags = (mask, list) => list.filter((n, i) => mask & (1 << i));
    const tiers = flags(it[4], data.values).map((v) => v.replace("Tier", "T")).join(" ") || "any tier";
    html += `<p class="hint">${esc(CAT_LABELS[data.cats[it[1]]] || data.cats[it[1]])} · nominal ${it[2]} · ` +
      `${it[3] === (1 << data.usages.length) - 1 ? "any building type" : esc(flags(it[3], data.usages).join(", "))} · ${esc(tiers)}` +
      `${it[6] ? " · <b>events only</b>" : !it[8] ? " · <b>no building can hold it</b>" : ""}</p>`;
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
      `<span>${s.near ? "near " : ""}${esc(s.name)}${s.bunker ? " (bunker)" : ""}</span>` +
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
  if (loot.sums) return loot.sums.dens(c[0], c[1], data.bu[it.i], data.bt[it.i])[0] ? "#7cfc00" : DIM_DOT;
  return DOT_KINDS[dotKind(c)][1];
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
  if (hit) return openBuildingPopup(hit, e.latlng);
  L.popup({ autoPanPadding: [16, 16] }).setLatLng(pt ? [pt.z, pt.x] : e.latlng)
    .setContent(pt ? popupHtml(pt.info) : `<div class="sub">${coordText(lng, lat)}</div>`).openOn(map);
});
map.on("popupclose", () => buildingLayer.select(null));
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!catalog.el.hidden) closeCatalog();
  else if (buildingLayer._hiType != null) buildingLayer.highlightType(null);
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
  else if (!layers[key].group.buildings && !layers[key].group.bunkers) setEnabled(key, true);
}
