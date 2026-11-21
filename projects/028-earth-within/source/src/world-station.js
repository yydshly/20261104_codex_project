import * as THREE from 'three';
import { groundHeight, groundSurfaceHeight, riverZ, riverWidth } from './world-terrain.js';
import { createBirdAgent, wildlifeBlocks } from './world-wildlife.js';

const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: .92 });

function box(parent, surface, size, position, rotation = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), surface);
  mesh.position.set(...position);
  mesh.rotation.z = rotation;
  mesh.userData.rainWettable = surface.userData.rainKind === false ? null : surface.userData.rainKind ?? 'wood';
  parent.add(mesh);
  return mesh;
}

function addFoundation(station, surface, x, z, base) {
  const geometry = new THREE.BoxGeometry(8.8, .6, 5.6, 18, 1, 12);
  const vertices = geometry.getAttribute('position');
  for (let i = 0; i < vertices.count; i++) {
    if (vertices.getY(i) > 0) {
      vertices.setY(i, .34);
    } else {
      const floor = groundSurfaceHeight(x + vertices.getX(i), z + vertices.getZ(i)) - base;
      vertices.setY(i, Math.min(.24, floor - .14));
    }
  }
  geometry.computeVertexNormals();
  const plinth = new THREE.Mesh(geometry, surface);
  plinth.name = '贴合河岸的石基';
  plinth.userData.collidable = true;
  plinth.userData.rainWettable = 'stone';
  station.add(plinth);
}

export function createStation(scene) {
  const x = -30;
  const z = riverZ(x) + riverWidth(x) + 6;
  const base = groundHeight(x, z) + .18;
  const station = new THREE.Group();
  station.position.set(x, base, z);
  scene.add(station);
  const larch = material(0xa88056);
  const beams = material(0x634f3e);
  const dark = material(0x293a36);
  const slate = material(0x526363);
  const slateLight = material(0x6b7770);
  const glass = material(0x9caa88);
  const stone = material(0x788475);
  const mud = material(0x8f664b);
  const swallow = material(0x293c51);
  const underside = material(0xcebe9b);
  for (const surface of [stone, slate, slateLight]) surface.userData.rainKind = 'stone';
  glass.userData.rainKind = false;

  addFoundation(station, stone, x, z, base);
  box(station, larch, [8.2, 3.1, 5.1], [0, 1.85, 0]).userData.collidable = true;
  box(station, beams, [8.45, .26, 5.25], [0, .43, 0]).userData.collidable = true;
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      box(station, beams, [.26, 3.2, .27], [side * 4.02, 1.95, end * 2.51]).userData.collidable = true;
    }
    box(station, beams, [8.5, .28, .27], [0, 3.39, side * 2.51]);
    for (let i = 0; i < 7; i++) box(station, beams, [7.98, .045, .035], [0, .73 + i * .38, side * 2.56]);
    box(station, slate, [4.95, .19, 6.26], [side * 2.18, 4.13, 0], -.34 * side).userData.collidable = true;
    for (let i = 0; i < 9; i++) {
      box(station, i % 3 ? slate : slateLight, [4.95, .065, .085], [side * 2.17, 4.24, -3.03 + i * .76], -.34 * side);
    }
  }
  const gable = new THREE.Shape();
  gable.moveTo(-4.1, 3.39);
  gable.lineTo(0, 4.9);
  gable.lineTo(4.1, 3.39);
  gable.closePath();
  const gableGeometry = new THREE.ShapeGeometry(gable);
  const front = new THREE.Mesh(gableGeometry, larch);
  front.userData.collidable = true;
  front.position.z = 2.56;
  const back = front.clone();
  back.position.z = -2.56;
  back.rotation.y = Math.PI;
  station.add(front, back);

  box(station, beams, [1.44, 2.35, .18], [1.88, 1.52, 2.65]);
  box(station, dark, [1.22, 2.2, .06], [1.88, 1.47, 2.76]);
  for (const wx of [-2.37, -.47]) {
    box(station, beams, [1.3, 1.15, .17], [wx, 2, 2.66]);
    box(station, glass, [1.02, .89, .05], [wx, 2, 2.76]);
    box(station, beams, [.06, .91, .025], [wx, 2, 2.8]);
    box(station, beams, [1.04, .06, .025], [wx, 2, 2.8]);
  }
  box(station, stone, [1.52, .27, .85], [1.88, .2, 3.03]);
  box(station, stone, [.59, 1.55, .63], [-2.25, 4.67, -.77]).userData.collidable = true;
  box(station, slate, [.76, .11, .76], [-2.25, 5.47, -.77]).userData.collidable = true;

  for (let i = 0; i < 9; i++) {
    const pz = -2.75 - .52 * i;
    box(station, larch, [2.9, .12, .48], [-1.9, -.09, pz]).userData.collidable = true;
    if (i % 3 === 0) {
      for (const px of [-3.05, -.75]) {
        const foot = groundSurfaceHeight(x + px, z + pz) - base - .08;
        const height = Math.max(.18, -.1 - foot);
        box(station, beams, [.16, height, .18], [px, -.1 - height / 2, pz]).userData.collidable = true;
      }
    }
  }

  const nestShape = new THREE.SphereGeometry(.36, 10, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  for (const px of [-1.65, -.84]) {
    const nest = new THREE.Mesh(nestShape, mud);
    nest.position.set(px, 3.54, 2.76);
    nest.scale.set(1.15, .73, .9);
    station.add(nest);
  }
  const birdShape = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([
    -.8, 0, .05, 0, -.1, .15, -.23, 0, -.31,
    .8, 0, .05, .23, 0, -.31, 0, -.1, .15,
  ], 3));
  birdShape.computeVertexNormals();
  const wingsMaterial = swallow.clone();
  wingsMaterial.side = THREE.DoubleSide;
  const bird = new THREE.Group();
  const wings = new THREE.Mesh(birdShape, wingsMaterial);
  const body = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), underside);
  body.scale.set(.61, .6, 2.3);
  bird.add(wings, body);
  station.add(bird);
  const flight = createBirdAgent(bird, { home: [x + 5.6, base + 6.4, z + 4.3], airborne: true });
  const flightGoal = new THREE.Vector3();

  const roofLines = new Float32Array(16 * 6);
  const roofGeometry = new THREE.BufferGeometry();
  const eaves = Array.from({ length: 16 }, (_, i) => {
    const xOffset = (i < 8 ? -1 : 1) * 4.56;
    const zOffset = -2.89 + i % 8 * .81;
    return [xOffset, zOffset, groundSurfaceHeight(x + xOffset, z + zOffset) - base];
  });
  roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofLines, 3).setUsage(THREE.DynamicDrawUsage));
  const runoff = new THREE.LineSegments(roofGeometry, new THREE.LineBasicMaterial({ color: 0xb8e3ea, transparent: true, opacity: 0, depthWrite: false }));
  runoff.frustumCulled = false;
  station.add(runoff);

  return {
    birds: [flight.state],
    blocks(...args) { return wildlifeBlocks([flight.state], ...args); },
    stop: { target: [x - .75, base + 2.05, z + .2], offset: [13.5, 8.5, 15] },
    rainShelters: [{ minX: x - 4.55, maxX: x + 4.55, minZ: z - 3.13, maxZ: z + 3.13,
      height: base + 5.05,
      heightAt: (px) => base + 4.275 - Math.tan(.34) * (Math.abs(px - x) - 2.18) }],
    update(time, rain, dt = 1 / 30, visitor = null, collision = null) {
      const phase = time * .71;
      flightGoal.set(x - 1.6 + Math.cos(phase) * 7.2, base + 6.4 + Math.sin(phase * 2) ** 2 * 1.2, z + 4.3 + Math.sin(phase) * 4.4);
      flight.update(dt, time, visitor, collision, flightGoal);
      wings.rotation.z = Math.sin(time * 16) * .22;
      runoff.visible = rain > .035;
      if (!runoff.visible) return;
      runoff.material.opacity = rain * .72;
      for (let i = 0; i < 16; i++) {
        const [px, pz, floor] = eaves[i];
        const t = (time * (.58 + rain * .64) + i * .379) % 1;
        const y = THREE.MathUtils.lerp(3.42, floor + .03, t * t);
        roofLines.set([px, y, pz, px + .05, y + .1 + t * .22, pz], i * 6);
      }
      roofGeometry.attributes.position.needsUpdate = true;
    },
  };
}
