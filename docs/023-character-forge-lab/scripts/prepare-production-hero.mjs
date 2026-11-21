import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as THREE from '../vendor/three/three.module.js';

const root = fileURLToPath(new URL('..',import.meta.url));
const out = path.join(root,'assets/game');
const original = path.join(out,'original.glb');
try { await fs.access(original); } catch { await fs.rename(path.join(out,'source/Knight.glb'),original); }
const source = await fs.readFile(original);
const jsonLength=source.readUInt32LE(12), binStart=jsonLength+28;
const gltf=JSON.parse(source.toString('utf8',20,20+jsonLength));
const bin=Buffer.from(source.subarray(binStart));
const mapping={
  Idle:'Idle',Walking_A:'Walk',Running_A:'Run',
  '1H_Melee_Attack_Chop':'Attack1',
  '1H_Melee_Attack_Slice_Diagonal':'Attack2',
  '1H_Melee_Attack_Slice_Horizontal':'Attack3',
  Blocking:'Block',Block_Hit:'BlockHit',Hit_A:'Hit',Death_A:'Death',
  Dodge_Forward:'Dodge',Dodge_Backward:'DodgeBack',Cheer:'Victory',
  Jump_Start:'JumpStart',Jump_Idle:'JumpIdle',Jump_Land:'JumpLand',
};
const selected=gltf.animations.filter(a=>mapping[a.name]);
const rootMotionReport=[];
function vectors(index){
  const a=gltf.accessors[index],v=gltf.bufferViews[a.bufferView];
  const start=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||12;
  return {a,v,start,stride,values:Array.from({length:a.count},(_,i)=>[0,1,2].map(k=>bin.readFloatLE(start+i*stride+k*4)))};
}
for(const a of selected){
  for(const c of a.channels.filter(c=>c.target.path==='translation')){
    const name=gltf.nodes[c.target.node].name;
    if(name!=='root' && !(a.name.startsWith('Dodge_')&&name==='hips'))continue;
    const data=vectors(a.samplers[c.sampler].output),first=data.values[0],last=data.values.at(-1);
    rootMotionReport.push({clip:mapping[a.name],node:name,originalPlanarEnd:[last[0]-first[0],last[2]-first[2]]});
    for(let i=0;i<data.a.count;i++)for(const k of [0,2]){
      const value=name==='root'?first[k]:data.values[i][k]-(last[k]-first[k])*i/Math.max(1,data.a.count-1);
      bin.writeFloatLE(value,data.start+i*data.stride+k*4);
    }
    delete data.a.min;delete data.a.max;
  }
  a.extras={sourceName:a.name,loop:['Idle','Walk','Run','Block','JumpIdle'].includes(mapping[a.name])};
  a.name=mapping[a.name];
}
gltf.animations=selected;

// Keep the original artist's fitted single-hand sword and badge shield.
const remove=new Set(['1H_Sword_Offhand','2H_Sword','Rectangle_Shield','Round_Shield','Spike_Shield']);
const removed=[];
for(const n of gltf.nodes)if(n.children)n.children=n.children.filter(i=>{if(remove.has(gltf.nodes[i].name)){removed.push(gltf.nodes[i].name);return false;}return true;});
const roots=[...gltf.scenes[gltf.scene||0].nodes];
const worlds=[],local=new THREE.Matrix4();
function world(i,parent){
 const n=gltf.nodes[i];
 const q=new THREE.Quaternion().fromArray(n.rotation||[0,0,0,1]);
 local.compose(new THREE.Vector3().fromArray(n.translation||[0,0,0]),q,new THREE.Vector3().fromArray(n.scale||[1,1,1]));
 if(n.matrix)local.fromArray(n.matrix);
 worlds[i]=new THREE.Matrix4().multiplyMatrices(parent,local);
 for(const c of n.children||[])world(c,worlds[i]);
}
for(const i of roots)world(i,new THREE.Matrix4());
const bounds=new THREE.Box3();
for(let i=0;i<gltf.nodes.length;i++){
 const n=gltf.nodes[i];if(!worlds[i]||n.mesh===undefined||!n.name.startsWith('Knight_'))continue;
 for(const p of gltf.meshes[n.mesh].primitives){const a=gltf.accessors[p.attributes.POSITION];const box=new THREE.Box3(new THREE.Vector3().fromArray(a.min),new THREE.Vector3().fromArray(a.max)).applyMatrix4(worlds[i]);bounds.union(box);}
}
const height=1.85,scale=height/(bounds.max.y-bounds.min.y);
const newRoot=gltf.nodes.length;
gltf.nodes.push({name:'Hero',children:roots,scale:[scale,scale,scale],translation:[0,-bounds.min.y*scale,0],extras:{author:'Kay Lousberg / KayKit',license:'CC0-1.0',normalization:'Height 1.85 m including helmet plume; +Z forward',planarMotion:'Controller driven; root X/Z and dodge endpoint drift removed'}});
gltf.scenes=[{name:'GameReadyKnight',nodes:[newRoot]}];gltf.scene=0;

// Prune unused nodes and geometry, then compact the retained binary views.
const reachable=new Set();function visit(i){if(reachable.has(i))return;reachable.add(i);for(const c of gltf.nodes[i].children||[])visit(c);}visit(newRoot);
const nodeIds=[...reachable].sort((a,b)=>a-b),nodeMap=new Map(nodeIds.map((v,i)=>[v,i]));
gltf.nodes=nodeIds.map(i=>{const n=gltf.nodes[i];if(n.children)n.children=n.children.map(c=>nodeMap.get(c));return n;});
gltf.scenes[0].nodes=[nodeMap.get(newRoot)];
for(const s of gltf.skins){s.joints=s.joints.map(i=>nodeMap.get(i));if(s.skeleton!==undefined)s.skeleton=nodeMap.get(s.skeleton);}
for(const a of gltf.animations)for(const c of a.channels)c.target.node=nodeMap.get(c.target.node);
const meshIds=[...new Set(gltf.nodes.filter(n=>n.mesh!==undefined).map(n=>n.mesh))].sort((a,b)=>a-b),meshMap=new Map(meshIds.map((v,i)=>[v,i]));
gltf.meshes=meshIds.map(i=>gltf.meshes[i]);for(const n of gltf.nodes)if(n.mesh!==undefined)n.mesh=meshMap.get(n.mesh);
const accessors=new Set();
for(const m of gltf.meshes)for(const p of m.primitives){Object.values(p.attributes).forEach(v=>accessors.add(v));if(p.indices!==undefined)accessors.add(p.indices);for(const t of p.targets||[])Object.values(t).forEach(v=>accessors.add(v));}
for(const s of gltf.skins)if(s.inverseBindMatrices!==undefined)accessors.add(s.inverseBindMatrices);
for(const a of gltf.animations)for(const s of a.samplers){accessors.add(s.input);accessors.add(s.output);}
const accIds=[...accessors].sort((a,b)=>a-b),accMap=new Map(accIds.map((v,i)=>[v,i]));
gltf.accessors=accIds.map(i=>gltf.accessors[i]);
for(const m of gltf.meshes)for(const p of m.primitives){for(const k of Object.keys(p.attributes))p.attributes[k]=accMap.get(p.attributes[k]);if(p.indices!==undefined)p.indices=accMap.get(p.indices);for(const t of p.targets||[])for(const k of Object.keys(t))t[k]=accMap.get(t[k]);}
for(const s of gltf.skins)if(s.inverseBindMatrices!==undefined)s.inverseBindMatrices=accMap.get(s.inverseBindMatrices);
for(const a of gltf.animations)for(const s of a.samplers){s.input=accMap.get(s.input);s.output=accMap.get(s.output);}
const views=new Set(gltf.accessors.map(a=>a.bufferView));for(const i of gltf.images||[])if(i.bufferView!==undefined)views.add(i.bufferView);
const viewIds=[...views].sort((a,b)=>a-b),viewMap=new Map(viewIds.map((v,i)=>[v,i]));
const chunks=[];let offset=0;
gltf.bufferViews=viewIds.map(i=>{const v=gltf.bufferViews[i];const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}const content=bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);chunks.push(content);const result={...v,buffer:0,byteOffset:offset};offset+=content.length;return result;});
for(const a of gltf.accessors)a.bufferView=viewMap.get(a.bufferView);
for(const i of gltf.images||[])if(i.bufferView!==undefined)i.bufferView=viewMap.get(i.bufferView);
const data=Buffer.concat(chunks),binaryPad=Buffer.alloc((4-data.length%4)%4);
gltf.buffers=[{byteLength:data.length}];
gltf.asset.generator='KayKit original; normalized/pruned for Character Forge Lab';
const json=Buffer.from(JSON.stringify(gltf)),jsonPad=Buffer.alloc((4-json.length%4)%4,32),j=Buffer.concat([json,jsonPad]),d=Buffer.concat([data,binaryPad]);
const header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+j.length+d.length,8);header.writeUInt32LE(j.length,12);header.write('JSON',16);
const bh=Buffer.alloc(8);bh.writeUInt32LE(d.length,0);bh.writeUInt32LE(0x004e4942,4);
const final=Buffer.concat([header,j,bh,d]);await fs.writeFile(path.join(out,'hero.glb'),final);
const triangleCount=gltf.meshes.reduce((n,m)=>n+m.primitives.reduce((k,p)=>k+(p.indices===undefined?gltf.accessors[p.attributes.POSITION].count:gltf.accessors[p.indices].count)/3,0),0);
const manifest={name:'KayKit Knight',author:'Kay Lousberg',pack:'KayKit Adventurers Character Pack 1.0',license:'CC0-1.0',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',commit:'672074b73ba276876a19e8816ecdc5241817ab47',originalSha256:createHash('sha256').update(source).digest('hex'),heroSha256:createHash('sha256').update(final).digest('hex'),generated:'2026-11-12',format:'glTF 2.0 binary, embedded 1024x1024 PNG texture',height:height,units:'meters',forward:'+Z',up:'+Y',groundOffset:0,normalizationScale:scale,sourceBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},bones:gltf.skins[0].joints.length,meshes:gltf.meshes.length,triangles:triangleCount,bytes:final.length,controller:{radius:.3,height:1.55,centerY:.775},attachments:{rightHand:'handslot.r',leftHand:'handslot.l',equipped:['1H_Sword','Badge_Shield','Knight_Helmet','Knight_Cape']},removedAccessories:removed,animations:gltf.animations.map(a=>({name:a.name,sourceName:a.extras.sourceName,duration:Math.max(...a.samplers.map(s=>gltf.accessors[s.input].max?.[0]||0)),loop:a.extras.loop})),rootMotion:{mode:'in-place',details:'Root X/Z locked to its first sample. Dodge hips linear endpoint X/Z drift removed. Vertical bob and intra-pose motion preserved.',originalDisplacements:rootMotionReport},notes:['Dodge is an authored 0.4-second forward quickstep/duck, not a somersault/roll.','hero.blend is an imported/organized editable derivative of the free CC0 GLB, not the paid KayKit SOURCE pack.','Original character, topology, texture and base animations are by Kay Lousberg. Codex only prepared and integrated this asset.']};
await fs.writeFile(path.join(out,'character.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest,null,2));
