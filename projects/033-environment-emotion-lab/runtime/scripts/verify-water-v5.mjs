import assert from 'node:assert/strict';
import {createPondWater} from '../pond-water-3d.js';

const water=createPondWater();
const uniforms=water.mesh.material.uniforms;
try {
  assert.equal(uniforms.pondSwimmerSize.value.w,0,'No phantom hull should appear before a swimmer is supplied.');
  assert(water.setSwimmer({x:1,z:.5,heading:Math.PI/2,speed:.28}));
  assert.deepEqual(uniforms.pondSwimmerSize.value.toArray(),[.75,.3,.28,1]);
  const validPose=uniforms.pondSwimmer.value.toArray();
  for(const invalid of [{x:NaN,z:0},{x:9,z:0},{x:0,z:0,length:0}]) {
    assert.equal(water.setSwimmer(invalid),false);
    assert.deepEqual(uniforms.pondSwimmer.value.toArray(),validPose,'Invalid input must preserve the last valid swimmer.');
  }
  water.update(0,{wind:0});
  assert(water.wake(1,.5,Math.PI/2,.28));
  const oldWakeSize=uniforms.pondWakeSizes.value[0].toArray();
  const oldWakeDirection=uniforms.pondWakeDirections.value[0].toArray();
  assert(water.setSwimmer({x:1,z:.5,heading:0,speed:.28,length:.85,width:.32}));
  assert.deepEqual(uniforms.pondWakeSizes.value[0].toArray(),oldWakeSize,'Changing hull size must not reshape a past wake.');
  assert.deepEqual(uniforms.pondWakeDirections.value[0].toArray(),oldWakeDirection,'Turning must not rotate a past wake.');
  assert(water.setSwimmer(null));
  assert.equal(uniforms.pondSwimmerSize.value.w,0);

  // A wind change must affect future wave speed, even after a long session.
  const dt=1/60,steps=216000;
  for(let frame=1;frame<=steps;frame++)water.update(frame*dt,{wind:0});
  const points=[[-2,-1],[-1,.7],[0,0],[.5,1.4],[1.8,-.5],[3,1]];
  const heights=points.map(([x,z])=>water.sampleHeight(x,z));
  const before=uniforms.time.value;
  water.update((steps+1)*dt,{wind:1});
  const advance=uniforms.time.value-before;
  assert(advance>0&&advance<dt*1.2,'One frame must not rescale an hour of accumulated wave phase.');
  const maxStep=Math.max(...points.map(([x,z],i)=>Math.abs(water.sampleHeight(x,z)-heights[i])));
  assert(maxStep<.0015,'A one-frame wind change must not teleport the sampled waterline.');
  assert.equal(water.sampleHeight(1,1),water.sampleHeight(1,1,uniforms.time.value));

  water.ripple(0,0);water.wake(1,.5,0,.3);
  const frozen=uniforms.time.value;
  for(let frame=2;frame<=362;frame++)water.update((steps+frame)*dt,{wind:1,motion:false});
  assert.equal(uniforms.time.value,frozen,'Pause must freeze the continuous wave clock.');
  assert(uniforms.pondRipples.value.every(r=>r.w===0),'Paused click ripples must still expire.');
  assert(uniforms.pondWakes.value.every(w=>w.w===0),'Paused wakes must still expire.');
} finally {
  water.dispose();water.dispose();
}
assert.equal(water.setSwimmer({x:0,z:0}),false,'Disposed water must reject new swimmers.');
console.log('Water v5 checks passed: swimmer lifecycle, invalid input, retained wakes, hour-long wind continuity, sampled waterline and paused effect expiry.');
