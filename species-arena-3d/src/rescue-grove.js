import * as THREE from 'three';

export const GROVE_GROW = 2.66;
export const GROVE_CATCH = 3.42;
export const GROVE_LOWER = 5.42;
export const GROVE_LAND = 8.82;

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const CATCH_POSITION = new THREE.Vector3(-0.75, 3.36, 0);
const CATCH_ROTATION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.28);
const UP = new THREE.Vector3(0, 1, 0);
const DEPTH = new THREE.Vector3(0, 0, 1);
const WIDTH = new THREE.Vector3(1, 0, 0);

const ROOTS = [
  { root: [-2.83, 0.035, 1.06], grip: [-1.02, -0.70, 0.52], radius: 0.19, delay: 0 },
  { root: [1.32, 0.035, 1.12], grip: [1.01, -0.70, 0.53], radius: 0.18, delay: 0.047 },
  { root: [-2.63, 0.035, -1.29], grip: [-0.97, -0.70, -0.50], radius: 0.17, delay: 0.074 },
  { root: [1.17, 0.035, -1.34], grip: [0.93, -0.70, -0.50], radius: 0.17, delay: 0.021 },
  { root: [-1.56, 0.035, 1.84], grip: [-0.39, -0.70, 0.62], radius: 0.13, delay: 0.106 },
  { root: [0.11, 0.035, -1.89], grip: [0.34, -0.70, -0.61], radius: 0.13, delay: 0.128 },
];

function makeVine(material, segments, sides, radius, hue) {
  const positions = new Float32Array((segments + 1) * sides * 3);
  const normals = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length);
  const angles = Array.from({ length: sides }, (_, side) => side * Math.PI * 2 / sides);
  const indices = [];
  const baseColor = new THREE.Color(hue);
  const shootColor = new THREE.Color(0x96c94c);
  const color = new THREE.Color();
  for (let segment = 0; segment <= segments; segment++) {
    for (let side = 0; side < sides; side++) {
      const index = segment * sides + side;
      const ridge = 0.75 + (side % 3) * 0.13;
      color.copy(baseColor).lerp(shootColor, (segment / segments) ** 1.9 * 0.76).multiplyScalar(ridge);
      color.toArray(colors, index * 3);
      if (segment < segments) {
        const next = segment * sides + (side + 1) % sides;
        indices.push(index, next, index + sides, next, next + sides, index + sides);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const curve = new THREE.CubicBezierCurve3();
  const center = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const lastTangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const turn = new THREE.Quaternion();

  function grow(progress) {
    mesh.visible = progress > 0.001;
    if (!mesh.visible) return;
    for (let segment = 0; segment <= segments; segment++) {
      const along = segment / segments;
      const parameter = progress * along;
      curve.getPoint(parameter, center);
      curve.getTangent(parameter, tangent);
      if (segment === 0) normal.crossVectors(Math.abs(tangent.z) > 0.94 ? WIDTH : DEPTH, tangent).normalize();
      else normal.applyQuaternion(turn.setFromUnitVectors(lastTangent, tangent));
      lastTangent.copy(tangent);
      binormal.crossVectors(tangent, normal).normalize();
      const taper = lerp(1, 0.4, parameter) * (1 - 0.9 * smoothstep(along, 0.78, 1));
      const ring = radius * taper * (0.95 + Math.sin(parameter * 22) * 0.085);
      for (let side = 0; side < sides; side++) {
        const offset = (segment * sides + side) * 3;
        const angle = angles[side] + parameter * 1.4;
        radial.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle));
        positions[offset] = center.x + radial.x * ring;
        positions[offset + 1] = center.y + radial.y * ring;
        positions[offset + 2] = center.z + radial.z * ring;
        radial.toArray(normals, offset);
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  return { mesh, curve, grow };
}

function makeLeafGeometry() {
  const points = [0, 0, 0, -0.33, 0.39, 0, 0, 0.48, 0.16, 0.29, 0.51, 0, 0, 1, 0.025];
  const colors = [0.59, 0.71, 0.4, 0.64, 0.84, 0.49, 1, 1, 0.8, 0.74, 0.94, 0.52, 0.96, 1, 0.69];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex([0, 2, 1, 0, 3, 2, 1, 2, 4, 2, 3, 4]);
  geometry.computeVertexNormals();
  return geometry;
}

function makeRiders() {
  const group = new THREE.Group();
  const head = new THREE.IcosahedronGeometry(0.119, 1);
  const torso = new THREE.BoxGeometry(0.26, 0.33, 0.21);
  const hair = new THREE.MeshStandardMaterial({ color: 0x292628, roughness: 0.91 });
  const colors = [0x89663d, 0x567882, 0x8c5966];
  const riders = colors.map((color, index) => {
    const rider = new THREE.Group();
    const shirt = new THREE.Mesh(torso, new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
    const face = new THREE.Mesh(head, new THREE.MeshStandardMaterial({ color: [0x9b6751, 0xc69472, 0x825744][index], roughness: 0.9 }));
    const crown = new THREE.Mesh(head, hair);
    shirt.position.y = 0.18;
    face.position.set(0, 0.428, 0.035);
    crown.position.set(0, 0.48, 0.011);
    crown.scale.set(1.04, 0.72, 1.02);
    rider.position.set((index - 1) * 0.8, -0.18, -0.11);
    rider.add(shirt, face, crown);
    group.add(rider);
    return rider;
  });
  return { group, riders };
}

function createScatteredGrowth() {
  const geometry = new THREE.DodecahedronGeometry(1);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.84 });
  const mesh = new THREE.InstancedMesh(geometry, material, ROOTS.length * 5);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const pebble = new THREE.Object3D();
  const color = new THREE.Color();
  for (let index = 0; index < mesh.count; index++) {
    color.setHex(index % 3 === 0 ? 0x5e7332 : index % 3 === 1 ? 0x435939 : 0x535c4a);
    mesh.setColorAt(index, color);
  }

  function update(time) {
    mesh.visible = time >= GROVE_GROW;
    if (!mesh.visible) return;
    for (let index = 0; index < mesh.count; index++) {
      const stem = ROOTS[Math.floor(index / 5)];
      const local = index % 5;
      const phase = index * 2.39996;
      const reach = 0.13 + local * 0.083;
      const lift = smoothstep(time, GROVE_GROW + stem.delay, GROVE_GROW + stem.delay + 0.23);
      const skip = Math.sin(Math.PI * lift) * (0.05 + local * 0.015);
      const size = (0.057 + local * 0.021) * lift;
      pebble.position.set(stem.root[0] + Math.cos(phase) * reach, 0.025 + skip, stem.root[2] + Math.sin(phase) * reach);
      pebble.rotation.set(0.14 + phase, phase * 0.77, local * 0.39);
      pebble.scale.set(size, size * 0.55, size * 0.77);
      pebble.updateMatrix();
      mesh.setMatrixAt(index, pebble.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  return { mesh, update };
}

export function createGroveSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, emissive: 0x1b3205, emissiveIntensity: 0.23 });
  const stems = ROOTS.map(({ root, grip, radius, delay }, index) => {
    const vine = makeVine(material, 22, 7, radius, index % 2 ? 0x4d6a2d : 0x657c2c);
    vine.curve.v0.fromArray(root);
    const shoots = Array.from({ length: 3 }, (_, branch) => ({
      ...makeVine(material, 8, 5, radius * (0.49 - branch * 0.05), index % 2 ? 0x617b32 : 0x6f8331),
      along: 0.43 + branch * 0.18,
      flip: branch % 2 ? -1 : 1,
    }));
    object.add(vine.mesh, ...shoots.map(shoot => shoot.mesh));
    return { ...vine, shoots, grip: new THREE.Vector3().fromArray(grip), delay, side: Math.sign(grip[0]), outward: Math.sign(grip[2]) };
  });
  const braces = [[0, 1], [2, 3]].map(([first, second]) => {
    const vine = makeVine(material, 19, 6, 0.11, 0x678a30);
    object.add(vine.mesh);
    return { ...vine, first: stems[first], second: stems[second] };
  });

  const leaves = new THREE.InstancedMesh(makeLeafGeometry(), new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: 0.66, side: THREE.DoubleSide,
    emissive: 0x274309, emissiveIntensity: 0.29,
  }), stems.length * 10);
  leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  leaves.frustumCulled = false;
  leaves.castShadow = true;
  const leaf = new THREE.Object3D();
  const leafColor = new THREE.Color();
  const greens = [0xb1cf62, 0x8fbd46, 0x659741, 0xbad967, 0x4b843f, 0x9bb846];
  for (let index = 0; index < leaves.count; index++) {
    leafColor.setHex(greens[index % greens.length]);
    leaves.setColorAt(index, leafColor);
  }

  const motes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({
    color: 0xc4de68, toneMapped: false,
  }), 42);
  motes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  motes.frustumCulled = false;
  const mote = new THREE.Object3D();
  const growth = createScatteredGrowth();
  const { group: riderGroup, riders } = makeRiders();
  object.add(growth.mesh, leaves, motes, riderGroup);

  const canopyTarget = new THREE.Vector3();
  const leafDirection = new THREE.Vector3();
  const leafTwist = new THREE.Quaternion();

  function placeLeaf(index, curve, along, scale, direction, time) {
    curve.getPoint(along, leaf.position);
    leafDirection.set(direction * (0.52 + (index % 3) * 0.17), 0.68 + (index % 4) * 0.11, Math.sin(index * 1.72) * 0.68).normalize();
    leaf.quaternion.setFromUnitVectors(UP, leafDirection);
    leaf.quaternion.multiply(leafTwist.setFromAxisAngle(UP, Math.sin(index * 2.6) * 1.4 + 0.24 * Math.sin(time * 3.2 + index)));
    leaf.scale.set(scale * (0.77 + (index % 4) * 0.16), scale, scale);
    leaf.updateMatrix();
    leaves.setMatrixAt(index, leaf.matrix);
  }

  function update({ time, car, hero }) {
    const age = Math.max(0, time - GROVE_CATCH);
    const lowering = smoothstep(time, GROVE_LOWER, GROVE_LAND);
    const stress = age * Math.exp(-age * 4.55);
    const rebound = Math.sin(age * 8.0) * Math.exp(-age * 2.9);
    if (time >= GROVE_CATCH) {
      car.position.set(lerp(-0.75, -0.48, lowering) + age * Math.exp(-age * 3.45) * 0.87,
        lerp(3.36, 0.72, lowering) - stress * 3.42,
        lerp(0, -0.12, lowering) - stress * 0.23);
      car.rotation.set(rebound * 0.078, lowering * 0.06, -0.28 * Math.exp(-age * 3.15) + rebound * 0.066);
    }

    const arrival = smoothstep(time, 0.5, GROVE_GROW - 0.1);
    const retire = smoothstep(time, GROVE_LAND + 0.12, GROVE_LAND + 1.35);
    hero.position.set(lerp(-3.76, -2.47, arrival) - retire * 0.49, 0, lerp(3.67, 2.48, arrival) + retire * 0.35);
    hero.rotation.set(0, Math.atan2(-0.73 - hero.position.x, -hero.position.z), 0);

    const live = time >= GROVE_GROW;
    const spread = smoothstep(time, GROVE_LAND - 0.22, GROVE_LAND + 0.22);
    const surround = smoothstep(time, GROVE_LAND + 0.1, GROVE_LAND + 1.02);
    leaves.visible = live;
    for (const [index, stem] of stems.entries()) {
      const rise = smoothstep(time, GROVE_GROW + stem.delay, GROVE_CATCH);
      const anchor = stem.curve.v0;
      const fallCaught = time >= GROVE_CATCH;
      canopyTarget.copy(stem.grip);
      canopyTarget.z += stem.outward * 0.36 * spread;
      canopyTarget.y += surround * (0.48 + (index % 3) * 0.29);
      canopyTarget.x += stem.side * 0.18 * surround;
      canopyTarget.applyQuaternion(fallCaught ? car.quaternion : CATCH_ROTATION).add(fallCaught ? car.position : CATCH_POSITION);
      const end = stem.curve.v3.copy(canopyTarget);
      const stressBend = stress * 4.1;
      stem.curve.v1.set(anchor.x + stem.side * (0.34 + stressBend * 0.48), 0.16 + end.y * 0.42, anchor.z + stem.outward * (0.34 + stressBend * 0.45));
      stem.curve.v2.set(end.x + stem.side * (0.28 + stressBend * 0.42), Math.max(0.14, end.y * 0.54), end.z + stem.outward * (0.59 + stressBend * 0.54));
      stem.grow(rise);
      for (const [branchIndex, shoot] of stem.shoots.entries()) {
        const bloom = smoothstep(rise, shoot.along, Math.min(1, shoot.along + 0.19));
        const base = stem.curve.getPoint(shoot.along, shoot.curve.v0);
        const length = 0.55 + branchIndex * 0.11;
        const side = stem.side * shoot.flip;
        shoot.curve.v1.set(base.x + side * 0.18, base.y + 0.08, base.z + stem.outward * 0.18);
        shoot.curve.v2.set(base.x + side * length * 0.69, base.y + 0.17, base.z + stem.outward * length * 0.64);
        shoot.curve.v3.set(base.x + side * length, base.y + 0.41 + branchIndex * 0.07, base.z + stem.outward * length * 0.79);
        shoot.grow(bloom);
        for (let tip = 0; tip < 3; tip++) {
          const leafIndex = index * 10 + branchIndex * 3 + tip;
          const at = 0.47 + tip * 0.26;
          const size = (0.39 + (leafIndex % 3) * 0.07) * smoothstep(bloom, at - 0.16, at);
          placeLeaf(leafIndex, shoot.curve, at, size, side * (tip === 1 ? -1 : 1), time);
        }
      }
      placeLeaf(index * 10 + 9, stem.curve, Math.max(0, rise - 0.055), smoothstep(rise, 0.26, 0.98) * 0.37, stem.side, time);
    }
    for (const [index, brace] of braces.entries()) {
      const joined = smoothstep(time, GROVE_CATCH - 0.12 + index * 0.07, GROVE_CATCH + 0.24 + index * 0.08);
      const first = brace.first.curve.getPoint(0.84, brace.curve.v0);
      const second = brace.second.curve.getPoint(0.82, brace.curve.v3);
      const bend = brace.first.outward * (0.19 + stress * 2.9);
      brace.curve.v1.copy(first).lerp(second, 0.3);
      brace.curve.v2.copy(first).lerp(second, 0.7);
      brace.curve.v1.z += bend;
      brace.curve.v2.z += bend;
      brace.curve.v1.y = Math.max(0.045, brace.curve.v1.y - 0.07 - stress * 0.58);
      brace.curve.v2.y = Math.max(0.045, brace.curve.v2.y - 0.11 - stress * 0.77);
      brace.grow(joined);
    }
    leaves.instanceMatrix.needsUpdate = true;
    growth.update(time);

    const burst = time >= GROVE_CATCH ? age : time - GROVE_GROW;
    const burstLength = time >= GROVE_CATCH ? 1.16 : 0.8;
    motes.visible = burst >= 0 && burst < burstLength;
    if (motes.visible) {
      for (let index = 0; index < motes.count; index++) {
        const stem = stems[index % stems.length];
        const direction = index * 2.39996;
        const spread = burst * (0.49 + (index % 7) * 0.2);
        const center = time >= GROVE_CATCH ? car.position : stem.curve.v0;
        mote.position.set(center.x + Math.cos(direction) * spread,
          Math.max(0.036, (time >= GROVE_CATCH ? car.position.y - 0.59 : 0.03) + burst * (0.65 + index % 4 * 0.46) - burst * burst * 1.7),
          center.z + Math.sin(direction) * spread);
        mote.rotation.set(direction, direction * 0.7 + burst * 5, burst * 6 + index);
        const size = (0.026 + (index % 5) * 0.01) * (1 - smoothstep(burst, burstLength * 0.28, burstLength));
        mote.scale.set(size * 0.81, size * 1.22, size * 0.55);
        mote.updateMatrix();
        motes.setMatrixAt(index, mote.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;
    }

    riderGroup.position.copy(car.position);
    riderGroup.quaternion.copy(car.quaternion);
    for (const [index, rider] of riders.entries()) {
      rider.rotation.z = Math.sin(time * 3.4 + index * 1.6) * 0.027 + rebound * 0.12;
      rider.rotation.x = -stress * (0.48 + index * 0.14);
    }

    return {
      power: clamp(smoothstep(time, GROVE_GROW - 0.22, GROVE_CATCH - 0.08) * (1 - retire * 0.88) + stress * 0.41, 0, 1),
      running: 0.54 * Math.sin(arrival * Math.PI) + 0.28 * Math.sin(retire * Math.PI),
    };
  }

  return { object, update };
}
