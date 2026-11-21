window.buildShuRoadConnectors = function buildShuRoadConnectors({
  view, world, quad, triangle, beam, rock, wood, leaf = 2, terrainSolids = []
}) {
  const eyeHeight = 1.65;
  const lerp = (a, b, t) => a.map((value, axis) => value + (b[axis] - value) * t);
  const offset = ([x, y, z], dx, dy, dz) => [x + dx, y + dy, z + dz];
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const horizontalDistance = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
  const foot = ({eye}) => offset(eye, 0, -eyeHeight, 0);

  const waypoints = [
    // Leave the opening shelf through the notch between the two foreground spurs.
    [[-31,2.3,33],[-32,2.4,28],[-40,2.5,29],[-46,2.6,30],[-53,1.4,31],
      [-63,-1.2,38],[-68,-2.8,48],[-77,-4.5,67],[-92,-5,80],[-96,-5.2,82]],
    // Follow a low rocky divide and cross the open river bend on a short trestle.
    [[-104,-3.8,79],[-100,-1.0,76],[-91,-.7,77],[-88,-.7,89],[-90,-1.4,98],
      [-82,-5,100],[-63,-4.7,97],[-41,-4.2,92],[-23,-4.5,85],
      [-4,-4.9,83],[18,-4.3,88],[39,-4.3,96],[56,.2,115],[67,4,115],
      [78,2.8,115],[98,-1.3,116],[113,-3.9,114],[119,-5.05,111.6]],
    // Gain the height of the first boardwalk before joining its actual planks.
    [[113,-4.2,100],[92,-1,90],[76,1,89],[67,1.9,90],[61,3.1,81],[57,4,68],
      [37,8,68],[20,12,59],[6,17,48],[-1,19,35],[-7,21.5,21],[-14.2,24.1,15.1],
      [-14.4,25.05,12.5]],
    // Leave the deck at its open end, then descend along the outside of the rock.
    [[-3.8,26.8,12.2],[-2,25.5,19],[-8,23.6,25],[-19,21,28],[-32,17,30],
      [-46,12,30],[-60,7,27],[-71,2.6,22],[-75,-1.0,15]],
    // The climbing shoulder turns twice before reaching the high waterfall lookout.
    [[-77,-.75,4.6],[-70,.85,4.6],[-64,3.1,6],[-57,6.3,8],[-48,10.4,0],[-42,14.8,-11],[-34,18,-5],
      [-33,22.2,9],[-29,26,20],[-22,29.5,28],[-8,34,25],[-6.4,38.5,16],
      [-9.8,40.75,11],[-11.8,41.25,8.7]],
    // Descend outside the river crags, then follow the low ground into Sword Gate.
    [[-7.55,41.6918,7.53],[-5.8,41.4,9.25],[-2,40.4,11],[6,38,13],[17,34,20],[29,29,32],[43,24,34],[58,19,30],
      [73,13,21],[75,10,5],[76,7,-11],[85,4,-23],[98,.5,-34],
      [112,-3.4,-49],[123,-4.7,-60]],
    [[130,-4.9,-75],[133,-4.55,-65],[138,-4.3,-56],[145,-3.87,-50],[153,-4.05,-47]],
    // Skirt the city wall on the fields side, then turn onto the existing approach.
    [[168,-4.3,-43],[185,-4.25,-24],[201,-4.15,-1],[222,-4.1,25],[237,-4.05,54],
      [242,-4.03,84],[240,-4.0,107],[231,-4,120],[215,-4.04,126],[205,-4.06,126]]
  ];

  function rounded(points) {
    const nodes = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const previous = points[i - 1];
      const point = points[i];
      const next = points[i + 1];
      const lengthBefore = horizontalDistance(previous, point);
      const lengthAfter = horizontalDistance(point, next);
      const radius = Math.min(1.35, lengthBefore * .22, lengthAfter * .22);
      const entry = lerp(point, previous, radius / lengthBefore);
      const exit = lerp(point, next, radius / lengthAfter);
      for (let j = 0; j <= 5; j++) {
        const t = j / 5;
        nodes.push(lerp(lerp(entry, point, t), lerp(point, exit, t), t));
      }
    }
    nodes.push(points[points.length - 1]);
    return nodes;
  }

  function sampleRoute(nodes) {
    const samples = [{point:nodes[0], distance:0}];
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1];
      const b = nodes[i];
      const length = distance(a, b);
      const count = Math.ceil(length / 1.6);
      const base = samples[samples.length - 1].distance;
      for (let j = 1; j <= count; j++) {
        const t = j / count;
        samples.push({point:lerp(a, b, t), distance:base + length * t});
      }
    }
    return samples;
  }

  const sections = waypoints.map((points, index) =>
    sampleRoute(rounded([foot(view(index, 1)), ...points, foot(view(index + 1, 0))])));

  // Stone paths rest on a shaped ridge. Timber spans sit above the river or an intersecting trail.
  function riverSpan(index, [x, , z]) {
    return (index === 1 && x > 91 && x < 119)
      || (index === 2 && x > 99 && x < 119)
      || (index === 5 && x > 100 && x < 107 && z > -42)
      || (index === 7 && x > 237 && z > 78 && z < 111);
  }

  function rowsFor(index, samples) {
    const length = samples[samples.length - 1].distance;
    return samples.map(({point, distance:along}, i) => {
      const [x, y, z] = point;
      const before = samples[Math.max(0, i - 1)].point;
      const after = samples[Math.min(samples.length - 1, i + 1)].point;
      const span = horizontalDistance(before, after);
      const dx = (after[2] - before[2]) / span;
      const dz = (before[0] - after[0]) / span;
      const ripple = Math.sin(along * .49 + index) * .15 + Math.sin(along * .19) * .10;
      const merge = Math.min(1, along / 4, (length - along) / 4);
      const width = .72 + (.65 + ripple) * merge;
      const at = (side, depth = 0) => [x + dx * side, y + depth, z + dz * side];
      const river = riverSpan(index, point);
      const lowerTrail = [];
      for (const [otherIndex, other] of sections.entries()) {
        if (otherIndex===index) continue;
        for (const {point:lower} of other) {
          if (lower[1]+2.1<y && horizontalDistance(point,lower)<10) lowerTrail.push(lower);
        }
      }
      const overpass = lowerTrail.some(lower=>lower[1]+3.6<y && horizontalDistance(point,lower)<6.1);
      const inCliff = p => terrainSolids.some(contains => contains(p, -.16));
      let anchor = null;
      if (y > 5) {
        for (const sign of [-1, 1]) {
          for (let reach = width; reach <= width + 2.9; reach += .35) {
            const upper = at(sign * reach, -.22);
            const lower = at(sign * reach, -1.75);
            if (!inCliff(upper) || !inCliff(lower)) continue;
            if (!anchor || reach < anchor.reach) anchor = { side: sign, reach, upper, lower };
            break;
          }
        }
      }
      // A rock shoulder can run beside the lower path and carry the outer plank ends.
      // Leave an open span where the lower path crosses the shoulder itself.
      let shelf = null;
      if (overpass && !anchor && y>5) {
        const preferred = index===4 ? -1 : 1;
        for (const side of [preferred,-preferred]) {
          const clear = [2.05,2.75,3.45,4.15].every(reach=>
            lowerTrail.every(lower=>horizontalDistance(at(side*reach),lower)>1.85));
          if (!clear) continue;
          shelf = {side, upper:at(side*2.78,-.64), lower:at(side*2.58,-1.9),
            rock:[
              at(side*2.05,-12.25-y),at(side*2.15,-2.3),at(side*2.58,-.47),
              at(side*3.47,-.72),at(side*3.92,-4.7),at(side*4.15,-12.25-y)
            ]};
          break;
        }
      }
      // When the trail leaves the cliff, continue on a rocky shoulder. Keep timber for
      // brackets socketed into rock and for the short openings that actually need bridges.
      const timber = Boolean(anchor) || river || overpass;
      const edges = [-width, width].map(side => {
        const sign = Math.sign(side);
        const shoulder = side + sign * (1.6 + Math.sin(along * .16 + sign) * .36) * merge;
        const base = shoulder + sign * (1.35 + Math.sin(along * .31 + index) * .44) * merge;
        return {
          surface:at(side, -.025 * merge),
          eave:at(side, -.26),
          shoulder:at(shoulder, -1.03 * merge),
          slope:at(base, -Math.min(6, Math.max(1.4, (y + 11.5) * .34)) * merge),
          base:at(base + sign * 1.2 * merge, Math.min(-12 - y, -1.4) * merge),
          rail:at(side * .94, .81),
          post:at(side * .94, 0),
          brace:at(side * .79, -.25),
          tie:at(side * .76, -.43)
        };
      });
      return {point, along, edges, timber, anchor, shelf, river, overpass, lowerTrail};
    });
  }

  function riverPier([x, y, z]) {
    const ring = (height, width) => [
      [x-width,height,z-width*.73], [x+width,height,z-width*.73],
      [x+width,height,z+width*.73], [x-width,height,z+width*.73]
    ];
    const top = ring(y-1.45,.68);
    const base = ring(-12.2,1.32);
    for (let i=0; i<4; i++) quad(world,base[i],base[(i+1)%4],top[(i+1)%4],top[i],rock);
    quad(world,top[0],top[1],top[2],top[3],rock);
    beam(world,[x,y-1.47,z],[x,y-.21,z],.22,.18,wood,5);
  }

  function clearBrace(a,b,lowerTrail) {
    for (let i=0; i<=12; i++) {
      const sample=lerp(a,b,i/12);
      if (lowerTrail.some(lower=>sample[1]-lower[1]<2.4 && horizontalDistance(sample,lower)<1.1)) return false;
    }
    return true;
  }

  function capShelf(profile,reverse) {
    for (let i=1; i<profile.length-1; i++) {
      triangle(world,profile[0],profile[reverse?i+1:i],profile[reverse?i:i+1],rock);
    }
  }

  const drawRanges = [];
  for (const [index, samples] of sections.entries()) {
    const start = world.length / 9;
    const rows = rowsFor(index, samples);
    let nextPost = 1.9;
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1];
      const b = rows[i];
      const shelf = a.shelf && b.shelf && a.shelf.side===b.shelf.side ? a.shelf : null;
      if (shelf) {
        const nextRock = b.shelf.rock;
        for (let face=0; face<shelf.rock.length-1; face++) {
          quad(world,shelf.rock[face],shelf.rock[face+1],nextRock[face+1],nextRock[face],rock);
        }
        if (rows[i-2]?.shelf?.side!==shelf.side) capShelf(shelf.rock,true);
        if (rows[i+1]?.shelf?.side!==shelf.side) capShelf(nextRock,false);
      }
      const anchor = a.anchor || shelf;
      const timber = a.timber || b.timber;
      const material = timber ? wood : rock;
      quad(world,a.edges[0].surface,a.point,b.point,b.edges[0].surface,material);
      quad(world,a.point,a.edges[1].surface,b.edges[1].surface,b.point,material);
      const postHere = a.along >= nextPost;
      for (let side = 0; side < 2; side++) {
        const p = a.edges[side];
        const q = b.edges[side];
        if (timber) {
          quad(world,p.surface,q.surface,q.eave,p.eave,wood);
          beam(world,p.tie,q.tie,.11,.11,wood,4);
          const innerCliff = anchor?.side === (side===0?-1:1);
          if (!innerCliff && a.timber && b.timber && a.along > .9 && b.along < rows.at(-1).along - (index === 4 ? 2.8 : .7)) {
            beam(world,p.rail,q.rail,.042,.042,wood,4);
            if (postHere) beam(world,p.post,p.rail,.072,.059,wood);
            if (!anchor && a.overpass && b.overpass && !a.river) {
              beam(world,i%2?p.tie:p.rail,i%2?q.rail:q.tie,.056,.056,wood,4);
            }
          }
        } else {
          quad(world,p.surface,p.shoulder,q.shoulder,q.surface,a.point[1]>5?rock:leaf);
          quad(world,p.shoulder,p.slope,q.slope,q.shoulder,rock);
          quad(world,p.slope,p.base,q.base,q.slope,rock);
        }
      }
      if (postHere) {
        if (a.timber && b.timber) {
          if (anchor) {
            const outer=a.edges[anchor.side===1?0:1];
            beam(world,anchor.upper,outer.tie,.13,.11,wood,5);
            if (clearBrace(anchor.lower,outer.brace,a.lowerTrail)) {
              beam(world,anchor.lower,outer.brace,.15,.095,wood,5);
            }
          } else {
            beam(world,a.edges[0].tie,a.edges[1].tie,.12,.12,wood,5);
            if (a.river && !a.overpass) riverPier(a.point);
          }
        }
        nextPost = a.along + (timber ? 2.5 : 4.5);
      }
    }
    drawRanges.push({start, count:world.length / 9 - start});
  }

  const connectors = sections.map((samples, index) => position => {
    if (position <= 0) return view(index, 1).eye;
    const last = samples.length - 1;
    if (position >= 1) return view(index + 1, 0).eye;
    const target = samples[last].distance * position;
    let lo = 0;
    let hi = last;
    while (hi - lo > 1) {
      const middle = (lo + hi) >> 1;
      if (samples[middle].distance <= target) lo = middle;
      else hi = middle;
    }
    const a = samples[lo];
    const b = samples[hi];
    return offset(lerp(a.point, b.point, (target - a.distance) / (b.distance - a.distance)), 0, eyeHeight, 0);
  });
  connectors.drawRanges = drawRanges;
  return connectors;
};
