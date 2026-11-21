import { Scene } from 'three';
import { createTerrain, riverZ, riverSpan, riverSurfaceHeight } from '../src/world-terrain.js';
import { collectFlowObstacles } from '../src/world-flow.js';
import { createTrail, trailClearance } from '../src/world-trail.js';
import { createWater } from '../src/world-water.js';
import { createEcology } from '../src/world-ecology.js';
import { createStation } from '../src/world-station.js';
import { createUnderwater } from '../src/world-underwater.js';
import { createBiomes } from '../src/world-biomes.js';
import { createExtras } from '../src/world-extras.js';
import { createWorldCollision } from '../src/world-collision.js';
import { createItinerary } from '../src/world-itinerary.js';
import { createWorldWeather } from '../src/world-weather.js';

export function buildWorldScene() {
  const weather = createWorldWeather();
  const scene = new Scene();
  createTerrain(scene, trailClearance);
  const trail = createTrail(scene);
  const water = createWater(scene);
  const ecology = createEcology(scene, trailClearance);
  const station = createStation(scene);
  const underwater = createUnderwater(scene);
  const biomes = createBiomes(scene);
  const extras = createExtras(scene);
  const stops = new Map(Object.entries({ ...trail.stops, ...ecology.stops, ...biomes.stops, ...extras.stops }));
  const itinerary = createItinerary(trail, stops, underwater.entry);
  const collision = createWorldCollision(scene);
  const flowObstacles = collectFlowObstacles(scene, { centerAt: riverZ,
    spanAt: (x) => riverSpan(x, 1, .42), surfaceAt: (x) => riverSurfaceHeight(x, 1, .42) });
  return { scene, weather, trail, water, ecology, station, underwater, biomes, extras, stops, itinerary, collision, flowObstacles };
}
