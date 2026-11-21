import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCity, createCableCar } from './rescue-city.js';
import { createCatalogHero } from './hero-models.js';
import { createObservation } from './rescue-observe.js';
import { createRescueEffects } from './rescue-powers.js';
import { createWebSequence } from './rescue-web.js';
import { createSpeedSequence } from './rescue-speed.js';
import { jointFrame } from './rescue-joint.js';
import { createJointCamera } from './rescue-joint-camera.js';
import { createGiantSequence } from './rescue-giant.js';
import { MIRROR_WINDOW_TIME, createMirrorSequence } from './rescue-mirror.js';
import { createWindSequence } from './rescue-wind.js';
import { createShieldSequence } from './rescue-shield.js';
import { REWIND_START, rewindWorldTime, createRewindSequence } from './rescue-rewind.js';
import { createGroveSequence } from './rescue-grove.js';

export const BREAK_TIME = 2.45;
export const CATCH_TIME = 3.42;
export const RESCUE_DURATION = 11.6;
export const SPEED_SLOW_START = 2.76;
export const SPEED_RESUME = 8.16;
const SPEED_RATE = 0.12;
const RESUME_LENGTH = 0.65;

const AXIS_X = new THREE.Vector3(1, 0, 0);
const ENTRY = new THREE.Vector3(0.45, 3.06, 0);
const EXIT = new THREE.Vector3(4.05, 1.37, 2.25);
const EXIT_OFFSET = new THREE.Vector3().subVectors(EXIT, ENTRY);
const ICE_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.75, 3.36, 0), new THREE.Vector3(1.24, 2.67, 0.26),
  new THREE.Vector3(3.58, 1.33, 1.0), new THREE.Vector3(5.82, 0.87, 1.58),
  new THREE.Vector3(7.64, 0.72, 1.82),
]);
const HERO_COLORS = {
  gravity: 0xffae52, ice: 0x6bcfff, portal: 0xf376fa, web: 0xff9b89, speed: 0xf1ff82,
  giant: 0xffae70, mirror: 0x70eed7, wind: 0x88baff, shield: 0xffa36a, rewind: 0xffdca5, grove: 0x9dd26e,
};
const HERO_STANCES = {
  gravity: [0.95, 2.55], ice: [2.02, 3.07], portal: [2.6, 1.15], web: [1.25, 3], speed: [2.4, 2.9],
  giant: [0.8, 2.1], mirror: [1.8, 2.6], wind: [2.2, 2.5], shield: [1.65, 2.25], rewind: [1.6, 2.8], grove: [1.75, 2.6],
};
const RESCUE_FACTORIES = new Map([
  ['giant', createGiantSequence],
  ['mirror', createMirrorSequence],
  ['wind', createWindSequence],
  ['shield', createShieldSequence],
  ['rewind', createRewindSequence],
  ['grove', createGroveSequence],
]);
const { clamp, lerp, smoothstep } = THREE.MathUtils;

function speedWorldTime(time) {
  const slowDuration = clamp(time - SPEED_SLOW_START, 0, SPEED_RESUME - SPEED_SLOW_START);
  const recovery = Math.max(0, time - SPEED_RESUME);
  const acceleration = recovery < RESUME_LENGTH ? recovery ** 2 / (2 * RESUME_LENGTH) : recovery - RESUME_LENGTH / 2;
  return Math.min(time, SPEED_SLOW_START) + SPEED_RATE * (slowDuration + recovery) + (1 - SPEED_RATE) * acceleration;
}

function makeOrbit(camera, canvas, minDistance, maxDistance) {
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false;
  controls.enablePan = false;
  controls.minDistance = minDistance;
  controls.maxDistance = maxDistance;
  controls.minPolarAngle = 0.16;
  controls.maxPolarAngle = Math.PI * 0.49;
  return controls;
}

function clipCar(car, plane) {
  car.traverse(child => {
    if (!child.isMesh) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      material.clippingPlanes = [plane];
      material.clipShadows = true;
    }
  });
}

export function createRescueStage(viewport) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;
  renderer.domElement.setAttribute('aria-label', '实时渲染的港湾街缆车救援');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101b30);
  scene.fog = new THREE.FogExp2(0x101b30, 0.029);
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = generator.fromScene(room, 0.07).texture;
  scene.environmentIntensity = 0.34;
  room.dispose();
  generator.dispose();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 95);
  const observationCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 55);
  const orbit = makeOrbit(camera, renderer.domElement, 4, 32);
  orbit.enablePan = true;
  const observationOrbit = makeOrbit(observationCamera, renderer.domElement, 2.7, 11);
  const observation = createObservation(scene.environment, createCatalogHero);
  orbit.addEventListener('change', () => { if (orbit.enabled) renderer.render(scene, camera); });
  observationOrbit.addEventListener('change', () => { if (observationOrbit.enabled) renderer.render(observation.scene, observationCamera); });
  const cameraTarget = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const lamps = new THREE.HemisphereLight(0xabcfff, 0x493247, 2.15);
  const key = new THREE.DirectionalLight(0xffe0c1, 2.4);
  const warmKey = key.color.clone();
  const slowKey = new THREE.Color(0x95cbff);
  key.position.set(-5, 11, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 10, bottom: -8, near: 0.5, far: 38 });
  key.shadow.normalBias = 0.022;
  const rim = new THREE.DirectionalLight(0x6cbcff, 2.3);
  rim.position.set(3, 8, -9);
  const powerLight = new THREE.PointLight(0xffae52, 0, 8, 1.6);
  const runnerLight = new THREE.PointLight(HERO_COLORS.speed, 0, 6, 1.6);
  const exitLight = new THREE.PointLight(0xf376fa, 0, 5, 1.7);
  exitLight.position.copy(EXIT);
  scene.add(lamps, key, rim, powerLight, runnerLight, exitLight);

  const city = createCity(scene);
  const car = createCableCar();
  const exitCar = createCableCar();
  const speedWindow = [car.getObjectByName('speed-exit-glass'), car.getObjectByName('speed-exit-reflection')];
  const frontGlazing = car.children.filter(piece => piece.userData.frontGlazing);
  const entryClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1000);
  const exitClip = new THREE.Plane(AXIS_X.clone(), -EXIT.x);
  clipCar(car, entryClip);
  clipCar(exitCar, exitClip);
  const effects = createRescueEffects();
  const web = createWebSequence();
  const speed = createSpeedSequence();
  const setJointShot = createJointCamera();
  const heroes = new Map();
  const specialRescues = new Map();
  const incident = makeIncidentEffects(scene);
  const portals = [{ position: ENTRY, openness: 0 }, { position: EXIT, openness: 0 }];
  const tangent = new THREE.Vector3();
  scene.add(car, exitCar, effects.object, web.object, speed.object);

  let activeHero = null;
  let jointPartner = null;
  let activeRescue = null;
  let time = 0;
  let id = 'gravity';
  let cameraMode = 'follow';
  let perspective = 'street';
  let observing = false;

  function getHero(heroId) {
    if (!heroes.has(heroId)) heroes.set(heroId, { id: heroId, ...createCatalogHero(heroId) });
    return heroes.get(heroId);
  }

  function selectRescue(id) {
    const factory = RESCUE_FACTORIES.get(id);
    if (factory && !specialRescues.has(id)) {
      const sequence = factory();
      specialRescues.set(id, sequence);
      scene.add(sequence.object);
    }
    const next = specialRescues.get(id) ?? null;
    if (next !== activeRescue) {
      if (activeRescue) activeRescue.object.visible = false;
      if (next) next.object.visible = true;
      activeRescue = next;
    }
    return next;
  }

  function showHero(heroId, previewTime = 0, resetCamera = false) {
    const entering = !observing;
    observing = true;
    orbit.enabled = false;
    observationOrbit.enabled = true;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.setAttribute('aria-label', '可旋转和缩放的救援角色模型');
    observation.pose(heroId, previewTime);
    observationCamera.fov = 2 * Math.atan(Math.max(0.27, 0.28 / observationCamera.aspect)) * 180 / Math.PI;
    observationCamera.updateProjectionMatrix();
    if (entering || resetCamera) {
      observationCamera.position.set(-2.65, 2.42, 4.6);
      observationOrbit.target.set(0, 1.04, 0);
      observationOrbit.update();
    }
    renderer.render(observation.scene, observationCamera);
  }

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    observationCamera.aspect = camera.aspect;
    if (observing) {
      observationCamera.fov = 2 * Math.atan(Math.max(0.27, 0.28 / observationCamera.aspect)) * 180 / Math.PI;
      observationCamera.updateProjectionMatrix();
      renderer.render(observation.scene, observationCamera);
    } else {
      draw(id, time, cameraMode, perspective);
    }
  }

  function draw(nextId, nextTime, nextCameraMode, nextPerspective = 'street') {
    const startOrbit = nextCameraMode === 'free' && cameraMode !== 'free';
    id = nextId;
    time = nextTime;
    cameraMode = nextCameraMode;
    perspective = nextPerspective;
    observing = false;
    observationOrbit.enabled = false;
    orbit.enabled = cameraMode === 'free';
    renderer.domElement.style.touchAction = orbit.enabled ? 'none' : 'pan-y';
    renderer.domElement.setAttribute('aria-label', '实时渲染的港湾街缆车救援');

    const isJoint = id === 'joint';
    const primaryId = isJoint ? 'web' : id;
    if (activeHero?.id !== primaryId) {
      if (activeHero) activeHero.object.removeFromParent();
      activeHero = getHero(primaryId);
      scene.add(activeHero.object);
    }
    if (isJoint && !jointPartner) {
      jointPartner = getHero('speed');
      scene.add(jointPartner.object);
    } else if (!isJoint && jointPartner) {
      if (jointPartner !== activeHero) jointPartner.object.removeFromParent();
      jointPartner = null;
    }

    const isWeb = primaryId === 'web';
    const isSpeed = id === 'speed';
    const isRewind = id === 'rewind';
    const isGiant = id === 'giant';
    const isMirror = id === 'mirror';
    const usesSpeed = isSpeed || isJoint;
    const joint = isJoint ? jointFrame(time, perspective) : null;
    let worldTime = joint?.eventTime ?? time;
    if (isSpeed) worldTime = speedWorldTime(time);
    if (isRewind) worldTime = rewindWorldTime(time);
    const soloRate = isSpeed && time >= SPEED_SLOW_START ? lerp(SPEED_RATE, 1, clamp((time - SPEED_RESUME) / RESUME_LENGTH, 0, 1)) : 1;
    const worldRate = joint?.worldRate ?? soloRate;
    const broken = worldTime >= BREAK_TIME;
    const fall = clamp((worldTime - BREAK_TIME) / (CATCH_TIME - BREAK_TIME), 0, 1);
    const after = Math.max(0, time - CATCH_TIME);
    const turnOn = smoothstep(time, 2.6, 3.55);
    let power = 0;
    let iceProgress = 0;
    let portalOpen = 0;
    const [heroX, heroZ] = HERO_STANCES[primaryId];
    const entrance = smoothstep(time, 0.55, 2.65);
    const hero = activeHero.object;
    hero.position.set(heroX + (1 - entrance) * 1.55, 0, heroZ + (1 - entrance) * 1.05);

    car.rotation.set(0, 0, 0);
    if (!broken) {
      const approach = worldTime / BREAK_TIME;
      car.position.set(lerp(-6.1, -1.6, approach), lerp(5.48, 5.02, approach), 0);
      car.rotation.z = Math.sin(worldTime * 3.8) * 0.018;
    } else {
      car.position.set(lerp(-1.6, -0.75, fall), 5.02 - 1.66 * fall ** 2, 0);
      car.rotation.z = lerp(0, -0.28, fall);
    }

    if (id === 'gravity') {
      power = turnOn * (1 - smoothstep(time, 8.05, 9.2));
      hero.position.y = 0.96 * smoothstep(time, 2.15, 4.55) * (1 - smoothstep(time, 7.65, 9.35));
      const recover = smoothstep(time, 5.02, 8.63);
      const recoil = Math.sin(Math.PI * smoothstep(time, CATCH_TIME, 4.47));
      if (after > 0) {
        car.position.set(lerp(-0.75, 1.25, recover) + 0.28 * recoil, lerp(3.36, 0.72, recover) - 0.36 * recoil, 0);
        car.rotation.z = -0.28 * Math.cos(after * 4.0) * Math.exp(-after * 1.08);
        car.rotation.x = 0.07 * Math.sin(after * 3.7) * Math.exp(-after);
      }
    } else if (id === 'ice') {
      power = turnOn * (1 - smoothstep(time, 5.7, 7.35));
      iceProgress = smoothstep(time, 2.58, 6.28);
      if (after > 0) {
        const rolling = Math.min(1, after / 4.62);
        const along = 1 - (1 - rolling) ** 1.42;
        ICE_CURVE.getPointAt(along, car.position);
        ICE_CURVE.getTangentAt(along, tangent);
        tangent.y *= 1 - smoothstep(along, 0.92, 1);
        car.quaternion.setFromUnitVectors(AXIS_X, tangent.normalize());
      }
    } else if (id === 'portal') {
      portalOpen = smoothstep(time, 2.58, 3.32) * (1 - smoothstep(time, 6.2, 7.5));
      power = portalOpen;
      if (after > 0) {
        const transfer = smoothstep(time, CATCH_TIME - 0.85, 7.8);
        const initial = smoothstep(CATCH_TIME, CATCH_TIME - 0.85, 7.8);
        const forward = (transfer - initial) / (1 - initial);
        car.position.set(lerp(-0.75, 4.08, forward), lerp(3.36, 2.41, forward ** 1.1), 0);
        car.rotation.z = lerp(-0.28, 0, smoothstep(forward, 0.28, 0.88));
      }
    } else if (isSpeed && broken) {
      const drop = (worldTime - BREAK_TIME) / (CATCH_TIME - BREAK_TIME);
      const contact = Math.sqrt((5.02 - 0.72) / 1.66);
      const settle = smoothstep(drop, contact, contact + 0.65);
      car.position.set(-1.6 + 0.85 * Math.min(drop, contact) + 0.65 * settle, Math.max(0.72, 5.02 - 1.66 * drop ** 2), 0);
      car.rotation.z = -0.28 * Math.min(drop, 1) * (1 - smoothstep(drop, 1.18, contact));
    }

    web.object.visible = isWeb;
    speed.object.visible = usesSpeed;
    const webTime = joint?.webTime ?? time;
    const speedTime = joint?.speedTime ?? time;
    for (const piece of frontGlazing) {
      piece.visible = isMirror ? time < MIRROR_WINDOW_TIME : !usesSpeed || !speedWindow.includes(piece) || speedTime < 3.18;
    }
    if (isWeb) power = web.update({ time: webTime, car, hero, heroRig: activeHero });
    const runner = jointPartner ?? activeHero;
    const movement = usesSpeed ? speed.update({
      time: speedTime, worldTime: joint?.debrisTime ?? worldTime, car,
      hero: runner.object, heroRig: runner, trailSeconds: isJoint && perspective === 'street' ? 0.85 : undefined,
      returnBend: isJoint ? 0.24 : undefined,
    }) : null;
    const runnerPower = (movement?.running ?? 0) * 0.55;
    if (isSpeed) power = runnerPower;
    const rescueAction = selectRescue(id);
    const newMovement = rescueAction?.update({ time, worldTime, car, hero, heroRig: activeHero });
    if (newMovement) power = newMovement.power;

    const transferring = id === 'portal' && time >= 3.02;
    entryClip.constant = transferring ? ENTRY.x : 1000;
    car.visible = !transferring || car.position.x < ENTRY.x + 1.72;
    exitCar.visible = transferring && car.position.x > ENTRY.x - 1.72;
    exitCar.position.copy(car.position).add(EXIT_OFFSET);
    exitCar.quaternion.copy(car.quaternion);
    focus.copy(car.position);
    if (exitCar.visible) {
      const emergence = smoothstep(car.position.x, ENTRY.x - 0.55, ENTRY.x + 0.95);
      focus.lerp(exitCar.position, emergence);
    }

    if (!isWeb && !isSpeed && !rescueAction) hero.rotation.y = Math.atan2(focus.x - hero.position.x, focus.z - hero.position.z);
    activeHero.update({
      time: webTime, power, progress: webTime / RESCUE_DURATION,
      running: isSpeed ? movement.running : newMovement?.running,
      carrying: isSpeed ? movement.carrying : newMovement?.carrying,
      lowering: newMovement?.lowering,
    });
    if (jointPartner) {
      jointPartner.update({ time: speedTime, power: runnerPower, progress: clamp(speedTime / RESCUE_DURATION, 0, 1), ...movement });
    }
    if (isWeb) web.afterPose();
    if (usesSpeed) speed.afterPose();
    if (rescueAction) {
      rescueAction.afterPose?.();
      focus.copy(car.position);
    }
    const repairProgress = isRewind && time >= REWIND_START ? 1 - smoothstep(worldTime, BREAK_TIME, BREAK_TIME + 0.34) : 0;
    city.update(worldTime, broken, repairProgress);
    portals[0].openness = portalOpen;
    portals[1].openness = portalOpen;
    effects.update({ id, time, power, car: focus, iceProgress, iceCurve: ICE_CURVE, portals, hero: hero.position });
    powerLight.color.setHex(HERO_COLORS[primaryId]);
    powerLight.position.copy(isSpeed || isMirror ? hero.position : focus);
    if (isSpeed) powerLight.position.y += 0.8;
    powerLight.position.z += 1.0;
    powerLight.intensity = power * (rescueAction ? 10 : 17);
    if (jointPartner) {
      runnerLight.position.copy(jointPartner.object.position);
      runnerLight.position.y += 0.85;
    }
    runnerLight.intensity = jointPartner ? runnerPower * 18 : 0;
    exitLight.intensity = portalOpen * 13;
    key.color.copy(warmKey).lerp(slowKey, (1 - worldRate) * 0.7);
    incident.update(worldTime);

    const following = cameraMode === 'follow';
    const portrait = Math.min(1, camera.aspect / 1.45);
    const shot = smoothstep(time, 2.45, 4.4);
    if (following && jointPartner) {
      setJointShot(camera, cameraTarget, {
        perspective, eventTime: worldTime, car, webHero: hero, speedHero: jointPartner.object, aspect: camera.aspect,
      });
    } else if (following && isMirror) {
      const split = smoothstep(time, 2.25, 3.35);
      cameraTarget.set(lerp(car.position.x * 0.62, -0.18, split), lerp(3.68, 2.4, split), lerp(0.35, 1.05, split));
      camera.position.set(cameraTarget.x + lerp(3.2, 4.1, split), lerp(6.75, 6.25, split), lerp(13.35, 15.7, split) / Math.sqrt(portrait));
    } else if (following && isRewind) {
      const frame = smoothstep(time, 2.25, 3.45);
      cameraTarget.set(lerp(car.position.x * 0.62, -0.64, frame), lerp(3.68, 3.04, frame), lerp(0.35, 0.53, frame));
      camera.position.set(
        cameraTarget.x + lerp(2.8, 4.45, frame),
        lerp(6.75, 6.95, frame),
        lerp(13.35, 15.85, frame) / Math.sqrt(portrait),
      );
    } else if (following) {
      const outcomeTarget = isSpeed
        ? lerp(2.0, 3.55, smoothstep(time, 7.85, 9.5))
        : id === 'wind' ? focus.x + 0.38 : focus.x * 0.73 + heroX * 0.27;
      const targetX = lerp(car.position.x * 0.63, outcomeTarget, shot);
      const anchorFraming = isWeb ? smoothstep(time, 2.68, 3.42) * (1 - smoothstep(time, 4.7, 6.0)) : 0;
      const evacuationFraming = isSpeed ? smoothstep(time, SPEED_SLOW_START, 4.18) : 0;
      const giantFraming = isGiant ? smoothstep(time, 2.45, 3.45) * (1 - smoothstep(time, 9.45, 11.3)) : 0;
      const fieldFraming = id === 'wind' || id === 'shield' || id === 'grove' ? smoothstep(time, 2.58, 4.25) : 0;
      cameraTarget.set(
        targetX, lerp(3.68, 2.04, shot) + anchorFraming * 0.68 - evacuationFraming * 0.4 + giantFraming * 0.95 + fieldFraming * 0.25,
        0.35 + evacuationFraming * 0.75 + giantFraming * 0.4,
      );
      camera.position.set(
        targetX + lerp(2.8, 5.2, shot), lerp(6.75, 4.42, shot),
        (lerp(13.35, 12.1, shot) + anchorFraming + evacuationFraming * 1.65 + giantFraming * 1.75 + fieldFraming * (id === 'wind' ? 2.15 : 1.4)) / Math.sqrt(portrait),
      );
    } else if (cameraMode === 'fixed') {
      cameraTarget.set(0.55, 3.0, 0.3);
      camera.position.set(8.65, 7.5, 16.5);
    }
    const minimumHorizontal = following ? 0.43 : 0.52;
    camera.fov = 2 * Math.atan(Math.max(0.288, minimumHorizontal / camera.aspect)) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    if (cameraMode !== 'free') {
      camera.lookAt(cameraTarget);
    } else if (startOrbit) {
      orbit.target.copy(cameraTarget);
      orbit.update();
    }
    renderer.render(scene, camera);
    return { rescued: newMovement?.rescued ?? movement?.rescued ?? 0, worldRate, worldTime };
  }

  viewport.append(renderer.domElement);
  resize();
  new ResizeObserver(resize).observe(viewport);
  return { draw, showHero };
}

function makeIncidentEffects(scene) {
  const sparkCount = 46;
  const positions = new Float32Array(sparkCount * 3);
  const colors = new Float32Array(sparkCount * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 0.102, vertexColors: true, transparent: true, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
  const sparks = new THREE.Points(geometry, material);
  sparks.frustumCulled = false;
  const flash = new THREE.PointLight(0xffa85e, 0, 4);
  flash.position.set(-1.6, 6.65, 0);
  scene.add(sparks, flash);
  for (let index = 0; index < sparkCount; index++) {
    colors.set([1, 0.36 + (index % 9) * 0.068, 0.08 + (index % 4) * 0.15], index * 3);
  }

  return {
    update(time) {
      const elapsed = time - BREAK_TIME;
      sparks.visible = elapsed >= 0 && elapsed < 1.09;
      flash.intensity = sparks.visible ? 64 * Math.exp(-elapsed * 14) : 0;
      if (!sparks.visible) return;
      material.opacity = 1 - smoothstep(elapsed, 0.15, 1.09);
      for (let index = 0; index < sparkCount; index++) {
        const angle = index * 2.4;
        const speed = 0.7 + (index % 11) * 0.25;
        positions.set([
          -1.6 + Math.cos(angle) * speed * elapsed,
          6.65 + (Math.sin(angle) * speed + 1.4) * elapsed - 4.7 * elapsed ** 2,
          Math.sin(index * 3.9) * speed * elapsed,
        ], index * 3);
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}
