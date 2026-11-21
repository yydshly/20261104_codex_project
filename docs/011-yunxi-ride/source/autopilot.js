function createImmortalAutopilot(initialSeed = Math.floor(Math.random() * 4294967296)) {
  const TAU = Math.PI * 2;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
  let randomState, time, stage, stageUntil, goal, routeUntil, nextPlan;
  let heading, entryHeading, plannedHeading, height, pace, cruiseHeight, commandedSpeed, freewheeling, escapeUntil;
  let recentBiomes, lastBiome, lastImpact, lastBlocked;

  function random() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  }

  function between(low, high) {
    return low + (high - low) * random();
  }

  function reset(seed = Math.floor(Math.random() * 4294967296)) {
    randomState = seed >>> 0;
    time = 0;
    stage = "entry";
    stageUntil = between(2.65, 3.6);
    goal = null;
    routeUntil = 0;
    nextPlan = 0;
    heading = null;
    plannedHeading = 0;
    height = 0;
    pace = 5.4;
    cruiseHeight = between(7.0, 10.5);
    commandedSpeed = 0;
    freewheeling = false;
    escapeUntil = 0;
    recentBiomes = [];
    lastBiome = null;
    lastImpact = false;
    lastBlocked = false;
  }

  function obstacle(world, state, y, angle, distance) {
    return clamp(world.obstruction?.(state.x, y, state.z, angle, distance) || 0, 0, 1);
  }

  function noteBiome(world, state) {
    const biome = world.biomeAt?.(state.x, state.z);
    if (biome == null || biome === lastBiome) return;
    recentBiomes = [...recentBiomes.filter(value => value !== biome), biome].slice(-3);
    lastBiome = biome;
  }

  function chooseGoal(state, world) {
    const distance = between(39, 65);
    const direction = random() < .5 ? -1 : 1;
    let best;
    for (const offset of [.22, .59, 1.07, 1.67, -.46, -1.20, -1.78]) {
      const angle = state.heading + direction * offset + between(-.10, .10);
      const x = state.x + Math.cos(angle) * distance, z = state.z + Math.sin(angle) * distance;
      const biome = world.biomeAt?.(x, z);
      const novelty = biome != null && !recentBiomes.includes(biome) ? .31 : 0;
      const near = obstacle(world, state, state.y, angle, 17);
      const score = novelty + random() * .36 - Math.abs(offset) * .24 - near * 1.25;
      if (!best || score > best.score) best = {x, z, score};
    }
    goal = best;
    routeUntil = time + between(6.1, 9.7);
  }

  function takeFlight() {
    stage = "air";
    stageUntil = time + between(11.4, 18.2);
    cruiseHeight = between(6.7, 13.8);
    nextPlan = time;
  }

  function advanceStage(state, world, ground) {
    if (stage === "entry" || stage === "ground") {
      if (state.flight) {
        takeFlight();
      } else if (time >= stageUntil) {
        takeFlight();
        return true;
      }
    } else if (stage === "air" && !state.flight) {
      stage = "ground";
      stageUntil = time + between(.80, 1.8);
      nextPlan = time;
    } else if (stage === "air" && time >= stageUntil) {
      const landingY = ground + .19;
      const obstruction = obstacle(world, state, landingY, plannedHeading, 18);
      if (obstruction < .22) {
        stage = "approach";
        stageUntil = time + 8.5;
        nextPlan = time;
      } else {
        stageUntil = time + between(1.1, 2.6);
      }
    } else if (stage === "approach") {
      if (!state.flight && state.y <= ground + .43) {
        stage = "ground";
        stageUntil = time + between(3.0, 6.7);
        nextPlan = time;
      } else if (time >= stageUntil) {
        takeFlight();
      }
    }
    return false;
  }

  function plan(state, world, ground) {
    const air = state.flight;
    const paceRange = stage === "entry" ? [4.7, 5.5] : stage === "approach" ? [3.7, 4.8]
      : air ? [8.3, 11.0] : [5.2, 7.4];
    pace = clamp(pace, paceRange[0], paceRange[1]);
    if (!goal || time >= routeUntil || Math.hypot(goal.x - state.x, goal.z - state.z) < 10) {
      chooseGoal(state, world);
      pace = between(...paceRange);
      if (stage === "air") cruiseHeight = clamp(cruiseHeight + between(-3.0, 4.1), 5.0, 16.0);
    }
    const preferred = stage === "entry" ? entryHeading + Math.sin(time * .62) * .075
      : Math.atan2(goal.z - state.z, goal.x - state.x);
    const lookahead = clamp(10 + Math.max(0, state.speed) * .95, 12, 23);
    const forwardRisk = obstacle(world, state, state.y, state.heading, lookahead);
    const altitude = Math.max(0, state.y - ground);
    const approaching = stage === "approach";
    const nominalHeight = approaching ? .12 : cruiseHeight + Math.sin(time * .40) * 1.3;
    height = nominalHeight;

    let best;
    const fan = [0, -.29, .29, -.57, .57, -.91, .91, -1.34, 1.34, -1.84, 1.84];
    for (const offset of fan) {
      const angle = state.heading + offset;
      const risk = obstacle(world, state, state.y, angle, lookahead);
      const lowRisk = approaching ? obstacle(world, state, ground + .22, angle, lookahead) : 0;
      const aimCost = Math.abs(wrap(angle - preferred)) * .55;
      const changeCost = Math.abs(wrap(angle - plannedHeading)) * .11;
      const cost = risk * 4.1 + lowRisk * 2.6 + Math.abs(offset) * .16 + aimCost + changeCost;
      if (!best || cost < best.cost) best = {angle, risk, lowRisk, cost};
    }
    plannedHeading = best.angle;
    if (forwardRisk > .38 || best.risk > .25) {
      pace = Math.min(pace, 3.2);
      if (air && !approaching && best.risk > .2) {
        const aboveRisk = obstacle(world, state, state.y + 3.4, plannedHeading, lookahead);
        if (aboveRisk < best.risk) height = Math.max(height, altitude + 3.6);
      }
    }
    if (approaching && best.lowRisk > .14) {
      height = Math.max(1.9, Math.min(altitude, 3.4));
      pace = Math.min(pace, 3.8);
    }
    if (time < escapeUntil && air) height = Math.max(height, altitude + 2.2);
    height = Math.min(23, height);
  }

  function update(dt, state, world = {}) {
    dt = clamp(dt, 0, .20);
    time += dt;
    const ground = world.groundHeight?.(state.x, state.z) ?? 0;
    noteBiome(world, state);
    if (heading === null) {
      heading = entryHeading = state.heading;
      plannedHeading = heading;
    }
    const impact = state.impact > .36, blocked = Boolean(state.blocked);
    if ((impact && !lastImpact) || (blocked && !lastBlocked)) {
      escapeUntil = time + .85;
      nextPlan = time;
      if (!state.flight && stage !== "entry") stageUntil = Math.min(stageUntil, time + .40);
    }
    lastImpact = impact;
    lastBlocked = blocked;
    const toggleFlight = advanceStage(state, world, ground);
    if (time >= nextPlan) {
      plan(state, world, ground);
      nextPlan = time + .27;
    }
    const escaping = time < escapeUntil;
    const adjustment = (escaping ? 2.7 : state.flight ? 1.08 : 1.25) * dt;
    heading = wrap(heading + clamp(wrap(plannedHeading - heading), -adjustment, adjustment));

    const error = wrap(heading - state.heading);
    const grounded = !state.flight && (state.contactRear > .55 || state.contactFront > .55);
    const grade = grounded ? state.grade || 0 : 0;
    const climb = clamp(grade / .29, 0, 1);
    const targetSpeed = pace * (1 - .58 * clamp((Math.abs(error) - .16) / 1.35, 0, 1)) * (1 - .24 * climb);
    const immediate = obstacle(world, state, state.y, state.heading, Math.max(4, state.speed * .53 + 2));
    const brake = immediate > .57 && state.speed > 1.25;
    const backing = escaping && !state.flight && immediate > .57 && Math.abs(state.speed) < 2.0 &&
      obstacle(world, state, state.y, state.heading + TAU / 2, 4) < .19;
    const safePace = targetSpeed * clamp((.58 - immediate) / .30, 0, 1);
    commandedSpeed += (safePace - commandedSpeed) * (1 - Math.exp(-dt * 4.4));
    const slopeDrive = -9.6 * Math.sin(grade);
    const rollingLoss = 1.12 + .027 * state.speed ** 2;
    const shouldDrive = !grounded || backing || brake || immediate > .32;
    freewheeling = !shouldDrive && (freewheeling
      ? grade < -.055 && state.speed > commandedSpeed * .63
      : grade < -.075 && state.speed > Math.max(2.3, commandedSpeed * .86) && slopeDrive > rollingLoss * .82);
    const cruiseLimit = commandedSpeed + 1.55;
    const speedCommand = backing ? -2.5 : brake ? 0 : freewheeling
      ? (state.speed > cruiseLimit ? cruiseLimit : undefined)
      : commandedSpeed;
    const turn = Math.abs(error) > .022 ? clamp(error * 3.2, -1, 1) : 0;
    const steer = state.speed < -.08 || (backing && state.speed <= .08) ? -turn : turn;
    const desiredAltitude = ground + height;
    const projectedAltitude = state.y + (state.verticalSpeed || 0) * .38;
    const finalDescent = stage === "approach" && height < .20;
    return {
      targetSpeed: speedCommand,
      steer,
      coast: freewheeling,
      ascend: state.flight && desiredAltitude - projectedAltitude > .47,
      descend: state.flight && (finalDescent || projectedAltitude - desiredAltitude > .53),
      toggleFlight
    };
  }

  reset(initialSeed);
  return {update, reset};
}
