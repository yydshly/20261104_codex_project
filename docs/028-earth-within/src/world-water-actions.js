import * as THREE from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';

const LIMIT = 40, DROPS = 22;
const clamp = THREE.MathUtils.clamp;
const TAU = Math.PI * 2;

export function createWaterActions(scene, collision = null) {
  const slots = Array.from({ length: LIMIT }, () => ({ active: false, age: 0 }));
  const transform = new THREE.Object3D(), check = new THREE.Vector3();
  let cursor = 0, serial = 0, previous = null, wakeDistance = 0;
  const stats = { created: 0, entries: 0, plays: 0, strokes: 0, wakes: 0, bubbles: 0,
    active: 0, droplets: 0, capacity: LIMIT, dropCapacity: LIMIT * DROPS };

  const fade = new Float32Array(LIMIT * 2);
  const ringGeometry = new THREE.RingGeometry(.82, 1, 40);
  ringGeometry.rotateX(-Math.PI / 2);
  ringGeometry.setAttribute('aFade', new THREE.InstancedBufferAttribute(fade, 1));
  const rings = new THREE.InstancedMesh(ringGeometry, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    vertexShader: `attribute float aFade; varying float vFade;
      #include <fog_pars_vertex>
      void main(){ vFade=aFade; vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `varying float vFade;
      #include <fog_pars_fragment>
      void main(){gl_FragColor=vec4(.72,.88,.82,vFade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  }), LIMIT * 2);
  rings.name = '入水与划水扩散的水面波纹'; rings.count = 0; rings.renderOrder = 6;
  rings.frustumCulled = false; rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(rings);

  const crownPositions = [], crownUVs = [], indices = [];
  for (let i = 0; i <= 40; i++) {
    for (let edge = 0; edge < 2; edge++) {
      crownPositions.push(Math.cos(i / 40 * TAU), 0, Math.sin(i / 40 * TAU)); crownUVs.push(i / 40, edge);
    }
    if (i < 40) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const crownGeometry = new THREE.BufferGeometry();
  crownGeometry.setAttribute('position', new THREE.Float32BufferAttribute(crownPositions, 3));
  crownGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(crownUVs, 2)); crownGeometry.setIndex(indices);
  const progresses = new Float32Array(LIMIT), powers = new Float32Array(LIMIT);
  crownGeometry.setAttribute('aProgress', new THREE.InstancedBufferAttribute(progresses, 1));
  crownGeometry.setAttribute('aPower', new THREE.InstancedBufferAttribute(powers, 1));
  const crowns = new THREE.InstancedMesh(crownGeometry, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
    vertexShader: `attribute float aProgress; attribute float aPower; varying float vAlpha; varying float vRim;
      #include <fog_pars_vertex>
      void main(){float t=aProgress; float burst=sin(min(t/.68,1.)*3.14159);
        float scallop=.78+.22*sin(uv.x*62.83185);
        float r=(.12+t*(.42+aPower*.72))*(.55+.45*uv.y);
        vec3 p=vec3(position.x*r,uv.y*burst*aPower*.95*scallop,position.z*r);
        vAlpha=(1.-smoothstep(.45,1.,t))*(.32+.28*uv.y);vRim=uv.y;
        vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `varying float vAlpha; varying float vRim;
      #include <fog_pars_fragment>
      void main(){gl_FragColor=vec4(mix(vec3(.22,.55,.54),vec3(.87,.96,.91),pow(vRim,3.)),vAlpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  }), LIMIT);
  crowns.name = '跳水和拍水翻起的水冠'; crowns.count = 0; crowns.renderOrder = 6.2;
  crowns.frustumCulled = false; crowns.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(crowns);

  const positions = new Float32Array(LIMIT * DROPS * 3), alphas = new Float32Array(LIMIT * DROPS);
  const sizes = new Float32Array(LIMIT * DROPS), bubbleFlags = new Float32Array(LIMIT * DROPS);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aBubble', new THREE.BufferAttribute(bubbleFlags, 1));
  const droplets = new THREE.Points(geometry, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true,
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uHeight: { value: 720 } },
    vertexShader: `attribute float aAlpha;attribute float aSize;attribute float aBubble;
      uniform float uHeight;varying float vAlpha;varying float vBubble;
      #include <fog_pars_vertex>
      void main(){vAlpha=aAlpha;vBubble=aBubble;vec4 mvPosition=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mvPosition;gl_PointSize=clamp(uHeight*aSize/max(.3,-mvPosition.z),1.,13.);
        #include <fog_vertex>
      }`,
    fragmentShader: `varying float vAlpha;varying float vBubble;
      #include <fog_pars_fragment>
      void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.||vAlpha<.001)discard;
        float edge=1.-smoothstep(.68,1.,r);float bubble=.18+.82*smoothstep(.38,.8,r);
        gl_FragColor=vec4(mix(vec3(.68,.90,.88),vec3(.91,.99,.97),1.-smoothstep(0.,.35,r)),vAlpha*edge*mix(1.,bubble,vBubble));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  }));
  droplets.name = '落水飞溅和戏水气泡'; droplets.frustumCulled = false; droplets.renderOrder = 6.5; scene.add(droplets);

  function emit(event) {
    if (!event || ![event.x, event.y, event.z, event.strength].every(Number.isFinite)) return false;
    const floor = groundSurfaceHeight(event.x, event.z), surface = waterSurfaceAt(event.x, event.z, floor);
    if (surface === null || surface - floor < .02) return false;
    const item = slots[cursor], bubble = event.kind === 'bubble';
    Object.assign(item, { active: true, age: 0, x: event.x, y: bubble ? Math.min(surface - .05, event.y) : surface,
      z: event.z, kind: event.kind, power: clamp(event.strength, .04, 1), seed: serial++ * 2.39996,
      lifetime: bubble ? 1.65 : event.kind === 'entry' ? 2.35 : event.kind === 'wake' ? 1.5 : 1.6 });
    item.dropCount = bubble ? 12 : event.kind === 'entry' ? DROPS : event.kind === 'play' ? 15 : event.kind === 'stroke' ? 6 : 0;
    cursor = (cursor + 1) % LIMIT; stats.created++;
    if (event.kind === 'entry') stats.entries++;
    else if (event.kind === 'play') stats.plays++;
    else if (event.kind === 'stroke') stats.strokes++;
    else if (event.kind === 'wake') stats.wakes++;
    else if (bubble) stats.bubbles++;
    return true;
  }

  return {
    stats, rings, crowns, droplets, emit,
    update(dt, camera, actor = null, medium = 'walk', yaw = 0, effort = 0) {
      dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
      if (actor && medium === 'swim') {
        const distance = previous ? Math.hypot(actor.x - previous.x, actor.z - previous.z) : 0;
        if (distance < 1 && effort > .16) wakeDistance += distance; else wakeDistance = 0;
        if (wakeDistance > .38) {
          wakeDistance %= .38;
          const x = actor.x - Math.sin(yaw) * .7, z = actor.z - Math.cos(yaw) * .7;
          const floor = groundSurfaceHeight(x, z), surface = waterSurfaceAt(x, z, floor);
          if (surface !== null) emit({ kind: 'wake', x, y: surface, z, strength: .12 + Math.min(effort, 4) * .035 });
        }
        previous = { x: actor.x, z: actor.z };
      } else { previous = null; wakeDistance = 0; }
      let ringCount = 0, crownCount = 0;
      stats.active = 0; stats.droplets = 0; alphas.fill(0);
      for (let i = 0; i < LIMIT; i++) {
        const item = slots[i]; if (!item.active) continue;
        item.age += dt;
        if (item.age >= item.lifetime) { item.active = false; continue; }
        const floor = groundSurfaceHeight(item.x, item.z), surface = waterSurfaceAt(item.x, item.z, floor);
        if (surface === null || surface - floor < .01) { item.active = false; continue; }
        stats.active++;
        const t = item.age / item.lifetime, bubble = item.kind === 'bubble';
        if (!bubble) {
          for (let ring = 0; ring < 2; ring++) {
            const radius = .07 + Math.sqrt(t) * (.4 + item.power * 1.9) * (1 - ring * .27);
            transform.position.set(item.x, surface + .016, item.z); transform.scale.setScalar(radius);
            transform.updateMatrix(); rings.setMatrixAt(ringCount, transform.matrix);
            fade[ringCount++] = (1 - t) ** 1.2 * (.12 + item.power * .80) * (1 - ring * .35);
          }
          if ((item.kind === 'entry' || item.kind === 'play') && item.age < .78) {
            transform.position.set(item.x, surface + .012, item.z); transform.scale.setScalar(1); transform.updateMatrix();
            crowns.setMatrixAt(crownCount, transform.matrix); progresses[crownCount] = item.age / .78;
            powers[crownCount++] = item.power;
          }
        }
        for (let j = 0; j < item.dropCount; j++) {
          const index = i * DROPS + j, age = item.age, angle = item.seed + j * 2.39996;
          const spread = bubble ? .045 : (.24 + j % 5 * .16) * (.4 + item.power);
          const x = item.x + Math.cos(angle) * age * spread, z = item.z + Math.sin(angle) * age * spread;
          const y = bubble ? item.y + age * (.42 + j % 4 * .16)
            : item.y + .015 + (1.3 + j % 4 * .48) * (.35 + item.power) * age - 4.9 * age * age;
          if (bubble ? y >= surface - .015 : y < Math.max(surface, groundSurfaceHeight(x, z)) + .006) continue;
          check.set(x, y, z); if (collision?.cameraBlocked(check, .012)) continue;
          positions.set([x, y, z], index * 3); alphas[index] = (1 - t) * (bubble ? .58 : .85);
          sizes[index] = bubble ? .024 : .025 + j % 3 * .009; bubbleFlags[index] = bubble ? 1 : 0; stats.droplets++;
        }
      }
      rings.count = ringCount; crowns.count = crownCount;
      rings.instanceMatrix.needsUpdate = crowns.instanceMatrix.needsUpdate = true;
      ringGeometry.attributes.aFade.needsUpdate = true;
      crownGeometry.attributes.aProgress.needsUpdate = crownGeometry.attributes.aPower.needsUpdate = true;
      for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true;
      rings.visible = ringCount > 0; crowns.visible = crownCount > 0; droplets.visible = stats.droplets > 0;
      const height = camera?.view?.fullHeight ?? camera?.userData?.viewportHeight ?? 720;
      droplets.material.uniforms.uHeight.value = height;
    },
  };
}
