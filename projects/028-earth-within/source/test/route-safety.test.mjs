import test from 'node:test';
import assert from 'node:assert/strict';
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from 'three';
import { buildWorldScene } from '../test-support/world-scene.mjs';
import { createWorldCollision, cameraClearance } from '../src/world-collision.js';
import { groundSurfaceHeight, setRiverFloodStage, waterSurfaceAt, riverSpan } from '../src/world-terrain.js';
import { createWalker } from '../src/world-walk.js';
import { createWorldTide, resetTide } from '../src/world-tides.js';

test('the entire fifteen-stop route remains passable in rain floods, high tide and low tide, with clear camera booms', () => {
  const { itinerary, collision } = buildWorldScene();
  assert.equal(itinerary.size, 15);
  let bodies = 0, booms = 0;
  const camera = new PerspectiveCamera(45, 21 / 9, .14, 1200);
  const radius = cameraClearance(camera);
  const soundZ = riverSpan(4, 0, 0)[1] + .7;
  const soundFloor = groundSurfaceHeight(4, soundZ);
  assert.equal(collision.blocks(4, soundFloor + 1.64, soundZ, soundFloor, false), false, 'field-recording preview starts on an open riverbank');
  try {
    for (const phase of [null, Math.PI / 2, Math.PI * 1.5]) {
      if (phase === null) resetTide();
      else createWorldTide({ phase });
      for (const stage of [0, 1]) {
        setRiverFloodStage(stage);
        for (const [name, chapter] of itinerary) {
          for (let i = 0; i < chapter.points.length; i++) {
          const point = chapter.points[i];
          const anchor = point.position.clone();
          const floor = groundSurfaceHeight(anchor.x, anchor.z);
          const surface = waterSurfaceAt(anchor.x, anchor.z, floor);
          const swimming = surface !== null && surface - floor > 1.19;
          anchor.y = swimming ? Math.max(floor + .44, point.medium === 'dive' ? Math.min(anchor.y, surface - .12) : surface + .26) : floor + 1.64;
          assert.equal(collision.blocks(anchor.x, anchor.y, anchor.z, floor, swimming, floor), false, `${name} point ${i}, flood ${stage}, tide ${phase}`);
          bodies++;
          if (i % 3) continue;
          for (const yaw of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
            const desired = anchor.clone().add(new Vector3(Math.sin(yaw) * 5.2, swimming ? .4 : 1.12, Math.cos(yaw) * 5.2));
            const result = collision.constrainCamera(anchor, desired, new Vector3(), radius);
            assert.equal(collision.cameraBlocked(result, radius), false, `${name} camera ${i}, yaw ${yaw}, flood ${stage}`);
            assert.ok(result.distanceTo(anchor) < desired.distanceTo(anchor) + .65);
            booms++;
          }
          }
        }
      }
    }
    console.log({ routeBodySamples: bodies, cameraSweeps: booms, radius });
  } finally { setRiverFloodStage(0); resetTide(); }
});

test('orbit targets inside buildings and heads near walls retain a clear camera including wide near planes', () => {
  const scene = new Scene();
  const floor = groundSurfaceHeight(0, 20);
  const building = new Mesh(new BoxGeometry(2, 4, 2), new MeshBasicMaterial());
  building.position.set(0, floor + 2, 20);
  building.userData.collidable = true;
  scene.add(building);
  const collision = createWorldCollision(scene);
  const lens = new PerspectiveCamera(45, 3, .14, 100);
  const radius = cameraClearance(lens);
  assert.ok(radius > .24);
  const centre = new Vector3(0, floor + 2, 20);
  for (const desired of [new Vector3(.1, floor + 2, 20), new Vector3(0, floor + 2, 25)]) {
    const safe = collision.constrainCamera(centre, desired, new Vector3(), radius, true);
    assert.equal(collision.cameraBlocked(safe, radius), false);
  }
  const head = new Vector3(1.26, floor + 2, 20);
  const safe = collision.constrainCamera(head, new Vector3(-3, floor + 3, 20), new Vector3(), radius);
  assert.equal(collision.cameraBlocked(safe, radius), false);
  assert.ok(safe.x > 1, 'a camera cannot escape through the opposite side of the wall');
});

test('a walker steps onto a low wooden deck, stands on its top, and remains blocked by a higher obstacle', () => {
  const page = new EventTarget();
  page.body = {}; page.hidden = false;
  globalThis.document = page; globalThis.window = new EventTarget();
  const canvas = new EventTarget();
  canvas.focus = () => { page.activeElement = canvas; };
  canvas.hasPointerCapture = () => false;
  const scene = new Scene();
  const floor = groundSurfaceHeight(0, 20);
  const deck = new Mesh(new BoxGeometry(2, .12, 2), new MeshBasicMaterial());
  deck.position.set(0, floor + .14, 20); deck.userData.collidable = true; deck.userData.rainWettable = 'wood';
  const wall = new Mesh(new BoxGeometry(.4, 2, 2), new MeshBasicMaterial());
  wall.position.set(1.6, floor + 1, 20); wall.userData.collidable = true;
  scene.add(deck, wall);
  const collision = createWorldCollision(scene);
  const walker = createWalker(new PerspectiveCamera(), canvas, collision);
  walker.enter({ position: [-1.6, 0, 20], target: [3, floor + 1.64, 20] });
  walker.setTouch(0, 1);
  for (let i = 0; i < 22; i++) walker.update(1 / 30);
  assert.ok(walker.position.x > -.5 && walker.position.x < .5);
  assert.ok(Math.abs(walker.feet - (floor + .20)) < .001);
  walker.setTouch(0, 0);
  for (let i = 0; i < 30; i++) walker.update(1 / 30);
  assert.ok(Math.abs(walker.feet - (floor + .20)) < .001, 'resting feet do not sink into the planks');
  walker.setTouch(0, 1);
  for (let i = 0; i < 90; i++) walker.update(1 / 30);
  assert.ok(walker.position.x < 1.2, 'a low step cannot promote the walker onto a wall');
});
