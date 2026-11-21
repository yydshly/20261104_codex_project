import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(here, '../../docs/028-earth-within');
const research = JSON.parse(await readFile(join(here, 'research.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(output, 'publication-manifest.json'), 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
let references = 0, scripts = 0;
for (const file of manifest.files) {
  assert(!/(^|\/)(?:node_modules|\.env|\.cache)(?:\/|$)|\.(?:clip|tmp)$/.test(file.path), `Private file: ${file.path}`);
  const bytes = await readFile(join(output, file.path));
  assert.equal(bytes.length, file.bytes, `Length: ${file.path}`);
  assert.equal(sha(bytes), file.sha256, `Checksum: ${file.path}`);
  assert(bytes.length < 100 * 1024 * 1024, 'GitHub file limit');
  if (file.path.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', join(output, file.path)], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    scripts++;
    const code = bytes.toString('utf8');
    assert(!/['"]\/(?:api|assets|src|vendor)\//.test(code), `Root-dependent URL: ${file.path}`);
    for (const match of code.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
      assert((await stat(resolve(output, dirname(file.path), match[1]))).isFile(), `Module: ${file.path} ${match[1]}`);
      references++;
    }
  }
  if (file.path.endsWith('.html')) {
    const html = bytes.toString('utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (/^(?:https?:|data:|#)/.test(url)) continue;
      assert(!url.startsWith('/'), `Root-dependent link: ${url}`);
      const clean = url.split(/[?#]/)[0] || '.';
      const target = resolve(output, dirname(file.path), clean);
      const info = await stat(target).catch(() => null);
      assert(info, `Missing URL: ${file.path} ${url}`);
      if (info.isDirectory()) assert((await stat(join(target, 'index.html'))).isFile());
      references++;
    }
  }
}
const { narration } = await import(pathToFileURL(join(here, 'source/src/world-narration.js')));
const audio = JSON.parse(await readFile(join(output, 'assets/narration/manifest.json'), 'utf8'));
assert.equal(Object.keys(audio.clips).length, 15);
assert.equal(research.stops.length, 15);
for (const [id, text] of Object.entries(narration)) {
  assert.equal(audio.clips[id].textSha256, sha(text), `Narration text: ${id}`);
  assert.equal(audio.clips[id].sha256, sha(await readFile(join(output, 'assets/narration', audio.clips[id].file))), `Narration audio: ${id}`);
}
assert.equal(sha(await readFile(join(output, research.guide.path))), research.guide.sha256);
const guide = await readFile(join(output, 'src/world-guide.js'), 'utf8');
assert(guide.includes('预生成录音') && !guide.includes('/api/voice'));
const page = await readFile(join(output, 'index.html'), 'utf8');
for (const id of ['understanding', 'guide', 'effects', 'journey', 'implementation', 'value', 'next', 'limits']) assert(page.includes(`id="${id}"`));
assert(page.includes('4000 × 7200') && page.includes('学习') && page.includes('尚未'));
console.log(JSON.stringify({ status: 'passed', files: manifest.files.length, scripts, localReferences: references, narrationClips: 15, guideUnchanged: true, runtimeAPI: false }, null, 2));
