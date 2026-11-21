import test from 'node:test';
import assert from 'node:assert/strict';
import { createExplorationStore, SESSION_KEY, createQualityController, normalizePreferences } from '../src/world-session.js';
import { createClothingWetness, createClothingDrips } from '../src/world-wetness.js';
import { createWalker } from '../src/world-walk.js';
import { createWorldWeather } from '../src/world-weather.js';
import { createWorldTide, resetTide } from '../src/world-tides.js';
import { setRiverFloodStage, groundSurfaceHeight, riverZ, riverSurfaceHeight } from '../src/world-terrain.js';
import { PerspectiveCamera, Scene, Vector3 } from 'three';

test('the versioned save survives a new store; corrupt, blocked and unavailable storage are safe', () => {
  const values = new Map(), storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const store = createExplorationStore(storage);
  const save = { walker: { position: [-20, 6, 8], yaw: .7, pitch: -.2 }, elapsed: 35,
    weather: { rain: .6, riverStage: .8 }, tide: { phase: 2.1, flow: -.7 }, preferences: { quality: 'low', volume: .35 } };
  assert.ok(store.save(save));
  assert.deepEqual(createExplorationStore(storage).load().walker, save.walker);
  values.set(SESSION_KEY, '{broken'); assert.equal(store.load(), null);
  values.set(SESSION_KEY, JSON.stringify({ ...save, version: 42 })); assert.equal(store.load(), null);
  values.set(SESSION_KEY, JSON.stringify({ ...save, version: 1, walker: { ...save.walker, position: [0, null, 0] } }));
  assert.equal(store.load(), null);
  assert.equal(createExplorationStore(undefined).save(save), false);
  assert.equal(createExplorationStore({ getItem() { throw Error('denied'); } }).load(), null);
  assert.equal(normalizePreferences(null).quality, 'auto');
  assert.equal(store.save({ walker: { position: [NaN, 0, 0] } }), false);
});

function walkerAt(x, z, collision = { blocks: () => false }) {
  globalThis.window = new EventTarget();
  const document = new EventTarget(); document.body = {}; globalThis.document = document;
  const canvas = new EventTarget(); canvas.focus = () => { document.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const camera = new PerspectiveCamera();
  const walker = createWalker(camera, canvas, collision);
  walker.enter({ position: [x, groundSurfaceHeight(x, z) + 1.64, z], target: [x + 1, 2, z] });
  return walker;
}

test('restoring a diver preserves depth and view; a blocked capsule uses a safe nearby spot', () => {
  resetTide(); setRiverFloodStage(0);
  const x = 0, z = riverZ(x), surface = riverSurfaceHeight(x);
  const walker = walkerAt(x, z);
  assert.ok(walker.restore({ position: [x, surface - .5, z], yaw: .82, pitch: -.35, feet: groundSurfaceHeight(x, z), swimming: true }));
  assert.equal(walker.medium, 'dive');
  assert.ok(Math.abs(walker.position.y - surface + .5) < .001);
  assert.equal(walker.snapshot().yaw, .82);
  assert.equal(walker.snapshot().pitch, -.35);
  const blocked = walkerAt(30, -25, { blocks: (px, _y, pz) => Math.hypot(px - 30, pz + 25) < .6 });
  assert.ok(blocked.restore({ position: [30, 5, -25], yaw: 0, pitch: 0, feet: 0 }));
  assert.ok(Math.hypot(blocked.position.x - 30, blocked.position.z + 25) > .6);
  assert.ok(blocked.position.y >= groundSurfaceHeight(blocked.position.x, blocked.position.z) + 1.63);
  assert.equal(blocked.restore({ position: [1e6, 0, 0], yaw: 0, pitch: 0 }), false);
  assert.equal(walkerAt(0, 0, { blocks: () => true }).restore({ position: [0, 3, 0], yaw: 0, pitch: 0 }), false);
  const deckFloor = groundSurfaceHeight(30, -25) + .21;
  const deck = walkerAt(30, -25, { blocks: () => false, supportAt: () => ({ floor: deckFloor }) });
  assert.ok(deck.restore({ position: [30, deckFloor + 1.02, -25], yaw: .4, pitch: -.1, feet: deckFloor, crouch: 1 }));
  assert.equal(deck.feet, deckFloor);
  assert.ok(Math.abs(deck.position.y - deckFloor - 1.02) < .0001);
});

test('weather and tide restore their physical levels before the next simulation tick', () => {
  const weather = createWorldWeather(), tide = createWorldTide();
  weather.setWind(.65);
  for (let i = 0; i < 800; i++) { weather.update(.1, 1); tide.update(.1); }
  const ws = { ...weather.state }, ts = { ...tide.state }, level = riverSurfaceHeight(0);
  const nextWeather = createWorldWeather(), nextTide = createWorldTide();
  nextWeather.restore(ws); nextTide.restore(ts);
  assert.ok(Math.abs(riverSurfaceHeight(0) - level) < 1e-8);
  assert.equal(nextWeather.state.runoff, ws.runoff);
  assert.equal(nextWeather.state.wind, ws.wind); assert.equal(nextWeather.state.windTarget, .65);
  assert.equal(nextTide.state.level, ts.level);
  assert.equal(nextTide.state.flow, ts.flow);
  resetTide(); setRiverFloodStage(0);
});

test('shallow wading, immersion and drying affect separate clothing regions; drip buffers stay bounded', () => {
  const wet = createClothingWetness();
  for (let i = 0; i < 90; i++) wet.update(.1, { waterDepth: .24 });
  assert.ok(wet.state.boots > .9); assert.equal(wet.state.upper, 0); assert.equal(wet.state.lower, 0);
  for (let i = 0; i < 40; i++) wet.update(.1, { swimming: true });
  assert.ok(wet.state.upper > .95 && wet.state.lower > .95);
  const saved = { ...wet.state }, restored = createClothingWetness(); restored.restore(saved);
  assert.deepEqual(restored.state, saved);
  const drips = createClothingDrips(new Scene());
  const position = new Vector3(30, groundSurfaceHeight(30, -25), -25);
  let maxDrips = 0;
  for (let i = 0; i < 2400; i++) {
    wet.update(.1, { speed: 2 });
    drips.update(.1, position, 0, wet.state, false, true, 2);
    maxDrips = Math.max(maxDrips, drips.active);
  }
  assert.ok(maxDrips > 0 && maxDrips <= drips.capacity);
  assert.ok(wet.state.upper < .05 && wet.state.boots < .08);
  assert.equal(wet.state.reservoir, 0); assert.equal(drips.active, 0);
});

test('adaptive quality has hysteresis and manual choices survive repeated slow frames', () => {
  const auto = createQualityController('auto', 2);
  for (let i = 0; i < 220; i++) auto.update(48, .033);
  assert.equal(auto.state.level, 0);
  for (let i = 0; i < 150; i++) auto.update(9, .033);
  assert.equal(auto.state.level, 0, 'it does not bounce back immediately');
  for (let i = 0; i < 700; i++) auto.update(9, .033);
  assert.equal(auto.state.level, 2);
  auto.setMode('high');
  for (let i = 0; i < 500; i++) auto.update(80, .033);
  assert.equal(auto.state.ratio, 1.6);
  auto.setMode('low'); assert.equal(auto.state.ratio, .8);
});
