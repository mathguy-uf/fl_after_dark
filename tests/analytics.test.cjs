const fs=require('fs'),vm=require('vm');
const root=require('path').join(__dirname,'../');
function harness(options={}){
 const ready=[]; const els=new Map(), timers=[]; let store=options.store || {}; const hits=[]; let serial=0;
 const element=(tag='div')=>({tagName:tag.toUpperCase(),textContent:'',hidden:false,children:[],dataset:{},classList:{add(){},remove(){}},setAttribute(){},append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},replaceChildren(...x){this.children=x},addEventListener(k,f){this[k]=f},querySelector(){return null},querySelectorAll(){return []},focus(){}});
 const document={body:element(),getElementById(id){if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element,querySelector(){return element()},querySelectorAll(){return []},addEventListener(type,fn){if(type==="DOMContentLoaded")ready.push(fn)}};
 const c=vm.createContext({document,console:{...console,error(){}},Math,Date,Uint32Array,crypto:{randomUUID(){return `run-${++serial}-${options.page || 0}`},getRandomValues(a){a[0]=1234;return a}},localStorage:{getItem(k){if(options.blockStorage)throw Error("blocked");return store[k]??null},setItem(k,v){if(options.blockStorage)throw Error("blocked");store[k]=v}},matchMedia(){return {matches:true}},setInterval(){return 1},clearInterval(){},setTimeout(f,ms){timers.push({f,ms});return timers.length},clearTimeout(id){if(timers[id-1])timers[id-1].f=()=>{};},MutationObserver:class{observe(){}},getComputedStyle(){return {getPropertyValue(){return ''}}}});c.window=c;c.confirm=()=>options.confirm !== false;
 c.location={hostname:options.local ? 'localhost' : 'mathguy-uf.github.io',pathname:'/fl_after_dark/'};
 c.navigator={locks:options.locks};
 c.fetch=async url=>{hits.push(url.split('_v2_')[1]);if(options.fetch)return options.fetch(url);return {ok:true,json:async()=>({value:1})};};
 for(const p of ['game.js','map.js','scenes.js','humor.js','story.js','story-scenes.js','consequences.js','endings.js','illustrations.js','runtime.js'])vm.runInContext(fs.readFileSync(root+p,'utf8'),c,{filename:p});
 const run=s=>vm.runInContext(s,c);run('settings.motionDisabled=true;game.seed=1234');ready.forEach(fn=>fn());
 return {run,timers,els,ready,store,hits,async settle(){for(let i=0;i<6;i++)await run("Promise.all([...playCountTasks.values()])")}};
}

const assert=require('node:assert/strict');
(async()=>{
 let h=harness({confirm:false});
 assert.deepEqual(h.hits,[]);
 h.els.get('begin-button').onclick(); await h.settle();
 assert.deepEqual(h.hits,['starts','unique_players']);
 h.els.get('new-button').onclick();await h.settle();
 assert.equal(h.run('game.inProgress'),true);assert.equal(h.hits.length,2);
 await h.run('trackNightStart()');await h.settle();assert.equal(h.hits.length,2);
 h.run('saveGame();finishNight("home")');await h.settle();
 assert.deepEqual(h.hits,['starts','unique_players','ending_home']);
 h.run('loadGame();finishNight("fuel");showNightReport()');await h.settle();
 assert.equal(h.hits.length,3,'loading earlier save cannot count another ending');
 const reloaded=harness({store:h.store,page:2});
 reloaded.run('loadGame();finishNight("fuel")');await reloaded.settle();assert.deepEqual(reloaded.hits,[]);
 h.els.get('drive-again-button').onclick();await h.settle();
 assert.equal(h.hits.filter(x=>x==='starts').length,2);assert.equal(h.hits.filter(x=>x==='unique_players').length,1);
 h.run('finishNight("loop")');await h.settle();assert.equal(h.hits.at(-1),'ending_loop');
 h=harness();h.run('beginNight()');await h.settle();
 h.els.get('new-button').onclick();await h.settle();assert.equal(h.hits.length,2);assert.equal(h.run('game.inProgress'),false);
 h.els.get('begin-button').onclick();await h.settle();assert.equal(h.hits.filter(x=>x==='starts').length,2);
 // A fast ending waits for the start request, and duplicate completions queue.
 let release;h=harness({fetch:url=>url.endsWith('_starts')?new Promise(r=>{release=r}):Promise.resolve({ok:true,json:async()=>({value:1})})});
 h.run('beginNight();finishNight("home");trackNightComplete("fuel")');
 await new Promise(r=>setImmediate(r));assert.deepEqual(h.hits,['starts']);
 release({ok:true,json:async()=>({value:1})});await h.settle();assert.equal(h.hits.filter(x=>x.startsWith('ending_')).length,1);
 // Failed/ambiguous requests are never blindly retried or turned into completions.
 h=harness({fetch:async()=>{throw Error('offline')}});h.run('beginNight();finishNight("home")');await h.settle();
 await h.run('trackNightComplete("home")');assert.deepEqual(h.hits,['starts']);
 for(const options of [{local:true},{blockStorage:true}]){h=harness(options);h.run('beginNight();finishNight("home")');await h.settle();assert.deepEqual(h.hits,[]);}
 h=harness();h.run('beginNight()');await h.settle();h.run('delete game.story.playCount;finishNight("home")');await h.settle();assert.equal(h.hits.length,2,'legacy nights excluded');
 // Shared browser locks prevent two tabs completing the same saved run twice.
 const queues=new Map();const locks={request(key,fn){const p=(queues.get(key)||Promise.resolve()).then(fn);queues.set(key,p.catch(()=>{}));return p;}};
 h=harness({locks});h.run('beginNight()');await h.settle();h.run('saveGame()');
 const tab=harness({store:h.store,locks,page:3});tab.run('loadGame()');
 h.run('finishNight("home")');tab.run('finishNight("fuel")');await Promise.all([h.settle(),tab.settle()]);
 assert.equal([...h.hits,...tab.hits].filter(x=>x.startsWith('ending_')).length,1);
 console.log('PASS: lifecycle starts, cancel/restart, replay, saved-run/reload and cross-tab deduplication, early endings, network/storage failures, legacy saves, local-only exclusion.');
 // Test dashboard against known results and unavailable/malformed responses.
 const script=fs.readFileSync(root+'stats.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
 const els=new Map();const el=id=>{if(!els.has(id))els.set(id,{textContent:'',addEventListener(){}});return els.get(id)};
 let invalid=false;const values={unique_players:8,starts:10,ending_morning:1,ending_silence:1,ending_borrowed:1,ending_loop:1,ending_home:2,ending_fuel:1};
 const c=vm.createContext({Date,document:{getElementById:el,querySelectorAll:()=>[...els.values()]},fetch:async url=>({ok:true,status:200,json:async()=>({value:invalid?'broken':values[url.split('_v2_')[1]]})})});
 vm.runInContext(script.replace('    refreshStats();',''),c);
 await vm.runInContext('refreshStats()',c);assert.equal(el('completions').textContent,'7');assert.equal(el('completion-rate').textContent,'70%');assert.equal(el('station17-endings').textContent,'4');
 invalid=true;await vm.runInContext('refreshStats()',c);assert.equal(el('completions').textContent,'—');assert.match(el('status').textContent,/could not be read/);
 console.log('PASS: dashboard sums endings, distinguishes Station 17, and clears stale counts on errors.');
})().catch(e=>{console.error(e);process.exitCode=1});
