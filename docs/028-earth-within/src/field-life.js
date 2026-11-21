import { W, H, TAU, field, mix, smooth, backdrop, gradient, glow, oval, shape, line, leaf, texture, waterlines } from './paint.js';

const grain = field(470, 53);
const details = field(131, 577);
const reeds = field(65, 344);
const ripples = field(90, 1445);

export function spider(ctx, time, p) {
  backdrop(ctx, ['#102f2c', '#345743', '#172c27']);
  for (const [x, y, s] of details.slice(0, 54)) glow(ctx, x * W, y * H, 21 + s * 48, 19 + s * 30, [[0, '#a1a97157'], [1, '#a1a97100']]);
  const anchors = [[134, 162], [284, 61], [486, 45], [726, 58], [876, 164], [892, 350], [716, 460], [505, 506], [274, 446], [121, 324]];
  const wobble = Math.sin(time * 6 + p * 5) * 15 * p;
  const center = [494 + wobble, 259 + p * 36 + wobble * .55];
  const knot = ([x, y], distance, index) => [mix(center[0], x, distance), mix(center[1], y, distance) + Math.sin(time * 5 - distance * 11 + index * .7) * p * 12 * (1 - distance)];
  line(ctx, [[0, 135], [134, 162], [284, 61], [438, 0]], '#293226', 21);
  line(ctx, [[W, 45], [876, 164], [892, 350], [716, 460], [651, H]], '#263225', 22);
  anchors.forEach((anchor, index) => {
    const points = Array.from({ length: 10 }, (_, i) => knot(anchor, (i + 1) / 12, index));
    line(ctx, [center, ...points, anchor], '#dbebe0a6', 1.4);
  });
  for (let ring = 1; ring <= 10; ring++) {
    const distance = ring / 12;
    const points = anchors.map((anchor, index) => knot(anchor, distance, index));
    line(ctx, [...points, points[0]], '#d1e4dca0');
    for (let i = ring % 3; i < points.length; i += 3) {
      const [x, y] = points[i];
      oval(ctx, x, y, 1.6 + ring * .15, 2 + ring * .15, '#daeede');
    }
  }
  for (const direction of [-1, 1]) {
    for (let leg = 0; leg < 4; leg++) line(ctx, [center, [center[0] + direction * 17, center[1] - 20 + leg * 12], [center[0] + direction * 26, center[1] - 15 + leg * 12]], '#191d1e', 2.6);
  }
  oval(ctx, center[0], center[1] - 5, 11, 14, '#604a39');
  oval(ctx, center[0], center[1] + 8, 7, 6, '#29282a');
}

function fieldHills(ctx) {
  shape(ctx, [[0, 280], [118, 268], [229, 290], [356, 244], [511, 282], [664, 229], [817, 251], [W, 224], [W, H], [0, H]], '#58694b');
  shape(ctx, [[0, 335], [171, 306], [329, 347], [524, 310], [675, 324], [815, 295], [W, 313], [W, H], [0, H]], '#788254');
}

function grass(ctx, time, wind, flowers = false) {
  for (const [x, y, s, shade] of details) {
    const px = x * W;
    const base = 326 + y * 236;
    const height = 14 + s * (31 + y * 56);
    const tip = px + wind * (Math.sin(time * 2 - x * 8) * 10 + 21) * s;
    line(ctx, [[px, base], [mix(px, tip, .34), base - height * .46], [tip, base - height]], shade > .48 ? '#a3a76c' : '#404e3b', 1 + s * 1.3);
    if (flowers && shade > .61) {
      for (let petal = 0; petal < 5; petal++) {
        const angle = petal * TAU / 5;
        oval(ctx, tip + Math.cos(angle) * 3.7, base - height + Math.sin(angle) * 3.1, 3 + s * 2, 2.5, shade > .8 ? '#d1a3a1' : '#e8cf9b', angle);
      }
      oval(ctx, tip, base - height, 2.6, 2.4, '#aa854b');
    }
  }
}

export function firefly(ctx, time, p) {
  backdrop(ctx, ['#383d5f', '#967877', '#dab786', '#475044']);
  glow(ctx, 282, 254, 241, 111, [[0, '#efcf9ba8'], [1, '#f1c58f00']]);
  fieldHills(ctx);
  grass(ctx, time, .25);
  ctx.fillStyle = `rgba(9,22,34,${p * .88})`;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, s, phase] of details.slice(0, 43)) {
    if (phase > p) continue;
    const px = x * W + Math.sin(time * .6 + phase * 12) * 15;
    const py = 216 + y * 255 + Math.cos(time + x * 14) * 15;
    const intensity = (.13 + .87 * Math.sin(time * (1 + s) + phase * 31) ** 4) * p;
    glow(ctx, px, py, 11 + s * 11, 11 + s * 11, [[0, `rgba(224,246,108,${intensity})`], [1, '#e0f66c00']]);
    oval(ctx, px, py, 1 + s, 1 + s, `rgba(244,249,170,${intensity})`);
  }
}

export function meadow(ctx, time, p) {
  backdrop(ctx, ['#67918e', '#b6b587', '#c9bd7c', '#596440']);
  glow(ctx, 171, 147, 275, 111, [[0, '#f1dd9eaf'], [1, '#f1dd9e00']]);
  fieldHills(ctx);
  grass(ctx, time, p * 2.3, true);
  for (const [x, y, s] of details.slice(0, 26)) {
    const px = (x * W + time * (16 + p * 55)) % W;
    oval(ctx, px, 143 + y * 305 + Math.sin(time * 2 + x * 16) * 11, 1 + s, 1 + s, '#ffebba88');
  }
}

export function floe(ctx, time, p) {
  backdrop(ctx, ['#638b9c', '#d5e0d6', '#6a97a5']);
  const coast = mix(232, 602, p);
  shape(ctx, [[0, 292], [179, 257], [326, 285], [477, 229], [617, 264], [743, 225], [W, 250], [W, H], [0, H]], '#92acb4');
  ctx.fillStyle = '#365d73';
  ctx.fillRect(0, 287, W, 253);
  waterlines(ctx, ripples, time, 286, 260, '#afd5d65e');
  for (const [x, y, s] of details.slice(0, 29)) {
    const px = (x * 1030 + Math.sin(time * .22 + y * 12) * 12) - 35;
    const py = 297 + y * 237;
    const size = 13 + s * y * 91;
    shape(ctx, [[px - size, py], [px - size * .55, py - 10], [px + size * .44, py - 12], [px + size, py], [px + size * .4, py + 9], [px - size * .58, py + 8]], s > .46 ? '#d3e6de' : '#9ac6cd');
  }
  shape(ctx, [[0, coast + 22], [243, coast - 32], [375, coast + 32], [525, coast + 66], [654, coast + 159], [548, H], [0, H]], '#a4a08c');
  for (const [x, y, s] of details.slice(0, 54)) {
    const py = coast + y * 266;
    if (x * W > 330 + y * 200) continue;
    oval(ctx, x * W, py, 2 + s * 14, 1 + s * 5, s > .53 ? '#dae3d5' : '#797968', -.14);
  }
}

export function tidepool(ctx, time, p) {
  backdrop(ctx, ['#4f8a87', '#4d7b73', '#615648']);
  const tide = mix(157, 420, p);
  for (const [x, y, s] of details.slice(0, 36)) {
    const px = x * W;
    const py = 60 + y * 480;
    const size = 23 + s * 78;
    shape(ctx, [[px - size, py], [px - size * .6, py - size * .41], [px + size * .34, py - size * .52], [px + size, py - 5], [px + size * .54, py + size * .32]], s > .4 ? '#706c56' : '#484f49');
  }
  oval(ctx, 545, 307, 179, 93, '#263f43', -.22);
  oval(ctx, 549, 307, 165, 79, '#498680', -.22);
  const star = Array.from({ length: 10 }, (_, i) => {
    const angle = i * TAU / 10 - .8;
    const size = i % 2 ? 13 : 31;
    return [574 + Math.cos(angle) * size, 315 + Math.sin(angle) * size * .7];
  });
  shape(ctx, star, '#e2a27c');
  shape(ctx, [[0, 0], [W, 0], [W, tide - 18], [752, tide + 12], [566, tide - 10], [325, tide + 21], [0, tide]], '#529fa1b9');
  line(ctx, [[0, tide], [325, tide + 21], [566, tide - 10], [752, tide + 12], [W, tide - 18]], '#d1e8cea1', 3);
  waterlines(ctx, ripples, time, 10, tide - 42, '#bde8d780');
}

export function reef(ctx, time, p) {
  backdrop(ctx, ['#467f79', '#285864', '#163340']);
  glow(ctx, 365, 41, 399, 246, [[0, '#a4d9a2a1'], [1, '#a4d9a200']]);
  const kelp = smooth(.2, .85, p);
  for (const [x, y, s, shade] of details.slice(0, 39)) {
    const px = x * W;
    const py = 431 + y * 114;
    const height = 29 + s * 147;
    ctx.globalAlpha = 1 - kelp;
    for (let branch = -2; branch <= 2; branch++) {
      const branchHeight = height * (1 - .18 * Math.abs(branch));
      const color = shade > .47 ? '#cb9382' : '#c4a574';
      line(ctx, [[px, py], [px + branch * 12, py - branchHeight * .5], [px + branch * 26, py - branchHeight]], color, 3 + s * 4);
      line(ctx, [[px + branch * 12, py - branchHeight * .5], [px + branch * 28 + 7, py - branchHeight * .8]], color, 2 + s * 3);
    }
    ctx.globalAlpha = kelp;
    const sway = Math.sin(time * 1.4 + x * 8) * 34;
    const top = py - height * 1.8;
    line(ctx, [[px, py], [px + sway * .4, py - height * .9], [px + sway, top]], '#7d8a51', 3);
    for (let i = 1; i <= 6; i++) leaf(ctx, px + sway * i / 6, mix(py, top, i / 6), .6 + s, (i % 2 ? .85 : -.85) + sway * .014, '#779c5f', '#a6af6b');
    ctx.globalAlpha = 1;
  }
  for (const [x, y, s] of details.slice(0, 25)) {
    const px = (x * (W + 100) + time * (17 + s * 35)) % (W + 100) - 50;
    const py = 128 + y * 254;
    oval(ctx, px, py, 5 + s * 12, 2 + s * 4, '#bcdfcdbf', -.1);
    shape(ctx, [[px - 5, py], [px - 15 - s * 10, py - 5], [px - 15 - s * 10, py + 5]], '#bcdfcdbf');
  }
}

export function river(ctx, time, p) {
  backdrop(ctx, ['#779e92', '#bdc69a', '#697758']);
  fieldHills(ctx);
  shape(ctx, [[0, 290], [W, 290], [W, H], [0, H]], gradient(ctx, 0, 280, 0, H, [[0, '#a5bb9a'], [1, '#47737a']]));
  waterlines(ctx, ripples, time * (1 - p * .72), 291, 250, '#d2e2c371');
  const left = mix(466, 118, p);
  const right = mix(512, 883, p);
  shape(ctx, [[0, 290], [left, 290], [left - 61, 348], [left + 12, 389], [left - 172, H], [0, H]], '#515f42');
  shape(ctx, [[W, 288], [right, 290], [right + 84, 360], [right + 3, 409], [right + 56, H], [W, H]], '#516a4b');
  const px = mix(435, 584, p);
  const py = mix(405, 339, p);
  leaf(ctx, px, py + Math.sin(time * 2) * 2, .6, -.21, '#dbc98f', '#9a925e');
  texture(ctx, grain, 287, 253, '#edf3ca15', '#16352813');
}

export function marsh(ctx, time, p) {
  backdrop(ctx, ['#79938a', '#b4b28d', '#456f6b']);
  const shore = mix(315, 207, p);
  shape(ctx, [[0, shore + 20], [168, shore - 9], [377, shore + 12], [655, shore - 25], [W, shore + 4], [W, H], [0, H]], '#5c8c86');
  waterlines(ctx, ripples, time * .55, shore + 19, H - shore, '#c7e3cb76');
  for (const [x, y, s] of reeds) {
    const px = x * W;
    if (Math.abs(px - 485) < 110 + p * 102) continue;
    const py = shore + 19 + y * 236;
    const top = py - (44 + s * 135) * (1 - p * .4);
    const sway = Math.sin(time + x * 16) * 5;
    line(ctx, [[px, py], [px + sway * .3, mix(py, top, .6)], [px + sway, top]], '#576342', 2 + s * 2);
    oval(ctx, px + sway, top, 2.9 + s, 5 + s * 8, '#695242', sway * .04);
    line(ctx, [[px, py], [px - sway, py + (py - top) * .38]], '#48594e69', 1.6);
  }
}

export function beaver(ctx, time, p) {
  backdrop(ctx, ['#627e78', '#a2ab83', '#426963']);
  fieldHills(ctx);
  const water = mix(358, 94, p);
  const shift = p * 125;
  shape(ctx, [[287, 414 - shift], [341, 289 - shift], [475, 213 - shift], [604, 253 - shift], [691, 398 - shift], [656, 520 - shift], [335, 533 - shift]], '#65543e');
  for (const [x, y, s] of details.slice(0, 56)) {
    const px = 343 + x * 285;
    const py = 269 + y * 224 - shift;
    if (py + shift < 333 && Math.abs(px - 488) > (py + shift - 235) * 1.5) continue;
    line(ctx, [[px - 27, py + 17], [px + 12, py - 4], [px + 38, py - s * 33]], s > .52 ? '#a18559' : '#3a3e32', 2 + s * 5);
  }
  oval(ctx, 510, 460 - shift, 49, 33, '#192d29');
  ctx.fillStyle = `rgba(36,102,106,${.66 - p * .24})`;
  ctx.fillRect(0, water, W, H - water);
  line(ctx, [[0, water + 3], [335, water], [642, water + 3], [W, water]], '#bbdbc2a3', 2.5);
  waterlines(ctx, ripples, time * .6, water, H - water, '#9ed2bf54');
  if (p > .56) glow(ctx, 510, 460 - shift, 104, 79, [[0, '#b9deab30'], [1, '#b9deab00']]);
}

export function droplet(ctx, time, p) {
  backdrop(ctx, ['#17312d', '#162625', '#0c171a']);
  glow(ctx, 480, 262, 300, 257, [[0, '#c3d6a4'], [.84, '#6d9b85'], [1, '#304d4500']]);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(480, 259, 277, 239, 0, 0, TAU);
  ctx.clip();
  const zoom = 1 + p * 3.3;
  for (const [x, y, s, phase] of details.slice(0, 91)) {
    const px = 480 + (x - .5) * 595 * zoom + Math.sin(time * (1 + s) + x * 18) * 14;
    const py = 259 + (y - .5) * 490 * zoom + Math.cos(time * .7 + y * 14) * 10;
    const size = (1 + s * 7) * zoom;
    oval(ctx, px, py, size, size * (.28 + phase * .4), '#466c5a94', phase * TAU + time * .24);
    if (s > .55) oval(ctx, px + size * .14, py, size * .29, size * .19, '#e3e3a8b3');
  }
  ctx.save();
  ctx.translate(489 + 12 * Math.sin(time * .7), 261 + 7 * Math.cos(time * .9));
  ctx.rotate(-.72 + Math.sin(time * .55) * .21);
  ctx.scale(zoom, zoom);
  oval(ctx, 0, 0, 25, 10, '#365c50');
  oval(ctx, 0, 0, 23, 8.7, '#b4c991');
  ctx.globalAlpha = smooth(.21, .8, p);
  for (let i = 0; i < 22; i++) {
    const angle = i * TAU / 22;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    line(ctx, [[x * 24, y * 9], [x * 27 + Math.sin(time * 10 + i) * .9, y * 12]], '#376258', .65);
  }
  oval(ctx, 4, 0, 5.8, 3.1, '#648778', .18);
  oval(ctx, -9, -2, 3.4, 2, '#e1dda9');
  oval(ctx, 15, 3, 2.8, 1.7, '#e1dda9');
  ctx.restore();
  ctx.restore();
  line(ctx, [[480, 17], [480, 42]], '#bdd1a6aa');
  line(ctx, [[745, 259], [770, 259]], '#bdd1a6aa');
  line(ctx, [[190, 259], [215, 259]], '#bdd1a6aa');
}

export function mangrove(ctx, time, p) {
  backdrop(ctx, ['#486b5e', '#74967b', '#665b47']);
  const trees = [65, 225, 396, 553, 763, 898];
  shape(ctx, [[0, 332], [205, 318], [401, 348], [611, 305], [W, 326], [W, H], [0, H]], '#7d7054');
  texture(ctx, grain, 329, 210, '#c9b79249', '#332d3060');
  for (const x of trees) {
    for (const side of [-1, 1]) {
      line(ctx, [[x, 244], [x + side * 38, 292], [x + side * 65, 387]], '#3f4232', 9);
      line(ctx, [[x, 269], [x + side * 55, 311], [x + side * 86, 368]], '#554e39', 5);
    }
    line(ctx, [[x - 14, 0], [x + 8, 134], [x, 286]], '#434536', 20);
    oval(ctx, x - 28, 81 + x % 65, 110, 61, '#38574a');
  }
  const crabX = 437 + Math.sin(time * 1.1) * 50;
  for (const side of [-1, 1]) {
    line(ctx, [[crabX, 381], [crabX + side * 13, 375], [crabX + side * 23, 380]], '#b48469', 2.3);
    oval(ctx, crabX + side * 21, 375, 5, 3, '#c89374', side * .45);
  }
  oval(ctx, crabX, 381, 13, 6.5, '#aa624c');
  const water = mix(492, 277, p);
  ctx.fillStyle = '#57938aa1';
  ctx.fillRect(0, water, W, H - water);
  waterlines(ctx, ripples, time, water, H - water, '#b7e1c275');
}
