import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { createObservation } from '../src/world-observe.js';

test('a moving close-up follows its subject, preserves a user-adjusted orbit, and restores the exploration view', () => {
  class Element extends EventTarget {
    children = [];
    classList = { add() {}, remove() {} };
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute() {}
    focus() { document.activeElement = this; }
  }
  globalThis.document = { createElement: () => new Element(), body: new Element() };
  globalThis.window = new EventTarget();
  const world = new Element(), canvas = new Element();
  const camera = new PerspectiveCamera(45, 2, .14, 1200);
  camera.position.set(4, 5, 6);
  const start = camera.position.clone();
  const subject = new Vector3(2, 1, 3);
  const controls = { target: new Vector3(), minDistance: 1, maxDistance: 20, minPolarAngle: .1,
    maxPolarAngle: 3, enabled: false, enablePan: true, enableDamping: true,
    update() {}, stopListenToKeyEvents() {} };
  let entered = 0, exited = 0, swept = 0;
  const observation = createObservation({ world, camera, controls, canvas,
    sites: [{ id: 'crab', title: 'crab', position: [2, 1, 3], radius: 5, views: [{
      label: 'crab', title: 'crab', description: 'crab', target: [2, 1, 3], position: [2, 3, 5], anchor: [2, 2, 3],
      follow: () => subject.toArray(),
    }] }], collision: { constrainCamera(anchor, desired, target, radius) {
      assert.ok(anchor.distanceTo(subject) < 1e-6);
      assert.ok(radius >= .1); swept++;
      return target.copy(desired);
    } }, onEnter() { entered++; }, onExit() { exited++; },
  });
  observation.updateCandidate(subject, 'crab', true);
  world.children[0].dispatchEvent(new Event('click'));
  assert.equal(observation.active, true);
  camera.position.add(new Vector3(1, .4, -.2));
  const userOrbit = camera.position.clone().sub(controls.target);
  for (let i = 0; i < 60; i++) {
    subject.x += .02; subject.z -= .01;
    observation.update();
    assert.ok(controls.target.distanceTo(subject) < 1e-6);
    assert.ok(camera.position.clone().sub(subject).distanceTo(userOrbit) < 1e-6);
  }
  observation.close();
  assert.equal(observation.active, false);
  assert.equal(entered, 1); assert.equal(exited, 1); assert.equal(swept, 61);
  assert.ok(camera.position.distanceTo(start) < 1e-6);
  assert.equal(camera.near, .14);
  assert.equal(controls.enablePan, true);
});
