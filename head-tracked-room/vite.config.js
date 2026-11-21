import { createReadStream, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const localModel = new URL('./.local-assets/kizunaai/', import.meta.url);
const files = new Set(['kizunaai.pmx', 'bottoms.png', 'eye.png', 'eye2.png',
  'face.png', 'hair1.png', 'hair2.png', 'tops.png']);
const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

// Keep the official model in this local workspace and out of the build.
// The development and preview servers are both configured for loopback.
function serveLocalFigure(server) {
  server.middlewares.use('/local-reference', (req, res, next) => {
    const name = req.url?.split('?')[0].slice(1);
    if (!['GET', 'HEAD'].includes(req.method) || !files.has(name)) return next();
    if (!loopback.has(req.socket.remoteAddress)) {
      res.statusCode = 403;
      res.end();
      return;
    }
    const path = fileURLToPath(new URL(name, localModel));
    if (!existsSync(path)) {
      res.statusCode = 404;
      res.end('Local reference figure is not installed');
      return;
    }
    res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : 'application/octet-stream');
    if (req.method === 'HEAD') return res.end();
    createReadStream(path).on('error', () => res.destroy()).pipe(res);
  });
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
        research: fileURLToPath(new URL('./research.html', import.meta.url)),
      },
    },
  },
  plugins: [{
    name: 'local-reference-figure',
    configureServer: serveLocalFigure,
    configurePreviewServer: serveLocalFigure,
  }],
});
