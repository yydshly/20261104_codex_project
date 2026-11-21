import { MathUtils, Vector3 } from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';
import { cameraClearance } from './world-collision.js';

export function createCharacterView(camera, eye, walker, hero, collision, sampleGround = null, clothingEnvironment = null) {
  const position = new Vector3();
  const forward = new Vector3();
  const right = new Vector3();
  const aim = new Vector3();
  const previous = new Vector3();
  const desired = new Vector3();
  const blendAim = new Vector3();
  const safeCamera = new Vector3();
  const cameraOffset = new Vector3();
  let stage = null;
  let following = false;
  let hasPrevious = false;
  let distance = 4.7;
  let settleWalk = 0;
  let walkYaw;
  let boomLength;
  function contactEnvironment(position, waterDepth = 0) {
    const ground = sampleGround?.(position.x, position.z, {});
    const supported = position.y - groundSurfaceHeight(position.x, position.z) > .18;
    return { waterDepth: supported ? waterDepth : Math.max(waterDepth, ground?.waterDepth ?? 0),
      mud: supported ? 0 : (ground?.mud ?? 0) * (ground?.localWetness ?? 0),
      ...clothingEnvironment?.(position) };
  }

  function stageAt(spawn) {
    if (!spawn) {
      stage = null;
      return;
    }
    const [x, , z] = spawn.position;
    const toward = new Vector3(spawn.target[0] - x, 0, spawn.target[2] - z).normalize();
    stage = { position: new Vector3(x, groundSurfaceHeight(x, z) + .025, z),
      floor: groundSurfaceHeight(x, z), swimming: false, contactsEnabled: false, yaw: Math.atan2(toward.x, toward.z) };
  }

  function frameStage(dt, time) {
    if (!stage) {
      hero.group.visible = false;
      hero.drips?.clear();
      hero.resetFootContacts();
      return;
    }
    const surface = waterSurfaceAt(stage.position.x, stage.position.z, stage.floor);
    stage.swimming = surface !== null && surface - stage.floor > (stage.swimming ? .98 : 1.19);
    const height = stage.swimming ? surface - .02 : stage.floor + .025;
    stage.position.y = MathUtils.damp(stage.position.y, height, 8, dt);
    hero.update(dt, time, { ...stage, ...contactEnvironment(stage.position, Math.max(0, (surface ?? -Infinity) - stage.floor)) });
  }

  function followPose(viewpoint, heading, swimming, surface, below = false) {
    const horizontal = Math.max(.22, Math.hypot(heading.x, heading.z));
    right.set(-heading.z / horizontal, 0, heading.x / horizontal);
    desired.copy(viewpoint).addScaledVector(heading, -distance * (swimming ? .88 : 1)).addScaledVector(right, swimming ? 1.42 : .74);
    desired.y += swimming ? .34 : 1.04;
    let floor = groundSurfaceHeight(desired.x, desired.z);
    let localSurface = swimming ? waterSurfaceAt(desired.x, desired.z, floor) : null;
    if (below) {
      for (let step = 0; step < 6 && (localSurface === null || floor + .46 > localSurface); step++) {
        desired.lerp(viewpoint, .34);
        floor = groundSurfaceHeight(desired.x, desired.z);
        localSurface = waterSurfaceAt(desired.x, desired.z, floor);
      }
      desired.y = Math.min((localSurface ?? surface) - .14, desired.y);
    } else if (surface !== null) {
      desired.y = Math.max((localSurface ?? surface) + .14, desired.y);
    }
    desired.y = Math.max(floor + .32, desired.y);
    aim.copy(viewpoint).addScaledVector(heading, 1.08);
    aim.y -= swimming ? .16 : .45;
  }

  function frameWalk(dt, time) {
    eye.getWorldDirection(forward);
    const medium = walker.medium;
    const swimming = medium === 'swim' || medium === 'dive';
    const underwater = medium === 'dive';
    position.copy(eye.position);
    position.y = swimming ? position.y - .28 : walker.feet + .025;
    const dx = hasPrevious && dt > 0 ? eye.position.x - previous.x : 0;
    const dz = hasPrevious && dt > 0 ? eye.position.z - previous.z : 0;
    const horizontal = Math.hypot(dx, dz);
    const speed = dt > 0 ? swimming ? walker.swimMotion.length() : horizontal / dt : 0;
    walkYaw ??= Math.atan2(forward.x, forward.z);
    // Keep movement relative to the camera while the body follows actual travel.
    if (dt > 0 && horizontal / dt > .16) {
      const turn = MathUtils.euclideanModulo(Math.atan2(dx, dz) - walkYaw + Math.PI, 2 * Math.PI) - Math.PI;
      walkYaw += turn * (1 - Math.exp(-dt * 16));
    }
    previous.copy(eye.position);
    hasPrevious = true;
    hero.update(dt, time, {
      position, speed, swimming, underwater, visible: following,
      crouch: walker.crouch, airborne: walker.airborne,
      leaping: walker.diving, waterPlay: walker.playPhase,
      ...contactEnvironment(position, walker.waterDepth),
      contactsEnabled: !walker.lowClearance,
      yaw: walkYaw, pitch: underwater && speed > .16
        ? Math.atan2(walker.swimMotion.y, Math.hypot(walker.swimMotion.x, walker.swimMotion.z)) : 0,
    });
    if (following) {
      followPose(eye.position, forward, swimming, walker.surface, underwater);
      if (collision) {
        collision.constrainCamera(eye.position, desired, safeCamera, cameraClearance(camera));
        const allowed = eye.position.distanceTo(safeCamera);
        boomLength = boomLength === undefined || allowed < boomLength
          ? allowed : MathUtils.damp(boomLength, allowed, 4.5, dt);
        cameraOffset.subVectors(safeCamera, eye.position).setLength(boomLength);
        desired.copy(eye.position).add(cameraOffset);
      }
      if (settleWalk > 0) {
        const blend = 1 - Math.exp(-dt * 8.5);
        camera.position.lerp(desired, blend);
        blendAim.lerp(aim, blend);
        collision?.constrainCamera(eye.position, camera.position, camera.position, cameraClearance(camera));
        camera.lookAt(blendAim);
        settleWalk -= dt;
      } else {
        camera.position.copy(desired);
        collision?.constrainCamera(eye.position, camera.position, camera.position, cameraClearance(camera));
        camera.lookAt(aim);
      }
    } else {
      camera.position.copy(eye.position);
      camera.quaternion.copy(eye.quaternion);
    }
  }

  function framePaused(dt, time) {
    const swimming = walker.medium === 'swim' || walker.medium === 'dive';
    position.copy(eye.position);
    position.y = swimming ? position.y - .28 : walker.feet + .025;
    if (walkYaw === undefined) {
      eye.getWorldDirection(forward);
      walkYaw = Math.atan2(forward.x, forward.z);
    }
    hero.update(dt, time, {
      position, yaw: walkYaw, speed: 0, swimming, underwater: walker.medium === 'dive',
      crouch: walker.crouch, airborne: walker.airborne, visible: following,
      contactsEnabled: false,
      ...contactEnvironment(position, walker.waterDepth),
    });
  }

  function frameJourney(dt, time, state, guiding) {
    const swimming = state.medium === 'swim' || state.medium === 'dive';
    position.copy(state.position);
    position.y = swimming ? position.y - .28 : state.feet + .025;
    const gesture = guiding && !swimming && state.speed < .1 ? Math.max(0, Math.sin(time * 1.65)) ** 4 * .65 : 0;
    hero.update(dt, time, {
      position, swimming, gesture, underwater: state.medium === 'dive',
      crouch: state.crouch, airborne: state.airborne,
      ...contactEnvironment(position, Math.max(0, (state.surface ?? -Infinity) - state.feet)),
      speed: state.speed, yaw: state.yaw, pitch: state.pitch,
      contactsEnabled: !state.lowClearance,
    });
  }

  return {
    stageAt, frameStage, frameWalk, frameJourney, framePaused,
    resetWalk(smooth = false) {
      hasPrevious = false;
      hero.resetFootContacts();
      walkYaw = smooth && hero.group.visible ? hero.group.rotation.y : undefined;
      distance = 4.7;
      settleWalk = smooth ? .85 : 0;
      boomLength = undefined;
      if (smooth) camera.getWorldDirection(blendAim).multiplyScalar(4.7).add(camera.position);
      else hero.resetPose();
    },
    setFollowing(value) {
      following = value;
      boomLength = undefined;
    },
    zoom(delta) { distance = MathUtils.clamp(distance + delta * .008, 2.45, 7.2); },
    get distance() { return distance; },
    setDistance(value) { if (Number.isFinite(value)) distance = MathUtils.clamp(value, 2.45, 7.2); },
    get following() { return following; },
  };
}
