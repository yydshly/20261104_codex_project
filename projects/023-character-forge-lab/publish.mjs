import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const option=process.argv.indexOf('--source');
const source=path.resolve(option>=0?process.argv[option+1]:path.join(root,'character-forge-lab'));
const destination=path.join(root,'docs/023-character-forge-lab');
const site='https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/';
const repo='https://github.com/yydshly/20261104_codex_project/tree/main/docs/023-character-forge-lab';
const guide='docs/character-research-overview.png';
const guideHash='3233230c348cd00cfbded0b82eb4af09a90a5ce2426701878a2e2a4c36cb344d';
const hash=b=>createHash('sha256').update(b).digest('hex');
const entries=['index.html','play.html','warlord.html','emberfall.html','study.html','research.html','README.md','package.json','package-lock.json','play-web.cmd','src','vendor','assets','docs','scripts','tests','engine/warlord','engine/godot'];
const skipDirectories=new Set(['dist','tools','node_modules','source','sources','source-repos','repositories','downloads','deliverables','__pycache__','userdata','editor_data','cache','caches','temp','tmp','warlord-premium','warlord-v5']);
const skipExtensions=new Set(['.zip','.7z','.rar','.tar','.gz','.log','.exe','.dll','.pck','.pyc','.pyo','.tmp','.bak','.partial','.cache']);
const files=[];
async function walk(relative,explicit=false){
 const absolute=path.resolve(source,relative),info=await fs.lstat(absolute);
 assert(!info.isSymbolicLink(),`Do not follow source links: ${relative}`);
 assert(absolute.startsWith(source+path.sep));
 const name=path.basename(absolute);
 if(name.startsWith('.')||(!explicit&&info.isDirectory()&&skipDirectories.has(name.toLowerCase())))return;
 if(info.isDirectory()){for(const child of (await fs.readdir(absolute)).sort())await walk(path.join(relative,child));return;}
 relative=relative.split(path.sep).join('/');
 if(skipExtensions.has(path.extname(name).toLowerCase())||/\.blend\d+$/i.test(name))return;
 if(relative==='assets/warlord/warlord.blend')return;
 if(relative.startsWith('engine/warlord/assets/')&&/^warlord_.+\.(png|jpe?g)(\.import)?$/i.test(name))return;
 files.push(relative);
}
for(const entry of entries)await walk(entry,true);
for(const entry of ['engine/Warlord-Godot-sourcekit.zip','engine/Emberfall-Godot-project.zip','deliverables/emberfall-game-ready-kit.zip'])files.push(entry);
function sanitize(value){
 if(Array.isArray(value))return value.map(sanitize);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['generatedPath','output_hint'].includes(k)).map(([k,v])=>[k,sanitize(v)]));
 if(typeof value==='string'&&/^[A-Za-z]:[\\/]/.test(value))return '[local path omitted]';
 return value;
}
function publicHtml(text){
 text=text.replaceAll('href="index.html','href="play.html');
 text=text.replace(/<a href="assets\/warlord\/warlord\.blend" download>.*?<\/a>/g,'<a href="engine/Warlord-Godot-sourcekit.zip" download>Godot 角色与工程包 ↓</a>');
 text=text.replace(/<a href="deliverables\/chixiao-warlord-kit\.zip" download>.*?<\/a>/g,`<a href="${repo}" target="_blank" rel="noopener noreferrer">网页与研究源码 ↗</a>`);
 text=text.replace('最终blend。','本地保留的最终blend（公开版提供GLB与Godot工程包）。');
 text=text.replace('直接用 <a href="engine/Warlord-Godot-sourcekit.zip" download>Godot 角色与工程包 ↓</a> 继续编辑，或在引擎中使用','下载 <a href="engine/Warlord-Godot-sourcekit.zip" download>Godot角色与工程包</a> 继续接入，或在Blender/引擎中导入');
 return text;
}
await fs.mkdir(destination,{recursive:true});
for(const relative of files){
 let bytes=await fs.readFile(path.join(source,relative));
 if(relative.endsWith('.json'))bytes=Buffer.from(JSON.stringify(sanitize(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''))),null,2)+'\n');
 if(/\.(html|css|js|mjs|md|txt|json|py|gd|godot|tscn|ps1|cmd|uid|import)$/.test(relative)){
  let text=bytes.toString('utf8').replace(/\r\n?/g,'\n').replace(/\n+$/,'\n');
  if(relative.endsWith('.html'))text=publicHtml(text);
  if(relative==='scripts/verify-warlord.mjs')text=text.replace("page === 'research.html' ? 'research'", "(page === 'index.html' || page === 'research.html') ? 'research'");
  bytes=Buffer.from(text);
 }
 const to=path.join(destination,relative);await fs.mkdir(path.dirname(to),{recursive:true});await fs.writeFile(to,bytes);
}
let research=await fs.readFile(path.join(destination,'research.html'),'utf8');
research=research.replace('从原帖到赤霄实战：记录效果、提示词、Blender与游戏实现、质量差距，以及先做好人物素材再接入游戏的制作路线。','角色素材与游戏质感研究：赤霄13动作、Three.js与Godot战斗原型、13.9秒实录、提示词和验证记录。可复用制作与接入流程，商业英雄美术质量仍待提升。');
research=research.replace('</head>',`  <link rel="canonical" href="${site}">\n  <meta property="og:title" content="角色素材与游戏质感 · 赤霄实战研究">\n  <meta property="og:description" content="实现、实际效果与价值：可操作角色原型、实战录像、制作提示词与可复用接入流程。保留商业美术差距与下一轮方向。">\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="${site}">\n  <meta property="og:image" content="${site}${guide}">\n</head>`);
research=research.replace('<div class="download-grid">','<p id="publication" class="intro">公开版提供真实GLB、Godot完整可编辑工程包、网页源码和研究文件。最终75 MB Blender工作文件与138 MB本地完整交付包保留在本地；下方不提供这两个文件的下载。GLB可导入Blender，原始制作脚本为研发记录，依赖阶段输入，不能当作一键重建成品的承诺。</p><div class="download-grid">');
await fs.writeFile(path.join(destination,'research.html'),research);
await fs.writeFile(path.join(destination,'index.html'),research);
// The public index is the research; the identical original playable entry remains play.html.
const packageJson=JSON.parse(await fs.readFile(path.join(source,'package.json'),'utf8'));
await fs.writeFile(path.join(destination,'docs/local-package-reference.json'),JSON.stringify(packageJson,null,2)+'\n');
packageJson.scripts={dev:'node scripts/serve.mjs',build:'node scripts/build.mjs',test:'node --test tests/game-logic.test.mjs tests/warlord-demo.test.mjs tests/warlord-logic.test.mjs tests/warlord-secondary.test.mjs',verify:'node scripts/verify-publication.mjs && node scripts/verify-research.mjs && npm test','research:prompts':'node scripts/export-research-prompts.mjs'};
await fs.writeFile(path.join(destination,'package.json'),JSON.stringify(packageJson,null,2)+'\n');
await fs.copyFile(path.join(here,'verify-publication.mjs'),path.join(destination,'scripts/verify-publication.mjs'));
await fs.copyFile(path.join(here,'README.md'),path.join(destination,'README.md'));
await fs.writeFile(path.join(destination,'.gitattributes'),'* text=auto eol=lf\n*.png binary\n*.jpg binary\n*.glb binary\n*.blend binary\n*.fbx binary\n*.mp4 binary\n*.webm binary\n*.zip binary\n# Preserve third-party source and license formatting.\nvendor/** -whitespace\n**/LICENSE* -whitespace\n');
assert.equal(hash(await fs.readFile(path.join(source,guide))),guideHash,'Original generated guide identity');
assert.equal(hash(await fs.readFile(path.join(destination,guide))),guideHash,'Guide copied unchanged');
const manifest={published:'2026-11-21',evidenceDate:'2026-11-12',slug:'023-character-forge-lab',entry:'index.html',playable:'play.html',scope:'Published research, actual captured combat, editable runtime assets, web/native source and historical verification. Commercial hero art quality, native GPU and physical phone acceptance remain unverified.',guide:{path:guide,sourceSha256:guideHash,publishedSha256:guideHash,unchanged:true},localOnly:[{path:'assets/warlord/warlord.blend',bytes:75035038,reason:'Final authoring file retained locally; runtime GLB and complete Godot source kit are public.'},{path:'deliverables/chixiao-warlord-kit.zip',bytes:138278246,reason:'Complete local archive exceeds GitHub regular-file limit; public source tree and smaller native kit are linked instead.'}],files:[]};
async function index(relative=''){for(const entry of (await fs.readdir(path.join(destination,relative),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=path.posix.join(relative,entry.name);if(entry.isDirectory())await index(name);else if(name!=='publication-manifest.json'){const bytes=await fs.readFile(path.join(destination,name));manifest.files.push({path:name,bytes:bytes.length,sha256:hash(bytes)});}}}
await index();await fs.writeFile(path.join(destination,'publication-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await import('./update-index.mjs');
console.log(JSON.stringify({files:manifest.files.length,totalMB:(manifest.files.reduce((n,f)=>n+f.bytes,0)/1e6).toFixed(2),guideUnchanged:true,entry:site},null,2));
