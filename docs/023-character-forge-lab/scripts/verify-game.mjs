import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputRelative = 'assets/game/game-delivery-validation.json';
const archiveRelative = 'deliverables/emberfall-game-ready-kit.zip';
const argumentsGiven = process.argv.slice(2);
const skipPackage = argumentsGiven.includes('--skip-package');
const requirePackage = argumentsGiven.includes('--require-package');
assert(!skipPackage || !requirePackage, 'Choose --skip-package or --require-package, not both.');
assert(argumentsGiven.every(arg => ['--skip-package', '--require-package'].includes(arg)), 'Unknown verification argument.');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = relative => fs.readFile(path.join(root, relative));
const json = async relative => JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
const exists = async relative => { try { await fs.access(path.join(root, relative)); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
const checks = [];
const report = {
  status: 'checking',
  scope: 'Current professional GLB validation, native Godot test report, shared asset identity, local web entry points, and distribution ZIP integrity. This script does not claim native GPU or manual-input validation.',
  logicTests: { command: 'node --test tests/game-logic.test.mjs', execution: 'npm run verify runs these tests before this aggregation script.' },
  checks,
};

async function check(name, work) {
  try { const detail = await work(); checks.push({ check: name, status: 'passed', detail }); console.log(`[PASS] ${name}`); return detail; }
  catch (error) { checks.push({ check: name, status: 'failed', error: error.message }); throw error; }
}

const requiredFiles = [
  'index.html', 'play.html', 'study.html', 'README.md', 'package.json',
  'src/game.js', 'src/game.css', 'src/game-logic.js', 'src/game-environment.js', 'src/main.js', 'src/styles.css',
  'vendor/three/three.module.js', 'vendor/three/three.core.js', 'vendor/three/LICENSE',
  'vendor/three/addons/loaders/GLTFLoader.js', 'vendor/three/addons/utils/BufferGeometryUtils.js', 'vendor/three/addons/utils/SkeletonUtils.js', 'vendor/three/addons/controls/OrbitControls.js',
  'assets/game/hero.glb', 'assets/game/hero.fbx', 'assets/game/hero.blend', 'assets/game/original.glb', 'assets/game/character.json', 'assets/game/LICENSE-KayKit.txt',
  'docs/asset-provenance.md', 'docs/gameplay.md', 'docs/game-asset-handoff.md', 'docs/engine-handoff.md',
  'scripts/serve.mjs', 'scripts/build.mjs', 'scripts/package-game.mjs', 'scripts/verify-production-hero.mjs', 'scripts/verify-game.mjs', 'tests/game-logic.test.mjs',
  'engine/godot/project.godot', 'engine/godot/main.tscn', 'engine/godot/README.md', 'engine/godot/play.cmd', 'engine/godot/open-editor.cmd',
  'engine/godot/scripts/hero_controller.gd', 'engine/godot/scripts/arena.gd', 'engine/godot/scripts/smoke_test.gd',
  'engine/godot/assets/hero.glb', 'engine/godot/assets/character.json', 'engine/godot/assets/LICENSE-KayKit.txt', 'engine/godot/validation/gameplay-report.json',
];

// Read the ordinary ZIP central directory and validate each entry against the
// archive's own SHA-256 manifest. No extraction or downloaded archive utility.
function zipEntries(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { end = i; break; }
  }
  assert(end >= 0, 'ZIP end-of-central-directory record exists');
  const count = bytes.readUInt16LE(end + 10), directoryLength = bytes.readUInt32LE(end + 12);
  let offset = bytes.readUInt32LE(end + 16);
  assert.equal(bytes.readUInt16LE(end + 4), 0, 'Single-disk ZIP');
  assert(count < 0xffff && directoryLength < 0xffffffff, 'Delivery ZIP must use ordinary central-directory sizes');
  assert(offset + directoryLength <= end, 'Central directory stays in ZIP bounds');
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(bytes.readUInt32LE(offset), 0x02014b50, 'ZIP central entry signature');
    const flags = bytes.readUInt16LE(offset + 8), method = bytes.readUInt16LE(offset + 10);
    const compressedSize = bytes.readUInt32LE(offset + 20), size = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28), extraLength = bytes.readUInt16LE(offset + 30), commentLength = bytes.readUInt16LE(offset + 32);
    const local = bytes.readUInt32LE(offset + 42), name = bytes.toString('utf8', offset + 46, offset + 46 + nameLength);
    assert(!(flags & 1), 'Package entries are not encrypted');
    assert([0, 8].includes(method), 'Stored or deflated ZIP entries');
    assert(!entries.has(name), `No duplicate ZIP entry: ${name}`);
    assert(name.startsWith('emberfall-game-ready-kit/') && !name.includes('\\') && !name.split('/').includes('..'), `Safe ZIP path: ${name}`);
    assert(size <= 64 * 1024 * 1024, `Expected asset-sized ZIP entry: ${name}`);
    assert.equal(bytes.readUInt32LE(local), 0x04034b50, 'ZIP local entry signature');
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    assert(start + compressedSize <= bytes.length, 'Compressed entry stays in ZIP bounds');
    const packed = bytes.subarray(start, start + compressedSize);
    const content = method === 8 ? inflateRawSync(packed, { maxOutputLength: size + 1 }) : packed;
    assert.equal(content.length, size, `Uncompressed size: ${name}`);
    entries.set(name, content);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

try {
  report.hero = await check('Professional character: current skeleton, weights, textures and 16 actions', async () => {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/verify-production-hero.mjs')], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000, maxBuffer: 1024 * 1024 });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr || result.stdout || 'Professional asset verifier failed');
    const validated = await json('assets/game/asset-validation.json');
    assert.equal(validated.status, 'passed'); assert.equal(validated.animations.length, 16); assert.equal(validated.bones, 41);
    const metadata = await json('assets/game/character.json');
    const digest = hash(await read('assets/game/hero.glb'));
    assert.equal(metadata.heroSha256, digest, 'Metadata points at current hero');
    assert.equal(metadata.license, 'CC0-1.0');
    assert.equal(metadata.animations.length, validated.animations.length);
    assert(metadata.animations.every(animation => validated.animations.some(clip => clip.name === animation.name)));
    return { bones: validated.bones, triangles: validated.triangles, actions: validated.animations.length, embeddedImages: validated.embeddedImages, license: metadata.license, sha256: digest };
  });

  report.engine = await check('Godot native report: all 19 gameplay checks passed', async () => {
    const native = await json('engine/godot/validation/gameplay-report.json');
    assert.equal(native.status, 'passed'); assert.equal(native.failed, 0);
    assert(Array.isArray(native.checks) && native.checks.length >= 19);
    assert(native.checks.every(item => item.passed === true), 'Every native test must pass');
    assert.equal(native.passed, native.checks.length);
    assert.equal(new Set(native.checks.map(item => item.check)).size, native.checks.length, 'Native checks have distinct names');
    assert.equal(native.engine.major, 4);
    return { engine: native.engine.string, passed: native.passed, failed: native.failed, scope: native.scope };
  });

  report.files = await check('Required gameplay, source, license, test and engine files exist', async () => {
    for (const relative of requiredFiles) {
      const info = await fs.stat(path.join(root, relative));
      assert(info.isFile() && info.size > 0, `Required nonempty file: ${relative}`);
    }
    return { required: requiredFiles.length };
  });

  report.sharedAsset = await check('Web and Godot use the identical professional character', async () => {
    const engineHash = hash(await read('engine/godot/assets/hero.glb'));
    assert.equal(engineHash, report.hero.sha256, 'Identical GLB in browser and native engine');
    const nativeMetadata = await json('engine/godot/assets/character.json');
    assert.equal(nativeMetadata.heroSha256, engineHash);
    assert.equal(hash(await read('engine/godot/assets/LICENSE-KayKit.txt')), hash(await read('assets/game/LICENSE-KayKit.txt')));
    return { sha256: engineHash, identical: true };
  });

  report.webLinks = await check('Index, play and study resolve local resources and section anchors', async () => {
    const pages = ['index.html', 'play.html', 'study.html'];
    let references = 0, sectionAnchors = 0;
    const idsByPage = new Map();
    for (const page of pages) {
      const html = await fs.readFile(path.join(root, page), 'utf8');
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length, `Unique element IDs in ${page}`);
      idsByPage.set(page, new Set(ids));
    }
    for (const page of pages) {
      const html = await fs.readFile(path.join(root, page), 'utf8');
      for (const [, reference] of html.matchAll(/(?:src|href)="([^"]*)"/g)) {
        if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) continue;
        const [resource, fragment] = reference.split('#');
        const relative = path.posix.normalize(decodeURIComponent(resource.split('?')[0] || page).replace(/^\//, ''));
        assert(relative !== '..' && !relative.startsWith('../'), `Local reference stays in project: ${reference}`);
        if (relative !== archiveRelative) {
          assert((await fs.stat(path.join(root, relative))).isFile(), `${page}: resource exists ${reference}`);
          references++;
        }
        if (fragment && relative.endsWith('.html')) {
          const ids = idsByPage.get(relative);
          assert(ids && ids.has(decodeURIComponent(fragment)), `${page}: section exists ${reference}`);
          sectionAnchors++;
        }
      }
      assert(/<script\b[^>]*src="src\/(?:game|main)\.js"/.test(html), `${page} loads the intended local application`);
    }
    return { pages, references, sectionAnchors, selfArchive: 'Checked separately after packaging' };
  });

  if (skipPackage || !(await exists(archiveRelative))) {
    assert(!requirePackage, 'The complete ZIP must be generated with npm run package before final verification');
    report.archive = { status: 'not-checked', reason: skipPackage ? 'Explicit pre-package check' : 'Run npm run package, then npm run verify', expectedPath: archiveRelative };
    console.log('[PENDING] Distribution ZIP: run npm run package, then npm run verify');
  } else {
    report.archive = await check('Distribution ZIP: manifest hashes, required files and current sources', async () => {
      const bytes = await read(archiveRelative), entries = zipEntries(bytes), prefix = 'emberfall-game-ready-kit/';
      const manifestEntry = entries.get(prefix + 'PACKAGE-CONTENTS.json');
      assert(manifestEntry, 'ZIP contains its file manifest');
      const manifest = JSON.parse(manifestEntry.toString('utf8'));
      assert(Array.isArray(manifest.files));
      const manifestPaths = new Set(manifest.files.map(file => file.path));
      assert.equal(manifestPaths.size, manifest.files.length, 'Manifest paths are unique');
      assert.equal(entries.size, manifest.files.length + 1, 'ZIP matches manifest entry count');
      for (const relative of requiredFiles) assert(manifestPaths.has(relative), `ZIP contains required file ${relative}`);
      let comparedCurrentFiles = 0;
      for (const item of manifest.files) {
        const content = entries.get(prefix + item.path);
        assert(content, `Manifest entry exists: ${item.path}`);
        assert.equal(content.length, item.bytes, `ZIP asset byte size: ${item.path}`);
        assert.equal(hash(content), item.sha256, `ZIP asset hash: ${item.path}`);
        // This report records the archive hash and must not recursively become
        // part of its own source-identity condition. All other sources match.
        if (item.path !== outputRelative) {
          assert.equal(hash(await read(item.path)), item.sha256, `ZIP is current: ${item.path}; rebuild with npm run package`);
          comparedCurrentFiles++;
        }
      }
      const external = await json('deliverables/emberfall-game-ready-kit.manifest.json');
      assert.equal(external.archive.sha256, hash(bytes), 'External manifest points at current ZIP');
      return { status: 'passed', path: archiveRelative, bytes: bytes.length, entries: entries.size, comparedCurrentFiles, sha256: hash(bytes) };
    });
  }

  report.status = report.archive.status === 'passed' ? 'passed' : 'ready-to-package';
} catch (error) {
  report.status = 'failed'; report.error = error.message; process.exitCode = 1;
  console.error(`[FAIL] ${error.message}`);
}
await fs.mkdir(path.join(root, 'assets/game'), { recursive: true });
await fs.writeFile(path.join(root, outputRelative), JSON.stringify(report, null, 2));
console.log(`Delivery ${report.status}: ${checks.filter(check => check.status === 'passed').length} checks; ${outputRelative}`);
