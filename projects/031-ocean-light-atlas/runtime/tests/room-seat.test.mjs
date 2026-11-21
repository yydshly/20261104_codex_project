import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_SEAT, SOFA_SEAT, SOFA_SEATS, ROOM_FLOOR, ROOM_RUG, nearbySeat } from '../glasshouse/seats.js';
import { ROCK_SEAT, seatMotion } from '../glasshouse/rock-seat.js';
import { segmentWalkable, supportHeight, walkable } from '../glasshouse/walk-surface.js';
import { rockClearance } from '../glasshouse/scene-layout.js';

test('the indoor seat is reached through the doorway and offers interaction only at its front',()=>{
 const seat=ROOM_SEAT,route=[{x:-1.25,z:6.7},{x:-3.15,z:6.7},{x:-3.15,z:6.15},{x:-3.15,z:5.4},{x:-3.15,z:3.45},seat.approach];
 for(let i=1;i<route.length;i++)assert(segmentWalkable(route[i-1],route[i]),'the room route cannot cut through furniture or glass');
 assert(walkable(seat.approach.x,seat.approach.z));
 assert.equal(nearbySeat({...seat.approach,y:1.55}),seat);
 assert.equal(nearbySeat({...seat.approach,y:.1}),null,'an actor beneath the pavilion cannot sit through its floor');
 assert.equal(nearbySeat({x:seat.x,z:seat.z+.9,y:1.55}),null,'no interaction from behind the backrest');
 assert.equal(nearbySeat(ROCK_SEAT.approach),ROCK_SEAT);
 assert.equal(supportHeight(seat.stand.x,seat.stand.z),seat.ground);
 assert.equal(supportHeight(ROOM_RUG.x,ROOM_RUG.z),ROOM_RUG.top,'shoe contact must include the visible rug surface');
 assert(ROOM_RUG.top-ROOM_FLOOR<.01,'a woven rug should not be a concealed 2cm step');
 assert(seat.top-seat.ground<.46,'feet must be able to reach the room floor');
});

test('the complete walkable sofa front selects the nearest cushion, without requiring one exact approach point',()=>{
 assert(rockClearance(-6.85,1.4)<0,'regression position overlaps an underground shore rock in plan');
 assert(walkable(-6.85,1.4),'a rock below the room floor cannot fence off the north end of the sofa');
 for(let z=.98;z<4.8;z+=.10)for(const x of [-7.22,-6.85,-6.30]){
  const p={x,y:1.557,z};assert(walkable(x,z));
  const seat=nearbySeat(p);assert.equal(seat?.kind,'sofa',`sofa front at ${x},${z} must offer sit`);
  const best=Math.min(...SOFA_SEATS.map(s=>Math.abs(z-s.z)));assert(Math.abs(z-seat.z)<=best+.0001);
 }
 for(const p of [{x:-8.6,y:1.55,z:2.9},{x:-5.8,y:1.55,z:2.9},{x:-6.8,y:.2,z:2.9},{x:-6.8,y:1.55,z:5.5}])assert.equal(nearbySeat(p),null,'no through-back, table-side, wrong-floor or far sit');
 const north=SOFA_SEATS[0],middle=SOFA_SEATS[1];
 assert(segmentWalkable({x:-3.15,z:1.75},north.approach));assert(segmentWalkable(north.approach,middle.approach));assert(segmentWalkable(middle.approach,SOFA_SEAT.approach));
});

test('an armchair relaxes into its backrest and rises continuously from a partial or complete sit',()=>{
 const seat=ROOM_SEAT,watch=seatMotion('watch',0,null,seat);
 assert(watch.lean<0,'a relaxed armchair posture should lean gently into the backrest');
 const end=seatMotion('lower',1,null,seat);
 for(const key of Object.keys(watch))assert(Math.abs(end[key]-watch[key])<1e-8);
 for(const start of [watch,seatMotion('lower',.48,null,seat)]){
  const rise=seatMotion('rise',0,start,seat);
  for(const key of Object.keys(start))assert(Math.abs(rise[key]-start[key])<1e-8);
  for(const value of Object.values(seatMotion('rise',1,start,seat)))assert(Math.abs(value)<1e-8);
 }
 assert(seatMotion('rise',.18,null,seat).lean>.15,'shift weight over the feet before pushing up');
});

test('the sofa approach goes around the table and cannot be activated through its back or below the floor',()=>{
 const seat=SOFA_SEAT,route=[{x:-3.15,z:5.4},{x:-6.75,z:5.50},seat.approach];
 for(let i=1;i<route.length;i++)assert(segmentWalkable(route[i-1],route[i]));
 assert(!segmentWalkable({x:-3.15,z:3.45},seat.approach),'a shortcut through the coffee table must remain blocked');
 assert(walkable(seat.approach.x,seat.approach.z));
 assert.equal(nearbySeat({...seat.approach,y:seat.ground}),seat);
 assert.equal(nearbySeat({...seat.approach,y:.1}),null);
 assert.equal(nearbySeat({x:seat.x-1,z:seat.z,y:seat.ground}),null);
 assert.equal(supportHeight(seat.stand.x,seat.stand.z),seat.ground);
 assert(seat.top-seat.ground<.46,'the lowered sofa must let both feet rest on the floor');
 const end=seatMotion('lower',1,null,seat),watch=seatMotion('watch',0,null,seat);
 assert(watch.lean<seatMotion('watch',0,null,ROOM_SEAT).lean,'the deeper sofa has its own relaxed posture');
 for(const key of Object.keys(watch))assert(Math.abs(end[key]-watch[key])<1e-8);
 for(const interrupted of [watch,seatMotion('lower',.47,null,seat)]){
  const start=seatMotion('rise',0,interrupted,seat);
  for(const key of Object.keys(interrupted))assert(Math.abs(start[key]-interrupted[key])<1e-8);
 }
});
