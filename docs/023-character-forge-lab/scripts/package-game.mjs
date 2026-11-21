import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Build the handoff archive directly from an explicit allowlist. No staging
// repository, recursive removal, downloaded tools, or live caches are needed.
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const archiveFolder = 'emberfall-game-ready-kit';
const destination = path.join(root, 'deliverables', `${archiveFolder}.zip`);
const selfArchiveRelative = `deliverables/${archiveFolder}.zip`;
const checkOnly = process.argv.includes('--check');
const allowedArgs = new Set(['--check']);
for (const arg of process.argv.slice(2)) assert(allowedArgs.has(arg), `Unknown argument: ${arg}`);
const entryFiles = ['index.html', 'play.html', 'study.html', 'README.md', 'package.json'];
const entryFolders = ['src', 'vendor', 'assets', 'docs', 'scripts', 'tests', 'engine/godot'];
const excludedFolders = new Set(['dist', 'tools', 'node_modules', 'source', 'sources', 'source-repos', 'repositories', 'downloads', 'deliverables', '__pycache__', 'userdata', 'editor_data']);
const excludedExtensions = new Set(['.zip', '.7z', '.rar', '.tar', '.gz', '.log', '.exe', '.dll', '.pyc', '.pyo', '.tmp', '.bak', '.partial']);
const required = [
  ...entryFiles,
  'vendor/three/three.module.js',
  'vendor/three/three.core.js',
  'assets/game/hero.glb',
  'assets/game/hero.fbx',
  'assets/game/hero.blend',
  'assets/game/original.glb',
  'assets/game/character.json',
  'assets/game/LICENSE-KayKit.txt',
  'docs/asset-provenance.md',
  'docs/game-asset-handoff.md',
  'docs/browser-game-verification.md',
  'docs/game-victory.jpg',
  'assets/game/browser-validation.json',
  'scripts/verify-game.mjs',
  'tests/game-logic.test.mjs',
  'engine/godot/project.godot',
  'engine/godot/main.tscn',
  'engine/godot/scripts/hero_controller.gd',
  'engine/godot/scripts/arena.gd',
  'engine/godot/assets/hero.glb',
  'engine/godot/assets/character.json',
  'engine/godot/assets/LICENSE-KayKit.txt',
];
const canonicalRoot = await fs.realpath(root);
const files = [];
const excluded = [];
const normalize = p => p.split(path.sep).join('/');
const digest = buffer => createHash('sha256').update(buffer).digest('hex');
function excludedName(name, isDirectory) {
  if (name.startsWith('.')) return true;
  if (isDirectory) return excludedFolders.has(name.toLowerCase());
  return excludedExtensions.has(path.extname(name).toLowerCase()) || /\.blend\d+$/i.test(name) || ['Thumbs.db', 'desktop.ini'].includes(name);
}
async function collect(relative, explicit = false) {
  const absolute = path.resolve(root, relative);
  assert(absolute.startsWith(root + path.sep), 'Package target escaped the project');
  const info = await fs.lstat(absolute);
  assert(!info.isSymbolicLink(), `Package does not follow links: ${relative}`);
  const resolved = await fs.realpath(absolute);
  assert(resolved.toLowerCase().startsWith(canonicalRoot.toLowerCase() + path.sep.toLowerCase()), `Resolved target escaped the project: ${relative}`);
  const name = path.basename(absolute);
  if (!explicit && excludedName(name, info.isDirectory())) { excluded.push(normalize(relative)); return; }
  if (info.isDirectory()) {
    for (const child of (await fs.readdir(absolute)).sort()) await collect(path.join(relative, child));
  } else if (info.isFile()) {
    assert(!excludedName(name, false), `Explicit entry is excluded: ${relative}`);
    const bytes = await fs.readFile(absolute);
    files.push({ path: normalize(relative), bytes: bytes.length, sha256: digest(bytes) });
  } else throw new Error(`Unsupported file type: ${relative}`);
}
for (const entry of entryFiles) await collect(entry, true);
for (const entry of entryFolders) await collect(entry, true);
files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
const paths = new Set(files.map(f => f.path));
assert.equal(paths.size, files.length, 'No duplicate archive paths');
for (const relative of required) assert(paths.has(relative), `Required handoff item is missing: ${relative}`);
for (const folder of entryFolders) assert(files.some(f => f.path.startsWith(`${folder}/`)), `Required folder is empty: ${folder}`);
const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
for (const [scriptName, command] of Object.entries(packageJson.scripts || {})) {
  for (const [, referenced] of command.matchAll(/\b((?:scripts|tests)\/[\w./-]+\.(?:mjs|js|py))\b/g)) {
    assert(paths.has(referenced), `npm script ${scriptName} requires an unpackaged file: ${referenced}`);
  }
}
assert(files.some(f => f.path.startsWith('src/') && /\.(?:m?js)$/.test(f.path)), 'Playable JavaScript source must be included');
const playPage = await fs.readFile(path.join(root, 'play.html'), 'utf8');
assert(/<script\b[^>]*(?:src\s*=|type\s*=\s*["']module["'])/i.test(playPage), 'The playable page must load executable JavaScript');
for (const file of files) {
  assert(!file.path.split('/').some(part => part === '..' || part.startsWith('.')), `Unsafe archive path: ${file.path}`);
  assert(!file.path.split('/').some(part => excludedFolders.has(part.toLowerCase())), `Excluded folder in package: ${file.path}`);
}

// Ensure the native project uses the exact validated character distributed to
// the browser, and that the expected playable animation states survive export.
const heroBuffer = await fs.readFile(path.join(root, 'assets/game/hero.glb'));
const engineHeroBuffer = await fs.readFile(path.join(root, 'engine/godot/assets/hero.glb'));
assert.equal(digest(heroBuffer), digest(engineHeroBuffer), 'Godot and web must use the same hero asset');
assert.equal(heroBuffer.toString('utf8', 0, 4), 'glTF');
const jsonLength = heroBuffer.readUInt32LE(12);
const hero = JSON.parse(heroBuffer.toString('utf8', 20, 20 + jsonLength));
const expectedAnimations = ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Attack3', 'Block', 'BlockHit', 'Hit', 'Death', 'Dodge', 'Victory'];
for (const name of expectedAnimations) assert(hero.animations.some(a => a.name === name), `Required animation missing: ${name}`);
assert(hero.skins.some(s => s.joints.length >= 20), 'Character must include a real skeleton');
assert(hero.images.every(i => i.bufferView !== undefined), 'Character textures must be embedded');

// Check ordinary local page references without trying to resolve network URLs
// or JavaScript-generated paths. Section anchors and root-relative references
// resolve against the same archive folder.
for (const page of ['index.html', 'play.html', 'study.html']) {
  const html = await fs.readFile(path.join(root, page), 'utf8');
  for (const [, reference] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) continue;
    const resource = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    if (!resource || resource === '/') continue;
    const relative = path.posix.normalize(resource.startsWith('/') ? resource.slice(1) : path.posix.join(path.posix.dirname(page), resource));
    if (relative.endsWith('/')) continue;
    if (relative === selfArchiveRelative) continue; // Rebuilt after extraction; never recursively nested.
    assert(paths.has(relative), `${page} refers to an unpackaged resource: ${reference}`);
  }
}

const manifest = {
  name: 'Emberfall game-ready kit',
  builtAt: new Date().toISOString(),
  rootFolder: archiveFolder,
  contents: 'Playable web source + original study + CC0 character files + editable Godot project + verification scripts/tests',
  excludes: 'dist, tools, node_modules, downloaded source directories, archives, logs, hidden caches, userdata/editor_data, executables and Blender version backups',
  requiresForWeb: 'Node.js 18+ to run the included local HTTP server; frontend libraries are vendored',
  requiresForNative: 'An installed Godot 4.5+ editor/runtime; no editor executable or export templates are included',
  generatedLinks: [{ path: selfArchiveRelative, marker: 'SELF_ARCHIVE_NOT_NESTED', reason: 'This generated archive cannot contain itself. Run node scripts/package-game.mjs after extracting to regenerate this download link.' }],
  character: { author: 'Kay Lousberg / KayKit', license: 'CC0-1.0', sha256: digest(heroBuffer), animations: expectedAnimations },
  files,
};
const summary = { mode: checkOnly ? 'structure-check' : 'package', files: files.length, uncompressedBytes: files.reduce((n, f) => n + f.bytes, 0), requiredItems: required.length, excludedItems: excluded.length, heroMatchesGodot: true, destination };
if (checkOnly) {
  console.log(JSON.stringify({ ...summary, status: 'passed' }, null, 2));
  process.exit(0);
}

const pythonCandidates = process.platform === 'win32' ? [
  ['D:\\software\\python310\\python.exe', []],
  ['python', []],
  ['py', ['-3']],
] : [['python3', []], ['python', []]];
let python;
for (const [command, prefix] of pythonCandidates) {
  const result = spawnSync(command, [...prefix, '-c', 'import sys,zipfile;assert sys.version_info >= (3,8);print("zipfile-ready")'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (result.status === 0 && result.stdout.trim() === 'zipfile-ready') { python = { command, prefix }; break; }
}
assert(python, 'Python 3.8+ is required only for ZIP packaging. Web playback has no Python dependency.');
await fs.mkdir(path.dirname(destination), { recursive: true });
const program = `
import json,sys,zipfile,pathlib,os,hashlib
p=json.load(sys.stdin)
root=pathlib.Path(p['root']).resolve()
out=pathlib.Path(p['out']).resolve()
assert out.parent == root/'deliverables'
temporary=out.with_suffix(out.suffix+'.partial')
prefix=p['folder']+'/'
with zipfile.ZipFile(temporary,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as archive:
    for f in p['manifest']['files']:
        source=(root/f['path']).resolve()
        assert root in source.parents
        content=source.read_bytes()
        assert hashlib.sha256(content).hexdigest()==f['sha256'], 'Source changed during packaging: '+f['path']
        archive.writestr(prefix+f['path'],content)
    archive.writestr(prefix+'PACKAGE-CONTENTS.json',json.dumps(p['manifest'],ensure_ascii=False,indent=2))
with zipfile.ZipFile(temporary,'r') as archive:
    names=set(archive.namelist())
    for required in p['required']:
        assert prefix+required in names, required
    assert len(names)==len(p['manifest']['files'])+1
    assert archive.testzip() is None, 'ZIP CRC verification failed'
os.replace(temporary,out)
print(json.dumps({'zip':str(out),'zipBytes':out.stat().st_size,'entries':len(p['manifest']['files'])+1,'crc':'passed','sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
`;
const result = spawnSync(python.command, [...python.prefix, '-c', program], { input: JSON.stringify({ root, out: destination, folder: archiveFolder, manifest, required }), encoding: 'utf8', windowsHide: true, timeout: 180000, maxBuffer: 1024 * 1024 });
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr || `ZIP packaging exited with ${result.status}`);
const archiveResult = JSON.parse(result.stdout.trim());
await fs.writeFile(path.join(root, 'deliverables', `${archiveFolder}.manifest.json`), JSON.stringify({ ...manifest, archive: archiveResult }, null, 2));
console.log(JSON.stringify({ ...summary, status: 'passed', archive: archiveResult }, null, 2));
