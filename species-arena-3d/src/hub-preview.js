import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCatalogHero, usesPowerPose } from './hero-models.js';
import { createObservation } from './rescue-observe.js';

function makeObservationHero(id) {
  const model = createCatalogHero(id);
  if (usesPowerPose(id)) return model;

  model.object.traverse(child => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    child.castShadow = materials.some(material => !material.transparent);
    child.receiveShadow = true;
  });
  return {
    object: model.object,
    update: ({ time, progress }) => model.update({ time, gait: 0, attack: progress, impact: 0 }),
  };
}

export function createHubPreview(viewport) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', '可旋转和缩放的英雄三维模型');
  viewport.append(renderer.domElement);

  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.07).texture;
  const observation = createObservation(environment, makeObservationHero);
  room.dispose();
  generator.dispose();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 55);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 2.25;
  controls.maxDistance = 13;
  controls.minPolarAngle = 0.17;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.zoomSpeed = 0.72;

  let hero;
  let previewTime = null;
  let inView = true;
  let sized = false;
  let frameId = null;
  let previousFrame = null;
  const pose = { time: 0.8, color: '', duration: 2.2 };

  function scheduleFrame() {
    if (inView && sized && hero && frameId === null) frameId = requestAnimationFrame(draw);
  }

  function draw(now) {
    frameId = null;
    if (!inView || !sized) return;
    const dt = previousFrame === null ? 0 : (now - previousFrame) / 1000;
    previousFrame = now;
    pose.time += dt;
    if (previewTime !== null) {
      previewTime += dt;
      if (previewTime >= pose.duration) previewTime = null;
    }
    observation.pose(hero.id, previewTime ?? 0, pose);
    renderer.render(observation.scene, camera);
    scheduleFrame();
  }

  function resetCamera() {
    if (!hero) return;
    const targetHeight = hero.height * 0.48;
    controls.target.set(0, targetHeight, 0);
    camera.position.set(-2.65, 1.38, 4.6).multiplyScalar(hero.group === 'powered' ? 1 : 1.11);
    camera.position.y += targetHeight;
    controls.update();
    scheduleFrame();
  }

  new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = viewport;
    sized = Boolean(width && height);
    if (!sized) {
      previousFrame = null;
      return;
    }
    camera.aspect = width / height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(17));
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfFov * Math.max(1, 1 / camera.aspect)));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    scheduleFrame();
  }).observe(viewport);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) previousFrame = null;
    scheduleFrame();
  }).observe(viewport);

  document.addEventListener('visibilitychange', () => { previousFrame = null; });

  return {
    select(nextHero) {
      if (nextHero.id === hero?.id) return;
      hero = nextHero;
      previewTime = null;
      previousFrame = null;
      pose.time = 0.8;
      pose.color = hero.accent;
      pose.duration = hero.group === 'powered' ? 2.2 : hero.duration * 1.45;
      observation.pose(hero.id, 0, pose);
      resetCamera();
    },
    previewAbility() {
      if (hero) previewTime = 0;
    },
    resetCamera,
  };
}
