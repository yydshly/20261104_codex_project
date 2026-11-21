import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const root=new URL('./assets/v11/',import.meta.url);
const inventory=JSON.parse(await fs.readFile(new URL('inventory.json',root),'utf8'));
for(const model of inventory)test(model.id+' has valid geometry, alpha foliage and matching wind anchors',async()=>{
  const gltf=JSON.parse(await fs.readFile(new URL(model.id+'.gltf',root),'utf8'));
  const bytes=await fs.readFile(new URL(gltf.buffers[0].uri,root));
  const read=id=>{const a=gltf.accessors[id],v=gltf.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],Type=a.componentType===5126?Float32Array:Uint32Array;return new Type(bytes.buffer,bytes.byteOffset+(v.byteOffset??0)+(a.byteOffset??0),a.count*size);};
  let radius=0,minY=Infinity,maxY=-Infinity;
  for(const p of gltf.meshes[0].primitives){
    const positions=read(p.attributes.POSITION),normals=read(p.attributes.NORMAL),anchors=read(p.attributes._WIND),indices=read(p.indices),count=positions.length/3;
    assert.equal(anchors.length,count*4);assert.equal(normals.length,count*3);
    for(const index of indices)assert.ok(index<count,'index overflow');
    for(let i=0;i<count;i++){
      const x=positions[i*3],y=positions[i*3+1],z=positions[i*3+2];assert.ok(Number.isFinite(x+y+z));
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);radius=Math.max(radius,Math.hypot(x,z));
      assert.ok(anchors[i*4+3]>=0&&anchors[i*4+3]<=1);assert.ok(Math.hypot(...normals.subarray(i*3,i*3+3))>.9);
    }
  }
  assert.ok(Math.abs(minY)<1e-5&&Math.abs(maxY-1)<1e-5,'model must sit on its supporting plane');
  assert.ok(Math.abs(radius*2-model.crownDiameter)<1e-5,'crown clearance must match geometry');
  assert.equal(gltf.materials[1].alphaMode,'MASK');
  const png=await fs.readFile(new URL(gltf.images[1].uri,root));assert.ok(png.includes(Buffer.from('tRNS')),'leaf PNG must retain its cutout mask');
});
