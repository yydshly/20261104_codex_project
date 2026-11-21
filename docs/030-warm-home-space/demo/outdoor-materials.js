import * as THREE from 'three';
import {createCubeRefresh} from './reflection-refresh.js';

const surfaceVertex=`
  vec4 surfacePosition=vec4(transformed,1.);
  #ifdef USE_INSTANCING
    surfacePosition=instanceMatrix*surfacePosition;
  #endif
  vSurfaceWorld=(modelMatrix*surfacePosition).xyz;
  vSurfaceNormal=inverseTransformDirection(transformedNormal,viewMatrix);
`;

export function createStuccoFinish(){
  const size=256,data=new Uint8Array(size*size*4);let seed=10391;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const a=x/size*Math.PI*2,b=y/size*Math.PI*2;
    const m=Math.sin(a*3+Math.cos(b*2))*.18+Math.cos(b*5+a)*.11;
    const grain=(rand()-.5)*.70,index=(y*size+x)*4;
    data.set([128+grain*125,128+m*110+(rand()-.5)*24,215+grain*35,255],index);
  }
  const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=8;texture.needsUpdate=true;
  return function finish(material,{bump=.00065,weather=.035}={}){
    material.roughness=.94;
    material.onBeforeCompile=shader=>{
      shader.uniforms.stuccoSurface={value:texture};
      shader.uniforms.stuccoBump={value:bump};shader.uniforms.stuccoWeather={value:weather};
      shader.vertexShader='varying vec3 vSurfaceWorld;varying vec3 vSurfaceNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',surfaceVertex+'\n#include <project_vertex>');
      shader.fragmentShader='varying vec3 vSurfaceWorld;varying vec3 vSurfaceNormal;uniform sampler2D stuccoSurface;uniform float stuccoBump,stuccoWeather;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec3 surfaceN=abs(normalize(vSurfaceNormal));
        vec2 surfaceUv=surfaceN.y>.6?vSurfaceWorld.xz:(surfaceN.x>surfaceN.z?vSurfaceWorld.zy:vSurfaceWorld.xy);
        vec4 stucco=texture2D(stuccoSurface,surfaceUv/.75);
        vec4 mottling=texture2D(stuccoSurface,surfaceUv/4.5);
        float storey=fract((vSurfaceWorld.y+8.85)/2.95);
        float damp=(1.-smoothstep(-8.5,-7.35,vSurfaceWorld.y))*.09;
        float ledge=exp(-storey*storey/.0012)*stuccoWeather;
        diffuseColor.rgb*=.97+(mottling.g-.5)*.12+(stucco.g-.5)*.025;
        diffuseColor.rgb*=vec3(1.-ledge-damp,1.-ledge-damp*.9,1.-ledge-damp*.8);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(stucco.b-.84)*.25,.83,1.);
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        float footprint=max(length(dFdx(vSurfaceWorld)),length(dFdy(vSurfaceWorld)));
        float microHeight=(stucco.r-.5)*stuccoBump*(1.-smoothstep(.018,.075,footprint));
        vec3 sigmaX=dFdx(-vViewPosition),sigmaY=dFdy(-vViewPosition);
        vec3 r1=cross(sigmaY,normal),r2=cross(normal,sigmaX);
        float determinant=dot(sigmaX,r1);
        vec3 surfaceGradient=sign(determinant)*(dFdx(microHeight)*r1+dFdy(microHeight)*r2);
        normal=normalize(max(abs(determinant),1.e-8)*normal-surfaceGradient);
      `);
    };
    material.customProgramCacheKey=()=> 'world-stucco-v1';return material;
  };
}

export function finishTreeMaterial(source,isLeaf,daylight){
  const material=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(material,source);
  material.side=THREE.DoubleSide;material.shadowSide=THREE.DoubleSide;material.envMapIntensity=.7;
  material.roughness=isLeaf?.76:.92;material.specularIntensity=isLeaf?.35:.20;
  if(material.normalScale)material.normalScale.multiplyScalar(isLeaf?.65:.7);
  if(material.roughnessMap){material.aoMap=material.roughnessMap;material.aoMapIntensity=isLeaf?.45:.65;}
  if(!isLeaf)return material;
  // This asset has polygonal leaf outlines and opaque JPEG maps, so blending
  // needlessly sorted the complete tree as one transparent object.
  material.transparent=false;material.depthWrite=true;material.forceSinglePass=true;
  material.color.set('#f1ffe7');material.clearcoat=.06;material.clearcoatRoughness=.65;
  material.onBeforeCompile=shader=>{
    shader.uniforms.foliageDaylight=daylight;
    shader.vertexShader='varying float vLeafVariation;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vLeafVariation=.5+.5*sin(position.x*8.7+position.y*5.1+position.z*7.3);
    `);
    shader.fragmentShader='varying float vLeafVariation;uniform float foliageDaylight;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=mix(vec3(.86,.94,.81),vec3(1.02,1.06,.94),vLeafVariation);
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      #if NUM_DIR_LIGHTS > 0
        float backLight=pow(max(dot(geometryViewDir,-directionalLights[0].direction),0.),2.5);
        float leafGrazing=1.-abs(dot(normal,directionalLights[0].direction))*.4;
        float nDotL=dot(normal,directionalLights[0].direction);
        float wrapLight=max((nDotL+.35)/1.35,0.)-max(nDotL,0.);
        outgoingLight+=diffuseColor.rgb*directionalLights[0].color*(backLight*leafGrazing*.11+max(wrapLight,0.)*.10)*foliageDaylight;
      #endif
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'thin-leaf-daylight-v1';return material;
}

export function adaptCutoutCoverage(mesh){
  const before=mesh.onBeforeRender;
  mesh.onBeforeRender=function(renderer,scene,camera,geometry,material,...rest){
    before.call(this,renderer,scene,camera,geometry,material,...rest);
    if(material!==this.material)return;
    const target=renderer.getRenderTarget();
    // Alpha-to-coverage only clips leaves when the current framebuffer has
    // multisampling. Cube probes and the recovery profile have no MSAA.
    const enabled=target?target.samples>0:Boolean(renderer.getContext().getContextAttributes()?.antialias);
    if(material.alphaToCoverage!==enabled){material.alphaToCoverage=enabled;material.needsUpdate=true;}
  };
}

export function createWindowSystem(world,renderer,evening,sunDirection){
  const materials=[];
  const probeUniform={value:null},probeReady={value:0};
  const targets=Array.from({length:2},()=>new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false}));
  const probe=new THREE.CubeCamera(.2,150,targets[0]);probe.position.set(0,.7,-19);
  const refresh=createCubeRefresh({
    invalidate(){for(const m of materials){m.uniforms.courtyardProbe.value=null;m.uniforms.courtyardProbeReady.value=0;}},
    complete(index){for(const m of materials){m.uniforms.courtyardProbe.value=targets[index].texture;m.uniforms.courtyardProbeReady.value=1;}},
    renderFace(index,face){
      if(probe.coordinateSystem!==renderer.coordinateSystem){probe.coordinateSystem=renderer.coordinateSystem;probe.updateCoordinateSystem();}
      probe.updateMatrixWorld(true);
      const previous=renderer.getRenderTarget(),cubeFace=renderer.getActiveCubeFace(),mip=renderer.getActiveMipmapLevel(),xr=renderer.xr.enabled,autoClear=renderer.autoClear,shadows=renderer.shadowMap.autoUpdate;
      try{
        renderer.xr.enabled=false;renderer.autoClear=true;renderer.shadowMap.autoUpdate=false;
        renderer.setRenderTarget(targets[index],face,0);renderer.render(world,probe.children[face]);
      }finally{
        renderer.setRenderTarget(previous,cubeFace,mip);renderer.xr.enabled=xr;renderer.autoClear=autoClear;renderer.shadowMap.autoUpdate=shadows;
      }
    },
  });
  const vertexShader=`
    varying vec3 vWindowWorld,vWindowX,vWindowY,vWindowZ;varying vec2 vWindowSize,vWindowUv;varying float vWindowSeed;
    #include <fog_pars_vertex>
    void main(){
      vec4 p=vec4(position,1.),origin=vec4(0.,0.,0.,1.);mat3 basis=mat3(1.);
      #ifdef USE_INSTANCING
        p=instanceMatrix*p;origin=instanceMatrix*origin;basis=mat3(instanceMatrix);
      #endif
      basis=mat3(modelMatrix)*basis;p=modelMatrix*p;origin=modelMatrix*origin;
      vWindowWorld=p.xyz;vWindowX=normalize(basis[0]);vWindowY=normalize(basis[1]);vWindowZ=normalize(basis[2]);
      vWindowSize=vec2(length(basis[0]),length(basis[1]));vWindowUv=position.xy+.5;
      vWindowSeed=fract(sin(dot(origin.xyz,vec3(.73,1.13,.37)))*173.19);
      vec4 mvPosition=viewMatrix*p;gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`;
  const fragmentShader=`
    varying vec3 vWindowWorld,vWindowX,vWindowY,vWindowZ;varying vec2 vWindowSize,vWindowUv;varying float vWindowSeed;
    uniform samplerCube courtyardProbe;uniform float courtyardProbeReady,windowEvening,windowStyle,windowProfile;uniform vec3 windowSun;
    #include <common>
    #include <fog_pars_fragment>
    float edgeBox(vec2 p,vec2 a,vec2 b){vec2 q=smoothstep(a,a+.018,p)*(1.-smoothstep(b-.018,b,p));return q.x*q.y;}
    void main(){
      vec3 view=normalize(cameraPosition-vWindowWorld),n=normalize(vWindowZ);
      float facing=abs(dot(n,view));
      vec3 ray=vec3(-dot(view,vWindowX)/vWindowSize.x,-dot(view,vWindowY)/vWindowSize.y,-max(facing,.03)/3.5);
      ray.xy=sign(ray.xy+vec2(1.e-6))*max(abs(ray.xy),vec2(1.e-5));
      vec3 start=vec3(vWindowUv-.5,0.);
      vec3 planes=vec3((sign(ray.x)*.5-start.x)/ray.x,(sign(ray.y)*.5-start.y)/ray.y,-1./ray.z);
      float distanceToWall=min(min(planes.x,planes.y),planes.z);
      vec3 hit=start+ray*distanceToWall;vec2 roomUv=hit.xy+.5;
      float sideWall=step(min(planes.x,planes.y),planes.z);
      vec3 room=mix(vec3(.20,.19,.16),vec3(.29,.26,.21),vWindowSeed);
      room*=mix(.74,1.,smoothstep(-.5,.4,hit.y));room*=1.-sideWall*.30;
      float furniture=edgeBox(roomUv,vec2(.10+.12*vWindowSeed,.04),vec2(.72+.15*vWindowSeed,.22+.12*vWindowSeed));
      room=mix(room,vec3(.065,.071,.064),furniture*.8);
      float picture=edgeBox(roomUv,vec2(.47,.47),vec2(.72,.70));room=mix(room,vec3(.10,.115,.10),picture*.65);
      float shelving=edgeBox(roomUv,vec2(.84,.06),vec2(.98,.76))*step(.5,vWindowSeed);
      room=mix(room,vec3(.105,.086,.060),shelving*.75);
      vec2 curtainUv=vWindowUv+ray.xy*(-.12/ray.z);
      float leftWidth=.06+.26*fract(vWindowSeed*3.17+windowStyle*.13);
      float rightWidth=.08+.28*fract(vWindowSeed*5.31+windowStyle*.17);
      float closed=step(.85,fract(vWindowSeed*4.73+windowStyle*.19));
      float curtain=max(1.-smoothstep(leftWidth-.015,leftWidth+.015,curtainUv.x),smoothstep(1.-rightWidth-.015,1.-rightWidth+.015,curtainUv.x));
      curtain=mix(curtain,1.,closed);
      float blind=step(.82,fract(windowStyle*.41+vWindowSeed));
      float blindDrop=.35+.40*vWindowSeed;
      curtain=mix(curtain,smoothstep(1.-blindDrop-.01,1.-blindDrop+.01,curtainUv.y),blind);
      if(windowProfile>2.5)curtain=0.;
      vec3 linen=mix(vec3(.42,.395,.335),vec3(.35,.385,.37),step(1.5,mod(windowStyle,4.)));
      linen*=.88+.12*cos(curtainUv.x*85.);
      linen*=1.-blind*.10*(.5+.5*sin(curtainUv.y*150.));
      room=mix(room,linen,curtain*.94);
      float lit=step(.45,fract(vWindowSeed*7.31+windowStyle*.073));
      if(windowProfile>2.5)lit=1.;
      vec3 lamp=mix(vec3(.67,.42,.21),vec3(.51,.43,.32),vWindowSeed);
      room*=mix(.72,.09,windowEvening);room+=lamp*lit*windowEvening*(.28+.30*vWindowSeed+curtain*.25);
      room+=lamp*step(.92,vWindowSeed)*.09*(1.-windowEvening);
      vec3 reflectionDirection=reflect(-view,n);
      vec3 reflected=mix(vec3(.11,.16,.18),vec3(.43,.53,.60),smoothstep(-.3,.65,reflectionDirection.y));
      if(courtyardProbeReady>.5){
        reflected=textureCube(courtyardProbe,reflectionDirection).rgb*.6;
        reflected+=textureCube(courtyardProbe,normalize(reflectionDirection+vWindowX*.006)).rgb*.10;
        reflected+=textureCube(courtyardProbe,normalize(reflectionDirection-vWindowX*.006)).rgb*.10;
        reflected+=textureCube(courtyardProbe,normalize(reflectionDirection+vWindowY*.006)).rgb*.10;
        reflected+=textureCube(courtyardProbe,normalize(reflectionDirection-vWindowY*.006)).rgb*.10;
      }
      float fresnel=.04+.96*pow(1.-facing,5.);
      float glassReflection=.22+.70*fresnel;
      if(windowProfile>1.5&&windowProfile<2.5)glassReflection=0.;
      float edgeDirt=(1.-smoothstep(0.,.045,min(min(vWindowUv.x,1.-vWindowUv.x),min(vWindowUv.y,1.-vWindowUv.y))))*.065;
      vec3 colour=mix(room,reflected*vec3(.90,.98,1.),glassReflection)*(1.-edgeDirt);
      colour+=vec3(1.,.94,.81)*pow(max(dot(reflectionDirection,windowSun),0.),1200.)*.30*(1.-windowEvening);
      float opacity=1.;
      if(windowProfile>.5&&windowProfile<1.5){colour=reflected*vec3(.90,.98,1.);opacity=.11+.34*fresnel;}
      gl_FragColor=vec4(colour,opacity);
      #include <fog_fragment>
    }`;
  return {
    material(style,{profile=0}={}){
      const uniforms=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{courtyardProbe:probeUniform,courtyardProbeReady:probeReady,windowEvening:evening,windowStyle:{value:style},windowProfile:{value:profile},windowSun:{value:sunDirection}}]);
      uniforms.windowEvening=evening;
      const material=new THREE.ShaderMaterial({name:'CourtyardGlassWithInterior',vertexShader,fragmentShader,fog:true,uniforms,transparent:profile===1,depthWrite:profile!==1,side:profile===1?THREE.DoubleSide:THREE.FrontSide});materials.push(material);return material;
    },
    capture(){refresh.request();},
    update(){refresh.update();},
    restore(){targets.forEach(t=>t.dispose());refresh.reset();},
    get status(){return {...refresh.status(),resolution:256};},
  };
}
