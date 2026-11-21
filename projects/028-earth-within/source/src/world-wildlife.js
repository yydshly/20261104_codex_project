import { MathUtils, Vector3 } from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';

const nearest = new Vector3();
const axis = new Vector3();
const fallback = new Vector3();

export function createWildlifeVisitor() {
  const state = { position: new Vector3(), a: new Vector3(), b: new Vector3(), velocity: new Vector3(), radius: .36, speed: 0 };
  const previous = new Vector3();
  let ready = false;
  return {
    state,
    update(position, medium, yaw, feet, dt) {
      if (!position) { ready = false; return null; }
      const gap = ready ? previous.distanceTo(position) : 0;
      state.velocity.copy(position).sub(previous).multiplyScalar(ready && gap < 3 && dt > 0 ? 1 / dt : 0);
      state.speed = state.velocity.length();
      state.position.copy(position);
      state.a.copy(position);
      state.b.copy(position);
      if (medium === 'swim' || medium === 'dive' || medium === 'low') {
        state.a.y -= .12;
        state.b.addScaledVector(fallback.set(Math.sin(yaw), 0, Math.cos(yaw)), -.95);
        state.b.y -= .25;
      } else {
        state.a.y -= .10;
        state.b.y = Number.isFinite(feet) ? feet + .24 : position.y - 1.35;
      }
      previous.copy(position);
      ready = true;
      return state;
    },
  };
}

export function distanceToVisitor(point, visitor, away = null) {
  if (!visitor) return Infinity;
  const head = visitor.a ?? visitor.position ?? visitor;
  const tail = visitor.b ?? fallback.copy(head).addScaledVector(axis.set(0, 1, 0), -1.15);
  axis.copy(head).sub(tail);
  const t = MathUtils.clamp(nearest.copy(point).sub(tail).dot(axis) / Math.max(.0001, axis.lengthSq()), 0, 1);
  nearest.copy(tail).addScaledVector(axis, t);
  const distance = point.distanceTo(nearest);
  if (away) {
    away.copy(point).sub(nearest);
    if (distance > .0001) away.divideScalar(distance);
    else away.set(1, .15, 0).normalize();
  }
  return distance - (visitor.radius ?? .36);
}

export function wildlifeBlocks(birds, x, y, z, floor, swimming, feet = floor, crouch = 0) {
  const bottom = swimming ? y - .39 : Math.max(floor + .1, feet + .02);
  const top = swimming ? y + .18 : feet + 1.78 - crouch * .62;
  return birds.some((bird) => top > bird.position.y - (bird.bottomOffset ?? 0) && bottom < bird.position.y + bird.height
    && Math.hypot(x - bird.position.x, z - bird.position.z) < .24 + bird.radius);
}

// Small wildlife moves from its actual position, with a bounded home range and
// swept obstacle checks. The same visitor capsule includes wading legs.
export function createSmallAnimalAgent(object, { home, flying = false, range = 3, alert = 3,
  speed = 1, radius = .14, floorOffset = .03, phase = 0 } = {}) {
  const origin = new Vector3(...home);
  const state = { position: origin.clone(), fear: 0, speed: 0, mode: 'forage' };
  const target = origin.clone(), away = new Vector3(), next = new Vector3(), local = new Vector3();
  let heading = phase;
  object.position.copy(origin);
  if (object.parent) { object.parent.updateWorldMatrix(true, false); object.parent.worldToLocal(object.position); }
  return { state, update(dt, time, visitor, collision, rain = 0) {
    dt = MathUtils.clamp(dt, 0, .08);
    const before = state.position.clone();
    const distance = distanceToVisitor(state.position, visitor, away);
    state.fear = distance < alert ? Math.max(state.fear, 1 - MathUtils.smoothstep(distance, .3, alert))
      : MathUtils.damp(state.fear, 0, .9, dt);
    state.mode = state.fear > .12 ? 'flee' : rain > .5 && flying ? 'shelter' : 'forage';
    if (state.mode === 'flee') {
      away.y = flying ? .32 : 0;
      away.normalize();
      target.copy(state.position).addScaledVector(away, 2);
    } else {
      target.set(origin.x + Math.sin(time * .48 + phase) * range * .5,
        origin.y + (flying ? Math.sin(time * 1.4 + phase) * .24 : 0),
        origin.z + Math.cos(time * .37 + phase) * range * .42);
      if (state.mode === 'shelter') target.copy(origin).add(local.set(0, -.35, 0));
    }
    local.subVectors(target, origin);
    local.y = 0;
    if (local.length() > range) { local.setLength(range); target.x = origin.x + local.x; target.z = origin.z + local.z; }
    const motionSpeed = speed * (state.mode === 'flee' ? 1.8 : .55);
    local.subVectors(target, state.position).clampLength(0, motionSpeed * dt);
    const steps = Math.max(1, Math.ceil(local.length() / .045));
    local.divideScalar(steps);
    for (let i = 0; i < steps; i++) {
      for (const angle of [0, .7, -.7, 1.4, -1.4]) {
        next.copy(state.position);
        next.x += local.x * Math.cos(angle) - local.z * Math.sin(angle);
        next.z += local.x * Math.sin(angle) + local.z * Math.cos(angle);
        const floor = groundSurfaceHeight(next.x, next.z);
        next.y = flying ? Math.max(floor + .55, Math.min(origin.y + 1.6, next.y + local.y)) : Math.max(origin.y, floor + floorOffset);
        if (Math.hypot(next.x - origin.x, next.z - origin.z) > range + .001
          || collision?.cameraBlocked(next.clone().add(new Vector3(0, radius, 0)), radius)
          || distanceToVisitor(next, visitor) < Math.min(.65, distanceToVisitor(state.position, visitor))) continue;
        state.position.copy(next);
        break;
      }
    }
    state.speed = dt > 0 ? state.position.distanceTo(before) / dt : 0;
    if (state.speed > .015) {
      const angle = Math.atan2(state.position.x - before.x, state.position.z - before.z);
      heading += Math.atan2(Math.sin(angle - heading), Math.cos(angle - heading)) * (1 - Math.exp(-10 * dt));
    }
    object.position.copy(state.position);
    if (object.parent) object.parent.worldToLocal(object.position);
    object.rotation.y = heading;
    return state;
  } };
}

// World-space motion is shared by the wetland birds and the swallow near the cabin.
export function createBirdAgent(object, { home, airborne = false, phase = 0 } = {}) {
  const state = { position: new Vector3(...home), radius: airborne ? .85 : .65,
    height: airborne ? .5 : 1.2, bottomOffset: airborne ? .3 : 0, fear: 0, flying: airborne,
    flightBlend: airborne ? 1 : 0, legTuck: 0, mode: airborne ? 'cruise' : 'forage' };
  const origin = state.position.clone();
  const direction = new Vector3();
  const target = new Vector3();
  const candidate = new Vector3();
  const local = new Vector3();
  let quiet = 0;
  let heading = phase;
  function safe(point, collision) {
    return point.y >= groundSurfaceHeight(point.x, point.z) + (airborne ? .38 : state.flying ? .005 : -.01)
      && !collision?.cameraBlocked(point.clone().add(local.set(0, airborne ? .18 : .65, 0)), state.flying ? .34 : .27);
  }
  return {
    state,
    update(dt, time, visitor, collision, cruise = null) {
      dt = MathUtils.clamp(dt, 0, .08);
      const body = target.copy(state.position).add(local.set(0, airborne ? .1 : .65, 0));
      const distance = distanceToVisitor(body, visitor, direction);
      const alert = 4.8 + Math.min(1.7, (visitor?.speed ?? 0) * .32);
      if (distance < alert) {
        state.fear = Math.max(state.fear, 1 - MathUtils.smoothstep(distance, 1, alert));
        quiet = 0;
      } else { quiet += dt; state.fear = MathUtils.damp(state.fear, 0, .55, dt); }
      if (state.fear > .10) { state.flying = true; state.mode = 'flee'; }
      else if (state.flying && quiet > 9) state.mode = airborne ? 'cruise' : 'return';
      else if (!airborne && state.flying && quiet > 1.5) state.mode = 'circle';
      if (!airborne && quiet > 1.5 && distance > alert && state.position.distanceTo(origin) > 10) state.mode = 'circle';
      if (airborne && quiet > 2 && state.position.distanceTo(origin) > 15) state.mode = 'cruise';

      if (state.mode === 'flee') {
        direction.y = 0;
        if (direction.lengthSq() < .01) direction.set(Math.cos(phase), 0, Math.sin(phase));
        direction.normalize();
        target.copy(state.position).addScaledVector(direction, 4);
        target.y = Math.max(origin.y + (airborne ? 3.4 : 2.8), groundSurfaceHeight(target.x, target.z) + 2.4);
      } else if (state.mode === 'return') target.copy(origin);
      else if (state.mode === 'circle') target.set(origin.x + Math.cos(time * .23 + phase) * 7,
        origin.y + 3, origin.z + Math.sin(time * .23 + phase) * 5);
      else if (airborne && cruise) target.copy(cruise);
      else target.copy(origin);

      if (!airborne && state.mode === 'return' && state.position.distanceTo(origin) < .7 && distance > 3) state.flying = false;

      if (state.flying) {
        const floor = groundSurfaceHeight(target.x, target.z);
        const surface = waterSurfaceAt(target.x, target.z, floor);
        if (state.mode !== 'return') target.y = Math.max(target.y, floor + 1.7, (surface ?? -Infinity) + 1.5);
      }
      direction.subVectors(target, state.position);
      const speed = state.mode === 'flee' ? 4.4 : state.flying ? 2.5 : .45;
      const length = direction.length();
      if (length > .001) {
        direction.multiplyScalar(Math.min(speed * dt, length) / length);
        const steps = Math.max(1, Math.ceil(direction.length() / .08));
        direction.divideScalar(steps);
        for (let i = 0; i < steps; i++) {
          candidate.copy(state.position).add(direction);
          if (safe(candidate, collision) && distanceToVisitor(candidate, visitor) > .70) state.position.copy(candidate);
          else {
            candidate.copy(state.position).add(local.set(-direction.z, Math.max(dt * 1.4 / steps, direction.y), direction.x));
            if (safe(candidate, collision) && distanceToVisitor(candidate, visitor) >= distanceToVisitor(state.position, visitor) - .001) state.position.copy(candidate);
          }
        }
        const angle = Math.atan2(direction.x, direction.z);
        heading += Math.atan2(Math.sin(angle - heading), Math.cos(angle - heading)) * (1 - Math.exp(-8 * dt));
      }
      if (!airborne && state.mode === 'return' && state.position.distanceTo(origin) < .06) {
        state.flying = false;
        state.mode = 'forage';
      }
      state.radius = airborne ? .85 : state.flying ? .98 : .65;
      state.height = airborne ? .5 : 1.25;
      const landing = state.mode === 'return' || !state.flying;
      const altitude = Math.max(0, state.position.y - origin.y);
      state.flightBlend = MathUtils.damp(state.flightBlend, state.flying || altitude > .1 ? 1 : 0, 7, dt);
      state.legTuck = MathUtils.damp(state.legTuck, landing ? MathUtils.smoothstep(altitude, .35, 1.4)
        : MathUtils.smoothstep(altitude, .2, .9), 8, dt);
      object.parent?.updateWorldMatrix(true, false);
      local.copy(state.position);
      if (object.parent) object.parent.worldToLocal(local);
      object.position.copy(local);
      object.rotation.y = heading;
      object.rotation.x = state.flying ? -.13 : 0;
      return state;
    },
  };
}
