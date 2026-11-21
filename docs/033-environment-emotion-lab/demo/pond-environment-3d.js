import * as THREE from './vendor/three.module.js';
import { createPondMaterials } from './pond-materials.js';

// The environment is geometry throughout; the open centre is reserved for water.
export function createEnvironment3D() {
  const group = new THREE.Group();
  const pbr=createPondMaterials();
  group.name = 'Woodland pond environment';
  const geometries = new Set(), materials = new Set();
  const batches = new Map(), uniforms = { time: { value: 0 }, wind: { value: .5 } };
  let seed = 73191;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const range = (a, b) => a + random() * (b - a);
  const geom = value => { geometries.add(value); return value; };
  const material = options => { const m = new THREE.MeshStandardMaterial(options); materials.add(m); return m; };
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3();
  const rotation = new THREE.Euler(), quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);

  const wood = material({ color: '#bf9a6f', roughness: .88, ...pbr.maps('wood_planks_grey',[.28,1.2],0,.38) });
  const darkWood = material({ color: '#615044', roughness: .95, ...pbr.maps('wood_planks_grey',[.3,1.2],0,.42) });
  const paleWood = material({ color: '#c5ac84', roughness: .83, ...pbr.maps('wood_planks_grey',[.28,1.2],0,.38) });
  const deckWood = material({ color: '#a18e6c', roughness: .87, ...pbr.maps('wood_planks_grey',[.22,1.5],Math.PI/2,.48) });
  const bark = material({ color: '#aaa69a', roughness: .98, ...pbr.maps('bark_brown_02',[1.1,2.8],0,.65) });
  const stone = material({ color: '#b4b7aa', roughness: .95, ...pbr.maps('mossy_rock',[.65,.65],0,.6) });
  const slate = material({ color: '#546969', roughness: .8, ...pbr.maps('mossy_rock',[.7,.9],0,.22) });
  const leaves = material({ color: '#bcd4a5', roughness: .9, side: THREE.DoubleSide });
  const grass = material({ color: '#afc290', roughness: 1, side: THREE.DoubleSide });
  const distantFoliage = material({ color: '#c2d0ae', roughness: .94, side:THREE.DoubleSide });
  const forestLitter = material({ color: '#6b6040', roughness: 1, side: THREE.DoubleSide });
  const reeds = material({ color: '#718453', roughness: .93 });
  const cattail = material({ color: '#5b3d2d', roughness: 1 });
  const flowers = material({ color: '#fff9e8', roughness: .7 });
  const metal = material({ color: '#383d35', roughness: .5, metalness: .55 });
  const windowGlow = material({ color: '#75532e', emissive: '#ffb760', emissiveIntensity: .6, roughness: .65 });
  const glass = material({color:'#a4c3bb',metalness:.05,roughness:.16,transparent:true,opacity:.22,depthWrite:false});

  function windShader(mat, strength, kind) {
    const modify = shader => {
      shader.uniforms.uEnvironmentTime = uniforms.time;
      shader.uniforms.uEnvironmentWind = uniforms.wind;
      shader.vertexShader = 'uniform float uEnvironmentTime;\nuniform float uEnvironmentWind;\nvarying vec2 vLeafUV;\n' + shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vLeafUV=uv;');
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 anchor = instanceMatrix[3].xyz;
          float phase = anchor.x * .87 + anchor.z * .63;
          float gust = .48 + .28 * sin(uEnvironmentTime * .39 + anchor.x * .12 - anchor.z * .09) + .19*sin(uEnvironmentTime*.173+anchor.z*.27);
          float wave = sin(uEnvironmentTime * .91 + phase) * .65 + sin(uEnvironmentTime * 1.73 + phase * 1.83) * .24;
          float flutter = sin(uEnvironmentTime * (3.2+fract(phase)*1.4) + phase * 4.7) * .13;
          float tip = ${kind === 'leaf' ? 'clamp((position.y + .06) / .95, 0.0, 1.0)' : 'clamp(position.y, 0.0, 1.0)'};
          transformed.x += (wave * gust + flutter * tip) * tip * uEnvironmentWind * ${strength.toFixed(2)};
          transformed.z += cos(uEnvironmentTime * .83 + phase) * tip * tip * uEnvironmentWind * ${(strength * .35).toFixed(2)};
        #endif
      `);
      if(!shader.fragmentShader.includes('DEPTH_PACKING')) {
        shader.fragmentShader='varying vec2 vLeafUV;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
          float midrib=exp(-abs(vLeafUV.x-.5)*95.);
          float veins=pow(max(0.,cos((vLeafUV.y-abs(vLeafUV.x-.5)*.62)*76.)),18.)*.24;
          float edgeShade=.85+.15*sin(vLeafUV.x*3.14159);
          diffuseColor.rgb*=edgeShade*(1.+midrib*.12+veins*.10);
        `);
      }
    };
    mat.onBeforeCompile = modify;
    mat.customProgramCacheKey = () => `pond-${kind}-${strength}`;
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
    depth.onBeforeCompile = modify;
    depth.customProgramCacheKey = () => `pond-depth-${kind}-${strength}`;
    materials.add(depth); mat.userData.windDepthMaterial = depth;
  }
  windShader(leaves, .45, 'leaf'); windShader(grass, .30, 'grass'); windShader(distantFoliage,.2,'leaf');

  const box = geom(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = geom(new THREE.CylinderGeometry(.78, 1, 1, 9));
  const roundCylinder = geom(new THREE.CylinderGeometry(1, 1, 1, 12));
  const sphere = geom(new THREE.SphereGeometry(1, 12, 8));
  const petalGeometry=geom(new THREE.SphereGeometry(1,8,5));
  const rockGeometry = geom(new THREE.IcosahedronGeometry(1, 2));
  const rp = rockGeometry.attributes.position;
  for (let i = 0; i < rp.count; i++) {
    const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i);
    const n = 1 + .10 * Math.sin(x * 4.1 + y * 3.7 + z * 5.2)+.023*Math.sin(x*21-y*17+z*25);
    rp.setXYZ(i, x * n, y * n*.88, z * n);
  }
  rockGeometry.computeVertexNormals();
  const leafGeometry = geom(new THREE.BufferGeometry()), leafVertices=[], leafIndices=[],leafUV=[];
  // Curved oval blades with a rounded outline and a raised midrib, rather than diamond cards.
  for(let row=0;row<=6;row++) {
    const t=row/6, width=Math.pow(Math.sin(Math.PI*t),.76)*.255;
    for(let col=-1;col<=1;col++) {leafVertices.push(col*width*(col<0?.94:1.04),t*.96,Math.sin(Math.PI*t)*(.085-Math.abs(col)*.055)+t*t*.065);leafUV.push((col+1)/2,t);}
  }
  for(let row=0;row<6;row++) for(let col=0;col<2;col++) {
    const a=row*3+col; leafIndices.push(a,a+1,a+3,a+1,a+4,a+3);
  }
  leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(leafVertices,3));
  leafGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(leafUV,2));
  leafGeometry.setIndex(leafIndices);
  leafGeometry.computeVertexNormals();
  const farLeafGeometry=geom(new THREE.BufferGeometry());
  farLeafGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.22,.45,.02,0,.45,.07,.22,.45,.02,0,.95,.03],3));
  farLeafGeometry.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.5,.5,.5,1,.5,.5,1],2));
  farLeafGeometry.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);farLeafGeometry.computeVertexNormals();
  const bladeGeometry = geom(new THREE.BufferGeometry());
  bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -.055, 0, 0, .055, 0, 0, -.036, .5, .08, .036, .5, .08, 0, 1, .27,
  ], 3));
  bladeGeometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,.5,1,.5,.5,1],2));
  bladeGeometry.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]); bladeGeometry.computeVertexNormals();

  function instance(geometry, mat, p, s, r = [0, 0, 0], color = null) {
    const key = `${geometry.uuid}:${mat.uuid}`;
    if (!batches.has(key)) batches.set(key, { geometry, material: mat, items: [] });
    position.fromArray(p); scale.fromArray(s); rotation.set(...r); quaternion.setFromEuler(rotation);
    matrix.compose(position, quaternion, scale);
    batches.get(key).items.push({ matrix: matrix.clone(), color });
  }
  function beam(a, b, radius, mat = wood, taper = true, color = null) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
    const delta = bv.clone().sub(av), length = delta.length();
    quaternion.setFromUnitVectors(up, delta.normalize());
    matrix.compose(av.add(bv).multiplyScalar(.5), quaternion, new THREE.Vector3(radius, length, radius));
    const geometry = taper ? cylinder : roundCylinder, key = `${geometry.uuid}:${mat.uuid}`;
    if (!batches.has(key)) batches.set(key, { geometry, material: mat, items: [] });
    batches.get(key).items.push({ matrix: matrix.clone(), color });
  }
  function mesh(geometry, mat, p, s = [1, 1, 1], r = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, mat); object.position.fromArray(p); object.scale.fromArray(s); object.rotation.set(...r);
    object.castShadow = object.receiveShadow = true; group.add(object); return object;
  }

  function forestHill(x,z) {
    const back=THREE.MathUtils.smoothstep(-z,7.1,18.5),side=THREE.MathUtils.smoothstep(Math.abs(x),8.5,18);
    return back*(3.4+.7*Math.sin(x*.23+1.1)+.65*Math.cos(z*.23)) + side*(1.1+.35*Math.sin(z*.39+x*.13));
  }

  // One merged bark mesh keeps naturally curved and tapered limbs inexpensive.
  const branchPositions=[],branchUV=[],branchIndices=[];
  function organicBranch(points,radius,endRadius=radius*.14,segments=12) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const frames=curve.computeFrenetFrames(segments,false),offset=branchPositions.length/3,sides=8;
    const length=curve.getLength();
    for(let j=0;j<=segments;j++) {
      const t=j/segments,p=curve.getPointAt(t),r=THREE.MathUtils.lerp(radius,endRadius,Math.pow(t,.8));
      for(let k=0;k<=sides;k++) {
        const a=k/sides*Math.PI*2,irregular=1+.065*Math.sin(a*3+t*14);
        const v=p.clone().addScaledVector(frames.normals[j],Math.cos(a)*r*irregular).addScaledVector(frames.binormals[j],Math.sin(a)*r*irregular);
        branchPositions.push(v.x,v.y,v.z);branchUV.push(k/sides,t*length/3);
      }
    }
    for(let j=0;j<segments;j++)for(let k=0;k<sides;k++) {
      const a=offset+j*(sides+1)+k,b=a+sides+1;branchIndices.push(a,b,a+1,a+1,b,b+1);
    }
  }

  // Continuous, slightly uneven bank; the inner edge overlaps the water by a few centimetres.
  const bankGeometry = geom(new THREE.BufferGeometry()), bankPositions = [], bankColors = [], bankUV=[], bankIndices = [];
  const rings = [1, 1.07, 1.27, 1.75, 2.4, 3.2, 4.3, 6.5], heights = [.065, .16, .24, .19, .2, .3, .5, .35], segments = 160;
  const earth = new THREE.Color(), greenA = new THREE.Color('#92977a'), greenB = new THREE.Color('#bcc0a0');
  for (let j = 0; j < rings.length; j++) for (let i = 0; i <= segments; i++) {
    const angle = i / segments * Math.PI * 2, variation = Math.sin(angle * 7) * .013 + Math.sin(angle * 13 + .8) * .009;
    const r = rings[j] + variation * (j === 0 ? .8 : 2.1) - (j===0?.014:0), x = Math.cos(angle) * 5.5 * r, z = Math.sin(angle) * 3.8 * r;
    const hill=j>1?forestHill(x,z):0;
    const y = heights[j] + hill + (j === 0 ? 0 : Math.sin(x * .8) * Math.cos(z * .6) * .06);
    bankPositions.push(x, y, z);bankUV.push(x/3,z/3);
    earth.copy(greenA).lerp(greenB, .35 + .3 * Math.sin(x * .7 + z * .9) + range(-.08, .08));
    if (j === 0) earth.multiplyScalar(.78);
    bankColors.push(earth.r, earth.g, earth.b);
  }
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < segments; i++) {
    const a = j * (segments + 1) + i, b = a + segments + 1;
    bankIndices.push(a, a + 1, b, a + 1, b + 1, b);
  }
  bankGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bankPositions, 3));
  bankGeometry.setAttribute('color', new THREE.Float32BufferAttribute(bankColors, 3));
  bankGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(bankUV, 2));
  bankGeometry.setIndex(bankIndices); bankGeometry.computeVertexNormals();
  const groundMaterial=material({color:'#76826d', vertexColors: true, roughness: .98, ...pbr.maps('forest_floor',[1,1],0,.57) });
  groundMaterial.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float soilLuma=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
      diffuseColor.rgb=mix(vec3(soilLuma),diffuseColor.rgb,.42);
    `);
  };
  groundMaterial.customProgramCacheKey=()=> 'forest-floor-muted-v4';
  mesh(bankGeometry, groundMaterial, [0, 0, 0]);

  // Irregular shore stones with separate moss caps.
  for (let i = 0; i < 150; i++) {
    const a = i / 150 * Math.PI * 2 + range(-.025, .025), radial = range(1.015, 1.11);
    const x = Math.cos(a) * 5.5 * radial, z = Math.sin(a) * 3.8 * radial;
    if (x > 3 && x < 4.5 && z < 0 && z > -3.7) continue;
    const size = range(.12, .39), sy = size * range(.45, .85), rotationY = range(0, 6.28);
    const color = new THREE.Color().setHSL(range(.13, .19), range(.03, .09), range(.67, .9));
    instance(rockGeometry, stone, [x, .1 + sy * .45, z], [size * 1.4, sy, size], [range(-.2, .2), rotationY, range(-.15, .15)], color);
    // The scanned moss is already in the rock maps; sparse little blades soften its wet edge.
    if (random() > .65) for(let tuft=0;tuft<4;tuft++) instance(bladeGeometry,grass,[x+range(-size*.5,size*.5),.12+sy*.7,z+range(-size*.3,size*.3)],[.4,.08,.25],[0,range(0,6.28),.4],new THREE.Color('#869962'));
  }
  for (let i = 0; i < 34; i++) {
    const a = range(0, Math.PI * 2), r = range(1.17, 1.45), size = range(.22, .7);
    instance(rockGeometry, stone, [Math.cos(a) * 5.5 * r, .18, Math.sin(a) * 3.8 * r], [size * 1.2, size * .66, size], [range(-.2,.2), a, 0], new THREE.Color('#bec2b5'));
  }

  // Cottage: stone footing, board walls, gables, individually overlapping roof rows.
  const hx = 4, hz = -4.8;
  const house = (g, m, p, s, r, c) => instance(g, m, [p[0] + hx, p[1], p[2] + hz], s, r, c);
  house(box, stone, [0, .36, 0], [3.7, .55, 2.9]);
  for(let row=0;row<2;row++)for(let n=0;n<9;n++)house(rockGeometry,stone,[-1.65+n*.41+(row%2)*.08,.25+row*.22,1.43],[.25,.14,.15],[0,range(-.3,.3),range(-.1,.1)],new THREE.Color('#d1c9b2'));
  house(box, wood, [0, 1.55, 0], [3.4, 2.05, 2.65]);
  for (let x = -1.6; x <= 1.61; x += .2) {
    house(box, paleWood, [x, 1.55, 1.335], [.185, 1.94, .035], [0,0,0], new THREE.Color().setHSL(.085,.12,range(.72,.95)));
  }
  for (const side of [-1, 1]) for (let z = -1.2; z < 1.3; z += .2) {
    house(box, wood, [side * 1.718, 1.55, z], [.035, 1.94, .185], [0,0,0], new THREE.Color().setHSL(.085,.12,range(.72,.95)));
  }
  for (const x of [-1.74, 1.74]) for (const z of [-1.37, 1.37]) house(box, darkWood, [x, 1.55, z], [.17, 2.2, .17]);
  for (const z of [-1.38, 1.38]) house(box, darkWood, [0, .67, z], [3.65, .17, .16]);
  const gableGeometry = geom(new THREE.BufferGeometry());
  gableGeometry.setAttribute('position', new THREE.Float32BufferAttribute([-1.7,0,0, 1.7,0,0, 0,1.3,0],3));
  gableGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));
  gableGeometry.setIndex([0,1,2]); gableGeometry.computeVertexNormals();
  mesh(gableGeometry, wood, [hx, 2.57, hz + 1.34]);
  mesh(gableGeometry, wood, [hx, 2.57, hz - 1.34], [1,1,1], [0,Math.PI,0]);
  const slope = Math.atan2(1.3, 2.02);
  const tileShape=new THREE.Shape();tileShape.moveTo(-.48,-.49);tileShape.lineTo(.46,-.49);tileShape.lineTo(.5,.28);tileShape.lineTo(.39,.49);tileShape.lineTo(-.43,.48);tileShape.lineTo(-.51,.28);tileShape.closePath();
  const tileGeometry=geom(new THREE.ExtrudeGeometry(tileShape,{depth:.055,bevelEnabled:true,bevelThickness:.009,bevelSize:.016,bevelSegments:1,steps:1,curveSegments:1}));
  tileGeometry.center();tileGeometry.rotateX(Math.PI/2);
  for (const side of [-1, 1]) {
    house(box, slate, [side * 1.0, 3.18, 0], [2.43, .13, 3.4], [0,0,-side*slope]);
    for (let row = 0; row < 8; row++) for (let tile = 0; tile < 12; tile++) {
      const x = side * (.12 + row * .27), y = 3.91 - Math.abs(x) * Math.tan(slope), z = -1.59 + tile * .285 + (row % 2 ? .045 : 0);
      house(tileGeometry, slate, [x, y+range(-.009,.009), z], [.34,1,.31], [0,range(-.015,.015),-side*slope], new THREE.Color().setHSL(.37,.05,range(.62,.88)));
    }
    beam([hx,3.94,hz+1.76], [hx+side*2.15,2.56,hz+1.76], .075, darkWood, false);
    beam([hx,3.94,hz-1.76], [hx+side*2.15,2.56,hz-1.76], .075, darkWood, false);
  }
  house(box, darkWood, [0, 3.94, 0], [.18, .17, 3.55]);
  house(box, stone, [.95, 3.45, -.6], [.53, 2.1, .62]);
  house(box, darkWood, [.95, 4.53, -.6], [.7, .16, .79]);
  for (let y = 2.7; y < 4.5; y += .23) house(box, stone, [.95,y,-.6], [.56,.025,.65], [0,0,0], new THREE.Color('#596158'));
  // Front door with arch-like top and individual panels.
  house(box, darkWood, [-.42, 1.48, 1.37], [.88, 1.75, .13]);
  for (let n = 0; n < 5; n++) house(box, wood, [-.75 + n*.165,1.47,1.455], [.14,1.63,.05]);
  house(sphere, metal, [-.12,1.45,1.51], [.055,.055,.055]);
  house(box, darkWood, [-.42,2.4,1.4], [1.08,.15,.24]);
  // Glazing appears recessed under chunky frames and crossbars.
  for (const wx of [-1.22, .99]) {
    house(box, darkWood, [wx,1.71,1.38], [.7,.96,.12]);
    house(box, windowGlow, [wx,1.71,1.455], [.54,.77,.025]);
    // An inner timber silhouette and reflective glazing give each warm pane depth.
    house(box, darkWood, [wx+.1,1.58,1.474], [.035,.45,.012]);
    house(box, glass, [wx,1.71,1.49], [.54,.77,.009]);
    house(box, paleWood, [wx,1.71,1.48], [.055,.83,.05]);
    house(box, paleWood, [wx,1.71,1.48], [.59,.055,.05]);
    house(box, paleWood, [wx,1.23,1.46], [.82,.09,.25]);
  }
  house(box, darkWood, [1.75,1.72,0], [.1,1.1,1.12]);
  house(box, windowGlow, [1.81,1.72,0], [.025,.91,.93]);
  house(box, glass, [1.834,1.72,0], [.009,.91,.93]);
  house(box, paleWood, [1.84,1.72,0], [.05,.06,1]);
  house(box, paleWood, [1.84,1.72,0], [.05,.97,.06]);
  house(box, darkWood, [0,3.1,1.38], [.55,.63,.1]);
  house(box, windowGlow, [0,3.1,1.44], [.4,.48,.025]);
  house(box, paleWood, [0,3.1,1.47], [.04,.52,.03]);
  // Porch, steps, and a usable timber landing extending over the pond.
  // Porch boards run along Z; dock boards run along X and use the rotated maps.
  for (let n=0;n<19;n++) house(box,paleWood,[-1.86+n*.207,.46,1.91],[.19,.13,1.2]);
  house(box,wood,[-.4,.29,2.64],[1.4,.22,.45]);
  house(box,wood,[-.4,.17,2.95],[1.65,.13,.4]);
  for (const x of [-1.8,1.8]) {
    house(box,darkWood,[x,1.62,2.35],[.13,2.25,.13]);
    beam([hx+x,.5,hz+2.35],[hx+x,2.75,hz+2.35],.065,wood,false);
  }
  house(box,slate,[0,2.87,1.98],[4.05,.12,1.55],[.12,0,0]);
  house(box,darkWood,[0,2.69,2.76],[4.13,.15,.13]);
  for(let n=0;n<17;n++) instance(box,deckWood,[3.6,.27+range(-.004,.004),-2.0+n*.165],[1.45,.13,.145],[0,0,0],new THREE.Color().setHSL(.09,.09,range(.78,.98)));
  for(const x of [3.01,4.19])for(let n=0;n<17;n++)instance(roundCylinder,metal,[x,.337,-2+n*.165],[.012,.006,.012]);
  for(const x of [2.91,4.29]) for(const z of [-1.85,.55]) {
    instance(cylinder,darkWood,[x,.3,z],[.075,1.13,.075]);
    instance(sphere,paleWood,[x,.88,z],[.09,.045,.09]);
  }
  for(const x of [3.04,4.16]) instance(box,darkWood,[x,.12,-.63],[.11,.16,3.15]);
  // A warm hanging porch lantern, modelled with a shade, glass and frame.
  house(box,windowGlow,[.58,2.2,1.7],[.16,.28,.16]);
  house(box,metal,[.58,2.39,1.7],[.27,.09,.27]);
  house(box,metal,[.58,2.02,1.7],[.22,.05,.22]);
  for(const dx of [-.09,.09]) for(const dz of [-.09,.09]) house(box,metal,[.58+dx,2.2,1.7+dz],[.025,.32,.025]);
  const porchLight = new THREE.PointLight('#ffbd6b', 2.8, 6, 2); porchLight.position.set(hx+.58,2.1,hz+1.85); group.add(porchLight);
  const sideLight = new THREE.PointLight('#ffd08c', .7, 3.5, 2); sideLight.position.set(hx+1.95,1.65,hz); group.add(sideLight);

  // Tall irregular trunks and branches support many individual leaf surfaces.
  const trees = [
    [-7,-5,6.2],[-4.8,-6.9,5.9],[-2.4,-7.6,6.8],[.1,-8.4,7.1],[2.4,-8.1,6.4],[5.3,-8.5,6.8],[7.6,-6.6,6.2],
    [-8.1,-1.2,6.8],[-7.9,2.8,6.6],[-7.5,5.5,7.1],[8.7,-2.8,5.9],[9.5,1.1,5.5],[-10,-7.9,7.4],[-5.3,-10.3,7.7],[.8,-11,8.2],[6.5,-10.8,7.6],
  ];
  let leafCount = 0;
  trees.forEach(([x,z,height], treeIndex) => {
    const leanX = range(-1.25,1.25), leanZ = range(-1,1), radius = range(.18,.34);
    const b0=[x,.2,z], b1=[x+leanX*.2+range(-.25,.25),height*.30,z+leanZ*.25], b2=[x+leanX,height*.64,z+leanZ], b3=[x+leanX*1.3,height,z+leanZ*.7];
    organicBranch([b0,b1,b2,b3],radius,.035,20);
    for(let r=0;r<4;r++) {
      const a=r*Math.PI/2+treeIndex;organicBranch([[x,.7,z],[x+Math.cos(a)*.25,.25,z+Math.sin(a)*.25],[x+Math.cos(a)*.8,.12,z+Math.sin(a)*.8]],radius*.47,.015,6);
    }
    for(let branch=0;branch<7;branch++) {
      const a=branch*2.399+treeIndex*.7+range(-.55,.55), spread=range(1.1,2.7), y=height*(.40+branch*.066);
      const start=[x+leanX*.65,y-.32,z+leanZ*.65], tip=[x+Math.cos(a)*spread+leanX*.5,height*(.72+branch*.036),z+Math.sin(a)*spread+leanZ*.5];
      const elbow=[start[0]*.5+tip[0]*.5,start[1]*.5+tip[1]*.5-.3,start[2]*.5+tip[2]*.5];
      organicBranch([start,elbow,tip,[tip[0]+Math.cos(a+.4)*.5,tip[1]+.28,tip[2]+Math.sin(a+.4)*.5]],radius*.40,.014,10);
      for(let l=0;l<62;l++) {
        const phi=range(0,Math.PI*2), c=range(-1,1), s=Math.sqrt(1-c*c), rad=Math.cbrt(random());
        const lp=[tip[0]+Math.cos(phi)*s*rad*1.16,tip[1]+c*rad*.76,tip[2]+Math.sin(phi)*s*rad*1.08];
        const length=range(.27,.53), color=new THREE.Color().setHSL(range(.22,.31),range(.30,.46),range(.3,.49),THREE.SRGBColorSpace);
        instance(leafGeometry,leaves,lp,[length*.9,length,length],[-Math.PI*.5+range(-.75,.75),range(0,Math.PI*2),range(-1,1)],color); leafCount++;
      }
      // A few asymmetric weeping boughs break the umbrella outline at the pond's left edge.
      if((treeIndex===0||treeIndex===7||treeIndex===8)&&branch<5)for(let twig=0;twig<4;twig++) {
        const tx=tip[0]+range(-.75,.75),tz=tip[2]+range(-.65,.65),drop=range(1,2.2),ty=tip[1]+range(-.3,.25);
        organicBranch([[tx,ty,tz],[tx+.13,ty-drop*.45,tz+.18],[tx+.04,ty-drop,tz+.13]],.014,.003,7);
        for(let k=0;k<10;k++)for(const side of [-1,1]) {
          const l=range(.23,.4),t=k/10;
          instance(leafGeometry,leaves,[tx+side*.07,ty-drop*t,tz+.13*t],[l*.34,l,l*.6],[.2,side*.9,Math.PI+side*.42],new THREE.Color('#6b9250'));leafCount++;
        }
      }
    }
    for(let l=0;l<80;l++) {
      const a=range(0,Math.PI*2), rad=range(0,1.3), length=range(.28,.55);
      instance(leafGeometry,leaves,[b3[0]+Math.cos(a)*rad,b3[1]+range(-.5,.5),b3[2]+Math.sin(a)*rad],[length,length,length],[-1.1,range(0,6.28),range(-1,1)],new THREE.Color().setHSL(.27,.38,range(.28,.44),THREE.SRGBColorSpace)); leafCount++;
    }
  });

  // Layered real leaf surfaces leave fine gaps in the skyline; no solid crown volumes.
  const forestTrees=[];
  for(let layer=0;layer<3;layer++) {
    for(let n=0;n<18;n++) forestTrees.push([-19+n*2.2+range(-1.3,1.3),-12-layer*4.4+range(-2.3,2.3),range(5.8,10.8)+layer*.65,layer]);
    for(const side of [-1,1]) for(let n=0;n<7;n++) forestTrees.push([side*(11.7+layer*3.1)+range(-1.5,1.5),-10+n*2.4+range(-1.5,1.5),range(6.1,9.8),layer]);
  }
  forestTrees.forEach(([x,z,h,layer],index)=>{
    const lean=range(-1.1,1.1), r=range(.11,.26), crownBase=h*range(.51,.64);
    organicBranch([[x,.1,z],[x+lean*.3,h*.34,z-.3],[x+lean,h*.7,z+.4],[x+lean*.7,h,z]],r,.025,8);
    const treeColor=new THREE.Color().setHSL(range(.24,.33),range(.21,.36),range(.28,.41)+layer*.012,THREE.SRGBColorSpace);
    for(let c=0;c<6;c++) {
      const a=c*2.399+index+range(-.7,.7), spread=range(.7,1.8), cy=crownBase+range(.2,h*.35);
      const px=x+Math.cos(a)*spread,pz=z+Math.sin(a)*spread;
      if(c<3) organicBranch([[x,h*.49,z],[px*.6+x*.4,cy-.2,pz*.6+z*.4],[px,cy+.2,pz]],r*.34,.012,5);
      const width=range(1.1,1.9),depth=range(.9,1.6);
      for(let l=0;l<46;l++) {
        const theta=range(0,Math.PI*2),v=range(-1,1),q=Math.sqrt(1-v*v)*Math.cbrt(random()),size=range(.55,.93);
        instance(farLeafGeometry,distantFoliage,[px+Math.cos(theta)*q*width,cy+v*range(.65,1.3),pz+Math.sin(theta)*q*depth],[size*.9,size,size],[-1.1+range(-.8,.8),range(0,6.28),range(-1,1)],treeColor.clone().multiplyScalar(range(.78,1.22)));leafCount++;
      }
    }
  });

  // Uneven understory bands interrupt views through trunks and conceal the distant ground edge.
  // These are small articulated leaf clusters, never opaque green spheres.
  for(let patch=0;patch<96;patch++) {
    const back=patch<66;
    const x=back?range(-19,18):(patch%2?-1:1)*range(8.8,17.5);
    const z=back?range(-22,-8.1):range(-10,2);
    if(x>2.1&&x<6.4&&z>-9.8)continue;
    if(Math.sin(x*.37+z*.27)>.67)continue;
    const floor=.24+forestHill(x,z),height=range(.7,2.4),radius=range(.65,1.35),shrubColor=new THREE.Color().setHSL(range(.23,.31),range(.24,.39),range(.21,.34),THREE.SRGBColorSpace);
    for(let l=0;l<150;l++) {
      const a=range(0,Math.PI*2),v=range(0,1),r=radius*Math.sqrt(random())*(1-v*.45),size=range(.27,.54);
      instance(farLeafGeometry,distantFoliage,[x+Math.cos(a)*r,floor+v*height,z+Math.sin(a)*r],[size,size,size],[-1.2+range(-.6,.6),range(0,6.28),range(-.7,.7)],shrubColor.clone().multiplyScalar(range(.85,1.25)));leafCount++;
    }
    for(let stem=0;stem<3;stem++) {
      const dx=range(-.6,.6),dz=range(-.5,.5);
      organicBranch([[x,floor,z],[x+dx*.4,floor+height*.6,z+dz*.3],[x+dx,floor+height,z+dz]],.025,.004,4);
    }
  }

  // Intermediate shrubs and clustered forest-floor detail prevent an empty grass disk.
  for(let patch=0;patch<68;patch++) {
    const a=range(0,Math.PI*2), radial=range(1.35,2.35), x=Math.cos(a)*5.5*radial,z=Math.sin(a)*3.8*radial;
    if(x>2.6&&x<6.8&&z>-6.5&&z<2) continue;
    const shrubColor=new THREE.Color().setHSL(range(.23,.32),range(.22,.37),range(.22,.35),THREE.SRGBColorSpace);
    const h=range(.32,z>2?.65:1.15);
    for(let sprig=0;sprig<7;sprig++) {
      const a=sprig*2.399+range(-.4,.4),reach=range(.35,.75),tip=[x+Math.cos(a)*reach,.23+h*range(.55,1.05),z+Math.sin(a)*reach];
      organicBranch([[x,.18,z],[x+Math.cos(a)*reach*.3,.2+h*.7,z+Math.sin(a)*reach*.3],tip],.018,.003,4);
      for(let l=0;l<9;l++) {
        const t=l/9,length=range(.18,.31),side=l%2?1:-1;
        instance(leafGeometry,leaves,[x+(tip[0]-x)*t+range(-.08,.08),.2+(tip[1]-.2)*Math.sin(t*Math.PI*.65),z+(tip[2]-z)*t],[length*.85,length,length],[-1.0+range(-.35,.35),-a+side*.65,range(-.5,.5)],shrubColor.clone().multiplyScalar(range(1.05,1.45)));leafCount++;
      }
    }
    for(let blade=0;blade<13;blade++) instance(bladeGeometry,grass,[x+range(-1,1),.17,z+range(-1,1)],[range(.6,1.2),range(.15,.42),1],[0,range(0,6.28),range(-.3,.3)],shrubColor);
    for(let litter=0;litter<17;litter++) instance(leafGeometry,forestLitter,[x+range(-1.1,1.1),.21,z+range(-1,1)],[range(.09,.16),range(.1,.22),.1],[-Math.PI/2,range(0,6.28),0],new THREE.Color().setHSL(.08,.22,range(.31,.48),THREE.SRGBColorSpace));
    if(patch%8===0) beam([x-.7,.24,z],[x+.6,.24,z+.4],.09,darkWood);
  }

  const branches=geom(new THREE.BufferGeometry());branches.setAttribute('position',new THREE.Float32BufferAttribute(branchPositions,3));branches.setAttribute('uv',new THREE.Float32BufferAttribute(branchUV,2));branches.setIndex(branchIndices);branches.computeVertexNormals();
  mesh(branches,bark,[0,0,0]).name='Continuous tapered trunks, roots and branches';

  // Dense bankside vegetation: reeds, grasses and fern fronds share the same wind.
  for(let patch=0;patch<112;patch++) {
    const a=range(0,Math.PI*2), radial=range(1.055,1.31), x=Math.cos(a)*5.5*radial, z=Math.sin(a)*3.8*radial;
    if(x>2.8&&x<6.1&&z<.6&&z>-6.4) continue;
    const baseHeight=range(.25,.75), grassColor=new THREE.Color().setHSL(range(.19,.27),range(.3,.43),range(.3,.46),THREE.SRGBColorSpace);
    for(let blade=0;blade<12;blade++) {
      const length=baseHeight*range(.6,1.4);
      instance(bladeGeometry,grass,[x+range(-.25,.25),.17,z+range(-.25,.25)],[range(.7,1.3),length,1],[range(-.15,.15),range(0,Math.PI*2),range(-.3,.3)],grassColor);
    }
    if(patch%4===0) for(let n=0;n<3;n++) {
      const rx=x+range(-.2,.2), rz=z+range(-.2,.2), height=range(.8,1.4);
      instance(roundCylinder,reeds,[rx,.18+height/2,rz],[.014,height,.014]);
      instance(roundCylinder,cattail,[rx,.19+height,rz],[.045,.23,.045]);
      for(let leaf=0;leaf<3;leaf++) instance(bladeGeometry,grass,[rx,.2+leaf*.15,rz],[1.3,height*.65,1.2],[0,leaf*2.1+rx,.3],grassColor);
    }
    if(patch%5===0) for(let frond=0;frond<6;frond++) {
      const fa=frond*Math.PI/3, length=range(.35,.65);
      for(let l=1;l<7;l++) for(const side of [-1,1]) {
        const along=l/7, fx=x+Math.cos(fa)*length*along, fz=z+Math.sin(fa)*length*along;
        instance(leafGeometry,leaves,[fx,.2+Math.sin(along*Math.PI)*.18,fz],[.1*(1-along*.5),.2*(1-along*.6),.15],[-1.12,fa+side*.9,0],grassColor); leafCount++;
      }
    }
  }
  // Low flowers, not floating particles: stems meet the ground and petals meet the stem.
  for(let patch=0;patch<16;patch++) {
    const a=range(0,Math.PI*2), x=Math.cos(a)*6.0, z=Math.sin(a)*4.2;
    if(x>2.8&&z<-2) continue;
    for(let n=0;n<6;n++) {
      const fx=x+range(-.3,.3), fz=z+range(-.3,.3), h=range(.23,.5);
      instance(roundCylinder,reeds,[fx,.18+h/2,fz],[.007,h,.007]);
      const petalColor=new THREE.Color(patch%3===0?'#b8a7da':patch%3===1?'#efdab1':'#edeed1');
      for(let p=0;p<5;p++) {
        const pa=p*Math.PI*2/5; instance(petalGeometry,flowers,[fx+Math.cos(pa)*.037,.18+h,fz+Math.sin(pa)*.037],[.036,.014,.036],[0,pa,0],petalColor);
      }
      instance(petalGeometry,flowers,[fx,.19+h,fz],[.019,.018,.019],[0,0,0],new THREE.Color('#c3a34e'));
    }
  }

  // A few floating lily pads sit clear of the main duck corridor.
  const padGeometry=geom(new THREE.CircleGeometry(1,24,.12,Math.PI*2-.24));
  const lilyMat=material({color:'#627c47',roughness:.7,side:THREE.DoubleSide});
  const lilyPositions=[[-3.8,.12,1.5,.27],[-4.15,.12,.8,.22],[-3.6,.12,1.02,.32],[-2.8,.12,2.6,.25],[-3.2,.12,2.35,.18],[1.8,.12,-2.7,.22]];
  lilyPositions.forEach(([x,y,z,s],i)=>{
    instance(padGeometry,lilyMat,[x,y,z],[s,s,s],[-Math.PI/2,0,i*.9]);
    if(i%3===0) for(let p=0;p<7;p++) { const a=p/7*Math.PI*2; instance(petalGeometry,flowers,[x+Math.cos(a)*.045,y+.045,z+Math.sin(a)*.045],[.043,.035,.018],[0,-a,.25],new THREE.Color('#eee1c8')); }
  });

  for(const batch of batches.values()) {
    const object=new THREE.InstancedMesh(batch.geometry,batch.material,batch.items.length);
    object.name=`Environment ${batch.material===leaves?'leaves':batch.material===grass?'grass':'geometry'} (${batch.items.length})`;
    batch.items.forEach((item,i)=>{object.setMatrixAt(i,item.matrix); if(item.color) object.setColorAt(i,item.color);});
    object.castShadow=true; object.receiveShadow=true;
    if(batch.material.userData.windDepthMaterial) {
      object.customDepthMaterial=batch.material.userData.windDepthMaterial;
      // Conservative bounds keep moving leaf tips within their visible batch.
      object.frustumCulled=false;
    }
    object.instanceMatrix.needsUpdate=true;
    if(object.instanceColor) object.instanceColor.needsUpdate=true;
    object.computeBoundingSphere(); group.add(object);
  }

  return {
    group, leafCount,
    update(time,{wind=.5,night=0}={}) {
      uniforms.time.value=time;
      uniforms.wind.value=Math.max(0,Math.min(2,wind));
      const n=Math.max(0,Math.min(1,night));
      windowGlow.emissiveIntensity=.5+n*1.9;
      porchLight.intensity=1.8+n*5.5;
      sideLight.intensity=.3+n*1.8;
    },
    dispose() {
      group.traverse(object=>{if(object.isInstancedMesh)object.dispose();});
      geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose());
      pbr.dispose();
      group.removeFromParent();
    },
  };
}
