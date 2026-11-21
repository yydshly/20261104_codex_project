window.buildShuRoadWorldExtras = ({
  world, quad, triangle, beam, mountain, pine, vapor, add, sub, scale, cross, unit,
  clamp, mix, blend, ease, hash, tau, rock, wood, leaf, water, fabric, skin, straw, route, cascade, cliff, fall,entranceFoot
}) => {
  const snow = 9;
  const amber = 10;
  const ink = 11;
  const slate = 12;

  function ellipsoid(mesh,p,radii,material,yaw=0,rings=7,sides=12) {
    const rotate=v=>[v[0]*Math.cos(yaw)+v[2]*Math.sin(yaw),v[1],v[2]*Math.cos(yaw)-v[0]*Math.sin(yaw)];
    const rows=Array.from({length:rings+1},(_,j)=>Array.from({length:sides},(_,i)=>{
      const latitude=Math.PI*j/rings,a=tau*i/sides;
      const v=[Math.cos(a)*Math.sin(latitude),Math.cos(latitude),Math.sin(a)*Math.sin(latitude)];
      return {p:add(p,rotate(v.map((x,k)=>x*radii[k]))),n:unit(rotate(v.map((x,k)=>x/radii[k])))};
    }));
    for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){
      const k=(i+1)%sides,a=rows[j][i],b=rows[j+1][i],c=rows[j+1][k],d=rows[j][k];
      quad(mesh,a.p,b.p,c.p,d.p,material,[[i/sides,j/rings],[i/sides,(j+1)/rings],[(i+1)/sides,(j+1)/rings],[(i+1)/sides,j/rings]],
        [a.n,b.n,c.n,d.n]);
    }
  }

  function block(mesh, x, y, z, w, h, d, material) {
    const a = [x-w/2,y,z-d/2], b = [x+w/2,y,z-d/2];
    const c = [x+w/2,y,z+d/2], e = [x-w/2,y,z+d/2];
    const top = p => add(p,[0,h,0]);
    const A=top(a), B=top(b), C=top(c), E=top(e);
    quad(mesh,A,E,C,B,material);
    quad(mesh,e,c,C,E,material);
    quad(mesh,b,a,A,B,material);
    quad(mesh,a,e,E,A,material);
    quad(mesh,c,b,B,C,material);
  }

  function boulder(mesh, p, size, seed, material = rock, rotation = 0) {
    const [sx,sy,sz] = size;
    if (material===skin) {
      const rings=Array.from({length:6},(_,j)=>{
        const latitude=Math.PI*j/5;
        return Array.from({length:9},(_,i)=>{
          const angle=tau*i/9+rotation;
          return add(p,[Math.cos(angle)*Math.sin(latitude)*sx,Math.cos(latitude)*sy,
            Math.sin(angle)*Math.sin(latitude)*sz]);
        });
      });
      for (let j=0;j<5;j++) for (let i=0;i<9;i++) {
        quad(mesh,rings[j][i],rings[j+1][i],rings[j+1][(i+1)%9],rings[j][(i+1)%9],material);
      }
      return;
    }
    const vertices = Array.from({length:7},(_,index) => {
      const a = index*tau/7+rotation;
      return add(p,[Math.cos(a)*sx*(.77+hash(seed+index)*.32),sy*(hash(seed+index*3)-.5)*.43,
        Math.sin(a)*sz*(.80+hash(seed*2+index)*.36)]);
    });
    const topRing=vertices.map((v,i)=>[
      p[0]+(v[0]-p[0])*(.53+hash(seed+i+8)*.15),
      p[1]+sy*(.58+hash(seed+i+17)*.17),
      p[2]+(v[2]-p[2])*.60
    ]);
    const bottom = add(p,[-sx*.12,-sy*.72,-sz*.13]);
    for (let i=0;i<vertices.length;i++) {
      const next=vertices[(i+1)%vertices.length];
      quad(mesh,vertices[i],topRing[i],topRing[(i+1)%vertices.length],next,material);
      triangle(mesh,topRing[i],add(p,[0,sy*.74,0]),topRing[(i+1)%vertices.length],material);
      triangle(mesh,vertices[i],next,bottom,material);
    }
  }

  function ground(cx, cz, width, depth, elevation, surface, material = rock, columns = 22, rows = 20) {
    const grid = Array.from({length:rows+1},(_,j) => Array.from({length:columns+1},(_,i) => {
      const x=cx+width*(i/columns-.5), z=cz+depth*(j/rows-.5);
      return [x,elevation+surface(x,z),z];
    }));
    for (let j=0;j<rows;j++) {
      for (let i=0;i<columns;i++) quad(world,grid[j][i],grid[j+1][i],grid[j+1][i+1],grid[j][i+1],material);
    }
    return (x,z)=>{
      const col=clamp((x-cx)/width+.5,0,.999999)*columns;
      const row=clamp((z-cz)/depth+.5,0,.999999)*rows;
      const i=Math.floor(col),j=Math.floor(row),u=col-i,v=row-j;
      const a=grid[j][i][1],b=grid[j+1][i][1],c=grid[j+1][i+1][1],d=grid[j][i+1][1];
      return v>=u ? a*(1-v)+b*(v-u)+c*u : a*(1-u)+c*v+d*(u-v);
    };
  }

  // Squared shoulders and near-vertical striations distinguish the gate from the pointed ranges.
  function rockWall(x,z,h,w,d,seed,base=-8) {
    const sides=20, layers=16;
    const points=Array.from({length:layers+1},(_,row) => {
      const t=row/layers;
      return Array.from({length:sides},(_,column) => {
        const a=column*tau/sides;
        const rough= .88+hash(seed+column*2)*.23 + Math.sin(t*41+column)*.035;
        const taper=1-.24*t-.25*Math.pow(t,7);
        const profile=c=>Math.sign(c)*Math.pow(Math.abs(c),.62);
        return [x+w*taper*rough*profile(Math.cos(a))+w*.13*t*t,
          base+h*t+t*t*(2+Math.sin(a*3+seed)*3),z+d*taper*rough*profile(Math.sin(a))];
      });
    });
    for (let j=0;j<layers;j++) {
      for (let i=0;i<sides;i++) {
        const next=(i+1)%sides;
        quad(world,points[j][i],points[j+1][i],points[j+1][next],points[j][next],rock);
      }
    }
    const crown=[x+w*.13,base+h+3,z];
    for (let i=0;i<sides;i++) triangle(world,points[layers][i],crown,points[layers][(i+1)%sides],rock);
    return (height,angle,offset=0)=>{
      const row=clamp(height,0,.999)*layers;
      const column=((angle%tau+tau)%tau)/tau*sides;
      const lower=Math.floor(row), a=Math.floor(column), b=(a+1)%sides;
      const edge=blend(blend(points[lower][a],points[lower][b],column-a),
        blend(points[lower+1][a],points[lower+1][b],column-a),row-lower);
      return add(edge,[Math.cos(angle)*offset,0,Math.sin(angle)*offset]);
    };
  }

  const taibai=mountain(-115,-72,131,37,52,-8);
  const taibaiAnchor=taibai(.985,.35,.18);
  const emei=mountain(305,-105,315,85,5,6,-16,1.5);
  const emeiAnchor=emei(.94,-1.10,.28);
  for (let ring=0;ring<8;ring++) {
    for (let wedge=0;wedge<28;wedge++) {
      const angle = wedge*tau/28;
      const next = (wedge+1)*tau/28;
      const start = a => .74+.055*Math.sin(a*7)+.030*Math.sin(a*13+1);
      const height = (a, row) => mix(start(a),.999,row/8);
      quad(world,taibai(height(angle,ring),angle,.19),taibai(height(next,ring),next,.19),
        taibai(height(next,ring+1),next,.19),taibai(height(angle,ring+1),angle,.19),snow);
    }
  }

  const openingGround=(x,z)=>.30*Math.sin(x*.37)+.45*Math.cos(z*.39);
  const openingSurface=ground(-119,69,58,50,-6,openingGround);
  rockWall(-132,57,36,12,12,5);
  rockWall(-107,53,41,10,14,11);
  rockWall(-140,38,31,11,14,7);
  rockWall(-101,36,34,11,14,16);
  const openingPath=[];
  const ladderStart=[-110,-5,86], ladderEnd=[-120,18,55];
  const stairCount=104;
  for (let i=0;i<stairCount;i++) {
    const p=blend(ladderStart,ladderEnd,i/(stairCount-1));
    block(openingPath,p[0],p[1],p[2],1.82,i<49?.235:.19,.42,i<49 ? rock : wood);
    if (i<49) {
      const next=blend(ladderStart,ladderEnd,(i+1)/(stairCount-1));
      for (const side of [-1,1]) {
        const crown=add(p,[side*.93,-.06,0]);
        const nextCrown=add(next,[side*.93,-.06,0]);
        const base=[p[0]+side*2.1,openingSurface(p[0]+side*2.1,p[2]),p[2]];
        const nextBase=[next[0]+side*2.1,openingSurface(next[0]+side*2.1,next[2]),next[2]];
        quad(openingPath,crown,base,nextBase,nextCrown,rock);
      }
    }
    if (i>=49 && i%8===0) {
      beam(openingPath,add(p,[-.86,-.13,0]),add(p,[.1,-1.65,-.65]),.11,.13,wood);
      beam(openingPath,add(p,[.86,-.13,0]),add(p,[.1,-1.65,-.65]),.11,.13,wood);
    }
  }
  for (const edge of [-1,1]) {
    const offset=[edge*.82,-.13,0];
    beam(openingPath,add(blend(ladderStart,ladderEnd,.45),offset),add(ladderEnd,offset),.15,.15,wood);
  }
  const passPath=[ladderEnd,[-120.4,18.2,50],[-118.3,18.7,44],[-114.2,19.8,38]];
  for (let i=0;i<passPath.length-1;i++) {
    const a=passPath[i], b=passPath[i+1];
    const span=scale(unit(cross(sub(b,a),[0,1,0])),.86);
    quad(openingPath,sub(a,span),add(a,span),add(b,span),sub(b,span),wood);
    const footing=blend(a,b,.5);
    beam(openingPath,add(a,[0,-.18,0]),add(b,[0,-.18,0]),.14,.14,wood,6);
    beam(openingPath,footing,add(a,[0,-1.4,0]),.105,.14,wood,5);
  }
  for (let i=0;i<26;i++) {
    const x=mix(-139,-100,hash(i*5+4)), z=mix(57,80,hash(i*9+2));
    const s=mix(.42,2.05,hash(i+39));
    boulder(world,[x,-5.25,z],[s,s*.74,s*.82],i);
  }
  const openingWorkers=[[-108,86.8],[-109.1,88.5],[-111,89.7],[-112.6,91.0],[-108.2,91.0]]
    .map(([x,z])=>[x,openingSurface(x,z)+.015,z]);
  const legendFigures=[.42,.82].map((progress,i)=>{
    const foot=entranceFoot(progress),side=3.4+i*.85;
    const p=add(foot,[-side,.14+(side-1.25)/8.35*1.96,0]);
    block(world,p[0],p[1]-.10,p[2],.88,.20,.88,rock);
    return add(p,[0,.1,0]);
  });
  const legendAnchor=add(blend(legendFigures[0],legendFigures[1],.5),[0,1.1,0]);

  const riverX = z => 110+9.4*Math.sin((z-32)*.067)+3.3*Math.sin(z*.13);
  const riverY = z => -3.8-.026*(z-4);
  const riverWidth = z => 11.4+2.5*Math.sin(z*.12+1.2);
  function currentPoint(z,side) {
    return [riverX(z)+riverWidth(z)*side,riverY(z),z];
  }
  const riverLength=132, riverStart=-8, riverSteps=98;
  for (let i=0;i<riverSteps;i++) {
    const a=riverStart+i*riverLength/riverSteps, b=a+riverLength/riverSteps;
    quad(world,currentPoint(a,-1),currentPoint(b,-1),currentPoint(b,1),currentPoint(a,1),water,
      [[0,i/riverSteps*1.8],[0,(i+1)/riverSteps*1.8],[1,(i+1)/riverSteps*1.8],[1,i/riverSteps*1.8]]);
    for (const side of [-1,1]) {
      const bank=(z,level) => {
        const point=currentPoint(z,side);
        return add(point,[side*level*14,level*(7+3*Math.sin(z*.21+side))-.10,0]);
      };
      quad(world,bank(a,0),bank(b,0),bank(b,1),bank(a,1),rock);
      quad(world,bank(a,1),bank(b,1),bank(b,2),bank(a,2),rock);
    }
  }
  rockWall(87,29,39,11,17,18);
  rockWall(132,33,42,10,14,30);
  rockWall(140,57,27,10,12,34);
  rockWall(81,60,27,9,16,4);
  const apeWallCenter=[113,91];
  const visibleApeCrag=rockWall(apeWallCenter[0],apeWallCenter[1],14,3.2,4.0,49);
  const apeAnchor=visibleApeCrag(.70,1.03,.08);
  const rapidsAnchor=add(currentPoint(98,-.72),[0,.18,0]);
  rockWall(95,1,51,15,14,44);
  rockWall(123,1,46,11,14,20);
  vapor(110,-2,33,25,40);
  for (let i=0;i<14;i++) {
    const z=mix(13,103,hash(i+3));
    const point=currentPoint(z,hash(i*4+2)*1.50-.75);
    const s=mix(.7,2.5,hash(i*8+6));
    boulder(world,add(point,[0,-.6,0]),[s,s*.66,s*.84],i+9);
  }

  const forestY=(x,z)=>-2.7+1.0*Math.cos((x+85)*.13)+.58*Math.sin(z*.28);
  ground(-100,-12,94,100,0,(x,z)=>{
    const edge=Math.max(0,(-109-x)/29,(x+58)/7,(-36-z)/24,(z-13)/19);
    return forestY(x,z)-14*clamp(edge)**1.5;
  },leaf,28,25);
  const forestCrag=rockWall(-109,-36,38,14,12,12);
  const forestCliffAnchor=forestCrag(.63,.56,.28);
  rockWall(-83,-43,30,10,11,29);
  for (let i=0;i<16;i++) {
    const x=mix(-106,-60,hash(i*12+9)), z=mix(-35,9,hash(i*4+7));
    if (x>-86 && x<-73 && z>-.8) continue;
    pine([x,forestY(x,z),z],mix(4.5,12,hash(i*3+19)),i*11+29);
  }
  // Old trees frame the moon without filling the open air where the paired birds pass.
  function bareTree(p,h,seed) {
    const shoulder=add(p,[h*.12,h*.62,-h*.10]);
    const crown=add(p,[h*.03,h,h*.03]);
    beam(world,p,shoulder,h*.075,h*.048,ink,6);
    beam(world,shoulder,crown,h*.047,h*.009,ink,5);
    for (let i=0;i<6;i++) {
      const angle=i*2.4+seed;
      const length=h*mix(.25,.56,hash(seed+i));
      const start=blend(p,crown,.43+i*.073);
      const tip=add(start,[Math.cos(angle)*length,h*.30,Math.sin(angle)*length]);
      const elbow=add(blend(start,tip,.65),[0,-h*.10,0]);
      beam(world,start,elbow,h*.022,h*.010,ink,5);
      beam(world,elbow,tip,h*.010,h*.004,ink,4);
      const twig=add(tip,[Math.cos(angle+1.4)*length*.30,h*.08,Math.sin(angle+1.4)*length*.30]);
      beam(world,elbow,twig,h*.008,h*.003,ink,4);
    }
  }
  bareTree([-91,forestY(-91,-3),-3],15,4);
  bareTree([-68,forestY(-68,-18),-18],11,22);
  const perchBase=[-81.2,forestY(-81.2,3.6),3.6];
  const cuckooAnchor=add(perchBase,[1.35,1.60,.45]);
  beam(world,perchBase,add(perchBase,[.24,2.0,-.10]),.12,.028,wood,7);
  beam(world,add(perchBase,[.17,1.29,0]),add(cuckooAnchor,[.18,-.08,.1]),.055,.018,wood,5);

  function fern(p,size,seed) {
    for(let frond=0;frond<5;frond++) {
      const a=frond*tau/5+seed;
      const base=add(p,[0,.05,0]);
      const tip=add(p,[Math.sin(a)*size*.67,size*.56,Math.cos(a)*size*.67]);
      beam(world,base,tip,.007,.002,16,3);
      for(let j=1;j<7;j++) {
        const t=j/7,c=blend(base,tip,t),spread=size*.19*Math.sin(t*Math.PI);
        const lateral=[Math.cos(a)*spread,0,-Math.sin(a)*spread];
        for(const side of [-1,1]) {
          const end=add(add(c,scale(lateral,side)),[Math.sin(a)*size*.075,.025,Math.cos(a)*size*.075]);
          triangle(world,add(c,[0,.018,0]),end,add(c,[Math.sin(a)*size*.10,-.022,Math.cos(a)*size*.10]),21);
        }
      }
    }
  }
  for(let i=0;i<45;i++) {
    const x=mix(-100,-66,hash(i*17+10)),z=mix(-27,3,hash(i*11+6));
    if(Math.hypot(x+80,z-5)<3.3 || Math.hypot(x-cuckooAnchor[0],z-cuckooAnchor[2])<1.0)continue;
    fern([x,forestY(x,z)+.025,z],.36+hash(i+32)*.52,i*1.7);
  }

  const dangling=fall(.84,-.40,.40);
  const fallenTip=add(dangling,[-2.4,-5.8,2.15]);
  const pineAnchor=blend(dangling,fallenTip,.56);
  beam(world,dangling,fallenTip,.26,.075,wood,7);
  for (let i=0;i<7;i++) {
    const branch=blend(dangling,fallenTip,.25+i*.105);
    const sign=i%2===0 ? 1 : -1;
    const tip=add(branch,[sign*mix(.65,2.0,hash(i+8)),-1.1,1.0+i*.11]);
    beam(world,branch,tip,.084,.014,wood,5);
    for (let j=0;j<3;j++) {
      const p=blend(branch,tip,.50+j*.20);
      if (j===0) triangle(world,add(p,[-.14,-.12,.07]),add(p,[0,.25,.10]),add(p,[.14,-.19,-.11]),straw);
    }
  }
  const impactAnchor=add(cascade(.65,.5),[-.65,.20,1.15]);
  boulder(world,add(impactAnchor,[.6,-1.3,-.6]),[3.1,1.5,2.4],71,rock);
  const poolY=impactAnchor[1]-.27;
  for(let i=0;i<32;i++) {
    const a=i*tau/32,b=(i+1)*tau/32;
    triangle(world,[impactAnchor[0],poolY,impactAnchor[2]],
      [impactAnchor[0]+Math.sin(a)*2.4,poolY,impactAnchor[2]+Math.cos(a)*1.6],
      [impactAnchor[0]+Math.sin(b)*2.4,poolY,impactAnchor[2]+Math.cos(b)*1.6],water,
      [[.5,.5],[.5+Math.sin(a)*.5,.5+Math.cos(a)*.5],[.5+Math.sin(b)*.5,.5+Math.cos(b)*.5]]);
  }
  for(let i=0;i<6;i++) {
    const a=i*2.38,p=add(impactAnchor,[Math.sin(a)*(1.1+hash(i)*1.4),-.49,Math.cos(a)*1.5]);
    boulder(world,p,[.44+hash(i+8)*.6,.37+hash(i+3)*.4,.45+hash(i+29)*.6],i+26,rock);
  }

  const gateSurface=ground(129,-89,61,54,-5,(x,z)=>.22*Math.sin(x*.8)*Math.cos(z*.2));
  const guardFoot=[129.25,gateSurface(129.25,-89.7)+.015,-89.7];
  rockWall(106,-98,53,15,18,6);
  rockWall(150,-104,59,17,17,13);
  rockWall(95,-122,60,16,17,3);
  rockWall(158,-127,53,13,18,26);
  rockWall(111,-126,45,14,13,16);
  rockWall(138,-134,57,14,19,27);

  function roof(x,y,z,w,d,rise,material=slate) {
    const ridgeA=[x-w*.44,y+rise,z], ridgeB=[x+w*.44,y+rise,z];
    const eave=(side,end)=>[x+side*w*.59,y+.28,z+end*d*.59];
    const hip=(side,end)=>[x+side*w*.52,y+.01,z+end*d*.35];
    quad(world,eave(-1,1),eave(1,1),ridgeB,ridgeA,material);
    quad(world,eave(1,-1),eave(-1,-1),ridgeA,ridgeB,material);
    triangle(world,eave(-1,1),ridgeA,hip(-1,0),material);
    triangle(world,hip(-1,0),ridgeA,eave(-1,-1),material);
    triangle(world,eave(1,-1),ridgeB,hip(1,0),material);
    triangle(world,hip(1,0),ridgeB,eave(1,1),material);
    beam(world,ridgeA,ridgeB,.15,.15,material,5);
  }

  // The Tang texts establish the pass, but do not give a gatehouse elevation.
  // A low stone closure and timber gate are shown as one possible arrangement.
  const gateZ=-91.4;
  for (const side of [-1,1]) {
    for (let course=0;course<6;course++) {
      const inset=course%2*.40;
      for (let stone=0;stone<8;stone++) {
        const x=128+side*(2.49+stone*1.17+inset);
        const y=-5.25+course*.43;
        const z=gateZ+side*.24+Math.sin(stone*.9)*.38;
        const height=.42+hash(course*9+stone+side)*.05;
        const depth=2.12-course*.10;
        block(world,x,y,z,1.20,height,depth,rock);
      }
    }
    const jamb=128+side*1.92;
    block(world,jamb,-5.2,gateZ,.58,3.14,1.54,rock);
    block(world,128+side*1.62,-5.05,gateZ+.26,.19,2.93,.28,wood);
    // Open leaves sit against the jambs, leaving the passage readable.
    for (let board=0;board<6;board++) {
      const x=128+side*(1.52-board*.019);
      block(world,x,-4.99,gateZ-.03-board*.226,.14,2.55,.232,wood);
    }
    for (const y of [-4.47,-2.91]) {
      block(world,128+side*1.48,y,gateZ-.58,.28,.19,1.49,wood);
    }
  }
  block(world,128,-2.24,gateZ+.29,4.21,.27,.52,wood);
  const gateWoodAnchor=[128,-2.10,gateZ+.62];
  const gatePassAnchor=[128.5,1.2,gateZ+1.5];

  const dangerY=(x,z)=>-4.7+.23*Math.sin(x*.78)+.16*Math.sin(z*.68);
  ground(164,-67,46,49,0,dangerY,leaf);
  rockWall(147,-66,18,6,10,1);
  rockWall(182,-67,19,7,14,8);
  rockWall(175,-86,23,8,12,7);
  bareTree([151,dangerY(151,-57),-57],10,4);
  bareTree([173,dangerY(173,-66),-66],11,12);
  bareTree([154,dangerY(154,-78),-78],9,18);
  bareTree([178,dangerY(178,-52),-52],10,26);
  for (let i=0;i<20;i++) {
    const x=mix(145,183,hash(i+37)), z=mix(-86,-45,hash(i*8+10));
    if (x>155 && x<164 && z>-65 && z<-49) continue;
    boulder(world,[x,dangerY(x,z),z],[.5+hash(i)*1.2,.4+hash(i+4)*.8,.55+hash(i+7)*.9],i);
  }
  for(let i=0;i<27;i++) {
    const x=mix(150,179,hash(i*13+29)),z=mix(-82,-52,hash(i*19+4));
    if(Math.hypot(x-160,z+60)<4.3 || Math.hypot(x-167,z+70)<4.8)continue;
    fern([x,dangerY(x,z)+.015,z],.30+hash(i+4)*.37,i);
  }

  const cityMeshStart=world.length;
  const cityOffset=51;
  const plainY=(x,z)=>-4.6+.13*Math.sin(x*.16)*Math.cos(z*.14);
  ground(182,1,196,434,0,(x,z)=>{
    const edge=clamp((109+Math.max(0,36-z)*.20-x)/25);
    const far=clamp((52-z)/48);
    return plainY(x,z)-12*edge*edge+far*(1.35*Math.sin(x*.075)+1.1*Math.sin(z*.079)-1.5);
  },leaf,36,39);
  const city=[154,85];
  const yardBase=-4.3;
  const buildHouse=(x,z,w,d,material) => {
    block(world,x,yardBase,z,w,2.15,d,snow);
    roof(x,yardBase+2.1,z,w,d,1.32,material);
    block(world,x,yardBase,z+d/2+.035,w*.19,1.92,.095,wood);
  };
  // A front gate, repeated courtyards, field parcels and an irrigation cut distinguish the plain.
  for (let i=0;i<16;i++) {
    for (const direction of [-1,1]) {
      const offset=(i-7.5)*3.6;
      if (i!==7 && i!==8 || direction<0) {
        block(world,city[0]+offset,yardBase,city[1]+direction*24,3.58,2.25,1.65,rock);
      }
      block(world,city[0]+direction*29,yardBase,city[1]+offset*.83,1.65,2.25,2.98,rock);
    }
  }
  for (let column=0;column<6;column++) {
    for (let row=0;row<4;row++) {
      if (column===2 || (row===2 && column===3)) continue;
      const x=129+column*10.2+mix(-.55,.55,hash(row*11+column));
      const z=66+row*11.7+mix(-1.1,1.1,hash(column*18+row));
      buildHouse(x,z,6.2+hash(column*15+row)*1.3,4.5+hash(row*5+column),row%3===0 ? wood : slate);
    }
  }
  for (const x of [150.4,157.6]) block(world,x,yardBase,109,2.65,3.2,3.2,rock);
  block(world,154,yardBase+2.8,109,10.0,1.35,3.6,wood);
  roof(154,yardBase+4.15,109,10.4,4.25,2.45);
  for (const x of [151.9,156.1]) {
    beam(world,[x,yardBase+3.32,110.74],[x,yardBase+3.32,111.12],.062,.049,wood,5);
    beam(world,[x,yardBase+3.32,111.05],[x,yardBase+2.68,111.05],.038,.038,wood,5);
    boulder(world,[x,yardBase+2.34,111.05],[.32,.43,.32],31,amber);
    beam(world,[x,yardBase+1.91,111.05],[x,yardBase+1.72,111.05],.055,.028,wood,5);
  }
  const cityRoadTop=yardBase+.24;
  block(world,city[0],cityRoadTop-.12,99.6,3.35,.12,53,snow);
  const cityFoot=position=>[city[0]+cityOffset,cityRoadTop,mix(120,110.4,clamp(position))];
  for (let i=0;i<44;i++) {
    const column=i%11, row=Math.floor(i/11);
    const x=115+column*8.0, z=115+row*6.1;
    const material=[leaf,straw,wood,leaf,snow][Math.floor(hash(i+72)*5)];
    quad(world,[x,-4.33,z],[x,-4.33,z+5.15],[x+7.04,-4.33,z+5.15],[x+7.04,-4.33,z],material);
    if (material!==snow) {
      for (let j=1;j<5;j++) {
        const px=x+j*1.37;
        quad(world,[px,-4.30,z],[px,-4.30,z+5.15],[px+.10,-4.30,z+5.15],[px+.10,-4.30,z],wood);
      }
    }
  }
  for (let j=0;j<30;j++) {
    const a=54+j*2.95, b=a+2.95;
    const bank=(z,side)=>[190+Math.sin((z-60)*.072)*3.4+side*1.55,-4.28,z];
    quad(world,bank(a,-1),bank(b,-1),bank(b,1),bank(a,1),water);
  }
  for (let i=0;i<9;i++) {
    const x=112+i*9.8;
    pine([x,plainY(x,57),57],1.5+hash(i)*1.2,i*4+51);
  }
  for (let i=cityMeshStart;i<world.length;i+=9) world[i]+=cityOffset;

  function actor(mesh, p, s, material, time, gesture = 0,pose={}) {
    const yaw=pose.yaw||0,settle=pose.settle||0,walking=pose.walking||0;
    const breath=Math.sin(time*1.8+(pose.seed||0))*.008;
    const offset=(x,y,z)=>add(p,[(x*Math.cos(yaw)+z*Math.sin(yaw))*s,y*s,(-x*Math.sin(yaw)+z*Math.cos(yaw))*s]);
    const torsoPoint=(x,y,z)=>offset(x,y-settle*.69+breath,z+Math.max(0,y-.8)*settle*.58);
    const swing=Math.sin(time*3.7)*walking;
    for (const side of [-1,1]) {
      const knee=offset(side*.14,.49-settle*.27,.035+settle*.28+side*swing*.09);
      const ankle=offset(side*.18,.10,side*swing*.14);
      beam(mesh,torsoPoint(side*.13,.91,0),knee,s*.10,s*.075,material,7);
      beam(mesh,knee,ankle,s*.075,s*.052,material,6);
      ellipsoid(mesh,add(ankle,[0,-.045*s,.06*s]),[.083*s,.055*s,.16*s],ink,yaw,4,8);
      const elbow=torsoPoint(side*.34,1.15+gesture*.10,.13-side*swing*.08);
      const wrist=torsoPoint(side*(.28-gesture*.15),.98+gesture*.42,.25+settle*.13);
      beam(mesh,torsoPoint(side*.205,1.43,.02),elbow,s*.084,s*.066,material,7);
      beam(mesh,elbow,wrist,s*.066,s*.045,material,6);
      ellipsoid(mesh,wrist,[s*.049,s*.073,s*.037],skin,yaw,4,8);
    }
    const torso=[[.68,.235,.145],[.96,.19,.13],[1.18,.175,.13],[1.43,.225,.12],[1.49,.17,.105]];
    for (let row=1;row<torso.length;row++) {
      const [y0,w0,d0]=torso[row-1], [y1,w1,d1]=torso[row];
      for (let side=0;side<8;side++) {
        const a=side*tau/8,b=(side+1)*tau/8;
        quad(mesh,torsoPoint(Math.cos(a)*w0,y0,Math.sin(a)*d0),
          torsoPoint(Math.cos(b)*w0,y0,Math.sin(b)*d0),
          torsoPoint(Math.cos(b)*w1,y1,Math.sin(b)*d1),
          torsoPoint(Math.cos(a)*w1,y1,Math.sin(a)*d1),material);
      }
    }
    beam(mesh,torsoPoint(0,1.47,.015),torsoPoint(0,1.59,.015),s*.068,s*.067,skin,7);
    ellipsoid(mesh,torsoPoint(0,1.68,.02),[s*.105,s*.125,s*.102],skin,yaw);
    ellipsoid(mesh,torsoPoint(0,1.64,.114),[s*.027,s*.031,s*.033],skin,yaw,4,8);
    for(const side of [-1,1])ellipsoid(mesh,torsoPoint(side*.037,1.70,.107),[s*.012,s*.008,s*.009],ink,yaw,3,6);
    beam(mesh,torsoPoint(0,1.005,0),torsoPoint(0,1.04,0),s*.196,s*.194,wood,8);
    beam(mesh,torsoPoint(.10,1.41,.137),torsoPoint(-.12,.99,.143),s*.012,s*.012,wood,4);
    if (material===fabric) {
      beam(mesh,torsoPoint(0,1.795,.02),torsoPoint(0,1.835,.02),s*.30,s*.105,straw,12);
    }
    return {hand:torsoPoint(.09,1.20+gesture*.17,.27),head:torsoPoint(0,1.68,.02)};
  }

  function travelerBody({foot,forward,right,time,rest,speed}) {
    const mesh=[],f=unit([forward[0],0,forward[2]]),r=[-f[2],0,f[0]];
    const at=(x,y,z)=>add(add(add(foot,scale(r,x)),scale(f,z)),[0,y,0]);
    const hips=.86-rest*.33,shoulder=1.39-rest*.35;
    for(const side of [-1,1]) {
      const step=Math.sin(time*7)*Math.min(.09,speed*.055)*side;
      const knee=at(side*.13,.47-rest*.18,.09+rest*.22+step);
      beam(mesh,at(side*.13,hips,0),knee,.095,.07,fabric,7);
      beam(mesh,knee,at(side*.16,.12,.09+step),.07,.055,fabric,7);
      ellipsoid(mesh,at(side*.16,.055,.16+step),[.09,.06,.18],ink,Math.atan2(f[0],f[2]),4,8);
    }
    beam(mesh,at(0,hips-.13,0),at(0,shoulder-.04,.025),.23,.20,fabric,9);
    beam(mesh,at(0,hips+.10,0),at(0,hips+.135,0),.225,.22,wood,9);
    for(const side of [-1,1]) {
      const elbow=at(side*.28,1.02-rest*.22,.16);
      const hand=at(mix(side*.25,side===1?.025:-.22,rest),mix(.83,side===1?1.04:.73,rest),mix(.23,side===1?.27:.36,rest));
      beam(mesh,at(side*.19,shoulder,.025),elbow,.08,.062,fabric,8);
      beam(mesh,elbow,hand,.061,.038,fabric,7);
      ellipsoid(mesh,hand,[.047,.064,.026],skin,Math.atan2(f[0],f[2]),5,8);
      for(let finger=0;finger<4;finger++) {
        const a=add(hand,scale(r,(finger-1.5)*.018));
        beam(mesh,a,add(add(a,[0,-.045,0]),scale(f,.022)),.009,.006,skin,5);
      }
    }
    return mesh;
  }

  function bird(mesh, point, size, yaw, flap, material, crane=false) {
    const forward=[Math.sin(yaw),0,Math.cos(yaw)], side=[Math.cos(yaw),0,-Math.sin(yaw)];
    const at=(x,y,z)=>add(point,add(scale(side,x*size),add([0,y*size,0],scale(forward,z*size))));
    ellipsoid(mesh,point,[size*.13,size*.115,size*.29],material,yaw,5,10);
    for (const sign of [-1,1]) {
      const shoulder=at(sign*.11,0,.08);
      const wrist=at(sign*.53,.02+flap*.28,.04);
      const tip=at(sign*1.02,-.03+flap*.47,-.29);
      const base=at(sign*.13,-.014,-.26);
      triangle(mesh,shoulder,wrist,base,material);
      triangle(mesh,wrist,tip,base,material);
      triangle(mesh,tip,at(sign*.72,flap*.28,-.48),base,material);
      for(let feather=0;feather<5;feather++) {
        const t=feather/5;
        const root=blend(wrist,tip,t);
        const end=add(root,add(scale(side,sign*size*.055),scale(forward,-size*(.15+t*.07))));
        triangle(mesh,root,end,blend(wrist,tip,Math.min(1,t+.16)),crane?ink:material);
      }
    }
    if (crane) {
      beam(mesh,at(0,0,.14),at(0,.10,.54),size*.066,size*.037,material,5);
      ellipsoid(mesh,at(0,.104,.54),[size*.062,size*.061,size*.09],snow,yaw,4,8);
      triangle(mesh,at(-.036,.088,.56),at(0,.074,.78),at(.036,.088,.56),amber);
      for (const sign of [-1,1]) beam(mesh,at(sign*.04,-.04,-.16),at(sign*.095,-.10,-.70),size*.012,size*.008,ink,4);
    } else {
      triangle(mesh,at(-.06,.02,-.05),at(.08,.02,-.05),at(.01,-.03,-.48),material);
    }
  }

  function perchedBird(mesh,time) {
    const p=cuckooAnchor,yaw=-.62+Math.sin(time*.55)*.12;
    const f=[Math.sin(yaw),0,Math.cos(yaw)],s=[Math.cos(yaw),0,-Math.sin(yaw)];
    const at=(x,y,z)=>add(p,add(scale(s,x),add([0,y,0],scale(f,z))));
    ellipsoid(mesh,at(0,.13,0),[.092,.125,.16],18,yaw,6,10);
    ellipsoid(mesh,at(0,.25,.105),[.065,.069,.073],18,yaw,5,10);
    for(const sign of [-1,1]) {
      ellipsoid(mesh,at(sign*.063,.13,-.035),[.035,.081,.14],ink,yaw,4,8);
      beam(mesh,at(sign*.032,.025,.025),at(sign*.035,-.08,.035),.009,.006,ink,4);
      beam(mesh,at(sign*.035,-.08,.035),at(sign*.035,-.08,.085),.006,.003,ink,4);
      ellipsoid(mesh,at(sign*.058,.267,.142),[.009,.010,.010],amber,0,3,6);
    }
    triangle(mesh,at(-.034,.06,-.06),at(.035,.06,-.06),at(.025,-.02,-.34),ink);
    const call=Math.pow(Math.max(0,Math.sin(time*4.7)),8)*.024;
    beam(mesh,at(0,.25,.16),at(0,.248+call,.221),.021,.002,ink,5);
    beam(mesh,at(0,.239,.16),at(0,.239-call,.214),.015,.002,amber,4);
  }

  function serpent(mesh, path, length, thickness, body, count = 21) {
    let previous=path(0);
    for (let i=1;i<=count;i++) {
      const t=i/count, point=path(t);
      beam(mesh,previous,point,thickness*mix(1,.20,(i-1)/count),thickness*mix(1,.20,t),body,5);
      previous=point;
    }
    const head=path(0);
    const forward=unit(sub(head,path(.055)));
    const snout=add(head,scale(forward,length));
    boulder(mesh,head,[thickness*1.25,thickness*.92,thickness*1.24],28,body);
    beam(mesh,head,snout,thickness,thickness*.51,body,6);
    for (const direction of [-1,1]) {
      const side=scale(unit(cross(forward,[0,1,0])),direction*thickness*.7);
      boulder(mesh,add(add(head,side),[0,thickness*.40,0]),[thickness*.25,thickness*.23,thickness*.25],4,amber);
    }
    return {head, forward};
  }

  function dragon(mesh, angle, time, index) {
    const center=[108,42,14];
    const radius=10.8+index*.64;
    const path=t => {
      const a=angle-t*(.43+index*.022);
      const r=radius+Math.sin(t*13-time*2.1)*(.28+t*.45);
      return add(center,[Math.cos(a)*r,Math.sin(a)*r*.78,Math.sin(t*8-time*1.1)*2.2+index*.55]);
    };
    const {head,forward}=serpent(mesh,path,1.25,.42+index*.019,amber,13);
    const side=unit(cross(forward,[0,1,0]));
    for (const direction of [-1,1]) {
      const base=add(head,add(scale(side,direction*.29),[0,.23,0]));
      beam(mesh,base,add(base,add(scale(side,direction*.22),[0,.75,0])),.087,.026,snow,4);
    }
    for(let i=1;i<9;i++) {
      const p=path(i/10);
      const up=add(p,[0,.55,0]);
      triangle(mesh,add(p,[-.19,0,0]),up,add(p,[.19,0,0]),snow);
    }
    for(const t of [.24,.66])for(const sign of [-1,1]) {
      const p=path(t),elbow=add(p,scale(side,sign*.7));
      const claw=add(elbow,[0,-.6,.3]);
      beam(mesh,p,elbow,.14,.10,amber,5);
      beam(mesh,elbow,claw,.10,.07,amber,5);
      for(let toe=0;toe<3;toe++)beam(mesh,claw,add(claw,[(toe-1)*.13,-.17,.2]),.035,.009,snow,4);
    }
  }

  function ape(mesh,time) {
    const normal=unit([apeAnchor[0]-apeWallCenter[0],0,apeAnchor[2]-apeWallCenter[1]]),side=cross(normal,[0,1,0]);
    const center=add(add(apeAnchor,scale(normal,.28)),[0,Math.sin(time*1.1)*.10,0]);
    const at=(x,y,z)=>add(add(add(center,scale(side,x)),scale(normal,z)),[0,y,0]);
    ellipsoid(mesh,at(0,-.28,0),[.20,.35,.17],18,0,7,12);
    ellipsoid(mesh,at(0,.19,.04),[.15,.17,.14],18,0,6,12);
    ellipsoid(mesh,at(0,.16,.15),[.092,.10,.055],skin,0,5,10);
    for (const side of [-1,1]) {
      const reach=Math.pow(Math.max(0,Math.sin(time*.95+side*1.7)),3)*.16;
      const elbow=at(side*.31,.06+reach*.6,-.04);
      const hand=at(side*.37,.43+reach,-.25);
      beam(mesh,at(side*.16,-.01,0),elbow,.066,.045,18,7);
      beam(mesh,elbow,hand,.045,.030,18,7);
      ellipsoid(mesh,hand,[.043,.06,.025],skin,0,4,8);
      const knee=at(side*.23,-.65,.05),foot=at(side*.26,-.87,-.23);
      beam(mesh,at(side*.12,-.51,0),knee,.079,.048,18,7);
      beam(mesh,knee,foot,.048,.028,18,6);
      ellipsoid(mesh,foot,[.04,.07,.034],skin,0,4,8);
      ellipsoid(mesh,at(side*.054,.21,.193),[.012,.013,.009],ink,0,3,6);
    }
    let old=at(0,-.55,-.02);
    for(let i=1;i<=9;i++) {
      const p=at(Math.sin(i*.33+time*.4)*.10,-.55-i*.10,-.02+i*.014);
      beam(mesh,old,p,.032-i*.0025,.029-i*.0025,18,5);old=p;
    }
  }

  function predator(mesh,p,yaw,size,time,tiger,speed=.5,travelled=0) {
    const forward=[Math.sin(yaw),0,Math.cos(yaw)], side=[Math.cos(yaw),0,-Math.sin(yaw)];
    const at=(x,y,z)=>add(p,add(scale(side,x*size),add([0,y*size,0],scale(forward,z*size))));
    const base=tiger ? 17 : 18;
    const breath=Math.sin(time*1.6)*.012;
    const backbone=[[-.98,.54],[-.66,.56],[-.29,.46],[.05,.52],[.43,.68],[.75,.53],[.94,.34]];
    const sides=12;
    const rings=backbone.map(([z,r]) => Array.from({length:sides},(_,j)=> {
      const a=j*tau/sides;
      return at(Math.cos(a)*r*.74,1.11+breath+Math.sin(a)*r,z);
    }));
    for (let i=0;i<rings.length-1;i++) {
      for (let j=0;j<sides;j++) {
        const material=tiger && j>6 && j<11 ? snow : base;
        const a=j*tau/sides,b=(j+1)*tau/sides;
        const normals=[a,a,b,b].map((angle,k)=>unit(add(scale(side,Math.cos(angle)),[0,Math.sin(angle),k===0||k===3?-.04:.04])));
        quad(mesh,rings[i][j],rings[i+1][j],rings[i+1][(j+1)%sides],rings[i][(j+1)%sides],material,
          [[j/sides,i/6],[j/sides,(i+1)/6],[(j+1)/sides,(i+1)/6],[(j+1)/sides,i/6]],normals);
      }
    }
    for (const leg of [-1,1]) {
      for (const end of [-1,1]) {
        const cycle=(travelled/(size*.93)+(leg===end?0:.5)+(end<0?.13:0))%1;
        const stance=.66;
        const swing=cycle>stance?(cycle-stance)/(1-stance):0;
        const stride=cycle<=stance?mix(.29,-.29,cycle/stance):mix(-.29,.29,ease(swing));
        const stepHeight=Math.sin(swing*Math.PI)*.13*Math.min(1,speed*3);
        const hip=at(leg*.31,1.00+breath,end*.63);
        const foot=at(leg*.36,.065+stepHeight,end*.69+stride);
        foot[1]=dangerY(foot[0],foot[2])+size*(.065+stepHeight);
        const axis=unit(sub(foot,hip)),distance=Math.hypot(...sub(foot,hip));
        const length=.58*size,projection=distance*.5;
        const bendSign=end<0?1:-1;
        const bend=unit(sub(scale(forward,bendSign),scale(axis,(axis[0]*forward[0]+axis[2]*forward[2])*bendSign)));
        const knee=add(add(hip,scale(axis,projection)),scale(bend,Math.sqrt(Math.max(.001,length*length-projection*projection))));
        beam(mesh,hip,knee,size*.135,size*.082,base,8);
        beam(mesh,knee,foot,size*.082,size*.052,base,7);
        ellipsoid(mesh,add(foot,scale(forward,.045*size)),[size*.10,size*.062,size*.155],base,yaw,4,8);
      }
      if(tiger)ellipsoid(mesh,at(leg*.23,1.62,.94),[size*.115,size*.13,size*.062],ink,yaw,5,8);
      else triangle(mesh,at(leg*.21,1.53,.89),at(leg*.25,1.96,.84),at(leg*.11,1.56,1.10),base);
    }
    ellipsoid(mesh,at(0,1.40,.97),[size*.30,size*.29,size*.31],base,yaw,7,12);
    ellipsoid(mesh,at(0,1.26,1.23),[size*.21,size*.135,size*(tiger?.22:.31)],tiger?snow:base,yaw,5,10);
    ellipsoid(mesh,at(0,1.30,tiger?1.43:1.56),[size*.092,size*.06,size*.05],ink,yaw,4,8);
    const jawOpen=.014+Math.pow(Math.max(0,Math.sin(time*1.7)),5)*.018;
    beam(mesh,at(0,1.19-jawOpen,1.17),at(0,1.18-jawOpen,tiger?1.40:1.51),size*.10,size*.07,ink,6);
    for(const sign of [-1,1]) {
      ellipsoid(mesh,at(sign*.22,1.46,1.16),[size*.036,size*.033,size*.027],amber,yaw,4,8);
      ellipsoid(mesh,at(sign*.223,1.462,1.184),[size*.013,size*.023,size*.008],ink,yaw,3,6);
      for(let whisker=0;whisker<3;whisker++)beam(mesh,at(sign*.12,1.27+whisker*.025,1.35),at(sign*(.32+whisker*.04),1.27+whisker*.034,1.39),.002,.001,snow,3);
    }
    let old=at(0,1.16,-.85);
    for (let i=1;i<=7;i++) {
      const t=i/7;
      const point=at(Math.sin(t*3+time*2)*.34*t,1.18+(tiger?.5:-.68)*t,-.85-t*(tiger?1.36:.85));
      beam(mesh,old,point,size*mix(.13,.04,(i-1)/7),size*mix(.13,.04,t),tiger&&i%3===0?ink:base,5);
      old=point;
    }
  }

  const extraPoses = {
    0:{eye:[-23,12,74],target:[-36,33,-18]},
    1:{eye:[-99,12,105],target:[-120,15,57]},
    2:{eye:[108,20,107],target:[110,21,38]},
    4:{eye:[-59,12,27],target:[-83,16,-16]},
    6:{eye:[133,8.5,-57],target:[128,3.6,-91]},
    7:{eye:[153,7,-41],target:[163,2.0,-66]},
    8:{eye:[159+cityOffset,29,150],target:[154+cityOffset,2,89]}
  };

  const scenicActors={
    crane:time=>[116+3.8*Math.sin(time*.43),11.5+1.3*Math.cos(time*.43),87+3.5*Math.sin(time*.43*.66)],
    forestBird:(time,i=0)=>{
      const angle=time*.42+i*.60;
      return [-84+5.4*Math.sin(angle),8.3+1.1*Math.cos(angle)+i*.38,-4+3*Math.sin(angle*.74)];
    },
    wolf:(time,i=0)=>{
      const x=166+i*3.2+Math.sin(time*.22+i)*1.15, z=-69-i*2+Math.cos(time*.22+i)*.8;
      return [x,dangerY(x,z)+.70,z];
    },
    tiger:time=>{
      const x=160+Math.sin(time*.24+.7)*1.8,z=-60+Math.cos(time*.24+.7)*1.5;
      return [x,dangerY(x,z)+.87,z];
    },
    workers:time=>add(openingWorkers[1],[0,1.05-.50*ease(clamp((time-2.0)/2.3)),0]),
    ape:time=>add(apeAnchor,[0,Math.sin(time*1.1)*.10,0])
  };
  function heading(path,time) {
    const a=path(time-.04),b=path(time+.04);
    return Math.atan2(b[0]-a[0],b[2]-a[2]);
  }
  function snakePath(time,t) {
    // The body follows the head's earlier path instead of translating sideways as one piece.
    const history=time-t*27.6;
    const x=156.6+Math.sin(history*.22)*.35+Math.sin(t*11-time*1.2)*.08*Math.sin(t*Math.PI);
    const depth=-52.0-history*.105;
    return [x,dangerY(x,depth)+.105+Math.pow(1-t,10)*.19,depth];
  }
  scenicActors.snake=time=>snakePath(time,0);
  function hazeCard(mesh,p,w,h) {
    quad(mesh,add(p,[-w,0,0]),add(p,[w,0,0]),add(p,[w,h,0]),add(p,[-w,h,0]),7);
  }
  function foamArc(mesh,center,radius,angle,width,material=snow) {
    for(let j=0;j<5;j++) {
      const a=angle+j*.14,b=a+.10;
      const at=(t,r)=>add(center,[Math.sin(t)*r,.012,Math.cos(t)*r*.62]);
      quad(mesh,at(a,radius-width),at(a,radius+width),at(b,radius+width),at(b,radius-width),material);
    }
  }

  function extraSceneMesh(index,time,poemProgress=null) {
    const mesh=[];
    mesh.haze=[];
    if (index===0) {
      for (let i=0;i<3;i++) {
        const p=[-47+i*4.8+Math.sin(time*.37+i)*3.9,34+i*2.3+Math.cos(time*.39+i)*1.2,-21+i*2.2];
        bird(mesh,p,.50,.76+time*.12+i*.20,Math.sin(time*3.3+i),ink);
      }
      legendFigures.forEach((p,i)=>{
        actor(mesh,p,1.02,fabric,time*.65,.18,{yaw:.94+i*.3,seed:i});
        beam(mesh,add(p,[.3,.08,.23]),add(p,[.3,1.77,.23]),.023,.017,wood,6);
      });
    } else if (index===1) {
      openingWorkers.forEach((p,i)=>{
        const recoil=ease(clamp((time-1.1-i*.12)/.8));
        const settle=ease(clamp((time-2.0-i*.08)/2.3));
        const gesture=mix(.22+.08*Math.sin(time*2.0+i),.52,recoil)*(1-settle*.52);
        actor(mesh,p,.93,fabric,time,gesture,{yaw:-2.2+i*.16,settle,seed:i});
        const tool=add(p,[.3,.03,.28]);
        beam(mesh,tool,add(tool,[.14,.97,-.07]),.018,.016,wood,5);
        beam(mesh,add(tool,[-.10,.92,-.06]),add(tool,[.37,.96,-.08]),.037,.025,slate,5);
      });
      for (let i=0;i<16;i++) {
        const start=.20+hash(i*9+8)*.85;
        const duration=2.15+hash(i+92)*.45;
        const flight=clamp((time-start)/duration);
        const x=-120+(hash(i*6+1)-.5)*9+flight*(i%2===0?3:-3);
        const z=55+hash(i+1)*5+flight*9;
        const s=mix(.52,2.35,hash(i*3+1));
        const ground=openingSurface(x,z)+s*.62;
        const y=mix(24+hash(i+18)*8,ground,flight*flight);
        boulder(mesh,[x,y,z],[s,s*.82,s*.67],i+35,rock,flight*1.8+i);
      }
      const dust=ease(clamp((time-.55)/1.3))*(1-ease(clamp((time-4.2)/4.0)));
      if(dust>.002)for(let i=0;i<7;i++) {
        const rise=Math.min(time,5)*.95;
        hazeCard(mesh.haze,[-121+i*1.7,-5+rise,63+Math.sin(i)*2],(2.6+i*.3)*dust,(4.5+i*.3)*dust);
      }
    } else if (index===2) {
      ellipsoid(mesh,[108,42,14],[2.6,2.6,2.6],15,0,12,20);
      for (let i=0;i<6;i++) dragon(mesh,i*tau/6+Math.sin(time*.15)*.35,time,i);
      for (let i=0;i<24;i++) {
        const phase=(time*.028+i/24)%1;
        const z=mix(12,104,phase);
        const side=.65*Math.sin(i*4.7+z*.085);
        const at=(dz,dx)=>add(currentPoint(z+dz,side+dx),[0,.13,0]);
        quad(mesh,at(-.46,-.005),at(.54,-.003),at(.36,.011),at(-.39,.008),snow);
      }
      for(let i=0;i<7;i++)foamArc(mesh,rapidsAnchor,.55+i*.28,time*.51+i*.81,.028);
      const flap=Math.sin(time*4.7)*(.25+.75*Math.pow(.5+.5*Math.sin(time*.73),2));
      bird(mesh,scenicActors.crane(time),1.05,heading(scenicActors.crane,time),flap,snow,true);
      ape(mesh,time);
    } else if (index===4) {
      for (let i=0;i<2;i++) {
        const path=t=>scenicActors.forestBird(t,i);
        bird(mesh,path(time),.36,heading(path,time),Math.sin(time*8.4+i*.6)*.82,ink);
      }
      perchedBird(mesh,time);
    } else if (index===5) {
      for (let i=0;i<28;i++) {
        const fallTime=(time*.31+i*.143)%1;
        const p=cascade(mix(.32,.98,fallTime),hash(i*13));
        const s=mix(.018,.065,hash(i*3+8));
        const drift=add(p,[(hash(i*4+1)-.5)*.9,.10,.24+hash(i)*.42]);
        ellipsoid(mesh,drift,[s,s*2.0,s],snow,0,3,5);
      }
      for(let i=0;i<10;i++) {
        const phase=(time*.55+i*.17)%1,a=i*2.4;
        const p=add(impactAnchor,[Math.sin(a)*phase*2.6,Math.sin(phase*Math.PI)*1.8-.1,Math.cos(a)*phase*1.6]);
        const visible=ease(clamp(phase/.15))*(1-ease(clamp((phase-.72)/.28)));
        hazeCard(mesh.haze,p,(.43+.38*phase)*visible,(.75*(1-phase)+.35)*visible);
        foamArc(mesh,add(impactAnchor,[0,-.24,0]),phase*3.6+.3,a+time*.24,.035*visible);
      }
      for(let i=0;i<3;i++) {
        const p=add(impactAnchor,[Math.sin(time*.48+i*2.1)*1.3,-.10+Math.abs(Math.sin(time*1.7+i))*.17,Math.cos(time*.48+i*2.1)*.9]);
        boulder(mesh,p,[.25,.22,.3],i+51,rock,time*.22+i);
      }
    } else if (index===6) {
      actor(mesh,guardFoot,.95,slate,time,.08,{yaw:0});
      ellipsoid(mesh,add(guardFoot,[0,1.72,.02]),[.105,.065,.10],ink,0,5,10);
      const staff=add(guardFoot,[.32,0,.26]);
      beam(mesh,staff,add(staff,[0,2.0,0]),.021,.017,wood,6);
      beam(mesh,add(staff,[0,2.0,0]),add(staff,[0,2.23,0]),.047,.001,slate,5);
    } else if (index===7) {
      {
        for (let i=0;i<2;i++) {
          const p=add(scenicActors.wolf(time,i),[0,-.70,0]);
          const a=time*.22+i;
          predator(mesh,p,Math.atan2(1.15*Math.cos(a),-.8*Math.sin(a)),.56,time+i,false,.22,time*.22);
        }
      }
      const a=time*.24+.7;
      predator(mesh,add(scenicActors.tiger(time),[0,-.87,0]),Math.atan2(1.8*Math.cos(a),-1.5*Math.sin(a)),.70,time,true,.40,time*.40);
      serpent(mesh,t=>snakePath(time,t),.14,.085,18,32);
      const pack=[158.8,dangerY(158.8,-52.9)+.05,-52.9];
      ellipsoid(mesh,add(pack,[0,.21,0]),[.30,.22,.26],fabric,.3,5,8);
      beam(mesh,add(pack,[-.58,.02,.44]),add(pack,[.7,.06,-.32]),.022,.018,wood,6);
      beam(mesh,add(pack,[.66,.06,-.30]),add(pack,[.94,.03,-.48]),.019,.004,wood,5);
    } else if (index===8) {
      actor(mesh,[156+cityOffset,-4.12,113],.91,fabric,time,0,{yaw:-.5});
      bird(mesh,[159+cityOffset+Math.sin(time*.38)*9,13,72],.42,1.4,Math.sin(time*5.2),ink);
    }
    return mesh;
  }

  return {extraSceneMesh, extraPoses, openingPath, cityFoot, apeAnchor, rapidsAnchor, pineAnchor,
    gateWoodAnchor, gatePassAnchor,scenicActors,travelerBody,legendAnchor,forestCliffAnchor,cuckooAnchor,impactAnchor,taibaiAnchor,emeiAnchor};
};
