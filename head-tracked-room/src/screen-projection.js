// The rectangular opening lies on z=0 in the camera's coordinate system.
// Keeping it fixed lets the viewer move without rotating the virtual window.
export function setScreenProjection(camera, x, y, z, halfWidth, halfHeight) {
  const ratio = camera.near / z;
  camera.projectionMatrix.makePerspective(
    (-halfWidth - x) * ratio, (halfWidth - x) * ratio,
    (halfHeight - y) * ratio, (-halfHeight - y) * ratio,
    camera.near, camera.far,
  );
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}
