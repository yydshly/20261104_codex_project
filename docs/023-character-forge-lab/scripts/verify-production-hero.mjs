import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const out=fileURLToPath(new URL('../assets/game/',import.meta.url));
const b=await fs.readFile(path.join(out,'hero.glb'));
assert.equal(b.toString('utf8',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);
const length=b.readUInt32LE(12),start=length+28;
const g=JSON.parse(b.toString('utf8',20,20+length));
const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const byteSize={5121:1,5123:2,5125:4,5126:4},read={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'};
function data(i){const a=g.accessors[i],v=g.bufferViews[a.bufferView],n=components[a.type],size=byteSize[a.componentType];assert(n&&size);const s=start+(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||n*size;return Array.from({length:a.count},(_,i)=>Array.from({length:n},(_,j)=>b[read[a.componentType]](s+i*stride+j*size)));}
const required=['Idle','Walk','Run','Attack1','Attack2','Attack3','Block','BlockHit','Hit','Death','Dodge','Victory'];
for(const name of required)assert(g.animations.some(a=>a.name===name),name);
assert.equal(g.skins.length,1);assert.equal(g.skins[0].joints.length,41);
assert(g.images.every(i=>i.bufferView!==undefined),'Textures must be embedded');
let weightedVertices=0,triangles=0;
for(const n of g.nodes.filter(n=>n.mesh!==undefined))for(const p of g.meshes[n.mesh].primitives){
 triangles+=(p.indices===undefined?g.accessors[p.attributes.POSITION].count:g.accessors[p.indices].count)/3;
 if(n.skin===undefined)continue;
 const weights=data(p.attributes.WEIGHTS_0),joints=data(p.attributes.JOINTS_0);
 weights.forEach((v,i)=>{assert(Math.abs(v.reduce((a,b)=>a+b,0)-1)<.0001,'Normalized weights');assert(joints[i].every(j=>j>=0&&j<41),'Valid joint indices');weightedVertices++;});
}
assert.equal(triangles,5274);
const motion=[];
for(const a of g.animations){
 let varying=0;
 for(const s of a.samplers){const t=data(s.input).flat(),v=data(s.output);assert(t.every((x,i)=>i===0||x>t[i-1]),'Increasing animation time');assert(v.flat().every(Number.isFinite));if(v.some(row=>row.some((x,i)=>Math.abs(x-v[0][i])>.00001)))varying++;}
 assert(varying>1,`${a.name} changes joints`);
 for(const c of a.channels.filter(c=>c.target.path==='translation'&&g.nodes[c.target.node].name==='root')){const v=data(a.samplers[c.sampler].output);assert(v.every(row=>Math.abs(row[0]-v[0][0])<.000001&&Math.abs(row[2]-v[0][2])<.000001),'In-place planar root');}
 motion.push({name:a.name,varyingChannels:varying});
}
const files=[];
for(const name of ['hero.glb','hero.blend','hero.fbx','original.glb','LICENSE-KayKit.txt','character.json']){const bytes=await fs.readFile(path.join(out,name));assert(bytes.length>100);files.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
const report={status:'passed',triangles,bones:41,weightedVertices,embeddedImages:g.images.length,animations:motion,files};
await fs.writeFile(path.join(out,'asset-validation.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
