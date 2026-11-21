import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU = Math.PI * 2;
const CLOCK_WIDTH = 0.192;
const CLOCK_HEIGHT = 0.077;
const FIGURE_Z = -0.067;
const CLOCK_Z = -0.031;
const CLOCK_Y = 0.297;

const matte = (color, options) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...options });
const flat = color => new THREE.MeshBasicMaterial({ color, toneMapped: false });

function mesh(parent, geometry, material, x, y, z, shadow = true) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  part.castShadow = part.receiveShadow = shadow;
  parent.add(part);
  return part;
}

function texture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  paint?.(ctx, width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return { map, ctx, width, height };
}

function seededRandom(seed) {
  return () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296);
}

function oakSurface() {
  return texture(1536, 1024, (ctx, w, h) => {
    const random = seededRandom(13);
    const row = 84;
    for (let y = 0; y < h; y += row) {
      const shift = Math.floor(random() * 410) - 570;
      for (let x = shift; x < w; x += 560) {
        const t = random() * 7;
        ctx.fillStyle = `hsl(34 54% ${66 + t}%)`;
        ctx.fillRect(x, y, 560, row);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, 560, row);
        ctx.clip();
        for (let n = 0; n < 180; n++) {
          const sx = x - 120 + random() * 640;
          const sy = y + random() * row;
          const length = 28 + random() * 410;
          const bend = (random() - 0.5) * 12;
          ctx.strokeStyle = n % 3 ? `rgba(94,61,29,${0.025 + random() * 0.10})` : '#fff2c728';
          ctx.lineWidth = 0.25 + random() * 1.9;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.bezierCurveTo(sx + length * .32, sy + bend, sx + length * .68, sy - bend, sx + length, sy);
          ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = '#9e78495a';
        ctx.fillRect(x, y, 1.25, row);
      }
      ctx.fillStyle = '#a17d545c';
      ctx.fillRect(0, y, w, 1.2);
      ctx.fillStyle = '#ffefcd88';
      ctx.fillRect(0, y + 1.2, w, 1);
    }
  }).map;
}

function tileSurface() {
  const { map } = texture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e4e9ec';
    ctx.fillRect(0, 0, w, h);
    const glaze = ctx.createLinearGradient(0, 0, w, h);
    glaze.addColorStop(0, '#f1f3f6');
    glaze.addColorStop(.66, '#dce4e9');
    glaze.addColorStop(1, '#d6dfe4');
    ctx.fillStyle = glaze;
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#ffffff72';
    ctx.strokeRect(3, 3, w - 6, h - 6);
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(13, 6.2);
  return map;
}

function addCactus(room, x, z) {
  const pot = matte('#62a894');
  const foliage = matte('#7ea463');
  const fresh = matte('#9db977');
  mesh(room, new THREE.CylinderGeometry(.032, .023, .044, 36), pot, x, .022, z);
  mesh(room, new THREE.TorusGeometry(.030, .0026, 10, 38), pot, x, .044, z).rotation.x = Math.PI / 2;
  mesh(room, new THREE.CircleGeometry(.029, 32), matte('#685a42'), x, .043, z).rotation.x = -Math.PI / 2;
  const paddle = (dx, y, dz, w, h, lean, color) => {
    const part = mesh(room, new THREE.SphereGeometry(1, 24, 16), color, x + dx, y, z + dz);
    part.scale.set(w, h, w * .55);
    part.rotation.z = lean;
  };
  paddle(0, .061, 0, .018, .031, -.04, foliage);
  paddle(-.013, .102, -.004, .018, .029, .26, foliage);
  paddle(.018, .090, .008, .016, .022, -.62, fresh);
  paddle(.024, .123, .006, .012, .022, -.20, fresh);
}

function addLamp(room, x, z) {
  const base = matte('#3f4789', { roughness: .48 });
  const stem = matte('#d7e2ef', { roughness: .3, metalness: .14 });
  mesh(room, new THREE.CylinderGeometry(.039, .043, .015, 48), base, x, .008, z);
  mesh(room, new THREE.CylinderGeometry(.0038, .0038, .548, 18), stem, x, .279, z);
  mesh(room, new THREE.CylinderGeometry(.0054, .0063, .024, 18), base, x, .025, z);
}

function addStack(room, x, z) {
  for (const [radius, y, color] of [
    [.038, .026, '#ebc5d7'], [.031, .064, '#e8c8df'],
    [.026, .097, '#c9c1e7'], [.021, .125, '#f4e2f0'],
  ]) {
    const ring = mesh(room, new THREE.SphereGeometry(radius, 32, 20), matte(color), x, y, z);
    ring.scale.y = .67;
  }
  mesh(room, new THREE.SphereGeometry(.015, 28, 16), matte('#f2e5ed'), x, .151, z);
}

function addClock(room) {
  const clock = new THREE.Group();
  clock.position.set(0, CLOCK_Y, CLOCK_Z);
  room.add(clock);
  const { map, ctx } = texture(1024, 384);
  mesh(clock, new RoundedBoxGeometry(CLOCK_WIDTH, CLOCK_HEIGHT, .018, 4, .0035),
    matte('#343e3d', { roughness: .43 }), 0, 0, 0);
  mesh(clock, new THREE.PlaneGeometry(CLOCK_WIDTH - .009, CLOCK_HEIGHT - .009),
    new THREE.MeshBasicMaterial({ map, toneMapped: false }), 0, 0, .0092, false);

  let lastMinute = -1;
  return now => {
    const minute = Math.floor(now.getTime() / 60_000);
    if (minute === lastMinute) return false;
    lastMinute = minute;
    const digits = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    ctx.fillStyle = '#e9e9e1';
    ctx.fillRect(0, 0, 1024, 384);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 220px Arial, sans-serif';
    for (const [i, x] of [30, 244, 580, 794].entries()) {
      ctx.fillStyle = '#333432';
      ctx.fillRect(x, 24, 200, 257);
      ctx.fillStyle = '#41413e';
      ctx.fillRect(x, 153, 200, 128);
      ctx.fillStyle = '#f9f8ef';
      ctx.fillText(digits[i], x + 100, 161);
      ctx.fillStyle = '#101311';
      ctx.fillRect(x, 151, 200, 4);
      ctx.fillStyle = '#ffffff25';
      ctx.fillRect(x, 155, 200, 2);
    }
    ctx.fillStyle = '#32342f';
    for (const y of [119, 183]) {
      ctx.beginPath();
      ctx.arc(512, y, 7.5, 0, TAU);
      ctx.fill();
    }
    ctx.font = '500 35px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#565650';
    ctx.fillText(`${now.getMonth() + 1}月${now.getDate()}日   ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]}`, 512, 331);
    map.needsUpdate = true;
    return true;
  };
}

export function createReferenceClock(onStatus) {
  const scene = new THREE.Scene();
  const border = '#211f1e';
  scene.background = new THREE.Color(border);
  scene.add(new THREE.HemisphereLight('#f2f7ff', '#cbb29b', 1.83));
  const key = new THREE.DirectionalLight('#fff9f0', 1.38);
  key.position.set(-.39, .45, .68);
  key.target.position.set(.06, -.15, -.38);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -.66, right: .66, top: .65, bottom: -.65, near: .03, far: 1.9 });
  key.shadow.normalBias = .0007;
  key.shadow.bias = -.00007;
  key.shadow.radius = 2.5;
  scene.add(key, key.target);

  // The room leans back like the display in the reference. Its floor
  // recedes upwards in the opening while the screen plane stays fixed.
  const room = new THREE.Group();
  room.position.set(0, -.244, -.009);
  room.rotation.x = .375;
  scene.add(room);

  const floor = mesh(room, new THREE.PlaneGeometry(1.11, .98),
    matte('#ffffff', { map: oakSurface() }), 0, 0, -.488, false);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const back = mesh(room, new THREE.PlaneGeometry(1.12, .56),
    matte('#ffffff', { map: tileSurface(), emissive: '#a1bdd6', emissiveIntensity: .21 }), 0, .28, -.97, false);
  back.receiveShadow = true;
  const wallMaterial = matte('#c8d6e3', { emissive: '#a1bdd6', emissiveIntensity: .12 });
  for (const side of [-1, 1]) {
    const wall = mesh(room, new THREE.PlaneGeometry(.98, .56), wallMaterial,
      side * .552, .28, -.488, false);
    wall.rotation.y = -side * Math.PI / 2;
    wall.receiveShadow = true;
  }
  addCactus(room, -.385, -.25);
  addLamp(room, .296, -.67);
  addStack(room, .404, -.27);

  // Opaque meshes form the aperture on z=0. Objects behind them are
  // occluded; the bow can pass in front using normal depth testing.
  const frame = flat(border);
  const rail = (w, h, x, y) => mesh(scene, new THREE.PlaneGeometry(w, h), frame, x, y, 0, false);
  rail(2, .50, 0, .479);
  rail(2, .50, 0, -.486);
  rail(.50, .47, -.714, -.003);
  rail(.50, .47, .714, -.003);

  const updateClock = addClock(room);
  let animateFigure;
  let shadowsChanged = false;
  import('./reference-figure.js').then(({ loadReferenceFigure }) => loadReferenceFigure(room, {
    z: FIGURE_Z, clockZ: CLOCK_Z, clockY: CLOCK_Y, clockWidth: CLOCK_WIDTH,
  })).then(updateFigure => {
    animateFigure = updateFigure;
    onStatus('ready');
  }).catch(error => {
    console.error('Failed to load the reference figure', error);
    onStatus('error');
  });

  return {
    scene,
    viewGain: [.67, .44, .55],
    get shadowsChanged() { return shadowsChanged; },
    update(now, time) {
      const clockChanged = updateClock(now);
      shadowsChanged = animateFigure?.(time) ?? false;
      return clockChanged || shadowsChanged;
    },
  };
}
