import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EFFECTS, makeRecipe } from '../effects.js';
import { buildExpansionBundle } from '../extension-view.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'deliverables');
await mkdir(destination, { recursive: true });
await writeFile(resolve(destination, 'ocean-extension-plans-80.json'), JSON.stringify(buildExpansionBundle(EFFECTS), null, 2), 'utf8');
// Retain earlier recipe fields (including actual output metadata) when present.
let previous = [];
try { previous = JSON.parse(await readFile(resolve(destination, 'effect-recipes.json'), 'utf8')); } catch { /* First export. */ }
const recipes = EFFECTS.map(effect => ({ ...previous.find(item => item.id === effect.id), ...makeRecipe(effect, effect.controls) }));
await writeFile(resolve(destination, 'effect-recipes.json'), JSON.stringify(recipes, null, 2), 'utf8');
console.log('Exported 20 effects / 80 expansion plans; base recipes include four directions each.');
