import * as THREE from 'three';

const facet = new THREE.IcosahedronGeometry(1, 0);
const shell = new THREE.IcosahedronGeometry(1, 1);
const block = new THREE.BoxGeometry(1, 1, 1);
const chest = new THREE.CylinderGeometry(0.93, 0.61, 1, 8);
const down = new THREE.Vector3(0, -1, 0);
const { clamp, lerp } = THREE.MathUtils;

const windColors = {
  suit: 0x1c304c, armor: 0x507ea9, shell: 0xd6e4ea, panel: 0x83b7d9,
  trim: 0xc7a572, visor: 0x174569, glow: 0x94e7ff,
};
const shieldColors = {
  suit: 0x29212c, armor: 0x473747, shell: 0x745171, panel: 0x984b68,
  trim: 0xe4b474, visor: 0x3f233a, glow: 0xffb64e,
};

function joint(parent, x = 0, y = 0, z = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function part(parent, geometry, material, x, y, z, sx, sy, sz) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = !material.transparent;
  parent.add(mesh);
  return mesh;
}

function outline(points) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  return shape;
}

function panel(parent, material, points, x, y, z, depth = 0.025) {
  const geometry = new THREE.ExtrudeGeometry(outline(points), {
    depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.006, bevelThickness: 0.005,
  });
  return part(parent, geometry, material, x, y, z, 1, 1, 1);
}

function makeMaterials(colors) {
  const finish = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
  return {
    suit: finish(colors.suit, 0.09, 0.71), armor: finish(colors.armor, 0.35, 0.47),
    shell: finish(colors.shell, 0.48, 0.34), panel: finish(colors.panel, 0.45, 0.40),
    trim: finish(colors.trim, 0.55, 0.35), visor: finish(colors.visor, 0.46, 0.25),
    glow: new THREE.MeshStandardMaterial({ color: colors.glow, emissive: colors.glow, emissiveIntensity: 0.62, roughness: 0.36 }),
  };
}

function makeWindBack(body, mat) {
  part(body, facet, mat.armor, 0, 0.38, -0.179, 0.19, 0.26, 0.13);
  const swept = [[0, -0.08], [0.27, 0.16], [0.65, 0.34], [0.99, 0.36], [0.84, 0.21], [0.55, 0.013], [0.29, -0.14], [0.09, -0.17]];
  const tail = [[0.16, -0.15], [0.47, 0], [0.75, 0.15], [0.62, -0.06], [0.37, -0.2], [0.20, -0.25]];
  const vein = [[0.24, 0.069], [0.66, 0.27], [0.92, 0.33], [0.71, 0.223], [0.48, 0.13], [0.25, 0.044]];
  return [-1, 1].map(side => {
    const mirror = points => points.map(([x, y]) => [x * side, y]);
    const wing = joint(body, side * 0.184, 0.43, -0.20);
    part(wing, shell, mat.trim, side * 0.045, -0.022, 0, 0.085, 0.09, 0.066);
    panel(wing, mat.shell, mirror(swept), 0, 0, -0.025, 0.042);
    panel(wing, mat.panel, mirror(tail), 0, 0, -0.061, 0.024);
    panel(wing, mat.glow, mirror(vein), 0, 0, 0.025, 0.008).castShadow = false;
    const tip = joint(wing, side * 0.56, 0.13, -0.036);
    panel(tip, mat.armor, mirror([[0, -0.06], [0.39, 0.16], [0.55, 0.21], [0.37, 0], [0.16, -0.09]]), 0, 0, 0, 0.025);
    panel(tip, mat.trim, mirror([[0.30, 0.092], [0.52, 0.185], [0.445, 0.11], [0.32, 0.07]]), 0, 0, 0.028, 0.007);
    return { wing, tip, side };
  });
}

function makeBody(body, mat, wind) {
  part(body, shell, mat.suit, 0, 0.038, 0, wind ? 0.201 : 0.229, 0.159, 0.148);
  part(body, chest, mat.armor, 0, 0.324, -0.023, wind ? 0.297 : 0.35, 0.513, wind ? 0.18 : 0.214);
  part(body, shell, mat.suit, 0, 0.594, 0.012, 0.102, 0.127, 0.098);
  part(body, block, mat.trim, 0, 0.109, 0.019, wind ? 0.354 : 0.423, 0.055, 0.252);
  part(body, facet, mat.glow, 0, 0.104, 0.151, 0.049, 0.039, 0.023);

  if (wind) {
    for (const side of [-1, 1]) {
      const points = [[0.02, 0.511], [0.198, 0.545], [0.274, 0.437], [0.15, 0.298], [0.076, 0.316]];
      panel(body, mat.shell, points.map(([x, y]) => [x * side, y]), 0, 0, 0.129, 0.039);
      const stripe = [[0.047, 0.461], [0.246, 0.466], [0.228, 0.427], [0.073, 0.414]];
      panel(body, mat.panel, stripe.map(([x, y]) => [x * side, y]), 0, 0, 0.176, 0.009);
    }
    panel(body, mat.trim, [[0, 0.457], [0.035, 0.426], [0, 0.339], [-0.035, 0.426]], 0, 0, 0.179, 0.012);
  } else {
    panel(body, mat.shell, [[-0.33, 0.51], [-0.143, 0.565], [0.249, 0.515], [0.318, 0.398], [0.101, 0.245], [-0.218, 0.285]], 0, 0, 0.137, 0.059);
    panel(body, mat.panel, [[-0.277, 0.479], [-0.091, 0.509], [0.129, 0.456], [-0.083, 0.273], [-0.208, 0.31]], 0, 0, 0.199, 0.023);
    panel(body, mat.trim, [[-0.218, 0.479], [-0.09, 0.504], [0.073, 0.461], [0.049, 0.432], [-0.094, 0.464]], 0, 0, 0.229, 0.007);
    panel(body, mat.glow, [[0.115, 0.465], [0.161, 0.421], [0.112, 0.365], [0.067, 0.409]], 0, 0, 0.218, 0.014);
    part(body, facet, mat.trim, 0.18, 0.297, -0.18, 0.145, 0.21, 0.106).rotation.z = -0.33;
  }

  const head = joint(body, 0, 0.663, 0.024);
  part(head, shell, mat.suit, 0, 0.168, -0.003, wind ? 0.143 : 0.172, 0.191, 0.143);
  part(head, shell, mat.shell, 0, 0.217, -0.027, wind ? 0.147 : 0.175, 0.184, 0.147);
  const face = wind
    ? [[-0.147, 0.212], [0, 0.235], [0.147, 0.212], [0.109, 0.138], [0, 0.108], [-0.109, 0.138]]
    : [[-0.172, 0.225], [-0.102, 0.237], [0.151, 0.211], [0.121, 0.124], [0.015, 0.089], [-0.121, 0.131]];
  panel(head, mat.visor, face, 0, 0, 0.111, 0.026);
  const visor = wind
    ? [[-0.128, 0.195], [0, 0.208], [0.128, 0.195], [0.096, 0.157], [0, 0.165], [-0.096, 0.157]]
    : [[-0.134, 0.189], [0.136, 0.176], [0.110, 0.150], [-0.114, 0.159]];
  panel(head, mat.glow, visor, 0, 0, 0.142, 0.008);
  panel(head, mat.armor, [[-0.105, 0.127], [0, 0.083], [0.105, 0.127], [0.076, 0.050], [0, 0.036], [-0.076, 0.05]], 0, 0, 0.126, 0.028);

  if (wind) {
    for (const side of [-1, 1]) {
      const ear = part(head, facet, mat.shell, side * 0.14, 0.254, -0.075, 0.057, 0.148, 0.089);
      ear.rotation.set(-0.57, 0, -side * 0.41);
      part(head, shell, mat.trim, side * 0.134, 0.167, 0.048, 0.028, 0.063, 0.039);
    }
  } else {
    panel(head, mat.trim, [[-0.164, 0.229], [-0.135, 0.325], [-0.019, 0.364], [0.163, 0.29], [0.145, 0.235], [0.015, 0.261]], 0, 0, 0.094, 0.038);
    part(head, facet, mat.panel, -0.15, 0.264, -0.062, 0.061, 0.16, 0.101).rotation.z = 0.25;
  }
  return { head, wings: wind ? makeWindBack(body, mat) : [] };
}

function makeGuard(hand, mat) {
  const guard = joint(hand, 0.015, 0.008, 0.095);
  const hex = [[-0.19, 0.24], [0.081, 0.3], [0.224, 0.117], [0.16, -0.211], [-0.058, -0.303], [-0.221, -0.111]];
  panel(guard, mat.armor, hex, 0, 0, 0, 0.053);
  panel(guard, mat.trim, hex.map(([x, y]) => [x * 0.92, y * 0.92]), 0, 0, 0.055, 0.017);
  panel(guard, mat.panel, hex.map(([x, y]) => [x * 0.82, y * 0.82]), 0, 0, 0.075, 0.018);
  panel(guard, mat.visor, [[-0.12, 0.13], [0.012, 0.18], [0.123, 0.045], [0.081, -0.136], [-0.053, -0.185], [-0.14, -0.05]], 0, 0, 0.095, 0.019);
  const crest = [[0.01, 0.13], [0.076, 0.036], [0.019, -0.095], [-0.07, -0.01]];
  panel(guard, mat.glow, crest, 0, 0, 0.122, 0.013);
  const luminous = new THREE.MeshBasicMaterial({ color: 0xffac54, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const aura = part(guard, new THREE.ShapeGeometry(outline(hex)), luminous, 0, 0, 0.142, 1, 1, 1);
  const rimMaterial = new THREE.LineBasicMaterial({ color: 0xffdb9f, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const rim = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(hex.map(([x, y]) => new THREE.Vector3(x, y, 0.003))), rimMaterial);
  aura.add(rim);
  return { guard, aura, luminous, rimMaterial };
}

function makeArm(object, mat, wind, side) {
  const upper = joint(object);
  const forearm = joint(object);
  const hand = joint(object);
  const bulk = wind ? 1 : 1.22;
  part(upper, shell, mat.suit, 0, -0.146, 0, 0.074 * bulk, 0.173, 0.071 * bulk);
  const shoulderSize = !wind && side < 0 ? 1.38 : 1;
  part(upper, facet, mat.shell, side * 0.023, -0.035, 0.024, 0.104 * bulk * shoulderSize, 0.13 * shoulderSize, 0.098 * bulk).rotation.z = side * 0.31;
  part(upper, facet, mat.panel, side * 0.035, -0.099, 0.073, 0.075 * bulk, 0.102, 0.056 * bulk);
  part(forearm, shell, mat.armor, 0, -0.148, 0, 0.088 * bulk, 0.158, 0.082 * bulk);
  part(forearm, facet, mat.shell, side * 0.018, -0.166, 0.053, 0.092 * bulk, 0.143, 0.056 * bulk);
  part(forearm, block, mat.glow, 0, -0.204, 0.102, 0.044, 0.071, 0.012).rotation.z = side * 0.27;
  part(hand, shell, mat.suit, 0, -0.022, 0.017, 0.059 * bulk, 0.066, 0.066);
  part(hand, facet, mat.trim, 0, -0.005, 0.051, 0.061 * bulk, 0.043, 0.035);
  return { side, upper, forearm, hand, shield: !wind && side < 0 ? makeGuard(hand, mat) : null };
}

function makeLeg(object, mat, wind, side) {
  const thigh = joint(object);
  const shin = joint(object);
  const foot = joint(object);
  const bulk = wind ? 1 : 1.17;
  part(thigh, shell, mat.suit, 0, -0.201, 0, 0.105 * bulk, 0.263, 0.105 * bulk);
  part(thigh, facet, mat.armor, side * 0.037, -0.177, 0.071, 0.091 * bulk, 0.194, 0.075);
  part(shin, shell, mat.suit, 0, -0.159, 0, 0.077 * bulk, 0.237, 0.083 * bulk);
  part(shin, facet, mat.shell, side * 0.012, -0.191, 0.058, 0.087 * bulk, 0.20, 0.065);
  part(shin, facet, mat.panel, 0, -0.044, 0.088, 0.076 * bulk, 0.096, 0.056);
  part(foot, shell, mat.armor, 0, -0.014, 0.061, 0.090 * bulk, 0.068, 0.153);
  part(foot, block, mat.suit, 0, -0.061, 0.061, 0.168 * bulk, 0.044, 0.268);
  part(foot, facet, mat.trim, 0, -0.013, 0.142, 0.069 * bulk, 0.047, 0.082);
  return { side, thigh, shin, foot };
}

export function createWaveHero(id) {
  if (id !== 'wind' && id !== 'shield') throw new Error(`Unknown wave hero: ${id}`);
  const wind = id === 'wind';
  const object = new THREE.Group();
  object.name = `${id}-hero`;
  const body = joint(object);
  const mat = makeMaterials(wind ? windColors : shieldColors);
  const { head, wings } = makeBody(body, mat, wind);
  const arms = [-1, 1].map(side => makeArm(object, mat, wind, side));
  const legs = [-1, 1].map(side => makeLeg(object, mat, wind, side));
  const leftWrist = joint(arms[0].hand);
  const rightWrist = joint(arms[1].hand);
  const field = joint(object);
  leftWrist.name = `${id}-left-wrist`;
  rightWrist.name = `${id}-right-wrist`;
  field.name = `${id}-field`;

  const start = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const midpoint = new THREE.Vector3();

  function orient(limb, from, to, length) {
    limb.position.copy(from);
    axis.subVectors(to, from);
    limb.scale.y = axis.length() / length;
    limb.quaternion.setFromUnitVectors(down, axis.normalize());
  }

  function poseLimb(first, second, end, firstLength, secondLength) {
    axis.subVectors(end, start);
    const distance = clamp(axis.length(), 0.10, firstLength + secondLength - 0.004);
    axis.normalize();
    bend.addScaledVector(axis, -bend.dot(axis)).normalize();
    const along = (distance * distance + firstLength * firstLength - secondLength * secondLength) / (2 * distance);
    const offset = Math.sqrt(Math.max(0, firstLength * firstLength - along * along));
    midpoint.copy(start).addScaledVector(axis, along).addScaledVector(bend, offset);
    orient(first, start, midpoint, firstLength);
    orient(second, midpoint, end, secondLength);
  }

  function update({ time = 0, power = 0, running = 0, carrying = false } = {}) {
    const cast = THREE.MathUtils.smoothstep(power, 0, 1);
    const stride = clamp(running, 0, 1);
    const beat = time * (wind ? 12.2 : 9.6);
    const breath = Math.sin(time * 3.25) * 0.008;
    body.position.set(Math.cos(beat) * stride * 0.024 - (wind ? 0 : 0.032 * cast),
      1.005 + breath + Math.cos(beat * 2) * stride * 0.016 - cast * (wind ? 0.035 : 0.118),
      cast * (wind ? -0.058 : 0.035));
    body.rotation.set(stride * 0.19 + cast * (wind ? -0.145 : 0.13),
      stride * Math.sin(beat) * 0.10 + (wind ? 0 : -cast * 0.14), -cast * (wind ? 0.015 : 0.087));
    head.rotation.set(-body.rotation.x * 0.82 + (wind ? -0.13 : 0.035) * cast,
      -body.rotation.y * 0.55 + Math.sin(time * 1.78) * 0.08 * (1 - cast), 0);

    for (const { wing, tip, side } of wings) {
      const ripple = Math.sin(time * 6.1 + side * 0.4) * (0.05 + 0.11 * cast);
      wing.rotation.set(-0.20 * cast, side * lerp(0.72, 0.13, cast), side * lerp(-0.79, 0.04, cast) + side * ripple);
      tip.rotation.set(ripple * 0.44, side * lerp(0.21, -0.1, cast), side * (cast * 0.08 - ripple * 0.83));
    }
    for (const { side, upper, forearm, hand, shield } of arms) {
      const swing = Math.sin(beat) * side * stride * (carrying ? 0.18 : 1);
      start.set(side * (wind ? 0.249 : 0.30), 0.494, 0).applyEuler(body.rotation).add(body.position);
      const castX = wind ? side * 0.56 : side < 0 ? -0.32 : 0.23;
      const castY = wind ? 1.58 : side < 0 ? 1.43 : 1.52;
      hand.position.set(lerp(side * (wind ? 0.291 : 0.368), castX, cast),
        lerp(0.867 + Math.max(0, swing) * 0.1, castY, cast), lerp(0.051 + swing * 0.263, wind ? 0.50 : 0.56, cast));
      bend.set(side * 0.67, -0.75, -0.13);
      poseLimb(upper, forearm, hand.position, 0.318, 0.308);
      hand.rotation.set(lerp(swing * 0.21, wind ? -0.43 : -0.08, cast),
        wind ? side * -0.16 * cast : side * lerp(0.55, 0.06, cast), side * lerp(0.05, wind ? 0.30 : 0.12, cast));
      if (shield) {
        shield.guard.rotation.set(-0.12 * cast, lerp(-0.72, 0.05, cast), lerp(-0.11, 0.10, cast));
        shield.aura.visible = cast > 0.03;
        shield.aura.scale.setScalar(1.05 + cast * 0.54);
        shield.luminous.opacity = cast * (0.17 + Math.sin(time * 8.3) * 0.035);
        shield.rimMaterial.opacity = cast * 0.78;
      }
    }
    for (const { side, thigh, shin, foot } of legs) {
      const phase = beat + (side === 1 ? Math.PI : 0);
      const step = Math.sin(phase);
      start.set(side * (wind ? 0.129 : 0.166), 0.008, 0).applyEuler(body.rotation).add(body.position);
      const front = side < 0 ? 0.21 : -0.21;
      foot.position.set(side * lerp(wind ? 0.127 : 0.164, wind ? 0.169 : 0.252, cast),
        0.083 + Math.max(0, step) * stride * 0.123, step * stride * 0.25 + cast * front);
      bend.set(side * 0.075, 0, 1);
      poseLimb(thigh, shin, foot.position, 0.475, 0.449);
      foot.rotation.set(Math.max(0, step) * stride * -0.23, side * lerp(0.11, 0.24, cast), 0);
    }
    field.position.copy(arms[0].hand.position).lerp(arms[1].hand.position, 0.5);
  }

  update();
  return { object, update, anchors: { leftWrist, rightWrist, field } };
}
