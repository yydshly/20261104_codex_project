import assert from 'node:assert/strict';
import {createDuck3D} from '../pond-duck-3d.js';
import {createPondWater} from '../pond-water-3d.js';

const events=[];
const duck=createDuck3D({onEvent:event=>events.push(event)});
duck.interact('call',{x:0,z:1.8});
for(let i=0;i<120;i++)duck.update(1/60,{motion:true,wind:.3});
assert.equal(events.filter(event=>event.type==='quack').length,1,'One call should produce one quack.');
for(let frame=0;frame<18000;frame++){
  if(frame%2400===0)duck.interact('water',{x:4,z:-2});
  duck.update(1/60,{motion:true,wind:.8});
  const state=duck.getState();
  assert(Number.isFinite(state.heading)&&Number.isFinite(state.speed));
  assert(Math.hypot(state.x/3.45,state.z/2.1)<=.94,'Duck must remain within the swimming boundary.');
  assert(Math.hypot(Math.max(0,2.875-state.x),Math.max(-2.073-state.z,0,state.z-.713))>=.91999,'The whole duck footprint must stay clear of the dock, including its corner.');
}
const before=duck.getState();
for(let i=0;i<120;i++)duck.update(1/60,{motion:false,wind:.8});
const after=duck.getState();
assert.equal(after.x,before.x);assert.equal(after.z,before.z);
assert.equal(after.phase,'paused');
duck.dispose();duck.dispose();

const water=createPondWater();
water.update(0,{motion:true});
assert(water.mesh.geometry.attributes.position.count>5000,'Surface must use displaced geometry, not one flat quad.');
assert.equal(water.ripple(0,0,.7),true);
assert.equal(water.ripple(10,10,.7),false);
assert.equal(water.wake(0,0,Math.PI/2,.3),true);
assert.equal(water.wake(0,0,0,0),false,'A stationary duck must not emit a swimming wake.');
const wakeDirection=water.mesh.material.uniforms.pondWakeDirections.value[0];
assert(Math.abs(wakeDirection.x)<1e-6&&Math.abs(wakeDirection.y-1)<1e-6,'Wake direction must preserve the swimmer heading.');
const pausedHeight=water.sampleHeight(1,.4);
for(let frame=1;frame<=360;frame++)water.update(frame/60,{motion:false});
assert(water.mesh.material.uniforms.pondRipples.value.every(ripple=>ripple.w===0),'Impulses must expire even when continuous motion is disabled.');
assert(water.mesh.material.uniforms.pondWakes.value.every(wake=>wake.w===0),'Directional wakes must expire when continuous motion is disabled.');
assert.equal(water.mesh.material.uniforms.time.value,0,'Continuous wave time must stay paused.');
assert.equal(water.sampleHeight(1,.4),pausedHeight,'Float sampling must stay frozen with the water surface.');
const floatingDuck=createDuck3D();floatingDuck.setSurfaceSampler(()=>.12);
for(let i=0;i<180;i++)floatingDuck.update(1/60,{motion:true});
assert(Math.abs(floatingDuck.object3D.position.y-.12)<.001,'Duck must follow the supplied water height.');
floatingDuck.dispose();
water.dispose();water.dispose();
console.log('Runtime checks passed: single quack, 300-second swimming bounds, body/dock clearance, pause, water displacement, directional wakes, float sampling, effect expiry and disposal.');
