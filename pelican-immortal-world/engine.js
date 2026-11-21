function startImmortalWorld() {
  const $ = id => document.getElementById(id);
  const canvas = $("scene"), stage = $("stage");
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) throw Error("WebGL unavailable");

  const PI = Math.PI, TAU = PI * 2, UP = [0,1,0], Z = [0,0,1];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const add = (a,b) => a.map((x,i) => x+b[i]);
  const sub = (a,b) => a.map((x,i) => x-b[i]);
  const scale = (a,k) => a.map(x => x*k);
  const dot = (a,b) => a.reduce((sum,x,i) => sum+x*b[i], 0);
  const cross = ([x,y,z],[a,b,c]) => [y*c-z*b,z*a-x*c,x*b-y*a];
  const length = a => Math.hypot(...a);
  const norm = a => scale(a,1/(length(a)||1));
  const lerp = (a,b,t) => a+(b-a)*t;
  const mix = (a,b,t) => a.map((x,i) => lerp(x,b[i],t));
  function ease(a,b,v) {
    const t = clamp((v-a)/(b-a),0,1);
    return t*t*(3-2*t);
  }
  function rng(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(1664525,state)+1013904223) >>> 0;
      return state/4294967296;
    };
  }
  function rgb(hex) {
    return hex.replace(/^#/,"").match(/../g).map(channel=>parseInt(channel,16)/255);
  }
  function material(hex, gloss=.07, glow=0, opacity=1) {
    return { color:rgb(hex), gloss, glow, opacity };
  }
  function transform(p,x,y,z) {
    return new Float32Array([...x,0,...y,0,...z,0,...p,1]);
  }
  function shape(p,[rx,ry,rz],angle=0) {
    const c=Math.cos(angle),s=Math.sin(angle);
    return transform(p,[rx*c,rx*s,0],[-ry*s,ry*c,0],[0,0,rz]);
  }
  function align(p,axis,[rx,ry,rz]) {
    const y=norm(axis),x=norm(cross(y,Math.abs(y[2])>.9?[1,0,0]:Z));
    return transform(p,scale(x,rx),scale(y,ry),scale(cross(x,y),rz));
  }
  function multiply(a,b) {
    const result = new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++)
      result[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    return result;
  }
  const identity=shape([0,0,0],[1,1,1]);
  function camera(eye,target,aspect,fov) {
    const z=norm(sub(eye,target)), x=norm(cross(UP,z)),y=cross(z,x);
    const view=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
    const lens=Math.tan(fov*PI/360), f=1/lens, near=.1, far=135;
    const projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
    return {vp:multiply(projection,view),x,y,forward:scale(z,-1),lens};
  }

  function program(vertex,fragment,attributes,uniforms) {
    function shader(type,source) {
      const handle=gl.createShader(type);
      gl.shaderSource(handle,source);
      gl.compileShader(handle);
      if(!gl.getShaderParameter(handle,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(handle));
      return handle;
    }
    const handle=gl.createProgram();
    gl.attachShader(handle,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(handle,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(handle);
    if(!gl.getProgramParameter(handle,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(handle));
    return {
      handle,
      a:Object.fromEntries(attributes.map(name=>[name,gl.getAttribLocation(handle,name)])),
      u:Object.fromEntries(uniforms.map(name=>[name,gl.getUniformLocation(handle,name)]))
    };
  }

  const solid=program(`
    attribute vec3 position, normal;
    uniform mat4 model, vp;
    varying vec3 world, n;
    void main(){
      vec4 p=model*vec4(position,1.);
      vec3 x=model[0].xyz,y=model[1].xyz,z=model[2].xyz;
      n=x*normal.x/dot(x,x)+y*normal.y/dot(y,y)+z*normal.z/dot(z,z);
      world=p.xyz;
      gl_Position=vp*p;
    }`,`
    precision mediump float;
    varying vec3 world,n;
    uniform vec3 color,eye,haze,ambient,light,lightDir;
    uniform vec3 lamps[3];
    uniform vec3 lampPower;
    uniform float gloss,glow,opacity,terrain;
    void main(){
      vec3 normal=normalize(n);
      vec3 view=normalize(eye-world);
      float key=max(dot(normal,lightDir),0.);
      float sky=normal.y*.5+.5;
      float rim=pow(1.-max(dot(normal,view),0.),3.);
      float shine=pow(max(0.,dot(normal,normalize(lightDir+view))),36.)*gloss;
      float grain=sin(world.y*22.+sin(world.x*1.1+world.z*2.1)*2.4);
      float strata=sin(world.y*5.1+sin(world.x*.86)*1.5+cos(world.z*.67));
      float pigment=1.+terrain*(grain*.025+strata*.075);
      vec3 litByLamps=vec3(0.);
      if(dot(lampPower,vec3(1.))>.002){
        for(int i=0;i<3;i++){
          vec3 offset=lamps[i]-world;
          float d2=dot(offset,offset);
          float falloff=max(0.,1.-d2*.048)/(1.+d2*.49);
          float facing=.22+.78*max(0.,dot(normal,offset*inversesqrt(max(.001,d2))));
          litByLamps+=lampPower[i]*falloff*facing*vec3(1.37,.76,.34);
        }
      }
      vec3 lin=pow(color,vec3(2.2))*(ambient+sky*.15+light*key+litByLamps)*pigment+shine*light+rim*.075*light;
      vec3 lit=mix(pow(max(lin,0.),vec3(.4545)),color,clamp(glow,0.,1.));
      float d=length(eye-world);
      float floorMist=(1.-smoothstep(-5.,3.,world.y))*smoothstep(11.,42.,d)*.41;
      float fog=clamp(smoothstep(10.,87.,d)*.87+floorMist,0.,.96)*(1.-clamp(glow*.26,0.,.70));
      gl_FragColor=vec4(mix(lit,haze,fog),opacity);
    }`,["position","normal"],["model","vp","color","eye","haze","ambient","light","lightDir","gloss","glow","opacity","terrain","lamps[0]","lampPower"]);

  const sky=program(`
    attribute vec2 position;
    varying vec2 uv;
    void main(){uv=position;gl_Position=vec4(position,0.,1.);}`,`
    precision highp float;
    varying vec2 uv;
    uniform vec3 right,up,forward,zenith,horizon,cloud,sun,accent,eye;
    uniform vec2 lens;
    uniform float clock,night,storm,rayMode;
    float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){return noise(p)*.57+noise(p*2.12+11.)*.28+noise(p*4.67+7.)*.15;}
    void main(){
      vec3 ray=normalize(forward+right*uv.x*lens.x+up*uv.y*lens.y);
      float h=ray.y, a=atan(ray.x,-ray.z);
      vec3 color=mix(horizon,zenith,smoothstep(-.10,.46,h));
      vec3 orbDir=normalize(vec3(.78,.070,-1.));
      float moonDistance=length(ray-orbDir);
      float moon=mix(.049,.033,night);
      float halo=exp(-moonDistance*(6.8+night*11.));
      color+=sun*halo*(.29+night*.07)*(1.-storm*.82);
      float disc=1.-smoothstep(moon-.0015,moon+.0025,moonDistance);
      float crater=fbm(ray.xy*165.+23.);
      color=mix(color,sun*(.94+.06*crater),disc*(1.-storm*.90));
      vec2 starGrid=vec2(a,h)*134.;
      vec2 cell=floor(starGrid), local=fract(starGrid)-.5;
      float seed=hash(cell);
      local-=vec2(hash(cell+12.),hash(cell+7.))*.56-.28;
      float star=(1.-smoothstep(.020,.10+seed*.07,length(local)))*step(.957,seed);
      color+=mix(vec3(.58,.79,1.),sun,seed)*star*night*smoothstep(-.22,.06,h)*(.75+.25*sin(clock*2.+seed*76.));
      float auroraCenter=.17+.075*sin(a*2.8+eye.x*.005)+.035*sin(a*6.2);
      float aurora=exp(-abs(h-auroraCenter)*29.)*fbm(vec2(a*5.5,h*2.+clock*.045));
      color+=accent*aurora*rayMode*.34;
      float cloudH=fbm(vec2(a*4.8+eye.x*.016+eye.z*.013,h*11.+clock*.028));
      float upper=smoothstep(.49,.75,cloudH)*smoothstep(-.02,.19,h)*(1.-smoothstep(.32,.57,h));
      color=mix(color,mix(cloud,zenith,storm*.57),upper*(.28+storm*.49));
      for(int i=0;i<3;i++){
        float layer=float(i);
        float serration=fbm(vec2(a*(5.+layer*3.2)+eye.x*(.012+layer*.006),9.4+layer*5.9));
        float silhouette=-.092-layer*.032+serration*(.104+layer*.042);
        float ridge=1.-smoothstep(silhouette-.007,silhouette+.003,h);
        color=mix(color,mix(horizon,zenith,.29+layer*.12),ridge*(.55+layer*.09)*(1.-night*.44));
      }
      float v=max(.08,-h+.15);
      vec2 sea=(ray.xz/v)*1.85+vec2(eye.x*.047+clock*.065,eye.z*.047);
      float waves=fbm(sea)+fbm(sea*.37+9.)*.27;
      float mist=smoothstep(.34,.80,waves)*(1.-smoothstep(-.40,.08,h));
      vec3 seaColor=mix(horizon,cloud,.70+waves*.19);
      color=mix(color,seaColor,mist*(.88-night*.28));
      color=mix(color,cloud,.31*(1.-smoothstep(-.68,.02,h)));
      float vignette=1.-.18*dot(uv*vec2(.68,.52),uv*vec2(.68,.52));
      float dither=hash(gl_FragCoord.xy)*.006-.003;
      gl_FragColor=vec4(color*vignette+dither,1.);
    }`,["position"],["right","up","forward","zenith","horizon","cloud","sun","accent","eye","lens","clock","night","storm","rayMode"]);
  const skyBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);

  const spark=program(`
    attribute vec3 position,color;
    attribute vec2 data;
    uniform mat4 vp;
    uniform float pixels;
    varying vec4 tint;
    void main(){
      gl_Position=vp*vec4(position,1.);
      gl_PointSize=clamp(data.x*pixels/max(1.,gl_Position.w),1.,120.);
      tint=vec4(color,data.y);
    }`,`
    precision mediump float;
    varying vec4 tint;
    void main(){
      vec2 p=gl_PointCoord*2.-1.;
      float r=dot(p,p), aura=exp(-4.*r)*max(0.,1.-r),core=exp(-21.*r);
      gl_FragColor=vec4(mix(tint.rgb,vec3(1.),core*.72),tint.a*(aura*.47+core*.8));
    }`,["position","color","data"],["vp","pixels"]);
  const sparkBuffer=gl.createBuffer();

  const mist=program(`
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec2 data;
    uniform mat4 vp;
    varying vec2 p,info;
    void main(){p=uv;info=data;gl_Position=vp*vec4(position,1.);}`,`
    precision mediump float;
    varying vec2 p,info;
    uniform vec3 cloud,haze;
    uniform float time;
    float rand(vec2 v){return fract(sin(dot(v,vec2(24.31,51.77)))*913.13);}
    float noise(vec2 x){
      vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(rand(i),rand(i+vec2(1,0)),f.x),mix(rand(i+vec2(0,1)),rand(i+1.),f.x),f.y);
    }
    void main(){
      vec2 q=p*vec2(1.,1.1);
      vec2 n=p*vec2(3.3,2.2)+vec2(info.x,time*.037);
      float billow=noise(n)*.66+noise(n*2.33+4.2)*.22+noise(n*4.1-8.5)*.12;
      float volume=smoothstep(.1,.81,1.-dot(q,q)+billow*.48-.34);
      float edges=1.-smoothstep(.67,1.,max(abs(p.x),abs(p.y)));
      float lum=.48+.37*billow+.16*p.y;
      gl_FragColor=vec4(mix(haze,cloud,lum),info.y*volume*edges);
    }`,["position","uv","data"],["vp","cloud","haze","time"]);
  const mistBuffer=gl.createBuffer();

  function mesh(vertices,indices) {
    return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
  }
  function upload(geometry) {
    if(geometry.points) return;
    geometry.points=gl.createBuffer();
    geometry.faces=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,geometry.points);
    gl.bufferData(gl.ARRAY_BUFFER,geometry.vertices,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geometry.faces);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
  }
  function surface(rows,columns,sample) {
    const vertices=[],indices=[];
    for(let r=0;r<=rows;r++) for(let c=0;c<=columns;c++){
      vertices.push(...sample(r/rows,c/columns*TAU));
      if(r===rows||c===columns) continue;
      const i=r*(columns+1)+c,n=i+columns+1;
      indices.push(i,n,i+1,i+1,n,n+1);
    }
    return mesh(vertices,indices);
  }
  function ball(rows,columns) {
    return surface(rows,columns,(t,a)=>{
      const p=[Math.sin(t*PI)*Math.cos(a),Math.cos(t*PI),Math.sin(t*PI)*Math.sin(a)];
      return [...p,...p];
    });
  }
  function prism(sides,taper) {
    const vertices=[],indices=[];
    function face(points,n) {
      const start=vertices.length/6;
      points.forEach(p=>vertices.push(...p,...n));
      for(let i=1;i<points.length-1;i++) indices.push(start,start+i,start+i+1);
    }
    for(let i=0;i<sides;i++){
      const a=TAU*(i+.5)/sides,b=TAU*(i+1.5)/sides;
      const pa=[Math.cos(a),0,Math.sin(a)],pb=[Math.cos(b),0,Math.sin(b)];
      const p0=add(pa,[0,-1,0]),p1=add(pb,[0,-1,0]);
      const p2=add(scale(pb,taper),[0,1,0]),p3=add(scale(pa,taper),[0,1,0]);
      face([p0,p1,p2,p3],norm(cross(sub(p2,p1),sub(p1,p0))));
      face([[0,-1,0],p0,p1],[0,-1,0]);
      face([[0,1,0],p3,p2],UP);
    }
    return mesh(vertices,indices);
  }
  const sphere=ball(16,26), worldBall=ball(8,12);
  const cylinder=prism(15,1), thinCylinder=prism(6,1);
  const cube=(()=>{
    const square=prism(4,1), vertices=square.vertices;
    for(let i=0;i<vertices.length;i+=6){vertices[i]*=Math.SQRT2;vertices[i+2]*=Math.SQRT2}
    return square;
  })();
  function torus(radius,tube,segments=68,tubeSegments=9) {
    return surface(segments,tubeSegments,(t,a)=>{
      const s=Math.sin(t*TAU),c=Math.cos(t*TAU),r=radius+tube*Math.cos(a);
      return [r*c,r*s,tube*Math.sin(a),c*Math.cos(a),s*Math.cos(a),Math.sin(a)];
    });
  }
  function loft(sections,rings=42,sides=25) {
    function spline(t) {
      const raw=clamp(t,0,1)*(sections.length-1);
      const i=Math.min(sections.length-2,Math.floor(raw)),u=raw-i;
      const p=sections[i],q=sections[i+1],before=sections[Math.max(0,i-1)],after=sections[Math.min(sections.length-1,i+2)];
      return p.map((x,k)=>{
        const a=.5*(q[k]-before[k]),b=.5*(after[k]-x),v=q[k];
        return (2*u**3-3*u**2+1)*x+(u**3-2*u**2+u)*a+(-2*u**3+3*u**2)*v+(u**3-u**2)*b;
      });
    }
    function point(t,a) {
      const [x,y,z,h,w]=spline(t),[dx,dy]=sub(spline(t+.001),spline(t-.001));
      const d=Math.hypot(dx,dy)||1,b=Math.cos(a)*Math.max(.001,h);
      return [x-dy/d*b,y+dx/d*b,z+Math.sin(a)*Math.max(.001,w)];
    }
    return surface(rings,sides,(t,a)=>{
      const around=sub(point(t,a+.004),point(t,a-.004)),along=sub(point(t+.001,a),point(t-.001,a));
      return [...point(t,a),...norm(cross(around,along))];
    });
  }

  let list;
  function capture(callback) {
    const previous=list;
    list=[];
    try {callback();return list} finally {list=previous}
  }
  function object(geometry,matrix,finish) {list.push({geometry,matrix,finish})}
  function oval(pos,sizes,finish,angle=0) {object(sphere,shape(pos,sizes,angle),finish)}
  function worldOval(pos,sizes,finish,angle=0) {object(worldBall,shape(pos,sizes,angle),finish)}
  function rodWith(geometry,a,b,radius,finish) {
    const direction=sub(b,a),half=length(direction)/2;
    if(half>1e-5) object(geometry,align(mix(a,b,.5),direction,[radius,half,radius]),finish);
  }
  function rod(a,b,radius,finish) {rodWith(thinCylinder,a,b,radius,finish)}
  function capsule(a,b,radius,depth,finish) {
    const direction=sub(b,a);
    object(sphere,align(mix(a,b,.5),direction,[radius,length(direction)/2+radius*.24,depth]),finish);
  }
  function box(pos,sizes,finish,angle=0) {object(cube,shape(pos,sizes,angle),finish)}
  function ring(geometry,pos,finish) {object(geometry,shape(pos,[1,1,1]),finish)}
  function sweep(sections,finish) {object(loft(sections),identity,finish)}
  function polyline(points,radius,finish) {
    for(let i=1;i<points.length;i++) rod(points[i-1],points[i],radius,finish);
  }
  function roundedPath(points,radius,finish) {
    polyline(points,radius,finish);
    for(const p of points) oval(p,[radius,radius,radius],finish);
  }
  const prisms=new Map(), hoops=new Map();
  function pillar(pos,sizes,finish,sides=8,topRatio=1) {
    const key=sides+":"+topRatio;
    if(!prisms.has(key)) prisms.set(key,prism(sides,topRatio));
    object(prisms.get(key),shape(pos,sizes),finish);
  }
  function spire(pos,sizes,finish,sides=6) {pillar(pos,sizes,finish,sides,.015)}
  function loop(pos,[rx,ry,rz],finish,axis="z",tube=.025) {
    const key=tube.toFixed(4);
    if(!hoops.has(key)) hoops.set(key,torus(1,tube,48,6));
    const matrix=axis==="y"?transform(pos,[rx,0,0],[0,0,rz],[0,-ry,0]):
      axis==="x"?transform(pos,[0,0,rz],[0,ry,0],[-rx,0,0]):shape(pos,[rx,ry,rz]);
    object(hoops.get(key),matrix,finish);
  }

  function ribbon(points,widths,finish) {
    const vertices=[],indices=[];
    points.forEach((p,i)=>{
      const span=Array.isArray(widths[i])?widths[i]:[0,widths[i],0];
      const along=sub(points[Math.min(points.length-1,i+1)],points[Math.max(0,i-1)]);
      const normal=norm(cross(along,span));
      vertices.push(...sub(p,span),...normal,...add(p,span),...normal);
      if(i) indices.push(2*i-2,2*i,2*i-1,2*i-1,2*i,2*i+1);
    });
    const geometry=mesh(vertices,indices);
    geometry.temporary=true;
    object(geometry,identity,finish);
  }

  // Bake each static cluster by material, retaining one culling bound per cluster.
  function bake(objects) {
    const buckets=new Map(), result=[];
    function flush(bucket) {
      if(!bucket.indices.length) return;
      result.push({geometry:mesh(bucket.vertices,bucket.indices),matrix:identity,finish:bucket.finish});
      bucket.vertices=[];bucket.indices=[];
    }
    for(const entry of objects){
      const {geometry,matrix:m,finish}=entry;
      if(!buckets.has(finish)) buckets.set(finish,{finish,vertices:[],indices:[]});
      const b=buckets.get(finish),v=geometry.vertices;
      if(b.vertices.length+v.length>360000) flush(b);
      const offset=b.vertices.length/6;
      const ix=1/(m[0]**2+m[1]**2+m[2]**2),iy=1/(m[4]**2+m[5]**2+m[6]**2),iz=1/(m[8]**2+m[9]**2+m[10]**2);
      for(let i=0;i<v.length;i+=6){
        const x=v[i],y=v[i+1],z=v[i+2],nx=v[i+3]*ix,ny=v[i+4]*iy,nz=v[i+5]*iz;
        b.vertices.push(m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14],
          m[0]*nx+m[4]*ny+m[8]*nz,m[1]*nx+m[5]*ny+m[9]*nz,m[2]*nx+m[6]*ny+m[10]*nz);
      }
      for(const i of geometry.indices) b.indices.push(i+offset);
    }
    for(const bucket of buckets.values()) flush(bucket);
    return result;
  }
  let boundGeometry;
  function drawBatch(objects,parent) {
    for(const {geometry,matrix,finish} of objects){
      upload(geometry);
      if(boundGeometry!==geometry){
        gl.bindBuffer(gl.ARRAY_BUFFER,geometry.points);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,geometry.faces);
        gl.vertexAttribPointer(solid.a.position,3,gl.FLOAT,false,24,0);
        gl.vertexAttribPointer(solid.a.normal,3,gl.FLOAT,false,24,12);
        boundGeometry=geometry;
      }
      gl.uniformMatrix4fv(solid.u.model,false,parent?multiply(parent,matrix):matrix);
      gl.uniform3fv(solid.u.color,finish.color);
      gl.uniform1f(solid.u.gloss,finish.gloss);
      gl.uniform1f(solid.u.glow,finish.glow);
      gl.uniform1f(solid.u.opacity,finish.opacity??1);
      gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_SHORT,0);
      if(geometry.temporary){
        gl.deleteBuffer(geometry.points);
        gl.deleteBuffer(geometry.faces);
        boundGeometry=undefined;
      }
    }
  }

  const riderApi={material,shape,transform,add,sub,scale,mix,norm,dot,length,clamp,multiply,torus,mesh,sphere,cylinder,
    object,oval,rod,capsule,ring,sweep,roundedPath,capture,drawBatch,ribbon};
  let capturedColliders;
  const collider=descriptor=>capturedColliders.push(descriptor);
  const worldApi={mat:material,oval:worldOval,worldOval,rod,box,pillar,spire,loop,polyline,rng,ribbon,mesh,object,shape,transform,capsule,collider};
  const drawRider=buildImmortalRider(riderApi);
  const world=buildImmortalWorld(worldApi);
  const cellSize=world.cellSize;
  const fishIsland=IMMORTAL_FISH_ISLAND;
  const herbCove=IMMORTAL_HERB_COVE,lanternStop=IMMORTAL_LANTERN_STOP;
  const destinations={
    fish:{site:fishIsland,name:"灵鱼汀",label:"灵鱼汀",working:"捕鱼中",duration:5.8,
      travel:"沿鱼灯的方向飞向泊台。",land:"鹈鹕下车，等鱼游到岸边。",finish:"吃饱了"},
    herb:{site:herbCove,name:"瀑隐坞",label:"采灵草",working:"采草中",duration:6.5,
      travel:"顺着水声飞向悬瀑，再从岩壁外侧绕进洞中。",land:"鹈鹕收好脚架，走向瀑后的灵草。",finish:"采到灵草"},
    lantern:{site:lanternStop,name:"灯河夜渡",label:"点宝灯",working:"点灯中",duration:10.4,
      travel:"驶向夜色中的灯河，沿星纹泊岸。",land:"鹈鹕沿石岸走向第一盏法宝灯。",finish:"三灯齐明"}
  };
  const docks=Object.values(destinations).map(destination=>destination.site.dock);
  const lampLitAt=lanternStop.targets.map(()=>-Infinity);
  const lampPositions=new Float32Array(lanternStop.targets.flat());
  const lampTimes=[.30,.47,.64];
  const lampLocalTaps=(lanternStop.taps??lanternStop.targets).map(p=>{
    const dock=lanternStop.dock,c=Math.cos(dock.heading),s=Math.sin(dock.heading);
    const x=p[0]-dock.x,z=p[2]-dock.z;
    return [x*c+z*s,p[1]-dock.y,z*c-x*s];
  });
  function groundHeight(x,z) {
    const clouds=Math.sin(x*.047)*Math.cos(z*.035)*.56+Math.sin((x+z)*.122)*.18;
    const crest=Math.exp(-(((x-8)/4.3)**2))-Math.exp(-((8/4.3)**2));
    return clouds+crest*1.32*Math.exp(-((z/3.9)**2));
  }
  const collision=createImmortalCollision();
  const journey=createImmortalMotion(groundHeight,collision), state=journey.state;
  const pilot=createImmortalAutopilot();
  const pilotWorld={groundHeight,obstruction:collision.obstruction,biomeAt:(x,z)=>biomeAt(cellOf(x),cellOf(z))};

  const biomes=[
    {name:"青岚仙山",hint:"青云观外可绕檐看瀑。向东是剑墟，向南是灯河。",ink:"bae7c1",zenith:"1e4968",horizon:"90b8af",cloud:"ffefce",sun:"fff1bd",haze:"a2c2bc",ambient:[.39,.47,.48],light:[.91,.76,.52],night:.03,storm:0,rayMode:.20},
    {name:"万剑归墟",hint:"飞剑环绕剑台，紫电游走于岩隙。试试升到剑阵上方。",ink:"d5b6ff",zenith:"28214e",horizon:"7b739d",cloud:"c3addd",sun:"e7d6ff",haze:"8375a1",ambient:[.41,.39,.54],light:[.76,.61,.89],night:.25,storm:.74,rayMode:.51},
    {name:"灯河幻境",hint:"宝灯沿着漂浮的莲台散开。靠近灯火，便能看清灯罩里的灵珠。",ink:"aadaff",zenith:"141b45",horizon:"495d8d",cloud:"a5b2db",sun:"e9f4ff",haze:"566f9c",ambient:[.33,.43,.63],light:[.68,.79,1.05],night:1,storm:0,rayMode:1},
    {name:"赤霄天阙",hint:"朱门金瓦在云上层层展开，御风去看高处的照壁和悬铃。",ink:"ffe1a0",zenith:"616a87",horizon:"dfad90",cloud:"ffebca",sun:"fff3bd",haze:"d8b3a0",ambient:[.52,.44,.40],light:[.97,.73,.46],night:0,storm:0,rayMode:.22},
    {name:"流霞桃坞",hint:"桃花开在悬岛边，山泉从空中流入云层。绕到瀑布另一面看看。",ink:"ffd0cb",zenith:"42637c",horizon:"d6adc0",cloud:"fff0dd",sun:"fff3c3",haze:"cbb0bd",ambient:[.47,.44,.49],light:[.91,.72,.70],night:.08,storm:0,rayMode:.35}
  ];
  const colorKeys=["zenith","horizon","cloud","sun","haze","ambient","light"];
  const weatherKeys=["night","storm","rayMode"];
  for(const b of biomes){
    for(const key of colorKeys)if(typeof b[key]==="string")b[key]=rgb(b[key]);
    b.accent=material(b.ink,.08,.96);
  }
  const palette={...biomes[0],accent:{...biomes[0].accent}};
  function updatePalette(index,dt) {
    const aim=biomes[index],t=1-Math.exp(-dt*2.6);
    for(const key of colorKeys)palette[key]=mix(palette[key],aim[key],t);
    for(const key of weatherKeys)palette[key]=lerp(palette[key],aim[key],t);
    palette.accent.color=mix(palette.accent.color,aim.accent.color,t);
  }
  const cellOf=coordinate=>Math.floor(coordinate/cellSize+.5);
  const hash=(x,z,salt=0)=>Math.imul(x+salt+7459,73856093)^Math.imul(z-salt-1341,19349663);
  function biomeAt(cx,cz) {
    if(cx===0&&cz===0)return 0;
    if(Math.abs(cx)+Math.abs(cz)<5){
      if(Math.abs(cx)>=Math.abs(cz))return cx>0?1:4;
      return cz>0?2:3;
    }
    return (hash(Math.floor(cx/2),Math.floor(cz/2),642)>>>0)%biomes.length;
  }
  const cells=new Map(),pending=[];
  const keyOf=(x,z)=>x+","+z;
  function loadCell(cx,cz) {
    const key=keyOf(cx,cz);
    if(cells.has(key))return;
    const biome=biomeAt(cx,cz);
    let props;
    const colliders=[];
    const objects=bake(capture(()=>{
      capturedColliders=colliders;
      try {
        props=cx===-1&&cz===0?buildImmortalHerbCove(worldApi):world.buildCell(cx,cz,biome);
        if(cx===0&&cz===0){
          const islandProps=buildImmortalFishIsland(worldApi);
          if(Array.isArray(islandProps))props.push(...islandProps);
        }
        if(cx===0&&cz===1){
          const lanternProps=buildImmortalLanternStop(worldApi);
          if(Array.isArray(lanternProps))props.push(...lanternProps);
        }
      } finally {capturedColliders=undefined}
    }));
    const rngCell=rng(hash(cx,cz,567)),clouds=[];
    for(let i=0;i<5;i++){
      const x=(cx+rngCell()-.5)*cellSize,z=(cz+rngCell()-.5)*cellSize;
      clouds.push({x,y:-6+rngCell()*5,z,width:7+rngCell()*9,height:2.7+rngCell()*4,seed:rngCell()*77,opacity:.37+rngCell()*.24});
    }
    props??=[];
    for(const prop of props){
      const parts=prop.type==="sword"?[[.79,.13],[.27,.14],[-.27,.14],[-.73,.21]]:
        prop.type==="lantern"?[[-.06,.24]]:[];
      prop.hitboxes=parts.map(([along,radius])=>{
        const box={type:"ellipse",kind:prop.type,x:prop.pos[0],z:prop.pos[2],yMin:Infinity,yMax:Infinity,rx:radius,rz:radius};
        colliders.push(box);
        return {along,radius,box};
      });
      updateSpiritCollider(prop,0);
    }
    cells.set(key,{cx,cz,x:cx*cellSize,z:cz*cellSize,biome,objects,props,clouds,colliders});
  }
  let lastCell="";
  function updateCells(cx,cz) {
    const key=keyOf(cx,cz);
    const changed=key!==lastCell;
    if(changed){
      lastCell=key;
      pending.length=0;
      for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
        if(!cells.has(keyOf(cx+dx,cz+dz)))pending.push([cx+dx,cz+dz,dx*dx+dz*dz]);
      }
      pending.sort((a,b)=>a[2]-b[2]);
      for(const [key,cell] of cells){
        if(Math.abs(cell.cx-cx)<4&&Math.abs(cell.cz-cz)<4)continue;
        for(const {geometry} of cell.objects){
          if(geometry.points)gl.deleteBuffer(geometry.points);
          if(geometry.faces)gl.deleteBuffer(geometry.faces);
        }
        cells.delete(key);
      }
    }
    const next=pending.shift();
    if(next)loadCell(next[0],next[1]);
    if(changed||next)collision.setCells([...cells.values()].filter(cell=>
      Math.abs(cell.cx-cx)<=2&&Math.abs(cell.cz-cz)<=2
    ));
    return [...cells.values()].filter(cell=>Math.hypot(cell.x-state.x,cell.z-state.z)<73);
  }
  loadCell(0,0);
  loadCell(1,0);
  loadCell(0,-1);
  loadCell(-1,0);
  loadCell(0,1);
  collision.setCells(cells.values());

  function bindSolid(view,eye) {
    gl.useProgram(solid.handle);
    for(const a of Object.values(solid.a))gl.enableVertexAttribArray(a);
    boundGeometry=undefined;
    gl.uniformMatrix4fv(solid.u.vp,false,view.vp);
    gl.uniform3fv(solid.u.eye,eye);
    gl.uniform3fv(solid.u.haze,palette.haze);
    gl.uniform3fv(solid.u.ambient,palette.ambient);
    gl.uniform3fv(solid.u.light,palette.light);
    gl.uniform3fv(solid.u.lightDir,norm([-.47,.76,.52]));
    gl.uniform3fv(solid.u["lamps[0]"],lampPositions);
    gl.uniform3fv(solid.u.lampPower,lanternStop.targets.map((_,i)=>lampStrength(i)));
  }
  function unbindSolid() {
    for(const a of Object.values(solid.a))gl.disableVertexAttribArray(a);
  }
  function skyPass(view,aspect,eye,time) {
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(sky.handle);
    gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);
    gl.enableVertexAttribArray(sky.a.position);
    gl.vertexAttribPointer(sky.a.position,2,gl.FLOAT,false,0,0);
    for(const [key,value] of Object.entries({
      right:view.x,up:view.y,forward:view.forward,zenith:palette.zenith,horizon:palette.horizon,cloud:palette.cloud,
      sun:palette.sun,accent:palette.accent.color,eye
    }))gl.uniform3fv(sky.u[key],value);
    gl.uniform2f(sky.u.lens,view.lens*aspect,view.lens);
    gl.uniform1f(sky.u.clock,time);
    for(const key of weatherKeys)gl.uniform1f(sky.u[key],palette[key]);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.disableVertexAttribArray(sky.a.position);
    gl.enable(gl.DEPTH_TEST);
  }
  function mistPass(view,eye,visible,time) {
    const clouds=[];
    for(const cell of visible)for(const cloud of cell.clouds){
      const x=cloud.x+Math.sin(time*.083+cloud.seed)*2.8,z=cloud.z+Math.cos(time*.067+cloud.seed)*1.8;
      const p=[x,cloud.y,z],depth=dot(sub(p,eye),view.forward);
      if(depth>8&&depth<60)clouds.push({...cloud,p,depth});
    }
    clouds.sort((a,b)=>a.depth-b.depth);
    clouds.length=Math.min(clouds.length,17);
    clouds.sort((a,b)=>b.depth-a.depth);
    const data=[];
    for(const cloud of clouds){
      const opacity=cloud.opacity*ease(6,15,cloud.depth)*(1-ease(45,70,cloud.depth));
      for(const [x,y] of [[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]]){
        const p=add(add(cloud.p,scale(view.x,x*cloud.width)),scale(view.y,y*cloud.height));
        data.push(...p,x,y,cloud.seed,opacity);
      }
    }
    gl.useProgram(mist.handle);
    gl.bindBuffer(gl.ARRAY_BUFFER,mistBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
    for(const [name,size,offset] of [["position",3,0],["uv",2,12],["data",2,20]]){
      gl.enableVertexAttribArray(mist.a[name]);
      gl.vertexAttribPointer(mist.a[name],size,gl.FLOAT,false,28,offset);
    }
    gl.uniformMatrix4fv(mist.u.vp,false,view.vp);
    gl.uniform3fv(mist.u.cloud,palette.cloud);
    gl.uniform3fv(mist.u.haze,palette.haze);
    gl.uniform1f(mist.u.time,time);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES,0,data.length/7);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    for(const a of Object.values(mist.a))gl.disableVertexAttribArray(a);
  }
  function sparkPass(view,data) {
    gl.useProgram(spark.handle);
    gl.bindBuffer(gl.ARRAY_BUFFER,sparkBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
    for(const [name,size,offset] of [["position",3,0],["color",3,12],["data",2,24]]){
      gl.enableVertexAttribArray(spark.a[name]);
      gl.vertexAttribPointer(spark.a[name],size,gl.FLOAT,false,32,offset);
    }
    gl.uniformMatrix4fv(spark.u.vp,false,view.vp);
    gl.uniform1f(spark.u.pixels,canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.depthMask(false);
    gl.drawArrays(gl.POINTS,0,data.length/8);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    for(const a of Object.values(spark.a))gl.disableVertexAttribArray(a);
  }

  // Tessellate the short road on fixed distance marks so new stones resolve at the tip.
  function beveledSlab(cut) {
    const rim=[[-1+cut,-1],[1-cut,-1],[1,-1+cut],[1,1-cut],[1-cut,1],[-1+cut,1],[-1,1-cut],[-1,-1+cut]];
    const layers=[[-1,.83],[.42,1],[1,.87]];
    const vertices=[],indices=[];
    function face(points,n) {
      const start=vertices.length/6;
      for(const p of points)vertices.push(...p,...n);
      for(let i=1;i<points.length-1;i++)indices.push(start,start+i,start+i+1);
    }
    const p=(j,k)=>[rim[k][0]*layers[j][1],layers[j][0],rim[k][1]*layers[j][1]];
    face(rim.map((_,i)=>p(2,i)),UP);
    face(rim.map((_,i)=>p(0,i)),[0,-1,0]);
    for(let j=0;j<2;j++)for(let i=0;i<rim.length;i++){
      const k=(i+1)%rim.length, a=p(j,i),b=p(j,k),c=p(j+1,k),d=p(j+1,i);
      face([a,b,c,d],norm(cross(sub(c,b),sub(b,a))));
    }
    return mesh(vertices,indices);
  }
  const slabs=[.13,.32,.20,.52].map(beveledSlab);
  const groundStones=["385a57","4a655b","435661","4e5f59"].map(hex=>material(hex,.19,.14));
  const airStones=["47716b","53638a","597f86","6b7490"].map(hex=>material(hex,.22,.38));
  const brass=material("f0c579",.29,.68), stoneInlay=material("b6d3a8",.08,.46);
  const sigilLoop=torus(1,.044,22,5);
  function sampleRoad(points,d) {
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i];
      if(d<a.distance||d>b.distance)continue;
      const f=(d-a.distance)/Math.max(.0001,b.distance-a.distance);
      return {p:mix([a.x,a.y,a.z],[b.x,b.y,b.z],f),forward:norm(sub([b.x,b.y,b.z],[a.x,a.y,a.z])),
        width:lerp(a.width,b.width,f),alpha:lerp(a.alpha,b.alpha,f),kind:a.kind};
    }
  }
  function roadPass(eye) {
    const support=state.roadSupport;
    const points=support.length ? [
      ...state.history.filter(p=>p.distance<support[0].distance),
      ...support,
      ...state.road.filter(p=>p.distance>support.at(-1).distance)
    ] : [...state.history,...state.road];
    const tiles=[],spacing=1.48;
    const start=points[0]?.distance??0,end=points.at(-1)?.distance??0;
    for(let i=Math.ceil(start/spacing);i*spacing<end;i++){
      const tile=sampleRoad(points,i*spacing);
      if(tile&&tile.alpha>.035)tiles.push({...tile,i});
    }
    tiles.sort((a,b)=>length(sub(b.p,eye))-length(sub(a.p,eye)));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    for(const tile of tiles){
      const {p,forward,i}=tile;
      if(docks.some(dock=>Math.abs(p[0]-dock.x)<8&&Math.abs(p[2]-dock.z)<2.6)){
        const deck=collision.surfaceHeight(p[0],p[2],p[1]+.055);
        if(deck!==undefined&&Math.abs(deck-p[1])<.055)continue;
      }
      const spell=ease(.24,1.5,p[1]-groundHeight(p[0],p[2]));
      const side=norm(cross(forward,UP)),up=norm(cross(side,forward));
      const forming=ease(.01,.77,tile.alpha);
      const halfWidth=tile.width*(.68+.32*forming);
      const opacity=(.23+.77*tile.alpha)*(1-.27*spell)*forming;
      const grade=(i+400000)%4;
      const thickness=.09+.011*grade-.048*spell;
      const center=add(p,scale(up,-thickness-(1-forming)*(.31+spell*.27)));
      const stone=(spell>.5?airStones:groundStones)[grade];
      const finish={...stone,color:mix(stone.color,palette.accent.color,.073+.08*spell),opacity};
      const point=(x,y,z)=>add(center,add(scale(forward,x),add(scale(up,y+thickness-.104),scale(side,z))));
      const glow={...palette.accent,opacity:forming*(.61+spell*.31)};
      const trim={...brass,opacity:forming*(.67+spell*.22)};
      const darkTrim={...stoneInlay,opacity:forming*.66};
      drawBatch(capture(()=>{
        object(slabs[grade],transform(center,scale(forward,.714),scale(up,thickness),scale(side,halfWidth)),finish);
        for(const direction of [-1,1]){
          const z=direction*halfWidth*.80;
          rod(point(-.52,.106,z),point(.52,.106,z),.012,i%5===0?trim:darkTrim);
          if(i%2===0){
            const tip=point(direction*.49,.122,z);
            object(cube,align(tip,up,[.037,.019,.043]),trim);
          }
        }
        if(tile.kind===0||spell>.48){
          const centerRune=point(0,.113,0);
          object(sigilLoop,transform(centerRune,scale(forward,.23),scale(side,.235),scale(up,-.025)),glow);
          rod(point(-.12,.119,0),point(.13,.119,0),.013,glow);
          rod(point(0,.119,-.12),point(0,.119,.12),.012,trim);
          if(spell>.48&&i%3===0){
            for(const side of [-1,1]){
              const gem=point(0,-.22,side*halfWidth*.69);
              spire(gem,[.049,.16,.049],glow,4);
              rod(point(0,-.055,side*halfWidth*.69),gem,.010,trim);
            }
          }
        }else if(tile.kind===1){
          for(const s of [-1,1]){
            rod(point(-.16,.111,s*.11),point(.04,.111,0),.013,glow);
            rod(point(.06,.111,s*.17),point(.31,.111,0),.011,trim);
          }
        }else if(tile.kind===2){
          for(const s of [-1,1])rod(point(-.21,.108,s*.16),point(.19,.108,s*.16),.011,darkTrim);
        }
      }));
    }
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
  const contactInk=material("0c222a",0,.82);
  const contactDisc=(()=>{
    const vertices=[0,0,0,0,1,0],indices=[];
    for(let i=0;i<=26;i++){
      const a=i*TAU/26;
      vertices.push(Math.cos(a),0,Math.sin(a),0,1,0);
      if(i)indices.push(0,i,i+1);
    }
    return mesh(vertices,indices);
  })();
  function wheelContacts() {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    const f=[Math.cos(state.heading),0,Math.sin(state.heading)], side=[-f[2],0,f[0]];
    for(const [point,contact,pressure] of [[state.rearPoint,state.contactRear,state.load],
      [state.frontPoint,state.contactFront,1-state.load]]){
      if(contact<.04)continue;
      const width=.095+pressure*.060,span=.17+pressure*.15;
      for(const [index,extent] of [1.45,1.06,.66].entries()){
        const p=add(point,[0,.014+.002*index,0]);
        const finish={...contactInk,opacity:contact*(.07+pressure*.12)};
        drawBatch([{geometry:contactDisc,matrix:transform(p,scale(f,span*extent),UP,scale(side,width*extent)),finish}]);
      }
    }
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  function bladeMesh() {
    const rings=[[-.61,.095,.029],[-.45,.12,.049],[.67,.085,.044],[1.08,.002,.004]];
    const vertices=[],indices=[];
    for(let i=1;i<rings.length;i++){
      const section=([y,w,t])=>[[-w,y,0],[0,y,t],[w,y,0],[0,y,-t]];
      const a=section(rings[i-1]),b=section(rings[i]);
      for(let side=0;side<4;side++){
        const next=(side+1)%4,first=vertices.length/6;
        const n=norm(cross(sub(a[next],a[side]),sub(b[side],a[side])));
        for(const p of [a[side],a[next],b[next],b[side]])vertices.push(...p,...n);
        indices.push(first,first+1,first+2,first,first+2,first+3);
      }
    }
    return mesh(vertices,indices);
  }
  const blade=bladeMesh();
  const bladeSilver=material("cfe9fb",.44,.48), bladeCore=material("8c76d9",.36,.85);
  const hilt=material("493b51",.29,.12), goldMetal=material("c49c53",.45,.33);
  const inkRed=material("803c45",.22,.15), silk=material("d06a54",.13,.4);
  const litGlass=material("ffc264",.24,.92), pearl=material("fff2c2",.16,1);
  const sword=bake(capture(()=>{
    object(blade,identity,bladeSilver);
    rod([0,-.58,.043],[0,.76,.037],.013,bladeCore);
    rod([0,-.61,-.043],[0,.76,-.037],.013,bladeCore);
    for(const s of [-1,1]){
      const tip=[s*.31,-.50,0];
      polyline([[0,-.63,0],[s*.18,-.65,0],tip],.037,goldMetal);
      spire(tip,[.040,.059,.038],brass,4);
    }
    pillar([0,-.80,0],[.063,.168,.056],hilt,8);
    for(let i=0;i<5;i++)pillar([0,-.92+i*.054,0],[.067,.012,.060],goldMetal,8);
    worldOval([0,-1,0],[.080,.067,.067],brass);
    polyline([[0,-1.02,0],[.07,-1.18,.03],[.13,-1.32,.065]],.013,silk);
  }));
  const lantern=bake(capture(()=>{
    worldOval([0,-.04,0],[.216,.25,.216],litGlass);
    worldOval([0,-.04,.055],[.113,.152,.113],pearl);
    pillar([0,.226,0],[.25,.037,.25],goldMetal,8);
    pillar([0,-.284,0],[.21,.036,.21],goldMetal,8);
    pillar([0,.29,0],[.113,.032,.113],inkRed,8);
    pillar([0,-.35,0],[.092,.038,.092],inkRed,8);
    loop([0,.375,0],[.082,.087,.055],brass,"z",.16);
    for(let i=0;i<8;i++){
      const a=i*TAU/8,x=Math.cos(a),z=Math.sin(a);
      polyline([[x*.20,.22,z*.20],[x*.244,.04,z*.244],[x*.219,-.17,z*.219],[x*.168,-.277,z*.168]],.012,goldMetal);
    }
    for(let i=-2;i<=2;i++)rod([0,-.38,0],[i*.031,-.60+Math.abs(i)*.032,.02],.009,silk);
  }));
  const lanternLight=rgb("ffc077"), swordLight=rgb("c1a3ff");
  const silkPink=rgb("ffb9ca"),riverLight=rgb("8fd9ff");
  const koiWhite=material("f7e4b7",.34,.19), koiOrange=material("f48546",.38,.22);
  const koiRed=material("bd503b",.35,.17), koiInk=material("253d39",.34,.10);
  const koiScale=material("ffba63",.47,.31), foam=material("b7ede0",.14,.78);
  const koiBodies=[koiOrange,koiWhite,koiRed].map((color,index)=>bake(capture(()=>{
    worldOval([.008,0,0],[.31,.087,.130],color);
    worldOval([.175,.014,0],[.139,.077,.108],color);
    worldOval([-.226,-.005,0],[.110,.048,.063],color);
    const spot=index===1?koiRed:koiWhite;
    worldOval([.096,.077,-.009],[.102,.022,.059],spot,.10);
    worldOval([-.090,.061,.041],[.084,.026,.052],spot,-.12);
    for(const sign of [-1,1]){
      worldOval([.235,.033,sign*.084],[.015,.014,.013],koiInk);
      worldOval([.036,-.025,sign*.14],[.112,.017,.053],koiScale);
    }
  })));
  const koiTail=mesh(
    [-.286,0,0, 0,1,0, -.495,.018,-.142, 0,1,0, -.425,.012,-.037, 0,1,0,
      -.425,.012,.037, 0,1,0, -.495,.018,.142, 0,1,0],
    [0,1,2,0,2,3,0,3,4]
  );
  function drawKoi(position,angle,bodyIndex,size,swimTime,pitch=0) {
    const c=Math.cos(angle),s=Math.sin(angle),rise=Math.sin(pitch),run=Math.cos(pitch);
    const forward=[c*run,rise,s*run],side=[-s,0,c],up=cross(side,forward);
    const pose=transform(position,scale(forward,size),scale(up,size),scale(side,size));
    drawBatch(koiBodies[bodyIndex%koiBodies.length],pose);
    const wag=Math.sin(swimTime*7.8)*.31, wc=Math.cos(wag),ws=Math.sin(wag);
    const hinge=[-.286,0,0];
    const rotation=transform([0,0,0],[wc,0,ws],UP,[-ws,0,wc]);
    const tail= multiply(multiply(shape(hinge,[1,1,1]),rotation),shape(scale(hinge,-1),[1,1,1]));
    drawBatch([{geometry:koiTail,matrix:tail,finish:bodyIndex%3===1?koiRed:koiScale}],pose);
  }
  function swimPose(index,time) {
    const pond=fishIsland.pond;
    const angle=time*(.51+index*.043)+index*TAU/6;
    const x=pond.x+Math.cos(angle)*pond.rx*(.50+.055*(index%3));
    const z=pond.z+Math.sin(angle)*pond.rz*(.42+.071*((index+1)%3));
    const yaw=Math.atan2(Math.cos(angle)*pond.rz,-Math.sin(angle)*pond.rx);
    return {position:[x,fishIsland.waterY+.019+.010*Math.sin(time*3.7+index),z],yaw};
  }
  function pondPass(eye,time,feeding,sparks) {
    const {pond,capture:catchPoint,waterY}=fishIsland;
    if(Math.hypot(eye[0]-pond.x,eye[2]-pond.z)>44)return;
    for(let i=0;i<6;i++){
      if(i===0&&(feeding>=.51||drawTime<fishReturnsAt))continue;
      let {position,yaw}=swimPose(i,time);
      if(i===0&&feeding>0){
        const approach=ease(.13,.49,feeding);
        position=mix(position,add(catchPoint,[.03,.026,0]),approach);
        yaw=lerp(yaw,PI,approach);
      }
      drawKoi(position,yaw,i,.79+(i%3)*.13,time+i*.4);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    drawBatch(capture(()=>{
      for(let i=0;i<4;i++){
        const phase=(time*.31+i*.25)%1;
        const {position}=swimPose(i+1,time);
        const radius=.13+phase*.38;
        loop([position[0],waterY+.018,position[2]],[radius,.033,radius*.83],
          {...foam,opacity:(1-phase)*.34},"y",.028);
      }
      if(feeding>=.50&&feeding<.79){
        for(let i=0;i<3;i++){
          const elapsed=clamp((feeding-.50)*4.7-i*.17,0,1);
          if(!elapsed)continue;
          const radius=.17+elapsed*.96;
          loop(add(catchPoint,[0,.023+i*.003,0]),[radius,.046,radius*.82],
            {...foam,opacity:(1-elapsed)*.77},"y",.031);
        }
      }
    }));
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    if(feeding>=.506&&feeding<=.655){
      const life=clamp((feeding-.506)/.149,0,1);
      for(let i=0;i<26;i++){
        const a=i*2.39996, r=life*(.40+(i%5)*.13);
        const y=Math.sin(life*PI)*(.29+(i%6)*.15);
        sparks.push(catchPoint[0]+Math.cos(a)*r,catchPoint[1]+.03+y,catchPoint[2]+Math.sin(a)*r,
          ...riverLight,.048+(i%4)*.026,(1-life)*.91);
      }
    }
  }
  function caughtKoi(rider,feeding,time) {
    if(!rider?.bill||feeding<.51||feeding>.762)return;
    const swallow=ease(.673,.762,feeding);
    const size=1-.93*swallow;
    const direction=rider.billDirection??[1,0,0];
    const sideways=[-direction[2],0,direction[0]];
    const bite=add(add(rider.bill,scale(direction,.113)),scale(sideways,.075*(1-swallow)));
    const angle=Math.atan2(direction[2],direction[0])+1.22+Math.sin(time*17)*.20;
    const pitch=1.08-swallow*.59+Math.sin(time*15)*.14;
    const bodyDirection=[Math.cos(angle)*Math.cos(pitch),Math.sin(pitch),Math.sin(angle)*Math.cos(pitch)];
    const center=sub(bite,scale(bodyDirection,.241*size));
    drawKoi(center,angle,1,size,time*1.9,pitch);
  }
  const herbJade=material("82d49b",.22,.31),herbBud=material("dbffe1",.21,.85);
  const herbVein=material("bcf5bd",.15,.73),herbStem=material("44785e",.13,.29);
  const herbSpark=rgb("caffb1"),waterSpark=rgb("b8f6f3"),lampSpark=rgb("ffd59b");
  const brightBulbs=["ffab6b","ffc97f","ffeda7"].map(hex=>material(hex,.12,1));
  const lampWave=material("ffc481",.09,.96);
  const spiritHerb=bake(capture(()=>{
    for(const [angle,raise] of [[.2,0],[2.34,.085],[4.49,.018]]){
      const dir=[Math.cos(angle),0,Math.sin(angle)],side=[-dir[2],0,dir[0]];
      const base=scale(dir,.045),node=add(scale(dir,.09),[0,.22,0]),tip=add(scale(dir,.18),[0,.43+raise,0]);
      polyline([base,node,tip],.018,herbStem);
      for(let i=0;i<3;i++){
        const origin=mix(node,tip,i*.24),opposite=i%2?1:-1;
        const end=add(origin,add(scale(dir,.20),add(scale(side,.092*opposite),[0,.11+.04*i,0])));
        const mid=mix(origin,end,.49),normal=norm(cross(sub(end,origin),side));
        const edge=scale(side,.075-i*.01),ridge=add(mid,[0,.035,0]);
        const vertices=[...origin,...normal,...sub(mid,edge),...normal,...ridge,...normal,...add(mid,edge),...normal,...end,...normal];
        object(mesh(vertices,[0,1,2,0,2,3,1,4,2,2,4,3]),identity,herbJade);
        polyline([origin,ridge,end],.008,herbVein);
      }
      worldOval(tip,[.049,.061,.041],herbBud);
      worldOval(add(tip,[0,.061,0]),[.018,.020,.017],herbVein);
    }
  }));
  function herbPass(eye,time,progress,sparks) {
    const target=herbCove.target,fall=herbCove.waterfall;
    if(Math.hypot(eye[0]-target[0],eye[2]-target[2])>48)return;
    const root=[target[0],target[1]-.40,target[2]];
    if(!herbPicked){
      drawBatch(spiritHerb,shape(root,[1,1,1],Math.sin(time*2.0)*.046));
      for(let i=0;i<14;i++){
        const phase=(time*.29+i*.071)%1,a=i*2.40+time*1.5,rad=.15+phase*.20;
        sparks.push(root[0]+Math.cos(a)*rad,root[1]+.25+phase*.59,root[2]+Math.sin(a)*rad,
          ...herbSpark,.063+(i%4)*.016,(1-phase)*.57);
      }
    }
    if(progress>.45&&progress<.66){
      const life=(progress-.45)/.21;
      for(let i=0;i<23;i++){
        const a=i*2.40,r=life*(.21+(i%6)*.091);
        sparks.push(target[0]+Math.cos(a)*r,target[1]+Math.sin(life*PI)*(.26+(i%7)*.062),
          target[2]+Math.sin(a)*r,...herbSpark,.071,(1-life)*.88);
      }
    }
    for(let i=0;i<48;i++){
      const lane=(i%17+.5)/17-.5,phase=(time*(.66+(i%7)*.071)+i*.618)%1;
      const y=lerp(fall.yTop,fall.yBottom,phase);
      const x=fall.x+lane*fall.width*.97+Math.sin(i+phase*3)*.085;
      const z=fall.z+.085+phase*phase*.37;
      sparks.push(x,y,z,...waterSpark,.060+(i%4)*.035,.21+Math.sin(phase*PI)*.22);
    }
  }
  function carriedHerb(rider,progress) {
    if(!rider?.bill||progress<.45||progress>.77)return;
    const fade=1-ease(.716,.77,progress),size=.98*fade;
    if(size<.01)return;
    const tip=add(rider.bill,scale(rider.billDirection??[1,0,0],.087));
    const root=add(tip,[0,-.40*size,.07*size]);
    drawBatch(spiritHerb,shape(root,[size,size,size],.16*Math.sin(drawTime*5.1)-.22));
  }
  function lampStrength(index) {
    const age=drawTime-lampLitAt[index];
    return Number.isFinite(age)?ease(0,.24,age)*(1+.06*Math.sin(drawTime*4.1+index)):0;
  }
  function lanternPass(eye,sparks) {
    if(Math.hypot(eye[0]-lanternStop.x,eye[2]-lanternStop.z)>52)return;
    for(const [i,position] of lanternStop.targets.entries()){
      const power=lampStrength(i);
      if(power<.006)continue;
      const age=drawTime-lampLitAt[i],pulse=1+.08*Math.sin(drawTime*6+i);
      const body=brightBulbs[i],size=(.185+.02*i)*pulse;
      drawBatch([{geometry:worldBall,matrix:shape(position,[size,size*1.13,size]),finish:body}]);
      const toward=norm(sub(eye,position));
      const aura=add(position,scale(toward,size+.09));
      sparks.push(...aura,...lampSpark,1.47+power*.41,.54*power);
      sparks.push(...aura,...body.color,.61,.64*power);
      for(let p=0;p<18;p++){
        const life=(p/18+drawTime*.30+i*.17)%1,a=p*2.4+drawTime*.92;
        const radius=.21+life*.35;
        sparks.push(position[0]+Math.cos(a)*radius,position[1]+.02+life*.90,position[2]+Math.sin(a)*radius,
          ...lampSpark,.063+(p%5)*.015,(1-life)**1.3*.65*power);
      }
      if(age<.87){
        const r=.16+age*1.17;
        const ring=add(position,[0,-.08+age*.24,.022]);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        drawBatch(capture(()=>loop(ring,[r,.073,r],{...lampWave,opacity:1-age/.87},"y",.024)));
        gl.depthMask(true);
        gl.disable(gl.BLEND);
      }
    }
  }
  const craneWhite=material("f9eed7",.09,.08),craneInk=material("243e51",.09),craneRed=material("bb5345",.11);
  const craneBody=bake(capture(()=>{
    worldOval([0,0,0],[.39,.105,.105],craneWhite);
    capsule([.14,.015,0],[.57,.081,0],.043,.043,craneWhite);
    worldOval([.62,.088,0],[.079,.049,.055],craneWhite);
    worldOval([.637,.126,0],[.044,.014,.034],craneRed);
    rod([.676,.076,0],[.84,.063,0],.017,craneInk);
    for(const side of [-1,1])rod([-.15,-.025,side*.056],[-.62,-.091,side*.075],.012,craneInk);
  }));
  const craneWings=[-1,1].map(side=>bake(capture(()=>{
    capsule([.02,0,0],[-.047,.021,side*.57],.122,.061,craneWhite);
    for(let i=0;i<5;i++){
      const z=.44+i*.088;
      capsule([-.045,.026,side*z],[-.225-i*.026,.037,side*(z+.19)],.045,.031,i>1?craneInk:craneWhite);
    }
  })));
  function passingCranes(visible,t,biome) {
    if(biome!==0&&biome!==3&&biome!==4)return;
    const cell=visible.find(cell=>cell.cx===cellOf(state.x)&&cell.cz===cellOf(state.z));
    if(!cell)return;
    for(let i=0;i<4;i++){
      const angle=t*.18+i*.255+.81;
      const radius=8.8+i*1.10;
      const position=[cell.x+7+Math.cos(angle)*radius,6.8+i*.23+Math.sin(angle*1.53)*.73,cell.z-7+Math.sin(angle)*radius];
      const h=angle+PI/2, k=.64+i*.035, yaw=[Math.cos(h)*k,0,Math.sin(h)*k];
      const model=transform(position,yaw,[0,k,0],[-yaw[2],0,yaw[0]]);
      drawBatch(craneBody,model);
      for(const [wing,side] of [-1,1].entries()){
        const flap=side*(.12+Math.sin(t*4.9+i*.64)*.61),c=Math.cos(flap),s=Math.sin(flap);
        drawBatch(craneWings[wing],multiply(model,transform([0,0,0],[1,0,0],[0,c,s],[0,-s,c])));
      }
    }
  }
  function spiritPose(prop,t) {
    const {type,pos}=prop,size=prop.size??1,phase=(prop.seed??0)*TAU+t*.74;
    if(type==="sword"){
      const a=phase*.68;
      return {size,phase,p:add(pos,[Math.cos(a)*.82*size,Math.sin(phase*1.34)*.36*size,Math.sin(a)*.83*size]),
        axis:norm([Math.sin(a)*.83,.65+Math.sin(phase)*.2,Math.cos(a)*.59])};
    }
    return {size,phase,p:add(pos,[Math.sin(phase*.8)*.22,Math.sin(phase*1.31)*.24,Math.cos(phase*.71)*.23]),axis:UP};
  }
  function updateSpiritCollider(prop,t) {
    if(!prop.hitboxes.length)return;
    const {p,axis,size}=spiritPose(prop,t);
    for(const {along,radius,box} of prop.hitboxes){
      const [x,y,z]=add(p,scale(axis,along*size));
      const half=(prop.type==="sword"?radius:.30)*size;
      Object.assign(box,{x,z,rx:radius*size,rz:radius*size,yMin:y-half,yMax:y+half});
    }
  }
  function spiritProps(visible,eye,t,sparks) {
    for(const cell of visible)for(const prop of cell.props){
      const {type,pos}=prop;
      const d=length(sub(pos,eye));
      if(d>42)continue;
      const {size,phase,p,axis}=spiritPose(prop,t);
      if(type==="sword"){
        drawBatch(sword,align(p,axis,[size,size,size]));
        const tip=add(p,scale(axis,size*1.12));
        sparks.push(...tip,...swordLight,.205*size,.39);
        if(d<24){
          for(let i=1;i<=11;i++){
            const a=(phase-i*.097)*.68,fade=1-i/12;
            sparks.push(pos[0]+Math.cos(a)*.82*size+axis[0]*size*1.04,
              pos[1]+Math.sin(a*1.97)*.36*size+axis[1]*size*1.04,
              pos[2]+Math.sin(a)*.83*size+axis[2]*size*1.04,...swordLight,.057*size,fade*.45);
          }
        }
      }else if(type==="lantern"){
        drawBatch(lantern,shape(p,[size,size,size],Math.sin(phase)*.08));
        const front=add(p,scale(norm(sub(eye,p)),size*.28));
        sparks.push(...front,...lanternLight,.71*size,.61);
        if(cell.biome===2&&d<32){
          for(let i=0;i<18;i++){
            const life=(i/18+t*.31+phase*.15)%1,a=life*TAU*1.3+phase;
            const spread=.35+life*size*.67;
            sparks.push(p[0]+Math.cos(a)*spread,p[1]-.3+life*2.1,p[2]+Math.sin(a)*spread,
              ...(i%3?riverLight:lanternLight),.073+life*.021,(1-life)*.48);
          }
        }
      }else if(type==="petal"){
        const p=add(pos,[Math.cos(phase)*1.6,Math.sin(phase*.75)*.49,Math.sin(phase)*.77]);
        for(let i=0;i<8;i++){
          const progress=(t*.19+i/8+phase*.03)%1;
          const p2=add(p,[progress*1.7,1.1-progress*2.35,Math.sin(phase+progress*TAU)*.52]);
          sparks.push(...p2,...silkPink,.065*size,(1-progress)*.54);
        }
      }
    }
  }
  const randomMote=rng(0x17db9);
  const motes=Array.from({length:116},()=>Array.from({length:5},randomMote));
  function trail(sparks,t) {
    const tint=palette.accent.color,forward=[Math.cos(state.heading),0,Math.sin(state.heading)];
    const side=[-forward[2],0,forward[0]],magic=state.flight?.93:.38;
    const n=Math.min(motes.length,48+Math.floor(Math.abs(state.speed)*4));
    for(let i=0;i<n;i++){
      const [a,b,c,d,e]=motes[i],life=(a+t*(.49+b*.37))%1;
      const drift=life*(1.0+Math.min(Math.abs(state.speed),16)*.33);
      const axis=Math.sign(state.speed)||1;
      const wave=Math.sin(life*9+t*3+c*TAU);
      const offset=add(scale(forward,-axis*(.70+drift)),scale(side,(c-.5)*(.67+life*.97)+wave*magic*.27));
      const y=.16+life*(.21+d*.55)+wave*.13*magic;
      sparks.push(state.x+offset[0],state.y+y,state.z+offset[2],...(i%6?tint:lanternLight),
        .035+e*.145,(1-life)**1.49*(.47+magic*.40));
    }
    const landingGlow=Math.max(state.landing,state.impact);
    if(landingGlow>.13){
      const rear=state.rearPoint;
      const point=state.impact>state.landing ? add([state.x,state.y+.44,state.z],scale(forward,1.93)) : rear;
      for(let i=0;i<25;i++){
        const [a,b,c,d,e]=motes[i];
        const age=1-landingGlow,distance=(.14+age*1.34)*(.52+b*.8);
        sparks.push(point[0]+Math.cos(a*TAU)*distance,point[1]+.045+c*age*.69,
          point[2]+Math.sin(a*TAU)*distance,...(i%4?lanternLight:tint),.059+e*.084,d*landingGlow*.84);
      }
    }
    if(Math.abs(state.speed)<.65)return;
    const front=state.road.slice(-4,-1);
    for(const [i,p] of front.entries()){
      for(let k=0;k<14;k++){
        const phase=(k/14+t*(.30+i*.04))%1;
        const angle=phase*TAU*(1+i*.08),distance=(1-phase)*p.width*(1.15-i*.09);
        const point=add([p.x,p.y,p.z],add(scale(forward,Math.sin(angle)*distance*.51),scale(side,Math.cos(angle)*distance)));
        const y=p.y+.06+(1-phase)*(.72+magic*.64);
        sparks.push(point[0],y,point[2],...(k%6?tint:lanternLight),.072+(1-phase)*.09,.58*phase*(1-p.alpha*.53));
      }
    }
    if(magic<.8)return;
    for(let strand=0;strand<2;strand++){
      for(let i=0;i<38;i++){
        const phase=i/38,distance=.95+phase*(3.15+Math.abs(state.speed)*.10);
        const swirl=phase*TAU*1.21-t*4.0+strand*PI;
        const lateral=Math.cos(swirl)*(.34+phase*.31);
        const p=add(scale(forward,-distance*Math.sign(state.speed)),scale(side,lateral));
        const y=.36+Math.sin(swirl)*(.19+phase*.37)+phase*.14;
        sparks.push(state.x+p[0],state.y+y,state.z+p[2],...(strand?tint:lanternLight),.08+phase*.1,(1-phase)**1.7*.69);
      }
    }
  }

  const presets=[
    {name:"随行",back:-2.8,side:8.0,height:3.65,lead:1.50,targetY:1.70,fov:47},
    {name:"追风",back:-7.7,side:4.2,height:4.00,lead:3.25,targetY:1.48,fov:48},
    {name:"俯瞰",back:-6.4,side:10.2,height:12.8,lead:2.8,targetY:.10,fov:52}
  ];
  const keys={
    w:"forward",arrowup:"forward",s:"back",arrowdown:"back",a:"left",arrowleft:"left",
    d:"right",arrowright:"right",shift:"ascend",e:"ascend",control:"descend",q:"descend"
  };
  const pressed=new Set(),touch=new Map();
  const allowed=["forward","back","left","right","ascend","descend"];
  const headings=["东","东南","南","西南","西","西北","北","东北"];
  const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)");
  const shell={intro:$("intro"),biomeName:$("biomeName"),biomeHint:$("biomeHint"),mode:$("modeText"),speed:$("speedText"),
    altitude:$("altitudeText"),heading:$("headingText"),rearLoad:$("rearLoad"),road:$("routeMeter"),cadence:$("cadenceMeter"),flight:$("flight"),
    auto:$("auto"),autoText:$("autoText"),excursion:$("excursion"),
    excursionTitle:$("excursionTitle"),excursionDetail:$("excursionDetail"),
    flightText:$("flightText"),cameraText:$("cameraText"),notice:$("notice")};
  const musicButton=$("music"),musicLabel=$("musicText");
  const musicPicker=$("musicPicker"),musicTracks=$("musicTracks");
  const trackButtons=[...musicTracks.querySelectorAll("[data-track]")];
  let soundtrack=IMMORTAL_SOUNDTRACKS[0];
  function showMusicState({playing,status}) {
    musicButton.setAttribute("aria-pressed",String(playing));
    musicLabel.textContent=playing?"音乐开":status==="loading"?"载入中":status==="paused"?"音乐关":"音乐";
    musicButton.title=soundtrack.title+(status==="blocked"||status==="error"?" · 点按重试（M）":"（M）");
  }
  showMusicState({playing:false,status:"ready"});
  const music=createImmortalMusic(soundtrack.source,showMusicState);
  function setTrackPicker(open,restoreFocus=false) {
    musicTracks.hidden=!open;
    musicPicker.setAttribute("aria-expanded",String(open));
    if(open)trackButtons.find(button=>button.dataset.track===soundtrack.id)?.focus({preventScroll:true});
    else if(restoreFocus)musicPicker.focus({preventScroll:true});
  }
  function chooseTrack(id) {
    const selection=IMMORTAL_SOUNDTRACKS.find(track=>track.id===id);
    if(!selection||selection===soundtrack)return;
    soundtrack=selection;
    for(const button of trackButtons)button.setAttribute("aria-pressed",String(button.dataset.track===id));
    music.select(soundtrack.source);
  }
  const animationLabels={idle:"休憩",pedal:"蹬踏",coast:"滑行",flight:"御风",land:"落轮",bump:"回稳",
    fish:"捕鱼",herb:"采草",lantern:"点灯"};
  let cameraMode=0,orbit=0,zoom=1,tilt=0,drag,last,drawTime=0,hudAt=-1,priorBiome=-1;
  let active=false,autonomous=false,cameraHeading=0,cameraHeight=0,noticedHit=false;
  let resolution=1, frameTime=1/60, lastResolutionCheck=0;
  let trip=null,fishReturnsAt=0,storyUntil=0,activityCamera=0,slopeCamera=0,lastDismount=0;
  let herbPicked=false,nextAutoStop=5.4;
  const visitedStops=new Set();
  const headingError=(target,heading)=>Math.atan2(Math.sin(target-heading),Math.cos(target-heading));
  const distanceTo=point=>Math.hypot(state.x-point.x,state.z-point.z);

  function enter() {
    if(active)return;
    music.start();
    active=true;
    shell.intro.hidden=true;
    canvas.focus({preventScroll:true});
  }
  function setAuto(enabled, announce=true) {
    if(autonomous===enabled)return;
    autonomous=enabled;
    if(enabled)pilot.reset();
    shell.auto.setAttribute("aria-pressed",String(enabled));
    shell.autoText.textContent=enabled?"自游中":"自游";
    if(announce)shell.notice.textContent=enabled?"鹈鹕开始自主探索。操作方向或升降键即可接管。":"已接管骑行。";
  }
  function toggleAuto() {
    if(trip?.phase==="act")return;
    enter();
    if(trip)cancelTrip();
    setAuto(!autonomous);
  }
  function story(title,detail,duration=Infinity) {
    shell.excursionTitle.textContent=title;
    shell.excursionDetail.textContent=detail;
    shell.excursion.hidden=false;
    storyUntil=drawTime+duration;
  }
  function setTripButton(kind,text,pressed) {
    $(kind+"Text").textContent=text;
    $(kind).setAttribute("aria-pressed",String(pressed));
  }
  function cancelTrip() {
    if(trip)setTripButton(trip.kind,trip.destination.label,false);
    trip=null;
    shell.excursion.hidden=true;
  }
  function beginActivity() {
    const {kind,destination}=trip;
    trip.phase="act";
    trip.since=drawTime;
    if(kind==="fish")fishReturnsAt=0;
    if(kind==="herb")herbPicked=false;
    if(kind==="lantern")lampLitAt.fill(-Infinity);
    state.animation=kind;
    setTripButton(kind,destination.working,true);
    story(destination.name+" · 已停靠",destination.land);
  }
  function startTrip(kind) {
    if(trip?.phase==="act")return;
    if(trip?.kind===kind){
      cancelTrip();
      shell.notice.textContent="已取消引路。";
      return;
    }
    const resumeAuto=autonomous||Boolean(trip?.resumeAuto);
    if(trip)cancelTrip();
    enter();
    setAuto(false,false);
    const destination=destinations[kind],dock=destination.site.dock;
    visitedStops.add(kind);
    trip={kind,destination,phase:"lift",since:drawTime,waypoint:0,lights:0,
      deadline:drawTime+Math.max(46,36+distanceTo(dock)*.32),resumeAuto};
    setTripButton(kind,"引路中",true);
    if(distanceTo(dock)<1.1&&Math.abs(state.speed)<1.6&&journey.parkAt(dock)){
      beginActivity();
      return;
    }
    story(destination.name+" · 寻路",destination.travel+" 按方向键可接管。");
    if(!state.flight)journey.toggleFlight();
  }
  function guideTrip() {
    const {destination}=trip,{dock,approach,route=[]}=destination.site;
    const rally={x:approach[0]-Math.cos(dock.heading)*1.3,z:approach[2]-Math.sin(dock.heading)*1.3};
    const high=dock.y+7.6,low=dock.y+1.05;
    if(drawTime>trip.deadline){
      const resume=trip.resumeAuto;
      cancelTrip();
      nextAutoStop=state.time+5;
      if(resume)setAuto(true,false);
      story(destination.name+" · 暂缓靠岸","前路受阻，结束这次引路。",4.3);
      return {};
    }
    if(!state.flight)journey.toggleFlight();
    const sail=(target,speed,altitude)=>{
      const distance=distanceTo(target);
      const error=headingError(Math.atan2(target.z-state.z,target.x-state.x),state.heading);
      return {targetSpeed:Math.min(speed,distance*1.5)*Math.max(.09,Math.cos(error)**2)*(Math.abs(error)>1.46?.16:1),
        steer:clamp(error*2.7,-1,1),targetAltitude:altitude};
    };
    function seek(target,speed,altitude) {
      const angle=Math.atan2(target.z-state.z,target.x-state.x);
      const distance=distanceTo(target);
      const risk=collision.obstruction(state.x,state.y,state.z,angle,Math.min(12,distance));
      const above=risk>.25?Math.min(25,Math.max(altitude,state.y+2.7)):altitude;
      return sail(target,risk>.47?Math.min(3.1,speed):speed,above);
    }
    if(trip.phase==="lift"){
      if(state.y<high-.45){
        const target=route[0]??rally;
        const angle=Math.atan2(target.z-state.z,target.x-state.x);
        if(state.impact>.33&&drawTime-trip.since>1.2){
          const offsets=[0,.6,-.6,1.3,-1.3,2.3,-2.3,PI];
          const clear=offsets.find(offset=>collision.obstruction(state.x,state.y,state.z,angle+offset,6)<.22);
          if(clear!==undefined){
            const heading=angle+clear;
            return sail({x:state.x+Math.cos(heading)*6,z:state.z+Math.sin(heading)*6},3,high);
          }
        }
        return {targetSpeed:0,steer:clamp(headingError(angle,state.heading)*2.2,-1,1),targetAltitude:high};
      }
      trip.phase=route.length?"scenic":"transit";
    }
    if(trip.phase==="scenic"){
      const point=route[trip.waypoint];
      if(distanceTo(point)>1.13||Math.abs(state.y-point.y)>1.3||Math.abs(state.speed)>2.7)
        return seek(point,8.5,point.y);
      trip.waypoint++;
      if(trip.waypoint<route.length){
        if(trip.kind==="herb"&&trip.waypoint===1)
          story("瀑隐坞 · 绕过水帘","鹈鹕沿悬瀑外沿侧转，向水帘后面的岩台靠近。");
        const next=route[trip.waypoint];
        return seek(next,8.5,next.y);
      }
      trip.phase="transit";
    }
    if(trip.phase==="transit"){
      if(distanceTo(rally)>1.03||Math.abs(state.speed)>1.7)
        return seek(rally,10.6,route.at(-1)?.y??high);
      trip.phase="lineup";
      story(destination.name+" · 靠岸","鹈鹕收轮下降，向泊台对齐。");
    }
    if(trip.phase==="lineup"){
      const error=headingError(dock.heading,state.heading);
      if(Math.abs(error)>.18||state.y>low+.22)
        return {targetSpeed:0,steer:clamp(error*2.8,-1,1),targetAltitude:low};
      trip.phase="dock";
    }
    const distance=distanceTo(dock),error=headingError(dock.heading,state.heading);
    if(distance<1.13&&Math.abs(state.speed)<1.25){
      if(Math.abs(error)<.23&&journey.parkAt(dock)){
        beginActivity();
        return {};
      }
      return {targetSpeed:0,steer:clamp(error*2.6,-1,1),targetAltitude:dock.y+.53};
    }
    return sail(dock,3.6,low);
  }
  function advanceActivity() {
    const {kind,destination,resumeAuto}=trip;
    const progress=(drawTime-trip.since)/destination.duration;
    if(kind==="fish"&&progress>=.52&&!trip.touched){
      trip.touched=true;
      story("灵鱼汀 · 得鱼","水面泛起涟漪，金鳞已经叼在嘴里。");
    }
    if(kind==="herb"&&progress>=.45&&!trip.touched){
      trip.touched=true;
      herbPicked=true;
      story("瀑隐坞 · 采到灵草","鹈鹕叼起一株灵草，叶尖洒下点点荧光。");
    }
    if(kind==="lantern"&&trip.lights<lampTimes.length&&progress>=lampTimes[trip.lights]){
      lampLitAt[trip.lights++]=drawTime;
      story("灯河夜渡 · "+trip.lights+" / "+lampTimes.length,"喙尖触过灯环，灯芯亮起，暖光落在石岸上。");
    }
    if(progress<1)return;
    cancelTrip();
    if(kind==="fish")fishReturnsAt=drawTime+8.5;
    state.animation="idle";
    nextAutoStop=state.time+4.2;
    story(destination.name+" · "+destination.finish,resumeAuto?"鹈鹕回到车座，准备继续自游。":"鹈鹕回到车座。可以继续骑行，也可以留在泊台欣赏。",5.1);
    if(resumeAuto){
      setAuto(true,false);
      journey.toggleFlight();
    }
  }
  function setFlight() {
    if(trip?.phase==="act")return;
    enter();
    if(trip)cancelTrip();
    setAuto(false,false);
    const flying=journey.toggleFlight();
    shell.notice.textContent=flying?"已御风升空。按 E 升高，Q 降低。":"正在降落。";
  }
  function switchCamera() {
    cameraMode=(cameraMode+1)%presets.length;
    orbit=0;zoom=1;tilt=0;
    shell.cameraText.textContent=presets[cameraMode].name;
    shell.notice.textContent="已切换至"+presets[cameraMode].name+"视角。";
  }
  function reset() {
    cancelTrip();
    visitedStops.clear();
    nextAutoStop=5.4;
    fishReturnsAt=0;
    herbPicked=false;
    lampLitAt.fill(-Infinity);
    setAuto(false,false);
    journey.reset();
    orbit=0;zoom=1;tilt=0;
    cameraHeading=0;cameraHeight=state.y;
    pressed.clear();
    touch.clear();
    for(const name of allowed)$(name).removeAttribute("data-held");
    shell.notice.textContent="已返回青岚仙山起点。";
    hudAt=-1;
  }
  function inputs() {
    const result={};
    for(const key of pressed)result[keys[key]]=true;
    for(const name of touch.values())result[name]=true;
    return result;
  }
  function matchMusic(input) {
    const pace=input.targetSpeed;
    if(!music.playing||state.flight||state.blocked||input.toggleFlight||input.coast||
       Math.min(state.contactRear,state.contactFront)<.75||!Number.isFinite(pace)||pace<4.35||pace>8.3)return input;
    const t=music.time;
    let rhythm=ease(...soundtrack.fadeIn,t)*(1-ease(...soundtrack.fadeOut,t));
    for(const [entry,soft,release,end,floor] of soundtrack.softPhrases){
      const phrase=ease(entry,soft,t)*(1-ease(release,end,t));
      rhythm*=lerp(1,floor,phrase);
    }
    const stableGrade=1-ease(.045,.115,Math.abs(state.grade));
    const straight=1-ease(.25,.72,Math.abs(input.steer??0));
    const weight=rhythm*stableGrade*straight*.84;
    if(weight<.01)return input;
    const paceOffset=clamp(soundtrack.cruisePace-pace,-.06*pace,.06*pace)*weight;
    let cadenceTarget=soundtrack.cadence;
    if(Number.isFinite(soundtrack.downbeat)){
      const beatPhase=-(t-soundtrack.downbeat)*soundtrack.cadence*TAU/60;
      cadenceTarget+=1.25*Math.sin(state.phase-beatPhase);
    }
    return {...input,targetSpeed:pace+paceOffset,cadenceTarget,rhythmStrength:weight};
  }
  function updateHUD(biome) {
    const atCove=distanceTo(herbCove.dock)<9.7;
    const label=atCove?"cove":biome;
    if(label!==priorBiome){
      priorBiome=label;
      const location=atCove?{...biomes[biome],name:"瀑隐坞",hint:"水帘背后是灵圃，青玉泊台上的灵草可采。"}:biomes[biome];
      shell.biomeName.textContent=location.name;
      shell.biomeHint.textContent=location.hint;
      document.documentElement.style.setProperty("--accent","#"+location.ink);
      if(active)shell.notice.textContent="进入"+location.name+"。";
    }
    if(drawTime-hudAt<.12)return;
    hudAt=drawTime;
    const altitude=Math.max(0,state.y-groundHeight(state.x,state.z));
    shell.mode.textContent=state.animation==="coast"&&state.grade<-.075?"下坡滑行":animationLabels[state.animation];
    const hit=state.blocked||state.impact>.40;
    if(hit&&!noticedHit)shell.notice.textContent="遇到障碍，鹈鹕正在稳住车身。";
    noticedHit=hit;
    shell.flightText.textContent=state.flight?"降落":"御风";
    shell.flight.setAttribute("aria-pressed",String(state.flight));
    shell.speed.textContent=Math.abs(state.speed).toFixed(1)+" 丈/秒";
    shell.altitude.textContent=(state.contactRear>.65||state.contactFront>.65?0:altitude).toFixed(1)+" 丈";
    shell.heading.textContent=headings[(Math.round(state.heading/(PI/4))+8)%8];
    shell.rearLoad.textContent=Math.round(state.load*(1-.68*lastDismount)*100)+"%";
    shell.cadence.textContent=Math.round(state.cadence)+" 转/分";
    shell.cadence.title="车轮 "+Math.round(state.wheelRpm)+" 转/分 · 档比 "+state.gearRatio.toFixed(2);
    const ahead=(state.road.at(-1)?.distance??state.distance)-state.distance;
    shell.road.textContent=Math.abs(state.speed)<.2?"待续":Math.round(Math.max(0,ahead))+" 丈";
  }

  function draw(dt) {
    const cx=cellOf(state.x),cz=cellOf(state.z),biome=biomeAt(cx,cz);
    const loaded=updateCells(cx,cz);
    updatePalette(biome,dt);
    const preset=presets[cameraMode],aspect=canvas.width/canvas.height;
    const activity=trip?.phase==="act"?trip.kind:"";
    const progress=activity?clamp((drawTime-trip.since)/trip.destination.duration,0,1):0;
    const feeding=activity==="fish"?progress:0;
    activityCamera=lerp(activityCamera,activity?1:0,1-Math.exp(-dt*3.4));
    const slopeFocus=cameraMode===0&&!state.flight&&state.speed>2?ease(.053,.19,-state.grade):0;
    slopeCamera=lerp(slopeCamera,slopeFocus,1-Math.exp(-dt*5.6));
    const lamps=activity==="lantern", herbs=activity==="herb";
    const side=lamps?8.4:herbs?7.35:7.3;
    const leadAction=lamps?2.44+1.02*ease(.28,.65,progress)*(1-ease(.77,.96,progress)):herbs?2.31:2.28;
    const p={back:lerp(lerp(preset.back,.42,slopeCamera),herbs?-2.55:-1.9,activityCamera),
      side:lerp(preset.side,side,activityCamera),height:lerp(lerp(preset.height,3.03,slopeCamera),lamps?5.14:herbs?3.66:4.34,activityCamera),
      lead:preset.lead,targetY:lerp(preset.targetY,lamps?1.46:.92,activityCamera),fov:lerp(preset.fov,46,activityCamera)};
    const targetHeading=state.heading;
    const difference=Math.atan2(Math.sin(targetHeading-cameraHeading),Math.cos(targetHeading-cameraHeading));
    cameraHeading+=difference*(1-Math.exp(-dt*4.1));
    cameraHeight=lerp(cameraHeight,state.y,1-Math.exp(-dt*4.8));
    const angle=cameraHeading+orbit*(1-activityCamera)+(herbs?.24:0)*activityCamera;
    const f=[Math.cos(angle),0,Math.sin(angle)],right=[-f[2],0,f[0]];
    const altitude=Math.max(0,state.y-groundHeight(state.x,state.z));
    const air=ease(.2,5,altitude);
    const compact=clamp(lerp(.79,lamps?1.12:1.04,activityCamera)/aspect,1,2.87);
    const distance=compact*(1+air*.12)/lerp(zoom,1,activityCamera), lift=air*1.35;
    const origin=[state.x,cameraHeight,state.z];
    const nearActivity=activityCamera*(1-ease(.51,.88,aspect));
    const eye=add(add(origin,scale(f,p.back*distance)),add(scale(right,p.side*distance),[0,p.height+nearActivity*2.12+tilt*(1-activityCamera)+lift,0]));
    const lead=lerp(p.lead*Math.min(1,aspect*.91),leadAction,activityCamera);
    const target=add(add(add(origin,scale(f,lead)),scale(right,.42*activityCamera)),[0,p.targetY-air*.29,0]);
    const view=camera(eye,target,aspect,p.fov);
    const visible=loaded.filter(cell=>dot(sub([cell.x,0,cell.z],eye),view.forward)>-24);
    const animation=drawTime*(reducedMotion.matches?.55:1);
    const sparks=[];
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    skyPass(view,aspect,eye,animation);
    bindSolid(view,eye);
    gl.uniform1f(solid.u.terrain,.92);
    for(const cell of visible)drawBatch(cell.objects);
    gl.uniform1f(solid.u.terrain,0);
    passingCranes(visible,animation,biome);
    spiritProps(visible,eye,animation,sparks);
    unbindSolid();
    mistPass(view,eye,visible,animation);
    bindSolid(view,eye);
    pondPass(eye,animation,feeding,sparks);
    herbPass(eye,animation,herbs?progress:0,sparks);
    lanternPass(eye,sparks);
    roadPass(eye);
    wheelContacts();
    const {x,y,z,heading,bank,pitch}=state;
    const c=Math.cos(heading),s=Math.sin(heading),cr=Math.cos(bank),sr=Math.sin(bank);
    const facing=transform([x,y,z],[c,0,s],UP,[-s,0,c]);
    const tiltForward=shape([0,0,0],[1,1,1],pitch);
    const roll=transform([0,0,0],[1,0,0],[0,cr,sr],[0,-sr,cr]);
    const model=multiply(multiply(facing,tiltForward),roll);
    const rider=drawRider(model,{phase:state.phase,wheelPhase:state.wheelPhase,time:animation,magic:.29+air*.64,accent:palette.accent,
      animation:state.animation,speed:state.speed,load:state.load,contactRear:state.contactRear,
      contactFront:state.contactFront,impact:state.impact,feeding,ritual:progress,targets:lamps?lampLocalTaps:undefined,
      cadence:state.cadence,pedalEngagement:state.pedalEngagement});
    lastDismount=rider?.dismount??0;
    caughtKoi(rider,feeding,animation);
    if(herbs)carriedHerb(rider,progress);
    unbindSolid();
    trail(sparks,animation);
    sparkPass(view,sparks);
    updateHUD(biome);
    canvas.dataset.position=[state.x,state.y,state.z].map(n=>n.toFixed(3)).join(",");
    canvas.dataset.flight=String(state.flight);
    canvas.dataset.biome=String(biome);
    canvas.dataset.road=String(state.road.length);
    canvas.dataset.distance=state.distance.toFixed(3);
    canvas.dataset.animation=state.animation;
    canvas.dataset.drive=autonomous?"auto":"manual";
    canvas.dataset.contactRear=state.contactRear.toFixed(2);
    canvas.dataset.contactFront=state.contactFront.toFixed(2);
    canvas.dataset.impact=state.impact.toFixed(2);
    canvas.dataset.blocked=String(state.blocked);
    canvas.dataset.grade=state.grade.toFixed(3);
    canvas.dataset.speed=state.speed.toFixed(2);
    canvas.dataset.wheelRpm=state.wheelRpm.toFixed(2);
    canvas.dataset.cadence=state.cadence.toFixed(2);
    canvas.dataset.gear=state.gearRatio.toFixed(3);
    canvas.dataset.music=music.playing?"playing":"silent";
    canvas.dataset.musicTrack=soundtrack.id;
    canvas.dataset.musicTime=music.time.toFixed(2);
    canvas.dataset.fish=trip?.kind==="fish"?(activity?"feed":trip.phase):"none";
    canvas.dataset.feeding=feeding.toFixed(3);
    canvas.dataset.jaw=(rider?.opening??0).toFixed(3);
    canvas.dataset.destination=trip?.kind??"none";
    canvas.dataset.trip=trip?.phase??"none";
    canvas.dataset.activity=activity;
    canvas.dataset.progress=progress.toFixed(3);
    canvas.dataset.waypoint=String(trip?.waypoint??0);
    canvas.dataset.herbPicked=String(herbPicked);
    canvas.dataset.lamps=String(lampLitAt.filter(Number.isFinite).length);
  }
  function tick(now) {
    const elapsed=last===undefined?1/60:clamp((now-last)/1000,0,.18);
    last=now;
    frameTime=lerp(frameTime,elapsed,.085);
    if(active&&drawTime-lastResolutionCheck>1.9){
      lastResolutionCheck=drawTime;
      const quality=frameTime>.039?Math.max(.66,resolution-.13):frameTime<.022?Math.min(1,resolution+.07):resolution;
      if(quality!==resolution){resolution=quality;resize()}
    }
    drawTime+=elapsed;
    if(drawTime>=storyUntil)shell.excursion.hidden=true;
    if(active){
      const time=drawTime*(reducedMotion.matches?.55:1);
      for(const cell of cells.values()){
        if(Math.hypot(cell.x-state.x,cell.z-state.z)>64)continue;
        for(const prop of cell.props)updateSpiritCollider(prop,time);
      }
      if(autonomous&&!trip&&visitedStops.size<Object.keys(destinations).length&&state.time>nextAutoStop){
        const next=Object.keys(destinations).find(kind=>!visitedStops.has(kind)&&distanceTo(destinations[kind].site.dock)<155);
        if(next)startTrip(next);
      }
      if(trip?.phase==="act"){
        advanceActivity();
      }else{
        const input=trip?guideTrip():autonomous?matchMusic(pilot.update(elapsed,state,pilotWorld)):inputs();
        if(trip?.phase!=="act"){
          if(input.toggleFlight&&!state.flight)journey.toggleFlight();
          if(input.ascend&&!input.descend&&!state.flight)journey.toggleFlight();
          const steps=Math.max(1,Math.ceil(elapsed/.042));
          for(let i=0;i<steps;i++)journey.step(elapsed/steps,input);
        }
      }
    }
    draw(elapsed);
    requestAnimationFrame(tick);
  }
  function resize() {
    const ratio=Math.min(devicePixelRatio||1,1.35,1530/stage.clientWidth,1050/stage.clientHeight)*resolution;
    canvas.width=Math.max(1,Math.round(stage.clientWidth*ratio));
    canvas.height=Math.max(1,Math.round(stage.clientHeight*ratio));
  }
  const actionKeys={" ":setFlight,c:switchCamera,r:reset,t:toggleAuto,f:()=>startTrip("fish"),
    h:()=>startTrip("herb"),l:()=>startTrip("lantern"),m:()=>music.toggle()};
  window.addEventListener("keydown",event=>{
    if(event.metaKey||event.altKey)return;
    const key=event.key.toLowerCase();
    if(key==="escape"&&!musicTracks.hidden){
      event.preventDefault();
      setTrackPicker(false,true);
      return;
    }
    if(event.target instanceof HTMLButtonElement&&(key===" "||key.startsWith("arrow")))return;
    if(keys[key]){
      event.preventDefault();
      enter();
      if(trip?.phase==="act")trip.resumeAuto=false;
      else if(trip)cancelTrip();
      setAuto(false,false);
      pressed.add(key);
    }else if(actionKeys[key]){
      event.preventDefault();
      if(!event.repeat)actionKeys[key]();
    }
  });
  window.addEventListener("keyup",event=>pressed.delete(event.key.toLowerCase()));
  function releaseInputs() {
    pressed.clear();
    touch.clear();
    for(const name of allowed)$(name).removeAttribute("data-held");
    last=undefined;
  }
  window.addEventListener("blur",releaseInputs);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseInputs()});
  for(const name of allowed){
    const button=$(name);
    button.addEventListener("pointerdown",event=>{
      if(event.button!==0)return;
      event.preventDefault();
      enter();
      if(trip?.phase==="act")trip.resumeAuto=false;
      else if(trip)cancelTrip();
      setAuto(false,false);
      touch.set(event.pointerId,name);
      button.setAttribute("data-held","true");
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("lostpointercapture",event=>{
      touch.delete(event.pointerId);
      if(![...touch.values()].includes(name))button.removeAttribute("data-held");
    });
  }
  canvas.addEventListener("pointerdown",event=>{
    if(!event.isPrimary||event.button!==0)return;
    drag=[event.clientX,event.clientY];
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove",event=>{
    if(!event.isPrimary||!drag)return;
    orbit=(orbit-(event.clientX-drag[0])*.008)%TAU;
    tilt=clamp(tilt+(event.clientY-drag[1])*.035,-3.3,9.7);
    drag=[event.clientX,event.clientY];
  });
  canvas.addEventListener("lostpointercapture",()=>{drag=undefined});
  canvas.addEventListener("wheel",event=>{
    event.preventDefault();
    zoom=clamp(zoom*Math.exp(-clamp(event.deltaY,-200,200)*.0016),.64,1.37);
  },{passive:false});
  $("start").addEventListener("click",toggleAuto);
  $("auto").addEventListener("click",toggleAuto);
  for(const kind of Object.keys(destinations))$(kind).addEventListener("click",()=>startTrip(kind));
  $("flight").addEventListener("click",setFlight);
  $("camera").addEventListener("click",switchCamera);
  musicButton.addEventListener("click",()=>music.toggle());
  musicPicker.addEventListener("click",()=>setTrackPicker(musicTracks.hidden));
  for(const button of trackButtons)button.addEventListener("click",()=>{
    chooseTrack(button.dataset.track);
    setTrackPicker(false,true);
  });
  document.addEventListener("pointerdown",event=>{
    if(!musicTracks.hidden&&!musicPicker.parentElement.contains(event.target))setTrackPicker(false);
  });
  $("reset").addEventListener("click",reset);
  new ResizeObserver(resize).observe(stage);
  resize();
  requestAnimationFrame(tick);
}

try {
  startImmortalWorld();
} catch (error) {
  console.error(error);
  const notice = document.getElementById("error");
  if (notice) notice.hidden = false;
}
