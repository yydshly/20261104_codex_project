import * as THREE from 'three';

const VERTICAL = new THREE.Vector3(0, 1, 0);
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const cableGeometry = new THREE.CylinderGeometry(0.023, 0.023, 1, 6);

function metal(color, roughness = 0.68) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.42, roughness });
}

function glow(color, intensity = 1.0) {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.6,
  });
}

function box(parent, material, x, y, z, width, height, depth) {
  const mesh = new THREE.Mesh(unitBox, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(width, height, depth);
  parent.add(mesh);
  return mesh;
}

function bevelPlate(parent, material, width, height, depth, x, y, z, radius = 0.075) {
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, curveSegments: 3, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.018, bevelThickness: 0.018,
  });
  geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function labelMaterial(text, background, color, width = 256) {
  if (typeof document === 'undefined') return glow(color, 0.42);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return glow(color, 0.42);
  context.fillStyle = background;
  context.fillRect(0, 0, width, 64);
  context.fillStyle = color;
  context.font = 'bold 35px Bahnschrift, "Microsoft YaHei", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, width / 2, 34, width - 12);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

export function createCableCar() {
  const car = new THREE.Group();
  const orange = metal(0xdf6843, 0.39);
  const dark = metal(0x141f2b, 0.49);
  const cream = metal(0xdfccb5, 0.48);
  const trim = metal(0x608191, 0.5);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x54889b, roughness: 0.24, metalness: 0.29, transparent: true, opacity: 0.55, depthWrite: false,
  });
  const cabinGlow = glow(0xffb16b, 1.3);
  const whiteLamp = glow(0xffdfbb, 1.75);
  const brakeLamp = glow(0xff5e47, 2.05);
  const unitLabel = labelMaterial('HARBOR 07', '#192937', '#ffe4b9');

  bevelPlate(car, dark, 2.52, 0.2, 1.32, 0, -0.594, 0);
  bevelPlate(car, orange, 2.6, 0.43, 1.34, 0, -0.402, 0, 0.115);
  bevelPlate(car, cream, 2.6, 0.18, 1.35, 0, 0.613, 0);
  bevelPlate(car, dark, 2.47, 0.14, 1.3, 0, 0.49, 0);
  box(car, cream, 0, -0.187, 0, 2.57, 0.082, 1.381);

  // Build the shell from separate glazing and pillars so the cabin reads from each side.
  for (const direction of [-1, 1]) {
    const side = direction * 0.66;
    const facing = direction === 1 ? 0 : Math.PI;
    const fascia = box(car, unitLabel, 0, -0.37, direction * 0.685, 0.63, 0.16, 0.014);
    if (direction < 0 && unitLabel.map) {
      const rear = new THREE.Mesh(new THREE.PlaneGeometry(0.63, 0.16), unitLabel);
      rear.position.set(0, -0.37, -0.694);
      rear.rotation.y = facing;
      car.add(rear);
      fascia.visible = false;
    }
    for (const x of [-0.85, 0, 0.85]) {
      const pane = box(car, glass, x, 0.146, side, 0.76, 0.61, 0.025);
      pane.renderOrder = 2;
      box(car, trim, x, -0.151, side * 1.024, 0.76, 0.025, 0.025);
      box(car, cabinGlow, x, 0.438, side * 0.89, 0.64, 0.03, 0.035);
      const reflection = box(car, new THREE.MeshBasicMaterial({
        color: 0xbcdff2, transparent: true, opacity: 0.25, depthWrite: false,
      }), x - 0.23, 0.205, side * 1.025, 0.04, 0.41, 0.012);
      reflection.rotation.z = -0.31;
      reflection.renderOrder = 3;
      if (direction === 1) {
        pane.userData.frontGlazing = true;
        reflection.userData.frontGlazing = true;
        if (x === 0) {
          pane.name = 'speed-exit-glass';
          reflection.name = 'speed-exit-reflection';
        }
      }
    }
    for (const x of [-1.24, -0.42, 0.42, 1.24]) {
      box(car, dark, x, 0.16, side, 0.073, 0.67, 0.077).castShadow = true;
    }
    for (const x of [-0.93, 0.93]) {
      box(car, dark, x, -0.49, side * 1.02, 0.36, 0.08, 0.024);
      box(car, cabinGlow, x, -0.49, side * 1.041, 0.23, 0.018, 0.012);
    }
    box(car, dark, 0, -0.093, direction * 0.43, 2.08, 0.115, 0.31);
    box(car, orange, 0, 0.057, direction * 0.495, 1.95, 0.19, 0.105);
  }

  for (const xDirection of [-1, 1]) {
    const x = xDirection * 1.237;
    box(car, glass, x, 0.17, 0, 0.043, 0.60, 1.22).renderOrder = 2;
    box(car, dark, xDirection * 1.27, 0.16, 0, 0.078, 0.67, 0.056);
    box(car, dark, xDirection * 1.287, -0.452, 0, 0.075, 0.182, 1.247);
    for (const z of [-0.465, 0.465]) {
      box(car, cream, xDirection * 1.331, -0.429, z, 0.03, 0.137, 0.22);
      box(car, xDirection > 0 ? whiteLamp : brakeLamp, xDirection * 1.351, -0.419, z, 0.022, 0.066, 0.156);
    }
  }

  box(car, trim, 0, 0.737, 0, 0.59, 0.087, 0.57).castShadow = true;
  box(car, dark, 0, 0.979, 0, 0.17, 0.44, 0.177).castShadow = true;
  box(car, trim, 0, 1.343, 0, 0.25, 0.45, 0.12).rotation.z = -0.24;
  box(car, dark, 0, 1.569, 0, 0.59, 0.077, 0.18);
  const rollerGeometry = new THREE.CylinderGeometry(0.086, 0.086, 0.18, 12);
  for (const x of [-0.214, 0.214]) {
    const roller = new THREE.Mesh(rollerGeometry, trim);
    roller.position.set(x, 1.579, 0);
    roller.rotation.x = Math.PI / 2;
    car.add(roller);
  }
  return car;
}

function boxBatch() {
  const instances = new Map();
  const transform = new THREE.Object3D();
  return {
    add(material, x, y, z, width, height, depth) {
      if (!instances.has(material)) instances.set(material, []);
      transform.position.set(x, y, z);
      transform.scale.set(width, height, depth);
      transform.updateMatrix();
      instances.get(material).push(transform.matrix.clone());
    },
    mount(parent, shadowMaterials) {
      for (const [material, matrices] of instances) {
        const mesh = new THREE.InstancedMesh(unitBox, material, matrices.length);
        matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
        mesh.castShadow = shadowMaterials.has(material);
        mesh.receiveShadow = mesh.castShadow;
        parent.add(mesh);
      }
    },
  };
}

function reflectionTexture() {
  const size = 48;
  const pixels = new Uint8Array(size * size * 4);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const index = 4 * (row * size + column);
      const x = (column + 0.5) / size * 2 - 1;
      const y = (row + 0.5) / size * 2 - 1;
      const edge = Math.max(0, 1 - Math.hypot(x, y));
      const bands = 0.57 + 0.43 * Math.sin(row * 1.44 + column * 0.4) ** 2;
      pixels.set([255, 255, 255, 255 * edge ** 1.6 * bands], index);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function addGroundReflection(city, texture, color, x, z, width, depth, opacity, y = 0.022) {
  const material = new THREE.MeshBasicMaterial({
    color, map: texture, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const reflection = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  reflection.position.set(x, y, z);
  reflection.rotation.x = -Math.PI / 2;
  city.add(reflection);
}

export function createCity(scene) {
  const city = new THREE.Group();
  scene.add(city);
  const batch = boxBatch();
  const road = metal(0x182430, 0.45);
  const sidewalk = metal(0x23303a, 0.68);
  const ledge = metal(0x384751);
  const buildingMaterials = [0x1a2b3d, 0x182436, 0x242437, 0x223442, 0x282c3a].map(color => metal(color));
  const roof = metal(0x101c2b, 0.55);
  const tower = metal(0x374d57, 0.52);
  const towerDark = metal(0x202c39, 0.43);
  const marking = metal(0x8a7d62, 0.67);
  const trafficPaint = metal(0x545c64, 0.63);
  const darkWindow = metal(0x111c2d, 0.4);
  const cyan = glow(0x54b3c9, 0.8);
  const amber = glow(0xeaa268, 0.95);
  const lavender = glow(0x7269c3, 0.85);
  const blue = glow(0x315f8a, 0.53);
  const red = glow(0xfa6557, 1.2);
  const safety = metal(0xa47a4b);
  const streetText = labelMaterial('海港线 / HARBOR LINE', '#182534', '#8cf6ff', 512);
  const towerText = labelMaterial('07', '#25374a', '#ffbc8e', 128);
  const reflections = reflectionTexture();

  box(city, road, 0, -0.11, 1, 63, 0.22, 47).receiveShadow = true;
  batch.add(sidewalk, 0, -0.025, -5.1, 61, 0.1, 5.2);
  batch.add(sidewalk, 0, -0.017, 8.1, 61, 0.11, 4.9);
  batch.add(ledge, 0, 0.03, -2.5, 61, 0.086, 0.19);
  batch.add(ledge, 0, 0.03, 5.72, 61, 0.086, 0.19);
  for (let x = -23; x <= 23; x += 2.4) {
    batch.add(marking, x, 0.006, 1.84, 1.26, 0.012, 0.071);
    batch.add(trafficPaint, x, 0.006, -1.98, 1.86, 0.012, 0.025);
    batch.add(trafficPaint, x, 0.006, 5.23, 1.86, 0.012, 0.025);
    batch.add(roof, x, 0.025, -4.2, 0.016, 0.01, 3.22);
    batch.add(roof, x, 0.035, 7.77, 0.016, 0.01, 4.02);
  }
  for (const crossing of [-8.8, 8.8]) {
    for (let z = -1.55; z < 5.4; z += 0.53) {
      batch.add(trafficPaint, crossing, 0.007, z, 1.24, 0.014, 0.26);
    }
  }

  const skyline = [
    [-22, -9.1, 4.0, 9.3, 3.8], [-17.6, -7.9, 4.0, 6.3, 3.8],
    [-13.1, -7.4, 3.8, 7.8, 3.1], [-8.9, -7.1, 3.6, 4.6, 3.4],
    [-4.8, -9.2, 4.1, 7.0, 4.0], [-0.35, -8.1, 4.1, 4.3, 3.6],
    [3.9, -8.9, 3.5, 6.1, 3.4], [8.0, -7.2, 3.9, 4.9, 3.6],
    [12.5, -7.8, 4.5, 8.3, 4.2], [17.2, -8.5, 3.7, 6.8, 3.9], [21.5, -9.7, 4.5, 10.2, 4.2],
  ];
  const rearSkyline = [
    [-24.8, -16, 5.4, 12.4, 4.5], [-18.8, -16.5, 5.9, 14.7, 4.8],
    [-12.4, -15.6, 4.7, 10.3, 4.1], [-6.9, -16.9, 4.6, 13.3, 4.7],
    [-1.4, -15.6, 4.8, 10.7, 4.1], [4.4, -17.0, 5.8, 13.1, 4.5],
    [10.3, -16.5, 5.0, 11.1, 4.3], [16.3, -16.9, 5.1, 14.3, 5.1],
    [22.8, -16.6, 6.0, 11.8, 4.6],
  ];

  for (const [index, [x, z, width, height, depth]] of [...skyline, ...rearSkyline].entries()) {
    const foreground = index < skyline.length;
    const facade = z + depth / 2;
    const side = x + width / 2;
    const material = buildingMaterials[index % buildingMaterials.length];
    batch.add(material, x, height / 2, z, width, height, depth);
    batch.add(roof, x, height, z, width + 0.18, 0.16, depth + 0.18);
    batch.add(material, x + width * 0.11, height + 0.39, z - depth * 0.18, width * 0.59, 0.74, depth * 0.54);
    if (index % 3 === 1) {
      batch.add(roof, x + width * 0.13, height + 1.16, z - depth * 0.24, 0.09, 1.5, 0.09);
      batch.add(red, x + width * 0.13, height + 1.89, z - depth * 0.24, 0.13, 0.10, 0.13);
    }

    const floorHeight = foreground ? 0.89 : 1.14;
    const columns = Math.floor(width / 0.59);
    const accent = [cyan, amber, blue, lavender][index % 4];
    for (let row = 0; row < Math.floor((height - 0.77) / floorHeight); row++) {
      const y = row * floorHeight + 0.93;
      for (let column = 0; column < columns; column++) {
        const center = x - width / 2 + (column + 0.5) * width / columns;
        const pattern = (row * 23 + column * 13 + index * 31) % 21;
        const windowMaterial = pattern < 6 ? accent : pattern < 8 ? blue : darkWindow;
        batch.add(windowMaterial, center, y, facade + 0.017, width / columns * 0.63, 0.36, 0.031);
        if (foreground && windowMaterial !== darkWindow) {
          batch.add(ledge, center, y - 0.05, facade + 0.039, width / columns * 0.63, 0.02, 0.016);
        }
      }
      for (let column = 0; column < Math.floor(depth / 0.66); column++) {
        const center = z - depth / 2 + (column + 0.66) * 0.66;
        const windowMaterial = (row * 5 + column * 11 + index * 17) % 11 < 3 ? accent : darkWindow;
        batch.add(windowMaterial, side + 0.019, y, center, 0.032, 0.35, 0.38);
      }
      if (foreground) batch.add(roof, x, y - 0.45, facade + 0.043, width + 0.06, 0.083, 0.12);
    }

    if (foreground) {
      batch.add(darkWindow, x, 0.45, facade + 0.021, width * 0.72, 0.89, 0.05);
      batch.add(roof, x, 1.01, facade + 0.198, width * 0.79, 0.14, 0.39);
      batch.add(accent, x, 0.933, facade + 0.373, width * 0.69, 0.039, 0.037);
      addGroundReflection(city, reflections, accent.color, x, -2.1, width * 0.84, 3.0, 0.28);
    }
  }

  for (const x of [-12.8, -6.6, 3.7, 10.7, 16.6]) {
    const z = -2.89;
    batch.add(towerDark, x, 0.19, z, 0.4, 0.34, 0.39);
    batch.add(tower, x, 1.54, z, 0.091, 3.04, 0.091);
    batch.add(tower, x, 2.98, z + 0.35, 0.09, 0.085, 0.77);
    batch.add(amber, x, 2.923, z + 0.71, 0.25, 0.045, 0.24);
    addGroundReflection(city, reflections, 0xfeb274, x, -0.62, 1.38, 4.1, 0.28, 0.024);
    for (let offset = -0.45; offset < 0.5; offset += 0.45) {
      batch.add(towerDark, x + offset, 0.32, 5.95, 0.13, 0.62, 0.13);
      batch.add(safety, x + offset, 0.59, 5.95, 0.136, 0.065, 0.136);
    }
  }

  for (const [x, height] of [[-11.6, 7.67], [11.8, 7.38]]) {
    const z = -0.91;
    batch.add(towerDark, x, 0.24, z, 1.26, 0.48, 1.39);
    batch.add(tower, x, height / 2, z, 0.58, height, 0.6);
    batch.add(towerDark, x, height / 2, z + 0.32, 0.4, height - 0.65, 0.12);
    batch.add(cyan, x, height / 2 + 0.51, z + 0.391, 0.032, height - 2.0, 0.018);
    batch.add(tower, x, height, z + 0.48, 0.84, 0.31, 1.9);
    batch.add(towerDark, x, height + 0.225, z + 0.90, 0.63, 0.19, 0.51);
    batch.add(amber, x, height + 0.34, z + 0.90, 0.25, 0.07, 0.28);
    for (let y = 1.05; y <= height - 0.8; y += 0.83) {
      batch.add(towerDark, x, y, z, 0.67, 0.15, 0.7);
    }
    box(city, towerText, x, 1.69, z + 0.395, 0.45, 0.24, 0.022);
  }
  box(city, streetText, -0.35, 1.57, -5.997, 2.85, 0.29, 0.018);

  batch.mount(city, new Set([towerDark, tower, sidewalk, ledge, ...buildingMaterials]));

  const cableMaterial = metal(0x667783, 0.44);
  const cableTip = metal(0x8aa2ad, 0.48);
  const cableParts = [9, 13].map(count => Array.from({ length: count }, (_, index) => {
    const mesh = new THREE.Mesh(cableGeometry, index === count - 1 ? cableTip : cableMaterial);
    city.add(mesh);
    return mesh;
  }));
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const axis = new THREE.Vector3();

  function placeCable(time, broken, repairProgress = 0) {
    const gap = broken ? 1 - repairProgress : 0;
    const snap = Math.sin(time * 12.0) * 0.066;
    const ends = [
      [-11.6, 7.67, -1.6 - 0.5 * gap, 6.65 + (snap - 0.28) * gap],
      [-1.6 + 0.59 * gap, 6.65 - (0.7 + snap) * gap, 11.8, 7.38],
    ];
    cableParts.forEach((segments, span) => {
      const [x0, y0, x1, y1] = ends[span];
      const sag = span === 0 ? 0 : 0.23 + 0.26 * gap;
      const point = (fraction, vector) => vector.set(
        THREE.MathUtils.lerp(x0, x1, fraction),
        THREE.MathUtils.lerp(y0, y1, fraction) - 4 * sag * fraction * (1 - fraction),
        0.04,
      );
      point(0, from);
      segments.forEach((mesh, index) => {
        point((index + 1) / segments.length, to);
        axis.subVectors(to, from);
        mesh.position.copy(from).lerp(to, 0.5);
        mesh.scale.y = axis.length() + 0.008;
        mesh.quaternion.setFromUnitVectors(VERTICAL, axis.normalize());
        from.copy(to);
      });
    });
  }
  placeCable(0, false);
  return { update: placeCable };
}
