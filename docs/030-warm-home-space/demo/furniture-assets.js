import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {refineSeat,wrinkleCloth} from './upholstery.js';

export async function installFurniture(scene,manager,fallback,television,materials){
  const loader=new GLTFLoader(manager);
  const [sofa,tv]=await Promise.all([loader.loadAsync('assets/v5/lowline-sofa.glb'),loader.loadAsync('assets/v5/flat-tv.glb')]);
  const model=sofa.scene;
  const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());
  const holder=new THREE.Group();holder.name='imported-textured-linen-sofa';holder.position.set(-2.08,0,-.6);holder.rotation.y=Math.PI/2;scene.add(holder);
  model.scale.set(2.92/s.x,.96/s.y,1.04/s.z);model.position.set(-c.x*model.scale.x,-b.min.y*model.scale.y,-c.z*model.scale.z);holder.add(model);
  model.traverse(o=>{if(o.isMesh){
    if(/^Loose seat(?:\.\d+)?$/.test(o.name))o.geometry=wrinkleCloth(refineSeat(o.geometry),'seat',o.position.x*2);
    const original=o.material;
    if(/Textile|Upholstery/.test(original.name)){
      const m=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(m,original);
      m.map=materials.cushion.map;m.roughness=.92;m.metalness=0;m.metalnessMap=null;m.sheen=.50;m.sheenRoughness=.95;m.sheenColor=new THREE.Color('#e4d8c7');m.color.set('#cabca4');
      if(m.normalMap)m.normalScale.set(.25,.25);o.material=m;
    }
    o.castShadow=true;o.receiveShadow=true;
  }});
  // Retain only the loose accent cushions from the reference arrangement.
  for(const child of fallback.children)child.visible=['pillow','back-cushion','throw'].includes(child.name);
  television.installModel(tv.scene);
  holder.updateMatrixWorld(true);const finalBounds=new THREE.Box3().setFromObject(holder);
  holder.userData.support={surface:0,bottom:finalBounds.min.y,x:-2.08,z:-.6};
  document.querySelector('#scene').dataset.furniture=JSON.stringify({loaded:true,sofa:{width:2.92,height:.96,depth:1.04,bottom:finalBounds.min.y},television:{width:.72442*2.44,wallMounted:true}});
  return holder;
}
