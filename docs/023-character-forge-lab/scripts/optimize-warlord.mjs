import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, joinPrimitives, prune, simplifyPrimitive, weld, textureCompress } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2), option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const input = path.resolve(root, option('--input', 'assets/warlord-v5/export/warlord.glb'));
const output = path.resolve(root, option('--output', 'assets/warlord-v5/runtime'));
assert(output.startsWith(root + path.sep)); await fs.mkdir(output, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;
const identity = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function metrics(doc) {
  const r = doc.getRoot(), nodes = r.listNodes().filter(n => n.getMesh());
  return { meshes: nodes.length, primitives: nodes.reduce((sum,n) => sum+n.getMesh().listPrimitives().length,0),
    triangles: nodes.reduce((sum,n) => sum+n.getMesh().listPrimitives().reduce((v,p) => v+(p.getIndices()?.getCount() || p.getAttribute('POSITION').getCount())/3,0),0),
    materials:r.listMaterials().length, images:r.listTextures().length, actions:r.listAnimations().map(a=>a.getName()),
    bones:r.listSkins()[0].listJoints().map(j=>j.getName()) };
}
function category(name) {
  if (/Mantle|Cape|Lappet|Cloth/i.test(name)) return 'cloth';
  if (/SilkCrest|Plume|CrestRibbon/i.test(name)) return 'plume';
  if (/Halberd|Spearhead|Blade_|Grip_binding/i.test(name)) return 'weapon';
  if (/Eye|Lid|Lip|Iris|Pupil|Hair|Face/i.test(name)) return 'head';
  return 'armor';
}
async function mergeSkinned(doc) {
  const r = doc.getRoot(), groups = new Map(), sourceNodes = [];
  const animated = new Set(r.listAnimations().flatMap(a=>a.listChannels().map(c=>c.getTargetNode())));
  const joints = new Set(r.listSkins().flatMap(s=>s.listJoints()));
  const materialId = new Map(r.listMaterials().map((m,i)=>[m,i]));
  for (const node of r.listNodes()) {
    if (!node.getMesh() || !node.getSkin() || /SuperHero|Body/i.test(node.getName())) continue;
    assert(!animated.has(node) && !joints.has(node), `A deforming joint cannot be merged: ${node.getName()}`);
    assert(node.getMatrix().every((x,i)=>Math.abs(x-identity[i])<1e-7), `Nonidentity skinned mesh transform: ${node.getName()}`);
    sourceNodes.push(node);
    for (const prim of node.getMesh().listPrimitives()) {
      const attr=prim.listSemantics().sort().map(s=>{const a=prim.getAttribute(s);return `${s}:${a.getType()}:${a.getComponentType()}:${a.getNormalized()}`;}).join('|');
      const key=`${category(node.getName())}:${materialId.get(prim.getMaterial())}:${attr}`;
      if (!groups.has(key)) groups.set(key,{prims:[],skin:node.getSkin(),parent:node.getParentNode(),category:category(node.getName()),material:prim.getMaterial()});
      const group=groups.get(key); assert(group.skin===node.getSkin() && group.parent===node.getParentNode(),'Merged meshes must have the exact same skin and parent'); group.prims.push(prim);
    }
  }
  let serial=0;
  for (const group of groups.values()) {
    const prim=group.prims.length>1 ? joinPrimitives(group.prims) : group.prims[0].clone();
    const name=`Batch_${group.category}_${group.material?.getName() || 'surface'}_${serial++}`;
    const mesh=doc.createMesh(name).addPrimitive(prim), node=doc.createNode(name).setMesh(mesh).setSkin(group.skin);
    if (group.parent) group.parent.addChild(node); else r.listScenes()[0].addChild(node);
  }
  sourceNodes.forEach(n=>n.dispose());
  await doc.transform(prune({keepLeaves:true,keepAttributes:true,keepSolidTextures:true}));
}
let doc=await io.read(input); const before=metrics(doc);
await doc.transform(dedup()); await mergeSkinned(doc);
// Keep every authored 100Hz motion key, including short cloth clearance keys.
await doc.transform(weld(),textureCompress({encoder:sharp,slots:/^(baseColorTexture|emissiveTexture)$/,targetFormat:'jpeg',quality:94,resize:[1024,1024]}),textureCompress({encoder:sharp,slots:/^(normalTexture|metallicRoughnessTexture|occlusionTexture)$/,targetFormat:'png',resize:[512,512]}));
const highBytes=await io.writeBinary(doc); await fs.writeFile(path.join(output,'warlord.glb'),highBytes);
const high=metrics(doc); const lods=[];
for (const [level,ratio,error] of [[1,.35,.004],[2,.14,.009]]) {
  const lod=await io.readBinary(highBytes);
  for(const mesh of lod.getRoot().listMeshes()) {
    // Keep every cloth/crest vertex and triangle used by the collision audit.
    if(/Batch_(?:cloth|plume)|Eye|Iris|Pupil/i.test(mesh.getName()))continue;
    for(const prim of mesh.listPrimitives())simplifyPrimitive(prim,{simplifier:MeshoptSimplifier,ratio,error,lockBorder:false});
  }
  const stats=metrics(lod);
  assert.deepEqual(stats.bones,high.bones,'LOD joint order must be identical');
  // Runtime swaps only geometry into the high-detail skeleton/materials. Avoid
  // downloading and allocating identical images three times.
  for(const mat of lod.getRoot().listMaterials()) { mat.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null); for(const ext of mat.listExtensions()) mat.setExtension(ext.extensionName,null); }
  for(const texture of lod.getRoot().listTextures()) texture.dispose();
  for(const animation of lod.getRoot().listAnimations()) animation.dispose();
  await lod.transform(prune({keepLeaves:true,keepAttributes:true,keepSolidTextures:true}));
  const bytes=await io.writeBinary(lod); const file=`warlord-lod${level}.glb`; await fs.writeFile(path.join(output,file),bytes);
  lods.push({level,file,ratio,error,triangles:stats.triangles,primitives:stats.primitives,bytes:bytes.length,sha256:digest(bytes),geometryOnly:true});
}
const report={status:'passed',source:{...before,bytes:(await fs.stat(input)).size},runtime:{...high,bytes:highBytes.length,sha256:digest(highBytes)},lods,
 notes:'Skinned meshes are joined only with identity local transforms, the exact same skin/parent and compatible vertex formats. High-detail body is preserved. LOD files share runtime skeleton/materials; they intentionally contain geometry without duplicate textures/actions. Image compression uses JPEG94 albedo and lossless 512px data maps, not GPU block compression.'};
await fs.writeFile(path.join(output,'optimization.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,source:{meshes:before.meshes,primitives:before.primitives,triangles:before.triangles,bytes:report.source.bytes},runtime:{meshes:high.meshes,primitives:high.primitives,triangles:high.triangles,bytes:highBytes.length,sha256:report.runtime.sha256},lods},null,2));
