const shuRoadRouteTools = (() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;

  function sampleRoute(eyeAt, samples, knots = []) {
    const positions = Array.from({ length: samples + 1 }, (_, index) => index / samples);
    const checkpoints = [...new Set([...positions, ...knots])].sort((a, b) => a - b);
    const nodes = [{ position: 0, distance: 0 }];
    let eye = eyeAt(0);
    let length = 0;
    for (const position of checkpoints.slice(1)) {
      const next = eyeAt(position);
      length += Math.hypot(next[0] - eye[0], next[1] - eye[1], next[2] - eye[2]);
      // Keep both sides of a stationary interval so distance lookup skips its hold.
      nodes.push({ position, distance: length });
      eye = next;
    }
    return { nodes, length };
  }

  function interpolate(nodes, value, from, to) {
    let low = 0;
    let high = nodes.length - 1;
    if (value <= nodes[low][from]) return nodes[low][to];
    if (value >= nodes[high][from]) return nodes[high][to];
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (nodes[mid][from] < value) low = mid;
      else high = mid;
    }
    const start = nodes[low];
    const end = nodes[high];
    return mix(start[to], end[to], (value - start[from]) / (end[from] - start[from]));
  }

  return { clamp, mix, sampleRoute, interpolate };
})();

window.createShuRoadWalkMotion = function createShuRoadWalkMotion({ view, length }) {
  const walkSpeed = 1.35;
  const acceleration = 3.8;
  const braking = 9;
  const tolerance = .0001;
  const routes = new Map();
  const { clamp, mix, sampleRoute, interpolate } = shuRoadRouteTools;
  const metricRoute = Number.isFinite(length) && length >= 0 ? {
    length,
    nodes: [{ position: 0, distance: 0 }, { position: 1, distance: length }]
  } : null;

  function getRoute(index) {
    if (metricRoute) return metricRoute;
    if (!routes.has(index)) routes.set(index, sampleRoute(position => view(index, position).eye, 512));
    return routes.get(index);
  }

  let sceneIndex;
  let route;
  let distance;
  let speed;
  let phase;
  let bob;
  let goal;

  function snapshot() {
    const position = interpolate(route.nodes, distance, 'distance', 'position');
    return {
      position,
      eye: view(sceneIndex, position).eye,
      bob,
      distance,
      length: route.length,
      speed,
      atStart: distance <= tolerance,
      atEnd: route.length - distance <= tolerance,
      moving: speed !== 0 || bob !== 0 || goal !== null
    };
  }

  function reset(index, position = 0) {
    sceneIndex = index;
    route = getRoute(index);
    distance = interpolate(route.nodes, clamp(position, 0, 1), 'position', 'distance');
    speed = 0;
    phase = 0;
    bob = 0;
    goal = null;
    return snapshot();
  }

  function impulse(metres) {
    if (!Number.isFinite(metres) || metres === 0) return;
    const next = clamp((goal ?? distance) + metres, distance - 1.6, distance + 1.6);
    const bounded = clamp(next, 0, route.length);
    goal = Math.abs(bounded - distance) > tolerance ? bounded : null;
  }

  function step(dtSeconds, intent = 0, reducedMotion = false, pace = 1) {
    const dt = Number.isFinite(dtSeconds) ? clamp(dtSeconds, 0, .1) : 0;
    const direction = Number.isFinite(intent) ? clamp(intent, -1, 1) : 0;
    const paceFactor = Number.isFinite(pace) ? clamp(pace, 0, 2.6) : 1;
    if (direction) goal = null;
    let target = direction * walkSpeed * paceFactor;
    if (goal !== null) {
      const remaining = goal - distance;
      target = Math.sign(remaining) * Math.min(walkSpeed, Math.sqrt(2 * braking * Math.abs(remaining)));
    }
    const rate = Math.sign(speed) === Math.sign(target) && Math.abs(target) > Math.abs(speed) || speed === 0
      ? acceleration : braking;
    const rampTime = Math.min(dt, Math.abs(target - speed) / rate);
    const nextSpeed = rampTime < dt ? target : speed + Math.sign(target - speed) * rate * rampTime;
    const change = (speed + nextSpeed) * .5 * rampTime + nextSpeed * (dt - rampTime);
    const previous = distance;
    const attempted = distance + change;
    speed = Math.abs(nextSpeed) < tolerance ? 0 : nextSpeed;

    if (goal !== null && (goal - distance) * (goal - attempted) <= 0) {
      distance = goal;
      goal = null;
      speed = 0;
    } else {
      distance = clamp(attempted, 0, route.length);
      if ((distance === 0 && speed < 0) || (distance === route.length && speed > 0)) speed = 0;
    }

    const stepLength = .74 + Math.max(0, Math.abs(speed) / walkSpeed - 1) * .33;
    phase = (phase + Math.abs(distance - previous) * 2 * Math.PI / stepLength) % (2 * Math.PI);
    const nextBob = Math.sin(phase) * .025 * Math.min(1, Math.abs(speed) / walkSpeed);
    bob = reducedMotion ? 0 : mix(bob, nextBob, 1 - Math.exp(-16 * dt));
    if (!speed && Math.abs(bob) < .0004) bob = 0;
    return snapshot();
  }

  reset(0);
  return { reset, step, impulse, get state() { return snapshot(); } };
};

window.buildShuRoadJourney = function buildShuRoadJourney({ view, connectors }) {
  const { clamp, sampleRoute, interpolate } = shuRoadRouteTools;
  const segments = [];
  const landmarks = [];
  let length = 0;

  function append(kind, index, eyeAt, samples, knots) {
    const metric = sampleRoute(eyeAt, samples, knots);
    const start = length;
    length += metric.length;
    const segment = { kind, index, eyeAt, start, end: length, ...metric };
    segments.push(segment);
    return segment;
  }

  for (let index = 0; index <= connectors.length; index++) {
    const scene = append('scene', index, position => view(index, position).eye, 512);
    landmarks.push({ index, start: scene.start, end: scene.end, distance: scene.start });
    if (index === connectors.length) break;
    const connector = connectors[index];
    append('connector', index, connector, 1024, connector.samplePositions);
  }

  function positionAtDistance(distance) {
    return length > 0 ? clamp(distance / length, 0, 1) : 0;
  }

  function distanceAtPosition(position) {
    return clamp(position, 0, 1) * length;
  }

  function segmentAt(distance) {
    // Normalized positions can round to just below their own landmark.
    return segments.find(segment => distance < segment.end - 1e-7) ?? segments.at(-1);
  }

  function localPosition(segment, distance) {
    return interpolate(segment.nodes, distance - segment.start, 'distance', 'position');
  }

  function locate(distance) {
    const bounded = clamp(distance, 0, length);
    const segment = segmentAt(bounded);
    const travelled = bounded - segment.start;
    return {
      kind: segment.kind,
      index: segment.index,
      nextIndex: segment.kind === 'connector' ? segment.index + 1 : segment.index,
      start: segment.start,
      end: segment.end,
      distance: bounded,
      position: localPosition(segment, bounded),
      progress: segment.length > 0 ? clamp(travelled / segment.length, 0, 1) : 0
    };
  }

  return {
    view(_index, position) {
      const distance = distanceAtPosition(position);
      const segment = segmentAt(distance);
      return { eye: segment.eyeAt(localPosition(segment, distance)) };
    },
    landmarks: landmarks.map(landmark => ({
      ...landmark,
      position: positionAtDistance(landmark.start),
      endPosition: positionAtDistance(landmark.end)
    })),
    length,
    positionAtDistance,
    distanceAtPosition,
    locate
  };
};
