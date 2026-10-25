"use strict";

// FLORIDA AFTER DARK — APPLE II-STYLE MAP
// Draws at a deliberately tiny 280x192 logical resolution, then lets CSS scale
// the canvas with nearest-neighbor pixels. The result evokes an Apple II hi-res
// adventure illustration without copying art from any particular game.

const MAP_W = 280;
const MAP_H = 192;

const mapPoints = {
  gainesville: [104, 36],
  paynesPrairie: [108, 48],
  suwanneeRiver: [73, 39],
  cedarKey: [48, 61],
  oldFishingPier: [35, 75],
  citrusStand: [89, 57],
  ocalaForest: [121, 66],
  boatRamp: [76, 73],
  abandonedMotel: [137, 82],
  stAugustine: [174, 67],
  spaceCoast: [188, 101],
  evergladesRoad: [177, 139],
  keysCauseway: [160, 171],
  station17: [205, 151]
};

function pixelColor() {
  const css = getComputedStyle(document.body);
  return css.getPropertyValue("--bright").trim() || "#c1ffcb";
}

function dimPixelColor() {
  const css = getComputedStyle(document.body);
  return css.getPropertyValue("--muted").trim() || "#42b953";
}

function mapBackgroundColor() {
  const css = getComputedStyle(document.body);
  return css.getPropertyValue("--bg").trim() || "#020602";
}

function plotLine(ctx, x1, y1, x2, y2, color, dash = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash ? [2, 3] : []);
  ctx.beginPath();
  ctx.moveTo(Math.round(x1) + .5, Math.round(y1) + .5);
  ctx.lineTo(Math.round(x2) + .5, Math.round(y2) + .5);
  ctx.stroke();
  ctx.restore();
}

function drawFlorida(ctx, bright, dim) {
  // Chunky Florida silhouette: panhandle, peninsula, Keys. Intentionally low-res.
  const outline = [
    [21, 25],[40, 23],[57, 26],[76, 24],[94, 28],[112, 27],[127, 31],[139, 29],
    [151, 35],[158, 46],[166, 56],[173, 70],[181, 83],[190, 96],[195, 111],
    [196, 126],[191, 140],[183, 153],[174, 163],[164, 171],[153, 174],[148, 167],
    [151, 153],[149, 139],[144, 124],[139, 110],[134, 96],[126, 84],[117, 76],
    [106, 68],[94, 62],[82, 57],[69, 52],[56, 49],[43, 45],[31, 39],[21, 34]
  ];
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.36)";
  ctx.strokeStyle = dim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  outline.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sparse one-pixel dithering gives the old computer-illustration texture.
  ctx.fillStyle = dim;
  for (let y = 30; y < 166; y += 5) {
    for (let x = 28 + (y % 10 ? 2 : 0); x < 188; x += 7) {
      if (ctx.isPointInPath(x, y) && ((x * 3 + y) % 11 < 5)) ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.restore();

  // Gulf / Atlantic wave marks and Keys dots.
  ctx.fillStyle = dim;
  [[18,65],[23,68],[16,102],[23,105],[205,78],[214,81],[211,116],[220,119],[145,181],[151,179],[157,181]].forEach(([x,y]) => ctx.fillRect(x,y,4,1));
  [[153,176],[158,179],[164,181],[170,183],[177,184]].forEach(([x,y]) => ctx.fillRect(x,y,2,1));

  ctx.fillStyle = bright;
  ctx.font = "7px monospace";
  ctx.fillText("GULF", 12, 91);
  ctx.fillText("ATLANTIC", 208, 101);
}

function drawRoadMap() {
  const canvas = document.getElementById("pixel-map-canvas");
  if (!canvas || !game || !game.player) return;
  const ctx = canvas.getContext("2d");
  const bright = pixelColor();
  const dim = dimPixelColor();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, MAP_W, MAP_H);
  ctx.fillStyle = mapBackgroundColor();
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  drawFlorida(ctx, bright, dim);

  const discovered = new Set(game.player.discoveredLocations || []);
  const drawnEdges = new Set();

  Object.entries(locations).forEach(([key, loc]) => {
    if (!discovered.has(key)) return;
    const a = mapPoints[key];
    if (!a) return;
    loc.connections.forEach(neighbor => {
      if (!discovered.has(neighbor) || !mapPoints[neighbor]) return;
      const edge = [key, neighbor].sort().join("|");
      if (drawnEdges.has(edge)) return;
      drawnEdges.add(edge);
      const b = mapPoints[neighbor];
      plotLine(ctx, a[0], a[1], b[0], b[1], dim, locations[neighbor].hidden || loc.hidden);
    });
  });

  Object.entries(locations).forEach(([key, loc]) => {
    if (!discovered.has(key) || !mapPoints[key]) return;
    const [x,y] = mapPoints[key];
    const current = game.player.location === key;
    ctx.fillStyle = current ? bright : dim;
    ctx.fillRect(x - (current ? 2 : 1), y - (current ? 2 : 1), current ? 5 : 3, current ? 5 : 3);
    if (current) {
      ctx.strokeStyle = bright;
      ctx.strokeRect(x - 4.5, y - 4.5, 9, 9);
    }
  });

  // Compact labels: enough to orient the player without turning the image into text soup.
  ctx.font = "6px monospace";
  ctx.fillStyle = bright;
  const labels = [
    ["gainesville","GAINESVILLE",110,33], ["cedarKey","CEDAR KEY",19,58],
    ["ocalaForest","OCALA",126,62], ["stAugustine","ST AUG",180,65],
    ["spaceCoast","SPACE COAST",198,99], ["evergladesRoad","EVERGLADES",188,137],
    ["keysCauseway","KEYS",133,178], ["station17","STN 17",212,151]
  ];
  labels.forEach(([key,text,x,y]) => { if (discovered.has(key)) ctx.fillText(text,x,y); });

  ctx.fillStyle = dim;
  ctx.fillText("* ROADS SHOWN ONLY AFTER DISCOVERY", 7, 188);
}

function renderAppleMap() {
  const map = document.getElementById("map-content");
  if (!map || !game || !game.player) return;
  map.replaceChildren();

  const frame = document.createElement("div");
  frame.className = "apple-map-frame";
  const canvas = document.createElement("canvas");
  canvas.id = "pixel-map-canvas";
  canvas.className = "pixel-map-canvas";
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `Pixel map of discovered Florida roads. Current location: ${locations[game.player.location].name}.`);
  frame.appendChild(canvas);

  const legend = document.createElement("div");
  legend.className = "apple-map-legend";
  legend.innerHTML = `<span>□ CURRENT: ${locations[game.player.location].name}</span><span>■ DISCOVERED</span><span>··· UNKNOWN ROADS OMITTED</span>`;

  map.append(frame, legend);
  const list=document.createElement("ul"); list.className="route-list";
  for(const key of game.player.discoveredLocations){
    const loc=locations[key]; if(!loc)continue;
    const row=document.createElement("li");
    row.textContent=loc.name+": "+loc.connections.filter(k=>game.player.discoveredLocations.includes(k)).map(k=>locations[k].name).join(" / ");
    list.appendChild(row);
  }
  map.appendChild(list);
  drawRoadMap();
}

// Replace the original card-grid renderer while keeping the game's existing
// openMap() function and every MAP / VIEW MAP button wired to the same action.
renderMap = renderAppleMap;
