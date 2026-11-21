import * as THREE from 'three';

const down = new THREE.Vector3(0, -1, 0);
const orb = new THREE.IcosahedronGeometry(1, 1);
const facet = new THREE.IcosahedronGeometry(1, 0);
const box = new THREE.BoxGeometry(1, 1, 1);
const thighLength = 0.43;
const shinLength = 0.39;

const suits = {
  gravity: {
    fabric: 0x252031, armor: 0x7c5037, plating: 0xe4b55e, trim: 0x3c2738,
    light: 0xffc568, skin: 0xb8795c, cloak: 0x593043, width: 1.12,
  },
  ice: {
    fabric: 0x142b40, armor: 0x427f9e, plating: 0xb7dbe5, trim: 0x19384a,
    light: 0x82edff, skin: 0x956655, cloak: 0x2b6275, width: 0.93,
  },
  portal: {
    fabric: 0x251e35, armor: 0x542d57, plating: 0x9e6d98, trim: 0x372740,
    light: 0xff80cd, skin: 0x8f644d, cloak: 0x382243, width: 1,
  },
};

function group(parent, x = 0, y = 0, z = 0) {
  const node = new THREE.Group();
  node.position.set(x, y, z);
  parent.add(node);
  return node;
}

function part(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = !material.transparent;
  parent.add(mesh);
  return mesh;
}

function plate(parent, material, corners, x, y, z, depth = 0.025) {
  const shape = new THREE.Shape();
  corners.forEach(([px, py], index) => index === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: depth * 0.34,
    bevelThickness: depth * 0.28,
  });
  return part(parent, geometry, material, x, y, z);
}

function finish(color, metalness = 0, roughness = 0.68) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
}

function fittedMaterials(suit) {
  return {
    fabric: finish(suit.fabric, 0.05),
    armor: finish(suit.armor, 0.42, 0.46),
    plating: finish(suit.plating, 0.5, 0.36),
    trim: finish(suit.trim, 0.26),
    skin: finish(suit.skin, 0.02, 0.82),
    glow: new THREE.MeshStandardMaterial({
      color: suit.light, emissive: suit.light, emissiveIntensity: 0.95, roughness: 0.46,
    }),
  };
}

function makeCloth(parent, color, trim, { length, startWidth, endWidth, x, y, z, spread }) {
  const columns = 9;
  const rows = 15;
  const coords = new Float32Array(columns * rows * 3);
  const colors = new Float32Array(coords.length);
  const indices = [];
  const fabric = new THREE.Color(color);
  const braid = new THREE.Color(trim);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      const bordered = column <= 1 || column >= columns - 2 || row === rows - 1;
      const tint = (bordered ? braid : fabric).clone().multiplyScalar(column % 2 ? 0.81 : 1);
      tint.toArray(colors, index * 3);
      if (row < rows - 1 && column < columns - 1) {
        indices.push(index, index + columns, index + 1, index + 1, index + columns, index + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(coords, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const cloth = part(parent, geometry, new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide, roughness: 0.79, metalness: 0.12,
  }), x, y, z);
  cloth.frustumCulled = false;

  return (time, power) => {
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1);
      const halfWidth = THREE.MathUtils.lerp(startWidth, endWidth + power * spread, v) * 0.5;
      for (let column = 0; column < columns; column++) {
        const u = column / (columns - 1) * 2 - 1;
        const index = (row * columns + column) * 3;
        coords[index] = u * halfWidth + x * v * (0.36 + power * 0.35);
        coords[index + 1] = -length * v + v * v * (0.06 + power * 0.34) + Math.abs(u) * v ** 5 * 0.14;
        coords[index + 2] = -v * (0.13 + power * 0.59) - v * Math.cos(u * 9 - time * 3 + v * 6) * (0.036 + power * 0.066);
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  };
}

function makeHead(torso, materials, id) {
  const { fabric, armor, plating, trim, skin, glow } = materials;
  const head = group(torso, 0, 0.66);
  part(head, orb, fabric, 0, 0.177, 0, 0.175, 0.225, 0.163);
  if (id === 'gravity') {
    part(head, orb, skin, 0, 0.097, 0.082, 0.131, 0.118, 0.099);
    part(head, facet, skin, 0, 0.123, 0.172, 0.038, 0.044, 0.027);
    part(head, box, trim, 0, 0.056, 0.17, 0.069, 0.012, 0.01);
  } else {
    plate(head, id === 'ice' ? plating : armor, [
      [-0.136, 0.16], [-0.063, 0.143], [0, 0.172], [0.063, 0.143], [0.136, 0.16],
      [0.108, 0.057], [0.057, 0.021], [-0.057, 0.021], [-0.108, 0.057],
    ], 0, 0, 0.108, 0.045);
    for (const side of [-1, 1]) {
      part(head, box, id === 'ice' ? trim : glow, side * 0.066, 0.108, 0.157, 0.061, 0.012, 0.014).rotation.z = side * 0.44;
    }
  }
  plate(head, trim, [
    [-0.148, 0.236], [-0.09, 0.257], [0.09, 0.257], [0.148, 0.236],
    [0.119, 0.172], [0.032, 0.183], [0, 0.203], [-0.032, 0.183], [-0.119, 0.172],
  ], 0, 0, 0.129, 0.035);
  for (const side of [-1, 1]) {
    part(head, box, glow, side * 0.073, 0.216, 0.171, 0.062, 0.012, 0.013).rotation.z = side * 0.15;
    part(head, facet, plating, side * 0.143, 0.146, 0.051, 0.056, 0.105, 0.085);
  }
  if (id === 'gravity') {
    plate(head, plating, [
      [-0.151, 0.235], [-0.167, 0.336], [-0.103, 0.29], [0, 0.412], [0.103, 0.29], [0.167, 0.336], [0.151, 0.235], [0, 0.283],
    ], 0, 0, 0.108);
    part(head, facet, glow, 0, 0.307, 0.146, 0.028, 0.044, 0.012);
  } else if (id === 'ice') {
    part(head, facet, plating, 0, 0.31, -0.025, 0.171, 0.131, 0.18).rotation.x = 0.36;
    for (const side of [-1, 1]) {
      part(head, facet, plating, side * 0.13, 0.26, -0.04, 0.068, 0.147, 0.122).rotation.z = side * -0.27;
    }
  } else {
    const ring = new THREE.TorusGeometry(0.238, 0.017, 5, 32, Math.PI * 1.58);
    part(head, ring, glow, 0, 0.211, -0.108).rotation.z = -Math.PI * 0.29;
    part(head, facet, plating, -0.082, 0.304, 0.04, 0.102, 0.094, 0.145).rotation.z = -0.39;
  }
  return head;
}

function makeArm(torso, materials, id, side, width) {
  const { fabric, armor, plating, trim, glow } = materials;
  const shoulder = group(torso, side * 0.33 * width, 0.49, 0);
  part(shoulder, orb, armor, 0, -0.09, 0, 0.116, 0.192, 0.113);
  if (id === 'ice') {
    for (let layer = 0; layer < 3; layer++) {
      const shard = part(shoulder, facet, layer === 1 ? glow : plating,
        side * (0.07 + layer * 0.06), 0.064 - layer * 0.069, -0.036 + layer * 0.012,
        0.098, 0.18 - layer * 0.016, 0.122);
      shard.rotation.z = -side * (0.45 + layer * 0.15);
    }
  } else if (id === 'gravity' || side < 0) {
    const guard = part(shoulder, facet, plating, side * 0.026, 0.038, 0, 0.212, 0.131, 0.166);
    guard.rotation.z = -side * 0.15;
    part(shoulder, box, glow, side * 0.028, 0.032, 0.136, 0.124, 0.024, 0.016).rotation.z = side * -0.25;
  } else {
    part(shoulder, orb, fabric, 0.011, 0.022, -0.016, 0.144, 0.123, 0.133);
    part(shoulder, new THREE.TorusGeometry(0.095, 0.012, 6, 16), glow, 0.022, 0.008, 0.109);
  }
  const elbow = group(shoulder, 0, -0.259);
  part(elbow, orb, fabric, 0, 0, 0, 0.089, 0.09, 0.085);
  part(elbow, orb, id === 'ice' ? plating : armor, 0, -0.102, 0.004, 0.094, 0.152, 0.096);
  part(elbow, box, glow, side * 0.031, -0.121, 0.088, 0.029, 0.148, 0.018).rotation.z = -side * 0.16;

  const palm = group(elbow, 0, -0.253, 0.007);
  part(palm, facet, trim, 0, -0.028, 0, 0.083, 0.088, 0.05);
  part(palm, facet, glow, 0, -0.031, 0.044, 0.042, 0.041, 0.013);
  const fingers = Array.from({ length: 4 }, (_, index) => {
    const finger = group(palm, (index - 1.5) * 0.032, -0.063, 0.009);
    part(finger, facet, armor, 0, -0.032, 0, 0.019, 0.052 - 0.009 * Math.abs(index - 1.5), 0.017);
    return finger;
  });
  part(palm, facet, armor, side * 0.072, -0.036, 0.017, 0.024, 0.044, 0.018).rotation.z = -side * 0.68;
  return { shoulder, elbow, palm, fingers, side };
}

function makeLeg(object, materials, id, side) {
  const { armor, fabric, plating, trim, glow } = materials;
  const thigh = group(object);
  part(thigh, orb, armor, 0, -0.193, 0, 0.124, 0.255, 0.119);
  part(thigh, facet, id === 'ice' ? plating : trim, 0, -0.167, 0.088, 0.104, 0.162, 0.05);
  const shin = group(object);
  part(shin, orb, fabric, 0, -0.176, 0, 0.112, 0.232, 0.097);
  part(shin, facet, plating, 0, 0.007, 0.06, 0.116, 0.105, 0.099);
  part(shin, box, glow, 0, -0.173, 0.096, 0.025, 0.19, 0.013);
  const foot = group(object);
  part(foot, orb, armor, 0, -0.018, 0.067, 0.111, 0.102, 0.191);
  part(foot, box, trim, 0, -0.103, 0.077, 0.189, 0.027, 0.284);
  return { thigh, shin, foot, side, hip: new THREE.Vector3(), knee: new THREE.Vector3() };
}

function aimLimb(limb, from, to, restLength, direction) {
  limb.position.copy(from);
  direction.subVectors(to, from);
  limb.scale.y = direction.length() / restLength;
  limb.quaternion.setFromUnitVectors(down, direction.normalize());
}

export function createHero(id) {
  const suit = suits[id];
  if (!suit) throw new Error(`Unknown rescue hero: ${id}`);
  const object = new THREE.Group();
  const body = group(object);
  const torso = group(body);
  const materials = fittedMaterials(suit);
  const { fabric, armor, plating, trim, glow } = materials;
  const bodice = new THREE.CylinderGeometry(0.89, 0.58, 1, 8, 1);
  part(torso, bodice, armor, 0, 0.288, 0, 0.348 * suit.width, 0.544, 0.235);
  part(torso, orb, fabric, 0, 0.038, -0.008, 0.231, 0.179, 0.153);
  part(torso, box, trim, 0, 0.044, 0.017, 0.44 * suit.width, 0.078, 0.293);
  part(torso, facet, plating, 0, 0.043, 0.17, 0.115, 0.076, 0.052);
  part(torso, orb, fabric, 0, 0.579, 0, 0.146, 0.136, 0.131);
  if (id === 'gravity') {
    plate(torso, plating, [
      [-0.27, 0.467], [-0.178, 0.531], [-0.09, 0.487], [0.09, 0.487], [0.178, 0.531], [0.27, 0.467],
      [0.201, 0.305], [0.125, 0.263], [0, 0.311], [-0.125, 0.263], [-0.201, 0.305],
    ], 0, 0, 0.159, 0.037).scale.x = suit.width;
  } else if (id === 'ice') {
    for (const side of [-1, 1]) {
      plate(torso, plating, [
        [0.018, 0.477], [0.165, 0.534], [0.251, 0.45],
        [0.193, 0.307], [0.107, 0.249], [0.042, 0.305],
      ].map(([x, y]) => [x * side, y]), 0, 0, 0.16, 0.034);
      part(torso, box, glow, side * 0.123, 0.195, 0.148, 0.032, 0.12, 0.016).rotation.z = side * -0.42;
    }
  } else {
    plate(torso, plating, [
      [-0.267, 0.465], [-0.178, 0.543], [-0.042, 0.523], [0.19, 0.326], [0.171, 0.255], [-0.095, 0.402],
    ], 0, 0, 0.159, 0.036);
    part(torso, box, glow, 0.116, 0.278, 0.162, 0.024, 0.22, 0.018).rotation.z = 0.92;
  }
  const emblem = id === 'portal'
    ? new THREE.TorusGeometry(0.073, 0.016, 6, 22, Math.PI * 1.75)
    : new THREE.OctahedronGeometry(0.077, 0);
  part(torso, emblem, glow, 0, 0.404, 0.213, 0.83, 1.06, 0.44).rotation.z = -0.24;

  const head = makeHead(torso, materials, id);
  const arms = [-1, 1].map(side => makeArm(torso, materials, id, side, suit.width));
  const legs = [-1, 1].map(side => makeLeg(object, materials, id, side));
  const cloth = [];
  if (id === 'gravity') {
    cloth.push(makeCloth(torso, suit.cloak, suit.plating, {
      length: 1.28, startWidth: 0.62, endWidth: 1.04, x: 0, y: 0.5, z: -0.174, spread: 0.37,
    }));
  } else if (id === 'portal') {
    for (const side of [-1, 1]) {
      cloth.push(makeCloth(torso, suit.cloak, suit.plating, {
        length: side > 0 ? 0.97 : 1.11, startWidth: 0.34, endWidth: 0.34,
        x: side * 0.16, y: 0.269, z: -0.136, spread: 0.086,
      }));
    }
  } else {
    cloth.push(makeCloth(torso, suit.cloak, suit.light, {
      length: 0.59, startWidth: 0.25, endWidth: 0.136, x: -0.108, y: 0.534, z: -0.14, spread: 0.067,
    }));
  }

  const direction = new THREE.Vector3();
  function update({ time, power, progress }) {
    const breathe = Math.sin(time * 4.3) * 0.012;
    const casting = power * power * (3 - 2 * power);
    const dip = id === 'ice' ? casting * 0.155 : casting * 0.053;
    const hipHeight = id === 'portal' ? 0.973 : 0.918;
    body.position.set(id === 'portal' ? casting * -0.068 : 0, hipHeight + breathe - dip, casting * 0.04);
    torso.rotation.set(id === 'ice' ? casting * 0.36 : casting * -0.107,
      id === 'portal' ? casting * 0.5 : casting * Math.sin(progress * Math.PI) * 0.13,
      id === 'ice' ? casting * -0.15 : 0);
    head.rotation.set(id === 'ice' ? casting * 0.24 : casting * -0.22, Math.sin(time * 1.7) * 0.072, 0);

    for (const { shoulder, elbow, palm, fingers, side } of arms) {
      if (id === 'gravity') {
        shoulder.rotation.set(-0.16 - casting * 1.46, side * casting * 0.16, side * (0.2 + casting * 0.81));
        elbow.rotation.set(-0.21 - casting * 0.55, 0, -side * casting * 0.28);
        palm.rotation.set(-casting * 0.61, side * casting * 0.47, 0);
      } else if (id === 'ice') {
        const leading = side > 0;
        shoulder.rotation.set(-0.14 - casting * (leading ? 0.42 : -0.37), 0, side * (0.2 + casting * 0.39));
        elbow.rotation.set(-0.18 + casting * (leading ? 0.12 : -0.26), 0, side * casting * 0.09);
        palm.rotation.set(casting * (leading ? 0.46 : -0.19), 0, -side * casting * 0.35);
      } else {
        shoulder.rotation.set(-0.17 - casting * (side > 0 ? 1.06 : 2.54),
          side * casting * 0.42, side * (0.21 + casting * (side > 0 ? 0.77 : 0.27)));
        elbow.rotation.set(-0.26 - casting * (side > 0 ? 0.19 : 0.39), 0, -side * casting * 0.43);
        palm.rotation.set(-casting * 0.27, -side * casting * 0.5, 0.18 * casting);
      }
      fingers.forEach((finger, index) => {
        finger.rotation.set(-0.56 * (1 - casting), 0, (index - 1.5) * casting * 0.2);
      });
    }

    for (const { thigh, shin, foot, side, hip, knee } of legs) {
      const stride = id === 'ice' ? side * 0.152 : side * 0.089;
      foot.position.set(side * (id === 'gravity' ? 0.243 : 0.224), 0.117, stride);
      foot.rotation.y = side * 0.16;
      hip.set(body.position.x + side * 0.13, body.position.y - 0.032, body.position.z);
      knee.lerpVectors(hip, foot.position, 0.515);
      knee.x += side * 0.033;
      knee.z += 0.105 + casting * (id === 'ice' ? 0.175 : 0.078);
      aimLimb(thigh, hip, knee, thighLength, direction);
      aimLimb(shin, knee, foot.position, shinLength, direction);
    }
    for (const animateCloth of cloth) animateCloth(time, casting);
  }

  update({ time: 0, power: 0, progress: 0 });
  return { object, update };
}
