import * as THREE from 'three';
import { makePassenger } from './rescue-speed.js';
import { createExpansionHero } from './rescue-expansion-heroes.js';

const BREAK_TIME = 2.45;
const CATCH_TIME = 3.42;
const SPLIT_TIME = 2.52;
const IMPACT_TIME = 4.10;
export const MIRROR_WINDOW_TIME = 3.18;
const LANES = [
  { windowX: -0.85, pickup: 3.31, safe: 4.25, landingX: -3.2, landingZ: 3.30, color: 0x7debef },
  { windowX: 0, pickup: 3.37, safe: 4.32, landingX: -0.55, landingZ: 3.49, color: 0xcafcf8 },
  { windowX: 0.85, pickup: 3.43, safe: 4.39, landingX: 2.12, landingZ: 3.42, color: 0x93facc },
];
export const MIRROR_SAFE_TIMES = LANES.map(lane => lane.safe);

const WARDROBE = [
  { top: 0xf2a356, trim: 0xc45c43, pants: 0x33475e, skin: 0xa96547, hair: 0x33262a },
  { top: 0x55baba, trim: 0x337683, pants: 0x414765, skin: 0xe0a880, hair: 0x673d2a },
  { top: 0x8f84bc, trim: 0x514963, pants: 0x273543, skin: 0x784738, hair: 0x23222b },
];
const { clamp, lerp, smoothstep } = THREE.MathUtils;

function sampleCar(time, position, rotation) {
  if (time <= BREAK_TIME) {
    position.set(lerp(-6.1, -1.6, time / BREAK_TIME), lerp(5.48, 5.02, time / BREAK_TIME), 0);
    rotation.set(0, 0, Math.sin(time * 3.8) * 0.018);
  } else if (time <= CATCH_TIME) {
    const drop = (time - BREAK_TIME) / (CATCH_TIME - BREAK_TIME);
    position.set(lerp(-1.6, -0.75, drop), 5.02 - 1.66 * drop ** 2, 0);
    rotation.set(0, 0, lerp(0, -0.28, drop));
  } else {
    const drop = clamp((time - CATCH_TIME) / (IMPACT_TIME - CATCH_TIME), 0, 1);
    const slide = smoothstep(time, IMPACT_TIME, 4.88);
    const bounce = Math.sin(Math.PI * smoothstep(time, IMPACT_TIME, 4.51));
    position.set(-0.75 + 0.49 * drop + 0.72 * slide, 3.36 - 2.64 * (0.87 * drop + 0.13 * drop ** 2) + 0.13 * bounce, 0.26 * slide);
    rotation.set(0, 0.18 * slide, -0.28 * (1 - smoothstep(drop, 0.36, 0.98)) + 0.04 * bounce);
  }
}

function tintClone(model, color) {
  const tint = new THREE.Color(color);
  const materials = new Map();
  model.traverse(mesh => {
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const source = mesh.material;
    if (!materials.has(source)) {
      const material = source.clone();
      material.color?.lerp(tint, 0.26);
      if (material.emissive) {
        material.emissive.lerp(tint, 0.4);
        material.emissiveIntensity = Math.max(0.19, material.emissiveIntensity);
      }
      materials.set(source, { material, opacity: source.opacity, transparent: source.transparent, depthWrite: source.depthWrite });
    }
    mesh.material = materials.get(source).material;
  });
  return [...materials.values()];
}

function setPresence(actor, presence) {
  actor.rig.object.visible = presence > 0.002;
  if (!actor.rig.object.visible) return;
  for (const { material, opacity, transparent, depthWrite } of actor.materials) {
    material.opacity = presence * opacity;
    material.transparent = transparent || presence < 0.99;
    material.depthWrite = depthWrite && presence > 0.96;
  }
}

function marker(color) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.RingGeometry(0.47, 0.51, 6), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function buildDust(object) {
  const size = 32;
  const textureData = new Uint8Array(size * size * 4);
  for (let index = 0; index < size * size; index++) {
    const x = (index % size + 0.5) / size * 2 - 1;
    const y = (Math.floor(index / size) + 0.5) / size * 2 - 1;
    textureData.set([255, 255, 255, 255 * Math.max(0, 1 - x * x - y * y) ** 3], index * 4);
  }
  const map = new THREE.DataTexture(textureData, size, size);
  map.needsUpdate = true;
  const positions = new Float32Array(22 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ size: 0.48, color: 0xa59381, map, transparent: true, opacity: 0, depthWrite: false });
  const dust = new THREE.Points(geometry, material);
  dust.frustumCulled = false;
  object.add(dust);

  return time => {
    const age = time - IMPACT_TIME;
    dust.visible = age >= 0 && age < 1.2;
    if (!dust.visible) return;
    material.opacity = 0.50 * Math.sin(Math.PI * clamp(age / 1.2, 0, 1)) ** 1.15;
    material.size = 0.36 + age * 0.36;
    for (let index = 0; index < 22; index++) {
      const angle = index * 2.39996;
      const spread = (0.32 + (index % 7) * 0.16) * (1 + age * 2.1);
      positions.set([
        -0.15 + Math.cos(angle) * spread,
        0.08 + age * (0.30 + (index % 5) * 0.10),
        0.1 + Math.sin(angle) * spread * 0.68,
      ], index * 3);
    }
    geometry.attributes.position.needsUpdate = true;
  };
}

function buildGlass(object) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-.63, -.52, 0, .62, -.35, 0, .11, .62, 0], 3));
  const material = new THREE.MeshBasicMaterial({ color: 0xbaf8fb, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const mesh = new THREE.InstancedMesh(geometry, material, 30);
  mesh.frustumCulled = false;
  const part = new THREE.Object3D();
  const source = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  sampleCar(MIRROR_WINDOW_TIME, source, rotation);
  quaternion.setFromEuler(rotation);
  object.add(mesh);

  return time => {
    const age = time - MIRROR_WINDOW_TIME;
    mesh.visible = age >= 0 && age < 0.88;
    if (!mesh.visible) return;
    material.opacity = 0.65 * (1 - smoothstep(age, 0.28, 0.88));
    for (let index = 0; index < 30; index++) {
      const angle = index * 2.39996;
      part.position.set(LANES[index % 3].windowX + 0.17 * Math.cos(angle), 0.14 + 0.19 * Math.sin(angle), 0.69);
      part.position.applyQuaternion(quaternion).add(source);
      part.position.x += Math.cos(angle) * age * (0.32 + 0.11 * (index % 5));
      part.position.y += Math.sin(angle) * age * 0.68 - 4.2 * age ** 2;
      part.position.z += age * (0.62 + 0.18 * (index % 6));
      part.rotation.set(angle + age * 6.2, angle * 0.74 + age * 4, angle - age * 5.7);
      part.scale.setScalar(0.045 + 0.012 * (index % 7));
      part.updateMatrix();
      mesh.setMatrixAt(index, part.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
}

function buildRefractions(object, actors) {
  const count = 11;
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const fragments = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1), material, count * actors.length);
  fragments.frustumCulled = false;
  object.add(fragments);
  const piece = new THREE.Object3D();
  const hand = new THREE.Vector3();

  actors.forEach(({ lane }, actorIndex) => {
    const tint = new THREE.Color(lane.color);
    for (let index = 0; index < count; index++) fragments.setColorAt(actorIndex * count + index, tint);
  });

  return ({ time, hero, heroRig }) => {
    const appearance = smoothstep(time, 2.48, 2.70) * (1 - smoothstep(time, 2.87, 3.24));
    const castAnchor = heroRig?.anchors?.carry;
    if (castAnchor) castAnchor.getWorldPosition(hand);
    else hero.localToWorld(hand.set(0, 1.28, 0.15));
    let visible = false;

    actors.forEach(({ rig }, actorIndex) => {
      const dissolve = smoothstep(time, 4.90 + actorIndex * 0.12, 5.76 + actorIndex * 0.12);
      const fade = Math.sin(Math.PI * dissolve);
      const strength = Math.max(appearance, fade);
      if (strength > 0.002) visible = true;
      for (let index = 0; index < count; index++) {
        const angle = index * 2.39996 + time * 2.2;
        const radius = 0.22 + (index % 4) * 0.14 + dissolve * 0.5;
        piece.position.copy(rig.object.position);
        piece.position.x += Math.cos(angle) * radius;
        piece.position.y += 0.23 + (index % 7) * 0.24 + dissolve * 0.63;
        piece.position.z += Math.sin(angle) * radius;
        if (appearance > fade) piece.position.lerp(hand, 0.44 * (1 - smoothstep(time, 2.63, 3.02)));
        piece.rotation.set(angle * 0.7, angle, time * 4.3 + index);
        piece.scale.set(0.075, 0.15, 0.033).multiplyScalar(strength * (0.7 + (index % 3) * 0.24));
        piece.updateMatrix();
        fragments.setMatrixAt(actorIndex * count + index, piece.matrix);
      }
    });
    fragments.visible = visible;
    if (visible) fragments.instanceMatrix.needsUpdate = true;
  };
}

export function createMirrorSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const origin = new THREE.Vector3(1.70, 0, 2.25);
  const leaderMark = marker(0x96fff3);
  leaderMark.position.copy(origin).y = 0.027;
  object.add(leaderMark);
  const carPoint = new THREE.Vector3();
  const carRotation = new THREE.Euler();
  const carQuaternion = new THREE.Quaternion();
  const anchor = new THREE.Vector3();
  const carryRoot = new THREE.Vector3();
  const carryOffset = new THREE.Vector3();
  const carryQuaternion = new THREE.Quaternion();
  const uprightQuaternion = new THREE.Quaternion();
  const carryRotation = new THREE.Euler(0, 0, 0, 'YXZ');

  const actors = LANES.map((lane, index) => {
    const rig = createExpansionHero('mirror');
    const passenger = makePassenger(WARDROBE[index], index);
    const materials = tintClone(rig.object, lane.color);
    const start = new THREE.Vector3(lane.windowX * 1.44 - 0.65, 0, 2.42 + Math.abs(lane.windowX) * 0.19);
    const landing = new THREE.Vector3(lane.landingX, 0, lane.landingZ - 0.59);
    const safe = new THREE.Vector3(lane.landingX + 0.12, 0, lane.landingZ);
    const safeMark = marker(lane.color);
    safeMark.position.copy(safe).y = 0.026;
    object.add(rig.object, passenger.root, safeMark);

    sampleCar(lane.pickup, carPoint, carRotation);
    carQuaternion.setFromEuler(carRotation);
    const window = new THREE.Vector3(lane.windowX, -1.20, 1.14).applyQuaternion(carQuaternion).add(carPoint);
    const extraction = new THREE.Vector3(lane.windowX, -0.58, 0.50).applyQuaternion(carQuaternion).add(carPoint);
    const approachHeading = Math.atan2(window.x - start.x, window.z - start.z);
    const evacuationHeading = Math.atan2(landing.x - window.x, landing.z - window.z);
    return { lane, rig, passenger, materials, start, landing, safe, safeMark, window, extraction, approachHeading, evacuationHeading, cabinRotation: carQuaternion.clone() };
  });

  const dustAt = buildDust(object);
  const glassAt = buildGlass(object);
  const refractionsAt = buildRefractions(object, actors);
  let poseFrame;

  function update({ time, car, hero, heroRig }) {
    if (time > CATCH_TIME) sampleCar(time, car.position, car.rotation);
    const arrival = smoothstep(time, 0.5, 2.44);
    const withdraw = smoothstep(time, 2.83, 3.74);
    hero.position.copy(origin);
    hero.position.x += 1.68 * (1 - arrival) + 1.55 * withdraw;
    hero.position.z += 0.86 * (1 - arrival) - 0.68 * withdraw;
    hero.rotation.set(0, Math.atan2(car.position.x - hero.position.x, car.position.z - hero.position.z), 0);

    const pulse = smoothstep(time, 2.38, 2.67) * (1 - smoothstep(time, 2.75, 3.34));
    leaderMark.visible = pulse > 0;
    leaderMark.material.opacity = pulse * 0.80;
    leaderMark.scale.setScalar(lerp(0.54, 3.2, smoothstep(time, 2.40, 3.34)));

    let rescued = 0;
    actors.forEach((actor, index) => {
      const { lane, rig, start, landing, safe, window, extraction, passenger, approachHeading, evacuationHeading } = actor;
      const split = smoothstep(time, SPLIT_TIME, 2.91);
      const vault = smoothstep(time, 2.87, lane.pickup);
      const clear = smoothstep(time, lane.pickup + 0.06, lane.safe);
      const dismount = smoothstep(time, lane.safe, lane.safe + 0.28);
      const dissolve = smoothstep(time, 4.90 + index * 0.12, 5.76 + index * 0.12);
      const carrying = time >= lane.pickup && dismount < 1;
      const copy = rig.object;

      copy.position.copy(origin).lerp(start, split);
      copy.position.lerp(window, vault).lerp(landing, clear);
      copy.position.y += Math.sin(vault * Math.PI) * 0.17 + Math.sin(clear * Math.PI) * 0.34;
      const turn = smoothstep(time, lane.pickup + 0.04, lane.pickup + 0.24);
      const yaw = Math.atan2(Math.sin(evacuationHeading - approachHeading), Math.cos(evacuationHeading - approachHeading));
      copy.rotation.set(0, approachHeading + yaw * turn, 0);
      copy.scale.setScalar(lerp(0.77, 1, split) * (1 - dissolve * 0.18));
      setPresence(actor, split * (1 - dissolve));
      if (copy.visible) rig.update({ time, progress: clamp(time / 11.6, 0, 1), power: (1 - split) * 0.85, running: time < lane.pickup || clear < 1 ? 0.87 : 0, carrying });

      const root = passenger.root;
      if (time < lane.pickup) {
        const toWindow = smoothstep(time, lane.pickup - 0.34, lane.pickup);
        root.position.set(lane.windowX, lerp(-0.65, -0.58, toWindow), lerp(0.14, 0.50, toWindow));
        car.localToWorld(root.position);
        root.quaternion.copy(car.quaternion);
        root.scale.setScalar(0.70);
        passenger.pose(time, 0.96);
      } else if (dismount < 1) {
        const held = smoothstep(time, lane.pickup, lane.pickup + 0.14);
        const hand = rig.anchors?.carry;
        if (hand) hand.getWorldPosition(anchor);
        else copy.localToWorld(anchor.set(0, 1.22, 0.53));
        const scale = lerp(0.70, 0.79, held);
        carryQuaternion.setFromEuler(carryRotation.set(0.06, copy.rotation.y, -1.17, 'YXZ'));
        carryOffset.set(0, 0.82 * scale, 0).applyQuaternion(carryQuaternion);
        carryRoot.copy(anchor).sub(carryOffset);
        root.position.lerpVectors(extraction, carryRoot, held).lerp(safe, dismount);
        uprightQuaternion.setFromEuler(carryRotation.set(0, 0.24 * (index - 1), 0));
        root.quaternion.copy(actor.cabinRotation).slerp(carryQuaternion, held).slerp(uprightQuaternion, dismount);
        root.scale.setScalar(scale);
        passenger.pose(time, lerp(0.96, 0.68, held) * (1 - dismount));
      } else {
        root.position.copy(safe);
        root.rotation.set(0, 0.24 * (index - 1), 0);
        root.scale.setScalar(0.79);
        passenger.pose(time, 0);
      }

      if (time >= lane.safe) rescued++;
      actor.safeMark.visible = time >= lane.safe;
      actor.safeMark.material.opacity = 0.62 * smoothstep(time, lane.safe, lane.safe + 0.21);
    });

    dustAt(time);
    glassAt(time);
    poseFrame = { time, hero, heroRig };
    return { power: pulse, running: 0.55 * Math.sin(arrival * Math.PI) + 0.55 * Math.sin(withdraw * Math.PI), carrying: false, rescued };
  }

  function afterPose() {
    if (poseFrame) refractionsAt(poseFrame);
  }

  return { object, update, afterPose };
}
