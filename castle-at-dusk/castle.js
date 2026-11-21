import * as THREE from 'three';
import { createInterior } from './interior.js';
import { createAscentTower } from './tower-ascent.js';
import { TOWER } from './tower-layout.js';

const TAU = Math.PI * 2;

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.86, ...options });
}

function archOutline(path, width = 1, height = 1, pointed = true) {
  const half = width / 2;
  const base = -height / 2;
  const spring = height * 0.12;
  path.moveTo(-half, base);
  path.lineTo(half, base);
  path.lineTo(half, spring);
  path.quadraticCurveTo(half, height * (pointed ? 0.32 : 0.5), 0, height / 2);
  path.quadraticCurveTo(-half, height * (pointed ? 0.32 : 0.5), -half, spring);
  path.closePath();
  return path;
}

function relief(shape, depth = 0.06) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
}

function bevelBlock() {
  const face = new THREE.Shape([
    new THREE.Vector2(-0.45, -0.45), new THREE.Vector2(0.45, -0.45),
    new THREE.Vector2(0.45, 0.45), new THREE.Vector2(-0.45, 0.45),
  ]);
  return new THREE.ExtrudeGeometry(face, {
    depth: 0.9, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05,
    bevelSegments: 1, steps: 1,
  }).translate(0, 0, -0.45);
}

function ringStone() {
  const arc = TAU / 18 * 0.48;
  const triangles = [];
  const point = (radius, angle, y) => [radius * Math.sin(angle), y, radius * Math.cos(angle)];
  const face = (a, b, c, d) => triangles.push(a, b, c, a, c, d);
  for (let i = 0; i < 3; i++) {
    const left = -arc + (2 * arc * i) / 3;
    const right = -arc + (2 * arc * (i + 1)) / 3;
    const a = point(1, left, -0.5);
    const b = point(1, right, -0.5);
    const c = point(1, right, 0.5);
    const d = point(1, left, 0.5);
    face(a, b, c, d);
    face(d, c, point(0.94, right, 0.5), point(0.94, left, 0.5));
    face(a, point(0.94, left, -0.5), point(0.94, right, -0.5), b);
  }
  face(point(1, -arc, -0.5), point(1, -arc, 0.5), point(0.94, -arc, 0.5), point(0.94, -arc, -0.5));
  face(point(1, arc, -0.5), point(0.94, arc, -0.5), point(0.94, arc, 0.5), point(1, arc, 0.5));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(triangles.flat(), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function roofPlanes(hip) {
  const nearLeft = [-0.5, 0, 0.5];
  const nearRight = [0.5, 0, 0.5];
  const farLeft = [-0.5, 0, -0.5];
  const farRight = [0.5, 0, -0.5];
  const crestLeft = [-hip, 1, 0];
  const crestRight = [hip, 1, 0];
  const faces = [
    nearLeft, nearRight, crestRight, nearLeft, crestRight, crestLeft,
    farRight, farLeft, crestLeft, farRight, crestLeft, crestRight,
  ];
  if (hip < 0.5) faces.push(farLeft, nearLeft, crestLeft, nearRight, farRight, crestRight);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(faces.flat(), 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createCastle() {
  const castle = new THREE.Group();
  castle.name = 'Citadel of the Last Light';
  const gate = new THREE.Group();
  gate.name = 'Reinforced oak portcullis';
  castle.add(gate);

  const stone = {
    mortar: material('#87796b'),
    body: material('#ab9982'),
    pale: material('#cdb796'),
    trim: material('#b09b81'),
    shadow: material('#746657'),
    brick: ['#a69681', '#b1a18c', '#b8a890', '#bfaf97', '#c5b59c'].map((color) => material(color)),
  };
  const slate = material('#334b6b', { roughness: 0.64 });
  const slateLine = material('#263b59');
  const slateGlint = material('#455d7c');
  const copper = material('#aa7950', { metalness: 0.48, roughness: 0.48 });
  const iron = material('#33343b', { metalness: 0.55, roughness: 0.54 });
  const recess = material('#322a31');
  const glazing = material('#384253', { roughness: 0.36 });
  const amber = material('#e3a85d', { emissive: '#f08a2e', emissiveIntensity: 0.78 });
  const hearth = material('#fff1b9', { emissive: '#ffac53', emissiveIntensity: 1.55 });
  const paving = material('#807a70');
  const pavers = ['#a39a87', '#aea08e', '#b5a998'].map((color) => material(color));
  const wood = ['#54423c', '#675046', '#785e50'].map((color) => material(color));
  const cloth = material('#792e46', { side: THREE.DoubleSide });

  const cube = new THREE.BoxGeometry();
  const dressed = bevelBlock();
  const round = new THREE.CylinderGeometry(1, 1, 1, 32);
  const octagon = new THREE.CylinderGeometry(1, 1, 1, 8);
  const ball = new THREE.SphereGeometry(1, 12, 8);
  const metalRing = new THREE.TorusGeometry(1, 0.035, 6, 14);
  const molding = new THREE.TorusGeometry(1, 0.012, 5, 36).rotateX(-Math.PI / 2);
  const voussoir = ringStone();
  const panel = relief(archOutline(new THREE.Shape()));
  const frameShape = archOutline(new THREE.Shape());
  frameShape.holes.push(archOutline(new THREE.Path(), 0.76, 0.84));
  const frame = relief(frameShape, 0.095);
  const hip = roofPlanes(0.32);
  const gable = roofPlanes(0.5);
  const roofProfile = [
    [1.06, 0], [1.035, 0.04], [0.955, 0.13], [0.82, 0.27],
    [0.66, 0.43], [0.49, 0.59], [0.31, 0.76], [0.14, 0.9], [0.012, 1],
  ];
  const spire = new THREE.LatheGeometry(roofProfile.map(([r, y]) => new THREE.Vector2(r, y)), 36);
  const batches = new Map();
  const flags = [];
  const dummy = new THREE.Object3D();
  let seed = 562137;

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  }

  function pick(items) {
    return items[Math.floor(random() * items.length)];
  }

  function piece(geometry, surface, x, y, z, sx, sy, sz, yaw = 0, cast = true, pitch = 0, roll = 0, target = castle) {
    const key = `${geometry.id}/${surface.id}/${cast}/${target.id}`;
    if (!batches.has(key)) batches.set(key, { geometry, surface, cast, target, matrices: [] });
    dummy.position.set(x, y, z);
    dummy.rotation.set(pitch, yaw, roll, 'YXZ');
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    batches.get(key).matrices.push(dummy.matrix.clone());
  }

  function box(surface, x, y, z, width, height, depth, yaw = 0, cast = true, target = castle) {
    piece(cube, surface, x, y, z, width, height, depth, yaw, cast, 0, 0, target);
  }

  function facePiece(geometry, surface, x, y, z, yaw, u, v, d, width, height, depth, cast = true) {
    piece(geometry, surface, x + Math.cos(yaw) * u + Math.sin(yaw) * d, y + v,
      z - Math.sin(yaw) * u + Math.cos(yaw) * d, width, height, depth, yaw, cast);
  }

  function shaft(surface, x, y, z, radius, height, geometry = round, cast = true) {
    piece(geometry, surface, x, y, z, radius, height, radius, 0, cast);
  }

  function ashlar(x, y, z, width, height, yaw, course = 0.43, brick = 0.85) {
    const rows = Math.ceil(height / course);
    const rowHeight = height / rows;
    for (let row = 0; row < rows; row++) {
      let left = -width / 2;
      while (left < width / 2 - 0.03) {
        const nominal = left === -width / 2 && row % 2 ? brick * 0.52 : brick;
        const size = Math.min(width / 2 - left, nominal * (0.81 + random() * 0.38));
        if (size > 0.07) {
          facePiece(cube, pick(stone.brick), x, y, z, yaw, left + size / 2, (row + 0.5) * rowHeight,
            0.005, size - 0.022, rowHeight - 0.017, 0.065 + random() * 0.026, false);
        }
        left += size;
      }
    }
  }

  function window(x, y, z, width, height, yaw = 0, lit = false) {
    facePiece(panel, recess, x, y, z, yaw, 0, 0, 0.02, width * 1.04, height * 1.015, 0.65, false);
    facePiece(panel, lit ? amber : glazing, x, y, z, yaw, 0, 0, 0.065, width * 0.76, height * 0.84, 0.12, false);
    facePiece(frame, stone.pale, x, y, z, yaw, 0, 0, 0.071, width, height, 0.62, false);
    facePiece(dressed, stone.trim, x, y, z, yaw, 0, -height * 0.505, 0.07, width * 1.2, 0.12, 0.21, false);
    facePiece(cube, iron, x, y, z, yaw, 0, -height * 0.025, 0.083, 0.032, height * 0.8, 0.035, false);
    facePiece(cube, iron, x, y, z, yaw, 0, -height * 0.105, 0.087, width * 0.75, 0.03, 0.04, false);
  }

  function radialWindow(x, y, z, radius, yaw, width, height, lit) {
    window(x + Math.sin(yaw) * radius, y, z + Math.cos(yaw) * radius, width, height, yaw, lit);
  }

  function banner(x, y, z, width, height) {
    shaft(iron, x, y + 0.68, z, 0.024, 1.35);
    piece(ball, copper, x, y + 1.37, z, 0.076, 0.076, 0.076);
    const geometry = new THREE.PlaneGeometry(width, height, 15, 6);
    const vertices = geometry.getAttribute('position');
    const baseline = vertices.array.slice();
    const mesh = new THREE.Mesh(geometry, cloth);
    const yaw = -0.34;
    mesh.position.set(x + Math.cos(yaw) * width / 2, y + 1.15 - height / 2,
      z - Math.sin(yaw) * width / 2);
    mesh.rotation.y = yaw;
    castle.add(mesh);
    flags.push({ vertices, baseline, geometry, width, height, phase: random() * TAU });
  }

  function conicalRoof(x, y, z, radius, height, flag = false) {
    piece(spire, slate, x, y, z, radius, height, radius);
    shaft(slateLine, x, y + 0.02, z, radius * 1.07, 0.15);
    shaft(copper, x, y - 0.045, z, radius * 1.035, 0.045);
    for (let part = 1; part < roofProfile.length; part++) {
      const [r0, y0] = roofProfile[part - 1];
      const [r1, y1] = roofProfile[part];
      for (const t of [0.03, 0.53]) {
        const ringRadius = radius * THREE.MathUtils.lerp(r0, r1, t) + 0.013;
        const level = y + height * THREE.MathUtils.lerp(y0, y1, t);
        piece(molding, part % 3 === 1 ? slateGlint : slateLine, x, level, z,
          ringRadius, 0.64, ringRadius, 0, false);
      }
    }
    piece(ball, copper, x, y + height, z, 0.076, 0.1, 0.076);
    if (flag) banner(x, y + height, z, 1.08, 0.57);
  }

  function tower(x, z, radius, height, roofHeight, options = {}) {
    const start = options.start ?? 0;
    const top = start + height;
    shaft(stone.mortar, x, start + height / 2, z, radius * 0.975, height);
    shaft(stone.shadow, x, start + 0.13, z, radius * 1.13, 0.26);
    shaft(stone.trim, x, start + 0.34, z, radius * 1.08, 0.22);
    const courses = Math.ceil(height / 0.41);
    const rise = height / courses;
    for (let row = 1; row < courses - 1; row++) {
      for (let index = 0; index < 18; index++) {
        const yaw = (index + 0.5 * (row % 2)) * TAU / 18;
        const r = radius * (0.995 + random() * 0.016);
        piece(voussoir, pick(stone.brick), x, start + (row + 0.5) * rise, z,
          r, rise - 0.016, r, yaw, false);
      }
    }
    for (const level of [0.49, height * 0.54, height - 0.45]) {
      shaft(stone.trim, x, start + level, z, radius * 1.025, 0.13);
    }
    shaft(stone.shadow, x, top - 0.21, z, radius * 1.065, 0.24);
    shaft(stone.pale, x, top + 0.02, z, radius * 1.115, 0.2);
    for (let index = 0; index < 12; index++) {
      const angle = (index + 0.5) * TAU / 12;
      facePiece(dressed, stone.trim, x, top - 0.38, z, angle, 0, 0, radius * 1.01, 0.24, 0.42, 0.22);
      facePiece(dressed, stone.pale, x, top + 0.35, z, angle, 0, 0, radius * 1.02,
        radius * 0.31, 0.54, 0.25);
    }
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 2;
      radialWindow(x, top - 1.44, z, radius, angle, 0.37, 0.94, (i + height) % 3 < 1.75);
      if (height > 4.9) radialWindow(x, start + height * 0.34, z, radius, angle + 0.16, 0.26, 0.72, i === 0 && options.lit);
    }
    if (roofHeight) {
      shaft(stone.shadow, x, top + 0.39, z, radius * 0.82, 0.66, octagon);
      conicalRoof(x, top + 0.67, z, radius * 1.04, roofHeight, options.flag);
    } else {
      shaft(paving, x, top + 0.12, z, radius * 0.96, 0.12);
      if (options.flag) banner(x, top + 0.14, z, 0.86, 0.49);
    }
  }

  function curtain(x, z, width, yaw, height) {
    box(stone.mortar, x, height / 2, z, width, height, 1.08, yaw);
    const nx = Math.sin(yaw);
    const nz = Math.cos(yaw);
    ashlar(x + nx * 0.55, 0.22, z + nz * 0.55, width, height - 0.27, yaw);
    ashlar(x - nx * 0.55, 0.22, z - nz * 0.55, width, height - 0.27, yaw + Math.PI);
    box(stone.shadow, x, 0.15, z, width, 0.28, 1.32, yaw);
    box(stone.trim, x, 0.35, z, width, 0.15, 1.23, yaw);
    box(stone.trim, x, height - 0.13, z, width, 0.19, 1.28, yaw);
    box(stone.pale, x, height + 0.01, z, width, 0.14, 1.33, yaw);
    const merlons = Math.round(width / 0.89);
    for (let i = 0; i < merlons; i++) {
      const along = width * ((i + 0.5) / merlons - 0.5);
      facePiece(dressed, stone.pale, x, height + 0.35, z, yaw, along, 0, 0.39, 0.46, 0.54, 0.43);
      facePiece(dressed, stone.trim, x, height + 0.23, z, yaw, along, 0, -0.45, 0.43, 0.31, 0.28);
      if (i % 3 === 1) {
        facePiece(dressed, stone.trim, x, (height - 0.48) / 2, z, yaw,
          along, 0, 0.57, 0.43, height - 0.48, 0.28);
        facePiece(dressed, stone.shadow, x, 0.19, z, yaw, along, 0, 0.66, 0.65, 0.38, 0.37);
      } else if (i % 3 === 0) {
        window(x + Math.cos(yaw) * along + nx * 0.58, height - 0.95,
          z - Math.sin(yaw) * along + nz * 0.58, 0.18, 0.53, yaw);
      }
    }
  }

  function hall(x, z, width, depth, height, accessible = false) {
    if (accessible) {
      const front = z + depth / 2;
      const wall = 0.43;
      const ceiling = 4.15;
      const opening = new THREE.Shape();
      opening.moveTo(-width / 2, 0);
      opening.lineTo(-1.02, 0);
      opening.lineTo(-1.02, 2.12);
      opening.quadraticCurveTo(-1.02, 2.67, 0, 3.24);
      opening.quadraticCurveTo(1.02, 2.67, 1.02, 2.12);
      opening.lineTo(1.02, 0);
      opening.lineTo(width / 2, 0);
      opening.lineTo(width / 2, ceiling);
      opening.lineTo(-width / 2, ceiling);
      opening.closePath();
      piece(relief(opening, wall), stone.mortar, x, 0, front - wall, 1, 1, 1);
      box(stone.mortar, x, (height + ceiling) / 2, z, width, height - ceiling, depth);
      box(stone.mortar, x, ceiling / 2, z - depth / 2 + wall / 2, width, ceiling, wall);
      const towerDoor = new THREE.Shape();
      const { entranceZ, entranceHalfWidth: half, entranceSpring: spring, entranceControl: control, entranceCrest: crest } = TOWER;
      towerDoor.moveTo(entranceZ - front, 0);
      towerDoor.lineTo(-half, 0);
      towerDoor.lineTo(-half, spring);
      towerDoor.quadraticCurveTo(-half, control, 0, crest);
      towerDoor.quadraticCurveTo(half, control, half, spring);
      towerDoor.lineTo(half, 0);
      towerDoor.lineTo(entranceZ - (z - depth / 2), 0);
      towerDoor.lineTo(entranceZ - (z - depth / 2), ceiling);
      towerDoor.lineTo(entranceZ - front, ceiling);
      towerDoor.closePath();
      const east = x + width / 2;
      piece(relief(towerDoor, wall), stone.mortar, east - wall, 0, entranceZ, 1, 1, 1, Math.PI / 2);
      box(stone.mortar, x - (width - wall) / 2, ceiling / 2, z, wall, ceiling, depth);
      box(stone.trim, x - width / 2, 0.22, z - 0.09, 0.22, 0.42, depth - 0.08);
      const trimSetback = 0.025;
      for (const [back, near, side] of [[z - depth / 2, entranceZ - half, -1], [entranceZ + half, front, 1]]) {
        const center = (back + near) / 2;
        // Keep the trim's end face clear of the matching jamb face.
        box(stone.trim, east, 0.22, center + side * trimSetback / 2, 0.22, 0.42, near - back - trimSetback);
        ashlar(east, 0.36, center, near - back, 2.58, Math.PI / 2, 0.42, 0.91);
      }
      ashlar(east, 2.95, z, depth, height - 3.07, Math.PI / 2, 0.42, 0.91);
      for (const sign of [-1, 1]) {
        box(stone.trim, x + sign * (width / 2 + 1.02) / 2, 0.22, front - 0.12, width / 2 - 1.02, 0.42, 0.42);
      }
      box(stone.trim, x, 0.22, z - depth / 2, width + 0.2, 0.42, 0.22);
      ashlar(x, 3.28, front, width, height - 3.38, 0, 0.42, 0.91);
      for (const sign of [-1, 1]) {
        ashlar(x + sign * (width / 2 + 1.18) / 2, 0.36, front, width / 2 - 1.18, 2.92, 0, 0.42, 0.91);
      }
    } else {
      box(stone.mortar, x, height / 2, z, width, height, depth);
      box(stone.trim, x, 0.22, z, width + 0.2, 0.42, depth + 0.2);
    }
    for (const side of [
      [x, z + depth / 2, width, 0], [x + width / 2, z, depth, Math.PI / 2],
      [x, z - depth / 2, width, Math.PI], [x - width / 2, z, depth, -Math.PI / 2],
    ]) {
      const [cx, cz, length, yaw] = side;
      if (!accessible || (yaw !== 0 && yaw !== Math.PI / 2)) ashlar(cx, 0.36, cz, length, height - 0.46, yaw, 0.42, 0.91);
      for (const along of [-length / 2 + 0.15, length / 2 - 0.15]) {
        facePiece(dressed, stone.pale, cx, height / 2, cz, yaw, along, 0, 0.07, 0.3, height, 0.24);
      }
    }
    box(stone.trim, x, height - 0.23, z, width + 0.2, 0.15, depth + 0.2);
    box(stone.pale, x, height - 0.04, z, width + 0.28, 0.19, depth + 0.28);
  }

  function ridgedRoof(x, y, z, width, depth, height, yaw = 0, isGable = false) {
    const ridge = isGable ? 1 : 0.64;
    piece(isGable ? gable : hip, slate, x, y, z, width, height, depth, yaw);
    box(slateLine, x, y + 0.01, z, width + 0.04, 0.12, depth + 0.04, yaw);
    facePiece(dressed, slateGlint, x, y + height, z, yaw, 0, 0, 0, width * ridge + 0.07, 0.12, 0.15);
    for (let row = 1; row <= 11; row++) {
      const t = row / 12;
      const length = width * THREE.MathUtils.lerp(1, ridge, t);
      const zOffset = depth * (1 - t) / 2;
      for (const side of [-1, 1]) {
        facePiece(cube, row % 4 === 1 ? slateGlint : slateLine, x, y, z, yaw, 0,
          t * height + 0.014, side * zOffset, length, 0.039, 0.042, false);
        const count = Math.floor(length / 0.44);
        for (let i = 0; i < count; i++) {
          if (random() > 0.2) continue;
          const along = length * ((i + 0.5) / count - 0.5);
          const localZ = side * (zOffset - depth / 48);
          piece(cube, slateGlint, x + Math.cos(yaw) * along + Math.sin(yaw) * localZ,
            y + (t + 1 / 24) * height + 0.014, z - Math.sin(yaw) * along + Math.cos(yaw) * localZ,
            0.30, 0.022, Math.hypot(height, depth / 2) / 13, yaw, false,
            side * Math.atan2(height, depth / 2));
        }
      }
    }
  }

  // Enclosing walls and the asymmetrical roofs establish the silhouette.
  curtain(-8.25, 0, 13.15, -Math.PI / 2, 4.34);
  curtain(8.25, 0, 13.15, Math.PI / 2, 4.38);
  curtain(0, -6.55, 16.5, Math.PI, 4.55);
  curtain(-5.41, 6.57, 5.68, 0, 4.12);
  curtain(5.41, 6.57, 5.68, 0, 4.12);
  tower(-8.25, 6.57, 1.43, 6.24, 0, { flag: true, lit: true });
  tower(8.25, 6.57, 1.38, 6.74, 2.64, { lit: true });
  tower(-8.25, -6.55, 1.42, 7.49, 2.72);
  tower(8.25, -6.55, 1.48, 7.74, 2.95);

  hall(0.36, -3.25, 5.7, 4.35, 10.42, true);
  ridgedRoof(0.36, 10.49, -3.25, 6.19, 4.83, 2.83);
  tower(-2.58, -4.32, 1.04, 10.31, 2.76);
  tower(0.57, -3.43, 1.24, 4.28, 3.22, { start: 8.42, flag: true, lit: true });
  banner(TOWER.x + 1.55, TOWER.deckY + 0.51, TOWER.z - 1.52, 1.05, 0.54);
  for (const level of [4.1, 6.5, 8.8]) {
    for (const x of [-1.45, 0.32, 2.1]) {
      window(x, level, -1.068, 0.68, 1.55, 0, (x + level) % 2 < 1.42);
      window(x, level, -5.43, 0.56, 1.37, Math.PI, (x + level) % 2 > 1.04);
    }
    for (const z of [-2.52, -4.22]) {
      window(-2.49, level, z, 0.61, 1.47, -Math.PI / 2, level !== 6.5);
      window(3.21, level, z, 0.61, 1.47, Math.PI / 2, level === 6.5);
    }
  }

  // The chapel's open eaves, tracery, and bell turret contrast with the keep.
  hall(-5.47, -0.76, 3.29, 4.26, 5.99);
  const chapelGable = relief(new THREE.Shape([
    new THREE.Vector2(-1.66, 0), new THREE.Vector2(1.66, 0), new THREE.Vector2(0, 2.24),
  ]), 0.25);
  piece(chapelGable, stone.body, -5.47, 5.97, 1.25, 1, 1, 1);
  piece(chapelGable, stone.body, -5.47, 5.97, -2.98, 1, 1, 1);
  ridgedRoof(-5.47, 6.04, -0.76, 4.66, 3.67, 2.31, Math.PI / 2, true);
  tower(-6.61, -2.9, 0.76, 8.67, 2.1);
  window(-5.47, 3.35, 1.38, 1.19, 2.5, 0, true);
  piece(ball, amber, -5.47, 6.51, 1.52, 0.38, 0.38, 0.039, 0, false);
  piece(metalRing, stone.pale, -5.47, 6.51, 1.57, 0.4, 0.4, 0.83, 0, false);
  for (let spoke = 0; spoke < 6; spoke++) {
    piece(cube, iron, -5.47, 6.51, 1.58, 0.026, 0.75, 0.035, 0, false, 0, spoke * Math.PI / 6);
  }
  for (const z of [-1.99, -0.78, 0.45]) {
    window(-7.12, 3.88, z, 0.58, 1.98, -Math.PI / 2, z !== -0.78);
    window(-3.82, 3.88, z, 0.58, 1.98, Math.PI / 2, z === -0.78);
  }

  hall(5.68, -0.15, 2.92, 4.51, 4.61);
  ridgedRoof(5.68, 4.68, -0.15, 4.94, 3.31, 1.83, Math.PI / 2);
  for (const z of [-1.64, -0.16, 1.3]) {
    window(7.142, 3.11, z, 0.51, 1.32, Math.PI / 2, z !== -0.16);
    window(4.214, 3.11, z, 0.51, 1.32, -Math.PI / 2, z === -0.16);
  }
  window(5.68, 2.74, 2.113, 0.74, 1.47, 0, true);
  for (const x of [5.03, 6.38]) {
    box(stone.body, x, 5.59, -0.67, 0.39, 1.14, 0.48);
    box(stone.pale, x, 6.16, -0.67, 0.48, 0.13, 0.57);
  }

  // Gate opening, layered jambs, a portcullis, and a wooden drawbridge.
  const entry = new THREE.Shape();
  entry.moveTo(-2.49, 0.03);
  entry.lineTo(-1.36, 0.03);
  entry.lineTo(-1.36, 2.42);
  entry.quadraticCurveTo(-1.36, 3.17, 0, 3.89);
  entry.quadraticCurveTo(1.36, 3.17, 1.36, 2.42);
  entry.lineTo(1.36, 0.03);
  entry.lineTo(2.49, 0.03);
  entry.lineTo(2.49, 6.95);
  entry.lineTo(-2.49, 6.95);
  entry.closePath();
  piece(relief(entry, 1.7), stone.body, 0, 0, 5.52, 1, 1, 1);
  ashlar(0, 4.01, 7.23, 3.92, 2.92, 0, 0.39, 0.73);
  ashlar(0, 4.01, 5.51, 3.92, 2.92, Math.PI, 0.39, 0.73);
  const entryTrim = new THREE.Shape();
  entryTrim.moveTo(-1.58, 0.15);
  entryTrim.lineTo(-1.58, 2.41);
  entryTrim.quadraticCurveTo(-1.58, 3.36, 0, 4.14);
  entryTrim.quadraticCurveTo(1.58, 3.36, 1.58, 2.41);
  entryTrim.lineTo(1.58, 0.15);
  entryTrim.lineTo(1.34, 0.15);
  entryTrim.lineTo(1.34, 2.42);
  entryTrim.quadraticCurveTo(1.34, 3.15, 0, 3.87);
  entryTrim.quadraticCurveTo(-1.34, 3.15, -1.34, 2.42);
  entryTrim.lineTo(-1.34, 0.15);
  entryTrim.closePath();
  piece(relief(entryTrim, 0.18), stone.pale, 0, 0, 7.21, 1, 1, 1);
  for (const side of [-1, 1]) {
    for (let course = 1; course < 7; course++) {
      box(stone.trim, side * 1.46, 0.19 + course * 0.32, 7.395, 0.24, 0.015, 0.018, 0, false);
    }
    for (let joint = 1; joint < 6; joint++) {
      const t = joint / 6;
      const x = side * 1.46 * (1 - t ** 2);
      const y = 2.415 + 1.72 * t - 0.13 * t ** 2;
      const angle = Math.atan2(2.92 * t, 1.72 - 0.26 * t);
      piece(cube, stone.trim, x, y, 7.395, 0.24, 0.016, 0.018, 0, false, 0, side * angle);
    }
  }
  piece(dressed, stone.pale, 0, 4.015, 7.4, 0.29, 0.32, 0.12);
  const shield = new THREE.Shape();
  shield.moveTo(-0.5, 0.5);
  shield.lineTo(0.5, 0.5);
  shield.lineTo(0.45, 0.07);
  shield.quadraticCurveTo(0.39, -0.24, 0, -0.5);
  shield.quadraticCurveTo(-0.39, -0.24, -0.45, 0.07);
  shield.closePath();
  const escutcheon = relief(shield, 0.045);
  piece(escutcheon, copper, 0, 4.57, 7.283, 0.48, 0.62, 1, 0, false);
  piece(escutcheon, cloth, 0, 4.588, 7.312, 0.38, 0.49, 0.8, 0, false);
  box(copper, 0, 4.615, 7.358, 0.062, 0.31, 0.024, 0, false);
  box(copper, 0, 4.653, 7.359, 0.229, 0.055, 0.024, 0, false);
  box(stone.trim, 0, 7.0, 6.38, 4.95, 0.22, 2.06);
  ridgedRoof(0, 7.09, 6.39, 4.95, 2.32, 1.14);
  tower(-2.45, 6.56, 1.31, 7.83, 2.45, { lit: true });
  tower(2.45, 6.56, 1.31, 7.83, 2.45, { lit: true });
  for (const x of [-0.91, 0, 0.91]) window(x, 5.53, 7.27, 0.52, 1.24, 0, x !== 0);
  piece(panel, recess, 0, 1.99, 6.02, 2.68, 3.82, 0.45, 0, true, 0, 0, gate);
  for (let i = -6; i <= 6; i++) {
    const x = i * 0.205;
    const height = 3.55 - 0.86 * Math.abs(x) ** 1.46;
    box(wood[(i + 6) % 3], x, height / 2 + 0.09, 6.065, 0.189, height, 0.062, 0, false, gate);
    box(iron, x, height / 2 + 0.13, 6.29, 0.054, height - 0.02, 0.054, 0, false, gate);
  }
  for (const y of [0.59, 1.28, 1.97, 2.65]) box(iron, 0, y, 6.31, 2.54, 0.067, 0.07, 0, false, gate);
  box(stone.trim, 0, 0.055, 6.74, 2.41, 0.12, 1.86, 0, false);
  box(stone.shadow, 0, 0.06, 8.32, 3.16, 0.15, 2.41);
  for (let i = 0; i < 12; i++) {
    const z = 7.17 + i * 0.201;
    box(wood[i % 3], 0, 0.15, z, 3.02, 0.11, 0.188);
    for (const x of [-1.26, 1.26]) piece(ball, iron, x, 0.209, z, 0.029, 0.012, 0.029, 0, false);
  }
  for (const x of [-1.46, 1.46]) {
    box(wood[0], x, 0.215, 8.34, 0.13, 0.14, 2.46);
    for (let link = 0; link < 22; link++) {
      const t = link / 21;
      piece(metalRing, iron, x, 0.29 + 2.45 * (1 - t) ** 1.34, 7.42 + 1.72 * t,
        0.059, 0.091, 0.54, link % 2 ? 0.2 : Math.PI / 2, false, -0.38);
    }
    piece(dressed, iron, x, 2.33, 7.46, 0.19, 0.31, 0.24);
    piece(ball, amber, x, 2.56, 7.57, 0.11, 0.17, 0.105, 0, false);
    piece(ball, hearth, x, 2.59, 7.59, 0.071, 0.12, 0.071, 0, false);
  }

  // Courtyard, uneven flagstones, an ornamental well, and small stair details.
  box(paving, 0, 0.025, 0, 15.9, 0.1, 12.84, 0, false);
  for (let row = 0; row < 22; row++) {
    for (let col = 0; col < 22; col++) {
      const x = -7.67 + col * 0.72 + (row % 2) * 0.17;
      const z = -6.03 + row * 0.563;
      box(pick(pavers), x, 0.081, z, 0.687 + random() * 0.012,
        0.043 + random() * 0.008, 0.528 + random() * 0.013, 0, false);
    }
  }
  const wellX = 2.9;
  const wellZ = 2.9;
  shaft(stone.shadow, wellX, 0.17, wellZ, 0.8, 0.21, octagon);
  shaft(stone.body, wellX, 0.53, wellZ, 0.65, 0.64, octagon);
  shaft(recess, wellX, 0.85, wellZ, 0.49, 0.06, octagon, false);
  piece(molding, stone.pale, wellX, 0.9, wellZ, 0.59, 6.6, 0.59);
  for (const x of [wellX - 0.56, wellX + 0.56]) box(wood[0], x, 1.23, wellZ, 0.09, 1.03, 0.09);
  ridgedRoof(wellX, 1.7, wellZ, 1.44, 0.93, 0.43, 0, true);

  for (const { geometry, surface, cast, target, matrices } of batches.values()) {
    const mesh = new THREE.InstancedMesh(geometry, surface, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    target.add(mesh);
  }

  const interior = createInterior();
  const ascent = createAscentTower();
  castle.add(interior.group, ascent.group);
  let targetGateHeight = 0;
  castle.userData.setGateOpen = (open) => {
    targetGateHeight = open ? 3.34 : 0;
    interior.setLights(open);
    ascent.setLights(open);
  };

  castle.userData.update = (time, delta = 1 / 60) => {
    for (const { vertices, baseline, geometry, width, height, phase } of flags) {
      for (let i = 0; i < vertices.count; i++) {
        const index = i * 3;
        const x = baseline[index];
        const y = baseline[index + 1];
        const outward = x / width + 0.5;
        const taper = Math.max(0, outward - 0.68) * y * 1.5;
        const wave = Math.sin(outward * 8.4 - time * 2.3 + phase + y * 1.5);
        vertices.setXYZ(i, x, y - taper - outward * height * 0.12,
          outward * (wave * 0.13 + Math.sin(time * 0.91 + phase) * 0.1));
      }
      vertices.needsUpdate = true;
      geometry.computeVertexNormals();
    }
    const previousGateHeight = gate.position.y;
    if (previousGateHeight !== targetGateHeight) {
      gate.position.y = THREE.MathUtils.damp(previousGateHeight, targetGateHeight, 4.8, delta);
      if (Math.abs(gate.position.y - targetGateHeight) < 0.008) gate.position.y = targetGateHeight;
    }
    interior.update(time);
    return gate.position.y !== previousGateHeight;
  };

  return castle;
}
