import * as THREE from 'three';

export const GIANT_GROW = 2.65;
export const GIANT_CATCH = 3.42;
export const GIANT_CARRY = 4.47;
export const GIANT_SETDOWN = 7.4;
export const GIANT_LAND = 9.12;

const ENLARGED = 1.82;
const LAND_X = 5.4;
const LAND_Z = -3.45;
const LAND_Y = 0.75;
const FACING = 2.72;
const CONTACT = new THREE.Vector3(0.04, -0.68, 0.55);
const { clamp, lerp, smoothstep } = THREE.MathUtils;

function carRoute(time, out) {
  const across = smoothstep(time, GIANT_CARRY, GIANT_SETDOWN);
  const down = smoothstep(time, GIANT_SETDOWN, GIANT_LAND);
  const lift = smoothstep(time, GIANT_CARRY - 0.3, GIANT_CARRY + 0.4);
  return out.set(
    lerp(-0.75, LAND_X, across),
    lerp(3.36 + lift * 0.12, LAND_Y, down),
    lerp(0, LAND_Z, across),
  );
}

function createRiders() {
  const group = new THREE.Group();
  const headGeometry = new THREE.SphereGeometry(0.116, 8, 5);
  const torsoGeometry = new THREE.BoxGeometry(0.3, 0.32, 0.22);
  const hair = new THREE.MeshStandardMaterial({ color: 0x211c24, roughness: 0.9 });
  const riders = [0x286664, 0x7d4f48, 0x625d86].map((color, index) => {
    const rider = new THREE.Group();
    rider.position.set((index - 1) * 0.76, -0.17, -0.12);
    const torso = new THREE.Mesh(torsoGeometry, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    torso.position.y = 0.17;
    const face = new THREE.Mesh(headGeometry, new THREE.MeshStandardMaterial({ color: [0xbe866b, 0xd8a27c, 0x95634e][index], roughness: 0.9 }));
    face.position.set(0, 0.424, 0.015);
    const crown = new THREE.Mesh(headGeometry, hair);
    crown.scale.set(1.04, 0.71, 1.02);
    crown.position.set(0, 0.478, -0.019);
    rider.add(torso, face, crown);
    group.add(rider);
    return rider;
  });
  return { group, riders };
}

function createDust() {
  const positions = new Float32Array(270 * 3);
  const data = new Float32Array(270 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('dust', new THREE.BufferAttribute(data, 3).setUsage(THREE.DynamicDrawUsage));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { viewportHeight: { value: 520 } },
    vertexShader: `
      attribute vec3 dust;
      uniform float viewportHeight;
      varying vec2 particle;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = max(1.0, dust.x * viewportHeight * projectionMatrix[1][1] / max(1.0, -viewPosition.z));
        particle = dust.yz;
      }
    `,
    fragmentShader: `
      varying vec2 particle;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float edge = 1.0 - smoothstep(0.0, 0.5, length(p));
        vec3 color = mix(vec3(0.52, 0.42, 0.34), vec3(1.0, 0.59, 0.22), particle.y);
        gl_FragColor = vec4(color, edge * edge * particle.x);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 4;
  points.onBeforeRender = (renderer) => { material.uniforms.viewportHeight.value = renderer.domElement.height; };
  return { points, positions, data };
}

function createPressureRing() {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.89, 1, 56), new THREE.MeshBasicMaterial({
    color: 0xdfa364, transparent: true, depthWrite: false, opacity: 0, toneMapped: false,
  }));
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

export function createGiantSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const { group: passengerGroup, riders } = createRiders();
  const { points, positions, data } = createDust();
  const bodyImpact = createPressureRing();
  const carImpact = createPressureRing();
  const footfalls = [4.85, 5.48, 6.09, 6.73, 7.31].map((time, index) => {
    const point = carRoute(time, new THREE.Vector3());
    return { time, x: point.x - 0.48 + (index % 2 ? -0.32 : 0.3), z: point.z + 1.55, force: 0.6, count: 21 };
  });
  const events = [
    { time: GIANT_GROW + 0.07, x: -0.48, z: 1.94, force: 0.68, count: 30, hot: 0.86 },
    { time: GIANT_CATCH, x: -1.16, z: 1.55, force: 1.22, count: 62, hot: 0.32 },
    ...footfalls,
    { time: GIANT_LAND - 0.015, x: LAND_X, z: LAND_Z, force: 0.72, count: 48 },
  ];
  const impactStones = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: 0x9b7353, roughness: 0.88 }),
    18,
  );
  impactStones.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  impactStones.frustumCulled = false;
  const stone = new THREE.Object3D();
  object.add(passengerGroup, points, bodyImpact, carImpact, impactStones);

  const route = new THREE.Vector3();
  const grip = new THREE.Vector3();
  const palms = new THREE.Vector3();
  let frame;

  function update({ time, car, hero, heroRig }) {
    const growth = smoothstep(time, GIANT_GROW, GIANT_CATCH - 0.035);
    const approach = smoothstep(time, 0.55, GIANT_CATCH - 0.08);
    const carry = smoothstep(time, GIANT_CARRY, GIANT_SETDOWN);
    const age = Math.max(0, time - GIANT_CATCH);
    const compression = Math.sin(Math.PI * Math.min(age / 0.68, 1)) * Math.exp(-age * 0.8);
    const withdraw = smoothstep(time, GIANT_LAND, 10.6);
    const down = smoothstep(time, GIANT_SETDOWN, 8.82);
    const release = smoothstep(time, 8.78, GIANT_LAND + 0.08);
    const size = lerp(lerp(1, ENLARGED, growth) - down * 0.25, 1, withdraw);
    const power = smoothstep(time, GIANT_GROW + 0.17, GIANT_CATCH - 0.035) * (1 - release);
    const running = 0.56 * smoothstep(time, GIANT_CARRY - 0.13, GIANT_CARRY + 0.25)
      * (1 - smoothstep(time, GIANT_SETDOWN - 0.3, GIANT_SETDOWN));
    const lowering = clamp(down + compression * 0.18, 0, 1);

    carRoute(time, route);
    if (time >= GIANT_CATCH) {
      car.position.copy(route);
      car.position.y -= compression * 0.31;
      car.rotation.set(
        0.07 * Math.sin(carry * Math.PI * 6) * running,
        0.11 * Math.sin(carry * Math.PI),
        -0.28 * Math.exp(-age * 3.2) + 0.035 * Math.sin(carry * Math.PI * 8) * running,
      );
    }

    hero.scale.setScalar(size);
    hero.position.set(
      lerp(2.9, route.x - 0.47, approach) + withdraw * 1.83,
      0,
      lerp(3.35, route.z + 1.59, approach) + withdraw * 1.23,
    );
    hero.rotation.set(0, lerp(lerp(-2.2, FACING - Math.PI * 2, approach), -0.57, withdraw), 0);
    frame = { time, car, hero, support: heroRig?.anchors?.support, compression };
    return { power, running: running + withdraw * (1 - withdraw) * 1.7, lowering };
  }

  function afterPose() {
    const { time, car, hero, support, compression } = frame;
    const acquired = smoothstep(time, GIANT_CATCH - 0.045, GIANT_CATCH + 0.2);
    const gripWeight = acquired * (1 - smoothstep(time, 8.73, GIANT_LAND));
    if (support && gripWeight > 0) {
      support.getWorldPosition(palms);
      grip.copy(CONTACT).applyQuaternion(car.quaternion);
      car.position.y = lerp(car.position.y, Math.max(LAND_Y, palms.y - grip.y), gripWeight);
      hero.position.x += (car.position.x + grip.x - palms.x) * gripWeight;
      hero.position.z += (car.position.z + grip.z - palms.z) * gripWeight;
    }

    passengerGroup.position.copy(car.position);
    passengerGroup.quaternion.copy(car.quaternion);
    for (const [index, rider] of riders.entries()) {
      rider.rotation.z = Math.sin(time * 4.7 + index * 0.7) * (0.045 + compression * 0.24);
      rider.rotation.x = compression * 0.14 * (index % 2 ? -1 : 1);
    }

    let count = 0;
    for (const event of events) {
      const age = time - event.time;
      if (age < 0 || age > 1.16) continue;
      const fade = Math.sin(Math.PI * clamp(age / 1.16, 0, 1)) ** 0.8;
      for (let index = 0; index < event.count; index++) {
        const angle = index * 2.39996;
        const speed = event.force * (0.56 + (index % 13) * 0.11);
        const spread = speed * age + 0.08 + (index % 7) * 0.075;
        const rise = age * (0.13 + (index % 5) * 0.19) * event.force;
        positions.set([event.x + Math.cos(angle) * spread, 0.09 + rise, event.z + Math.sin(angle) * spread], count * 3);
        data.set([0.13 + 0.29 * age + (index % 5) * 0.035, fade * (0.36 + (index % 3) * 0.13), event.hot ?? 0], count * 3);
        count++;
      }
    }
    points.visible = count > 0;
    points.geometry.setDrawRange(0, count);
    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.dust.needsUpdate = true;

    const catchAge = time - GIANT_CATCH;
    const groundAge = time - GIANT_LAND;
    for (const [ring, age, x, z, speed] of [
      [bodyImpact, catchAge, -1.16, 1.55, 2.62], [carImpact, groundAge, LAND_X, LAND_Z, 1.84],
    ]) {
      ring.visible = age >= 0 && age < 0.48;
      if (!ring.visible) continue;
      ring.position.set(x, ring === carImpact ? 0.052 : 0.026, z);
      ring.scale.setScalar(0.27 + age * speed);
      ring.material.opacity = 0.35 * (1 - age / 0.48) ** 1.4;
    }

    impactStones.count = catchAge >= 0 && catchAge < 0.74 ? 18 : 0;
    for (let index = 0; index < impactStones.count; index++) {
      const angle = index * 2.39996;
      const speed = 0.82 + (index % 8) * 0.19;
      const distance = 0.14 + speed * catchAge;
      const height = Math.max(0.023, 0.04 + catchAge * (1.2 + (index % 4) * 0.36) - 4.1 * catchAge ** 2);
      stone.position.set(-1.16 + Math.cos(angle) * distance, height, 1.55 + Math.sin(angle) * distance);
      stone.rotation.set(angle + catchAge * 3.2, index + catchAge * 1.6, index * 0.33);
      stone.scale.setScalar((0.035 + (index % 4) * 0.015) * (1 - smoothstep(catchAge, 0.53, 0.74)));
      stone.updateMatrix();
      impactStones.setMatrixAt(index, stone.matrix);
    }
    if (impactStones.count) impactStones.instanceMatrix.needsUpdate = true;
  }

  return { object, update, afterPose };
}
