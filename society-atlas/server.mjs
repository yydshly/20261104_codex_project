import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4173);
const mimeTypes = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.mp4':'video/mp4', '.vtt':'text/vtt; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options','nosniff');
  response.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  response.setHeader('Cache-Control','no-cache');
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405); response.end('Method not allowed'); return; }
  let requestedPath;
  try { requestedPath = decodeURIComponent(new URL(request.url,'http://localhost').pathname); }
  catch (_) { response.writeHead(400); response.end('Bad request'); return; }
  const filename = path.resolve(directory, '.' + (requestedPath === '/' ? '/index.html' : requestedPath));
  const relative = path.relative(directory,filename);
  if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end('Forbidden'); return; }
  try {
    const contents = await readFile(filename);
    const extension = path.extname(filename);
    response.setHeader('Content-Type',mimeTypes[extension] || 'application/octet-stream');
    if (extension === '.mp4') {
      response.setHeader('Accept-Ranges','bytes');
      const range = request.method === 'GET' && /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
      if (range && (range[1] || range[2])) {
        const size = contents.length;
        const start = range[1] ? Number(range[1]) : Math.max(size - Number(range[2]), 0);
        const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
        if (start > end) {
          response.writeHead(416,{'Content-Range':`bytes */${size}`});
          response.end();
          return;
        }
        const part = contents.subarray(start, end + 1);
        response.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':part.length});
        response.end(part);
        return;
      }
    }
    response.setHeader('Content-Length',contents.length);
    response.writeHead(200);
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch (_) { response.writeHead(404); response.end('Not found'); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
server.on('error',error=>{ console.error(error.message);process.exitCode=1; });
