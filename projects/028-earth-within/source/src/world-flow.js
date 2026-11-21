import { Box3, Matrix4, MathUtils, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial } from 'three';

const CELL = 5;
let obstacles = [];
let grid = new Map();
const clamp = MathUtils.clamp;

// A bounded local approximation: potential flow around each solid, plus a
// dissipating pair of wake vortices. All advected objects use this same field.
export function setFlowObstacles(items = []) {
  obstacles = items.filter((o) => [o.x, o.z, o.radius, o.bottom, o.top].every(Number.isFinite)
    && o.radius > .06 && o.radius < 3 && o.top > o.bottom).map((o) => ({ ...o }));
  grid = new Map();
  for (const o of obstacles) {
    const reach = o.radius * 5;
    for (let x = Math.floor((o.x - reach) / CELL); x <= Math.floor((o.x + reach) / CELL); x++) {
      for (let z = Math.floor((o.z - reach) / CELL); z <= Math.floor((o.z + reach) / CELL); z++) {
        const key = `${x},${z}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(o);
      }
    }
  }
  return obstacles;
}

export function applyLocalFlow(x, z, surface, submersion, velocity) {
  const nearby = grid.get(`${Math.floor(x / CELL)},${Math.floor(z / CELL)}`);
  const speed = Math.hypot(velocity.x, velocity.z);
  if (!nearby || speed < .00001) return velocity;
  const ux = velocity.x / speed, uz = velocity.z / speed;
  const nx = -uz, nz = ux;
  let dx = 0, dz = 0;
  const y = surface - Math.max(.02, submersion);
  for (const o of nearby) {
    if (surface < o.bottom || y > o.top + 1.3 || y < o.bottom - .2) continue;
    const rx = x - o.x, rz = z - o.z;
    const r = Math.hypot(rx, rz), a = o.radius;
    const vertical = 1 - MathUtils.smoothstep(y - o.top, 0, 1.3);
    if (r < a * .94 && y < o.top) return velocity.set(0, 0, 0);
    if (r > a * 5) continue;
    const ex = rx / Math.max(r, .001), ez = rz / Math.max(r, .001);
    const fade = 1 - MathUtils.smoothstep(r / a, 3.5, 5);
    const ratio = Math.min(1, a * a / Math.max(r * r, .001)) * fade * vertical;
    const dot = ux * ex + uz * ez;
    dx += speed * ratio * (ux - 2 * dot * ex);
    dz += speed * ratio * (uz - 2 * dot * ez);
    const along = rx * ux + rz * uz, across = rx * nx + rz * nz;
    if (along > a * .4) {
      const wake = Math.exp(-(((along - 2.05 * a) / (1.55 * a)) ** 2) - (across / (.8 * a)) ** 2)
        * MathUtils.smoothstep(along / a, .4, 1) * vertical;
      dx -= ux * speed * wake * 1.45;
      dz -= uz * speed * wake * 1.45;
      // Opposed vortices make sheltered return flow between their centres.
      for (const side of [-1, 1]) {
        const px = along - 2.1 * a, pz = across - side * .85 * a;
        const envelope = Math.exp(-(px * px + pz * pz) / (2.8 * a * a));
        const spin = -side * speed * a * .44 * envelope * vertical / (px * px + pz * pz + .3 * a * a);
        const vx = -pz * spin, vz = px * spin;
        dx += ux * vx + nx * vz;
        dz += uz * vx + nz * vz;
      }
    }
  }
  velocity.x += dx; velocity.z += dz;
  // Overlapping stones must not amplify the field without limit.
  const result = Math.hypot(velocity.x, velocity.z);
  if (result > speed * 1.85) velocity.multiplyScalar(speed * 1.85 / result);
  return velocity;
}

export function collectFlowObstacles(scene, { centerAt, spanAt, surfaceAt }) {
  scene.updateMatrixWorld(true);
  const matrix = new Matrix4(), instance = new Matrix4(), box = new Box3();
  const items = [];
  scene.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.userData.collidable || !mesh.geometry) return;
    mesh.geometry.computeBoundingBox();
    const count = mesh.isInstancedMesh ? mesh.count : 1;
    for (let i = 0; i < count; i++) {
      if (mesh.isInstancedMesh) { mesh.getMatrixAt(i, instance); matrix.multiplyMatrices(mesh.matrixWorld, instance); }
      else matrix.copy(mesh.matrixWorld);
      box.copy(mesh.geometry.boundingBox).applyMatrix4(matrix);
      const x = (box.min.x + box.max.x) / 2, z = (box.min.z + box.max.z) / 2;
      const radius = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * .46;
      if (x < -96 || x > 84 || radius < .08 || radius > 2.6 || box.max.y - box.min.y < .16) continue;
      const span = spanAt(x), surface = surfaceAt(x);
      if (z < span[0] - radius || z > span[1] + radius || Math.abs(z - centerAt(x)) > 18
        || box.min.y > surface + .2 || box.max.y < surface - 3) continue;
      items.push({ x, z, radius, bottom: box.min.y, top: box.max.y });
    }
  });
  return setFlowObstacles(items);
}

export function createFlowTraces(scene, items, { groundAt, waterAt, currentAt }, count = 112) {
  const positions = new Float32Array(count * 6), colors = new Float32Array(count * 6);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const mesh = new LineSegments(geometry, new LineBasicMaterial({ vertexColors: true, transparent: true,
    opacity: .48, depthWrite: false, blending: 2 }));
  mesh.name = '礁石旁的绕流与回水亮纹'; mesh.frustumCulled = false;
  scene.add(mesh);
  const particles = Array.from({ length: count }, () => ({ x: 0, z: 0, life: 0, age: 0 }));
  const velocity = new Vector3();
  let cursor = 0, nearby = [], refresh = 0;
  return {
    get count() { return count; },
    update(dt, eye, runoff = 0) {
      dt = clamp(dt, 0, .12); refresh -= dt;
      if (refresh <= 0) { nearby = items.filter((o) => Math.hypot(o.x - eye.x, o.z - eye.z) < 42); refresh = .7; }
      for (let i = 0; i < count; i++) {
        const p = particles[i], j = i * 6;
        if (p.age >= p.life && nearby.length) {
          const o = nearby[(cursor++) % nearby.length];
          const angle = (i * 2.39996 + cursor * .73) % (2 * Math.PI);
          const radius = o.radius * (1.15 + (i % 5) * .43);
          p.x = o.x + Math.cos(angle) * radius; p.z = o.z + Math.sin(angle) * radius;
          p.age = 0; p.life = 2.4 + (i % 7) * .21;
        }
        const floor = groundAt(p.x, p.z), surface = waterAt(p.x, p.z, floor);
        currentAt(p.x, p.z, floor, .03, velocity, runoff);
        const speed = velocity.length();
        if (surface === null || surface - floor < .04 || speed < .015 || !nearby.length) {
          colors.fill(0, j, j + 6); p.age = p.life; continue;
        }
        const nextX = p.x + velocity.x * dt, nextZ = p.z + velocity.z * dt;
        const nextFloor = groundAt(nextX, nextZ), nextSurface = waterAt(nextX, nextZ, nextFloor);
        if (nextSurface === null || nextSurface - nextFloor < .025) { p.age = p.life; colors.fill(0, j, j + 6); continue; }
        p.x = nextX; p.z = nextZ; p.age += dt;
        const fade = Math.min(1, p.age * 3, (p.life - p.age) * 2) * .65;
        const length = .07 + Math.min(.24, speed * .13);
        positions.set([p.x, nextSurface + .018, p.z,
          p.x - velocity.x / speed * length, nextSurface + .019, p.z - velocity.z / speed * length], j);
        colors.set([.6 * fade, .83 * fade, .72 * fade, .13 * fade, .24 * fade, .22 * fade], j);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    },
  };
}
