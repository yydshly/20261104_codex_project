window.buildShuRoadFirstPerson = function buildShuRoadFirstPerson({
  entranceFoot, overlookFoot, cityFoot, route, cascade, pineAnchor, extraPoses, add, sub, scale, blend, mix, unit, clamp, ease
}) {
  const eyeHeight = 1.65;
  const eyeOn = (surface, height = eyeHeight) => add(surface, [0, height, 0]);
  const beat = (position, from, to) => ease(clamp((position - from) / (to - from)));

  function keyframes(frames, position, smooth = false) {
    for (let i = 1; i < frames.length; i++) {
      const [end, destination] = frames[i];
      if (position <= end) {
        const [start, origin] = frames[i - 1];
        const fraction = clamp((position - start) / (end - start));
        return blend(origin, destination, smooth ? ease(fraction) : fraction);
      }
    }
    return frames[frames.length - 1][1];
  }

  function walk(ground, gaze, fov) {
    return position => ({
      eye: eyeOn(keyframes(ground, position)),
      target: keyframes(gaze, position, true),
      fov
    });
  }

  // Each ground key follows a sampled model surface: cliff shelf, bank, path or wall top.
  const entranceGaze = [
    [0, [13, 6, -20]],
    [.18, [19, 17, 2]],
    [.39, [-15, 43, -9]],
    [.66, [-34, 35, -32]],
    [1, [-60, 44, -76]]
  ];
  const entering = position => ({
    eye: eyeOn(entranceFoot(position)),
    target: keyframes(entranceGaze, position, true),
    fov: 61
  });

  const opening = walk([
    [0, [-105.7, -6.58, 86.4]],
    [.40, [-105.9, -6.42, 85.4]],
    [.67, [-106.25, -6.09, 83.3]],
    [1, [-106.6, -5.87, 81.7]]
  ], [
    [0, [-119, -.4, 57]],
    [.23, [-122, 23, 54]],
    [.47, [-120, 10, 60]],
    [.75, [-114, 4, 70]],
    [1, [-120, 16, 52]]
  ], 59);

  const river = walk([
    [0, [122.88, -5.33, 110]],
    [.20, [122.69, -5.43, 109]],
    [.40, [122.45, -5.43, 108]],
    [.60, [122.16, -5.43, 107]],
    [.80, [121.82, -5.39, 106]],
    [1, [121.42, -5.28, 105]]
  ], [
    [0, [116, 1, 70]],
    [.16, [108, 39, 14]],
    [.43, [111, -4, 52]],
    [.70, [108, 18, 55]],
    [1, [129, 12, 39]]
  ], 62);

  const trailStart = .427;
  const trailStop = .467;
  const restingEye = eyeOn(route(trailStop, .64));
  const starTarget = add(restingEye, [29, 33, 42]);

  function plank(position) {
    const progress = beat(position, 0, .47);
    const stop = mix(trailStart, trailStop, progress);
    const body = route(stop, .64);
    const eye = eyeOn(body);
    const outward = unit(sub(route(stop, 1.55), route(stop, .15)));
    const walkingTarget = add(add(route(stop + .016, .64), scale(outward, .42)), [0, .12, 0]);
    const glance = beat(position, .43, .76);
    return { eye, target: blend(walkingTarget, starTarget, glance), fov: mix(63, 56, glance) };
  }

  const forest = walk([
    [0, [-76.4, -1.97, 9]],
    [.27, [-77.8, -1.70, 7.6]],
    [.62, [-79.1, -1.43, 6.2]],
    [1, [-80.5, -1.35, 5.3]]
  ], [
    [0, [-89, 1.4, -19]],
    [.31, [-87, 9.7, -8]],
    [.62, [-91, 13, -24]],
    [1, [-94, 7.0, -33]]
  ], 59);

  const waterfallTop = cascade(.12, .5);
  const waterfallBase = cascade(.92, .5);

  function waterfall(position) {
    const step = beat(position, .12, .68);
    const eye = eyeOn(overlookFoot(step));
    const turn = beat(position, .15, .39);
    const downward = beat(position, .38, .71);
    const pineView = blend(pineAnchor, waterfallTop, mix(.90, 1, turn));
    return {
      eye,
      target: blend(pineView, waterfallBase, downward * .94),
      fov: mix(61, 65, downward)
    };
  }

  const gate = walk([
    [0, [127.1, -4.94, -67.5]],
    [.24, [127.4, -5.01, -71]],
    [.49, [127.7, -5.07, -75]],
    [.74, [128, -5.10, -79]],
    [1, [128.6, -5.05, -84]]
  ], [
    [0, [128, .2, -92]],
    [.32, [128, 10, -96]],
    [.63, [128.4, .5, -92]],
    [1, [128.8, -2.1, -91]]
  ], 61);

  const danger = walk([
    [0, [157.2, -4.69, -45.8]],
    [.23, [157.1, -4.83, -47.5]],
    [.52, [157.1, -4.82, -49.2]],
    [.76, [157.6, -4.90, -49]],
    [1, [158.5, -4.95, -48]]
  ], [
    [0, [165, -1.7, -68]],
    [.27, [162, -2.7, -61]],
    [.50, [160, -3.0, -60]],
    [.72, [157.3, -4.0, -51.7]],
    [1, [158.4, -3.9, -51.2]]
  ], 56);

  const cityGaze = [
    [0, [205, .1, 109]],
    [.37, [205, -.4, 106]],
    [.67, [166, 3, 102]],
    [1, [53, 22, 15]]
  ];
  const lookingBack = position => ({
    eye: eyeOn(cityFoot(beat(position,0,.68))),
    target: keyframes(cityGaze, position, true),
    fov: 62
  });

  const views = [entering, opening, river, plank, forest, waterfall, gate, danger, lookingBack];
  function view(index, position) {
    if (!views[index]) return { ...extraPoses[0], fov: 61 };
    return views[index](clamp(position));
  }

  view.starDirection = unit(sub(starTarget, restingEye));
  return view;
};
