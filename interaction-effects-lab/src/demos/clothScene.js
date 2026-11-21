const columns = 17;
const rows = 17;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function drawTriangle(context, image, nodes) {
  const [a, b, c] = nodes;
  const du1 = b.u - a.u;
  const dv1 = b.v - a.v;
  const du2 = c.u - a.u;
  const dv2 = c.v - a.v;
  const determinant = du1 * dv2 - du2 * dv1;
  if (Math.abs(determinant) < .001) return;
  const dx1 = b.screenX - a.screenX;
  const dy1 = b.screenY - a.screenY;
  const dx2 = c.screenX - a.screenX;
  const dy2 = c.screenY - a.screenY;
  const xFromU = (dx1 * dv2 - dx2 * dv1) / determinant;
  const yFromU = (dy1 * dv2 - dy2 * dv1) / determinant;
  const xFromV = (dx2 * du1 - dx1 * du2) / determinant;
  const yFromV = (dy2 * du1 - dy1 * du2) / determinant;
  const centerX = (a.screenX + b.screenX + c.screenX) / 3;
  const centerY = (a.screenY + b.screenY + c.screenY) / 3;

  context.save();
  context.beginPath();
  nodes.forEach((node, index) => {
    const x = centerX + (node.screenX - centerX) * 1.05;
    const y = centerY + (node.screenY - centerY) * 1.05;
    if (index) context.lineTo(x, y);
    else context.moveTo(x, y);
  });
  context.closePath();
  context.clip();
  context.transform(xFromU, yFromU, xFromV, yFromV,
    a.screenX - a.u * xFromU - a.v * xFromV,
    a.screenY - a.u * yFromU - a.v * yFromV);
  context.drawImage(image, 0, 0, 1, 1);

  const nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
  const ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
  const normal = Math.hypot(nx, ny, nz) || 1;
  const luminance = Math.abs((nz * .88 - nx * .30 - ny * .35) / normal);
  context.fillStyle = `rgba(18,12,31,${(1 - luminance) * .43})`;
  context.fillRect(0, 0, 1, 1);
  context.restore();
}

export function createClothScene(canvas, updateMotion) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;
  const nodes = [];
  const springs = [];
  const triangles = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodeAt = (x, y) => nodes[y * columns + x];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let clothSize = 1;
  let source = null;
  let imageToken = 0;
  let disposed = false;
  let frame = 0;
  let frameAt = 0;
  let accumulator = 0;
  let drag = null;
  let keyboard = null;
  let settledBy = 0;
  let state = 'still';
  let stiffness = .76;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const x = u - .5;
      const y = v;
      nodes.push({ x, y, z: 0, oldX: x, oldY: y, oldZ: 0, u, v,
        pin: row === 0 && (column === 0 || column === columns - 1) });
    }
  }
  const addSpring = (x1, y1, x2, y2, factor) => {
    if (x2 < 0 || x2 >= columns || y2 >= rows) return;
    const a = nodeAt(x1, y1);
    const b = nodeAt(x2, y2);
    springs.push({ a, b, rest: Math.hypot(a.x - b.x, a.y - b.y), factor });
  };
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      addSpring(column, row, column + 1, row, 1);
      addSpring(column, row, column, row + 1, 1);
      addSpring(column, row, column + 1, row + 1, .62);
      addSpring(column, row, column - 1, row + 1, .62);
      addSpring(column, row, column + 2, row, .26);
      addSpring(column, row, column, row + 2, .26);
      if (column < columns - 1 && row < rows - 1) {
        const a = nodeAt(column, row);
        const b = nodeAt(column + 1, row);
        const c = nodeAt(column, row + 1);
        const d = nodeAt(column + 1, row + 1);
        triangles.push([a, b, c], [b, d, c]);
      }
    }
  }

  function notify(next) {
    if (next === state) return;
    state = next;
    updateMotion(next);
  }

  function simulate() {
    const hold = drag ?? keyboard;
    const fixed = hold?.node;
    const damping = reduced ? .76 : .967;
    for (const node of nodes) {
      if (node.pin || node === fixed) continue;
      const x = node.x + (node.x - node.oldX) * damping;
      const y = node.y + (node.y - node.oldY) * damping + .00038;
      const z = node.z + (node.z - node.oldZ) * damping;
      node.oldX = node.x;
      node.oldY = node.y;
      node.oldZ = node.z;
      node.x = x;
      node.y = y;
      node.z = z;
    }
    if (hold) {
      fixed.x += (hold.x - fixed.x) * .48;
      fixed.y += (hold.y - fixed.y) * .48;
      fixed.z += (hold.z - fixed.z) * .48;
      fixed.oldX = fixed.x;
      fixed.oldY = fixed.y;
      fixed.oldZ = fixed.z;
    }
    for (let pass = 0; pass < 6; pass++) {
      for (const { a, b, rest, factor } of springs) {
        const weightA = a.pin || a === fixed ? 0 : 1;
        const weightB = b.pin || b === fixed ? 0 : 1;
        if (weightA + weightB === 0) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const length = Math.hypot(dx, dy, dz) || .0001;
        const stretch = (length - rest) / length * factor * stiffness / (weightA + weightB);
        a.x += dx * stretch * weightA;
        a.y += dy * stretch * weightA;
        a.z += dz * stretch * weightA;
        b.x -= dx * stretch * weightB;
        b.y -= dy * stretch * weightB;
        b.z -= dz * stretch * weightB;
      }
    }
  }

  function project() {
    const yaw = -.32;
    const roll = .062;
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const sinRoll = Math.sin(roll);
    const cosRoll = Math.cos(roll);
    for (const node of nodes) {
      const x = node.x * cosYaw + node.z * sinYaw;
      const y = node.y - .51;
      const z = node.z * cosYaw - node.x * sinYaw;
      const perspective = 2.8 / Math.max(1.45, 2.8 - z);
      node.screenX = width * .5 + (x * cosRoll - y * sinRoll) * clothSize * perspective;
      node.screenY = height * .48 + (y * cosRoll + x * sinRoll) * clothSize * perspective;
      node.depth = z;
    }
  }

  function paint() {
    if (!width || !height) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    project();
    if (!source) return;
    const ordered = triangles.map((face) => ({
      face, depth: face[0].depth + face[1].depth + face[2].depth,
    })).sort((a, b) => a.depth - b.depth);
    for (const { face } of ordered) drawTriangle(context, source, face);
  }

  function tick(now) {
    frame = 0;
    if (disposed) return;
    accumulator += frameAt ? Math.min(now - frameAt, 44) : 16;
    frameAt = now;
    if (keyboard && now >= keyboard.until) {
      keyboard = null;
      settle(now);
    }
    while (accumulator >= 12) {
      simulate();
      accumulator -= 12;
    }
    paint();
    if (drag || keyboard || now < settledBy) schedule();
    else {
      frameAt = 0;
      accumulator = 0;
      notify('still');
    }
  }

  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }

  function settle(now = performance.now()) {
    settledBy = now + (reduced ? 130 : 1250);
    notify('settling');
    schedule();
  }

  function getPoint(x, y) {
    let nearest = null;
    let threshold = clothSize * .11;
    for (const node of nodes) {
      if (node.pin) continue;
      const distance = Math.hypot(x - node.screenX, y - node.screenY);
      if (distance < threshold) {
        nearest = node;
        threshold = distance;
      }
    }
    return nearest;
  }

  const observer = new ResizeObserver(([entry]) => {
    ({ width, height } = entry.contentRect);
    if (!width || !height) return;
    clothSize = Math.min(width * .74, height * .85);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.55);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    paint();
  });
  observer.observe(canvas);
  settledBy = performance.now() + (reduced ? 120 : 650);
  schedule();

  return {
    setFabric(url, response) {
      stiffness = response;
      const token = ++imageToken;
      const image = new Image();
      image.onload = () => {
        if (disposed || token !== imageToken) return;
        source = image;
        paint();
      };
      image.src = url;
    },
    canGrab(x, y) { return !!getPoint(x, y); },
    grab(x, y) {
      const node = getPoint(x, y);
      if (!node) return false;
      keyboard = null;
      drag = { node, x: node.x, y: node.y, z: node.z, fromX: x, fromY: y, startX: node.x, startY: node.y, startZ: node.z };
      notify('dragging');
      schedule();
      return true;
    },
    move(x, y) {
      if (!drag) return;
      const dx = (x - drag.fromX) / clothSize;
      const dy = (y - drag.fromY) / clothSize;
      drag.x = drag.startX + clamp(dx, -.8, .8);
      drag.y = drag.startY + clamp(dy, -.65, .65);
      drag.z = drag.startZ + Math.min(.72, Math.hypot(dx, dy) * .95);
    },
    release() {
      if (!drag) return;
      drag = null;
      settle();
    },
    tug(x, y) {
      if (drag) return;
      const node = nodeAt(Math.round((columns - 1) * .5), Math.round((rows - 1) * .68));
      keyboard = { node, x: node.x + x, y: node.y + y, z: node.z + .44, until: performance.now() + (reduced ? 85 : 220) };
      notify('dragging');
      schedule();
    },
    reset() {
      keyboard = null;
      drag = null;
      for (const node of nodes) {
        node.x = node.oldX = node.u - .5;
        node.y = node.oldY = node.v;
        node.z = node.oldZ = 0;
      }
      settle();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}
