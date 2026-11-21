import * as THREE from 'three';

const facet = new THREE.IcosahedronGeometry(1, 0);
const rock = new THREE.IcosahedronGeometry(1, 1);
const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(1, 10, 8);
const Y = new THREE.Vector3(0, 1, 0);

function finish(color, metalness = 0, roughness = 0.58, emissive = 0, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({color, metalness, roughness, emissive, emissiveIntensity, flatShading: true});
}

function group(parent, x = 0, y = 0, z = 0) {
  const result = new THREE.Group();
  result.position.set(x, y, z);
  parent.add(result);
  return result;
}

function part(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(x, y, z);
  result.scale.set(sx, sy, sz);
  result.castShadow = true;
  result.receiveShadow = true;
  parent.add(result);
  return result;
}

// Cross-sections progress upward, with independently sized front and side faces.
function shell(parent, material, rings, x = 0, y = 0, z = 0, sides = 8) {
  const positions = [];
  const indices = [];
  for (const [height, width, depth, offset = 0] of rings) {
    for (let i = 0; i < sides; i++) {
      const angle = (i + 0.5) / sides * 2 * Math.PI;
      positions.push(Math.sin(angle) * width, height, offset + Math.cos(angle) * depth);
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let i = 0; i < sides; i++) {
      const a = ring * sides + i;
      const b = ring * sides + (i + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const top = (rings.length - 1) * sides;
  for (let i = 1; i < sides - 1; i++) {
    indices.push(0, i + 1, i, top, top + i, top + i + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return part(parent, geometry, material, x, y, z);
}

function bar(parent, material, from, to, base, tip = base, sides = 6) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const direction = b.clone().sub(a);
  const middle = a.addScaledVector(direction, 0.5);
  const geometry = new THREE.CylinderGeometry(tip, base, direction.length(), sides, 1);
  const result = part(parent, geometry, material, ...middle.toArray());
  result.quaternion.setFromUnitVectors(Y, direction.normalize());
  return result;
}

function line(parent, material, points, width) {
  for (let i = 1; i < points.length; i++) {
    bar(parent, material, points[i - 1], points[i], width, width, 5);
  }
}

function plate(parent, material, points, depth, bevel) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  return part(parent, new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, steps: 1,
  }), material, 0, 0, -depth / 2);
}

function attackCurve(attack) {
  return Math.sin(Math.PI * attack) ** 2;
}

export function createKnight() {
  const object = new THREE.Group();
  const pose = group(object);
  const armor = finish(0x345779, 0.58, 0.39);
  const steel = finish(0xabc4d5, 0.7, 0.35);
  const dark = finish(0x101c2a, 0.28, 0.61);
  const copper = finish(0xd29958, 0.7, 0.37);
  const cyan = finish(0x64e9ff, 0.32, 0.34, 0x1bcaff, 1.6);
  const blade = finish(0xa5dff5, 0.68, 0.27, 0x3286ae, 0.16);
  const fabric = finish(0x12304d, 0.08, 0.85);

  shell(pose, dark, [[-0.12, 0.26, 0.16], [0.06, 0.31, 0.19], [0.19, 0.24, 0.16]], 0, 1.15);
  shell(pose, copper, [[0, 0.30, 0.19], [0.05, 0.32, 0.19], [0.08, 0.30, 0.19]], 0, 1.18);
  part(pose, facet, steel, 0, 1.22, 0.20, 0.10, 0.075, 0.055);

  const torso = group(pose, 0, 1.22);
  shell(torso, armor, [[0, 0.23, 0.19], [0.12, 0.29, 0.21], [0.42, 0.45, 0.25], [0.54, 0.34, 0.18], [0.59, 0.17, 0.15]]);
  shell(torso, steel, [[0.29, 0.23, 0.085], [0.39, 0.35, 0.10], [0.48, 0.34, 0.082], [0.51, 0.25, 0.04]], 0, 0, 0.173);
  for (const side of [-1, 1]) {
    line(torso, cyan, [[side * 0.055, 0.23, 0.217], [side * 0.15, 0.30, 0.246], [side * 0.24, 0.37, 0.258]], 0.011);
  }
  part(torso, facet, dark, 0, 0.36, 0.265, 0.11, 0.125, 0.064);
  part(torso, facet, cyan, 0, 0.365, 0.308, 0.056, 0.067, 0.030);

  const head = group(torso, 0, 0.60);
  shell(head, dark, [[0, 0.11, 0.11], [0.08, 0.15, 0.14]], 0, 0.008);
  shell(head, steel, [[0.075, 0.12, 0.142], [0.16, 0.195, 0.19], [0.36, 0.195, 0.165], [0.46, 0.115, 0.102]], 0, 0, 0.012);
  shell(head, armor, [[0.21, 0.178, 0.07], [0.295, 0.197, 0.08], [0.34, 0.165, 0.062]], 0, 0, 0.108);
  part(head, facet, dark, 0, 0.254, 0.189, 0.195, 0.053, 0.038);
  for (const side of [-1, 1]) {
    line(head, cyan, [[side * 0.018, 0.257, 0.223], [side * 0.103, 0.263, 0.211], [side * 0.16, 0.288, 0.181]], 0.012);
    bar(head, armor, [side * 0.147, 0.29, -0.038], [side * 0.196, 0.48, -0.102], 0.061, 0.006, 4);
    bar(head, copper, [side * 0.107, 0.15, 0.151], [side * 0.056, 0.126, 0.178], 0.013);
  }
  shell(head, copper, [[0.36, 0.028, 0.154], [0.46, 0.025, 0.113], [0.49, 0.008, 0.035]], 0, 0, -0.012, 4);

  const mantle = group(torso, 0, 0.45, -0.18);
  const cloak = plate(mantle, fabric, [[-0.36, 0], [0.36, 0], [0.43, -1.12], [0.21, -1.04], [0, -1.16], [-0.25, -1.1], [-0.41, -1.18]], 0.031, 0.018);
  cloak.rotation.x = 0.16;
  line(mantle, copper, [[-0.28, -0.12, -0.04], [-0.22, -0.34, -0.084], [0, -0.51, -0.116], [0.22, -0.34, -0.084], [0.28, -0.12, -0.04]], 0.011);

  const arms = [-1, 1].map(side => {
    const shoulder = group(torso, side * 0.42, 0.43);
    const pauldron = shell(shoulder, steel, [[-0.15, 0.24, 0.22], [-0.02, 0.26, 0.235], [0.13, 0.18, 0.18], [0.19, 0.10, 0.105]], side * 0.03, 0.034);
    pauldron.rotation.z = side * -0.17;
    shell(shoulder, armor, [[-0.23, 0.18, 0.172], [-0.13, 0.24, 0.205], [-0.07, 0.235, 0.21]]);
    part(shoulder, facet, cyan, side * 0.025, 0.009, 0.223, 0.103, 0.031, 0.035);
    shell(shoulder, dark, [[-0.36, 0.108, 0.112], [-0.11, 0.135, 0.14]]);
    const elbow = group(shoulder, 0, -0.34);
    part(elbow, sphere, dark, 0, 0, 0, 0.116, 0.112, 0.115);
    shell(elbow, armor, [[-0.36, 0.092, 0.100], [-0.26, 0.125, 0.13], [-0.09, 0.137, 0.135], [-0.045, 0.105, 0.108]]);
    part(elbow, facet, steel, 0, -0.16, 0.10, 0.116, 0.17, 0.064);
    part(elbow, facet, dark, 0, -0.385, 0.015, 0.103, 0.115, 0.106);
    return {shoulder, elbow, side};
  });

  const weapon = group(arms[1].elbow, 0, -0.385, 0.035);
  bar(weapon, dark, [0, -0.13, 0], [0, 0.24, 0], 0.051, 0.049, 8);
  part(weapon, facet, copper, 0, -0.14, 0, 0.086, 0.07, 0.067);
  plate(weapon, copper, [[-0.29, 0.18], [-0.18, 0.28], [0, 0.23], [0.18, 0.28], [0.29, 0.18], [0.18, 0.147], [0, 0.174], [-0.18, 0.147]], 0.073, 0.015);
  plate(weapon, blade, [[-0.116, 0.22], [-0.145, 0.42], [-0.102, 1.22], [0, 1.48], [0.102, 1.22], [0.145, 0.42], [0.116, 0.22]], 0.061, 0.032);
  for (const depth of [-1, 1]) {
    bar(weapon, cyan, [0, 0.39, depth * 0.052], [0, 1.25, depth * 0.052], 0.022, 0.009, 4);
  }
  part(weapon, facet, cyan, 0, 0.28, 0.052, 0.064, 0.089, 0.04);

  const legs = [-1, 1].map(side => {
    const hip = group(pose, side * 0.166, 1.06);
    shell(hip, armor, [[-0.44, 0.098, 0.111], [-0.31, 0.146, 0.143], [-0.05, 0.152, 0.15], [0.046, 0.112, 0.12]]);
    const knee = group(hip, 0, -0.46);
    part(knee, sphere, dark, 0, 0, 0, 0.12, 0.106, 0.106);
    part(knee, facet, steel, 0, 0, 0.105, 0.122, 0.116, 0.079);
    shell(knee, armor, [[-0.435, 0.081, 0.092], [-0.36, 0.107, 0.117], [-0.09, 0.125, 0.132], [-0.034, 0.107, 0.09]]);
    bar(knee, cyan, [0, -0.33, 0.113], [0, -0.14, 0.132], 0.012, 0.017);
    const foot = group(knee, 0, -0.44);
    shell(foot, steel, [[-0.158, 0.115, 0.176, 0.059], [-0.108, 0.12, 0.181, 0.063], [-0.033, 0.112, 0.166, 0.057], [0.055, 0.079, 0.102, 0.009]]);
    return {hip, knee, foot, side};
  });

  function update({time, gait, attack, impact}) {
    const stride = time * 10.8;
    const strike = attackCurve(attack);
    const swing = Math.sin((attack - 0.48) * 2.8) * strike;
    pose.position.y = 0.014 + Math.sin(time * 3.1) * 0.012 + Math.abs(Math.sin(stride)) * 0.051 * gait;
    pose.rotation.set(-0.17 * gait - 0.22 * strike + 0.27 * impact, 0, impact * -0.15);
    torso.rotation.y = Math.sin(stride) * 0.11 * gait - swing * 1.44;
    head.rotation.set(0.045 + 0.08 * strike, Math.sin(time * 1.75) * 0.07 + swing * 0.44, 0);
    mantle.rotation.x = 0.04 + Math.sin(time * 3.4) * 0.09 + 0.26 * gait;

    for (const {hip, knee, foot, side} of legs) {
      const step = Math.sin(stride + (side === 1 ? Math.PI : 0));
      hip.rotation.set(step * 0.46 * gait - 0.06 - 0.25 * strike, 0, side * 0.063);
      knee.rotation.x = 0.08 + Math.max(0, -step) * 0.62 * gait + 0.26 * strike;
      foot.rotation.x = -(hip.rotation.x + knee.rotation.x) * 0.78;
    }
    for (const {shoulder, elbow, side} of arms) {
      shoulder.rotation.set(-0.20 + side * Math.sin(stride) * 0.33 * gait - strike * (side === 1 ? 0.82 : 0.18),
        side === 1 ? -swing * 1.95 : 0.3 * strike, side * (0.19 + 0.35 * strike));
      elbow.rotation.x = -0.29 - strike * (side === 1 ? 0.61 : 0.22);
    }
    weapon.rotation.set(0.94 + strike * 0.53, 0.16, -0.23 + swing * 1.5);
  }

  update({time: 0, gait: 0, attack: 0, impact: 0});
  return {object, update};
}

export function createBeast() {
  const object = new THREE.Group();
  const pose = group(object);
  const hide = finish(0x392420, 0.09, 0.83, 0x4a0e00, 0.3);
  const obsidian = finish(0x3d3331, 0.28, 0.75);
  const basalt = finish(0x765344, 0.13, 0.74);
  const bone = finish(0xd3a37a, 0.14, 0.53);
  const coal = finish(0x1d1514, 0.16, 0.68);
  const magma = finish(0xff5420, 0.25, 0.58, 0xff3200, 1.0);
  const hot = finish(0xffc771, 0.24, 0.37, 0xff7a21, 1.8);

  const torso = group(pose, 0, 1.02, -0.08);
  part(torso, rock, hide, 0, 0.015, -0.055, 0.41, 0.36, 0.73);
  part(torso, rock, obsidian, 0, 0.145, 0.34, 0.48, 0.41, 0.48);
  part(torso, rock, hide, 0, -0.015, -0.50, 0.395, 0.35, 0.43);
  part(torso, rock, basalt, 0, -0.15, 0.37, 0.32, 0.25, 0.39);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.47 - i * 0.29;
      const width = i === 0 ? 0.40 : 0.34;
      const ridge = part(torso, facet, i % 2 ? basalt : obsidian, side * width, 0.08 + (i % 2) * 0.08, z, 0.156, 0.29, 0.27);
      ridge.rotation.set(0.34, side * -0.20, side * -0.30);
      line(torso, magma, [[side * (width + 0.068), -0.08, z + 0.10], [side * (width + 0.13), 0.03, z + 0.015], [side * (width + 0.085), 0.17, z - 0.10]], 0.017);
    }
  }

  for (let i = 0; i < 6; i++) {
    const z = 0.49 - i * 0.21;
    const height = 0.48 - i * 0.032;
    part(torso, facet, magma, 0, height - 0.092, z, 0.24, 0.11, 0.145);
    const spine = part(torso, facet, i < 2 ? basalt : obsidian, 0, height, z, 0.23 - i * 0.014, 0.21 - i * 0.018, 0.175);
    spine.rotation.x = -0.47;
  }

  const neck = group(torso, 0, 0.20, 0.56);
  part(neck, rock, obsidian, 0, 0, 0.102, 0.33, 0.29, 0.32);
  const skull = group(neck, 0, 0.025, 0.19);
  part(skull, rock, basalt, 0, 0.034, 0.09, 0.32, 0.26, 0.36);
  part(skull, facet, obsidian, 0, -0.047, 0.35, 0.225, 0.154, 0.25);
  part(skull, rock, coal, 0, -0.04, 0.539, 0.134, 0.076, 0.071);
  const jaw = group(skull, 0, -0.118, 0.053);
  part(jaw, facet, coal, 0, -0.055, 0.205, 0.242, 0.113, 0.321);
  part(jaw, facet, magma, 0, -0.012, 0.246, 0.179, 0.065, 0.264);
  for (const side of [-1, 1]) {
    const eye = part(skull, facet, hot, side * 0.247, 0.055, 0.258, 0.089, 0.056, 0.082);
    eye.rotation.z = side * 0.24;
    const brow = part(skull, facet, obsidian, side * 0.211, 0.137, 0.246, 0.15, 0.088, 0.151);
    brow.rotation.z = side * 0.27;
    part(skull, facet, hide, side * 0.229, -0.063, 0.19, 0.115, 0.15, 0.22);
    line(skull, magma, [[side * 0.268, 0.114, 0.064], [side * 0.23, 0.226, 0.122], [side * 0.132, 0.251, 0.149]], 0.016);
    bar(skull, basalt, [side * 0.215, 0.146, 0.005], [side * 0.366, 0.302, -0.08], 0.118, 0.086);
    bar(skull, bone, [side * 0.361, 0.295, -0.073], [side * 0.428, 0.438, -0.185], 0.087, 0.045);
    bar(skull, bone, [side * 0.427, 0.434, -0.18], [side * 0.417, 0.523, -0.298], 0.045, 0.004);
    bar(skull, bone, [side * 0.16, -0.105, 0.395], [side * 0.168, -0.25, 0.418], 0.054, 0.005, 5);
    for (let i = 0; i < 3; i++) {
      const z = 0.21 + i * 0.072;
      bar(jaw, bone, [side * 0.176, -0.024, z], [side * 0.163, 0.039, z + 0.013], 0.027, 0.003, 5);
    }
  }

  const legs = [];
  for (const front of [true, false]) {
    for (const side of [-1, 1]) {
      const hip = group(pose, side * (front ? 0.35 : 0.30), front ? 1.05 : 0.94, front ? 0.40 : -0.60);
      const upper = front ? 0.47 : 0.40;
      const lower = front ? 0.44 : 0.40;
      part(hip, rock, hide, 0, -0.21, front ? -0.025 : 0.04, 0.215, 0.36, 0.23);
      part(hip, facet, basalt, side * 0.075, -0.123, 0.058, 0.179, 0.25, 0.211);
      const shin = group(hip, 0, -upper);
      part(shin, facet, obsidian, 0, -lower * 0.46, 0.01, 0.143, lower * 0.66, 0.145);
      part(shin, facet, magma, side * 0.098, -lower * 0.40, 0.076, 0.056, lower * 0.37, 0.056);
      const paw = group(shin, 0, -lower);
      part(paw, rock, coal, 0, -0.025, 0.068, 0.163, 0.111, 0.225);
      for (let digit = -1; digit <= 1; digit++) {
        bar(paw, bone, [digit * 0.083, -0.014, 0.19], [digit * 0.097, -0.076, 0.294], 0.045, 0.005, 5);
      }
      legs.push({hip, shin, paw, side, front});
    }
  }

  const tail = group(pose, 0, 0.99, -0.79);
  const tailRings = [tail];
  for (let i = 0; i < 4; i++) {
    const joint = tailRings[i];
    const radius = 0.175 - i * 0.032;
    const length = 0.23 - i * 0.025;
    part(joint, facet, i === 3 ? basalt : obsidian, 0, 0, -length * 0.45, radius, radius * 0.88, length * 0.78);
    part(joint, facet, i === 3 ? hot : magma, 0, radius * 0.6, -length * 0.56, radius * 0.7, radius * 0.65, length * 0.43);
    if (i < 3) tailRings.push(group(joint, 0, 0.014, -length));
  }

  function update({time, gait, attack, impact}) {
    const stride = time * 12;
    const bite = attackCurve(attack);
    const anticipation = Math.sin(Math.PI * Math.min(1, attack * 2.3)) * (1 - attack);
    pose.position.y = Math.sin(time * 4) * 0.018 + Math.abs(Math.sin(stride)) * 0.050 * gait - 0.14 * anticipation + 0.065 * bite;
    pose.rotation.set(-0.07 * gait + 0.24 * anticipation - 0.26 * bite + 0.13 * impact, 0, -0.09 * impact);
    torso.rotation.y = Math.sin(stride) * 0.07 * gait - bite * 0.13;
    neck.rotation.x = 0.04 + Math.sin(time * 3.2) * 0.046 - 0.13 * gait + 0.15 * bite;
    skull.rotation.y = Math.sin(time * 1.5) * 0.1 * (1 - gait) + impact * 0.19;
    jaw.rotation.x = 0.055 + Math.sin(time * 4) * 0.04 + 0.74 * bite;

    for (const {hip, shin, paw, side, front} of legs) {
      const step = Math.sin(stride + (front === (side === 1) ? Math.PI : 0));
      const reach = front ? -0.42 * bite * (side === 1 ? 1 : 0.59) : 0.17 * bite;
      hip.rotation.set((front ? 0.11 : -0.17) + step * 0.50 * gait + reach, 0, side * 0.11);
      shin.rotation.x = (front ? -0.12 : 0.23) + Math.max(0, -step) * 0.47 * gait;
      paw.rotation.x = -(hip.rotation.x + shin.rotation.x) * 0.77;
    }
    tailRings.forEach((joint, index) => {
      joint.rotation.y = Math.sin(time * 3.4 - index * 0.65) * (0.16 + 0.12 * gait);
      joint.rotation.x = 0.17 + 0.14 * Math.sin(time * 2.8 - index * 0.5) + 0.12 * bite;
    });
  }

  update({time: 0, gait: 0, attack: 0, impact: 0});
  return {object, update};
}
