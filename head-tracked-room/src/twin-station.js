import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { setScreenProjection } from './screen-projection.js';
import { addStationPassengers } from './station-passengers.js';

const TRACK_Z = -1.05;
const PLATFORM_HEIGHT = .37;
const CRUISE = 9;
const BRAKE = 5.1;
const SPEED = 7;
const START_X = -77.4;
const STOP_TIME = CRUISE + BRAKE;
const DOORS_OPEN_TIME = STOP_TIME + 1.55;
const DOORS_CLOSE_TIME = DOORS_OPEN_TIME + 6.2;
const DEPART_TIME = DOORS_CLOSE_TIME + 1.55;
const END_TIME = DEPART_TIME + 6.7;
const FRONT_DOOR = -1.91;
const STOP_X = START_X + SPEED * (CRUISE + BRAKE / 2);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const surface = (color, roughness = .81, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const luminous = color => new THREE.MeshBasicMaterial({ color });

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function box(parent, material, w, h, d, x, y, z, radius = 0) {
  const geometry = radius ? new RoundedBoxGeometry(w, h, d, 3, radius) : new THREE.BoxGeometry(w, h, d);
  return mesh(parent, geometry, material, x, y, z);
}

function repeated(parent, geometry, material, count, place) {
  const parts = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    place(dummy, i);
    dummy.updateMatrix();
    parts.setMatrixAt(i, dummy.matrix);
  }
  parent.add(parts);
  return parts;
}

function graphic(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  function redraw(...args) {
    paint(ctx, width, height, ...args);
    texture.needsUpdate = true;
  }
  return { texture, redraw };
}

function sign(parent, texture, w, h, x, y, z) {
  return mesh(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture }), x, y, z);
}

function stationSigns() {
  const name = graphic(640, 180, (ctx, w, h) => {
    ctx.fillStyle = '#193037';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#889d9a';
    ctx.lineWidth = 4;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = '#e7e4cd';
    ctx.font = '600 83px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('雾港站', 291, 99);
    ctx.font = '500 29px Arial';
    ctx.fillText('W U G A N G', 291, 143);
    ctx.fillStyle = '#b59454';
    ctx.fillRect(501, 44, 91, 91);
    ctx.fillStyle = '#172830';
    ctx.font = '700 52px Arial';
    ctx.fillText('1', 546, 107);
  });
  name.redraw();
  const arrival = graphic(512, 96, (ctx, w, h, line) => {
    ctx.fillStyle = '#151b20';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '600 46px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#ffc16e';
    ctx.textAlign = 'center';
    ctx.fillText(line, w / 2, 65);
  });
  const exit = graphic(384, 112, (ctx, w, h) => {
    ctx.fillStyle = '#294a43';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#96b0a0';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = '#e2e4cb';
    ctx.textAlign = 'center';
    ctx.font = '600 46px "Microsoft YaHei", sans-serif';
    ctx.fillText('←  出口', w / 2, 63);
    ctx.font = '500 21px Arial';
    ctx.fillText('EXIT', w / 2 + 39, 89);
  });
  exit.redraw();
  return { name: name.texture, arrival, exit: exit.texture };
}

function addSky(scene) {
  const dome = new THREE.SphereGeometry(165, 40, 24);
  const positions = dome.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const horizon = new THREE.Color('#4b5966');
  const zenith = new THREE.Color('#1d314c');
  const color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const elevation = positions.getY(i) / 165;
    color.copy(horizon).lerp(zenith, THREE.MathUtils.smoothstep(elevation, -.02, .56));
    color.toArray(colors, i * 3);
  }
  dome.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesh(scene, dome, new THREE.MeshBasicMaterial({
    side: THREE.BackSide, vertexColors: true, fog: false,
  }), -38, 0, 0);
}

function addRailway(scene) {
  const ballast = surface('#4b4b48');
  const sleeper = surface('#493f3a');
  const rail = surface('#888e91', .39, .64);
  const ground = mesh(scene, new THREE.PlaneGeometry(275, 102), surface('#2f3f43'), -39, -.11, -20);
  ground.rotation.x = -Math.PI / 2;
  box(scene, ballast, 160, .085, 2.5, -43, -.042, TRACK_Z);
  box(scene, surface('#425054'), 83, .02, 1.0, -57, -.047, 2.88);
  repeated(scene, new THREE.BoxGeometry(.17, .082, 1.96), sleeper, 267, (part, i) => {
    part.position.set(-122 + i * .59, .006, TRACK_Z);
  });
  for (const offset of [-.54, .54]) {
    box(scene, rail, 160, .067, .061, -43, .073, TRACK_Z + offset);
    box(scene, ballast, 160, .031, .115, -43, .042, TRACK_Z + offset);
  }
  repeated(scene, new THREE.DodecahedronGeometry(.053, 0), surface('#62635e'), 740, (part, i) => {
    const jitter = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const cross = (Math.sin(i * 31.271) * 13546.862) % 1;
    part.position.set(-111 + i * .188 + jitter * .20, .012, TRACK_Z + cross * 1.22);
    part.scale.set(1 + Math.abs(cross), .38 + Math.abs(jitter) * .45, .68 + Math.abs(jitter));
    part.rotation.y = i * .53;
  });
  const fence = surface('#4b5a5c', .87, .08);
  repeated(scene, new THREE.BoxGeometry(.07, .54, .07), fence, 44, (part, i) => {
    part.position.set(-87 + i * 1.65, .24, 3.43);
  });
  box(scene, fence, 71, .028, .032, -51.5, .44, 3.43);
  box(scene, fence, 71, .026, .026, -51.5, .24, 3.43);

  const pine = surface('#20393b');
  const distantPine = surface('#263b45');
  const makePines = (material, count, z) => {
    repeated(scene, new THREE.ConeGeometry(1, 1, 10), material, count * 3, (part, i) => {
      const tree = Math.floor(i / 3);
      const tier = i % 3;
      const height = 2.2 + (Math.sin(tree * 1.8) + 1) * 2.0;
      const depth = z + Math.cos(tree * 2.45) * 3.6;
      part.position.set(-97 + tree * 2.75, height * (.30 + tier * .24), depth);
      const radius = height * (.23 - tier * .048);
      part.scale.set(radius, height * .55, radius);
      part.rotation.y = tree * .61;
    });
  };
  makePines(distantPine, 43, -18);
  makePines(pine, 39, -11);
  const mound = new THREE.SphereGeometry(1, 32, 18);
  for (const [x, h, z, w] of [[-72, 11, -30, 36], [-34, 8, -26, 25], [-9, 10, -33, 26], [19, 8, -30, 25]]) {
    mesh(scene, mound, distantPine, x, -2, z).scale.set(w, h, 11);
  }

  const steel = surface('#344349');
  const signalGlass = luminous('#ffad58');
  for (const x of [-62, -38, -21]) {
    box(scene, steel, .1, 1.83, .1, x, .91, -2.34);
    box(scene, steel, .25, .42, .18, x, 1.86, -2.34, .035);
    mesh(scene, new THREE.SphereGeometry(.061, 12, 8), signalGlass, x, 1.90, -2.23);
    box(scene, steel, .27, .13, .29, x, .065, -2.34);
  }
}

function addPlatform(scene, signs) {
  const concrete = surface('#87897f');
  const tile = surface('#a7a497');
  const edge = surface('#c6ab71');
  const steel = surface('#38515a', .57, .17);
  const timber = surface('#80634f');
  const brass = surface('#c8994d');
  const warm = luminous('#ffe0a2');
  const platform = PLATFORM_HEIGHT;
  box(scene, concrete, 28, platform, 5.6, 1.4, platform / 2 - .02, 3.10, .055);
  repeated(scene, new THREE.BoxGeometry(.963, .023, .716), tile, 28 * 7, (part, i) => {
    part.position.set(-12.12 + i % 28, platform - .017, .72 + Math.floor(i / 28) * .737);
  });
  box(scene, edge, 28, .025, .34, 1.4, platform - .015, .493);
  repeated(scene, new THREE.CylinderGeometry(.025, .027, .008, 8), brass, 186 * 3, (part, i) => {
    part.position.set(-12.42 + i % 186 * .15, platform + .001, .385 + Math.floor(i / 186) * .104);
  });
  repeated(scene, new THREE.BoxGeometry(.47, .012, .055), brass, 42, (part, i) => {
    part.position.set(-12.20 + i * .66, platform - .001, .795);
  });
  const utility = surface('#394449');
  for (const x of [-8.1, -3.8, 4.5, 8.8, 13.1]) {
    const y = 3.10;
    box(scene, steel, .115, y - platform, .12, x, (y + platform) / 2, 1.05, .012);
    box(scene, concrete, .24, .11, .23, x, platform + .05, 1.05, .012);
    box(scene, steel, .117, .095, .89, x, y, 1.46);
    box(scene, warm, .59, .029, .11, x, y - .062, 1.50, .011);
    if (x === -3.8 || x === 4.5) {
      const light = new THREE.PointLight('#ffcf8e', 8.2, 10, 2);
      light.position.set(x, 2.9, 1.65);
      scene.add(light);
    }
  }
  box(scene, utility, 21.7, .12, 2.18, 2.5, 3.24, 1.56, .025);
  box(scene, steel, 21.8, .17, .10, 2.5, 3.18, 2.61, .014);
  box(scene, edge, 21.7, .027, .026, 2.5, 3.105, 2.67);
  box(scene, steel, 2.45, .69, .11, -1.65, 2.65, 1.09, .022);
  sign(scene, signs.name, 2.33, .60, -1.65, 2.65, 1.151);
  box(scene, utility, 2.02, .40, .085, 2.88, 2.72, 1.08, .018);
  sign(scene, signs.arrival.texture, 1.90, .345, 2.88, 2.72, 1.126);
  for (const x of [-5.4, 4.25]) {
    box(scene, timber, 1.66, .075, .43, x, .80, 2.87, .033);
    box(scene, timber, 1.66, .19, .060, x, 1.10, 2.67, .018);
    for (const dx of [-.61, .61]) {
      box(scene, steel, .069, .45, .29, x + dx, .57, 2.87);
      box(scene, steel, .060, .37, .074, x + dx, .92, 2.66);
    }
  }
  box(scene, utility, .35, .61, .35, -6.62, .67, 3.00, .038);
  box(scene, steel, .065, 1.67, .071, -1.97, 1.20, 2.12, .012);
  box(scene, steel, .92, .28, .059, -1.97, 2.01, 2.12, .018);
  sign(scene, signs.exit, .86, .235, -1.97, 2.01, 2.153);

  const station = surface('#657571');
  const bricks = surface('#6e5244');
  box(scene, bricks, 9.2, 2.68, 1.90, 1.20, 1.27, -4.47, .055);
  box(scene, station, 9.62, .16, 2.34, 1.20, 2.68, -4.44, .039);
  for (const x of [-2, -.45, 1.11, 2.68, 4.24]) {
    box(scene, steel, 1.12, 1.21, .066, x, 1.43, -3.49, .028);
    box(scene, warm, 1.00, 1.11, .027, x, 1.43, -3.451, .018);
    box(scene, steel, .04, 1.14, .034, x, 1.43, -3.43);
    box(scene, steel, 1.01, .041, .035, x, 1.54, -3.43);
  }
}

function addTrain(scene) {
  const train = new THREE.Group();
  scene.add(train);
  const cream = surface('#d0d2c6', .48, .11);
  const jade = surface('#397a7b', .45, .16);
  const rubber = surface('#263940', .70, .18);
  const silver = surface('#9aa7a5', .51, .24);
  const warmGlass = luminous('#e5bd84');
  const inside = surface('#685949', .86);
  const frontGlass = luminous('#394e54');
  const headlight = luminous('#fff4cc').color.multiplyScalar(2.1);
  const litLens = new THREE.MeshBasicMaterial({ color: headlight });
  const gold = luminous('#f1bb62');
  const red = luminous('#c94f3b');
  const doors = [];

  const windows = graphic(128, 90, (ctx, w, h) => {
    const glass = ctx.createLinearGradient(0, 0, 0, h);
    glass.addColorStop(0, '#f4d6a3');
    glass.addColorStop(.20, '#d2ad76');
    glass.addColorStop(1, '#8f7961');
    ctx.fillStyle = glass;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#635d56';
    for (const x of [12, 77]) {
      ctx.beginPath();
      ctx.roundRect(x, 51, 33, 40, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#fff0c835';
    ctx.fillRect(0, 11, w, 6);
  });
  windows.redraw();
  const glassMaterial = new THREE.MeshBasicMaterial({ map: windows.texture });
  const windowPanel = new THREE.PlaneGeometry(.80, .63);

  function door(car, x, z) {
    box(car, rubber, 1.02, .07, .065, x, 2.055, z, .013);
    for (const side of [-1, 1]) box(car, rubber, .068, 1.59, .062, x + side * .481, 1.25, z, .013);
    const vestibule = new THREE.Group();
    vestibule.position.set(x, 0, .525);
    vestibule.visible = false;
    car.add(vestibule);
    box(vestibule, inside, .86, 1.55, .017, 0, 1.24, 0, .024);
    box(vestibule, frontGlass, .53, .83, .014, 0, 1.31, .012, .02);
    box(vestibule, warmGlass, .56, .070, .018, 0, 1.943, .014);
    box(vestibule, silver, .89, .045, .292, 0, .470, .138, .012);
    box(vestibule, gold, .80, .014, .021, 0, .495, .248);
    for (const side of [-1, 1]) box(vestibule, silver, .024, .89, .026, side * .36, 1.24, .019, .008);
    for (const side of [-1, 1]) {
      const leaf = new THREE.Group();
      leaf.position.set(x + side * .237, 1.23, z + .052);
      car.add(leaf);
      box(leaf, silver, .464, 1.62, .058, 0, 0, 0, .025);
      box(leaf, frontGlass, .238, .60, .012, 0, .31, .032, .027);
      box(leaf, jade, .463, .24, .011, 0, -.42, .033);
      doors.push({ leaf, side, restX: leaf.position.x, vestibule });
    }
  }

  function car(origin, lead) {
    const group = new THREE.Group();
    group.position.set(origin, 0, TRACK_Z);
    train.add(group);
    // Leave openings in the platform-side shell so travelers can cross the threshold.
    box(group, cream, 8.25, 2.04, 1.24, -4.13, 1.46, -.11, .19);
    box(group, jade, 8.10, .24, .044, -4.15, .815, -.724, .018);
    box(group, cream, 8.25, .39, .241, -4.13, 2.285, .610, .061);
    for (const [left, right] of [[-8.255, -6.88], [-5.84, FRONT_DOOR - .52], [FRONT_DOOR + .52, -.005]]) {
      const center = (left + right) / 2;
      box(group, cream, right - left, 1.76, .241, center, 1.32, .610, .038);
      box(group, jade, right - left - .017, .24, .041, center, .815, .717, .019);
    }
    box(group, rubber, 8.05, .15, 1.31, -4.18, .405, 0, .055);
    box(group, silver, 2.09, .115, .89, -4.23, 2.53, 0, .047);
    for (const x of [-1.79, -6.70]) {
      for (const side of [-1, 1]) {
        const wheel = mesh(group, new THREE.CylinderGeometry(.24, .24, .10, 22),
          rubber, x, .277, side * .55);
        wheel.rotation.x = Math.PI / 2;
      }
    }
    for (const side of [-1, 1]) {
      for (const x of [-.77, -3.0, -4.12, -5.23, -7.46]) {
        box(group, rubber, .92, .74, .037, x, 1.66, side * .726, .065);
        const window = mesh(group, windowPanel, glassMaterial, x, 1.66, side * .758);
        if (side === -1) window.rotation.y = Math.PI;
        box(group, rubber, .046, .65, .02, x + .20, 1.66, side * .766);
        box(group, silver, .86, .028, .020, x, 1.355, side * .766);
      }
      if (side === 1) {
        door(group, FRONT_DOOR, .725);
        door(group, -6.36, .725);
      } else {
        for (const x of [FRONT_DOOR, -6.36]) {
          box(group, silver, .96, 1.62, .044, x, 1.23, -.737, .032);
          box(group, frontGlass, .61, .62, .014, x, 1.54, -.763, .028);
        }
      }
    }
    if (lead) {
      box(group, jade, .12, 1.73, 1.22, .006, 1.36, 0, .053);
      box(group, rubber, .053, .84, 1.22, .083, 1.78, 0, .024);
      for (const z of [-.31, .31]) {
        box(group, frontGlass, .033, .62, .525, .116, 1.83, z, .015);
        box(group, litLens, .029, .12, .17, .104, 1.02, z * 1.48, .012);
      }
      box(group, gold, .03, .11, .44, .12, 2.204, 0, .013);
      box(group, rubber, .090, .133, .49, .077, .56, 0, .015);
    } else {
      for (const z of [-.43, .43]) box(group, red, .037, .095, .13, -8.26, .95, z, .012);
    }
    return group;
  }

  const locomotive = car(0, true);
  car(-8.42, false);
  const route = graphic(256, 80, (ctx, w, h) => {
    ctx.fillStyle = '#19343a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5d698';
    ctx.font = '700 45px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('01  雾港', w / 2, 55);
  });
  route.redraw();
  sign(locomotive, route.texture, .84, .23, -.78, 1.15, .778);

  const halo = graphic(96, 96, (ctx, w, h) => {
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    glow.addColorStop(0, '#ffe2aebb');
    glow.addColorStop(.20, '#ffcf8970');
    glow.addColorStop(1, '#ffcb6a00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  });
  halo.redraw();
  for (const z of [-.46, .46]) {
    const glare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: halo.texture, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glare.position.set(.136, 1.02, z);
    glare.scale.set(.66, .66, 1);
    locomotive.add(glare);
  }
  const beam = new THREE.SpotLight('#ffe2ac', 51, 26, .40, .77, 2);
  beam.position.set(.28, .95, 0);
  beam.target.position.set(16, .20, 0);
  locomotive.add(beam, beam.target);

  return {
    train,
    setDoors(amount) {
      for (const { leaf, side, restX, vestibule } of doors) {
        leaf.position.x = restX + side * amount * .41;
        vestibule.visible = amount > .002;
      }
    },
  };
}

export function createTwinStation() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#273c50');
  scene.fog = new THREE.FogExp2('#273c50', .012);
  addSky(scene);
  scene.add(new THREE.HemisphereLight('#a9c6e7', '#655c52', 1.51));
  const sky = new THREE.DirectionalLight('#a7cbff', 1.17);
  sky.position.set(5, 8, 13);
  scene.add(sky);
  const reflected = new THREE.DirectionalLight('#ffdda7', .52);
  reflected.position.set(-4, 4, -6);
  scene.add(reflected);

  const signs = stationSigns();
  addRailway(scene);
  addPlatform(scene, signs);
  const arrival = addTrain(scene);
  const passengers = addStationPassengers(scene, STOP_X + FRONT_DOOR, TRACK_Z + .646, PLATFORM_HEIGHT);
  const overview = new THREE.PerspectiveCamera(42, 16 / 9, .10, 235);
  overview.position.set(11, 9.2, 22);
  overview.lookAt(-19, 1, -.7);
  const platformCamera = new THREE.PerspectiveCamera(45, 16 / 9, .10, 240);
  const windowCenter = new THREE.Vector3(1.70, 2.16, 2.6);
  const windowWidth = 7.6;
  const platformView = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, .35)
    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-.13, 0, 0)));
  platformCamera.quaternion.copy(platformView);
  let startedAt = null;
  let lastTime = null;
  let lastSign;

  return {
    scene,
    overview,
    detailCamera: platformCamera,
    replay() {
      startedAt = null;
      lastTime = null;
    },
    update(time) {
      startedAt ??= time;
      const seconds = Math.min(END_TIME, (time - startedAt) / 1000);
      if (seconds === lastTime) return false;
      lastTime = seconds;
      const brakeTime = Math.max(0, seconds - CRUISE);
      const braking = Math.min(BRAKE, brakeTime);
      const sinceDeparture = Math.max(0, seconds - DEPART_TIME);
      const accelerationTime = Math.min(sinceDeparture, 4);
      const distanceOut = SPEED * (accelerationTime * accelerationTime / 8 + sinceDeparture - accelerationTime);
      arrival.train.position.x = START_X + SPEED * (Math.min(seconds, CRUISE) +
        braking - braking * braking / (2 * BRAKE)) + distanceOut;
      const doors = THREE.MathUtils.smoothstep(seconds, STOP_TIME + .54, DOORS_OPEN_TIME) *
        (1 - THREE.MathUtils.smoothstep(seconds, DOORS_CLOSE_TIME, DOORS_CLOSE_TIME + 1));
      arrival.setDoors(doors);
      passengers(seconds - DOORS_OPEN_TIME);
      let label = '01   请在黄线内候车';
      if (seconds >= DEPART_TIME + 5.1) label = '01   列车已离站';
      else if (seconds >= DOORS_CLOSE_TIME) label = '01   列车即将发车';
      else if (doors > .55) label = '01   已到站';
      else if (seconds >= CRUISE - .6) label = '01   列车进站';
      if (label !== lastSign) {
        lastSign = label;
        signs.arrival.redraw(label);
      }
      return true;
    },
    aimDetail(eye) {
      platformCamera.position.copy(eye).multiplyScalar(windowWidth).applyQuaternion(platformView).add(windowCenter);
      setScreenProjection(platformCamera, eye.x, eye.y, eye.z, .5, 9 / 32);
    },
  };
}
