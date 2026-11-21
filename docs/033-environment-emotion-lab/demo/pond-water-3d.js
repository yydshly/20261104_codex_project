import * as THREE from './vendor/three.module.js';
import { Water } from './vendor/Water.js';

const RIPPLE_COUNT = 8, WAKE_COUNT = 8;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const inPond = (x, z) => Number.isFinite(x) && Number.isFinite(z) && x*x/30.25 + z*z/14.44 < .997;
const smooth = (a,b,x) => {const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

// Shared by the vertex displacement and fragment normal. The first three broad
// waves also have an identical CPU form for a floating object's waterline.
const baseWaves = /* glsl */ `
  float shoreDamping(vec2 p) {
    return smoothstep(0.0, 0.17, 1.0 - length(p / vec2(5.5,3.8)));
  }
  vec3 broadWaves(vec2 p) {
    float t=time;
    float warp=sin(p.x*.52+p.y*.33+t*.11)*.28;
    float a=dot(p,vec2(.936,.351))*3.1-t*.94+warp;
    float b=dot(p,vec2(-.416,.909))*5.3+t*1.27+1.8;
    float c=dot(p,vec2(.707,-.707))*8.7-t*1.64+sin(t*.17)*.3;
    float strength=(.32+pondWind*.72)*shoreDamping(p);
    float height=(sin(a)*.012+sin(b)*.006+sin(c)*.0028)*strength;
    vec2 slope=(vec2(.936,.351)*cos(a)*.0372+vec2(-.416,.909)*cos(b)*.0318+vec2(.707,-.707)*cos(c)*.02436)*strength;
    return vec3(height,slope);
  }
`;

const fineWaves = /* glsl */ `
  float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float bedNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);}
  float windPatch(vec2 p) {
    // Slowly travelling wind patches leave sheltered areas almost unbroken.
    return smoothstep(.21,.79,bedNoise(p*.38+vec2(time*.018,-time*.011)));
  }
  vec3 swimmerProfile(vec2 p) {
    vec2 forward=pondSwimmer.zw,side=vec2(-forward.y,forward.x),offset=p-pondSwimmer.xy;
    float along=dot(offset,forward),cross=dot(offset,side);
    float radius=length(vec2(along/(pondSwimmerSize.x*.39),cross/(pondSwimmerSize.y*.48)));
    return vec3(along,cross,radius);
  }
  vec3 surfaceField(vec2 p) {
    vec3 broad=broadWaves(p); vec2 slope=broad.yz; float glint=0.;
    float t=time;
    vec2 drift=p+vec2(sin(p.y*.7+t*.13),cos(p.x*.5-t*.09))*.16;
    // At shore-level viewing angles, sub-millimetric ripples must still bend
    // reflected trunks. Their 16–36 cm wavelengths remain readable without
    // adding white sparkle or increasing the large-scale displacement.
    float detail=(.46+pondWind*.68)*(.36+windPatch(p)*.64)*shoreDamping(p);
    // Independent phase packets keep separate reflected trunks from bending
    // in lockstep along one unbroken, equal-amplitude sinusoidal ridge.
    float packetA=bedNoise(p*.72+vec2(t*.031,-t*.019));
    float packetB=bedNoise(p*.93+vec2(-t*.024,t*.017)+vec2(8.3,-5.7));
    float phaseA=(packetA-.5)*4.2,phaseB=(packetB-.5)*3.5;
    slope+=vec2(.86,.51)*cos(dot(drift,vec2(.86,.51))*17.3-t*1.68+phaseA)*.044*detail*(.55+packetB*.65);
    slope+=vec2(-.55,.84)*cos(dot(drift,vec2(-.55,.84))*27.7+t*2.17+.8+phaseB)*.029*detail*(1.15-packetA*.45);
    slope+=vec2(.25,.97)*cos(dot(drift,vec2(.25,.97))*39.1-t*2.83+phaseA*.7-phaseB*.6)*.012*detail;
    for(int i=0;i<${RIPPLE_COUNT};i++){
      vec4 r=pondRipples[i]; float age=pondRippleTime-r.z;
      if(r.w>0. && age>=0. && age<5.2){
        vec2 offset=p-r.xy;float d=length(offset),radius=age*.76;
        float width=.09+age*.018, band=d-radius;
        float envelope=exp(-band*band/(width*width))*exp(-age*.63)*r.w*smoothstep(0.,.12,age);
        float crest=cos(band*34.);
        slope+=offset/max(d,.04)*crest*envelope*.12;
        glint+=envelope*.010;
      }
    }
    // Each short segment retains its original heading and hull dimensions.
    // A small duck leaves a narrow wake; there is no luminous foam ribbon.
    for(int i=0;i<${WAKE_COUNT};i++){
      vec4 w=pondWakes[i];float age=pondRippleTime-w.z;
      if(w.w>0. && age>=0. && age<4.4){
        vec2 forward=pondWakeDirections[i],side=vec2(-forward.y,forward.x);
        vec2 offset=p-w.xy;float along=dot(offset,forward),cross=dot(offset,side);
        vec2 hull=pondWakeSizes[i];
        float trail=-along-hull.x*.28, width=hull.y*.22+max(0.,trail)*.25+age*.018;
        float band=abs(cross)-width;
        float trailGate=smoothstep(-.055,.10,trail)*(1.-smoothstep(.22+age*.28+w.w*.25,.52+age*.38+w.w*.42,trail));
        float bandWidth=max(.020+age*.009,fwidth(band)*1.2);
        float envelope=exp(-band*band/(bandWidth*bandWidth))*trailGate*exp(-age*1.05)*w.w;
        float ridge=cos(band*56.-age*.65);
        slope+=side*sign(cross)*ridge*envelope*.049;
        slope+=forward*sin(band*41.)*envelope*.009;
        glint+=envelope*.006;
      }
    }
    if(pondSwimmerSize.w>.5){
      vec3 body=swimmerProfile(p);
      vec2 forward=pondSwimmer.zw,side=vec2(-forward.y,forward.x);
      vec2 halfSize=pondSwimmerSize.xy*vec2(.39,.48);
      vec2 localNormal=body.xy/(halfSize*halfSize);
      vec2 outward=normalize(forward*localNormal.x+side*localNormal.y+vec2(.00001));
      // A millimetric meniscus adheres to the immersed hull, even at rest.
      float meniscus=exp(-pow((body.z-.98)*7.5,2.));
      slope+=outward*meniscus*.013;
      float effort=smoothstep(.025,.55,pondSwimmerSize.z);
      float bow=length(vec2((body.x-pondSwimmerSize.x*.025)/(pondSwimmerSize.x*.40),body.y/(pondSwimmerSize.y*.78)));
      float bowBand=bow-1.;
      float bowEnvelope=exp(-pow(bowBand*8.,2.))*smoothstep(pondSwimmerSize.x*.04,pondSwimmerSize.x*.23,body.x)*effort;
      slope+=outward*cos(bowBand*14.)*bowEnvelope*.034;
      glint+=bowEnvelope*.004;
    }
    return vec3(slope,min(glint,.035));
  }
`;

function waterGeometry(){
  const segments=144,rings=38,positions=[0,0,0],uvs=[.5,.5],indices=[];
  for(let ring=1;ring<=rings;ring++){
    const radius=ring/rings;
    for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,x=Math.cos(a)*radius,y=Math.sin(a)*radius;
      positions.push(x*5.5,y*3.8,0);uvs.push(x*.5+.5,y*.5+.5);
    }
  }
  for(let i=0;i<segments;i++)indices.push(0,1+i,2+i);
  for(let ring=0;ring<rings-1;ring++)for(let i=0;i<segments;i++){
    const a=1+ring*(segments+1)+i,b=a+segments+1;indices.push(a,b,b+1,a,b+1,a+1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
  return geometry;
}

export function createPondWater({origin=[0,0]}={}){
  const geometry=waterGeometry();
  const mesh=new Water(geometry,{textureWidth:512,textureHeight:512,alpha:1,clipBias:.004,sunDirection:new THREE.Vector3(-.35,.65,-.45).normalize(),sunColor:0xffdcb4,waterColor:0x203b32,distortionScale:.7,fog:true});
  mesh.name='Pond water · sheltered shallows and immersed hull contact';mesh.rotation.x=-Math.PI/2;mesh.position.y=.08;mesh.receiveShadow=true;
  mesh.position.x=origin[0];mesh.position.z=origin[1];
  const material=mesh.material,uniforms=material.uniforms;
  uniforms.pondOrigin={value:new THREE.Vector2(...origin)};
  uniforms.pondWind={value:.3};uniforms.pondNight={value:0};uniforms.pondRippleTime={value:0};
  uniforms.pondRipples={value:Array.from({length:RIPPLE_COUNT},()=>new THREE.Vector4(0,0,-100,0))};
  uniforms.pondWakes={value:Array.from({length:WAKE_COUNT},()=>new THREE.Vector4(0,0,-100,0))};
  uniforms.pondWakeDirections={value:Array.from({length:WAKE_COUNT},()=>new THREE.Vector2(1,0))};
  uniforms.pondWakeSizes={value:Array.from({length:WAKE_COUNT},()=>new THREE.Vector2(.75,.3))};
  uniforms.pondSwimmer={value:new THREE.Vector4(0,0,1,0)};
  uniforms.pondSwimmerSize={value:new THREE.Vector4(.75,.3,0,0)};
  uniforms.pondTexel={value:1/512};uniforms.pondShallow={value:new THREE.Color(0x686b4f)};
  uniforms.size.value=1;
  material.vertexShader=material.vertexShader.replace('varying vec4 mirrorCoord;',`uniform float pondWind;\n${baseWaves}\nvarying vec4 mirrorCoord;`);
  material.vertexShader=material.vertexShader.replace('mirrorCoord = modelMatrix * vec4( position, 1.0 );',`
    vec3 displaced=position;
    vec3 surfaceWorld=(modelMatrix*vec4(position,1.)).xyz;
    displaced.z+=broadWaves(surfaceWorld.xz).x;
    mirrorCoord=modelMatrix*vec4(displaced,1.);`);
  material.vertexShader=material.vertexShader.replace('vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );','vec4 mvPosition = modelViewMatrix * vec4(displaced,1.);');

  const start=material.fragmentShader.indexOf('vec4 getNoise('),end=material.fragmentShader.indexOf('void sunLight(');
  if(start<0||end<start)throw new Error('Incompatible Three.js Water shader.');
  material.fragmentShader=material.fragmentShader.slice(0,start)+baseWaves+fineWaves+material.fragmentShader.slice(end);
  material.fragmentShader=material.fragmentShader.replace('varying vec4 mirrorCoord;',`
    uniform float pondWind;uniform float pondNight;uniform float pondRippleTime;uniform float pondTexel;
    uniform vec3 pondShallow;uniform vec4 pondRipples[${RIPPLE_COUNT}];
    uniform vec4 pondWakes[${WAKE_COUNT}];uniform vec2 pondWakeDirections[${WAKE_COUNT}];uniform vec2 pondWakeSizes[${WAKE_COUNT}];
    uniform vec4 pondSwimmer;uniform vec4 pondSwimmerSize;
    varying vec4 mirrorCoord;`);
  material.fragmentShader=material.fragmentShader.replace('vec4 noise = getNoise( worldPosition.xz * size );\n\t\t\t\t\tvec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',`
    vec3 field=surfaceField(worldPosition.xz);
    vec3 surfaceNormal=normalize(vec3(-field.x,1.,-field.y));`);
  if(!material.fragmentShader.includes('vec3 field=surfaceField'))throw new Error('Water normal shader injection failed.');
  material.fragmentShader=material.fragmentShader.replace('sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );','sunLight(surfaceNormal,eyeDirection,260.,.32,.5,diffuseLight,specularLight);');
  material.fragmentShader=material.fragmentShader.replace('vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',`
    // Rotate the reflection offset with the observer, so camera orbit does
    // not pin world-X ripples to the horizontal image axis.
    vec2 towardEye=normalize(worldToEye.xz+vec2(.00001));
    vec2 acrossEye=vec2(towardEye.y,-towardEye.x);
    vec2 distortion=vec2(dot(surfaceNormal.xz,acrossEye),dot(surfaceNormal.xz,towardEye));
    distortion*=distortionScale*(.003+1./max(distance,3.5));
    distortion=clamp(distortion,vec2(-.035),vec2(.035));`);
  material.fragmentShader=material.fragmentShader.replace('vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',`
    vec2 reflectionUv=mirrorCoord.xy/mirrorCoord.w+distortion;
    float reflectionRoughness=.65+windPatch(worldPosition.xz)*(.35+pondWind*.5)+field.z*6.;
    vec2 blur=vec2(pondTexel*reflectionRoughness);
    vec3 reflectionSample=texture2D(mirrorSampler,reflectionUv).rgb*.52;
    reflectionSample+=texture2D(mirrorSampler,reflectionUv+vec2(blur.x,blur.y)).rgb*.12;
    reflectionSample+=texture2D(mirrorSampler,reflectionUv+vec2(-blur.x,blur.y)).rgb*.12;
    reflectionSample+=texture2D(mirrorSampler,reflectionUv+vec2(blur.x,-blur.y)).rgb*.12;
    reflectionSample+=texture2D(mirrorSampler,reflectionUv-blur).rgb*.12;`);
  material.fragmentShader=material.fragmentShader.replace('vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );',`
    vec2 waterPos=worldPosition.xz;
    float radial=length(waterPos/vec2(5.5,3.8));
    vec2 radialGradient=waterPos/vec2(30.25,14.44)/max(radial,.001);
    float shoreDistance=max(0.,(1.-radial)/max(length(radialGradient),.17));
    // Broad submerged shelves and irregular sediment change absorption across
    // the shore. Keep the actual boundary fixed so it overlaps the land mesh.
    float sediment=bedNoise(waterPos*.73+vec2(8.7,-2.1));
    float shelfSlope=.16+bedNoise(waterPos*.41+vec2(-1.3,4.2))*.38;
    float depth=max(.006,shoreDistance*shelfSlope+max(0.,shoreDistance-.55)*.43);
    depth+=sediment*.045*smoothstep(0.,.18,shoreDistance)*exp(-shoreDistance*1.2);
    vec3 bed=pondShallow*(.78+sediment*.23+bedNoise(waterPos*12.7)*.07);
    vec3 transmission=exp(-depth*vec3(6.,3.4,4.8));
    vec3 body=(waterColor*(1.-transmission)+bed*transmission*.65)*(.78+.22*getShadowMask());
    float wetContact=(1.-smoothstep(.01,.10,shoreDistance))*(.6+sediment*.4);
    body*=1.-wetContact*.12;
    float reflected=clamp(.008+reflectance*.94,.025,.94);
    if(pondSwimmerSize.w>.5){
      float hullRadius=swimmerProfile(waterPos).z;
      float contact=exp(-pow((hullRadius-.98)*8.,2.))*.13+(1.-smoothstep(.72,1.02,hullRadius))*.07;
      body*=1.-contact;
      reflectionSample*=1.-contact*.35;
    }
    vec3 albedo=mix(body,reflectionSample,reflected);
    float grazing=smoothstep(.1,.8,1.-theta);
    albedo+=specularLight*(.5+grazing*.5)*(1.-pondNight*.5);
    // Ripples affect normals and reflected light; they do not emit light.
    `);
  // Keep wave/ripple coordinates pond-local when embedded in a larger world.
  // CPU sampling and event APIs remain in pond-local metres.
  material.vertexShader='uniform vec2 pondOrigin;\n'+material.vertexShader.replace('broadWaves(surfaceWorld.xz)','broadWaves(surfaceWorld.xz-pondOrigin)');
  material.fragmentShader='uniform vec2 pondOrigin;\n'+material.fragmentShader.replaceAll('worldPosition.xz','(worldPosition.xz-pondOrigin)');
  material.needsUpdate=true;

  const duskWater=new THREE.Color(0x203b32),nightWater=new THREE.Color(0x10252c),duskShallow=new THREE.Color(0x686b4f),nightShallow=new THREE.Color(0x26342f);
  const duskSun=new THREE.Color(0xffddb3),nightSun=new THREE.Color(0x91adcd);
  const duskDirection=new THREE.Vector3(-.35,.65,-.45).normalize(),nightDirection=new THREE.Vector3(.32,.80,-.28).normalize();
  let lastFrame=null,clock=0,effectClock=0,index=0,wakeIndex=0,windValue=.3,nightValue=0,disposed=false;
  let lastRipple={x:-100,z:-100,time:-100},lastWake={x:-100,z:-100,time:-100};
  function update(time,{wind=.3,night=0,motion=true}={}){
    if(disposed||!Number.isFinite(time))return;
    const dt=lastFrame===null?0:clamp(time-lastFrame,0,.10);lastFrame=time;
    effectClock+=dt;
    const blend=dt===0?1:1-Math.exp(-dt*2.5);
    windValue+=(clamp(Number.isFinite(wind)?wind:.3,0,1)-windValue)*blend;
    nightValue+=(clamp(Number(night)||0,0,1)-nightValue)*blend;
    // Integrate wind-dependent speed so changing wind never rescales past
    // elapsed time and shifts the entire wave field's phase.
    if(motion)clock+=dt*(.65+windValue*.45);
    uniforms.time.value=clock;uniforms.pondRippleTime.value=effectClock;uniforms.pondWind.value=windValue;uniforms.pondNight.value=nightValue;
    uniforms.waterColor.value.copy(duskWater).lerp(nightWater,nightValue);uniforms.pondShallow.value.copy(duskShallow).lerp(nightShallow,nightValue);
    uniforms.sunColor.value.copy(duskSun).lerp(nightSun,nightValue);uniforms.sunDirection.value.copy(duskDirection).lerp(nightDirection,nightValue).normalize();
    uniforms.distortionScale.value=2.1+windValue*.9;
    for(const r of uniforms.pondRipples.value)if(effectClock-r.z>5.2)r.w=0;
    for(const w of uniforms.pondWakes.value)if(effectClock-w.z>4.4)w.w=0;
  }
  function ripple(x,z,strength=.5){
    if(disposed||!inPond(x,z))return false;
    strength=clamp(Number(strength)||.5,.02,1);
    if(effectClock-lastRipple.time<.09&&Math.hypot(x-lastRipple.x,z-lastRipple.z)<.15)return false;
    uniforms.pondRipples.value[index].set(x,z,effectClock,strength);index=(index+1)%RIPPLE_COUNT;lastRipple={x,z,time:effectClock};return true;
  }
  function wake(x,z,heading=0,speed=.3){
    if(disposed||!inPond(x,z)||!Number.isFinite(heading)||!Number.isFinite(speed)||speed<.035)return false;
    if(effectClock-lastWake.time<.23&&Math.hypot(x-lastWake.x,z-lastWake.z)<.12)return false;
    uniforms.pondWakes.value[wakeIndex].set(x,z,effectClock,clamp(speed/.55,.06,1));
    uniforms.pondWakeDirections.value[wakeIndex].set(Math.cos(heading),Math.sin(heading));
    const size=uniforms.pondSwimmerSize.value;
    uniforms.pondWakeSizes.value[wakeIndex].set(size.x,size.y);
    wakeIndex=(wakeIndex+1)%WAKE_COUNT;lastWake={x,z,time:effectClock};return true;
  }
  function setSwimmer(swimmer=null){
    if(disposed)return false;
    if(swimmer===null){uniforms.pondSwimmerSize.value.w=0;return true;}
    const {x,z,heading=0,speed=0,length=.75,width=.3}=swimmer;
    if(!inPond(x,z)||![heading,speed,length,width].every(Number.isFinite)||length<=0||width<=0)return false;
    uniforms.pondSwimmer.value.set(x,z,Math.cos(heading),Math.sin(heading));
    uniforms.pondSwimmerSize.value.set(clamp(length,.25,2),clamp(width,.1,.9),clamp(speed,0,1.5),1);
    return true;
  }
  function sampleHeight(x,z,atTime=clock){
    if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(atTime))return .08;
    const t=atTime,warp=Math.sin(x*.52+z*.33+t*.11)*.28;
    const strength=(.32+windValue*.72)*smooth(0,.17,1-Math.hypot(x/5.5,z/3.8));
    return .08+(Math.sin((x*.936+z*.351)*3.1-t*.94+warp)*.012+Math.sin((x*-.416+z*.909)*5.3+t*1.27+1.8)*.006+Math.sin((x*.707-z*.707)*8.7-t*1.64+Math.sin(t*.17)*.3)*.0028)*strength;
  }
  function resizeQuality(size=512){
    const safeSize=[256,512,768,1024].includes(size)?size:512;
    mesh.renderTarget?.setSize(safeSize,safeSize);uniforms.pondTexel.value=1/safeSize;
  }
  function dispose(){if(disposed)return;disposed=true;mesh.onBeforeRender=()=>{};geometry.dispose();if(mesh.renderTarget)mesh.renderTarget.dispose();else uniforms.mirrorSampler.value?.dispose();material.dispose();}
  return{mesh,update,ripple,wake,setSwimmer,sampleHeight,resizeQuality,dispose};
}
