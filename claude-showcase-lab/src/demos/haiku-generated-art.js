const palettes = {
  indigo: { paper: ['#f7eedb', '#dddcc9'], pencil: '#344b68', wash: '#879ca6', light: '#e9bc76', sound: 'rain' },
  amber: { paper: ['#f8e8c5', '#deac89'], pencil: '#6b3f35', wash: '#b97559', light: '#ffdfa0', sound: 'kite' },
  moss: { paper: ['#f1ebcb', '#aeb59b'], pencil: '#3b5142', wash: '#81977a', light: '#f7d995', sound: 'bird' },
  midnight: { paper: ['#192938', '#395963'], pencil: '#dbd7bb', wash: '#78918f', light: '#f3d394', sound: 'moon' },
};

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = t => t * t * (3 - 2 * t);

function line(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
}

function ellipse(ctx, x, y, width, height, fill = false) {
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  if (fill) ctx.fill();
  else ctx.stroke();
}

const contours = {
  hills: 'M-1.12 .36 Q-.83 .22 -.69 -.09 T-.33 -.18 Q-.16 -.34 .01 -.53 Q.22 -.7 .39 -.4 Q.61 -.12 1.12 .31 M-1.12 .51 Q-.55 .35 -.37 .12 Q-.2 -.03 .01 .15 Q.23 .35 .52 .14 Q.72 -.08 1.1 .25',
  tree: 'M-.07 .86 Q.03 .35 -.06 -.76 M-.01 .51 Q-.19 .19 -.49 -.04 L-.68 -.11 M-.3 .16 L-.34 -.22 M.01 .3 Q.22 .03 .52 -.23 L.64 -.39 M.24 .02 L.21 -.29 M.36 -.07 L.63 -.05 M-.06 -.3 L-.33 -.54 L-.43 -.77 M-.06 -.4 L.18 -.68',
  bird: 'M-.8 .17 Q-.4 -.42 -.02 .12 Q.33 -.56 .82 -.23 M-.02 .12 Q.08 .25 .22 .2',
  boat: 'M-.91 -.08 Q0 .07 .88 -.13 Q.62 .38 -.51 .28 Z M.01 -.1 L.01 -.77 L.58 -.25 L.01 -.25 M-.17 .28 L-.29 .55',
  cloud: 'M-.93 .24 Q-1 -.05 -.56 -.04 Q-.52 -.43 -.15 -.32 Q.16 -.69 .42 -.31 Q.78 -.32 .82 -.02 Q1 .04 .96 .21 Q.53 .28 -.93 .24 M-.57 .43 Q-.16 .39 .27 .44',
};

function drawMotif(ctx, layer, progress, index) {
  if (Object.hasOwn(contours, layer.motif)) {
    ctx.stroke(new Path2D(contours[layer.motif]));
    return;
  }
  switch (layer.motif) {
    case 'moon':
    case 'sun':
      ellipse(ctx, 0, 0, .88, .88, true);
      ctx.globalAlpha *= .34;
      ellipse(ctx, 0, 0, .98, .98);
      break;
    case 'skyline':
      for (let i = 0; i < 9; i++) {
        const left = -1.02 + i * .23;
        const height = .14 + .34 * Math.abs(Math.sin(i * 4.17 + index));
        line(ctx, [[left, .34], [left, .3 - height], [left + .19, .28 - height], [left + .19, .34]]);
        for (let floor = .4; floor < 1; floor += .26) {
          const y = .3 - height * floor;
          line(ctx, [[left + .052, y], [left + .073, y - .006]]);
          line(ctx, [[left + .12, y], [left + .146, y - .004]]);
        }
      }
      line(ctx, [[-1.04, .37], [0, .35], [1.04, .37]]);
      break;
    case 'lamp':
      ctx.save();
      ctx.globalAlpha *= .26;
      ellipse(ctx, .27, -.64, .49, .3, true);
      ctx.restore();
      line(ctx, [[-.2, .94], [-.17, -.68], [.26, -.76], [.47, -.55], [.02, -.54], [.26, -.76]]);
      line(ctx, [[-.39, .94], [.04, .93]]);
      break;
    case 'water':
      for (let i = 0; i < 21; i++) {
        const y = -.45 + i * .047;
        const center = .36 * Math.sin(i * 5.12 + index) + .025 * Math.sin(progress * 13 + i);
        const radius = .11 + .53 * Math.abs(Math.sin(i * 2.6));
        line(ctx, [[center - radius, y], [center, y + .008], [center + radius, y - .004]]);
      }
      break;
    case 'ripple':
      for (let i = 0; i < 4; i++) {
        const size = .12 + i * .18;
        ellipse(ctx, 0, 0, size, size * .33);
      }
      break;
    case 'rain':
    case 'snow':
      for (let i = 0; i < 22; i++) {
        const x = .96 * Math.sin(i * 13.39 + index);
        const y = ((i * .415 + progress * 1.2) % 1) * 1.8 - .9;
        if (layer.motif === 'snow') ellipse(ctx, x, y, .016, .016, true);
        else line(ctx, [[x, y], [x - .06, y + .2]]);
      }
      break;
    case 'sketch':
      line(ctx, layer.points.map(({ x, y }) => [x, y]));
      break;
  }
}

function paintLayer(ctx, layer, time, palette, index) {
  if (time < layer.start) return;
  const p = clamp((time - layer.start) / (layer.end - layer.start));
  const progress = smooth(p);
  const remaining = 1 - progress;
  ctx.save();
  ctx.globalAlpha = (layer.ink === 'wash' ? .6 : .94) * clamp(p * 12);
  ctx.strokeStyle = ctx.fillStyle = palette[layer.ink];
  const x = layer.x + (layer.motion === 'drift' ? -.21 * remaining : 0);
  const y = layer.y + (layer.motion === 'rise' ? .17 * remaining : layer.motion === 'fall' ? -.18 * remaining : 0);
  const size = layer.size * 360 * (layer.motion === 'spread' ? .12 + .88 * progress : 1);
  ctx.translate(x * 720, y * 720);
  ctx.scale(size, size);
  ctx.lineWidth = Math.max(.011, 1.15 / size);
  if (layer.motion === 'reveal') {
    ctx.beginPath();
    ctx.rect(-1.25, -1.25, 2.5 * progress, 2.5);
    ctx.clip();
  }
  drawMotif(ctx, layer, progress, index);
  ctx.restore();
}

export function makeGeneratedScene(plan) {
  const palette = palettes[plan.palette];
  const top = { top: 62, middle: 270, bottom: 475 }[plan.caption];
  return {
    name: plan.title,
    lines: plan.lines,
    beats: [],
    description: plan.description,
    ink: palette.pencil,
    sound: palette.sound,
    text: { x: 360, top, align: 'center', width: 614, size: 49, height: 57 },
    drawPaper(ctx) {
      const wash = ctx.createLinearGradient(40, 0, 680, 720);
      wash.addColorStop(0, palette.paper[0]);
      wash.addColorStop(1, palette.paper[1]);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, 720, 720);
    },
    draw(ctx, progress) {
      plan.layers.forEach((layer, index) => paintLayer(ctx, layer, progress, palette, index));
    },
  };
}
