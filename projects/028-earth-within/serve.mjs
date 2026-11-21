import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/028-earth-within');
const prefix = '/20261104_codex_project/028-earth-within/';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain', '.txt': 'text/plain', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const port = Number(process.argv[2] || 4207);
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/') { res.writeHead(302, { Location: prefix }).end(); return; }
  if (!pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
  const relative = decodeURIComponent(pathname.slice(prefix.length)) || 'index.html';
  const file = resolve(output, relative);
  if (!file.startsWith(output + sep) || relative.split('/').some(part => part.startsWith('.'))) { res.writeHead(404).end(); return; }
  try {
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${mime[extname(file)] || 'application/octet-stream'}${/\.(html|js|css|json|md|txt|svg)$/.test(file) ? '; charset=utf-8' : ''}`, 'Content-Length': bytes.length, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => console.log(`Research preview http://127.0.0.1:${port}${prefix}`));
