import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {finishTreeMaterial,adaptCutoutCoverage} from './outdoor-materials.js';
import {GROUND_Y} from './courtyard-layout.js';

const windDeclarations=`attribute vec4 canopyWind;uniform float canopyTime,canopyBreeze;`;
const windVertex=`
  float treePhase=0.;
  #ifdef USE_INSTANCING
    treePhase=dot(instanceMatrix[3].xz,vec2(.13,.27));
  #endif
  float branchWeight=pow(clamp(canopyWind.y,0.,1.),2.);
  float branchPhase=treePhase+dot(canopyWind.xz,vec2(2.1,1.7));
  float flow=.65*sin(canopyTime*.70+branchPhase)+.35*sin(canopyTime*.31+branchPhase*.63);
  float flutter=sin(canopyTime*2.7+branchPhase*4.1)*canopyWind.w*canopyBreeze*.45;
  transformed.x+=flow*canopyBreeze*branchWeight+flutter;
  transformed.z+=(.55*flow+.18*sin(canopyTime*.44+branchPhase))*canopyBreeze*branchWeight+flutter*.55;
  transformed.y+=flutter*.12;
`;

export function addWind(mesh,clock,strength=.006){
  const decorate=material=>{
    const previous=material.onBeforeCompile;
    material.onBeforeCompile=shader=>{
      previous.call(material,shader);shader.uniforms.canopyTime=clock;
      shader.uniforms.canopyBreeze={value:strength};
      shader.vertexShader=windDeclarations+'\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+windVertex);
    };
    const previousKey=material.customProgramCacheKey.bind(material);
    material.customProgramCacheKey=()=>previousKey()+'-breeze-v1';
  };
  decorate(mesh.material);
  const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:mesh.material.alphaTest>0?mesh.material.map:null,alphaTest:mesh.material.alphaTest,side:THREE.DoubleSide});
  decorate(depth);mesh.customDepthMaterial=depth;
}

function canopyOcclusion(material,geometry,diameter){
  const p=geometry.attributes.position,values=new Float32Array(p.count),radius=diameter/2;
  for(let i=0;i<p.count;i++){
    const r=Math.hypot(p.getX(i)/radius,(p.getY(i)-.65)/.42,p.getZ(i)/radius);
    values[i]=.63+.37*THREE.MathUtils.smoothstep(r,.20,1.05);
  }
  geometry.setAttribute('canopyOcclusion',new THREE.BufferAttribute(values,1));
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=shader=>{
    compile.call(material,shader);
    shader.vertexShader='attribute float canopyOcclusion;varying float vCanopyOcclusion;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCanopyOcclusion=canopyOcclusion;');
    shader.fragmentShader='varying float vCanopyOcclusion;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=vCanopyOcclusion;\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey=()=>key()+'-canopy-occlusion-v1';
}

export async function installCanopy(world,manager,daylight,clock,treeSpecs,shrubSpecs){
  const inventory=await fetch('assets/v11/inventory.json').then(r=>{if(!r.ok)throw Error('Canopy inventory '+r.status);return r.json();});
  const gltf=new GLTFLoader(manager),models=await Promise.all(inventory.map(m=>gltf.loadAsync(`assets/v11/${m.id}.gltf`)));
  let triangles=0;
  for(let variant=0;variant<models.length;variant++){
    const meta=inventory[variant],isShrub=meta.id==='layered-shrub';
    const specs=isShrub?shrubSpecs:treeSpecs.filter((_,i)=>i%4===variant);
    const source=models[variant].scene;source.updateMatrixWorld(true);
    source.traverse(node=>{
      if(!node.isMesh)return;const geometry=node.geometry.clone();geometry.applyMatrix4(node.matrixWorld);
      const wind=geometry.getAttribute('_wind');if(!wind)throw Error('Wind anchors missing from '+meta.id);
      geometry.setAttribute('canopyWind',wind);
      const isLeaf=node.material.name.includes('leaves'),material=finishTreeMaterial(node.material,isLeaf,daylight);
      if(isLeaf){material.alphaToCoverage=true;material.alphaTest=.42;material.aoMap=null;material.color.set(isShrub?'#a7be88':meta.id.includes('ash')?'#b4cda0':'#b3c799');}
      else material.color.set('#c4baa8');
      if(isLeaf)canopyOcclusion(material,geometry,meta.crownDiameter);
      const instances=new THREE.InstancedMesh(geometry,material,specs.length);instances.name='full-canopy-'+meta.id+(isLeaf?'-leaves':'-branches');
      specs.forEach((spec,i)=>{
        const matrix=new THREE.Matrix4().compose(new THREE.Vector3(spec.x,GROUND_Y,spec.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),spec.angle),new THREE.Vector3(spec.crown/meta.crownDiameter,spec.height,spec.crown/meta.crownDiameter));instances.setMatrixAt(i,matrix);
      });
      instances.castShadow=true;instances.receiveShadow=!isLeaf;addWind(instances,clock,isShrub?.005:.006);world.add(instances);
      if(isLeaf)adaptCutoutCoverage(instances);
      triangles+=geometry.index.count/3*specs.length;
    });
  }
  return {trees:treeSpecs.length,shrubs:shrubSpecs.length,variants:inventory.filter(m=>m.id!=='layered-shrub').map(m=>m.id),triangles};
}
