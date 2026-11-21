// The live viewer, thumbnails, storyboards, and recording share this scene.
const greenhouseScene = (() => {
  const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = vector => { const length = Math.hypot(...vector); return vector.map(value => value / length); };
  const near = .2;

  function face(mesh, points, fill, stroke, width = 1) {
    mesh.push({ points, fill, stroke, width });
  }

  function box(mesh, origin, size, colors, transform = point => point) {
    const [x, y, z] = origin;
    const [w, h, d] = size;
    const a = [x, y, z], b = [x + w, y, z], c = [x + w, y, z + d], e = [x, y, z + d];
    const top = point => [point[0], y + h, point[2]];
    const sides = [[a, b, top(b), top(a)], [b, c, top(c), top(b)], [c, e, top(e), top(c)], [e, a, top(a), top(e)], [top(a), top(b), top(c), top(e)]];
    sides.forEach((side, index) => face(mesh, side.map(transform), colors[index] ?? colors[0]));
  }

  function greenhouse() {
    const ground = [];
    const objects = [];
    for (let x = -24; x < 24; x += 4) {
      for (let z = -20; z < 20; z += 4) {
        face(ground, [[x, 0, z], [x + 4, 0, z], [x + 4, 0, z + 4], [x, 0, z + 4]],
          (x + z) % 8 === 0 ? '#40534e' : '#485b53', '#52665b');
      }
    }
    face(ground, [[-9,.015,6.25],[9,.015,-3.75],[9,.015,-6.15],[-9,.015,3.85]], '#838f7d');
    for (const side of [0, 1]) {
      face(ground, [[-9,.02,3.95 + side * 2.2],[9,.02,-6.05 + side * 2.2]], null, '#a8b5a0', 2);
    }
    for (let x = -8; x < 9; x += 1.55) {
      const z = .055 - x * .555;
      face(ground, [[x,.025,z],[x + .55,.025,z - .30]], null, '#d1cfaa', 2);
    }
    const bedColors = ['#55674e','#3d5141','#35483b','#627656','#686752'];
    const leaves = ['#7da95f', '#4c794d', '#9dbc73', '#648a54', '#729465'];
    for (const z of [-7.05, -5.55, 6.35]) {
      for (let index = 0; index < 8; index++) {
        const x = -8.65 + index * 2.25;
        box(objects, [x, .04, z], [1.86, .31, .85], bedColors);
        for (let plant = 0; plant < 4; plant++) {
          const px = x + .26 + plant * .42;
          const pz = z + .4 + (plant % 2 ? .1 : -.08);
          const y = .74 + ((index * 3 + plant) % 5) * .045;
          face(objects, [[px,.34,pz],[px,y,pz]], null, '#577d4d', 1.8);
          for (let leaf = 0; leaf < 4; leaf++) {
            const angle = leaf * Math.PI / 2 + plant * .68;
            const dx = Math.cos(angle) * .30;
            const dz = Math.sin(angle) * .30;
            face(objects, [[px,y - .18,pz],[px + dx * .6 - dz * .4,y - .01,pz + dz * .6 + dx * .4],
              [px + dx,y + .09,pz + dz],[px + dx * .6 + dz * .32,y - .10,pz + dz * .6 - dx * .32]], leaves[(leaf + plant + index) % leaves.length]);
          }
        }
      }
    }
    const roof = [[-8.8, 0],[-8.8, 3.0],[-6.7, 4.45],[-3.7, 5.35],[0, 5.7],[3.7, 5.35],[6.7, 4.45],[8.8, 3.0],[8.8, 0]];
    const frameXs = [-10, -6, -2, 2, 6, 10];
    for (const x of frameXs) {
      for (let segment = 0; segment < roof.length - 1; segment++) {
        const [z, y] = roof[segment];
        const [nextZ, nextY] = roof[segment + 1];
        face(objects, [[x, y, z], [x, nextY, nextZ]], null, '#9aa99a', 1.6);
      }
    }
    for (const [z, y] of roof.slice(1, -1)) {
      face(objects, [[-10, y, z], [10, y, z]], null, '#718c83', 1.1);
    }
    const pole = ['#627a68', '#536b60', '#7d9279', '#4c6457', '#879e85'];
    box(objects, [1.6, 0, -1.5], [.1, 1.26, .1], pole);
    box(objects, [1.42, 1.08, -1.46], [.46, .27, .07], ['#e6d29d', '#a48d62', '#bba66f']);
    return { ground, objects };
  }

  function rover(subject) {
    const mesh = [];
    const [x, , z] = subject;
    const along = .873;
    const across = .487;
    const position = ([localX, y, localZ]) => [x + localX * along + localZ * across, y, z - localX * across + localZ * along];
    const shadow = Array.from({ length: 20 }, (_, index) => {
      const angle = index * Math.PI / 10;
      return position([Math.cos(angle) * 1.13, .03, Math.sin(angle) * .7]);
    });
    const tire = ['#222f32', '#344147', '#1c272b'];
    for (const axle of [-.57, .59]) {
      for (const edge of [-.51, .51]) {
        const ring = offset => Array.from({ length: 12 }, (_, index) => {
          const angle = index * Math.PI / 6;
          return position([axle + Math.cos(angle) * .255, .255 + Math.sin(angle) * .255, edge + offset]);
        });
        const outer = ring(edge < 0 ? -.13 : .13);
        const inner = ring(0);
        for (let index = 0; index < 12; index++) {
          const next = (index + 1) % 12;
          face(mesh, [inner[index], outer[index], outer[next], inner[next]], tire[index % 3]);
        }
        face(mesh, outer, '#27363c', '#546267');
        const center = position([axle, .255, edge + (edge < 0 ? -.14 : .14)]);
        face(mesh, outer.map(point => point.map((coordinate, axis) => center[axis] + (coordinate - center[axis]) * .47)), '#9aa8a4');
      }
    }
    box(mesh, [-.86,.23,-.49], [1.72,.15,.98], ['#324041','#26343a','#28363a','#3a4b4c','#46565a'], position);
    box(mesh, [-.77,.37,-.45], [1.54,.29,.9], ['#c56938','#ed9955','#bc5d35','#e58545','#f0a759'], position);
    box(mesh, [-.54,.65,-.31], [1.08,.07,.62], ['#f0b471','#e7a45c','#f7ca82'], position);
    box(mesh, [-.41,.73,-.23], [.62,.06,.46], ['#33474b','#293e45','#25383f','#344b52','#3e5960'], position);
    for (const offset of [-.30, .30]) {
      box(mesh, [.771,.48,offset - .076], [.018,.083,.152], ['#fff0bf'], position);
    }
    box(mesh, [.28,.67,-.037], [.08,.44,.074], ['#435557','#324149','#63736e'], position);
    box(mesh, [.21,1.06,-.105], [.24,.14,.21], ['#3d4c4e','#68777a','#344148','#4e6365','#788885'], position);
    box(mesh, [.454,1.094,-.056], [.015,.071,.112], ['#a8e1df','#173739','#5fa6a4'], position);
    box(mesh, [-.63,.66,-.34], [.1,.09,.1], ['#f3d278'], position);
    return { mesh, shadow };
  }

  const model = greenhouse();

  function paint(context, camera, width, height) {
    const forward = unit(subtract(camera.target, camera.eye));
    const right = unit(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const focus = Math.min(height, width * 1.15) / 2 / Math.tan(camera.fov * Math.PI / 360);
    const scale = Math.min(width, height) / 540;
    const transform = point => {
      const delta = subtract(point, camera.eye);
      return [dot(delta, right), dot(delta, up), dot(delta, forward)];
    };
    const project = ([x, y, depth]) => [width / 2 + x * focus / depth, height * .51 - y * focus / depth];

    function clip(points, closed) {
      const result = [];
      let previous = closed ? points.at(-1) : points[0];
      for (const point of points) {
        if ((point[2] >= near) !== (previous[2] >= near)) {
          const t = (near - previous[2]) / (point[2] - previous[2]);
          result.push([previous[0] + (point[0] - previous[0]) * t, previous[1] + (point[1] - previous[1]) * t, near]);
        }
        if (point[2] >= near) result.push(point);
        previous = point;
      }
      return result;
    }

    function draw(group, sort = true) {
      const surfaces = group.map(surface => {
        const points = surface.points.map(transform);
        const depth = points.reduce((sum, point) => sum + point[2], 0) / points.length;
        return { ...surface, points, depth };
      });
      if (sort) surfaces.sort((a, b) => b.depth - a.depth);
      for (const surface of surfaces) {
        const points = clip(surface.points, Boolean(surface.fill)).map(project);
        if (points.length < 2) continue;
        context.beginPath();
        context.moveTo(...points[0]);
        for (let index = 1; index < points.length; index++) context.lineTo(...points[index]);
        if (surface.fill) {
          context.closePath();
          context.fillStyle = surface.fill;
          context.fill();
        }
        if (surface.stroke) {
          context.lineWidth = Math.max(.55, surface.width * scale);
          context.strokeStyle = surface.stroke;
          context.stroke();
        }
      }
    }

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#263e43');
    sky.addColorStop(.62, '#91a095');
    sky.addColorStop(1, '#5e7768');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);
    draw(model.ground, false);
    const car = rover(camera.subject);
    draw([{ points: car.shadow, fill: '#1827278c' }], false);
    draw([...model.objects, ...car.mesh]);

    const light = context.createRadialGradient(width * .24, height * .18, 0, width * .24, height * .18, width * .78);
    light.addColorStop(0, '#fff0b43c');
    light.addColorStop(.57, '#e8d59b08');
    light.addColorStop(1, '#0b191b42');
    context.fillStyle = light;
    context.fillRect(0, 0, width, height);
  }

  return { paint };
})();
