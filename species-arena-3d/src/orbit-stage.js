import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCatalogHero } from './hero-models.js';
import { createOrbitRouteEffects } from './orbit-route-effects.js';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const up = new THREE.Vector3(0, 1, 0);
const sunDirection = new THREE.Vector3(-0.53, 0.67, 0.52).normalize();
const deck = new THREE.Vector3(-2.92, -0.22, 0);
const orbitAnchors = [new THREE.Vector3(-0.5, 0.26, 1.4), new THREE.Vector3(-0.5, 0.26, -1.48)];
const portalEntry = new THREE.Vector3(2.64, 1.48, 0.35);
const portalExit = new THREE.Vector3(3.92, 3.35, -1.65);
const portalFlight = new THREE.Vector3(6.12, 2.52, -6.12);
const rewindStart = 6;
const rewindEnd = 9;
const rewindDestinationTime = 2.35;
const relayRewindStart = 4.45;
const relayRewindDestination = 2.85;
const relayRelease = 6.1;
const relayTransfer = 7.95;
const pathColors = {
  magnet: 0x88fbe9,
  web: 0xffbd87,
  grove: 0xd6f69f,
  portal: 0xf5a8ff,
  rewind: 0xffdb96,
  relay: 0xf5bbf0,
};
const settledRotation = {
  magnet: [-0.29, 1.36, 0.26],
  web: [0.42, 0.68, -0.14],
  grove: [0.42, 0.68, -0.14],
  portal: [-0.29, 2.27, 0.26],
  rewind: [-0.17, 2.08, 0.12],
};
const boxGeometry = new THREE.BoxGeometry();

function metal(color, roughness = 0.54) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.54 });
}

function glow(color) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false });
}

function mesh(parent, geometry, material, x, y, z) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function box(parent, material, x, y, z, width, height, depth) {
  const part = mesh(parent, boxGeometry, material, x, y, z);
  part.scale.set(width, height, depth);
  return part;
}

const planetVertex = `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

function createPlanet(scene) {
  const planetGeometry = new THREE.SphereGeometry(22, 64, 40);
  const uniforms = { uSun: { value: sunDirection } };
  const earth = mesh(scene, planetGeometry, new THREE.ShaderMaterial({
    uniforms,
    vertexShader: planetVertex,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      uniform vec3 uSun;
      float hash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float noise3(vec3 p) {
        vec3 c = floor(p);
        vec3 f = fract(p);
        f *= f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(c), hash(c + vec3(1,0,0)), f.x),
          mix(hash(c + vec3(0,1,0)), hash(c + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(c + vec3(0,0,1)), hash(c + vec3(1,0,1)), f.x),
          mix(hash(c + vec3(0,1,1)), hash(c + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float terrain(vec3 p) {
        return noise3(p) * .62 + noise3(p * 2.12 + 9.4) * .25 + noise3(p * 5.0 - 2.3) * .13;
      }
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 eye = normalize(cameraPosition - vWorld);
        vec3 p = normal + vec3(1.2, 2.3, 4.2);
        float continent = terrain(p * 6.1);
        float land = smoothstep(.50, .536, continent);
        float shallow = smoothstep(.465, .51, continent);
        vec3 water = mix(vec3(.009,.038,.13), vec3(.026,.23,.31), shallow);
        float hills = terrain(p * 24.5);
        vec3 rock = mix(vec3(.072,.143,.075), vec3(.35,.27,.13), smoothstep(.41,.73,hills));
        vec3 albedo = mix(water, rock, land);
        vec3 cloudCoords = p * vec3(17.5, 27.0, 16.0) + vec3(hills * 2.5, 0, hills * 2.1);
        float cloud = smoothstep(.47,.76,terrain(cloudCoords));
        albedo = mix(albedo, vec3(.50,.67,.76), cloud * .91);
        float daylight = smoothstep(-.24,.53,dot(normal, uSun));
        float limb = pow(1.0 - max(0.0,dot(normal,eye)), 3.4);
        vec3 haze = vec3(.046,.29,.58) * limb * (.19 + daylight);
        gl_FragColor = vec4(albedo * (.034 + daylight * .84) + haze, 1.0);
        #include <colorspace_fragment>
      }
    `,
  }), 3, -17.4, -40);

  const halo = mesh(scene, planetGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: planetVertex,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      uniform vec3 uSun;
      void main() {
        vec3 normal = normalize(vNormal);
        float angle = abs(dot(normal, normalize(cameraPosition - vWorld)));
        float density = pow(max(0.0, 1.0 - angle), 6.0);
        float lit = smoothstep(-.32,.40,dot(normal, uSun));
        gl_FragColor = vec4(vec3(.115,.46,1.0), density * (.10 + lit * .40));
        #include <colorspace_fragment>
      }
    `,
  }), earth.position.x, earth.position.y, earth.position.z);
  halo.scale.setScalar(1.033);
}

function addStars(scene) {
  const seed = { value: 47319 };
  function random() {
    seed.value = (Math.imul(seed.value, 1664525) + 1013904223) >>> 0;
    return seed.value / 4294967296;
  }
  const positions = [];
  const colors = [];
  const size = [];
  for (let i = 0; i < 1900; i++) {
    const z = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const span = Math.sqrt(1 - z * z);
    positions.push(112 * span * Math.cos(angle), 112 * span * Math.sin(angle), 112 * z);
    const luminance = 0.16 + random() ** 3 * 0.79;
    const color = random();
    colors.push(luminance * (0.66 + color * 0.34), luminance * 0.86, luminance * (1.0 - color * 0.24));
    size.push(0.9 + random() ** 4 * 1.9);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  scene.add(new THREE.Points(geometry, new THREE.ShaderMaterial({
    depthWrite: false, transparent: true,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(.5));
        gl_FragColor = vec4(vColor, 1.0 - smoothstep(.14,.49,d));
      }
    `,
  })));
}

function createHardware() {
  return {
    shell: metal(0xb5bdc6, 0.49),
    casing: metal(0x566777, 0.63),
    black: metal(0x232f42, 0.78),
    rim: metal(0x768ca4, 0.35),
    thermal: metal(0xd39b55, 0.41),
    foil: metal(0x9b7045, 0.43),
    markings: new THREE.MeshStandardMaterial({ color: 0xb67c35, roughness: 0.65 }),
    cells: [
      new THREE.MeshStandardMaterial({ color: 0x183960, emissive: 0x09172c, metalness: 0.42, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0x20466f, emissive: 0x0c1937, metalness: 0.42, roughness: 0.32 }),
    ],
    white: glow(0xc5edf9),
    aqua: glow(0x8afbe4),
    amber: glow(0xffac62),
  };
}

function cylinderX(parent, material, x, y, z, radius, length, segments = 12) {
  const part = mesh(parent, new THREE.CylinderGeometry(radius, radius, length, segments), material, x, y, z);
  part.rotation.z = Math.PI / 2;
  return part;
}

function solarPanel(parent, parts, x, y, z, width, depth, tilt) {
  const panel = new THREE.Group();
  panel.position.set(x, y, z);
  panel.rotation.x = tilt;
  parent.add(panel);
  box(panel, parts.black, 0, 0, 0, width, 0.075, depth);
  for (const edge of [-1, 1]) {
    box(panel, parts.rim, 0, 0.048, edge * depth * 0.49, width, 0.03, 0.025);
    box(panel, parts.rim, edge * width * 0.49, 0.048, 0, 0.027, 0.03, depth);
  }
  const tileWidth = width / 5;
  const tileDepth = depth / 3;
  const tile = new THREE.Object3D();
  tile.scale.set(tileWidth - 0.021, 0.012, tileDepth - 0.024);
  parts.cells.forEach((material, stripe) => {
    const cells = new THREE.InstancedMesh(boxGeometry, material, 8);
    let count = 0;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if ((col + row) % 2 !== stripe) continue;
        tile.position.set((col - 2) * tileWidth, 0.043, (row - 1) * tileDepth);
        tile.updateMatrix();
        cells.setMatrixAt(count++, tile.matrix);
      }
    }
    cells.count = count;
    panel.add(cells);
  });
  return panel;
}

function createStation(scene, parts) {
  const station = new THREE.Group();
  station.position.copy(deck);
  scene.add(station);
  box(station, parts.black, 0, -0.17, 0, 5.22, 0.50, 3.4);
  box(station, parts.casing, 0, 0.11, 0, 5.2, 0.18, 3.35);
  box(station, parts.rim, -0.11, 0.21, 0, 5.37, 0.035, 3.46);
  for (let i = 0; i < 8; i++) {
    const x = -2.31 + i * 0.64;
    box(station, i % 2 ? parts.black : parts.casing, x, 0.234, 0.66, 0.62, 0.018, 1.68);
    box(station, parts.black, x, -0.19, 1.72, 0.48, 0.14, 0.11);
    box(station, parts.rim, x, -0.19, 1.78, 0.28, 0.035, 0.017);
  }
  for (const z of [-1.54, 1.54]) {
    box(station, parts.markings, 0, 0.25, z, 5.1, 0.022, 0.055);
    for (const x of [-2.3, -0.6, 1.12, 2.42]) {
      box(station, parts.black, x, 0.275, z, 0.18, 0.08, 0.14);
      box(station, x > 2 ? parts.amber : parts.white, x, 0.325, z, 0.13, 0.02, 0.053);
    }
  }

  const module = cylinderX(station, parts.shell, -0.86, 0.82, -0.97, 0.74, 3.22);
  module.rotation.x = 0.08;
  cylinderX(station, parts.black, 0.84, 0.82, -0.97, 0.58, 0.18);
  cylinderX(station, parts.rim, 0.98, 0.82, -0.97, 0.43, 0.16);
  cylinderX(station, parts.casing, 1.08, 0.82, -0.97, 0.25, 0.11, 8);
  for (const x of [-2.18, -1.57, 0.36]) {
    cylinderX(station, parts.rim, x, 0.82, -0.97, 0.762, 0.1);
  }
  for (const x of [-1.3, -0.87, -0.44]) {
    box(station, parts.black, x, 0.96, -0.225, 0.28, 0.165, 0.1);
    box(station, parts.aqua, x, 0.99, -0.169, 0.16, 0.042, 0.012);
  }
  box(station, parts.black, -2.1, 1.57, -1.04, 0.47, 0.22, 0.39);
  box(station, parts.shell, -2.1, 1.86, -1.04, 0.058, 0.65, 0.058);
  box(station, parts.shell, -2.1, 2.05, -1.04, 0.72, 0.055, 0.058);
  box(station, parts.amber, -2.1, 2.19, -1.04, 0.088, 0.04, 0.085);
  for (const z of [-1.1, 1.12]) {
    box(station, parts.rim, -0.02, -0.51, z, 4.97, 0.15, 0.19);
    for (const x of [-1.95, 0, 1.95]) {
      box(station, parts.casing, x, -0.47, z, 0.17, 0.23, 0.47);
    }
  }

  box(station, parts.rim, -1.12, 0.16, -2.85, 0.35, 0.26, 2.65);
  box(station, parts.shell, -1.42, 0.16, -3.7, 10.1, 0.13, 0.18);
  for (const x of [-5.24, -3.07, 0.69, 2.86]) {
    solarPanel(station, parts, x, 0.26, -3.75, 1.99, 1.76, 0.28);
  }
  for (const anchor of orbitAnchors) {
    const x = anchor.x - deck.x;
    const z = anchor.z - deck.z;
    box(station, parts.black, x, 0.30, z, 0.30, 0.15, 0.27);
    cylinderX(station, parts.shell, x + 0.09, 0.44, z, 0.132, 0.19, 8);
    cylinderX(station, parts.aqua, x + 0.189, 0.44, z, 0.051, 0.02, 8);
  }
  return box(station, parts.amber, 2.48, 0.35, 1.54, 0.09, 0.036, 0.046);
}

function createSatellite(scene, parts) {
  const object = new THREE.Group();
  scene.add(object);
  const base = cylinderX(object, parts.thermal, 0, 0, 0, 0.54, 1.3, 8);
  base.rotation.x = Math.PI / 8;
  for (const x of [-0.58, 0.57]) {
    cylinderX(object, parts.black, x, 0, 0, 0.566, 0.16, 8);
    cylinderX(object, parts.rim, x * 1.2, 0, 0, 0.38, 0.12, 8);
  }
  for (const y of [-0.29, 0.29]) {
    box(object, parts.foil, 0, y, 0.466, 1.05, 0.10, 0.072);
  }
  box(object, parts.black, -0.17, 0, 0.48, 0.44, 0.22, 0.105);
  box(object, parts.amber, -0.17, 0, 0.542, 0.21, 0.048, 0.018);
  box(object, parts.rim, 0, 0, -0.93, 0.14, 0.13, 1.03);
  solarPanel(object, parts, 0, 0.06, -1.54, 1.54, 1.19, 0.08);
  box(object, parts.rim, 0, -0.03, 0.91, 0.13, 0.10, 0.88).rotation.y = -0.13;
  const damagedPanel = solarPanel(object, parts, 0.08, -0.01, 1.31, 1.20, 0.71, 0.56);
  damagedPanel.rotation.z = 0.15;

  const dish = new THREE.Group();
  dish.position.set(0.16, 0.55, 0.12);
  dish.rotation.z = -0.43;
  object.add(dish);
  mesh(dish, new THREE.CylinderGeometry(0.045, 0.08, 0.34, 8), parts.rim, 0, 0.11, 0);
  const dishShell = new THREE.LatheGeometry([
    new THREE.Vector2(0.02, 0.19), new THREE.Vector2(0.17, 0.21), new THREE.Vector2(0.33, 0.29),
    new THREE.Vector2(0.46, 0.42), new THREE.Vector2(0.46, 0.448), new THREE.Vector2(0.32, 0.35),
    new THREE.Vector2(0.15, 0.27), new THREE.Vector2(0.02, 0.25),
  ], 24);
  mesh(dish, dishShell, parts.shell, 0, 0, 0);
  mesh(dish, new THREE.CylinderGeometry(0.018, 0.024, 0.31, 6), parts.rim, 0, 0.39, 0);
  mesh(dish, new THREE.SphereGeometry(0.047, 8, 6), parts.white, 0, 0.56, 0);
  return { object, damagedPanel };
}

function approachProgress(time) {
  return 1 - (1 - clamp(time / 6, 0, 1)) ** 1.65;
}

function incomingPosition(time, position) {
  return position.set(9.5, 3.34, -2.4).lerp(portalEntry, approachProgress(time));
}

function rewindMotionTime(time) {
  if (time < rewindStart) return time;
  return lerp(rewindStart, rewindDestinationTime, smoothstep(time, rewindStart, rewindEnd));
}

function relayHandoffProgress(time) {
  return clamp((time - relayRelease) / (relayTransfer - relayRelease), 0, 1) ** 1.32;
}

function relayMotionTime(time) {
  if (time < relayRewindStart) return time;
  if (time < relayRelease) {
    return lerp(relayRewindStart, relayRewindDestination, smoothstep(time, relayRewindStart, relayRelease));
  }
  return lerp(relayRewindDestination, 6, relayHandoffProgress(time));
}

function relayRewindFxTime(time) {
  if (time < 3.05) return time * 3.25 / 3.05;
  if (time < relayRewindStart) return lerp(3.25, 6, (time - 3.05) / (relayRewindStart - 3.05));
  if (time < relayRelease) return lerp(6, 8.8, (time - relayRewindStart) / (relayRelease - relayRewindStart));
  return 8.8 + (time - relayRelease) * 0.85 / (relayTransfer - relayRelease);
}

function portalDeparture(time, transferTime, position) {
  const travel = (time - transferTime) / (13 - transferTime);
  const escape = lerp(travel, travel ** 1.62, 0.4);
  return position.copy(portalExit).addScaledVector(portalFlight, escape);
}

function satelliteTransferScale(time, transferTime) {
  return time < transferTime
    ? 1 - smoothstep(time, transferTime - 0.28, transferTime)
    : smoothstep(time, transferTime, transferTime + 0.28);
}

function satellitePosition(time, heroId, position) {
  if (heroId === 'relay') {
    if (time < relayRelease) return incomingPosition(relayMotionTime(time), position);
    if (time < relayTransfer) {
      return incomingPosition(relayRewindDestination, position).lerp(portalEntry, relayHandoffProgress(time));
    }
    return portalDeparture(time, relayTransfer, position);
  }
  if (heroId === 'rewind') {
    incomingPosition(rewindMotionTime(time), position);
    const departure = clamp((time - rewindEnd) / (13 - rewindEnd), 0, 1);
    const bank = smoothstep(departure, 0, 0.72);
    const travel = departure ** 1.64;
    position.x += travel * 4.94;
    position.y += bank * 1.36 + travel * 0.47;
    position.z -= bank * 1.22 + travel * 2.65;
    return position;
  }
  const closing = approachProgress(time);
  if (heroId === 'portal') {
    if (time < 6) {
      // The satellite crosses the first gate without first coming to a stop.
      const gateApproach = lerp(1 - 0.5 ** 1.65, 1, (time - 3) / 3);
      const approach = lerp(closing, gateApproach, smoothstep(time, 3, 3.8));
      return position.set(9.5, 3.34, -2.4).lerp(portalEntry, approach);
    }
    return portalDeparture(time, 6, position);
  }
  if (heroId === 'grove') {
    const bend = clamp((time - 6) / 4, 0, 1);
    const slide = bend ** 1.44;
    const release = clamp((time - 10) / 3, 0, 1);
    return position.set(
      lerp(9.5, 2.64, closing) + slide * 2.02 + release * 2.18 + release ** 1.82 * 1.87,
      lerp(3.34, 1.48, closing) - smoothstep(bend, 0, 1) * 0.71 + release ** 1.54 * 0.92,
      lerp(-2.4, 0.35, closing) + slide * 2.19 + release * 2.37,
    );
  }
  const magnetic = heroId === 'magnet';
  const diversion = clamp((time - 6) / 7, 0, 1);
  const turn = smoothstep(diversion, 0, 0.67);
  const escape = diversion ** 1.83;
  return position.set(
    lerp(9.5, 2.64, closing) + escape * (magnetic ? 6.9 : 5.8) - Math.sin(Math.PI * turn) * 0.29,
    lerp(3.34, 1.48, closing) + (magnetic ? turn * 2.36 + escape * 0.95 : -turn * 0.43 + escape * 0.85),
    lerp(-2.4, 0.35, closing) + (magnetic ? -escape * 5.4 - turn * 0.94 : escape * 3.0 + turn * 1.35),
  );
}

function createNavigationCue(scene, heroId, color) {
  const start = heroId === 'relay' ? relayTransfer : heroId === 'rewind' ? rewindEnd : 6;
  const points = Array.from({ length: 41 }, (_, index) => satellitePosition(lerp(start, 13, index / 40), heroId, new THREE.Vector3()));
  const material = new THREE.LineDashedMaterial({
    color, transparent: true, opacity: 0, toneMapped: false, dashSize: 0.14, gapSize: 0.17, depthWrite: false,
  });
  const cue = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  cue.computeLineDistances();
  scene.add(cue);
  return cue;
}

function createTargetCue(scene) {
  const target = new THREE.Group();
  scene.add(target);
  const vertices = [];
  for (const x of [-1, 1]) {
    for (const y of [-1, 1]) {
      vertices.push(x * 0.86, y * 0.63, 0, x * 1.17, y * 0.63, 0, x * 1.17, y * 0.63, 0, x * 1.17, y * 0.39, 0);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xff9c6a, transparent: true, toneMapped: false, depthTest: false, depthWrite: false });
  target.add(new THREE.LineSegments(geometry, material));
  return { object: target, material };
}

function createStrands(scene, color, capacity) {
  const material = new THREE.MeshBasicMaterial({
    color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const strands = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 5, 1, true), material, capacity);
  strands.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  strands.frustumCulled = false;
  strands.count = 0;
  scene.add(strands);
  const part = new THREE.Object3D();
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  const direction = new THREE.Vector3();

  function trace(curve, extension, thickness, segments) {
    if (extension <= 0) return;
    curve(0, start);
    for (let segment = 1; segment <= segments; segment++) {
      curve(extension * segment / segments, end);
      direction.subVectors(end, start);
      const length = direction.length();
      if (length > 0.0001) {
        part.position.copy(start).lerp(end, 0.5);
        part.quaternion.setFromUnitVectors(up, direction.multiplyScalar(1 / length));
        part.scale.set(thickness, length + 0.0004, thickness);
        part.updateMatrix();
        strands.setMatrixAt(strands.count++, part.matrix);
      }
      start.copy(end);
    }
  }

  return {
    trace,
    begin() { strands.count = 0; },
    end(opacity) {
      strands.instanceMatrix.needsUpdate = true;
      strands.visible = strands.count > 0 && opacity > 0;
      material.opacity = opacity;
    },
  };
}

function createInterceptionEffects(scene) {
  const cyan = createStrands(scene, 0x6bfbe2, 260);
  const warm = createStrands(scene, 0xffa879, 220);
  const silk = createStrands(scene, 0xffdcc2, 330);
  const left = new THREE.Vector3();
  const right = new THREE.Vector3();
  const latch = new THREE.Vector3();
  const side = new THREE.Vector3();
  const handOffset = [new THREE.Vector3(0.25, 1.1, -0.28), new THREE.Vector3(0.25, 1.1, 0.28)];
  const endpoints = [
    new THREE.Vector3(-0.54, 0.17, 0.25), new THREE.Vector3(0.55, 0.18, 0.30),
    new THREE.Vector3(-0.63, -0.13, 0.13), new THREE.Vector3(0.47, -0.14, -0.4),
  ];
  const webLaunch = [3.44, 3.6, 3.07, 3.2];

  const flare = new THREE.PointLight(0x96ffe9, 0, 4.4, 2);
  const coolSpark = glow(0xa7fff5);
  const warmSpark = glow(0xffc890);
  const sparks = Array.from({ length: 16 }, (_, index) => ({
    velocity: new THREE.Vector3(Math.cos(index * 5.3) * 1.12, Math.sin(index * 3.81) * 1.16, Math.sin(index * 2.5) * 1.24),
    part: mesh(scene, new THREE.OctahedronGeometry(0.029 + (index % 3) * 0.010), warmSpark, 0, 0, 0),
  }));
  scene.add(flare);

  function magnet(time, satellite, activation) {
    for (let filament = 0; filament < 8; filament++) {
      const source = filament % 2 === 0 ? left : right;
      const bank = filament < 5 ? cyan : warm;
      const radius = 0.54 + filament * 0.055;
      const phase = filament * Math.PI / 4 + time * 2.8;
      const extension = smoothstep(time, 3.08 + filament * 0.075, 4.32 + filament * 0.06);
      bank.trace((fraction, point) => {
        const angle = phase + fraction * 5.4;
        const curve = Math.sin(fraction * Math.PI * 0.68);
        point.copy(source).lerp(satellite.position, fraction);
        point.y += Math.sin(angle) * curve * radius;
        point.z += Math.cos(angle) * curve * radius;
        point.x += Math.cos(angle + 1.2) * curve * radius * 0.32;
      }, extension, filament < 2 ? 0.019 : 0.0105, 26);
    }
    for (let loop = 0; loop < 3; loop++) {
      const angle = time * (loop % 2 === 0 ? 1.1 : -1.22) + loop * 2.0;
      const radius = 0.77 + loop * 0.11;
      const reveal = smoothstep(time, 3.95 + loop * 0.12, 4.72 + loop * 0.17);
      const bank = loop % 2 === 0 ? cyan : warm;
      bank.trace((fraction, point) => {
        const arc = fraction * Math.PI * 1.56 + angle;
        point.set(
          Math.cos(arc) * radius,
          Math.sin(arc) * radius * 0.43,
          Math.sin(arc) * radius * 0.75,
        );
        point.applyAxisAngle(up, loop * 0.84 + angle * 0.33);
        satellite.localToWorld(point);
      }, reveal, 0.017 + loop * 0.002, 32);
    }
    cyan.end(activation * 0.70);
    warm.end(activation * 0.56);
  }

  function web(time, satellite, activation) {
    const sources = [left, right, ...orbitAnchors];
    sources.forEach((source, index) => {
      latch.copy(endpoints[index]);
      satellite.localToWorld(latch);
      side.subVectors(latch, source).cross(up).normalize();
      const launch = webLaunch[index];
      const extension = smoothstep(time, launch, launch + 0.64);
      const tension = smoothstep(time, 3.68, 5.25);
      const shake = Math.sin(Math.max(0, time - 5.25) * 11.4) * Math.exp(-Math.max(0, time - 5.25) * 1.8) * tension;
      for (const thread of [-1, 0, 1]) {
        silk.trace((fraction, point) => {
          point.copy(source).lerp(latch, fraction);
          const bow = Math.sin(fraction * Math.PI);
          point.y -= bow * (0.27 * (1 - tension) + shake * 0.10);
          point.addScaledVector(side, bow * (thread * 0.072 + Math.sin(fraction * 31 + time * 12) * 0.016 * (1 - tension)));
        }, extension, thread === 0 ? 0.0155 : 0.0085, 18);
      }
    });
    for (const scale of [0.69, 1.13]) {
      silk.trace((fraction, point) => {
        const angle = fraction * Math.PI * 2;
        point.set(Math.sin(angle) * scale * 0.59, Math.cos(angle) * scale * 0.43, 0.38 + 0.15 * Math.sin(angle * 2));
        satellite.localToWorld(point);
      }, smoothstep(time, 4.07, 4.64), 0.013, 23);
    }
    silk.end(activation * 0.84);
  }

  function update(time, heroId, hero, satellite) {
    const magnetic = heroId === 'magnet';
    const active = magnetic || heroId === 'web';
    const activation = active ? smoothstep(time, 3.05, 4.33) * (1 - smoothstep(time, 9.88, 10.84)) : 0;
    const leftAnchor = hero.anchors?.[magnetic ? 'leftHand' : 'leftWrist'];
    const rightAnchor = hero.anchors?.[magnetic ? 'rightHand' : 'rightWrist'];
    left.copy(hero.object.position).add(handOffset[0]);
    right.copy(hero.object.position).add(handOffset[1]);
    leftAnchor?.getWorldPosition(left);
    rightAnchor?.getWorldPosition(right);
    satellite.updateMatrixWorld();
    cyan.begin();
    warm.begin();
    silk.begin();
    if (activation > 0 && magnetic) magnet(time, satellite, activation);
    else {
      cyan.end(0);
      warm.end(0);
    }
    if (activation > 0 && !magnetic) web(time, satellite, activation);
    else silk.end(0);

    const catchProgress = clamp((time - 4.42) / 1.35, 0, 1);
    const flash = active ? Math.sin(Math.PI * catchProgress) ** 1.4 : 0;
    flare.color.set(magnetic ? 0x74f4e4 : 0xffb37c);
    flare.position.copy(satellite.position).lerp(left, 0.3);
    flare.intensity = activation * (1.8 + 5.2 * flash);
    sparks.forEach(({ part, velocity }, index) => {
      part.visible = flash > 0.012;
      part.material = magnetic && index % 2 ? coolSpark : warmSpark;
      part.position.copy(satellite.position).addScaledVector(velocity, 0.36 + catchProgress * 1.48);
      part.scale.setScalar(0.35 + flash * 0.95);
    });
  }
  return { update };
}

export function createOrbitStage(viewport, { maxPixelRatio = 1.55, onMagnetRig } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', '实时渲染的三维轨道拦截场景');
  viewport.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03070d);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(room, 0.045).texture;
  scene.environmentIntensity = 0.44;
  room.dispose();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(45, 1.5, 0.1, 160);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.enablePan = false;
  controls.minDistance = 3.1;
  controls.maxDistance = 27;
  controls.minPolarAngle = 0.19;
  controls.maxPolarAngle = Math.PI * 0.71;
  controls.zoomSpeed = 0.74;

  const sun = new THREE.DirectionalLight(0xffe6bf, 3.15);
  sun.position.copy(sunDirection).multiplyScalar(11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.027;
  Object.assign(sun.shadow.camera, { left: -6, right: 5, bottom: -5, top: 5, near: 0.5, far: 22 });
  const rim = new THREE.DirectionalLight(0x79baff, 2.05);
  rim.position.set(4, 1.8, -7);
  scene.add(new THREE.HemisphereLight(0xd4e5ff, 0x354e78, 0.94), sun, rim);
  addStars(scene);
  createPlanet(scene);
  const parts = createHardware();
  const warning = createStation(scene, parts);
  warning.parent.traverse(child => { if (child.isMesh) child.receiveShadow = true; });
  const satellite = createSatellite(scene, parts);
  const effects = createInterceptionEffects(scene);
  const routeEffects = createOrbitRouteEffects(scene);
  const rewindPath = Array.from({ length: 33 }, (_, index) => (
    incomingPosition(lerp(rewindStart, rewindDestinationTime, index / 32), new THREE.Vector3())
  ));
  const relayRewindPath = Array.from({ length: 33 }, (_, index) => (
    incomingPosition(lerp(relayRewindStart, relayRewindDestination, index / 32), new THREE.Vector3())
  ));
  const paths = Object.entries(pathColors).map(([id, color]) => [id, createNavigationCue(scene, id, color)]);
  const target = createTargetCue(scene);
  const heroes = new Map();
  let activeHero;
  let activePartner;
  let currentTime = 0;
  let cameraMode = 'follow';
  let sized = false;

  function getHero(id) {
    if (!heroes.has(id)) {
      const rig = createCatalogHero(id);
      rig.object.traverse(child => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        child.castShadow = materials.some(material => !material.transparent);
        child.receiveShadow = true;
      });
      scene.add(rig.object);
      heroes.set(id, { id, ...rig });
      if (id === 'magnet') onMagnetRig?.(rig);
    }
    return heroes.get(id);
  }

  function showHeroes(id, partnerId) {
    if (activeHero?.id === id && activePartner?.id === partnerId) return;
    if (activeHero) activeHero.object.visible = false;
    if (activePartner) activePartner.object.visible = false;
    activeHero = getHero(id);
    activeHero.object.visible = true;
    activePartner = partnerId ? getHero(partnerId) : undefined;
    if (activePartner) activePartner.object.visible = true;
  }

  function follow(time) {
    const focus = smoothstep(time, 0.25, 3.9);
    const release = smoothstep(time, 9.24, 12.85);
    const narrow = Math.max(1, 1.42 / camera.aspect);
    const grovePan = activeHero?.id === 'grove' ? smoothstep(time, 6.02, 9.48) : 0;
    const gatePan = activePartner ? smoothstep(time, 5.35, 6.68) * (1 - smoothstep(time, 9.48, 11.6))
      : activeHero?.id === 'portal' ? smoothstep(time, 3.2, 5.25) * (1 - smoothstep(time, 8.7, 11.3)) : 0;
    const rewindPan = !activePartner && activeHero?.id === 'rewind' ? smoothstep(time, 6.25, 9) * (1 - smoothstep(time, 10.5, 13)) : 0;
    const teamWiden = activePartner ? 1.27 - release * 0.60 : 0;
    const portraitNudge = activePartner ? 0.24 * (1 - smoothstep(camera.aspect, 0.46, 0.86)) : 0;
    const focusX = lerp(2.65 + Math.min(0.63, (narrow - 1) * 2.5), 0.68, focus)
      + release * 2.66 + grovePan * 0.95 + gatePan * 0.46 + rewindPan * 1.72 - portraitNudge;
    const focusY = lerp(1.28, 1.37, focus) + release * 0.92 - grovePan * 0.20 + gatePan * 0.58 + rewindPan * 0.28;
    controls.target.set(focusX, focusY, 0.17);
    camera.position.set(
      focusX + lerp(2.15, 1.03, focus) + release * 0.35 - gatePan * 1.84,
      focusY + lerp(2.50, 1.43, focus) + release * 0.64,
      (lerp(12.2, 7.19, focus) + release * 4.82 + grovePan * 1.24 + gatePan * 0.76 + rewindPan * 1.72 + teamWiden) * Math.min(1.36, narrow),
    );
    controls.update();
  }

  function render() {
    if (!sized || !activeHero) return;
    target.object.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
  }

  function poseHero(hero, x, z, power, recoil) {
    hero.object.position.set(x - recoil * 0.21 + smoothstep(currentTime, 0.5, 2.8) * 0.15, 0.018, z);
    const dx = satellite.object.position.x - hero.object.position.x;
    const dz = satellite.object.position.z - hero.object.position.z;
    hero.object.rotation.set(0, Math.atan2(dx, dz), recoil * -0.064);
    hero.update({ time: currentTime, power, progress: power, running: 0, carrying: false });
    hero.object.updateMatrixWorld();
  }

  function draw({ heroId = 'magnet', time = 0, cameraMode: nextMode = 'follow', mission }) {
    const relay = mission === 'relay';
    const route = relay ? 'relay' : heroId;
    showHeroes(relay ? 'rewind' : heroId, relay ? 'portal' : undefined);
    const hero = activeHero;
    const grove = route === 'grove';
    const portal = route === 'portal';
    const rewind = route === 'rewind';
    currentTime = clamp(time, 0, 13);
    cameraMode = nextMode;
    controls.enabled = cameraMode === 'free';
    const releaseStart = relay ? relayRelease : portal ? 7.18 : 9.75;
    const releaseEnd = relay ? 8.10 : portal ? 8.52 : 11.05;
    const effort = smoothstep(currentTime, 2.9, 4.35) * (1 - smoothstep(currentTime, releaseStart, releaseEnd));
    const recoilTime = Math.max(0, currentTime - (grove ? 6 : 4.76));
    const recoil = relay || portal || rewind ? 0 : Math.sin(recoilTime * (grove ? 5.8 : 9.2)) * Math.exp(-recoilTime * 2.2) * effort;
    const motionTime = relay ? relayMotionTime(currentTime) : rewind ? rewindMotionTime(currentTime) : currentTime;
    const stability = rewind ? smoothstep(currentTime, rewindEnd, 10.56)
      : relay ? smoothstep(currentTime, relayTransfer, relayTransfer + 0.54)
      : smoothstep(currentTime, grove ? 5.53 : 4.3, grove ? 6.8 : 6.43);
    satellitePosition(currentTime, route, satellite.object.position);
    satellite.object.position.y += recoil * (grove ? -0.24 : 0.24);
    satellite.object.position.z += recoil * 0.12;
    const transferTime = relay ? relayTransfer : 6;
    const poseBlend = portal || relay ? Number(currentTime >= transferTime) : stability;
    const transferScale = portal || relay ? satelliteTransferScale(currentTime, transferTime) : 1;
    satellite.object.scale.setScalar(transferScale);
    satellite.object.visible = transferScale > 0.003;
    const [pitch, yaw, roll] = settledRotation[relay ? 'portal' : heroId] ?? settledRotation.web;
    satellite.object.rotation.set(
      lerp(motionTime * 0.42 - 0.64, pitch, poseBlend) + recoil * 0.28,
      lerp(motionTime * 0.61, yaw, poseBlend) + 0.18 * Math.max(0, currentTime - 9.8),
      lerp(Math.sin(motionTime * 1.19) * 0.48, roll, poseBlend) + recoil * 0.27,
    );
    satellite.damagedPanel.rotation.z = 0.15 + Math.sin(motionTime * 8.75) * (0.12 - stability * 0.11);
    poseHero(hero, relay ? -2.93 : -1.27, relay ? 1.0 : 0.78, effort, recoil);
    if (activePartner) {
      const gatePower = smoothstep(currentTime, 5.20, 6.32) * (1 - smoothstep(currentTime, 8.45, 10.45));
      poseHero(activePartner, -1.29, 0.30, gatePower, 0);
    }
    effects.update(currentTime, route, hero, satellite.object);
    routeEffects.update({
      mission, heroId, time: currentTime, motionTime, hero, satellite: satellite.object,
      entry: portalEntry, exit: portalExit,
      rewindPath: relay ? relayRewindPath : rewindPath,
      rewindHero: relay ? hero : undefined,
      portalHero: activePartner,
      rewindFxTime: relay ? relayRewindFxTime(currentTime) : undefined,
      portalFxTime: relay ? currentTime - relayTransfer + 6 : undefined,
    });

    const clear = smoothstep(currentTime, 9.45, 10.63);
    target.object.position.copy(satellite.object.position);
    target.object.position.y += 0.07;
    target.material.color.set(clear > 0.5 ? 0x8ef4ca : 0xffa172);
    target.material.opacity = (0.55 + Math.sin(currentTime * 8.3) * 0.19) * (1 - smoothstep(currentTime, 11.14, 12.42)) * transferScale;
    warning.material = clear > 0.5 ? parts.aqua : Math.sin(currentTime * 7.7) > -0.2 ? parts.amber : parts.black;
    const pathFade = rewind ? smoothstep(currentTime, rewindEnd, 10.3)
      : relay ? smoothstep(currentTime, 8.83, 10.3)
      : smoothstep(currentTime, 5.51, 7.25);
    const pathStrength = pathFade * (1 - smoothstep(currentTime, 11.9, 13));
    for (const [id, path] of paths) path.material.opacity = id === route ? pathStrength * 0.57 : 0;
    if (cameraMode === 'follow') follow(currentTime);
    render();
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = viewport;
    sized = Boolean(width && height);
    if (!sized) return;
    camera.aspect = width / height;
    // Keep the deck and satellite in the same shot in tall presentation mode.
    const widthCompensation = 1 + Math.max(0, 0.86 / camera.aspect - 1) * 1.19;
    camera.fov = Math.min(87, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(Math.PI / 8) * widthCompensation)));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (cameraMode === 'follow') follow(currentTime);
    render();
  }

  function resetCamera() {
    follow(currentTime);
    render();
  }

  controls.addEventListener('change', () => { if (cameraMode === 'free') render(); });
  new ResizeObserver(resize).observe(viewport);
  resize();
  return { draw, resetCamera };
}
