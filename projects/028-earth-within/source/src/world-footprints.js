import * as THREE from 'three';
import { groundSurfaceHeight } from './world-terrain.js';
import { createFootprintAging, advanceFootprintAging, restoreFootprintAging } from './world-footprint-aging.js';

const PRINT_LIMIT = 128, PRINT_VERTICES = 96, SPLASH_LIMIT = 32, DROPS_PER_SPLASH = 8;
const HALF_WIDTH = .081, HEEL = -.102, TOE = .166, LIFT = .006;
const clamp = THREE.MathUtils.clamp;

function clip(polygon, axis, edge, greater) {
  const result = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const inside = greater ? a[axis] >= edge : a[axis] <= edge;
    const next = greater ? b[axis] >= edge : b[axis] <= edge;
    if (inside) result.push(a);
    if (inside !== next) {
      const t = (edge - a[axis]) / (b[axis] - a[axis]), point = {};
      for (const key of ['x', 'y', 'z', 'across', 'along', 'r', 'g', 'b']) point[key] = THREE.MathUtils.lerp(a[key], b[key], t);
      result.push(point);
    }
  }
  return result;
}

function terrainSampler(scene) {
  let terrain;
  scene.traverse((o) => { if (o.isMesh && o.geometry.getAttribute('aRiverDepth')) terrain = o; });
  if (!terrain) return null;
  terrain.updateWorldMatrix(true, false);
  const position = terrain.geometry.getAttribute('position'), color = terrain.geometry.getAttribute('color');
  const indices = terrain.geometry.getIndex(), count = indices?.count ?? position.count;
  const cells = new Map(), size = 2, key = (x, z) => `${x},${z}`;
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  function read(offset) {
    for (let j = 0; j < 3; j++) {
      const index = indices ? indices.getX(offset + j) : offset + j;
      points[j].fromBufferAttribute(position, index).applyMatrix4(terrain.matrixWorld);
      points[j].r = color?.getX(index) ?? .46; points[j].g = color?.getY(index) ?? .36; points[j].b = color?.getZ(index) ?? .20;
    }
    return points;
  }
  for (let offset = 0; offset < count; offset += 3) {
    const [a, b, c] = read(offset);
    const minX = Math.min(a.x, b.x, c.x), maxX = Math.max(a.x, b.x, c.x);
    const minZ = Math.min(a.z, b.z, c.z), maxZ = Math.max(a.z, b.z, c.z);
    if (maxX < -151 || minX > 157 || maxZ < -106 || minZ > 106) continue;
    for (let x = Math.floor(minX / size); x <= Math.floor(maxX / size); x++) {
      for (let z = Math.floor(minZ / size); z <= Math.floor(maxZ / size); z++) {
        const id = key(x, z); if (!cells.has(id)) cells.set(id, []); cells.get(id).push(offset);
      }
    }
  }
  return (x, z, yaw) => {
    const candidates = new Set(), radius = .20;
    for (let cx = Math.floor((x - radius) / size); cx <= Math.floor((x + radius) / size); cx++) {
      for (let cz = Math.floor((z - radius) / size); cz <= Math.floor((z + radius) / size); cz++) {
        for (const offset of cells.get(key(cx, cz)) ?? []) candidates.add(offset);
      }
    }
    const sin = Math.sin(yaw), cos = Math.cos(yaw), vertices = [];
    for (const offset of candidates) {
      let polygon = read(offset).map((p) => ({ x: p.x, y: p.y, z: p.z, r: p.r, g: p.g, b: p.b,
        across: (p.x - x) * cos - (p.z - z) * sin, along: (p.x - x) * sin + (p.z - z) * cos }));
      polygon = clip(polygon, 'across', -HALF_WIDTH, true); polygon = clip(polygon, 'across', HALF_WIDTH, false);
      polygon = clip(polygon, 'along', HEEL, true); polygon = clip(polygon, 'along', TOE, false);
      for (let i = 1; i + 1 < polygon.length; i++) {
        const triangle = [polygon[0], polygon[i], polygon[i + 1]];
        const area = (triangle[1].x - triangle[0].x) * (triangle[2].z - triangle[0].z)
          - (triangle[1].z - triangle[0].z) * (triangle[2].x - triangle[0].x);
        if (Math.abs(area) > 1e-10) vertices.push(...triangle);
      }
    }
    return vertices;
  };
}

function printMaterial() {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, depthWrite: false,
    side: THREE.DoubleSide, roughness: .94, metalness: 0, alphaTest: .001,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  material.customProgramCacheKey = () => 'terrain-footprint-weathering-v1';
  material.onBeforeCompile = (shader) => {
    const varyings = `varying vec2 vSole; varying vec3 vMark; varying vec4 vTrace;
      varying vec3 vAcrossView; varying vec3 vAlongView; varying vec2 vWind; varying float vGroundWet;`;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
      attribute vec2 aSole; attribute vec3 aMark; attribute vec4 aTrace;
      attribute vec2 aHeading; attribute vec2 aWind; attribute float aGroundWet; ${varyings}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vSole=aSole;vMark=aMark;vTrace=aTrace;vWind=aWind;vGroundWet=aGroundWet;
        vAcrossView=normalize(normalMatrix*vec3(aHeading.y,0.,-aHeading.x));
        vAlongView=normalize(normalMatrix*vec3(aHeading.x,0.,aHeading.y));`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${varyings}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 sole=vSole;
        float taper=.86+.11*smoothstep(-.35,.9,sole.y);
        float toe=length(vec2((sole.x+vMark.y*.045*(sole.y+.15))/taper,(sole.y-.30)/.75));
        float heel=length(vec2(sole.x/.75,(sole.y+.76)/.27));
        float imprint=min(toe,heel);
        if(imprint>1.||vMark.x<.001)discard;
        float edgeBlend=smoothstep(.25,.92,imprint);
        float windEdge=dot(normalize(sole+vec2(.0001)),vWind)*.10*edgeBlend;
        float footWater=clamp(mix(vTrace.x,vTrace.y,clamp(edgeBlend+windEdge,0.,1.)),0.,1.);
        float relief=vTrace.z;float detail=vTrace.w;
        float coverage=1.-smoothstep(.90-(1.-detail)*.16,1.,imprint);
        float wetContrast=max(0.,footWater-vGroundWet);
        diffuseColor.rgb*=1.-vGroundWet*.35-wetContrast*.62;
        float basin=1.-smoothstep(.4,.83,imprint);
        float ridge=smoothstep(.68,.82,imprint)*(1.-smoothstep(.82,.98,imprint));
        float treadShadow=(.5+.5*sin((sole.y+.1)*19.))*detail*(1.-smoothstep(.60,.84,abs(sole.x)));
        diffuseColor.rgb*=1.-relief*(.32*basin+.050*treadShadow);
        diffuseColor.rgb*=1.+relief*ridge*.11;
        diffuseColor.a*=vMark.x*coverage*max(wetContrast*.9,relief*.88);
      `)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor=mix(.96,.34,max(footWater,vGroundWet));`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        float rimWidth=.09+(1.-detail)*.13;
        float lip=exp(-pow((imprint-.82)/rimWidth,2.));
        vec2 slope=normalize(sole+vec2(.0001))*lip*(imprint<.83?-.32:.20)*relief;
        slope.y+=cos((sole.y+.1)*19.)*.045*detail*relief*(1.-smoothstep(.65,.87,abs(sole.x)));
        normal=normalize(normal+vAcrossView*slope.x+vAlongView*slope.y);
      `);
  };
  return material;
}

function effectMaterial(vertex, fragment) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.clone(THREE.UniformsLib.fog), vertexShader: vertex, fragmentShader: fragment });
}

export function createFootprints(scene, { sampleGround, collision = null, sampleEnvironment = null } = {}) {
  if (typeof sampleGround !== 'function') throw new TypeError('Footprints require a ground sampler.');
  const project = terrainSampler(scene), prints = Array.from({ length: PRINT_LIMIT }, () => ({ active: false, age: 0, count: 0, opacity: 0 }));
  const splashes = Array.from({ length: SPLASH_LIMIT }, () => ({ active: false, age: 0 }));
  const vertices = PRINT_LIMIT * PRINT_VERTICES;
  const positions = new Float32Array(vertices * 3), colors = new Float32Array(vertices * 3), normals = new Float32Array(vertices * 3);
  const soles = new Float32Array(vertices * 2), marks = new Float32Array(vertices * 3), aging = new Float32Array(vertices * 4);
  const headings = new Float32Array(vertices * 2), winds = new Float32Array(vertices * 2), groundWetness = new Float32Array(vertices);
  const geometry = new THREE.BufferGeometry();
  for (const [name, array, size] of [['position', positions, 3], ['color', colors, 3], ['normal', normals, 3],
    ['aSole', soles, 2], ['aMark', marks, 3], ['aTrace', aging, 4], ['aHeading', headings, 2], ['aWind', winds, 2], ['aGroundWet', groundWetness, 1]]) {
    geometry.setAttribute(name, new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage));
  }
  geometry.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geometry, printMaterial());
  mesh.name = '湿色与砂地凹痕独立变化的左右靴印'; mesh.renderOrder = 2.4; mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);

  const ringFades = new Float32Array(SPLASH_LIMIT), ringGeometry = new THREE.RingGeometry(.84, 1, 28);
  ringGeometry.rotateX(-Math.PI / 2); ringGeometry.setAttribute('aFade', new THREE.InstancedBufferAttribute(ringFades, 1));
  const rings = new THREE.InstancedMesh(ringGeometry, effectMaterial(`attribute float aFade;varying float vFade;
    #include <fog_pars_vertex>
    void main(){vFade=aFade;vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`, `varying float vFade;
    #include <fog_pars_fragment>
    void main(){gl_FragColor=vec4(.53,.67,.60,vFade);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`), SPLASH_LIMIT);
  rings.name = '脚步激起的浅水涟漪'; rings.count = 0; rings.renderOrder = 5; rings.frustumCulled = false;
  rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(rings);
  const dropCount = SPLASH_LIMIT * DROPS_PER_SPLASH, dropPositions = new Float32Array(dropCount * 3);
  const dropFades = new Float32Array(dropCount), dropColors = new Float32Array(dropCount * 3), dropSizes = new Float32Array(dropCount);
  const dropGeometry = new THREE.BufferGeometry();
  for (const [name, array, size] of [['position', dropPositions, 3], ['aFade', dropFades, 1], ['aTint', dropColors, 3], ['aSize', dropSizes, 1]]) {
    dropGeometry.setAttribute(name, new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage));
  }
  const drops = new THREE.Points(dropGeometry, effectMaterial(`attribute float aFade;attribute float aSize;attribute vec3 aTint;
    varying float vFade;varying vec3 vTint;
    #include <fog_pars_vertex>
    void main(){vFade=aFade;vTint=aTint;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
      gl_PointSize=clamp(aSize*2.5/max(.5,-mvPosition.z),1.,6.5);
      #include <fog_vertex>
    }`, `varying float vFade;varying vec3 vTint;
    #include <fog_pars_fragment>
    void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.||vFade<.001)discard;gl_FragColor=vec4(vTint,vFade*(1.-smoothstep(.6,1.,r)));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`));
  drops.name = '踩水溅起的水滴与少量泥点'; drops.renderOrder = 6; drops.frustumCulled = false; drops.visible = false; scene.add(drops);
  const transform = new THREE.Object3D(), scratch = {}, environment = {}, last = new Map();
  const stats = { footprintsCreated: 0, splashesCreated: 0, activePrints: 0, activeSplashes: 0,
    printCapacity: PRINT_LIMIT, splashCapacity: SPLASH_LIMIT, wetPrints: 0, dryImpressions: 0, submergedPrints: 0, erodedPrints: 0 };
  let cursor = 0, splashCursor = 0, usedPrintSlots = 0, elapsed = 0;

  function writePrint(item, slot, projected) {
    const start = slot * PRINT_VERTICES, sin = Math.sin(item.yaw), cos = Math.cos(item.yaw);
    item.start = start; item.count = projected.length; marks.fill(0, start * 3, (start + PRINT_VERTICES) * 3);
    for (let i = 0; i < projected.length; i++) {
      const v = projected[i], index = start + i;
      positions.set([v.x, v.y + LIFT, v.z], index * 3); colors.set([v.r, v.g, v.b], index * 3);
      soles.set([v.across / HALF_WIDTH, (v.along - (HEEL + TOE) / 2) / ((TOE - HEEL) / 2)], index * 2);
      headings.set([sin, cos], index * 2); marks.set([1, item.side, item.substrate === 'sand' ? 1 : 0], index * 3);
    }
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < projected.length; i += 3) {
      a.fromArray(positions, (start + i) * 3); b.fromArray(positions, (start + i + 1) * 3); c.fromArray(positions, (start + i + 2) * 3);
      b.sub(a); c.sub(a); a.crossVectors(b, c).normalize(); if (a.y < 0) a.negate();
      for (let j = 0; j < 3; j++) normals.set([a.x, a.y, a.z], (start + i + j) * 3);
    }
    usedPrintSlots = Math.max(usedPrintSlots, slot + 1); geometry.setDrawRange(0, usedPrintSlots * PRINT_VERTICES);
    for (const name of ['position', 'color', 'normal', 'aSole', 'aHeading', 'aMark']) geometry.attributes[name].needsUpdate = true;
    mesh.visible = true;
  }

  function splash(contact, ground, water, dust = false) {
    const item = splashes[splashCursor];
    Object.assign(item, { active: true, age: 0, x: contact.x, z: contact.z, water, dust,
      surfaceY: water ? ground.waterHeight : groundSurfaceHeight(contact.x, contact.z), snow: ground.substrate === 'snow',
      impact: contact.landing ? clamp(contact.impact ?? .5, 0, 1) : 0,
      speed: Math.min(5.8, contact.speed ?? 1), depthScale: water ? clamp(1 - (ground.waterDepth ?? 0) * .65, .25, 1) : 1 });
    item.lifetime = (water ? .62 : dust ? .44 : .36) + item.impact * .12;
    item.seed = (stats.splashesCreated * 2.39996 + (contact.side < 0 ? -1 : 1) * .73) % (Math.PI * 2);
    item.particleCount = water ? ground.waterDepth > .55 ? 0 : 8 : contact.landing ? 8 : 4;
    splashCursor = (splashCursor + 1) % SPLASH_LIMIT; stats.splashesCreated++;
  }

  function updatePrints(dt) {
    stats.activePrints = stats.wetPrints = stats.dryImpressions = stats.submergedPrints = 0;
    for (const item of prints) {
      if (!item.active) continue;
      item.age += dt;
      const ground = sampleGround(item.x, item.z, scratch);
      Object.assign(environment, { rain: 0, wind: .35, exposure: 1, windX: 1, windZ: -.45,
        groundWetness: ground?.localWetness ?? 0, waterDepth: ground?.waterDepth ?? 0, flowSpeed: 0, wave: 0 });
      sampleEnvironment?.(item.x, item.z, ground, environment);
      advanceFootprintAging(item.aging, dt, environment, item.substrate);
      const relief = clamp(item.aging.depth / item.aging.initialDepth, 0, 1);
      item.washed = item.aging.eroded;
      item.opacity = item.aging.submerged || item.aging.eroded ? 0 : Math.max(item.aging.coreWater * .9, relief * .70);
      const sin = Math.sin(item.yaw), cos = Math.cos(item.yaw), norm = Math.max(.001, Math.hypot(environment.windX, environment.windZ));
      for (let i = 0; i < item.count; i++) {
        const index = item.start + i; marks[index * 3] = item.opacity > 0 ? 1 : 0;
        aging.set([item.aging.coreWater, item.aging.edgeWater, relief, item.aging.definition], index * 4);
        winds.set([(environment.windX * cos - environment.windZ * sin) / norm, (environment.windX * sin + environment.windZ * cos) / norm], index * 2);
        groundWetness[index] = clamp(environment.groundWetness, 0, 1);
      }
      if (item.aging.eroded) { item.active = false; stats.erodedPrints++; }
      else { stats.activePrints++; if (item.aging.submerged) stats.submergedPrints++;
        else if (item.aging.coreWater > .06) stats.wetPrints++; else stats.dryImpressions++; }
    }
    for (const name of ['aMark', 'aTrace', 'aWind', 'aGroundWet']) geometry.attributes[name].needsUpdate = usedPrintSlots > 0;
    mesh.visible = stats.activePrints > stats.submergedPrints;
  }

  return {
    mesh, rings, drops, prints, splashes, stats,
    step(contact) {
      if (!contact || ![contact.x, contact.y, contact.z].every(Number.isFinite) || contact.airborne || contact.swimming
        || ['swim', 'dive', 'low'].includes(contact.medium) || !contact.landing && !(contact.speed > .18)) return false;
      const side = contact.side < 0 ? -1 : 1, previous = last.get(side);
      if (previous && Math.hypot(contact.x - previous.x, contact.z - previous.z) < .08 && elapsed - previous.time < .7) return false;
      const floor = groundSurfaceHeight(contact.x, contact.z);
      if (Math.abs(contact.y - floor) > .15 || collision?.blocks(contact.x, floor + .38, contact.z, floor, true)) return false;
      const ground = contact.ground ?? sampleGround(contact.x, contact.z, scratch); if (!ground) return false;
      const depth = Math.max(0, ground.waterDepth ?? 0), water = depth > .004 && depth <= 1.19 && Number.isFinite(ground.waterHeight);
      const substrate = ground.substrate, soft = ['mud', 'sand', 'grass'].includes(substrate);
      let made = false;
      if (water || soft && depth <= .004 && ground.mud > .30 && ground.localWetness > .5) { splash(contact, ground, water); made = true; }
      if (!made && contact.landing && (contact.impact ?? .5) > .15 && depth <= .004
        && ['sand', 'path', 'grass', 'snow'].includes(substrate) && (ground.localWetness ?? 0) < .4) { splash(contact, ground, false, true); made = true; }
      const allowed = substrate === 'mud' || substrate === 'sand' || substrate === 'grass' && ground.mud > .18;
      const wetness = clamp(ground.localWetness ?? 0, 0, 1), soleWater = clamp(contact.soleWetness ?? 0, 0, 1);
      const transfer = soleWater > .06 && (substrate === 'sand' || substrate === 'mud');
      const drySand = substrate === 'sand' && wetness < .20 && !transfer;
      const strength = substrate === 'sand' ? Math.max(wetness * .86, soleWater * .96, .36 + (contact.impact ?? 0) * .12)
        : Math.max((ground.mud ?? 0) * (substrate === 'grass' ? .35 : .92), transfer ? soleWater * .88 : 0);
      const kind = drySand ? 'sand-impression' : transfer && wetness < .20 ? 'carried-water' : 'wet-ground';
      if (project && allowed && (wetness > .20 || transfer || drySand) && strength > .06 && depth <= .004) {
        const projected = project(contact.x, contact.z, contact.yaw ?? 0);
        if (projected.length && projected.length <= PRINT_VERTICES) {
          const item = prints[cursor];
          Object.assign(item, { active: true, x: contact.x, z: contact.z, yaw: contact.yaw ?? 0, side,
            age: 0, strength: Math.min(.94, strength), opacity: 1, washed: false, substrate, kind, soleWater,
            aging: createFootprintAging({ substrate, moisture: Math.max(wetness, soleWater), impact: contact.impact, strength }) });
          writePrint(item, cursor, projected); cursor = (cursor + 1) % PRINT_LIMIT; stats.footprintsCreated++; made = true;
        }
      }
      if (made) last.set(side, { x: contact.x, z: contact.z, time: elapsed }); return made;
    },
    snapshot() {
      return { version: 1, prints: prints.filter((p) => p.active).sort((a, b) => b.age - a.age).map((p) => ({
        x: p.x, z: p.z, yaw: p.yaw, side: p.side, age: p.age, strength: p.strength,
        substrate: p.substrate, kind: p.kind, soleWater: p.soleWater, aging: { ...p.aging },
      })) };
    },
    restore(saved) {
      prints.forEach((p) => { p.active = false; }); marks.fill(0); usedPrintSlots = cursor = 0; last.clear();
      if (saved?.version === 1 && Array.isArray(saved.prints) && project) {
        for (const source of saved.prints.slice(-PRINT_LIMIT)) {
          if (!source || ![source.x, source.z, source.yaw].every(Number.isFinite) || Math.abs(source.x) > 154 || Math.abs(source.z) > 103
            || !['mud', 'sand', 'grass'].includes(source.substrate)) continue;
          const projected = project(source.x, source.z, source.yaw); if (!projected.length || projected.length > PRINT_VERTICES) continue;
          const aging = restoreFootprintAging(source.aging, source.substrate); if (aging.eroded) continue;
          const item = prints[cursor];
          Object.assign(item, { ...source, side: source.side < 0 ? -1 : 1, active: true, aging,
            age: aging.age, strength: clamp(Number.isFinite(source.strength) ? source.strength : .5, 0, .94), opacity: 1 });
          writePrint(item, cursor, projected); cursor = (cursor + 1) % PRINT_LIMIT;
        }
      }
      updatePrints(0);
    },
    update(dt, time) {
      dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .12); elapsed = Number.isFinite(time) ? time : elapsed + dt;
      updatePrints(dt); stats.activeSplashes = 0; let ringCount = 0; dropFades.fill(0);
      for (let i = 0; i < splashes.length; i++) {
        const item = splashes[i]; if (!item.active) continue; item.age += dt;
        if (item.age > item.lifetime) { item.active = false; continue; } stats.activeSplashes++;
        const age = item.age / item.lifetime, ground = sampleGround(item.x, item.z, scratch);
        if (item.water && (ground?.waterDepth ?? 0) > .001 && Number.isFinite(ground.waterHeight)) {
          transform.position.set(item.x, ground.waterHeight + .009, item.z);
          transform.scale.setScalar(.065 + age * (.35 + item.speed * .025 + item.impact * .28) * item.depthScale);
          transform.rotation.set(0, 0, 0); transform.updateMatrix(); rings.setMatrixAt(ringCount, transform.matrix);
          ringFades[ringCount++] = (1 - age) ** 2 * (.38 + item.impact * .16) * item.depthScale;
        }
        const kick = (.65 + item.speed * .11 + item.impact * .85) * item.depthScale;
        for (let j = 0; j < item.particleCount; j++) {
          const index = i * DROPS_PER_SPLASH + j, angle = item.seed + j * 2.39996;
          const horizontal = (.34 + j % 3 * .17) * kick, vertical = (.64 + j % 4 * .19) * kick * (item.water ? 1 : item.dust ? .36 : .57);
          const x = item.x + Math.cos(angle) * horizontal * item.age, z = item.z + Math.sin(angle) * horizontal * item.age;
          const y = item.surfaceY + .012 + vertical * item.age - 4.9 * item.age ** 2;
          dropPositions.set([x, y, z], index * 3);
          dropFades[index] = y > Math.max(groundSurfaceHeight(x, z), item.surfaceY) + .002 ? (1 - age) * .72 : 0;
          dropColors.set(item.water ? [.56, .72, .67] : item.snow ? [.82, .89, .89] : item.dust ? [.48, .40, .28] : [.19, .13, .066], index * 3);
          dropSizes[index] = item.water ? 3.4 + j % 3 : item.dust ? 4.5 : 2.8;
        }
      }
      rings.count = ringCount; rings.instanceMatrix.needsUpdate = true; ringGeometry.attributes.aFade.needsUpdate = true; rings.visible = ringCount > 0;
      for (const attribute of Object.values(dropGeometry.attributes)) attribute.needsUpdate = true; drops.visible = stats.activeSplashes > 0;
    },
    dispose() { for (const object of [mesh, rings, drops]) { object.removeFromParent(); object.geometry.dispose(); object.material.dispose(); } },
  };
}
