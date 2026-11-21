import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
const $ = id => document.getElementById(id);
const stage = $('model-stage');
const scene = new THREE.Scene(); scene.background = new THREE.Color('#123641');
const camera = new THREE.PerspectiveCamera(38,1,0.01,80);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight('#eff9df','#3f6371',2));
const light = new THREE.DirectionalLight('#ffe0ab',2.5); light.position.set(3,5,4); scene.add(light);
const rim = new THREE.DirectionalLight('#76dcd6',1); rim.position.set(-3,3,-3); scene.add(rim);
const pivot = new THREE.Group(); scene.add(pivot);
const ground = new THREE.Mesh(new THREE.CircleGeometry(2.2,64),new THREE.MeshBasicMaterial({color:'#20454b'}));
ground.rotation.x=-Math.PI/2;ground.position.y=-1.45;scene.add(ground);
let yaw=0.4,pitch=0.23,distance=7.2,drag=null,model=null,visible=true;
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(stage);
const resize = () => { const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
new ResizeObserver(resize).observe(stage);resize();
stage.addEventListener('pointerdown',event=>{stage.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY};});
stage.addEventListener('pointermove',event=>{if(!drag)return;yaw+=(event.clientX-drag.x)*.008;pitch=Math.max(-.2,Math.min(.9,pitch+(event.clientY-drag.y)*.005));drag={x:event.clientX,y:event.clientY};});
const stop=()=>drag=null;stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
stage.addEventListener('wheel',event=>{event.preventDefault();distance=Math.max(4,Math.min(12,distance+event.deltaY*.005));},{passive:false});
const loader = new GLTFLoader();
const models = {
  sentinel:['机械哨兵','切开的甲壳、旋转体底盘、爪口和六足构成可独立导出的机械敌人。'],
  guardian:['守潮首领','在哨兵轮廓上加入冠刺与能量核心；游戏内放大到首领尺度。'],
  cannon:['岸防炮台','炮管由圆柱布尔差集形成真实通孔，炮座用旋转轮廓构建。'],
  beacon:['港口信标','旋转体塔身、金属环与布尔切窗灯室。游戏内保留原来的信标光源与光束。'],
};
let request=0;
async function selectModel(name){
  const token=++request;
  document.querySelectorAll('[data-model]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.model===name)));
  $('model-title').textContent=models[name][0];$('model-description').textContent=models[name][1];
  $('model-file').href=`assets/forged/models/models-${name}.glb`;
  try{
    const gltf=await loader.loadAsync($('model-file').href);
    if(token!==request)return;
    if(model){model.removeFromParent();model.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});}
    model=gltf.scene;
    let triangles=0;
    model.traverse(object=>{if(!object.isMesh)return;triangles+=(object.geometry.index?.count??object.geometry.attributes.position.count)/3;object.material=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});});
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const scale=2.8/Math.max(size.x,size.y,size.z);model.scale.setScalar(scale);model.position.copy(center).multiplyScalar(-scale);pivot.add(model);
    $('model-stats').textContent=`${triangles.toLocaleString()} triangles · Y-up · vertex AO · GLB`;
  }catch(error){$('model-description').textContent=`模型载入失败：${error.message}`;console.error(error);}
}
document.querySelectorAll('[data-model]').forEach(button=>button.onclick=()=>selectModel(button.dataset.model));
selectModel('sentinel');
let last=0;
function animate(time){requestAnimationFrame(animate);if(!visible||document.hidden||time-last<1000/30)return;last=time;pivot.rotation.y=yaw;camera.position.set(0,Math.sin(pitch)*distance,Math.cos(pitch)*distance);camera.lookAt(0,0,0);renderer.render(scene,camera);}
requestAnimationFrame(animate);

const canvas=$('vfx-canvas'),context=canvas.getContext('2d');let image=new Image(),playing=false,frame=8,lastFrame=0;
function draw(){if(!image.complete||!image.naturalWidth)return;context.clearRect(0,0,384,384);context.drawImage(image,(frame%6)*192,Math.floor(frame/6)*192,192,192,0,0,384,384);$('vfx-frame').value=frame;$('frame-label').textContent=`${String(frame+1).padStart(2,'0')} / 24`;}
function selectVfx(name){image=new Image();image.onload=draw;image.src=`assets/forged/vfx/vfx-${name}.png`;$('atlas-file').href=image.src;document.querySelectorAll('[data-vfx]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.vfx===name)));}
document.querySelectorAll('[data-vfx]').forEach(button=>button.onclick=()=>selectVfx(button.dataset.vfx));
$('vfx-frame').oninput=event=>{frame=Number(event.target.value);playing=false;$('vfx-play').textContent='播放';$('vfx-play').setAttribute('aria-pressed','false');draw();};
$('vfx-play').onclick=()=>{playing=!playing;$('vfx-play').textContent=playing?'暂停':'播放';$('vfx-play').setAttribute('aria-pressed',String(playing));};
function animateVfx(time){requestAnimationFrame(animateVfx);if(!playing||document.hidden||time-lastFrame<1000/24)return;lastFrame=time;frame=(frame+1)%24;draw();}requestAnimationFrame(animateVfx);selectVfx('tide');
let sounds={};
function selectSound(){const name=$('sound-select').value;$('sound-player').src=`assets/forged/sfx/sfx-${name}.wav`;const sound=sounds[name];$('sound-stats').textContent=sound?`${sound.sample_rate}Hz · ${sound.channels} channels · ${sound.duration_seconds.toFixed(2)}s · peak ${sound.peak_dbfs.toFixed(2)}dBFS`:'';}
$('sound-select').onchange=selectSound;
fetch('assets/forged/sfx/manifest.json').then(response=>response.json()).then(data=>{sounds=data.sounds;selectSound();}).catch(error=>console.error(error));
