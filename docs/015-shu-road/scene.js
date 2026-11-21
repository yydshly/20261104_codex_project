(() => {
  'use strict';
  const canvas=document.getElementById('terrain');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  const error=document.getElementById('scene-error');
  function report(message) {
    error.textContent=message;
    error.hidden=false;
  }
  if (!gl) report('当前浏览器无法启用三维渲染，仍可查看场景说明和播放朗诵。');
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a,b,t) => a + (b-a)*t;
  const blend = (a,b,t) => a.map((v,i) => mix(v,b[i],t));
  const add = (a,b) => a.map((v,i) => v+b[i]);
  const sub = (a,b) => a.map((v,i) => v-b[i]);
  const scale = (a,s) => a.map(v => v*s);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const unit = a => scale(a,1/(Math.hypot(...a)||1));
  const hash = n => {
    const f = Math.sin(n*127.1+31.2)*43758.5453;
    return f-Math.floor(f);
  };
  const ease = t => t*t*(3-2*t);
  const tau = Math.PI*2;
  const world = [];
  const mist = [];
  const terrainSolids = [];
  const rock = 0, wood = 1, leaf = 2, water = 3, fabric = 4, skin = 5, straw = 6, cloud = 7, river = 8;
  const shelfRock = 13;
  const dampRock = 14;

  function triangle(mesh,a,b,c,material,coords = [[0,0],[1,0],[1,1]],normals) {
    const normal = unit(cross(sub(b,a),sub(c,a)));
    [a,b,c].forEach((position,i) => mesh.push(...position,...(normals ? normals[i] : normal),material,...coords[i]));
  }

  function quad(mesh,a,b,c,d,material,uv = [[0,0],[1,0],[1,1],[0,1]],normals) {
    triangle(mesh,a,b,c,material,[uv[0],uv[1],uv[2]],normals && [normals[0],normals[1],normals[2]]);
    triangle(mesh,a,c,d,material,[uv[0],uv[2],uv[3]],normals && [normals[0],normals[2],normals[3]]);
  }

  function beam(mesh,a,b,r1,r2,material,sides = 5) {
    const axis = unit(sub(b,a));
    const across = unit(cross(axis, Math.abs(axis[1]) > .8 ? [1,0,0] : [0,1,0]));
    const other = cross(axis,across);
    for (let i=0;i<sides;i++) {
      const radial = j => add(scale(across,Math.cos(j*tau/sides)),scale(other,Math.sin(j*tau/sides)));
      const u = radial(i), v = radial(i+1);
      quad(mesh,add(a,scale(u,r1)),add(a,scale(v,r1)),add(b,scale(v,r2)),add(b,scale(u,r2)),material);
    }
  }

  const profile = [1.14,1.03,.80,.72,.63,.57,.48,.40,.29,.19,.02];
  function mountain(x,z,height,radius,seed,lean = 0,base = -16,aspect = .82) {
    const rings = height < 39 ? 32 : 58;
    const slices = height < 39 ? 40 : 72;
    function point(t,a) {
      const band = clamp(t,0,.999999)*10;
      const i = Math.floor(band);
      const slope = mix(profile[i],profile[i+1],band-i);
      const ribs = 1+.16*Math.sin(3*a+seed)+.12*Math.cos(7*a-seed)+.047*Math.sin(13*a+t*5)
        +.03*Math.sin(25*a-seed+t*13)+.017*Math.sin(39*a+t*21);
      const ledge = 1+Math.sin(Math.PI*t)*(.065*Math.sin(t*34+.85*a)+.10*Math.sin(seed)*Math.sin(t*9+a)
        +.020*Math.cos(81*t+2*a+seed));
      // Preserve the walked shelves below .82; give the skyline jointed, uneven crowns.
      const crown=ease(clamp((t-.82)/.18));
      const crownWidth=1+crown*(.75+.28*Math.sin(seed));
      const r = radius*slope*ribs*ledge*crownWidth;
      return [x+lean*t*t+Math.sin(a)*r,base+height*t+Math.sin(3*a+seed+t*4)*radius*.07*Math.sin(Math.PI*t)
        +crown*radius*.038*(Math.sin(a*3+seed)+.43*Math.sin(a*7-seed)),z-radius*.27*t*t+Math.cos(a)*r*aspect];
    }
    function normal(t,a) {
      return unit(cross(sub(point(t,a+.013),point(t,a-.013)),sub(point(t+.009,a),point(t-.009,a))));
    }
    terrainSolids.push((probe, margin = 0) => {
      if (probe[1] < base-margin || probe[1] > base+height+margin) return false;
      if (Math.abs(probe[0]-x) > radius*1.64+Math.abs(lean)+margin
        || Math.abs(probe[2]-z) > radius*1.64+margin) return false;
      let t=clamp((probe[1]-base)/height);
      const angleAt = level => Math.atan2(probe[0]-x-lean*level*level,
        (probe[2]-z+radius*.27*level*level)/aspect);
      t=clamp(t+(probe[1]-point(t,angleAt(t))[1])/height);
      const dx=probe[0]-x-lean*t*t;
      const dz=(probe[2]-z+radius*.27*t*t)/aspect;
      const edge=point(t,angleAt(t));
      const radiusAt=Math.hypot(edge[0]-x-lean*t*t,(edge[2]-z+radius*.27*t*t)/aspect);
      return Math.hypot(dx,dz) < radiusAt+margin;
    });
    const grid = Array.from({length:rings+1},(_,j) => Array.from({length:slices},(_,i) => point(j/rings,i*tau/slices)));
    const normals = grid.map((row,j) => row.map((_,i) => normal(clamp(j/rings,.01,.99),i*tau/slices)));
    for (let j=0;j<rings;j++) {
      for (let i=0;i<slices;i++) {
        const n = (i+1)%slices;
        quad(world,grid[j][i],grid[j][n],grid[j+1][n],grid[j+1][i],rock,undefined,
          [normals[j][i],normals[j][n],normals[j+1][n],normals[j+1][i]]);
      }
    }
    return (t,a,pad = 0) => {
      const h = clamp(t,0,.99999)*rings;
      const s = ((a%tau+tau)%tau)*slices/tau;
      const j = Math.floor(h), i = Math.floor(s), n = (i+1)%slices;
      const u = s-i, v = h-j;
      const p = u >= v
        ? add(add(scale(grid[j][i],1-u),scale(grid[j][n],u-v)),scale(grid[j+1][n],v))
        : add(add(scale(grid[j][i],1-v),scale(grid[j+1][i],v-u)),scale(grid[j+1][n],u));
      return add(p,[Math.sin(a)*pad,0,Math.cos(a)*pad]);
    };
  }

  const peaks = [
    [-98,-171,112,44,10,13],[-58,-159,105,35,4,-9],[-27,-160,122,43,9,-7],[10,-181,129,44,2,8],
    [44,-163,115,37,7,3],[77,-148,98,44,18,-4],[112,-168,120,47,11,-12],
    [-57,-85,97,31,3,-3],[-35,-80,77,28,19,4],[-14,-76,97,30,2.3,-7],[9,-90,92,30,12,-2],
    [28,-68,100,27,4.6,-7],[51,-65,81,31,6,5],[73,-55,79,35,21,3],
    [-44,-30,80,22,12,4],[-20,-36,82,18,25,-5],[2,-42,95,19,10,-5],[38,-31,74,24,3.4,1]
  ];
  // Keep the distant range outside the main orbit, so the central cliffs are visible from behind.
  peaks.forEach(([x,z,height,radius,seed,lean]) => mountain(x*1.08,z-105,height+18,radius*1.55,seed,lean,-16,1.12));
  [[-252,93,111,70,8],[-268,176,94,66,13],[-246,10,124,68,17]].forEach(
    ([x,z,h,r,s])=>mountain(x,z,h,r,s,-4,-16,1.22));
  const cliff = mountain(-14,2,83,22,4.8,-6,-16,.85);
  // A narrow seam in the facing cliff illustrates the poem's bird path.
  function birdShelf(progress, edge) {
    const height=.421+.012*Math.sin(progress*4.6)+progress*.018;
    const angle=mix(-.86,.63,progress);
    const width=.13+.83*Math.sin(progress*Math.PI);
    return cliff(height,angle,edge ? width : -.22);
  }
  const shelfDepth=t=>-.18-.47*Math.sin(t*Math.PI)*(.8+.2*Math.sin(t*17));
  for (let step=0;step<20;step++) {
    const a=step/20, b=(step+1)/20;
    const inside=birdShelf(a,false), nextInside=birdShelf(b,false);
    const outside=birdShelf(a,true), nextOutside=birdShelf(b,true);
    quad(world,inside,outside,nextOutside,nextInside,shelfRock);
    quad(world,outside,add(outside,[0,shelfDepth(a),-.12]),add(nextOutside,[0,shelfDepth(b),-.12]),nextOutside,shelfRock);
  }
  const birdLedge=add(birdShelf(.50,true),[0,.2,0]);
  const qinlingPeak=cliff(.86,-.14,.34);
  const fall = mountain(18,-10,69,16,21.8,3,-16,.93);
  const leftSpur = mountain(-38,20,54,12,30,-3);
  const rightSpur = mountain(34,16,36,12,14,3);
  mountain(-46,45,44,16,6,0,-16,1.1);
  mountain(47,44,42,15,2,0,-16,1.1);

  const entranceStations=[
    [-34.5,1.65,51.2],[-32.7,1.80,46.8],[-32.35,1.93,44.1],
    [-32.28,2.04,41.5],[-32.65,2.15,38.6],[-34.0,2.31,34.5]
  ];
  function entranceFoot(position) {
    const distance=1+clamp(position)*3;
    const section=Math.min(3,Math.floor(distance));
    return blend(entranceStations[section],entranceStations[section+1],distance-section);
  }
  const ledgeRows=entranceStations.map(([x,y,z],i)=>{
    const rim=2.45+.42*Math.sin(i*2.2);
    return [
      [x-9.6,y+2.1,z],
      [x-1.25,y+.14,z],
      [x,y,z],
      [x+1.27,y-.07,z],
      [x+rim,y-.23,z],
      [x+rim+.42,y-2.35,z],
      [x+rim+3.4,-15,z]
    ];
  });
  for (let i=0;i<ledgeRows.length-1;i++) {
    const near=ledgeRows[i], far=ledgeRows[i+1];
    for (let j=0;j<near.length-1;j++) quad(world,near[j],near[j+1],far[j+1],far[j],rock);
  }
  for (const end of [ledgeRows[0],ledgeRows[ledgeRows.length-1]]) {
    const toe=[end[0][0],-15,end[0][2]];
    for (let i=0;i<end.length-1;i++) triangle(world,toe,end[i],end[i+1],rock);
  }

  const trailAngle = t => -.99*Math.cos(t*Math.PI*6)-.12;
  function route(t,offset = 0) {
    const a = trailAngle(t);
    const p = cliff(.24+t*.57,a,.20+offset);
    p[1] += .06 + offset*.03;
    return p;
  }
  const trailMesh=[];
  const planks = 340;
  const qingniTimberStart=.446;
  const qingniTimberEnd=.479;
  const qingniRockAnchor=add(route(.437,.72),[0,.08,0]);
  function qingniSocket(t,rise=0) {
    const h=.24+t*.57-.004+rise;
    const angle=trailAngle(t);
    const profile=[[-1,-1],[-.92,1],[1,.88],[.84,-.94]];
    const aperture=profile.map(([y,a])=>cliff(h+y*.00165,angle+a*.0078,.043));
    const rim=profile.map(([y,a])=>cliff(h+y*.00232,angle+a*.0102,.073));
    for (let edge=0;edge<4;edge++) {
      const next=(edge+1)%4;
      quad(trailMesh,rim[edge],rim[next],aperture[next],aperture[edge],edge===0?shelfRock:rock);
    }
    quad(trailMesh,...aperture,11);
    return cliff(h,angle,.08);
  }
  for (let i=0;i<planks;i++) {
    const a=i/planks;
    const walkingSection=(a>=.420 && a<.482) || (a>=.790 && a<.812);
    const qingni=a>=.415 && a<.58;
    const timber=!qingni || (a>=qingniTimberStart && a<qingniTimberEnd);
    const b=(i+(walkingSection || !timber?1:.985))/planks;
    const innerA=route(a), innerB=route(b), outerA=route(a,1.28), outerB=route(b,1.28);
    if (!timber) {
      const shelfA=cliff(.24+a*.57-.008,trailAngle(a),-.20);
      const shelfB=cliff(.24+b*.57-.008,trailAngle(b),-.20);
      quad(trailMesh,innerA,outerA,outerB,innerB,dampRock);
      quad(trailMesh,outerA,shelfA,shelfB,outerB,rock);
      continue;
    }
    const boardGrain=[[0,0],[1.28,0],[1.28,.19],[0,.19]];
    quad(trailMesh,innerA,outerA,outerB,innerB,wood,boardGrain);
    quad(trailMesh,innerA,add(innerA,[0,-.09,0]),add(outerA,[0,-.09,0]),outerA,wood);
    quad(trailMesh,outerA,add(outerA,[0,-.12,0]),add(outerB,[0,-.12,0]),outerB,wood);
    if (qingni) continue;
    if (i%5 === 0) {
      const wallHeight=.24+a*.57;
      const crossbeam=cliff(wallHeight-.003,trailAngle(a),-.42);
      const diagonal=cliff(wallHeight-.017,trailAngle(a),-.53);
      beam(trailMesh,crossbeam,add(outerA,[0,-.15,0]),.11,.087,wood);
      beam(trailMesh,diagonal,add(outerA,[0,-.21,0]),.135,.081,wood);
    }
    const railRun=Math.floor(i/5)*5;
    const sideEntrance=railRun===140 || railRun===145;
    if ((railRun>116 && railRun<153 && !sideEntrance) || (railRun>236 && railRun<265)) {
      const top=add(outerA,[0,.77,0]);
      const nextTop=add(route((i+1)/planks,1.28),[0,.77,0]);
      if (i%5===0) beam(trailMesh,outerA,top,.065,.059,wood);
      beam(trailMesh,top,nextTop,.044,.044,wood);
    }
  }
  for (const t of [.448,.457,.466,.475]) {
    qingniSocket(t);
    const h=.24+t*.57;
    const angle=trailAngle(t);
    const outer=route(t,1.28);
    beam(trailMesh,cliff(h-.004,angle,-.24),add(outer,[0,-.16,0]),.123,.094,wood,4);
    beam(trailMesh,cliff(h-.017,angle,-.48),add(outer,[0,-.22,0]),.105,.076,wood,4);
  }
  for (const offset of [.30,1.02]) {
    for (let i=Math.ceil(qingniTimberStart*planks);i<Math.floor(qingniTimberEnd*planks);i++) {
      beam(trailMesh,add(route(i/planks,offset),[0,-.17,0]),
        add(route((i+1)/planks,offset),[0,-.17,0]),.085,.085,wood,4);
    }
  }
  // One unfilled socket is exposed beside the deck so the construction can be read from eye level.
  const qingniSocketAnchor=qingniSocket(.448,.008);
  const qingniTimberAnchor=add(route(.461,1.13),[0,.06,0]);
  const overlookOrigin=route(.809,.27);
  const overlookDirection=unit(sub(route(.809,1.6),overlookOrigin).map((value,index)=>index===1?0:value));
  const overlookAcross=[overlookDirection[2],0,-overlookDirection[0]];
  function overlookPoint(distance,side,height=0) {
    return add(add(add(overlookOrigin,scale(overlookDirection,distance)),scale(overlookAcross,side)),[0,height,0]);
  }
  function overlookFoot(position) {
    if (position<.60) return route(mix(.794,.809,position/.60),.64);
    const reach=(position-.60)/.40;
    return overlookPoint(mix(.37,1.95,reach),.78*reach,.37*.03*(1-reach));
  }
  const platformDepth=2.90, platformHalfWidth=1.22;
  for (let i=0;i<12;i++) {
    const a=platformDepth*i/12, b=platformDepth*(i+1)/12;
    quad(trailMesh,overlookPoint(a,-platformHalfWidth),overlookPoint(b,-platformHalfWidth),
      overlookPoint(b,platformHalfWidth),overlookPoint(a,platformHalfWidth),wood);
  }
  for (const side of [-platformHalfWidth,platformHalfWidth]) {
    quad(trailMesh,overlookPoint(0,side),overlookPoint(platformDepth,side),
      overlookPoint(platformDepth,side,-.16),overlookPoint(0,side,-.16),wood);
    for (const distance of [.70,1.80,platformDepth]) {
      beam(trailMesh,overlookPoint(distance,side),overlookPoint(distance,side,.86),.06,.05,wood);
    }
    beam(trailMesh,overlookPoint(.70,side,.84),overlookPoint(platformDepth,side,.84),.044,.044,wood);
    beam(trailMesh,overlookPoint(2.63,side*.79,-.16),overlookPoint(-.76,side*.79,-2.54),.13,.14,wood);
  }

  const waterRows = 128;
  const waterColumns = 18;
  function cascade(t,u) {
    const width = mix(.095,.25,Math.pow(t,1.5));
    const a = -.68 + .17*Math.sin(t*6+.32) + (u-.5)*width;
    return fall(mix(.77,.075,t),a,.24+.20*Math.sin(Math.PI*t));
  }
  for (let j=0;j<waterRows;j++) {
    for (let i=0;i<waterColumns;i++) {
      const u=i/waterColumns, v=(i+1)/waterColumns, a=j/waterRows, b=(j+1)/waterRows;
      quad(world,cascade(a,u),cascade(a,v),cascade(b,v),cascade(b,u),water,[[u,a],[v,a],[v,b],[u,b]]);
    }
  }
  quad(world,[-205,-11,195],[205,-11,195],[205,-11,-320],[-205,-11,-320],river);

  function pine(p,h,seed) {
    const wind = mix(-.52,.37,hash(seed));
    const top = add(p,[h*wind,h,h*.16]);
    for (let i=0;i<5;i++) {
      const a=blend(p,top,i/5),b=blend(p,top,(i+1)/5);
      beam(world,a,b,h*mix(.041,.008,i/5),h*mix(.041,.008,(i+1)/5),22,8);
    }
    for (let i=0;i<10;i++) {
      const joint=blend(p,top,.27+i*.068);
      const angle=i*2.4+seed;
      const length=h*mix(.36,.075,i/9)*mix(.69,1,hash(i+seed));
      const elbow=add(joint,[Math.cos(angle)*length*.6,-h*.025,Math.sin(angle)*length*.6]);
      const tip=add(joint,[Math.cos(angle)*length,h*.065,Math.sin(angle)*length]);
      beam(world,joint,elbow,h*.012,h*.007,22,7);
      beam(world,elbow,tip,h*.007,.009,22,7);
      for (let j=0;j<4;j++) {
        const origin=blend(joint,tip,.39+j*.19);
        const branchAngle=angle+(j%2?1:-1)*.64;
        const reach=length*mix(.27,.43,hash(seed+i*7+j));
        const center=add(origin,[Math.cos(branchAngle)*reach*.46,h*.025,Math.sin(branchAngle)*reach*.46]);
        beam(world,origin,center,h*.004,.006,22,5);
        // Crossed needle sprays have volume, with fine silhouettes cut in the material.
        for (let card=0;card<3;card++) {
          const a=branchAngle+card*Math.PI/3;
          const across=[Math.cos(a)*reach*.54,0,Math.sin(a)*reach*.54];
          const lift=h*(.045+hash(seed+j+i)*.025);
          quad(world,sub(center,across),add(center,across),
            add(add(center,scale(across,.74)),[0,lift,0]),
            add(sub(center,scale(across,.74)),[0,lift,0]),20);
        }
      }
    }
  }
  [
    [cliff,.93,.31,4.5],[cliff,.89,-.8,4.9],[cliff,.84,1.14,3.7],[cliff,.74,-1.4,3.9],
    [cliff,.65,1.39,4.6],[cliff,.55,-1.34,3.8],[cliff,.44,1.37,3.1],[cliff,.35,-1.35,3.4],
    [fall,.91,-.9,3.7],[fall,.82,.23,4.1],[fall,.73,1.05,4],[fall,.49,-1.39,2.8],
    [leftSpur,.86,.52,4],[leftSpur,.77,1.03,3.4],[leftSpur,.56,.47,2.6],
    [rightSpur,.84,-.38,3.8],[rightSpur,.77,-.98,2.7]
  ].forEach(([slope,t,a,h],i) => pine(slope(t,a,.12),h,2+i*8.7));

  function vapor(x,y,z,w,d) {
    quad(mist,[x-w,y,z+d],[x+w,y,z+d],[x+w,y,z-d],[x-w,y,z-d],cloud);
  }
  vapor(0,-6,-21,98,102);
  vapor(8,2,-8,84,80);
  vapor(26,10,-36,66,66);
  vapor(-36,22,-73,66,48);
  vapor(17,31,-56,83,54);
  vapor(4,40,-30,64,63);
  vapor(6,-3,-.5,16,19);

  function walker(t, time) {
    const mesh = [];
    const foot = route(t,.81);
    const tangent = sub(route(clamp(t+.006),.81),route(clamp(t-.006),.81));
    const forward = unit([tangent[0],0,tangent[2]]);
    const side = cross([0,1,0],forward);
    const stride = Math.sin(time*10);
    const point = (x,y,z) => add(add(add(foot,scale(side,x)),scale(forward,z)),[0,y,0]);
    for (const dir of [-1,1]) {
      const swing=stride*dir;
      beam(mesh,point(dir*.133,.82,0),point(dir*.164,.12+Math.max(0,swing)*.17,swing*.30),.105,.062,fabric);
      beam(mesh,point(dir*.21,1.35,0),point(dir*.33,.92,-swing*.16),.13,.068,fabric);
    }
    beam(mesh,point(0,.66,0),point(0,1.47,.045),.285,.215,fabric,9);
    beam(mesh,point(0,1.46,.045),point(0,1.68,.056),.108,.108,skin,8);
    beam(mesh,point(0,1.65,.06),point(0,1.79,.06),.36,.035,straw,12);
    beam(mesh,point(.39,.06,.22+stride*.16),point(.39,1.43,.23+stride*.16),.027,.023,wood,5);
    return mesh;
  }


  const {extraSceneMesh, extraPoses, openingPath, cityFoot, apeAnchor, rapidsAnchor, pineAnchor,
    gateWoodAnchor,gatePassAnchor,scenicActors,travelerBody,legendAnchor,forestCliffAnchor,cuckooAnchor,impactAnchor,taibaiAnchor,emeiAnchor} = window.buildShuRoadWorldExtras({
    world,mist,quad,triangle,beam,mountain,pine,vapor,add,sub,scale,dot,cross,unit,clamp,
    mix,blend,ease,hash,tau,rock,wood,leaf,water,fabric,skin,straw,cloud,river,route,cascade,cliff,fall,entranceFoot
  });
  const firstPersonView=window.buildShuRoadFirstPerson({
    entranceFoot,overlookFoot,cityFoot,route,cascade,pineAnchor,extraPoses,add,sub,scale,blend,mix,unit,clamp,ease
  });
  const baseTerrainCount=world.length/9;
  const connectors=window.buildShuRoadConnectors({
    view:firstPersonView,world,quad,beam,triangle,rock,wood,leaf,route,terrainSolids,add,sub,scale,blend,mix,unit,clamp,ease
  });
  const journey=window.buildShuRoadJourney({view:firstPersonView,connectors});
  const noiseGLSL = `
    float random(vec3 p) {
      p = fract(p * .3183099 + vec3(.11,.37,.73));
      p *= 17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
    }
    float grain(vec3 p) {
      vec3 i=floor(p), f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(
        mix(mix(random(i),random(i+vec3(1,0,0)),f.x),mix(random(i+vec3(0,1,0)),random(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(random(i+vec3(0,0,1)),random(i+vec3(1,0,1)),f.x),mix(random(i+vec3(0,1,1)),random(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float wash(vec3 p) {
      return grain(p)*.55 + grain(p*2.04+8.1)*.29 + grain(p*4.13+11.3)*.16;
    }
    const vec3 sunDir=vec3(-.56,.53,.638);
    const vec3 skyLow=vec3(.746,.808,.781);
    const vec3 skyHigh=vec3(.300,.494,.553);
  `;

  const skyVertex = `
    attribute vec2 aPosition;
    varying vec2 vScreen;
    void main() {
      vScreen=aPosition;
      gl_Position=vec4(aPosition,0.999,1.0);
    }
  `;
  const skyFragment = `
    precision highp float;
    varying vec2 vScreen;
    uniform vec3 uRight,uUp,uForward,uPaper;
    uniform vec2 uLens;
    uniform float uTime;
    uniform vec4 uEffects;
    uniform vec4 uStarField;
    uniform float uSunVisible;
    ${noiseGLSL}
    float starPoint(vec2 plane,vec2 center,float size) {
      float distanceToStar=length(plane-center);
      return (1.0-smoothstep(size*.35,size,distanceToStar))*.78
        + exp(-distanceToStar*distanceToStar/(size*size*5.0))*.22;
    }
    float constellations(vec3 ray) {
      vec3 center=uStarField.xyz;
      vec3 horizontal=normalize(cross(center,vec3(0,1,0)));
      vec3 vertical=cross(horizontal,center);
      float ahead=dot(center,ray);
      vec2 plane=vec2(dot(ray,horizontal),dot(ray,vertical))/max(ahead,.01);
      float shen=starPoint(plane,vec2(-.22,.105),.010)+starPoint(plane,vec2(-.10,.09),.007)
        +starPoint(plane,vec2(-.192,.012),.006)+starPoint(plane,vec2(-.164,.002),.006)
        +starPoint(plane,vec2(-.137,-.008),.006)+starPoint(plane,vec2(-.24,-.103),.008)
        +starPoint(plane,vec2(-.105,-.085),.009);
      float jing=0.0;
      for (int i=0;i<4;i++) {
        float column=.061+float(i)*.047;
        jing+=starPoint(plane,vec2(column,.062+float(i)*.013),.006);
        jing+=starPoint(plane,vec2(column+.018,-.032+float(i)*.012),.006);
      }
      return (shen+jing)*step(0.0,ahead)*uStarField.w;
    }
    void main() {
      vec3 ray=normalize(uForward+uRight*vScreen.x/uLens.x+uUp*vScreen.y/uLens.y);
      float altitude=clamp(ray.y*1.24,0.0,1.0);
      vec3 sky=mix(skyLow,skyHigh,smoothstep(0.0,.97,altitude));
      sky=mix(sky,uPaper,.10);
      sky=mix(sky,vec3(.96,.84,.61),max(uEffects.z,0.0)*.74);
      sky*=1.0+min(uEffects.z,0.0)*.75;
      float glow=pow(max(dot(ray,normalize(vec3(-.48,.48,-.73))),0.0),10.0);
      sky=mix(sky,vec3(.97,.865,.645),glow*.64);
      vec3 p=vec3(ray.x,ray.y*3.2,ray.z)*4.1+vec3(uTime*.006,0,0);
      float veils=smoothstep(.43,.78,wash(p+vec3(11,0,0)));
      sky=mix(sky,vec3(.913,.921,.850),veils*(.11+.27*altitude));

      float sunAngle=dot(ray,normalize(vec3(-.44,.47,-.76)));
      float sunDisk=smoothstep(.9990,.99948,sunAngle);
      sky=mix(sky,vec3(1.0,.84,.57),sunDisk*(1.0-uEffects.w)*(.26+uEffects.z*.7));
      vec3 moonRay=normalize(vec3(-.30,.36,-.89));
      float moonAngle=dot(ray,moonRay);
      float moonDisk=smoothstep(.9986,.9990,moonAngle);
      float halo=pow(max(moonAngle,0.0),42.0)*.21;
      vec3 darkSky=mix(vec3(.062,.139,.184),vec3(.025,.059,.113),altitude);
      darkSky+=vec3(.36,.47,.56)*halo;
      vec3 starGrid=ray*163.0;
      float stars=step(.992,random(floor(starGrid)))*(1.0-smoothstep(.07,.19,length(fract(starGrid)-.5)));
      darkSky+=vec3(.66,.74,.79)*stars*smoothstep(.08,.27,ray.y);
      darkSky=mix(darkSky,vec3(.83,.88,.79),moonDisk*.90);
      sky=mix(sky,darkSky,uEffects.w);
      if (uStarField.w>.001) sky+=vec3(.98,.85,.57)*constellations(ray);
      sky+=(random(vec3(gl_FragCoord.xy,2.0))-.5)*.017;
      gl_FragColor=vec4(sky,1.0);
    }
  `;
  const meshVertex = `
    attribute vec3 aPosition,aNormal,aInfo;
    uniform vec3 uEye,uRight,uUp,uForward;
    uniform vec2 uLens;
    uniform float uTime;
    varying vec3 vPoint,vNormal,vInfo;
    varying float vDepth;
    void main() {
      vec3 position=aPosition;
      if (aInfo.x>19.5 && aInfo.x<21.5) {
        float gust=sin(uTime*1.12+aPosition.x*.47+aPosition.z*.31);
        position.x+=gust*.055*aInfo.z;
        position.z+=sin(uTime*.83+aPosition.x*.29)*.035*aInfo.z;
      }
      vPoint=position;
      vNormal=aNormal;
      vInfo=aInfo;
      vec3 offset=position-uEye;
      vDepth=dot(offset,uForward);
      gl_Position=vec4(dot(offset,uRight)*uLens.x,dot(offset,uUp)*uLens.y,vDepth*1.00048-.24006,vDepth);
    }
  `;
  const meshFragment = `
    precision highp float;
    uniform vec3 uEye,uPaper;
    uniform float uTime;
    uniform vec4 uEffects;
    varying vec3 vPoint,vNormal,vInfo;
    varying float vDepth;
    ${noiseGLSL}
    void main() {
      vec3 p=vPoint, n=normalize(vNormal);
      float material=vInfo.x, light=clamp(dot(n,sunDir)*.74+.36,0.0,1.0);
      float distanceFog=1.0-exp(-max(vDepth,0.0)*.0063);
      float low=1.0-smoothstep(-9.0,24.0,p.y);
      vec3 fog=mix(vec3(.538,.701,.708),skyLow,.37+low*.55);
      fog=mix(fog,uPaper,.13);
      vec3 color;
      if (material < .5 || abs(material-13.0)<.5 || abs(material-14.0)<.5) {
        float fissures=wash(p*vec3(.78,.155,.78));
        float carving=grain(p*vec3(2.5,.46,2.5));
        float layers=grain(p*vec3(.2,1.46,.19));
        float darkVeins=smoothstep(.56,.81,fissures);
        float tone=clamp(light*.74+fissures*.34+layers*.18-darkVeins*.32,0.0,1.0);
        vec3 shadow=vec3(.071,.163,.183);
        vec3 stone=vec3(.521,.561,.468);
        color=mix(shadow,stone,tone*tone);
        color*=.79+.22*carving+.24*layers;
        float moss=smoothstep(.35,.83,wash(p*.17)+max(n.y,0.0)*.38);
        color=mix(color,vec3(.24,.34,.223)*(light*.61+.46),moss*.56);
        color+=vec3(.042,.030,.015)*smoothstep(.42,.85,layers)*light;
        if (abs(material-13.0)<.5) color=mix(color,vec3(.58,.55,.43),.42);
        if (abs(material-14.0)<.5) color*=.67+.26*carving;
      } else if (material < 1.5) {
        float fiber=grain(p*vec3(8.1,3.5,6.7));
        color=mix(vec3(.224,.115,.051),vec3(.652,.418,.199),.28+light*.56+fiber*.15);
      } else if (material < 2.5) {
        color=mix(vec3(.050,.135,.137),vec3(.231,.339,.186),light*.54+grain(p*4.5)*.42);
      } else if (material < 3.5) {
        vec2 uv=vInfo.yz;
        float strand=wash(vec3(uv.x*27.0,uv.y*12.0-uTime*1.58*uEffects.y,5.0));
        float ripple=grain(vec3(uv.x*71.0,uv.y*38.0-uTime*3.4*uEffects.y,12.0));
        float foam=smoothstep(.45,.78,strand*.79+ripple*.28+uv.y*.11);
        float edge=smoothstep(0.0,.10,uv.x)*smoothstep(0.0,.10,1.0-uv.x);
        color=mix(vec3(.51,.725,.731),vec3(.938,.977,.937),clamp(foam+edge*.25,0.0,1.0));
      } else if (material < 4.5) {
        color=mix(vec3(.25,.063,.031),vec3(.70,.216,.095),light*.77);
      } else if (material < 5.5) {
        color=vec3(.59,.36,.19)*(.69+light*.43);
      } else if (material < 6.5) {
        color=mix(vec3(.312,.188,.086),vec3(.84,.647,.34),light*.85);
      } else if (material < 7.5) {
        vec2 uv=vInfo.yz;
        float taper=smoothstep(0.0,.28,uv.x)*smoothstep(0.0,.28,1.0-uv.x)
          *smoothstep(0.0,.24,uv.y)*smoothstep(0.0,.24,1.0-uv.y);
        float soft=wash(vec3((p.x-uTime*.77)*.042,p.y*.12,p.z*.081+uTime*.008));
        float layer=smoothstep(.39,.75,soft);
        float alpha=taper*layer*smoothstep(4.0,17.0,vDepth)*clamp((.63+.12*low)*uEffects.x,0.0,.96);
        gl_FragColor=vec4(mix(mix(fog,vec3(.901,.918,.865),.48),vec3(.20,.31,.40),uEffects.w*.84),alpha);
        return;
      } else if (material < 8.5) {
        float ripples=grain(vec3(p.x*.21,p.y,p.z*1.6+uTime*.8*uEffects.y));
        color=mix(vec3(.25,.407,.419),vec3(.52,.695,.694),ripples);
      } else if (material < 9.5) {
        color=vec3(.79,.84,.80)*(.62+light*.38);
      } else if (material < 10.5) {
        color=vec3(.87,.53,.21)*(.79+light*.30);
      } else if (material < 11.5) {
        color=vec3(.095,.122,.107)*(.60+light*.69);
      } else {
        color=vec3(.16,.245,.25)*(.56+light*.66);
      }
      float haze=clamp(distanceFog*.91 + low*.47*(.55+distanceFog*.45),0.0,.984);
      color=mix(color,fog,haze);
      color=mix(color,vec3(.91,.79,.59),max(uEffects.z,0.0)*.28*light);
      color*=1.0+min(uEffects.z,0.0)*.56;
      vec3 nightColor=color*vec3(.31,.52,.70)+vec3(.024,.044,.073);
      if (material > 9.5 && material < 10.5) nightColor=mix(nightColor,color,.56);
      color=mix(color,nightColor,uEffects.w);
      color+=(random(vec3(gl_FragCoord.xy,6.0))-.5)*.015;
      gl_FragColor=vec4(color,1.0);
    }
  `;

  function compile(type,source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  function makeProgram(vertex,fragment,attributes) {
    const program=gl.createProgram();
    const shaders=[compile(gl.VERTEX_SHADER,vertex),compile(gl.FRAGMENT_SHADER,fragment)];
    shaders.forEach(shader => gl.attachShader(program,shader));
    gl.linkProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms=['Eye','Right','Up','Forward','Paper','Lens','Time','Effects','StarField','SunVisible'];
    return {
      program,
      uniforms:Object.fromEntries(uniforms.map(name => [name,gl.getUniformLocation(program,'u'+name)])),
      attributes:Object.fromEntries(attributes.map(name => [name,gl.getAttribLocation(program,'a'+name)]))
    };
  }
  function makeBuffer(data) {
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    return buffer;
  }

  let skyProgram, meshProgram, screenBuffer, terrainBuffer, terrainCount, trailBuffer, trailCount;
  let openingBuffer, openingCount, vaporBuffer, vaporCount, walkerBuffer;
  if (gl) try {
    skyProgram=makeProgram(skyVertex,window.shuRoadLook.sky(skyFragment),['Position']);
    meshProgram=makeProgram(meshVertex,window.shuRoadLook.mesh(meshFragment),['Position','Normal','Info']);
    screenBuffer=makeBuffer([-1,-1,3,-1,-1,3]);
    terrainBuffer=makeBuffer(world);
    terrainCount=world.length/9;
    trailBuffer=makeBuffer(trailMesh);
    trailCount=trailMesh.length/9;
    openingBuffer=makeBuffer(openingPath);
    openingCount=openingPath.length/9;
    vaporBuffer=makeBuffer(mist);
    vaporCount=mist.length/9;
    walkerBuffer=gl.createBuffer();
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  } catch (failure) {
    console.error(failure);
    report('三维场景加载失败，仍可查看场景说明和播放朗诵。');
  }
  world.length=0;
  mist.length=0;
  trailMesh.length=0;
  openingPath.length=0;

  const paper=[.43,.52,.49];

  function uniforms(pass,eye,right,up,forward,lens,time,effects,stars,sunVisible=1) {
    const u=pass.uniforms;
    gl.useProgram(pass.program);
    gl.uniform3fv(u.Eye,eye);
    gl.uniform3fv(u.Right,right);
    gl.uniform3fv(u.Up,up);
    gl.uniform3fv(u.Forward,forward);
    gl.uniform3fv(u.Paper,paper);
    gl.uniform2fv(u.Lens,lens);
    gl.uniform1f(u.Time,time);
    gl.uniform4fv(u.Effects,effects);
    if (stars) gl.uniform4fv(u.StarField,stars);
    gl.uniform1f(u.SunVisible,sunVisible);
  }
  function mesh(buffer,count,start=0) {
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    Object.values(meshProgram.attributes).forEach((location,i) => {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location,3,gl.FLOAT,false,36,i*12);
    });
    gl.drawArrays(gl.TRIANGLES,start,count);
    Object.values(meshProgram.attributes).forEach(location => gl.disableVertexAttribArray(location));
  }



  const scenes=window.shuRoadScenes;
  const trailNotes=window.shuRoadTrailNotes;
  const clips=window.shuRoadAudio;
  const descriptionLines=clips.map(clip=>clip.descriptionText
    ?.split(/(?<=[。！？])|(?<=，)(?=只在|石阶|猿无|仰头像|杜鹃|枯松|狼与|最后把)/).filter(Boolean) || []);
  const ambience=window.createShuRoadAmbience();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const get=id=>document.getElementById(id);
  const caption=get('stage-caption');
  const captionSpeaker=get('caption-speaker');
  const featureMarker=get('feature-marker');
  const historyKey=get('history-key');
  const evidenceLabels=['唐文献','遗存参照','推测复原'];
  const verse=get('scene-verse');
  const journeyProgress=get('journey-progress');
  const playButton=get('play-sequence');
  const demoButton=get('full-demo');
  const dissolve=get('stage-dissolve');
  const travelCaption=get('travel-caption');
  const explainButton=get('explain-location');
  const arrivalTitle=get('arrival-title');
  const arrivalNote=get('arrival-note');
  const chapterList=get('chapters');
  const walkButton=get('walk-toggle');
  const backButton=document.querySelector('[data-walk="-1"]');
  const shortcutButton=get('trail-shortcut');
  const compressTrail=get('compress-trail');
  const walkEnd=get('walk-end');
  const pointers=new Map();
  const travelKeys=new Set();
  const walking=window.createShuRoadWalkMotion({view:journey.view,length:journey.length});
  const resolveFeature=window.createShuRoadGazeCues({view:firstPersonView,cascade,birdLedge,qinlingPeak,apeAnchor,rapidsAnchor,pineAnchor,
    qingniRockAnchor,qingniSocketAnchor,qingniTimberAnchor,gateWoodAnchor,gatePassAnchor,scenicActors,
    legendAnchor,forestCliffAnchor,cuckooAnchor,impactAnchor,taibaiAnchor,emeiAnchor});
  let renderAvailable=Boolean(gl && skyProgram && meshProgram && terrainBuffer);
  let active=0;
  let roadsOpened=false;
  let notesIndex=0;
  let location=journey.locate(0);
  let selectedAt=performance.now();
  let viewMode='first-person';
  let walkFrame=walking.state;
  let autoWalk=false;
  let fastPace=false;
  let demoMode='off';
  let demoTransition=null;
  let trailTransition=null;
  const travelFadeOut=.35;
  const travelCutAt=.47;
  const travelRevealAt=.61;
  const travelFadeIn=.36;
  const approachDistance=2.4;
  const approachTime=1.65;
  let [headYaw,headPitch]=headAngles(firstPersonView(0,0));
  let headFov=61;
  let lastManualLook=-Infinity;
  let gazeTurn=null;
  let lastCue=null;
  let manualCue=null;
  let lastFrameTime=0;
  let orbit;
  let flight;
  let frame=null;
  let verseLines=[];
  let lastCaptionKey='';
  let lastHistoryIndex=-2;
  let player;

  function fromView(eye,target) {
    const offset=sub(eye,target);
    const distance=Math.hypot(...offset);
    return {target,distance,yaw:Math.atan2(offset[0],offset[2]),pitch:Math.asin(offset[1]/distance)};
  }
  const trailCenter=route(.455,.84);
  const trailOutward=unit(sub(route(.455,1.6),route(.455)));
  const trailDirection=unit(sub(route(.485,.84),route(.425,.84)));
  const trailEye=add(add(add(trailCenter,scale(trailOutward,4.45)),scale(trailDirection,-3.6)),[0,3.8,0]);
  const localViews={
    0:{eye:[14,12,77],target:[-10,33,-10]},
    3:{eye:trailEye,target:add(trailCenter,[0,1.25,0])},
    5:{eye:[2,46,27],target:[13,19,-2]}
  };
  const poses=scenes.map((_,i)=>{
    const view=extraPoses[i] || localViews[i] || localViews[0];
    return fromView(view.eye,view.target);
  });
  const starEye=add(trailEye,[0,1.1,0]);
  const starTarget=[8,80,11];
  const orbitStarDirection=unit(sub(starTarget,starEye));
  orbit={...poses[0]};

  function frameCamera(eye,forward,fov) {
    const right=unit(cross(forward,[0,1,0]));
    return {eye,forward,right,up:cross(right,forward),fov};
  }

  function headAngles(view) {
    const direction=unit(sub(view.target,view.eye));
    return [Math.atan2(direction[0],-direction[2]),Math.asin(clamp(direction[1],-1,1))];
  }

  function restAmount(state) {
    if (!state || location.kind!=='scene' || active!==3 || state.index!==3) return 0;
    return state.phase==='poem'?ease(clamp((state.phaseSourceTime-9.3)/1.55))
      :1-ease(clamp(state.phaseSourceTime/1.35));
  }

  function camera(state=player?.snapshot()) {
    if (viewMode==='first-person') {
      const rest=restAmount(state);
      const lean=.34*ease(clamp((-headPitch-.48)/.50))*(1-rest*.8);
      const eye=add(walkFrame.eye,[Math.sin(headYaw)*lean,walkFrame.bob-.42*rest,-Math.cos(headYaw)*lean]);
      const forward=[Math.sin(headYaw)*Math.cos(headPitch),Math.sin(headPitch),-Math.cos(headYaw)*Math.cos(headPitch)];
      return frameCamera(eye,forward,headFov);
    }
    const {target,distance,yaw,pitch}=orbit;
    const horizontal=distance*Math.cos(pitch);
    const eye=add(target,[horizontal*Math.sin(yaw),distance*Math.sin(pitch),horizontal*Math.cos(yaw)]);
    eye[1]=Math.max(-9,eye[1]);
    for (let step=0;step<55 && terrainSolids.some(contains=>contains(eye,.62));step++) {
      eye[1]+=Math.max(.58,distance*.039);
    }
    const forward=unit(sub(target,eye));
    return frameCamera(eye,forward,54);
  }

  function moveTo(destination,now,short=true) {
    const radians=destination.yaw-orbit.yaw;
    const yaw=orbit.yaw+Math.atan2(Math.sin(radians),Math.cos(radians));
    const target={...destination,yaw};
    if (short && !reducedMotion.matches && Math.hypot(...sub(orbit.target,target.target))<42) {
      flight={from:orbit,to:target,start:now};
    } else {
      orbit=target;
      flight=null;
    }
  }

  function positionCamera(now) {
    if (flight) {
      const {from,to,start}=flight;
      const progress=clamp((now-start)/700);
      const t=ease(progress);
      orbit={
        target:blend(from.target,to.target,t),
        distance:Math.exp(mix(Math.log(from.distance),Math.log(to.distance),t)),
        yaw:mix(from.yaw,to.yaw,t),
        pitch:mix(from.pitch,to.pitch,t)
      };
      if (progress<1) return;
      flight=null;
    }
  }

  function aimAt(target,manual=false,fov=61) {
    const [yaw,pitch]=headAngles({eye:walkFrame.eye,target});
    const turn=Math.atan2(Math.sin(yaw-headYaw),Math.cos(yaw-headYaw));
    const lift=clamp(pitch,-1.44,1.48)-headPitch;
    if (reducedMotion.matches) {
      headYaw+=turn;
      headPitch+=lift;
      headFov=fov;
      return;
    }
    const seconds=clamp(.65+Math.hypot(turn,lift)*.72,.85,2.6);
    gazeTurn={yaw:headYaw,pitch:headPitch,turn,lift,seconds,elapsed:0,manual,fov};
  }

  function updateGaze(now,delta,state) {
    if (!gazeTurn?.manual) {
      if (location.kind!=='scene' || location.index!==state.index) {
        lastCue=null;
        gazeTurn=null;
        return;
      }
      if (!state.running || reducedMotion.matches) return;
      const motionTime=state.poemElapsed+(state.explaining?state.phaseElapsed:0);
      const cue=resolveFeature(active,state.phase,activeCaptionLine(state),walkFrame.eye,
        state.phaseSourceTime+.65,motionTime);
      if (!cue || pointers.size || now-lastManualLook<=1500 || cue.id===manualCue) return;
      manualCue=null;
      const [yaw,pitch]=headAngles({eye:walkFrame.eye,target:cue.target});
      const turn=Math.atan2(Math.sin(yaw-headYaw),Math.cos(yaw-headYaw));
      const pitchDelta=clamp(pitch,-1.44,1.48)-headPitch;
      const smoothing=1-Math.exp(-5.8*delta);
      headYaw+=clamp(turn*smoothing,-delta*1.65,delta*1.65);
      headPitch+=clamp(pitchDelta*smoothing,-delta*1.1,delta*1.1);
      headFov=mix(headFov,cue.fov,1-Math.exp(-2.8*delta));
      lastCue=cue.id;
      return;
    }
    if (!gazeTurn) return;
    gazeTurn.elapsed+=delta;
    const progress=clamp(gazeTurn.elapsed/gazeTurn.seconds);
    const softness=ease(progress);
    headYaw=gazeTurn.yaw+gazeTurn.turn*softness;
    headPitch=gazeTurn.pitch+gazeTurn.lift*softness;
    headFov=mix(headFov,gazeTurn.fov,1-Math.exp(-3.2*delta));
    if (progress===1) gazeTurn=null;
  }

  function cameraLens(fov) {
    const aspect=canvas.width/canvas.height;
    const focal=1/Math.tan((fov||56)*Math.PI/360);
    return [focal/Math.max(aspect,1.13),focal*Math.min(aspect/1.13,1)];
  }

  function renderScene(now,state,{eye,forward,right,up,fov}) {
    const lens=cameraLens(fov);
    const previewTime=clamp((now-selectedAt)/1000,0,15);
    const isOrbit=viewMode==='orbit';
    const connecting=!isOrbit && location.kind==='connector';
    const sceneIndex=isOrbit?notesIndex:active;
    const hasPoem=state.index===sceneIndex;
    const describing=hasPoem && state.phase==='description';
    const time=reducedMotion.matches?0:hasPoem?state.poemElapsed+(describing?state.phaseElapsed:0):previewTime;
    const poemProgress=hasPoem?clamp(state.poemElapsed/Math.max(1,state.poemDuration)):clamp(time/15);
    const effects=connecting
      ? blend(scenes[location.index].effects,scenes[location.nextIndex].effects,ease(location.progress))
      : [...scenes[sceneIndex].effects];
    const starFade=describing?1-ease(clamp(state.phaseElapsed/.95)):1;
    const starIntensity=!connecting && sceneIndex===3 && hasPoem
      ? ease(clamp((poemProgress-.40)/.31))*starFade : 0;
    const starDirection=viewMode==='first-person' ? firstPersonView.starDirection || orbitStarDirection : orbitStarDirection;
    if (sceneIndex===3) effects[3]+=.66*starIntensity;
    if (!connecting && sceneIndex===7) effects[3]+=.46*ease(clamp((poemProgress-.39)/.51));
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    uniforms(skyProgram,eye,right,up,forward,lens,time,effects,[...starDirection,starIntensity],sceneIndex===2&&!connecting?0:1);
    gl.bindBuffer(gl.ARRAY_BUFFER,screenBuffer);
    gl.enableVertexAttribArray(skyProgram.attributes.Position);
    gl.vertexAttribPointer(skyProgram.attributes.Position,2,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.disableVertexAttribArray(skyProgram.attributes.Position);

    gl.enable(gl.DEPTH_TEST);
    uniforms(meshProgram,eye,right,up,forward,lens,time,effects);
    const openingRoad=connectors.drawRanges?.[0];
    if (!isOrbit && !roadsOpened && openingRoad) {
      mesh(terrainBuffer,baseTerrainCount);
      mesh(terrainBuffer,openingRoad.count,openingRoad.start);
    } else {
      mesh(terrainBuffer,terrainCount);
    }
    if (sceneIndex!==0 || connecting) mesh(trailBuffer,trailCount);
    let pathProgress=1;
    if (sceneIndex===0) pathProgress=0;
    if (!connecting && sceneIndex===1 && !reducedMotion.matches) {
      pathProgress=hasPoem
        ? ease(clamp((poemProgress-.22)/.70))
        : ease(clamp((time-1.2)/4.8));
      if (describing) pathProgress=Math.max(pathProgress,ease(clamp((state.phaseSourceTime-3.15)/2.95)));
    }
    if (pathProgress>0) mesh(openingBuffer,Math.floor(openingCount*pathProgress/3)*3);
    const walkProgress=hasPoem?clamp(poemProgress/.42):clamp(time/13);
    const walkTime=hasPoem?state.poemElapsed:time;
    const figure=sceneIndex===3 && isOrbit
      ? walker(mix(.447,.525,walkProgress),walkProgress<1?walkTime:0) : [];
    const openingExplanation=sceneIndex===1 && describing && state.poemElapsed<3.5 && !reducedMotion.matches;
    const motionTime=openingExplanation?Math.max(0,state.phaseSourceTime-3.27):time;
    const dynamic=extraSceneMesh(sceneIndex,motionTime,hasPoem && !describing?poemProgress:null);
    const body=!isOrbit && !connecting && !demoTransition && !trailTransition
      ?travelerBody({foot:add(walkFrame.eye,[0,-1.65,0]),eye,forward,right,time,rest:restAmount(state),speed:Math.abs(walkFrame.speed)}):[];
    const vertices=new Float32Array(figure.length+(dynamic?.length||0)+body.length);
    vertices.set(figure);
    if (dynamic?.length) vertices.set(dynamic,figure.length);
    vertices.set(body,figure.length+(dynamic?.length||0));
    gl.bindBuffer(gl.ARRAY_BUFFER,walkerBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
    mesh(walkerBuffer,vertices.length/9);
    gl.enable(gl.BLEND);
    gl.depthMask(false);
    if(dynamic?.haze?.length) {
      gl.bindBuffer(gl.ARRAY_BUFFER,walkerBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(dynamic.haze),gl.DYNAMIC_DRAW);
      mesh(walkerBuffer,dynamic.haze.length/9);
    }
    mesh(vaporBuffer,vaporCount);
    gl.depthMask(true);
  }

  function updateNotes(index) {
    notesIndex=index;
    const scene=scenes[index];
    get('scene-title').textContent=scene.title;
    get('scene-type').textContent=scene.type;
    get('scene-location').textContent=scene.location;
    get('scene-terrain').textContent=scene.terrain;
    get('scene-effect').textContent=scene.effect;
    get('scene-mood').textContent=scene.mood;
    get('scene-basis-label').textContent=scene.evidence?'唐文献':'依据';
    get('scene-basis').textContent=scene.basis;
    get('scene-material-row').hidden=!scene.materialBasis;
    get('scene-material-basis').textContent=scene.materialBasis || '';
    get('scene-interpretation-label').textContent=scene.evidence?'推测':'演绎';
    get('scene-interpretation').textContent=scene.interpretation;
    for (const [id,entry] of [['scene-source',scene.source],['scene-extra-source',scene.extraSource],
      ['scene-context-source',scene.contextSource]]) {
      const link=get(id);
      link.hidden=!entry;
      if (entry) {
        link.textContent=entry[0]+' ↗';
        link.href=entry[1];
      }
    }
    verseLines=scene.lines.map(text=>{
      const line=document.createElement('span');
      line.className='verse-line';
      line.textContent=text;
      return line;
    });
    verse.replaceChildren(...verseLines);
    for (const [i,button] of [...chapterList.children].entries()) {
      button.setAttribute('aria-pressed',String(i===index));
      if (i===active) button.setAttribute('aria-current','location');
      else button.removeAttribute('aria-current');
    }
    lastCaptionKey='';
  }

  function inspectScene(index) {
    updateNotes(index);
    if (viewMode==='orbit') {
      selectedAt=performance.now();
      moveTo(poses[index],selectedAt);
    } else {
      get('scene-notes').open=true;
    }
    invalidate();
  }

  function updateLocation(now) {
    location=journey.locate(walkFrame.distance);
    if (location.kind!=='scene' || location.index===active) return;
    selectLandmark(location.index,now);
    player.arrive(active);
    invalidate();
  }

  function selectLandmark(index,now) {
    active=index;
    if (active>0) roadsOpened=true;
    selectedAt=now;
    gazeTurn=null;
    lastCue=null;
    manualCue=null;
    updateNotes(active);
  }

  function inDemo() {
    return demoMode==='playing' || demoMode==='paused';
  }

  function setWalkDistance(distance) {
    walkFrame=walking.reset(0,journey.positionAtDistance(distance));
    location=journey.locate(walkFrame.distance);
  }

  function demoArrivalDistance(index) {
    const landmark=journey.landmarks[index];
    // The waterfall is read from its outward platform, beyond the inside rail.
    const fraction=index===5?.94:0;
    return mix(landmark.start,landmark.end,fraction);
  }

  function initialDemoView(index,eye) {
    const cue=resolveFeature(index,'poem',0,eye,0,0);
    return cue?{eye,target:cue.target}:firstPersonView(index,0);
  }

  function enterDemoLandmark(index,now,keepLook=false) {
    setWalkDistance(demoArrivalDistance(index));
    selectLandmark(index,now);
    if (!keepLook) {
      [headYaw,headPitch]=headAngles(initialDemoView(index,walkFrame.eye));
      lastManualLook=-Infinity;
    }
    headFov=61;
    player.replay(index);
  }

  function stopDemo() {
    if (demoMode==='off') return;
    demoMode='off';
    demoTransition=null;
    invalidate();
  }

  function toggleDemo() {
    const state=player.snapshot();
    if (inDemo() && state.audioError) {
      demoMode='playing';
      player.toggle();
    } else if (demoMode==='playing') {
      demoMode='paused';
      if (state.running) player.toggle();
    } else if (demoMode==='paused') {
      demoMode='playing';
      if (!state.running && !state.complete) player.toggle();
    } else {
      haltWalk();
      flight=null;
      demoMode='playing';
      demoTransition=null;
      viewMode='first-person';
      updateViewMode();
      get('scene-notes').open=false;
      ambience.unlock();
      enterDemoLandmark(0,performance.now());
    }
    lastFrameTime=performance.now();
    invalidate();
  }

  function advanceDemo(now,delta,state) {
    if (demoMode!=='playing') return;
    if (demoTransition) {
      const transition=demoTransition;
      const destination=demoArrivalDistance(transition.next);
      transition.elapsed+=delta;
      if (!transition.entered && transition.elapsed>=travelCutAt) {
        transition.entered=true;
        setWalkDistance(destination-(transition.still?0:approachDistance));
        if (transition.still) {
          [headYaw,headPitch]=headAngles(initialDemoView(transition.next,walkFrame.eye));
        } else {
          [headYaw,headPitch]=aheadAngles();
          const [yaw,pitch]=headAngles(initialDemoView(transition.next,walkFrame.eye));
          transition.look={yaw:headYaw,pitch:headPitch,turn:Math.atan2(Math.sin(yaw-headYaw),Math.cos(yaw-headYaw)),lift:pitch-headPitch};
        }
      }
      if (!transition.still && transition.elapsed>=travelRevealAt) {
        const progress=clamp((transition.elapsed-travelRevealAt)/approachTime);
        setWalkDistance(destination-approachDistance*(1-progress));
        if (!pointers.size && now-lastManualLook>950) {
          headYaw=transition.look.yaw+transition.look.turn*ease(progress);
          headPitch=transition.look.pitch+transition.look.lift*ease(progress);
        }
      }
      if (transition.elapsed>=transition.duration) {
        enterDemoLandmark(transition.next,now,true);
        demoTransition=null;
      }
      return;
    }
    if (state.complete) {
      if (active===scenes.length-1) {
        demoMode='finished';
      } else {
        const still=reducedMotion.matches;
        demoTransition={next:active+1,elapsed:0,duration:travelRevealAt+(still?0:approachTime),entered:false,still};
      }
      return;
    }
    if (!state.running || reducedMotion.matches) return;
    const landmark=journey.landmarks[active];
    const descriptionElapsed=state.explaining?state.phaseElapsed:0;
    const progress=clamp((state.poemElapsed+descriptionElapsed)/Math.max(1,state.poemDuration+state.descriptionDuration));
    const stoppingDistance=active===0?mix(landmark.start,landmark.end,.28)
      :active===3?mix(landmark.start,landmark.end,.32):landmark.end-.12;
    const desired=mix(demoArrivalDistance(active),stoppingDistance,progress);
    if (desired>walkFrame.distance) setWalkDistance(Math.min(desired,walkFrame.distance+1.2*delta));
  }

  function returningOnTrail() {
    return walkFrame.speed<-.05 || (Math.abs(walkFrame.speed)<=.05 && active===location.nextIndex);
  }

  function canShortenTrail() {
    return viewMode==='first-person' && !inDemo() && !trailTransition && location.kind==='connector'
      && !returningOnTrail() && location.end-walkFrame.distance>36;
  }

  function shortenTrail(automatic=false) {
    if (!canShortenTrail()) return;
    const distance=location.end-9;
    if (!automatic) haltWalk();
    const still=reducedMotion.matches;
    trailTransition={distance,next:location.nextIndex,elapsed:0,duration:travelRevealAt+(still?0:travelFadeIn),entered:false,still};
    lastFrameTime=performance.now();
    invalidate();
  }

  function advanceTrailTransition(delta) {
    const transition=trailTransition;
    transition.elapsed+=delta;
    if (!transition.entered && transition.elapsed>=travelCutAt) {
      transition.entered=true;
      setWalkDistance(transition.distance);
      [headYaw,headPitch]=aheadAngles();
      gazeTurn=null;
    }
    if (transition.elapsed>=transition.duration) trailTransition=null;
  }

  function activeCaptionLine(state) {
    if (!state.hasArrival || state.ended || (!state.running && state.phaseElapsed<=0)) return -1;
    const starts=window.shuRoadCaptionStarts[state.index][state.phase];
    return starts.findLastIndex(start=>state.phaseSourceTime>=start);
  }

  function currentFeature(state,eye) {
    if (demoTransition || trailTransition || (viewMode==='first-person' && location.kind==='connector')) return null;
    const index=viewMode==='orbit'?notesIndex:active;
    const line=state.index===index?activeCaptionLine(state):-1;
    const motionTime=state.poemElapsed+(state.explaining?state.phaseElapsed:0);
    return resolveFeature(index,state.phase,line,eye,state.index===index?state.phaseSourceTime:undefined,motionTime);
  }

  function updateFeatureMarker(state,view) {
    const cue=currentFeature(state,view.eye);
    featureMarker.hidden=!cue;
    if (!cue) return;
    const offset=sub(cue.target,view.eye);
    const depth=dot(offset,view.forward);
    const side=dot(offset,view.right);
    const height=dot(offset,view.up);
    const lens=cameraLens(view.fov);
    const x=.5+.5*side*lens[0]/Math.max(.12,depth);
    const y=.5-.5*height*lens[1]/Math.max(.12,depth);
    const inset=clamp(88/canvas.clientWidth,.16,.45);
    const onScreen=depth>.12 && x>inset && x<1-inset && y>.18 && y<.78;
    let arrow='';
    if (!onScreen) {
      if (depth<0 || x<=inset || x>=1-inset) arrow=side<0?'← ':'→ ';
      else arrow=height>0?'↑ ':'↓ ';
    }
    const label=arrow+cue.label;
    if (featureMarker.textContent!==label) featureMarker.textContent=label;
    featureMarker.title='转向'+cue.label;
    featureMarker.dataset.edge=String(!onScreen);
    featureMarker.dataset.evidence=cue.evidence || '';
    featureMarker.dataset.actor=String(/\/(crane|birds|cuckoo|ape|workers|tiger|snake|founders|wolves|guard)$/.test(cue.id));
    featureMarker.style.left=clamp(x,inset,1-inset)*100+'%';
    featureMarker.style.top=clamp(y,.18,.78)*100+'%';
  }

  function updatePlaybackUI(state) {
    const scene=scenes[state.index];
    const explaining=state.phase==='description' && state.hasArrival;
    const lines=explaining?descriptionLines[state.index]:scene?.lines;
    const line=activeCaptionLine(state);
    const key=[state.index,state.phase,line,notesIndex].join('/');
    if (key!==lastCaptionKey) {
      lastCaptionKey=key;
      caption.textContent=lines?.[line] || '';
      caption.parentElement.classList.toggle('describing',explaining);
      captionSpeaker.hidden=line<0;
      captionSpeaker.textContent=explaining?'旁白 · 解说':'诗人 · 朗诵';
      verseLines.forEach((node,i)=>node.classList.toggle('current',!explaining && state.index===notesIndex && line===i));
    }
    const between=location.kind==='connector';
    let label='继续语音导览';
    if (state.audioError) label='重试语音';
    else if (state.running) label=explaining?'暂停解说':'暂停朗诵';
    else if (!state.unlocked) label='开启语音导览';
    else if (state.complete) label=between?'重听上一处':'重听本处导览';
    else if (explaining && !state.ended) label='继续解说';
    if (inDemo()) label='退出演示';
    if (get('play-label').textContent!==label) {
      get('play-label').textContent=label;
    }
    const playIcon=inDemo()?'':state.running?'Ⅱ':'♪';
    if (get('play-icon').textContent!==playIcon) get('play-icon').textContent=playIcon;
    get('play-icon').hidden=inDemo();
    const next=between?scenes[returningOnTrail()?location.index:location.nextIndex]:null;
    const title=between?'山路 · 往 '+next.short:scenes[active].title;
    if (arrivalTitle.textContent!==title) arrivalTitle.textContent=title;
    const note=between?trailNotes[location.index][location.progress<.55?0:1]:scenes[active].arrivalNote;
    if (arrivalNote.textContent!==note) arrivalNote.textContent=note;
    const explainLabel=explaining
      ? state.ended?'重听解说':'回到诗句'
      : between?'听上一处解说':'只听解说';
    if (explainButton.textContent!==explainLabel) explainButton.textContent=explainLabel;
    explainButton.disabled=!state.canExplain || inDemo();
    let status='每到一处，先听原诗，再听解说';
    if (state.audioError) status=state.audioError;
    else if (state.running) status=scene.short+(explaining?' · 旁白解说':' · 诗人朗诵');
    else if (!state.enabled) status='语音导览已暂停';
    else if (state.complete && !between) status='本处导览已听完 · 可停步看景';
    if (inDemo() && state.audioError) status='语音暂时中断，可点「重试演示」';
    else if (demoMode==='finished') status='九处演示已完成 · 可自由环顾';
    else if (demoMode==='paused') status='完整演示已暂停';
    else if (demoTransition || trailTransition) status='前往 '+scenes[(demoTransition || trailTransition).next].short;
    else if (!state.running && !state.audioError && state.enabled && between) status='走到'+next.short+'时接着听';
    if (get('play-status').textContent!==status) get('play-status').textContent=status;

    let demoLabel='完整演示';
    if (inDemo() && state.audioError) demoLabel='重试演示';
    else if (demoMode==='playing') demoLabel='暂停演示';
    else if (demoMode==='paused') demoLabel='继续演示';
    else if (demoMode==='finished') demoLabel='重播演示';
    if (demoButton.textContent!==demoLabel) demoButton.textContent=demoLabel;
    const transition=trailTransition || (demoMode==='playing'?demoTransition:null);
    let opacity=0;
    if (transition) {
      opacity=transition.still?1:ease(clamp(Math.min(transition.elapsed/travelFadeOut,
        (travelRevealAt+travelFadeIn-transition.elapsed)/travelFadeIn)));
      const caption='沿山路前往 · '+scenes[transition.next].short;
      if (travelCaption.textContent!==caption) travelCaption.textContent=caption;
    }
    dissolve.style.opacity=opacity;
  }

  function invalidate() {
    if (frame===null) frame=requestAnimationFrame(tick);
  }
  function updateJourneyUI() {
    const overview=viewMode==='orbit';
    const shown=overview?notesIndex:active;
    const historyIndex=overview || location.kind==='scene'?shown:-1;
    if (historyIndex!==lastHistoryIndex) {
      lastHistoryIndex=historyIndex;
      const evidence=scenes[historyIndex]?.evidence;
      historyKey.hidden=!evidence;
      get('scene-model-tag').textContent=evidence?'史料参照':'诗境演绎';
      if (evidence) {
        evidence.forEach((text,i)=>{ historyKey.children[i].textContent=evidenceLabels[i]+' · '+text; });
      }
    }
    const index=String(shown+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
    const returning=returningOnTrail();
    const next=!overview && location.kind==='connector' ? scenes[returning?location.index:location.nextIndex] : null;
    const remaining=returning?walkFrame.distance-location.start:location.end-walkFrame.distance;
    const place=next
      ? '往 '+next.short+' · '+Math.max(0,Math.ceil(remaining))+' m'
      : scenes[shown].location;
    if (get('stage-index').textContent!==index) get('stage-index').textContent=index;
    if (get('stage-place').textContent!==place) get('stage-place').textContent=place;
    journeyProgress.value=walkFrame.distance;
    const distance=Math.round(walkFrame.distance)+' / '+Math.round(journey.length)+' m';
    if (get('chapter-clock').textContent!==distance) get('chapter-clock').textContent=distance;
  }
  function updateWalkUI() {
    const label=autoWalk?'停步':'沿路前行';
    if (walkButton.textContent!==label) {
      walkButton.textContent=label;
      walkButton.setAttribute('aria-pressed',String(autoWalk));
    }
    walkButton.disabled=walkFrame.atEnd;
    backButton.disabled=walkFrame.atStart;
    shortcutButton.hidden=!canShortenTrail();
    if (!shortcutButton.hidden) shortcutButton.title='到'+scenes[location.nextIndex].short+'前约 9 米处停下';
    walkEnd.hidden=viewMode!=='first-person'||!walkFrame.atEnd;
  }

  function aheadAngles() {
    const lookDistance=Math.min(journey.length,walkFrame.distance+4);
    if (lookDistance-walkFrame.distance<.06) return [headYaw,headPitch];
    const point=journey.view(0,journey.positionAtDistance(lookDistance)).eye;
    const [yaw,pitch]=headAngles({eye:walkFrame.eye,target:point});
    return [yaw,clamp(pitch,-.30,.25)];
  }

  function followRoad(now,delta) {
    if (location.kind!=='connector' || !autoWalk || walkFrame.speed<.12 || gazeTurn
      || pointers.size || now-lastManualLook<1350 || reducedMotion.matches) return;
    const [yaw,pitch]=aheadAngles();
    const turn=Math.atan2(Math.sin(yaw-headYaw),Math.cos(yaw-headYaw));
    headYaw+=clamp(turn,-delta*1.15,delta*1.15);
    headPitch=mix(headPitch,pitch,1-Math.exp(-1.55*delta));
  }

  function tick(now) {
    frame=null;
    let state=player.snapshot();
    const delta=Math.min(.10,Math.max(0,(now-lastFrameTime)/1000));
    lastFrameTime=now;
    if (viewMode==='first-person') {
      const forward=Number(travelKeys.has('w')||travelKeys.has('arrowup'));
      const backward=Number(travelKeys.has('s')||travelKeys.has('arrowdown'));
      const left=Number(travelKeys.has('a')||travelKeys.has('arrowleft'));
      const right=Number(travelKeys.has('d')||travelKeys.has('arrowright'));
      if (inDemo()) advanceDemo(now,delta,state);
      else if (trailTransition) advanceTrailTransition(delta);
      else {
        walkFrame=walking.step(delta,forward-backward || Number(autoWalk),reducedMotion.matches,fastPace?2.5:1);
        if (walkFrame.atEnd) autoWalk=false;
        updateLocation(now);
        if (autoWalk && compressTrail.checked && !state.running && !state.audioError && !pointers.size
          && now-lastManualLook>1500 && walkFrame.distance-location.start>=8) shortenTrail(true);
      }
      state=player.snapshot();
      if (right!==left) {
        markManualLook(now);
        headYaw+=(right-left)*delta*1.45;
      }
      updateGaze(now,delta,state);
      followRoad(now,delta);
    } else {
      positionCamera(now);
    }
    if (renderAvailable) {
      const view=camera(state);
      renderScene(now,state,view);
      updateFeatureMarker(state,view);
    } else featureMarker.hidden=true;
    ambience.sync(viewMode==='first-person'?location:notesIndex,
      state.unlocked && state.enabled && demoMode!=='paused',state.running);
    updatePlaybackUI(state);
    updateWalkUI();
    updateJourneyUI();
    if (state.running || gazeTurn?.manual || trailTransition || (demoMode==='playing' && demoTransition) || flight || travelKeys.size || (viewMode==='first-person' && (autoWalk || walkFrame.moving))
      || (renderAvailable && !reducedMotion.matches && !state.ended && now-selectedAt<15000)) invalidate();
  }
  function resize() {
    const ratio=Math.min(devicePixelRatio||1,1.28);
    canvas.width=Math.max(1,Math.round(canvas.clientWidth*ratio));
    canvas.height=Math.max(1,Math.round(canvas.clientHeight*ratio));
    invalidate();
  }

  function takeControl() {
    flight=null;
  }
  function markManualLook(now=performance.now()) {
    manualCue=lastCue;
    gazeTurn=null;
    lastManualLook=now;
  }
  function takeStep(metres) {
    stopDemo();
    trailTransition=null;
    autoWalk=false;
    unlockNarration();
    walking.impulse(metres);
  }
  function unlockNarration() {
    ambience.unlock();
    player.unlock();
  }
  function rotate(dx,dy) {
    if (viewMode==='first-person') {
      if (!dx && !dy) return;
      markManualLook();
      headYaw+=dx*.006;
      headPitch=clamp(headPitch-dy*.005,-1.44,1.48);
    } else {
      orbit.yaw-=dx*.0085;
      orbit.pitch=clamp(orbit.pitch+dy*.007,-.65,1.48);
    }
  }
  function pan(dx,dy) {
    const {right,up}=camera();
    const sensitivity=orbit.distance/Math.max(1,canvas.clientHeight);
    const target=add(orbit.target,scale(add(scale(right,-dx),scale(up,dy)),sensitivity));
    orbit.target=[clamp(target[0],-240,240),clamp(target[1],-5,125),clamp(target[2],-280,240)];
  }
  function zoom(factor) {
    orbit.distance=clamp(orbit.distance*factor,3.8,195);
  }

  canvas.addEventListener('contextmenu',event=>event.preventDefault());
  canvas.addEventListener('pointerdown',event=>{
    if (event.pointerType==='mouse' && ![0,1,2].includes(event.button)) return;
    if (viewMode==='first-person') markManualLook();
    else takeControl();
    canvas.focus({preventScroll:true});
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,pan:event.button!==0});
    event.preventDefault();
  });
  canvas.addEventListener('pointermove',event=>{
    const pointer=pointers.get(event.pointerId);
    if (!pointer) return;
    const peer=[...pointers.entries()].find(([id])=>id!==event.pointerId)?.[1];
    const dx=event.clientX-pointer.x;
    const dy=event.clientY-pointer.y;
    if (peer) {
      const previous=Math.hypot(pointer.x-peer.x,pointer.y-peer.y);
      const current=Math.hypot(event.clientX-peer.x,event.clientY-peer.y);
      if (viewMode==='first-person') {
        if (previous>8 && current>8) takeStep(Math.log(current/previous)*5);
        rotate(dx*.36,dy*.36);
      } else {
        if (previous>8 && current>8) zoom(previous/current);
        pan(dx*.5,dy*.5);
      }
    } else if (viewMode==='orbit' && (pointer.pan || event.shiftKey)) {
      pan(dx,dy);
    } else {
      rotate(dx,dy);
    }
    pointer.x=event.clientX;
    pointer.y=event.clientY;
    invalidate();
  });
  canvas.addEventListener('lostpointercapture',event=>pointers.delete(event.pointerId));
  canvas.addEventListener('wheel',event=>{
    event.preventDefault();
    const multiplier=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
    const scroll=clamp(event.deltaY*multiplier,-150,150);
    if (viewMode==='first-person') takeStep(-scroll*.0045);
    else {
      takeControl();
      zoom(Math.exp(scroll*.0018));
    }
    invalidate();
  },{passive:false});
  window.addEventListener('keydown',event=>{
    if (viewMode!=='first-person' || event.altKey || event.ctrlKey || event.metaKey
      || event.target.closest?.('input,textarea,select,[contenteditable]')) return;
    const key=event.key.toLowerCase();
    if (key==='shift') {
      fastPace=true;
      return;
    }
    if (!['w','s','a','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) return;
    if (key.startsWith('arrow') && event.target!==canvas) return;
    event.preventDefault();
    if (travelKeys.size===0) lastFrameTime=performance.now();
    if (['w','s','arrowup','arrowdown'].includes(key)) {
      stopDemo();
      trailTransition=null;
      autoWalk=false;
      unlockNarration();
    } else markManualLook();
    travelKeys.add(key);
    invalidate();
  });
  window.addEventListener('keyup',event=>{
    const key=event.key.toLowerCase();
    travelKeys.delete(key);
    if (key==='shift') fastPace=false;
  });
  function haltWalk() {
    travelKeys.clear();
    trailTransition=null;
    autoWalk=false;
    fastPace=false;
    walkFrame=walking.reset(0,walkFrame.position);
  }
  window.addEventListener('blur',()=>{
    haltWalk();
    invalidate();
  });
  document.addEventListener('visibilitychange',()=>{
    if (!document.hidden) return;
    haltWalk();
    if (demoMode==='playing') {
      demoMode='paused';
      if (player.snapshot().running) player.toggle();
      invalidate();
    }
  });
  canvas.addEventListener('webglcontextlost',()=>{
    renderAvailable=false;
    report('三维渲染已中断，重新加载网页可继续。');
  });

  for (const [index,scene] of scenes.entries()) {
    const button=document.createElement('button');
    button.type='button';
    button.className='chapter';
    const number=document.createElement('small');
    number.textContent=String(index+1).padStart(2,'0');
    const name=document.createElement('span');
    name.textContent=scene.short;
    button.append(number,name);
    button.addEventListener('click',()=>inspectScene(index));
    chapterList.append(button);
  }
  player=window.createShuRoadLocationPlayer({
    audio:get('narration'),
    clips,
    onChange:invalidate
  });
  function resetView() {
    if (viewMode==='first-person') {
      [headYaw,headPitch]=aheadAngles();
      headFov=61;
      markManualLook();
    } else {
      moveTo(poses[notesIndex],performance.now());
    }
    invalidate();
  }
  function updateViewMode() {
    const first=viewMode==='first-person';
    document.body.dataset.viewMode=viewMode;
    const modeButton=get('view-mode');
    modeButton.setAttribute('aria-pressed',String(!first));
    modeButton.textContent=first?'切换全景':'切回第一视角';
    get('camera-hint').textContent=first?'W / S 行走 · Shift 快行 · 拖动环顾':'拖动旋转 · 滚轮缩放 · 右键平移';
    const touchHint=get('touch-camera-hint');
    if (touchHint) touchHint.textContent=first?'拖动环顾 · 前行或停步':'单指旋转 · 双指缩放和平移';
    canvas.setAttribute('aria-label',first?'第一视角，拖动环顾，按住 W 或 S 连续走路，松开停步。':'全景视角，拖动旋转，滚轮缩放，右键拖动平移。');
  }
  get('reset-view').addEventListener('click',resetView);
  featureMarker.addEventListener('click',()=>{
    const view=camera();
    const cue=currentFeature(player.snapshot(),view.eye);
    if (!cue) return;
    if (viewMode==='first-person') {
      markManualLook();
      aimAt(cue.target,true,cue.fov);
      lastFrameTime=performance.now();
    } else {
      orbit=fromView({eye:view.eye,target:cue.target});
      flight=null;
    }
    invalidate();
  });
  get('view-mode').addEventListener('click',()=>{
    stopDemo();
    haltWalk();
    markManualLook();
    viewMode=viewMode==='first-person'?'orbit':'first-person';
    updateViewMode();
    if (viewMode==='orbit') {
      updateNotes(active);
      resetView();
    }
    else {
      flight=null;
      invalidate();
    }
  });
  walkButton.addEventListener('click',()=>{
    stopDemo();
    trailTransition=null;
    autoWalk=!autoWalk;
    if (autoWalk) unlockNarration();
    updateWalkUI();
    invalidate();
  });
  backButton.addEventListener('click',()=>{
    takeStep(-.65);
    invalidate();
  });
  shortcutButton.addEventListener('click',()=>shortenTrail());
  playButton.addEventListener('click',()=>{
    if (inDemo()) {
      if (player.snapshot().running) player.toggle();
      stopDemo();
      return;
    }
    ambience.unlock();
    player.toggle();
  });
  demoButton.addEventListener('click',toggleDemo);
  explainButton.addEventListener('click',()=>{
    ambience.unlock();
    const state=player.snapshot();
    if (state.explaining && !state.ended) player.poem();
    else player.explain();
  });
  journeyProgress.max=journey.length;
  updateNotes(0);
  updateViewMode();
  player.arrive(0);
  new ResizeObserver(resize).observe(canvas);
  resize();
})();
