import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const project=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(project,'../../docs/030-warm-home-space');
const manifest=JSON.parse(await fs.readFile(path.join(root,'publication-manifest.json'),'utf8'));
const errors=[],hash=data=>createHash('sha256').update(data).digest('hex');
let references=0;
const exists=async p=>{try{return (await fs.stat(p)).isFile();}catch{return false;}};
for(const entry of manifest.files){
  const file=path.join(root,entry.path),bytes=await fs.readFile(file);
  if(bytes.length!==entry.bytes||hash(bytes)!==entry.sha256)errors.push('Manifest mismatch: '+entry.path);
  if(bytes.length>95*1024*1024)errors.push('Oversized file: '+entry.path);
  if(entry.path.endsWith('.gltf')){
    const gltf=JSON.parse(bytes);
    for(const item of [...(gltf.buffers??[]),...(gltf.images??[])]){
      if(!item.uri||item.uri.startsWith('data:'))continue;references++;
      if(!await exists(path.resolve(path.dirname(file),item.uri)))errors.push('glTF resource missing: '+entry.path+' → '+item.uri);
    }
  }
}
const guide=await fs.readFile(path.join(root,manifest.guide.path));
if(hash(guide)!==manifest.guide.sourceSha256||!manifest.guide.unchanged)errors.push('Existing guide image changed');
const output=path.join(root,'verification/publication-check.json');await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,'{}\n');
for(const name of ['index.html','demo/index.html']){
  const text=await fs.readFile(path.join(root,name),'utf8');
  for(const match of text.matchAll(/(?:href|src)="([^"<>]+)"/g)){
    const url=match[1];if(/^(https?:|data:|mailto:|#)/.test(url))continue;
    const relative=url.split(/[?#]/)[0];if(!relative)continue;
    let file=path.resolve(root,path.dirname(name),relative);if(relative.endsWith('/'))file=path.join(file,'index.html');references++;
    if(!await exists(file))errors.push('HTML resource missing: '+name+' → '+url);
  }
  if(/(?:href|src)="(?:file:|[A-Za-z]:[\\/])/.test(text))errors.push('Local file link in '+name);
}
for(const module of manifest.runtimeModules){
  const file=path.join(root,'demo',module),text=await fs.readFile(file,'utf8');
  for(const match of text.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"]+\.js)['"]/g)){
    references++;if(!await exists(path.resolve(path.dirname(file),match[1])))errors.push('Module missing: '+module+' → '+match[1]);
  }
  for(const match of text.matchAll(/['"](assets\/[^'"`$]+\.(?:png|jpg|hdr|glb|gltf|json))['"]/g)){
    references++;if(!await exists(path.join(root,'demo',match[1])))errors.push('Literal asset missing: '+module+' → '+match[1]);
  }
}
const research=await fs.readFile(path.join(root,'index.html'),'utf8');
for(const phrase of ['8轮','41次','23项','尚未提供','不同户型','标准素材库','模型权重','人工修正','参数化','相同像素预算']){
  if(!research.includes(phrase))errors.push('Research coverage missing: '+phrase);
}
if(!research.includes('没有测量商业收入')&&!research.includes('没有测量')&&!research.includes('尚未测量'))errors.push('Value boundary missing');
const result={checkedAt:new Date().toISOString(),files:manifest.files.length,megabytes:+(manifest.files.reduce((n,f)=>n+f.bytes,0)/1048576).toFixed(1),runtimeModules:manifest.runtimeModules.length,references,guideSha256:hash(guide),guideUnchanged:hash(guide)===manifest.guide.sourceSha256,errors};
await fs.writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
