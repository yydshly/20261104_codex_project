const IMMORTAL_HERB_COVE = {
  x: -27.5,
  z: -1.4,
  dock: {x: -28.70, y: .72, z: -2.80, heading: 0},
  approach: [-34.10, 1.04, -2.80],
  route: [
    {x: -19.8, y: 6.9, z: 8.1},
    {x: -28.7, y: 4.9, z: 8.7},
    {x: -36.2, y: 4.5, z: 6.4},
    {x: -36.5, y: 4.1, z: -2.8}
  ],
  target: [-26.45, 1.12, -2.17],
  waterfall: {x: -23.65, z: 1.9, yTop: 5.30, yBottom: -4.6, width: 3.9}
};

function buildImmortalHerbCove(api) {
  const {mat, oval, rod, box, pillar, loop, polyline, rng, mesh, object, shape, collider = () => {}} = api;
  const {dock, target, waterfall} = IMMORTAL_HERB_COVE;
  const random = rng(761031);
  const tau = Math.PI * 2, identity = shape([0,0,0], [1,1,1]);
  const add = (a,b) => a.map((v,i) => v+b[i]);
  const sub = (a,b) => a.map((v,i) => v-b[i]);
  const scale = (a,s) => a.map(v => v*s);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a.reduce((sum,v,i) => sum+v*b[i], 0);
  const cliff = ["243443","304555","436165","5f7b76","779080"].map(hex => mat(hex,.11));
  const marble = ["526b72","68838a","87a0a0","a0b3a9"].map(hex => mat(hex,.18));
  const moss = ["40574f","55745e","709276","94a576"].map(hex => mat(hex,.08));
  const falling = ["549eab","70bfbe","90d7d0","c5eadd","d9f1e7"].map(hex => mat(hex,.22,.48));
  const brook = ["437c8c","5e9da7","82bcc0"].map(hex => mat(hex,.31,.24));
  const gold = mat("e3b674",.23,.41), light = mat("f9dca6",.25,.84), teal = mat("a7e1ce",.18,.58);
  const iron = mat("334b50",.25,.1), timber = mat("795654",.12), ink = mat("29353e",.11);
  const petals = ["8e728c","c188a2","e9afbe"].map(hex=>mat(hex,.17,.10));

  function drawTriangles(faces, material, out = [0,1,0]) {
    const vertices = [], indices = [];
    for (const [a,b,c] of faces) {
      const normal = cross(sub(b,a), sub(c,a));
      const length = Math.hypot(...normal);
      if (length < 1e-7) continue;
      const direction = typeof out === "function" ? out(a) : out;
      const n = scale(normal, (dot(normal,direction) < 0 ? -1 : 1) / length);
      const index = vertices.length/6;
      for (const point of [a,b,c]) vertices.push(...point,...n);
      indices.push(index,index+1,index+2);
    }
    if (indices.length) object(mesh(vertices,indices),identity,material);
  }

  function strip(a,b) {
    return a.flatMap((point,i) => {
      const j = (i+1)%a.length;
      return [[point,b[i],a[j]],[a[j],b[i],b[j]]];
    });
  }

  function landform(cx,cz,top,rx,rz,depth,phase=0,surface=true) {
    const profile = [[1,.05],[.78,.23],[.57,.44],[.36,.66],[.17,.83],[.07,.96],[0,1]];
    const sections = profile.map(([d,s]) => ({
      y: top-d*depth, x: cx+d*.76*Math.sin(phase+.8), z: cz+d*.42*Math.cos(phase),
      rx: rx*s, rz: rz*s
    }));
    const rings = sections.map(({x,y,z,rx,rz},ring) => Array.from({length:22},(_,i) => {
      const angle = i*tau/22+phase;
      const edge = 1+.083*Math.sin(angle*5+phase)+.028*Math.cos(angle*9+ring*.74);
      return [x+Math.cos(angle)*rx*edge, y+(ring<6?Math.sin(i*1.91+ring*2.2)*.14:0), z+Math.sin(angle)*rz*edge];
    }));
    for (let i=1;i<rings.length;i++) {
      const faces = strip(rings[i],rings[i-1]);
      const slices = cliff.map(() => []);
      for (let j=0;j<faces.length;j++) {
        const tone = Math.min(4,Math.max(0,Math.floor(i*.53+(j%8===0?1:0)-(j%11===0?1:0))));
        slices[tone].push(faces[j]);
      }
      slices.forEach((slice,tone) => drawTriangles(slice,cliff[tone],a => [a[0]-cx,0,a[2]-cz]));
    }
    const cap = rings.at(-1);
    const capFaces = cap.map((p,i) => [[cx,top,cz],p,cap[(i+1)%cap.length]]);
    drawTriangles(capFaces.filter((_,i) => i%4!==1),moss[1]);
    drawTriangles(capFaces.filter((_,i) => i%4===1),moss[2]);
    collider({
      type:"rock",kind:"瀑隐坞浮岩",x:cx,z:cz,rx:rx*1.17,rz:rz*1.17,yMin:top-depth,yMax:top,
      sections,outline:cap.map(p => [p[0],p[2]]),surface
    });
  }

  function solidBox(x,z,rx,rz,yMin,yMax,kind,surface=false) {
    collider({type:"box",kind,x,z,rx,rz,yMin,yMax,surface});
  }

  function blade(a,b,width,material,twist) {
    const axis = sub(b,a), horizontal = Math.hypot(axis[0],axis[2]);
    const side = horizontal > .001 ? [-axis[2]/horizontal,twist,axis[0]/horizontal] : [1,twist,0];
    const mid = add(add(a,scale(axis,.45)),[0,width*.21,0]);
    const ridge = add(mid,[0,width*.19,0]);
    const edgeA = add(mid,scale(side,width)), edgeB = add(mid,scale(side,-width));
    drawTriangles([[a,edgeA,ridge],[edgeA,b,ridge],[a,ridge,edgeB],[edgeB,ridge,b]],material);
  }

  function fern(x,y,z,size,angle) {
    for (let i=0;i<5;i++) {
      const theta = angle+i*2.38, reach = size*(.53+i*.093), height = size*(.52+i*.07);
      const center = t => [x+Math.cos(theta)*reach*t,y+height*Math.sin(t*Math.PI*.68),z+Math.sin(theta)*reach*t];
      const stem = Array.from({length:6},(_,j) => center(j/5));
      polyline(stem,.009*size,moss[0]);
      for (let j=1;j<6;j++) {
        const t = j/6, p = center(t);
        for (const side of [-1,1]) {
          const length = size*(.19+.22*Math.sin(t*Math.PI));
          const vector = theta+side*(1.23-.53*t);
          blade(p,[p[0]+Math.cos(vector)*length,p[1]+.08*size*(1-t),p[2]+Math.sin(vector)*length],
            size*.065*(1-.55*t),moss[(i+j)%2+2],side*.18);
        }
      }
    }
  }

  function orchids(x,y,z,size) {
    for (let i=0;i<4;i++) {
      const direction=i*2.1+size, r=size*(.21+i*.038);
      const top=[x+Math.cos(direction)*r,y+size*(.45+i*.087),z+Math.sin(direction)*r];
      const base=[x,y,z];
      const joint=[(x+top[0])*.5,y+size*.32,(z+top[2])*.5];
      polyline([base,joint,top],.015*size,moss[0]);
      for (let j=0;j<5;j++) {
        const a=j*tau/5+direction, height=top[1]+Math.cos(a)*.036*size;
        const blossom=[top[0]+Math.sin(a)*.088*size,height,top[2]+.036*size];
        oval(blossom,[.087*size,.045*size,.071*size],petals[(i+j)%3],a*.13);
      }
      oval(add(top,[0,0,.071*size]),[.039*size,.04*size,.031*size],gold);
      blade(joint,[joint[0]+Math.sin(direction)*.24*size,joint[1]+.12*size,joint[2]+Math.cos(direction)*.23*size],
        .065*size,moss[2],.21);
    }
  }

  function pine(x,y,z,size) {
    const at=(a,b,c)=>[x+a*size,y+b*size,z+c*size];
    const trunk=[at(0,0,0),at(.15,.47,.05),at(-.07,.95,-.03),at(-.31,1.38,.08),at(-.17,1.77,.12)];
    for (let i=1;i<trunk.length;i++) rod(trunk[i-1],trunk[i],size*(.106-i*.016),timber);
    for (const [j,dx,h,dz,w] of [[1,.68,.84,.13,.52],[2,-.79,1.21,.18,.53],[3,.46,1.58,-.08,.45],[4,-.22,1.80,.12,.40]]) {
      const tip=at(dx,h,dz);
      polyline([trunk[j],at(dx*.62,h-.09,dz*.61),tip],.048*size,timber);
      for (let i=0;i<3;i++) {
        const k=1-.17*i;
        oval(add(tip,[.093*i*size,.061*i*size,-.10*i*size]),[w*k*size,.13*k*size,.29*k*size],moss[i+1],.04*i);
      }
    }
    for (const a of [.15,2.08,4.1]) {
      rod(at(0,.09,0),at(Math.cos(a)*.32,.01,Math.sin(a)*.27),.041*size,timber);
    }
    collider({type:"ellipse",kind:"崖顶苍松",x,z,rx:.105*size,rz:.11*size,yMin:y,yMax:y+size*1.44});
  }

  function terrace() {
    const xMin=-32.17,xMax=-25.76,zMin=-4.2,zMax=-1.36;
    const cx=(xMin+xMax)/2,cz=(zMin+zMax)/2,rx=(xMax-xMin)/2,rz=(zMax-zMin)/2;
    box([cx,.54,cz],[rx,.115,rz],cliff[1]);
    box([cx,.65,cz],[rx,.067,rz],marble[0]);
    for (let i=0;i<15;i++) {
      const width=(xMax-xMin)/15,x=xMin+(i+.5)*width;
      box([x,dock.y-.016,cz],[width*.476,.016,rz-.07],marble[(i%5===2)?2:1]);
      if (i%3===0) {
        for (const side of [-1,1]) {
          const z=cz+side*(rz-.12);
          oval([x,dock.y+.007,z],[.031,.009,.031],gold);
        }
      }
    }
    for (const side of [-1,1]) {
      const z=cz+side*(rz-.02);
      box([cx,dock.y-.013,z],[rx,.017,.046],marble[3]);
      rod([xMin+.09,dock.y+.009,z-side*.022],[xMax-.09,dock.y+.009,z-side*.022],.008,gold);
    }
    solidBox(cx,cz,rx,rz,.425,dock.y,"瀑后石台",true);
    const span=2.32, pieces=19, start=xMin-span;
    const initial=.60, slope=Math.atan2(dock.y-initial,span);
    for (let i=0;i<pieces;i++) {
      const t=i/(pieces-1), x=start+span*(i+.5)/pieces, y=initial+(dock.y-initial)*t;
      const width=1.00+.31*t, half=span/(2*pieces);
      box([x,y-.036,cz],[half*.98,.036,width],marble[i%5===0?2:1],slope);
      solidBox(x,cz,half*1.01,width,y-.09,y,"入坞石桥",true);
    }
    for (const side of [-1,1]) {
      polyline([[start+.15,.577,cz+side*.99],[xMin,dock.y-.018,cz+side*1.31]],.024,gold);
    }
    const [x,,z]=target;
    pillar([x,dock.y+.031,z],[.275,.033,.275],marble[2],12);
    loop([x,dock.y+.072,z],[.245,.016,.245],gold,"y",.046);
    loop([x,dock.y+.069,z],[.137,.013,.137],teal,"y",.045);
    for (let i=0;i<7;i++) {
      const a=i*tau/7;
      oval([x+Math.cos(a)*.229,dock.y+.084,z+Math.sin(a)*.229],[.023,.016,.023],teal);
    }
    // A narrow empty landing for the feet sits in front of the herb marker.
    const step=[dock.x+1.26,dock.y+.011,dock.z+.63];
    const corners=[[-.4,0,-.29],[-.4,0,.29],[.38,0,.29],[.38,0,-.29],[-.4,0,-.29]];
    polyline(corners.map(p=>add(step,p)),.009,teal);
  }

  function stoneArch(x,y,z) {
    const radius=1.53;
    const path = (r,j) => {
      const a=j*Math.PI/16;
      return [x+Math.cos(a)*r,y+1.02+Math.sin(a)*r,z];
    };
    for (const sign of [-1,1]) {
      const px=x+sign*radius;
      box([px,y+.18,z],[.247,.18,.25],cliff[2]);
      box([px,y+.68,z],[.175,.47,.19],marble[1]);
      solidBox(px,z,.21,.24,y,y+1.08,"石环门柱");
    }
    for (let j=0;j<16;j++) {
      const a=path(radius+.18,j),b=path(radius-.19,j),c=path(radius+.18,j+1),d=path(radius-.19,j+1);
      const depth=.164;
      const front=p => add(p,[0,0,depth]), rear=p => add(p,[0,0,-depth]);
      const material=marble[j%4===1?3:2];
      drawTriangles([[front(a),front(b),front(c)],[front(c),front(b),front(d)]],material,[0,0,1]);
      drawTriangles([[rear(a),rear(b),rear(c)],[rear(c),rear(b),rear(d)]],material,[0,0,-1]);
      drawTriangles([[rear(a),front(a),rear(c)],[rear(c),front(a),front(c)]],cliff[3],[0,1,0]);
      drawTriangles([[rear(b),front(b),rear(d)],[rear(d),front(b),front(d)]],cliff[3],[0,-1,0]);
      const center=path(radius,j+.5);
      collider({type:"box",kind:"石环拱楔",x:center[0],z,rx:.235,rz:.166,
        yMin:center[1]-.215,yMax:center[1]+.215});
    }
    const goldLine=Array.from({length:24},(_,i)=>add(path(radius+.205,i*16/23),[0,0,.18]));
    polyline(goldLine,.020,gold);
  }

  function plaque(x,y,z) {
    const letters = [
      [[[.1,.83],[.22,.75]],[[.06,.56],[.21,.48]],[[.05,.17],[.22,.35]],
        [[.37,.91],[.84,.91],[.84,.65],[.37,.65],[.37,.91]],[[.38,.77],[.84,.77]],
        [[.34,.55],[.88,.55]],[[.43,.63],[.43,.44]],[[.75,.63],[.75,.44]],[[.32,.44],[.88,.44]],
        [[.49,.42],[.31,.28]],[[.73,.41],[.91,.28]],[[.61,.37],[.61,.11],[.51,.09]],
        [[.44,.27],[.53,.20]],[[.76,.27],[.68,.18]],[[.48,.17],[.34,.12]],[[.73,.18],[.87,.11]]],
      [[[.1,.91],[.29,.91],[.2,.69],[.31,.50],[.2,.44]],[[.1,.91],[.1,.1]],
        [[.56,.92],[.43,.77]],[[.52,.79],[.88,.79],[.78,.64]],[[.43,.61],[.83,.61],[.83,.45],[.39,.45]],
        [[.44,.53],[.83,.53]],[[.46,.33],[.38,.16]],[[.57,.34],[.57,.14],[.78,.14],[.82,.21]],
        [[.65,.35],[.71,.26]],[[.84,.32],[.93,.18]]],
      [[[.2,.8],[.2,.35]],[[.05,.58],[.35,.58]],[[.03,.25],[.36,.38]],
        [[.59,.88],[.48,.69]],[[.49,.74],[.88,.74],[.85,.46],[.75,.45]],
        [[.5,.67],[.5,.36],[.91,.36],[.87,.14],[.75,.14]],[[.54,.58],[.68,.52]],[[.45,.24],[.73,.24]]]
    ];
    box([x,y,z],[1.16,.328,.073],timber);
    box([x,y,z+.066],[1.10,.282,.014],ink);
    for (const side of [-1,1]) {
      rod([x-1.13,y+side*.303,z+.084],[x+1.13,y+side*.303,z+.084],.019,gold);
      rod([x+side*1.13,y-.30,z+.084],[x+side*1.13,y+.30,z+.084],.016,gold);
      rod([x+side*.86,y+.305,z],[x+side*.86,y+.61,z],.019,iron);
    }
    for (const [i,letter] of letters.entries()) {
      for (const stroke of letter) {
        polyline(stroke.map(([u,v])=>[x+(i-1)*.68+(u-.5)*.53,y+(v-.5)*.51,z+.091]),.012,gold);
      }
    }
  }

  function hangingLantern(x,y,z,size) {
    rod([x,y+size*.34,z],[x,y+size*.69,z],.017,iron);
    oval([x,y,z],[size*.245,size*.315,size*.245],light);
    for (const sign of [-1,1]) {
      pillar([x,y+sign*size*.27,z],[size*.197,size*.038,size*.197],gold,8);
      loop([x,y+sign*size*.15,z],[size*.225,.012,size*.225],gold,"y",.061);
    }
    for (let j=0;j<6;j++) {
      const a=j*tau/6;
      polyline([-.26,0,.26].map(t=>{
        const radius=(.23-.16*Math.abs(t))*size;
        return [x+Math.cos(a)*radius,y+t*size,z+Math.sin(a)*radius];
      }),.011,gold);
    }
    rod([x,y-size*.32,z],[x+.02,y-size*.53,z],.016,gold);
  }

  function fallCurtain() {
    const {x,z,yTop,yBottom,width}=waterfall;
    const columns=14,rows=16;
    const sample=(u,t)=>{
      const slope=t*t, flow=(1-.25*t)*width;
      return [x+(u-.5)*flow+.20*slope+.078*Math.sin(t*21+u*8),
        yTop+(yBottom-yTop)*t+.075*Math.sin(u*27)*Math.sin(t*Math.PI),
        z-.28*Math.exp(-9*t)+.42*slope+.094*Math.sin(u*18+t*6)];
    };
    for (let i=0;i<columns;i++) {
      const faces=[];
      for (let j=0;j<rows;j++) {
        const a=sample(i/columns,j/rows),b=sample((i+1)/columns,j/rows);
        const c=sample(i/columns,(j+1)/rows),d=sample((i+1)/columns,(j+1)/rows);
        faces.push([a,b,c],[c,b,d]);
      }
      drawTriangles(faces,falling[[1,2,0,2,3,1,4,2,0,3,2,1,3,2][i]],[0,0,1]);
    }
    for (let i=0;i<13;i++) {
      const u=(i+.21)/13,start=random()*.43,length=.17+random()*.33;
      const p=Array.from({length:9},(_,j)=>add(sample(u,start+j*length/8),[0,0,.057]));
      polyline(p,.010+random()*.018,falling[i%3===0?4:3]);
    }
    const lip=Array.from({length:15},(_,i)=>add(sample(i/14,0),[0,.035,-.057]));
    polyline(lip,.053,falling[3]);
    const shore=Array.from({length:11},(_,i) => {
      const t=i/10, size=.48+1.12*t;
      return [[x+.48-size,yTop+.037,z-2.33+t*2.12],[x+.44+size,yTop+.037,z-2.33+t*2.12]];
    });
    drawTriangles(shore.slice(1).flatMap(([a,b],i)=>[[a,b,shore[i][0]],[b,shore[i][1],shore[i][0]]]),brook[1]);
    for (let i=0;i<4;i++) {
      const p=shore.map(([a,b],j)=>add(a,add(scale(sub(b,a),.22+i*.18),[0,.009+Math.sin(j*.72)*.003,0])));
      polyline(p,.015,falling[i%2+2]);
    }
    const basin=[x+.17,yBottom-.067,z+.58];
    oval(basin,[width*.71,.138,1.17],brook[1]);
    for (let i=0;i<5;i++) {
      const k=.24+i*.105;
      loop(add(basin,[0,.136+.008*i,0]),[width*k,.025,k*1.93],falling[i%3+1],"y",.034);
    }
    for (let i=0;i<9;i++) {
      const a=random()*tau,s=.29+random()*.52,r=.5+random()*1.25;
      const p=[x+Math.cos(a)*r,yBottom+.02+random()*.41,z+.58+Math.sin(a)*r*.59];
      oval(p,[s,.13+s*.18,s*.61],falling[i%3+2]);
    }
  }

  landform(-27.55,-1.64,.45,6.74,4.40,9.1,.34);
  landform(-23.45,-.10,5.32,2.63,1.73,11.12,1.11,false);
  landform(-22.45,-2.20,3.55,1.82,1.73,6.45,2.57,false);
  landform(-29.37,-5.93,4.65,3.48,1.23,4.52,.15,false);
  landform(-30.55,5.50,-1.70,1.36,1.29,4.96,.79);
  landform(-21.05,5.41,-3.80,1.01,1.02,3.82,1.87);
  terrace();
  stoneArch(-28.44,.48,-4.94);
  plaque(-28.44,2.22,-4.70);
  hangingLantern(-30.37,1.86,-4.66,.72);
  hangingLantern(-26.56,1.86,-4.66,.72);
  fallCurtain();
  pine(-23.61,5.32,-.69,.94);
  pine(-30.81,.45,-4.67,.71);

  for (const [x,y,z,s,a] of [
    [-31.22,.46,-4.72,.95,.22],[-31.84,.43,-.97,.81,.79],[-29.88,.46,-.89,.67,1.71],
    [-27.58,.46,-.94,.61,.48],[-26.03,.49,-4.53,.92,.90],[-25.33,.46,-1.06,.88,2.40],
    [-24.25,5.31,-.57,.94,.42],[-23.12,5.30,-.91,1.06,1.37],[-30.88,-1.71,5.52,.73,.08]
  ]) fern(x,y,z,s,a);
  for (const [x,y,z,s] of [[-31.17,.43,-4.83,.42],[-30.09,.45,-5.01,.34],
    [-25.38,.43,-4.11,.38],[-26.06,.47,-.75,.31],[-24.79,5.31,-.97,.33],[-22.94,5.30,-.71,.29]]) {
    pillar([x,y+s*.32,z],[s,.40*s,s*.75],cliff[3],6,.63);
    oval([x,y+s*.67,z],[s*.72,s*.15,s*.52],moss[3]);
  }
  for (const [x,y,z,s] of [[-31.66,.47,-1.09,.75],[-30.46,.47,-.76,.61],[-27.11,.46,-1.0,.70],
    [-25.03,.46,-1.0,.92],[-24.89,.46,.07,.81],[-24.81,.45,.68,.72],[-26.55,.45,-4.48,.53]]) {
    orchids(x,y,z,s);
  }
  return [];
}
