import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {finishTreeMaterial,adaptCutoutCoverage} from './outdoor-materials.js';
import {addWind} from './canopy-vegetation.js';

export async function installBalconyLife(world,manager,daylight,clock,{planters,cloths}){
  const source=await new GLTFLoader(manager).loadAsync('assets/v11/layered-shrub.gltf');
  let leaves;source.scene.traverse(node=>{if(node.isMesh&&node.material.name.includes('leaves'))leaves=node;});
  const geometry=leaves.geometry.clone(),indices=[];
  // Each bent, crossed leaf cluster occupies twelve indices. Keep whole
  // clusters so the distant plants retain valid silhouettes and UVs.
  for(let i=0;i<geometry.index.count;i+=12*8)for(let j=0;j<12;j++)indices.push(geometry.index.getX(i+j));
  geometry.setIndex(indices);geometry.setAttribute('canopyWind',geometry.getAttribute('_wind'));
  const material=finishTreeMaterial(leaves.material,true,daylight);material.color.set('#9ab084');material.alphaTest=.42;material.alphaToCoverage=true;material.aoMap=null;
  const plants=new THREE.InstancedMesh(geometry,material,planters.length);plants.name='balcony-living-plants';
  planters.forEach((p,i)=>plants.setMatrixAt(i,p.matrix.clone().multiply(new THREE.Matrix4().makeTranslation(0,-p.height*.19,0)).multiply(new THREE.Matrix4().makeScale(p.width/1.3078,p.height,p.width/1.3078))));
  plants.castShadow=false;plants.receiveShadow=false;addWind(plants,clock,.006);world.add(plants);
  adaptCutoutCoverage(plants);

  const fabric=new THREE.PlaneGeometry(.55,.62,8,8),positions=fabric.attributes.position,anchors=[];
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i)-.31,hang=-y/.62;
    positions.setXYZ(i,x,y,.018*Math.sin(x*31)*hang+.013*hang*hang);
    anchors.push(x,0,0,hang*hang);
  }
  positions.needsUpdate=true;fabric.setAttribute('canopyWind',new THREE.Float32BufferAttribute(anchors,4));fabric.computeVertexNormals();
  for(const [type,color]of ['#d8d5c8','#889da5','#b4a58e'].entries()){
    const selected=cloths.filter(c=>c.type===type),mat=new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide});
    const items=new THREE.InstancedMesh(fabric,mat,selected.length);items.name='balcony-hanging-fabric-'+type;
    selected.forEach((c,i)=>items.setMatrixAt(i,c.matrix));items.castShadow=true;items.receiveShadow=true;addWind(items,clock,.025);world.add(items);
  }
  return {plants:planters.length,cloths:cloths.length,plantTriangles:indices.length/3*planters.length};
}
