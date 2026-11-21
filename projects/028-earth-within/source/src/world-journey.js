import { MathUtils, Vector3 } from 'three';
import { waterSurfaceAt } from './world-terrain.js';

const speeds = { walk: 2.65, wade: 1.68, swim: 2.05, dive: 1.58 };

export function createJourney(itinerary) {
  const path = [];
  const arrivals = new Map();
  let length = 0;
  for (const [id, chapter] of itinerary) {
    for (const point of chapter.points) {
      const previous = path.at(-1);
      const gap = previous?.position.distanceTo(point.position) ?? 0;
      if (previous && gap < .0001) continue;
      length += gap;
      path.push({ ...point, distance: length });
    }
    arrivals.set(id, { distance: length, target: chapter.target });
  }

  const state = { position: new Vector3(), yaw: 0, pitch: 0, speed: 0, distance: 0, surface: null, floor: 0, medium: 'walk' };
  let destination;
  let goal = null;
  const look = new Vector3();

  function sample(distance) {
    let low = 0;
    let high = path.length - 1;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (path[middle].distance < distance) low = middle;
      else high = middle;
    }
    const a = path[low];
    const b = path[high];
    const t = MathUtils.clamp((distance - a.distance) / (b.distance - a.distance), 0, 1);
    return { a, b, t };
  }

  function place(dt = 0) {
    const previousY = state.position.y;
    const wasSwimming = state.medium === 'swim' || state.medium === 'dive';
    const wasWading = state.medium === 'wade' || wasSwimming;
    const { a, b, t } = sample(state.distance);
    const current = t < .5 ? a : b;
    state.position.lerpVectors(a.position, b.position, t);
    state.floor = MathUtils.lerp(a.floor, b.floor, t);
    state.feet = MathUtils.lerp(a.feet ?? a.floor, b.feet ?? b.floor, t);
    state.crouch = MathUtils.lerp(a.crouch ?? 0, b.crouch ?? 0, t);
    state.airborne = current.airborne ?? false;
    state.lowClearance = current.lowClearance ?? false;
    const authoredSurface = a.surface !== null && b.surface !== null ? MathUtils.lerp(a.surface, b.surface, t) : current.surface;
    const authoredY = state.position.y;
    state.surface = waterSurfaceAt(state.position.x, state.position.z, state.floor);
    const waterDepth = state.surface === null ? 0 : Math.max(0, state.surface - state.feet);
    const swimming = waterDepth > (wasSwimming && dt > 0 ? .98 : 1.19)
      && (!state.airborne || state.surface - (authoredY - 1.64) >= 1.13);
    const diving = swimming && current.medium === 'dive';
    state.medium = swimming ? diving ? 'dive' : 'swim' : waterDepth > (wasWading && dt > 0 ? .10 : .16) ? 'wade' : 'walk';
    if (swimming) {
      const diveDepth = diving && authoredSurface !== null ? Math.max(0, authoredSurface + .26 - authoredY) : 0;
      state.position.y = Math.max(state.floor + .44, state.surface + .26 - diveDepth);
      state.crouch = 0;
      state.airborne = false;
    } else if (!state.airborne) {
      state.position.y = state.feet + 1.64 - state.crouch * .62;
    }
    // A recorded return through a low overhang must retain the safe low pose.
    if (state.lowClearance) {
      state.medium = 'swim';
      state.position.y = authoredY;
      state.crouch = 0;
      state.airborne = false;
    }
    if (dt > 0 && !state.airborne && (waterDepth > .14 || wasSwimming)) {
      state.position.y = Math.max(state.floor + .44, MathUtils.damp(previousY, state.position.y, 12, dt));
    }
  }

  function begin(id) {
    destination = arrivals.get(id) ?? null;
    state.distance = destination?.distance ?? 0;
    state.speed = 0;
    state.pitch = 0;
    place();
    const facing = destination?.target ?? path[1].position;
    state.yaw = Math.atan2(facing.x - state.position.x, facing.z - state.position.z);
  }

  function go(id, signal) {
    signal.throwIfAborted();
    destination = arrivals.get(id);
    if (Math.abs(destination.distance - state.distance) <= .02) return Promise.resolve();
    return new Promise((resolve, reject) => {
      function cancel() {
        goal = null;
        destination = null;
        state.speed = 0;
        reject(signal.reason);
      }
      signal.addEventListener('abort', cancel, { once: true });
      goal = () => {
        goal = null;
        signal.removeEventListener('abort', cancel);
        resolve();
      };
    });
  }

  function update(dt) {
    if (goal) {
      const remaining = destination.distance - state.distance;
      const direction = Math.sign(remaining);
      const targetSpeed = Math.min(state.lowClearance ? 1.15 : speeds[state.medium], Math.sqrt(Math.abs(remaining) * 4.8));
      state.speed = MathUtils.damp(state.speed, targetSpeed, 7, dt);
      state.distance += direction * Math.min(Math.abs(remaining), state.speed * dt);
      if (Math.abs(destination.distance - state.distance) < .02) {
        state.distance = destination.distance;
        state.speed = 0;
        goal();
      }
      place(dt);
      const ahead = sample(MathUtils.clamp(state.distance + direction * 1.05, 0, length));
      look.lerpVectors(ahead.a.position, ahead.b.position, ahead.t).sub(state.position);
    } else {
      state.speed = 0;
      place(dt);
      if (!destination) return;
      look.copy(destination.target).sub(state.position);
    }
    if (Math.hypot(look.x, look.z) < .03) return;
    const delta = Math.atan2(look.x, look.z) - state.yaw;
    state.yaw += Math.atan2(Math.sin(delta), Math.cos(delta)) * (1 - Math.exp(-dt * 7));
    const pitch = state.medium === 'dive' && goal ? Math.atan2(look.y, Math.hypot(look.x, look.z)) : 0;
    state.pitch = MathUtils.damp(state.pitch, MathUtils.clamp(pitch, -.47, .47), 5, dt);
  }

  return { begin, go, update, state, get moving() { return Boolean(goal); } };
}
