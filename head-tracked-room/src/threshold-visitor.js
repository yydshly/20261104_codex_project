import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const sans = '"Microsoft YaHei", "Segoe UI", sans-serif';
const serif = 'Georgia, "Microsoft YaHei", serif';
const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
const two = value => String(value).padStart(2, '0');

export function createThresholdVisitor(onAvatarState) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#171717');
  const material = (color, roughness = 0.75, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const matte = new THREE.MeshBasicMaterial({ color: '#191919', toneMapped: false });
  const oak = material('#9b6643');
  const walnut = material('#50352d');
  const blackWood = material('#242320');
  const bronze = material('#aa8055', 0.37, 0.55);
  const petrol = material('#284c4d');
  const plaster = material('#97816a');
  const cream = material('#e9cbaa');
  const amber = new THREE.MeshBasicMaterial({ color: '#ffd296', toneMapped: false });

  function put(geometry, surface, x, y, z, parent = scene) {
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function block(w, h, d, x, y, z, surface, radius = 0, parent = scene) {
    const geometry = radius ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d);
    return put(geometry, surface, x, y, z, parent);
  }

  function oval(rx, ry, rz, x, y, z, surface, parent = scene) {
    const mesh = put(new THREE.SphereGeometry(1, 28, 18), surface, x, y, z, parent);
    mesh.scale.set(rx, ry, rz);
    return mesh;
  }

  function panel(w, h, x, y, z, pixelW, pixelH, parent = scene) {
    const canvas = document.createElement('canvas');
    canvas.width = pixelW;
    canvas.height = pixelH;
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    put(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, toneMapped: false }),
      x, y, z, parent).castShadow = false;
    return draw => {
      draw(canvas.getContext('2d'));
      map.needsUpdate = true;
    };
  }

  scene.add(new THREE.HemisphereLight('#d9e9ed', '#77543b', 1.25));
  const key = new THREE.DirectionalLight('#ffe0b3', 2.15);
  key.position.set(-0.47, 0.65, 0.56);
  key.target.position.set(0, -0.07, -0.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.66, right: 0.66, top: 0.52, bottom: -0.56, near: 0.05, far: 2.8 });
  key.shadow.normalBias = 0.0018;
  key.shadow.intensity = 0.72;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#a1cfed', 0.95);
  fill.position.set(0.67, 0.25, -0.1);
  scene.add(fill);

  // The far room sits behind a stationary aperture at z = 0.
  block(1.07, 0.61, 0.031, 0, 0, -1.22, plaster);
  block(1.04, 0.028, 1.2, 0, -0.281, -0.607, walnut);
  block(1.04, 0.03, 1.2, 0, 0.302, -0.607, walnut);
  const floor = ['#925d43', '#9e6749', '#a36d4e', '#82503d'].map(color => material(color));
  for (let index = 0; index < 14; index += 1) {
    block(0.071, 0.007, 1.19, (index - 6.5) * 0.073, -0.263, -0.606, floor[index % 4]);
  }
  for (const side of [-1, 1]) {
    block(0.026, 0.61, 1.2, side * 0.514, 0, -0.611, plaster);
    block(0.014, 0.232, 1.19, side * 0.494, -0.143, -0.61, petrol);
    block(0.019, 0.014, 1.19, side * 0.482, -0.026, -0.61, oak);
    for (const z of [-0.18, -0.48, -0.81, -1.16]) {
      block(0.026, 0.545, 0.023, side * 0.48, 0.012, z, walnut);
    }
  }
  block(1.04, 0.237, 0.021, 0, -0.145, -1.196, petrol);
  block(1.04, 0.015, 0.022, 0, -0.027, -1.181, oak);

  // A few recognizable objects make the different room depths easy to read.
  block(0.28, 0.23, 0.102, -0.265, -0.135, -1.16, walnut, 0.006);
  for (const row of [-0.19, -0.112]) {
    for (const col of [-0.324, -0.203]) {
      block(0.112, 0.067, 0.013, col, row, -1.102, oak, 0.005);
      oval(0.009, 0.009, 0.006, col, row, -1.09, bronze);
    }
  }
  block(0.304, 0.022, 0.12, -0.265, -0.019, -1.154, oak, 0.005);
  const lampX = -0.317;
  const lampZ = -1.082;
  put(new THREE.CylinderGeometry(0.047, 0.051, 0.011, 28), bronze, lampX, -0.002, lampZ);
  put(new THREE.CylinderGeometry(0.006, 0.007, 0.094, 20), bronze, lampX, 0.05, lampZ);
  put(new THREE.CylinderGeometry(0.029, 0.075, 0.061, 36), cream, lampX, 0.106, lampZ);
  put(new THREE.CylinderGeometry(0.066, 0.066, 0.0025, 36), amber, lampX, 0.076, lampZ);
  const lamp = new THREE.PointLight('#ffba71', 0.1, 0.9, 2);
  lamp.position.set(lampX, 0.066, lampZ + 0.02);
  scene.add(lamp);
  for (const [index, color] of ['#b56c4e', '#747959', '#9e8358', '#aa6049'].entries()) {
    block(0.023, 0.049 + index * 0.012, 0.032, -0.239 + index * 0.026,
      0.016 + index * 0.006, -1.094, material(color), 0.002).rotation.z = (index - 1) * 0.06;
  }
  block(0.255, 0.129, 0.135, 0.327, -0.201, -0.68, walnut, 0.009);
  block(0.269, 0.017, 0.149, 0.327, -0.128, -0.68, oak, 0.005);
  block(0.128, 0.011, 0.075, 0.351, -0.115, -0.65, petrol, 0.002);
  block(0.116, 0.008, 0.067, 0.343, -0.105, -0.65, cream, 0.002).rotation.y = -0.13;
  block(0.356, 0.231, 0.018, 0.291, 0.107, -1.168, walnut, 0.005);
  const backBoard = panel(0.333, 0.208, 0.291, 0.107, -1.157, 672, 420);

  const left = -0.436;
  const right = 0.436;
  const sillY = -0.199;
  const lintelY = 0.207;
  const frame = new THREE.Shape().moveTo(-0.62, -0.56).lineTo(0.62, -0.56)
    .lineTo(0.62, 0.56).lineTo(-0.62, 0.56).closePath();
  frame.holes.push(new THREE.Path().moveTo(left, sillY).lineTo(left, lintelY)
    .lineTo(right, lintelY).lineTo(right, sillY).closePath());
  put(new THREE.ShapeGeometry(frame), matte, 0, 0, 0).castShadow = false;
  block(0.891, 0.017, 0.079, 0, sillY - 0.008, -0.039, oak, 0.004);
  const sill = block(0.903, 0.016, 0.008, 0, sillY - 0.009, 0.0045, walnut, 0.003);
  sill.castShadow = false;
  for (const x of [left, right]) {
    block(0.014, lintelY - sillY, 0.038, x, (lintelY + sillY) / 2, -0.019, blackWood, 0.003);
  }
  block(0.883, 0.011, 0.027, 0, lintelY - 0.0045, -0.014, walnut, 0.002);

  const plaque = new THREE.Group();
  plaque.position.set(0.208, -0.137, 0.175);
  plaque.rotation.set(-0.12, -0.2, 0.075);
  plaque.visible = false;
  scene.add(plaque);
  block(0.236, 0.142, 0.04, 0, 0, 0, oak, 0.01, plaque);
  block(0.216, 0.12, 0.006, 0, 0, 0.020, walnut, 0.003, plaque);
  const clock = panel(0.201, 0.105, 0, 0, 0.0235, 804, 420, plaque);

  let avatar;
  import('./visitor-avatar.js').then(({ loadVisitorAvatar }) =>
    loadVisitorAvatar(scene, plaque, sillY)
  ).then(model => {
    avatar = model;
    plaque.visible = true;
    onAvatarState('ready');
  }).catch(error => {
    console.error('Failed to load the visitor avatar', error);
    onAvatarState('error');
  });

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let weather = { city: '北京', label: '正在获取天气' };
  let lastMinute = '';
  let lastDay = '';
  let blink = 1;
  return {
    scene,
    viewGain: [0.6, 0.28, 0.25],
    setWeather(next) {
      weather = next;
      lastDay = '';
    },
    update(now, time) {
      let changed = false;
      const minute = `${two(now.getHours())}:${two(now.getMinutes())}`;
      const day = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (lastMinute !== minute) {
        clock(ctx => paintClock(ctx, minute));
        lastMinute = minute;
        changed = true;
      }
      if (lastDay !== day) {
        backBoard(ctx => paintCalendar(ctx, now, weather));
        lastDay = day;
        changed = true;
      }
      const phase = time % 5900;
      const openness = !motion.matches && phase > 5660
        ? 1 - 0.9 * Math.sin((phase - 5660) * Math.PI / 240) : 1;
      if (avatar && openness !== blink) {
        avatar.expressionManager?.setValue('blink', 1 - openness);
        avatar.expressionManager?.update();
        blink = openness;
        changed = true;
      }
      return changed;
    },
  };
}

function write(ctx, text, x, y, size, color, font = sans, align = 'left', maxWidth) {
  ctx.font = `600 ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  if (maxWidth) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
}

function paintClock(ctx, time) {
  ctx.fillStyle = '#e4d6b9';
  ctx.fillRect(0, 0, 804, 420);
  ctx.strokeStyle = '#a28764';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 780, 396);
  write(ctx, '今 日 时 间', 402, 85, 46, '#705842', sans, 'center');
  write(ctx, time, 402, 315, 205, '#302a22', serif, 'center', 726);
}

function paintCalendar(ctx, now, weather) {
  ctx.fillStyle = '#dfcfb1';
  ctx.fillRect(0, 0, 672, 420);
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  write(ctx, `${year} 年 ${month + 1} 月`, 31, 57, 43, '#393127');
  const start = (new Date(year, month, 1).getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < 7; i += 1) write(ctx, weekdays[i], 70 + i * 87, 102, 32, '#695944', sans, 'center');
  for (let value = 1; value <= length; value += 1) {
    const index = start + value - 1;
    const x = 70 + (index % 7) * 87;
    const y = 147 + Math.floor(index / 7) * 37;
    if (value === day) {
      ctx.fillStyle = '#9f5140';
      ctx.beginPath();
      ctx.arc(x, y - 11, 19, 0, Math.PI * 2);
      ctx.fill();
    }
    write(ctx, value, x, y, 33, value === day ? '#fff0d4' : '#3b3328', sans, 'center');
  }
  ctx.fillStyle = '#b8a482';
  ctx.fillRect(31, 354, 610, 2);
  const forecast = weather.temperature == null ? weather.label : `${weather.temperature}° ${weather.label}`;
  const humidity = weather.humidity == null ? '' : `  ·  湿度 ${weather.humidity}%`;
  const stale = weather.stale ? ' · 上次更新' : '';
  write(ctx, `${weather.city}  ·  ${forecast}${humidity}${stale}`, 31, 401, 32, '#4a3a2b', sans, 'left', 610);
}
