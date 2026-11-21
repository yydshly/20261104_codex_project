import * as THREE from 'three';

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

function lightMaterial(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color, opacity, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, toneMapped: false, forceSinglePass: true,
  });
}

function ring(inner, outer, color, opacity, start = 0, angle = TAU) {
  return new THREE.Mesh(new THREE.RingGeometry(inner, outer, 96, 1, start, angle), lightMaterial(color, opacity));
}

function particleTexture() {
  const size = 24;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const radius = Math.hypot(x - 11.5, y - 11.5) / 11.5;
      const offset = (y * size + x) * 4;
      pixels.set([255, 255, 255, 255 * Math.max(0, 1 - radius) ** 1.8], offset);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function particles(count, color, size, texture) {
  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positions);
  const material = new THREE.PointsMaterial({
    color, size, map: texture, transparent: true, opacity: 0.85, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, positions, material };
}

function gravityColumn() {
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, strength: { value: 0 } },
    vertexShader: `
      varying vec2 fieldUv;
      void main() {
        fieldUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 fieldUv;
      uniform float time;
      uniform float strength;
      void main() {
        float twist = fieldUv.x * 75.398 + fieldUv.y * 5.0 - time * 1.25;
        float ribs = smoothstep(0.66, 1.0, cos(twist));
        float frequency = fieldUv.y * 27.0 - time * 7.4 + sin(twist * 0.25) * 0.4;
        float bands = smoothstep(0.58, 1.0, cos(frequency));
        float fade = smoothstep(0.0, 0.18, fieldUv.y) * (1.0 - smoothstep(0.76, 1.0, fieldUv.y));
        float alpha = (0.02 + ribs * 0.115 + bands * (0.032 + ribs * 0.07)) * fade * strength;
        gl_FragColor = vec4(1.0, 0.55 + bands * 0.17, 0.18, alpha);
      }
    `,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, toneMapped: false, forceSinglePass: true,
  });
  return new THREE.Mesh(new THREE.CylinderGeometry(1.37, 0.53, 1, 64, 1, true), material);
}

function gravityEffect(texture) {
  const object = new THREE.Group();
  const orbit = new THREE.Group();
  const rings = [
    ring(0.59, 0.66, 0xffb74c, 0.78, 0, TAU * 0.87),
    ring(1.21, 1.28, 0xffdc8d, 0.92, 0, TAU * 0.82),
    ring(1.56, 1.62, 0xff9736, 0.71, 0, TAU * 0.76),
    ring(1.81, 1.89, 0xffb750, 0.50, 0, TAU * 0.69),
  ];
  rings.forEach(mesh => orbit.add(mesh));
  const ground = ring(0.86, 0.93, 0xffae5b, 0.38);
  ground.rotation.x = -Math.PI / 2;
  const column = gravityColumn();
  const sparks = particles(54, 0xffce70, 0.17, texture);
  const handGlow = particles(14, 0xffc064, 0.16, texture);
  const light = new THREE.PointLight(0xffa833, 10, 5, 2);
  const handLight = new THREE.PointLight(0xffba52, 2.5, 3, 2);
  orbit.add(sparks.points, light);
  object.add(orbit, ground, column, handGlow.points, handLight);

  function update(time, power, car, hero) {
    object.visible = power > 0.001;
    if (!object.visible) return;
    orbit.position.copy(car);
    orbit.position.y -= 0.76;
    ground.position.set(car.x, 0.03, car.z);
    const groundPulse = (time * 0.75) % 1;
    ground.scale.setScalar(1.05 + groundPulse * 1.9);
    ground.material.opacity = (1 - groundPulse) * 0.42 * power;
    const fieldHeight = Math.max(0.01, car.y - 0.83);
    column.visible = fieldHeight > 0.06;
    column.position.set(car.x, fieldHeight / 2 + 0.055, car.z);
    column.scale.y = fieldHeight;
    column.material.uniforms.time.value = time;
    column.material.uniforms.strength.value = power;
    light.intensity = 12 * power;

    rings.forEach((mesh, index) => {
      mesh.position.y = -0.10 - 0.14 * index + Math.sin(time * 3.1 + index) * 0.07;
      mesh.rotation.set(-Math.PI / 2 + Math.sin(time * 1.55 + index) * 0.13, Math.cos(time * 1.35 + index) * 0.12, time * (index % 2 ? 0.75 : -0.55) + index * 1.8);
      mesh.scale.setScalar(0.64 + power * 0.36 + Math.sin(time * 4.7 + index * 0.72) * 0.042);
      mesh.material.opacity = (0.86 - index * 0.14) * power;
    });

    for (let index = 0; index < sparks.positions.count; index++) {
      const phase = (index / sparks.positions.count + time * (0.41 + (index % 4) * 0.045)) % 1;
      const angle = index * 2.39996 + time * 0.71;
      const radius = 1.58 - phase * 0.71 + Math.sin(index * 7.8) * 0.18;
      sparks.positions.setXYZ(index, Math.cos(angle) * radius, phase * 1.63 - 0.79, Math.sin(angle) * radius * 0.68);
    }
    sparks.positions.needsUpdate = true;
    sparks.material.opacity = power * 0.92;

    handGlow.points.visible = Boolean(hero);
    handLight.visible = Boolean(hero);
    if (!hero) return;
    handLight.position.copy(hero);
    handLight.position.y += 1.34;
    handLight.intensity = power * 3.4;
    handGlow.points.position.copy(handLight.position);
    for (let index = 0; index < handGlow.positions.count; index++) {
      const angle = index * 2.39996 + time * 4;
      const radius = 0.31 + Math.sin(index * 7.1 + time * 2.9) * 0.17;
      handGlow.positions.setXYZ(index, Math.cos(angle) * radius, Math.sin(angle * 1.72) * 0.29, Math.sin(angle) * radius);
    }
    handGlow.positions.needsUpdate = true;
    handGlow.material.opacity = power * 0.68;
  }

  return { object, update };
}

const iceSection = [
  [-1.09, -0.56], [-0.98, -0.66], [-0.76, -0.75], [0.76, -0.75], [0.98, -0.66],
  [1.09, -0.56], [0.94, -0.94], [0.49, -1.13], [-0.53, -1.12], [-0.94, -0.96],
];
const faceColors = [0x85e8ff, 0x61c1ed, 0x4293c5, 0x6edaf5, 0xc0f4ff, 0x37779b, 0x2a547d, 0x172f53, 0x274d72, 0x4f96bd]
  .map(color => new THREE.Color(color));

function iceTrack(curve) {
  const segments = 64;
  const rows = [];
  const tangent = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const point = new THREE.Vector3();
  const shellPositions = [];
  const colors = [];
  const railPositions = [];
  const sideNoise = (index, side) => Math.sin(index * 3.18 + side * 2.7) * 0.047;

  for (let step = 0; step <= segments; step++) {
    curve.getPointAt(step / segments, point);
    curve.getTangentAt(step / segments, tangent);
    axis.set(-tangent.z, 0, tangent.x).normalize();
    rows.push(iceSection.map(([side, offset], index) => {
      const vertex = point.clone().addScaledVector(axis, side + sideNoise(step, index));
      vertex.y += offset + (index === 2 || index === 3 ? 0 : Math.sin(step * 2.71 + index) * 0.033);
      return vertex;
    }));
  }

  function addQuad(positions, a, b, c, d) {
    for (const vertex of [a, b, c, c, b, d]) positions.push(vertex.x, vertex.y, vertex.z);
  }

  for (let step = 0; step < segments; step++) {
    for (let index = 0; index < iceSection.length; index++) {
      const next = (index + 1) % iceSection.length;
      addQuad(shellPositions, rows[step][index], rows[step][next], rows[step + 1][index], rows[step + 1][next]);
      const color = faceColors[index];
      for (let vertex = 0; vertex < 6; vertex++) {
        const shade = 0.88 + Math.sin(step * 0.74 + index * 3.2 + Math.floor(vertex / 3) * 0.24) * 0.105;
        colors.push(color.r * shade, color.g * shade, color.b * shade);
      }
    }

    const railVertex = (row, edge, t) => {
      const vertex = rows[row][edge].clone().lerp(rows[row][edge + 1], t);
      vertex.y += 0.018;
      return vertex;
    };
    for (const edge of [0, 4]) {
      addQuad(railPositions, railVertex(step, edge, 0.10), railVertex(step, edge, 0.46),
        railVertex(step + 1, edge, 0.10), railVertex(step + 1, edge, 0.46));
    }
  }

  const shellGeometry = new THREE.BufferGeometry();
  shellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shellPositions, 3));
  shellGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  shellGeometry.computeVertexNormals();
  const shell = new THREE.Mesh(shellGeometry, new THREE.MeshStandardMaterial({
    vertexColors: true, emissive: 0x103d73, emissiveIntensity: 0.52,
    metalness: 0.16, roughness: 0.39, flatShading: true, side: THREE.DoubleSide,
  }));
  shell.receiveShadow = true;

  const rails = new THREE.BufferGeometry();
  rails.setAttribute('position', new THREE.Float32BufferAttribute(railPositions, 3));
  const detail = new THREE.Mesh(rails, lightMaterial(0x89dfff, 0.83));

  const shardCount = 102;
  const shards = new THREE.InstancedMesh(new THREE.ConeGeometry(0.135, 1, 5), new THREE.MeshStandardMaterial({
    color: 0xa0e8ff, emissive: 0x22679c, emissiveIntensity: 0.52,
    roughness: 0.26, metalness: 0.13, flatShading: true,
  }), shardCount);
  shards.frustumCulled = false;
  const dummy = new THREE.Object3D();
  const direction = new THREE.Vector3();
  for (let index = 0; index < shardCount; index++) {
    const fraction = (Math.floor(index / 2) + 0.25) / (shardCount / 2);
    const side = index % 2 ? -1 : 1;
    curve.getPointAt(fraction, point);
    curve.getTangentAt(fraction, tangent);
    axis.set(-tangent.z, 0, tangent.x).normalize();
    direction.copy(axis).multiplyScalar(side * (0.29 + Math.sin(index * 1.78) * 0.19));
    direction.y = -0.92 + Math.cos(index * 1.93) * 0.25;
    direction.addScaledVector(tangent, Math.sin(index * 2.65) * 0.34).normalize();
    const length = Math.min(0.69, Math.max(0.045, point.y - 0.68)) * (0.32 + 0.66 * Math.abs(Math.sin(index * 18.3)));
    dummy.position.copy(point).addScaledVector(axis, side * (0.84 + Math.sin(index * 1.85) * 0.095));
    dummy.position.y -= 0.60;
    dummy.position.addScaledVector(direction, length * 0.37);
    dummy.quaternion.setFromUnitVectors(UP, direction);
    const width = 0.5 + Math.abs(Math.sin(index * 4.17)) * 0.83;
    dummy.scale.set(width, length, width);
    dummy.updateMatrix();
    shards.setMatrixAt(index, dummy.matrix);
  }

  const object = new THREE.Group();
  object.add(shell, detail, shards);
  return {
    object,
    show(progress) {
      const count = Math.ceil(progress * segments);
      shellGeometry.setDrawRange(0, count * iceSection.length * 6);
      rails.setDrawRange(0, count * 12);
      shards.count = Math.ceil(progress * shardCount / 2) * 2;
    },
    dispose() {
      for (const mesh of [shell, detail, shards]) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      shards.dispose();
    },
  };
}

function iceEffect(texture) {
  const object = new THREE.Group();
  const sparks = particles(65, 0xa6eeff, 0.12, texture);
  const light = new THREE.PointLight(0x55cfff, 7, 4, 2);
  const contact = new THREE.Vector3();
  object.add(sparks.points, light);
  let track;
  let trackCurve;

  function update(time, power, car, curve, progress) {
    object.visible = Boolean(curve && progress > 0);
    if (!object.visible) return;
    if (trackCurve !== curve) {
      if (track) {
        object.remove(track.object);
        track.dispose();
      }
      trackCurve = curve;
      track = iceTrack(curve);
      object.add(track.object);
    }
    track.show(progress);

    if (progress < 0.97) curve.getPointAt(progress, contact);
    else contact.copy(car);
    contact.y = Math.max(0.15, contact.y - 0.56);
    sparks.points.position.copy(contact);
    light.position.copy(contact);
    light.intensity = 9 * power;
    sparks.material.opacity = 0.8 * power;
    for (let index = 0; index < sparks.positions.count; index++) {
      const phase = (index / sparks.positions.count + time * (0.68 + (index % 4) * 0.065)) % 1;
      const angle = index * 2.39996;
      const radius = phase * (0.25 + Math.abs(Math.sin(index * 1.82)) * 1.25);
      sparks.positions.setXYZ(index, Math.cos(angle) * radius - phase * 0.45,
        Math.sin(phase * Math.PI) * (0.30 + Math.abs(Math.sin(index * 2.13)) * 0.65), Math.sin(angle) * radius);
    }
    sparks.positions.needsUpdate = true;
  }

  return { object, update };
}

function portalSurface(color) {
  return new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color(color) }, time: { value: 0 }, openness: { value: 0 } },
    vertexShader: `
      varying vec2 surfaceUv;
      void main() {
        surfaceUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 surfaceUv;
      uniform vec3 tint;
      uniform float time;
      uniform float openness;
      void main() {
        vec2 p = surfaceUv * 2.0 - 1.0;
        float radius = length(p);
        float angle = atan(p.y, p.x);
        float waves = 0.53 + 0.27 * sin(angle * 8.0 - time * 4.8 + radius * 19.0)
          + 0.20 * cos(angle * 13.0 + time * 6.4 - radius * 25.0);
        float edgeDistance = (radius - 0.72 - 0.016 * sin(angle * 9.0 + time * 5.0)) * 25.0;
        float haloDistance = (radius - 0.72) * 7.1;
        float edge = exp(-edgeDistance * edgeDistance);
        float halo = exp(-haloDistance * haloDistance);
        float veil = smoothstep(0.0, 0.72, radius) * (1.0 - smoothstep(0.71, 0.87, radius));
        float alpha = (edge * (0.26 + waves * 0.44) + halo * 0.16 + veil * waves * 0.15) * openness;
        gl_FragColor = vec4(tint, alpha);
      }
    `,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, toneMapped: false, forceSinglePass: true,
  });
}

function portalEffect(color, accent, texture, offset, verticalScale) {
  const object = new THREE.Group();
  const aperture = new THREE.Group();
  aperture.rotation.y = Math.PI / 2;
  object.add(aperture);
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(3.11, 3.11), portalSurface(color));
  aperture.add(surface);
  const outline = ring(1.07, 1.10, accent, 0.73);
  const iris = ring(1.11, 1.14, color, 0.88);
  const orbit = ring(1.23, 1.25, color, 0.66, 0, TAU * 0.73);
  const secondary = ring(1.34, 1.35, accent, 0.48, Math.PI, TAU * 0.44);
  const brackets = new THREE.Group();
  for (let index = 0; index < 5; index++) {
    const bracket = ring(1.18, 1.22, color, 0.7, index * TAU / 5, 0.23 + index * 0.08);
    brackets.add(bracket);
  }
  iris.position.z = 0.035;
  outline.position.z = -0.036;
  orbit.rotation.y = 0.14;
  secondary.rotation.x = -0.14;
  aperture.add(outline, iris, orbit, secondary, brackets);

  const flecks = particles(72, accent, 0.135, texture);
  aperture.add(flecks.points);
  const light = new THREE.PointLight(color, 11, 4, 2);
  object.add(light);

  function update(time, gate) {
    object.visible = Boolean(gate && gate.openness > 0.001);
    if (!object.visible) return;
    const openness = gate.openness;
    object.position.copy(gate.position);
    const growth = 0.13 + openness * 0.87;
    aperture.scale.set(growth, growth * verticalScale, growth);
    const clock = time + offset;
    surface.material.uniforms.time.value = clock;
    surface.material.uniforms.openness.value = openness;
    outline.material.opacity = openness * 0.72;
    iris.material.opacity = openness * 0.7;
    orbit.material.opacity = openness * 0.59;
    secondary.material.opacity = openness * 0.38;
    orbit.rotation.z = clock * 0.97;
    secondary.rotation.z = -clock * 0.70;
    brackets.rotation.z = -clock * 0.42;
    for (const bracket of brackets.children) bracket.material.opacity = openness * 0.71;
    light.intensity = openness * (10 + Math.sin(clock * 7.4) * 1.3);

    flecks.material.opacity = openness * 0.89;
    for (let index = 0; index < flecks.positions.count; index++) {
      const phase = (index / flecks.positions.count + clock * (0.34 + (index % 5) * 0.037)) % 1;
      const angle = index * 2.39996 + clock * (0.87 + phase * 0.15);
      const radius = 1.08 + phase * 0.35 + Math.sin(index * 3.74) * 0.15;
      flecks.positions.setXYZ(index, Math.cos(angle) * radius, Math.sin(angle) * radius,
        (phase - 0.5) * 0.66 + Math.cos(angle * 2.45) * 0.085);
    }
    flecks.positions.needsUpdate = true;
  }

  return { object, update };
}

export function createRescueEffects() {
  const object = new THREE.Group();
  const texture = particleTexture();
  const gravity = gravityEffect(texture);
  const ice = iceEffect(texture);
  const gateways = [
    portalEffect(0xb367ff, 0xf9afff, texture, 0, 1.44),
    portalEffect(0x8d82ff, 0xd1c1ff, texture, 2.21, 1.32),
  ];
  object.add(gravity.object, ice.object, ...gateways.map(gateway => gateway.object));
  for (const child of object.children) child.visible = false;

  function update({ id, time, power, car, iceProgress = 0, iceCurve, portals = [], hero }) {
    gravity.update(time, id === 'gravity' ? power : 0, car, hero);
    ice.update(time, id === 'ice' ? power : 0, car, iceCurve, id === 'ice' ? iceProgress : 0);
    gateways.forEach((gateway, index) => gateway.update(time, id === 'portal' ? portals[index] : null));
  }

  return { object, update };
}
