"use strict";

// Outcomes are consequences of specific promises and objects, not a morality score.
const NIGHT_ENDINGS = {
  morning: {
    name: "MORNING TRAFFIC",
    text: "The transmitter clicks on. For once, the voice coming back is not yours.\n\nIt is the family you warned. They made it north. They called for help.\n\nOutside Station 17, headlights stop instead of following you. Someone opens the passenger door. You crossed your name out of the register; there is no replacement driver waiting in the archive.\n\nBy sunrise you are sitting in ordinary traffic. A school bus stops. Somebody honks.\n\nFor the first time all night, nobody knows who you are."
  },
  silence: {
    name: "DEAD AIR",
    text: "You recognize the sound from the cassette: the relay closes just before your recorded voice begins. The phone call taught you what to do with a machine that counts down.\n\nYou pull the transmitter's power cable in the gap.\n\nYour crossed-out name disappears from the register. Every radio in the room falls silent. The letter is still blank on the other side.\n\nOutside, you hear frogs, trucks, somebody opening a gas station.\n\nNothing tells you what happens next. You have never been so relieved."
  },
  borrowed: {
    name: "BORROWED TIME",
    text: "The coin you gave the man in the window rolls out of the transmitter. Warm. Wet. Older than it was.\n\nOn the monitor, your other self opens his hand. He has paid for seventeen minutes. He points toward the door.\n\nYou leave before the letter can be delivered. Behind you, he takes your chair.\n\nAt the next intersection, every traffic light turns green. Your dashboard clock is seventeen minutes slow.\n\nYou are out of the night. Somewhere, another version of you is still paying for it."
  },
  loop: {
    name: "THE OTHER DRIVER",
    text: "The transmitter accepts your voice. There is no one outside to interrupt it, no silence between the words you can use, no coin buying you a way out.\n\nFor one second you hear every radio station at once.\n\nThen—\n\n12:47 AM. GAINESVILLE.\n\nThe gas station behind you goes dark. An envelope waits on the passenger seat. Your boots are wet.\n\nYou were never chasing Florida Man. You were leaving the stories behind you."
  },
  home: {name:"HOME BEFORE SUNRISE",text:"You turn toward Gainesville and keep driving until familiar streetlights replace the dark roads.\n\nAt home, the radio display glows 103.7 for one second after you remove the key.\n\nYou decide not to mention this to anyone before breakfast."},
  fuel: {name:"EMPTY",text:"The engine coughs once and the car rolls quietly to the shoulder.\n\nThe night becomes very large without the engine running.\n\nFar away, a radio tower blinks seventeen times."}
};

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
  renderNightEpilogue();
}
function renderNightEpilogue() {
  document.getElementById("postgame-screen").hidden=true;
  document.getElementById("title-screen").hidden=true;
  document.getElementById("game-screen").hidden=false;
  document.getElementById("scene-frame").hidden=true;
  const report=game.story.report;
  showNarrative(NIGHT_ENDINGS[report.key].text);
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
