import * as THREE from 'three';

const facet = new THREE.IcosahedronGeometry(1, 0);
const shell = new THREE.IcosahedronGeometry(1, 1);
const block = new THREE.BoxGeometry(1, 1, 1);
const trunk = new THREE.CylinderGeometry(0.78, 0.55, 1, 8);
const vertical = new THREE.Vector3(0, 1, 0);
const downward = new THREE.Vector3(0, -1, 0);
const { clamp, lerp, smoothstep } = THREE.MathUtils;

const palettes = {
  rewind: [0x1d203d, 0x37395a, 0x696b9c, 0xe9d5ac, 0xb59bff, 0x292544],
  grove: [0x20291b, 0x47432c, 0x69783b, 0xa67a4b, 0xd6f486, 0x354832],
};

function joint(parent, x = 0, y = 0, z = 0) {
  const object = new THREE.Group();
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function mesh(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.scale.set(sx, sy, sz);
  object.castShadow = !material.transparent;
  parent.add(object);
  return object;
}

function plate(parent, material, points, x, y, z, depth = 0.019) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.005, bevelSegments: 1,
  });
  return mesh(parent, geometry, material, x, y, z);
}

function materials(id) {
  const finish = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
  const [suit, armor, light, trim, glow, visor] = palettes[id];
  const grove = id === 'grove';
  return {
    suit: finish(suit, 0.08, 0.82), armor: finish(armor, grove ? 0.14 : 0.5, grove ? 0.72 : 0.42),
    light: finish(light, grove ? 0.16 : 0.43, grove ? 0.58 : 0.41), trim: finish(trim, grove ? 0.26 : 0.63, 0.45),
    visor: finish(visor, 0.42, 0.36),
    glow: new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: grove ? 0.42 : 0.59, roughness: 0.42, flatShading: true }),
  };
}

function branch(parent, material, from, to, width, end = width * 0.64) {
  const axis = new THREE.Vector3().subVectors(to, from);
  const midpoint = from.clone().addScaledVector(axis, 0.5);
  const part = mesh(parent, new THREE.CylinderGeometry(end, width, axis.length(), 5), material, midpoint.x, midpoint.y, midpoint.z);
  part.quaternion.setFromUnitVectors(vertical, axis.normalize());
}

const leafShape = [[0, 0], [0.065, 0.056], [0.086, 0.142], [0.046, 0.223], [0.004, 0.275], [-0.046, 0.173], [-0.056, 0.085]];

function addLeaf(parent, mat, point, angle, scale, lit = false) {
  const leaf = joint(parent, point.x, point.y, point.z);
  leaf.rotation.set(0.23, -0.29, angle);
  leaf.scale.setScalar(scale);
  plate(leaf, lit ? mat.glow : mat.light, leafShape, 0, 0, 0, 0.008);
  plate(leaf, mat.trim, [[-0.012, 0.014], [0.01, 0.018], [0.016, 0.13], [0.006, 0.242], [-0.004, 0.13]], 0, 0, 0.013, 0.004);
  return { leaf, angle };
}

function buildGroveBack(body, mat) {
  const boughs = [];
  const leaves = [];
  for (const side of [-1, 1]) {
    const long = side < 0 ? 1 : 0.74;
    const bough = joint(body, side * 0.19, 0.39, -0.16);
    const base = new THREE.Vector3();
    const fork = new THREE.Vector3(side * 0.23, 0.19 * long, -0.09);
    const upper = new THREE.Vector3(side * 0.42, 0.48 * long, -0.15);
    const spur = new THREE.Vector3(side * 0.54, 0.29 * long, -0.23);
    branch(bough, mat.armor, base, fork, 0.074, 0.049);
    branch(bough, mat.trim, fork, upper, 0.05, 0.017);
    branch(bough, mat.armor, fork, spur, 0.047, 0.015);
    branch(bough, mat.trim, upper, new THREE.Vector3(side * 0.47, 0.58 * long, -0.15), 0.022, 0.003);
    leaves.push(addLeaf(bough, mat, upper, side * -0.74, 0.95, true));
    leaves.push(addLeaf(bough, mat, spur, side * -1.45, 1.13));
    leaves.push(addLeaf(bough, mat, fork, side * -0.95, 0.79));
    boughs.push({ bough, side });
  }
  const branchRoot = joint(body, -0.075, 0.20, -0.18);
  branch(branchRoot, mat.trim, new THREE.Vector3(), new THREE.Vector3(-0.19, -0.39, -0.08), 0.067, 0.035);
  leaves.push(addLeaf(branchRoot, mat, new THREE.Vector3(-0.19, -0.39, -0.08), 2.54, 0.95, true));
  return { boughs, leaves };
}

function buildClockwork(body, mat) {
  const mounting = joint(body, -0.065, 0.53, -0.23);
  mounting.rotation.set(-0.1, -0.14, -0.28);
  const dial = joint(mounting);
  const ring = new THREE.TorusGeometry(0.408, 0.019, 5, 40, Math.PI * 1.72);
  mesh(dial, ring, mat.trim, 0, 0, 0);
  mesh(dial, new THREE.TorusGeometry(0.318, 0.009, 4, 36, Math.PI * 1.54), mat.light, 0, 0, -0.038).rotation.z = 1.33;
  for (let index = 0; index < 10; index++) {
    const angle = index * Math.PI / 5;
    const length = index % 5 === 0 ? 0.097 : 0.057;
    const tooth = mesh(dial, block, index % 5 === 0 ? mat.glow : mat.trim,
      Math.sin(angle) * 0.404, Math.cos(angle) * 0.404, 0.005, 0.025, length, 0.026);
    tooth.rotation.z = -angle;
  }
  const pivot = joint(mounting);
  plate(pivot, mat.trim, [[-0.019, -0.067], [0.017, -0.067], [0.009, 0.259], [0, 0.29], [-0.012, 0.258]], 0, 0, 0.025);
  mesh(pivot, facet, mat.glow, 0, 0, 0.047, 0.043, 0.043, 0.024);

  const coat = [];
  for (const side of [-1, 1]) {
    const tail = joint(body, side * 0.145, 0.033, -0.095);
    const length = side < 0 ? 0.79 : 0.57;
    const mirror = points => points.map(([x, y]) => [x * side, y]);
    plate(tail, mat.armor, mirror([[0, 0.033], [0.11, 0.071], [0.26, -length * 0.82], [0.12, -length], [0.004, -length * 0.84]]), 0, 0, 0, 0.025);
    plate(tail, mat.light, mirror([[0.10, 0.044], [0.135, 0.009], [0.228, -length * 0.80], [0.123, -length * 0.94], [0.157, -length * 0.70]]), 0, 0, 0.027, 0.008);
    plate(tail, mat.trim, mirror([[0.049, -0.056], [0.073, -0.045], [0.104, -length * 0.86], [0.085, -length * 0.89]]), 0, 0, 0.033, 0.006);
    coat.push({ tail, side });
  }
  return { dial, pivot, coat };
}

function buildTorso(body, mat, grove) {
  mesh(body, shell, mat.suit, 0, 0.025, 0, 0.2, 0.142, 0.144);
  mesh(body, trunk, mat.armor, 0, 0.325, -0.021, grove ? 0.37 : 0.32, 0.51, 0.204);
  mesh(body, shell, mat.suit, 0, 0.58, 0.009, 0.105, 0.12, 0.091);
  mesh(body, block, mat.trim, 0, 0.13, 0.017, 0.367, 0.045, 0.251);
  if (grove) {
    const chest = [[-0.288, 0.489], [-0.163, 0.552], [0.062, 0.529], [0.263, 0.427], [0.151, 0.267], [-0.075, 0.229], [-0.242, 0.317]];
    plate(body, mat.light, chest, 0, 0, 0.143, 0.047);
    plate(body, mat.trim, [[-0.212, 0.457], [-0.061, 0.495], [0.088, 0.394], [0.143, 0.291], [0.093, 0.28], [0.013, 0.386]], 0, 0, 0.191);
    plate(body, mat.glow, [[-0.119, 0.466], [-0.04, 0.472], [0.008, 0.392], [-0.047, 0.347], [-0.104, 0.376]], 0, 0, 0.208, 0.01);
    for (const [x, y, angle, size] of [[-0.243, 0.468, -0.77, 0.77], [0.135, 0.416, 0.71, 0.61], [0.11, 0.302, 1.65, 0.48]]) {
      addLeaf(body, mat, new THREE.Vector3(x, y, 0.185), angle, size, x < 0);
    }
  } else {
    plate(body, mat.light, [[-0.28, 0.49], [-0.16, 0.562], [0.103, 0.517], [0.232, 0.445], [0.129, 0.247], [-0.19, 0.268]], 0, 0, 0.129, 0.042);
    plate(body, mat.trim, [[-0.253, 0.484], [-0.118, 0.523], [0.15, 0.37], [0.117, 0.324], [-0.192, 0.423]], 0, 0, 0.179, 0.012);
    const brooch = mesh(body, new THREE.TorusGeometry(0.071, 0.013, 5, 18), mat.trim, -0.092, 0.423, 0.208);
    brooch.rotation.z = -0.32;
    mesh(body, facet, mat.glow, -0.092, 0.423, 0.222, 0.044, 0.042, 0.019);
    plate(body, mat.armor, [[0.088, 0.26], [0.193, 0.347], [0.233, 0.308], [0.129, 0.194]], 0, 0, 0.151, 0.022);
  }

  const head = joint(body, 0, 0.653, 0.017);
  mesh(head, shell, mat.suit, 0, 0.156, 0.006, 0.153, 0.196, 0.14);
  mesh(head, shell, mat.light, 0, 0.217, -0.025, 0.157, 0.169, 0.137);
  if (grove) {
    plate(head, mat.trim, [[-0.151, 0.216], [-0.087, 0.299], [0.108, 0.287], [0.157, 0.202], [0.074, 0.075], [0, 0.038], [-0.11, 0.106]], 0, 0, 0.12, 0.027);
    plate(head, mat.visor, [[-0.13, 0.203], [-0.04, 0.212], [0.124, 0.193], [0.081, 0.141], [-0.094, 0.144]], 0, 0, 0.153, 0.018);
    for (const side of [-1, 1]) {
      const points = [[0.018, 0.187], [0.109, 0.196], [0.086, 0.165], [0.027, 0.159]].map(([x, y]) => [x * side, y]);
      plate(head, mat.glow, points, 0, 0, 0.172, 0.006);
    }
    addLeaf(head, mat, new THREE.Vector3(-0.105, 0.283, -0.059), 0.56, 0.55, true);
    addLeaf(head, mat, new THREE.Vector3(0.105, 0.279, -0.09), -0.68, 0.44);
  } else {
    plate(head, mat.visor, [[-0.149, 0.22], [-0.08, 0.235], [0.146, 0.209], [0.11, 0.124], [-0.071, 0.095], [-0.125, 0.126]], 0, 0, 0.12, 0.027);
    plate(head, mat.glow, [[-0.124, 0.2], [0.128, 0.187], [0.109, 0.154], [-0.098, 0.163]], 0, 0, 0.149, 0.006);
    plate(head, mat.trim, [[-0.162, 0.221], [-0.116, 0.31], [-0.025, 0.353], [0.148, 0.281], [0.103, 0.24], [-0.047, 0.27]], 0, 0, 0.104, 0.028);
    mesh(head, new THREE.TorusGeometry(0.075, 0.012, 5, 16), mat.trim, 0.155, 0.18, -0.005).rotation.y = Math.PI / 2;
    mesh(head, facet, mat.trim, -0.148, 0.155, 0.009, 0.038, 0.072, 0.06);
  }
  return head;
}

function buildArm(root, mat, grove, side) {
  const upper = joint(root);
  const fore = joint(root);
  const hand = joint(root);
  const bulk = grove ? 1.11 : 0.91;
  mesh(upper, shell, mat.suit, 0, -0.148, 0, 0.079 * bulk, 0.173, 0.073 * bulk);
  mesh(upper, facet, grove ? mat.light : mat.trim, side * 0.025, -0.037, 0.022, 0.113 * bulk, 0.126, 0.104 * bulk).rotation.z = side * 0.35;
  mesh(fore, shell, mat.armor, 0, -0.149, 0, 0.084 * bulk, 0.167, 0.083 * bulk);
  mesh(fore, facet, grove ? mat.trim : mat.light, side * 0.02, -0.166, 0.05, 0.089 * bulk, 0.14, 0.053);
  mesh(fore, block, mat.glow, 0, -0.194, 0.095, 0.035, 0.067, 0.011).rotation.z = side * 0.18;
  mesh(hand, shell, mat.suit, 0, -0.023, 0.013, 0.059 * bulk, 0.064, 0.061);
  mesh(hand, facet, mat.trim, 0, -0.012, 0.051, 0.057 * bulk, 0.047, 0.028);
  const wrist = joint(hand, 0, 0, 0.05);
  if (!grove && side > 0) {
    const cuff = mesh(hand, new THREE.TorusGeometry(0.093, 0.01, 4, 22, Math.PI * 1.68), mat.trim, 0, 0.048, 0.017);
    cuff.rotation.set(Math.PI / 2, 0.11, 0.55);
  }
  if (grove) addLeaf(fore, mat, new THREE.Vector3(side * 0.055, -0.182, 0.06), side * -0.49, 0.44);
  return { side, upper, fore, hand, wrist };
}

function buildLeg(root, mat, grove, side) {
  const upper = joint(root);
  const shin = joint(root);
  const foot = joint(root);
  const bulk = grove ? 1.1 : 0.95;
  mesh(upper, shell, mat.suit, 0, -0.202, 0, 0.106 * bulk, 0.254, 0.098);
  mesh(upper, facet, mat.armor, side * 0.023, -0.166, 0.062, 0.089 * bulk, 0.192, 0.065);
  mesh(shin, shell, mat.suit, 0, -0.171, 0, 0.082 * bulk, 0.235, 0.081);
  mesh(shin, facet, mat.light, side * 0.021, -0.203, 0.058, 0.084 * bulk, 0.193, 0.062);
  mesh(shin, facet, mat.trim, side * 0.008, -0.044, 0.082, 0.075, 0.091, 0.05);
  mesh(foot, shell, mat.armor, 0, -0.014, 0.062, 0.086 * bulk, 0.067, 0.15);
  mesh(foot, block, mat.suit, 0, -0.052, 0.053, 0.163 * bulk, 0.04, 0.251);
  mesh(foot, facet, mat.trim, 0, -0.01, 0.14, 0.065 * bulk, 0.044, 0.071);
  return { side, upper, shin, foot };
}

export function createEpochHero(id) {
  if (!(id === 'rewind' || id === 'grove')) throw new Error(`Unknown epoch hero: ${id}`);
  const grove = id === 'grove';
  const object = new THREE.Group();
  object.name = `${id}-hero`;
  const mat = materials(id);
  const body = joint(object);
  const head = buildTorso(body, mat, grove);
  const growth = grove ? buildGroveBack(body, mat) : null;
  const clockwork = grove ? null : buildClockwork(body, mat);
  const arms = [-1, 1].map(side => buildArm(object, mat, grove, side));
  const legs = [-1, 1].map(side => buildLeg(object, mat, grove, side));
  const anchors = { leftWrist: arms[0].wrist, rightWrist: arms[1].wrist, field: joint(object) };
  anchors.field.name = `${id}-field`;

  const start = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const midpoint = new THREE.Vector3();

  function orient(limb, from, to, length) {
    limb.position.copy(from);
    axis.subVectors(to, from);
    limb.scale.y = axis.length() / length;
    limb.quaternion.setFromUnitVectors(downward, axis.normalize());
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
    const cast = smoothstep(power, 0, 1);
    const stride = clamp(running, 0, 1);
    const cycle = time * (grove ? 8.9 : 10.8);
    const breath = Math.sin(time * 3.11) * 0.008;
    body.position.set(Math.cos(cycle) * stride * 0.021 - cast * (grove ? 0.024 : 0),
      1.045 + breath + Math.cos(cycle * 2) * stride * 0.018 - cast * (grove ? 0.205 : 0.048), cast * (grove ? 0.074 : -0.051));
    body.rotation.set(stride * 0.15 + cast * (grove ? 0.19 : -0.063), cast * (grove ? 0.09 : -0.17) + stride * Math.sin(cycle) * 0.09, 0.03 * cast);
    head.rotation.set(-body.rotation.x * 0.73 + cast * (grove ? 0.13 : -0.05), -body.rotation.y * 0.47 + Math.sin(time * 1.6) * 0.052, 0.02 * cast);

    for (const { side, upper, fore, hand } of arms) {
      const swing = Math.sin(cycle) * side * stride * (carrying ? 0.16 : 1);
      start.set(side * (grove ? 0.264 : 0.247), 0.495, 0).applyEuler(body.rotation).add(body.position);
      const castX = grove ? side * (side < 0 ? 0.49 : 0.38) : side < 0 ? -0.43 : 0.218;
      const castY = grove ? (side < 0 ? 0.95 : 1.06) : side < 0 ? 1.43 : 1.75;
      const castZ = grove ? 0.44 : side < 0 ? 0.47 : 0.51;
      hand.position.set(lerp(side * (grove ? 0.321 : 0.277), castX, cast),
        lerp(0.907 + Math.max(0, swing) * 0.092, castY + Math.sin(time * 4.1 + side) * 0.013, cast),
        lerp(0.062 + swing * 0.24, castZ, cast));
      bend.set(side * 0.68, -0.79, -0.18);
      poseLimb(upper, fore, hand.position, 0.316, 0.31);
      hand.rotation.set(lerp(swing * 0.22, grove ? -0.73 : -0.35, cast), side * (0.28 - 0.17 * cast), side * 0.16 * cast);
    }
    for (const { side, upper, shin, foot } of legs) {
      const step = Math.sin(cycle + (side > 0 ? Math.PI : 0));
      start.set(side * (grove ? 0.149 : 0.136), -0.011, 0).applyEuler(body.rotation).add(body.position);
      foot.position.set(side * (grove ? 0.174 + 0.12 * cast : 0.158 + 0.063 * cast),
        0.081 + Math.max(0, step) * stride * 0.155,
        (side < 0 ? 0.038 : -0.047) + step * stride * 0.23 + (side < 0 ? 0.21 : -0.12) * cast);
      bend.set(side * 0.18, 0.06, 1);
      poseLimb(upper, shin, foot.position, 0.482, 0.478);
      foot.rotation.set(0, side * (0.057 + 0.12 * cast), 0);
    }
    anchors.field.position.copy(arms[0].hand.position).lerp(arms[1].hand.position, 0.5);
    anchors.field.position.z += grove ? 0.13 : 0.18;

    if (clockwork) {
      clockwork.dial.rotation.z = time * 0.33 - cast * 0.88;
      clockwork.pivot.rotation.z = time * -1.33 - cast * 0.77;
      for (const { tail, side } of clockwork.coat) {
        tail.rotation.set(0.10 + stride * 0.28 + cast * 0.12 + Math.sin(time * 3.9 + side) * 0.087,
          side * (0.16 + cast * 0.31), side * (0.08 + cast * 0.13) + Math.sin(time * 3.3 + side) * 0.06);
      }
    }
    if (growth) {
      for (const { bough, side } of growth.boughs) {
        bough.rotation.set(-0.14 * cast, side * (0.12 + cast * 0.16), side * (0.08 + cast * 0.28) + Math.sin(time * 2.6 + side) * 0.054);
      }
      for (const { leaf, angle } of growth.leaves) leaf.rotation.z = angle + Math.sin(time * 4.3 + angle) * (0.07 + cast * 0.10);
    }
  }

  update();
  return { object, update, anchors };
}
