"use strict";

// Extra Apple II-style illustrations for the three-act mystery.
// This wraps scenes.js rather than duplicating its location art.

function storySceneCanvas() {
  const canvas = document.getElementById("scene-canvas");
  const frame = document.getElementById("scene-frame");
  if (!canvas || !frame) return null;
  return { canvas, frame, ctx: canvas.getContext("2d"), c: sceneColors() };
}

function clearStoryScene(ctx, c) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

function drawStoryLetter(ctx, c) {
  stars(ctx, c.dim, 10);
  ctx.strokeStyle = c.dim;
  ctx.strokeRect(38, 24, 204, 82);
  pxLine(ctx, 38, 24, 140, 70, c.dim);
  pxLine(ctx, 242, 24, 140, 70, c.dim);
  ctx.fillStyle = c.bright;
  ctx.font = "8px monospace";
  ctx.fillText("TO: YOU", 91, 51);
  ctx.fillText("STATION 17", 91, 66);
  ctx.fillStyle = c.dim;
  ctx.fillText("HANDWRITING: FAMILIAR", 69, 96);
}

function drawStoryArchive(ctx, c) {
  ctx.strokeStyle = c.dim;
  ctx.strokeRect(24, 18, 104, 100);
  for (let y = 25; y < 111; y += 28) {
    ctx.strokeRect(31, y, 90, 22);
    ctx.fillRect(70, y + 9, 12, 2);
  }
  ctx.fillStyle = c.bright;
  ctx.font = "8px monospace";
  ctx.fillText("FLORIDA MAN", 34, 15);

  // A deliberately unreadable fan of old newspaper clippings.
  for (let i = 0; i < 4; i++) {
    const x = 147 + i * 13, y = 26 + i * 17;
    ctx.strokeStyle = i === 3 ? c.bright : c.dim;
    ctx.strokeRect(x, y, 92, 55);
    ctx.fillStyle = i === 3 ? c.bright : c.dim;
    ctx.fillRect(x + 7, y + 8, 65, 2);
    ctx.fillRect(x + 7, y + 15, 74, 1);
    ctx.fillRect(x + 7, y + 20, 58, 1);
    ctx.strokeRect(x + 9, y + 28, 22, 18);
  }
  ctx.fillStyle = c.bright;
  ctx.fillText("SAME FACE", 183, 117);
}

function drawStoryMonitor(ctx, c) {
  ctx.strokeStyle = c.bright;
  ctx.strokeRect(34, 13, 211, 92);
  ctx.strokeRect(43, 22, 193, 73);
  ctx.fillStyle = c.dim;
  ctx.font = "7px monospace";
  ctx.fillText("CAM 17   +00:17:00", 49, 32);

  // Parking-lot horizon and tiny car.
  pxLine(ctx, 48, 77, 231, 77, c.dim);
  ctx.strokeRect(68, 61, 54, 14);
  ctx.fillRect(75, 75, 9, 3);
  ctx.fillRect(106, 75, 9, 3);

  // Crude Florida-Man silhouette on the monitor.
  ctx.strokeStyle = c.bright;
  ctx.beginPath(); ctx.arc(172, 49, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.fillRect(169, 55, 7, 18);
  pxLine(ctx, 170, 59, 160, 69, c.bright);
  pxLine(ctx, 175, 59, 184, 69, c.bright);
  pxLine(ctx, 170, 73, 165, 79, c.bright);
  pxLine(ctx, 175, 73, 180, 79, c.bright);
  ctx.strokeRect(188, 62, 14, 16);
  ctx.fillStyle = c.dim;
  ctx.fillText("BAIT", 187, 86);

  ctx.fillStyle = c.bright;
  ctx.font = "8px monospace";
  ctx.fillText("SUBJECT: YOU", 93, 118);
}

function drawStoryBucket(ctx, c) {
  stars(ctx, c.dim, 14);
  ctx.strokeStyle = c.bright;
  ctx.strokeRect(102, 31, 78, 75);
  ctx.beginPath(); ctx.ellipse(141, 31, 39, 9, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(141, 58, 48, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.fillStyle = c.bright;
  ctx.font = "8px monospace";
  ctx.fillText("BAIT", 126, 58);
  ctx.fillText("TOOLS", 122, 70);
  ctx.fillText("IMPORTANT", 112, 82);
  ctx.fillText("DOCUMENTS", 110, 94);
  ctx.fillStyle = c.dim;
  for (let x = 95; x < 192; x += 8) ctx.fillRect(x, 112 + (x % 3), 5, 1);
  ctx.fillText("WET", 133, 122);
}

function drawStoryLoop(ctx, c) {
  stars(ctx, c.dim, 20);
  road(ctx, c.bright);
  car(ctx, c.dim);
  ctx.strokeStyle = c.bright;
  ctx.strokeRect(202, 73, 42, 26);
  ctx.fillStyle = c.bright;
  ctx.font = "8px monospace";
  ctx.fillText("LETTER", 207, 88);
  ctx.fillStyle = c.dim;
  ctx.fillText("12:47 AM", 10, 118);
  ctx.fillText("AGAIN", 224, 118);
}

const baseStorySceneRender = renderScene;
renderScene = function renderStoryScene(text) {
  if (!game.inProgress) return;
  const t = String(text || "").toLowerCase();
  let kind = "";
  if (/envelope|handwriting is yours|meet me at station 17/.test(t) && !/incident archive/.test(t)) kind = "letter";
  if (/incident archive|newspaper clippings|metal file drawer/.test(t)) kind = "archive";
  if (/security monitor|security tape|cam 17|timestamp is seventeen minutes ahead/.test(t)) kind = "monitor";
  if (/five-gallon bucket|bring my bucket|bucket beside the door/.test(t) && /wet|important documents/.test(t)) kind = "bucket";
  if (/ending: the other driver|12:47 am\.\s*gainesville/.test(t)) kind = "loop";
  if (!kind) return baseStorySceneRender(text);

  const out = storySceneCanvas();
  if (!out) return;
  const { canvas, frame, ctx, c } = out;
  clearStoryScene(ctx, c);
  if (kind === "letter") drawStoryLetter(ctx, c);
  if (kind === "archive") drawStoryArchive(ctx, c);
  if (kind === "monitor") drawStoryMonitor(ctx, c);
  if (kind === "bucket") drawStoryBucket(ctx, c);
  if (kind === "loop") drawStoryLoop(ctx, c);
  frame.hidden = false;
  canvas.setAttribute("aria-label", `Apple II-style pixel illustration of the ${kind} story scene.`);
};

