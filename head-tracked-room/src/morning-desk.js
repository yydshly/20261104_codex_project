import * as THREE from 'three';

const sans = '"Microsoft YaHei", "Segoe UI", sans-serif';
const serif = 'Georgia, "Microsoft YaHei", serif';
const mono = 'Consolas, "Segoe UI", monospace';
const paper = '#f8e8cb';
const ink = '#352b28';
const accent = '#a04131';
const days = ['日', '一', '二', '三', '四', '五', '六'];
const two = value => String(value).padStart(2, '0');

export function createMorningDesk() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#342c27');
  let dirty = true;
  let weather = { city: '北京', label: '正在获取天气' };
  let lastSecond = '';
  let lastDate = '';
  const images = new THREE.TextureLoader();
  const finish = color => new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const wood = new THREE.MeshStandardMaterial({ color: '#674332', roughness: 0.83 });
  const darkWood = new THREE.MeshStandardMaterial({ color: '#4a3329', roughness: 0.82 });
  const rim = finish('#b68a5c');

  function add(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  function box(w, h, d, x, y, z, material) {
    return add(new THREE.BoxGeometry(w, h, d), material, x, y, z);
  }

  function illustration(name, w, h, x, y, z, cutout) {
    const material = new THREE.MeshBasicMaterial({
      toneMapped: false, alphaTest: cutout ? 0.61 : 0,
      alphaToCoverage: cutout,
    });
    const plate = add(new THREE.PlaneGeometry(w, h), material, x, y, z);
    plate.visible = false;
    images.load(import.meta.env.BASE_URL + 'morning-desk/' + name + '.png', map => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 4;
      material.map = map;
      material.needsUpdate = true;
      plate.visible = true;
      dirty = true;
    });
  }

  function plaque(w, h, x, y, z, pixelW, pixelH, backing) {
    const canvas = document.createElement('canvas');
    canvas.width = pixelW;
    canvas.height = pixelH;
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    box(w + 0.009, h + 0.009, 0.013, x, y, z - 0.007, backing);
    add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, toneMapped: false }), x, y, z);
    return paint => {
      paint(canvas.getContext('2d'));
      map.needsUpdate = true;
    };
  }

  scene.add(new THREE.HemisphereLight('#ffe9cc', '#63504c', 1.6));
  const sun = new THREE.DirectionalLight('#ffbf80', 2.15);
  sun.position.set(-0.46, 0.55, -0.12);
  scene.add(sun);

  illustration('veranda', 2.06, 1.16, 0, -0.006, -0.60, false);
  box(1.04, 0.028, 0.64, 0, -0.247, -0.282, darkWood);
  const planks = ['#765044', '#815540', '#6b4b40'].map(color =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
  for (let index = 0; index < 12; index += 1) {
    box(0.081, 0.003, 0.58, (index - 5.5) * 0.085, -0.232, -0.257, planks[index % planks.length]);
  }
  for (const side of [-1, 1]) {
    box(0.035, 0.55, 0.038, side * 0.479, 0, -0.225, darkWood);
    box(0.028, 0.022, 0.047, side * 0.466, 0.19, -0.222, wood);
    box(0.031, 0.024, 0.039, side * 0.462, -0.202, -0.22, wood);
  }

  // The outer surround is fixed to the display plane.
  const openingX = 0.461;
  const top = 0.227;
  const bottom = -0.249;
  const frame = finish('#282321');
  for (const [w, h, x, y] of [
    [1.2, 0.6 - top, 0, (0.6 + top) / 2],
    [1.2, 0.6 + bottom, 0, (bottom - 0.6) / 2],
    [0.6 - openingX, top - bottom, -(0.6 + openingX) / 2, (top + bottom) / 2],
    [0.6 - openingX, top - bottom, (0.6 + openingX) / 2, (top + bottom) / 2],
  ]) add(new THREE.PlaneGeometry(w, h), frame, x, y, 0);
  for (const y of [top, bottom]) add(new THREE.PlaneGeometry(2 * openingX, 0.002), rim, 0, y, 0.001);
  for (const side of [-1, 1]) {
    add(new THREE.PlaneGeometry(0.002, top - bottom), rim, side * openingX, (top + bottom) / 2, 0.001);
    box(0.229, 0.018, 0.222, side * 0.304, -0.249, 0.029, darkWood);
    box(0.219, 0.005, 0.216, side * 0.304, -0.238, 0.029, wood);
  }

  illustration('sasuke', 0.328, 0.492, -0.304, 0.011, 0.082, true);
  illustration('naruto', 0.325, 0.4875, 0.307, 0.0088, 0.079, true);

  const calendarBoard = plaque(0.256, 0.218, -0.137, 0.025, 0.126, 720, 616, darkWood);
  const clockBoard = plaque(0.256, 0.177, 0.143, 0.04, 0.126, 720, 498, darkWood);
  const weatherBoard = plaque(0.352, 0.103, 0.005, -0.155, 0.153, 960, 281, darkWood);
  const placard = plaque(0.187, 0.033, 0, 0.264, 0.0018, 750, 132, darkWood);
  placard(ctx => {
    base(ctx, '#282321', '#8b694d');
    write(ctx, '木 叶  ·  晨 间 桌', 375, 81, 43, sans, '#ead3ae', 'center', 600);
  });
  weatherBoard(ctx => drawWeather(ctx, weather));

  return {
    scene,
    setWeather(next) {
      weather = next;
      weatherBoard(ctx => drawWeather(ctx, weather));
      dirty = true;
    },
    update(now) {
      const second = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (second !== lastSecond) {
        clockBoard(ctx => drawClock(ctx, now));
        lastSecond = second;
        dirty = true;
      }
      if (date !== lastDate) {
        calendarBoard(ctx => drawCalendar(ctx, now));
        lastDate = date;
        dirty = true;
      }
      const needsRender = dirty;
      dirty = false;
      return needsRender;
    },
  };
}

function base(ctx, fill, line) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = line;
  ctx.lineWidth = 3;
  ctx.strokeRect(13, 13, width - 26, height - 26);
}

function write(ctx, text, x, y, size, family, color, align = 'left', weight = 400, maxWidth) {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  if (maxWidth) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
}

function rule(ctx, x1, x2, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function drawCalendar(ctx, now) {
  base(ctx, paper, '#c8a477');
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  write(ctx, '佐助  /  本月日历', 45, 64, 29, sans, accent, 'left', 700);
  write(ctx, `${year} 年 ${month + 1} 月`, 45, 142, 62, sans, ink, 'left', 700);
  rule(ctx, 45, 675, 171, '#c8a477');
  const week = ['一', '二', '三', '四', '五', '六', '日'];
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  for (const [index, day] of week.entries()) write(ctx, day, 87 + index * 91, 225, 34, sans, '#806b58', 'center');
  for (let day = 1; day <= length; day += 1) {
    const position = offset + day - 1;
    const x = 87 + position % 7 * 91;
    const y = 283 + Math.floor(position / 7) * 57;
    if (day === today) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y - 13, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    write(ctx, day, x, y, 40, mono, day === today ? '#fff3d5' : ink, 'center', 700);
  }
}

function drawClock(ctx, now) {
  base(ctx, '#242926', '#ae865e');
  write(ctx, '鸣人  /  本地时间', 49, 79, 33, sans, '#f0bb84', 'left', 700);
  rule(ctx, 49, 671, 109, '#665748');
  const time = `${two(now.getHours())}:${two(now.getMinutes())}`;
  write(ctx, time, 41, 306, 188, mono, '#fff0cd', 'left', 700);
  write(ctx, two(now.getSeconds()), 662, 305, 55, mono, '#e0ad74', 'right', 600);
  rule(ctx, 49, 671, 349, '#665748');
  write(ctx, `${now.getMonth() + 1} 月 ${now.getDate()} 日   ·   星期${days[now.getDay()]}`, 50, 429, 47, sans, '#f0dcc2', 'left', 500);
}

function drawWeather(ctx, weather) {
  base(ctx, '#ead3a8', '#b78959');
  write(ctx, weather.city + '  /  今日天气', 48, 66, 37, sans, accent, 'left', 700, 860);
  rule(ctx, 48, 911, 90, '#bb946a');
  if (weather.temperature == null) {
    write(ctx, weather.label, 48, 181, 51, sans, ink, 'left', 700);
    return;
  }
  write(ctx, `${weather.temperature}°`, 46, 222, 126, serif, ink, 'left', 700);
  write(ctx, weather.label, 310, 162, 59, sans, ink, 'left', 700, 450);
  const range = weather.low == null || weather.high == null ? '' : `${weather.low}° 至 ${weather.high}°`;
  const rain = weather.rain == null ? '' : `降雨 ${weather.rain}%`;
  const details = [range, rain].filter(Boolean).join('   ·   ');
  write(ctx, details, 310, 220, 44, sans, '#624b37', 'left', 600, 600);
  if (weather.stale) write(ctx, '上次更新', 903, 67, 28, sans, accent, 'right', 700);
}
