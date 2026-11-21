import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Vector3, Scene } from 'three';
import { setFlowObstacles, applyLocalFlow, createFlowTraces } from '../src/world-flow.js';
import { buildWorldScene } from '../test-support/world-scene.mjs';
import { riverCurrentAt, groundSurfaceHeight, waterSurfaceAt } from '../src/world-terrain.js';

afterEach(() => setFlowObstacles());
function sample(x, z, direction = 1, surface = 1, depth = .1) {
  return applyLocalFlow(x, z, surface, depth, new Vector3(direction, 0, 0));
}
test('a rock diverts flow, shelters a return current and reverses its wake with the tide', () => {
  setFlowObstacles([{ x: 0, z: 0, radius: 1, bottom: -2, top: 1.2 }]);
  assert.equal(sample(0, 0).length(), 0);
  assert.ok(sample(-1.3, .35).z > .15);
  assert.ok(sample(-1.3, -.35).z < -.15);
  assert.ok(sample(2.1, 0).x < -.1, 'a sheltered eddy returns toward the rock');
  assert.ok(sample(-2.1, 0, -1).x > .1, 'the return flow follows the opposite wake after reversal');
  assert.deepEqual(sample(6, 0).toArray(), [1, 0, 0]);
  assert.deepEqual(sample(0, 0, 1, 3).toArray(), [1, 0, 0], 'a deeply submerged rock has no surface blockage');
  assert.deepEqual(sample(0, 0, 1, -3).toArray(), [1, 0, 0], 'dry rocks do not create flow');
});

test('actual river rocks feed a finite bounded flow field and fixed-size surface traces', () => {
  const world = buildWorldScene();
  assert.ok(world.flowObstacles.length > 8, `found ${world.flowObstacles.length} water obstacles`);
  const flow = new Vector3();
  let influenced = 0;
  for (const o of world.flowObstacles) {
    for (const offset of [-1.4, 1.4, 2.1]) {
      const x = o.x + o.radius * offset, z = o.z + o.radius * .6;
      riverCurrentAt(x, z, groundSurfaceHeight(x, z), .1, flow, 1);
      assert.ok(flow.toArray().every(Number.isFinite));
      assert.ok(flow.length() < 6.5);
      if (flow.length() > .05) influenced++;
    }
  }
  assert.ok(influenced > 8);
  const scene = new Scene();
  const traces = createFlowTraces(scene, world.flowObstacles, { groundAt: groundSurfaceHeight,
    waterAt: waterSurfaceAt, currentAt: riverCurrentAt });
  const camera = new Vector3(-63, 17, -6);
  for (let i = 0; i < 900; i++) traces.update(.033, camera, i % 2);
  assert.equal(scene.children.length, 1);
  assert.equal(scene.children[0].geometry.attributes.position.count, traces.count * 2);
  assert.ok([...scene.children[0].geometry.attributes.position.array].every(Number.isFinite));
  console.log({ obstacles: world.flowObstacles.length, influenced, traceCapacity: traces.count });
});
