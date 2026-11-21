import * as THREE from 'three';
import { groundSurfaceHeight as ground, waterSurfaceAt } from './world-terrain.js';
import { createBirdAgent, wildlifeBlocks } from './world-wildlife.js';

const matte = (color) => new THREE.MeshStandardMaterial({ color, roughness: .95, flatShading: true });

function sequence(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function instances(group, geometry, color, placements) {
  const mesh = new THREE.InstancedMesh(geometry, matte(color), placements.length);
  const pose = new THREE.Object3D();
  placements.forEach(({ position, scale, yaw = 0, lean = 0 }, i) => {
    pose.position.set(...position);
    pose.scale.set(...scale);
    pose.rotation.set(0, yaw, lean);
    pose.updateMatrix();
    mesh.setMatrixAt(i, pose.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  group.add(mesh);
}

function ellipsoid(group, material, position, scale) {
  const shape = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
  shape.position.set(...position);
  shape.scale.set(...scale);
  group.add(shape);
  return shape;
}

function rod(group, material, start, end, width, tip = width) {
  const a = new THREE.Vector3(...start);
  const delta = new THREE.Vector3(...end).sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(tip, width, delta.length(), 6), material);
  mesh.position.copy(a.addScaledVector(delta, .5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  group.add(mesh);
}

function wader(group, x, z, direction) {
  const bird = new THREE.Group();
  bird.position.set(x, Math.max(.13, ground(x, z)), z);
  bird.rotation.y = direction;
  const white = matte(0xe9e7d3);
  const gray = matte(0xa9b9af);
  const leg = matte(0x685649);
  const beak = matte(0xc19b51);
  const wings = [];
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * .09, .58, .02);
    bird.add(hip);
    rod(hip, leg, [0, 0, 0], [side * .02, -.31, -.15], .027);
    const knee = new THREE.Group();
    knee.position.set(side * .02, -.31, -.15);
    hip.add(knee);
    rod(knee, leg, [0, 0, 0], [side * .01, -.27, .14], .022);
    rod(knee, leg, [side * .01, -.255, .14], [side * .01, -.255, .32], .02, .009);
    legs.push({ hip, knee, side });
    const pivot = new THREE.Group();
    pivot.position.set(side * .16, .63, -.08);
    bird.add(pivot);
    const folded = ellipsoid(pivot, gray, [0, 0, 0], [.13, .15, .32]);
    folded.rotation.x = -.2;
    const spread = ellipsoid(pivot, gray, [side * .35, 0, -.04], [.44, .055, .26]);
    spread.visible = false;
    wings.push({ pivot, folded, spread, side });
  }
  ellipsoid(bird, white, [0, .63, .01], [.22, .21, .38]);
  ellipsoid(bird, gray, [0, .64, -.37], [.11, .08, .25]);
  const neck = new THREE.Group();
  neck.position.set(0, .7, .25);
  bird.add(neck);
  rod(neck, white, [0, -.1, 0], [0, .25, -.035], .095, .068);
  rod(neck, white, [0, .22, -.035], [0, .42, .11], .07, .055);
  ellipsoid(neck, white, [0, .44, .15], [.092, .092, .122]);
  rod(neck, beak, [0, .43, .23], [0, .397, .44], .037, .003);
  for (const side of [-1, 1]) ellipsoid(neck, leg, [side * .065, .465, .216], [.023, .023, .022]);
  group.add(bird);
  const agent = createBirdAgent(bird, { home: [x, ground(x, z), z], phase: direction });
  return {
    state: agent.state,
    update(dt, time, phase, visitor, collision) {
      const state = agent.update(dt, time, visitor, collision);
      const blend = state.flightBlend;
      const bend = (1 - blend) * Math.max(0, Math.sin(time * 1.2 + phase)) ** 7;
      neck.rotation.x = -.45 * blend + (bend * 1.07 - .07) * (1 - blend);
      neck.rotation.y = Math.sin(time * .81 + phase) * (state.flying ? .04 : .25);
      for (const { pivot, folded, spread, side } of wings) {
        folded.visible = blend < .18;
        spread.visible = blend >= .18;
        pivot.rotation.z = side * (.24 + Math.sin(time * 9 + phase) * .65) * blend;
      }
      for (const { hip, knee, side } of legs) {
        hip.rotation.x = state.legTuck * 1.05 + (1 - blend) * Math.sin(time * 5 + side) * .035;
        knee.rotation.x = -state.legTuck * .75;
      }
    },
  };
}

function makeWetland(group) {
  const random = sequence(9218);
  const stems = [];
  const leaves = [];
  const heads = [];
  for (let cluster = 0; cluster < 36; cluster++) {
    const x = 49 + random() * 10.5;
    const z = (cluster % 3 === 0 ? 4.9 : 1.15) + (random() - .5) * 1.95;
    for (let i = 0; i < 4; i++) {
      const px = x + (random() - .5) * .59;
      const pz = z + (random() - .5) * .64;
      const y = ground(px, pz) - .035;
      if (y < -.29 || y > .78) continue;
      const height = .51 + random() * .81;
      const lean = (random() - .5) * .23;
      const yaw = random() * Math.PI * 2;
      stems.push({ position: [px, y + height * .5, pz], scale: [.021, height, .021], yaw, lean });
      for (const side of [-1, 1]) {
        leaves.push({ position: [px + side * .12, y + height * (.37 + random() * .19), pz],
          scale: [.05, height * .64, .021], yaw, lean: side * (.49 + random() * .31) });
      }
      if (random() > .48) heads.push({ position: [px - lean * height * .5, y + height, pz], scale: [.037, .23, .038], yaw, lean });
    }
  }
  instances(group, new THREE.CylinderGeometry(.66, 1, 1, 4), 0x738148, stems);
  instances(group, new THREE.ConeGeometry(1, 1, 3), 0x809552, leaves);
  instances(group, new THREE.CapsuleGeometry(.6, .3, 1, 5), 0x806141, heads);

  const ripples = Array.from({ length: 6 }, (_, i) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xb5dbba, transparent: true, depthWrite: false });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(.95, 1, 32), material);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(51.4 + i * 1.14, .246, 3.58 + Math.sin(i * 1.8) * .61);
    ripple.renderOrder = 6;
    group.add(ripple);
    return ripple;
  });
  const firstBird = wader(group, 53.5, 3.16, 2.86);
  const secondBird = wader(group, 57.2, 3.35, 4.09);
  return { birds: [firstBird.state, secondBird.state], update(dt, time, rain, visitor, collision) {
    firstBird.update(dt, time, .3, visitor, collision);
    secondBird.update(dt, time, 2.4, visitor, collision);
    ripples.forEach((ripple, i) => {
      const surface = waterSurfaceAt(ripple.position.x, ripple.position.z, ground(ripple.position.x, ripple.position.z));
      ripple.visible = surface !== null;
      if (surface === null) return;
      ripple.position.y = surface + .012;
      const phase = (time * (.35 + rain * .31) + i * .31) % 1;
      ripple.scale.setScalar(.08 + phase * .59);
      ripple.material.opacity = (1 - phase) ** 2 * (.25 + rain * .23);
    });
  } };
}

function makeDunes(group) {
  const random = sequence(1339);
  const grass = [];
  for (let i = 0; i < 74; i++) {
    const x = 50.1 + random() * 5.3;
    const z = -43 + random() * 15.5;
    if (Math.hypot(x - 50.1, (z + 33.25) * .6) < 1.15 || ground(x, z) < .025) continue;
    const height = .11 + random() * .28;
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * .4;
      grass.push({ position: [x + Math.cos(a) * .08, ground(x, z) + height * .39, z + Math.sin(a) * .08],
        scale: [.031, height * (1 + random() * .44), .021], yaw: a, lean: .27 + random() * .51 });
    }
  }
  instances(group, new THREE.ConeGeometry(1, 1, 3), 0xa29455, grass);

  const positions = [];
  const colors = [];
  const indices = [];
  const highlight = new THREE.Color(0xd6bc8d);
  const shade = new THREE.Color(0xaf9368);
  const tint = new THREE.Color();
  const rows = 79;
  const columns = 114;
  for (let i = 0; i < rows; i++) {
    const z = -45 + i * 20 / (rows - 1);
    for (let j = 0; j < columns; j++) {
      const x = 49.4 + j * 9.8 / (columns - 1);
      const y = ground(x, z);
      const range = Math.hypot((x - 54) / 4.8, (z + 35.1) / 9.8);
      const edge = (1 - THREE.MathUtils.smoothstep(range, .69, 1.02)) * THREE.MathUtils.smoothstep(y, -.035, .04);
      const frequency = Math.sin((x - 50) * 14 + Math.sin(z * .82) * 1.7 + Math.sin(x * .6 + z * .38));
      const ridge = (frequency * .5 + .5) ** 2;
      positions.push(x, y + .028 + edge * ridge * .033, z);
      tint.copy(shade).lerp(highlight, .27 + ridge * .5 + Math.sin(z * .59 + x * .73) * .07);
      colors.push(tint.r, tint.g, tint.b, edge * .88);
      if (i && j) {
        const p = i * columns + j;
        indices.push(p - columns - 1, p - 1, p - columns, p - columns, p - 1, p);
      }
    }
  }
  const relief = new THREE.BufferGeometry();
  relief.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  relief.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  relief.setIndex(indices);
  relief.computeVertexNormals();
  group.add(new THREE.Mesh(relief, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1,
  })));

  const driftwood = matte(0x93795c);
  const start = [55.3, ground(55.3, -31.3) + .14, -31.3];
  const end = [55.92, ground(55.92, -33.35) + .12, -33.35];
  rod(group, driftwood, start, end, .16, .095);
  rod(group, driftwood, [55.62, ground(55.62, -32.3) + .16, -32.3], [56.52, ground(56.52, -32.53) + .07, -32.53], .077, .026);
}

function stop(target, offset, x, z) {
  return { target, offset, spawn: { position: [x, ground(x, z), z], target } };
}

export function createExtras(scene) {
  const group = new THREE.Group();
  group.name = '河口湿地与海岸沙丘';
  const wetland = new THREE.Group();
  const dunes = new THREE.Group();
  const animateWetland = makeWetland(wetland);
  makeDunes(dunes);
  group.add(wetland, dunes);
  scene.add(group);
  return {
    birds: animateWetland.birds,
    blocks(...args) { return wildlifeBlocks(animateWetland.birds, ...args); },
    stops: {
      wetland: stop([54.1, .57, 3.14], [-9.4, 8.8, -13.2], 49.7, -.95),
      dunes: stop([55.4, .28, -35.2], [-10, 9.4, 10.2], 50.25, -32.15),
    },
    update(dt, time, rain, visitor = null, collision = null) { animateWetland.update(dt, time, rain, visitor, collision); },
  };
}
