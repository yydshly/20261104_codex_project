import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera } from 'three';
import { createWalker } from '../src/world-walk.js';
import { groundSurfaceHeight, riverSurfaceHeight, setRiverFloodStage } from '../src/world-terrain.js';

const dt = 1 / 30;
function makeWalker({ x = 0, z = -8.2, ceiling = Infinity, submergedEye = null,
  lockHorizontal = true, halfRoofWidth = Infinity } = {}) {
  const page = new EventTarget();
  page.body = {};
  page.hidden = false;
  globalThis.document = page;
  globalThis.window = new EventTarget();
  const canvas = new EventTarget();
  canvas.focus = () => { page.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const floor = groundSurfaceHeight(x, z);
  // Constrain horizontal drift to a narrow vertical test column. All vertical
  // collision checks still use the walker's actual standing/swimming capsule.
  const collision = {
    blocks(px, eye, pz, ground, swimming, feet = ground, crouch = 0) {
      if (lockHorizontal && Math.hypot(px - x, pz - z) > .000001) return true;
      const underRoof = Math.abs(px - x) <= halfRoofWidth + .24 && Math.abs(pz - z) <= 1.74;
      const bottom = swimming ? eye - .39 : Math.max(ground + .24, feet + .02);
      const top = swimming ? eye + .16 : feet + 1.78 - .62 * crouch;
      return underRoof && top > floor + ceiling + .000001 && bottom < floor + ceiling + .15;
    },
  };
  const camera = new PerspectiveCamera();
  const walker = createWalker(camera, canvas, collision, { runoff: 1 });
  walker.enter({ position: [x, submergedEye === null ? floor : floor + submergedEye, z],
    target: [x + 1, floor + 1.5, z], preserveHeight: submergedEye !== null, swimming: submergedEye !== null });
  return { walker, floor, camera };
}

test('an idle character follows walk, wade and swim as a shallow bank floods and drains', () => {
  setRiverFloodStage(0);
  const { walker, floor } = makeWalker();
  assert.equal(walker.medium, 'walk');
  let notifications = 0;
  let maximumStep = 0;
  const modes = new Set([walker.medium]);
  function advance(stage) {
    const previous = walker.position.y;
    setRiverFloodStage(stage);
    walker.update(dt, () => { notifications++; });
    maximumStep = Math.max(maximumStep, Math.abs(walker.position.y - previous));
    modes.add(walker.medium);
  }
  for (let i = 0; i <= 600; i++) advance(i / 600);
  for (let i = 0; i < 150; i++) advance(1);
  assert.equal(walker.medium, 'swim');
  assert.ok(Math.abs(walker.position.y - riverSurfaceHeight(0) - .26) < .01);
  for (let i = 600; i >= 0; i--) advance(i / 600);
  for (let i = 0; i < 150; i++) advance(0);
  assert.equal(walker.medium, 'walk');
  assert.ok(Math.abs(walker.position.y - floor - 1.64) < .005);
  assert.deepEqual([...modes].sort(), ['swim', 'wade', 'walk']);
  assert.ok(maximumStep < .11, `vertical step ${maximumStep}`);
  assert.ok(notifications > 100);
  console.log({ maximumVerticalStep: maximumStep, verticalNotifications: notifications });
});

test('wading has a quiet band rather than oscillating around a single threshold', () => {
  setRiverFloodStage(0);
  const { walker, floor } = makeWalker();
  const dryDepth = riverSurfaceHeight(0) - floor;
  function depth(value) {
    setRiverFloodStage((value - dryDepth) / 1.25);
    walker.update(dt);
  }
  depth(.17);
  assert.equal(walker.medium, 'wade');
  for (const value of [.15, .13, .15, .12]) { depth(value); assert.equal(walker.medium, 'wade'); }
  depth(.09);
  assert.equal(walker.medium, 'walk');
  depth(.15);
  assert.equal(walker.medium, 'walk');
  setRiverFloodStage(0);
});

test('surface float follows a rising river while an idle diver keeps their chosen depth', () => {
  setRiverFloodStage(0);
  const { walker } = makeWalker({ z: -5 });
  assert.equal(walker.medium, 'swim');
  for (let i = 0; i <= 600; i++) {
    setRiverFloodStage(i / 600);
    walker.update(dt);
  }
  assert.ok(Math.abs(walker.position.y - riverSurfaceHeight(0) - .26) < .01);
  walker.setVertical(-1);
  for (let i = 0; i < 20; i++) walker.update(dt);
  walker.setVertical(0);
  assert.equal(walker.medium, 'dive');
  const chosen = walker.position.y;
  for (let i = 600; i >= 0; i--) {
    setRiverFloodStage(i / 600);
    walker.update(dt);
  }
  assert.equal(walker.medium, 'dive');
  assert.ok(Math.abs(walker.position.y - chosen) < .001);
  walker.setVertical(1);
  for (let i = 0; i < 90; i++) walker.update(dt);
  walker.setVertical(0);
  assert.equal(walker.medium, 'swim');
});

test('close-up observation pauses input but not rising-water buoyancy', () => {
  setRiverFloodStage(0);
  const { walker } = makeWalker();
  walker.exit();
  let notifications = 0;
  for (let i = 0; i <= 600; i++) {
    setRiverFloodStage(i / 600);
    walker.refreshWater(dt, () => { notifications++; });
  }
  assert.equal(walker.active, false);
  assert.equal(walker.medium, 'swim');
  assert.equal(walker.position.x, 0);
  assert.equal(walker.position.z, -8.2);
  assert.ok(walker.waterDepth > 1.19 && notifications > 20);
  for (let i = 600; i >= 0; i--) {
    setRiverFloodStage(i / 600);
    walker.refreshWater(dt);
  }
  assert.equal(walker.medium, 'walk');
});

test('rising buoyancy cannot carry a swimmer through a low overhead surface', () => {
  setRiverFloodStage(0);
  const { walker, floor } = makeWalker({ z: -5, ceiling: 2.4 });
  for (let i = 0; i <= 600; i++) {
    setRiverFloodStage(i / 600);
    walker.update(dt);
    assert.ok(walker.position.y + .16 <= floor + 2.40001);
  }
  assert.equal(walker.medium, 'dive');
  setRiverFloodStage(0);
});

test('receding shallow water selects a crouch under a low roof', () => {
  setRiverFloodStage(1);
  const { walker, floor } = makeWalker({ ceiling: 1.5, submergedEye: .8 });
  for (let i = 600; i >= 0; i--) {
    setRiverFloodStage(i / 600);
    walker.update(dt);
  }
  assert.equal(walker.medium, 'walk');
  assert.ok(walker.crouch > .4);
  assert.ok(walker.feet + 1.78 - .62 * walker.crouch <= floor + 1.5);
});

test('a jump remains airborne until it falls far enough into the rising river', () => {
  setRiverFloodStage(0);
  const { walker } = makeWalker();
  walker.jump();
  walker.update(dt);
  assert.equal(walker.airborne, true);
  setRiverFloodStage(1);
  walker.update(dt);
  assert.equal(walker.airborne, true);
  for (let i = 0; i < 90; i++) walker.update(dt);
  assert.equal(walker.medium, 'swim');
  setRiverFloodStage(0);
});

test('a swimmer can leave a finite low slab after the water has drained', () => {
  setRiverFloodStage(1);
  const { walker, floor } = makeWalker({ ceiling: .90, submergedEye: .60,
    lockHorizontal: false, halfRoofWidth: .50 });
  setRiverFloodStage(0);
  walker.refreshWater(dt);
  assert.equal(walker.lowClearance, true);
  assert.ok(walker.waterDepth < .1);
  walker.setTouch(0, 1);
  let maximumStep = 0;
  let checkedInside = 0;
  for (let i = 0; i < 90; i++) {
    const previous = walker.position.y;
    walker.update(dt);
    maximumStep = Math.max(maximumStep, Math.abs(walker.position.y - previous));
    if (walker.position.x <= .74) {
      assert.equal(walker.lowClearance, true);
      assert.ok(walker.position.y + .16 <= floor + .90001);
      checkedInside++;
    }
  }
  walker.setTouch(0, 0);
  for (let i = 0; i < 60; i++) walker.update(dt);
  assert.ok(checkedInside > 10);
  assert.ok(walker.position.x > .74);
  assert.equal(walker.lowClearance, false);
  assert.ok(walker.medium === 'walk' || walker.medium === 'wade');
  assert.ok(Math.abs(walker.position.y - walker.feet - 1.64) < .01);
  assert.ok(maximumStep < .15, `exit vertical step ${maximumStep}`);
  setRiverFloodStage(0);
});
