import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {SPACE,canWalk,moveThroughSpace,planWalk,acousticAt,locationAt,groundAt} from '../reading-space.js';
import {createReadingWalk} from '../reading-walk.js';

const out=planWalk(SPACE.stand,SPACE.pondStop,{doorOpen:true});assert(out.length>1);
assert.equal(planWalk(SPACE.stand,SPACE.pondStop,{doorOpen:false}).length,0,'A closed door must separate the room from the yard');
assert.equal(canWalk(SPACE.pond.x,SPACE.pond.z),false);assert.equal(canWalk(-3,0),false);assert.equal(canWalk(NaN,0),false);
for(const [start,goal]of [[SPACE.stand,SPACE.pondStop],[SPACE.pondStop,SPACE.stand],[{x:-20,z:7},SPACE.stand],[{x:-4,z:-7},SPACE.stand]]){
 const route=planWalk(start,goal);assert(route.length,'Every accessible test location has a return route');let position={...start};
 for(const target of route){for(let i=0;i<1500&&Math.hypot(position.x-target.x,position.z-target.z)>.015;i++){
  const dx=target.x-position.x,dz=target.z-position.z,d=Math.hypot(dx,dz),step=Math.min(.0225,d);position=moveThroughSpace(position,dx/d*step,dz/d*step,{doorOpen:true});assert(canWalk(position.x,position.z));
 }assert(Math.hypot(position.x-target.x,position.z-target.z)<.02,'Route remains walkable with the same continuous collision solver');}
 assert(Math.hypot(position.x-goal.x,position.z-goal.z)<.02);
}
const rushed=moveThroughSpace(SPACE.stand,-30,0,{doorOpen:false});assert(rushed.x> -2.7,'Large frame steps may not tunnel through a wall');
const inside=acousticAt({...SPACE.stand,y:1.65}),outside=acousticAt({...SPACE.pondStop,y:1.77});assert(inside.openness<.1);assert(outside.openness>.99);assert(outside.pondDistance<inside.pondDistance);
const closed=acousticAt({x:-1.8,z:2.8}),open=acousticAt({x:-1.8,z:2.8},true);assert(open.openness>closed.openness);
for(let z=2.8;z<4.1;z+=.01){const a=acousticAt({x:-1.8,z},true),b=acousticAt({x:-1.8,z:z+.01},true);assert(Math.abs(a.openness-b.openness)<.03,'Doorway sound field is continuous');}
assert.equal(locationAt(0,-7),'garden');assert(groundAt(0,-7)>.11);

const originals={window:globalThis.window,document:globalThis.document};const handlers=new Map();
globalThis.window={addEventListener:(e,f)=>handlers.set(e,f),removeEventListener:e=>handlers.delete(e)};
globalThis.document={addEventListener:(e,f)=>handlers.set('doc:'+e,f),removeEventListener:e=>handlers.delete('doc:'+e)};
const canvas={addEventListener:(e,f)=>handlers.set('canvas:'+e,f),removeEventListener:e=>handlers.delete('canvas:'+e),focus(){},setPointerCapture(){},releasePointerCapture(){}};
try{
 const camera=new THREE.PerspectiveCamera(),walk=createReadingWalk(camera,canvas);walk.setReady(true);assert(walk.getState().seated);assert(walk.action('pond'));
 let previousYaw=walk.getState().yaw,maxTurnStep=0;const tick=()=>{walk.update(1/60);const yaw=walk.getState().yaw;maxTurnStep=Math.max(maxTurnStep,Math.abs(Math.atan2(Math.sin(yaw-previousYaw),Math.cos(yaw-previousYaw))));previousYaw=yaw;};
 for(let i=0;i<2500;i++)tick();
 let s=walk.getState();assert.equal(s.zone,'pond');assert(!s.guided);assert(Math.hypot(s.position.x-SPACE.pondStop.x,s.position.z-SPACE.pondStop.z)<.09);
 walk.action('seat');for(let i=0;i<2500;i++)tick();s=walk.getState();assert(s.seated,'Return-and-sit completes after a continuous route');assert.equal(s.zone,'room');assert(Math.abs(s.position.y-SPACE.seat.y)<.001);assert(maxTurnStep<.04,'Walking, arrival and sitting must not snap the view direction');
 walk.action('seat');for(let i=0;i<240&&walk.getState().transitioning;i++)walk.update(1/60);assert(!walk.getState().seated);assert(canWalk(camera.position.x,camera.position.z));
 handlers.get('keydown')({key:'w',target:{tagName:'CANVAS'},preventDefault(){}});walk.update(.05);handlers.get('blur')();const before=camera.position.clone();for(let i=0;i<60;i++)walk.update(1/60);assert(camera.position.distanceTo(before)<.01,'Blur releases movement keys');
 assert(walk.action('rest'));for(let i=0;i<3000;i++)tick();s=walk.getState();assert(s.seated&&s.seatedPlace==='terrace','A continuous route reaches the outdoor resting posture');assert(camera.position.distanceTo(new THREE.Vector3(SPACE.terrace.seat.x,SPACE.terrace.seat.y,SPACE.terrace.seat.z))<.01);
 walk.gazeTo(walk.getState().yaw,-.8);for(let i=0;i<180;i++)tick();assert(Math.abs(walk.getState().pitch+.8)<.01,'A reading glance eases pitch even when yaw already matches');assert(walk.action('rest'));for(let i=0;i<220;i++)tick();assert(!walk.getState().seated);assert(canWalk(camera.position.x,camera.position.z),'Standing from the outdoor chair lands on a walkable approach');
 assert(walk.action('seat'));for(let i=0;i<3000;i++)tick();assert(walk.getState().seated&&walk.getState().seatedPlace==='room','The outdoor terrace still has a complete return-and-sit route');
 walk.dispose();assert.equal(handlers.size,0);
 const local=createReadingWalk(camera,canvas);local.setReady(true);local.action('seat');for(let i=0;i<220;i++)local.update(1/60);assert(camera.position.distanceTo(new THREE.Vector3(SPACE.stand.x,1.65,SPACE.stand.z))<.01,'Standing stays near the chair');camera.position.set(.18,1.65,1.0);assert(canWalk(camera.position.x,camera.position.z));local.action('seat');assert.equal(local.action('seat'),false,'Repeated sit clicks cannot reverse an active posture transition');for(let i=0;i<220;i++){const t=local.update(1/60);assert(!t.guided,'Sitting next to the chair must not route to a distant staging point');assert(t.position.x<=.181&&t.position.z<=1.001,'Local sitting may not first walk away');}assert(local.getState().seated);assert(Math.abs(Math.sin(local.getState().yaw-(SPACE.room.heading-Math.PI)))<.001,'Seated gaze follows chair heading, not the side table');local.dispose();
 const nearDoor=createReadingWalk(camera,canvas);nearDoor.setReady(true);camera.position.set(-1.8,1.65,2.9);assert(nearDoor.action('door'),'A closed door opens when approached closely');assert(nearDoor.getState().doorOpen);assert.equal(nearDoor.action('door'),false,'Closing is prevented while the person occupies the threshold');nearDoor.dispose();
}finally{for(const[k,v]of Object.entries(originals)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
console.log('Connected space: closed-door isolation, wall/water collisions, return routes, continuous acoustics, actual walk-controller round trip, sit/stand and blur cleanup passed.');
