import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {adaptCutoutCoverage} from './outdoor-materials.js';

export function applyRealMaterials(materials,loader,maxAnisotropy){
  const tex=(file,repeat=[1,1],color=false)=>{
    const map=loader.load('assets/v2/'+file);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(...repeat);map.anisotropy=maxAnisotropy;
    if(color)map.colorSpace=THREE.SRGBColorSpace;return map;
  };
  const physical=(old,extra)=>{
    const m=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(m,old);m.setValues(extra);return m;
  };
  const matteRoughness=(file,repeat)=>{
    const map=new THREE.Texture();map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(...repeat);map.anisotropy=maxAnisotropy;
    loader.load('assets/v2/'+file,source=>{
      const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source.image,0,0,512,512);const img=ctx.getImageData(0,0,512,512),p=img.data;
      for(let i=0;i<p.length;i+=4){const v=204+p[i+1]*.2;p[i]=p[i+1]=p[i+2]=v;}ctx.putImageData(img,0,0);map.image=c;map.needsUpdate=true;source.dispose();
    });return map;
  };
  const oakDiffuse=()=>{
    const map=new THREE.Texture();map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=maxAnisotropy;
    loader.load('assets/v2/oak_veneer_01-color.jpg',source=>{
      const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source.image,0,0,1024,1024);
      const image=ctx.getImageData(0,0,1024,1024),p=image.data;
      for(let i=0;i<p.length;i+=4){p[i]=184+(p[i]-175)*.72;p[i+1]=156+(p[i+1]-145)*.72;p[i+2]=120+(p[i+2]-105)*.72;}
      ctx.putImageData(image,0,0);map.image=c;map.needsUpdate=true;source.dispose();
    });return map;
  };
  const clothNormal=tex('denmin_fabric_02-normal.jpg',[4,4]);
  const clothRough=tex('denmin_fabric_02-roughness.jpg',[4,4]);
  const clothColor=new THREE.Texture();clothColor.wrapS=clothColor.wrapT=THREE.RepeatWrapping;clothColor.repeat.set(4,4);clothColor.colorSpace=THREE.SRGBColorSpace;clothColor.anisotropy=maxAnisotropy;
  loader.load('assets/v2/denmin_fabric_02-color.jpg',source=>{
    const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source.image,0,0,1024,1024);const img=ctx.getImageData(0,0,1024,1024),p=img.data;
    for(let i=0;i<p.length;i+=4){const l=(p[i]+p[i+1]+p[i+2])/765;p[i]=p[i+1]=p[i+2]=190+l*85;}
    ctx.putImageData(img,0,0);clothColor.image=c;clothColor.needsUpdate=true;source.dispose();
  });
  for(const key of ['linen','cushion','sage','throw']){
    materials[key]=physical(materials[key],{map:clothColor,roughness:.9,normalMap:clothNormal,normalScale:new THREE.Vector2(.36,.36),roughnessMap:clothRough,sheen:.45,sheenRoughness:.92,sheenColor:new THREE.Color('#d5c5ad'),bumpScale:.004});
  }
  materials.linen.color.set('#b9a88f');materials.cushion.color.set('#c9bba6');materials.throw.color.set('#aa987b');materials.sage.color.set('#7f8b65');
  materials.wood=physical(materials.wood,{map:oakDiffuse(),normalMap:tex('oak_veneer_01-normal.jpg'),normalScale:new THREE.Vector2(.055,.055),roughnessMap:matteRoughness('oak_veneer_01-roughness.jpg',[1,1]),bumpMap:null,roughness:.76,envMapIntensity:.65,color:'#fff8ed',clearcoat:.10,clearcoatRoughness:.50,anisotropy:.18,anisotropyRotation:Math.PI/2});
  materials.floor.map=tex('wood_floor-color.jpg',[2.2,3.2],true);materials.floor.normalMap=tex('wood_floor-normal.jpg',[2.2,3.2]);materials.floor.normalScale.set(.16,.16);materials.floor.roughnessMap=matteRoughness('wood_floor-roughness.jpg',[2.2,3.2]);materials.floor.color.set('#eee2d1');materials.floor.roughness=.86;
  materials.wall=physical(materials.wall,{color:'#e0d6c7',roughness:.96,bumpScale:.001});
  materials.ceiling.color.set('#e5dccd');
  materials.rug=physical(materials.rug,{color:'#d2c4ac',roughness:1,sheen:.8,sheenColor:new THREE.Color('#efe4d0'),sheenRoughness:1,normalMap:tex('fabric_pattern_07-normal.jpg',[17,17]),normalScale:new THREE.Vector2(.18,.18),roughnessMap:tex('fabric_pattern_07-roughness.jpg',[17,17]),bumpScale:.002});
  materials.brass=physical(materials.brass,{color:'#9c845b',roughness:.42,metalness:.72});
}

// Exact surface anchoring is shared by all imported plants; no hand-entered Y.
export function anchorOnSurface(object,surface,x,z){
  object.updateMatrixWorld(true);
  let bounds=new THREE.Box3().setFromObject(object);
  object.position.x+=x-(bounds.min.x+bounds.max.x)/2;
  object.position.z+=z-(bounds.min.z+bounds.max.z)/2;
  object.position.y+=surface-bounds.min.y;
  object.updateMatrixWorld(true);
  bounds=new THREE.Box3().setFromObject(object);
  object.userData.support={surface,bottom:bounds.min.y,x,z};
  return bounds;
}

export function loadRealPlants(scene,manager){
  const gltf=new GLTFLoader(manager);
  return gltf.loadAsync('assets/v2/potted_plant_01/potted_plant_01_2k.gltf').then(({scene:source})=>{
    const specs=[{name:'cabinet-plant',x:2.42,z:.66,height:.65,surface:.570}, {name:'balcony-plant',x:1.62,z:-4.20,height:1.10,surface:.015},{name:'floor-plant',x:-2.22,z:-2.78,height:1.78,surface:0}];
    for(const spec of specs){
      const plant=source.clone(true);plant.name=spec.name;const bounds=new THREE.Box3().setFromObject(plant),size=bounds.getSize(new THREE.Vector3());plant.scale.setScalar(spec.height/size.y);
      plant.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;node.material=node.material.clone();if(node.material.alphaTest>0){node.material.alphaToCoverage=true;adaptCutoutCoverage(node);node.material.roughness=.85;node.material.side=THREE.DoubleSide;}node.material.envMapIntensity=.65;}});
      scene.add(plant);anchorOnSurface(plant,spec.surface,spec.x,spec.z);
    }
  });
}

export function setupWindowLighting(scene,renderer,manager){
  RectAreaLightUniformsLib.init();
  let source,environmentTarget,builds=0;
  function rebuildEnvironment(){
    if(renderer.getContext().isContextLost())return;
    const generator=new THREE.PMREMGenerator(renderer),previous=environmentTarget;
    if(source){source.needsUpdate=true;environmentTarget=generator.fromEquirectangular(source);source.dispose();}
    else{const room=new RoomEnvironment();environmentTarget=generator.fromScene(room,.05);room.dispose();}
    scene.environment=environmentTarget.texture;generator.dispose();previous?.dispose();builds++;
  }
  rebuildEnvironment();
  new HDRLoader(manager).load('assets/v2/lebombo.hdr',hdr=>{
    // Keep the CPU HDR source so a restored context can regenerate the PMREM.
    source=hdr;scene.environmentRotation.y=Math.PI*.25;rebuildEnvironment();
  });
  // Keep the emitter vertical and outside every curtain fold. Tilting this
  // large plane into the room made it cut through the cloth and create a hard
  // light/dark terminator across otherwise smooth fabric.
  const window=new THREE.RectAreaLight('#fff6e9',3.2,4.6,2.2);window.position.set(0,1.35,-3.68);window.lookAt(0,1.35,0);scene.add(window);
  const bounce=new THREE.RectAreaLight('#e7cda7',.46,3.6,2.3);bounce.position.set(2.67,1.4,-.1);bounce.lookAt(0,1.4,-.1);scene.add(bounce);
  return {window,bounce,rebuildEnvironment,get builds(){return builds;}};
}

export function addUpholsteryDetails(parent,material){
  const seamMaterial=new THREE.MeshStandardMaterial({color:'#a9977d',roughness:.98});
  // Fine piping around each seat, rather than a perfectly featureless cushion.
  for(const x of [-.89,0,.89]){
    const pts=[];
    for(let i=0;i<64;i++){
      const a=i/64*Math.PI*2,cos=Math.cos(a),sin=Math.sin(a);
      pts.push(new THREE.Vector3(x+Math.sign(cos)*Math.pow(Math.abs(cos),.38)*.404,.642,.105+Math.sign(sin)*Math.pow(Math.abs(sin),.38)*.346));
    }
    const curve=new THREE.CatmullRomCurve3(pts,true),seam=new THREE.Mesh(new THREE.TubeGeometry(curve,72,.0021,5,true),seamMaterial);seam.castShadow=true;parent.add(seam);
  }
}

export function rugFibers(scene){
  const cols=124,rows=126,count=cols*rows,g=new THREE.TorusGeometry(.009,.0028,4,9),mat=new THREE.MeshPhysicalMaterial({color:'#c4af8d',roughness:1,sheen:.6,sheenColor:new THREE.Color('#e4d2b3'),sheenRoughness:1});
  const fibers=new THREE.InstancedMesh(g,mat,count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const col=i%cols,row=Math.floor(i/cols),x=-1.75+(col+.5)*3.42/cols,z=-2.28+(row+.5)*3.47/rows;
    dummy.position.set(x,.030+Math.sin(i*1.8)*.001,z);dummy.rotation.set(Math.PI/2-.30,0,(col%2)*.18);dummy.scale.set(1.05,1.35,1);dummy.updateMatrix();fibers.setMatrixAt(i,dummy.matrix);
  }
  fibers.receiveShadow=true;scene.add(fibers);
}
