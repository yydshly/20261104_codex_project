import * as THREE from 'three';

const { lerp, smoothstep } = THREE.MathUtils;
const up = new THREE.Vector3(0, 1, 0);
const front = new THREE.Vector3(0, 0, 1);
const catchCenter = new THREE.Vector3(2.64, 1.48, 0.35);
const releaseCenter = new THREE.Vector3(4.7, 0.76, 2.6);
const entryNormal = new THREE.Vector3(0.88, 0.12, -0.35).normalize();
const exitNormal = new THREE.Vector3(0.68, 0.28, -0.68).normalize();
const tau = Math.PI * 2;

function createVine(material, radius, color) {
  const segments = 22;
  const sides = 7;
  const positions = new Float32Array((segments + 1) * sides * 3);
  const normals = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length);
  const indices = [];
  const bark = new THREE.Color(color);
  const shoot = new THREE.Color(0x90c555);
  const shade = new THREE.Color();
  const angles = Array.from({ length: sides }, (_, index) => tau * index / sides);

  for (let ring = 0; ring <= segments; ring++) {
    for (let side = 0; side < sides; side++) {
      const index = ring * sides + side;
      shade.copy(bark).lerp(shoot, (ring / segments) ** 1.7 * 0.67);
      shade.multiplyScalar(0.78 + (side % 3) * 0.1).toArray(colors, index * 3);
      if (ring < segments) {
        const next = ring * sides + (side + 1) % sides;
        indices.push(index, next, index + sides, next, next + sides, index + sides);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const curve = new THREE.CubicBezierCurve3();
  const center = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const radial = new THREE.Vector3();

  function draw(growth) {
    mesh.visible = growth > 0.002;
    if (!mesh.visible) return;
    for (let ring = 0; ring <= segments; ring++) {
      const along = ring / segments;
      const position = along * growth;
      curve.getPoint(position, center);
      curve.getTangent(position, tangent);
      const reference = Math.abs(tangent.y) < 0.97 ? up : front;
      normal.crossVectors(reference, tangent).normalize();
      binormal.crossVectors(tangent, normal).normalize();
      const taper = (1 - position * 0.41) * (1 - smoothstep(along, 0.88, 1) * 0.93);
      const width = radius * taper * (1 + Math.sin(position * 27) * 0.08);
      for (let side = 0; side < sides; side++) {
        const angle = angles[side] + position * 1.25;
        radial.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle));
        const offset = (ring * sides + side) * 3;
        radial.toArray(normals, offset);
        positions[offset] = center.x + radial.x * width;
        positions[offset + 1] = center.y + radial.y * width;
        positions[offset + 2] = center.z + radial.z * width;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }
  return { mesh, curve, draw };
}

function leafGeometry() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, -0.36, 0.43, 0, 0, 0.49, 0.12, 0.30, 0.5, 0, 0, 1, -0.045,
  ], 3));
  geometry.setIndex([0, 2, 1, 0, 3, 2, 1, 2, 4, 2, 3, 4]);
  geometry.computeVertexNormals();
  return geometry;
}

function createGroveCradle() {
  const object = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.82, emissive: 0x283b0b, emissiveIntensity: 0.25,
  });
  const roots = [
    { anchor: [-0.48, 0.17, 1.33], offset: [0.34, 0.04, 0.68], color: 0x608839, width: 0.16 },
    { anchor: [-0.56, 0.065, 0.75], offset: [-0.07, -0.46, 0.14], color: 0x4c6931, width: 0.18 },
    { anchor: [-0.49, 0.13, 0.25], offset: [0.47, -0.16, -0.62], color: 0x709547, width: 0.155 },
    { anchor: [-0.48, 0.17, -0.46], offset: [0.67, 0.31, -0.92], color: 0x537842, width: 0.11 },
  ];
  const stems = roots.map(({ anchor, offset, color, width }, index) => {
    const stem = createVine(bark, width, color);
    stem.curve.v0.fromArray(anchor);
    const branches = [0.38, 0.58, 0.76].map((along, branch) => ({
      ...createVine(bark, width * 0.36, color), along, direction: (index + branch) % 2 ? -1 : 1,
    }));
    object.add(stem.mesh, ...branches.map(branch => branch.mesh));
    return { ...stem, branches, offset: new THREE.Vector3().fromArray(offset) };
  });
  const leaves = new THREE.InstancedMesh(leafGeometry(), new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.73, side: THREE.DoubleSide, emissive: 0x253e09, emissiveIntensity: 0.34,
  }), roots.length * 9);
  const buds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({
    color: 0xffe396, emissive: 0xc7ef64, emissiveIntensity: 0.77, roughness: 0.64,
  }), roots.length * 3);
  const spores = new THREE.InstancedMesh(new THREE.OctahedronGeometry(), new THREE.MeshBasicMaterial({
    color: 0xd8ff8f, toneMapped: false, transparent: true, depthWrite: false,
  }), 24);
  for (const mesh of [leaves, buds, spores]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    object.add(mesh);
  }
  const greens = [0xa2cd55, 0x739f3e, 0xcfdb67, 0x6ba946, 0x9cbc53];
  for (let index = 0; index < leaves.count; index++) leaves.setColorAt(index, new THREE.Color(greens[index % greens.length]));
  const center = new THREE.Vector3();
  const shootDirection = new THREE.Vector3();
  const twist = new THREE.Quaternion();
  const instance = new THREE.Object3D();

  function draw(time, satellite) {
    const retreat = smoothstep(time, 9.92, 11.48);
    object.visible = time > 2.9 && retreat < 1;
    if (!object.visible) return;
    center.copy(time < 6 ? catchCenter : satellite.position);
    center.lerp(releaseCenter, smoothstep(time, 9.58, 10.08));
    const age = Math.max(0, time - 6);
    const compression = Math.sin(age * 9) * Math.exp(-age * 3.2) * 0.15;
    for (const [index, stem] of stems.entries()) {
      const growth = smoothstep(time, 2.94 + index * 0.15, 5.94) * (1 - retreat);
      const { v0, v1, v2, v3 } = stem.curve;
      v3.copy(center).add(stem.offset);
      v3.y -= compression;
      v1.set(v0.x + 0.89, v0.y + 0.46 + 0.11 * index, v0.z + (index - 1.5) * -0.14);
      v2.set(v3.x - 0.72, Math.max(0.18, v3.y - 0.91 - compression), v3.z + (index - 1.5) * -0.24);
      stem.draw(growth);
      for (const [branchIndex, branch] of stem.branches.entries()) {
        const { curve } = branch;
        const open = smoothstep(growth, branch.along, branch.along + 0.18);
        const branchZ = branch.direction * (0.38 + branchIndex * 0.086);
        stem.curve.getPoint(branch.along, curve.v0);
        const { x, y, z } = curve.v0;
        curve.v1.set(x + 0.09, y + 0.045, z + branchZ * 0.31);
        curve.v2.set(x + 0.30, y + 0.23, z + branchZ * 0.75);
        curve.v3.set(x + 0.42, y + 0.35 + branchIndex * 0.045, z + branchZ);
        branch.draw(open);
        for (let leafIndex = 0; leafIndex < 3; leafIndex++) {
          const at = 0.43 + leafIndex * 0.24;
          const leafSpread = smoothstep(open, at - 0.27, at);
          curve.getPoint(at, instance.position);
          shootDirection.set(0.32 + leafIndex * 0.1, 0.75, branch.direction * (leafIndex === 1 ? -0.85 : 0.85)).normalize();
          instance.quaternion.setFromUnitVectors(up, shootDirection);
          twist.setFromAxisAngle(up, Math.sin(time * 3.5 + branchIndex * 2 + leafIndex) * 0.46 + leafIndex * 0.62);
          instance.quaternion.multiply(twist);
          instance.scale.setScalar((0.31 + leafIndex * 0.045) * leafSpread);
          instance.updateMatrix();
          leaves.setMatrixAt(index * 9 + branchIndex * 3 + leafIndex, instance.matrix);
        }
        curve.getPoint(0.91, instance.position);
        instance.scale.setScalar(0.071 * smoothstep(open, 0.69, 0.99));
        instance.updateMatrix();
        buds.setMatrixAt(index * 3 + branchIndex, instance.matrix);
      }
    }
    leaves.instanceMatrix.needsUpdate = true;
    buds.instanceMatrix.needsUpdate = true;
    const sporeStrength = smoothstep(time, 3.25, 5.1) * (1 - retreat);
    spores.material.opacity = 0.62 * sporeStrength;
    for (let index = 0; index < spores.count; index++) {
      const stem = stems[index % stems.length];
      const drift = (time * 0.46 + index * 0.618) % 1;
      stem.curve.getPoint(0.22 + drift * 0.72, instance.position);
      instance.position.y += 0.25 + 0.29 * Math.sin(drift * Math.PI);
      instance.position.z += Math.sin(index * 2.399 + time * 1.8) * 0.31;
      instance.rotation.set(time + index, drift * 4, index);
      instance.scale.setScalar((0.016 + index % 3 * 0.005) * sporeStrength * Math.sin(drift * Math.PI));
      instance.updateMatrix();
      spores.setMatrixAt(index, instance.matrix);
    }
    spores.instanceMatrix.needsUpdate = true;
  }
  return { object, draw };
}

const gateVertex = `
  varying vec2 gateUV;
  void main() {
    gateUV = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gateFragment = `
  uniform float time;
  uniform float energy;
  uniform float surge;
  uniform vec3 tint;
  varying vec2 gateUV;
  void main() {
    float radius = length(gateUV);
    float angle = atan(gateUV.y, gateUV.x);
    float swirls = 0.5 + 0.5 * sin(angle * 4.0 + radius * 15.0 - time * 5.0
                                    + sin(angle * 7.0 - time * 3.0) * 0.5);
    float current = pow(swirls, 6.0) * smoothstep(0.16, 0.88, radius);
    float inside = 1.0 - smoothstep(0.79, 0.83, radius);
    float edge = radius - 0.82;
    float fringe = exp(-edge * edge * 100.0) * 0.48;
    float rim = exp(-edge * edge * 5329.0);
    float offset = radius - mod(time * 0.88, 0.75);
    float wave = exp(-offset * offset * 841.0) * inside * 0.13;
    vec3 color = mix(vec3(0.043, 0.009, 0.10), tint, clamp(current * 0.85 + fringe + wave + surge * 0.24, 0.0, 1.0));
    color = mix(color, vec3(1.0, 0.89, 1.0), rim * 0.77);
    float alpha = clamp((inside * (0.62 + current * 0.31) + fringe + rim) * energy, 0.0, 0.98);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

function createGate(normal, exit) {
  const object = new THREE.Group();
  object.quaternion.setFromUnitVectors(front, normal);
  const radius = 1.33;
  const tint = exit ? 0xbe81ff : 0xff8bf6;
  const relayGlint = new THREE.Color(0xffdc97);
  const aperture = new THREE.Mesh(new THREE.PlaneGeometry(3.25, 3.25), new THREE.ShaderMaterial({
    vertexShader: gateVertex, fragmentShader: gateFragment, transparent: true, depthWrite: false,
    uniforms: { time: { value: 0 }, energy: { value: 0 }, surge: { value: 0 }, tint: { value: new THREE.Color(tint) } },
    side: THREE.DoubleSide, toneMapped: false,
  }));
  object.add(aperture);
  const ringMaterials = [0xffd0ff, tint, 0xa972ff].map(color => new THREE.MeshBasicMaterial({
    color, toneMapped: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const rings = [0, 1, 2].map(index => {
    const group = new THREE.Group();
    const segmentCount = [2, 3, 8][index];
    const span = tau / segmentCount * [0.76, 0.64, 0.41][index];
    const arc = new THREE.TorusGeometry(radius + [0.009, 0.123, 0.247][index], [0.031, 0.018, 0.013][index], 5, 40, span);
    for (let segment = 0; segment < segmentCount; segment++) {
      const mesh = new THREE.Mesh(arc, ringMaterials[index]);
      mesh.rotation.z = tau * segment / segmentCount;
      group.add(mesh);
    }
    group.position.z = (index - 1) * 0.062;
    object.add(group);
    return group;
  });
  const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(), new THREE.MeshBasicMaterial({
    color: tint, transparent: true, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false,
  }), 44);
  sparks.frustumCulled = false;
  sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  object.add(sparks);
  const spark = new THREE.Object3D();

  function draw(time, position, relay = false) {
    const start = exit ? 3.73 : 3.18;
    const opened = smoothstep(time, start, start + 1.1);
    const shutdown = exit ? smoothstep(time, 7.42, 8.59) : smoothstep(time, 6.19, 7.03);
    const level = opened * (1 - shutdown);
    object.visible = level > 0.005;
    if (!object.visible) return;
    const transferTime = exit ? 6.17 : 5.94;
    const offset = (time - transferTime) / 0.25;
    const surge = Math.exp(-offset * offset);
    object.position.copy(position);
    object.scale.set(
      (0.18 + level * 0.82) * (1 + surge * 0.067),
      (0.37 + level * 0.63) * (1 + surge * 0.054),
      1,
    );
    aperture.material.uniforms.time.value = time * (exit ? -1 : 1);
    aperture.material.uniforms.energy.value = level;
    aperture.material.uniforms.surge.value = surge;
    ringMaterials[1].color.setHex(tint).lerp(relayGlint, relay && !exit ? surge * 0.88 : 0);
    rings.forEach((ring, index) => {
      ring.rotation.z = time * [1.5, -0.9, 0.47][index] + index;
      ring.scale.setScalar(1 + 0.017 * Math.sin(time * 4.8 + index) + surge * 0.12 * index);
      ringMaterials[index].opacity = level * ([0.93, 0.65, 0.53][index] + surge * 0.07);
    });
    sparks.material.opacity = level * (0.47 + surge * 0.42);
    for (let index = 0; index < sparks.count; index++) {
      const drift = (time * (0.47 + index % 5 * 0.07) + index * 0.3819) % 1;
      const angle = index * 2.399 + time * (exit ? -1.43 : 1.31) + drift * 0.8;
      const distance = radius * (0.8 + (exit ? drift : 1 - drift) * (0.33 + surge * 0.28));
      spark.position.set(Math.cos(angle) * distance, Math.sin(angle) * distance,
        Math.sin(index * 4.3) * (0.08 + drift * 0.38));
      spark.rotation.set(time * 3.4, angle, index);
      const size = (0.016 + (index % 4) * 0.009) * Math.sin(drift * Math.PI);
      spark.scale.set(size, size * (1.17 + surge * 2.1), size);
      spark.updateMatrix();
      sparks.setMatrixAt(index, spark.matrix);
    }
    sparks.instanceMatrix.needsUpdate = true;
  }
  return { object, draw };
}

function makeEchoGeometry() {
  const segments = [];
  function outline(solid, x, y, z) {
    const edges = new THREE.EdgesGeometry(solid);
    edges.translate(x, y, z);
    segments.push(...edges.attributes.position.array);
    edges.dispose();
    solid.dispose();
  }
  const core = new THREE.CylinderGeometry(0.49, 0.49, 1.16, 8);
  core.rotateZ(Math.PI / 2);
  outline(core, 0, 0, 0);
  for (const side of [-1, 1]) {
    outline(new THREE.BoxGeometry(0.12, 0.10, 0.50), 0, 0, side * 0.77);
    outline(new THREE.BoxGeometry(1.27, 0.04, 0.78), 0, 0, side * 1.4);
    for (const stripe of [-0.34, 0, 0.34]) {
      segments.push(stripe, 0.027, side * 1.01, stripe, 0.027, side * 1.79);
    }
    segments.push(-0.64, 0.027, side * 1.4, 0.64, 0.027, side * 1.4);
  }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
}

function createRewindField() {
  const object = new THREE.Group();
  const clock = new THREE.Group();
  const brass = new THREE.MeshBasicMaterial({ color: 0xffcf7d, transparent: true, depthWrite: false, toneMapped: false });
  const pale = brass.clone();
  pale.color.setHex(0xfff1c7);
  const cool = brass.clone();
  cool.color.setHex(0xd5b7ff);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.017, 5, 96), brass);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.009, 5, 96), cool);
  clock.add(outer, inner);

  const sweep = new THREE.Group();
  const arcGeometry = new THREE.TorusGeometry(1.42, 0.022, 5, 48, 1.02);
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    const arc = new THREE.Mesh(arcGeometry, pale);
    arc.rotation.z = quadrant * Math.PI / 2;
    sweep.add(arc);
  }
  clock.add(sweep);
  const tickGeometry = new THREE.BoxGeometry(1, 1, 1);
  const markers = new THREE.InstancedMesh(tickGeometry, brass, 48);
  const marker = new THREE.Object3D();
  for (let index = 0; index < markers.count; index++) {
    const angle = index / markers.count * tau;
    const major = index % 4 === 0;
    marker.position.set(Math.sin(angle) * 1.21, Math.cos(angle) * 1.21, 0.01);
    marker.rotation.z = -angle;
    marker.scale.set(major ? 0.034 : 0.011, major ? 0.19 : 0.056, 0.017);
    marker.updateMatrix();
    markers.setMatrixAt(index, marker.matrix);
  }
  clock.add(markers);
  const hands = [0.68, 0.99].map((length, index) => {
    const pivot = new THREE.Group();
    const hand = new THREE.Mesh(tickGeometry, index ? pale : brass);
    hand.position.set(0, length * 0.37, 0.02);
    hand.scale.set(index ? 0.021 : 0.043, length, 0.024);
    const pointer = new THREE.Mesh(new THREE.ConeGeometry(index ? 0.042 : 0.063, 0.12, 4), index ? pale : brass);
    pointer.position.set(0, length * 0.9, 0.025);
    pivot.add(hand, pointer);
    clock.add(pivot);
    return pivot;
  });
  const pin = new THREE.Mesh(new THREE.OctahedronGeometry(0.066), pale);
  clock.add(pin);
  clock.rotation.set(-0.12, 0.23, 0.04);
  object.add(clock);

  const echoGeometry = makeEchoGeometry();
  const echoes = Array.from({ length: 4 }, (_, index) => {
    const echo = new THREE.LineSegments(echoGeometry, new THREE.LineBasicMaterial({
      color: index % 2 ? 0xd6bcff : 0xffd18a, transparent: true, depthWrite: false, toneMapped: false,
    }));
    object.add(echo);
    return echo;
  });
  const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({
    color: 0xffc675, transparent: true, depthWrite: false, toneMapped: false, dashSize: 0.068, gapSize: 0.047,
  }));
  trail.frustumCulled = false;
  object.add(trail);
  const fragments = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), pale.clone(), 42);
  fragments.frustumCulled = false;
  fragments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const fragment = new THREE.Object3D();
  for (let index = 0; index < fragments.count; index++) {
    fragments.setColorAt(index, new THREE.Color(index % 4 === 0 ? 0xd7baff : 0xffdd9b));
  }
  object.add(fragments);
  const castPoint = new THREE.Vector3();
  const clockPoint = new THREE.Vector3();
  const castOffset = new THREE.Vector3(0.42, 1.38, 0);
  const clockOffset = new THREE.Vector3(-0.67, 0.53, -0.86);
  let path;

  function samplePath(unit, result) {
    const position = Math.min(path.length - 1, Math.max(0, unit * (path.length - 1)));
    const first = Math.floor(position);
    return result.copy(path[first]).lerp(path[Math.min(first + 1, path.length - 1)], position - first);
  }

  function draw({ time, motionTime, hero, satellite, rewindPath, entry, relay }) {
    const charge = smoothstep(time, 3.12, 4.84);
    const fade = 1 - smoothstep(time, 8.93, 10.36);
    const intensity = charge * fade;
    object.visible = intensity > 0.004;
    if (!object.visible) return;
    if (path !== rewindPath) {
      path = rewindPath;
      trail.geometry.dispose();
      trail.geometry = new THREE.BufferGeometry().setFromPoints(path);
      trail.computeLineDistances();
    }
    const reversal = smoothstep(time, 5.66, 6.22);
    const sourceStart = relay ? 4.45 : 6;
    const sourceEnd = relay ? 2.85 : 2.35;
    const sourceTime = relay && time >= 8.8 ? sourceEnd : motionTime;
    const consumed = Math.max(0, (sourceStart - sourceTime) / (sourceStart - sourceEnd));
    const progress = Math.min(1, consumed) * reversal * (relay ? 0.83 : 1);
    const clockSize = 0.48 + 0.7 * charge + 0.24 * reversal - 0.42 * (1 - fade);
    if (hero?.anchors?.field) hero.anchors.field.getWorldPosition(castPoint);
    else castPoint.copy(hero.object.position).add(castOffset);
    castPoint.x += 0.53;
    castPoint.z -= 0.50;
    clockPoint.copy(satellite.position);
    if (relay) {
      const handoff = smoothstep(time, 8.2, 9.35);
      // Let the clock fade at the entry while the satellite crosses to the exit.
      clockPoint.lerp(entry, smoothstep(time, 8.82, 9.60));
      clockPoint.x -= handoff * 0.71;
      clockPoint.y += handoff * 0.37;
      clockPoint.z -= handoff * 0.19;
    }
    clockPoint.add(clockOffset);
    clock.position.copy(castPoint).lerp(clockPoint, smoothstep(time, 4.33, 6.07));
    clock.scale.setScalar(clockSize);
    brass.opacity = intensity * (0.72 + reversal * 0.22);
    pale.opacity = intensity * 0.88;
    cool.opacity = intensity * 0.66;
    const dialTime = relay ? sourceTime : time < 6 ? time : motionTime;
    hands[0].rotation.z = 0.71 - dialTime * 0.92;
    hands[1].rotation.z = 1.05 - dialTime * 3.32;
    sweep.rotation.z = time * 0.39 + progress * 5.7;

    const trailStart = Math.min(path.length - 1, Math.floor(progress * (path.length - 1)));
    const residual = 1 - smoothstep(progress, 0.69, 1);
    trail.geometry.setDrawRange(trailStart, path.length - trailStart);
    trail.material.opacity = intensity * reversal * residual * 0.72;
    trail.visible = trail.material.opacity > 0.005;

    const afterimage = intensity * reversal * (1 - smoothstep(progress, 0.55, 0.99));
    echoes.forEach((echo, index) => {
      echo.visible = afterimage > 0.01;
      if (!echo.visible) return;
      const offset = (index + 1) * 0.17;
      const pulse = 0.63 + 0.37 * Math.sin(time * 7.3 + index * 1.25);
      const sample = progress + (1 - progress) * offset;
      const historic = lerp(sourceStart, sourceEnd, sample);
      samplePath(sample, echo.position);
      echo.rotation.set(historic * 0.42 - 0.64, historic * 0.61, Math.sin(historic * 1.19) * 0.48);
      echo.scale.setScalar(1 - index * 0.055);
      echo.material.opacity = afterimage * pulse * (0.61 - index * 0.105);
    });

    fragments.material.opacity = intensity * (0.63 + reversal * 0.28);
    for (let index = 0; index < fragments.count; index++) {
      const drift = (time * (0.64 + index % 5 * 0.078) + index * 0.618) % 1;
      const angle = index * 2.399 + dialTime * 2.1 + drift * Math.PI;
      const radius = lerp(1.55, 0.26, drift) * (0.65 + index % 7 * 0.072);
      if (index < 27) {
        samplePath(progress + (1 - progress) * (1 - drift), fragment.position);
        fragment.position.x += Math.cos(angle) * radius * 0.5;
      } else {
        fragment.position.copy(clock.position);
        fragment.position.x += Math.cos(angle) * radius;
      }
      fragment.position.y += Math.sin(angle) * radius;
      fragment.position.z += Math.sin(angle * 0.71) * radius * 0.53;
      fragment.rotation.set(angle, index, dialTime * 4.8);
      const size = (0.021 + (index % 4) * 0.008) * Math.sin(drift * Math.PI);
      const visibility = index < 27 ? reversal * residual : charge;
      fragment.scale.set(size * 1.55, size, size).multiplyScalar(visibility);
      fragment.updateMatrix();
      fragments.setMatrixAt(index, fragment.matrix);
    }
    fragments.instanceMatrix.needsUpdate = true;
  }
  return { object, draw };
}

export function createOrbitRouteEffects(scene) {
  const cradle = createGroveCradle();
  const entryGate = createGate(entryNormal, false);
  const exitGate = createGate(exitNormal, true);
  let rewind;
  for (const { object } of [cradle, entryGate, exitGate]) {
    object.visible = false;
    scene.add(object);
  }

  function update(state) {
    const { heroId, time, satellite, entry, exit, mission, rewindHero, rewindFxTime, portalFxTime } = state;
    const relay = mission === 'relay';
    if (!relay && heroId === 'grove') cradle.draw(time, satellite);
    else cradle.object.visible = false;
    if (relay || heroId === 'portal') {
      const gateTime = relay ? portalFxTime : time;
      entryGate.draw(gateTime, entry, relay);
      exitGate.draw(gateTime, exit);
    } else {
      entryGate.object.visible = false;
      exitGate.object.visible = false;
    }
    if (relay || heroId === 'rewind') {
      if (!rewind) {
        rewind = createRewindField();
        scene.add(rewind.object);
      }
      rewind.draw({
        ...state,
        time: relay ? rewindFxTime : time,
        hero: relay ? rewindHero : state.hero,
        relay,
      });
    } else if (rewind) rewind.object.visible = false;
  }
  return { update };
}
