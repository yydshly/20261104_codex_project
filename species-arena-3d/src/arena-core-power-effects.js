import * as THREE from 'three';
import { createCatalogHero } from './hero-models.js';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const up = new THREE.Vector3(0, 1, 0);
const tubeGeometry = new THREE.CylinderGeometry(1, 1, 1, 6);
const tickGeometry = new THREE.OctahedronGeometry(1, 0);
const ringGeometry = new THREE.RingGeometry(0.91, 1, 48);
const slashGeometry = new THREE.RingGeometry(0.66, 1, 32, 1, 0, Math.PI * 1.08);
const sealGeometry = new THREE.TorusGeometry(1, 0.047, 6, 48);

function glow(color, options = {}) {
  return new THREE.MeshBasicMaterial({
    color, opacity: 0, transparent: true, side: THREE.DoubleSide,
    depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, ...options,
  });
}

function mesh(parent, geometry, material) {
  const item = new THREE.Mesh(geometry, material);
  parent.add(item);
  return item;
}

function floorRing(parent, material, geometry = ringGeometry) {
  const item = mesh(parent, geometry, material);
  item.rotation.x = -Math.PI / 2;
  return item;
}

function envelope(progress, start, peak, end) {
  return smoothstep(progress, start, peak) * (1 - smoothstep(progress, peak, end));
}

function placeBeam(beam, from, to, radius) {
  const direction = beam.userData.direction ??= new THREE.Vector3();
  direction.subVectors(to, from);
  const length = direction.length();
  beam.visible = length > 0.001;
  if (!beam.visible) return;
  beam.position.copy(from).lerp(to, 0.5);
  beam.scale.set(radius, length, radius);
  beam.quaternion.setFromUnitVectors(up, direction.multiplyScalar(1 / length));
}

function makeEcho(id, color) {
  const rig = createCatalogHero(id);
  const tint = new THREE.Color(color);
  const materials = new Map();
  rig.object.traverse(child => {
    if (!child.isMesh || Array.isArray(child.material)) return;
    const source = child.material;
    if (!materials.has(source)) {
      const material = source.clone();
      material.color?.lerp(tint, 0.53);
      material.emissive?.lerp(tint, 0.53);
      if ('emissiveIntensity' in material) material.emissiveIntensity = 0.58;
      material.transparent = true;
      material.depthWrite = false;
      materials.set(source, { material, opacity: source.opacity });
    }
    child.material = materials.get(source).material;
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return { rig, materials: [...materials.values()] };
}

function echoOpacity(echo, opacity) {
  echo.rig.object.visible = opacity > 0.004;
  for (const layer of echo.materials) layer.material.opacity = opacity * layer.opacity;
}

function createMirror(color) {
  const object = new THREE.Group();
  const copies = [-1, 1].map((side, index) => {
    const echo = makeEcho('mirror', index === 0 ? color : 0x85dbff);
    const mark = floorRing(object, glow(color));
    const cut = floorRing(object, glow(index === 0 ? 0xa6fbe9 : 0x9adfff), slashGeometry);
    cut.rotation.order = 'YXZ';
    echo.rig.object.name = index === 0 ? 'mirror-left-echo' : 'mirror-right-echo';
    object.add(echo.rig.object);
    return { echo, mark, cut, side, impact: index === 0 ? 0.42 : 0.74 };
  });
  const centerCut = floorRing(object, glow(0xe0fff8), slashGeometry);
  centerCut.rotation.order = 'YXZ';

  function update({ distance, progress, contact, time }) {
    for (const { echo, mark, cut, side, impact } of copies) {
      const split = smoothstep(progress, 0.035, 0.23);
      const drive = smoothstep(progress, impact - 0.18, impact);
      const recoil = smoothstep(progress, impact, impact + 0.19);
      const opacity = split * (1 - smoothstep(progress, impact + 0.11, 0.99)) * (0.69 + 0.24 * drive);
      const flank = side * lerp(0.2, 1.04, split) * (1 - drive * 0.25 + recoil * 0.2);
      const staging = split * (side === -1 ? -0.48 : Math.min(0.65, distance * 0.36));
      const lunge = Math.max(0.31, distance - 0.64);
      const step = lerp(lerp(staging, lunge, drive), staging - 0.12, recoil);
      const clone = echo.rig.object;
      echoOpacity(echo, opacity);
      clone.position.set(flank, 0.012 + Math.sin(Math.PI * drive) * 0.1, step);
      clone.scale.setScalar(0.86 + 0.1 * split);
      clone.rotation.y = Math.atan2(-flank, Math.max(0.24, distance - step));
      echo.rig.update({
        time: time + side * 0.13,
        power: envelope(progress, impact - 0.15, impact, impact + 0.18),
        running: (1 - recoil) * drive * (1 - smoothstep(progress, impact - 0.06, impact)),
      });
      mark.position.set(flank, 0.026, step);
      mark.scale.setScalar(0.38);
      mark.material.opacity = opacity * 0.49;
      cut.position.set(flank * 0.49, 0.93 + 0.15 * side, distance - 0.26);
      cut.rotation.y = side * 1.16 + progress * side * 1.73;
      cut.rotation.x = -Math.PI / 2 + side * 0.42;
      cut.scale.setScalar(0.55 + smoothstep(progress, impact - 0.05, impact + 0.19) * 0.59);
      cut.material.opacity = envelope(progress, impact - 0.06, impact, impact + 0.22) * 0.92;
    }
    centerCut.position.set(0, 0.84, distance - 0.33);
    centerCut.rotation.y = 1.1 + progress * 2.2;
    centerCut.rotation.x = -1.15;
    centerCut.scale.setScalar(0.63 + smoothstep(progress, contact - 0.07, contact + 0.2) * 0.53);
    centerCut.material.opacity = envelope(progress, contact - 0.07, contact, contact + 0.2) * 0.96;
  }

  return { object, update };
}

function createWeb(color) {
  const object = new THREE.Group();
  const silk = glow(0xd7f2ff);
  const tension = glow(color);
  const strands = Array.from({ length: 12 }, (_, index) =>
    mesh(object, tubeGeometry, index % 3 === 0 ? tension : silk));
  const knot = floorRing(object, glow(color));
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  function update({ distance, progress, contact, time }) {
    const shoot = smoothstep(progress, contact - 0.29, contact);
    const retract = smoothstep(progress, contact + 0.12, 1);
    const strength = envelope(progress, contact - 0.29, contact, 1);
    const stop = lerp(0.4, Math.max(0.6, distance - 0.13), shoot * (1 - retract * 0.63));
    const bulge = (1 - shoot) * 0.29 + retract * 0.29;
    silk.opacity = strength * 0.93;
    tension.opacity = strength * 0.82;
    for (let line = 0; line < 4; line++) {
      const side = line < 2 ? -1 : 1;
      const span = side * (line % 2 === 0 ? 0.29 : 0.12);
      const radius = line % 2 === 0 ? 0.021 : 0.014;
      from.set(side * 0.22, 1.20 + side * 0.07, 0.32);
      for (let step = 0; step < 3; step++) {
        const unit = (step + 1) / 3;
        to.set(lerp(side * 0.22, span * shoot, unit) + Math.sin(unit * Math.PI) * side * bulge,
          lerp(1.2 + side * 0.07, 0.87 + line * 0.11 * shoot, unit)
            - Math.sin(Math.PI * unit) * (bulge + Math.sin(time * 29 + line) * 0.034 * shoot),
          lerp(0.32, stop, unit));
        placeBeam(strands[line * 3 + step], from, to, radius);
        from.copy(to);
      }
    }
    knot.position.set(0, 0.04, distance - 0.12);
    knot.scale.setScalar(0.25 + 0.33 * shoot);
    knot.material.opacity = envelope(progress, contact - 0.09, contact + 0.03, 0.99) * 0.64;
  }
  return { object, update };
}

function createPortal(color) {
  const object = new THREE.Group();
  const gates = [-1, 1].map(side => {
    const gate = new THREE.Group();
    const rim = mesh(gate, sealGeometry, glow(color));
    const split = mesh(gate, slashGeometry, glow(0xedc5ff));
    const well = mesh(gate, new THREE.CircleGeometry(0.89, 40), glow(0x6740ac, { blending: THREE.NormalBlending }));
    well.position.z = -0.012;
    object.add(gate);
    return { gate, rim, split, well, side };
  });
  const dart = mesh(object, tickGeometry, glow(0xffe1ff));
  function update({ distance, progress, contact, time }) {
    const strength = envelope(progress, 0.04, contact - 0.06, 1);
    const opening = smoothstep(progress, 0.08, contact - 0.08);
    for (const { gate, rim, split, well, side } of gates) {
      gate.position.set(side * 0.46, side === -1 ? 1.25 : 0.96, side === -1 ? 0.68 : Math.max(0.94, distance - 0.27));
      gate.rotation.set(side * 0.24, side * 0.61, side * 0.19);
      gate.scale.setScalar((0.26 + opening * 0.51) * (1 - smoothstep(progress, contact + 0.12, 1) * 0.68));
      rim.scale.set(0.74, 1, 1);
      rim.material.opacity = strength * 0.92;
      split.scale.set(0.81, 1.1, 1);
      split.rotation.z = side * time * 1.8;
      split.material.opacity = strength * 0.58;
      well.scale.set(0.78, 1.05, 1);
      well.material.opacity = strength * 0.54;
    }
    const release = smoothstep(progress, contact - 0.12, contact + 0.1);
    dart.position.set(lerp(-0.45, 0.42, release), lerp(1.24, 0.93, release), lerp(0.72, distance - 0.18, release));
    dart.rotation.set(0.5, time * 9, 0.5);
    dart.scale.set(0.15, 0.25, 0.20);
    dart.material.opacity = envelope(progress, contact - 0.18, contact, contact + 0.22) * 0.88;
  }
  return { object, update };
}

function createSpeed(color) {
  const object = new THREE.Group();
  const yellow = glow(color);
  const white = glow(0xfaffd0);
  const lines = Array.from({ length: 10 }, (_, index) => mesh(object, tubeGeometry, index % 3 ? yellow : white));
  const flash = floorRing(object, glow(color), slashGeometry);
  const trail = [0, 1].map(() => makeEcho('speed', color));
  for (const { rig } of trail) object.add(rig.object);
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  function update({ distance, progress, contact, time }) {
    const charge = smoothstep(progress, 0.11, contact - 0.06);
    const streak = envelope(progress, 0.04, contact - 0.045, 0.98);
    yellow.opacity = streak * 0.83;
    white.opacity = streak * 0.76;
    for (let index = 0; index < lines.length; index++) {
      const side = index % 2 ? 1 : -1;
      const height = 0.24 + (index % 5) * 0.20;
      const wave = (time * 3.7 + index * 0.37) % 1;
      const advance = (0.33 + wave * 0.63) * charge;
      from.set(side * (0.13 + index * 0.043), height, distance * advance - (0.44 + wave * 0.92));
      to.set(from.x * 0.66, height + 0.023, from.z + 0.54 + index * 0.095);
      placeBeam(lines[index], from, to, index % 3 === 0 ? 0.023 : 0.013);
    }
    for (let index = 0; index < trail.length; index++) {
      const echo = trail[index];
      const dash = smoothstep(progress, contact - 0.20 + index * 0.055, contact + index * 0.065);
      echo.rig.object.position.set((index ? 1 : -1) * 0.32, 0, distance * dash * (index ? 0.81 : 0.53) - 0.18);
      echo.rig.object.scale.setScalar(index ? 0.92 : 0.88);
      echo.rig.update({ time: time + index * 0.15, power: 0.38, running: 1 });
      echoOpacity(echo, envelope(progress, contact - 0.17, contact, contact + 0.26) * (index ? 0.57 : 0.35));
    }
    flash.position.set(0, 0.047, distance - 0.19);
    flash.rotation.z = 0.4 + progress * 3.8;
    flash.scale.setScalar(0.48 + smoothstep(progress, contact, 1) * 0.62);
    flash.material.opacity = envelope(progress, contact - 0.07, contact, contact + 0.25) * 0.96;
  }
  return { object, update };
}

function createGravity(color) {
  const object = new THREE.Group();
  const bands = Array.from({ length: 3 }, (_, index) =>
    floorRing(object, glow(index === 1 ? 0xfff1d7 : color)));
  const dust = glow(color);
  const shards = Array.from({ length: 12 }, () => mesh(object, tickGeometry, dust));
  function update({ distance, progress, contact, time }) {
    const squeeze = smoothstep(progress, 0.12, contact);
    const rebound = smoothstep(progress, contact, 0.97);
    const strength = envelope(progress, 0.02, contact, 1);
    const reach = Math.max(0.65, distance - 0.06);
    for (let index = 0; index < bands.length; index++) {
      const band = bands[index];
      const radius = lerp(1.08 - index * 0.08, 0.55, squeeze) + rebound * 0.73;
      band.position.set(0, 0.11 + index * (0.33 + 0.16 * squeeze), reach);
      band.rotation.x = -Math.PI / 2 + Math.sin(time * 6 + index) * 0.14 + (index === 2 ? 0.43 : 0);
      band.rotation.y = index * 0.25 + squeeze * 0.15;
      band.scale.setScalar(radius);
      band.material.opacity = strength * (0.86 - index * 0.12);
    }
    dust.opacity = strength * 0.89;
    for (let index = 0; index < shards.length; index++) {
      const turn = index * 2.4 + time * 2.3;
      const orbit = lerp(0.81 + (index % 3) * 0.16, 0.46, squeeze) + rebound * 0.86;
      const part = shards[index];
      part.position.set(Math.cos(turn) * orbit, 0.20 + (index % 4) * (0.13 + squeeze * 0.13), reach + Math.sin(turn) * orbit);
      part.rotation.set(turn, time * 4 + index, turn * 0.65);
      part.scale.set(0.05, 0.07 + 0.05 * squeeze, 0.044);
    }
  }
  return { object, update };
}

function createIce(color) {
  const object = new THREE.Group();
  const ice = glow(color, { blending: THREE.NormalBlending });
  const highlight = glow(0xd7f9ff);
  const ridge = Array.from({ length: 13 }, (_, index) => {
    const body = mesh(object, tickGeometry, index % 4 === 0 ? highlight : ice);
    return { body, lane: (index % 3) - 1, span: 0.18 + Math.floor(index / 3) * 0.21 + (index % 3) * 0.025 };
  });
  const crystals = Array.from({ length: 8 }, () => mesh(object, tickGeometry, highlight));
  function update({ distance, progress, contact, time }) {
    const release = smoothstep(progress, contact - 0.24, contact + 0.18);
    const fade = 1 - smoothstep(progress, contact + 0.08, 1);
    const strength = smoothstep(progress, 0.04, contact - 0.04) * fade;
    ice.opacity = strength * 0.79;
    highlight.opacity = strength * 0.75;
    for (const { body, lane, span } of ridge) {
      const rise = smoothstep(release, span - 0.29, span - 0.06);
      const tall = rise * (0.13 + 0.38 * span) * (lane === 0 ? 1 : 0.71) * fade;
      body.visible = tall > 0.008;
      body.position.set(lane * (0.09 + 0.38 * span), tall * 0.59, span * distance);
      body.rotation.set(0.40, lane * 0.65 + span, lane * -0.27);
      body.scale.set(0.09 + 0.07 * span, tall, 0.11);
    }
    for (let index = 0; index < crystals.length; index++) {
      const drift = (time * 1.5 + index * 0.19) % 1;
      const flake = crystals[index];
      flake.position.set(Math.cos(index * 2.4) * (0.2 + 0.49 * release), 0.15 + drift * 0.8, Math.max(0.28, distance * release) - drift * 0.38);
      flake.rotation.set(index, time * 6 + index, time * 3 + index);
      flake.scale.setScalar(0.035 + 0.034 * drift);
    }
  }
  return { object, update };
}

const effects = { mirror: createMirror, web: createWeb, portal: createPortal, speed: createSpeed, gravity: createGravity, ice: createIce };

export function createCorePowerEffect(id, color) {
  return Object.hasOwn(effects, id) ? effects[id](color) : null;
}
