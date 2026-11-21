import * as THREE from 'three';
import { groundSurfaceHeight, rainBasins, waterSurfaceAt } from './world-terrain.js';
import { createDrainage } from './world-drainage.js';

// The sandy estuary drains quickly; compact soil beside the cabin holds water.
function soilAt(x, z) {
  if (x > 45) return { surface: 'sand', infiltration: .085 };
  if (z < -10) return { surface: 'gravel', infiltration: .055 };
  if (x < 0 && z < 20) return { surface: 'compact-soil', infiltration: .006 };
  return { surface: 'grass', infiltration: .018 };
}

export function createPuddles(scene, collision = null) {
  const group = new THREE.Group();
  group.name = '雨后岸边浅积水';
  scene.add(group);
  let terrain = null;
  scene.traverse((object) => {
    if (object.isMesh && object.geometry.getAttribute('aRiverDepth')) terrain = object;
  });
  const patches = [];
  const vertices = [];
  const ground = [];
  const bounds = [];
  const levels = [];
  const fills = [];
  const clock = { value: 0 };
  const rainfall = { value: 0 };
  let fill = 0;

  if (terrain) {
    const positions = terrain.geometry.getAttribute('position');
    const indices = terrain.geometry.getIndex();
    scene.updateMatrixWorld(true);
    for (const basin of rainBasins) {
      const bottom = groundSurfaceHeight(basin.x, basin.z);
      if (waterSurfaceAt(basin.x, basin.z, bottom) !== null) continue;
      if (collision?.blocks(basin.x, bottom + 1.64, basin.z, bottom, false)) continue;
      let rim = Infinity;
      for (let i = 0; i < 72; i++) {
        const angle = i * Math.PI / 36;
        rim = Math.min(rim, groundSurfaceHeight(basin.x + Math.cos(angle) * basin.radiusX,
          basin.z + Math.sin(angle) * basin.radiusZ));
      }
      const maximum = Math.min(bottom + .10, rim - .008);
      if (maximum < bottom + .012) continue;
      const patch = { ...basin, ...soilAt(basin.x, basin.z), bottom, maximum,
        level: bottom, rim, fill: 0, vertexStart: vertices.length / 3, vertexCount: 0 };
      patches.push(patch);
      const triangle = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
      const count = indices?.count ?? positions.count;
      for (let i = 0; i < count; i += 3) {
        for (let j = 0; j < 3; j++) {
          triangle[j].fromBufferAttribute(positions, indices ? indices.getX(i + j) : i + j).applyMatrix4(terrain.matrixWorld);
        }
        const [a, b, c] = triangle;
        if (Math.max(a.x, b.x, c.x) < basin.x - basin.radiusX
          || Math.min(a.x, b.x, c.x) > basin.x + basin.radiusX
          || Math.max(a.z, b.z, c.z) < basin.z - basin.radiusZ
          || Math.min(a.z, b.z, c.z) > basin.z + basin.radiusZ) continue;
        for (const point of triangle) {
          vertices.push(point.x, point.y, point.z);
          ground.push(point.y);
          bounds.push(basin.x, basin.z, basin.radiusX, basin.radiusZ);
          levels.push(bottom, maximum);
          fills.push(0);
        }
      }
      patch.vertexCount = vertices.length / 3 - patch.vertexStart;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('aGround', new THREE.Float32BufferAttribute(ground, 1));
  geometry.setAttribute('aBasin', new THREE.Float32BufferAttribute(bounds, 4));
  geometry.setAttribute('aLevels', new THREE.Float32BufferAttribute(levels, 2));
  const fillAttribute = new THREE.Float32BufferAttribute(fills, 1).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('aFill', fillAttribute);
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uTime: clock, uRain: rainfall },
    vertexShader: /* glsl */ `
      attribute float aFill;
      attribute float aGround;
      attribute vec4 aBasin;
      attribute vec2 aLevels;
      varying vec3 vWorld;
      varying float vDepth;
      varying vec4 vBasin;
      varying float vFill;
      #include <fog_pars_vertex>
      void main() {
        vec3 surface = position;
        surface.y = mix(aLevels.x, aLevels.y, aFill);
        vFill = aFill;
        vWorld = surface;
        vDepth = surface.y - aGround;
        vBasin = aBasin;
        vec4 mvPosition = modelViewMatrix * vec4(surface, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uRain;
      varying float vFill;
      varying vec3 vWorld;
      varying float vDepth;
      varying vec4 vBasin;
      #include <fog_pars_fragment>
      float random(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      void main() {
        vec2 basin = (vWorld.xz - vBasin.xy) / vBasin.zw;
        if (vDepth <= .0008 || dot(basin, basin) > 1.0) discard;
        vec2 cell = floor(vWorld.xz * 1.8);
        vec2 local = fract(vWorld.xz * 1.8);
        float seed = random(cell);
        vec2 origin = vec2(.22 + seed * .56, .22 + random(cell + 19.3) * .56);
        float age = fract(uTime * (.62 + seed * .59) + seed * 7.0);
        float delta = abs(length(local - origin) - age * .57);
        float ripple = (1.0 - smoothstep(.008, .032, delta)) * (1.0 - age) * uRain;
        float facing = abs(normalize(cameraPosition - vWorld).y);
        float reflection = pow(1.0 - facing, 3.5);
        float edge = smoothstep(.0008, .014, vDepth);
        vec3 color = mix(vec3(.16, .24, .23), vec3(.42, .54, .52), reflection * .67);
        color += vec3(.15, .20, .18) * ripple;
        float opacity = edge * (.21 + reflection * .40 + vFill * .13 + ripple * .13);
        gl_FragColor = vec4(color, opacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = '沿低洼地形形成的雨水';
  mesh.frustumCulled = false;
  mesh.renderOrder = 2.7;
  mesh.visible = false;
  group.add(mesh);
  const drainage = createDrainage(scene, collision);

  return {
    patches,
    mesh,
    drainage,
    get fill() { return fill; },
    snapshot() { return patches.map((patch) => patch.fill); },
    restore(saved) {
      fill = 0;
      for (let i = 0; i < patches.length; i++) {
        const patch = patches[i];
        patch.fill = THREE.MathUtils.clamp(Number.isFinite(saved?.[i]) ? saved[i] : 0, 0, 1);
        patch.level = THREE.MathUtils.lerp(patch.bottom, patch.maximum, patch.fill);
        fill = Math.max(fill, patch.fill);
        fillAttribute.array.fill(patch.fill, patch.vertexStart, patch.vertexStart + patch.vertexCount);
      }
      fillAttribute.needsUpdate = true;
      mesh.visible = fill > .012;
    },
    update(dt, time, weather) {
      dt = Math.min(.12, Math.max(0, dt));
      const rain = THREE.MathUtils.clamp(weather?.rain ?? 0, 0, 1);
      clock.value = time;
      rainfall.value = rain;
      fill = 0;
      for (const patch of patches) {
        // A small water balance for each closed depression. No fictitious
        // overflow crosses a rim: surface drainage is traced separately.
        const loss = patch.infiltration + .012 * (1 - rain);
        const input = .035 * Math.pow(rain, 1.45);
        patch.fill = THREE.MathUtils.clamp(THREE.MathUtils.damp(patch.fill, input / loss, loss, dt), 0, 1);
        patch.level = THREE.MathUtils.lerp(patch.bottom, patch.maximum, patch.fill);
        fill = Math.max(fill, patch.fill);
        fillAttribute.array.fill(patch.fill, patch.vertexStart, patch.vertexStart + patch.vertexCount);
      }
      fillAttribute.needsUpdate = patches.length > 0;
      mesh.visible = fill > .012 && patches.length > 0;
      drainage.update(dt, time, weather);
    },
    surfaceAt(x, z) {
      if (fill < .025) return null;
      for (const patch of patches) {
        if (patch.fill < .025) continue;
        if (((x - patch.x) / patch.radiusX) ** 2 + ((z - patch.z) / patch.radiusZ) ** 2 >= 1) continue;
        if (groundSurfaceHeight(x, z) < patch.level - .001) return patch.level;
      }
      return null;
    },
  };
}
