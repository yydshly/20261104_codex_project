import { MathUtils, Vector3 } from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';

const sampleSpacing = .25;
const standingEye = 1.64;
const surfaceEye = .26;

export const underwaterStations = {
  kelp: { position: [78, -2.3, 31.5], target: [81.5, -3.1, 34.5], swimming: true },
  'reef-deep': { position: [90, -5, 26], target: [93.5, -6.6, 23.4], swimming: true },
};

function horizontal([x, , z]) {
  return [x, z];
}

function projectOnPath(path, [x, z]) {
  let nearest;
  let bestDistance = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const [startX, startZ] = path[i];
    const [endX, endZ] = path[i + 1];
    const dx = endX - startX;
    const dz = endZ - startZ;
    const fraction = MathUtils.clamp(((x - startX) * dx + (z - startZ) * dz) / (dx * dx + dz * dz), 0, 1);
    const px = startX + dx * fraction;
    const pz = startZ + dz * fraction;
    const distance = (x - px) ** 2 + (z - pz) ** 2;
    if (distance < bestDistance) {
      nearest = { index: i, fraction, point: [px, pz] };
      bestDistance = distance;
    }
  }
  return nearest;
}

function section(path, from, to) {
  const start = projectOnPath(path, from);
  const end = projectOnPath(path, to);
  const forward = start.index + start.fraction <= end.index + end.fraction;
  const between = forward
    ? path.slice(start.index + 1, end.index + 1)
    : path.slice(end.index + 1, start.index + 1).reverse();
  return [start.point, ...between, end.point];
}

function interpolatePath(path) {
  const samples = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const start = path[i - 1];
    const end = path[i];
    const steps = Math.ceil(Math.hypot(...end.map((value, axis) => value - start[axis])) / sampleSpacing);
    for (let j = 1; j <= steps; j++) {
      samples.push(end.map((value, axis) => MathUtils.lerp(start[axis], value, j / steps)));
    }
  }
  return samples;
}

function pointAt(x, z, diveDepth = 0) {
  const floor = groundSurfaceHeight(x, z);
  const surface = waterSurfaceAt(x, z, floor);
  const depth = surface === null ? 0 : Math.max(0, surface - floor);
  const floating = MathUtils.smoothstep(depth, .55, 1.18);
  let y = MathUtils.lerp(floor + standingEye, (surface ?? floor) + surfaceEye, floating);
  let medium = depth < .13 ? 'walk' : depth < .99 ? 'wade' : 'swim';
  if (medium === 'swim' && diveDepth > 0) {
    y = Math.max(floor + .54, y - diveDepth);
    if (y < surface - .075) medium = 'dive';
  }
  return { position: new Vector3(x, y, z), medium, surface, floor };
}

function makeChapter(path, target, diveEye) {
  const samples = interpolatePath(path);
  const points = samples.map(([x, z]) => {
    const diveDepth = diveEye === undefined ? 0 : MathUtils.smoothstep(x, 67.9, samples.at(-1)[0]) * (surfaceEye - diveEye);
    return pointAt(x, z, diveDepth);
  });
  return { points, target: new Vector3(...target) };
}

function makeSwimChapter(start, waypoints, station) {
  const samples = interpolatePath([start, ...waypoints, station.position]);
  const points = samples.map(([x, y, z]) => pointAt(x, z, surfaceEye - y));
  return { points, target: new Vector3(...station.target) };
}

export function createItinerary(trail, stops, diveSpawn) {
  const main = trail.points.map(([x, , z]) => {
    const cabinCorner = MathUtils.smoothstep(x, -36.8, -34.8) * (1 - MathUtils.smoothstep(x, -34.8, -33.2));
    return [x, z + .68 * cabinCorner];
  });
  const [, ranchBranch, forestBranch] = trail.branches.map((branch) => branch.map(horizontal));
  const trailAt = (id) => horizontal(trail.stops[id].position);
  const stopAt = (id) => horizontal(stops.get(id).spawn.position);
  const mainAt = (x) => main.find((point) => point[0] >= x) ?? main.at(-1);
  const along = (a, b) => section(main, a, b);
  const branchTo = (branch, point) => section(branch, branch[0], point);
  const cabin = stopAt('cabin');
  const snow = trailAt('snow');
  const gorge = trailAt('gorge');
  const river = trailAt('river');
  const beeTrail = trailAt('bee');
  const bee = [-2.7, 25.45];
  const antTrail = trailAt('ant');
  const ant = [16.85, 26.65];
  const ranch = stopAt('ranch');
  const forest = [39, 44.15];
  const wetland = stopAt('wetland');
  const dunes = stopAt('dunes');
  const tide = trailAt('tide');
  const ocean = trailAt('ocean');
  const dive = horizontal(diveSpawn.position);
  const crossing = mainAt(46.2);
  const beachAccess = mainAt(51.6);
  const opening = mainAt(-104.4);
  const chapters = [
    ['cabin', [opening, ...along(opening, cabin), cabin]],
    ['snow', [cabin, ...along(cabin, snow), snow]],
    ['gorge', [snow, ...along(snow, gorge), gorge]],
    ['river', [gorge, ...along(gorge, river), river]],
    ['bee', [river, ...along(river, beeTrail), beeTrail, bee]],
    ['ranch', [bee, beeTrail, ...along(beeTrail, ranchBranch[0]), ...branchTo(ranchBranch, ranch), ranch]],
    ['ant', [ranch, ...branchTo(ranchBranch, ranch).reverse(), ...along(ranchBranch[0], antTrail), antTrail, ant]],
    ['tropics', [ant, antTrail, ...along(antTrail, forestBranch[0]), ...branchTo(forestBranch, forest), forest]],
    ['dunes', [forest, ...branchTo(forestBranch, forest).reverse(), ...along(forestBranch[0], crossing),
      [46.2, 22], [46.2, 17], [46.2, 11], [46.9, 5.4], [46.9, -.4], [46.6, -10], [46.7, -19.5], [48.3, -26.8], dunes]],
    ['wetland', [dunes, [50.4, -27.4], [50.6, -21.1], [50.5, -13.5], [49.9, -6.5], wetland]],
    ['tide', [wetland, [53.6, -1.7], [55.5, 2.7],
      [55.5, 12], [54.8, 18.1], [53.6, 23.3], beachAccess, ...along(beachAccess, tide), tide]],
    ['ocean', [tide, ...along(tide, ocean), ocean]],
    ['dive', [ocean, [66.45, 38.5], [69.4, 38.0], dive]],
  ];

  const itinerary = new Map(chapters.map(([id, path]) => {
    const target = id === 'dive' ? diveSpawn.target : id === 'ocean' ? trail.stops.ocean.target : stops.get(id).target;
    return [id, makeChapter(path, target, id === 'dive' ? diveSpawn.position[1] : undefined)];
  }));

  const entry = itinerary.get('dive').points.at(-1).position.toArray();
  const kelp = makeSwimChapter(entry, [[73.15, -1.86, 33.18], [75.75, -2.08, 32.2]], underwaterStations.kelp);
  const reef = makeSwimChapter(kelp.points.at(-1).position.toArray(), [
    [80.6, -2.95, 30.56], [83.6, -3.55, 29.32], [86.4, -4.18, 28.32], [88.45, -4.56, 27.2],
  ], underwaterStations['reef-deep']);
  itinerary.set('kelp', kelp);
  itinerary.set('reef-deep', reef);
  return itinerary;
}
