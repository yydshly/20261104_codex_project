const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const out = __dirname;
const W = 640, H = 640, FPS = 25, COUNT = 100, TAU = Math.PI * 2;
const pixels = W * H, frameBytes = pixels * 3;
function ff(args, input) {
  const r = cp.spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { input, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}
const still = ff(['-i', path.join(out, 'garden-base-v3.png'), '-vf', `scale=${W}:${H}:flags=lanczos`, '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const center = { x: 326, y: 304 };
// The ordering is a closed gaze path. Positions are measured on the new still.
const outer = [
  { name: 'lower-left-ivory', x: 91, y: 527, rx: 155, ry: 136 },
  { name: 'left-mauve', x: 67, y: 345, rx: 97, ry: 95 },
  { name: 'left-dahlia', x: 77, y: 210, rx: 104, ry: 106 },
  { name: 'upper-ivory', x: 203, y: 98, rx: 111, ry: 103 },
  { name: 'upper-dahlia', x: 415, y: 79, rx: 124, ry: 116 },
  { name: 'upper-right-ivory', x: 552, y: 142, rx: 81, ry: 75 },
  { name: 'right-ivory', x: 551, y: 249, rx: 121, ry: 109 },
  { name: 'right-mauve', x: 600, y: 363, rx: 77, ry: 82 },
  { name: 'lower-right-dahlia', x: 517, y: 457, rx: 146, ry: 130 },
  { name: 'lower-mauve', x: 387, y: 520, rx: 85, ry: 83 },
  { name: 'bottom-ivory', x: 314, y: 570, rx: 103, ry: 85 },
  { name: 'bottom-blue', x: 219, y: 608, rx: 69, ry: 53 }
];
const inner = [
  { name: 'inner-dahlia', x: 252, y: 369, rx: 77, ry: 72 },
  { name: 'inner-left-mauve', x: 205, y: 305, rx: 48, ry: 48 },
  { name: 'inner-ivory', x: 272, y: 216, rx: 62, ry: 61 },
  { name: 'inner-upper-blue', x: 351, y: 195, rx: 42, ry: 46 },
  { name: 'inner-right-blue', x: 406, y: 249, rx: 43, ry: 45 },
  { name: 'inner-right-ivory', x: 445, y: 393, rx: 72, ry: 66 },
  { name: 'inner-lower-blue', x: 342, y: 387, rx: 39, ry: 42 }
];
const startAngle = Math.atan2(outer[0].y - center.y, outer[0].x - center.x);
function routeAngle(f) { return ((Math.atan2(f.y - center.y, f.x - center.x) - startAngle) % TAU + TAU) % TAU; }
const flowers = [...outer.map(f => ({ ...f, depth: 0, strength: 1 })), ...inner.map(f => ({ ...f, depth: 1, strength: 0.76 }))];
for (const f of flowers) {
  f.phase = routeAngle(f) + f.depth * 0.80;
  const theta = Math.atan2(f.y - center.y, f.x - center.x);
  f.tx = -Math.sin(theta); f.ty = Math.cos(theta);
  f.samples = [];
  for (let y = Math.max(0, Math.floor(f.y - f.ry)); y <= Math.min(H - 1, Math.ceil(f.y + f.ry)); y++) {
    for (let x = Math.max(0, Math.floor(f.x - f.rx)); x <= Math.min(W - 1, Math.ceil(f.x + f.rx)); x++) {
      const dx = x - f.x, dy = y - f.y, r2 = (dx / f.rx) ** 2 + (dy / f.ry) ** 2;
      if (r2 >= 1) continue;
      const a = Math.atan2(dy / f.ry, dx / f.rx);
      f.samples.push({ p: y * W + x, dx, dy, w: (1 - r2) ** 3, petalS: Math.sin(5 * a), petalC: Math.cos(5 * a) });
    }
  }
}
function envelope(phase) { return Math.exp(3.0 * (Math.cos(phase) - 1)); }
function fieldAt(phase) {
  const dx = new Float32Array(pixels), dy = new Float32Array(pixels), glow = new Float32Array(pixels);
  for (const f of flowers) {
    const local = phase - f.phase, pulse = envelope(local), afterglow = envelope(local - 0.22);
    const s = f.strength;
    // The wave opens one flower while the preceding head eases back into rest.
    const opening = s * (0.49 * pulse - 0.12);
    const oval = s * 0.085 * Math.sin(local) * (0.3 + pulse);
    const turn = s * 0.16 * Math.sin(local - 0.30) * (0.25 + pulse);
    const carry = s * 5.5 * pulse;
    const tx = f.tx * carry - (f.x - center.x) * f.depth * 0.012 * pulse;
    const ty = f.ty * carry - (f.y - center.y) * f.depth * 0.012 * pulse;
    const petalS = Math.sin(local), petalC = Math.cos(local);
    const gleam = 0.34 * afterglow - 0.055;
    for (const q of f.samples) {
      const petal = s * 0.060 * (q.petalS * petalC + q.petalC * petalS) * (0.22 + pulse);
      dx[q.p] += q.w * (tx - (opening + oval + petal) * q.dx + turn * q.dy);
      dy[q.p] += q.w * (ty - (opening - oval + petal) * q.dy - turn * q.dx);
      glow[q.p] += q.w * gleam;
    }
  }
  return { dx, dy, glow };
}
let rng = 2026111203;
function random() { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng / 4294967296; }
const glints = [];
for (const f of flowers) {
  let count = 0, tries = 0;
  while (count < (f.depth ? 5 : 9) && tries++ < 250) {
    const x = Math.round(f.x + (random() - 0.5) * f.rx * 1.1), y = Math.round(f.y + (random() - 0.5) * f.ry * 1.1);
    if (x < 2 || x >= W - 2 || y < 2 || y >= H - 2) continue;
    const p = (y * W + x) * 3;
    if (0.23 * still[p] + 0.64 * still[p + 1] + 0.13 * still[p + 2] < 100) continue;
    glints.push({ x, y, phase: f.phase, flicker: random() * TAU, r: 0.5 + random() * 0.60, strength: 0.5 + random() * 0.5 });
    count++;
  }
}
function light(frame, x, y, radius, strength) {
  const extent = Math.ceil(radius * 3.5);
  for (let py = Math.max(0, Math.floor(y - extent)); py <= Math.min(H - 1, Math.ceil(y + extent)); py++) {
    for (let px = Math.max(0, Math.floor(x - extent)); px <= Math.min(W - 1, Math.ceil(x + extent)); px++) {
      const dist2 = (px - x) ** 2 + (py - y) ** 2;
      const value = strength * (180 * Math.exp(-dist2 / (radius * radius * 0.75)) + 27 * Math.exp(-dist2 / (radius * radius * 4)));
      const p = (py * W + px) * 3;
      frame[p] = Math.min(255, frame[p] + value);
      frame[p + 1] = Math.min(255, frame[p + 1] + value * 0.85);
      frame[p + 2] = Math.min(255, frame[p + 2] + value * 0.63);
    }
  }
}
function render(phase) {
  const frame = Buffer.allocUnsafe(frameBytes), field = fieldAt(phase);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const pi = y * W + x, p = pi * 3;
    const xx = Math.max(0, Math.min(W - 1.001, x + field.dx[pi]));
    const yy = Math.max(0, Math.min(H - 1.001, y + field.dy[pi]));
    const x0 = Math.floor(xx), y0 = Math.floor(yy), fx = xx - x0, fy = yy - y0;
    const a = (y0 * W + x0) * 3, b = a + 3, c = a + W * 3, d = c + 3;
    for (let ch = 0; ch < 3; ch++) {
      const value = ((still[a + ch] * (1 - fx) + still[b + ch] * fx) * (1 - fy) + (still[c + ch] * (1 - fx) + still[d + ch] * fx) * fy) * (1 + field.glow[pi]);
      frame[p + ch] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }
  for (const g of glints) {
    const p = g.y * W + g.x;
    const handoff = envelope(phase - g.phase - 0.24);
    const flutter = 0.3 + 0.7 * (0.5 + 0.5 * Math.cos(5 * phase + g.flicker)) ** 3;
    light(frame, g.x - field.dx[p], g.y - field.dy[p], g.r, g.strength * handoff * flutter);
  }
  return frame;
}
const frames = Buffer.allocUnsafe(frameBytes * COUNT);
for (let i = 0; i < COUNT; i++) {
  render(TAU * i / COUNT).copy(frames, i * frameBytes);
  if (i % 25 === 0) console.log(`Rendered ${i}/${COUNT}`);
}
const rawInput = ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0'];
const gifPath = path.join(out, 'garden-loop-v3.gif'), mp4Path = path.join(out, 'garden-loop-v3.mp4');
ff([...rawInput, '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4Path], frames);
// Use original rendered pixels directly; do not quantize a lossy MP4 intermediate.
ff([...rawInput, '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=full:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', gifPath], frames);
ff(['-i', mp4Path, '-vf', "select='eq(n,0)+eq(n,16)+eq(n,33)+eq(n,50)+eq(n,66)+eq(n,83)',scale=240:240,tile=3x2", '-frames:v', '1', path.join(out, 'contact-sheet-v3.jpg')]);
function mae(a, b) { let s = 0; for (let i = 0; i < frameBytes; i++) s += Math.abs(a[i] - b[i]); return s / frameBytes; }
const frameAt = n => frames.subarray(n * frameBytes, (n + 1) * frameBytes);
const decoded = ff(['-i', gifPath, '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const decodedAt = n => decoded.subarray(n * frameBytes, (n + 1) * frameBytes);
let adjacent = 0;
for (let i = 1; i < COUNT; i++) adjacent += mae(decodedAt(i - 1), decodedAt(i));
const meanAdjacent = adjacent / (COUNT - 1), seam = mae(decodedAt(COUNT - 1), decodedAt(0));
const encoded = fs.readFileSync(gifPath), netscape = encoded.indexOf('NETSCAPE2.0');
const leadSequence = Array.from({ length: 12 }, (_, i) => {
  const phase = TAU * i / 12;
  const sorted = outer.map(f => ({ name: f.name, bloom: envelope(phase - routeAngle(f)) })).sort((a, b) => b.bloom - a.bloom);
  return { timeSeconds: i * COUNT / FPS / 12, leadingFlower: sorted[0].name, nextActiveFlower: sorted[1].name };
});
const metrics = {
  version: 3, frames: COUNT, width: W, height: H, fps: FPS, durationSeconds: COUNT / FPS,
  outerFlowerRegions: outer.length, innerFlowerRegions: inner.length, attachedGlints: glints.length,
  exactPeriodicEndpointMAE: mae(frameAt(0), render(TAU)), decodedFrames: decoded.length / frameBytes,
  gifLoopCount: netscape >= 0 ? encoded.readUInt16LE(netscape + 13) : null,
  decodedSeamMAE: seam, decodedMeanAdjacentMAE: meanAdjacent, decodedSeamToAdjacentRatio: seam / meanAdjacent,
  orderedHandoffs: leadSequence, gifBytes: encoded.length
};
fs.writeFileSync(path.join(out, 'validation-v3.json'), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
if (metrics.exactPeriodicEndpointMAE !== 0 || metrics.decodedFrames !== COUNT || metrics.gifLoopCount !== 0 || metrics.decodedSeamToAdjacentRatio > 1.7) throw new Error('Loop validation failed');
