import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PROJECT_ROOT, ARCHIVE_FOLDER, REQUIRED_FILES, GENERATED_ARTIFACTS, sha256, inspectWarlordGlb, validatePageLinks } from './verify-warlord.mjs';

export const ENTRY_FILES = Object.freeze(['index.html', 'play.html', 'warlord.html', 'emberfall.html', 'study.html', 'research.html', 'README.md', 'package.json', 'package-lock.json', 'play-web.cmd']);
export const ENTRY_FOLDERS = Object.freeze(['src', 'vendor', 'assets', 'docs', 'scripts', 'tests', 'engine/warlord', 'engine/godot']);
export const EXCLUDED_FOLDERS = new Set(['dist', 'tools', 'node_modules', 'source', 'sources', 'source-repos', 'repositories', 'downloads', 'deliverables', '__pycache__', 'userdata', 'editor_data', 'cache', 'caches', 'temp', 'tmp', 'warlord-premium', 'warlord-v5']);
export const EXCLUDED_EXTENSIONS = new Set(['.zip', '.7z', '.rar', '.tar', '.gz', '.log', '.exe', '.dll', '.pck', '.pyc', '.pyo', '.tmp', '.bak', '.partial', '.cache']);
const normalize = relative => relative.split(path.sep).join('/');
export function excludedName(name, directory) {
  if (name.startsWith('.')) return true;
  return directory ? EXCLUDED_FOLDERS.has(name.toLowerCase()) : EXCLUDED_EXTENSIONS.has(path.extname(name).toLowerCase()) || /\.blend\d+$/i.test(name) || /^(?:Thumbs\.db|desktop\.ini)$/i.test(name);
}
function inside(root, target) { const relative = path.relative(root, target); return Boolean(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative); }

export async function collectWarlordFiles(root = PROJECT_ROOT) {
  root = path.resolve(root); const canonicalRoot = await fs.realpath(root), files = [], excluded = [];
  async function collect(relative, explicit = false) {
    const absolute = path.resolve(root, relative); assert(inside(root, absolute), `Package path stays in project: ${relative}`);
    const info = await fs.lstat(absolute); assert(!info.isSymbolicLink(), `Package does not follow links: ${relative}`);
    if(normalize(relative).startsWith('engine/warlord/assets/') && /^warlord_.+\.(?:png|jpe?g)(?:\.import)?$/i.test(path.basename(absolute))){excluded.push(normalize(relative));return;}
    assert(inside(canonicalRoot, await fs.realpath(absolute)), `Resolved package path stays in project: ${relative}`);
    if (!explicit && excludedName(path.basename(absolute), info.isDirectory())) { excluded.push(normalize(relative)); return; }
    if (info.isDirectory()) for (const child of (await fs.readdir(absolute)).sort()) await collect(path.join(relative, child));
    else {
      assert(info.isFile() && !excludedName(path.basename(absolute), false), `Supported package file: ${relative}`);
      const bytes = await fs.readFile(absolute); files.push({ path: normalize(relative), bytes: bytes.length, sha256: sha256(bytes) });
    }
  }
  for (const entry of ENTRY_FILES) await collect(entry, true);
  for (const entry of ENTRY_FOLDERS) await collect(entry, true);
  files.sort((a, b) => a.path.localeCompare(b.path, 'en')); const paths = new Set(files.map(item => item.path));
  assert.equal(paths.size, files.length, 'Unique archive paths');
  for (const required of REQUIRED_FILES) assert(paths.has(required), `Required handoff file: ${required}`);
  for (const folder of ENTRY_FOLDERS) assert(files.some(item => item.path.startsWith(`${folder}/`)), `Nonempty handoff folder: ${folder}`);
  for (const item of files) assert(!item.path.split('/').some(part => part === '..' || part.startsWith('.') || EXCLUDED_FOLDERS.has(part.toLowerCase())), `Safe allowlisted file: ${item.path}`);
  const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  for (const [script, command] of Object.entries(packageJson.scripts || {})) for (const [, reference] of command.matchAll(/\b((?:scripts|tests)\/[\w./-]+\.(?:mjs|js|py))\b/g)) assert(paths.has(reference), `npm ${script} references an included script: ${reference}`);
  return { files, paths, excluded };
}

export async function packageWarlord({ root = PROJECT_ROOT, checkOnly = false } = {}) {
  root = path.resolve(root); const { files, paths, excluded } = await collectWarlordFiles(root);
  const characterBytes = await fs.readFile(path.join(root, 'assets/warlord/warlord.glb'));
  const metadata = JSON.parse(await fs.readFile(path.join(root, 'assets/warlord/metadata.json'), 'utf8'));
  const character = inspectWarlordGlb(characterBytes, metadata);
  assert.equal(sha256(await fs.readFile(path.join(root, 'engine/warlord/assets/warlord.glb'))), character.sha256, 'V3 engine uses the exact distributed character');
  assert.equal(sha256(await fs.readFile(path.join(root, 'engine/warlord/assets/metadata.json'))), sha256(await fs.readFile(path.join(root, 'assets/warlord/metadata.json'))), 'V3 native metadata is current');
  assert.equal(sha256(await fs.readFile(path.join(root, 'engine/godot/assets/hero.glb'))), sha256(await fs.readFile(path.join(root, 'assets/game/hero.glb'))), 'Legacy engine character remains identical');
  const webLinks = await validatePageLinks(root, paths);
  const destination = path.join(root, 'deliverables', `${ARCHIVE_FOLDER}.zip`);
  const manifest = {
    name: 'Chixiao refined heavy-halberd warlord kit', version: 4, builtAt: new Date().toISOString(), rootFolder: ARCHIVE_FOLDER,
    contents: 'V4 refined playable web and native warlord + preserved Emberfall web/native + original study + vendored runtime + editable characters + verification scripts and tests',
    excludes: 'Downloaded assets/source trees, tools, caches, hidden editor data, executables/export packs, logs, Blender version backups and every nested archive',
    requiresForWeb: 'Node.js 18+ for the included local HTTP server. No frontend install or network CDN is needed.',
    requiresForNative: 'A locally installed Godot 4.5+ editor/runtime; binaries and export templates are excluded.',
    verify: 'node scripts/verify-warlord.mjs --require-package', generatedLinks: GENERATED_ARTIFACTS,
    character: { author: metadata.sourceAuthor, license: metadata.license, ...character }, webLinks, files,
  };
  const summary = { status: 'passed', mode: checkOnly ? 'structure-check' : 'package', files: files.length, uncompressedBytes: files.reduce((sum, file) => sum + file.bytes, 0), excludedItems: excluded.length, requiredItems: REQUIRED_FILES.length, characterSha256: character.sha256, sharedNativeAsset: true, destination };
  if (checkOnly) return summary;
  const candidates = process.platform === 'win32' ? [['D:\\software\\python310\\python.exe', []], ['python', []], ['py', ['-3']]] : [['python3', []], ['python', []]];
  let python;
  for (const [command, prefix] of candidates) {
    const result = spawnSync(command, [...prefix, '-c', 'import sys,zipfile;assert sys.version_info >= (3,8);print("zipfile-ready")'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    if (result.status === 0 && result.stdout.trim() === 'zipfile-ready') { python = { command, prefix }; break; }
  }
  assert(python, 'Python 3.8+ is required only to build the ZIP. Playing or verifying the web game does not require Python.');
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
    assert len(names)==len(p['manifest']['files'])+1
    for required in p['required']:
        assert prefix+required in names, required
    assert archive.testzip() is None, 'ZIP CRC verification failed'
os.replace(temporary,out)
print(json.dumps({'zip':str(out),'zipBytes':out.stat().st_size,'entries':len(p['manifest']['files'])+1,'crc':'passed','sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
`;
  const result = spawnSync(python.command, [...python.prefix, '-c', program], { input: JSON.stringify({ root, out: destination, folder: ARCHIVE_FOLDER, manifest, required: REQUIRED_FILES }), encoding: 'utf8', windowsHide: true, timeout: 300000, maxBuffer: 1024 * 1024 });
  if (result.error) throw result.error; assert.equal(result.status, 0, result.stderr || 'V3 ZIP packaging failed');
  const archive = JSON.parse(result.stdout.trim());
  await fs.writeFile(path.join(root, 'deliverables', `${ARCHIVE_FOLDER}.manifest.json`), JSON.stringify({ ...manifest, archive }, null, 2));
  return { ...summary, archive };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2); assert(args.every(arg => arg === '--check'), 'Unknown packaging argument');
  try { console.log(JSON.stringify(await packageWarlord({ checkOnly: args.includes('--check') }), null, 2)); }
  catch (error) { console.error(JSON.stringify({ status: 'failed', error: error.message }, null, 2)); process.exitCode = 1; }
}
