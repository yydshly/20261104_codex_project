import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const folder=new URL('../glasshouse/assets/personal-guide/',import.meta.url);
function parse(bytes){const length=bytes.readUInt32LE(12);return {gltf:JSON.parse(bytes.subarray(20,20+length)),bin:bytes.subarray(28+length)};}
function headPoints(asset){
 const out=new Set();
 for(const mesh of asset.gltf.meshes)for(const p of mesh.primitives){
  const a=asset.gltf.accessors[p.attributes.POSITION],v=asset.gltf.bufferViews[a.bufferView],start=(a.byteOffset||0)+(v.byteOffset||0),stride=v.byteStride||12;
  for(let i=0;i<a.count;i++){const at=start+i*stride,x=asset.bin.readFloatLE(at),y=asset.bin.readFloatLE(at+4),z=asset.bin.readFloatLE(at+8);if(y>1.4)out.add([x,y,z].map(n=>Math.round(n*1e6)).join(','));}
 }
 return [...out].sort();
}
test('local hand asset retains own accepted head, face shapes and rig; original facial asset is preserved',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest-hands43.json',folder),'utf8')),bytes=await readFile(new URL(manifest.file,folder)),oldBytes=await readFile(new URL('personal-guide-facial.glb',folder));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);assert.equal(createHash('sha256').update(oldBytes).digest('hex'),manifest.hands.sourceFaceSha256);
 const next=parse(bytes),old=parse(oldBytes);assert.deepEqual(headPoints(next),headPoints(old),'actual exported head points must be identical, not just a provenance label');
 assert.equal(next.gltf.skins[0].joints.length,80);assert.deepEqual(next.gltf.meshes[0].extras.targetNames,old.gltf.meshes[0].extras.targetNames);assert.equal(next.gltf.meshes[0].extras.targetNames.length,21);
 assert.equal(manifest.hands.retainedOriginalVertices+manifest.hands.removedOriginalVertices,manifest.hands.originalSourceVertices);assert.equal(manifest.hands.maxRetainedShapePositionError,0);
 assert(manifest.hands.records.every(r=>r.vertices>2000));assert.equal(manifest.hands.independentFingerAnimation,false);assert.match(manifest.hands.source,/hand surfaces only/);
 assert(next.gltf.materials.some(m=>m.name.startsWith('Hand43 anatomical skin')));assert.match(manifest.facial.identity,/No donor face geometry/);
});
