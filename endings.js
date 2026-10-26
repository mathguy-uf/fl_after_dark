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
// Lightweight anonymous play counts.
//
// Counters are only sent from the production GitHub Pages site. A single local
// storage flag prevents the same browser profile from being counted as a new
// player every time it starts another night. No name, email, player ID, story
// choices, save data, or free-form text is sent.

const PLAY_COUNT_API = "https://countapi.mileshilliard.com/api/v1";
const PLAY_COUNT_PREFIX = "florida_after_dark_mathguy_uf_v1";
const PLAY_COUNT_PLAYER_KEY = "fad.analytics.unique-player.v1";
let playCountUniquePending = false;
let playCountRunComplete = false;

function playCountEnabled() {
  const loc = window.location;
  return !!loc && loc.hostname === "mathguy-uf.github.io" &&
    loc.pathname.startsWith("/fl_after_dark");
}

async function incrementPlayCounter(name) {
  if (!playCountEnabled()) return null;
  try {
    const response = await fetch(`${PLAY_COUNT_API}/hit/${PLAY_COUNT_PREFIX}_${name}`, {
      cache: "no-store",
      keepalive: true
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Analytics must never interfere with the game.
    return null;
  }
}

function uniquePlayerAlreadyCounted() {
  try {
    return localStorage.getItem(PLAY_COUNT_PLAYER_KEY) === "1";
  } catch {
    return false;
  }
}

async function countUniquePlayerOnce() {
  if (playCountUniquePending || uniquePlayerAlreadyCounted()) return;
  playCountUniquePending = true;
  const result = await incrementPlayCounter("unique_players");
  if (result) {
    try {
      localStorage.setItem(PLAY_COUNT_PLAYER_KEY, "1");
    } catch {
      // A blocked localStorage write only makes the estimate less precise.
    }
  }
  playCountUniquePending = false;
}

function trackNightStart() {
  if (!playCountEnabled()) return;
  playCountRunComplete = false;
  void incrementPlayCounter("starts");
  void countUniquePlayerOnce();
}

function trackNightComplete(key) {
  if (!playCountEnabled() || playCountRunComplete) return;
  playCountRunComplete = true;
  const safeKey = Object.hasOwn(NIGHT_ENDINGS, key) ? key : "other";
  void incrementPlayCounter("completions");
  void incrementPlayCounter(`ending_${safeKey}`);
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
 for (const id of ["begin-button", "drive-again-button", "new-button"]) {
   document.getElementById(id)?.addEventListener("click", trackNightStart, {capture:true});
 }
});
