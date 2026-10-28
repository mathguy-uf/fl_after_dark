const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const images = [], calls = [], redraws = [];
const ctx = { fillRect(){}, fillText(t){calls.push(['text',t]);}, drawImage(...args){calls.push(['image',...args]);} };
const colors = {bg:'#020602',dim:'#42b953'};
const context = vm.createContext({
  document:{addEventListener(){},getElementById(){return null;}},
  Image:class{constructor(){images.push(this);}},
  SCENE_W:504, SCENE_H:216, ctx, colors,
  currentArt:'letter',
  renderScene(){redraws.push(context.currentArt);}
});
vm.runInContext(fs.readFileSync(path.join(root,'illustrations.js'),'utf8'),context);
const run = s => vm.runInContext(s,context);

for(const [name,file] of Object.entries(run('ILLUSTRATION_ATLASES'))){
  const data=fs.readFileSync(path.join(root,file));
  assert.equal(data.toString('ascii',0,4),'RIFF',name);
  assert.equal(data.toString('ascii',8,12),'WEBP',name);
}
const keys=run('Object.keys(SCENE_ILLUSTRATIONS)');
assert.equal(keys.length,24);
for(const key of [...keys,'alligator','motel','tower']){
  const spec=run(`illustrationFor(${JSON.stringify(key)})`);
  assert(spec.description.length>10);
  const [x,y,w,h]=spec.rect;
  assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024,key);
}
assert.equal(run('illustrationFor("motel")===SCENE_ILLUSTRATIONS.abandonedMotel'),true);
assert.equal(run('illustrationFor("tower")===SCENE_ILLUSTRATIONS.station17'),true);

assert.equal(run('drawIllustratedScene(ctx,colors,"letter")'),'loading');
assert.equal(images.length,1);
assert.equal(calls.at(-1)[0],'text');
run('drawIllustratedScene(ctx,colors,"bucket")');
assert.equal(images.length,1,'one load per atlas');
context.currentArt='bucket';images[0].onload();
assert.equal(redraws.at(-1),'bucket','a late load redraws current scene');
assert.equal(run('drawIllustratedScene(ctx,colors,"bucket")'),'ready');
assert.equal(calls.at(-1)[0],'image');
assert.equal(ctx.imageSmoothingEnabled,false);

assert.equal(run('drawIllustratedScene(ctx,colors,"gainesville")'),'loading');
assert.equal(images.length,2);
images[1].onerror();
assert.equal(run('drawIllustratedScene(ctx,colors,"gainesville")'),'error');
assert.equal(calls.at(-1)[1],'SCENE ART UNAVAILABLE');
assert.equal(images.length,2,'failure does not create a request loop');

const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('src="illustrations.js')<html.indexOf('src="runtime.js'));
assert(html.includes('id="title-scene"'));
assert(!html.includes('class="ascii-palms"'));
console.log('PASS: 24 source panels and alligator crop, asset files, aliases, load cache, stale-load handling, error fallback, pixel sampling and script order.');
