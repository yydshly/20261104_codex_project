import * as THREE from 'three';
import { createShoreWalkCurve, getShoreWalkStage, getShoreWalkWidth } from './shore-route.js';

const TAU = Math.PI * 2;
const SIDES = 84;
const TOP_COLOR = new THREE.Color('#62674d');
const TOP_DARK = new THREE.Color('#454c3d');
const TOP_DRY = new THREE.Color('#938263');
const CLIFF_COLORS = ['#68695e', '#777566', '#586065', '#73716e', '#575f66', '#6e6967', '#535a64', '#63676e', '#434953'];

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function faceGeometry(positions, colors) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function addFace(positions, colors, a, b, c, color) {
  positions.push(...a, ...b, ...c);
  for (let vertex = 0; vertex < 3; vertex++) colors.push(color.r, color.g, color.b);
}

function makeMesh(geometry, material, name) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function instances(geometry, material, entries, name, castsShadow = true) {
  const mesh = new THREE.InstancedMesh(geometry, material, entries.length);
  const transform = new THREE.Object3D();
  for (const [index, { position, scale, rotation = [0, 0, 0], color }] of entries.entries()) {
    transform.position.set(...position);
    transform.scale.set(...scale);
    transform.rotation.set(...rotation);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
    if (color) mesh.setColorAt(index, color);
  }
  mesh.name = name;
  mesh.castShadow = castsShadow;
  mesh.receiveShadow = true;
  mesh.computeBoundingSphere();
  return mesh;
}

function rim(theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const ripple = 1 + 0.037 * Math.sin(5 * theta + 0.2) + 0.029 * Math.sin(9 * theta + 1.4) + 0.015 * Math.cos(17 * theta);
  return [12.25 * Math.sign(cos) * Math.abs(cos) ** 0.68 * ripple, 10.83 * Math.sign(sin) * Math.abs(sin) ** 0.68 * ripple];
}

function terrainHeight(x, z) {
  const castleInterior = Math.abs(x) <= 10.45 && Math.abs(z) <= 8.15;
  if (castleInterior || (Math.abs(x) < 1.3 && z > 8)) return 0;
  const distance = (Math.abs(x) / 12.3) ** 2.94 + (Math.abs(z) / 10.8) ** 2.94;
  const rise = Math.max(0, Math.min(1, (distance - 0.58) / 0.42));
  return rise * (-0.29 + 0.18 * Math.sin(x * 1.09 + z * 0.43) * Math.cos(z * 0.9) + 0.13 * Math.sin(x * 0.72 - z * 0.68));
}

function buildIsland(random) {
  const positions = [];
  const colors = [];
  const rings = [0.28, 0.51, 0.7, 0.86, 1].map((radius) => Array.from({ length: SIDES }, (_, index) => {
    const theta = (index / SIDES) * TAU;
    const [x, z] = rim(theta).map((value) => value * radius);
    return [x, terrainHeight(x, z), z];
  }));
  const topShade = (theta, level) => TOP_COLOR.clone()
    .lerp(TOP_DARK, 0.22 + 0.16 * Math.sin(theta * 7 + level) + 0.18 * random())
    .lerp(TOP_DRY, (0.12 + 0.12 * Math.sin(theta * 3 - 0.8)) * (level / rings.length))
    .multiplyScalar(0.91 + 0.18 * random());

  for (let index = 0; index < SIDES; index++) {
    const next = (index + 1) % SIDES;
    const theta = index / SIDES * TAU;
    addFace(positions, colors, [0, 0, 0], rings[0][next], rings[0][index], topShade(theta, 0));
    for (let level = 1; level < rings.length; level++) {
      const [inner, outer] = [rings[level - 1], rings[level]];
      addFace(positions, colors, inner[index], outer[next], outer[index], topShade(theta, level));
      addFace(positions, colors, inner[index], inner[next], outer[next], topShade(theta, level));
    }
  }

  const strata = [[-0.4, 1.028], [-0.93, 1.014], [-1.39, 1.055], [-1.98, 1.041], [-2.73, 1.091], [-3.4, 1.075], [-4.24, 1.133], [-5.22, 1.17], [-6.45, 1.22]];
  const cliffRings = [rings.at(-1), ...strata.map(([height, spread], layer) => Array.from({ length: SIDES }, (_, index) => {
    const theta = index / SIDES * TAU;
    const [x, z] = rim(theta + 0.016 * Math.sin(layer * 0.9 + theta * 7));
    const verticalFissures = 0.047 * Math.sin(12 * theta + 0.6) + 0.042 * Math.cos(23 * theta - 0.7);
    const fracturedEdge = 0.02 * Math.cos(31 * theta + layer * 2.3) + 0.025 * Math.sin(6 * theta - layer * 1.6);
    const slant = 0.26 * Math.sin(theta * 3 + 0.25) + 0.2 * Math.cos(theta * 7 + layer * 0.5);
    const radius = spread + (verticalFissures + fracturedEdge) * Math.min(1, (layer + 1) / 2.2);
    return [x * radius + 0.2 * Math.sin(layer * 0.9), height + slant, z * radius - 0.14 * Math.cos(layer * 1.2)];
  }))];

  for (let layer = 0; layer < strata.length; layer++) {
    const upper = cliffRings[layer];
    const lower = cliffRings[layer + 1];
    const rock = new THREE.Color(CLIFF_COLORS[layer]);
    for (let index = 0; index < SIDES; index++) {
      const next = (index + 1) % SIDES;
      const theta = index / SIDES * TAU;
      const moss = layer < 6 && Math.sin(theta * 11 + layer * 0.62) + Math.cos(theta * 7) > 1.2;
      const shade = rock.clone().lerp(new THREE.Color('#596145'), moss ? 0.3 + 0.26 * random() : 0)
        .multiplyScalar(0.87 + 0.14 * Math.sin(theta * 13 + 0.5) + 0.21 * random());
      addFace(positions, colors, upper[index], upper[next], lower[index], shade);
      addFace(positions, colors, upper[next], lower[next], lower[index], shade.clone().multiplyScalar(0.94 + random() * 0.12));
    }
  }

  return makeMesh(faceGeometry(positions, colors), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97 }), 'Stratified limestone island');
}

function pineCrown(sides = 15, tiers = [[0.15, 0.55, 0.28], [0.28, 0.48, 0.28], [0.42, 0.39, 0.25], [0.55, 0.3, 0.23], [0.68, 0.22, 0.21], [0.81, 0.13, 0.2]]) {
  const positions = [];
  const colors = [];
  const random = seededRandom(27);
  const dark = new THREE.Color('#344e3e');
  const tip = new THREE.Color('#78916b');
  for (const [height, radius, rise] of tiers) {
    const skirt = [];
    const shoulders = [];
    const phase = random() * TAU;
    for (let side = 0; side < sides; side++) {
      const angle = side / sides * TAU + phase;
      const flare = 0.71 + 0.27 * random() + 0.14 * (side % 2);
      skirt.push([Math.cos(angle) * radius * flare, height + random() * 0.045, Math.sin(angle) * radius * flare]);
      shoulders.push([Math.cos(angle + 0.05) * radius * 0.63, height + rise * 0.29 + random() * 0.028, Math.sin(angle + 0.05) * radius * 0.63]);
    }
    const peak = [(random() - 0.5) * 0.065, height + rise, (random() - 0.5) * 0.065];
    for (let side = 0; side < sides; side++) {
      const next = (side + 1) % sides;
      const shade = dark.clone().lerp(tip, 0.31 + 0.41 * random());
      addFace(positions, colors, skirt[side], shoulders[side], skirt[next], shade);
      addFace(positions, colors, skirt[next], shoulders[side], shoulders[next], shade.clone().multiplyScalar(0.88));
      addFace(positions, colors, shoulders[side], peak, shoulders[next], shade.clone().multiplyScalar(1.17));
      addFace(positions, colors, skirt[side], skirt[next], [0, height - 0.04, 0], dark);
    }
  }

  return faceGeometry(positions, colors);
}

function nearApproach(x, z) {
  return z > 8.3 && z < 13.8 && Math.abs(x - Math.max(0, (z - 10) * 1.1)) < 1.65;
}

function addPlants(group, random) {
  const trees = [
    [-10.9, 4.4, 3.9], [-11.14, 2.18, 2.2], [-11.17, -0.15, 3.3], [-10.88, -3.0, 2.6],
    [-9.4, -8.75, 3.0], [-6.45, -9.7, 3.6], [-4.55, -9.65, 2.5], [0.15, -9.5, 3.3],
    [2.35, -9.93, 2.9], [4.23, -9.64, 3.6], [6.6, -9.15, 2.8], [8.4, -8.84, 3.6],
    [10.85, -5.73, 3.35], [11.25, -3.95, 4.1], [11.36, -2.29, 2.0], [10.91, 0.45, 3.3],
    [11.38, 2.65, 2.3], [10.87, 4.0, 3.95], [10.74, 6.43, 2.65], [9.46, 8.65, 3.3],
    [7.25, 9.41, 2.8], [6.14, 9.79, 1.9], [3.4, 9.76, 2.9], [-2.22, 9.38, 2.3],
    [-4.42, 10.06, 3.6], [-5.95, 9.69, 2.9], [-7.52, 9.54, 2.1], [-8.6, 8.86, 3.65],
  ];
  const crowns = [];
  const trunks = [];
  for (const [x, z, height] of trees) {
    const y = terrainHeight(x, z);
    const width = height * (0.36 + random() * 0.17);
    const yaw = random() * TAU;
    crowns.push({ position: [x, y + 0.16, z], scale: [width, height, width], rotation: [0.025 * Math.sin(yaw), yaw, 0.046 * Math.cos(yaw)], color: new THREE.Color().setHSL(0.2 + random() * 0.14, 0.16 + random() * 0.17, 0.59 + random() * 0.22) });
    trunks.push({ position: [x, y + height * 0.2, z], scale: [height * 0.037, height * 0.43, height * 0.037], rotation: [0, yaw, 0], color: new THREE.Color('#5c4a39').multiplyScalar(0.8 + 0.45 * random()) });
  }
  group.add(instances(pineCrown(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93 }), crowns, 'Wind-shaped pines'));
  group.add(instances(new THREE.CylinderGeometry(0.58, 1, 1, 7), new THREE.MeshStandardMaterial({ roughness: 1 }), trunks, 'Pine trunks'));

  const shrubs = [];
  const grass = [];
  const flowers = [];
  const shrubPalette = ['#68724b', '#526244', '#747554', '#4a614d', '#866d52', '#66704a'].map((value) => new THREE.Color(value));
  const flowerPalette = ['#ca9b8a', '#d4ac8c', '#8e797f', '#dab98e'].map((value) => new THREE.Color(value));
  for (let index = 0; index < 820; index++) {
    const theta = random() * TAU;
    const radius = 0.77 + random() * 0.21;
    const [x, z] = rim(theta).map((value) => value * radius);
    if (Math.abs(x) < 10.05 && Math.abs(z) < 8.25 || nearApproach(x, z)) continue;
    const y = terrainHeight(x, z) + 0.04;
    const spread = random();
    const color = shrubPalette[Math.floor(random() * shrubPalette.length)];
    if (spread > 0.75) {
      const size = 0.14 + random() * 0.3;
      for (let shoot = 0; shoot < 3; shoot++) {
        shrubs.push({ position: [x + (random() - 0.5) * size * 1.35, y + size * 0.16, z + (random() - 0.5) * size * 1.35], scale: [size, size * (0.43 + random() * 0.36), size], rotation: [random() * 0.4, random() * TAU, random() * 0.3], color });
      }
    } else {
      const height = 0.11 + random() * 0.25;
      grass.push({ position: [x, y, z], scale: [height * 0.53, height, height * 0.53], rotation: [0, random() * TAU, 0], color });
      if (spread < 0.11 && z > 3.5) flowers.push({ position: [x + 0.01, y + height * 0.86, z], scale: [0.048, 0.042, 0.048], color: flowerPalette[Math.floor(random() * flowerPalette.length)] });
    }
  }

  const tuftPositions = [];
  for (let blade = 0; blade < 8; blade++) {
    const angle = blade / 8 * TAU;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    tuftPositions.push(x * 0.11 - z * 0.17, 0, z * 0.11 + x * 0.17, x * 0.66, 0.56 + random() * 0.44, z * 0.66, x * 0.11 + z * 0.17, 0, z * 0.11 - x * 0.17);
  }
  const tuft = new THREE.BufferGeometry();
  tuft.setAttribute('position', new THREE.Float32BufferAttribute(tuftPositions, 3));
  tuft.computeVertexNormals();
  group.add(instances(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.95 }), shrubs, 'Juniper and heather', false));
  group.add(instances(tuft, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.94 }), grass, 'Windblown meadow grass', false));
  group.add(instances(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.85 }), flowers, 'Heath flowers', false));
}

function addRocks(group, island, random) {
  const formations = [];
  const rubble = [];
  const palette = ['#63696b', '#797c79', '#5c6266', '#777465', '#6c7061', '#555b62'].map((value) => new THREE.Color(value));
  const ray = new THREE.Raycaster();
  const inward = new THREE.Vector3();
  const origin = new THREE.Vector3();

  for (let index = 0; index < 111; index++) {
    const theta = index / 111 * TAU + random() * 0.065;
    const [x, z] = rim(theta);
    const embed = (random() - 0.32) * 0.4;
    const size = 0.24 + random() ** 2 * 1.29;
    const y = -4.9 + random() * 3.9;
    inward.set(-x, 0, -z).normalize();
    origin.set(x * 1.6, y, z * 1.6);
    ray.set(origin, inward);
    const face = ray.intersectObject(island)[0];
    if (!face) continue;
    formations.push({ position: face.point.addScaledVector(inward, size * embed).toArray(), scale: [size * (0.65 + random() * 0.6), size * (0.57 + random() * 0.88), size], rotation: [random() * 0.67, random() * TAU, random() * 0.9], color: palette[index % palette.length].clone().multiplyScalar(0.92 + 0.18 * random()) });
  }

  const skerries = [[-14.8, 6.2, 1.3], [-10.9, 12.75, 1.48], [-12.5, 13.85, 0.8], [13.65, 9.0, 1.3], [15.83, 7.95, 0.85], [9.7, 13.7, 1.12], [15.36, -2.9, 1.05], [-14.4, -6.9, 1.17], [1.8, -13.3, 1.12]];
  for (const [x, z, size] of skerries) {
    for (let index = 0; index < 6; index++) {
      const width = size * (0.28 + random() * 0.65);
      formations.push({ position: [x + (random() - 0.5) * size * 2.6, -5.59 + random() * 0.17, z + (random() - 0.5) * size * 2.9], scale: [width, width * (0.38 + random() * 0.66), width * (0.78 + random() * 0.55)], rotation: [random() * 0.75, random() * TAU, random() * 0.6], color: palette[Math.floor(random() * palette.length)] });
    }
  }

  for (let index = 0; index < 156; index++) {
    const theta = random() * TAU;
    const radius = 0.86 + random() * 0.14;
    const [x, z] = rim(theta).map((value) => value * radius);
    if (Math.abs(x) < 10.1 && Math.abs(z) < 8.24 || nearApproach(x, z)) continue;
    const size = 0.075 + random() ** 2 * 0.64;
    rubble.push({ position: [x, terrainHeight(x, z) + size * 0.22, z], scale: [size * 1.2, size * (0.39 + 0.22 * random()), size], rotation: [random() * 0.52, random() * TAU, random() * 0.6], color: palette[index % palette.length] });
  }
  group.add(instances(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.98, flatShading: true }), formations, 'Fractured shore outcrops'));
  group.add(instances(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.98, flatShading: true }), rubble, 'Limestone rubble'));
}

export function createCliffStairCurve() {
  const points = [
    [0, 0.06, 9.30], [0.03, 0.055, 10.15], [0.17, -0.06, 10.91], [0.85, -0.43, 11.7],
    [1.89, -0.97, 12.42], [3.1, -1.56, 12.91], [4.33, -2.18, 13.36], [5.25, -2.82, 14.03],
    [5.64, -3.46, 14.91], [5.72, -4.16, 15.79], [5.68, -4.78, 16.66],
  ];
  return new THREE.CatmullRomCurve3(points.map((position) => new THREE.Vector3(...position)));
}

function addApproach(group, random) {
  const route = createCliffStairCurve();
  const steps = [];
  const tiles = [];
  const pier = [];
  const stakes = [];
  const rockPositions = [];
  const rockColors = [];
  const slabs = ['#999183', '#858074', '#8d8375', '#a09582', '#817d72'].map((value) => new THREE.Color(value));
  const timber = new THREE.Color('#695645');
  const rock = new THREE.Color('#646365');
  const length = route.getLength();
  const count = 26;
  const foundation = [];
  for (let index = 0; index < count; index++) {
    const t = index / (count - 1);
    const point = route.getPointAt(t);
    const direction = route.getTangentAt(t);
    const yaw = Math.atan2(direction.x, direction.z);
    const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const width = 1.81 - 0.27 * t;
    steps.push({ position: [point.x, point.y - 0.11, point.z], scale: [width, 0.22, length / count * 1.12], rotation: [0, yaw, 0], color: slabs[index % slabs.length] });
    for (let lane = 0; lane < 4; lane++) {
      const offset = (lane - 1.5) * width * 0.236;
      tiles.push({ position: [point.x + side.x * offset, point.y + 0.012, point.z + side.z * offset], scale: [width * (0.207 + 0.02 * random()), 0.034, length / count * (0.81 + random() * 0.16)], rotation: [0, yaw + (random() - 0.5) * 0.035, 0], color: slabs[Math.floor(random() * slabs.length)].clone().multiplyScalar(0.93 + random() * 0.11) });
    }
    const edges = [
      [width * 0.49, point.y - 0.13],
      [width * 0.72, point.y - 0.55],
      [width * (1.05 + 0.12 * random()), Math.max(-5.66, point.y - 1.45 - 0.35 * random())],
      [width * (1.32 + 0.29 * random()), -6.03],
    ];
    foundation.push(edges.map(([offset, y]) => [
      [point.x - side.x * offset, y, point.z - side.z * offset],
      [point.x + side.x * offset, y, point.z + side.z * offset],
    ]));
  }

  for (let index = 1; index < foundation.length; index++) {
    const previous = foundation[index - 1];
    const current = foundation[index];
    addFace(rockPositions, rockColors, previous[0][0], current[0][1], previous[0][1], rock);
    addFace(rockPositions, rockColors, previous[0][0], current[0][0], current[0][1], rock);
    for (let level = 0; level < current.length - 1; level++) {
      const shade = rock.clone().multiplyScalar(0.86 + random() * 0.27);
      addFace(rockPositions, rockColors, previous[level][0], previous[level + 1][0], current[level][0], shade);
      addFace(rockPositions, rockColors, previous[level + 1][0], current[level + 1][0], current[level][0], shade);
      addFace(rockPositions, rockColors, previous[level][1], current[level][1], previous[level + 1][1], shade);
      addFace(rockPositions, rockColors, previous[level + 1][1], current[level][1], current[level + 1][1], shade);
    }
  }
  const end = foundation.at(-1);
  for (let level = 0; level < end.length - 1; level++) {
    addFace(rockPositions, rockColors, end[level][0], end[level + 1][1], end[level][1], rock);
    addFace(rockPositions, rockColors, end[level][0], end[level + 1][0], end[level + 1][1], rock);
  }

  for (let index = 0; index < 13; index++) {
    pier.push({ position: [5.67, -4.85, 16.55 + index * 0.16], scale: [1.46 + random() * 0.12, 0.11, 0.154], rotation: [0, (random() - 0.5) * 0.034, 0], color: timber.clone().multiplyScalar(0.8 + random() * 0.42) });
  }
  for (const x of [5.08, 6.25]) {
    pier.push({ position: [x, -4.95, 17.57], scale: [0.13, 0.16, 2.13], color: timber });
    for (const z of [16.85, 17.69, 18.4]) {
      stakes.push({ position: [x, -5.22, z], scale: [0.11, 1.17, 0.11], color: timber.clone().multiplyScalar(0.74 + random() * 0.45) });
    }
  }

  const box = new THREE.BoxGeometry();
  const stone = new THREE.MeshStandardMaterial({ roughness: 0.93 });
  group.add(makeMesh(faceGeometry(rockPositions, rockColors), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98 }), 'Cliff stair foundation'));
  group.add(instances(box, stone, steps, 'Cliff stair treads'), instances(box, stone, tiles, 'Cliff stair paving'));
  group.add(instances(box, stone, pier, 'Weathered timber landing'));
  group.add(instances(new THREE.CylinderGeometry(0.84, 1, 1, 7), stone, stakes, 'Landing piles'));

  const lanterns = [];
  const glass = [];
  const caps = [];
  const iron = new THREE.Color('#35353a');
  for (const [t, side] of [[0.13, -1], [0.38, 1], [0.68, -1], [0.93, 1]]) {
    const point = route.getPointAt(t);
    const direction = route.getTangentAt(t);
    const yaw = Math.atan2(direction.x, direction.z);
    const offset = side * (0.91 - 0.09 * t);
    const x = point.x + Math.cos(yaw) * offset;
    const z = point.z - Math.sin(yaw) * offset;
    lanterns.push({ position: [x, point.y + 0.26, z], scale: [0.063, 0.56, 0.063], color: iron });
    lanterns.push({ position: [x, point.y + 0.56, z], scale: [0.204, 0.05, 0.204], rotation: [0, yaw, 0], color: iron });
    glass.push({ position: [x, point.y + 0.653, z], scale: [0.141, 0.14, 0.141], rotation: [0, yaw, 0] });
    caps.push({ position: [x, point.y + 0.765, z], scale: [0.155, 0.112, 0.155], rotation: [0, yaw + Math.PI / 4, 0], color: iron });
  }
  group.add(instances(box, stone, lanterns, 'Iron footpath lanterns'));
  group.add(instances(box, new THREE.MeshStandardMaterial({ color: '#f5b76f', emissive: '#ff8c3d', emissiveIntensity: 1.65, roughness: 0.38 }), glass, 'Lantern glass', false));
  group.add(instances(new THREE.ConeGeometry(1, 1, 4), stone, caps, 'Lantern hoods'));
}

const lakeLevel = -5.5;

function buildBank({ x, z, width, depth, turn, rise, phase }, random, shore) {
  const rings = [.18, .34, .52, .68, .80, .90, .96, 1, 1.1];
  const rock = new THREE.Color('#606b6a');
  const scrub = new THREE.Color('#475744');
  const shingle = new THREE.Color('#918474');
  const foam = new THREE.Color('#637c86');
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const sides = 58;
  const positions = [];
  const colors = [];

  function point(angle, radius) {
    const coast = 1 + .087 * Math.sin(angle * 3 + phase) + .058 * Math.cos(angle * 5 - phase)
      + .026 * Math.sin(angle * 11 + phase * 2);
    const bearing = angle + .11 * Math.sin(angle * 4 + radius * 5 + phase) * (1 - radius);
    const u = Math.cos(bearing) * radius;
    const v = Math.sin(bearing) * radius;
    const localX = u * width * coast;
    const localZ = v * depth * coast;
    const ridge = .88 + .29 * Math.sin(4.8 * u + 2.6 * v + phase) + .17 * Math.cos(5.4 * v - 1.7 * u + phase);
    const height = radius > 1 ? -.69 : .022 + rise * (1 - radius ** 2) * ridge;
    return [x + localX * cos - localZ * sin, lakeLevel + height, z + localX * sin + localZ * cos];
  }

  const shorePoint = (angle, radius) => {
    const [px, , pz] = point(angle, radius);
    return [px, lakeLevel + .013, pz];
  };

  for (let i = 0; i < sides; i++) {
    const angle = i * TAU / sides;
    const next = (i + 1) * TAU / sides;
    addFace(positions, colors, point(0, 0), point(next, rings[0]), point(angle, rings[0]), scrub);
    for (let j = 1; j < rings.length; j++) {
      const previous = rings[j - 1];
      const current = rings[j];
      const strand = THREE.MathUtils.smoothstep(current, .76 + .11 * Math.sin(angle * 3 + phase), 1.02);
      const material = scrub.clone().lerp(rock, .19 + current * .36).lerp(shingle, strand * .63)
        .multiplyScalar(.91 + .13 * random() + .05 * Math.cos(angle * 11 + j * 1.6));
      const a = point(angle, previous);
      const b = point(next, previous);
      const c = point(next, current);
      const d = point(angle, current);
      addFace(positions, colors, a, c, d, material);
      addFace(positions, colors, a, b, c, material.clone().multiplyScalar(.96 + random() * .08));
    }

    if (Math.sin(angle * 11 + phase) > -.35 && rise > 1.1) {
      const width = .008 + random() * .015;
      const a = shorePoint(angle, 1.012);
      const b = shorePoint(next, 1.012);
      const c = shorePoint(next, 1.012 + width);
      const d = shorePoint(angle, 1.012 + width);
      const tint = foam.clone().multiplyScalar(.8 + random() * .27);
      addFace(shore.positions, shore.colors, a, c, d, tint);
      addFace(shore.positions, shore.colors, a, b, c, tint);
    }
  }

  const mesh = new THREE.Mesh(faceGeometry(positions, colors), shore.material);
  mesh.name = 'Rocky lake bank';
  mesh.updateMatrixWorld();
  return { mesh, point };
}

function shoreBlock(entries, color, position, scale, rotation) {
  entries.push({ position, scale, rotation, color: new THREE.Color(color) });
}

function addWatchtower(x, floor, z, random, masonry, beams, lights) {
  const sides = 16;
  for (let side = 0; side < sides; side++) {
    const angle = side * TAU / sides;
    const courses = side === 4 ? 8 : 9 + Math.floor(2 * Math.cos(angle * 2 + 1.15) + 1.7 * Math.sin(angle * 3));
    for (let course = 0; course < courses; course++) {
      if (side === 4 && course < 7 || (side === 3 || side === 5) && course < 5) continue;
      const staggered = angle + .055 * (course % 2);
      const radius = 1.76 - course * .009;
      const stone = ['#807b70', '#928878', '#77776e', '#8b8171'][Math.floor(random() * 4)];
      shoreBlock(masonry, stone,
        [x + Math.cos(staggered) * radius, floor + course * .34, z + Math.sin(staggered) * radius],
        [.50 + random() * .05, .335, .675 + random() * .02], [0, -staggered, 0]);
    }
  }
  for (let index = 0; index < 9; index++) {
    const angle = (index + .5) * Math.PI / 9;
    const color = index % 3 === 0 ? '#928878' : '#817b70';
    shoreBlock(masonry, color, [x + .73 * Math.cos(angle), floor + 1.28 + .76 * Math.sin(angle), z + 1.65],
      [.235, .255, .55], [0, 0, angle - Math.PI / 2]);
  }
  for (const side of [-1, 1]) {
    for (let course = 0; course < 5; course++) {
      shoreBlock(masonry, course % 2 ? '#8c8372' : '#82796b', [x + side * .76, floor - .64 + course * .34, z + 1.65],
        [.265, .333, .54]);
    }
  }
  for (let row = -3; row <= 3; row++) {
    for (let col = -3; col <= 3; col++) {
      if (Math.hypot(row, col) > 3.4 || row > 0 && Math.abs(col) < 3) continue;
      const shade = ['#76796e', '#777264', '#888476'][(row * row + col + 5) % 3];
      shoreBlock(masonry, shade, [x + col * .37, floor + .09, z + row * .37], [.352, .22, .35]);
    }
  }
  for (const [dx, dz, size] of [[1.7, 1.56, .52], [2.22, .71, .43], [-1.5, 1.41, .63], [-1.48, 2.11, .34], [-2.24, .87, .46]]) {
    shoreBlock(masonry, '#80796d', [x + dx, floor - .11, z + dz], [size, size * .61, size * .82], [0, random() * 2, -.23]);
  }
  // A small shelter bench and old lantern mark the safe viewing side of the ruin.
  for (const offset of [-.26, .26]) shoreBlock(beams, '#4b443d', [x + 1.02, floor + .31, z + offset], [.17, .29, .12]);
  shoreBlock(beams, '#6b5947', [x + 1.02, floor + .48, z], [.33, .082, .77]);
  shoreBlock(beams, '#463e35', [x + 1.16, floor + .75, z - .77], [.20, .12, .20]);
  shoreBlock(lights, '#e8ad74', [x + 1.16, floor + .89, z - .77], [.11, .21, .11]);
  shoreBlock(beams, '#4b4039', [x + 1.16, floor + 1.015, z - .77], [.17, .045, .17]);
}

function addSkiff(group, x, z, yaw, hullMaterial, beams) {
  const stations = [[-1.58, .06, .34], [-1.03, .39, .19], [-.39, .57, .135], [.39, .58, .135], [1.08, .42, .205], [1.63, .045, .41]];
  const hullColors = ['#4e4945', '#745747', '#a38164'].map((color) => new THREE.Color(color));
  const positions = [];
  const colors = [];
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const world = (dx, dy, dz) => [x + dx * cos + dz * sin, lakeLevel + dy, z + dz * cos - dx * sin];

  for (let i = 1; i < stations.length; i++) {
    const [aft, aWidth, aHeight] = stations[i - 1];
    const [fore, fWidth, fHeight] = stations[i];
    for (const side of [-1, 1]) {
      const a = world(side * aWidth * .47, -.23, aft);
      const b = world(side * fWidth * .47, -.23, fore);
      const c = world(side * fWidth * .83, fHeight - .115, fore);
      const d = world(side * aWidth * .83, aHeight - .115, aft);
      const e = world(side * fWidth, fHeight, fore);
      const f = world(side * aWidth, aHeight, aft);
      addFace(positions, colors, a, b, c, hullColors[0]);
      addFace(positions, colors, a, c, d, hullColors[0]);
      addFace(positions, colors, d, c, e, hullColors[1]);
      addFace(positions, colors, d, e, f, hullColors[1]);
      const railYaw = yaw + Math.atan2(side * (fWidth - aWidth), fore - aft);
      shoreBlock(beams, '#94765e', world(side * (fWidth + aWidth) * .5, (fHeight + aHeight) * .5, (fore + aft) * .5),
        [.06, .055, Math.hypot(fWidth - aWidth, fore - aft) + .025], [Math.atan2(aHeight - fHeight, fore - aft), railYaw, 0]);
    }
    const a = world(-aWidth * .47, -.135, aft);
    const b = world(-fWidth * .47, -.135, fore);
    const c = world(fWidth * .47, -.135, fore);
    const d = world(aWidth * .47, -.135, aft);
    addFace(positions, colors, a, b, c, hullColors[2]);
    addFace(positions, colors, a, c, d, hullColors[2]);
  }

  for (const [localZ, span] of [[-.63, .82], [.28, 1.02], [.91, .77]]) {
    shoreBlock(beams, '#8f735c', world(0, .064, localZ), [span, .047, .22], [0, yaw, 0]);
  }
  const hull = new THREE.Mesh(faceGeometry(positions, colors), hullMaterial);
  hull.name = 'Open wooden skiff';
  group.add(hull);
}

function addFisherLanding(x, z, hut, beams, light) {
  for (let index = 0; index < 24; index++) {
    shoreBlock(beams, index % 4 === 0 ? '#827264' : '#695a4d', [x - index * .217, lakeLevel + .48, z], [.217, .095, 1.58]);
  }
  for (const step of [1, 7, 13, 19, 23]) {
    for (const offset of [-.66, .66]) {
      shoreBlock(beams, '#51483c', [x - step * .217, lakeLevel - .12, z + offset], [.13, 1.38, .13]);
    }
  }
  const [hx, hy, hz] = hut;
  shoreBlock(beams, '#685f50', [hx, hy - .86, hz], [2.62, 1.55, 2.17]);
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 5; column++) {
      const z = hz - .84 + column * .40 + .08 * (row % 2);
      const color = ['#787263', '#6f685a', '#817768'][(row + column * 2) % 3];
      shoreBlock(beams, color, [hx - 1.325, hy - .25 - row * .32, z], [.065, .305, .375]);
    }
  }
  shoreBlock(beams, '#887969', [hx, hy + .80, hz], [2.72, 1.80, 2.30]);
  for (let index = 0; index < 9; index++) {
    shoreBlock(beams, index % 2 ? '#766553' : '#8a775e', [hx - 1.369, hy + .84, hz - 1.038 + index * .259], [.055, 1.72, .243]);
  }
  for (const direction of [-1, 1]) {
    shoreBlock(beams, '#3e4e57', [hx + .77 * direction, hy + 1.93, hz], [1.80, .129, 2.61], [0, 0, -.49 * direction]);
    for (let row = 1; row < 6; row++) {
      const offset = .27 * row;
      shoreBlock(beams, '#485761', [hx + offset * direction, hy + 2.38 - offset * .53, hz], [.036, .037, 2.64], [0, 0, -.49 * direction]);
    }
  }
  const doorZ = hz + .64;
  shoreBlock(beams, '#473d38', [hx - 1.42, hy + .53, doorZ], [.10, 1.27, .55]);
  for (const [depth, rise] of [[1.39, -.14], [1.53, -.36], [1.66, -.59], [1.77, -.82]]) {
    shoreBlock(beams, '#706052', [hx - depth, hy + rise, doorZ], [.275, .21, .53]);
  }
  for (const rail of [.16, .88]) shoreBlock(beams, '#675143', [hx - 1.478, hy + rail, doorZ], [.026, .064, .49]);
  shoreBlock(beams, '#a58859', [hx - 1.492, hy + .51, doorZ + .17], [.036, .071, .084]);
  shoreBlock(beams, '#513e33', [hx - 1.42, hy + .98, hz - .49], [.16, .53, .62]);
  shoreBlock(light, '#e5af65', [hx - 1.52, hy + .98, hz - .49], [.056, .38, .44]);
  shoreBlock(beams, '#77756a', [hx + .63, hy + 2.22, hz - .65], [.34, .91, .35]);
  shoreBlock(beams, '#898272', [hx + .63, hy + 2.69, hz - .65], [.44, .12, .44]);
  for (const side of [-1, 1]) {
    shoreBlock(beams, '#473f36', [hx - .39, hy + .94, hz + side * 1.162], [.55, .55, .072]);
    shoreBlock(light, '#d89e6b', [hx - .39, hy + .94, hz + side * 1.201], [.40, .39, .020]);
    shoreBlock(beams, '#52453a', [hx - .39, hy + .94, hz + side * 1.22], [.037, .45, .022]);
    shoreBlock(beams, '#52453a', [hx - .39, hy + .94, hz + side * 1.22], [.45, .040, .022]);
  }

  for (const offset of [0, 4.82]) {
    const lampX = x - offset;
    const lampZ = z - .67;
    shoreBlock(beams, '#4b4039', [lampX, lakeLevel + .87, lampZ], [.097, .84, .097]);
    shoreBlock(beams, '#4b4039', [lampX, lakeLevel + 1.36, lampZ], [.21, .08, .21]);
    shoreBlock(light, '#eac18a', [lampX, lakeLevel + 1.23, lampZ], [.14, .16, .14]);
  }
}

function addShoreTrail(banks, route, timber, lights) {
  const random = seededRandom(628297);
  const positions = [];
  const colors = [];
  const paving = ['#85817a', '#807e72', '#99907e', '#777c76', '#8e8b7e'].map(value => new THREE.Color(value));
  const timberTints = ['#635547', '#735e4f', '#786553', '#866f56'].map(value => new THREE.Color(value));
  const edgeStone = new THREE.Color('#706d62');
  const divisions = Math.ceil(route.getLength() / .34);
  const lateral = (fraction, amount, y) => {
    const point = route.getPointAt(fraction);
    const tangent = route.getTangentAt(fraction);
    const length = Math.hypot(tangent.x, tangent.z);
    return [point.x + tangent.z * amount / length, y, point.z - tangent.x * amount / length];
  };

  for (let i = 0; i < divisions; i++) {
    const from = i / divisions;
    const to = (i + 1) / divisions;
    const fraction = (from + to) / 2;
    const center = route.getPointAt(fraction);
    const stage = getShoreWalkStage(fraction);
    if (stage === 'farDock' || stage === 'fisherHut' && center.x < 29.52 && Math.abs(center.z + 9.0365) < .28) continue;
    const bridge = stage === 'shoreBridge';
    const margin = bridge ? .20 : .17;
    const width = getShoreWalkWidth(fraction) + margin;
    const startWidth = getShoreWalkWidth(from) + margin;
    const endWidth = getShoreWalkWidth(to) + margin;
    const tint = bridge ? timberTints[Math.floor(random() * timberTints.length)] : paving[Math.floor(random() * paving.length)];
    const y = center.y;
    const a = lateral(from, -startWidth, y);
    const b = lateral(from, startWidth, y);
    const c = lateral(to, endWidth, y);
    const d = lateral(to, -endWidth, y);
    addFace(positions, colors, a, c, b, tint);
    addFace(positions, colors, a, d, c, tint);
    const thickness = bridge ? .13 : .43;
    const beneath = ([x, y, z]) => [x, y - thickness, z];
    const side = bridge ? tint.clone().multiplyScalar(.77) : edgeStone;
    for (const [left, right] of [[b, a], [c, b], [d, c], [a, d]]) {
      addFace(positions, colors, left, beneath(right), right, side);
      addFace(positions, colors, left, beneath(left), beneath(right), side);
    }
    const yaw = Math.atan2(c[0] - b[0], c[2] - b[2]);
    if (bridge) {
      for (const sign of [-1, 1]) {
        const [x, , z] = lateral(fraction, sign * (width - .065), y);
        shoreBlock(timber, '#57483d', [x, y + .51, z], [.062, .069, .36], [0, yaw, 0]);
        if (i % 4 === 0) shoreBlock(timber, '#594a3c', [x, (y - 5.94) / 2 + .29, z], [.11, y + 6.52, .11]);
      }
    } else if (i % 20 === 4 && stage !== 'watchtower') {
      const [x, , z] = lateral(fraction, width + .18, y);
      shoreBlock(timber, '#484138', [x, y + .24, z], [.064, .72, .064]);
      shoreBlock(timber, '#484138', [x, y + .56, z], [.18, .045, .18]);
      shoreBlock(lights, '#e9b779', [x, y + .65, z], [.12, .15, .12]);
      shoreBlock(timber, '#4b433a', [x, y + .74, z], [.18, .04, .18]);
    }
  }
  const trail = new THREE.Mesh(faceGeometry(positions, colors), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .93 }));
  trail.name = 'Stone lakeside path and timber footbridges';
  trail.receiveShadow = true;
  banks.add(trail);
}

function addSurroundingBanks(group) {
  const banks = new THREE.Group();
  banks.name = 'Forested shores and lake landmarks';
  const random = seededRandom(570113);
  const shore = { positions: [], colors: [], material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .96 }) };
  const sites = [
    { x: -12, z: -43, width: 21, depth: 9, turn: -.1, rise: 4.7, phase: 1.3, trees: 60, landmark: 'tower' },
    { x: 24, z: -39, width: 14, depth: 7.8, turn: .48, rise: 3.8, phase: 2.5, trees: 34 },
    { x: 39, z: -9, width: 9.2, depth: 15, turn: 0, rise: 4.2, phase: 3.6, trees: 42, landmark: 'landing' },
    { x: 40, z: 23, width: 7.5, depth: 11, turn: -.5, rise: 3, phase: 5.1, trees: 21 },
    { x: 12, z: 46, width: 13.3, depth: 6.3, turn: .13, rise: 2.5, phase: 2.8, trees: 24 },
    { x: -25, z: 39, width: 15, depth: 7.5, turn: .33, rise: 3.7, phase: .8, trees: 28 },
    { x: -41, z: 11, width: 10.8, depth: 14.5, turn: -.54, rise: 4.4, phase: 4.2, trees: 38 },
    { x: -41, z: -17, width: 10, depth: 13.5, turn: .41, rise: 4.1, phase: 5.5, trees: 35 },
    { x: -22, z: -23, width: 3.7, depth: 2.8, turn: .56, rise: 1.8, phase: 2.2, trees: 5 },
    { x: 24, z: 14, width: 3.7, depth: 2.4, turn: -.51, rise: 1.8, phase: 5.8, trees: 4 },
    { x: -23, z: 18, width: 2.9, depth: 2.2, turn: .4, rise: .9, phase: 1.4, trees: 0 },
  ];
  const crowns = [];
  const trunks = [];
  const boulders = [];
  const masonry = [];
  const beams = [];
  const lights = [];
  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const top = new THREE.Vector3();
  const timber = new THREE.Color('#615648');
  const hull = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .83 });
  const trail = createShoreWalkCurve();
  const trailPoints = trail.getSpacedPoints(Math.ceil(trail.getLength() * 2));
  const closeToTrail = (x, z, clearance) => trailPoints.some(point => (x - point.x) ** 2 + (z - point.z) ** 2 < clearance ** 2);

  for (const site of sites) {
    const bank = buildBank(site, random, shore);
    banks.add(bank.mesh);
    const heightAt = ([x, y, z]) => {
      ray.set(top.set(x, 8, z), down);
      return ray.intersectObject(bank.mesh)[0]?.point.y ?? y;
    };
    let landmark;
    if (site.landmark === 'tower') {
      landmark = bank.point(1.65, .43);
      addWatchtower(landmark[0], heightAt(landmark), landmark[2], random, masonry, beams, lights);
    } else if (site.landmark === 'landing') {
      landmark = bank.point(Math.PI, .56);
      const [x, , z] = bank.point(Math.PI, .974);
      addFisherLanding(x, z, [landmark[0], heightAt(landmark), landmark[2]], beams, lights);
    }

    const occupied = [];
    for (let trial = 0; trial < site.trees * 3 && occupied.length < site.trees; trial++) {
      const angle = random() * TAU;
      const radius = .83 * Math.sqrt(random());
      const point = bank.point(angle, radius);
      const [x, , z] = point;
      if (landmark && (Math.hypot(x - landmark[0], z - landmark[2]) < 3.65
        || site.landmark === 'landing' && x < landmark[0] && Math.abs(z - landmark[2]) < 1.1)) continue;
      if (closeToTrail(x, z, 1.65)) continue;
      if (occupied.some(([px, pz]) => Math.hypot(x - px, z - pz) < .96)) continue;
      occupied.push([x, z]);
      const y = heightAt(point);
      const height = (1.42 + random() * 2.43) * (.8 + (1 - radius) * .27);
      const width = height * (.40 + .2 * random());
      const yaw = random() * TAU;
      const tint = new THREE.Color().setHSL(.20 + .17 * random(), .14 + .16 * random(), .48 + .24 * random());
      crowns.push({ position: [x, y - .035, z], scale: [width, height, width], rotation: [0, yaw, 0], color: tint });
      trunks.push({ position: [x, y + height * .16, z], scale: [height * .038, height * .38, height * .038], color: timber });
    }

    const count = Math.max(8, Math.floor((site.width + site.depth) * 1.4));
    for (let i = 0; i < count; i++) {
      const angle = i / count * TAU + random() * .09;
      const point = bank.point(angle, .75 + random() * .23);
      const [x, , z] = point;
      const y = heightAt(point);
      const scale = .17 + random() ** 2 * (site.rise > 3 ? 1.36 : .91);
      if (closeToTrail(x, z, .89 + scale * 1.4)) continue;
      boulders.push({ position: [x, y - .14 * scale, z], scale: [scale * (1 + random() * .52), scale * (.42 + random() * .31), scale],
        rotation: [random() * .4, random() * TAU, -.18], color: new THREE.Color(i % 3 ? '#666d68' : '#888477').multiplyScalar(.8 + random() * .35) });
    }
  }

  addSkiff(banks, -16.5, 26.2, -.78, hull, beams);
  addShoreTrail(banks, trail, beams, lights);
  const standard = new THREE.MeshStandardMaterial({ roughness: .9 });
  const cube = new THREE.BoxGeometry();
  const rim = new THREE.Mesh(faceGeometry(shore.positions, shore.colors), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .32, depthWrite: false }));
  rim.name = 'Thin wash along the shoals';
  banks.add(rim);
  banks.add(instances(pineCrown(6, [[.14, .56, .42], [.38, .43, .36], [.62, .30, .38]]),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 }), crowns, 'Pine groves on the banks', false));
  banks.add(instances(new THREE.CylinderGeometry(.58, 1, 1, 5), standard, trunks, 'Distant pine trunks', false));
  banks.add(instances(new THREE.DodecahedronGeometry(1, 0), standard, boulders, 'Boulders around the bays', false));
  banks.add(instances(cube, standard, masonry, 'Ruined northern watchtower', false));
  banks.add(instances(cube, standard, beams, 'Fisher hut, jetty and skiff trim', false));
  banks.add(instances(cube, new THREE.MeshStandardMaterial({ color: '#dda86a', emissive: '#f5a65e', emissiveIntensity: .75, roughness: .45 }), lights, 'Lamps on the east jetty', false));
  group.add(banks);
}

export function createEnvironment() {
  const group = new THREE.Group();
  group.name = 'The island and its cliff stair';
  const random = seededRandom(75619);
  const island = buildIsland(random);
  group.add(island);
  addRocks(group, island, random);
  addPlants(group, random);
  addApproach(group, random);
  addSurroundingBanks(group);
  return group;
}
