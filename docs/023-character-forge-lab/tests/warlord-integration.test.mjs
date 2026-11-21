import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from '../vendor/three/three.module.js';
import { PROJECT_ROOT, ARCHIVE_FOLDER, GENERATED_ARTIFACTS, REQUIRED_FILES, parseGlb, accessorRows, inspectWarlordGlb, validatePageLinks, sha256, zipEntries } from '../scripts/verify-warlord.mjs';
import { collectWarlordFiles, excludedName } from '../scripts/package-warlord.mjs';
import { WarlordSession, autopilot } from '../src/warlord-logic.js';
import { createWarlordFX } from '../src/warlord-fx.js';

const root = PROJECT_ROOT;
const heroBytes = await fs.readFile(path.join(root, 'assets/warlord/warlord.glb'));
const metadata = JSON.parse(await fs.readFile(path.join(root, 'assets/warlord/metadata.json'), 'utf8'));
const asset = parseGlb(heroBytes);
const copyAsset = () => ({ ...asset, document: structuredClone(asset.document), binary: Buffer.from(asset.binary), accessorCache: new Map() });
function componentOffset(glb, accessorIndex, row, column = 0) {
  const accessor = glb.document.accessors[accessorIndex], view = glb.document.bufferViews[accessor.bufferView], counts = { SCALAR: 1, VEC3: 3, VEC4: 4, MAT4: 16 }, sizes = { 5121: 1, 5123: 2, 5126: 4 };
  return (view.byteOffset || 0) + (accessor.byteOffset || 0) + row * (view.byteStride || counts[accessor.type] * sizes[accessor.componentType]) + column * sizes[accessor.componentType];
}

test('V3 binary contains an actual 2m adult skin, 13 canonical actions and two weapon mounts', () => {
  const report = inspectWarlordGlb(asset, metadata);
  assert(report.bones >= 25); assert(report.weightedVertices > 1000); assert(report.triangles > 1000);
  assert(Math.abs(report.measuredBodyHeight - 2.05) < .04); assert(report.headToBodyRatio === null || report.headToBodyRatio > 5.5);
  assert.equal(report.actions.length, 13); assert(report.actions.some(action => action.canonical === 'Cleave')); assert(report.mounts.span > 1);
  assert.equal(report.sha256, metadata.sha256);
});

test('GLB parser rejects truncated containers and accessor bounds rather than reading outside the asset', () => {
  assert.throws(() => parseGlb(heroBytes.subarray(0, heroBytes.length - 4)), /byte length/);
  const invalid = copyAsset(); invalid.document.accessors[0].count = 1e9;
  assert.throws(() => accessorRows(invalid, 0), /within its view/);
});

test('Sweep, Guard and LeapSlam asset names are interchangeable with the canonical gameplay names', () => {
  const renamed = copyAsset();
  for (const clip of renamed.document.animations) clip.name = ({ Sweep: 'Cleave', Guard: 'GuardCast', LeapSlam: 'Leap' })[clip.name] || clip.name;
  const report = inspectWarlordGlb(renamed); assert.equal(report.actions.find(action => action.canonical === 'Leap').name, 'Leap');
});

test('a missing actual HalberdTip fails the shipped-asset contract', () => {
  const invalid = copyAsset(); invalid.document.nodes.find(node => node.name === 'HalberdTip').name = 'MissingTip';
  assert.throws(() => inspectWarlordGlb(invalid), /Required weapon mount HalberdTip/);
});

test('the verifier detects actual root translation, rather than trusting metadata', () => {
  const invalid = copyAsset(), clip = invalid.document.animations.find(animation => animation.name === 'Attack1');
  const channel = clip.channels.find(candidate => candidate.target.path === 'translation' && invalid.document.nodes[candidate.target.node].name === 'root');
  const index = clip.samplers[channel.sampler].output, accessor = invalid.document.accessors[index];
  assert.equal(accessor.componentType, 5126); const offset = componentOffset(invalid, index, accessor.count - 1);
  invalid.binary.writeFloatLE(invalid.binary.readFloatLE(offset) + .2, offset);
  assert.throws(() => inspectWarlordGlb(invalid), /in-place root translation/);
});

test('an incorrectly timed Attack1 export fails even when an animation of that name exists', () => {
  const invalid = copyAsset(), clip = invalid.document.animations.find(animation => animation.name === 'Attack1'), index = clip.samplers[0].input;
  const accessor = invalid.document.accessors[index], offset = componentOffset(invalid, index, accessor.count - 1);
  assert.equal(accessor.componentType, 5126); invalid.binary.writeFloatLE(invalid.binary.readFloatLE(offset) + .15, offset);
  assert.throws(() => inspectWarlordGlb(invalid), /exported duration matches the combat window/);
});

test('browser and native V3 characters and metadata are byte-identical', async () => {
  assert.equal(sha256(await fs.readFile(path.join(root, 'engine/warlord/assets/warlord.glb'))), sha256(heroBytes));
  assert.equal(sha256(await fs.readFile(path.join(root, 'engine/warlord/assets/metadata.json'))), sha256(await fs.readFile(path.join(root, 'assets/warlord/metadata.json'))));
});

test('entry pages preserve the game, legacy studies and full research with valid links and anchors', async () => {
  const report = await validatePageLinks(root);
  assert.deepEqual([...report.pages].sort(), ['index.html', 'play.html', 'warlord.html', 'emberfall.html', 'study.html', 'research.html'].sort());
  assert(report.references > 15); assert(report.anchors > 5);
  assert(report.generatedExternalArtifacts.some(item => item.path === `deliverables/${ARCHIVE_FOLDER}.zip`));
  assert(GENERATED_ARTIFACTS.some(item => item.path === 'deliverables/emberfall-game-ready-kit.zip'));
});

test('the allowlisted package includes both engines and editable sources without nested downloads or caches', async () => {
  const { files, paths, excluded } = await collectWarlordFiles(root);
  for (const relative of REQUIRED_FILES) assert(paths.has(relative), relative);
  assert(files.some(item => item.path.startsWith('engine/warlord/')) && files.some(item => item.path.startsWith('engine/godot/')));
  assert(!files.some(item => item.path.includes('/source/') || /\.(?:zip|exe|pck|log|cache)$/.test(item.path)));
  assert(excluded.some(relative => relative.startsWith('assets/warlord/source')));
  assert(excludedName('source', true) && excludedName('.godot', true) && excludedName('old.blend1', false));
  assert(!excludedName('warlord.blend', false) && !excludedName('combatant.gd.uid', false));
});

test('invalid ZIP bytes are rejected before any extraction or manifest trust', () => {
  assert.throws(() => zipEntries(Buffer.alloc(32)), /central directory/);
});

test('real combat events drive the FX module with vendored Three, exact damage floaters and cleanup', () => {
  assert.equal(THREE.REVISION, '187'); const scene = new THREE.Scene(), elements = [];
  const floatLayer = { ownerDocument: { createElement() { const element = { style: {}, remove() { const index = elements.indexOf(element); if (index >= 0) elements.splice(index, 1); } }; return element; } }, appendChild(element) { elements.push(element); } };
  const fx = createWarlordFX(THREE, scene, { floatLayer }), actor = new THREE.Group(); scene.add(actor);
  const grip = new THREE.Object3D(), tip = new THREE.Object3D(); grip.name = 'HalberdGrip'; tip.name = 'HalberdTip'; grip.position.set(0, 1.3, 0); tip.position.set(0, 1.8, -2); actor.add(grip, tip); assert(fx.attachHero(actor));
  const s = new WarlordSession([{ id: 'guard', x: 0, z: .5, maxHealth: 500, speed: 1e-8, attackRange: .01 }]); s.start(); s.position.z = 2.5; actor.position.copy(new THREE.Vector3(s.position.x, 0, s.position.z));
  const camera = new THREE.PerspectiveCamera(45, 1.6, .1, 100); camera.position.set(7, 12, 12); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  s.skill('Q', { x: 0, z: 0 });
  for (let frame = 0; frame < 50; frame++) { s.tick(.01); tip.position.x += .02; for (const event of s.drainEvents()) fx.event(event, s); fx.update(.01, s, { camera, width: 1280, height: 800 }); }
  assert(elements.some(element => element.textContent === '58')); assert(scene.getObjectByName('EmpoweredHalberdEdge').visible);
  assert(scene.getObjectByName('SampledHalberdTrail').geometry.drawRange.count > 0);
  const count = scene.getObjectByName('WarlordFX').children.length;
  for (let cycle = 0; cycle < 12; cycle++) { fx.event({ type: 'slam', x: 0, z: 0, radius: 3.2 }, s); fx.update(.016, s); fx.reset(); assert.equal(scene.getObjectByName('WarlordFX').children.length, count); }
  assert.equal(elements.length, 0); assert.equal(fx.attachHero(new THREE.Group()), false); fx.update(.016, s);
  fx.dispose(); fx.dispose(); assert(!scene.getObjectByName('WarlordFX')); assert(scene.children.includes(actor));
});

test('the shipped renderer wiring and real-rule session support the complete heavy-warrior battle', async () => {
  const source = await fs.readFile(path.join(root, 'src/warlord-game.js'), 'utf8');
  assert(source.includes('WarlordSession') && source.includes('createWarlordFX') && source.includes('assets/warlord/warlord.glb'));
  const s = new WarlordSession(); s.start(); const memory = {}, seen = new Set();
  for (let frame = 0; frame < 60 * 45 && s.status === 'playing'; frame++) { s.tick(1 / 60, autopilot(s, 1 / 60, memory)); for (const event of s.drainEvents()) seen.add(event.type); }
  assert.equal(s.status, 'won'); assert.equal(s.kills, 3); assert(s.health > 0);
  for (const type of ['hit', 'skillStart', 'slam', 'knockback', 'destroyed', 'won']) assert(seen.has(type), type);
});
