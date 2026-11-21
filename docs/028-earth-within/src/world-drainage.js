import * as THREE from 'three';
import { groundSurfaceHeight, riverSpan, riverWidth, riverZ, waterSurfaceAt } from './world-terrain.js';

const STEP = .32;
const MAX_PATHS = 18;
const sourceStations = [-12, 12, 36, 48, -24, -40, -56, -72, 0, 24, 56];

function bankDistance(x, z) {
  return Math.max(0, Math.abs(z - riverZ(x)) - riverWidth(x));
}

// Trace small surface streams against the same triangulated height field used
// by the walker. A line may end at water, but never travels through a river.
function traceSlope(x, z, collision) {
  const points = [];
  let y = groundSurfaceHeight(x, z);
  if (waterSurfaceAt(x, z, y) !== null || collision?.blocks(x, y + 1.64, z, y, false)) return null;
  points.push(new THREE.Vector3(x, y, z));
  let length = 0;
  for (let step = 0; step < 85; step++) {
    const distance = bankDistance(x, z);
    let best = null;
    let bestScore = -Infinity;
    for (let direction = 0; direction < 24; direction++) {
      const angle = direction * Math.PI / 12;
      const nx = x + Math.cos(angle) * STEP;
      const nz = z + Math.sin(angle) * STEP;
      const ny = groundSurfaceHeight(nx, nz);
      const drop = y - ny;
      if (drop < .001) continue;
      const nextDistance = bankDistance(nx, nz);
      if (nextDistance > distance + .09) continue;
      const score = drop / STEP + (distance - nextDistance) * .38;
      if (score <= bestScore) continue;
      let clear = true;
      let previousY = y;
      for (let sample = 1; sample <= 20; sample++) {
        const sx = THREE.MathUtils.lerp(x, nx, sample / 20);
        const sz = THREE.MathUtils.lerp(z, nz, sample / 20);
        const sy = groundSurfaceHeight(sx, sz);
        if (sy > previousY + .00005 || collision?.blocks(sx, sy + 1.64, sz, sy, false)) {
          clear = false;
          break;
        }
        previousY = sy;
      }
      if (clear) { best = { x: nx, y: ny, z: nz }; bestScore = score; }
    }
    if (!best) return null;
    x = best.x; y = best.y; z = best.z;
    length += STEP;
    if (waterSurfaceAt(x, z, y) !== null) {
      if (points.length < 7) return null;
      const outlet = new THREE.Vector3(x, y, z);
      // The final dry sample is up to one step from the bank. Render the last
      // terrain-clipped segment into the first wet sample so runoff meets the
      // river instead of stopping on dry ground. Tracing still stops here.
      return { points, renderPoints: [...points, outlet], length, outlet };
    }
    points.push(new THREE.Vector3(x, y, z));
  }
  return null;
}

function streamGround(scene, paths) {
  let terrain = null;
  scene.traverse((object) => {
    if (object.isMesh && object.geometry.getAttribute('aRiverDepth')) terrain = object;
  });
  if (!terrain || !paths.length) return [];
  scene.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  for (const path of paths) for (const point of path.renderPoints) bounds.expandByPoint(point);
  bounds.expandByScalar(.25);
  const triangles = [];
  const positions = terrain.geometry.getAttribute('position');
  const indices = terrain.geometry.getIndex();
  const count = indices?.count ?? positions.count;
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  for (let i = 0; i < count; i += 3) {
    for (let j = 0; j < 3; j++) {
      points[j].fromBufferAttribute(positions, indices ? indices.getX(i + j) : i + j).applyMatrix4(terrain.matrixWorld);
    }
    const [a, b, c] = points;
    const minX = Math.min(a.x, b.x, c.x), maxX = Math.max(a.x, b.x, c.x);
    const minZ = Math.min(a.z, b.z, c.z), maxZ = Math.max(a.z, b.z, c.z);
    if (maxX < bounds.min.x || minX > bounds.max.x || maxZ < bounds.min.z || minZ > bounds.max.z) continue;
    triangles.push({ points: points.map((point) => point.clone()), minX, maxX, minZ, maxZ });
  }
  return triangles;
}

function clipStream(polygon, axis, edge, keepGreater) {
  const result = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const aInside = keepGreater ? a[axis] >= edge : a[axis] <= edge;
    const bInside = keepGreater ? b[axis] >= edge : b[axis] <= edge;
    if (aInside) result.push(a);
    if (aInside !== bInside) {
      const t = (edge - a[axis]) / (b[axis] - a[axis]);
      const point = {};
      for (const attribute of ['x', 'y', 'z', 'across', 'along']) point[attribute] = THREE.MathUtils.lerp(a[attribute], b[attribute], t);
      result.push(point);
    }
  }
  return result;
}

export function createDrainage(scene, collision = null) {
  const paths = [];
  for (const x of sourceStations) {
    for (const side of [-1, 1]) {
      const span = riverSpan(x);
      for (const offset of [3.2, 5.4, 7.6]) {
        const z = span[side < 0 ? 0 : 1] + side * offset;
        const path = traceSlope(x, z, collision);
        if (!path) continue;
        paths.push(path);
        break;
      }
      if (paths.length >= MAX_PATHS) break;
    }
    if (paths.length >= MAX_PATHS) break;
  }

  const vertices = [];
  const coordinates = [];
  const triangles = streamGround(scene, paths);
  for (let index = 0; index < paths.length; index++) {
    const points = paths[index].renderPoints;
    let distance = 0;
    const width = .075 + (index % 4) * .019;
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const before = points[i - 1];
      const dx = point.x - before.x;
      const dz = point.z - before.z;
      const normalizer = Math.hypot(dx, dz) || 1;
      const length = point.distanceTo(before);
      const minX = Math.min(before.x, point.x) - width, maxX = Math.max(before.x, point.x) + width;
      const minZ = Math.min(before.z, point.z) - width, maxZ = Math.max(before.z, point.z) + width;
      for (const triangle of triangles) {
        if (triangle.maxX < minX || triangle.minX > maxX || triangle.maxZ < minZ || triangle.minZ > maxZ) continue;
        let polygon = triangle.points.map((vertex) => ({
          x: vertex.x, y: vertex.y, z: vertex.z,
          across: ((vertex.x - before.x) * -dz + (vertex.z - before.z) * dx) / (normalizer * width),
          along: ((vertex.x - before.x) * dx + (vertex.z - before.z) * dz) / normalizer,
        }));
        polygon = clipStream(polygon, 'across', -1, true);
        polygon = clipStream(polygon, 'across', 1, false);
        polygon = clipStream(polygon, 'along', 0, true);
        polygon = clipStream(polygon, 'along', normalizer, false);
        // Clip the original terrain triangles rather than spanning its grid
        // diagonals with a flat strip. The whole stream stays on the ground.
        for (let j = 1; j < polygon.length - 1; j++) {
          for (const vertex of [polygon[0], polygon[j], polygon[j + 1]]) {
            vertices.push(vertex.x, vertex.y + .009, vertex.z);
            coordinates.push(vertex.across, distance + vertex.along / normalizer * length);
          }
        }
      }
      distance += length;
    }
    paths[index].renderedLength = distance;
    paths[index].width = width;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('aStream', new THREE.Float32BufferAttribute(coordinates, 2));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 }, uActivity: { value: 0 }, uRain: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aStream;
      varying vec2 vStream;
      #include <fog_pars_vertex>
      void main() {
        vStream = aStream;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uActivity;
      uniform float uRain;
      varying vec2 vStream;
      #include <fog_pars_fragment>
      void main() {
        float edge = 1.0 - smoothstep(.40, 1.0, abs(vStream.x));
        float flowingWidth = mix(.35, 1.0, uActivity);
        edge *= 1.0 - smoothstep(flowingWidth * .6, flowingWidth, abs(vStream.x));
        float wave = pow(.5 + .5 * sin(vStream.y * 10.5 - uTime * (6.0 + uRain * 6.0)), 7.0);
        float streak = .5 + .5 * sin(vStream.y * 3.1 - uTime * 3.3 + vStream.x * 7.0);
        vec3 color = mix(vec3(.13, .22, .20), vec3(.54, .65, .58), wave * .46 + streak * .11);
        gl_FragColor = vec4(color, edge * uActivity * (.24 + wave * .33));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = '岸坡汇入河道的细小径流';
  mesh.renderOrder = 2.6;
  mesh.frustumCulled = false;
  mesh.visible = false;
  scene.add(mesh);
  let activity = 0;
  return {
    mesh, paths,
    get activity() { return activity; },
    update(dt, time, weather) {
      const runoff = THREE.MathUtils.clamp(weather?.runoff ?? weather?.rain ?? 0, 0, 1);
      const target = THREE.MathUtils.smoothstep(runoff, .045, .62);
      activity = THREE.MathUtils.damp(activity, target, target > activity ? .5 : .12, Math.min(.12, Math.max(0, dt)));
      material.uniforms.uTime.value = time;
      material.uniforms.uActivity.value = activity;
      material.uniforms.uRain.value = THREE.MathUtils.clamp(weather?.rain ?? 0, 0, 1);
      mesh.visible = paths.length > 0 && activity > .012;
    },
  };
}
