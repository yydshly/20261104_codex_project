const clamp = (value, low, high) => Math.max(low, Math.min(high, Number.isFinite(value) ? value : low));
const assets = {
  water: new URL('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/water-stream-loop.wav', import.meta.url),
  nature: new URL('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/pond-night-loop.wav', import.meta.url),
  duck: new URL('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/duck-quack.wav', import.meta.url),
};

/** Shared soundtrack for the pond. No audio context or network request exists before opt-in. */
export function createPondAudio({ onState = () => {} } = {}) {
  const options = { phase: 'dusk', volume: .28, wind: .25, ambience: 1, effects: 1 };
  const state = { enabled: false, paused: false, ready: false, disposed: false };
  const buffers = new Map(), voices = new Set(), cooldowns = new Map();
  let context, master, ambienceBus, effectsBus, windGain, waterGain, natureGain;
  let compressor, loadPromise, epoch = 0, desired = false;
  const loops = [];

  function notify(error) { onState({ ...state, ...(error ? { error: error.message || String(error) } : {}) }); }
  function gainTo(param, value, duration = .25) {
    const time = context.currentTime;
    param.cancelScheduledValues(time);
    param.setValueAtTime(param.value, time);
    param.linearRampToValueAtTime(value, time + duration);
  }
  function mute() { if (master) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setValueAtTime(0, context.currentTime); } }
  function stopVoices() {
    for (const voice of voices) { try { voice.source.stop(); } catch {} voice.cleanup(); }
    voices.clear();
  }
  function noiseBuffer(seconds, brown = false) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate);
    const data = buffer.getChannelData(0); let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + .025 * white) / 1.025;
      data[i] = brown ? last * 3.2 : white;
    }
    // A short wrap blend prevents a discontinuity in the continuous wind bed.
    if (brown) {
      const size = Math.min(2048, Math.floor(data.length / 4));
      for (let i = 0; i < size; i++) {
        const t = i / (size - 1);
        data[data.length - size + i] = data[data.length - size + i] * (1 - t) + data[0] * t;
      }
    }
    return buffer;
  }
  function ensureContext() {
    if (context) return;
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) throw new Error('浏览器不支持 Web Audio');
    context = new Audio({ latencyHint: 'interactive' });
    master = context.createGain(); master.gain.value = 0;
    ambienceBus = context.createGain(); effectsBus = context.createGain();
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -14; compressor.knee.value = 12;
    compressor.ratio.value = 3; compressor.attack.value = .008; compressor.release.value = .22;
    ambienceBus.connect(master); effectsBus.connect(master);
    master.connect(compressor); compressor.connect(context.destination);
    buffers.set('noise', noiseBuffer(2)); buffers.set('wind', noiseBuffer(5, true));
  }
  async function load() {
    if (!loadPromise) loadPromise = Promise.all(Object.entries(assets).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`声音素材载入失败（${key}）`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (!state.disposed) buffers.set(key, buffer);
    })).catch(error => { loadPromise = null; throw error; });
    await loadPromise;
  }
  function startLoops() {
    if (loops.length) return;
    for (const key of ['water', 'nature', 'wind']) {
      const source = context.createBufferSource(); source.buffer = buffers.get(key); source.loop = true;
      const gain = context.createGain(); gain.gain.value = 0;
      if (key === 'wind') {
        const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1100; filter.Q.value = .45;
        source.connect(filter); filter.connect(gain); loops.push({ source, nodes: [filter, gain] }); windGain = gain;
      } else {
        source.connect(gain); loops.push({ source, nodes: [gain] });
        if (key === 'water') waterGain = gain; else natureGain = gain;
      }
      gain.connect(ambienceBus); source.start();
    }
  }
  function mix(duration = .6) {
    if (!context || !state.ready) return;
    const night = options.phase === 'night';
    gainTo(master.gain, desired && !state.paused ? options.volume * .65 : 0, duration);
    gainTo(ambienceBus.gain, options.ambience, duration);
    gainTo(effectsBus.gain, options.effects, duration);
    gainTo(waterGain.gain, night ? .40 : .61, duration);
    gainTo(natureGain.gain, night ? .70 : .18, duration);
    gainTo(windGain.gain, .014 + options.wind * .12, Math.max(duration, .7));
  }
  async function activate(token) {
    try {
      ensureContext();
      // Call resume before awaiting downloads so it remains associated with the user gesture.
      const resumed = context.resume();
      await Promise.all([load(), resumed]);
      if (token !== epoch || !desired || state.paused || state.disposed) {
        if ((!desired || state.paused) && context.state !== 'closed') await context.suspend();
        return { ...state };
      }
      if (context.state !== 'running') throw new Error('声音未获浏览器允许，请再次点击开启');
      startLoops(); state.ready = true; state.enabled = true; mix(); notify();
      return { ...state };
    } catch (error) {
      if (token !== epoch || state.disposed) return { ...state };
      desired = false; state.enabled = false; mute(); stopVoices();
      if (context && context.state !== 'closed') await context.suspend().catch(() => {});
      notify(error); throw error;
    }
  }
  async function setEnabled(enabled) {
    if (state.disposed) return { ...state };
    const token = ++epoch; desired = Boolean(enabled);
    if (!desired) {
      state.enabled = false; mute(); stopVoices();
      if (context && context.state !== 'closed') await context.suspend().catch(() => {});
      if (token === epoch) notify();
      return { ...state };
    }
    if (state.paused) { state.enabled = true; notify(); return { ...state }; }
    return activate(token);
  }
  function setOptions(next = {}) {
    if (next.phase !== undefined) options.phase = next.phase === 'night' ? 'night' : 'dusk';
    for (const key of ['volume', 'wind', 'ambience', 'effects']) if (next[key] !== undefined) options[key] = clamp(next[key], 0, 1);
    mix();
  }
  function sound(source, { x, gain, duration, delay = 0, filter = null, attack = .008, hold = false }) {
    const now = context.currentTime + delay;
    const envelope = context.createGain(), pan = context.createStereoPanner();
    pan.pan.value = clamp(x * 2 - 1, -1, 1) * .72;
    const nodes = [envelope, pan];
    if (filter) { source.connect(filter); filter.connect(envelope); nodes.push(filter); } else source.connect(envelope);
    envelope.connect(pan); pan.connect(effectsBus);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + attack);
    if (hold) envelope.gain.setValueAtTime(gain, now + Math.max(attack, duration - .055));
    envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
    const voice = { source, cleanup() { source.disconnect(); for (const node of nodes) node.disconnect(); voices.delete(voice); } };
    voices.add(voice); source.onended = voice.cleanup;
    source.start(now); source.stop(now + duration + .03);
  }
  function splash(x, strength, delay = 0) {
    const noise = context.createBufferSource(); noise.buffer = buffers.get('noise');
    const filter = context.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1150 + strength * 800; filter.Q.value = .55;
    sound(noise, { x, gain: .12 * strength, duration: .28, delay, filter });
    const droplet = context.createOscillator(); droplet.type = 'sine';
    droplet.frequency.setValueAtTime(840, context.currentTime + delay);
    droplet.frequency.exponentialRampToValueAtTime(270, context.currentTime + delay + .13);
    sound(droplet, { x, gain: .085 * strength, duration: .19, delay: delay + .012 });
  }
  function trigger(type, { x = .5, strength = 1 } = {}) {
    if (!desired || !state.enabled || state.paused || state.disposed || context?.state !== 'running' || options.effects === 0 || options.volume === 0) return false;
    const intervals = { duck: 1.15, splash: .11, feed: .45, wind: 1.6 };
    if (!(type in intervals)) return false;
    const now = context.currentTime;
    if (now - (cooldowns.get(type) ?? -Infinity) < intervals[type] || voices.size > 20) return false;
    cooldowns.set(type, now); x = clamp(x, 0, 1); strength = clamp(strength, .05, 1);
    if (type === 'duck') {
      const source = context.createBufferSource(); source.buffer = buffers.get('duck');
      source.playbackRate.value = .96 + Math.random() * .08;
      sound(source, { x, gain: .57 * strength, duration: source.buffer.duration / source.playbackRate.value, attack: .012, hold: true });
    } else if (type === 'splash') splash(x, strength);
    else if (type === 'feed') { splash(x, strength * .38); splash(x + .025, strength * .27, .10); splash(x - .02, strength * .2, .21); }
    else {
      const source = context.createBufferSource(); source.buffer = buffers.get('wind');
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1400; filter.Q.value = .5;
      sound(source, { x, gain: .24 * strength, duration: 2.4, filter, attack: .65 });
    }
    return true;
  }
  async function pause() {
    if (state.disposed) return;
    ++epoch; state.paused = true; mute(); stopVoices();
    if (context && context.state !== 'closed') await context.suspend().catch(() => {});
    notify();
  }
  async function resume() {
    if (state.disposed) return { ...state };
    state.paused = false;
    if (!desired) { notify(); return { ...state }; }
    return activate(++epoch);
  }
  function dispose() {
    if (state.disposed) return;
    ++epoch; desired = false; state.disposed = true; state.enabled = false; mute(); stopVoices();
    for (const loop of loops) { try { loop.source.stop(); } catch {} loop.source.disconnect(); loop.nodes.forEach(node => node.disconnect()); }
    loops.length = 0; buffers.clear();
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }
  return { setEnabled, setOptions, trigger, pause, resume, dispose, getState: () => ({ ...state, ...options }) };
}
