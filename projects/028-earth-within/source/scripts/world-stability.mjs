import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { PerspectiveCamera, Vector3 } from 'three';
import { buildWorldScene } from '../test-support/world-scene.mjs';
import { createWorldTide } from '../src/world-tides.js';
import { groundSurfaceHeight, riverCurrentAt, waterSurfaceAt } from '../src/world-terrain.js';
import { createGroundMemory } from '../src/world-ground-memory.js';
import { createPuddles } from '../src/world-puddles.js';
import { createFlowTraces } from '../src/world-flow.js';
import { createClothingWetness, createClothingDrips } from '../src/world-wetness.js';
import { createExplorationStore } from '../src/world-session.js';

const minutes = Math.min(30, Math.max(1, Number(process.argv[2]) || 10));
const world = buildWorldScene(), tide = createWorldTide(), camera = new PerspectiveCamera();
const weather = world.weather.state, puddles = createPuddles(world.scene, world.collision);
weather.puddleSurfaceAt = puddles.surfaceAt;
const memory = createGroundMemory(world.scene, weather, world.collision);
const wet = createClothingWetness(), drips = createClothingDrips(world.scene);
const traces = createFlowTraces(world.scene, world.flowObstacles, { groundAt: groundSurfaceHeight,
  waterAt: waterSurfaceAt, currentAt: riverCurrentAt });
const values = new Map(), store = createExplorationStore({ getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) });
const points = [...world.itinerary.values()].flatMap((section) => section.points);
const position = new Vector3(), velocity = new Vector3();
const objectsBefore = countObjects();
const dt = .1, frames = Math.round(minutes * 60 / dt), started = performance.now();
let maxDrops = 0, saves = 0, maximumFlow = 0;
function countObjects() { let count = 0; world.scene.traverse(() => count++); return count; }
for (let frame = 0; frame < frames; frame++) {
  const time = (frame + 1) * dt;
  const route = points[Math.floor(frame / frames * (points.length - 1))];
  position.copy(route.position); camera.position.copy(position);
  const raining = Math.floor(time / 75) % 2 === 0;
  tide.update(dt); world.weather.update(dt, raining ? 1 : 0);
  puddles.update(dt, time, weather); memory.update(dt, time);
  world.water.update(dt, time, weather.rain, camera, null, world.collision, weather);
  traces.update(dt, camera.position, weather.runoff);
  const floor = groundSurfaceHeight(position.x, position.z), surface = waterSurfaceAt(position.x, position.z, floor);
  const swimming = surface !== null && surface - floor > 1.19;
  wet.update(dt, { swimming, waterDepth: Math.max(0, (surface ?? -Infinity) - floor), rain: weather.rain, speed: 2.75 });
  drips.update(dt, position, 0, wet.state, swimming, true, 2.75); maxDrops = Math.max(maxDrops, drips.active);
  if (frame % 10 === 0) {
    for (const fish of world.water.fish) assert.ok(fish.position.toArray().every(Number.isFinite), 'fish position remains finite');
    riverCurrentAt(position.x, position.z, floor, .1, velocity, weather.runoff);
    assert.ok(velocity.toArray().every(Number.isFinite)); maximumFlow = Math.max(maximumFlow, velocity.length());
    assert.ok(Object.values(wet.state).every((v) => Number.isFinite(v) && v >= 0 && v <= 1));
  }
  if (frame % 100 === 0) {
    const snapshot = { walker: { position: position.toArray(), yaw: 0, pitch: 0 }, elapsed: time,
      weather, tide: { phase: tide.state.phase, flow: tide.state.flow }, ground: memory.snapshot(), clothing: wet.state };
    assert.ok(store.save(snapshot)); const saved = store.load(); assert.ok(saved);
    const restored = createClothingWetness(); restored.restore(saved.clothing); assert.deepEqual(restored.state, wet.state);
    saves++;
  }
  if (frame % 1500 === 0) console.log(`Simulation ${Math.round(time)} / ${minutes * 60} seconds`);
}
assert.equal(countObjects(), objectsBefore, 'simulation does not append scene objects');
assert.ok(maxDrops <= drips.capacity);
const result = { simulatedMinutes: minutes, frames, wallSeconds: (performance.now() - started) / 1000,
  sceneObjectsBefore: objectsBefore, sceneObjectsAfter: countObjects(), fish: world.water.fish.length,
  flowObstacles: world.flowObstacles.length, maximumFlow, dripCapacity: drips.capacity, maxDrops,
  traceCapacity: traces.count, saves, memoryCache: memory.stats.cachedSamples, status: 'passed' };
await writeFile(new URL('../.artifacts/world-stability.json', import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
