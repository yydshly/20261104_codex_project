import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, baseRiverSurfaceHeight, riverSurfaceHeight, groundSurfaceHeight,
  riverZ, waterSurfaceAt, setRiverFloodStage } from '../src/world-terrain.js';
import { createWater } from '../src/world-water.js';
import { createWalker } from '../src/world-walk.js';

test('the tidal reach joins the sea at one continuous height in dry weather and a flood', () => {
  for (const stage of [0, .5, 1]) {
    setRiverFloodStage(stage);
    let previous = Infinity;
    for (let x = 48; x <= 72; x += .025) {
      const surface = riverSurfaceHeight(x);
      assert.ok(surface <= previous + .00001);
      previous = surface;
      if (x >= 60) assert.ok(Math.abs(surface) < .000001);
      const z = riverZ(x);
      assert.ok(Math.abs((waterSurfaceAt(x, z, groundSurfaceHeight(x, z)) ?? 0) - surface) < .000001);
    }
  }
  assert.equal(baseRiverSurfaceHeight(60), 0);
  assert.equal(baseRiverSurfaceHeight(69), 0);
  setRiverFloodStage(0);
  const scene = new THREE.Scene();
  createTerrain(scene);
  createWater(scene);
  const ocean = scene.children.find((object) => object.name === 'Littoral water and ocean');
  const p = ocean.geometry.getAttribute('position');
  const water = ocean.geometry.getAttribute('aWater');
  for (let i = 0; i < p.count; i++) {
    if (p.getX(i) >= 60) assert.equal(water.getY(i), 0);
    const floor = groundSurfaceHeight(p.getX(i), p.getZ(i));
    if (p.getX(i) >= 60 && waterSurfaceAt(p.getX(i), p.getZ(i), floor, 0) === 0) assert.equal(water.getY(i), 0);
  }
});

test('a swimmer can cross the river mouth without switching water planes or losing buoyancy', () => {
  const page = new EventTarget(); page.body = {}; page.hidden = false;
  globalThis.document = page; globalThis.window = new EventTarget();
  const canvas = new EventTarget(); canvas.focus = () => { page.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const camera = new THREE.PerspectiveCamera();
  const walker = createWalker(camera, canvas, { blocks: () => false }, { runoff: 0 });
  const x = 57, z = riverZ(x);
  walker.enter({ position: [x, riverSurfaceHeight(x) + .26, z], target: [x + 5, riverSurfaceHeight(x) + .26, z], swimming: true });
  walker.setTouch(0, 1);
  let largestVerticalStep = 0;
  for (let i = 0; i < 180; i++) {
    const previousY = walker.position.y;
    walker.update(1 / 30);
    largestVerticalStep = Math.max(largestVerticalStep, Math.abs(walker.position.y - previousY));
    assert.ok(['swim', 'dive'].includes(walker.medium));
  }
  assert.ok(walker.position.x > 70);
  assert.ok(largestVerticalStep < .025);
  assert.ok(Math.abs(walker.position.y - .26) < .01);
});
