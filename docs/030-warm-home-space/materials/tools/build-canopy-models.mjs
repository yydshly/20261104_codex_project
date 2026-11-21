import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as THREE from '../vendor/three.module.js';

const project=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const packageRoot=path.join(project,'.tools/vegetation/node_modules/@dgreenheck/ez-tree');
const sourceRoot=path.join(packageRoot,'src/lib'),generator=path.join(project,'.tools/canopy-generator');
await fs.mkdir(generator,{recursive:true});
await fs.copyFile(path.join(packageRoot,'LICENSE'),path.join(generator,'LICENSE'));
for(const name of ['tree','rng','branch','enums','options','trellis']){
  let code=await fs.readFile(path.join(sourceRoot,name+'.js'),'utf8');
  code=code.replaceAll("from 'three'","from '../../vendor/three.module.js'");
  code=code.replace(/from '(\.\/[^']+)'/g,(_,specifier)=>`from '${specifier.endsWith('.js')?specifier:specifier+'.js'}'`);
  code=code.replaceAll('new Uint16Array(this.branches.indices)','new Uint32Array(this.branches.indices)').replaceAll('new Uint16Array(this.leaves.indices)','new Uint32Array(this.leaves.indices)');
  await fs.writeFile(path.join(generator,name+'.js'),code);
}
await fs.mkdir(path.join(generator,'presets'),{recursive:true});
await fs.writeFile(path.join(generator,'presets/index.js'),"export function loadPreset(){throw new Error('Use the recorded JSON configuration.');}\n");
await fs.writeFile(path.join(generator,'textures.js'),"import {Texture} from '../../vendor/three.module.js';export const getBarkTexture=()=>new Texture();export const getLeafTexture=()=>new Texture();\n");
const {Tree}=await import('../.tools/canopy-generator/tree.js');
const out=path.join(project,'assets/v11');await fs.mkdir(out,{recursive:true});
await fs.copyFile(path.join(packageRoot,'LICENSE'),path.join(out,'EZ-Tree-LICENSE.txt'));
const records=[];
for(const type of ['oak','ash','aspen']){
  const from=path.join(sourceRoot,'assets/leaves',type+'_color.png'),to=path.join(out,type+'_leaves.png');await fs.copyFile(from,to);
  const bytes=await fs.readFile(to);records.push({file:'assets/v11/'+type+'_leaves.png',source:'@dgreenheck/ez-tree 1.1.0 / src/lib/assets/leaves/'+type+'_color.png',license:'MIT',sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const variants=[
  {id:'park-oak-a',preset:'oak_large',seed:23399,leaf:'oak'},
  {id:'park-oak-b',preset:'oak_large',seed:6129,leaf:'oak'},
  {id:'park-ash-a',preset:'ash_large',seed:29919,leaf:'ash'},
  {id:'park-ash-b',preset:'ash_large',seed:14182,leaf:'ash'},
  {id:'layered-shrub',preset:'bush_2',seed:45590,leaf:'aspen'},
];
const inventory=[];
for(const variant of variants){
  const config=JSON.parse(await fs.readFile(path.join(sourceRoot,'presets',variant.preset+'.json'),'utf8'));config.seed=variant.seed;config.bark.textured=false;
  if(variant.id.startsWith('park')){
    config.branch.children={0:10,1:6,2:3};config.leaves.count=12;config.leaves.size*=.95;config.leaves.sizeVariance=.38;config.leaves.start=.06;
    config.branch.radius[0]*=.7;config.branch.segments={0:12,1:7,2:5,3:4};
  }else{config.branch.children={0:9,1:5,2:2};config.leaves.count=12;config.leaves.sizeVariance=.40;config.leaves.size*=1.12;}
  const tree=new Tree();tree.loadFromJson(config);tree.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(tree),height=bounds.max.y-bounds.min.y,center=bounds.getCenter(new THREE.Vector3());
  const meshes=[tree.branchesMesh,tree.leavesMesh],geometries=[];let maxRadius=0;
  for(let part=0;part<meshes.length;part++){
    const source=meshes[part].geometry,p=source.attributes.position,uv=source.attributes.uv;
    let geo;
    if(part===0){geo=source.clone();geo.translate(-center.x,-bounds.min.y,-center.z);geo.scale(1/height,1/height,1/height);}
    else{
      const positions=[],normals=[],uvs=[],wind=[],indices=[];
      const originalNormal=new THREE.Vector3(),radial=new THREE.Vector3(),point=new THREE.Vector3();
      for(let leaf=0;leaf<p.count;leaf+=4){
        const corners=[0,1,2,3].map(i=>new THREE.Vector3().fromBufferAttribute(p,leaf+i).sub(new THREE.Vector3(center.x,bounds.min.y,center.z)).divideScalar(height));
        const anchor=corners[1].clone().add(corners[2]).multiplyScalar(.5),cardCenter=corners.reduce((sum,v)=>sum.add(v),new THREE.Vector3()).multiplyScalar(.25);
        const a=corners[2].clone().sub(corners[1]),b=corners[0].clone().sub(corners[1]);originalNormal.crossVectors(a,b).normalize();
        const first=positions.length/3,rows=variant.id==='layered-shrub'?1:2;
        for(let y=0;y<=rows;y++)for(let x=0;x<=2;x++){
          const u=x/2,v=y/rows;point.copy(corners[1]).addScaledVector(a,u).addScaledVector(b,v);
          point.addScaledVector(originalNormal,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*a.length()*.075);
          radial.copy(cardCenter).sub(new THREE.Vector3(0,.64,0));radial.y*=.6;radial.normalize();if(radial.dot(originalNormal)<0)radial.negate();radial.multiplyScalar(.72).addScaledVector(originalNormal,.28).normalize();
          positions.push(point.x,point.y,point.z);normals.push(radial.x,radial.y,radial.z);uvs.push(u,1-v);wind.push(anchor.x,anchor.y,anchor.z,v*v);
        }
        for(let y=0;y<rows;y++)for(let x=0;x<2;x++){const a=first+y*3+x,b=a+1,c=a+3,d=c+1;indices.push(a,b,c,b,d,c);}
      }
      geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setAttribute('_wind',new THREE.Float32BufferAttribute(wind,4));geo.setIndex(indices);
    }
    const pos=geo.attributes.position;
    if(part===0){const values=[];for(let i=0;i<pos.count;i++)values.push(pos.getX(i),pos.getY(i),pos.getZ(i),0);geo.setAttribute('_wind',new THREE.Float32BufferAttribute(values,4));}
    for(let i=0;i<pos.count;i++)maxRadius=Math.max(maxRadius,Math.hypot(pos.getX(i),pos.getZ(i)));
    geometries.push(geo);
  }
  if(variant.id.startsWith('park')){
    const shapeY=(x,y,z)=>{
      const radial=Math.min(1,Math.hypot(x,z)/maxRadius),envelope=.63+.37*Math.sqrt(Math.max(.04,1-.9*radial*radial)),over=Math.max(y-envelope,0);
      return y-.7*over*over/(over+.06);
    };
    let finalHeight=0;
    for(const geo of geometries){
      const p=geo.attributes.position,w=geo.attributes._wind;
      for(let i=0;i<p.count;i++){const y=shapeY(p.getX(i),p.getY(i),p.getZ(i));p.setY(i,y);w.setY(i,shapeY(w.getX(i),w.getY(i),w.getZ(i)));finalHeight=Math.max(finalHeight,y);}
      geo.computeVertexNormals();
    }
    geometries.forEach((geo,part)=>{
      geo.scale(1,1/finalHeight,1);const p=geo.attributes.position,w=geo.attributes._wind,n=geo.attributes.normal;
      for(let i=0;i<p.count;i++){
        w.setY(i,w.getY(i)/finalHeight);
        if(part===1){const original=new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)),radial=new THREE.Vector3(p.getX(i),p.getY(i)-.64,p.getZ(i));radial.y*=.6;radial.normalize();if(radial.dot(original)<0)radial.negate();radial.multiplyScalar(.65).addScaledVector(original,.35).normalize();n.setXYZ(i,radial.x,radial.y,radial.z);}
      }
    });
  }
  const buffers=[],views=[],accessors=[],primitives=[];let offset=0;
  function add(array,type,target,extra={}){
    const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),pad=(4-offset%4)%4;if(pad){buffers.push(Buffer.alloc(pad));offset+=pad;}
    const bufferView=views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target})-1;buffers.push(bytes);offset+=bytes.length;
    const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type];return accessors.push({bufferView,componentType:array instanceof Float32Array?5126:5125,count:array.length/width,type,...extra})-1;
  }
  let triangles=0;
  for(let part=0;part<2;part++){
    const geo=geometries[part];geo.computeBoundingBox();const attributes={};
    for(const [name,a]of Object.entries(geo.attributes)){const semantic={position:'POSITION',normal:'NORMAL',uv:'TEXCOORD_0',_wind:'_WIND'}[name];attributes[semantic]=add(a.array,'VEC'+a.itemSize,34962,name==='position'?{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()}:{});}
    const index=new Uint32Array(geo.index.array);triangles+=index.length/3;primitives.push({attributes,indices:add(index,'SCALAR',34963),material:part});
  }
  const binary=Buffer.concat(buffers),gltf={asset:{version:'2.0',generator:'EZ-Tree 1.1.0 + local canopy authoring'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:variant.id}],meshes:[{primitives}],buffers:[{uri:variant.id+'.bin',byteLength:binary.length}],bufferViews:views,accessors,
    images:[{uri:'../v9/island_tree_01/textures/island_tree_01_branches_diff_1k.jpg'},{uri:variant.leaf+'_leaves.png'},{uri:'../v9/island_tree_01/textures/island_tree_01_branches_nor_gl_1k.jpg'},{uri:'../v9/island_tree_01/textures/island_tree_01_branches_arm_1k.jpg'}],samplers:[{wrapS:10497,wrapT:10497},{wrapS:33071,wrapT:33071}],textures:[{sampler:0,source:0},{sampler:1,source:1},{sampler:0,source:2},{sampler:0,source:3}],materials:[{name:'canopy-bark',normalTexture:{index:2,scale:.5},occlusionTexture:{index:3,strength:.6},pbrMetallicRoughness:{baseColorTexture:{index:0},metallicRoughnessTexture:{index:3},metallicFactor:0,roughnessFactor:.94}},{name:'canopy-leaves',alphaMode:'MASK',alphaCutoff:.42,doubleSided:true,pbrMetallicRoughness:{baseColorTexture:{index:1},metallicFactor:0,roughnessFactor:.82}}]};
  await fs.writeFile(path.join(out,variant.id+'.gltf'),JSON.stringify(gltf));await fs.writeFile(path.join(out,variant.id+'.bin'),binary);
  await fs.writeFile(path.join(out,variant.id+'-config.json'),JSON.stringify(config,null,2));
  inventory.push({...variant,crownDiameter:maxRadius*2,height:1,triangles,bytes:binary.length});console.log(variant.id,triangles,'triangles',binary.length,'bytes');
}
await fs.writeFile(path.join(out,'inventory.json'),JSON.stringify(inventory,null,2));
await fs.writeFile(path.join(out,'sources.json'),JSON.stringify({generator:'EZ-Tree 1.1.0',license:'MIT',source:'https://github.com/dgreenheck/ez-tree',textureLicense:'https://github.com/dgreenheck/ez-tree/blob/main/src/app/public/textures/LICENSE.md',bark:'Reused CC0 Poly Haven Island Tree 01 branch diffuse, recorded in assets/v9/sources.json',authoring:'tools/build-canopy-models.mjs',files:records},null,2));
