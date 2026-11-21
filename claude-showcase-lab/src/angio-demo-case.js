import { camera, smooth } from './demos/angio-projection.js';

const branchColors = ['#ad4c20', '#087e88'];
const branchPaths = [
  [[-10, -46, 4], [-5, -30, 12], [8, -12, 28], [16, 7, 36], [19, 25, 33], [25, 57, 18]],
  [[-10, -46, 4], [-4, -29, -9], [7, -12, -23], [15, 7, -35], [22, 26, -34], [31, 54, -36]],
];
const targets = branchPaths.map(points => points[3]);
const branches = branchPaths.map(smooth);
const backgroundVessels = [
  [[-54, -77, 8], [-34, -66, 6], [-20, -55, 5], [-10, -46, 4]],
  [[-24, -58, 5], [-38, -44, -5], [-52, -29, -14], [-59, -7, -12]],
  [[8, -12, 28], [-6, -7, 35], [-19, 6, 40], [-28, 30, 28]],
  [[22, 26, -34], [40, 23, -31], [57, 32, -22], [65, 45, -19]],
].map(smooth);
const spatialView = camera(-37, 15, true);

function coordinates(points) {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

function vesselLines(project, colorize) {
  const context = backgroundVessels.map((points, i) =>
    `<polyline class="lab-angio-context" points="${coordinates(points.map(project))}" stroke-width="${i ? 2 : 4}"/>`
  );
  const foreground = branches.map((points, i) =>
    `<polyline class="lab-angio-branch" points="${coordinates(points.map(project))}" stroke="${colorize ? branchColors[i] : '#343737'}"/>`
  );
  return [...context, ...foreground].join('');
}

function markerGap(project) {
  const [[ax, ay], [bx, by]] = targets.map(project);
  return Math.hypot(ax - bx, ay - by);
}

function film(project, colorize) {
  const markers = targets.map(project);
  const [[ax, ay], [bx, by]] = markers;
  return vesselLines(project, colorize) + (colorize
    ? markers.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${branchColors[i]}" stroke="#f3eee2" stroke-width="1.5"/>`).join('')
    : `<ellipse cx="${(ax + bx) / 2}" cy="${(ay + by) / 2}" rx="21" ry="17" class="lab-angio-target"/>`);
}

function spatialDiagram(project) {
  // Recover the detector's basis from the same projection used by the film.
  const basis = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(project);
  const normal = basis.map(point => point[2]);
  const corners = [[-50, -58], [50, -58], [50, 65], [-50, 65]].map(([u, v]) =>
    basis.map(([x, y, depth]) => (x - 140) * u / 1.12 + (y - 123) * v / 1.12 + depth * 67)
  );
  const rays = targets.map((point, i) => {
    const distance = 67 - project(point)[2];
    const arrival = point.map((value, axis) => value + normal[axis] * distance);
    const [x, y] = spatialView(point);
    return `<polyline points="${coordinates([point, arrival].map(spatialView))}" class="lab-angio-ray" stroke="${branchColors[i]}"/>
      <circle cx="${x}" cy="${y}" r="4" fill="${branchColors[i]}"/>`;
  });
  return `<polygon points="${coordinates(corners.map(spatialView))}" class="lab-angio-detector"/>`
    + vesselLines(spatialView, true) + rays.join('');
}

export { targets, vesselLines, markerGap, film, spatialDiagram };
