import * as THREE from 'three';

const worldPosition = node => node.getWorldPosition(new THREE.Vector3());
const worldRotation = node => node.getWorldQuaternion(new THREE.Quaternion());

function rotateInWorld(node, rotation) {
  const parent = worldRotation(node.parent);
  node.quaternion.copy(parent.invert().multiply(rotation).multiply(worldRotation(node)));
  node.updateWorldMatrix(false, true);
}

export function aimBone(bone, child, target) {
  const origin = worldPosition(bone);
  const current = worldPosition(child).sub(origin).normalize();
  const desired = target.clone().sub(origin).normalize();
  rotateInWorld(bone, new THREE.Quaternion().setFromUnitVectors(current, desired));
}

export function bendArm(bone, side, target, elbowHint) {
  const upper = bone(side + 'UpperArm');
  const lower = bone(side + 'LowerArm');
  const hand = bone(side + 'Hand');
  const shoulder = worldPosition(upper);
  const currentElbow = worldPosition(lower);
  const first = shoulder.distanceTo(currentElbow);
  const second = currentElbow.distanceTo(worldPosition(hand));
  const axis = target.clone().sub(shoulder);
  const distance = THREE.MathUtils.clamp(axis.length(), Math.abs(first - second) + 0.0001, first + second - 0.0001);
  axis.normalize();
  const pole = elbowHint.clone().sub(shoulder);
  pole.addScaledVector(axis, -pole.dot(axis)).normalize();
  const along = (first * first - second * second + distance * distance) / (2 * distance);
  const bend = Math.sqrt(Math.max(0, first * first - along * along));
  const elbow = shoulder.clone().addScaledVector(axis, along).addScaledVector(pole, bend);
  aimBone(upper, lower, elbow);
  aimBone(lower, hand, shoulder.addScaledVector(axis, distance));
}

export function readHand(bone, side) {
  const hand = bone(side + 'Hand');
  const middle = bone(side + 'MiddleProximal');
  const index = bone(side + 'IndexProximal');
  const little = bone(side + 'LittleProximal');
  const forward = worldPosition(middle).sub(worldPosition(hand));
  const width = worldPosition(little).sub(worldPosition(index));
  const sign = forward.cross(width).y < 0 ? -1 : 1;
  return { hand, middle, index, little, sign };
}

export function aimHand({ hand, middle, index, little, sign }, direction, back) {
  const forward = worldPosition(middle).sub(worldPosition(hand)).normalize();
  const across = worldPosition(little).sub(worldPosition(index)).multiplyScalar(sign);
  across.addScaledVector(forward, -across.dot(forward)).normalize();
  const currentBack = forward.clone().cross(across);
  const desiredAcross = back.clone().cross(direction).normalize();
  const desiredBack = direction.clone().cross(desiredAcross);
  const from = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward, across, currentBack));
  const to = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(direction, desiredAcross, desiredBack));
  rotateInWorld(hand, to.multiply(from.invert()));
}

export function curlFingers(bone, side, back, angles) {
  const towardPalm = back.clone().negate();
  for (const finger of ['Index', 'Middle', 'Ring', 'Little']) {
    const joints = ['Proximal', 'Intermediate', 'Distal'].map(joint => bone(side + finger + joint));
    for (const [index, joint] of joints.entries()) {
      const next = joints[index + 1];
      const direction = next ? worldPosition(next).sub(worldPosition(joint)).normalize()
        : worldPosition(joint).sub(worldPosition(joints[index - 1])).normalize();
      const axis = direction.cross(towardPalm).normalize();
      rotateInWorld(joint, new THREE.Quaternion().setFromAxisAngle(axis, angles[index]));
    }
  }
}
