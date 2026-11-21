/** V5 post-animation contact constraints. Call prepare() before AnimationMixer,
 * then update() after actor pose, before weapon-tip FX sampling. All inputs are world-meter positions.
 * Baked cloth is measured against actual triangles offline; these capsules
 * guard the new poses introduced by clip blending, turns and controller steps.
 */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const duration = { Idle: 2, Walk: 1.1, Run: .8, Attack1: .72, Attack2: .82, Attack3: 1, Sweep: 1.08, Guard: .32, LeapSlam: 1.28, Hit: .55, Dodge: .4, Death: 1.2, Victory: 1.6 };
const canonical = name => ({ Cleave: 'Sweep', GuardCast: 'Guard', Leap: 'LeapSlam', Stagger: 'Hit' }[name] || name);
const smooth = value => { value = clamp(value, 0, 1); return value * value * (3 - 2 * value); };

export function footContactWeight(action, actionTime = 0, side = 'l') {
  action = canonical(action);
  if (['Idle', 'Guard', 'Hit', 'Attack1', 'Attack2', 'Attack3', 'Sweep', 'Victory'].includes(action)) return 1;
  if (action === 'LeapSlam') return actionTime < .18 ? 1 : actionTime < .92 ? 0 : smooth((actionTime - .92) / .08);
  if (action === 'Walk' || action === 'Run') {
    const phase = ((actionTime / duration[action] + (side === 'r' ? .5 : 0)) % 1 + 1) % 1;
    return phase < .06 ? smooth(phase / .06) : phase < .42 ? 1 : phase < .50 ? 1 - smooth((phase - .42) / .08) : 0;
  }
  return 0;
}

/** Pure geometry helper used by the runtime and independently checkable. */
export function projectOutOfCapsule(point, start, end, radius, fallback = { x: 0, y: 0, z: -1 }) {
  const ax = end.x - start.x, ay = end.y - start.y, az = end.z - start.z;
  const length2 = ax * ax + ay * ay + az * az;
  const t = length2 > 1e-12 ? clamp(((point.x - start.x) * ax + (point.y - start.y) * ay + (point.z - start.z) * az) / length2, 0, 1) : 0;
  const x = start.x + t * ax, y = start.y + t * ay, z = start.z + t * az;
  let nx = point.x - x, ny = point.y - y, nz = point.z - z;
  const length = Math.hypot(nx, ny, nz), distance = length - radius;
  if (distance >= 0) return { x: point.x, y: point.y, z: point.z, distance, corrected: false };
  if (length < 1e-8) { nx = fallback.x; ny = fallback.y; nz = fallback.z; let s = Math.hypot(nx, ny, nz); if (s < 1e-8) { nx = 0; ny = 0; nz = -1; s = 1; } nx /= s; ny /= s; nz /= s; }
  else { nx /= length; ny /= length; nz /= length; }
  return { x: x + nx * radius, y: y + ny * radius, z: z + nz * radius, distance, corrected: true };
}

export function createWarlordSecondary(THREE, actorRoot, { groundHeight = () => 0, enabled = true } = {}) {
  const bones = new Map(); actorRoot.traverse(o => { if (o.isBone) bones.set(o.name, o); });
  const get = name => bones.get(name);
  const position = bone => bone.getWorldPosition(new THREE.Vector3());
  const quaternion = bone => bone.getWorldQuaternion(new THREE.Quaternion());
  const worldRoot = new THREE.Vector3(), previousRoot = new THREE.Vector3(), rootDelta = new THREE.Vector3();
  let first = true, disposed = false;
  const feet = ['l', 'r'].map(side => ({ side, upper: get(`thigh_${side}`), lower: get(`calf_${side}`), foot: get(`foot_${side}`), target: null, rotation: null, lastWeight: 0, ankleHeight: .12 }));
  actorRoot.updateWorldMatrix(true, true); actorRoot.getWorldPosition(worldRoot);
  for (const foot of feet) if (foot.foot) foot.ankleHeight = clamp(position(foot.foot).y - worldRoot.y, .07, .20);
  const cloth = [...bones].filter(([name]) => /^(?:Mantle_\d_\d|SilkCrest_-?1_\d)$/.test(name)).sort(([a], [b]) => a.localeCompare(b)).map(([name, bone]) => ({ name, bone, offset: new THREE.Vector3(), authored: new THREE.Vector3() }));
  const constrained = [...new Set([...feet.flatMap(f => [f.upper, f.lower, f.foot]), ...cloth.map(j => j.bone)].filter(Boolean))];
  const authored = new Map();
  const stats = { feet: { l: null, r: null }, maximumFootError: 0, clothCorrections: 0, minimumCapsuleClearance: 0, colliderCount: 0 };

  function prepare() {
    if (disposed) return;
    for (const [bone, transform] of authored) { bone.position.copy(transform.position); bone.quaternion.copy(transform.quaternion); bone.scale.copy(transform.scale); }
    actorRoot.updateWorldMatrix(true, true);
  }

  function setWorldQuaternion(bone, desired, weight = 1) {
    const parent = bone.parent ? quaternion(bone.parent) : new THREE.Quaternion();
    const local = parent.invert().multiply(desired); bone.quaternion.slerp(local, weight); bone.updateWorldMatrix(false, true);
  }
  function solveLeg(state, target, weight) {
    const a = position(state.upper), b = position(state.lower), c = position(state.foot);
    const lengthA = a.distanceTo(b), lengthB = b.distanceTo(c), delta = target.clone().sub(a), distance = delta.length();
    if (lengthA < .01 || lengthB < .01 || distance < .001 || distance > (lengthA + lengthB) * 1.03) return false;
    const direction = delta.normalize(), pole = b.clone().sub(a).addScaledVector(direction, -b.clone().sub(a).dot(direction));
    if (pole.lengthSq() < 1e-8) { actorRoot.getWorldDirection(pole); pole.addScaledVector(direction, -pole.dot(direction)); }
    pole.normalize(); const d = clamp(distance, Math.abs(lengthA - lengthB) + .001, lengthA + lengthB - .001);
    const along = clamp((lengthA * lengthA + d * d - lengthB * lengthB) / (2 * d), -lengthA, lengthA);
    const knee = a.clone().addScaledVector(direction, along).addScaledVector(pole, Math.sqrt(Math.max(0, lengthA * lengthA - along * along)));
    const oldUpper = b.clone().sub(a).normalize(), newUpper = knee.clone().sub(a).normalize();
    setWorldQuaternion(state.upper, new THREE.Quaternion().setFromUnitVectors(oldUpper, newUpper).multiply(quaternion(state.upper)), weight);
    const newB = position(state.lower), newC = position(state.foot);
    setWorldQuaternion(state.lower, new THREE.Quaternion().setFromUnitVectors(newC.sub(newB).normalize(), target.clone().sub(newB).normalize()).multiply(quaternion(state.lower)), weight);
    if (state.rotation) setWorldQuaternion(state.foot, state.rotation, weight);
    return true;
  }
  function reachableGroundTarget(state, candidate) {
    const hip = position(state.upper), knee = position(state.lower), ankle = position(state.foot);
    const reach = hip.distanceTo(knee) + knee.distanceTo(ankle) - .001;
    const target = candidate.clone(); target.y = groundHeight(target.x, target.z) + state.ankleHeight;
    const vertical = hip.y - target.y;
    if (Math.abs(vertical) >= reach) return null;
    const radius = Math.sqrt(Math.max(0, reach * reach - vertical * vertical)), dx = target.x - hip.x, dz = target.z - hip.z, length = Math.hypot(dx, dz);
    if (length > radius && length > 1e-8) { target.x = hip.x + dx / length * radius; target.z = hip.z + dz / length * radius; }
    return target;
  }
  function capsules() {
    const result = [], capsule = (a, b, radius, name) => { if (a && b) result.push({ a: position(a), b: position(b), radius, name }); };
    capsule(get('pelvis'), get('spine_03'), .235, 'torso');
    capsule(get('spine_02'), get('Head'), .195, 'upper-body');
    for (const side of ['l', 'r']) {
      const upper = get(`upperarm_${side}`), lower = get(`lowerarm_${side}`);
      if (upper && lower) result.push({ a: position(upper), b: position(upper).lerp(position(lower), .45), radius: .185, name: `shoulder-${side}` });
      capsule(get(`thigh_${side}`), get(`calf_${side}`), .145, `thigh-${side}`);
      capsule(get(`calf_${side}`), get(`foot_${side}`), .112, `calf-${side}`);
    }
    if (get('HalberdGrip') && get('HalberdTip')) {
      const grip = position(get('HalberdGrip')), tip = position(get('HalberdTip')), axis = tip.clone().sub(grip).normalize();
      result.push({ a: grip.clone().addScaledVector(axis, -1.26), b: tip, radius: .042, name: 'halberd-shaft' });
      result.push({ a: tip.clone().addScaledVector(axis, -.45), b: tip.clone().addScaledVector(axis, -.08), radius: .20, name: 'halberd-head' });
    }
    return result;
  }
  function update(dt, state = {}) {
    if (disposed || !enabled || dt <= 0) return stats;
    for (const bone of constrained) {
      let transform = authored.get(bone);
      if (!transform) { transform = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3() }; authored.set(bone, transform); }
      transform.position.copy(bone.position); transform.quaternion.copy(bone.quaternion); transform.scale.copy(bone.scale);
    }
    actorRoot.updateWorldMatrix(true, true); actorRoot.getWorldPosition(worldRoot);
    rootDelta.copy(worldRoot).sub(previousRoot);
    if (first || rootDelta.length() > 1.5) { for (const foot of feet) { foot.target = null; foot.lastWeight = 0; } for (const joint of cloth) joint.offset.set(0, 0, 0); first = false; }
    previousRoot.copy(worldRoot);
    for (const foot of feet) {
      if (!foot.upper || !foot.lower || !foot.foot) continue;
      const action = canonical(state.action || 'Idle'), time = state.actionTime || 0;
      let weight = state.grounded === false ? 0 : footContactWeight(action, time, foot.side);
      const current = position(foot.foot);
      if (['Walk', 'Run'].includes(action)) weight *= 1 - smooth((current.y - groundHeight(current.x, current.z) - foot.ankleHeight - .025) / .065);
      if (weight < .02) { foot.target = null; foot.lastWeight = weight; stats.feet[foot.side] = null; continue; }
      const step = { Attack1: [.12, .30], Attack2: [.14, .33], Attack3: [.22, .42], Sweep: [.21, .44] }[action];
      const lead = action === 'Attack2' ? 'r' : 'l';
      const stepping = step && foot.side === lead && time >= step[0] && time < step[1];
      if (stepping) {
        const progress = clamp((time - step[0]) / (step[1] - step[0]), 0, 1), target = current.clone();
        target.y = groundHeight(current.x, current.z) + foot.ankleHeight + Math.sin(progress * Math.PI) * .085;
        foot.target = null; foot.lastWeight = 0; solveLeg(foot, target, 1);
        stats.feet[foot.side] = { weight: 0, stepping: true, role: 'lead', lift: Math.sin(progress * Math.PI) * .085 }; continue;
      }
      if (!foot.target || foot.lastWeight < .02 || current.distanceTo(foot.target) > .48) {
        foot.target = current.clone(); foot.target.y = groundHeight(current.x, current.z) + foot.ankleHeight;
        foot.rotation = quaternion(foot.foot);
      }
      let replanted = false;
      if (!solveLeg(foot, foot.target, weight)) {
        const projected = reachableGroundTarget(foot, current);
        if (!projected || !solveLeg(foot, projected, weight)) {
          foot.target = null; foot.lastWeight = 0; stats.feet[foot.side] = { weight: 0, releasedReason: 'ground-out-of-anatomical-reach' }; continue;
        }
        foot.target = projected; foot.rotation = quaternion(foot.foot); replanted = true;
      }
      const error = position(foot.foot).distanceTo(foot.target); stats.maximumFootError = Math.max(stats.maximumFootError, error);
      stats.feet[foot.side] = { weight, error, role: foot.side === lead ? 'lead' : 'support', replantedReason: replanted ? 'anatomical-reach-limit' : null, target: foot.target.toArray() }; foot.lastWeight = weight;
    }
    actorRoot.updateWorldMatrix(true, true);
    const colliders = capsules(), fallback = new THREE.Vector3(); actorRoot.getWorldDirection(fallback); fallback.multiplyScalar(-1);
    for (const joint of cloth) joint.bone.getWorldPosition(joint.authored);
    stats.clothCorrections = 0; stats.minimumCapsuleClearance = Infinity; stats.colliderCount = colliders.length;
    for (const joint of cloth) {
      const desired = joint.authored.clone();
      const apply = point => {
        for (let iteration = 0; iteration < 3; iteration++) for (const collider of colliders) {
          // Crest roots are sewn into the helmet and stay fixed at their seam.
          if (/SilkCrest_.*_0$/.test(joint.name) && /body|shoulder/.test(collider.name)) continue;
          const projected = projectOutOfCapsule(point, collider.a, collider.b, collider.radius + .014, fallback);
          if (projected.corrected) { point.set(projected.x, projected.y, projected.z); stats.clothCorrections++; }
        }
        return point;
      };
      apply(desired); const targetOffset = desired.clone().sub(joint.authored);
      joint.offset.lerp(targetOffset, 1 - Math.exp(-dt * 25));
      const target = apply(joint.authored.clone().add(joint.offset));
      if (target.distanceTo(joint.authored) > .24) target.sub(joint.authored).setLength(.24).add(joint.authored);
      if (joint.bone.parent) joint.bone.position.copy(joint.bone.parent.worldToLocal(target.clone())); else joint.bone.position.copy(target);
      joint.bone.updateWorldMatrix(false, true);
      for (const collider of colliders) stats.minimumCapsuleClearance = Math.min(stats.minimumCapsuleClearance, projectOutOfCapsule(target, collider.a, collider.b, collider.radius).distance);
    }
    actorRoot.updateWorldMatrix(true, true); return stats;
  }
  function reset() { prepare(); authored.clear(); first = true; stats.maximumFootError = 0; stats.feet.l = stats.feet.r = null; stats.clothCorrections = 0; stats.minimumCapsuleClearance = 0; stats.colliderCount = 0; for (const foot of feet) { foot.target = null; foot.rotation = null; foot.lastWeight = 0; } for (const joint of cloth) joint.offset.set(0, 0, 0); }
  return { prepare, update, reset, dispose() { reset(); disposed = true; }, stats, boneCount: bones.size, clothBoneCount: cloth.length };
}
