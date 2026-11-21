import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, groundSurfaceHeight } from '../src/world-terrain.js';
import { createWorldWeather } from '../src/world-weather.js';
import { createGroundMemory } from '../src/world-ground-memory.js';
import { createFootprints } from '../src/world-footprints.js';
import { createHero } from '../src/world-hero.js';

test('actual boot contacts make marks on a receded bank and splashes on the adjoining shallows', () => {
  const weather = createWorldWeather();
  const scene = new THREE.Scene();
  createTerrain(scene);
  const memory = createGroundMemory(scene, weather.state);
  const effects = createFootprints(scene, { sampleGround: memory.sampleAt });
  const hero = createHero(scene);
  const dt = 1 / 30;
  let time = 0;
  function tick(rain) {
    time += dt;
    weather.update(dt, rain);
    memory.update(dt, time);
  }
  for (let i = 0; i < 60 * 30; i++) tick(1);
  for (let i = 0; i < 140 * 30; i++) tick(0);
  function walk(frames, pointAt, yaw, speed) {
    for (let i = 0; i < frames; i++) {
      tick(0);
      const [x, z] = pointAt(i * dt);
      hero.update(dt, time, { position: new THREE.Vector3(x, groundSurfaceHeight(x, z) + .025, z),
        yaw, speed, visible: false, contactsEnabled: true });
      for (const contact of hero.drainFootContacts()) {
        contact.ground = memory.sampleAt(contact.x, contact.z);
        contact.medium = contact.ground.waterDepth > .16 ? 'wade' : 'walk';
        effects.step(contact);
      }
      effects.update(dt, time);
    }
  }
  walk(90, (seconds) => [-2 + seconds * 1.3, -9.2], Math.PI / 2, 1.3);
  assert.ok(effects.stats.footprintsCreated >= 4);
  hero.resetPose();
  const before = effects.stats.splashesCreated;
  walk(60, (seconds) => [0, -8.7 + seconds * .4], 0, .4);
  assert.ok(effects.stats.splashesCreated > before);
  const count = effects.stats.footprintsCreated;
  walk(60, () => [0, -7.9133333333], 0, 0);
  assert.equal(effects.stats.footprintsCreated, count);
  console.log({ actualBootPrints: count, shallowAndMudSplashes: effects.stats.splashesCreated });
});
