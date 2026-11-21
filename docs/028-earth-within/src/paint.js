export const W = 960;
export const H = 540;
export const TAU = Math.PI * 2;

export function random(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function field(count, seed) {
  const next = random(seed);
  return Array.from({ length: count }, () => [next(), next(), next(), next()]);
}

export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function mix(a, b, p) {
  return a + (b - a) * p;
}

export function smooth(a, b, value) {
  const p = clamp((value - a) / (b - a));
  return p * p * (3 - 2 * p);
}

export function gradient(ctx, x0, y0, x1, y1, stops) {
  const color = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([at, fill]) => color.addColorStop(at, fill));
  return color;
}

export function glow(ctx, x, y, rx, ry, stops) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  const color = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  stops.forEach(([at, fill]) => color.addColorStop(at, fill));
  oval(ctx, 0, 0, 1, 1, color);
  ctx.restore();
}

export function oval(ctx, x, y, rx, ry, fill, angle = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, angle, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function path(ctx, points, closed = false) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  if (closed) ctx.closePath();
}

export function shape(ctx, points, fill) {
  path(ctx, points, true);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function line(ctx, points, color, width = 1) {
  path(ctx, points);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function texture(ctx, particles, y0, height, light, dark) {
  for (const [x, y, size, shade] of particles) {
    ctx.fillStyle = shade > .42 ? light : dark;
    ctx.fillRect(x * W, y0 + y * height, 1 + size * 4, 1 + size * 2);
  }
}

export function backdrop(ctx, colors) {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H, colors.map((color, i) => [i / (colors.length - 1), color]));
  ctx.fillRect(0, 0, W, H);
}

export function waterlines(ctx, particles, time, top, height, color) {
  for (const [x, y, size] of particles) {
    const px = (x * (W + 120) + time * (13 + 22 * size)) % (W + 120) - 60;
    const py = top + y * height;
    line(ctx, [[px, py], [px + 5 + size * (18 + y * 31), py]], color, .6 + size);
  }
}

export function leaf(ctx, x, y, scale, angle, fill, vein) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-24, 2);
  ctx.bezierCurveTo(-12, -18, 11, -16, 26, -2);
  ctx.bezierCurveTo(10, 14, -9, 16, -24, 2);
  ctx.fillStyle = fill;
  ctx.fill();
  line(ctx, [[-31, 5], [-8, 1], [19, -2]], vein, 1.4);
  line(ctx, [[-13, 2], [-8, -6]], vein);
  line(ctx, [[-4, 1], [4, 7]], vein);
  line(ctx, [[5, 0], [12, -7]], vein);
  ctx.restore();
}
