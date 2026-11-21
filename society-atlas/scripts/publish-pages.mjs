import { cp, mkdir, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(project, 'dist');
const destination = path.resolve(project, '../docs/005-jianquan-cognition');

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  }));
  return nested.flat();
}

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
const sourceFiles = await files(source);
for (const filename of sourceFiles) {
  const relative = path.relative(source, filename);
  const contents = await Promise.all([readFile(filename), readFile(path.join(destination, relative))]);
  const hashes = contents.map(value => createHash('sha256').update(value).digest('hex'));
  if (hashes[0] !== hashes[1]) throw new Error(`Published file differs: ${relative}`);
}
console.log(`Published and verified ${sourceFiles.length} static files → docs/005-jianquan-cognition/`);
