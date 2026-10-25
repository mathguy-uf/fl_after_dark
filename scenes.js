"use strict";

// FLORIDA AFTER DARK — APPLE II-STYLE SCENE ILLUSTRATIONS
// Procedural 280x128 monochrome pictures inspired by early home-computer
// adventure graphics. Everything is drawn at runtime; no external art assets.

const SCENE_W = 280, SCENE_H = 128;

function sceneColors() {
  const css = getComputedStyle(document.body);
  return {
    bright: css.getPropertyValue("--bright").trim() || "#c1ffcb",
    dim: css.getPropertyValue("--muted").trim() || "#42b953",
    bg: css.getPropertyValue("--bg").trim() || "#020602"
  };
}

function pxLine(ctx,x1,y1,x2,y2,c){ ctx.strokeStyle=c; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5); ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5); ctx.stroke(); }
function moon(ctx,c,x=224,y=20){ctx.strokeStyle=c;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.stroke();ctx.fillRect(x+3,y-5,1,1);ctx.fillRect(x-4,y+2,1,1);}
function stars(ctx,c,n=28){ctx.fillStyle=c;for(let i=0;i<n;i++){const x=(i*47+19)%270,y=(i*29+7)%55;ctx.fillRect(x,y,1,1);}}
function road(ctx,c){pxLine(ctx,92,127,132,69,c);pxLine(ctx,188,127,150,69,c);for(let y=80;y<126;y+=13){const w=(y-68)/7;ctx.fillStyle=c;ctx.fillRect(140-w/2,y,Math.max(1,w),1);}}
function palms(ctx,c,x,y,s=1){ctx.fillStyle=c;ctx.fillRect(x,y,2,28*s);for(let i=0;i<5;i++){pxLine(ctx,x+1,y,x-12+i*6,y-7-Math.abs(2-i)*2,c);} }
function water(ctx,c,y=80){for(let yy=y;yy<126;yy+=7){for(let x=(yy%14);x<278;x+=19)ctx.fillRect(x,yy,8,1);}}
function pine(ctx,c,x,y,h=38){pxLine(ctx,x,y,x,y+h,c);for(let yy=y+5;yy<y+h-5;yy+=7){const w=(yy-y)/3+5;pxLine(ctx,x-w,yy,x,yy-8,c);pxLine(ctx,x+w,yy,x,yy-8,c);}}
function car(ctx,c){ctx.strokeStyle=c;ctx.strokeRect(108,91,61,19);pxLine(ctx,118,91,127,81,c);pxLine(ctx,127,81,153,81,c);pxLine(ctx,153,81,162,91,c);ctx.fillRect(116,109,10,4);ctx.fillRect(151,109,10,4);ctx.fillRect(111,96,4,3);ctx.fillRect(163,96,4,3);}

function drawLocation(ctx,key,c){stars(ctx,c.dim);moon(ctx,c.dim);
  if(key==="gainesville"||key==="citrusStand"){road(ctx,c.dim);ctx.strokeStyle=c.bright;ctx.strokeRect(18,61,67,35);ctx.fillText(key==="citrusStand"?"ORANGES / BAIT":"GAS",27,74);ctx.fillRect(28,81,8,15);ctx.fillRect(58,79,16,9);palms(ctx,c.dim,232,69);}
  else if(key==="paynesPrairie"){ctx.fillStyle=c.dim;ctx.fillRect(0,87,280,1);for(let x=5;x<275;x+=11)ctx.fillRect(x,91+(x%3),7,1);road(ctx,c.dim);ctx.fillStyle=c.bright;ctx.fillRect(55,82,18,5);ctx.fillRect(58,87,2,5);ctx.fillRect(69,87,2,5);}
  else if(key==="ocalaForest"){for(let x=8;x<275;x+=22)pine(ctx,c.dim,x,54+(x%17),55);road(ctx,c.bright);}
  else if(key==="cedarKey"||key==="oldFishingPier"||key==="boatRamp"||key==="suwanneeRiver"){water(ctx,c.dim,72);pxLine(ctx,0,70,280,70,c.dim);if(key==="oldFishingPier"){pxLine(ctx,32,72,187,91,c.bright);for(let x=42;x<180;x+=24)pxLine(ctx,x,75,x,111,c.dim);ctx.fillRect(160,61,14,9);}else if(key==="boatRamp"){pxLine(ctx,72,127,125,72,c.bright);pxLine(ctx,155,127,139,72,c.bright);}else{for(let x=15;x<275;x+=37)palms(ctx,c.dim,x,50,0.7);}}
  else if(key==="abandonedMotel"){ctx.strokeStyle=c.bright;ctx.strokeRect(20,55,238,52);for(let x=31;x<245;x+=35){ctx.strokeRect(x,71,24,34);ctx.fillText("17",x+7,86);}ctx.fillText("VAC NCY",99,65);ctx.fillRect(0,108,280,1);}
  else if(key==="stAugustine"){ctx.strokeStyle=c.dim;ctx.strokeRect(17,60,245,52);for(let x=27;x<250;x+=45){ctx.strokeRect(x,77,27,35);ctx.beginPath();ctx.arc(x+13,77,13,Math.PI,0);ctx.stroke();}ctx.fillRect(0,113,280,1);}
  else if(key==="spaceCoast"){ctx.fillStyle=c.dim;ctx.fillRect(0,103,280,1);pxLine(ctx,192,101,205,36,c.bright);pxLine(ctx,218,101,205,36,c.bright);ctx.fillRect(202,28,7,75);for(let y=37;y<96;y+=12)ctx.fillRect(199,y,13,1);ctx.fillText("17",203,24);}
  else if(key==="evergladesRoad"){for(let x=0;x<280;x+=8){pxLine(ctx,x,102,x+3,82+(x%9),c.dim);}road(ctx,c.bright);ctx.fillStyle=c.dim;ctx.fillRect(0,103,85,1);ctx.fillRect(196,103,84,1);}
  else if(key==="keysCauseway"){water(ctx,c.dim,78);pxLine(ctx,0,87,280,87,c.bright);for(let x=15;x<280;x+=30)pxLine(ctx,x,87,x,111,c.dim);car(ctx,c.bright);}
  else if(key==="station17"){ctx.strokeStyle=c.bright;ctx.strokeRect(66,61,143,54);ctx.fillText("17",130,91);pxLine(ctx,214,113,236,20,c.dim);pxLine(ctx,258,113,236,20,c.dim);for(let y=31;y<106;y+=13)pxLine(ctx,221,y,251,y,c.dim);ctx.fillRect(0,116,280,1);}
  else { road(ctx,c.dim); palms(ctx,c.dim,34,69); palms(ctx,c.dim,240,73); }
}

function drawFloridaMan(ctx,c){stars(ctx,c.dim,18);ctx.fillStyle=c.dim;ctx.fillRect(0,111,280,1);road(ctx,c.dim); // gloriously crude human
  ctx.strokeStyle=c.bright;ctx.beginPath();ctx.arc(145,48,10,0,Math.PI*2);ctx.stroke();ctx.fillRect(141,59,9,28);pxLine(ctx,142,64,125,82,c.bright);pxLine(ctx,149,64,166,80,c.bright);pxLine(ctx,143,87,132,109,c.bright);pxLine(ctx,149,87,160,109,c.bright);ctx.strokeRect(130,106,10,5);ctx.strokeRect(157,106,11,5);
  // mullet, shells, hat and inexplicable bucket
  ctx.fillStyle=c.dim;ctx.fillRect(134,38,22,3);ctx.fillRect(139,34,15,4);ctx.fillRect(154,45,4,16);for(let i=0;i<5;i++)ctx.fillRect(137+i*4,61+i%2,2,2);ctx.strokeRect(174,79,25,28);ctx.fillText("BAIT",177,94);ctx.fillText("FLORIDA MAN",96,122);
}

function drawAlligator(ctx,c){stars(ctx,c.dim);water(ctx,c.dim,91);ctx.fillStyle=c.bright;ctx.fillRect(75,77,105,10);ctx.fillRect(54,81,34,6);ctx.fillRect(177,80,34,5);ctx.fillRect(92,72,50,6);ctx.fillRect(99,69,4,3);ctx.fillRect(132,69,4,3);ctx.fillStyle=c.bg;for(let x=61;x<85;x+=6)ctx.fillRect(x,82,3,1);ctx.fillStyle=c.dim;for(let x=90;x<170;x+=12)ctx.fillRect(x,88,7,2);}
function drawMotel(ctx,c){drawLocation(ctx,"abandonedMotel",c);}
function drawRadioTower(ctx,c){drawLocation(ctx,"station17",c);}
function drawGenericRoad(ctx,c){stars(ctx,c.dim);moon(ctx,c.dim);road(ctx,c.bright);palms(ctx,c.dim,34,70);palms(ctx,c.dim,244,68);car(ctx,c.dim);}

function chooseScene(text){const t=text.toLowerCase();if(t.includes("florida man"))return"floridaMan";if(t.includes("alligator"))return"alligator";if(t.includes("motel")||t.includes("room 17"))return"motel";if(t.includes("station 17")||t.includes("radio tower")||t.includes("relay building"))return"tower";if(game&&game.player&&locations[game.player.location])return game.player.location;return"road";}

function renderScene(text){const canvas=document.getElementById("scene-canvas");const frame=document.getElementById("scene-frame");if(!canvas||!frame||!game||!game.inProgress)return;const ctx=canvas.getContext("2d"),c=sceneColors();ctx.imageSmoothingEnabled=false;ctx.fillStyle=c.bg;ctx.fillRect(0,0,SCENE_W,SCENE_H);const scene=chooseScene(text||"");if(scene==="floridaMan")drawFloridaMan(ctx,c);else if(scene==="alligator")drawAlligator(ctx,c);else if(scene==="motel")drawMotel(ctx,c);else if(scene==="tower")drawRadioTower(ctx,c);else if(locations[scene])drawLocation(ctx,scene,c);else drawGenericRoad(ctx,c);frame.hidden=false;canvas.setAttribute("aria-label",`Apple II-style pixel illustration for ${scene === "floridaMan" ? "Florida Man encounter" : locations[scene]?.name || "the current scene"}.`);}

function scheduleScene(){clearTimeout(window.__fadSceneTimer);window.__fadSceneTimer=setTimeout(()=>{const n=document.getElementById("narrative");if(n&&n.textContent.trim())renderScene(n.textContent);},settings&&settings.motionDisabled?20:180);}

document.addEventListener("DOMContentLoaded",()=>{const n=document.getElementById("narrative");if(n)new MutationObserver(scheduleScene).observe(n,{childList:true,characterData:true,subtree:true});document.querySelectorAll('input[name="theme"]').forEach(r=>r.addEventListener("change",scheduleScene));});