import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const system = '"Microsoft YaHei", "Segoe UI", sans-serif';
const numbers = '"Segoe UI", "Microsoft YaHei", sans-serif';
const ink = '#293028';
const muted = '#55594e';
const weekday = ['日', '一', '二', '三', '四', '五', '六'];
const two = value => String(value).padStart(2, '0');

export function createWindowDesk(referenceDistance, rainy = false) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(rainy ? '#181916' : '#302a24');
  let dirty = true;
  let lastMinute = '';
  let lastRainFrame = -Infinity;
  let weather = { city: '北京', label: '正在获取天气' };
  const motion = rainy ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  const photo = new THREE.TextureLoader().load(
    import.meta.env.BASE_URL + 'window-desk/' + (rainy ? 'rain-night.png' : 'room.png'),
    () => { dirty = true; },
  );
  photo.colorSpace = THREE.SRGBColorSpace;
  photo.anisotropy = 8;

  const deckY = -0.155;
  const deckBack = -0.46;
  const deckFront = 0.69;
  const farMaterial = photoMaterial(photo, referenceDistance, false, rainy);
  const room = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.7), farMaterial);
  room.position.z = -0.87;
  scene.add(room);

  // Project the same photo onto the tabletop and the distant room so they
  // line up from the center while moving at different rates from the side.
  const tabletop = new THREE.Mesh(new THREE.PlaneGeometry(1.58, deckFront - deckBack),
    photoMaterial(photo, referenceDistance, true));
  tabletop.rotation.x = -Math.PI / 2;
  tabletop.position.set(0, deckY, (deckFront + deckBack) / 2);
  tabletop.renderOrder = 1;
  scene.add(tabletop);

  scene.add(new THREE.HemisphereLight('#f2e5d1', '#504035', rainy ? 1.15 : 2.05));
  const windowLight = new THREE.DirectionalLight(rainy ? '#9cb4d0' : '#e4edf2', rainy ? 0.62 : 1.55);
  windowLight.position.set(0.55, 0.5, -0.24);
  scene.add(windowLight);
  const lampLight = new THREE.DirectionalLight('#ffd7a0', rainy ? 1.3 : 0.72);
  lampLight.position.set(-0.44, 0.26, 0.2);
  scene.add(lampLight);

  const x = rainy ? 0.115 : 0.032;
  const z = -0.015;
  const turn = -0.055;
  const chassis = new THREE.MeshStandardMaterial({
    map: woodGrain(), color: '#a78b70', roughness: 0.6, metalness: 0.08,
  });
  const backing = new THREE.MeshStandardMaterial({ color: '#302a25', roughness: 0.66 });
  const darkEdge = new THREE.MeshStandardMaterial({ color: '#3e372d', roughness: 0.73 });
  const support = new THREE.Group();
  support.position.set(x, deckY, z);
  support.rotation.y = turn;
  support.scale.setScalar(rainy ? 0.8 : 0.86);
  scene.add(support);

  function solid(parent, w, h, d, radius, material, px, py, pz) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
    mesh.position.set(px, py, pz);
    parent.add(mesh);
    return mesh;
  }

  solid(support, 0.30, 0.011, 0.082, 0.005, backing, 0, 0.0055, -0.036);
  solid(support, 0.24, 0.044, 0.021, 0.006, backing, 0, 0.029, -0.044).rotation.x = -0.25;
  const unit = new THREE.Group();
  unit.position.set(0, 0.119, -0.007);
  unit.rotation.x = -0.095;
  support.add(unit);
  solid(unit, 0.443, 0.210, 0.035, 0.010, chassis, 0, 0, 0);
  solid(unit, 0.425, 0.192, 0.009, 0.004, darkEdge, 0, 0, 0.015);

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 516;
  const ctx = canvas.getContext('2d');
  const display = new THREE.CanvasTexture(canvas);
  display.colorSpace = THREE.SRGBColorSpace;
  display.anisotropy = 8;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.405, 0.174),
    new THREE.MeshBasicMaterial({ map: display, toneMapped: false }));
  panel.position.z = 0.0201;
  unit.add(panel);

  const shadowMap = softShadow();
  for (const [width, depth, shift, strength] of [[0.56, 0.28, 0.035, 0.57], [0.37, 0.11, -0.023, 0.65]]) {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({
      map: shadowMap, transparent: true, opacity: strength, depthWrite: false, toneMapped: false,
    }));
    shadow.rotation.set(-Math.PI / 2, 0, turn);
    shadow.position.set(x + (rainy ? 0.025 : -0.023), deckY + 0.0007, z + shift);
    shadow.renderOrder = 2;
    scene.add(shadow);
  }

  return {
    scene,
    viewGain: [0.26, 0.18, 0.2],
    setWeather(next) {
      weather = next;
      lastMinute = '';
    },
    update(now, time) {
      const minute = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}:${now.getMinutes()}`;
      if (minute !== lastMinute) {
        paintDisplay(ctx, now, weather, rainy);
        display.needsUpdate = true;
        lastMinute = minute;
        dirty = true;
      }
      if (motion && !motion.matches && time - lastRainFrame >= 42) {
        farMaterial.uniforms.rainSeconds.value = time / 1000;
        lastRainFrame = time;
        dirty = true;
      }
      const changed = dirty;
      dirty = false;
      return changed;
    },
  };
}

function photoMaterial(photo, referenceDistance, tabletop, rainy = false) {
  return new THREE.ShaderMaterial({
    transparent: tabletop,
    depthWrite: !tabletop,
    toneMapped: false,
    defines: rainy ? { RAIN_GLASS: 1 } : {},
    uniforms: {
      photograph: { value: photo },
      refDistance: { value: referenceDistance },
      deskLayer: { value: tabletop ? 1 : 0 },
      rainSeconds: { value: 0 },
    },
    vertexShader: `
      varying vec3 worldPoint;
      void main() {
        worldPoint = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D photograph;
      uniform float refDistance;
      uniform float deskLayer;
      varying vec3 worldPoint;
      #ifdef RAIN_GLASS
        uniform float rainSeconds;

        float glassPane(vec2 uv, float left, float right) {
          return smoothstep(left, left + 0.012, uv.x) *
            (1.0 - smoothstep(right - 0.012, right, uv.x));
        }

        float rainDrop(vec2 uv) {
          float onGlass = (glassPane(uv, 0.48, 0.738) + glassPane(uv, 0.79, 0.915)) *
            smoothstep(0.327, 0.351, uv.y) * (1.0 - smoothstep(0.97, 0.999, uv.y));
          vec2 grid = uv * vec2(39.0, 8.0);
          float lane = floor(grid.x);
          float speed = 0.16 + fract(sin(lane * 74.81) * 2937.17) * 0.19;
          grid.y += rainSeconds * speed;
          vec2 cell = floor(grid);
          float seed = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
          vec2 local = fract(grid);
          float dx = abs(local.x - 0.18 - 0.64 * seed);
          float dy = local.y - 0.32;
          float bead = 1.0 - smoothstep(0.62, 1.0, length(vec2(dx / 0.043, dy / 0.026)));
          float tail = (1.0 - smoothstep(0.005, 0.019, dx)) *
            smoothstep(-0.009, 0.025, dy) * (1.0 - smoothstep(0.10, 0.37, dy));
          return onGlass * step(0.67, seed) * (bead + 0.34 * tail);
        }
      #endif
      void main() {
        vec2 projected = worldPoint.xy * (refDistance / (refDistance - worldPoint.z));
        vec2 uv = vec2(0.5) + projected * vec2(0.87, 0.87 * 16.0 / 9.0);
        float blend = smoothstep(-0.46, -0.34, worldPoint.z) *
          (1.0 - smoothstep(0.31, 0.44, abs(projected.x)));
        vec3 color = texture2D(photograph, uv).rgb;
        #ifdef RAIN_GLASS
          float drop = rainDrop(uv);
          vec3 bent = texture2D(photograph, uv + vec2(0.0015, -0.0028) * drop).rgb;
          color = mix(color, bent, drop * 0.64) + vec3(0.039, 0.048, 0.056) * drop;
        #endif
        gl_FragColor = vec4(color, mix(1.0, blend, deskLayer));
        #include <colorspace_fragment>
      }
    `,
  });
}

function woodGrain() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#dedbd6';
  ctx.fillRect(0, 0, 768, 256);
  for (let row = 1; row < 256; row += 2) {
    ctx.beginPath();
    ctx.strokeStyle = row % 7 === 0 ? '#ffffffe0' : '#60452932';
    ctx.lineWidth = row % 9 === 0 ? 1.6 : 0.6;
    for (let x = 0; x <= 768; x += 16) {
      ctx.lineTo(x, row + Math.sin(x * 0.013 + row * 0.11) * 1.8 + Math.sin(x * 0.005 + row * 0.41) * 3);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function softShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const shade = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  shade.addColorStop(0, 'rgba(21, 15, 12, 0.92)');
  shade.addColorStop(0.55, 'rgba(21, 15, 12, 0.48)');
  shade.addColorStop(1, 'rgba(21, 15, 12, 0)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paintDisplay(ctx, now, weather, rainy) {
  const paper = ctx.createLinearGradient(0, 516, 1200, 0);
  paper.addColorStop(0, rainy ? '#d4bc95' : '#d1c8b4');
  paper.addColorStop(0.52, rainy ? '#c7b89a' : '#e0dccc');
  paper.addColorStop(1, rainy ? '#b7b3a0' : '#e9e7d9');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 1200, 516);

  function label(value, x, y, size, color = ink, weight = 500, alignment = 'left', font = system, maxWidth) {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = alignment;
    if (maxWidth) ctx.fillText(value, x, y, maxWidth);
    else ctx.fillText(value, x, y);
  }

  function line(x, y, endX, endY) {
    ctx.strokeStyle = '#9d9e8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  const month = now.getMonth();
  const year = now.getFullYear();
  const day = now.getDate();
  label('本地时间', 45, 58, 31, muted, 600);
  label(`${two(now.getHours())}:${two(now.getMinutes())}`, 39, 221, 175, ink, 650, 'left', numbers);
  label(`${month + 1} 月 ${day} 日   星期${weekday[now.getDay()]}`, 48, 284, 42, ink, 550);
  line(47, 318, 600, 318);
  label(`${weather.city}  ·  室外${weather.stale ? '  ·  上次更新' : ''}`, 48, 365, 31, muted, 600, 'left', system, 540);
  if (weather.temperature == null) {
    label(weather.label, 48, 452, 47, ink, 600);
  } else {
    label(`${weather.temperature}°`, 45, 464, 94, ink, 650, 'left', numbers);
    label(weather.label, 231, 417, 36, ink, 600, 'left', system, 157);
    const limits = weather.low == null || weather.high == null ? '' : `${weather.low}° / ${weather.high}°`;
    label(limits, 232, 470, 33, muted, 550, 'left', numbers);
    if (weather.humidity != null) {
      label('室外湿度', 414, 416, 31, muted, 550);
      label(`${weather.humidity}%`, 414, 476, 56, ink, 650, 'left', numbers);
    }
  }

  line(635, 42, 635, 474);
  label(`${year} 年 ${month + 1} 月`, 675, 76, 42, ink, 650);
  line(675, 107, 1152, 107);
  const start = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < 7; i += 1) {
    label(weekday[(i + 1) % 7], 709 + i * 68, 152, 30, muted, 600, 'center');
  }
  for (let value = 1; value <= count; value += 1) {
    const index = start + value - 1;
    const x = 709 + (index % 7) * 68;
    const y = 207 + Math.floor(index / 7) * 47;
    if (value === day) {
      ctx.fillStyle = '#495648';
      ctx.beginPath();
      ctx.arc(x, y - 11, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    label(String(value), x, y, 35, value === day ? '#f5f0df' : ink, 600, 'center', numbers);
  }
}
