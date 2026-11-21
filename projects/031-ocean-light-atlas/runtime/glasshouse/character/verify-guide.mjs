import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const required=['Idle','Walk','Wave','Point','SitDown','SitIdle','StandUp'];
const componentSize={5121:1,5123:2,5125:4,5126:4};
const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const reports=[];
for(const id of ['hoodie','linen','knit']){
  const bytes=await readFile(resolve(root,`assets/guide/guide-${id}.glb`));
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length).toString()),binary=bytes.subarray(28+length);
  function read(index){
    const a=json.accessors[index],view=json.bufferViews[a.bufferView],n=width[a.type],size=componentSize[a.componentType],stride=view.byteStride||n*size;
    const values=[];
    for(let i=0;i<a.count;i++)for(let c=0;c<n;c++){
      const offset=(view.byteOffset||0)+(a.byteOffset||0)+i*stride+c*size;
      let value=a.componentType===5126?binary.readFloatLE(offset):a.componentType===5125?binary.readUInt32LE(offset):a.componentType===5123?binary.readUInt16LE(offset):binary.readUInt8(offset);
      if(a.normalized)value/=a.componentType===5123?65535:255;
      assert(Number.isFinite(value));values.push(value);
    }return {values,count:a.count,width:n};
  }
  const names=json.animations.map(a=>a.name.split('|').pop());assert.deepEqual([...names].sort(),[...required].sort());
  let meshes=0,vertices=0,triangles=0,maxWeightError=0;
  for(const node of json.nodes){
    if(node.mesh===undefined)continue;meshes++;
    assert.equal(node.extras?.role,'character');assert(['shared',id].includes(node.extras.outfit));
    assert.notEqual(node.skin,undefined,'Every guide mesh should be bound to the same rig');
    const joints=json.skins[node.skin].joints;assert(joints.length>=60);
    const bind=read(json.skins[node.skin].inverseBindMatrices);assert.equal(bind.count,joints.length);
    for(const p of json.meshes[node.mesh].primitives){
      const positions=read(p.attributes.POSITION),skin=read(p.attributes.JOINTS_0),weights=read(p.attributes.WEIGHTS_0);
      vertices+=positions.count;triangles+=(p.indices===undefined?positions.count:json.accessors[p.indices].count)/3;
      assert.equal(skin.count,positions.count);assert.equal(weights.count,positions.count);
      for(const j of skin.values)assert(j>=0&&j<joints.length);
      for(let i=0;i<weights.count;i++){
        const sum=weights.values.slice(i*4,i*4+4).reduce((a,b)=>a+b,0);maxWeightError=Math.max(maxWeightError,Math.abs(1-sum));assert(Math.abs(1-sum)<.001);
      }
    }
  }
  const animations=json.animations.map(a=>({name:a.name,duration:Math.max(...a.samplers.map(s=>Math.max(...read(s.input).values)))}));
  for(const a of animations)assert(a.duration>=1);
  reports.push({outfit:id,bytes:bytes.length,bones:json.skins[0].joints.length,meshes,vertices,triangles,maxWeightError,animations});
}
await writeFile(resolve(root,'assets/guide/validation.json'),JSON.stringify({format:'glTF 2.0 binary',checks:'Finite geometry, valid inverse bind matrices, normalized weights, valid joints, outfit isolation, seven clips',reports},null,2));
console.log(JSON.stringify(reports.map(({outfit,bytes,bones,meshes,triangles,maxWeightError})=>({outfit,bytes,bones,meshes,triangles,maxWeightError})),null,2));
