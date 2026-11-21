import { groundHeight } from './coast.js';
import { CHARACTER_RADIUS, rockClearance } from './scene-layout.js';
import { ROOM_SEAT, SOFA_SEAT, ROOM_FLOOR, ROOM_RUG } from './seats.js';

// One definition for visible treads, collision and both feet. Overlapping boards
// are intentional; their exposed upper envelope determines the real step edge.
export const STAIR_TREADS=Array.from({length:4},(_,i)=>({x:-1.5,z:7.8+i*.62,width:3.3,depth:1.2,thickness:.2,top:1.22-i*.23}));
export const DECK_TOP=1.4095;
const radius=CHARACTER_RADIUS;
const within=(x,z,a,b,c,d)=>x>=a&&x<=b&&z>=c&&z<=d;
const walls=[
  [-9.74,-9.50,-.3,6.3],[-9.65,-.40,-.30,-.10],[-.53,-.39,-.2,6.24],
  [-9.62,-5.10,6.12,6.26],[-2.74,-.40,6.12,6.26],
  // Sofa, table, armchair, planter. The doorway and eastern aisle stay open.
  [SOFA_SEAT.bounds.minX,SOFA_SEAT.bounds.maxX,SOFA_SEAT.bounds.minZ,SOFA_SEAT.bounds.maxZ],[-5.83,-3.97,2.22,4.08],
  [ROOM_SEAT.x-.53,ROOM_SEAT.x+.53,ROOM_SEAT.z-.39,ROOM_SEAT.back.z+.14],[-9.02,-8.12,.04,.94]
  ,[-7.32,-5.88,6.04,7.96],[-5.07,-3.63,6.04,7.96]
];
export function supportHeight(x,z){
  let y=groundHeight(x,z);
  if(within(x,z,-10.8,.8,-1.45,7.65))y=Math.max(y,DECK_TOP);
  if(within(x,z,-9.60,-.40,-.175,6.175))y=Math.max(y,ROOM_FLOOR);
  const rug=ROOM_RUG;
  if(within(x,z,rug.x-rug.width/2,rug.x+rug.width/2,rug.z-rug.depth/2,rug.z+rug.depth/2))y=Math.max(y,rug.top);
  for(const s of STAIR_TREADS)if(within(x,z,s.x-s.width/2,s.x+s.width/2,s.z-s.depth/2,s.z+s.depth/2))y=Math.max(y,s.top);
  return y;
}
export function onStairs(x,z,margin=0){return within(x,z,-3.15-margin,.15+margin,7.3-margin,10.6+margin);}
export function rootHeight(x,z){
  if(onStairs(x,z)){
    const profile=[[7.3,DECK_TOP],[7.65,DECK_TOP],[8.05,1.22],[8.71,.99],[9.33,.76],[9.95,.53],[10.6,groundHeight(x,10.6)]];
    for(let i=1;i<profile.length;i++)if(z<=profile[i][0]){
      const [a,h]=profile[i-1],[b,k]=profile[i];return h+(k-h)*Math.max(0,(z-a)/(b-a));
    }
  }
  return supportHeight(x,z);
}
export function walkable(x,z){
  if(!within(x,z,-10.55,4.2,-1.20,18))return false;
  const h=supportHeight(x,z);
  // Keep the capsule and its shoes on land, without fencing off the wet shore.
  if(h<.055)return false;
  if(rockClearance(x,z,undefined,h)<0)return false;
  for(const [a,b,c,d]of walls)if(within(x,z,a-radius,b+radius,c-radius,d+radius))return false;
  // A capsule must not straddle an unprotected deck / stair side drop.
  for(const [dx,dz]of [[radius,0],[-radius,0],[0,radius],[0,-radius]])if(h-supportHeight(x+dx,z+dz)>.30)return false;
  return true;
}
function allowed(from,x,z){return walkable(x,z)&&Math.abs(supportHeight(x,z)-supportHeight(from.x,from.z))<.28;}
export function segmentWalkable(from,to){
 const count=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.045));let previous=from;
 for(let i=1;i<=count;i++){const p={x:from.x+(to.x-from.x)*i/count,z:from.z+(to.z-from.z)*i/count};if(!allowed(previous,p.x,p.z))return false;previous=p;}
 return true;
}
export function moveOnSurface(position,dx,dz){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045));dx/=steps;dz/=steps;
  for(let i=0;i<steps;i++){
    if(allowed(position,position.x+dx,position.z+dz)){position.x+=dx;position.z+=dz;}
    else{
      if(allowed(position,position.x+dx,position.z))position.x+=dx;
      if(allowed(position,position.x,position.z+dz))position.z+=dz;
    }
  }
  position.y=rootHeight(position.x,position.z)+.004;
  return position;
}
export function safeFootLanding(point,{minZ=-.15,maxZ=.15}={}){
  // Keep the full shoe away from a vertical riser, rather than placing its
  // ankle exactly on a tread edge. Effective visible tread intervals:
  if(point.x> -2.98&&point.x<-.02){
    for(const [a,b]of [[7.65,8.4],[8.4,9.02],[9.02,9.64],[9.64,10.26]])if(point.z>=a&&point.z<b){point.z=Math.max(a-minZ+.018,Math.min(b-maxZ-.018,point.z));break;}
  }
  return point;
}

// A small local grid connects arbitrary manual positions to the authored tour.
// Tour segments themselves retain their deliberate route and stopping points.
export function connectToRoute(from,to){
  const size=.25,originX=-10.5,originZ=-1.0;
  const encode=(x,z)=>`${x},${z}`,point=(x,z)=>({x:originX+x*size,z:originZ+z*size});
  const cell=p=>[Math.round((p.x-originX)/size),Math.round((p.z-originZ)/size)];
  function validCell(p){
    const [x,z]=cell(p),candidates=[];
    for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const q=point(x+dx,z+dz);if(walkable(q.x,q.z)&&segmentWalkable(p,q))candidates.push({cell:[x+dx,z+dz],distance:Math.hypot(p.x-q.x,p.z-q.z)});}
    return candidates.sort((a,b)=>a.distance-b.distance)[0]?.cell;
  }
  const start=validCell(from),goal=validCell(to);if(!start||!goal)return null;
  const key=encode(...start),end=encode(...goal);
  const open=new Set([key]),cost=new Map([[key,0]]),previous=new Map(),coords=new Map([[key,start]]);
  const heuristic=([x,z])=>Math.hypot(x-goal[0],z-goal[1]);
  let found;
  for(let count=0;open.size&&count<6000;count++){
    let best,score=Infinity;for(const k of open){const s=cost.get(k)+heuristic(coords.get(k));if(s<score){best=k;score=s;}}
    if(best===end){found=best;break;}open.delete(best);
    const [x,z]=coords.get(best),p=point(x,z);
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const next=point(x+dx,z+dz);if(!allowed(p,next.x,next.z)||!segmentWalkable(p,next))continue;
      if(dx&&dz&&(!allowed(p,next.x,p.z)||!allowed(p,p.x,next.z)))continue;
      const k=encode(x+dx,z+dz),g=cost.get(best)+Math.hypot(dx,dz);
      if(g>=(cost.get(k)??Infinity))continue;
      cost.set(k,g);previous.set(k,best);coords.set(k,[x+dx,z+dz]);open.add(k);
    }
  }
  if(!found)return null;
  const result=[];while(found!==key){const p=point(...coords.get(found));result.unshift({...p,y:rootHeight(p.x,p.z)+.004});found=previous.get(found);}
  const first=point(...start);if(Math.hypot(first.x-from.x,first.z-from.z)>.01)result.unshift({...first,y:rootHeight(first.x,first.z)+.004});
  result.push({x:to.x,y:to.y,z:to.z});return result;
}
