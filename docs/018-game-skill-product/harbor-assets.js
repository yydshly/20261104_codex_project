import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { bakeOceanDetail, createOcean, createOceanGeometry, createWaves } from './vendor/ocean.mjs';

const ASSET_ROOT = './assets/forged/';
const SKY_COLORS = ['#74b4ba', '#82bcc2', '#a8d1cb', '#294f69', '#7eb9bf', '#75b0ba'];
const WAVE_SPECTRUM = [[8, 0.16, 0, 0.18], [4.4, 0.085, 32, 0.14], [2.6, 0.045, -24, 0.1], [1.5, 0.025, 58, 0.06]];

function prepareModel(root) {
  root.traverse(object => {
    if (!object.isMesh) return;
    object.material = new THREE.MeshLambertMaterial({ color: '#ffffff', vertexColors: Boolean(object.geometry.attributes.color), flatShading: true });
    object.castShadow = false;
    object.receiveShadow = true;
  });
  return root;
}

function createSkyCube() {
  const faces = SKY_COLORS.map(color => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, '#446c8c'); gradient.addColorStop(0.6, color); gradient.addColorStop(1, '#d4d5a4');
    context.fillStyle = gradient; context.fillRect(0, 0, 64, 64);
    return canvas;
  });
  const texture = new THREE.CubeTexture(faces);
  texture.needsUpdate = true;
  return texture;
}

function createOceanForHarbor(renderer, scene) {
  const waves = createWaves({ direction: 0.8, spectrum: WAVE_SPECTRUM });
  const skyCube = createSkyCube();
  const detail = bakeOceanDetail(THREE, renderer, { size: 256 });
  const ocean = createOcean(THREE, {
    waves, detailTexture: detail, skyCube,
    geometry: createOceanGeometry(THREE, { rings: 56, segments: 80 }),
    sunDirection: new THREE.Vector3(-0.35, 0.75, 0.55).normalize(),
    sunColor: new THREE.Vector3(2.0, 1.8, 1.3),
    ambient: new THREE.Vector3(0.35, 0.5, 0.52),
    deepColor: new THREE.Vector3(0.008, 0.095, 0.12),
    scatterColor: new THREE.Vector3(0.015, 0.32, 0.3),
    fogDensity: 0.002,
    hazeUniforms: { uHazeColor: { value: new THREE.Vector3(0.23, 0.45, 0.5) } },
  });
  // The original reusable ocean is at y=0 and renders into an HDR composite.
  // This game's quay is at y=0.1, its sea at -1.3, and its renderer owns ACES.
  ocean.material.vertexShader = ocean.material.vertexShader.replace('vec3 wp = p + d;', 'vec3 wp = p + d; wp.y -= 1.3;');
  ocean.material.toneMapped = false;
  const waterScene = new THREE.Scene();
  waterScene.background = new THREE.Color('#367481');
  waterScene.add(ocean.mesh);
  const target = new THREE.WebGLRenderTarget(320, 200, { type: THREE.HalfFloatType, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const composite = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { uWater: { value: target.texture } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.9999,1.0);}',
    fragmentShader: 'uniform sampler2D uWater; varying vec2 vUv; void main(){gl_FragColor=texture2D(uWater,vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
    depthTest: false, depthWrite: false,
  }));
  composite.frustumCulled = false;
  composite.renderOrder = -10000;
  scene.add(composite);
  const size = new THREE.Vector2();
  let lastWidth = 0;
  let lastHeight = 0;
  let lastRender = -Infinity;
  return {
    waves, ocean, composite,
    restore() { ocean.material.uniforms.uDetail.value = bakeOceanDetail(THREE, renderer, { size: 256 }); lastRender = -Infinity; },
    render(camera, time) {
      // Cache the decorative sea between 24 Hz updates; the game and HUD still
      // render at their normal frame rate. No combat timing depends on water.
      renderer.getSize(size);
      const width = Math.max(1, Math.round(size.x * 0.45));
      const height = Math.max(1, Math.round(size.y * 0.45));
      if (lastWidth !== width || lastHeight !== height) { target.setSize(width, height); lastWidth = width; lastHeight = height; lastRender = -Infinity; }
      if (time - lastRender < 1 / 24) return;
      lastRender = time;
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      renderer.render(waterScene, camera);
      renderer.setRenderTarget(previousTarget);
    },
  };
}

function createEffectPool(scene, textures) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const effects = Array.from({ length: 14 }, () => {
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: textures.impact }, uFrame: { value: 0 }, uOpacity: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform sampler2D uMap; uniform float uFrame; uniform float uOpacity; varying vec2 vUv; void main(){ vec2 cell=vec2(mod(uFrame,6.0),3.0-floor(uFrame/6.0)); vec2 uv=(cell+clamp(vUv,vec2(0.006),vec2(0.994)))/vec2(6.0,4.0); vec4 c=texture2D(uMap,uv); gl_FragColor=vec4(c.rgb,c.a*uOpacity); }',
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    mesh.renderOrder = 4;
    scene.add(mesh);
    return { mesh, age: 1, duration: 1, ground: false, reduced: false };
  });
  let cursor = 0;
  return {
    emit(event, reduced) {
      if (!['pulse', 'hit', 'defeat', 'guard', 'pickup', 'chapter-clear', 'won'].includes(event.type)) return;
      const effect = effects[cursor++ % effects.length];
      const pulse = event.type === 'pulse' || event.type === 'chapter-clear' || event.type === 'won';
      effect.age = 0; effect.duration = pulse ? 1 : 0.5;
      effect.ground = pulse; effect.reduced = reduced;
      effect.mesh.material.uniforms.uMap.value = pulse ? textures.tide : textures.impact;
      effect.mesh.material.uniforms.uOpacity.value = reduced ? 0.55 : 0.95;
      effect.mesh.position.set(event.x, pulse ? 0.17 : 0.7, event.z);
      effect.mesh.scale.setScalar(pulse ? 10.2 : event.type === 'defeat' ? 2.8 : 1.5);
      effect.mesh.visible = true;
    },
    update(dt, camera) {
      for (const effect of effects) {
        effect.age += dt;
        effect.mesh.visible = effect.age < effect.duration;
        if (!effect.mesh.visible) continue;
        effect.mesh.material.uniforms.uFrame.value = effect.reduced ? 8 : Math.min(23, Math.floor(effect.age / effect.duration * 24));
        effect.mesh.material.uniforms.uOpacity.value = effect.reduced ? (1 - effect.age / effect.duration) * 0.55 : 0.95;
        if (effect.ground) effect.mesh.rotation.set(-Math.PI / 2, 0, 0);
        else effect.mesh.quaternion.copy(camera.quaternion);
      }
    },
    clear() { effects.forEach(effect => { effect.age = effect.duration; effect.mesh.visible = false; }); },
    active() { return effects.filter(effect => effect.mesh.visible).length; },
  };
}

export async function installHarborAssets({ scene, renderer, crabs, lighthouse, beaconGlow, beaconLight, beaconRing, beams, sea, boat }) {
  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  const names = ['sentinel', 'guardian', 'cannon', 'beacon'];
  const models = await Promise.all(names.map(name => loader.loadAsync(`${ASSET_ROOT}models/models-${name}.glb`).then(gltf => prepareModel(gltf.scene))));
  const modelMap = Object.fromEntries(names.map((name, index) => [name, models[index]]));
  const [tide, impact] = await Promise.all(['tide', 'impact'].map(name => textureLoader.loadAsync(`${ASSET_ROOT}vfx/vfx-${name}.png`)));
  const effects = createEffectPool(scene, { tide, impact });
  for (const child of [...lighthouse.children]) child.visible = [beaconGlow, beaconLight, beaconRing, beams].includes(child);
  const beacon = modelMap.beacon.clone(true);
  lighthouse.add(beacon);
  const instances = crabs.map(crab => {
    const preserved = [crab.warning, crab.aim, crab.ticks[0].parent];
    for (const child of crab.group.children) {
      if (!preserved.includes(child) && !child.material?.transparent) child.visible = false;
    }
    return { type: '', model: null, materials: [] };
  });
  const water = createOceanForHarbor(renderer, scene);
  sea.visible = false;
  let enabled = true;
  return {
    emit(event, reduced, full) { if (full || event.type === 'pulse') effects.emit(event, reduced); },
    clear() { effects.clear(); },
    restore() { water.restore(); },
    setEnabled(value) { enabled = value; water.composite.visible = value; sea.visible = !value; },
    update(state, dt, time, camera, reduced) {
      for (let i = 0; i < crabs.length; i++) {
        const enemy = state.enemies[i];
        if (!enemy) continue;
        const instance = instances[i];
        const type = enemy.type === 'boss' ? 'guardian' : enemy.type === 'cannon' ? 'cannon' : 'sentinel';
        if (instance.type !== type) {
          if (instance.model) instance.model.removeFromParent();
          instance.model = modelMap[type].clone(true);
          instance.materials = [];
          instance.model.traverse(object => {
            if (!object.isMesh) return;
            object.material = object.material.clone();
            instance.materials.push(object.material);
          });
          crabs[i].group.add(instance.model); instance.type = type;
        }
        instance.model.position.y = reduced ? 0 : Math.sin(time * 10 + i) * (enemy.mode === 'charge' ? 0.04 : 0.012);
        instance.model.rotation.z = reduced ? 0 : Math.sin(time * 7 + i) * 0.025;
        const emission = enemy.flash > 0 ? 0.8 : enemy.stagger > 0 ? 0.35 : 0;
        instance.materials.forEach(material => { material.emissive.set('#9ee6e4'); material.emissiveIntensity = emission; });
      }
      if (!reduced) water.waves.update(Math.min(dt, 0.05));
      water.ocean.update({ time: reduced ? 0 : time, camera });
      water.waves.setSeaState(state.chapter === 2 ? 1.25 : 0.8);
      const waveHeight = water.waves.height(boat.position.x, boat.position.z);
      boat.position.y = -0.85 + waveHeight;
      boat.rotation.x = reduced ? 0 : (water.waves.height(boat.position.x, boat.position.z + 0.7) - waveHeight) * 0.65;
      effects.update(dt, camera);
      if (enabled) water.render(camera, time);
    },
    metrics() { return { modelsLoaded: models.length, atlasesLoaded: 2, activeFlipbooks: effects.active(), waterEnabled: enabled, waterTriangles: water.ocean.mesh.geometry.index.count / 3, waterResolutionScale: 0.45, waterMaxHz: 24, waterDrawCallsPerUpdate: enabled ? 1 : 0 }; },
  };
}
