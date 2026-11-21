const IMMORTAL_LANTERN_STOP = {
  x: -6.5,
  z: 27.4,
  dock: {x:-8.8, y:1.18, z:27.4, heading:0},
  approach: [-13.1, 1.5, 27.4],
  route: [],
  targets: [[-6.4,2.54,28.73],[-4.96,2.61,28.73],[-3.52,2.66,28.73]],
  taps: [[-6.54,2.55,28.52],[-5.1,2.62,28.52],[-3.66,2.67,28.52]]
};

function buildImmortalLanternStop(api) {
  const {mat, oval, rod, box, pillar, loop, polyline, rng, mesh, object, shape, collider=()=>{}}=api;
  const {x,z,dock,targets,taps}=IMMORTAL_LANTERN_STOP;
  const identity=shape([0,0,0],[1,1,1]), tau=2*Math.PI, random=rng(0x76aed);
  const stone=["222d48","32445e","405974","557287"].map(color=>mat(color,.14));
  const jade=["314b54","395560","466875"].map(color=>mat(color,.21));
  const river=["293f65","384e80","485f96","6980aa"].map(color=>mat(color,.14,.14));
  const brass=mat("bd9463",.38,.16), gold=mat("edbc77",.45,.29), oxidized=mat("516b77",.31);
  const warm=mat("d8a478",.23,.33), black=mat("243547",.15);
  const aqua=mat("a1d6db",.23,.61), lilac=mat("bcabd7",.22,.42), frosted=mat("7d9dba",.22,.26);
  const blueGlass=mat("5d768a",.52,.025), roseGlass=mat("765878",.49,.025), moonGlass=mat("8b929d",.52,.025);

  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  const at=(center,dx,dy,dz)=>add(center,[dx,dy,dz]);

  function triangles(faces,finish,out=[0,1,0]) {
    const vertices=[],indices=[];
    for(const face of faces) {
      const [a,b,c]=face;
      const n=cross(subtract(b,a),subtract(c,a)), magnitude=Math.hypot(...n);
      if(magnitude<1e-8)continue;
      const direction=typeof out==="function"?out(a,b,c):out;
      const sign=dot(n,direction)<0?-1:1, normal=n.map(v=>v/magnitude*sign);
      const index=vertices.length/6;
      for(const p of face)vertices.push(...p,...normal);
      indices.push(index,index+1,index+2);
    }
    if(indices.length)object(mesh(vertices,indices),identity,finish);
  }

  function ringFaces(a,b) {
    const faces=[];
    for(let i=0;i<a.length;i++) {
      const j=(i+1)%a.length;
      faces.push([a[i],b[i],a[j]],[a[j],b[i],b[j]]);
    }
    return faces;
  }

  function solid(type,cx,cz,rx,rz,yMin,yMax,kind,surface=false) {
    collider({type,x:cx,z:cz,rx,rz,yMin,yMax,kind,surface});
  }

  function quayCliff() {
    const levels=[[-8.85,.068,.72,.1],[-6.75,.31,.55,.44],[-4.9,.52,.31,.34],
      [-3.12,.74,.08,.22],[-1.32,.87,.05,.12],[-.22,.95,-.08,0],[.88,1,0,0]];
    const rings=levels.map(([y,s,dx,dz],level)=>Array.from({length:24},(_,i)=>{
      const a=i*tau/24, rib=1+.085*Math.cos(a*5)+.045*Math.sin(a*11);
      return [x+dx+Math.cos(a)*5.09*s*rib,
        y+(level===levels.length-1?0:Math.sin(i*1.62+level*.61)*.23),
        z+dz+Math.sin(a)*2.79*s*rib];
    }));
    for(let level=1;level<rings.length;level++) {
      const groups=stone.map(()=>[]);
      for(const [i,face] of ringFaces(rings[level],rings[level-1]).entries()) {
        const layer=Math.min(3,Math.max(0,Math.floor(level*.53)+(i%9===0?1:0)-(i%6===0?1:0)));
        groups[layer].push(face);
      }
      for(const [i,faces] of groups.entries())triangles(faces,stone[i],a=>[a[0]-x,0,a[2]-z]);
    }
    const cap=rings.at(-1);
    triangles(cap.map((p,i)=>[[x,.88,z],p,cap[(i+1)%cap.length]]),stone[2]);
    collider({type:"rock",kind:"灯河渡台浮岛",x,z,rx:5.7,rz:3.3,yMin:levels[0][0],yMax:.88,
      outline:cap.map(p=>[p[0],p[2]]),surface:true,
      sections:levels.map(([y,s,dx,dz])=>({y,x:x+dx,z:z+dz,rx:4.84*s,rz:2.64*s}))});
    for(const [cx,cz,height,rx,rz] of [[-12.08,24.55,-.19,.83,.72],[-1.73,25.5,-.58,.94,.82],[-.56,24.3,-2.2,.50,.46]]) {
      pillar([cx,height-1.4,cz],[rx,1.4,rz],stone[2],6,1.83);
      pillar([cx,height-.08,cz],[rx*1.04,.09,rz*1.04],jade[1],8,.88);
      solid("ellipse",cx,cz,rx,rz,height-2.7,height,"星河浮砾",true);
    }
  }

  function deck() {
    const xMin=-11.48, xMax=-2.43, zMin=25.88, zMax=29.62;
    const centerX=(xMin+xMax)*.5, centerZ=(zMin+zMax)*.5;
    const halfX=(xMax-xMin)*.5, halfZ=(zMax-zMin)*.5;
    box([centerX,dock.y-.17,centerZ],[halfX,.17,halfZ],jade[0]);
    box([centerX,dock.y-.27,centerZ],[halfX+.07,.035,halfZ+.07],oxidized);
    solid("box",centerX,centerZ,halfX,halfZ,dock.y-.34,dock.y,"灯河渡台",true);
    const panelWidth=(xMax-xMin)/18;
    for(let i=0;i<18;i++) {
      const px=xMin+(i+.5)*panelWidth;
      box([px,dock.y-.021,centerZ],[panelWidth*.46,.023,halfZ-.098],jade[i%3]);
      if(i%2===0)box([px,dock.y-.014,zMax+.018],[.074,.11,.060],brass);
    }
    for(const side of [-1,1]) {
      const zz=centerZ+side*(halfZ-.12);
      rod([xMin,dock.y+.016,zz],[xMax,dock.y+.016,zz],.016,gold);
      rod([xMin,dock.y+.019,zz-side*.13],[xMax,dock.y+.019,zz-side*.13],.007,warm);
    }
    for(const [i,[px,,pz]] of targets.entries()) {
      const y=dock.y+.019;
      loop([px-.27,y,pz-.54],[.44,.018,.29],brass,"y",.052);
      const diamond=[[px-.54,y,pz-.54],[px-.27,y,pz-.72],[px,y,pz-.54],[px-.27,y,pz-.36]];
      polyline([...diamond,diamond[0]],.012,i===2?lilac:gold);
      for(const side of [-1,1])oval([px-.27,y,pz-.54+side*.218],[.028,.014,.028],aqua);
    }
    for(let i=0;i<16;i++) {
      const px=-14.41+i*.186, top=.96+i*(.22/15);
      box([px,top-.044,dock.z],[.091,.044,1.03],jade[i%3],.07);
      solid("box",px,dock.z,.099,1.03,top-.093,top,"迎灯云桥",true);
    }
    for(const side of [-1,1]) {
      const zz=dock.z+1.035*side;
      rod([-14.51,.95,zz],[xMin,dock.y-.012,zz],.025,brass);
      for(let i=0;i<3;i++){
        const px=-14.33+i*.91, y=.97+i*.070;
        rod([px,y,zz],[px,y+.24,zz],.035,jade[0]);
        oval([px,y+.24,zz],[.045,.036,.046],gold);
      }
    }
  }

  function starRiver() {
    const samples=Array.from({length:49},(_,i)=>{
      const u=i/48;
      return [-16.8+18*u,.22+.20*Math.sin(u*tau*.93),24.58-1.52*Math.sin(u*Math.PI)+.55*Math.sin(u*tau)];
    });
    for(let band=0;band<5;band++) {
      const offset=(band-2)*.31, slices=[];
      for(let i=0;i<samples.length-1;i++) {
        const width=.24+.16*Math.sin(Math.PI*i/(samples.length-1));
        const a=at(samples[i],0,.011*band,offset),b=at(samples[i+1],0,.011*band,offset);
        slices.push([at(a,0,0,-width),at(a,0,0,width),at(b,0,0,-width)],
          [at(a,0,0,width),at(b,0,0,width),at(b,0,0,-width)]);
      }
      triangles(slices,river[band===2?3:band%3]);
    }
    for(const [offset,finish] of [[-.62,lilac],[-.28,aqua],[.23,frosted],[.65,aqua]]) {
      const points=samples.map((p,i)=>at(p,0,.071+Math.sin(i*.54)*.029,offset+.052*Math.sin(i*.37+offset)));
      polyline(points,.013,finish);
    }
    for(let i=0;i<46;i++) {
      const p=samples[Math.floor(random()*samples.length)],f=.025+random()*.052;
      const star=at(p,(random()-.5)*.35,.12+random()*.31,(random()-.5)*1.56);
      oval(star,[f*1.18,f*.68,f],i%5===0?warm:i%3===0?lilac:aqua);
      if(i%9===0) {
        rod(at(star,-.089,0,0),at(star,.089,0,0),.008,aqua);
        rod(at(star,0,-.073,0),at(star,0,.073,0),.008,lilac);
      }
    }
  }

  function inscription() {
    const cx=-5.00, zFace=25.89, y=2.91;
    for(const side of [-1,1]) {
      const px=cx+side*1.16;
      pillar([px,1.27,zFace-.07],[.151,.104,.128],jade[0],6);
      rod([px,1.31,zFace-.07],[px,y+.25,zFace-.07],.065,black);
      rod([px,y+.18,zFace-.07],[px+side*.19,y+.45,zFace-.07],.032,gold);
      oval([px+side*.19,y+.45,zFace-.07],[.050,.043,.043],warm);
      solid("ellipse",px,zFace-.07,.079,.073,1.18,y+.26,"灯河牌柱");
    }
    box([cx,y,zFace],[1.02,.247,.062],gold);
    box([cx,y,zFace+.060],[.982,.214,.007],black);
    const glyphs=[
      [[[.13,.57],[.10,.43]],[[.27,.82],[.25,.46],[.11,.18]],[[.44,.63],[.27,.43],[.44,.24]],[[.50,.67],[.89,.67]],[[.72,.66],[.72,.20],[.59,.23]]],
      [[[.12,.77],[.23,.71]],[[.08,.56],[.21,.49]],[[.17,.23],[.26,.43]],[[.37,.72],[.91,.72]],[[.79,.71],[.79,.22],[.67,.24]],[[.42,.56],[.64,.56],[.64,.34],[.43,.34],[.42,.56]]],
      [[[.43,.78],[.51,.65]],[[.20,.63],[.80,.63],[.83,.51]],[[.30,.53],[.32,.34],[.23,.23]],[[.43,.49],[.76,.49]],[[.58,.49],[.58,.31],[.47,.24],[.37,.22]],[[.64,.39],[.77,.25]]]
    ];
    for(const [index,glyph] of glyphs.entries())for(const stroke of glyph) {
      const left=cx-.77+index*.52;
      polyline(stroke.map(([a,b])=>[left+a*.47,y-.204+b*.40,zFace+.071]),.010,gold);
    }
    const eaves=[];
    for(let i=0;i<13;i++){
      const t=i/12-.5;
      eaves.push([cx+t*2.37,y+.31+Math.abs(t)**2*.24,zFace+.09]);
    }
    polyline(eaves,.031,brass);
  }

  function stem(center,index) {
    const [cx,y,cz]=center, floor=dock.y;
    pillar([cx,floor+.036,cz],[.32,.036,.32],jade[0],8);
    pillar([cx,floor+.101,cz],[.275,.038,.275],brass,8,.82);
    pillar([cx,floor+.17,cz],[.189,.049,.186],oxidized,8,.71);
    rod([cx,floor+.17,cz],[cx,y-.34,cz],.071,black);
    for(const h of [.29,.42,.79])pillar([cx,floor+h,cz],[.099,.029,.10],index===1?warm:brass,8,.95);
    pillar([cx,y-.343,cz],[.26,.054,.255],brass,8,1.11);
    pillar([cx,y-.272,cz],[.311,.031,.304],jade[0],8,.95);
    loop([cx,y-.235,cz],[.265,.022,.257],gold,"y",.078);
    solid("ellipse",cx,cz,.145,.135,floor,y-.25,"法宝灯灯座");
  }

  function lotusLamp(center) {
    for(let i=0;i<8;i++) {
      const a=i*tau/8+.11, radial=[Math.cos(a),0,Math.sin(a)], across=[-radial[2],0,radial[0]];
      const p=(dist,dy,lateral)=>[center[0]+radial[0]*dist+across[0]*lateral,center[1]+dy,
        center[2]+radial[2]*dist+across[2]*lateral];
      const base=p(.18,-.245,0), lowLeft=p(.31,-.125,-.106),lowRight=p(.31,-.125,.106);
      const crest=p(.401,.006,0), tip=p(.396,.158,0);
      triangles([[base,lowLeft,crest],[base,crest,lowRight],[lowLeft,tip,crest],[crest,tip,lowRight]],
        i%2===0?roseGlass:lilac,radial);
      polyline([base,lowLeft,tip,lowRight,base],.014,brass);
      rod(base,crest,.012,warm);
    }
    oval(center,[.143,.169,.144],roseGlass);
    loop(at(center,0,-.094,0),[.16,.018,.16],brass,"y",.085);
    oval(at(center,0,.163,0),[.071,.064,.069],warm);
  }

  function starCasket(center) {
    const ringPoints=(r,dy,turn=.25)=>Array.from({length:6},(_,i)=>{
      const a=i*tau/6+turn;
      return at(center,Math.cos(a)*r,dy,Math.sin(a)*r);
    });
    const feet=ringPoints(.306,-.223), shoulder=ringPoints(.285,.204), roof=ringPoints(.098,.404);
    polyline([...feet,feet[0]],.022,brass);
    polyline([...shoulder,shoulder[0]],.022,gold);
    triangles(ringFaces(shoulder,roof),jade[1]);
    polyline([...roof,roof[0]],.019,gold);
    for(let i=0;i<feet.length;i++) {
      rod(feet[i],shoulder[i],.021,brass);
      const corner=at(shoulder[i],(shoulder[i][0]-center[0])*.20,.065,(shoulder[i][2]-center[2])*.20);
      polyline([shoulder[i],corner,at(corner,0,.052,0)],.017,warm);
    }
    oval(center,[.151,.181,.151],blueGlass);
    pillar(at(center,0,.448,0),[.069,.049,.069],brass,6,.26);
    oval(at(center,0,.524,0),[.047,.047,.047],aqua);
    loop(at(center,0,-.134,0),[.174,.02,.170],oxidized,"y",.069);
  }

  function crescentLamp(center) {
    const outer=[],inner=[];
    for(let i=0;i<=32;i++) {
      const a=-1.17+4.53*i/32;
      const taper=Math.sin(Math.PI*i/32)**.79;
      outer.push(at(center,Math.cos(a)*.474,Math.sin(a)*.481,.025));
      inner.push(at(center,Math.cos(a)*(.474-.158*taper),Math.sin(a)*(.481-.159*taper),.025));
    }
    const faces=[];
    for(let i=0;i<outer.length-1;i++)
      faces.push([outer[i],inner[i],outer[i+1]],[outer[i+1],inner[i],inner[i+1]]);
    triangles(faces,brass,[0,0,1]);
    polyline(outer,.019,gold);
    polyline(inner,.015,gold);
    loop(at(center,0,.001,.023),[.358,.359,.094],oxidized,"z",.041);
    loop(at(center,0,.001,.038),[.245,.237,.062],brass,"z",.059);
    oval(center,[.151,.168,.150],moonGlass);
    rod(at(center,0,-.265,0),at(center,0,-.171,0),.020,brass);
    rod(at(center,0,.170,0),at(center,0,.238,.014),.020,gold);
    for(const angle of [-.82,1.13,2.31]) {
      const p=at(center,Math.cos(angle)*.398,Math.sin(angle)*.396,.041);
      oval(p,[.045,.045,.034],angle<0?warm:aqua);
    }
  }

  quayCliff();
  deck();
  starRiver();
  inscription();
  for(const [i,center] of targets.entries()) {
    stem(center,i);
    [lotusLamp,starCasket,crescentLamp][i](center);
    const button=taps[i];
    rod(at(center,0,-.240,0),at(button,0,-.105,.022),.025,brass);
    oval(button,[.067,.061,.063],i===0?roseGlass:i===1?blueGlass:moonGlass);
    loop(at(button,0,0,.011),[.083,.078,.04],gold,"z",.092);
  }
  return [];
}
