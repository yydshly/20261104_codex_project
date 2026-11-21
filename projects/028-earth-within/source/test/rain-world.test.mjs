import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, groundSurfaceHeight, waterSurfaceAt } from '../src/world-terrain.js';
import { createTrail, trailClearance } from '../src/world-trail.js';
import { createWater } from '../src/world-water.js';
import { createEcology } from '../src/world-ecology.js';
import { createStation } from '../src/world-station.js';
import { createUnderwater } from '../src/world-underwater.js';
import { createBiomes } from '../src/world-biomes.js';
import { createExtras } from '../src/world-extras.js';
import { createWorldCollision } from '../src/world-collision.js';
import { createWorldWeather } from '../src/world-weather.js';
import { createPuddles } from '../src/world-puddles.js';
import { createRainEnvironment, createWetSurfaces } from '../src/world-rain-environment.js';
import { rainSoundProfile } from '../src/world-audio.js';
import { createGroundMemory } from '../src/world-ground-memory.js';

test('rain exposure, drainage, ecology and recovery in the actual world', () => {
  const scene = new THREE.Scene();
  const terrain = createTerrain(scene, trailClearance);
  createTrail(scene);
  createWater(scene);
  const ecology = createEcology(scene, trailClearance);
  const station = createStation(scene);
  createUnderwater(scene);
  const biomes = createBiomes(scene);
  createExtras(scene);
  const collision = createWorldCollision(scene);
  const puddles = createPuddles(scene, collision);
  const system = createWorldWeather();
  const weather = system.state;
  weather.shelters = [...biomes.rainShelters, ...station.rainShelters];
  weather.puddleSurfaceAt = puddles.surfaceAt;
  const environment = createRainEnvironment(scene, weather);
  const animalMaterial = biomes.animals[0].figure.children.find((child) => child.isMesh)?.material;
  weather.groundExposureAt = (x, z) => environment.sample(new THREE.Vector3(x, groundSurfaceHeight(x, z) + .02, z), {}, false).exposure;
  const groundMemory = createGroundMemory(scene, weather, collision);
  const wet = createWetSurfaces(scene, weather, environment, groundMemory);
  assert.ok(wet.surfaceCount > 10);
  assert.equal(biomes.animals[0].figure.children.find((child) => child.isMesh)?.material, animalMaterial);
  for (const roof of weather.shelters) {
    const x = (roof.minX + roof.maxX) / 2;
    const z = (roof.minZ + roof.maxZ) / 2;
    const height = roof.heightAt?.(x, z) ?? roof.height;
    assert.equal(environment.sample(new THREE.Vector3(x, height - 1, z)).cover, 'roof');
    assert.ok(environment.sample(new THREE.Vector3(x, height - 1, z)).exposure < .1);
    assert.notEqual(environment.sample(new THREE.Vector3(x, height + .5, z)).cover, 'roof');
  }
  const crown = terrain.userData.rainCanopies.find((item) => item.y - groundSurfaceHeight(item.x, item.z) > 2.8);
  assert.equal(environment.sample(new THREE.Vector3(crown.x, crown.y - 1, crown.z)).cover, 'tree');

  // Both the terrain's existing riverbed shader and the wet-surface shader must survive composition.
  const ground = terrain.children.find((mesh) => mesh.geometry?.getAttribute('aRiverDepth'));
  const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: THREE.ShaderLib.standard.fragmentShader };
  ground.material.onBeforeCompile(shader, null);
  assert.ok(shader.uniforms.uRiverTime && shader.uniforms.uSurfaceWetness);
  assert.match(shader.fragmentShader, /roughnessFactor = mix/);
  assert.match(shader.fragmentShader, /wetDepth > .012/);
  assert.match(shader.fragmentShader, /sedimentMark/);
  assert.ok(ground.geometry.getAttribute('aMudResidue'));

  let time = 0;
  function advance(seconds, intensity) {
    for (let i = 0; i < seconds * 30; i++) {
      time += 1 / 30;
      system.update(1 / 30, intensity);
      ecology.update(1 / 30, time, weather.rain, weather);
      biomes.update(1 / 30, time, weather.rain, null, collision, weather);
      puddles.update(1 / 30, time, weather);
      groundMemory.update(1 / 30, time);
      wet.update();
    }
  }
  advance(2, 0);
  assert.equal(puddles.fill, 0);
  assert.equal(shader.uniforms.uSurfaceWetness.value, 0);
  advance(60, 1);
  assert.equal(ecology.rainState.beesSheltered, 3);
  assert.equal(ecology.rainState.surfaceAntsOutside, 0);
  assert.equal(ecology.rainState.undergroundAntsActive, 10);
  assert.equal(biomes.animals.filter((animal) => animal.sheltered).length, 10);
  assert.ok(ecology.rainState.beeActivity < .05);
  assert.ok(shader.uniforms.uSurfaceWetness.value > .95);
  assert.equal(puddles.patches.length, 9);
  const compact = puddles.patches.find((patch) => patch.surface === 'compact-soil');
  const sand = puddles.patches.find((patch) => patch.surface === 'sand');
  assert.ok(compact.fill > sand.fill + .3);
  for (const patch of puddles.patches) assert.ok(patch.level <= patch.rim);
  assert.ok(puddles.drainage.paths.length >= 10);
  let samples = 0;
  for (const path of puddles.drainage.paths) {
    assert.ok(path.renderPoints.at(-1).distanceTo(path.outlet) < .0001);
    let previous = path.points[0].y;
    for (let i = 1; i < path.points.length; i++) {
      for (let step = 1; step <= 10; step++) {
        const point = path.points[i - 1].clone().lerp(path.points[i], step / 10);
        const floor = groundSurfaceHeight(point.x, point.z);
        assert.ok(floor <= previous + .0001);
        assert.equal(collision.blocks(point.x, floor + 1.64, point.z, floor, false), false);
        // The lower part of this dry-weather stream can now be submerged in a flood.
        assert.equal(waterSurfaceAt(point.x, point.z, floor, 0), null);
        previous = floor;
        samples++;
      }
    }
  }
  const wetBefore = shader.uniforms.uSurfaceWetness.value;
  advance(1 / 30, 0);
  assert.ok(shader.uniforms.uSurfaceWetness.value > wetBefore - .01);
  advance(140, 0);
  assert.equal(ecology.rainState.beesForaging, 3);
  assert.equal(ecology.rainState.surfaceAntsOutside, 4);
  assert.ok(compact.fill > sand.fill && compact.fill < .12);
  assert.ok(shader.uniforms.uSurfaceWetness.value < .18);
  assert.ok(puddles.drainage.activity < .01);
  // The rain-afterward preview must open on continuous exposed soil, away from decorative rocks.
  for (let i = 0; i <= 34; i++) {
    const x = THREE.MathUtils.lerp(-36.48276, -32.51724, i / 34);
    const z = THREE.MathUtils.lerp(5.10859, 5.63266, i / 34);
    for (const side of [-.14, 0, .14]) {
      const sx = x - side * .13102;
      const sz = z + side * .99138;
      const floor = groundSurfaceHeight(sx, sz);
      assert.equal(collision.blocks(sx, floor + 1.64, sz, floor, false), false);
      assert.ok(groundMemory.sampleAt(sx, sz).mud > .4);
    }
  }
  console.log({ surfaces: wet.surfaceCount, streams: puddles.drainage.paths.length, downhillSamples: samples,
    remainingCompactWater: compact.fill, remainingSandWater: sand.fill });
});

test('rain sound distinguishes surfaces, shelter, underwater and residual drips', () => {
  const open = rainSoundProfile({ rain: 1, wetness: 1 });
  const roof = rainSoundProfile({ rain: 1, wetness: 1, rainCover: 'roof', rainExposure: .04, rainSurface: 'roof' });
  const tree = rainSoundProfile({ rain: 1, wetness: 1, rainCover: 'tree', rainExposure: .33, rainSurface: 'foliage' });
  const water = rainSoundProfile({ rain: 1, rainSurface: 'water' });
  const submerged = rainSoundProfile({ rain: 1, rainSurface: 'water', submerged: 1 });
  assert.ok(roof.ground < open.ground * .1 && roof.roof > open.roof);
  assert.ok(tree.foliage > open.foliage && water.water > open.water);
  assert.ok(submerged.water < water.water * .04);
  assert.ok(rainSoundProfile({ wetness: 1, rainCover: 'roof' }).drip > 0);
  assert.ok(Object.values(rainSoundProfile()).every((level) => level === 0));
});
