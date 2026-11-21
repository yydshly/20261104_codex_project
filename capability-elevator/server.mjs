import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = fileURLToPath(new URL('.', import.meta.url));
const publicFolder = resolve(folder, 'public');
const modulesFolder = resolve(folder, 'node_modules/three');
const staticTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.mp4', 'video/mp4'],
]);

function staticFile(pathname) {
  if (pathname.startsWith('/vendor/addons/')) {
    return localFile(resolve(modulesFolder, 'examples/jsm'), pathname.slice('/vendor/addons/'.length));
  }
  if (pathname.startsWith('/vendor/')) {
    return localFile(resolve(modulesFolder, 'build'), pathname.slice('/vendor/'.length));
  }
  if (pathname.startsWith('/src/')) {
    return localFile(resolve(folder, 'src'), pathname.slice('/src/'.length));
  }
  return localFile(publicFolder, pathname === '/' ? 'index.html' : pathname.slice(1));
}

function localFile(directory, name) {
  const filename = resolve(directory, name);
  const innerPath = relative(directory, filename);
  return innerPath.startsWith('..') || isAbsolute(innerPath) ? null : filename;
}

export async function startServer({ port = 4186, soundtrack } = {}) {
  const server = createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-cache');
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/soundtrack.wav' && soundtrack) {
        response.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': soundtrack.length });
        response.end(request.method === 'HEAD' ? undefined : soundtrack);
        return;
      }
      const filename = staticFile(pathname);
      const contentType = filename && staticTypes.get(extname(filename));
      if (!contentType) {
        response.writeHead(404).end('Not found');
        return;
      }
      const info = await stat(filename);
      if (!info.isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': contentType, 'Content-Length': info.size });
      if (request.method === 'HEAD') response.end();
      else createReadStream(filename).on('error', () => response.destroy()).pipe(response);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', ok);
  });
  return { server, url: 'http://127.0.0.1:' + server.address().port };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { url } = await startServer({ port: Number(process.env.PORT || 4186) });
    console.log('认知电梯 · ' + url);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
