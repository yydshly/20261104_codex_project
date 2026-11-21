const SIZE = 720;
const TAU = Math.PI * 2;
const clamp = value => Math.max(0, Math.min(1, value));

function ease(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function layer() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  return canvas.getContext('2d');
}

export const lineCues = [.06, .26, .48];

export const scenes = {
  kite: {
    name: '纸鸢',
    lines: ['暮风牵纸鸢', '一根线把天拉近', '手心有晚霞'],
    beats: ['纸鸢乘风抬头', '松弛的线渐渐绷紧', '尾带掠过晚霞'],
    ink: '#533833',
    text: { x: 641, top: 407, align: 'right', width: 550, size: 49, height: 59 },
    drawPaper: ctx => washPaper(ctx, '#f5dfb7', '#dca181'),
    draw: drawKite,
  },
  rain: {
    name: '檐雨',
    lines: ['檐雨落寒塘', '一圈轻推一圈远', '水面不留痕'],
    beats: ['雨点落下，第一道水纹荡开', '另一滴雨落下，两道水纹相遇', '第三片水纹掠过字间'],
    ink: '#203975',
    drawPaper: drawRainPaper,
    draw: drawRain,
  },
  moon: {
    name: '夜航',
    lines: ['月白渡船轻', '船划开一条银路', '两岸不说话'],
    beats: ['月光落在河心', '小舟划开倒影', '桨纹在暗处散开'],
    ink: '#e8e3c7',
    text: { x: 78, top: 101, align: 'left', width: 440, size: 48, height: 58 },
    drawPaper: ctx => washPaper(ctx, '#152537', '#355964'),
    draw: drawMoon,
  },
  frost: {
    name: '窗霜',
    lines: ['夜里窗生霜', '六枝长遍每扇窗', '各是一颗星'],
    beats: ['窗格里浮出霜点', '六个方向开始结晶', '各扇窗长出不同的细枝'],
    ink: '#fff1d6',
    drawPaper: drawFrostPaper,
    draw: drawFrost,
  },
  bird: {
    name: '晨鸟',
    lines: ['枝头啄破晓', '一声啼落在纸上', '满树都是光'],
    beats: ['鸟从枝上探头', '翅膀展开，离开枝头', '晨光穿过松针'],
    ink: '#31483c',
    text: { x: 70, top: 115, align: 'left', width: 460, size: 51, height: 61 },
    drawPaper: ctx => washPaper(ctx, '#eae8c6', '#aab398'),
    draw: drawBird,
  },
};

function washPaper(ctx, light, dark, middle) {
  const paper = ctx.createLinearGradient(20, 40, 660, 690);
  paper.addColorStop(0, light);
  if (middle) paper.addColorStop(.48, middle);
  paper.addColorStop(1, dark);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawRainPaper(ctx) {
  washPaper(ctx, '#f6f1e2', '#e9e6df', '#faf7eb');
}

function drawFrostPaper(ctx) {
  ctx.fillStyle = '#a35f42';
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 3; column++) {
      const x = column * 240;
      const y = row * 490;
      const glow = ctx.createRadialGradient(x + 112, y + 101, 7, x + 126, y + 116, 175);
      glow.addColorStop(0, ['#bf8059', '#bc7952', '#c38861'][(row + column) % 3]);
      glow.addColorStop(1, '#8e503a');
      ctx.fillStyle = glow;
      ctx.fillRect(x + 5, y + 5, 230, 220);
      ctx.strokeStyle = '#6e3b2e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 5.5, y + 4.5, 230, 220);
    }
  }
  const charcoal = ctx.createLinearGradient(0, 230, SIZE, 490);
  charcoal.addColorStop(0, '#59392e');
  charcoal.addColorStop(.48, '#4d342c');
  charcoal.addColorStop(1, '#654033');
  ctx.fillStyle = charcoal;
  ctx.fillRect(0, 231, SIZE, 258);

  const random = seededRandom(8916);
  ctx.lineWidth = .8;
  for (let i = 0; i < 11000; i++) {
    const x = random() * SIZE;
    const y = random() * SIZE;
    const length = 1 + random() ** 2 * 23;
    ctx.strokeStyle = random() < .6 ? '#edb48a24' : '#2e1a1a26';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length * .27, y - length);
    ctx.stroke();
  }
}

function makePaper(scene) {
  const ctx = layer();
  scene.drawPaper(ctx);
  const pixels = ctx.getImageData(0, 0, SIZE, SIZE);
  const random = seededRandom(4962);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const grain = (random() + random() - 1) * 22;
    pixels.data[i] += grain;
    pixels.data[i + 1] += grain;
    pixels.data[i + 2] += grain;
  }
  ctx.putImageData(pixels, 0, 0);
  return ctx.canvas;
}

const circlePoints = Array.from({ length: 101 }, (_, index) => {
  const angle = index / 100 * TAU;
  return [Math.cos(angle), Math.sin(angle), Math.sin(9 * angle), Math.cos(17 * angle)];
});

function pencilRing(ctx, x, y, radius, index) {
  const wobble = Math.sin(index * 1.7) * .74;
  const scratch = Math.cos(index * .8) * .35;
  ctx.beginPath();
  circlePoints.forEach(([cos, sin, ripple, grain], point) => {
    const distance = radius + ripple * wobble + grain * scratch;
    if (point === 0) ctx.moveTo(x + cos * distance, y + sin * distance);
    else ctx.lineTo(x + cos * distance, y + sin * distance);
  });
  ctx.closePath();
  ctx.stroke();
}

const rainOrigins = [
  { x: 627, y: 108, cue: lineCues[0], reach: 512, strength: .9 },
  { x: 88, y: 633, cue: lineCues[1], reach: 508, strength: .9 },
  { x: -49, y: -36, cue: .01, reach: 740, strength: .75 },
  { x: 762, y: 790, cue: lineCues[2], reach: 730, strength: .73 },
];

function drawRain(ctx, time) {
  ctx.strokeStyle = '#405487';
  for (const { x, y, cue, reach, strength } of rainOrigins) {
    const age = Math.max(0, time - cue);
    const spread = reach * (1 - (1 - clamp(age * 2.25)) ** 2);
    const phase = age * 36 % 11;
    const rings = Math.ceil(spread / 11);
    for (let i = 0; i < rings; i++) {
      const radius = 4 + i * 11 + phase;
      if (x + radius < 0 || y + radius < 0 || x - radius > SIZE || y - radius > SIZE) continue;
      const fade = ease((spread - radius) / 185);
      const pencil = i % 5 === 0 ? 1.2 : .99;
      ctx.globalAlpha = strength * fade * (.34 + .25 * Math.exp(-radius / 125));
      ctx.lineWidth = pencil;
      pencilRing(ctx, x, y, radius, i);
    }
    const contact = ease(age / .027) * (1 - ease((age - .07) / .17));
    ctx.globalAlpha = contact * strength;
    ctx.lineWidth = 2;
    pencilRing(ctx, x, y, 2.5 + age * 29, 0);
  }
  ctx.globalAlpha = 1;
}

const flakes = [
  [118, 117, 87, .12], [358, 106, 80, -.22], [599, 117, 90, .49],
  [121, 601, 87, -.07], [367, 599, 86, .29], [605, 600, 83, -.34],
];

function makeCrystals() {
  const random = seededRandom(44321);
  return flakes.map(([x, y, radius, angle], flakeIndex) => {
    const segments = [];
    const delay = lineCues[1] - .07 + flakeIndex * .023;
    const hexagon = [];
    for (let arm = 0; arm <= 6; arm++) {
      const direction = angle + arm * TAU / 6;
      hexagon.push([x + 9 * Math.cos(direction), y + 9 * Math.sin(direction)]);
    }

    function addStroke(start, end, cue, duration, width) {
      const middle = [
        (start[0] + end[0]) / 2 + (random() - .5) * 2.2,
        (start[1] + end[1]) / 2 + (random() - .5) * 2.2,
      ];
      segments.push({ start, middle, end, cue, duration, width });
    }

    for (let arm = 0; arm < 6; arm++) {
      const direction = angle + arm * TAU / 6 + (random() - .5) * .064;
      const length = radius * (.85 + random() * .18);
      const at = distance => [x + Math.cos(direction) * distance, y + Math.sin(direction) * distance];
      const armCue = delay + random() * .032;
      addStroke(hexagon[arm], hexagon[arm + 1], delay - .09, .12, 1.4);
      addStroke(hexagon[arm], at(length), armCue, .29, 2.1);
      for (const stem of [.36, .61, .79]) {
        for (const side of [-1, 1]) {
          if (stem > .7 && random() < .27) continue;
          const start = at(length * stem);
          const branch = direction + side * (.64 + random() * .46);
          const twig = length * (.35 - stem * .18) * (.78 + random() * .38);
          const end = [start[0] + Math.cos(branch) * twig, start[1] + Math.sin(branch) * twig];
          addStroke(start, end, armCue + stem * .29, .17, stem < .6 ? 1.55 : 1.18);
        }
      }
    }
    return { x, y, delay, segments };
  });
}

const crystals = makeCrystals();

function drawFrost(ctx, time) {
  ctx.fillStyle = '#fff0d3';
  ctx.strokeStyle = '#f8e4c2';
  for (const { x, y, delay, segments } of crystals) {
    ctx.globalAlpha = .93 * ease((time - delay + .15) / .09);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, TAU);
    ctx.fill();
    for (const { start, middle, end, cue, duration, width } of segments) {
      const growth = ease((time - cue) / duration) * 2;
      if (growth <= 0) continue;
      const [from, to, fraction] = growth > 1 ? [middle, end, growth - 1] : [start, middle, growth];
      ctx.globalAlpha = .91;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(...start);
      if (growth > 1) ctx.lineTo(...middle);
      ctx.lineTo(from[0] + (to[0] - from[0]) * fraction, from[1] + (to[1] - from[1]) * fraction);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function disk(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

function drawKite(ctx, time) {
  disk(ctx, 164, 177, 77, '#fbe3ae');
  ctx.strokeStyle = '#a6584438';
  ctx.lineWidth = 1;
  for (let i = 0; i < 11; i++) {
    const y = 144 + i * 8;
    ctx.beginPath();
    ctx.moveTo(50 + i * 5, y);
    ctx.quadraticCurveTo(132, y - 4, 274 - i * 4, y + 3);
    ctx.stroke();
  }
  ctx.fillStyle = '#aa615528';
  ctx.beginPath();
  ctx.moveTo(0, 626);
  ctx.bezierCurveTo(172, 541, 236, 668, 404, 653);
  ctx.bezierCurveTo(538, 634, 622, 625, 720, 577);
  ctx.lineTo(720, 720);
  ctx.lineTo(0, 720);
  ctx.fill();

  const rise = ease(time / .63);
  const x = 467 + rise * 48 + 9 * Math.sin(time * 17);
  const y = 311 - rise * 113 + 8 * Math.cos(time * 14);
  ctx.strokeStyle = '#70463b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(101, 719);
  ctx.bezierCurveTo(184 + 76 * rise, 527, 298 + 89 * rise, 411, x, y + 45);
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(.32 + .11 * Math.sin(time * 17));
  ctx.fillStyle = '#a13c37';
  ctx.strokeStyle = '#72403a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -91);
  ctx.quadraticCurveTo(43, -49, 77, -2);
  ctx.quadraticCurveTo(43, 31, 0, 68);
  ctx.quadraticCurveTo(-49, 23, -76, -2);
  ctx.quadraticCurveTo(-40, -49, 0, -91);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ebbd73';
  ctx.beginPath();
  ctx.moveTo(0, -86);
  ctx.quadraticCurveTo(21, -51, 55, -13);
  ctx.lineTo(0, -25);
  ctx.lineTo(-57, -13);
  ctx.quadraticCurveTo(-26, -48, 0, -86);
  ctx.fill();
  ctx.strokeStyle = '#f9d6a285';
  ctx.beginPath();
  ctx.moveTo(0, -83);
  ctx.lineTo(0, 60);
  ctx.moveTo(-67, -4);
  ctx.quadraticCurveTo(0, 6, 68, -4);
  ctx.stroke();

  ctx.strokeStyle = '#933a35';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const tailX = t * 146;
    const tailY = 67 + t * 73 + Math.sin(t * 14 - time * 27) * t * 14;
    if (i === 0) ctx.moveTo(tailX, tailY);
    else ctx.lineTo(tailX, tailY);
  }
  ctx.stroke();
  ctx.restore();
}

const waterStrokes = (() => {
  const random = seededRandom(3137);
  return Array.from({ length: 73 }, () => [random(), random(), random(), random()]);
})();

function drawMoon(ctx, time) {
  const moonlight = ease(time / .3);
  disk(ctx, 549, 199, 67, '#c3d7ca20');
  disk(ctx, 549, 199, 52, '#f0e2b3');
  ctx.fillStyle = '#142f3a';
  ctx.beginPath();
  ctx.moveTo(0, 325);
  ctx.bezierCurveTo(166, 303, 244, 347, 386, 351);
  ctx.bezierCurveTo(557, 359, 610, 328, 720, 332);
  ctx.lineTo(720, 373);
  ctx.quadraticCurveTo(546, 359, 366, 379);
  ctx.quadraticCurveTo(170, 371, 0, 399);
  ctx.fill();

  ctx.strokeStyle = '#e1e0b0';
  for (const [depth, spread, drift, tint] of waterStrokes) {
    const y = 371 + depth * 322;
    const x = 546 - depth * 46 + (spread - .5) * (51 + depth * 174) + Math.sin(time * 18 + drift * 13) * (4 + depth * 11);
    const width = 8 + tint * (20 + depth * 46);
    ctx.globalAlpha = (.17 + tint * .46) * (.38 + moonlight * .62);
    ctx.lineWidth = 1 + depth * 1.55;
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.quadraticCurveTo(x - width * .11, y - 1.8, x + width, y + .6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const crossing = ease((time - .1) / .81);
  const x = 629 - crossing * 381;
  const y = 493 + Math.sin(time * 14) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#a9b6a2a6';
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 5; i++) {
    const lag = i * 16;
    ctx.beginPath();
    ctx.moveTo(24 + lag, 14 + i * 5);
    ctx.quadraticCurveTo(42 + lag, 20 + i * 5, 93 + lag, 18 + i * 6);
    ctx.stroke();
  }
  ctx.fillStyle = '#101f2a';
  ctx.strokeStyle = '#e3c990';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-65, -9);
  ctx.quadraticCurveTo(-8, 1, 63, -11);
  ctx.quadraticCurveTo(46, 19, -38, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  disk(ctx, 6, -43, 7, '#172735');
  ctx.strokeStyle = '#172735';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(7, -31);
  ctx.quadraticCurveTo(5, -22, 12, -7);
  ctx.stroke();
  ctx.strokeStyle = '#d6bc82';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-11, -29);
  ctx.lineTo(45 + Math.sin(time * 23) * 10, 23 + Math.cos(time * 23) * 8);
  ctx.stroke();
  ctx.restore();
}

function drawBird(ctx, time) {
  const light = ease((time - .46) / .48);
  disk(ctx, 564, 234, 105 + light * 26, '#f5d78d7a');
  disk(ctx, 564, 234, 76, '#f8df9cbf');
  ctx.strokeStyle = '#5c6851';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(737, 651);
  ctx.bezierCurveTo(601, 626, 448, 494, 296, 506);
  ctx.stroke();
  const random = seededRandom(9126);
  for (let i = 0; i < 12; i++) {
    const t = i / 12;
    const x = 716 - 400 * t;
    const y = 640 - 138 * Math.sin(t * Math.PI / 2);
    const length = 44 + 64 * random();
    const lean = (random() - .74) * 115;
    ctx.strokeStyle = i % 3 ? '#425747a1' : '#a98950b5';
    ctx.lineWidth = 1.2 + (1 - t) * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + lean * .4, y - length * .66, x + lean, y - length);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let j = 1; j <= 6; j++) {
      const p = j / 7;
      const a = x + lean * p ** 1.4;
      const b = y - length * p;
      ctx.beginPath();
      ctx.moveTo(a - 18 - random() * 14, b - 20);
      ctx.lineTo(a, b);
      ctx.lineTo(a + 13 + random() * 19, b - 25);
      ctx.stroke();
    }
  }

  const flight = ease((time - .25) / .58);
  ctx.save();
  ctx.translate(411 + 167 * flight, 481 - 199 * flight + Math.sin(time * 28) * 5 * (1 - flight));
  ctx.rotate(-.23 - flight * .25);
  ctx.fillStyle = '#334d43';
  ctx.beginPath();
  ctx.moveTo(-51, 7);
  ctx.bezierCurveTo(-23, 0, -13, -33, 17, -19);
  ctx.bezierCurveTo(53, -6, 29, 24, -10, 20);
  ctx.lineTo(-51, 13);
  ctx.fill();
  disk(ctx, 23, -18, 13, '#334d43');
  ctx.fillStyle = '#ad724e';
  ctx.beginPath();
  ctx.moveTo(35, -20);
  ctx.lineTo(49, -16);
  ctx.lineTo(35, -12);
  ctx.fill();
  disk(ctx, 26, -21, 1.8, '#f8e5af');
  const lift = ease((time - .24) / .12);
  const wing = lift * (51 + 30 * Math.sin(time * 38));
  ctx.fillStyle = '#567263';
  ctx.beginPath();
  ctx.moveTo(13, -6);
  ctx.quadraticCurveTo(-9, -22 - wing * .42, -31, -11 - wing);
  ctx.quadraticCurveTo(-37, 7, -19, 14);
  ctx.quadraticCurveTo(-5, 18, 13, -6);
  ctx.fill();
  ctx.restore();
}

const paperCache = new WeakMap();
const textCache = new WeakMap();
const centeredText = { x: 360, top: 261, align: 'center', width: 612, size: 56, height: 66 };

function typeset(scene, lines) {
  const key = JSON.stringify(lines);
  const cached = textCache.get(scene);
  if (cached?.key === key) return cached.layer.canvas;

  const layout = scene.text ?? centeredText;
  const lettering = cached?.layer ?? layer();
  lettering.clearRect(0, 0, SIZE, SIZE);
  lettering.globalCompositeOperation = 'source-over';
  lettering.textAlign = layout.align;
  lettering.textBaseline = 'middle';
  lettering.fillStyle = lettering.strokeStyle = scene.ink;
  lettering.lineWidth = 1;
  const handwriting = 'KaiTi, "Kaiti SC", STKaiti, "Noto Serif SC", serif';
  lines.forEach((text, i) => {
    const line = text.trim();
    lettering.font = `bold ${layout.size}px ${handwriting}`;
    const width = lettering.measureText(line).width;
    if (width > layout.width) {
      lettering.font = `bold ${Math.floor(layout.size * layout.width / width)}px ${handwriting}`;
    }
    const y = layout.top + (i + .5) * layout.height;
    lettering.strokeText(line, layout.x, y, layout.width);
    lettering.fillText(line, layout.x, y, layout.width);
  });

  const random = seededRandom(65022);
  lettering.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 18000; i++) {
    const x = random() * SIZE;
    const y = layout.top - 4 + random() * (layout.height * 3 + 12);
    lettering.fillStyle = i % 3 ? '#0008' : '#000c';
    lettering.fillRect(x, y, .7 + random() * 2, .5 + random() * 1.9);
  }
  lettering.globalCompositeOperation = 'source-over';
  textCache.set(scene, { key, layer: lettering });
  return lettering.canvas;
}

export function preparePoemFrame(scene, lines) {
  if (!paperCache.has(scene)) paperCache.set(scene, makePaper(scene));
  typeset(scene, lines);
}

export function drawPoemFrame(ctx, scene, lines, position) {
  const progress = clamp(position);
  preparePoemFrame(scene, lines);
  ctx.drawImage(paperCache.get(scene), 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  scene.draw(ctx, progress);

  const text = textCache.get(scene).layer.canvas;
  const layout = scene.text ?? centeredText;
  const left = layout.align === 'left' ? layout.x
    : layout.align === 'right' ? layout.x - layout.width : (SIZE - layout.width) / 2;
  for (const [index, cue] of lineCues.entries()) {
    const reveal = ease((progress - cue) / .16);
    if (reveal <= 0) continue;
    const top = layout.top + index * layout.height;
    const width = Math.ceil(layout.width * reveal);
    ctx.globalAlpha = ease((progress - cue) / .07);
    ctx.drawImage(text, left, top, width, layout.height, left, top, width, layout.height);
  }
  ctx.globalAlpha = 1;
}
