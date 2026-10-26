"use strict";

// FLORIDA AFTER DARK — RUNTIME INTEGRATION LAYER
// Loaded last. Content modules define data and story scenes; this file owns the
// high-risk runtime entry points so gameplay no longer depends on wrapper order.

const RUNTIME_VERSION = 2;

const runtimeHooks = Object.seal({
  arrival: [],
  beforeLocationActions: [],
  afterEvent: [],
  beforeChoice: []
});

function addRuntimeHook(name, fn) {
  if (!runtimeHooks[name] || typeof fn !== "function") throw Error(`Unknown runtime hook: ${name}`);
  runtimeHooks[name].push(fn);
}

function runRuntimeHooks(name, ...args) {
  for (const fn of runtimeHooks[name]) fn(...args);
}

function runHandledRuntimeHooks(name, ...args) {
  for (const fn of runtimeHooks[name]) if (fn(...args)) return true;
  return false;
}

function station17Revealed() {
  return !!game.story?.flags?.routeRevelation;
}

function routeAvailable(key) {
  const loc = locations[key];
  if (!loc) return false;
  if (key === "station17") return station17Revealed() && game.player.discoveredLocations.includes(key);
  return !loc.hidden || game.player.discoveredLocations.includes(key);
}

// ---------------------------------------------------------------------------
// Explicit illustration state. Narrative wording never chooses artwork.

const RUNTIME_EVENT_ART = Object.freeze({
  alligator: "alligator",
  fisherman: "oldFishingPier",
  "motel-doors": "motel",
  room17: "motel",
  "station-door": "tower",
  "story-station-door": "tower"
});

const RUNTIME_FUNCTION_ART = Object.freeze({
  openTheLetter: "letter",
  readBackOfLetter: "letter",
  beginTheDrive: "gainesville",
  showLocationScene: null,
  pierRecognition: "oldFishingPier",
  motelRegister: "motel",
  gatorHeadline: "spaceCoast",
  roadEcho: "evergladesRoad",
  routeRevelation: "evergladesRoad",
  finaleArchive: "archive",
  finaleTonight: "archive",
  finaleMonitor: "monitor",
  finaleLetter: "letter",
  finaleTypeLetter: "letter",
  finaleBucket: "bucket",
  finaleLoop: "loop"
});

const RUNTIME_DECISION_ART = Object.freeze({
  help: "suwanneeRiver",
  phone: "citrusStand",
  coin: "oldFishingPier",
  tape: "motel",
  warning: "spaceCoast",
  register: "motel",
  reserve: "ocalaForest"
});

const RUNTIME_CHOICE_ART = Object.freeze({
  "station-door:WATCH THE MONITOR": "monitor"
});

function resolveSceneArt(scene = game.scene) {
  if (!game.inProgress && game.story?.report?.stage === "epilogue") {
    return game.ending === "loop" ? "loop" : "road";
  }
  if (scene?.art) return scene.art;
  if (!scene) return game.player?.location || "road";
  if (scene.kind === "opening") return "letter";
  if (scene.kind === "location") return scene.id || game.player?.location || "road";
  if (scene.kind === "event") return RUNTIME_EVENT_ART[scene.id] || game.player?.location || "road";
  if (scene.kind === "function") return RUNTIME_FUNCTION_ART[scene.name] || game.player?.location || "road";
  if (scene.kind === "decision") return RUNTIME_DECISION_ART[scene.id] || game.player?.location || "road";
  if (scene.kind === "passingCar") return "road";
  if (scene.kind === "result") return scene.art || game.player?.location || "road";
  return game.player?.location || "road";
}

function artForChoice(scene, choice) {
  return RUNTIME_CHOICE_ART[`${scene?.id || ""}:${choice?.label || ""}`] || resolveSceneArt(scene);
}

function drawRuntimeArt(ctx, c, art) {
  if (art === "letter" && typeof drawStoryLetter === "function") return drawStoryLetter(ctx, c);
  if (art === "archive" && typeof drawStoryArchive === "function") return drawStoryArchive(ctx, c);
  if (art === "monitor" && typeof drawStoryMonitor === "function") return drawStoryMonitor(ctx, c);
  if (art === "bucket" && typeof drawStoryBucket === "function") return drawStoryBucket(ctx, c);
  if (art === "loop" && typeof drawStoryLoop === "function") return drawStoryLoop(ctx, c);
  if (art === "alligator") return drawAlligator(ctx, c);
  if (art === "motel") return drawMotel(ctx, c);
  if (art === "tower") return drawRadioTower(ctx, c);
  if (art === "floridaMan") return drawFloridaMan(ctx, c);
  if (art === "road") return drawGenericRoad(ctx, c);
  if (locations[art]) return drawLocation(ctx, art, c);
  return drawGenericRoad(ctx, c);
}

function runtimeArtLabel(art) {
  const special = {
    letter: "the mysterious letter",
    archive: "the Station 17 incident archive",
    monitor: "the Station 17 security monitor",
    bucket: "the wet five-gallon bucket",
    loop: "the 12:47 AM time loop",
    alligator: "an alligator encounter",
    motel: "the abandoned motel",
    tower: "Station 17",
    road: "the night road",
    floridaMan: "a Florida Man image"
  };
  return special[art] || locations[art]?.name || "the current scene";
}

renderScene = function runtimeRenderScene() {
  if (!game.inProgress && game.story?.report?.stage !== "epilogue") return;
  const canvas = document.getElementById("scene-canvas");
  const frame = document.getElementById("scene-frame");
  if (!canvas || !frame) return;
  const ctx = canvas.getContext("2d"), c = sceneColors(), art = resolveSceneArt();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
  drawRuntimeArt(ctx, c, art);
  frame.hidden = false;
  canvas.setAttribute("aria-label", `Apple II-style pixel illustration of ${runtimeArtLabel(art)}.`);
};

// ---------------------------------------------------------------------------
// Canonical story/results flow.

showResult = function runtimeShowResult(text, serious = game.scene?.kind === "function" || !!game.scene?.serious, art = resolveSceneArt()) {
  game.scene = { kind: "result", text, serious: !!serious, art };
  showNarrative(text);
  showChoices([{ label: "CONTINUE", action: showLocationScene }]);
};

showLocationScene = function runtimeShowLocationScene() {
  if (!game.player) return;
  game.scene = { kind: "location", id: game.player.location, art: game.player.location };
  showNarrative(locations[game.player.location].description);
  showLocationActions();
};

function runtimeStoryAndConsequences() {
  const s = ensureStoryState();
  if (!s.flags.driveStarted || s.finalizing) return false;
  if (maybeStoryInterlude()) return true;

  s.callbacks ||= {};
  for (const m of decisionMoments) {
    if (m.later !== game.player.location || decisions()[m.id] === undefined || s.callbacks[m.id]) continue;
    s.callbacks[m.id] = true;
    const v = decisions()[m.id];
    if (m.id === "help" && v === 0) game.player.fuel = Math.min(100, game.player.fuel + 18);
    if (m.id === "phone") { if (v === 0) addItem("motelKey"); else advanceTime(12); }
    if (m.id === "tape" && v === 1) { game.player.fuel = Math.max(0, game.player.fuel - 8); advanceTime(20); }
    if (m.id === "coin" && v === 1) {
      game.player.inventory = game.player.inventory.filter(x => x !== "strangeCoin");
      s.coinRecorded = true;
      advanceTime(7);
    }
    updateHUD();
    if (game.player.fuel <= 0) { endGame("fuel"); return true; }
    showResult(m.echo[v], false, game.player.location);
    return true;
  }

  for (const m of decisionMoments) {
    if (m.location === game.player.location && decisions()[m.id] === undefined && (!m.requires || hasItem(m.requires))) {
      showDecision(m.id);
      return true;
    }
  }
  return false;
}

addRuntimeHook("arrival", () => maybePassingCar());
addRuntimeHook("arrival", () => maybeStoryInterlude());
addRuntimeHook("beforeLocationActions", runtimeStoryAndConsequences);
addRuntimeHook("afterEvent", event => {
  ensureStoryState().currentEventId = event.id;
  if ((event.strange || event.id === storyFinalEvent.id) && typeof recordNightEncounter === "function") {
    recordNightEncounter("strange", event.id);
  }
});
addRuntimeHook("beforeChoice", choice => addStoryAction(choice));

showLocationActions = function runtimeShowLocationActions() {
  if (!game.player) return;
  game.scene = { kind: "location", id: game.player.location, art: game.player.location };
  if (runHandledRuntimeHooks("beforeLocationActions")) return;

  const key = game.player.location, loc = locations[key];
  const choices = [{ label: "EXPLORE AREA", action: exploreCurrentLocation }];
  loc.connections.filter(routeAvailable).forEach(n => {
    choices.push({ label: `DRIVE TO ${locations[n].name}`, action: () => travelTo(n) });
  });
  if (key === "gainesville") choices.push({ label: "DRIVE HOME", action: () => endGame("home") });
  showChoices(choices);
};

beginTheDrive = function runtimeBeginTheDrive() {
  const s = ensureStoryState();
  s.flags.driveStarted = true;
  game.scene = { kind: "location", id: "gainesville", art: "gainesville" };
  showNarrative(
    "The gas station behind you has already turned off its lights.\n" +
    "The road south is empty.\n" +
    "Your radio keeps losing the station.\n" +
    "The letter sits in the glove box.\n" +
    "You should probably go home.\n" +
    "You don't."
  );
  showLocationActions();
  setStatus("OBJECTIVE: FIND STATION 17. LISTEN TO THE RADIO.");
};

beginNight = function runtimeBeginNight() {
  cancelTravel();
  if (!game.seed) game.seed = generateSeed();
  seedRandom(game.seed);
  game.weather = "Humid";
  game.radioIndex = 1;
  game.eventHistory = [];
  game.player = makePlayer();
  game.inProgress = true;
  game.ending = null;
  game.story = freshStoryState();
  game.scene = { kind: "opening", art: "letter" };
  if (!game.player.inventory.includes("mysteryLetter")) game.player.inventory.push("mysteryLetter");

  document.getElementById("postgame-screen").hidden = true;
  document.getElementById("title-screen").hidden = true;
  document.getElementById("game-screen").hidden = false;
  updateHUD();
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

travelTo = function runtimeTravelTo(key) {
  if (!game.inProgress) return;
  const from = locations[game.player.location], dest = locations[key];
  if (!dest || !from.connections.includes(key)) return setStatus("That road is not available from here.");
  if (!routeAvailable(key)) return setStatus("You do not know how to reach that place yet.");

  const miles = 7 + Math.floor(random() * 18);
  const fuelCost = 3 + Math.floor(miles / 8);
  game.player.fuel = Math.max(0, game.player.fuel - fuelCost);
  game.player.miles += miles;
  advanceTime(8 + Math.floor(random() * 18));
  game.player.location = key;
  if (!game.player.visitedLocations.includes(key)) game.player.visitedLocations.push(key);
  discoverConnections(key);
  maybeChangeWeather();
  updateHUD();
  if (game.player.fuel <= 0) return endGame("fuel");

  game.scene = { kind: "location", id: key, art: key };
  if (runHandledRuntimeHooks("arrival", key)) return;

  showNarrative(`You drive ${miles} miles to ${dest.name}.\n\n${dest.description}`);
  showChoices([]);
  const chance = Math.min(.78, .42 + dest.risk * .07 + game.player.curiosity * .01);
  if (random() < chance) {
    travelTimer = window.setTimeout(() => {
      if (game.inProgress && game.player.location === key) triggerEvent(key);
    }, settings.motionDisabled ? 0 : 350);
  } else showLocationActions();
};

triggerEvent = function runtimeTriggerEvent(key, deliberate = false) {
  const forced = deliberate ? clueEventFor(key) : null;
  const eligible = events.filter(e => e.locations.includes(key) && (!e.requiresItem || hasItem(e.requiresItem)));
  if (!eligible.length) {
    game.scene = { kind: "location", id: key, art: key };
    showNarrative(`${locations[key].description}\n\nNothing unusual happens for several minutes. This is unusual enough.`);
    return showLocationActions();
  }
  const fresh = eligible.filter(e => !game.eventHistory.slice(-6).includes(e.id));
  const event = forced || randomChoice(fresh.length ? fresh : eligible);
  game.eventHistory.push(event.id);
  game.eventHistory = game.eventHistory.slice(-16);
  game.scene = { kind: "event", id: event.id, art: RUNTIME_EVENT_ART[event.id] || key };
  runRuntimeHooks("afterEvent", event);
  if (event.strange) flickerScreen();
  showNarrative(event.text);
  showChoices(event.choices.map(choice => ({ label: choice.label, action: () => resolveChoice(choice) })));
};

resolveChoice = function runtimeResolveChoice(choice) {
  const sourceScene = game.scene ? { ...game.scene } : null;
  runRuntimeHooks("beforeChoice", choice, sourceScene);
  if (choice.time) advanceTime(choice.time);
  if (choice.curiosity) game.player.curiosity = Math.max(0, game.player.curiosity + choice.curiosity);
  if (choice.fuel) game.player.fuel = Math.min(100, game.player.fuel + choice.fuel);
  if (Number.isInteger(choice.radioIndex)) game.radioIndex = choice.radioIndex;
  if (choice.item) addItem(choice.item);
  updateHUD();
  checkStationDiscovery();
  if (choice.ending) return endGame(choice.ending);

  const text = choice.result || "You decide that is enough of that for now.";
  game.scene = {
    kind: "result",
    text,
    serious: !!sourceScene?.serious,
    art: artForChoice(sourceScene, choice)
  };
  showNarrative(text);
  showChoices([
    { label: "CONTINUE", action: showLocationScene },
    { label: "RADIO", action: openRadio },
    { label: "MAP", action: openMap }
  ]);
};

restoreScene = function runtimeRestoreScene() {
  document.getElementById("postgame-screen").hidden = true;
  if (!game.inProgress && game.story?.report) {
    if (game.story.report.stage === "summary") return showNightReport();
    return renderNightEpilogue();
  }
  if (!game.inProgress) return endGame(game.ending || "home");

  const s = game.scene;
  if (!s) {
    if (!game.story?.flags?.driveStarted) {
      game.scene = { kind: "opening", art: "letter" };
      showNarrative("The envelope waits on the passenger seat. The handwriting is yours.");
      return showChoices([
        { label: "OPEN THE LETTER", action: openTheLetter },
        { label: "DRIVE HOME", action: () => endGame("home") }
      ]);
    }
    return showLocationScene();
  }
  if (s.kind === "opening") {
    showNarrative("The envelope waits on the passenger seat. The handwriting is yours.");
    return showChoices([
      { label: "OPEN THE LETTER", action: openTheLetter },
      { label: "DRIVE HOME", action: () => endGame("home") }
    ]);
  }
  if (s.kind === "function" && sceneFunctions[s.name]) return window[s.name]();
  if (s.kind === "decision") return showDecision(s.id);
  if (s.kind === "result") return showResult(s.text, !!s.serious, s.art || resolveSceneArt(s));
  if (s.kind === "passingCar") return renderPassingCar();
  if (s.kind === "event") {
    ensureStoryState().currentEventId = s.id;
    const event = events.find(e => e.id === s.id) || storyFinalEvent;
    showNarrative(event.text);
    return showChoices(event.choices.map(choice => ({ label: choice.label, action: () => resolveChoice(choice) })));
  }
  return showLocationScene();
};
