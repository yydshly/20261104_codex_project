import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHero } from '../src/world-hero.js';
import { createCharacterView } from '../src/world-character.js';
import { groundSurfaceHeight } from '../src/world-terrain.js';

const dt = 1 / 60;
const positionAt = (x, z, lift = .025) => new THREE.Vector3(x, groundSurfaceHeight(x, z) + lift, z);

test('hidden and visible characters use identical actual boot contacts', () => {
  const scene = new THREE.Scene();
  const visible = createHero(scene);
  const hidden = createHero(scene);
  const contacts = [];
  const left = [], right = [];
  for (let i = 0; i < 480; i++) {
    const position = positionAt(2, 37 + i * dt * 2.3);
    const pose = { position, yaw: 0, speed: 2.3, contactsEnabled: true };
    visible.update(dt, i * dt, pose);
    hidden.update(dt, i * dt, { ...pose, visible: false });
    const a = visible.drainFootContacts();
    const b = hidden.drainFootContacts();
    assert.deepEqual(a, b);
    assert.ok(a.length <= 2);
    for (const event of a) {
      assert.ok(Math.abs(event.y - groundSurfaceHeight(event.x, event.z)) < .15);
      assert.ok(Math.abs(event.yaw) < .001);
      (event.side < 0 ? left : right).push(event.x - position.x);
      contacts.push(event);
    }
  }
  assert.ok(contacts.length > 20);
  assert.ok(left.every((x) => x < -.075) && right.every((x) => x > .075));
  assert.ok(contacts.every((event, index) => index === 0 || event.side !== contacts[index - 1].side));
  console.log({ walkingContacts: contacts.length, maximumGroundGap: Math.max(...contacts.map((event) => Math.abs(event.y - groundSurfaceHeight(event.x, event.z)))) });
});

test('standing, blocked movement, swimming, pauses and teleports do not generate steps', () => {
  const hero = createHero(new THREE.Scene());
  let position = positionAt(2, 40);
  function advance(frames, changes = {}) {
    for (let i = 0; i < frames; i++) {
      hero.update(dt, i * dt, { position, yaw: i * .02, speed: 5.8, contactsEnabled: true, ...changes });
      assert.equal(hero.drainFootContacts().length, 0);
    }
  }
  advance(180);
  for (let i = 0; i < 30; i++) {
    position = positionAt(position.x + 2, position.z);
    advance(1);
  }
  advance(60, { airborne: true });
  advance(60, { swimming: true });
  advance(60, { underwater: true, swimming: true });
  advance(60, { contactsEnabled: false });
  position = positionAt(22, 46);
  advance(1);
  advance(120);
  hero.resetPose();
  advance(1);
});

test('a turning walker leaves the toe direction and left-right offset of the actual boots', () => {
  const hero = createHero(new THREE.Scene());
  let x = 2, z = 40;
  let count = 0;
  for (let i = 0; i < 360; i++) {
    const yaw = i * .012;
    x += Math.sin(yaw) * 2.1 * dt;
    z += Math.cos(yaw) * 2.1 * dt;
    hero.update(dt, i * dt, { position: positionAt(x, z), yaw, speed: 2.1, contactsEnabled: true });
    for (const event of hero.drainFootContacts()) {
      const angle = Math.atan2(Math.sin(event.yaw - yaw), Math.cos(event.yaw - yaw));
      const across = (event.x - x) * Math.cos(yaw) - (event.z - z) * Math.sin(yaw);
      assert.ok(Math.abs(angle) < .001);
      assert.ok(across * event.side > .075 && across * event.side < .16);
      count++;
    }
  }
  assert.ok(count > 10);
});

test('a jump produces two grounded landing contacts, with none during the jump', () => {
  const hero = createHero(new THREE.Scene());
  const x = 2, z = 40;
  hero.update(dt, 0, { position: positionAt(x, z), yaw: Math.PI / 2, contactsEnabled: true });
  for (let i = 0; i < 60; i++) {
    const height = .025 + Math.sin(Math.PI * i / 60) * .7;
    hero.update(dt, i * dt, { position: positionAt(x, z, height), yaw: Math.PI / 2, airborne: true, contactsEnabled: true });
    assert.equal(hero.drainFootContacts().length, 0);
  }
  const contacts = [];
  let compression = 0;
  for (let i = 0; i < 60; i++) {
    hero.update(dt, 1 + i * dt, { position: positionAt(x, z), yaw: Math.PI / 2, contactsEnabled: true });
    contacts.push(...hero.drainFootContacts());
    compression = Math.max(compression, hero.motion.landingCompression);
  }
  assert.equal(contacts.length, 2);
  assert.ok(contacts.every((event) => event.landing && Math.abs(event.yaw - Math.PI / 2) < .001));
  assert.deepEqual(contacts.map((event) => event.side).sort(), [-1, 1]);
  assert.ok(contacts.every((event) => event.y - groundSurfaceHeight(event.x, event.z) < .17));
  assert.ok(contacts.every((event) => event.impact > .3 && event.impact <= 1));
  assert.ok(compression > .3 && hero.motion.landingCompression < .001);
  assert.ok(hero.motion.hipHeight > .90, 'landing compression recovers to a standing pose');
});

test('wading raises the feet and mud prolongs stance without a permanent crouch or floating contacts', () => {
  const heroes = [createHero(new THREE.Scene()), createHero(new THREE.Scene()), createHero(new THREE.Scene())];
  const events = heroes.map(() => []);
  for (let i = 0; i < 240; i++) {
    heroes.forEach((hero, index) => {
      const position = positionAt(2, 40 + i * dt * 1.8);
      hero.update(dt, i * dt, { position, yaw: 0, speed: 1.8, contactsEnabled: true,
        waterDepth: index === 1 ? .65 : 0, mud: index === 2 ? .9 : 0 });
      events[index].push(...hero.drainFootContacts());
    });
  }
  const [dry, wade, mud] = heroes.map((hero) => hero.motion);
  assert.ok(wade.lift > dry.lift + .09 && mud.lift > dry.lift + .05);
  assert.ok(wade.cadence < dry.cadence && mud.stance > dry.stance + .06);
  for (let i = 0; i < heroes.length; i++) {
    assert.ok(heroes[i].motion.hipHeight > .85);
    assert.ok(events[i].length > 5);
    assert.ok(events[i].every((event) => Math.abs(event.y - groundSurfaceHeight(event.x, event.z)) < .15));
  }
});

test('first and follow cameras preserve the same gait when switching viewpoints', () => {
  const setups = [false, true].map((following) => {
    const scene = new THREE.Scene();
    const hero = createHero(scene);
    const eye = new THREE.PerspectiveCamera();
    const camera = new THREE.PerspectiveCamera();
    const walker = { medium: 'walk', feet: 0, crouch: 0, airborne: false, lowClearance: false,
      swimMotion: new THREE.Vector3(), surface: null };
    const collision = { constrainCamera(anchor, desired, target) { return target.copy(desired); } };
    const character = createCharacterView(camera, eye, walker, hero, collision);
    character.setFollowing(following);
    return { hero, character, walker, eye };
  });
  for (let i = 0; i < 360; i++) {
    for (let j = 0; j < setups.length; j++) {
      const { eye, walker, character } = setups[j];
      eye.position.copy(positionAt(2 + i * dt * 2.1, 40, 1.64));
      walker.feet = groundSurfaceHeight(eye.position.x, eye.position.z);
      if (i === 180) character.setFollowing(j === 0);
      character.frameWalk(dt, i * dt);
    }
    assert.deepEqual(setups[0].hero.drainFootContacts(), setups[1].hero.drainFootContacts());
  }
  const { hero, character, walker, eye } = setups[0];
  for (let i = 0; i < 120; i++) {
    eye.position.x += .02;
    walker.feet = groundSurfaceHeight(eye.position.x, eye.position.z);
    character.framePaused(dt, 6 + i * dt);
    assert.equal(hero.drainFootContacts().length, 0);
  }
  character.stageAt({ position: [2, 0, 40], target: [2, 2, 42] });
  character.frameStage(dt, 9);
  assert.equal(hero.drainFootContacts().length, 0);
});
