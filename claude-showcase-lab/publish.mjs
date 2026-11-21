import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const build = fileURLToPath(new URL('./dist/', import.meta.url));
const output = fileURLToPath(new URL('../docs/006-claude-showcase/', import.meta.url));

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}

await mkdir(output, { recursive: true });
await cp(build, output, { recursive: true });
const paths = await files(build);
for (const path of paths) {
  const target = join(output, relative(build, path));
  const [source, published] = await Promise.all([readFile(path), readFile(target)]);
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  if (hash(source) !== hash(published)) throw new Error(`Publish verification failed: ${target}`);
}
console.log(`Published and verified ${paths.length} files in docs/006-claude-showcase/`);
