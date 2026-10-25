"use strict";

// FLORIDA AFTER DARK — HUMOR LAYER
// Keeps the core mystery intact while occasionally adding a dry Florida aside.
// Also adds rare, deliberately over-the-top encounters with the legendary
// roadside figure known only as FLORIDA MAN.

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

const floridaManEncounters = [
  {
    text: "A man steps out from behind a palmetto bush as if he has been waiting for a bus that does not exist. He is shirtless, sunburned in several historically distinct layers, wearing faded jeans tucked into alligator-skin boots and three seashell necklaces of increasing authority. A mullet escapes from beneath a trucker cap reading CAPTAIN / NOT LEGALLY. He carries a cast net, a pool noodle, and what appears to be half of a ceiling fan.\n\n'Evenin',' he says. 'You ain't headed toward that radio tower, are you?'",
    choices: [
      { label: "WHY?", result: "He squints toward the horizon. 'Tower don't bother me. It's them frequencies. Frequencies get into your alternator, then your dreams, then next thing you know you're buying a pontoon boat.'\n\nHe nods gravely. 'Happened to my cousin Dale twice.'", time: 4, curiosity: 1 },
      { label: "WHAT IS THE CEILING FAN FOR?", result: "He looks at the ceiling fan as though noticing it for the first time. 'Emergency propeller.'\n\nYou wait.\n\n'Boat's at home.'\n\nYou wait longer.\n\n'Long story.'", time: 3 },
      { label: "KEEP DRIVING", result: "'Fair enough,' he says. 'If you see Dale, tell him the airboat ain't supposed to make that noise.'\n\nYou have no idea which noise. This feels intentional." }
    ]
  },
  {
    text: "Your headlights find a shirtless man beside a shopping cart fitted with two bicycle wheels, a trolling motor, and a Florida flag. He wears cutoff jeans, mirrored sunglasses despite the hour, alligator boots, and enough shark-tooth necklaces to concern a marine biologist. A live blue crab occupies the cart's child seat.\n\n'Battery died,' he explains. 'Not mine. The cart's.'",
    choices: [
      { label: "DOES THAT THING WORK?", result: "'Define work.'\n\nYou do not.\n\nHe pats the shopping cart. The trolling motor starts for half a second and plays three notes of what might be 'Free Bird.'\n\n'See?'", time: 4, curiosity: 1 },
      { label: "ASK ABOUT THE CRAB", result: "He looks offended. 'That's Dennis. Dennis is navigation.'\n\nDennis raises one claw toward Cedar Key.\n\n'Never been wrong.'", time: 3, curiosity: 1 },
      { label: "WISH HIM LUCK", result: "'Don't need luck,' he says, putting on a second pair of sunglasses over the first. 'Got jumper cables.'" }
    ]
  },
  {
    text: "At the edge of the road stands a shirtless man in jeans, snakeskin belt, alligator boots, and a necklace made from seashells, fishing swivels, and one hotel key card. His beard contains at least one leaf. He is holding a traffic cone under one arm and eating boiled peanuts from the other.\n\nHe points at your car. 'You hearin' the numbers too?'",
    choices: [
      { label: "WHAT NUMBERS?", result: "'Seventeen mostly.' He spits a peanut shell expertly into the traffic cone. 'Used to be nine, but nine moved to Tampa.'\n\nYou ask what that means.\n\n'Exactly.'", time: 4, curiosity: 2 },
      { label: "YES", result: "He nods with the exhausted satisfaction of a man whose least credible theory has finally acquired a witness. 'Knew it. Told Randy. Randy owes me a mullet.'\n\nYou are unsure whether he means the fish or the haircut.", time: 4, curiosity: 2 },
      { label: "NO", result: "'Good,' he says. 'Keep it that way.' He offers you a boiled peanut. You decline. 'Smart. These are from Tuesday.'" }
    ]
  },
  {
    text: "A figure waves you down using a fishing rod with a reflective vest tied to the end. He is shirtless except for a bright orange life jacket worn completely unbuckled, faded jeans, alligator boots, and a spectacular necklace of scallop shells. Behind him sits a riding lawn mower towing a kayak.\n\n'Road's fine,' he says before you can ask. 'Mower's fine too. Kayak's emotionally complicated.'",
    choices: [
      { label: "WHAT HAPPENED?", result: "'Tide came in.'\n\nYou look around. There is no visible ocean.\n\n'Yeah,' he says, following your gaze. 'That's the part we're investigatin'.'", time: 5, curiosity: 2 },
      { label: "NEED HELP?", result: "'Nah, cousin's comin'.'\n\n'When?'\n\n'Tuesday.'\n\nIt is not clear whether he means the upcoming Tuesday.", time: 3 },
      { label: "GOOD LUCK WITH THE KAYAK", result: "He pats the kayak gently. 'She'll come around. Just needs space.'" }
    ]
  },
  {
    text: "Someone has set up a folding lawn chair directly beneath a NO PARKING sign. In it sits a shirtless man wearing jeans, immaculate alligator boots, six seashell necklaces, and a camouflage cowboy hat decorated with tiny battery-powered Christmas lights. He is drinking something fluorescent from a gas-station cup.\n\nHe raises the cup. 'Careful south of here. Road gets weird.'",
    choices: [
      { label: "WEIRDER THAN THIS?", result: "He considers himself, the glowing hat, and the folding chair. 'Different category of weird.'\n\nThat is unexpectedly reassuring.", time: 3, curiosity: 1 },
      { label: "HOW WEIRD?", result: "'Last Thursday I drove past myself going the other direction.'\n\nHe takes a long sip. 'Nice truck.'", time: 4, curiosity: 2 },
      { label: "THANK HIM", result: "'Anytime.' He points at the NO PARKING sign. 'Government put this here so I'd know where my chair goes.'" }
    ]
  },
  {
    text: "A shirtless man emerges from the darkness carrying a five-gallon bucket labeled BAIT / TOOLS / IMPORTANT DOCUMENTS. He wears jeans held up by a rope, alligator boots polished to a courtroom shine, and a necklace of shells interspersed with spark plugs. A tiny American flag is tucked behind one ear.\n\n'You got jumper cables?' he asks. Then he glances behind him. 'Actually, never mind. That's not my truck.'",
    choices: [
      { label: "WHOSE TRUCK IS IT?", result: "He studies the abandoned pickup. 'Could be Wayne's. Could be federal. Wayne's truck got more stickers, though.'\n\nHe leans closer. 'Federal government's got terrible sticker discipline.'", time: 4 },
      { label: "WHAT'S IN THE BUCKET?", result: "He looks inside. 'Two spark plugs, shrimp, my birth certificate, and a socket wrench I found during a hurricane.'\n\nA pause.\n\n'Oh, and pudding.'", time: 3, curiosity: 1 },
      { label: "LEAVE", result: "'Drive safe!' he calls. 'And if anybody asks, we never discussed the pudding.'" }
    ]
  }
];

let lastNarrative = "";
let humorTimer = null;
let lastAside = "";
let floridaManSeen = 0;
let floridaManCooldown = 0;

function chooseAside(text) {
  const specific = floridaAsides.find(entry => entry.match.test(text));
  if (specific && specific.line !== lastAside) return specific.line;
  if (Math.random() > 0.28) return "";
  const choices = genericAsides.filter(line => line !== lastAside);
  return choices[Math.floor(Math.random() * choices.length)] || "";
}

function maybeAddFloridaAside() {
  const narrative = document.getElementById("narrative");
  if (!narrative) return;
  const text = narrative.textContent.trim();
  if (!text || text === lastNarrative || text.includes("FLORIDA NOTE:") || text.includes("FLORIDA MAN")) return;
  lastNarrative = text;

  const aside = chooseAside(text);
  if (!aside) return;
  lastAside = aside;
  narrative.textContent = `${text}\n\n${aside}`;
}

function scheduleHumorCheck() {
  clearTimeout(humorTimer);
  humorTimer = setTimeout(maybeAddFloridaAside, 220);
}

// Florida Man is intentionally uncommon. He can appear after travel or ordinary
// exploration, never at Station 17, and never in place of a required clue event.
function maybeMeetFloridaMan() {
  if (!game || !game.inProgress || !game.player) return false;
  if (game.player.location === "station17") return false;
  if (floridaManCooldown > 0) { floridaManCooldown -= 1; return false; }

  // Roughly one encounter every several scenes, with a small mercy boost if the
  // player has gone a long time without meeting him.
  const chance = floridaManSeen === 0 ? 0.12 : 0.07;
  if (random() >= chance) return false;

  const encounter = randomChoice(floridaManEncounters);
  floridaManSeen += 1;
  floridaManCooldown = 5;
  advanceTime(2);
  updateHUD();
  showNarrative(`FLORIDA MAN\n\n${encounter.text}`);
  showChoices(encounter.choices.map(choice => ({
    label: choice.label,
    action: () => {
      if (choice.time) advanceTime(choice.time);
      if (choice.curiosity) game.player.curiosity = Math.max(0, game.player.curiosity + choice.curiosity);
      updateHUD();
      showNarrative(choice.result);
      showChoices([
        { label: "CONTINUE", action: showLocationScene },
        { label: "RADIO", action: openRadio },
        { label: "MAP", action: openMap }
      ]);
    }
  })));
  return true;
}

// Wrap the game's existing encounter entry points without changing the core
// event data. Deliberate clue exploration always gets priority.
const originalTravelTo = travelTo;
travelTo = function floridaManTravelWrapper(key) {
  const beforeLocation = game.player && game.player.location;
  originalTravelTo(key);
  if (!game.inProgress || !game.player || game.player.location === beforeLocation) return;

  // The normal travel event is scheduled 350ms later when animations are on.
  // Check only when no event has taken over the choices after that delay.
  window.setTimeout(() => {
    const choices = document.getElementById("choices");
    if (!game.inProgress || !choices || choices.children.length === 0) return;
    const labels = Array.from(choices.querySelectorAll("button")).map(b => b.textContent).join(" ");
    if (/EXPLORE AREA/.test(labels)) maybeMeetFloridaMan();
  }, settings.motionDisabled ? 20 : 430);
};

const originalExploreCurrentLocation = exploreCurrentLocation;
exploreCurrentLocation = function floridaManExploreWrapper() {
  const key = game.player && game.player.location;
  // Never interrupt guaranteed clue chains.
  if (key && !clueEventFor(key) && maybeMeetFloridaMan()) return;
  originalExploreCurrentLocation();
};

document.addEventListener("DOMContentLoaded", () => {
  const narrative = document.getElementById("narrative");
  if (!narrative) return;
  new MutationObserver(scheduleHumorCheck).observe(narrative, { childList: true, characterData: true, subtree: true });
});
