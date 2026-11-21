import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {RoundedBoxGeometry} from './vendor/addons/geometries/RoundedBoxGeometry.js';
import {SPACE} from './reading-space.js';
import {TEA} from './reading-ritual-layout.js';

/** A furnished place along the same walkable courtyard, lit by the outdoor rig. */
export function createReadingTerrace({scene,geometry,material,texture,interactive}){
 const root=new THREE.Group();root.name='Sheltered tea terrace';scene.add(root);let bookLeaf;let disposed=false,teaAge=Infinity;
 const loader=new GLTFLoader(),objects=[];let footrest,readingBook;
 function add(g,m,p,parent=root,r){const o=new THREE.Mesh(geometry(g),m);o.position.fromArray(p);if(r)o.rotation.set(...r);o.layers.set(1);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 const wood=material(new THREE.MeshStandardMaterial({color:'#bda17b',roughness:.84,map:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/materials/wood_planks_grey-color.jpg',[1,3],true),normalMap:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/materials/wood_planks_grey-normal.jpg',[1,3]),normalScale:new THREE.Vector2(.18,.18),fog:false}));
 const linen=material(new THREE.MeshStandardMaterial({color:'#d5c9aa',map:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/poly_wool_herringbone/diff.jpg',[2,2],true),normalMap:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/poly_wool_herringbone/nor_gl.jpg',[2,2]),normalScale:new THREE.Vector2(.3,.3),roughness:.98,fog:false}));
 const dark=material(new THREE.MeshStandardMaterial({color:'#575548',roughness:.8,fog:false}));
 function rounded(size,m,p,parent=root,r){return add(new RoundedBoxGeometry(...size,3,.025),m,p,parent,r);}
 // Flush with the yard: no unmodelled step or camera height jump.
 for(let i=0;i<19;i++)rounded([.215,.09,3.25],wood,[-7.75+i*.225,.082,6.9]);
 const chair=new THREE.Group();chair.position.set(SPACE.terrace.seat.x,.125,SPACE.terrace.seat.z);chair.rotation.y=SPACE.terrace.yaw+Math.PI;chair.userData.action='rest';root.add(chair);interactive.push(chair);
 async function load(url,{parent=root,height,position=[0,0,0],rotation=0}={}){
  const gltf=await loader.loadAsync(url);if(disposed){release(gltf.scene);return;}
  const model=gltf.scene;if(url.includes('throw_pillows')){const keep=model.children[0];for(const c of model.children.slice())if(c!==keep)model.remove(c);}model.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(model,true),size=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());model.position.set(-c.x,-b.min.y,-c.z);const pivot=new THREE.Group();pivot.add(model);pivot.scale.setScalar(height/size.y);const outer=new THREE.Group();outer.position.fromArray(position);outer.rotation.y=rotation;outer.add(pivot);parent.add(outer);objects.push(model);
  model.traverse(o=>{o.layers.set(1);if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;geometry(o.geometry);for(const m of [o.material].flat()){material(m);m.fog=false;m.roughness=Math.max(m.roughness,.68);for(const t of Object.values(m))if(t?.isTexture)t.anisotropy=4;}});return outer;
 }
 function release(model){const ts=new Set();model.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of [o.material].flat()){Object.values(m).forEach(t=>{if(t?.isTexture)ts.add(t);});m.dispose();}}});ts.forEach(t=>t.dispose());}
 const chairReady=load('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/terrace/Rockingchair_01/Rockingchair_01_1k.gltf',{parent:chair,height:1.08});
 // An actual upholstered footrest extends the relaxed chair posture.
 const ottomanReady=load('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/Ottoman_01/Ottoman_01_1k.gltf',{height:.34,position:[-6.08,.13,6.63],rotation:SPACE.terrace.yaw}).then(o=>{if(o)o.scale.set(1.55,1,1.5);footrest=o;return o;});
 const table=new THREE.Group();table.userData.action='tea';root.add(table);interactive.push(table);
 const tableReady=load('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/side_table_01/side_table_01_1k.gltf',{parent:table,height:TEA.table.height,position:[TEA.table.x,.13,TEA.table.z],rotation:.24});
 const ceramic=material(new THREE.MeshStandardMaterial({color:'#d4c6a8',roughness:.39,fog:false})),teaMat=material(new THREE.MeshStandardMaterial({color:'#694221',roughness:.16,fog:false}));
 const cups=[];
 function cupAt(x,z){const cup=new THREE.Group();cup.position.set(x,TEA.cup.y,z);table.add(cup);cup.userData.action='tea';
  const profile=[new THREE.Vector2(.023,0),new THREE.Vector2(.029,.003),new THREE.Vector2(.046,.055),new THREE.Vector2(.048,.060),new THREE.Vector2(.043,.060),new THREE.Vector2(.041,.051),new THREE.Vector2(.026,.007)];
  add(new THREE.LatheGeometry(profile,40),ceramic,[0,0,0],cup);add(new THREE.CylinderGeometry(.071,.068,.009,40),ceramic,[x,TEA.cup.y-.007,z],table);add(new THREE.CircleGeometry(.042,40),teaMat,[0,.052,0],cup,[-Math.PI/2,0,0]);cups.push(cup);return cup;
 }
 const userCup=cupAt(TEA.cup.x,TEA.cup.z);
 // Small teapot with a real hollow rim, spout and curved handle.
 const pot=new THREE.Group();pot.position.set(TEA.pot.x,TEA.pot.y,TEA.pot.z);pot.rotation.y=-.55;table.add(pot);
 add(new THREE.SphereGeometry(.074,32,20),ceramic,[0,.062,0],pot).scale.set(1,.8,1);
 add(new THREE.CylinderGeometry(.05,.055,.014,32),ceramic,[0,.114,0],pot);add(new THREE.SphereGeometry(.015,16,12),dark,[0,.132,0],pot);
 add(new THREE.CylinderGeometry(.017,.028,.105,24),ceramic,[.08,.07,0],pot,[0,0,-.9]);add(new THREE.TorusGeometry(.052,.008,8,32,Math.PI*1.55),ceramic,[-.065,.065,0],pot,[0,0,.7]);
 // Shade makes lingering outdoors coherent with the existing light rain.
 for(const x of [-7.9,-3.65])for(const z of [5.28,8.45])if(x>-7||z>6)rounded([.075,2.66,.075],wood,[x,1.45,z]);
 for(const x of [-7.9,-3.65])rounded([.12,.12,3.45],wood,[x,2.78,6.87]);for(const z of [5.27,8.45])rounded([4.50,.12,.13],wood,[-5.77,2.80,z]);
 const awning=linen;awning.color.set('#e1d8c3');awning.side=THREE.DoubleSide;
 const canopy=new THREE.PlaneGeometry(4.43,3.4,24,20),cp=canopy.attributes.position;for(let i=0;i<cp.count;i++)cp.setZ(i,Math.sin((cp.getX(i)+2.215)/4.43*Math.PI)*-.085);canopy.computeVertexNormals();add(canopy,awning,[-5.77,2.86,6.86],root,[-Math.PI/2,0,0]);
 const pillowReady=load('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/throw_pillows_01/throw_pillows_01_1k.gltf',{height:.21,position:[SPACE.terrace.seat.x,.66,SPACE.terrace.seat.z+.1],rotation:SPACE.terrace.yaw});
 const warm=new THREE.PointLight('#ffe3b8',4.2,6,2);warm.layers.set(1);warm.position.set(-5.3,2.42,7.9);root.add(warm);
 const bounce=new THREE.RectAreaLight('#ffe8c6',1.8,2.8,1.8);bounce.layers.set(1);bounce.position.set(-5,2.65,7.8);bounce.lookAt(-6.5,1,5.7);root.add(bounce);
 const lightMat=material(new THREE.MeshStandardMaterial({color:'#f3d4a5',emissive:'#ffd18e',emissiveIntensity:.5,roughness:.8,fog:false}));rounded([.16,.24,.16],lightMat,[-5.3,2.44,7.9]);
 const restHint=new THREE.Vector3(SPACE.terrace.seat.x,.9,SPACE.terrace.seat.z);
 function createBook(pageTexture){if(readingBook)return;readingBook=new THREE.Group();readingBook.name='Handheld reading book';readingBook.userData.action='holdBook';interactive.push(readingBook);root.add(readingBook);
  const cover=material(new THREE.MeshStandardMaterial({color:'#5b6352',roughness:.88,fog:false})),paper=material(new THREE.MeshStandardMaterial({color:'#eadfc8',roughness:1,fog:false}));
  rounded([.365,.016,.245],cover,[0,0,0],readingBook);for(const side of[-1,1])rounded([.174,.022,.226],paper,[side*.089,.018,0],readingBook);
  const page=material(new THREE.MeshStandardMaterial({map:pageTexture,roughness:1,side:THREE.DoubleSide,fog:false}));add(new THREE.PlaneGeometry(.345,.221).rotateZ(Math.PI),page,[0,.031,0],readingBook,[-Math.PI/2,0,0]);readingBook.position.set(TEA.book.x,TEA.book.y,TEA.book.z);readingBook.rotation.y=.24;bookLeaf=new THREE.Group();bookLeaf.position.y=.034;readingBook.add(bookLeaf);add(new THREE.PlaneGeometry(.172,.221),paper,[-.086,0,0],bookLeaf,[-Math.PI/2,0,0]);bookLeaf.visible=false;
 }
 return{root,restHint,createBook,getSupports(){root.updateMatrixWorld(true);return footrest?new THREE.Box3().setFromObject(footrest,true):null;},ready:Promise.all([chairReady,ottomanReady,tableReady,pillowReady]),sip(){teaAge=0;return true;},
  update(dt,camera,{performance:pose=null}={}){teaAge+=dt;
   const rest=pose?.restAmount||0;chair.rotation.x=Math.sin((pose?.time||0)*.7)*.007*rest;
   if(pose?.cupPosition){userCup.position.copy(pose.cupPosition);userCup.quaternion.copy(pose.cupQuaternion);}else{userCup.position.set(TEA.cup.x,TEA.cup.y,TEA.cup.z);userCup.rotation.set(0,.24,0);}
   if(bookLeaf){bookLeaf.visible=pose?.bookPlace==='terrace'&&pose?.pageTurn!==null&&pose?.pageTurn!==undefined;if(bookLeaf.visible)bookLeaf.rotation.z=-Math.PI*THREE.MathUtils.smoothstep(pose.pageTurn,.18,.82);}
   if(readingBook){readingBook.userData.action=pose?.bookRequested&&pose?.bookPlace==='terrace'?'book':'holdBook';if(pose?.bookPlace==='terrace'&&pose?.bookPosition){readingBook.position.copy(pose.bookPosition);readingBook.quaternion.copy(pose.bookQuaternion);}else{readingBook.position.set(TEA.book.x,TEA.book.y,TEA.book.z);readingBook.rotation.set(0,.24,0);}}
  },dispose(){disposed=true;scene.remove(root);objects.forEach(o=>o.traverse(n=>{if(n.isMesh)for(const m of [n.material].flat())for(const t of Object.values(m))if(t?.isTexture)t.dispose();}));}};
}
