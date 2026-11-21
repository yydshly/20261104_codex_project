import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {RoundedBoxGeometry} from './vendor/addons/geometries/RoundedBoxGeometry.js';

/** Gathered linen with an actual hem, pinned heading and restrained lower-edge motion. */
export function createLinenCurtains({scene,geometry,material,pbr}){
 const group=new THREE.Group();group.name='Gathered ivory linen — sewn panels';scene.add(group);
 const fabric=pbr('rough_linen',[5.5,10.8]);
 const time={value:0},windowGlow={value:.075};
 const cloth=material(new THREE.MeshPhysicalMaterial({color:'#eee4ce',...fabric,normalScale:new THREE.Vector2(.22,.22),roughness:.98,metalness:0,side:THREE.DoubleSide,sheen:.45,sheenRoughness:1,sheenColor:new THREE.Color('#e3d5bc')}));
 const wind=`float fall=pow(clamp((3.34-position.y)/3.25,0.,1.),2.);transformed.x+=sin(uLinenTime*.36+position.z*1.3)*.005*fall;transformed.z+=sin(uLinenTime*.29+position.y*.7)*.003*fall;`;
 function vertex(shader){shader.uniforms.uLinenTime=time;shader.vertexShader='uniform float uLinenTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+wind);}
 cloth.onBeforeCompile=shader=>{
  vertex(shader);shader.uniforms.uLinenWindow=windowGlow;
  shader.vertexShader='varying vec3 vLinenNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvLinenNormal=normalize(mat3(modelMatrix)*objectNormal);');
  shader.fragmentShader='uniform float uLinenWindow;varying vec3 vLinenNormal;\n'+shader.fragmentShader;
  // The source is blue linen; map its measured weave luminance onto undyed ivory.
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float linenLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
   diffuseColor.rgb=vec3(.73,.67,.55)*clamp(.87+linenLuma*.42,.87,1.12);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   float facing=pow(abs(normalize(vLinenNormal).x),1.3);
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.91,.96,1.)*uLinenWindow*(.3+.7*facing);`);
 };
 cloth.customProgramCacheKey=()=> 'reading-gathered-linen-v3';
 const depth=material(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide}));depth.onBeforeCompile=vertex;depth.customProgramCacheKey=()=> 'reading-linen-depth-v3';
 const brass=material(new THREE.MeshStandardMaterial({color:'#8d7961',metalness:.65,roughness:.46}));
 function add(g,m,p=[0,0,0],r=[0,0,0]){const o=new THREE.Mesh(geometry(g),m);o.position.set(...p);o.rotation.set(...r);group.add(o);return o;}
 const rail=add(new THREE.CylinderGeometry(.014,.014,3.08,16),brass,[-2.70,3.39,-.575],[Math.PI/2,0,0]);rail.castShadow=true;
 for(const z of [-2.12,.97]){add(new THREE.SphereGeometry(.027,12,8),brass,[-2.70,3.39,z]);add(new THREE.CylinderGeometry(.009,.009,.26,10),brass,[-2.84,3.39,z],[0,0,Math.PI/2]);}
 function point(u,t,center,phase){
  const width=.69+.13*Math.sin(t*Math.PI/2);
  const uneven=u+.025*Math.sin(u*7+phase)*Math.sin(Math.PI*u);
  const pleat=Math.sin(uneven*Math.PI*10+phase*.24)*.054+Math.sin(uneven*Math.PI*20+phase)*.009;
  const heading=THREE.MathUtils.smoothstep(t,0,.035);
  const x=-2.705+pleat*(.10+.90*heading)*(.72+.28*t)+Math.sin(t*4+u*5+phase)*.012*t;
  const y=3.34-t*3.245+Math.pow(t,12)*(.009*Math.sin(u*19+phase)+.004*Math.cos(u*31));
  const z=center+(u-.5)*width+Math.sin(t*2.2+phase)*.012*t;
  return new THREE.Vector3(x,y,z);
 }
 // Hanging hardware stays rigid; the panel mesh was relaxed under gravity in Blender.
 for(const [center,phase]of [[-1.80,.3],[.61,1.7]])for(let i=0;i<7;i++){
  const q=point(i/6,0,center,phase);add(new THREE.TorusGeometry(.016,.0022,6,14),brass,[-2.70,3.39,q.z]);
  add(new THREE.BoxGeometry(.002,.045,.022),cloth,[-2.703,3.356,q.z]);
 }
 let disposed=false;
 const ready=new GLTFLoader().loadAsync('./assets/reading/linen-curtains-v3.glb').then(gltf=>{
  gltf.scene.updateMatrixWorld(true);const meshes=[];
  gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const source of meshes){
   if(disposed){source.geometry.dispose();for(const m of [source.material].flat())m?.dispose();continue;}
   const g=source.geometry.clone().applyMatrix4(source.matrixWorld);source.geometry.dispose();
   if(source.material)for(const m of [source.material].flat())m.dispose();
   const mesh=add(g,cloth);mesh.name=source.name;mesh.castShadow=true;mesh.receiveShadow=true;mesh.customDepthMaterial=depth;
  }
 });
 return{group,ready,update(t){time.value=t;},dispose(){disposed=true;}};
}

/** Cabinet boards get physical veneer coordinates, joinery and a satin response. */
export function createWalnutBookcase({scene,geometry,material,pbr}){
 const group=new THREE.Group();group.name='Satin walnut bookcase — joined boards';scene.add(group);
 const maps=pbr('walnut_veneer',[1,1]);
 const walnut=material(new THREE.MeshPhysicalMaterial({color:'#b69a7c',...maps,normalScale:new THREE.Vector2(.15,.15),roughness:.72,metalness:0,clearcoat:.07,clearcoatRoughness:.62}));
 walnut.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor*.7+.22,.42,.80);');};walnut.customProgramCacheKey=()=> 'reading-satin-walnut-v3';
 const back=walnut.clone();back.color.multiplyScalar(.85);material(back);
 const end=walnut.clone();end.color.multiplyScalar(.94);end.roughness=.88;material(end);
 let boardIndex=0;
 function board(size,p,horizontal=false,mat=walnut){
  const g=new RoundedBoxGeometry(...size,3,Math.min(.0045,...size.map(s=>s/6))),pos=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,offset=boardIndex++*.183;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));
   let u,v;if(horizontal){u=(ny>.5?z:y)/1.8;v=x/1.8;}else{u=(nx>.5?z:x)/1.8;v=y/1.8;}
   uv.setXY(i,u+.41+offset,v+.26+offset*.3);
  }
  uv.needsUpdate=true;const o=new THREE.Mesh(geometry(g),mat);o.position.set(...p);o.castShadow=o.receiveShadow=true;group.add(o);return o;
 }
 for(const x of [.75,2.55])board([.045,2.25,.49],[x,1.125,-2.37]);
 const shelfTops=[.1575,.7375,1.3175,1.8975,2.2875];
 shelfTops.forEach((top,i)=>{const thick=i===0?.06:i===4?.05:.032;board([i===4?1.93:1.82,thick,.515],[1.65,top-thick/2,-2.37],true);});
 for(let i=0;i<3;i++)board([.593,2.16,.016],[1.054+i*.597,1.17,-2.618],false,back);
 board([1.82,.075,.055],[1.65,.055,-2.12],true,end);
 // Shelf pin holes and brass supports are instanced instead of creating many draw calls.
 const holes=new THREE.InstancedMesh(geometry(new THREE.CircleGeometry(.0027,8)),material(new THREE.MeshStandardMaterial({color:'#3d2d20',roughness:1})),104);
 const dummy=new THREE.Object3D();let k=0;
 for(const side of [-1,1])for(const z of [-2.18,-2.54])for(let i=0;i<26;i++){
  dummy.position.set(side<0?.773:2.527,.27+i*.064,z);dummy.rotation.set(0,side<0?Math.PI/2:-Math.PI/2,0);dummy.updateMatrix();holes.setMatrixAt(k++,dummy.matrix);
 }holes.instanceMatrix.needsUpdate=true;group.add(holes);
 const pinMat=material(new THREE.MeshStandardMaterial({color:'#a0927c',metalness:.7,roughness:.5}));
 for(const x of [.78,2.52])for(const y of [.706,1.286,1.866])for(const z of [-2.20,-2.53]){
  const pin=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.0035,.0035,.015,8)),pinMat);pin.position.set(x,y,z);pin.rotation.z=Math.PI/2;group.add(pin);
 }
 return{group};
}
