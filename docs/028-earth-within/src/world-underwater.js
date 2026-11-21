import * as THREE from 'three';
import { coastlineX, groundSurfaceHeight, riverCurrentAt, riverSurfaceHeight, riverWidth, riverZ } from './world-terrain.js';
import { seaSurfaceHeight } from './world-tides.js';

const TAU = Math.PI * 2;
const underwaterStops = {
  kelp: { position: [78, -2.3, 31.5], target: [81.5, -3.1, 34.5], swimming: true },
  'reef-deep': { position: [90, -5, 26], target: [93.5, -6.6, 23.4], swimming: true },
};
const swimLane = [[69.6, 34.5], [78, 31.5], [90, 26]];
const beds = [
  [73.5, 25.5, 3.8, 2.4, 16],
  [78.6, 34.2, 4.4, 2.7, 17],
  [81.8, 34.8, 2.2, 1.35, 14],
  [84.2, 27.8, 4.4, 3.0, 26],
  [88.1, 36.6, 3.5, 2.4, 19],
  [86.5, 11.2, 4.5, 3.1, 15],
  [95.4, 25.8, 4.3, 4.0, 13],
  [103.0, 32.5, 5.0, 3.2, 12],
];

const reefPatches = [
  [74.7, 19.7, 2.9, 2.2], [81.5, 29.8, 3.7, 3.1], [88.7, 22.8, 3.1, 2.7],
  [93.8, 18.6, 4.6, 3.7], [98.9, 27.1, 4.8, 3.0], [102.2, 15.6, 4.9, 4.8],
];

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function samplePatch(random, centerX, centerZ, width, length) {
  const angle = random() * TAU;
  const radius = Math.sqrt(random());
  return [centerX + Math.cos(angle) * radius * width, centerZ + Math.sin(angle) * radius * length];
}

function distanceToSwimLane(x, z) {
  let distance = Infinity;
  for (let i = 1; i < swimLane.length; i++) {
    const [startX, startZ] = swimLane[i - 1];
    const [endX, endZ] = swimLane[i];
    const dx = endX - startX;
    const dz = endZ - startZ;
    const progress = THREE.MathUtils.clamp(((x - startX) * dx + (z - startZ) * dz) / (dx * dx + dz * dz), 0, 1);
    distance = Math.min(distance, Math.hypot(x - startX - progress * dx, z - startZ - progress * dz));
  }
  return distance;
}

function seabedRock(scene, random) {
  const rock = new THREE.DodecahedronGeometry(1);
  const material = new THREE.MeshStandardMaterial({ roughness: .95, flatShading: true });
  const instances = new THREE.InstancedMesh(rock, material, reefPatches.length * 12 + 28);
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  let index = 0;

  function place(x, z, size) {
    if (size > .48 && distanceToSwimLane(x, z) < 1.25 + size) return;
    transform.position.set(x, groundSurfaceHeight(x, z) + size * .21, z);
    transform.rotation.set(random() * .72, random() * TAU, random() * .57);
    transform.scale.set(size * (1.11 + random() * .64), size * (.47 + random() * .33), size * (.71 + random() * .50));
    transform.updateMatrix();
    instances.setMatrixAt(index, transform.matrix);
    color.setHSL(.32 + random() * .20, .12 + random() * .19, .22 + random() * .21);
    instances.setColorAt(index++, color);
  }

  for (const patch of reefPatches) {
    for (let i = 0; i < 12; i++) {
      const [x, z] = samplePatch(random, ...patch);
      place(x, z, i < 2 ? .92 + random() * .94 : .22 + random() * .91);
    }
  }
  for (let i = 0; i < 28; i++) {
    const z = 10 + random() * 33;
    place(coastlineX(z) + 1.7 + random() * 8.2, z, .19 + random() * .37);
  }
  instances.count = index;
  instances.name = 'Underwater rock shelves';
  instances.userData.collidable = true;
  scene.add(instances);
}

function kelpForest(scene, random) {
  const positions = [];
  const colors = [];
  const weights = [];
  const indices = [];
  const clock = { value: 0 };
  const stemColors = ['#53603c', '#67613e', '#525832'].map((hex) => new THREE.Color(hex));
  const bladeColors = ['#878b48', '#767341', '#aa8a51', '#9b8b49', '#79864a'].map((hex) => new THREE.Color(hex));
  const holdfast = new THREE.Color('#686455');
  const eelgrass = new THREE.Color('#718c58');
  const color = new THREE.Color();

  function vertex(x, y, z, pigment, weight, tint = 1) {
    positions.push(x, y, z);
    color.copy(pigment).multiplyScalar(tint);
    colors.push(color.r, color.g, color.b);
    weights.push(weight);
  }

  function stem(x, floor, z, height, leanX, leanZ, pigment) {
    const start = positions.length / 3;
    for (let row = 0; row <= 8; row++) {
      const t = row / 8;
      const width = .026 * (1.05 - t * .67);
      for (let j = 0; j < 4; j++) {
        const angle = j * TAU / 4;
        vertex(x + leanX * t * t + Math.cos(angle) * width, floor + height * t,
          z + leanZ * t * t + Math.sin(angle) * width, pigment, t * t * height * .24);
        if (row === 8) continue;
        const a = start + row * 4 + j;
        const b = start + row * 4 + (j + 1) % 4;
        indices.push(a, a + 4, b, b, a + 4, b + 4);
      }
    }
  }

  function bladder(x, y, z, size, pigment, sway) {
    const start = positions.length / 3;
    for (let i = 0; i < 6; i++) {
      const angle = i * TAU / 6;
      vertex(x + Math.cos(angle) * size, y, z + Math.sin(angle) * size, pigment, sway, 1.04);
    }
    vertex(x, y + size * 1.2, z, pigment, sway, 1.15);
    vertex(x, y - size, z, pigment, sway, .77);
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      indices.push(start + i, start + 6, start + next, start + i, start + next, start + 7);
    }
  }

  function blade(x, y, z, angle, length, breadth, sway, pigment) {
    const start = positions.length / 3;
    const forwardX = Math.cos(angle);
    const forwardZ = Math.sin(angle);
    for (let row = 0; row <= 10; row++) {
      const t = row / 10;
      const arch = Math.sin(t * Math.PI);
      const width = breadth * (.025 + arch ** .76 * (.86 + Math.sin(t * 32 + angle) * .13));
      const curl = Math.sin(t * 2.7) * length * .19;
      const centerX = x + forwardX * length * t - forwardZ * curl;
      const centerY = y + (Math.sin(t * 2.15) * .35 + t * .26 + Math.sin(t * 11.2 + angle) * arch * .05) * length;
      const centerZ = z + forwardZ * length * t + forwardX * curl;
      const weight = sway + t * length * .21;
      const twist = Math.sin(t * 5.2 + angle) * width * .65;
      vertex(centerX - forwardZ * width, centerY + twist - width * .19, centerZ + forwardX * width, pigment, weight, .80);
      vertex(centerX, centerY + width * .17, centerZ, pigment, weight, 1.10);
      vertex(centerX + forwardZ * width, centerY - twist - width * .19, centerZ - forwardX * width, pigment, weight, .88);
      if (row === 10) continue;
      const i = start + row * 3;
      indices.push(i, i + 3, i + 1, i + 1, i + 3, i + 4, i + 1, i + 4, i + 2, i + 2, i + 4, i + 5);
    }
  }

  for (const [centerX, centerZ, width, length, count] of beds) {
    for (let i = 0; i < count; i++) {
      const [x, z] = samplePatch(random, centerX, centerZ, width, length);
      if (distanceToSwimLane(x, z) < 1.65) continue;
      const floor = groundSurfaceHeight(x, z) - .055;
      const height = Math.min(-floor - .59, 1.35 + random() * 3.1);
      if (height < .68) continue;
      const leanX = .12 + random() * .57;
      const leanZ = (random() - .55) * .72;
      const pigment = bladeColors[Math.floor(random() * bladeColors.length)];
      bladder(x, floor + .06, z, .085 + height * .024, holdfast, 0);
      stem(x, floor, z, height, leanX, leanZ, stemColors[i % stemColors.length]);
      const bladeCount = Math.ceil(4 + height * 2.3);
      const phase = random() * TAU;
      for (let j = 0; j < bladeCount; j++) {
        const t = .15 + .77 * j / (bladeCount - 1);
        const length = Math.min(.30 + (1 - t * .33) * height * (.24 + random() * .12), (-floor - height * t - .18) / .60);
        const baseX = x + leanX * t * t;
        const baseZ = z + leanZ * t * t;
        const baseY = floor + height * t;
        const weight = t * t * height * .24;
        bladder(baseX, baseY, baseZ, .031 + length * .014, pigment, weight);
        blade(baseX, baseY, baseZ, phase + j * 2.39, length, .035 + length * (.057 + random() * .046), weight, pigment);
      }
    }
  }

  // Short ribbon grasses separate the entry shallows from the taller kelp beds.
  for (let i = 0; i < 75; i++) {
    const z = 12 + random() * 31;
    const x = coastlineX(z) + 1.9 + random() * 8.5;
    if (distanceToSwimLane(x, z) < 1.45) continue;
    const floor = groundSurfaceHeight(x, z);
    if (floor > -.39) continue;
    for (let j = 0; j < 5; j++) {
      const angle = j * TAU / 5 + random() * .8;
      const reach = .15 + random() * .32;
      const height = Math.min(-floor - .09, .27 + random() * .39);
      const start = positions.length / 3;
      for (let row = 0; row <= 5; row++) {
        const t = row / 5;
        const width = .015 * (1 - .92 * t ** 2);
        const bx = x + Math.cos(angle) * reach * t ** 1.85;
        const bz = z + Math.sin(angle) * reach * t ** 1.85;
        vertex(bx - Math.sin(angle) * width, floor + height * t, bz + Math.cos(angle) * width, eelgrass, t * t * .16);
        vertex(bx + Math.sin(angle) * width, floor + height * t, bz - Math.cos(angle) * width, eelgrass, t * t * .16, .77);
        if (row < 5) {
          const index = start + row * 2;
          indices.push(index, index + 2, index + 1, index + 1, index + 2, index + 3);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSway', new THREE.Float32BufferAttribute(weights, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide, roughness: .68, emissive: 0x48553b, emissiveIntensity: .24,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uKelpTime = clock;
    shader.vertexShader = `attribute float aSway; uniform float uKelpTime;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float push = uKelpTime * 1.42 + position.x * 0.31 + position.z * 0.19;
      transformed.x += aSway * (sin(push) * 0.29 + sin(push * 0.64) * 0.11);
      transformed.z += aSway * sin(push * 0.78 - 1.2) * 0.28;
    `);
  };
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Kelp leaves bending in the current';
  scene.add(mesh);
  return clock;
}

function seabedLife(scene, random) {
  const bodyGeometry = new THREE.IcosahedronGeometry(1, 1);
  const branches = new THREE.CapsuleGeometry(.065, .78, 2, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ roughness: .76, flatShading: true });
  const tentacleMaterial = new THREE.MeshStandardMaterial({ roughness: .72, flatShading: true });
  const count = reefPatches.length * 8;
  const colonies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, count);
  const tentacles = new THREE.InstancedMesh(branches, tentacleMaterial, count * 9);
  const transform = new THREE.Object3D();
  const pink = new THREE.Color('#bd6952');
  const gold = new THREE.Color('#d9955b');
  const lavender = new THREE.Color('#ad748e');
  const branchColor = new THREE.Color();
  const color = new THREE.Color();
  const direction = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let index = 0;
  let tentacle = 0;

  for (const patch of reefPatches) {
    for (let i = 0; i < 8; i++) {
      const [x, z] = samplePatch(random, ...patch);
      const y = groundSurfaceHeight(x, z);
      const size = .26 + random() * .34;
      color.copy(i % 3 === 0 ? lavender : pink).lerp(gold, random() * .54);
      transform.position.set(x, y + size * .47, z);
      transform.rotation.set(0, random() * TAU, 0);
      transform.scale.set(size * .89, size * .55, size * .89);
      transform.updateMatrix();
      colonies.setMatrixAt(index, transform.matrix);
      colonies.setColorAt(index++, color);
      for (let j = 0; j < 9; j++) {
        const angle = j * TAU / 9 + random() * .35;
        const spread = .31 + random() * .51;
        const length = size * (.52 + random() * .67);
        direction.set(Math.cos(angle) * spread, .7 + random() * .3, Math.sin(angle) * spread).normalize();
        transform.position.set(x + direction.x * length * .55, y + size * .76 + direction.y * length * .35, z + direction.z * length * .55);
        transform.quaternion.setFromUnitVectors(up, direction);
        transform.scale.set(size * .73, length, size * .73);
        transform.updateMatrix();
        tentacles.setMatrixAt(tentacle, transform.matrix);
        tentacles.setColorAt(tentacle++, branchColor.copy(color).lerp(gold, .22 + random() * .4));
      }
    }
  }
  colonies.name = 'Rock pool sponges and anemones';
  tentacles.name = 'Anemone crowns';
  scene.add(colonies, tentacles);

  const shellGeometry = new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, Math.PI / 2);
  const shellColors = new Float32Array(shellGeometry.attributes.position.count * 3);
  const shellPoints = shellGeometry.attributes.position;
  for (let i = 0; i < shellPoints.count; i++) {
    const x = shellPoints.getX(i);
    const z = shellPoints.getZ(i);
    const ray = Math.atan2(z, x);
    const ridge = Math.cos(ray * 10);
    const width = 1 + ridge * .085;
    shellPoints.setXYZ(i, x * width * .71, shellPoints.getY(i) * (.34 + ridge * .035), z * width);
    color.setHSL(.091, .28, .79 + ridge * .094).toArray(shellColors, i * 3);
  }
  shellGeometry.setAttribute('color', new THREE.BufferAttribute(shellColors, 3));
  shellGeometry.computeVertexNormals();
  const shells = new THREE.InstancedMesh(shellGeometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .62 }), 46);
  for (let i = 0; i < shells.count; i++) {
    const z = i < 8 ? 31.4 + random() * 2 : 17 + random() * 22;
    const x = i < 8 ? 72.1 + random() * 4.3 : coastlineX(z) + 3.2 + random() * 25;
    transform.position.set(x, groundSurfaceHeight(x, z) + .025, z);
    transform.rotation.set(0, random() * TAU, 0);
    transform.scale.setScalar(.12 + random() * .22);
    transform.updateMatrix();
    shells.setMatrixAt(i, transform.matrix);
  }
  shells.name = 'Ribbed shells along the seabed';
  scene.add(shells);
}

function rockUrchins(scene, random) {
  const anchors = [[71.5, 31.0], [73.6, 35.1], [76.2, 30.8], [79.6, 27.8], [82.9, 32.9], [91.1, 20.8], [92.7, 23.4]];
  const stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1),
    new THREE.MeshStandardMaterial({ color: '#696c63', roughness: .96, flatShading: true }), anchors.length);
  const bodies = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 9, 6),
    new THREE.MeshStandardMaterial({ color: '#403640', roughness: .87 }), anchors.length);
  const spikes = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#503e52', roughness: .88, flatShading: true }), anchors.length * 34);
  const transform = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const color = new THREE.Color();
  anchors.forEach(([x, z], index) => {
    const y = groundSurfaceHeight(x, z);
    const size = .094 + random() * .047;
    transform.position.set(x, y + .03, z);
    transform.rotation.set(0, random() * TAU, 0);
    transform.scale.set(.38 + random() * .19, .22, .31 + random() * .17);
    transform.updateMatrix();
    stones.setMatrixAt(index, transform.matrix);
    transform.position.y = y + .26;
    transform.scale.set(size, size * .72, size);
    transform.updateMatrix();
    bodies.setMatrixAt(index, transform.matrix);
    bodies.setColorAt(index, color.setHSL(.74 + random() * .08, .25, .42 + random() * .35));
    for (let i = 0; i < 34; i++) {
      const azimuth = i * 2.39996;
      const elevation = -.14 + i * (1.10 / 34);
      const radial = Math.sqrt(1 - elevation * elevation);
      direction.set(Math.cos(azimuth) * radial, elevation, Math.sin(azimuth) * radial);
      const length = .048 + random() * .062;
      transform.position.set(x, y + .26, z).addScaledVector(direction, size * .79 + length * .43);
      transform.quaternion.setFromUnitVectors(up, direction);
      transform.scale.set(.009, length, .009);
      transform.updateMatrix();
      spikes.setMatrixAt(index * 34 + i, transform.matrix);
    }
  });
  bodies.name = 'Sea urchins attached to rocky surfaces';
  scene.add(stones, bodies, spikes);
}

function deepReef(scene, random) {
  const ledgeGroup = new THREE.Group();
  ledgeGroup.name = 'Layered reef ledge and animals';
  scene.add(ledgeGroup);

  const rock = new THREE.DodecahedronGeometry(1, 0);
  const vertices = rock.attributes.position;
  const rockColor = new Float32Array(vertices.count * 3);
  const slate = new THREE.Color('#536d6a');
  const sediment = new THREE.Color('#8c9681');
  const color = new THREE.Color();
  for (let i = 0; i < vertices.count; i++) {
    const y = vertices.getY(i);
    const layer = THREE.MathUtils.smoothstep(Math.cos(y * 14 + vertices.getX(i) * 1.4), .1, .78);
    color.copy(slate).lerp(sediment, layer * .57 + Math.max(0, y) * .19).toArray(rockColor, i * 3);
  }
  rock.setAttribute('color', new THREE.BufferAttribute(rockColor, 3));
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .91 });
  const slabs = [
    [92.15, 23.35, 1.35, 1.40, .98], [93.7, 22.9, 1.78, 1.78, 1.31],
    [94.7, 24.0, 1.25, 1.16, .84], [91.6, 22.35, 1.06, 1.06, .81],
    [93.3, 24.17, 1.10, .95, .65], [95.3, 22.95, .96, 1.25, 1.17],
    [91.1, 22.95, .65, .57, .45], [94.0, 24.9, .74, .68, .45],
  ].map(([x, z, sx, sy, sz], index) => {
    const mesh = new THREE.Mesh(rock, material);
    mesh.position.set(x, groundSurfaceHeight(x, z) + sy * .70, z);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(.06 + random() * .19, .22 + index * .58, -.28 + random() * .18);
    mesh.userData.collidable = true;
    ledgeGroup.add(mesh);
    mesh.updateMatrixWorld();
    return mesh;
  });

  const ray = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
  function surfaceAt(x, z) {
    ray.ray.origin.set(x, -2, z);
    return ray.intersectObjects(slabs, false)[0]?.point.y ?? groundSurfaceHeight(x, z);
  }

  const colonies = [[91.8, 23.58], [92.21, 23.14], [92.55, 23.45], [93.52, 23.1], [93.88, 22.8],
    [94.36, 23.05], [93.2, 24.07], [93.67, 24.08], [94.48, 24.28], [94.84, 24.0], [91.39, 22.88]];
  const columnMaterial = new THREE.MeshStandardMaterial({ roughness: .76 });
  const columns = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), columnMaterial, colonies.length);
  const stem = new THREE.Object3D();
  const pigments = ['#d39d62', '#b47875', '#a384a1', '#c88c6b'].map((hex) => new THREE.Color(hex));
  const positions = [];
  const colors = [];
  const weights = [];
  const indices = [];
  const clock = { value: 0 };
  colonies.forEach(([x, z], index) => {
    const radius = .10 + random() * .11;
    const y = surfaceAt(x, z);
    const pigment = pigments[index % pigments.length];
    stem.position.set(x, y + radius * .51, z);
    stem.scale.set(radius * .70, radius, radius * .7);
    stem.updateMatrix();
    columns.setMatrixAt(index, stem.matrix);
    columns.setColorAt(index, pigment);
    const start = positions.length / 3;
    for (let strand = 0; strand < 14; strand++) {
      const angle = strand * TAU / 14;
      const directionX = Math.cos(angle);
      const directionZ = Math.sin(angle);
      const length = radius * (.88 + random() * .85);
      const first = start + strand * 28;
      for (let row = 0; row <= 6; row++) {
        const t = row / 6;
        const spread = radius * .42 + length * t ** 1.6;
        const tube = radius * (.12 - t * .095);
        const height = y + radius * 1.33 + length * Math.sin(t * 1.71) * .53;
        for (let side = 0; side < 4; side++) {
          const ring = side * TAU / 4;
          positions.push(x + directionX * spread - directionZ * Math.sin(ring) * tube,
            height + Math.cos(ring) * tube, z + directionZ * spread + directionX * Math.sin(ring) * tube);
          color.copy(pigment).multiplyScalar(.75 + .50 * t);
          colors.push(color.r, color.g, color.b);
          weights.push(t * t * length);
          if (row === 6) continue;
          const a = first + row * 4 + side;
          const b = first + row * 4 + (side + 1) % 4;
          indices.push(a, b, a + 4, b, b + 4, a + 4);
        }
      }
    }
  });
  ledgeGroup.add(columns);

  const fronds = new THREE.BufferGeometry();
  fronds.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fronds.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  fronds.setAttribute('aFlex', new THREE.Float32BufferAttribute(weights, 1));
  fronds.setIndex(indices);
  fronds.computeVertexNormals();
  const frondMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .72 });
  frondMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uReefTime = clock;
    shader.vertexShader = `attribute float aFlex; uniform float uReefTime;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float phase = position.x * 2.1 + position.z + uReefTime * 1.45;
      transformed.x += aFlex * sin(phase) * .19;
      transformed.z += aFlex * cos(phase * 1.23) * .13;`);
  };
  ledgeGroup.add(new THREE.Mesh(fronds, frondMaterial));

  const outline = new THREE.Shape();
  for (let i = 0; i < 20; i++) {
    const angle = i * TAU / 20;
    const radius = [1, .60, .31, .60][i % 4];
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (i === 0) outline.moveTo(x, z);
    else outline.lineTo(x, z);
  }
  outline.closePath();
  const star = new THREE.ExtrudeGeometry(outline, { depth: .10, bevelSize: .068, bevelThickness: .065, bevelSegments: 2 });
  star.rotateX(-Math.PI / 2);
  const starMaterials = ['#be745f', '#a9895d', '#bf8772'].map((color) => new THREE.MeshStandardMaterial({ color, roughness: .81 }));
  [[91.73, 23.82, .28], [92.62, 23.05, .34], [94.07, 23.24, .31]].forEach(([x, z, size], index) => {
    const specimen = new THREE.Mesh(star, starMaterials[index]);
    specimen.position.set(x, surfaceAt(x, z) + .021, z);
    const nx = (surfaceAt(x - .08, z) - surfaceAt(x + .08, z)) / .16;
    const nz = (surfaceAt(x, z - .08) - surfaceAt(x, z + .08)) / .16;
    const normal = new THREE.Vector3(THREE.MathUtils.clamp(nx, -.55, .55), 1,
      THREE.MathUtils.clamp(nz, -.55, .55)).normalize();
    specimen.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    specimen.rotateY(index * 1.17);
    specimen.scale.setScalar(size);
    ledgeGroup.add(specimen);
  });
  return clock;
}

function causticLight(scene) {
  const width = 70;
  const length = 69;
  const geometry = new THREE.PlaneGeometry(width, length, 86, 81);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) + 90;
    const z = positions.getZ(i) + 15.5;
    positions.setXYZ(i, x, groundSurfaceHeight(x, z) + .044, z);
  }
  const clock = { value: 0 };
  const submersion = { value: 0 };
  const mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uTime: clock, uSubmersion: submersion },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      #include <fog_pars_vertex>
      void main() {
        vWorld = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform float uTime;
      uniform float uSubmersion;
      #include <fog_pars_fragment>

      float speck(vec2 p) {
        return fract(sin(dot(p, vec2(97.9, 183.3))) * 41628.4);
      }

      void main() {
        vec2 p = vWorld.xz;
        float depth = max(0.0, -vWorld.y);
        float bounds = smoothstep(55.0, 66.0, vWorld.x) * (1.0 - smoothstep(108.0, 125.0, vWorld.x));
        bounds *= smoothstep(-19.0, -3.0, vWorld.z) * (1.0 - smoothstep(38.0, 50.0, vWorld.z));
        float sediment = sin(p.x * .88 + sin(p.y * .34) * 2.4) * cos(p.y * .53 - p.x * .19);
        float phase = dot(p, vec2(9.0, 2.6)) + sin(p.y * 1.74) * .72 + sin(p.x * .81 - p.y * .86) * 1.55;
        float ripple = cos(phase) * .052 + pow(max(0.0, sin(phase)), 7.0) * .040;
        float viewRange = length(cameraPosition - vWorld);
        float grain = (speck(floor(p * 19.0)) - .5) * (1.0 - smoothstep(2.0, 7.0, viewRange)) * .031;
        vec3 sand = mix(vec3(.285, .312, .221), vec3(.131, .250, .229), smoothstep(1.8, 11.0, depth));
        sand *= .93 + sediment * .09 + ripple * (1.0 - smoothstep(12.0, 23.0, viewRange)) + grain;

        float wobble = sin(p.x * .69 - p.y * .71 + uTime * .67) * .71;
        float arcA = sin(p.x * 2.15 + p.y * .73 + sin(p.y * 1.71 - uTime * 1.1) * 1.26 + wobble + uTime * 1.38);
        float arcB = sin(p.y * 2.63 - p.x * .91 + sin(p.x * 1.61 + uTime * .93) * 1.1 + wobble - uTime * .89);
        float arcC = sin(p.x * 1.27 - p.y * 1.19 + cos(p.y * .97 + p.x * 1.13) * 1.33 + uTime * .69);
        float glimmer = pow(1.0 - min(abs(arcA), abs(arcB)), 14.0) * (.23 + .65 * abs(arcC));
        float focused = (1.0 - smoothstep(1.4, 11.0, depth)) * (1.0 - smoothstep(10.0, 27.0, viewRange));
        sand += vec3(.26, .33, .25) * glimmer * focused * uSubmersion * .62;
        float opacity = smoothstep(.10, .95, depth) * bounds * (.67 + uSubmersion * .29);
        gl_FragColor = vec4(sand, opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  }));
  mesh.renderOrder = 2;
  mesh.name = 'Sand ripples and soft sunlight on the shallows';
  scene.add(mesh);
  return { clock, submersion };
}

function suspendedParticles(scene, random, river = false) {
  const count = river ? 320 : 430;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const origins = [];
  const current = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    if (river) {
      origins.push([-46 + random() * 105, (random() * 2 - 1) * .66, random(), random() * TAU]);
      sizes[i] = 4 + random() * 6;
    } else {
      const z = -7 + random() * 54;
      const x = coastlineX(z) + 4 + random() * 53;
      const y = THREE.MathUtils.lerp(groundSurfaceHeight(x, z) + .42, -.38, random());
      origins.push([x, z, y, random() * TAU]);
      sizes[i] = 9 + random() * 14;
    }
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const dust = new THREE.Points(geometry, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSize;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float depth = -mv.z;
        vAlpha = smoothstep(.35, 2.0, depth) * (1.0 - smoothstep(9.0, 25.0, depth));
        gl_PointSize = clamp(aSize / max(depth, .8), 1.25, 4.8);
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float softEdge = 1.0 - smoothstep(.13, .48, distance(gl_PointCoord, vec2(.5)));
        gl_FragColor = vec4(.52, .67, .51, softEdge * vAlpha * .47);
        #include <colorspace_fragment>
      }`,
  }));
  dust.name = river ? '顺流漂移的水下颗粒' : 'Suspended particles drifting below the surface';
  dust.frustumCulled = false;
  dust.renderOrder = 6;
  dust.visible = false;
  scene.add(dust);
  return {
    mesh: dust,
    update(time, dt, runoff = 0) {
      for (let i = 0; i < count; i++) {
        const [x, cross, height, phase] = origins[i];
        const index = i * 3;
        if (river) {
          const z = riverZ(x) + cross * riverWidth(x);
          const surface = riverSurfaceHeight(x);
          const floor = groundSurfaceHeight(x, z);
          const y = THREE.MathUtils.lerp(surface - .23, floor + .18, height);
          riverCurrentAt(x, z, floor, surface - y, current, runoff);
          const nextX = x + current.x * dt;
          origins[i][0] = nextX > 82 ? -46 : nextX < -46 ? 81.9 : nextX;
          positions[index] = x;
          positions[index + 1] = y + Math.sin(time * .54 + phase) * .065;
          positions[index + 2] = z + Math.cos(time * .31 + phase) * .10;
        } else {
          const floor = groundSurfaceHeight(x, cross);
          riverCurrentAt(x, cross, floor, seaSurfaceHeight() - height, current, runoff);
          origins[i][0] += current.x * (dt ?? 0) * .8;
          origins[i][1] += current.z * (dt ?? 0) * .8;
          positions[index] = x + Math.sin(time * .42 + phase) * .6;
          positions[index + 1] = Math.min(seaSurfaceHeight() - .18, Math.max(floor + .12, height + Math.sin(time * .54 + phase * 1.4) * .19));
          positions[index + 2] = cross + Math.cos(time * .31 + phase) * .42;
        }
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}

export function createUnderwater(scene) {
  const random = seededRandom(433961);
  seabedRock(scene, random);
  const kelpClock = kelpForest(scene, random);
  seabedLife(scene, random);
  rockUrchins(scene, random);
  const reefClock = deepReef(scene, random);
  const caustic = causticLight(scene);
  const particles = suspendedParticles(scene, random);
  const riverParticles = suspendedParticles(scene, seededRandom(43109), true);
  const landmark = [83, -2.75, 33.4];
  return {
    landmark,
    entry: { position: [70.6, -1.64, 34], target: [83, -3.35, 29.3], swimming: true },
    stops: underwaterStops,
    update(dt, time, depth, camera, weather = null) {
      kelpClock.value = time;
      reefClock.value = time;
      caustic.clock.value = time;
      caustic.submersion.value = THREE.MathUtils.smoothstep(depth, .08, .46) * (1 - .8 * (weather?.rain ?? 0));
      particles.mesh.visible = depth > .10 && camera.position.x > 58;
      riverParticles.mesh.visible = depth > .10 && camera.position.x <= 58;
      if (particles.mesh.visible) particles.update(time, dt, weather?.runoff ?? 0);
      if (riverParticles.mesh.visible) riverParticles.update(time, dt, weather?.runoff ?? 0);
    },
  };
}
