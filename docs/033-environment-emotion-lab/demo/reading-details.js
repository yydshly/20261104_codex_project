import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/addons/geometries/RoundedBoxGeometry.js';

/** Small signs of use, built in the same space as the furniture. */
export function addReadingDetails({scene,geometry,material,texture,pbr,wood}){
 const group=new THREE.Group();group.name='Reading room — fabric, framed art and personal objects';scene.add(group);
 const mat=p=>material(new THREE.MeshStandardMaterial(p));
 const add=(g,m,p,r=[0,0,0])=>{const o=new THREE.Mesh(geometry(g),m);o.position.set(...p);o.rotation.set(...r);o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const box=(s,m,p,r)=>add(new RoundedBoxGeometry(...s,3,Math.min(.014,...s.map(n=>n/4))),m,p,r);
 const frameWood=mat({color:'#8b6846',roughness:.78,...pbr('walnut_veneer',[.18,.9])});
 const mount=mat({color:'#ded7c6',roughness:1});
 // Real public-domain painting, correct aspect, recessed into a linen mount.
 const x=-.78,y=2.20,z=-2.61;
 box([1.43,1.47,.055],frameWood,[x,y,z]);
 box([1.34,1.38,.009],mount,[x,y,z+.031]);
 const artMap=texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/art/monet-vetheuil-1901.jpg',[1,1],true);
 const artMat=mat({map:artMap,roughness:.94,normalScale:new THREE.Vector2(.12,.12)});
 const painting=add(new THREE.PlaneGeometry(1.11,1.069),artMat,[x,y+.014,z+.038]);painting.name='Claude Monet — Vétheuil, 1901 — AIC Open Access';painting.castShadow=false;
 const lip=mat({color:'#b09162',metalness:.26,roughness:.6});
 for(const side of [-1,1]){box([.018,1.39,.018],lip,[x+side*.676,y,z+.036]);box([1.35,.018,.018],lip,[x,y+side*.697,z+.036]);}
 // A folded wool throw follows the outside arm instead of hovering above it.
 const cloth=material(new THREE.MeshPhysicalMaterial({color:'#e2cbb0',roughness:1,sheen:.4,sheenRoughness:1,sheenColor:new THREE.Color('#d8c5a7'),...pbr('poly_wool_herringbone',[1.4,2.1]),normalScale:new THREE.Vector2(.5,.5)}));
 const drapeGeo=new THREE.PlaneGeometry(1,1,44,36),dp=drapeGeo.attributes.position;
 for(let i=0;i<dp.count;i++){
  const u=dp.getX(i)+.5,v=dp.getY(i)+.5;
  const fall=THREE.MathUtils.smoothstep(u,.43,1);
  dp.setXYZ(i,-1.24-u*.46,.78-fall*.48+Math.sin(v*28+u*2)*.011,-.39+v*.71+Math.sin(u*8)*.015);
 }
 drapeGeo.computeVertexNormals();cloth.side=THREE.DoubleSide;
 const throwMesh=add(drapeGeo,cloth,[0,0,0]);throwMesh.castShadow=false;throwMesh.receiveShadow=false;
 const cork=mat({color:'#9b7957',roughness:1});add(new THREE.CylinderGeometry(.085,.085,.009,40),cork,[.60,.805,.39]);
 // Thin reading glasses, resting on the paper rather than aligned with the table.
 const glasses=new THREE.Group();glasses.position.set(.32,.844,.27);glasses.rotation.set(-Math.PI/2,0,.22);group.add(glasses);
 const bronze=mat({color:'#8d7050',metalness:.68,roughness:.42});
 for(const side of [-1,1]){const ring=new THREE.Mesh(geometry(new THREE.TorusGeometry(.025,.0016,6,44)),bronze);ring.scale.y=.78;ring.position.x=side*.03;glasses.add(ring);}
 function wire(points,r=.0015){const g=geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),14,r,5,false));const o=new THREE.Mesh(g,bronze);glasses.add(o);}
 wire([[-.006,0,0],[0,.004,0],[.006,0,0]]);for(const side of [-1,1])wire([[side*.055,0,0],[side*.057,.026,0],[side*.052,.085,.005]]);
 // A woven bookmark escapes the near edge of the open book.
 const ribbon=mat({color:'#967255',roughness:1,side:THREE.DoubleSide});
 const ribbonGeo=new THREE.PlaneGeometry(.012,.14,2,12),rp=ribbonGeo.attributes.position;
 for(let i=0;i<rp.count;i++){const t=(rp.getY(i)+.07)/.14;rp.setXYZ(i,rp.getX(i),.834-Math.max(0,t-.53)*.14,.21+t*.14);}
 ribbonGeo.computeVertexNormals();const bookmark=add(ribbonGeo,ribbon,[.285,0,0]);
 // A small postcard leans against a shelf, giving a quiet second scale of detail.
 const card=box([.20,.15,.009],mount,[2.20,1.43,-2.43],[-.08,.02,.025]);
 const cardPrint=add(new THREE.PlaneGeometry(.172,.113),artMat,[2.20,1.436,-2.417],[-.08,.02,.025]);cardPrint.castShadow=false;
 return {group,painting,updateBook(amount){const t=THREE.MathUtils.smoothstep(amount,0,.25);glasses.position.set(THREE.MathUtils.lerp(.32,.76,t),THREE.MathUtils.lerp(.844,.783,t),THREE.MathUtils.lerp(.27,-.15,t));bookmark.visible=amount<.01;}};
}

/** Reuse individual books, varying grouping and empty space instead of cloning three rows. */
export function arrangeReadingBooks(outer,{scene,geometry,material}){
 outer.updateMatrixWorld(true);
 const units=outer.children[0].children[0].children.slice();
 function volume(index,height){
  const source=units[index%units.length],bounds=new THREE.Box3().setFromObject(source,true),center=bounds.getCenter(new THREE.Vector3());
  const g=new THREE.Group();g.name='Individual worn book';
  source.traverse(o=>{if(!o.isMesh)return;const shape=geometry(o.geometry.clone().applyMatrix4(o.matrixWorld));shape.translate(-center.x,-bounds.min.y,-center.z);const m=o.material.clone();m.roughness=.96;m.metalness=Math.min(m.metalness,.08);material(m);const mesh=new THREE.Mesh(shape,m);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);});
  const scale=height/(bounds.max.y-bounds.min.y);g.scale.set(scale*1.45,scale,scale);g.userData.width=(bounds.max.x-bounds.min.x)*scale*1.45;scene.add(g);return g;
 }
 const heights=[.33,.39,.35,.30,.38,.34,.37,.32,.36];
 let cursor=.94;for(let i=0;i<18;i++){const b=volume(i,heights[i%heights.length]);b.position.set(cursor+b.userData.width/2,.740,-2.34+(i%3)*.013);cursor+=b.userData.width+.003;b.rotation.y=(i%3-1)*.018;}
 cursor=1.07;for(let i=0;i<14;i++){const b=volume(i+9,heights[i%heights.length]+.02);b.position.set(cursor+b.userData.width/2,1.320,-2.37+(i%2)*.015);cursor+=b.userData.width+.002;}
 cursor=1.12;for(let i=0;i<10;i++){const b=volume(i+3,heights[i%heights.length]);b.position.set(cursor+b.userData.width/2,1.900,-2.35);cursor+=b.userData.width+.003;b.rotation.y=(i%2)*.02;}
 for(let i=0;i<3;i++){const b=volume(i+14,.37-i*.018);b.rotation.z=Math.PI/2;b.rotation.y=.08-i*.035;b.position.set(2.26,.79+i*.047,-2.31);}
 for(let i=0;i<2;i++){const b=volume(i+6,.32);b.rotation.z=Math.PI/2;b.rotation.y=-.12+i*.06;b.position.set(1.58,1.95+i*.043,-2.34);}
 outer.removeFromParent();
}
