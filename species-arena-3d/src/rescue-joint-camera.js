import * as THREE from 'three';
import { JOINT_EVAC_END, JOINT_EVAC_START, JOINT_LAND, JOINT_LOWER_START } from './rescue-joint.js';

const { lerp, smoothstep } = THREE.MathUtils;

export function createJointCamera() {
  const runnerTarget = new THREE.Vector3();
  const runnerCamera = new THREE.Vector3();

  return function setShot(camera, target, { perspective, eventTime, car, webHero, speedHero, aspect }) {
    const portrait = Math.min(1, aspect / 1.45);
    const framingScale = 1 / Math.sqrt(portrait);
    const approach = smoothstep(eventTime, 1.8, 3.45);
    const widen = smoothstep(eventTime, 3.05, JOINT_EVAC_START - 0.03);
    const landing = smoothstep(eventTime, JOINT_LOWER_START, JOINT_LAND + 0.36);
    const foreground = widen * (1 - landing * 0.45);

    // Keep the upper anchors and the evacuation zone in the street shot.
    const groupX = lerp(car.position.x * 0.64, webHero.position.x * 0.7, approach);
    target.set(
      groupX + landing * 0.72,
      lerp(4.05, 3.35, approach) - landing * 1.06 - foreground * 0.34,
      0.2 + widen * 0.54 + landing * 0.47 + foreground * 0.15,
    );
    camera.position.set(
      target.x + lerp(3.55, 5.45, widen),
      7.2 + widen * 0.35 - landing * 1.25,
      (13.6 + widen * 3.9 - landing * 1.05 + foreground * 0.6) * framingScale,
    );

    if (perspective === 'speed') {
      const close = smoothstep(eventTime, JOINT_EVAC_START - 0.02, JOINT_EVAC_START + 0.09)
        * (1 - smoothstep(eventTime, JOINT_EVAC_END, JOINT_EVAC_END + 0.58));
      const runner = speedHero.position;
      const nearCabin = 1 - smoothstep(Math.abs(runner.x - car.position.x), 0.45, 2.85);
      runnerTarget.set(
        lerp(runner.x - 0.12, car.position.x, nearCabin * 0.42),
        runner.y + lerp(1.02, 1.58, nearCabin),
        lerp(runner.z, car.position.z, nearCabin * 0.5),
      );
      // Stay on the open side of the street while the runner reverses at the window.
      runnerCamera.set(
        runnerTarget.x + lerp(1.72, 2.22, nearCabin),
        runnerTarget.y + lerp(1.16, 0.88, nearCabin),
        runnerTarget.z + (lerp(6.15, 6.65, nearCabin) * framingScale),
      );
      target.lerp(runnerTarget, close);
      camera.position.lerp(runnerCamera, close);
    }
  };
}
