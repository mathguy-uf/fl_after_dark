"use strict";

// An illustrated, schematic road map. Geography is deliberately simplified;
// connections and visibility always come from the actual game state.
const MAP_W = 640, MAP_H = 520;
const mapPoints = {
  gainesville:[326,137], paynesPrairie:[335,157], suwanneeRiver:[279,125],
  cedarKey:[281,170], oldFishingPier:[266,191], citrusStand:[337,180],
  ocalaForest:[365,196], boatRamp:[300,204], abandonedMotel:[362,228],
  stAugustine:[402,132], spaceCoast:[441,242], evergladesRoad:[433,385],
  keysCauseway:[400,444], station17:[457,400]
};
const mapCallouts = {
  gainesville:[304,87], paynesPrairie:[392,158], suwanneeRiver:[242,101],
  cedarKey:[222,154], oldFishingPier:[205,197], citrusStand:[395,194],
  ocalaForest:[432,218], boatRamp:[251,238], abandonedMotel:[329,269],
  stAugustine:[454,116], spaceCoast:[500,260], evergladesRoad:[363,367],
  keysCauseway:[353,459], station17:[517,408]
};
const mapNumbers = Object.freeze(Object.fromEntries(Object.keys(mapPoints).map((key,i)=>[key,i+1])));

function pixelColor(){return getComputedStyle(document.body).getPropertyValue('--bright').trim()||'#c1ffcb';}
function dimPixelColor(){return getComputedStyle(document.body).getPropertyValue('--muted').trim()||'#42b953';}
function mapBackgroundColor(){return getComputedStyle(document.body).getPropertyValue('--bg').trim()||'#020602';}
function mapLocationVisible(key,discovered){
  return !!locations[key] && discovered.has(key) &&
    (key!=='station17'||!game.story||!!game.story.flags?.routeRevelation);
}
function visibleMapLocations(){
  const discovered=new Set(game.player?.discoveredLocations||[]);
  return Object.keys(mapPoints).filter(key=>mapLocationVisible(key,discovered));
}
function visibleMapEdges(keys=visibleMapLocations()){
  const shown=new Set(keys),seen=new Set(),edges=[];
  for(const key of keys)for(const neighbor of locations[key].connections){
    if(!shown.has(neighbor))continue;
    const id=[key,neighbor].sort().join('|');
    if(!seen.has(id)){seen.add(id);edges.push([key,neighbor]);}
  }
  return edges;
}
function plotLine(ctx,x1,y1,x2,y2,color,dash=false){
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash(dash?[5,5]:[]);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}
function mapPolygon(ctx,points){
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
}
function drawFlorida(ctx,bright,dim){
  // Panhandle, Big Bend, Gulf coast, southern peninsula and Atlantic coast.
  const coast=[[43,66],[116,64],[162,67],[208,63],[267,63],[282,56],[302,63],
    [358,67],[391,80],[402,99],[410,126],[416,155],[425,185],[439,213],
    [451,243],[464,270],[472,298],[483,330],[490,363],[486,397],[476,415],
    [455,429],[435,432],[421,425],[411,410],[400,402],[396,385],[383,374],
    [380,351],[365,333],[363,310],[349,290],[348,272],[332,258],[334,244],
    [320,232],[314,211],[303,200],[291,197],[281,180],[273,165],[263,153],
    [245,146],[225,139],[211,132],[192,130],[179,119],[165,115],[146,117],
    [132,109],[116,108],[102,99],[85,102],[72,94],[55,94],[43,85]];
  ctx.save();mapPolygon(ctx,coast);ctx.fillStyle=dim;ctx.globalAlpha=.18;ctx.fill();
  ctx.globalAlpha=1;ctx.strokeStyle=dim;ctx.lineWidth=3;ctx.stroke();
  ctx.clip();
  // Two-pixel dither plus filled tree silhouettes, rather than a wire outline.
  ctx.fillStyle=dim;ctx.globalAlpha=.36;
  for(let y=60;y<432;y+=6)for(let x=42+(y%12?3:0);x<492;x+=7){
    if((x*7+y*3)%19<8)ctx.fillRect(x,y,2,2);
  }
  ctx.globalAlpha=.45;
  for(const [x,y] of [[90,78],[135,86],[174,81],[211,94],[244,80],[307,106],[351,112],[366,168],[390,233],[414,278]]){
    mapPolygon(ctx,[[x,y-11],[x-7,y+3],[x-4,y+3],[x-9,y+10],[x+9,y+10],[x+4,y+3],[x+7,y+3]]);ctx.fill();ctx.fillRect(x-1,y+8,3,6);
  }
  // Lake Okeechobee and sawgrass texture in the southern peninsula.
  ctx.globalAlpha=1;ctx.fillStyle=mapBackgroundColor();
  mapPolygon(ctx,[[447,325],[459,327],[464,337],[459,348],[448,349],[440,339]]);ctx.fill();
  ctx.strokeStyle=dim;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=.5;ctx.fillStyle=dim;
  for(let y=369;y<421;y+=11)for(let x=408;x<477;x+=13){ctx.fillRect(x,y,2,6);ctx.fillRect(x-3,y+2,2,3);}
  ctx.restore();
  // The Keys sweep southwest off the peninsula, rather than east into the sea.
  ctx.fillStyle=dim;
  [[429,438,7,3],[420,443,7,4],[409,447,7,4],[397,452,8,3],[384,457,6,3],[373,461,5,3]].forEach(r=>ctx.fillRect(...r));
  ctx.save();ctx.globalAlpha=.4;
  for(const [x,y] of [[70,174],[115,211],[71,290],[167,327],[199,401],[524,174],[557,220],[551,329],[527,449]]){
    plotLine(ctx,x,y,x+13,y,dim);plotLine(ctx,x+19,y+4,x+29,y+4,dim);
  }ctx.restore();
  ctx.font='18px monospace';ctx.fillStyle=dim;ctx.fillText('GULF',102,273);ctx.fillText('ATLANTIC',508,302);
  // Compass rose, with a filled diamond and restrained cartographic border.
  const x=561,y=80;ctx.fillStyle=bright;
  mapPolygon(ctx,[[x,y-23],[x+6,y],[x,y+23],[x-6,y]]);ctx.fill();
  plotLine(ctx,x-16,y,x+16,y,dim);ctx.font='18px monospace';ctx.fillText('N',x-5,y-31);
  ctx.strokeStyle=dim;ctx.lineWidth=1;ctx.strokeRect(12.5,12.5,615,494);
  ctx.font='15px monospace';ctx.fillStyle=dim;ctx.fillText('FLORIDA / NIGHT ROADS',27,37);
  ctx.font='13px monospace';ctx.fillText('ILLUSTRATED ROUTES / NOT TO SCALE',27,492);
}
function drawRoadMap(){
  const canvas=document.getElementById('pixel-map-canvas');if(!canvas||!game?.player)return;
  const ctx=canvas.getContext('2d'),bright=pixelColor(),dim=dimPixelColor(),bg=mapBackgroundColor();
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,MAP_W,MAP_H);ctx.fillStyle=bg;ctx.fillRect(0,0,MAP_W,MAP_H);
  drawFlorida(ctx,bright,dim);
  const keys=visibleMapLocations();
  for(const [a,b] of visibleMapEdges(keys)){
    const [x,y]=mapPoints[a],[u,v]=mapPoints[b];
    // Dark road bed keeps the route legible over the landscape texture.
    ctx.strokeStyle=bg;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.stroke();
    plotLine(ctx,x,y,u,v,bright,locations[a].hidden||locations[b].hidden);
  }
  for(const key of keys){
    const [x,y]=mapPoints[key],[lx,ly]=mapCallouts[key],current=key===game.player.location;
    plotLine(ctx,x,y,lx,ly,dim,true);
    ctx.fillStyle=bright;ctx.fillRect(x-3,y-3,7,7);
    ctx.fillStyle=current?bright:bg;ctx.fillRect(lx-16,ly-14,32,28);
    ctx.strokeStyle=current?bright:dim;ctx.lineWidth=2;ctx.strokeRect(lx-16,ly-14,32,28);
    if(current)ctx.strokeRect(lx-20,ly-18,40,36);
    ctx.font='bold 21px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=current?bg:bright;
    ctx.fillText(String(mapNumbers[key]).padStart(2,'0'),lx,ly+1);ctx.textAlign='start';ctx.textBaseline='alphabetic';
  }
}
function renderMapIllustration(){
  const canvas=document.getElementById('map-place-art');
  if(!canvas||!game?.player||typeof drawIllustratedScene!=='function')return;
  drawIllustratedScene(canvas.getContext('2d'),sceneColors(),game.player.location);
}
function renderAppleMap(){
  const map=document.getElementById('map-content');if(!map||!game?.player)return;
  map.replaceChildren();const keys=visibleMapLocations(),shown=new Set(keys),current=game.player.location;
  const card=document.createElement('div');card.className='map-place-card';
  const thumb=document.createElement('canvas');thumb.id='map-place-art';thumb.className='scene-canvas';thumb.width=SCENE_W;thumb.height=SCENE_H;
  thumb.setAttribute('role','img');thumb.setAttribute('aria-label',`Illustration of ${locations[current].name}`);
  const heading=document.createElement('div');const kicker=document.createElement('span');kicker.className='map-kicker';kicker.textContent='YOU ARE HERE';
  const name=document.createElement('strong');name.textContent=`${String(mapNumbers[current]).padStart(2,'0')} / ${locations[current].name}`;
  heading.append(kicker,name);card.append(thumb,heading);map.appendChild(card);
  const frame=document.createElement('div');frame.className='apple-map-frame';
  const canvas=document.createElement('canvas');canvas.id='pixel-map-canvas';canvas.className='pixel-map-canvas';canvas.width=MAP_W;canvas.height=MAP_H;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Illustrated Florida route map. Current location: ${locations[current].name}. Numbered locations and road connections are listed below.`);
  frame.appendChild(canvas);map.appendChild(frame);
  const legend=document.createElement('p');legend.className='apple-map-legend';legend.textContent='Filled number: you are here. Lines: discovered roads. Numbers match the key below.';map.appendChild(legend);
  const list=document.createElement('ol');list.className='route-list';
  for(const key of keys){
    const row=document.createElement('li');row.value=mapNumbers[key];row.className=key===current?'map-current':'';
    const title=document.createElement('strong');title.textContent=locations[key].name+(key===current?' — YOU ARE HERE':'');
    const roads=document.createElement('span');roads.textContent='Roads to: '+locations[key].connections.filter(k=>shown.has(k)).map(k=>locations[k].name).join(' / ');
    row.append(title,roads);list.appendChild(row);
  }
  map.appendChild(list);drawRoadMap();renderMapIllustration();
}
renderMap=renderAppleMap;
