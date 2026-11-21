import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';
import { Matrix4, Vector3, Quaternion } from '../vendor/three/three.module.js';

export const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const ARCHIVE_FOLDER = 'chixiao-warlord-kit';
export const GENERATED_ARTIFACTS = Object.freeze([
  { path: 'deliverables/chixiao-warlord-kit.zip', marker: 'SELF_ARCHIVE_NOT_NESTED', reason: 'Regenerate this archive with node scripts/package-warlord.mjs after extraction.' },
  { path: 'deliverables/emberfall-game-ready-kit.zip', marker: 'LEGACY_GENERATED_EXTERNAL_ARTIFACT', reason: 'The preserved Emberfall page links to its separate V2 distribution. Obtain that generated archive separately; the complete V2 source is included directly and archives are not nested in V3.' },
  { path: 'engine/Emberfall-Godot-project.zip', marker: 'LEGACY_GENERATED_EXTERNAL_ARTIFACT', reason: 'Legacy native download is a separately generated artifact. The editable engine/godot project is included directly.' },
]);
export const REQUIRED_FILES = Object.freeze([
  'index.html', 'play.html', 'warlord.html', 'emberfall.html', 'study.html', 'research.html', 'README.md', 'package.json', 'package-lock.json',
  'src/research.js', 'src/research-content.js', 'src/research.css', 'docs/character-prompts.json', 'docs/character-prompts.txt',
  'src/warlord-game.js', 'src/warlord-logic.js', 'src/warlord-fx.js', 'src/warlord.css',
  'src/warlord-secondary.js', 'src/warlord-lod.js', 'src/warlord-benchmark.js', 'src/warlord-demo.js', 'src/warlord-recorder.js',
  'src/game.js', 'src/game.css', 'src/game-logic.js', 'src/game-environment.js', 'src/main.js', 'src/styles.css',
  'vendor/three/three.module.js', 'vendor/three/three.core.js', 'vendor/three/LICENSE',
  'vendor/three/addons/loaders/GLTFLoader.js', 'vendor/three/addons/utils/SkeletonUtils.js',
  'assets/warlord/warlord.glb', 'assets/warlord/warlord.blend', 'assets/warlord/metadata.json',
  'assets/warlord/warlord-lod1.glb', 'assets/warlord/warlord-lod2.glb', 'assets/warlord/optimization.json', 'assets/warlord/collision.json',
  'assets/warlord/LICENSE-BASE.txt', 'assets/warlord/LICENSE-ANIMATIONS.txt',
  'assets/game/hero.glb', 'assets/game/hero.fbx', 'assets/game/hero.blend', 'assets/game/character.json', 'assets/game/LICENSE-KayKit.txt',
  'docs/warlord-art.md', 'docs/warlord-gameplay.md', 'docs/asset-provenance.md', 'docs/workflow.md',
  'scripts/serve.mjs', 'scripts/package-warlord.mjs', 'scripts/verify-warlord.mjs',
  'scripts/verify-research.mjs', 'scripts/export-research-prompts.mjs',
  'scripts/verify-warlord-lod.mjs', 'scripts/optimize-warlord.mjs', 'scripts/preview-warlord.ps1', 'play-web.cmd',
  'tests/warlord-logic.test.mjs', 'tests/warlord-integration.test.mjs', 'tests/warlord-secondary.test.mjs', 'tests/warlord-demo.test.mjs', 'tests/game-logic.test.mjs',
  'engine/warlord/project.godot', 'engine/warlord/main.tscn', 'engine/warlord/README.md', 'engine/warlord/play.cmd',
  'engine/warlord/scripts/arena.gd', 'engine/warlord/scripts/combatant.gd', 'engine/warlord/scripts/smoke_test.gd',
  'engine/warlord/assets/warlord.glb', 'engine/warlord/assets/metadata.json',
  'engine/godot/project.godot', 'engine/godot/main.tscn', 'engine/godot/scripts/hero_controller.gd', 'engine/godot/assets/hero.glb',
]);
export const ACTION_ALIASES = Object.freeze({
  Idle: ['Idle'], Walk: ['Walk'], Run: ['Run'], Attack1: ['Attack1'], Attack2: ['Attack2'], Attack3: ['Attack3'],
  Cleave: ['Cleave', 'Sweep'], GuardCast: ['GuardCast', 'Guard'], Leap: ['Leap', 'LeapSlam'],
  Dodge: ['Dodge'], Hit: ['Hit'], Death: ['Death'], Victory: ['Victory'],
});
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const componentCount = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const componentInfo = { 5120: [1, 'readInt8'], 5121: [1, 'readUInt8'], 5122: [2, 'readInt16LE'], 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE'] };
const canonical = (document, name) => ACTION_ALIASES[name].map(alias => document.animations.find(clip => clip.name === alias)).find(Boolean);
const read = (root, relative) => fs.readFile(path.join(root, relative));
const readJson = async (root, relative) => JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
const exists = async absolute => { try { await fs.access(absolute); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };

export function parseGlb(bytes) {
  assert(Buffer.isBuffer(bytes) && bytes.length >= 28, 'A complete GLB buffer is required');
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF', 'GLB magic'); assert.equal(bytes.readUInt32LE(4), 2, 'glTF 2.0');
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB declared byte length');
  let document, binary; const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    assert(offset + 8 <= bytes.length, 'GLB chunk header is bounded');
    const length = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4), start = offset + 8;
    assert(length % 4 === 0 && start + length <= bytes.length, 'GLB chunk is aligned and bounded');
    if (type === 0x4e4f534a) { assert(!document, 'Single GLB JSON chunk'); document = JSON.parse(bytes.toString('utf8', start, start + length).trim()); }
    if (type === 0x004e4942) { assert(!binary, 'Single GLB binary chunk'); binary = bytes.subarray(start, start + length); }
    chunks.push({ type, length }); offset = start + length;
  }
  assert(document && binary, 'GLB JSON and BIN chunks exist'); assert.equal(document.asset?.version, '2.0');
  assert(document.buffers?.length === 1 && !document.buffers[0].uri, 'All geometry and animations are embedded in one GLB buffer');
  assert(document.buffers[0].byteLength <= binary.length, 'Declared binary data fits the GLB');
  return { document, binary, bytes, chunks, accessorCache: new Map() };
}

export function accessorRows(glb, index) {
  if (glb.accessorCache.has(index)) return glb.accessorCache.get(index);
  const accessor = glb.document.accessors?.[index]; assert(accessor, `Accessor ${index} exists`);
  const view = glb.document.bufferViews?.[accessor.bufferView], count = componentCount[accessor.type], info = componentInfo[accessor.componentType];
  assert(view && count && info && !accessor.sparse, `Accessor ${index} has a supported dense representation`);
  assert.equal(view.buffer || 0, 0, 'Accessor uses embedded buffer');
  const [size, method] = info, stride = view.byteStride || count * size, offset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  assert(stride >= count * size && offset >= 0 && Number.isInteger(accessor.count) && accessor.count >= 0, 'Valid accessor layout');
  const end = accessor.count ? offset + (accessor.count - 1) * stride + count * size : offset;
  assert(end <= (view.byteOffset || 0) + view.byteLength && end <= glb.binary.length, `Accessor ${index} stays within its view`);
  const normalize = value => !accessor.normalized || accessor.componentType === 5126 ? value : accessor.componentType === 5120 ? Math.max(-1, value / 127) : accessor.componentType === 5122 ? Math.max(-1, value / 32767) : value / (2 ** (size * 8) - 1);
  const rows = Array.from({ length: accessor.count }, (_, row) => Array.from({ length: count }, (_, column) => normalize(glb.binary[method](offset + row * stride + column * size))));
  assert(rows.every(row => row.every(Number.isFinite)), `Accessor ${index} contains finite values`);
  glb.accessorCache.set(index, rows); return rows;
}

function bindTransforms(document) {
  const parents = new Map(), worlds = new Map();
  document.nodes.forEach((node, index) => node.children?.forEach(child => { assert(!parents.has(child), 'Nodes have one parent'); parents.set(child, index); }));
  function world(index, visiting = new Set()) {
    if (worlds.has(index)) return worlds.get(index); assert(!visiting.has(index), 'Node graph has no cycle'); visiting.add(index);
    const node = document.nodes[index]; assert(node, 'Child node exists');
    const local = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(new Vector3(...(node.translation || [0, 0, 0])), new Quaternion(...(node.rotation || [0, 0, 0, 1])), new Vector3(...(node.scale || [1, 1, 1])));
    const transform = parents.has(index) ? world(parents.get(index), visiting).clone().multiply(local) : local;
    worlds.set(index, transform); visiting.delete(index); return transform;
  }
  document.nodes.forEach((_, index) => world(index)); return { parents, worlds };
}

export function inspectWarlordGlb(input, metadata) {
  const glb = Buffer.isBuffer(input) ? parseGlb(input) : input, g = glb.document;
  assert(g.skins?.length > 0 && g.nodes?.length > 0 && g.meshes?.length > 0 && g.animations?.length > 0, 'A skinned animated character is required');
  if (metadata) { assert.equal(metadata.license, 'CC0-1.0'); assert.equal(metadata.sha256, sha256(glb.bytes), 'Metadata identifies this exact GLB'); }
  const { worlds, parents } = bindTransforms(g), names = new Map(g.nodes.map((node, index) => [node.name, index]));
  for (const mount of ['HalberdTip', 'HalberdGrip']) assert(names.has(mount), `Required weapon mount ${mount}`);
  const tip = new Vector3().setFromMatrixPosition(worlds.get(names.get('HalberdTip'))), grip = new Vector3().setFromMatrixPosition(worlds.get(names.get('HalberdGrip')));
  assert(tip.distanceTo(grip) > 1 && tip.distanceTo(grip) < 4, 'Weapon mounts span a usable adult halberd');
  const humanSkin = g.skins.find(skin => skin.joints.length >= 25); assert(humanSkin, 'A real articulated adult skeleton is present');
  const jointNames = humanSkin.joints.map(index => g.nodes[index]?.name);
  for (const bone of ['root', 'pelvis', 'Head', 'hand_l', 'hand_r', 'thigh_l', 'thigh_r', 'foot_l', 'foot_r']) assert(jointNames.includes(bone), `Humanoid joint ${bone}`);
  assert((g.images || []).every(image => image.bufferView !== undefined && !image.uri), 'Character textures are embedded');
  const skinMatrices = g.skins.map(skin => {
    const inverseBind = accessorRows(glb, skin.inverseBindMatrices); assert.equal(inverseBind.length, skin.joints.length, 'One inverse bind per joint');
    return skin.joints.map((joint, index) => worlds.get(joint).clone().multiply(new Matrix4().fromArray(inverseBind[index])));
  });
  const bodyNodes = g.nodes.filter(node => node.mesh !== undefined && node.skin !== undefined && /(?:superhero|body|base[_ -]?mesh)/i.test(node.name || '') && !node.extras?.partCategory);
  assert(bodyNodes.length > 0, 'An identifiable adult body mesh exists independently of armor and weapon');
  let triangles = 0, weightedVertices = 0; const bodyMin = new Vector3(Infinity, Infinity, Infinity), bodyMax = new Vector3(-Infinity, -Infinity, -Infinity);
  // Skin material also covers the neck. Measure the head by its dominant bone
  // influence so material reassignment cannot change the anatomical test.
  const headMin = new Vector3(Infinity, Infinity, Infinity), headMax = new Vector3(-Infinity, -Infinity, -Infinity);
  let headVertices = 0;
  const vertex = new Vector3(), weighted = new Vector3();
  for (const node of g.nodes.filter(node => node.mesh !== undefined)) for (const primitive of g.meshes[node.mesh].primitives) {
    const positions = accessorRows(glb, primitive.attributes.POSITION); const indexCount = primitive.indices === undefined ? positions.length : g.accessors[primitive.indices].count;
    if ((primitive.mode ?? 4) === 4) { assert(indexCount % 3 === 0, 'Triangle index count'); triangles += indexCount / 3; }
    if (node.skin === undefined) continue;
    assert(primitive.attributes.JOINTS_0 !== undefined && primitive.attributes.WEIGHTS_0 !== undefined, 'Every skinned primitive has skin weights');
    const joints = accessorRows(glb, primitive.attributes.JOINTS_0), weights = accessorRows(glb, primitive.attributes.WEIGHTS_0), matrices = skinMatrices[node.skin];
    assert.equal(positions.length, joints.length); assert.equal(positions.length, weights.length);
    const partMin = new Vector3(Infinity, Infinity, Infinity), partMax = new Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < positions.length; i++) {
      assert(weights[i].every(weight => weight >= 0 && weight <= 1), 'Skin influences are nonnegative and bounded');
      assert(Math.abs(weights[i].reduce((sum, value) => sum + value, 0) - 1) < .002, 'Skin weights are normalized');
      assert(joints[i].every(joint => Number.isInteger(joint) && joint >= 0 && joint < matrices.length), 'Skin indices address real joints'); weightedVertices++;
      if (!bodyNodes.includes(node)) continue;
      weighted.set(0, 0, 0);
      for (let j = 0; j < weights[i].length; j++) if (weights[i][j]) { vertex.fromArray(positions[i]).applyMatrix4(matrices[joints[i][j]]); weighted.addScaledVector(vertex, weights[i][j]); }
      bodyMin.min(weighted); bodyMax.max(weighted); partMin.min(weighted); partMax.max(weighted);
      const headWeight = weights[i].reduce((sum, weight, slot) => sum + (/^head$/i.test(g.nodes[g.skins[node.skin].joints[joints[i][slot]]].name || '') ? weight : 0), 0);
      if (headWeight > .5) { headMin.min(weighted); headMax.max(weighted); headVertices++; }
    }
  }
  const bodyHeight = bodyMax.y - bodyMin.y; assert(bodyHeight >= 1.9 && bodyHeight <= 2.2, `Adult body is approximately 2m high, measured ${bodyHeight.toFixed(4)}m`);
  if (metadata) assert(Math.abs(bodyHeight - (metadata.bodyHeight ?? metadata.height)) < .04, 'Measured body agrees with declared meter scale');
  assert(headVertices > 100, 'Adult head is independently measurable from real skin weights');
  const headToBodyRatio = bodyHeight / (headMax.y - headMin.y);
  assert(headToBodyRatio > 5.5 && headToBodyRatio < 10, `Adult head/body proportions, measured ${headToBodyRatio.toFixed(3)} heads`);
  const fixedDurations = { Attack1: .72, Attack2: .82, Attack3: 1, Cleave: 1.08, Leap: 1.28, Dodge: .4 };
  const rootNodes = new Set(g.nodes.map((node, index) => /^root$/i.test(node.name || '') || !parents.has(index) ? index : -1).filter(index => index >= 0));
  const motions = new Map(); let rootTranslationChannels = 0;
  for (const clip of g.animations) {
    assert(clip.name && !motions.has(clip.name), 'Animation names are unique'); let end = 0, varying = 0;
    for (const sampler of clip.samplers) {
      const times = accessorRows(glb, sampler.input).flat(), output = accessorRows(glb, sampler.output);
      assert(times.length >= 2 && times.every((value, index) => index === 0 || value > times[index - 1]), `${clip.name}: increasing animation time`);
      assert(times[0] >= 0 && output.length >= times.length, `${clip.name}: valid key sequence`); end = Math.max(end, times.at(-1));
      if (output.some(row => row.some((value, component) => Math.abs(value - output[0][component]) > .00001))) varying++;
    }
    for (const channel of clip.channels) if (channel.target.path === 'translation' && rootNodes.has(channel.target.node)) {
      const sampler = clip.samplers[channel.sampler], values = accessorRows(glb, sampler.output), cubic = sampler.interpolation === 'CUBICSPLINE';
      const positions = cubic ? values.filter((_, index) => index % 3 === 1) : values;
      assert(positions.every(row => row.every((value, component) => Math.abs(value - positions[0][component]) < .00001)), `${clip.name}: in-place root translation`); rootTranslationChannels++;
    }
    motions.set(clip.name, { name: clip.name, duration: end, varyingChannels: varying });
  }
  const actions = Object.entries(ACTION_ALIASES).map(([name]) => {
    const clip = canonical(g, name); assert(clip, `Required playable action ${name} (${ACTION_ALIASES[name].join('/')})`);
    const motion = motions.get(clip.name); assert(motion.duration > .1 && motion.duration < 8 && motion.varyingChannels > 1, `${name}: an actual moving clip of usable duration`);
    if (fixedDurations[name]) assert(Math.abs(motion.duration - fixedDurations[name]) < .041, `${name}: exported duration matches the combat window`);
    const declared = metadata?.animations?.find(animation => ACTION_ALIASES[name].includes(animation.name));
    if (metadata) { assert(declared, `Metadata declares ${name}`); assert(Math.abs(motion.duration - declared.duration) < .041, `${name}: metadata duration is current`); }
    return { canonical: name, ...motion };
  });
  assert(rootTranslationChannels > 0, 'In-place root translation tracks were actually checked');
  return { sha256: sha256(glb.bytes), bytes: glb.bytes.length, bones: humanSkin.joints.length, triangles, weightedVertices, embeddedImages: g.images?.length || 0, measuredBodyHeight: bodyHeight, headToBodyRatio, mounts: { tip: tip.toArray(), grip: grip.toArray(), span: tip.distanceTo(grip) }, actions, exportedActions: g.animations.length, rootTranslationChannels };
}

export async function validatePageLinks(root, packagedPaths = null) {
  const pages = ['index.html', 'play.html', 'warlord.html', 'emberfall.html', 'study.html', 'research.html'], idsByPage = new Map(), generated = new Set(GENERATED_ARTIFACTS.map(item => item.path));
  const texts = new Map(); let references = 0, anchors = 0; const generatedReferences = new Set();
  for (const page of pages) {
    const html = await fs.readFile(path.join(root, page), 'utf8'), ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${page}: unique element IDs`); idsByPage.set(page, new Set(ids)); texts.set(page, html);
    const application = (page === 'index.html' || page === 'research.html') ? 'research' : page === 'study.html' ? 'main' : page === 'emberfall.html' ? 'game' : 'warlord-game';
    assert(new RegExp(`<script\\b[^>]*src=["'](?:\\./)?src/${application}\\.js["']`).test(html), `${page}: intended local application ${application}`);
  }
  for (const [page, html] of texts) for (const [, reference] of html.matchAll(/(?:src|href)\s*=\s*["']([^"']*)["']/g)) {
    if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) continue;
    const [resource, fragment] = reference.split('#'), decoded = decodeURIComponent(resource.split('?')[0]);
    const relative = decoded ? path.posix.normalize(decoded.startsWith('/') ? decoded.slice(1) : path.posix.join(path.posix.dirname(page), decoded)) : page;
    assert(relative && !relative.includes('\\') && relative !== '..' && !relative.startsWith('../'), `${page}: safe local reference ${reference}`);
    if (generated.has(relative)) { generatedReferences.add(relative); continue; }
    const target = await fs.stat(path.join(root, relative)); assert(target.isFile() || relative.endsWith('/') && target.isDirectory(), `${page}: local resource ${reference}`);
    if (packagedPaths && target.isFile()) assert(packagedPaths.has(relative), `${page}: packaged resource ${reference}`); references++;
    if (fragment && relative.endsWith('.html')) {
      const ids = idsByPage.get(relative) || new Set([...String(await fs.readFile(path.join(root, relative), 'utf8')).matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]));
      assert(ids.has(decodeURIComponent(fragment)), `${page}: section anchor ${reference}`); anchors++;
    }
  }
  return { pages, references, anchors, generatedExternalArtifacts: GENERATED_ARTIFACTS.filter(item => generatedReferences.has(item.path)) };
}

/** Read an ordinary single-disk ZIP without extracting it onto the user's disk. */
export function zipEntries(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { end = i; break; }
  assert(end >= 0, 'ZIP central directory exists'); assert.equal(bytes.readUInt16LE(end + 4), 0, 'Single-disk ZIP'); assert.equal(bytes.readUInt16LE(end + 6), 0, 'Central directory is on disk zero');
  const count = bytes.readUInt16LE(end + 10), length = bytes.readUInt32LE(end + 12); let offset = bytes.readUInt32LE(end + 16);
  assert.equal(bytes.readUInt16LE(end + 8), count, 'All ZIP entries are on this disk');
  assert(count < 0xffff && length < 0xffffffff && offset + length <= end, 'Ordinary bounded ZIP central directory');
  const entries = new Map();
  for (let index = 0; index < count; index++) {
    assert(offset + 46 <= end && bytes.readUInt32LE(offset) === 0x02014b50, 'ZIP central record');
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10), packedSize = bytes.readUInt32LE(offset + 20), size = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28), extraLength = bytes.readUInt16LE(offset + 30), commentLength = bytes.readUInt16LE(offset + 32), local = bytes.readUInt32LE(offset + 42);
    assert(offset + 46 + nameLength + extraLength + commentLength <= end, 'ZIP entry fields are bounded');
    const name = bytes.toString('utf8', offset + 46, offset + 46 + nameLength);
    assert(!(flags & 1) && [0, 8].includes(method), 'Unencrypted stored/deflated ZIP');
    assert(name.startsWith(`${ARCHIVE_FOLDER}/`) && !name.includes('\\') && !name.split('/').some(part => part === '..' || part.startsWith('.')), `Safe ZIP path ${name}`);
    assert(!entries.has(name) && size <= 512 * 1024 * 1024, `Unique bounded ZIP entry ${name}`);
    assert(local + 30 <= bytes.length && bytes.readUInt32LE(local) === 0x04034b50, 'ZIP local header');
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28); assert(start + packedSize <= bytes.length, 'ZIP compressed data stays bounded');
    const packed = bytes.subarray(start, start + packedSize), content = method === 8 ? inflateRawSync(packed, { maxOutputLength: size + 1 }) : packed;
    assert.equal(content.length, size, `ZIP byte size ${name}`); entries.set(name, content); offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

export async function verifyWarlord({ root = PROJECT_ROOT, skipPackage = false, requirePackage = false, runLogic = true } = {}) {
  assert(!skipPackage || !requirePackage, 'Choose skipPackage or requirePackage');
  const report = { status: 'checking', scope: 'Read-only real-file, GLB skin/animation/mount, shared native asset, page-link, pure-rule and ZIP verification. No browser, GPU or manual-input result is implied.', checks: [] };
  async function check(name, work) { const detail = await work(); report.checks.push({ check: name, status: 'passed', detail }); return detail; }
  await check('Required web, archive-source, license and both native project files', async () => { for (const relative of REQUIRED_FILES) { const info = await fs.stat(path.join(root, relative)); assert(info.isFile() && info.size > 0, `Required nonempty file ${relative}`); } return { files: REQUIRED_FILES.length }; });
  report.character = await check('Meter-scale adult skin, weapon mounts, actions and no exported root translation', async () => inspectWarlordGlb(await read(root, 'assets/warlord/warlord.glb'), await readJson(root, 'assets/warlord/metadata.json')));
  report.sharedAsset = await check('Browser and native engine share byte-identical V3 assets', async () => {
    assert.equal(sha256(await read(root, 'engine/warlord/assets/warlord.glb')), report.character.sha256);
    assert.equal(sha256(await read(root, 'engine/warlord/assets/metadata.json')), sha256(await read(root, 'assets/warlord/metadata.json')), 'Native metadata is current');
    assert.equal(sha256(await read(root, 'engine/godot/assets/hero.glb')), sha256(await read(root, 'assets/game/hero.glb')), 'Legacy native/browser identity is preserved'); return { identical: true, sha256: report.character.sha256 };
  });
  report.webLinks = await check('V3, preserved V2 and study pages resolve resources and anchors', () => validatePageLinks(root));
  if (runLogic) report.logic = await check('Actual heavy-warrior timing, enemy AI and integration tests', async () => {
    const result = spawnSync(process.execPath, ['--test', 'tests/warlord-logic.test.mjs', 'tests/warlord-integration.test.mjs', 'tests/warlord-secondary.test.mjs', 'tests/warlord-demo.test.mjs'], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
    if (result.error) throw result.error; assert.equal(result.status, 0, result.stderr || result.stdout || 'Logic/integration test failure');
    return { command: 'node --test tests/warlord-logic.test.mjs tests/warlord-integration.test.mjs tests/warlord-secondary.test.mjs tests/warlord-demo.test.mjs', tests: Number(result.stdout.match(/# tests (\d+)/)?.[1] || 0), failed: 0 };
  });
  const archiveRelative = `deliverables/${ARCHIVE_FOLDER}.zip`;
  if (skipPackage || !await exists(path.join(root, archiveRelative))) {
    assert(!requirePackage, 'Generate the V3 ZIP with node scripts/package-warlord.mjs'); report.archive = { status: 'not-checked', expectedPath: archiveRelative };
  } else report.archive = await check('V3 ZIP manifest hashes and current source identity', async () => {
    const bytes = await read(root, archiveRelative), entries = zipEntries(bytes), prefix = `${ARCHIVE_FOLDER}/`, manifestEntry = entries.get(`${prefix}PACKAGE-CONTENTS.json`); assert(manifestEntry, 'Archive has a manifest');
    const manifest = JSON.parse(manifestEntry.toString('utf8')), paths = new Set(manifest.files.map(item => item.path));
    assert.equal(paths.size, manifest.files.length); assert.equal(entries.size, manifest.files.length + 1); assert.equal(manifest.rootFolder, ARCHIVE_FOLDER);
    for (const relative of REQUIRED_FILES) assert(paths.has(relative), `ZIP required file ${relative}`);
    assert.deepEqual(manifest.generatedLinks, GENERATED_ARTIFACTS, 'Generated external downloads are explicitly documented');
    for (const item of manifest.files) {
      assert(typeof item.path === 'string' && !item.path.includes('\\') && !path.win32.isAbsolute(item.path) && !path.posix.isAbsolute(item.path) && !item.path.split('/').some(part => !part || part === '..' || part.startsWith('.')), `Safe manifest path ${item.path}`);
      const content = entries.get(prefix + item.path); assert(content, `Manifest item ${item.path}`); assert.equal(content.length, item.bytes); assert.equal(sha256(content), item.sha256, `Archive item hash ${item.path}`);
      assert.equal(sha256(await read(root, item.path)), item.sha256, `Rebuild V3 ZIP after source changes: ${item.path}`);
      assert(!/(?:^|\/)(?:source|sources|tools|node_modules|deliverables|userdata|editor_data|__pycache__)(?:\/|$)/i.test(item.path) && !/\.(?:zip|7z|rar|exe|dll|pck|log|pyc|tmp)$/i.test(item.path), `No tools, caches or nested artifacts: ${item.path}`);
    }
    await validatePageLinks(root, paths);
    const external = await readJson(root, `deliverables/${ARCHIVE_FOLDER}.manifest.json`); assert.equal(external.archive.sha256, sha256(bytes));
    return { status: 'passed', path: archiveRelative, bytes: bytes.length, entries: entries.size, comparedCurrentFiles: manifest.files.length, sha256: sha256(bytes) };
  });
  report.status = report.archive.status === 'passed' ? 'passed' : 'ready-to-package'; return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2); assert(args.every(arg => ['--skip-package', '--require-package'].includes(arg)), 'Unknown verification argument');
  try { console.log(JSON.stringify(await verifyWarlord({ skipPackage: args.includes('--skip-package'), requirePackage: args.includes('--require-package') }), null, 2)); }
  catch (error) { console.error(JSON.stringify({ status: 'failed', error: error.message }, null, 2)); process.exitCode = 1; }
}
