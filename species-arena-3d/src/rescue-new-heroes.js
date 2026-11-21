import * as THREE from 'three';

const orb = new THREE.IcosahedronGeometry(1, 1);
const facet = new THREE.IcosahedronGeometry(1, 0);
const box = new THREE.BoxGeometry(1, 1, 1);
const torsoShell = new THREE.CylinderGeometry(0.88, 0.56, 1, 8);
const ring = new THREE.TorusGeometry(1, 0.14, 5, 18);
const down = new THREE.Vector3(0, -1, 0);
const thighLength = 0.47;
const shinLength = 0.43;
const { clamp, lerp } = THREE.MathUtils;

const designs = {
  web: {
    cloth: 0x252934, shell: 0xa43337, edge: 0xe66855, inset: 0x4a2731, light: 0xffd1b1,
  },
  speed: {
    cloth: 0x1d3d44, shell: 0xffb91d, edge: 0xfff1d1, inset: 0x1d777a, light: 0xffe995,
  },
};

function joint(parent, x = 0, y = 0, z = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function mesh(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.scale.set(sx, sy, sz);
  object.castShadow = true;
  parent.add(object);
  return object;
}

function panel(parent, material, points, x, y, z, depth = 0.024) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.008, bevelThickness: 0.007,
  });
  return mesh(parent, geometry, material, x, y, z);
}

function makeMaterials(design) {
  const finish = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
  return {
    cloth: finish(design.cloth, 0.02, 0.78),
    shell: finish(design.shell, 0.35, 0.45),
    edge: finish(design.edge, 0.41, 0.37),
    inset: finish(design.inset, 0.26, 0.52),
    light: new THREE.MeshStandardMaterial({ color: design.light, emissive: design.light, emissiveIntensity: 0.65, roughness: 0.4 }),
  };
}

function makeHead(body, { cloth, shell, edge, inset, light }, web) {
  const head = joint(body, 0, 0.685);
  mesh(head, orb, cloth, 0, 0.175, 0, 0.171, 0.214, 0.151);
  mesh(head, orb, shell, 0, 0.226, -0.013, 0.177, 0.174, 0.156);
  if (web) {
    panel(head, inset, [
      [-0.137, 0.225], [0, 0.254], [0.137, 0.225], [0.117, 0.139], [0.062, 0.071], [-0.062, 0.071], [-0.117, 0.139],
    ], 0, 0, 0.107);
    for (const side of [-1, 1]) {
      panel(head, light, [[0.026, 0.187], [0.078, 0.222], [0.136, 0.204], [0.102, 0.159], [0.061, 0.15]]
        .map(([x, y]) => [x * side, y]), 0, 0, 0.144, 0.012);
      mesh(head, facet, edge, side * 0.154, 0.198, -0.035, 0.037, 0.102, 0.087).rotation.z = side * 0.28;
    }
  } else {
    panel(head, inset, [[-0.15, 0.226], [0, 0.201], [0.15, 0.226], [0.111, 0.127], [0, 0.106], [-0.111, 0.127]], 0, 0, 0.108);
    panel(head, light, [[-0.127, 0.203], [0, 0.178], [0.127, 0.203], [0.109, 0.172], [0, 0.145], [-0.109, 0.172]], 0, 0, 0.139, 0.01);
    for (const side of [-1, 1]) {
      const fin = mesh(head, facet, edge, side * 0.146, 0.264, -0.09, 0.04, 0.137, 0.161);
      fin.rotation.x = -0.65;
      mesh(head, orb, shell, side * 0.153, 0.185, -0.006, 0.034, 0.072, 0.085);
    }
    mesh(head, box, edge, 0, 0.106, 0.137, 0.082, 0.035, 0.038);
  }
  return head;
}

function makeTorso(body, { cloth, shell, edge, inset, light }, web) {
  mesh(body, orb, cloth, 0, 0.05, -0.005, 0.234, 0.163, 0.154);
  mesh(body, torsoShell, web ? cloth : inset, 0, 0.308, 0, 0.354, 0.53, 0.219);
  mesh(body, orb, cloth, 0, 0.595, 0, 0.125, 0.129, 0.113);
  mesh(body, box, inset, 0, 0.053, 0.013, 0.455, 0.077, 0.287);
  mesh(body, facet, edge, 0, 0.055, 0.171, 0.091, 0.053, 0.044);

  for (const side of [-1, 1]) {
    const chestShape = web
      ? [[0.016, 0.5], [0.161, 0.565], [0.272, 0.472], [0.222, 0.301], [0.103, 0.211], [0.054, 0.329]]
      : [[0.019, 0.53], [0.203, 0.537], [0.284, 0.456], [0.219, 0.298], [0.162, 0.218], [0.088, 0.371]];
    panel(body, shell, chestShape.map(([x, y]) => [x * side, y]), 0, 0, 0.145, 0.036);
    panel(body, edge, [[0.06, 0.465], [0.229, 0.478], [0.196, 0.435], [0.084, 0.411]]
      .map(([x, y]) => [x * side, y]), 0, 0, 0.184, 0.014);
    mesh(body, box, web ? edge : light, side * 0.151, 0.222, 0.162, 0.024, 0.135, 0.013).rotation.z = side * -0.42;
  }

  if (web) {
    panel(body, light, [[0, 0.46], [0.041, 0.41], [0, 0.36], [-0.041, 0.41]], 0, 0, 0.192, 0.014);
    for (const side of [-1, 1]) {
      mesh(body, orb, shell, side * 0.132, 0.34, -0.154, 0.101, 0.203, 0.076).rotation.z = side * -0.13;
      mesh(body, ring, edge, side * 0.132, 0.353, -0.224, 0.067, 0.067, 0.067);
      mesh(body, facet, light, side * 0.132, 0.352, -0.23, 0.029, 0.027, 0.013);
    }
  } else {
    panel(body, edge, [[-0.068, 0.477], [0.075, 0.423], [0.021, 0.407], [0.069, 0.338], [-0.075, 0.397], [-0.023, 0.415]], 0, 0, 0.191, 0.021);
    mesh(body, facet, edge, 0, 0.365, -0.149, 0.218, 0.202, 0.092);
    for (const side of [-1, 1]) {
      const vane = mesh(body, facet, shell, side * 0.136, 0.466, -0.163, 0.094, 0.129, 0.14);
      vane.rotation.x = -0.69;
      mesh(body, box, light, side * 0.122, 0.342, -0.211, 0.029, 0.162, 0.014).rotation.z = side * -0.23;
    }
  }
}

function makeArm(body, { cloth, shell, edge, inset, light }, web, side) {
  const shoulder = joint(body, side * 0.288, 0.495);
  mesh(shoulder, orb, shell, side * 0.023, -0.046, -0.001, 0.122, 0.133, 0.126);
  mesh(shoulder, orb, cloth, 0, -0.139, 0, 0.088, 0.152, 0.086);
  if (!web) {
    mesh(shoulder, facet, edge, side * 0.044, -0.043, -0.049, 0.1, 0.112, 0.156).rotation.x = -0.38;
  }

  const elbow = joint(shoulder, 0, -0.271);
  mesh(elbow, orb, inset, 0, -0.034, 0, 0.081, 0.092, 0.083);
  mesh(elbow, orb, shell, 0, -0.136, 0.012, 0.094, 0.137, 0.089);
  mesh(elbow, box, light, side * 0.029, -0.151, 0.089, 0.029, 0.108, 0.019).rotation.z = side * -0.19;
  if (web) {
    mesh(elbow, orb, edge, 0, -0.193, 0.056, 0.101, 0.077, 0.057);
    mesh(elbow, ring, inset, 0, -0.199, 0.107, 0.032, 0.031, 0.027);
  }

  const hand = joint(elbow, 0, -0.257, 0.012);
  mesh(hand, facet, cloth, 0, -0.033, 0, 0.082, 0.091, 0.057);
  mesh(hand, facet, edge, 0, -0.025, 0.041, 0.062, 0.069, 0.021);
  const wrist = joint(hand, 0, -0.038, 0.047);
  wrist.name = `web-wrist-${side < 0 ? 'left' : 'right'}`;
  return { side, shoulder, elbow, hand, wrist };
}

function makeLeg(object, { cloth, shell, edge, inset, light }, web, side) {
  const thigh = joint(object);
  mesh(thigh, orb, cloth, 0, -0.211, 0, 0.115, 0.252, 0.108);
  mesh(thigh, facet, shell, side * 0.015, -0.163, 0.053, 0.108, 0.184, 0.074);
  const shin = joint(object);
  mesh(shin, facet, edge, 0, -0.016, 0.069, 0.108, 0.086, 0.091);
  mesh(shin, orb, web ? inset : shell, 0, -0.215, 0.006, 0.1, 0.233, 0.097);
  mesh(shin, box, light, side * 0.018, -0.177, 0.096, 0.027, 0.158, 0.011);
  const foot = joint(object);
  mesh(foot, orb, shell, 0, -0.019, 0.054, 0.1, 0.077, 0.173);
  mesh(foot, box, cloth, 0, -0.08, 0.064, 0.185, 0.035, 0.286);
  if (!web) mesh(foot, facet, edge, 0, -0.028, 0.132, 0.091, 0.062, 0.096);
  return { side, thigh, shin, foot };
}

function aim(limb, start, end, length, direction) {
  limb.position.copy(start);
  direction.subVectors(end, start);
  limb.scale.y = direction.length() / length;
  limb.quaternion.setFromUnitVectors(down, direction.normalize());
}

export function createNewHero(id) {
  const design = designs[id];
  if (!design) throw new Error(`Unknown rescue hero: ${id}`);
  const web = id === 'web';
  const object = new THREE.Group();
  const body = joint(object);
  const materials = makeMaterials(design);
  makeTorso(body, materials, web);
  const head = makeHead(body, materials, web);
  const arms = [-1, 1].map(side => makeArm(body, materials, web, side));
  const legs = [-1, 1].map(side => makeLeg(object, materials, web, side));
  const carry = joint(object, 0, 1.17, 0.42);
  carry.name = 'speed-carry';
  const anchors = { leftWrist: arms[0].wrist, rightWrist: arms[1].wrist, carry };

  const hip = new THREE.Vector3();
  const knee = new THREE.Vector3();
  const toFoot = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const leftHand = new THREE.Vector3();
  const rightHand = new THREE.Vector3();

  function update({ time = 0, power = 0, running = 0, carrying = false }) {
    const effort = clamp(power, 0, 1);
    const stride = clamp(running, 0, 1);
    const braced = web ? effort * effort * (3 - 2 * effort) : 0;
    const phase = time * 15.5;
    const bounce = Math.sin(time * 4.2) * 0.009 + Math.cos(phase * 2) * 0.026 * stride;
    body.position.set(Math.sin(phase) * 0.025 * stride, 0.942 + bounce - braced * 0.146 - stride * 0.105, -braced * 0.13);
    body.rotation.set(stride * (carrying ? 0.26 : 0.52) - braced * 0.32, Math.cos(phase) * stride * (carrying ? 0.046 : 0.19), -Math.sin(phase) * stride * 0.074);
    head.rotation.set(-body.rotation.x * 0.84 - braced * 0.19, Math.sin(time * 1.85) * 0.09 * (1 - braced) * (1 - stride), 0);

    for (const { side, shoulder, elbow, hand } of arms) {
      const pump = Math.cos(phase) * side * stride;
      if (web) {
        shoulder.rotation.set(lerp(-0.16, -1.61, braced), side * braced * 0.12, side * lerp(0.16, 0.09, braced));
        elbow.rotation.set(lerp(-0.25, -0.6, braced), 0, -side * braced * 0.13);
        hand.rotation.set(braced * -0.27, side * braced * 0.22, 0);
      } else if (carrying) {
        shoulder.rotation.set(-1.01 + pump * 0.067, -side * 0.07, side * 0.18);
        elbow.rotation.set(-1.43, -side * 0.29, -side * 0.47);
        hand.rotation.set(-0.22, side * 0.36, 0);
      } else {
        shoulder.rotation.set(-0.21 + pump * 0.9, 0, side * 0.16);
        elbow.rotation.set(-0.26 - stride * 0.99 + pump * 0.18, 0, -side * stride * 0.10);
        hand.rotation.set(-stride * 0.12, 0, 0);
      }
    }

    for (const { side, thigh, shin, foot } of legs) {
      const step = phase + (side > 0 ? Math.PI : 0);
      const lifted = Math.max(0, -Math.sin(step)) * stride;
      foot.position.set(side * lerp(0.191, web ? 0.279 : 0.159, braced + stride),
        0.1 + lifted * 0.31, side * (0.08 + braced * 0.20) * (1 - stride) + Math.cos(step) * stride * 0.46);
      foot.rotation.set(lifted * 0.36, side * lerp(0.14, web ? 0.29 : 0.06, braced + stride), 0);
      hip.set(body.position.x + side * 0.13, body.position.y - 0.008, body.position.z);

      toFoot.subVectors(foot.position, hip);
      const span = clamp(toFoot.length(), 0.12, thighLength + shinLength - 0.003);
      toFoot.normalize();
      const along = (span * span + thighLength * thighLength - shinLength * shinLength) / (2 * span);
      const bend = Math.sqrt(thighLength * thighLength - along * along);
      forward.set(side * 0.095, 0, 1).addScaledVector(toFoot, -toFoot.z - side * 0.095 * toFoot.x).normalize();
      knee.copy(hip).addScaledVector(toFoot, along).addScaledVector(forward, bend);
      aim(thigh, hip, knee, thighLength, direction);
      aim(shin, knee, foot.position, shinLength, direction);
    }

    if (carrying && !web) {
      anchors.leftWrist.getWorldPosition(leftHand);
      anchors.rightWrist.getWorldPosition(rightHand);
      carry.position.copy(object.worldToLocal(leftHand.lerp(rightHand, 0.5)));
      carry.position.y += 0.065;
      carry.position.z += 0.055;
    }
  }

  update({ time: 0 });
  return { object, update, anchors };
}
