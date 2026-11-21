import * as THREE from 'three';

const CATCH = 3.42;
const LAND = 8.68;
const SEGMENTS = 16;
const UP = new THREE.Vector3(0, 1, 0);
const LEFT_LEDGE = new THREE.Vector3(-4.95, 7.045, -7.085);
const RIGHT_LEDGE = new THREE.Vector3(3.86, 6.145, -7.085);
const ROOF_ROTATION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const { lerp, smoothstep } = THREE.MathUtils;

function webMark(radius) {
  const points = [];
  const spokes = 7;
  for (let index = 0; index < spokes; index++) {
    const angle = index * Math.PI * 2 / spokes;
    const next = (index + 1) * Math.PI * 2 / spokes;
    const length = radius * (0.82 + (index % 3) * 0.09);
    points.push(0, 0, 0, Math.cos(angle) * length, Math.sin(angle) * length, 0);
    for (const fraction of [0.45, 0.72]) {
      points.push(
        Math.cos(angle) * length * fraction, Math.sin(angle) * length * fraction, 0,
        Math.cos(next) * radius * fraction, Math.sin(next) * radius * fraction, 0,
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xffedda, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  return new THREE.LineSegments(geometry, material);
}

export function createWebSequence() {
  const object = new THREE.Group();
  const strandGeometry = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true);
  const core = new THREE.InstancedMesh(strandGeometry, new THREE.MeshBasicMaterial({
    color: 0xffeee0, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
  }), 4 * SEGMENTS * 3);
  const halo = new THREE.InstancedMesh(strandGeometry, new THREE.MeshBasicMaterial({
    color: 0xffb379, transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), 4 * SEGMENTS);
  for (const strands of [core, halo]) {
    strands.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    strands.frustumCulled = false;
    strands.count = 0;
  }
  object.add(halo, core);

  const cables = [
    { source: 'leftWrist', roof: new THREE.Vector3(-0.87, 0.738, 0.54), start: 2.68, finish: 3.08 },
    { source: 'rightWrist', roof: new THREE.Vector3(0.93, 0.738, 0.54), start: 2.75, finish: 3.14 },
    { anchor: LEFT_LEDGE, roof: new THREE.Vector3(-1.01, 0.738, -0.53), start: 2.92, finish: 3.31 },
    { anchor: RIGHT_LEDGE, roof: new THREE.Vector3(0.98, 0.738, -0.53), start: 2.98, finish: 3.38 },
  ].map(cable => {
    const roofMark = webMark(0.26);
    const ledgeMark = cable.anchor ? webMark(0.38) : null;
    object.add(roofMark);
    if (ledgeMark) {
      ledgeMark.position.copy(cable.anchor);
      object.add(ledgeMark);
    }
    return { ...cable, roofMark, ledgeMark };
  });

  const sparkPositions = new Float32Array(16 * 6);
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  const sparks = new THREE.LineSegments(sparkGeometry, new THREE.LineBasicMaterial({
    color: 0xffbc85, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
  }));
  sparks.frustumCulled = false;
  object.add(sparks);

  const source = new THREE.Vector3();
  const target = new THREE.Vector3();
  const sideways = new THREE.Vector3();
  const previous = new THREE.Vector3();
  const point = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const segment = new THREE.Object3D();
  let frame;

  function update({ time, car, hero, heroRig }) {
    const tension = smoothstep(time, 2.72, CATCH) * (1 - smoothstep(time, LAND - 0.12, 9.36));
    const approach = smoothstep(time, 0.45, 2.66);
    const skid = smoothstep(time, CATCH, 3.84);
    const lower = smoothstep(time, 5.26, LAND);
    const rebound = Math.max(0, time - CATCH);
    const recoil = Math.exp(-1.85 * rebound) * Math.sin(4.22 * rebound);

    if (time > CATCH) {
      car.position.set(
        lerp(-0.75, 0.81, lower) + 0.22 * recoil,
        lerp(3.36, 0.72, lower) - 0.81 * recoil,
        0.84 * lower + 0.18 * recoil,
      );
      car.rotation.set(
        0.11 * recoil,
        0.09 * recoil,
        -0.28 * Math.cos(rebound * 4.35) * Math.exp(-1.17 * rebound) * (1 - lower),
      );
    }

    hero.position.set(lerp(3.72, 2.22, approach) + 0.47 * skid, 0, lerp(3.92, 2.67, approach) + 0.46 * skid + 0.18 * lower);
    hero.rotation.y = Math.atan2(car.position.x - hero.position.x, car.position.z - hero.position.z);
    frame = { time, car, hero, heroRig, recoil };
    return tension;
  }

  function putSegment(mesh, index, first, last, thickness) {
    direction.subVectors(last, first);
    const length = direction.length();
    segment.position.copy(first).lerp(last, 0.5);
    segment.scale.set(thickness, length + 0.0018, thickness);
    segment.quaternion.setFromUnitVectors(UP, direction.normalize());
    segment.updateMatrix();
    mesh.setMatrixAt(index, segment.matrix);
  }

  function pointOnCable(fraction, index, slack, time, recoil, output) {
    const bow = Math.sin(Math.PI * fraction);
    const weave = Math.sin(fraction * 25 + time * 11 + index * 2.3);
    output.copy(source).lerp(target, fraction);
    output.y -= bow * slack;
    output.addScaledVector(sideways, bow * (weave * 0.018 + recoil * 0.1));
    return output;
  }

  function afterPose() {
    const { time, car, hero, heroRig, recoil } = frame;
    const fade = 1 - smoothstep(time, LAND + 0.12, 10.55);
    const flex = 1 - smoothstep(time, 3.14, CATCH);
    const release = smoothstep(time, LAND - 0.06, LAND + 1.03);
    const slack = flex * 0.56 + Math.abs(recoil) * 0.11 + release * 0.48;
    const bright = smoothstep(time, 2.67, 2.92) * fade;
    core.material.opacity = bright * 0.94;
    halo.material.opacity = bright * (0.09 + Math.max(0, recoil) * 0.13);
    let coreCount = 0;
    let haloCount = 0;
    cables.forEach((cable, index) => {
      const extension = smoothstep(time, cable.start, cable.finish);
      const hit = smoothstep(time, cable.finish - 0.03, cable.finish + 0.16) * fade;
      cable.roofMark.visible = hit > 0;
      cable.roofMark.material.opacity = hit * 0.88;
      if (cable.ledgeMark) {
        cable.ledgeMark.visible = hit > 0;
        cable.ledgeMark.material.opacity = hit * 0.8;
      }
      if (extension === 0 || bright === 0) return;

      const roof = cable.roofMark.position.copy(cable.roof).applyQuaternion(car.quaternion).add(car.position);
      cable.roofMark.quaternion.copy(car.quaternion).multiply(ROOF_ROTATION);
      if (cable.anchor) {
        source.copy(roof);
        target.copy(cable.anchor);
      } else {
        const marker = heroRig?.anchors?.[cable.source] ?? hero.getObjectByName(cable.source === 'leftWrist' ? 'web-wrist-left' : 'web-wrist-right');
        if (marker) marker.getWorldPosition(source);
        else source.set(cable.source === 'leftWrist' ? -0.33 : 0.33, 1.31, 0.56).applyQuaternion(hero.quaternion).add(hero.position);
        target.copy(roof);
      }
      sideways.set(target.z - source.z, 0, source.x - target.x).normalize();

      for (let fiber = -1; fiber <= 1; fiber++) {
        previous.copy(source);
        for (let part = 1; part <= SEGMENTS; part++) {
          const fraction = extension * part / SEGMENTS;
          const ribbon = Math.sin(Math.PI * fraction) * fiber;
          pointOnCable(fraction, index, slack, time, recoil, point);
          point.addScaledVector(sideways, ribbon * 0.052);
          point.y += ribbon * Math.sin(fraction * 10 + index) * 0.042;
          const width = fiber === 0 ? 0.019 : 0.007;
          putSegment(core, coreCount++, previous, point, width);
          if (fiber === 0) putSegment(halo, haloCount++, previous, point, 0.055);
          previous.copy(point);
        }
      }
    });
    core.count = coreCount;
    halo.count = haloCount;
    core.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;

    const age = time - CATCH;
    sparks.visible = age >= 0 && age < 0.52;
    if (!sparks.visible) return;
    sparks.material.opacity = (1 - age / 0.52) * 0.84;
    for (let index = 0; index < 16; index++) {
      const angle = index * 2.4;
      const distance = age * (0.4 + (index % 6) * 0.59);
      const x = hero.position.x + Math.cos(angle) * distance;
      const y = Math.max(0.02, age * (0.9 + (index % 4) * 0.33) - 2.4 * age ** 2);
      const z = hero.position.z + Math.sin(angle) * distance;
      sparkPositions.set([x, y, z, x + Math.cos(angle) * 0.14, y + 0.031, z + Math.sin(angle) * 0.14], index * 6);
    }
    sparkGeometry.attributes.position.needsUpdate = true;
  }

  return { object, update, afterPose };
}
