import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const FLOOR_HEIGHT = 3.05;
const unitBox = new THREE.BoxGeometry();
const unitPlane = new THREE.PlaneGeometry();

function surface(color, roughness = 0.62, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function shape(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function box(parent, material, x, y, z, width, height, depth) {
  const mesh = shape(parent, unitBox, material, x, y, z);
  mesh.scale.set(width, height, depth);
  return mesh;
}

function plane(parent, material, x, y, z, width, height) {
  const mesh = shape(parent, unitPlane, material, x, y, z);
  mesh.scale.set(width, height, 1);
  return mesh;
}

function paintTexture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function line(ctx, points, color, width = 3) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  points.slice(1).forEach(point => ctx.lineTo(...point));
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function stageArt(ctx, id, accent) {
  const muted = '#45637a';
  if (id === 'entry') {
    ctx.strokeStyle = muted;
    ctx.lineWidth = 2;
    ctx.strokeRect(54, 40, 244, 47);
    ctx.strokeRect(126, 133, 198, 48);
    ctx.strokeRect(357, 133, 178, 48);
    dot(ctx, 74, 62, 7, accent);
    line(ctx, [[92, 62], [211, 62]], '#dbe8ec', 4);
    line(ctx, [[176, 89], [176, 110], [444, 110], [444, 133]], muted);
    line(ctx, [[225, 110], [225, 133]], muted);
    line(ctx, [[148, 156], [226, 156]], accent, 5);
    line(ctx, [[375, 156], [474, 156]], '#dbe8ec', 5);
  } else if (id === 'map') {
    const nodes = [[141, 63], [251, 119], [140, 175], [400, 73], [484, 159]];
    for (const to of [0, 2, 3, 4]) line(ctx, [nodes[1], nodes[to]], muted);
    nodes.forEach(([x, y], index) => {
      dot(ctx, x, y, index === 1 ? 22 : 13, index === 1 ? accent : '#b2c3d5');
      dot(ctx, x, y, index === 1 ? 10 : 5, '#12232f');
    });
  } else if (id === 'lab') {
    ctx.fillStyle = '#182e3c';
    ctx.fillRect(54, 32, 224, 150);
    ctx.fillRect(304, 32, 224, 150);
    for (const [left, color, size] of [[72, muted, 105], [323, accent, 151]]) {
      line(ctx, [[left, 58], [left + 68, 58]], color, 8);
      line(ctx, [[left, 93], [left + size, 93]], '#9db2bf', 4);
      line(ctx, [[left, 115], [left + size - 21, 115]], '#9db2bf', 4);
      line(ctx, [[left, 143], [left + size - 40, 143]], color, 6);
    }
  } else {
    const points = [[96, 145], [210, 64], [334, 143], [479, 60]];
    line(ctx, points, accent, 3);
    line(ctx, [[96, 145], [195, 175], [334, 143], [494, 161]], muted);
    points.forEach(([x, y]) => {
      dot(ctx, x, y, 14, '#102530');
      dot(ctx, x, y, 7, accent);
    });
  }
}

function createBoard(floor) {
  const map = paintTexture(592, 324, ctx => {
    const gradient = ctx.createLinearGradient(0, 0, 592, 324);
    gradient.addColorStop(0, '#172d3b');
    gradient.addColorStop(1, '#091521');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 592, 324);
    ctx.strokeStyle = '#213847';
    ctx.lineWidth = 1;
    for (let x = 16; x < 592; x += 24) line(ctx, [[x, 104], [x, 304]], '#213847', 1);
    for (let y = 104; y < 324; y += 24) line(ctx, [[16, y], [576, y]], '#213847', 1);
    ctx.strokeStyle = floor.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 576, 308);
    ctx.fillStyle = floor.color;
    ctx.font = 'bold 17px Arial';
    ctx.fillText(floor.sign.toUpperCase(), 32, 41, 520);
    ctx.fillStyle = '#f7ede0';
    ctx.font = 'bold 42px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText(floor.title, 29, 91, 520);
    ctx.translate(0, 100);
    stageArt(ctx, floor.id, floor.color);
  });
  return new THREE.MeshBasicMaterial({ map });
}

function floorTag(floor, index) {
  const map = paintTexture(320, 128, ctx => {
    ctx.fillStyle = '#10222e';
    ctx.fillRect(0, 0, 320, 128);
    ctx.strokeStyle = floor.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 308, 116);
    ctx.fillStyle = '#fce2b9';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 59px Arial';
    ctx.fillText(String(index + 1).padStart(2, '0'), 22, 67);
    ctx.fillStyle = floor.color;
    ctx.font = 'bold 23px Arial';
    ctx.fillText(floor.sign, 113, 68, 175);
  });
  return new THREE.MeshBasicMaterial({ map });
}

function roomProp(room, id, colors) {
  const { navy, copper, paper, accent } = colors;
  const z = -0.32;
  if (id === 'entry') {
    box(room, navy, 2.34, 0.64, z, 1.64, 0.10, 0.77);
    box(room, copper, 2.34, 0.34, z, 0.11, 0.58, 0.10);
    box(room, navy, 2.34, 0.08, z, 0.77, 0.12, 0.53);
    box(room, paper, 2.27, 0.72, z + 0.07, 0.64, 0.05, 0.40);
    box(room, accent, 2.57, 0.78, z + 0.13, 0.43, 0.05, 0.25).rotation.y = -0.23;
    return;
  }
  if (id === 'map') {
    box(room, navy, 2.28, 0.10, z, 1.10, 0.17, 0.73);
    const nodes = [[1.89, 0.34, z + 0.08], [2.30, 0.64, z], [2.68, 0.35, z + 0.08]];
    const ring = shape(room, new THREE.TorusGeometry(0.49, 0.025, 6, 24), copper, 2.29, 0.47, z);
    ring.rotation.x = 0.38;
    const sphere = new THREE.SphereGeometry(0.11, 12, 8);
    nodes.forEach(([x, y, depth], index) => shape(room, sphere, index === 1 ? accent : paper, x, y, depth));
    return;
  }
  if (id === 'lab') {
    box(room, navy, 2.34, 0.43, z, 1.68, 0.84, 0.76);
    box(room, copper, 2.34, 0.89, z, 1.75, 0.09, 0.80);
    for (let index = 0; index < 2; index++) {
      const x = 2.08 + index * 0.53;
      box(room, navy, x, 1.06, z, 0.41, 0.26, 0.14).rotation.x = -0.11;
      box(room, index === 1 ? accent : paper, x, 1.06, z + 0.08, 0.31, 0.16, 0.018);
    }
    return;
  }
  box(room, navy, 2.34, 0.33, z, 1.77, 0.61, 0.72);
  for (let index = 0; index < 5; index++) {
    box(room, index % 2 ? copper : accent, 1.73 + index * 0.27, 0.86, z - 0.12,
      0.15, 0.48 + (index % 3) * 0.09, 0.39).rotation.z = index === 3 ? 0.16 : 0;
  }
}

function makeMascot(cab, colors) {
  const actor = new THREE.Group();
  cab.add(actor);
  const { tangerine, orange, ink, blush, paper } = colors;
  shape(actor, new RoundedBoxGeometry(1.18, 0.91, 0.65, 3, 0.2), tangerine, 0, 1.02, 0.1);
  const hand = new THREE.SphereGeometry(0.13, 12, 8);
  const leg = new RoundedBoxGeometry(0.19, 0.32, 0.27, 2, 0.06);
  const eye = new THREE.SphereGeometry(0.045, 12, 8);
  const cheek = new THREE.SphereGeometry(0.063, 12, 8);
  for (const side of [-1, 1]) {
    shape(actor, hand, orange, side * 0.61, 0.92, 0.11);
    shape(actor, leg, orange, side * 0.26, 0.55, 0.12);
    shape(actor, eye, ink, side * 0.19, 1.11, 0.425).scale.y = 1.24;
    shape(actor, eye, paper, side * 0.19 - 0.011, 1.127, 0.463).scale.setScalar(0.24);
    shape(actor, cheek, blush, side * 0.32, 1.01, 0.426).scale.set(1, 0.53, 0.27);
  }
  const smile = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.095, 0.98, 0.434),
    new THREE.Vector3(0, 0.88, 0.438),
    new THREE.Vector3(0.095, 0.98, 0.434),
  );
  shape(actor, new THREE.TubeGeometry(smile, 12, 0.017, 6, false), ink, 0, 0, 0);
  const pocket = new RoundedBoxGeometry(0.25, 0.14, 0.038, 2, 0.038);
  shape(actor, pocket, paper, 0, 0.74, 0.400).rotation.z = -0.10;
  return actor;
}

export function createScene(canvas, floors) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;

  const skyline = '#172431';
  scene.fog = new THREE.Fog(skyline, 25, 67);
  scene.background = paintTexture(4, 256, ctx => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#08121e');
    gradient.addColorStop(0.66, '#182735');
    gradient.addColorStop(1, '#273746');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 256);
  });
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 95);
  const colors = {
    navy: surface('#172b3a'),
    facade: surface('#26404e'),
    trim: surface('#b97042', 0.42, 0.48),
    copper: surface('#db9b58', 0.47, 0.36),
    walnut: surface('#4c342c'),
    wall: surface('#66594c'),
    paper: surface('#efd8ac'),
    orange: surface('#d46b34', 0.48),
    tangerine: surface('#ef8d48', 0.41),
    blush: surface('#ffb682', 0.68),
    ink: surface('#1c2024'),
  };
  const buildingHeight = floors.length * FLOOR_HEIGHT;
  const edgeLight = new THREE.MeshBasicMaterial({ color: '#c38a52' });
  const ground = surface('#15252f');
  box(scene, ground, 0, -0.63, -5, 260, 0.38, 190);
  box(scene, colors.navy, 0, -0.35, -0.1, 10.35, 0.28, 5.15);
  box(scene, colors.facade, 0, -0.19, -0.1, 9.8, 0.14, 4.7);
  box(scene, colors.facade, 0, buildingHeight + 0.07, -0.25, 9.55, 0.32, 4.32);
  box(scene, colors.trim, 0, buildingHeight - 0.10, 1.94, 9.46, 0.08, 0.10);
  box(scene, colors.navy, 0, buildingHeight + 0.32, -0.55, 5.3, 0.18, 3.12);

  for (const x of [-4.45, 4.45]) {
    box(scene, colors.facade, x, buildingHeight / 2, -1.78, 0.29, buildingHeight, 0.37);
    box(scene, colors.facade, x, buildingHeight / 2, 1.70, 0.29, buildingHeight, 0.34);
    box(scene, colors.trim, x + 0.013, buildingHeight / 2, 1.888, 0.060, buildingHeight, 0.056);
  }
  for (const x of [-3.95, -1.47]) {
    box(scene, colors.trim, x, buildingHeight / 2, 1.94, 0.083, buildingHeight + 0.25, 0.12);
    box(scene, colors.copper, x, buildingHeight / 2, 1.99, 0.025, buildingHeight + 0.25, 0.038);
  }

  const indicators = [];
  floors.forEach((floor, index) => {
    const room = new THREE.Group();
    room.position.y = index * FLOOR_HEIGHT;
    scene.add(room);

    const accent = surface(floor.color, 0.52);
    const indicator = new THREE.MeshStandardMaterial({
      color: floor.color, emissive: floor.color, emissiveIntensity: 0.2,
    });
    indicators.push(indicator);

    box(room, colors.facade, 0, -0.075, -0.17, 8.88, 0.21, 3.77);
    box(room, colors.walnut, 0.07, 0.037, -0.17, 8.78, 0.035, 3.65);
    box(room, colors.wall, 0, 1.46, -1.95, 8.86, 2.89, 0.17);
    box(room, colors.navy, -2.71, 1.46, -0.66, 2.65, 2.86, 0.14);
    box(room, colors.facade, -1.32, 1.46, -0.16, 0.18, 2.87, 3.55);
    box(room, colors.facade, 4.42, 1.46, -0.16, 0.17, 2.87, 3.50);
    box(room, colors.navy, 0, 2.91, 1.86, 8.85, 0.21, 0.17);
    box(room, colors.trim, 0, 2.80, 1.92, 8.85, 0.047, 0.084);
    box(room, edgeLight, 1.52, 2.76, 1.84, 5.30, 0.024, 0.042);
    box(room, colors.navy, 1.38, 0.21, -1.80, 5.1, 0.15, 0.15);
    for (const x of [-0.73, 3.82]) {
      box(room, colors.trim, x, 1.47, -1.82, 0.060, 2.72, 0.06);
    }

    box(room, colors.navy, 1.64, 1.75, -1.76, 3.83, 1.87, 0.14);
    plane(room, createBoard(floor), 1.64, 1.75, -1.68, 3.68, 1.76);
    roomProp(room, floor.id, { ...colors, accent });
    box(room, colors.navy, 0.08, 2.50, 1.95, 1.50, 0.59, 0.13);
    plane(room, floorTag(floor, index), 0.08, 2.50, 2.024, 1.43, 0.57);
    box(room, indicator, -0.83, 2.50, 1.985, 0.15, 0.15, 0.095);
  });

  const cab = new THREE.Group();
  cab.position.set(-2.71, 0, 1.06);
  scene.add(cab);
  box(cab, colors.trim, 0, 0.16, 0, 2.32, 0.28, 1.68);
  box(cab, colors.walnut, 0, 0.32, 0, 2.23, 0.06, 1.61);
  box(cab, colors.trim, 0, 2.36, 0, 2.32, 0.25, 1.68);
  box(cab, colors.facade, 0, 2.47, 0, 2.08, 0.12, 1.46);
  box(cab, colors.facade, 0, 1.34, -0.79, 2.20, 2.04, 0.10);
  box(cab, colors.walnut, 0, 0.69, -0.72, 2.16, 0.68, 0.055);
  box(cab, edgeLight, 0, 2.20, -0.52, 1.83, 0.035, 0.057);
  box(cab, colors.trim, 0, 1.02, -0.69, 1.89, 0.05, 0.08);
  for (const side of [-1, 1]) {
    for (const depth of [-0.75, 0.78]) {
      box(cab, colors.copper, side * 1.08, 1.33, depth, 0.10, 2.13, 0.11);
    }
  }

  const glass = new THREE.MeshPhysicalMaterial({
    color: '#9dd1d5', metalness: 0.08, roughness: 0.35,
    transparent: true, opacity: 0.12, depthWrite: false,
  });
  const doorLeaves = [-1, 1].map(side => {
    const leaf = new THREE.Group();
    leaf.position.z = 0.816;
    cab.add(leaf);
    plane(leaf, glass, 0, 1.32, 0, 0.94, 1.91);
    for (const x of [-0.48, 0.48]) {
      box(leaf, colors.copper, x, 1.32, 0.02, 0.036, 1.95, 0.07);
    }
    for (const y of [0.36, 2.28]) {
      box(leaf, colors.copper, 0, y, 0.02, 0.98, 0.040, 0.07);
    }
    box(leaf, colors.copper, -side * 0.37, 1.15, 0.055, 0.057, 0.22, 0.07);
    return leaf;
  });
  const actor = makeMascot(cab, colors);

  const shadow = paintTexture(64, 64, ctx => {
    const gradient = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    gradient.addColorStop(0, '#080d14aa');
    gradient.addColorStop(1, '#080d1400');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  });
  const contact = plane(cab, new THREE.MeshBasicMaterial({
    map: shadow, transparent: true, depthWrite: false,
  }), 0, 0.354, 0.12, 1.52, 0.91);
  contact.rotation.x = -Math.PI / 2;

  scene.add(new THREE.HemisphereLight('#ffeed5', '#395576', 1.63));
  const key = new THREE.DirectionalLight('#ffd3a1', 3.05);
  key.position.set(-4, 10, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#bed8ff', 1.10);
  fill.position.set(7, 5, 3);
  scene.add(fill);

  function resize(width, height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function draw(state) {
    const { lift, door, reveal, floorIndex, time, phase } = state;
    cab.position.y = lift * FLOOR_HEIGHT;
    actor.position.z = 0.08 * door;
    actor.position.y = Math.sin(time * 5.8) * (phase === 'travel' ? 0.018 : 0.035);
    actor.rotation.y = 0.17 + Math.sin(time * 2.7) * 0.07;
    doorLeaves[0].position.x = -0.49 - 0.55 * door;
    doorLeaves[1].position.x = 0.49 + 0.55 * door;
    indicators.forEach((material, index) => {
      material.emissiveIntensity = index === floorIndex ? 0.85 + door * 0.5 : 0.15;
    });

    const shotY = cab.position.y + 1.45;
    const targetY = THREE.MathUtils.lerp(shotY, buildingHeight * 0.48, reveal);
    const zoomDistance = Math.max(25, buildingHeight * 2.04);
    camera.position.set(
      THREE.MathUtils.lerp(4.85, 8.5, reveal),
      targetY + THREE.MathUtils.lerp(1.93, 3.1, reveal),
      THREE.MathUtils.lerp(10.15, zoomDistance, reveal),
    );
    camera.lookAt(0.15, targetY, 0.22);
    renderer.render(scene, camera);
  }

  return { resize, draw };
}
