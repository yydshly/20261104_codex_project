import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = dirname(fileURLToPath(import.meta.url));
const output = join(project, '..', 'docs', '012-castle-knowledge-world');
const publicUrl = 'https://yydshly.github.io/20261104_codex_project/012-castle-knowledge-world/';
const title = '暮色之堡 · 可漫游的知识世界探索';
const description = '用 Three.js + HTML 实现第一人称渡湖、入堡与螺旋登塔，研究如何把科普、历史、音乐与农业融入可漫游世界。提供原型试玩、研究引导图、复用价值与验证方向。';

await import('./build.mjs');
await mkdir(output, { recursive: true });

let research = await readFile(join(project, 'world-notes.html'), 'utf8');
research = research
  .replaceAll('href="index.html"', 'href="play.html"')
  .replaceAll(' ↗', '')
  .replaceAll(' ↓', '')
  .replace('<head>', `<head>
  <link rel="canonical" href="${publicUrl}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${publicUrl}">
  <meta property="og:image" content="${publicUrl}research-overview.png">
  <meta property="og:image:alt" content="暮色之堡与从零造物研究全景图">
  <meta name="twitter:card" content="summary_large_image">`)
  .replace('<nav class="top-links" aria-label="相关入口">', '<nav class="top-links" aria-label="相关入口"><a href="../">研究总库</a>');
await writeFile(join(output, 'index.html'), research);

const play = (await readFile(join(project, 'index.html'), 'utf8'))
  .replaceAll('href="world-notes.html"', 'href="index.html"');
await writeFile(join(output, 'play.html'), play);

// Preserve the selected guide image byte for byte, along with genuine prototype frames.
for (const file of ['research-overview.png', 'preview.jpg', 'boat-preview.jpg', 'tower-preview.jpg', 'walk-preview.jpg']) {
  await copyFile(join(project, file), join(output, file));
}

await writeFile(join(output, 'world-notes.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=index.html"><title>暮色之堡研究</title><a href="index.html">打开研究页</a></html>\n');
console.log('Published static files to docs/012-castle-knowledge-world/');
