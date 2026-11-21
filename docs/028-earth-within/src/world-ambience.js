import { MathUtils } from 'three';

const recordingVersion = 'field-20261113-1';
export const AMBIENCE_RECORDINGS = Object.freeze([
  { id: 'calm', label: '平缓河流', url: new URL('../assets/audio/river-calm.ogg', import.meta.url).href, spatial: true },
  { id: 'rapids', label: '急流', url: new URL('../assets/audio/river-rapids.ogg', import.meta.url).href, spatial: true },
  { id: 'surf', label: '海浪', url: new URL('../assets/audio/ocean-surf.ogg', import.meta.url).href, spatial: true },
  { id: 'wind', label: '风声', url: new URL('../assets/audio/wind.ogg', import.meta.url).href, spatial: false },
].map((recording) => Object.freeze({ ...recording, url: `${recording.url}?v=${recordingVersion}` })));

export function recordingMix({ riverDistance = Infinity, rapidDistance = Infinity, rapid = 0, calmTurbulence = rapid, flowSpeed = 0,
  coastDistance = Infinity, coastExposure = 1, altitude = 0, rain = 0, submerged = 0, cover = 'open', wind = .35 } = {}) {
  const clamp = MathUtils.clamp;
  const nearRiver = 1 - MathUtils.smoothstep(riverDistance, 1.5, 38);
  const nearRapids = 1 - MathUtils.smoothstep(rapidDistance, 3, 55);
  const nearSea = 1 - MathUtils.smoothstep(coastDistance, 2, 48);
  const turbulence = clamp(rapid, 0, 1);
  const air = 1 - clamp(submerged, 0, 1) * .88;
  const waterCover = cover === 'roof' ? .48 : cover === 'tree' ? .88 : 1;
  const windCover = cover === 'roof' ? .14 : cover === 'tree' ? .48 : 1;
  return {
    calm: nearRiver * Math.sqrt(1 - clamp(calmTurbulence, 0, 1) * .90) * (.20 + .20 * MathUtils.smoothstep(flowSpeed, .02, 1.2)) * air * waterCover,
    rapids: nearRapids * Math.sqrt(turbulence) * (.66 + clamp(rain, 0, 1) * .12) * air * waterCover,
    surf: nearSea * clamp(coastExposure, 0, 1) * (.42 + clamp(rain, 0, 1) * .22) * air * waterCover,
    wind: (.075 + MathUtils.smoothstep(altitude, 8, 38) * .16 + clamp(rain, 0, 1) * .22)
      * windCover * (1 - clamp(submerged, 0, 1) * .98) * Math.sqrt(clamp(wind, 0, 1) / .35),
  };
}

// Assets already have matched loudness and a baked equal-power loop join.
// Each recording is fetched and decoded once, then kept at its original pitch.
export function createRecordedAmbience(context, destination, { fetchAudio = (...args) => fetch(...args), onStatus = () => {} } = {}) {
  const layers = new Map();
  const state = { ready: 0, total: AMBIENCE_RECORDINGS.length, loading: false, failed: [], mode: 'loading' };
  let pending = null;
  let disposed = false;
  const smooth = (parameter, value, time = .9) => parameter.setTargetAtTime(value, context.currentTime, time);
  function publish() {
    state.ready = [...layers.values()].filter((layer) => layer.source).length;
    state.failed = [...layers.values()].filter((layer) => layer.failed).map((layer) => layer.id);
    state.mode = state.ready === state.total ? 'recorded' : state.loading ? 'loading' : 'partial';
    onStatus({ ...state, failed: [...state.failed] });
  }
  for (const recording of AMBIENCE_RECORDINGS) {
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 14500; filter.Q.value = .35;
    gain.gain.value = 0;
    const position = recording.spatial ? context.createPanner() : null;
    if (position) {
      position.panningModel = 'HRTF'; position.distanceModel = 'inverse';
      position.refDistance = recording.id === 'rapids' ? 7 : 5;
      position.maxDistance = 90; position.rolloffFactor = .55;
      filter.connect(gain); gain.connect(position); position.connect(destination);
    } else { filter.connect(gain); gain.connect(destination); }
    layers.set(recording.id, { ...recording, gain, filter, position, source: null, failed: false, target: 0 });
  }
  async function load() {
    if (disposed || state.ready === state.total) return state;
    if (pending) return pending;
    state.loading = true; publish();
    pending = Promise.allSettled([...layers.values()].filter((layer) => !layer.source).map(async (layer) => {
      try {
        layer.failed = false;
        const response = await fetchAudio(layer.url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Audio HTTP ${response.status}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        if (disposed) return;
        if (!(buffer.duration > 2)) throw new Error('Ambience recording is too short');
        const source = context.createBufferSource();
        source.buffer = buffer; source.loop = true;
        source.connect(layer.filter);
        source.start(context.currentTime + .02, Math.random() * Math.max(0, buffer.duration - .1));
        layer.source = source;
        smooth(layer.gain.gain, layer.target, 1.2);
      } catch { if (!disposed) layer.failed = true; }
      if (!disposed) publish();
    })).then(() => {
      state.loading = false; pending = null;
      if (!disposed) publish();
      return state;
    });
    return pending;
  }
  return {
    state, load,
    update(mix, positions = {}, { cover = 'open', riverDistance = 0, rapidDistance = 0, coastDistance = 0, altitude = 0 } = {}) {
      if (disposed) return;
      for (const layer of layers.values()) {
        layer.target = MathUtils.clamp(mix[layer.id] ?? 0, 0, 1);
        if (layer.source) smooth(layer.gain.gain, layer.target, layer.id === 'wind' ? 1.8 : .85);
        const distance = layer.id === 'calm' ? riverDistance : layer.id === 'rapids' ? rapidDistance : coastDistance;
        const cutoff = cover === 'roof' ? 2400 : MathUtils.lerp(14500, 3200, MathUtils.smoothstep(distance, 7, 55));
        const windCutoff = cover === 'roof' ? 1700 : cover === 'tree' ? 12000 : MathUtils.lerp(9500, 2400, MathUtils.smoothstep(altitude, 8, 38));
        smooth(layer.filter.frequency, layer.id === 'wind' ? windCutoff : cutoff, 1.0);
        const point = positions[layer.id];
        if (layer.position && point) {
          if (layer.position.positionX) {
            smooth(layer.position.positionX, point.x, .18);
            smooth(layer.position.positionY, point.y, .18);
            smooth(layer.position.positionZ, point.z, .18);
          } else layer.position.setPosition(point.x, point.y, point.z);
        }
      }
    },
    dispose() {
      disposed = true;
      for (const layer of layers.values()) {
        if (layer.source) { try { layer.source.stop(); } catch {} layer.source.disconnect(); }
        layer.filter.disconnect(); layer.gain.disconnect(); layer.position?.disconnect();
      }
    },
  };
}
