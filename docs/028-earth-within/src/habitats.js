import { W, H, TAU, field, mix, smooth, gradient, glow, oval, path, shape, line, texture, leaf } from './paint.js';

const seeds = field(200, 327);
const grain = field(610, 637);

function flower(ctx, x, y, size, sway, color) {
  ctx.beginPath();
  ctx.moveTo(x - sway * 2, H + 22);
  ctx.quadraticCurveTo(x + sway * 4, y + 70, x, y);
  ctx.strokeStyle = '#536044';
  ctx.lineWidth = 3 + size * .07;
  ctx.stroke();
  leaf(ctx, x - 10, y + 72, size / 35, -.66, '#576b44', '#7e8c55');
  leaf(ctx, x + 8, y + 102, size / 46, .62, '#6a794e', '#859160');
  for (let petal = 0; petal < 7; petal++) {
    const angle = petal * TAU / 7;
    oval(ctx, x + Math.cos(angle) * size * .64, y + Math.sin(angle) * size * .46, size * .59, size * .31, color, angle);
  }
  oval(ctx, x, y, size * .51, size * .39, '#b87543');
  oval(ctx, x - size * .08, y - size * .08, size * .36, size * .21, '#e0af63');
}

function honeycomb(ctx, time, p) {
  const offset = mix(340, -98, p);
  ctx.save();
  ctx.globalAlpha = smooth(.28, .92, p);
  const radius = 35 + p * 8;
  for (let col = -1; col < 19; col++) {
    for (let row = -1; row < 11; row++) {
      const x = offset + col * radius * 1.5;
      const y = row * radius * Math.sqrt(3) + (col % 2) * radius * .866;
      const point = (inset) => Array.from({ length: 6 }, (_, i) => {
        const angle = i * TAU / 6;
        return [x + Math.cos(angle) * (radius - inset), y + Math.sin(angle) * (radius - inset)];
      });
      shape(ctx, point(0), (row + col) % 3 === 0 ? '#e3b16a' : '#bb804a');
      shape(ctx, point(3), gradient(ctx, x, y - radius, x, y + radius, [[0, '#825037'], [.45, '#58362c'], [1, '#ae743c']]));
      if ((row * 3 + col * 13) % 7 === 0) {
        oval(ctx, x, y + 12, radius * .53, radius * .24, '#dca953');
        oval(ctx, x + Math.sin(time + row) * 5, y + 9, radius * .32, 2, '#f4d88a');
      }
    }
  }
  ctx.restore();
}

function honeybee(ctx, x, y, scale, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.15);
  ctx.scale(scale, scale);
  for (const side of [-1, 1]) {
    const wing = Math.sin(time * 25) * .38;
    oval(ctx, side * 15, -24, 28, 10, '#fcf4d3aa', side * (.72 + wing));
    line(ctx, [[0, -4], [side * 11, 13], [side * 24, 16]], '#442c29', 3);
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-11, 2, 31, 15, 0, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#e4a84e';
  ctx.fillRect(-43, -16, 70, 37);
  for (let stripe = -36; stripe < 7; stripe += 15) {
    shape(ctx, [[stripe, -17], [stripe + 8, -17], [stripe + 18, 20], [stripe + 7, 20]], '#5c392d');
  }
  ctx.restore();
  oval(ctx, 10, 0, 14, 13, '#a56b42');
  oval(ctx, 25, -2, 12, 10, '#5d3a2e');
  oval(ctx, 29, -4, 4, 4, '#282527');
  line(ctx, [[28, -7], [36, -15], [44, -14]], '#46312d', 2);
  line(ctx, [[30, -5], [40, -10], [46, -8]], '#46312d', 2);
  ctx.restore();
}

export function bee(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#68938a'], [.59, '#a2ab75'], [1, '#344d3c']]);
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 221, 148, 422, 227, [[0, '#f5e2ae9e'], [1, '#f5e2ae00']]);
  for (const [x, y, size, shade] of seeds.slice(0, 72)) {
    oval(ctx, x * W, 235 + y * 340, 11 + size * 42, 4 + size * 20, shade > .54 ? '#d9c38a72' : '#50684658', -.3);
  }
  for (const [x, y, size, shade] of seeds.slice(0, 25)) {
    const sway = Math.sin(time * 1.4 + x * 17) * (3 + size * 6);
    const colors = ['#e4b96e', '#e1cba4', '#c78f89'];
    flower(ctx, x * W + sway - p * 65, 207 + y * 321, 13 + size * 22, sway, colors[Math.floor(shade * colors.length)]);
  }
  honeycomb(ctx, time, p);
  for (let i = 0; i < 22; i++) {
    const point = i / 22;
    oval(ctx, mix(113, 793, point), 290 - Math.sin(point * Math.PI) * 104, 2.4, 2.4, point < p ? '#ffea9e' : '#fff2bb65');
  }
  const beeX = mix(113, 800, p);
  const beeY = 290 - Math.sin(p * Math.PI) * 104 + Math.sin(time * 3) * 5;
  honeybee(ctx, beeX, beeY, 1 + p * .45, time);
  texture(ctx, grain, 0, H, '#fff0b317', '#1b302219');
}

function snowscape(ctx, time) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#6295a8'], [.45, '#c0dbd9'], [.64, '#dfebe5'], [1, '#8bbbc7']]);
  ctx.fillRect(0, 0, W, H);
  glow(ctx, 312, 125, 234, 93, [[0, '#fff2c19c'], [1, '#fff0ca00']]);
  shape(ctx, [[0, 310], [84, 260], [142, 276], [280, 166], [337, 209], [394, 171], [528, 258], [578, 225], [645, 267], [776, 140], [886, 242], [960, 216], [960, 425], [0, 426]], '#688e9f');
  shape(ctx, [[74, 264], [280, 166], [337, 209], [394, 171], [463, 217], [418, 205], [393, 212], [351, 225], [316, 213], [289, 231], [258, 221], [203, 245]], '#dcebea');
  shape(ctx, [[649, 268], [776, 140], [886, 242], [834, 212], [796, 227], [755, 193], [728, 234]], '#e9f1e9');
  shape(ctx, [[0, 344], [181, 317], [397, 349], [557, 326], [784, 304], [960, 333], [960, H], [0, H]], '#cde2de');
  shape(ctx, [[0, 480], [310, 418], [494, 429], [652, 366], [587, 356], [683, 338], [650, 354], [723, 364], [556, 438], [490, 477], [419, H], [25, H]], '#498392');
  line(ctx, [[0, 475], [310, 416], [493, 427], [652, 366], [587, 356], [683, 338]], '#f3f6e6', 6);
  for (const [x, y, size] of seeds.slice(0, 55)) {
    const px = (x * (W + 90) + time * (26 + size * 46)) % (W + 90) - 45;
    const py = y * H;
    line(ctx, [[px, py], [px + size * 25 + 3, py - 3]], '#f8fff0ad', .65 + size);
  }
}

function iceWalls(ctx, p) {
  ctx.save();
  ctx.globalAlpha = smooth(.15, .86, p);
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#8bc8cf'], [.34, '#416e89'], [1, '#162c47']]);
  ctx.fillRect(0, 0, W, H);
  const center = 477 + (p - .5) * 160;
  glow(ctx, center, 65, mix(310, 154, p), 246, [[0, '#edfff2d7'], [.35, '#7de0df63'], [1, '#9dece400']]);
  const left = [[0, 0], [center - 109, 0], [center - 118, 69], [center - 68, 144], [center - 110, 222], [center - 42, 337], [center - 88, 420], [center - 5, 540], [0, 540]];
  const right = [[960, 0], [center + 101, 0], [center + 84, 87], [center + 126, 161], [center + 49, 252], [center + 110, 326], [center + 39, 411], [center + 68, 540], [960, 540]];
  shape(ctx, left, gradient(ctx, 0, 180, center, 320, [[0, '#214a69'], [.67, '#2e7c94'], [1, '#6bbdcb']]));
  shape(ctx, right, gradient(ctx, center, 280, 960, 40, [[0, '#38899e'], [.42, '#317b90'], [1, '#1d496b']]));
  for (const [side, wall] of [[-1, left], [1, right]]) {
    ctx.save();
    path(ctx, wall, true);
    ctx.clip();
    for (const [x, y, size, shade] of seeds) {
      const px = center + side * x * 570;
      const py = y * H;
      line(ctx, [[px - side * 44 * size, py - 27 * size], [px, py], [px + side * 73 * size, py + 35 * size], [px + side * 93 * size, py + 22 * size]], shade > .5 ? '#b6edeb44' : '#0f416c5e', .6 + size * 2);
    }
    ctx.restore();
  }
  ctx.restore();
}

export function snow(ctx, time, p) {
  snowscape(ctx, time);
  iceWalls(ctx, p);
  texture(ctx, grain, 0, H, '#edfefa15', '#0c415c12');
}

function fish(ctx, x, y, size, color, tail) {
  oval(ctx, x, y, size, size * .32, color, -.16);
  shape(ctx, [[x - size * .72, y], [x - size * (1.53 + tail * .16), y - size * .49], [x - size * 1.33, y], [x - size * 1.56, y + size * .44]], color);
}

export function ocean(ctx, time, p) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [[0, '#1d6d79'], [.39, '#194a61'], [1, '#10172c']]);
  ctx.fillRect(0, 0, W, H);
  const surface = 45 - p * 245;
  glow(ctx, 349, surface + 48, 440, 355, [[0, `rgba(155,232,208,${1 - p})`], [.35, '#64bcb761'], [1, '#83dad800']]);
  ctx.save();
  ctx.globalAlpha = 1 - smooth(.19, .72, p);
  for (let beam = 0; beam < 11; beam++) {
    const x = 91 + beam * 57;
    const bend = Math.sin(time * .8 + beam) * 24;
    shape(ctx, [[x, surface], [x + 21, surface], [x + 99 + bend, 449], [x + 52 + bend, 449]], gradient(ctx, x, surface, x, 449, [[0, '#e2fbdc3c'], [1, '#d5ffed00']]));
  }
  for (const [x, y, size] of seeds.slice(0, 85)) {
    const px = x * W + Math.sin(y * 18 + time * .9) * 27;
    const py = surface + (y - .5) * 105;
    line(ctx, [[px - size * 77, py + 2], [px - 7, py], [px + size * 73, py + Math.sin(x * 9 + time) * 7]], '#c0edcd66', 1 + size * 2);
  }
  ctx.restore();
  for (const [x, y, size, shade] of seeds.slice(0, 48)) {
    const px = (x * 1110 + time * (17 + y * 35)) % 1110 - 75;
    const py = 163 + y * 213 - p * 104 + Math.sin(time + x * 9) * 8;
    fish(ctx, px, py, 5 + size * (20 - p * 8), shade > .42 ? '#9bbec17c' : '#0d344d9e', Math.sin(time * 8 + x * 12));
  }
  ctx.fillStyle = `rgba(4,11,26,${p * .75})`;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = smooth(.34, .9, p);
  for (const [x, y, size, pulse] of seeds.slice(0, 69)) {
    const px = x * W + Math.sin(time * .44 + y * 12) * 10;
    const py = 105 + y * 420;
    const alpha = .32 + Math.sin(time * 1.3 + pulse * 13) * .24;
    glow(ctx, px, py, 5 + size * 11, 5 + size * 11, [[0, `rgba(144,243,224,${alpha})`], [1, '#9cf8f100']]);
    oval(ctx, px, py, .7 + size * 1.25, .7 + size * 1.25, '#bbfbeb');
  }
  const jx = 620 + Math.sin(time * .36) * 29;
  const jy = 332 + Math.cos(time * .62) * 18;
  glow(ctx, jx, jy, 116, 92, [[0, '#6bc5d55c'], [1, '#6bc5d500']]);
  for (let i = 0; i < 7; i++) {
    const x = jx + (i - 3) * 11;
    ctx.beginPath();
    ctx.moveTo(x, jy);
    ctx.bezierCurveTo(x + 24 * Math.sin(time * 1.5 + i), jy + 20, x - 11, jy + 38, x + Math.sin(time + i) * 21, jy + 68 + i * 3);
    ctx.strokeStyle = '#8acde180';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(jx - 49, jy + 2);
  ctx.bezierCurveTo(jx - 40, jy - 61, jx + 36, jy - 63, jx + 52, jy);
  ctx.quadraticCurveTo(jx + 3, jy + 25, jx - 49, jy + 2);
  ctx.fillStyle = '#91dce3a0';
  ctx.fill();
  ctx.strokeStyle = '#cef1ef';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  texture(ctx, grain, 0, H, '#d7fff612', '#030b1715');
}
