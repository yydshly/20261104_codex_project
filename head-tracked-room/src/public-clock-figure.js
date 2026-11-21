import * as THREE from 'three';
import { loadHumanoidAvatar } from './visitor-avatar.js';
import { aimHand, bendArm, curlFingers, readHand } from './figure-pose.js';

export async function loadPublicClockFigure(room, { z, clockZ, clockY, clockWidth }, createGlance) {
  const avatar = await loadHumanoidAvatar();
  avatar.update(0);
  const bounds = new THREE.Box3().setFromObject(avatar.scene);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = .505 / size.y;
  const character = new THREE.Group();
  character.add(avatar.scene);
  character.scale.setScalar(scale);
  character.position.set(0, -bounds.min.y * scale, z);
  room.add(character);
  const bone = name => avatar.humanoid.getNormalizedBoneNode(name);
  bone('head').rotation.set(-.04, 0, .013);
  room.updateWorldMatrix(true, true);
  const rotation = room.getWorldQuaternion(new THREE.Quaternion());

  for (const [side, sign] of [['left', 1], ['right', -1]]) {
    const wrist = room.localToWorld(new THREE.Vector3(sign * (clockWidth / 2 + .012), clockY - .014, clockZ + .001));
    const elbow = room.localToWorld(new THREE.Vector3(sign * .13, clockY - .070, z - .018));
    bendArm(bone, side, wrist, elbow);
    const direction = new THREE.Vector3(-sign * .25, .26, .93).normalize().applyQuaternion(rotation);
    const back = new THREE.Vector3(sign * .77, -.06, .60).normalize().applyQuaternion(rotation);
    aimHand(readHand(bone, side), direction, back);
    curlFingers(bone, side, back, [.51, .62, .33]);
  }
  avatar.scene.traverse(node => {
    if (!node.isMesh) return;
    node.frustumCulled = false;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  avatar.expressionManager?.setValue('happy', .12);
  avatar.update(0);
  const glance = createGlance(bone('head'), bone('neck'), [bone('leftEye'), bone('rightEye')].filter(Boolean));
  return time => {
    const changed = glance(time);
    if (changed) avatar.update(0);
    return changed;
  };
}
