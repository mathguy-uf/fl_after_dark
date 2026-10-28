"use strict";

// Outcomes are consequences of specific promises and objects, not a morality score.
const NIGHT_ENDINGS = {
  morning: {
    name: "MORNING TRAFFIC",
    text: () => "The transmitter clicks on. A road-service call cuts across your voice: your plate number, the relay building, someone still inside.\n\nThe family you warned made it north. They kept their promise.\n\nOutside, headlights stop.\n\n" +
      (decisions().help === 0
        ? "June steps out of the pickup. She holds up her palm; your plate number is still there. 'I said I would remember.'\n\n"
        : "A road-service truck pulls up. The driver puts the forest reserve can on the passenger floor to make room for you. 'Someone left me enough to get moving,' he says. 'Get in.'\n\n") +
      "The terminal tries to print an instruction to stay. Your crossed-out signature fills the screen. AUTHORIZATION INCOMPLETE. For once, it has to wait.\n\nYou leave the letter on the desk and step through the door. Behind you, the tape keeps recording an empty chair.\n\nBy sunrise you are sitting in ordinary traffic. A school bus stops. Somebody honks.\n\nYou remember the whole night. When the driver asks where to take you, you give your home address without hesitating."
  },
  silence: {
    name: "DEAD AIR",
    text: "The countdown reaches ONE. The relay clicks.\n\nYou know this gap. You replayed it on the motel cassette. The phone call taught you to pull the plug before the voice begins.\n\nThe terminal searches for your signature. It finds the line you crossed out. In that hesitation, you pull the transmitter's power cable.\n\nEvery radio in the room falls silent. On the monitor, your other self turns away from the car. Then the picture goes dark.\n\nThe letter stays on the desk. You leave it there.\n\nOutside, frogs call from the ditch. A truck passes without slowing. You wait for an instruction, then realize you are free to stop waiting.\n\nYou start the car. The clock advances a minute. Then another."
  },
  borrowed: {
    name: "BORROWED TIME",
    text: "The transmitter clicks. Its display changes: TRANSFER CREDIT — 00:17.\n\nThe coin you gave away rolls into the tray. Warm. Wet. On the monitor, your other self opens his hand. The split thumbnail catches the light.\n\nThe man at the pier was asking you to trust him with this moment.\n\nSeventeen minutes. Enough to let somebody else get out.\n\nHe points toward the door. You leave the letter beside the microphone and run. Through the window, you see him take your chair. He does not look up.\n\nAt the next intersection, every traffic light turns green. Your dashboard clock is seventeen minutes slow.\n\nYou get to go home. You keep trying to decide whether leaving yourself behind counts as keeping a promise."
  },
  loop: {
    name: "THE OTHER DRIVER",
    text: "The transmitter accepts your voice. You read the letter into the microphone, trying to make yourself hear the urgency this time.\n\nOn the monitor, the man with your face lifts the bucket into the car. You reach for its handle without looking down.\n\nFor one second you hear every radio station at once. Somewhere in that noise, a fisherman is being asked to remember a stranger.\n\nThen—\n\n12:47 AM. GAINESVILLE.\n\nThe gas station behind you goes dark. The road south is empty. Your radio keeps losing the station.\n\nAn envelope waits on the passenger seat. Its bottom edge is damp. You cannot remember putting it there.\n\nYou should probably go home.\nYou don't.\n\nYour boots are wet."
  },
  home: {name:"HOME BEFORE SUNRISE",text: () =>"You take the familiar streets home. At each turn, you say the next street name before the radio can.\n\nIn the driveway, the display glows 103.7 for one second after you remove the key.\n\nYou leave the envelope in the car. In the kitchen, you write down where you parked and what time you came home.\n\nThen you put the kettle on. " + (game.story?.letterRead ? "Whatever is at Station 17" : "Whoever left that envelope") + " will have to wait until daylight."},
  fuel: {name:"EMPTY",text:"The engine coughs once and the car rolls quietly to the shoulder.\n\nThe night becomes very large without the engine running.\n\nFar away, a radio tower blinks seventeen times."}
};

// ---------------------------------------------------------------------------
// Anonymous play counts, v2. Run IDs never leave this browser.
// Count lifecycle transitions, not clicks. Local claims are written BEFORE
// requests: an ambiguous network failure must not cause duplicate increments.
const PLAY_COUNT_API = "https://countapi.mileshilliard.com/api/v1";
const PLAY_COUNT_PREFIX = "florida_after_dark_mathguy_uf_v2";
const PLAY_COUNT_PLAYER_KEY = "fad.analytics.browser.v2";
const PLAY_COUNT_RUN_KEY = "fad.analytics.run.v2.";
const playCountTasks = new Map();

function playCountEnabled() {
  const loc = window.location;
  return !!loc && loc.hostname === "mathguy-uf.github.io" &&
    (loc.pathname === "/fl_after_dark" || loc.pathname.startsWith("/fl_after_dark/"));
}

async function incrementPlayCounter(name) {
  if (!playCountEnabled()) return false;
  try {
    const response = await fetch(`${PLAY_COUNT_API}/hit/${PLAY_COUNT_PREFIX}_${name}`, {
      cache: "no-store", keepalive: true
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.value !== null && data.value !== undefined &&
      Number.isSafeInteger(Number(data.value)) && Number(data.value) >= 0;
  } catch { return false; } // Telemetry must never interrupt gameplay.
}

function withPlayCountLock(key, task) {
  // Web Locks serialize the same saved night across tabs. The promise queue
  // also serializes calls within a page where Web Locks are unavailable.
  const previous = playCountTasks.get(key) || Promise.resolve();
  const next = previous.then(() => window.navigator?.locks
    ? window.navigator.locks.request(key, task) : task()).catch(() => {});
  playCountTasks.set(key, next);
  void next.finally(() => { if (playCountTasks.get(key) === next) playCountTasks.delete(key); });
  return next;
}

function countUniquePlayerOnce() {
  return withPlayCountLock(PLAY_COUNT_PLAYER_KEY, async () => {
    if (localStorage.getItem(PLAY_COUNT_PLAYER_KEY)) return;
    localStorage.setItem(PLAY_COUNT_PLAYER_KEY, "attempted");
    if (await incrementPlayCounter("unique_players")) {
      localStorage.setItem(PLAY_COUNT_PLAYER_KEY, "counted");
    }
  });
}

function trackNightStart() {
  if (!playCountEnabled() || !game.inProgress || !game.story) return Promise.resolve();
  // A unique run token is retained by the existing save/load mechanism.
  if (!game.story.playCount) {
    try { game.story.playCount = {version: 2, id: window.crypto.randomUUID()}; }
    catch { return Promise.resolve(); }
  }
  const run = game.story.playCount;
  if (run.version !== 2 || typeof run.id !== "string") return Promise.resolve();
  const key = PLAY_COUNT_RUN_KEY + run.id;
  return withPlayCountLock(key, async () => {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, JSON.stringify({start: "attempted"}));
    if (await incrementPlayCounter("starts")) {
      localStorage.setItem(key, JSON.stringify({start: "counted"}));
      void countUniquePlayerOnce();
    }
  });
}

function trackNightComplete(ending) {
  const run = game.story?.playCount;
  if (!playCountEnabled() || run?.version !== 2 || typeof run.id !== "string" ||
      !Object.hasOwn(NIGHT_ENDINGS, ending)) return Promise.resolve();
  const key = PLAY_COUNT_RUN_KEY + run.id;
  return withPlayCountLock(key, async () => {
    const record = JSON.parse(localStorage.getItem(key) || "null");
    // Exclude legacy saves and unconfirmed starts from the v2 cohort. A local
    // ledger survives loading a save made before this run's ending was reached.
    if (record?.start !== "counted" || record.ending) return;
    record.ending = ending;
    localStorage.setItem(key, JSON.stringify(record));
    await incrementPlayCounter(`ending_${ending}`);
    // Dashboard totals are the sum of ending counters, not a separate request.
  });
}

// First matching route wins. Missing decisions never count as having chosen.
function selectNightEnding(d = decisions()) {
  if (d.register === 0 && d.warning === 0 && (d.help === 0 || d.reserve === 0)) return "morning";
  if (d.register === 0 && d.phone === 0 && d.tape === 0) return "silence";
  if (d.coin === 0) return "borrowed";
  return "loop";
}
function nightStats() {
  const s=ensureStoryState();
  s.nightStats ||= {strange:[], floridaMen:[]};
  return s.nightStats;
}
function recordNightEncounter(kind, id) {
  const list=nightStats()[kind];
  if (!list.includes(id)) list.push(id);
}
const endingTriggerEvent=triggerEvent;
triggerEvent=function(key, deliberate=false) {
  endingTriggerEvent(key, deliberate);
  const id=game.eventHistory.at(-1);
  if (events.find(e=>e.id===id)?.strange || id===storyFinalEvent.id) recordNightEncounter("strange",id);
};
const endingShowDecision=showDecision;
showDecision=function(id) {
  if (["phone","coin","tape","register"].includes(id)) recordNightEncounter("strange","decision:"+id);
  if(id==="coin") recordNightEncounter("floridaMen","pier-reflection");
  endingShowDecision(id);
};
for (const name of ["pierRecognition","motelRegister","gatorHeadline","roadEcho","routeRevelation","finaleArchive","finaleMonitor"]) {
  const render=window[name];
  window[name]=function(...args) {
    recordNightEncounter("strange","story:"+name);
    if(name==="finaleMonitor")recordNightEncounter("floridaMen","security-monitor");
    return render(...args);
  };
}

function finishNight(key) {
  if (!Object.hasOwn(NIGHT_ENDINGS,key)) key="loop";
  cancelTravel(); closeAllOverlays();
  game.inProgress=false; game.ending=key;
  const stats=nightStats();
  // Freeze a report; loading or opening it again must not count anything twice.
  game.story.report={key,stage:"epilogue",miles:Math.floor(game.player.miles),
    locations:new Set(game.player.visitedLocations).size,total:Object.keys(locations).length,
    strange:stats.strange.length,floridaMen:stats.floridaMen.length};
  trackNightComplete(key);
  renderNightEpilogue();
}
function renderNightEpilogue() {
  document.getElementById("postgame-screen").hidden=true;
  document.getElementById("title-screen").hidden=true;
  document.getElementById("game-screen").hidden=false;
  document.getElementById("scene-frame").hidden=true;
  const report=game.story.report;
  const endingText = NIGHT_ENDINGS[report.key].text;
  showNarrative(typeof endingText === "function" ? endingText() : endingText);
  showChoices([{label:"END NIGHT",action:showNightReport}]);
  setStatus("Night concluded.");
}
function showNightReport() {
  const r=game.story.report;if(!r)return;
  r.stage="summary";closeAllOverlays();
  document.getElementById("title-screen").hidden=true;
  document.getElementById("game-screen").hidden=true;
  document.getElementById("postgame-screen").hidden=false;
  const values={"report-miles":r.miles,"report-locations":`${r.locations}/${r.total}`,
    "report-strange":r.strange,"report-men":r.floridaMen,"report-ending":NIGHT_ENDINGS[r.key].name};
  for(const [id,value] of Object.entries(values))document.getElementById(id).textContent=String(value);
  document.getElementById("report-heading").focus();
}
const endingEndGame=endGame;
endGame=function(type) {
  if(type==="floridaMan")return endingEndGame(type); // Keep the identity reveal first.
  return finishNight(type==="home"||type==="fuel"?type:selectNightEnding());
};
finaleLoop=function(){finishNight(selectNightEnding());};
const endingRestoreScene=restoreScene;
restoreScene=function() {
  document.getElementById("postgame-screen").hidden=true;
  if(!game.inProgress&&game.story.report){
    if(game.story.report.stage==="summary")return showNightReport();
    return renderNightEpilogue();
  }
  return endingRestoreScene();
};
const endingBeginNight=beginNight;
beginNight=function(){document.getElementById("postgame-screen").hidden=true;return endingBeginNight();};
const endingRestart=restartFromEnding;
restartFromEnding=function(){document.getElementById("postgame-screen").hidden=true;return endingRestart();};
document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("drive-again-button").onclick=()=>{restartFromEnding();beginNight();};
});

