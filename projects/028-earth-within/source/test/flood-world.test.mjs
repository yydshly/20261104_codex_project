import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, groundSurfaceHeight, waterSurfaceAt, baseRiverSurfaceHeight,
  riverSurfaceHeight, riverZ, riverWidth, riverSpan, riverFloodRiseAt, setRiverFloodStage } from '../src/world-terrain.js';
import { createWorldWeather } from '../src/world-weather.js';
import { createWater } from '../src/world-water.js';
import { createJourney } from '../src/world-journey.js';

test('rain raises the river gradually, leaves terrain and sea fixed, then recedes', () => {
  const system = createWorldWeather();
  const floors = [-80, -30, 0, 36, 60].map((x) => [x, riverZ(x) + riverWidth(x) + .5, groundSurfaceHeight(x, riverZ(x) + riverWidth(x) + .5)]);
  const dryWidths = floors.map(([x]) => { const [a, b] = riverSpan(x); return b - a; });
  let largestStep = 0;
  let previous = 0;
  for (let i = 0; i < 60 * 30; i++) {
    system.update(1 / 30, 1);
    largestStep = Math.max(largestStep, Math.abs(system.state.riverRise - previous));
    previous = system.state.riverRise;
  }
  assert.ok(system.state.riverRise > 1 && largestStep < .003);
  for (const [i, [x, z, floor]] of floors.entries()) {
    assert.equal(groundSurfaceHeight(x, z), floor);
    const [a, b] = riverSpan(x);
    assert.ok(b - a >= dryWidths[i] - .001);
    for (let j = 1; j < 30; j++) {
      const across = THREE.MathUtils.lerp(a, b, j / 30);
      assert.ok(waterSurfaceAt(x, across, groundSurfaceHeight(x, across)) !== null);
    }
  }
  assert.equal(riverFloodRiseAt(-101), 0);
  assert.equal(riverFloodRiseAt(69), 0);
  assert.equal(waterSurfaceAt(90, 8, groundSurfaceHeight(90, 8)), 0);
  const high = system.state.riverRise;
  system.update(1 / 30, 0);
  assert.ok(Math.abs(system.state.riverRise - high) < .003);
  for (let i = 0; i < 240 * 30; i++) system.update(1 / 30, 0);
  assert.ok(system.state.riverRise < .04);
  console.log({ highWaterRise: high, largestFrameRise: largestStep, remainingRise: system.state.riverRise });
  setRiverFloodStage(0);
});

test('rendered river triangles agree with shared water heights in dry and flooded states', () => {
  setRiverFloodStage(0);
  const scene = new THREE.Scene();
  createTerrain(scene);
  const water = createWater(scene);
  const river = scene.children.find((object) => object.name === 'Continuous river surface');
  const vertices = river.geometry.getAttribute('position');
  const depths = river.geometry.getAttribute('aWater');
  const flood = river.geometry.getAttribute('aFlood');
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(-20, 18, 30);
  const point = new THREE.Vector3();
  let compared = 0;
  let maximumError = 0;
  for (const stage of [0, .5, 1]) {
    setRiverFloodStage(stage);
    water.update(1 / 30, 1, 0, camera);
    assert.equal(river.material.uniforms.uRiverStage.value, stage);
    for (let i = 0; i < vertices.count; i += 3) {
      point.set(0, 0, 0);
      let depth = 0;
      let connection = 0;
      for (let j = 0; j < 3; j++) {
        const index = i + j;
        point.x += vertices.getX(index) / 3;
        point.y += (vertices.getY(index) + flood.getX(index) * stage) / 3;
        point.z += vertices.getZ(index) / 3;
        depth += (depths.getX(index) + flood.getX(index) * stage) / 3;
        connection += (flood.getY(index) + flood.getX(index) * stage) / 3;
      }
      if (point.x < -95 || point.x > 64 || depth < .06 || connection < .06) continue;
      const surface = waterSurfaceAt(point.x, point.z, groundSurfaceHeight(point.x, point.z));
      assert.ok(surface !== null, `rendered water has no physical water at ${point.x},${point.z}, stage ${stage}`);
      maximumError = Math.max(maximumError, Math.abs(surface - point.y));
      assert.ok(Math.abs(surface - point.y) < .04);
      compared++;
    }
  }
  assert.ok(compared > 1000);
  console.log({ comparedWaterTriangles: compared, maximumHeightError: maximumError });
  setRiverFloodStage(0);
});

test('a guide paused on a shallow bank changes posture as water rises and falls', () => {
  setRiverFloodStage(0);
  let shore;
  for (const x of [-30, -15, 0, 15, 28]) {
    for (let offset = 0; offset < 8 && !shore; offset += .01) {
      const z = riverZ(x) + riverWidth(x) + offset;
      const floor = groundSurfaceHeight(x, z);
      const above = floor - baseRiverSurfaceHeight(x);
      if (above > .003 && above < .04 && waterSurfaceAt(x, z, floor, 1) !== null) shore = { x, z, floor };
    }
    if (shore) break;
  }
  assert.ok(shore);
  const { x, z, floor } = shore;
  const point = { position: new THREE.Vector3(x, floor + 1.64, z), floor, surface: null, medium: 'walk' };
  const journey = createJourney(new Map([['shore', { points: [point, { ...point, position: point.position.clone().add(new THREE.Vector3(.1, 0, 0)) }], target: new THREE.Vector3(x + 2, floor + 1, z) }]]));
  journey.begin('shore');
  const modes = new Set();
  for (let i = 0; i <= 1800; i++) {
    setRiverFloodStage(i / 1800);
    journey.update(1 / 30);
    modes.add(journey.state.medium);
  }
  assert.ok(modes.has('walk') && modes.has('wade') && modes.has('swim'));
  assert.ok(Math.abs(journey.state.position.y - riverSurfaceHeight(journey.state.position.x) - .26) < .01);
  for (let i = 1800; i >= 0; i--) {
    setRiverFloodStage(i / 1800);
    journey.update(1 / 30);
  }
  assert.equal(journey.state.medium, 'walk');
  assert.ok(Math.abs(journey.state.position.y - journey.state.feet - 1.64) < .01);
  setRiverFloodStage(0);
});
