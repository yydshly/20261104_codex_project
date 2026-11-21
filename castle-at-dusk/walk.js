import { CatmullRomCurve3, Euler, MathUtils, Vector3 } from 'three';
import { createCliffStairCurve } from './environment.js';
import { createShoreWalkCurve, getShoreWalkStage, getShoreWalkWidth, SHORE_DOCK } from './shore-route.js';
import { TOWER } from './tower-layout.js';

const eyeHeight = 1.59;
const castleLanding = { x: 5.67, z: 18.16, floor: -4.795 };
const shoreRoute = createShoreWalkCurve();
const shoreLength = shoreRoute.getLength();
const shoreStartDistance = 3.65;
const moveKeys = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

function makeApproach() {
  const stair = createCliffStairCurve();
  const route = [{ x: castleLanding.x, z: 18.48, floor: castleLanding.floor, width: .55, heading: 0 }];
  for (let index = 100; index >= 0; index--) {
    const t = index / 100;
    const point = stair.getPointAt(t);
    const tangent = stair.getTangentAt(t);
    const bridgeRise = .116 * (1 - MathUtils.smoothstep(t, 0, .043));
    route.push({
      x: point.x,
      z: point.z,
      floor: point.y + .029 + bridgeRise,
      width: .73 - .14 * t,
      heading: Math.atan2(tangent.x, tangent.z),
    });
  }
  route.push(
    { x: 0, z: 9.02, floor: .205, width: 1.18, heading: 0 },
    { x: 0, z: 7.73, floor: .205, width: 1.18, heading: 0 },
    { x: 0, z: 7.28, floor: .205, width: .69, heading: 0 },
    { x: 0, z: 6.88, floor: .115, width: .69, heading: 0 },
    { x: 0, z: 4.98, floor: .106, width: .69, heading: 0 },
  );
  return route.slice(0, -1).map((from, index) => {
    const to = route[index + 1];
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    return { from, to, dx, dz, inverseLengthSquared: 1 / (dx * dx + dz * dz) };
  });
}

const approach = makeApproach();

function approachStage(z) {
  if (z >= 16.62) return 'shore';
  if (z >= 9.47) return 'stairs';
  if (z >= 7.45) return 'bridge';
  return 'gate';
}

function nearestApproach(x, z) {
  let closestSegment;
  let closestBlend;
  let closestX;
  let closestZ;
  let closestDistanceSquared = Infinity;
  for (const segment of approach) {
    const { from, dx, dz, inverseLengthSquared } = segment;
    const blend = MathUtils.clamp(((x - from.x) * dx + (z - from.z) * dz) * inverseLengthSquared, 0, 1);
    const centerX = from.x + dx * blend;
    const centerZ = from.z + dz * blend;
    const distanceSquared = (x - centerX) ** 2 + (z - centerZ) ** 2;
    if (distanceSquared >= closestDistanceSquared) continue;
    closestDistanceSquared = distanceSquared;
    closestSegment = segment;
    closestBlend = blend;
    closestX = centerX;
    closestZ = centerZ;
  }
  const { from, to } = closestSegment;
  return {
    centerX: closestX,
    centerZ: closestZ,
    distanceSquared: closestDistanceSquared,
    width: MathUtils.lerp(from.width, to.width, closestBlend),
    floor: MathUtils.lerp(from.floor, to.floor, closestBlend),
    heading: MathUtils.lerp(from.heading, to.heading, closestBlend),
    stage: approachStage(z),
  };
}

function inRect(x, z, left, right, back, front) {
  return x >= left && x <= right && z >= back && z <= front;
}

const towerStartX = 1.84;
const towerStairX = TOWER.x - TOWER.walkRadius;
const fullTurn = 2 * Math.PI;
const turnDifference = (next, previous) => MathUtils.euclideanModulo(next - previous + Math.PI, fullTurn) - Math.PI;
const towerLanding = new CatmullRomCurve3([
  [towerStartX, TOWER.entranceZ], [TOWER.x - 2.25, TOWER.entranceZ], [TOWER.x - 1.53, TOWER.entranceZ],
  [towerStairX - .16, TOWER.z + .36], [towerStairX, TOWER.z + .16], [towerStairX, TOWER.z],
].map(([x, z]) => new Vector3(x, TOWER.baseY, z)));
const roofLanding = new CatmullRomCurve3([
  [towerStairX, TOWER.z], [towerStairX - .035, TOWER.z - .32], [TOWER.x - 1.27, TOWER.z - .55],
  [TOWER.x - 1.52, TOWER.z - .58], [TOWER.x - 1.74, TOWER.z - .39], [TOWER.x - 1.84, TOWER.z - .10],
].map(([x, z]) => new Vector3(x, TOWER.deckY, z)));
const landingLength = towerLanding.getLength();
const spiralEnd = landingLength + TOWER.walkRadius * TOWER.stepAngle * TOWER.stepCount;
const roofLandingLength = roofLanding.getLength();
const towerLength = spiralEnd + roofLandingLength;
const towerGround = { floor: TOWER.deckY, stage: 'rooftop' };

function pathPose(curve, fraction, pitch, stage) {
  const point = curve.getPointAt(fraction);
  const tangent = curve.getTangentAt(fraction);
  return { x: point.x, z: point.z, floor: point.y, heading: Math.atan2(-tangent.x, -tangent.z), pitch, stage };
}

function towerPose(distance) {
  if (distance < landingLength) return pathPose(towerLanding, distance / landingLength, -.06, 'towerEntry');
  if (distance < spiralEnd) {
    const stairDistance = distance - landingLength;
    const angle = TOWER.startAngle + stairDistance / TOWER.walkRadius;
    const lookAhead = MathUtils.smoothstep(stairDistance, 0, .5)
      * (1 - MathUtils.smoothstep(distance, spiralEnd - .5, spiralEnd));
    return {
      x: TOWER.x + Math.cos(angle) * TOWER.walkRadius,
      z: TOWER.z + Math.sin(angle) * TOWER.walkRadius,
      floor: MathUtils.lerp(TOWER.baseY, TOWER.deckY, stairDistance / (spiralEnd - landingLength)),
      heading: Math.PI - angle - .25 * lookAhead,
      pitch: -.06 - .10 * lookAhead,
      stage: 'spiral',
    };
  }
  const fraction = MathUtils.clamp((distance - spiralEnd) / roofLandingLength, 0, 1);
  const stage = distance >= towerLength ? 'rooftop' : 'spiral';
  const outlook = MathUtils.smoothstep(fraction, .2, .95);
  const pose = pathPose(roofLanding, fraction, MathUtils.lerp(-.06, -.39, outlook), stage);
  pose.heading += .21 * outlook;
  return pose;
}

function roofGroundAt(x, z) {
  const dx = x - TOWER.x;
  const dz = z - TOWER.z;
  const radius = Math.hypot(dx, dz);
  if (radius > TOWER.deckRadius - .47) return null;
  if (radius >= TOWER.apertureRadius + .17) return towerGround;
  const angle = MathUtils.euclideanModulo(Math.atan2(dz, dx) - TOWER.startAngle, fullTurn);
  if (radius < TOWER.pillarRadius + .19) return null;
  const margin = Math.asin(.145 / radius);
  return angle >= margin && angle <= TOWER.solidDeckAngle - margin ? towerGround : null;
}

const courtyardObstacles = [
  [-7.33, -3.61, -3.10, 1.60], // Chapel
  [4.00, 7.37, -2.63, 2.32], // East house
  [-2.71, 3.43, -5.65, -.855], // Keep walls
];
const roundObstacles = [
  [2.9, 2.9, 1.02], // Well
  [-2.58, -4.32, 1.30], // Keep turret
  [-6.61, -2.90, .98], // Chapel bell tower
  [-2.45, 6.56, 1.51], [2.45, 6.56, 1.51], // Gate towers
  [-8.25, 6.57, 1.62], [8.25, 6.57, 1.62], // Curtain towers
  [-8.25, -6.55, 1.63], [8.25, -6.55, 1.69],
  [TOWER.x, TOWER.z, TOWER.wallRadius + .18],
];

function groundAt(x, z) {
  const throughKeepDoor = inRect(x, z, -.44, 1.16, -1.68, -.80);
  const insideKeep = inRect(x, z, -1.30, 1.87, -4.0, -1.51);
  if (insideKeep || throughKeepDoor) return { floor: .122, stage: z < -1.19 ? 'hall' : 'courtyard' };

  if (inRect(x, z, -7.44, 7.44, -5.78, 5.18)) {
    const hitsWall = courtyardObstacles.some(([left, right, back, front]) => inRect(x, z, left, right, back, front));
    const hitsTower = roundObstacles.some(([cx, cz, radius]) => (x - cx) ** 2 + (z - cz) ** 2 < radius ** 2);
    if (!hitsWall && !hitsTower) return { floor: .106, stage: 'courtyard' };
  }

  if (z > 18.43 || z < 5.12) return null;
  const surface = nearestApproach(x, z);
  return surface.distanceSquared <= surface.width ** 2 ? surface : null;
}

export function createWalkMode({ camera, canvas }) {
  const keyboard = new Set();
  const touch = new Set();
  const angles = new Euler(0, 0, 0, 'YXZ');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let pointer;
  let pointerX;
  let pointerY;
  let x = SHORE_DOCK.x;
  let z = SHORE_DOCK.z;
  let floor = SHORE_DOCK.floor;
  let yaw = 0;
  let pitch = .10;
  let stride = 0;
  let bob = 0;
  let ground = { floor, stage: 'farDock' };
  let towerTravel;
  let shoreTravel;
  let lookTarget;
  const shorePoint = new Vector3();
  const shoreTangent = new Vector3();

  function clearInput() {
    keyboard.clear();
    touch.clear();
    if (pointer !== undefined && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
    pointer = undefined;
  }

  function isPressed(direction) {
    for (const code of keyboard) if (moveKeys[code] === direction) return true;
    return touch.has(direction);
  }

  function positionCamera() {
    camera.position.set(x, floor + eyeHeight + bob, z);
    camera.quaternion.setFromEuler(angles.set(pitch, yaw, 0));
  }

  function commit(nextX, nextZ, nextGround) {
    if (!nextGround) return false;
    if (ground.heading !== undefined && nextGround.heading !== undefined) yaw += nextGround.heading - ground.heading;
    stride += Math.hypot(nextX - x, nextZ - z);
    x = nextX;
    z = nextZ;
    ground = nextGround;
    return true;
  }

  function moveOnTower(distance) {
    const previous = towerTravel.pose;
    const pose = towerPose(distance);
    const rotation = turnDifference(pose.heading, previous.heading);
    const tilt = pose.pitch - previous.pitch;
    yaw += rotation;
    pitch = MathUtils.clamp(pitch + tilt, -1.22, 1.22);
    if (lookTarget) {
      lookTarget.yaw += rotation;
      lookTarget.pitch += tilt;
    }
    stride += Math.hypot(pose.x - x, pose.z - z);
    x = pose.x;
    z = pose.z;
    ground = pose;
    towerTravel.distance = distance;
    towerTravel.pose = pose;
  }

  function beginTowerTravel(distance, direction) {
    const pose = towerPose(distance);
    towerTravel = { distance, direction, pose };
    moveOnTower(distance);
    const facing = pose.heading + (direction < 0 ? Math.PI : 0);
    lookTarget = { yaw: yaw + turnDifference(facing, yaw), pitch: pose.pitch };
  }

  function stepOnTower(forward, sideways, seconds) {
    const { distance, direction } = towerTravel;
    if (distance >= towerLength && sideways) {
      towerTravel = undefined;
      ground = towerGround;
      return false;
    }
    const speed = distance < landingLength ? 1.64 : 1.29;
    const nextDistance = Math.min(distance + forward * direction * speed * seconds, towerLength);
    if (nextDistance < 0) {
      moveOnTower(0);
      towerTravel = undefined;
      ground = groundAt(x, z);
    } else if (nextDistance !== distance) {
      moveOnTower(nextDistance);
    }
    return true;
  }

  function stepOnRoof(nextX, nextZ, forward) {
    // Crossing the marked end of the stair opening engages the same route downhill.
    if (forward && nextZ > z && nextZ >= TOWER.z - .18 && nextZ <= TOWER.z + .02 && Math.abs(nextX - towerStairX) <= .27) {
      beginTowerTravel(spiralEnd + .10, forward > 0 ? -1 : 1);
      return;
    }
    if (commit(nextX, nextZ, roofGroundAt(nextX, nextZ))) return;
    commit(nextX, z, roofGroundAt(nextX, z));
    commit(x, nextZ, roofGroundAt(x, nextZ));
  }

  function stepOnShore(forward, sideways, seconds) {
    const speed = ground.stage === 'fisherHut' || ground.stage === 'watchtower' ? 2.1 : 2.9;
    const angle = shoreTravel.yaw - shoreTravel.heading;
    const alongTrail = forward * Math.cos(angle) + sideways * Math.sin(angle);
    const acrossTrail = sideways * Math.cos(angle) - forward * Math.sin(angle);
    const distance = MathUtils.clamp(shoreTravel.distance + alongTrail * speed * seconds, 0, shoreLength);
    const progress = distance / shoreLength;
    const width = getShoreWalkWidth(progress);
    const offset = MathUtils.clamp(shoreTravel.offset + acrossTrail * 1.55 * seconds, -width, width);
    if (distance === shoreTravel.distance && offset === shoreTravel.offset) return;

    shoreRoute.getPointAt(progress, shorePoint);
    shoreRoute.getTangentAt(progress, shoreTangent);
    const heading = Math.atan2(-shoreTangent.x, -shoreTangent.z);
    const nextX = shorePoint.x + Math.cos(heading) * offset;
    const nextZ = shorePoint.z - Math.sin(heading) * offset;
    shoreTravel.yaw += turnDifference(heading, shoreTravel.heading);
    stride += Math.hypot(nextX - x, nextZ - z);
    x = nextX;
    z = nextZ;
    ground = { floor: shorePoint.y, stage: getShoreWalkStage(progress) };
    shoreTravel.distance = distance;
    shoreTravel.offset = offset;
    shoreTravel.heading = heading;
  }

  function step(forward, sideways, seconds) {
    if (shoreTravel) {
      stepOnShore(forward, sideways, seconds);
      return;
    }
    if (towerTravel && stepOnTower(forward, sideways, seconds)) return;
    const speed = ground.stage === 'rooftop' ? 1.50 : ground.stage === 'stairs' ? 2.12 : 2.72;
    const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) * speed * seconds;
    const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) * speed * seconds;
    const nextX = x + dx;
    const nextZ = z + dz;
    if (ground.stage === 'rooftop') {
      stepOnRoof(nextX, nextZ, forward);
      return;
    }
    if (ground.stage === 'hall' && dx > 0 && x <= towerStartX && nextX >= towerStartX && Math.abs(nextZ - TOWER.entranceZ) <= .29) {
      beginTowerTravel(0, 1);
      return;
    }
    if (commit(nextX, nextZ, groundAt(nextX, nextZ))) return;

    // Slide along the stair edge so small steering errors never stop the climb.
    if (ground.heading !== undefined && nextZ <= 18.43 && nextZ >= 5.12) {
      const nearest = nearestApproach(nextX, nextZ);
      const fraction = (nearest.width - .002) / Math.sqrt(nearest.distanceSquared);
      if (fraction < 1) {
        const clippedX = MathUtils.lerp(nearest.centerX, nextX, fraction);
        const clippedZ = MathUtils.lerp(nearest.centerZ, nextZ, fraction);
        if (commit(clippedX, clippedZ, groundAt(clippedX, clippedZ))) return;
      }
    }

    // Resolve one axis at a time against courtyard walls and obstacles.
    if (Math.abs(dx) >= Math.abs(dz)) {
      commit(nextX, z, groundAt(nextX, z));
      commit(x, nextZ, groundAt(x, nextZ));
    } else {
      commit(x, nextZ, groundAt(x, nextZ));
      commit(nextX, z, groundAt(nextX, z));
    }
  }

  window.addEventListener('keydown', (event) => {
    if (!active || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!Object.hasOwn(moveKeys, event.code) && event.code !== 'KeyQ' && event.code !== 'KeyE') return;
    event.preventDefault();
    keyboard.add(event.code);
  });
  window.addEventListener('keyup', (event) => { keyboard.delete(event.code); });
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInput(); });

  canvas.addEventListener('pointerdown', (event) => {
    if (!active || pointer !== undefined || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(pointer);
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!active || event.pointerId !== pointer) return;
    lookTarget = undefined;
    const sensitivity = event.pointerType === 'touch' ? .0054 : .0036;
    const turn = -(event.clientX - pointerX) * sensitivity;
    yaw += turn;
    if (shoreTravel) shoreTravel.yaw += turn;
    pitch = MathUtils.clamp(pitch - (event.clientY - pointerY) * sensitivity, -1.22, 1.22);
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(eventName, (event) => { if (event.pointerId === pointer) pointer = undefined; });
  }

  return {
    get stage() { return ground.stage; },
    get boardingDock() {
      if (!active) return null;
      if (shoreTravel) return shoreTravel.distance <= .85 ? 'shore' : null;
      return ground.stage === 'shore' && inRect(x, z, 5.10, 6.24, 17.90, 18.43) ? 'castle' : null;
    },
    enter(dock = null) {
      clearInput();
      active = true;
      if (dock !== 'castle') {
        const startingTour = dock === null;
        const distance = startingTour ? shoreStartDistance : 0;
        const progress = distance / shoreLength;
        shoreRoute.getPointAt(progress, shorePoint);
        shoreRoute.getTangentAt(progress, shoreTangent);
        ({ x, y: floor, z } = shorePoint);
        yaw = startingTour ? SHORE_DOCK.yaw + Math.PI + .15 : SHORE_DOCK.yaw;
        shoreTravel = { distance, offset: 0, heading: Math.atan2(-shoreTangent.x, -shoreTangent.z), yaw };
        ground = { floor, stage: getShoreWalkStage(progress) };
        pitch = startingTour ? .09 : .03;
      } else {
        ({ x, z, floor } = castleLanding);
        yaw = 0;
        pitch = .10;
        shoreTravel = undefined;
        ground = groundAt(x, z);
      }
      stride = 0;
      bob = 0;
      towerTravel = undefined;
      lookTarget = undefined;
      positionCamera();
      canvas.focus({ preventScroll: true });
    },
    exit() {
      active = false;
      clearInput();
    },
    clearInput,
    setMove(code, pressed) {
      const direction = moveKeys[code] ?? code;
      if (pressed && active) touch.add(direction);
      else touch.delete(direction);
    },
    update(delta) {
      if (!active) return;
      const elapsed = MathUtils.clamp(delta, 0, .075);
      const turn = (Number(keyboard.has('KeyQ')) - Number(keyboard.has('KeyE'))) * elapsed * 1.9;
      if (turn) lookTarget = undefined;
      yaw += turn;
      if (shoreTravel) shoreTravel.yaw += turn;
      const forward = Number(isPressed('forward')) - Number(isPressed('back'));
      const sideways = Number(isPressed('right')) - Number(isPressed('left'));
      const magnitude = Math.hypot(forward, sideways);
      const oldStride = stride;
      if (magnitude > 0 && elapsed > 0) {
        const substeps = Math.ceil(elapsed * 120);
        for (let i = 0; i < substeps; i++) step(forward / magnitude, sideways / magnitude, elapsed / substeps);
      }
      if (lookTarget) {
        yaw = MathUtils.damp(yaw, lookTarget.yaw, 9, elapsed);
        pitch = MathUtils.damp(pitch, lookTarget.pitch, 9, elapsed);
        if (Math.abs(yaw - lookTarget.yaw) < .003 && Math.abs(pitch - lookTarget.pitch) < .003) lookTarget = undefined;
      }
      if (shoreTravel) {
        const guidedTurn = MathUtils.damp(yaw, shoreTravel.yaw, 9, elapsed) - yaw;
        yaw += MathUtils.clamp(guidedTurn, -2.3 * elapsed, 2.3 * elapsed);
      }
      floor = MathUtils.damp(floor, ground.floor, 16, elapsed);
      const targetBob = stride > oldStride && !reducedMotion.matches ? Math.sin(stride * 11) * .025 : 0;
      bob = MathUtils.damp(bob, targetBob, 17, elapsed);
      positionCamera();
    },
  };
}
