import * as THREE from 'three';

const sphere = new THREE.IcosahedronGeometry(1, 1);
const shard = new THREE.IcosahedronGeometry(1, 0);
const boulder = new THREE.DodecahedronGeometry(1, 0);
const box = new THREE.BoxGeometry(1, 1, 1);
const torso = new THREE.CylinderGeometry(0.92, 0.62, 1, 8);
const down = new THREE.Vector3(0, -1, 0);
const sides = [-1, 1];
const { clamp, lerp } = THREE.MathUtils;

function joint(parent, x = 0, y = 0, z = 0) {
  const object = new THREE.Group();
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function part(parent, geometry, material, x, y, z, sx, sy, sz) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function plate(parent, material, outline, x, y, z, depth = 0.028) {
  const shape = new THREE.Shape();
  shape.moveTo(...outline[0]);
  for (const point of outline.slice(1)) shape.lineTo(...point);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.007, bevelThickness: 0.007,
  });
  return part(parent, geometry, material, x, y, z, 1, 1, 1);
}

function stroke(parent, material, from, to, width) {
  const origin = new THREE.Vector3(...from);
  const direction = new THREE.Vector3(...to).sub(origin);
  origin.addScaledVector(direction, 0.5);
  const mesh = part(parent, box, material, origin.x, origin.y, origin.z, width, direction.length(), width * 0.65);
  mesh.quaternion.setFromUnitVectors(down, direction.normalize());
  mesh.castShadow = false;
}

function makeMaterials(giant) {
  const finish = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
  const glow = (color, emissive) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.62, roughness: 0.34 });
  if (giant) {
    return {
      body: finish(0x332b2a, 0.08, 0.85), armor: finish(0x756353, 0.11, 0.82),
      face: finish(0xa47d53, 0.14, 0.71), edge: finish(0xc18c4c, 0.23, 0.54),
      inset: finish(0x493a32, 0.1, 0.8), light: glow(0xffcb83, 0xff9426),
    };
  }
  return {
    body: finish(0x19313a, 0.22, 0.52), armor: finish(0xb5d5d6, 0.75, 0.22),
    face: finish(0xf0fbf0, 0.52, 0.26), edge: finish(0x35a9a5, 0.62, 0.31),
    inset: finish(0x20525b, 0.42, 0.43), light: glow(0xb9fff0, 0x71ffe0),
  };
}

function makeGiantUpper(body, material) {
  part(body, boulder, material.body, 0, 0.035, 0, 0.34, 0.21, 0.21);
  part(body, torso, material.inset, 0, 0.365, -0.016, 0.52, 0.62, 0.32);
  part(body, boulder, material.armor, 0, 0.545, -0.125, 0.48, 0.283, 0.23);
  part(body, boulder, material.face, 0, 0.52, 0.138, 0.433, 0.264, 0.177);
  part(body, boulder, material.body, 0, 0.64, 0.009, 0.165, 0.19, 0.18);
  part(body, box, material.edge, 0, 0.094, 0.055, 0.621, 0.078, 0.386);
  part(body, shard, material.armor, 0, 0.092, 0.265, 0.132, 0.1, 0.066);

  for (const side of sides) {
    const outline = [[0.045, 0.64], [0.282, 0.672], [0.465, 0.53], [0.394, 0.38], [0.254, 0.28], [0.106, 0.38]];
    plate(body, material.armor, outline.map(([x, y]) => [x * side, y]), 0, 0, 0.232, 0.045);
    stroke(body, material.light, [side * 0.03, 0.435, 0.315], [side * 0.18, 0.514, 0.297], 0.022);
    stroke(body, material.light, [side * 0.18, 0.514, 0.297], [side * 0.299, 0.489, 0.296], 0.017);
    stroke(body, material.edge, [side * 0.29, 0.27, 0.192], [side * 0.36, 0.35, 0.221], 0.061);
    part(body, shard, material.face, side * 0.285, 0.58, -0.304, 0.117, 0.24, 0.117).rotation.z = -side * 0.31;
  }
  part(body, shard, material.light, 0, 0.435, 0.313, 0.073, 0.084, 0.023);

  const head = joint(body, 0, 0.725, 0.056);
  part(head, boulder, material.armor, 0, 0.162, -0.017, 0.212, 0.205, 0.182);
  part(head, boulder, material.body, 0, 0.118, 0.074, 0.177, 0.15, 0.119);
  plate(head, material.face, [[-0.185, 0.22], [-0.105, 0.301], [0.105, 0.301], [0.185, 0.22],
    [0.12, 0.169], [0, 0.202], [-0.12, 0.169]], 0, 0, 0.134, 0.047);
  plate(head, material.edge, [[-0.136, 0.124], [-0.103, 0.038], [0.099, 0.038], [0.14, 0.124],
    [0.067, 0.105], [0.041, 0.078], [-0.041, 0.078], [-0.072, 0.105]], 0, 0, 0.156);
  for (const side of sides) {
    stroke(head, material.light, [side * 0.033, 0.165, 0.203], [side * 0.126, 0.182, 0.181], 0.027);
    part(head, shard, material.armor, side * 0.158, 0.295, -0.041, 0.059, 0.129, 0.081).rotation.z = -side * 0.22;
  }
  return { head, blades: [] };
}

function makeMirrorUpper(body, material) {
  part(body, sphere, material.body, 0, 0.063, 0, 0.204, 0.155, 0.135);
  part(body, torso, material.inset, 0, 0.32, -0.005, 0.302, 0.512, 0.177);
  part(body, sphere, material.body, 0, 0.605, 0.003, 0.091, 0.122, 0.092);
  part(body, box, material.armor, 0, 0.098, 0.023, 0.392, 0.041, 0.233);
  const blades = [];
  for (const side of sides) {
    const points = [[0.038, 0.54], [0.214, 0.59], [0.275, 0.48], [0.207, 0.351], [0.09, 0.25], [0.061, 0.368]];
    plate(body, material.armor, points.map(([x, y]) => [side * x, y]), 0, 0, 0.11, 0.033);
    plate(body, material.face, [[0.055, 0.512], [0.217, 0.551], [0.242, 0.481], [0.154, 0.429], [0.073, 0.447]]
      .map(([x, y]) => [side * x, y]), 0, 0, 0.151, 0.018);
    stroke(body, material.light, [side * 0.09, 0.407, 0.159], [side * 0.2, 0.454, 0.159], 0.014);
    part(body, shard, material.edge, side * 0.158, 0.28, -0.116, 0.097, 0.237, 0.059).rotation.z = side * -0.22;

    const blade = joint(body, side * 0.22, 0.43, -0.172);
    const upper = part(blade, shard, material.face, side * 0.045, 0.12, -0.06, 0.091, 0.243, 0.098);
    upper.rotation.set(-0.38, 0, -side * 0.41);
    const lower = part(blade, shard, material.armor, side * 0.07, -0.181, -0.109, 0.092, 0.237, 0.103);
    lower.rotation.set(0.38, 0, side * 0.27);
    stroke(blade, material.light, [side * 0.041, -0.26, -0.173], [side * 0.09, -0.08, -0.186], 0.016);
    blades.push({ blade, side });
  }
  plate(body, material.light, [[0, 0.508], [0.041, 0.458], [0, 0.385], [-0.041, 0.458]], 0, 0, 0.148, 0.026);

  const head = joint(body, 0, 0.697);
  part(head, sphere, material.body, 0, 0.179, 0, 0.141, 0.215, 0.133);
  part(head, sphere, material.face, 0, 0.234, -0.025, 0.159, 0.195, 0.131);
  plate(head, material.inset, [[-0.149, 0.211], [-0.064, 0.197], [0, 0.227], [0.064, 0.197], [0.149, 0.211],
    [0.109, 0.136], [0, 0.097], [-0.109, 0.136]], 0, 0, 0.108, 0.027);
  plate(head, material.light, [[-0.117, 0.18], [-0.052, 0.167], [0, 0.195], [0.052, 0.167], [0.117, 0.18],
    [0.074, 0.149], [0, 0.151], [-0.074, 0.149]], 0, 0, 0.141, 0.009);
  plate(head, material.armor, [[-0.1, 0.125], [0, 0.094], [0.1, 0.125], [0.072, 0.05], [0, 0.024], [-0.072, 0.05]], 0, 0, 0.108);
  for (const side of sides) {
    const fin = part(head, shard, material.armor, side * 0.123, 0.294, -0.066, 0.048, 0.19, 0.123);
    fin.rotation.set(-0.57, 0, -side * 0.27);
  }
  return { head, blades };
}

function makeArm(object, material, giant, side) {
  const upper = joint(object);
  const forearm = joint(object);
  const hand = joint(object);
  const upperLength = giant ? 0.39 : 0.316;
  const forearmLength = giant ? 0.39 : 0.311;

  if (giant) {
    part(upper, boulder, material.inset, 0, -0.173, 0, 0.174, 0.253, 0.173);
    const pauldron = part(upper, boulder, material.armor, side * 0.046, -0.035, -0.022, 0.254, 0.196, 0.222);
    pauldron.rotation.z = side * 0.23;
    part(upper, shard, material.face, side * 0.131, -0.094, 0.095, 0.142, 0.152, 0.139);
    part(forearm, boulder, material.body, 0, -0.04, 0, 0.153, 0.122, 0.138);
    part(forearm, boulder, material.armor, 0, -0.195, 0.018, 0.183, 0.202, 0.159);
    part(forearm, shard, material.face, 0, -0.188, 0.137, 0.146, 0.184, 0.069);
    stroke(forearm, material.light, [-0.037, -0.095, 0.177], [0.046, -0.291, 0.177], 0.023);
    part(hand, box, material.inset, 0, 0, 0.021, 0.192, 0.114, 0.174);
    for (let index = 0; index < 3; index++) {
      part(hand, boulder, material.face, -0.059 + index * 0.058, 0.008, 0.102, 0.038, 0.052, 0.052);
    }
    part(hand, boulder, material.edge, -side * 0.091, -0.01, 0.05, 0.046, 0.053, 0.061);
  } else {
    part(upper, sphere, material.body, 0, -0.137, 0, 0.075, 0.175, 0.072);
    part(upper, shard, material.armor, side * 0.024, -0.035, 0.008, 0.103, 0.137, 0.104).rotation.z = side * 0.28;
    part(upper, shard, material.face, side * 0.05, -0.065, 0.058, 0.069, 0.123, 0.057).rotation.z = side * 0.29;
    part(forearm, sphere, material.inset, 0, -0.046, 0, 0.069, 0.085, 0.064);
    part(forearm, shard, material.armor, 0, -0.173, 0.012, 0.082, 0.156, 0.083);
    stroke(forearm, material.light, [0.022, -0.095, 0.082], [-0.019, -0.229, 0.077], 0.018);
    part(hand, boulder, material.inset, 0, -0.028, 0.019, 0.062, 0.059, 0.061);
    part(hand, shard, material.edge, 0, -0.014, 0.052, 0.067, 0.049, 0.034);
  }

  return { side, upper, forearm, hand, upperLength, forearmLength };
}

function makeLeg(object, material, giant, side) {
  const thigh = joint(object);
  const shin = joint(object);
  const foot = joint(object);
  const upperLength = giant ? 0.49 : 0.478;
  const lowerLength = giant ? 0.465 : 0.444;
  const shape = giant ? boulder : sphere;
  part(thigh, shape, material.body, 0, -0.21, 0, giant ? 0.153 : 0.109, 0.264, giant ? 0.146 : 0.102);
  part(thigh, shard, material.armor, side * 0.029, -0.173, 0.074, giant ? 0.15 : 0.114, giant ? 0.235 : 0.216, giant ? 0.113 : 0.081);
  part(shin, shape, material.inset, 0, -0.038, 0.045, giant ? 0.143 : 0.092, 0.11, giant ? 0.142 : 0.085);
  part(shin, shape, material.armor, 0, -0.235, 0.006, giant ? 0.145 : 0.094, 0.233, giant ? 0.143 : 0.098);
  part(shin, shard, material.face, 0, -0.138, 0.105, giant ? 0.117 : 0.086, 0.167, giant ? 0.085 : 0.056);
  stroke(shin, material.light, [side * 0.019, -0.15, giant ? 0.165 : 0.137], [side * 0.043, -0.29, giant ? 0.161 : 0.13], giant ? 0.026 : 0.018);
  part(foot, shape, material.armor, 0, -0.018, 0.059, giant ? 0.139 : 0.091, 0.084, giant ? 0.207 : 0.169);
  part(foot, box, material.body, 0, -0.075, 0.058, giant ? 0.269 : 0.17, 0.042, giant ? 0.373 : 0.279);
  part(foot, shard, material.face, 0, -0.034, giant ? 0.176 : 0.149, giant ? 0.118 : 0.086, 0.051, 0.079);
  return { side, thigh, shin, foot, upperLength, lowerLength };
}

export function createExpansionHero(id) {
  if (id !== 'giant' && id !== 'mirror') throw new Error(`Unknown expansion hero: ${id}`);
  const giant = id === 'giant';
  const object = new THREE.Group();
  object.name = giant ? 'giant-hero' : 'mirror-hero';
  const body = joint(object);
  const material = makeMaterials(giant);
  const { head, blades } = giant ? makeGiantUpper(body, material) : makeMirrorUpper(body, material);
  const arms = sides.map(side => makeArm(object, material, giant, side));
  const legs = sides.map(side => makeLeg(object, material, giant, side));
  const anchor = joint(object);
  const anchors = giant ? { support: anchor } : { carry: anchor };
  anchor.name = giant ? 'giant-support' : 'mirror-carry';

  const start = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const position = new THREE.Vector3();

  function orient(limb, from, to, length) {
    limb.position.copy(from);
    axis.subVectors(to, from);
    limb.scale.y = axis.length() / length;
    limb.quaternion.setFromUnitVectors(down, axis.normalize());
  }

  function poseLimb(first, second, end, upperLength, lowerLength, floor = -Infinity) {
    axis.subVectors(end, start);
    const span = clamp(axis.length(), 0.15, upperLength + lowerLength - 0.006);
    axis.normalize();
    bend.addScaledVector(axis, -bend.dot(axis)).normalize();
    const distance = (span * span + upperLength * upperLength - lowerLength * lowerLength) / (2 * span);
    const offset = Math.sqrt(Math.max(0, upperLength * upperLength - distance * distance));
    position.copy(start).addScaledVector(axis, distance).addScaledVector(bend, offset);
    position.y = Math.max(position.y, floor);
    orient(first, start, position, upperLength);
    orient(second, position, end, lowerLength);
  }

  function update({ time = 0, power = 0, running = 0, carrying = false, lowering = 0 } = {}) {
    const amount = clamp(power, 0, 1);
    const effort = amount * amount * (3 - 2 * amount);
    const lower = giant ? clamp(lowering, 0, 1) * effort : 0;
    const stride = clamp(running, 0, 1) * (1 - lower);
    const phase = time * (giant ? 7.5 : 14.3);
    const breath = Math.sin(time * 3.1) * 0.009;
    const bounce = Math.cos(phase * 2) * stride * (giant ? 0.018 : 0.025);
    const brace = giant ? effort : 0;
    body.position.set(Math.sin(phase) * stride * 0.025,
      (giant ? 1.031 : 0.994) + breath + bounce - 0.119 * brace - 0.565 * lower - stride * 0.102,
      brace * (-0.066 + 0.21 * lower));
    body.rotation.set(giant ? -0.12 * brace + 0.61 * lower + stride * 0.14 : stride * (carrying ? 0.24 : 0.44) - effort * 0.09,
      Math.cos(phase) * stride * (carrying ? 0.058 : 0.15), -Math.sin(phase) * stride * 0.064);
    head.rotation.set(-body.rotation.x * 0.87 - brace * 0.06, Math.sin(time * 1.62) * 0.08 * (1 - brace) * (1 - stride), 0);

    for (const { blade, side } of blades) {
      blade.rotation.set(Math.sin(time * 4.5 + side) * 0.062 + stride * 0.18, -side * (0.24 + effort * 0.73), side * effort * 0.22);
      blade.position.x = side * (0.22 + effort * 0.073);
    }

    const supportY = lerp(1.50, 0.21, lower);
    const supportZ = lerp(0.60, 0.73, lower);
    let carryY = 0;
    let carryZ = 0;
    for (const { side, upper, forearm, hand, upperLength, forearmLength } of arms) {
      const swing = Math.cos(phase) * side * stride;
      start.set(side * (giant ? 0.434 : 0.268), giant ? 0.573 : 0.524, 0).applyEuler(body.rotation).add(body.position);
      if (giant) {
        hand.position.set(side * lerp(0.517, 0.359, brace), lerp(0.885 + swing * 0.049, supportY - 0.057, brace),
          lerp(0.106 + swing * 0.26, supportZ - 0.025, brace));
        hand.rotation.set(lerp(-0.7 + swing * 0.24, 0, brace), side * lerp(0.09, -0.11, brace), 0);
      } else if (carrying) {
        hand.position.set(side * (0.226 + Math.sin(phase) * 0.022 * stride), 1.145 + bounce + swing * 0.018, 0.47 + swing * 0.023);
        hand.rotation.set(0.15, -side * 0.27, side * 0.09);
      } else {
        const cast = effort * (1 - stride);
        hand.position.set(side * lerp(0.334, 0.554, cast), lerp(0.889 + Math.abs(swing) * 0.21, 1.455 + side * 0.104, cast),
          lerp(0.13 + swing * 0.43, 0.335, cast));
        hand.rotation.set(-0.4 + swing * 0.42, side * cast * 0.47, side * cast * 0.24);
      }
      carryY += hand.position.y * 0.5;
      carryZ += hand.position.z * 0.5;
      bend.set(side * 0.85, -0.64, giant ? -0.14 : -0.38);
      poseLimb(upper, forearm, hand.position, upperLength, forearmLength);
    }

    for (const { side, thigh, shin, foot, upperLength, lowerLength } of legs) {
      const step = phase + (side > 0 ? Math.PI : 0);
      const lift = Math.max(0, -Math.sin(step)) * stride;
      foot.position.set(side * (giant ? 0.242 + brace * 0.089 + lower * 0.062 : 0.165 + effort * (1 - stride) * 0.044),
        0.103 + lift * (giant ? 0.164 : 0.293),
        side * (0.062 + brace * 0.13) * (1 - stride) + Math.cos(step) * stride * (giant ? 0.32 : 0.44));
      foot.rotation.set(lift * 0.29, side * (giant ? 0.117 + brace * 0.1 : 0.083), 0);
      start.set(side * (giant ? 0.207 : 0.128), 0.006, 0).applyEuler(body.rotation).add(body.position);
      bend.set(side * (giant ? 0.26 + lower * 0.24 : 0.13), lower * 0.51, 1);
      poseLimb(thigh, shin, foot.position, upperLength, lowerLength, giant ? 0.23 : 0.18);
    }

    if (giant) anchor.position.set(0, lerp(0.942, supportY, brace), lerp(0.131, supportZ, brace));
    else anchor.position.set(0, carryY + 0.065, carryZ + 0.06);
  }

  update();
  return { object, update, anchors };
}
