import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import { parseGlb } from '../scripts/verify-warlord.mjs';
import { createWarlordSecondary, footContactWeight, projectOutOfCapsule } from '../src/warlord-secondary.js';

// Reconstruct the shipped rest hierarchy, not a copy of the IK implementation.
// No renderer, image decoding, mesh data or browser state is used by these tests.
const glb = parseGlb(await fs.readFile(new URL('../assets/warlord/warlord.glb', import.meta.url)));
const document = glb.document, skinJoints = new Set(document.skins.flatMap(skin => skin.joints));
const tolerance = 2e-4;
const near = (actual, expected, epsilon = tolerance, label = 'values agree') => assert(Math.abs(actual - expected) <= epsilon, `${label}: actual ${actual}, expected ${expected}`);
const pointNear = (actual, expected, epsilon = tolerance, label = 'world points agree') => assert(actual.distanceTo(expected) <= epsilon, `${label}: separation ${actual.distanceTo(expected)}`);

function restActor() {
  const actor = new THREE.Group(), nodes = document.nodes.map((node, index) => {
    const object = skinJoints.has(index) ? new THREE.Bone() : new THREE.Object3D(); object.name = node.name || `Node${index}`;
    if (node.matrix) new THREE.Matrix4().fromArray(node.matrix).decompose(object.position, object.quaternion, object.scale);
    else {
      if (node.translation) object.position.fromArray(node.translation);
      if (node.rotation) object.quaternion.fromArray(node.rotation);
      if (node.scale) object.scale.fromArray(node.scale);
    }
    return object;
  });
  document.nodes.forEach((node, index) => node.children?.forEach(child => nodes[index].add(nodes[child])));
  for (const index of document.scenes[document.scene || 0].nodes) actor.add(nodes[index]);
  const bones = new Map(nodes.filter(node => node.isBone).map(node => [node.name, node]));
  for (const side of ['l', 'r']) for (const part of ['thigh', 'calf', 'foot']) assert(bones.has(`${part}_${side}`));
  const authored = [...bones.values()].map(bone => ({ bone, position: bone.position.clone(), rotation: bone.quaternion.clone(), scale: bone.scale.clone() }));
  const restoreAuthored = () => { for (const state of authored) { state.bone.position.copy(state.position); state.bone.quaternion.copy(state.rotation); state.bone.scale.copy(state.scale); } actor.updateWorldMatrix(true, true); };
  restoreAuthored();
  const world = name => bones.get(name).getWorldPosition(new THREE.Vector3());
  const lengths = side => [world(`thigh_${side}`).distanceTo(world(`calf_${side}`)), world(`calf_${side}`).distanceTo(world(`foot_${side}`))];
  const secondary = createWarlordSecondary(THREE, actor);
  return { actor, bones, authored, restoreAuthored, world, lengths, secondary };
}
function frame(fixture, state = {}, dt = 1 / 60, restore = true) {
  fixture.secondary.prepare();
  if (restore) fixture.restoreAuthored(); // Represents AnimationMixer writing the authored pose.
  return fixture.secondary.update(dt, { action: 'Idle', actionTime: 0, grounded: true, ...state });
}

test('a real shipped rest rig locks both ankles in world space through actor movement and turning', () => {
  const f = restActor(), originalLengths = { l: f.lengths('l'), r: f.lengths('r') };
  const first = frame(f), anchors = Object.fromEntries(['l', 'r'].map(side => [side, new THREE.Vector3(...first.feet[side].target)]));
  for (let step = 1; step <= 8; step++) {
    f.actor.position.set(.01 * step, 0, -.008 * step); f.actor.rotation.y = .015 * step;
    const result = frame(f);
    for (const side of ['l', 'r']) {
      assert.equal(result.feet[side].weight, 1);
      pointNear(new THREE.Vector3(...result.feet[side].target), anchors[side], tolerance, `${side} target remains planted`);
      pointNear(f.world(`foot_${side}`), anchors[side], .003, `${side} actual ankle follows world lock`);
      f.lengths(side).forEach((length, index) => near(length, originalLengths[side][index], 1e-5, `${side} bone length is preserved`));
    }
  }
  f.secondary.dispose();
});

test('Attack3 42cm advance releases the lead foot then plants it at the advanced location', () => {
  const f = restActor(), first = frame(f), initial = new THREE.Vector3(...first.feet.l.target), legLengths = f.lengths('l');
  f.actor.position.z = -.42;
  const advancing = frame(f, { action: 'Attack3', actionTime: .32 });
  assert.equal(advancing.feet.l.stepping, true); assert.equal(advancing.feet.l.weight, 0);
  assert(advancing.feet.l.lift > .04, 'the lead ankle actually rises during the heavy step');
  assert(f.world('foot_l').y > initial.y + .035, 'the rendered lead foot is lifted, not only its state flag');
  const planted = frame(f, { action: 'Attack3', actionTime: .46 });
  assert.equal(planted.feet.l.weight, 1); assert(!planted.feet.l.stepping);
  const target = new THREE.Vector3(...planted.feet.l.target);
  near(target.z - initial.z, -.42, .005, 'new plant follows the controller advance');
  pointNear(f.world('foot_l'), target, .003, 'actual ankle reaches the new plant');
  f.lengths('l').forEach((length, index) => near(length, legLengths[index], 1e-5, 'IK does not stretch the leg'));
  f.secondary.dispose();
});

test('grounded:false and Airborne release planted feet without changing the authored airborne pose', () => {
  for (const state of [{ action: 'Idle', grounded: false }, { action: 'Airborne', grounded: true }]) {
    const f = restActor(); frame(f); f.actor.position.y = 1.1;
    f.secondary.prepare(); f.restoreAuthored();
    const authoredFeet = { l: f.world('foot_l'), r: f.world('foot_r') };
    const result = f.secondary.update(1 / 60, { actionTime: .2, ...state });
    for (const side of ['l', 'r']) { assert.equal(result.feet[side], null); pointNear(f.world(`foot_${side}`), authoredFeet[side], 1e-5, 'airborne ankle is not pulled to ground'); }
    f.secondary.dispose();
  }
});

test('Leap and LeapSlam never pin the feet during the .18–.92 second flight window', () => {
  for (const action of ['Leap', 'LeapSlam']) {
    const f = restActor(); frame(f);
    near(footContactWeight(action, .179), 1);
    for (const actionTime of [.18, .30, .55, .76, .84, .919, .92]) {
      near(footContactWeight(action, actionTime, 'l'), 0); near(footContactWeight(action, actionTime, 'r'), 0);
      f.actor.position.y = 1.7;
      const result = frame(f, { action, actionTime, grounded: true });
      assert.equal(result.feet.l, null); assert.equal(result.feet.r, null);
      assert(f.world('foot_l').y > 1.7, 'the ankle stays with the airborne actor');
    }
    assert(footContactWeight(action, .96) > 0 && footContactWeight(action, .96) < 1);
    near(footContactWeight(action, 1), 1);
    f.secondary.dispose();
  }
});

test('walking and running alternate real left/right stance and release periods', () => {
  for (const [action, seconds] of [['Walk', 1.1], ['Run', .8]]) {
    near(footContactWeight(action, seconds * .2, 'l'), 1);
    near(footContactWeight(action, seconds * .2, 'r'), 0);
    near(footContactWeight(action, seconds * .7, 'l'), 0);
    near(footContactWeight(action, seconds * .7, 'r'), 1);
    near(footContactWeight(action, seconds * 1.2, 'l'), 1);
  }
});

test('capsule projection preserves outside/surface points and moves interior points to the closest radial boundary', () => {
  const a = { x: 0, y: 0, z: 0 }, b = { x: 0, y: 2, z: 0 };
  const inside = projectOutOfCapsule({ x: .05, y: 1, z: 0 }, a, b, .25);
  assert.equal(inside.corrected, true); near(inside.x, .25); near(inside.y, 1); near(inside.z, 0); near(inside.distance, -.20);
  const surface = projectOutOfCapsule({ x: .25, y: 1, z: 0 }, a, b, .25);
  assert.equal(surface.corrected, false); near(surface.distance, 0); near(surface.x, .25);
  const outside = projectOutOfCapsule({ x: .40, y: 1, z: 0 }, a, b, .25);
  assert.equal(outside.corrected, false); near(outside.distance, .15); near(outside.x, .40);
  const endCap = projectOutOfCapsule({ x: 0, y: 2.1, z: 0 }, a, b, .25);
  near(endCap.y, 2.25); near(endCap.x, 0); near(endCap.z, 0);
});

test('a zero-length capsule axis remains a finite sphere projection, including a zero fallback vector', () => {
  const center = { x: 1, y: 2, z: 3 };
  for (const fallback of [undefined, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }]) {
    const projected = projectOutOfCapsule(center, center, center, .3, fallback);
    assert.equal(projected.corrected, true);
    assert([projected.x, projected.y, projected.z].every(Number.isFinite));
    near(Math.hypot(projected.x - center.x, projected.y - center.y, projected.z - center.z), .3, 1e-6, 'sphere boundary is reached');
  }
});

test('prepare removes the previous procedural pose before the mixer and prevents cumulative foot/cloth drift', () => {
  const f = restActor(); assert.equal(typeof f.secondary.prepare, 'function');
  const initialBoneCount = f.secondary.boneCount, initialChildren = f.actor.children.length;
  frame(f);
  for (let index = 0; index < 100; index++) {
    f.secondary.prepare();
    for (const original of f.authored) {
      pointNear(original.bone.position, original.position, 1e-6, `${original.bone.name} local position is restored`);
      assert(original.bone.quaternion.clone().normalize().angleTo(original.rotation.clone().normalize()) < 1e-5, `${original.bone.name} local rotation is restored`);
      pointNear(original.bone.scale, original.scale, 1e-6, `${original.bone.name} local scale is restored`);
    }
    f.secondary.update(1 / 60, { action: 'Idle', actionTime: 0, grounded: true });
    for (const side of ['l', 'r']) assert(f.secondary.stats.feet[side].error < .003);
  }
  assert.equal(f.secondary.boneCount, initialBoneCount); assert.equal(f.actor.children.length, initialChildren);
  f.secondary.dispose();
});

test('repeated reset/prepare leaves the same authored rig and a teleport establishes new world anchors', () => {
  const f = restActor(), initial = frame(f), initialLeft = new THREE.Vector3(...initial.feet.l.target);
  for (let count = 0; count < 50; count++) {
    f.secondary.prepare(); f.secondary.reset(); f.restoreAuthored();
    const result = f.secondary.update(1 / 60, { action: 'Idle', actionTime: 0, grounded: true });
    pointNear(new THREE.Vector3(...result.feet.l.target), initialLeft, tolerance, 'reset returns to the same plant');
  }
  f.actor.position.x = 4;
  const result = frame(f);
  const target = new THREE.Vector3(...result.feet.l.target);
  near(target.x - initialLeft.x, 4, tolerance, 'teleport does not drag the old anchor');
  pointNear(f.world('foot_l'), target, .003);
  f.secondary.dispose();
});

test('a forward raised foot replants only inside anatomical reach, and genuine swing/unreachable ground releases it', () => {
  function fixture() {
    const actor = new THREE.Group(), bones = {};
    for (const side of ['l', 'r']) {
      const upper = new THREE.Bone(), lower = new THREE.Bone(), foot = new THREE.Bone();
      upper.name = `thigh_${side}`; lower.name = `calf_${side}`; foot.name = `foot_${side}`;
      upper.position.set(side === 'l' ? -.16 : .16, 1.1, 0); lower.position.set(0, -.43, .25); foot.position.set(0, -.55, -.25);
      actor.add(upper); upper.add(lower); lower.add(foot); bones[side] = { upper, lower, foot };
    }
    actor.updateWorldMatrix(true, true);
    const secondary = createWarlordSecondary(THREE, actor), position = bone => bone.getWorldPosition(new THREE.Vector3());
    secondary.update(1 / 60, { action: 'Idle', actionTime: 0, grounded: true });
    secondary.prepare();
    return { actor, bones, secondary, position };
  }
  const f = fixture();
  const leg = f.bones.l, originalLength = f.position(leg.upper).distanceTo(f.position(leg.lower)) + f.position(leg.lower).distanceTo(f.position(leg.foot));
  leg.upper.rotation.x = -.7; f.actor.updateWorldMatrix(true, true);
  const authored = f.position(leg.foot), hip = f.position(leg.upper), sameXZGround = authored.clone().setY(.12);
  assert(hip.distanceTo(sameXZGround) > originalLength, 'this actual bone pose cannot reach the floor at the authored X/Z');
  const result = f.secondary.update(1 / 60, { action: 'Idle', actionTime: 0, grounded: true });
  const target = new THREE.Vector3(...result.feet.l.target);
  assert(hip.distanceTo(target) <= originalLength, 'replant projects into the real leg reach envelope');
  assert(target.z < authored.z - .05, 'the ground anchor moves inward instead of stretching the bone chain');
  near(f.position(leg.foot).y, .12, .003, 'actual ankle reaches ground');
  assert(result.feet.l.error < .003);
  near(f.position(leg.upper).distanceTo(f.position(leg.lower)) + f.position(leg.lower).distanceTo(f.position(leg.foot)), originalLength, 1e-5);
  f.secondary.dispose();

  const swing = fixture(); swing.bones.l.upper.rotation.x = -.7; swing.actor.updateWorldMatrix(true, true);
  const raised = swing.position(swing.bones.l.foot);
  const released = swing.secondary.update(1 / 60, { action: 'Run', actionTime: .16, grounded: true });
  assert(released.feet.l === null || released.feet.l.weight === 0, 'a physically raised swing foot overrides a nominal contact phase');
  pointNear(swing.position(swing.bones.l.foot), raised, 1e-5, 'swing pose is not forced onto the floor');
  swing.secondary.dispose();

  const high = fixture(); high.actor.position.y = .7; high.actor.updateWorldMatrix(true, true);
  const before = high.position(high.bones.l.foot);
  const beyondReach = high.secondary.update(1 / 60, { action: 'Idle', actionTime: 0, grounded: true });
  assert.equal(beyondReach.feet.l.weight, 0);
  assert.equal(beyondReach.feet.l.releasedReason, 'ground-out-of-anatomical-reach');
  pointNear(high.position(high.bones.l.foot), before, 1e-5, 'unreachable ground does not stretch or falsely lock a leg');
  high.secondary.dispose();
});
