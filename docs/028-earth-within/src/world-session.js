export const SESSION_KEY = 'earth-within.exploration.v1';
export const PREFERENCES_KEY = 'earth-within.preferences.v1';
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max, fallback) => Math.min(max, Math.max(min, finite(value, fallback)));
const modes = new Set(['auto', 'high', 'balanced', 'low']);

export function normalizePreferences(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  return { quality: modes.has(value.quality) ? value.quality : 'auto',
    volume: clamp(value.volume, 0, 1, .5), sound: value.sound !== false,
    following: value.following !== false, distance: clamp(value.distance, 2.45, 7.2, 4.7), wind: clamp(value.wind, 0, 1, .35) };
}

export function createExplorationStore(storage) {
  function read(key) {
    try { const raw = storage.getItem(key); return raw && raw.length < 350000 ? JSON.parse(raw) : null; }
    catch { return null; }
  }
  function write(key, value) {
    try { storage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  return {
    preferences() { return normalizePreferences(read(PREFERENCES_KEY) ?? {}); },
    savePreferences(value) { return write(PREFERENCES_KEY, normalizePreferences(value)); },
    load() {
      const value = read(SESSION_KEY);
      const p = value?.walker?.position;
      if (value?.version !== 1 || !Array.isArray(p) || p.length !== 3 || !p.every(Number.isFinite)
        || !Number.isFinite(value.walker.yaw) || !Number.isFinite(value.walker.pitch)
        || p[0] < -148 || p[0] > 154 || Math.abs(p[2]) > 145 || p[1] < -40 || p[1] > 150) return null;
      value.elapsed = clamp(value.elapsed, 0, 1e9, 0);
      value.preferences = normalizePreferences(value.preferences);
      return value;
    },
    save(value) {
      const p = value?.walker?.position;
      if (!p?.every(Number.isFinite) || p.length !== 3 || !Number.isFinite(value.walker.yaw)
        || !Number.isFinite(value.walker.pitch)) return false;
      return write(SESSION_KEY, { ...value, version: 1, savedAt: Date.now() });
    },
  };
}

export function createQualityController(mode = 'auto', dpr = 1) {
  let level = 1, slow = 0, fast = 0, average = 20;
  const ratios = [.8, 1.15, 1.6];
  const state = { mode: modes.has(mode) ? mode : 'auto', level, ratio: Math.min(dpr, ratios[level]) };
  function apply() {
    state.level = state.mode === 'high' ? 2 : state.mode === 'balanced' ? 1 : state.mode === 'low' ? 0 : level;
    state.ratio = Math.min(Math.max(.5, dpr), ratios[state.level]);
    return state;
  }
  return {
    state,
    setMode(value) { state.mode = modes.has(value) ? value : 'auto'; slow = fast = 0; return apply(); },
    resetTiming() { slow = fast = 0; average = 20; },
    update(milliseconds, dt) {
      if (state.mode !== 'auto' || !Number.isFinite(milliseconds) || dt <= 0) return apply();
      average += (milliseconds - average) * (1 - Math.exp(-Math.min(dt, .12) * 1.4));
      slow = average > 28 ? slow + dt : 0;
      fast = average < 16 ? fast + dt : 0;
      if (slow > 3 && level > 0) { level--; slow = fast = 0; }
      else if (fast > 10 && level < 2) { level++; fast = slow = 0; }
      return apply();
    },
  };
}
