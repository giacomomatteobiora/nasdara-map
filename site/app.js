// Nasdara map. World coordinates are DayZ metres: lat = Z (north), lng = X (east), 0..16384.
const WORLD = 16384;

const GROUPS = [
  {
    id: "b", file: "buildings", title: "Loot buildings", radius: 4, stroke: "#000", weight: 1,
    types: {
      Military: ["Military", "#e5484d", true],
      MilitaryEast: ["Military (East)", "#ff7a59", true],
      MilitaryWest: ["Military (West)", "#c13584", true],
      Police: ["Police", "#3e8ef7", true],
      Medic: ["Medical", "#ff6fb5", true],
      Firefighter: ["Fire station", "#ff9f1a", false],
      Industrial: ["Industrial", "#9aa3ad", false],
      Town: ["Town", "#f2d14b", false],
      Village: ["Village", "#f5efe0", false],
      Farm: ["Farm", "#7ccf5a", false],
      Hunting: ["Hunting", "#2e8b57", false],
      Coast: ["Coast", "#39c5cf", false],
      Office: ["Office", "#a78bfa", false],
      School: ["School", "#8b5cf6", false],
      Prison: ["Prison", "#6b7280", false],
      Historical: ["Historical", "#d4a373", false],
      Other: ["Other (wrecks etc.)", "#555c66", false],
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
];

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
const renderer = L.canvas({ padding: 0.5, tolerance: 4 });

const bases = {
  sat: L.tileLayer("tiles/sat/{z}/{x}/{y}.jpg", { maxNativeZoom: 6, maxZoom: 8, bounds, noWrap: true }),
  paper: L.tileLayer("tiles/paper/{z}/{x}/{y}.jpg", { maxNativeZoom: 4, maxZoom: 8, bounds, noWrap: true }),
};
let base = "sat";

// ---- helpers ----
const pad3 = (n) => String(Math.max(0, Math.floor(n / 100))).padStart(3, "0");
const coordText = (x, z) => `X ${Math.round(x)} · Z ${Math.round(z)} · grid ${pad3(x)} ${pad3(z)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const prettyClass = (s) => s.replace(/_/g, " ");

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
  entry.built = true;
  return entry.layer;
}

async function setEnabled(key, on) {
  const entry = layers[key];
  if (on) {
    enabled.add(key);
    await buildLayer(key);
    if (enabled.has(key)) {
      entry.layer.addTo(map);
      restack();
    }
  } else {
    enabled.delete(key);
    entry.layer.remove();
  }
  writeHash();
}

// The shared canvas draws in insertion order: keep spawns at the bottom, then buildings, vehicles, events on top.
const STACK = ["b", "v", "e"];
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
    const layer = L.featureGroup();
    layer.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      L.popup().setLatLng(e.latlng).setContent(popupHtml(e.layer.info)).openOn(map);
    });
    layers[key] = { layer, built: false, group: g, type };

    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox"><span class="swatch${g.square ? " square" : ""}" style="background:${color}"></span>` +
      `<span>${esc(label)}</span><span class="count"></span></label>`;
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
    let total = 0;
    for (const b of boxes) {
      const n = (data[b.type] || []).length;
      total += n;
      b.countEl.textContent = n.toLocaleString();
      b.li.hidden = n === 0;
    }
    totalEl.textContent = total.toLocaleString();
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
  L.popup().setLatLng(e.latlng).setContent(`<div class="sub">${coordText(lng, lat)}</div>`).openOn(map);
});
map.on("moveend", writeHash);

// ---- start ----
bases[base].addTo(map);
if (initialView) map.setView(initialView.center, initialView.zoom);
else map.fitBounds(bounds.pad(-0.08));
for (const key of [...enabled]) if (layers[key]) setEnabled(key, true); else enabled.delete(key);
