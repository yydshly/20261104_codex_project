import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createArenaAbilityEffects } from './arena-abilities.js';

const LIGHT = 0xc9ff82;
const ORIGIN = new THREE.Vector3();

export function createArena(viewport) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.34;
  renderer.domElement.setAttribute('aria-label', '实时渲染的三维竞技场');
  viewport.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1116);
  scene.fog = new THREE.FogExp2(0x0a1116, 0.047);
  const environment = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  scene.environment = generator.fromScene(environment, 0.04).texture;
  scene.environmentIntensity = 0.43;
  environment.dispose();
  generator.dispose();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 64);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = 0.36;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.zoomSpeed = 0.72;
  controls.minDistance = 3.0;
  controls.maxDistance = 17;

  const cameraPosition = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  let moveCamera = false;
  let shot = 'inspect';
  let subjectHeight = 2.4;
  controls.addEventListener('start', () => { moveCamera = false; });

  scene.add(new THREE.HemisphereLight(0xbce4ff, 0x343127, 1.5));
  const key = new THREE.DirectionalLight(0xffeed4, 3.0);
  key.position.set(3.0, 7, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 18 });
  key.shadow.normalBias = 0.022;
  key.shadow.bias = -0.00018;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x79c9ff, 2.6);
  rim.position.set(-3, 3.6, -5);
  const fill = new THREE.DirectionalLight(0xcaff9c, 0.8);
  fill.position.set(3.6, 2.2, -3);
  scene.add(rim, fill);

  const subjects = new THREE.Group();
  const effects = new THREE.Group();
  scene.add(subjects, effects);
  const stage = makeStage(scene);
  const abilities = createArenaAbilityEffects(scene);

  const bursts = [];
  const chipGeometry = new THREE.OctahedronGeometry(0.035, 0);
  const ringGeometry = new THREE.RingGeometry(0.9, 1, 44);
  const arcGeometry = new THREE.RingGeometry(0.66, 0.83, 36, 1, 0.13, Math.PI * 1.22);

  function setShot(nextShot, height = 2.4, instant = false) {
    shot = nextShot;
    subjectHeight = height;
    const portraitScale = Math.max(1, 1.04 / camera.aspect);
    if (shot === 'duel') {
      cameraTarget.set(0, 0.92, 0);
      cameraPosition.set(1.35, 4.25, 9.65).multiplyScalar(portraitScale);
    } else {
      cameraTarget.set(0, height * 0.47, 0);
      cameraPosition.set(-3.25, 2.1 + height * 0.45, 5.85).multiplyScalar(Math.min(1.35, portraitScale));
    }
    moveCamera = !instant;
    if (instant) {
      camera.position.copy(cameraPosition);
      controls.target.copy(cameraTarget);
      controls.update();
    }
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    setShot(shot, subjectHeight, true);
  });
  resize.observe(viewport);

  function setSubjects(models, accent) {
    subjects.clear();
    abilities.clear();
    for (const burst of bursts) clearBurst(burst);
    bursts.length = 0;
    for (const model of models) {
      model.object.traverse(child => {
        if (!child.isMesh) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        child.castShadow = materials.some(material => !material.transparent);
        child.receiveShadow = true;
      });
      subjects.add(model.object);
    }
    stage.accent.color.set(accent);
    stage.edge.color.set(accent);
  }

  function clearBurst(burst) {
    effects.remove(burst.group);
    burst.material.dispose();
    burst.flash.material.dispose();
  }

  function strike(source, target, color, guarded, kind) {
    const group = new THREE.Group();
    group.position.copy(target);
    group.position.y = 0.78;
    const direction = new THREE.Vector3().subVectors(target, source).normalize();
    group.position.addScaledVector(direction, -0.34);
    effects.add(group);

    const material = new THREE.MeshBasicMaterial({ color: guarded ? 0xd6e8ee : color, transparent: true, fog: false, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const flash = new THREE.Mesh(guarded || kind === 'pulse' ? ringGeometry : arcGeometry, material.clone());
    flash.material.side = THREE.DoubleSide;
    group.add(flash);

    const chips = Array.from({ length: guarded ? 9 : 20 }, () => {
      const chip = new THREE.Mesh(chipGeometry, material);
      const velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.75, Math.random() - 0.5)
        .multiplyScalar(3.8).addScaledVector(direction, 0.8);
      chip.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      chip.scale.setScalar(0.7 + Math.random());
      group.add(chip);
      return { chip, velocity };
    });
    bursts.push({ group, material, flash, chips, elapsed: 0, kind });
  }

  function render(time, dt) {
    if (moveCamera) {
      const blend = 1 - Math.exp(-dt * 7);
      camera.position.lerp(cameraPosition, blend);
      controls.target.lerp(cameraTarget, blend);
      if (camera.position.distanceToSquared(cameraPosition) < 0.001 && controls.target.distanceToSquared(cameraTarget) < 0.001) {
        moveCamera = false;
      }
    }
    controls.update();
    stage.motes.rotation.y = time * 0.019;
    stage.motes.position.y = Math.sin(time * 0.6) * 0.13;

    for (let index = bursts.length - 1; index >= 0; index--) {
      const burst = bursts[index];
      burst.elapsed += dt;
      const progress = burst.elapsed / 0.47;
      if (progress >= 1) {
        clearBurst(burst);
        bursts.splice(index, 1);
        continue;
      }
      burst.flash.quaternion.copy(camera.quaternion);
      burst.flash.rotateZ((burst.kind === 'slash' ? -0.55 : 0.5) + progress * 0.5);
      burst.flash.scale.setScalar(0.28 + progress * 1.55);
      burst.flash.material.opacity = (1 - progress) ** 2 * 0.85;
      burst.material.opacity = (1 - progress) ** 2;
      for (const { chip, velocity } of burst.chips) {
        chip.position.addScaledVector(velocity, dt);
        chip.rotation.x += dt * 4;
        velocity.y -= dt * 5;
      }
    }
    renderer.render(scene, camera);
  }

  setShot('inspect', 2.4, true);
  return { setShot, setSubjects, strike, showCasts: abilities.update, render };
}

function makeStage(scene) {
  const body = new THREE.MeshStandardMaterial({ color: 0x1b2225, roughness: 0.61, metalness: 0.59 });
  const plate = new THREE.MeshStandardMaterial({ color: 0x1b2528, roughness: 0.67, metalness: 0.38 });
  const inset = new THREE.MeshStandardMaterial({ color: 0x141d21, roughness: 0.86, metalness: 0.27 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x141e22, roughness: 0.45, metalness: 0.74 });
  const accent = new THREE.MeshBasicMaterial({ color: LIGHT, transparent: true, opacity: 0.73, toneMapped: false });
  const edge = new THREE.MeshBasicMaterial({ color: LIGHT, transparent: true, opacity: 0.29, toneMapped: false });
  const line = new THREE.MeshBasicMaterial({ color: 0x6b8387, transparent: true, opacity: 0.31 });

  function mesh(geometry, material, x, y, z) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    scene.add(object);
    return object;
  }

  function ring(inner, outer, material, y = 0.003, start = 0, sweep = Math.PI * 2) {
    const object = mesh(new THREE.RingGeometry(inner, outer, 128, 1, start, sweep), material, 0, y, 0);
    object.rotation.x = -Math.PI / 2;
    return object;
  }

  mesh(new THREE.CylinderGeometry(4.19, 4.52, 0.32, 96), body, 0, -0.24, 0).receiveShadow = true;
  mesh(new THREE.CylinderGeometry(4.12, 4.17, 0.09, 96), plate, 0, -0.047, 0).receiveShadow = true;
  mesh(new THREE.CylinderGeometry(4.55, 4.77, 0.15, 96), trim, 0, -0.43, 0);
  mesh(new THREE.CylinderGeometry(4.29, 4.3, 0.014, 96), edge, 0, -0.19, 0);
  ring(3.76, 3.782, line);
  ring(3.91, 3.935, edge);
  ring(2.98, 3.001, line);
  ring(1.16, 1.179, line);
  ring(0.21, 0.226, edge);
  for (let sector = 0; sector < 8; sector++) {
    const angle = (sector + 0.5) * Math.PI / 4;
    ring(3.968, 4.008, accent, 0.004, angle, 0.12);
    ring(3.72, 3.78, line, 0.005, angle - 0.1, 0.015);
    ring(3.02, 3.71, inset, 0, angle + 0.09, Math.PI / 4 - 0.18).receiveShadow = true;
    ring(1.185, 1.205, edge, 0.004, angle + 0.27, 0.09);
  }

  const tickGeometry = new THREE.BoxGeometry(0.013, 0.005, 0.085);
  const ticks = new THREE.InstancedMesh(tickGeometry, line, 96);
  const matrix = new THREE.Object3D();
  for (let index = 0; index < 96; index++) {
    const theta = index * Math.PI / 48;
    matrix.position.set(Math.sin(theta) * 3.57, 0.003, Math.cos(theta) * 3.57);
    matrix.rotation.y = theta;
    matrix.scale.z = index % 6 === 0 ? 2.0 : 1;
    matrix.updateMatrix();
    ticks.setMatrixAt(index, matrix.matrix);
  }
  scene.add(ticks);

  const underfloor = mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x090f12, roughness: 0.89 }), 0, -0.512, 0);
  underfloor.rotation.x = -Math.PI / 2;
  underfloor.receiveShadow = true;

  const grid = new THREE.GridHelper(60, 60, 0x456369, 0x24383d);
  grid.position.y = -0.505;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  const pillarBase = new THREE.BoxGeometry(0.45, 0.51, 0.45);
  const pillarColumn = new THREE.BoxGeometry(0.24, 2.3, 0.3);
  const pillarLight = new THREE.BoxGeometry(0.028, 1.36, 0.034);
  for (let index = 0; index < 10; index++) {
    const angle = (index + 0.5) * Math.PI / 5;
    const pillar = new THREE.Group();
    pillar.position.set(Math.cos(angle) * 6.4, -0.5, Math.sin(angle) * 6.4);
    pillar.lookAt(ORIGIN);
    const base = new THREE.Mesh(pillarBase, body);
    const column = new THREE.Mesh(pillarColumn, trim);
    column.position.y = 1.29;
    column.scale.y = 0.78 + (index % 3) * 0.16;
    const lamp = new THREE.Mesh(pillarLight, edge);
    lamp.position.set(0, 1.31, 0.165);
    pillar.add(base, column, lamp);
    scene.add(pillar);
  }

  const positions = new Float32Array(83 * 3);
  for (let index = 0; index < positions.length; index += 3) {
    const radius = 3.1 + Math.random() * 8.6;
    const theta = Math.random() * Math.PI * 2;
    positions[index] = radius * Math.cos(theta);
    positions[index + 1] = Math.random() * 5.2;
    positions[index + 2] = radius * Math.sin(theta);
  }
  const dust = new THREE.BufferGeometry();
  dust.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const motes = new THREE.Points(dust, new THREE.PointsMaterial({ color: 0xa6c9c8, size: 0.022, transparent: true, opacity: 0.65, depthWrite: false }));
  scene.add(motes);
  return { accent, edge, motes };
}
