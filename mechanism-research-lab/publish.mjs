import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const build = fileURLToPath(new URL('./dist/', import.meta.url));
const output = fileURLToPath(new URL('../docs/004-tesseract-capabilities/', import.meta.url));
const summary = fileURLToPath(new URL('../projects/004-tesseract-capabilities/README.md', import.meta.url));

await mkdir(output, { recursive: true });
await cp(build, output, { recursive: true });
await writeFile(new URL('../docs/004-tesseract-capabilities/README.md', import.meta.url), await readFile(summary));
console.log(`Published Tesseract capabilities and value study to ${output}`);
