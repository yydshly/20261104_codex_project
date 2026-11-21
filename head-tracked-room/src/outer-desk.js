import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { setScreenProjection } from './screen-projection.js';

const PANEL = { width: .650, height: .650 * 9 / 16, z: .005 };
const BODY = { width: .687, height: .402 };
const FILM_DISTANCE = 1.02;
const FILM_HALF_HEIGHT = .390;
const metal = (color, roughness = .42, metalness = .3) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function piece(parent, geometry, material, x, y, z, shadows = true) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = object.receiveShadow = shadows;
  parent.add(object);
  return object;
}

function box(parent, material, w, h, d, x, y, z, radius = .003) {
  return piece(parent, new RoundedBoxGeometry(w, h, d, 3, radius), material, x, y, z);
}

function roundedRect(w, h, r) {
  const shape = new THREE.Shape();
  const x = w / 2, y = h / 2;
  shape.moveTo(-x + r, -y);
  shape.lineTo(x - r, -y);
  shape.quadraticCurveTo(x, -y, x, -y + r);
  shape.lineTo(x, y - r);
  shape.quadraticCurveTo(x, y, x - r, y);
  shape.lineTo(-x + r, y);
  shape.quadraticCurveTo(-x, y, -x, y - r);
  shape.lineTo(-x, -y + r);
  shape.quadraticCurveTo(-x, -y, -x + r, -y);
  return shape;
}

function panelGeometry(w, h, r) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, h, r), 8);
  const position = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) / w + .5, position.getY(i) / h + .5);
  }
  return geo;
}

function cable(parent, material, points, radius = .004) {
  const curve = new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v)));
  return piece(parent, new THREE.TubeGeometry(curve, 32, radius, 8), material, 0, 0, 0);
}

function tabletOnDesk(scene, target) {
  const tablet = new THREE.Group();
  tablet.position.set(.050, .194, .025);
  tablet.rotation.set(-.425, -.43, 0, 'YXZ');
  scene.add(tablet);
  const caseMaterial = metal('#23211e', .54, .18);
  const chamfer = metal('#4b4842', .33, .60);
  const glassBorder = metal('#1f1d1b', .30, .13);
  const body = new THREE.ExtrudeGeometry(roundedRect(BODY.width, BODY.height, .022), {
    depth: .018, bevelThickness: .0025, bevelSize: .0024, bevelSegments: 4, curveSegments: 10,
  });
  piece(tablet, body, [caseMaterial, chamfer], 0, 0, -.020);
  piece(tablet, panelGeometry(BODY.width - .005, BODY.height - .005, .020), glassBorder, 0, 0, .001, false);
  piece(tablet, panelGeometry(PANEL.width, PANEL.height, .008),
    new THREE.MeshBasicMaterial({ map: target.texture }), 0, 0, PANEL.z, false);

  const notch = new THREE.MeshBasicMaterial({ color: '#1b1b1a' });
  piece(tablet, panelGeometry(.108, .013, .006), notch, 0, PANEL.height / 2 - .005, PANEL.z + .0004, false);
  piece(tablet, new THREE.CircleGeometry(.0027, 24), metal('#374253', .23, .38),
    .016, PANEL.height / 2 - .0048, PANEL.z + .0008, false);
  piece(tablet, new THREE.CircleGeometry(.00085, 16), new THREE.MeshBasicMaterial({ color: '#546a7a' }),
    .0157, PANEL.height / 2 - .004, PANEL.z + .001, false);

  const pencil = metal('#eee0ba', .33, .04);
  const shaft = piece(tablet, new THREE.CapsuleGeometry(.0076, .459, 7, 24), pencil,
    .034, BODY.height / 2 + .009, -.011);
  shaft.rotation.z = Math.PI / 2;
  const tip = piece(tablet, new THREE.ConeGeometry(.0069, .019, 24), pencil,
    -.204, BODY.height / 2 + .009, -.011);
  tip.rotation.z = Math.PI / 2;
  box(tablet, chamfer, .045, .003, .004, .232, BODY.height / 2 + .002, -.009, .001);

  tablet.updateMatrixWorld(true);
  // Both joints are behind the glass in the tablet's own coordinates.
  // Keeping the stand parallel to the hinge prevents it from cutting
  // through the tablet when the tablet is angled relative to the desk.
  const hinge = new THREE.Vector3(0, .077, -.033);
  const foot = tablet.worldToLocal(new THREE.Vector3(.131, .012, -.152));
  foot.x = 0;
  const brace = box(tablet, caseMaterial, .410, hinge.distanceTo(foot), .016, 0, 0, 0, .007);
  brace.position.copy(hinge).lerp(foot, .5);
  brace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hinge.clone().sub(foot).normalize());
  const base = box(scene, caseMaterial, .435, .012, .034, 0, 0, 0, .004);
  base.position.copy(tablet.localToWorld(foot));
  base.position.y = .006;
  base.rotation.y = tablet.rotation.y;
  return tablet;
}

function display(scene, wallpaper, casing, w, h, x, y, z, yaw) {
  const monitor = new THREE.Group();
  monitor.position.set(x, y, z);
  monitor.rotation.y = yaw;
  scene.add(monitor);
  box(monitor, casing, w, h, .040, 0, 0, 0, .011);
  const glass = wallpaper
    ? new THREE.MeshBasicMaterial({ map: wallpaper, color: '#c2c9ce', toneMapped: false })
    : new THREE.MeshPhysicalMaterial({
      color: '#35434b', roughness: .45, metalness: .12, specularIntensity: .35,
      emissive: '#263744', emissiveIntensity: .19,
    });
  const picture = piece(monitor, new THREE.PlaneGeometry(w - .024, h - .035), glass, 0, .006, .0203, false);
  const led = new THREE.MeshBasicMaterial({ color: '#a3c2af' });
  piece(monitor, new THREE.CircleGeometry(.00135, 12), led, w / 2 - .025, -h / 2 + .008, .0204, false);
  return { monitor, picture };
}

function desktopMonitor(scene, casing) {
  const { monitor, picture } = display(scene, null, casing, 1.10, .616, -.245, .403, -.682, .04);
  const stand = metal('#6d675f', .57, .24);
  box(monitor, stand, .062, .0028, .001, 0, -.294, .0208, .0005);
  box(scene, stand, .249, .016, .183, -.522, .009, -.638, .008);
  box(scene, stand, .054, .292, .051, -.525, .158, -.685, .008);
  box(scene, stand, .285, .036, .037, -.390, .284, -.705, .007);
  box(scene, casing, .094, .075, .029, -.262, .284, -.713, .006);
  cable(scene, casing, [[-.283, .262, -.717], [-.399, .223, -.729],
    [-.525, .064, -.725], [-.585, .009, -.780]], .003);
  return picture;
}

function lamp(scene, x, z) {
  const base = metal('#645d4e', .47, .24);
  const stem = metal('#9a8266', .39, .42);
  const shade = metal('#a79c86', .63, .08);
  const diffuser = new THREE.MeshStandardMaterial({
    color: '#cfc2a6', emissive: '#ffd29a', emissiveIntensity: 0, roughness: .76,
  });
  piece(scene, new THREE.CylinderGeometry(.054, .062, .018, 48), base, x, .009, z);
  piece(scene, new THREE.CylinderGeometry(.019, .026, .026, 32), base, x, .027, z);
  piece(scene, new THREE.CylinderGeometry(.009, .011, .204, 28), stem, x, .126, z);

  const shadeProfile = [
    [0, 0], [.051, 0], [.060, .002], [.063, .006], [.062, .013],
    [.058, .023], [.051, .033], [.041, .041], [.028, .046], [.014, .049], [0, .050],
  ].map(([radius, height]) => new THREE.Vector2(radius, height));
  piece(scene, new THREE.LatheGeometry(shadeProfile, 64), shade, x, .224, z);
  piece(scene, new THREE.CylinderGeometry(.053, .050, .005, 48), diffuser, x, .222, z, false);
  const rim = piece(scene, new THREE.TorusGeometry(.057, .0018, 12, 64),
    stem, x, .226, z, false);
  rim.rotation.x = Math.PI / 2;

  const bulb = new THREE.PointLight('#ffd4a1', 0, 1.6, 2);
  bulb.position.set(x, .205, z);
  const pool = new THREE.SpotLight('#ffd1a0', 0, .87, .80, .94, 2);
  pool.position.copy(bulb.position);
  pool.target.position.set(x - .096, 0, z + .095);
  pool.castShadow = true;
  pool.shadow.mapSize.set(1024, 1024);
  pool.shadow.camera.near = .035;
  pool.shadow.normalBias = .001;
  pool.shadow.bias = -.00013;
  pool.shadow.radius = 4;
  // Warm light reflected back into the room by the wall and ceiling.
  const reflected = new THREE.PointLight('#ffcf99', 0, 2.75, 2);
  reflected.position.set(x + .08, .60, z - .26);
  scene.add(bulb, pool, pool.target, reflected);
  return amount => {
    diffuser.emissiveIntensity = amount * 1.06;
    bulb.intensity = amount * .055;
    pool.intensity = amount * .155;
    reflected.intensity = amount * .34;
  };
}

function addShelf(scene, wood) {
  box(scene, wood, 1.39, .042, .238, .19, 1.218, -.799, .007);
  const support = metal('#39332f', .67, .2);
  for (const x of [-.34, .72]) {
    box(scene, support, .023, .123, .022, x, 1.143, -.897);
  }
  const spines = ['#555a52', '#8b664a', '#5c4e3c', '#667477', '#8b7c61'];
  for (const [i, color] of spines.entries()) {
    const height = .130 + (i % 3) * .019;
    box(scene, metal(color, .84, 0), .036, height, .124,
      -.27 + i * .040, 1.24 + height / 2, -.795);
  }
  box(scene, metal('#7b6145', .69, 0), .203, .053, .133, .63, 1.265, -.796);
}

function addCup(scene) {
  const cup = new THREE.Group();
  cup.position.set(.845, 0, .105);
  scene.add(cup);
  const glaze = metal('#41656c', .29, .04);
  const profile = [[0, .008], [.031, .008], [.041, .019], [.045, .072], [.045, .090],
    [.042, .093], [.038, .090], [.038, .073], [.034, .029], [0, .023]]
    .map(([r, h]) => new THREE.Vector2(r, h));
  piece(cup, new THREE.LatheGeometry(profile, 40), glaze, 0, 0, 0);
  piece(cup, new THREE.TorusGeometry(.023, .005, 12, 30), glaze, .060, .056, 0);
  piece(cup, new THREE.CylinderGeometry(.070, .069, .006, 36),
    metal('#876546', .81, 0), 0, .004, 0);
  const drink = piece(cup, new THREE.CircleGeometry(.037, 40), metal('#3c2418', .25, 0), 0, .070, 0, false);
  drink.rotation.x = -Math.PI / 2;
}

export function createOuterDesk(interior, restDistance, onReady) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#171312');
  const target = new THREE.WebGLRenderTarget(1536, 864, {
    colorSpace: THREE.LinearSRGBColorSpace, type: THREE.HalfFloatType, samples: 2,
  });
  target.texture.anisotropy = 4;
  const loader = new THREE.TextureLoader();
  function image(path, color = true) {
    const map = loader.load(import.meta.env.BASE_URL + path, onReady);
    map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    map.anisotropy = 8;
    return map;
  }

  const wood = image('outer-desk/wood.jpg');
  const grain = image('outer-desk/wood-normal.jpg', false);
  const varnish = image('outer-desk/wood-rough.jpg', false);
  for (const map of [wood, grain, varnish]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1.06, .85);
    map.center.set(.5, .5);
    map.rotation = Math.PI / 2;
  }
  const deskSurface = new THREE.MeshPhysicalMaterial({
    color: '#f3f4fc', map: wood, normalMap: grain, normalScale: new THREE.Vector2(.17, .17),
    roughness: .69, clearcoat: .07, clearcoatRoughness: .89, clearcoatRoughnessMap: varnish,
  });
  const desk = piece(scene, new THREE.PlaneGeometry(2.65, 1.37), deskSurface, 0, 0, -.105, false);
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  const deskEdge = metal('#382313', .7, 0);
  box(scene, deskEdge, 2.65, .054, 1.37, 0, -.03, -.105, .006);
  box(scene, deskEdge, 2.44, .116, .035, 0, -.113, .528);
  for (const x of [-1.196, 1.196]) {
    for (const z of [-.65, .49]) box(scene, deskEdge, .071, .83, .071, x, -.46, z);
  }
  const floor = piece(scene, new THREE.PlaneGeometry(4.4, 3.9), metal('#514438', .91, 0),
    0, -.876, .75, false);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const casing = metal('#252423', .52, .15);
  const plaster = metal('#81776b', .97, 0);
  const wall = piece(scene, new THREE.PlaneGeometry(4.2, 3.6), plaster, 0, .92, -.92, false);
  wall.receiveShadow = true;
  for (const side of [-1, 1]) {
    const sideWall = piece(scene, new THREE.PlaneGeometry(3.6, 3.6), plaster,
      side * 1.80, .92, .88, false);
    sideWall.rotation.y = -side * Math.PI / 2;
    sideWall.receiveShadow = true;
  }
  const panelWood = metal('#4f3623', .82, 0);
  box(scene, panelWood, .41, 1.6, .037, -.76, .62, -.867);
  for (let i = 0; i < 7; i++) {
    box(scene, metal(i % 2 ? '#61412a' : '#503423', .84, 0),
      .022, 1.56, .015, -.94 + i * .055, .61, -.840);
  }
  addShelf(scene, panelWood);

  const desktopPicture = desktopMonitor(scene, casing);
  const standbyMaterial = desktopPicture.material;
  const setLamp = lamp(scene, .69, -.174);

  const laptop = new THREE.Group();
  laptop.position.set(-.890, .043, .021);
  laptop.rotation.y = .25;
  laptop.scale.setScalar(2.5);
  scene.add(laptop);
  const { monitor: lid, picture } = display(laptop, image('window-desk/room.png'), casing,
    .340, .220, 0, .112, -.083, 0);
  lid.rotation.x = -.16;
  picture.material.color.set('#799f9c');
  box(laptop, metal('#3c3b3a', .43, .42), .343, .014, .231, 0, -.010, .022, .006);
  box(laptop, casing, .290, .002, .094, 0, -.002, .020, .001);
  const key = metal('#51504e', .61, .07);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 13; col++) {
    box(laptop, key, .017, .0019, .015, (col - 6) * .021, .0002, .056 - row * .021, .0007);
  }
  box(laptop, metal('#575552', .61, .17), .122, .001, .054, 0, -.0023, .094, .0004);

  const tablet = tabletOnDesk(scene, target);
  const spill = new THREE.PointLight('#d9e8ff', .034, .43, 2);
  spill.position.copy(tablet.localToWorld(new THREE.Vector3(0, -.080, .075)));
  scene.add(spill);

  const notebook = new THREE.Group();
  notebook.position.set(.544, .011, .123);
  notebook.rotation.y = -.28;
  scene.add(notebook);
  const cover = metal('#292d2b', .87, .02);
  box(notebook, cover, .177, .004, .231, 0, -.007, 0);
  box(notebook, metal('#b8ab95', .96, 0), .171, .013, .224, .001, .001, 0);
  box(notebook, cover, .177, .004, .231, 0, .009, 0);
  box(notebook, metal('#534a3a', .89, 0), .005, .003, .231, .053, .0115, 0);
  const pen = piece(notebook, new THREE.CapsuleGeometry(.0034, .117, 5, 16),
    metal('#424d4a', .28, .5), -.040, .016, .008);
  pen.rotation.x = Math.PI / 2;
  pen.rotation.z = -.12;
  addCup(scene);

  const ambient = new THREE.HemisphereLight('#e4eeff', '#775b45', 1.45);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight('#fff1d6', 1.58);
  keyLight.position.set(-.91, 1.49, .66);
  keyLight.target.position.set(.07, .10, -.19);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  Object.assign(keyLight.shadow.camera, { left: -1.25, right: 1.25, top: 1, bottom: -1, near: .06, far: 3 });
  keyLight.shadow.bias = -.00012;
  keyLight.shadow.normalBias = .0018;
  keyLight.shadow.radius = 3;
  scene.add(keyLight, keyLight.target);
  const bounce = new THREE.DirectionalLight('#c4d3ea', .36);
  bounce.position.set(.70, .57, -.27);
  scene.add(bounce);

  const camera = new THREE.PerspectiveCamera(40, 1, .035, 8);
  const home = new THREE.Vector3(-.225, .535, 1);
  camera.position.copy(home);
  camera.lookAt(.020, .252, -.15);
  const basis = camera.quaternion.clone();
  const displacement = new THREE.Vector3();
  const look = new THREE.Euler(0, 0, 0, 'YXZ');
  const turn = new THREE.Quaternion();
  const inverseTurn = new THREE.Quaternion();
  const filmEye = new THREE.Vector3();
  const localEye = new THREE.Vector3();
  const innerCamera = new THREE.PerspectiveCamera(45, 1, .05, 8);
  const laptopColor = picture.material.color.clone();
  const daySky = ambient.color.clone();
  const nightSky = new THREE.Color('#ffe6ca');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lighting = 'auto';
  let nightAmount = null;
  let lastLightingFrame = 0;
  let displayScene = null;
  let overviewTarget;
  let overviewMaterial;
  let overviewDirty = false;

  return {
    setDisplayScene(next) {
      if (displayScene === next) return false;
      displayScene = next;
      if (displayScene && !overviewTarget) {
        overviewTarget = new THREE.WebGLRenderTarget(960, 540, {
          colorSpace: THREE.LinearSRGBColorSpace, type: THREE.HalfFloatType,
        });
        overviewMaterial = new THREE.MeshBasicMaterial({ map: overviewTarget.texture });
      }
      desktopPicture.material = displayScene ? overviewMaterial : standbyMaterial;
      overviewDirty = Boolean(displayScene);
      return true;
    },
    setLighting(mode) {
      lighting = mode;
    },
    update(now, time) {
      const interiorChanged = displayScene ? displayScene.update(time) : interior.update(now, time);
      if (displayScene && interiorChanged) overviewDirty = true;
      const hour = now.getHours();
      const night = displayScene || lighting === 'night' || (lighting === 'auto' && (hour >= 19 || hour < 6));
      const targetAmount = night ? 1 : 0;
      const elapsed = Math.min(time - lastLightingFrame, 100);
      lastLightingFrame = time;
      const amount = nightAmount === null || reducedMotion.matches || Math.abs(targetAmount - nightAmount) < .002
        ? targetAmount
        : THREE.MathUtils.lerp(nightAmount, targetAmount, 1 - Math.exp(-elapsed / 185));
      if (amount === nightAmount) return interiorChanged;

      nightAmount = amount;
      setLamp(amount);
      ambient.color.copy(daySky).lerp(nightSky, amount);
      ambient.intensity = THREE.MathUtils.lerp(1.45, .96, amount);
      keyLight.intensity = THREE.MathUtils.lerp(1.58, .28, amount);
      bounce.intensity = THREE.MathUtils.lerp(.36, .24, amount);
      spill.intensity = THREE.MathUtils.lerp(.034, .059, amount);
      picture.material.color.copy(laptopColor).multiplyScalar(1 - amount * .62);
      return true;
    },
    setLook(yaw, pitch) {
      look.set(pitch, yaw, 0);
    },
    render(renderer, eye, aspect) {
      const x = eye.x * .49;
      const y = eye.y * .47;
      const z = (eye.z - restDistance) * .49;
      camera.position.copy(home).add(displacement.set(x, y, z).applyQuaternion(basis));
      turn.setFromEuler(look);
      camera.quaternion.copy(basis).multiply(turn);
      filmEye.set(x, y, z).applyQuaternion(inverseTurn.copy(turn).invert());
      setScreenProjection(camera, filmEye.x, filmEye.y, FILM_DISTANCE + filmEye.z,
        FILM_HALF_HEIGHT * aspect, FILM_HALF_HEIGHT);

      // The eye that sees the tablet also sees the inner room. Convert it
      // to screen coordinates and scale the physical display width to 1.
      tablet.worldToLocal(localEye.copy(camera.position));
      localEye.z -= PANEL.z;
      localEye.divideScalar(PANEL.width);
      localEye.z = Math.max(.45, localEye.z);
      innerCamera.position.copy(localEye);
      setScreenProjection(innerCamera, localEye.x, localEye.y, localEye.z, .5, 9 / 32);

      const previousTarget = renderer.getRenderTarget();
      const refreshShadows = renderer.shadowMap.needsUpdate;
      try {
        if (displayScene) {
          renderer.shadowMap.needsUpdate = false;
          if (overviewDirty) {
            renderer.setRenderTarget(overviewTarget);
            renderer.render(displayScene.scene, displayScene.overview);
            overviewDirty = false;
          }
          displayScene.aimDetail(localEye);
          renderer.setRenderTarget(target);
          renderer.render(displayScene.scene, displayScene.detailCamera);
        } else {
          renderer.shadowMap.needsUpdate = refreshShadows || interior.shadowsChanged;
          renderer.setRenderTarget(target);
          renderer.render(interior.scene, innerCamera);
        }
      } finally {
        renderer.setRenderTarget(previousTarget);
      }
      renderer.shadowMap.needsUpdate = refreshShadows;
      renderer.render(scene, camera);
    },
  };
}
