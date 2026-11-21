import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { coastRadius, groundHeight, COAST_GLSL } from './coast.js';
import { SURF_PHASE_GLSL, sampleSurf } from './surf-cycle.js';

const WAVE_GLSL = /* glsl */`
${SURF_PHASE_GLSL}
uniform float time, waveStrength;
void addWave(inout vec3 f,vec2 p,vec2 d,float k,float a,float offset){
  float phase=dot(d,p)*k-sqrt(9.81*k)*time*.46+offset;
  a*=.48+waveStrength*1.1;
  f+=vec3(a*sin(phase),a*k*d*cos(phase));
}
vec3 swellField(vec2 p){
  vec3 f=vec3(0.);
  addWave(f,p,vec2(.55,.835),.53,.072,.3);
  addWave(f,p,vec2(-.37,.929),.86,.042,2.1);
  addWave(f,p,vec2(.91,-.415),1.37,.023,4.8);
  addWave(f,p,vec2(.23,.973),2.31,.011,1.7);
  addWave(f,p,vec2(-.79,.613),3.87,.005,3.9);
  float coast=smoothstep(.2,4.5,shoreDistance(p));
  return f*coast;
}
`;
const NOISE_GLSL = /* glsl */`
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash22(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+1.),f.x),f.y);}
`;

export function createWaterSystem({renderer,scene,skyMaterial,sunDirection,materials}) {
  const uniforms={
    time:{value:7.8},waveStrength:{value:.36},
    sunDirection:{value:sunDirection},sunColor:{value:new THREE.Color('#ffc477').multiplyScalar(5)},
    waterColor:{value:new THREE.Color('#153f50')},daylight:{value:1}
  };
  // Concentrate vertices near the house, then progressively widen the grid offshore.
  const geometry=new THREE.PlaneGeometry(2,2,240,240),positions=geometry.attributes.position;
  const stretch=v=>Math.sign(v)*(Math.abs(v)*25+Math.abs(v)**4*525);
  for(let i=0;i<positions.count;i++){positions.setX(i,stretch(positions.getX(i)));positions.setY(i,stretch(positions.getY(i)));}
  geometry.computeBoundingSphere();
  const water=new Water(geometry,{textureWidth:768,textureHeight:768,sunDirection,fog:true});
  water.rotation.x=-Math.PI/2;water.name='Multi-scale sea with solar glints';scene.add(water);
  const seaUniforms=water.material.uniforms;
  Object.assign(seaUniforms,uniforms);
  water.material.vertexShader=/* glsl */`
    uniform mat4 textureMatrix;
    varying vec4 mirrorCoord,worldPosition;
    ${COAST_GLSL}${WAVE_GLSL}
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    void main(){
      vec3 p=position;vec2 worldXZ=vec2(p.x,-p.y);p.z=swellField(worldXZ).x;
      worldPosition=modelMatrix*vec4(p,1.);mirrorCoord=textureMatrix*worldPosition;
      vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <logdepthbuf_vertex>
      #include <fog_vertex>
      #include <shadowmap_vertex>
    }`;
  water.material.fragmentShader=/* glsl */`
    uniform sampler2D mirrorSampler;
    uniform vec3 sunColor,sunDirection,eye,waterColor;
    uniform float daylight;
    varying vec4 mirrorCoord,worldPosition;
    ${COAST_GLSL}${WAVE_GLSL}${NOISE_GLSL}
    #include <common>
    #include <packing>
    #include <fog_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    vec2 rippleSlope(vec2 p,float footprint){
      vec2 s=vec2(0.);float warp=noise2(p*.36+time*.018)*1.9;
      s+=vec2(.82,.57)*cos(dot(p,vec2(.82,.57))*8.7-time*2.2+warp)*.079*(1.-smoothstep(.8,3.5,footprint*8.7));
      s+=vec2(-.64,.77)*cos(dot(p,vec2(-.64,.77))*14.3-time*2.8+warp*1.3)*.049*(1.-smoothstep(.8,3.5,footprint*14.3));
      s+=vec2(.23,.973)*cos(dot(p,vec2(.23,.973))*24.7-time*3.6+warp*.7)*.019*(1.-smoothstep(.8,3.5,footprint*24.7));
      s+=vec2(-.96,.28)*cos(dot(p,vec2(-.96,.28))*41.3-time*4.7)*.011*(1.-smoothstep(.8,3.5,footprint*41.3));
      return s*(.4+waveStrength*1.5);
    }
    float solarBRDF(vec3 n,vec3 v,vec3 l,float roughness){
      vec3 h=normalize(l+v);float nv=max(dot(n,v),.015),nl=max(dot(n,l),0.);
      float nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);
      float a2=roughness*roughness;float den=nh*nh*(a2-1.)+1.;
      float D=a2/(3.14159265*den*den);
      float gv=2.*nv/(nv+sqrt(a2+(1.-a2)*nv*nv));
      float gl=2.*nl/(nl+sqrt(a2+(1.-a2)*nl*nl));
      float fresnel=.0204+.9796*pow(1.-vh,5.);
      return D*gv*gl*fresnel/(4.*nv+.001);
    }
    void main(){
      #include <logdepthbuf_fragment>
      vec2 p=worldPosition.xz;vec3 delta=eye-worldPosition.xyz;float distance=length(delta);vec3 v=delta/distance;
      float footprint=max(length(dFdx(p)),length(dFdy(p)));
      vec3 field=swellField(p);vec2 slope=field.yz+rippleSlope(p,footprint);
      vec3 n=normalize(vec3(-slope.x,1.,-slope.y));
      float nv=max(dot(n,v),0.),fresnel=.0204+.9796*pow(1.-nv,5.);
      vec2 distortion=n.xz*(.0018+.035/max(distance,1.));
      vec2 uv=mirrorCoord.xy/mirrorCoord.w+distortion;
      vec3 reflection=texture2D(mirrorSampler,clamp(uv,.001,.999)).rgb;
      float depth=max(0.,-bedHeight(p));float shallow=exp(-depth*1.9);
      vec3 body=mix(waterColor*.52,vec3(.075,.19,.17),shallow*.55);
      body*=.45+.55*daylight;body+=vec3(.018,.034,.036)*nv;
      float roughness=.024+waveStrength*.025+min(.07,footprint*.065);
      float glint=solarBRDF(n,v,normalize(sunDirection),roughness)*daylight;
      // A soft highlight shoulder preserves amber colour around the white core.
      float exposedGlint=glint/(1.+glint*.55);
      vec3 outgoingLight=mix(body,reflection,fresnel)+sunColor*exposedGlint*getShadowMask();
      gl_FragColor=vec4(outgoingLight,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`;

  // A Gerstner cross section steepens in shallow water. The horizontal motion
  // gives the thin crest an overhang; spatially broken foam forms near the lip.
  const surf=new THREE.Group();surf.name='Shoaling wave lips and dissolving foam';scene.add(surf);
  const surfGeometry=new THREE.BufferGeometry(),sp=[],su=[],indices=[];
  const along=480,across=72;
  for(let i=0;i<=along;i++)for(let j=0;j<=across;j++){
    const a=-Math.PI*.98+i/along*Math.PI*1.42,d=-.55+j/across*6.8;
    sp.push(a,d,0);su.push(i/along,j/across);
    if(i<along&&j<across){const k=i*(across+1)+j;indices.push(k,k+across+1,k+1,k+1,k+across+1,k+across+2);}
  }
  surfGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  surfGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(su,2));surfGeometry.setIndex(indices);
  const surfMaterial=new THREE.ShaderMaterial({
    uniforms:{...uniforms,mirrorSampler:seaUniforms.mirrorSampler,textureMatrix:seaUniforms.textureMatrix,eye:seaUniforms.eye},
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:/* glsl */`
      varying vec3 vWorld;varying vec4 vMirror;varying vec4 vWave;
      uniform mat4 textureMatrix;
      ${COAST_GLSL}${WAVE_GLSL}${NOISE_GLSL}
      void main(){
        float a=position.x,d=position.y;vec2 direction=vec2(cos(a),sin(a));
        float scale=length(direction*vec2(30.,22.));
        float phase=surfPhase(a,d,time);
        float shoal=(1.-smoothstep(.2,5.8,d))*smoothstep(-.5,.45,d);
        float variation=.72+.28*sin(a*7.2+1.3)*sin(a*3.1-time*.07);
        float amp=(.10+waveStrength*.22)*shoal*variation;
        float fold=min(3.4,1.08/max(amp*2.12,.001));
        float offset=fold*amp*cos(phase);
        float r=coastRadius(a)+(d+offset)/scale;
        vec2 p=vec2(-16.,14.)+direction*vec2(30.,22.)*r;
        float h=amp*sin(phase)+swellField(p).x*.35;
        h=max(h,bedHeight(p)+.008);
        vWorld=vec3(p.x,h,p.y);vMirror=textureMatrix*vec4(vWorld,1.);
        vWave=vec4(d,phase,shoal,amp);
        gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);
      }`,
    fragmentShader:/* glsl */`
      uniform sampler2D mirrorSampler;uniform vec3 eye,sunDirection,sunColor;uniform float daylight;
      varying vec3 vWorld;varying vec4 vMirror,vWave;
      ${COAST_GLSL}${WAVE_GLSL}${NOISE_GLSL}
      void main(){
        float d=vWave.x,crest=max(sin(vWave.y),0.);
        vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));if(n.y<0.)n=-n;
        vec3 v=normalize(eye-vWorld);float facing=abs(dot(n,v));
        float ridge=pow(crest,7.);float depth=max(0.,vWorld.y-bedHeight(vWorld.xz));
        float cells=noise2(vWorld.xz*38.+vec2(time*.11,-time*.09));
        float micro=noise2(vWorld.xz*91.-time*.13);
        float patches=noise2(vWorld.xz*1.65-time*.04);
        float breakup=smoothstep(.39,.72,patches+cells*.22);
        float breaking=(1.-smoothstep(1.5,4.7,d))*vWave.z;
        float foam=ridge*breaking*breakup*smoothstep(.36,.64,cells+micro*.18)*.85;
        foam+=pow(max(0.,sin(vWave.y-.6)),4.)*breaking*breakup*.12;
        float fresnel=.02+.98*pow(1.-facing,5.);
        vec2 uv=vMirror.xy/vMirror.w+n.xz*.002;
        vec3 reflected=texture2D(mirrorSampler,clamp(uv,.001,.999)).rgb;
        float backlight=pow(max(dot(v,-normalize(sunDirection)),0.),2.);
        vec3 transmitted=mix(vec3(.035,.17,.15),vec3(.15,.36,.28),ridge*.6+backlight*.25);
        transmitted*=.45+.55*daylight;
        vec3 waterColor=mix(transmitted,reflected,min(.8,fresnel));
        waterColor+=sunColor*.017*ridge*backlight*daylight;
        vec3 foamColor=mix(vec3(.43,.54,.56),vec3(.92,.88,.73),daylight)*(.45+.55*daylight);
        vec3 color=mix(waterColor,foamColor,foam);
        float alpha=(ridge*.22+fresnel*.24+foam*.8)*vWave.z;
        alpha*=smoothstep(-.5,.1,d)*(1.-smoothstep(4.8,6.2,d));
        alpha*=smoothstep(-.025,.045,vWorld.y);
        if(alpha<.006)discard;gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const lip=new THREE.Mesh(surfGeometry,surfMaterial);lip.frustumCulled=false;surf.add(lip);

  // Wet sand bridges opaque land and moving water; residual cells dissolve
  // behind the crest instead of outlining the coast with a uniform white rail.
  const washGeometry=new THREE.BufferGeometry(),wp=[],wa=[],wi=[];
  for(let i=0;i<=along;i++)for(let j=0;j<=32;j++){
    const a=-Math.PI*.98+i/along*Math.PI*1.42,d=-1.6+j/32*4.5;
    const q=new THREE.Vector2(Math.cos(a)*30,Math.sin(a)*22),r=coastRadius(a)+d/q.length();
    const x=-16+q.x*r,z=14+q.y*r;wp.push(x,Math.max(groundHeight(x,z),0)+.012,z);wa.push(d,a);
    if(i<along&&j<32){const k=i*33+j;wi.push(k,k+33,k+1,k+1,k+33,k+34);}
  }
  washGeometry.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));washGeometry.setAttribute('coastData',new THREE.Float32BufferAttribute(wa,2));washGeometry.setIndex(wi);
  const washMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`attribute vec2 coastData;varying vec3 vWorld;varying vec2 vCoast;void main(){vWorld=position;vCoast=coastData;gl_Position=projectionMatrix*viewMatrix*vec4(position,1.);}`,
    fragmentShader:/* glsl */`
      varying vec3 vWorld;varying vec2 vCoast;uniform float daylight;
      ${COAST_GLSL}${WAVE_GLSL}${NOISE_GLSL}
      void main(){
        float d=vCoast.x,a=vCoast.y;
        float tide=sin(time*.91+a*.7)*.22+sin(time*.31+a*4.)*.12;
        float wet=(1.-smoothstep(tide-.12,tide+.8,-d))*smoothstep(-1.5,-.8,d)*(1.-smoothstep(1.3,2.7,d));
        float phase=surfPhase(a,d,time);
        float cell=noise2(vWorld.xz*10.-vec2(time*.09,-time*.07));
        float patches=smoothstep(.5,.74,noise2(vWorld.xz*2.5-time*.025));
        float bubbles=pow(max(0.,sin(phase-.6)),5.)*patches*smoothstep(.4,.65,cell);
        float foam=bubbles*(1.-smoothstep(.25,2.4,d))*smoothstep(-.8,-.05,d)*.28;
        vec3 color=mix(vec3(.065,.105,.11),mix(vec3(.38,.48,.51),vec3(.8,.81,.71),daylight),foam*2.5);
        float alpha=wet*.23+foam*(.3+.7*daylight);
        if(alpha<.006)discard;gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  surf.add(new THREE.Mesh(washGeometry,washMaterial));

  // Generate a soft, deforming concentration texture, then project it from the
  // sea through a real depth map of the room. This is an art-directed caustic
  // approximation with directional falloff and opaque-object occlusion.
  const causticTarget=new THREE.WebGLRenderTarget(384,384,{depthBuffer:false});
  causticTarget.texture.wrapS=causticTarget.texture.wrapT=THREE.RepeatWrapping;
  const causticScene=new THREE.Scene(),quadCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const causticQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,
    depthTest:false,depthWrite:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:/* glsl */`
      varying vec2 vUv;${NOISE_GLSL}uniform float time,waveStrength;
      float network(vec2 p,float t){vec2 i=floor(p),f=fract(p);float first=10.,second=10.;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 g=vec2(float(x),float(y));vec2 h=hash22(mod(i+g,8.));
          vec2 point=g+.5+.31*sin(h*6.283+t*vec2(.23,.19))-f;
          float d=dot(point,point);if(d<first){second=first;first=d;}else second=min(second,d);
        }
        float edge=sqrt(second)-sqrt(first);return exp(-edge*edge*95.);
      }
      void main(){vec2 p=vUv*8.;float t=time*(.55+waveStrength*.8);
        vec2 warp=vec2(sin(p.y*1.1+t*.16),cos(p.x*.9-t*.14))*.24;
        float a=network(p+warp,t),b=network(p+vec2(2.7,4.1)-warp*.6,-t*.72);
        float concentration=pow(a*b,.6)*.82+a*.08;
        float patches=.55+.45*noise2(p*.73+t*.035);
        gl_FragColor=vec4(vec3(concentration*patches),1.);
      }`
  }));causticScene.add(causticQuad);
  const projectionCamera=new THREE.OrthographicCamera(-11,11,6,-6,1,120);
  const projectionTarget=new THREE.WebGLRenderTarget(768,768);
  projectionTarget.depthTexture=new THREE.DepthTexture(768,768,THREE.UnsignedIntType);
  const depthScene=new THREE.Scene();depthScene.overrideMaterial=new THREE.MeshDepthMaterial({side:THREE.DoubleSide});
  const receiverUniforms={
    waterLightMap:{value:causticTarget.texture},waterOcclusion:{value:projectionTarget.depthTexture},
    waterLightMatrix:{value:new THREE.Matrix4()},waterLightDirection:{value:new THREE.Vector3()},
    waterLightColor:{value:new THREE.Color('#ffd59a')},waterLightPower:{value:.8},waterLightEnabled:{value:1}
  };
  const receiverFunction=/* glsl */`
    varying vec3 vWaterWorld;
    uniform sampler2D waterLightMap,waterOcclusion;
    uniform mat4 waterLightMatrix;
    uniform vec3 waterLightDirection,waterLightColor;
    uniform float waterLightPower,waterLightEnabled;
    float waterVisibility(vec3 q){
      float lit=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
        float stored=texture2D(waterOcclusion,q.xy+vec2(float(x),float(y))/768.).x;
        lit+=step(q.z-.0012,stored);
      }return lit/9.;
    }
    vec3 reflectedWaterLight(vec3 normalWorld){
      vec4 p=waterLightMatrix*vec4(vWaterWorld,1.);vec3 q=p.xyz/p.w;
      float bounds=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.)*step(0.,q.z)*step(q.z,1.);
      float inside=smoothstep(-9.6,-9.3,vWaterWorld.x)*(1.-smoothstep(-.65,-.4,vWaterWorld.x));
      inside*=smoothstep(-.2,.1,vWaterWorld.z)*(1.-smoothstep(5.9,6.2,vWaterWorld.z));
      inside*=smoothstep(1.45,1.7,vWaterWorld.y)*(1.-smoothstep(4.7,4.85,vWaterWorld.y));
      float facing=max(0.,dot(normalWorld,-waterLightDirection));
      facing+=max(0.,-normalWorld.y)*.18;
      vec2 uv=q.xy*vec2(2.75,1.5);
      float focus=texture2D(waterLightMap,uv).r;
      focus=mix(focus,texture2D(waterLightMap,uv+vec2(.0012,-.0008)).r,.5);
      float fading=.65+.35*smoothstep(1.6,4.5,vWaterWorld.y);
      return waterLightColor*focus*facing*waterLightPower*waterLightEnabled*inside*bounds*waterVisibility(q)*fading;
    }
  `;
  const receiverMaterials=new WeakSet();
  function attachReceivers(list){for(const material of new Set(list)){
    if(!material?.isMeshStandardMaterial||material.metalness>.7||receiverMaterials.has(material))continue;
    receiverMaterials.add(material);
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,receiverUniforms);
      shader.vertexShader=`varying vec3 vWaterWorld;\n${shader.vertexShader}`.replace('#include <project_vertex>',`#include <project_vertex>
        vec4 waterWorld=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          waterWorld=instanceMatrix*waterWorld;
        #endif
        vWaterWorld=(modelMatrix*waterWorld).xyz;`);
      shader.fragmentShader=receiverFunction+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
        vec3 waterNormal=inverseTransformDirection(normal,viewMatrix);
        reflectedLight.indirectDiffuse+=reflectedWaterLight(waterNormal)*material.diffuseColor/3.14159265;`);
    };
    material.customProgramCacheKey=()=> 'directional-water-light-v2';material.needsUpdate=true;
  }}
  attachReceivers(materials);
  const characterDepthGroup=new THREE.Group();depthScene.add(characterDepthGroup);
  let characterRoot=null,characterDepthPairs=[],lastCharacterDepth=-Infinity,wasInside=false;
  function setCharacter(root){
    characterRoot=root;characterDepthGroup.clear();characterDepthPairs=[];const characterMaterials=[];
    root.updateMatrixWorld(true);
    root.traverse(object=>{
      if(!object.isMesh)return;
      let visible=true;for(let p=object;p&&p!==root;p=p.parent)if(!p.visible)visible=false;
      if(!visible)return;
      characterMaterials.push(...(Array.isArray(object.material)?object.material:[object.material]));
      if(object.material?.transparent&&object.material.opacity<.5)return;
      const clone=object.clone(false);clone.matrixAutoUpdate=false;clone.matrix.copy(object.matrixWorld);
      characterDepthGroup.add(clone);characterDepthPairs.push([object,clone]);
    });
    attachReceivers(characterMaterials);lastCharacterDepth=-Infinity;
  }
  let projectionBuilt=false;
  function refreshProjection(){
    scene.updateMatrixWorld(true);
    for(const[source,clone]of characterDepthPairs)clone.matrix.copy(source.matrixWorld);
    if(!projectionBuilt){
      scene.traverse(object=>{
        if(!object.isMesh||(!object.castShadow&&object.name!=='Sandy peninsula')||object.material?.transmission>0)return;
        const clone=object.clone(false);clone.matrixAutoUpdate=false;clone.matrix.copy(object.matrixWorld);depthScene.add(clone);
      });projectionBuilt=true;
    }
    const direction=receiverUniforms.waterLightDirection.value;
    // Focused reflected rays come from the steeper normals in the wave field.
    direction.set(-sunDirection.x,.24+Math.max(0.,sunDirection.y),-sunDirection.z).normalize();
    // Start above the water, not behind the seabed; otherwise the terrain
    // incorrectly shadows every interior receiver from this low light angle.
    projectionCamera.position.set(-5,3.3,3).addScaledVector(direction,-(3.3-.08)/direction.y);
    projectionCamera.lookAt(-5,3.3,3);projectionCamera.updateMatrixWorld(true);
    receiverUniforms.waterLightMatrix.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1)
      .multiply(projectionCamera.projectionMatrix).multiply(projectionCamera.matrixWorldInverse);
    const target=renderer.getRenderTarget();renderer.setRenderTarget(projectionTarget);renderer.clear();renderer.render(depthScene,projectionCamera);renderer.setRenderTarget(target);
  }
  const originalReflection=water.onBeforeRender;
  water.onBeforeRender=function(...args){
    const show=surf.visible,disc=skyMaterial.uniforms.showSunDisc.value;
    surf.visible=false;skyMaterial.uniforms.showSunDisc.value=0;
    try{originalReflection.apply(this,args);}finally{surf.visible=show;skyMaterial.uniforms.showSunDisc.value=disc;}
  };
  let causticTime=NaN,causticWind=NaN;
  return {
    water,surf,
    surfAt(x,z){return {time:uniforms.time.value,...sampleSurf(x,z,uniforms.time.value,uniforms.waveStrength.value)};},
    setMood(key,palette){
      uniforms.daylight.value=key==='gold'?1:key==='rose'?.52:.03;
      uniforms.sunColor.value.set(key==='gold'?'#ffb455':key==='rose'?'#ffc2b2':'#9fbde4').multiplyScalar(key==='gold'?1.65:key==='rose'?.8:0);
      uniforms.waterColor.value.set(palette.water);
      receiverUniforms.waterLightColor.value.set(key==='gold'?'#ffd29a':'#ffb9b2');
      receiverUniforms.waterLightPower.value=key==='gold'?5.5:key==='rose'?1.8:0;
      refreshProjection();
    },
    setWind(value){uniforms.waveStrength.value=value;},
    setCaustics(enabled){receiverUniforms.waterLightEnabled.value=Number(enabled);},
    setCharacter,
    update(time){
      uniforms.time.value=time;
      if(characterRoot&&receiverUniforms.waterLightPower.value>0){
        const p=characterRoot.position,inside=p.x>-10&&p.x<1&&p.z>-1&&p.z<6.4;
        if((inside&&time-lastCharacterDepth>.12)||inside!==wasInside){refreshProjection();lastCharacterDepth=time;wasInside=inside;}
      }
      if(receiverUniforms.waterLightEnabled.value&&receiverUniforms.waterLightPower.value>0&&(time!==causticTime||uniforms.waveStrength.value!==causticWind)){
        const target=renderer.getRenderTarget();renderer.setRenderTarget(causticTarget);renderer.render(causticScene,quadCamera);renderer.setRenderTarget(target);
        causticTime=time;causticWind=uniforms.waveStrength.value;
      }
    }
  };
}
