import * as THREE from './vendor/three.module.js';
import {SPACE} from './reading-space.js';

export function completeReadingRoom({scene,box,mesh,geometry,material,wood,plaster,trim,darkWood,interactive}){
 // Complete the formerly open viewing set, keeping the original window and furniture.
 box([.16,3.8,.9],plaster,[-3,1.9,2.95]);
 box([.18,3.8,6.22],plaster,[3.35,1.9,.25]);
 box([.63,3.8,.18],plaster,[-2.815,1.9,3.3]);
 box([4.45,3.8,.18],plaster,[1.125,1.9,3.3]);
 box([1.4,1.35,.18],plaster,[-1.8,3.125,3.3]);
 box([6.65,.13,6.45],wood,[.15,3.82,.25]);
 for(const x of [-2.54,-1.06])box([.10,2.58,.28],trim,[x,1.29,3.3]);
 box([1.58,.11,.28],trim,[-1.8,2.53,3.3]);
 box([1.6,.10,.34],darkWood,[-1.8,.02,3.3]);
 // The lintel, threshold and garden path share the same doorway coordinates.
 const door=new THREE.Group();door.name='Hinged reading room door';door.position.set(-2.5,0,SPACE.door.z);door.userData.action='door';scene.add(door);interactive.push(door);
 function leaf(g,m,p){const o=new THREE.Mesh(geometry(g),m);o.position.fromArray(p);o.castShadow=o.receiveShadow=true;door.add(o);return o;}
 leaf(new THREE.BoxGeometry(1.4,2.45,.075),wood,[.7,1.23,0]);
 for(const x of [.14,.70,1.26])leaf(new THREE.BoxGeometry(.035,2.27,.026),trim,[x,1.23,.05]);
 for(const y of [.25,1.15,2.20])leaf(new THREE.BoxGeometry(1.25,.035,.026),trim,[.7,y,.05]);
 const brass=material(new THREE.MeshStandardMaterial({color:'#a78c53',roughness:.43,metalness:.75}));
 for(const z of [-.065,.065])leaf(new THREE.SphereGeometry(.045,16,10),brass,[1.25,1.13,z]);
 // Roof and restrained exterior timber give the building a readable silhouette from the bank.
 const roof=material(new THREE.MeshStandardMaterial({color:'#4b5349',roughness:.96}));
 for(const side of [-1,1])box([3.7,.12,6.85],roof,[.15+side*1.70,4.34,.25],[0,0,-side*.31]);
 const gable=new THREE.BufferGeometry();gable.setAttribute('position',new THREE.Float32BufferAttribute([-3.25,3.82,0,3.55,3.82,0,.15,4.90,0],3));gable.setIndex([0,1,2]);gable.computeVertexNormals();
 const gableMat=material(new THREE.MeshStandardMaterial({color:'#93836e',roughness:1,side:THREE.DoubleSide}));mesh(gable,gableMat,[0,0,3.55]);mesh(gable.clone(),gableMat,[0,0,-3.03]);
 for(const x of [-3.15,3.50])for(const z of [-2.97,3.46])box([.13,3.85,.13],darkWood,[x,1.925,z]);
 for(const z of [-2.97,3.46])box([6.77,.12,.12],darkWood,[.17,.18,z]);
 box([2.3,.11,1.30],wood,[-1.8,2.78,3.75],[.07,0,0]);
 const lantern=material(new THREE.MeshStandardMaterial({color:'#d8b980',emissive:'#ffcb83',emissiveIntensity:.5,roughness:.6}));
 box([.13,.24,.13],lantern,[-.80,2.10,3.48]);
 const porchLight=new THREE.PointLight('#ffd29a',1.5,4,2);porchLight.layers.set(1);porchLight.position.set(-.80,2.07,3.68);scene.add(porchLight);
 return{door,update(dt,open){door.rotation.y=THREE.MathUtils.damp(door.rotation.y,open?-1.47:0,5,dt);},dispose(){scene.remove(porchLight);}};
}
