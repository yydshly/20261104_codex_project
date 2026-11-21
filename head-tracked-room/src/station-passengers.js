import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const UP = new THREE.Vector3(0, 1, 0);
const UPPER_LEG = .385;
const LOWER_LEG = .363;
const material = color => new THREE.MeshStandardMaterial({ color, roughness: .83 });

function part(parent, geometry, paint, x, y, z) {
  const mesh = new THREE.Mesh(geometry, paint);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function figure(scene, { coat, scarf, hat, carriesBag = false }) {
  const root = new THREE.Group();
  scene.add(root);
  const wool = material(coat);
  const trim = material(scarf);
  const pants = material('#364347');
  const shoes = material('#242e32');
  const skin = material('#c89673');
  const hair = material('#353030');
  const rounded = (w, h, d, r = .035) => new RoundedBoxGeometry(w, h, d, 3, r);
  part(root, rounded(.348, .485, .240, .077), wool, 0, .952, 0);
  part(root, rounded(.310, .090, .223), wool, 0, .726, 0);
  part(root, rounded(.015, .324, .011, .004), trim, .013, .944, .122);
  part(root, new THREE.CylinderGeometry(.062, .065, .102, 16), skin, 0, 1.218, .007);
  part(root, new THREE.CylinderGeometry(.096, .103, .057, 22), trim, 0, 1.206, .006);
  part(root, rounded(.063, .171, .025, .009), trim, -.052, 1.119, .118);
  part(root, new THREE.SphereGeometry(.109, 24, 16), skin, 0, 1.358, .012).scale.set(.88, 1.09, .88);
  part(root, new THREE.SphereGeometry(.026, 14, 9), skin, .004, 1.355, .102).scale.set(.65, .7, 1);
  part(root, new THREE.SphereGeometry(.110, 24, 14, 0, Math.PI * 2, 0, Math.PI * .53),
    hat ? material(hat) : hair, 0, 1.414, .010).scale.set(.92, .67, .96);
  part(root, new THREE.SphereGeometry(.070, 20, 10), hair, 0, 1.369, -.036).scale.set(1.15, .99, .82);
  const eyes = material('#3c302d');
  for (const x of [-.037, .037]) {
    part(root, new THREE.SphereGeometry(.007, 10, 8), eyes, x, 1.373, .101);
  }

  const arms = [-1, 1].map(side => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * .174, 1.117, .001);
    root.add(shoulder);
    part(shoulder, new THREE.CapsuleGeometry(.053, .152, 6, 14), wool, 0, -.105, 0);
    const elbow = new THREE.Group();
    elbow.position.y = -.215;
    shoulder.add(elbow);
    part(elbow, new THREE.CapsuleGeometry(.044, .129, 6, 14), wool, 0, -.091, 0);
    part(elbow, new THREE.SphereGeometry(.043, 14, 11), skin, 0, -.204, 0);
    if (carriesBag && side === 1) {
      const bag = material('#835d3d');
      part(elbow, rounded(.200, .229, .115, .020), bag, 0, -.381, .012);
      const handle = part(elbow, new THREE.TorusGeometry(.047, .008, 8, 22),
        shoes, 0, -.256, .012);
      handle.scale.y = .63;
      for (const x of [-.061, .061]) {
        part(elbow, rounded(.017, .211, .004, .001), shoes, x, -.379, .070);
      }
    }
    return { shoulder, elbow, side };
  });

  const legs = [-1, 1].map(side => ({
    hip: new THREE.Vector3(side * .094, .778, 0),
    upper: part(root, new THREE.CylinderGeometry(.064, .073, 1, 15), pants, 0, 0, 0),
    lower: part(root, new THREE.CylinderGeometry(.042, .059, 1, 15), pants, 0, 0, 0),
    foot: part(root, rounded(.110, .076, .216, .028), shoes, 0, 0, 0),
  }));
  const ankle = new THREE.Vector3();
  const knee = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const segment = new THREE.Vector3();

  function link(mesh, a, b) {
    segment.subVectors(b, a);
    mesh.position.copy(a).lerp(b, .5);
    mesh.scale.y = segment.length() + .027;
    mesh.quaternion.setFromUnitVectors(UP, segment.normalize());
  }

  return {
    root,
    pose(feet, yaw, swing = 0, wave = 0, wrist = 0) {
      root.position.copy(feet[0]).lerp(feet[1], .5);
      root.rotation.y = yaw;
      const stride = Math.hypot(feet[1].x - feet[0].x, feet[1].z - feet[0].z);
      const hipHeight = .778 - THREE.MathUtils.clamp((stride - .23) * .26, 0, .16);
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        leg.hip.y = hipHeight;
        ankle.copy(feet[i]).sub(root.position).applyAxisAngle(UP, -yaw);
        leg.foot.position.copy(ankle);
        leg.foot.position.y += .039;
        leg.foot.position.z += .042;
        ankle.y += .069;
        axis.subVectors(ankle, leg.hip);
        const distance = Math.min(axis.length(), UPPER_LEG + LOWER_LEG - .001);
        axis.normalize();
        bend.set(0, 0, 1).addScaledVector(axis, -axis.z).normalize();
        const along = (UPPER_LEG ** 2 - LOWER_LEG ** 2 + distance ** 2) / (2 * distance);
        knee.copy(leg.hip).addScaledVector(axis, along)
          .addScaledVector(bend, Math.sqrt(Math.max(0, UPPER_LEG ** 2 - along ** 2)));
        link(leg.upper, leg.hip, knee);
        link(leg.lower, knee, ankle);
      }
      for (const arm of arms) {
        const waving = arm.side === 1 ? wave : 0;
        arm.shoulder.rotation.set(swing * arm.side * (carriesBag && arm.side === 1 ? .38 : 1),
          0, arm.side * .095 + waving * 1.74);
        arm.elbow.rotation.x = -.11 - waving * .13;
        arm.elbow.rotation.z = waving * (.56 + wrist * .24);
      }
    },
  };
}

const EXIT_START = 5.12;
const EXIT_YAW = -1.29;
const EXIT_STEPS = 12;
const EXIT_STEP_TIME = .44;

export function addStationPassengers(scene, doorX, deckZ, platformY) {
  const traveler = figure(scene, { coat: '#4c5f55', scarf: '#c9935e', carriesBag: true });
  const waiter = figure(scene, { coat: '#975d48', scarf: '#e1bd8d', hat: '#c9ad88' });
  const initial = [
    new THREE.Vector3(doorX - .10, .49, deckZ),
    new THREE.Vector3(doorX + .10, .49, deckZ),
  ];
  const steps = [
    // The first planted foot clears the train-platform gap before the second follows.
    [0, .16, .79, doorX - .10, .42, .19],
    [1, .79, 1.34, doorX + .09, .77, .17],
    [0, 1.34, 1.80, 1.20, 1.08, .10],
    [1, 1.80, 2.25, .95, 1.40, .10],
    [0, 2.25, 2.70, .56, 1.69, .09],
    [1, 2.70, 3.14, .32, 1.88, .09],
    [0, 3.14, 3.53, -.02, 2.03, .08],
    [1, 3.53, 3.91, .15, 2.16, .07],
  ].map(([side, from, to, x, z, lift]) => ({
    side, from, to, point: new THREE.Vector3(x, platformY, z), lift,
  }));
  const feet = [new THREE.Vector3(), new THREE.Vector3()];
  const waitPosition = new THREE.Vector3(-.94, platformY, 2.34);
  const waitFeet = [new THREE.Vector3(), new THREE.Vector3()];
  const travelerAtMeeting = [steps.at(-2).point, steps.at(-1).point];
  const exitDirection = new THREE.Vector3(0, 0, 1).applyAxisAngle(UP, EXIT_YAW);
  const exitSide = new THREE.Vector3(1, 0, 0).applyAxisAngle(UP, EXIT_YAW);
  const travelerExit = exitSteps(travelerAtMeeting[0].clone().lerp(travelerAtMeeting[1], .5), EXIT_START + .34);
  const waiterExit = exitSteps(waitPosition, EXIT_START);
  const waiterExitStance = [new THREE.Vector3(), new THREE.Vector3()];

  function stance(points, center, yaw) {
    points[0].set(-.103, 0, .024).applyAxisAngle(UP, yaw).add(center);
    points[1].set(.103, 0, -.024).applyAxisAngle(UP, yaw).add(center);
  }

  function exitSteps(start, time) {
    return Array.from({ length: EXIT_STEPS }, (_, i) => {
      const side = i % 2;
      return {
        side,
        from: time + i * EXIT_STEP_TIME,
        to: time + (i + 1) * EXIT_STEP_TIME,
        point: start.clone()
          .addScaledVector(exitDirection, .34 + i * .455)
          .addScaledVector(exitSide, side === 0 ? -.103 : .103),
        lift: .082,
      };
    });
  }

  function plantFeet(points, startingPoints, route, time) {
    points[0].copy(startingPoints[0]);
    points[1].copy(startingPoints[1]);
    let armSwing = 0;
    for (const { side, from, to, point, lift } of route) {
      if (time < from) break;
      const progress = THREE.MathUtils.clamp((time - from) / (to - from), 0, 1);
      points[side].lerp(point, THREE.MathUtils.smoothstep(progress, 0, 1));
      const arc = Math.sin(progress * Math.PI);
      points[side].y += arc * lift;
      armSwing = (side === 0 ? 1 : -1) * arc * .30;
    }
    return armSwing;
  }

  return time => {
    const ease = THREE.MathUtils.smoothstep;
    const wave = ease(time, 2.16, 2.50) * (1 - ease(time, 3.42, 3.83));
    const meetingYaw = THREE.MathUtils.lerp(2.42, 1.79, ease(time, 1.07, 3.38));
    const waitingYaw = THREE.MathUtils.lerp(meetingYaw, EXIT_YAW, ease(time, 4.56, EXIT_START));
    if (time < EXIT_START) {
      stance(waitFeet, waitPosition, waitingYaw);
      waiter.pose(waitFeet, waitingYaw, 0, wave, Math.sin((time - 2.50) * 12.3));
    } else {
      stance(waiterExitStance, waitPosition, EXIT_YAW);
      waiter.pose(waitFeet, EXIT_YAW, plantFeet(waitFeet, waiterExitStance, waiterExit, time));
    }
    traveler.root.visible = time >= -.28;
    if (!traveler.root.visible) return;
    const yaw = -.89 * ease(time, 1.16, 2.42) - .28 * ease(time, 3.48, 4.15)
      - .12 * ease(time, 4.75, EXIT_START + .34);
    const leaving = time >= EXIT_START;
    const swing = plantFeet(feet, leaving ? travelerAtMeeting : initial, leaving ? travelerExit : steps, time);
    traveler.pose(feet, yaw, swing);
  };
}
