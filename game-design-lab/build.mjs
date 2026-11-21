import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const destination=new URL('../docs/014-game-design-lab/',import.meta.url);
const files=['style.css','play.css','chapter.css','data.js','art.js','engine.js','reference.js','play-engine.js','play-renderer.js','dungeon-view.js','card-art.js','game-room.js','app.js','favicon.svg'];
const assetNames=['characters-v2.png','environments-v2.png','machines-v2.png','farm-v2.png','reference-spire.jpg','reference-valley.jpg','reference-dungeon.jpg','reference-factory.jpg','reference-brothers.jpg'];
await mkdir(destination,{recursive:true});
await mkdir(new URL('assets/',destination),{recursive:true});
const allFiles=[...files,...assetNames.map(name=>'assets/'+name)];
for (const file of allFiles) {
  await copyFile(new URL(file,import.meta.url),new URL(file,destination));
  const [a,b]=await Promise.all([readFile(new URL(file,import.meta.url)),readFile(new URL(file,destination))]);
  if(createHash('sha256').update(a).digest('hex')!==createHash('sha256').update(b).digest('hex')) throw new Error(`Copy verification failed: ${file}`);
}
const [html,css,playCss,chapterCss,favicon,...modules]=await Promise.all(['legacy-index.html','style.css','play.css','chapter.css','favicon.svg','data.js','art.js','engine.js','reference.js','play-engine.js','play-renderer.js','dungeon-view.js','card-art.js','game-room.js','app.js'].map(f=>readFile(new URL(f,import.meta.url),'utf8')));
let script=modules.map(source=>source.replace(/^import\s+.*?;\s*$/gm,'').replace(/^export\s+/gm,'')).join('\n');
for(const name of assetNames){const bytes=await readFile(new URL('assets/'+name,import.meta.url));const data=`data:image/${name.endsWith('.png')?'png':'jpeg'};base64,${bytes.toString('base64')}`;script=script.split('./assets/'+name).join(data);}
const offline=html
  .replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css.replace(/<\/style/gi,'<\\/style')}</style>`)
  .replace('<link rel="stylesheet" href="./play.css">',()=>`<style>${playCss.replace(/<\/style/gi,'<\\/style')}</style>`)
  .replace('<link rel="stylesheet" href="./chapter.css">',()=>`<style>${chapterCss.replace(/<\/style/gi,'<\\/style')}</style>`)
  .replace('<link rel="icon" href="./favicon.svg" type="image/svg+xml">',()=>`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}" type="image/svg+xml">`)
  .replace('<script type="module" src="./app.js"></script>','')
  .replace('</body>',()=>`<script type="module">${script.replace(/<\/script/gi,'<\\/script')}</script>\n</body>`);
await writeFile(new URL('research.html',import.meta.url),offline);
await writeFile(new URL('research.html',destination),offline);
await import('./iron-company/build.mjs');
await import('./summary/build.mjs');
console.log(`Archive: ${allFiles.length} verified files and research.html. Main entry now opens the five-game design summary.`);
