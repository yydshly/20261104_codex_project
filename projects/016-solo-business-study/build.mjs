import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const destination = path.resolve(root, '../../docs/016-solo-business-study');
let offline = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
offline = offline.replace('  <link rel="stylesheet" href="styles.css">', () => `  <style>\n${css}\n  </style>`);
for (const name of ['cases-data.js', 'jobs-data.js', 'decisions-data.js', 'app.js']) {
  const script = (await readFile(path.join(root, name), 'utf8')).replace(/<\/script/gi, '<\\/script');
  offline = offline.replace(`  <script src="${name}" defer></script>`, () => `  <script defer>\n${name === 'app.js' ? `document.addEventListener('DOMContentLoaded', () => {\n${script}\n});` : script}\n  </script>`);
}
const mapPath = 'assets/research-map-20261121.png';
const mapSource = `src="${mapPath}"`;
if (offline.split(mapSource).length !== 2) throw new Error('Expected exactly one research-map image to embed.');
const mapImage = await readFile(path.join(root, mapPath));
offline = offline.replace(mapSource, () => `src="data:image/png;base64,${mapImage.toString('base64')}"`);
await writeFile(path.join(root, 'offline.html'), offline, 'utf8');
await mkdir(destination, { recursive: true });
const publishFiles = JSON.parse(await readFile(path.join(root, 'publish-files.json'), 'utf8'));
for (const name of publishFiles) {
  if (path.isAbsolute(name) || name.split(/[\\/]/).includes('..')) throw new Error('Invalid publication path.');
  const target = path.join(destination, name);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, name), target);
}
console.log(`Prepared offline.html and ${publishFiles.length} declared files in docs/016-solo-business-study. Build does not publish or delete local files.`);
