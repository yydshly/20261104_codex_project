import * as THREE from 'three';
import { baseRiverSurfaceHeight, coastlineX, getRiverFloodStage, groundSurfaceHeight,
  rainBasins, riverBarrierHeightAt, riverFloodRiseAt, riverWidth, riverZ, waterSurfaceAt } from './world-terrain.js';
import { trailClearance } from './world-trail.js';
import { getTideState, TIDE_AMPLITUDE } from './world-tides.js';

const LAYERS = 256;
const clamp = THREE.MathUtils.clamp;
const smooth = THREE.MathUtils.smoothstep;

function history() {
  return { times: new Float64Array(LAYERS + 1).fill(-Infinity), loads: new Float32Array(LAYERS + 1),
    peak: 0, peakTime: -Infinity };
}

function advanceHistory(record, level, dt, time, sediment = 1) {
  const highest = Math.floor(clamp(level, 0, 1) * LAYERS + 1e-7);
  for (let i = 0; i <= LAYERS; i++) {
    if (i <= highest && level >= 0) {
      record.times[i] = time;
      record.loads[i] = Math.min(1, record.loads[i] + dt * (.035 + .11 * sediment));
    } else record.loads[i] *= Math.exp(-dt / 480);
  }
  if (level >= record.peak - .000001 && level > .005) {
    record.peak = level;
    record.peakTime = time;
  } else if (time - record.peakTime > 1200) record.peak = Math.max(0, level);
}

function historyAt(record, threshold, time, target) {
  if (!Number.isFinite(threshold) || threshold > 1 || threshold < -1) return;
  // Round upwards: an unvisited dry strip never receives history from a lower water level.
  const index = Math.ceil(clamp(threshold, 0, 1) * LAYERS - 1e-7);
  const age = time - record.times[index];
  if (!Number.isFinite(age)) return;
  const retained = Math.exp(-age / 150);
  const load = record.loads[index];
  target.retained = Math.max(target.retained, retained);
  target.residue = Math.max(target.residue, load * Math.exp(-age / 420));
  const edge = 1 - smooth(Math.abs(record.peak - threshold), .018, .090);
  target.waterline = Math.max(target.waterline, edge * retained * Math.sqrt(load));
}

export function createGroundMemory(scene, weather, collision = null) {
  const riverHistory = history();
  const tideHistory = history();
  const basins = rainBasins.map((basin) => ({ ...basin, bottom: groundSurfaceHeight(basin.x, basin.z), history: history() }));
  const bindings = [];
  const sampleCache = new Map();
  const uniforms = { peakStage: { value: 0 }, riverStage: { value: 0 }, waterlineStrength: { value: 0 } };
  let clock = 0;
  let attributeElapsed = 0;
  const scratch = { retained: 0, residue: 0, waterline: 0 };
  const stats = { boundVertices: 0, activeVertices: 0, attributeUpdates: 0, cachedSamples: 0, sampleCacheHits: 0 };

  function basinAt(x, z) {
    return basins.find((basin) => ((x - basin.x) / basin.radiusX) ** 2 + ((z - basin.z) / basin.radiusZ) ** 2 < 1) ?? null;
  }

  function classify(x, z, floor) {
    if (x < -91 && floor > 24) return { substrate: 'snow', soil: 0 };
    const slope = Math.hypot(groundSurfaceHeight(x + .22, z) - groundSurfaceHeight(x - .22, z),
      groundSurfaceHeight(x, z + .22) - groundSurfaceHeight(x, z - .22)) / .44;
    if (collision?.blocks(x, floor + .7, z, floor, false, floor)
      || slope > .73 || (trailClearance(x, z, -.55) && x < -43)) return { substrate: 'stone', soil: 0 };
    const shore = coastlineX(z) - x;
    if (shore < 9 && x > 45) return { substrate: 'sand', soil: .70 };
    const bank = x > -80 && x < 58 && Math.abs(z - riverZ(x)) < riverWidth(x) + 6
      && floor < baseRiverSurfaceHeight(x) + 1.6;
    if (bank || basinAt(x, z) || (x > 44 && x < 59 && z < 8 && z > -9 && floor < 1.5)) {
      return { substrate: 'mud', soil: 1 - smooth(slope, .24, .73) * .8 };
    }
    return { substrate: 'grass', soil: .34 * (1 - smooth(slope, .22, .60)) };
  }

  function metadata(x, z, floor, knownSoil = null) {
    const material = knownSoil ?? classify(x, z, floor);
    let threshold = Infinity;
    const maximum = riverFloodRiseAt(x, 1);
    if (maximum > .0001 && Math.abs(z - riverZ(x)) < riverWidth(x) + 9) {
      const barrier = riverBarrierHeightAt(x, z);
      if (Number.isFinite(barrier) && barrier < 1000) {
        // Keep the adjacent above-peak vertex too. Interpolating this threshold
        // in the fragment shader resolves a thin mark between coarse vertices.
        threshold = (Math.max(floor + .001, barrier + .001) - baseRiverSurfaceHeight(x)) / maximum;
      }
    }
    const basin = basinAt(x, z);
    let tidalThreshold = Infinity;
    if (x > 36 && floor < TIDE_AMPLITUDE && waterSurfaceAt(x, z, floor, 0, TIDE_AMPLITUDE) !== null) {
      let low = -TIDE_AMPLITUDE, high = TIDE_AMPLITUDE;
      for (let i = 0; i < 10; i++) {
        const level = (low + high) / 2;
        if (waterSurfaceAt(x, z, floor, 0, level) !== null) high = level;
        else low = level;
      }
      tidalThreshold = (high + TIDE_AMPLITUDE) / (2 * TIDE_AMPLITUDE);
    }
    return { x, z, floor, ...material, threshold, tidalThreshold, basin,
      exposure: clamp(weather.groundExposureAt?.(x, z) ?? 1, 0, 1) };
  }

  function read(meta, target) {
    const { x, z, floor, substrate, soil, basin } = meta;
    const river = waterSurfaceAt(x, z, floor);
    const puddle = weather.puddleSurfaceAt?.(x, z);
    const height = Math.max(river ?? -Infinity, Number.isFinite(puddle) ? puddle : -Infinity);
    const waterDepth = Math.max(0, height - floor);
    scratch.retained = scratch.residue = scratch.waterline = 0;
    historyAt(riverHistory, meta.threshold, clock, scratch);
    historyAt(tideHistory, meta.tidalThreshold, clock, scratch);
    if (basin) historyAt(basin.history, (floor + .001 - basin.bottom) / .10, clock, scratch);
    const rainWetness = clamp(weather.wetness ?? 0, 0, 1) * meta.exposure;
    const localWetness = Math.max(rainWetness, waterDepth > .001 ? 1 : scratch.retained);
    const exposed = waterDepth <= .003;
    target.localWetness = localWetness;
    target.residue = exposed ? scratch.residue * soil : 0;
    target.waterline = exposed ? scratch.waterline * soil : 0;
    target.mud = soil * smooth(localWetness, .20, .82) * (substrate === 'grass' ? .70 : 1);
    target.substrate = substrate;
    target.waterDepth = waterDepth;
    target.waterHeight = Number.isFinite(height) && waterDepth > 0 ? height : null;
    target.floor = floor;
    return target;
  }

  function updateAttributes() {
    const state = {};
    for (const binding of bindings) {
      for (const { index, meta } of binding.records) {
        read(meta, state);
        binding.wetness.array[index] = state.localWetness;
        binding.residue.array[index * 2] = state.residue;
        binding.residue.array[index * 2 + 1] = state.waterline;
      }
      binding.wetness.needsUpdate = true;
      binding.residue.needsUpdate = true;
    }
    stats.attributeUpdates++;
  }

  return {
    stats,
    uniforms,
    snapshot() {
      return { clock, records: [riverHistory, tideHistory, ...basins.map((b) => b.history)].map((r) => ({
        times: Array.from(r.times, (t) => Number.isFinite(t) ? t : null), loads: Array.from(r.loads),
        peak: r.peak, peakTime: Number.isFinite(r.peakTime) ? r.peakTime : null,
      })) };
    },
    restore(saved) {
      clock = Number.isFinite(saved?.clock) ? Math.max(0, saved.clock) : 0;
      [riverHistory, tideHistory, ...basins.map((b) => b.history)].forEach((r, index) => {
        const source = saved?.records?.[index];
        for (let i = 0; i <= LAYERS; i++) {
          r.times[i] = Number.isFinite(source?.times?.[i]) ? Math.min(clock, source.times[i]) : -Infinity;
          r.loads[i] = clamp(Number.isFinite(source?.loads?.[i]) ? source.loads[i] : 0, 0, 1);
        }
        r.peak = clamp(Number.isFinite(source?.peak) ? source.peak : 0, 0, 1);
        r.peakTime = Number.isFinite(source?.peakTime) ? Math.min(clock, source.peakTime) : -Infinity;
      });
      updateAttributes();
    },
    sampleAt(x, z, target = {}) {
      // Old footprint centers stay fixed. Cache only their static terrain data;
      // water level and memory below are still read fresh on every call.
      const key = `${x},${z}`;
      let meta = sampleCache.get(key);
      if (meta) stats.sampleCacheHits++;
      else {
        meta = metadata(x, z, groundSurfaceHeight(x, z));
        if (sampleCache.size >= 2048) sampleCache.delete(sampleCache.keys().next().value);
        sampleCache.set(key, meta);
        stats.cachedSamples = sampleCache.size;
      }
      return read(meta, target);
    },
    bindGeometry(geometry) {
      const positions = geometry.getAttribute('position');
      const wetness = new THREE.BufferAttribute(new Float32Array(positions.count), 1).setUsage(THREE.DynamicDrawUsage);
      const residue = new THREE.BufferAttribute(new Float32Array(positions.count * 2), 2).setUsage(THREE.DynamicDrawUsage);
      const floodThreshold = new THREE.BufferAttribute(new Float32Array(positions.count * 2), 2);
      for (let i = 0; i < positions.count; i++) floodThreshold.array[i * 2] = 2;
      const records = [];
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), z = positions.getZ(i), floor = positions.getY(i);
        const coastal = x > 45 && x > coastlineX(z) - 4 && floor < .55 && floor > -.7;
        const potential = coastal || x > -96 && x < 62 && Math.abs(z - riverZ(x)) < riverWidth(x) + 9;
        if (!potential && !basinAt(x, z)) continue;
        const meta = metadata(x, z, floor);
        if (meta.soil && Number.isFinite(meta.threshold) && meta.threshold < 2) {
          floodThreshold.array[i * 2] = clamp(meta.threshold, -2, 2);
          floodThreshold.array[i * 2 + 1] = meta.soil;
        }
        if (!meta.soil || ((meta.threshold > 1 || !Number.isFinite(meta.threshold)) && !meta.basin && meta.tidalThreshold > 1)) continue;
        records.push({ index: i, meta });
      }
      geometry.setAttribute('aSoilWetness', wetness);
      geometry.setAttribute('aMudResidue', residue);
      geometry.setAttribute('aFloodThreshold', floodThreshold);
      bindings.push({ wetness, residue, records });
      stats.boundVertices += positions.count;
      stats.activeVertices += records.length;
      updateAttributes();
    },
    update(dt, time) {
      dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
      clock = Number.isFinite(time) ? Math.max(clock, time) : clock + dt;
      advanceHistory(riverHistory, getRiverFloodStage(), dt, clock, clamp(weather.turbidity ?? 0, 0, 1));
      if (getTideState().enabled) advanceHistory(tideHistory, (getTideState().level + TIDE_AMPLITUDE) / (2 * TIDE_AMPLITUDE), dt, clock, .18);
      uniforms.peakStage.value = riverHistory.peak;
      uniforms.riverStage.value = getRiverFloodStage();
      const peakLayer = Math.floor(clamp(riverHistory.peak, 0, 1) * LAYERS);
      uniforms.waterlineStrength.value = Number.isFinite(riverHistory.peakTime)
        ? Math.exp(-(clock - riverHistory.peakTime) / 360) * Math.sqrt(riverHistory.loads[peakLayer]) : 0;
      for (const basin of basins) {
        const height = weather.puddleSurfaceAt?.(basin.x, basin.z);
        const level = Number.isFinite(height) ? clamp((height - basin.bottom) / .10, 0, 1) : -1;
        advanceHistory(basin.history, level, dt, clock, .55);
      }
      attributeElapsed += dt;
      if (attributeElapsed >= .1) {
        attributeElapsed %= .1;
        updateAttributes();
      }
    },
  };
}
