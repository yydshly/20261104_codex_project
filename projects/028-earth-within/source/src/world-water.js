import * as THREE from 'three';
import { distanceToVisitor } from './world-wildlife.js';
import { seaSurfaceHeight, getTideState } from './world-tides.js';
import {
  groundHeight, groundSurfaceHeight, riverCurrentAt, riverLevel, riverSpan, riverSurfaceHeight, riverWidth, riverZ, coastlineX,
  baseRiverSpan, baseRiverSurfaceHeight, riverFloodRiseAt, riverBarrierHeightAt, maximumRiverSpan, getRiverFloodStage, waterSurfaceAt,
  RIVER_SOURCE as SOURCE, RIVER_OUTLET as OUTLET, RIVER_MOUTH as MOUTH,
} from './world-terrain.js';
const RAIN_COUNT = 1250;
const IMPACT_COUNT = 190;
const meltRills = [
  { path: [[-114.4, -22.25], [-112.55, -22.8], [-111.1, -23.4], [-109.65, -23.58], [-108.35, -24.07], [-107.25, -24.62]], width: .39 },
  { path: [[-113.35, -27.8], [-112.21, -27.32], [-110.96, -27.13], [-109.62, -26.87], [-108.45, -26.55], [-107.36, -26.66]], width: .31 },
];

function makeRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function strip(columns, rows, sample) {
  const positions = [];
  const water = [];
  const indices = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const [x, y, z, depth, edge] = sample(i, j);
      positions.push(x, y, z);
      water.push(depth, edge);
      if (i + 1 === columns || j + 1 === rows) continue;
      const index = i * rows + j;
      indices.push(index, index + 1, index + rows, index + 1, index + rows + 1, index + rows);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aWater', new THREE.Float32BufferAttribute(water, 2));
  geometry.setIndex(indices);
  return geometry;
}

function riverGeometry(scene) {
  const columns = 351;
  const flowTimes = new Float32Array(columns);
  const current = new THREE.Vector3();
  const spacing = (MOUTH - SOURCE) / (columns - 1);
  let minimumZ = Infinity;
  let maximumZ = -Infinity;
  for (let i = 0; i < columns; i++) {
    const span = maximumRiverSpan(SOURCE + i * spacing);
    minimumZ = Math.min(minimumZ, span[0]);
    maximumZ = Math.max(maximumZ, span[1]);
  }
  let travelTime = 0;
  for (let i = 1; i < columns; i++) {
    const x = SOURCE + (i - .5) * spacing;
    const z = riverZ(x);
    riverCurrentAt(x, z, groundSurfaceHeight(x, z), 0, current);
    travelTime += spacing / Math.max(.35, current.x);
    flowTimes[i] = travelTime;
  }
  let terrain = null;
  scene.traverse((object) => {
    if (object.isMesh && object.geometry.getAttribute('aRiverDepth')) terrain = object;
  });
  const vertices = [];
  const water = [];
  const flood = [];
  const travel = [];
  const flowAt = (x) => {
    const value = THREE.MathUtils.clamp((x - SOURCE) / spacing, 0, columns - 1.000001);
    const index = Math.floor(value);
    return THREE.MathUtils.lerp(flowTimes[index], flowTimes[index + 1], value - index);
  };
  function clip(polygon, distance) {
    const result = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length];
      const da = distance(a), db = distance(b);
      if (da >= 0) result.push(a);
      if ((da >= 0) !== (db >= 0)) result.push(a.clone().lerp(b, da / (da - db)));
    }
    return result;
  }
  function emit(polygon) {
    polygon = clip(polygon, (point) => point.z - maximumRiverSpan(point.x)[0]);
    polygon = clip(polygon, (point) => maximumRiverSpan(point.x)[1] - point.z);
    for (let i = 1; i + 1 < polygon.length; i++) {
      const triangle = [polygon[0], polygon[i], polygon[i + 1]];
      const area = (triangle[1].x - triangle[0].x) * (triangle[2].z - triangle[0].z)
        - (triangle[2].x - triangle[0].x) * (triangle[1].z - triangle[0].z);
      if (Math.abs(area) < 1e-8) continue;
      for (const point of triangle) {
        const level = baseRiverSurfaceHeight(point.x);
        vertices.push(point.x, level, point.z);
        water.push(level - point.y, (point.z - riverZ(point.x)) / riverWidth(point.x));
        const barrier = riverBarrierHeightAt(point.x, point.z);
        const maximumRise = riverFloodRiseAt(point.x, 1);
        flood.push(maximumRise, point.x > -96 && point.x < MOUTH
          ? level - (Number.isFinite(barrier) ? barrier : level + 1e4) : 1);
        travel.push(flowAt(point.x));
      }
    }
  }
  function triangle(points) {
    let polygon = clip(points, (point) => point.x - SOURCE);
    polygon = clip(polygon, (point) => MOUTH - point.x);
    if (polygon.length < 3) return;
    const low = Math.min(...polygon.map((point) => point.x));
    const high = Math.max(...polygon.map((point) => point.x));
    if (low < -95.8) {
      // The curved meltwater-pool outlet turns sharply over one ground cell.
      // Subdivide its footprint without changing the underlying terrain plane.
      const cuts = [low, high];
      for (let x = Math.ceil(low / .12) * .12; x < high - .000001; x += .12) if (x > low + .000001) cuts.push(x);
      if (low < -96 && high > -96) cuts.push(-96);
      cuts.sort((a, b) => a - b);
      for (let i = 1; i < cuts.length; i++) {
        if (cuts[i] - cuts[i - 1] < .000001) continue;
        emit(clip(clip(polygon, (point) => point.x - cuts[i - 1]), (point) => cuts[i] - point.x));
      }
    } else emit(polygon);
  }
  if (terrain) {
    // Reuse the terrain's actual triangle planes. Interpolated water depth then
    // clips the shoreline against exactly the ground the walker stands on.
    terrain.updateWorldMatrix(true, false);
    const positions = terrain.geometry.getAttribute('position');
    const indices = terrain.geometry.getIndex();
    const count = indices?.count ?? positions.count;
    const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    for (let i = 0; i < count; i += 3) {
      for (let j = 0; j < 3; j++) points[j].fromBufferAttribute(positions, indices ? indices.getX(i + j) : i + j).applyMatrix4(terrain.matrixWorld);
      const minX = Math.min(points[0].x, points[1].x, points[2].x);
      const maxX = Math.max(points[0].x, points[1].x, points[2].x);
      if (maxX < SOURCE || minX > MOUTH) continue;
      const minZ = Math.min(points[0].z, points[1].z, points[2].z);
      const maxZ = Math.max(points[0].z, points[1].z, points[2].z);
      if (maxZ < minimumZ || minZ > maximumZ) continue;
      const spans = points.map((point) => maximumRiverSpan(point.x));
      if (maxZ < Math.min(...spans.map((span) => span[0])) || minZ > Math.max(...spans.map((span) => span[1]))) continue;
      triangle(points);
    }
  } else {
    // Keep scene-independent callers useful; the application always has terrain.
    const rows = 55;
    const pointAt = (i, j) => {
      const x = THREE.MathUtils.lerp(SOURCE, MOUTH, i / (columns - 1));
      const span = maximumRiverSpan(x);
      const z = THREE.MathUtils.lerp(span[0], span[1], j / (rows - 1));
      return new THREE.Vector3(x, groundSurfaceHeight(x, z), z);
    };
    for (let i = 1; i < columns; i++) for (let j = 1; j < rows; j++) {
      const a = pointAt(i - 1, j - 1), b = pointAt(i, j - 1), c = pointAt(i - 1, j), d = pointAt(i, j);
      triangle([a, c, b]); triangle([b, c, d]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('aWater', new THREE.Float32BufferAttribute(water, 2));
  geometry.setAttribute('aFlood', new THREE.Float32BufferAttribute(flood, 2));
  geometry.setAttribute('aFlowTime', new THREE.Float32BufferAttribute(travel, 1));
  return geometry;
}

function meltRillGeometry(waypoints, width) {
  const route = new THREE.SplineCurve(waypoints.map(([x, z]) => new THREE.Vector2(x, z)));
  return strip(141, 7, (i, j) => {
    const p = i / 140;
    const { x: cx, y: cz } = route.getPointAt(p);
    const tangent = route.getTangentAt(p);
    const edge = j / 3 - 1;
    const breath = .83 + .17 * Math.sin(p * Math.PI * 9);
    const offset = edge * width * breath * (.53 + p * .47);
    const x = cx - tangent.y * offset;
    const z = cz + tangent.x * offset;
    return [x, groundSurfaceHeight(x, z) + .042, z, .24, edge];
  });
}

function addIce(scene) {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .87, flatShading: true });
  const powder = new THREE.Color('#d9e6e1');
  const shelfBlue = new THREE.Color('#6d9aab');
  const moraine = new THREE.Color('#6c7f79');
  const tint = new THREE.Color();

  function addBank(name, columns, rows, sample) {
    const colors = [];
    const geometry = strip(columns, rows, (i, j) => {
      const [x, y, z, snow, ice] = sample(i, j);
      tint.copy(moraine).lerp(shelfBlue, ice).lerp(powder, snow);
      tint.multiplyScalar(.92 + .08 * Math.sin(i * 1.87 + j * 3.1) ** 2);
      colors.push(tint.r, tint.g, tint.b);
      return [x, y, z, 0, 0];
    });
    geometry.deleteAttribute('aWater');
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.userData.collidable = true;
    scene.add(mesh);
  }

  addBank('融水塘与步道之间的碎石雪岸', 44, 11, (i, j) => {
    const x = THREE.MathUtils.lerp(-108.8, -98.3, i / 43);
    const edge = riverSpan(x)[1];
    const face = j / 5 - 1;
    const width = (face < 0 ? .78 : .56) + .07 * Math.sin(x * 1.77);
    const z = edge + face * width;
    const base = groundSurfaceHeight(x, z);
    const height = 30.25 + Math.sin(x * 2.7) * .09;
    const bulk = Math.max(height - base, .11) * Math.cos(face * Math.PI * .5) ** 1.1;
    const end = THREE.MathUtils.smoothstep(x, -108.8, -107.4) * (1 - THREE.MathUtils.smoothstep(x, -99.5, -98.3));
    const snow = end * (1 - Math.abs(face)) * (.36 + .46 * Math.sin(x * .77) ** 2);
    return [x, base + bulk * end - .015, z, snow, .14 + Math.max(0, -face) * .54];
  });

  const shelves = [
    [-114.45, -22.35, 2.65, 1.66, .9, .51],
    [-112.3, -20.65, 1.54, .98, .61, 2.1],
    [-113.05, -28.25, 2.28, 1.33, .74, 3.11],
    [-112.3, -29.38, 1.12, .91, .38, 4.5],
    [-108.6, -26.18, .83, .58, .39, 1.7],
    [-109.37, -25.2, .69, .58, .32, .35],
  ];
  for (const [cx, cz, width, length, height, phase] of shelves) {
    addBank('融雪冰缘', 7, 27, (i, j) => {
      const reach = i / 6;
      const angle = j / 26 * Math.PI * 2;
      const edge = 1 + Math.sin(angle * 3 + phase) * .14 + Math.cos(angle * 7 - phase) * .066;
      const x = cx + Math.cos(angle) * reach * width * edge;
      const z = cz + Math.sin(angle) * reach * length * edge;
      const uplift = Math.max(0, 1 - reach ** 3.7) * height;
      const snow = (1 - THREE.MathUtils.smoothstep(reach, .59, 1)) * (.81 + Math.sin(angle * 4 + phase) * .19);
      return [x, groundSurfaceHeight(x, z) + uplift - .035, z, snow, .87];
    });
  }
}

function oceanGeometry() {
  const xs = [];
  const zs = [];
  for (let x = 48; x < 132; x += 1.7) xs.push(x);
  for (let x = 132; x <= 460; x += 10) xs.push(x);
  for (let z = -410; z < -90; z += 10) zs.push(z);
  for (let z = -90; z <= 90; z += 1.8) zs.push(z);
  for (let z = 91; z <= 411; z += 10) zs.push(z);
  return strip(xs.length, zs.length, (i, j) => {
    const x = xs[i];
    const z = zs[j];
    const outsideShelf = THREE.MathUtils.smoothstep(Math.abs(z), 96, 126);
    const floor = groundSurfaceHeight(x, z);
    const depth = THREE.MathUtils.lerp(-floor, 23, outsideShelf);
    const river = x < 60 && riverBarrierHeightAt(x, z) < baseRiverSurfaceHeight(x);
    const ownership = river ? 1 - THREE.MathUtils.smoothstep(x, 55, 60) : 0;
    return [x, 0, z, depth, ownership];
  });
}

const surfaceVertex = /* glsl */ `
  uniform float uTime;
  uniform float uFlowTime;
  uniform float uRain;
  uniform float uRunoff;
  uniform float uRiverStage;
  uniform float uSeaLevel;
  uniform float uEstuaryTravel;
  uniform vec2 uRiverMouth;
  attribute vec2 aWater;
  varying vec3 vWorld;
  varying vec2 vWater;
  #if defined(RIVER) && !defined(RILL)
    attribute float aFlowTime;
    attribute vec2 aFlood;
    varying float vFlowTime;
    varying float vRiverConnection;
  #endif
  #include <fog_pars_vertex>
  float coastalWave(vec3 p, float depth) {
    float swell = sin(p.x * .38 + p.z * .16 + uTime * 1.8);
    float chop = sin(p.x * .79 - p.z * .46 + uTime * 2.3);
    float calm = (1.0 - smoothstep(58.0, 68.0, p.x))
      * (1.0 - smoothstep(3.0, 11.0, abs(p.z - uRiverMouth.y)));
    return (swell * .093 + chop * .047) * (.19 + smoothstep(.1, 9.0, depth))
      * (1.0 + uRain * .55) * (1.0 - calm * .85);
  }
  void main() {
    vec3 surface = position;
    vWater = aWater;
    #ifdef RIVER
      float center = max(0.0, 1.0 - abs(aWater.y));
      #ifdef RILL
        float flow = sin(surface.x * 4.4 + surface.z * 2.5 - uTime * 6.0);
      #else
        vFlowTime = aFlowTime;
        float rise = aFlood.x * uRiverStage + uSeaLevel * smoothstep(36.0, 55.0, surface.x);
        surface.y += rise;
        vWater.x += rise;
        vRiverConnection = aFlood.y + rise;
        float channel = 1.0 - smoothstep(.20, 1.0, abs(aWater.y));
        float flowPhase = mix((aFlowTime - uFlowTime * channel) * 5.0,
          (surface.x - uEstuaryTravel * channel) * 3.0, smoothstep(44.0, 58.0, surface.x));
        float flow = sin(flowPhase + surface.z * 2.5);
      #endif
      float riverWave = center * flow * (0.020 + uRain * 0.013 + uRunoff * .014);
      #ifdef RILL
        surface.y += riverWave;
      #else
        surface.y += mix(riverWave, coastalWave(surface, vWater.x), smoothstep(48.0, 55.0, surface.x));
      #endif
    #else
      surface.y += uSeaLevel;
      vWater.x += uSeaLevel;
      surface.y += coastalWave(surface, vWater.x);
    #endif
    vWorld = (modelMatrix * vec4(surface, 1.0)).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(surface, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const surfaceFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFlowTime;
  uniform float uSeaLevel;
  uniform float uEstuaryTravel;
  uniform float uTidalFlow;
  uniform float uRain;
  uniform float uRunoff;
  uniform float uTurbidity;
  uniform vec3 uShallows;
  uniform vec3 uDeep;
  uniform vec3 uSeaShallows;
  uniform vec3 uSeaDeep;
  uniform vec3 uRiverShallows;
  uniform vec3 uRiverDeep;
  uniform vec3 uMuddyShallows;
  uniform vec3 uMuddyDeep;
  uniform vec3 uFoam;
  uniform vec2 uRiverMouth;
  varying vec3 vWorld;
  varying vec2 vWater;
  #if defined(RIVER) && !defined(RILL)
    varying float vFlowTime;
    varying float vRiverConnection;
  #endif
  #include <fog_pars_fragment>

  float crest(float phase, float limit) {
    float value = cos(phase);
    float width = max(0.045, fwidth(value));
    return smoothstep(limit - width * 0.45, limit + width * 0.55, value);
  }

  float cellRandom(vec2 cell) {
    return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  }

  float patchNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 offset = fract(point);
    vec2 blend = offset * offset * (3.0 - 2.0 * offset);
    return mix(mix(cellRandom(cell), cellRandom(cell + vec2(1.0, 0.0)), blend.x),
      mix(cellRandom(cell + vec2(0.0, 1.0)), cellRandom(cell + vec2(1.0, 1.0)), blend.x), blend.y);
  }

  void main() {
    float x = vWorld.x;
    float z = vWorld.z;
    float depth = max(vWater.x, 0.0);
    vec3 viewOffset = cameraPosition - vWorld;
    vec3 viewDirection = normalize(viewOffset);
    float rim = pow(1.0 - abs(viewDirection.y), 3.1);
    vec3 color;
    float alpha;
    #ifdef RIVER
      #ifndef RILL
        if (vRiverConnection <= .001 || vWater.x <= .001) discard;
      #endif
      float edge = abs(vWater.y);
      float rapid = 1.0 - smoothstep(-88.0, -37.0, x);
      float pool = 1.0 - smoothstep(-99.5, -98.5, x);
      #ifdef RILL
        float along = x * .86 - uTime * 1.4;
      #else
        float channelSpeed = 1.0 - smoothstep(.20, 1.0, edge);
        float along = mix(vFlowTime - uFlowTime * channelSpeed,
          (x - uEstuaryTravel * channelSpeed) * .75, smoothstep(44.0, 58.0, x));
      #endif
      #ifdef RILL
        float sediment = 0.0;
      #else
        float sediment = uTurbidity * smoothstep(-100.0, -75.0, x);
      #endif
      vec3 shallowColor = mix(uShallows, uMuddyShallows, sediment);
      vec3 deepColor = mix(uDeep, uMuddyDeep, sediment);
      float across = vWater.y;
      float turbulence = patchNoise(vec2(along, across * 18.0));
      float warp = patchNoise(vec2(along * .85, z * 1.9));
      float ripplePhase = z * 9.4 + along * 2.35 + sin(along * 1.9 + z * 1.4) * 1.6 + warp * 3.7;
      float ripples = crest(ripplePhase, .84) * smoothstep(.48, .87, turbulence);
      float spark = patchNoise(vec2(along * 1.8, across * 27.0));
      float tidal = smoothstep(47.0, 69.0, x);
      float eddy = patchNoise(vec2(x * 0.66 - uTime * 0.34, z * 0.59));
      float poolRipple = crest(z * 3.21 + x * 0.74 - uTime * 0.97 + eddy * 3.6, 0.82) * smoothstep(0.32, 0.87, eddy);
      float alongWave = cos(along * 3.5 + z * 2.7 + eddy * 2.3);
      float crossWave = cos(along * 1.8 - z * 5.2 + turbulence);
      vec3 normal = normalize(vec3(-.065 * alongWave - .037 * crossWave, 1.0, -.046 * alongWave + .070 * crossWave));
      float facing = clamp(abs(dot(viewDirection, normal)), 0.0, 1.0);
      float reflection = .034 + .66 * pow(1.0 - facing, 4.0);
      float path = depth / max(.32, facing);
      float absorption = 1.0 - exp(-path * (.43 + tidal * .18 + sediment * 1.55));
      float foam = mix(ripples * (.075 + rapid * .43 + uRain * .17 + uRunoff * .10), poolRipple * .09, pool);
      vec3 light = normalize(vec3(-.48, .68, .37));
      float glint = pow(max(0.0, dot(reflect(-light, normal), viewDirection)), 38.0) * (.36 + .64 * spark);
      #ifdef RILL
        float shore = smoothstep(-.025, .18, vWater.x) * (1.0 - smoothstep(.90, 1.0, edge));
      #else
        float shore = smoothstep(.001, .11, vWater.x);
      #endif
      float mouth = 1.0 - smoothstep(55.0, 60.0, x);
      color = mix(mix(shallowColor, deepColor, absorption), shallowColor, reflection * .81);
      color *= .96 + .036 * alongWave + .065 * warp;
      color = mix(color, uFoam, clamp(foam + glint * .34, 0.0, 1.0));
      alpha = clamp(.065 + absorption * .81 + reflection * .64 + foam * .36 + glint * .22 + sediment * .10, 0.0, .98) * shore * mouth;
      if (!gl_FrontFacing) {
        float window = smoothstep(.62, .78, facing);
        float fade = 1.0 - smoothstep(mix(4.0, 2.0, sediment), mix(18.0, 10.0, sediment), length(viewOffset));
        color = mix(deepColor * .63, mix(shallowColor * .91, uFoam, .10 + spark * .17), window);
        color *= .95 + .047 * alongWave + .053 * crossWave;
        color += uFoam * (.032 + .095 * spark) * window * fade;
        color += shallowColor * ripples * fade * .16;
        alpha = min(.94, .77 - window * .43 + sediment * .19) * fade * shore * mouth;
      }
      vec3 seaTint = mix(uSeaShallows, uSeaDeep, smoothstep(.2, 18.0, depth));
      seaTint = mix(seaTint, mix(uMuddyDeep, uMuddyShallows, .33), uTurbidity * .40);
      color = mix(color, seaTint, smoothstep(50.0, 60.0, x) * .58);
      #ifdef RILL
        float gliding = crest(x * 9.4 - uTime * 15.0 + across * 3.6, 0.77);
        color = mix(uShallows, uFoam, 0.15 + gliding * 0.27);
        alpha = 0.94 - 0.52 * smoothstep(0.58, 1.0, edge);
      #endif
    #else
      if (vWater.x <= .001) discard;
      float wide = sin(x * 0.38 + z * 0.16 + uTime * 1.8);
      float tight = sin(x * 1.65 - z * 0.53 + uTime * (3.1 + uRain * 0.6));
      float offshore = smoothstep(4.0, 19.0, depth);
      float distant = smoothstep(73.0, 217.0, length(viewOffset));
      float waveContrast = (1.0 - offshore * 0.66) * (1.0 - distant * 0.86);
      float warp = patchNoise(vec2(x * 0.11, z * 0.13));
      float channelFlow = (1.0 - smoothstep(70.0, 88.0, x))
        * (1.0 - smoothstep(3.0, 14.0, abs(z - uRiverMouth.y)));
      float drift = mix(x * 0.95 + z * 0.41 + uTime * 2.05 + tight * 0.42 + warp * 1.37,
        (x - uEstuaryTravel) * 1.6 + z * .41 + warp * 1.37, channelFlow);
      float glint = crest(drift, 0.77) * (0.41 + warp * 0.59);
      float nearShore = (1.0 - smoothstep(0.9, 5.2, depth)) * smoothstep(-0.45, 0.35, vWater.x);
      float wash = patchNoise(vec2(z * 0.51 + uTime * 0.12, depth * 1.27));
      float breakers = crest(depth * 5.7 + sin(z * 0.57) * 1.22 + wash * 1.4 - uTime * 2.3, 0.72);
      float mouthCalm = (1.0 - smoothstep(58.0, 68.0, x))
        * (1.0 - smoothstep(3.0, 11.0, abs(z - uRiverMouth.y)));
      float beachFoam = nearShore * breakers * (0.35 + wash * 0.58) * (1.0 - mouthCalm);
      color = mix(uShallows, uDeep, smoothstep(0.2, 18.0, depth));
      color *= 0.98 + (wide * 0.085 + tight * 0.028) * waveContrast;
      color = mix(color, uFoam, beachFoam * 0.53 + rim * 0.17 + glint * 0.073 * waveContrast);
      alpha = min(1.0, max(smoothstep(90.0, 111.0, abs(z)),
        0.53 + smoothstep(1.0, 23.0, depth) * 0.43 + rim * 0.17 + beachFoam * 0.23));
      if (!gl_FrontFacing || cameraPosition.y < uSeaLevel - .13) {
        float slopeA = cos(x * .38 + z * .16 + uTime * 1.8);
        float slopeB = cos(x * .79 - z * .46 + uTime * 2.3);
        vec3 normal = normalize(vec3(-slopeA * .043 - slopeB * .052, 1.0, -slopeA * .022 + slopeB * .032));
        float incidence = max(0.0, -dot(viewDirection, normal));
        float window = smoothstep(.52, .85, incidence);
        float close = 1.0 - smoothstep(5.0, 25.0, length(viewOffset));
        vec2 swirl = vec2(x, z) + vec2(wide, tight) * .46;
        float facets = patchNoise(swirl * 1.05 + vec2(uTime * .24, -uTime * .19));
        float glitter = pow(max(0.0, (facets - .31) / .69), 3.0) * close;
        float pockets = patchNoise(swirl * .39 + vec2(-uTime * .15, uTime * .11));
        color = mix(uDeep * .76, uShallows * .84, window * (.35 + pockets * .22) * close + .12);
        color = mix(color, uFoam, window * (.045 * close + glitter * .26) + beachFoam * close * .10);
        #ifdef USE_FOG
          color = mix(fogColor, color, .52 + .48 * close);
        #endif
        // The back face fades into the water column at grazing distance rather than drawing a distant sheet edge.
        float undersideRange = 1.0 - smoothstep(14.0, 35.0, length(viewOffset));
        alpha = clamp(.84 - window * .28 + glitter * window * .09, .54, .88) * undersideRange;
      }
      float mouthDistance = x - uRiverMouth.x;
      float plumeWidth = 7.5 + max(0.0, mouthDistance) * .38;
      float outflow = .5 - .5 * uTidalFlow;
      float plume = smoothstep(-7.0, 2.0, mouthDistance) * (1.0 - smoothstep(7.0, 12.0 + outflow * 18.0, mouthDistance));
      float plumeCenter = uRiverMouth.y + sin(mouthDistance * .17 - uTime * .10) * (.35 + max(0.0, mouthDistance) * .025);
      plume *= 1.0 - smoothstep(.30, 1.0, abs(z - plumeCenter) / plumeWidth);
      plume *= (.55 + outflow * .45) * (.82 + .18 * patchNoise(vec2((x - uEstuaryTravel) * .20, z * .37)));
      float riverSediment = uTurbidity * plume;
      vec3 freshTint = mix(uRiverShallows, uRiverDeep, smoothstep(.2, 12.0, depth));
      color = mix(color, freshTint, plume * .38 * (1.0 - uTurbidity));
      color = mix(color, mix(uMuddyDeep, uMuddyShallows, .33), riverSediment * .66);
      alpha = min(1.0, alpha + riverSediment * .16);
      alpha *= 1.0 - clamp(vWater.y, 0.0, 1.0);
    #endif
    color *= 1.0 - uRain * 0.28;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function waterMaterial(isRiver, isRill = false) {
  const defines = isRiver ? { RIVER: 1 } : {};
  if (isRill) defines.RILL = 1;
  return new THREE.ShaderMaterial({
    defines,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 },
      uFlowTime: { value: 0 },
      uRain: { value: 0 },
      uRunoff: { value: 0 },
      uRiverStage: { value: 0 },
      uSeaLevel: { value: 0 },
      uEstuaryTravel: { value: 0 },
      uTidalFlow: { value: 0 },
      uTurbidity: { value: 0 },
      uShallows: { value: new THREE.Color(isRiver ? '#73b6a9' : '#67c0bc') },
      uDeep: { value: new THREE.Color(isRiver ? '#26615f' : '#196b83') },
      uSeaShallows: { value: new THREE.Color('#67c0bc') },
      uSeaDeep: { value: new THREE.Color('#196b83') },
      uRiverShallows: { value: new THREE.Color('#73b6a9') },
      uRiverDeep: { value: new THREE.Color('#26615f') },
      uMuddyShallows: { value: new THREE.Color('#a49a70') },
      uMuddyDeep: { value: new THREE.Color('#5e6247') },
      uFoam: { value: new THREE.Color('#d9f7ec') },
      uRiverMouth: { value: new THREE.Vector2(60, riverZ(60)) },
    }]),
    vertexShader: surfaceVertex,
    fragmentShader: surfaceFragment,
    fog: true,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    forceSinglePass: true,
  });
}

function addShoal(scene, river = false) {
  const random = makeRandom(river ? 5816 : 3351);
  const body = new THREE.SphereGeometry(1, 10, 6);
  const positions = body.attributes.position;
  const bodyColors = new Float32Array(positions.count * 3);
  const belly = new THREE.Color('#b4c6ba');
  const back = new THREE.Color(river ? '#505b43' : '#3a6262');
  const flank = new THREE.Color(river ? '#beb784' : '#a0beb5');
  const color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const profile = .44 + .56 * THREE.MathUtils.smoothstep(x, -.95, -.13);
    positions.setXYZ(i, x * .25, y * .061 * profile, z * .041 * profile);
    color.copy(belly).lerp(back, THREE.MathUtils.smoothstep(y, -.48, .68));
    color.lerp(flank, .43 * Math.exp(-((y - .08) ** 2) * 19)).toArray(bodyColors, i * 3);
  }
  body.setAttribute('color', new THREE.BufferAttribute(bodyColors, 3));
  body.computeVertexNormals();
  const fins = new THREE.BufferGeometry();
  fins.setAttribute('position', new THREE.Float32BufferAttribute([
    -.015, .048, 0, -.096, .104, 0, -.117, .032, 0,
    .068, -.012, .029, -.075, -.042, .077, -.035, -.035, .012,
    .068, -.012, -.029, -.035, -.035, -.012, -.075, -.042, -.077,
  ], 3));
  fins.computeVertexNormals();
  const tail = new THREE.BufferGeometry();
  tail.setAttribute('position', new THREE.Float32BufferAttribute([
    .01, .01, 0, -.116, .079, 0, -.078, 0, 0,
    .01, .01, 0, -.078, 0, 0, .01, -.012, 0,
    .01, -.012, 0, -.078, 0, 0, -.111, -.067, 0,
  ], 3));
  tail.computeVertexNormals();
  const bodyMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .61 });
  const finMaterial = new THREE.MeshStandardMaterial({ color: river ? '#8a7653' : '#5d8580', side: THREE.DoubleSide, roughness: .81 });
  const routes = [[78.8, 32.6, 5.0, 2.7, -1.32], [86.1, 27.1, 5.8, 3.6, -2.15], [92.3, 21.0, 4.1, 3.4, -3.0]];
  const riverSites = [-39, -24, -4, 18, 36, 49, 61];
  const schoolCount = river ? riverSites.length : routes.length;
  const count = river ? 42 : 39;
  const bodies = new THREE.InstancedMesh(body, bodyMaterial, count);
  const finsMesh = new THREE.InstancedMesh(fins, finMaterial, count);
  const tails = new THREE.InstancedMesh(tail, finMaterial, count);
  for (const mesh of [bodies, finsMesh, tails]) {
    mesh.name = river ? '河道鱼群' : 'Schooling coastal fish';
    mesh.frustumCulled = false;
    scene.add(mesh);
  }
  const swimmers = Array.from({ length: count }, (_, i) => ({
    habitat: river ? 'river' : 'sea',
    school: i % schoolCount,
    offset: (random() - .5) * 2.9,
    along: (random() - .5) * 3.8,
    height: (random() - .5) * .81,
    phase: random() * Math.PI * 2,
    size: .60 + random() * .64,
  }));
  const transform = new THREE.Object3D();
  const direction = new THREE.Vector2();
  const current = new THREE.Vector3();
  const goal = new THREE.Vector3();
  const candidate = new THREE.Vector3();
  const step = new THREE.Vector3();
  const previous = new THREE.Vector3();
  const tailPivot = new THREE.Vector3(-.224, 0, 0);
  const tailPosition = new THREE.Vector3();
  const away = new THREE.Vector3();
  const escape = new THREE.Vector3();
  const escapeGoal = new THREE.Vector3();
  const schoolAlarm = new Float32Array(schoolCount);

  function fitWater(point, radius) {
    if (river) {
      const center = riverZ(point.x);
      const width = riverWidth(point.x) * .70;
      point.z = THREE.MathUtils.clamp(point.z, center - width, center + width);
    }
    const floor = groundSurfaceHeight(point.x, point.z);
    const surface = waterSurfaceAt(point.x, point.z, floor);
    if (surface === null) return false;
    const low = floor + radius + .055;
    const high = surface - radius - .045;
    if (low > high) return false;
    point.y = THREE.MathUtils.clamp(point.y, low, high);
    return true;
  }

  function safe(point, radius, swimmer, collision, origin = null) {
    if (!fitWater(point, radius)) return false;
    if (collision?.cameraBlocked(point, radius)) return false;
    if (swimmer) {
      const distance = distanceToVisitor(point, swimmer);
      const before = origin ? distanceToVisitor(origin, swimmer) : 0;
      if (distance < .65 + radius && (!origin || distance < before - .00001)) return false;
    }
    return true;
  }

  const update = (time, swimmer, collision = null, dt = 1 / 30, runoff = 0) => {
    dt = THREE.MathUtils.clamp(dt, 0, .08);
    schoolAlarm.fill(0);
    for (const fish of swimmers) {
      if (fish.position && distanceToVisitor(fish.position, swimmer) < 3.2) schoolAlarm[fish.school] = .65;
    }
    swimmers.forEach((fish, i) => {
      const { school, offset, along, height, phase, size } = fish;
      const age = time * (.16 + school * .022) + school * 1.97 + along * .085;
      const weave = Math.sin(time * 1.8 + phase) * .16;
      let x, y, z;
      if (river) {
        x = riverSites[school] + Math.cos(age) * 2.8 + along * .62;
        z = riverZ(x) + offset * .34 + weave * .65;
        const floor = groundSurfaceHeight(x, z);
        const surface = riverSurfaceHeight(x);
        y = THREE.MathUtils.clamp(surface - .58 + height * .46 + Math.sin(time * .65 + phase) * .12, floor + .16, surface - .19);
        riverCurrentAt(x, z, floor, surface - y, current, runoff);
        const downriver = -Math.sin(age) * 2.8 * (.16 + school * .022);
        const bend = riverZ(x + .5) - riverZ(x - .5);
        direction.set(downriver - current.x,
          downriver * bend + Math.cos(time * 1.8 + phase) * .187 - current.z).normalize();
      } else {
        const [centerX, centerZ, radiusX, radiusZ, depth] = routes[school];
        direction.set(-Math.sin(age) * radiusX, Math.cos(age) * radiusZ).normalize();
        x = centerX + Math.cos(age) * radiusX + direction.x * along - direction.y * (offset + weave);
        z = centerZ + Math.sin(age) * radiusZ + direction.y * along + direction.x * (offset + weave);
        y = Math.max(groundSurfaceHeight(x, z) + .37, depth + height + Math.sin(time * .65 + phase) * .24);
      }
      const radius = (river ? .22 : .26) * size;
      goal.set(x, y, z);
      if (!fitWater(goal, radius)) {
        goal.z = river ? riverZ(goal.x) : goal.z;
        fitWater(goal, radius);
      }
      const threat = fish.position ?? goal;
      const distance = distanceToVisitor(threat, swimmer, away);
      const awareness = 4.4 + Math.min(1.7, (swimmer?.speed ?? 0) * .3);
      const alarm = 1 - THREE.MathUtils.smoothstep(distance, 1.0, awareness);
      fish.alarm = Math.max(0, (fish.alarm ?? 0) - dt * .22, alarm, schoolAlarm[school] * .7);
      if (fish.position && fish.alarm > .1) {
        fish.escape ??= new THREE.Vector3(Math.cos(phase), 0, Math.sin(phase));
        if (swimmer && distance < awareness + 1) fish.escape.lerp(away, 1 - Math.exp(-dt * 9)).normalize();
        const angle = Math.atan2(fish.escape.z, fish.escape.x);
        let score = -Infinity;
        for (const turn of [0, .55, -.55, 1.1, -1.1, 1.57, -1.57, Math.PI]) {
          candidate.copy(fish.position).add(escape.set(Math.cos(angle + turn), fish.escape.y * .65, Math.sin(angle + turn)).multiplyScalar(1.8));
          if (!safe(candidate, radius, swimmer, collision, fish.position)) continue;
          const gain = distanceToVisitor(candidate, swimmer) - distance;
          const value = (Number.isFinite(gain) ? gain : 0) * 3 + Math.cos(turn) * .3;
          if (value > score) { score = value; escapeGoal.copy(candidate); }
        }
        if (score > -Infinity) goal.lerp(escapeGoal, THREE.MathUtils.smoothstep(fish.alarm, .08, .65));
      }
      if (!fish.position) {
        fish.position = goal.clone();
        if (!safe(fish.position, radius, swimmer, collision)) {
          for (let attempt = 0; attempt < 32; attempt++) {
            const angle = attempt * Math.PI / 4;
            const reach = .45 + Math.floor(attempt / 8) * .4;
            candidate.copy(goal);
            candidate.x += Math.cos(angle) * reach;
            candidate.z += Math.sin(angle) * reach;
            if (!safe(candidate, radius, swimmer, collision)) continue;
            fish.position.copy(candidate);
            break;
          }
        }
      } else {
        previous.copy(fish.position);
        const localFloor = groundSurfaceHeight(fish.position.x, fish.position.z);
        const localSurface = waterSurfaceAt(fish.position.x, fish.position.z, localFloor);
        riverCurrentAt(fish.position.x, fish.position.z, localFloor, (localSurface ?? 0) - fish.position.y, current, runoff);
        fish.current ??= new THREE.Vector3();
        fish.current.copy(current);
        step.subVectors(goal, fish.position).clampLength(0, distance < 1.8 ? 4.8 : 1.05 + fish.alarm * 2.6);
        const driftWeight = .70 + .35 * THREE.MathUtils.smoothstep(fish.position.x, 45, 58);
        step.addScaledVector(current, fish.alarm > .1 ? .3 : driftWeight).clampLength(0, distance < 1.8 ? 4.8 : 3.5).multiplyScalar(dt);
        const steps = Math.max(1, Math.ceil(step.length() / .07));
        step.multiplyScalar(1 / steps);
        for (let part = 0; part < steps; part++) {
          candidate.copy(fish.position).add(step);
          if (safe(candidate, radius, swimmer, collision, fish.position)) fish.position.copy(candidate);
          else {
            candidate.copy(fish.position);
            candidate.x += -step.z;
            candidate.z += step.x;
            candidate.y += step.y;
            if (safe(candidate, radius, swimmer, collision, fish.position)) fish.position.copy(candidate);
            else {
              candidate.copy(fish.position);
              candidate.x += step.z;
              candidate.z -= step.x;
              candidate.y += step.y;
              if (safe(candidate, radius, swimmer, collision, fish.position)) fish.position.copy(candidate);
            }
          }
        }
        if (dt > 0 && previous.distanceToSquared(fish.position) > .000001) {
          const vx = (fish.position.x - previous.x) / dt - current.x;
          const vz = (fish.position.z - previous.z) / dt - current.z;
          fish.effort = Math.min(2, Math.hypot(vx, vz));
          if (Math.hypot(vx, vz) > .03) direction.set(vx, vz).normalize();
        }
      }
      const beat = Math.sin(time * (7.4 + size * 1.8 + fish.alarm * 6 + (fish.effort ?? 0) * .9) + phase);
      fish.heading ??= Math.atan2(-direction.y, direction.x);
      const turn = Math.atan2(-direction.y, direction.x) - fish.heading;
      fish.heading += Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - Math.exp(-dt * (6 + fish.alarm * 7)));
      transform.position.copy(fish.position);
      transform.rotation.set(0, fish.heading + beat * .07, Math.cos(time * .65 + phase) * .075);
      transform.scale.setScalar(size * (river ? .81 : 1));
      transform.updateMatrix();
      bodies.setMatrixAt(i, transform.matrix);
      finsMesh.setMatrixAt(i, transform.matrix);
      tailPosition.copy(tailPivot).applyMatrix4(transform.matrix);
      transform.position.copy(tailPosition);
      transform.rotation.y -= beat * (.35 + (river ? current.length() * .055 : 0));
      transform.updateMatrix();
      tails.setMatrixAt(i, transform.matrix);
    });
    bodies.instanceMatrix.needsUpdate = true;
    finsMesh.instanceMatrix.needsUpdate = true;
    tails.instanceMatrix.needsUpdate = true;
  };
  update.fish = swimmers;
  return update;
}

function addRiverLeaves(scene) {
  const random = makeRandom(17221);
  const blade = new THREE.Shape();
  blade.moveTo(-.135, 0);
  blade.quadraticCurveTo(-.025, .103, .135, .01);
  blade.quadraticCurveTo(.028, -.084, -.135, 0);
  const geometry = new THREE.ShapeGeometry(blade, 4).rotateX(-Math.PI / 2);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({
    roughness: .84, side: THREE.DoubleSide,
  }), 78);
  mesh.name = '顺流漂浮的落叶';
  mesh.frustumCulled = false;
  const leaf = new THREE.Object3D();
  const current = new THREE.Vector3();
  const tint = new THREE.Color();
  const start = -95;
  const end = 82;
  const leaves = Array.from({ length: mesh.count }, (_, i) => {
    mesh.setColorAt(i, tint.setHSL(.075 + random() * .13, .44 + random() * .23, .28 + random() * .17));
    return {
      x: THREE.MathUtils.lerp(start, end, (i + random()) / mesh.count),
      lane: (random() * 2 - 1) * .67,
      phase: random() * Math.PI * 2,
      size: .58 + random() * .73,
    };
  });
  scene.add(mesh);

  return (dt, time, runoff = 0, rain = 0) => {
    leaves.forEach((item, index) => {
      const z = riverZ(item.x) + item.lane * riverWidth(item.x);
      riverCurrentAt(item.x, z, groundSurfaceHeight(item.x, z), 0, current, runoff);
      item.x += current.x * dt;
      if (item.x >= end) {
        item.x = start;
        item.lane = (random() * 2 - 1) * .67;
      }
      const edge = THREE.MathUtils.smoothstep(item.x, start, start + 2)
        * (1 - THREE.MathUtils.smoothstep(item.x, end - 4, end));
      const drift = time * 1.4 + item.phase;
      const leafZ = riverZ(item.x) + item.lane * riverWidth(item.x) * (1 + THREE.MathUtils.smoothstep(item.x, 60, 82) * .65);
      const depth = Math.max(0, riverSurfaceHeight(item.x) - groundSurfaceHeight(item.x, leafZ));
      const calm = (1 - THREE.MathUtils.smoothstep(item.x, 58, 68)) * (1 - THREE.MathUtils.smoothstep(Math.abs(leafZ - riverZ(60)), 3, 11));
      const swell = Math.sin(item.x * .38 + leafZ * .16 + time * 1.8) * .093
        + Math.sin(item.x * .79 - leafZ * .46 + time * 2.3) * .047;
      const wave = swell * (.19 + THREE.MathUtils.smoothstep(depth, .1, 9)) * (1 + rain * .55) * (1 - calm * .85);
      leaf.position.set(item.x, riverSurfaceHeight(item.x) + .050 + Math.sin(drift) * .012
        + wave * THREE.MathUtils.smoothstep(item.x, 48, 55), leafZ);
      leaf.rotation.set(Math.cos(drift) * .09, item.phase + Math.sin(drift * .74) * .55, Math.sin(drift) * .11);
      leaf.scale.setScalar(item.size * edge);
      leaf.updateMatrix();
      mesh.setMatrixAt(index, leaf.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
}

function addRapids(scene) {
  const geometry = new THREE.DodecahedronGeometry(1, 0);
  const material = new THREE.MeshLambertMaterial({ color: '#647177', flatShading: true });
  const random = makeRandom(8143);
  const rocks = new THREE.InstancedMesh(geometry, material, 21);
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < rocks.count; i++) {
    const x = OUTLET + 7 + i * 3.14 + random() * 2.3;
    const offset = (random() - .5) * riverWidth(x) * 1.72;
    const scale = .22 + random() * .58;
    transform.position.set(x, riverLevel(x) - .15 - scale * .17, riverZ(x) + offset);
    transform.scale.set(scale * 1.45, scale * .8, scale * .96);
    transform.rotation.set(random(), random() * 6.28, random());
    transform.updateMatrix();
    rocks.setMatrixAt(i, transform.matrix);
    color.setHSL(.54, .12, .52 + random() * .35);
    rocks.setColorAt(i, color);
  }
  rocks.userData.collidable = true;
  scene.add(rocks);
}

function addRiverGravel(scene) {
  const random = makeRandom(61127);
  const gravel = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), 390);
  const pebble = new THREE.Object3D();
  const tint = new THREE.Color();
  let count = 0;
  for (let i = 0; i < gravel.count; i++) {
    const x = -92 + random() * 150;
    const z = riverZ(x) + (random() * 2 - 1) * riverWidth(x) * .92;
    const y = groundSurfaceHeight(x, z);
    const size = .065 + random() ** 2 * .16;
    if (riverSurfaceHeight(x) - y < size + .05) continue;
    pebble.position.set(x, y + size * .08, z);
    pebble.scale.set(size * 1.26, size * .53, size * (.62 + random() * .35));
    pebble.rotation.set(random() * .3, random() * 6.28, random() * .22);
    pebble.updateMatrix();
    gravel.setMatrixAt(count, pebble.matrix);
    gravel.setColorAt(count++, tint.setHSL(.11 + random() * .19, .08 + random() * .13, .25 + random() * .34));
  }
  gravel.count = count;
  gravel.name = '河床卵石';
  scene.add(gravel);
}

function addImpactRings(scene) {
  const geometry = new THREE.RingGeometry(.78, 1, 13).rotateX(-Math.PI / 2);
  const fades = new THREE.InstancedBufferAttribute(new Float32Array(IMPACT_COUNT), 1).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('aFade', fades);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uColor: { value: new THREE.Color('#dff7ec') },
    }]),
    vertexShader: /* glsl */ `
      attribute float aFade;
      varying float vFade;
      #include <fog_pars_vertex>
      void main() {
        vFade = aFade;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vFade;
      #include <fog_pars_fragment>
      void main() {
        gl_FragColor = vec4(uColor, vFade);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
  const rings = new THREE.InstancedMesh(geometry, material, IMPACT_COUNT);
  rings.count = 0;
  rings.frustumCulled = false;
  rings.renderOrder = 5;
  rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(rings);
  const impacts = Array.from({ length: IMPACT_COUNT }, () => ({ age: 1 }));
  let cursor = 0;
  const transform = new THREE.Object3D();
  return {
    add(x, y, z, water) {
      const impact = impacts[cursor];
      impact.x = x;
      impact.y = y;
      impact.z = z;
      impact.age = 0;
      impact.water = water;
      cursor = (cursor + 1) % IMPACT_COUNT;
    },
    update(dt, rain) {
      let visible = 0;
      for (const impact of impacts) {
        impact.age += dt;
        const lifetime = impact.water ? .55 : .23;
        if (impact.age >= lifetime) continue;
        const age = impact.age / lifetime;
        const size = impact.water ? .095 + age * .52 : .038 + age * .17;
        transform.position.set(impact.x, impact.y + .035, impact.z);
        transform.scale.setScalar(size);
        transform.updateMatrix();
        rings.setMatrixAt(visible, transform.matrix);
        fades.setX(visible++, (1 - age) ** 2 * (.27 + rain * .34));
      }
      rings.count = visible;
      rings.instanceMatrix.needsUpdate = true;
      fades.needsUpdate = true;
    },
  };
}

function makeCollisionSampler() {
  const step = 2;
  const minX = -132;
  const minZ = -94;
  const cols = 145;
  const rows = 96;
  const heights = new Float32Array(cols * rows);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      heights[i * rows + j] = groundHeight(minX + i * step, minZ + j * step);
    }
  }
  return (x, z, surface) => {
    const u = THREE.MathUtils.clamp((x - minX) / step, 0, cols - 1.001);
    const v = THREE.MathUtils.clamp((z - minZ) / step, 0, rows - 1.001);
    const i = Math.floor(u);
    const j = Math.floor(v);
    const left = i * rows + j;
    const right = left + rows;
    const west = THREE.MathUtils.lerp(heights[left], heights[left + 1], v - j);
    const east = THREE.MathUtils.lerp(heights[right], heights[right + 1], v - j);
    let floor = THREE.MathUtils.lerp(west, east, u - i);
    const coast = coastlineX(z);
    let water = x >= coast + .25 ? seaSurfaceHeight() : -Infinity;
    if (x > 48 && x >= coast - 3 && x < coast + .25) {
      floor = groundSurfaceHeight(x, z);
      water = waterSurfaceAt(x, z, floor) ?? -Infinity;
    }
    if (x >= SOURCE && x <= MOUTH) {
      const [lower, upper] = baseRiverSpan(x);
      if (z >= lower - 9 && z <= upper + 9) {
        floor = groundSurfaceHeight(x, z);
        water = waterSurfaceAt(x, z, floor) ?? -Infinity;
      }
    }
    surface.y = Math.max(floor, water);
    surface.water = water >= floor;
  };
}

function addRain(scene) {
  const positions = new Float32Array(RAIN_COUNT * 6);
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', position);
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({ color: '#c2d9e8', transparent: true, depthWrite: false, opacity: 0 });
  const rainLines = new THREE.LineSegments(geometry, material);
  rainLines.frustumCulled = false;
  rainLines.renderOrder = 6;
  rainLines.visible = false;
  scene.add(rainLines);
  const random = makeRandom(328477);
  const drops = Array.from({ length: RAIN_COUNT }, () => ({ active: false }));
  const forward = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const previous = new THREE.Vector3();
  const sampler = makeCollisionSampler();
  const impact = addImpactRings(scene);
  const surface = { y: 0, water: false };

  function sampleSurface(x, z, weather) {
    sampler(x, z, surface);
    const puddle = weather?.puddleSurfaceAt?.(x, z);
    if (Number.isFinite(puddle) && puddle > surface.y) {
      surface.y = puddle;
      surface.water = true;
    }
    for (const roof of weather?.shelters ?? []) {
      const height = roof.heightAt?.(x, z) ?? roof.height;
      if (x >= roof.minX && x <= roof.maxX && z >= roof.minZ && z <= roof.maxZ && height > surface.y) {
        surface.y = height;
        surface.water = false;
      }
    }
  }

  function respawn(drop, spread, weather) {
    const angle = random() * 6.283;
    const radius = Math.sqrt(random()) * 55;
    drop.x = focus.x + Math.cos(angle) * radius;
    drop.z = focus.z + Math.sin(angle) * radius;
    sampleSurface(drop.x, drop.z, weather);
    drop.y = surface.y + (spread ? 1 + random() * 48 : 49 + random() * 19);
    drop.fall = 18 + random() * 17;
    drop.terminal = 32 + random() * 17;
    drop.active = true;
  }

  return (dt, time, rain, camera, weather) => {
    impact.update(dt, rain);
    const count = Math.floor(rain * RAIN_COUNT);
    if (!count) {
      if (rainLines.visible) {
        rainLines.visible = false;
        for (const drop of drops) drop.active = false;
      }
      return;
    }
    rainLines.visible = true;
    geometry.setDrawRange(0, count * 2);

    camera.getWorldDirection(forward);
    const distance = forward.y < -.11 ? (camera.position.y - 9) / -forward.y : 22;
    focus.copy(camera.position).addScaledVector(forward, THREE.MathUtils.clamp(distance, 0, 165));
    focus.x = THREE.MathUtils.clamp(focus.x, -111, 114);
    focus.z = THREE.MathUtils.clamp(focus.z, -73, 73);
    const moved = focus.distanceToSquared(previous) > 43 ** 2;
    previous.copy(focus);
    material.opacity = .17 + rain * .36;
    const windStrength = THREE.MathUtils.clamp(weather?.wind ?? .35, 0, 1) / .35;
    const windX = (2.7 + rain * 3.2 + Math.sin(time * .9) * 1.4) * windStrength;
    const windZ = (-1.9 + Math.sin(time * .71) * 1.2) * windStrength;
    for (let i = 0; i < count; i++) {
      const drop = drops[i];
      if (!drop.active || moved || Math.abs(drop.x - focus.x) > 72 || Math.abs(drop.z - focus.z) > 72) respawn(drop, true, weather);
      drop.fall = Math.min(drop.terminal, drop.fall + dt * 26);
      drop.x += windX * dt;
      drop.z += windZ * dt;
      drop.y -= drop.fall * dt;
      sampleSurface(drop.x, drop.z, weather);
      if (drop.y <= surface.y) {
        impact.add(drop.x, surface.y, drop.z, surface.water);
        respawn(drop, false, weather);
      }
      const length = drop.fall * .022;
      const offset = i * 6;
      positions[offset] = drop.x;
      positions[offset + 1] = drop.y;
      positions[offset + 2] = drop.z;
      positions[offset + 3] = drop.x - windX * .022;
      positions[offset + 4] = drop.y + length;
      positions[offset + 5] = drop.z - windZ * .022;
    }
    position.needsUpdate = true;
  };
}

export function createWater(scene) {
  const river = new THREE.Mesh(riverGeometry(scene), waterMaterial(true));
  river.name = 'Continuous river surface';
  river.renderOrder = 4;
  river.frustumCulled = false;
  const rillMaterial = waterMaterial(true, true);
  const rills = meltRills.map(({ path, width }) => {
    const rill = new THREE.Mesh(meltRillGeometry(path, width), rillMaterial);
    rill.name = '冰缘汇入融水塘的细流';
    rill.renderOrder = 3.5;
    return rill;
  });
  const ocean = new THREE.Mesh(oceanGeometry(), waterMaterial(false));
  ocean.name = 'Littoral water and ocean';
  ocean.renderOrder = 3;
  scene.add(river, ocean, ...rills);
  addIce(scene);
  addRapids(scene);
  addRiverGravel(scene);
  const updateShoal = addShoal(scene);
  const updateRiverFish = addShoal(scene, true);
  const updateLeaves = addRiverLeaves(scene);
  const updateRain = addRain(scene);
  const materials = [river.material, ocean.material, rillMaterial];
  let flowTime = 0;
  let estuaryTravel = 0;
  const estuaryCurrent = new THREE.Vector3();

  return {
    fish: [...updateShoal.fish, ...updateRiverFish.fish],
    headwaterLines: [
      ...meltRills.map(({ path }) => path),
      [meltRills[1].path.at(-1), [-106.5, -25.1], [-104.2, -24.35], [-101.1, -22.62], [OUTLET, riverZ(OUTLET)]],
    ],
    update(dt, time, rain, camera, swimmer = null, collision = null, weather = null) {
      dt = THREE.MathUtils.clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
      const runoff = THREE.MathUtils.clamp(weather?.runoff ?? rain, 0, 1);
      const turbidity = THREE.MathUtils.clamp(weather?.turbidity ?? rain, 0, 1);
      flowTime += dt * (weather?.flowMultiplier ?? (1 + .72 * runoff));
      riverCurrentAt(60, riverZ(60), groundSurfaceHeight(60, riverZ(60)), 0, estuaryCurrent, runoff);
      estuaryTravel += dt * estuaryCurrent.x;
      for (const material of materials) {
        material.uniforms.uTime.value = time;
        material.uniforms.uFlowTime.value = flowTime;
        material.uniforms.uRain.value = rain;
        material.uniforms.uRunoff.value = runoff;
        material.uniforms.uRiverStage.value = getRiverFloodStage();
        material.uniforms.uSeaLevel.value = seaSurfaceHeight();
        material.uniforms.uEstuaryTravel.value = estuaryTravel;
        material.uniforms.uTidalFlow.value = getTideState().flow;
        material.uniforms.uTurbidity.value = turbidity;
      }
      updateShoal(time, swimmer, collision, dt);
      updateRiverFish(time, swimmer, collision, dt, runoff);
      updateLeaves(dt, time, runoff, rain);
      updateRain(dt, time, rain, camera, weather);
    },
  };
}
