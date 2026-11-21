/** One metre-based map, shared by walking, rendering and audio. No browser dependencies. */
export const SPACE=Object.freeze({
 pond:{x:-13,z:-.5,rx:5.5,rz:3.8},
 door:{x:-1.8,z:3.3,width:1.4},
 seat:{x:-.85,y:1.46,z:.12},stand:{x:.02,z:1.08},
 room:{heading:.18,pitch:-.14,book:{x:.28,y:.790,z:.17},bookYaw:-.18},
 book:{x:.28,y:.85,z:.17},lamp:{x:.55,y:1.5,z:-.03},
 pondStop:{x:-8.3,z:3.7},porch:{x:-1.8,z:4.5},
 terrace:{approach:{x:-5.35,z:5.8},seat:{x:-5.5,y:1.48,z:7.3},yaw:.8,pitch:-.10},
 path:[{x:-1.8,z:4.7},{x:-4.4,z:5.4},{x:-6.6,z:4.9},{x:-8.3,z:3.7}],
 bounds:{minX:-22,maxX:3.12,minZ:-9.4,maxZ:8.8},radius:.20,
 trees:[[-8.3,-6.4],[-19.5,2.3],[-4,13],[-15.5,-8.8],[-22,-7],[3.8,14]],
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const walls=[[-3.13,-2.87,-2.9,3.4],[3.22,3.48,-2.9,3.4],[-3.13,3.48,-2.91,-2.67],
 [-3.13,-2.5,3.18,3.43],[-1.1,3.48,3.18,3.43]];
const furniture=[[-1.52,-.20,-.98,.42],[-1.17,-.38,.59,1.29],[.18,.96,-.40,.50],[.68,2.55,-2.66,-1.91],[-2.52,-2.05,-.43,.04],[-9.78,-8.22,5.57,6.16],[-6.0,-5.0,6.8,8.0],[-5.20,-4.46,6.45,7.23],[-6.49,-5.67,6.22,7.04]];
/** Simple solid volumes for the camera boom; water is intentionally not a wall. */
export function cameraSolids(doorOpen=false){
 const boxes=walls.map(([x1,x2,z1,z2])=>[x1,-.1,z1,x2,3.78,z2]);
 const heights=[1.15,.48,.83,2.8,.78,.58,1.22,.82,.47];
 furniture.forEach(([x1,x2,z1,z2],i)=>boxes.push([x1,0,z1,x2,heights[i],z2]));
 boxes.push([-3.4,3.70,-3.3,3.72,4.95,3.75]);
 boxes.push(doorOpen?[-2.57,0,3.28,-2.28,2.5,4.75]:[-2.55,0,3.23,-1.05,2.5,3.38]);
 for(const[x,z]of SPACE.trees)boxes.push([x-.3,0,z-.3,x+.3,5,z+.3]);
 for(const[x,z]of[[-7.9,8.45],[-3.65,8.45],[-3.65,5.28]])boxes.push([x-.06,.1,z-.06,x+.06,2.8,z+.06]);
 boxes.push([-8.0,2.75,5.17,-3.55,2.98,8.55]);return boxes;
}
function touchesRect(x,z,b,r){return Math.hypot(x-clamp(x,b[0],b[1]),z-clamp(z,b[2],b[3]))<r;}
export function canWalk(x,z,{doorOpen=true,radius=SPACE.radius}={}){
 if(!Number.isFinite(x)||!Number.isFinite(z))return false;
 const b=SPACE.bounds;if(x<b.minX+radius||x>b.maxX-radius||z<b.minZ+radius||z>b.maxZ-radius)return false;
 if(walls.concat(furniture).some(rect=>touchesRect(x,z,rect,radius)))return false;
 if(!doorOpen&&touchesRect(x,z,[-2.5,-1.1,3.18,3.43],radius))return false;
 if(doorOpen){const ax=-2.5,az=3.3,dx=Math.cos(1.47)*1.4,dz=Math.sin(1.47)*1.4,t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x-ax-t*dx,z-az-t*dz)<radius+.045)return false;}
 if(((x-SPACE.pond.x)/(SPACE.pond.rx+.36))**2+((z-SPACE.pond.z)/(SPACE.pond.rz+.36))**2<1)return false;
 return !SPACE.trees.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<radius+.30);
}
export function moveThroughSpace(position,dx,dz,options){
 let{x,z}=position;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.065));
 for(let i=0;i<steps;i++){if(canWalk(x+dx/steps,z,options))x+=dx/steps;if(canWalk(x,z+dz/steps,options))z+=dz/steps;}
 return{x,z};
}
export function groundAt(x,z){return .12*(1-smooth(-3.35,-2.75,x)*smooth(-3.15,-2.65,z)*(1-smooth(3.05,3.75,z)));}
export function locationAt(x,z){
 if(x> -2.9&&x<3.3&&z> -2.7&&z<3.23)return'room';
 if(Math.hypot(x-SPACE.door.x,z-SPACE.door.z)<2.25)return'porch';
 const r=Math.hypot((x-SPACE.pond.x)/SPACE.pond.rx,(z-SPACE.pond.z)/SPACE.pond.rz);
 return r<1.70?'pond':'garden';
}
export function acousticAt({x,y=1.65,z,yaw=0,pitch=0},doorOpen=false){
 const outside=1-(1-smooth(3.05,3.9,z))*smooth(-3.35,-2.75,x)*smooth(-3.15,-2.65,z);
 const doorway=Math.exp(-(((x-SPACE.door.x)/2.3)**2+((z-SPACE.door.z)/2.4)**2));
 return{listener:{x,y,z,yaw,pitch},outside,doorOpen,openness:clamp(outside+(doorOpen?doorway*.36:0),0,1),
  pondDistance:Math.hypot(x-SPACE.pond.x,z-SPACE.pond.z),zone:locationAt(x,z)};
}
function clearLine(a,b,options){const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.085);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!canWalk(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,options))return false;}return true;}
/** A* followed by collision-checked string pulling. Routes remain physical, with no scene swap. */
export function planWalk(start,goal,options={doorOpen:true}){
 if(!canWalk(start.x,start.z,options)||!canWalk(goal.x,goal.z,options))return[];
 if(clearLine(start,goal,options))return[{...goal}];
 const step=.30,b=SPACE.bounds,key=(x,z)=>x+','+z,point=(x,z)=>({x:b.minX+x*step,z:b.minZ+z*step});
 function closest(p){let best=null,distance=Infinity;const ix=Math.round((p.x-b.minX)/step),iz=Math.round((p.z-b.minZ)/step);
  for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const q=point(ix+dx,iz+dz),d=Math.hypot(p.x-q.x,p.z-q.z);if(d<distance&&clearLine(p,q,options)){best={ix:ix+dx,iz:iz+dz,...q};distance=d;}}return best;}
 const from=closest(start),to=closest(goal);if(!from||!to)return[];
 const targetKey=key(to.ix,to.iz),first={...from,g:0,f:Math.hypot(to.x-from.x,to.z-from.z),parent:null};
 const open=[first],known=new Map([[key(from.ix,from.iz),first]]),closed=new Set();let found;
 while(open.length&&closed.size<9000){let min=0;for(let i=1;i<open.length;i++)if(open[i].f<open[min].f)min=i;const current=open.splice(min,1)[0],k=key(current.ix,current.iz);if(closed.has(k))continue;if(k===targetKey){found=current;break;}closed.add(k);
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;const ix=current.ix+dx,iz=current.iz+dz,nk=key(ix,iz);if(closed.has(nk))continue;const p=point(ix,iz);if(!clearLine(current,p,options))continue;const g=current.g+Math.hypot(dx,dz)*step,old=known.get(nk);if(old&&old.g<=g)continue;const node={...p,ix,iz,g,f:g+Math.hypot(p.x-to.x,p.z-to.z),parent:current};known.set(nk,node);open.push(node);}
 }
 if(!found)return[];const raw=[{...goal}];for(let n=found;n;n=n.parent)raw.unshift({x:n.x,z:n.z});raw.unshift({...start});
 const route=[];let index=0;while(index<raw.length-1){let next=raw.length-1;while(next>index+1&&!clearLine(raw[index],raw[next],options))next--;route.push(raw[next]);index=next;}return route;
}
