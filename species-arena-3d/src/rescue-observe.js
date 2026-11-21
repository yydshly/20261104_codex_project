import * as THREE from 'three';

const accents = {
  gravity: 0xffcd7d, ice: 0x9ae6ff, portal: 0xf4a6ff, web: 0xff917f, speed: 0xe6ff80,
  giant: 0xffa768, mirror: 0x72f3d5, wind: 0x9ac8ff, shield: 0xffba78, rewind: 0xffe0ac, grove: 0xb3ec82,
};
const powerPreviewIds = new Set(['wind', 'shield', 'rewind', 'grove']);

function makePowerPreview(id) {
  const object = new THREE.Group();
  const materials = [];
  const add = (geometry, color, opacity) => {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const mesh = new THREE.Mesh(geometry, material);
    materials.push({ material, opacity });
    object.add(mesh);
    return mesh;
  };
  if (id === 'wind') {
    for (let index = 0; index < 3; index++) {
      const arc = add(new THREE.TorusGeometry(1.04 - index * 0.08, 0.012, 5, 72, Math.PI * 1.36), index === 1 ? 0xf2f8ff : 0x8ec9ff, 0.63 - index * 0.11);
      arc.rotation.set(-Math.PI / 2 + (index - 1) * 0.17, 0, index * 2.18);
      arc.position.y = 0.76 + index * 0.41;
      arc.scale.y = 0.72;
    }
  } else if (id === 'shield') {
    add(new THREE.CircleGeometry(0.67, 6, Math.PI / 6), 0xffa662, 0.13);
    add(new THREE.RingGeometry(0.637, 0.67, 6, 1, Math.PI / 6), 0xffc98c, 0.93).position.z = 0.008;
    add(new THREE.RingGeometry(0.52, 0.533, 6, 1, Math.PI / 6), 0xff9d77, 0.61).position.z = 0.012;
  } else if (id === 'rewind') {
    add(new THREE.RingGeometry(0.66, 0.675, 72), 0xffd19a, 0.66);
    add(new THREE.RingGeometry(0.58, 0.6, 60, 1, 0.3, Math.PI * 1.46), 0xbcb0ff, 0.57);
    for (let index = 0; index < 12; index++) {
      const angle = index * Math.PI / 6;
      const tick = add(new THREE.PlaneGeometry(0.034, index % 3 === 0 ? 0.105 : 0.065), 0xffe7c0, 0.82);
      tick.position.set(Math.sin(angle) * 0.74, Math.cos(angle) * 0.74, 0.012);
      tick.rotation.z = -angle;
    }
  } else {
    for (const side of [-1, 1]) {
      const vine = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.59, 0.025, 0.39), new THREE.Vector3(side * 0.97, 0.38, 0.31),
        new THREE.Vector3(side * 0.9, 0.78, 0.08), new THREE.Vector3(side * 1.17, 1.14, -0.19),
      ]);
      add(new THREE.TubeGeometry(vine, 22, 0.047, 5), 0x669955, 0.92);
      for (const t of [0.42, 0.64, 0.88, 1]) {
        const leaf = add(new THREE.OctahedronGeometry(0.105), t < 0.8 ? 0x8fd171 : 0xd3f98e, 0.95);
        leaf.position.copy(vine.getPoint(t));
        leaf.scale.set(1.48, 0.62, 0.36);
        leaf.rotation.z = side * (t < 0.8 ? 0.5 : 0.92);
      }
    }
  }
  return { object, materials };
}

export function createObservation(environment, makeHero) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111b28);
  scene.fog = new THREE.FogExp2(0x111b28, 0.09);
  scene.environment = environment;
  scene.environmentIntensity = 0.47;
  scene.add(new THREE.HemisphereLight(0xc2dfff, 0x48382e, 2.1));

  const key = new THREE.DirectionalLight(0xffe8d1, 3.3);
  key.position.set(3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 13 });
  key.shadow.normalBias = 0.018;
  const rim = new THREE.DirectionalLight(0x81d6ff, 2.9);
  rim.position.set(-4, 3, -4);
  scene.add(key, rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshStandardMaterial({ color: 0x141c25, roughness: 0.79 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.235;
  floor.receiveShadow = true;
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.04, 2.18, 0.22, 64), new THREE.MeshStandardMaterial({ color: 0x283743, metalness: 0.55, roughness: 0.58 }));
  platform.position.y = -0.11;
  platform.receiveShadow = true;
  scene.add(floor, platform);

  const accent = new THREE.MeshBasicMaterial({ color: 0xffcd7d, transparent: true, opacity: 0.67, depthWrite: false, toneMapped: false });
  const guide = new THREE.MeshBasicMaterial({ color: 0x63758a, transparent: true, opacity: 0.48, depthWrite: false });
  const ring = (inner, outer, material, start = 0, sweep = Math.PI * 2) => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 80, 1, start, sweep), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.003;
    scene.add(mesh);
  };
  ring(0.73, 0.744, guide);
  ring(1.87, 1.883, guide);
  for (let index = 0; index < 10; index++) ring(1.93, 1.955, accent, index * Math.PI / 5, 0.36);

  const grid = new THREE.GridHelper(40, 40, 0x576c80, 0x293746);
  grid.position.y = -0.229;
  grid.material.transparent = true;
  grid.material.opacity = 0.37;
  scene.add(grid);

  const heroes = new Map();
  const echoes = [];
  const powerPreviews = new Map();
  const handPosition = new THREE.Vector3();
  let active;
  let id;

  function pose(nextId, previewTime, {
    time = 0.8 + previewTime,
    color = accents[nextId],
    duration = 2.2,
    power: fixedPower,
  } = {}) {
    if (id !== nextId) {
      active?.object.removeFromParent();
      id = nextId;
      if (!heroes.has(id)) heroes.set(id, makeHero(id));
      active = heroes.get(id);
      scene.add(active.object);
      accent.color.set(color);
    }
    const progress = Math.min(1, previewTime / duration);
    const power = fixedPower ?? Math.sin(progress * Math.PI) ** 1.4;
    active.update({ time, power, progress, running: id === 'speed' ? power : 0, carrying: false });
    if (id === 'giant') active.object.scale.setScalar(1 + power * 0.1);

    const splitting = id === 'mirror' && power > 0.06;
    if (splitting && !echoes.length) {
      for (const side of [-1, 1]) {
        const echo = makeHero('mirror');
        echo.object.rotation.y = side * 0.28;
        scene.add(echo.object);
        echoes.push({ ...echo, side });
      }
    }
    for (const echo of echoes) {
      echo.object.visible = splitting;
      if (!splitting) continue;
      const spread = THREE.MathUtils.smoothstep(power, 0.06, 0.78);
      echo.object.position.set(echo.side * (0.37 + 0.62 * spread), 0, -0.48);
      echo.object.scale.setScalar(0.81 * spread);
      echo.update({ time: time + echo.side * 0.16, power: power * 0.75, progress });
    }

    if (powerPreviewIds.has(id) && power > 0.02 && !powerPreviews.has(id)) {
      const preview = makePowerPreview(id);
      scene.add(preview.object);
      powerPreviews.set(id, preview);
    }
    for (const [previewId, { object, materials }] of powerPreviews) {
      object.visible = id === previewId && power > 0.02;
      if (!object.visible) continue;
      object.scale.setScalar(0.65 + power * 0.4);
      for (const { material, opacity } of materials) material.opacity = opacity * power;
      if (id === 'wind') {
        object.rotation.y = previewTime * 3.9;
      } else if (id === 'grove') {
        object.scale.y *= power;
      } else {
        active.anchors.field.getWorldPosition(handPosition);
        object.position.set(handPosition.x - 0.25, handPosition.y, handPosition.z + 0.2);
        object.rotation.y = -0.3;
        if (id === 'rewind') object.rotation.z = -previewTime * 1.86;
      }
    }
  }

  return { scene, pose };
}
