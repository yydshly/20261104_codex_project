import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const option = process.argv.indexOf('--source');
assert(option >= 0 && process.argv[option + 1], '--source is required');
const source = path.resolve(process.argv[option + 1]);
const destination = path.join(root, 'docs/025-cozy-emotion-lab');
const site = 'https://yydshly.github.io/20261104_codex_project/025-cozy-emotion-lab/';
const guide = 'assets/diagrams/art-emotion-value-map.png';
const summary = '研究以艺术与情绪进入图像，从形体呼应、瞬间与留白提炼观看关系。29幅图、三图对照、实时调色、八秒静态镜头与导出，积累审美判断、原创简报和系列表达方法；原创迁移与体验产品价值继续验证。';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inputs = [];
async function walk(relative = '') {
  for (const entry of await fs.readdir(path.join(source, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    assert(!entry.isSymbolicLink(), `Source link is not allowed: ${name}`);
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (entry.isDirectory()) await walk(name);
    else inputs.push(name);
  }
}
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, sanitize(v)]));
  if (typeof value === 'string' && /^[A-Za-z]:[\\/]/.test(value)) return '[local path omitted from public copy]';
  return value;
}
await walk();
await fs.mkdir(destination, { recursive: true });
for (const relative of inputs) {
  let bytes = await fs.readFile(path.join(source, relative));
  if (relative.endsWith('.json')) bytes = Buffer.from(JSON.stringify(sanitize(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''))), null, 2) + '\n');
  const target = path.join(destination, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}
let html = await fs.readFile(path.join(destination, 'index.html'), 'utf8');
html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${summary}">`);
html = html.replace('</head>', `  <link rel="canonical" href="${site}">\n  <meta property="og:title" content="留一会儿 · 艺术与情绪图像研究">\n  <meta property="og:description" content="${summary}">\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="${site}">\n  <meta property="og:image" content="${site}${guide}">\n  <meta property="og:image:width" content="2400">\n  <meta property="og:image:height" content="1700">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${site}${guide}">\n</head>`);
html = html.replace('<a href="#feedback">反馈历程</a>', '<a href="#summary">研究摘要</a>');
const researchSummary = `
    <section id="summary" class="overview-section publication-summary" aria-labelledby="publication-summary-title">
      <div class="section-heading"><p class="eyebrow">研究、实际效果与我们的价值</p><h2 id="publication-summary-title">从艺术感受，积累自己的表达方法。</h2><p>我们研究画面怎样建立值得停留的关系，再把观察带入自己的创作。艺术意图确定方向，摄影语言承载表达，真实看图反馈推动判断。</p></div>
      <dl class="publication-summary-list">
        <div><dt>研究理解</dt><dd>原帖双图以弧线、中轴、瞬间与留白产生相遇或承托的联想。多轮试作说明，暖色、细节和自然质感本身不足以证明情绪成立；可迁移方法需要原创作品继续检验。</dd></div>
        <div><dt>可体验效果</dt><dd>29幅图的原比例展厅、来源与反馈筛选、最多三图对照，21张未停用试作的实时调色与PNG下载，以及八秒静态镜头预演、海报和简报导出。<a href="#effects">动手体验</a> · <a href="#feedback">回看逐轮反馈</a></dd></div>
        <div><dt>对我们的价值</dt><dd>沉淀审美与选片依据，把画面关系写成原创简报与系列规则，再探索情绪图像展、壁纸和短片等体验。主体、动作、场景与构图重新设计，借鉴范围为风格与技术。</dd></div>
        <div><dt>当前结果</dt><dd>只有原帖双图获得明确正向反馈。22张生成图中10张待评、11张未选、1张停用；白鹭仍待评。原创迁移、持续使用与付费价值尚未验证。预演为浏览器静态图运动，未生成AI视频。</dd></div>
      </dl>
      <p class="publication-summary-links"><a href="README.md">完整研究摘要</a><a href="publication-manifest.json">发布范围与引导图校验</a><a href="https://github.com/yydshly/20261104_codex_project/tree/main/docs/025-cozy-emotion-lab" target="_blank" rel="noopener noreferrer">公开源码与记录</a></p>
    </section>
`;
html = html.replace('    <details class="research-inventory">', researchSummary + '    <details class="research-inventory">');
await fs.writeFile(path.join(destination, 'index.html'), html);
await fs.appendFile(path.join(destination, 'overview.css'), '\n.publication-summary-list{margin:0}.publication-summary-list>div{display:grid;grid-template-columns:145px minmax(0,1fr);gap:26px;padding:22px 0;border-top:1px solid var(--collection-line)}.publication-summary-list dt{color:var(--collection-gold);font-size:18px}.publication-summary-list dd{margin:0;color:var(--collection-muted);font-size:16px;line-height:1.9}.publication-summary-links{display:flex;flex-wrap:wrap;gap:12px 24px;margin-top:24px;font-size:14px}.publication-summary a{color:var(--collection-gold);text-underline-offset:4px}@media(max-width:700px){.publication-summary-list>div{grid-template-columns:1fr;gap:8px}}\n');
await fs.copyFile(path.join(here, 'README.md'), path.join(destination, 'README.md'));
await fs.writeFile(path.join(destination, '.gitattributes'), '# Preserve publication manifest bytes and historical prompt line endings.\n* -text\n');
const guideBytes = await fs.readFile(path.join(source, guide));
const publicGuideBytes = await fs.readFile(path.join(destination, guide));
assert(guideBytes.equals(publicGuideBytes), 'Guide must remain byte-identical');
const manifest = {
  published: '2026-11-21', slug: '025-cozy-emotion-lab', site, summary,
  guide: { path: guide, width: 2400, height: 1700, sourceSha256: hash(guideBytes), publishedSha256: hash(publicGuideBytes), unchanged: true },
  imageStatus: { pinned: 2, generated: 22, external: 5, pendingGenerated: 10, notSelectedGenerated: 11, withdrawnGenerated: 1, selectedGenerated: 0 },
  scope: 'Art and emotion entry, representative guide, full image archive, feedback, browser effects, export tools, source and generation records.',
  publicCopyChanges: ['Added concise research, effects, value and current result summary.', 'Added canonical and social metadata using the existing guide.', 'Replaced public README with the research summary.', 'Omitted machine absolute paths inside JSON records; original images and prompts retained.'],
  limits: ['Egret remains pending; no generated work is marked selected.', 'Static camera motion is not AI video.', 'External photographs depend on original remote image URLs.', 'Product use and commercial outcomes are unvalidated.', 'Local browser notes do not automatically sync to the public origin.'], files: []
};
async function inventory(relative = '') {
  for (const entry of (await fs.readdir(path.join(destination, relative), { withFileTypes: true })).sort((a,b)=>a.name.localeCompare(b.name))) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) await inventory(name);
    else if (name !== 'publication-manifest.json') { const bytes = await fs.readFile(path.join(destination, name)); manifest.files.push({ path:name, bytes:bytes.length, sha256:hash(bytes) }); }
  }
}
await inventory();
await fs.writeFile(path.join(destination, 'publication-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ files:manifest.files.length, totalBytes:manifest.files.reduce((n,f)=>n+f.bytes,0), guideUnchanged:true, site },null,2));
