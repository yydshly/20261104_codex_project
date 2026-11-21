import * as THREE from 'three';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const TAU = Math.PI * 2;
const SHARD = new THREE.IcosahedronGeometry(1, 0);
const LEAF = new THREE.OctahedronGeometry(1, 0);
const CUBE = new THREE.BoxGeometry(1, 1, 1);

function light(color, opacity = 0.8) {
  return new THREE.MeshBasicMaterial({
    color, opacity, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    fog: false, toneMapped: false,
  });
}

function mesh(parent, geometry, material) {
  const item = new THREE.Mesh(geometry, material);
  parent.add(item);
  return item;
}

function ring(parent, radius, width, material, segments = 48, start = 0, sweep = TAU) {
  return mesh(parent, new THREE.RingGeometry(radius - width, radius, segments, 1, start, sweep), material);
}

function phase(progress, contact) {
  return {
    charge: smoothstep(progress, 0, contact * 0.55),
    travel: smoothstep(progress, contact * 0.25, contact),
    recovery: smoothstep(progress, contact, 1),
    fade: 1 - smoothstep(progress, contact + 0.045, 1),
  };
}

function createGiant(color) {
  const object = new THREE.Group();
  const faultLight = light(color);
  const edgeLight = light(0xffe0ac);
  const stoneLight = light(0xe49a65);
  const front = new THREE.Group();
  object.add(front);

  const rings = [0.63, 0.88].map((radius, index) => {
    const wave = ring(front, radius, 0.055 - index * 0.013, index ? faultLight : edgeLight, 10, -Math.PI * 0.03, Math.PI * 1.06);
    wave.rotation.set(Math.PI / 2, 0, index * 0.04);
    wave.position.y = 0.045 + index * 0.005;
    return wave;
  });
  const fissures = Array.from({ length: 7 }, (_, index) => {
    const crack = new THREE.Group();
    crack.rotation.y = (index - 3) * 0.23;
    front.add(crack);
    const seam = mesh(crack, CUBE, faultLight);
    seam.position.set(0, 0.022, 0.29);
    seam.scale.set(0.026, 0.016, 0.46 + (index % 3) * 0.09);
    const branch = mesh(crack, CUBE, edgeLight);
    branch.position.set(index % 2 ? -0.073 : 0.073, 0.03, 0.48);
    branch.rotation.y = index % 2 ? -0.46 : 0.46;
    branch.scale.set(0.019, 0.013, 0.33);
    return crack;
  });
  const stones = Array.from({ length: 10 }, () => mesh(front, SHARD, stoneLight));

  function update({ distance, progress, contact }) {
    const { charge, travel, fade } = phase(progress, contact);
    const impact = clamp((progress - contact) / (1 - contact), 0, 1);
    const buildup = smoothstep(progress, contact * 0.55, contact);
    front.position.z = lerp(0.54, Math.max(0.74, distance - 0.59), travel);
    faultLight.opacity = fade * (0.19 + buildup * 0.72) * charge;
    edgeLight.opacity = fade * (0.28 + buildup * 0.65) * charge;
    stoneLight.opacity = (1 - impact) * 0.95;
    rings.forEach((wave, index) => {
      wave.scale.setScalar(0.3 + charge * 0.5 + impact * (0.6 + index * 0.24));
    });
    fissures.forEach((crack, index) => {
      crack.visible = progress >= contact * 0.6;
      crack.scale.setScalar(0.1 + buildup * (0.58 + index % 3 * 0.09) + impact * 0.15);
    });
    stones.forEach((stone, index) => {
      const angle = (index + 0.5) / stones.length * Math.PI - Math.PI / 2;
      const radius = 0.17 + impact * (0.76 + index % 3 * 0.21);
      stone.visible = progress >= contact;
      stone.position.set(Math.sin(angle) * radius, 0.035 + Math.sin(impact * Math.PI) * (0.26 + index % 4 * 0.13), Math.cos(angle) * radius);
      stone.rotation.set(index + impact * 3, impact * 3.6, index * 0.7 - impact * 4);
      stone.scale.setScalar((0.055 + index % 3 * 0.024) * (1 - impact * 0.65));
    });
  }
  return { object, update };
}

function createWind(color) {
  const object = new THREE.Group();
  const outer = light(color);
  const edge = light(0xe4faff);
  const arcs = Array.from({ length: 4 }, (_, index) => {
    const arc = mesh(object, new THREE.TorusGeometry(0.54, 0.022 - index * 0.003, 5, 28, TAU * 0.65), index % 2 ? outer : edge);
    arc.rotation.y = 0.52 - index * 0.24;
    return arc;
  });
  const flecks = Array.from({ length: 10 }, () => mesh(object, SHARD, edge));
  function update({ distance, progress, contact }) {
    const { charge, travel, recovery, fade } = phase(progress, contact);
    const head = lerp(0.49, Math.max(0.78, distance - 0.57), travel) + recovery * 0.33;
    const radius = 0.63 + travel * 0.51 + recovery * 0.17;
    edge.opacity = charge * fade * 0.81;
    outer.opacity = charge * fade * 0.72;
    arcs.forEach((arc, index) => {
      arc.position.set(Math.sin(index + progress * 8) * 0.08, 0.97 + (index - 1.5) * 0.1, head - index * (0.11 + travel * 0.14));
      arc.rotation.z = -progress * 12 + index * 1.64;
      arc.scale.setScalar(radius * (1 - index * 0.09));
    });
    flecks.forEach((fleck, index) => {
      const angle = index * 2.399 - progress * 11;
      const lag = (index % 4) * (0.09 + travel * 0.12);
      fleck.position.set(Math.cos(angle) * radius * 0.48, 1.02 + Math.sin(angle) * radius * 0.45, head - lag);
      fleck.rotation.z = angle;
      fleck.scale.set(0.017, 0.018, (0.1 + index % 3 * 0.034) * charge);
    });
  }
  return { object, update };
}

function createShield(color) {
  const object = new THREE.Group();
  const face = light(color);
  const rim = light(0xffdd9c);
  const trace = light(0xffa969);
  const plate = new THREE.Group();
  object.add(plate);
  mesh(plate, new THREE.CircleGeometry(0.66, 6, Math.PI / 6), face);
  ring(plate, 0.67, 0.055, rim, 6, Math.PI / 6).position.z = 0.014;
  ring(plate, 0.54, 0.019, trace, 6, Math.PI / 6).position.z = 0.02;
  for (let index = 0; index < 7; index++) {
    const tile = ring(plate, 0.143, 0.013, rim, 6, Math.PI / 6);
    const angle = index / 6 * TAU;
    const radius = index === 6 ? 0 : 0.243;
    tile.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.028);
  }
  const edge = ring(object, 0.65, 0.024, trace, 6, Math.PI / 6);
  function update({ distance, progress, contact }) {
    const { charge, travel, recovery, fade } = phase(progress, contact);
    const size = (0.36 + 0.68 * charge) * (1 + recovery * 0.18);
    plate.position.set(0, 1.06 - travel * 0.12, lerp(0.53, Math.max(0.74, distance - 0.64), travel));
    plate.rotation.x = -0.11 + 0.17 * travel;
    plate.rotation.y = 0.47 + 0.14 * travel;
    plate.scale.setScalar(size);
    edge.position.copy(plate.position);
    edge.position.z -= 0.11 + recovery * 0.18;
    edge.rotation.copy(plate.rotation);
    edge.scale.setScalar(size * 1.11);
    face.opacity = charge * fade * (0.12 + travel * 0.16);
    rim.opacity = charge * fade * 0.95;
    trace.opacity = charge * fade * 0.75;
  }
  return { object, update };
}

function createRewind(color) {
  const object = new THREE.Group();
  const brass = light(color);
  const inner = light(0xcbb5ff);
  const handsLight = light(0xfff1cf);
  const dial = new THREE.Group();
  object.add(dial);
  ring(dial, 0.73, 0.031, brass);
  const sweep = ring(dial, 0.61, 0.021, inner, 42, Math.PI * 0.2, TAU * 0.76);
  for (let index = 0; index < 12; index++) {
    const angle = index / 12 * TAU;
    const tick = mesh(dial, CUBE, brass);
    tick.position.set(Math.sin(angle) * 0.655, Math.cos(angle) * 0.655, 0.013);
    tick.rotation.z = -angle;
    tick.scale.set(0.026, index % 3 === 0 ? 0.116 : 0.069, 0.017);
  }
  const hands = [0.39, 0.53].map((length, index) => {
    const hand = new THREE.Group();
    const needle = mesh(hand, CUBE, handsLight);
    needle.position.set(0, length * 0.37, 0.022);
    needle.scale.set(index === 0 ? 0.056 : 0.028, length, 0.022);
    dial.add(hand);
    return hand;
  });
  const echo = ring(object, 0.73, 0.02, inner);
  function update({ distance, progress, contact }) {
    const { charge, travel, recovery, fade } = phase(progress, contact);
    dial.position.set(0, 1.12 + recovery * 0.09, lerp(0.73, Math.max(0.8, distance - 0.69), travel));
    dial.rotation.y = 0.68;
    dial.scale.setScalar(0.42 + charge * 0.58 + recovery * 0.2);
    echo.position.copy(dial.position);
    echo.position.z -= 0.16 + recovery * 0.16;
    echo.rotation.y = dial.rotation.y;
    echo.scale.setScalar(dial.scale.x * (0.87 + recovery * 0.38));
    hands[0].rotation.z = 0.25 + progress * 2.1 + recovery * 1.8;
    hands[1].rotation.z = 1.12 + progress * 7.8 + recovery * 4.2;
    sweep.rotation.z = -progress * 7.5;
    brass.opacity = charge * fade * 0.91;
    inner.opacity = charge * fade * 0.68;
    handsLight.opacity = charge * fade * 0.95;
  }
  return { object, update };
}

function createGrove(color) {
  const object = new THREE.Group();
  const stalkLight = light(0x73b852);
  const tipLight = light(color);
  const sprout = new THREE.Group();
  object.add(sprout);
  const segments = 26;
  const radialSegments = 5;
  const vines = [-1, 0, 1].map(side => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.09, 0.025, 0),
      new THREE.Vector3(side * 0.38, 0.055, 0.31),
      new THREE.Vector3(side * 0.19, 0.20, 0.65),
      new THREE.Vector3(side * 0.42, 0.52, 0.87),
      new THREE.Vector3(side * 0.18, 0.79 + (side === 0 ? 0.23 : 0), 1),
    ]);
    const stem = mesh(sprout, new THREE.TubeGeometry(curve, segments, 0.04, radialSegments), side === 0 ? tipLight : stalkLight);
    const leaves = [0.36, 0.55, 0.72, 0.86, 0.96].map((offset, index) => {
      const leaf = mesh(sprout, LEAF, index % 2 ? stalkLight : tipLight);
      leaf.position.copy(curve.getPointAt(offset));
      leaf.rotation.set(0.27, (index % 2 ? -1 : 1) * 0.72, 0.7 * (side || 1));
      return { leaf, offset };
    });
    return { stem, leaves };
  });
  function update({ distance, progress, contact }) {
    const { charge, travel, recovery, fade } = phase(progress, contact);
    sprout.position.z = 0.37;
    sprout.scale.set(1 + recovery * 0.23, 0.85 + recovery * 0.12, Math.max(0.46, distance - 0.49));
    stalkLight.opacity = charge * fade * 0.9;
    tipLight.opacity = charge * fade * 0.95;
    for (const { stem, leaves } of vines) {
      stem.geometry.setDrawRange(0, Math.ceil(travel * segments) * radialSegments * 6);
      for (const { leaf, offset } of leaves) {
        const bloom = smoothstep(travel, offset - 0.1, offset + 0.04);
        leaf.visible = bloom > 0.005;
        leaf.scale.set(bloom * 0.14, bloom * 0.044, bloom * 0.075);
      }
    }
  }
  return { object, update };
}

function createMagnet(color) {
  const object = new THREE.Group();
  const cyan = light(color);
  const amber = light(0xffd28b);
  const strands = new THREE.Group();
  object.add(strands);
  const coils = Array.from({ length: 6 }, (_, index) => {
    const points = Array.from({ length: 17 }, (_, step) => {
      const t = step / 16;
      const theta = index / 6 * TAU + t * Math.PI * 2.35;
      const bow = Math.sin(Math.PI * t);
      const radius = 0.16 + bow * (index % 2 ? 0.4 : 0.52);
      return new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius * 0.81, t);
    });
    const curve = new THREE.CatmullRomCurve3(points);
    const line = mesh(strands, new THREE.TubeGeometry(curve, 32, index % 2 ? 0.013 : 0.019, 5), index % 2 ? amber : cyan);
    return { line, curve };
  });
  const nodes = Array.from({ length: 12 }, (_, index) => mesh(strands, LEAF, index % 2 ? amber : cyan));
  const emitter = ring(object, 0.47, 0.04, cyan, 30, 0.2, TAU * 0.77);
  emitter.position.set(0, 1.02, 0.48);
  const attractor = ring(object, 0.46, 0.037, amber, 30, 0.2, TAU * 0.77);
  function update({ distance, progress, contact }) {
    const { charge, travel, fade } = phase(progress, contact);
    const length = Math.max(0.38, distance - 0.73);
    strands.position.set(0, 1.02, 0.54);
    strands.scale.set(0.56 + charge * 0.44, 0.56 + charge * 0.44, length);
    strands.rotation.z = progress * 4.2;
    cyan.opacity = charge * fade * 0.93;
    amber.opacity = charge * fade * 0.86;
    for (const { line } of coils) line.geometry.setDrawRange(0, Math.ceil(travel * 32) * 30);
    nodes.forEach((node, index) => {
      const t = (progress * 2.35 + index * 0.263) % 1;
      node.visible = t <= travel;
      coils[index % coils.length].curve.getPoint(t, node.position);
      node.scale.set(0.044, 0.044, 0.075);
      node.rotation.z = index + progress * 10;
    });
    emitter.rotation.z = -progress * 8;
    emitter.scale.setScalar(0.58 + charge * 0.43);
    attractor.visible = travel > 0.72;
    attractor.position.set(0, 1.02, 0.54 + length);
    attractor.rotation.z = progress * 9;
    attractor.scale.setScalar(0.68 + travel * 0.42);
  }
  return { object, update };
}

const effects = {
  giant: createGiant,
  wind: createWind,
  shield: createShield,
  rewind: createRewind,
  grove: createGrove,
  magnet: createMagnet,
};

export function createOtherPowerEffect(id, color) {
  return Object.hasOwn(effects, id) ? effects[id](color) : null;
}
