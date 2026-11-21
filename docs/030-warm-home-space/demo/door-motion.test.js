import test from 'node:test';
import assert from 'node:assert/strict';
import {doorShape,doorBlocks,inDoorSweep} from './door-motion.js';
test('closed door blocks the complete traversable doorway',()=>{
  for(let x=.31;x<=1.39;x+=.04)assert.equal(doorBlocks(x,5.94,0),true);
});
test('fully open door leaves the centre route from landing to foyer clear',()=>{
  for(let z=4.85;z<=6.65;z+=.025)assert.equal(doorBlocks(.85,z,doorShape.maxAngle),false);
});
test('partially open leaf still blocks its diagonal sweep',()=>{
  assert.equal(doorBlocks(1.02,5.44,Math.PI/4),true);
  assert.equal(doorBlocks(.85,5.94,Math.PI/4),false);
});
test('closing is refused within the sweep, allowed outside and beyond the foyer',()=>{
  assert.equal(inDoorSweep(.85,5.5),true);
  assert.equal(inDoorSweep(.85,6.8),false);
  assert.equal(inDoorSweep(.85,6.183),false);
  assert.equal(inDoorSweep(.85,4.1),false);
});
