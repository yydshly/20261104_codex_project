import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const crankCenter = -1.58;
const crankRadius = 0.48;
const rodLength = 1.35;
const pistonTopOffset = 0.23;
const chamberRoof = 0.73;
const front = new THREE.Vector3(0, 0, 1);

export function createEngine(viewport, labels) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 35);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.domElement.setAttribute('aria-label', '发动机三维视图，可拖动旋转');
  viewport.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 4.3;
  controls.maxDistance = 12.5;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = 2.05;
  controls.zoomSpeed = 0.8;
  let section = true;

  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = generator.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.82;
  room.dispose();
  generator.dispose();
  scene.add(new THREE.HemisphereLight(0xe5ffe7, 0x50634c, 1.6));
  const key = new THREE.DirectionalLight(0xf1f6df, 3.1);
  key.position.set(-4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb2f0b1, 2.2);
  rim.position.set(4, 2, -4);
  scene.add(rim);

  const assembly = new THREE.Group();
  scene.add(assembly);
  const shell = new THREE.Group();
  assembly.add(shell);
  const head = new THREE.Group();
  const headCover = new THREE.Group();
  assembly.add(head);
  shell.add(headCover);

  const alloy = material(0x58675f, 0.64, 0.36);
  const edge = material(0x84938a, 0.72, 0.32);
  const dark = material(0x252f2a, 0.45, 0.39);
  const steel = material(0xc6d1c9, 0.76, 0.26);
  const bronze = material(0xbe935c, 0.68, 0.33);
  const mint = material(0xa5d9a9, 0.37, 0.28);
  const copper = material(0xc98463, 0.47, 0.35);
  const porcelain = material(0xe2e6d9, 0.08, 0.28);
  const gasMaterial = new THREE.MeshBasicMaterial({ color: 0xa6f5b4, transparent: true, opacity: .2, depthWrite: false });

  function material(color, metalness, roughness) {
    return new THREE.MeshStandardMaterial({ color, metalness, roughness });
  }
  function mesh(parent, geometry, surface, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  }
  function box(parent, width, height, depth, surface, x, y, z) {
    return mesh(parent, new THREE.BoxGeometry(width, height, depth), surface, x, y, z);
  }
  function cylinder(parent, radius, height, surface, x, y, z) {
    return mesh(parent, new THREE.CylinderGeometry(radius, radius, height, 48), surface, x, y, z);
  }
  function disk(parent, radius, depth, surface, x, y, z) {
    const object = cylinder(parent, radius, depth, surface, x, y, z);
    object.rotation.x = Math.PI / 2;
    return object;
  }
  function ring(parent, radius, thickness, surface, x, y, z) {
    return mesh(parent, new THREE.TorusGeometry(radius, thickness, 10, 48), surface, x, y, z);
  }
  function arc(parent, inner, outer, height, y, start, end, surface) {
    const path = new THREE.Shape();
    path.moveTo(outer * Math.cos(start), outer * Math.sin(start));
    path.absarc(0, 0, outer, start, end, false);
    path.lineTo(inner * Math.cos(end), inner * Math.sin(end));
    path.absarc(0, 0, inner, end, start, true);
    path.closePath();
    const geometry = new THREE.ExtrudeGeometry(path, { depth: height, bevelEnabled: false, curveSegments: 24 });
    geometry.rotateX(-Math.PI / 2);
    return mesh(parent, geometry, surface, 0, y, 0);
  }

  box(assembly, 2.34, .16, 1.43, dark, 0, -2.69, 0);
  box(assembly, 2.03, .16, 1.24, alloy, 0, -2.55, 0);
  for (const x of [-.92, .92]) {
    box(assembly, .33, .52, .91, alloy, x, -2.27, -.08);
    box(assembly, .14, .57, .64, edge, x, -2.27, .41);
    for (const z of [-.54, .54]) cylinder(assembly, .066, .09, steel, x, -2.44, z);
  }
  disk(assembly, 1.02, .39, dark, 0, crankCenter, -.43);
  ring(assembly, 1.01, .055, alloy, 0, crankCenter, -.19);
  for (const x of [-.86, .86]) {
    box(assembly, .23, 1.37, .42, alloy, x, -1.66, -.26);
  }
  disk(shell, 1.01, .42, alloy, 0, crankCenter, .39);
  ring(shell, .92, .044, edge, 0, crankCenter, .61);
  disk(shell, .49, .09, dark, 0, crankCenter, .65);
  disk(shell, .18, .13, steel, 0, crankCenter, .72);
  for (let bolt = 0; bolt < 8; bolt += 1) {
    const angle = bolt * Math.PI / 4 + Math.PI / 8;
    disk(shell, .052, .055, steel, .85 * Math.cos(angle), crankCenter + .85 * Math.sin(angle), .63);
  }

  arc(assembly, .61, .78, 1.78, -1.04, 0, Math.PI, alloy);
  arc(shell, .61, .78, 1.78, -1.04, Math.PI, 2 * Math.PI, alloy);
  for (let fin = 0; fin < 8; fin += 1) {
    const y = -.92 + fin * .222;
    arc(assembly, .76, .94, .067, y, 0, Math.PI, fin % 2 ? alloy : edge);
    arc(shell, .76, .94, .067, y, Math.PI, 2 * Math.PI, fin % 2 ? alloy : edge);
  }
  arc(assembly, .62, .82, .08, chamberRoof, 0, Math.PI, edge);
  arc(shell, .62, .82, .08, chamberRoof, Math.PI, 2 * Math.PI, edge);
  box(head, 1.68, .49, .66, alloy, 0, 1.01, -.34);
  box(head, 1.75, .14, .74, edge, 0, 1.32, -.32);
  box(headCover, 1.68, .49, .68, alloy, 0, 1.01, .33);
  box(headCover, 1.75, .14, .72, edge, 0, 1.32, .33);
  for (const side of [-1, 1]) {
    box(head, .29, .20, .37, edge, side * .94, 1.02, -.22);
    box(head, .05, .25, .42, dark, side * 1.10, 1.02, -.22);
    for (const z of [-.50, .50]) cylinder(z < 0 ? head : headCover, .06, .11, steel, side * .67, 1.43, z);
  }

  const spark = new THREE.Group();
  spark.position.set(0, .99, .12);
  head.add(spark);
  cylinder(spark, .077, .44, porcelain, 0, .24, 0);
  cylinder(spark, .098, .12, steel, 0, .01, 0);
  cylinder(spark, .027, .20, bronze, 0, -.12, 0);
  const ignition = mesh(spark, new THREE.IcosahedronGeometry(.11, 0), new THREE.MeshBasicMaterial({ color: 0xffdd88 }), 0, -.24, 0);
  ignition.visible = false;

  function valve(x, surface) {
    const part = new THREE.Group();
    part.position.set(x, .80, .09);
    head.add(part);
    cylinder(part, .038, .39, surface, 0, .19, 0);
    cylinder(part, .124, .055, surface, 0, 0, 0);
    cylinder(part, .084, .048, steel, 0, .386, 0);
    const springPoints = [];
    for (let index = 0; index <= 54; index += 1) {
      const t = index / 54;
      const angle = t * Math.PI * 10;
      springPoints.push(new THREE.Vector3(.08 * Math.cos(angle), .12 + .25 * t, .08 * Math.sin(angle)));
    }
    mesh(part, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPoints), 54, .012, 6), steel);
    return part;
  }
  const inlet = valve(-.32, mint);
  const outlet = valve(.32, copper);

  const crank = new THREE.Group();
  crank.position.y = crankCenter;
  assembly.add(crank);
  disk(crank, .77, .13, alloy, 0, 0, -.23);
  ring(crank, .76, .036, steel, 0, 0, -.15);
  disk(crank, .062, .06, mint, -.48, .56, -.113);
  disk(crank, .25, .22, dark, 0, -.30, -.15);
  box(crank, .25, .52, .19, steel, 0, .24, -.12);
  disk(crank, .13, .47, bronze, 0, crankRadius, .02);
  disk(crank, .15, .16, steel, 0, 0, .27);

  const rod = new THREE.Group();
  assembly.add(rod);
  box(rod, .115, rodLength, .105, bronze, 0, 0, .21);
  box(rod, .205, rodLength - .26, .07, bronze, 0, 0, .21);
  disk(rod, .168, .125, bronze, 0, -rodLength / 2, .21);
  disk(rod, .133, .115, bronze, 0, rodLength / 2, .21);
  disk(rod, .090, .10, steel, 0, -rodLength / 2, .26);
  disk(rod, .067, .075, steel, 0, rodLength / 2, .26);

  const piston = new THREE.Group();
  assembly.add(piston);
  cylinder(piston, .589, .38, steel, 0, .037, 0);
  cylinder(piston, .588, .037, edge, 0, .205, 0);
  for (const y of [.18, .12, .054]) cylinder(piston, .596, .022, dark, 0, y, 0);
  disk(piston, .093, .05, dark, 0, 0, .583);
  const wristPin = disk(piston, .055, .88, steel, 0, 0, .165);

  const gas = cylinder(assembly, .595, 1, gasMaterial, 0, 0, 0);
  const particles = new THREE.Group();
  assembly.add(particles);
  const flowMaterial = new THREE.MeshBasicMaterial({ color: 0xb2f5a9 });
  const dots = Array.from({ length: 7 }, () => mesh(particles, new THREE.SphereGeometry(.033, 10, 8), flowMaterial));
  const shadowTexture = makeShadow();
  const shadow = mesh(scene, new THREE.PlaneGeometry(4.8, 3.5), new THREE.MeshBasicMaterial({
    map: shadowTexture, transparent: true, depthWrite: false, opacity: .52,
  }), 0, -2.78, 0);
  shadow.rotation.x = -Math.PI / 2;

  const anchors = {
    head: new THREE.Vector3(.31, .97, .22),
    piston: new THREE.Vector3(.49, 0, .44),
    rod: new THREE.Vector3(0, -1.1, .24),
    crank: new THREE.Vector3(.57, crankCenter - .12, .27),
  };
  const projected = new THREE.Vector3();
  let assemblyProgress = null;

  function adjustAssemblyFraming(entering) {
    camera.position.sub(controls.target).multiplyScalar(entering ? 1.40 : 1 / 1.40);
    controls.target.y += entering ? .24 : -.24;
    camera.position.add(controls.target);
  }

  function render() {
    renderer.render(scene, camera);
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const showLabels = section && assemblyProgress === null && camera.position.dot(front) > 1.2;
    for (const [name, element] of Object.entries(labels)) {
      projected.copy(anchors[name]).project(camera);
      const x = (projected.x + 1) * width / 2;
      const y = (1 - projected.y) * height / 2;
      element.dataset.visible = String(showLabels && x > 20 && x < width - 58 && y > 24 && y < height - 22);
      element.style.left = x + 'px';
      element.style.top = y + 'px';
    }
  }

  function setAngle(degrees, { assemblyAt = null, working = true } = {}) {
    const changeFraming = (assemblyAt === null) !== (assemblyProgress === null);
    assemblyProgress = assemblyAt;
    if (changeFraming) {
      adjustAssemblyFraming(assemblyAt !== null);
      controls.update();
    }
    const cycle = degrees % 720;
    const stroke = Math.floor(cycle / 180);
    const phase = (cycle % 180) / 180;
    const radians = THREE.MathUtils.degToRad(cycle);
    const pinX = crankRadius * Math.sin(radians);
    const pinY = crankCenter + crankRadius * Math.cos(radians);
    const pistonY = pinY + Math.sqrt(rodLength ** 2 - pinX ** 2);
    crank.rotation.z = -radians;
    crank.position.set(0, crankCenter, 0);
    piston.position.set(0, pistonY, 0);
    rod.position.set(pinX / 2, (pinY + pistonY) / 2, 0);
    rod.rotation.z = Math.atan2(pinX, pistonY - pinY);
    anchors.piston.y = pistonY + .09;
    anchors.rod.set(rod.position.x - .08, rod.position.y, .24);
    const lift = Math.sin(Math.PI * phase) * .118;
    inlet.position.y = .80 - (stroke === 0 ? lift : 0);
    outlet.position.y = .80 - (stroke === 3 ? lift : 0);
    ignition.visible = section && working && stroke === 2 && phase < .09;
    ignition.scale.setScalar(1 - phase * 4);
    const pistonTop = pistonY + pistonTopOffset;
    const gasHeight = chamberRoof - pistonTop;
    gas.scale.y = gasHeight;
    gas.position.y = pistonTop + gasHeight / 2;
    gasMaterial.color.setHex([0xa3e8b1, 0x8bcdf4, 0xffb469, 0xca8e78][stroke]);
    gasMaterial.opacity = stroke === 2 ? .32 - phase * .13 : .15;
    gas.visible = section && working;
    particles.visible = section && working && (stroke === 0 || stroke === 3) && lift > .01;
    if (particles.visible) {
      flowMaterial.color.setHex(stroke === 0 ? 0xb6ffb5 : 0xffac85);
      dots.forEach((dot, index) => {
        const t = (phase * 2.3 + index / dots.length) % 1;
        const travel = stroke === 0 ? t : 1 - t;
        const side = stroke === 0 ? -1 : 1;
        dot.position.set(side * (1.19 - .86 * Math.min(1, travel * 1.48)),
          1.03 - .42 * Math.max(0, (travel - .52) / .48), .30);
      });
    }
    head.position.set(0, 0, 0);
    wristPin.position.z = .165;
    if (assemblyAt !== null) {
      const remaining = (start, end) => 1 - THREE.MathUtils.smoothstep(assemblyAt, start, end);
      const shaftAway = remaining(.18, .30);
      crank.position.x -= 1.45 * shaftAway;
      crank.position.y -= .3 * shaftAway;
      crank.position.z += .4 * shaftAway;
      const pairX = 1.38 * remaining(.50, .60);
      const pairY = 1.05 * remaining(.60, .73);
      piston.position.x += pairX;
      piston.position.y += pairY;
      rod.position.x += pairX;
      rod.position.y += pairY;
      wristPin.position.z += .90 * remaining(.31, .49);
      head.position.set(-1.26 * remaining(.78, .88), 1.18 * remaining(.88, .95), 0);
    }
    headCover.position.copy(head.position);
    render();
  }
  function resize() {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  function resetView() {
    camera.position.set(2.25, 1.16, 7.1);
    controls.target.set(0, -.56, 0);
    if (assemblyProgress !== null) adjustAssemblyFraming(true);
    controls.update();
    render();
  }
  controls.addEventListener('change', render);
  new ResizeObserver(resize).observe(viewport);
  resetView();
  resize();
  setAngle(90);
  return {
    setAngle,
    resetView,
    setSection(value) {
      section = value;
      shell.visible = !section;
    },
  };
}

function makeShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 9, 64, 64, 63);
  gradient.addColorStop(0, 'rgba(0,0,0,0.75)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
