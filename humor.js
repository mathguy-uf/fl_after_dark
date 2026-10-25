"use strict";

// FLORIDA AFTER DARK — HUMOR LAYER
// Keeps the core mystery intact while occasionally adding a dry Florida aside.
// This file deliberately does not alter game state or progression.

const floridaAsides = [
  { match: /alligator/i, line: "FLORIDA NOTE: The alligator has right of way. This is not a statute. It is simply how things work." },
  { match: /mosquito/i, line: "FLORIDA NOTE: The mosquito has now taken a small but controlling interest in your bloodstream." },
  { match: /raccoon/i, line: "FLORIDA NOTE: Local management has reviewed your complaint and eaten half of it." },
  { match: /armadillo/i, line: "FLORIDA NOTE: Its insurance information is probably not current." },
  { match: /ibis/i, line: "FLORIDA NOTE: The ibis remains Florida's least qualified parking-lot inspector." },
  { match: /pelican/i, line: "FLORIDA NOTE: Aerodynamic elegance was apparently optional." },
  { match: /manatee/i, line: "FLORIDA NOTE: This is the first creature tonight with a sensible schedule." },
  { match: /tarpon/i, line: "FLORIDA NOTE: Somewhere nearby, a fisherman has just become extremely opinionated." },
  { match: /grouper|redfish|snook/i, line: "FLORIDA NOTE: Mentioning fish in Florida automatically summons at least one unsolicited fishing story." },
  { match: /convenience store|gas station/i, line: "FLORIDA NOTE: The fluorescent lighting can be seen from low Earth orbit." },
  { match: /coffee/i, line: "FLORIDA NOTE: Legally coffee. Spiritually radiator fluid." },
  { match: /motel/i, line: "FLORIDA NOTE: Online reviews would describe this as 'quiet' and then stop abruptly." },
  { match: /payphone/i, line: "FLORIDA NOTE: You briefly wonder whether this call is covered by your unlimited plan." },
  { match: /headlights/i, line: "FLORIDA NOTE: Tailgating remains rude even when possibly supernatural." },
  { match: /weather report|forecast/i, line: "FLORIDA NOTE: The official forecast remains 'hot, wet, and somehow both at once.'" },
  { match: /lightning|thunder/i, line: "FLORIDA NOTE: Florida weather has entered the chat without knocking." },
  { match: /phone shows no service|no service/i, line: "FLORIDA NOTE: Your phone has chosen this exact moment to become a decorative rectangle." },
  { match: /frog/i, line: "FLORIDA NOTE: The frog has declined to elaborate." },
  { match: /tourist trains/i, line: "FLORIDA NOTE: Even the tourist train knows when to call it a night." },
  { match: /county 17|station 17/i, line: "FLORIDA NOTE: Naming mysterious infrastructure with a number has never made it less suspicious." },
  { match: /boiled peanuts/i, line: "FLORIDA NOTE: Boiled peanuts are either a snack or a personality test. Results vary." },
  { match: /boat ramp/i, line: "FLORIDA NOTE: Every Florida boat ramp has witnessed at least one argument about backing up a trailer." },
  { match: /suwannee|river/i, line: "FLORIDA NOTE: The river declines to explain what just splashed." },
  { match: /everglades|sawgrass/i, line: "FLORIDA NOTE: You are now outnumbered by things with excellent night vision." },
  { match: /space coast|launch|tower/i, line: "FLORIDA NOTE: In Florida, 'probably not aliens' still leaves a surprising amount of paperwork." }
];

const genericAsides = [
  "FLORIDA NOTE: This would sound less suspicious at 2:00 PM. Not much less.",
  "FLORIDA NOTE: You make a mental note to make better decisions tomorrow. Tomorrow has not agreed.",
  "FLORIDA NOTE: Somewhere, an air conditioner is working much harder than you are.",
  "FLORIDA NOTE: The humidity remains at approximately soup.",
  "FLORIDA NOTE: Nothing about this is improved by remembering you chose to be here.",
  "FLORIDA NOTE: A nearby palmetto bug is large enough to have opinions about zoning.",
  "FLORIDA NOTE: You briefly consider turning around. Florida considers this adorable.",
  "FLORIDA NOTE: At least parking is easy.",
  "FLORIDA NOTE: Your dashboard clock offers no useful emotional support.",
  "FLORIDA NOTE: Somewhere nearby is a Waffle House that has seen worse. Probably."
];

let lastNarrative = "";
let humorTimer = null;
let lastAside = "";

function chooseAside(text) {
  const specific = floridaAsides.find(entry => entry.match.test(text));
  if (specific && specific.line !== lastAside) return specific.line;

  // Keep the jokes intermittent so the strange scenes still have room to breathe.
  if (Math.random() > 0.28) return "";
  const choices = genericAsides.filter(line => line !== lastAside);
  return choices[Math.floor(Math.random() * choices.length)] || "";
}

function maybeAddFloridaAside() {
  const narrative = document.getElementById("narrative");
  if (!narrative) return;
  const text = narrative.textContent.trim();
  if (!text || text === lastNarrative || text.includes("FLORIDA NOTE:")) return;
  lastNarrative = text;

  const aside = chooseAside(text);
  if (!aside) return;
  lastAside = aside;
  narrative.textContent = `${text}\n\n${aside}`;
}

function scheduleHumorCheck() {
  clearTimeout(humorTimer);
  // Wait until the game's typewriter effect has stopped changing the narrative.
  humorTimer = setTimeout(maybeAddFloridaAside, 220);
}

document.addEventListener("DOMContentLoaded", () => {
  const narrative = document.getElementById("narrative");
  if (!narrative) return;
  new MutationObserver(scheduleHumorCheck).observe(narrative, { childList: true, characterData: true, subtree: true });
});
