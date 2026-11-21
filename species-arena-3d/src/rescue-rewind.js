import * as THREE from 'three';
import { makePassenger } from './rescue-speed.js';

export const REWIND_ARM = 2.7;
export const REWIND_START = 3.6;
export const REWIND_REPAIR = 6.66;
export const REWIND_SAFE = 8.6;

const BREAK_WORLD = 2.45;
const FALL_WORLD = 3.42;
const REPAIRED_WORLD = BREAK_WORLD - 0.0001;
const STOP_WORLD = 2.28;
const REWIND_STOP = 7.35;
const CABLE_JOIN = new THREE.Vector3(-1.60, 6.65, 0.04);
const { clamp, lerp, smoothstep } = THREE.MathUtils;
const WARDROBE = [
  { top: 0xb57e54, trim: 0x624046, pants: 0x36465e, skin: 0xb78364, hair: 0x3e2a35 },
  { top: 0x518b91, trim: 0x3c5165, pants: 0x444760, skin: 0xdca17e, hair: 0x684937 },
  { top: 0x846798, trim: 0x604363, pants: 0x404052, skin: 0xa87555, hair: 0x302632 },
];

export function rewindWorldTime(time) {
  if (time <= REWIND_START) return Math.min(time, FALL_WORLD);
  if (time <= REWIND_REPAIR) {
    return lerp(FALL_WORLD, REPAIRED_WORLD, smoothstep(time, REWIND_START, REWIND_REPAIR));
  }
  return lerp(REPAIRED_WORLD, STOP_WORLD, smoothstep(time, REWIND_REPAIR, REWIND_STOP));
}

function placeEcho(worldTime, echo) {
  if (worldTime < BREAK_WORLD) {
    const approach = worldTime / BREAK_WORLD;
    echo.position.set(lerp(-6.1, -1.6, approach), lerp(5.48, 5.02, approach), 0);
    echo.rotation.z = Math.sin(worldTime * 3.8) * 0.018;
  } else {
    const drop = clamp((worldTime - BREAK_WORLD) / (FALL_WORLD - BREAK_WORLD), 0, 1);
    echo.position.set(lerp(-1.6, -0.75, drop), 5.02 - 1.66 * drop * drop, 0);
    echo.rotation.z = -0.28 * drop;
  }
}

function clockMaterial(color, opacity = 0) {
  return new THREE.MeshBasicMaterial({
    color, opacity, transparent: true, depthWrite: false, toneMapped: false,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
}

function makeDial() {
  const dial = new THREE.Group();
  const rotor = new THREE.Group();
  const amber = clockMaterial(0xffbf82);
  const iris = clockMaterial(0xd0b2ff);
  const measures = [
    [1.74, 1.77, 0.22, 1.28, amber],
    [1.74, 1.77, 2.27, 1.5, amber],
    [1.74, 1.77, 4.58, 1.14, amber],
    [1.86, 1.875, 0.7, 0.92, iris],
    [1.86, 1.875, 2.46, 0.72, iris],
    [1.86, 1.875, 4.1, 0.86, iris],
  ];
  for (const [inner, outer, start, span, material] of measures) {
    rotor.add(new THREE.Mesh(new THREE.RingGeometry(inner, outer, 38, 1, start, span), material));
  }
  const ticks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), amber, 24);
  const cursor = new THREE.Object3D();
  for (let index = 0; index < ticks.count; index++) {
    const angle = index * Math.PI / 12;
    const major = index % 6 === 0;
    cursor.position.set(1.66 * Math.cos(angle), 1.66 * Math.sin(angle), 0.013);
    cursor.rotation.z = angle - Math.PI / 2;
    cursor.scale.set(major ? 0.055 : 0.024, major ? 0.14 : 0.066, 1);
    cursor.updateMatrix();
    ticks.setMatrixAt(index, cursor.matrix);
  }
  rotor.add(ticks);
  dial.add(rotor);
  return { dial, rotor, amber, iris };
}

function makeEchoes() {
  const body = new THREE.BoxGeometry(2.64, 1.4, 1.40);
  const trolley = new THREE.BoxGeometry(0.27, 0.88, 0.17);
  const bodyEdges = new THREE.EdgesGeometry(body);
  const trolleyEdges = new THREE.EdgesGeometry(trolley);
  body.dispose();
  trolley.dispose();
  const result = [];
  for (let index = 0; index < 4; index++) {
    const material = new THREE.LineBasicMaterial({
      color: index % 2 ? 0xffbb88 : 0xd1b5ff,
      opacity: 0, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
    });
    const node = new THREE.Group();
    const cabin = new THREE.LineSegments(bodyEdges, material);
    const hook = new THREE.LineSegments(trolleyEdges, material);
    hook.position.set(0.16, 1.16, 0);
    hook.rotation.z = -0.15;
    node.add(cabin, hook);
    result.push({ node, material });
  }
  return result;
}

function makeRepairSeal() {
  const node = new THREE.Group();
  node.position.copy(CABLE_JOIN);
  const gold = clockMaterial(0xffd6a0);
  const lavender = clockMaterial(0xd7bcff);
  const front = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.014, 5, 36, Math.PI * 1.8), gold);
  const rear = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.011, 5, 36, Math.PI * 1.63), lavender);
  rear.rotation.y = Math.PI * 0.38;
  rear.rotation.z = Math.PI * 0.62;
  node.add(front, rear);

  const seam = new THREE.Group();
  const seamGeometry = new THREE.CylinderGeometry(0.046, 0.046, 0.36, 10);
  const casing = new THREE.Mesh(seamGeometry, new THREE.MeshStandardMaterial({
    color: 0xe7a95a, metalness: 0.73, roughness: 0.32, emissive: 0x9d451c, emissiveIntensity: 0.45,
  }));
  casing.rotation.z = Math.PI * 0.52;
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.012, 5, 14), new THREE.MeshBasicMaterial({ color: 0xffdb9b, toneMapped: false }));
  band.rotation.y = Math.PI / 2;
  for (const x of [-0.126, 0.126]) {
    const end = band.clone();
    end.position.x = x;
    seam.add(end);
  }
  seam.add(casing);
  seam.position.copy(CABLE_JOIN);

  const coords = new Float32Array(36);
  const threadGeometry = new THREE.BufferGeometry();
  threadGeometry.setAttribute('position', new THREE.BufferAttribute(coords, 3).setUsage(THREE.DynamicDrawUsage));
  const threadMaterial = new THREE.LineBasicMaterial({
    color: 0xffd2a8, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  });
  const threads = new THREE.LineSegments(threadGeometry, threadMaterial);
  threads.frustumCulled = false;
  return { node, front, rear, gold, lavender, seam, threads, coords, threadMaterial };
}

function makeBackflow() {
  const material = clockMaterial(0xcab1ff);
  const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), material, 32);
  sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  sparks.frustumCulled = false;
  return { sparks, material };
}

export function createRewindSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const { dial, rotor, amber, iris } = makeDial();
  const echoes = makeEchoes();
  const repair = makeRepairSeal();
  const backflow = makeBackflow();
  const footHalo = new THREE.Mesh(new THREE.RingGeometry(0.64, 0.668, 44, 1, 0, Math.PI * 1.78), clockMaterial(0xffbd84));
  footHalo.rotation.x = -Math.PI / 2;
  const cabin = new THREE.Group();
  const riders = WARDROBE.map(makePassenger);
  for (const [index, rider] of riders.entries()) {
    rider.root.position.set((index - 1) * 0.75, -0.64, 0.02);
    rider.root.scale.setScalar(0.69);
    cabin.add(rider.root);
  }
  object.add(cabin, dial, footHalo, backflow.sparks, repair.node, repair.seam, repair.threads, ...echoes.map(({ node }) => node));
  const spark = new THREE.Object3D();

  function update({ time, worldTime = rewindWorldTime(time), car, hero }) {
    const arm = smoothstep(time, REWIND_ARM, REWIND_START - 0.12);
    const release = smoothstep(time, REWIND_SAFE - 0.62, REWIND_SAFE + 0.32);
    const power = arm * (1 - release);
    const entrance = smoothstep(time, 0.55, REWIND_ARM);
    hero.position.set(lerp(3.45, 1.60, entrance), 0, lerp(3.75, 2.82, entrance));
    hero.rotation.y = Math.atan2(car.position.x - hero.position.x, car.position.z - hero.position.z);
    cabin.position.copy(car.position);
    cabin.quaternion.copy(car.quaternion);
    for (const rider of riders) rider.pose(worldTime, 0.85);

    dial.visible = power > 0.001;
    dial.position.set(car.position.x, car.position.y + 0.19, car.position.z - 0.83);
    dial.rotation.set(-0.055, 0.16, 0);
    dial.scale.setScalar(0.73 + arm * 0.31);
    rotor.rotation.z = (time - REWIND_ARM) * 1.4;
    amber.opacity = power * (0.65 + 0.22 * Math.sin(time * 10) ** 2);
    iris.opacity = power * 0.64;
    footHalo.visible = dial.visible;
    footHalo.position.set(hero.position.x, 0.028, hero.position.z);
    footHalo.rotation.z = time * 1.2;
    footHalo.material.opacity = power * 0.37;

    const tracing = smoothstep(time, REWIND_START + 0.02, REWIND_START + 0.67) * (1 - smoothstep(time, REWIND_REPAIR - 0.14, REWIND_STOP + 0.12));
    for (const [index, { node, material }] of echoes.entries()) {
      const echoTime = Math.min(FALL_WORLD, worldTime + (index + 1) * 0.105);
      const separation = smoothstep(echoTime - worldTime, 0.018, 0.14);
      node.visible = tracing * separation > 0.003;
      if (!node.visible) continue;
      placeEcho(echoTime, node);
      node.position.z += (index + 1) * 0.10;
      material.opacity = tracing * separation * (0.54 - index * 0.10);
    }

    backflow.sparks.visible = tracing > 0.003;
    backflow.material.opacity = tracing * 0.82;
    if (backflow.sparks.visible) {
      for (let index = 0; index < backflow.sparks.count; index++) {
        const progress = ((index * 0.6180339 - time * (0.34 + index % 5 * 0.018)) % 1 + 1) % 1;
        const speed = Math.sin(progress * Math.PI);
        const angle = index * 2.4 + time * 0.92;
        spark.position.set(
          lerp(-1.65, -0.61, progress) + Math.cos(angle) * (0.8 + speed * 0.53),
          5.23 - 1.93 * progress * progress + Math.sin(angle) * 0.58,
          0.63 + Math.sin(angle) * (0.46 + speed * 0.42),
        );
        spark.scale.set(0.024 + speed * 0.023, 0.06 + speed * 0.09, 0.028 + speed * 0.016);
        spark.rotation.set(angle * 0.65, time * 2.1 + index, 0.25 - progress * 0.6);
        spark.updateMatrix();
        backflow.sparks.setMatrixAt(index, spark.matrix);
      }
      backflow.sparks.instanceMatrix.needsUpdate = true;
    }

    const knot = smoothstep(time, REWIND_REPAIR - 0.47, REWIND_REPAIR) * (1 - smoothstep(time, REWIND_REPAIR + 0.36, REWIND_REPAIR + 1.1));
    const converge = smoothstep(time, REWIND_REPAIR - 0.48, REWIND_REPAIR);
    repair.node.visible = knot > 0.001;
    repair.node.scale.setScalar(0.75 + 0.34 * knot);
    repair.front.rotation.z = time * 4.3;
    repair.rear.rotation.y = Math.PI * 0.34 + time * 1.8;
    repair.gold.opacity = knot * 0.99;
    repair.lavender.opacity = knot * 0.76;
    repair.threads.visible = knot > 0.001;
    repair.threadMaterial.opacity = knot * 0.85;
    if (repair.threads.visible) {
      const snap = Math.sin(worldTime * 12) * 0.066;
      for (let index = 0; index < 6; index++) {
        const side = index < 3 ? -1 : 1;
        const x = side < 0 ? -2.10 : -1.01;
        const y = side < 0 ? 6.37 + snap : 5.95 - snap;
        const curl = Math.sin(time * 15 + index) * knot * 0.12;
        repair.coords.set([
          lerp(x, CABLE_JOIN.x, converge), lerp(y, CABLE_JOIN.y, converge), CABLE_JOIN.z + curl,
          CABLE_JOIN.x, CABLE_JOIN.y + (index % 3 - 1) * 0.14 * knot, CABLE_JOIN.z - curl,
        ], index * 6);
      }
      repair.threads.geometry.attributes.position.needsUpdate = true;
    }

    repair.seam.visible = time >= REWIND_REPAIR;
    repair.seam.scale.setScalar(smoothstep(time, REWIND_REPAIR, REWIND_REPAIR + 0.2));
    return { power, running: Math.sin(Math.PI * entrance) * 0.7 };
  }

  return { object, update };
}
