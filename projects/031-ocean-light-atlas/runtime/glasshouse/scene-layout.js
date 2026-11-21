import { groundHeight } from './coast.js';
import { ROCK_SEAT } from './rock-seat.js';

// Visible rocks and movement obstacles share this deterministic layout.
let seed=39217;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const rocks=[];
function addRock(x,z,rx,ry,rz,angle){
 const ground=groundHeight(x,z);
 if(ground<-.18)return false;
 if(rocks.some(r=>Math.hypot(r.x-x,r.z-z)<Math.max(r.rx,r.rz)+Math.max(rx,rz)+.26))return false;
 rocks.push({id:`shore-rock-${rocks.length+1}`,x,z,rx,ry,rz,angle,cos:Math.cos(angle),sin:Math.sin(angle),shape:random()*20,y:ground+ry*.34,ground});return true;
}
addRock(-8.7,11.35,.76,.46,.58,.45);
for(let attempt=0;attempt<160&&rocks.length<21;attempt++)addRock(-17+random()*9.7,-.8+random()*13.6,.40+random()*.46,.25+random()*.32,.35+random()*.36,random()*Math.PI);
rocks.push({id:ROCK_SEAT.id,x:ROCK_SEAT.x,z:ROCK_SEAT.z,rx:ROCK_SEAT.width,ry:.34,rz:ROCK_SEAT.depth,
 angle:ROCK_SEAT.yaw,cos:Math.cos(ROCK_SEAT.yaw),sin:Math.sin(ROCK_SEAT.yaw),shape:7,y:ROCK_SEAT.ground+.12,ground:ROCK_SEAT.ground,seat:true});
export const ROCKS=Object.freeze(rocks.map(r=>Object.freeze(r)));
export const CHARACTER_RADIUS=.31;
export const ROCK_STRIDE_RADIUS=CHARACTER_RADIUS+.16;
export const STAIR_GAIT=Object.freeze({stepDistance:.44,lead:.18,lift:.11});
export function rockClearance(x,z,bodyRadius=ROCK_STRIDE_RADIUS,footHeight=-Infinity){
 let result=Infinity;
 for(const r of ROCKS){
  // A shore rock wholly below the raised floor cannot block someone upstairs.
  if(footHeight>r.y+r.ry*1.07+.04)continue;
  const c=r.cos,s=r.sin,dx=x-r.x,dz=z-r.z;
  const a=r.rx*1.09+bodyRadius,b=r.rz*1.09+bodyRadius;
  const distance=Math.hypot((c*dx-s*dz)/a,(s*dx+c*dz)/b)-1;
  result=Math.min(result,distance*Math.min(a,b));
 }
 return result;
}
