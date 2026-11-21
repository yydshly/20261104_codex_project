import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const source = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.argv[2] || resolve(source, 'dist'));
const publicRoot = resolve(source, 'public');
if (output === source || source.startsWith(`${output}${sep}`) || output === publicRoot || output.startsWith(`${publicRoot}${sep}`)) throw new Error('Output must not overwrite the source project or public directory.');
await mkdir(output, { recursive: true });
await cp(publicRoot, output, { recursive: true });
await mkdir(resolve(output, 'runtime'), { recursive: true });
for (const name of ['engine.mjs', 'adapters.mjs', 'data.mjs']) {
  let code = await readFile(resolve(source, 'src', name), 'utf8');
  if (name === 'engine.mjs') {
    code = code.replace("import { randomUUID } from 'node:crypto';", 'const randomUUID = () => globalThis.crypto.randomUUID();').replace("import { performance } from 'node:perf_hooks';", 'const performance = globalThis.performance;');
  }
  if (/from ['"]node:/.test(code)) throw new Error(`Unsupported browser dependency in ${name}`);
  await writeFile(resolve(output, 'runtime', name), code);
}
let html = await readFile(resolve(output, 'index.html'), 'utf8');
html = html.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-runtime="browser-demo">')
  .replace('本地开发模式', '公开研究演示').replace('>本地演示<', '>浏览器教学演示<')
  .replace('正在连接本地实验室…', '正在加载研究与浏览器演示…')
  .replace('<main id="main"', '<aside class="deployment-notice" role="note"><strong>公开研究演示：</strong>对话与工单仅在当前页面内存，刷新即清空，未连接真实模型或业务。能力表评估仓库中的 Node 本地原型；浏览器规则不构成生产授权。</aside><main id="main"')
  .replace('会话与演示工单存于服务端内存，重启失效。', '公开版会话与工单只在本页内存，刷新失效；服务端机制说明对应 Node 本地版。');
await writeFile(resolve(output, 'index.html'), html);
const readme = (await readFile(resolve(source, 'README.md'), 'utf8')).replaceAll('](public/assets/', '](assets/').replaceAll('](DEVELOPMENT.md)', '](https://github.com/yydshly/20261104_codex_project/blob/main/projects/020-knowledge-service/DEVELOPMENT.md)').replace('](../../README.md#研究索引)', '](../)');
await writeFile(resolve(output, 'README.md'), readme);
await cp(resolve(source, 'DEVELOPMENT.md'), resolve(output, 'DEVELOPMENT.md'));
const [mechanism, value] = await Promise.all(['knowledge-service-mechanism.png', 'knowledge-service-value.png'].map(name => readFile(resolve(output, 'assets', name))));
if (!mechanism.length || !value.length || !html.includes('data-runtime="browser-demo"')) throw new Error('Incomplete Pages package');
await writeFile(resolve(output, 'release.json'), JSON.stringify({ project: '020-knowledge-service', researchDate: '2026-11-21', runtime: 'browser-demo', state: 'page-memory-only', capabilities: { implemented: 14, demo: 4, planned: 12 }, guide: { mechanism: createHash('sha256').update(mechanism).digest('hex'), value: createHash('sha256').update(value).digest('hex') } }, null, 2));
console.log(`Built public research and browser demo: ${output}`);
