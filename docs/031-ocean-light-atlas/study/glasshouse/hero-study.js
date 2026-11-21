import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { HERO_CANDIDATES, HERO_REVIEW } from './hero-candidates.js';

// One authored static character, viewed under two real-time lighting conditions.
// There is deliberately no animation mixer, outfit switch or fallback avatar.
const $ = id => document.getElementById(id);
const TERRACE = new THREE.Vector3(-.55, 1.4095, 6.90);

export async function createHeroStudy({ scene, camera, controls, canvas, renderer, sun, hemi, notice = () => {} }) {
  const candidateId = new URLSearchParams(location.search).get('hero') || 'current';
  const candidate = HERO_CANDIDATES.find(item=>item.id===candidateId) || HERO_CANDIDATES[0];
  canvas.dataset.heroCandidate = candidate.id;
  const root = new THREE.Group();
  root.name = 'Terrace static portrait';
  root.position.copy(TERRACE);
  root.rotation.y = -.18;
  scene.add(root);

  const neutral = new THREE.Scene();
  neutral.name = 'Neutral material inspection';
  neutral.background = new THREE.Color('#c4c6c6');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const neutralEnvironment = pmrem.fromScene(room, .04);
  neutral.environment = neutralEnvironment.texture;
  neutral.environmentIntensity = .65;
  room.dispose();
  pmrem.dispose();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color:'#c4c6c6', roughness:.88 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  neutral.add(floor);
  const neutralSky = new THREE.HemisphereLight('#e3e9ed', '#a49d93', 1.15);
  neutral.add(neutralSky);
  const neutralKey = new THREE.DirectionalLight('#fff6e8', 2.4);
  neutralKey.position.set(-3.5, 5.5, 4);
  neutralKey.target.position.set(0, .9, 0);
  neutralKey.castShadow = true;
  neutralKey.shadow.mapSize.set(2048, 2048);
  Object.assign(neutralKey.shadow.camera, { left:-2, right:2, top:2.3, bottom:-2.3, near:.1, far:15 });
  neutralKey.shadow.normalBias = .003;
  neutralKey.shadow.bias = -.00005;
  neutralKey.shadow.radius = 3;
  neutral.add(neutralKey, neutralKey.target);
  const neutralFill = new THREE.DirectionalLight('#d8e5ed', .9);
  neutralFill.position.set(4, 3, 1);
  neutral.add(neutralFill);

  // The key remains aligned with the scene's sunset. A broad sky-side fill
  // keeps navy fabric and the face readable without making them emissive.
  RectAreaLightUniformsLib.init();
  const fill = new THREE.RectAreaLight('#e3e9ef', 5.5, 4, 4);
  fill.name = 'Broad neutral sky-side portrait fill';
  fill.position.copy(TERRACE).add(new THREE.Vector3(2.6, 3.5, 4.1));
  fill.lookAt(TERRACE.clone().add(new THREE.Vector3(0, 1.08, 0)));
  scene.add(fill);
  // Preserve the warm room, while reducing its competition with the face.
  scene.traverse(object => { if (object.isPointLight) object.intensity *= .65; });
  const sunDirection = sun.position.clone().sub(sun.target.position).normalize();
  sun.target.position.copy(TERRACE).add(new THREE.Vector3(0, .75, 0));
  sun.position.copy(sun.target.position).addScaledVector(sunDirection, 80);
  Object.assign(sun.shadow.camera, { left:-8, right:8, top:7, bottom:-7, near:.1, far:110 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.normalBias = .004;
  sun.shadow.bias = -.00006;
  sun.shadow.radius = 3;
  hemi.intensity = 1.1;

  let mode = 'terrace';
  let renderedScene = scene;
  let framing = true;
  let portraitView = 'main';
  let ready = false;
  const exposure = renderer.toneMappingExposure;
  controls.minDistance = 1.8;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI * .53;
  controls.enablePan = false;

  function frame(view = portraitView) {
    if(typeof view==='string')portraitView=view;
    const portrait = innerWidth / innerHeight < .92;
    const origin = mode === 'neutral' ? new THREE.Vector3() : TERRACE;
    // A more frontal view foreshortens the 6.4m side glazing. The right of the
    // frame now has open sea, rather than only sea seen through the side wall.
    const offset = portraitView==='face' ? new THREE.Vector3(.45,1.55,2.0) : portrait ? new THREE.Vector3(.95, 1.47, 5.05) : new THREE.Vector3(1.7, 1.47, 4.9);
    const target = origin.clone().add(portraitView==='face' ? new THREE.Vector3(.04,1.46,0) : new THREE.Vector3(innerWidth < 600 ? -.04 : portrait ? .45 : .55, .93, -.10));
    camera.position.copy(origin).add(offset);
    controls.target.copy(target);
    camera.fov = portraitView==='face' ? 27 : portrait ? 34 : 33;
    camera.updateProjectionMatrix();
    controls.update();
    framing = true;
    canvas.dataset.heroFraming = portraitView;
  }
  function setMode(next) {
    mode = next;
    if (mode === 'neutral') {
      neutral.add(root);
      root.position.set(0, 0, 0);
      renderedScene = neutral;
      renderer.toneMappingExposure = 1;
    } else {
      scene.add(root);
      root.position.copy(TERRACE);
      renderedScene = scene;
      renderer.toneMappingExposure = exposure;
    }
    document.querySelectorAll('[data-hero-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroMode === mode)));
    document.body.classList.toggle('hero-neutral', mode === 'neutral');
    canvas.dataset.heroMode = mode;
    const place = mode === 'neutral' ? '中性光' : '黄昏露台';
    $('hero-mode-label').textContent = `${place} · ${candidate.id==='current'?'现有稿未通过':candidate.shortLabel}`;
    $('scene-status').textContent = candidate.id==='generated0597'?'用户模型 · 静态检查，尚未绑定':mode === 'neutral' ? '中性光检查 · 尚未通过' : candidate.id==='current' ? '现有静态稿 · 视觉未通过' : '成品候选 · 原型待适配';
    frame();
  }
  document.querySelectorAll('[data-hero-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.heroMode)));
  $('hero-reset').addEventListener('click', () => frame('main'));
  $('hero-closeup').addEventListener('click', () => frame('face'));
  $('hero-reference').addEventListener('click', () => $('guide-reference-dialog').showModal());
  $('hero-review').addEventListener('click', () => $('hero-review-dialog').showModal());
  $('hero-review-close').addEventListener('click', () => $('hero-review-dialog').close());
  $('hero-review-reference-open').addEventListener('click',()=>{$('hero-review-dialog').close();$('guide-reference-dialog').showModal();});
  $('hero-review-status').textContent=HERO_REVIEW.status;
  $('hero-review-boundary').textContent=HERO_REVIEW.boundary;
  for(const text of HERO_REVIEW.priorities){const li=document.createElement('li');li.textContent=text;$('hero-review-priorities').append(li);}
  for(const item of HERO_CANDIDATES){
    const url=new URL(location.href);url.searchParams.delete('legacy');url.searchParams.delete('review');url.searchParams.set('study','1');url.searchParams.set('hero',item.id);
    const link=document.createElement('a');link.href=url.href;link.textContent=item.label;link.setAttribute('aria-current',item.id===candidate.id?'true':'false');$('hero-candidates').append(link);
    if(item.id==='current')continue;
    const card=document.createElement('article');
    const title=document.createElement('h3');title.textContent=item.shortLabel;
    const detail=document.createElement('p');detail.textContent=item.detail;
    const source=document.createElement('a');source.href=item.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';source.textContent=item.source+' ↗';
    const open=document.createElement('a');open.href=url.href;open.textContent='放到同一露台查看 ↗';open.className='hero-review-open';
    const caption=document.createElement('p');caption.className='hero-preview-label';caption.textContent='作者原始预览 · 点击下方在实际露台检视';
    if(item.preview){const img=document.createElement('img');img.src=item.preview;img.alt=`${item.shortLabel}作者原始预览，非本项目原型还原`;card.append(img,caption);}
    card.append(title,detail,source,open);$('hero-review-candidates').append(card);
  }
  $('hero-source-note').textContent=candidate.status;
  $('hero-source-link').href=candidate.sourceUrl;
  $('hero-source-link').textContent=candidate.source+' ↗';
  $('guide-reference-close').addEventListener('click', () => $('guide-reference-dialog').close());
  $('hero-capture').addEventListener('click', () => $('capture').click());
  controls.addEventListener('start', () => { framing = false; canvas.dataset.heroFraming = 'inspection'; });
  setMode('terrace');

  const response = await fetch(new URL(candidate.file, import.meta.url));
  if (!response.ok) throw new Error(`Static portrait asset unavailable (${response.status})`);
  const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), new URL('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero/', import.meta.url).href);
  const model = gltf.scene;
  model.name = candidate.shortLabel;
  model.rotation.y += candidate.facing;
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const height = box.max.y - box.min.y;
  if (!Number.isFinite(height) || height < .5 || height > 4) throw new Error('Unexpected static character scale');
  const scale = 1.78 / height;
  model.scale.multiplyScalar(scale);
  model.position.y -= box.min.y * scale;
  model.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (object.isSkinnedMesh) object.frustumCulled = false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const name of ['map', 'normalMap', 'roughnessMap', 'aoMap']) {
        if (material[name]) material[name].anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      }
    }
  });
  root.add(model);
  root.updateMatrixWorld(true);
  // Static shoe-contact AO: a local, soft approximation supplements the real
  // low-sun shadow. It follows the authored sole bounds, not a person billboard.
  const contactCanvas = document.createElement('canvas');
  contactCanvas.width = contactCanvas.height = 128;
  const contactContext = contactCanvas.getContext('2d');
  const gradient = contactContext.createRadialGradient(64, 64, 10, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,.95)');
  gradient.addColorStop(.45, 'rgba(255,255,255,.65)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  contactContext.fillStyle = gradient;
  contactContext.fillRect(0, 0, 128, 128);
  const contactMap = new THREE.CanvasTexture(contactCanvas);
  const contactMaterial = new THREE.MeshBasicMaterial({ color:'#253035', map:contactMap, transparent:true, opacity:.32, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 });
  const soleMeshes = [];
  model.traverse(object => { if (object.isMesh && object.name.startsWith('Sneaker_Rubber_Sole')) soleMeshes.push(object); });
  for (const sole of soleMeshes) {
    const soleBounds = new THREE.Box3().setFromObject(sole);
    const center = root.worldToLocal(soleBounds.getCenter(new THREE.Vector3()));
    const size = soleBounds.getSize(new THREE.Vector3());
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(.17, size.x * 1.35), Math.max(.33, size.z * 1.25)), contactMaterial);
    contact.name = 'Static local shoe AO approximation';
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(center.x, .0018, center.z);
    contact.renderOrder = 1;
    root.add(contact);
  }
  canvas.dataset.heroReady = 'true';
  canvas.dataset.heroStatic = 'true';
  canvas.dataset.heroHeight = '1.78';
  $('hero-model-status').textContent = candidate.shortLabel;
  ready = true;
  frame();
  if(new URLSearchParams(location.search).get('review')==='1')$('hero-review-dialog').showModal();

  return {
    root,
    get renderScene() { return renderedScene; },
    get mode() { return mode; },
    frame,
    resize() { if (framing) frame(); },
    update() { controls.update(); },
    get ready() { return ready; },
  };
}
