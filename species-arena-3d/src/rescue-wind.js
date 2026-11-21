import * as THREE from 'three';
import { makePassenger } from './rescue-speed.js';

export const WIND_GATHER = 2.66;
export const WIND_CATCH = 3.42;
export const WIND_STEER = 4.3;
export const WIND_LAND = 8.9;

const CURB = new THREE.Vector3(6.6, 0.75, -3.48);
const PAPER_COUNT = 40;
const STREAK_COUNT = 92;
const SEGMENTS = 40;
const WARDROBE = [
  { top: 0xf2a356, trim: 0xc45c43, pants: 0x33475e, skin: 0xa96547, hair: 0x33262a },
  { top: 0x55baba, trim: 0x337683, pants: 0x414765, skin: 0xe0a880, hair: 0x673d2a },
  { top: 0x8f84bc, trim: 0x514963, pants: 0x5f486d, skin: 0x784738, hair: 0x23222b },
];
const { clamp, lerp, smoothstep } = THREE.MathUtils;

function createWindBand(tint, offset, width) {
  const positions = new Float32Array((SEGMENTS + 1) * 6);
  const uv = new Float32Array((SEGMENTS + 1) * 4);
  const indices = [];
  for (let index = 0; index <= SEGMENTS; index++) {
    const u = index / SEGMENTS;
    uv.set([u, 0, u, 1], index * 4);
    if (index === SEGMENTS) continue;
    const a = index * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      tint: { value: new THREE.Color(tint) },
      strength: { value: 0 },
      clock: { value: 0 },
      offset: { value: offset },
    },
    vertexShader: `
      varying vec2 bandUv;
      void main() {
        bandUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 tint;
      uniform float strength;
      uniform float clock;
      uniform float offset;
      varying vec2 bandUv;
      void main() {
        float along = bandUv.x;
        float across = 1.0 - abs(bandUv.y * 2.0 - 1.0);
        float taper = smoothstep(0.0, 0.19, along) * (1.0 - smoothstep(0.70, 1.0, along));
        float pulses = pow(max(0.0, sin(along * 24.0 - clock * 11.8 + offset)), 3.0);
        float fiber = smoothstep(0.0, 0.18, across) * (0.50 + 0.50 * across);
        float core = pow(max(0.0, across), 3.0);
        gl_FragColor = vec4(tint, taper * strength * (0.18 * fiber + pulses * 0.54 * core));
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return { mesh, positions, offset, width };
}

function createPaper() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.5, -0.34, 0.02, 0.48, -0.36, -0.06, 0.40, 0.38, 0.02,
    -0.46, 0.31, -0.02, 0, 0, 0.17,
  ], 3));
  geometry.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]);
  geometry.computeVertexNormals();
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geometry, material, PAPER_COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const color = new THREE.Color();
  const swatches = [0x9ac1cb, 0xb4d4d5, 0xe1e6d5, 0xa4acb7];
  for (let index = 0; index < PAPER_COUNT; index++) mesh.setColorAt(index, color.setHex(swatches[index % swatches.length]));
  return mesh;
}

function createLandingMarks() {
  const points = [];
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const corner = new THREE.Vector3(x * 1.64, 0, z * 0.88);
      points.push(corner, new THREE.Vector3(x * 1.24, 0, corner.z));
      points.push(corner, new THREE.Vector3(corner.x, 0, z * 0.61));
    }
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xa9f4e8, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const marks = new THREE.LineSegments(geometry, material);
  marks.position.set(CURB.x, 0.036, CURB.z);
  return marks;
}

function sampleWind(out, center, heading, time, along, lane) {
  const side = Math.sin(lane + (along - 0.49) * 2.4 + Math.sin(time * 2.8 + lane) * 0.21);
  const rise = Math.cos(lane + (along - 0.49) * 2.4);
  const cross = side * (0.88 + 0.46 * Math.sin(along * Math.PI)) + 0.47 * (along - 0.54) ** 2;
  const travel = lerp(-5.15, 3.95, along);
  return out.set(
    center.x + Math.cos(heading) * travel + Math.sin(heading) * cross,
    Math.max(0.13, center.y - 0.5 + rise * 0.67 - (along - 0.52) ** 2 * 4.5),
    center.z - Math.sin(heading) * travel + Math.cos(heading) * cross,
  );
}

export function createWindSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const riders = WARDROBE.map(makePassenger);
  const cabin = new THREE.Group();
  for (const [index, rider] of riders.entries()) {
    rider.root.position.set((index - 1) * 0.75, -0.64, 0.02);
    rider.root.scale.setScalar(0.69);
    cabin.add(rider.root);
  }

  const bands = [
    createWindBand(0x99f8ed, 0.2, 0.24),
    createWindBand(0x8ee3ff, 1.1, 0.16),
    createWindBand(0xb4fff4, 2.0, 0.29),
    createWindBand(0x76c8f6, 2.9, 0.24),
    createWindBand(0xd1fff4, 3.9, 0.13),
    createWindBand(0x8cf5d4, 5.0, 0.2),
  ];
  const streakPositions = new Float32Array(STREAK_COUNT * 6);
  const streakGeometry = new THREE.BufferGeometry();
  streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const streakMaterial = new THREE.LineBasicMaterial({
    color: 0xaff8ef, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  });
  const streaks = new THREE.LineSegments(streakGeometry, streakMaterial);
  streaks.frustumCulled = false;
  const paper = createPaper();
  const marks = createLandingMarks();
  object.add(cabin, ...bands.map(({ mesh }) => mesh), streaks, paper, marks);

  const center = new THREE.Vector3();
  const sample = new THREE.Vector3();
  const next = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const bandNormal = new THREE.Vector3(0.20, 0.61, 1);
  const scrap = new THREE.Object3D();

  function update({ time, car, hero }) {
    const power = smoothstep(time, WIND_GATHER, WIND_CATCH) * (1 - smoothstep(time, WIND_LAND - 0.16, WIND_LAND + 1.08));
    const across = smoothstep(time, WIND_STEER - 0.18, 7.73);
    const bank = smoothstep(time, 6.35, 8.54);
    const down = smoothstep(time, 6.88, WIND_LAND);
    const age = Math.max(0, time - WIND_CATCH);
    const settling = smoothstep(time, WIND_LAND, 10.7);

    if (time >= WIND_CATCH) {
      const forward = -0.75 + 0.2 * (1 - Math.exp(-age * 4.38));
      const caughtHeight = 3.36 - 0.55 * (1 - Math.exp(-age * 6.08));
      car.position.set(
        lerp(forward, CURB.x, across),
        lerp(caughtHeight + across * 0.25, CURB.y, down),
        CURB.z * bank,
      );
      car.rotation.set(
        0.09 * Math.sin(bank * Math.PI),
        0.44 * Math.sin(bank * Math.PI) + 0.08 * Math.sin(across * Math.PI),
        -0.28 * Math.exp(-age * 3.6) + 0.21 * Math.sin(bank * Math.PI),
      );
    }

    const enter = smoothstep(time, 0.48, WIND_CATCH - 0.18);
    const hover = power * (0.73 + 0.065 * Math.sin(time * 5.5));
    hero.position.set(
      lerp(-4.56, car.position.x - 0.47, enter) + settling * 0.48,
      hover,
      lerp(3.65, 2.66 + car.position.z * 0.42, enter) + settling * 0.76,
    );
    hero.rotation.set(
      -power * 0.072,
      lerp(Math.atan2(car.position.x - hero.position.x + power * 1.12, car.position.z - hero.position.z), 0.71, settling),
      power * (0.055 + 0.075 * Math.sin(bank * Math.PI)),
    );
    cabin.position.copy(car.position);
    cabin.quaternion.copy(car.quaternion);
    for (const rider of riders) rider.pose(time, 0.85);

    const heading = 0.13 + 0.65 * smoothstep(time, 5.65, 8.11);
    center.copy(car.position);
    marks.material.opacity = 0.53 * smoothstep(time, WIND_STEER + 0.38, WIND_LAND - 0.14);
    marks.visible = marks.material.opacity > 0.002;
    const active = power > 0.002;
    streaks.visible = paper.visible = active;
    for (const band of bands) band.mesh.visible = active;
    if (!active) return { power, running: 0.33 * enter * (1 - enter) };

    for (const { mesh, positions, offset, width } of bands) {
      for (let index = 0; index <= SEGMENTS; index++) {
        const u = index / SEGMENTS;
        sampleWind(sample, center, heading, time, u, offset);
        sampleWind(next, center, heading, time, u + 0.002, offset);
        normal.subVectors(next, sample);
        normal.cross(bandNormal).normalize();
        normal.multiplyScalar(width * (0.45 + 0.55 * Math.sin(Math.PI * u)));
        positions.set([
          sample.x - normal.x, sample.y - normal.y, sample.z - normal.z,
          sample.x + normal.x, sample.y + normal.y, sample.z + normal.z,
        ], index * 6);
      }
      mesh.geometry.attributes.position.needsUpdate = true;
      mesh.material.uniforms.strength.value = power * 0.69;
      mesh.material.uniforms.clock.value = time;
    }

    for (let index = 0; index < STREAK_COUNT; index++) {
      const u = THREE.MathUtils.euclideanModulo(time * (0.59 + index % 7 * 0.043) + index * 0.618, 1);
      const lane = index * 2.39996;
      const length = (0.022 + index % 4 * 0.009) * Math.sin(u * Math.PI);
      sampleWind(sample, center, heading, time, u, lane);
      sampleWind(next, center, heading, time, u + length, lane);
      const flutter = (index % 5 - 2) * 0.078;
      streakPositions.set([sample.x, sample.y + flutter, sample.z, next.x, next.y + flutter, next.z], index * 6);
    }
    streakGeometry.attributes.position.needsUpdate = true;
    streakMaterial.opacity = power * 0.40;

    for (let index = 0; index < PAPER_COUNT; index++) {
      const u = THREE.MathUtils.euclideanModulo(time * (0.36 + index % 6 * 0.031) + index * 0.317, 1);
      sampleWind(sample, center, heading, time, u, index * 2.39996);
      const lift = Math.sin(u * Math.PI) ** 1.4;
      const envelope = smoothstep(u, 0, 0.11) * (1 - smoothstep(u, 0.81, 1));
      scrap.position.set(sample.x, lerp(0.12, sample.y, lift * (0.43 + index % 5 * 0.12)), sample.z + (index % 7 - 3) * 0.23);
      scrap.rotation.set(time * (2.2 + index % 5) + index, time * 2.6 + index * 0.72, index - time * 2.25);
      scrap.scale.setScalar((0.065 + index % 6 * 0.018) * envelope * power);
      scrap.updateMatrix();
      paper.setMatrixAt(index, scrap.matrix);
    }
    paper.instanceMatrix.needsUpdate = true;
    return { power, running: 0 };
  }

  return { object, update };
}
