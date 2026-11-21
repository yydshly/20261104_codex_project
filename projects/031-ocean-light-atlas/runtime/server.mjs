import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4197);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt; charset=utf-8', '.zip': 'application/zip', '.md': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
  if (!file.startsWith(root + sep) || path.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end('Forbidden'); return; }
  try {
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end('Not found'); return; }
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' };
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range && req.method === 'GET') {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      headers['Content-Length'] = end - start + 1;
    }
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
    const stream = createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch { res.writeHead(404).end('Not found'); }
});
server.on('error', error => { console.error(`Preview server: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Ocean Light Atlas: http://127.0.0.1:${port}/`));
