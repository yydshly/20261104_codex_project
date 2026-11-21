import * as THREE from 'three';
import { createCorePowerEffect } from './arena-core-power-effects.js';
import { createOtherPowerEffect } from './arena-other-power-effects.js';

const { lerp, smoothstep } = THREE.MathUtils;

function light(color) {
  return new THREE.MeshBasicMaterial({
    color, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    depthWrite: false, fog: false, toneMapped: false,
  });
}

function addMesh(group, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  return mesh;
}

function castFade(progress, contact) {
  return smoothstep(progress, 0.06, contact - 0.08) * (1 - smoothstep(progress, contact + 0.12, 1));
}

function slashRibbon(inner, outer, width) {
  const points = [];
  const indices = [];
  const steps = 32;
  for (let index = 0; index <= steps; index++) {
    const t = index / steps;
    const theta = lerp(-width / 2, width / 2, t);
    const radius = lerp(inner, outer, Math.sin(t * Math.PI) ** 0.6);
    const x = Math.sin(theta);
    const z = Math.cos(theta);
    const y = (t - 0.5) * 0.38;
    points.push(x * inner, y, z * inner, x * radius, y + 0.035, z * radius);
    if (index < steps) {
      const offset = index * 2;
      indices.push(offset, offset + 1, offset + 2, offset + 1, offset + 3, offset + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices);
  return geometry;
}

function createKnightEffect(color) {
  const object = new THREE.Group();
  const sweep = new THREE.Group();
  sweep.position.set(0, 0.95, 0.28);
  sweep.rotation.z = -0.26;
  object.add(sweep);
  const frost = light(color);
  const edge = light(0xe1f9ff);
  addMesh(sweep, slashRibbon(0.63, 1.5, 2.3), frost);
  addMesh(sweep, slashRibbon(1.40, 1.52, 2.2), edge);

  function update({ distance, progress, contact }) {
    const windup = smoothstep(progress, 0.04, contact - 0.04);
    const strike = smoothstep(progress, contact - 0.13, contact + 0.15);
    const fade = castFade(progress, contact);
    sweep.rotation.y = lerp(-0.95, 0.82, strike);
    sweep.scale.set(0.72 + windup * 0.28, 1, Math.min(1.16, 0.72 + distance * 0.19));
    frost.opacity = fade * (0.11 + 0.36 * strike);
    edge.opacity = fade * (0.24 + 0.56 * strike);
  }

  return { object, update };
}

function createBeastEffect(color) {
  const object = new THREE.Group();
  const ember = light(color);
  const hot = light(0xffdf91);
  const jawGeometry = new THREE.TorusGeometry(0.45, 0.031, 5, 22, Math.PI * 1.05);
  const fangGeometry = new THREE.ConeGeometry(0.071, 0.23, 4);
  const jaws = [-1, 1].map(side => {
    const jaw = new THREE.Group();
    object.add(jaw);
    const rim = addMesh(jaw, jawGeometry, ember);
    rim.scale.set(1, 0.56, 1);
    rim.rotation.z = side === 1 ? 0 : Math.PI;
    for (const x of [-0.34, -0.13, 0.13, 0.34]) {
      const tooth = addMesh(jaw, fangGeometry, hot);
      tooth.position.set(x, side * (0.13 + (0.34 - Math.abs(x)) * 0.23), 0.023);
      tooth.rotation.z = side === 1 ? Math.PI : 0;
      tooth.scale.y = Math.abs(x) > 0.2 ? 1 : 0.68;
    }
    return { jaw, side };
  });
  const sparkGeometry = new THREE.OctahedronGeometry(1, 0);
  const sparks = Array.from({ length: 11 }, (_, index) => {
    const spark = addMesh(object, sparkGeometry, index % 3 ? ember : hot);
    return { spark, angle: index * 2.399, height: 0.32 + (index % 5) * 0.11 };
  });

  function update({ distance, progress, contact, result }) {
    const windup = smoothstep(progress, 0.02, contact - 0.15);
    const snap = smoothstep(progress, contact - 0.11, contact + 0.03);
    const scatter = smoothstep(progress, contact, 1);
    const fade = castFade(progress, contact);
    const reach = Math.min(distance - 0.48, result === 'miss' ? 1.16 : 1.51);
    const lunge = lerp(0.66, Math.max(0.76, reach), snap);
    for (const { jaw, side } of jaws) {
      jaw.position.set(0, 0.87 + side * (0.21 + windup * 0.24 - snap * 0.32), lunge);
      jaw.rotation.x = side * (0.32 + 0.3 * windup - 0.58 * snap);
      jaw.rotation.y = 0.42;
      jaw.scale.setScalar(0.68 + windup * 0.34);
    }
    for (const { spark, angle, height } of sparks) {
      spark.position.set(
        Math.sin(angle) * (0.32 + scatter * 0.76),
        0.83 + height * (0.58 + Math.sin(Math.PI * scatter)),
        lunge + Math.cos(angle) * (0.16 + scatter * 0.52),
      );
      const size = (0.033 + height * 0.09) * snap * (1 - scatter);
      spark.scale.set(size, size * 1.4, size);
      spark.rotation.set(angle, progress * 6, scatter * 4);
    }
    ember.opacity = fade * 0.63;
    hot.opacity = fade * (0.29 + snap * 0.45);
  }

  return { object, update };
}

function createCrawlerEffect(color) {
  const object = new THREE.Group();
  const tracer = light(color);
  const tips = light(0xd6ffe9);
  const railGeometry = new THREE.BoxGeometry(0.032, 0.022, 1);
  const tipGeometry = new THREE.ConeGeometry(0.096, 0.39, 4);
  tipGeometry.rotateX(Math.PI / 2);
  const claw = [-1, 1].map(side => {
    const rail = addMesh(object, railGeometry, tracer);
    const tip = addMesh(object, tipGeometry, tips);
    return { side, rail, tip };
  });
  const guideGeometry = new THREE.RingGeometry(0.27, 0.292, 6);
  const guides = Array.from({ length: 3 }, () => {
    const guide = addMesh(object, guideGeometry, tracer);
    guide.rotation.x = -Math.PI / 2;
    return guide;
  });
  const axis = new THREE.Vector3(0, 0, 1);
  const direction = new THREE.Vector3();

  function update({ distance, progress, contact, result }) {
    const lock = smoothstep(progress, 0.06, contact - 0.1);
    const lunge = smoothstep(progress, contact - 0.19, contact + 0.06);
    const extent = Math.min(distance - 0.68, result === 'miss' ? 1.28 : 1.58);
    const reach = lerp(0.23, Math.max(0.47, extent), lunge);
    const fade = castFade(progress, contact);
    for (const { side, rail, tip } of claw) {
      const start = side * (0.35 + lock * 0.16);
      const end = side * lerp(0.49, 0.09, lunge);
      direction.set(end - start, 0, reach);
      rail.scale.z = direction.length();
      rail.quaternion.setFromUnitVectors(axis, direction.normalize());
      rail.position.set((start + end) * 0.5, 0.49, 0.5 + reach * 0.5);
      tip.position.set(end, 0.49, 0.5 + reach);
      tip.quaternion.copy(rail.quaternion);
      tip.scale.setScalar(0.52 + lunge * 0.48);
    }
    guides.forEach((guide, index) => {
      guide.position.set(0, 0.018, (0.3 + index * 0.21) * distance);
      guide.rotation.z = index * 0.3 + progress * 0.38;
      guide.scale.setScalar((0.48 + lock * 0.46) * (1 + lunge * 0.17 * index));
    });
    tracer.opacity = fade * (0.34 + 0.40 * lunge);
    tips.opacity = fade * (0.25 + 0.66 * lunge);
  }

  return { object, update };
}

function createWraithEffect(color) {
  const object = new THREE.Group();
  const aura = light(color);
  const coreMaterial = light(0xd2a6ff);
  const core = addMesh(object, new THREE.IcosahedronGeometry(0.21, 1), coreMaterial);
  const ringGeometry = new THREE.TorusGeometry(0.47, 0.025, 7, 46);
  const rings = Array.from({ length: 4 }, (_, index) => {
    const material = aura.clone();
    const ring = addMesh(object, ringGeometry, material);
    return { ring, index };
  });

  function update({ distance, progress, contact, result }) {
    const charge = smoothstep(progress, 0.06, contact - 0.09);
    const release = smoothstep(progress, contact - 0.18, contact + 0.26);
    const fade = castFade(progress, contact);
    const flight = Math.max(0.64, Math.min(distance - 0.29, result === 'miss' ? 2.04 : 2.84));
    core.position.set(0, lerp(1.55, 0.95, release), lerp(0.39, flight, release));
    core.scale.setScalar(0.61 + charge * 0.55 - release * 0.22);
    core.rotation.set(progress * 4.2, -progress * 6.7, 0.4);
    coreMaterial.opacity = fade * (0.21 + charge * 0.40);
    for (const { ring, index } of rings) {
      const wave = smoothstep(progress, contact - 0.2 + index * 0.045, contact + 0.22 + index * 0.035);
      ring.position.set(0, lerp(1.53, 0.97, wave), lerp(0.38, flight, wave));
      ring.rotation.set(-0.28 + index * 0.15, 0.32 + index * 0.14, progress * 1.4);
      ring.scale.setScalar((0.39 + wave * 1.23) * (1 - index * 0.08));
      ring.material.opacity = fade * (0.3 + wave * 0.4) * (1 - index * 0.14);
    }
  }

  return { object, update };
}

const speciesEffects = {
  knight: createKnightEffect,
  beast: createBeastEffect,
  crawler: createCrawlerEffect,
  wraith: createWraithEffect,
};

export function createArenaAbilityEffects(scene) {
  const group = new THREE.Group();
  scene.add(group);
  const slots = new Map();
  const active = new Set();

  function clear() {
    for (const slot of active) slot.object.visible = false;
    active.clear();
  }

  function update(casts, time) {
    clear();
    for (const { id, source, target, heading, accent, progress, contact, result } of casts) {
      if (!slots.has(id)) {
        const effect = speciesEffects[id]?.(accent)
          ?? createCorePowerEffect(id, accent)
          ?? createOtherPowerEffect(id, accent);
        const slot = effect ? { ...effect, pose: {} } : null;
        if (slot) group.add(slot.object);
        slots.set(id, slot);
      }
      const slot = slots.get(id);
      if (!slot) continue;
      const dx = target.x - source.x;
      const dz = target.z - source.z;
      const distance = Math.hypot(dx, dz);
      slot.object.position.copy(source);
      slot.object.rotation.y = distance > 0.001 ? Math.atan2(dx, dz) : heading;
      slot.object.visible = true;
      const pose = slot.pose;
      pose.distance = distance;
      pose.progress = progress;
      pose.contact = contact;
      pose.time = time;
      pose.result = result;
      slot.update(pose);
      active.add(slot);
    }
  }

  return { clear, update };
}
