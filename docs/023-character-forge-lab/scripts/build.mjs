import { cp, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(path.join(root, 'dist'), { recursive: true });
for (const name of ['index.html', 'study.html', 'research.html', 'src', 'vendor', 'assets', 'docs', 'scripts', 'README.md']) {
  await cp(path.join(root, name), path.join(root, 'dist', name), { recursive: true, filter: file => !path.relative(root, file).split(path.sep).some(part => ['source', '.git', '__pycache__', 'warlord-premium', 'warlord-v5'].includes(part)) && !/\.(blend\d+|log)$/i.test(file) });
}
// Research links expose the native handoff notes without copying editor caches
// or a second set of large, extracted native textures into the static site.
for (const name of ['engine/warlord/README.md', 'engine/warlord/project.godot', 'engine/warlord/validation/sourcekit-fresh-import.json']) {
  await mkdir(path.dirname(path.join(root, 'dist', name)), { recursive: true });
  await cp(path.join(root, name), path.join(root, 'dist', name));
}
for (const name of ['play.html', 'warlord.html', 'emberfall.html', 'deliverables']) {
  try { await access(path.join(root, name)); await cp(path.join(root, name), path.join(root, 'dist', name), { recursive: true }); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
await mkdir(path.join(root, 'dist', 'deliverables'), { recursive: true });
try { await cp(path.join(root, 'engine', 'Emberfall-Godot-project.zip'), path.join(root, 'dist', 'deliverables', 'Emberfall-Godot-project.zip')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log('Static build saved to dist/');
