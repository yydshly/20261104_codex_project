import { ATTACKS, SKILLS, resolveWarlordMovement } from './warlord-logic.js';

/** Visual feedback only. Call update after the hero mixer and world transforms. */
export function createWarlordFX(THREE, scene, { floatLayer = null } = {}) {
  const root = new THREE.Group(); root.name = 'WarlordFX'; scene.add(root);
  const geometries = new Set(), materials = new Set(), temporary = [], sparks = [], dust = [], floaters = [], trailSamples = [];
  const ownGeometry = geometry => { geometries.add(geometry); return geometry; };
  const ownMaterial = material => { materials.add(material); return material; };
  const v = new THREE.Vector3(), tipPosition = new THREE.Vector3(), gripPosition = new THREE.Vector3(), basePosition = new THREE.Vector3();
  const yAxis = new THREE.Vector3(0, 1, 0), direction = new THREE.Vector3(), projection = new THREE.Vector3();
  const gold = new THREE.Color(0xffcd89), red = new THREE.Color(0xe76d52), ash = new THREE.Color(0x9c8168);
  let hero = null, tip = null, grip = null, disposed = false, elapsed = 0, shieldFlash = 0, randomState = 9517, floatSerial = 0;
  const random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const finitePoint = point => point && Number.isFinite(point.x) && Number.isFinite(point.z);
  const basic = (color, opacity, additive = false) => ownMaterial(new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false,
  }));
  const lineMaterial = (color, opacity, additive = false) => ownMaterial(new THREE.LineBasicMaterial({
    color, transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false,
  }));
  function line(points, material, loop = false) {
    const geometry = ownGeometry(new THREE.BufferGeometry().setFromPoints(points));
    return loop ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
  }
  function circlePoints(radius, segments = 80, height = 0) {
    return Array.from({ length: segments }, (_, i) => new THREE.Vector3(Math.sin(i / segments * Math.PI * 2) * radius, height, Math.cos(i / segments * Math.PI * 2) * radius));
  }
  function discGeometry(radius, halfAngle = Math.PI, segments = 72, innerRadius = 0) {
    const positions = [], indices = [];
    for (let i = 0; i <= segments; i++) {
      const angle = -halfAngle + i / segments * halfAngle * 2;
      positions.push(Math.sin(angle) * innerRadius, 0, Math.cos(angle) * innerRadius, Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      if (i < segments) { const n = i * 2; indices.push(n, n + 1, n + 3, n, n + 3, n + 2); }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry()); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); return geometry;
  }
  function makeGroundGroup(name) { const group = new THREE.Group(); group.name = name; group.position.y = .035; group.visible = false; root.add(group); return group; }

  const qAim = makeGroundGroup('CleaveAim');
  const qFill = new THREE.Mesh(discGeometry(SKILLS.Q.reach, SKILLS.Q.halfAngle, 60), basic(0xd8aa73, .07));
  const qOutlinePoints = [new THREE.Vector3()];
  for (let i = 0; i <= 60; i++) { const a = -SKILLS.Q.halfAngle + i / 60 * SKILLS.Q.halfAngle * 2; qOutlinePoints.push(new THREE.Vector3(Math.sin(a) * SKILLS.Q.reach, 0, Math.cos(a) * SKILLS.Q.reach)); }
  qOutlinePoints.push(new THREE.Vector3());
  const qOutline = line(qOutlinePoints, lineMaterial(0xf2cc92, .75)); qAim.add(qFill, qOutline);

  const rAim = makeGroundGroup('LeapLandingAim');
  const rFill = new THREE.Mesh(discGeometry(SKILLS.R.radius), basic(0xb9564a, .045));
  const rEdge = line(circlePoints(SKILLS.R.radius), lineMaterial(0xe6be8a, .8), true);
  const rInner = line(circlePoints(.38, 32), lineMaterial(0xffd69b, .65), true);
  rAim.add(rFill, rEdge, rInner);
  for (const sign of [-1, 1]) for (const axis of ['x', 'z']) {
    const points = [new THREE.Vector3(), new THREE.Vector3()]; points[0][axis] = sign * .6; points[1][axis] = sign * .9;
    rAim.add(line(points, lineMaterial(0xf2ca90, .65)));
  }
  const takeoff = makeGroundGroup('LeapTakeoff');
  const takeoffEdge = line(circlePoints(.65, 4), lineMaterial(0xe3b27a, .55), true); takeoffEdge.rotation.y = Math.PI / 4; takeoff.add(takeoffEdge);

  const zone = makeGroundGroup('WarlordBattlefield');
  const zoneFill = new THREE.Mesh(discGeometry(1), basic(0x9d3c37, .02));
  const zoneEdge = line(circlePoints(1), lineMaterial(0xc37e5a, .28), true); zone.add(zoneFill, zoneEdge);

  const shieldMaterial = ownMaterial(new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xb4a3d1) }, uStrength: { value: 0 }, uFlash: { value: 0 } },
    vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=-mv.xyz; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uStrength; uniform float uFlash; varying vec3 vNormal; varying vec3 vView; void main(){ float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),2.1); float alpha=(0.022+rim*0.46)*uStrength+uFlash*(0.05+rim*0.28); gl_FragColor=vec4(mix(uColor,vec3(1.0,0.88,0.7),uFlash),alpha); }',
    transparent: true, depthWrite: false, side: THREE.FrontSide, toneMapped: false,
  }));
  const shield = new THREE.Mesh(ownGeometry(new THREE.SphereGeometry(1, 36, 20)), shieldMaterial);
  shield.name = 'IronwallShield'; shield.scale.set(.9, 1.3, .9); shield.visible = false; root.add(shield);
  const shieldRimMaterial = lineMaterial(0xbaadd3, .22);
  const shieldRim = line(circlePoints(.9, 64), shieldRimMaterial, true); shieldRim.visible = false; root.add(shieldRim);

  const bladeGlow = new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(.024, .014, 1, 6)), basic(0xffb868, .46, true));
  bladeGlow.name = 'EmpoweredHalberdEdge'; bladeGlow.visible = false; root.add(bladeGlow);

  const maxTrailSamples = 28, maxTrailVertices = (maxTrailSamples - 1) * 6;
  const trailGeometry = ownGeometry(new THREE.BufferGeometry());
  const trailPositions = new Float32Array(maxTrailVertices * 3), trailColors = new Float32Array(maxTrailVertices * 4);
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3).setUsage(THREE.DynamicDrawUsage));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 4).setUsage(THREE.DynamicDrawUsage)); trailGeometry.setDrawRange(0, 0);
  const trail = new THREE.Mesh(trailGeometry, ownMaterial(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .68, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  trail.name = 'SampledHalberdTrail'; trail.frustumCulled = false; root.add(trail);

  const maxSparks = 90, sparkPositions = new Float32Array(maxSparks * 6), sparkColors = new Float32Array(maxSparks * 8);
  const sparkGeometry = ownGeometry(new THREE.BufferGeometry());
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3).setUsage(THREE.DynamicDrawUsage));
  sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 4).setUsage(THREE.DynamicDrawUsage)); sparkGeometry.setDrawRange(0, 0);
  const sparkLines = new THREE.LineSegments(sparkGeometry, ownMaterial(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  sparkLines.name = 'ContactSparks'; sparkLines.frustumCulled = false; root.add(sparkLines);

  const maxDust = 40, dustPositions = new Float32Array(maxDust * 3), dustColors = new Float32Array(maxDust * 4);
  const dustGeometry = ownGeometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3).setUsage(THREE.DynamicDrawUsage));
  dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 4).setUsage(THREE.DynamicDrawUsage)); dustGeometry.setDrawRange(0, 0);
  const dustPoints = new THREE.Points(dustGeometry, ownMaterial(new THREE.PointsMaterial({ color: 0xc1a58b, size: .13, vertexColors: true, transparent: true, opacity: .28, depthWrite: false, toneMapped: false })));
  dustPoints.name = 'LandingDust'; dustPoints.frustumCulled = false; root.add(dustPoints);
  const shockGeometry = discGeometry(1, Math.PI, 80, .965);

  function disposeTemporary(record) {
    record.object.removeFromParent();
    for (const geometry of record.geometries || []) { geometry.dispose(); geometries.delete(geometry); }
    for (const material of record.materials || []) { material.dispose(); materials.delete(material); }
  }
  function shock(x, z, radius, duration = .45, opacity = .5) {
    const material = basic(0xd7a36e, opacity, true), mesh = new THREE.Mesh(shockGeometry, material);
    mesh.position.set(x, .055, z); root.add(mesh); temporary.push({ kind: 'shock', object: mesh, materials: [material], radius, duration, age: 0, opacity });
  }
  function landingCracks(x, z, radius) {
    const points = [];
    for (let ray = 0; ray < 8; ray++) {
      let angle = ray / 8 * Math.PI * 2 + (random() - .5) * .2, previous = new THREE.Vector3(x + Math.sin(angle) * .32, .045, z + Math.cos(angle) * .32);
      for (let segment = 1; segment <= 4; segment++) {
        angle += (random() - .5) * .25; const distance = radius * (.13 + segment * .17) * (.85 + random() * .15);
        const next = new THREE.Vector3(x + Math.sin(angle) * distance, .045, z + Math.cos(angle) * distance); points.push(previous, next); previous = next;
      }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry().setFromPoints(points)), material = lineMaterial(0xd68d5e, .5, true), object = new THREE.LineSegments(geometry, material);
    root.add(object); temporary.push({ kind: 'cracks', object, geometries: [geometry], materials: [material], duration: .9, age: 0, opacity: .5 });
    for (let i = 0; i < 14; i++) {
      const angle = random() * Math.PI * 2, speed = .6 + random() * 1.3, distance = .4 + random() * radius * .6;
      dust.push({ x: x + Math.sin(angle) * distance, y: .07, z: z + Math.cos(angle) * distance, vx: Math.sin(angle) * speed, vy: .4 + random() * .9, vz: Math.cos(angle) * speed, age: 0, life: .45 + random() * .35 });
    }
    if (dust.length > maxDust) dust.splice(0, dust.length - maxDust);
  }
  function contact(x, y, z, count = 7, facing = 0) {
    for (let i = 0; i < count; i++) {
      const angle = facing + (random() - .5) * Math.PI * 1.7, speed = 1.3 + random() * 2.2;
      sparks.push({ x, y, z, vx: Math.sin(angle) * speed, vy: .3 + random() * 1.8, vz: Math.cos(angle) * speed, age: 0, life: .16 + random() * .14 });
    }
    if (sparks.length > maxSparks) sparks.splice(0, sparks.length - maxSparks);
  }
  function addFloater(text, x, y, z, className = '') {
    const document = floatLayer?.ownerDocument || globalThis.document;
    if (!floatLayer || !document?.createElement) return;
    const element = document.createElement('span'); element.className = `floater ${className}`.trim(); element.textContent = String(text);
    floatLayer.appendChild(element); floaters.push({ element, x, y, z, age: 0, offset: (floatSerial++ % 3 - 1) * 9 });
    if (floaters.length > 24) floaters.shift().element.remove();
  }

  function attachHero(actorRoot) {
    if (disposed) return false;
    hero = actorRoot || null; tip = null; grip = null; trailSamples.length = 0; trailGeometry.setDrawRange(0, 0); bladeGlow.visible = false;
    hero?.traverse(object => {
      const name = object.name?.toLowerCase();
      if (name === 'halberdtip' || name === 'halberdbladetip') tip = object;
      if (name === 'halberdgrip') grip = object;
    });
    // An absent mount disables only the sampled weapon effects, never invents a circular slash.
    return Boolean(tip && grip);
  }
  function event(effect, session) {
    if (disposed || !effect) return;
    const player = session?.position || { x: 0, z: 0 };
    if (effect.type === 'hit') {
      const enemy = session?.enemies?.find(candidate => candidate.id === (effect.enemyId || effect.id));
      const x = effect.x ?? enemy?.x ?? 0, z = effect.z ?? enemy?.z ?? 0, height = 1.05 + (enemy?.airHeight || 0);
      contact(x, height, z, effect.critical ? 10 : 6, Math.atan2(x - player.x, z - player.z));
      if (Number.isFinite(effect.amount)) addFloater(effect.amount, x, height + .7, z, effect.critical ? 'critical' : '');
    } else if (effect.type === 'shieldHit') {
      shieldFlash = 1; contact(player.x, 1.15 + (session?.heroHeight || 0), player.z, 4);
    } else if (effect.type === 'skillStart' && effect.skill === 'R') shock(player.x, player.z, .9, .28, .28);
    else if (effect.type === 'slam') {
      shock(effect.x, effect.z, effect.radius || SKILLS.R.radius, .46, .65);
      landingCracks(effect.x, effect.z, effect.radius || SKILLS.R.radius);
    }
  }

  function sampleWeapon(dt, session) {
    for (let i = trailSamples.length - 1; i >= 0; i--) { trailSamples[i].age += dt; if (trailSamples[i].age >= trailSamples[i].life) trailSamples.splice(i, 1); }
    const mounted = tip && grip && hero;
    if (mounted) {
      hero.updateWorldMatrix(true, true); tip.getWorldPosition(tipPosition); grip.getWorldPosition(gripPosition);
      basePosition.copy(tipPosition).lerp(gripPosition, .19);
      const spec = session.action === 'Cleave' ? SKILLS.Q : session.action?.startsWith('Attack') ? ATTACKS[Number(session.action.slice(-1)) - 1] : null;
      const active = spec ? session.actionTime >= spec.hit - .1 && session.actionTime <= spec.activeEnd + .07 : session.action === 'Leap' && session.actionTime > .4 && session.actionTime < 1;
      const previous = trailSamples.at(-1), travel = previous ? previous.tip.distanceTo(tipPosition) : 0;
      if (active && tipPosition.distanceTo(gripPosition) > .1) {
        if (travel > 2.5) trailSamples.length = 0;
        if (!previous || travel > .025) trailSamples.push({ tip: tipPosition.clone(), base: basePosition.clone(), age: 0, life: session.action === 'Cleave' ? .21 : .16 });
      }
      bladeGlow.visible = session.empoweredTime > 0 && tipPosition.distanceTo(basePosition) > .02;
      if (bladeGlow.visible) {
        bladeGlow.position.copy(tipPosition).add(basePosition).multiplyScalar(.5); direction.copy(tipPosition).sub(basePosition);
        bladeGlow.scale.set(1, direction.length(), 1); bladeGlow.quaternion.setFromUnitVectors(yAxis, direction.normalize());
        bladeGlow.material.opacity = (.35 + Math.sin(elapsed * 5) * .08) * Math.min(1, session.empoweredTime);
      }
    } else bladeGlow.visible = false;
    if (trailSamples.length > maxTrailSamples) trailSamples.splice(0, trailSamples.length - maxTrailSamples);
    let vertex = 0;
    const write = (sample, edge) => {
      const point = edge ? sample.tip : sample.base, alpha = (1 - sample.age / sample.life) * (edge ? .72 : .05), color = edge ? gold : red;
      point.toArray(trailPositions, vertex * 3); trailColors.set([color.r, color.g, color.b, alpha], vertex * 4); vertex++;
    };
    for (let i = 1; i < trailSamples.length; i++) { const a = trailSamples[i - 1], b = trailSamples[i]; write(a, false); write(a, true); write(b, true); write(a, false); write(b, true); write(b, false); }
    trailGeometry.setDrawRange(0, vertex); trailGeometry.attributes.position.needsUpdate = true; trailGeometry.attributes.color.needsUpdate = true;
  }

  function updateParticles(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.age += dt; if (p.age >= p.life) { sparks.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= dt * 7; }
    let vertex = 0;
    for (const p of sparks) {
      const alpha = 1 - p.age / p.life;
      sparkPositions.set([p.x, p.y, p.z, p.x - p.vx * .025, p.y - p.vy * .025, p.z - p.vz * .025], vertex * 3);
      sparkColors.set([gold.r, gold.g, gold.b, alpha, red.r, red.g, red.b, alpha * .15], vertex * 4); vertex += 2;
    }
    sparkGeometry.setDrawRange(0, vertex); sparkGeometry.attributes.position.needsUpdate = true; sparkGeometry.attributes.color.needsUpdate = true;
    for (let i = dust.length - 1; i >= 0; i--) { const p = dust[i]; p.age += dt; if (p.age >= p.life) { dust.splice(i, 1); continue; } p.x += p.vx * dt; p.y = Math.max(.04, p.y + p.vy * dt); p.z += p.vz * dt; p.vy -= dt * 2.8; }
    for (let i = 0; i < dust.length; i++) { const p = dust[i]; dustPositions.set([p.x, p.y, p.z], i * 3); dustColors.set([ash.r, ash.g, ash.b, 1 - p.age / p.life], i * 4); }
    dustGeometry.setDrawRange(0, dust.length); dustGeometry.attributes.position.needsUpdate = true; dustGeometry.attributes.color.needsUpdate = true;
    for (let i = temporary.length - 1; i >= 0; i--) {
      const effect = temporary[i]; effect.age += dt; const progress = effect.age / effect.duration;
      if (progress >= 1) { disposeTemporary(effect); temporary.splice(i, 1); continue; }
      if (effect.kind === 'shock') effect.object.scale.setScalar(effect.radius * (.12 + .88 * (1 - (1 - progress) ** 3)));
      effect.object.material.opacity = effect.opacity * (1 - progress) ** 1.5;
    }
  }

  function update(dt, session, { aimPoint = null, aimingSkill = null, camera = null, width = floatLayer?.clientWidth || 1, height = floatLayer?.clientHeight || 1, time } = {}) {
    if (disposed || !session) return;
    dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .1); elapsed = Number.isFinite(time) ? time : elapsed + dt;
    const playing = session.status === 'playing', point = finitePoint(aimPoint) ? aimPoint : session.aim;
    const aimKey = typeof aimingSkill === 'string' ? aimingSkill.toUpperCase() : aimingSkill?.skill;
    qAim.visible = playing && aimKey === 'Q';
    if (qAim.visible) {
      qAim.position.set(session.position.x, .04, session.position.z);
      qAim.rotation.y = finitePoint(point) ? Math.atan2(point.x - session.position.x, point.z - session.position.z) : session.facing;
      qOutline.material.opacity = session.cooldowns.Q > 0 ? .28 : .75;
    }
    const leaping = session.action === 'Leap' && session.leap && !session.leap.landed;
    rAim.visible = playing && (aimKey === 'R' || leaping); takeoff.visible = rAim.visible;
    if (rAim.visible) {
      let target;
      if (leaping) target = session.leap.target;
      else {
        const destination = finitePoint(point) ? point : { x: session.position.x + Math.sin(session.facing) * 4, z: session.position.z + Math.cos(session.facing) * 4 };
        const dx = destination.x - session.position.x, dz = destination.z - session.position.z, length = Math.hypot(dx, dz), ratio = length > SKILLS.R.range ? SKILLS.R.range / length : 1;
        target = resolveWarlordMovement(session.position, dx * ratio, dz * ratio, session.colliders || [], session.settings?.radius || .4, session.settings?.arenaRadius || 10.5);
      }
      rAim.position.set(target.x, .045, target.z); const origin = leaping ? session.leap.from : session.position; takeoff.position.set(origin.x, .04, origin.z);
      rEdge.material.opacity = leaping ? .45 + Math.sin(elapsed * 12) * .12 : session.cooldowns.R > 0 ? .28 : .8;
    }
    zone.visible = Boolean(session.zone);
    if (zone.visible) { zone.position.set(session.zone.x, .032, session.zone.z); zone.scale.setScalar(session.zone.radius); zoneEdge.material.opacity = .25 * Math.min(1, session.zone.remaining); zoneFill.material.opacity = .018 * Math.min(1, session.zone.remaining); }
    shieldFlash = Math.max(0, shieldFlash - dt * 7); shield.visible = (session.shield > 0 && session.shieldTime > 0) || shieldFlash > 0;
    shieldRim.visible = shield.visible;
    if (shield.visible) {
      if (hero) { hero.updateWorldMatrix(true, false); hero.getWorldPosition(v); } else v.set(session.position.x, session.heroHeight || 0, session.position.z);
      shield.position.copy(v); shield.position.y += 1.2; shieldRim.position.copy(v); shieldRim.position.y += .35;
      shieldMaterial.uniforms.uStrength.value = Math.min(1, session.shieldTime || 0) * (.55 + .45 * clamp(session.shield / (session.shieldMax || 90), 0, 1));
      shieldMaterial.uniforms.uFlash.value = shieldFlash; shieldRimMaterial.opacity = .16 * shieldMaterial.uniforms.uStrength.value + shieldFlash * .3;
    }
    sampleWeapon(dt, session); updateParticles(dt);
    for (let i = floaters.length - 1; i >= 0; i--) {
      const floater = floaters[i]; floater.age += dt;
      if (floater.age >= .85) { floater.element.remove(); floaters.splice(i, 1); continue; }
      if (!camera) { floater.element.style.display = 'none'; continue; }
      projection.set(floater.x, floater.y + floater.age * .85, floater.z).project(camera);
      const visible = projection.z >= -1 && projection.z <= 1 && Math.abs(projection.x) < 1.2 && Math.abs(projection.y) < 1.3;
      floater.element.style.display = visible ? '' : 'none'; floater.element.style.left = `${(projection.x * .5 + .5) * width + floater.offset}px`;
      floater.element.style.top = `${(-projection.y * .5 + .5) * height}px`; floater.element.style.opacity = String(Math.min(1, (.85 - floater.age) * 4));
    }
  }
  function reset() {
    if (disposed) return;
    for (const effect of temporary) disposeTemporary(effect); temporary.length = 0;
    for (const floater of floaters) floater.element.remove(); floaters.length = 0;
    sparks.length = 0; dust.length = 0; trailSamples.length = 0; shieldFlash = 0; floatSerial = 0;
    sparkGeometry.setDrawRange(0, 0); dustGeometry.setDrawRange(0, 0); trailGeometry.setDrawRange(0, 0);
    qAim.visible = false; rAim.visible = false; takeoff.visible = false; zone.visible = false; shield.visible = false; shieldRim.visible = false; bladeGlow.visible = false;
  }
  function dispose() {
    if (disposed) return; reset();
    for (const geometry of geometries) geometry.dispose(); for (const material of materials) material.dispose();
    geometries.clear(); materials.clear(); root.removeFromParent(); hero = null; tip = null; grip = null; disposed = true;
  }
  return { attachHero, event, update, reset, dispose };
}
