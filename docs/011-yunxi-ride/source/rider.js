"use strict";

function buildImmortalRider(api) {
  const { material, shape, transform, add, sub, scale, norm, dot, length, multiply, clamp,
    torus, mesh, object, oval, rod, capsule, ring, sweep, roundedPath, capture, drawBatch } = api;
  const TAU = Math.PI * 2;
  const paint = material("399e83", .46), pale = material("edc77a", .30), pine = material("195751", .29);
  const steel = material("d8ad6a", .43), rim = material("b78553", .37), rubber = material("1a272b", .08);
  const sidewall = material("896742", .17), dark = material("203234", .19), pad = material("723b2e", .12);
  const white = material("fff2dd", .10), soft = material("eadac1", .09), paleFeather = material("d9cbba", .06);
  const flight = material("263f46", .13), flightLight = material("435a5f", .09);
  const gold = material("ffc776", .19), amber = material("d98445", .17), mouth = material("7e4738", .08);
  const pouch = material("efad6b", .13), legs = material("c98254", .11), webbed = material("e2a064", .16);
  const iris = material("f6bd73", .27), pupil = material("182328", .32), shine = material("ffffff", .18);
  const cinnabar = material("b72d3b", .20), silkLight = material("df624e", .17);
  const jade = material("65dbaf", .34, .18), deepJade = material("248e72", .33);
  const gilding = material("ffe09a", .28, .25);
  const rear = [-1.48,.805,0], front = [1.49,.805,0], crank = [-.29,.86,0];
  const wheelRadius = .805;
  const seatTop = [-.65,1.69,0], headTop = [.79,1.72,0], headBottom = [.87,1.48,0];
  const tire = torus(.744,.061), wall = torus(.731,.025), wheelRim = torus(.703,.025);
  const rimBead = torus(.717,.009), chainwheel = torus(.221,.022,54), cassette = torus(.104,.018,42);
  const chainPin = torus(.224,.006,56);
  // Each mesh keeps the axle and the lowest contact point fixed. The rubber spreads at the tread.
  const tireFlex = Array.from({length: 9}, (_, index) => {
    if (!index) return tire;
    const vertices = new Float32Array(tire.vertices), load = index / 8;
    for (let i = 0; i < vertices.length; i += 6) {
      const influence = clamp(1 - (vertices[i+1]+wheelRadius)/.20,0,1)**2 * load;
      const y = vertices[i+1] - influence*.065;
      vertices[i] *= 1 + influence*.095;
      vertices[i+1] = Math.max(-wheelRadius,y);
      vertices[i+2] *= 1 + influence*.30;
      if (y <= -wheelRadius) {
        const [nx,ny,nz] = norm([vertices[i+3]*.30,vertices[i+4]-.7,vertices[i+5]*.55]);
        vertices.set([nx,ny,nz],i+3);
      }
    }
    return mesh(vertices,tire.indices);
  });
  const bike = capture(() => {
    for (const center of [rear, front]) {
      for (const side of [-1,1]) {
        ring(wall, add(center,[0,0,side*.042]), sidewall);
        ring(rimBead, add(center,[0,0,side*.035]), steel);
      }
      ring(wheelRim, center, rim);
      rod(add(center,[0,0,-.116]), add(center,[0,0,.116]), .063, dark);
      rod(add(center,[0,0,-.135]), add(center,[0,0,.135]), .036, steel);
    }
    rod(seatTop, headTop, .066, paint);
    rod(headBottom, crank, .075, paint);
    rod(seatTop, crank, .068, paint);
    rod(headTop, headBottom, .086, pine);
    oval(crank, [.087,.088,.127], pine);
    for (const side of [-1,1]) {
      const dropout = add(rear, [0,0,.106*side]);
      rod(dropout, add(seatTop,[0,0,.033*side]), .034, paint);
      rod(dropout, add(crank,[0,0,.086*side]), .040, pine);
      roundedPath([add(headBottom,[0,0,.088*side]), [1.04,1.30,.103*side], [1.27,1.02,.119*side], add(front,[0,0,.131*side])], .040, paint);
      oval(dropout, [.046,.046,.025], steel);
      oval(add(front,[0,0,.146*side]), [.047,.047,.025], steel);
    }
    for (const side of [-1, 1]) {
      const z = side * .067;
      rod([-.49,1.699,z], [.60,1.722,z], .010, steel);
      for (let i = 0; i < 3; i++) {
        const x = .10 + .066 * i, y = 1.068 + .036 * i;
        rod([x-.021,y-.033,z], [x+.022,y+.036,z], .012, gilding);
      }
      oval([.833,1.623,side*.076], [.043,.061,.026], gilding, -.32);
      oval([.839,1.622,side*.096], [.025,.039,.015], jade, -.32);
      rod([1.190,1.110,side*.126], [1.233,1.057,side*.130], .039, steel);
    }
    rod(seatTop, [-.73,1.90,0], .044, steel);
    oval([-.73,1.913,0], [.256,.056,.149], pad, -.05);
    oval([-.54,1.909,0], [.134,.048,.076], pad, -.05);

    rod(headTop, [.73,1.94,0], .039, steel);
    rod([.73,1.94,0], [.91,1.982,0], .038, pine);
    for (const side of [-1,1]) {
      const z = v => v*side;
      roundedPath([[.91,1.982,0],[.91,1.982,z(.23)],[.95,2.005,z(.348)],[1.045,1.975,z(.382)],
        [1.081,1.876,z(.389)],[1.042,1.799,z(.396)],[.945,1.793,z(.397)]], .027, steel);
      roundedPath([[.915,1.99,z(.270)],[.954,2.01,z(.350)],[1.026,1.988,z(.380)]], .041, dark);
      rod([1.025,1.978,z(.39)], [1.083,1.885,z(.417)], .016, dark);
    }
    roundedPath([[1.001,1.953,.365],[1.066,1.84,.26],[1.01,1.68,.198],[.93,1.54,.108]], .010, dark);
    ring(chainwheel, add(crank,[0,0,.156]), dark);
    ring(chainPin, add(crank,[0,0,.174]), steel);
    ring(cassette, add(rear,[0,0,.158]), steel);
    rod([rear[0]-.013,rear[1]+.105,.157], [crank[0]-.019,crank[1]+.223,.157], .018, dark);
    rod([rear[0]+.006,rear[1]-.104,.157], [crank[0]+.014,crank[1]-.221,.157], .018, dark);
  });

  const circlet = torus(.174, .019, 42);
  const neckband = torus(.169, .054, 42);
  const neckTrim = torus(.177, .010, 42);
  const torso = capture(() => {
    oval([-.695,2.225,0], [.719,.413,.365], white, .09);
    oval([-.33,2.284,0], [.445,.395,.326], white, .35);
  });
  const neckSections = [[-.49,2.26,0,.19,.21],[-.20,2.47,0,.275,.234],[-.075,2.68,0,.211,.178],
    [-.14,2.91,0,.153,.145],[-.115,3.12,0,.147,.129],[.045,3.30,0,.162,.139],[.275,3.37,0,.14,.132]];
  const neck = capture(() => sweep(neckSections, white));
  const collar = capture(() => {
    object(neckband, transform([-.115,2.815,0], [1,0,0], [0,0,1.03], [0,-1.13,0]), cinnabar);
    object(neckTrim, transform([-.119,2.860,0], [1,0,0], [0,0,1.03], [0,-1,0]), silkLight);
    object(neckTrim, transform([-.113,2.771,0], [1,0,0], [0,0,1.03], [0,-1,0]), silkLight);
    oval([-.25,2.817,.158], [.106,.077,.059], cinnabar, -.25);
    oval([-.238,2.811,.200], [.060,.068,.030], gilding);
    oval([-.238,2.812,.223], [.036,.044,.015], deepJade);
    oval([-.229,2.827,.237], [.012,.018,.008], jade);
  });
  const head = capture(() => {
    oval([.265,3.378,0], [.295,.223,.195], white, .10);
    oval([.446,3.352,0], [.169,.138,.146], soft, -.12);
    sweep([[.431,3.367,0,.019,.133],[.651,3.359,0,.016,.164],[.928,3.342,0,.014,.144],
      [1.235,3.327,0,.011,.109],[1.501,3.316,0,.009,.048],[1.565,3.312,0,.003,.006]], mouth);
    sweep([[.401,3.403,0,.035,.106],[.536,3.421,0,.069,.165],[.750,3.417,0,.058,.157],
      [1.025,3.396,0,.046,.135],[1.316,3.367,0,.035,.090],[1.536,3.341,0,.028,.037],
      [1.586,3.309,0,.008,.010]], gold);
    oval([1.554,3.329,0], [.071,.029,.036], amber, -.57);
    for (const side of [-1,1]) {
      oval([.365,3.455,.168*side], [.096,.069,.037], soft, -.13);
      oval([.562,3.411,.163*side], [.026,.009,.007], amber, -.09);
    }
    object(circlet, transform([.198,3.498,0], [1.28,.19,0], [0,0,1], [.15,-1,0]), steel);
    rod([.073,3.615,-.135], [.337,3.552,.151], .012, gilding);
    oval([.351,3.551,.163], [.043,.025,.022], gilding, -.27);
    oval([.353,3.556,.182], [.025,.017,.013], jade, -.27);
  });
  const jaw = capture(() => {
    sweep([[.40,3.300,0,.048,.125],[.56,3.246,0,.139,.167],[.78,3.207,0,.176,.158],
      [1.019,3.231,0,.131,.123],[1.269,3.291,0,.065,.080],[1.513,3.321,0,.015,.022],
      [1.568,3.316,0,.004,.003]], pouch);
    sweep([[.436,3.352,0,.013,.115],[.645,3.346,0,.013,.153],[.929,3.329,0,.012,.139],
      [1.235,3.316,0,.009,.101],[1.505,3.306,0,.006,.042],[1.562,3.305,0,.002,.005]], amber);
    sweep([[.48,3.354,0,.008,.101],[.69,3.351,0,.007,.129],[1.01,3.332,0,.006,.107],
      [1.33,3.314,0,.004,.063],[1.52,3.307,0,.002,.017]], mouth);
  });
  const eyes = capture(() => {
    for (const side of [-1,1]) {
      oval([.377,3.457,.197*side], [.053,.048,.017], iris, -.10);
      oval([.391,3.458,.209*side], [.034,.036,.011], pupil, -.10);
      oval([.402,3.473,.216*side], [.010,.010,.006], shine);
    }
  });
  const tail = capture(() => {
    for (const side of [-1,1]) {
      for (let i = 0; i < 4; i++) {
        const y = 2.09 + i*.062;
        capsule([-1.53+i*.039,y-.115,(.12+i*.048)*side],
          [-.84,y+.128,(.235+i*.029)*side],.064,.041,i%2?flightLight:flight);
      }
    }
  });
  const wingCover = [-1,1].map(side => capture(() => {
    const z = v => v * side;
    oval([-.801,2.251,z(.225)], [.551,.244,.174], paleFeather, .09);
    for (let i = 0; i < 5; i++) {
      capsule([-1.215+i*.046,2.128+i*.050,z(.325+i*.006)], [-.692+i*.038,2.251+i*.053,z(.372-i*.008)],
        .061,.054,i%2 ? soft : white);
    }
    oval([-.534,2.337,z(.285)], [.345,.162,.125], white, .12);
  }));

  // A webbed foot has a continuous surface between the three outer toes.
  const foot = (() => {
    const outline = [[-.13,.006],[-.08,-.06],[.066,-.112],[.169,-.108],[.144,-.062],
      [.231,-.010],[.158,.021],[.186,.081],[.091,.101],[-.078,.062]];
    const vertices = [], indices = [];
    for (const side of [1,-1]) {
      const start = vertices.length/6;
      vertices.push(.038, .041*side, 0, 0,side,0);
      outline.forEach(([x,z]) => vertices.push(x,.009*side,z, x*.65, side, z*2.4));
      for (let i=0; i<outline.length; i++) indices.push(start,start+i+1,start+(i+1)%outline.length+1);
    }
    return mesh(vertices, indices);
  })();

  const spokes = capture(() => {
    for (let i=0; i<24; i++) {
      const a = i * TAU/24, b = a + (i%4 < 2 ? .76 : -.76);
      rod([.042*Math.cos(b),.042*Math.sin(b),.081*(i%2 ? 1:-1)], [.69*Math.cos(a),.69*Math.sin(a),0], .007, steel);
    }
    rod([0,.661,0],[0,.711,0],.014,dark);
    for (const side of [-1,1]) {
      const z=.067*side;
      rod([-.115,.722,z],[-.071,.731,z],.014,amber);
      rod([-.071,.731,z],[-.023,.736,z],.014,amber);
      rod([.011,.736,z],[.057,.731,z],.011,pale);
    }
  });

  const crankParts = capture(() => {
    for (const side of [-1,1]) {
      const x = .219*side, z = .170*side;
      rod([0,0,z],[x,0,z],.034,steel);
      oval([0,0,z],[.069,.069,.022],pine);
      for (let i=0; i<5; i++) {
        const a = i*TAU/5;
        if (side === 1) rod([0,0,z], [.216*Math.cos(a),.216*Math.sin(a),z], .026, dark);
      }
    }
  });

  const scriptRing = torus(.818, .009, 56);
  const innerRing = torus(.650, .007, 48);
  const diamond = mesh([
    0,.04,0, 0,.2,1, .025,0,0, .2,0,1, 0,-.04,0, 0,-.2,1, -.025,0,0, -.2,0,1, 0,0,.010, 0,0,1,
    0,.04,0, 0,.2,-1, .025,0,0, .2,0,-1, 0,-.04,0, 0,-.2,-1, -.025,0,0, -.2,0,-1, 0,0,-.010, 0,0,-1
  ], [0,4,1,1,4,2,2,4,3,3,4,0,5,6,9,6,7,9,7,8,9,8,5,9]);
  const seal = capture(() => {
    for (const side of [-1, 1]) {
      const z = .077 * side;
      for (let i = 0; i < 8; i++) {
        const angle = i * TAU / 8;
        const center = [.847*Math.cos(angle), .847*Math.sin(angle), z];
        object(diamond, shape(center, [1,1,1], angle - Math.PI/2), gilding);
      }
    }
  });

  // One cycle of fluttering silk. The poses are immutable GPU meshes.
  const scarfAnchor = -.265;
  const scarf = Array.from({length: 64}, (_, pose) => capture(() => {
    for (const tail of [0, 1]) {
      const points = [];
      for (let index = 0; index <= 16; index++) {
        const u = index / 16;
        const flutter = pose / 64 * TAU - u * 8.5 + tail * 2.1;
        points.push([
          scarfAnchor - u * (1.54 - tail*.30),
          2.823 + u * (.17 - tail*.36) + u * Math.sin(flutter) * .18,
          .159 + u * (.22 - tail*.34) + u * Math.cos(flutter) * .104
        ]);
      }
      const vertices = [], indices = [];
      for (let index = 0; index < points.length; index++) {
        const u = index / 16;
        const width = (.093 - tail*.019) * (1-u*.71) * (index === 16 ? .16 : 1);
        const [tx,ty,tz] = sub(points[Math.min(index+1,16)], points[Math.max(index-1,0)]);
        const normal = norm([tz - .22*ty, .22*tx, -tx]);
        for (const side of [-1,1]) {
          vertices.push(...add(points[index], [0,width*side,width*.22*side]), ...normal);
        }
        if (index < 16) {
          const start = index * 2;
          indices.push(start, start+1, start+2, start+1, start+3, start+2);
        }
      }
      object(mesh(vertices, indices), shape([0,0,0], [1,1,1]), tail ? silkLight : cinnabar);
    }
  }));

  const postures = {
    idle:   {shift:-.07, settle: .01, lean: .10, reach: .07, spread:.12, wind:.05},
    pedal:  {shift: .10, settle:-.04, lean:-.09, reach:-.09, spread:.22, wind:.56},
    coast:  {shift: .02, settle: .01, lean: .02, reach: .02, spread:.16, wind:.40},
    flight: {shift: .17, settle:-.06, lean:-.13, reach:-.15, spread:1.00, wind:1.00},
    land:   {shift:-.12, settle:-.09, lean: .12, reach: .12, spread:.66, wind:.42},
    bump:   {shift:-.13, settle:-.06, lean: .16, reach: .17, spread:.86, wind:.28},
    fish:   {shift: .00, settle: .00, lean:-.02, reach: .00, spread:.13, wind:.04},
    herb:   {shift: .00, settle: .00, lean:-.02, reach: .00, spread:.18, wind:.05},
    lantern:{shift: .00, settle: .00, lean:-.02, reach: .00, spread:.21, wind:.05}
  };
  const posture = {...postures.idle};
  const pelvis = [-.66,2.147,0], neckRoot = [-.28,2.45,0], headRoot = [.267,3.378,0];
  const eyesRoot = [.385,3.458,0], mouthRoot = [.438,3.349,0], scarfRoot = [scarfAnchor,2.823,.159];
  const collarRoot = [-.115,2.815,0], fishWater = [3.05,-.42,.63], herbTip = [2.25,.40,.63];
  const lampTouches = [.30,.47,.64];
  const lampCasings = [[2.26,1.37,1.12],[3.70,1.44,1.12],[5.14,1.49,1.12]];
  const bankX = 1.25;
  let previousTime, scarfPhase = 0;

  function point(matrix, [x,y,z]) {
    return [
      matrix[0]*x + matrix[4]*y + matrix[8]*z + matrix[12],
      matrix[1]*x + matrix[5]*y + matrix[9]*z + matrix[13],
      matrix[2]*x + matrix[6]*y + matrix[10]*z + matrix[14]
    ];
  }
  function about(pivot, matrix, shift = [0,0,0]) {
    const translate = sub(add(pivot,shift),point(matrix,pivot));
    matrix.set(translate,12);
    return matrix;
  }
  function inversePoint(matrix, p) {
    const delta = sub(p,[matrix[12],matrix[13],matrix[14]]);
    return [0,4,8].map(index=>{
      const axis = [matrix[index],matrix[index+1],matrix[index+2]];
      return dot(delta,axis)/dot(axis,axis);
    });
  }
  const mix = (a,b,t) => a.map((value,index)=>value+(b[index]-value)*t);
  function ease(min,max,value) {
    const t=clamp((value-min)/(max-min),0,1);
    return t*t*(3-2*t);
  }
  const window = (start,full,hold,end,t) => ease(start,full,t)*(1-ease(hold,end,t));
  function feedingPose(t) {
    return {
      dismount:window(.025,.28,.78,.998,t),
      forward:window(.055,.32,.81,.998,t),
      lateral:window(.020,.195,.83,.998,t),
      dip:window(.30,.51,.51,.67,t),
      lift:window(.56,.69,.72,.83,t),
      gulp:window(.666,.723,.733,.80,t),
      bite:.35*window(.33,.495,.515,.56,t)+.15*window(.66,.718,.729,.777,t)
    };
  }
  function herbPose(t) {
    return {
      dismount:window(.018,.24,.79,.998,t),
      forward:window(.038,.26,.83,.998,t),
      lateral:window(.018,.185,.86,.998,t),
      dip:window(.277,.45,.45,.58,t),
      lift:window(.49,.62,.73,.87,t),
      gulp:0,
      bite:.23*window(.31,.405,.428,.471,t)+.027*window(.42,.468,.76,.91,t),
      focus:herbTip,
      reachAngle:-.86,
      reachYaw:0
    };
  }
  function lanternPose(t, targets) {
    const casings = lampCasings.map((fallback,i)=>targets?.[i] ?? fallback);
    const stops = [bankX,...casings.map(casing=>casing[0]-1.16),bankX];
    const walks = [[.177,.244],[.333,.417],[.503,.587],[.677,.853]];
    let stride = {x:bankX,bob:0,footAt:()=>({x:bankX,lift:0})};
    for (const [i,[start,end]] of walks.entries()) {
      if (t < start) break;
      const from=stops[i],to=stops[i+1];
      const progress=ease(start,end,t), delta=to-from;
      const cycles=Math.max(1,Math.ceil(Math.abs(delta)/.65));
      const path=progress*cycles, segment=Math.min(cycles-1,Math.floor(path)), fraction=path-segment;
      stride={
        x:from+delta*progress,
        bob:.033*Math.sin(Math.PI*fraction)**2*clamp(Math.abs(delta)*2.4,0,1),
        footAt(side) {
          const swing=side<0 ? ease(.01,.47,fraction) : ease(.49,.99,fraction);
          return {
            x:from+delta*(segment+swing)/cycles,
            lift:.135*Math.sin(Math.PI*swing)*clamp(Math.abs(delta)*3.7,0,1)
          };
        }
      };
    }
    const lampIndex=t<.368?0:t<.538?1:2, touch=lampTouches[lampIndex];
    const tap=window(touch-.049,touch-.003,touch+.008,touch+.032,t);
    return {
      dismount:window(.015,.205,.862,.998,t),
      forward:window(.032,.212,.873,.998,t),
      lateral:window(.016,.158,.89,.998,t),
      dip:tap,
      lift:0,
      gulp:0,
      bite:.024+.028*tap,
      focus:casings[lampIndex],
      reachAngle:-.19,
      reachYaw:.51,
      stride
    };
  }
  function normalBill(time,strength,animation) {
    const cycle = Math.floor(time/4.18), elapsed=time-cycle*4.18;
    const wait=.82+Math.sin(cycle*1.47)*.43;
    const open = window(wait,wait+.15,wait+.28,wait+.57,elapsed);
    const smaller = cycle%3===2 ? window(2.28,2.35,2.44,2.63,elapsed)*.49 : 0;
    return .008+(open+smaller)*(.135+strength*.057+(animation==="flight"?.031:0));
  }
  function roll(angle) {
    const c=Math.cos(angle),s=Math.sin(angle);
    return transform([0,0,0],[1,0,0],[0,c,s],[0,-s,c]);
  }
  function yaw(angle) {
    const c=Math.cos(angle),s=Math.sin(angle);
    return transform([0,0,0],[c,0,s],[0,1,0],[-s,0,c]);
  }
  function blinkAt(time) {
    const cycle = Math.floor(time / 4.7), elapsed = time - cycle * 4.7;
    const pulse = center => Math.max(0,1-Math.abs(elapsed-center)/.14);
    return Math.max(pulse(1.72 + Math.sin(cycle * 1.8)*.41),cycle%3===1?pulse(2.08):0);
  }
  const zero = [0,0,0], unit = [1,1,1];

  return function drawRider(model, {
    phase, wheelPhase, time, magic, accent, animation="idle", speed=0, load=.64,
    contactRear=1, contactFront=1, impact=0, feeding=0, ritual=feeding, targets,
    cadence=0, pedalEngagement=0
  }) {
    const dt = previousTime === undefined || time < previousTime ? 1/30 : clamp(time-previousTime,0,.08);
    previousTime = time;
    const target = postures[animation] ?? postures.idle;
    const follow = 1 - Math.exp(-dt * (animation === "bump" ? 23 : 11));
    for (const key of Object.keys(posture)) posture[key] += (target[key]-posture[key]) * follow;
    const fishing = animation === "fish", harvesting = animation === "herb", lighting = animation === "lantern";
    const attending = fishing || harvesting || lighting;
    const progress=clamp(ritual,0,1);
    const action = harvesting ? herbPose(progress) : lighting ? lanternPose(progress,targets) : feedingPose(fishing?clamp(feeding,0,1):0);
    const strength = clamp(Math.abs(speed) / 13,0,1);
    const effort = clamp(cadence / 57,0,1) * pedalEngagement;
    const pedalStroke = Math.cos(phase*2) * effort, breath = Math.sin(time*3.1);
    const reaction = clamp(impact,0,1);
    const pedalBob = pedalStroke*.030;
    const bounce = reaction*(animation==="bump"?.090:.11);
    const seatShift = posture.shift - .12*reaction - (load-.62)*contactRear*.09;
    const walkingShift = (action.stride?.x ?? bankX)-bankX;
    const bodyPose = about(pelvis,shape(zero,[1,1+breath*.018-bounce*.11,1+breath*.025],
      posture.lean+reaction*.14-action.dip*.075+action.gulp*.09),
      [seatShift+action.forward*1.91+walkingShift,
        posture.settle+breath*.027+pedalBob-bounce-action.dismount*1.48-action.dip*.046+(action.stride?.bob??0),
        action.lateral*.63]);
    const bodyModel = multiply(model,bodyPose);
    const neckTurn = posture.reach + .052*breath + pedalBob*.67;
    const neckPose = about(neckRoot,shape(zero,[1,1-bounce*.37,1],neckTurn));
    const neckModel = multiply(bodyModel,neckPose);
    const scanning = .035 + .135*(1-strength)*(1-pedalEngagement);
    const glance = Math.sin(time*.88) * scanning + reaction*.12;
    const neckCounterTilt = -.82*posture.lean - .60*posture.reach;
    const expression = neckCounterTilt + .027*Math.sin(time*2.1) + reaction*.10;
    const headPose = about(headRoot,multiply(yaw(glance),shape(zero,unit,expression)));
    let headModel = multiply(neckModel,headPose), collarModel = neckModel, scarfAttachment = neckModel, bentNeck;
    const opening = attending ? action.bite : normalBill(time,strength,animation)+(animation==="bump"?reaction*.22:0);
    const grip = [1.485,3.321-opening*.21,0];
    if (action.dip > 0 || action.lift > 0) {
      const reachAngle = action.reachAngle ?? -.83, reachYaw = action.reachYaw ?? 0;
      const reach = multiply(yaw(reachYaw),shape(zero,unit,reachAngle));
      const gripToHead = point(reach,sub(grip,headRoot));
      const aim = sub(inversePoint(bodyPose,action.focus??fishWater),gripToHead);
      const headCenter = add(mix(point(neckPose,headRoot),aim,action.dip),[action.lift*.08,action.lift*.12,0]);
      const headAngle = (neckTurn+expression)*(1-action.dip)+reachAngle*action.dip+action.lift*.53+action.gulp*.065;
      const feedingHead = about(headRoot,multiply(yaw(glance*(1-action.dip)+reachYaw*action.dip),shape(zero,unit,headAngle)),sub(headCenter,headRoot));
      headModel = multiply(bodyModel,feedingHead);

      if (action.dip > .001) {
        const start=point(neckPose,neckSections[0].slice(0,3));
        const [x,y,z]=aim;
        const curved = fishing
          ? [start,[start[0]+.25,start[1]+.20,0],[start[0]+.42,start[1]+.33,z*.14],
            [x-.39,Math.max(start[1]+.41,y+.33),z*.28],[x-.25,y+.26,z*.58],[x-.12,y+.12,z*.86],aim]
          : neckSections.map((_,index)=>{
            const t=index/(neckSections.length-1);
            const p=mix(start,aim,t);
            p[0]+=.16*Math.sin(t*Math.PI);
            return p;
          });
        const centers=neckSections.map((section,index)=>mix(point(neckPose,section.slice(0,3)),curved[index],action.dip));
        centers[6]=headCenter;
        const taper=1-action.dip*(fishing?.075:.14);
        const sections=centers.map((p,index)=>[...p,neckSections[index][3]*taper,neckSections[index][4]]);
        bentNeck=capture(()=>sweep(sections,white));
        for (const {geometry} of bentNeck) geometry.temporary=true;
        const collarCenter=mix(centers[2],centers[3],.59);
        const collarTangent=sub(centers[3],centers[2]);
        const collarAngle=Math.atan2(collarTangent[1],collarTangent[0])-Math.PI/2;
        const collarPose=about(collarRoot,shape(zero,unit,collarAngle),sub(collarCenter,collarRoot));
        collarModel=multiply(bodyModel,collarPose);
        scarfAttachment=multiply(bodyModel,shape(sub(point(collarPose,scarfRoot),scarfRoot),unit));
      }
    }

    drawBatch(bike, model);
    if(action.dismount>.01){
      const deploy=ease(.06,.85,action.dismount);
      const foot=mix([-1.24,.57,-.13],[-1.08,.025,-.58],deploy);
      drawBatch(capture(()=>{
        rod([-.67,.73,-.12],foot,.023,steel);
        capsule(add(foot,[-.043,0,0]),add(foot,[.043,0,0]),.023,.025,dark);
      }),model);
    }
    const wheels = [
      {center:rear, contact:contactRear, pressure:(.40+.59*load)*(1-.68*action.dismount)},
      {center:front, contact:contactFront, pressure:(.22+.68*(1-load))*(1-.60*action.dismount)}
    ];
    drawBatch(capture(() => {
      for (const {center, contact, pressure} of wheels) {
        const level = Math.round(clamp(contact*(pressure+reaction*.16),0,1)*(tireFlex.length-1));
        ring(tireFlex[level],center,rubber);
      }
    }),model);
    for (const {center} of wheels) {
      drawBatch(spokes, multiply(model, shape(center, unit, wheelPhase)));
    }
    drawBatch(crankParts,multiply(model,shape(crank,unit,phase)));
    const limbs = capture(() => {
      for (const side of [-1,1]) {
        const lateral = value => value*side;
        const shoulder = point(bodyPose,[-.335,2.372,lateral(.28)]);
        const elbow = point(bodyPose,mix([.292,2.253,lateral(.363)],[-.31,2.275,lateral(.382)],action.dismount));
        elbow[1] += .083*posture.spread + .024*pedalStroke*side;
        elbow[2] += lateral(.081*posture.spread);
        const grip = mix([.969,2.006,lateral(.348)],point(bodyPose,[-.86,2.207,lateral(.414)]),action.dismount);
        capsule(shoulder,elbow,.104,.091,white);
        capsule(elbow,grip,.069,.061,soft);
        for(let i=0;i<3;i++){
          const finger = mix([.984+i*.013,2.005-i*.012,lateral(.348+i*.014)],
            point(bodyPose,[-.87-i*.04,2.202-i*.012,lateral(.414+i*.016)]),action.dismount);
          const base = add(elbow,scale(sub(finger,elbow),.62+i*.018));
          capsule(base,finger,.026,.022,i===0?white:soft);
        }

        const pedal = add(crank,[.219*side*Math.cos(phase),.219*side*Math.sin(phase),.274*side]);
        const step = side === 1 ? action.dismount : ease(.05,1,action.dismount);
        const walkFoot=action.stride?.footAt(side)??{x:bankX,lift:0};
        const stepLift=Math.sin(step*Math.PI)*.19+walkFoot.lift;
        const ankle = mix(add(pedal,[-.042,.106,.036*side]),[walkFoot.x+.16*side,.076+stepLift,.63+.22*side],step);
        const hip = point(bodyPose,[-.656,2.147,.246*side]);
        const toward = sub(ankle, hip);
        const span = length(toward), along = norm(toward);
        const upper = .770-.422*action.dismount, lower = .802-.421*action.dismount;
        const hinge = (upper*upper - lower*lower + span*span) / (2*span);
        const outward = norm([.91,.29,.16*side]);
        const bend = norm(sub(outward, scale(along, dot(outward,along))));
        const knee = add(add(hip,scale(along,hinge)),scale(bend,Math.sqrt(Math.max(0,upper*upper-hinge*hinge))));
        rod(add(pedal,[0,0,-.113]),add(pedal,[0,0,.113]),.033,pad);
        oval(pedal,[.110,.030,.090],dark);
        oval(add(pedal,[.082,.002,.045*side]),[.021,.019,.040],amber);
        capsule(hip, knee,.090,.083,soft);
        oval(knee,[.062,.066,.054],legs);
        rod(knee,ankle,.042,legs);
        oval(ankle,[.066,.064,.060],webbed);
        object(foot,shape(add(ankle,[.038,-.035,0]),[1,1,1]),webbed);
      }
    });
    drawBatch(limbs, model);
    drawBatch(torso, bodyModel);
    const tailAngle = -.073*posture.spread + Math.sin(time*4.3)*(.014+.028*posture.wind);
    drawBatch(tail,multiply(bodyModel,about([-.83,2.21,0],shape(zero,unit,tailAngle))));
    for(const [index,side] of [-1,1].entries()){
      const wingFlutter = side*(.042*posture.spread + .026*Math.sin(time*5.2+side)*posture.wind);
      drawBatch(wingCover[index],multiply(bodyModel,about([-.47,2.32,side*.23],roll(wingFlutter),[0,.023*posture.spread,side*.047*posture.spread])));
    }
    drawBatch(bentNeck??neck,bentNeck?bodyModel:neckModel);
    drawBatch(collar,collarModel);
    drawBatch(head,headModel);
    const pouchInflation = 1 + .074*breath + .29*action.gulp + .13*opening;
    drawBatch(jaw,multiply(headModel,about(mouthRoot,shape(zero,[1,pouchInflation,1+.07*action.gulp],-opening))));
    const blinking = Math.max(blinkAt(time),reaction*.49);
    const lidPose = about(eyesRoot,shape(zero,[1,Math.max(.075,1-blinking*.94),1]));
    drawBatch(eyes,multiply(headModel,lidPose));
    const wind = clamp(posture.wind*.72+strength*.30,0,1);
    scarfPhase = (scarfPhase + dt*(3.6+7.3*wind)) % TAU;
    const scarfIndex = Math.floor(scarfPhase/TAU*scarf.length);
    const scarfAngle = .36 - wind*.52 + action.dismount*.26;
    const scarfPose = about(scarfRoot,shape(zero,[.68+.77*wind,1,1+action.dismount*.39],scarfAngle));
    drawBatch(scarf[scarfIndex],multiply(scarfAttachment,scarfPose));

    if (magic > .12) {
      for (const {center, contact} of wheels) {
        const diameter = 1-.121*clamp(contact*3.5,0,1);
        const haloModel = multiply(model,shape(center,[diameter,diameter,1]));
        const halos = capture(() => {
          for (const side of [-1, 1]) {
            ring(scriptRing,[0,0,.077*side],accent);
            ring(innerRing,[0,0,.068*side],accent);
          }
        });
        drawBatch(halos,haloModel);
        drawBatch(seal,multiply(haloModel,shape(zero,unit,wheelPhase)));
      }
    }
    return {bill:point(headModel,grip),billDirection:norm([headModel[0],headModel[1],headModel[2]]),
      gulp:action.gulp,opening,dismount:action.dismount};
  };
}
