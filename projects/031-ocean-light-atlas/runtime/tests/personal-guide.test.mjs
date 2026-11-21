import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const folder=new URL('../glasshouse/assets/personal-guide/',import.meta.url);
test('personal character preserves provenance and exports a usable weighted animated skin',async()=>{
  const manifest=JSON.parse(await readFile(new URL(process.env.SEA_PERSONAL_MANIFEST||'manifest.json',folder),'utf8'));
  const bytes=await readFile(new URL(manifest.file,folder));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length)),binary=bytes.subarray(28+length);
  assert.equal(gltf.meshes.length,1);assert.equal(gltf.skins.length,1);assert.equal(gltf.skins[0].joints.length,80);
  assert.deepEqual(gltf.animations.map(a=>a.name).sort(),['Idle','LookAround','Point','Walk','Wave']);
  const skin=gltf.skins[0];assert(skin.joints.some(i=>gltf.nodes[i].name==='Bip01 Head'));
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5123:2,5125:4,5126:4};
  function values(index){
    const a=gltf.accessors[index],v=gltf.bufferViews[a.bufferView],size=sizes[a.componentType],width=widths[a.type],stride=v.byteStride||size*width;
    const out=[];for(let i=0;i<a.count;i++)for(let c=0;c<width;c++){
      const at=(v.byteOffset||0)+(a.byteOffset||0)+i*stride+c*size;
      let value=a.componentType===5126?binary.readFloatLE(at):a.componentType===5125?binary.readUInt32LE(at):a.componentType===5123?binary.readUInt16LE(at):binary.readUInt8(at);
      if(a.normalized)value/=a.componentType===5123?65535:255;assert(Number.isFinite(value));out.push(value);
    }return out;
  }
  let triangles=0;
  for(const primitive of gltf.meshes[0].primitives){
    const positions=values(primitive.attributes.POSITION),weights=values(primitive.attributes.WEIGHTS_0),joints=values(primitive.attributes.JOINTS_0);
    assert.equal(weights.length,positions.length/3*4);assert.equal(joints.length,weights.length);assert.notEqual(primitive.attributes.TEXCOORD_0,undefined);
    for(let i=0;i<weights.length;i+=4)assert(Math.abs(weights.slice(i,i+4).reduce((a,b)=>a+b)-1)<.0001);
    assert(joints.every(i=>i>=0&&i<skin.joints.length));
    const indices=values(primitive.indices);assert(indices.every(i=>i<positions.length/3));triangles+=indices.length/3;
  }
  assert.equal(triangles,manifest.triangles);assert(triangles<150000,'single-person web density budget');
  for(const clip of gltf.animations)for(const sampler of clip.samplers){
    const times=values(sampler.input);assert(times.at(-1)>1);assert(times.every((t,i)=>!i||t>times[i-1]));values(sampler.output);
  }
  for(const image of gltf.images){const v=gltf.bufferViews[image.bufferView],at=v.byteOffset||0;assert(image.mimeType==='image/png'?binary.readUInt32BE(at)===0x89504e47:binary.readUInt16BE(at)===0xffd8,'embedded image format must match its MIME');}
  const original=JSON.parse(await readFile(new URL('../user-model-0597/manifest.json',folder),'utf8'));
  assert.equal(original.sha256,'bde0c12688b20e7bf197fea13122186a16f9bb0c15484eee28e0a66fd63b709e');
  assert.equal(original.bones,0);assert.equal(manifest.motionLicense,'MIT');assert.match(manifest.modelLicense,/User-provided/);
});
