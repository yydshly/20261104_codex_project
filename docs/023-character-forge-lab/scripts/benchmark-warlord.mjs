import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { PROJECT_ROOT, parseGlb, sha256 } from './verify-warlord.mjs';

const normalize = value => Number.isFinite(value) ? Number(value.toFixed(3)) : null;
const percentile = (sorted, fraction) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * fraction))];
const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const number = (value, label, minimum = 0) => { assert(Number.isFinite(value) && value >= minimum, label); return value; };

function textureDimensions(bytes) {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes.length < 4 || bytes.readUInt16BE(0) !== 0xffd8) return null;
  for (let offset = 2; offset + 4 <= bytes.length;) {
    if (bytes[offset++] !== 0xff) continue;
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 1 || marker >= 0xd0 && marker <= 0xd7) continue;
    const size = bytes.readUInt16BE(offset); assert(size >= 2 && offset + size <= bytes.length, 'Bounded JPEG segment');
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    offset += size;
  }
  return null;
}

export async function assetBudget(assetPath, actorCount = 4) {
  number(actorCount, 'A positive actor count', 1);
  assert(Number.isInteger(actorCount), 'Actor count is an integer');
  const buffer = await fs.readFile(assetPath), glb = parseGlb(buffer), g = glb.document;
  let trianglesPerActor = 0, drawPrimitivesPerActor = 0, skinnedVerticesPerActor = 0;
  const referencedMaterials = new Set();
  const meshNodes = g.nodes.filter(node => node.mesh !== undefined);
  for (const node of meshNodes) for (const primitive of g.meshes[node.mesh].primitives) {
    drawPrimitivesPerActor++;
    const count = primitive.indices !== undefined ? g.accessors[primitive.indices].count : g.accessors[primitive.attributes.POSITION].count;
    if ((primitive.mode ?? 4) === 4) trianglesPerActor += count / 3;
    if (node.skin !== undefined) skinnedVerticesPerActor += g.accessors[primitive.attributes.POSITION].count;
    if (primitive.material !== undefined) referencedMaterials.add(primitive.material);
  }
  const images = (g.images || []).map((image, index) => {
    assert(image.bufferView !== undefined && !image.uri, 'Benchmark asset image is embedded');
    const view = g.bufferViews[image.bufferView], start = view.byteOffset || 0;
    assert(start + view.byteLength <= glb.binary.length, 'Image bytes are bounded');
    const dimensions = textureDimensions(glb.binary.subarray(start, start + view.byteLength));
    return { image: index, compressedBytes: view.byteLength, ...dimensions };
  });
  const rgba8MipEstimate = images.every(image => image.width && image.height) ? images.reduce((sum, image) => sum + image.width * image.height * 4 * 4 / 3, 0) : null;
  return {
    sha256: sha256(buffer), bytes: buffer.length, meshNodes: meshNodes.length, materialCount: referencedMaterials.size, bones: Math.max(...g.skins.map(skin => skin.joints.length)), clips: g.animations.length,
    trianglesPerActor, drawPrimitivesPerActor, skinnedVerticesPerActor, actorCount,
    sceneActorEstimate: { triangles: trianglesPerActor * actorCount, geometryDrawPrimitives: drawPrimitivesPerActor * actorCount, skinnedVertices: skinnedVerticesPerActor * actorCount },
    embeddedImageCount: images.length, sharedTextureRgba8WithMipmapsEstimateBytes: rgba8MipEstimate,
    estimateScope: 'Asset-only counts. Four clones may share geometry/textures. Frustum culling, pass count, shadows, particles and arena geometry change real draws. RGBA8+mip estimate is not measured VRAM. No FPS is inferred from these counts.',
  };
}

export function summarizeBrowserMeasurement(report, assetSha256, minimumSeconds = 60) {
  number(minimumSeconds, 'A positive long-run threshold', .001);
  assert.equal(report.schema, 'chixiao-browser-benchmark-v1', 'Recognized measured-browser schema');
  assert.equal(report.assetSha256, assetSha256, 'Browser run identifies this exact asset');
  assert(report.frameTimesClamped !== true, 'FPS samples must not use the gameplay delta clamp');
  assert(Array.isArray(report.frameTimesMs) && report.frameTimesMs.length >= 2, 'Actual unclamped RAF frame samples are supplied');
  const times = report.frameTimesMs.map(value => number(value, 'Positive finite frame duration', .001));
  const sorted = [...times].sort((a, b) => a - b), totalMs = times.reduce((sum, value) => sum + value, 0);
  const visibleSeconds = number(report.visibleDurationSeconds, 'Measured visible duration');
  const sampleSeconds = totalMs / 1000, coverage = visibleSeconds > 0 ? sampleSeconds / visibleSeconds : 0;
  const longRun = visibleSeconds >= minimumSeconds && sampleSeconds >= minimumSeconds && coverage >= .8;
  const samples = report.rendererSamples || [];
  assert(Array.isArray(samples), 'Renderer samples are an array');
  for (const sample of samples) for (const key of ['calls', 'triangles', 'geometries', 'textures', 'programs']) if (sample[key] !== undefined) number(sample[key], `Measured renderer ${key}`);
  const rendererRange = key => {
    const values = samples.map(sample => sample[key]).filter(Number.isFinite);
    return values.length ? { min: Math.min(...values), max: Math.max(...values), mean: normalize(average(values)), first: values[0], last: values.at(-1), change: values.at(-1) - values[0] } : null;
  };
  return {
    status: longRun ? 'measured' : visibleSeconds >= minimumSeconds ? 'partial-measurement' : 'short-measurement', source: 'Supplied actual browser RAF/renderer.info telemetry; no synthetic samples generated.',
    scenario: report.scenario || 'unspecified', startedAt: report.startedAt || null, endedAt: report.endedAt || null, viewport: report.viewport || null, context: report.context || report.gpu || null,
    frameSamples: times.length, visibleDurationSeconds: visibleSeconds, sampledSeconds: normalize(sampleSeconds), timingCoverageRatio: normalize(coverage), minimumLongRunSeconds: minimumSeconds,
    averageFps: normalize(times.length / totalMs * 1000), frameMs: { mean: normalize(average(times)), p50: normalize(percentile(sorted, .5)), p95: normalize(percentile(sorted, .95)), p99: normalize(percentile(sorted, .99)), maximum: normalize(sorted.at(-1)) },
    hitches: Object.fromEntries([33.333, 50, 100, 250].map(threshold => [`over${threshold}ms`, times.filter(value => value > threshold).length])),
    renderer: Object.fromEntries(['calls', 'triangles', 'geometries', 'textures', 'programs'].map(key => [key, rendererRange(key)])),
    roundsCompleted: report.roundsCompleted ?? null, sessionWins: report.sessionWins ?? null, errors: report.errors || [],
    assessmentScope: 'Frame timing is browser-visible cadence, not isolated GPU timing. Resource increases are reported as observations and are not automatically classified as leaks. A short run is never labelled a long-duration pass.',
  };
}

export async function benchmarkWarlord({ root = PROJECT_ROOT, asset = 'assets/warlord/warlord.glb', browserReport = null, nativeProbe = 'engine/warlord/validation/offscreen-probe.json', actorCount = 4, minimumSeconds = 60 } = {}) {
  const assetMetrics = await assetBudget(path.resolve(root, asset), actorCount);
  const browser = browserReport ? summarizeBrowserMeasurement(JSON.parse(await fs.readFile(path.resolve(root, browserReport), 'utf8')), assetMetrics.sha256, minimumSeconds) : { status: 'not-run', reason: 'No actual browser telemetry JSON was supplied. Asset counts do not imply measured performance.' };
  let native;
  try { native = JSON.parse(await fs.readFile(path.resolve(root, nativeProbe), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; native = { status: 'not-run', nativeGpuFrameCaptured: false }; }
  return { status: 'reported', asset: assetMetrics, browser, nativeGpu: native };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), options = {}; let destination = null;
    const mapping = { '--asset': 'asset', '--browser-report': 'browserReport', '--native-probe': 'nativeProbe', '--actors': 'actorCount', '--minimum-seconds': 'minimumSeconds' };
    for (let i = 0; i < args.length; i += 2) {
      assert(args[i] === '--output' || mapping[args[i]], `Unknown argument ${args[i]}`); assert(args[i + 1], `Missing value for ${args[i]}`);
      if (args[i] === '--output') destination = args[i + 1];
      else options[mapping[args[i]]] = ['--actors', '--minimum-seconds'].includes(args[i]) ? Number(args[i + 1]) : args[i + 1];
    }
    const result = await benchmarkWarlord(options);
    if (destination) {
      const target = path.resolve(PROJECT_ROOT, destination), relative = path.relative(PROJECT_ROOT, target);
      assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Report destination stays in this project');
      assert(path.extname(target).toLowerCase() === '.json', 'Benchmark output is a JSON report');
      for (const input of [options.asset || 'assets/warlord/warlord.glb', options.browserReport, options.nativeProbe || 'engine/warlord/validation/offscreen-probe.json'].filter(Boolean)) assert.notEqual(target.toLowerCase(), path.resolve(PROJECT_ROOT, input).toLowerCase(), 'Output does not overwrite an input artifact');
      await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, JSON.stringify(result, null, 2));
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(JSON.stringify({ status: 'failed', error: error.message })); process.exitCode = 1; }
}
