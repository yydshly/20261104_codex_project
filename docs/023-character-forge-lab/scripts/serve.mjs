import http from 'node:http';
import { readFile, stat, realpath, lstat, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const root = path.resolve(project, option('--root', '.'));
const host = option('--host', '127.0.0.1');
const port = Number(option('--port', process.env.PORT || 5218));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port.');
if (host !== '127.0.0.1') throw new Error('This preview server only permits 127.0.0.1.');
if (root !== project && !root.startsWith(project + path.sep)) throw new Error('Preview root must stay inside this project.');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.mp4': 'video/mp4', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8', '.blend': 'application/octet-stream', '.fbx': 'application/octet-stream' };
const captureEndpoint = '/__capture/chixiao-v5-combat.webm';
const captureUrl = '/docs/chixiao-v5-combat.webm';
const captureDirectory = path.join(project, 'docs');
const captureFile = path.join(captureDirectory, 'chixiao-v5-combat.webm');
const previewOrigin = new URL(`http://${host}:${port}`);
const maximumCaptureBytes = 64 * 1024 * 1024;
let captureBusy = false;
const captureError = (status, message) => Object.assign(new Error(message), { status });
function webmHeaderValid(data) {
  if (data.length < 32 || data.readUInt32BE(0) !== 0x1a45dfa3) return false;
  const vint = (offset, keepMarker = false) => {
    if (offset >= data.length) throw new Error('Truncated EBML');
    let width = 1; while (width <= 8 && !(data[offset] & (0x80 >> (width - 1)))) width++;
    if (width > 8 || offset + width > data.length) throw new Error('Invalid EBML');
    let value = BigInt(keepMarker ? data[offset] : data[offset] & (0xff >> width));
    for (let i = 1; i < width; i++) value = (value << 8n) | BigInt(data[offset + i]);
    return { width, value };
  };
  try {
    const header = vint(4); if (header.value > 4096n) return false;
    const end = 4 + header.width + Number(header.value); if (end > data.length) return false;
    for (let offset = 4 + header.width; offset < end;) {
      const id = vint(offset, true); offset += id.width;
      const size = vint(offset); offset += size.width;
      if (size.value > BigInt(end - offset)) return false;
      const length = Number(size.value);
      if (id.value === 0x4282n) return data.toString('ascii', offset, offset + length) === 'webm';
      offset += length;
    }
  } catch {}
  return false;
}
function captureBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let bytes = 0;
    const clean = () => { req.off('data', onData); req.off('end', onEnd); req.off('error', onError); req.off('aborted', onAborted); };
    const onError = error => { clean(); reject(error); };
    const onAborted = () => onError(captureError(400, 'Capture upload aborted.'));
    const onData = chunk => { bytes += chunk.length; if (bytes > maximumCaptureBytes) { clean(); req.resume(); reject(captureError(413, 'Capture exceeds 64 MiB.')); } else chunks.push(chunk); };
    const onEnd = () => { clean(); resolve(Buffer.concat(chunks, bytes)); };
    req.on('data', onData); req.once('end', onEnd); req.once('error', onError); req.once('aborted', onAborted);
  });
}
async function saveCapture(req, res) {
  let temporary;
  try {
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end('Method not allowed'); return; }
    if (req.headers.origin !== previewOrigin.origin || req.headers.host !== previewOrigin.host || req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') throw captureError(403, 'Same-origin capture only.');
    if (String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'video/webm') throw captureError(415, 'Expected video/webm.');
    const declared = req.headers['content-length'];
    if (declared !== undefined && (!/^\d+$/.test(declared) || Number(declared) > maximumCaptureBytes)) throw captureError(413, 'Capture exceeds 64 MiB.');
    if (captureBusy) throw captureError(409, 'A capture is already being saved.');
    captureBusy = true;
    try {
      const data = await captureBody(req);
      if (!webmHeaderValid(data)) throw captureError(422, 'Invalid WebM EBML header or DocType.');
      const expectedDirectory = path.join(await realpath(project), 'docs');
      if ((await realpath(captureDirectory)).toLowerCase() !== expectedDirectory.toLowerCase()) throw captureError(403, 'Capture directory is not the project docs directory.');
      try { if ((await lstat(captureFile)).isSymbolicLink()) throw captureError(403, 'Capture destination cannot be a link.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      temporary = path.join(captureDirectory, `.chixiao-v5-${randomUUID()}.partial`);
      await writeFile(temporary, data, { flag: 'wx' });
      await rename(temporary, captureFile); temporary = null;
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify({ ok: true, bytes: data.length, url: `${captureUrl}?recorded=${Date.now()}` }));
    } finally { captureBusy = false; }
  } catch (error) {
    if (temporary) await unlink(temporary).catch(() => {});
    req.resume();
    res.writeHead(error.status || 500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'close' });
    res.end(JSON.stringify({ ok: false, error: error.status ? error.message : 'Capture could not be saved.' }));
  }
}
http.createServer(async (req, res) => {
  req.on('error', () => {}); // An aborted upload must not terminate the preview process.
  res.on('error', () => {});
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === captureEndpoint) { await saveCapture(req, res); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Method not allowed'); return; }
    // This exact URL serves the newly saved canonical file even with --root dist.
    const canonicalCapture = pathname === captureUrl;
    const target = canonicalCapture ? captureFile : path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if ((!canonicalCapture && !target.startsWith(root + path.sep)) || pathname.split('/').some(p => p.startsWith('.'))) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, host, () => console.log(`Character Forge Lab · http://${host}:${port}`));
