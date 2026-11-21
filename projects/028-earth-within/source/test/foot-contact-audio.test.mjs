import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3, Scene, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { createWorldAudio } from '../src/world-audio.js';
import { createWorldCollision } from '../src/world-collision.js';
import { groundSurfaceHeight } from '../src/world-terrain.js';

test('boot support distinguishes a raised platform from the soil below it', () => {
  const scene = new Scene();
  const floor = groundSurfaceHeight(0, 20);
  const platform = new Mesh(new BoxGeometry(.8, .12, 1), new MeshStandardMaterial());
  platform.position.set(0, floor + .15, 20);
  platform.userData.collidable = true;
  platform.userData.rainWettable = 'wood';
  scene.add(platform);
  const collision = createWorldCollision(scene);
  const support = collision.supportAt(0, floor + .23, 20);
  assert.equal(support.substrate, 'wood');
  assert.ok(Math.abs(support.floor - floor - .21) < .0001);
  assert.equal(collision.supportAt(1, floor + .23, 20), null);
  assert.equal(collision.supportAt(0, floor + 1, 20), null);
});

test('footstep sounds use actual contacts without duplicate distance-based steps', async () => {
  const started = [];
  const positions = [];
  class Parameter {
    value = 0;
    setTargetAtTime(value) { this.value = value; }
    setValueAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
  }
  class AudioNode {
    constructor() {
      for (const key of ['gain', 'frequency', 'Q', 'detune', 'playbackRate', 'positionX', 'positionY', 'positionZ']) this[key] = new Parameter();
      this.loop = false;
    }
    connect() {}
    disconnect() {}
    setPosition(x, y, z) { positions.push({ x, y, z }); }
    start() { if (this.isBuffer && !this.loop) started.push(this); }
    stop() {}
  }
  class Context {
    constructor() {
      this.sampleRate = 2000;
      this.currentTime = 0;
      this.state = 'running';
      this.destination = new AudioNode();
      this.listener = {};
      for (const key of ['positionX', 'positionY', 'positionZ', 'forwardX', 'forwardY', 'forwardZ', 'upX', 'upY', 'upZ']) this.listener[key] = new Parameter();
    }
    createGain() { return new AudioNode(); }
    createBiquadFilter() { return new AudioNode(); }
    createPanner() { return new AudioNode(); }
    createOscillator() { return new AudioNode(); }
    createBufferSource() { const source = new AudioNode(); source.isBuffer = true; return source; }
    createDynamicsCompressor() {
      const node = new AudioNode();
      for (const key of ['threshold', 'knee', 'ratio', 'attack', 'release']) node[key] = new Parameter();
      return node;
    }
    createBuffer(channels, length, rate) { return { duration: length / rate, getChannelData: () => new Float32Array(length) }; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }
  globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { AudioContext: Context };
  const audio = createWorldAudio();
  await audio.unlock();
  const listener = new PerspectiveCamera();
  listener.position.set(0, 5, 20);
  const actor = new Vector3(0, 5, 20);
  const options = { listener, actor, medium: 'walk', speed: 2.75, footContacts: [] };
  for (let i = 0; i < 60; i++) { actor.x += .08; audio.update(1 / 30, options); }
  assert.equal(started.length, 0);
  const contact = { x: 4.7, y: 3.42, z: 20.1, speed: 2.75,
    ground: { mud: .8, localWetness: .9, waterDepth: 0, substrate: 'mud' } };
  audio.update(1 / 30, { ...options, footContacts: [contact] });
  assert.equal(started.length, 2);
  assert.deepEqual(positions.at(-1), { x: contact.x, y: contact.y + .05, z: contact.z });
  audio.update(1 / 30, { ...options, footContacts: [] });
  assert.equal(started.length, 2);
  contact.ground.waterDepth = .08;
  audio.update(1 / 30, { ...options, medium: 'wade', footContacts: [contact] });
  assert.equal(started.length, 4);
  audio.update(1 / 30, { ...options, airborne: true, footContacts: [contact] });
  audio.update(1 / 30, { ...options, medium: 'low', footContacts: [contact] });
  assert.equal(started.length, 4);
  audio.update(1 / 30, { ...options, medium: 'wade', footContacts: [{ ...contact, landing: true, impact: .9 }] });
  assert.equal(started.length, 7, 'a landing adds one impact thud to its two water bursts');
  audio.update(1 / 30, { ...options, footContacts: [] });
  assert.equal(started.length, 7, 'the impact is not repeated while standing');
  audio.setEnabled(false);
  audio.update(1 / 30, { ...options, footContacts: [contact] });
  assert.equal(started.length, 7);
  audio.dispose();
});
