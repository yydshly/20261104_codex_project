import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
import {parseGlb,accessorRows,sha256} from './verify-warlord.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const folder=path.resolve(root,process.argv.includes('--folder')?process.argv[process.argv.indexOf('--folder')+1]:'assets/warlord');
const high=parseGlb(await fs.readFile(path.join(folder,'warlord.glb'))), report=JSON.parse(await fs.readFile(path.join(folder,'optimization.json'),'utf8'));
const names=g=>g.document.skins[0].joints.map(i=>g.document.nodes[i].name);
const meshes=g=>new Map(g.document.nodes.filter(n=>n.mesh!==undefined).map(n=>[n.name,g.document.meshes[n.mesh]]));
const highMeshes=meshes(high),result=[];
assert.equal(sha256(high.bytes),report.runtime.sha256);
for(const entry of report.lods){
 const bytes=await fs.readFile(path.join(folder,entry.file)),lod=parseGlb(bytes),g=lod.document,lowMeshes=meshes(lod);
 assert.equal(sha256(bytes),entry.sha256);assert.deepEqual(names(lod),names(high));assert.equal(g.animations?.length||0,0);assert.equal(g.images?.length||0,0);
 assert.deepEqual([...lowMeshes.keys()].sort(),[...highMeshes.keys()].sort());let triangles=0,preserved=0;
 for(const [name,mesh] of lowMeshes)for(let i=0;i<mesh.primitives.length;i++){
   const p=mesh.primitives[i],positions=accessorRows(lod,p.attributes.POSITION),joints=accessorRows(lod,p.attributes.JOINTS_0),weights=accessorRows(lod,p.attributes.WEIGHTS_0),indices=accessorRows(lod,p.indices).flat();
   assert(indices.length%3===0);triangles+=indices.length/3;
   for(const v of positions)assert(v.every(Number.isFinite));for(const index of indices)assert(index>=0&&index<positions.length);
   for(let v=0;v<joints.length;v++){assert(joints[v].every(x=>Number.isInteger(x)&&x>=0&&x<names(lod).length));assert(Math.abs(weights[v].reduce((sum,x)=>sum+x,0)-1)<.002);}
   if(/Batch_(?:cloth|plume)/i.test(name)){
     const original=highMeshes.get(name).primitives[i];
     for(const semantic of ['POSITION','JOINTS_0','WEIGHTS_0'])assert.deepEqual(accessorRows(lod,p.attributes[semantic]),accessorRows(high,original.attributes[semantic]),`Collision-audited cloth ${name} ${semantic} is unchanged`);
     assert.deepEqual(indices,accessorRows(high,original.indices).flat());preserved++;
   }
 }
 assert.equal(triangles,entry.triangles);assert(triangles<report.runtime.triangles*(entry.level===1?.65:.4));
 result.push({level:entry.level,triangles,bytes:bytes.length,meshes:lowMeshes.size,preservedCollisionPrimitives:preserved,joints:names(lod).length});
}
console.log(JSON.stringify({status:'passed',sharedSkeletonAndMaterials:true,clothTopologyPreserved:true,lods:result},null,2));
