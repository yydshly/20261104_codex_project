import * as THREE from 'three';
import { coastlineX, groundHeight, groundSurfaceHeight, riverWidth, riverZ } from './world-terrain.js';

const coast = coastlineX(38.5);
const upstream = Array.from({ length: 17 }, (_, i) => {
  const x = -106 + i * 4;
  const bankMargin = x < -96 ? 1.55 : 1.15 + .15 * Math.sin(x * .24);
  return [x, riverZ(x) + riverWidth(x) + bankMargin];
});
const riverbank = [
  [-40, 11.85], [-38, 14.2], [-36, 17.15], [-34.9, 20.8], [-33.4, 22.7], [-29.9, 23.25],
  [-25, 22.1], [-18, 21.7], [-13, 23.55], [-8.5, 27], [-3.3, 28.6], [2, 28], [8, 28.2],
  [16.8, 29.65], [23.4, 29], [29.6, 27.4], [36, 26.2], [43.8, 27.6], [49.1, 30],
  [54.1, 32.7], [55.9, 36.3], [58.5, 38.4], [coast - .2, 38.5],
];
const curve = new THREE.SplineCurve([...upstream, ...riverbank].map(([x, z]) => new THREE.Vector2(x, z)));
const points = curve.getSpacedPoints(840);
const branches = [
  {
    id: 'cabin', joinX: -99.4, waypoints: [[-98.45, -18.3], [-97.68, -17.68], [-97.23, -16.63]],
    title: '雪地小屋', detail: '走向背风坡', accent: '#c3dbdd', ground: 0xb6bfb5, edge: 0xd9dfd4, halfWidth: .55,
    position: [-97.2, -18.85], target: [-97.2, -13, 2.25],
  },
  {
    id: 'ranch', joinX: .15, waypoints: [[1.32, 30.3], [1.5, 32.5], [1.5, 34.7], [1.5, 36.35]],
    title: '草坡牧场', detail: '从木栅门进草场', accent: '#dcc787', ground: 0xb6a16e, edge: 0xa1a361, halfWidth: .65,
    position: [1.5, 33.55], target: [1.5, 43, 1.3],
  },
  {
    id: 'tropics', joinX: 37.9, waypoints: [[38.2, 31.4], [39.03, 34.9], [39, 38], [39, 42.4], [39, 46.4]],
    title: '海岸雨林', detail: '沿小径走进林下', accent: '#a1c19a', ground: 0xa48660, edge: 0x6c714c, halfWidth: .58,
    position: [39, 37.7], target: [39, 46, 2.1],
  },
].map((branch) => {
  const join = station(branch.joinX);
  const controls = [join.point, ...branch.waypoints.map(([x, z]) => new THREE.Vector2(x, z))];
  const spline = new THREE.SplineCurve(controls);
  return { ...branch, join, points: spline.getSpacedPoints(Math.ceil(spline.getLength() * 5)) };
});
const corridor = new Map();

for (const point of [...points, ...branches.flatMap((branch) => branch.points)]) {
  const column = Math.floor(point.x / 3);
  if (!corridor.has(column)) corridor.set(column, []);
  corridor.get(column).push(point);
}

export function trailClearance(x, z, radius = 0) {
  const reach = .89 + radius;
  if (x >= coast - .2 && x <= coast + 7 && Math.abs(z - 38.5) < reach + .4) return true;
  const first = Math.floor((x - reach) / 3);
  const last = Math.floor((x + reach) / 3);
  for (let column = first; column <= last; column++) {
    const samples = corridor.get(column);
    if (!samples) continue;
    for (const point of samples) {
      if ((point.x - x) ** 2 + (point.y - z) ** 2 < reach ** 2) return true;
    }
  }
  return false;
}

function station(x) {
  let i = points.findIndex((point) => point.x >= x);
  if (i < 0) i = points.length - 1;
  const forward = points[Math.min(i + 2, points.length - 1)].clone().sub(points[Math.max(i - 2, 0)]).normalize();
  return { point: points[i], forward, side: new THREE.Vector2(-forward.y, forward.x) };
}

function makeTrack(trackPoints, branch) {
  const positions = [];
  const colors = [];
  const indices = [];
  const stone = new THREE.Color(0xabaa99);
  const valley = new THREE.Color(0xa99870);
  const grass = new THREE.Color(0x807d52);
  const sand = new THREE.Color(0xcab993);
  const branchGround = branch && new THREE.Color(branch.ground);
  const branchEdge = branch && new THREE.Color(branch.edge);
  const tint = new THREE.Color();
  const lanes = [-1, -.81, -.41, 0, .43, .8, 1];
  for (let i = 0; i < trackPoints.length; i++) {
    const point = trackPoints[i];
    const vector = trackPoints[Math.min(i + 1, trackPoints.length - 1)].clone().sub(trackPoints[Math.max(0, i - 1)]).normalize();
    const p = i / (trackPoints.length - 1);
    const turn = .064 * Math.sin(i * .38) + .046 * Math.cos(i * .24);
    const fade = Math.min(THREE.MathUtils.smoothstep(p, 0, .019), 1 - THREE.MathUtils.smoothstep(p, .985, 1));
    const baseWidth = branch?.halfWidth ?? (.64 + .23 * THREE.MathUtils.smoothstep(point.x, -46, -21));
    const halfWidth = Math.max(.045, (baseWidth + turn) * fade);
    const soil = THREE.MathUtils.smoothstep(point.x, -88, -34);
    const shore = THREE.MathUtils.smoothstep(point.x, 52, coast);
    for (let j = 0; j < lanes.length; j++) {
      const lane = lanes[j];
      const x = point.x - vector.y * lane * halfWidth;
      const z = point.y + vector.x * lane * halfWidth;
      // Match the terrain's grid triangles so the uphill ribbon follows their surface at foot level.
      positions.push(x, groundSurfaceHeight(x, z) + (branch ? .047 : .038), z);
      const gravel = Math.cos(i * 1.23 + j * 1.71) * .035 + Math.sin(i * .8 - j * 2.31) * .021;
      if (branch) {
        tint.copy(branchGround).lerp(branchEdge, Math.abs(lane) ** 2 * .72);
      } else {
        tint.copy(stone).lerp(valley, soil);
        tint.lerp(grass, Math.abs(lane) ** 2 * soil * .48).lerp(sand, shore * .79);
      }
      tint.multiplyScalar(1 + gravel - Math.abs(lane) ** 6 * .095);
      colors.push(tint.r, tint.g, tint.b);
      if (i === 0 || j === 0) continue;
      const a = (i - 1) * lanes.length + j - 1;
      const b = a + lanes.length;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const track = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  track.name = branch ? `${branch.title}支路` : '从雪线到海滨的连续步道';
  track.userData.rainWettable = 'ground';
  return track;
}

function plank(parent, material, width, height, depth, x, y, z) {
  const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function signFace(title, subtitle, color) {
  if (typeof document === 'undefined') return new THREE.MeshBasicMaterial({ color: 0x6e634a });
  const canvas = document.createElement('canvas');
  canvas.width = 448;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3c392c';
  ctx.fillRect(0, 0, 448, 160);
  ctx.strokeStyle = '#8e7858';
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, 428, 140);
  ctx.fillStyle = color;
  ctx.fillRect(27, 31, 10, 98);
  ctx.fillStyle = '#f0e5c3';
  ctx.font = 'bold 48px Microsoft YaHei, sans-serif';
  ctx.fillText(title, 55, 79, 330);
  ctx.fillStyle = '#d7c89f';
  ctx.font = '30px Microsoft YaHei, sans-serif';
  ctx.fillText(subtitle, 57, 121, 330);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function addSign(group, timber, anchor, forward, title, subtitle, accent) {
  const sign = new THREE.Group();
  sign.position.set(anchor.x, groundSurfaceHeight(anchor.x, anchor.y), anchor.y);
  sign.rotation.y = Math.atan2(-forward.x, -forward.y);
  plank(sign, timber, .11, 1.62, .12, -.48, .8, -.085).userData.collidable = true;
  plank(sign, timber, .11, 1.62, .12, .48, .8, -.085).userData.collidable = true;
  plank(sign, timber, 1.6, .61, .1, 0, 1.54, 0).userData.collidable = true;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .6), signFace(title, subtitle, accent));
  face.position.set(0, 1.54, .052);
  sign.add(face);
  group.add(sign);
}

function addTrailSigns(group, timber) {
  const signs = [
    [-103.1, '雪线步道', '沿河向下', '#c2dadb'],
    [-61.2, '峡谷急流', '沿木栏通过', '#84bfc1'],
    [-33.4, '河岸木屋', '抬头看檐下', '#c9ae7a'],
    [-6.8, '花丛与蜂巢', '靠近看工蜂', '#e4be69'],
    [12.3, '土层与蚁道', '看树根下的巢室', '#c8a076'],
    [54.1, '礁石潮池', '观察池底生物', '#9fc9b4'],
    [61, '浅海入口', '从沙滩向海', '#89c9ce'],
  ];
  for (const [x, title, subtitle, accent] of signs) {
    const { point, forward, side } = station(x);
    const anchor = point.clone().addScaledVector(side, 1.43);
    addSign(group, timber, anchor, forward, title, subtitle, accent);
  }
  for (const branch of branches) {
    const sample = Math.min(10, branch.points.length - 3);
    const point = branch.points[sample];
    const direction = branch.points[sample + 2].clone().sub(branch.points[sample - 2]).normalize();
    const side = new THREE.Vector2(-direction.y, direction.x);
    const anchor = point.clone().addScaledVector(side, 1.28);
    addSign(group, timber, anchor, branch.join.forward, branch.title, branch.detail, branch.accent);
  }
}

function addGorgeRail(group, timber) {
  const posts = [];
  for (let x = -68; x <= -53.4; x += 1.44) {
    const { point, side } = station(x);
    const anchor = point.clone().addScaledVector(side, -.81);
    const height = groundHeight(anchor.x, anchor.y);
    posts.push(new THREE.Vector3(anchor.x, height + .83, anchor.y));
    plank(group, timber, .13, 1.03, .14, anchor.x, height + .42, anchor.y).userData.collidable = true;
  }
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (let i = 1; i < posts.length; i++) {
    const a = posts[i - 1];
    const b = posts[i];
    const delta = b.clone().sub(a);
    const rail = plank(group, timber, .115, delta.length() + .08, .10, 0, 0, 0);
    rail.position.addVectors(a, b).multiplyScalar(.5);
    rail.quaternion.setFromUnitVectors(yAxis, delta.normalize());
    rail.userData.collidable = true;
  }
}

function addTrailCairns(group) {
  const piles = [-105.2, -99.2, -90, -80.4, -52, -44, -24, 3, 24, 41, 49, 58.1];
  const stones = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    piles.length * 3,
  );
  const transform = new THREE.Object3D();
  const tint = new THREE.Color();
  const colors = [0x878a78, 0xb2a78a, 0xc7c5af];
  for (let i = 0; i < piles.length; i++) {
    const { point, side } = station(piles[i]);
    const anchor = point.clone().addScaledVector(side, i < 4 ? 1.03 : 1.18);
    const y = groundHeight(anchor.x, anchor.y);
    for (let j = 0; j < 3; j++) {
      const scale = .20 - j * .037;
      transform.position.set(anchor.x + j * .019, y + .064 + j * .079, anchor.y - j * .014);
      transform.scale.set(scale, scale * .55, scale * .79);
      transform.rotation.set(j * .12, i * .41 + j, j * -.09);
      transform.updateMatrix();
      stones.setMatrixAt(i * 3 + j, transform.matrix);
      stones.setColorAt(i * 3 + j, tint.set(colors[j]));
    }
  }
  stones.computeBoundingSphere();
  stones.name = '路边的小石堆';
  group.add(stones);
}

function viewpoint(x, targetX, targetY, targetZ) {
  const { point } = station(x);
  return { position: [point.x, groundHeight(point.x, point.y), point.y], target: [targetX, targetY, targetZ] };
}

export function createTrail(scene) {
  const group = new THREE.Group();
  group.name = '雪线步道、路标与木栏';
  const timber = new THREE.MeshStandardMaterial({ color: 0x765b3c, roughness: 1 });
  group.add(makeTrack(points));
  for (const branch of branches) group.add(makeTrack(branch.points, branch));
  addTrailSigns(group, timber);
  addGorgeRail(group, timber);
  addTrailCairns(group);
  scene.add(group);

  const spawn = viewpoint(-106, -98, groundHeight(-98, -18.2) + 1.15, -18.2);
  const branchStops = Object.fromEntries(branches.map(({ id, position: [x, z], target: [tx, tz, offset] }) => [id, {
    position: [x, groundSurfaceHeight(x, z), z],
    target: [tx, groundSurfaceHeight(tx, tz) + offset, tz],
  }]));
  return {
    spawn,
    points: points.filter((_, i) => i % 8 === 0).map(({ x, y: z }) => [x, groundHeight(x, z), z]),
    branches: branches.map((branch) => branch.points
      .filter((_, i) => i % 5 === 0 || i === branch.points.length - 1)
      .map(({ x, y: z }) => [x, groundSurfaceHeight(x, z), z])),
    stops: {
      snow: spawn,
      gorge: viewpoint(-64, -58, groundHeight(-58, riverZ(-58)) + .9, riverZ(-58)),
      river: viewpoint(-25.2, -30, groundHeight(-30, 17.4) + 2.4, 17.4),
      bee: viewpoint(-2.7, -2.7, groundHeight(-3, 19) + 1.7, 19.72),
      ant: viewpoint(16.8, 16, groundHeight(16, 22) + 1.7, 21.97),
      tide: viewpoint(55.9, coastlineX(33) - 3.5, .45, 33),
      ocean: viewpoint(coast - .5, coast + 9.5, .35, 38.5),
      ...branchStops,
    },
  };
}
