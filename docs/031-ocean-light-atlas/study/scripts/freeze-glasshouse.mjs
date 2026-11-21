import { createHash } from 'node:crypto';
import { readFile,writeFile,copyFile,mkdir,readdir,rename,stat } from 'node:fs/promises';
import { dirname,resolve,relative,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),glass=resolve(root,'glasshouse');
const id='4.3-20261115',releases=resolve(glass,'releases'),target=resolve(releases,id),registryPath=resolve(glass,'releases.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function child(base,path){const out=resolve(base,path);assert(out.startsWith(base+sep),`Path escapes ${base}: ${path}`);return out;}
async function exists(path){try{await stat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function verify(){
 const registry=JSON.parse(await readFile(registryPath,'utf8')),entry=registry.entries.find(e=>e.id===id);assert(entry,'Fixed version must be registered');
 const bytes=await readFile(child(target,'release.json'));assert.equal(sha(bytes),entry.manifestSha256,'Fixed manifest changed');
 const release=JSON.parse(bytes);let total=0;
 for(const f of release.files){const b=await readFile(child(target,f.path));assert.equal(b.length,f.bytes,f.path);assert.equal(sha(b),f.sha256,`Fixed file changed: ${f.path}`);total+=b.length;}
 const listed=release.files.map(f=>f.path).sort(),actual=[];
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){assert(!e.isSymbolicLink(),'No links in a fixed runtime');const p=child(dir,e.name);if(e.isDirectory())await walk(p);else actual.push(relative(target,p).split(sep).join('/'));}}
 await walk(target);assert.deepEqual(actual.filter(p=>p!=='release.json').sort(),listed,'Unlisted or missing files in fixed directory');assert.equal(total,release.totalBytes);
 console.log(JSON.stringify({result:'passed',id,files:release.files.length,bytes:total,manifestSha256:entry.manifestSha256}));
}
if(await exists(target)){await verify();process.exit(0);}
assert(!process.argv.includes('--verify'),'Fixed version not found; create it once before verification');
await mkdir(releases,{recursive:true});const staging=child(releases,`.${id}-staging-${process.pid}`);await mkdir(staging);
const records=[];
async function put(path,bytes,kind,source){const dest=child(staging,path);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,bytes,{flag:'wx'});records.push({path,kind,bytes:Buffer.byteLength(bytes),sha256:sha(bytes),...(source?{source}: {})});}
async function copy(path,dest=path,kind='runtime'){const bytes=await readFile(child(glass,path));await put(dest,bytes,kind,`glasshouse/${path}`);}
for(const f of ['scene.bundle.js','scene.css','guide.css','hero-study.css','facial.css','seaside.css','THREE-LICENSE.txt'])await copy(f);
for(const f of ['personal-guide-hands43.glb','manifest-hands43.json','speech/terrace-intro.json','speech/terrace-intro.wav'])await copy('assets/personal-guide/'+f);
for(const f of ['manifest.json','ocean-surf.ogg','wind.ogg','surf-texture43.ogg','surf-texture43.json'])await copy('assets/ambience/'+f);
await copy('assets/rocket-guide/LICENSE.txt');await copy('character/reference.png');
await put('favicon.svg',await readFile(child(root,'favicon.svg')),'runtime','favicon.svg');
// Keep source beside the runtime, without changing the reviewed bundle bytes.
for(const f of await readdir(glass))if(f.endsWith('.js')&&f!=='scene.bundle.js')await copy(f,'source/'+f,'source');
await copy('build.mjs','source/build.mjs','source');
await put('source/package.json',JSON.stringify({private:true,type:'module',scripts:{build:'node build.mjs'},dependencies:{three:'0.187.0'},devDependencies:{esbuild:'0.25.12'}},null,2)+'\n','source');
await put('entry.js',`// Pin this runtime to the reviewed 0597 4.3 variant.\nconst url=new URL(location.href);\nfor(const key of ['hero','study','review','legacy'])url.searchParams.delete(key);\nurl.searchParams.set('seaside','1');url.searchParams.set('detail','hands43');\nhistory.replaceState(null,'',url);\nawait import('./scene.bundle.js');\n`,'runtime');
let html=await readFile(child(glass,'index.html'),'utf8');
html=html.replace('src="./scene.bundle.js"','src="./entry.js"').replace('<title>傍晚海边玻璃屋 · 海的切片</title>','<title>玻璃屋4.3固定版 · 海的切片</title>').replaceAll('href="../favicon.svg"','href="./favicon.svg"').replaceAll('href="../index.html"','href="../../../index.html"');
for(const page of ['facial-review.html','stairs-review.html','seaside-review.html','implementation.html'])html=html.replaceAll(`href="./${page}`,`href="../../${page}`);
html=html.replaceAll('href="./character/README.md"','href="../../implementation.html#resources"');
await put('index.html',html,'runtime','glasshouse/index.html (entry and documentation links adjusted only)');
const model=JSON.parse(await readFile(child(glass,'assets/personal-guide/manifest-hands43.json'),'utf8'));
await put('assets/personal-guide/README.md',`# 0597 / 4.3 fixed runtime\n\nOwn 0597 head, hairstyle, glasses and main body/clothes. Local hand surfaces from Microsoft/Rocketbox adult10 (MIT), cuffs repaired. No donor head geometry.\n\n80 joints, 5 body clips, 21 face morphs. Model SHA-256: ${model.sha256}. Seating, stairs and audio require this website runtime; no independent finger performance or outfit switching.\n\nUser-provided appearance terms are independent of the hand/motion MIT license. See ../rocket-guide/LICENSE.txt and ../../README.md.\n`,'documentation');
await put('README.md',`# Glasshouse 4.3 / 2026-11-15\n\nFixed runtime: index.html. In the main project open /glasshouse/releases/${id}/index.html using node server.mjs from the project root. All automatic runtime requests stay inside this directory; history, editable Blender projects and evidence links remain in the main project.\n\nVerify from the main project: npm run verify:baseline. The release.json hashes all fixed files; glasshouse/releases.json additionally records the manifest hash. Existing fixed versions are verified, never overwritten by the freeze script.\n\nThe scene.bundle.js is copied byte-for-byte from reviewed 4.3. This folder contains the active 0597 GLB, speech timing/audio, ambience, CSS, licenses and matching JS source under source/. Original four-person GLB, Blender projects, historical candidate models, screenshots/videos and the 20-effect research library remain in the main project; they are not runtime dependencies and are not duplicated here.\n\nRebuild only a separate development copy. In that copy's source directory, install three 0.187.0 and esbuild 0.25.12, then npm run build. Move the resulting bundle to the development runtime root so its relative assets resolve correctly. Preview of the fixed bundle needs no package install or cloud service. Do not build over this fixed directory.\n\nScope: one fitted character, five fitted seats, scene-specific stairs/collision, approximate mouth timing and nearshore wave-group/audio coupling. No arbitrary character/seat support, free dialogue, outfit switching, cloth physics or individual-wave acoustic simulation.\n`,'documentation');
const release={id,version:'4.3',frozenOn:'2026-11-15',status:'fixed-reference',entry:'index.html',character:{file:model.file,sha256:model.sha256,bones:model.bones,bodyClips:5,facialShapes:21},environment:{fittedSeats:5,moods:['gold','rose','blue']},runtimeDependencies:'All automatically requested files are inside this fixed directory; documentation/history links use the main project.',policy:'Do not overwrite. Future characters and scenes get separate asset directories and releases.',dependencies:{three:'0.187.0',esbuild:'0.25.12'},totalBytes:records.reduce((n,f)=>n+f.bytes,0),files:records.sort((a,b)=>a.path.localeCompare(b.path))};
const manifestBytes=Buffer.from(JSON.stringify(release,null,2)+'\n');await writeFile(child(staging,'release.json'),manifestBytes,{flag:'wx'});
// Both resolved paths were checked inside this project's release directory.
assert(staging.startsWith(releases+sep)&&target.startsWith(releases+sep));await rename(staging,target);
const registry=await exists(registryPath)?JSON.parse(await readFile(registryPath,'utf8')):{entries:[]};assert(!registry.entries.some(x=>x.id===id));registry.entries.push({id,entry:`./releases/${id}/index.html`,manifest:`./releases/${id}/release.json`,manifestSha256:sha(manifestBytes)});await writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');
await verify();
