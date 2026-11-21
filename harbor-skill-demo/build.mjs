import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const destination = path.resolve(root, '../docs/018-game-skill-product');
const files = ['.gitattributes','index.html','style.css','game.js','scene.js','campaign.js','content.js','harbor-assets.js','audio-bank.js','research.html','research.css','research-review.css','research.js','research-v1.html','research-v1.css','research-v1.js','research-v2.html','research-v2.js','gallery.html','gallery.js','README.md','DESIGN.md','DESIGN-v1.md','SKILL-USAGE.md','THIRD-PARTY-NOTICES.md','build-assets.ps1','campaign.test.js','verify-browser.py','verify-presentation.py','playthrough.py','measure-performance.py','server.mjs','package.json'];
const evidence = ['product-title.png','playthrough-chapter-1.png','playthrough-chapter-2.png','playthrough-chapter-3.png','upgrade.png','mobile-play.png','ending-playthrough.png','full-playthrough.mp4','full-playthrough.webm','browser-verification.json','playthrough.json','performance.json'];
await mkdir(destination, { recursive: true });
for (const file of files) await cp(path.join(root, file), path.join(destination, file));
for (const directory of ['vendor', 'baseline', 'before-upgrade', 'assets', 'scripts', 'publication']) await cp(path.join(root, directory), path.join(destination, directory), { recursive: true, filter: source => !source.includes('__pycache__') && !source.endsWith('.pyc') });
// Publish project-authored recipes and provenance metadata, never the upstream
// unlicensed toolkit, copied templates or full-text Skill research snapshots.
await mkdir(path.join(destination, 'asset-recipes'), { recursive: true });
for (const file of ['build_models.py','build_vfx.py','build_audio.py']) await cp(path.join(root,'asset-recipes',file),path.join(destination,'asset-recipes',file));
await mkdir(path.join(destination, 'skill-sources', 'v2'), { recursive: true });
for (const file of ['manifest.json','v2/manifest.json']) await cp(path.join(root,'skill-sources',file),path.join(destination,'skill-sources',file));
await mkdir(path.join(destination, 'evidence'), { recursive: true });
for (const file of evidence) await cp(path.join(root, 'evidence', file), path.join(destination, 'evidence', file));
await cp(path.join(root, 'evidence', 'v2'), path.join(destination, 'evidence', 'v2'), { recursive: true });
await cp(path.join(root, 'evidence', 'v3'), path.join(destination, 'evidence', 'v3'), { recursive: true });
await mkdir(path.join(destination, 'ab-experiment'), { recursive: true });
for (const file of ['PROTOCOL.md','protocol.json']) await cp(path.join(root,'ab-experiment',file),path.join(destination,'ab-experiment',file));
const verification = JSON.parse(await readFile(path.join(root, 'evidence', 'v2', 'browser-verification.json'), 'utf8'));
const run = JSON.parse(await readFile(path.join(root, 'evidence', 'v2', 'playthrough.json'), 'utf8'));
const review = JSON.parse(await readFile(path.join(root, 'evidence', 'v3', 'research-verification.json'), 'utf8'));
await writeFile(path.join(destination, 'build.json'), JSON.stringify({ source: 'harbor-skill-demo', project: '018-game-skill-product', version: 4, unitTests: 22, browserChecks: verification.passed, historicalPresentationChecks: 9, reviewChecks: review.checks.length, sameModelComparison: 'not run; protocol only', overview: 'assets/research/research-overview-v3.png', completed: run.completed, entry: 'research.html', game: 'index.html', hosting: 'GitHub Pages, main/docs', redistribution: 'MIT runtime modules with notices; upstream toolkit, copied templates and full-text Skill snapshots excluded', sourceRights: 'publication/source-rights.json', generatorToolkit: 'obtain asset-maker separately from upstream for local regeneration' }, null, 2));
console.log(`Static package ready at ${destination}`);
