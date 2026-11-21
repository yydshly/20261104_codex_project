function buildImmortalWorld(api) {
  const {mat, oval, rod, box, pillar, spire, loop, polyline, rng, mesh, object, shape, collider=()=>{}} = api;
  const cellSize = 30;
  const TAU = Math.PI * 2;
  const identity = shape([0,0,0], [1,1,1]);
  const stone = [
    ["193f3d","285550","38736a","4d806e","77a689"],
    ["211d3b","363050","4a4566","6b5b89","8172a4"],
    ["192c48","23405d","365674","537a91","6a94a2"],
    ["513e43","745751","966d55","ac8662","c5a376"],
    ["423444","604652","7e585e","9c7873","be9682"],
  ].map(palette => palette.map(hex => mat(hex,.08)));
  const timber = mat("66312d",.11);
  const lacquer = mat("b05d46",.20);
  const cedar = mat("674733",.07);
  const gold = mat("c99e59",.28,.13);
  const brass = mat("e5bf79",.28,.26);
  const plaster = mat("d6b788",.10);
  const paper = mat("ffd397",.10,.51);
  const ember = mat("ffd17e",.18,.92);
  const dark = mat("292a30",.14);
  const pineWood = mat("4c3e32",.06);
  const pines = ["214e45","376954","55816a"].map(hex => mat(hex,.07));
  const peaches = ["a85272","ce6e87","e293a2","f7b0ac"].map(hex => mat(hex,.09));
  const greenRoof = ["264945","325b54","4c7c6b","6a9e85"].map(hex => mat(hex,.24));
  const goldRoof = ["745036","94663c","b4834c","d3a965"].map(hex => mat(hex,.25));
  const moonStone = mat("99b9ab",.11);
  const lunarGlow = mat("9bf9e4",.15,.86);
  const turquoise = mat("5dd5cf",.13,.66);
  const waterDark = mat("6fafa8",.08,.14);
  const waterLight = mat("b8f5e5",.13,.42);
  const ultraviolet = mat("bda1f6",.16,.84);
  const lightning = mat("edd5ff",.10,.96);
  const swordMetal = mat("a9adc7",.31);
  const swordHilt = mat("564a72",.23);
  const river = mat("7cbee8",.22,.67);
  const orchid = mat("ed9bdf",.17,.79);
  const starFoam = mat("b8f2ff",.11,.81);
  const lotusClay = ["587caa","857fae","ba93c6","ecc1dc"].map(hex => mat(hex,.17,.21));

  const add = (a,b) => a.map((v,i) => v+b[i]);
  const sub = (a,b) => a.map((v,i) => v-b[i]);
  const scale = (a,s) => a.map(v => v*s);
  const mix = (a,b,t) => a.map((v,i) => v+(b[i]-v)*t);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot = (a,b) => a.reduce((sum,v,i) => sum+v*b[i],0);
  const normalize = a => scale(a,1/(Math.hypot(...a) || 1));
  const range = (r,a,b) => a+(b-a)*r();
  const pick = (r,values) => values[Math.floor(r()*values.length)];

  function solid(type,x,z,rx,rz,yMin,yMax,kind,surface=false) {
    collider({type,x,z,rx,rz,yMin,yMax,kind,surface});
  }

  function faces(triangles, material, outward) {
    const vertices = [], indices = [];
    for (const [a,b,c] of triangles) {
      const perpendicular = cross(sub(b,a),sub(c,a));
      if (dot(perpendicular,perpendicular)<1e-12) continue;
      let normal = normalize(perpendicular);
      if (outward && dot(normal,outward(a,b,c))<0) normal = scale(normal,-1);
      const k = vertices.length/6;
      vertices.push(...a,...normal,...b,...normal,...c,...normal);
      indices.push(k,k+1,k+2);
    }
    if (indices.length) object(mesh(vertices,indices),identity,material);
  }

  function grid(rows, material, outward) {
    const triangles = [];
    for (let i=1; i<rows.length; i++) {
      for (let j=1; j<rows[i].length; j++) {
        const a=rows[i-1][j-1], b=rows[i-1][j], c=rows[i][j-1], d=rows[i][j];
        triangles.push([a,b,c],[b,d,c]);
      }
    }
    faces(triangles,material,outward);
  }

  // Irregular strata share vertices across bands so the ledges read as one landform.
  function landform(x,y,z,width,depth,height,palette,r,peak=false) {
    const sides = 13;
    const roughness = Array.from({length:sides},()=>range(r,.83,1.16));
    const phase = r()*TAU, lean = range(r,-.48,.48)*width;
    const profile = peak
      ? [[-1,1.0],[-.69,.85],[-.48,.62],[-.30,.64],[-.12,.29],[-.047,.21],[0,.035]]
      : [[-1,.045],[-.78,.29],[-.52,.47],[-.34,.72],[-.20,.69],[-.105,.96],[-.035,1.0],[0,.94]];
    const rings = profile.map(([e,radius],level)=>Array.from({length:sides+1},(_,index)=>{
      const i = index%sides, angle = phase+i*TAU/sides;
      const ragged = roughness[i]*(1+.10*Math.sin(2.8*level+1.6*i));
      const lift = level===profile.length-1&&!peak ? 0 : Math.sin(1.9*i+.55*level)*.036*height;
      return [x+Math.cos(angle)*width*radius*ragged+lean*(peak?1+e:-e),
        y+e*height+lift,z+Math.sin(angle)*depth*radius*ragged-.13*depth*e];
    }));
    const layers = palette.map(()=>[]);
    for (let k=1;k<rings.length;k++) {
      for (let i=0;i<sides;i++) {
        const shade = Math.min(palette.length-2,Math.floor(k*.49)+(i%5===0 ? 1 : 0));
        const [a,b,c,d] = [rings[k-1][i],rings[k-1][i+1],rings[k][i],rings[k][i+1]];
        layers[shade].push([a,b,c],[b,d,c]);
      }
    }
    layers[palette.length-1] = rings.at(-1).slice(0,-1).map((point,i)=>[[x+(peak?lean:0),y,z],point,rings.at(-1)[i+1]]);
    for (const [i,triangles] of layers.entries()) {
      faces(triangles,palette[i],(a,b,c)=>i===palette.length-1?[0,1,0]:
        [(a[0]+b[0]+c[0])/3-x,0,(a[2]+b[2]+c[2])/3-z]);
    }
    const sections=rings.map((ring,i)=>{
      const xs=ring.map(point=>point[0]),zs=ring.map(point=>point[2]);
      const loX=Math.min(...xs),hiX=Math.max(...xs),loZ=Math.min(...zs),hiZ=Math.max(...zs);
      return {
        y:y+profile[i][0]*height,x:(loX+hiX)/2,z:(loZ+hiZ)/2,
        rx:(hiX-loX)*.475,rz:(hiZ-loZ)*.475
      };
    });
    collider({
      type:"rock",x,z,yMin:y-height,yMax:y,
      rx:Math.max(...rings.flatMap(ring=>ring.map(p=>Math.abs(p[0]-x)))),
      rz:Math.max(...rings.flatMap(ring=>ring.map(p=>Math.abs(p[2]-z)))),
      sections,kind:"浮岛",surface:!peak,
      outline:peak?undefined:rings.at(-1).slice(0,-1).map(([x,,z])=>[x,z])
    });
  }

  function treeCrown(x,y,z,w,d,h,colors,r,flowering) {
    const segments=11, phase=r()*TAU;
    const perimeter=Array.from({length:segments},(_,i)=>{
      const a=phase+i*TAU/segments, q=range(r,.72,1.18);
      return [x+Math.cos(a)*w*q,y+range(r,-.16,.14)*h,z+Math.sin(a)*d*q];
    });
    const inner=perimeter.map((point,i)=>{
      const p=mix([x,y,z],point,range(r,.44,.67));
      p[1]+=h*range(r,.61,.95);
      return p;
    });
    const shades=colors.map(()=>[]);
    const hub=[x+w*.1,y+h,z-d*.08];
    for(let i=0;i<segments;i++) {
      const next=(i+1)%segments;
      shades[0].push([[x,y-h*.43,z],perimeter[next],perimeter[i]]);
      shades[1].push([perimeter[i],perimeter[next],inner[i]],[perimeter[next],inner[next],inner[i]]);
      shades[colors.length-1].push([inner[i],inner[next],hub]);
    }
    for (const [i,triangles] of shades.entries()) faces(triangles,colors[i],()=>[0,i===0?-1:1,0]);
    if (flowering) for (let i=0;i<4;i++) {
      const p=inner[Math.floor(r()*inner.length)], s=w*range(r,.10,.23);
      oval(add(p,[s*.22,s*.22,s*.16]),[s,s*.72,s*.76],pick(r,colors.slice(1)));
    }
  }

  function pine(x,y,z,s,r,flowering=false,direction=1) {
    const elbow=[x-.17*s*direction,y+.56*s,z-.12*s];
    const shoulder=[x+.16*s*direction,y+1.08*s,z+.02*s];
    const top=[x+.50*s*direction,y+1.51*s,z+.17*s];
    rod([x,y-.04,z],elbow,.11*s,pineWood);
    rod(elbow,shoulder,.081*s,pineWood);
    rod(shoulder,top,.055*s,pineWood);
    solid("ellipse",x-.08*s*direction,z-.06*s,.20*s,.17*s,y-.04,y+.64*s,"树干");
    solid("ellipse",x+.08*s*direction,z,.24*s,.15*s,y+.60*s,y+1.24*s,"树干");
    oval(elbow,[.105*s,.115*s,.10*s],pineWood);
    oval(shoulder,[.084*s,.083*s,.080*s],pineWood);
    const branches = [
      [elbow,-.62,.76,.29,.66],
      [shoulder,-.18,1.23,-.37,.59],
      [shoulder,.71,1.29,.37,.60],
      [top,.76,1.57,.18,.47],
      [top,.44,1.72,-.16,.35],
    ];
    for(const [start,a,h,d,w] of branches) {
      const p=[x+a*s*direction,y+h*s,z+d*s];
      rod(start,p,.037*s,pineWood);
      const colors = flowering ? peaches : pines;
      treeCrown(p[0]+direction*.1*s,p[1],p[2],w*s,w*s*.74,s*(flowering?.34:.15),colors,r,flowering);
    }
  }

  function waterfall(x,y,z,width,height,r) {
    const ledge = [x,y+.035,z-.42];
    for (let strand=0;strand<3;strand++) {
      const shift=(strand-1)*width*.31;
      const rows = Array.from({length:12},(_,i)=>{
        const t=i/11;
        const xx=x+shift+Math.sin(t*6.3+strand*.74)*width*.11+t*t*.48;
        const center=[xx,y-height*t,z+.8*Math.sqrt(t)+.46*t*t];
        const w=width*(.17+.06*Math.sin(t*9+strand))*(1-.47*t);
        return [add(center,[-w,0,0]),add(center,[w,0,.025])];
      });
      grid(rows,strand===1?waterLight:waterDark,()=>[0,.5,1]);
      polyline(rows.map(row=>mix(row[0],row[1],range(r,.21,.36))),width*.025,waterLight);
    }
    oval(ledge,[width*.91,.043,.53],waterLight);
    for(let i=0;i<4;i++) {
      const a=i*TAU/4;
      oval([x+.43+Math.cos(a)*.46,y-height+range(r,-.12,.14),z+1.13+Math.sin(a)*.37],
        [width*range(r,.28,.50),.11,width*.29],i%2?waterDark:waterLight);
    }
  }

  function lantern(x,y,z,s,tone=paper,hanging=true) {
    // The thin metal cage frames a warm silk diffuser and a hanging tassel.
    const center=[x,y,z];
    oval(center,[.185*s,.23*s,.185*s],tone);
    for(const sign of [-1,1]) {
      pillar([x,y+sign*.207*s,z],[.159*s,.035*s,.159*s],timber,8,.95);
      pillar([x,y+sign*.255*s,z],[.119*s,.019*s,.119*s],gold,8,.83);
    }
    for(let i=0;i<6;i++) {
      const a=i*TAU/6, dx=Math.cos(a)*s, dz=Math.sin(a)*s;
      polyline([[x+dx*.142,y-.22*s,z+dz*.142],[x+dx*.185,y,z+dz*.185],
        [x+dx*.142,y+.22*s,z+dz*.142]],.010*s,gold);
    }
    rod([x,y+.25*s,z],[x,y+(hanging?.46:.31)*s,z],.014*s,brass);
    rod([x,y-.25*s,z],[x,y-.40*s,z],.012*s,gold);
    spire([x,y-.39*s,z],[.052*s,.10*s,.052*s],timber,6);
  }

  // Each glazed roof has a bowed ridge, concave roof sections and lifted corner wings.
  function roof(x,y,z,w,d,h,tiles,detail) {
    const span = detail ? 28 : 14;
    function point(t,f,side) {
      const tip = Math.abs(t);
      const lift = tip**4*(.10+.23*f**2);
      return [x+t*w*(.62+.38*f),y+h*(.04+.83*(1-f)**1.74+lift),
        z+side*d*f*(.90+.10*tip**4)];
    }
    const samples=Array.from({length:span+1},(_,i)=>i/span*2-1);
    const levels=[0,.16,.34,.54,.75,.90,1];
    for (const side of [-1,1]) {
      for(const [a,b] of [[0,.30],[.30,.63],[.63,1]]) {
        const from=point(0,a,side),to=point(0,b,side);
        solid("box",x,(from[2]+to[2])/2,w*(.62+.19*(a+b)),
          Math.abs(to[2]-from[2])*.52+.015,to[1]-.043,from[1]+.035,"屋檐");
      }
      for(let i=1;i<levels.length;i++) {
        const a=levels[i-1],b=levels[i];
        grid([samples.map(t=>point(t,a,side)),samples.map(t=>point(t,b,side))],
          tiles[Math.min(tiles.length-1,i%3)],()=>[0,1,0]);
      }
      const edge=samples.filter((_,i)=>i%2===0).map(t=>point(t,1,side));
      polyline(edge,detail?.044:.036,gold);
      for(let i=2;i<span;i+=detail?2:4) {
        const t=samples[i];
        polyline([.04,.38,.71,.99].map(f=>add(point(t,f,side),[0,.013,0])),detail?.017:.014,tiles[3]);
      }
      for(const end of [-1,1]) {
        polyline([0,.26,.58,.84,1].map(f=>point(end,f,side)),.048,gold);
        const tip=point(end,1,side);
        const tail=add(tip,[end*.15*w,h*.23,side*.06*d]);
        rod(tip,tail,.036,brass);
        if(detail) oval(tail,[.061,.079,.045],gold);
      }
    }
    polyline(samples.filter((_,i)=>i%2===0).map(t=>point(t,0,1)),.064,brass);
    for(const side of [-1,1]) {
      const p=point(side,0,1);
      const finial=add(p,[side*.12*w,h*.24,0]);
      polyline([p,add(p,[side*.075*w,h*.06,0]),finial],.049,brass);
      if(detail) spire(add(finial,[0,h*.052,0]),[.065,h*.088,.065],gold,6);
    }
    box([x,y+.04,z],[.72*w,.05,.63*d],timber);
  }

  function wall(x,y,z,w,d,h,s,detail) {
    const columnH=h*.52;
    solid("box",x,z,w*.74,d*.72,y,y+columnH*2,"殿墙");
    box([x,y+columnH,z],[w*.74,columnH,d*.70],timber);
    for(const side of [-1,1]) {
      const zz=z+side*d*.714;
      box([x,y+.13*h,zz],[w*.76,.076*h,.055*s],lacquer);
      box([x,y+.93*h,zz],[w*.89,.075*h,.085*s],lacquer);
      for(const bay of [-1,0,1]) {
        const xx=x+bay*w*.46;
        const isDoor=detail&&bay===0&&side===1;
        box([xx,y+.47*h,zz+side*.018],[w*.18,h*.27,.018*s],isDoor?dark:paper);
        if(detail||bay===0) for(const bar of [-1,0,1])
          box([xx+bar*w*.097,y+.47*h,zz+side*.044],[.025*s,h*.30,.018*s],timber);
        box([xx,y+.52*h,zz+side*.048],[w*.178,.023*s,.018*s],timber);
      }
      for(const axis of [-1,1]) {
        const xx=x+axis*w*.72;
        rod([xx,y+.05*h,zz],[xx,y+.95*h,zz],.070*s,lacquer);
        box([xx,y+.93*h,zz],[.135*s,.063*s,.10*s],gold);
        if(detail) {
          box([xx,y+1.01*h,zz+side*.06*s],[.22*s,.047*s,.17*s],lacquer);
          box([xx,y+1.08*h,zz+side*.10*s],[.30*s,.041*s,.20*s],timber);
        }
      }
    }
    for(const end of [-1,1]) {
      box([x+end*w*.75,y+.51*h,z],[.026*s,.31*h,.32*d],plaster);
      box([x+end*w*.777,y+.52*h,z],[.019*s,.17*h,.20*d],paper);
      if(detail) for(const bar of [-1,0,1])
        box([x+end*w*.800,y+.52*h,z+bar*.103*d],[.017*s,.17*h,.027*s],timber);
    }
  }

  function hall(x,y,z,s,tiles,detail) {
    const w=1.62*s,d=1.07*s;
    solid("box",x,z,w*.95,d*.87,y-.034*s,y+.186*s,"殿基",true);
    solid("box",x,z,w*.89,d*.81,y+.155*s,y+.265*s,"殿基",true);
    box([x,y+.076*s,z],[w*.95,.11*s,d*.87],moonStone);
    box([x,y+.21*s,z],[w*.89,.055*s,d*.81],plaster);
    wall(x,y+.25*s,z,w,d,1.00*s,s,detail);
    roof(x,y+1.35*s,z,w*1.12,d*1.10,.60*s,tiles,detail);
    if(detail) {
      wall(x,y+1.76*s,z,w*.62,d*.67,.70*s,s*.75,false);
      roof(x,y+2.52*s,z,w*.75,d*.77,.52*s,tiles,true);
      box([x,y+.98*s,z+d*.83],[.42*s,.12*s,.041*s],dark);
      box([x,y+1.10*s,z+d*.85],[.44*s,.027*s,.025*s],brass);
      for (const i of [-1,0,1])
        box([x+i*.23*s,y+.98*s,z+d*.88],[.045*s,.056*s,.015*s],gold,Math.PI/4);
      for(const side of [-1,1]) {
        const xx=x+side*w*.80;
        rod([xx,y+1.34*s,z+d*.86],[xx,y+.93*s,z+d*.86],.018*s,gold);
        lantern(xx,y+.67*s,z+d*.86,.68*s);
      }
    }
  }

  function moonGate(x,y,z,s,stoneTone=moonStone) {
    const radius=1.15*s, inner=.88*s, cy=y+.91*s;
    const segments=21, bounds=[-.93,Math.PI+.93];
    for(let i=0;i<segments;i++) {
      const a=bounds[0]+(bounds[1]-bounds[0])*i/segments+.012;
      const b=bounds[0]+(bounds[1]-bounds[0])*(i+1)/segments-.012;
      const at=(a,r,depth)=>[x+Math.cos(a)*r,cy+Math.sin(a)*r,z+depth];
      const fl=at(a,inner,.14*s),fr=at(b,inner,.14*s),ol=at(a,radius,.14*s),or=at(b,radius,.14*s);
      const bl=at(a,inner,-.14*s),br=at(b,inner,-.14*s),ql=at(a,radius,-.14*s),qr=at(b,radius,-.14*s);
      faces([[fl,fr,ol],[fr,or,ol],[bl,ql,br],[br,ql,qr],
        [ol,or,ql],[or,qr,ql],[fl,bl,fr],[fr,bl,br]],i%4===0?plaster:stoneTone);
      const xs=[fl[0],fr[0],ol[0],or[0]],ys=[fl[1],fr[1],ol[1],or[1]];
      const left=Math.min(...xs),right=Math.max(...xs);
      solid("box",(left+right)/2,z,(right-left)/2,.14*s,Math.min(...ys),Math.max(...ys),"月门");
    }
    for(const side of [-1,1]) {
      box([x+side*.69*s,y+.12*s,z],[.24*s,.15*s,.25*s],stoneTone);
      box([x+side*1.21*s,y+.49*s,z],[.23*s,.52*s,.20*s],stoneTone);
      box([x+side*1.21*s,y+1.02*s,z],[.27*s,.066*s,.25*s],gold);
      solid("box",x+side*1.21*s,z,.23*s,.20*s,y-.03*s,y+1.02*s,"月门");
    }
  }

  function terrace(x,y,z,s) {
    for(let i=0;i<7;i++) {
      const rise=i*.075*s, distance=1.78*s-i*.195*s;
      box([x,y+rise,z+distance],[.91*s-i*.021*s,.062*s,.14*s],moonStone);
      solid("box",x,z+distance,(.91-i*.021)*s,.14*s,y+rise-.062*s,y+rise+.062*s,"石阶",true);
    }
    for(const side of [-1,1]) {
      const path=[];
      for(let i=0;i<4;i++) {
        const pos=[x+side*(.98-.055*i)*s,y+i*.144*s,z+(1.88-i*.36)*s];
        rod(pos,add(pos,[0,.28*s,0]),.035*s,moonStone);
        oval(add(pos,[0,.29*s,0]),[.056*s,.050*s,.053*s],brass);
        path.push(add(pos,[0,.24*s,0]));
      }
      polyline(path,.032*s,moonStone);
    }
  }

  function sigil(x,y,z,radius,finish,axis="z") {
    loop([x,y,z],axis==="z"?[radius,radius,1]:[radius,1,radius],finish,axis,.017);
    loop([x,y,z],axis==="z"?[radius*.87,radius*.87,1]:[radius*.87,1,radius*.87],finish,axis,.009);
    const center=[x,y,z];
    const at=(a,r)=>add(center,axis==="z"?[Math.cos(a)*r,Math.sin(a)*r,0]:[Math.cos(a)*r,0,Math.sin(a)*r]);
    for(let i=0;i<8;i++) {
      const a=i*TAU/8;
      const p=at(a,radius*.95);
      rod(p,at(a,radius*1.07),.019,finish);
      rod(at(a-.06,radius*1.01),at(a+.06,radius*1.01),.011,finish);
    }
  }

  function sword(x,y,z,s,lean,finish=swordMetal) {
    const up=[Math.sin(lean),Math.cos(lean),0], across=[up[1],-up[0],0];
    const at=(h,w=0,d=0)=>add([x,y,z],add(scale(up,h*s),add(scale(across,w*s),[0,0,d*s])));
    for(let i=0;i<6;i++) {
      const a=at(-.40+i*.37),b=at(-.03+i*.37),center=mix(a,b,.5);
      solid("ellipse",center[0],z,Math.abs(a[0]-b[0])*.5+.13*s,.075*s,
        Math.min(a[1],b[1])-.10*s,Math.max(a[1],b[1])+.10*s,"悬剑");
    }
    const blade=[
      at(.06,-.108),at(.82,-.139),at(1.53,-.066),at(1.82),at(1.53,.066),at(.82,.139),at(.06,.108)
    ];
    const front=at(.80,0,.070),back=at(.80,0,-.070);
    const tris=blade.map((p,i)=>[front,p,blade[(i+1)%blade.length]]);
    faces(tris,finish,()=>[0,0,1]);
    faces(blade.map((p,i)=>[back,blade[(i+1)%blade.length],p]),finish,()=>[0,0,-1]);
    polyline([at(.14,0,.043),front,at(1.57,0,.03),at(1.80)],.012*s,lightning);
    polyline([at(.08,-.33),at(-.024,-.17),at(-.024,.17),at(.08,.33)],.047*s,swordHilt);
    rod(at(-.45),at(-.02),.063*s,swordHilt);
    for(const h of [-.35,-.16])rod(at(h),at(h+.025),.073*s,gold);
    oval(at(-.48),[.082*s,.073*s,.074*s],ultraviolet);
  }

  function crystal(x,y,z,s,finish) {
    pillar([x,y+.20*s,z],[.14*s,.34*s,.17*s],finish,5,1.11);
    spire([x+.022*s,y+.69*s,z],[.16*s,.21*s,.19*s],finish,5);
  }

  function treasureLamp(x,y,z,s) {
    solid("ellipse",x,z,.36*s,.36*s,y-.54*s,y+.47*s,"法宝灯");
    pillar([x,y-.45*s,z],[.48*s,.11*s,.48*s],dark,8,1.26);
    pillar([x,y-.31*s,z],[.39*s,.047*s,.39*s],gold,8,1);
    oval([x,y,z],[.32*s,.36*s,.32*s],river);
    oval([x-.055*s,y+.033*s,z+.057*s],[.225*s,.27*s,.24*s],paper);
    for(let i=0;i<8;i++) {
      const a=i*TAU/8,dx=Math.cos(a),dz=Math.sin(a);
      const at=(radius,height)=>[x+radius*s*dx,y+height*s,z+radius*s*dz];
      polyline([at(.26,-.36),at(.42,-.18),at(.46,.11),at(.25,.39)],.024*s,gold);
      polyline([at(.28,.39),at(.38,.51),at(.51,.49)],.024*s,brass);
    }
    pillar([x,y+.39*s,z],[.34*s,.07*s,.34*s],timber,8,.84);
    spire([x,y+.58*s,z],[.29*s,.13*s,.29*s],goldRoof[2],8);
    crystal(x,y+.77*s,z,.26*s,ember);
    loop([x,y-.28*s,z],[.58*s,1,.58*s],river,"y",.020);
    for(let i=0;i<4;i++) {
      const a=i*TAU/4;
      const p=[x+Math.cos(a)*s*.47,y-.30*s,z+Math.sin(a)*s*.47];
      rod(p,add(p,[0,-.24*s,0]),.014*s,gold);
      oval(add(p,[0,-.27*s,0]),[.039*s,.063*s,.039*s],ember);
    }
  }

  function lotus(x,y,z,s) {
    pillar([x,y-.07*s,z],[1.42*s,.115*s,1.42*s],stone[2][2],10,.91);
    loop([x,y+.04*s,z],[1.34*s,1,1.34*s],river,"y",.016);
    for(let layer=0;layer<2;layer++) {
      const count=layer===0?10:7;
      for(let i=0;i<count;i++) {
        const a=i*TAU/count+layer*.21, r=[Math.cos(a),0,Math.sin(a)], tangent=[-r[2],0,r[0]];
        const rows=Array.from({length:9},(_,j)=>{
          const t=j/8;
          const length=(layer===0?1.55:1.04)*s;
          const p=add([x,y,z],add(scale(r,(.20+t)*length),[0,s*(.04+t*t*(layer===0?.42:.85)),0]));
          const w=Math.sin(t*Math.PI)**.73*s*(layer===0?.32:.24);
          return [add(p,scale(tangent,-w)),add(p,[0,w*.47,0]),add(p,scale(tangent,w))];
        });
        grid(rows,lotusClay[(i+layer)%lotusClay.length],()=>[0,1,0]);
      }
    }
    crystal(x,y+.34*s,z,.89*s,paper);
  }

  function immortalGate(x,y,z,s,detail) {
    for(let i=0;i<4;i++) {
      box([x,y+.062*s*i,z+.25*s-i*.083*s],[(2.0-.13*i)*s,.055*s,(.86-.093*i)*s],plaster);
      solid("box",x,z+(.25-i*.083)*s,(2-.13*i)*s,(.86-.093*i)*s,
        y+(.062*i-.055)*s,y+(.062*i+.055)*s,"天门石阶",true);
    }
    for(const side of [-1,1]) {
      const xx=x+side*1.27*s;
      solid("ellipse",xx,z,.16*s,.16*s,y+.34*s,y+2.40*s,"天门柱");
      solid("ellipse",xx,z,.28*s,.28*s,y+.08*s,y+.4*s,"天门柱");
      pillar([xx,y+.24*s,z],[.29*s,.16*s,.29*s],moonStone,8,.90);
      rod([xx,y+.35*s,z],[xx,y+2.38*s,z],.132*s,lacquer);
      for(const h of [.38,.52,2.20,2.34])pillar([xx,y+h*s,z],[.153*s,.036*s,.153*s],gold,8,1);
      for(let j=0;j<3;j++)box([xx,y+(2.38+j*.07)*s,z],[s*(.24+j*.09),.035*s,s*(.26+j*.052)],j%2?gold:timber);
      rod([xx,y+2.24*s,z],[xx-side*.59*s,y+2.47*s,z],.058*s,timber);
      rod([xx-side*.49*s,y+2.39*s,z+.20*s],[xx-side*.49*s,y+1.96*s,z+.20*s],.014*s,gold);
      lantern(xx-side*.49*s,y+1.75*s,z+.20*s,s*.62);
    }
    box([x,y+2.37*s,z],[1.60*s,.085*s,.22*s],timber);
    box([x,y+2.59*s,z],[1.80*s,.082*s,.33*s],lacquer);
    solid("box",x,z,1.73*s,.30*s,y+2.30*s,y+2.66*s,"天门横梁");
    box([x,y+2.42*s,z+.33*s],[.52*s,.125*s,.041*s],dark);
    for(let i=-1;i<=1;i++)box([x+i*.29*s,y+2.42*s,z+.38*s],[.041*s,.058*s,.017*s],brass,Math.PI/4);
    roof(x,y+2.68*s,z,2.08*s,.79*s,.66*s,goldRoof,detail);
  }

  function appendEffect(list,type,x,y,z,size,r,extra) {
    list.push({type,pos:[x,y,z],size,seed:r(),...extra});
  }

  function cloudTemple(x,y,z,s,r,effects,hero) {
    landform(x,y,z,3.65*s,2.56*s,8.7*s,stone[0],r);
    hall(x+.27*s,y+.13*s,z-.25*s,s,greenRoof,hero);
    terrace(x+.21*s,y+.01*s,z+1.12*s,s*.65);
    if(hero) {
      moonGate(x-1.91*s,y+.04*s,z+.98*s,s*.66);
      sigil(x+.51*s,y+2.51*s,z-.74*s,1.99*s,lunarGlow);
      const cord=Array.from({length:9},(_,i)=>{
        const t=i/8;
        return [x+(-2.95+5.80*t)*s,y+(1.86-.37*Math.sin(t*Math.PI))*s,z+2.11*s];
      });
      polyline(cord,.016*s,cedar);
      for(let i=1;i<8;i++) {
        const p=cord[i],t=i%3;
        rod(p,add(p,[0,-.095*s,0]),.014*s,gold);
        box(add(p,[0,-(.21+t*.035)*s,.013]),[.077*s,.15*s,.012*s],t===0?lacquer:plaster,(i%2?.13:-.15));
        rod(add(p,[-.025*s,-.16*s,.03]),add(p,[.015*s,-.31*s,.03]),.012*s,t===0?gold:timber);
      }
      for(const end of [-1,1])rod([x+end*2.91*s,y+.04*s,z+2.11*s],[x+end*2.91*s,y+1.96*s,z+2.11*s],.059*s,timber);
      sword(x-3.72*s,y+2.12*s,z+1.06*s,.78*s,-.35,moonStone);
    }
    pine(x-2.45*s,y+.08*s,z-.17*s,s*1.23,r,hero,-1);
    if(hero) pine(x+2.72*s,y+.11*s,z+.43*s,s*.94,r,false,1);
    waterfall(x+1.64*s,y+.015*s,z+2.18*s,.48*s,5.1*s,r);
    if(hero) appendEffect(effects,"lantern",x+3.42*s,y+1.13*s,z+1.32*s,s*.83,r);
    appendEffect(effects,"petal",x-1.61*s,y+2.61*s,z+.29*s,s*.63,r);
  }

  function swordValley(x,y,z,s,r,effects) {
    landform(x,y,z,3.71*s,2.59*s,8.2*s,stone[1],r);
    const rearZ=z-1.47*s;
    landform(x+1.88*s,y+4.76*s,rearZ,1.75*s,1.13*s,7.5*s,stone[1],r,true);
    landform(x-2.47*s,y+3.03*s,rearZ,1.42*s,1.16*s,7.5*s,stone[1],r,true);
    pillar([x,y+.10*s,z],[1.78*s,.17*s,1.59*s],stone[1][2],8,.92);
    sigil(x,y+.29*s,z,1.39*s,ultraviolet,"y");
    sigil(x,y+2.60*s,z-.28*s,2.16*s,ultraviolet);
    sword(x+.05*s,y+.80*s,z,1.38*s,.12);
    const slash=Array.from({length:8},(_,i)=>[x-2.78*s+i*.22*s+(i%2?.16:-.14)*s,
      y+3.70*s-i*.32*s,z-1.06*s+range(r,-.10,.1)*s]);
    polyline(slash,.022*s,ultraviolet);
    for(let i=0;i<4;i++) {
      const dx=(i-1.5)*1.10*s;
      appendEffect(effects,"sword",x+dx,y+(1.82+Math.abs(dx)*.43)*s,z+.91*s,.84*s,r,{angle:dx*.22});
      crystal(x+dx,y+.09*s,z+1.52*s,.51*s,ultraviolet);
    }
  }

  function ironChain(a,b,sag,finish) {
    const count=9;
    const length=Math.hypot(...sub(b,a))/count;
    const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
    const across=[Math.cos(angle),Math.sin(angle),0];
    for(let i=0;i<count;i++) {
      const t=(i+.5)/count;
      const center=add(mix(a,b,t),[0,-sag*Math.sin(t*Math.PI),0]);
      const span=length*.72, width=length*.27;
      const q=[[-span,0],[-span*.58,-width],[span*.53,-width],[span,0],[span*.54,width],[-span*.57,width],[-span,0]];
      polyline(q.map(([u,v])=>add(center,add(scale(across,u),i%2?[0,0,v]:[-across[1]*v,across[0]*v,0]))),
        Math.min(.055,length*.125),finish);
    }
  }

  function swordRift(x,y,z,s,r,effects) {
    const left=[x-3.2*s,y+.29*s,z+.08*s],right=[x+3.56*s,y+.83*s,z-.38*s];
    landform(...left,2.16*s,2.06*s,9.2*s,stone[1],r);
    landform(...right,2.51*s,2.43*s,10.9*s,stone[1],r);
    landform(x-4.61*s,y+3.89*s,z-1.10*s,1.42*s,.93*s,10.6*s,stone[1],r,true);
    landform(x+5.22*s,y+4.61*s,z-.86*s,1.86*s,1.51*s,12.0*s,stone[1],r,true);
    const great=[x-2.24*s,y+3.42*s,z+.26*s];
    sword(...great,3.48*s,1.43,stone[1][4]);
    for(const [sign,origin] of [[-1,left],[1,right]]) {
      const anchor=[origin[0]+sign*.41*s,origin[1]+.98*s,origin[2]+.49*s];
      pillar([anchor[0],anchor[1]-.72*s,anchor[2]],[.48*s,.23*s,.49*s],stone[1][2],8,1.07);
      pillar([anchor[0],anchor[1]-.37*s,anchor[2]],[.23*s,.29*s,.25*s],swordHilt,8,.81);
      oval(anchor,[.14*s,.13*s,.14*s],ultraviolet);
      const tip=sign<0?add(great,[-1.28*s,-.22*s,0]):add(great,[4.12*s,.45*s,0]);
      ironChain(anchor,tip,.25*s,swordHilt);
      const fracture=Array.from({length:8},(_,i)=>[origin[0]+sign*(i*.13+(i%2?.17:-.11))*s,
        origin[1]+.53*s-i*.34*s,origin[2]+(1.34-i*.088)*s]);
      polyline(fracture,.026*s,ultraviolet);
      polyline(fracture,.010*s,lightning);
    }
    for(let i=0;i<5;i++) {
      const a=-1.21+i*.49;
      const px=x+Math.sin(a)*4.02*s,pz=z+.84*s+Math.cos(a)*.97*s;
      appendEffect(effects,"sword",px,y+(1.36+(i%2)*.76)*s,pz,.69*s,r,{angle:a*.28});
    }
  }

  function swordForest(x,y,z,s,r,effects) {
    landform(x-.65*s,y-.40*s,z+.15*s,2.12*s,1.78*s,8.5*s,stone[1],r);
    for(let i=0;i<5;i++) {
      const dx=(i-2)*1.38*s, dz=(Math.abs(i-2)*.45-1.16)*s;
      const h=(.67+Math.sin((i+.32)*1.69)*1.72+range(r,.04,.65))*s;
      const p=[x+dx,y+h,z+dz];
      landform(p[0],p[1]-.34*s,p[2],(.63+.16*Math.abs(i-2))*s,.68*s,range(r,5,9)*s,stone[1],r);
      crystal(p[0],p[1],p[2],.49*s,ultraviolet);
      sword(p[0],p[1]+(.66+i%2*.3)*s,p[2]-.04*s,(.55+i%2*.29)*s,(i-1.76)*.23);
      if(i%2===1) appendEffect(effects,"sword",p[0]+.48*s,p[1]+1.75*s,p[2]+1.14*s,.69*s,r);
    }
    const traces=Array.from({length:10},(_,i)=>[x+(i*.68-3.08)*s,y+(1.34+.46*Math.sin(i*.83))*s,z+(1.2+.24*Math.sin(i*.76))*s]);
    polyline(traces,.027*s,ultraviolet);
    for(const p of traces.filter((_,i)=>i%3===0)) oval(p,[.092*s,.073*s,.089*s],lightning);
  }

  function lanternSanctuary(x,y,z,s,r,effects,hero=false) {
    landform(x,y,z,3.23*s,2.80*s,8.9*s,stone[2],r);
    lotus(x,y+.10*s,z,s*1.07);
    treasureLamp(x,y+2.22*s,z-.13*s,(hero?1.35:1.07)*s);
    sigil(x,y+2.28*s,z-.31*s,1.31*s,hero?orchid:river);
    if(hero) {
      sigil(x,y+.42*s,z,2.32*s,starFoam,"y");
      treasureLamp(x-2.13*s,y+1.11*s,z+.46*s,.56*s);
      treasureLamp(x+2.13*s,y+1.40*s,z-.41*s,.67*s);
      for(const side of [-1,1]) {
        const shift=side*4.61*s;
        landform(x+shift,y+(.57+side*.66)*s,z+1.48*s,1.20*s,1.04*s,6.5*s,stone[2],r);
        lotus(x+shift,y+(.65+side*.66)*s,z+1.48*s,.49*s);
        appendEffect(effects,"lantern",x+shift,y+(2.03+side*.66)*s,z+1.48*s,.91*s,r);
      }
    }
    for(let i=0;i<5;i++) {
      const a=i*TAU/5+.31;
      appendEffect(effects,"lantern",x+Math.cos(a)*2.55*s,y+(.95+i*.36)*s,z+Math.sin(a)*1.62*s,.75*s,r);
      crystal(x+Math.cos(a)*2.22*s,y+.17*s,z+Math.sin(a)*1.69*s,.47*s,river);
    }
    for (const side of [-1,1]) {
      const curve=Array.from({length:9},(_,i)=>[x+(i*.52-2.08)*s,
        y+(.47+Math.sin(i*.53+side)*.38)*s,z+side*(1.9+Math.cos(i*.58)*.58)*s]);
      polyline(curve,.024*s,river);
    }
  }

  function heavenlyCourt(x,y,z,s,r,effects) {
    landform(x,y,z,4.30*s,3.35*s,10.0*s,stone[3],r);
    immortalGate(x,y+.11*s,z+1.47*s,s,true);
    hall(x,y+.33*s,z-1.14*s,.89*s,goldRoof,false);
    sigil(x,y+3.13*s,z-1.75*s,2.08*s,brass);
    for(const side of [-1,1]) {
      pine(x+side*2.9*s,y+.09*s,z+.04*s,.92*s,r,false,side);
      rod([x+side*.98*s,y+.06*s,z+2.53*s],[x+side*.98*s,y+.64*s,z+2.53*s],.048*s,gold);
      lantern(x+side*.98*s,y+.67*s,z+2.53*s,.54*s,ember,false);
      appendEffect(effects,"lantern",x+side*3.71*s,y+1.33*s,z+1.70*s,s*.69,r);
    }
  }

  function peachFalls(x,y,z,s,r,effects) {
    landform(x,y,z,3.46*s,2.82*s,8.7*s,stone[4],r);
    landform(x+.44*s,y+1.58*s,z-.86*s,1.73*s,1.59*s,4.2*s,stone[4],r);
    pine(x-.88*s,y+1.63*s,z-.99*s,s*1.35,r,true,-1);
    pine(x+1.46*s,y+.055*s,z+.46*s,s*.88,r,true);
    pine(x-2.58*s,y+.01*s,z+.17*s,s*.83,r,true,-1);
    waterfall(x+.58*s,y+1.59*s,z+.46*s,.54*s,2.0*s,r);
    waterfall(x+.81*s,y-.02*s,z+2.54*s,.71*s,6.2*s,r);
    moonGate(x-1.45*s,y+.03*s,z+1.35*s,.58*s,stone[4][4]);
    for(let i=0;i<5;i++) {
      appendEffect(effects,"petal",x+range(r,-2.7,2.5)*s,y+range(r,.49,3.2)*s,
        z+range(r,.4,2.4)*s,range(r,.59,.86)*s,r);
    }
  }

  function skyBridge(x,y,z,s,r) {
    landform(x+6.35*s,y-.12*s,z,1.8*s,1.40*s,6.9*s,stone[3],r);
    const panels=11, handrails=[[],[]];
    for(let i=0;i<=panels;i++) {
      const t=i/panels;
      const deck=[x+(1.10+t*4.95)*s,y+(.01+Math.sin(t*Math.PI)*.53)*s,z];
      const slope=Math.atan(.53*Math.PI/4.95*Math.cos(t*Math.PI));
      box(deck,[.207*s,.08*s,.62*s],i%3===0?plaster:stone[3][4],slope);
      solid("box",deck[0],deck[2],.216*s,.62*s,deck[1]-.085*s,deck[1]+.082*s,"浮桥",true);
      for(const [index,sign] of [-1,1].entries()) {
        const rail=[deck[0],deck[1]+.25*s,deck[2]+sign*.57*s];
        handrails[index].push(rail);
        if(i%3===0||i===panels) {
          rod([rail[0],deck[1],rail[2]],rail,.038*s,timber);
          oval(rail,[.053*s,.051*s,.053*s],brass);
        }
      }
    }
    for(const points of handrails) polyline(points,.019*s,brass);
    lantern(x+6.44*s,y+.52*s,z+.47*s,.51*s,ember,false);
  }

  function risingLanterns(x,y,z,s,r,effects) {
    const banks=[[],[],[]];
    for(let i=0;i<11;i++) {
      const t=i/10;
      const angle=t*Math.PI*.92-.62;
      const radial=[Math.cos(angle),0,Math.sin(angle)];
      const p=[x+radial[0]*s*(3.4+t*1.9),y+s*(.12+t*t*2.61),z+radial[2]*s*(3.4+t*1.9)];
      for(let j=0;j<banks.length;j++) banks[j].push(add(p,scale(radial,(j-1)*.19*s)));
      if(i%3===1) appendEffect(effects,"lantern",p[0],p[1]+.26*s,p[2],s*range(r,.53,.86),r);
    }
    for (const [i,bank] of banks.entries()) polyline(bank,s*(i===1?.021:.011),[river,starFoam,orchid][i]);
  }

  function prayerPavilion(x,y,z,s,r,effects) {
    landform(x,y,z,2.9*s,2.31*s,9.4*s,stone[0],r);
    pillar([x,y+.095*s,z],[1.28*s,.14*s,.97*s],moonStone,8,.98);
    solid("ellipse",x,z,1.20*s,.94*s,y-.045*s,y+.235*s,"亭基",true);
    for(const u of [-1,1])for(const v of [-1,1]){
      const xx=x+u*.87*s,zz=z+v*.54*s;
      solid("ellipse",xx,zz,.074*s,.074*s,y+.16*s,y+1.4*s,"亭柱");
      rod([xx,y+.16*s,zz],[xx,y+1.40*s,zz],.062*s,timber);
      rod([xx,y+.22*s,zz],[xx,y+.28*s,zz],.073*s,gold);
      box([xx,y+1.32*s,zz],[.18*s,.053*s,.15*s],lacquer);
    }
    box([x,y+1.39*s,z],[1.05*s,.063*s,.73*s],lacquer);
    roof(x,y+1.48*s,z,1.27*s,.91*s,.55*s,greenRoof,false);
    treasureLamp(x,y+.74*s,z,.51*s);
    pine(x-1.93*s,y+.08*s,z+.27*s,.91*s,r,false,-1);
    waterfall(x+.96*s,y+.015*s,z+1.75*s,.40*s,5.8*s,r);
    appendEffect(effects,"lantern",x+2.04*s,y+.91*s,z+.65*s,.63*s,r);
  }

  function starter(r,effects) {
    cloudTemple(10.7,.82,-7.3,1.34,r,effects,true);
    landform(15.6,6.4,-15.3,2.51,1.96,15.0,stone[0],r,true);
    landform(5.1,3.85,-13.1,2.63,2.28,13.7,stone[0],r,true);
    landform(17.3,3.43,-11.7,1.59,1.36,12.6,stone[0],r,true);
    landform(-7.1,-1.5,-9.5,2.93,2.1,7.3,stone[0],r);
    moonGate(-7.0,-1.42,-9.3,.72);
    pine(-8.65,-1.46,-8.80,.91,r,true,-1);
    landform(2.7,-2.25,5.52,1.36,1.41,4.4,stone[0],r);
    pine(2.60,-2.23,5.52,.64,r,false);
    for(let i=0;i<3;i++)
      appendEffect(effects,"sword",8.08+i*.86,2.34+i*.29,-3.49-i*.34,.59+i*.14,r,{angle:.21*i-.16});
    appendEffect(effects,"lantern",6.18,1.27,-2.81,.80,r);
  }

  function buildCell(cx,cz,biome) {
    const type=Math.max(0,Math.min(4,biome));
    const r=rng((Math.imul(cx+17,0x9e3779b1)^Math.imul(cz-31,0x85ebca77)^0x754ff1ab)>>>0);
    const effects=[];
    if(cx===0&&cz===0) {
      starter(r,effects);
      return effects;
    }
    const x=cx*cellSize,z=cz*cellSize,angle=r()*TAU;
    const local=(a,b)=>[x+Math.cos(angle)*a+Math.sin(angle)*b,z+Math.sin(angle)*a-Math.cos(angle)*b];
    const [hx,hz]=local(range(r,-3,5),range(r,-2,5));
    const summit=range(r,-.55,5.9)+(r()>.88?range(r,2.9,5.2):0);
    const s=range(r,.78,1.19);
    switch(type) {
      case 0:
        if(r()<.45) prayerPavilion(hx,summit,hz,s,r,effects);
        else cloudTemple(hx,summit,hz,s,r,effects,false);
        break;
      case 1: {
        const variant=((cx+2*cz)%3+3)%3;
        if(cx===1&&cz===0) swordRift(x-2.1,1.26,z-7.05,1.15,r,effects);
        else if(variant===0) swordValley(hx,summit,hz,s,r,effects);
        else if(variant===1) swordRift(hx,summit,hz,s,r,effects);
        else swordForest(hx,summit,hz,s,r,effects);
        break;
      }
      case 2:
        if(cx===0&&cz===1) {
          lanternSanctuary(x+7.1,1.17,z-.93,1.18,r,effects,true);
          risingLanterns(x+7.1,1.17,z-.93,1.18,r,effects);
        } else {
          lanternSanctuary(hx,summit,hz,s,r,effects);
          if(r()<.69) risingLanterns(hx,summit,hz,s,r,effects);
        }
        break;
      case 3:
        heavenlyCourt(hx,summit,hz,s,r,effects);
        if(r()<.57) skyBridge(hx,summit,hz+1.08*s,s,r);
        break;
      case 4: peachFalls(hx,summit,hz,s,r,effects); break;
    }
    for(let i=0;i<3;i++) {
      const angle=i*TAU/3+range(r,-.44,.42);
      const distance=range(r,7.2,12.6);
      const px=hx+Math.cos(angle)*distance,pz=hz+Math.sin(angle)*distance;
      const top=range(r,-2.1,4.3)+(i===0?range(r,0,3.1):0);
      const size=range(r,1.08,2.4);
      if((i+type)%3===1) {
        landform(px,top,pz,size,size*.78,range(r,9.3,15.7),stone[type],r,true);
      } else {
        landform(px,top-1.46,pz,size,size*.86,range(r,5.5,9.0),stone[type],r);
        if(type===0||type===4)pine(px,top-1.44,pz,size*.42,r,type===4);
        if(type===1)appendEffect(effects,"sword",px,top-.25,pz,size*.49,r);
        if(type===2||type===3)appendEffect(effects,"lantern",px,top+.31,pz,size*.38,r);
      }
    }
    return effects;
  }
  return {buildCell,cellSize};
}
