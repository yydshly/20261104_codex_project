import * as THREE from 'three';
import { createSmallAnimalAgent } from './world-wildlife.js';
import { coastlineX, groundHeight } from './world-terrain.js';

const TAU = Math.PI * 2;
const axisY = new THREE.Vector3(0, 1, 0);
const point = (x, y, z) => new THREE.Vector3(x, y, z);
const matte = (color, properties = {}) => new THREE.MeshStandardMaterial({ color, roughness: .87, ...properties });
const sphere = new THREE.SphereGeometry(1, 12, 8);
const rock = new THREE.IcosahedronGeometry(1, 0);
const stem = new THREE.CylinderGeometry(.68, 1, 1, 5);
const bark = matte(0x655242);
const rootBark = matte(0x846644);
const amber = matte(0xeeb258);
const stripe = matte(0x312822);
const leafGreen = matte(0x4f7547, { side: THREE.DoubleSide });

function seeded(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function solid(group, geometry, material, position, size) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...size);
  group.add(mesh);
  return mesh;
}

function branch(group, start, end, width, material) {
  const center = start.clone().lerp(end, .5);
  const mesh = solid(group, stem, material, center.toArray(), [width, start.distanceTo(end), width]);
  mesh.quaternion.setFromUnitVectors(axisY, end.clone().sub(start).normalize());
  return mesh;
}

function batch(group, geometry, material, transforms) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  const dummy = new THREE.Object3D();
  transforms.forEach(({ at, size, rotation = [0, 0, 0], color }, index) => {
    dummy.position.set(...at);
    dummy.scale.set(...size);
    dummy.rotation.set(...rotation);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    if (color) mesh.setColorAt(index, new THREE.Color(color));
  });
  group.add(mesh);
  return mesh;
}

function hexCell(radius) {
  const outline = new THREE.Shape();
  const opening = new THREE.Path();
  for (let i = 0; i <= 6; i++) {
    const angle = Math.PI / 6 + TAU * i / 6;
    const method = i ? 'lineTo' : 'moveTo';
    outline[method](Math.cos(angle) * radius, Math.sin(angle) * radius);
    opening[method](Math.cos(-angle) * radius * .78, Math.sin(-angle) * radius * .78);
  }
  outline.holes.push(opening);
  return new THREE.ExtrudeGeometry(outline, { depth: .092, bevelEnabled: false, curveSegments: 1 });
}

function makeBee(group, scale) {
  const bee = new THREE.Group();
  bee.name = '在花丛与巢脾间往返的蜜蜂';
  group.add(bee);
  bee.scale.setScalar(scale);
  solid(bee, sphere, amber, [0, 0, -.12], [.168, .145, .25]);
  solid(bee, sphere, stripe, [0, .006, .19], [.132, .115, .115]);
  solid(bee, sphere, matte(0x76513a), [0, .01, .046], [.145, .125, .134]);
  const band = new THREE.TorusGeometry(1, .12, 6, 14);
  for (const [z, size] of [[-.29, .114], [-.18, .155], [-.069, .16]]) {
    solid(bee, band, stripe, [0, 0, z], [size, size * .87, .155]);
  }
  const wings = [];
  const wingMaterial = matte(0xe4f4df, { metalness: .06, roughness: .29, transparent: true, opacity: .66, depthWrite: false });
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * .065, .09, .055);
    bee.add(pivot);
    const wing = solid(pivot, sphere, wingMaterial, [side * .19, .005, -.055], [.24, .014, .095]);
    wing.rotation.y = side * .34;
    wings.push(pivot);
    branch(bee, point(side * .067, .069, .247), point(side * .118, .16, .34), .012, stripe);
    for (const z of [-.13, -.012, .09]) {
      branch(bee, point(side * .083, -.055, z), point(side * .137, -.17, z - .03), .013, stripe);
    }
  }
  return { bee, wings };
}

function meadow(group, worldX, worldY, worldZ) {
  const next = seeded(161);
  const flowerColors = [0xe6b759, 0xffdfa3, 0xc59bb7, 0xe9e0b8, 0xd78968];
  const stems = [], leaves = [], petals = [], centers = [];
  for (let i = 0; i < 78; i++) {
    const x = -4.65 + next() * 8.7;
    const z = -.5 + next() * 4.85;
    if (x > .86 && z < .75) continue;
    const y = groundHeight(worldX + x, worldZ + z) - worldY;
    const height = .25 + next() * .76;
    const size = .079 + next() * .11;
    const tilt = (next() - .5) * .42;
    const top = x - height * Math.sin(tilt) * .5;
    stems.push({ at: [x, y + height * .5, z], size: [.021, height, .021], rotation: [0, 0, tilt] });
    leaves.push({ at: [x + .115, y + height * .46, z], size: [.15, .021, .059], rotation: [0, 0, .38] });
    leaves.push({ at: [x - .083, y + height * .66, z], size: [.12, .015, .047], rotation: [0, 0, -.47] });
    const color = flowerColors[Math.floor(next() * flowerColors.length)];
    for (let petal = 0; petal < 6; petal++) {
      const angle = petal * TAU / 6;
      petals.push({ at: [top + Math.cos(angle) * size, y + height, z + Math.sin(angle) * size], size: [size * .82, size * .28, size * .48], rotation: [0, -angle, 0], color });
    }
    centers.push({ at: [top, y + height + .026, z], size: [size * .69, size * .38, size * .69] });
  }
  batch(group, stem, leafGreen, stems);
  batch(group, sphere, leafGreen, leaves);
  batch(group, sphere, matte(0xffffff), petals);
  batch(group, sphere, matte(0xcb9248), centers);

  const woodHeight = groundHeight(worldX + 1.73, worldZ - 1.02) - worldY;
  const trunk = [point(1.73, woodHeight, -1.02), point(1.59, 1.35, -.99), point(1.34, 2.62, -.98), point(.96, 3.46, -1.09)];
  trunk.slice(0, -1).forEach((start, i) => {
    const piece = branch(group, start, trunk[i + 1], .58 - i * .1, bark);
    piece.userData.collidable = true;
    piece.userData.rainWettable = 'wood';
  });
  branch(group, trunk[2], point(-.35, 3.03, -.9), .33, bark).userData.rainWettable = 'wood';
  branch(group, trunk[3], point(-.9, 3.23, -.44), .22, bark).userData.rainWettable = 'wood';
  branch(group, trunk[2], point(2.46, 3.18, -1.36), .22, bark).userData.rainWettable = 'wood';
  const foliage = matte(0x638356);
  const crown = matte(0x769156);
  const canopy = [[-1.09, 3.54, -.68, 1.14], [-.12, 3.67, -1.06, 1.25], [.89, 3.97, -1.33, 1.42], [1.92, 3.74, -1.45, 1.12], [2.7, 3.63, -1.42, .8]];
  group.userData.rainCanopies = canopy.map(([x, y, z, size]) => ({ x: worldX + x, z: worldZ + z, y: worldY + y + size * .53, rx: size, rz: size * .71 }));
  canopy.forEach(([x, y, z, size], i) => {
    const piece = solid(group, rock, i % 2 ? foliage : crown, [x, y, z], [size, size * .53, size * .71]);
    piece.rotation.y = i;
    piece.userData.rainWettable = 'leaf';
  });
  const width = .176;
  const cells = [];
  const cellColors = [0xd09850, 0xffc66a, 0xe8a951, 0xe2a658, 0xffd586];
  const rows = [5, 6, 7, 7, 6, 5, 3];
  const spacing = Math.sqrt(3) * width;
  rows.forEach((count, row) => {
    const shift = (count + row) % 2 === 0 ? spacing * .5 : 0;
    for (let col = 0; col < count; col++) {
      const x = (col - (count - 1) / 2) * spacing + shift;
      const y = 2.95 - row * width * 1.5;
      cells.push({ at: [x, y, -.61 - Math.abs(x) * .105], size: [1, 1, 1], color: cellColors[Math.floor(next() * cellColors.length)] });
    }
  });
  solid(group, sphere, matte(0x8d552d), [.035, 2.21, -.828], [1.06, 1.02, .166]).userData.collidable = true;
  batch(group, hexCell(width), matte(0xffffff), cells).userData.collidable = true;

  const route = new THREE.CatmullRomCurve3([
    point(-3.58, .86, 2.06), point(-2.38, .76, 3.11), point(-.91, 1.06, 2.45), point(1.53, 1.46, 2.38),
    point(2.21, 2.22, .62), point(.48, 2.52, -.29), point(-.33, 2.63, -.28), point(-2.15, 1.77, .66),
  ], true);
  const bees = Array.from({ length: 3 }, (_, i) => {
    const insect = makeBee(group, 1 - i * .13);
    const phase = i * .31;
    insect.bee.position.copy(route.getPointAt(phase));
    return { ...insect, phase, mode: 'forage', waypoint: 0, release: 0, wing: 1,
      // Legs touch the open comb; the body stays in front of its wax walls.
      perch: point((i - 1) * .44, 2.04 + i * .17, -.34),
      gate: point((i - 1) * .44, 2.30 + i * .12, .78),
    };
  });
  const direction = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const resting = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  let sheltering = false;
  let dryTime = 0;
  const status = { beeActivity: 1, beesSheltered: 0, beesReturning: 0, beesForaging: 3 };
  function advance(insect, target, dt, speed, orient = true) {
    direction.copy(target).sub(insect.bee.position);
    const distance = direction.length();
    if (distance > .00001) {
      direction.divideScalar(distance);
      insect.bee.position.addScaledVector(direction, Math.min(distance, speed * dt));
      if (orient) {
        euler.set(-Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)), Math.atan2(direction.x, direction.z), 0);
        rotation.setFromEuler(euler);
        insect.bee.quaternion.slerp(rotation, 1 - Math.exp(-8 * dt));
      }
    }
    return distance <= speed * dt + .0001;
  }
  return {
    status,
    update(dt, time, rain) {
      dt = THREE.MathUtils.clamp(dt, 0, .12);
      if (rain > .25) {
        sheltering = true;
        dryTime = 0;
      } else if (rain < .10 && sheltering) {
        dryTime += dt;
        if (dryTime >= 8) {
          sheltering = false;
          bees.forEach((insect, i) => { insect.release = 1.5 + i * 1.7; });
        }
      } else if (sheltering) dryTime = 0;
      status.beesSheltered = status.beesReturning = status.beesForaging = 0;
      let activity = 0;
      bees.forEach((insect, i) => {
        const { bee, wings } = insect;
        if (sheltering && insect.mode !== 'return' && insect.mode !== 'perch') {
          insect.mode = 'return';
          insect.waypoint = 0;
        }
        if (!sheltering && insect.mode === 'perch') {
          insect.release -= dt;
          if (insect.release <= 0) {
            insect.mode = 'depart';
            insect.waypoint = 0;
          }
        }
        if (insect.mode === 'forage') {
          insect.phase = (insect.phase + dt * .145) % 1;
          bee.position.copy(route.getPointAt(insect.phase));
          direction.copy(route.getTangentAt(insect.phase));
          euler.set(-Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)), Math.atan2(direction.x, direction.z), .07 * Math.sin(time * 4 + i));
          rotation.setFromEuler(euler);
          bee.quaternion.slerp(rotation, 1 - Math.exp(-9 * dt));
        } else if (insect.mode === 'return') {
          const target = insect.waypoint === 0 ? insect.gate : insect.perch;
          if (insect.waypoint === 1) bee.quaternion.slerp(resting, 1 - Math.exp(-7 * dt));
          if (advance(insect, target, dt, insect.waypoint === 0 ? 1.10 : .58, insect.waypoint === 0)) {
            if (insect.waypoint === 0) insect.waypoint = 1;
            else insect.mode = 'perch';
          }
        } else if (insect.mode === 'depart') {
          const target = insect.waypoint === 0 ? insect.gate : route.getPointAt(insect.phase);
          const clearOfComb = insect.waypoint !== 0 || bee.position.z > .15;
          if (!clearOfComb) bee.quaternion.slerp(resting, 1 - Math.exp(-7 * dt));
          if (advance(insect, target, dt, .88, clearOfComb)) {
            if (insect.waypoint === 0) insect.waypoint = 1;
            else insect.mode = 'forage';
          }
        }
        const perched = insect.mode === 'perch';
        if (perched) bee.quaternion.slerp(resting, 1 - Math.exp(-5 * dt));
        insect.wing = THREE.MathUtils.damp(insect.wing, perched ? .025 : 1, perched ? 4 : 7, dt);
        wings[0].rotation.z = Math.sin(time * (perched ? 8 : 55) + i) * .74 * insect.wing;
        wings[1].rotation.z = -wings[0].rotation.z;
        bee.userData.rainMode = insect.mode;
        if (perched) status.beesSheltered++;
        else if (insect.mode === 'return') status.beesReturning++;
        else status.beesForaging++;
        activity += perched ? .035 : 1;
      });
      status.beeActivity = THREE.MathUtils.damp(status.beeActivity, activity / bees.length, 2, dt);
    },
  };
}

const tunnelJoints = [
  [-1.48, 3.72], [-1.29, 2.87], [-.37, 2.41], [.12, 1.9], [.06, 1.31], [-1.52, .71], [1.7, .69],
  [-2.42, 1.91], [-1.43, 2.17], [1.14, 2.19], [2.59, 2.14],
];
const tunnelLinks = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [2, 8], [8, 7], [3, 9], [9, 10]];
const rooms = [[-1.52, .71, .84, .4], [1.7, .69, .89, .44], [-2.42, 1.91, .91, .51], [2.59, 2.14, .87, .45], [.08, 1.78, .45, .45]];

function soilDistance(x, y) {
  const hill = Math.max(Math.hypot(x / 4.58, (y - .34) / 3.56) - 1, .03 - y);
  let hole = 2;
  for (const [i, j] of tunnelLinks) {
    const [ax, ay] = tunnelJoints[i], [bx, by] = tunnelJoints[j];
    const dx = bx - ax, dy = by - ay;
    const fraction = THREE.MathUtils.clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    hole = Math.min(hole, Math.hypot(x - ax - dx * fraction, y - ay - dy * fraction) - .18);
  }
  for (const [cx, cy, rx, ry] of rooms) {
    hole = Math.min(hole, (Math.hypot((x - cx) / rx, (y - cy) / ry) - 1) * .63);
  }
  return Math.max(hill, -hole + .016 * Math.sin(13 * x + 7 * y));
}

function bankFace(worldX, worldY, worldZ) {
  const positions = [], colors = [];
  const clay = [0x886143, 0xaa7a4a, 0x8f6040, 0xb88757, 0x78523a, 0xc09865, 0x7a5b41].map((value) => new THREE.Color(value));
  const tint = new THREE.Color();
  function triangle(vertices, shade) {
    for (const [x, y, z] of vertices) {
      const band = y + Math.sin(x * .72 + y * .4) * .21 + Math.sin(x * 1.66) * .095;
      const color = clay[THREE.MathUtils.clamp(Math.floor(band / .58), 0, clay.length - 1)];
      tint.copy(color).multiplyScalar(shade * (.9 + Math.sin(x * 45 + y * 33) * .075 + Math.cos(x * 19 - y * 51) * .06));
      positions.push(x, y, z);
      colors.push(tint.r, tint.g, tint.b);
    }
  }
  function clip(vertices) {
    const front = [], edge = [];
    for (let i = 0; i < 3; i++) {
      const [x, y, distance] = vertices[i];
      const [nextX, nextY, nextDistance] = vertices[(i + 1) % 3];
      if (distance <= 0) front.push([x, y, 0]);
      if ((distance <= 0) === (nextDistance <= 0)) continue;
      const part = distance / (distance - nextDistance);
      const vertex = [THREE.MathUtils.lerp(x, nextX, part), THREE.MathUtils.lerp(y, nextY, part), 0];
      front.push(vertex);
      edge.push(vertex);
    }
    for (let i = 1; i < front.length - 1; i++) triangle([front[0], front[i], front[i + 1]], 1);
    if (edge.length === 2) {
      const [a, b] = edge;
      const backA = [a[0], a[1], -.64], backB = [b[0], b[1], -.64];
      triangle([a, b, backB], .7);
      triangle([a, backB, backA], .68);
    }
  }
  const grid = Array.from({ length: 75 }, (_, i) => Array.from({ length: 34 }, (_, j) => {
    const x = -4.85 + i * .131, y = -.14 + j * .13;
    return [x, y, soilDistance(x, y)];
  }));
  for (let i = 0; i < grid.length - 1; i++) {
    for (let j = 0; j < grid[i].length - 1; j++) {
      const a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
      clip([a, b, c]);
      clip([a, c, d]);
    }
  }
  function skirtPoint(x, z) {
    const height = groundHeight(worldX + x, worldZ + z) - worldY - .08;
    return [x, Math.min(.024, height), z];
  }
  for (let i = 0; i < 54; i++) {
    const x1 = -4.56 + i * 9.12 / 54, x2 = -4.56 + (i + 1) * 9.12 / 54;
    const a = [x1, .055, -.012], b = [x2, .055, -.012];
    const c = skirtPoint(x1, .23), d = skirtPoint(x2, .23);
    triangle([a, c, d], .83);
    triangle([a, d, b], .83);
  }
  for (const x of [-4.56, 4.56]) {
    const a = [x, .055, -.012], b = [x, .055, -3.36];
    const c = skirtPoint(x, .23), d = skirtPoint(x, -3.36);
    triangle([a, c, d], .71);
    triangle([a, d, b], .71);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function makeAnt(group, carrying = false) {
  const ant = new THREE.Group();
  ant.name = carrying ? '搬运种子的工蚁' : '穿行蚁道的工蚁';
  group.add(ant);
  solid(ant, sphere, stripe, [-.096, 0, 0], [.094, .064, .071]);
  solid(ant, sphere, matte(0x5b3028), [0, 0, 0], [.06, .052, .049]);
  solid(ant, sphere, matte(0x6e4030), [.084, .004, 0], [.066, .051, .052]);
  const legs = [];
  for (const side of [-1, 1]) {
    for (const x of [-.045, 0, .048]) {
      const leg = new THREE.Group();
      leg.position.set(x, 0, -.009);
      const bend = point(x * 1.4, side * .07, .017);
      branch(leg, point(0, 0, 0), bend, .009, stripe);
      branch(leg, bend, point(x * 2.2 - .026, side * .122, -.015), .007, stripe);
      ant.add(leg);
      legs.push(leg);
    }
    branch(ant, point(.102, side * .026, .02), point(.176, side * .058, .032), .006, stripe);
  }
  if (carrying) {
    const grain = solid(ant, rock, matte(0xd6bb76), [.19, .008, .024], [.058, .041, .035]);
    grain.name = '工蚁携带的种子';
    grain.rotation.z = -.24;
  }
  return { ant, legs };
}

function antBank(group, worldX, worldY, worldZ) {
  const next = seeded(267);
  const back = new THREE.Shape();
  const firstAngle = -.105, lastAngle = Math.PI + .105;
  for (let i = 0; i <= 44; i++) {
    const angle = THREE.MathUtils.lerp(firstAngle, lastAngle, i / 44);
    const x = Math.cos(angle) * 4.565, y = .34 + Math.sin(angle) * 3.54;
    back[i ? 'lineTo' : 'moveTo'](x, y);
  }
  back.closePath();
  const dirtBack = new THREE.ExtrudeGeometry(back, { depth: 2.74, bevelEnabled: false });
  solid(group, dirtBack, matte(0x694831), [0, 0, -3.39], [1, 1, 1]).userData.collidable = true;
  const base = solid(group, new THREE.DodecahedronGeometry(1, 1), matte(0x65774c), [0, -.3, -3.89], [5.4, 3.74, 2.65]);
  base.rotation.y = -.02;
  base.userData.collidable = true;
  solid(group, bankFace(worldX, worldY, worldZ), matte(0xffffff, { vertexColors: true, side: THREE.DoubleSide }), [0, 0, 0], [1, 1, 1]).userData.collidable = true;
  const turf = matte(0x77895a);
  for (let i = 0; i < 29; i++) {
    const x = -4.3 + i * .305;
    const y = .36 + Math.sqrt(1 - (x / 4.58) ** 2) * 3.56;
    if (Math.abs(x + 1.48) < .34) continue;
    solid(group, rock, turf, [x, y - .018, -.13], [.255, .12 + next() * .1, .55]).rotation.z = -.21 * x;
    const height = .17 + next() * .23;
    branch(group, point(x, y, -.2), point(x + (next() - .5) * .26, y + height, -.17), .023, leafGreen);
  }
  for (const x of [-3.27, -.37, 1.13, 3.27]) {
    const y = .35 + Math.sqrt(1 - (x / 4.57) ** 2) * 3.56;
    const bend = point(x + .13, y - .61, .035);
    branch(group, point(x, y - .07, .05), bend, .034, rootBark);
    branch(group, bend, point(x - .17, y - .94, .07), .022, rootBark);
    branch(group, bend, point(x + .34, y - .91, .065), .014, rootBark);
  }
  const chips = [];
  for (let i = 0; i < 90; i++) {
    const x = (next() - .5) * 8.5;
    const y = .2 + next() * 3.62;
    if (soilDistance(x, y) > -.045) continue;
    const size = .026 + next() * .073;
    chips.push({ at: [x, y, .009], size: [size * 1.38, size, size * .45], rotation: [0, 0, next() * TAU], color: next() > .54 ? 0x745441 : 0xd1a36d });
  }
  batch(group, rock, matte(0xffffff), chips);
  const larva = matte(0xf0d39a);
  for (const [cx, cy] of rooms.slice(0, 2)) {
    for (let i = 0; i < 11; i++) {
      const size = .04 + next() * .04;
      solid(group, sphere, larva, [cx + (next() - .5) * 1.05, cy - .1 + next() * .19, -.39], [size * 1.48, size * .66, size]).rotation.z = next() * TAU;
    }
  }
  for (const x of [-4.32, 4.26]) {
    const y = groundHeight(worldX + x, worldZ + .57) - worldY;
    solid(group, rock, matte(0x7d7554), [x, y + .15, .57], [.72, .45, .5]).rotation.z = x;
  }
  const routes = [[0, 1, 2, 8, 7], [5, 4, 3, 9, 10], [2, 3, 4, 6], [7, 8, 2, 3, 4, 5]]
    .map((route) => new THREE.CatmullRomCurve3(route.map((id) => point(...tunnelJoints[id], -.23))));
  const ants = Array.from({ length: 10 }, (_, i) => makeAnt(group, i % 3 === 1));
  const ridgeHeight = (x) => .34 + Math.sqrt(1 - (x / 4.565) ** 2) * 3.54;
  // The open top entrance connects directly to tunnel 0–1, then follows the
  // actual upper rim instead of sending foragers through the solid bank.
  const surfacePoints = [7, 8, 2, 1, 0].map((id) => point(...tunnelJoints[id], -.23));
  surfacePoints.push(point(-1.48, ridgeHeight(-1.48) + .05, -.85));
  for (let x = -1.24; x <= 2.86; x += .24) surfacePoints.push(point(x, ridgeHeight(x) + .05, -.85 - .07 * (x + 1.48)));
  const surfacePath = new THREE.CurvePath();
  for (let i = 1; i < surfacePoints.length; i++) surfacePath.add(new THREE.LineCurve3(surfacePoints[i - 1], surfacePoints[i]));
  const surfaceLength = surfacePath.getLength();
  let entrance = 0;
  for (let i = 1; i <= 4; i++) entrance += surfacePoints[i - 1].distanceTo(surfacePoints[i]);
  entrance /= surfaceLength;
  const rim = entrance + surfacePoints[4].distanceTo(surfacePoints[5]) / surfaceLength;
  const foragers = Array.from({ length: 4 }, (_, i) => {
    const insect = makeAnt(group, i % 2 === 1);
    insect.ant.name = '在巢口与土丘表面往返的工蚁';
    insect.ant.scale.setScalar(.84);
    const progress = THREE.MathUtils.lerp(rim + .06, .94, i / 3);
    insect.ant.position.copy(surfacePath.getPointAt(progress));
    // Separate resting places keep returning workers from stacking at one point.
    return { ...insect, progress, rest: i * .43 / surfaceLength, direction: i % 2 ? -1 : 1, release: 0 };
  });
  const forward = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const side = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const orientation = new THREE.Quaternion();
  let sheltering = false;
  let dryTime = 0;
  const status = { surfaceAntsOutside: 4, surfaceAntsReturning: 0, undergroundAntsActive: ants.length };
  return {
    status,
    update(dt, time, rain) {
      dt = THREE.MathUtils.clamp(dt, 0, .12);
      if (rain > .22) {
        sheltering = true;
        dryTime = 0;
      } else if (rain < .08 && sheltering) {
        dryTime += dt;
        if (dryTime >= 10) {
          sheltering = false;
          foragers.forEach((insect, i) => { insect.release = 1 + i * 2.0; });
        }
      } else if (sheltering) dryTime = 0;
      ants.forEach(({ ant, legs }, i) => {
        const path = routes[i % routes.length];
        const loop = (time * (.11 + i % 3 * .01) + i * .229) % 2;
        const progress = loop <= 1 ? loop : 2 - loop;
        const tangent = path.getTangentAt(progress);
        ant.position.copy(path.getPointAt(progress));
        ant.rotation.z = Math.atan2(tangent.y, tangent.x) + (loop > 1 ? Math.PI : 0);
        legs.forEach((leg, id) => { leg.rotation.z = Math.sin(time * 24 + id * Math.PI + i) * .19; });
      });
      status.surfaceAntsOutside = status.surfaceAntsReturning = 0;
      foragers.forEach((insect, i) => {
        const { ant, legs } = insect;
        if (sheltering) insect.direction = -1;
        else if (insect.progress <= insect.rest + .0001) {
          insect.release -= dt;
          if (insect.release <= 0) insect.direction = 1;
        }
        const moving = insect.progress > insect.rest + .0001 || (!sheltering && insect.release <= 0);
        if (moving) {
          insect.progress = THREE.MathUtils.clamp(insect.progress + dt * (sheltering ? .52 : .36) * insect.direction / surfaceLength, insect.rest, 1);
          if (!sheltering && insect.progress >= 1) insect.direction = -1;
        }
        ant.position.copy(surfacePath.getPointAt(insect.progress));
        forward.copy(surfacePath.getTangentAt(insect.progress)).multiplyScalar(insect.direction);
        const surface = THREE.MathUtils.smoothstep(insect.progress, entrance - .025, rim);
        normal.set(0, surface, 1 - surface).normalize();
        side.crossVectors(normal, forward);
        if (side.lengthSq() < .001) side.set(0, 1, 0);
        side.normalize();
        normal.crossVectors(forward, side).normalize();
        basis.makeBasis(forward, side, normal);
        orientation.setFromRotationMatrix(basis);
        ant.quaternion.slerp(orientation, 1 - Math.exp(-12 * dt));
        legs.forEach((leg, id) => { leg.rotation.z = moving ? Math.sin(time * 24 + id * Math.PI + i) * .19 : 0; });
        ant.userData.rainMode = sheltering ? insect.progress > entrance ? 'return' : 'underground' : moving ? 'forage' : 'rest';
        if (insect.progress > entrance) status.surfaceAntsOutside++;
        if (sheltering && insect.progress > entrance) status.surfaceAntsReturning++;
      });
    },
  };
}

function shoreline(group, clearTrail) {
  const next = seeded(501);
  const waterRim = new THREE.Shape();
  const edges = [];
  for (let i = 0; i < 32; i++) {
    const angle = i * TAU / 32;
    const radius = 1 + .085 * Math.cos(angle * 3) + .035 * Math.sin(angle * 7);
    const x = Math.cos(angle) * 2.78 * radius;
    const z = Math.sin(angle) * 2.16 * radius;
    edges.push([x, z, angle]);
    waterRim[i ? 'lineTo' : 'moveTo'](x, -z);
  }
  waterRim.closePath();
  const basinGeometry = new THREE.ShapeGeometry(waterRim);
  basinGeometry.rotateX(-Math.PI / 2);
  const bottom = matte(0x739282);
  solid(group, basinGeometry, bottom, [0, .025, 0], [1.07, 1, 1.07]);
  const water = solid(group, basinGeometry, matte(0x4ba99c, { roughness: .22, metalness: .08, transparent: true, opacity: .49, depthWrite: false, side: THREE.DoubleSide }), [0, .18, 0], [1, 1, 1]);
  water.renderOrder = 2;
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const geometry = new THREE.RingGeometry(.95, 1, 38);
    geometry.rotateX(-Math.PI / 2);
    const ring = solid(group, geometry, new THREE.MeshBasicMaterial({ color: 0xc8e7c8, transparent: true, depthWrite: false }), [(next() - .5) * 2.6, .251, (next() - .5) * 2.1], [.05, 1, .04]);
    ring.renderOrder = 3;
    rings.push(ring);
  }
  const rocks = [];
  const colors = [0x6c7c70, 0x8c9782, 0x718079, 0x9b9a84, 0x596f68];
  for (const [x, z, angle] of edges) {
    const size = .49 + next() * .47;
    const px = x * 1.09, pz = z * 1.08;
    const y = groundHeight(group.position.x + px, group.position.z + pz) - group.position.y;
    rocks.push({ at: [px, Math.max(.02, y) + next() * .13, pz], size: [size * 1.28, size * .77, size * .85], rotation: [next() * .25, angle + next() * .9, next() * .4], color: colors[Math.floor(next() * colors.length)] });
  }
  for (let i = 0; i < 44; i++) {
    const x = (next() - .5) * 9.6, z = (next() - .5) * 8.0;
    if (Math.hypot(x / 2.9, z / 2.25) < 1.04) continue;
    const size = .14 + next() ** 2 * .54;
    const y = groundHeight(group.position.x + x, group.position.z + z) - group.position.y;
    const stone = { at: [x, y + size * .17, z], size: [size * 1.23, size * .7, size], rotation: [next() * .35, next() * TAU, next() * .35], color: colors[Math.floor(next() * colors.length)] };
    if (!clearTrail(group.position.x + x, group.position.z + z, size * 1.23)) rocks.push(stone);
  }
  batch(group, rock, matte(0xffffff), rocks).userData.collidable = true;
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = TAU * i / 10 + .12;
    const length = i % 2 ? .16 : .49;
    star[i ? 'lineTo' : 'moveTo'](Math.cos(angle) * length, Math.sin(angle) * length);
  }
  star.closePath();
  const starGeometry = new THREE.ExtrudeGeometry(star, { depth: .034, bevelThickness: .012, bevelSize: .016, bevelSegments: 1, steps: 1 });
  starGeometry.rotateX(-Math.PI / 2);
  solid(group, starGeometry, matte(0xe78b62), [.61, .049, .07], [1, 1, 1]).name = '潮池里的海星';
  const algae = [];
  const blade = matte(0x6f8551);
  for (const [x, z] of [[-1.84, .4], [1.43, -.77], [1.55, .87], [-.52, -1.45]]) {
    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(x + (next() - .5) * .31, .04, z + (next() - .5) * .24);
      const size = .105 + next() * .2;
      solid(pivot, sphere, blade, [.006, size * .5, 0], [.028, size * .56, .017]).rotation.z = (next() - .5) * 1.1;
      group.add(pivot);
      algae.push(pivot);
    }
  }
  const crab = new THREE.Group();
  crab.name = '潮池里横走的蟹';
  group.add(crab);
  const crabShell = matte(0xb66648);
  const crabLeg = matte(0x795446);
  const crabLegs = [];
  solid(crab, sphere, crabShell, [0, .073, 0], [.176, .074, .126]);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = -.1 + i * .065;
      const bend = point(side * .185, .09, z - .025);
      const pivot = new THREE.Group();
      crab.add(pivot);
      branch(pivot, point(side * .102, .075, z), bend, .017, crabLeg);
      branch(pivot, bend, point(side * (.24 - i * .009), 0, z - .06), .014, crabLeg);
      crabLegs.push({ pivot, side, phase: i * Math.PI * .85 });
    }
    branch(crab, point(side * .1, .074, .08), point(side * .181, .1, .19), .038, crabShell);
    solid(crab, sphere, crabShell, [side * .196, .104, .196], [.064, .039, .079]).rotation.y = side * .31;
    solid(crab, sphere, stripe, [side * .073, .135, .084], [.022, .026, .024]);
  }
  const crabAgent = createSmallAnimalAgent(crab, {
    home: [group.position.x - 1.41, group.position.y + .156, group.position.z + .63],
    range: 1.15, alert: 2.6, speed: .65, radius: .15, phase: -.6,
  });
  const update = (time, rain, dt, visitor, collision) => {
    water.position.y = .18 + Math.sin(time * .31) * .048;
    rings.forEach((ring, index) => {
      const cycle = (time * (.37 + rain * .48) + index * .27) % 1;
      ring.position.y = water.position.y + .012;
      ring.scale.setScalar(.06 + cycle * .69);
      ring.material.opacity = (1 - cycle) * (.27 + rain * .44);
    });
    algae.forEach((piece, index) => { piece.rotation.z = Math.sin(time * 1.62 + index * .44) * .29; });
    const state = crabAgent.update(dt, time, visitor, collision, rain);
    // A crab travels sideways. The legs quicken only when it actually moves.
    crab.rotation.y -= Math.PI / 2;
    for (const { pivot, side, phase } of crabLegs) {
      pivot.rotation.y = Math.sin(time * (9 + state.fear * 8) + phase + side) * Math.min(.20, state.speed * .3);
      pivot.rotation.z = side * Math.max(0, Math.cos(time * 13 + phase)) * Math.min(.12, state.speed * .2);
    }
  };
  update.crab = crabAgent.state;
  return update;
}

export function createEcology(scene, clearTrail = () => false) {
  const bee = new THREE.Group();
  const ant = new THREE.Group();
  const tide = new THREE.Group();
  bee.name = '蜂巢与采蜜草甸';
  ant.name = '剖开的蚁穴土层';
  tide.name = '礁石潮池';
  bee.position.set(-3, groundHeight(-3, 19), 19);
  ant.position.set(16, Math.max(groundHeight(12, 22), groundHeight(16, 22), groundHeight(20, 22)), 22);
  const tideX = coastlineX(33) - 3.5;
  tide.position.set(tideX, .065, 33);
  scene.add(bee, ant, tide);
  const updateMeadow = meadow(bee, ...bee.position.toArray());
  const updateAntBank = antBank(ant, ...ant.position.toArray());
  const updateShore = shoreline(tide, clearTrail);
  const rainState = { ...updateMeadow.status, ...updateAntBank.status };
  const at = (group, x, y, z) => [group.position.x + x, group.position.y + y, group.position.z + z];
  return {
    observations: [
      {
        id: 'bee', title: '蜂巢与花丛', radius: 8.8, position: at(bee, 0, 1.6, 1.1),
        views: [
          {
            label: '六角蜂房', title: '巢脾上的六角蜂房',
            description: '放大看看蜂房的开口和蜡壁。雨大时蜜蜂会回到树冠下，停留在巢脾前；雨停后再陆续飞出去采蜜。',
            target: at(bee, .035, 2.17, -.53), position: at(bee, -.30, 2.28, 2.03),
            anchor: at(bee, .035, 2.17, .18), minDistance: 1.15, maxDistance: 4.3,
          },
          {
            label: '花丛往返', title: '蜜蜂飞过花丛',
            description: '把视线移到低处，等蜜蜂从花间经过。雨大时它们会飞回树冠下的巢脾，停雨后再陆续回到花丛。',
            target: at(bee, -1.45, 1.05, 2.23), position: at(bee, -2.35, 2.15, 5.65),
            anchor: at(bee, -1.45, 1.43, 2.64), minDistance: 1.35, maxDistance: 5.4,
          },
        ],
      },
      {
        id: 'ant', title: '脚下的蚁穴', radius: 8.2, position: at(ant, 0, 1.5, .7),
        views: [
          {
            label: '土层剖面', title: '蚁道连接着巢室',
            description: '窄窄的蚁道把上方入口和下方巢室连在一起。雨中地表工蚁沿巢口返回，地下工蚁仍在巢室之间活动。',
            target: at(ant, 0, 1.96, -.10), position: at(ant, .26, 2.22, 5.25),
            anchor: at(ant, 0, 1.96, .49), minDistance: 2.4, maxDistance: 7.1,
          },
          {
            label: '工蚁搬运', title: '看工蚁搬着种子走',
            description: '留意头前带着浅黄色小颗粒的工蚁。沿中央蚁道等待一会儿，就能看到搬运的工蚁从连接处经过。',
            target: at(ant, .05, 1.90, -.22), position: at(ant, .20, 2.03, 1.97),
            anchor: at(ant, .05, 1.90, .43), minDistance: .85, maxDistance: 3.7,
          },
          {
            label: '幼虫巢室', title: '下方巢室里的幼虫',
            description: '左下方的巢室里聚着浅色幼虫。把镜头稍微拉近，也能看到巢室边缘和工蚁经过的入口。',
            target: at(ant, -1.52, .71, -.36), position: at(ant, -1.32, 1.08, 1.87),
            anchor: at(ant, -1.52, .86, .44), minDistance: .85, maxDistance: 3.4,
          },
        ],
      },
      {
        id: 'tide', title: '礁石间的潮池', radius: 8.0, position: at(tide, 0, .25, .3),
        views: [
          {
            label: '潮池全景', title: '礁石围成的小水池',
            description: '从上方看看潮池的边缘。池里的水轻轻起伏，海藻在水中摆动，海星和蟹停留在浅水里。',
            target: at(tide, 0, .15, 0), position: at(tide, -.35, 4.05, 3.15),
            anchor: at(tide, 0, .85, 0), minDistance: 2.0, maxDistance: 7.2,
          },
          {
            label: '海星', title: '贴在池底的海星',
            description: '橘色的海星贴在池底。放大后可以看清伸展开的腕，以及浅水下的海藻和石面。',
            target: at(tide, .61, .10, .07), position: at(tide, 1.23, 1.59, 1.78),
            anchor: at(tide, .61, .73, .07), minDistance: .95, maxDistance: 3.7,
          },
          {
            label: '横走的蟹', title: '沿池底活动的小蟹',
            description: '看左侧那只褐红色的蟹。它会沿着池底横走，靠近时可以看见向两侧展开的足和前方的螯。',
            target: at(tide, -1.41, .27, .72), position: at(tide, -1.60, 1.65, 1.93),
            anchor: at(tide, -1.41, .81, .72), minDistance: 1.1, maxDistance: 3.7,
            follow: () => { const p = updateShore.crab.position; return [p.x, p.y + .09, p.z]; },
          },
        ],
      },
    ],
    stops: {
      bee: { target: [-2.7, bee.position.y + 1.63, 19.72], offset: [-2, 2.6, 8.8] },
      ant: { target: [16, ant.position.y + 1.83, 21.97], offset: [.8, 2.5, 9.2] },
      tide: { target: [tideX, tide.position.y + .19, 33], offset: [-4, 5.2, 5.8] },
    },
    rainState,
    crab: updateShore.crab,
    update(dt, time, rain, weather = null, visitor = null, collision = null) {
      const intensity = THREE.MathUtils.clamp(weather?.rain ?? rain, 0, 1);
      updateMeadow.update(dt, time, intensity);
      updateAntBank.update(dt, time, intensity);
      Object.assign(rainState, updateMeadow.status, updateAntBank.status);
      updateShore(time, rain, dt, visitor, collision);
    },
  };
}
