import * as THREE from 'three';
import { MMDLoader } from 'three-stdlib';
import { aimHand, bendArm, curlFingers, readHand } from './figure-pose.js';

const boneNames = {
  UpperArm: '腕', LowerArm: 'ひじ', Hand: '手首',
  Index: '人指', Middle: '中指', Ring: '薬指', Little: '小指',
};
const joints = { Proximal: '１', Intermediate: '２', Distal: '３' };

function clockGlance(head, neck, eyes) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const headRest = head.rotation.clone();
  const neckRest = neck?.rotation.x ?? 0;
  const eyeRest = eyes.map(eye => eye.rotation.x);
  let nextLook = null;
  let lastAmount = 0;
  let lastGaze = 0;

  function glanceAt(seconds) {
    const down = THREE.MathUtils.smoothstep(seconds, 0, .53);
    const up = THREE.MathUtils.smoothstep(seconds, .87, 1.47);
    return down * (1 - up);
  }

  return time => {
    nextLook ??= time + 5600;
    const seconds = (time - nextLook) / 1000;
    const amount = reduceMotion.matches ? 0 : glanceAt(seconds);
    const gaze = reduceMotion.matches ? 0 : glanceAt(seconds + .10);
    if (seconds >= 1.47) nextLook = time + 15000 + Math.random() * 9000;
    if (amount === lastAmount && gaze === lastGaze) return false;
    lastAmount = amount;
    lastGaze = gaze;

    if (neck) neck.rotation.x = neckRest + amount * .049;
    head.rotation.set(headRest.x + amount * .265, headRest.y - amount * .019, headRest.z * (1 - amount * .55));
    eyes.forEach((eye, i) => { eye.rotation.x = eyeRest[i] + gaze * .14; });
    return true;
  };
}

export async function loadReferenceFigure(room, placement) {
  if (import.meta.env.VITE_PUBLIC_BUILD === 'true') {
    const { loadPublicClockFigure } = await import('./public-clock-figure.js');
    return loadPublicClockFigure(room, placement, clockGlance);
  }
  const { z, clockZ, clockY, clockWidth } = placement;
  // Model from the official initial-visual download: (c) Kizuna AI.
  const manager = new THREE.LoadingManager();
  const model = await new Promise((resolve, reject) => {
    let figure;
    manager.onLoad = () => resolve(figure);
    manager.onError = url => reject(new Error(`Could not read ${url}`));
    new MMDLoader(manager).load('/local-reference/kizunaai.pmx', result => { figure = result; }, undefined, reject);
  });
  model.scale.setScalar(.0229);
  model.position.set(0, -.0027, z);
  model.castShadow = true;
  model.frustumCulled = false;
  room.add(model);

  const byName = name => model.skeleton.getBoneByName(name);
  const bone = name => {
    const side = name.startsWith('left') ? '左' : '右';
    const suffix = name.replace(/^(left|right)/, '');
    const finger = /^(Index|Middle|Ring|Little)(Proximal|Intermediate|Distal)$/.exec(suffix);
    return byName(side + (finger ? boneNames[finger[1]] + joints[finger[2]] : boneNames[suffix]));
  };
  const head = byName('頭');
  head.rotation.set(-.07, 0, .013);
  room.updateWorldMatrix(true, true);
  const point = (x, y, d) => room.localToWorld(new THREE.Vector3(x, y, d));
  const rotation = room.getWorldQuaternion(new THREE.Quaternion());

  for (const [side, sign] of [['left', 1], ['right', -1]]) {
    const hand = readHand(bone, side);
    const wrist = point(sign * (clockWidth / 2 + .012), clockY - .014, clockZ + .001);
    const elbow = point(sign * .13, clockY - .070, z - .018);
    bendArm(bone, side, wrist, elbow);
    const direction = new THREE.Vector3(-sign * .25, .26, .93).normalize().applyQuaternion(rotation);
    const back = new THREE.Vector3(sign * .77, -.06, .60).normalize().applyQuaternion(rotation);
    aimHand(hand, direction, back);
    curlFingers(bone, side, back, [.51, .62, .33]);
  }
  for (const surface of model.material) {
    if (surface.name === '髪' || surface.name === '前髪') {
      surface.color.set('#ffd2c4');
      surface.emissive.multiplyScalar(.28);
    }
    if (surface.map) {
      surface.map.colorSpace = THREE.SRGBColorSpace;
      surface.map.anisotropy = 8;
      surface.map.needsUpdate = true;
    }
  }
  model.updateMatrixWorld(true);
  const eyes = [byName('左目'), byName('右目')].filter(Boolean);
  return clockGlance(head, byName('首'), eyes);
}
