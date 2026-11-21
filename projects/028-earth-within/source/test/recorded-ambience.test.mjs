import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { AMBIENCE_RECORDINGS, createRecordedAmbience, recordingMix } from '../src/world-ambience.js';
import { createWorldAudio } from '../src/world-audio.js';
import { groundSurfaceHeight, riverSurfaceHeight, riverZ, coastlineX } from '../src/world-terrain.js';
import { PerspectiveCamera } from 'three';

function audioHarness() {
  const sources = [], nodes = [], statuses = [], downloads = [];
  class Parameter {
    value = 0; targets = [];
    setTargetAtTime(value, now, seconds) {
      assert.ok(Number.isFinite(value));
      this.value = value; this.targets.push({ value, now, seconds });
    }
    setValueAtTime(value) { this.value = value; }
    exponentialRampToValueAtTime(value) { this.value = value; }
  }
  class Node {
    connections = []; stopped = false; disconnected = false;
    gain = new Parameter(); frequency = new Parameter(); Q = new Parameter();
    positionX = new Parameter(); positionY = new Parameter(); positionZ = new Parameter();
    playbackRate = { value: 1 };
    constructor() {
      for (const name of ['threshold', 'knee', 'ratio', 'attack', 'release', 'detune']) this[name] = new Parameter();
      nodes.push(this);
    }
    connect(node) { this.connections.push(node); }
    disconnect() { this.disconnected = true; }
    start(when, offset) { this.started = { when, offset }; }
    stop() { this.stopped = true; }
    setPosition(x, y, z) { this.point = { x, y, z }; }
  }
  const context = { currentTime: 1, sampleRate: 2000, state: 'running', listener: { setPosition() {}, setOrientation() {} },
    createGain: () => new Node(), createBiquadFilter: () => new Node(),
    createPanner: () => new Node(), createBufferSource() { const source = new Node(); sources.push(source); return source; },
    createOscillator: () => new Node(), createDynamicsCompressor: () => new Node(),
    createBuffer: (_channels, length, rate) => ({ duration: length / rate, getChannelData: () => new Float32Array(length) }),
    resume() { this.state = 'running'; return Promise.resolve(); },
    suspend() { this.state = 'suspended'; return Promise.resolve(); },
    close() { this.state = 'closed'; return Promise.resolve(); },
    async decodeAudioData(data) { return { duration: 28, decoded: data }; },
  };
  const fetchAudio = async (url) => { downloads.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) }; };
  return { context, nodes, sources, statuses, downloads, fetchAudio, onStatus: (state) => statuses.push(state) };
}

test('four distinct local field recordings match their licensed manifest and audio hashes', async () => {
  const root = new URL('../assets/audio/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
  assert.equal(manifest.license, 'CC0-1.0');
  assert.equal(manifest.recordings.length, 4);
  const hashes = new Set();
  for (const recording of AMBIENCE_RECORDINGS) {
    const filename = recording.url.split('/').at(-1).split('?')[0];
    const details = manifest.recordings.find((item) => item.file === filename);
    const data = await readFile(new URL(filename, root));
    assert.equal(data.subarray(0, 4).toString(), 'OggS');
    const hash = createHash('sha256').update(data).digest('hex');
    assert.equal(hash, details.sha256);
    assert.equal(data.length, details.bytes);
    assert.ok(details.duration >= 18 && details.duration <= 70);
    assert.equal(details.sampleRate, 48000); assert.equal(details.channels, 2);
    assert.ok(details.rmsDbfs > -35 && details.rmsDbfs < -20);
    assert.ok(details.peakDbfs < -1);
    assert.ok(details.source.startsWith('https://freesound.org/people/'));
    hashes.add(hash);
  }
  assert.equal(hashes.size, 4, 'each ambience uses its own real recording');
});

test('distance, turbulence, weather, shelter and submersion smoothly mix separate recordings', () => {
  const point = { riverDistance: 2, rapidDistance: 2, flowSpeed: .9, rapid: 0, coastDistance: 80 };
  const calm = recordingMix(point), rapids = recordingMix({ ...point, rapid: 1 });
  assert.ok(calm.calm > .2 && calm.rapids === 0 && calm.surf === 0);
  assert.ok(rapids.rapids > .6 && rapids.calm < calm.calm * .4);
  const tidal = recordingMix({ ...point, flowSpeed: 2 });
  assert.equal(tidal.rapids, 0, 'smooth tidal flow does not turn into roaring rapids');
  const remote = recordingMix({ ...point, riverDistance: 80, rapidDistance: 80, rapid: 1 });
  assert.equal(remote.calm, 0); assert.equal(remote.rapids, 0);
  const coast = recordingMix({ ...point, coastDistance: 2 });
  assert.ok(coast.surf > .4);
  assert.ok(recordingMix({ ...point, rain: 1 }).wind > calm.wind * 3);
  assert.ok(recordingMix({ ...point, altitude: 40 }).wind > calm.wind * 3);
  const roof = recordingMix({ ...point, cover: 'roof' });
  const deep = recordingMix({ ...point, submerged: 1 });
  assert.ok(roof.wind < calm.wind * .2 && roof.calm < calm.calm * .5);
  assert.ok(deep.calm < calm.calm * .15 && deep.wind < calm.wind * .03);
  const distantRapid = recordingMix({ ...point, rapid: 1, calmTurbulence: 0, rapidDistance: 45 });
  assert.equal(distantRapid.calm, calm.calm, 'a distant waterfall does not suppress nearby gentle water');
  let previous = calm;
  for (let i = 1; i <= 200; i++) {
    const next = recordingMix({ ...point, rapid: i / 200 });
    assert.ok(next.rapids >= previous.rapids && next.calm <= previous.calm);
    assert.ok(Math.abs(next.rapids - previous.rapids) < .05);
    previous = next;
  }
});

test('recordings load once, fade to the latest mix, keep natural pitch and release all nodes', async () => {
  const h = audioHarness();
  const player = createRecordedAmbience(h.context, {}, h);
  player.update({ calm: .3, rapids: .6, wind: .1, surf: .4 }, { calm: { x: 1, y: 2, z: 3 } });
  await Promise.all([player.load(), player.load(), player.load()]);
  assert.equal(h.downloads.length, 4); assert.equal(h.sources.length, 4);
  assert.equal(player.state.ready, 4); assert.equal(player.state.mode, 'recorded');
  assert.deepEqual(player.state.failed, []);
  for (const source of h.sources) {
    assert.equal(source.loop, true); assert.equal(source.playbackRate.value, 1);
    assert.ok(source.started.offset >= 0 && source.started.offset < source.buffer.duration);
    const gain = source.connections[0].connections[0].gain;
    assert.ok(gain.targets.at(-1).seconds >= 1);
  }
  await player.load(); assert.equal(h.downloads.length, 4);
  player.update({ calm: 0, rapids: 0, wind: 0, surf: 0 }, {}, { cover: 'roof', riverDistance: 40 });
  for (const source of h.sources) assert.equal(source.connections[0].connections[0].gain.value, 0);
  player.dispose();
  assert.ok(h.sources.every((source) => source.stopped && source.disconnected));
  assert.ok(h.nodes.every((node) => node.disconnected));
});

test('a missing recording is reported and only that recording retries, with no substitute noise', async () => {
  const h = audioHarness(); let fail = true;
  const fetchAudio = async (url) => {
    h.downloads.push(url);
    return { ok: !(fail && url.includes('river-calm')), status: 503, arrayBuffer: async () => new ArrayBuffer(10) };
  };
  const player = createRecordedAmbience(h.context, {}, { ...h, fetchAudio });
  await player.load();
  assert.equal(player.state.mode, 'partial'); assert.equal(player.state.ready, 3);
  assert.deepEqual(player.state.failed, ['calm']); assert.equal(h.sources.length, 3);
  fail = false; await player.load();
  assert.equal(h.downloads.length, 5); assert.equal(h.sources.length, 4);
  assert.equal(player.state.mode, 'recorded'); assert.deepEqual(player.state.failed, []);
  player.dispose();
});

test('leaving a page during asynchronous loading cannot start late audio sources', async () => {
  const h = audioHarness(), responses = [];
  const player = createRecordedAmbience(h.context, {}, { ...h,
    fetchAudio: () => new Promise((resolve) => responses.push(resolve)),
  });
  const pending = player.load(); player.dispose();
  const reports = h.statuses.length;
  responses.forEach((resolve) => resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(10) }));
  await pending;
  assert.equal(h.sources.length, 0); assert.equal(h.statuses.length, reports);
});

test('the world selects real river, rapid, sea and wind tracks and shares mute, narration and tab suspension', async () => {
  const h = audioHarness();
  const page = new EventTarget(); page.hidden = false;
  globalThis.document = page;
  globalThis.window = { AudioContext: class { constructor() { return h.context; } } };
  let ready;
  const loaded = new Promise((resolve) => { ready = resolve; });
  const audio = createWorldAudio({ fetchAudio: h.fetchAudio,
    onRecordingStatus(status) { if (status.ready === 4) ready(); },
  });
  await audio.unlock(); await loaded;
  const tracks = h.sources.filter((source) => source.buffer?.decoded);
  assert.equal(tracks.length, 4);
  const level = (id) => tracks[AMBIENCE_RECORDINGS.findIndex((track) => track.id === id)].connections[0].connections[0].gain.value;
  const listener = new PerspectiveCamera();
  function update(x, y, z, options = {}) {
    listener.position.set(x, y, z);
    audio.update(.1, { listener, footContacts: [], ...options });
  }
  update(0, riverSurfaceHeight(0) + 2, riverZ(0) + 3.4);
  assert.ok(level('calm') > .2);
  const calmRapid = level('rapids');
  update(-65, riverSurfaceHeight(-65) + 2, riverZ(-65) + 2.5);
  assert.ok(level('rapids') > calmRapid + .2);
  update(coastlineX(38), 2, 38);
  assert.ok(level('surf') > .35);
  const coastWind = level('wind');
  update(-100, groundSurfaceHeight(-100, -30) + 2, -30);
  assert.ok(level('wind') > coastWind * 2);
  update(coastlineX(38), 2, 38, { rain: 1 });
  assert.ok(level('wind') > coastWind * 3);
  const master = h.nodes[0].gain;
  const beforeEntry = h.sources.length;
  update(70, 2, 45, { waterEvents: [{ kind: 'entry', x: 70, y: 0, z: 45, strength: .8 }] });
  assert.equal(h.sources.length, beforeEntry + 2, 'water entry has a splash and low impact at the event location');
  update(70, 2, 45, { waterEvents: [] });
  assert.equal(h.sources.length, beforeEntry + 2, 'an event is not repeated on subsequent frames');
  audio.setEnabled(false);
  update(70, 2, 45, { waterEvents: [{ kind: 'play', x: 70, y: 0, z: 45, strength: .5 }] });
  assert.equal(h.sources.length, beforeEntry + 2, 'muting includes the new interaction sounds');
  audio.setEnabled(true);
  audio.setVolume(.6); audio.setNarrating(true);
  assert.ok(Math.abs(master.value - .6 * .27) < 1e-8);
  audio.setNarrating(false); audio.setEnabled(false); assert.equal(master.value, 0);
  audio.setEnabled(true); assert.equal(master.value, .6);
  page.hidden = true; page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.context.state, 'suspended'); assert.equal(master.value, 0);
  page.hidden = false; page.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(h.context.state, 'running'); assert.equal(h.downloads.length, 4);
  page.hidden = true; page.dispatchEvent(new Event('visibilitychange')); audio.setEnabled(false);
  page.hidden = false; page.dispatchEvent(new Event('visibilitychange')); await Promise.resolve();
  assert.equal(h.context.state, 'suspended', 'muted ambience does not resume on its own');
  audio.setEnabled(true); await audio.unlock();
  const resume = h.context.resume;
  page.hidden = true; page.dispatchEvent(new Event('visibilitychange'));
  h.context.resume = () => Promise.reject(new Error('gesture required'));
  page.hidden = false; page.dispatchEvent(new Event('visibilitychange'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(h.context.state, 'suspended', 'a browser refusal remains recoverable with the sound button');
  h.context.resume = resume; await audio.unlock();
  assert.equal(h.context.state, 'running'); assert.equal(h.downloads.length, 4);
  audio.dispose(); assert.equal(h.context.state, 'closed');
  assert.ok(tracks.every((source) => source.stopped));
});
