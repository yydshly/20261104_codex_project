import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const project = fileURLToPath(new URL('../', import.meta.url));
const buildDirectory = path.join(project, 'dist');
const docsDirectory = path.resolve(project, '../docs');
const destination = path.join(docsDirectory, '009-gpt62-3d-capability');
const manifestName = 'build-manifest.json';
const publisher = 'species-arena-3d/pages/009';

async function existingDirectory(directory) {
  try {
    const entry = await lstat(directory);
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error(`Expected a normal directory: ${directory}`);
    }
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symbolic link: ${relative}`);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

await mkdir(docsDirectory, { recursive: true });
const resolvedDocs = await realpath(docsDirectory);
if (path.relative(resolvedDocs, destination) !== '009-gpt62-3d-capability') {
  throw new Error('The publish destination must be the dedicated 009 folder inside docs');
}

const exists = await existingDirectory(destination);
if (exists) {
  let previous;
  try {
    previous = JSON.parse(await readFile(path.join(destination, manifestName), 'utf8'));
  } catch {
    throw new Error(`Refusing to overwrite a directory without this publisher's manifest: ${destination}`);
  }
  if (previous.publisher !== publisher) {
    throw new Error(`Refusing to overwrite a directory owned by a different publisher: ${destination}`);
  }
  await listFiles(destination);
}

await build({ root: project, base: './' });
const files = await listFiles(buildDirectory);
for (const entry of ['index.html', 'journey.html', 'arena.html', 'rescue.html', 'orbit.html', 'magnet-lab.html']) {
  if (!files.includes(entry)) throw new Error(`The build is missing its ${entry} entry point`);
}

await mkdir(destination, { recursive: true });
await cp(buildDirectory, destination, { recursive: true });
const hashes = {};
for (const relative of files) {
  const sourceHash = await sha256(path.join(buildDirectory, relative));
  const publishedHash = await sha256(path.join(destination, relative));
  if (sourceHash !== publishedHash) throw new Error(`Published file failed SHA-256 verification: ${relative}`);
  hashes[relative.split(path.sep).join('/')] = sourceHash;
}

await writeFile(path.join(destination, manifestName), `${JSON.stringify({ publisher, base: './', files: hashes }, null, 2)}\n`);
console.log(`Published and verified ${files.length} files to ${destination}`);
