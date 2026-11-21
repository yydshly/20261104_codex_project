import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const publicRoot = path.join(root, 'docs/025-cozy-emotion-lab');
const manifest = JSON.parse(fs.readFileSync(path.join(publicRoot, 'publication-manifest.json'), 'utf8'));
let checks = 0;
const check = (condition, message) => { assert(condition, message); checks++; };
const read = name => fs.readFileSync(path.join(publicRoot,name), 'utf8');
const json = name => JSON.parse(read(name));
for (const file of manifest.files) {
  const bytes = fs.readFileSync(path.join(publicRoot,file.path));
  check(bytes.length === file.bytes, `Size: ${file.path}`);
  check(createHash('sha256').update(bytes).digest('hex') === file.sha256, `Hash: ${file.path}`);
}
const guide = fs.readFileSync(path.join(publicRoot,manifest.guide.path));
check(guide.readUInt32BE(16) === 2400 && guide.readUInt32BE(20) === 1700, 'Guide dimensions');
check(manifest.guide.sourceSha256 === manifest.guide.publishedSha256 && manifest.guide.unchanged, 'Original guide identity');
const data = json('collection-data.json');
check(data.items.length === 29, '29 images');
for (const [category,count] of [['generated',22],['pinned',2],['external',5]]) check(data.items.filter(i=>i.category===category).length === count, `Category ${category}`);
for (const [status,count] of [['pending',10],['not-selected',11],['withdrawn',1]]) check(data.items.filter(i=>i.category==='generated' && i.status===status).length === count, `Status ${status}`);
const ids = new Set(data.items.map(i=>i.id));
check(ids.size === 29, 'Unique image IDs');
for (const item of data.items) {
  if (item.category !== 'external') check(fs.existsSync(path.join(publicRoot,item.src)), `Image exists: ${item.id}`);
  else check(item.src.startsWith('https://') && item.status === 'not-selected', `External source and feedback: ${item.id}`);
  for (const key of ['promptUrl','recordUrl']) if (item[key]) check(fs.existsSync(path.join(publicRoot,item[key])), `Record exists: ${item.id}/${key}`);
  if (item.category === 'generated') {
    const png = fs.readFileSync(path.join(publicRoot,item.src));
    check(png.readUInt32BE(16) === item.width && png.readUInt32BE(20) === item.height, `Actual image dimensions: ${item.id}`);
  }
}
const content = json('overview-content.json');
for (const stage of content.feedbackTimeline) for (const id of stage.ids) check(ids.has(id), `Feedback image: ${id}`);
for (const resource of content.resources) if (!/^https?:/.test(resource.url)) check(fs.existsSync(path.join(publicRoot,resource.url.split('#')[0])), `Resource: ${resource.url}`);
for (const filename of ['index.html','collection.html','workbench.html','art-direction-map.html']) {
  const html = read(filename);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|data:|#)/.test(value)) continue;
    const target = decodeURIComponent(value.split(/[?#]/)[0]);
    check(fs.existsSync(path.join(publicRoot,target)), `Runtime link: ${filename}/${value}`);
  }
}
const home = read('index.html');
check(home.includes('id="summary"') && home.includes('对我们的价值') && home.includes('可体验效果'), 'Research/effects/value summary');
check(home.includes(`property="og:image" content="${manifest.site}${manifest.guide.path}"`), 'Social card uses original guide');
check(home.includes(`rel="canonical" href="${manifest.site}"`), 'Canonical URL');
check(read('README.md').includes('白鹭依然待评') && !read('README.md').includes('http://127.0.0.1'), 'Public README status and links');
for (const filename of fs.readdirSync(path.join(publicRoot,'docs')).filter(f=>f.endsWith('.json'))) {
  const parsed = json('docs/' + filename);
  function inspect(value) { if (Array.isArray(value)) value.forEach(inspect); else if (value && typeof value === 'object') Object.values(value).forEach(inspect); else if (typeof value === 'string') check(!/^[A-Za-z]:[\\/]/.test(value), `Machine path omitted: ${filename}`); }
  inspect(parsed);
}
for (const file of ['app.js','data.js','gallery.js','collection.js','overview.js','art-direction-map.js','scripts/build-art-emotion-map.mjs','server.mjs']) execFileSync(process.execPath,['--check',path.join(publicRoot,file)],{stdio:'pipe'});
for (const name of ['README.md','docs/index.html']) {
  const text = fs.readFileSync(path.join(root,name),'utf8');
  check(text.includes('025-cozy-emotion-lab'), `Main index: ${name}`);
  check(text.includes('024-immersive-loop-research'), `Preserve prior project: ${name}`);
  check(text.includes('art-emotion-value-map.png'), `Guide in main index: ${name}`);
}
if (process.argv.includes('--git-head')) {
  const listing = execFileSync('git',['ls-tree','-r','HEAD','--','docs/025-cozy-emotion-lab'],{cwd:root,encoding:'utf8'});
  const objects = new Map(listing.trim().split('\n').map(row => { const [,sha,name] = row.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/); return [name,sha]; }));
  for (const file of [...manifest.files, {path:'publication-manifest.json'}]) {
    const bytes = fs.readFileSync(path.join(publicRoot,file.path));
    const objectId = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    check(objects.get('docs/025-cozy-emotion-lab/' + file.path) === objectId, `Committed exact bytes: ${file.path}`);
  }
}
console.log(JSON.stringify({result:'passed',checks,files:manifest.files.length,guideUnchanged:true,images:29,generatedSelected:0,site:manifest.site},null,2));
