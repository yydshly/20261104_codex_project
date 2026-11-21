  function createWorldScene(canvas, onPick) {
  const T = window.THREE;
  if (!T) throw new Error('Three.js runtime is unavailable.');
  const renderer = new T.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x071925, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new T.Scene();
  scene.fog = new T.Fog(0x1c2b40, 105, 325);
  const camera = new T.PerspectiveCamera(38, 1, .2, 420);
  const focusPoint = new T.Vector3();
  const defaultFocus = new T.Vector3(0, 3.2, -2);
  focusPoint.copy(defaultFocus);
  const destination = defaultFocus.clone();
  const pointer = new T.Vector2();
  const raycaster = new T.Raycaster();
  const projectPoint = new T.Vector3();
  const selectionRoots = [];
  const defaultHeading = .30;
  const defaultTilt = .85;
  let heading = defaultHeading;
  let tilt = defaultTilt;
  let scale = 1;
  let cameraMoving = true;
  let width = 0;
  let height = 0;
  let previousDraw = 0;
  let previousRender = 0;
  let previousKey = '';
  let flowTime = 0;

  const sun = new T.DirectionalLight(0xffe8c5, 2.35);
  sun.position.set(-65, 52, 44);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, {left: -76, right: 76, top: 67, bottom: -61, near: 10, far: 190});
  sun.shadow.normalBias = .12;
  sun.shadow.bias = -.0002;
  scene.add(sun);
  const ambient = new T.HemisphereLight(0xd9f3ff, 0x34475b, 2.15);
  scene.add(ambient);
  const fill = new T.DirectionalLight(0xa1d4ff, .65);
  fill.position.set(55, 25, -44);
  scene.add(fill);

  const cube = new T.BoxGeometry(1, 1, 1);
  const cylinder = new T.CylinderGeometry(1, 1, 1, 20);
  const sphere = new T.IcosahedronGeometry(1, 1);
  const disk = new T.CircleGeometry(1, 48);
  const ring = new T.RingGeometry(.91, 1, 72);
  const material = (color, other = {}) => new T.MeshStandardMaterial({color, roughness: .8, ...other});
  const materials = {
    foundation: material(0x253445),
    rim: material(0x51616a, {metalness: .16}),
    earth: material(0x424e53),
    tile: material(0xa8b5a2),
    paving: material(0xa1b6bb),
    sidewalk: material(0x84908f),
    street: material(0x29353e),
    stripe: material(0xd2c9ac),
    crossing: material(0xa4aa9f),
    grass: material(0x628b5c),
    grassDark: material(0x476d57),
    trunk: material(0x604a3d),
    trees: [material(0x507b53, {flatShading:true}), material(0x679565, {flatShading:true}), material(0x799e67, {flatShading:true})],
    glass: material(0x416473, {roughness:.24, metalness:.28}),
    roof: material(0xc5d2cc),
    steel: material(0x648993, {roughness:.55, metalness:.29}),
    dark: material(0x3c535a),
    light: material(0xedf3db),
    windowFrame: material(0x5a7271),
    asphalt: material(0x526269),
    water: material(0x21495e, {metalness:.18, roughness:.53}),
    ripples: material(0x477a89, {metalness:.28, roughness:.36}),
    solar: material(0x244d67, {metalness:.32, roughness:.25}),
    solarLine: material(0x8baab6, {metalness:.15}),
    clay: material(0xab745b),
    cargo: [material(0x9c674b), material(0x4b8392), material(0xb89652), material(0x708b78)],
  };
  const districts = {
    home: {x:-27, z:16.5, gate:[-27,9], radius:12.4, color:0xb0dc73, anchor:[-25,13.4,17]},
    work: {x:-25, z:-17, gate:[-23,-5], radius:12.6, color:0x69b9fc, anchor:[-24,17,-18]},
    clinic: {x:26, z:-11, gate:[24,-5], radius:11.2, color:0x55dcc5, anchor:[26,10,-12]},
    logistics: {x:25, z:18.5, gate:[26,9], radius:12.2, color:0xffc275, anchor:[25,9.5,18]},
    city: {x:1, z:-16, gate:[1,-5], radius:11.9, color:0xc9abf5, anchor:[2,25,-18]},
  };
  const turbines = [];
  const helper = new T.Object3D();

  function mesh(parent, geometry, surface, x, y, z, sx, sy, sz, shadow = true) {
    const model = new T.Mesh(geometry, surface);
    model.position.set(x, y, z);
    model.scale.set(sx, sy, sz);
    model.castShadow = shadow;
    model.receiveShadow = true;
    parent.add(model);
    return model;
  }

  function box(parent, surface, x, y, z, w, h, d, shadow = true) {
    return mesh(parent, cube, surface, x, y, z, w, h, d, shadow);
  }

  function pipe(parent, surface, from, to, radius) {
    const a = new T.Vector3(...from);
    const b = new T.Vector3(...to);
    const center = a.clone().add(b).multiplyScalar(.5);
    const model = mesh(parent, cylinder, surface, center.x, center.y, center.z, radius, a.distanceTo(b), radius);
    model.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
    return model;
  }

  function paving(parent, x, z, w, d, surface = materials.paving) {
    return box(parent, surface, x, .085, z, w, .18, d, false);
  }

  function flat(parent, geometry, surface, x, y, z, radius) {
    const model = mesh(parent, geometry, surface, x, y, z, radius, radius, 1, false);
    model.rotation.x = -Math.PI / 2;
    return model;
  }

  function tree(parent, x, z, size = 1.1, index = 0) {
    mesh(parent, cylinder, materials.trunk, x, .8 * size, z, .12 * size, 1.6 * size, .12 * size);
    mesh(parent, sphere, materials.trees[index % 3], x, 1.85 * size, z, .83 * size, 1.02 * size, .82 * size);
  }

  function hedge(parent, x, z, w, d) {
    box(parent, materials.grassDark, x, .38, z, w, .62, d);
  }

  function road(x, z, length, vertical) {
    const axis = (u, v) => vertical ? [x+v, z+u] : [x+u, z+v];
    paving(scene, x, z, vertical ? 5.2 : length, vertical ? length : 5.2, materials.sidewalk);
    const surface = box(scene, materials.street, x, .211, z, vertical ? 3.6 : length, .10, vertical ? length : 3.6, false);
    surface.receiveShadow = true;
    for (let n = -length / 2 + 2; n < length / 2 - 1; n += 4.2) {
      const [u, v] = axis(n, 0);
      box(scene, materials.stripe, u, .267, v, vertical ? .095 : 1.6, .013, vertical ? 1.6 : .095, false);
    }
  }

  function zebra(x, z, vertical) {
    for (let n = -1.4; n < 1.5; n += .45) {
      box(scene, materials.crossing, x+(vertical ? n : 0), .282, z+(vertical ? 0 : n), vertical ? .24 : 1.07, .018, vertical ? 1.07 : .24, false);
    }
  }

  box(scene, materials.water, 0, -.59, 0, 610, .24, 610, false);
  box(scene, materials.earth, -120, -.43, 0, 318, .84, 480, false);
  box(scene, materials.earth, 212, -.43, 0, 304, .84, 480, false);
  for (const x of [39, 60]) {
    box(scene, materials.rim, x, -.2, 0, .65, .57, 475, false);
    box(scene, materials.sidewalk, x, .09, 0, 1.32, .17, 475, false);
  }
  for (let index = 0; index < 71; index++) {
    const z = -173 + 5.05*index;
    box(scene, materials.ripples, 42.4 + (index % 7)*2.29, -.456, z, 1.45 + (index % 5)*.73, .014, .095, false);
    if (index % 2 === 0) tree(scene, 38.95, z, .76, index);
  }
  for (const z of [-103, -76, -53, -29, -5, 9, 30, 56, 84, 112]) road(-69, z, 211, false);
  for (const x of [-152,-123,-95,-66,-40,-15,12,37,64,94,122,152]) road(x, 0, 222, true);
  for (const z of [-76,-53,-29,-5,9,30,56,84]) road(127, z, 126, false);
  for (const x of [-40,-15,12,37]) {
    for (const z of [-29,-5,9,30]) {
      box(scene, materials.street, x, .27, z, 3.7, .027, 3.7, false);
      zebra(x, z - 2.45, true);
      zebra(x + 2.45, z, false);
    }
  }
  for (const z of [-53, -5, 9, 56]) {
    box(scene, materials.steel, 50, -.02, z, 27, .5, 4.3);
    box(scene, materials.street, 50, .23, z, 27, .10, 3.65, false);
    for (const edge of [-2.04, 2.04]) box(scene, materials.light, 50, .65, z+edge, 27, .22, .12, false);
    if (z === -53 || z === 56) {
      const tower = z === -53 ? -1 : 1;
      for (const edge of [-2.7,2.7]) {
        box(scene, materials.steel, 51, 4.1, z+edge, .44, 8.2, .54);
        for (const offset of [4,7,10]) pipe(scene, materials.rim, [51, 7.7, z+edge], [51+offset*tower, .64, z+edge], .045);
      }
    }
  }

  for (const [x, z, w, d] of [[-27, 1.8, 19.8, 7.5], [-2, 2, 19.6, 7.4], [25, 1.9, 20, 7.6], [-1,19.5,18.5,15.4]]) {
    paving(scene, x, z, w, d, materials.grass);
    paving(scene, x, z, 1.35, d, materials.sidewalk);
    paving(scene, x, z, w, 1.2, materials.sidewalk);
    for (let i=0; i<6; i++) {
      const tx = x + (-.42 + i*.166)*w;
      if (i !== 2 && i !== 3) tree(scene, tx, z + (i % 2 ? -.29 : .30)*d, .8 + (i % 2)*.22, i);
    }
  }
  for (const x of [-45,-35,-19,-10,7,16,32]) {
    tree(scene, x, -34.1, .87, Math.abs(x) % 3);
    tree(scene, x, 34.1, .86, (Math.abs(x)+1) % 3);
  }
  for (const x of [-13.1, 13.9]) {
    for (const z of [-25,-8,-1,4,13,26]) {
      mesh(scene, cylinder, materials.steel, x, 1.38, z, .11, 2.5, .11);
      box(scene, materials.light, x, 2.66, z, .55, .11, .33, false);
    }
  }

  const goldLight = material(0xe9c8a1, {emissive:0xf8b47b, emissiveIntensity:.65});
  const blueLight = material(0x8db2b7, {emissive:0x78c5c2, emissiveIntensity:.32});
  const siding = [material(0x696965), material(0x465d6c), material(0x87726a), material(0x6b7273), material(0x385263)];
  const cityGlass = material(0x3d5665, {metalness:.23, roughness:.36});
  const cityRoof = material(0x637076);
  const parcel = material(0x5c6668);
  const neighborhood = new T.Group();
  scene.add(neighborhood);
  let seed = 90281;
  function sample() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function cityBlock(x, z, tallness) {
    const courtyard = sample() < .19;
    paving(neighborhood, x, z, 19, 15.8, courtyard ? materials.grassDark : parcel);
    if (courtyard) {
      for (const tx of [-6, 0, 6]) tree(neighborhood,x+tx,z+5,1.13,Math.floor(sample()*3));
    }
    const buildings = courtyard ? 2 : 3;
    for (let index=0; index<buildings; index++) {
      const px = x - 5.5 + (index%2)*11 + (sample()-.5)*1.4;
      const pz = z - 3.7 + Math.floor(index/2)*8;
      const w = 4.8 + sample()*3.7;
      const d = 4.4 + sample()*2.6;
      const h = 3.9 + tallness*sample()**1.3;
      const facade = siding[Math.floor(sample()*siding.length)];
      box(neighborhood, materials.dark, px, .72, pz, w+.4, 1.1, d+.38);
      box(neighborhood, facade, px, h*.5+.25, pz, w, h, d);
      box(neighborhood, cityRoof, px, h+.35, pz, w+.23, .24, d+.24);
      box(neighborhood, materials.dark, px-.9, h+.79, pz+.4, w*.36, .8, d*.43);
      if (h>11) {
        for (const edge of [-1,1]) {
          box(neighborhood, cityGlass, px, h*.53, pz+edge*d*.503, w*.74, h*.79, .08, false);
          box(neighborhood, cityGlass, px+edge*w*.503, h*.53, pz, .08, h*.79, d*.71, false);
        }
      }
      for (let level=2; level<h-.45; level+=2.12) {
        for (const edge of [-1,1]) {
          const window = sample()>.48 ? goldLight : blueLight;
          box(neighborhood, window, px+.21, level, pz+edge*(d*.502+.04), w*(.25+sample()*.37), .21, .03, false);
          box(neighborhood, window, px+edge*(w*.502+.04), level, pz-.1, .03, .21, d*(.26+sample()*.37), false);
        }
      }
      for (const edge of [-1,1]) {
        box(neighborhood, cityRoof, px+edge*w*.36, h*.53, pz+d*.508, .10, h*.83, .13, false);
      }
    }
  }

  for (const z of [-91,-66,-41]) {
    for (const x of [-134,-109,-80,-53,-27,-1,24,78,108,137]) cityBlock(x,z,19+Math.abs(z)*.15);
  }
  for (const z of [-17,18,43,69]) {
    for (const x of [-109,-80,-53,78,108,137]) cityBlock(x,z,z<25 ? 21 : 7);
  }
  for (const z of [43,69]) {
    for (const x of [-27,-1,24]) cityBlock(x,z,3);
  }

  // Small park fixtures and lit street edges help establish real-world scale.
  for (const x of [-37.8,-17.5,14.4,34.6]) {
    for (const z of [-27,-21,-15,-9,1.6,13.6,20.5,26.6,33.4]) {
      mesh(scene,cylinder,materials.steel,x,1.63,z,.075,2.9,.075);
      box(scene,goldLight,x,3.08,z,.54,.13,.26,false);
    }
  }
  for (const z of [14.5,18,21.5,25]) {
    const x = z % 2 ? -.4 : 3.2;
    box(scene,materials.clay,x,.58,z,1.9,.16,.37);
    box(scene,materials.dark,x,.35,z,1.4,.29,.14);
  }

  function startDistrict(id, colors) {
    const data = districts[id];
    data.root = new T.Group();
    data.root.userData.district = id;
    scene.add(data.root);
    selectionRoots.push(data.root);
    data.surface = colors.map((tone) => material(tone));
    data.window = material(0x7194a0, {metalness:.25, roughness:.35, emissive:0xffb871, emissiveIntensity:.12});
    data.windows = [];
    data.anchor = new T.Vector3(...data.anchor);
    data.highlight = flat(scene, ring, new T.MeshBasicMaterial({
      color:data.color, transparent:true, opacity:.8, side:T.DoubleSide, depthWrite:false,
    }), data.x, .322, data.z, data.radius);
    data.highlight.visible = false;
    return data;
  }

  function building(data, x, z, w, h, d, face = 0, windowRows = true) {
    const base = data.root;
    box(base, materials.sidewalk, x, .25, z, w+1, .34, d+1);
    box(base, data.surface[face], x, h/2+.28, z, w, h, d);
    box(base, materials.roof, x, h+.34, z, w+.32, .25, d+.32);
    if (!windowRows) return;
    box(base, materials.dark, x, .78, z, w+.16, .92, d+.16);
    box(base, materials.steel, x, h+.52, z, w*.87, .12, d*.87, false);
    for (const edge of [-1,1]) {
      box(base, materials.windowFrame, x+edge*(w*.5-.18), h*.55+.27, z+d*.503, .12, h*.87, .12, false);
      box(base, materials.windowFrame, x+w*.503, h*.55+.27, z+edge*(d*.5-.18), .12, h*.87, .12, false);
    }
    const rows = Math.max(1, Math.floor((h-.8)/1.58));
    const columns = Math.max(1, Math.floor((w-1)/1.45));
    const side = Math.max(1, Math.floor((d-1)/1.45));
    for (let row = 0; row < rows; row++) {
      const y = 1.1 + (row+.1)*(h-1.2)/rows;
      for (let col=0; col<columns; col++) {
        const px = x + ((col+.5)/columns-.5)*(w-1);
        data.windows.push([px,y,z+d/2+.017,.88,.63,.06], [px,y,z-d/2-.017,.88,.63,.06]);
      }
      for (let col=0; col<side; col++) {
        const pz = z + ((col+.5)/side-.5)*(d-1);
        data.windows.push([x+w/2+.017,y,pz,.06,.63,.88], [x-w/2-.017,y,pz,.06,.63,.88]);
      }
    }
  }

  function panels(parent, x, y, z, columns, rows, size = 1) {
    for (let row=0; row<rows; row++) {
      for (let col=0; col<columns; col++) {
        const px=x+col*1.24*size, pz=z+row*.95*size;
        const panel = box(parent, materials.solar, px, y, pz, 1.12*size, .14*size, .83*size);
        panel.rotation.x = -.19;
        box(parent, materials.solarLine, px, y+.082*size, pz, .025, .018, .73*size, false);
      }
    }
  }

  const home = startDistrict('home', [0xd6c4a1, 0xb2c4ad, 0xd3a588]);
  paving(home.root, -27.6, 19.1, 19.7, 16.1);
  building(home, -32.4, 16.3, 5.4, 9.2, 5.9);
  building(home, -24.5, 15.2, 6.3, 12.2, 5.4, 1);
  building(home, -32.5, 24.2, 5.4, 6.7, 4.7, 2);
  building(home, -22.7, 23.5, 6.2, 8.7, 4.7, 0);
  panels(home.root,-25.75,12.66,14.4,3,2,.78);
  hedge(home.root,-32.4,12.1,5.4,.58);
  hedge(home.root,-23.6,27.1,6.4,.6);
  paving(home.root,-27.1,21.4,3.55,3.35,materials.grassDark);
  for (const [x,z] of [[-28.3,20.7],[-26.6,23],[-35.8,17],[-19.2,19.3],[-20,26.4]]) tree(home.root,x,z,.86,1);
  for (const [x,z] of [[-29,24],[-27,25],[-25.3,26.4]]) {
    box(home.root,materials.clay,x,.65,z,1.04,.18,.40);
    box(home.root,materials.steel,x,.35,z,.78,.48,.16);
  }

  const work = startDistrict('work',[0x7c9ca7,0xa7826f,0x8ba2a0]);
  paving(work.root,-27.2,-17.2,21.2,18.3);
  building(work,-31.2,-18.8,7.1,14.8,7.2,0);
  building(work,-21.5,-18.7,6.5,5.8,9.7,1,false);
  building(work,-27.2,-10.8,11.3,3.4,3.4,2,false);
  box(work.root, materials.glass,-27.2,1.85,-8.95,10,1.52,.18);
  for (let n=0;n<3;n++) {
    const fan = mesh(work.root,cylinder,materials.steel,-23.75+n*2.22,6.4,-20.5,.68,.5,.68);
    fan.castShadow = false;
    box(work.root,materials.dark,-23.75+n*2.22,6.68,-20.5,.8,.08,.8,false);
  }
  for (let n=0;n<2;n++) pipe(work.root,materials.steel,[-22.4+n*2.4,6.1,-15.6],[-22.4+n*2.4,8.2,-15.6],.29);
  panels(work.root,-33.4,15.21,-21.1,4,4,.78);
  for (const [x,z] of [[-35.6,-11.2],[-20.7,-10.4],[-36.7,-22.6],[-18.4,-14.3]]) tree(work.root,x,z,.92,0);

  const clinic = startDistrict('clinic',[0xc5d5d0,0x91b9ae,0xc6c9a8]);
  paving(clinic.root,24,-16.5,20.6,17.8);
  building(clinic,25.7,-16.6,10.8,7.4,9.0,0);
  building(clinic,18.2,-17.9,4.6,4.6,6.3,1);
  building(clinic,29.1,-10.9,5.3,3.3,3.4,2,false);
  box(clinic.root,materials.glass,26.9,1.6,-11.91,5.1,2.14,.18);
  box(clinic.root,materials.light,26.8,3,-11.03,7.2,.28,1.86);
  const clinicMark = material(0x22ae9f,{emissive:0x1b6059,emissiveIntensity:.45});
  box(clinic.root,clinicMark,25.7,7.99,-16.6,3.34,.16,.94,false);
  box(clinic.root,clinicMark,25.7,8.0,-16.6,.94,.17,3.34,false);
  paving(clinic.root,21.7,-9.25,4.8,2.2,materials.asphalt);
  for (const x of [18,19.6,33.4]) tree(clinic.root,x,-9.1,.75,1);
  for (const x of [17,19,32,34]) tree(clinic.root,x,-24.1,.72,2);
  clinic.anchor.set(25.7,10.5,-15.9);

  const logistics = startDistrict('logistics',[0xb79d70,0x93a5a3,0x947e62]);
  paving(logistics.root,24.8,18.8,20.1,16.2,materials.asphalt);
  building(logistics,25,20.5,13,4.4,9.1,0,false);
  for (let n=0;n<6;n++) {
    const roof = box(logistics.root,materials.light,19.5+2.2*n,5.01,20.5,2.15,.36,8.8);
    roof.rotation.z = .18;
    box(logistics.root,materials.dark,19.6+2.16*n,1.66,15.86,1.22,1.82,.15,false);
    paving(logistics.root,19.6+2.16*n,14.15,1.2,2.6,materials.paving);
  }
  building(logistics,32.8,25,3.7,3,4.1,1);
  box(logistics.root,goldLight,25,2.87,15.62,7.2,.22,.13,false);
  box(logistics.root,goldLight,25,5.38,16.9,3.1,.12,.36,false);
  box(logistics.root,goldLight,25,5.39,16.9,.36,.12,2.25,false);
  panels(logistics.root,20.65,5.34,21.8,7,2,.84);
  for (let n=0;n<6;n++) {
    const x=18.6+n*2.17;
    box(logistics.root,materials.cargo[n%4],x,.76,26.6,1.73,1.08,1.32);
    if (n%2===1) box(logistics.root,materials.cargo[(n+1)%4],x,1.83,26.6,1.73,1.08,1.32);
  }
  tree(logistics.root,16.6,13.2,.76,1);
  tree(logistics.root,34,12.9,.75,2);

  const city = startDistrict('city',[0x85a5a8,0xabb9b2,0x7e8ca7]);
  paving(city.root,-1.4,-16.6,19.9,18.1);
  building(city,1.3,-18.2,6.4,21.5,6.1,0);
  building(city,-5.1,-18.4,5.5,11.1,5.9,2);
  building(city,5.6,-10.8,5.7,3.3,4.5,1,false);
  for (const x of [-1.35, .1, 1.5, 2.9, 4]) {
    box(city.root,materials.light,x,11.02,-14.99,.12,20.9,.30);
  }
  const roofRing = new T.MeshBasicMaterial({color:0xd5c4f8,side:T.DoubleSide});
  flat(city.root,ring,roofRing,1.3,21.98,-18.2,2.28);
  box(city.root,materials.steel,1.3,23.2,-18.2,.16,2.65,.16);
  mesh(city.root,sphere,material(0xc3aeff,{emissive:0x815ddb,emissiveIntensity:.9}),1.3,24.49,-18.2,.31,.31,.31,false);
  panels(city.root,-9.25,.79,-11.35,5,3,.87);
  for (let n=0;n<3;n++) {
    box(city.root,materials.steel,6.85+.99*n,.95,-22, .77,1.55,1.35);
    box(city.root,materials.light,6.85+.99*n,1.22,-21.30,.34,.25,.04,false);
  }
  for (const [x,z] of [[-8,-24.5], [8.1,-24.1]]) {
    pipe(city.root,materials.light,[x,.23,z],[x,7.1,z],.16);
    const wheel = new T.Group();
    wheel.position.set(x,7,z+.36);
    wheel.rotation.y = .3;
    city.root.add(wheel);
    const blades = new T.Group();
    wheel.add(blades);
    mesh(blades,sphere,materials.steel,0,0,0,.22,.22,.22,false);
    for (let n=0;n<3;n++) {
      const arm=new T.Group();
      arm.rotation.z=n*Math.PI*2/3;
      blades.add(arm);
      box(arm,materials.light,0,1.02,0,.19,1.97,.08,false).rotation.z=.12;
    }
    turbines.push(blades);
  }

  for (const data of Object.values(districts)) {
    const windows = new T.InstancedMesh(cube, data.window, data.windows.length);
    data.windows.forEach(([x,y,z,w,h,d], index) => {
      helper.position.set(x,y,z);
      helper.scale.set(w,h,d);
      helper.updateMatrix();
      windows.setMatrixAt(index,helper.matrix);
    });
    data.root.add(windows);
    data.windows = windows;
  }

  function instanceStaticMeshes(parent) {
    const batches = new Map();
    for (const item of parent.children) {
      if (!item.isMesh || item.isInstancedMesh || !item.material.isMeshStandardMaterial) continue;
      const key = `${item.geometry.uuid}|${item.material.uuid}|${item.castShadow}|${item.receiveShadow}`;
      if (!batches.has(key)) batches.set(key, []);
      batches.get(key).push(item);
    }
    for (const batch of batches.values()) {
      if (batch.length < 3) continue;
      const [first] = batch;
      const instances = new T.InstancedMesh(first.geometry, first.material, batch.length);
      instances.castShadow = first.castShadow;
      instances.receiveShadow = first.receiveShadow;
      batch.forEach((item, index) => {
        item.updateMatrix();
        instances.setMatrixAt(index, item.matrix);
        parent.remove(item);
      });
      instances.computeBoundingSphere();
      parent.add(instances);
    }
  }

  instanceStaticMeshes(scene);
  instanceStaticMeshes(neighborhood);
  for (const data of Object.values(districts)) instanceStaticMeshes(data.root);

  const powerColor = new T.Color(0x81ffd0);
  const constrainedColor = new T.Color(0xffa560);
  const coolColor = 0x70deff;
  const lightWindow = new T.Color(0xffd4a0);
  const darkWindow = new T.Color(0x243746);
  const tintedWindow = new T.Color();
  const stateColor = new T.Color();
  const lineColor = new T.Color();
  const unit = (value, fallback = 0) => Number.isFinite(value) ? T.MathUtils.clamp(value, 0, 1) : fallback;
  const signal = (color, opacity = 1) => new T.MeshBasicMaterial({
    color, transparent:true, opacity, depthWrite:false, toneMapped:false,
  });

  function route(points) {
    const path = new T.CurvePath();
    for (let index=1; index<points.length; index++) {
      path.add(new T.LineCurve3(new T.Vector3(...points[index-1]), new T.Vector3(...points[index])));
    }
    return path;
  }

  function rail(path, radius, surface, order) {
    const line = new T.Mesh(new T.TubeGeometry(path, 50, radius, 5, false), surface);
    line.renderOrder = order;
    scene.add(line);
    return line;
  }

  const feedLines = Object.fromEntries(Object.entries({
    work: [[1,.5,-4.45],[-23,.5,-4.45]],
    clinic: [[1,.5,-5.65],[24,.5,-5.65]],
    home: [[1,.5,-4.45],[-15.45,.5,-4.45],[-15.45,.5,10.06],[-27,.5,10.06]],
    logistics: [[1,.5,-5.65],[12.4,.5,-5.65],[12.4,.5,10.06],[26,.5,10.06]],
  }).map(([id, points]) => {
    const path = route(points);
    const surface = signal(powerColor,.7);
    const line = rail(path,.12,surface,12);
    const nodes = Array.from({length:3}, () => mesh(scene,sphere,surface,0,0,0,.38,.38,.38,false));
    for (const node of nodes) node.renderOrder=13;
    return [id, {path,line,surface,nodes}];
  }));

  const shuttlePath = route([[-27,.45,8.17],[28,.45,8.17],[28,.45,9.33],[-27,.45,9.33],[-27,.45,8.17]]);
  const shuttleRail = rail(shuttlePath,.18,signal(coolColor,.83),15);
  const shuttleBody = material(0x82dbea,{emissive:0x39a5b6,emissiveIntensity:.38,roughness:.44});
  const shuttleLights = signal(0xdafffb);
  const fleet = Array.from({length:6}, () => {
    const coach = new T.Group();
    box(coach,materials.dark,0,.31,0,2.52,.36,1.08,false);
    box(coach,shuttleBody,0,.66,0,2.52,.61,1.01,false);
    box(coach,materials.glass,-.08,.77,0,2.01,.31,1.03,false);
    box(coach,shuttleLights,1.27,.46,.31,.055,.15,.22,false);
    box(coach,shuttleLights,1.27,.46,-.31,.055,.15,.22,false);
    scene.add(coach);
    return coach;
  });

  const chargeCells = Array.from({length:6}, (_, index) => {
    const x = -2.75 + index*.84;
    box(city.root,materials.dark,x,.66,-9.83,.73,.9,1.55,false);
    return box(city.root,signal(powerColor),x,1.14,-9.83,.58,.09,1.31,false);
  });
  const batteryPath = route([[-2.75,1.2,-9.83],[1.4,1.2,-9.83],[1.4,.5,-5.6]]);
  const batteryLine = rail(batteryPath,.13,signal(0xc5abff,.91),14);
  const batteryPulse = mesh(scene,sphere,signal(0xe6d1ff),0,0,0,.41,.41,.41,false);

  const waterTank = new T.CylinderGeometry(1.24,1.24,2.8,24);
  for (const x of [7.7,10.6]) {
    mesh(city.root,waterTank,materials.steel,x,1.48,-14.8,1,1,1);
    const lid = mesh(city.root,cylinder,materials.glass,x,3,-14.8,1.26,.27,1.26,false);
    lid.material = material(0x2d839c,{emissive:0x196f9b,emissiveIntensity:.3});
    (city.waterLids ||= []).push(lid);
  }

  const shelterLights = [];
  for (let n=0;n<4;n++) {
    const x=19.5+3.3*n;
    const lamp=box(logistics.root,signal(coolColor),x,2.43,15.60,2.19,.32,.07,false);
    shelterLights.push(lamp);
    box(logistics.root,materials.dark,x,1.08,13.22,.15,1.74,.15,false);
    const canopy=box(logistics.root,shuttleBody,x,2,13.26,2.84,.13,2.28,false);
    canopy.rotation.z=.11;
  }
  const coolingWave = flat(scene,ring,signal(coolColor,.49),25,.372,17.9,12.7);
  coolingWave.renderOrder=10;
  const productionFans = Array.from({length:3}, (_, index) => {
    const rotor = new T.Group();
    rotor.position.set(-23.75+index*2.22,6.77,-20.5);
    box(rotor,materials.light,0,0,0,1.12,.09,.16,false);
    box(rotor,materials.light,0,0,0,.16,.09,1.12,false);
    work.root.add(rotor);
    return rotor;
  });

  for (const data of Object.values(districts)) {
    data.windows.material = new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
    data.windowLevel = -1;
    data.halo = flat(scene, disk, signal(constrainedColor,.16),data.x,.364,data.z,data.radius*.92);
    data.halo.renderOrder=4;
    const badge = new T.Group();
    badge.position.copy(data.anchor).add(new T.Vector3(5.5,.9,0));
    const outline = signal(0x211712,.94);
    const accent = signal(constrainedColor);
    const back = mesh(badge,disk,outline,0,0,0,1.26,1.26,1,false);
    const edge = mesh(badge,ring,accent,0,0,.024,1.27,1.27,1,false);
    const line = box(badge,accent,0,.22,.06,.22,.65,.07,false);
    const dot = box(badge,accent,0,-.39,.06,.22,.21,.07,false);
    for (const part of [back,edge,line,dot]) part.renderOrder=26;
    scene.add(badge);
    data.warning=badge;
  }

  const daylight = new T.Color(0xffe7bd);
  const hotSun = new T.Color(0xffbd85);
  const sky = new T.Color(0xc8def2);
  const coldFog = new T.Color(0x26384e);
  const hotFog = new T.Color(0x70565a);
  function updateCrisis(source, selected) {
    const power = source.power || {};
    const incident = Number(source.stage) > 0;
    const grid = unit(source.grid,1);
    const hot = incident ? .33 + (1-grid)*.45 : .05;
    const shuttleCount = Math.max(0,Math.min(fleet.length,Math.ceil(Number(source.shuttles) || 0)));
    sun.color.copy(daylight).lerp(hotSun,hot);
    sun.intensity=1.82;
    ambient.color.copy(sky);
    ambient.intensity=1.55;
    scene.fog.color.copy(coldFog).lerp(hotFog,hot*.75);

    for (const [id,data] of Object.entries(districts)) {
      const level=unit(power[id],1);
      const windowLevel=Math.round(level*16);
      if (data.windowLevel!==windowLevel) {
        data.windowLevel=windowLevel;
        for (let i=0; i<data.windows.count; i++) {
          const lit = (i*73+19)%127 < windowLevel/16*127;
          const mix = lit ? .57+(i%7)*.055 : .02;
          tintedWindow.copy(darkWindow).lerp(lightWindow,mix);
          data.windows.setColorAt(i,tintedWindow);
        }
        data.windows.instanceColor.needsUpdate=true;
      }
      const deficient = incident && level<.89;
      stateColor.copy(powerColor).lerp(constrainedColor, deficient ? 1 : 0);
      data.highlight.visible=incident || selected===id;
      data.highlight.material.color.copy(stateColor);
      data.highlight.material.opacity=selected===id ? .95 : deficient ? .82 : .57;
      data.halo.visible=deficient;
      data.halo.material.opacity=.1 + (1-level)*.15;
      data.warning.visible=incident && (level<.62 || id==='city' && source.outage);
      if (data.warning.visible) {
        data.warning.quaternion.copy(camera.quaternion);
        data.warning.scale.setScalar(.97 + Math.sin(flowTime*4)*.07);
      }
      const feed=feedLines[id];
      if (!feed) continue;
      feed.line.visible=incident;
      lineColor.copy(constrainedColor).lerp(powerColor,T.MathUtils.smoothstep(level,.45,.89));
      feed.surface.color.copy(lineColor);
      feed.surface.opacity=.22 + .62*level;
      feed.nodes.forEach((node,index) => {
        node.visible=incident && index < Math.ceil(level*feed.nodes.length);
        if (node.visible) node.position.copy(feed.path.getPointAt((flowTime*(.22+level*.17)+index/3)%1));
      });
    }

    clinicMark.emissiveIntensity = .12 + unit(power.clinic,1)*1.05;
    for (const lid of city.waterLids) lid.material.emissiveIntensity=unit(power.city,1)*.82;
    const shelterLevel=unit(power.logistics,1);
    for (const lamp of shelterLights) lamp.material.opacity=.12 + shelterLevel*.88;
    coolingWave.visible=incident && shelterLevel>=.78;
    if (coolingWave.visible) {
      const beat=(flowTime*.48)%1;
      const size=10 + beat*3.3;
      coolingWave.scale.set(size,size,1);
      coolingWave.material.opacity=.64 - beat*.34;
    }
    const industry=unit(power.work,1);
    for (const fan of productionFans) fan.rotation.y=industry>=.75 ? flowTime*(1.4+industry*3) : 0;
    const reserve=unit(source.storage,1);
    for (const [index,cell] of chargeCells.entries()) {
      const fraction=T.MathUtils.clamp(reserve*chargeCells.length-index,0,1);
      cell.material.color.copy(constrainedColor).lerp(powerColor,fraction);
      cell.material.opacity=.28 + fraction*.72;
    }
    batteryLine.visible=batteryPulse.visible=incident && unit(source.battery)>0;
    if (batteryPulse.visible) batteryPulse.position.copy(batteryPath.getPointAt((flowTime*.68+.4)%1));
    shuttleRail.visible=incident && shuttleCount>0;
    fleet.forEach((coach,index) => {
      coach.visible=incident && index<shuttleCount;
      if (!coach.visible) return;
      const fraction=(flowTime*.19+(index+.45)/shuttleCount)%1;
      coach.position.copy(shuttlePath.getPointAt(fraction));
      const direction=shuttlePath.getTangentAt(fraction);
      coach.rotation.y=Math.atan2(-direction.z,direction.x);
    });
    turbines.forEach((item,index) => {item.rotation.z=flowTime*(.88+.21*index);});
  }

  function resize() {
    const bounds=canvas.getBoundingClientRect();
    const nextWidth=Math.max(1, Math.round(bounds.width));
    const nextHeight=Math.max(1, Math.round(bounds.height));
    if (nextWidth===width && nextHeight===height) return;
    width=nextWidth;
    height=nextHeight;
    renderer.setSize(width,height,false);
    cameraMoving=true;
  }

  const lookTarget = new T.Vector3();
  const normalPose = () => ({
    x:focusPoint.x, y:focusPoint.y, z:focusPoint.z, heading, tilt, distance:106*scale, fit:1.11,
  });

  function setCamera(pose) {
    camera.aspect=width/height;
    const fit = Math.max(1,pose.fit/camera.aspect);
    const distance = pose.distance*Math.min(fit,1.82);
    const flatDistance = distance*Math.cos(pose.tilt);
    camera.position.set(
      pose.x+flatDistance*Math.sin(pose.heading),
      pose.y+distance*Math.sin(pose.tilt),
      pose.z+flatDistance*Math.cos(pose.heading),
    );
    camera.lookAt(lookTarget.set(pose.x,pose.y,pose.z));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function draw(view) {
    resize();
    const now=performance.now();
    const elapsed=previousDraw ? Math.min((now-previousDraw)/1000,.08) : 0;
    previousDraw=now;
    if (view.running) flowTime+=elapsed;
    if (focusPoint.distanceToSquared(destination)>.0003) {
      focusPoint.lerp(destination,.16);
      cameraMoving=true;
    }
    const cityState=view.citySystem || {};
    const key=JSON.stringify([view.hour,view.selected,cityState]);
    if (!cameraMoving && key===previousKey && !view.running) return false;
    if (!cameraMoving && view.running && now-previousRender<28) return false;
    if (cameraMoving) setCamera(normalPose());
    cameraMoving=false;
    previousKey=key;
    updateCrisis(cityState, view.selected);
    renderer.render(scene,camera);
    previousRender=now;
    return true;
  }

  function project(id) {
    const anchor=districts[id]?.anchor;
    if (!anchor || !width || !height) return {x:0,y:0,visible:false};
    projectPoint.copy(anchor).project(camera);
    return {
      x:(projectPoint.x+1)*width/2,
      y:(1-projectPoint.y)*height/2,
      visible:Math.abs(projectPoint.x)<1.06 && Math.abs(projectPoint.y)<1.06 && Math.abs(projectPoint.z)<1,
    };
  }

  function orbit(dx,dy) {
    heading-=dx*.009;
    tilt=T.MathUtils.clamp(tilt+dy*.006,.38,1.4);
    cameraMoving=true;
  }

  function zoom(delta) {
    scale=T.MathUtils.clamp(scale*Math.exp(delta*.0013),.42,1.65);
    cameraMoving=true;
  }

  function resetCamera() {
    heading=defaultHeading;
    tilt=defaultTilt;
    scale=1;
    destination.copy(defaultFocus);
    cameraMoving=true;
  }

  function focus(id) {
    const data=districts[id];
    if (!data) return;
    destination.set(data.x,1,data.z);
    scale=.54;
    cameraMoving=true;
  }

  function pick(x,y) {
    const bounds=canvas.getBoundingClientRect();
    pointer.set((x-bounds.left)/bounds.width*2-1, 1-(y-bounds.top)/bounds.height*2);
    raycaster.setFromCamera(pointer,camera);
    for (const hit of raycaster.intersectObjects(selectionRoots,true)) {
      let item=hit.object;
      while (item && !item.userData.district) item=item.parent;
      if (item) {
        onPick(item.userData.district);
        break;
      }
    }
  }

  const pointers=new Map();
  let moved=false;
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button!==0 && event.pointerType!=='touch') return;
    if (!pointers.size) moved=false;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,travel:0});
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    const previous=pointers.get(event.pointerId);
    if (!previous) return;
    const dx=event.clientX-previous.x, dy=event.clientY-previous.y;
    const other=[...pointers.entries()].find(([id]) => id!==event.pointerId)?.[1];
    if (other) {
      const before=Math.hypot(previous.x-other.x,previous.y-other.y);
      const after=Math.hypot(event.clientX-other.x,event.clientY-other.y);
      zoom((before-after)*3);
      moved=true;
    } else {
      previous.travel+=Math.hypot(dx,dy);
      if (previous.travel>4) moved=true;
      if (moved) orbit(dx,dy);
    }
    previous.x=event.clientX;
    previous.y=event.clientY;
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointers.delete(event.pointerId)) return;
    if (!moved && !pointers.size) pick(event.clientX,event.clientY);
  });
  canvas.addEventListener('pointercancel', (event) => pointers.delete(event.pointerId));
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoom(event.deltaY*(event.deltaMode===1 ? 15 : 1));
  }, {passive:false});
  renderer.shadowMap.needsUpdate=true;

  return {draw,project,orbit,zoom,resetCamera,focus};
}
