import { MathUtils, Vector3 } from 'three';
import { groundSurfaceHeight, riverCurrentAt, waterSurfaceAt } from './world-terrain.js';

const EYE_HEIGHT = 1.64;
const SWIM_DEPTH = 1.19;
const SURFACE_EYE = .26;
const MAX_PITCH = Math.PI / 2 - .065;
const MAX_UPHILL_GRADE = 1.08;
const MAX_DOWNHILL_GRADE = 1.28;
const SEABED_CLEARANCE = .44;
const JUMP_SPEED = 4.45;
const GRAVITY = 13.2;
const WALK_SPEED = 2.75;
const RUN_SPEED = 5.8;
const JUMP_WATER_DEPTH = SWIM_DEPTH - .06;
const WATER_PLAY_DURATION = 1.4;
const WALK_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
  'ShiftLeft', 'ShiftRight', 'Space', 'KeyC', 'ControlLeft', 'ControlRight', 'KeyF',
]);
export function createWalker(camera, canvas, collision, weather = null, sampleGround = null) {
  const keys = new Set();
  const position = camera.position;
  const current = new Vector3();
  const swimMotion = new Vector3();
  let active = false;
  let yaw = 0;
  let pitch = 0;
  let floor = 0;
  let feet = 0;
  let crouch = 0;
  let grounded = true;
  let verticalSpeed = 0;
  let airSpeed = WALK_SPEED;
  let jumpPending = false;
  let sprinting = false;
  let water = -Infinity;
  let swimming = false;
  let wading = false;
  let waterRecovery = 0;
  let lowClearance = false;
  let touchX = 0;
  let touchY = 0;
  let vertical = 0;
  let touchCrouch = false;
  let touchSprint = false;
  let velocityX = 0;
  let velocityZ = 0;
  let pointer = null;
  let pointerX = 0;
  let pointerY = 0;
  const waterEvents = [];
  let actionPending = false, diveActive = false, diveX = 0, diveZ = 0;
  let playTime = -1, actionCooldown = 0, impactCooldown = 0;
  let entrySink = 0, entryRecovery = 0, actionNote = '', noteTime = 0;

  const isDown = (...codes) => codes.some((code) => keys.has(code));
  const eyeHeight = () => EYE_HEIGHT - .62 * crouch;

  function releasePointer() {
    if (pointer === null) return;
    const captured = pointer;
    pointer = null;
    if (canvas.hasPointerCapture(captured)) canvas.releasePointerCapture(captured);
  }

  function clearInputs() {
    keys.clear();
    touchX = 0;
    touchY = 0;
    vertical = 0;
    touchCrouch = false;
    touchSprint = false;
    jumpPending = false;
    actionPending = false;
    sprinting = false;
    velocityX = 0;
    velocityZ = 0;
    swimMotion.set(0, 0, 0);
    releasePointer();
  }

  function focusAcceptsMovement() {
    return document.activeElement === canvas || document.activeElement === document.body;
  }

  window.addEventListener('keydown', (event) => {
    if (!active || !focusAcceptsMovement() || !WALK_KEYS.has(event.code) || event.metaKey || event.altKey) return;
    event.preventDefault();
    if (event.code === 'Space' && !event.repeat && !keys.has('Space')) jumpPending = true;
    if (event.code === 'KeyF' && !event.repeat && !keys.has('KeyF')) actionPending = true;
    keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', clearInputs);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInputs();
  });
  canvas.addEventListener('blur', () => {
    keys.clear();
    jumpPending = false;
  });

  function rotateCamera() {
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  function look(dx, dy) {
    if (!active) return;
    yaw -= dx * .0037;
    pitch = MathUtils.clamp(pitch - dy * .0037, -MAX_PITCH, MAX_PITCH);
    rotateCamera();
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (!active || pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(pointer);
    event.preventDefault();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointer) return;
    look(event.clientX - pointerX, event.clientY - pointerY);
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(eventName, (event) => {
      if (event.pointerId === pointer) releasePointer();
    });
  }

  function enter(spawn) {
    clearInputs();
    active = true;
    const [x, y, z] = spawn.position;
    floor = groundSurfaceHeight(x, z);
    feet = floor;
    crouch = 0;
    grounded = true;
    verticalSpeed = 0;
    waterRecovery = 0;
    lowClearance = false;
    waterEvents.length = 0; diveActive = false; playTime = -1;
    actionCooldown = impactCooldown = entrySink = entryRecovery = noteTime = 0;
    water = waterSurfaceAt(x, z, floor) ?? -Infinity;
    swimming = Boolean(water - floor > SWIM_DEPTH || spawn.preserveHeight && spawn.swimming && water - floor > SWIM_DEPTH - .21);
    wading = water - feet > .16;
    const eye = spawn.preserveHeight ? y : swimming
      ? MathUtils.clamp(spawn.swimming ? y : water + SURFACE_EYE, floor + SEABED_CLEARANCE, water + SURFACE_EYE)
      : floor + EYE_HEIGHT;
    position.set(x, eye, z);
    const [targetX, targetY, targetZ] = spawn.target;
    const dx = targetX - x;
    const dy = targetY - eye;
    const dz = targetZ - z;
    yaw = Math.atan2(-dx, -dz);
    pitch = MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)), -MAX_PITCH, MAX_PITCH);
    rotateCamera();
    canvas.focus({ preventScroll: true });
  }

  function tryMove(dx, dz) {
    if (!dx && !dz) return false;
    const x = MathUtils.clamp(position.x + dx, -148, 154);
    const z = MathUtils.clamp(position.z + dz, -103, 103);
    const distance = Math.hypot(x - position.x, z - position.z);
    if (distance === 0) return false;
    const terrain = groundSurfaceHeight(x, z);
    const support = !swimming ? collision.supportAt?.(x, feet, z, {}, .26, .35) : null;
    const ground = Math.max(terrain, support?.floor ?? -Infinity);
    const nextWater = waterSurfaceAt(x, z, ground) ?? -Infinity;
    let nextSwimming = nextWater - ground > (swimming ? SWIM_DEPTH - .21 : SWIM_DEPTH)
      && (swimming || nextWater - feet >= JUMP_WATER_DEPTH);
    let nextCrouch = crouch;
    let nextLowClearance = false;
    if (swimming && !nextSwimming) {
      const stance = standingStanceAt(x, z, ground);
      if (stance === null) {
        // Keep the existing low capsule until it is actually clear of a slab.
        nextSwimming = true;
        nextLowClearance = true;
      } else nextCrouch = stance;
    }
    const step = ground - floor;
    const structuralStep = Boolean(support) || floor - groundSurfaceHeight(position.x, position.z) > .025;
    const stepAllowance = structuralStep ? .26 : .014;
    if ((grounded || swimming) && (!swimming || !nextSwimming || lowClearance || nextLowClearance) && (
      step > distance * MAX_UPHILL_GRADE + stepAllowance || -step > distance * MAX_DOWNHILL_GRADE + stepAllowance
    )) return false;

    if (!swimming && !grounded && !nextSwimming && (ground > feet || feet - ground > 2.1 && !diveActive)) return false;
    const nextFeet = swimming || (grounded && feet <= floor + .03) ? ground : Math.max(feet, ground);
    const eye = nextSwimming
      ? MathUtils.clamp(lowClearance || nextLowClearance ? position.y + step
        : swimming && Number.isFinite(water) ? position.y + (nextWater - water) : position.y,
        ground + SEABED_CLEARANCE, nextLowClearance ? Infinity : Math.max(nextWater + SURFACE_EYE, position.y))
      : nextFeet + EYE_HEIGHT - .62 * nextCrouch;
    // A submerged ledge requires swimming up first instead of carrying the diver through it.
    if (swimming && nextSwimming && eye - position.y > distance + .035) return false;
    if (collision.blocks(x, eye, z, ground, nextSwimming, nextFeet, nextCrouch)) return false;
    if (swimming !== nextSwimming && collision.blocks(x, position.y, z, floor, swimming, feet, crouch)) return false;
    const leavingWater = swimming && !nextSwimming;
    position.set(x, !leavingWater && (nextSwimming || !grounded || crouch > 0) ? eye : position.y, z);
    floor = ground;
    feet = nextFeet;
    water = nextWater;
    if (swimming !== nextSwimming) {
      if (nextSwimming && !grounded) startWaterEntry(nextWater);
      waterRecovery = nextSwimming ? 0 : .6;
      crouch = nextSwimming ? 0 : nextCrouch;
      verticalSpeed = 0;
      grounded = true;
    }
    swimming = nextSwimming;
    lowClearance = nextLowClearance;
    wading = water - feet > (wading ? .10 : .16);
    return true;
  }

  function waterImpact(surface, speed = Math.abs(verticalSpeed)) {
    if (impactCooldown > 0 || !Number.isFinite(surface) || speed < 1) return;
    impactCooldown = .85;
    if (waterEvents.length >= 24) waterEvents.shift();
    waterEvents.push({ kind: 'entry', x: position.x, y: surface, z: position.z,
      strength: MathUtils.clamp((speed + Math.hypot(velocityX, velocityZ) * .35) / 10, .25, 1),
      speed, leap: diveActive });
  }

  function startWaterEntry(surface) {
    waterImpact(surface);
    entrySink = -Math.min(2.8, Math.abs(verticalSpeed) * (diveActive ? .44 : .28));
    entryRecovery = entrySink < -.1 ? 1.55 : 0;
    diveActive = false;
  }

  function requestWaterAction() {
    if (actionCooldown > 0 || !grounded || lowClearance) return;
    if (swimming || water - feet > .16) {
      playTime = 0; actionCooldown = WATER_PLAY_DURATION + .2;
      return;
    }
    // Predict the real jump arc; do not propel the character toward a dry
    // landing, shallow bottom, wall or submerged rock.
    const dx = -Math.sin(yaw), dz = -Math.cos(yaw), launch = 6.8, rise = 5;
    let safe = false;
    for (let time = .045; time <= 1.65; time += .045) {
      const x = position.x + dx * launch * time, z = position.z + dz * launch * time;
      const sole = feet + rise * time - .5 * GRAVITY * time * time;
      const ground = groundSurfaceHeight(x, z), surface = waterSurfaceAt(x, z, ground);
      if (sole < ground - .015) break;
      if (collision.blocks(x, sole + EYE_HEIGHT, z, ground, false, sole, 0)) break;
      if (surface !== null && sole <= surface && time > rise / GRAVITY) {
        safe = surface - ground >= 1.45
          && !collision.blocks(x, surface - .16, z, ground, true, ground, 0);
        break;
      }
    }
    if (!safe) {
      actionNote = '靠近前方较深的水面，再按 F 跃水'; noteTime = 2.8;
      return;
    }
    grounded = false; verticalSpeed = rise; airSpeed = launch;
    diveX = dx * launch; diveZ = dz * launch;
    velocityX = diveX; velocityZ = diveZ;
    diveActive = true; crouch = 0; actionCooldown = 1.1;
    actionNote = ''; noteTime = 0;
  }

  function moveHorizontally(dx, dz, onMove) {
    const steps = Math.ceil(Math.hypot(dx, dz) / .15);
    if (steps === 0) return;
    dx /= steps;
    dz /= steps;
    const prioritizeX = Math.abs(dx) >= Math.abs(dz);
    for (let i = 0; i < steps; i++) {
      const moved = tryMove(dx, dz) || (prioritizeX
        ? tryMove(dx, 0) || tryMove(0, dz)
        : tryMove(0, dz) || tryMove(dx, 0));
      if (moved) onMove?.();
    }
  }

  function landBlocked(at, stance = crouch) {
    return collision.blocks(position.x, position.y, position.z, floor, false, at, stance);
  }

  function standingStanceAt(x, z, ground) {
    for (const stance of [0, 1]) {
      if (!collision.blocks(x, ground + EYE_HEIGHT - .62 * stance, z, ground, false, ground, stance)) return stance;
    }
    return null;
  }

  function settleGroundEye(dt) {
    const settled = MathUtils.damp(position.y, feet + eyeHeight(), waterRecovery > 0 ? 7 : 15, dt);
    position.y = waterRecovery > 0 ? position.y + MathUtils.clamp(settled - position.y, -2.4 * dt, 2.4 * dt) : settled;
  }

  function moveSwimEye(target) {
    const start = position.y;
    const delta = target - start;
    const steps = Math.max(1, Math.ceil(Math.abs(delta) / .06));
    for (let i = 1; i <= steps; i++) {
      const next = start + delta * i / steps;
      if (!collision.blocks(position.x, next, position.z, floor, true, feet, crouch)) {
        position.y = next;
        continue;
      }
      let clear = position.y;
      let blocked = next;
      for (let j = 0; j < 7; j++) {
        const middle = (clear + blocked) / 2;
        if (collision.blocks(position.x, middle, position.z, floor, true, feet, crouch)) blocked = middle;
        else clear = middle;
      }
      position.y = clear;
      break;
    }
  }

  // This also runs while close-up observation pauses control: a changing river
  // still reaches the character, even when no movement key is being pressed.
  function refreshWater(dt, onMove) {
    if (dt <= 0) return;
    dt = Math.min(dt, .08);
    waterRecovery = Math.max(0, waterRecovery - dt);
    const before = position.y;
    const previousWater = water;
    const wasSwimming = swimming;
    const floating = swimming && entryRecovery <= 0 && Number.isFinite(previousWater) && position.y >= previousWater - .075;
    water = waterSurfaceAt(position.x, position.z, floor) ?? -Infinity;
    const waterDepth = water - floor;
    if (swimming && waterDepth <= SWIM_DEPTH - .21) {
      const stance = standingStanceAt(position.x, position.z, floor);
      // A low submerged ledge must not force a standing body through its roof.
      if (stance !== null) {
        swimming = false;
        feet = floor;
        crouch = stance;
        grounded = true;
        verticalSpeed = 0;
        waterRecovery = .6;
        lowClearance = false;
      } else lowClearance = true;
    } else if (swimming) {
      lowClearance = false;
    } else if (!swimming && waterDepth > SWIM_DEPTH && water - feet >= JUMP_WATER_DEPTH
      && !collision.blocks(position.x, position.y, position.z, floor, true, feet, crouch)) {
      if (!grounded) startWaterEntry(water);
      swimming = true;
      crouch = 0;
      verticalSpeed = 0;
      grounded = true;
      waterRecovery = 0;
      lowClearance = false;
    }
    wading = water - feet > (wading ? .10 : .16);
    if (swimming && Number.isFinite(water)) {
      let target = position.y;
      if (floating && Number.isFinite(previousWater)) target += water - previousWater;
      if (floating || !wasSwimming) target = MathUtils.damp(target, water + SURFACE_EYE, 5, dt);
      moveSwimEye(MathUtils.clamp(target, floor + SEABED_CLEARANCE, Math.max(water + SURFACE_EYE, position.y)));
    } else if (grounded && !active) {
      settleGroundEye(dt);
    }
    if (Math.abs(position.y - before) > .00001) onMove?.();
  }

  function moveAir(dt, onMove) {
    const rise = (verticalSpeed - .5 * GRAVITY * dt) * dt;
    verticalSpeed -= GRAVITY * dt;
    const steps = Math.max(1, Math.ceil(Math.abs(rise) / .08));
    for (let i = 0; i < steps; i++) {
      const target = Math.max(floor, feet + rise / steps);
      const hit = landBlocked(target);
      let clear = target;
      if (hit) {
        let blocked = target;
        clear = feet;
        // Keep the last clear height so a landing rests on the surface.
        for (let j = 0; j < 6; j++) {
          const middle = (clear + blocked) / 2;
          if (landBlocked(middle)) blocked = middle;
          else clear = middle;
        }
      }
      feet = clear;
      position.y = feet + eyeHeight();
      if (!hit && rise < 0 && Number.isFinite(water) && water - floor > .45
        && feet <= water && feet - rise / steps > water) waterImpact(water);
      if (!hit && rise < 0 && water - floor > SWIM_DEPTH && water - feet >= JUMP_WATER_DEPTH
        && !collision.blocks(position.x, water + SURFACE_EYE, position.z, floor, true)) {
        startWaterEntry(water);
        swimming = true;
        grounded = true;
        crouch = 0;
        verticalSpeed = 0;
        position.y = water + SURFACE_EYE;
      }
      if (hit || feet === floor) {
        diveActive = false;
        verticalSpeed = 0;
        grounded = rise <= 0;
      }
      onMove?.();
      if (hit || grounded) break;
    }
  }

  function update(dt, onMove) {
    if (!active || dt <= 0) return;
    dt = Math.min(dt, .08);
    actionCooldown = Math.max(0, actionCooldown - dt);
    impactCooldown = Math.max(0, impactCooldown - dt);
    noteTime = Math.max(0, noteTime - dt);
    if (playTime >= 0) { playTime += dt; if (playTime > WATER_PLAY_DURATION) playTime = -1; }
    refreshWater(dt, onMove);
    if (actionPending) requestWaterAction();
    actionPending = false;
    const right = Number(isDown('KeyD', 'ArrowRight')) - Number(isDown('KeyA', 'ArrowLeft')) + touchX;
    const forward = Number(isDown('KeyW', 'ArrowUp')) - Number(isDown('KeyS', 'ArrowDown')) + touchY;
    if (!swimming) {
      const lower = !wading && (touchCrouch || isDown('KeyC'));
      const stance = MathUtils.clamp(crouch + (lower ? 1 : -1) * dt * 6, 0, 1);
      if (stance >= crouch || !landBlocked(feet, stance)) crouch = stance;
    }
    sprinting = !swimming && !wading && crouch === 0 && (right !== 0 || forward !== 0)
      && (touchSprint || isDown('ShiftLeft', 'ShiftRight'));
    const groundState = sampleGround?.(position.x, position.z, {});
    const mud = feet - floor < .12 && !wading ? MathUtils.clamp((groundState?.mud ?? 0) * (groundState?.localWetness ?? 0), 0, 1) : 0;
    const groundSpeed = (crouch > 0 ? MathUtils.lerp(WALK_SPEED, 1.5, crouch)
      : wading ? MathUtils.lerp(2.25, 1.35, MathUtils.smoothstep(water - feet, .16, 1.19))
        : sprinting ? RUN_SPEED : WALK_SPEED) * (1 - mud * .22);
    if (jumpPending && !swimming && !wading && grounded && crouch === 0) {
      grounded = false;
      verticalSpeed = JUMP_SPEED;
      airSpeed = groundSpeed;
    }
    jumpPending = false;
    const playing = playTime >= 0 ? Math.sin(playTime / WATER_PLAY_DURATION * Math.PI) : 0;
    const speed = (swimming ? lowClearance ? 1.15 : 3.85 : grounded ? groundSpeed : airSpeed) * (1 - playing * .48);
    const factor = speed / Math.max(1, Math.hypot(right, forward));
    const xSpeed = (right * Math.cos(yaw) - forward * Math.sin(yaw)) * factor;
    const zSpeed = (-right * Math.sin(yaw) - forward * Math.cos(yaw)) * factor;
    const acceleration = swimming ? 7 : grounded ? 15 : 4;
    velocityX = MathUtils.damp(velocityX, diveActive ? diveX + xSpeed * .10 : xSpeed, acceleration, dt);
    velocityZ = MathUtils.damp(velocityZ, diveActive ? diveZ + zSpeed * .10 : zSpeed, acceleration, dt);
    const rising = !swimming && !grounded && verticalSpeed > 0;
    if (rising) moveAir(dt, onMove);
    if (swimming) riverCurrentAt(position.x, position.z, floor, depth(), current, weather?.runoff ?? 0);
    else current.set(0, 0, 0);
    const startX = position.x;
    const startZ = position.z;
    moveHorizontally((velocityX + current.x) * dt, (velocityZ + current.z) * dt, onMove);
    swimMotion.set(0, 0, 0);

    if (swimming) {
      const up = Number(isDown('Space')) - Number(isDown('KeyC', 'ControlLeft', 'ControlRight')) + vertical;
      const pitchSteering = water - position.y > .22 ? MathUtils.clamp(forward, -1, 1) * Math.sin(pitch) * .92 : 0;
      if (Math.abs(up) > .01) { entryRecovery = 0; entrySink = 0; }
      let recovery = 0;
      if (entryRecovery > 0) {
        entryRecovery = Math.max(0, entryRecovery - dt);
        entrySink = MathUtils.damp(entrySink, 0, 4.5, dt);
        recovery = entrySink + (entryRecovery < 1.08 ? Math.min(1.6, (water + SURFACE_EYE - position.y) * 3) : 0);
      }
      const rise = (MathUtils.clamp(up || pitchSteering, -1, 1) * 2.95 + recovery) * dt;
      const eye = position.y;
      const y = MathUtils.clamp(eye + rise, floor + SEABED_CLEARANCE, Math.max(water + SURFACE_EYE, eye));
      moveSwimEye(y);
      if (Math.abs(position.y - eye) > .00001) onMove?.();
      const moved = Math.hypot(position.x - startX, position.z - startZ) > .001;
      swimMotion.set(moved ? velocityX : 0, (position.y - eye) / dt, moved ? velocityZ : 0);
    } else {
      if (grounded && feet > floor + .03 && !landBlocked(feet - .045)) {
        grounded = false;
        airSpeed = groundSpeed;
      }
      if (!grounded && !rising) moveAir(dt, onMove);
      if (grounded && !swimming) {
        const previousEye = position.y;
        if (crouch > 0 && waterRecovery === 0) position.y = feet + eyeHeight();
        else settleGroundEye(dt);
        if (waterRecovery > 0 && Math.abs(position.y - previousEye) > .00001) onMove?.();
      }
    }
  }

  function depth() {
    return swimming ? Math.max(0, water - position.y) : 0;
  }

  return {
    enter,
    snapshot() { return { position: position.toArray(), yaw, pitch, feet, crouch,
      swimming, airborne: !grounded && !swimming }; },
    restore(saved) {
      if (!Array.isArray(saved?.position) || !saved.position.every(Number.isFinite)
        || !Number.isFinite(saved.yaw) || !Number.isFinite(saved.pitch)) return false;
      const [sx, sy, sz] = saved.position;
      if (sx < -148 || sx > 154 || sz < -145 || sz > 145 || sy < -40 || sy > 150) return false;
      const offsets = [[0, 0]];
      for (let radius = .45; radius <= 3.61; radius += .45) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) offsets.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
      }
      for (const [dx, dz] of offsets) {
        const x = sx + dx, z = sz + dz;
        const ground = groundSurfaceHeight(x, z), surface = waterSurfaceAt(x, z, ground) ?? -Infinity;
        const swim = surface - ground > (saved.swimming ? SWIM_DEPTH - .21 : SWIM_DEPTH);
        let sole = ground;
        if (!swim && !dx && !dz && Number.isFinite(saved.feet) && !saved.airborne) {
          sole = collision.supportAt?.(x, saved.feet, z, {}, .18, .3)?.floor ?? ground;
        }
        const stance = swim ? 0 : MathUtils.clamp(Number.isFinite(saved.crouch) ? saved.crouch : 0, 0, 1);
        const eyeY = swim ? MathUtils.clamp(sy, ground + SEABED_CLEARANCE, surface + SURFACE_EYE) : sole + EYE_HEIGHT - stance * .62;
        if (collision.blocks(x, eyeY, z, ground, swim, sole, stance)) continue;
        enter({ position: [x, eyeY, z], preserveHeight: true, swimming: swim,
          target: [x - Math.sin(saved.yaw), eyeY, z - Math.cos(saved.yaw)] });
        floor = ground; feet = sole; water = surface; swimming = swim; crouch = stance;
        wading = !swim && surface - feet > .16;
        yaw = saved.yaw; pitch = MathUtils.clamp(saved.pitch, -MAX_PITCH, MAX_PITCH);
        rotateCamera();
        return true;
      }
      return false;
    },
    exit() {
      active = false;
      clearInputs();
    },
    resume() {
      clearInputs();
      active = true;
      rotateCamera();
      canvas.focus({ preventScroll: true });
    },
    update,
    refreshWater,
    waterAction() { if (active) actionPending = true; },
    drainWaterEvents() { return waterEvents.splice(0); },
    get diving() { return diveActive; },
    get playPhase() { return playTime < 0 ? -1 : playTime / WATER_PLAY_DURATION; },
    get actionNote() { return noteTime > 0 ? actionNote : ''; },
    get nearWater() {
      if (swimming || wading) return true;
      for (const distance of [1.5, 3.5, 5.5]) {
        const x = position.x - Math.sin(yaw) * distance, z = position.z - Math.cos(yaw) * distance;
        const surface = waterSurfaceAt(x, z, groundSurfaceHeight(x, z));
        if (surface !== null && surface > feet - 4) return true;
      }
      return false;
    },
    look,
    setTouch(x, y) {
      touchX = MathUtils.clamp(x, -1, 1);
      touchY = MathUtils.clamp(y, -1, 1);
    },
    setVertical(amount) { vertical = MathUtils.clamp(amount, -1, 1); },
    setCrouch(value) { touchCrouch = value; },
    setSprint(value) { touchSprint = value; },
    jump() { if (active) jumpPending = true; },
    get active() { return active; },
    get depth() { return depth(); },
    get surface() { return swimming ? water : null; },
    get waterDepth() { return Math.max(0, water - feet); },
    get lowClearance() { return lowClearance; },
    get swimMotion() { return swimMotion; },
    get medium() {
      if (swimming) return depth() > .075 ? 'dive' : 'swim';
      return wading ? 'wade' : 'walk';
    },
    get position() { return position; },
    get feet() { return feet; },
    get crouch() { return crouch; },
    get airborne() { return !swimming && !grounded; },
    get sprinting() { return !swimming && grounded && sprinting; },
  };
}
