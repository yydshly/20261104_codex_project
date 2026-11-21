import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Script} from 'node:vm';
import {renderPage} from './page.mjs';
const root=new URL('../',import.meta.url), destination=new URL('../../docs/014-game-design-lab/',import.meta.url);
execFileSync('python',[new URL('render-poster.py',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')],{stdio:'inherit'});
await copyFile(new URL('../../projects/014-game-design-lab/assets/grey-banner/battle-mid.png',import.meta.url),new URL('assets/experiment-brothers.png',root));
const data=JSON.parse(await readFile(new URL('content.json',import.meta.url),'utf8'));
const html=renderPage(data);
const css=await readFile(new URL('summary.css',import.meta.url),'utf8');
const js=await readFile(new URL('app.js',import.meta.url),'utf8');
const names=[...data.games.map(g=>g.image),'design-map.png','design-map.svg','experiment-brothers.png'];
const assets={};
for(const name of names){
  const bytes=await readFile(new URL('assets/'+name,root));
  const mime=name.endsWith('.jpg')?'image/jpeg':name.endsWith('.svg')?'image/svg+xml':'image/png';
  assets[name]=`data:${mime};base64,${bytes.toString('base64')}`;
  await copyFile(new URL('assets/'+name,root),new URL('assets/'+name,destination));
}
const offline=html.replace('<link rel="stylesheet" href="./summary/summary.css">',()=>`<style>${css}</style>`)
  .replace('<script src="./summary/app.js" defer></script>','')
  .replace('href="./favicon.svg"',`href="data:image/svg+xml,${encodeURIComponent(await readFile(new URL('favicon.svg',root),'utf8'))}"`)
  .replace(/src="\.\/assets\/([^"]+)"/g,(_,name)=>`src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-inline-asset="${name}"`)
  .replace(/href="\.\/assets\/([^"]+)"/g,(_,name)=>`href="#" data-inline-href="${name}"`)
  .replace('</body>',()=>`<script type="application/json" id="summary-assets">${JSON.stringify(assets)}</script><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
new Script(offline.split('<script>')[1].split('</script>')[0],{filename:'offline-summary.js'});
for(const base of [root,destination]){
  await mkdir(new URL('summary/',base),{recursive:true});
  await writeFile(new URL('index.html',base),html);
  await writeFile(new URL('offline.html',base),offline);
}
for(const name of ['summary.css','app.js','content.json'])await copyFile(new URL(name,import.meta.url),new URL('summary/'+name,destination));
console.log('Design summary: new primary index + standalone offline page + PNG/SVG overview. Experiments preserved in research.html and iron-company/.');
