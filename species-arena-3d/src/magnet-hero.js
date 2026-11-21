import * as THREE from 'three';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const facet = new THREE.IcosahedronGeometry(1, 1);
const shell = new THREE.SphereGeometry(1, 12, 8);
const armor = new THREE.BoxGeometry(1, 1, 1);
const socket = new THREE.CylinderGeometry(1, 1, 1, 12);

function standard(color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true });
}

const ivory = standard(0xd1be93, 0.31, 0.46);
const inset = standard(0x194449, 0.58, 0.39);
const alloy = standard(0x85603b, 0.67, 0.32);
const fabric = standard(0x242d32, 0.12, 0.78);
const glass = standard(0x142c31, 0.72, 0.21);
const black = standard(0x152026, 0.26, 0.5);
const amber = new THREE.MeshStandardMaterial({ color: 0xffbb64, emissive: 0xf78126, emissiveIntensity: 0.55 });

function joint(parent, x = 0, y = 0, z = 0) {
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
  mesh.receiveShadow = !material.transparent;
  parent.add(mesh);
  return mesh;
}

function castPlate(points, depth) {
  const profile = new THREE.Shape();
  profile.moveTo(...points[0]);
  for (const point of points.slice(1)) profile.lineTo(...point);
  profile.closePath();
  return new THREE.ExtrudeGeometry(profile, {
    depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.013, bevelSegments: 1,
  });
}

const cuirass = castPlate([
  [-0.22, 0.18], [-0.29, 0.06], [-0.20, -0.16], [-0.10, -0.2],
  [0.1, -0.2], [0.20, -0.16], [0.29, 0.06], [0.22, 0.18],
], 0.05);
const visor = castPlate([
  [-0.141, 0.076], [-0.157, 0.01], [-0.124, -0.086], [-0.062, -0.107],
  [0.062, -0.107], [0.124, -0.086], [0.157, 0.01], [0.141, 0.076],
], 0.019);
const boot = castPlate([
  [-0.081, -0.031], [-0.09, 0.035], [-0.055, 0.09],
  [0.055, 0.09], [0.09, 0.035], [0.081, -0.031],
], 0.16);

function buildHelmet(body, glow) {
  const head = joint(body, 0, 0.91, 0);
  part(head, shell, ivory, 0, 0.052, -0.01, 0.182, 0.198, 0.162);
  part(head, facet, inset, 0, 0.173, -0.029, 0.097, 0.072, 0.127);
  part(head, visor, alloy, 0, 0.054, 0.137);
  part(head, visor, glass, 0, 0.054, 0.169, 0.89, 0.88, 0.44);
  part(head, armor, glow, 0, 0.096, 0.19, 0.145, 0.013, 0.015);
  part(head, armor, amber, 0, 0.003, 0.192, 0.046, 0.009, 0.011);
  for (const side of [-1, 1]) {
    const cheek = part(head, armor, ivory, side * 0.133, -0.025, 0.111, 0.043, 0.062, 0.083);
    cheek.rotation.z = side * 0.21;
    const ear = joint(head, side * 0.174, 0.05, -0.038);
    ear.rotation.z = Math.PI / 2;
    part(ear, socket, alloy, 0, 0, 0, 0.063, 0.043, 0.063);
    part(ear, socket, glow, 0, -side * 0.028, 0, 0.032, 0.012, 0.032);
  }
  return head;
}

function buildArm(body, side, glow) {
  const shoulder = joint(body, side * 0.293, 0.666, 0);
  part(shoulder, shell, fabric, 0, -0.019, 0, 0.102, 0.123, 0.098);
  const pauldron = part(shoulder, facet, side === -1 ? ivory : inset, side * 0.035, -0.046, -0.004,
    side === -1 ? 0.147 : 0.132, 0.129, 0.13);
  pauldron.rotation.y = side * 0.35;
  part(shoulder, armor, amber, side * 0.082, -0.064, 0.097, 0.054, 0.016, 0.026);
  part(shoulder, shell, inset, 0, -0.177, 0, 0.083, 0.114, 0.076);

  const elbow = joint(shoulder, 0, -0.28, 0);
  part(elbow, shell, fabric, 0, 0, 0, 0.071, 0.068, 0.075);
  part(elbow, facet, alloy, 0, -0.124, 0.016, 0.107, 0.166, 0.103);
  part(elbow, armor, ivory, 0, -0.117, 0.098, 0.103, 0.128, 0.031);
  part(elbow, armor, glow, side * 0.027, -0.123, 0.118, 0.015, 0.09, 0.009);
  const glove = joint(elbow, 0, -0.274, 0.005);
  part(glove, facet, black, 0, -0.025, 0, 0.066, 0.084, 0.056);
  part(glove, armor, ivory, 0, -0.021, 0.044, 0.077, 0.057, 0.026);
  part(glove, armor, glow, 0, -0.068, 0.035, 0.051, 0.028, 0.032);
  const contact = joint(glove, 0, -0.081, 0.04);
  return { side, shoulder, elbow, glove, contact };
}

function buildLeg(pelvis, side, glow) {
  const hip = joint(pelvis, side * 0.132, -0.047, 0);
  part(hip, shell, fabric, 0, -0.155, -0.005, 0.107, 0.202, 0.112);
  part(hip, facet, inset, side * 0.029, -0.137, 0.056, 0.109, 0.16, 0.09);
  part(hip, armor, alloy, side * 0.07, -0.131, 0.121, 0.059, 0.122, 0.021);
  const knee = joint(hip, 0, -0.367, 0);
  part(knee, shell, fabric, 0, 0, 0, 0.08, 0.076, 0.084);
  part(knee, facet, ivory, 0, -0.041, 0.067, 0.106, 0.086, 0.077);
  part(knee, facet, alloy, 0, -0.218, 0.011, 0.09, 0.167, 0.108);
  part(knee, armor, inset, 0, -0.204, 0.101, 0.076, 0.13, 0.028);
  part(knee, armor, glow, side * 0.027, -0.199, 0.118, 0.013, 0.073, 0.008);
  const ankle = joint(knee, 0, -0.4, 0.007);
  part(ankle, armor, black, 0, -0.062, 0.076, 0.187, 0.032, 0.269);
  part(ankle, boot, ivory, 0, -0.022, -0.032);
  part(ankle, armor, inset, 0, -0.016, 0.136, 0.13, 0.035, 0.05);
  return { side, hip, knee, ankle };
}

const railRadius = 0.505;
const railSpan = 0.55;
const curvedSegment = thickness => new THREE.TorusGeometry(railRadius, thickness, 7, 12, railSpan)
  .rotateZ(-railSpan / 2).translate(-railRadius, 0, 0);
const poleHousing = curvedSegment(0.049);
const poleFace = curvedSegment(0.03);
const poleLight = curvedSegment(0.012);
const harness = new THREE.TorusGeometry(0.342, 0.022, 6, 38);

function buildYoke(body, glow) {
  const frame = joint(body, 0, 0.68, -0.24);
  part(frame, facet, inset, 0, -0.027, 0.006, 0.217, 0.196, 0.112);
  part(frame, harness, alloy, 0, 0, -0.048);
  part(frame, harness, glow, 0, 0, -0.076, 0.82, 0.82, 0.7);
  part(frame, facet, ivory, 0, 0, -0.086, 0.131, 0.124, 0.055);
  part(frame, facet, glow, 0, 0, -0.144, 0.064, 0.064, 0.031);
  const poles = [];
  for (const side of [-1, 1]) {
    for (const elevation of [-0.73, 0, 0.73]) {
      const angle = side > 0 ? elevation : Math.PI - elevation;
      const pole = joint(frame);
      part(pole, poleHousing, alloy, 0, 0, 0);
      part(pole, poleFace, ivory, 0.019, 0, -0.028);
      part(pole, poleLight, glow, 0.04, 0, 0.008);
      part(pole, armor, inset, 0, 0, -0.061, 0.068, 0.085, 0.036);
      poles.push({ pole, side, angle, elevation });
    }
  }
  return { frame, poles };
}

function createFieldPulse(field, wing = false) {
  const arcs = [];
  for (const [index, color] of [0x8afff0, 0xffba65, 0x8afff0].entries()) {
    const material = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, toneMapped: false,
    });
    const radius = 0.5 + index * 0.063;
    const geometry = wing
      ? new THREE.RingGeometry(radius - 0.018, radius, 6)
      : new THREE.TorusGeometry(radius, 0.013, 5, 35, 3.22);
    if (wing) material.side = THREE.DoubleSide;
    const arc = part(field, geometry, material, 0, 0, index * 0.072);
    arcs.push(arc);
  }
  return arcs;
}

function poseWingVane({ pole, side, elevation }, deploy, time) {
  const stagger = (elevation + 0.73) * 0.09;
  const spread = smoothstep(deploy, stagger, 0.8 + stagger);
  const foldedX = 0.26 + (elevation + 0.73) * 0.065;
  const deployedX = 0.78 + (1 - Math.abs(elevation)) * 0.20;
  const flutter = Math.sin(time * 4.2 + elevation * 5) * spread * 0.015;
  pole.position.set(
    side * lerp(foldedX, deployedX, spread),
    lerp(elevation * 0.41 - 0.15, elevation * 0.74 + 0.08, spread) + flutter,
    lerp(-0.12 - stagger * 0.2, -0.13 + Math.abs(elevation) * 0.11, spread),
  );
  pole.rotation.set(
    0.13 * (1 - spread) + flutter,
    side * lerp(0.29, 0.08, spread),
    -side * lerp(0.13 + elevation * 0.18, Math.PI * 0.5 - elevation * 0.76, spread),
  );
}

export function createMagnetHero() {
  const object = new THREE.Group();
  const glow = new THREE.MeshStandardMaterial({ color: 0x8df8e3, emissive: 0x37eace, emissiveIntensity: 0.63, roughness: 0.35 });
  const pelvis = joint(object, 0, 0.91, 0);
  const body = joint(pelvis);
  part(body, facet, inset, 0, 0.028, 0, 0.236, 0.14, 0.147);
  part(body, shell, fabric, 0, 0.275, 0, 0.16, 0.216, 0.137);
  part(body, facet, inset, 0, 0.509, -0.011, 0.288, 0.244, 0.164);
  part(body, cuirass, ivory, 0, 0.504, 0.121);
  part(body, armor, alloy, 0, 0.207, 0.124, 0.26, 0.057, 0.045);
  part(body, armor, black, 0, 0.508, 0.187, 0.158, 0.125, 0.042);
  part(body, armor, glow, -0.041, 0.51, 0.215, 0.016, 0.06, 0.013);
  for (const side of [-1, 1]) {
    part(body, armor, glow, side * 0.041, 0.51, 0.215, 0.052, 0.016, 0.013);
    for (const y of [0.276, 0.321, 0.366]) {
      const rib = part(body, armor, alloy, side * 0.148, y, 0.078, 0.058, 0.017, 0.059);
      rib.rotation.z = side * 0.29;
    }
  }
  part(body, socket, fabric, 0, 0.799, 0, 0.093, 0.114, 0.093);
  const head = buildHelmet(body, glow);
  const arms = [-1, 1].map(side => buildArm(body, side, glow));
  const legs = [-1, 1].map(side => buildLeg(pelvis, side, glow));
  const { frame, poles } = buildYoke(body, glow);
  const field = joint(body, 0, 0.49, 0.56);
  const arcs = createFieldPulse(field);
  let wingArcs;
  const slots = { Torso: body, Helmet: head, Yoke: frame };
  for (const [index, side] of ['L', 'R'].entries()) {
    const { shoulder, elbow, glove } = arms[index];
    const { hip, knee, ankle } = legs[index];
    slots[`UpperArm_${side}`] = shoulder;
    slots[`Forearm_${side}`] = elbow;
    slots[`Glove_${side}`] = glove;
    slots[`Thigh_${side}`] = hip;
    slots[`Shin_${side}`] = knee;
    slots[`Boot_${side}`] = ankle;
    for (let pole = 0; pole < 3; pole++) slots[`Pole_${side}${pole}`] = poles[index * 3 + pole].pole;
  }
  const appearance = { slots, baseMeshes: [], emitters: [], mountedPieces: [], model: 'procedural' };
  object.traverse(child => {
    if (child.isMesh && !arcs.includes(child)) appearance.baseMeshes.push(child);
  });

  function update({ time = 0, power = 0, progress = 0, running = 0, carrying = false } = {}) {
    const strength = clamp(power, 0, 1);
    const deploy = smoothstep(strength, 0, 0.8);
    const reach = Math.max(deploy, carrying ? 0.78 : 0);
    const gait = clamp(running, 0, 1) * (1 - reach * 0.8);
    const stride = time * 13;
    const breathe = Math.sin(time * 2.1);
    pelvis.position.y = 0.91 - 0.047 * reach - 0.024 * gait * Math.cos(stride * 2) + 0.006 * breathe;
    body.rotation.x = lerp(0.08 * gait, -0.105, reach);
    body.rotation.y = 0.065 * gait * Math.sin(stride) * (1 - reach);
    head.rotation.set(reach * 0.073, 0.082 * Math.sin(time * 0.92) * (1 - reach), -0.03 * (1 - reach));

    for (const { side, shoulder, elbow, glove } of arms) {
      const armSwing = Math.sin(stride) * side;
      shoulder.rotation.set(
        lerp(-0.145 + armSwing * 0.62 * gait + 0.024 * breathe, -1.36 + side * 0.075, reach),
        side * reach * 0.12,
        side * lerp(0.15, 0.43, reach),
      );
      elbow.rotation.x = lerp(-0.18 - Math.max(0, -armSwing) * gait * 0.39, -0.28, reach);
      glove.rotation.z = -side * reach * 0.19;
    }

    for (const { side, hip, knee, ankle } of legs) {
      const swing = Math.sin(stride) * side;
      hip.rotation.set(0.08 * reach - swing * 0.64 * gait, 0, side * (0.045 + 0.17 * reach));
      knee.rotation.x = 0.07 + 0.07 * reach + Math.max(0, swing) * 0.68 * gait;
      ankle.rotation.x = -(hip.rotation.x + knee.rotation.x) * 0.87;
      ankle.rotation.z = -hip.rotation.z * 0.91;
    }

    const wing = appearance.model === 'blender-wing';
    frame.rotation.y = 0.048 * Math.sin(time * 1.7) * (1 - deploy);
    if (wing) {
      for (const vane of poles) poseWingVane(vane, deploy, time);
      wingArcs ??= createFieldPulse(field, true);
      for (const arc of arcs) arc.visible = false;
    } else {
      if (wingArcs) for (const arc of wingArcs) arc.visible = false;
      for (const { pole, side, angle, elevation } of poles) {
        const wobble = Math.sin(time * 3.8 + angle * 2) * (0.007 + deploy * 0.011);
        const radius = railRadius + wobble + deploy * (0.21 - Math.abs(elevation) * 0.04);
        pole.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, deploy * (0.21 + Math.abs(elevation) * 0.06));
        pole.rotation.set(0, side * deploy * 0.52, angle + side * deploy * 0.14);
      }
    }

    glow.emissiveIntensity = 0.58 + strength * 1.52;
    for (const { material, intensity } of appearance.emitters) {
      material.emissiveIntensity = intensity * (1 + strength * 1.85);
    }
    field.position.z = 0.55 + deploy * 0.27;
    for (const [index, arc] of (wing ? wingArcs : arcs).entries()) {
      arc.visible = strength > 0.035;
      arc.scale.set(0.64 + deploy * 0.42, 0.7 + deploy * 0.31, 1);
      const spin = wing ? time * 0.68 + progress * 0.25 : time * 1.8 + progress;
      arc.rotation.set(0.21 * (index - 1), 0.18 * (index - 1), spin * (index === 1 ? -1 : 1) + index * 2.37);
      arc.material.opacity = strength * (index === 1 ? 0.53 : 0.72);
    }
  }

  update();
  return { object, update, appearance, anchors: { leftHand: arms[0].contact, rightHand: arms[1].contact, field } };
}
