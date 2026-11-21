import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('.',import.meta.url),target=new URL('../../docs/014-game-design-lab/iron-company/',root);
const modules=['model.js','render.js','icons.js','app.js'],files=['index.html','style.css',...modules],images=['warband.png','alternates.png','terrain.png','props.png'];
let html=await readFile(new URL('index.html',root),'utf8'),css=await readFile(new URL('style.css',root),'utf8'),js=(await Promise.all(modules.map(name=>readFile(new URL(name,root),'utf8')))).map(s=>s.replace(/^import\s+.*?;\s*$/gm,'').replace(/^export\s+/gm,'')).join('\n');
for(const name of images){const bytes=await readFile(new URL('assets/'+name,root)),uri=`data:image/png;base64,${bytes.toString('base64')}`;css=css.split('./assets/'+name).join(uri);js=js.split('./assets/'+name).join(uri);}
html=html.replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="./app.js"></script>','').replace('</body>',()=>`<script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
await writeFile(new URL('offline.html',root),html);await mkdir(new URL('assets/',target),{recursive:true});
const manifest=[];for(const name of [...files,'offline.html',...images.map(n=>'assets/'+n)]){await copyFile(new URL(name,root),new URL(name,target));const a=await readFile(new URL(name,root)),b=await readFile(new URL(name,target));const hash=createHash('sha256').update(a).digest('hex');if(hash!==createHash('sha256').update(b).digest('hex'))throw Error('Copy mismatch: '+name);manifest.push({file:name,sha256:hash});}
await writeFile(new URL('build-manifest.json',root),JSON.stringify({files:manifest,bytes:Buffer.byteLength(html),published:false},null,2));console.log(`Built Grey Banner: ${manifest.length} verified files, ${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MiB standalone.`);
