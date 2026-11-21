import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/addons/loaders/GLTFLoader.js';
import { createDuck3D as createLocomotionController } from './pond-duck-3d.js';
import {splitDuckBill,createMouthLining,quackGapeAt,DUCK_QUACK_SECONDS} from './pond-duck-mouth.js';
import {createDuckCallSchedule} from './pond-duck-calls.js';

const LENGTH = .75;
const WIDTH = .30;
const MODEL_URL = new URL('./assets/models/duck-v5/mallard-preview.glb', import.meta.url).href;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

// Small, continuous deformation of the acquired textured model. This is not a
// replacement sculpt: its anatomy, silhouette, UVs and plumage remain the asset's.
const skinShader = /* glsl */`
attribute vec2 pondDuckWeights;
uniform vec3 pondDuckPose;
vec3 pondDuckRotZ(vec3 p, float a) {
  float c = cos(a), s = sin(a); return vec3(c*p.x-s*p.y, s*p.x+c*p.y, p.z);
}
vec3 pondDuckRotY(vec3 p, float a) {
  float c = cos(a), s = sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z);
}
vec3 pondDuckDeform(vec3 p) {
  vec3 bill = vec3(.295, .294, -.028);
  p = bill + pondDuckRotZ(p-bill, -pondDuckPose.z*pondDuckWeights.y);
  vec3 neck = vec3(.145, .20, -.015);
  return neck + pondDuckRotY(pondDuckRotZ(p-neck, pondDuckPose.y*pondDuckWeights.x), pondDuckPose.x*pondDuckWeights.x);
}
vec3 pondDuckNormal(vec3 n) {
  n = pondDuckRotZ(n, -pondDuckPose.z*pondDuckWeights.y);
  return pondDuckRotY(pondDuckRotZ(n, pondDuckPose.y*pondDuckWeights.x), pondDuckPose.x*pondDuckWeights.x);
}
`;

/**
 * CC-BY textured mallard with the existing interaction and water controller.
 * Acquired model: 3Dima, "Realistic Mallard Duck - Game Ready Asset".
 * Attribution and exact download provenance: assets/models/duck-v5/README.md.
 */
export function createDuck3D({ onEvent = () => {}, loadAsset, randomCallSource } = {}) {
  let vocalAge=Infinity;
  const randomCalls=createDuckCallSchedule({random:randomCallSource});
  function relay(event){if(event.type==='quack'){if(vocalAge<1.8)return;vocalAge=0;if(!event.autonomous)randomCalls.noteManualCall();}onEvent(event);}
  const controller = createLocomotionController({ onEvent:relay, dockAvoidance: false });
  const object3D = controller.object3D;
  const locomotionRig = object3D.children[0];
  // Keep the proven controller API; none of its old procedural meshes is rendered.
  object3D.remove(locomotionRig);
  object3D.name = 'Mallard — acquired textured 3D asset';
  const visual = new THREE.Group();
  visual.name = 'Floating mallard';
  object3D.add(visual);
  const resources = { geometries: new Set(), materials: new Set(), textures: new Set() };
  const pose = { value: new THREE.Vector3() };
  let disposed = false;
  let assetStatus = 'loading';
  let assetError = null;
  let headYaw = 0, headPitch = 0, billOpen = 0, gazeTarget = 0, nextGaze = 1.8;
  const linings=[];
  let seed = 33917;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  function applySkin(shader) {
    shader.uniforms.pondDuckPose = pose;
    shader.vertexShader = skinShader + shader.vertexShader;
    shader.vertexShader = shader.vertexShader
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = pondDuckDeform(transformed);')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = pondDuckNormal(objectNormal);');
  }

  function releaseImported(root, keepTextures = false) {
    root.traverse(item => {
      if (!item.isMesh) return;
      item.geometry.dispose();
      const materials = Array.isArray(item.material) ? item.material : [item.material];
      for (const material of materials) {
        if (!keepTextures) for (const value of Object.values(material)) {
          if (value?.isTexture) { value.dispose(); value.source?.data?.close?.(); }
        }
        material.dispose();
      }
    });
  }

  function prepareAsset(gltf) {
    if (disposed) { releaseImported(gltf.scene); return object3D; }
    gltf.scene.updateMatrixWorld(true);
    const parts = [];
    const turnForward = new THREE.Matrix4().makeRotationY(Math.PI / 2);
    const bounds = new THREE.Box3();
    gltf.scene.traverse(item => {
      if (!item.isMesh) return;
      const geometry = item.geometry.clone();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(turnForward, item.matrixWorld));
      geometry.computeBoundingBox();
      bounds.union(geometry.boundingBox);
      parts.push({ geometry, sourceMaterial: Array.isArray(item.material) ? item.material[0] : item.material });
    });
    if (!parts.length) { releaseImported(gltf.scene); throw new Error('Mallard asset contains no mesh.'); }
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = LENGTH / size.x;
    // Feet and the underside sit below the sampled water surface. Preserve height
    // proportions; the model's body width is normalized to a plausible 30 cm.
    const waterline = bounds.min.y + size.y * .25;
    const normalization = new THREE.Matrix4().makeScale(scale, scale, WIDTH / size.z)
      .multiply(new THREE.Matrix4().makeTranslation(-center.x, -waterline, -center.z));
    for (const { geometry, sourceMaterial } of parts) {
      geometry.applyMatrix4(normalization);
      const split=splitDuckBill(geometry);geometry.dispose();
      object3D.userData.sourceTriangles=(object3D.userData.sourceTriangles||0)+split.sourceTriangles;
      resources.geometries.add(split.body);resources.geometries.add(split.jaw);
      const material = new THREE.MeshPhysicalMaterial({
        map: sourceMaterial.map,
        color: sourceMaterial.color?.clone() ?? new THREE.Color('white'),
        roughness: .87,
        metalness: 0,
        sheen: .08,
        sheenRoughness: .9,
        sheenColor: new THREE.Color('#ddd9cb'),
      });
      if (material.map) { material.map.anisotropy = 8; resources.textures.add(material.map); }
      material.onBeforeCompile = applySkin;
      material.customProgramCacheKey = () => 'pond-mallard-v5-articulated-bill';
      resources.materials.add(material);
      const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
      depth.onBeforeCompile = applySkin;
      depth.customProgramCacheKey = () => 'pond-mallard-v5-articulated-bill-depth';
      resources.materials.add(depth);
      function addPart(g,m,name){const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;mesh.customDepthMaterial=depth;mesh.frustumCulled=false;visual.add(mesh);return mesh;}
      addPart(split.body,material,'3Dima mallard — textured feather anatomy and upper bill');
      addPart(split.jaw,material,'3Dima mallard — articulated textured lower bill');
      const liningMaterial=new THREE.MeshStandardMaterial({color:'#28170e',roughness:1,side:THREE.DoubleSide});liningMaterial.onBeforeCompile=applySkin;liningMaterial.customProgramCacheKey=()=> 'mallard-mouth-lining';resources.materials.add(liningMaterial);
      for(const weight of [0,1]){const lining=createMouthLining(weight);resources.geometries.add(lining);const mesh=addPart(lining,liningMaterial,weight?'Lower mouth interior':'Upper mouth interior');mesh.visible=false;linings.push(mesh);}

    }
    releaseImported(gltf.scene, true);
    assetStatus = 'ready';
    object3D.userData.asset = {
      author: '3Dima', license: 'CC-BY-4.0',
      source: 'https://sketchfab.com/3d-models/realistic-mallard-duck-game-ready-asset-dd33cd2e30944a4aae2de1a06a828f4f',
      length: LENGTH, width: WIDTH,
    };
    return object3D;
  }

  function update(delta, options = {}) {
    if (disposed) return false;
    const moved = controller.update(delta, options);

    const dt = clamp(Number(delta) || 0, 0, .1), state = controller.getState();
    if(randomCalls.update(dt,{allowed:assetStatus==='ready'&&Boolean(options.randomCallsAllowed),busy:vocalAge<1.8||['respond','preen','forage'].includes(state.behavior)}))relay({type:'quack',x:state.x,z:state.z,heading:state.heading,speed:state.speed,strength:.5,autonomous:true});
    const t = state.animationTime;
    if (moved && t > nextGaze) { gazeTarget = (random() - .5) * .20; nextGaze = t + 2.6 + random() * 4.5; }
    const headingToTarget = Math.atan2(state.target.z - state.z, state.target.x - state.x);
    const turn = Math.atan2(Math.sin(headingToTarget - state.heading), Math.cos(headingToTarget - state.heading));
    const callAge = state.behavior === 'respond' ? state.actionTime : null;
    const response = callAge === null ? 0 : Math.sin(clamp(callAge / 1.3, 0, 1) * Math.PI);
    const anticipatory=callAge!==null&&callAge>=.43&&callAge<.5?.06*smooth(.43,.5,callAge):0;
    const mouth=Math.max(anticipatory,quackGapeAt(vocalAge));
    if(Number.isFinite(vocalAge))vocalAge+=dt;
    const swimming = state.behavior === 'cruise' || state.behavior === 'approach';
    const forage = state.behavior === 'forage';
    const preen = state.behavior === 'preen';
    if(moved){headYaw = damp(headYaw, gazeTarget + (swimming ? clamp(turn, -.7, .7) * .13 : 0) + response * .08 + (preen ? .15 : 0), 2.6, dt);
    headPitch = damp(headPitch, response * .065 - (forage ? .12 : 0) + (preen ? -.04 : 0), 3.4, dt);
    }
    billOpen = damp(billOpen, mouth, 34, dt);
    if(vocalAge>DUCK_QUACK_SECONDS+.4&&billOpen<.0001)billOpen=0;
    linings.forEach(mesh=>{mesh.visible=billOpen>.008;});
    pose.value.set(headYaw, headPitch, billOpen);
    // The controller already samples actual water height and slope; retain that
    // buoyancy and turn response without introducing a second independent bob.
    visual.rotation.copy(locomotionRig.rotation);
    visual.rotation.x = clamp(visual.rotation.x, -.075, .075);
    visual.rotation.z = clamp(visual.rotation.z, -.07, .07);
    return moved||billOpen>0;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    randomCalls.setEnabled(false);
    controller.dispose();
    resources.geometries.forEach(g => g.dispose());
    resources.materials.forEach(m => m.dispose());
    resources.textures.forEach(t => { t.dispose(); t.source?.data?.close?.(); });
    visual.clear();
  }

  const load = loadAsset ?? (url => new GLTFLoader().loadAsync(url));
  const ready = Promise.resolve().then(() => load(MODEL_URL)).then(prepareAsset).catch(error => {
    assetStatus = 'error';
    assetError = String(error?.message ?? error);
    throw error;
  });
  // The caller may await ready to show its own loading/error state. Retain the
  // rejection on that promise while preventing a fire-and-forget unhandled error.
  ready.catch(() => {});
  return {
    object3D, ready, update, dispose,
    interact: (kind, point) => controller.interact(kind, point),
    setRandomCalls:enabled=>{if(!disposed)randomCalls.setEnabled(enabled);},
    setSurfaceSampler: fn => controller.setSurfaceSampler(fn),
    getState: () => ({ ...controller.getState(), length: LENGTH, width: WIDTH, assetStatus, assetError, assetName: '3Dima realistic mallard',billOpenRadians:billOpen,vocalAgeSeconds:Number.isFinite(vocalAge)?vocalAge:null,quackDuration:DUCK_QUACK_SECONDS,randomCalls:randomCalls.getState() }),
  };
}

export const createDuckV5 = createDuck3D;
