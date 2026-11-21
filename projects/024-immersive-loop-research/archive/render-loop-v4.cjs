const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = __dirname;
const W = 640, H = 640, FPS = 25, COUNT = 75;
const TAU = Math.PI * 2, pixels = W * H, frameBytes = pixels * 3;
function ff(args, input) {
  const p = cp.spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { input, maxBuffer: 256 * 1024 * 1024 });
  if (p.status !== 0) throw new Error(String(p.stderr));
  return p.stdout;
}
const image = ff(['-i', path.join(root, 'garden-base-v3.png'), '-vf', `scale=${W}:${H}:flags=lanczos`, '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const cx = 335, cy = 333, sourceX = 326, sourceY = 304, lambda = 4.8;
const geometry = new Float32Array(pixels * 7);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), theta = Math.atan2(dy, dx);
  const p = (y * W + x) * 7;
  const u = Math.min(1, r / 25), coreBlend = u * u * (3 - 2 * u);
  geometry[p] = theta;
  geometry[p + 1] = TAU * Math.log(Math.sqrt(r * r + 29 * 29) / 320) / Math.log(lambda);
  geometry[p + 2] = Math.sin(5 * theta);
  geometry[p + 3] = Math.cos(5 * theta);
  geometry[p + 4] = Math.sin(3 * theta);
  geometry[p + 5] = Math.cos(3 * theta);
  geometry[p + 6] = coreBlend;
}
function render(phase) {
  const frame = Buffer.allocUnsafe(frameBytes);
  const sn = Math.sin(phase), cs = Math.cos(phase), sn2 = Math.sin(2 * phase), cs2 = Math.cos(2 * phase);
  for (let i = 0; i < pixels; i++) {
    const g = i * 7;
    const foldLobes = geometry[g + 2] * cs + geometry[g + 3] * sn;
    // Logarithmic nested sheets move continuously inward, reflecting the flower
    // texture radially at every fold. Neighboring layers turn back together.
    const q = geometry[g + 1] + phase + 0.11 * foldLobes;
    const sinQ = Math.sin(q), cosQ = Math.cos(q);
    // A reflected logarithmic coordinate keeps radial and tangential scale
    // close to equal. Blooms stay recognizable while the annuli fold over.
    const foldedLogRadius = Math.acos(Math.max(-1, Math.min(1, cosQ))) / Math.PI;
    const radius = 134 * Math.pow(Math.sqrt(lambda), foldedLogRadius) * geometry[g + 6];
    const angle = geometry[g] + 0.11 * sinQ + 0.095 * foldLobes + 0.035 * (geometry[g + 4] * cs2 - geometry[g + 5] * sn2);
    const xx = Math.max(0, Math.min(W - 1.001, sourceX + radius * Math.cos(angle)));
    const yy = Math.max(0, Math.min(H - 1.001, sourceY + 0.94 * radius * Math.sin(angle)));
    const x0 = Math.floor(xx), y0 = Math.floor(yy), fx = xx - x0, fy = yy - y0;
    const a = (y0 * W + x0) * 3, b = a + 3, c = a + W * 3, d = c + 3;
    const light = 0.96 + 0.075 * sinQ;
    const shimmer = 0.045 * Math.sin(2 * q - foldLobes);
    for (let ch = 0; ch < 3; ch++) {
      let value = (image[a + ch] * (1 - fx) + image[b + ch] * fx) * (1 - fy) + (image[c + ch] * (1 - fx) + image[d + ch] * fx) * fy;
      value = value * light + Math.max(0, value - 105) * shimmer;
      frame[i * 3 + ch] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }
  return frame;
}
const frames = Buffer.allocUnsafe(frameBytes * COUNT);
for (let i = 0; i < COUNT; i++) {
  render(TAU * i / COUNT).copy(frames, i * frameBytes);
  if (i % 15 === 0) console.log(`Rendered ${i}/${COUNT}`);
}
const rawInput = ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0'];
const mp4 = path.join(root, 'garden-fold-loop-v4.mp4'), gif = path.join(root, 'garden-fold-loop-v4.gif');
ff([...rawInput, '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], frames);
ff([...rawInput, '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=full:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', gif], frames);
ff(['-i', mp4, '-vf', "select='eq(n,0)+eq(n,12)+eq(n,25)+eq(n,37)+eq(n,50)+eq(n,62)',scale=280:280,tile=3x2", '-frames:v', '1', path.join(root, 'fold-contact-v4.jpg')]);
function mae(a, b) { let total = 0; for (let i = 0; i < frameBytes; i++) total += Math.abs(a[i] - b[i]); return total / frameBytes; }
const decoded = ff(['-i', gif, '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const at = n => decoded.subarray(n * frameBytes, (n + 1) * frameBytes);
let sum = 0; for (let i = 1; i < COUNT; i++) sum += mae(at(i - 1), at(i));
const avg = sum / (COUNT - 1), seam = mae(at(COUNT - 1), at(0));
const bytes = fs.readFileSync(gif), index = bytes.indexOf('NETSCAPE2.0');
const metrics = {
  version: 4, effect: 'Continuous inward nested folding of the entire flower field',
  width: W, height: H, fps: FPS, frames: COUNT, seconds: COUNT / FPS,
  decodedFrames: decoded.length / frameBytes, loopCount: index >= 0 ? bytes.readUInt16LE(index + 13) : null,
  endpointPixelMAE: mae(frames.subarray(0, frameBytes), render(TAU)),
  decodedSeamMAE: seam, decodedMeanAdjacentMAE: avg, seamToAdjacentRatio: seam / avg, gifBytes: bytes.length
};
fs.writeFileSync(path.join(root, 'validation-v4.json'), JSON.stringify(metrics, null, 2));
fs.writeFileSync(path.join(root, 'provenance-v4.json'), JSON.stringify({
  title: '花丛 · 连续反折', baseImage: 'garden-base-v3.png', imageProvenance: 'provenance-v3.json',
  renderer: 'render-loop-v4.cjs', production: 'Existing AI-generated floral texture animated by deterministic spatial folding',
  motion: 'One shared periodic coordinate field. Logarithmic radial reflections and five-lobed angular bending transform all flower layers simultaneously; no per-flower handoff sequence.',
  parameters: { center: [cx, cy], lambda, sourceCenter: [sourceX, sourceY], sourceRadius: [134, 134 * Math.sqrt(lambda)], durationSeconds: COUNT / FPS, fps: FPS },
  verification: 'validation-v4.json', gif: path.basename(gif), mp4: path.basename(mp4)
}, null, 2));
console.log(JSON.stringify(metrics, null, 2));
if (metrics.decodedFrames !== COUNT || metrics.loopCount !== 0 || metrics.endpointPixelMAE !== 0 || metrics.seamToAdjacentRatio > 1.7) throw new Error('Loop validation failed');
