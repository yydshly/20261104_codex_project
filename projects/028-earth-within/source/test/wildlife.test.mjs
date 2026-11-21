import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, groundSurfaceHeight, riverSurfaceHeight, setRiverFloodStage } from '../src/world-terrain.js';
import { createWater } from '../src/world-water.js';
import { createExtras } from '../src/world-extras.js';
import { createStation } from '../src/world-station.js';
import { createWorldCollision } from '../src/world-collision.js';
import { createWildlifeVisitor, distanceToVisitor } from '../src/world-wildlife.js';
import { buildWorldScene } from '../test-support/world-scene.mjs';

test('fish flee from their actual position and keep away from the whole swimmer body', () => {
  setRiverFloodStage(0);
  const scene = new THREE.Scene();
  createTerrain(scene);
  const water = createWater(scene);
  const collision = createWorldCollision(scene);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(75, -1, 32);
  let time = 0;
  for (let i = 0; i < 30; i++) water.update(1 / 30, time += 1 / 30, 0, camera, null, collision);
  for (const habitat of ['river', 'sea']) {
    const fish = water.fish.find((item) => item.habitat === habitat);
    const tracker = createWildlifeVisitor();
    const position = fish.position.clone().add(new THREE.Vector3(-1.4, .05, 0));
    const visitor = tracker.update(position, 'swim', Math.PI / 2, 0, 1 / 30);
    const before = distanceToVisitor(fish.position, visitor);
    let maximumStep = 0;
    for (let i = 0; i < 60; i++) {
      const previous = fish.position.clone();
      water.update(1 / 30, time += 1 / 30, 0, camera, visitor, collision);
      maximumStep = Math.max(maximumStep, fish.position.distanceTo(previous));
      const floor = groundSurfaceHeight(fish.position.x, fish.position.z);
      const surface = habitat === 'river' ? riverSurfaceHeight(fish.position.x) : 0;
      assert.ok(fish.position.y > floor && fish.position.y < surface);
      assert.equal(collision.cameraBlocked(fish.position, .12), false);
    }
    assert.ok(distanceToVisitor(fish.position, visitor) > before + .5, habitat);
    assert.ok(maximumStep <= 4.8 / 30 + .001);
    assert.ok(fish.alarm > .1);
    console.log({ habitat, before, after: distanceToVisitor(fish.position, visitor), maximumStep });
  }
  const fish = water.fish.find((item) => item.habitat === 'river');
  const floor = groundSurfaceHeight(fish.position.x, fish.position.z);
  const tracker = createWildlifeVisitor();
  const visitor = tracker.update(new THREE.Vector3(fish.position.x, floor + 1.64, fish.position.z), 'wade', 0, floor, 1 / 30);
  water.update(1 / 30, time += 1 / 30, 0, camera, visitor, collision);
  assert.ok(fish.alarm > .8, 'wading legs should also scare the fish');
  for (let i = 0; i < 10 * 30; i++) water.update(1 / 30, time += 1 / 30, 0, camera, null, collision);
  assert.ok(water.fish.every((item) => item.alarm < .01));
});

test('wetland birds take off before contact, block penetration, and return continuously', () => {
  const scene = new THREE.Scene();
  createTerrain(scene);
  const extras = createExtras(scene);
  const collision = createWorldCollision(scene);
  const bird = extras.birds[0];
  const home = bird.position.clone();
  const floor = groundSurfaceHeight(home.x, home.z);
  assert.equal(extras.blocks(home.x, floor + 1.64, home.z, floor, false), true);
  const tracker = createWildlifeVisitor();
  const visitor = tracker.update(new THREE.Vector3(home.x - 2.7, floor + 1.64, home.z), 'walk', Math.PI / 2, floor, 1 / 30);
  let time = 0;
  let maximumStep = 0;
  for (let i = 0; i < 60; i++) {
    const previous = bird.position.clone();
    extras.update(1 / 30, time += 1 / 30, 0, visitor, collision);
    maximumStep = Math.max(maximumStep, bird.position.distanceTo(previous));
  }
  assert.ok(bird.flying && bird.position.y > home.y + 1);
  assert.ok(bird.legTuck > .8 && bird.flightBlend > .95, 'flight raises and folds the legs gradually');
  assert.ok(bird.position.distanceTo(home) > 2);
  assert.ok(maximumStep < .20);
  assert.equal(extras.blocks(home.x, floor + 1.64, home.z, floor, false), false);
  for (let i = 0; i < 40 * 30; i++) extras.update(1 / 30, time += 1 / 30, 0, null, collision);
  assert.equal(bird.mode, 'forage');
  assert.ok(bird.legTuck < .01 && bird.flightBlend < .01, 'landing extends the legs and folds the wings');
  assert.ok(bird.position.distanceTo(home) < .07);
  assert.equal(extras.blocks(home.x, floor + 1.64, home.z, floor, false), true);
});

test('butterflies and the tide-pool crab flee continuously, stay in habitat, and settle after the visitor leaves', () => {
  const { ecology, biomes, collision } = buildWorldScene();
  const actors = [
    { name: 'crab', state: ecology.crab, limit: .65 * 1.8, update: (dt, time, visitor) => ecology.update(dt, time, 0, null, visitor, collision) },
    { name: 'butterfly', state: biomes.butterflies[0], limit: 1.5 * 1.8,
      update: (dt, time, visitor) => biomes.update(dt, time, 0, visitor?.position ?? null, collision, visitor) },
  ];
  for (const animal of actors) {
    const home = animal.state.position.clone();
    const floor = groundSurfaceHeight(home.x, home.z);
    const tracker = createWildlifeVisitor();
    const visitor = tracker.update(new THREE.Vector3(home.x - 1.2, floor + 1.64, home.z), 'walk', Math.PI / 2, floor, 1 / 30);
    const before = distanceToVisitor(home, visitor);
    let maximumStep = 0;
    for (let i = 0; i < 60; i++) {
      const previous = animal.state.position.clone();
      animal.update(1 / 30, i / 30, visitor);
      maximumStep = Math.max(maximumStep, previous.distanceTo(animal.state.position));
      assert.ok(animal.state.position.y >= groundSurfaceHeight(animal.state.position.x, animal.state.position.z));
    }
    assert.ok(animal.state.fear > .1, animal.name);
    assert.ok(distanceToVisitor(animal.state.position, visitor) > before + .35, animal.name);
    assert.ok(maximumStep <= animal.limit / 30 + .015, `${animal.name} never teleports`);
    for (let i = 60; i < 900; i++) animal.update(1 / 30, i / 30, null);
    assert.ok(animal.state.fear < .01);
    assert.ok(animal.state.position.distanceTo(home) < (animal.name === 'crab' ? 1.2 : 4.2));
    console.log({ animal: animal.name, maximumStep });
  }
});

test('the cabin swallow follows a collision-safe flight rather than cutting through the roof', () => {
  const scene = new THREE.Scene();
  createTerrain(scene);
  const station = createStation(scene);
  const collision = createWorldCollision(scene);
  for (let i = 0; i < 30 * 30; i++) {
    station.update(i / 30, 0, 1 / 30, null, collision);
    assert.equal(collision.cameraBlocked(station.birds[0].position, .34), false);
  }
});
