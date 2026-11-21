import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import { handleVoice } from './voice.mjs';
import { narration } from './src/world-narration.js';

try {
  loadEnvFile(fileURLToPath(new URL('.env', import.meta.url)));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (process.env.MINIMAX_ENV_FILE) {
  const settings = parseEnv(await readFile(process.env.MINIMAX_ENV_FILE, 'utf8'));
  for (const name of ['MINIMAX_API_KEY', 'MINIMAX_BASE_URL', 'MINIMAX_MODEL', 'MINIMAX_VOICE_ID']) {
    if (settings[name]?.trim() && !process.env[name]?.trim()) process.env[name] = settings[name];
  }
}

const files = new Map([
  ['/', ['world.html', 'text/html']],
  ['/world.html', ['world.html', 'text/html']],
  ['/atlas', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/src/style.css', ['src/style.css', 'text/css']],
  ['/src/world.css', ['src/world.css', 'text/css']],
  ['/assets/audio/SOURCES.md', ['assets/audio/SOURCES.md', 'text/plain']],
  ['/assets/audio/manifest.json', ['assets/audio/manifest.json', 'application/json']],
  ...['river-calm', 'river-rapids', 'ocean-surf', 'wind'].map((name) => [
    `/assets/audio/${name}.ogg`, [`assets/audio/${name}.ogg`, 'audio/ogg'],
  ]),
  ['/vendor/three.module.js', ['node_modules/three/build/three.module.js', 'text/javascript']],
  ['/vendor/three.core.js', ['node_modules/three/build/three.core.js', 'text/javascript']],
  ['/vendor/OrbitControls.js', ['node_modules/three/examples/jsm/controls/OrbitControls.js', 'text/javascript']],
  ...['main', 'catalog', 'paint', 'rain', 'habitats', 'field-life', 'field-land',
    'world', 'world-terrain', 'world-water', 'world-ecology', 'world-station',
    'world-walk', 'world-collision', 'world-trail', 'world-underwater', 'world-hud',
    'world-biomes', 'world-extras', 'world-guide', 'world-narration', 'world-hero', 'world-character',
    'world-itinerary', 'world-journey', 'world-observe', 'world-audio', 'world-weather', 'world-puddles',
    'world-drainage', 'world-rain-environment', 'world-ground-memory', 'world-footprints', 'world-wildlife', 'world-tides', 'world-ambience',
    'world-flow', 'world-wetness', 'world-session', 'world-water-actions', 'world-footprint-aging'].map((name) => [
    `/src/${name}.js`, [`src/${name}.js`, 'text/javascript'],
  ]),
]);
const port = Number(process.argv[2] ?? 4197);

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/api/voice') {
    await handleVoice(request, response, narration);
    return;
  }
  const file = files.get(pathname);
  if (!file) {
    response.writeHead(404).end();
    return;
  }

  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    const recording = file[1] === 'audio/ogg';
    const etag = `"${createHash('sha256').update(body).digest('hex')}"`;
    const headers = { 'Content-Type': recording ? file[1] : `${file[1]}; charset=utf-8`, ETag: etag,
      'Cache-Control': recording ? 'public, max-age=86400, immutable' : 'no-cache' };
    if (request.headers['if-none-match'] === etag) { response.writeHead(304, headers).end(); return; }
    response.writeHead(200, { ...headers, 'Content-Length': body.length });
    response.end(body);
  } catch (error) {
    console.error(error.message);
    response.writeHead(500).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`地球里的小世界 http://127.0.0.1:${port}/`);
});
