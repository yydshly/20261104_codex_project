const ROOT = './assets/forged/sfx/';
const EVENTS = { swing: 'swing', hit: 'hit', guard: 'guard', pickup: 'pickup', dash: 'dash', pulse: 'pulse', defeat: 'defeat', damage: 'damage', warning: 'warning', fire: 'guard', won: 'beacon', 'chapter-clear': 'beacon' };
const VOLUME = { swing: 0.18, hit: 0.3, guard: 0.16, pickup: 0.22, dash: 0.18, pulse: 0.38, defeat: 0.3, damage: 0.28, warning: 0.12, beacon: 0.3 };
const names = [...new Set(Object.values(EVENTS))];
const files = Promise.all(names.map(async name => {
  const response = await fetch(`${ROOT}sfx-${name}.wav`);
  if (!response.ok) throw new Error(`Sound asset ${name} ${response.status}`);
  return [name, await response.arrayBuffer()];
}));
let context;
let output;
let capture;
let recorder;
let chunks = [];
let buffers = new Map();
let count = 0;
let voices = 0;
let error = null;
files.catch(reason => { error = String(reason); });

export function connectAudio(audioContext) {
  if (context) return output;
  context = audioContext;
  output = context.createGain();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.ratio.value = 8;
  output.connect(compressor); compressor.connect(context.destination);
  capture = context.createMediaStreamDestination();
  compressor.connect(capture);
  files.then(async entries => {
    buffers = new Map(await Promise.all(entries.map(async ([name, data]) => [name, await context.decodeAudioData(data)])));
  }).catch(reason => { error = String(reason); });
  return output;
}

export function playAssetSound(event, x, enabled) {
  const name = EVENTS[event];
  const buffer = buffers.get(name);
  if (!enabled || !buffer || !context || context.state !== 'running' || voices >= 16) return false;
  const source = context.createBufferSource();
  const gain = context.createGain();
  const pan = context.createStereoPanner();
  gain.gain.value = VOLUME[name] || 0.2;
  pan.pan.value = Math.max(-0.55, Math.min(0.55, (x || 0) / 12));
  source.buffer = buffer;
  source.connect(gain); gain.connect(pan); pan.connect(output);
  source.onended = () => { source.disconnect(); gain.disconnect(); pan.disconnect(); voices--; };
  voices++; count++; source.start();
  return true;
}
export function beginCapture() {
  if (!capture) throw new Error('Audio must be unlocked by a user gesture first');
  chunks = [];
  recorder = new MediaRecorder(capture.stream, { mimeType: 'audio/webm;codecs=opus' });
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  recorder.start();
}
export async function endCapture() {
  if (!recorder || recorder.state === 'inactive') return null;
  await new Promise(resolve => { recorder.onstop = resolve; recorder.stop(); });
  const blob = new Blob(chunks, { type: 'audio/webm' });
  return new Promise(resolve => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(blob);
  });
}
export function soundMetrics() { return { decodedSounds: buffers.size, assetSoundEvents: count, voices, error }; }
