import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const travel = 3.6;
const views = {
  angled: [5.6, 5.8, 11.7],
  side: [0, 0, 12],
  top: [0, 12, .001],
  axis: [12, .001, 0],
};
const north = new THREE.Color('#e77863');
const south = new THREE.Color('#5f9abb');

function metal(color, metalness = .42, roughness = .35) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function label(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f0f5f6';
  context.font = '600 34px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 32, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
  sprite.scale.setScalar(.34);
  return sprite;
}

function makeMagnet() {
  const group = new THREE.Group();
  const ends = [];
  const labels = ['N', 'S'].map(label);
  const geometry = new THREE.CylinderGeometry(.31, .31, .49, 48);
  geometry.rotateZ(Math.PI / 2);
  for (const [index, sign] of [-1, 1].entries()) {
    const end = new THREE.Mesh(geometry, metal(index ? north : south, .22));
    end.position.x = sign * .25;
    ends.push(end);
    group.add(end);
  }
  const seamGeometry = new THREE.CylinderGeometry(.315, .315, .035, 48);
  seamGeometry.rotateZ(Math.PI / 2);
  group.add(new THREE.Mesh(seamGeometry, metal('#afc4ca')));
  group.add(...labels);
  return { group, ends, labels };
}

function makeCoil() {
  const group = new THREE.Group();
  const ringGeometry = new THREE.TorusGeometry(.7, .019, 8, 64);
  ringGeometry.rotateY(Math.PI / 2);
  const winding = new THREE.InstancedMesh(ringGeometry, metal('#ce8b54', .5), 42);
  winding.frustumCulled = false;
  group.add(winding);

  const rimGeometry = new THREE.TorusGeometry(.72, .074, 16, 64);
  rimGeometry.rotateY(Math.PI / 2);
  const rimMaterial = metal('#899a9a', .6, .4);
  for (const sign of [-1, 1]) {
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.x = .48 * sign;
    group.add(rim);
  }
  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.24, .12, 1.16), metal('#536574', .35));
  foot.position.y = -1.01;
  const stand = new THREE.Mesh(new THREE.BoxGeometry(.57, .25, .55), metal('#6c7d84'));
  stand.position.y = -.86;
  group.add(foot, stand);
  return { group, winding };
}

function makeField() {
  const group = new THREE.Group();
  const arrows = [];
  const arrowGeometry = new THREE.ConeGeometry(.035, .12, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color: '#c9f3df' });
  const up = new THREE.Vector3(0, 1, 0);
  const closeColor = new THREE.Color('#d1ee9f');
  const farColor = new THREE.Color('#6f84d8');

  // Dipole field lines in meridian planes. The external path goes from N to S.
  for (let plane = 0; plane < 6; plane += 1) {
    const azimuth = plane * Math.PI / 3;
    for (const [index, span] of [1.05, 1.48, 2, 2.72, 3.55].entries()) {
      const points = [];
      const colors = [];
      const start = Math.asin(Math.sqrt(.48 / span));
      for (let sample = 0; sample <= 64; sample += 1) {
        const angle = start + (Math.PI - 2 * start) * sample / 64;
        const radius = span * Math.sin(angle) ** 2;
        const cross = radius * Math.sin(angle);
        points.push(new THREE.Vector3(radius * Math.cos(angle), cross * Math.cos(azimuth), cross * Math.sin(azimuth)));
        const color = closeColor.clone().lerp(farColor, Math.min((radius - .48) / 2.6, 1));
        colors.push(color.r, color.g, color.b);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: .8 - index * .095, depthWrite: false,
      });
      group.add(new THREE.Line(geometry, material));

      if (index % 2 === 0) {
        const mid = plane % 2 ? 25 : 39;
        const direction = points[mid + 1].clone().sub(points[mid - 1]).normalize();
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.copy(points[mid]);
        arrows.push({
          arrow,
          forward: new THREE.Quaternion().setFromUnitVectors(up, direction),
          reverse: new THREE.Quaternion().setFromUnitVectors(up, direction.negate()),
        });
        group.add(arrow);
      }
    }
  }
  return { group, arrows };
}

export function mountInductionScene(host, { onMove, onGrab, onOrbit }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'induction-lab__webgl';
  host.prepend(canvas);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a1520');
  scene.fog = new THREE.FogExp2('#0a1520', .041);
  const camera = new THREE.OrthographicCamera(-7, 7, 4, -4, .1, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minZoom = .7;
  controls.maxZoom = 2.4;
  controls.addEventListener('start', onOrbit);

  const ambient = new THREE.HemisphereLight('#d7e9ff', '#5e514c', 2.05);
  const key = new THREE.DirectionalLight('#ffdbb6', 2.8);
  key.position.set(1, 5, 4);
  const rim = new THREE.DirectionalLight('#86d7ee', 1.85);
  rim.position.set(-5, 1.8, -4);
  scene.add(ambient, key, rim);

  const grid = new THREE.GridHelper(19, 38, '#446072', '#24394a');
  grid.position.y = -1.09;
  scene.add(grid);
  const ruler = [];
  for (let index = -8; index <= 8; index += 1) {
    const x = index * .5;
    ruler.push(new THREE.Vector3(x, -1.078, 1.03), new THREE.Vector3(x, -1.078, index % 2 ? .92 : .82));
  }
  ruler.push(new THREE.Vector3(-4.3, -1.078, 1.03), new THREE.Vector3(4.3, -1.078, 1.03));
  const rulerGeometry = new THREE.BufferGeometry().setFromPoints(ruler);
  scene.add(new THREE.LineSegments(rulerGeometry, new THREE.LineBasicMaterial({ color: '#7791a0' })));

  const coil = makeCoil();
  const magnet = makeMagnet();
  const field = makeField();
  scene.add(coil.group, magnet.group, field.group);
  const transform = new THREE.Matrix4();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let position = 0;
  let shownTurns;
  let shownPolarity;
  let drag;

  function setView(view) {
    camera.position.set(...views[view]);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const halfHeight = Math.max(2.55, 5.8 / aspect);
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function grab(event) {
    if (drag || event.button !== 0) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) * 2 / bounds.width - 1, 1 - (event.clientY - bounds.top) * 2 / bounds.height);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.intersectObjects(magnet.ends, false).length) return;

    const origin = new THREE.Vector3().project(camera);
    const right = new THREE.Vector3(travel, 0, 0).project(camera);
    const axis = new THREE.Vector2((right.x - origin.x) * bounds.width / 2, (origin.y - right.y) * bounds.height / 2);
    if (axis.lengthSq() < 100) return;
    event.stopImmediatePropagation();
    controls.enabled = false;
    canvas.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, axis, position };
    canvas.classList.add('is-dragging');
    onGrab();
  }

  function move(event) {
    if (drag?.id !== event.pointerId) return;
    const delta = (event.clientX - drag.x) * drag.axis.x + (event.clientY - drag.y) * drag.axis.y;
    onMove(THREE.MathUtils.clamp(drag.position + delta / drag.axis.lengthSq(), -1, 1));
  }

  function release(event) {
    if (drag?.id !== event.pointerId) return;
    drag = undefined;
    controls.enabled = true;
    canvas.classList.remove('is-dragging');
  }

  setView('angled');
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  canvas.addEventListener('pointerdown', grab, true);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('lostpointercapture', release);

  return {
    setView,
    setFieldVisible: visible => { field.group.visible = visible; },
    render(nextPosition, polarity, turns, current) {
      position = nextPosition;
      magnet.group.position.x = field.group.position.x = position * travel;
      if (polarity !== shownPolarity) {
        shownPolarity = polarity;
        magnet.ends[0].material.color.copy(polarity > 0 ? south : north);
        magnet.ends[1].material.color.copy(polarity > 0 ? north : south);
        magnet.labels[0].position.set(polarity * .25, .49, 0);
        magnet.labels[1].position.set(-polarity * .25, .49, 0);
        for (const { arrow, forward, reverse } of field.arrows) arrow.quaternion.copy(polarity > 0 ? forward : reverse);
      }
      if (turns !== shownTurns) {
        shownTurns = turns;
        const count = Math.round(12 + turns / 10);
        for (let index = 0; index < count; index += 1) {
          transform.makeTranslation((index / (count - 1) - .5) * .8, 0, 0);
          coil.winding.setMatrixAt(index, transform);
        }
        coil.winding.count = count;
        coil.winding.instanceMatrix.needsUpdate = true;
      }
      coil.winding.material.emissive.set('#9a411d');
      coil.winding.material.emissiveIntensity = Math.min(.68, Math.abs(current) * .34);
      controls.update();
      renderer.render(scene, camera);
    },
    dispose() {
      observer.disconnect();
      controls.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => {
        material.map?.dispose();
        material.dispose();
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}
