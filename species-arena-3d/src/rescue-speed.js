import * as THREE from 'three';

const RUNS = [
  { start: 3.03, pickup: 3.68, drop: 4.60 },
  { start: 4.69, pickup: 5.34, drop: 6.26 },
  { start: 6.35, pickup: 7.00, drop: 7.92 },
];

export const SPEED_DROPS = RUNS.map(run => run.drop);

const STANDBY = new THREE.Vector3(5.3, 0, 2.52);
const STOPS = [
  new THREE.Vector3(4.83, 0, 2.45),
  new THREE.Vector3(5.87, 0, 2.60),
  new THREE.Vector3(6.86, 0, 2.78),
];
const SAFE_SEATS = [
  new THREE.Vector3(4.76, 0, 3.25),
  new THREE.Vector3(5.89, 0, 3.40),
  new THREE.Vector3(6.99, 0, 3.55),
];
const WARDROBE = [
  { top: 0xf2a356, trim: 0xc45c43, pants: 0x33475e, skin: 0xa96547, hair: 0x33262a },
  { top: 0x55baba, trim: 0x337683, pants: 0x414765, skin: 0xe0a880, hair: 0x673d2b },
  { top: 0x8f84bc, trim: 0x514963, pants: 0x273543, skin: 0x784738, hair: 0x23222b },
];

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const jointSphere = new THREE.IcosahedronGeometry(1, 1);
const clothBox = new THREE.BoxGeometry(1, 1, 1);
const sleeve = new THREE.CylinderGeometry(1, 1, 1, 7);

function part(parent, geometry, material, position, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function joint(parent, x, y, z = 0) {
  const node = new THREE.Group();
  node.position.set(x, y, z);
  parent.add(node);
  return node;
}

export function makePassenger(clothes, index) {
  const root = new THREE.Group();
  const body = joint(root, 0, 0.83);
  const surface = color => new THREE.MeshStandardMaterial({ color, roughness: 0.75, flatShading: true });
  const top = surface(clothes.top);
  const trim = surface(clothes.trim);
  const pants = surface(clothes.pants);
  const skin = surface(clothes.skin);
  const hair = surface(clothes.hair);
  const pale = surface(0xe4dbc8);
  const sole = surface(0x263039);
  const stature = [1, 0.94, 1.04][index];
  const chest = part(body, jointSphere, top, [0, 0.16, 0], [0.252, 0.30, 0.138]);
  chest.rotation.y = 0.10 * (index - 1);
  part(body, clothBox, trim, [0, -0.046, 0.012], [0.355, 0.065, 0.22]);
  part(body, sleeve, skin, [0, 0.405, 0], [0.065, 0.142, 0.062]);
  part(body, sleeve, trim, [0, 0.372, 0], [0.094, 0.065, 0.087]);

  const head = joint(body, 0, 0.515);
  part(head, jointSphere, skin, [0, 0.038, 0.016], [0.114, 0.148, 0.108]);
  part(head, jointSphere, hair, [0, 0.098, -0.031], [0.122, 0.105, 0.107]);
  part(head, jointSphere, skin, [0, 0.025, 0.106], [0.028, 0.035, 0.033]);
  for (const side of [-1, 1]) {
    part(head, jointSphere, hair, [side * 0.043, 0.057, 0.108], [0.017, 0.01, 0.013]);
  }
  if (index === 0) {
    part(head, jointSphere, hair, [-0.069, 0.155, -0.064], [0.078, 0.08, 0.067]);
    part(body, clothBox, pale, [0.132, 0.21, 0.132], [0.071, 0.052, 0.018]);
  } else if (index === 1) {
    part(head, jointSphere, trim, [0, 0.128, -0.014], [0.127, 0.074, 0.115]);
    part(head, clothBox, trim, [0, 0.106, 0.106], [0.175, 0.025, 0.115]);
    part(body, clothBox, pale, [0.046, 0.13, 0.137], [0.13, 0.025, 0.015]);
  } else {
    part(head, jointSphere, hair, [0.014, 0.145, -0.05], [0.115, 0.07, 0.088]);
    part(head, clothBox, pale, [0, 0.061, 0.110], [0.138, 0.027, 0.023]);
    part(body, clothBox, trim, [0, 0.137, -0.133], [0.285, 0.265, 0.12]);
  }

  const arms = [];
  const legs = [];
  for (const side of [-1, 1]) {
    const shoulder = joint(body, side * 0.215, 0.249);
    part(shoulder, sleeve, top, [0, -0.145, 0], [0.076, 0.29, 0.072]);
    const elbow = joint(shoulder, 0, -0.26);
    part(elbow, sleeve, trim, [0, -0.102, 0], [0.062, 0.19, 0.063]);
    part(elbow, jointSphere, skin, [0, -0.225, 0], [0.057, 0.077, 0.053]);
    arms.push({ side, shoulder, elbow });

    const hip = joint(body, side * 0.111, -0.015);
    part(hip, sleeve, pants, [0, -0.18, 0], [0.101, 0.39, 0.100]);
    const knee = joint(hip, 0, -0.37);
    part(knee, sleeve, pants, [0, -0.158, 0], [0.077, 0.344, 0.082]);
    part(knee, jointSphere, sole, [0, -0.375, 0.052], [0.087, 0.065, 0.143]);
    legs.push({ hip, knee });
  }

  function pose(time, fold) {
    body.position.y = (0.823 - fold * 0.024 + 0.008 * Math.sin(time * 4.5 + index)) * stature;
    body.rotation.x = 0.08 * fold;
    head.rotation.set(0.10 * fold, Math.sin(time * 2.3 + index * 0.8) * 0.13, fold * -0.12);
    for (const { side, shoulder, elbow } of arms) {
      shoulder.rotation.set(lerp(0.05, -0.62, fold), 0, side * lerp(0.12, 0.37, fold));
      elbow.rotation.x = lerp(-0.11, -1.06, fold);
    }
    for (const { hip, knee } of legs) {
      hip.rotation.x = -fold * 1.09;
      knee.rotation.x = fold * 1.44;
    }
  }

  return { root, pose };
}

function makeSafeZone() {
  const group = new THREE.Group();
  group.position.set(5.88, 0.024, 3.33);
  group.scale.set(1.47, 1, 0.64);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xf3ff83, side: THREE.DoubleSide, transparent: true, opacity: 0.62,
    toneMapped: false, depthWrite: false,
  });
  const boundary = new THREE.Mesh(new THREE.RingGeometry(0.91, 0.93, 80), markerMaterial);
  boundary.rotation.x = -Math.PI / 2;
  group.add(boundary);
  for (let index = 0; index < 12; index++) {
    const arc = new THREE.Mesh(new THREE.RingGeometry(0.99, 1.02, 12, 1, index * Math.PI / 6, 0.24), markerMaterial);
    arc.rotation.x = -Math.PI / 2;
    group.add(arc);
  }
  return { group, markerMaterial };
}

function makeRibbon(width, tint, opacity, offset, vertical) {
  const segments = 28;
  const positions = new Float32Array((segments + 1) * 6);
  const colors = new Float32Array((segments + 1) * 6);
  const indices = [];
  const geometry = new THREE.BufferGeometry();
  for (let index = 0; index < segments; index++) {
    const a = index * 2;
    indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const position = new THREE.BufferAttribute(positions, 3);
  position.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', position);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  const color = new THREE.Color(tint);
  for (let index = 0; index <= segments; index++) {
    const intensity = (index / segments) ** 1.75;
    for (let edge = 0; edge < 2; edge++) {
      colors.set([color.r * intensity, color.g * intensity, color.b * intensity], index * 6 + edge * 3);
    }
  }
  const material = new THREE.MeshBasicMaterial({
    transparent: true, vertexColors: true, depthWrite: false, opacity,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  function update(samples, time) {
    for (let index = 0; index <= segments; index++) {
      const point = samples[index];
      const earlier = samples[Math.max(0, index - 1)];
      const later = samples[Math.min(segments, index + 1)];
      const dx = later.x - earlier.x;
      const dz = later.z - earlier.z;
      const distance = Math.hypot(dx, dz) || 1;
      const proportion = index / segments;
      const spread = width * Math.sin(Math.PI * proportion ** 0.7) + width * 0.07;
      const ripple = offset * Math.sin(proportion * 32 - time * 15) * (1 - proportion);
      for (let side = 0; side < 2; side++) {
        const cross = (side ? spread : -spread);
        const x = point.x - dz / distance * (ripple + (vertical ? 0 : cross));
        const y = point.y + 0.85 + offset + (vertical ? cross : 0);
        const z = point.z + dx / distance * (ripple + (vertical ? 0 : cross));
        positions.set([x, y, z], index * 6 + side * 3);
      }
    }
    position.needsUpdate = true;
  }

  return { mesh, update };
}

function makeDebris() {
  const group = new THREE.Group();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-0.57, -0.38, 0.04, 0.40, -0.20, 0, 0.02, 0.68, 0], 3));
  geometry.computeVertexNormals();
  const glass = new THREE.MeshBasicMaterial({ color: 0xabe7eb, transparent: true, opacity: 0.76, side: THREE.DoubleSide, toneMapped: false });
  const paper = new THREE.MeshStandardMaterial({ color: 0xf6e0af, roughness: 0.85, transparent: true, side: THREE.DoubleSide });
  const shards = Array.from({ length: 19 }, (_, index) => {
    const shard = new THREE.Mesh(geometry, index % 5 ? glass : paper);
    const size = 0.042 + (index % 8) * 0.016;
    shard.scale.set(size, size * (index % 5 ? 1 : 1.62), size);
    group.add(shard);
    return shard;
  });

  function update(time, worldTime) {
    group.visible = time >= 3.18 && time < 9.55;
    if (!group.visible) return;
    const age = Math.max(0.014, worldTime - 2.80);
    const fade = 1 - smoothstep(time, 8.30, 9.55);
    glass.opacity = fade * 0.76;
    paper.opacity = fade * 0.89;
    shards.forEach((shard, index) => {
      const angle = index * 2.40;
      const spread = (index % 6) / 5;
      shard.position.set(
        -1.28 + Math.cos(angle) * (0.34 + age * (0.40 + spread)),
        Math.max(0.035, 4.81 + Math.sin(angle) * (0.22 + age * 0.48) - age ** 2 * 1.84),
        0.69 + age * (0.46 + spread * 1.43),
      );
      shard.rotation.set(angle + age * 2.8, index * 0.61 - age * 2.3, angle * 0.72 + age * 1.7);
    });
  }

  return { group, update };
}

export function createSpeedSequence() {
  const object = new THREE.Group();
  const passengers = WARDROBE.map(makePassenger);
  const safe = makeSafeZone();
  const debris = makeDebris();
  const trails = [
    makeRibbon(0.24, 0x6dd5ff, 0.32, 0, true),
    makeRibbon(0.14, 0xffd95b, 0.49, -0.15, false),
    makeRibbon(0.052, 0xfff2ab, 0.88, 0.05, true),
    makeRibbon(0.035, 0x90e8ff, 0.72, 0.21, false),
  ];
  object.add(safe.group, debris.group, ...passengers.map(passenger => passenger.root), ...trails.map(trail => trail.mesh));
  object.visible = false;

  const samples = Array.from({ length: 29 }, () => new THREE.Vector3());
  const future = new THREE.Vector3();
  const prior = new THREE.Vector3();
  const window = new THREE.Vector3();
  const carryPosition = new THREE.Vector3();
  const posePosition = new THREE.Vector3();
  const bodyOffset = new THREE.Vector3();
  const carryRotation = new THREE.Quaternion();
  const finalRotation = new THREE.Quaternion();
  const poseEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  let pending = null;

  function path(time, point, returnBend) {
    if (time < RUNS[0].start) return point.copy(STANDBY);
    const index = RUNS.findLastIndex(run => time >= run.start);
    const run = RUNS[index];
    const origin = index === 0 ? STANDBY : STOPS[index - 1];
    const end = STOPS[index];
    if (time <= run.pickup) {
      const approach = smoothstep(time, run.start, run.pickup);
      point.lerpVectors(origin, window, approach);
      point.y = window.y * smoothstep(approach, 0.25, 1);
      point.z += Math.sin(Math.PI * approach) * 0.46;
    } else if (time < run.pickup + 0.17) {
      point.copy(window);
      point.y += 0.09 * Math.sin((time - run.pickup) / 0.17 * Math.PI);
    } else if (time < run.drop) {
      const returnProgress = smoothstep(time, run.pickup + 0.17, run.drop);
      point.lerpVectors(window, end, returnProgress);
      point.y = window.y * (1 - smoothstep(returnProgress, 0.03, 0.92));
      point.z += Math.sin(Math.PI * returnProgress) * returnBend;
    } else {
      point.copy(end);
    }
    return point;
  }

  function update({ time, worldTime, car, hero, heroRig, trailSeconds = 0.35, returnBend = 0.84 }) {
    object.visible = true;
    pending = null;
    window.set(0, -1.44, 1.17);
    car.localToWorld(window);
    path(time, hero.position, returnBend);
    path(time + 0.019, future, returnBend);
    path(time - 0.019, prior, returnBend);
    const dx = future.x - prior.x;
    const dz = future.z - prior.z;
    const movement = Math.hypot(dx, dz);
    const carryingIndex = RUNS.findIndex(run => time >= run.pickup && time < run.drop);
    hero.rotation.set(0, Math.atan2(car.position.x - hero.position.x, car.position.z - hero.position.z), 0);
    if (movement > 0.009) hero.rotation.y = Math.atan2(dx, dz);
    if (carryingIndex !== -1) {
      const run = RUNS[carryingIndex];
      const turn = smoothstep(time, run.pickup, run.pickup + 0.17);
      if (turn < 1 || movement <= 0.009) {
        const end = STOPS[carryingIndex];
        const outgoing = Math.atan2(end.x - window.x, end.z - window.z);
        hero.rotation.y = Math.PI + turn * (outgoing - Math.PI);
      }
    }
    if (time >= RUNS.at(-1).drop) hero.rotation.y = lerp(hero.rotation.y, -0.27, smoothstep(time, 7.92, 8.29));

    passengers.forEach((passenger, index) => {
      const run = RUNS[index];
      if (time < run.pickup) {
        const slide = smoothstep(time, run.pickup - 0.22, run.pickup);
        passenger.root.position.set(lerp((index - 1) * 0.72, 0, slide), lerp(-0.63, -0.52, slide), lerp(0.16, 0.48, slide));
        car.localToWorld(passenger.root.position);
        passenger.root.quaternion.copy(car.quaternion);
        passenger.root.scale.setScalar(0.70);
        passenger.pose(time, 0.96);
      } else if (time < run.drop) {
        pending = { passenger, run, time, car, hero, heroRig };
      } else {
        const dismount = smoothstep(time, run.drop, run.drop + 0.24);
        const safeSeat = SAFE_SEATS[index];
        const end = STOPS[index];
        const heading = Math.atan2(end.x - window.x, end.z - window.z);
        passenger.root.position.copy(safeSeat);
        carryRotation.setFromEuler(poseEuler.set(0.1, heading, -1.19, 'YXZ'));
        bodyOffset.set(0, 0.82 * 0.76, 0).applyQuaternion(carryRotation);
        posePosition.set(end.x + Math.sin(heading) * 0.444, 1.568, end.z + Math.cos(heading) * 0.444).sub(bodyOffset);
        passenger.root.position.lerpVectors(posePosition, safeSeat, dismount);
        passenger.root.rotation.set(lerp(0.1, 0, dismount), lerp(heading, -0.28 + 0.18 * index, dismount), lerp(-1.19, 0, dismount), 'YXZ');
        passenger.root.scale.setScalar(0.76);
        passenger.pose(time, 1 - dismount);
      }
    });

    const rescued = RUNS.filter(run => time >= run.drop).length;
    safe.group.visible = time >= 2.75;
    safe.markerMaterial.opacity = (0.31 + rescued * 0.16) * smoothstep(time, 2.75, 3.28);
    debris.update(time, worldTime);
    const trailVisible = time >= RUNS[0].start + 0.02 && time < RUNS.at(-1).drop + trailSeconds + 0.04;
    if (trailVisible) samples.forEach((sample, index) => path(time - (1 - index / (samples.length - 1)) * trailSeconds, sample, returnBend));
    for (const trail of trails) {
      trail.mesh.visible = trailVisible;
      if (trailVisible) trail.update(samples, time);
    }

    return { running: clamp(movement / 0.19, 0, 1), carrying: carryingIndex !== -1, rescued };
  }

  function afterPose() {
    if (!pending) return;
    const { passenger, run, time, car, hero, heroRig } = pending;
    const blend = smoothstep(time, run.pickup, run.pickup + 0.16);
    const anchor = heroRig?.anchors?.carry;
    if (anchor) {
      anchor.getWorldPosition(carryPosition);
    } else {
      carryPosition.set(0, 1.568, 0.444);
      hero.localToWorld(carryPosition);
    }

    const scale = lerp(0.70, 0.76, blend);
    carryRotation.setFromEuler(poseEuler.set(0.1, hero.rotation.y, -1.19, 'YXZ'));
    bodyOffset.set(0, 0.82 * scale, 0).applyQuaternion(carryRotation);
    carryPosition.sub(bodyOffset);
    posePosition.set(0, -0.52, 0.48);
    car.localToWorld(posePosition);
    finalRotation.copy(car.quaternion).slerp(carryRotation, blend);
    passenger.root.position.lerpVectors(posePosition, carryPosition, blend);
    passenger.root.quaternion.copy(finalRotation);
    passenger.root.scale.setScalar(scale);
    passenger.pose(time, lerp(0.96, 0.68, blend));
  }

  return { object, update, afterPose };
}
