const IMMORTAL_FISH_ISLAND = {
  x: 13.2,
  z: 10.94,
  waterY: .07,
  dock: {x: 10.4, y: .49, z: 10.7, heading: 0},
  approach: [6.1, .81, 10.7],
  pond: {x: 14.57, z: 11.33, rx: 1.88, rz: 1.73},
  capture: [13.45, .07, 11.33]
};

function buildImmortalFishIsland(api) {
  const {mat, oval, rod, box, pillar, loop, polyline, rng, mesh, object, shape, collider=()=>{}}=api;
  const {x,z,waterY,dock,pond}=IMMORTAL_FISH_ISLAND;
  const r=rng(562982), tau=Math.PI*2, identity=shape([0,0,0],[1,1,1]);
  const cliff=["24454a","376569","497974","618c7d","83ac94"].map(hex=>mat(hex,.09));
  const grass=["466f58","5b8666","709872"].map(hex=>mat(hex,.08));
  const timber=["775744","8f6951","a67b57"].map(hex=>mat(hex,.17));
  const jade=mat("395c59",.18), glaze=mat("86b2a0",.23), jadeEdge=mat("b5c0a2",.17);
  const brass=mat("efbe71",.29,.34), enamel=mat("c2865c",.20,.12), linen=mat("ffe3a8",.16,.54);
  const light=mat("ffd491",.16,.91), dark=mat("302f34",.1), red=mat("9c5449",.21);
  const waters=["2c6471","3d8190","539caa","77c5bc","a4dbbf"].map(hex=>mat(hex,.29,.25));
  const foam=mat("b7eae0",.16,.57), waterShade=mat("64bab4",.12,.43), waterFlash=mat("dbf5db",.19,.73);
  const stems=mat("3b6b4d",.06), green=mat("83a66d",.08), spring=mat("a8c782",.12);
  const leaves=["427864","598c66","7ba275"].map(hex=>mat(hex,.13,.04));
  const petals=["b86689","df8f9e","f2acaf","ffc6ab"].map(hex=>mat(hex,.12,.24));
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);

  function triangles(faces,material,out=[0,1,0]) {
    const vertices=[],indices=[];
    for(const face of faces) {
      const [a,b,c]=face;
      const n=cross(sub(b,a),sub(c,a)), length=Math.hypot(...n);
      if(length<1e-8)continue;
      const direction=typeof out==="function"?out(a,b,c):out;
      const sign=dot(n,direction)<0?-1:1;
      const normal=n.map(v=>v/length*sign);
      const index=vertices.length/6;
      for(const p of face)vertices.push(...p,...normal);
      indices.push(index,index+1,index+2);
    }
    if(indices.length)object(mesh(vertices,indices),identity,material);
  }

  function facesBetween(outer,inner) {
    const faces=[];
    for(let i=0;i<outer.length;i++){
      const j=(i+1)%outer.length;
      faces.push([outer[i],inner[i],outer[j]],[outer[j],inner[i],inner[j]]);
    }
    return faces;
  }

  function ellipse(cx,cz,y,rx,rz,n,rough=0) {
    return Array.from({length:n},(_,i)=>{
      const a=i*tau/n, wobble=1+rough*(Math.cos(a*5+.4)+Math.sin(a*7))*.5;
      return [cx+Math.cos(a)*rx*wobble,y,cz+Math.sin(a)*rz*wobble];
    });
  }

  function solid(type,x,z,rx,rz,yMin,yMax,kind,surface=false) {
    collider({type,x,z,rx,rz,yMin,yMax,kind,surface});
  }

  function landform() {
    const profiles=[
      [-6.7,.062,-.74,.32],[-5.15,.24,-.63,.26],[-3.65,.44,-.43,.22],
      [-2.18,.66,-.18,.1],[-1.19,.81,-.07,0],[-.64,.95,0,0],[-.22,1,0,0]
    ];
    const rings=profiles.map(([y,s,dx,dz],level)=>ellipse(x+dx,z+dz,y,5.86*s,3.32*s,28,.14)
      .map((p,i)=>[p[0],p[1]+(level===6?0:Math.sin(i*1.73+level*.91)*.19),p[2]]));
    for(let i=1;i<rings.length;i++){
      const faces=facesBetween(rings[i],rings[i-1]), materials=cliff.map(()=>[]);
      for(const [j,face] of faces.entries()) {
        const shade=Math.min(cliff.length-1,Math.max(0,Math.floor(i*.58+(j%11===0?1:0)-(j%7===0?1:0))));
        materials[shade].push(face);
      }
      for(const [j,faces] of materials.entries())
        triangles(faces,cliff[j],a=>[a[0]-x,0,a[2]-z]);
    }
    const cap=rings.at(-1);
    triangles(cap.map((p,i)=>[[x,-.22,z],p,cap[(i+1)%cap.length]]),cliff[3]);
    collider({
      type:"rock",kind:"灵鱼汀浮岛",x,z,yMin:profiles[0][0],yMax:-.22,rx:6.36,rz:3.78,
      sections:profiles.map(([y,s,dx,dz])=>({y,x:x+dx,z:z+dz,rx:5.62*s,rz:3.21*s})),
      outline:cap.map(p=>[p[0],p[2]]),surface:true
    });
  }

  function terrace() {
    const shoreline=ellipse(pond.x,pond.z,waterY-.018,pond.rx,pond.rz,28,.035);
    const bank=ellipse(pond.x+.19,pond.z,.35,2.16,1.99,28,.06);
    const outer=ellipse(pond.x-.15,pond.z-.13,.34,3.34,2.87,28,.12);
    const apron=ellipse(pond.x-.1,pond.z-.1,-.23,3.46,2.98,28,.12);
    const shoreSlices=[[],[]], grassSlices=grass.map(()=>[]);
    for(const [i,face] of facesBetween(bank,shoreline).entries())shoreSlices[(Math.floor(i/2)%5===0?1:0)].push(face);
    triangles(shoreSlices[0],jade);
    triangles(shoreSlices[1],glaze);
    for(const [i,face] of facesBetween(outer,bank).entries())grassSlices[Math.floor(i/2)%3].push(face);
    for(const [i,faces] of grassSlices.entries())triangles(faces,grass[i]);
    triangles(facesBetween(apron,outer),cliff[4],a=>[a[0]-pond.x,0,a[2]-pond.z]);
    for(const [i,p] of bank.entries()){
      if(p[0]<12.85 && Math.abs(p[2]-dock.z)<1.6)continue;
      const size=.10+r()*.10;
      oval([p[0],p[1]-.02,p[2]],[size*1.5,size*.78,size],i%4?jadeEdge:glaze,r()*.37);
    }
  }

  function deck() {
    const xMin=7.28,xMax=12.72,zMin=9.36,zMax=12.04;
    const centerX=(xMin+xMax)*.5, centerZ=(zMin+zMax)*.5;
    const halfX=(xMax-xMin)*.5, halfZ=(zMax-zMin)*.5;
    box([centerX,dock.y-.191,centerZ],[halfX,.154,halfZ],jade);
    box([centerX,dock.y-.06,centerZ],[halfX-.018,.055,halfZ-.04],timber[0]);
    for(let i=0;i<19;i++){
      const width=(xMax-xMin)/19;
      box([xMin+(i+.5)*width,dock.y-.014,centerZ],[width*.48,.014,halfZ-.056],timber[(i*5)%3]);
    }
    for(const side of [-1,1]){
      const zz=centerZ+side*(halfZ-.024);
      box([centerX,dock.y-.012,zz],[halfX,.015,.034],jadeEdge);
      rod([xMin+.04,dock.y+.006,zz],[xMax-.04,dock.y+.006,zz],.010,brass);
      for(const xx of [7.59,9.48,11.55,12.42]){
        box([xx,dock.y-.43,zz],[.12,.41,.135],timber[0]);
        box([xx,dock.y-.075,zz],[.16,.04,.09],enamel);
      }
    }
    box([xMax-.04,dock.y-.014,centerZ],[.043,.017,halfZ],jadeEdge);
    solid("box",centerX,centerZ,halfX,halfZ,dock.y-.34,dock.y,"停靠木台",true);
    const stampX=11.66,stampZ=11.33,y=dock.y+.014;
    loop([stampX,y,stampZ],[.35,.018,.35],brass,"y",.043);
    const eye=[stampX+.13,y+.005,stampZ], tail=[stampX-.13,y,stampZ];
    polyline([[stampX-.30,y,stampZ-.11],tail,[stampX-.30,y,stampZ+.11]],.013,enamel);
    polyline([tail,[stampX+.03,y,stampZ-.105],[stampX+.23,y,stampZ],[stampX+.03,y,stampZ+.105],tail],.013,brass);
    oval(eye,[.027,.011,.027],jadeEdge);
    const entryX=3.5, entryY=.263, panels=26, span=xMin-entryX;
    const slope=Math.atan2(dock.y-entryY,span);
    for(let i=0;i<panels;i++){
      const t=i/(panels-1), xx=entryX+(i+.5)*span/panels, yy=entryY+(dock.y-entryY)*t;
      const width=.91+.31*t, half=span/panels*.5;
      box([xx,yy-.032,dock.z],[half*.96,.032,width],timber[i%3],slope);
      solid("box",xx,dock.z,half*1.01,width,yy-.09,yy,"入岛引桥",true);
      if(i%7===6){
        box([xx,yy-.084,dock.z],[.071,.038,width+.047],jade);
        for(const side of [-1,1])oval([xx,yy+.004,dock.z+side*(width-.040)],[.019,.014,.019],brass);
      }
    }
    for(const side of [-1,1])rod([entryX+.12,entryY-.066,dock.z+side*.88],
      [xMin,dock.y-.065,dock.z+side*1.20],.027,jade);
  }

  function pondSurface() {
    const rings=waters.map((_,i)=>ellipse(
      pond.x-.21*(4-i)/4,pond.z+.15*(4-i)/4,waterY+(i-4)*.00025,
      pond.rx*(i+1)/5,pond.rz*(i+1)/5,28,.035+.018*(4-i)
    ));
    triangles(rings[0].map((p,i)=>[[pond.x,waterY,pond.z],p,rings[0][(i+1)%28]]),waters[0]);
    for(let i=1;i<rings.length;i++)triangles(facesBetween(rings[i],rings[i-1]),waters[i]);
    for(let i=0;i<8;i++){
      const start=i*tau/8+.05, radius=.79+(i%3)*.06;
      const path=Array.from({length:6},(_,j)=>{
        const a=start+j*.048;
        return [pond.x+Math.cos(a)*pond.rx*radius,waterY+.006,pond.z+Math.sin(a)*pond.rz*radius];
      });
      polyline(path,.008,i%3?waterShade:foam);
    }
    for(const [x,z,length] of [[14.53,10.42,.39],[15.18,11.78,.53],[14.28,12.33,.47],[15.52,11.15,.31]]){
      const y=waterY+.008;
      triangles([
        [[x-length,y,z-.031],[x+length,y,z+.016],[x+.075,y,z+.047]],
        [[x-length*.63,y,z+.115],[x+length*.56,y,z+.103],[x+.035,y,z+.131]]
      ],waterShade);
    }
    for(const [ox,oz,k] of [[.74,1.09,.93],[-.33,-1.1,.76],[1.08,-.69,.62]]){
      const lx=pond.x+ox,lz=pond.z+oz;
      for(let i=0;i<3;i++){
        const a=i*2.31+.8, llx=lx+Math.cos(a)*.26*k,llz=lz+Math.sin(a)*.26*k;
        const leafRadius=(.18+i*.04)*k, phi=r()*tau;
        const leaf=Array.from({length:12},(_,j)=>{
          const q=phi+.27+j*(tau-.61)/11;
          return [llx+Math.cos(q)*leafRadius,waterY+.023,llz+Math.sin(q)*leafRadius*.89];
        });
        triangles(leaf.slice(0,-1).map((p,j)=>[[llx,waterY+.016,llz],p,leaf[j+1]]),leaves[i]);
        rod([llx,waterY+.023,llz],leaf[6],.005,spring);
      }
      if(k>.68)lotus(lx,waterY+.045,lz,k);
    }
  }

  function lotus(x,y,z,size) {
    const base=[x,y,z], s=size*.19;
    for(let layer=0;layer<2;layer++){
      const n=layer===0?8:6;
      for(let i=0;i<n;i++){
        const a=(i+layer*.5)*tau/n, f=[Math.cos(a),0,Math.sin(a)], side=[-f[2],0,f[0]];
        const p=(u,v,w)=>[x+f[0]*u+side[0]*v,y+w,z+f[2]*u+side[2]*v];
        const mid=p(s*.59,.0,s*.29), right=p(s*.59,s*.22,s*.15), left=p(s*.59,-s*.22,s*.15);
        const tip=p(s*(layer===0?1.38:.82),0,s*(layer===0?.37:.82));
        triangles([[base,left,mid],[base,mid,right],[left,tip,mid],[mid,tip,right]],petals[layer*2+i%2]);
      }
    }
    oval([x,y+s*.35,z],[s*.31,s*.29,s*.31],brass);
  }

  function plaque() {
    const center=13.17, zz=8.87, top=2.49, yy=2.22;
    for(const side of [-1,1]){
      const px=center+side*.89;
      box([px,.94,zz],[.062,.57,.071],red);
      box([px,1.98,zz],[.059,.47,.067],red);
      pillar([px,.47,zz],[.119,.102,.118],jade,7);
      rod([px,top-.12,zz],[px+side*.18,top+.15,zz],.053,enamel);
      oval([px+side*.18,top+.16,zz],[.061,.055,.057],brass);
      solid("box",px,zz,.067,.076,.39,top,"灵鱼汀牌柱");
    }
    box([center,top,zz],[.94,.068,.087],jade);
    box([center,yy,zz+.014],[.70,.196,.061],red);
    box([center,yy,zz+.078],[.664,.167,.009],dark);
    for(const dx of [-.683,.683])rod([center+dx,yy-.173,zz+.09],[center+dx,yy+.173,zz+.09],.011,brass);
    for(const dy of [-.177,.177])rod([center-.683,yy+dy,zz+.09],[center+.683,yy+dy,zz+.09],.011,brass);
    const strokes=[
      [
        [[.19,.94],[.78,.94],[.78,.64],[.19,.64]],[[.21,.78],[.75,.78]],
        [[.18,.49],[.26,.32]],[[.78,.52],[.66,.35]],[[.50,.56],[.48,.34],[.36,.19],[.15,.08]],[[.49,.32],[.64,.16],[.87,.06]]
      ],
      [
        [[.39,.98],[.22,.80]],[[.39,.93],[.72,.93],[.56,.78]],
        [[.25,.72],[.77,.72],[.77,.29],[.25,.29],[.25,.72]],
        [[.51,.70],[.51,.32]],[[.27,.53],[.75,.53]],[[.16,.13],[.86,.13]]
      ],
      [
        [[.15,.88],[.27,.78]],[[.10,.62],[.23,.52]],[[.14,.20],[.30,.39]],
        [[.40,.83],[.87,.83]],[[.66,.81],[.66,.15],[.54,.10],[.49,.17]]
      ]
    ];
    strokes.forEach((character,i)=>{
      for(const stroke of character)polyline(stroke.map(([u,v])=>[center+(i-1)*.37+(u-.5)*.29,yy+(v-.5)*.264,zz+.098]),.008,linen);
    });
  }

  function fishLantern(x,y,z,size) {
    const p=(u,v,w)=>[x+u*size,y+v*size,z+w*size];
    oval(p(0,0,0),[.34*size,.21*size,.17*size],light);
    oval(p(.22,.012,0),[.17*size,.18*size,.156*size],linen);
    for(const s of [-1,1]){
      oval(p(.26,.05,s*.143),[.025*size,.027*size,.022*size],dark);
      const edge=p(-.27,.014,s*.061);
      triangles([[edge,p(-.59,.22,s*.012),p(-.49,.024,s*.024)],
        [edge,p(-.49,.024,s*.024),p(-.60,-.19,s*.024)]],enamel,[0,0,s]);
    }
    for(const u of [-.20,-.06,.09])loop(p(u,0,0),[.13*size,.208*size,.164*size],brass,"x",.059);
    rod(p(-.29,.03,0),p(-.57,.215,0),.019*size,brass);
    rod(p(-.29,.01,0),p(-.57,-.18,0),.019*size,brass);
    rod(p(0,-.18,0),p(.025,-.37,0),.012*size,red);
    for(let i=0;i<3;i++)rod(p(.025,-.37,0),p((i-1)*.045,-.48,.008*i),.012*size,enamel);
    loop(p(.04,.265,0),[.045*size,.06*size,.032*size],brass,"z",.11);
    rod(p(.04,.304,0),p(.04,.72,0),.013*size,brass);
    solid("ellipse",x,z,.40*size,.19*size,y-.25*size,y+.23*size,"鱼灯");
  }

  function willow(x,y,z) {
    const wood=mat("625344",.09), crown=["52795e","74936a","9eae73"].map(hex=>mat(hex,.08));
    polyline([[x,y,z],[x-.14,y+.72,z+.02],[x-.22,y+1.23,z+.04],[x+.04,y+1.74,z-.03]],.084,wood);
    solid("ellipse",x-.12,z+.02,.115,.13,y,y+1.37,"垂柳");
    for(let i=0;i<6;i++){
      const a=i*tau/6+.22, spread=.62+r()*.58;
      const bx=x+Math.cos(a)*spread,bz=z+Math.sin(a)*spread*.72;
      const by=y+1.69+r()*.43;
      polyline([[x-.19,y+1.13,z+.04],[(x+bx)*.5,by-.14,(z+bz)*.5],[bx,by,bz]],.036,wood);
      oval([bx,by,bz],[.40+r()*.20,.13+r()*.08,.32+r()*.15],crown[i%3],-.24+i*.09);
      for(let j=0;j<4;j++){
        const side=j/4-.375, px=bx+Math.cos(a+Math.PI/2)*side,pz=bz+Math.sin(a+Math.PI/2)*side;
        const length=.48+r()*.62;
        const end=[px+.12*Math.cos(a),by-length,pz+.14*Math.sin(a)];
        polyline([[px,by,pz],[px-.055,by-length*.45,pz+.05],end],.012,stems);
        if(j%2===0)oval([end[0]+.008,end[1]+.12,end[2]],[.044,.16,.033],crown[(i+j)%3],.13);
      }
    }
  }

  function bamboo(x,y,z) {
    for(let i=0;i<7;i++){
      const px=x+(r()-.5)*.57,pz=z+(r()-.5)*.49, height=.71+r()*1.43;
      const lean=(r()-.5)*.35;
      rod([px,y,pz],[px+lean,y+height,pz+.065],.025,stems);
      for(let j=1;j<=3;j++){
        const d=j/4;
        const center=[px+lean*d,y+height*d,pz+.065*d];
        pillar(center,[.032,.011,.032],spring,7);
        const side=(i+j)%2?1:-1;
        rod(center,[center[0]+side*.22,center[1]+.16,center[2]+.055],.008,green);
        oval([center[0]+side*.28,center[1]+.15,center[2]+.058],[.18,.037,.032],leaves[(i+j)%3],side*.22);
      }
    }
  }

  function moonArch(x,y,z) {
    const radius=.79, rise=.92, thickness=.106, count=18, depth=.14;
    const front=[],back=[],inside=[],outer=[];
    for(let i=0;i<=count;i++){
      const a=Math.PI*i/count;
      front.push([x+Math.cos(a)*radius,y+rise+Math.sin(a)*radius,z+depth]);
      back.push([x+Math.cos(a)*radius,y+rise+Math.sin(a)*radius,z-depth]);
      inside.push([x+Math.cos(a)*(radius-thickness),y+rise+Math.sin(a)*(radius-thickness),z+depth]);
      outer.push([x+Math.cos(a)*(radius+thickness),y+rise+Math.sin(a)*(radius+thickness),z-depth]);
    }
    for(let i=1;i<=count;i++){
      const a=front[i-1],b=front[i],c=inside[i-1],d=inside[i];
      triangles([[a,b,c],[b,d,c]],i%3?glaze:jadeEdge,[0,0,1]);
      const e=back[i-1],f=back[i],g=outer[i-1],h=outer[i];
      triangles([[e,f,g],[f,h,g]],jade,[0,0,-1]);
      triangles([[a,e,b],[b,e,f]],jadeEdge,[0,1,0]);
    }
    for(const side of [-1,1]){
      const px=x+side*(radius-.04);
      box([px,y+rise*.48,z],[.115,rise*.51,depth],jade);
      box([px,y+.13,z],[.185,.12,depth+.053],jadeEdge);
      solid("box",px,z,.115,depth,y,y+rise,"听泉月门");
    }
    solid("box",x,z,.57,depth,y+1.46,y+1.75,"听泉月门");
  }

  function waterfall() {
    const points=[[15.93,.019,12.50],[16.18,.025,13.01],[16.37,-.14,13.50],
      [16.42,-.57,13.85],[16.35,-1.72,14.13],[16.19,-3.16,14.26],[16.04,-4.92,14.36],[15.99,-5.73,14.38]];
    for(let stream=-1;stream<=1;stream++){
      const rows=points.map((p,i)=>{
        const width=.20+(i===0?.045:0)-i*.013;
        const cx=p[0]+stream*.16;
        return [[cx-width,p[1]+stream*.008,p[2]+stream*.036],[cx+width,p[1]+stream*.008,p[2]+stream*.036]];
      });
      const faces=[];
      for(let i=1;i<rows.length;i++){
        const [a,b]=rows[i-1],[c,d]=rows[i];
        faces.push([a,b,c],[b,d,c]);
      }
      triangles(faces,stream===0?waterShade:foam,[0,1,1]);
      const trace=points.map((p,i)=>[p[0]+stream*.148+Math.sin(i*.68+stream)*.047,p[1]-.006,p[2]+.095]);
      polyline(trace,.014,waterFlash);
    }
    for(let i=0;i<5;i++){
      const dx=(r()-.5)*1.11,dz=(r()-.5)*.77;
      oval([15.96+dx,-5.80+r()*.20,14.34+dz],[.15+r()*.17,.035,.13+r()*.14],i%2?waterShade:foam);
    }
  }

  landform();
  terrace();
  deck();
  pondSurface();
  waterfall();
  plaque();
  moonArch(16.77,.32,9.56);
  willow(15.03,.36,8.74);
  bamboo(16.51,.33,12.78);
  bamboo(17.17,.32,10.51);
  for(let i=0;i<6;i++){
    const px=13.57+r()*.54,pz=13.26+r()*.16,h=.12+r()*.18;
    rod([px,.34,pz],[px+.08,.34+h,pz-.045],.011,stems);
    oval([px+.10,.34+h,pz-.045],[.083,.023,.016],green,-.24);
  }
  const pole=[17.26,.37,12.44], arm=[16.52,2.22,12.37];
  polyline([pole,[17.27,1.51,12.45],[17.14,2.11,12.41],arm],.043,red);
  solid("ellipse",pole[0],pole[2],.052,.052,pole[1],2.12,"鱼灯架");
  fishLantern(16.52,1.62,12.37,.81);
  fishLantern(13.97,1.67,8.99,.61);
  for(const [px,py,pz,s] of [[16.88,.37,11.06,.31],[17.20,.34,12.20,.38],[14.18,.31,13.35,.22],[12.28,.34,9.03,.19],[13.84,.33,9.27,.22]]){
    pillar([px,py+s*.23,pz],[s*.98,s*.34,s*.63],cliff[2],6,.65);
    oval([px+.02,py+s*.55,pz],[s*.66,s*.21,s*.51],grass[2],.25);
  }
  return [];
}
