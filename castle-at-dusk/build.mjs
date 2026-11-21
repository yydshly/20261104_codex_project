import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const local = (file) => new URL(file, import.meta.url);
const [shell, css, license, bundle] = await Promise.all([
  readFile(local('shell.html'), 'utf8'),
  readFile(local('style.css'), 'utf8'),
  readFile(local('node_modules/three/LICENSE'), 'utf8'),
  build({
    entryPoints: [fileURLToPath(local('scene.js'))],
    bundle: true,
    format: 'iife',
    minify: true,
    legalComments: 'inline',
    write: false,
  }),
]);

const html = shell
  .replace('<!-- STYLES -->', () => `<style>\n${css}\n</style>`)
  .replace('<!-- THIRD PARTY LICENSE -->', () => `<!-- Three.js\n${license.trim()}\n-->`)
  .replace('<!-- SCENE -->', () => `<script>\n${bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}\n</script>`);

await writeFile(local('index.html'), html);
console.log('Built index.html');
