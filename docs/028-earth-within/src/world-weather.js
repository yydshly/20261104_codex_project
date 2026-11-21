import { MathUtils } from 'three';
import { riverFloodRiseAt, setRiverFloodStage } from './world-terrain.js';

export function createWorldWeather() {
  setRiverFloodStage(0);
  const state = {
    rain: 0, runoff: 0, wetness: 0, turbidity: 0, flowMultiplier: 1, shelters: [],
    riverStage: 0, riverRise: 0, wind: .35, windTarget: .35,
  };
  return {
    state,
    setWind(value) { if (Number.isFinite(value)) state.windTarget = MathUtils.clamp(value, 0, 1); },
    restore(saved = {}) {
      for (const key of ['rain', 'runoff', 'wetness', 'turbidity', 'riverStage']) {
        state[key] = MathUtils.clamp(Number.isFinite(saved[key]) ? saved[key] : 0, 0, 1);
      }
      state.flowMultiplier = 1 + .72 * state.runoff;
      state.wind = MathUtils.clamp(Number.isFinite(saved.wind) ? saved.wind : .35, 0, 1);
      state.windTarget = MathUtils.clamp(Number.isFinite(saved.windTarget) ? saved.windTarget : state.windTarget, 0, 1);
      setRiverFloodStage(state.riverStage);
      state.riverRise = riverFloodRiseAt(0);
    },
    update(dt, intensity) {
      dt = MathUtils.clamp(dt, 0, .12);
      intensity = MathUtils.clamp(intensity, 0, 1);
      state.wind = MathUtils.damp(state.wind, state.windTarget, .8, dt);
      state.rain = MathUtils.damp(state.rain, intensity, 1.15, dt);
      const runoff = state.rain * state.rain;
      state.runoff = MathUtils.damp(state.runoff, runoff, runoff > state.runoff ? .15 : .033, dt);
      const collecting = state.rain > .05;
      const wetness = collecting ? 1 : 0;
      state.wetness = MathUtils.damp(state.wetness, wetness, collecting ? .085 * state.rain : .014, dt);
      const sediment = MathUtils.clamp(state.runoff * .91 + state.rain * .09, 0, 1);
      state.turbidity = MathUtils.damp(state.turbidity, sediment, sediment > state.turbidity ? .12 : .027, dt);
      state.flowMultiplier = 1 + .72 * state.runoff;
      const targetStage = MathUtils.smoothstep(state.runoff, .08, .92);
      state.riverStage = MathUtils.damp(state.riverStage, targetStage, targetStage > state.riverStage ? .060 : .018, dt);
      setRiverFloodStage(state.riverStage);
      state.riverRise = riverFloodRiseAt(0);
      return state;
    },
  };
}
