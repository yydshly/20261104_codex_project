import { MathUtils } from 'three';

export const TIDE_AMPLITUDE = .42;
export const TIDE_PERIOD = 240;
const TAU = Math.PI * 2;
const tide = { enabled: false, phase: 0, level: 0, flow: 0 };

export const getTideState = () => tide;
export const seaSurfaceHeight = () => tide.level;
export const tidalInfluenceAt = (x) => MathUtils.smoothstep(x, 36, 55);
export const tidalRiseAt = (x, level = tide.level) => level * tidalInfluenceAt(x);
export const tidalFlowAt = (x) => tide.flow * MathUtils.smoothstep(x, 40, 58)
  * (1 - MathUtils.smoothstep(x, 70, 88));

export function resetTide() {
  Object.assign(tide, { enabled: false, phase: 0, level: 0, flow: 0 });
}

// A compressed four-minute tide for this small world, independent of rain.
// Rising level pushes inward; high/low water has slack flow. Reversing the
// demonstration reflects the phase at the same level, so water never jumps.
export function createWorldTide({ phase = 0, period = TIDE_PERIOD } = {}) {
  Object.assign(tide, { enabled: true, phase, level: Math.sin(phase) * TIDE_AMPLITUDE, flow: Math.cos(phase) });
  return {
    state: tide,
    restore(saved) {
      if (!Number.isFinite(saved?.phase)) return;
      tide.phase = MathUtils.euclideanModulo(saved.phase, TAU);
      tide.level = Math.sin(tide.phase) * TIDE_AMPLITUDE;
      tide.flow = MathUtils.clamp(Number.isFinite(saved.flow) ? saved.flow : Math.cos(tide.phase), -1, 1);
    },
    update(dt) {
      dt = MathUtils.clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
      tide.phase = MathUtils.euclideanModulo(tide.phase + dt * TAU / period, TAU);
      tide.level = Math.sin(tide.phase) * TIDE_AMPLITUDE;
      tide.flow = MathUtils.damp(tide.flow, Math.cos(tide.phase), 1.3, dt);
      return tide;
    },
    setDirection(rising) {
      if ((Math.cos(tide.phase) >= 0) !== rising) tide.phase = MathUtils.euclideanModulo(Math.PI - tide.phase, TAU);
    },
  };
}
