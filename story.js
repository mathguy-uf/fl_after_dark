"use strict";

// FLORIDA AFTER DARK — THREE-ACT STORY LAYER
// Gives the procedural night a beginning, escalating middle, and a looped ending.
// The player never meets a separate Florida Man. The mystery is that the stories
// have been describing the player — sometimes tonight, sometimes years ago.

ITEM_LABELS.mysteryLetter = "creased envelope addressed in your handwriting";

// Shared with the canonical runtime so the opening and its loop stay in step.
const STORY_OPENING = "12:47 AM. GAINESVILLE.\n\nThe gas station behind you goes dark.\n\nOn the passenger seat is an envelope that was not there when you stopped for gas. Your name is written on the front.\n\nThe handwriting is yours. Even the place where you press too hard and tear the paper.\n\nThe bottom edge is damp. The rest of the car is dry.";
const STORY_DEPARTURE = "The road south is empty. Your radio keeps losing the station.\n\nYou try to remember putting the envelope in the car. You can remember paying for gas. You can remember coming back to the pump. Between those things: nothing.\n\nThe letter sits in the glove box. Someone knows what happened in that missing minute.\n\nYou should probably go home.\nYou don't.";

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

// Story exits must return through the current layered renderer, not the original
// core renderer captured before consequences.js. This keeps callbacks, decisions,
// and save/restore scene identifiers in sync after an interlude ends.
function resumeRoad() {
  game.scene = { kind: "location" };
  return window.showLocationActions();
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
    "There is no signature.\n\n" +
    "Inside the envelope, a smaller note reads:\n" +
    "THE FISHERMAN AT THE OLD PIER HAS THE FIRST MARKER.\n" +
    "THE MOTEL HAS THE RECORDING.\n" +
    "GET A RECEIPT AT THE CITRUS STAND.\n\n" +
    "Someone has planned this drive carefully. You wish you could remember being that person."
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
    "Below the words is a crescent of dried mud. You rub it with your thumb. It smells like the bottom of a boat."
  );
  showChoices([{ label: "START SOUTH", action: beginTheDrive }]);
}

function beginTheDrive() {
  const s = ensureStoryState();
  s.flags.driveStarted = true;
  showNarrative(STORY_DEPARTURE);
  baseStoryShowLocationActions();
  setStatus("OBJECTIVE: FIND STATION 17. LISTEN TO THE RADIO.");
}

// --- Beginning ---------------------------------------------------------------
const baseStoryBeginNight = beginNight;
beginNight = function storyBeginNight() {
  baseStoryBeginNight();
  game.story = freshStoryState();
  if (!game.player.inventory.includes("mysteryLetter")) game.player.inventory.push("mysteryLetter");
  showNarrative(STORY_OPENING);
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
    "'Paper called you Florida Man. Made it sound like you were having a good time.'\n\n" +
    "He says last time you spent twenty minutes asking whether a twelve-foot alligator tied to a tree legally counted as a pet.\n\n" +
    "You tell him that definitely was not you.\n\n" +
    "He looks at your car. Then at you.\n\n" +
    "'Okay.'"
  );
  showChoices([{ label: "ASK WHAT ELSE I DID", action: () => {
    showResult("'Mostly argued with the alligator. Alligator had the stronger case.'\n\nHe winds in a few feet of line.\n\n'Then you asked me to remember you. Said you might not.'\n\nFor the first time, he looks worried instead of amused.\n\n'You wanted a way home. That's the part the paper left out.'");
  }}, { label: "LEAVE THIS ALONE", action: resumeRoad }]);
  return true;
}

function motelRegister() {
  const s = ensureStoryState(); s.flags.motelRegister = true; s.act = Math.max(s.act, 2); rememberEvidence("motel");
  showNarrative(
    "The motel office is unlocked.\n\n" +
    "The register is open to tonight. Someone has written your arrival time before you have signed in.\n\n" +
    "YOUR NAME.\n" +
    "YOUR CAR.\n" +
    "ROOM 17.\n\n" +
    "Under NOTES someone has written:\n\n" +
    "NO MORE 911 CALLS ASKING FOR A RIDE HOME.\n\n" +
    "You have never called 911 for a ride home.\n\n" +
    "Under the complaint, in smaller letters: CALLER COULD NOT REMEMBER HOME ADDRESS.\n\n" +
    "You silently recite yours. It takes a moment longer than it should."
  );
  showChoices([{ label: "CHECK THE HANDWRITING", action: () => {
    showResult("The complaint is in block capitals. The signature underneath is yours.\n\nYou turn the page. Tomorrow has already been filled in.\n\nThe register is reserving more than a room.");
  }}, { label: "BACK AWAY FROM THE REGISTER", action: resumeRoad }]);
  return true;
}

function gatorHeadline() {
  const s = ensureStoryState(); s.flags.gatorHeadline = true; s.act = Math.max(s.act, 2); rememberEvidence("gatorHeadline");
  showNarrative(
    "Every radio station cuts to the same local-news recording.\n\n" +
    "ARCHIVE REPORT — DATE UNREADABLE\n\n" +
    "A man drove up to a fast-food window and an alligator went through the open drive-through window.\n\n" +
    "The announcer laughs, then reads the driver's explanation: 'I was trying to get somebody to stop.'\n\n" +
    "Then the recording describes the vehicle.\n\n" +
    "Same make. Same color. Same license plate.\n\n" +
    "Your license plate.\n\n" +
    "The station identifies the report as twenty years old.\n\n" +
    (s.flags.pierRecognition
      ? "You remember the fisherman saying the paper made it sound funny. This does not sound funny anymore."
      : "The announcer moves on to the weather. You stay parked until your hands stop shaking.")
  );
  showChoices([{ label: "CHECK MY PLATE", action: () => {
    showResult("You check twice.\n\nThe plate is correct.\n\nFrom the radio, very softly:\n\n'Seventeen.'");
  }}, { label: "TURN OFF THE RADIO", action: resumeRoad }]);
  return true;
}

function roadEcho() {
  const s = ensureStoryState(); s.flags.roadEcho = true; s.act = Math.max(s.act, 2); rememberEvidence("roadEcho");
  const last = s.actionLog[s.actionLog.length - 1];
  const echo = last ? `${last.choice}. ${locations[last.location]?.name || "UNKNOWN"}. ${formatTime(last.time)}.` : `ARRIVAL RECORDED. ${locations[game.player.location].name}.`;
  showNarrative(
    "107.9 FM turns itself on.\n\n" +
    "No numbers this time.\n\n" +
    `A calm voice says: '${echo}'\n\n` +
    "That is what you did.\n\n" +
    "Not approximately. Not the same kind of thing.\n\n" +
    "Exactly what you did.\n\n" +
    "The voice adds:\n\n" +
    "'SUBJECT APPROACHING RELAY. RETURN MESSAGE PENDING.'\n\n" +
    "Under the voice, you hear a chair scrape. Then someone takes a breath and holds it.\n\n" +
    "You realize you are holding yours."
  );
  showChoices([{ label: "WHO IS SUBJECT?", action: () => {
    showResult("Static.\n\nThen a voice, almost familiar, answers:\n\n'Subject seventeen.'");
  }}, { label: "KEEP DRIVING", action: resumeRoad }]);
  return true;
}

function routeRevelation() {
  const s = ensureStoryState(); s.flags.routeRevelation = true; s.act = 3; rememberEvidence("route");
  showNarrative(
    "You unfold the road map.\n\n" +
    "The coordinates on the receipt place the relay in the sawgrass. The coin's markings narrow it to a service road; the cassette's label gives the access number.\n\n" +
    "You trace the three marks together. A pencil line continues beyond your hand, out into a blank part of the map:\n\n" +
    "STATION 17.\n\n" +
    "Beside it, in pencil:\n\n" +
    "YOU KNOW THE WAY.\n\n" +
    "The handwriting matches the letter.\n\n" +
    "It matches yours.\n\n" +
    "Until now you wanted to find whoever sent the letter. Now you want to reach that microphone before the voice finishes its message."
  );
  showChoices([{ label: "GO FIND STATION 17", action: resumeRoad }]);
  setStatus("ACT III // ROUTE DISCOVERED: STATION 17.");
  return true;
}

function maybeStoryInterlude() {
  const s = ensureStoryState();
  if (!game.inProgress || !game.player || s.finalizing ||
      game.scene?.serious ||
      game.scene?.kind === "function" ||
      game.scene?.kind === "decision" ||
      game.player?.location === "station17" || !s.flags.driveStarted) return false;
  const key = game.player.location;

  if (key === "oldFishingPier" && !s.flags.pierRecognition) return pierRecognition();
  if (key === "abandonedMotel" && !s.flags.motelRegister) return motelRegister();
  if (key === "spaceCoast" && !s.flags.gatorHeadline && s.evidence.length >= 1) return gatorHeadline();
  if (key === "evergladesRoad" && !s.flags.roadEcho && s.evidence.length >= 2) return roadEcho();
  if (key === "evergladesRoad" &&
      game.player.discoveredLocations.includes("station17") &&
      !s.flags.routeRevelation && s.flags.gatorHeadline && s.flags.roadEcho) return routeRevelation();
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
    if (last) text.textContent = `A voice reads: '${last.choice}. ${locations[last.location]?.name || "UNKNOWN"}. ${formatTime(last.time)}.' Then: 'CURRENT LOCATION: ${locations[game.player.location].name.toUpperCase()}. RETURN MESSAGE PENDING.'`;
  }
  if (station.frequency === "103.7 FM" && s.act >= 3) {
    text.textContent = "Three tones. A familiar voice says: 'Station 17 is receiving. Bring the letter. Bring the bucket.' You still do not own a bucket.";
  }
};

// --- End ---------------------------------------------------------------------
const storyFinalEvent = {
  id: "story-station-door",
  locations: ["station17"],
  strange: true,
  text: "Beyond the Station 17 entrance, obsolete radio equipment glows green. A tape machine is recording.\n\nNo operator answers when you call. The microphone moves slightly, as though someone has just let go.\n\nA security monitor shows your car in the parking lot.\n\nThe timestamp is seventeen minutes ahead.",
  choices: [
    { label: "STEP INSIDE", ending: "floridaMan" },
    { label: "WATCH THE MONITOR", result: "A figure enters the frame seventeen minutes from now. Shirtless. Alligator boots. Seashell necklaces. A bucket in one hand.\n\nThe figure turns toward the camera. The picture tears across the face.\n\nWhen it clears, the figure is holding an envelope against the car window. Waiting for someone to take it.", time: 2, curiosity: 3 },
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
    "• MAN CALLS 911 ASKING FOR RIDE HOME\n\n" +
    "In the margins, someone has corrected the headlines:\n" +
    "TRIED TO GET HELP.\n" +
    "TRIED TO STAY HERE.\n" +
    "TRIED TO GO HOME.\n\n" +
    "The corrections are in your handwriting. Some are so faded you can barely read them.\n\n" +
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
    "People were describing you.\n\n" +
    "Behind tonight's sheet are other versions of the same drive. Different stops. Different mistakes. Each ends with a letter sent to Gainesville at 12:47 AM.\n\n" +
    "You do not remember those nights. You remember this one. The people beside the road were real, even when the radio reduced them to a line in a file."
  );
  showChoices([{ label: "WATCH THE SECURITY TAPE", action: finaleMonitor }]);
}

function finaleMonitor() {
  showNarrative(
    "SECURITY MONITOR // +00:17:00\n\n" +
    "Your car is still in the Station 17 lot. A man comes out of the building carrying an envelope.\n\n" +
    "Shirtless.\n" +
    "Alligator boots.\n" +
    "Seashell necklaces.\n" +
    "A five-gallon bucket labeled:\n\n" +
    "BAIT / TOOLS / IMPORTANT DOCUMENTS\n\n" +
    "He turns toward the camera.\n\n" +
    "It is you. Tired enough to lean against the car before opening it.\n\n" +
    "He puts the envelope in the bucket, above the waterline. The picture rolls. For a moment, the lights of a Gainesville gas station replace the tower.\n\n" +
    "You take your damp letter out of your pocket. You brought it in from the glove box.\n\n" +
    "On the desk lies a clean sheet, an empty envelope, and the same pen that tore the paper when you wrote your name."
  );
  showChoices([{ label: "READ THE LETTER", action: finaleLetter }]);
}

function finaleLetter() {
  showNarrative(
    "You lay the letter beside the blank sheet. Two pages. One message, if you copy it.\n\n" +
    "The console reads RETURN MESSAGE. Below it: DRIVER AUTHORIZATION — MOTEL REGISTER.\n\n" +
    (typeof decisions === "function" && decisions().register === 0
      ? "Your crossed-out signature flickers on its little screen. The machine keeps asking for a name you refused to give it.\n\n"
      : typeof decisions === "function" && decisions().register === 1
        ? "Your signature fills its little screen. The machine is waiting for you to finish the job.\n\n"
        : "An old signature matching yours fills its little screen. You do not remember signing this copy.\n\n") +
    "You think of yourself at the gas station, about to forget all of this. You want that person to find the room where the night can be changed.\n\n" +
    "You write:\n\nMEET ME AT STATION 17.\n\n" +
    "Only after writing it do you understand why the person before you chose those words."
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
    "You copy the small note too: the fisherman, the motel recording, the citrus receipt. A route someone with no memory can follow.\n\n" +
    "You try to add a warning beneath it. The pen hovers. Every warning you can think of would make you leave before reaching this room.\n\n" +
    "So you address the envelope. Press too hard. Tear the paper.\n\n" +
    "There it is: the mark you recognized in Gainesville."
  );
  showChoices([{ label: "TURN LETTER OVER", action: finaleBucket }]);
}

function finaleBucket() {
  showNarrative(
    "Behind you, something plastic scrapes across the floor.\n\n" +
    "There is a five-gallon bucket beside the door. BAIT / TOOLS / IMPORTANT DOCUMENTS. Damp envelopes are wedged above a shallow pool of water.\n\n" +
    "Somebody has been trying to keep the letters dry.\n\n" +
    "The handle leaves mud on your thumb. Before sealing the new envelope, you turn the letter over and use the other pen to write:\n\n" +
    "BRING MY BUCKET.\n\n" +
    "Mud on your thumb leaves a crescent beneath the words. You slide the letter inside the envelope.\n\n" +
    "The relay begins to count down. Somewhere, a gas station is about to close."
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
