import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Scene, Vector3 } from 'three';
import { createWorldTide, resetTide, seaSurfaceHeight, TIDE_AMPLITUDE } from '../src/world-tides.js';
import { groundSurfaceHeight, riverSurfaceHeight, riverCurrentAt, riverZ, coastlineX,
  waterSurfaceAt, setRiverFloodStage, createTerrain } from '../src/world-terrain.js';
import { createWalker } from '../src/world-walk.js';
import { createWater } from '../src/world-water.js';
import { createGroundMemory } from '../src/world-ground-memory.js';
import { riverSoundProfile } from '../src/world-audio.js';

afterEach(() => { resetTide(); setRiverFloodStage(0); });

function walkerAt(x, z, lockPosition = false) {
  const page = new EventTarget(); page.body = {}; page.hidden = false;
  globalThis.document = page; globalThis.window = new EventTarget();
  const canvas = new EventTarget(); canvas.focus = () => { page.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const walker = createWalker(new PerspectiveCamera(), canvas, {
    blocks: (px, _y, pz) => lockPosition && Math.hypot(px - x, pz - z) > .000001,
  }, { runoff: 0 });
  walker.enter({ position: [x, seaSurfaceHeight() + .26, z], target: [x + 5, seaSurfaceHeight() + .26, z], swimming: true });
  return walker;
}

test('tide levels and reversing demonstrations are continuous, with slack at high and low water', () => {
  const tide = createWorldTide({ phase: Math.PI / 4 });
  const initial = tide.state.level;
  tide.setDirection(false);
  assert.equal(tide.state.level, initial);
  let previous = initial, largestStep = 0;
  for (let i = 0; i < 240 * 30; i++) {
    tide.update(1 / 30);
    largestStep = Math.max(largestStep, Math.abs(tide.state.level - previous));
    assert.ok(Math.abs(tide.state.level) <= TIDE_AMPLITUDE + 1e-8);
    previous = tide.state.level;
  }
  assert.ok(largestStep < .0004);
  for (const phase of [Math.PI / 2, Math.PI * 1.5]) {
    const slack = createWorldTide({ phase });
    assert.ok(Math.abs(slack.state.flow) < 1e-8);
    assert.ok(Math.abs(Math.abs(slack.state.level) - TIDE_AMPLITUDE) < 1e-8);
  }
});

test('the river and ocean share the same tidal surface through their overlap, while upstream and bed stay fixed', () => {
  const floors = [48, 55, 60, 69, 80].map((x) => groundSurfaceHeight(x, riverZ(x)));
  const upstream = riverSurfaceHeight(0, 0, 0);
  for (const phase of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    createWorldTide({ phase });
    for (const stage of [0, 1]) {
      setRiverFloodStage(stage);
      assert.equal(riverSurfaceHeight(0, 0), upstream);
      for (let x = 55; x <= 83; x += .1) {
        const floor = groundSurfaceHeight(x, riverZ(x));
        assert.ok(Math.abs(riverSurfaceHeight(x) - seaSurfaceHeight()) < 1e-8);
        assert.ok(Math.abs(waterSurfaceAt(x, riverZ(x), floor) - seaSurfaceHeight()) < 1e-8);
      }
    }
  }
  assert.deepEqual([48, 55, 60, 69, 80].map((x) => groundSurfaceHeight(x, riverZ(x))), floors);
});

test('flood tide pushes an idle swimmer inland, ebb carries them seaward, and buoyancy follows tide height', () => {
  const positions = [];
  for (const phase of [0, Math.PI]) {
    const tide = createWorldTide({ phase });
    const walker = walkerAt(60, riverZ(60));
    const start = walker.position.x;
    for (let i = 0; i < 60; i++) { tide.update(1 / 30); walker.update(1 / 30); }
    positions.push(walker.position.x - start);
    assert.ok(Math.abs(walker.position.y - seaSurfaceHeight() - .26) < .005);
    assert.equal(walker.medium, 'swim');
  }
  assert.ok(positions[0] < -.7 && positions[1] > 2);
  const current = new Vector3();
  createWorldTide({ phase: 0 });
  riverCurrentAt(0, riverZ(0), groundSurfaceHeight(0, riverZ(0)), 0, current);
  assert.ok(current.x > 0, 'the tidal reversal cannot travel to the mountain river');
  console.log({ swimmerFloodDrift: positions[0], swimmerEbbDrift: positions[1] });
});

test('fish, floating leaves and the visible current share the tidal direction and stay underwater', () => {
  const means = [], travel = [];
  for (const phase of [0, Math.PI]) {
    createWorldTide({ phase });
    const scene = new Scene(); createTerrain(scene);
    const water = createWater(scene), camera = new PerspectiveCamera();
    water.update(0, 0, 0, camera);
    const school = water.fish.filter((fish) => fish.habitat === 'river' && fish.school === 6);
    const start = school.reduce((sum, fish) => sum + fish.position.x, 0) / school.length;
    const leaves = scene.children.find((mesh) => mesh.name === '顺流漂浮的落叶');
    for (let i = 0; i < 90; i++) water.update(1 / 30, i / 30, 0, camera, null, null, { runoff: 0 });
    means.push(school.reduce((sum, fish) => sum + fish.position.x, 0) / school.length - start);
    for (const fish of school) {
      const floor = groundSurfaceHeight(fish.position.x, fish.position.z);
      assert.ok(fish.position.y > floor && fish.position.y < seaSurfaceHeight());
      assert.ok((phase === 0 ? -1 : 1) * fish.current.x > 0);
    }
    const material = scene.children.find((mesh) => mesh.name === 'Continuous river surface').material;
    travel.push(material.uniforms.uEstuaryTravel.value);
    assert.equal(material.uniforms.uSeaLevel.value, seaSurfaceHeight());
    assert.ok(leaves.instanceMatrix.array.every(Number.isFinite));
  }
  assert.ok(means[1] > means[0] + 1.5);
  assert.ok(means[0] < -.1 && means[1] > 2, 'the river-mouth school changes its net drift, while continuing to swim');
  assert.ok(travel[0] < 0 && travel[1] > 0);
  console.log({ fishFloodDrift: means[0], fishEbbDrift: means[1], visibleFlowTravel: travel });
});

test('an idle person in a tide-filled shallows changes between wading and swimming as the tide falls and rises', () => {
  const tide = createWorldTide({ phase: Math.PI / 2 });
  const x = 60;
  let z = null;
  for (let cross = -5; cross < 5; cross += .05) {
    const candidate = riverZ(x) + cross;
    const floor = groundSurfaceHeight(x, candidate);
    if (floor > -1.0 && floor < -.8) { z = candidate; break; }
  }
  assert.notEqual(z, null);
  const walker = walkerAt(x, z, true);
  assert.equal(walker.medium, 'swim');
  for (let i = 0; i < 120 * 30; i++) { tide.update(1 / 30); walker.update(1 / 30); }
  assert.equal(walker.medium, 'wade');
  assert.ok(Math.abs(walker.feet - groundSurfaceHeight(x, z)) < .001);
  for (let i = 0; i < 120 * 30; i++) { tide.update(1 / 30); walker.update(1 / 30); }
  assert.equal(walker.medium, 'swim');
  assert.ok(Math.abs(walker.position.y - seaSurfaceHeight() - .26) < .005);
});

test('a tide-washed shoreline stays wet after ebb without wetting higher sand', () => {
  createWorldTide({ phase: Math.PI / 2 });
  const scene = new Scene(); createTerrain(scene);
  const memory = createGroundMemory(scene, { wetness: 0 });
  const z = 20, x = coastlineX(z) - .3;
  assert.ok(waterSurfaceAt(x, z, groundSurfaceHeight(x, z)) !== null);
  for (let i = 0; i < 100; i++) memory.update(.1, i * .1);
  createWorldTide({ phase: Math.PI * 1.5 });
  memory.update(.1, 10);
  const exposed = memory.sampleAt(x, z);
  assert.equal(exposed.waterDepth, 0);
  assert.ok(exposed.localWetness > .95);
  assert.ok(memory.sampleAt(x - 4, z).localWetness < .01);
});

test('calm and smooth tidal reaches sound substantially quieter than turbulent rapids, with distance and depth attenuation', () => {
  const calm = riverSoundProfile({ flowSpeed: .9, grade: .008, distance: 3 });
  const tidal = riverSoundProfile({ flowSpeed: 1.8, grade: 0, distance: 3 });
  const rapid = riverSoundProfile({ flowSpeed: 1.8, grade: .35, distance: 3 });
  assert.ok(calm.ripple + calm.low < (rapid.ripple + rapid.low) * .15);
  assert.ok(tidal.ripple + tidal.low < (rapid.ripple + rapid.low) * .15);
  assert.ok(riverSoundProfile({ flowSpeed: 1.8, grade: .35, distance: 40 }).ripple === 0);
  assert.ok(riverSoundProfile({ flowSpeed: 1.8, grade: .35, submerged: 1 }).low < rapid.low * .2);
});
