import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';

const root = dirname(fileURLToPath(import.meta.url));
const localRequire = createRequire(import.meta.url);
let dependencyRequire = localRequire;
try { localRequire.resolve('esbuild'); localRequire.resolve('three'); }
catch { dependencyRequire = createRequire(resolve(root, '../../castle-at-dusk/package.json')); }
const { build } = dependencyRequire('esbuild');
const threeRoot = dirname(dirname(dependencyRequire.resolve('three')));
await build({ entryPoints:[resolve(root,'scene.js')], outfile:resolve(root,'scene.bundle.js'), bundle:true, format:'esm', target:'es2022', minify:true, legalComments:'eof', nodePaths:[resolve(threeRoot,'..')], logLevel:'info' });
await writeFile(resolve(root,'THREE-LICENSE.txt'), await readFile(resolve(threeRoot,'LICENSE')));
