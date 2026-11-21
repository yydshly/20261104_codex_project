import * as THREE from 'three';
import { seaSurfaceHeight, tidalRiseAt, tidalFlowAt, TIDE_AMPLITUDE } from './world-tides.js';
import { applyLocalFlow } from './world-flow.js';

export const RIVER_SOURCE = -110;
export const RIVER_OUTLET = -99;
export const RIVER_MOUTH = 69;

const riverStations = [
  [RIVER_OUTLET, -22, 30, 1.35],
  [-84, -18, 22.6, 1.45],
  [-64, -6, 14.5, 1.8],
  [-46, 6, 9, 2.1],
  [-30, 9, 5.8, 2.4],
  [0, -5, 2.7, 2.9],
  [36, 12, 1, 4.1],
  [60, 9, 0.18, 5.8],
  [RIVER_MOUTH, 8, 0, 7],
];

const mountains = [
  [-122, -66, 47, 24, 29],
  [-99, -55, 44, 22, 22],
  [-83, -35, 33, 22, 26],
  [-126, -21, 32, 21, 25],
  [-116, 14, 44, 25, 25],
  [-102, 45, 51, 29, 26],
  [-78, 29, 32, 22, 22],
  [-65, -40, 31, 23, 29],
  [-59, 29, 22, 19, 22],
  [-48, 61, 15, 24, 28],
  [-38, -46, 14, 23, 28],
  [-12, -37, 7, 22, 23],
  [12, 33, 2.5, 22, 31],
  [34, -31, 3.2, 18, 23],
];

export const rainBasins = [
  { x: -12.307, z: 10.358, radiusX: 2.0, radiusZ: 1.65, depth: .09 },
  { x: -8.52, z: 9.417, radiusX: 1.7, radiusZ: 1.7, depth: .085 },
  { x: 4.733, z: 7.533, radiusX: 1.9, radiusZ: 1.7, depth: .09 },
  { x: 4.733, z: 13.183, radiusX: 1.7, radiusZ: 1.7, depth: .09 },
  { x: 16.093, z: -15.067, radiusX: 1.7, radiusZ: 1.7, depth: .085 },
  { x: -13.253, z: 36.725, radiusX: 1.7, radiusZ: 1.7, depth: .08 },
  { x: 40.707, z: 24.483, radiusX: 1.8, radiusZ: 1.3, depth: .09 },
  { x: 52.067, z: -3.767, radiusX: 1.8, radiusZ: 1.65, depth: .085 },
  { x: 50.173, z: -6.592, radiusX: 1.65, radiusZ: 1.6, depth: .085 },
];

function rainBasinHeight(x, z, height) {
  let floor = height;
  for (const basin of rainBasins) {
    if (Math.abs(x - basin.x) >= basin.radiusX || Math.abs(z - basin.z) >= basin.radiusZ) continue;
    const radius = ((x - basin.x) / basin.radiusX) ** 2 + ((z - basin.z) / basin.radiusZ) ** 2;
    if (radius < 1) floor -= basin.depth * (1 - radius) ** 2;
  }
  return floor;
}

function smoothstep(start, end, value) {
  const p = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
  return p * p * (3 - 2 * p);
}

function stationSlope(i, column) {
  if (i === 0) return (riverStations[1][column] - riverStations[0][column]) / 15;
  const station = riverStations[i];
  const before = riverStations[i - 1];
  const after = riverStations[i + 1];
  const left = (station[column] - before[column]) / (station[0] - before[0]);
  if (!after) return left;
  const right = (after[column] - station[column]) / (after[0] - station[0]);
  return left * right > 0 ? 2 * left * right / (left + right) : 0;
}

const slopes = riverStations.map((_, i) => [0, 1, 2, 3].map((column) => stationSlope(i, column)));

function riverValue(x, column) {
  if (x <= riverStations[0][0]) return riverStations[0][column];
  const last = riverStations.length - 1;
  if (x >= riverStations[last][0]) return riverStations[last][column];
  let i = 0;
  while (x > riverStations[i + 1][0]) i++;
  const start = riverStations[i];
  const end = riverStations[i + 1];
  const length = end[0] - start[0];
  const p = (x - start[0]) / length;
  const p2 = p * p;
  const p3 = p2 * p;
  return (2 * p3 - 3 * p2 + 1) * start[column]
    + (p3 - 2 * p2 + p) * slopes[i][column] * length
    + (-2 * p3 + 3 * p2) * end[column]
    + (p3 - p2) * slopes[i + 1][column] * length;
}

export const riverZ = (x) => riverValue(x, 1);
export const riverLevel = (x) => riverValue(x, 2);
export const riverWidth = (x) => riverValue(x, 3);
// The tidal reach meets sea level before the open bay; the bed stays fixed.
export const baseRiverSurfaceHeight = (x) => (riverLevel(x) + .035) * (1 - smoothstep(48, 55, x));
let riverFloodStage = 0;

export function setRiverFloodStage(stage) {
  riverFloodStage = THREE.MathUtils.clamp(Number.isFinite(stage) ? stage : 0, 0, 1);
}

export const getRiverFloodStage = () => riverFloodStage;

// The meltwater pool remains at its outlet, while the river mouth is tied to the sea.
export function riverFloodRiseAt(x, stage = riverFloodStage) {
  return 1.25 * smoothstep(-96, -74, x) * (1 - smoothstep(0, 55, x))
    * THREE.MathUtils.clamp(Number.isFinite(stage) ? stage : 0, 0, 1);
}

export const riverSurfaceHeight = (x, stage = riverFloodStage, seaLevel = seaSurfaceHeight()) =>
  baseRiverSurfaceHeight(x) + riverFloodRiseAt(x, stage) + tidalRiseAt(x, seaLevel);

export function baseRiverSpan(x) {
  const center = riverZ(x);
  const width = riverWidth(x);
  if (x >= RIVER_OUTLET) return [center - width, center + width];
  const basin = 1 - smoothstep(-104, RIVER_OUTLET, x);
  const shore = basin * (.15 + .09 * Math.sin(x * 1.27));
  return [center - width - basin * 10.1, center + width - shore];
}

const floodSectionStep = (284 / 300) / 4;
const floodReach = 9;
const floodSections = new Map();

function floodEnvelope(x) {
  const [lower, upper] = baseRiverSpan(x);
  return x > -96 && x < RIVER_MOUTH ? [lower - floodReach, upper + floodReach] : [lower, upper];
}

// Every cross-section samples the breakpoints of the actual triangulated ground.
// Prefix maxima remember levees: a low hollow behind a higher bank stays dry.
function floodSection(index) {
  if (floodSections.has(index)) return floodSections.get(index);
  const x = THREE.MathUtils.clamp(RIVER_SOURCE + index * floodSectionStep, RIVER_SOURCE, RIVER_MOUTH);
  const center = riverZ(x);
  const envelope = floodEnvelope(x);
  // Neighbouring x-sections have slightly different envelopes. Margin samples
  // keep interpolation finite even on a moving envelope's very last triangle.
  const lower = envelope[0] - 2;
  const upper = envelope[1] + 2;
  const stepX = 284 / 300;
  const stepZ = 226 / 240;
  const u = (x + 142) / stepX - Math.floor((x + 142) / stepX);
  const points = [lower, center, upper];
  for (let i = Math.floor((lower + 113) / stepZ); i <= Math.ceil((upper + 113) / stepZ); i++) {
    const z = -113 + i * stepZ;
    if (z > lower && z < upper) points.push(z);
    const diagonal = z + (1 - u) * stepZ;
    if (diagonal > lower && diagonal < upper) points.push(diagonal);
  }
  points.sort((a, b) => a - b);
  const middle = points.indexOf(center);
  const base = baseRiverSurfaceHeight(x);
  const heights = points.map((z) => groundSurfaceHeight(x, z) - base);
  for (let i = middle - 1; i >= 0; i--) heights[i] = Math.max(heights[i], heights[i + 1]);
  for (let i = middle + 1; i < heights.length; i++) heights[i] = Math.max(heights[i], heights[i - 1]);
  const section = { x, center, points, heights };
  floodSections.set(index, section);
  return section;
}

function sectionBarrier(section, z) {
  const points = section.points;
  if (z < points[0] || z > points.at(-1)) return 1e4;
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (points[middle] < z) low = middle;
    else high = middle;
  }
  const t = (z - points[low]) / Math.max(.000001, points[high] - points[low]);
  return THREE.MathUtils.lerp(section.heights[low], section.heights[high], t);
}

export function riverBarrierHeightAt(x, z) {
  if (x < RIVER_SOURCE || x > RIVER_MOUTH) return 1e4;
  const p = (x - RIVER_SOURCE) / floodSectionStep;
  const i = Math.floor(p);
  const before = floodSection(i);
  const after = floodSection(i + 1);
  // Relative heights remove the river's longitudinal slope before interpolation.
  return baseRiverSurfaceHeight(x) + THREE.MathUtils.lerp(sectionBarrier(before, z), sectionBarrier(after, z), p - i);
}

export function riverSpan(x, stage = riverFloodStage, seaLevel = seaSurfaceHeight()) {
  if (x <= -96 || x >= RIVER_MOUTH) return baseRiverSpan(x);
  const center = riverZ(x);
  const [lower, upper] = floodEnvelope(x);
  const level = riverSurfaceHeight(x, stage, seaLevel);
  function shore(outer) {
    let wet = center;
    let dry = outer;
    for (let i = 0; i < 15; i++) {
      const middle = (wet + dry) / 2;
      if (riverBarrierHeightAt(x, middle) < level - .001) wet = middle;
      else dry = middle;
    }
    return wet;
  }
  return [shore(lower), shore(upper)];
}

export const maximumRiverSpan = (x) => riverSpan(x, 1, TIDE_AMPLITUDE);

export function coastlineX(z) {
  return 61 + 3.7 * Math.sin(z * .071) + 1.7 * Math.sin(z * .148 + 1.5) - 3 * Math.exp(-(((z - 8) / 10) ** 2));
}

export function waterSurfaceAt(x, z, floor, stage = riverFloodStage, level = seaSurfaceHeight()) {
  const coast = coastlineX(z);
  let sea = x >= 48 && x >= coast - 3 && floor < level - .001 ? level : null;
  if (sea !== null && x < coast + .25) {
    // Do not flood a disconnected hollow behind a beach ridge.
    for (let px = x; px < coast + .25; px += .30) {
      if (groundSurfaceHeight(px, z) >= level - .001) { sea = null; break; }
    }
  }
  if (x < RIVER_SOURCE || x > RIVER_MOUTH) return sea;
  const [lower, upper] = floodEnvelope(x);
  if (z < lower || z > upper) return sea;
  const surface = riverSurfaceHeight(x, stage, level);
  if (surface - floor <= .001 || (x > -96 && x < RIVER_MOUTH && riverBarrierHeightAt(x, z) >= surface - .001)) return sea;
  return Math.max(sea ?? -Infinity, surface);
}

export function riverCurrentAt(x, z, floor, submersion, target, runoff = 0) {
  if (x <= RIVER_OUTLET - 4 || x >= 88) return target.set(0, 0, 0);
  const surface = waterSurfaceAt(x, z, floor);
  const depth = (surface ?? -Infinity) - floor;
  if (surface === null) return target.set(0, 0, 0);
  const center = riverZ(x);
  // The main current broadens with depth; the outer inundated shallows stay
  // quiet. Avoid a shoreline binary search for each fish or suspended speck.
  const across = (z - center) / (riverWidth(x) + riverFloodRiseAt(x) * 1.6 + Math.max(0, x - 60) * .45);
  if (depth <= 0 || Math.abs(across) >= 1) return target.set(0, 0, 0);

  const grade = riverSurfaceHeight(x - .5) - riverSurfaceHeight(x + .5);
  const channel = 1 - smoothstep(.20, 1, Math.abs(across));
  const nearBed = smoothstep(.28, 1, submersion / depth);
  const outlet = smoothstep(RIVER_OUTLET - 4, RIVER_OUTLET + 2, x);
  const estuary = 1 - smoothstep(50, 80, x);
  const discharge = (1.02 + .94 * smoothstep(.07, .51, grade)) * outlet * estuary
    * (1 + .72 * THREE.MathUtils.clamp(runoff, 0, 1));
  const speed = (discharge - 1.45 * tidalFlowAt(x)) * channel
    * smoothstep(.04, .52, depth) * (1 - .42 * nearBed);
  const bend = riverZ(x + .5) - riverZ(x - .5) + across * (riverWidth(x + .5) - riverWidth(x - .5));
  const along = speed / Math.hypot(1, bend);
  return applyLocalFlow(x, z, surface, submersion, target.set(along, 0, bend * along));
}

const tidepoolX = coastlineX(33) - 3.5;

function ridges(x, z) {
  let power = 0;
  for (const [cx, cz, summit, wx, wz] of mountains) {
    const dx = (x - cx) / wx;
    const dz = (z - cz) / wz;
    const distance2 = dx * dx + dz * dz;
    if (distance2 > 12) continue;
    const peak = summit * (.69 * Math.exp(-distance2 * 1.28) + .31 * Math.max(1 - .83 * Math.sqrt(distance2), 0) ** 1.24);
    power += peak * peak;
  }
  return Math.sqrt(power);
}

function landElevation(x, z) {
  const inland = coastlineX(z) - x;
  if (inland <= 0) {
    const bottom = Math.max(inland * .32, -23);
    const bars = Math.sin(z * .15 + x * .29) * Math.sin(x * .23 - z * .14) * 1.2;
    return bottom + bars * smoothstep(0, 24, -inland);
  }
  const mass = ridges(x, z);
  const rolling = .56 * Math.sin(x * .121 + z * .064) + .42 * Math.cos(z * .163 - x * .067);
  const largeRidges = Math.sin(x * .33 - z * .18) * Math.sin(z * .27 + x * .13);
  const rockTexture = Math.sin(x * .83 + z * .49) * Math.cos(z * .72 - x * .26);
  const hillside = (2.8 * largeRidges + .96 * rockTexture) * smoothstep(7, 44, mass);
  const watershed = (9.5 * Math.exp(-(((x + 96) / 24) ** 2)) + 3.2 * Math.exp(-(((x + 68) / 17) ** 2)))
    * Math.exp(-(((z + 8) / 33) ** 2));
  const bank = .34 * Math.exp(-(((x - 48) / 15) ** 2) - (((z - 3) / 12) ** 2));
  const elevation = (.085 * inland + mass + rolling + hillside + watershed + bank) * smoothstep(0, 7, inland);
  const height = Math.max(elevation, .025 * Math.min(inland, 1));
  if (Math.abs(x - tidepoolX) > 3.2 || Math.abs(z - 33) > 2.5) return rainBasinHeight(x, z, height);
  const poolRadius = Math.hypot((x - tidepoolX) / 2.8, (z - 33) / 2.16);
  return THREE.MathUtils.lerp(Math.min(.035, height), height, smoothstep(.71, 1.12, poolRadius));
}

export function groundHeight(x, z) {
  const land = landElevation(x, z);
  if (x <= -105 || x >= 78) return land;
  const center = riverZ(x);
  const width = riverWidth(x);
  const distance = Math.abs(z - center);
  const bankSpan = 3.1 + width * .67 + smoothstep(28, 90, -x) * 3.9;
  if (distance >= width + bankSpan) return land;
  const water = riverLevel(x);
  const depth = .51 + width * .18;
  const crossSection = smoothstep(.28, 1.1, distance / width);
  const poolDepth = .72 * smoothstep(-50, -27, x) * (1 - smoothstep(14, 39, x));
  const bankLift = depth * .43 * smoothstep(RIVER_OUTLET, -94, x) * smoothstep(.70, 1.06, distance / width);
  const bed = water - depth * (1 - .68 * crossSection) - poolDepth * (1 - crossSection) + bankLift;
  const edge = smoothstep(width * 1.015, width + bankSpan, distance);
  const carved = THREE.MathUtils.lerp(bed, land, edge);
  const active = smoothstep(-105, -99, x) * (1 - smoothstep(69, 78, x));
  return THREE.MathUtils.lerp(land, carved, active);
}

const surfaceColors = {
  deep: new THREE.Color('#244947'),
  shallow: new THREE.Color('#7b9b84'),
  sand: new THREE.Color('#cab993'),
  shore: new THREE.Color('#aaa377'),
  grass: new THREE.Color('#637844'),
  sunnyGrass: new THREE.Color('#91a15b'),
  forest: new THREE.Color('#476547'),
  stone: new THREE.Color('#777871'),
  shadowStone: new THREE.Color('#505c5b'),
  ice: new THREE.Color('#c1d9d7'),
  glacier: new THREE.Color('#a0ccd2'),
  snow: new THREE.Color('#eff0e7'),
  streambed: new THREE.Color('#8d8a68'),
  pasture: new THREE.Color('#adab66'),
  pastureShade: new THREE.Color('#737b46'),
  humidFloor: new THREE.Color('#556b42'),
  humidSoil: new THREE.Color('#826b4f'),
};

const horizonSegments = 19;
const coreXSegments = 300;
const coreZSegments = 240;
const coreXRadius = 142;
const coreZRadius = 113;

export function groundSurfaceHeight(x, z) {
  if (Math.abs(x) >= coreXRadius || Math.abs(z) >= coreZRadius) return groundHeight(x, z);
  const stepX = 2 * coreXRadius / coreXSegments;
  const stepZ = 2 * coreZRadius / coreZSegments;
  const ix = Math.floor((x + coreXRadius) / stepX);
  const iz = Math.floor((z + coreZRadius) / stepZ);
  const left = -coreXRadius + ix * stepX;
  const near = -coreZRadius + iz * stepZ;
  const u = (x - left) / stepX;
  const v = (z - near) / stepZ;
  const right = left + stepX;
  const far = near + stepZ;
  const upperLeft = groundHeight(left, far);
  const lowerRight = groundHeight(right, near);
  if (u + v <= 1) return (1 - u - v) * groundHeight(left, near) + u * lowerRight + v * upperLeft;
  return (u + v - 1) * groundHeight(right, far) + (1 - u) * upperLeft + (1 - v) * lowerRight;
}

function axisCoordinate(i, coreSegments, coreRadius, nearExtent, farExtent) {
  const coreIndex = i - horizonSegments;
  if (coreIndex >= 0 && coreIndex <= coreSegments) return (2 * coreIndex / coreSegments - 1) * coreRadius;
  const outerIndex = coreIndex < 0 ? -coreIndex : coreIndex - coreSegments;
  const p = outerIndex / horizonSegments;
  const reach = .06 * p + .94 * p * p;
  return coreIndex < 0 ? -coreRadius - (nearExtent - coreRadius) * reach : coreRadius + (farExtent - coreRadius) * reach;
}

function addRiverBedLight(material, clock, cloud) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRiverTime = clock;
    shader.uniforms.uRiverCloud = cloud;
    shader.uniforms.uTidalLevel = { get value() { return seaSurfaceHeight(); } };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aRiverDepth;
        varying vec2 vRiverBed;
        varying float vRiverDepth;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vRiverBed = position.xz;
        vRiverDepth = aRiverDepth;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uRiverTime;
        uniform float uRiverCloud;
        uniform float uTidalLevel;
        varying vec2 vRiverBed;
        varying float vRiverDepth;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float wetDepth = vRiverDepth + uTidalLevel * smoothstep(36.0, 55.0, vRiverBed.x);
        if (vRiverDepth > .0 && wetDepth > .012) {
          vec2 p = vRiverBed;
          float time = uRiverTime;
          float nearby = 1.0 - smoothstep(10.0, 32.0, length(cameraPosition.xz - p));
          float sand = sin(p.x * 8.3 + p.y * 3.7 + sin(p.y * 3.0) * 1.7);
          float a = sin(p.x * 3.2 + p.y * 1.9 + sin(p.y * 2.8 - time * 1.18) * 1.1 - time * 2.1);
          float b = sin(p.y * 4.1 - p.x * 1.8 + sin(p.x * 1.6 - time * .89) * 1.3 + time * .91);
          float glimmer = pow(1.0 - min(abs(a), abs(b)), 13.0) * (.38 + .31 * abs(a - b));
          float wet = smoothstep(.03, .32, wetDepth);
          float light = wet * nearby * exp(-wetDepth * .46) * (1.0 - .8 * uRiverCloud);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.22, .208, .143), wet * .57);
          diffuseColor.rgb *= 1.0 + sand * light * .12;
          diffuseColor.rgb += vec3(.16, .19, .13) * glimmer * light;
        }`);
  };
}

function meshSurface(riverClock, cloud) {
  const columns = coreXSegments + 2 * horizonSegments + 1;
  const geometry = new THREE.PlaneGeometry(1, 1, columns - 1, coreZSegments + 2 * horizonSegments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  const xCoordinates = Array.from({ length: columns }, (_, i) => axisCoordinate(i, coreXSegments, coreXRadius, 490, 460));
  for (let i = 0; i < position.count; i++) {
    const x = xCoordinates[i % columns];
    const z = axisCoordinate(Math.floor(i / columns), coreZSegments, coreZRadius, 400, 400);
    position.setXYZ(i, x, groundHeight(x, z), z);
  }
  geometry.computeVertexNormals();
  const normal = geometry.getAttribute('normal');
  const color = new THREE.Color();
  const colors = new Float32Array(position.count * 3);
  const riverDepths = new Float32Array(position.count);
  const palette = surfaceColors;
  const drySections = Array.from({ length: columns }, (_, i) => {
    const x = position.getX(i);
    return x >= RIVER_SOURCE && x <= RIVER_MOUTH ? { span: riverSpan(x, 0, 0), level: baseRiverSurfaceHeight(x) } : null;
  });
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const dry = drySections[i % columns];
    if (dry) {
      const [lower, upper] = dry.span;
      if (z >= lower && z <= upper) riverDepths[i] = Math.max(0, dry.level - y);
    }
    const distance = coastlineX(z) - x;
    const patches = .5 + .25 * Math.sin(x * .29 + z * .101) + .25 * Math.cos(z * .217 - x * .088);
    const slope = 1 - normal.getY(i);
    if (y < 0) {
      color.copy(palette.deep).lerp(palette.shallow, smoothstep(-15, -.3, y));
      color.lerp(palette.sand, smoothstep(-3.2, .1, y) * .66);
    } else {
      color.copy(palette.forest).lerp(palette.grass, smoothstep(-64, 22, x));
      color.lerp(palette.sunnyGrass, patches * (1 - smoothstep(11, 30, y)) * .82);
      color.lerp(palette.shore, (1 - smoothstep(1, 15, distance)) * .86);
      color.lerp(palette.sand, (1 - smoothstep(1.2, 7.5, distance)) * .93);
      const rock = Math.max(smoothstep(.12, .55, slope), smoothstep(20, 37, y) * .72);
      color.lerp(patches > .45 ? palette.stone : palette.shadowStone, rock);
      const snow = smoothstep(24.6 + patches * 7.8, 38.8 + patches * 7.8, y) * (1 - smoothstep(.20, .69, slope) * .87);
      color.lerp(palette.ice, snow * .82).lerp(palette.snow, snow * snow);
      if (x > -100 && x < 69) {
        const channel = Math.abs(z - riverZ(x)) / riverWidth(x);
        if (channel < 1.12) color.lerp(palette.streambed, (1 - smoothstep(.54, 1.12, channel)) * .69);
      }
      if (x > -122 && x < -96 && Math.abs(z + 22) < 8) {
        const center = -22 + (x + 99) * .15;
        const edge = Math.hypot((x + 108) / 12.6, (z - center) / 4.8);
        const tongue = (1 - smoothstep(.43 + patches * .17, 1, edge)) * (1 - smoothstep(-100, -96, x));
        color.lerp(palette.glacier, tongue * .92);
        color.lerp(palette.snow, tongue * (1 - smoothstep(-107, -100, x)) * .58);
      }
      if (x > -113 && x < -80 && z > -26 && z < 1) {
        const snowfield = 1 - smoothstep(.48 + patches * .16, 1, Math.hypot((x + 97) / 16, (z + 13) / 13.7));
        const drift = .85 + Math.sin(z * .76 + x * .42) * .15;
        color.lerp(palette.ice, snowfield * .83);
        color.lerp(palette.snow, snowfield * drift * (1 - smoothstep(.22, .75, slope) * .55));
      }
      if (x > -18 && x < 21 && z > 30 && z < 65) {
        const pasture = 1 - smoothstep(.57 + patches * .10, 1, Math.hypot((x - 1.5) / 19, (z - 46) / 17));
        color.lerp(palette.pastureShade, pasture * .57);
        color.lerp(palette.pasture, pasture * (.49 + patches * .38));
      }
      if (x > 19 && x < 61 && z > 32 && z < 70) {
        const grove = 1 - smoothstep(.53 + patches * .18, 1, Math.hypot((x - 39) / 20, (z - 50) / 18));
        color.lerp(palette.humidFloor, grove * .76);
        color.lerp(palette.humidSoil, grove * .56 * (1 - patches));
      }
    }
    const fine = Math.sin(x * .95 + z * .61) * Math.cos(x * .48 - z * .84);
    const strata = Math.sin(y * .67 + x * .21 + z * .16) * smoothstep(.13, .57, slope) * .085;
    color.multiplyScalar(1 + fine * .038 + strata);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aRiverDepth', new THREE.BufferAttribute(riverDepths, 1));
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  addRiverBedLight(material, riverClock, cloud);
  const terrain = new THREE.Mesh(geometry, material);
  terrain.name = '连续地形 · 冰岭、河谷、草甸与滩涂';
  terrain.userData.rainWettable = 'ground';
  terrain.receiveShadow = true;
  return terrain;
}

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function instances(name, geometry, specs, collidable = false) {
  const material = new THREE.MeshStandardMaterial({ roughness: .94, flatShading: true });
  const mesh = new THREE.InstancedMesh(geometry, material, specs.length);
  mesh.name = name;
  mesh.userData.collidable = collidable;
  mesh.userData.rainWettable = name === '山岩与河滩碎石' ? 'stone' : name === '树干' ? 'wood' : 'leaf';
  mesh.receiveShadow = true;
  const transform = new THREE.Object3D();
  const tint = new THREE.Color();
  specs.forEach(({ x, y, z, sx, sy, sz, yaw, color, shade = 1 }, i) => {
    transform.position.set(x, y, z);
    transform.rotation.y = yaw;
    transform.scale.set(sx, sy, sz);
    transform.updateMatrix();
    mesh.setMatrixAt(i, transform.matrix);
    mesh.setColorAt(i, tint.set(color).multiplyScalar(shade));
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

function ecologyClearing(x, z) {
  const shore = coastlineX(z) - x;
  return (x > -6 && x < 24 && z > 12 && z < 31)
    || (z > 26 && z < 40 && shore > -2 && shore < 9);
}

function biomeClearing(x, z) {
  const cabin = Math.abs(x + 97.2) < 4.6 && Math.abs(z + 13) < 4.1;
  const ranch = x > -8 && x < 12 && z > 34 && z < 54;
  const tropics = x > 26 && x < 52 && z > 38 && z < 60;
  return cabin || ranch || tropics;
}

function addTrees(group, clearTrail) {
  const random = seededRandom(701);
  const trunks = [];
  const firs = [];
  const deciduous = [];
  const groveCenters = [[-84, -37], [-76, 5], [-63, 24], [-54, -30], [-42, 28], [-36, -19], [-28, 32], [-20, -31], [3, -26], [19, 44], [39, -32], [42, 40]];
  for (const [cx, cz] of groveCenters) {
    for (let i = 0; i < 28; i++) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 15;
      const x = cx + Math.cos(angle) * radius;
      const z = cz + Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      if (y > 35 || y < 1.6 || ecologyClearing(x, z) || Math.abs(z - riverZ(x)) < riverWidth(x) + 3.4) continue;
      const deltaX = groundHeight(x + .75, z) - y;
      const deltaZ = groundHeight(x, z + .75) - y;
      if (Math.hypot(deltaX, deltaZ) > 1.12) continue;
      const size = 1.45 + random() * 2.65;
      const yaw = random() * Math.PI * 2;
      const shade = .8 + random() * .36;
      const obscuresStation = Math.hypot((x + 23.5) / 11.6, (z - 24.5) / 11.4) < 1;
      const isDeciduous = x > -51 && random() > .5;
      const color = isDeciduous ? (random() > .84 ? '#9a8c4e' : '#607e4a') : (y > 29 ? '#a2b6a0' : '#486a4b');
      if (obscuresStation || biomeClearing(x, z) || clearTrail(x, z, size * .13)) continue;
      trunks.push({ x, y: y + size * .17, z, sx: size * .11, sy: size * .54, sz: size * .11, yaw, color: '#544536', shade });
      if (isDeciduous) {
        deciduous.push({ x, y: y + size * .72, z, sx: size * .46, sy: size * .61, sz: size * .42, yaw, color, shade });
        deciduous.push({ x: x - size * .2, y: y + size * .67, z: z + size * .09, sx: size * .34, sy: size * .43, sz: size * .32, yaw, color, shade: shade * .86 });
      } else {
        for (let layer = 0; layer < 3; layer++) {
          const radius = size * (.4 - layer * .081);
          firs.push({ x, y: y + size * (.46 + layer * .25), z, sx: radius, sy: size * .61, sz: radius, yaw, color, shade: shade + layer * .056 });
        }
      }
    }
  }
  group.userData.rainCanopies = [...firs, ...deciduous].map(({ x, y, z, sx, sy, sz }) => ({
    x, z, y: y + sy * .5, rx: sx, rz: sz,
  }));
  group.add(
    instances('树干', new THREE.CylinderGeometry(.58, 1, 1, 5), trunks, true),
    instances('山地针叶林', new THREE.ConeGeometry(1, 1, 6), firs),
    instances('河谷林冠', new THREE.IcosahedronGeometry(1, 1), deciduous),
  );
}

function addRocks(group, clearTrail) {
  const random = seededRandom(3871);
  const rocks = [];
  for (let i = 0; i < 520; i++) {
    const x = -118 + random() * 187;
    const z = (random() - .5) * 175;
    const y = groundHeight(x, z);
    if (y < -.8 || ecologyClearing(x, z)) continue;
    const nearShore = coastlineX(z) - x < 8;
    const altitude = smoothstep(8, 33, y);
    if (!nearShore && random() > .27 + altitude * .67) continue;
    const size = (.16 + random() ** 3 * (nearShore ? 1.1 : 2.7)) * (.67 + altitude * .64);
    const shade = .79 + random() * .38;
    const color = y > 40 ? '#a4b3ad' : nearShore ? '#8d8b77' : '#777771';
    const rock = { x, y: y - size * .14 * altitude, z, sx: size, sy: size * .54, sz: size * (.61 + random() * .36), yaw: random() * 6.28, color, shade };
    const snowCabinYard = Math.hypot((x + 98.5) / 7, (z + 12) / 5.4) < 1;
    if (!snowCabinYard && !biomeClearing(x, z) && !clearTrail(x, z, size * .87)) rocks.push(rock);
  }
  for (let i = 0; i < 104; i++) {
    const x = -92 + random() * 145;
    const z = riverZ(x) + (random() < .5 ? -1 : 1) * (riverWidth(x) + random() * 2.8 - .32);
    const y = groundHeight(x, z);
    const size = .2 + random() ** 2 * (x < -50 ? 1.85 : .89);
    const rock = { x, y: y + size * .18, z, sx: size, sy: size * .63, sz: size * .76, yaw: random() * 6.28, color: '#78786a', shade: .75 + random() * .5 };
    if (!clearTrail(x, z, size * .83)) rocks.push(rock);
  }
  group.add(instances('山岩与河滩碎石', new THREE.IcosahedronGeometry(1, 0), rocks, true));
}

function addGrasses(group, clearTrail) {
  const random = seededRandom(9910);
  const grass = [];
  const colors = ['#809154', '#a5a563', '#667b47', '#8c9c59'];
  for (let i = 0; i < 1780; i++) {
    const x = -43 + random() * 96;
    const z = (random() - .5) * 110;
    const y = groundHeight(x, z);
    const shore = coastlineX(z) - x;
    if (shore < 3 || y < 1 || Math.abs(z - riverZ(x)) < riverWidth(x) + .7) continue;
    if (ecologyClearing(x, z) && random() > .31) continue;
    const size = .17 + random() * .55;
    const tuft = { x, y, z, sx: size * .8, sy: size, sz: size * .8, yaw: random() * 6.28, color: colors[Math.floor(random() * colors.length)], shade: .74 + random() * .49 };
    if (!clearTrail(x, z)) grass.push(tuft);
  }
  const shape = new THREE.BufferGeometry();
  shape.setAttribute('position', new THREE.Float32BufferAttribute([
    -.17, 0, .01, .06, 0, -.05, -.22, .87, .15,
    .05, 0, -.06, .27, 0, .11, .37, .74, .19,
    -.08, 0, .12, .02, 0, .29, -.13, .58, .42,
  ], 3));
  shape.computeVertexNormals();
  const mesh = instances('河谷草簇', shape, grass);
  mesh.material.side = THREE.DoubleSide;
  group.add(mesh);
}

export function createTerrain(scene, clearTrail = () => false, riverClock = { value: 0 }, cloud = { value: 0 }) {
  const group = new THREE.Group();
  group.name = '地貌和植被';
  group.add(meshSurface(riverClock, cloud));
  addTrees(group, clearTrail);
  addRocks(group, clearTrail);
  addGrasses(group, clearTrail);
  scene.add(group);
  return group;
}
