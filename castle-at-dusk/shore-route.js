import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';

export const SHORE_DOCK = Object.freeze({
  x: 24.64,
  z: -9.0365,
  floor: -4.9725,
  yaw: -Math.PI / 2,
});

// The route crosses the fisher's bank, a wooded islet and the north shore.
// Deck and trail meshes are built from the same points used by the walker.
const route = [
  [SHORE_DOCK.x, SHORE_DOCK.floor, SHORE_DOCK.z, 'farDock'],
  [27.6, -4.9725, -9.0365, 'farDock'],
  [29.42, -4.9725, -9.0365, 'fisherHut'],
  [29.80, -4.92, -8.98],
  [30.27, -4.52, -8.72],
  [30.80, -3.98, -8.57],
  [31.25, -3.64, -8.86],
  [31.42, -3.58, -9.48],
  [31.40, -3.63, -10.38],
  [32.13, -3.27, -11.33, 'shoreTrail'],
  [33.23, -3.16, -13.60],
  [34.12, -3.53, -16.48],
  [36.02, -2.99, -18.61],
  [36.72, -3.89, -20.80],
  [36.61, -4.78, -22.11, 'shoreBridge'],
  [36.22, -4.76, -24.80],
  [35.73, -4.72, -27.51],
  [35.26, -4.74, -30.32],
  [34.08, -4.25, -32.02, 'shoreTrail'],
  [31.05, -3.76, -34.20],
  [27.01, -3.47, -36.44],
  [23.01, -1.67, -39.20],
  [19.00, -2.51, -41.70],
  [15.30, -4.24, -43.85],
  [12.45, -4.81, -44.88, 'shoreBridge'],
  [11.20, -4.82, -45.11],
  [9.79, -4.66, -45.26],
  [7.69, -4.12, -44.62, 'shoreTrail'],
  [4.09, -3.41, -43.15],
  [.40, -3.72, -40.81],
  [-3.50, -4.25, -38.55],
  [-7.52, -4.10, -36.66],
  [-10.53, -3.55, -35.91, 'watchtower'],
  [-11.44, -3.16, -36.23],
  [-11.88, -2.71, -36.76],
  [-12.00, -2.39, -37.19],
  [-12.00, -1.75, -38.34],
  [-12.00, -1.66, -38.91],
];

export function createShoreWalkCurve() {
  const curve = new CatmullRomCurve3(route.map(([x, y, z]) => new Vector3(x, y, z)));
  curve.arcLengthDivisions = 800;
  return curve;
}

const stageCurve = createShoreWalkCurve();
const lengths = stageCurve.getLengths();
const stages = route.flatMap((point, index) => {
  if (!point[3]) return [];
  const sample = index / (route.length - 1) * stageCurve.arcLengthDivisions;
  const floor = Math.floor(sample);
  const distance = MathUtils.lerp(lengths[floor], lengths[Math.ceil(sample)], sample - floor);
  return [[distance / lengths.at(-1), point[3]]];
});

export function getShoreWalkStage(fraction) {
  return stages.findLast(([start]) => MathUtils.clamp(fraction, 0, 1) >= start)[1];
}

const widths = { farDock: .51, fisherHut: .36, shoreTrail: .57, shoreBridge: .62, watchtower: .36 };

export function getShoreWalkWidth(fraction) {
  let width = widths.farDock;
  for (const [start, stage] of stages.slice(1)) {
    if (fraction < start - .006) break;
    width = MathUtils.lerp(width, widths[stage], MathUtils.smoothstep(fraction, start - .006, start + .006));
  }
  return width;
}
