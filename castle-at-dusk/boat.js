import * as THREE from 'three';

const lakeLevel = -5.5;
const berths = {
  castle: { x: 5.67, z: 19.55 },
  shore: { x: 22.46, z: -9.0365 },
};

const channel = new THREE.CatmullRomCurve3([
  [berths.castle.x, berths.castle.z], [11.8, 19.65], [16.1, 19.4], [18.6, 16.3],
  [18.6, 12.6], [18.75, 7.2], [19.55, 1.15], [19.65, -5.9], [20.7, -8.96],
  [berths.shore.x, berths.shore.z],
].map(([x, z]) => new THREE.Vector3(x, lakeLevel, z)));

const channelLength = channel.getLength();
const channelSamples = channel.getSpacedPoints(Math.ceil(channelLength / .34));
const moveKeys = {
  KeyW: 'forward', ArrowUp: 'forward', KeyS: 'reverse', ArrowDown: 'reverse',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
};
const tau = 2 * Math.PI;
const angleBetween = (to, from) => THREE.MathUtils.euclideanModulo(to - from + Math.PI, tau) - Math.PI;

function closestChannelPoint(x, z) {
  let index = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < channelSamples.length; i++) {
    const point = channelSamples[i];
    const distance = (x - point.x) ** 2 + (z - point.z) ** 2;
    if (distance >= bestDistance) continue;
    index = i;
    bestDistance = distance;
  }
  return { fraction: index / (channelSamples.length - 1), distance: Math.sqrt(bestDistance) };
}

// Rasterize the existing shoreline and rocks at the boat's draft. The same mesh
// that the player sees supplies the collision outline, including small skerries.
function createWaterGrid(environment) {
  const limit = 58;
  const unit = .40;
  const size = Math.ceil(2 * limit / unit);
  const blocked = new Uint8Array(size * size);
  const draft = lakeLevel - .16;
  const matrix = new THREE.Matrix4();
  const world = new THREE.Matrix4();
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const solidNames = new Set([
    'Stratified limestone island', 'Fractured shore outcrops', 'Rocky lake bank',
    'Boulders around the bays', 'Open wooden skiff', 'Cliff stair foundation',
    'Landing piles', 'Weathered timber landing', 'Fisher hut, jetty and skiff trim',
  ]);
  const indexOf = value => Math.floor((value + limit) / unit);

  function raster(a, b, c) {
    const minX = Math.max(0, indexOf(Math.min(a.x, b.x, c.x) - .14));
    const maxX = Math.min(size - 1, indexOf(Math.max(a.x, b.x, c.x) + .14));
    const minZ = Math.max(0, indexOf(Math.min(a.z, b.z, c.z) - .14));
    const maxZ = Math.min(size - 1, indexOf(Math.max(a.z, b.z, c.z) + .14));
    const ax = b.x - a.x;
    const az = b.z - a.z;
    const bx = c.x - b.x;
    const bz = c.z - b.z;
    const cx = a.x - c.x;
    const cz = a.z - c.z;
    const area = ax * bz - az * bx;
    if (Math.abs(area) < .00001) return;
    const sign = Math.sign(area);
    const e1 = -.26 * Math.hypot(ax, az);
    const e2 = -.26 * Math.hypot(bx, bz);
    const e3 = -.26 * Math.hypot(cx, cz);
    for (let j = minZ; j <= maxZ; j++) {
      const z = (j + .5) * unit - limit;
      for (let i = minX; i <= maxX; i++) {
        if (blocked[i + j * size]) continue;
        const x = (i + .5) * unit - limit;
        if (sign * (ax * (z - a.z) - az * (x - a.x)) < e1) continue;
        if (sign * (bx * (z - b.z) - bz * (x - b.x)) < e2) continue;
        if (sign * (cx * (z - c.z) - cz * (x - c.x)) < e3) continue;
        blocked[i + j * size] = 1;
      }
    }
  }

  function addTriangle() {
    const polygon = [];
    for (let i = 0; i < 3; i++) {
      const a = points[i];
      const b = points[(i + 1) % 3];
      if (a.y >= draft) polygon.push(a);
      if ((a.y < draft) !== (b.y < draft)) {
        const t = (draft - a.y) / (b.y - a.y);
        polygon.push({ x: THREE.MathUtils.lerp(a.x, b.x, t), z: THREE.MathUtils.lerp(a.z, b.z, t) });
      }
    }
    for (let i = 1; i < polygon.length - 1; i++) raster(polygon[0], polygon[i], polygon[i + 1]);
  }

  environment.updateMatrixWorld(true);
  environment.traverse(object => {
    if (!object.isMesh || (!solidNames.has(object.name) && !/footbridge|boardwalk/i.test(object.name))) return;
    const geometry = object.geometry;
    const positions = geometry.attributes.position;
    const indices = geometry.index;
    const count = indices ? indices.count : positions.count;
    const copies = object.isInstancedMesh ? object.count : 1;
    for (let copy = 0; copy < copies; copy++) {
      world.copy(object.matrixWorld);
      if (object.isInstancedMesh) {
        object.getMatrixAt(copy, matrix);
        world.multiply(matrix);
      }
      for (let i = 0; i < count; i += 3) {
        for (let j = 0; j < 3; j++) points[j].fromBufferAttribute(positions, indices ? indices.getX(i + j) : i + j).applyMatrix4(world);
        if (points[0].y >= draft && points[1].y >= draft && points[2].y >= draft) raster(...points);
        else if (points.some(point => point.y >= draft)) addTriangle();
      }
    }
  });

  return (x, z) => {
    const col = indexOf(x);
    const row = indexOf(z);
    return col < 0 || row < 0 || col >= size || row >= size || blocked[col + row * size] !== 0;
  };
}

const hullProbes = [
  [0, -1.41], [-.27, -1.08], [.27, -1.08], [-.54, -.55], [.54, -.55],
  [0, 0], [-.59, .12], [.59, .12], [-.53, .67], [.53, .67], [-.28, 1.18], [.28, 1.18], [0, 1.42],
];

function meshFromFaces(positions, colors, material) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function makeHull() {
  const group = new THREE.Group();
  group.name = 'Playable hand-built rowboat';
  const stations = [
    [-1.58, 0, .56, .03], [-1.35, .239, .42, -.11], [-.91, .466, .34, -.21],
    [-.38, .609, .30, -.245], [.22, .638, .30, -.25], [.76, .579, .31, -.205],
    [1.23, .365, .36, -.11], [1.52, 0, .40, .01],
  ];
  const planks = ['#463931', '#654432', '#835741', '#9b694b', '#93664c'].map(color => new THREE.Color(color));
  const positions = [];
  const colors = [];
  const hullMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .87 });
  const wood = new THREE.MeshStandardMaterial({ color: '#946a4c', roughness: .83 });
  const trim = new THREE.MeshStandardMaterial({ color: '#513a32', roughness: .79 });
  const grain = new THREE.MeshStandardMaterial({ color: '#6f4f3d', roughness: .92 });
  const metal = new THREE.MeshStandardMaterial({ color: '#6d584a', roughness: .50, metalness: .36 });
  const cube = new THREE.BoxGeometry();

  function panel(a, b, c, d, color) {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b);
  }

  function box(material, x, y, z, sx, sy, sz) {
    const object = new THREE.Mesh(cube, material);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    group.add(object);
    return object;
  }

  const contour = [[.40, 0], [.67, .32], [.84, .56], [.94, .79], [1, 1]];
  const contourPoint = ([z, width, rail, keel], side, [x, y]) => [side * width * x, THREE.MathUtils.lerp(keel, rail, y), z];
  const railPath = side => new THREE.CatmullRomCurve3(stations.map(([z, width, rail]) => new THREE.Vector3(side * width, rail, z)));
  for (const side of [-1, 1]) {
    for (let i = 1; i < stations.length; i++) {
      for (let j = 1; j < contour.length; j++) {
        const color = planks[j - 1].clone().multiplyScalar(1 + .09 * Math.sin(i * 4.3 + j * 3.5));
        panel(contourPoint(stations[i - 1], side, contour[j - 1]), contourPoint(stations[i], side, contour[j - 1]),
          contourPoint(stations[i], side, contour[j]), contourPoint(stations[i - 1], side, contour[j]), color);
      }
    }
    group.add(new THREE.Mesh(new THREE.TubeGeometry(railPath(side), 34, .037, 6, false), trim));
    const rubbingStrake = new THREE.CatmullRomCurve3(stations.map(([z, width, rail]) => new THREE.Vector3(side * width * .959, rail - .091, z)));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(rubbingStrake, 32, .018, 5, false), grain));
  }

  function floorEdge([z, width, rail, keel], side) {
    const height = .062;
    const fraction = THREE.MathUtils.clamp((height - keel) / (rail - keel), 0, 1);
    const segment = contour.findIndex(([, end], index) => index && fraction <= end);
    const [startWidth, startY] = contour[segment - 1];
    const [endWidth, endY] = contour[segment];
    const halfWidth = THREE.MathUtils.lerp(startWidth, endWidth, (fraction - startY) / (endY - startY));
    return [side * width * halfWidth, height, z];
  }

  for (let i = 1; i < stations.length; i++) {
    panel(contourPoint(stations[i - 1], -1, contour[0]), contourPoint(stations[i - 1], 1, contour[0]),
      contourPoint(stations[i], 1, contour[0]), contourPoint(stations[i], -1, contour[0]), planks[0]);
    panel(floorEdge(stations[i - 1], -1), floorEdge(stations[i], -1), floorEdge(stations[i], 1),
      floorEdge(stations[i - 1], 1), planks[2 + i % 2]);
  }
  group.add(meshFromFaces(positions, colors, hullMaterial));

  for (const [x, width] of [[-.17, .104], [0, .196], [.17, .104]]) {
    box(grain, x, .067, -.075, width, .015, 1.64);
  }
  for (const [z, span] of [[-.69, .90], [.16, 1.14], [.94, .86]]) {
    box(wood, 0, .22, z, span, .067, .235);
    box(grain, 0, .181, z, span * .94, .027, .254);
    for (const side of [-1, 1]) box(metal, side * span * .43, .258, z, .033, .008, .038);
  }
  box(trim, 0, .304, -1.579, .072, .543, .062);
  box(trim, 0, .221, 1.516, .071, .412, .059);

  const oars = [-1, 1].map(side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * .563, .343, -.55);
    group.add(pivot);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.022, .027, 1.76, 8), wood);
    shaft.position.y = .455;
    pivot.add(shaft);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(.035, .036, .19, 9), trim);
    handle.position.y = -.39;
    pivot.add(handle);
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-.045, 1.10);
    bladeShape.quadraticCurveTo(-.112, 1.23, -.146, 1.53);
    bladeShape.quadraticCurveTo(-.12, 1.64, .105, 1.64);
    bladeShape.quadraticCurveTo(.162, 1.61, .152, 1.49);
    bladeShape.quadraticCurveTo(.101, 1.24, .047, 1.10);
    bladeShape.closePath();
    const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bladeShape, { depth: .032, bevelEnabled: false, curveSegments: 6 }), wood);
    blade.position.z = -.016;
    pivot.add(blade);
    const socket = new THREE.Mesh(new THREE.TorusGeometry(.052, .015, 5, 12), metal);
    socket.position.copy(pivot.position);
    socket.rotation.y = Math.PI / 2;
    group.add(socket);
    return { pivot, side };
  });
  return { group, oars };
}

function makeChannelLights() {
  const float = new THREE.SphereGeometry(.142, 10, 6);
  const shaft = new THREE.CylinderGeometry(.02, .026, .22, 6);
  const lens = new THREE.SphereGeometry(.048, 8, 5);
  const copper = new THREE.MeshStandardMaterial({ color: '#885b3e', roughness: .83 });
  const wood = new THREE.MeshStandardMaterial({ color: '#65533e', roughness: .90 });
  const lamp = new THREE.MeshStandardMaterial({ color: '#e5aa61', emissive: '#f3a24f', emissiveIntensity: 1.65 });
  return [.16, .31, .47, .62, .76, .88].map((fraction, index) => {
    const center = channel.getPointAt(fraction);
    const tangent = channel.getTangentAt(fraction);
    const offset = (index % 2 ? 1 : -1) * 1.12;
    const marker = new THREE.Group();
    marker.name = 'Floating amber channel marker';
    marker.position.set(center.x + tangent.z * offset, lakeLevel, center.z - tangent.x * offset);
    const buoy = new THREE.Mesh(float, copper);
    buoy.scale.y = .54;
    const mast = new THREE.Mesh(shaft, wood);
    mast.position.y = .14;
    const light = new THREE.Mesh(lens, lamp);
    light.position.y = .268;
    marker.add(buoy, mast, light);
    return marker;
  });
}

function makeWake(group) {
  const geometry = new THREE.RingGeometry(.83, 1, 22);
  const ripples = Array.from({ length: 12 }, () => {
    const material = new THREE.MeshBasicMaterial({ color: '#adc1c6', transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    group.add(mesh);
    return { mesh, age: Infinity };
  });
  let next = 0;

  return {
    emit(x, z) {
      const ripple = ripples[next];
      next = (next + 1) % ripples.length;
      ripple.age = 0;
      ripple.mesh.position.set(x, lakeLevel + .018, z);
      ripple.mesh.visible = true;
    },
    update(delta) {
      for (const ripple of ripples) {
        if (!ripple.mesh.visible) continue;
        ripple.age += delta;
        if (ripple.age >= 1.45) {
          ripple.mesh.visible = false;
          continue;
        }
        ripple.mesh.scale.setScalar(.12 + ripple.age * .49);
        ripple.mesh.material.opacity = .24 * (1 - ripple.age / 1.45) ** 1.45;
      }
    },
  };
}

export function createBoatMode({ camera, canvas, environment }) {
  const group = new THREE.Group();
  group.name = 'Rowboat, oars and navigable lake channel';
  const hull = makeHull();
  const markers = makeChannelLights();
  group.add(hull.group, ...markers);
  const wake = makeWake(group);
  const waterBlocked = createWaterGrid(environment);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const keyboard = new Set();
  const touch = new Set();
  const oarAxis = new THREE.Vector3(0, 1, 0);
  const oarHeading = new THREE.Vector3();
  const seat = new THREE.Vector3();
  const angles = new THREE.Euler(0, 0, 0, 'YXZ');

  let active = false;
  let parked = 'shore';
  let target = 'castle';
  let routeSign = -1;
  let x = berths.shore.x;
  let z = berths.shore.z;
  let heading = Math.PI / 2;
  let speed = 0;
  let viewYaw = 0;
  let viewPitch = -.12;
  let manualGrace = 0;
  let stroke = 0;
  let effort = 0;
  let clock = 0;
  let pointer;
  let pointerX;
  let pointerY;

  function canOccupy(nextX, nextZ, nextHeading) {
    const sin = Math.sin(nextHeading);
    const cos = Math.cos(nextHeading);
    for (const [u, v] of hullProbes) {
      if (waterBlocked(nextX + cos * u + sin * v, nextZ + cos * v - sin * u)) return false;
    }
    return true;
  }

  function availableDock() {
    if (!active) return null;
    for (const [name, berth] of Object.entries(berths)) {
      if (Math.hypot(x - berth.x, z - berth.z) <= 1.45) return name;
    }
    return null;
  }

  function clearInput() {
    keyboard.clear();
    touch.clear();
    if (pointer !== undefined && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
    pointer = undefined;
  }

  function isPressed(direction) {
    for (const code of keyboard) if (moveKeys[code] === direction) return true;
    return touch.has(direction);
  }

  function updateGeometry(time, delta) {
    const waves = reducedMotion.matches ? 0 : 1;
    hull.group.position.set(x, lakeLevel + waves * (.018 * Math.sin(time * 2.17 + x * .27) + .014 * Math.cos(time * 1.31 + z * .21)), z);
    const roll = waves * (.015 * Math.sin(time * 1.47) + effort * .012 * Math.sin(stroke * tau));
    hull.group.rotation.set(waves * .014 * Math.sin(time * 1.89 + 1.3), heading, roll, 'YXZ');
    for (const { pivot, side } of hull.oars) {
      const phase = stroke * tau + (side > 0 ? .08 : 0);
      oarHeading.set(side * 1.37, -.025 - effort * .38 * Math.cos(phase), -.37 + effort * .62 * Math.sin(phase));
      pivot.quaternion.setFromUnitVectors(oarAxis, oarHeading.normalize());
    }
    markers.forEach((marker, index) => {
      marker.position.y = lakeLevel + waves * Math.sin(time * 1.72 + index * 1.33) * .036;
      marker.rotation.z = waves * .071 * Math.sin(time * 1.42 + index * .84);
    });
    wake.update(delta);
    if (!active) return;
    seat.set(0, 1.08, .58).applyQuaternion(hull.group.quaternion).add(hull.group.position);
    camera.position.copy(seat);
    camera.quaternion.setFromEuler(angles.set(viewPitch, heading + viewYaw, roll * .5));
  }

  function moor(name) {
    clearInput();
    const berth = berths[name];
    x = berth.x;
    z = berth.z;
    heading = name === 'shore' ? Math.PI / 2 : -Math.PI / 2;
    speed = 0;
    effort = 0;
    active = false;
    parked = name;
    updateGeometry(0, 0);
  }

  function routeAhead(lookAhead, fraction) {
    return channel.getPointAt(THREE.MathUtils.clamp(fraction + routeSign * lookAhead / channelLength, 0, 1));
  }

  function advance(delta) {
    const forward = Number(isPressed('forward')) - Number(isPressed('reverse'));
    const steer = Number(isPressed('left')) - Number(isPressed('right'));
    const turnView = Number(keyboard.has('KeyQ')) - Number(keyboard.has('KeyE'));
    viewYaw += turnView * 1.65 * delta;
    manualGrace = steer ? 1.3 : Math.max(0, manualGrace - delta);
    const nearest = closestChannelPoint(x, z);
    const assisted = forward > 0 && !steer && !manualGrace && nearest.distance < 3.3;
    const berth = berths[target];
    const remaining = Math.hypot(x - berth.x, z - berth.z);
    let throttle = forward;
    let turn = steer * (1.08 + Math.min(Math.abs(speed), 3) * .17);
    if (assisted) {
      const aim = routeAhead(1.10 + Math.abs(speed) * .27, nearest.fraction);
      const ideal = Math.atan2(x - aim.x, z - aim.z);
      const error = angleBetween(ideal, heading);
      turn = THREE.MathUtils.clamp(error * 3.6, -1.72, 1.72);
      throttle *= Math.max(.05, Math.cos(error));
      throttle *= Math.min(1, .13 + remaining * .31);
    }
    const targetSpeed = (throttle >= 0 ? 3.85 : 1.58) * throttle;
    speed = THREE.MathUtils.damp(speed, targetSpeed, throttle ? 2.12 : 2.72, delta);
    if (assisted && remaining < .16) speed = 0;

    const subdivisions = Math.max(1, Math.ceil(delta / .012));
    const stepTime = delta / subdivisions;
    for (let i = 0; i < subdivisions; i++) {
      const nextHeading = heading + turn * stepTime;
      if (canOccupy(x, z, nextHeading)) heading = nextHeading;
      const dx = -Math.sin(heading) * speed * stepTime;
      const dz = -Math.cos(heading) * speed * stepTime;
      if (!canOccupy(x + dx, z + dz, heading)) {
        speed = 0;
        break;
      }
      x += dx;
      z += dz;
    }

    effort = THREE.MathUtils.damp(effort, forward ? .96 : steer ? .58 : 0, 4.8, delta);
    const last = Math.floor(stroke + .72);
    stroke += delta * effort * (forward ? 1.06 : .78);
    if (effort > .30 && Math.floor(stroke + .72) !== last) {
      for (const side of [-1, 1]) wake.emit(x + side * Math.cos(heading) * 1.78, z - side * Math.sin(heading) * 1.78);
    }
  }

  window.addEventListener('keydown', event => {
    if (!active || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!Object.hasOwn(moveKeys, event.code) && event.code !== 'KeyQ' && event.code !== 'KeyE') return;
    event.preventDefault();
    keyboard.add(event.code);
  });
  window.addEventListener('keyup', event => { keyboard.delete(event.code); });
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInput(); });
  canvas.addEventListener('pointerdown', event => {
    if (!active || pointer !== undefined || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(pointer);
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointermove', event => {
    if (!active || event.pointerId !== pointer) return;
    const scale = event.pointerType === 'touch' ? .0054 : .0037;
    viewYaw -= (event.clientX - pointerX) * scale;
    viewPitch = THREE.MathUtils.clamp(viewPitch - (event.clientY - pointerY) * scale, -1.12, 1.15);
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(eventName, event => { if (event.pointerId === pointer) pointer = undefined; });
  }

  moor('shore');
  return {
    group,
    get dock() { return parked; },
    get nearDock() { return availableDock(); },
    get guidance() {
      const nearest = closestChannelPoint(x, z);
      const aim = routeAhead(1.6, nearest.fraction);
      const ideal = Math.atan2(x - aim.x, z - aim.z);
      return {
        target,
        distance: (routeSign > 0 ? 1 - nearest.fraction : nearest.fraction) * channelLength + nearest.distance,
        bearing: angleBetween(heading + viewYaw, ideal),
      };
    },
    canBoard(name) { return !active && name === parked; },
    enter(name) {
      if (active || name !== parked) return false;
      clearInput();
      active = true;
      parked = null;
      target = name === 'castle' ? 'shore' : 'castle';
      routeSign = name === 'castle' ? 1 : -1;
      heading = routeSign > 0 ? -Math.PI / 2 : Math.PI / 2;
      viewYaw = 0;
      viewPitch = -.12;
      manualGrace = 0;
      updateGeometry(clock, 0);
      return true;
    },
    exit() {
      const berth = availableDock();
      if (berth) moor(berth);
      return berth;
    },
    park(name = 'shore') { moor(name); },
    setMove(code, pressed) {
      const direction = moveKeys[code] ?? code;
      if (pressed && active) touch.add(direction);
      else touch.delete(direction);
    },
    clearInput,
    update(time, delta) {
      const elapsed = THREE.MathUtils.clamp(delta, 0, .08);
      clock = time;
      if (active) advance(elapsed);
      updateGeometry(time, elapsed);
    },
  };
}
