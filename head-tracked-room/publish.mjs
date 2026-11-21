import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const source = fileURLToPath(new URL('./', import.meta.url));
const build = join(source, 'dist');
const output = fileURLToPath(new URL('../docs/013-spatial-window/', import.meta.url));
const result = spawnSync(process.execPath, [join(source, 'node_modules/vite/bin/vite.js'), 'build', '--base', './'], {
  cwd: source,
  env: { ...process.env, VITE_PUBLIC_BUILD: 'true' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error('Public build failed.');

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}

await mkdir(output, { recursive: true });
await cp(build, output, { recursive: true });
const app = (await readFile(join(build, 'index.html'), 'utf8'))
  .replace('本地运行', '浏览器内运行')
  .replace('./research.html', './')
  .replace('<title>桌上平板 · 视差窗口</title>', '<title>微缩交互演示 · 视差窗口</title>');
await writeFile(join(output, 'play.html'), app);
const study = (await readFile(join(build, 'research.html'), 'utf8'))
  .replaceAll('href="./?scene=', 'href="./play.html?scene=')
  .replaceAll('href="./"', 'href="./play.html"')
  .replace(/(<p id="public-edition-note"[^>]*?) hidden(?=>)/, '$1')
  .replace('<div class="topbar-actions">', '<div class="topbar-actions"><a class="plain-link" href="../">返回研究总库 ↗</a>');
await writeFile(join(output, 'index.html'), study);
await writeFile(join(output, 'research.html'), study);

const paths = (await files(build)).filter(path => !['index.html', 'research.html'].includes(relative(build, path)));
for (const path of paths) {
  const [original, published] = await Promise.all([readFile(path), readFile(join(output, relative(build, path)))]);
  if (!original.equals(published)) throw new Error('Publication differs: ' + relative(build, path));
}
const guide = 'research/understanding-overview-compact.png';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const [originalGuide, publicGuide] = await Promise.all([readFile(join(source, 'public', guide)), readFile(join(output, guide))]);
if (hash(originalGuide) !== hash(publicGuide)) throw new Error('Guide image differs.');
console.log('Published and verified ' + paths.length + ' assets in docs/013-spatial-window/.');
console.log('Existing guide SHA-256 ' + hash(publicGuide));
