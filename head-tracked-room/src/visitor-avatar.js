import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { aimBone, aimHand, bendArm, curlFingers, readHand } from './figure-pose.js';

const point = (x, y, z) => new THREE.Vector3(x, y, z);
const worldPosition = node => node.getWorldPosition(new THREE.Vector3());
const worldRotation = node => node.getWorldQuaternion(new THREE.Quaternion());

export async function loadHumanoidAvatar() {
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  const asset = await loader.loadAsync(import.meta.env.BASE_URL + 'visitor/AvatarSample_C.vrm');
  const avatar = asset.userData.vrm;
  if (!avatar) throw new Error('The visitor model did not contain a VRM humanoid.');

  VRMUtils.rotateVRM0(avatar);
  VRMUtils.combineSkeletons(avatar.scene);
  return avatar;
}

export async function loadVisitorAvatar(parent, plaque, sillY) {
  const avatar = await loadHumanoidAvatar();
  const character = new THREE.Group();
  character.add(avatar.scene);
  character.scale.setScalar(0.58);
  character.rotation.set(0.43, 0.055, 0);
  const bone = name => avatar.humanoid.getNormalizedBoneNode(name);
  bone('spine').rotation.x = -0.16;
  bone('chest').rotation.x = -0.10;
  bone('head').rotation.set(0.53, -0.065, -0.04);
  character.updateMatrixWorld(true);
  character.position.copy(point(-0.098, 0.112, 0.034).sub(worldPosition(bone('head'))));
  character.updateMatrixWorld(true);

  const brace = readHand(bone, 'right');
  const grip = readHand(bone, 'left');
  plaque.updateWorldMatrix(true, false);
  const plaqueRotation = worldRotation(plaque);

  // Wrist anchors are given in the sill and plaque coordinates. The elbows
  // bend toward the outside of the body while the model keeps its bone lengths.
  bendArm(bone, 'right', point(-0.255, sillY + 0.023, 0.016), point(-0.245, -0.042, -0.05));
  const braceDirection = point(-0.03, -0.56, 0.83).normalize();
  const braceBack = point(0, 0.83, 0.56).normalize();
  aimHand(brace, braceDirection, braceBack);
  curlFingers(bone, 'right', braceBack, [0.16, 0.34, 0.23]);

  const gripAnchor = plaque.localToWorld(point(-0.145, 0.005, 0.035));
  bendArm(bone, 'left', gripAnchor, point(0.108, -0.082, -0.012));
  const gripDirection = point(1, 0.11, 0).normalize().applyQuaternion(plaqueRotation);
  const gripBack = point(0, 0, 1).applyQuaternion(plaqueRotation);
  aimHand(grip, gripDirection, gripBack);
  curlFingers(bone, 'left', gripBack, [0.1, 0.28, 0.18]);
  const thumb = bone('leftThumbMetacarpal');
  const thumbDirection = point(0.55, -0.32, -0.67).normalize().applyQuaternion(plaqueRotation);
  aimBone(thumb, bone('leftThumbProximal'), worldPosition(thumb).add(thumbDirection));

  avatar.scene.traverse(node => {
    if (!node.isMesh) return;
    node.frustumCulled = false;
    node.castShadow = !node.material.transparent;
  });
  for (const material of avatar.materials ?? []) material.color?.multiplyScalar(0.83);
  avatar.expressionManager?.setValue('happy', 0.18);
  avatar.update(0);
  parent.add(character);
  return avatar;
}
