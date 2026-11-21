import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),src=path.join(root,'visual-business-atlas'),dest=path.join(root,'docs/022-visual-business-atlas');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest={published:'2026-11-21',slug:'022-visual-business-atlas',scope:'Static research, simulated cases, actual assets and Windows trial downloads. Native GUI acceptance and commercial outcomes remain unverified.',guide:{},files:[]};
function sanitize(value){if(Array.isArray(value))return value.map(sanitize);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['generatedPath','output_hint'].includes(k)).map(([k,v])=>[k,sanitize(v)]));if(typeof value==='string'&&/^[A-Za-z]:[\\/]/.test(value))return '[local path omitted]';return value;}
async function copy(relative){const from=path.join(src,relative),to=path.join(dest,relative);let bytes=await fs.readFile(from);if(relative.endsWith('.json'))bytes=Buffer.from(JSON.stringify(sanitize(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''))),null,2)+'\n');if(/\.(html|css|js|md|txt|json)$/.test(relative))bytes=Buffer.from(bytes.toString('utf8').replace(/\r\n?/g,'\n'));await fs.mkdir(path.dirname(to),{recursive:true});await fs.writeFile(to,bytes);manifest.files.push({path:relative.split(path.sep).join('/'),bytes:bytes.length,sha256:hash(bytes)});}
await fs.mkdir(dest,{recursive:true});
await fs.writeFile(path.join(dest,'.gitattributes'),'* text=auto eol=lf\n');
for(const name of await fs.readdir(src))if(/\.(html|css|js|md)$/.test(name))await copy(name);
for(const dir of await fs.readdir(path.join(src,'assets'))){
  if(dir==='downloads')continue;
  async function walk(relative){for(const e of await fs.readdir(path.join(src,relative),{withFileTypes:true})){const r=path.join(relative,e.name);if(e.isDirectory())await walk(r);else await copy(r);}}
  await walk(path.join('assets',dir));
}
const release=JSON.parse(await fs.readFile(path.join(src,'assets/downloads/pet-release.json'),'utf8'));
for(const name of [release.zip,release.sourceZip,'pet-release.json'])await copy('assets/downloads/'+name);
for(const name of ['WhiteCatPet.cs','app.manifest','build.ps1','cat.ico','pet-behavior.json','使用说明.txt']){await fs.mkdir(path.join(here,'windows-pet'),{recursive:true});await fs.copyFile(path.join(src,'windows-pet',name),path.join(here,'windows-pet',name));}
const guide='assets/overview/character-products-overview.png',original=await fs.readFile(path.join(src,guide)),published=await fs.readFile(path.join(dest,guide));if(!original.equals(published))throw Error('Guide image changed');manifest.guide={path:guide,sourceSha256:hash(original),publishedSha256:hash(published),unchanged:true};
await fs.writeFile(path.join(dest,'publication-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({directory:dest,files:manifest.files.length,totalMB:(manifest.files.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1),guideUnchanged:true}));
