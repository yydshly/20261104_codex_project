import * as THREE from 'three';
import { groundSurfaceHeight } from './world-terrain.js';
import { createSmallAnimalAgent } from './world-wildlife.js';

const up = new THREE.Vector3(0, 1, 0);
const cuboid = new THREE.BoxGeometry(1, 1, 1);
const round = new THREE.IcosahedronGeometry(1, 1);
const pole = new THREE.CylinderGeometry(.5, .5, 1, 7);
const taper = new THREE.CylinderGeometry(.3, .5, 1, 7);
const cone = new THREE.ConeGeometry(.5, 1, 7);
const sphere = new THREE.SphereGeometry(1, 14, 8);
const modelSurface = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .88 });
const gable = new THREE.BufferGeometry();
gable.setAttribute('position', new THREE.Float32BufferAttribute([-.5, 0, 0, 0, 1, 0, .5, 0, 0], 3));
gable.computeVertexNormals();

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pieces() {
  const positions = [];
  const normals = [];
  const colors = [];
  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const normalMatrix = new THREE.Matrix3();
  const tint = new THREE.Color();
  const orientation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const translation = new THREE.Vector3();
  const scale = new THREE.Vector3();

  return {
    add(shape, size, center, color, rotation = [0, 0, 0]) {
      if (rotation.isQuaternion) orientation.copy(rotation);
      else orientation.setFromEuler(euler.set(...rotation));
      matrix.compose(translation.fromArray(center), orientation, scale.fromArray(size));
      normalMatrix.getNormalMatrix(matrix);
      const vertices = shape.getAttribute('position');
      const sourceNormals = shape.getAttribute('normal');
      const indices = shape.getIndex();
      for (let i = 0; i < (indices?.count ?? vertices.count); i++) {
        const j = indices ? indices.getX(i) : i;
        position.fromBufferAttribute(vertices, j);
        tint.set(typeof color === 'function' ? color(position) : color);
        position.applyMatrix4(matrix);
        normal.fromBufferAttribute(sourceNormals, j).applyNormalMatrix(normalMatrix);
        positions.push(position.x, position.y, position.z);
        normals.push(normal.x, normal.y, normal.z);
        colors.push(tint.r, tint.g, tint.b);
      }
    },
    geometry() {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    },
  };
}

function beam(build, from, to, width, color, shape = pole) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const angle = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize());
  build.add(shape, [width, length, width], start.lerp(end, .5).toArray(), color, angle);
}

function mesh(parent, build, material = modelSurface) {
  const object = new THREE.Mesh(build.geometry(), material);
  parent.add(object);
  return object;
}

function contactTexture() {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const radius = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1);
      const alpha = 1 - THREE.MathUtils.smoothstep(radius, .28, .98);
      pixels.set([255, 255, 255, Math.round(255 * alpha)], (y * size + x) * 4);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const contactMaterial = new THREE.MeshBasicMaterial({
  color: 0x182726, map: contactTexture(), transparent: true, opacity: .36, depthWrite: false,
  polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
});

function groundShadow(parent, width, depth, segments) {
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const points = geometry.getAttribute('position');
  const shadow = new THREE.Mesh(geometry, contactMaterial);
  shadow.name = '贴地阴影';
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.hypot(width, depth));
  parent.add(shadow);
  return (x, z, height, yaw = 0) => {
    const cosine = Math.cos(yaw);
    const sine = Math.sin(yaw);
    shadow.position.set(x, height, z);
    shadow.rotation.y = yaw;
    for (let i = 0; i < points.count; i++) {
      const dx = points.getX(i);
      const dz = points.getZ(i);
      const floor = groundSurfaceHeight(x + dx * cosine + dz * sine, z + dz * cosine - dx * sine);
      points.setY(i, floor - height + .043);
    }
    points.needsUpdate = true;
  };
}

function viewpoint(x, z, height, offset, eyeX, eyeZ, lookHeight = 1.45) {
  const y = groundSurfaceHeight(x, z);
  return {
    target: [x, y + height, z],
    offset,
    spawn: {
      position: [eyeX, groundSurfaceHeight(eyeX, eyeZ), eyeZ],
      target: [x, y + lookHeight, z],
    },
  };
}

function createCabin(scene) {
  const x = -97.2;
  const z = -13;
  const base = groundSurfaceHeight(x, z) + .37;
  const group = new THREE.Group();
  group.name = '雪原小屋';
  group.position.set(x, base, z);
  scene.add(group);
  groundShadow(scene, 9.5, 8.2, 30)(x + .35, z - .18, base);
  const wall = pieces();
  const amber = pieces();
  const wood = 0x805337;
  const dark = 0x49382e;
  const trim = 0xd6b28b;
  const roof = 0x465361;
  const snow = 0xe3eeeb;
  const random = seededRandom(981);

  wall.add(cuboid, [5.55, 1.08, 4.4], [0, -.43, 0], 0x777b75);
  wall.add(cuboid, [5.3, 2.28, 4.1], [0, 1.13, 0], wood);
  wall.add(gable, [5.29, 1.42, 1], [0, 2.26, -2.047], wood);
  wall.add(gable, [5.29, 1.42, 1], [0, 2.26, 2.047], wood, [0, Math.PI, 0]);
  for (let level = 0; level < 9; level++) {
    const y = .14 + level * .255;
    for (const side of [-1, 1]) {
      wall.add(pole, [.22, 5.61, .25], [0, y, side * 2.045], level % 4 ? wood : 0x926243, [0, 0, Math.PI / 2]);
      wall.add(pole, [.22, 4.5, .25], [side * 2.61, y, 0], level % 3 ? wood : 0x976646, [Math.PI / 2, 0, 0]);
    }
  }
  for (const side of [-1, 1]) {
    const slope = -side * .47;
    wall.add(cuboid, [3.54, .22, 4.92], [side * 1.55, 2.96, 0], roof, [0, 0, slope]);
    wall.add(cuboid, [3.56, .14, 4.84], [side * 1.55, 3.1, 0], snow, [0, 0, slope]);
    for (let i = 0; i < 14; i++) {
      const q = i / 13;
      const icicleLength = .15 + random() * .35;
      wall.add(cone, [.12, icicleLength, .12], [side * 3.14, 2.31 - icicleLength * .43, -2.2 + q * 4.4], 0xc3dfe6, [Math.PI, 0, 0]);
    }
  }
  wall.add(cuboid, [.58, 1.48, .58], [1.36, 3.8, .62], 0x785e53);
  wall.add(cuboid, [.74, .16, .74], [1.36, 4.51, .62], 0x50565e);
  wall.add(cuboid, [1.17, 1.77, .14], [.52, .94, -2.22], dark);
  wall.add(cuboid, [.96, 1.64, .15], [.52, .90, -2.3], 0x8e5940);
  wall.add(round, [.064, .064, .064], [.86, .85, -2.40], 0xc8a35e);
  wall.add(cuboid, [1.7, .2, .92], [.52, -.04, -2.69], dark);
  wall.add(cuboid, [1.52, .16, .44], [.52, -.17, -3.18], 0x777b75);
  for (const [wx, y, width] of [[-1.48, 1.31, 1.06], [1.74, 1.37, .82], [0, 2.69, .5]]) {
    const size = width * .79;
    wall.add(cuboid, [width + .18, size + .16, .19], [wx, y, -2.22], trim);
    amber.add(cuboid, [width - .02, size - .01, .12], [wx, y, -2.34], 0xffc276);
    wall.add(cuboid, [.052, size + .02, .14], [wx, y, -2.36], dark);
    wall.add(cuboid, [width + .02, .051, .14], [wx, y, -2.36], dark);
    wall.add(cuboid, [width + .32, .097, .29], [wx, y - size * .55, -2.31], snow);
  }
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4 - row; col++) {
      const lx = 2.96 + col * .24 + row * .12;
      const ly = .06 + row * .21;
      wall.add(pole, [.24, .85 + .13 * random(), .24], [lx, ly, -.68], dark, [Math.PI / 2, 0, 0]);
      wall.add(pole, [.17, .032, .17], [lx, ly, -1.13], 0xb18b60, [Math.PI / 2, 0, 0]);
    }
  }
  wall.add(cuboid, [1.18, .11, .97], [3.35, .57, -.65], snow, [0, 0, -.15]);
  for (let i = 0; i < 19; i++) {
    const px = (random() - .5) * 9;
    const pz = -3.28 - random() * 2.12;
    const py = groundSurfaceHeight(x + px, z + pz) - base;
    if (Math.abs(px - .52) < .7) continue;
    wall.add(round, [.12 + random() * .16, .07, .13 + random() * .11], [px, py + .026, pz], 0x8a9a94);
  }
  const walls = mesh(group, wall);
  walls.userData.collidable = true;
  walls.userData.rainWettable = 'wood';
  mesh(group, amber, new THREE.MeshBasicMaterial({ vertexColors: true }));

  const count = 11;
  const smokeGeometry = new THREE.BufferGeometry();
  const smokePosition = new Float32Array(count * 3);
  const smokeAge = new Float32Array(count);
  smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePosition, 3));
  smokeGeometry.setAttribute('age', new THREE.BufferAttribute(smokeAge, 1));
  const smoke = new THREE.Points(smokeGeometry, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `attribute float age;
      varying float life;
      void main() {
        life = age;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((10.0 + age * 31.0) / max(1.0, -mv.z * .055), 2.0, 64.0);
      }`,
    fragmentShader: `varying float life;
      void main() {
        float edge = 1.0 - smoothstep(.06, .5, length(gl_PointCoord - .5));
        gl_FragColor = vec4(.57, .62, .65, edge * (1.0 - life) * .30);
        #include <colorspace_fragment>
      }`,
  }));
  smoke.frustumCulled = false;
  group.add(smoke);

  return {
    stop: viewpoint(x, z, 1.46, [8.3, 5.9, -13.4], -100.5, -19.72, 1.67),
    update(time, rain) {
      for (let i = 0; i < count; i++) {
        const age = (i / count + time * .20) % 1;
        const index = i * 3;
        smokeAge[i] = age;
        smokePosition[index] = 1.36 + age * (1.55 + rain * .85) + Math.sin(time * .9 + age * 8) * age * .27;
        smokePosition[index + 1] = 4.59 + age * 3.35;
        smokePosition[index + 2] = .62 + age * .55 + Math.cos(time * .67 + age * 5) * age * .33;
      }
      smokeGeometry.getAttribute('position').needsUpdate = true;
      smokeGeometry.getAttribute('age').needsUpdate = true;
    },
  };
}

function leafGeometry(teeth) {
  const vertices = [];
  const rows = 16;
  const center = (p) => [0, .46 * Math.sin(p * Math.PI) - .42 * p * p, p];
  const edge = (p, side, row) => {
    const [x, y, z] = center(p);
    const notch = teeth && row % 2 === 0 ? .56 : 1;
    return [x + side * Math.sin(p * Math.PI) ** .69 * notch * .18, y - Math.sin(p * Math.PI) * .062, z + (teeth ? side * .021 * Math.sin(p * Math.PI) : 0)];
  };
  for (let i = 0; i < rows; i++) {
    const a = i / rows;
    const b = (i + 1) / rows;
    for (const side of [-1, 1]) {
      const c0 = center(a);
      const c1 = center(b);
      const e0 = edge(a, side, i);
      const e1 = edge(b, side, i + 1);
      if (side > 0) vertices.push(...c0, ...c1, ...e1, ...c0, ...e1, ...e0);
      else vertices.push(...c0, ...e1, ...c1, ...c0, ...e0, ...e1);
    }
  }
  const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

const palmLeaf = leafGeometry(true);
const broadLeaf = leafGeometry(false);
const leafSurface = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .66, side: THREE.DoubleSide });

function addPalm(trunks, foliage, x, z, height, yaw, random) {
  const ground = groundSurfaceHeight(x, z);
  const leanX = Math.cos(yaw) * height * .19;
  const leanZ = Math.sin(yaw) * height * .19;
  const at = (p) => [x + p * p * leanX, ground + height * p, z + p * p * leanZ];
  const sections = 13;
  for (let i = 0; i < sections; i++) {
    const p = i / sections;
    const end = (i + 1.1) / sections;
    const width = (.69 - .24 * p) * height * .079;
    beam(trunks, at(p), at(end), width, i % 3 ? 0x7d7453 : 0x74694b);
    beam(trunks, at(p), at(p + .011), width * 1.07, 0x5e5944);
  }
  const crown = at(1);
  trunks.add(round, [.32, .52, .32], crown, 0x607047);
  const colors = [0x37733d, 0x4f8843, 0x3f8548, 0x699942, 0x306f3c];
  for (let leaf = 0; leaf < 11; leaf++) {
    const direction = yaw + leaf * Math.PI * 2 / 11 + (random() - .5) * .38;
    const length = height * (.46 + random() * .20);
    const y = crown[1] + (leaf % 3) * .17;
    foliage.add(palmLeaf, [length * .96, length * (.62 + random() * .34), length], [crown[0], y, crown[2]], colors[leaf % colors.length], [-.30 + (leaf % 3) * .30, direction, .07 * Math.sin(leaf)]);
  }
  return { x: crown[0], z: crown[2], y: crown[1] + .5, rx: height * .43, rz: height * .43 };
}

function addUnderstory(trunks, foliage, x, z, height, random) {
  const y = groundSurfaceHeight(x, z);
  const colors = [0x588c46, 0x739b4b, 0x2e784f, 0x3f8252, 0x74994c];
  const twist = random() * 6.28;
  for (let i = 0; i < 7; i++) {
    const length = height * (.7 + random() * .65);
    foliage.add(i % 3 ? broadLeaf : palmLeaf, [length * 1.05, height * .94, length], [x, y + .1 + height * .08 * (i % 3), z], colors[i % colors.length], [-.32 + (i % 3) * .28, twist + i * .91, .06]);
  }
  if (random() > .35) return;
  const stalk = y + height * .69;
  beam(trunks, [x, y, z], [x + .08, stalk, z], .065, 0x39623c);
  for (let petal = 0; petal < 5; petal++) {
    const direction = twist + petal * 2.4;
    trunks.add(round, [height * .16, .052, height * .077], [x + Math.cos(direction) * .09, stalk + petal * .075, z + Math.sin(direction) * .09], petal % 2 ? 0xdd5d3b : 0xf69943, [0, direction, .22]);
  }
}

function addFig(trunks, foliage, x, z, height, random) {
  const y = groundSurfaceHeight(x, z);
  const crotch = [x, y + height * .67, z];
  beam(trunks, [x, y - .13, z], crotch, .81, 0x675944, taper);
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2 + random() * .72;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const extent = 1.14 + random() * .65;
    const rootX = x + dx * extent;
    const rootZ = z + dz * extent;
    beam(trunks, [rootX, groundSurfaceHeight(rootX, rootZ) - .05, rootZ], [x, y + .91, z], .43, 0x71614a, taper);

    const branch = [x + dx * 2.25, y + height * (.84 + random() * .15), z + dz * 2.25];
    beam(trunks, crotch, branch, .38, 0x675944, taper);
    foliage.add(round, [2.0, .78, 1.72], [branch[0], branch[1] + .35, branch[2]], i % 2 ? 0x31774a : 0x3f8350, [0, angle, 0]);
    foliage.add(round, [1.21, .62, 1.2], [branch[0] + dx * .77, branch[1] + .49, branch[2] + dz * .69], 0x51834e, [0, -angle, 0]);
    for (let j = 0; j < 4; j++) {
      const root = [branch[0] + (random() - .5) * 1.1, branch[1] - .08, branch[2] + (random() - .5) * 1.1];
      const end = [root[0] + (random() - .5) * .44, root[1] - (.91 + random() * 2.45), root[2] + (random() - .5) * .35];
      const bend = [root[0] + .08, (root[1] + end[1]) / 2, root[2] + .13];
      beam(trunks, root, bend, .045, 0x716046);
      beam(trunks, bend, end, .032, 0x77694a, taper);
    }
  }
}

function makeButterfly(parent, hue) {
  const body = new THREE.Group();
  parent.add(body);
  const bodyParts = pieces();
  bodyParts.add(round, [.046, .047, .21], [0, 0, 0], 0x382d32);
  mesh(body, bodyParts);
  const wings = [-1, 1].map((side) => {
    const parts = pieces();
    parts.add(sphere, [.26, .025, .20], [side * .18, 0, -.032], hue, [0, side * .38, 0]);
    parts.add(sphere, [.13, .027, .13], [side * .17, 0, .10], 0xdba552);
    parts.add(sphere, [.057, .029, .055], [side * .27, 0, -.024], 0xffdda1);
    return mesh(body, parts, leafSurface);
  });
  return { body, wings };
}

function addForestFloor(trunks, foliage) {
  const random = seededRandom(613);
  const dryLeaves = [0x74684b, 0x86704d, 0x534e37, 0x9b8156];
  for (let i = 0; i < 92; i++) {
    const x = 34.7 + random() * 8.6;
    const z = 40.2 + random() * 9.7;
    if (Math.abs(x - 39) < .98) continue;
    const length = .16 + random() * .30;
    foliage.add(broadLeaf, [length, .065, length], [x, groundSurfaceHeight(x, z) + .022, z], dryLeaves[i % dryLeaves.length], [0, random() * 6.28, 0]);
  }
  for (const [x, z, endX, endZ] of [[35.8, 44.2, 36.75, 46.25], [42.1, 46.4, 43.5, 47.9]]) {
    const start = [x, groundSurfaceHeight(x, z) + .17, z];
    const end = [endX, groundSurfaceHeight(endX, endZ) + .17, endZ];
    beam(trunks, start, end, .41, 0x615440, taper);
    const direction = new THREE.Vector3().fromArray(start).sub(new THREE.Vector3().fromArray(end)).normalize();
    const brokenEnd = new THREE.Vector3().fromArray(start).addScaledVector(direction, .018).toArray();
    beam(trunks, start, brokenEnd, .26, 0xa48b60);
    for (let j = 0; j < 5; j++) {
      const px = THREE.MathUtils.lerp(x, endX, .15 + j * .14);
      const pz = THREE.MathUtils.lerp(z, endZ, .15 + j * .14);
      const py = THREE.MathUtils.lerp(start[1], end[1], .15 + j * .14);
      trunks.add(round, [.11 + random() * .1, .065, .14], [px, py + .145, pz], j % 2 ? 0x506844 : 0x66784a);
    }
  }
}

function createTropics(scene) {
  const group = new THREE.Group();
  group.name = '热带森林';
  scene.add(group);
  const trunks = pieces();
  const foliage = pieces();
  const undergrowth = pieces();
  const random = seededRandom(98102);
  const palms = [
    [36.7, 39.9, 6.9], [41.8, 40.3, 7.4], [35.4, 43.7, 8.4], [43.6, 44.5, 8.1],
    [36.0, 48.8, 7.5], [42.6, 49.7, 8.5], [33.1, 40.2, 6.1], [45.9, 39.3, 6.8],
    [31.0, 45.4, 7.3], [48.5, 44.6, 6.7], [32.0, 50.8, 7.7], [46.1, 50.9, 6.5],
    [34.2, 54.9, 6.7], [38.0, 55.4, 7.5], [42.9, 55.2, 7.1], [47.5, 55.4, 6.6],
    [28.9, 52.1, 7.0], [49.4, 51.2, 6.0], [30.1, 57.8, 6.8], [45.9, 57.8, 6.2],
  ];
  group.userData.rainCanopies = palms.map(([x, z, height]) => addPalm(trunks, foliage, x, z, height, random() * Math.PI * 2, random));
  addFig(trunks, foliage, 33.9, 47.6, 6.65, random);
  addFig(trunks, foliage, 44.6, 47.1, 7.12, random);

  for (let i = 0; i < 176; i++) {
    const x = 27 + random() * 24;
    const z = 38.7 + random() * 20.5;
    if (Math.abs(x - 39.05) < 1.48 + .26 * Math.sin(z * 1.3) && z < 50.2) continue;
    const edge = Math.min(1, Math.abs(x - 39.05) * .4);
    if (Math.hypot((x - 39) / 12, (z - 49) / 11) > .95 + random() * .21) continue;
    const height = (.46 + random() ** 2 * 1.47) * (.65 + edge * .35);
    addUnderstory(undergrowth, foliage, x, z, height, random);
  }
  for (let i = 0; i < 27; i++) {
    const x = 28 + random() * 23;
    const z = 40 + random() * 17;
    if (Math.abs(x - 39) < 1.8) continue;
    const size = .24 + random() * .52;
    const y = groundSurfaceHeight(x, z);
    trunks.add(round, [size, size * .45, size * .70], [x, y + .04, z], i % 4 ? 0x536653 : 0x6a7850, [0, random() * 6.28, 0]);
  }
  addForestFloor(trunks, foliage);
  for (const [x, z, height] of [[33.9, 47.6, 6.65], [44.6, 47.1, 7.12]]) {
    group.userData.rainCanopies.push({ x, z, y: groundSurfaceHeight(x, z) + height + .6, rx: 3.8, rz: 3.8 });
  }
  const timber = mesh(group, trunks);
  timber.userData.collidable = true;
  timber.userData.rainWettable = 'wood';
  mesh(group, undergrowth).userData.rainWettable = 'leaf';
  mesh(group, foliage, leafSurface).userData.rainWettable = 'leaf';
  const insects = [0x6ca7c8, 0xe28849, 0xb77eae].map((hue) => makeButterfly(group, hue));
  insects.forEach((insect, index) => {
    const x = 39 + (index - 1) * 1.1, z = 44.5 + index * .81;
    insect.agent = createSmallAnimalAgent(insect.body, {
      home: [x, groundSurfaceHeight(x, z) + 1.1 + index * .2, z], flying: true,
      range: 4, alert: 2.8, speed: 1.5, radius: .12, phase: index * 2.4,
    });
  });

  return {
    stop: viewpoint(39, 47.5, 2.8, [10, 11, -15], 39, 38.55, 1.55),
    butterflies: insects.map(({ agent }) => agent.state),
    update(dt, time, rain, visitor, collision) {
      insects.forEach(({ body, wings, agent }, index) => {
        const state = agent.update(dt, time, visitor, collision, rain);
        body.rotation.z = Math.sin(time * 3 + index) * .1 * state.fear;
        wings[0].rotation.z = Math.sin(time * (21 + state.fear * 9) + index * 2) * .94;
        wings[1].rotation.z = -wings[0].rotation.z;
      });
    },
  };
}

function cowColor(position) {
  const { x, y, z } = position;
  const a = Math.hypot((x + .47) * 1.08, (y + .13) * .98, (z - .78) * .74);
  const b = Math.hypot((x - .46) * 1.29, (y - .36) * 1.12, (z + .67) * .78);
  const c = Math.hypot((x + .01) * 1.39, (y - .89) * 1.2, z * .9);
  return Math.min(a, b, c) < .53 + .095 * Math.sin(x * 11 + z * 5 + y * 4) ? 0x33342e : 0xe9e3cf;
}

function livestockParts(sheep) {
  const body = pieces();
  const head = pieces();
  const leg = pieces();
  const tail = pieces();
  if (sheep) {
    const wool = [0xe4dac3, 0xf1e7cf, 0xdfd5bf];
    body.add(round, [.66, .42, .42], [0, .65, 0], wool[0]);
    for (let i = 0; i < 9; i++) {
      const ring = i / 9 * Math.PI * 2;
      body.add(round, [.41, .29, .25], [Math.cos(ring) * .30, .66 + Math.sin(ring * 2) * .12, Math.sin(ring) * .25], wool[i % wool.length]);
    }
    head.add(round, [.24, .25, .205], [.20, -.02, 0], 0x403d3b);
    head.add(round, [.23, .16, .22], [.12, .11, 0], wool[1]);
    head.add(round, [.13, .115, .145], [.38, -.095, 0], 0x57504a);
    for (const side of [-1, 1]) {
      head.add(round, [.11, .065, .21], [.15, .019, side * .19], 0x5c5149, [side * .35, side * .25, 0]);
      head.add(round, [.035, .031, .034], [.28, .015, side * .162], 0x191c19);
    }
    leg.add(taper, [.16, .37, .14], [0, -.172, 0], 0x625a50);
    leg.add(cuboid, [.14, .085, .13], [.015, -.35, 0], 0x34332f);
    tail.add(round, [.19, .11, .10], [-.09, -.025, 0], wool[0]);
  } else {
    body.add(sphere, [1.03, .52, .48], [0, 1.04, 0], cowColor);
    body.add(round, [.29, .17, .25], [-.43, .68, 0], 0xc99a82);
    head.add(round, [.44, .32, .29], [.19, -.04, 0], 0xdad4be, [0, 0, -.26]);
    head.add(round, [.33, .235, .24], [.49, -.09, 0], 0xe5dfcb, [0, 0, -.25]);
    head.add(round, [.15, .16, .235], [.72, -.21, 0], 0xc28e79);
    for (const side of [-1, 1]) {
      head.add(round, [.065, .053, .065], [.74, -.172, side * .138], 0x775952);
      head.add(round, [.18, .084, .23], [.31, .097, side * .265], 0x3d3b36, [0, side * .28, 0]);
      head.add(round, [.062, .059, .052], [.54, -.027, side * .185], 0x282522);
      beam(head, [.29, .188, side * .133], [.31, .25, side * .26], .11, 0xcabca1, taper);
      beam(head, [.31, .25, side * .26], [.26, .35, side * .30], .073, 0xcabca1, taper);
    }
    leg.add(taper, [.24, .61, .23], [0, -.28, 0], 0xdfd7be);
    leg.add(cuboid, [.18, .12, .17], [.025, -.56, 0], 0x393731);
    beam(tail, [0, 0, 0], [-.15, -.36, 0], .066, 0x655849);
    tail.add(round, [.067, .13, .063], [-.15, -.37, 0], 0x39332c);
  }
  return [body.geometry(), head.geometry(), leg.geometry(), tail.geometry()];
}

function animalFootprintContains(animal, x, z, heading = animal.figure.rotation.y) {
  const dx = x - animal.position.x;
  const dz = z - animal.position.z;
  const cosine = Math.cos(heading);
  const sine = Math.sin(heading);
  const along = dx * cosine - dz * sine;
  const across = dx * sine + dz * cosine;
  return (along / (animal.radius + .24)) ** 2 + (across / (animal.width + .24)) ** 2 < 1;
}

function animalReach(animal, dx, dz, heading = animal.figure.rotation.y) {
  const distance = Math.max(.001, Math.hypot(dx, dz));
  const along = (dx * Math.cos(heading) - dz * Math.sin(heading)) / distance;
  const across = (dx * Math.sin(heading) + dz * Math.cos(heading)) / distance;
  return Math.hypot(along * animal.radius, across * animal.width);
}

function animal(parent, sheep, templates, position, phase) {
  const figure = new THREE.Group();
  figure.name = sheep ? '牧场绵羊' : '牧场奶牛';
  parent.add(figure);
  const scale = position[2];
  const updateShadow = groundShadow(parent, (sheep ? 2.2 : 3.15) * scale, (sheep ? 1.38 : 1.72) * scale, 4);
  const [bodyShape, headShape, legShape, tailShape] = templates;
  const body = new THREE.Mesh(bodyShape, modelSurface);
  const head = new THREE.Mesh(headShape, modelSurface);
  const tail = new THREE.Mesh(tailShape, modelSurface);
  head.position.set(sheep ? .42 : .62, sheep ? .72 : 1.21, 0);
  tail.position.set(sheep ? -.53 : -.86, sheep ? .74 : 1.17, 0);
  figure.add(body, head, tail);
  const legs = [];
  const pivotHeight = sheep ? .394 : .638;
  const reach = sheep ? .393 : .62;
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const leg = new THREE.Mesh(legShape, modelSurface);
      leg.position.set(x * (sheep ? .37 : .63), pivotHeight, z * (sheep ? .24 : .318));
      figure.add(leg);
      legs.push(leg);
    }
  }
  figure.scale.setScalar(scale);
  figure.position.set(position[0], groundSurfaceHeight(position[0], position[1]), position[1]);
  figure.rotation.y = phase;
  const state = {
    position: figure.position, radius: (sheep ? .94 : 1.5) * scale,
    width: (sheep ? .47 : .54) * scale, height: (sheep ? 1.09 : 1.79) * scale,
    figure, sheep, velocity: new THREE.Vector2(), sheltering: false, sheltered: false,
  };
  let heading = phase;
  let gait = phase;
  const desired = new THREE.Vector2();
  const movement = new THREE.Vector2();
  let shelterPath = 0;
  const offsets = [[1, 0], [.5, .866], [.5, -.866], [0, 1], [0, -1]];

  function blocked(x, z, herd, observer, collision) {
    const radius = state.radius;
    if (x < -7.7 + radius || x > 12.1 - radius || z < 36.25 + radius || z > 53.6 - radius) return true;
    const ground = groundSurfaceHeight(x, z);
    if (Math.abs(ground - state.position.y) > .25) return true;
    if (observer && Math.abs(observer.y - ground) < 3.2) {
      const next = Math.hypot(x - observer.x, z - observer.z);
      const previous = Math.hypot(state.position.x - observer.x, state.position.z - observer.z);
      if (next < radius + .29 && next < previous - .00001) return true;
    }
    for (const peer of herd) {
      if (peer === state) continue;
      const minimum = animalReach(state, x - peer.position.x, z - peer.position.z)
        + animalReach(peer, x - peer.position.x, z - peer.position.z) + .12;
      const next = Math.hypot(x - peer.position.x, z - peer.position.z);
      const previous = Math.hypot(state.position.x - peer.position.x, state.position.z - peer.position.z);
      if (next < minimum && next < previous - .00001) return true;
    }
    if (!collision) return false;
    for (let i = 0; i < 9; i++) {
      const reach = i === 8 ? 0 : radius * .81;
      const angle = i * Math.PI / 4;
      const px = x + Math.cos(angle) * reach;
      const pz = z + Math.sin(angle) * reach;
      const floor = groundSurfaceHeight(px, pz);
      if (collision.blocks(px, floor + state.height - .14, pz, floor, false, floor, sheep ? 1 : 0)) return true;
    }
    return false;
  }

  state.update = (time, dt, herd, observer, collision, seekCover = false, shelter = null) => {
    dt = THREE.MathUtils.clamp(dt, 0, .08);
    const pace = time * (sheep ? .38 : .27) + phase;
    let homeX = position[0] + Math.sin(pace) * (sheep ? .72 : .94);
    let homeZ = position[1] + Math.cos(pace * .79) * .69;
    if (seekCover !== state.sheltering) {
      state.sheltering = seekCover;
      const behindTrough = sheep && position[0] > 5.0 && position[1] < 44.8;
      shelterPath = seekCover && behindTrough && state.position.z < 44.8 ? 1
        : !seekCover && behindTrough && state.position.z > 44.8 ? 3 : 0;
    }
    if (seekCover && shelter) {
      if (shelterPath === 1 && Math.hypot(state.position.x - 4.0, state.position.z - 41.5) < .55) shelterPath = 2;
      if (shelterPath === 2 && state.position.z > 44.7) shelterPath = 0;
      homeX = shelterPath ? 4.0 : shelter[0];
      homeZ = shelterPath === 1 ? 41.5 : shelterPath === 2 ? 45.0 : shelter[1];
    } else if (shelterPath === 3 || shelterPath === 4) {
      if (shelterPath === 3 && Math.hypot(state.position.x - 4.0, state.position.z - 45.0) < .55) shelterPath = 4;
      if (shelterPath === 4 && state.position.z < 42.0) shelterPath = 0;
      if (shelterPath) {
        homeX = 4.0;
        homeZ = shelterPath === 3 ? 45.0 : 41.5;
      }
    }
    state.sheltered = seekCover && shelter !== null
      && Math.hypot(state.position.x - shelter[0], state.position.z - shelter[1]) < .85;
    desired.set(homeX - state.position.x, homeZ - state.position.z).multiplyScalar(seekCover ? 1.0 : .78);
    let alert = 0;
    if (observer && Math.abs(observer.y - state.position.y) < 3.2) {
      const dx = state.position.x - observer.x;
      const dz = state.position.z - observer.z;
      const distance = Math.hypot(dx, dz);
      alert = 1 - THREE.MathUtils.smoothstep(distance, state.radius + .6, state.radius + 2.0);
      const away = alert * (sheep ? 2.6 : 2.1) / Math.max(.15, distance);
      desired.x += (distance > .01 ? dx : Math.cos(phase)) * away;
      desired.y += (distance > .01 ? dz : Math.sin(phase)) * away;
    }
    for (const peer of herd) {
      if (peer === state) continue;
      const dx = state.position.x - peer.position.x;
      const dz = state.position.z - peer.position.z;
      const distance = Math.hypot(dx, dz);
      const minimum = animalReach(state, dx, dz) + animalReach(peer, dx, dz) + .29;
      const overlap = Math.max(0, minimum - distance);
      const separation = overlap * 2.4 / Math.max(.1, distance);
      desired.x += dx * separation;
      desired.y += dz * separation;
    }
    const maximum = Math.max(seekCover ? (sheep ? .95 : .78) : 0,
      THREE.MathUtils.lerp(sheep ? .47 : .42, sheep ? 1.48 : 1.12, alert));
    desired.clampLength(0, maximum);
    state.velocity.lerp(desired, 1 - Math.exp(-dt * 4.8));
    movement.copy(state.velocity).multiplyScalar(dt);
    const startX = state.position.x;
    const startZ = state.position.z;
    if (movement.lengthSq() > .000001) {
      for (const [forward, side] of offsets) {
        const x = startX + movement.x * forward - movement.y * side;
        const z = startZ + movement.y * forward + movement.x * side;
        if (blocked(x, z, herd, observer, collision)) continue;
        state.position.x = x;
        state.position.z = z;
        break;
      }
    }
    const dx = state.position.x - startX;
    const dz = state.position.z - startZ;
    const speed = dt > 0 ? Math.hypot(dx, dz) / dt : 0;
    if (speed > .035) {
      const turn = Math.atan2(-dz, dx) - heading;
      const nextHeading = heading + Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - Math.exp(-dt * 5));
      const hitsPeer = herd.some((peer) => {
        if (peer === state) return false;
        const dx = peer.position.x - state.position.x;
        const dz = peer.position.z - state.position.z;
        const peerReach = animalReach(peer, dx, dz);
        const nextReach = animalReach(state, dx, dz, nextHeading);
        return Math.hypot(dx, dz) < nextReach + peerReach + .08
          && nextReach > animalReach(state, dx, dz, heading) + .00001;
      });
      if (!hitsPeer && (!observer || Math.abs(observer.y - state.position.y) >= 3.2
        || !animalFootprintContains(state, observer.x, observer.z, nextHeading))) heading = nextHeading;
    }
    const x = state.position.x;
    const z = state.position.z;
    const grazing = THREE.MathUtils.smoothstep(Math.sin(time * .52 + phase * 1.7), -.4, .32) * (1 - alert) * (seekCover ? .08 : 1)
      * (1 - THREE.MathUtils.smoothstep(speed, .25, .65));
    const walking = THREE.MathUtils.smoothstep(speed, .025, .35);
    gait += dt * (sheep ? 6.0 : 4.9) * Math.min(1.8, speed / .48);
    const floor = groundSurfaceHeight(x, z);
    const bob = Math.sin(gait * 2) * .018 * walking;
    const cosine = Math.cos(heading);
    const sine = Math.sin(heading);
    figure.position.set(x, floor + bob, z);
    figure.rotation.y = heading;
    updateShadow(x, z, floor, heading);
    head.rotation.z = -.08 - grazing * (sheep ? .69 : .91) + Math.sin(time * 2.5 + phase) * .055;
    head.rotation.y = Math.sin(time * .61 + phase) * .2;
    tail.rotation.x = Math.sin(time * 1.76 + phase) * (sheep ? .25 : .52);
    legs.forEach((leg, index) => {
      const stride = gait + (index % 3 ? Math.PI : 0);
      const angle = Math.sin(stride) * .23 * walking;
      const footX = (leg.position.x + reach * Math.sin(angle)) * scale;
      const footZ = leg.position.z * scale;
      const hoofFloor = groundSurfaceHeight(x + footX * cosine + footZ * sine, z + footZ * cosine - footX * sine);
      const lift = Math.max(0, Math.cos(stride)) * walking * .1;
      leg.rotation.z = angle;
      const hoofHeight = (hoofFloor - floor - bob) / scale + lift;
      leg.scale.y = THREE.MathUtils.clamp((pivotHeight - hoofHeight) / (reach * Math.cos(angle)), .72, 1.33);
    });
  };
  return state;
}

function createRanch(scene) {
  const group = new THREE.Group();
  group.name = '平原牧场';
  scene.add(group);
  const fixtures = pieces();
  const random = seededRandom(30472);
  const wood = 0x9a7b55;
  const darker = 0x705c44;
  const fence = [
    [[-8, 36], [-.2, 35.5]], [[3.2, 35.5], [12.4, 36]], [[12.4, 36], [12.4, 53.9]],
    [[12.4, 53.9], [-8, 54.2]], [[-8, 54.2], [-8, 36]],
  ];
  for (const [start, end] of fence) {
    const count = Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / 2.75);
    let previous;
    for (let i = 0; i <= count; i++) {
      const x = THREE.MathUtils.lerp(start[0], end[0], i / count);
      const z = THREE.MathUtils.lerp(start[1], end[1], i / count);
      const y = groundSurfaceHeight(x, z);
      fixtures.add(cuboid, [.18, 1.1, .18], [x, y + .47, z], darker, [0, .12 * Math.sin(x), 0]);
      if (previous) {
        for (const height of [.32, .73]) beam(fixtures, [previous[0], previous[1] + height, previous[2]], [x, y + height, z], .12, wood, cuboid);
      }
      previous = [x, y, z];
    }
  }
  const shelterX = 1.2;
  const shelterZ = 49.9;
  const roofY = groundSurfaceHeight(shelterX, shelterZ) + 3.6;
  groundShadow(group, 18.4, 8.3, 22)(shelterX, shelterZ, roofY - 3.6);
  fixtures.add(cuboid, [18.0, .23, 7.8], [shelterX, roofY, shelterZ], 0x835448);
  for (const [dx, dz] of [[-8.25, -3.25], [8.25, -3.25], [-8.25, 3.25], [8.25, 3.25]]) {
    const x = shelterX + dx;
    const z = shelterZ + dz;
    beam(fixtures, [x, groundSurfaceHeight(x, z) - .1, z], [x, roofY - .10, z], .20, darker, cuboid);
  }
  for (const side of [-1, 1]) beam(fixtures,
    [shelterX - 8.25, roofY - .18, shelterZ + side * 3.25],
    [shelterX + 8.25, roofY - .18, shelterZ + side * 3.25], .18, darker, cuboid);
  const troughX = 7.3;
  const troughZ = 43.5;
  const troughY = groundSurfaceHeight(troughX, troughZ);
  fixtures.add(cuboid, [2.55, .34, .73], [troughX, troughY + .29, troughZ], 0x827a69);
  fixtures.add(cuboid, [2.34, .026, .53], [troughX, troughY + .466, troughZ], 0x5c8b8b);
  for (const side of [-1, 1]) fixtures.add(cuboid, [2.58, .09, .11], [troughX, troughY + .49, troughZ + side * .34], 0x988a74);
  for (const [x, z] of [[8.4, 49.3], [9.8, 50], [10.45, 48.9]]) {
    const y = groundSurfaceHeight(x, z);
    fixtures.add(pole, [1.12, .87, 1.12], [x, y + .44, z], 0xc7a75e, [Math.PI / 2, 0, .09]);
    fixtures.add(pole, [1.15, .046, 1.15], [x, y + .44, z - .28], 0xa88f59, [Math.PI / 2, 0, .09]);
  }
  const structures = mesh(group, fixtures);
  structures.userData.collidable = true;
  structures.userData.rainWettable = 'wood';
  const grasses = pieces();
  for (let i = 0; i < 138; i++) {
    const x = -8 + random() * 20;
    const z = 37 + random() * 16;
    if (Math.abs(x - 1.5) < 1.4 && z < 39) continue;
    const y = groundSurfaceHeight(x, z);
    const height = .13 + random() * .25;
    grasses.add(cone, [.08, height, .08], [x, y + height * .34, z], i % 3 ? 0x7c9253 : 0xa9a068, [.21, i * .61, .14]);
  }
  mesh(group, grasses);

  const cow = livestockParts(false);
  const sheep = livestockParts(true);
  const cows = [[-4.2, 43.7, 1.04], [-1.3, 40.3, .97], [2.5, 45.2, .98], [4.4, 49.2, .91]];
  const lambs = [[4.0, 39.2, .96], [6.1, 38.5, .74], [7.0, 41.3, .95], [8.9, 42.1, .84], [2.1, 40.8, .86], [-2.5, 48.0, .90]];
  const herd = [
    ...cows.map((site, index) => animal(group, false, cow, site, index * 1.83 + .36)),
    ...lambs.map((site, index) => animal(group, true, sheep, site, index * 1.31 + .62)),
  ];
  const shelterSlots = [[-5.5, 48.6], [-2.0, 48.6], [1.5, 48.6], [5.0, 48.6],
    [-1.1, 51.6], [1.15, 51.6], [3.4, 51.6], [5.65, 51.6], [-3.35, 51.6], [-5.6, 51.6]];
  let sheltering = false;
  let dryTime = 0;
  return {
    stop: viewpoint(1.5, 43.4, .8, [10.5, 9.5, -14.0], 1.5, 34, 1.10),
    animals: herd,
    rainShelters: [{ minX: shelterX - 9, maxX: shelterX + 9, minZ: shelterZ - 3.9, maxZ: shelterZ + 3.9, height: roofY + .115 }],
    update(dt, time, rain, observer, collision) {
      if (rain > .32) {
        sheltering = true;
        dryTime = 0;
      } else if (rain < .12 && sheltering) {
        dryTime += dt;
        if (dryTime > 6) sheltering = false;
      } else dryTime = 0;
      herd.forEach((animal, index) => animal.update(time, dt, herd, observer, collision, sheltering, shelterSlots[index]));
    },
    blocks(x, y, z, floor, swimming, feet = floor, crouch = 0) {
      const bottom = swimming ? y - .39 : Math.max(floor + .24, feet + .02);
      const top = swimming ? y + .16 : feet + 1.78 - .62 * crouch;
      return herd.some((animal) => {
        if (top < animal.position.y || bottom > animal.position.y + animal.height) return false;
        return animalFootprintContains(animal, x, z);
      });
    },
  };
}

export function createBiomes(scene) {
  const cabin = createCabin(scene);
  const tropics = createTropics(scene);
  const ranch = createRanch(scene);
  return {
    stops: { cabin: cabin.stop, tropics: tropics.stop, ranch: ranch.stop },
    animals: ranch.animals,
    rainShelters: [
      ...ranch.rainShelters,
      { minX: -100.37, maxX: -94.03, minZ: -15.46, maxZ: -10.54,
        height: groundSurfaceHeight(-97.2, -13) + 4.35,
        heightAt: (px) => groundSurfaceHeight(-97.2, -13) + .37 + 3.18 - Math.tan(.47) * (Math.abs(px + 97.2) - 1.55) },
    ],
    blocks: ranch.blocks,
    butterflies: tropics.butterflies,
    update(dt, time, rain, observer = null, collision = null, visitor = null) {
      cabin.update(time, rain);
      tropics.update(dt, time, rain, visitor ?? observer, collision);
      ranch.update(dt, time, rain, observer, collision);
    },
  };
}
