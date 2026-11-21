const WIDTH = 640;
const HEIGHT = 470;

const SCENES = {
  pond: { name: '暮色池塘', hint: '点击鸭子，或点亮小屋的窗户', note: 0 },
  focus: { name: '雨窗书桌', hint: '点击台灯，或翻开桌上的书', note: 2 },
  memory: { name: '生活花园', hint: '点击花圃，让一株新芽留下来', note: 4 },
  explore: { name: '山顶观星站', hint: '点击望远镜，寻找一组星座', note: 3 },
  together: { name: '双人小屋', hint: '点击左右窗户，回应另一盏灯', note: 1 },
  learn: { name: '微型生态瓶', hint: '点击生态瓶，观察一次降雨与水循环', note: 5 },
};

const PALETTES = {
  dusk: { sky: '#a9bdba', skyLow: '#e5d9bd', far: '#7c9690', hill: '#557b70', ground: '#66816a', dark: '#2e514c', water: '#76a4a2', waterLow: '#547e80', ink: '#294343', amber: '#f5d899' },
  night: { sky: '#172c3b', skyLow: '#45616a', far: '#34545e', hill: '#294c50', ground: '#3d625a', dark: '#1c3b40', water: '#426f7e', waterLow: '#2e5267', ink: '#172f37', amber: '#f5d899' },
};

/** A dependency-free, local Canvas / Web Audio scene used as an explanatory demo. */
export function createScene(canvas, { onInteraction = () => {}, onAudioState = () => {} } = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('createScene 需要一个 canvas 元素。');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器不支持 Canvas 2D。');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { mode: 'pond', motion: true, details: true, phase: 'dusk', volume: 0.35, sound: false };
  const local = { lamp: true, book: false, plants: 2, constellation: false, leftLight: true, rightLight: false, rain: false, duck: 0 };
  let width = WIDTH;
  let height = HEIGHT;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dpr = 1;
  let animationFrame = 0;
  let elapsed = 0;
  let lastFrame = 0;
  let disposed = false;
  let hotspots = [];
  let ripple = null;
  let lastInteraction = 0;
  let audioContext = null;
  let masterGain = null;
  let noiseGain = null;
  let noiseFilter = null;
  let noiseSource = null;
  let noteTimer = 0;
  let audioRequest = 0;
  let notesPlayed = 0;
  const activeTones = new Set();

  if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');

  const seeded = (i) => {
    const value = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMoving = () => state.motion && !reducedMotion.matches;
  const palette = () => PALETTES[state.phase];

  function rounded(x, y, w, h, radius, fill, stroke = null) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function ellipse(x, y, rx, ry, fill, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function line(points, color, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function polygon(points, fill) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function glow(x, y, radius, opacity = 0.5) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,222,154,${opacity})`);
    gradient.addColorStop(0.5, `rgba(255,205,119,${opacity * 0.25})`);
    gradient.addColorStop(1, 'rgba(255,205,119,0)');
    ellipse(x, y, radius, radius, gradient);
  }

  function addHotspot(x, y, w, h, action, label) {
    hotspots.push({ x, y, w, h, action, label });
  }

  function stars(count = 35, horizon = 230) {
    if (!state.details) return;
    for (let i = 0; i < count; i += 1) {
      const x = 32 + seeded(i + 1) * 576;
      const y = 28 + seeded(i + 101) * horizon;
      const shimmer = isMoving() ? 0.65 + Math.sin(elapsed * 0.5 + i) * 0.2 : 0.8;
      ellipse(x, y, i % 7 === 0 ? 1.7 : 1, i % 7 === 0 ? 1.7 : 1, '#fff3cc', shimmer);
    }
  }

  function sky() {
    const p = palette();
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, p.sky);
    gradient.addColorStop(1, p.skyLow);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (state.phase === 'night') {
      stars();
      glow(529, 77, 69, 0.17);
      ellipse(529, 77, 19, 19, '#e7e7c9');
      ellipse(536, 71, 17, 17, p.sky);
    } else {
      glow(512, 111, 95, 0.25);
      ellipse(512, 111, 30, 30, '#f3e8c4', 0.8);
      if (state.details) {
        const drift = isMoving() ? Math.sin(elapsed * 0.04) * 12 : 0;
        ellipse(155 + drift, 80, 76, 12, '#e8e9d7', 0.35);
        ellipse(382 + drift, 144, 100, 10, '#e8e9d7', 0.2);
      }
    }
  }

  function hills(y = 235) {
    const p = palette();
    ctx.beginPath();
    ctx.moveTo(0, y + 70);
    ctx.bezierCurveTo(90, y - 80, 170, y + 5, 260, y - 30);
    ctx.bezierCurveTo(365, y - 105, 480, y + 25, 640, y - 53);
    ctx.lineTo(640, 470);
    ctx.lineTo(0, 470);
    ctx.fillStyle = p.far;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, y + 85);
    ctx.bezierCurveTo(145, y + 5, 220, y + 97, 365, y + 28);
    ctx.bezierCurveTo(470, y - 6, 590, y + 77, 640, y + 33);
    ctx.lineTo(640, 470);
    ctx.lineTo(0, 470);
    ctx.fillStyle = p.hill;
    ctx.fill();
  }

  function tree(x, y, size = 1, foreground = false) {
    const p = palette();
    const sway = isMoving() && state.details ? Math.sin(elapsed * 0.65 + x) * 1.2 * size : 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ellipse(0, 3, 19, 7, '#102e2c', 0.14);
    line([[0, 0], [sway * 0.3, -49]], '#665847', 6);
    const colors = foreground ? [p.dark, '#426b5c', '#5f8066'] : [p.hill, p.ground, '#819476'];
    ellipse(-13 + sway, -47, 21, 27, colors[0]);
    ellipse(15 + sway, -52, 21, 29, colors[1]);
    ellipse(sway, -69, 23, 26, colors[2]);
    if (state.details) {
      for (let i = 0; i < 8; i += 1) ellipse(-20 + seeded(i + x) * 39 + sway, -85 + seeded(i + 22) * 45, 5, 2.5, '#b4b98a', 0.12);
    }
    ctx.restore();
  }

  function house(x, y, size = 1, lamp = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    ellipse(0, 33, 61, 17, '#203b36', 0.23);
    polygon([[-46, -25], [17, -37], [17, 28], [-46, 40]], '#d3c5a4');
    polygon([[17, -37], [53, -16], [53, 35], [17, 28]], '#aa9e7f');
    polygon([[-58, -24], [-12, -72], [66, -26], [14, -36]], '#9a6750');
    polygon([[-12, -72], [24, -74], [66, -26]], '#785243');
    polygon([[-58, -24], [-12, -72], [14, -36]], '#b07c58');
    rounded(-32, -13, 23, 29, 2, lamp ? '#f5d796' : '#51676a');
    line([[-20, -12], [-20, 16]], '#837c64', 2);
    line([[-31, 1], [-9, 1]], '#837c64', 2);
    polygon([[29, -14], [43, -7], [43, 13], [29, 8]], lamp ? '#e9cb88' : '#4b6263');
    polygon([[-1, 3], [11, 0], [11, 29], [-1, 32]], '#6f6855');
    if (lamp) glow(-21, 1, 55, state.phase === 'night' ? 0.5 : 0.23);
    if (state.details) {
      line([[-46, 20], [17, 8], [53, 23]], '#877d63', 2);
      line([[17, -35], [17, 28]], '#877d63', 3);
      rounded(26, -72, 12, 22, 1, '#8c8470');
      const steamY = isMoving() ? Math.sin(elapsed * 0.45) * 4 : 0;
      ellipse(33, -86 + steamY, 8, 11, '#e8e5d7', 0.18);
      ellipse(40, -103 + steamY, 12, 9, '#e8e5d7', 0.12);
    }
    ctx.restore();
  }

  function waterLines(cx, cy, rx, ry, count = 14) {
    if (!state.details) return;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < count; i += 1) {
      const x = cx - rx + seeded(i + 130) * rx * 2;
      const y = cy - ry + seeded(i + 270) * ry * 2;
      const drift = isMoving() ? Math.sin(elapsed * 0.8 + i) * 7 : 0;
      line([[x + drift, y], [x + 12 + seeded(i) * 25 + drift, y]], '#d0e3d7', 1.1);
      ctx.globalAlpha = 0.2;
    }
    ctx.restore();
  }

  function drawRipple() {
    if (!ripple) return;
    const age = elapsed - ripple.time;
    if (age > 2.6 && isMoving()) { ripple = null; return; }
    ctx.save();
    ctx.globalAlpha = isMoving() ? Math.max(0, 0.65 - age * 0.24) : 0.5;
    const radius = isMoving() ? 15 + age * 30 : 35;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y, radius + i * 14, (radius + i * 14) * 0.3, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#e9edd8';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPond() {
    const p = palette();
    sky();
    hills(230);
    tree(559, 300, 1.35);
    tree(499, 284, 0.9);
    tree(113, 297, 1.2);
    ellipse(323, 360, 269, 76, '#1d413d', 0.2);
    ellipse(320, 339, 271, 80, '#786f55');
    ellipse(320, 330, 270, 80, p.ground);
    const waterGradient = ctx.createLinearGradient(0, 245, 0, 390);
    waterGradient.addColorStop(0, p.water);
    waterGradient.addColorStop(1, p.waterLow);
    ellipse(277, 323, 201, 74, '#a7ad8a');
    ellipse(272, 320, 194, 69, waterGradient);
    waterLines(272, 320, 188, 65);
    house(456, 266, 0.94, local.lamp);
    addHotspot(408, 210, 92, 95, 'lamp', '小屋窗户');
    const float = isMoving() ? Math.sin(elapsed * 1.35) * 2 : 0;
    const duckX = 258 + (isMoving() ? Math.sin(elapsed * 0.13) * 21 : 0);
    const duckY = 327 + float;
    ctx.save();
    ctx.translate(duckX, duckY);
    if (local.duck % 2) ctx.scale(-1, 1);
    ellipse(0, 10, 23, 5, '#b8d1c1', 0.24);
    ellipse(0, 0, 19, 11, '#eee9c9');
    ellipse(12, -10, 9, 10, '#f2edce');
    polygon([[19, -12], [29, -8], [19, -5]], '#d4a15e');
    polygon([[-13, 0], [-25, -7], [-20, 5]], '#e8e3c4');
    ellipse(15, -12, 1.3, 1.3, '#314341');
    ellipse(-2, 0, 10, 5, '#d6d8b8');
    ctx.restore();
    addHotspot(duckX - 37, duckY - 30, 77, 57, 'duck', '池塘中的鸭子');
    drawRipple();
    if (state.details) {
      [[141, 352], [181, 363], [379, 309], [344, 354]].forEach(([x, y], i) => {
        ellipse(x, y, 9 + i, 3.5, '#6d8c69');
        line([[x, y], [x + 8, y - 1]], '#aab593', 0.8);
      });
      for (let i = 0; i < 11; i += 1) ellipse(372 + seeded(i + 22) * 108, 340 + seeded(i + 50) * 37, 4.5, 2.6, '#b8b18b', 0.8);
      tree(532, 380, 1.1, true);
      tree(89, 361, 1.16, true);
      fireflies(30, 130, 245, 405);
    }
  }

  function fireflies(count, x, y, right) {
    if (!state.details || state.phase !== 'night') return;
    for (let i = 0; i < count; i += 1) {
      const px = x + seeded(i + 305) * (right - x);
      const py = y + seeded(i + 505) * 110;
      const movement = isMoving() ? Math.sin(elapsed * 0.55 + i) * 4 : 0;
      ellipse(px + movement, py - movement, 1.5, 1.5, '#f0dda1', 0.25 + Math.abs(Math.sin((isMoving() ? elapsed : 1) * 0.5 + i)) * 0.45);
    }
  }

  function drawFocus() {
    const night = state.phase === 'night';
    const wallGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    wallGradient.addColorStop(0, night ? '#354d52' : '#9ca79a');
    wallGradient.addColorStop(1, night ? '#283e44' : '#c3bea1');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    rounded(76, 55, 329, 237, 11, '#63766a');
    rounded(85, 64, 311, 216, 5, night ? '#253f51' : '#90adb0');
    ctx.save();
    ctx.beginPath();
    ctx.rect(85, 64, 311, 216);
    ctx.clip();
    polygon([[80, 226], [130, 150], [183, 215], [230, 174], [302, 231], [407, 159], [407, 300], [80, 300]], night ? '#375860' : '#6d9288');
    tree(149, 287, 1.1);
    tree(351, 285, 0.9);
    if (night) ellipse(321, 107, 16, 16, '#d5deca', 0.75);
    if (state.details) {
      for (let i = 0; i < 34; i += 1) {
        const px = 94 + seeded(i + 110) * 294;
        const py = 65 + ((seeded(i + 90) * 215 + (isMoving() ? elapsed * (17 + seeded(i) * 10) : 0)) % 215);
        line([[px, py], [px - 3, py + 12]], '#d4e2de', 0.8);
      }
    }
    ctx.restore();
    line([[240, 65], [240, 279]], '#667d71', 9);
    line([[86, 174], [395, 174]], '#667d71', 8);
    rounded(66, 282, 352, 14, 3, '#7f8570');
    polygon([[45, 352], [479, 306], [604, 373], [160, 432]], '#b99b70');
    polygon([[160, 432], [604, 373], [604, 390], [160, 450]], '#887859');
    polygon([[45, 352], [160, 432], [160, 450], [45, 370]], '#97805d');
    line([[109, 397], [109, 470]], '#6d6c54', 13);
    line([[545, 404], [545, 470]], '#6d6c54', 12);
    // A lamp is both a visible object and a controllable source of light.
    ellipse(459, 350, 35, 13, '#4b655d');
    line([[459, 347], [459, 231], [424, 213]], '#526d62', 9);
    polygon([[395, 204], [441, 215], [452, 251], [378, 234]], '#697e68');
    polygon([[378, 234], [452, 251], [436, 261], [389, 248]], local.lamp ? '#f1d89e' : '#8b9277');
    if (local.lamp) {
      glow(413, 259, 132, night ? 0.52 : 0.38);
      ellipse(359, 359, 89, 29, '#f4d49b', 0.16);
    }
    addHotspot(376, 190, 112, 174, 'lamp', '书桌台灯');
    if (local.book) {
      polygon([[220, 338], [282, 347], [292, 388], [228, 373]], '#e9dfbd');
      polygon([[282, 347], [338, 325], [355, 364], [292, 388]], '#f1e6c5');
      line([[282, 347], [292, 388]], '#b4a989', 2);
      for (let i = 0; i < 4; i += 1) {
        line([[234, 347 + i * 6], [274, 355 + i * 6]], '#b9af91', 0.8);
        line([[296, 349 + i * 6], [329, 336 + i * 6]], '#b9af91', 0.8);
      }
    } else {
      polygon([[227, 343], [314, 328], [339, 369], [250, 387]], '#647d69');
      polygon([[250, 380], [336, 363], [339, 369], [250, 387]], '#e4dbc0');
      line([[237, 346], [259, 379]], '#88a088', 2);
    }
    addHotspot(213, 324, 149, 75, 'book', '桌上的书');
    if (state.details) {
      ellipse(181, 361, 22, 9, '#d9d1ac');
      rounded(163, 327, 35, 34, 8, '#d5cfb1');
      ellipse(180, 328, 17.5, 6.5, '#7c7460');
      ctx.beginPath(); ctx.arc(201, 340, 10, -1.3, 1.3); ctx.strokeStyle = '#d5cfb1'; ctx.lineWidth = 5; ctx.stroke();
      if (isMoving()) {
        const steamY = Math.sin(elapsed * 0.8) * 5;
        line([[177, 313], [172, 303 + steamY], [179, 294 + steamY]], 'rgba(239,231,205,0.35)', 2);
      }
      ellipse(522, 296, 29, 8, '#4a6051');
      polygon([[499, 297], [546, 297], [539, 327], [506, 327]], '#8a8066');
      leaf(519, 295, 498, 244, 18, '#547e68');
      leaf(519, 295, 543, 252, 17, '#638c6d');
      leaf(519, 295, 522, 227, 18, '#749674');
    }
  }

  function leaf(x, y, tipX, tipY, size, color) {
    const midX = (x + tipX) / 2;
    const midY = (y + tipY) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(midX - size, midY, tipX, tipY);
    ctx.quadraticCurveTo(midX + size, midY, x, y);
    ctx.fillStyle = color;
    ctx.fill();
    line([[x, y], [tipX, tipY]], '#aac49b', 0.7);
  }

  function flower(x, y, size = 1, color = '#dab58b', bloom = true) {
    const sway = isMoving() ? Math.sin(elapsed * 0.7 + x) * 2 : 0;
    line([[x, y], [x + sway, y - 24 * size]], '#648c68', 2 * size);
    leaf(x, y - 6 * size, x - 13 * size, y - 17 * size, 5 * size, '#8ba77d');
    leaf(x, y - 9 * size, x + 12 * size, y - 21 * size, 5 * size, '#759967');
    if (bloom) {
      for (let i = 0; i < 5; i += 1) {
        const a = (Math.PI * 2 * i) / 5;
        ellipse(x + sway + Math.cos(a) * 5 * size, y - 26 * size + Math.sin(a) * 5 * size, 4.7 * size, 4.7 * size, color);
      }
      ellipse(x + sway, y - 26 * size, 3 * size, 3 * size, '#e8d69a');
    }
  }

  function drawMemory() {
    const p = palette();
    sky();
    hills(213);
    ellipse(323, 367, 257, 64, '#263e33', 0.17);
    ellipse(320, 348, 263, 73, '#8b8665');
    ellipse(320, 337, 263, 73, '#86916a');
    ctx.beginPath();
    ctx.moveTo(273, 388);
    ctx.bezierCurveTo(374, 337, 230, 331, 363, 285);
    ctx.strokeStyle = '#c5b692';
    ctx.lineWidth = 27;
    ctx.stroke();
    house(423, 245, 0.83, local.lamp);
    addHotspot(382, 186, 90, 100, 'lamp', '花园小屋');
    tree(142, 283, 1.3);
    tree(515, 327, 1.04, true);
    [[215, 325], [395, 355], [173, 354]].forEach(([x, y], i) => {
      ellipse(x, y, i === 1 ? 57 : 44, 18, '#6a7154');
      ellipse(x, y - 3, i === 1 ? 55 : 42, 15, '#927e5f');
    });
    for (let i = 0; i < local.plants; i += 1) {
      const x = [197, 222, 377, 405, 165, 188, 428, 237][i];
      const y = [326, 329, 355, 359, 355, 361, 353, 319][i];
      flower(x, y, 0.8 + seeded(i + 34) * 0.35, i % 2 ? '#e2b48a' : '#c9b5b2');
    }
    addHotspot(143, 288, 311, 92, 'plant', '生活花圃');
    if (state.details) {
      line([[108, 302], [315, 280]], '#b9b48e', 3);
      for (let i = 0; i < 8; i += 1) line([[118 + i * 25, 301 - i * 2.6], [118 + i * 25, 277 - i * 2.6]], '#c5bf99', 5);
      flower(497, 364, 0.8, '#d1b8a0');
      flower(122, 349, 0.75, '#d1b8a0');
      fireflies(15, 118, 241, 484);
      for (let i = 0; i < 14; i += 1) ellipse(247 + seeded(i + 77) * 103, 352 + seeded(i + 16) * 35, 3, 2, p.dark, 0.18);
    }
  }

  function drawExplore() {
    const p = palette();
    sky();
    stars(58, 205);
    polygon([[0, 352], [114, 155], [224, 282], [365, 136], [536, 316], [640, 214], [640, 470], [0, 470]], state.phase === 'night' ? '#294655' : '#71918c');
    polygon([[114, 155], [92, 192], [111, 183], [127, 194]], '#c5d3c3', 0.6);
    polygon([[365, 136], [332, 174], [359, 161], [380, 179]], '#c5d3c3');
    polygon([[0, 412], [186, 251], [328, 346], [478, 273], [640, 399], [640, 470], [0, 470]], p.hill);
    ellipse(330, 370, 210, 57, '#1b343b', 0.3);
    ellipse(326, 355, 215, 54, '#737e6d');
    polygon([[154, 346], [351, 313], [485, 355], [285, 394]], '#acaa8a');
    polygon([[285, 394], [485, 355], [485, 367], [285, 407]], '#7d816d');
    line([[170, 339], [170, 315], [458, 329], [458, 348]], '#667f75', 5);
    line([[170, 315], [315, 292], [458, 329]], '#8c9b85', 3);
    // Tripod and telescope.
    line([[332, 306], [300, 365]], '#4d655f', 7);
    line([[332, 306], [360, 371]], '#4d655f', 7);
    line([[332, 306], [378, 346]], '#4d655f', 6);
    ctx.save();
    ctx.translate(334, 283);
    ctx.rotate(-0.48);
    rounded(-64, -15, 112, 28, 6, '#6c8a7e');
    rounded(30, -22, 25, 41, 4, '#aec0a6');
    ellipse(55, -1, 5, 19, '#263e49');
    rounded(-83, -7, 22, 12, 3, '#bcc6a9');
    ctx.restore();
    addHotspot(252, 228, 151, 139, 'stars', '山顶望远镜');
    if (local.constellation) {
      const points = [[232, 76], [277, 95], [326, 73], [356, 113], [405, 91]];
      line(points, '#f1d7a0', 1.2);
      points.forEach(([x, y]) => { glow(x, y, 12, 0.25); ellipse(x, y, 2.8, 2.8, '#f6e9bf'); });
    }
    if (state.details) {
      tree(122, 394, 0.86, true);
      tree(518, 404, 1.2, true);
      rounded(218, 339, 25, 25, 4, '#a09371');
      glow(229, 341, 37, 0.25);
      ellipse(229, 341, 6, 8, '#efcf89');
    }
  }

  function drawTogether() {
    const p = palette();
    sky();
    hills(239);
    tree(111, 329, 1.35);
    tree(537, 325, 1.2);
    ellipse(323, 371, 238, 65, '#233b36', 0.18);
    ellipse(323, 356, 241, 64, '#7b8a6b');
    // Front-facing shared cabin with two individually controllable windows.
    rounded(159, 209, 322, 155, 4, '#bfb595');
    polygon([[133, 214], [319, 122], [507, 214]], '#8e6651');
    polygon([[319, 122], [507, 214], [491, 224], [319, 141]], '#745341');
    if (state.details) {
      for (let i = 0; i < 6; i += 1) line([[163, 228 + i * 22], [477, 228 + i * 22]], '#aba184', 1.3);
    }
    rounded(190, 232, 90, 89, 4, '#7a836d');
    rounded(360, 232, 90, 89, 4, '#7a836d');
    rounded(197, 239, 76, 75, 2, local.leftLight ? '#eacf94' : '#526d73');
    rounded(367, 239, 76, 75, 2, local.rightLight ? '#eacf94' : '#526d73');
    line([[235, 240], [235, 313]], '#85856c', 5);
    line([[197, 277], [273, 277]], '#85856c', 5);
    line([[405, 240], [405, 313]], '#85856c', 5);
    line([[367, 277], [443, 277]], '#85856c', 5);
    rounded(296, 279, 48, 84, 3, '#7e8067');
    ellipse(333, 326, 2, 2, '#d6c999');
    if (local.leftLight) glow(235, 277, 77, state.phase === 'night' ? 0.45 : 0.19);
    if (local.rightLight) glow(405, 277, 77, state.phase === 'night' ? 0.45 : 0.19);
    addHotspot(185, 228, 101, 98, 'left', '左侧窗户');
    addHotspot(354, 228, 102, 98, 'right', '右侧窗户');
    if (state.details) {
      ellipse(322, 397, 58, 12, '#4d6b59', 0.25);
      polygon([[268, 368], [339, 356], [380, 378], [306, 392]], '#a68c63');
      line([[288, 383], [288, 408]], '#7e7556', 5);
      line([[359, 386], [359, 407]], '#7e7556', 5);
      ellipse(319, 373, 9, 4, '#d4d0a9');
      rounded(312, 362, 14, 12, 3, '#d4d0a9');
      ellipse(345, 371, 9, 4, '#c3c7a1');
      rounded(338, 359, 14, 12, 3, '#c3c7a1');
      flower(164, 376, 0.7, '#d0b498');
      flower(477, 374, 0.7, '#d0b498');
    }
    if (local.leftLight && local.rightLight) {
      const a = isMoving() ? 0.45 + Math.sin(elapsed * 0.7) * 0.08 : 0.5;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(237, 227);
      ctx.quadraticCurveTo(320, 177, 403, 227);
      ctx.strokeStyle = '#efd49a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  function bottlePath() {
    ctx.beginPath();
    ctx.moveTo(271, 112);
    ctx.lineTo(271, 151);
    ctx.bezierCurveTo(270, 185, 198, 181, 193, 268);
    ctx.lineTo(188, 357);
    ctx.quadraticCurveTo(192, 399, 239, 403);
    ctx.lineTo(402, 403);
    ctx.quadraticCurveTo(447, 398, 451, 357);
    ctx.lineTo(446, 268);
    ctx.bezierCurveTo(441, 181, 369, 185, 369, 151);
    ctx.lineTo(369, 112);
    ctx.closePath();
  }

  function drawLearn() {
    sky();
    const p = palette();
    ellipse(320, 414, 184, 24, p.dark, 0.15);
    rounded(160, 410, 320, 12, 6, '#8b8b6e');
    bottlePath();
    ctx.save();
    ctx.clip();
    const glass = ctx.createLinearGradient(185, 0, 450, 0);
    glass.addColorStop(0, 'rgba(222,241,222,0.32)');
    glass.addColorStop(0.4, 'rgba(222,241,222,0.1)');
    glass.addColorStop(1, 'rgba(222,241,222,0.27)');
    ctx.fillStyle = glass;
    ctx.fillRect(180, 110, 280, 310);
    ellipse(320, 374, 139, 39, '#725d45');
    ellipse(320, 355, 137, 36, '#8b7853');
    ellipse(320, 343, 135, 34, '#738a5f');
    ellipse(365, 350, 53, 16, '#79a6a2');
    waterLines(365, 350, 50, 13, 7);
    leaf(275, 342, 236, 255, 28, '#628862');
    leaf(275, 342, 309, 249, 25, '#8ca475');
    leaf(275, 342, 273, 218, 32, '#719a73');
    leaf(315, 351, 341, 292, 21, '#a6b583');
    leaf(315, 351, 302, 283, 21, '#82a275');
    leaf(407, 345, 401, 298, 15, '#8ca477');
    if (state.details) {
      for (let i = 0; i < 24; i += 1) ellipse(211 + seeded(i + 55) * 218, 365 + seeded(i + 72) * 35, 2 + seeded(i) * 3, 1.6, '#c3ac7b', 0.55);
      for (let i = 0; i < 9; i += 1) {
        const x = 218 + seeded(i + 78) * 199;
        const y = 194 + seeded(i + 19) * 89 - (isMoving() ? (elapsed * 5 + i * 8) % 25 : 0);
        ellipse(x, y, 2.2, 3.6, '#d0e3d5', 0.4);
      }
    }
    if (local.rain) {
      for (let i = 0; i < 25; i += 1) {
        const x = 230 + seeded(i + 7) * 179;
        const y = 180 + ((seeded(i + 88) * 162 + (isMoving() ? elapsed * 56 : 0)) % 162);
        line([[x, y], [x - 2, y + 10]], '#dbe9df', 1.1);
      }
      glow(320, 176, 73, 0.1);
      ellipse(292, 183, 34, 11, '#d8e0d1', 0.48);
      ellipse(333, 181, 37, 13, '#d8e0d1', 0.48);
    }
    ctx.restore();
    bottlePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(229,239,215,0.65)';
    ctx.stroke();
    line([[210, 266], [206, 332]], 'rgba(236,244,221,0.34)', 7);
    line([[429, 276], [433, 348]], 'rgba(236,244,221,0.23)', 4);
    rounded(263, 94, 113, 28, 7, '#b5a47c');
    line([[277, 102], [360, 102]], '#cabc94', 2);
    addHotspot(190, 121, 260, 284, 'rain', '微型生态瓶');
  }

  function texture() {
    if (!state.details) return;
    ctx.save();
    ctx.globalAlpha = 0.065;
    ctx.fillStyle = '#f2ecd1';
    for (let i = 0; i < 190; i += 1) ctx.fillRect(seeded(i + 41) * WIDTH, seeded(i + 281) * HEIGHT, 1.2, 1.2);
    ctx.restore();
  }

  function render() {
    if (disposed) return;
    hotspots = [];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = palette().sky;
    ctx.fillRect(0, 0, width, height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, WIDTH, HEIGHT); ctx.clip();
    if (state.mode === 'focus') drawFocus();
    else if (state.mode === 'memory') drawMemory();
    else if (state.mode === 'explore') drawExplore();
    else if (state.mode === 'together') drawTogether();
    else if (state.mode === 'learn') drawLearn();
    else drawPond();
    texture();
    const shade = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 160, WIDTH / 2, HEIGHT / 2, 400);
    shade.addColorStop(0, 'rgba(10,33,34,0)');
    shade.addColorStop(1, 'rgba(10,33,34,0.13)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }

  function frame(timestamp) {
    animationFrame = 0;
    if (disposed || document.hidden) { lastFrame = 0; return; }
    if (lastFrame) elapsed += Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;
    render();
    if (isMoving()) animationFrame = requestAnimationFrame(frame);
  }

  function requestRender() {
    if (disposed || document.hidden) return;
    render();
    if (isMoving() && !animationFrame) {
      lastFrame = 0;
      animationFrame = requestAnimationFrame(frame);
    } else if (!isMoving() && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrame = 0;
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width || WIDTH);
    height = Math.max(1, rect.height || (width * HEIGHT) / WIDTH);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    scale = Math.min(width / WIDTH, height / HEIGHT);
    offsetX = (width - WIDTH * scale) / 2;
    offsetY = (height - HEIGHT * scale) / 2;
    requestRender();
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left - offsetX) / scale, y: (event.clientY - rect.top - offsetY) / scale };
  }

  function hitAt(point) {
    return [...hotspots].reverse().find((hotspot) => point.x >= hotspot.x && point.x <= hotspot.x + hotspot.w && point.y >= hotspot.y && point.y <= hotspot.y + hotspot.h);
  }

  function interact(action) {
    const now = performance.now();
    if (now - lastInteraction < 280) return;
    lastInteraction = now;
    let title = '';
    let detail = '';
    if (action === 'duck') {
      local.duck += 1;
      ripple = { x: 258 + (isMoving() ? Math.sin(elapsed * 0.13) * 21 : 0), y: 339, time: elapsed };
      title = '鸭子回应了你'; detail = '转身与水纹由同一次点击触发；开启声音时，会同时出现一声柔和的合成提示音。';
    } else if (action === 'lamp') {
      local.lamp = !local.lamp;
      title = local.lamp ? '一盏灯亮起来了' : '灯光安静地熄灭了';
      detail = '物件状态改变，周围的光也随之改变。你能直接感受到操作留下的影响。';
    } else if (action === 'book') {
      local.book = !local.book;
      title = local.book ? '书页展开了' : '书本合上了';
      detail = '一个很小的动作，为开始与结束提供可见的仪式。';
    } else if (action === 'plant') {
      local.plants = local.plants >= 8 ? 2 : local.plants + 1;
      title = local.plants === 2 ? '花园开始了新的一轮' : '一株新芽留在了这里';
      detail = '这一株植物代表一次可见的积累。此处仅演示场景变化，没有连接你的真实记录。';
    } else if (action === 'stars') {
      local.constellation = !local.constellation;
      title = local.constellation ? '星星连成了一段线索' : '星空回到自由的样子';
      detail = '探索一个物件，环境就给出下一条可发现的信息。';
    } else if (action === 'left' || action === 'right') {
      const key = action === 'left' ? 'leftLight' : 'rightLight';
      local[key] = !local[key];
      title = local.leftLight && local.rightLight ? '两盏灯互相回应' : `${action === 'left' ? '左边' : '右边'}的灯${local[key] ? '亮了' : '熄灭了'}`;
      detail = '窗灯可以承载“我在这里”的信号。此处为单机演示，没有真实在线用户。';
    } else if (action === 'rain') {
      local.rain = !local.rain;
      title = local.rain ? '生态瓶里下起了小雨' : '小雨停了下来';
      detail = '同一个状态同时驱动云、雨滴和声音；这是水循环的示意，并非科学预测模型。';
      updateAudioProfile();
    }
    if (!title) return;
    if (state.sound && !document.hidden) playTone(action === 'duck' ? 391.995 : 329.628, 0.65, 0.07);
    canvas.setAttribute('aria-label', `${SCENES[state.mode].name}。${SCENES[state.mode].hint}。${title}`);
    onInteraction({ title, detail });
    requestRender();
  }

  function onPointer(event) {
    const hotspot = hitAt(pointFromEvent(event));
    if (hotspot) interact(hotspot.action);
  }

  function onPointerMove(event) {
    const hotspot = hitAt(pointFromEvent(event));
    canvas.style.cursor = hotspot ? 'pointer' : 'default';
    canvas.title = hotspot ? hotspot.label : SCENES[state.mode].hint;
  }

  function onKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    trigger();
  }

  function trigger(action = 'primary') {
    if (disposed) return;
    const mainActions = { pond: 'duck', focus: 'lamp', memory: 'plant', explore: 'stars', together: 'right', learn: 'rain' };
    interact(action === 'primary' ? mainActions[state.mode] : action);
  }

  function playTone(frequency, duration = 2.8, strength = 0.055) {
    if (!audioContext || audioContext.state !== 'running' || !masterGain) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(strength, now + 0.09);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope).connect(masterGain);
    activeTones.add(oscillator);
    oscillator.onended = () => { activeTones.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function updateAudioProfile() {
    if (!audioContext || !noiseFilter || !noiseGain) return;
    const now = audioContext.currentTime;
    const profiles = { pond: [730, 0.07], focus: [1250, 0.09], memory: [580, 0.055], explore: [350, 0.035], together: [480, 0.045], learn: [local.rain ? 1550 : 650, local.rain ? 0.1 : 0.045] };
    const [frequency, gain] = profiles[state.mode];
    const night = state.phase === 'night';
    noiseFilter.frequency.setTargetAtTime(frequency * (night ? 0.7 : 1), now, 0.7);
    noiseGain.gain.setTargetAtTime(gain * (night ? 0.85 : 1), now, 0.7);
    masterGain.gain.setTargetAtTime(state.volume * 0.45, now, 0.3);
  }

  function scheduleNotes() {
    clearInterval(noteTimer);
    noteTimer = 0;
    if (!state.sound || disposed) return;
    const playNext = () => {
      if (!state.sound || document.hidden || audioContext?.state !== 'running') return;
      const notes = [261.626, 293.665, 329.628, 391.995, 440, 523.251, 587.33, 659.255];
      const index = (SCENES[state.mode].note + notesPlayed * 3) % notes.length;
      playTone(notes[index] * (state.phase === 'night' ? 0.5 : 1), 3.7, 0.04);
      notesPlayed += 1;
    };
    playNext();
    noteTimer = window.setInterval(playNext, 5100);
  }

  async function setSound(enabled) {
    const request = ++audioRequest;
    if (disposed) return;
    if (!enabled) {
      state.sound = false;
      clearInterval(noteTimer);
      noteTimer = 0;
      if (audioContext && audioContext.state !== 'closed') {
        masterGain?.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.05);
        await audioContext.suspend().catch(() => {});
      }
      if (!disposed && request === audioRequest) onAudioState({ enabled: false });
      return;
    }
    try {
      if (!audioContext) {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) throw new Error('浏览器不支持 Web Audio。');
        audioContext = new AudioContextConstructor();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(audioContext.destination);
        noiseGain = audioContext.createGain();
        noiseGain.gain.value = 0.06;
        noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 730;
        noiseFilter.Q.value = 0.35;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 5, audioContext.sampleRate);
        const channel = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < channel.length; i += 1) {
          const white = Math.random() * 2 - 1;
          brown = (brown + 0.02 * white) / 1.02;
          channel[i] = brown * 3.3;
        }
        // A short edge crossfade avoids a click at the noise loop boundary.
        const edge = Math.floor(audioContext.sampleRate * 0.02);
        const seam = (channel[0] + channel[channel.length - 1]) / 2;
        for (let i = 0; i < edge; i += 1) {
          const mix = i / edge;
          channel[i] = channel[i] * mix + seam * (1 - mix);
          const tail = channel.length - 1 - i;
          channel[tail] = channel[tail] * mix + seam * (1 - mix);
        }
        noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        noiseSource.connect(noiseFilter).connect(noiseGain).connect(masterGain);
        noiseSource.start();
      }
      if (!document.hidden) await audioContext.resume();
      if (disposed || request !== audioRequest) return;
      state.sound = true;
      updateAudioProfile();
      scheduleNotes();
      onAudioState({ enabled: true });
    } catch (error) {
      if (request !== audioRequest || disposed) return;
      state.sound = false;
      clearInterval(noteTimer);
      noteTimer = 0;
      onAudioState({ enabled: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  function setMode(mode) {
    if (disposed) return;
    if (!Object.hasOwn(SCENES, mode)) mode = 'pond';
    state.mode = mode;
    ripple = null;
    canvas.setAttribute('aria-label', `${SCENES[mode].name}。${SCENES[mode].hint}。按回车键或空格键可触发主要交互。`);
    canvas.title = SCENES[mode].hint;
    updateAudioProfile();
    requestRender();
  }

  function setOptions(options = {}) {
    if (disposed) return;
    if (typeof options.motion === 'boolean') state.motion = options.motion;
    if (typeof options.details === 'boolean') state.details = options.details;
    if (options.phase === 'dusk' || options.phase === 'night') state.phase = options.phase;
    if (Number.isFinite(options.volume)) state.volume = clamp(options.volume, 0, 1);
    updateAudioProfile();
    requestRender();
  }

  function onVisibility() {
    if (document.hidden) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrame = 0;
      clearInterval(noteTimer);
      noteTimer = 0;
      if (audioContext?.state === 'running') audioContext.suspend().catch(() => {});
    } else {
      requestRender();
      if (state.sound && audioContext) {
        audioContext.resume().then(() => {
          if (!disposed && state.sound) { updateAudioProfile(); scheduleNotes(); }
        }).catch((error) => {
          state.sound = false;
          onAudioState({ enabled: false, error: error.message });
        });
      }
    }
  }

  canvas.addEventListener('click', onPointer);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', requestRender);
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvas);
  window.addEventListener('resize', resize);
  setMode('pond');
  resize();

  return {
    setMode,
    setOptions,
    setSound,
    trigger,
    getState: () => ({ ...state, reducedMotion: reducedMotion.matches, ...local }),
    dispose() {
      if (disposed) return;
      disposed = true;
      audioRequest += 1;
      state.sound = false;
      cancelAnimationFrame(animationFrame);
      clearInterval(noteTimer);
      resizeObserver?.disconnect();
      canvas.removeEventListener('click', onPointer);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', requestRender);
      window.removeEventListener('resize', resize);
      for (const oscillator of activeTones) { try { oscillator.stop(); } catch { /* Already ended. */ } }
      activeTones.clear();
      if (noiseSource) { try { noiseSource.stop(); } catch { /* Already stopped. */ } noiseSource.disconnect(); }
      audioContext?.close().catch(() => {});
    },
  };
}
