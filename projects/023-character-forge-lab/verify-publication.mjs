import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
// This file is copied into the public project's scripts directory by publish.mjs.
const root=fileURLToPath(new URL('..',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await fs.readFile(path.join(root,'publication-manifest.json'),'utf8'));
const paths=new Set(manifest.files.map(f=>f.path));
assert.equal(paths.size,manifest.files.length,'Unique publication paths');
for(const file of manifest.files){
 assert(!file.path.startsWith('/')&&!file.path.split('/').includes('..'));
 const bytes=await fs.readFile(path.join(root,file.path));assert.equal(bytes.length,file.bytes,file.path+' size');assert.equal(hash(bytes),file.sha256,file.path+' hash');assert(bytes.length<100*1024*1024,'No oversized Git file');
}
assert.equal(manifest.guide.publishedSha256,'3233230c348cd00cfbded0b82eb4af09a90a5ce2426701878a2e2a4c36cb344d');
assert.equal(hash(await fs.readFile(path.join(root,manifest.guide.path))),manifest.guide.sourceSha256);
assert(!paths.has('assets/warlord/warlord.blend'));assert(!paths.has('deliverables/chixiao-warlord-kit.zip'));
let links=0;
const check=async(relative,url)=>{
 if(!url||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url))return;
 const target=decodeURIComponent(url.split(/[?#]/)[0]);if(!target)return;
 const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(relative),target));
 assert(paths.has(resolved)||resolved==='publication-manifest.json',`${relative} -> ${url}`);links++;
};
for(const relative of ['index.html','research.html','play.html','warlord.html','study.html','emberfall.html']){
 const html=await fs.readFile(path.join(root,relative),'utf8');
 for(const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g))await check(relative,match[1]);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,relative+' unique ids');
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),`${relative} missing #${id}`);
}
for(const relative of [...paths].filter(p=>/^src\/.*\.js$/.test(p))){
 const text=await fs.readFile(path.join(root,relative),'utf8');
 for(const [,url] of text.matchAll(/\b(?:from|import)\s*['"]([^'"]+)['"]/g))if(url.startsWith('.'))await check(relative,url);
 for(const [,url] of text.matchAll(/new URL\(['"]([^'"]+)['"],\s*import\.meta\.url\)/g))await check(relative,url);
}
const index=await fs.readFile(path.join(root,'index.html'),'utf8');
assert(index.includes('实现了什么')&&index.includes('实际效果')&&index.includes('带来什么价值'));
assert(index.includes('美术观感仍未达到商业吕布')&&index.includes('新整理、尚未执行'));
assert(index.includes('href="play.html"'));assert(index.includes('og:image'));
const {briefDefaults,prompts,history,sources}=await import(new URL('../src/research-content.js',import.meta.url));
const exported=JSON.parse(await fs.readFile(path.join(root,'docs/character-prompts.json'),'utf8'));
assert.deepEqual(exported.prompts,prompts);assert.deepEqual(exported.history,history);assert.deepEqual(exported.sources,sources);assert.deepEqual(exported.defaults,briefDefaults);
const glb=await fs.readFile(path.join(root,'assets/warlord/warlord.glb'));
assert.equal(hash(glb),'1f3fc19564ebfd7bf1ae8e9c27ed9f3e041c55bfde18f1c43f35e4bab2ea7838');
assert.equal(hash(await fs.readFile(path.join(root,'engine/warlord/assets/warlord.glb'))),hash(glb));
assert.equal(hash(await fs.readFile(path.join(root,'engine/Warlord-Godot-sourcekit.zip'))),'4bb8df84effb31b5371e049e921e7801709d735db684d79dbd567fddcf1271c8');
console.log(JSON.stringify({status:'passed',files:paths.size,staticLinks:links,pages:6,prompts:prompts.length,historicalExcerpts:history.length,sources:sources.length,guideUnchanged:true,assetIdentity:true,scope:'Publication integrity, real asset identity, static references and research claims. Not a new visual/art/GPU acceptance.'},null,2));
