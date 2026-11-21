import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Scene, PerspectiveCamera, Vector3 } from 'three';
import { buildWorldScene } from '../test-support/world-scene.mjs';
import { createWalker } from '../src/world-walk.js';
import { createHero } from '../src/world-hero.js';
import { createCharacterView } from '../src/world-character.js';
import { createWaterActions } from '../src/world-water-actions.js';
import { createWorldTide, resetTide, seaSurfaceHeight } from '../src/world-tides.js';
import { groundSurfaceHeight, waterSurfaceAt, setRiverFloodStage } from '../src/world-terrain.js';

afterEach(() => { resetTide(); setRiverFloodStage(0); });
const world = buildWorldScene();
function setup(x = 62.1, z = 45, swimming = false, y = null, collision = null) {
  resetTide(); setRiverFloodStage(0);
  const page = new EventTarget(); page.hidden = false; page.body = {};
  globalThis.document = page; globalThis.window = new EventTarget();
  const canvas = new EventTarget(); canvas.focus = () => { page.activeElement = canvas; }; canvas.hasPointerCapture = () => false;
  const eye = new PerspectiveCamera(), camera = new PerspectiveCamera(60, 1.4, .09, 1200);
  const solids = collision ?? { blocks: (...args) => world.collision.blocks(...args) || world.biomes.blocks(...args)
    || world.extras.blocks(...args) || world.station.blocks(...args), supportAt: (...args) => world.collision.supportAt(...args) };
  const walker = createWalker(eye, canvas, solids);
  const scene = new Scene(), hero = createHero(scene);
  const character = createCharacterView(camera, eye, walker, hero, world.collision);
  walker.enter({ position: [x, y ?? (swimming ? .26 : groundSurfaceHeight(x, z) + 1.64), z],
    target: [x + 10, y ?? 1.4, z], swimming, preserveHeight: y !== null });
  character.setFollowing(true);
  let time = 0;
  const events = [];
  return { walker, hero, eye, events, camera,
    tick(count = 1) { for (let i = 0; i < count; i++) {
      const dt = 1 / 30; time += dt; walker.update(dt); character.frameWalk(dt, time);
      events.push(...walker.drainWaterEvents(), ...hero.drainWaterEvents());
    } },
  };
}

test('a shore leap is ballistic, produces one entry impact and submerges before recovering buoyancy', () => {
  const h = setup(); const floor = h.walker.feet;
  h.walker.waterAction(); h.tick(); assert.equal(h.walker.diving, true);
  let peak = floor, maxDepth = 0, maximumStep = 0;
  const previous = h.eye.position.clone();
  for (let i = 0; i < 150; i++) {
    h.tick(); peak = Math.max(peak, h.walker.feet); maxDepth = Math.max(maxDepth, h.walker.depth);
    maximumStep = Math.max(maximumStep, h.eye.position.distanceTo(previous)); previous.copy(h.eye.position);
    assert.ok(h.eye.position.toArray().every(Number.isFinite));
  }
  assert.ok(peak > floor + .75, 'the character leaves the bank instead of snapping into the sea');
  assert.ok(maxDepth > .12, `maximum submersion ${maxDepth}`);
  assert.equal(h.events.filter((e) => e.kind === 'entry').length, 1);
  assert.equal(h.events.find((e) => e.kind === 'entry').leap, true);
  assert.equal(h.walker.medium, 'swim'); assert.ok(h.walker.position.x > 67);
  assert.ok(maximumStep < .5, `largest motion step ${maximumStep}`);
  assert.ok(h.walker.depth < .05, 'passive buoyancy returns the jumper to the surface');
  assert.equal(h.hero.drainFootContacts().length, 0, 'air and swimming create no ground prints');
  console.log({ leapPeak: peak - floor, maximumEntryDepth: maxDepth, maximumStep });
});

test('a shallow, dry or blocked landing rejects the leap; restoring a position emits no landing splash', () => {
  for (const config of [[59.4, 45], [30, -25]]) {
    const h = setup(...config); h.walker.waterAction(); h.tick();
    assert.equal(h.walker.airborne, false); assert.equal(h.walker.diving, false);
    assert.ok(h.walker.actionNote); assert.equal(h.events.length, 0);
  }
  const blocked = setup(62.1, 45, false, null, { blocks: (x) => x > 62.4 });
  blocked.walker.waterAction(); blocked.tick(); assert.equal(blocked.walker.diving, false);
  assert.equal(blocked.walker.restore({ position: [70, -.3, 45], yaw: -Math.PI / 2, pitch: 0, swimming: true }), false);
  assert.equal(blocked.walker.drainWaterEvents().length, 0);
  const restored = setup();
  assert.ok(restored.walker.restore({ position: [70, -.3, 45], yaw: -Math.PI / 2, pitch: 0, swimming: true }));
  restored.tick(); assert.equal(restored.events.length, 0);
});

test('surface play emits hand splashes once, shallow play kicks water and submerged play releases bubbles', () => {
  for (const [x, y, kind, minimum] of [[70, .26, 'play', 2], [63.8, null, 'play', 1], [75, -1, 'bubble', 2]]) {
    const h = setup(x, 45, x > 68, y);
    h.tick(10); h.walker.waterAction(); h.tick(50);
    const actions = h.events.filter((e) => e.kind === kind);
    assert.ok(actions.length >= minimum && actions.length <= 2, `${x}: ${actions.length} ${kind} events`);
    assert.equal(h.walker.playPhase, -1);
    for (const e of actions) {
      const surface = waterSurfaceAt(e.x, e.z, groundSurfaceHeight(e.x, e.z));
      assert.notEqual(surface, null);
      if (kind === 'bubble') assert.ok(e.y < surface); else assert.ok(Math.abs(e.y - surface) < 1e-6);
    }
    assert.equal(h.hero.drainFootContacts().length, 0, 'standing play does not stamp fake walking steps');
  }
});

test('swimming surface strokes are emitted at real hand crossings and user steering remains available during play', () => {
  resetTide();
  const hero = createHero(new Scene()); let time = 0, strokes = 0;
  for (let i = 0; i < 240; i++) {
    hero.update(1 / 30, time += 1 / 30, { position: new Vector3(75 + i / 30 * 2, -.02, 45),
      yaw: Math.PI / 2, swimming: true, speed: 2 });
    strokes += hero.drainWaterEvents().filter((e) => e.kind === 'stroke').length;
  }
  assert.ok(strokes >= 4, `${strokes} hand entries`);
  const h = setup(70, 45, true, .26), start = h.eye.position.clone();
  h.walker.waterAction(); h.walker.setTouch(1, 0); h.walker.look(70, 15); h.tick(20);
  assert.ok(h.eye.position.distanceTo(start) > .3);
  assert.ok(Math.abs(h.walker.snapshot().yaw + Math.PI / 2) > .1);
});

test('entry water crowns, ripples, surface wakes and submerged bubbles use finite fixed buffers', () => {
  resetTide(); const scene = new Scene(), camera = new PerspectiveCamera(); camera.position.set(67, 3, 45);
  const actions = createWaterActions(scene, world.collision);
  assert.equal(actions.emit({ kind: 'entry', x: 30, y: 4, z: -25, strength: 1 }), false);
  assert.ok(actions.emit({ kind: 'entry', x: 69, y: 0, z: 45, strength: 1 }));
  actions.update(.1, camera);
  assert.equal(actions.crowns.count, 1); assert.equal(actions.rings.count, 2); assert.ok(actions.stats.droplets > 5);
  const objects = scene.children.length;
  for (let i = 0; i < 900; i++) {
    if (i % 3 === 0) actions.emit({ kind: i % 2 ? 'play' : 'bubble', x: 70, y: i % 2 ? 0 : -.9, z: 45, strength: .5 });
    actions.update(1 / 30, camera, new Vector3(70 + Math.sin(i * .03), .26, 45), 'swim', Math.PI / 2, 2);
    assert.ok(actions.stats.active <= actions.stats.capacity && actions.stats.droplets <= actions.stats.dropCapacity);
  }
  assert.ok(actions.stats.wakes > 5 && actions.stats.bubbles > 10);
  for (const a of Object.values(actions.droplets.geometry.attributes)) assert.ok([...a.array].every(Number.isFinite));
  assert.equal(scene.children.length, objects);
  for (let i = 0; i < 90; i++) actions.update(.1, camera);
  assert.equal(actions.stats.active, 0); assert.equal(actions.rings.count, 0); assert.equal(actions.crowns.count, 0);
});
