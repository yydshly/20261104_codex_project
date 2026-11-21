import { W, H, TAU, field, mix, gradient, glow, oval, shape, line, texture, leaf } from './paint.js';

const grain = field(850, 821);
const clouds = field(55, 35);
const drops = field(265, 89);
const grit = field(180, 123);
const homes = [
  [0, 375, 79, 165], [62, 389, 88, 151], [150, 418, 68, 122], [212, 403, 89, 137],
  [314, 447, 68, 93], [376, 419, 107, 121], [502, 451, 75, 89], [620, 430, 113, 110],
  [747, 395, 108, 145], [849, 349, 111, 191],
];

function rain(ctx, time, force, front = 0) {
  for (const [x, y, speed, shade] of drops) {
    const px = (x * (W + 60) - time * (32 + speed * 26) % (W + 60) + W + 60) % (W + 60);
    if (shade > force || px < front - speed * 120) continue;
    const py = (y * (H + 60) + time * (125 + speed * 280)) % (H + 60) - 40;
    const length = 7 + speed * 28;
    line(ctx, [[px, py], [px - length * .33, py + length]], `rgba(188,226,222,${.14 + speed * .31})`, .7 + speed);
  }
}

export function storm(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#172933'], [.49, '#465b60'], [.71, '#b4a885'], [1, '#264039']]);
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 256 - p * 170, 310, 450, 160, [[0, '#f9dd9d99'], [1, '#e8c88900']]);
  for (const [x, y, size, shade] of clouds) {
    const px = x * 1160 - 100 - p * 75 + Math.sin(time * .23 + x * TAU) * 20;
    const py = 35 + y * 205 - p * 21;
    glow(ctx, px, py, 55 + size * 151, 27 + size * 41, [[0, shade > .3 ? '#192b36c9' : '#6c737a88'], [.65, '#23384668'], [1, '#23384600']]);
  }
  shape(ctx, [[0, 369], [61, 341], [128, 350], [238, 302], [308, 317], [392, 288], [488, 325], [540, 319], [620, 347], [702, 309], [800, 348], [876, 314], [960, 356], [960, H], [0, H]], '#4b655f');
  shape(ctx, [[0, 386], [83, 368], [179, 374], [249, 346], [330, 367], [422, 343], [518, 366], [614, 355], [718, 369], [822, 353], [960, 367], [960, H], [0, H]], '#354f49');
  glow(ctx, mix(950, 215, p), 278, 300, 212, [[0, '#afc6bd8a'], [1, '#b7d6d200']]);
  homes.forEach(([x, y, w, h], index) => {
    ctx.fillStyle = index % 2 ? '#354645' : '#2c3b3c';
    ctx.fillRect(x, y, w, h);
    const peak = y - w * .36;
    shape(ctx, [[x - 8, y + 4], [x + w * .55, peak], [x + w + 8, y + 4]], index % 2 ? '#293638' : '#1f3033');
    line(ctx, [[x - 7, y + 3], [x + w * .55, peak], [x + w + 7, y + 3]], '#9da7a469', 2);
    ctx.fillStyle = '#e9bd75';
    ctx.fillRect(x + w * .28, y + 17, 7, 11);
    if (index % 3 === 0) ctx.fillRect(x + w * .72, y + 23, 7, 11);
  });
  line(ctx, [[0, 397], [149, 407], [298, 402], [478, 430], [677, 419], [960, 385]], '#17272c', 2);
  rain(ctx, time, .25 + p * .75, mix(790, 0, p));
  texture(ctx, grain, 0, H, '#e0f1e00b', '#101b260c');
}

function chick(ctx, x, y, size, bob) {
  oval(ctx, x, y + 7, size * .76, size, '#4c3931');
  oval(ctx, x + 1, y + bob, size * .7, size * .76, '#695249');
  shape(ctx, [[x - size * .57, y + bob - 3], [x + size * .65, y + bob - 3], [x + 1, y + bob + size * .51]], '#e9b35e');
  shape(ctx, [[x - size * .31, y + bob - 1], [x + size * .36, y + bob - 1], [x + 1, y + bob + size * .31]], '#692e35');
  oval(ctx, x + size * .33, y + bob - size * .33, 2.2, 2.2, '#17191b');
}

export function swallow(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, W, H, [[0, '#819c96'], [.53, '#5d7774'], [1, '#323b37']]);
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, s] of clouds) oval(ctx, x * W, 340 + y * 210, 27 + s * 52, 30 + s * 57, s > .48 ? '#496765' : '#537373');
  rain(ctx, time, .67);
  ctx.save();
  const zoom = 1 + p * .53;
  ctx.translate(-p * 330, -p * 60);
  ctx.scale(zoom, zoom);
  shape(ctx, [[504, 0], [960, 0], [960, H], [647, H], [513, 168]], gradient(ctx, 495, 0, 970, 530, [[0, '#bb9880'], [1, '#634e46']]));
  for (let row = 0; row < 8; row++) {
    const y = 144 + row * 56;
    line(ctx, [[490 + row * 18, y], [960, y + 47]], '#51433f80', 2.5);
    for (let col = 0; col < 4; col++) {
      const x = 565 + col * 115 + (row % 2) * 41;
      line(ctx, [[x, y + (x - 510) * .10], [x + 11, y + 56 + (x - 510) * .10]], '#55474070', 2);
    }
  }
  shape(ctx, [[26, 0], [960, 0], [960, 193], [746, 154], [478, 122], [281, 88], [23, 50]], '#332a29');
  shape(ctx, [[26, 0], [960, 0], [960, 149], [466, 97], [20, 28]], '#655041');
  line(ctx, [[25, 34], [463, 107], [960, 165]], '#947861', 9);
  for (let i = 0; i < 10; i++) {
    const x = 22 + i * 103;
    line(ctx, [[x + 29, 0], [x, 32 + x * .137]], '#3b302c', 4);
    oval(ctx, x, (38 + x * .137) + ((i * .73 + time * 1.12) % 1) ** 2 * 94, 1.6, 5, '#c2e5dcaf', .24);
  }

  for (const [nx, ny, scale] of [[524, 135, .72], [680, 168, 1], [836, 192, .76]]) {
    ctx.save();
    ctx.translate(nx, ny);
    ctx.scale(scale, scale);
    oval(ctx, 0, 14, 75, 44, '#47362e');
    for (let i = 0; i < 3; i++) chick(ctx, -32 + i * 31, 3 + i % 2 * 5, 14, Math.sin(time * 3 + i * 2) * 3);
    ctx.beginPath();
    ctx.moveTo(-78, 13);
    ctx.quadraticCurveTo(1, 39, 79, 13);
    ctx.quadraticCurveTo(74, 61, 12, 62);
    ctx.quadraticCurveTo(-59, 64, -78, 13);
    ctx.fillStyle = '#926e51';
    ctx.fill();
    for (const [x, y, size, shade] of grit) {
      const xx = (x - .5) * 150;
      if (Math.abs(xx) > 72 - 37 * y || y < .27 - Math.abs(xx) / 270) continue;
      oval(ctx, xx, 17 + y * 43, 2 + size * 6, 1 + size * 2, shade > .45 ? '#bb9270aa' : '#593e36a0', -.15);
    }
    ctx.restore();
  }
  ctx.restore();

  const flight = (time * .17) % 1;
  const wing = 11 + 17 * Math.sin(time * 13);
  ctx.save();
  ctx.translate(mix(130, 590, flight), mix(315, 211, flight) - Math.sin(flight * Math.PI) * 32);
  ctx.rotate(-.24);
  ctx.scale(.8 + p * .25, .8 + p * .25);
  shape(ctx, [[-43, 11], [-23, -3], [-7, -5], [-21, -wing - 23], [12, -wing - 5], [14, -9], [25, -10], [37, -3], [23, 1], [8, 11], [-16, 12], [-38, 21], [-28, 12]], '#202e38');
  oval(ctx, 12, 7, 14, 6, '#d0c2a4', -.18);
  oval(ctx, 22, 2, 6, 5, '#ae6b53');
  ctx.restore();
  texture(ctx, grain, 0, H, '#fff5d70b', '#1728240d');
}

export function gutter(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#536563'], [.37, '#313b3d'], [1, '#293238']]);
  ctx.fillRect(0, 0, W, H);
  shape(ctx, [[0, 0], [960, 0], [960, 111], [0, 245]], '#7b7c69');
  shape(ctx, [[0, 210], [960, 78], [960, 135], [0, 284]], '#9a977d');
  line(ctx, [[0, 246], [960, 113]], '#d2c8a7a6', 3);
  line(ctx, [[0, 284], [960, 136]], '#1e2b31', 6);
  for (let i = 1; i < 8; i++) line(ctx, [[i * 145, 0], [i * 115 - 4, 260 - i * 18]], '#434d47', 2.7);
  texture(ctx, grain, 0, H, '#d9d5b72c', '#202a3445');
  shape(ctx, [[0, 281], [960, 139], [960, 350], [784, 367], [541, 412], [349, 455], [0, 510]], gradient(ctx, 0, 130, 350, 480, [[0, '#829b8c'], [.48, '#4a7475'], [1, '#35545c']]));
  for (const [x, y, s, shade] of drops) {
    const px = (x * (W + 100) + time * (22 + s * 38)) % (W + 100) - 50;
    const py = 282 - px * .148 + y * 198;
    line(ctx, [[px, py], [px + 7 + s * 34, py - 3 - s * 7]], shade > .35 ? '#bad4c076' : '#233e4b6e', .9 + s);
  }
  for (const [x, y, s] of grit.slice(0, 37)) {
    const wave = (time * (.62 + s) + s * 11) % 1;
    ctx.beginPath();
    ctx.ellipse(x * W, 300 + y * 172 - x * 132, 3 + wave * 27, 1 + wave * 7, -.15, 0, TAU);
    ctx.strokeStyle = `rgba(193,226,211,${(1 - wave) * .58})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  shape(ctx, [[725, 213], [914, 180], [953, 250], [756, 292]], '#1d2c2e');
  line(ctx, [[725, 213], [914, 180], [953, 250], [756, 292], [725, 213]], '#9a9f83', 6);
  for (let i = 1; i <= 11; i++) line(ctx, [[725 + i * 16, 213 - i * 2.8], [756 + i * 17, 292 - i * 3.5]], '#677b71', 5);
  const px = mix(105, 788, p);
  const py = mix(375, 280, p) + 15 * Math.sin(p * TAU) + Math.sin(time * 2) * 3;
  oval(ctx, px + 5, py + 8, 34, 7, '#21393b88', -.2);
  leaf(ctx, px, py, 1.4, Math.sin(p * 8 + time) * .35 - .25, '#e1a55d', '#9a6540');
}

const nest = [
  [[428, 80], [438, 142], [482, 180], [553, 209], [579, 275], [628, 308], [709, 316], [774, 389]],
  [[482, 180], [405, 195], [361, 225], [275, 234], [208, 277]],
  [[553, 209], [638, 183], [707, 204], [796, 181]],
  [[579, 275], [517, 332], [442, 361], [387, 409], [316, 431]],
];

function insect(ctx, x, y, angle, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  for (const sign of [-1, 1]) {
    for (let leg = -1; leg < 2; leg++) {
      line(ctx, [[leg * 4, 0], [leg * 5 + 1, sign * 5], [leg * 6 - 3 + Math.sin(time * 18 + leg * 2) * 2, sign * 8]], '#e1ae73', 1);
    }
    line(ctx, [[8, sign], [12, sign * 4], [16, sign * 5]], '#e1ae73', .8);
  }
  oval(ctx, -6, 0, 6, 4, '#b77b4d');
  oval(ctx, 0, 0, 3.9, 2.8, '#e6ab69');
  oval(ctx, 6, 0, 4, 3.5, '#d0965d');
  ctx.restore();
}

export function ant(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#3d5446'], [.19, '#6b503c'], [.62, '#50392f'], [1, '#30271f']]);
  ctx.fillRect(0, 0, W, H);
  texture(ctx, grain, 72, H - 72, '#c9916347', '#241a1c72');
  for (let row = 0; row < 5; row++) {
    const y = 111 + row * 82;
    line(ctx, [[0, y], [160, y + 21], [308, y - 6], [571, y + 22], [801, y + 9], [960, y + 24]], '#d4956441', 4);
  }
  for (const [x, y, s, shade] of grit) {
    oval(ctx, x * W, 91 + y * 440, 1 + s * 9, 1 + s * 3, shade > .46 ? '#ae80593f' : '#211d1b66', -.4);
  }
  for (const [x, y, s] of clouds) {
    if (Math.abs(x * W - 428) < 18) continue;
    line(ctx, [[x * W, 79], [x * W - 9 * y, 56 - y * 12], [x * W + 14 * s - 8, 51 - s * 30]], s > .5 ? '#a1aa6c' : '#5b794e', 2 + s * 3);
  }
  line(ctx, [[78, 73], [96, 136], [81, 185], [121, 242]], '#a18358', 4);
  line(ctx, [[901, 76], [887, 136], [925, 195], [916, 244]], '#a18358', 4);
  for (const tunnel of nest) {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    line(ctx, tunnel, '#b2805277', 30);
    line(ctx, tunnel, '#251e1c', 23);
    ctx.lineCap = 'butt';
  }
  const rooms = [[207, 277, 63, 39], [797, 180, 56, 34], [318, 425, 73, 42], [775, 386, 81, 48], [577, 273, 42, 29]];
  for (const [x, y, rx, ry] of rooms) {
    oval(ctx, x, y, rx + 5, ry + 5, '#aa785a8f', -.10);
    oval(ctx, x, y, rx, ry, '#251e1c', -.10);
  }
  for (const [x, y, size] of grit.slice(0, 16)) oval(ctx, 732 + x * 94, 378 + y * 23, 2 + size * 6, 3, '#dbc1a0', -.22);
  for (const phase of [0, Math.PI]) {
    const angle = time * .68 + phase;
    insect(ctx, 775 + Math.cos(angle) * 59, 387 + Math.sin(angle) * 31, angle + Math.PI / 2, time + phase);
  }
  nest.forEach((tunnel, lane) => {
    for (let i = 0; i < 4; i++) {
      const step = ((time * (.24 + lane * .024) + i * (tunnel.length - 1) / 4 + lane * .19) % (tunnel.length - 1));
      const start = tunnel[Math.floor(step)];
      const end = tunnel[Math.floor(step) + 1];
      const local = step % 1;
      insect(ctx, mix(start[0], end[0], local), mix(start[1], end[1], local), Math.atan2(end[1] - start[1], end[0] - start[0]), time + i);
    }
  });
  const lightX = mix(428, 775, p);
  const lightY = mix(104, 383, p);
  ctx.fillStyle = '#12151997';
  ctx.fillRect(0, 82, W, H - 82);
  glow(ctx, lightX, lightY, 252, 166, [[0, '#ffdb9c50'], [.51, '#f6b56327'], [1, '#ffd58f00']]);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  glow(ctx, lightX, lightY, 137, 84, [[0, '#81552f70'], [1, '#81552f00']]);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, 71);
  ctx.clip();
  rain(ctx, time, .37);
  ctx.restore();
}
