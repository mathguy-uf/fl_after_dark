const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const c=vm.createContext({game:{player:{location:'gainesville',discoveredLocations:['gainesville','paynesPrairie','suwanneeRiver','citrusStand']},story:{flags:{}}}});
vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8').match(/const locations = [\s\S]*?\n};/)[0],c);
vm.runInContext('var renderMap;',c);vm.runInContext(fs.readFileSync(path.join(root,'map.js'),'utf8'),c);
const run=s=>vm.runInContext(s,c),plain=s=>JSON.parse(JSON.stringify(run(s)));
assert.deepEqual(plain('visibleMapLocations()'),['gainesville','paynesPrairie','suwanneeRiver','citrusStand']);
assert.equal(run('visibleMapEdges().length'),3);
run('game.player.discoveredLocations=Object.keys(locations)');
assert(!run('visibleMapLocations().includes("station17")'));
assert(!run('visibleMapEdges().flat().includes("station17")'));
run('game.story.flags.routeRevelation=true');assert.equal(run('visibleMapLocations().length'),14);
assert(run('visibleMapEdges().some(e=>e.includes("station17")&&e.includes("evergladesRoad"))'));
const edges=plain('visibleMapEdges()').map(e=>e.sort().join('|'));assert.equal(new Set(edges).size,edges.length);
const points=plain('mapPoints'),labels=plain('mapCallouts'),numbers=plain('mapNumbers');
assert.equal(new Set(Object.values(numbers)).size,14);
for(const [k,[x,y]] of Object.entries(points)){
 assert(x>=0&&x<640&&y>=0&&y<520,k);
 assert(labels[k],k);assert(numbers[k],k);
 const [lx,ly]=labels[k];assert(lx>=20&&lx<=620&&ly>=18&&ly<=502,k);
}
// Even the complete map's numbered callouts must not overlap one another.
const entries=Object.entries(labels);
for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
 const [a,[x,y]]=entries[i],[b,[u,v]]=entries[j];assert(Math.abs(x-u)>=32||Math.abs(y-v)>=28,`${a} overlaps ${b}`);
}
run('game.player.discoveredLocations=["gainesville","station17"];game.story.flags.routeRevelation=false');
assert.deepEqual(plain('visibleMapLocations()'),['gainesville']);assert.equal(run('visibleMapEdges().length'),0);
console.log('PASS: starting routes, all 14 locations, hidden Station 17, unique edges, stable numbering, bounds and non-overlapping callouts.');
