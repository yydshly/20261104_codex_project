import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createCharacterStage(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111d24');
  const environment = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  scene.environment = generator.fromScene(environment, 0.04).texture;
  scene.environmentIntensity = 0.48;
  environment.dispose();
  generator.dispose();

  const surface = (color, roughness = 0.76, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const ink = new THREE.MeshBasicMaterial({ color: '#15252e', toneMapped: false });
  const trim = new THREE.MeshBasicMaterial({ color: '#57767a', toneMapped: false });
  const glow = new THREE.MeshBasicMaterial({ color: '#a4ead6', toneMapped: false });
  const dark = surface('#192d39');
  const blue = surface('#254957');
  const bronze = surface('#ab8463', 0.45, 0.5);

  function mesh(geometry, material, x, y, z) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.receiveShadow = true;
    scene.add(item);
    return item;
  }

  function box(w, h, d, x, y, z, material) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z);
  }

  scene.add(new THREE.HemisphereLight('#d6f2f9', '#706458', 1.5));
  const key = new THREE.DirectionalLight('#ffecce', 2.3);
  key.position.set(-0.44, 0.61, 0.66);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.58, right: 0.58, top: 0.6, bottom: -0.61, near: 0.08, far: 2.5 });
  key.shadow.normalBias = 0.002;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#8fd2fd', 2.05);
  rim.position.set(0.4, 0.27, -0.31);
  scene.add(rim);

  // Fixed dark surround with a slim inlay and a deep gallery behind it.
  const openingX = 0.453;
  const top = 0.222;
  const bottom = -0.253;
  for (const [w, h, x, y] of [
    [1.2, 0.6 - top, 0, (0.6 + top) / 2],
    [1.2, 0.6 + bottom, 0, (bottom - 0.6) / 2],
    [0.6 - openingX, top - bottom, -(0.6 + openingX) / 2, (top + bottom) / 2],
    [0.6 - openingX, top - bottom, (0.6 + openingX) / 2, (top + bottom) / 2],
  ]) {
    mesh(new THREE.PlaneGeometry(w, h), ink, x, y, 0);
  }
  for (const y of [top, bottom]) mesh(new THREE.PlaneGeometry(2 * openingX, 0.003), trim, 0, y, 0.001);
  for (const side of [-1, 1]) {
    mesh(new THREE.PlaneGeometry(0.003, top - bottom), trim, side * openingX, (top + bottom) / 2, 0.001);
    box(0.025, 0.66, 1.06, side * 0.5, 0, -0.544, dark);
    for (const z of [-0.24, -0.5, -0.77]) {
      box(0.013, 0.59, 0.018, side * 0.481, 0, z, blue);
      box(0.003, 0.183, 0.005, side * 0.473, 0.069, z, glow);
    }
  }
  box(1.03, 0.026, 1.08, 0, -0.29, -0.554, dark);
  box(1.03, 0.023, 1.08, 0, 0.315, -0.554, dark);
  box(1.02, 0.66, 0.04, 0, 0, -1.08, dark);
  box(0.72, 0.44, 0.024, 0, -0.012, -1.045, blue);
  box(0.66, 0.008, 0.032, 0, 0.212, -1.029, glow);
  for (const side of [-1, 1]) {
    box(0.004, 0.33, 0.028, side * 0.33, -0.006, -1.026, trim);
    box(0.003, 0.004, 0.87, side * 0.328, -0.272, -0.514, trim);
    for (let index = 0; index < 5; index += 1) {
      box(0.027, 0.003, 0.003, side * 0.3, -0.095 + index * 0.042, -1.03, trim);
    }
  }

  const deckY = -0.225;
  const deckZ = 0.07;
  mesh(new THREE.CylinderGeometry(0.217, 0.237, 0.048, 80), dark, 0, deckY - 0.034, deckZ);
  mesh(new THREE.CylinderGeometry(0.227, 0.227, 0.01, 80), bronze, 0, deckY - 0.012, deckZ);
  mesh(new THREE.CylinderGeometry(0.21, 0.219, 0.009, 80), blue, 0, deckY - 0.0045, deckZ);
  const ring = mesh(new THREE.TorusGeometry(0.203, 0.0015, 8, 80), trim, 0, deckY + 0.0005, deckZ);
  ring.rotation.x = -Math.PI / 2;

  const turntable = new THREE.Group();
  turntable.position.set(0, deckY, deckZ);
  scene.add(turntable);
  let sample;
  let uploaded;

  function prepare(model) {
    const bounds = new THREE.Box3().setFromObject(model, true);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const diameter = Math.hypot(size.x, size.z);
    const scale = Math.min(0.474 / size.y, 0.378 / diameter);
    if (bounds.isEmpty() || !Number.isFinite(scale) || scale <= 0) {
      disposeModel(model);
      throw new Error('文件里没有可展示的模型。');
    }

    const fitted = new THREE.Group();
    fitted.scale.setScalar(scale);
    fitted.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    fitted.add(model);
    model.traverse(item => {
      if (item.isMesh) item.castShadow = item.receiveShadow = true;
    });
    return fitted;
  }

  return {
    scene,
    update: () => false,
    setAngle(degrees) {
      turntable.rotation.y = THREE.MathUtils.degToRad(degrees);
    },
    async loadSample() {
      const response = await fetch(import.meta.env.BASE_URL + 'astronaut.glb');
      if (!response.ok) throw new Error('示例模型载入失败。');
      sample = prepare(await parseGlb(await response.arrayBuffer()));
      sample.visible = !uploaded;
      turntable.add(sample);
    },
    async importFile(file) {
      if (file.size > 50 * 1024 * 1024) throw new Error('请选择不超过 50 MB 的 GLB 文件。');
      const next = prepare(await parseGlb(await file.arrayBuffer()));
      if (uploaded) {
        uploaded.removeFromParent();
        disposeModel(uploaded);
      }
      uploaded = next;
      turntable.add(uploaded);
      if (sample) sample.visible = false;
    },
    resetSample() {
      if (uploaded) {
        uploaded.removeFromParent();
        disposeModel(uploaded);
        uploaded = undefined;
      }
      if (sample) sample.visible = true;
    },
  };
}

async function parseGlb(data) {
  const header = new DataView(data);
  if (header.byteLength < 20 || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2) {
    throw new Error('请选择有效的 GLB 2.0 文件。');
  }

  const jsonLength = header.getUint32(12, true);
  let assets;
  try {
    const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(data, 20, jsonLength)));
    assets = [...(manifest.buffers ?? []), ...(manifest.images ?? [])];
  } catch {
    throw new Error('无法读取 GLB 文件。');
  }
  if (assets.some(asset => asset?.uri && !String(asset.uri).startsWith('data:'))) {
    throw new Error('请将网格和贴图嵌入 GLB 文件。');
  }

  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => {
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    throw new Error('请将网格和贴图嵌入 GLB 文件。');
  });
  try {
    const { scene } = await new GLTFLoader(manager).parseAsync(data, '');
    return scene;
  } catch {
    throw new Error('无法读取模型。请使用内嵌贴图、未压缩的 GLB 2.0。');
  }
}

function disposeModel(model) {
  const resources = new Set();
  const images = new Set();
  model.traverse(item => {
    if (!item.isMesh) return;
    resources.add(item.geometry);
    if (item.skeleton) resources.add(item.skeleton);
    for (const material of Array.isArray(item.material) ? item.material : [item.material]) {
      resources.add(material);
      for (const value of Object.values(material)) {
        if (!value?.isTexture) continue;
        resources.add(value);
        if (value.image instanceof ImageBitmap) images.add(value.image);
      }
    }
  });
  for (const resource of resources) resource.dispose();
  for (const image of images) image.close();
}
