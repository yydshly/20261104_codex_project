import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, rename, unlink, writeFile } from 'node:fs/promises';

const defaultBase = 'https://api.minimax.cn/v1';
const maxRequestBytes = 1024;
const maxAudioBytes = 2 * 1024 * 1024;
const maxUpstreamBytes = maxAudioBytes * 2 + 16 * 1024;
const maxCachedClips = 24;
const maxCachedBytes = 12 * 1024 * 1024;
const maxPendingClips = 4;
const loopback = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const cacheDirectory = new URL('.cache/minimax/', import.meta.url);
const cacheVersion = 1;
const cacheMagic = Buffer.from('EWVOICE1');
const cacheHeaderBytes = cacheMagic.length + 4 + 32;

const clips = new Map();
const pending = new Map();
let cachedBytes = 0;

function voiceConfig() {
  const key = process.env.MINIMAX_API_KEY?.trim();
  if (!key) return null;

  try {
    const url = new URL(process.env.MINIMAX_BASE_URL?.trim() || defaultBase);
    const secure = url.protocol === 'https:' || (url.protocol === 'http:' && loopback.test(url.host));
    if (!secure || url.username || url.password || url.search || url.hash) return null;
    url.pathname = `${url.pathname.replace(/\/+$/, '').replace(/\/t2a_v2$/, '')}/t2a_v2`;
    return {
      key,
      url,
      voice: process.env.MINIMAX_VOICE_ID?.trim() || 'male-qn-jingying',
      model: process.env.MINIMAX_MODEL?.trim() || 'speech-2.8-hd',
    };
  } catch {
    return null;
  }
}

function isSameOrigin(headers) {
  const { host, origin, 'sec-fetch-site': fetchSite } = headers;
  return loopback.test(host ?? '')
    && (!origin || origin === `http://${host}`)
    && (!fetchSite || fetchSite === 'same-origin' || fetchSite === 'none');
}

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readVoiceId(request) {
  if (Number(request.headers['content-length']) > maxRequestBytes) return { tooLarge: true };

  const chunks = [];
  let bytes = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > maxRequestBytes) return { tooLarge: true };
    chunks.push(chunk);
  }

  const value = JSON.parse(Buffer.concat(chunks, bytes).toString('utf8'));
  if (!value || typeof value.id !== 'string' || !/^[a-z0-9-]{1,48}$/.test(value.id)
    || Object.keys(value).length !== 1) return {};
  return { id: value.id };
}

function speechRequest(config, narration) {
  return {
    model: config.model,
    text: narration,
    stream: false,
    language_boost: 'Chinese',
    output_format: 'hex',
    voice_setting: { voice_id: config.voice, speed: .95, vol: 1, pitch: 0 },
    audio_setting: { format: 'mp3', sample_rate: 32000, bitrate: 128000, channel: 1 },
  };
}

function validMp3(audio) {
  if (audio.length < 8 || audio.length > maxAudioBytes) return false;
  let offset = 0;
  if (audio.subarray(0, 3).toString('ascii') === 'ID3') {
    if (audio.length < 10 || audio.subarray(6, 10).some((byte) => byte > 127)) return false;
    const tagSize = audio[6] * 2097152 + audio[7] * 16384 + audio[8] * 128 + audio[9];
    offset = 10 + tagSize + (audio[3] === 4 && audio[5] & 16 ? 10 : 0);
  }
  let frames = 0;
  while (offset + 4 <= audio.length) {
    if (audio.length - offset === 128 && audio.subarray(offset, offset + 3).toString('ascii') === 'TAG') {
      return frames >= 2;
    }
    const header = audio.readUInt32BE(offset);
    const version = header >>> 19 & 3;
    const layer = header >>> 17 & 3;
    const bitrateIndex = header >>> 12 & 15;
    const sampleIndex = header >>> 10 & 3;
    if (header >>> 21 !== 2047 || version === 1 || layer !== 1
      || bitrateIndex === 0 || bitrateIndex === 15 || sampleIndex === 3) return false;
    const bitrates = version === 3
      ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
      : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
    const sampleRate = [44100, 48000, 32000][sampleIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const frameBytes = Math.floor((version === 3 ? 144000 : 72000) * bitrates[bitrateIndex] / sampleRate)
      + (header >>> 9 & 1);
    offset += frameBytes;
    frames++;
  }
  return offset === audio.length && frames >= 2;
}

async function readCachedAudio(key) {
  let file;
  try {
    file = await open(new URL(`${key}.clip`, cacheDirectory), 'r');
    const stat = await file.stat();
    if (stat.size <= cacheHeaderBytes || stat.size > cacheHeaderBytes + maxAudioBytes) return null;
    const entry = await file.readFile();
    if (!entry.subarray(0, cacheMagic.length).equals(cacheMagic)) return null;
    const size = entry.readUInt32BE(cacheMagic.length);
    const audio = entry.subarray(cacheHeaderBytes);
    if (audio.length !== size || !validMp3(audio)) return null;
    const digest = createHash('sha256').update(audio).digest();
    return digest.equals(entry.subarray(cacheMagic.length + 4, cacheHeaderBytes)) ? audio : null;
  } catch {
    return null;
  } finally {
    await file?.close();
  }
}

async function writeCachedAudio(key, audio) {
  const header = Buffer.alloc(cacheHeaderBytes);
  cacheMagic.copy(header);
  header.writeUInt32BE(audio.length, cacheMagic.length);
  createHash('sha256').update(audio).digest().copy(header, cacheMagic.length + 4);
  const temporary = new URL(`${key}.${process.pid}.${randomUUID()}.tmp`, cacheDirectory);
  try {
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(temporary, Buffer.concat([header, audio]), { flag: 'wx' });
    await rename(temporary, new URL(`${key}.clip`, cacheDirectory));
    return true;
  } catch {
    console.warn('MiniMax audio is available, but its persistent cache could not be saved.');
    return false;
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

async function requestAudio(config, body) {
  const result = await fetch(config.url, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(16_000),
    headers: {
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!result.ok || !result.body || Number(result.headers.get('content-length')) > maxUpstreamBytes) {
    await result.body?.cancel();
    throw new Error('Voice request failed');
  }

  const chunks = [];
  let bytes = 0;
  for await (const chunk of result.body) {
    bytes += chunk.length;
    if (bytes > maxUpstreamBytes) throw new Error('Voice response exceeds limit');
    chunks.push(chunk);
  }

  const payload = JSON.parse(Buffer.concat(chunks, bytes).toString('utf8'));
  const hex = payload?.data?.audio;
  if (payload?.base_resp?.status_code !== 0 || payload?.data?.status !== 2 || typeof hex !== 'string'
    || !hex.length || hex.length > maxAudioBytes * 2 || hex.length % 2 !== 0 || /[^\da-f]/i.test(hex)) {
    throw new Error('Voice response is invalid');
  }
  const audio = Buffer.from(hex, 'hex');
  if (!validMp3(audio)) throw new Error('Voice audio is invalid');
  return audio;
}

function remember(key, bytes) {
  clips.set(key, bytes);
  cachedBytes += bytes.length;
  while (clips.size > maxCachedClips || cachedBytes > maxCachedBytes) {
    const oldest = clips.keys().next().value;
    cachedBytes -= clips.get(oldest).length;
    clips.delete(oldest);
  }
}

function audioFor(config, narration) {
  const body = speechRequest(config, narration);
  const key = createHash('sha256').update(JSON.stringify([cacheVersion, config.url.href, body])).digest('hex');
  const cached = clips.get(key);
  if (cached) {
    clips.delete(key);
    clips.set(key, cached);
    return { audio: cached, cache: 'memory' };
  }
  if (pending.has(key)) return pending.get(key);
  if (pending.size >= maxPendingClips) return null;

  const clip = (async () => {
    let audio = await readCachedAudio(key);
    let cache = 'disk';
    if (!audio) {
      audio = await requestAudio(config, body);
      cache = await writeCachedAudio(key, audio) ? 'generated' : 'generated-memory';
    }
    remember(key, audio);
    return { audio, cache };
  })().finally(() => pending.delete(key));
  pending.set(key, clip);
  return clip;
}

export async function handleVoice(request, response, narrationTexts) {
  if (!isSameOrigin(request.headers)) return json(response, 403, { error: 'origin' });
  const config = voiceConfig();
  if (request.method === 'GET') return json(response, 200, { available: Boolean(config) });
  if (request.method !== 'POST') return json(response, 405, { error: 'method' }, { Allow: 'GET, POST' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] ?? '')) {
    return json(response, 415, { error: 'content_type' });
  }

  let id;
  try {
    const parsed = await readVoiceId(request);
    if (parsed.tooLarge) {
      request.resume();
      return json(response, 413, { error: 'size' });
    }
    id = parsed.id;
  } catch {
    return json(response, 400, { error: 'id' });
  }
  if (!id) return json(response, 400, { error: 'id' });

  const narration = narrationTexts instanceof Map ? narrationTexts.get(id)
    : Object.hasOwn(narrationTexts, id) ? narrationTexts[id] : undefined;
  if (typeof narration !== 'string' || !narration.trim() || narration.length > 600) {
    return json(response, 404, { error: 'scene' });
  }
  if (!config) return json(response, 503, { error: 'unconfigured' });

  try {
    const clip = await audioFor(config, narration);
    if (!clip) return json(response, 429, { error: 'busy' }, { 'Retry-After': '2' });
    const { audio, cache } = clip;
    response.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length,
      'Cache-Control': 'no-store',
      'X-Voice-Cache': cache,
    });
    response.end(audio);
  } catch {
    if (!response.destroyed) json(response, 502, { error: 'voice_unavailable' });
  }
}
