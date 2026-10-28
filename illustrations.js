"use strict";

// Approved art is kept intact in two atlases. Source rectangles exclude the
// contact-sheet titles, borders and captions; no generated text enters the UI.
const ILLUSTRATION_ATLASES = Object.freeze({
  landmarks: "assets/art/florida-landmarks.webp",
  story: "assets/art/florida-story.webp"
});
const illustrationCells = [
  [9, 46, 500, 210], [516, 46, 505, 210], [1029, 46, 498, 210],
  [9, 288, 500, 215], [516, 288, 505, 215], [1029, 288, 498, 215],
  [9, 540, 500, 209], [516, 540, 505, 209], [1029, 540, 498, 209],
  [9, 782, 500, 210], [516, 782, 505, 210], [1029, 782, 498, 210]
];
function illustration(atlas, cell, description) {
  return Object.freeze({ atlas, rect: Object.freeze([...illustrationCells[cell]]), description });
}
const SCENE_ILLUSTRATIONS = Object.freeze({
  gainesville: illustration("landmarks", 0, "UF Century Tower among Gothic campus buildings and mossy live oaks, with a parked sedan"),
  paynesPrairie: illustration("landmarks", 1, "a bison on Paynes Prairie, with the wooden observation tower beyond"),
  citrusStand: illustration("landmarks", 2, "a roadside citrus stand with orange crates, a payphone and a US 441 sign"),
  suwanneeRiver: illustration("landmarks", 3, "June beside her stalled pickup, with the Suwannee railroad trestle across the river"),
  oldFishingPier: illustration("landmarks", 4, "a fisherman and pelican on a wooden pier, with Cedar Key waterfront buildings beyond"),
  abandonedMotel: illustration("landmarks", 5, "an abandoned motel with a vacancy sign and numbered doors"),
  spaceCoast: illustration("landmarks", 6, "Kennedy Space Center's Vehicle Assembly Building beyond the water"),
  evergladesRoad: illustration("landmarks", 7, "an alligator beside an Everglades road, with a Shark Valley-inspired tower in the distance"),
  keysCauseway: illustration("landmarks", 8, "the parallel Seven Mile bridges, a pelican, and Fred the Tree on the old span"),
  station17: illustration("landmarks", 9, "the fictional Station 17 relay building and radio tower"),
  archive: illustration("landmarks", 10, "incident files, newspaper clippings, tape reels and a monitor in the relay archive"),
  floridaMan: illustration("landmarks", 11, "the other driver wearing a shell necklace and boots, carrying a bucket beside his car"),
  ocalaForest: illustration("story", 0, "a wooded Ocala Forest road with a Juniper Springs sign"),
  cedarKey: illustration("story", 1, "Cedar Key-inspired waterfront buildings on pilings and a moored fishing boat"),
  stAugustine: illustration("story", 2, "a stone lion at St. Augustine's Bridge of Lions"),
  boatRamp: illustration("story", 3, "a deserted concrete boat ramp, tire tracks, a dock and cypress knees"),
  letter: illustration("story", 4, "a damp envelope and handwritten page on the car's passenger seat"),
  monitor: illustration("story", 5, "a security monitor showing a car and an indistinct figure carrying a bucket"),
  bucket: illustration("story", 6, "a five-gallon bucket holding damp envelopes on a wet floor"),
  road: illustration("story", 7, "the view from a car dashboard down a dark road beneath live oaks"),
  loop: illustration("story", 8, "an envelope, a dashboard clock reading 12:47, and Gainesville outside"),
  phone: illustration("story", 9, "a weathered payphone beside citrus crates"),
  tape: illustration("story", 10, "a cassette player on a chair in an empty motel room"),
  family: illustration("story", 11, "a parent beside a station wagon and a child holding a postcard")
});
const ILLUSTRATION_ALIASES = Object.freeze({ motel: "abandonedMotel", tower: "station17" });
const illustrationLoads = new Map();

function illustrationFor(art) {
  // A close crop isolates the alligator without moving a prairie encounter to
  // Shark Valley. The interactive route map remains drawn from actual game state.
  if (art === "alligator") return { atlas: "landmarks", rect: [519, 628, 385, 119], description: "an alligator resting beside dark wetland water" };
  return SCENE_ILLUSTRATIONS[ILLUSTRATION_ALIASES[art] || art] || SCENE_ILLUSTRATIONS.road;
}

function loadIllustrationAtlas(key) {
  if (illustrationLoads.has(key)) return illustrationLoads.get(key);
  const state = { image: null, status: "loading" };
  illustrationLoads.set(key, state);
  if (typeof Image === "undefined") return state; // Headless story-test harness.
  const image = new Image();
  state.image = image;
  image.onload = () => {
    state.status = "ready";
    // Resolve the CURRENT scene after loading, never the scene that requested it.
    renderTitleIllustration();
    if (typeof renderScene === "function") renderScene();
  };
  image.onerror = () => {
    state.status = "error";
    renderTitleIllustration();
    if (typeof renderScene === "function") renderScene();
  };
  image.src = ILLUSTRATION_ATLASES[key];
  return state;
}

function drawIllustratedScene(ctx, colors, art) {
  const spec = illustrationFor(art), state = loadIllustrationAtlas(spec.atlas);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  if (state.status === "ready") {
    // Fit rather than stretch: the alligator detail and differently sized atlas
    // cells retain their proportions, with small unobtrusive black margins.
    const [x, y, w, h] = spec.rect;
    const scale = Math.min(SCENE_W / w, SCENE_H / h);
    const dw = Math.round(w * scale), dh = Math.round(h * scale);
    ctx.drawImage(state.image, x, y, w, h,
      Math.floor((SCENE_W - dw) / 2), Math.floor((SCENE_H - dh) / 2), dw, dh);
  } else {
    ctx.fillStyle = colors.dim;
    ctx.font = "12px monospace";
    ctx.fillText(state.status === "error" ? "SCENE ART UNAVAILABLE" : "LOADING SCENE ART...", 16, SCENE_H / 2);
  }
  return state.status;
}

function renderTitleIllustration() {
  const canvas = document.getElementById("title-scene");
  if (!canvas || typeof canvas.getContext !== "function") return;
  drawIllustratedScene(canvas.getContext("2d"), sceneColors(), "gainesville");
}

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(ILLUSTRATION_ATLASES).forEach(loadIllustrationAtlas);
  renderTitleIllustration();
});
