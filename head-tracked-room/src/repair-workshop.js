import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { setScreenProjection } from './screen-projection.js';

const AXLE_Y = 1.43;
const LOOSE_Y = .88;
const GEAR_Z = .335;
const brass = color => new THREE.MeshStandardMaterial({ color, metalness: .40, roughness: .33 });
const matte = color => new THREE.MeshStandardMaterial({ color, roughness: .82 });

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function block(parent, material, w, h, d, x, y, z, radius = .028) {
  return mesh(parent, new RoundedBoxGeometry(w, h, d, 4, radius), material, x, y, z);
}

function disc(parent, material, radius, depth, x, y, z) {
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, depth, 64), material, x, y, z);
  object.rotation.x = Math.PI / 2;
  return object;
}

function print(parent, w, h, x, y, z, paint, diameter = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = diameter ? 640 : Math.round(640 * h / w);
  paint(canvas.getContext('2d'), canvas.width, canvas.height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const geometry = diameter ? new THREE.CircleGeometry(w / 2, 96) : new THREE.PlaneGeometry(w, h);
  return mesh(parent, geometry, new THREE.MeshBasicMaterial({ map }), x, y, z);
}

function caseOutline() {
  const shape = new THREE.Shape();
  shape.moveTo(-.77, .24);
  shape.lineTo(.77, .24);
  shape.lineTo(.77, 1.52);
  shape.bezierCurveTo(.77, 2.52, -.77, 2.52, -.77, 1.52);
  shape.closePath();
  return shape;
}

function gear(parent, material, radius, teeth, x, y, z) {
  const profile = new THREE.Shape();
  for (let i = 0; i < teeth * 4; i++) {
    const angle = i * Math.PI * 2 / (teeth * 4);
    const r = radius - (i % 4 === 0 || i % 4 === 3 ? .036 : 0);
    if (i === 0) profile.moveTo(r, 0);
    else profile.lineTo(r * Math.cos(angle), r * Math.sin(angle));
  }
  profile.closePath();
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const hole = new THREE.Path();
    hole.absarc(radius * .53 * Math.cos(angle), radius * .53 * Math.sin(angle), radius * .132, 0, Math.PI * 2, true);
    profile.holes.push(hole);
  }
  return mesh(parent, new THREE.ExtrudeGeometry(profile, {
    depth: .032, bevelSize: .005, bevelThickness: .004, bevelSegments: 2, curveSegments: 10,
  }), material, x, y, z);
}

function rod(parent, material, a, b, radius) {
  const direction = b.clone().sub(a);
  const link = mesh(parent, new THREE.CylinderGeometry(radius, radius, direction.length(), 20), material);
  link.position.copy(a).lerp(b, .5);
  link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

export function createRepairWorkshop(onStatus, onReady) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#223032');
  scene.fog = new THREE.FogExp2('#223032', .055);
  scene.add(new THREE.HemisphereLight('#dce4dc', '#735140', 1.48));
  const warm = new THREE.DirectionalLight('#ffdbab', 1.75);
  warm.position.set(-3, 4, -3);
  warm.castShadow = true;
  warm.shadow.mapSize.set(2048, 2048);
  Object.assign(warm.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, far: 14 });
  warm.shadow.normalBias = .024;
  scene.add(warm);
  const cool = new THREE.DirectionalLight('#bcd9ee', 1.16);
  cool.position.set(3, 3, 3);
  scene.add(cool);
  const walnut = matte('#4f2e21');
  const walnutEdge = matte('#77472d');
  const metal = brass('#b7a064');
  const gilt = brass('#d8ae59');
  const bronze = brass('#8d6739');
  const steel = brass('#728481');
  const dark = matte('#26302c');
  const mat = matte('#364d44');
  const dialInk = matte('#172c28');

  const woodMap = new THREE.TextureLoader().load(import.meta.env.BASE_URL + 'outer-desk/wood.jpg', onReady);
  woodMap.colorSpace = THREE.SRGBColorSpace;
  woodMap.anisotropy = 8;
  const benchWood = new THREE.MeshStandardMaterial({ color: '#e5be99', map: woodMap, roughness: .76 });
  const floor = mesh(scene, new THREE.PlaneGeometry(23, 20), matte('#353d36'), 0, -.954, 0);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  block(scene, benchWood, 5.38, .19, 3.56, 0, -.117, 0, .055);
  for (const x of [-2.38, 2.38]) {
    for (const z of [-1.45, 1.45]) block(scene, walnut, .18, .78, .18, x, -.56, z);
  }
  for (const z of [-1.51, 1.51]) block(scene, walnut, 4.91, .20, .10, 0, -.27, z);
  block(scene, mat, 3.8, .027, 2.6, 0, -.013, -.16);
  for (const x of [-1.72, 1.72]) block(scene, brass('#75886a'), .016, .006, 2.3, x, .003, -.16, .002);
  for (const z of [-1.31, .99]) block(scene, brass('#75886a'), 3.45, .006, .014, 0, .003, z, .002);
  const wall = matte('#334743');
  for (const z of [-8.4, 8.4]) {
    block(scene, wall, 22, 5.7, .07, 0, 1.87, z);
    block(scene, walnutEdge, 22, .055, .16, 0, .56, z * .991);
    for (let i = -12; i <= 12; i++) block(scene, mat, .016, 3.6, .025, i * .67, 2.38, z * .994);
  }

  const back = new THREE.Group();
  back.rotation.y = Math.PI;
  scene.add(back);

  const wallFixtures = new THREE.Group();
  wallFixtures.position.set(-.49, -1.41, -3.73);
  wallFixtures.scale.setScalar(1.65);
  back.add(wallFixtures);
  const frame = block(wallFixtures, walnutEdge, 1.22, .88, .08, 2.20, 2.13, -2.78);
  print(wallFixtures, 1.14, .80, frame.position.x, frame.position.y, -2.73, (ctx, w, h) => {
    ctx.fillStyle = '#bfb391';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#54594f';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, w - 50, h - 50);
    ctx.fillStyle = '#41483e';
    ctx.font = '24px Georgia, serif';
    ctx.fillText('PLATE 01    /    ESCAPEMENT', 50, 66);
    for (const [x, y, r] of [[260, 219, 101], [407, 230, 45]]) {
      for (const radius of [r, r * .83, r * .15]) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - r - 21, y);
      ctx.lineTo(x + r + 21, y);
      ctx.moveTo(x, y - r - 21);
      ctx.lineTo(x, y + r + 21);
      ctx.stroke();
    }
    ctx.fillRect(50, h - 60, 130, 2);
  });
  const shelf = block(wallFixtures, walnut, 1.59, .081, .53, -2.36, 1.65, -2.6, .018);
  for (const [index, color] of ['#4b625d', '#71583c', '#9b845f', '#58665c', '#80644d'].entries()) {
    const height = .27 + (index % 3) * .066;
    block(wallFixtures, matte(color), .137, height, .306, -2.94 + index * .155,
      shelf.position.y + .04 + height / 2, -2.54, .009);
  }
  block(wallFixtures, walnutEdge, .49, .24, .38, -1.93, 1.81, -2.54, .024);

  const drawers = new THREE.Group();
  drawers.position.set(-1.70, .02, -.79);
  drawers.rotation.y = .105;
  back.add(drawers);
  block(drawers, walnut, 1.09, .93, .51, 0, .46, 0, .041);
  block(drawers, walnutEdge, 1.15, .052, .55, 0, .925, .008, .015);
  for (const x of [-.257, .257]) for (const y of [.173, .463, .753]) {
    block(drawers, benchWood, .471, .247, .055, x, y, .264, .012);
    block(drawers, bronze, .132, .046, .042, x, y, .300, .009);
    block(drawers, gilt, .084, .017, .021, x, y, .327, .005);
  }
  block(drawers, steel, .365, .048, .290, -.16, .970, .067, .011);
  block(drawers, dark, .330, .023, .246, -.16, .997, .067, .008);
  disc(drawers, bronze, .082, .037, -.16, 1.015, .084).rotation.x = 0;

  const lamp = new THREE.Group();
  lamp.position.set(1.58, 0, -.43);
  back.add(lamp);
  mesh(lamp, new THREE.CylinderGeometry(.204, .227, .065, 40), dark, 0, .033, 0);
  rod(lamp, bronze, new THREE.Vector3(0, .05, 0), new THREE.Vector3(0, 1.08, 0), .029);
  rod(lamp, bronze, new THREE.Vector3(0, 1.08, 0), new THREE.Vector3(-.36, 1.44, .085), .024);
  const shade = new THREE.Group();
  shade.position.set(-.36, 1.39, .085);
  shade.rotation.z = -.29;
  lamp.add(shade);
  mesh(shade, new THREE.CylinderGeometry(.092, .237, .19, 40, 1, true), steel, 0, -.03, 0);
  const diffuser = new THREE.MeshStandardMaterial({ color: '#e5c698', emissive: '#ffce89', emissiveIntensity: .52 });
  mesh(shade, new THREE.CylinderGeometry(.207, .207, .012, 36), diffuser, 0, -.119, 0);
  const bulb = new THREE.PointLight('#ffd4a0', 3.6, 4.5, 2);
  bulb.position.set(-.36, 1.19, .085);
  lamp.add(bulb);
  block(scene, walnut, 1.75, .21, .83, 0, .122, 0, .051);
  block(scene, walnutEdge, 1.62, .09, .75, 0, .245, 0, .026);
  mesh(scene, new THREE.ExtrudeGeometry(caseOutline(), {
    depth: .19, bevelSize: .036, bevelThickness: .034, bevelSegments: 4, curveSegments: 28,
  }), walnut, 0, 0, -.015);
  for (const x of [-.72, .72]) block(back, walnutEdge, .105, 1.37, .335, x, .94, .149, .036);
  disc(scene, gilt, .676, .052, 0, 1.51, .205);
  disc(scene, matte('#e9dabb'), .631, .031, 0, 1.51, .238);
  print(scene, 1.235, 1.235, 0, 1.51, .258, (ctx, w) => {
    ctx.fillStyle = '#e9dbb9';
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = '#897554';
    ctx.lineWidth = 2;
    for (const r of [295, 266]) {
      ctx.beginPath();
      ctx.arc(320, 320, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30;
      ctx.beginPath();
      ctx.moveTo(320 + Math.sin(a) * 271, 320 - Math.cos(a) * 271);
      ctx.lineTo(320 + Math.sin(a) * 291, 320 - Math.cos(a) * 291);
      ctx.lineWidth = i % 5 === 0 ? 3 : 1;
      ctx.stroke();
    }
    ctx.fillStyle = '#293c34';
    ctx.font = '600 42px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((n, i) => {
      const a = i * Math.PI / 6;
      ctx.fillText(n, 320 + Math.sin(a) * 223, 320 - Math.cos(a) * 223);
    });
    ctx.font = '18px Georgia';
    ctx.fillText('ATELIER   /   01', 320, 419);
  }, true);

  const hour = new THREE.Group();
  const minute = new THREE.Group();
  const second = new THREE.Group();
  for (const [group, paint, width, length, z] of [
    [hour, dialInk, .042, .31, .272], [minute, dialInk, .029, .445, .281],
    [second, bronze, .010, .495, .290],
  ]) {
    group.position.set(0, 1.51, z);
    block(group, paint, width, length, .009, 0, length * .40, 0, .004);
    scene.add(group);
  }
  disc(scene, gilt, .032, .019, 0, 1.51, .297);

  disc(back, bronze, .638, .046, 0, 1.47, .071);
  disc(back, dark, .598, .036, 0, 1.47, .105);
  block(back, steel, .183, .705, .048, 0, 1.18, .171, .017);
  block(back, dark, .080, .575, .014, 0, 1.18, .199, .005);
  for (const x of [-.465, .421]) {
    block(back, bronze, .165, .546, .058, x, AXLE_Y, .176, .019);
    disc(back, steel, .042, .054, x, AXLE_Y, .258);
  }
  for (const [x, y] of [[-.42, 1.84], [.42, 1.84], [-.43, 1.08], [.43, 1.08], [0, 1.96]]) {
    disc(back, metal, .037, .025, x, y, .143);
    block(back, dark, .041, .008, .004, x, y, .159, .001);
  }
  const socket = mesh(back, new THREE.TorusGeometry(.095, .008, 12, 48), gilt, 0, AXLE_Y, .228);
  const socketGuide = mesh(back, new THREE.TorusGeometry(.199, .005, 10, 64), brass('#e9cb82'), 0, AXLE_Y, .222);
  disc(back, steel, .045, .071, 0, AXLE_Y, .227);
  const drive = gear(back, metal, .268, 26, -.465, AXLE_Y, GEAR_Z);
  const output = gear(back, metal, .222, 22, .421, AXLE_Y, GEAR_Z);
  const loose = gear(back, gilt, .228, 22, 0, LOOSE_Y, GEAR_Z);
  disc(loose, bronze, .065, .054, 0, 0, .035);
  disc(loose, gilt, .031, .037, 0, 0, .066);
  for (const wheel of [drive, output]) disc(wheel, bronze, .048, .048, 0, 0, .041);

  const pendulum = new THREE.Group();
  pendulum.position.set(.32, 1.28, .245);
  back.add(pendulum);
  block(pendulum, steel, .023, .604, .022, 0, -.31, 0, .008);
  disc(pendulum, gilt, .112, .034, 0, -.625, .012);
  disc(pendulum, bronze, .090, .014, 0, -.625, .034);

  block(back, walnutEdge, .63, .064, .44, .99, .038, .62, .043);
  block(back, dark, .55, .035, .36, .99, .075, .62, .028);
  for (const [x, z] of [[.83,.55],[1.08,.56],[1.18,.72]]) {
    const screw = disc(back, steel, .037, .021, x, .11, z);
    screw.rotation.x = 0;
  }
  const driver = new THREE.Group();
  driver.position.set(-1.03, .057, .52);
  driver.rotation.y = -.35;
  back.add(driver);
  const shaft = mesh(driver, new THREE.CylinderGeometry(.016, .016, .40, 16), steel, 0, 0, 0);
  shaft.rotation.x = Math.PI / 2;
  block(driver, walnutEdge, .094, .081, .245, 0, 0, .265, .041);
  print(back, .79, .16, 0, .143, .437, (ctx, w, h) => {
    ctx.fillStyle = '#5a4329';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e7d1a4';
    ctx.textAlign = 'center';
    ctx.font = '600 42px "Microsoft YaHei", sans-serif';
    ctx.fillText('01   ·   机芯检修', w / 2, h * .66);
  });
  scene.traverse(object => {
    if (!object.isMesh || object.material.isMeshBasicMaterial) return;
    object.receiveShadow = true;
    object.castShadow = object !== floor;
  });
  for (const movingPart of [drive, output, loose, pendulum]) {
    movingPart.traverse(object => { object.castShadow = false; });
  }

  const camera = new THREE.PerspectiveCamera(42, 16 / 9, .04, 36);
  const center = new THREE.Vector3(0, 1.17, 0);
  const rearAngle = Math.PI + .13;
  const faceAngle = .24;
  let azimuth = rearAngle;
  let showingFace = false;
  let lookYaw = 0;
  let lookPitch = 0;
  back.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster();
  const screen = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), GEAR_Z + .055);
  let dragOffset = null;
  let aimY = LOOSE_Y;
  let runningSince = null;
  let lastTime = null;
  let dirty = true;

  function project(x, y) {
    screen.set(x, y);
    ray.setFromCamera(screen, camera);
    if (!ray.ray.intersectPlane(dragPlane, hit)) return null;
    return back.worldToLocal(hit);
  }

  function reset() {
    dragOffset = null;
    aimY = loose.position.y = LOOSE_Y;
    runningSince = null;
    dirty = true;
    onStatus(false);
  }

  return {
    reset,
    flip() {
      showingFace = !showingFace;
      return showingFace;
    },
    setLook(yaw, pitch) {
      lookYaw = yaw;
      lookPitch = pitch;
    },
    render(renderer, eye, aspect) {
      const pitch = THREE.MathUtils.clamp(-.17 + lookPitch, -.56, .055);
      const x = eye.x * .48;
      const y = eye.y * .48;
      const span = Math.max(4.94, 2.78 * aspect);
      camera.rotation.set(pitch, azimuth + lookYaw, 0, 'YXZ');
      camera.position.set(x, y, eye.z).multiplyScalar(span).applyQuaternion(camera.quaternion).add(center);
      setScreenProjection(camera, x, y, eye.z, .5, .5 / aspect);
      camera.updateMatrixWorld(true);
      renderer.render(scene, camera);
    },
    install() {
      if (runningSince !== null) return;
      aimY = AXLE_Y;
      dirty = true;
    },
    grab(x, y) {
      if (showingFace || azimuth !== rearAngle || runningSince !== null || aimY === AXLE_Y) return false;
      const p = project(x, y);
      if (!p || Math.hypot(p.x, p.y - loose.position.y) > .258) return false;
      dragOffset = p.y - loose.position.y;
      return true;
    },
    drag(x, y) {
      if (dragOffset === null) return;
      const p = project(x, y);
      if (p) {
        loose.position.y = aimY = THREE.MathUtils.clamp(p.y - dragOffset, LOOSE_Y, AXLE_Y);
        dirty = true;
      }
    },
    release(cancelled) {
      if (dragOffset === null) return;
      dragOffset = null;
      aimY = !cancelled && loose.position.y > AXLE_Y - .13 ? AXLE_Y : LOOSE_Y;
      dirty = true;
    },
    update(now, time) {
      const elapsed = lastTime === null ? 16 : Math.min(50, Math.max(0, time - lastTime));
      lastTime = time;
      const targetAngle = showingFace ? faceAngle : rearAngle;
      const turning = azimuth !== targetAngle;
      if (turning) {
        azimuth = THREE.MathUtils.lerp(azimuth, targetAngle, 1 - Math.exp(-elapsed / 145));
        if (Math.abs(azimuth - targetAngle) < .006) azimuth = targetAngle;
      }
      const moving = Math.abs(aimY - loose.position.y) > .001;
      if (moving) loose.position.y = THREE.MathUtils.lerp(loose.position.y, aimY, 1 - Math.exp(-elapsed / 72));
      if (dragOffset === null && aimY === AXLE_Y && AXLE_Y - loose.position.y <= .004 && runningSince === null) {
        loose.position.y = AXLE_Y;
        runningSince = time;
        onStatus(true);
      }
      const tick = runningSince === null ? 0 : (time - runningSince) / 1000;
      drive.rotation.z = .04 + tick * 1.23;
      loose.rotation.z = .11 - tick * 1.45;
      output.rotation.z = .02 + tick * 1.45;
      minute.rotation.z = -.81 - tick * .094;
      hour.rotation.z = 1.0 - tick * .094 / 12;
      second.rotation.z = -2.21 - tick * .65;
      pendulum.rotation.z = Math.sin(tick * 4.5) * .17;
      socket.visible = socketGuide.visible = runningSince === null;
      const changed = dirty || turning || moving || runningSince !== null;
      dirty = false;
      return changed;
    },
  };
}
