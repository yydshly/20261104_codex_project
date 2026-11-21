import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createGroundMemory } from '../src/world-ground-memory.js';
import { baseRiverSurfaceHeight, groundSurfaceHeight, riverFloodRiseAt, riverWidth, riverZ,
  setRiverFloodStage, waterSurfaceAt } from '../src/world-terrain.js';

function bankPoint(ratio = .2) {
  for (const x of [-30, -20, 0, 10, 20, 30]) {
    for (let z = riverZ(x) - riverWidth(x) - 8; z <= riverZ(x) + riverWidth(x) + 8; z += .025) {
      const floor = groundSurfaceHeight(x, z);
      const q = (floor - baseRiverSurfaceHeight(x)) / riverFloodRiseAt(x, 1);
      if (Math.abs(q - ratio) < .025 && waterSurfaceAt(x, z, floor, 1) !== null) return { x, z, floor };
    }
  }
  throw new Error('No test bank was found');
}

test('unvisited terrain remembers an actual flood and dries gradually after recession', () => {
  setRiverFloodStage(0);
  const weather = { wetness: 0, turbidity: 1, groundExposureAt: () => 1 };
  const memory = createGroundMemory(null, weather);
  const bank = bankPoint(.3);
  assert.equal(memory.sampleAt(bank.x, bank.z).residue, 0);
  let time = 0;
  setRiverFloodStage(1);
  for (let i = 0; i < 60 * 30; i++) memory.update(1 / 30, time += 1 / 30);
  assert.ok(memory.sampleAt(bank.x, bank.z).waterDepth > .5);
  setRiverFloodStage(0);
  memory.update(1 / 30, time += 1 / 30);
  const exposed = memory.sampleAt(bank.x, bank.z);
  assert.equal(exposed.waterHeight, null);
  assert.ok(exposed.localWetness > .98 && exposed.residue > .4 && exposed.mud > .1);
  const restored = createGroundMemory(null, weather);
  restored.restore(JSON.parse(JSON.stringify(memory.snapshot())));
  const resumed = restored.sampleAt(bank.x, bank.z);
  for (const field of ['localWetness', 'residue', 'waterline', 'waterDepth']) {
    assert.ok(Math.abs(resumed[field] - exposed[field]) < 1e-7, `${field} survives a fresh world`);
  }
  // This location was never queried while flooded; history is still local and correct.
  const late = bankPoint(.5);
  assert.ok(memory.sampleAt(late.x, late.z).localWetness > .98);
  for (let i = 0; i < 240 * 30; i++) memory.update(1 / 30, time += 1 / 30);
  const dried = memory.sampleAt(bank.x, bank.z);
  assert.ok(dried.localWetness < exposed.localWetness * .25);
  assert.ok(dried.residue < exposed.residue * .5 && dried.residue > .01);
  setRiverFloodStage(1);
  for (let i = 0; i < 8 * 30; i++) memory.update(1 / 30, time += 1 / 30);
  setRiverFloodStage(0);
  memory.update(1 / 30, time += 1 / 30);
  assert.ok(memory.sampleAt(bank.x, bank.z).localWetness > .98);
  setRiverFloodStage(0);
});

test('high water marks form near the attained edge, not on unvisited hills', () => {
  setRiverFloodStage(0);
  const memory = createGroundMemory(null, { wetness: 0, turbidity: 1 });
  const edge = { x: 0, z: -10.4, floor: groundSurfaceHeight(0, -10.4) };
  const hill = { x: 0, z: 38 };
  let time = 0;
  setRiverFloodStage(1);
  for (let i = 0; i < 40 * 30; i++) memory.update(1 / 30, time += 1 / 30);
  assert.equal(memory.uniforms.peakStage.value, 1);
  assert.equal(memory.uniforms.riverStage.value, 1);
  assert.ok(memory.uniforms.waterlineStrength.value > .95);
  setRiverFloodStage(0);
  memory.update(1 / 30, time += 1 / 30);
  assert.ok(memory.sampleAt(edge.x, edge.z).waterline > .15);
  assert.equal(memory.uniforms.peakStage.value, 1);
  assert.equal(memory.uniforms.riverStage.value, 0);
  assert.ok(memory.uniforms.waterlineStrength.value > .95);
  const lower = bankPoint(.3);
  assert.ok(memory.sampleAt(edge.x, edge.z).waterline > memory.sampleAt(lower.x, lower.z).waterline + .15);
  const untouched = memory.sampleAt(hill.x, hill.z);
  assert.equal(untouched.residue, 0);
  assert.equal(untouched.waterline, 0);
  assert.equal(untouched.localWetness, 0);
});

test('rain respects cover, hard surfaces reject mud and bound attributes follow actual exposed soil', () => {
  setRiverFloodStage(0);
  const weather = { wetness: 1, turbidity: 1, groundExposureAt: (x) => x > 0 ? .04 : 1 };
  const covered = createGroundMemory(null, weather);
  assert.ok(covered.sampleAt(20, 34).localWetness < .05);
  const blocked = createGroundMemory(null, weather, { blocks: () => true });
  const bank = bankPoint(.3);
  assert.equal(blocked.sampleAt(bank.x, bank.z).substrate, 'stone');
  assert.equal(blocked.sampleAt(bank.x, bank.z).mud, 0);
  assert.equal(covered.sampleAt(-100, -44).substrate, 'snow');
  weather.wetness = 0;
  const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([
    bank.x, bank.floor, bank.z, 0, groundSurfaceHeight(0, 38), 38,
  ], 3));
  covered.bindGeometry(geometry);
  assert.equal(geometry.getAttribute('aFloodThreshold').itemSize, 2);
  assert.ok(geometry.getAttribute('aFloodThreshold').getX(0) > .2);
  assert.ok(geometry.getAttribute('aFloodThreshold').getX(0) < .4);
  assert.ok(geometry.getAttribute('aFloodThreshold').getY(0) > 0);
  assert.equal(geometry.getAttribute('aFloodThreshold').getX(1), 2);
  assert.equal(geometry.getAttribute('aFloodThreshold').getY(1), 0);
  assert.ok(geometry.getAttribute('aFloodThreshold').array.every(Number.isFinite));
  let time = 0;
  setRiverFloodStage(1);
  for (let i = 0; i < 20 * 30; i++) covered.update(1 / 30, time += 1 / 30);
  setRiverFloodStage(0);
  for (let i = 0; i < 6; i++) covered.update(1 / 30, time += 1 / 30);
  assert.ok(geometry.getAttribute('aSoilWetness').getX(0) > .98);
  assert.ok(geometry.getAttribute('aMudResidue').getX(0) > .4);
  assert.equal(geometry.getAttribute('aMudResidue').getX(1), 0);
  setRiverFloodStage(0);
});

test('fixed footprint samples reuse bounded metadata while water depth remains current', () => {
  setRiverFloodStage(0);
  const memory = createGroundMemory(null, { wetness: 0 });
  const bank = bankPoint(.3);
  assert.equal(memory.sampleAt(bank.x, bank.z).waterDepth, 0);
  for (let i = 0; i < 100; i++) memory.sampleAt(bank.x, bank.z);
  assert.equal(memory.stats.sampleCacheHits, 100);
  setRiverFloodStage(1);
  assert.ok(memory.sampleAt(bank.x, bank.z).waterDepth > .5);
  for (let i = 0; i < 2100; i++) memory.sampleAt(100 + i * .001, 30);
  assert.equal(memory.stats.cachedSamples, 2048);
  setRiverFloodStage(0);
});

test('an independent rain puddle leaves local moisture after it drains', () => {
  setRiverFloodStage(0);
  const x = -12.307, z = 10.358;
  const floor = groundSurfaceHeight(x, z);
  let water = floor + .045;
  const memory = createGroundMemory(null, { wetness: 0, turbidity: 0,
    puddleSurfaceAt: (px, pz) => Math.hypot(px - x, pz - z) < 1 ? water : null });
  let time = 0;
  for (let i = 0; i < 30 * 30; i++) memory.update(1 / 30, time += 1 / 30);
  assert.ok(memory.sampleAt(x, z).waterDepth > .04);
  water = null;
  memory.update(1 / 30, time += 1 / 30);
  const bank = memory.sampleAt(x, z);
  assert.equal(bank.waterHeight, null);
  assert.ok(bank.localWetness > .98 && bank.residue > .4);
  assert.equal(memory.sampleAt(x, z + 4).residue, 0);
});
