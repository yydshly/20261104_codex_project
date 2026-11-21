/**
 * The Verdant Court: a self-contained, original third-person training arena.
 * All geometry and surface textures are generated locally; no remote assets.
 * Ground contact is y=0. update(dt, time) expects seconds.
 */
export function createEnvironment(THREE, scene, options = {}) {
  const warCourt = options.theme === 'warlord';
  const root = new THREE.Group();
  root.name = 'TheVerdantCourt';
  scene.add(root);
  const previous = { background: scene.background, fog: scene.fog };
  const colliders = [];
  const targets = [];
  const animatedFires = [];
  const targetAnimations = [];
  const textures = new Set();
  const geometryCache = new Map();
  let seed = 4127;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const color = hex => new THREE.Color(hex);

  function canvasTexture(size, draw, repeat = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    draw(context, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.add(texture);
    return texture;
  }

  const stoneTexture = canvasTexture(512, (ctx, n) => {
    ctx.fillStyle = warCourt ? '#80898c' : '#8a9082'; ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 18000; i++) {
      const v = Math.round(90 + random() * 90);
      ctx.fillStyle = `rgba(${v + 5},${v + 8},${v},${.035 + random() * .09})`;
      const s = .5 + random() * 4;
      ctx.fillRect(random() * n, random() * n, s * 2, s);
    }
    for (let i = 0; i < 24; i++) {
      const x = random() * n, y = random() * n;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25 + random() * 70);
      gradient.addColorStop(0, 'rgba(53,72,39,.22)'); gradient.addColorStop(1, 'rgba(70,88,45,0)');
      ctx.fillStyle = gradient; ctx.fillRect(x - 100, y - 100, 200, 200);
    }
    ctx.lineWidth = .7;
    for (let i = 0; i < 11; i++) {
      let x = random() * n, y = random() * n;
      ctx.strokeStyle = 'rgba(32,40,32,.13)'; ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) { x += (random() - .5) * 45; y += 10 + random() * 22; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(216,220,197,.24)'; ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, n - 6, n - 6);
  });
  const dirtTexture = canvasTexture(512, (ctx, n) => {
    ctx.fillStyle = '#28352a'; ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 18000; i++) {
      const v = random();
      ctx.fillStyle = v > .8 ? 'rgba(99,103,61,.2)' : v > .4 ? 'rgba(20,30,20,.2)' : 'rgba(65,82,45,.18)';
      ctx.fillRect(random() * n, random() * n, 1 + random() * 6, 1 + random() * 3);
    }
  }, 12);
  const barkTexture = canvasTexture(256, (ctx, n) => {
    ctx.fillStyle = '#41473a'; ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 180; i++) {
      ctx.strokeStyle = `rgba(${random() > .5 ? '20,27,22' : '103,102,75'},${.1 + random() * .25})`;
      ctx.lineWidth = 1 + random() * 4;
      const x = random() * n; ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 10, n * .3, x - 10, n * .65, x + random() * 20, n); ctx.stroke();
    }
  });

  const materials = {
    stone: new THREE.MeshStandardMaterial({ color: '#b8bb9b', map: stoneTexture, roughness: .93, metalness: .02 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: '#5d6e59', map: stoneTexture, roughness: .96 }),
    stoneEdge: new THREE.MeshStandardMaterial({ color: '#a6a78a', map: stoneTexture, roughness: .86 }),
    soil: new THREE.MeshStandardMaterial({ color: '#7e9363', map: dirtTexture, roughness: 1 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#746346', metalness: .78, roughness: .42 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: '#252e29', metalness: .65, roughness: .52 }),
    moss: new THREE.MeshStandardMaterial({ color: '#59683f', roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: '#a9a18b', map: barkTexture, roughness: .99 }),
    leaves: new THREE.MeshStandardMaterial({ color: '#8b9d63', roughness: 1, flatShading: true }),
    rune: new THREE.MeshStandardMaterial({ color: '#8ddbd2', emissive: '#2e9f91', emissiveIntensity: .7, roughness: .38, metalness: .3 }),
    crystal: new THREE.MeshPhysicalMaterial({ color: '#6ae0d2', emissive: '#108f91', emissiveIntensity: .8, metalness: .25, roughness: .18, clearcoat: 1, clearcoatRoughness: .15, transmission: 0, transparent: true, opacity: .97 }),
    crystalInside: new THREE.MeshBasicMaterial({ color: '#b6fff0', transparent: true, opacity: .7, depthWrite: false }),
    flame: new THREE.MeshBasicMaterial({ color: '#ffb650', transparent: true, opacity: .9, depthWrite: false }),
    flameHeart: new THREE.MeshBasicMaterial({ color: '#ffefd0', transparent: true, opacity: .95, depthWrite: false }),
  };

  function mesh(geometry, material, parent = root, position, rotation) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = true; object.receiveShadow = true;
    if (position) object.position.set(...position);
    if (rotation) object.rotation.set(...rotation);
    parent.add(object); return object;
  }
  function beveledBox(w, h, d, bevel = .035) {
    const key = `box-${w}-${h}-${d}-${bevel}`;
    if (geometryCache.has(key)) return geometryCache.get(key);
    const shape = new THREE.Shape();
    const x = -w / 2, y = -d / 2, r = Math.min(bevel, w / 4, d / 4);
    shape.moveTo(x + r, y); shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r); shape.lineTo(x + w, y + d - r);
    shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d); shape.lineTo(x + r, y + d);
    shape.quadraticCurveTo(x, y + d, x, y + d - r); shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: Math.max(.02, h - bevel), bevelEnabled: true, bevelSize: bevel / 2, bevelThickness: bevel / 2, bevelSegments: 1, curveSegments: 2, steps: 1 });
    geometry.rotateX(-Math.PI / 2); geometry.center(); geometryCache.set(key, geometry);
    return geometry;
  }
  function ring(radius, thickness, material, y, parent = root) {
    return mesh(new THREE.TorusGeometry(radius, thickness, 6, 96), material, parent, [0, y, 0], [Math.PI / 2, 0, 0]);
  }
  function cylinder(top, bottom, height, count = 12) {
    const key = `cyl-${top}-${bottom}-${height}-${count}`;
    if (!geometryCache.has(key)) geometryCache.set(key, new THREE.CylinderGeometry(top, bottom, height, count));
    return geometryCache.get(key);
  }
  const transform = new THREE.Object3D();
  function instances(geometry, material, rows, parent = root) {
    const im = new THREE.InstancedMesh(geometry, material, rows.length);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      transform.position.set(...row.position); transform.rotation.set(...(row.rotation || [0, 0, 0]));
      transform.scale.set(...(row.scale || [1, 1, 1])); transform.updateMatrix();
      im.setMatrixAt(i, transform.matrix);
      if (row.color) im.setColorAt(i, color(row.color));
    }
    im.castShadow = true; im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    parent.add(im); return im;
  }

  // A continuous gradient sky keeps silhouettes readable behind the ruins.
  scene.background = new THREE.Color(warCourt ? '#3a414d' : '#44594e');
  scene.fog = new THREE.Fog(warCourt ? '#3a414d' : '#44594e', warCourt ? 17 : 21, warCourt ? 51 : 66);
  const sky = mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: color(warCourt ? '#242b3e' : '#223d3b') }, horizon: { value: color(warCourt ? '#879397' : '#a1a889') }, bottom: { value: color(warCourt ? '#3e4551' : '#354f42') } },
    vertexShader: 'varying vec3 vPosition; void main(){ vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vPosition; uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; void main(){ float h=normalize(vPosition).y; vec3 c=mix(horizon,top,smoothstep(0.0,.7,h)); c=mix(c,bottom,smoothstep(0.0,.3,-h)); gl_FragColor=vec4(c,1.0); }',
  }));
  sky.castShadow = sky.receiveShadow = false;

  const hemisphere = new THREE.HemisphereLight('#cee1cb', '#273d2e', 2.1); root.add(hemisphere);
  const sunlight = new THREE.DirectionalLight('#ffd5a2', 3.3);
  sunlight.name = 'Late afternoon key'; sunlight.position.set(-9, 15, 9); sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -17; sunlight.shadow.camera.right = 17; sunlight.shadow.camera.top = 17; sunlight.shadow.camera.bottom = -17;
  sunlight.shadow.camera.near = .5; sunlight.shadow.camera.far = 48;
  sunlight.shadow.normalBias = .035; sunlight.shadow.bias = -.0001; sunlight.shadow.radius = 2;
  root.add(sunlight);
  const rim = new THREE.DirectionalLight('#86c9bd', 1.7); rim.position.set(5, 8, -10); root.add(rim);
  if (warCourt) {
    materials.stone.color.set('#a2adb4'); materials.stoneDark.color.set('#525d69'); materials.stoneEdge.color.set('#9ba4aa');
    materials.bronze.color.set('#a68a59'); materials.rune.color.set('#d7b275'); materials.rune.emissive.set('#a77432');
    materials.leaves.color.set('#718176'); rim.color.set('#c0d0ee'); rim.intensity = 1.4;
  }

  mesh(new THREE.CircleGeometry(72, 96), materials.soil, root, [0, -.37, 0], [-Math.PI / 2, 0, 0]);
  mesh(cylinder(12.4, 12.7, .28, 96), materials.stoneDark, root, [0, -.25, 0]);
  mesh(cylinder(11.95, 12.3, .16, 96), materials.stoneEdge, root, [0, -.13, 0]);
  mesh(cylinder(11.7, 11.7, .08, 96), materials.stoneDark, root, [0, -.07, 0]);

  const slabRows = [];
  for (let x = -10; x <= 10; x++) for (let z = -10; z <= 10; z++) {
    const xx = x * 1.08 + (z % 2 ? .54 : 0), zz = z * 1.08;
    if (Math.hypot(xx, zz) > 11.25) continue;
    const v = .79 + random() * .24;
    slabRows.push({ position: [xx, -.055, zz], rotation: [0, (random() - .5) * .025, 0], color: new THREE.Color(v, v * 1.005, v * (warCourt ? .995 : .91)).getHex() });
  }
  instances(beveledBox(1.045, .11, 1.045, .025), materials.stone, slabRows);
  ring(10.95, .026, materials.bronze, .012);
  ring(7.1, .018, materials.stoneDark, .014);
  ring(6.93, .015, materials.stoneEdge, .016);
  // Compass medallion: restrained metal inlay, with open floor around it.
  mesh(cylinder(.82, .82, .025, 48), materials.stoneDark, root, [0, .006, .7]);
  const compass = new THREE.Group(); compass.position.z = .7; root.add(compass);
  ring(.72, .018, materials.bronze, .024, compass);
  for (let i = 0; i < 4; i++) {
    const line = mesh(beveledBox(.022, .016, 1.08, .003), materials.bronze, compass, [0, .027, 0]); line.rotation.y = i * Math.PI / 4;
  }

  const copingRows = [];
  for (let i = 0; i < 64; i++) {
    const angle = i / 64 * Math.PI * 2;
    copingRows.push({ position: [Math.sin(angle) * 11.78, -.015, Math.cos(angle) * 11.78], rotation: [0, angle, 0], color: random() > .5 ? '#a9ac91' : '#969e83' });
  }
  instances(beveledBox(1.04, .14, .62, .04), materials.stoneEdge, copingRows);
  const pathRows = [];
  for (let z = 12; z < 25; z++) for (let x = -1; x <= 1; x++) {
    if (random() < .14) continue;
    pathRows.push({ position: [x * 1.18 + (random() - .5) * .1, -.285, z * 1.08], rotation: [0, (random() - .5) * .14, 0], color: '#a4ac8d' });
  }
  instances(beveledBox(1.1, .13, .96, .035), materials.stoneDark, pathRows);

  function brokenDrum(radius, height) {
    const n = 12, positions = [], indices = [];
    for (let level = 0; level < 2; level++) for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      positions.push(Math.cos(a) * radius, level ? height / 2 + (random() - .5) * .22 : -height / 2, Math.sin(a) * radius);
    }
    positions.push(0, height / 2 - .035, 0);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      indices.push(i, j, n + j, i, n + j, n + i, n + i, n + j, n * 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
  }

  function vine(x, z, height, phase) {
    const points = [];
    for (let i = 0; i <= 16; i++) {
      const y = i / 16 * height, a = i * .39 + phase;
      points.push(new THREE.Vector3(x + Math.cos(a) * .5, y, z + Math.sin(a) * .5));
    }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, .025, 4, false), materials.moss);
    const leaves = [];
    for (let i = 1; i < points.length; i += 2) leaves.push({ position: points[i].toArray(), scale: [.1, .035, .22], rotation: [random(), random() * Math.PI * 2, .6] });
    instances(new THREE.IcosahedronGeometry(1, 0), materials.leaves, leaves);
  }

  function pillar(x, z, height, lean = 0, climbing = false) {
    const pillarRoot = new THREE.Group(); pillarRoot.position.set(x, 0, z); pillarRoot.rotation.z = lean; root.add(pillarRoot);
    mesh(beveledBox(1.43, .24, 1.43, .07), materials.stoneDark, pillarRoot, [0, .1, 0]);
    mesh(beveledBox(1.16, .16, 1.16, .04), materials.stoneEdge, pillarRoot, [0, .3, 0]);
    const drums = Math.max(1, Math.floor((height - .48) / .62));
    for (let i = 0; i < drums; i++) {
      mesh(cylinder(.43, .46, .59), i % 3 === 2 ? materials.stoneEdge : materials.stone, pillarRoot, [0, .43 + i * .62 + .295, 0]);
      if (i % 2 === 0) mesh(cylinder(.485, .485, .045), materials.stoneDark, pillarRoot, [0, .44 + i * .62, 0]);
    }
    const top = .43 + drums * .62;
    mesh(brokenDrum(.44, .22), materials.stoneEdge, pillarRoot, [0, top + .08, 0]);
    if (height > 3.5) {
      mesh(cylinder(.61, .49, .17), materials.stoneEdge, pillarRoot, [0, top + .23, 0]);
      mesh(beveledBox(1.32, .18, 1.32, .04), materials.stone, pillarRoot, [0, top + .4, 0]);
    }
    colliders.push({ x, z, radius: .78 });
    if (climbing) vine(x, z, Math.min(height, top), random() * Math.PI);
  }
  pillar(-8.7, -5.7, 4.5, .018, true);
  pillar(8.7, -5.7, 3.8, -.035, true);
  pillar(-10.3, .3, 2.8, .045, true);
  pillar(10.3, .3, 4.6, -.015, true);
  pillar(-8.7, 6.1, 1.6, -.08);
  pillar(8.7, 6.1, 2.35, .05, true);
  pillar(-5.5, -9.5, 2.3, .06, true);
  pillar(5.5, -9.5, 1.2, -.04);

  // Gate of the old sanctuary, with individually fitted arch stones.
  const gate = new THREE.Group(); gate.position.set(0, 0, -10.45); root.add(gate);
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 6; i++) mesh(beveledBox(.9, .58, 1.0, .05), i % 2 ? materials.stone : materials.stoneEdge, gate, [2.77 * sign, .29 + i * .59, 0]);
    mesh(beveledBox(1.25, .24, 1.34, .05), materials.stoneDark, gate, [2.77 * sign, .1, 0]);
    mesh(beveledBox(1.11, .17, 1.12, .035), materials.stoneEdge, gate, [2.77 * sign, 3.65, 0]);
    colliders.push({ x: 2.77 * sign, z: -10.45, halfX: .58, halfZ: .62 });
  }
  for (let i = 0; i <= 12; i++) {
    if (i === 8) continue;
    const angle = i / 12 * Math.PI;
    const voussoir = mesh(beveledBox(.68, .69, 1.05, .045), i % 3 ? materials.stone : materials.stoneEdge, gate, [Math.cos(angle) * 2.77, 3.65 + Math.sin(angle) * 2.77, 0]);
    voussoir.rotation.z = angle - Math.PI / 2;
  }
  mesh(new THREE.OctahedronGeometry(.27, 0), materials.rune, gate, [0, 5.95, -.57]);
  const wallRows = [];
  for (const sign of [-1, 1]) for (let x = 4; x <= 10; x++) for (let y = 0; y < (x < 7 ? 3 : 2); y++) {
    if (random() < .12) continue;
    wallRows.push({ position: [sign * (x * 1.05 + (y % 2 ? .4 : 0)), .27 + y * .52, -11.4], rotation: [0, (random() - .5) * .05, (random() - .5) * .025], color: random() > .6 ? '#8e9b7f' : '#a9ae91' });
  }
  instances(beveledBox(1.01, .49, .73, .035), materials.stoneDark, wallRows);

  // Scattered masonry retains the same stone language as the main architecture.
  const rubbleRows = [];
  for (let i = 0; i < 55; i++) {
    const angle = random() * Math.PI * 2, radius = 10.7 + random() * 4.3;
    if (Math.abs(Math.sin(angle) * radius) < 2.5 && Math.cos(angle) > .1) continue;
    const scale = .28 + random() * .65;
    rubbleRows.push({ position: [Math.sin(angle) * radius, -.2 + scale * .15, Math.cos(angle) * radius], rotation: [random() * .5, random() * Math.PI * 2, random() * .5], scale: [scale, scale * .65, scale * .7], color: random() > .5 ? '#929d80' : '#738568' });
  }
  instances(beveledBox(1.0, .6, .8, .07), materials.stoneDark, rubbleRows);

  // A two-layer tree belt gives a playable courtyard a sense of place and scale.
  const trunks = [], branches = [], canopy = [];
  for (let i = 0; i < 72; i++) {
    const angle = i * 2.399963 + random() * .4;
    const radius = 17 + random() * 29;
    const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
    if (Math.abs(x) < 3.5 && z > 10) continue;
    const height = 6.3 + random() * 7.5, trunkRadius = .28 + random() * .42;
    trunks.push({ position: [x, height * .41 - .32, z], scale: [trunkRadius, height * .82, trunkRadius], rotation: [0, random() * Math.PI, (random() - .5) * .065], color: random() > .6 ? '#b5a68b' : '#89917c' });
    for (let j = 0; j < 3; j++) {
      const a = j * 2.094 + angle, spread = 1.1 + random() * 1.4;
      canopy.push({ position: [x + Math.sin(a) * spread, height - .5 + random() * 1.8, z + Math.cos(a) * spread], scale: [2.2 + random() * 1.7, 1.65 + random() * 1.7, 2 + random() * 1.7], rotation: [random() * .3, random() * Math.PI, random() * .2], color: ['#7f8d53', '#71865b', '#536f50', '#a39b5f', '#5d795a'][Math.floor(random() * 5)] });
      branches.push({ position: [x + Math.sin(a) * .7, height * .73, z + Math.cos(a) * .7], scale: [.17, height * .28, .17], rotation: [Math.cos(a) * .7, 0, -Math.sin(a) * .7] });
    }
    if (radius < 20) colliders.push({ x, z, radius: trunkRadius + .15 });
  }
  instances(cylinder(.65, 1, 1, 9), materials.bark, trunks);
  instances(cylinder(.4, 1, 1, 7), materials.bark, branches);
  instances(new THREE.IcosahedronGeometry(1, 1), materials.leaves, canopy);
  const hills = [];
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    hills.push({ position: [Math.sin(a) * 48, -1.6, Math.cos(a) * 48], scale: [8 + random() * 10, 4 + random() * 8, 8 + random() * 10], rotation: [0, a, 0], color: random() > .5 ? '#304e41' : '#3d5945' });
  }
  const hillsMesh = instances(new THREE.IcosahedronGeometry(1, 1), materials.stoneDark, hills); hillsMesh.castShadow = false;

  const grassRows = [], fernRows = [];
  for (let i = 0; i < 1200; i++) {
    const angle = random() * Math.PI * 2, radius = 11.55 + random() * 11;
    const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
    if (Math.abs(x) < 2 && z > 10) continue;
    const s = .14 + random() * .43;
    grassRows.push({ position: [x, -.18 + s * .4, z], scale: [s * .12, s, s * .12], rotation: [(random() - .5) * .6, random() * Math.PI * 2, (random() - .5) * .5], color: ['#6e8451','#9a9f65','#58764a','#8a9a5b'][Math.floor(random() * 4)] });
    if (i % 14 === 0) fernRows.push({ position: [x, -.22, z], scale: [.35 + random() * .3, .5 + random() * .4, .35 + random() * .3], rotation: [0, random() * Math.PI, 0] });
  }
  const grass = instances(new THREE.ConeGeometry(1, 1, 3, 1), materials.leaves, grassRows); grass.castShadow = false;
  const fernGeometry = new THREE.ConeGeometry(1, 1, 5, 1); fernGeometry.translate(0, .5, 0);
  const ferns = instances(fernGeometry, materials.moss, fernRows); ferns.castShadow = false;
  // Small tufts appearing at selected slab edges, away from the clear combat lane.
  const creviceRows = [];
  for (let i = 0; i < 75; i++) {
    const angle = random() * Math.PI * 2, r = 8.3 + random() * 2.9;
    creviceRows.push({ position: [Math.cos(angle) * r, .05, Math.sin(angle) * r], scale: [.03, .16 + random() * .18, .03], rotation: [random() * .7, random() * 6, random() * .6], color: '#68824b' });
  }
  instances(new THREE.ConeGeometry(1, 1, 3), materials.leaves, creviceRows).castShadow = false;

  function brazier(x, z, index) {
    const group = new THREE.Group(); group.position.set(x, 0, z); root.add(group);
    mesh(cylinder(.54, .66, .2, 10), materials.stoneDark, group, [0, .1, 0]);
    mesh(cylinder(.22, .33, .9, 8), materials.blackMetal, group, [0, .64, 0]);
    mesh(cylinder(.47, .3, .22, 12), materials.bronze, group, [0, 1.16, 0]);
    const coal = mesh(cylinder(.4, .3, .12, 12), materials.blackMetal, group, [0, 1.29, 0]);
    const flameRoot = new THREE.Group(); flameRoot.position.y = 1.32; group.add(flameRoot);
    for (let j = 0; j < 3; j++) {
      const flame = mesh(new THREE.ConeGeometry(.14 - j * .022, .63 - j * .12, 7), j === 2 ? materials.flameHeart : materials.flame, flameRoot, [(j - 1) * .11, .25 + j * .01, .025 * (j % 2)]);
      flame.castShadow = flame.receiveShadow = false; flame.rotation.z = (j - 1) * .22;
    }
    let light = null;
    if (index < 2) { light = new THREE.PointLight('#ffa54f', 24, 7, 2); light.position.set(x, 1.65, z); root.add(light); }
    animatedFires.push({ root: flameRoot, light, index });
    colliders.push({ x, z, radius: .63 });
  }
  brazier(-6.5, -6.0, 0); brazier(6.5, -6.0, 1); brazier(-7.4, 7.0, 2); brazier(7.4, 7.0, 3);

  function trainingCrystal(x, z, index) {
    const group = new THREE.Group(); group.name = `SanctuaryCrystal_${index + 1}`; group.position.set(x, 0, z); root.add(group);
    group.userData.health = 100; group.userData.hitTime = -100;
    mesh(cylinder(.64, .78, .14, 12), materials.stoneDark, group, [0, .07, 0]);
    mesh(cylinder(.49, .58, .15, 12), materials.stoneEdge, group, [0, .2, 0]);
    const sigil = ring(.49, .017, materials.rune, .287, group); sigil.castShadow = false;
    const floatRoot = new THREE.Group(); floatRoot.position.y = 1.18; group.add(floatRoot);
    const crystalMaterial = materials.crystal.clone();
    const crystal = mesh(new THREE.OctahedronGeometry(.58, 0), crystalMaterial, floatRoot);
    crystal.scale.set(.77, 1.45, .77); crystal.rotation.y = index * .6;
    const inner = mesh(new THREE.OctahedronGeometry(.31, 0), materials.crystalInside, floatRoot);
    inner.scale.set(.65, 1.6, .65); inner.castShadow = false;
    const orbit = mesh(new THREE.TorusGeometry(.65, .015, 5, 32), materials.bronze, floatRoot, [0, 0, 0], [Math.PI / 2.4, .25, index]);
    const shards = [];
    for (let j = 0; j < 5; j++) {
      const a = j / 5 * Math.PI * 2;
      const shard = mesh(new THREE.OctahedronGeometry(.1, 0), crystalMaterial, floatRoot, [Math.cos(a) * .72, -.32 + j * .06, Math.sin(a) * .72]);
      shard.scale.set(.6, 1.5, .6); shard.rotation.z = -.3 + j * .15;
      shards.push({ object: shard, angle: a, baseY: shard.position.y });
    }
    const target = { id: `crystal-${index + 1}`, group, position: group.position, radius: .67, maxHealth: 100 };
    targets.push(target);
    targetAnimations.push({ target, floatRoot, crystal, inner, orbit, shards, material: crystalMaterial, sigil, death: 0 });
    colliders.push({ x, z, radius: .58 });
  }
  trainingCrystal(0, -3.0, 0); trainingCrystal(-4.2, -2.2, 1); trainingCrystal(4.2, -2.2, 2);

  const dustCount = 85;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) { dustPositions[i * 3] = (random() - .5) * 30; dustPositions[i * 3 + 1] = .2 + random() * 6; dustPositions[i * 3 + 2] = (random() - .5) * 30; }
  const dustGeometry = new THREE.BufferGeometry(); dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#f8d898', size: .026, transparent: true, opacity: .42, depthWrite: false, sizeAttenuation: true })); root.add(dust);

  function update(dt, time) {
    const delta = Math.min(Math.max(dt, 0), .1);
    animatedFires.forEach(({ root: flameRoot, light, index }) => {
      flameRoot.scale.set(1 + Math.sin(time * 11 + index) * .06, .94 + Math.sin(time * 9 + index * 2) * .13, 1 + Math.cos(time * 13 + index) * .05);
      flameRoot.rotation.y = Math.sin(time * 2 + index) * .15;
      if (light) light.intensity = 22 + Math.sin(time * 8 + index * 2) * 2.4;
    });
    targetAnimations.forEach((entry, index) => {
      const { target, floatRoot, material, crystal, orbit, inner, shards, sigil } = entry;
      const health = Number.isFinite(target.group.userData.health) ? target.group.userData.health : target.maxHealth;
      const dead = health <= 0;
      entry.death = clamp(entry.death + (dead ? delta * 2.5 : -delta * 8), 0, 1);
      const d = entry.death;
      const sinceHit = time - (Number.isFinite(target.group.userData.hitTime) ? target.group.userData.hitTime : -100);
      const flash = sinceHit >= 0 && sinceHit < .32 ? Math.pow(1 - sinceHit / .32, 2) : 0;
      floatRoot.position.y = 1.18 + Math.sin(time * 1.7 + index * 2) * .065 - d * .55;
      floatRoot.rotation.y = time * .23 + index * .6;
      floatRoot.rotation.z = Math.sin(sinceHit * 43) * flash * .09;
      material.emissive.set(dead ? '#1d5e58' : '#159b96');
      material.emissiveIntensity = (.6 + Math.sin(time * 2 + index) * .1 + flash * 3) * (1 - d * .85);
      material.opacity = .97 * (1 - d);
      crystal.scale.set(.77 * (1 - d * .75), 1.45 * (1 - d * .65), .77 * (1 - d * .75));
      inner.visible = !dead;
      orbit.visible = !dead;
      sigil.material = materials.rune;
      sigil.visible = d < .95;
      for (const { object, angle, baseY } of shards) {
        object.position.set(Math.cos(angle) * (.72 + d * .85), baseY - d * .3, Math.sin(angle) * (.72 + d * .85));
        object.rotation.z += delta * (.2 + d * 3);
      }
      floatRoot.visible = d < .99;
    });
    dust.rotation.y = time * .009;
    dust.position.y = Math.sin(time * .19) * .12;
  }

  function resetTargets() {
    targetAnimations.forEach(entry => {
      entry.target.group.userData.health = entry.target.maxHealth;
      entry.target.group.userData.hitTime = -100;
      entry.death = 0;
      entry.floatRoot.visible = true;
      entry.floatRoot.rotation.z = 0;
      entry.material.opacity = .97;
    });
  }

  function dispose() {
    const geometries = new Set(), mats = new Set();
    root.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of list) if (material) mats.add(material);
    });
    geometries.forEach(geometry => geometry.dispose()); mats.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
    scene.remove(root); scene.background = previous.background; scene.fog = previous.fog;
  }

  update(0, 0);
  return { root, colliders, targets, spawn: { x: 0, z: 3 }, update, resetTargets, dispose };
}
