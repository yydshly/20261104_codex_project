import { MathUtils } from 'three';

const unit = (value, fallback = 0) => MathUtils.clamp(Number.isFinite(value) ? value : fallback, 0, 1);

export function createFootprintAging({ substrate, moisture = 0, impact = 0, strength = .5 }) {
  const depth = (substrate === 'sand' ? .011 : substrate === 'mud' ? .007 : .0025)
    * (.85 + unit(impact) * .5 + unit(strength) * .15);
  return { coreWater: unit(moisture), edgeWater: unit(moisture) * .86,
    depth, initialDepth: depth, definition: 1, submerged: false, eroded: false, age: 0 };
}

// Condensed material weathering for this small world. Water mass and the
// remaining impression are independent; there is no age-based opacity timer.
export function advanceFootprintAging(state, dt, environment = {}, substrate = 'sand') {
  dt = MathUtils.clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
  const exposure = unit(environment.exposure, 1), wind = unit(environment.wind, .35);
  const rain = unit(environment.rain) * exposure, humidity = unit(environment.groundWetness);
  const depth = Math.max(0, Number.isFinite(environment.waterDepth) ? environment.waterDepth : 0);
  const flow = MathUtils.clamp(Number.isFinite(environment.flowSpeed) ? environment.flowSpeed : 0, 0, 6);
  const wave = unit(environment.wave);
  state.age += dt;
  if (state.eroded && state.depth === 0) {
    state.coreWater = state.edgeWater = state.definition = 0;
    return state;
  }
  state.submerged = depth > .004;
  const sand = substrate === 'sand';
  if (state.submerged) {
    state.coreWater = state.edgeWater = 1;
    // A momentary millimetre film hides the mark but cannot erase its shape.
    const inundation = MathUtils.smoothstep(depth, .008, .35);
    const erosion = inundation * (.0008 + flow * .0012 + wave * .0025);
    state.depth = Math.max(0, state.depth - dt * erosion * (sand ? 1 : .45));
    state.definition = Math.max(0, state.definition - dt * inundation * (.02 + flow * .08 + wave * .16));
  } else {
    const evaporation = (sand ? .033 : .024) * (.55 + wind * 1.55)
      * (.30 + exposure * .70) * (1 - humidity * .72) * (1 - rain);
    const wetting = rain * .42;
    // Exposed edges have less retained water and more contact with moving air.
    state.edgeWater = unit(state.edgeWater + dt * ((1 - state.edgeWater) * wetting
      - evaporation * 1.65 * Math.sqrt(Math.max(.015, state.edgeWater))));
    state.coreWater = unit(state.coreWater + dt * ((1 - state.coreWater) * wetting * .72
      - evaporation * Math.sqrt(Math.max(.015, state.coreWater))));
    const drySand = sand ? (1 - state.coreWater) ** 2 : .08;
    const windFill = .000002 + wind * wind * .000075 * drySand * exposure;
    const rainWear = rain * rain * (sand ? .000065 : .000022);
    state.depth = Math.max(0, state.depth - dt * (windFill + rainWear));
    state.definition = Math.max(0, state.definition - dt * (wind * wind * drySand * .0045 * exposure + rain * rain * .005));
  }
  if (state.depth < .00008) state.depth = 0;
  state.eroded = state.depth === 0;
  if (state.eroded) state.coreWater = state.edgeWater = 0;
  return state;
}

export function restoreFootprintAging(saved, substrate) {
  const state = createFootprintAging({ substrate });
  if (!saved || typeof saved !== 'object') return state;
  for (const key of ['coreWater', 'edgeWater', 'definition']) state[key] = unit(saved[key]);
  state.initialDepth = MathUtils.clamp(Number.isFinite(saved.initialDepth) ? saved.initialDepth : state.initialDepth, .001, .025);
  state.depth = MathUtils.clamp(Number.isFinite(saved.depth) ? saved.depth : state.initialDepth, 0, state.initialDepth);
  state.age = MathUtils.clamp(Number.isFinite(saved.age) ? saved.age : 0, 0, 1e8);
  state.submerged = Boolean(saved.submerged); state.eroded = state.depth === 0;
  return state;
}
