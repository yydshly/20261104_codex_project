import * as THREE from 'three';

const up = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3(0, 0, 1);

function standard(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, ...options });
}

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = !material.transparent;
  parent.add(object);
  return object;
}

function ellipsoid(parent, material, x, y, z, sx, sy, sz, detail = 14) {
  const object = mesh(parent, new THREE.SphereGeometry(1, detail, 10), material, x, y, z);
  object.scale.set(sx, sy, sz);
  return object;
}

function cutPlate(points, depth, bevel) {
  const outline = new THREE.Shape();
  const [first, ...rest] = points;
  outline.moveTo(first[0], -first[1]);
  for (const [x, z] of rest) outline.lineTo(x, -z);
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth, bevelEnabled: true, bevelSegments: 1, bevelSize: bevel, bevelThickness: bevel,
  });
  return geometry.rotateX(-Math.PI / 2);
}

function stroke(parent, points, radius, material) {
  const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  return mesh(parent, new THREE.TubeGeometry(path, 12, radius, 5, false), material);
}

function setSegment(object, from, to, axis) {
  axis.subVectors(to, from);
  object.position.copy(from).addScaledVector(axis, 0.5);
  object.scale.y = axis.length();
  object.quaternion.setFromUnitVectors(up, axis.normalize());
}

export function createCrawler() {
  const object = new THREE.Group();
  const body = new THREE.Group();
  object.add(body);

  const metal = standard(0x527381, { metalness: 0.72, roughness: 0.31 });
  const shell = standard(0x1e3541, { metalness: 0.68, roughness: 0.38 });
  const silver = standard(0x8ea9af, { metalness: 0.67, roughness: 0.29 });
  const frame = standard(0x101923, { metalness: 0.5, roughness: 0.47 });
  const jade = standard(0x7ef8c9, { emissive: 0x0ddab2, emissiveIntensity: 1.1, roughness: 0.3 });
  const optic = new THREE.MeshBasicMaterial({ color: 0xb2ffe9 });

  ellipsoid(body, frame, 0, 0, -0.08, 0.55, 0.25, 0.9);
  const armor = cutPlate([[-0.2, -0.92], [0.2, -0.92], [0.5, -0.55], [0.5, 0.26], [0.34, 0.65],
    [-0.34, 0.65], [-0.5, 0.26], [-0.5, -0.55]], 0.22, 0.085);
  mesh(body, armor, shell, 0, 0.07, 0);

  const dorsal = cutPlate([[-0.25, -0.28], [0.25, -0.28], [0.35, -0.01], [0.23, 0.25],
    [-0.23, 0.25], [-0.35, -0.01]], 0.09, 0.035);
  for (const [y, z] of [[0.24, -0.52], [0.29, -0.16], [0.29, 0.21]]) {
    mesh(body, dorsal, metal, 0, y, z);
    const vent = mesh(body, new THREE.BoxGeometry(0.036, 0.028, 0.21), jade, 0, y + 0.125, z);
    vent.rotation.y = -0.09;
  }

  const shoulder = cutPlate([[-0.07, -0.24], [0.17, -0.12], [0.19, 0.16], [-0.02, 0.28],
    [-0.13, 0.09]], 0.1, 0.03);
  for (const side of [-1, 1]) {
    for (const z of [-0.63, -0.14, 0.35]) {
      const plate = mesh(body, shoulder, silver, side * 0.42, 0.17, z);
      plate.rotation.y = side * 0.19;
      plate.rotation.z = -side * 0.34;
      stroke(body, [[side * 0.29, 0.225, z - 0.16], [side * 0.46, 0.205, z - 0.11],
        [side * 0.53, 0.165, z - 0.035]], 0.015, jade);
    }
  }

  const head = new THREE.Group();
  head.position.set(0, -0.025, 0.63);
  body.add(head);
  const mask = cutPlate([[-0.25, -0.15], [0.25, -0.15], [0.32, 0.08], [0.17, 0.27],
    [-0.17, 0.27], [-0.32, 0.08]], 0.14, 0.055);
  mesh(head, mask, metal, 0, -0.06, 0);
  ellipsoid(head, frame, 0, -0.04, 0.22, 0.23, 0.095, 0.095);
  for (const side of [-1, 1]) {
    const eye = mesh(head, new THREE.BoxGeometry(0.12, 0.038, 0.035), optic, side * 0.105, 0.027, 0.32);
    eye.rotation.z = side * 0.26;
    ellipsoid(head, jade, side * 0.244, 0.07, 0.2, 0.033, 0.033, 0.033, 8);
  }

  const jaws = [-1, 1].map(side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.25, -0.1, 0.14);
    head.add(pivot);
    const claw = cutPlate([[0, -0.08], [side * 0.15, 0.025], [side * 0.2, 0.33],
      [side * 0.05, 0.54], [-side * 0.08, 0.49], [side * 0.075, 0.31],
      [-side * 0.07, 0.08]], 0.12, 0.025);
    mesh(pivot, claw, silver);
    stroke(pivot, [[side * 0.015, 0.14, 0.025], [side * 0.11, 0.14, 0.23],
      [side * 0.14, 0.14, 0.33]], 0.015, jade);
    return { pivot, side };
  });

  const upperGeometry = new THREE.CylinderGeometry(0.082, 0.125, 1, 6);
  const lowerGeometry = new THREE.CylinderGeometry(0.043, 0.092, 1, 6);
  const rodGeometry = new THREE.CylinderGeometry(0.019, 0.023, 1, 6);
  const hingeGeometry = new THREE.CylinderGeometry(0.105, 0.105, 0.17, 8).rotateZ(Math.PI / 2);
  const soleGeometry = cutPlate([[-0.052, -0.095], [0.052, -0.095], [0.083, 0.08], [0, 0.17],
    [-0.083, 0.08]], 0.06, 0.014);
  const toeGeometry = cutPlate([[-0.017, -0.032], [0.019, -0.032], [0.016, 0.1],
    [-0.012, 0.14]], 0.025, 0.009);
  const axis = new THREE.Vector3();
  const legs = [];

  for (const side of [-1, 1]) {
    for (let index = 0; index < 3; index++) {
      const hip = ellipsoid(object, frame, 0, 0, 0, 0.16, 0.12, 0.15, 8);
      const upper = mesh(object, upperGeometry, metal);
      const lower = mesh(object, lowerGeometry, shell);
      const piston = mesh(object, rodGeometry, silver);
      const hinge = mesh(object, hingeGeometry, frame);
      const hingeLight = ellipsoid(hinge, jade, side * 0.09, 0, 0, 0.022, 0.049, 0.049, 8);
      const foot = new THREE.Group();
      object.add(foot);
      mesh(foot, soleGeometry, metal);
      for (const toe of [-1, 1]) {
        const claw = mesh(foot, toeGeometry, silver, toe * 0.043, 0, 0.076);
        claw.rotation.y = toe * 0.32;
      }
      legs.push({ side, index, hip, upper, lower, piston, hinge, hingeLight, foot,
        joint: new THREE.Vector3(), end: new THREE.Vector3(), pistonFrom: new THREE.Vector3(),
        pistonTo: new THREE.Vector3() });
    }
  }

  function update({ time, gait, attack, impact }) {
    const stride = time * 10;
    const recoil = Math.sin(Math.PI * attack);
    const snap = Math.sin(Math.PI * attack) ** 2;
    body.position.set(0, 0.94 + Math.sin(stride * 2) * 0.017 * gait - recoil * 0.095, snap * 0.21 - impact * 0.1);
    body.rotation.set(impact * -0.08, impact * 0.07, Math.sin(stride) * 0.02 * gait);
    head.rotation.x = -0.12 * snap + Math.sin(time * 2.6) * 0.025;
    for (const { pivot, side } of jaws) {
      const windup = Math.sin(Math.PI * Math.min(attack * 2, 1));
      pivot.rotation.y = side * (0.18 + 0.47 * windup - 0.51 * snap);
    }

    for (const leg of legs) {
      const { index, side, hip, upper, lower, piston, hinge, hingeLight, foot, joint, end, pistonFrom, pistonTo } = leg;
      const phase = stride + (index + Number(side > 0)) * Math.PI;
      const step = Math.cos(phase) * 0.23 * gait;
      const lift = Math.max(0, Math.sin(phase)) * 0.24 * gait;
      const fan = (index - 1) * 0.14;
      const baseZ = (index - 1) * 0.49;
      hip.position.set(side * 0.44, body.position.y - 0.07, baseZ + body.position.z);
      joint.set(side * (0.83 + (1 - Math.abs(index - 1)) * 0.08 + 0.08 * recoil),
        0.64 + lift * 0.63, baseZ + fan * 0.6 + step * 0.52 + body.position.z * 0.5);
      foot.position.set(side * (1.09 + (1 - Math.abs(index - 1)) * 0.095 + 0.11 * recoil),
        0.018 + lift, baseZ + fan + step + (index === 2 ? snap * 0.11 : 0));
      foot.rotation.y = side * (0.55 + fan);
      hinge.position.copy(joint);
      hinge.rotation.y = side * fan;
      hingeLight.scale.x = 0.022 + recoil * 0.009;
      end.copy(foot.position).y += 0.045;
      setSegment(upper, hip.position, joint, axis);
      setSegment(lower, joint, end, axis);
      pistonFrom.copy(hip.position).z -= 0.07;
      pistonTo.copy(joint).z -= 0.064;
      setSegment(piston, pistonFrom, pistonTo, axis);
    }
  }

  update({ time: 0, gait: 0, attack: 0, impact: 0 });
  return { object, update };
}

function crownGeometry(profile) {
  const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const y = positions.getY(i);
    const angle = Math.atan2(z, x);
    const fold = Math.cos(angle * 8 + y * 2);
    positions.setXYZ(i, x * (1 + fold * 0.049), y + fold * 0.035 * (1 - y), z * (1 + fold * 0.049));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeTendril(parent, material, angle, length, radius, phaseOffset) {
  const rows = 19;
  const sides = 8;
  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(new Float32Array(rows * sides * 3), 3);
  positions.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positions);
  const indices = [];
  for (let row = 0; row < rows - 1; row++) {
    for (let side = 0; side < sides; side++) {
      const next = (side + 1) % sides;
      const a = row * sides + side;
      const b = a + sides;
      const c = (row + 1) * sides + next;
      const d = row * sides + next;
      indices.push(a, c, b, a, d, c);
    }
  }
  geometry.setIndex(indices);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -0.55, 0), 2.7);
  mesh(parent, geometry, material);

  const centers = Array.from({ length: rows }, () => new THREE.Vector3());
  const tangent = new THREE.Vector3();
  const radialX = new THREE.Vector3();
  const radialZ = new THREE.Vector3();
  const point = new THREE.Vector3();

  return function update(time, gait, attack, impact) {
    for (let row = 0; row < rows; row++) {
      const t = row / (rows - 1);
      const wave = Math.sin(time * 2.5 - t * 7 + phaseOffset);
      const fold = Math.cos(time * 1.85 - t * 4 + phaseOffset);
      const radial = 0.52 + t * (0.13 + wave * 0.19 + attack * 0.23);
      const theta = angle + fold * 0.44 * t;
      centers[row].set(Math.cos(theta) * radial, -t * length + t * t * (fold * 0.15 + attack * 0.5),
        Math.sin(theta) * radial + t * t * (attack * 0.94 - gait * 0.58 - impact * 0.3));
    }

    for (let row = 0; row < rows; row++) {
      const t = row / (rows - 1);
      tangent.subVectors(centers[Math.min(rows - 1, row + 1)], centers[Math.max(0, row - 1)]).normalize();
      radialX.crossVectors(tangent, forward).normalize();
      radialZ.crossVectors(tangent, radialX).normalize();
      const width = radius * (1 - t) ** 0.72 + 0.0025;
      for (let side = 0; side < sides; side++) {
        const theta = side * Math.PI * 2 / sides;
        point.copy(centers[row]).addScaledVector(radialX, Math.cos(theta) * width)
          .addScaledVector(radialZ, Math.sin(theta) * width);
        positions.setXYZ(row * sides + side, point.x, point.y, point.z);
      }
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  };
}

export function createWraith() {
  const object = new THREE.Group();
  const crown = new THREE.Group();
  object.add(crown);

  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xc297f5, emissive: 0x5134a4, emissiveIntensity: 0.38, roughness: 0.22,
    metalness: 0.12, clearcoat: 0.9, transparent: true, opacity: 0.51, depthWrite: false,
  });
  const velvet = standard(0x422566, { emissive: 0x4f2692, emissiveIntensity: 0.52, roughness: 0.49 });
  const flesh = standard(0xa275dc, { emissive: 0x6333bb, emissiveIntensity: 0.66, roughness: 0.42 });
  const filaments = standard(0xe8baff, { emissive: 0xb664fe, emissiveIntensity: 0.95, roughness: 0.28 });
  const pureLight = new THREE.MeshBasicMaterial({ color: 0xf5ddff });

  const mantle = mesh(crown, crownGeometry([[0.6, -0.038], [0.71, -0.015], [0.75, 0.052],
    [0.71, 0.16], [0.66, 0.33], [0.53, 0.49], [0.34, 0.61], [0.15, 0.67], [0, 0.68]]), shell);
  mantle.renderOrder = 2;
  const underside = mesh(crown, crownGeometry([[0.01, -0.19], [0.25, -0.16], [0.51, -0.09],
    [0.71, -0.014], [0.67, 0.09], [0.44, 0.17], [0, 0.21]]), velvet);
  const brain = ellipsoid(crown, flesh, 0, 0.3, 0, 0.42, 0.24, 0.42, 20);
  const core = mesh(crown, new THREE.IcosahedronGeometry(0.19, 2), pureLight, 0, 0.31, 0.31);
  ellipsoid(crown, flesh, 0, 0.28, 0.1, 0.23, 0.35, 0.28, 18);

  const halo = mesh(crown, new THREE.TorusGeometry(0.248, 0.014, 6, 46), filaments, 0, 0.31, 0.306);
  const rimPoints = Array.from({ length: 65 }, (_, i) => {
    const angle = i * Math.PI * 2 / 64;
    const r = 0.73 + Math.cos(angle * 8) * 0.026;
    return new THREE.Vector3(Math.cos(angle) * r, 0.019 + Math.cos(angle * 8) * 0.035, Math.sin(angle) * r);
  });
  const rimPath = new THREE.CatmullRomCurve3(rimPoints.slice(0, -1), true);
  mesh(crown, new THREE.TubeGeometry(rimPath, 64, 0.018, 5, true), filaments);

  const marks = [];
  for (let index = 0; index < 8; index++) {
    const theta = index * Math.PI / 4;
    const points = [[0.751, 0.06], [0.731, 0.18], [0.67, 0.35], [0.54, 0.5], [0.35, 0.615], [0.16, 0.671]]
      .map(([r, y], i) => [Math.cos(theta + i * 0.057) * r, y + 0.022, Math.sin(theta + i * 0.057) * r]);
    stroke(crown, points, index % 2 ? 0.009 : 0.014, index % 2 ? flesh : filaments);
    const mark = ellipsoid(crown, pureLight, Math.cos(theta) * 0.65, -0.047, Math.sin(theta) * 0.65,
      0.036, 0.035, 0.036, 8);
    marks.push(mark);
  }

  const tendrils = Array.from({ length: 8 }, (_, index) => {
    const primary = index % 2 === 0;
    return makeTendril(crown, primary ? flesh : filaments, index * Math.PI / 4 + 0.1,
      primary ? 1.51 + (index % 3) * 0.055 : 0.96 + (index % 3) * 0.085,
      primary ? 0.09 : 0.035, index * 0.91);
  });

  function update({ time, gait, attack, impact }) {
    const pulse = Math.sin(time * 3.3);
    const lash = Math.sin(Math.PI * attack) ** 2;
    const height = 1.84 + 0.095 * Math.sin(time * 2.35) + lash * 0.13;
    crown.position.set(0, height, lash * 0.27 - impact * 0.13);
    crown.rotation.set(0.10 * gait + 0.24 * lash - impact * 0.11, Math.sin(time * 1.1) * 0.055,
      0.062 * Math.sin(time * 1.4) + impact * 0.12);
    mantle.scale.set(1 + pulse * 0.039, 1 - pulse * 0.075, 1 + pulse * 0.039);
    underside.scale.set(1 + pulse * 0.03, 1 + pulse * 0.06, 1 + pulse * 0.03);
    brain.scale.set(0.42 + pulse * 0.02, 0.24 - pulse * 0.02, 0.42 + pulse * 0.02);
    core.rotation.set(time * 0.8, time * 1.1, time * 0.2);
    core.scale.set(0.93, 1.15, 0.74).multiplyScalar(1 + 0.15 * pulse + 0.35 * lash);
    halo.rotation.set(time * 0.31, 0.29 + 0.36 * Math.sin(time * 2), time * 0.4);
    marks.forEach((mark, index) => {
      const brightness = 0.032 + 0.01 * Math.sin(time * 4.5 + index * 0.7) + lash * 0.011;
      mark.scale.setScalar(brightness);
    });
    for (const tendril of tendrils) tendril(time, gait, lash, impact);
  }

  update({ time: 0, gait: 0, attack: 0, impact: 0 });
  return { object, update };
}
