const fs=require('fs'),vm=require('vm');
const root=require('path').join(__dirname,'../');
function harness(){
 const ready=[]; const els=new Map(), timers=[]; let store={};
 const element=(tag='div')=>({tagName:tag.toUpperCase(),textContent:'',hidden:false,children:[],dataset:{},classList:{add(){},remove(){}},setAttribute(){},append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},replaceChildren(...x){this.children=x},addEventListener(k,f){this[k]=f},querySelector(){return null},querySelectorAll(){return []},focus(){}});
 const document={body:element(),getElementById(id){if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element,querySelector(){return element()},querySelectorAll(){return []},addEventListener(type,fn){if(type==="DOMContentLoaded")ready.push(fn)}};
 const c=vm.createContext({document,console:{...console,error(){}},Math,Date,Uint32Array,crypto:{getRandomValues(a){a[0]=1234;return a}},localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=v}},matchMedia(){return {matches:true}},setInterval(){return 1},clearInterval(){},setTimeout(f,ms){timers.push({f,ms});return timers.length},clearTimeout(id){if(timers[id-1])timers[id-1].f=()=>{};},MutationObserver:class{observe(){}},getComputedStyle(){return {getPropertyValue(){return ''}}}});c.window=c;c.confirm=()=>true;
 for(const p of ['game.js','map.js','scenes.js','humor.js','story.js','story-scenes.js','consequences.js','endings.js'])vm.runInContext(fs.readFileSync(root+p,'utf8'),c,{filename:p});
 const run=s=>vm.runInContext(s,c);run('settings.motionDisabled=true;game.seed=1234;beginNight()');
 return {run,timers,els,ready};
}
const assert=require('assert');
let h=harness();
h.run('saveGame();loadGame()');assert(h.els.get('choices').children[0].textContent.includes('OPEN THE LETTER'));
h.run('beginTheDrive();game.story.evidence.push("pier");localStorage.setItem(SAVE_KEY,"bad");loadGame()');assert(h.run('game.story.evidence.includes("pier")'));
h=harness();h.run('game.player.location="station17";triggerEvent("station17",false)');assert(h.els.get('choices').children[1].textContent.includes('WATCH THE MONITOR'));
h.run('finaleMonitor();saveGame();loadGame()');assert(h.els.get('choices').children[0].textContent.includes('READ THE LETTER'));
for(const id of ['help','phone','coin','tape','warning','register','reserve'])for(const v of [0,1]){
 h=harness();h.run('beginTheDrive();game.player.inventory.push("strangeCoin","cassetteTape");showDecision('+JSON.stringify(id)+')');h.els.get('choices').children[v].click();h.run('saveGame();loadGame()');assert.equal(h.run('decisions()['+JSON.stringify(id)+']'),v);h.run('game.player.location=decisionMoments.find(m=>m.id==='+JSON.stringify(id)+').later;for(let step=0;step<6;step++)showLocationActions()');assert(h.run('game.story.callbacks['+JSON.stringify(id)+']'));if(id==='coin')assert(h.run('hasItem("strangeCoin")'));
}
for(const p of fs.readdirSync(root).filter(p=>p.endsWith('.js')))new vm.Script(fs.readFileSync(root+p,'utf8'),{filename:p});
console.log('PASS: opening/finale restore, failed load preserves progress, unified finale, all 14 decision branches persist and trigger callbacks, coin clue retained, all scripts parse.');

const reached=new Set();
for(let bits=0;bits<128;bits++){
 h=harness();const d=Object.fromEntries(['help','phone','coin','tape','warning','register','reserve'].map((k,i)=>[k,(bits>>i)&1]));
 const key=h.run('selectNightEnding('+JSON.stringify(d)+')');reached.add(key);
 const expected=d.register===0&&d.warning===0&&(d.help===0||d.reserve===0)?'morning':d.register===0&&d.phone===0&&d.tape===0?'silence':d.coin===0?'borrowed':'loop';assert.equal(key,expected);
}
assert.deepEqual([...reached].sort(),['borrowed','loop','morning','silence']);
const routes=[['morning',{register:0,warning:0,help:0}],['silence',{register:0,phone:0,tape:0}],['borrowed',{coin:0}],['loop',{}]];
for(const [key,d] of routes){
 h=harness();h.ready.forEach(fn=>fn());
 h.run('game.story.decisions='+JSON.stringify(d)+';game.player.miles=184;game.player.visitedLocations=["gainesville","citrusStand"];game.player.location="station17";triggerEvent("station17",true)');
 h.els.get('choices').children[0].click();
 for(let i=0;i<6;i++)h.els.get('choices').children[0].click();
 assert.equal(h.run('game.story.report.key'),key);assert.equal(h.run('game.inProgress'),false);
 h.run('saveGame();loadGame()');assert.equal(h.run('game.story.report.key'),key);
 const before=h.run('JSON.stringify(nightStats())');h.els.get('choices').children[0].click();
 assert.equal(h.els.get('postgame-screen').hidden,false);assert.equal(h.els.get('game-screen').hidden,true);
 assert.equal(h.els.get('report-miles').textContent,'184');assert.equal(h.els.get('report-locations').textContent,'2/14');
 h.run('saveGame();loadGame()');assert.equal(h.run('game.story.report.stage'),'summary');assert.equal(h.run('JSON.stringify(nightStats())'),before);
 h.els.get('drive-again-button').onclick();assert.equal(h.els.get('postgame-screen').hidden,true);assert.equal(h.run('game.player.miles'),0);assert.equal(h.run('nightStats().strange.length'),0);assert.equal(h.run('game.story.report'),undefined);
}
for(const key of ['home','fuel']){h=harness();h.run('endGame('+JSON.stringify(key)+');showNightReport();saveGame();loadGame()');assert.equal(h.run('game.story.report.key'),key);assert.equal(h.els.get('postgame-screen').hidden,false);}
h=harness();h.run('showDecision("coin");showDecision("coin");finaleMonitor();saveGame();loadGame()');assert.equal(h.run('nightStats().floridaMen.length'),2);
console.log('PASS: all 128 decision combinations, four complete finale paths, both early endings, report values, report reload, encounter deduplication, and Drive Again reset.');

// One seed-level opportunity; repeated travel is not another lottery ticket.
h=harness();
const selected=h.run('Array.from({length:9000},(_,i)=>i+1000).filter(passingCarEligible)');
assert.equal(selected.length,90);
const selectedSeed=selected[0];
const rejectedSeed=h.run('Array.from({length:9000},(_,i)=>i+1000).find(s=>!passingCarEligible(s))');
h.run('game.seed='+selectedSeed+';beginNight();beginTheDrive();saveGame();loadGame();travelTo("citrusStand")');
assert.equal(h.run('game.scene.kind'),'passingCar');
assert.equal(h.run('game.story.passingCar.phase'),'approach');
assert.equal(h.timers.filter(t=>t.ms===350).length,0);
h.run('saveGame();loadGame()');assert.equal(h.run('game.story.passingCar.phase'),'approach');
h.run('game.player.time=1435'); // 11:55 PM -> 12:12 AM, without moving the game clock.
const clock=h.run('game.player.time');
const beforePass=h.run('JSON.stringify({fuel:game.player.fuel,inventory:game.player.inventory,decisions:decisions(),stats:nightStats(),history:game.eventHistory,ending:selectNightEnding()})');
h.els.get('choices').children[0].click();
assert(h.els.get('narrative').textContent.includes('12:12 AM'));assert(h.els.get('narrative').textContent.includes('Your face.'));
assert.equal(h.run('game.player.time'),clock);assert.equal(h.run('chooseAside(document.getElementById("narrative").textContent)'),"");
assert.equal(h.run('JSON.stringify({fuel:game.player.fuel,inventory:game.player.inventory,decisions:decisions(),stats:nightStats(),history:game.eventHistory,ending:selectNightEnding()})'),beforePass);
h.run('saveGame();loadGame()');assert(h.els.get('narrative').textContent.includes('12:12 AM'));
h.els.get('choices').children[0].click();assert.equal(h.run('game.story.passingCar.phase'),'done');
h.run('saveGame();loadGame()');for(let i=0;i<100;i++)assert.equal(h.run('maybePassingCar()'),false);
// Refusing the shoulder consumes the sole opportunity, too.
h=harness();h.run('game.seed='+selectedSeed+';beginNight();beginTheDrive();travelTo("citrusStand")');h.els.get('choices').children[1].click();assert.equal(h.run('maybePassingCar()'),false);
// Ineligible nights remain ineligible over repeated checks and reloads.
h=harness();h.run('game.seed='+rejectedSeed+';beginNight();beginTheDrive()');for(let i=0;i<100;i++)assert.equal(h.run('maybePassingCar()'),false);h.run('saveGame();loadGame()');assert.equal(h.run('maybePassingCar()'),false);
// Ending takes precedence over the sighting; a fresh run resets the opportunity.
h=harness();h.run('game.seed='+selectedSeed+';beginNight();beginTheDrive();game.player.fuel=1;travelTo("citrusStand")');assert.equal(h.run('game.story.report.key'),'fuel');
h.run('beginNight();beginTheDrive();travelTo("citrusStand")');assert.equal(h.run('game.story.passingCar.phase'),'approach');
console.log('PASS: 90/9000 eligible seeds; single opportunity; both choices; all save phases; midnight time; no gameplay/report changes or humor aside; fuel priority and reset.');
// A connected road journey, using rendered choices rather than assigning clues.
h=harness();h.ready.forEach(fn=>fn());h.run('game.seed=1234;beginNight()');
function clickText(fragment){const b=h.els.get('choices').children.find(b=>b.textContent.includes(fragment));assert(b,'Missing choice '+fragment);b.click();}
function settle(){for(let i=0;i<30;i++){
 const choices=h.els.get('choices').children;
 if(choices.some(b=>b.textContent.includes('EXPLORE AREA')))return;
 if(!choices.length){h.timers.splice(0).forEach(t=>t.f());continue;}
 const decision=h.run('game.scene?.kind==="decision"');
 choices[decision?1:0].click();
 }throw Error('Scene did not settle');}
function drive(name){clickText('DRIVE TO '+name);h.timers.splice(0).forEach(t=>t.f());settle();}
clickText('OPEN THE LETTER');clickText('TURN LETTER OVER');clickText('START SOUTH');settle();
drive('Roadside Citrus Stand');clickText('EXPLORE AREA');settle();assert(h.run('hasItem("coordinatesReceipt")'));
drive('Cedar Key');drive('Old Fishing Pier');clickText('EXPLORE AREA');settle();assert(h.run('hasItem("strangeCoin")'));
drive('Cedar Key');drive('Roadside Citrus Stand');drive('Abandoned Motel');
clickText('EXPLORE AREA');settle();clickText('EXPLORE AREA');settle();assert(h.run('hasItem("cassetteTape")'));
drive('Ocala National Forest');drive('Space Coast');drive('Everglades Road');
assert(h.run('game.story.flags.pierRecognition&&game.story.flags.motelRegister&&game.story.flags.gatorHeadline&&game.story.flags.roadEcho&&game.story.flags.routeRevelation'));
assert(h.run('game.player.discoveredLocations.includes("station17")'));
clickText('DRIVE TO Station 17');h.timers.splice(0).forEach(t=>t.f());
// Resolve arrival callbacks before approaching the door, if any.
if(!h.els.get('choices').children.some(b=>b.textContent.includes('STEP INSIDE'))){settle();clickText('EXPLORE AREA');}
clickText('STEP INSIDE');
for(let i=0;i<6;i++){h.run('saveGame();loadGame()');h.els.get('choices').children[0].click();}
assert.equal(h.run('game.story.report.key'),'loop');assert(h.els.get('narrative').textContent.includes('Your boots are wet.'));assert(h.els.get('narrative').textContent.includes('12:47 AM'));
console.log('PASS: connected Gainesville-to-Station-17 journey, all clues and middle beats, saved finale stages, and wet-boots loop.');
