const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const out = __dirname;
const W = 640, H = 640, FPS = 25, COUNT = 60, TAU = 2 * Math.PI;
const pixels = W * H, size = pixels * 3;
function ff(args, input) {
  const r = cp.spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { input, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}
const still = ff(['-i', path.join(out, 'garden-base.png'), '-vf', `scale=${W}:${H}:flags=lanczos`, '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
// Flower centers and influence ellipses, measured on this particular still.
const flowers = [
  { name: 'white-cosmos-front', x: 195, y: 414, rx: 92, ry: 76, phase: 0.25, strength: 1.00 },
  { name: 'coral-dahlia-left', x: 188, y: 290, rx: 77, ry: 76, phase: 2.15, strength: 1.05 },
  { name: 'white-cosmos-lower', x: 237, y: 520, rx: 78, ry: 65, phase: 4.00, strength: 0.95 },
  { name: 'white-cosmos-left', x: 36, y: 394, rx: 62, ry: 58, phase: 5.15, strength: 0.90 },
  { name: 'white-cosmos-center', x: 318, y: 349, rx: 44, ry: 44, phase: 1.10, strength: 0.78 },
  { name: 'dahlia-right', x: 512, y: 346, rx: 62, ry: 59, phase: 3.25, strength: 0.95 },
  { name: 'white-cosmos-right', x: 629, y: 462, rx: 60, ry: 53, phase: 1.90, strength: 0.90 },
  { name: 'delphinium-upper', x: 78, y: 129, rx: 59, ry: 84, phase: 3.40, strength: 0.65 },
  { name: 'delphinium-middle', x: 93, y: 214, rx: 69, ry: 58, phase: 0.80, strength: 0.75 },
  { name: 'small-white-lower', x: 389, y: 590, rx: 40, ry: 39, phase: 5.00, strength: 0.65 },
  { name: 'small-white-center', x: 328, y: 448, rx: 37, ry: 34, phase: 2.60, strength: 0.65 }
];
for (const f of flowers) {
  f.samples = [];
  for (let y = Math.max(0, Math.floor(f.y - f.ry)); y <= Math.min(H - 1, Math.ceil(f.y + f.ry)); y++) {
    for (let x = Math.max(0, Math.floor(f.x - f.rx)); x <= Math.min(W - 1, Math.ceil(f.x + f.rx)); x++) {
      const dx = x - f.x, dy = y - f.y;
      const r2 = (dx / f.rx) ** 2 + (dy / f.ry) ** 2;
      if (r2 >= 1) continue;
      const w = (1 - r2) ** 3;
      const angle = Math.atan2(dy / f.ry, dx / f.rx);
      f.samples.push({ p: y * W + x, dx, dy, w, a: Math.sin(5 * angle), b: Math.cos(5 * angle) });
    }
  }
}
const baseX = new Float32Array(pixels), baseY = new Float32Array(pixels);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = y * W + x;
  const sides = 1 - 0.88 * Math.exp(-(((x / W - 0.59) / 0.17) ** 2));
  const anchor = Math.sin(Math.PI * y / (H - 1));
  baseX[p] = 1.5 * sides * anchor;
  baseY[p] = 0.30 * sides * anchor;
}
function warp(phase) {
  const dx = new Float32Array(pixels), dy = new Float32Array(pixels), illumination = new Float32Array(pixels);
  const wind = Math.sin(phase), lift = Math.cos(phase);
  for (let p = 0; p < pixels; p++) { dx[p] = baseX[p] * wind; dy[p] = baseY[p] * lift; }
  for (const f of flowers) {
    const s = f.strength;
    const radial = s * (0.275 * Math.sin(2 * phase + f.phase) + 0.045 * Math.sin(phase + f.phase));
    const oval = s * 0.075 * Math.sin(2 * phase + f.phase + 1.15);
    const turn = s * 0.080 * Math.sin(phase + f.phase + 0.65);
    const tx = s * 4.4 * Math.sin(phase + f.phase), ty = s * 2.1 * Math.cos(phase + f.phase + 0.3);
    const petalSin = Math.sin(3 * phase + f.phase), petalCos = Math.cos(3 * phase + f.phase);
    const gleam = 0.085 * Math.sin(3 * phase + f.phase);
    for (const q of f.samples) {
      const curl = s * 0.044 * (q.a * petalCos + q.b * petalSin);
      dx[q.p] += q.w * (tx - (radial + oval + curl) * q.dx + turn * q.dy);
      dy[q.p] += q.w * (ty - (radial - oval + curl) * q.dy - turn * q.dx);
      illumination[q.p] += q.w * gleam;
    }
  }
  return { dx, dy, illumination };
}
let rng = 2026111202;
function random() { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; }
const lights = Array.from({ length: 172 }, (_, i) => ({
  x: W * (0.055 + 0.89 * random()), y: H * (0.08 + 0.78 * random()),
  r: 0.55 + 0.95 * random(), phase: random() * TAU, k: 2 + Math.floor(4 * random()),
  drift: 1.5 + 4 * random(), strength: 0.62 + 0.38 * random(), warm: i % 5 !== 0
}));
// Bright glints are also attached to actual petal highlights.
const glints = [];
for (const f of flowers) {
  let tries = 0, count = 0;
  while (count < 6 && tries++ < 160) {
    const x = Math.round(f.x + (random() - 0.5) * f.rx), y = Math.round(f.y + (random() - 0.5) * f.ry);
    if (x < 2 || x >= W - 2 || y < 2 || y >= H - 2) continue;
    const p = (y * W + x) * 3;
    if (0.22 * still[p] + 0.65 * still[p + 1] + 0.13 * still[p + 2] < 92) continue;
    glints.push({ x, y, r: 0.55 + 0.35 * random(), phase: random() * TAU, k: 2 + Math.floor(random() * 3), strength: 0.7 + 0.3 * random(), warm: true });
    count++;
  }
}
function drawLight(frame, x, y, light, intensity) {
  const range = Math.ceil(light.r * 4);
  for (let py = Math.max(0, Math.floor(y - range)); py <= Math.min(H - 1, Math.ceil(y + range)); py++) {
    for (let px = Math.max(0, Math.floor(x - range)); px <= Math.min(W - 1, Math.ceil(x + range)); px++) {
      const d2 = (px - x) ** 2 + (py - y) ** 2;
      const v = intensity * (214 * Math.exp(-d2 / (light.r ** 2 * 0.7)) + 37 * Math.exp(-d2 / (light.r ** 2 * 5)));
      const p = (py * W + px) * 3;
      frame[p] = Math.min(255, frame[p] + v * (light.warm ? 1 : 0.72));
      frame[p + 1] = Math.min(255, frame[p + 1] + v * (light.warm ? 0.82 : 0.9));
      frame[p + 2] = Math.min(255, frame[p + 2] + v * (light.warm ? 0.49 : 1));
    }
  }
}
function render(phase, includeLights = true) {
  const frame = Buffer.allocUnsafe(size);
  const field = warp(phase);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const pi = y * W + x, p = pi * 3;
    const xx = Math.max(0, Math.min(W - 1.001, x + field.dx[pi]));
    const yy = Math.max(0, Math.min(H - 1.001, y + field.dy[pi]));
    const x0 = Math.floor(xx), y0 = Math.floor(yy), fx = xx - x0, fy = yy - y0;
    const a = (y0 * W + x0) * 3, b = a + 3, c = a + W * 3, d = c + 3;
    const gain = 1 + field.illumination[pi];
    for (let ch = 0; ch < 3; ch++) {
      const value = ((still[a + ch] * (1 - fx) + still[b + ch] * fx) * (1 - fy) + (still[c + ch] * (1 - fx) + still[d + ch] * fx) * fy) * gain;
      frame[p + ch] = Math.min(255, Math.max(0, Math.round(value)));
    }
  }
  if (includeLights) {
    for (const light of lights) {
      const x = light.x + light.drift * Math.sin(phase + light.phase);
      const y = light.y + 2.5 * Math.cos(phase + light.phase);
      const pulse = Math.pow(0.5 + 0.5 * Math.cos(light.k * phase + light.phase), 6);
      drawLight(frame, x, y, light, light.strength * (0.012 + 0.988 * pulse));
    }
    for (const light of glints) {
      const p = light.y * W + light.x;
      const x = light.x - field.dx[p], y = light.y - field.dy[p];
      const pulse = Math.pow(0.5 + 0.5 * Math.cos(light.k * phase + light.phase), 9);
      drawLight(frame, x, y, light, light.strength * pulse);
    }
  }
  return frame;
}
const frames = Buffer.allocUnsafe(size * COUNT);
for (let f = 0; f < COUNT; f++) {
  render(TAU * f / COUNT).copy(frames, f * size);
  if (f % 15 === 0) console.log(`Rendered ${f}/${COUNT}`);
}
const mp4 = path.join(out, 'garden-loop-v2.mp4');
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], frames);
ff(['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0', '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=full:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', path.join(out, 'garden-loop-v2.gif')], frames);
ff(['-i', mp4, '-vf', "select='eq(n,0)+eq(n,15)+eq(n,30)+eq(n,45)',scale=320:320,tile=4x1", '-frames:v', '1', path.join(out, 'contact-sheet-v2.jpg')]);
ff(['-i', mp4, '-vf', "select='eq(n,0)+eq(n,8)+eq(n,15)+eq(n,23)',crop=220:315:95:232,scale=280:-1,tile=4x1", '-frames:v', '1', path.join(out, 'flower-detail-v2.jpg')]);
function mae(a, b, flowerOnly = false) {
  let sum = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (flowerOnly && !flowers.some(f => ((x - f.x) / (f.rx * 0.60)) ** 2 + ((y - f.y) / (f.ry * 0.60)) ** 2 < 1)) continue;
    const p = (y * W + x) * 3;
    for (let ch = 0; ch < 3; ch++) { sum += Math.abs(a[p + ch] - b[p + ch]); n++; }
  }
  return sum / n;
}
const at = f => frames.subarray(f * size, (f + 1) * size);
let adjacent = 0;
for (let f = 1; f < COUNT; f++) adjacent += mae(at(f - 1), at(f));
const oldFirst = ff(['-i', path.join(out, 'garden-loop.mp4'), '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const oldQuarter = ff(['-i', path.join(out, 'garden-loop.mp4'), '-vf', 'select=eq(n\\,20)', '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const f0 = warp(0), fEnd = warp(TAU), eps = 0.0001, fPlus = warp(eps), fMinus = warp(TAU - eps);
let maxEndpointFlowError = 0, maxVelocityDifference = 0;
for (let p = 0; p < pixels; p++) {
  for (const key of ['dx', 'dy']) {
    maxEndpointFlowError = Math.max(maxEndpointFlowError, Math.abs(f0[key][p] - fEnd[key][p]));
    maxVelocityDifference = Math.max(maxVelocityDifference, Math.abs((fPlus[key][p] - f0[key][p]) / eps - (fEnd[key][p] - fMinus[key][p]) / eps));
  }
}
// Measure flowers without added sparkles, to keep shimmer from inflating the result.
const flowerMotionV2 = mae(render(0, false), render(Math.PI / 2, false), true);
const flowerMotionV1 = mae(oldFirst, oldQuarter, true);
const metrics = {
  version: 2, width: W, height: H, fps: FPS, frames: COUNT, durationSeconds: COUNT / FPS,
  flowerRegions: flowers.length, airborneLightPoints: lights.length, petalGlints: glints.length,
  endpointPixelMAE: mae(at(0), render(TAU)), maxEndpointFlowError,
  finiteDifferenceVelocityErrorPxPerRadian: maxVelocityDifference,
  seamMAE: mae(at(COUNT - 1), at(0)), meanAdjacentFrameMAE: adjacent / (COUNT - 1),
  flowerOnlyQuarterCycleMAE: { v1: flowerMotionV1, v2WithoutSparkles: flowerMotionV2, ratio: flowerMotionV2 / flowerMotionV1 },
  gifBytes: fs.statSync(path.join(out, 'garden-loop-v2.gif')).size
};
fs.writeFileSync(path.join(out, 'validation-v2.json'), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
