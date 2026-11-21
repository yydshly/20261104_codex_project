import * as THREE from 'three';
import { TOWER } from './tower-layout.js';

const TAU = Math.PI * 2;
const rise = (TOWER.deckY - TOWER.baseY) / TOWER.stepCount;

function masonryBuffer() {
  const positions = [];
  const colors = [];
  const tint = new THREE.Color();

  function face(a, b, c, d, color, shade) {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    tint.copy(color).multiplyScalar(shade);
    for (let i = 0; i < 6; i++) colors.push(tint.r, tint.g, tint.b);
  }

  return {
    arc(inner, outer, start, end, bottom, top, color, segments = Math.ceil((end - start) / .18)) {
      if (end - start < .0001 || top - bottom < .0001) return;
      const point = (r, angle, y) => [r * Math.cos(angle), y, r * Math.sin(angle)];
      for (let i = 0; i < segments; i++) {
        const a = THREE.MathUtils.lerp(start, end, i / segments);
        const b = THREE.MathUtils.lerp(start, end, (i + 1) / segments);
        const ib = point(inner, a, bottom);
        const jb = point(inner, b, bottom);
        const ob = point(outer, a, bottom);
        const pb = point(outer, b, bottom);
        const it = point(inner, a, top);
        const jt = point(inner, b, top);
        const ot = point(outer, a, top);
        const pt = point(outer, b, top);
        face(ob, ot, pt, pb, color, 1);
        face(jb, jt, it, ib, color, .88);
        face(it, jt, pt, ot, color, 1.12);
        face(ib, ob, pb, jb, color, .76);
        if (i === 0) face(ib, it, ot, ob, color, .91);
        if (i === segments - 1) face(jb, pb, pt, jt, color, .91);
      }
    },
    mesh(name, castShadow = true) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      return mesh;
    },
  };
}

function uncovered(start, end, holes) {
  let result = [[start, end]];
  for (const [holeStart, holeEnd] of holes) {
    result = result.flatMap(([left, right]) => {
      if (right <= holeStart || left >= holeEnd) return [[left, right]];
      return [[left, Math.min(right, holeStart)], [Math.max(left, holeEnd), right]].filter(([a, b]) => b > a);
    });
  }
  return result;
}

export function createAscentTower() {
  const { x, z, wallRadius, innerRadius, pillarRadius, deckRadius, apertureRadius,
    baseY, deckY, startAngle, stepCount, stepAngle, solidDeckAngle } = TOWER;
  const group = new THREE.Group();
  group.name = 'Spiral stair and open watchtower';
  group.position.set(x, 0, z);

  const color = (hex) => new THREE.Color(hex);
  const mortar = color('#847469');
  const limestone = ['#a79480', '#b8a58f', '#ad9b88', '#c1ae97', '#b4a18a'].map(color);
  const trim = color('#c4ad8d');
  const shadow = color('#877568');
  const paving = ['#9e917e', '#9a8a78', '#b0a18c', '#ab9c86'].map(color);
  const stonework = masonryBuffer();
  const steps = masonryBuffer();
  const roof = masonryBuffer();

  const cube = new THREE.BoxGeometry();
  const metal = new THREE.MeshStandardMaterial({ color: '#423339', metalness: .51, roughness: .55 });
  const oak = new THREE.MeshStandardMaterial({ color: '#574138', roughness: .75 });
  const gilded = new THREE.MeshStandardMaterial({ color: '#9d744c', metalness: .4, roughness: .54 });
  const litGlass = new THREE.MeshStandardMaterial({ color: '#f1be7e', emissive: '#ea883e', emissiveIntensity: 1.7 });
  const tile = new THREE.MeshStandardMaterial({ color: '#a59681', roughness: .92 });
  const batches = new Map();
  const source = new THREE.Object3D();
  const lights = [];

  function block(material, position, size, yaw = 0) {
    source.position.set(...position);
    source.scale.set(...size);
    source.rotation.y = yaw;
    source.updateMatrix();
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(source.matrix.clone());
  }

  function radial(material, angle, radius, height, tangentWidth, thickness, depth) {
    block(material, [radius * Math.cos(angle), height, radius * Math.sin(angle)], [depth, thickness, tangentWidth], -angle);
  }

  const wallTop = deckY - .17;
  const courses = 41;
  const course = wallTop / courses;
  const windows = Array.from({ length: 5 }, (_, turn) => {
    const step = turn * 12 + (turn % 2 ? 8 : 6);
    const angle = (startAngle + step * stepAngle + TAU) % TAU;
    const bottom = Math.floor((baseY + step * rise + .86) / course) * course;
    return { angle, bottom, top: bottom + 3 * course };
  });
  for (const { angle, bottom, top } of windows) {
    radial(tile, angle, wallRadius + .026, bottom + .024, .60, .105, .31);
    radial(tile, angle, innerRadius + .015, bottom + .016, .57, .09, .24);
    radial(tile, angle, wallRadius + .012, top + .048, .45, .15, .23);
  }

  // A hollow, coursed shaft. The arched door and arrow slits are actual openings.
  for (let row = 0; row < courses; row++) {
    const bottom = row * course;
    const top = bottom + course;
    const openings = [];
    if (bottom < TOWER.entranceCrest) {
      const center = Math.PI - .27;
      const crown = THREE.MathUtils.smoothstep(bottom, TOWER.entranceSpring, TOWER.entranceCrest);
      const half = .53 * Math.sqrt(1 - crown);
      openings.push([center - half, center + half]);
    }
    for (const window of windows) {
      if (top <= window.bottom + .002 || bottom >= window.top - .002) continue;
      const half = top >= window.top - .002 ? .078 : .125;
      for (const wrap of [-TAU, 0, TAU]) openings.push([window.angle - half + wrap, window.angle + half + wrap]);
    }
    for (const [left, right] of uncovered(0, TAU, openings)) {
      stonework.arc(innerRadius + .025, wallRadius - .028, left, right, bottom, top, mortar);
      const count = 22;
      const brick = TAU / count;
      const offset = row % 2 * brick / 2;
      for (let column = -1; column < count; column++) {
        const a = Math.max(left, column * brick + offset + .008);
        const b = Math.min(right, (column + 1) * brick + offset - .008);
        const stone = limestone[(row * 11 + column * 7 + 7) % limestone.length];
        stonework.arc(wallRadius - .031, wallRadius, a, b, bottom + .011, top - .009, stone);
        stonework.arc(innerRadius, innerRadius + .028, a, b, bottom + .009, top - .01, stone);
      }
    }
  }
  for (const y of [.19, .43, 4.69, 8.91, 12.85]) {
    const slots = y < 1 ? [[Math.PI - .80, Math.PI + .26]] : [];
    for (const [a, b] of uncovered(0, TAU, slots)) {
      stonework.arc(wallRadius - .01, wallRadius + (y < 1 ? .091 : .071), a, b, y - .065, y + .065, y < .3 ? shadow : trim);
    }
  }

  const railPoints = [];
  for (let i = 0; i <= stepCount * 3; i++) {
    const t = i / 3;
    const angle = startAngle + t * stepAngle;
    railPoints.push(new THREE.Vector3(.45 * Math.cos(angle), baseY + t * rise + .74, .45 * Math.sin(angle)));
  }
  const handrail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints), 180, .024, 6), oak);
  handrail.receiveShadow = true;
  group.add(handrail);
  for (let i = 0; i < stepCount; i++) {
    const angle = startAngle + i * stepAngle;
    const top = baseY + (i + .58) * rise;
    const material = paving[i % paving.length];
    steps.arc(pillarRadius - .01, innerRadius + .006, angle - .008, angle + stepAngle + .008, top - .262, top - .035, shadow, 4);
    steps.arc(pillarRadius - .013, innerRadius + .008, angle - .016, angle + stepAngle + .007, top - .036, top, material, 4);
    if (i % 2 === 0) radial(metal, angle + .17, .448, top + .34, .043, .68, .043);
  }
  for (let i = 0; i < 36; i++) {
    const bottom = i * deckY / 36;
    const top = (i + 1) * deckY / 36;
    steps.arc(.017, pillarRadius, 0, TAU, bottom, top, i % 3 === 1 ? limestone[2] : mortar, 14);
    steps.arc(pillarRadius - .008, pillarRadius + .022, 0, TAU, bottom + .015, bottom + .054, trim, 14);
  }
  steps.arc(pillarRadius - .01, innerRadius + .011, startAngle - .92, startAngle + .042, -.04, baseY - .01, paving[2], 9);
  const thresholdZ = TOWER.entranceZ - z;
  for (let i = 0; i < 3; i++) {
    block(tile, [-1.55, baseY - .059, thresholdZ + (i - 1) * .411], [1.14, .118, .401]);
  }

  // Outward corbels hold the viewing terrace, with an open, guarded stairwell.
  const deckStart = startAngle + stepCount * stepAngle;
  roof.arc(apertureRadius, wallRadius + .25, 0, TAU, deckY - .42, deckY - .21, shadow, 44);
  roof.arc(apertureRadius, deckRadius, 0, TAU, deckY - .23, deckY - .025, trim, 54);
  roof.arc(pillarRadius - .012, apertureRadius - .007, deckStart, deckStart + solidDeckAngle, deckY - .21, deckY, paving[2], 14);
  for (let i = 0; i < 32; i++) {
    const angle = i / 32 * TAU;
    roof.arc(apertureRadius - .006, deckRadius - .035, angle + .006, angle + TAU / 32 - .006, deckY - .029, deckY, paving[i % paving.length], 2);
  }
  const parapetInner = deckRadius - .285;
  roof.arc(parapetInner, deckRadius, 0, TAU, deckY, deckY + .44, limestone[2], 54);
  roof.arc(parapetInner - .04, deckRadius + .043, 0, TAU, deckY + .44, deckY + .514, trim, 54);
  for (let i = 0; i < 16; i++) {
    const angle = i / 16 * TAU;
    roof.arc(parapetInner + .021, deckRadius - .019, angle - .096, angle + .096, deckY + .508, deckY + .914, limestone[i % limestone.length], 2);
    roof.arc(parapetInner - .014, deckRadius + .022, angle - .103, angle + .103, deckY + .914, deckY + .972, trim, 2);
    radial(tile, angle, wallRadius + .135, deckY - .52, .23, .44, .47);
  }

  function railing(a, b, height) {
    const deltaX = b[0] - a[0];
    const deltaZ = b[1] - a[1];
    block(metal, [(a[0] + b[0]) / 2, deckY + height, (a[1] + b[1]) / 2], [Math.hypot(deltaX, deltaZ) + .026, .036, .045], -Math.atan2(deltaZ, deltaX));
  }

  function guard(points) {
    for (const [px, pz] of points) {
      block(metal, [px, deckY + .37, pz], [.043, .75, .043]);
      block(gilded, [px, deckY + .756, pz], [.061, .034, .061]);
    }
    for (let i = 1; i < points.length; i++) {
      railing(points[i - 1], points[i], .38);
      railing(points[i - 1], points[i], .727);
    }
  }

  const boundary = startAngle + solidDeckAngle;
  const guardRadius = apertureRadius + .022;
  guard(Array.from({ length: 28 }, (_, i) => {
    const angle = THREE.MathUtils.lerp(boundary, startAngle + TAU, i / 27);
    return [guardRadius * Math.cos(angle), guardRadius * Math.sin(angle)];
  }));
  guard(Array.from({ length: 6 }, (_, i) => {
    const radius = THREE.MathUtils.lerp(pillarRadius + .005, guardRadius, i / 5);
    return [radius * Math.cos(boundary), radius * Math.sin(boundary)];
  }));
  roof.arc(.022, pillarRadius + .055, 0, TAU, deckY, deckY + .71, limestone[0], 18);
  roof.arc(.022, pillarRadius + .09, 0, TAU, deckY + .71, deckY + .80, trim, 18);

  for (const step of [3, 14, 25, 36, 47, 57]) {
    const angle = startAngle + (step + 1) * stepAngle;
    const y = baseY + step * rise + 1.31;
    radial(metal, angle, innerRadius - .06, y - .19, .075, .38, .19);
    radial(litGlass, angle, innerRadius - .125, y, .145, .224, .14);
    for (const offset of [-.129, .129]) radial(metal, angle, innerRadius - .125, y + offset, .197, .04, .184);
    if (step === 57) continue;
    const lamp = new THREE.PointLight('#ffba7c', 4.9, 4.25, 2);
    lamp.position.set((innerRadius - .45) * Math.cos(angle), y + .04, (innerRadius - .45) * Math.sin(angle));
    lamp.visible = false;
    lights.push(lamp);
    group.add(lamp);
  }

  group.add(stonework.mesh('Hollow coursed limestone tower'), steps.mesh('Sixty carved spiral treads'), roof.mesh('Open parapet and guarded terrace'));
  for (const [material, matrices] of batches) {
    const mesh = new THREE.InstancedMesh(cube, material, matrices.length);
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  return { group, setLights(active) { for (const light of lights) light.visible = active; } };
}
