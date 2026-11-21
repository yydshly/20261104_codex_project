import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene } from 'three';
import { createFootprintAging, advanceFootprintAging } from '../src/world-footprint-aging.js';
import { createFootprints } from '../src/world-footprints.js';
import { createTerrain, groundSurfaceHeight, setRiverFloodStage, waterSurfaceAt } from '../src/world-terrain.js';
import { resetTide, createWorldTide } from '../src/world-tides.js';
import { recordingMix } from '../src/world-ambience.js';

const sand = (moisture = 1) => createFootprintAging({ substrate: 'sand', moisture, strength: .8 });
function advance(state, seconds, climate = {}) {
  for (let t = 0; t < seconds - .00001; t += .1) advanceFootprintAging(state, .1, climate, 'sand');
  return state;
}

test('moisture dries from the edges while the sand impression and sole detail remain', () => {
  const mark = sand(), originalDepth = mark.depth;
  advance(mark, 25);
  assert.ok(mark.edgeWater < mark.coreWater * .5 && mark.coreWater > .1);
  advance(mark, 70);
  assert.equal(mark.coreWater, 0); assert.equal(mark.edgeWater, 0);
  assert.ok(mark.depth > originalDepth * .90 && mark.definition > .95);
  assert.equal(mark.eroded, false);
});

test('wind speeds evaporation and fills dry loose sand; shelter preserves the trace', () => {
  const still = sand(), windy = sand(), shelter = sand();
  advance(still, 32, { wind: 0 }); advance(windy, 32, { wind: 1 });
  advance(shelter, 32, { wind: 1, exposure: .04 });
  assert.ok(windy.coreWater < still.coreWater * .1);
  assert.ok(shelter.coreWater > windy.coreWater + .2);
  advance(still, 100, { wind: 0 }); advance(windy, 100, { wind: 1 }); advance(shelter, 100, { wind: 1, exposure: .04 });
  assert.ok(windy.depth < still.depth * .6);
  assert.ok(windy.definition < still.definition && shelter.depth > windy.depth);
});

test('rain re-wets a dry impression before sustained rain softens its edge and removes it', () => {
  const mark = sand(); advance(mark, 100, { wind: .35 });
  const depth = mark.depth;
  advance(mark, 10, { rain: 1 });
  assert.ok(mark.coreWater > .85 && mark.edgeWater > .95);
  assert.ok(mark.depth > depth * .9, 'rewetting is visible before the footprint is smoothed away');
  const light = sand(0), heavy = sand(0);
  advance(light, 45, { rain: .2 }); advance(heavy, 45, { rain: 1 });
  assert.ok(heavy.depth < light.depth && heavy.definition < light.definition);
  advance(mark, 180, { rain: 1 }); assert.equal(mark.eroded, true);
});

test('a brief shallow wash hides a surviving impression; a sustained tidal wash erodes it permanently', () => {
  const mark = sand(), original = mark.depth;
  advanceFootprintAging(mark, .033, { waterDepth: .005, wave: .6 });
  assert.equal(mark.submerged, true); assert.ok(mark.depth > original * .999);
  advanceFootprintAging(mark, .033, { waterDepth: 0 }); assert.equal(mark.submerged, false);
  const quiet = sand(), flowing = sand();
  advance(quiet, 2, { waterDepth: .4, flowSpeed: 0, wave: 0 });
  advance(flowing, 2, { waterDepth: .4, flowSpeed: 2, wave: 1 });
  assert.ok(flowing.depth < quiet.depth * .1);
  advance(flowing, 3, { waterDepth: .4, flowSpeed: 2, wave: 1 });
  assert.equal(flowing.depth, 0); assert.equal(flowing.eroded, true);
  advance(flowing, 30, { rain: 1 });
  assert.equal(flowing.depth, 0); assert.equal(flowing.coreWater, 0, 'an erased footprint cannot reappear when wetted again');
});

test('dried relief survives rendering updates, storage round trips and resumes weathering without an age reset', () => {
  resetTide(); setRiverFloodStage(0);
  const scene = new Scene(); createTerrain(scene);
  const ground = { localWetness: 0, mud: 0, substrate: 'sand', waterDepth: 0, waterHeight: null };
  const weather = { wind: .65, rain: 0 };
  const options = { sampleGround: () => ground, sampleEnvironment: (_x, _z, _g, target) => Object.assign(target, weather) };
  const a = createFootprints(scene, options), floor = groundSurfaceHeight(60, 45);
  assert.ok(a.step({ x: 60, y: floor + .025, z: 45, side: -1, yaw: Math.PI / 2, speed: 2, soleWetness: 1 }));
  for (let i = 0; i < 900; i++) a.update(.1, i * .1);
  assert.equal(a.stats.wetPrints, 0); assert.equal(a.stats.dryImpressions, 1);
  assert.equal(a.prints[0].aging.coreWater, 0); assert.ok(a.prints[0].aging.depth > .007);
  const saved = JSON.parse(JSON.stringify(a.snapshot()));
  const b = createFootprints(scene, options); b.restore(saved);
  assert.equal(b.stats.dryImpressions, 1); assert.deepEqual(b.snapshot(), saved);
  for (let i = 0; i < 100; i++) { a.update(.1, 90 + i * .1); b.update(.1, 90 + i * .1); }
  assert.deepEqual(b.snapshot(), a.snapshot());
  for (const attribute of Object.values(b.mesh.geometry.attributes)) assert.ok([...attribute.array].every(Number.isFinite));
  const oversized = { version: 1, prints: Array.from({ length: 1000 }, () => saved.prints[0]) };
  b.restore(oversized); assert.ok(b.stats.activePrints <= 128);
  b.restore({ version: 1, prints: [{ x: NaN, z: 45, yaw: 0, substrate: 'sand' }] }); assert.equal(b.stats.activePrints, 0);
  console.log({ retainedDepthAfterDrying: a.prints[0].aging.depth, remainingDefinition: a.prints[0].aging.definition });
});

test('the selected wind strength changes the actual field recording mix without changing river sounds', () => {
  const calm = recordingMix({ riverDistance: 3, wind: 0 }), breeze = recordingMix({ riverDistance: 3, wind: .35 });
  const strong = recordingMix({ riverDistance: 3, wind: 1 });
  assert.equal(calm.wind, 0); assert.ok(strong.wind > breeze.wind * 1.6);
  assert.equal(calm.calm, strong.calm);
});

test('an actual rising tide covers and erodes coastal footprints, which remain erased after the ebb', () => {
  setRiverFloodStage(0);
  const tide = createWorldTide({ phase: -Math.PI / 2 });
  const scene = new Scene(); createTerrain(scene);
  const ground = {};
  const sampleGround = (x, z) => {
    const floor = groundSurfaceHeight(x, z), water = waterSurfaceAt(x, z, floor);
    return Object.assign(ground, { floor, substrate: 'sand', localWetness: 0, mud: 0,
      waterDepth: Math.max(0, (water ?? -Infinity) - floor), waterHeight: water });
  };
  const effects = createFootprints(scene, { sampleGround,
    sampleEnvironment: (_x, _z, _g, target) => Object.assign(target, { wind: .65, wave: .7, flowSpeed: Math.abs(tide.state.flow) * .35 }) });
  assert.ok(effects.step({ x: 61.4, y: groundSurfaceHeight(61.4, 45) + .025, z: 45, side: 1, yaw: 0, speed: 2, soleWetness: 1 }));
  let submerged = false;
  for (let i = 0; i < 2400; i++) {
    tide.update(.1); effects.update(.1, i * .1);
    submerged ||= effects.stats.submergedPrints > 0;
  }
  assert.equal(submerged, true);
  assert.equal(effects.stats.activePrints, 0); assert.equal(effects.stats.erodedPrints, 1);
  assert.equal(sampleGround(61.4, 45).waterDepth, 0, 'the coast is exposed again after a complete tide');
  effects.update(.1, 240.1); assert.equal(effects.mesh.visible, false);
  resetTide(); setRiverFloodStage(0);
});
