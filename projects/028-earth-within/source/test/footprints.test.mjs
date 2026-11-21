import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTerrain, groundSurfaceHeight, setRiverFloodStage } from '../src/world-terrain.js';
import { createFootprints } from '../src/world-footprints.js';

test('boot marks fit actual terrain, retain their relief after drying, and wash away within a bounded pool', () => {
  setRiverFloodStage(0);
  const scene = new THREE.Scene();
  createTerrain(scene);
  const state = { localWetness: 1, mud: .9, residue: .7, substrate: 'mud', waterDepth: 0, waterHeight: null };
  const effects = createFootprints(scene, { sampleGround: (_x, _z, target) => Object.assign(target ?? {}, state) });
  const contact = (x, z, side, yaw = 0) => ({ x, z, y: groundSurfaceHeight(x, z) + .025, side, yaw, speed: 2.5 });
  assert.equal(effects.step(contact(0, -8, -1, .71)), true);
  assert.equal(effects.step(contact(.27, -8.16, 1, .71)), true);
  effects.update(1 / 30, 1 / 30);
  assert.equal(effects.stats.activePrints, 2);
  assert.deepEqual(effects.prints.slice(0, 2).map((item) => item.side), [-1, 1]);
  assert.ok(effects.prints.slice(0, 2).every((item) => item.yaw === .71));
  const positions = effects.mesh.geometry.getAttribute('position');
  const sole = effects.mesh.geometry.getAttribute('aSole');
  const marks = effects.mesh.geometry.getAttribute('aMark');
  let samples = 0;
  let maximumGap = 0;
  for (const print of effects.prints.filter((item) => item.active)) {
    const sin = Math.sin(print.yaw), cos = Math.cos(print.yaw);
    for (let i = 0; i < print.count; i++) {
      const index = print.start + i;
      const x = positions.getX(index), y = positions.getY(index), z = positions.getZ(index);
      maximumGap = Math.max(maximumGap, Math.abs(y - groundSurfaceHeight(x, z) - .006));
      assert.ok(Math.abs(sole.getX(index)) <= 1.00001 && Math.abs(sole.getY(index)) <= 1.00001);
      const across = (x - print.x) * cos - (z - print.z) * sin;
      assert.ok(Math.abs(across) <= .08101);
      assert.equal(marks.getY(index), print.side);
      samples++;
    }
  }
  assert.ok(maximumGap < .00001);
  assert.equal(effects.step(contact(.27, -8.16, 1, .71)), false, 'duplicate same planted foot is suppressed');
  state.localWetness = 0; state.mud = 0;
  assert.equal(effects.step(contact(1, -8, -1)), false);
  state.localWetness = 1; state.mud = .9;
  for (const substrate of ['stone', 'wood', 'snow']) {
    state.substrate = substrate;
    const before = effects.stats.footprintsCreated;
    assert.equal(effects.step(contact(1, -8, -1)), false);
    assert.equal(effects.stats.footprintsCreated, before);
  }
  state.substrate = 'mud';
  assert.equal(effects.step({ ...contact(2, -8, -1), speed: 0 }), false);
  assert.equal(effects.step({ ...contact(2, -8, -1), airborne: true }), false);
  assert.equal(effects.step({ ...contact(2, -8, -1), medium: 'swim' }), false);
  assert.equal(effects.step({ ...contact(2, -8, -1), y: groundSurfaceHeight(2, -8) + .9 }), false);
  for (let i = 0; i < 170; i++) effects.step(contact(-10 + i * .13, -7, i % 2 ? -1 : 1));
  effects.update(1 / 30, 2 / 30);
  assert.equal(effects.prints.length, 128);
  assert.ok(effects.stats.activePrints <= effects.stats.printCapacity);
  state.waterDepth = .10; state.waterHeight = 3.0;
  effects.update(1 / 30, 3 / 30);
  for (const print of effects.prints.filter((item) => item.active)) {
    assert.equal(effects.mesh.geometry.getAttribute('aMark').getX(print.start), 0);
  }
  state.waterDepth = 0; state.waterHeight = null;
  effects.update(1 / 30, 4 / 30);
  for (const print of effects.prints.filter((item) => item.active)) {
    assert.ok(effects.mesh.geometry.getAttribute('aMark').getX(print.start) > 0, 'a momentary shallow film does not erase the impression');
  }
  state.waterDepth = 1; state.waterHeight = 4;
  for (let i = 0; i < 400; i++) effects.update(.1, 1 + i * .1);
  assert.equal(effects.stats.activePrints, 0);
  state.waterDepth = 0; state.waterHeight = null;
  effects.step(contact(5, -6, 1));
  for (let i = 0; i < 1700; i++) effects.update(.10, 4 + i * .1);
  assert.ok(effects.stats.activePrints > 0, 'time alone no longer removes a surviving impression');
  console.log({ printedTerrainVertices: samples, maximumTerrainGapError: maximumGap, capacity: effects.stats.printCapacity });
  effects.dispose();
});

test('landing intensity strengthens water and mud feedback while dry land emits a small dust burst', () => {
  const scene = new THREE.Scene();
  createTerrain(scene);
  const state = { localWetness: 1, mud: .7, substrate: 'mud', waterDepth: .1, waterHeight: groundSurfaceHeight(0, -8) + .1 };
  const effects = createFootprints(scene, { sampleGround: () => state });
  const contact = (x, landing = false) => ({ x, z: -8, y: groundSurfaceHeight(x, -8) + .025, speed: 2,
    side: -1, landing, impact: landing ? .9 : 0 });
  effects.step(contact(0));
  effects.step(contact(1, true));
  assert.ok(effects.splashes[1].lifetime > effects.splashes[0].lifetime);
  assert.ok(effects.splashes[1].impact > .8);
  Object.assign(state, { waterDepth: 0, waterHeight: null });
  effects.step(contact(2, true));
  assert.equal(effects.splashes[2].particleCount, 8);
  assert.equal(effects.splashes[2].dust, false);
  Object.assign(state, { localWetness: 0, mud: 0, substrate: 'sand' });
  assert.equal(effects.step(contact(3, true)), true);
  assert.equal(effects.splashes[3].dust, true);
  assert.equal(effects.stats.footprintsCreated, 2, 'dry sand also keeps a shallow impression');
  assert.equal(effects.prints[1].kind, 'sand-impression', 'dry sand is not presented as a wet boot mark');
});

test('shallow feet splash while deep wading makes surface wakes, with finite transient particles', () => {
  const scene = new THREE.Scene();
  createTerrain(scene);
  const floor = groundSurfaceHeight(0, -8);
  const state = { localWetness: 1, mud: .5, substrate: 'mud', waterDepth: .08, waterHeight: floor + .08 };
  const effects = createFootprints(scene, { sampleGround: (_x, _z, target) => Object.assign(target ?? {}, state) });
  const contact = { x: 0, y: floor + .025, z: -8, yaw: 0, side: -1, speed: 2.5 };
  assert.equal(effects.step(contact), true);
  effects.update(.05, .05);
  assert.equal(effects.stats.footprintsCreated, 0);
  assert.equal(effects.stats.activeSplashes, 1);
  assert.equal(effects.rings.count, 1);
  const matrix = new THREE.Matrix4();
  const point = new THREE.Vector3();
  effects.rings.getMatrixAt(0, matrix); point.setFromMatrixPosition(matrix);
  assert.ok(Math.abs(point.y - state.waterHeight - .009) < .00001);
  state.waterHeight += .02;
  effects.update(.05, .10);
  effects.rings.getMatrixAt(0, matrix); point.setFromMatrixPosition(matrix);
  assert.ok(Math.abs(point.y - state.waterHeight - .009) < .00001);
  state.waterDepth = .9;
  assert.equal(effects.step({ ...contact, x: 1, y: groundSurfaceHeight(1, -8) + .025 }), true);
  assert.equal(effects.splashes[1].particleCount, 0, 'deep feet produce a surface wake rather than ejecting bottom water into the air');
  effects.update(.05, .15);
  assert.equal(effects.rings.count, 2);
  state.waterDepth = 1.4;
  assert.equal(effects.step({ ...contact, x: 2, y: groundSurfaceHeight(2, -8) + .025 }), false);
  for (const attribute of Object.values(effects.drops.geometry.attributes)) {
    assert.ok(attribute.array.every(Number.isFinite));
  }
  for (let i = 0; i < 30; i++) effects.update(.05, .15 + i * .05);
  assert.equal(effects.stats.activeSplashes, 0);
  assert.equal(effects.rings.count, 0);
  assert.equal(effects.drops.visible, false);
  effects.dispose();
});
