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
 h=harness();h.run('beginTheDrive();game.player.inventory.push("strangeCoin","cassetteTape");showDecision('+JSON.stringify(id)+')');h.els.get('choices').children[v].click();h.run('saveGame();loadGame()');assert.equal(h.run('decisions()['+JSON.stringify(id)+']'),v);h.run('game.player.location=decisionMoments.find(m=>m.id==='+JSON.stringify(id)+').later;showLocationActions()');assert(h.run('game.story.callbacks['+JSON.stringify(id)+']'));if(id==='coin')assert(h.run('hasItem("strangeCoin")'));
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
