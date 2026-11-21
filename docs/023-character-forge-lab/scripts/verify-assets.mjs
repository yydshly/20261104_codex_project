import { readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const file = path.join(root, 'assets/forge-knight.glb');
const b = await readFile(file);
assert.equal(b.toString('utf8', 0, 4), 'glTF');
assert.equal(b.readUInt32LE(4), 2);
assert.equal(b.readUInt32LE(8), b.length);
const jsonLength = b.readUInt32LE(12);
const gltf = JSON.parse(b.toString('utf8', 20, 20 + jsonLength));
const binStart = 20 + jsonLength + 8;
const sizes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const read = { 5120: 'readInt8', 5121: 'readUInt8', 5122: 'readInt16LE', 5123: 'readUInt16LE', 5125: 'readUInt32LE', 5126: 'readFloatLE' };
function accessor(index) {
  const a = gltf.accessors[index], view = gltf.bufferViews[a.bufferView];
  const count = widths[a.type], size = sizes[a.componentType], stride = view.byteStride || count * size;
  const start = binStart + (view.byteOffset || 0) + (a.byteOffset || 0);
  return Array.from({ length: a.count }, (_, i) => Array.from({ length: count }, (_, c) => b[read[a.componentType]](start + i * stride + c * size)));
}
assert.equal(gltf.skins.length, 1, 'Exactly one shared skeleton');
assert.equal(gltf.skins[0].joints.length, 20, '20 expected bones');
assert.deepEqual(gltf.animations.map(a => a.name).sort(), ['Idle', 'Slash', 'Walk']);
const expected = { Idle: 3, Walk: 1.2, Slash: 2.4 };
const animationReport = [];
for (const animation of gltf.animations) {
  let changed = 0, duration = 0;
  for (const sampler of animation.samplers) {
    const time = accessor(sampler.input).flat(), values = accessor(sampler.output);
    assert(time.every((v, i) => Number.isFinite(v) && (i === 0 || v > time[i - 1])), 'Monotonic keyframe time');
    duration = Math.max(duration, ...time);
    if (values.some(v => v.some((c, i) => Math.abs(c - values[0][i]) > .00001))) changed++;
    assert(values.flat().every(Number.isFinite), 'Finite animation values');
  }
  assert(changed > 1, `${animation.name} must move more than one channel`);
  assert(Math.abs(duration - expected[animation.name]) < .001, 'Expected animation duration');
  animationReport.push({ name: animation.name, duration, changingChannels: changed });
}
let skinnedMeshes = 0, weightVertices = 0, triangles = 0;
for (const n of gltf.nodes.filter(n => n.skin !== undefined)) {
  skinnedMeshes++;
  assert(['body', 'armor', 'weapon'].includes(n.extras?.partCategory), 'Exploded-view category survives export');
  for (const p of gltf.meshes[n.mesh].primitives) {
    triangles += (p.indices !== undefined ? gltf.accessors[p.indices].count : gltf.accessors[p.attributes.POSITION].count) / 3;
    const joints = accessor(p.attributes.JOINTS_0), weights = accessor(p.attributes.WEIGHTS_0);
    assert.equal(joints.length, weights.length);
    for (let i = 0; i < weights.length; i++) {
      assert(Math.abs(weights[i].reduce((a, x) => a + x, 0) - 1) < .0001, 'Normalized bone weights');
      assert(joints[i].every(j => Number.isInteger(j) && j >= 0 && j < 20), 'Valid joint index');
      weightVertices++;
    }
  }
}
assert.equal(skinnedMeshes, 51);
assert.equal(triangles, 3194);
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const localLinks = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(m => m[1]).filter(s => !/^(https?:|data:)/.test(s));
for (const link of new Set(localLinks)) assert((await stat(path.join(root, link))).isFile(), `Local asset exists: ${link}`);
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.has(id), `Section anchor exists: ${id}`);
const files = [];
for (const name of ['forge-knight.glb', 'forge-knight.blend', 'forge-knight.fbx', 'knight-preview.png', 'character-report.json']) {
  const bytes = await readFile(path.join(root, 'assets', name));
  assert(bytes.length > 100, `${name} is not empty`);
  files.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const report = { assetValidation: 'passed', skinnedMeshes, triangles, weightVertices, bones: 20, animations: animationReport, files };
await writeFile(path.join(root, 'assets/validation-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
