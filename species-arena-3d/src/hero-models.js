import { heroCatalog, rescueHeroes } from './hero-catalog.js';
import { createKnight, createBeast } from './ground-models.js';
import { createCrawler, createWraith } from './exotic-models.js';
import { createHero } from './rescue-heroes.js';
import { createNewHero } from './rescue-new-heroes.js';
import { createExpansionHero } from './rescue-expansion-heroes.js';
import { createWaveHero } from './rescue-wave-heroes.js';
import { createEpochHero } from './rescue-epoch-heroes.js';
import { createMagnetHero } from './magnet-hero.js';

const rescueIds = new Set(rescueHeroes.map(({ id }) => id));
const poweredIds = new Set(heroCatalog.filter(hero => hero.group === 'powered').map(({ id }) => id));
const factories = new Map([
  ['knight', createKnight], ['beast', createBeast],
  ['crawler', createCrawler], ['wraith', createWraith],
  ['web', createNewHero], ['speed', createNewHero],
  ['giant', createExpansionHero], ['mirror', createExpansionHero],
  ['wind', createWaveHero], ['shield', createWaveHero],
  ['rewind', createEpochHero], ['grove', createEpochHero],
  ['magnet', createMagnetHero],
]);

export function usesPowerPose(id) {
  return poweredIds.has(id);
}

export function createCatalogHero(id) {
  const factory = factories.get(id);
  if (factory) return factory(id);
  if (rescueIds.has(id)) return createHero(id);
  throw new RangeError(`Unknown hero: ${id}`);
}
