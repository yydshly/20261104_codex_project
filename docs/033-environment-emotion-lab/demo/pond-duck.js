const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smoothstep = (low, high, value) => {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
};
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

// World coordinates use the 1536 x 1024 background. The inset ellipse keeps
// both the duck and its wake off the stone bank and the foreground plants.
function waterPoint(point) {
  let x = clamp(Number(point?.x) || 770, 480, 1060);
  let y = clamp(Number(point?.y) || 744, 634, 800);
  const dx = (x - 770) / 290, dy = (y - 719) / 91;
  const radius = Math.hypot(dx, dy);
  if (radius > .92) { x = 770 + dx / radius * 290 * .92; y = 719 + dy / radius * 91 * .92; }
  return { x, y };
}

/** Independent duck behavior, events and rendering. No audio or DOM ownership. */
export function createDuck({ onEvent = () => {} } = {}) {
  const state = {
    x: 660, y: 715, heading: 0, speed: 0, behavior: 'rest',
    time: 0, clock: 0, entered: 0, motion: true, wind: .25,
    target: { x: 850, y: 735 }, stopAt: 2.8, turn: 0,
  };
  let disposed = false, seed = 7182, action = null, wakeClock = 0;
  let sourceImage = null, texture = null, mesh = null;
  const lastEvents = new Map();
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  function emit(type, strength = .5, x = state.x, y = state.y) {
    const gap = type === 'wake' ? .26 : type === 'quack' ? 1.6 : .25;
    if (state.clock - (lastEvents.get(type) ?? -99) < gap) return;
    lastEvents.set(type, state.clock);
    onEvent({ type, x, y, strength: clamp(strength, 0, 1) });
  }
  function enter(behavior, duration = 0) {
    state.behavior = behavior;
    state.entered = state.time;
    state.stopAt = state.time + duration;
  }
  function nextRoam() {
    const sign = random() > .5 ? 1 : -1;
    state.target = waterPoint({ x: state.x + sign * (100 + random() * 160), y: 662 + random() * 108 });
    enter('cruise');
  }
  function interact(kind = 'call', point = null) {
    if (disposed) return;
    const now = state.clock;
    // Repeated calls replace the destination but never stack sound timers.
    if (kind === 'call') {
      state.target = waterPoint(point || { x: state.x < 770 ? 870 : 635, y: 768 });
      action = { type: 'call', at: now, sounded: false, arrived: false };
      enter('respond');
    } else if (kind === 'feed') {
      state.target = waterPoint(point || { x: state.x + Math.cos(state.heading) * 75, y: state.y + 15 });
      action = { type: 'feed', at: now, sounded: false, arrived: false };
      enter('approach');
      emit('splash', .28, state.target.x, state.target.y);
    } else {
      state.target = waterPoint(point);
      action = { type: 'water', at: now, sounded: true, arrived: false };
      enter('approach');
    }
    if (!state.motion) {
      if (kind === 'call') emit('quack', .55);
      action = null;
      enter('rest', 3);
    }
  }

  function update(delta, { motion = true, wind = .25 } = {}) {
    if (disposed) return false;
    const dt = clamp(Number(delta) || 0, 0, .1);
    state.clock += dt;
    state.motion = Boolean(motion);
    state.wind = clamp(Number(wind) || 0, 0, 1);
    if (!state.motion) {
      state.speed = 0;
      // Turning motion off also cancels pending performative actions.
      if (action) { action = null; enter('rest', 2); }
      return false;
    }
    state.time += dt;
    if (action?.type === 'call') {
      const age = state.clock - action.at;
      // The call first catches its attention; sound follows the head lift,
      // then it starts swimming, rather than every response firing at once.
      if (age > .48 && !action.sounded) { emit('quack', .7); action.sounded = true; }
      if (age > 1.05 && state.behavior === 'respond') enter('approach');
    }
    if (state.behavior === 'rest' && state.time >= state.stopAt) {
      if (random() > .76) enter('forage', 3.1 + random());
      else nextRoam();
    }
    if (state.behavior === 'forage' && state.time >= state.stopAt) {
      action = null;
      enter('rest', 1.5 + random() * 2);
    }
    const swimming = state.behavior === 'cruise' || state.behavior === 'approach';
    const dx = state.target.x - state.x, dy = state.target.y - state.y;
    const distance = Math.hypot(dx, dy);
    let targetSpeed = 0;
    if (swimming) {
      // A small varying tangent makes the path organic while converging on
      // its destination. Heading integrates over time, not a one-frame flip.
      const desired = Math.atan2(dy, dx) + Math.sin(state.time * .65) * .09 * clamp(distance / 60, 0, 1);
      const difference = angleDelta(state.heading, desired);
      const turnRate = 1.5 + .7 * clamp(distance / 120, 0, 1);
      state.heading += clamp(difference, -turnRate * dt, turnRate * dt);
      targetSpeed = (state.behavior === 'approach' ? 33 : 21) * smoothstep(3, 55, distance);
      targetSpeed *= .3 + .7 * Math.max(0, Math.cos(difference));
      if (distance < 6) {
        if (action && !action.arrived) { emit('arrive', .35); action.arrived = true; }
        if (action?.type === 'feed') { enter('forage', 3.5); emit('splash', .22); }
        else { action = null; enter('rest', 2.2 + random() * 4.5); }
        targetSpeed = 0;
      }
    }
    state.speed += (targetSpeed - state.speed) * (1 - Math.exp(-dt * 1.8));
    const next = waterPoint({ x: state.x + Math.cos(state.heading) * state.speed * dt, y: state.y + Math.sin(state.heading) * state.speed * dt });
    state.x = next.x; state.y = next.y;
    state.turn += angleDelta(state.turn, state.heading) * (1 - Math.exp(-dt * 4));
    wakeClock += dt;
    if (state.speed > 3 && wakeClock > .38) {
      wakeClock = 0;
      emit('wake', .15 + state.speed / 65, state.x - Math.cos(state.heading) * 47, state.y + 22 - Math.sin(state.heading) * 15);
    }
    return true;
  }

  function rasterize(image) {
    if (image === sourceImage && texture) return;
    sourceImage = image;
    texture = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(420, 280) : document.createElement('canvas');
    texture.width = 420; texture.height = 280;
    const paint = texture.getContext('2d');
    paint.drawImage(image, 0, 0, 420, 280);
    mesh = [];
    // More subdivision around the head keeps the neck bend continuous.
    const cols = 12, rows = 8;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = { x: col * 420 / cols, y: row * 280 / rows };
      const b = { x: (col + 1) * 420 / cols, y: a.y };
      const c = { x: b.x, y: (row + 1) * 280 / rows };
      const d = { x: a.x, y: c.y };
      mesh.push([a, b, c], [a, c, d]);
    }
  }

  function triangle(ctx, source, a, b, c, aa, bb, cc) {
    const det = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
    if (!det) return;
    const coeff = key => [
      (aa[key] * (b.y - c.y) + bb[key] * (c.y - a.y) + cc[key] * (a.y - b.y)) / det,
      (aa[key] * (c.x - b.x) + bb[key] * (a.x - c.x) + cc[key] * (b.x - a.x)) / det,
      (aa[key] * (b.x * c.y - c.x * b.y) + bb[key] * (c.x * a.y - a.x * c.y) + cc[key] * (a.x * b.y - b.x * a.y)) / det,
    ];
    const x = coeff('x'), y = coeff('y');
    ctx.save();
    ctx.beginPath();
    // A subpixel clip overlap prevents hairline seams between adjacent cells.
    const cx = (aa.x + bb.x + cc.x) / 3, cy = (aa.y + bb.y + cc.y) / 3;
    [aa, bb, cc].forEach((p, index) => {
      const d = Math.hypot(p.x - cx, p.y - cy) || 1;
      const xx = p.x + (p.x - cx) / d * .22, yy = p.y + (p.y - cy) / d * .22;
      if (index) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
    });
    ctx.closePath(); ctx.clip();
    ctx.transform(x[0], y[0], x[1], y[1], x[2], y[2]);
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }

  function draw(ctx, { image, night = 0, time = state.time, frame = null } = {}) {
    if (disposed || (!image && !frame)) return;
    const t = state.motion ? time : 0;
    const age = state.time - state.entered;
    const response = state.motion && state.behavior === 'respond' ? Math.sin(clamp(age / 1.2, 0, 1) * Math.PI) : 0;
    const forage = state.motion && state.behavior === 'forage' ? Math.pow(Math.max(0, Math.sin(age * 2.4)), 2) : 0;
    const paddle = state.motion ? Math.sin(t * (2.2 + state.speed * .035)) * clamp(state.speed / 22, 0, 1) : 0;
    const bob = state.motion ? Math.sin(t * 1.75) * .9 + Math.sin(t * 2.9) * .32 + paddle * .32 : 0;
    const roll = state.motion ? Math.sin(t * 1.4) * .008 + paddle * .012 : 0;
    const size = 145 * (.89 + (state.y - 634) / 166 * .19);
    const height = size * 2 / 3;
    const facing = Math.cos(state.turn);
    // The width continuously narrows during turns. Keep a tiny nonzero width
    // so the transform remains invertible at an exact quarter-turn.
    const yaw = Math.abs(facing) < .025 ? (facing < 0 ? -.025 : .025) : facing;
    ctx.save();
    ctx.translate(state.x, state.y + bob);
    ctx.rotate(roll);
    ctx.scale(yaw, 1);
    const source = frame && (frame.readyState == null || frame.readyState >= 2) ? frame : image;
    if (!source) { ctx.restore(); return; }
    // Reflect the same pose at the contact line; a low alpha and compression
    // avoid a second, solid-looking duck pasted beneath the first.
    ctx.save();
    ctx.globalAlpha *= .12;
    ctx.translate(0, height * .58);
    ctx.scale(1, -.36);
    ctx.filter = 'blur(1.3px)';
    ctx.drawImage(source, -size / 2, -height / 2, size, height);
    ctx.restore();
    if (night > .01) ctx.filter = `brightness(${1 - clamp(night, 0, 1) * .30}) saturate(.88)`;
    if (source === frame) {
      // Animated frames already contain anatomical movement. Only the world
      // transform, buoyancy, heading and reflection are applied to video.
      ctx.drawImage(source, -size / 2, -height / 2, size, height);
    } else {
      rasterize(image);
      const deform = p => {
        const nx = p.x / 420, ny = p.y / 280;
        const head = smoothstep(.51, .68, nx) * (1 - smoothstep(.52, .76, ny));
        const neck = smoothstep(.51, .68, nx) * (1 - smoothstep(.54, .83, ny));
        const tail = (1 - smoothstep(.08, .35, nx)) * smoothstep(.38, .6, ny);
        const body = Math.sin(clamp(nx, 0, 1) * Math.PI) * smoothstep(.48, .7, ny);
        const smallLook = state.motion ? Math.sin(t * .61) * .014 + Math.sin(t * 1.12) * .004 : 0;
        const headAngle = smallLook - response * .12 + forage * .53;
        const px = (nx - .64) * size, py = (ny - .65) * height;
        const turnX = Math.cos(headAngle) * px - Math.sin(headAngle) * py;
        const turnY = Math.sin(headAngle) * px + Math.cos(headAngle) * py;
        const blend = Math.max(head, neck * .75);
        return {
          x: (nx - .5) * size + (turnX - px) * blend + tail * Math.sin(t * 2.8) * (state.motion ? .8 : 0),
          y: (ny - .5) * height + (turnY - py) * blend + body * Math.sin(t * 1.6) * (state.motion ? .45 : 0) - response * head * 2,
        };
      };
      for (const [a, b, c] of mesh) triangle(ctx, texture, a, b, c, deform(a), deform(b), deform(c));
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = `rgba(205,224,212,${.12 + state.speed / 250})`;
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.ellipse(state.x - facing * 2, state.y + height * .28, size * (.29 + .11 * Math.abs(facing)), 5.8, 0, .05, Math.PI * 1.96);
    ctx.stroke();
    ctx.restore();
  }

  function getState() {
    return { x: state.x, y: state.y, heading: state.heading, speed: state.speed, behavior: state.behavior, target: { ...state.target }, motion: state.motion, time: state.time };
  }
  return {
    update, draw, interact, getState,
    dispose() { disposed = true; texture = null; mesh = null; sourceImage = null; action = null; lastEvents.clear(); },
  };
}
