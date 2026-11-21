import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createMoonPost() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#17232b');
  const standard = (color, roughness = 0.7, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const flat = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const walnut = standard('#6b3e31');
  const oak = standard('#a86545');
  const enamel = standard('#285251', 0.36);
  const deep = standard('#223735');
  const bronze = standard('#bc7f43', 0.34, 0.48);
  const cream = standard('#ffe1bc', 0.42);
  const clay = standard('#bd6857');
  const black = standard('#242124', 0.34);

  function place(geometry, material, x, y, z, parent = scene) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function block(w, h, d, x, y, z, material, parent = scene, radius = 0) {
    const geometry = radius ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d);
    return place(geometry, material, x, y, z, parent);
  }

  function oval(w, h, d, x, y, z, material, parent = scene) {
    const mesh = place(new THREE.SphereGeometry(1, 28, 18), material, x, y, z, parent);
    mesh.scale.set(w, h, d);
    return mesh;
  }

  function graphic(geometry, texture, x, y, z, parent = scene) {
    const surface = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = place(geometry, surface, x, y, z, parent);
    mesh.castShadow = false;
    return mesh;
  }

  scene.add(new THREE.HemisphereLight('#dbeaff', '#925732', 1.45));
  const sun = new THREE.DirectionalLight('#ffe4bb', 2.1);
  sun.position.set(-0.58, 0.56, 0.6);
  sun.target.position.set(0, -0.1, -0.55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -0.8, right: 0.8, top: 0.65, bottom: -0.72, near: 0.1, far: 3 });
  sun.shadow.normalBias = 0.002;
  scene.add(sun, sun.target);
  const bounce = new THREE.DirectionalLight('#9dc8ff', 1.18);
  bounce.position.set(0.65, 0.28, 0.1);
  scene.add(bounce);

  // An inset aperture on the screen plane anchors the depth illusion.
  const aperture = (w, bottom, top) => new THREE.Path().moveTo(-w, bottom).lineTo(-w, top)
    .lineTo(w, top).lineTo(w, bottom).closePath();
  const surround = new THREE.Shape().moveTo(-0.6, -0.6).lineTo(0.6, -0.6)
    .lineTo(0.6, 0.6).lineTo(-0.6, 0.6).closePath();
  surround.holes.push(aperture(0.458, -0.258, 0.212));
  place(new THREE.ShapeGeometry(surround), flat('#1f2b32'), 0, 0, 0).castShadow = false;
  const inlay = new THREE.Shape().moveTo(-0.463, -0.263).lineTo(0.463, -0.263)
    .lineTo(0.463, 0.217).lineTo(-0.463, 0.217).closePath();
  inlay.holes.push(aperture(0.458, -0.258, 0.212));
  place(new THREE.ShapeGeometry(inlay), flat('#af8d69'), 0, 0, 0.001).castShadow = false;

  // Timber, teal wainscoting, and wall panels on three sides.
  const plaster = standard('#dfab7b');
  block(1.07, 0.68, 0.04, 0, 0, -1.33, plaster);
  block(1.04, 0.025, 1.306, 0, 0.315, -0.663, deep);
  block(1.04, 0.026, 1.306, 0, -0.304, -0.663, walnut);
  for (const side of [-1, 1]) {
    block(0.025, 0.66, 1.31, side * 0.517, 0, -0.663, plaster);
    block(0.022, 0.235, 1.31, side * 0.502, -0.171, -0.663, enamel);
    block(0.029, 0.014, 1.31, side * 0.49, -0.048, -0.663, bronze);
    for (const z of [-0.18, -0.55, -0.94, -1.27]) {
      block(0.032, 0.601, 0.022, side * 0.488, 0.012, z, walnut);
    }
  }
  block(1.04, 0.23, 0.025, 0, -0.175, -1.296, enamel);
  block(1.04, 0.014, 0.023, 0, -0.051, -1.282, bronze);
  const floorMaterials = ['#b57d56', '#a96f4c', '#b47a53', '#c48c63'].map(color => standard(color));
  for (let index = 0; index < 14; index += 1) {
    block(0.071, 0.009, 1.3, (index - 6.5) * 0.073, -0.287, -0.663, floorMaterials[index % 4]);
  }
  block(0.65, 0.009, 0.74, -0.06, -0.279, -0.61, clay, scene, 0.004);
  block(0.59, 0.002, 0.675, -0.06, -0.2735, -0.61, standard('#a64e3b'), scene, 0.001);

  const portX = 0.208;
  const portY = 0.066;
  const portZ = -1.255;
  place(new THREE.CircleGeometry(0.211, 64), deep, portX, portY, portZ - 0.006);
  place(new THREE.TorusGeometry(0.202, 0.014, 14, 64), bronze, portX, portY, portZ);
  graphic(new THREE.CircleGeometry(0.191, 64), skyTexture(), portX, portY, portZ + 0.002);
  for (let index = 0; index < 8; index += 1) {
    const angle = index * Math.PI / 4;
    oval(0.0046, 0.0046, 0.004, portX + Math.cos(angle) * 0.205,
      portY + Math.sin(angle) * 0.205, portZ + 0.014, cream);
  }

  // Sorting shelves, parcels, and the station sign.
  block(0.34, 0.33, 0.096, -0.257, -0.081, -1.242, walnut, scene, 0.008);
  block(0.313, 0.28, 0.02, -0.257, -0.097, -1.185, deep);
  for (let index = 0; index < 4; index += 1) {
    block(0.326, 0.011, 0.072, -0.257, -0.23 + index * 0.091, -1.151, oak);
  }
  for (const x of [-0.41, -0.31, -0.207, -0.103]) {
    block(0.01, 0.29, 0.072, x, -0.086, -1.151, oak);
  }
  for (const [x, y, w, h, surface, tilt] of [
    [-0.36, -0.196, 0.064, 0.057, cream, 0.04], [-0.262, -0.2, 0.061, 0.048, clay, -0.04],
    [-0.166, -0.112, 0.054, 0.052, cream, 0.05], [-0.364, -0.116, 0.058, 0.042, clay, 0.14],
    [-0.268, -0.022, 0.058, 0.05, cream, -0.08], [-0.168, -0.208, 0.05, 0.035, bronze, 0.06],
  ]) {
    block(w, h, 0.029, x, y, -1.134, surface, scene, 0.003).rotation.z = tilt;
  }
  block(0.337, 0.117, 0.032, -0.256, 0.169, -1.265, bronze, scene, 0.007);
  graphic(new THREE.PlaneGeometry(0.319, 0.102), signTexture(), -0.256, 0.169, -1.247);

  // A rounded service counter and a clock with a physical dial.
  block(0.3, 0.169, 0.216, 0.273, -0.199, -0.48, deep, scene, 0.016);
  block(0.324, 0.032, 0.252, 0.273, -0.11, -0.48, walnut, scene, 0.009);
  block(0.253, 0.079, 0.006, 0.273, -0.199, -0.37, enamel, scene, 0.003);
  block(0.087, 0.011, 0.016, 0.273, -0.188, -0.363, bronze, scene, 0.004);
  block(0.114, 0.013, 0.073, 0.322, -0.087, -0.417, clay, scene, 0.004);
  block(0.099, 0.011, 0.066, 0.312, -0.075, -0.418, cream, scene, 0.004).rotation.y = -0.12;

  const clock = new THREE.Group();
  clock.position.set(0.236, -0.032, -0.464);
  scene.add(clock);
  block(0.135, 0.015, 0.055, 0, -0.057, 0, bronze, clock, 0.006);
  place(new THREE.CylinderGeometry(0.065, 0.065, 0.028, 48), walnut, 0, 0, 0, clock).rotation.x = Math.PI / 2;
  place(new THREE.TorusGeometry(0.06, 0.006, 12, 48), bronze, 0, 0, 0.015, clock);
  place(new THREE.CircleGeometry(0.057, 48), flat('#ede0ba'), 0, 0, 0.016, clock).castShadow = false;
  for (let index = 0; index < 12; index += 1) {
    const angle = index * Math.PI / 6;
    const mark = block(index % 3 ? 0.002 : 0.0035, 0.008, 0.001, Math.sin(angle) * 0.047,
      Math.cos(angle) * 0.047, 0.017, black, clock);
    mark.rotation.z = -angle;
  }
  const hands = [0.027, 0.042].map((length, index) => {
    const hand = new THREE.Group();
    clock.add(hand);
    block(0.006 - index * 0.002, length, 0.002, 0, length / 2, 0.02 + index * 0.002, black, hand, 0.0008);
    return hand;
  });
  oval(0.004, 0.004, 0.002, 0, 0, 0.025, clay, clock);

  // Pendant and a strip of light recessed in the ceiling.
  block(0.004, 0.091, 0.004, 0.37, 0.264, -0.72, bronze);
  place(new THREE.CylinderGeometry(0.025, 0.077, 0.058, 40), enamel, 0.37, 0.19, -0.72);
  place(new THREE.CylinderGeometry(0.068, 0.068, 0.005, 40), flat('#ffe0a4'), 0.37, 0.16, -0.72);
  const lamp = new THREE.PointLight('#ffc47e', 0.11, 0.9, 2);
  lamp.position.set(0.37, 0.144, -0.72);
  scene.add(lamp);
  block(0.57, 0.004, 0.012, -0.027, 0.299, -0.58, flat('#fbd39b'));

  const courier = new THREE.Group();
  courier.position.set(-0.174, 0, 0.094);
  courier.rotation.y = 0.11;
  scene.add(courier);
  const localOval = (w, h, d, x, y, z, surface) => oval(w, h, d, x, y, z, surface, courier);
  const localBlock = (w, h, d, x, y, z, surface, radius) => block(w, h, d, x, y, z, surface, courier, radius);

  // The step extends through the window and supports the full figure.
  block(0.295, 0.023, 0.245, -0.174, -0.238, 0.061, bronze, scene, 0.01);
  block(0.276, 0.01, 0.223, -0.174, -0.223, 0.061, walnut, scene, 0.004);
  block(0.246, 0.028, 0.173, -0.174, -0.26, 0.022, enamel, scene, 0.009);

  const fabric = standard('#426564');
  const stitching = standard('#e8a273');
  const blush = standard('#e5a49a');
  const ivory = standard('#fff0d6');
  localBlock(0.123, 0.124, 0.069, 0, -0.057, -0.045, clay, 0.019);
  localOval(0.077, 0.079, 0.058, 0, -0.049, 0, fabric);
  localOval(0.069, 0.034, 0.063, 0, 0.012, 0.006, clay);
  localOval(0.058, 0.021, 0.054, 0, 0.024, 0.011, stitching);
  for (const side of [-1, 1]) {
    localOval(0.027, 0.053, 0.031, side * 0.034, -0.14, -0.004, deep);
    localBlock(0.057, 0.046, 0.084, side * 0.038, -0.194, 0.018, cream, 0.016);
    localBlock(0.059, 0.01, 0.084, side * 0.038, -0.212, 0.018, clay, 0.004);
    const sleeve = localOval(0.027, 0.05, 0.029, side * 0.072, -0.064, 0.014, fabric);
    sleeve.rotation.z = side * 0.45;
    localOval(0.021, 0.018, 0.023, side * 0.079, -0.094, 0.051, cream);
  }

  // The courier carries a stamped letter in front of the suit.
  const letter = new THREE.Group();
  letter.position.set(0.021, -0.08, 0.075);
  letter.rotation.set(-0.08, -0.11, 0.18);
  courier.add(letter);
  block(0.131, 0.075, 0.012, 0, 0, 0, cream, letter, 0.006);
  graphic(new THREE.PlaneGeometry(0.119, 0.063), letterTexture(), 0, 0, 0.0065, letter);
  localOval(0.022, 0.017, 0.019, 0.084, -0.086, 0.081, ivory);

  // Sculpted ears cross the upper rim while the body stays grounded.
  localOval(0.099, 0.076, 0.073, 0, 0.077, 0.007, cream);
  for (const [side, height, angle] of [[-1, 0.135, 0.17], [1, 0.124, -0.28]]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.044, 0.171 + (side < 0 ? 0.011 : 0), 0.005);
    ear.rotation.z = angle;
    courier.add(ear);
    block(0.037, height, 0.035, 0, 0, 0, cream, ear, 0.016);
    block(0.019, height * 0.73, 0.009, 0, 0.003, 0.016, blush, ear, 0.004);
  }
  localOval(0.052, 0.028, 0.021, 0, 0.051, 0.064, ivory);
  localOval(0.01, 0.0065, 0.006, 0, 0.062, 0.085, clay);
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.033, 0.087, 0.075);
    courier.add(eye);
    oval(0.0108, 0.0145, 0.006, 0, 0, 0, black, eye).castShadow = false;
    oval(0.0035, 0.0044, 0.0025, -0.003, 0.004, 0.006, ivory, eye).castShadow = false;
    eyes.push(eye);
    const cheek = localOval(0.015, 0.007, 0.004, side * 0.055, 0.064, 0.067, blush);
    cheek.rotation.y = side * 0.35;
    localOval(0.007, 0.0025, 0.002, side * 0.006, 0.048, 0.084, clay).rotation.z = side * 0.26;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastMinute = -1;
  let lastBlink = 1;
  return {
    scene,
    update(now, time) {
      const minute = now.getHours() * 60 + now.getMinutes();
      const clockMoved = minute !== lastMinute;
      if (clockMoved) {
        hands[0].rotation.z = -minute * Math.PI / 360;
        hands[1].rotation.z = -now.getMinutes() * Math.PI / 30;
        lastMinute = minute;
      }
      const phase = (time ?? 0) % 5800;
      const blink = !reduceMotion.matches && phase > 5550
        ? 1 - 0.9 * Math.sin((phase - 5550) * Math.PI / 250)
        : 1;
      if (lastBlink === blink) return clockMoved;
      for (const eye of eyes) eye.scale.y = blink;
      lastBlink = blink;
      return true;
    },
  };
}

function texture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'));
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function signTexture() {
  return texture(512, 176, ctx => {
    ctx.fillStyle = '#203d3b';
    ctx.fillRect(0, 0, 512, 176);
    ctx.strokeStyle = '#ae8156';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 492, 156);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fae1b3';
    ctx.font = 'bold 59px Georgia, serif';
    ctx.fillText('LUNAR POST', 256, 90);
    ctx.fillStyle = '#cba576';
    ctx.font = '22px Consolas, monospace';
    ctx.fillText('•  STATION N° 07  •', 256, 132);
  });
}

function letterTexture() {
  return texture(320, 176, ctx => {
    ctx.fillStyle = '#edd0a3';
    ctx.fillRect(0, 0, 320, 176);
    ctx.strokeStyle = '#b18b6e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(156, 99);
    ctx.lineTo(320, 0);
    ctx.moveTo(0, 176);
    ctx.lineTo(108, 73);
    ctx.moveTo(320, 176);
    ctx.lineTo(212, 70);
    ctx.stroke();
    ctx.fillStyle = '#ad534b';
    ctx.beginPath();
    ctx.arc(156, 99, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7d5a7';
    ctx.font = '21px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 156, 106);
  });
}

function skyTexture() {
  return texture(640, 640, ctx => {
    const night = ctx.createLinearGradient(0, 50, 0, 640);
    night.addColorStop(0, '#111b35');
    night.addColorStop(0.66, '#295471');
    night.addColorStop(1, '#a67979');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, 640, 640);
    for (let index = 0; index < 90; index += 1) {
      const x = (index * 177.89 + 21) % 640;
      const y = (index * 97.23 + 19) % 470;
      ctx.fillStyle = index % 7 ? '#b3cbdba0' : '#fce3b8';
      ctx.fillRect(x, y, index % 7 ? 2 : 4, index % 7 ? 2 : 4);
    }

    const halo = ctx.createRadialGradient(410, 219, 80, 410, 219, 216);
    halo.addColorStop(0, '#f9ceaa74');
    halo.addColorStop(1, '#f9ceaa00');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 640, 520);
    ctx.save();
    ctx.beginPath();
    ctx.arc(410, 219, 113, 0, 2 * Math.PI);
    ctx.clip();
    const moon = ctx.createLinearGradient(335, 100, 475, 328);
    moon.addColorStop(0, '#fdf0d4');
    moon.addColorStop(1, '#cf9a80');
    ctx.fillStyle = moon;
    ctx.fillRect(285, 102, 250, 230);
    for (const [x, y, w, h] of [[341, 181, 30, 26], [434, 154, 23, 17], [462, 254, 53, 34],
      [357, 272, 15, 12], [397, 220, 19, 14], [505, 190, 25, 21]]) {
      ctx.fillStyle = '#ac6c6b35';
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, -0.23, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const [height, color, peaks] of [
      [478, '#35566d', [67, 25, 62, 9, 56, 28, 71]],
      [517, '#273f54', [29, 63, 43, 92, 49, 78, 21]],
      [564, '#202f45', [60, 32, 67, 47, 72, 33, 74]],
    ]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 640);
      for (const [index, peak] of peaks.entries()) ctx.lineTo(index * 107, height - peak);
      ctx.lineTo(640, 640);
      ctx.fill();
    }
  });
}
