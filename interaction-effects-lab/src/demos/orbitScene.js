import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function releaseModel(model) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  model.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      for (const material of [object.material].flat()) materials.add(material);
    }
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
  for (const geometry of geometries) geometry.dispose();
}

export function createOrbitScene(canvas, options) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .05);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xfff4e2, 2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xc4d9ff, .8);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0xa38563, .43));

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const models = new Map();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const actual = { yaw: 0, pitch: 0, zoom: 1 };
  const target = { ...actual };
  const marker = new THREE.Vector3();
  const amber = new THREE.Color(0xffbc80);
  const daylight = new THREE.Color(0xfff4e2);
  let width = 0;
  let height = 0;
  let selection = 0;
  let disposed = false;
  let active = null;
  let outgoing = null;
  let switchAt = 0;
  let request = 0;
  let lastFrame = 0;
  let light = 0;
  let goalLight = 0;
  let turn = null;
  let finish = '#b7785e';

  function render(now) {
    request = 0;
    if (disposed) return;
    const dt = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : .016;
    lastFrame = now;
    const gain = reduced ? 1 : 1 - Math.exp(-dt * 18);
    const progress = reduced ? 1 : Math.min(1, (now - switchAt) / 430);
    const entry = 1 - (1 - Math.max(0, progress)) ** 3;

    if (turn) {
      const fraction = Math.min(1, (now - turn.start) / 960);
      const glide = .5 - Math.cos(fraction * Math.PI) / 2;
      target.yaw = turn.from + turn.delta * glide;
      if (fraction === 1) turn = null;
    }
    for (const key of Object.keys(actual)) actual[key] += (target[key] - actual[key]) * gain;
    light += (goalLight - light) * gain;
    scene.environmentIntensity = 1 - light * .72;
    key.color.copy(daylight).lerp(amber, light);
    key.intensity = 2 + light * .6;
    rim.intensity = .8 + light * 1.15;
    camera.position.z = Math.max(4.65, 3.4 / Math.min(1, camera.aspect)) / actual.zoom;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    if (active) {
      active.pivot.position.x = .7 * (1 - entry);
      active.pivot.scale.setScalar(.82 + .18 * entry);
      active.pivot.rotation.set(actual.pitch, actual.yaw, 0, 'YXZ');
      active.pivot.updateMatrixWorld(true);
      options.hotspots?.forEach(({ point, element }) => {
        if (!element.current) return;
        marker.set(...point);
        active.shape.localToWorld(marker).project(camera);
        element.current.style.left = `${(marker.x * .5 + .5) * 100}%`;
        element.current.style.top = `${(-marker.y * .5 + .5) * 100}%`;
      });
    }
    if (outgoing) {
      outgoing.pivot.position.x = -3 * entry;
      outgoing.pivot.scale.setScalar(1 - .28 * entry);
      if (progress === 1) {
        scene.remove(outgoing.pivot);
        outgoing = null;
      }
    }
    renderer.render(scene, camera);
    const moving = turn || (active && progress < 1) || outgoing ||
      Math.abs(goalLight - light) > .001 ||
      Object.keys(actual).some((key) => Math.abs(target[key] - actual[key]) > .002);
    if (moving) schedule();
    else lastFrame = 0;
  }

  function schedule() {
    if (!request && !disposed) request = requestAnimationFrame(render);
  }

  const observer = new ResizeObserver(([entry]) => {
    ({ width, height } = entry.contentRect);
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    schedule();
  });
  observer.observe(canvas.parentElement);

  function load(id) {
    if (models.has(id)) return models.get(id);
    const pending = loader.loadAsync(`${import.meta.env.BASE_URL}demo-assets/orbit/${id}.glb`).then(({ scene: model }) => {
      if (disposed) {
        releaseModel(model);
        return null;
      }
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const fit = 2.25 / Math.max(size.x, size.y, size.z);
      const pivot = new THREE.Group();
      const shape = new THREE.Group();
      const holder = new THREE.Group();
      holder.scale.setScalar(fit);
      holder.position.copy(center).multiplyScalar(-fit);
      holder.add(model);
      shape.add(holder);
      pivot.add(shape);
      return { pivot, shape, model };
    }).catch((error) => {
      models.delete(id);
      throw error;
    });
    models.set(id, pending);
    return pending;
  }

  function recolor() {
    active?.model.traverse((object) => {
      if (!object.isMesh) return;
      for (const material of [object.material].flat()) {
        if (!material?.name.toLowerCase().includes('fabric')) continue;
        material.color.set(finish);
        material.sheenColor?.set(finish);
        material.metalness = 0;
        material.roughness = .9;
        material.needsUpdate = true;
      }
    });
    schedule();
  }

  return {
    async select(specimen) {
      const token = ++selection;
      try {
        const next = await load(specimen.model ?? specimen.id);
        if (!next || disposed || token !== selection) return;
        if (outgoing) {
          scene.remove(outgoing.pivot);
          outgoing = null;
        }
        if (active && active !== next && !reduced) outgoing = active;
        if (active && active !== next && reduced) scene.remove(active.pivot);
        active = next;
        active.shape.scale.set(...(specimen.scale ?? [1, 1, 1]));
        active.pivot.position.set(0, 0, 0);
        active.pivot.scale.setScalar(1);
        scene.add(active.pivot);
        turn = null;
        Object.assign(actual, { yaw: specimen.yaw, pitch: specimen.pitch, zoom: 1 });
        Object.assign(target, actual);
        switchAt = performance.now();
        if (specimen.model === 'chair') recolor();
        options.onReady();
        schedule();
      } catch {
        if (!disposed && token === selection) {
          if (active) scene.remove(active.pivot);
          active = null;
          options.onFailure();
          schedule();
        }
      }
    },
    update(view) {
      turn = null;
      Object.assign(target, view);
      schedule();
    },
    spin(view) {
      Object.assign(target, view);
      if (!reduced) turn = { from: view.yaw - Math.PI * 2, delta: Math.PI * 2, start: performance.now() };
      schedule();
    },
    setDusk(on) {
      goalLight = on ? 1 : 0;
      schedule();
    },
    setFinish(color) {
      finish = color;
      recolor();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(request);
      for (const model of models.values()) model.then((entry) => entry && releaseModel(entry.model)).catch(() => {});
      environment.dispose();
      renderer.dispose();
    },
  };
}
