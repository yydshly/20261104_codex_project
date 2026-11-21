import test from 'node:test';
import assert from 'node:assert/strict';
import { seatMotion,seatNearby,ROCK_SEAT } from '../glasshouse/rock-seat.js';
import { orbitOffset } from '../glasshouse/camera-motion.js';

test('sit and stand move the trunk before lifting/lowering the pelvis',()=>{
 const lower=seatMotion('lower',.12),rise=seatMotion('rise',.12);
 assert(lower.lean>.08&&lower.amount===0,'anticipate sitting with a forward lean');
 assert(rise.lean>.1&&rise.amount===1,'move weight over the feet before rising');
 for(const key of ['amount','back','lean','handSupport'])assert(Math.abs(seatMotion('lower',1)[key]-seatMotion('watch',0)[key])<1e-8);
 for(const value of Object.values(seatMotion('rise',1)))assert(Math.abs(value)<1e-8);
 const interrupted=seatMotion('lower',.45),start=seatMotion('rise',0,interrupted);
 for(const key of ['amount','back','lean','handSupport'])assert(Math.abs(start[key]-interrupted[key])<1e-8,'a user interruption cannot snap the pose');
});

test('sit is offered at the front approach, not through the back of the rock',()=>{
 assert(seatNearby(ROCK_SEAT.approach));assert(!seatNearby({x:-1.25,z:6.7}));
 assert(!seatNearby({x:ROCK_SEAT.x-ROCK_SEAT.forward.x,z:ROCK_SEAT.z-ROCK_SEAT.forward.z}));
});

test('an opposite camera angle maintains distance and bounds angular speed',()=>{
 let p={x:0,y:1,z:4};const goal={x:0,y:1,z:-4},radius=Math.hypot(p.x,p.y,p.z);
 for(let i=0;i<100;i++){
  const next=orbitOffset(p,goal,.05),a=Math.atan2(p.x,p.z),b=Math.atan2(next.x,next.z),turn=Math.abs(Math.atan2(Math.sin(b-a),Math.cos(b-a)));
  assert(Math.abs(Math.hypot(next.x,next.y,next.z)-radius)<1e-8);assert(turn<=.72*.05+1e-8);p=next;
 }
 assert(p.z<0,'the camera reaches the new side by orbiting');
});
