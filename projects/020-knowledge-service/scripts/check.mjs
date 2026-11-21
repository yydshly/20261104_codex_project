import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const files = ['server.mjs', 'src/data.mjs', 'src/adapters.mjs', 'src/engine.mjs', 'public/app.js', 'public/message-parts.js', 'public/product-plan.js', 'public/product-view.js', 'public/implementation-guide.js', 'public/operations-guide.js', 'public/capability-map.js', 'public/guide-view.js', 'public/research-view.js', 'public/browser-demo.js', 'scripts/build-pages.mjs'];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
  console.log(`OK ${file}`);
}
const html = await readFile('public/index.html', 'utf8');
for (const asset of ['/styles.css', '/product.css', '/blueprint.css', '/guide.css', '/research.css', '/app.js', '/favicon.svg']) {
  if (!html.includes(asset)) throw new Error(`Missing asset reference: ${asset}`);
  await readFile(`public${asset}`);
}
console.log('OK local assets');
for (const name of ['mechanism', 'value']) {
  const data = await readFile(`public/assets/knowledge-service-${name}.png`);
  if (data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
}
console.log('OK architecture image assets');
