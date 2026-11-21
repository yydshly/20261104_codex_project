import { Box3, Matrix4, Triangle, Vector3 } from 'three';
import { groundSurfaceHeight } from './world-terrain.js';

const cellSize = 4;
const bodyHalfWidth = .24;
const cell = (value) => Math.floor(value / cellSize);
const key = (x, z) => x * 65536 + z;

// Cover all four near-plane corners, including wide windows and close-up lenses.
export function cameraClearance(camera) {
  const halfHeight = camera.near * Math.tan(camera.fov * Math.PI / 360);
  return Math.max(.10, Math.hypot(camera.near, halfHeight, halfHeight * camera.aspect) + .025);
}

export function createWorldCollision(scene) {
  const grid = new Map();
  const terrainMaxima = new Map();
  let highestSurface = -Infinity;
  const transform = new Matrix4();
  const instance = new Matrix4();
  scene.updateMatrixWorld(true);

  scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const terrain = Boolean(mesh.geometry.getAttribute('aRiverDepth'));
    if (!mesh.userData.collidable && !terrain) return;
    const positions = mesh.geometry.getAttribute('position');
    const indices = mesh.geometry.getIndex();
    const count = indices?.count ?? positions.count;
    for (let i = 0; i < (mesh.isInstancedMesh ? mesh.count : 1); i++) {
      transform.copy(mesh.matrixWorld);
      if (mesh.isInstancedMesh) {
        mesh.getMatrixAt(i, instance);
        transform.multiply(instance);
      }
      const vertex = (index) => new Vector3()
        .fromBufferAttribute(positions, indices ? indices.getX(index) : index)
        .applyMatrix4(transform);
      for (let j = 0; j < count; j += 3) {
        const triangle = new Triangle(vertex(j), vertex(j + 1), vertex(j + 2));
        const { a, b, c } = triangle;
        const bottom = Math.min(a.y, b.y, c.y);
        const top = Math.max(a.y, b.y, c.y);
        highestSurface = Math.max(highestSurface, top);
        const entry = { triangle, bottom, top, up: triangle.getNormal(new Vector3()).y,
          substrate: mesh.userData.rainWettable === 'wood' ? 'wood' : 'stone' };
        const lastX = cell(Math.max(a.x, b.x, c.x));
        const lastZ = cell(Math.max(a.z, b.z, c.z));
        for (let x = cell(Math.min(a.x, b.x, c.x)); x <= lastX; x++) {
          for (let z = cell(Math.min(a.z, b.z, c.z)); z <= lastZ; z++) {
            const id = key(x, z);
            if (terrain) {
              terrainMaxima.set(id, Math.max(terrainMaxima.get(id) ?? -Infinity, top));
            } else {
              if (!grid.has(id)) grid.set(id, []);
              grid.get(id).push(entry);
            }
          }
        }
      }
    }
  });

  function intersectsScene(box) {
    for (let ix = cell(box.min.x); ix <= cell(box.max.x); ix++) {
      for (let iz = cell(box.min.z); iz <= cell(box.max.z); iz++) {
        const entries = grid.get(key(ix, iz));
        if (entries?.some((entry) => entry.top > box.min.y && entry.bottom < box.max.y
          && box.intersectsTriangle(entry.triangle))) return true;
      }
    }
    return false;
  }

  const body = new Box3();
  const cameraBox = new Box3();
  const cameraDirection = new Vector3();
  const cameraPoint = new Vector3();

  function cameraBlocked(point, radius = .20) {
    cameraBox.min.set(point.x - radius, point.y - radius, point.z - radius);
    cameraBox.max.set(point.x + radius, point.y + radius, point.z + radius);
    if (intersectsScene(cameraBox)) return true;
    if (terrainMaxima.size) {
      let ceiling = -Infinity;
      let covered = true;
      for (let ix = cell(cameraBox.min.x); ix <= cell(cameraBox.max.x); ix++) {
        for (let iz = cell(cameraBox.min.z); iz <= cell(cameraBox.max.z); iz++) {
          const top = terrainMaxima.get(key(ix, iz));
          if (top === undefined) covered = false;
          else ceiling = Math.max(ceiling, top);
        }
      }
      if (covered && point.y - radius > ceiling) return false;
    }
    // Check the whole camera footprint so a tilted bank cannot enter a viewport corner.
    for (const dx of [-radius, 0, radius]) {
      for (const dz of [-radius, 0, radius]) {
        if (point.y - radius <= groundSurfaceHeight(point.x + dx, point.z + dz)) return true;
      }
    }
    return false;
  }

  function constrainCamera(anchor, desired, target, radius = .20, orbit = false) {
    const origin = anchor.clone();
    cameraDirection.subVectors(desired, origin);
    const length = cameraDirection.length();
    if (length <= .0001) return target.copy(anchor);
    cameraDirection.divideScalar(length);
    if (cameraBlocked(origin, radius)) {
      if (orbit) {
        // A view target can be inside a solid building. Exit that initial solid
        // before sweeping the camera boom; later obstructions still stop it.
        let exited = false;
        for (let travel = .08; travel <= Math.max(length, 24); travel += .08) {
          cameraPoint.copy(anchor).addScaledVector(cameraDirection, travel);
          if (!cameraBlocked(cameraPoint, radius)) {
            origin.copy(cameraPoint);
            exited = true;
            if (travel >= length) return target.copy(origin);
            break;
          }
        }
        if (!exited) return target.copy(desired);
      } else {
        // A head near a wall can fit while the wider camera sphere cannot.
        // Find a nearby clear origin without crossing the wall's centre line.
        let found = false;
        for (const reach of [.10, .20, .35, .55]) {
          for (const offset of [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]]) {
            cameraPoint.copy(anchor).addScaledVector(new Vector3(...offset), reach);
            if (cameraBlocked(cameraPoint, radius)) continue;
            let connected = true;
            for (let t = .04; t < reach; t += .04) {
              if (cameraBlocked(anchor.clone().addScaledVector(new Vector3(...offset), t), .025)) { connected = false; break; }
            }
            if (connected) { origin.copy(cameraPoint); found = true; break; }
          }
          if (found) break;
        }
        if (!found) return target.copy(anchor);
      }
    }
    cameraDirection.subVectors(desired, origin);
    const distance = cameraDirection.length();
    if (distance < .0001) return target.copy(origin);
    cameraDirection.divideScalar(distance);
    const steps = Math.max(1, Math.ceil(distance / Math.min(.12, radius * .6)));
    let clear = 0;
    for (let i = 0; i <= steps; i++) {
      const travel = distance * i / steps;
      cameraPoint.copy(origin).addScaledVector(cameraDirection, travel);
      if (terrainMaxima.size && cameraDirection.y >= 0 && cameraPoint.y - radius > highestSurface) {
        return target.copy(origin).addScaledVector(cameraDirection, distance);
      }
      if (cameraBlocked(cameraPoint, radius)) {
        let blocked = travel;
        for (let j = 0; j < 8 && blocked - clear > .0001; j++) {
          const middle = (clear + blocked) / 2;
          cameraPoint.copy(origin).addScaledVector(cameraDirection, middle);
          if (cameraBlocked(cameraPoint, radius)) blocked = middle;
          else clear = middle;
        }
        return target.copy(origin).addScaledVector(cameraDirection, Math.max(0, clear - .035));
      }
      clear = travel;
    }
    return target.copy(origin).addScaledVector(cameraDirection, distance);
  }

  return {
    supportAt(x, soleY, z, target = {}, rise = .12, drop = .16) {
      let height = groundSurfaceHeight(x, z) + .025;
      let support = null;
      for (const entry of grid.get(key(cell(x), cell(z))) ?? []) {
        if (entry.up < .68 || entry.top < height || entry.bottom > soleY + rise) continue;
        const { a, b, c } = entry.triangle;
        const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
        if (Math.abs(denominator) < .000001) continue;
        const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / denominator;
        const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / denominator;
        if (u < -.0001 || v < -.0001 || u + v > 1.0001) continue;
        const y = a.y * u + b.y * v + c.y * (1 - u - v);
        if (y < height || y > soleY + rise || soleY - y > drop) continue;
        height = y;
        support = entry;
      }
      if (!support) return null;
      target.floor = height;
      target.substrate = support.substrate;
      return target;
    },
    blocks(x, y, z, floor, swimming, feet = floor, crouch = 0) {
      // Let feet pass over gravel and low steps. In water, check above and below the diver.
      const bottom = swimming ? y - .39 : Math.max(floor + .24, feet + .02);
      const top = swimming ? y + .16 : feet + 1.78 - .62 * crouch;
      body.min.set(x - bodyHalfWidth, bottom, z - bodyHalfWidth);
      body.max.set(x + bodyHalfWidth, top, z + bodyHalfWidth);
      return intersectsScene(body);
    },
    cameraBlocked,
    constrainCamera,
  };
}
