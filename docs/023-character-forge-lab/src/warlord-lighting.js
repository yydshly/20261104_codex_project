/** A local HDR reflection rig: broad sky, soft warm key and thin edge lights.
 * It is rendered once into PMREM; the game still uses its ordinary direct
 * lights and shadow maps. No remote HDR image or screen-space fake highlight.
 */
export function createHeroReflections(THREE, renderer, scene) {
  const studio = new THREE.Scene(); studio.background = new THREE.Color(.13, .16, .21);
  const resources = [];
  function panel(width, height, position, target, color, intensity) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false });
    material.color.multiplyScalar(intensity);
    const light = new THREE.Mesh(geometry, material); light.position.set(...position); light.lookAt(...target); studio.add(light);
    resources.push(geometry, material);
  }
  panel(8, 6, [-4, 6, 4], [0, 0, 0], '#fff1dc', 2.6);
  panel(4, 7, [6, 3, 1], [0, 0, 0], '#c9d9ef', 1.7);
  panel(2, 8, [-6, 2, -5], [0, 0, 0], '#eee4d6', 2.2);
  panel(7, 3, [0, 7, -1], [0, 0, 0], '#c7d8f0', 1.4);
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(studio, .12, .1, 100);
  generator.dispose(); resources.forEach(resource => resource.dispose()); studio.clear();
  scene.environment = target.texture; scene.environmentIntensity = .65;
  scene.environmentRotation.set(0, .35, 0);
  return { dispose() { if (scene.environment === target.texture) scene.environment = null; target.dispose(); } };
}
