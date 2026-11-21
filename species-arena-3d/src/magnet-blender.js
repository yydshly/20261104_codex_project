import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createMagnetHero } from './magnet-hero.js';

const models = {
  blender: 'magnet-blender.glb',
  'blender-wing': 'magnet-blender-wing.glb',
};
const assetRequests = new Map();

function loadMagnetSkin(model) {
  if (assetRequests.has(model)) return assetRequests.get(model);
  const request = new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/${models[model]}`)
    .then(({ scene }) => scene)
    .catch(error => {
      assetRequests.delete(model);
      throw error;
    });
  assetRequests.set(model, request);
  return request;
}

export async function applyBlenderMagnetAppearance(rig, model = 'blender') {
  const skin = rig.appearance;
  if (!skin) throw new Error('Magnet appearance slots are required');
  if (!Object.hasOwn(models, model)) throw new RangeError(`Unknown Magnet appearance: ${model}`);
  if (skin.model === model) return rig;

  const scene = await loadMagnetSkin(model);
  if (skin.model === model) return rig;
  const pieces = Object.entries(skin.slots).map(([name, slot]) => {
    const source = scene.getObjectByName(name);
    if (!source || source.isMesh || !source.children.length) {
      throw new Error(`Blender appearance is missing the ${name} group`);
    }
    const piece = source.clone(true);
    piece.name = `Blender_${name}`;
    // The export stores the bind positions for standalone viewing. The live rig supplies them here.
    piece.position.set(0, 0, 0);
    piece.quaternion.identity();
    piece.scale.setScalar(1);
    return { slot, piece };
  });

  const emitters = new Map();
  function prepareMaterial(material) {
    if (!material.emissive || material.emissive.getHex() === 0) return material;
    if (!emitters.has(material)) {
      const instance = material.clone();
      emitters.set(material, { material: instance, intensity: instance.emissiveIntensity });
    }
    return emitters.get(material).material;
  }
  for (const { piece } of pieces) {
    piece.traverse(child => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      child.castShadow = materials.some(material => !material.transparent);
      child.receiveShadow = true;
      child.material = Array.isArray(child.material) ? materials.map(prepareMaterial) : prepareMaterial(child.material);
    });
  }
  for (const piece of skin.mountedPieces) piece.removeFromParent();
  for (const { material } of skin.emitters) material.dispose();
  for (const { slot, piece } of pieces) slot.add(piece);
  for (const mesh of skin.baseMeshes) mesh.visible = false;
  skin.emitters = [...emitters.values()];
  skin.mountedPieces = pieces.map(({ piece }) => piece);
  skin.model = model;
  return rig;
}

export function createBlenderMagnetHero(model = 'blender') {
  return applyBlenderMagnetAppearance(createMagnetHero(), model);
}
