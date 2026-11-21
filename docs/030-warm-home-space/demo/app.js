import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { applyRealMaterials, loadRealPlants, setupWindowLighting } from './realism.js';
import { buildReferenceSofa, buildReferenceCurtains } from './soft-furnishings.js';
import { buildEntrance } from './entrance.js';
import { buildCeramicVase, buildTelevision } from './object-details.js';
import { installFurniture } from './furniture-assets.js';
import {mapOakGeometry,tabletopGeometry,buildWoolRug} from './surface-finishes.js';
import {buildCourtyardScene} from './courtyard-scene.js';
import {createContextRecovery,createRecoveryWarmup,renderSizing,recoveryStorageKey,validRecoverySnapshot} from './render-recovery.js';
import {prewarmSceneShaders} from './shader-warmup.js';

// Metres. The source image is a visual reference, not a measured floor plan.
const canvas = document.querySelector('#scene');
const errors = [];
let recoverySnapshot;
try{recoverySnapshot=validRecoverySnapshot(JSON.parse(sessionStorage.getItem(recoveryStorageKey)));sessionStorage.removeItem(recoveryStorageKey);}catch{}
const recoveryWarmup=createRecoveryWarmup();
if(recoverySnapshot)recoveryWarmup.start();
window.addEventListener('error', e => errors.push(e.message));
window.addEventListener('unhandledrejection', e => errors.push(String(e.reason)));
let renderer;
try {
  // Antialias once in the compositor instead of allocating a second MSAA
  // surface for the final canvas, which only receives a full-screen quad.
  renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:'high-performance'});
} catch(e) {
  document.querySelector('#failure').hidden = false;
  document.querySelector('#loading').style.display = 'none';
  throw e;
}
renderer.setPixelRatio(renderSizing(innerWidth,innerHeight,devicePixelRatio).ratio);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .98;
renderer.setClearColor(0xcfdce1);
const scene = new THREE.Scene();
scene.background = null;
const camera = new THREE.PerspectiveCamera(innerWidth/innerHeight<1.2?60:58,innerWidth/innerHeight,0.04,160);
camera.rotation.order = 'YXZ';
scene.environmentIntensity = .30;
const loadingManager = new THREE.LoadingManager();
loadingManager.onError = url => errors.push('Asset failed: '+url);
const loader = new THREE.TextureLoader(loadingManager);
function oakTexture(url,rx=1,ry=1){
  const result=new THREE.Texture();result.wrapS=result.wrapT=THREE.RepeatWrapping;result.repeat.set(rx,ry);result.colorSpace=THREE.SRGBColorSpace;result.anisotropy=8;
  loader.load(url,source=>{
    const c=document.createElement('canvas');c.width=source.image.width;c.height=source.image.height;
    const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(source.image,0,0);
    const pixels=context.getImageData(0,0,c.width,c.height),p=pixels.data;
    for(let i=0;i<p.length;i+=4){const l=(p[i]*.30+p[i+1]*.59+p[i+2]*.11)/255;p[i]=145+l*66;p[i+1]=107+l*66;p[i+2]=68+l*66;}
    context.putImageData(pixels,0,0);result.image=c;result.needsUpdate=true;source.dispose();
  });return result;
}
const materials = {};
const solids = [];
const warmLights = [];
const geoms = new Map();
const V = (x,y,z) => new THREE.Vector3(x,y,z);
const clamp = THREE.MathUtils.clamp;
let seed = 12;
const rand = () => {seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};

function standard(color,roughness=.75,extra={}) {
  return new THREE.MeshStandardMaterial({color,roughness,...extra});
}
function texture(url,rx=1,ry=1,color=true) {
  const t=loader.load(url); t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(rx,ry);t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  if(color)t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function clothTexture() {
  const size=128,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const weave=(x%4<2?10:-6)+(y%4<2?9:-5)+(rand()-.5)*14;
    data[i]=data[i+1]=data[i+2]=clamp(145+weave,0,255);data[i+3]=255;
  }
  const tex=new THREE.DataTexture(data,size,size);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(10,10);tex.needsUpdate=true;return tex;
}
const weave=clothTexture();
materials.wall=standard('#e6ded0',.96);
materials.ceiling=standard('#ede7dc',.98);
materials.trim=standard('#ddd4c4',.8);
materials.linen=standard('#c9bba4',.96,{bumpMap:weave,bumpScale:.012});
materials.cushion=standard('#ded0b9',.98,{bumpMap:weave,bumpScale:.017});
materials.sage=standard('#8c9778',.95,{bumpMap:weave,bumpScale:.012});
materials.throw=standard('#b8a88f',.99,{bumpMap:weave,bumpScale:.026});
materials.wood=standard('#ffffff',.64,{map:oakTexture('assets/oak.jpg'),bumpMap:texture('assets/oak.jpg',1,1,false),bumpScale:.009});
materials.darkwood=standard('#806448',.72);
materials.ceramic=standard('#a26d45',.8);
materials.cream=standard('#cec2aa',.8);
materials.dark=standard('#383a32',.5);
materials.brass=standard('#aa9164',.35,{metalness:.7});
materials.paper=standard('#e9dfc8',.95);
materials.rug=standard('#c3b69a',1,{bumpMap:weave,bumpScale:.045});
materials.floor=standard('#ffffff',.72,{
  map:oakTexture('assets/floor-color.jpg',2.8,3.8),
  normalMap:texture('assets/floor-normal.jpg',2.8,3.8,false),normalScale:new THREE.Vector2(.24,.24),
  roughnessMap:texture('assets/floor-roughness.jpg',2.8,3.8,false),
});
applyRealMaterials(materials,loader,renderer.capabilities.getMaxAnisotropy());
loadRealPlants(scene,loadingManager).catch(e=>errors.push('植物模型加载失败: '+e.message));
const windowLights=setupWindowLighting(scene,renderer,loadingManager);

function mesh(geo,mat,pos,parent=scene,shadow=true) {
  if(mat.map===materials.wood.map&&geo.attributes.uv)geo=mapOakGeometry(geo,pos);
  if([materials.linen,materials.cushion,materials.sage].includes(mat)){
    geo=geo.clone();const p=geo.attributes.position,n=geo.attributes.normal;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),wave=(Math.sin(x*43+Math.sin(y*11)*2)*Math.cos(z*31+y*9)+Math.sin(y*49+z*19)*.35)*.0025;
      p.setXYZ(i,x+n.getX(i)*wave,y+n.getY(i)*wave,z+n.getZ(i)*wave);
    }
  }
  const o=new THREE.Mesh(geo,mat); if(pos)o.position.set(...pos);
  o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o;
}
function box(w,h,d,pos,mat,parent=scene,r=0) {
  const radius=Math.min(r,w*.47,h*.47,d*.47);
  const key=[w,h,d,radius].join(':');
  if(!geoms.has(key))geoms.set(key,radius?new RoundedBoxGeometry(w,h,d,3,radius):new THREE.BoxGeometry(w,h,d));
  return mesh(geoms.get(key),mat,pos,parent);
}
function cyl(r1,r2,h,pos,mat,parent=scene,segments=40) {return mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat,pos,parent);}
function ball(pos,scale,mat,parent=scene) {
  const o=mesh(new THREE.SphereGeometry(1,24,16),mat,pos,parent);o.scale.set(...scale);return o;
}
function rod(a,b,r,mat,parent=scene){
  const av=V(...a),bv=V(...b),dir=bv.clone().sub(av);
  const o=cyl(r,r,dir.length(),av.clone().add(bv).multiplyScalar(.5).toArray(),mat,parent,10);
  o.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());return o;
}
function lathe(profile,pos,mat,parent=scene){return mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),48),mat,pos,parent);}
function group(pos,angle=0){const g=new THREE.Group();g.position.set(...pos);g.rotation.y=angle;scene.add(g);return g;}
function colliderRect(x1,z1,x2,z2){solids.push({x1,z1,x2,z2});}
function colliderCircle(x,z,r){solids.push({x,z,r});}

// Architecture. Front entrance is behind the initial camera.
const floor=box(5.6,.14,7.3,[0,-.075,0],materials.floor);
box(.18,2.78,7.4,[-2.82,1.39,0],materials.wall);
box(.18,2.78,7.4,[2.82,1.39,0],materials.wall);
box(5.8,.16,7.6,[0,2.86,0],materials.ceiling);
box(2.9,2.8,.15,[-1.43,1.4,3.8],materials.wall);
box(1.17,2.8,.15,[2.245,1.4,3.8],materials.wall);
box(1.5,.45,.15,[.85,2.575,3.8],materials.wall);
box(1.5,.07,.18,[.85,2.34,3.8],materials.wood);
box(.08,2.35,.18,[.08,1.175,3.8],materials.wood);
box(.08,2.35,.18,[1.62,1.175,3.8],materials.wood);
box(5.45,.09,.03,[0,.045,-3.62],materials.trim);
for(const x of [-2.71,2.71])box(.025,.11,7.35,[x,.055,0],materials.trim);
box(5.7,.39,.2,[0,2.6,-3.6],materials.wall);
for(const x of [-2.65,2.65])box(.18,2.38,.16,[x,1.19,-3.6],materials.wall);
// Dark aluminium sliding window. The central opening leads to the balcony.
for(const x of [-2.51,-.82,.83,2.51])box(.032,2.35,.055,[x,1.185,-3.59],materials.dark);
for(const y of [.025,2.35])box(5.06,.04,.07,[0,y,-3.59],materials.dark);
box(5.02,.018,.12,[0,.012,-3.58],materials.dark);
const glass=new THREE.MeshPhysicalMaterial({color:'#e1ece6',roughness:.08,metalness:.03,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false});
for(const x of [-1.665,1.67])box(1.63,2.28,.009,[x,1.18,-3.60],glass,scene,0).castShadow=false;
// Balcony railing and tiles.
const tile=standard('#c4c4b8',.92);
const balconyFloor=box(5.4,.06,1.1,[0,-.015,-4.2],tile);
const grout=standard('#a6a79d',1);
for(let x=-2.15;x<2.7;x+=.55)box(.003,.001,1.1,[x,.0156,-4.2],grout,scene,0).castShadow=false;
box(5.4,.001,.003,[0,.0156,-4.2],grout,scene,0).castShadow=false;
for(let x=-2.64;x<=2.65;x+=.11)rod([x,.06,-4.72],[x,1.10,-4.72],.009,materials.dark);
rod([-2.65,1.11,-4.72],[2.65,1.11,-4.72],.023,materials.dark);
rod([-2.65,.10,-4.72],[2.65,.10,-4.72],.014,materials.dark);
box(5.4,.1,.12,[0,.03,-4.77],materials.trim);
for(const x of [-2.7,2.7])box(.07,1.1,1.15,[x,.55,-4.2],materials.wall);

const curtains=buildReferenceCurtains(scene,materials);
const sofa=buildReferenceSofa(scene,materials);
colliderRect(-2.64,-2.20,-1.48,1.0);
const entrance=buildEntrance(scene,materials,{box,cyl,rod});
solids.push(...entrance.colliders);
const walkSurfaces=[floor,balconyFloor,entrance.floor,entrance.landing];

// Thick woven rug, coffee table, books, and a ceramic cup.
box(3.48,.025,3.53,[-.05,.0135,-.55],materials.rug,scene,.018);
buildWoolRug(scene,loader,renderer.capabilities.getMaxAnisotropy());
const coffee=group([-.13,0,-.62]);
cyl(.37,.40,.36,[0,.205,0],materials.wood,coffee);
const top=mesh(tabletopGeometry(.65,.06),materials.wood,[0,.413,0],coffee);top.scale.z=.78;
const book=box(.25,.038,.18,[-.21,.467,.02],materials.paper,coffee,.004);book.rotation.y=.2;
box(.26,.006,.19,[-.21,.488,.02],materials.cream,coffee,.002).rotation.y=.2;
function cup(pos,parent=scene){
  const g=new THREE.Group();g.position.set(...pos);parent.add(g);
  lathe([[0,0],[.055,0],[.065,.014],[.068,.11],[.061,.117],[.055,.107],[.052,.02],[0,.02]],[0,0,0],materials.cream,g);
  const handle=mesh(new THREE.TorusGeometry(.035,.009,10,24),materials.cream,[.073,.065,0],g);handle.rotation.y=Math.PI/2;
  cyl(.051,.051,.003,[0,.099,0],standard('#4e3523'),g);return g;
}
cup([.24,.443,-.08],coffee);colliderCircle(-.13,-.62,.72);

// Media sideboard: four real doors with shadow gaps and open floor below.
const media=group([2.42,0,-.62],-Math.PI/2);
box(3.30,.4,.47,[0,.34,0],materials.wood,media,.014);
for(const x of [-1.38,1.38])for(const z of [-.14,.14])box(.035,.17,.035,[x,.085,z],materials.darkwood,media,.005);
for(let i=0;i<4;i++)box(.812,.36,.026,[-1.23+i*.82,.34,.245],materials.wood,media,.004);
box(3.34,.03,.50,[0,.555,0],materials.wood,media,.01);
colliderRect(2.11,-2.34,2.72,1.10);
const television=buildTelevision(scene,materials,{box,cyl},loader);
const furnitureReady=installFurniture(scene,loadingManager,sofa,television,materials).catch(e=>{errors.push('家具加载失败: '+e.message);console.error(e);});

// Pots and branches; foliage is instanced so walking stays responsive.
const foliageMats=[standard('#536345',.85,{side:THREE.DoubleSide}),standard('#798755',.9,{side:THREE.DoubleSide})];
function plant(pos,height=.9,radius=.20,kind='tree'){
  const g=new THREE.Group();g.position.set(...pos);scene.add(g);
  lathe([[0,0],[radius*.68,0],[radius*.8,.025],[radius,height*.28],[radius*.95,height*.30],[radius*.87,height*.29],[radius*.75,.04],[0,.04]],[0,0,0],kind==='tree'?materials.cream:materials.ceramic,g);
  cyl(radius*.85,radius*.85,.015,[0,height*.29,0],standard('#443b2c'),g);
  const leafGeo=new THREE.SphereGeometry(1,9,6),count=kind==='tree'?95:48;
  const leaves=new THREE.InstancedMesh(leafGeo,foliageMats[kind==='tree'?0:1],count);
  leaves.castShadow=true;leaves.receiveShadow=true;g.add(leaves);
  const dummy=new THREE.Object3D();
  rod([0,height*.27,0],[.04,height*.91,0],.012,materials.darkwood,g);
  for(let i=0;i<count;i++){
    const h=height*(.43+rand()*.62),a=rand()*Math.PI*2;
    const spread=height*.32*Math.sqrt(rand())*(1-(h/height-.65)*.6);
    const x=Math.cos(a)*spread,z=Math.sin(a)*spread;
    dummy.position.set(x,h,z);dummy.rotation.set(rand()*.8,a,rand()*.8);
    const len=kind==='tree'?.08+rand()*.055:.10+rand()*.05;
    dummy.scale.set(len,.012,len*.45);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
    if(i%9===0)rod([.02,height*.58,0],[x,h,z],.004,materials.darkwood,g);
  }
  return g;
}
// Imported plants use their measured bounds to sit exactly on the supporting
// cabinet, balcony tiles or floor. The old cabinet plant was outside the top.
colliderCircle(-2.22,-2.78,.26);
colliderCircle(1.62,-4.20,.25);
// Ceramic vase on TV cabinet.
buildCeramicVase(scene,[2.43,.570,-1.81],.31,.14);

// Window reading chair with a curved wooden frame.
function armchair(pos,angle){
  const g=group(pos,angle);
  for(const x of [-.34,.34]){
    rod([x,.02,.30],[x,.67,.14],.035,materials.wood,g);
    rod([x,.02,-.28],[x,.86,-.30],.035,materials.wood,g);
    rod([x,.62,.33],[x,.69,-.35],.036,materials.wood,g);
    rod([x,.31,.23],[x,.34,-.28],.030,materials.wood,g);
  }
  box(.64,.12,.62,[0,.41,.01],materials.wood,g,.035);
  box(.63,.18,.61,[0,.51,.015],materials.cushion,g,.085);
  const back=box(.63,.58,.16,[0,.82,-.27],materials.cushion,g,.075);back.rotation.x=-.15;
  return g;
}
armchair([-1.22,0,-2.75],-.20);
colliderRect(-1.80,-3.22,-.65,-2.20);
const side=group([-.42,0,-2.80]);
cyl(.065,.095,.48,[0,.25,0],materials.wood,side);cyl(.23,.23,.038,[0,.51,0],materials.wood,side);cup([.01,.534,0],side);
colliderCircle(-.42,-2.80,.24);

// Framed original artwork, sampled from the image without substituting a new design.
const frame=group([-2.697,1.65,-.65],Math.PI/2);
box(.94,1.04,.045,[0,0,0],materials.wood,frame,.008);
box(.89,.99,.012,[0,0,.03],materials.paper,frame);
const art=loader.load('assets/reference.png');art.colorSpace=THREE.SRGBColorSpace;
art.repeat.set(.075,.15);art.offset.set(.349,.58);
mesh(new THREE.PlaneGeometry(.69,.77),new THREE.MeshBasicMaterial({map:art}),[0,0,.038],frame,false);

// Dining table with comfortable curved-back chairs.
const dining=group([-1.25,0,2.20]);
mesh(tabletopGeometry(.79,.055),materials.wood,[0,.76,0],dining);
cyl(.32,.39,.73,[0,.365,0],materials.wood,dining,48);
function diningChair(x,z,angle){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;dining.add(g);
  for(const sx of [-.21,.21])for(const sz of [-.19,.19])rod([sx*1.15,.02,sz*1.15],[sx,.47,sz],.023,materials.wood,g);
  box(.47,.055,.46,[0,.46,0],materials.wood,g,.06);
  box(.44,.055,.42,[0,.505,0],materials.cushion,g,.08);
  for(const sx of [-.225,.225])rod([sx,.48,-.19],[sx,.95,-.22],.025,materials.wood,g);
  const shape=new THREE.Shape();
  shape.moveTo(-.225,-.13);shape.lineTo(.225,-.13);shape.quadraticCurveTo(.255,-.13,.255,-.1);shape.lineTo(.255,.10);shape.quadraticCurveTo(.255,.14,.215,.14);shape.lineTo(-.215,.14);shape.quadraticCurveTo(-.255,.14,-.255,.10);shape.lineTo(-.255,-.10);shape.quadraticCurveTo(-.255,-.13,-.225,-.13);
  const backGeo=new THREE.ExtrudeGeometry(shape,{depth:.027,bevelEnabled:true,bevelSize:.007,bevelThickness:.006,bevelSegments:3,curveSegments:10});
  const bp=backGeo.attributes.position;for(let i=0;i<bp.count;i++)bp.setZ(i,bp.getZ(i)+bp.getX(i)**2*.65-.0135);backGeo.computeVertexNormals();
  mesh(backGeo,materials.wood,[0,.85,-.22],g);
}
diningChair(0,1.04,Math.PI);diningChair(0,-1.04,0);diningChair(-1.04,0,Math.PI/2);diningChair(1.04,0,-Math.PI/2);
colliderCircle(-1.25,2.20,1.23);
// Linen runner and a tactile, sculpted vase.
const runner=standard('#b4a78c',.96,{bumpMap:weave,bumpScale:.015});
box(.31,.004,1.22,[0,.79,0],runner,dining,.005);
buildCeramicVase(dining,[0,.792,0],.375,.17);
const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.014,.018,-.012,.045,0,.066);leafShape.bezierCurveTo(.012,.045,.014,.018,0,0);
const sprigLeafGeometry=new THREE.ShapeGeometry(leafShape,10),sprigPositions=sprigLeafGeometry.attributes.position;
for(let i=0;i<sprigPositions.count;i++)sprigPositions.setZ(i,Math.sin(sprigPositions.getY(i)/.066*Math.PI)*.0025*(1-Math.min(1,Math.abs(sprigPositions.getX(i))/.014)));
sprigLeafGeometry.computeVertexNormals();
for(let i=0;i<7;i++){
  const a=i*2.4,x=Math.sin(a)*.22,z=Math.cos(a)*.16,h=.51+rand()*.16;
  rod([0,1.12,0],[x,1.12+h,z],.003,materials.darkwood,dining);
  for(let j=1;j<=7;j++){
    const fraction=.2+j*.10,root=V(x*fraction,1.12+h*fraction,z*fraction),angle=a+j*2.35,dir=V(Math.cos(angle)*.55,.75,Math.sin(angle)*.55).normalize();
    const base=root.clone().addScaledVector(dir,.014);rod(root.toArray(),base.toArray(),.0012,materials.darkwood,dining);
    const leaf=mesh(sprigLeafGeometry,foliageMats[j%2],base.toArray(),dining);leaf.quaternion.setFromUnitVectors(V(0,1,0),dir);leaf.scale.setScalar(.7+rand()*.35);
  }
}
// Storage around the dining area: an illuminated niche and closed doors.
box(.38,2.73,2.15,[-2.56,1.365,2.43],materials.wood);
colliderRect(-2.76,1.35,-2.32,3.52);
for(let i=0;i<3;i++){
  box(.025,.88,.69,[-2.345,.49+i*.9,2.43],materials.wall,scene,.006);
}
box(.028,.63,.78,[-2.32,1.43,1.76],materials.darkwood,scene,.005);
box(.36,.024,.82,[-2.51,1.10,1.76],materials.wood);
box(.36,.024,.82,[-2.51,1.76,1.76],materials.wood);
for(let i=0;i<4;i++)box(.13,.045,.25,[-2.37,1.14+i*.047,1.80],i%2?materials.cream:materials.paper,scene,.004);
const nicheLight=new THREE.PointLight('#ffd7a0',.8,1.8,2);nicheLight.position.set(-2.19,1.65,1.72);scene.add(nicheLight);warmLights.push([nicheLight,.8,1.2]);

// Pendants, reading lamp, and recessed fixtures.
const shadeMat=standard('#d2ba8f',.94,{bumpMap:weave,bumpScale:.018,side:THREE.DoubleSide});
rod([-1.25,2.78,2.20],[-1.25,2.15,2.20],.006,materials.dark);
lathe([[.36,0],[.36,.30],[.32,.33]],[ -1.25,1.96,2.20],shadeMat);
const luminous=new THREE.MeshStandardMaterial({color:'#fff3d3',emissive:'#ffe2a5',emissiveIntensity:.8,side:THREE.DoubleSide});
const lampDisk=mesh(new THREE.CircleGeometry(.351,40),luminous,[-1.25,1.963,2.2]);lampDisk.rotation.x=Math.PI/2;
const pendant=new THREE.PointLight('#ffd59b',.3,5,2);pendant.position.set(-1.25,1.9,2.2);scene.add(pendant);warmLights.push([pendant,.3,3]);
cyl(.16,.17,.025,[-1.81,.02,-3.02],materials.brass);
rod([-1.81,.04,-3.02],[-1.81,1.51,-3.02],.012,materials.brass);
rod([-1.81,1.51,-3.02],[-1.52,1.57,-2.94],.012,materials.brass);
lathe([[.14,0],[.14,.10],[.09,.17],[0,.19]],[-1.52,1.38,-2.94],materials.brass);
const readingLight=new THREE.PointLight('#ffdaa0',1.3,2.7,2);readingLight.position.set(-1.52,1.37,-2.94);scene.add(readingLight);warmLights.push([readingLight,.4,2.6]);
for(const x of [-.5,1.7])for(const z of [-1.8,1.8]){
  const recess=cyl(.055,.055,.012,[x,2.768,z],luminous,scene,20);
  const l=new THREE.SpotLight('#ffe7be',.18,5,.95,.9,2);l.position.set(x,2.66,z);l.target.position.set(x,0,z);scene.add(l,l.target);warmLights.push([l,.18,2.1]);
}

// Render the modelled courtyard with its own daylight, sharing camera and depth.
const exterior=buildCourtyardScene(loader,loadingManager,renderer);
scene.userData.exteriorScene=exterior.scene;
const exteriorReady=exterior.ready.catch(e=>{errors.push('庭院模型加载失败: '+e.message);console.error(e);});
const skyHemi=new THREE.HemisphereLight('#e6edf0','#bda585',.28);scene.add(skyHemi);
const fill=new THREE.DirectionalLight('#ffe5bf',.12);fill.position.set(0,2.2,3.5);scene.add(fill);
const sun=new THREE.DirectionalLight('#fff5e8',.48);sun.position.set(-3,6,-7);sun.target.position.set(0,.25,.5);scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-4;sun.shadow.camera.near=.2;sun.shadow.camera.far=24;sun.shadow.normalBias=.012;sun.shadow.bias=-.00015;sun.shadow.radius=18;
sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;
const windowFill=new THREE.DirectionalLight('#edf1f0',.42);windowFill.position.set(1.0,2,-5);windowFill.target.position.set(0,.7,1);scene.add(windowFill,windowFill.target);

// Contact shadows remain soft even where direct daylight doesn't reach.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
const sc=shadowCanvas.getContext('2d');const grad=sc.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(49,35,20,.30)');grad.addColorStop(.55,'rgba(49,35,20,.16)');grad.addColorStop(1,'rgba(49,35,20,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);
const contactMap=new THREE.CanvasTexture(shadowCanvas);
function contact(x,z,w,d){const m=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false}),[x,.014,z],scene,false);m.rotation.x=-Math.PI/2;return m;}
contact(-2.01,-.6,1.6,3.7);contact(-.13,-.62,1.6,1.5);contact(-1.25,2.20,2.1,2.1);contact(2.42,-.62,1.0,3.8);contact(-1.22,-2.75,1.1,1.15);

// Navigation: collision, path finding, keyboard, drag, touch and floor picking.
const player={x:.85,z:8.18,y:1.48,yaw:0,pitch:-.145};
const keys=new Set();let entered=true,sitting=false,night=false,path=[],viewGoal=null,drag=null,plannedArrival=null,pendingEntry=false;
const walkMin={x:-2.48,z:-4.43},walkMax={x:2.48,z:8.52};
const radius=.19;
function blocked(x,z){
  if(x<walkMin.x||x>walkMax.x||z<walkMin.z||z>walkMax.z)return true;
  // The rear wall only opens into the bounded foyer, not into empty space.
  if(z>3.55&&(x<.31||x>1.39))return true;
  if(z>5.78&&z<6.20&&(x<.38||x>1.32))return true;
  if(entrance.blocks(x,z,radius))return true;
  // Window panels are solid, the middle sliding section is open.
  if(Math.abs(z+3.59)<.035+radius&&(x-radius<-.804||x+radius>.814))return true;
  for(const s of solids){
    if(s.r!==undefined){if(Math.hypot(x-s.x,z-s.z)<s.r+radius)return true;}
    else if(x>s.x1-radius&&x<s.x2+radius&&z>s.z1-radius&&z<s.z2+radius)return true;
  }
  return false;
}
function segmentFree(a,b){const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.075);for(let i=1;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;}
function findPath(target){
  if(blocked(target.x,target.z))return [];
  const start={x:player.x,z:player.z};
  if(segmentFree(start,target))return [target];
  const step=.16,nx=Math.floor((walkMax.x-walkMin.x)/step)+1,nz=Math.floor((walkMax.z-walkMin.z)/step)+1;
  const toCell=p=>({i:clamp(Math.round((p.x-walkMin.x)/step),0,nx-1),j:clamp(Math.round((p.z-walkMin.z)/step),0,nz-1)});
  const pos=(i,j)=>({x:walkMin.x+i*step,z:walkMin.z+j*step});
  const closestFreeCell=p=>{
    const c=toCell(p),candidates=[];
    for(let di=-3;di<=3;di++)for(let dj=-3;dj<=3;dj++){
      const i=c.i+di,j=c.j+dj;if(i<0||j<0||i>=nx||j>=nz)continue;
      const at=pos(i,j);if(!blocked(at.x,at.z)&&segmentFree(p,at))candidates.push({i,j,dist:Math.hypot(at.x-p.x,at.z-p.z)});
    }
    candidates.sort((a,b)=>a.dist-b.dist);return candidates[0];
  };
  const a=closestFreeCell(start),b=closestFreeCell(target),id=(i,j)=>j*nx+i;
  if(!a||!b)return [];
  const open=[{...a,g:0,f:0}],cost=new Map([[id(a.i,a.j),0]]),prev=new Map();
  const closed=new Set();let end;
  while(open.length){
    open.sort((a,b)=>a.f-b.f);const n=open.shift(),nid=id(n.i,n.j);
    if(closed.has(nid))continue;closed.add(nid);
    if(n.i===b.i&&n.j===b.j){end=n;break;}
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const i=n.i+di,j=n.j+dj;if(i<0||j<0||i>=nx||j>=nz)continue;
      const p=pos(i,j);if(blocked(p.x,p.z))continue;
      if(di&&dj&&(blocked(pos(n.i+di,n.j).x,pos(n.i+di,n.j).z)||blocked(pos(n.i,n.j+dj).x,pos(n.i,n.j+dj).z)))continue;
      const g=n.g+Math.hypot(di,dj),ii=id(i,j);if(g>=(cost.get(ii)??Infinity))continue;
      cost.set(ii,g);prev.set(ii,nid);open.push({i,j,g,f:g+Math.hypot(i-b.i,j-b.j)});
    }
  }
  if(!end)return [];
  let ii=id(end.i,end.j),pts=[target];
  while(ii!==id(a.i,a.j)&&prev.has(ii)){pts.unshift(pos(ii%nx,Math.floor(ii/nx)));ii=prev.get(ii);}
  const smooth=[];let current=start;
  while(pts.length){if(!segmentFree(current,pts[0]))return [];let far=0;for(let i=0;i<pts.length;i++){if(segmentFree(current,pts[i]))far=i;else break;}current=pts[far];smooth.push(current);pts.splice(0,far+1);}
  return smooth;
}
const presets={
  entry:{x:.92,z:3.32,look:[-.15,1.18,-1.3],label:'客餐厅 · 入口'},
  living:{x:-1.13,z:.08,look:[-2.12,.78,-.75],label:'客厅 · 沙发细节'},
  dining:{x:.32,z:2.55,look:[-1.25,1.10,2.2],label:'餐厅 · 餐桌旁'},
  window:{x:.20,z:-2.95,look:[-.9,1.05,-2.25],label:'窗边 · 阅读角'},
  balcony:{x:.15,z:-4.08,look:[0,1.35,-18],label:'阳台 · 庭院景观'},
  reverse:{x:.65,z:-1.88,look:[.90,1.25,4.95],label:'客厅 · 回看入口'},
  foyer:{x:.85,z:2.60,look:[.85,1.15,5.94],label:'玄关入口 · 入户门'},
};
function activeView(name){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));}
function hint(text){const h=document.querySelector('#hint');h.textContent=text;h.classList.remove('dismissed');clearTimeout(hint.timer);hint.timer=setTimeout(()=>h.classList.add('dismissed'),5500);}
function begin(){if(entered)return;entered=true;document.querySelector('#welcome').classList.add('closed');canvas.focus();hint('拖动环顾 · 点击地面行走 · WASD 自由移动');}

function zoneLabel(){return player.z< -3.65?'阳台 · 自由探索':player.z>6.10?'门外 · 入户前':player.z>3.55?'玄关 · 自由探索':'客餐厅 · 自由探索';}
function setDoor(open){
  if(!entrance.setOpen(open,player)){hint('你在门扇转动范围内，请向门外或客厅方向退一步再操作');return false;}
  path=[];plannedArrival=null;pendingEntry=false;
  document.querySelector('#doorBtn').textContent=open?'关入户门':'开入户门';
  document.querySelector('#doorBtn').setAttribute('aria-expanded',String(open));
  hint(open?'入户门正在打开，可以从门外穿过玄关':'入户门正在关闭');canvas.focus();return true;
}
function resetEntrance(){
  keys.clear();path=[];plannedArrival=null;pendingEntry=false;unsit();entrance.reset();
  sun.shadow.needsUpdate=true;
  Object.assign(player,{x:.85,z:8.18,y:1.48,yaw:0,pitch:-.145});viewGoal=null;activeView('');
  document.querySelector('#doorBtn').textContent='开入户门';document.querySelector('#doorBtn').setAttribute('aria-expanded','false');
  document.querySelector('#location').textContent=zoneLabel();hint('你现在站在门外，点击入户门或按 E 开门');canvas.focus();
}
document.querySelector('#doorBtn').addEventListener('click',()=>setDoor(!entrance.open));
document.querySelector('#outsideBtn').addEventListener('click',resetEntrance);
document.querySelector('#enterHomeBtn').addEventListener('click',()=>{
  if(player.z<6.15)resetEntrance();
  if(setDoor(true)){pendingEntry=true;viewGoal=[.85,1.15,-1.5];hint('先打开入户门，再沿玄关走进客厅');}
});
document.querySelector('#startBtn').addEventListener('click',begin);
function unsit(){if(sitting){player.x=-1.10;player.z=0;document.querySelector('#location').textContent='客餐厅 · 自由探索';}sitting=false;document.querySelector('#sitBtn').setAttribute('aria-pressed','false');document.querySelector('#sitBtn').textContent='坐下看看';document.querySelector('#controlState').textContent='自由行走 · 拖动环顾';}
function goPreset(name){
  begin();unsit();pendingEntry=false;const p=presets[name];path=findPath(p);
  if(!path.length&&Math.hypot(player.x-p.x,player.z-p.z)>.08){hint(player.z>5.94&&!entrance.open?'先打开入户门，或点击「开门并走进客厅」':'这条路径暂时走不通，可以先退到开阔处');return;}
  viewGoal=p.look;activeView(name);
  plannedArrival={x:p.x,z:p.z,label:p.label};canvas.dataset.pathLength=String(path.length);
  document.querySelector('#location').textContent=p.label;
  hint(name==='balcony'?'正从中央开口走到阳台，可以转向或侧移观察庭院':name==='window'?'窗边阅读角，也可以从中间的开口走到阳台':'正在走向'+p.label.split(' · ')[1]);
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>goPreset(b.dataset.view)));
document.querySelector('#sitBtn').addEventListener('click',()=>{
  begin();pendingEntry=false;
  if(sitting){unsit();player.x=-1.12;player.z=.0;hint('已起身，可以继续走动');return;}
  path=[];viewGoal=[2.43,1.15,-.62];player.x=-1.85;player.z=-.45;sitting=true;
  document.querySelector('#sitBtn').textContent='站起来';document.querySelector('#sitBtn').setAttribute('aria-pressed','true');activeView('living');
  document.querySelector('#location').textContent='沙发上 · 坐姿视角';hint('坐在沙发上看看，点击电视可开关屏幕；移动时自动起身');
  document.querySelector('#controlState').textContent='坐姿 · 移动时会自动起身';
});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const ring=mesh(new THREE.RingGeometry(.10,.125,48),new THREE.MeshBasicMaterial({color:'#6b7e5e',transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}),[0,.035,0],scene,false);ring.rotation.x=-Math.PI/2;ring.visible=false;
let ringTime=0;
canvas.addEventListener('pointerdown',e=>{
  if(e.button>0)return;begin();
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);canvas.focus();
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;
  if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;
  if(drag.moved){player.yaw-=dx*.0033;player.pitch=clamp(player.pitch-dy*.0028,-1.25,1.1);viewGoal=null;path=[];pendingEntry=false;canvas.dataset.lastInput='drag';}
  drag.lx=e.clientX;drag.ly=e.clientY;
});
canvas.addEventListener('pointerup',e=>{
  if(!drag||drag.id!==e.pointerId)return;const clicked=!drag.moved;drag=null;
  if(!clicked)return;
  const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
  const doorHit=raycaster.intersectObjects(entrance.interactive)[0],tvHit=raycaster.intersectObjects(television.interactive)[0];
  if(doorHit&&doorHit.distance<3.8){setDoor(!entrance.open);canvas.dataset.lastInput='door-click';return;}
  if(tvHit&&tvHit.distance<5.5){hint(television.toggle()?'电视已开启，点击屏幕可关闭':'电视已关闭，屏幕保留室内反射');canvas.dataset.lastInput='tv-click';return;}
  if(sitting)unsit();
  const hit=raycaster.intersectObjects(walkSurfaces)[0];if(!hit){hint('拖动画面可以转向，点击地面可以行走');return;}
  const target={x:hit.point.x,z:hit.point.z},route=findPath(target);
  if(!route.length){hint('这里有家具，试着点旁边的空地');return;}
  path=route;pendingEntry=false;viewGoal=null;activeView('');document.querySelector('#location').textContent=zoneLabel();
  plannedArrival={...target,label:'选定的位置'};canvas.dataset.pathLength=String(path.length);
  canvas.dataset.lastInput='floor-click';
  ring.position.set(target.x,.037,target.z);ring.visible=true;ringTime=2.5;
});
canvas.addEventListener('pointercancel',()=>{drag=null;});
canvas.addEventListener('lostpointercapture',()=>{drag=null;});
const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'turnleft',KeyD:'right',ArrowRight:'turnright'};
window.addEventListener('keydown',e=>{
  if(!recovery.canRender()||document.querySelector('#referenceDialog').open||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.code==='Escape'){keys.clear();path=[];pendingEntry=false;viewGoal=null;return;}
  if(e.code==='KeyE'&&!e.repeat){e.preventDefault();setDoor(!entrance.open);return;}
  if(keyMap[e.code]){e.preventDefault();begin();if(sitting&&!keyMap[e.code].startsWith('turn'))unsit();keys.add(keyMap[e.code]);path=[];pendingEntry=false;viewGoal=null;activeView('');document.querySelector('#location').textContent=sitting?'沙发上 · 坐姿视角':zoneLabel();canvas.dataset.lastInput='keyboard';}
});
window.addEventListener('keyup',e=>keys.delete(keyMap[e.code]));window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
document.querySelectorAll('[data-move]').forEach(b=>{
  function tap(){
    begin();const action=b.dataset.move;if(sitting&&!action.startsWith('turn'))unsit();path=[];pendingEntry=false;viewGoal=null;activeView('');
    if(action==='turnleft')player.yaw+=.16;
    else if(action==='turnright')player.yaw-=.16;
    else{
      const f=action==='forward'?1:action==='back'?-1:0,s=action==='right'?1:action==='left'?-1:0;
      move((-Math.sin(player.yaw)*f+Math.cos(player.yaw)*s)*.17,(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*s)*.17);
    }
    canvas.dataset.lastInput='button-'+action;document.querySelector('#location').textContent=sitting?'沙发上 · 坐姿视角':zoneLabel();
  }
  b.addEventListener('pointerdown',e=>{e.preventDefault();tap();keys.add(b.dataset.move);b.classList.add('pressed');b.setPointerCapture(e.pointerId);});
  b.addEventListener('click',e=>{if(e.detail===0)tap();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(b.dataset.move);b.classList.remove('pressed');});
});
document.querySelector('#levelViewBtn').addEventListener('click',()=>{player.pitch=-.06;viewGoal=null;path=[];pendingEntry=false;canvas.focus();hint('视角已回到水平方向，拖动可以查看四周');});
function move(dx,dz){
  if(!blocked(player.x+dx,player.z))player.x+=dx;
  if(!blocked(player.x,player.z+dz))player.z+=dz;
}

// Day and evening are scene lighting changes, not a filter over the image.
function setEvening(value){
  night=value;document.body.classList.toggle('night',night);
  curtains.userData.daylight.value=night?.08:1;
  document.querySelector('#lightBtn').textContent=night?'切换白天':'切换傍晚';document.querySelector('#lightBtn').setAttribute('aria-pressed',String(night));
  scene.environmentIntensity=night?.23:.30;
  skyHemi.intensity=night?.15:.28;fill.intensity=night?.1:.12;sun.intensity=night?.1:.48;windowFill.intensity=night?.14:.42;
  windowLights.window.intensity=night?.55:3.2;windowLights.bounce.intensity=night?.25:.46;
  exterior.setEvening(night);
  sun.color.set(night?'#f3b582':'#fff5e8');renderer.toneMappingExposure=.98;
  for(const [l,day,dusk]of warmLights)l.intensity=night?dusk:day;
}
document.querySelector('#lightBtn').addEventListener('click',()=>setEvening(!night));
document.querySelector('#fullscreenBtn').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('#experience').requestFullscreen();}catch{hint('当前窗口不支持全屏，可直接在这里体验');}
});
document.addEventListener('fullscreenchange',()=>{document.querySelector('#fullscreenBtn').textContent=document.fullscreenElement?'退出全屏':'全屏';});
const dialog=document.querySelector('#referenceDialog');
document.querySelector('#referenceBtn').addEventListener('click',()=>{keys.clear();path=[];dialog.showModal();});
document.querySelector('#closeReference').addEventListener('click',()=>{dialog.close();canvas.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
document.querySelector('#mapToggle').addEventListener('click',e=>{
  const closed=document.querySelector('.map-panel').classList.toggle('collapsed');e.currentTarget.textContent=closed?'+':'−';e.currentTarget.setAttribute('aria-expanded',String(!closed));e.currentTarget.title=closed?'展开平面图':'收起平面图';
});

const mapCanvas=document.querySelector('#minimap'),ctx=mapCanvas.getContext('2d');
function drawMap(){
  const mx=x=>132+x*40,my=z=>126+z*26;
  ctx.clearRect(0,0,264,400);
  ctx.fillStyle='#eee8d8';ctx.fillRect(mx(-2.7),my(-3.6),216,7.2*26);ctx.fillRect(mx(-.04),my(3.6),1.78*40,2.4*26);
  ctx.fillStyle='#dcdcd5';ctx.fillRect(mx(-.04),my(6.1),1.78*40,2.65*26);
  ctx.strokeStyle='#a59c85';ctx.lineWidth=3;ctx.strokeRect(mx(-.04),my(6.1),1.78*40,2.65*26);
  ctx.fillStyle='#e3e7d6';ctx.fillRect(mx(-2.7),my(-4.6),216,26);
  ctx.strokeStyle='#a59c85';ctx.lineWidth=4;ctx.strokeRect(mx(-2.7),my(-3.6),216,7.2*26);ctx.strokeRect(mx(-.04),my(3.6),1.78*40,2.4*26);
  ctx.fillStyle='#eee8d8';ctx.fillRect(mx(.1),my(3.5),1.5*40,9);
  ctx.strokeStyle='#8b7454';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(mx(1.52),my(5.94));ctx.lineTo(mx(1.52-1.34*Math.cos(entrance.angle)),my(5.94-1.34*Math.sin(entrance.angle)));ctx.stroke();
  ctx.strokeStyle='#8a9b90';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(mx(-2.6),my(-3.6));ctx.lineTo(mx(-.82),my(-3.6));ctx.moveTo(mx(.83),my(-3.6));ctx.lineTo(mx(2.6),my(-3.6));ctx.stroke();
  ctx.fillStyle='#c7bca4';ctx.fillRect(mx(-2.6),my(-2.1),41,75);
  ctx.fillStyle='#d8d0bb';ctx.fillRect(mx(-1.74),my(-2.3),139,91);
  ctx.fillStyle='#bea484';ctx.beginPath();ctx.ellipse(mx(-.13),my(-.62),26,18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b3baa3';ctx.fillRect(mx(-1.66),my(-3.14),32,23);
  ctx.fillStyle='#b8a287';ctx.fillRect(mx(2.13),my(-2.2),20,84);
  ctx.beginPath();ctx.arc(mx(-1.25),my(2.2),31,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(mx(player.x),my(player.z));ctx.rotate(-player.yaw);
  ctx.fillStyle='#6a7d592d';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-17,-31);ctx.quadraticCurveTo(0,-38,17,-31);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fillStyle='#657953';ctx.fill();ctx.strokeStyle='#fffaf0';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();
}
function createCompositor(){
  const result=new EffectComposer(renderer),quality=renderSizing(innerWidth,innerHeight,devicePixelRatio);
  result.renderTarget1.samples=quality.samples;result.renderTarget2.samples=quality.samples;
  result.addPass(new RenderPass(exterior.scene,camera));
  const interiorPass=new RenderPass(scene,camera);interiorPass.clear=false;result.addPass(interiorPass);
  const ao=new SSAOPass(scene,camera,innerWidth,innerHeight,16);ao.kernelRadius=.22;ao.minDistance=.001;ao.maxDistance=.045;
  result.addPass(ao);result.addPass(new OutputPass());return result;
}
function disposeCompositor(){
  for(const pass of composer.passes){
    if(pass instanceof SSAOPass){pass.ssaoMaterial.dispose();pass.noiseTexture.dispose();pass.normalRenderTarget.depthTexture?.dispose();}
    pass.dispose();
  }
  composer.dispose();
}
let composer=createCompositor();
renderer.info.autoReset=false;
function resizeRendering(){
  camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<1.2?60:58;camera.updateProjectionMatrix();
  const quality=renderSizing(innerWidth,innerHeight,devicePixelRatio);
  renderer.setPixelRatio(quality.ratio);renderer.setSize(innerWidth,innerHeight);
  composer.setPixelRatio(quality.ratio);composer.setSize(innerWidth,innerHeight);
}
document.querySelector('#saveViewBtn').addEventListener('click',()=>{
  if(!recovery.canRender())return;
  composer.render(0);
  canvas.toBlob(blob=>{
    if(!blob){hint('当前视角暂时无法保存，请稍后重试');return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='warm-home-view.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  },'image/png');
});
window.addEventListener('resize',()=>{if(recovery.canRender())resizeRendering();});
let ready=false,frames=0,seconds=0,fps=0,last=performance.now(),presentedFrames=0,slowFrames250=0;
const frameIntervals=[],slowFrameDetails=[];
function reportRenderHealth(){const times=[...frameIntervals].sort((a,b)=>a-b);canvas.dataset.renderHealth=JSON.stringify({presentedFrames,contextHealthy:!renderer.getContext().isContextLost(),textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,programs:renderer.info.programs.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,width:canvas.width,height:canvas.height,samples:composer.renderTarget1.samples,environmentBuilds:windowLights.builds,maxFps:recoveryWarmup.maxFps,warming:recoveryWarmup.active,frameMs:{p95:+(times[Math.floor(times.length*.95)]??0).toFixed(2),recentMax:+(times.at(-1)??0).toFixed(2),slow250Total:slowFrames250},slowFrameDetails});}
function render(now){
  requestAnimationFrame(render);
  if(!recovery.canRender()||document.hidden){last=now;return;}
  // High-refresh displays otherwise execute every render pass 200+ times/s.
  if(now-last<1000/recoveryWarmup.maxFps-.5)return;
  const elapsed=(now-last)/1000,dt=Math.min(elapsed,.05);last=now;seconds+=elapsed;frames++;
  frameIntervals.push(elapsed*1000);if(frameIntervals.length>600)frameIntervals.shift();if(elapsed>.25)slowFrames250++;
  if(seconds>=1){
    fps=Math.round(frames/seconds);frames=0;seconds=0;
    canvas.dataset.position=JSON.stringify({x:+player.x.toFixed(3),z:+player.z.toFixed(3),y:+player.y.toFixed(3),yaw:+player.yaw.toFixed(3)});canvas.dataset.fps=String(fps);canvas.dataset.pathLength=String(path.length);
    canvas.dataset.doorAngle=String(Math.round(entrance.angle*180/Math.PI));
    canvas.dataset.plantSupports=JSON.stringify(scene.children.filter(o=>o.userData.support).map(o=>({name:o.name,surface:o.userData.support.surface,bottom:+new THREE.Box3().setFromObject(o).min.y.toFixed(6),x:o.userData.support.x,z:o.userData.support.z})));
  }
  const paused=dialog.open;
  if(!paused){
    if(entrance.moving)sun.shadow.needsUpdate=true;
    entrance.update(dt,player);
    const doorState=entrance.obstructed?'obstructed':entrance.moving?(entrance.open?'opening':'closing'):(entrance.open?'open':'closed');
    if(canvas.dataset.doorState!==doorState){canvas.dataset.doorState=doorState;document.querySelector('#doorState').textContent={opening:'正在开门',closing:'正在关门',open:'门已打开',closed:'门已关闭',obstructed:'请离开门口'}[doorState];}
    if(pendingEntry&&entrance.angle>1.56){
      const approach={x:.85,z:4.85},route=findPath(approach);pendingEntry=false;
      if(route.length){path=[...route,{x:.85,z:3.25},{x:1.20,z:.80}];viewGoal=[-.15,1.12,-1.4];plannedArrival={x:1.20,z:.80,label:'客厅'};canvas.dataset.pathLength=String(path.length);canvas.dataset.lastInput='entry-tour';hint('正在经过玄关，走向客厅；拖动或按键可随时接管');}
      else hint('门口暂时无法通过，请退到门外再试');
    }
    if(keys.has('turnleft'))player.yaw+=dt*1.15;
    if(keys.has('turnright'))player.yaw-=dt*1.15;
    let forward=(keys.has('forward')?1:0)-(keys.has('back')?1:0),side=(keys.has('right')?1:0)-(keys.has('left')?1:0);
    if((forward||side)&&!sitting){
      const length=Math.hypot(forward,side);forward/=length;side/=length;
      move((-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*side)*dt*1.35,(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*side)*dt*1.35);
    }
    if(path.length&&!sitting){
      const p=path[0],dx=p.x-player.x,dz=p.z-player.z,dist=Math.hypot(dx,dz),step=dt*1.15;
      if(dist<step+.015){player.x=p.x;player.z=p.z;path.shift();}
      else move(dx/dist*step,dz/dist*step);
    }
    if(plannedArrival&&!path.length){
      if(Math.hypot(player.x-plannedArrival.x,player.z-plannedArrival.z)<.06)hint('已到达'+plannedArrival.label+'，可以拖动查看四周');
      plannedArrival=null;
    }
    if(viewGoal&&!drag){
      const dx=viewGoal[0]-player.x,dz=viewGoal[2]-player.z;
      const yaw=Math.atan2(-dx,-dz),pitch=Math.atan2(viewGoal[1]-player.y,Math.hypot(dx,dz));
      let delta=Math.atan2(Math.sin(yaw-player.yaw),Math.cos(yaw-player.yaw));
      player.yaw+=delta*(1-Math.exp(-dt*2.8));player.pitch+=(pitch-player.pitch)*(1-Math.exp(-dt*2.8));
      if(!path.length&&Math.abs(delta)<.001)viewGoal=null;
    }
    player.y+=((sitting?1.02:1.48)-player.y)*(1-Math.exp(-dt*6));
    const stage=player.z>6.10?'门外 · 开门后进入':player.z>3.55?'玄关 · 继续向前是客厅':'客厅 · 可以自由探索';
    document.querySelector('.entry-panel').classList.toggle('in-room',player.z<3.55);
    if(document.querySelector('#entryProgress').textContent!==stage)document.querySelector('#entryProgress').textContent=stage;
    if(path.length||keys.size)document.querySelector('#location').textContent=sitting?'沙发上 · 坐姿视角':zoneLabel();
  }
  camera.position.set(player.x,player.y,player.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  if(ring.visible){ringTime-=dt;ring.material.opacity=Math.min(ringTime,.8);ring.visible=ringTime>0;}
  exterior.scene.environment=scene.environment;
  try{
    renderer.info.reset();const submitStart=performance.now();exterior.update(dt,paused);const updateEnd=performance.now();composer.render(dt);const submitEnd=performance.now();
    if(elapsed>.25||submitEnd-submitStart>150){slowFrameDetails.push({at:Date.now(),gapMs:+(elapsed*1000).toFixed(1),updateMs:+(updateEnd-submitStart).toFixed(1),renderMs:+(submitEnd-updateEnd).toFixed(1),x:+player.x.toFixed(2),z:+player.z.toFixed(2),night,path:path.length});if(slowFrameDetails.length>20)slowFrameDetails.shift();}
    presentedFrames++;recovery.presented();
    const wasWarming=recoveryWarmup.active;recoveryWarmup.presented();
    if(wasWarming&&!recoveryWarmup.active){syncRecoveryInfo();reportRenderHealth();}
    drawMap();
    if(frames===0)reportRenderHealth();
  }catch(error){errors.push('Render failed: '+error.message);recovery.fail(error.message);}
}
const recoveryPanel=document.querySelector('#graphicsRecovery'),recoveryMessage=document.querySelector('#graphicsMessage'),retryGraphics=document.querySelector('#retryGraphics');
let suspendedSnapshot;
function captureRecoverySnapshot(){
  return {player:{...player},sitting,night,entered,door:{angle:entrance.angle,open:entrance.open},path:path.map(p=>({...p})),viewGoal,plannedArrival,pendingEntry};
}
function reloadCurrentView(automatic=false){
  try{
    const attemptKey=recoveryStorageKey+':reload-at',previous=Number(sessionStorage.getItem(attemptKey));
    if(automatic&&previous&&Date.now()-previous<60000)throw Error('Repeated recovery');
    sessionStorage.setItem(recoveryStorageKey,JSON.stringify({version:1,time:Date.now(),snapshot:suspendedSnapshot??captureRecoverySnapshot()}));
    sessionStorage.setItem(attemptKey,String(Date.now()));location.reload();
  }catch{
    recoveryMessage.textContent='画面恢复暂时没有完成，你的位置和视角已保留。';retryGraphics.hidden=false;
  }
}
function syncRecoveryInfo(status=JSON.parse(canvas.dataset.recovery)){canvas.dataset.recovery=JSON.stringify({...status,warming:recoveryWarmup.active,reloaded:Boolean(recoverySnapshot)});}
const recovery=createContextRecovery(canvas,{
  suspend(){suspendedSnapshot=captureRecoverySnapshot();keys.clear();drag=null;recoveryWarmup.start();},
  async rebuild(){
    renderer.setRenderTarget(null);renderer.autoClear=true;scene.overrideMaterial=null;disposeCompositor();
    windowLights.rebuildEnvironment();exterior.restore();sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;
    composer=createCompositor();resizeRendering();last=performance.now();frames=0;seconds=0;frameIntervals.length=0;
    await prewarmSceneShaders(renderer,[scene,exterior.scene],camera,composer.readBuffer);last=performance.now();
  },
  publish(status){
    reportRenderHealth();canvas.dataset.renderState=status.state;syncRecoveryInfo(status);
    recoveryPanel.hidden=status.state==='ready';retryGraphics.hidden=true;
    if(status.state==='ready')suspendedSnapshot=undefined;
    if(status.state!=='ready')recoveryMessage.textContent='会保留你的位置和视角，请稍候。';
  },
  fallback(reason){canvas.dataset.recoveryReason=reason;recoveryMessage.textContent='正在重新连接画面，会回到刚才的位置。';reloadCurrentView(true);},
});
retryGraphics.addEventListener('click',()=>reloadCurrentView());
if(recoverySnapshot){
  Object.assign(player,recoverySnapshot.player);sitting=Boolean(recoverySnapshot.sitting);entered=Boolean(recoverySnapshot.entered);
  if(Number.isFinite(recoverySnapshot.door?.angle))entrance.restore(recoverySnapshot.door);
  document.querySelector('#doorBtn').textContent=entrance.open?'关入户门':'开入户门';document.querySelector('#doorBtn').setAttribute('aria-expanded',String(entrance.open));
  const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.x>=walkMin.x&&p.x<=walkMax.x&&p.z>=walkMin.z&&p.z<=walkMax.z;
  path=Array.isArray(recoverySnapshot.path)?recoverySnapshot.path.filter(validPoint):[];
  plannedArrival=validPoint(recoverySnapshot.plannedArrival)?recoverySnapshot.plannedArrival:null;
  viewGoal=Array.isArray(recoverySnapshot.viewGoal)&&recoverySnapshot.viewGoal.length===3&&recoverySnapshot.viewGoal.every(Number.isFinite)?recoverySnapshot.viewGoal:null;
  pendingEntry=Boolean(recoverySnapshot.pendingEntry);setEvening(Boolean(recoverySnapshot.night));
  document.querySelector('#sitBtn').setAttribute('aria-pressed',String(sitting));document.querySelector('#sitBtn').textContent=sitting?'起身走走':'坐下看看';
  document.querySelector('#location').textContent=sitting?'沙发上 · 坐姿视角':zoneLabel();hint('画面已恢复，可以从这里继续探索');
}
// A fallback prevents a failed optional texture from trapping the user in loading.
loadingManager.onLoad=async()=>{await Promise.all([furnitureReady,exteriorReady]);sun.shadow.needsUpdate=true;ready=true;const l=document.querySelector('#loading');l.classList.add('done');l.setAttribute('aria-hidden','true');};
setTimeout(()=>{if(!ready){ready=true;document.querySelector('#loading').classList.add('done');}},3500);
window.__walkthrough={getState:()=>({player:{...player},sitting,night,entered,pathLength:path.length,fps,errors:[...errors],drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,ready}),blocked:(x,z)=>blocked(x,z)};
requestAnimationFrame(render);
