import { mkdir, readFile, writeFile, cp, readdir, stat } from 'node:fs/promises';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const output = join(root, 'docs/028-earth-within');
const source = join(here, 'source');
const threeArg = process.argv.indexOf('--three-dir');
const three = resolve(threeArg >= 0 ? process.argv[threeArg + 1] : join(source, 'node_modules/three'));
const research = JSON.parse(await readFile(join(here, 'research.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function replaceOnce(text, from, to) {
  assert.equal(text.split(from).length, 2, `Expected one transform: ${from.slice(0, 60)}`);
  return text.replace(from, to);
}
await mkdir(output, { recursive: true });
await cp(join(source, 'src'), join(output, 'src'), { recursive: true });
await cp(join(source, 'assets'), join(output, 'assets'), { recursive: true });
await cp(join(here, 'assets'), join(output, 'assets'), { recursive: true });
await cp(join(here, 'site'), output, { recursive: true });
await cp(join(here, 'verification'), join(output, 'verification'), { recursive: true });
await mkdir(join(output, 'vendor'), { recursive: true });
for (const [from, to] of [
  ['build/three.module.js', 'three.module.js'], ['build/three.core.js', 'three.core.js'],
  ['examples/jsm/controls/OrbitControls.js', 'OrbitControls.js'], ['LICENSE', 'THREE-LICENSE.txt'],
]) await cp(join(three, from), join(output, 'vendor', to));
let world = await readFile(join(source, 'world.html'), 'utf8');
world = world.replaceAll('"/src/', '"./src/').replaceAll('"/vendor/', '"./vendor/')
  .replaceAll('"/assets/', '"./assets/').replaceAll('href="/atlas"', 'href="atlas.html"');
world = replaceOnce(world, '<span class="topbar-caption">01 / 雪山流域</span>', '<a class="topbar-caption" href="./">研究与引导图</a>');
world = replaceOnce(world, '<title>地球里的小世界 · 从雪线到海岸</title>', '<title>探索地球里的小世界 · 雪线到海底</title>');
await writeFile(join(output, 'play.html'), world);
let atlas = await readFile(join(source, 'index.html'), 'utf8');
atlas = atlas.replace('href="#catalog">场景总目录', 'href="./">研究与引导图');
await writeFile(join(output, 'atlas.html'), atlas);
let ambience = await readFile(join(output, 'src/world-ambience.js'), 'utf8');
ambience = ambience.replace(/url: '(\/assets\/audio\/[^']+)'/g, (_, path) => `url: new URL('..${path}', import.meta.url).href`);
await writeFile(join(output, 'src/world-ambience.js'), ambience);
let guide = await readFile(join(output, 'src/world-guide.js'), 'utf8');
guide = replaceOnce(guide, `  const availability = fetch('/api/voice', { signal: AbortSignal.timeout(4000) })
    .then((response) => response.ok ? response.json() : null)
    .then((status) => status?.available === true ? 'ready' : status?.available === false ? 'unconfigured' : 'unavailable')
    .catch(() => 'unavailable');`, `  let publishedClips = {};
  const availability = fetch(new URL('../assets/narration/manifest.json', import.meta.url), { signal: AbortSignal.timeout(8000) })
    .then((response) => response.ok ? response.json() : null)
    .then((manifest) => {
      publishedClips = manifest?.clips ?? {};
      return Object.keys(publishedClips).length === 15 ? 'ready' : 'unavailable';
    }).catch(() => 'unavailable');`);
guide = replaceOnce(guide, `    const response = await fetch('/api/voice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), signal,
    });`, `    const clip = publishedClips[id];
    if (!clip || !/^[a-z0-9-]+\\.mp3$/.test(clip.file)) return false;
    const response = await fetch(new URL('../assets/narration/' + clip.file, import.meta.url), { signal });`);
guide = replaceOnce(guide, `      const cached = ['disk', 'memory'].includes(response.headers.get('X-Voice-Cache'));
      setSource(cached ? 'MiniMax 语音 · 已缓存' : 'MiniMax 语音');`, `      setSource('MiniMax 语音 · 预生成录音');`);
assert(!guide.includes('/api/voice'), 'Published voice must not need a server');
await writeFile(join(output, 'src/world-guide.js'), guide);
await cp(join(here, 'research.json'), join(output, 'research.json'));
await writeFile(join(output, 'README.md'), (await readFile(join(here, 'README.md'), 'utf8'))
  .replaceAll('../../docs/028-earth-within/', './')
  .replace('(source/assets/audio/SOURCES.md)', '(https://github.com/yydshly/20261104_codex_project/blob/main/projects/028-earth-within/source/assets/audio/SOURCES.md)'));
// Preserve the exact bytes described by the file manifest on every platform.
await writeFile(join(output, '.gitattributes'), '* -text whitespace=cr-at-eol\nvendor/** -whitespace\n');
const originalGuide = await readFile(join(here, research.guide.path));
assert.equal(sha(originalGuide), research.guide.sha256, 'Original guide identity');
assert.equal(sha(await readFile(join(output, research.guide.path))), research.guide.sha256, 'Published guide identity');
const manifest = { published: research.published, slug: research.slug, title: research.title,
  summary: research.summary, entry: 'index.html', playable: 'play.html', atlas: 'atlas.html',
  guide: research.guide, audio: { narrationClips: 15, provider: 'MiniMax', mode: 'existing cache exported offline', newSynthesis: 0, fieldRecordings: 4 },
  privateFilesExcluded: ['.env', 'API credentials', 'raw cache containers', 'browser saves', 'temporary recordings', 'node_modules'], files: [] };
async function list(path) {
  for (const name of (await readdir(path)).sort()) {
    const full = join(path, name), info = await stat(full);
    if (info.isDirectory()) await list(full);
    else if (full !== join(output, 'publication-manifest.json')) {
      const bytes = await readFile(full);
      manifest.files.push({ path: relative(output, full).split('\\').join('/'), bytes: bytes.length, sha256: sha(bytes) });
    }
  }
}
await list(output);
await writeFile(join(output, 'publication-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ publicFiles: manifest.files.length, totalMB: +(manifest.files.reduce((n, f) => n + f.bytes, 0) / 1e6).toFixed(2), guideUnchanged: true, narration: 15, liveAPI: false }));
