import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, Vector3, PerspectiveCamera } from 'three';
import { createTerrain, groundSurfaceHeight, setRiverFloodStage } from '../src/world-terrain.js';
import { resetTide, createWorldTide } from '../src/world-tides.js';
import { createHero } from '../src/world-hero.js';
import { createGroundMemory } from '../src/world-ground-memory.js';
import { createFootprints } from '../src/world-footprints.js';
import { createClothingWetness } from '../src/world-wetness.js';
import { createWalker } from '../src/world-walk.js';
import { createCharacterView } from '../src/world-character.js';
import { buildWorldScene } from '../test-support/world-scene.mjs';

test('each boot carries water from the sea and loses it gradually on actual dry sand contacts', () => {
  resetTide(); setRiverFloodStage(0);
  const scene = new Scene(); createTerrain(scene);
  const memory = createGroundMemory(scene, { wetness: 0 });
  const hero = createHero(scene), effects = createFootprints(scene, { sampleGround: memory.sampleAt });
  const dt = 1 / 30; let time = 0;
  for (let i = 0; i < 60; i++) hero.update(dt, time += dt, {
    position: new Vector3(69, -.4, 42), yaw: -Math.PI / 2, swimming: true,
  });
  hero.resetPose();
  for (let i = 0; i < 110; i++) {
    const x = 61.5 - i * dt * 1.7, z = 42;
    hero.update(dt, time += dt, { position: new Vector3(x, groundSurfaceHeight(x, z) + .025, z),
      yaw: -Math.PI / 2, speed: 1.7, contactsEnabled: true });
    for (const contact of hero.drainFootContacts()) {
      contact.ground = memory.sampleAt(contact.x, contact.z, {});
      assert.equal(contact.ground.localWetness, 0, 'the beach itself is dry');
      assert.equal(contact.ground.waterDepth, 0);
      contact.soleWetness = hero.wetFootContact(contact.side, contact.ground);
      effects.step(contact);
    }
    effects.update(dt, time);
  }
  const trail = effects.prints.filter((p) => p.active);
  assert.ok(trail.length >= 8, `${trail.length} marks left by actual boots`);
  assert.ok(trail.some((p) => p.side === -1) && trail.some((p) => p.side === 1));
  assert.ok(trail.every((p) => p.kind === 'carried-water' && p.substrate === 'sand'));
  assert.ok(trail.at(-1).strength < trail[0].strength * .65, 'water transfer diminishes along the trail');
  const old = trail[0].opacity;
  for (let i = 0; i < 400; i++) effects.update(.1, time += .1);
  assert.ok(trail[0].opacity < old, 'old wet marks evaporate');
  console.log({ dryBeachWetMarks: trail.length, firstStrength: trail[0].strength, lastStrength: trail.at(-1).strength });
});

test('dry boots indent loose sand; water is consumed per boot and hard or unsupported surfaces reject sand impressions', () => {
  resetTide(); setRiverFloodStage(0);
  const scene = new Scene(); createTerrain(scene);
  const state = { substrate: 'sand', localWetness: 0, mud: 0, waterDepth: 0, waterHeight: null };
  const effects = createFootprints(scene, { sampleGround: () => state });
  const contact = { x: 60, z: 42, y: groundSurfaceHeight(60, 42) + .025, yaw: 0, side: -1, speed: 2 };
  assert.ok(effects.step(contact));
  assert.equal(effects.prints[0].kind, 'sand-impression');
  assert.ok(effects.prints[0].strength < .5);
  for (const substrate of ['stone', 'wood']) {
    state.substrate = substrate;
    assert.equal(effects.step({ ...contact, x: 59, y: groundSurfaceHeight(59, 42) + .025, soleWetness: 1 }), false);
  }
  state.substrate = 'sand';
  assert.equal(effects.step({ ...contact, x: 58, y: groundSurfaceHeight(58, 42) + 1, soleWetness: 1 }), false);
  const wet = createClothingWetness();
  wet.update(.1, { swimming: true }); wet.update(.1, { swimming: true });
  const right = wet.state.rightSole;
  const first = wet.footContact(-1, state), next = wet.footContact(-1, state);
  assert.ok(next < first); assert.equal(wet.state.rightSole, right);
  for (let i = 0; i < 35; i++) wet.footContact(-1, state);
  assert.ok(wet.state.leftSole < .001);
  wet.footContact(-1, { waterDepth: .08, substrate: 'sand' });
  assert.equal(wet.state.leftSole, 1);
});

test('the actual coastal entrance supports a continuous walk into swimming and back onto a dry footprint trail', () => {
  const world = buildWorldScene(), tide = createWorldTide({ phase: Math.PI });
  const page = new EventTarget(); page.body = {}; page.hidden = false;
  globalThis.document = page; globalThis.window = new EventTarget();
  const canvas = new EventTarget(); canvas.focus = () => { page.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const eye = new PerspectiveCamera(), camera = new PerspectiveCamera(60, 1, .09, 1200);
  const collision = { blocks: (...args) => world.collision.blocks(...args) || world.biomes.blocks(...args)
    || world.extras.blocks(...args) || world.station.blocks(...args), supportAt: (...args) => world.collision.supportAt(...args) };
  const memory = createGroundMemory(world.scene, world.weather.state, world.collision);
  const walker = createWalker(eye, canvas, collision, world.weather.state, memory.sampleAt);
  const hero = createHero(world.scene), effects = createFootprints(world.scene, { sampleGround: memory.sampleAt, collision: world.collision });
  const character = createCharacterView(camera, eye, walker, hero, world.collision, memory.sampleAt);
  walker.enter({ position: [59.4, 1.665, 45], target: [70, 1.4, 45] });
  character.setFollowing(true);
  let time = 0, swimmingFrames = 0; const modes = new Set();
  function tick() {
    const dt = 1 / 30; time += dt; tide.update(dt); memory.update(dt, time); walker.update(dt);
    character.frameWalk(dt, time); modes.add(walker.medium);
    for (const contact of hero.drainFootContacts()) {
      contact.ground = memory.sampleAt(contact.x, contact.z, {});
      contact.soleWetness = hero.wetFootContact(contact.side, contact.ground);
      effects.step(contact);
    }
    effects.update(dt, time);
  }
  walker.setTouch(0, 1);
  for (let i = 0; i < 600; i++) {
    tick(); if (walker.medium === 'swim' && ++swimmingFrames > 45) break;
  }
  assert.ok(swimmingFrames > 45, 'the entrance is not blocked by a submerged rock');
  assert.ok(hero.wetness.upper > .98);
  walker.setTouch(0, -1);
  for (let i = 0; i < 800 && walker.position.x > 56.5; i++) tick();
  assert.equal(walker.medium, 'walk'); assert.ok(walker.position.x < 57);
  assert.ok(modes.has('wade') && modes.has('swim'));
  const marks = effects.prints.filter((p) => p.active && p.kind === 'carried-water');
  assert.ok(marks.length >= 5, `${marks.length} wet boot marks remain after swimming back to shore`);
  assert.ok(marks.every((p) => memory.sampleAt(p.x, p.z).waterDepth === 0));
  console.log({ coastRoundTripSeconds: time, wetMarksAfterExit: marks.length });
  resetTide(); setRiverFloodStage(0);
});
