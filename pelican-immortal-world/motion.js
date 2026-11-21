function createImmortalMotion(groundHeight = () => 0, collision) {
  const TAU = Math.PI * 2;
  const ROAD_SPACING = 1.6;
  const HISTORY_SPACING = 1.05;
  const HISTORY_LIFETIME = 5.2;
  const REAR_AXLE = -1.48;
  const FRONT_AXLE = 1.49;
  const WHEEL_RADIUS = .805;
  const TIRE_RADIUS = .061;
  const GRAVITY = 9.6;
  const state = {};
  let flightTarget, roadLength, roadDirection, previousDirection, lastMark, tracks, routeSeed;

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const damp = (from, to, rate, dt) => mix(from, to, 1 - Math.exp(-rate * dt));
  const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  function approach(value, target, maximumChange) {
    return value + clamp(target - value, -maximumChange, maximumChange);
  }

  function hash(index, salt) {
    let bits = Math.imul(index ^ salt ^ routeSeed, 0x45d9f3b);
    bits = Math.imul(bits ^ bits >>> 16, 0x45d9f3b);
    return ((bits ^ bits >>> 16) >>> 0) / 4294967296;
  }

  function noise(distance, salt) {
    const index = Math.floor(distance);
    const fraction = distance - index;
    const eased = fraction * fraction * (3 - 2 * fraction);
    return mix(hash(index, salt), hash(index + 1, salt), eased);
  }

  function pathStyle(distance) {
    return {
      width: .75 + noise(distance * .19, 18739) * .46,
      kind: Math.floor(hash(Math.floor(distance / 2.8), 80917) * 4)
    };
  }

  function mark(x, y, z, distance, time) {
    return { x, y, z, distance, time, ...pathStyle(distance) };
  }

  function updateHistory() {
    tracks = tracks.filter(point => state.time - point.time < HISTORY_LIFETIME && state.distance - point.distance < 28);
    state.history = tracks.map(({ time, distance, ...point }) => ({
      ...point,
      distance,
      alpha: .82 * clamp(1 - (state.time - time) / HISTORY_LIFETIME, 0, 1) *
        clamp(1 - (state.distance - distance) / 28, 0, 1)
    }));
  }

  function surfaceAt(x, z, probeY) {
    return Math.max(groundHeight(x, z), collision?.surfaceHeight(x, z, probeY + .12) ?? -Infinity);
  }

  // Project the tread onto the road normal, using the same pitch and roll as the rider model.
  function roadPoint(offset, pitch = state.pitch, bank = state.bank) {
    const cos = Math.cos(state.heading), sin = Math.sin(state.heading);
    const along = offset * Math.cos(pitch) + TIRE_RADIUS * Math.sin(pitch) * (1 - Math.cos(bank));
    const across = TIRE_RADIUS * Math.sin(bank);
    const x = state.x + cos * along - sin * across;
    const z = state.z + sin * along + cos * across;
    return [x, surfaceAt(x, z, state.y), z];
  }

  function wheelOffset(offset, pitch = state.pitch, bank = state.bank) {
    return offset * Math.sin(pitch) + TIRE_RADIUS * Math.cos(pitch) * (Math.cos(bank) - 1);
  }

  function roadPitch() {
    const wheelbase = FRONT_AXLE - REAR_AXLE;
    const rearY = roadPoint(REAR_AXLE, 0)[1], frontY = roadPoint(FRONT_AXLE, 0)[1];
    const estimate = clamp(Math.atan2(frontY - rearY, wheelbase), -.36, .36);
    const rear = roadPoint(REAR_AXLE, estimate), front = roadPoint(FRONT_AXLE, estimate);
    return clamp(Math.atan2(front[1] - rear[1], wheelbase * Math.cos(estimate)), -.36, .36);
  }

  function restHeight() {
    const rear = roadPoint(REAR_AXLE), front = roadPoint(FRONT_AXLE);
    return Math.max(rear[1] - wheelOffset(REAR_AXLE), front[1] - wheelOffset(FRONT_AXLE));
  }

  function updateSupport() {
    state.rearPoint = roadPoint(REAR_AXLE);
    state.frontPoint = roadPoint(FRONT_AXLE);
    const contact = (point, offset) => state.flight ? 0 :
      1 - clamp((state.y + wheelOffset(offset) - point[1] - .012) / .11, 0, 1);
    state.contactRear = contact(state.rearPoint, REAR_AXLE);
    state.contactFront = contact(state.frontPoint, FRONT_AXLE);
    const settled = state.contactRear > .32 || state.contactFront > .32;
    state.roadSupport = settled ? [-2.18, -1.48, -.68, 0, .71, 1.49, 2.15].map(offset => {
      const [x, y, z] = roadPoint(offset * previousDirection, state.pitch, 0);
      const distance = state.distance + offset;
      return { x, y, z, distance, alpha: .98, ...pathStyle(distance) };
    }) : [];
  }

  function predictRoad(direction, verticalTravel) {
    const count = Math.max(2, Math.ceil(roadLength / ROAD_SPACING));
    const spacing = roadLength / count;
    const airborne = state.flight || (state.contactRear < .12 && state.contactFront < .12);
    let x = state.x;
    let z = state.z;
    let tangent = direction;
    const points = [];

    for (let i = 0; i <= count; i++) {
      const ahead = spacing * i;
      if (i > 0) {
        const wander = noise((state.distance + ahead) * .135, 9689) - .5;
        tangent += wander * .124 * spacing * clamp((ahead - 1.8) / 3, 0, 1);
        const elevation = airborne ? state.y + clamp(verticalTravel * (ahead - spacing), -3, 3) : surfaceAt(x, z, state.y);
        if (collision?.obstruction(x, elevation, z, tangent, spacing) > .12) break;
        x += Math.cos(tangent) * spacing;
        z += Math.sin(tangent) * spacing;
      }
      const terrain = surfaceAt(x, z, state.y);
      const flyingY = state.y + clamp(verticalTravel * ahead, -3, 3);
      const y = airborne ? Math.max(terrain - .02, flyingY - .15) : terrain;
      const alpha = clamp((roadLength - ahead) / 4.8, 0, 1) * .96;
      points.push({ x, y: airborne ? y - .042 : y, z, alpha, distance: state.distance + ahead, ...pathStyle(state.distance + ahead) });
    }
    if (points.length < count + 1 && points.length > 1) {
      points[points.length - 1].alpha *= .57;
    }
    state.road = points;
  }

  function reset() {
    routeSeed = Math.floor(Math.random() * 4294967296);
    Object.assign(state, {
      x: 0, y: groundHeight(0, 0), z: 0, heading: 0, flight: false, speed: 0, bank: 0, pitch: 0,
      distance: 0, time: 0, phase: -.83, wheelPhase: 0, verticalSpeed: 0,
      impact: 0, blocked: false, landing: 0, load: .62, contactRear: 1, contactFront: 1, grade: 0,
      gearRatio: 1.45, pedalEngagement: 0, cadence: 0, wheelRpm: 0, animation: "idle"
    });
    flightTarget = state.y;
    roadLength = 4.2;
    roadDirection = 0;
    previousDirection = 1;
    lastMark = 0;
    state.grade = state.pitch = roadPitch();
    state.y = restHeight();
    tracks = [-3.2, -2.1, -1.05].map(x => mark(x, groundHeight(x, 0), 0, x, -1.4));
    updateHistory();
    updateSupport();
    predictRoad(0, 0);
  }

  function parkAt({ x, y, z, heading }) {
    if (![x, y, z, heading].every(Number.isFinite) ||
        Math.hypot(x - state.x, z - state.z) > 1.6 || Math.abs(y - state.y) > 1.25) return false;
    const goal = { x, y, z, heading: wrap(heading), pitch: 0 };
    const resolved = collision?.resolve(state, goal);
    if (resolved && (resolved.hit || Math.hypot(resolved.x - x, resolved.y - y, resolved.z - z) > .025)) return false;

    const saved = { x: state.x, y: state.y, z: state.z, heading: state.heading, pitch: state.pitch, bank: state.bank };
    Object.assign(state, goal, { bank: 0 });
    const pitch = roadPitch();
    state.pitch = pitch;
    const rest = restHeight();
    if (Math.abs(rest - y) > .15 || Math.abs(pitch) > .20) {
      Object.assign(state, saved);
      return false;
    }

    Object.assign(state, {
      y: rest, grade: pitch, flight: false, speed: 0, verticalSpeed: 0, blocked: false, impact: 0,
      landing: 0, load: .62, pedalEngagement: 0, cadence: 0, wheelRpm: 0, animation: "idle"
    });
    flightTarget = state.y;
    roadLength = 4.2;
    previousDirection = 1;
    roadDirection = state.heading;
    lastMark = state.distance;
    tracks = [];
    updateHistory();
    updateSupport();
    predictRoad(roadDirection, 0);
    return true;
  }

  function toggleFlight() {
    state.flight = !state.flight;
    if (state.flight) {
      flightTarget = Math.max(state.y + 2.25, surfaceAt(state.x, state.z, state.y) + 2.55);
      state.landing = 0;
    }
    return state.flight;
  }

  function step(delta, input = {}) {
    const dt = clamp(delta, 0, .08);
    if (!dt) return state;

    const throttle = Number(Boolean(input.forward)) - Number(Boolean(input.back));
    const steering = Number.isFinite(input.steer) ? clamp(input.steer, -1, 1) :
      Number(Boolean(input.right)) - Number(Boolean(input.left));
    const vertical = Number(Boolean(input.ascend)) - Number(Boolean(input.descend));
    const airborne = state.flight;
    const topSpeed = airborne ? 17 : 13.4;
    const priorSpeed = state.speed;
    const wasSupported = state.contactRear > .55 || state.contactFront > .55;
    const gravity = !airborne && wasSupported ? -GRAVITY * Math.sin(state.grade) : 0;
    const guided = Number.isFinite(input.targetSpeed);
    const climb = !airborne && wasSupported ? clamp(state.grade / .29, 0, 1) : 0;
    const poweredPace = topSpeed * (1 - .29 * climb);
    const targetSpeed = guided ? clamp(input.targetSpeed, -4.7, topSpeed) :
      throttle > 0 ? poweredPace : throttle < 0 ? -4.7 : 0;
    const braking = targetSpeed * priorSpeed < 0 ||
      (guided && Math.abs(targetSpeed) + .65 < Math.abs(priorSpeed));
    if (guided || throttle) {
      const drive = braking ? 18 : targetSpeed >= 0 ? 9.9 : 6.2;
      const adjustment = Math.sign(targetSpeed - priorSpeed) * gravity;
      state.speed = approach(priorSpeed, targetSpeed, (drive + adjustment) * dt);
    } else if (!airborne && wasSupported && Math.abs(priorSpeed) > .12) {
      const drag = 1.12 + .027 * priorSpeed ** 2;
      const next = priorSpeed + (gravity - Math.sign(priorSpeed) * drag) * dt;
      state.speed = priorSpeed * next > 0 ? clamp(next, -4.7, topSpeed) : 0;
    } else {
      state.speed = approach(priorSpeed, 0, (airborne ? 3.4 : 4.4) * dt);
    }

    const signedTravel = (state.speed + priorSpeed) * .5 * dt;
    const direction = signedTravel < 0 ? -1 : 1;
    const steeringAuthority = clamp(Math.abs(state.speed) / 3.5, airborne ? .44 : .26, 1);
    const turnRate = steering * steeringAuthority * (airborne ? 1.57 : 1.82) * direction;
    const midHeading = state.heading + turnRate * dt * .5;
    const before = { x: state.x, y: state.y, z: state.z, heading: state.heading, pitch: state.pitch,
      distance: state.distance, time: state.time };
    state.heading = wrap(state.heading + turnRate * dt);
    state.x += Math.cos(midHeading) * signedTravel;
    state.z += Math.sin(midHeading) * signedTravel;
    state.time += dt;
    state.impact = Math.max(0, state.impact - dt * 2.6);
    state.landing = Math.max(0, state.landing - dt * 1.72);
    state.blocked = false;
    let terrain = surfaceAt(state.x, state.z, before.y);
    if (airborne) {
      const guidedAltitude = Number.isFinite(input.targetAltitude);
      const desired = guidedAltitude ? input.targetAltitude : flightTarget + vertical * (vertical > 0 ? 5.8 : 6.7) * dt;
      flightTarget = clamp(desired, terrain - .03, groundHeight(state.x, state.z) + 44);
      state.y = damp(state.y, flightTarget, 3.25, dt);
      if (!guidedAltitude && vertical < 0 && state.y < terrain + .21) state.flight = false;
    } else {
      const fallSpeed = Math.min(13, Math.max(0, -state.verticalSpeed) + dt * GRAVITY);
      state.y = wasSupported && state.y < terrain + .39 ? terrain : Math.max(terrain, state.y - fallSpeed * dt);
    }
    state.y = Math.max(terrain, state.y);
    const resolved = collision?.resolve(before, state);
    if (resolved) {
      state.x = resolved.x;
      state.y = resolved.y;
      state.z = resolved.z;
      state.heading = resolved.heading ?? state.heading;
      if (resolved.hit && Math.hypot(resolved.nx, resolved.nz) > .01) {
        state.blocked = true;
        state.impact = Math.max(state.impact, clamp(Math.abs(state.speed) / 9, .25, 1));
        state.speed *= .20;
      }
      if (resolved.ceiling) {
        flightTarget = Math.min(flightTarget, state.y + .08);
        state.impact = Math.max(.48, state.impact);
      }
      if (resolved.floor !== undefined && vertical < 0 && !Number.isFinite(input.targetAltitude)) state.flight = false;
    }
    const traveledX = state.x - before.x, traveledZ = state.z - before.z;
    const travel = Math.hypot(traveledX, traveledZ);
    const actualSigned = traveledX * Math.cos(midHeading) + traveledZ * Math.sin(midHeading);
    state.distance += travel;

    terrain = surfaceAt(state.x, state.z, state.y);
    state.grade = roadPitch();
    const speedForPitch = Math.max(3, Math.abs(state.speed));
    const verticalSpeed = (state.y - before.y) / dt;
    const nearRoad = !state.flight && state.y < terrain + .22;
    const airPitch = clamp(verticalSpeed / speedForPitch, -.26, .31) * direction;
    state.pitch = nearRoad ? state.grade : damp(state.pitch, airPitch, 7.5, dt);
    const targetBank = steering * clamp(Math.abs(state.speed) / 8, .1, 1) * (airborne ? .34 : .24);
    state.bank = damp(state.bank, targetBank, 8.4, dt);
    if (!state.flight && !resolved?.ceiling) {
      const restY = restHeight();
      state.y = nearRoad ? restY : Math.max(state.y, restY);
    }
    state.verticalSpeed = (state.y - before.y) / dt;
    updateSupport();
    const supported = state.contactRear > .55 || state.contactFront > .55;
    const wheelTravel = supported ? actualSigned / Math.cos(state.grade) : actualSigned;
    const wheelTurn = -wheelTravel / WHEEL_RADIUS;
    state.wheelPhase = (state.wheelPhase + wheelTurn) % TAU;
    state.wheelRpm = Math.abs(wheelTurn) / dt * 60 / TAU;
    const pedaling = (guided ? Math.abs(targetSpeed) > .18 : throttle !== 0) &&
      !input.coast && !braking && !state.blocked;
    const terrainGrade = supported ? state.grade : 0;
    const naturalRatio = clamp(1.29 + Math.abs(state.speed) * .084 - terrainGrade * 2.50, 1.13, 2.88);
    const rhythm = pedaling && supported && Number.isFinite(input.cadenceTarget) && input.cadenceTarget > 0
      ? clamp(input.rhythmStrength || 0, 0, 1) : 0;
    const musicRatio = rhythm ? clamp(state.wheelRpm / input.cadenceTarget, naturalRatio * .86, naturalRatio * 1.15) : naturalRatio;
    const nextRatio = clamp(mix(naturalRatio, musicRatio, rhythm), 1.13, 2.88);
    const priorRatio = state.gearRatio, priorEngagement = state.pedalEngagement;
    state.gearRatio = damp(priorRatio, nextRatio, 4.7, dt);
    state.pedalEngagement = damp(priorEngagement, pedaling ? 1 : 0, pedaling ? 10 : 9, dt);
    // A driven crank follows the same rolling distance as the wheel. Release only for the freewheel.
    const crankTurn = wheelTurn * (priorEngagement + state.pedalEngagement) / (priorRatio + state.gearRatio);
    state.phase = (state.phase + crankTurn) % TAU;
    state.cadence = Math.abs(crankTurn) / dt * 60 / TAU;
    if (!wasSupported && supported) state.landing = Math.max(state.landing, .72 + clamp(-verticalSpeed * .10, 0, .28));
    const traction = (state.speed - priorSpeed) / dt - gravity;
    const accelerationLoad = clamp(traction * .020, -.20, .18);
    const targetLoad = state.contactRear * clamp(.64 + Math.tan(state.grade) * .31 + accelerationLoad + state.landing * .13, 0, 1);
    state.load = state.contactRear > 0 ? damp(state.load, targetLoad, 13, dt) : 0;
    state.animation = state.blocked || state.impact > .38 ? "bump" : state.landing > .15 ? "land" :
      state.flight || !supported ? "flight" : Math.abs(state.speed) < .22 ? "idle" : pedaling ? "pedal" : "coast";

    while (state.distance - lastMark >= HISTORY_SPACING && travel > 0) {
      lastMark += HISTORY_SPACING;
      const t = clamp((lastMark - before.distance) / travel, 0, 1);
      tracks.push(mark(mix(before.x, state.x, t), mix(before.y, state.y, t) - (supported ? .02 : .15), mix(before.z, state.z, t),
        lastMark, mix(before.time, state.time, t)));
    }
    updateHistory();

    if (travel > .005) {
      const travelHeading = wrap(state.heading + (direction < 0 ? Math.PI : 0));
      if (direction !== previousDirection) {
        roadDirection = travelHeading;
        roadLength = Math.min(roadLength, 4.2);
        previousDirection = direction;
        updateSupport();
      }
      roadDirection = wrap(roadDirection + wrap(travelHeading - roadDirection) * (1 - Math.exp(-10 * dt)));
      const targetLength = 6.4 + clamp(Math.abs(state.speed) * .84, 0, airborne ? 13.6 : 11.8);
      roadLength = approach(roadLength, targetLength, travel * 1.34);
      predictRoad(roadDirection, state.verticalSpeed / speedForPitch * .54);
    } else if (Math.abs(state.verticalSpeed) > .04) {
      roadLength = approach(roadLength, 4.2, Math.abs(state.verticalSpeed) * dt * 2.4);
      predictRoad(roadDirection, 0);
    } else if (Math.abs(turnRate) > .002) {
      roadDirection = wrap(state.heading + (previousDirection < 0 ? Math.PI : 0));
      predictRoad(roadDirection, 0);
    }
    return state;
  }

  reset();
  return { state, step, reset, toggleFlight, parkAt };
}
