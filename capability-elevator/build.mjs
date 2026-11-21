import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const folder = fileURLToPath(new URL('.', import.meta.url));
const output = fileURLToPath(new URL('../docs/002-capability-elevator/', import.meta.url));
await mkdir(output, { recursive: true });
await cp(join(folder, 'public'), output, { recursive: true });

for (const filename of ['app.js', 'scene.js', 'timeline.js', 'tool-guide.js']) {
  await mkdir(join(output, 'src'), { recursive: true });
  await cp(join(folder, 'src', filename), join(output, 'src', filename));
}

const vendor = join(output, 'vendor');
await mkdir(join(vendor, 'addons', 'geometries'), { recursive: true });
for (const filename of ['three.module.js', 'three.core.js']) {
  await cp(join(folder, 'node_modules', 'three', 'build', filename), join(vendor, filename));
}
await cp(
  join(folder, 'node_modules', 'three', 'examples', 'jsm', 'geometries', 'RoundedBoxGeometry.js'),
  join(vendor, 'addons', 'geometries', 'RoundedBoxGeometry.js'),
);
await cp(join(folder, 'node_modules', 'three', 'LICENSE'), join(vendor, 'THREE-LICENSE.txt'));
console.log('静态网页已构建到 ' + output);
