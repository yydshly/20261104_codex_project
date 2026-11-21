import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5267);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.gif': 'image/gif', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav', '.glb': 'model/gltf-binary' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403).end();
      return;
    }
    const data = await readFile(file);
    const headers = { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
    if (request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      const start = range?.[1] ? Number(range[1]) : Math.max(0, data.length - Number(range?.[2] || 0));
      const end = range?.[1] && range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
      if (!range || start > end || start >= data.length) {
        response.writeHead(416, { 'Content-Range': `bytes */${data.length}` }).end();
        return;
      }
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1 });
      response.end(data.subarray(start, end + 1));
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Length': data.length });
    response.end(data);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Tidelight http://127.0.0.1:${port}/`));
