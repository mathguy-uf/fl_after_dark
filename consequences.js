"use strict";
// Explicit, serializable scene identifiers; no functions are stored in saves.
const sceneFunctions={openTheLetter,readBackOfLetter,beginTheDrive,showLocationScene,finaleArchive,finaleTonight,finaleMonitor,finaleLetter,finaleTypeLetter,finaleBucket,finaleLoop,pierRecognition,motelRegister,gatorHeadline,roadEcho,routeRevelation};
for(const name of Object.keys(sceneFunctions)){
 const original=sceneFunctions[name];
 window[name]=function(...args){game.scene={kind:'function',name};return original(...args);};
}
const decisionMoments=[
 {id:'help',location:'suwanneeRiver',text:'A driver waves beside a stalled pickup. She needs a jump. The road behind you is empty.',options:[['STOP AND HELP','You wait while her engine catches. She writes your plate number on her palm. “If you need help, I will remember.”',8],['KEEP DRIVING','Her hazard lights shrink in the mirror. You tell yourself somebody else will stop.',0]],echo:['The woman from the pickup has left a fuel can beside the Space Coast pump. Your plate number is written on it. You gain 18 fuel.','At the Space Coast pump, the same pickup passes on a tow truck. Its driver looks through you.'],later:'spaceCoast'},
 {id:'phone',location:'citrusStand',text:'The payphone rings. On its cracked display: YOUR NUMBER. Answering feels like agreeing to something.',options:[['ANSWER','Your voice says: “When the motel television starts counting, unplug it.”',3],['LET IT RING','The ringing stops. A message indicator blinks, although this phone has no answering machine.',0]],echo:['You unplug the motel television before it counts down. A key falls from behind it. You keep it.','The motel television counts down. At zero every door slams. You lose twelve minutes finding the exit.'],later:'abandonedMotel'},
 {id:'coin',location:'oldFishingPier',requires:'strangeCoin',text:'In the pier window, a shirtless man in alligator boots holds out his hand. Rain runs down the glass between you. “My coin,” he says. You could slide it through the broken pane.',options:[['SLIDE THE COIN THROUGH','The coin leaves your pocket. Before it disappears you copy its engraved coordinates onto your map.',0],['KEEP THE COIN','You close your fist. The figure waits. You look away first.',0]],echo:['The Station 17 toll slot contains your coin already. The door opens without a sound.','The Station 17 door demands your coin. You finally surrender it. The lock takes seven minutes to turn.'],later:'station17'},
 {id:'tape',location:'abandonedMotel',requires:'cassetteTape',text:'A cassette player waits on the bed. SIDE B ONLY fits perfectly. You can hear your own breathing before pressing Play.',options:[['PLAY THE CASSETTE','Your recorded voice describes a washed-out turn on the road south. You mark the safe approach.',5],['KEEP IT UNPLAYED','You wrap the cassette in the motel towel. Whatever it knows can wait.',0]],echo:['You recognize the washed-out turn from the tape and take the dry shoulder.','The road gives way at the turn. You backtrack through standing water, losing 8 fuel and twenty minutes.'],later:'evergladesRoad'},
 {id:'warning',location:'spaceCoast',text:'A family in a station wagon asks about the road south. Their child is holding a postcard of Station 17.',options:[['WARN THEM TO TURN BACK','The parent studies your face, then turns north. The child leaves the postcard on your hood.',4],['SAY THE ROAD IS CLEAR','They thank you and head south. Their radio is tuned to 103.7.',0]],echo:['At the Everglades junction the family’s postcard now says THANK YOU. The southbound lanes are empty.','At the Everglades junction you find the station wagon abandoned. Its radio says: “We followed your directions.”'],later:'evergladesRoad'},
 {id:'register',location:'abandonedMotel',text:'The motel register lists your name beside tomorrow’s date. A pencil lies across a line marked NEXT DRIVER.',options:[['CROSS OUT YOUR NAME','The paper tears under the pencil. Somewhere a printer stops.',2],['SIGN THE NEXT LINE','Your hand knows the signature. Somewhere a printer starts.',2]],echo:['The Station 17 archive cannot match your signature. A blank incident sheet waits for a choice you have not made.','The Station 17 archive contains your signed authorization. Every incident was filed under your name before you arrived.'],later:'station17'},
 {id:'reserve',location:'ocalaForest',text:'An emergency fuel can hangs beneath a sign: FOR THE NEXT STRANDED DRIVER. Your tank is not full.',options:[['LEAVE IT FOR SOMEBODY ELSE','You tighten the cap and leave the can hanging where it can be seen.',0],['TAKE THE RESERVE','You pour the fuel into your tank. The empty can swings beneath the sign. You gain 12 fuel.',3]],echo:['At the Space Coast pump a note thanks the driver who left the reserve. Somebody made it home tonight.','At the Space Coast pump a dispatcher asks who emptied the forest reserve. A driver is still waiting in the dark.'],later:'spaceCoast'}
];
function decisions(){return ensureStoryState().decisions ||= {};}
function showDecision(id){
 const m=decisionMoments.find(m=>m.id===id);game.scene={kind:'decision',id};
 showNarrative(m.text);showChoices(m.options.map((o,i)=>({label:o[0],action:()=>{
  decisions()[id]=i;game.story.currentEventId="decision:"+id;addStoryAction({label:o[0]});advanceTime(o[2]);
  if(id==='coin'&&i===0){game.story.coinRecorded=true;game.player.inventory=game.player.inventory.filter(x=>x!=='strangeCoin');}
  if(id==='reserve'&&i===1)game.player.fuel=Math.min(100,game.player.fuel+12);
  showResult(o[1]);updateHUD();
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
storyActionSummary=function(){return previousSummary()+'\n\nDECISIONS THAT REACHED THE ARCHIVE\n'+decisionMoments.filter(m=>decisions()[m.id]!==undefined).map(m=>'• '+m.options[decisions()[m.id]][0]+(game.story.callbacks?.[m.id]?' — '+m.echo[decisions()[m.id]]:'')).join('\n');};
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
