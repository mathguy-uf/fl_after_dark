"use strict";
// Explicit, serializable scene identifiers; no functions are stored in saves.
const sceneFunctions={openTheLetter,readBackOfLetter,beginTheDrive,showLocationScene,finaleArchive,finaleTonight,finaleMonitor,finaleLetter,finaleTypeLetter,finaleBucket,finaleLoop,pierRecognition,motelRegister,gatorHeadline,roadEcho,routeRevelation};
for(const name of Object.keys(sceneFunctions)){
 const original=sceneFunctions[name];
 window[name]=function(...args){game.scene={kind:'function',name};return original(...args);};
}
// The core clue system knows when all three route objects exist, but the story
// deliberately withholds Station 17's name until the Everglades reveal. Keep the
// early status useful without letting a mechanical unlock spoil Act III.
const consequenceSetStatus=setStatus;
setStatus=function(text){
 if(text==="ROUTE DISCOVERED: STATION 17. Reach it from Everglades Road."&&game.story&&!game.story.flags?.routeRevelation){
  return consequenceSetStatus("THREE ROUTE MARKERS COLLECTED. The final road is still missing.");
 }
 return consequenceSetStatus(text);
};
const decisionMoments=[
 {id:'help',location:'suwanneeRiver',text:'A driver waves beside a stalled pickup. A lunch cooler sits on the roof. She says her name is June. She has driven this road after work for eleven years; tonight she cannot find the bridge. She needs a jump.',options:[['STOP AND HELP','You wait while her engine catches. She writes your plate number on her palm. “If you need help, I will remember.” You mention Station 17. She repeats it carefully, then makes you say her name back. “June. In case you need someone to ask for.”',8],['KEEP DRIVING','Her hazard lights shrink in the mirror. You tell yourself somebody else will stop.',0]],echo:['June has left a fuel can beside the Space Coast pump. Your plate number is written on it. The attendant says she is listening on the road-service frequency for anyone asking about Station 17. You gain 18 fuel.','At the Space Coast pump, the same pickup passes on a tow truck. Its driver looks through you.'],later:'spaceCoast'},
 {id:'phone',location:'citrusStand',text:'The payphone rings. On its cracked display: YOUR NUMBER. Answering feels like agreeing to something.',options:[['ANSWER','A voice with your exact hesitation says: “When the motel television starts counting, unplug it. Wait for the click. Pull before the voice starts.” Behind the speaker, you hear yourself asking who is calling. The line goes dead before you can ask aloud.',3],['LET IT RING','The ringing stops. A message indicator blinks, although this phone has no answering machine.',0]],echo:['The motel television counts down. A relay clicks. You pull the plug before the voice starts, and the screen goes dark at ONE. A key falls from behind it. You keep it. A machine can be interrupted, even when it knows what you will do.','The motel television counts down. At zero every door slams. You lose twelve minutes finding the exit.'],later:'abandonedMotel'},
 {id:'coin',location:'oldFishingPier',requires:'strangeCoin',text:'In the bait-shop window beside the pier, a shirtless man in alligator boots holds out his hand. Rain hides his face. “My coin,” he says. “Seventeen minutes. Enough to let somebody else get out.” He presses a split thumbnail against the glass. You could slide the coin through the broken pane.',options:[['SLIDE THE COIN THROUGH','You copy the engraved coordinates onto your map and slide the coin through. He closes his hand. “When the machine starts, do not wait for me.” You look down. Your thumbnail has the same split.',0],['KEEP THE COIN','You close your fist. The figure waits. You look away first.',0]],echo:['A coin waits behind the glass of the Station 17 toll slot. Its edge has a crescent-shaped nick. The display reads TRANSFER CREDIT: 00:17. The door opens without a sound.','The Station 17 door demands your coin. You finally surrender it. The lock takes seven minutes to turn.'],later:'station17'},
 {id:'tape',location:'abandonedMotel',requires:'cassetteTape',text:'A cassette player waits on the motel chair. Its Play button is worn smooth. You put SIDE B ONLY into the deck. Before you press anything, a breath comes through the speaker.',options:[['PLAY THE CASSETTE','Your recorded voice describes a washed-out turn on the road south. You mark the safe approach. Then: a relay click, a short gap, and “MEET ME AT—”. You rewind. The gap is always there. On the label: ACCESS 17 / MATCH TO COIN AND RECEIPT.',5],['KEEP IT UNPLAYED','You wrap the cassette in a motel towel. The label reads ACCESS 17 / MATCH TO COIN AND RECEIPT. You keep the route information. Whatever is on the recording can wait.',0]],echo:['You recognize the washed-out turn from the tape and take the dry shoulder.','The road gives way at the turn. You backtrack through standing water, losing 8 fuel and twenty minutes.'],later:'evergladesRoad'},
 {id:'warning',location:'spaceCoast',text:'A family in a station wagon asks about the road south. Their child is holding a postcard of Station 17. “The radio said there was somewhere to sleep,” the parent says. The child asks whether a radio knows when you are tired.',options:[['WARN THEM TO TURN BACK','You tell them about the repeating roads. The parent studies your face, then turns north. “We will tell the road-service dispatcher you are still out here.” The child leaves the postcard on your hood. It shows a building with no windows.',4],['SAY THE ROAD IS CLEAR','They thank you and head south. Their radio is tuned to 103.7.',0]],echo:['At the Everglades junction, a road-service broadcast gives your plate number. The family reached a working phone. They are asking someone to find you. On their postcard, a small penciled sun has appeared above the windowless building.','At the Everglades junction you find the station wagon abandoned. Its radio says: “We followed your directions.”'],later:'evergladesRoad'},
 {id:'register',location:'abandonedMotel',text:'You turn the motel register to tomorrow. Your name is already there, beside NEXT DRIVER. In the margin: STATION 17 RELAY — RETURN AUTHORIZED BY SIGNATURE. The pencil has been sharpened down to a stub.',options:[['CROSS OUT YOUR NAME','You cross out your name until the paper tears. The desk radio says “Authorization incomplete.” Somewhere a printer stops. You leave the pencil across the torn line.',2],['SIGN THE NEXT LINE','You sign below the printed promise: RETURN TO POINT OF ORIGIN. Your hand knows the signature. Somewhere a printer starts. Going home should not require this much paperwork.',2]],echo:['The Station 17 terminal flashes AUTHORIZATION INCOMPLETE beside a copy of the register. It can still show what you did. It cannot settle what you will do next. A blank incident sheet waits beneath the screen.','The Station 17 archive contains your signed authorization. Every incident was filed under your name before you arrived.'],later:'station17'},
 {id:'reserve',location:'ocalaForest',text:'An emergency fuel can hangs beneath a sign: FOR THE NEXT STRANDED DRIVER. Below it, a road-service card lists Station 17 as the last stop before the wetlands. Your tank is not full.',options:[['LEAVE IT FOR SOMEBODY ELSE','You tighten the cap and leave the can hanging where it can be seen.',0],['TAKE THE RESERVE','You pour the fuel into your tank. The empty can swings beneath the sign. You gain 12 fuel.',3]],echo:['At the Space Coast pump, a road-service driver is refilling the forest reserve. “That last can got my truck moving again,” he tells the attendant. His radio is on. A route card on his dash ends at Station 17.','At the Space Coast pump a dispatcher asks who emptied the forest reserve. A driver is still waiting in the dark.'],later:'spaceCoast'}
];
function decisions(){return ensureStoryState().decisions ||= {};}
function showDecision(id){
 const m=decisionMoments.find(m=>m.id===id);game.scene={kind:'decision',id};
 showNarrative(m.text);showChoices(m.options.map((o,i)=>({label:o[0],action:()=>{
  decisions()[id]=i;game.story.currentEventId="decision:"+id;addStoryAction({label:o[0]});advanceTime(o[2]);
  if(id==='coin'&&i===0){game.story.coinRecorded=true;game.player.inventory=game.player.inventory.filter(x=>x!=='strangeCoin');}
  if(id==='reserve'&&i===1)game.player.fuel=Math.min(100,game.player.fuel+12);
  showResult(o[1],true);updateHUD();
 }})));
}
function showResult(text,serious=game.scene?.kind==='function'||!!game.scene?.serious){game.scene={kind:'result',text,serious};showNarrative(text);showChoices([{label:'CONTINUE',action:showLocationScene}]);}
const previousHasItem=hasItem;
hasItem=function(item){return previousHasItem(item)||(item==='strangeCoin'&&!!game.story?.coinRecorded);};
const previousActions=showLocationActions;
showLocationActions=function(){
 const s=ensureStoryState();if(!s.flags.driveStarted||s.finalizing)return previousActions();
 if(maybeStoryInterlude())return;
 s.callbacks ||= {};
 for(const m of decisionMoments){if(m.later===game.player.location&&decisions()[m.id]!==undefined&&!s.callbacks[m.id]){
  s.callbacks[m.id]=true;const v=decisions()[m.id];
  if(m.id==='help'&&v===0)game.player.fuel=Math.min(100,game.player.fuel+18);
  if(m.id==='phone'){if(v===0)addItem('motelKey');else advanceTime(12);}
  if(m.id==='tape'&&v===1){game.player.fuel=Math.max(0,game.player.fuel-8);advanceTime(20);}
  if(m.id==='coin'&&v===1){game.player.inventory=game.player.inventory.filter(x=>x!=='strangeCoin');s.coinRecorded=true;advanceTime(7);}
  updateHUD();if(game.player.fuel<=0)return endGame('fuel');return showResult(m.echo[v]);
 }}
 for(const m of decisionMoments)if(m.location===game.player.location&&decisions()[m.id]===undefined&&(!m.requires||hasItem(m.requires)))return showDecision(m.id);
 game.scene={kind:'location'};return previousActions();
};
const previousTrigger=triggerEvent;
triggerEvent=function(key,deliberate=false){previousTrigger(key,deliberate);game.scene={kind:'event',id:game.eventHistory.at(-1)};};
const previousResolve=resolveChoice;
resolveChoice=function(choice){previousResolve(choice);if(!choice.ending)game.scene={kind:'result',text:game.sceneText};};
const previousSummary=storyActionSummary;
storyActionSummary=function(){return previousSummary()+'\n\nDECISIONS THAT REACHED THE ARCHIVE\n'+decisionMoments.filter(m=>decisions()[m.id]!==undefined).map(m=>'• '+m.options[decisions()[m.id]][0]).join('\n');};
const previousBegin=beginNight;
beginNight=function(){game.story=freshStoryState();game.ending=null;previousBegin();game.scene={kind:'opening'};};
function restoreScene(){
 const s=game.scene;
 if(!game.inProgress){if(game.story.finalizing)return finaleLoop();return endGame(game.ending||'home');}
 if(!s){if(!game.story.flags.driveStarted){game.scene={kind:'opening'};showNarrative('The envelope waits on the passenger seat. The handwriting is yours.');return showChoices([{label:'OPEN THE LETTER',action:openTheLetter}]);}return showLocationScene();}
 if(s.kind==='opening'){showNarrative('The envelope waits on the passenger seat. The handwriting is yours.');return showChoices([{label:'OPEN THE LETTER',action:openTheLetter},{label:'DRIVE HOME',action:()=>endGame('home')}]);}
 if(s.kind==='function'&&sceneFunctions[s.name])return window[s.name]();
 if(s.kind==='decision')return showDecision(s.id);
 if(s.kind==='result')return showResult(s.text);
 if(s.kind==='event'){game.story.currentEventId=s.id;const e=events.find(e=>e.id===s.id)||storyFinalEvent;showNarrative(e.text);return showChoices(e.choices.map(c=>({label:c.label,action:()=>resolveChoice(c)})));}
 showLocationScene();
}

// Separate deterministic draw: normal encounters never consume this opportunity.
// The seed generator has 9,000 equiprobable values; this permutation selects 90.
function passingCarEligible(seed) {
  const n=((Math.trunc(seed)-1000)%9000+9000)%9000;
  return ((n*7919+4171)%9000)<90;
}
function passingCarState() {
  return ensureStoryState().passingCar ||= {eligible:passingCarEligible(game.seed),phase:"waiting"};
}
function maybePassingCar() {
  if(!game.inProgress||!game.story?.flags.driveStarted||game.story.finalizing)return false;
  const story=ensureStoryState();
  // The doppelgänger is a rare middle-act omen, not an opening-scene spoiler.
  // Wait until at least two independent echoes have established the mystery, and
  // never interrupt Station 17 or the final act.
  if(story.act!==2||story.evidence.length<2||game.player.location==="station17")return false;
  const s=passingCarState();
  if(s.phase!=="waiting")return false;
  if(!s.eligible){s.phase="done";return false;}
  s.phase="approach";
  renderPassingCar();return true;
}
function leavePassingCar() {
  passingCarState().phase="done";
  game.scene={kind:"location"};
  showLocationScene();
}
function renderPassingCar() {
  const s=passingCarState();
  game.scene={kind:"passingCar"};
  if(s.phase==="approach"){
    showNarrative("Headlights appear in your mirror.\n\nThey stay behind you through two bends. There is room on the shoulder.");
    showChoices([
      {label:"PULL OVER",action:()=>{
        s.phase="passed";
        s.radioTime=formatTime(game.player.time+17);
        renderPassingCar();
      }},
      {label:"KEEP DRIVING",action:leavePassingCar}
    ]);
    return;
  }
  if(s.phase==="passed"){
    showNarrative("You ease onto the shoulder.\n\nThe car passes slowly.\n\nSame color. Same dent above the rear wheel.\n\nSame plate.\n\nFor a moment, the dashboard light catches the driver's face.\n\nYour face.\n\nYou are looking straight ahead.\n\nThe radio says, '"+s.radioTime+".'\n\nThe taillights disappear around the bend.");
    showChoices([{label:"CONTINUE",action:leavePassingCar}]);
    return;
  }
  leavePassingCar();
}
const passingCarRestoreScene=restoreScene;
restoreScene=function(){
  if(game.inProgress&&game.scene?.kind==="passingCar")return renderPassingCar();
  return passingCarRestoreScene();
};
const passingCarChooseAside=chooseAside;
chooseAside=function(text){
  if(game.scene?.kind==="passingCar")return "";
  return passingCarChooseAside(text);
};

