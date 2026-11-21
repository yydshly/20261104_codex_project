import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Offline extraction only. No requests to MiniMax and no credential output.
const project = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[2] || join(project, 'source'));
const settings = { ...process.env };
const env = parseEnv(await readFile(join(source, '.env'), 'utf8').catch(() => ''));
for (const [key, value] of Object.entries(env)) if (!settings[key]) settings[key] = value;
if (settings.MINIMAX_ENV_FILE) {
  const external = parseEnv(await readFile(resolve(source, settings.MINIMAX_ENV_FILE), 'utf8'));
  for (const [key, value] of Object.entries(external)) if (!settings[key]) settings[key] = value;
}
const model = settings.MINIMAX_MODEL?.trim() || 'speech-2.8-hd';
const voice = settings.MINIMAX_VOICE_ID?.trim() || 'male-qn-jingying';
const endpoint = new URL(settings.MINIMAX_BASE_URL?.trim() || 'https://api.minimax.cn/v1');
assert(!endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash);
endpoint.pathname = `${endpoint.pathname.replace(/\/+$/, '').replace(/\/t2a_v2$/, '')}/t2a_v2`;
const { narration } = await import(pathToFileURL(join(source, 'src/world-narration.js')));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const output = join(project, 'assets/narration');
await mkdir(output, { recursive: true });
const manifest = { provider: 'MiniMax', model, voice, mode: 'published-recordings', exported: '2026-11-21', clips: {} };
for (const [id, text] of Object.entries(narration)) {
  const body = { model, text, stream: false, language_boost: 'Chinese', output_format: 'hex',
    voice_setting: { voice_id: voice, speed: .95, vol: 1, pitch: 0 },
    audio_setting: { format: 'mp3', sample_rate: 32000, bitrate: 128000, channel: 1 } };
  const key = sha(JSON.stringify([1, endpoint.href, body]));
  const entry = await readFile(join(source, '.cache/minimax', `${key}.clip`));
  assert.equal(entry.subarray(0, 8).toString(), 'EWVOICE1', `Cache format: ${id}`);
  const audio = entry.subarray(44);
  assert.equal(entry.readUInt32BE(8), audio.length, `Cache length: ${id}`);
  assert.equal(entry.subarray(12, 44).toString('hex'), sha(audio), `Cache checksum: ${id}`);
  assert(audio.length > 1000 && audio.length < 2 * 1024 * 1024, `MP3 length: ${id}`);
  assert(audio.subarray(0, 3).toString() === 'ID3' || (audio[0] === 255 && (audio[1] & 224) === 224), `MP3 header: ${id}`);
  await writeFile(join(output, `${id}.mp3`), audio);
  manifest.clips[id] = { file: `${id}.mp3`, textSha256: sha(text), sha256: sha(audio), bytes: audio.length };
}
await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ clips: Object.keys(manifest.clips).length, source: 'verified existing cache', generated: 0, credentialsPublished: false }));
