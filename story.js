"use strict";

// FLORIDA AFTER DARK — THREE-ACT STORY LAYER
// Gives the procedural night a beginning, escalating middle, and a looped ending.
// The player never meets a separate Florida Man. The mystery is that the stories
// have been describing the player — sometimes tonight, sometimes years ago.

ITEM_LABELS.mysteryLetter = "creased envelope addressed in your handwriting";

function freshStoryState() {
  return {
    version: 1,
    act: 1,
    letterRead: false,
    letterBackRead: false,
    finalizing: false,
    flags: {},
    evidence: [],
    actionLog: [],
    currentEventId: null
  };
}

function ensureStoryState() {
  if (!game.story || typeof game.story !== "object") game.story = freshStoryState();
  game.story.flags ||= {};
  game.story.evidence ||= [];
  game.story.actionLog ||= [];
  return game.story;
}

function rememberEvidence(id) {
  const s = ensureStoryState();
  if (!s.evidence.includes(id)) s.evidence.push(id);
}

function addStoryAction(choice) {
  const s = ensureStoryState();
  if (!game.player || !choice || !choice.label) return;
  s.actionLog.push({
    event: s.currentEventId || "roadside",
    choice: choice.label,
    location: game.player.location,
    time: game.player.time
  });
  s.actionLog = s.actionLog.slice(-12);
}

function storyActionSummary() {
  const s = ensureStoryState();
  const rows = s.actionLog.slice(-5).map(entry => {
    const loc = locations[entry.location]?.name || "UNKNOWN";
    return `• ${formatTime(entry.time)} / ${loc.toUpperCase()} / ${entry.choice}`;
  });
  return rows.length ? rows.join("\n") : "• NO INCIDENTS RECORDED\n  (THIS IS OBVIOUSLY INCORRECT.)";
}

function openTheLetter() {
  const s = ensureStoryState();
  s.letterRead = true;
  showNarrative(
    "The envelope is addressed to you.\n\n" +
    "The handwriting is yours.\n\n" +
    "MEET ME AT STATION 17.\n\n" +
    "Take 441 south.\n" +
    "Don't use the interstate.\n" +
    "Listen to the radio.\n\n" +
    "You know the way.\n\n" +
    "There is no signature."
  );
  showChoices([
    { label: "TURN LETTER OVER", action: readBackOfLetter },
    { label: "PUT IT IN THE GLOVE BOX", action: beginTheDrive }
  ]);
}

function readBackOfLetter() {
  const s = ensureStoryState();
  s.letterBackRead = true;
  showNarrative(
    "You turn the letter over.\n\n" +
    "Three words are written across the back in different ink:\n\n" +
    "BRING MY BUCKET.\n\n" +
    "You do not own a bucket.\n\n" +
    "This does not make the message less specific."
  );
  showChoices([{ label: "START SOUTH", action: beginTheDrive }]);
}

function beginTheDrive() {
  const s = ensureStoryState();
  s.flags.driveStarted = true;
  showNarrative(
    "The gas station behind you has already turned off its lights.\n" +
    "The road south is empty.\n" +
    "Your radio keeps losing the station.\n" +
    "The letter sits in the glove box.\n" +
    "You should probably go home.\n" +
    "You don't."
  );
  baseStoryShowLocationActions();
  setStatus("OBJECTIVE: FIND STATION 17. LISTEN TO THE RADIO.");
}

// --- Beginning ---------------------------------------------------------------
const baseStoryBeginNight = beginNight;
beginNight = function storyBeginNight() {
  baseStoryBeginNight();
  game.story = freshStoryState();
  if (!game.player.inventory.includes("mysteryLetter")) game.player.inventory.push("mysteryLetter");
  showNarrative(
    "The gas station behind you goes dark.\n\n" +
    "On the passenger seat is an envelope that was not there when you stopped for gas.\n\n" +
    "Your name is written on the front.\n\n" +
    "The handwriting is yours."
  );
  showChoices([
    { label: "OPEN THE LETTER", action: openTheLetter },
    { label: "DRIVE HOME", action: () => endGame("home") }
  ]);
  setStatus("There is a letter on the passenger seat.");
};

// Stop the humor layer from spawning a separate literal Florida Man. The joke
// now works as a mystery: witnesses and records describe somebody who is always
// just ahead of you.
if (typeof maybeMeetFloridaMan === "function") {
  maybeMeetFloridaMan = function storySuppressFloridaManNPC() { return false; };
}

if (typeof chooseAside === "function") {
  const baseStoryChooseAside = chooseAside;
  chooseAside = function storyAwareAside(text) {
    const s = ensureStoryState();
    if (
      s.finalizing ||
      game.scene?.serious ||
      !game.inProgress ||
      game.scene?.kind === "function" ||
      game.scene?.kind === "decision" ||
      game.player?.location === "station17" ||
      !s.flags.driveStarted ||
      /MEET ME AT STATION 17|BRING MY BUCKET|SECURITY MONITOR|INCIDENT ARCHIVE|ENDING:|letter sits in the glove box|handwriting is yours/i.test(text)
    ) return "";
    return baseStoryChooseAside(text);
  };
}

// Track the event currently on screen, then remember the player's actual
// choices. The Station 17 archive uses this log in the reveal.
const baseStoryTriggerEvent = triggerEvent;
triggerEvent = function storyTriggerEvent(key, deliberate = false) {
  baseStoryTriggerEvent(key, deliberate);
  const s = ensureStoryState();
  s.currentEventId = game.eventHistory[game.eventHistory.length - 1] || null;
};

const baseStoryResolveChoice = resolveChoice;
resolveChoice = function storyResolveChoice(choice) {
  addStoryAction(choice);
  baseStoryResolveChoice(choice);
};

// --- Middle ------------------------------------------------------------------
// These deterministic interludes sit between the procedural encounters. They
// borrow recognizable, non-gruesome Florida-Man folklore while gradually making
// the descriptions match the player.
function pierRecognition() {
  const s = ensureStoryState(); s.flags.pierRecognition = true; s.act = Math.max(s.act, 2); rememberEvidence("pier");
  showNarrative(
    "The fisherman at the end of the pier looks up and frowns.\n\n" +
    "'You're back.'\n\n" +
    "You tell him you have never been here.\n\n" +
    "'Okay,' he says, in the tone people use when they have decided not to argue.\n\n" +
    "He says last time you spent twenty minutes asking whether a twelve-foot alligator tied to a tree legally counted as a pet.\n\n" +
    "You tell him that definitely was not you.\n\n" +
    "He looks at your car. Then at you.\n\n" +
    "'Okay.'"
  );
  showChoices([{ label: "ASK WHAT ELSE I DID", action: () => {
    showResult("'Mostly argued with the alligator,' he says. 'Alligator had the stronger case.'\n\nThen he asks whether the redfish are running, as if the conversation is finished.");
  }}, { label: "LEAVE THIS ALONE", action: baseStoryShowLocationActions }]);
  return true;
}

function motelRegister() {
  const s = ensureStoryState(); s.flags.motelRegister = true; s.act = Math.max(s.act, 2); rememberEvidence("motel");
  showNarrative(
    "The motel office is unlocked.\n\n" +
    "The register contains one guest entry for tonight.\n\n" +
    "YOUR NAME.\n" +
    "YOUR CAR.\n" +
    "ROOM 17.\n\n" +
    "Under NOTES someone has written:\n\n" +
    "NO MORE 911 CALLS ASKING FOR A RIDE HOME.\n\n" +
    "You have never called 911 for a ride home.\n\n" +
    "You are suddenly less certain that this is the first time you have said that sentence."
  );
  showChoices([{ label: "CHECK THE HANDWRITING", action: () => {
    showResult("It matches the letter.\n\nIt also matches yours.");
  }}, { label: "BACK AWAY FROM THE REGISTER", action: baseStoryShowLocationActions }]);
  return true;
}

function gatorHeadline() {
  const s = ensureStoryState(); s.flags.gatorHeadline = true; s.act = Math.max(s.act, 2); rememberEvidence("gatorHeadline");
  showNarrative(
    "Every radio station cuts to the same local-news recording.\n\n" +
    "ARCHIVE REPORT — DATE UNREADABLE\n\n" +
    "A man drove up to a fast-food window and an alligator went through the open drive-through window.\n\n" +
    "The announcer calls it one of the strangest Florida stories ever recorded.\n\n" +
    "Then the recording describes the vehicle.\n\n" +
    "Same make. Same color. Same license plate.\n\n" +
    "Your license plate.\n\n" +
    "The recording is older than your car."
  );
  showChoices([{ label: "CHECK MY PLATE", action: () => {
    showResult("You check twice.\n\nThe plate is correct.\n\nFrom the radio, very softly:\n\n'Seventeen.'");
  }}, { label: "TURN OFF THE RADIO", action: baseStoryShowLocationActions }]);
  return true;
}

function roadEcho() {
  const s = ensureStoryState(); s.flags.roadEcho = true; s.act = Math.max(s.act, 2); rememberEvidence("roadEcho");
  const last = s.actionLog[s.actionLog.length - 1];
  const echo = last ? `${last.choice}. ${locations[last.location]?.name || "UNKNOWN"}.` : "KEEP DRIVING.";
  showNarrative(
    "107.9 FM turns itself on.\n\n" +
    "No numbers this time.\n\n" +
    `A calm voice says: '${echo}'\n\n` +
    "That is what you did.\n\n" +
    "Not approximately. Not the same kind of thing.\n\n" +
    "Exactly what you did.\n\n" +
    "The voice adds:\n\n" +
    "'SUBJECT CONTINUES SOUTH.'"
  );
  showChoices([{ label: "WHO IS SUBJECT?", action: () => {
    showResult("Static.\n\nThen a voice, almost familiar, answers:\n\n'Subject seventeen.'");
  }}, { label: "KEEP DRIVING", action: baseStoryShowLocationActions }]);
  return true;
}

function routeRevelation() {
  const s = ensureStoryState(); s.flags.routeRevelation = true; s.act = 3; rememberEvidence("route");
  showNarrative(
    "You unfold the road map.\n\n" +
    "A route has been drawn from the Everglades to a place that was not on the paper before:\n\n" +
    "STATION 17.\n\n" +
    "Beside it, in pencil:\n\n" +
    "YOU KNOW THE WAY.\n\n" +
    "The handwriting matches the letter.\n\n" +
    "It matches yours."
  );
  showChoices([{ label: "GO FIND STATION 17", action: baseStoryShowLocationActions }]);
  setStatus("ACT III // ROUTE DISCOVERED: STATION 17.");
  return true;
}

function maybeStoryInterlude() {
  const s = ensureStoryState();
  if (!game.inProgress || !game.player || s.finalizing ||
      game.scene?.serious ||
      !game.inProgress ||
      game.scene?.kind === "function" ||
      game.scene?.kind === "decision" ||
      game.player?.location === "station17" || !s.flags.driveStarted) return false;
  const key = game.player.location;

  if (key === "oldFishingPier" && !s.flags.pierRecognition) return pierRecognition();
  if (key === "abandonedMotel" && !s.flags.motelRegister) return motelRegister();
  if (key === "spaceCoast" && !s.flags.gatorHeadline && s.evidence.length >= 1) return gatorHeadline();
  if (key === "evergladesRoad" && !s.flags.roadEcho && s.evidence.length >= 2) return roadEcho();
  if (game.player.discoveredLocations.includes("station17") && !s.flags.routeRevelation) return routeRevelation();
  return false;
}

const baseStoryShowLocationActions = showLocationActions;
showLocationActions = function storyShowLocationActions() {
  if (maybeStoryInterlude()) return;
  baseStoryShowLocationActions();
};

// The special frequencies become more personal as the acts progress.
const baseStoryRenderRadio = renderRadio;
renderRadio = function storyRenderRadio() {
  baseStoryRenderRadio();
  const s = ensureStoryState();
  if (!game.inProgress || !game.player || s.act < 2) return;
  const station = radioStations[game.radioIndex];
  const text = document.getElementById("radio-text");
  if (!text) return;

  if (station.frequency === "107.9 FM") {
    const last = s.actionLog[s.actionLog.length - 1];
    if (last) text.textContent = `A voice reads: '${last.choice}. ${locations[last.location]?.name || "UNKNOWN"}. ${formatTime(last.time)}.' Then: 'SUBJECT CONTINUES SOUTH.'`;
  }
  if (station.frequency === "103.7 FM" && s.act >= 3) {
    text.textContent = "Three tones. A familiar voice says: 'Station 17 is receiving. Bring the letter. Bring the bucket.' You still do not own a bucket.";
  }
};

// Preserve story state through the existing v1 save loader, which otherwise
// restores only the original core fields.
// --- End ---------------------------------------------------------------------
const storyFinalEvent = {
  id: "story-station-door",
  locations: ["station17"],
  strange: true,
  text: "The Station 17 door is already open.\n\nInside, obsolete radio equipment glows green. A tape machine is recording. A security monitor shows the parking lot from above.\n\nYour car is on the screen.\n\nThe timestamp is seventeen minutes ahead.",
  choices: [
    { label: "STEP INSIDE", ending: "floridaMan" },
    { label: "WATCH THE MONITOR", result: "A figure enters the frame seventeen minutes from now. Shirtless. Alligator boots. Seashell necklaces. A bucket in one hand.\n\nThe figure looks directly into the camera.\n\nEven through the bad picture, you know the face.", time: 2, curiosity: 3 },
    { label: "LEAVE NOW", result: "You make it six steps toward the car before the station printer starts.\n\nIt prints your name seventeen times." }
  ]
};

const baseStoryClueEventFor = clueEventFor;
clueEventFor = function storyClueEventFor(key) {
  if (key === "station17") return storyFinalEvent;
  return baseStoryClueEventFor(key);
};

function finaleArchive() {
  const s = ensureStoryState(); s.finalizing = true;
  showNarrative(
    "INCIDENT ARCHIVE\n\n" +
    "A metal file drawer is labeled FLORIDA MAN.\n\n" +
    "Inside are newspaper clippings from different years and different towns:\n\n" +
    "• MAN AND ALLIGATOR CAUSE CHAOS AT DRIVE-THROUGH\n" +
    "• MAN TRIES TO KEEP 12-FOOT ALLIGATOR AS PET\n" +
    "• MAN CALLS 911 ASKING FOR RIDE HOME\n" +
    "• MAN PRETENDS TO BE PROSECUTOR TO CLEAR HIS OWN CASE\n\n" +
    "Names cut away. Dates overwritten. The same impossible details in every clipping.\n\n" +
    "The photographs are grainy.\n\n" +
    "The face is yours."
  );
  showChoices([{ label: "OPEN TONIGHT'S FILE", action: finaleTonight }]);
}

function finaleTonight() {
  showNarrative(
    "TONIGHT'S INCIDENT LOG\n\n" +
    storyActionSummary() +
    "\n\nEvery entry is filed under the same subject:\n\n" +
    "FLORIDA MAN.\n\n" +
    "You were never following him.\n\n" +
    "People were describing you."
  );
  showChoices([{ label: "WATCH THE SECURITY TAPE", action: finaleMonitor }]);
}

function finaleMonitor() {
  showNarrative(
    "SECURITY MONITOR // +00:17:00\n\n" +
    "Your car pulls into the Station 17 lot.\n\n" +
    "A man gets out.\n\n" +
    "Shirtless.\n" +
    "Alligator boots.\n" +
    "Seashell necklaces.\n" +
    "A five-gallon bucket labeled:\n\n" +
    "BAIT / TOOLS / IMPORTANT DOCUMENTS\n\n" +
    "He turns toward the camera.\n\n" +
    "It is you.\n\n" +
    "On the desk beside the monitor is the original letter from your passenger seat."
  );
  showChoices([{ label: "READ THE LETTER", action: finaleLetter }]);
}

function finaleLetter() {
  showNarrative(
    "The letter is blank.\n\n" +
    "A pen waits beside it.\n\n" +
    "A fresh sheet lies beneath the envelope.\n\n" +
    "You write the first line before you realize what your hand is doing:\n\n" +
    "MEET ME AT STATION 17."
  );
  showChoices([{ label: "WRITE THE REST", action: finaleTypeLetter }]);
}

function finaleTypeLetter() {
  showNarrative(
    "MEET ME AT STATION 17.\n\n" +
    "Take 441 south.\n" +
    "Don't use the interstate.\n" +
    "Listen to the radio.\n\n" +
    "You know the way.\n\n" +
    "The words come easily.\n\n" +
    "You recognize every shape of every letter because you have been looking at your own handwriting all night."
  );
  showChoices([{ label: "TURN LETTER OVER", action: finaleBucket }]);
}

function finaleBucket() {
  showNarrative(
    "On the back you write:\n\n" +
    "BRING MY BUCKET.\n\n" +
    "Behind you, something plastic scrapes across the floor.\n\n" +
    "There is now a five-gallon bucket beside the door.\n\n" +
    "It is wet."
  );
  showChoices([{ label: "TRANSMIT", action: finaleLoop }]);
}

function finaleLoop() {
  const s = ensureStoryState();
  game.inProgress = false;
  showNarrative(
    "The transmitter clicks on.\n\n" +
    "For one second you hear every radio station at once.\n\n" +
    "Then—\n\n" +
    "12:47 AM.\n" +
    "GAINESVILLE.\n\n" +
    "The gas station behind you has already turned off its lights.\n" +
    "The road south is empty.\n" +
    "Your radio keeps losing the station.\n" +
    "You should probably go home.\n" +
    "You don't.\n\n" +
    "There is an envelope on the passenger seat.\n\n" +
    "Your boots are wet.\n\n" +
    "ENDING: THE OTHER DRIVER\n\n" +
    "You were never chasing Florida Man.\n" +
    "You were leaving the stories behind you."
  );
  showChoices([
    { label: "DRIVE AGAIN", action: restartFromEnding },
    { label: "LOAD SAVED NIGHT", action: loadGame }
  ]);
  setStatus(`NIGHT COMPLETE // ${game.player.miles} MILES // ${game.player.visitedLocations.length} LOCATIONS // ${s.actionLog.length} RECORDED INCIDENTS`);
}

const baseStoryEndGame = endGame;
endGame = function storyEndGame(type) {
  if (type === "floridaMan") return finaleArchive();
  return baseStoryEndGame(type);
};


events.splice(events.findIndex(e=>e.id==="station-door"),1,{...storyFinalEvent,id:"station-door"});
