import { W, H, TAU, field, mix, smooth, backdrop, gradient, glow, oval, path, shape, line, leaf, texture, waterlines } from './paint.js';

const specks = field(520, 913);
const terrain = field(107, 817);
const accents = field(79, 677);

export function canopy(ctx, time, p) {
  backdrop(ctx, ['#638b73', '#3b6152', '#203a34']);
  glow(ctx, 554, 124 + p * 35, 391, 198, [[0, '#d7df9caf'], [1, '#d7df9c00']]);
  for (const [x, y, size, shade] of terrain.slice(0, 35)) {
    oval(ctx, x * W, 45 + (y * 316 + p * 155) % 440, 35 + size * 73, 19 + size * 32, shade > .5 ? '#719366' : '#466f54', -.2);
  }
  const hole = mix(145, 495, p);
  shape(ctx, [[254, 0], [407, 0], [421, 168], [400, 338], [457, H], [208, H], [242, 361], [229, 194]], gradient(ctx, 229, 0, 448, 0, [[0, '#503f32'], [.49, '#8d714f'], [1, '#403f35']]));
  line(ctx, [[316, 203 + p * 174], [490, 148 + p * 153], [690, 111 + p * 157], [W, 121 + p * 130]], '#4d4935', 28);
  oval(ctx, 334, hole, 35, 63, '#aa8f5b', .08);
  oval(ctx, 335, hole + 2, 29, 57, '#272c27', .08);
  for (const [x, y, size] of accents.slice(0, 23)) {
    const px = 244 + x * 145;
    const py = (y * 540 + p * 270) % H;
    line(ctx, [[px, py], [px + 5, py + 18], [px - 2, py + 29 + size * 53]], '#382e2c59', 1 + size * 2);
  }
  for (const [x, y, s, shade] of terrain.slice(35)) {
    const px = x * W;
    if (px > 243 && px < 414 && y > .18) continue;
    const py = (y * 432 + p * 171) % 480;
    leaf(ctx, px, py, .45 + s * 1.4, (shade - .5) * 3 + Math.sin(time + x * 8) * .07, shade > .48 ? '#72935d' : '#3e7052', '#98aa6b');
  }
}

export function deadwood(ctx, time, p) {
  backdrop(ctx, ['#555c46', '#6a5743', '#3f392f']);
  for (const [x, y, s, shade] of terrain) {
    leaf(ctx, x * W, 170 + y * 391, .42 + s * 1.11, shade * TAU, shade > .55 ? '#9c7550' : '#776448', '#b19163');
  }
  oval(ctx, 519, 330, 352, 106, '#342c25', -.10);
  for (const [x, y, s] of accents.slice(0, 45)) {
    const px = 248 + x * 489;
    const py = 262 + y * 104;
    line(ctx, [[px - s * 15, py + 9], [px, py], [px + 14, py - 5 - s * 12], [px + 24, py - 3]], '#cbbb9579');
    line(ctx, [[px, py], [px - 4, py - 14]], '#e2d7a782');
  }
  for (let i = 0; i < 5; i++) {
    const x = 313 + i * 79 + Math.sin(time * .8 + i) * 26;
    const y = 314 + i % 2 * 15;
    oval(ctx, x, y, 8, 4, '#2b2324', -.16);
    line(ctx, [[x - 7, y + 5], [x - 5, y - 3], [x + 7, y + 3]], '#a57e60', 1.5);
  }
  ctx.save();
  ctx.translate(188, 280 - p * 34);
  ctx.rotate(-.13 - p * .31);
  ctx.fillStyle = gradient(ctx, 0, -73, 0, 79, [[0, '#9c7650'], [.57, '#68503d'], [1, '#3d312b']]);
  ctx.fillRect(0, -75, 618, 150);
  oval(ctx, 618, 0, 66, 75, '#624d3a');
  oval(ctx, 0, 0, 83, 75, '#b38b61');
  for (let i = 1; i <= 7; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, i * 10.5, i * 8.8, .14, 0, TAU);
    ctx.strokeStyle = '#714f3aab';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  for (const [x, y, s] of accents.slice(0, 32)) {
    const px = 78 + x * 508;
    const py = -68 + y * 137;
    line(ctx, [[px, py], [px + 33, py - 5 * s], [px + 50 + s * 26, py + 2]], '#31292380', 1 + s * 3);
  }
  ctx.restore();
}

export function dunes(ctx, time, p) {
  backdrop(ctx, ['#668f8b', '#ceb697', '#e3ba81', '#976d53']);
  glow(ctx, 267, 132, 228, 115, [[0, '#fff1bda7'], [1, '#fff1bd00']]);
  const front = 165 * p;
  shape(ctx, [[0, 348], [149, 311], [329, 259 + front * .42], [493, 287 + front * .22], [616, 235 + front * .56], [W, 318], [W, H], [0, H]], '#b88662');
  shape(ctx, [[0, 289 + front], [189, 261 + front * .84], [343, 326 + front * .64], [542, 364 + front * .48], [W, 361], [W, H], [0, H]], gradient(ctx, 0, 251, 0, H, [[0, '#e4bd86'], [1, '#ab7d5b']]));
  for (const [x, y, s] of terrain.slice(0, 80)) {
    const px = x * W;
    const py = 339 + y * 190;
    if (x < .42 && py < 298 + front * .6) continue;
    if (s < p) oval(ctx, px, py, 2.5 + s * 7, 1.1 + s * 3, '#776454', -.22);
    else line(ctx, [[px, py], [px + 22 + s * 29, py + 5]], '#f5d5a05f');
  }
  ctx.save();
  ctx.globalAlpha = smooth(.52, .95, p);
  const oasis = mix(850, 661, p);
  oval(ctx, oasis, 389, 168, 54, '#677a58', -.1);
  oval(ctx, oasis + 12, 395, 135, 32, '#699589', -.1);
  for (let i = 0; i < 5; i++) {
    const x = oasis - 111 + i * 56;
    const y = 368 + i % 3 * 8;
    line(ctx, [[x, y], [x + 4, y - 49], [x - 5, y - 71]], '#6e5645', 4);
    for (let frond = 0; frond < 5; frond++) leaf(ctx, x + frond * 8 - 20, y - 71 + Math.sin(time + i) * 2, .75, frond * .54 - 1.3, '#516c49', '#98a470');
  }
  ctx.restore();
}

export function alpine(ctx, time, p) {
  backdrop(ctx, ['#6f9a9d', '#adc6af', '#667b62']);
  const wall = mix(316, 0, p);
  shape(ctx, [[0, 298], [116, 252], [242, 295], [337, 213], [429, 258], [513, 195], [605, 244], [778, 212], [W, 280], [W, H], [0, H]], '#637f77');
  shape(ctx, [[0, 403], [210, 351], [401, 385], [546, 326], [736, 354], [W, 309], [W, H], [0, H]], '#86915c');
  shape(ctx, [[518, 339], [588, 349], [542, 388], [617, 399], [552, H], [347, H], [528, 423], [471, 399]], '#719c96');
  shape(ctx, [[0, 95 + p * 425], [wall * .7, 153 + p * 385], [wall, 296 + p * 275], [wall * .77, 421 + p * 133], [wall * .61, H], [0, H]], '#6a5e4d');
  shape(ctx, [[W, 70 + p * 479], [W - wall * .81, 181 + p * 373], [W - wall, 311 + p * 265], [W - wall * .64, H], [W, H]], '#766951');
  ctx.save();
  ctx.globalAlpha = smooth(.28, .96, p);
  for (const [x, y, s] of accents) {
    const px = x * W;
    const py = 367 + y * 180;
    if (px > 481 && px < 587) continue;
    line(ctx, [[px, py], [px + Math.sin(time * 1.8 + x * 9) * s * 4, py - s * 19]], '#4c6545', 1.7);
    if (s > .53) oval(ctx, px, py - s * 19, 3.3, 2.6, s > .76 ? '#d1a5a4' : '#e2cc95');
  }
  ctx.restore();
}

export function stone(ctx, time, p) {
  backdrop(ctx, ['#7a9481', '#bec39d', '#7a7b60']);
  glow(ctx, 489, 195, 250 - p * 145, 236, [[0, '#e1d7a5a9'], [1, '#e1d7a500']]);
  const pillars = [[390, 309, 172, 58], [529, 310, 201, 71], [234, 368, 275, 95], [674, 374, 278, 82], [102, 481, 382, 102], [851, 482, 397, 107], [17, 570, 385, 97], [928, 571, 391, 111]];
  for (const [x, y, height, width] of pillars) {
    const px = 480 + (x - 480) * (1 + p * .27) + p * 43;
    const py = y + p * (y - 328) * .34;
    const top = py - height * (1 + p * .41);
    const outline = [[px - width * .58, py], [px - width * .49, mix(py, top, .6)], [px - width * .31, top + 30], [px - 12, top], [px + width * .14, top + 18], [px + width * .36, top + 11], [px + width * .52, mix(py, top, .63)], [px + width * .63, py]];
    shape(ctx, outline, gradient(ctx, px - width * .5, top, px + width * .5, py, [[0, '#929780'], [.53, '#6b7767'], [1, '#45584d']]));
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * width / 7;
      line(ctx, [[px + offset + 10, top + 40 + i * 5], [px + offset - 4, mix(top, py, .59)], [px + offset, py - 13]], '#303f3862', 1.5 + i * .27);
    }
  }
  glow(ctx, 479 + Math.sin(time * .44) * 25, 378, 191, 98, [[0, '#ded8a528'], [1, '#ded8a500']]);
}

export function geothermal(ctx, time, p) {
  backdrop(ctx, ['#657e7c', '#c4ad94', '#706654']);
  shape(ctx, [[0, 351], [174, 296], [308, 245], [449, 125], [493, 128], [554, 216], [656, 264], [W, 339], [W, H], [0, H]], '#6e6963');
  shape(ctx, [[173, 297], [325, 263], [449, 125], [493, 128], [439, 201], [517, 285], [328, 341]], '#827068');
  oval(ctx, 546, 392, 328, 105, '#9b7e5b', -.05);
  oval(ctx, 548, 390, 272, 83, '#655449', -.05);
  oval(ctx, 544, 386, 244, 66, '#827366', -.05);
  for (const [x, y, s, shade] of terrain.slice(0, 39)) {
    if (shade > .23 + p * .72) continue;
    const px = 367 + x * 361;
    const age = (y + time * (.18 + s * .44)) % 1;
    const py = 367 + y * 62;
    oval(ctx, px, py, 1 + age * 13, 1 + age * 6, `rgba(199,171,137,${(1 - age) * .58})`);
    glow(ctx, px + age * 67, py - age * (75 + p * 218), 20 + age * 45, 19 + age * 27, [[0, `rgba(227,220,195,${(1 - age * .9) * (.23 + p * .35)})`], [1, '#e3dcc300']]);
  }
}

export function cavern(ctx, time, p) {
  backdrop(ctx, ['#322c2e', '#17262a', '#2b4c50']);
  const dripPoints = [];
  for (let i = -1; i < 15; i++) {
    const [x, y, s] = terrain[i + 1];
    const px = 68 * i + x * 32;
    const end = 69 + y * 154;
    const width = 27 + s * 49;
    shape(ctx, [[px - width, 0], [px - width * .48, end * .51], [px, end], [px + width * .48, end * .34], [px + width, 0]], gradient(ctx, 0, 0, 0, end, [[0, '#51403b'], [1, '#927a60']]));
    if (i % 2 === 0) dripPoints.push([px, end, s]);
    const floor = 357 - s * 87;
    shape(ctx, [[px - width, 443], [px - width * .31, 393], [px + 7, floor], [px + width * .25, 394], [px + width, 433]], '#6f6558');
  }
  shape(ctx, [[0, 391], [213, 408], [475, 366], [674, 382], [W, 395], [W, H], [0, H]], '#36615f');
  waterlines(ctx, accents, time * .43, 398, 145, '#a2c3ad80');
  dripPoints.forEach(([x, y, s]) => {
    const fall = ((time * .41 + s * 3) % 1) ** 2;
    oval(ctx, x, y + fall * (411 - y), 1.8, 2.5 + fall * 4, '#d8e1c6b0');
  });
  ctx.fillStyle = '#09161cc3';
  ctx.fillRect(0, 0, W, H);
  glow(ctx, mix(304, 625, p), mix(432, 109, p), 287, 192, [[0, '#ffdf9b60'], [.53, '#eecf7944'], [1, '#f3d98500']]);
}

export function rooftop(ctx, time, p) {
  backdrop(ctx, ['#5e8b87', '#acac8c', '#65756a']);
  for (const [x, y, size] of accents.slice(0, 19)) {
    const px = x * W;
    const py = 194 + y * 117;
    ctx.fillStyle = '#617872';
    ctx.fillRect(px, py, 23 + size * 62, 270);
  }
  const shift = p * 320;
  const roof = [[-138, 285, 357, 124], [215, 367, 218, 71], [550, 331, 230, 90], [789, 274, 258, 117], [1078, 243, 293, 131]];
  roof.forEach(([x, y, width, depth], i) => {
    const px = x - shift;
    shape(ctx, [[px, y], [px + depth, y - 56], [px + width + depth, y - 28], [px + width, y + 36]], i % 2 ? '#9f8b71' : '#b19b7d');
    shape(ctx, [[px, y], [px + width, y + 36], [px + width, H], [px, H]], i % 2 ? '#4c605c' : '#6c6f62');
    shape(ctx, [[px + width, y + 36], [px + width + depth, y - 28], [px + width + depth, H], [px + width, H]], '#47534f');
    for (let k = 0; k < 6; k++) {
      const wx = px + 13 + k * (width - 22) / 6;
      ctx.fillStyle = k % 2 ? '#c8ab79' : '#324d49';
      ctx.fillRect(wx, y + 32 + k * 5.6, 11, 13);
    }
  });
  const x = mix(139, 761, p);
  const y = 249 - Math.sin(p * Math.PI) * 112;
  const wing = 15 + Math.sin(time * 10) * 17;
  shape(ctx, [[x - 35, y + 8], [x - 9, y - 5], [x - 26, y - wing], [x + 3, y - wing * .79], [x + 16, y - 6], [x + 31, y - 6], [x + 37, y + 1], [x + 22, y + 7], [x - 7, y + 11], [x - 35, y + 17]], '#3b4c52');
  oval(ctx, x + 11, y + 1, 10, 7, '#97a99a', -.33);
}

export function moss(ctx, time, p) {
  backdrop(ctx, ['#877262', '#a0826a', '#534d43']);
  const zoom = 1 + p * 3.6;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W / 2, -H / 2);
  for (let row = -1; row < 6; row++) {
    const y = 35 + row * 117;
    line(ctx, [[0, y], [358, y + 2], [W, y]], '#b6a88b', 5);
    for (let col = 0; col < 6; col++) {
      const x = col * 200 + (row % 2) * 100;
      line(ctx, [[x, y], [x - 3, y + 117]], '#b9ab90', 4);
    }
  }
  path(ctx, [[0, 259], [211, 276], [495, 262], [694, 274], [W, 259], [W, 285], [497, 282], [214, 291], [0, 282]], true);
  ctx.fillStyle = '#393b31';
  ctx.fill();
  texture(ctx, specks, 0, H, '#e5bf9a29', '#3e3b3535');
  for (const [x, y, s, shade] of terrain) {
    const px = x * W;
    const py = 270 + y * 12;
    const tip = px + Math.sin(time * .85 + y * 20) * s * 2;
    line(ctx, [[px, py], [tip, py - 6 - s * 21]], '#526146', 1.4 + s);
    for (let i = 1; i <= 3; i++) leaf(ctx, mix(px, tip, i / 3), py - (7 + s * 17) * i / 3, .07 + s * .14, (i % 2 ? -.6 : .57), shade > .55 ? '#889c5e' : '#687f54', '#9eab71');
  }
  const bug = 453 + Math.sin(time) * 24;
  oval(ctx, bug, 276, 4.8, 2.6, '#241f20', -.12);
  line(ctx, [[bug + 1, 274], [bug + 6, 270], [bug + 8, 270]], '#282721', .5);
  ctx.restore();
}
