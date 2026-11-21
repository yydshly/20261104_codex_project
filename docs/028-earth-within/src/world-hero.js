import * as THREE from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';
import { createClothingWetness, createClothingDrips } from './world-wetness.js';

const TAU = Math.PI * 2;
const THIGH = .42;
const SHIN = .43;
const ANKLE = .114;
const LEG_REACH = THIGH + SHIN - .003;
const REST_HIP = ANKLE + LEG_REACH;
const HALF_STANCE = .116;
const HEEL = -.088;
const TOE = .15;

const colors = {
  jacket: 0xc57a32,
  shoulder: 0xe39b4a,
  seams: 0xa0522d,
  lining: 0xe7c78b,
  zipper: 0x454039,
  scarf: 0x3a7772,
  pants: 0x3c535d,
  patch: 0x536d76,
  leather: 0x4b382e,
  sole: 0x292f2e,
  skin: 0xce9973,
  skinLight: 0xe4ad83,
  hair: 0x3a302b,
  hairLight: 0x53392c,
  eye: 0x233b3a,
  mouth: 0x945943,
  pack: 0x2f716d,
  packDark: 0x225452,
  packLight: 0x52938a,
  badge: 0xebd8a5,
  mask: 0x264f5b,
  lens: 0x84bcb5,
  fin: 0x285c5e,
};

const shapes = {
  box: new THREE.BoxGeometry(1, 1, 1),
  orb: new THREE.SphereGeometry(1, 10, 6),
  barrel: new THREE.CylinderGeometry(1, 1, 1, 8),
};

function profile(rings, sides = 8) {
  const points = [];
  const indices = [];
  rings.forEach(([height, radiusX, radiusZ, z = 0], row) => {
    for (let i = 0; i < sides; i++) {
      const angle = (i + .5) * TAU / sides;
      points.push(Math.sin(angle) * radiusX, height, z + Math.cos(angle) * radiusZ);
      if (!row) continue;
      const a = (row - 1) * sides + i;
      const b = (row - 1) * sides + (i + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  });
  for (let i = 1; i < sides - 1; i++) {
    const end = (rings.length - 1) * sides;
    indices.push(0, i + 1, i, end, end + i, end + i + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices);
  return geometry;
}

// Bake each rigid segment once, keeping the moving joints independent.
function part(parent, material, pieces) {
  const positions = [];
  const tints = [];
  const point = new THREE.Vector3();
  const tint = new THREE.Color();
  const orientation = new THREE.Quaternion();
  const matrix = new THREE.Matrix4();
  const euler = new THREE.Euler();
  const shift = new THREE.Vector3();
  const stretch = new THREE.Vector3();
  for (const [shape, color, scale, at, angles = [0, 0, 0]] of pieces) {
    const geometry = typeof shape === 'string' ? shapes[shape] : shape;
    orientation.setFromEuler(euler.set(...angles));
    matrix.compose(shift.set(...at), orientation, stretch.set(...scale));
    tint.setHex(colors[color]);
    const { position } = geometry.attributes;
    const index = geometry.index;
    const count = index?.count ?? position.count;
    for (let i = 0; i < count; i++) {
      const vertex = index ? index.getX(i) : i;
      point.fromBufferAttribute(position, vertex).applyMatrix4(matrix);
      positions.push(point.x, point.y, point.z);
      tints.push(tint.r, tint.g, tint.b);
    }
    if (typeof shape !== 'string') geometry.dispose();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(tints, 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  parent.add(mesh);
  return mesh;
}

function joint(parent, x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function makeCoat(torso, material) {
  const coat = profile([[-.07, .21, .133], [.04, .234, .152], [.3, .238, .159],
    [.47, .275, .163], [.54, .238, .139], [.593, .101, .104]]);
  const rucksack = profile([[.055, .159, .078], [.125, .227, .114], [.398, .218, .112],
    [.478, .174, .093], [.503, .099, .074]]);
  part(torso, material, [
    [coat, 'jacket', [1, 1, 1], [0, 0, 0]],
    ['barrel', 'seams', [.214, .057, .135], [0, -.054, 0]],
    ['orb', 'lining', [.121, .069, .112], [0, .574, -.036]],
    ['barrel', 'scarf', [.099, .093, .105], [0, .617, 0]],
    ['box', 'zipper', [.016, .49, .02], [0, .253, .149]],
    ['box', 'lining', [.024, .047, .025], [0, .475, .166]],
    ['box', 'seams', [.086, .105, .017], [-.132, .11, .138], [0, -.16, -.11]],
    ['box', 'seams', [.086, .105, .017], [.132, .11, .138], [0, .16, .11]],
    ['box', 'lining', [.075, .019, .019], [-.132, .151, .149], [0, -.16, -.11]],
    ['box', 'lining', [.075, .019, .019], [.132, .151, .149], [0, .16, .11]],
    ['box', 'badge', [.043, .038, .014], [-.119, .411, .15], [0, -.15, -.09]],
    [rucksack, 'pack', [1, 1, 1], [0, 0, -.217]],
    ['orb', 'packDark', [.183, .127, .064], [0, .231, -.303]],
    ['box', 'packLight', [.264, .026, .017], [0, .293, -.348]],
    ['box', 'zipper', [.032, .36, .032], [-.122, .264, -.315], [0, -.11, -.05]],
    ['box', 'zipper', [.032, .36, .032], [.122, .264, -.315], [0, .11, .05]],
    ['box', 'badge', [.041, .039, .021], [-.122, .335, -.331]],
    ['box', 'badge', [.041, .039, .021], [.122, .335, -.331]],
    ['box', 'badge', [.058, .058, .016], [0, .204, -.367], [0, 0, Math.PI / 4]],
    ['box', 'packDark', [.025, .025, .013], [0, .204, -.376], [0, 0, Math.PI / 4]],
    ['barrel', 'scarf', [.066, .369, .066], [0, .501, -.234], [0, 0, Math.PI / 2]],
    ['barrel', 'packDark', [.07, .034, .07], [-.117, .501, -.234], [0, 0, Math.PI / 2]],
    ['barrel', 'packDark', [.07, .034, .07], [.117, .501, -.234], [0, 0, Math.PI / 2]],
    ['box', 'packDark', [.04, .418, .024], [-.172, .344, .116], [0, -.24, -.145]],
    ['box', 'packDark', [.04, .418, .024], [.172, .344, .116], [0, .24, .145]],
  ]);
}

function makeHead(parent, material) {
  const head = joint(parent, 0, .642, .013);
  const cheeks = profile([[.027, .063, .065, .012], [.058, .106, .096, .008],
    [.119, .128, .105], [.211, .122, .11, -.01], [.255, .092, .09, -.011], [.276, .052, .051, -.016]], 10);
  const sweptHair = profile([[.199, .127, .118, -.017], [.252, .128, .117, -.021],
    [.295, .094, .103, -.023], [.318, .048, .058, -.015]], 10);
  part(head, material, [
    ['barrel', 'skin', [.062, .071, .063], [0, .002, 0]],
    [cheeks, 'skin', [1, 1, 1], [0, 0, 0]],
    [sweptHair, 'hair', [1, 1, 1], [0, 0, 0]],
    ['orb', 'hair', [.121, .108, .088], [0, .166, -.047]],
    ['orb', 'hairLight', [.086, .05, .049], [-.041, .237, .074], [0, -.16, -.48]],
    ['orb', 'hair', [.046, .057, .04], [-.091, .195, .059], [0, -.11, -.21]],
    ['orb', 'skin', [.035, .041, .022], [-.126, .132, -.001]],
    ['orb', 'skin', [.035, .041, .022], [.126, .132, -.001]],
    ['orb', 'skinLight', [.022, .029, .025], [0, .13, .103]],
    ['box', 'eye', [.024, .019, .012], [-.044, .157, .105], [0, -.17, -.06]],
    ['box', 'eye', [.024, .019, .012], [.044, .157, .105], [0, .17, .06]],
    ['box', 'hairLight', [.028, .009, .014], [-.048, .183, .103], [0, -.17, -.10]],
    ['box', 'hairLight', [.028, .009, .014], [.048, .183, .103], [0, .17, .10]],
    ['box', 'mouth', [.034, .008, .01], [0, .086, .102]],
  ]);

  const swimGear = joint(head, 0, 0, 0);
  part(swimGear, material, [
    ['orb', 'mask', [.111, .057, .05], [0, .153, .101]],
    ['box', 'lens', [.069, .049, .025], [-.048, .156, .137], [0, -.18, 0]],
    ['box', 'lens', [.069, .049, .025], [.048, .156, .137], [0, .18, 0]],
    ['box', 'badge', [.016, .029, .007], [-.059, .168, .151], [0, -.18, -.30]],
    ['box', 'mask', [.014, .033, .154], [-.113, .155, .027]],
    ['box', 'mask', [.014, .033, .154], [.113, .155, .027]],
    ['barrel', 'mask', [.021, .233, .021], [-.138, .207, .022], [-.13, 0, .08]],
    ['barrel', 'shoulder', [.022, .032, .022], [-.147, .329, .006], [-.13, 0, .08]],
    ['box', 'mask', [.133, .022, .029], [-.069, .087, .105], [0, -.08, .07]],
  ]);
  swimGear.visible = false;
  return { head, swimGear };
}

function makeArm(torso, material, side, skinMaterial = material) {
  const shoulder = joint(torso, side * .238, .482, .004);
  const elbow = joint(shoulder, 0, -.267, 0);
  part(shoulder, material, [
    ['orb', 'shoulder', [.105, .119, .104], [side * .014, -.018, 0]],
    ['orb', 'jacket', [.088, .166, .087], [side * .017, -.124, 0]],
  ]);
  part(elbow, material, [
    ['orb', 'jacket', [.073, .133, .075], [side * .01, -.081, .005]],
    ['barrel', 'seams', [.065, .048, .069], [side * .01, -.179, .012]],
  ]);
  part(elbow, skinMaterial, [
    ['orb', 'skin', [.054, .067, .053], [side * .009, -.225, .014]],
    ['orb', 'skinLight', [.029, .04, .031], [-side * .025, -.215, .04]],
  ]);
  return { shoulder, elbow, side };
}

function makeLeg(pelvis, material, side, bootMaterial = material) {
  const hip = joint(pelvis, side * HALF_STANCE, 0, 0);
  const knee = joint(hip, 0, -THIGH, 0);
  const ankle = joint(knee, 0, -SHIN, 0);
  part(hip, material, [
    ['orb', 'pants', [.112, .251, .115], [0, -.159, 0]],
    ['orb', 'patch', [.067, .09, .038], [side * .053, -.283, .083]],
  ]);
  part(knee, material, [
    ['orb', 'pants', [.078, .241, .082], [0, -.183, 0]],
    ['orb', 'patch', [.071, .086, .059], [0, -.012, .032]],
    ['barrel', 'leather', [.086, .081, .093], [0, -.384, .007]],
  ]);
  const boot = profile([[-.098, .078, .128, .034], [-.063, .084, .13, .037],
    [.002, .076, .111, .02], [.055, .059, .073, -.012]]);
  part(ankle, bootMaterial, [
    [boot, 'leather', [1, 1, 1], [0, 0, 0]],
    ['box', 'sole', [.151, .027, .239], [0, -.1, .031]],
    ['box', 'lining', [.063, .012, .016], [0, .002, .078], [-.27, 0, 0]],
    ['box', 'lining', [.063, .012, .016], [0, .013, .061], [-.27, 0, 0]],
  ]);
  const outline = new THREE.Shape();
  outline.moveTo(-.066, .064);
  outline.lineTo(-.104, .355);
  outline.lineTo(-.059, .403);
  outline.lineTo(.056, .399);
  outline.lineTo(.106, .342);
  outline.lineTo(.068, .064);
  outline.closePath();
  const blade = new THREE.ExtrudeGeometry(outline, { depth: .021, bevelEnabled: false });
  const fin = part(ankle, material, [
    [blade, 'fin', [1, 1, 1], [0, -.079, 0], [Math.PI / 2, 0, 0]],
    ['box', 'packLight', [.014, .025, .19], [-.069, -.08, .237], [0, -.085, 0]],
    ['box', 'packLight', [.014, .025, .19], [.069, -.08, .237], [0, .085, 0]],
    ['box', 'shoulder', [.119, .015, .022], [0, -.068, .352]],
  ]);
  fin.visible = false;
  return { hip, knee, ankle, fin };
}

function addShadow(parent) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { strength: { value: .36 } },
    vertexShader: `varying vec2 patchUV;
      void main() {
        patchUV = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `varying vec2 patchUV;
      uniform float strength;
      void main() {
        float edge = length((patchUV - .5) * 2.0);
        float alpha = 1.0 - smoothstep(.12, 1.0, edge);
        gl_FragColor = vec4(.035, .058, .052, alpha * strength);
        #include <colorspace_fragment>
      }`,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.94, .74), material);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(.04, .021, -.053);
  parent.add(shadow);
  return shadow;
}

function gaitFoot(cycle, stride, contact, lift, sticky = 0) {
  if (cycle < contact) {
    const t = cycle / contact;
    const heelStrike = -.21 * (1 - THREE.MathUtils.smoothstep(t, 0, .24));
    const toeOff = .30 * THREE.MathUtils.smoothstep(t, .68, 1);
    return [THREE.MathUtils.lerp(stride, -stride, t), 0, heelStrike + toeOff, 1];
  }
  const t = ((cycle - contact) / (1 - contact)) ** (1 + sticky * .38);
  const swing = THREE.MathUtils.smoothstep(t, 0, 1);
  const support = 1 - THREE.MathUtils.smoothstep(t, 0, .22) + THREE.MathUtils.smoothstep(t, .79, 1);
  return [THREE.MathUtils.lerp(-stride, stride, swing), Math.sin(Math.PI * t) * lift, THREE.MathUtils.lerp(.30, -.21, swing), support];
}

function floorNear(position, sinYaw, cosYaw, across, along) {
  return groundSurfaceHeight(position.x + along * sinYaw + across * cosYaw,
    position.z + along * cosYaw - across * sinYaw);
}

function fitBoot(position, floor, sinYaw, cosYaw, across, [along, lift, rocker, support], walkAmount) {
  const sample = (offset) => floorNear(position, sinYaw, cosYaw, across, along + offset);
  const slope = Math.atan2(sample(TOE) - sample(HEEL), TOE - HEEL);
  const pitch = -THREE.MathUtils.clamp(slope, -.62, .62) + rocker * walkAmount;
  const sinPitch = Math.sin(pitch);
  const cosPitch = Math.cos(pitch);
  const heel = sample(HEEL * cosPitch - ANKLE * sinPitch) + HEEL * sinPitch;
  const toe = sample(TOE * cosPitch - ANKLE * sinPitch) + TOE * sinPitch;
  const y = Math.max(heel, toe) + ANKLE * cosPitch - floor + lift;
  const reachableHip = y + Math.sqrt(LEG_REACH ** 2 - along ** 2) + (1 - support) * walkAmount * .25;
  return { y, along, pitch, reachableHip };
}

function aimLeg(leg, dy, dz, soleAngle, hipRoll) {
  const limit = THREE.MathUtils.clamp(Math.hypot(dy, dz), .11, LEG_REACH);
  const reachAngle = Math.acos(THREE.MathUtils.clamp((THIGH ** 2 + limit ** 2 - SHIN ** 2) / (2 * THIGH * limit), -1, 1));
  const bend = Math.PI - Math.acos(THREE.MathUtils.clamp((THIGH ** 2 + SHIN ** 2 - limit ** 2) / (2 * THIGH * SHIN), -1, 1));
  const upper = Math.atan2(-dz, -dy) - reachAngle;
  leg.hip.rotation.set(upper, 0, -hipRoll, 'ZXY');
  leg.knee.rotation.x = bend;
  leg.ankle.rotation.x = soleAngle - upper - bend;
}

// Entry, catch, push and recovery for one arm. The other arm is half a stroke behind.
const crawlStroke = [
  [0, -2.98, .12, -.16],
  [.18, -2.16, .19, -1.08],
  [.36, -1.02, .13, -.74],
  [.54, -.12, .15, -.18],
  [.73, 1.62, .36, -1.18],
  [.89, 2.67, .22, -.73],
  [1, TAU - 2.98, .12, -.16],
];

function strokeAt(cycle) {
  const end = crawlStroke.findIndex(([time]) => cycle < time);
  const a = crawlStroke[end - 1];
  const b = crawlStroke[end];
  const t = THREE.MathUtils.smoothstep(cycle, a[0], b[0]);
  return [THREE.MathUtils.lerp(a[1], b[1], t), THREE.MathUtils.lerp(a[2], b[2], t), THREE.MathUtils.lerp(a[3], b[3], t)];
}

const bodyClearance = [[-1.24, .16], [-.76, .18], [0, .22], [.47, .20], [.87, .17]];

function swimHeight(position, yaw, tilt, neutralHeight) {
  const axisX = Math.sin(yaw) * Math.sin(tilt);
  const axisZ = Math.cos(yaw) * Math.sin(tilt);
  const rise = Math.cos(tilt);
  let base = neutralHeight;
  for (const [alongBody, clearance] of bodyClearance) {
    const floor = groundSurfaceHeight(position.x + alongBody * axisX, position.z + alongBody * axisZ);
    base = Math.max(base, floor - position.y - alongBody * rise + clearance);
  }
  return Math.min(base, neutralHeight + .63);
}

export function createHero(scene) {
  const group = new THREE.Group();
  group.name = '流域探险者';
  group.visible = false;
  scene.add(group);

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .86 });
  const cloth = () => new THREE.MeshPhysicalMaterial({ vertexColors: true, flatShading: true,
    roughness: .86, clearcoat: .001, clearcoatRoughness: .18 });
  const coatMaterial = cloth(), pantsMaterial = cloth(), bootMaterial = cloth();
  const clothing = createClothingWetness();
  const drips = createClothingDrips(scene);
  const shadow = addShadow(group);
  const pelvis = joint(group, 0, REST_HIP, 0);
  const torso = joint(pelvis, 0, .019, 0);
  makeCoat(torso, coatMaterial);
  const { head, swimGear } = makeHead(torso, material);
  const sides = [-1, 1];
  const arms = sides.map((side) => makeArm(torso, coatMaterial, side, material));
  const legs = sides.map((side) => makeLeg(pelvis, pantsMaterial, side, bootMaterial));
  const limbAngles = new THREE.Euler();
  const surfaceArm = new THREE.Quaternion();
  const alternateArm = new THREE.Quaternion();
  let phase = 0;
  let stroke = 0;
  let kick = 0;
  let pace = 0;
  let gaitSpeed = 0;
  let pointing = 0;
  let swimBlend = 0;
  let diveBlend = 0;
  let airBlend = 0;
  let trim = 0;
  let bodyY = 0;
  let initialized = false;
  const footContacts = [];
  const waterEvents = [], hands = [new THREE.Vector3(), new THREE.Vector3()];
  const previousHands = [new THREE.Vector3(), new THREE.Vector3()];
  let handsReady = false, previousPlay = -1, leapBlend = 0;
  const contactPosition = new THREE.Vector3();
  const soleCenter = new THREE.Vector3();
  const soleForward = new THREE.Vector3();
  const previousCycles = [0, 0];
  const pendingLanding = [false, false];
  let contactReady = false;
  let contactAirborne = false;
  let lastVerticalSpeed = 0;
  let landingCompression = 0;
  let landingEnergy = 0;
  const motion = { wade: 0, mud: 0, lift: 0, cadence: 0, stance: 0, landingCompression: 0, impact: 0, hipHeight: REST_HIP };

  function resetFootContacts() {
    footContacts.length = 0;
    contactReady = false;
    contactAirborne = false;
    pendingLanding.fill(false);
    lastVerticalSpeed = 0;
    landingCompression = landingEnergy = 0;
  }

  function update(dt, time, {
    position, yaw, speed = 0, swimming = false, underwater = false, visible = true, pitch = 0, gesture = 0,
    crouch = 0, airborne = false, contactsEnabled = false,
    waterDepth = 0, mud = 0, rain = 0, exposure = 1, leaping = false, waterPlay = -1,
  }) {
    group.visible = visible;
    // First-person exploration uses the same feet and gait clock as the visible avatar.
    group.position.copy(position);
    group.rotation.y = yaw;
    const wet = clothing.update(dt, { swimming, underwater, waterDepth, rain, exposure, speed });
    for (const [cloth, amount] of [[coatMaterial, wet.upper], [pantsMaterial, wet.lower], [bootMaterial, wet.boots]]) {
      cloth.color.setScalar(1 - amount * .62);
      cloth.roughness = .86 - amount * .60;
      cloth.clearcoat = .001 + amount * .75;
    }
    drips.update(dt, position, yaw, wet, swimming || underwater, visible, speed);

    const effort = THREE.MathUtils.smoothstep(speed, .08, 1.8);
    const step = Math.min(dt, .1);
    const continuing = initialized;
    const change = continuing ? step : 1;
    const travelled = contactReady ? Math.hypot(position.x - contactPosition.x, position.z - contactPosition.z) : 0;
    const verticalTravel = contactReady ? position.y - contactPosition.y : 0;
    const teleported = contactReady && (travelled > Math.max(.75, step * 10)
      || Math.abs(verticalTravel) > Math.max(.85, step * 18));
    const playing = waterPlay >= 0 ? Math.sin(Math.PI * waterPlay) : 0;
    leapBlend = THREE.MathUtils.damp(leapBlend, leaping ? 1 : 0, 12, change);
    const landed = contactsEnabled && contactReady && !teleported && contactAirborne && !airborne && !swimming;
    if (landed) {
      landingEnergy = THREE.MathUtils.clamp((Math.abs(lastVerticalSpeed) - .7) / 4, .12, 1);
      landingCompression = landingEnergy;
      pendingLanding.fill(true);
    } else landingCompression = THREE.MathUtils.damp(landingCompression, 0, 10, step);
    if (airborne || swimming || teleported) landingCompression = 0;
    pace = THREE.MathUtils.damp(pace, effort, 10, change);
    gaitSpeed = THREE.MathUtils.damp(gaitSpeed, speed, 12, change);
    swimBlend = THREE.MathUtils.damp(swimBlend, Number(swimming), 12, change);
    diveBlend = THREE.MathUtils.damp(diveBlend, Number(underwater), 9, change);
    airBlend = THREE.MathUtils.damp(airBlend, Number(airborne), 20, change);
    pointing = THREE.MathUtils.damp(pointing, gesture, 8, change);
    initialized = true;
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const grade = Math.abs(floorNear(position, sinYaw, cosYaw, 0, .33) - floorNear(position, sinYaw, cosYaw, 0, -.33)) / .66;
    const steep = THREE.MathUtils.smoothstep(grade, .17, .71);
    const shorterStep = 1 + .57 * steep;
    const run = THREE.MathUtils.smoothstep(gaitSpeed, 2.8, 4.8) * (1 - crouch);
    const wade = swimming ? 0 : THREE.MathUtils.smoothstep(waterDepth, .04, .8);
    const sticky = swimming || waterDepth > .12 ? 0 : THREE.MathUtils.clamp(mud, 0, 1);
    const cadence = THREE.MathUtils.lerp(.86 + .25 * gaitSpeed, Math.min(2.9, 1.17 + .24 * gaitSpeed), run)
      * shorterStep * (1 - .23 * wade - .16 * sticky);
    const contact = THREE.MathUtils.lerp(.60 - .068 * steep, .35, run) + .08 * sticky + .035 * wade;
    // Match the backward movement of a planted foot to the actor's forward speed.
    const stride = Math.min(.45, gaitSpeed * contact / (2 * cadence));
    const walkAmount = THREE.MathUtils.smoothstep(gaitSpeed, .06, .76) * (1 - airBlend);
    const lift = (THREE.MathUtils.lerp(.095, .18, run) + .13 * wade + .075 * sticky) * walkAmount;
    phase = (phase + step * cadence * TAU) % TAU;
    stroke = (stroke + step * (.51 + .39 * pace)) % 1;
    kick = (kick + step * (1.05 + .95 * pace) * TAU) % TAU;
    const breathe = Math.sin(time * 2.4);
    const floor = groundSurfaceHeight(position.x, position.z);
    const tracks = sides.map((_, i) => {
      const cycle = (phase / TAU + i * .5) % 1;
      return !airborne && (landingCompression > .04 || pendingLanding.some(Boolean)) ? [0, 0, 0, 1]
        : gaitFoot(cycle, stride, contact, lift, sticky);
    });
    const cycles = sides.map((_, i) => (phase / TAU + i * .5) % 1);
    const rightFloor = floorNear(position, sinYaw, cosYaw, HALF_STANCE, tracks[1][0]);
    const leftFloor = floorNear(position, sinYaw, cosYaw, -HALF_STANCE, tracks[0][0]);
    const pelvisRoll = THREE.MathUtils.clamp(Math.atan2(rightFloor - leftFloor, 2 * HALF_STANCE), -.29, .29) * (1 - swimBlend);
    const hipSideY = Math.sin(pelvisRoll) * HALF_STANCE;
    const footWidth = Math.cos(pelvisRoll) * HALF_STANCE;
    const raised = position.y - floor > .11;
    const feet = sides.map((side, i) => raised
      ? { y: ANKLE + tracks[i][1], along: tracks[i][0], pitch: 0, reachableHip: REST_HIP }
      : fitBoot(position, floor, sinYaw, cosYaw, side * footWidth, tracks[i], walkAmount));
    const hipHeight = Math.min(REST_HIP + steep * .075 - run * .012 - crouch * .51 - landingCompression * .13,
      feet[0].reachableHip + hipSideY, feet[1].reachableHip - hipSideY);
    Object.assign(motion, { wade, mud: sticky, lift, cadence, stance: contact, hipHeight,
      landingCompression, impact: landed ? landingEnergy : 0 });
    const surfaceTrim = .23 - .11 * pace;
    const diveTrim = THREE.MathUtils.clamp(pitch, -.42, .42) * (.12 + .66 * pace);
    trim = THREE.MathUtils.damp(trim, THREE.MathUtils.lerp(surfaceTrim, diveTrim, diveBlend), 6, change);
    const swimTilt = Math.PI / 2 - trim;
    const swimmerY = swimBlend > .001 ? swimHeight(position, yaw, swimTilt, .025 * breathe - .08 * (1 - diveBlend)) : 0;
    const roll = Math.sin(stroke * TAU) * pace * THREE.MathUtils.lerp(.12, .035, diveBlend);
    // The anchor changes from the soles to the torso on entry. Blend the world height across that change.
    const playHeight = Math.max(-.52, groundSurfaceHeight(position.x, position.z) - position.y + .80);
    const desiredBodyY = position.y + (swimming
      ? THREE.MathUtils.lerp(swimmerY, playHeight, underwater ? 0 : playing)
      : hipHeight - playing * .07);
    const changingMedium = swimming ? swimBlend < .98 : swimBlend > .02;
    bodyY = continuing && changingMedium ? THREE.MathUtils.damp(bodyY, desiredBodyY, 15, step) : desiredBodyY;
    pelvis.position.y = bodyY - position.y;
    pelvis.rotation.x = swimTilt * swimBlend * (1 - (underwater ? 0 : playing * .85)) + leapBlend * .22;
    pelvis.rotation.y = roll * swimBlend * .28;
    pelvis.rotation.z = pelvisRoll;
    torso.rotation.x = ((.023 + run * .14 + sticky * .055) * walkAmount + crouch * .38 + airBlend * .14
      + landingCompression * .12) * (1 - swimBlend);
    torso.rotation.y = THREE.MathUtils.lerp(Math.cos(phase) * .084 * walkAmount, roll, swimBlend);
    torso.rotation.z = -pelvisRoll + .008 * breathe + (.015 * Math.sin(phase) * walkAmount - .045 * pointing) * (1 - swimBlend);
    const headTrim = THREE.MathUtils.lerp(-1.04, -.69 + trim * .3, diveBlend);
    head.rotation.x = THREE.MathUtils.lerp(.018 * breathe, headTrim * (1 - (underwater ? 0 : playing)), swimBlend);
    head.rotation.y = (.12 * Math.sin(time * 1.15) * (1 - pace) + .16 * pointing) * (1 - swimBlend * .65);
    head.rotation.z = -roll * swimBlend * .76;
    swimGear.visible = swimming || underwater;
    shadow.visible = !swimming;
    shadow.position.y = .021 - (airborne ? Math.max(0, position.y - floor) : 0);

    for (let i = 0; i < 2; i++) {
      const offset = i * Math.PI;
      const arm = arms[i];
      const leg = legs[i];
      const counterSwing = Math.cos(phase + offset) * walkAmount;
      const point = i === 1 ? pointing * (1 - walkAmount) : 0;
      const idleSwing = .029 * breathe * arm.side;
      arm.shoulder.rotation.set(idleSwing + (.33 + run * .27) * counterSwing - .57 * point - .34 * airBlend - .21 * crouch,
        0, arm.side * (.13 + .15 * point + .27 * airBlend + wade * .13 + landingCompression * .16));
      let elbow = -.10 - .19 * Math.max(0, -counterSwing) - .43 * run - .82 * point - .52 * airBlend - .24 * crouch;

      if (swimBlend > .001) {
        const scull = Math.sin(time * 2.1 + offset);
        const [reach, spread, pull] = strokeAt((stroke + i * .5) % 1);
        surfaceArm.setFromEuler(limbAngles.set(-.39 + .13 * scull, 0, arm.side * (.51 + .12 * scull)));
        alternateArm.setFromEuler(limbAngles.set(reach, 0, arm.side * spread));
        surfaceArm.slerp(alternateArm, pace);
        // Fin-propelled glide. Keep the arms close to the torso and make small steering sweeps at low speed.
        const sweep = scull * (1 - .72 * pace);
        alternateArm.setFromEuler(limbAngles.set(-.12 + sweep * .09, 0, arm.side * (.15 + sweep * .11)));
        surfaceArm.slerp(alternateArm, diveBlend);
        arm.shoulder.quaternion.slerp(surfaceArm, swimBlend);
        const surfaceElbow = THREE.MathUtils.lerp(-.49 - .11 * scull, pull, pace);
        elbow = THREE.MathUtils.lerp(elbow, THREE.MathUtils.lerp(surfaceElbow, -.25 - sweep * .16, diveBlend), swimBlend);
      }
      arm.elbow.rotation.x = elbow;
      if (playing > 0 && swimming) {
        const sweep = THREE.MathUtils.smoothstep(waterPlay, .08, .48);
        arm.shoulder.rotation.set(THREE.MathUtils.lerp(-2.18, -.86, sweep), 0,
          arm.side * (.45 + playing * .65));
        arm.elbow.rotation.x = -.24 - playing * .28;
      } else if (leapBlend > .001) {
        arm.shoulder.rotation.x = THREE.MathUtils.lerp(arm.shoulder.rotation.x, -2.8, leapBlend);
        arm.shoulder.rotation.z = THREE.MathUtils.lerp(arm.shoulder.rotation.z, arm.side * .22, leapBlend);
        arm.elbow.rotation.x = THREE.MathUtils.lerp(arm.elbow.rotation.x, -.3, leapBlend);
      }

      const foot = feet[i];
      aimLeg(leg, foot.y - hipHeight - arm.side * hipSideY + airBlend * (i ? .12 : .23),
        THREE.MathUtils.lerp(foot.along, i ? -.18 : .25, airBlend), foot.pitch, pelvisRoll);
      const lead = Math.sin(kick + offset);
      const lag = Math.sin(kick + offset - .76);
      leg.hip.rotation.x = THREE.MathUtils.lerp(leg.hip.rotation.x, .012 + lead * (.036 + .104 * pace), swimBlend);
      leg.knee.rotation.x = THREE.MathUtils.lerp(leg.knee.rotation.x, .055 + Math.max(0, -lag) * (.033 + .111 * pace), swimBlend);
      leg.ankle.rotation.x = THREE.MathUtils.lerp(leg.ankle.rotation.x, 1.28 + .12 * lag * (.25 + .75 * pace), swimBlend);
      if (playing > 0) {
        if (swimming && !underwater) {
          leg.hip.rotation.x = THREE.MathUtils.lerp(leg.hip.rotation.x, -.14, playing);
          leg.knee.rotation.x = THREE.MathUtils.lerp(leg.knee.rotation.x, .48, playing);
          leg.ankle.rotation.x = THREE.MathUtils.lerp(leg.ankle.rotation.x, .1, playing);
        } else if (!swimming && i === 1) {
          leg.hip.rotation.x -= playing * .75;
          leg.knee.rotation.x += playing * .25;
        }
      }
      leg.fin.visible = swimBlend > .35;
    }

    const playHit = waterPlay >= .38 && previousPlay < .38;
    for (let i = 0; i < 2; i++) {
      const hand = hands[i];
      arms[i].elbow.updateWorldMatrix(true, false);
      hand.set(0, -.225, .014).applyMatrix4(arms[i].elbow.matrixWorld);
      const floorAtHand = groundSurfaceHeight(hand.x, hand.z);
      const surface = waterSurfaceAt(hand.x, hand.z, floorAtHand);
      const strokeHit = swimming && !underwater && speed > .25 && waterPlay < 0 && handsReady
        && surface !== null && previousHands[i].y > surface + .015 && hand.y <= surface + .015;
      if (dt > 0 && !teleported && (strokeHit || playHit && swimming) && surface !== null) {
        if (waterEvents.length >= 24) waterEvents.shift();
        waterEvents.push({ kind: underwater ? 'bubble' : playHit ? 'play' : 'stroke',
          x: hand.x, y: underwater ? Math.min(surface - .12, hand.y) : surface, z: hand.z,
          strength: playHit ? .48 : .12 + Math.min(speed, 4) * .045 });
      }
      previousHands[i].copy(hand);
    }
    if (dt > 0 && !teleported && playHit && !swimming) {
      legs[1].ankle.updateWorldMatrix(true, false);
      soleCenter.set(0, -.1135, .12).applyMatrix4(legs[1].ankle.matrixWorld);
      const floor = groundSurfaceHeight(soleCenter.x, soleCenter.z);
      const surface = waterSurfaceAt(soleCenter.x, soleCenter.z, floor);
      if (surface !== null && surface - floor > .015) waterEvents.push({ kind: 'play',
        x: soleCenter.x, y: surface, z: soleCenter.z, strength: .38 });
    }
    previousPlay = waterPlay;
    handsReady = dt > 0 && swimming && !teleported;

    const actualSpeed = dt > 0 ? travelled / dt : 0;
    if (!contactsEnabled || swimming || underwater || teleported) pendingLanding.fill(false);
    const groundedContact = contactsEnabled && contactReady && !teleported && !airborne && waterPlay < 0
      && !swimming && !underwater && swimBlend < .12;
    for (let i = 0; i < legs.length; i++) {
      const planted = cycles[i] < contact && previousCycles[i] > cycles[i];
      const landing = pendingLanding[i] && airBlend < .16;
      if (groundedContact && ((planted && actualSpeed > .10 && airBlend < .12 && landingCompression < .04) || landing)) {
        const ankle = legs[i].ankle;
        ankle.updateWorldMatrix(true, false);
        soleCenter.set(0, -.1135, .031).applyMatrix4(ankle.matrixWorld);
        soleForward.set(0, 0, 1).transformDirection(ankle.matrixWorld);
        const ground = groundSurfaceHeight(soleCenter.x, soleCenter.z);
        // A landing waits until the animated boot is actually down, rather than stamping mid-air.
        if (!landing || soleCenter.y - ground < .17 || position.y - floor > .11) {
          if (footContacts.length >= 16) footContacts.shift();
          footContacts.push({ x: soleCenter.x, y: soleCenter.y, z: soleCenter.z,
            yaw: Math.atan2(soleForward.x, soleForward.z), side: sides[i],
            speed: landing ? Math.max(actualSpeed, Math.min(4.8, Math.abs(lastVerticalSpeed))) : actualSpeed,
            landing, impact: landing ? landingEnergy : 0 });
          pendingLanding[i] = false;
        }
      }
      previousCycles[i] = cycles[i];
    }
    if (!contactsEnabled) footContacts.length = 0;
    if (contactReady && airborne && dt > 0) lastVerticalSpeed = verticalTravel / dt;
    contactAirborne = airborne;
    contactPosition.copy(position);
    contactReady = contactsEnabled && dt > 0;
  }

  return {
    group, head, motion, update, resetFootContacts,
    wetness: clothing.state, restoreWetness: clothing.restore, drips,
    wetFootContact: clothing.footContact,
    drainFootContacts() { return footContacts.splice(0); },
    drainWaterEvents() { return waterEvents.splice(0); },
    resetPose() { initialized = false; resetFootContacts(); handsReady = false; previousPlay = -1; waterEvents.length = 0; },
  };
}
