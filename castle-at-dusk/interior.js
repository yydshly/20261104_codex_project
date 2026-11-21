import * as THREE from 'three';
import { TOWER } from './tower-layout.js';

const CENTER = 0.36;
const FRONT = -1.505;
const BACK = -4.995;

function pointedArch(half, spring, control, crest) {
  const points = [];
  for (let i = 0; i <= 24; i++) {
    const t = Math.min(i, 24 - i) / 12;
    const x = half * (1 - t * t) * (i < 12 ? -1 : 1);
    const y = (1 - t) ** 2 * spring + 2 * t * (1 - t) * control + t * t * crest;
    points.push(new THREE.Vector2(x, y));
  }
  return points;
}

function archOutline(half, base, spring, control, crest) {
  return [new THREE.Vector2(-half, base), ...pointedArch(half, spring, control, crest), new THREE.Vector2(half, base)];
}

function extrusion(outline, depth) {
  return new THREE.ExtrudeGeometry(new THREE.Shape(outline), { depth, bevelEnabled: false });
}

function vaultGeometry() {
  const positions = [];
  const indices = [];
  for (let i = 0; i <= 32; i++) {
    const angle = Math.PI * i / 32;
    const x = CENTER + 2.40 * Math.cos(angle);
    const y = 2.61 + 1.40 * Math.sin(angle);
    positions.push(x, y, FRONT, x, y, BACK);
    if (i < 32) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createInterior() {
  const group = new THREE.Group();
  group.name = 'Gate passage, courtyard, and Hall of the Last Light';

  const surface = (color, props) => new THREE.MeshStandardMaterial({ color, roughness: 0.84, ...props });
  const stone = surface('#ad987e');
  const pale = surface('#c1ab8c');
  const deep = surface('#6c5e56');
  const vault = surface('#8b7768', { side: THREE.DoubleSide });
  const masonry = ['#9e8d7d', '#b7a28b', '#a79583', '#af9d87', '#a38f7d'].map((color) => surface(color));
  const flagstones = ['#82776d', '#9a8d7c', '#a49785', '#918271'].map((color) => surface(color));
  const bronze = surface('#bc9457', { metalness: 0.46, roughness: 0.48 });
  const oak = surface('#56382d');
  const iron = surface('#40383b', { metalness: 0.48, roughness: 0.46 });
  const velvet = surface('#743749');
  const dyedCloth = surface('#652f4b', { side: THREE.DoubleSide });
  const band = surface('#a97952');
  const goldThread = surface('#d5aa67');
  const flame = surface('#ffad51', { emissive: '#ff802d', emissiveIntensity: 2.5 });
  const flameCore = surface('#fff2bb', { emissive: '#ffbf63', emissiveIntensity: 3.3 });

  const cube = new THREE.BoxGeometry();
  const ball = new THREE.SphereGeometry(1, 12, 8);
  const shaft = new THREE.CylinderGeometry(1, 1, 1, 12);
  const batches = new Map();
  const matrixSource = new THREE.Object3D();
  const lights = [];
  const fires = [];

  function add(geometry, material, x, y, z, angle = 0) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.rotation.y = angle;
    object.receiveShadow = true;
    group.add(object);
    return object;
  }

  function part(geometry, material, x, y, z, sx, sy, sz, angle = 0) {
    const key = `${geometry.id}/${material.id}`;
    if (!batches.has(key)) batches.set(key, { geometry, material, matrices: [] });
    matrixSource.position.set(x, y, z);
    matrixSource.rotation.y = angle;
    matrixSource.scale.set(sx, sy, sz);
    matrixSource.updateMatrix();
    batches.get(key).matrices.push(matrixSource.matrix.clone());
  }

  function block(material, x, y, z, width, height, depth, angle = 0) {
    part(cube, material, x, y, z, width, height, depth, angle);
  }

  function archFrame(x, z, width, spring, control, crest, yaw = 0) {
    const bandWidth = 0.135;
    const outside = archOutline(width + bandWidth, 0.12, spring, control + 0.13, crest + 0.16);
    const inside = archOutline(width - 0.012, 0.12, spring, control, crest).reverse();
    add(extrusion([...outside, ...inside], 0.09), pale, x, 0, z, yaw);
    for (const side of [-1, 1]) {
      for (const y of [0.22, spring - 0.03]) {
        block(stone, x + side * (width + 0.054), y, z + Math.cos(yaw) * 0.048, 0.215, 0.14, 0.18);
      }
    }
    block(pale, x, crest + 0.073, z + Math.cos(yaw) * 0.062, 0.16, 0.19, 0.128);
  }

  function layWall(x, z, length, height, yaw, offset, bottom = 0.14) {
    const rows = Math.round(height / 0.34);
    const rise = height / rows;
    const brickWidth = 0.59;
    for (let row = 0; row < rows; row++) {
      let cursor = -length / 2;
      let column = 0;
      while (cursor < length / 2 - 0.03) {
        const span = Math.min(length / 2 - cursor, brickWidth * (column === 0 && row % 2 ? 0.5 : 1));
        const center = cursor + span / 2;
        const material = masonry[(row * 7 + column * 11 + offset) % masonry.length];
        block(material, x + Math.cos(yaw) * center, bottom + rise * (row + 0.5), z - Math.sin(yaw) * center,
          span - 0.016, rise - 0.013, 0.057, yaw);
        column++;
        cursor += span;
      }
    }
  }

  function banner(x, bottom, z, width, height, yaw = 0) {
    const shape = [
      new THREE.Vector2(-width / 2, height), new THREE.Vector2(width / 2, height),
      new THREE.Vector2(width / 2, height * 0.2), new THREE.Vector2(0, 0),
      new THREE.Vector2(-width / 2, height * 0.2),
    ];
    const bannerMesh = add(extrusion(shape, 0.013), dyedCloth, x, bottom, z, yaw);
    const trim = new THREE.Group();
    const outline = new THREE.LineBasicMaterial({ color: '#dbb174' });
    const inset = shape.map((point) => new THREE.Vector3(point.x * 0.82, point.y * 0.89 + height * 0.054, 0.017));
    trim.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(inset), outline));
    const heraldry = new THREE.Mesh(cube, goldThread);
    heraldry.scale.set(width * 0.22, width * 0.22, 0.013);
    heraldry.rotation.z = Math.PI / 4;
    heraldry.position.set(0, height * 0.61, 0.018);
    trim.add(heraldry);
    const rod = new THREE.Mesh(shaft, bronze);
    rod.scale.set(0.023, width + 0.18, 0.023);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, height, 0.025);
    trim.add(rod);
    bannerMesh.add(trim);
  }

  function sconce(x, y, z, yaw, withLight) {
    const mountX = x - Math.sin(yaw) * 0.18;
    const mountZ = z - Math.cos(yaw) * 0.18;
    block(iron, mountX, y - 0.18, mountZ, 0.13, 0.37, 0.06, yaw);
    block(bronze, x - Math.sin(yaw) * 0.075, y - 0.23, z - Math.cos(yaw) * 0.075, 0.051, 0.062, 0.23, yaw);
    part(shaft, iron, x, y - 0.12, z, 0.126, 0.079, 0.126);
    part(shaft, bronze, x, y - 0.08, z, 0.109, 0.026, 0.109);
    const fire = new THREE.Group();
    fire.position.set(x, y, z);
    const outer = new THREE.Mesh(ball, flame);
    outer.scale.set(0.072, 0.17, 0.064);
    outer.position.y = 0.043;
    const core = new THREE.Mesh(ball, flameCore);
    core.scale.set(0.046, 0.104, 0.043);
    core.position.set(0.015, 0.002, 0.018);
    fire.add(outer, core);
    group.add(fire);
    fires.push(fire);
    if (!withLight) return;
    const light = new THREE.PointLight('#ffb974', 8.4, 5.6, 2);
    light.position.set(x + Math.sin(yaw) * 0.18, y + 0.11, z + Math.cos(yaw) * 0.18);
    light.visible = false;
    group.add(light);
    lights.push(light);
  }

  // The passage and exterior keep doorway use the same fitted masonry as the curtain walls.
  archFrame(0, 5.505, 1.36, 2.42, 3.17, 3.89, Math.PI);
  for (const side of [-1, 1]) {
    layWall(side * 1.322, 6.365, 1.67, 2.29, -side * Math.PI / 2, 3);
    sconce(side * 1.49, 2.39, 5.38, Math.PI, false);
  }
  archFrame(CENTER, -1.073, 1.02, 2.12, 2.67, 3.24);
  archFrame(CENTER, FRONT, 1.02, 2.12, 2.67, 3.24, Math.PI);
  for (const side of [-1, 1]) banner(CENTER + side * 1.74, 1.26, -1.004, 0.61, 1.52);
  for (let row = 0; row < 12; row++) {
    const z = -0.82 + row * 0.49;
    for (const side of [-1, 1]) {
      block(pale, CENTER + side * 0.81, 0.106, z, 0.19, 0.029, 0.463);
      block(flagstones[row % flagstones.length], CENTER + side * 0.395, 0.106, z, 0.635, 0.024, 0.459);
    }
  }
  block(pale, CENTER, 0.074, -1.258, 2.014, 0.096, 0.45);

  // A low stone vault, an embroidered aisle and a small throne dais occupy the ground floor.
  add(vaultGeometry(), vault, 0, 0, 0);
  layWall(-2.032, -3.25, 3.50, 3.36, Math.PI / 2, 0);
  const { entranceZ: stairZ, entranceHalfWidth: stairHalf, entranceSpring: stairSpring,
    entranceControl: stairControl, entranceCrest: stairCrest } = TOWER;
  for (const [back, near] of [[BACK, stairZ - stairHalf], [stairZ + stairHalf, FRONT]]) {
    layWall(2.752, (back + near) / 2, near - back, stairCrest - .17, -Math.PI / 2, 2);
  }
  layWall(2.752, -3.25, 3.50, .58, -Math.PI / 2, 2, stairCrest + .029);
  const stairTrim = archOutline(stairHalf + .158, .12, stairSpring, stairControl + .13, stairCrest + .14);
  const stairOpening = archOutline(stairHalf, .12, stairSpring, stairControl, stairCrest).reverse();
  add(extrusion([...stairTrim, ...stairOpening], .09), pale, 2.721, 0, stairZ, -Math.PI / 2);
  for (const side of [-1, 1]) {
    block(pale, 2.641, .217, stairZ + side * (stairHalf + .069), .205, .195, .208);
    block(pale, 2.651, stairSpring, stairZ + side * (stairHalf + .067), .181, .132, .203);
  }
  block(bronze, 2.662, stairCrest + .245, stairZ, .045, .20, .36);
  for (let i = 0; i < 3; i++) {
    block(goldThread, 2.635, stairCrest + .21 + i * .037, stairZ - .092 + i * .067, .016, .028, .095);
  }
  layWall(CENTER, BACK + 0.021, 4.75, 3.36, 0, 1);
  for (const z of [-4.52, -3.31, -2.12]) {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
      const angle = Math.PI * i / 12;
      return new THREE.Vector3(CENTER + 2.39 * Math.cos(angle), 2.61 + 1.398 * Math.sin(angle), z);
    }));
    add(new THREE.TubeGeometry(curve, 32, 0.083, 7, false), pale, 0, 0, 0);
    block(pale, CENTER, 3.948, z, 0.265, 0.14, 0.248);
    part(ball, bronze, CENTER, 3.872, z, 0.06, 0.04, 0.06);
    for (const side of [-1, 1]) {
      if (side === 1 && Math.abs(z - stairZ) < stairHalf + .18) continue;
      const x = CENTER + side * 2.285;
      block(pale, x, 2.6, z, 0.32, 0.18, 0.42);
      block(stone, x, 1.37, z, 0.22, 2.37, 0.25);
      block(deep, x, 0.23, z, 0.35, 0.23, 0.40);
    }
  }
  block(deep, CENTER, 0.06, (FRONT + BACK) / 2, 4.78, 0.11, FRONT - BACK);
  for (let i = 0; i < 4; i++) {
    block(flagstones[i], 1.497 + i * .357, .113, stairZ, .341, .021, .79);
  }
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      const x = CENTER + (col - 4) * 0.52;
      const z = FRONT - 0.21 - row * 0.432;
      block(flagstones[(row * 3 + col * 7) % flagstones.length], x, 0.115, z, 0.504, 0.015, 0.415);
    }
  }
  block(velvet, CENTER, 0.126, -2.923, 1.145, 0.013, 2.46);
  for (const side of [-1, 1]) {
    block(band, CENTER + side * 0.518, 0.135, -2.923, 0.055, 0.006, 2.39);
    block(goldThread, CENTER + side * 0.469, 0.135, -2.923, 0.014, 0.007, 2.37);
    block(band, CENTER, 0.135, -2.923 + side * 1.172, 1.04, 0.007, 0.048);
  }
  for (let i = 0; i < 5; i++) {
    const z = -2.02 - i * 0.445;
    block(band, CENTER, 0.136, z, 0.17, 0.007, 0.17, Math.PI / 4);
    block(goldThread, CENTER, 0.141, z, 0.079, 0.005, 0.079, Math.PI / 4);
  }

  const niche = archOutline(0.74, 0.65, 2.50, 2.93, 3.31);
  add(extrusion(niche, 0.055), deep, CENTER, 0, BACK + 0.032);
  const nicheTrim = archOutline(0.85, 0.65, 2.50, 3.08, 3.44);
  add(extrusion([...nicheTrim, ...niche.reverse()], 0.067), pale, CENTER, 0, BACK + 0.064);
  const shield = [
    new THREE.Vector2(-0.25, 0.24), new THREE.Vector2(0.25, 0.24),
    new THREE.Vector2(0.22, -0.04), new THREE.Vector2(0, -0.24), new THREE.Vector2(-0.22, -0.04),
  ];
  add(extrusion(shield, 0.059), bronze, CENTER, 2.73, BACK + 0.104);
  block(velvet, CENTER, 2.75, BACK + 0.169, 0.23, 0.23, 0.026);
  block(goldThread, CENTER, 2.75, BACK + 0.192, 0.09, 0.09, 0.019, 0);
  for (const side of [-1, 1]) banner(CENTER + side * 1.24, 1.09, BACK + 0.076, 0.61, 1.74);

  block(stone, CENTER, 0.197, -4.542, 2.17, 0.156, 0.817);
  block(pale, CENTER, 0.284, -4.539, 2.23, 0.045, 0.826);
  block(stone, CENTER, 0.344, -4.634, 1.94, 0.11, 0.636);
  block(pale, CENTER, 0.415, -4.638, 1.96, 0.045, 0.643);
  block(oak, CENTER, 0.751, -4.58, 0.84, 0.12, 0.44);
  block(velvet, CENTER, 0.831, -4.568, 0.77, 0.069, 0.405);
  block(oak, CENTER, 1.35, -4.801, 0.82, 1.08, 0.116);
  block(velvet, CENTER, 1.34, -4.728, 0.65, 0.87, 0.051);
  const throneTop = archOutline(0.42, 0, 0.10, 0.18, 0.305);
  add(extrusion(throneTop, 0.127), oak, CENTER, 1.82, -4.865);
  part(ball, bronze, CENTER, 2.13, -4.804, 0.058, 0.079, 0.044);
  for (const side of [-1, 1]) {
    const x = CENTER + side * 0.394;
    for (const z of [-4.405, -4.786]) block(oak, x, 0.688, z, 0.085, 0.51, 0.09);
    block(oak, x, 1.07, -4.586, 0.109, 0.081, 0.458);
    part(ball, bronze, x, 1.121, -4.373, 0.062, 0.067, 0.06);
    block(bronze, CENTER + side * 0.325, 1.35, -4.696, 0.014, 0.815, 0.019);
  }
  for (const x of [CENTER - 0.23, CENTER, CENTER + 0.23]) {
    part(ball, bronze, x, 0.825, -4.357, 0.018, 0.017, 0.012);
  }
  sconce(-1.84, 2.14, -3.74, Math.PI / 2, true);
  sconce(2.54, 2.17, -2.92, -Math.PI / 2, true);

  for (const { geometry, material, matrices } of batches.values()) {
    const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  return {
    group,
    setLights(active) { for (const light of lights) light.visible = active; },
    update(time) {
      fires.forEach((fire, i) => {
        const ripple = Math.sin(time * 10.1 + i * 2.5) + 0.47 * Math.sin(time * 17.3 - i * 0.6);
        fire.scale.y = 1 + ripple * 0.092;
        fire.rotation.z = ripple * 0.065;
      });
      lights.forEach((light, i) => { light.intensity = 8.4 + Math.sin(time * 8.7 + i * 2.6) * 0.48; });
    },
  };
}
