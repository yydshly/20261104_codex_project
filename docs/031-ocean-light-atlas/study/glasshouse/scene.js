import { ROOM_SEAT, SOFA_SEAT, SOFA_SEATS, ROOM_FLOOR, ROOM_RUG } from './seats.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createWaterSystem } from './water-system.js';
import { groundHeight } from './coast.js';
import { createGuideExperience } from './guide-controller.js';
import { createHeroStudy } from './hero-study.js';
import { createRocketAvatar } from './rocket-avatar.js';
import { STAIR_TREADS } from './walk-surface.js';
import { createShoreRocks } from './shore-rocks.js';
import { createCameraGuard } from './camera-guard.js';
import { guideFrame } from './scene-shots.js';
import { createContactLight } from './contact-light.js';
import { createFacialPerformance } from './facial-performance.js';
import { createSeasideAudio } from './seaside-audio.js';
import { createQARecording } from './qa-recording.js';

// The environment is authored here; finished character assets are served locally.
const $ = id => document.getElementById(id);
const canvas = $('scene');
const query = new URLSearchParams(location.search);
if(query.get('seaside')==='1'&&!query.has('detail'))query.set('detail','hands43');
document.body.classList.toggle('seaside-mode',query.get('seaside')==='1');
const legacyGuide = query.get('legacy') === '1';
const staticStudy = !legacyGuide && (query.get('study') === '1' || query.get('review') === '1' || ['current','rocket17','generated0597'].includes(query.get('hero')));
const matureGuide = !staticStudy && !legacyGuide;
const personalGuide=matureGuide&&query.get('hero')!=='rocket10';
document.body.classList.toggle('hero-study', staticStudy);
document.body.classList.toggle('mature-guide', matureGuide);
canvas.dataset.experience = staticStudy ? 'static-study' : matureGuide ? 'animated-guide' : 'legacy-guide';
if (staticStudy) {
  canvas.setAttribute('aria-label', '深蓝卫衣人物站在玻璃屋露台的静态三维画面，可拖动检查');
  $('toggle-panel').firstChild.textContent = '画面对照 ';
  document.querySelector('.chapter').textContent = 'PORTRAIT STUDY — 01';
  document.querySelector('.bottom-bar .gesture').textContent = '拖动检查 · 滚轮拉近 · H 隐藏界面';
}
if(matureGuide){
  canvas.setAttribute('aria-label','成品人物在海边玻璃屋走动、挥手和带路的三维演示');
  document.querySelector('.chapter').textContent='SEASIDE WALK — 01';
  document.querySelector('.bottom-bar .gesture').textContent=innerWidth<700?'调整画面 → 自己走动 · 拖动环视':'WASD / 方向键走动 · 拖动环视 · H 隐藏界面';
  $('guide-outfit-status').textContent='成品角色 · 先体验动作与带路';
  document.querySelector('[data-guide-action="Idle"]').textContent='停下';
  document.querySelector('.guide-delivery>p').textContent='当前成品角色包含80骨骼和5段动作，可下载继续使用。模型与动作来自Microsoft/Rocketbox，采用MIT许可。外貌与衣着可在后续扩展。';
  $('guide-provenance-link').href='https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/rocket-guide/README.md';
  $('guide-provenance-link').textContent='角色、动作与使用说明 ↗';
  $('guide-reference').textContent='早期造型参考 ↗';
  document.querySelector('#guide-reference-dialog p').textContent='早期造型参考 · 后续可按需要适配';
  document.querySelector('#guide-reference-dialog p:last-child').textContent='当前先使用成品模型完善动作和导览，原型面貌与服装不作为本版的前置要求。';
  if(personalGuide){
    canvas.setAttribute('aria-label','你提供的0597人物，在玻璃屋中行走和带路的三维演示');
    document.querySelector('.guide-delivery>p').textContent='从你提供的0597模型中整理出的单人人物，保留原始外观，新增骨骼绑定与5段基础动作。脚部与台阶适配在网页运行时执行。';
    $('guide-provenance-link').href='https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/personal-guide/README.md';
    const source=document.querySelector('.manual-controls a');source.href='https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/personal-guide/README.md';source.textContent='人物：你提供的0597模型 · 单人绑定版 ↗';
    if(query.get('detail')==='head'){
      document.querySelector('.chapter').textContent='HEAD STUDY — 3.5';
      document.querySelector('.guide-delivery>p').textContent='头部、眼睛、眉毛、发型及面部权重来自微软 Rocketbox（MIT），身体和西装保留0597模型。这是另一张脸的实际效果对照；尚未接入说话、口型或表情驱动。';
      source.textContent='头部：微软 Rocketbox · 身体：0597 ↗';
    }
    if(query.get('detail')==='facial'){
      document.querySelector('.chapter').textContent='OUR CHARACTER — 3.6';
      document.querySelector('.guide-delivery>p').textContent='保留我们自己的0597头部、发型、眼镜、身体和西装，新增眨眼、视线和口型变形。微软只作为面部控制结构参考，没有采用微软头部。网页提供一段中文语音与嘴型同步演示，时间对齐仍需精校。';
      source.textContent='我们的0597人物 · 眨眼与语音讲解 ↗';
    }
    if(query.get('detail')==='hands43'){
      document.querySelector('.chapter').textContent='OUR CHARACTER — 4.3';
      document.querySelector('.guide-delivery>p').textContent='保留0597自己的头部、发型、眼镜、身体和西装。局部手部使用已授权成人手面，修整腕部与袖口；眨眼与语音讲解保留，坐姿由网页驱动。';
      source.textContent='我们的0597人物 · 手部修整与坐姿 ↗';
    }
  }
}
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, preserveDrawingBuffer:true, powerPreference:'high-performance' });
} catch (error) {
  $('loading').innerHTML = '<p>暂时无法点亮场景</p><small>需要支持 WebGL 2 的浏览器与图形加速。</small>';
  $('scene-status').textContent = 'WebGL 初始化失败';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.transmissionResolutionScale = 0.8;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#adb8b3', 0.0024);
const camera = new THREE.PerspectiveCamera(44, 1, 0.08, 1800);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 1.2;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.492;
controls.minPolarAngle = 0.12;
controls.enablePan = false;
controls.zoomSpeed = 0.65;
controls.rotateSpeed = 0.55;
const palettes = {
  gold:{ high:'#386a84', mid:'#87a7b4', horizon:'#f4bd92', low:'#80999a', sun:'#ffe0b0', water:'#153f50', fog:'#c7b4a0', direction:[.55,0.095,-0.83], intensity:3.0, exposure:0.96 },
  rose:{ high:'#535c80', mid:'#9b9db6', horizon:'#f4b2a3', low:'#798799', sun:'#ffccb0', water:'#2c465d', fog:'#c3a7ad', direction:[.55,0.045,-0.83], intensity:1.8, exposure:0.98 },
  blue:{ high:'#142c49', mid:'#46647c', horizon:'#a3a6b4', low:'#3b566b', sun:'#d6dcff', water:'#183849', fog:'#73899e', direction:[.55,-0.035,-0.83], intensity:0.28, exposure:0.95 }
};
const state = { mood:'gold', view:'shore', wave:0.36, warmth:0.65, paused:staticStudy || query.get('pose')==='still' || matchMedia('(prefers-reduced-motion: reduce)').matches, time:7.8 };
let guide=null,guideReady=false,guideFailed=false,lastGuideOutfit='';
let facialMotion=null;
const seasideAudio=createSeasideAudio({canvas,button:$('sea-sound'),volume:$('sea-volume'),notice});
for(const id of ['rock-start','rock-approach','room-approach','sofa-approach','rock-sit'])$(id).addEventListener('click',()=>seasideAudio.activate());
addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat&&!e.target.closest?.('input,textarea,select,[contenteditable="true"],dialog[open]'))seasideAudio.activate();});
if(query.has('qa'))window.__seaAudio=seasideAudio;
if(query.has('qa'))createQARecording({canvas,audio:seasideAudio});
let heroStudy=null;
const sunDirection = new THREE.Vector3();

// A controlled dusk sky, shared by the view, water reflection and PBR environment.
const skyMaterial = new THREE.ShaderMaterial({
  side:THREE.BackSide, depthWrite:false,
  uniforms:{ high:{value:new THREE.Color()}, mid:{value:new THREE.Color()}, horizon:{value:new THREE.Color()}, low:{value:new THREE.Color()}, sunColor:{value:new THREE.Color()}, sunDirection:{value:sunDirection}, sunPower:{value:1}, showSunDisc:{value:1} },
  vertexShader:`varying vec3 vDirection; void main(){ vDirection=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`,
  fragmentShader:`
    varying vec3 vDirection; uniform vec3 high,mid,horizon,low,sunColor,sunDirection; uniform float sunPower,showSunDisc;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
    float cloudNoise(vec2 p){float sum=0.,weight=.55;for(int i=0;i<4;i++){sum+=noise(p)*weight;p=p*2.03+vec2(7.1,3.7);weight*=.48;}return sum;}
    void main(){
      vec3 d=normalize(vDirection); float y=d.y;
      vec3 col=mix(horizon,mid,smoothstep(0.,.16,y)); col=mix(col,high,smoothstep(.08,.6,y));
      col=mix(low,col,smoothstep(-.13,.01,y));
      float a=max(dot(d,normalize(sunDirection)),0.);
      col+=sunColor*(pow(a,34.)*.12+pow(a,260.)*.28)*sunPower;
      float disc=smoothstep(.99994,.999965,a); col=mix(col,sunColor*6.,disc*sunPower*showSunDisc);
      // Angular coordinates avoid the radial stripes from projecting a flat
      // noise plane toward the horizon. Keep these high clouds very quiet.
      vec2 p=vec2(atan(d.z,d.x)*2.8,asin(clamp(y,-1.,1.))*11.);
      vec2 warp=vec2(cloudNoise(p*.55),cloudNoise(p*.48+13.));
      float clouds=cloudNoise(p+warp*1.8);
      float mask=smoothstep(.43,.74,clouds)*smoothstep(.025,.16,y)*(1.-smoothstep(.4,.7,y));
      col=mix(col,horizon*.86+vec3(.09,.05,.03),mask*.12);
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(900,32,20), skyMaterial);
sky.frustumCulled = false; sky.renderOrder = -100; scene.add(sky);
const envScene = new THREE.Scene();
const envSky = new THREE.Mesh(sky.geometry, skyMaterial); envScene.add(envSky);
const pmrem = new THREE.PMREMGenerator(renderer);
let environment;
const hemi = new THREE.HemisphereLight('#bad5df','#a18b72',.95); scene.add(hemi);
const skyFill=new THREE.DirectionalLight('#b4d2e4',.72);skyFill.position.set(8,18,25);scene.add(skyFill);
const sun = new THREE.DirectionalLight('#ffdda2',3.2);
sun.castShadow = true;
if(query.get('shadow')==='off')sun.castShadow=false;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-20,right:20,top:18,bottom:-18,near:1,far:130});
sun.shadow.normalBias = 0.012; sun.shadow.bias = -0.00008;
sun.target.position.set(-4,0,2); scene.add(sun,sun.target);

function textureCanvas(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
let randomSeed=91;
function random(){randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;}
const timber = textureCanvas(512,256,(c,w,h)=>{
  c.fillStyle='#a88663';c.fillRect(0,0,w,h);
  for(let i=0;i<1500;i++){const y=random()*h;c.strokeStyle=`rgba(${random()>.5?'65,40,20':'235,205,155'},${.015+random()*.12})`;c.lineWidth=random()*1.8;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y+random()*3,w*.65,y-random()*3,w,y+random()*2);c.stroke();}
});timber.repeat.set(1,2);
const plaster = textureCanvas(256,256,(c,w,h)=>{
  c.fillStyle='#c9c0a8';c.fillRect(0,0,w,h);for(let i=0;i<18000;i++){c.fillStyle=random()>.5?'#fff5':'#634b3510';c.fillRect(random()*w,random()*h,1,1);}
});plaster.repeat.set(3,3);
const fabric = textureCanvas(128,128,(c,w,h)=>{
  c.fillStyle='#d8d2ba';c.fillRect(0,0,w,h);c.strokeStyle='#8f887a30';c.lineWidth=.5;
  for(let n=0;n<w;n+=3){c.beginPath();c.moveTo(n,0);c.lineTo(n,h);c.stroke();c.beginPath();c.moveTo(0,n);c.lineTo(w,n);c.stroke();}
});fabric.repeat.set(4,4);
const mats = {
  frame:new THREE.MeshStandardMaterial({color:'#253835',roughness:.48,metalness:.65}),
  plaster:new THREE.MeshStandardMaterial({color:'#f3ead8',map:plaster,roughness:.85}),
  roof:new THREE.MeshStandardMaterial({color:'#d2cbb4',map:plaster,roughness:.74}),
  ceiling:new THREE.MeshStandardMaterial({color:'#d2c3a5',map:plaster,roughness:.8}),
  wood:new THREE.MeshStandardMaterial({color:'#d6bd92',map:timber,roughness:.64}),
  fabric:new THREE.MeshStandardMaterial({color:'#eee5cb',map:fabric,roughness:.92}),
  cushion:new THREE.MeshStandardMaterial({color:'#b09d7c',map:fabric,roughness:.91}),
  stone:new THREE.MeshStandardMaterial({color:'#d6c7a7',map:plaster,roughness:.59}),
  ceramic:new THREE.MeshStandardMaterial({color:'#927c61',roughness:.6}),
  brass:new THREE.MeshStandardMaterial({color:'#a88e58',metalness:.8,roughness:.29}),
  black:new THREE.MeshStandardMaterial({color:'#28332f',roughness:.62}),
  glow:new THREE.MeshStandardMaterial({color:'#ffda97',emissive:'#ffb45c',emissiveIntensity:3})
};
function box(parent,size,pos,material,rounded=0){
  const geo=rounded?new RoundedBoxGeometry(...size,3,rounded):new THREE.BoxGeometry(...size);
  const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function cylinder(parent,rt,rb,height,pos,material,segments=32){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,height,segments),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
const architecture=new THREE.Group();architecture.name='Glass pavilion';scene.add(architecture);
// The deck sits on columns at the edge of a sandy peninsula.
box(architecture,[11.6,.35,9.1],[-5,1.18,3.1],mats.frame,.06);
const deckSlats=new THREE.InstancedMesh(new THREE.BoxGeometry(.19,.055,9.04),mats.wood,58);
const matrix=new THREE.Matrix4();for(let i=0;i<58;i++){matrix.makeTranslation(-10.7+i*.199,1.382,3.1);deckSlats.setMatrixAt(i,matrix);}deckSlats.castShadow=deckSlats.receiveShadow=true;architecture.add(deckSlats);
for(const x of[-9.6,-5,-.4])for(const z of[-.6,6.8])cylinder(architecture,.12,.15,2.4,[x,.05,z],mats.frame,12);
box(architecture,[9.2,.12,6.35],[-5,ROOM_FLOOR-.06,3],mats.wood);
box(architecture,[.18,3.2,6.5],[-9.62,3.1,3],mats.plaster);
box(architecture,[4.4,3.2,.16],[-7.4,3.1,-.2],mats.plaster);
box(architecture,[10.5,.22,7.75],[-5,4.82,3],mats.roof,.035);
box(architecture,[10.1,.055,7.35],[-5,4.685,3],mats.ceiling);
for(const x of[-9.55,-5,-.45])for(const z of[-.17,6.2])box(architecture,[.075,3.25,.075],[x,3.1,z],mats.frame);
for(const z of[1.9,4.05])box(architecture,[.07,3.25,.055],[-.45,3.1,z],mats.frame);
for(const x of[-7.25,-2.7])box(architecture,[.045,3.23,.065],[x,3.1,6.2],mats.frame);
box(architecture,[9.15,.065,.07],[-5,4.65,6.2],mats.frame);
box(architecture,[.07,.065,6.35],[-.45,4.65,3],mats.frame);
box(architecture,[9.15,.055,.07],[-5,1.55,6.2],mats.frame);
box(architecture,[.07,.055,6.35],[-.45,1.55,3],mats.frame);
const glassMaterial=new THREE.MeshPhysicalMaterial({ color:'#ecf4e7', transmission:0.96, opacity:1, roughness:.018, metalness:0, ior:1.45, thickness:.045, attenuationColor:'#b4d6c7', attenuationDistance:13, envMapIntensity:.65, clearcoat:1, clearcoatRoughness:.04 });
const glazing=new THREE.Group();glazing.name='Transmissive glass';architecture.add(glazing);
const frontPanels=[];
for(const x of[-8.4,-6.13,-3.85,-1.57])frontPanels.push(box(glazing,[2.22,3.04,.028],[x,3.1,6.18],glassMaterial));
for(const z of[.9,3,5.1])box(glazing,[.028,3.04,2.04],[-.46,3.1,z],glassMaterial);
for(const x of[-4.0,-1.63])box(glazing,[2.3,3.04,.028],[x,3.1,-.19],glassMaterial);
box(architecture,[.055,3.23,.065],[-2.81,3.1,-.2],mats.frame);
box(architecture,[4.75,.065,.07],[-2.81,4.65,-.2],mats.frame);
box(architecture,[4.75,.055,.07],[-2.81,1.55,-.2],mats.frame);
glazing.traverse(o=>{if(o.isMesh)o.castShadow=false;});
// Sliding-door handles are a small readable cue that the wall is glass.
box(frontPanels[1],[.035,.42,.06],[1.05,-.25,.065],mats.brass,.012);
box(frontPanels[2],[.035,.42,.06],[-1.05,-.25,.065],mats.brass,.012);

// An inhabitable room: linen sofa, travertine table, books, ceramics and a plant.
const interior=new THREE.Group();interior.name='Furnished interior';architecture.add(interior);
const rug=box(interior,[ROOM_RUG.width,ROOM_RUG.thickness,ROOM_RUG.depth],[ROOM_RUG.x,ROOM_RUG.top-ROOM_RUG.thickness/2,ROOM_RUG.z],new THREE.MeshStandardMaterial({color:'#b9af91',map:fabric,roughness:1}),.001);
// Keep the linen sofa, fitted to the same seat/floor used by the character.
const sofa=SOFA_SEAT;
for(const x of[-8.30,-7.62])for(const z of[1.12,4.70])cylinder(interior,.045,.055,.18,[x,1.64,z],mats.wood,16);
box(interior,[.79,.14,4.02],[-8.02,1.78,2.9],mats.wood,.06);
for(const z of[1.65,2.90,4.15]){
 box(interior,[sofa.depth,.16,1.21],[sofa.x,sofa.top-.08,z],mats.fabric,.075);
 const back=box(interior,[sofa.back.depth,sofa.back.height,1.23],[sofa.back.x,sofa.back.y,z],mats.fabric,.085);back.rotation.z=sofa.back.tilt;
}
for(const z of[.88,4.82]){
 box(interior,[.87,.40,.16],[-8.02,2.00,z],mats.fabric,.065);
 box(interior,[.85,.12,.23],[-8.02,2.23,z],mats.fabric,.055);
}
const pillow=box(interior,[.16,.48,.55],[-8.12,2.25,2.17],mats.cushion,.065);pillow.rotation.z=.18;pillow.rotation.x=-.16;
for(const seat of SOFA_SEATS){const sofaLumbar=box(interior,[.10,.29,.78],[-8.12,2.12,seat.z],mats.cushion,.045);sofaLumbar.rotation.z=sofa.back.tilt;}
cylinder(interior,.9,.9,.13,[-4.9,2.06,3.15],mats.stone,64);
cylinder(interior,.36,.46,.46,[-4.9,1.79,3.15],mats.stone,48);
const book=box(interior,[.57,.055,.4],[-4.62,2.16,3.3],new THREE.MeshStandardMaterial({color:'#7e7766',roughness:.9}),.01);book.rotation.y=-.2;
const paper=box(interior,[.51,.025,.36],[-4.62,2.197,3.3],new THREE.MeshStandardMaterial({color:'#e4d9bd',roughness:1}));paper.rotation.y=-.2;
cylinder(interior,.12,.09,.19,[-5.13,2.225,2.83],mats.ceramic,24);
const tea=new THREE.Mesh(new THREE.CircleGeometry(.09,24),new THREE.MeshStandardMaterial({color:'#4c3525',roughness:.18}));tea.rotation.x=-Math.PI/2;tea.position.set(-5.13,2.323,2.83);interior.add(tea);
const cupHandle=new THREE.Mesh(new THREE.TorusGeometry(.065,.018,7,18),mats.ceramic);cupHandle.position.set(-5.02,2.24,2.83);interior.add(cupHandle);
// The cushion, back and armrests use the same dimensions as the fitted seat pose.
const chair=ROOM_SEAT;
for(const side of[-1,1])for(const end of[-1,1])cylinder(interior,.035,.045,.17,[chair.x+side*.40,1.635,chair.z+end*.27],mats.wood,16);
box(interior,[1.02,.12,.78],[chair.x,1.76,chair.z],mats.wood,.035);
box(interior,[chair.width,.14,chair.depth],[chair.x,chair.top-.07,chair.z],mats.fabric,.065);
const chairBack=box(interior,[.96,chair.back.height,chair.back.depth],[chair.x,chair.back.y,chair.back.z],mats.fabric,.065);chairBack.rotation.x=chair.back.tilt;
const lumbar=box(interior,[.75,.24,.10],[chair.x,2.10,4.665],mats.cushion,.045);lumbar.rotation.x=chair.back.tilt;
for(const side of[-1,1]){
 box(interior,[.075,chair.armTop-1.81,.66],[chair.x+side*.40,(chair.armTop+1.71)/2,chair.z],mats.wood,.025);
 box(interior,[.14,.10,.70],[chair.x+side*.40,chair.armTop-.05,chair.z],mats.fabric,.045);
}
cylinder(interior,.4,.32,.76,[-8.58,1.96,.48],mats.ceramic,36);
const soil=new THREE.MeshStandardMaterial({color:'#3e3828',roughness:1});cylinder(interior,.35,.35,.025,[-8.58,2.35,.48],soil,28);
const leaves=new THREE.MeshStandardMaterial({color:'#4d6650',roughness:.75,side:THREE.DoubleSide});
for(let i=0;i<14;i++){
  const a=i*2.399, h=1.0+random()*.7;const start=new THREE.Vector3(-8.58,2.33,.48);const end=new THREE.Vector3(-8.58+Math.cos(a)*.48,2.7+h*.65,.48+Math.sin(a)*.48);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.009,.015,start.distanceTo(end),5),leaves);stem.position.copy(start).add(end).multiplyScalar(.5);stem.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize());interior.add(stem);
  const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),leaves);leaf.scale.set(.15,.36,.045);leaf.position.copy(end);leaf.rotation.set(.6*Math.sin(a),a,.7*Math.cos(a));interior.add(leaf);
}
// A canvas artwork is original procedural art, not a reference photograph.
const painting=textureCanvas(512,256,(c,w,h)=>{
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#848d89');g.addColorStop(.56,'#c8bda2');g.addColorStop(.58,'#f0d7a4');g.addColorStop(1,'#425f66');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<130;i++){const y=h*.58+random()*h*.42;c.fillStyle=`rgba(233,208,148,${random()*.45})`;c.fillRect(w*.15+random()*w*.6,y,random()*45,.5+random()*2);}
});
box(interior,[2.65,1.4,.06],[-7.4,3.15,-.08],mats.wood);
const art=new THREE.Mesh(new THREE.PlaneGeometry(2.5,1.25),new THREE.MeshStandardMaterial({map:painting,roughness:1}));art.position.set(-7.4,3.15,-.044);interior.add(art);
// Pendant lights and a low floor lamp pool warm light inside the room.
const interiorLights=[];
for(const x of[-6.4,-3.25]){
  cylinder(interior,.012,.012,.62,[x,4.32,2.6],mats.black,8);
  const shade=new THREE.Mesh(new THREE.SphereGeometry(.33,28,16,0,Math.PI*2,0,Math.PI*.55),mats.ceramic);shade.position.set(x,3.98,2.6);interior.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.11,16,10),mats.glow);bulb.position.set(x,3.9,2.6);interior.add(bulb);
  const light=new THREE.PointLight('#ffb66e',18,7,2);light.position.set(x,3.82,2.6);scene.add(light);interiorLights.push(light);
}
box(interior,[8.5,.015,.025],[-5,4.62,-.02],mats.glow);
const stripLight=new THREE.PointLight('#ffd5a0',13,9,2);stripLight.position.set(-5,4.25,.4);scene.add(stripLight);interiorLights.push(stripLight);
// Two low loungers outside complete the deck silhouette.
for(const x of[-6.6,-4.35]){
  box(architecture,[1.38,.14,1.85],[x,1.78,7],mats.wood,.04);
  box(architecture,[1.29,.13,1.72],[x,1.91,7],mats.fabric,.07);
  for(const z of[6.35,7.65])box(architecture,[1.15,.32,.075],[x,1.55,z],mats.frame);
}
for(const step of STAIR_TREADS)box(architecture,[step.width,step.thickness,step.depth],[step.x,step.top-step.thickness/2,step.z],mats.wood,.025);

// Terrain and surf share an irregular coast and shallow seabed.
const groundGeo=new THREE.PlaneGeometry(95,85,240,220);groundGeo.rotateX(-Math.PI/2);groundGeo.translate(-16,0,20);
const gp=groundGeo.attributes.position, colors=[];const sandLow=new THREE.Color('#aa9375'),sandHigh=new THREE.Color('#e4cca3');
for(let i=0;i<gp.count;i++){
  const x=gp.getX(i),z=gp.getZ(i),h=groundHeight(x,z);gp.setY(i,h);
  const col=sandLow.clone().lerp(sandHigh,THREE.MathUtils.clamp(h*1.25+.18,0,1));col.multiplyScalar(.96+Math.sin(x*8.1+z*7.2)*.025);colors.push(col.r,col.g,col.b);
}groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));groundGeo.computeVertexNormals();
const sandTexture=textureCanvas(256,256,(c,w,h)=>{c.fillStyle='#e8d2ad';c.fillRect(0,0,w,h);for(let i=0;i<28000;i++){c.fillStyle=random()>.5?'#54473328':'#fff5df55';c.fillRect(random()*w,random()*h,1,1);}});sandTexture.repeat.set(55,50);
const ground=new THREE.Mesh(groundGeo,new THREE.MeshStandardMaterial({vertexColors:true,map:sandTexture,bumpMap:sandTexture,bumpScale:.025,roughness:.94}));ground.name='Sandy peninsula';ground.receiveShadow=true;scene.add(ground);
const rocks=createShoreRocks();scene.add(rocks);
const cameraGuard=createCameraGuard({roots:[architecture,rocks],moving:[frontPanels[1],frontPanels[2]]});
canvas.dataset.rockCount=String(rocks.children.length);
// Sparse dune grass, kept away from the room and the main water view.
const grassGeo=new THREE.BufferGeometry(),grassPositions=[];const grassCols=[];
for(let i=0;i<380;i++){
  const x=-30+random()*21,z=7+random()*15,h=groundHeight(x,z);if(h<.12)continue;
  const height=.13+random()*.45,angle=random()*6.28,w=.025;
  grassPositions.push(x-w,h,z,x+w,h,z,x+Math.cos(angle)*.18,h+height,z+Math.sin(angle)*.18);
  for(let j=0;j<3;j++)grassCols.push(.23+random()*.12,.28+random()*.1,.16+random()*.07);
}grassGeo.setAttribute('position',new THREE.Float32BufferAttribute(grassPositions,3));grassGeo.setAttribute('color',new THREE.Float32BufferAttribute(grassCols,3));grassGeo.computeVertexNormals();
scene.add(new THREE.Mesh(grassGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})));

const waterSystem=createWaterSystem({renderer,scene,skyMaterial,sunDirection,materials:[...Object.values(mats),rug.material]});
const {surf}=waterSystem;
const contactLight=createContactLight([mats.wood,ground.material]);
contactLight.setEnabled(query.get('contact')!=='off');

// The same lighting state drives every surface, rather than a screen-space filter.
function applyMood(key){
  state.mood=key;const p=palettes[key];sunDirection.fromArray(p.direction).normalize();
  for(const k of['high','mid','horizon','low'])skyMaterial.uniforms[k].value.set(p[k]);
  skyMaterial.uniforms.sunColor.value.set(p.sun);skyMaterial.uniforms.sunPower.value=key==='blue'?0:1;
  sun.position.copy(sunDirection).multiplyScalar(80).add(sun.target.position);sun.color.set(p.sun);sun.intensity=p.intensity;
  hemi.intensity=key==='blue'?.72:key==='rose'?.78:.95;
  hemi.color.set(key==='blue'?'#91b6e2':'#c3dce7');
  hemi.groundColor.set(key==='blue'?'#4c5260':'#a18b72');
  skyFill.intensity=key==='blue'?.62:key==='rose'?.55:.72;
  skyFill.color.set(key==='blue'?'#8aaadf':'#b4d2e4');
  scene.environmentIntensity=key==='blue'?.62:.68;
  scene.fog.color.set(p.fog);renderer.toneMappingExposure=p.exposure;
  waterSystem.setMood(key,p);
  // Omit the tiny sun disc from the environment convolution to avoid ghost suns on glass.
  const sunDisc=skyMaterial.uniforms.showSunDisc.value;skyMaterial.uniforms.showSunDisc.value=0;
  environment?.dispose();environment=pmrem.fromScene(envScene,.035,.1,1500);scene.environment=environment.texture;
  skyMaterial.uniforms.showSunDisc.value=sunDisc;
  document.querySelectorAll('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mood===key)));
  $('scene-status').textContent={gold:'日落 · 海风轻拂',rose:'晚霞 · 海面渐静',blue:'蓝调 · 屋内留灯'}[key];
}
function applyWarmth(){
  const scale=state.warmth*1.7;
  interiorLights.forEach((l,i)=>l.intensity=(i===2?13:18)*scale);
  mats.glow.emissiveIntensity=state.warmth*5;
}
const views={
  shore:{position:[14,5.4,20],target:[-3.7,1.85,1.2],fov:44},
  inside:{position:[-6.4,2.68,4.4],target:[.5,3.15,1.3],fov:68},
  tide:{position:[7.5,.95,10],target:[-2,.12,-4],fov:55}
};
if(matureGuide){const frame=guideFrame('shore',innerWidth<700);views.shore={position:frame.position,target:frame.target,fov:frame.fov};}
let transition;
function selectView(name,immediate=false){
  state.view=name;const v=views[name],mobile=innerWidth<700;
  const destination=new THREE.Vector3(...v.position),target=new THREE.Vector3(...v.target);
  if(mobile&&name==='shore'&&!matureGuide){destination.set(20,9,42);target.set(-4.5,2,1.3);}
  if(immediate){camera.position.copy(destination);controls.target.copy(target);camera.fov=v.fov;camera.updateProjectionMatrix();controls.update();}
  else transition={start:performance.now(),from:camera.position.clone(),to:destination,fromTarget:controls.target.clone(),toTarget:target,fromFov:camera.fov,toFov:v.fov};
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
}
controls.addEventListener('start',()=>{transition=null;});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();heroStudy?.resize();}
addEventListener('resize',resize);resize();
applyWarmth();applyMood('gold');selectView('shore',true);
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
  if(guide)guide.navigate(b.dataset.view);else selectView(b.dataset.view);
}));
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>applyMood(b.dataset.mood)));
$('wave').addEventListener('input',e=>{
  state.wave=Number(e.target.value)/100;waterSystem.setWind(state.wave);
  $('wave-value').textContent=state.wave<.24?'微风':state.wave<.65?'轻风':'海风渐起';
});
$('warmth').addEventListener('input',e=>{state.warmth=Number(e.target.value)/100;applyWarmth();$('warmth-value').textContent=state.warmth<.12?'熄灯':state.warmth<.55?'柔和':'温暖';});
$('glass').addEventListener('change',e=>{glazing.visible=e.target.checked;});
$('foam').addEventListener('change',e=>{surf.visible=e.target.checked;});
$('caustic').addEventListener('change',e=>{waterSystem.setCaustics(e.target.checked);});
function updatePause(){ $('pause').textContent=state.paused?'▷':'Ⅱ';$('pause').setAttribute('aria-pressed',String(state.paused));$('pause').setAttribute('aria-label',state.paused?'继续场景动画':'暂停场景动画'); }
$('pause').addEventListener('click',()=>{state.paused=!state.paused;facialMotion?.setScenePaused(state.paused);updatePause();});updatePause();
let noticeTimeout;
function notice(s){$('notice').textContent=s;$('notice').classList.add('visible');clearTimeout(noticeTimeout);noticeTimeout=setTimeout(()=>$('notice').classList.remove('visible'),3000);}
function togglePanel(open){$('panel').classList.toggle('collapsed',!open);$('toggle-panel').setAttribute('aria-expanded',String(open));document.body.classList.toggle('panel-open',open);}
$('toggle-panel').addEventListener('click',()=>togglePanel($('toggle-panel').getAttribute('aria-expanded')!=='true'));
if(innerWidth<700 || staticStudy || matureGuide)togglePanel(false);
function toggleUI(hidden){document.body.classList.toggle('ui-hidden',hidden);$('restore-ui').hidden=!hidden;}
$('restore-ui').addEventListener('click',()=>toggleUI(false));
addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.key.toLowerCase()==='h')toggleUI(!document.body.classList.contains('ui-hidden'));if(e.key==='Escape')toggleUI(false);});
$('capture').addEventListener('click',()=>{
  const pixelRatio=renderer.getPixelRatio(),size=renderer.getSize(new THREE.Vector2());
  $('capture').disabled=true;
  try{
    // Round upward so the drawing-buffer floor cannot turn 1920 into 1919.
    renderer.setPixelRatio(Math.max(pixelRatio,Math.ceil(1920000/Math.max(size.x,size.y))/1000));
    renderer.render(heroStudy?.renderScene || scene,camera);
    canvas.toBlob(blob=>{
      $('capture').disabled=false;
      if(!blob){notice('保存失败，请重试');return;}
      const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=staticStudy?`seaside-portrait-${canvas.dataset.heroCandidate || 'current'}-${heroStudy?.mode || 'terrace'}.png`:`seaside-glasshouse-${state.mood}-${state.view}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);notice('已保存当前机位的纯画面');
    },'image/png');
  }catch(error){$('capture').disabled=false;notice('保存失败，请重试');console.error(error);}
  finally{renderer.setPixelRatio(pixelRatio);}
});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('scene-status').textContent='图形连接中断，请刷新页面恢复';});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
document.addEventListener('visibilitychange',()=>{previous=performance.now();});
$('loading').querySelector('p').textContent=staticStudy?'一位熟悉的人，站在海边':'向导正在海边等你';
$('loading').querySelector('small').textContent=staticStudy?'准备静态人物与露台光线':'准备人物、服装与海边光线';
if (staticStudy) {
  createHeroStudy({scene,camera,controls,canvas,renderer,sun,hemi,notice}).then(value=>{
    heroStudy=value;guideReady=true;transition=null;waterSystem.setCharacter(heroStudy.root);
  }).catch(error=>{
    console.error(error);guideFailed=true;canvas.dataset.heroReady='false';
    $('hero-model-status').textContent='人物暂未载入，请刷新重试';
    $('scene-status').textContent='静态人物未载入';notice('人物文件暂未载入，请刷新重试');
  });
} else {
  createGuideExperience({scene,camera,controls,canvas,doors:[frontPanels[1],frontPanels[2]],notice,
    ...(matureGuide?{avatarFactory:personalGuide?options=>createRocketAvatar({...options,assetBase:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/personal-guide/',manifestFile:query.get('detail')==='hands43'?'manifest-hands43.json':query.get('detail')==='facial'?'manifest-facial.json':query.get('detail')==='head'?'manifest-head.json':query.get('detail')==='orbit'?'manifest-orbit.json':query.get('detail')==='1'?'manifest-detail.json':query.get('detail')==='before'?'manifest-v30.json':'manifest.json',characterId:'personal0597',description:query.get('detail')==='hands43'?'0597人物 · 局部手部修正与眨眼讲解':query.get('detail')==='facial'?'我们自己的头部 · 眨眼与语音讲解':query.get('detail')==='head'?'头部拟合检查稿 · 深蓝西装':'你的角色 · 深蓝西装',downloadName:'seaside-personal-0597.glb'}):createRocketAvatar,onInteraction:()=>{state.paused=false;facialMotion?.setScenePaused(false);updatePause();}}:{}),onStop:name=>{
    state.view=name;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
  }}).then(value=>{guide=value;guideReady=true;transition=null;$('scene-status').textContent=matureGuide?'向导已就位 · 选择地点开始带路':'向导已就位';
    if(value.avatar.manifest?.facial)createFacialPerformance({avatar:value.avatar,canvas,camera,notice}).then(face=>facialMotion=face).catch(error=>{console.error(error);notice('面部讲解暂未载入，请刷新重试');});
  }).catch(error=>{
    console.error(error);guideFailed=true;$('guide-motion').textContent='人物加载失败';notice('人物暂未就位，可以先自由浏览海边');
  });
}
let previous=performance.now(),firstFrame=true,frameCount=0,windowStart=previous;
function animate(now){
  requestAnimationFrame(animate);
  // Keep locomotion in real time on 10–20 FPS devices; the previous 50ms cap
  // unintentionally slowed both the person and ocean below 20 FPS.
  const dt=Math.min((now-previous)/1000,.1);previous=now;
  if(document.hidden)return;
  if(!state.paused)state.time+=dt;
  if(transition){
    const t=Math.min((now-transition.start)/1600,1),e=t*t*(3-2*t);
    camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,e);
    camera.fov=THREE.MathUtils.lerp(transition.fromFov,transition.toFov,e);camera.updateProjectionMatrix();if(t===1)transition=null;
  }
  if(heroStudy)heroStudy.update(dt);
  else if(!guide)controls.update();
  if(guide){
    guide.update(dt,state.paused);
    facialMotion?.setEnvironmentFocus(guide.watchingSea);
    facialMotion?.update(dt);
    if(guide.avatar.contactFeet){contactLight.update(guide.avatar);canvas.dataset.contactLight=JSON.stringify(contactLight.sample);}
    if(guide.avatar.outfit!==lastGuideOutfit){waterSystem.setCharacter(guide.root);lastGuideOutfit=guide.avatar.outfit;}
    if(matureGuide&&guide.cameraMode!=='eye'){
      const result=cameraGuard.update(camera,controls,guide.root.position);
      canvas.dataset.cameraGuard=JSON.stringify(result);
      canvas.dataset.guideCameraPosition=JSON.stringify(camera.position.toArray().map(n=>Number(n.toFixed(3))));
    }
  }
  sky.position.copy(camera.position);
  if(!heroStudy || heroStudy.mode==='terrace')waterSystem.update(state.time);
  const surfState=waterSystem.surfAt(camera.position.x,camera.position.z);canvas.dataset.surfCycle=JSON.stringify(surfState);
  if(guide?.avatar.contactFeet)seasideAudio.update(dt,{camera,avatar:guide.avatar,phase:canvas.dataset.guidePhase,time:state.time,scenePaused:state.paused,speaking:JSON.parse(canvas.dataset.facialState||'{}').playing,wave:state.wave,surf:surfState,surfVisible:surf.visible});
  renderer.render(heroStudy?.renderScene || scene,camera);
  if(firstFrame&&(guideReady||guideFailed)){firstFrame=false;document.body.dataset.ready='true';$('loading').classList.add('ready');setTimeout(()=>$('loading').hidden=true,1100);}
  frameCount++;if(now-windowStart>2500){const fps=Math.round(frameCount*1000/(now-windowStart));canvas.dataset.fps=String(fps);canvas.dataset.drawCalls=String(renderer.info.render.calls);windowStart=now;frameCount=0;}
}
requestAnimationFrame(animate);
