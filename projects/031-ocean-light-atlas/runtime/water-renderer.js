// Original visual approximation: layered moving height fields + reflected light.
// This is a procedural illustration, not a fluid-dynamics simulation.
const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uWave;
uniform float uGlint;
uniform float uAngle;
uniform float uFoam;
uniform float uClarity;
uniform float uMode;
uniform float uKind;
uniform float uVariant;
uniform float uDetail;
uniform float uSoftness;
uniform float uRealism;
uniform float uLens;
uniform vec3 uDeep;
uniform vec3 uWater;
uniform vec3 uLight;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float textureNoise(vec2 p) {
  return noise(p) * .55 + noise(p * 2.13 + 9.1) * .28 + noise(p * 4.31 + 19.2) * .17;
}
float surface(vec2 p) {
  if (uRealism > .5) {
    // A small directional wave spectrum. Each component propagates continuously;
    // the finite-difference normal below drives the reflected light as well.
    p *= .65 + uDetail * .55;
    float t = uTime;
    float swell = sin(dot(p,vec2(.18,.98)) * 1.16 - t * .94 + sin(p.x*.43)*.22);
    float crossing = sin(dot(p,vec2(-.48,.87)) * 2.23 - t * 1.31 + .7);
    float ripple = sin(dot(p,vec2(.72,.69)) * 5.8 - t * 2.12 + 1.2);
    float shortWave = sin(dot(p,vec2(-.23,.97)) * 12.7 - t * 3.14 + .4);
    float capillary = sin(dot(p,vec2(.37,.93)) * 27.1 - t * 4.6);
    float fineCross = sin(dot(p,vec2(-.64,.77))*19.3-t*3.8+.6);
    return (swell*.14 + crossing*.061) * (.18 + uWave*1.2)
      + ripple*(.009+uWave*.018) + shortWave*.0045 + fineCross*.003 + capillary*.0017;
  }
  p *= .55 + uDetail * 1.6;
  float t = uTime;
  vec2 drift = vec2(t * .10, -t * .075);
  float broad = sin(p.x * 1.55 + p.y * .72 - t * .69 + sin(p.y * 1.35 + t * .19) * .58);
  float crossWave = sin(p.x * -2.1 + p.y * 3.35 + t * .45 + broad * .5);
  float detail = textureNoise(p * 4.8 + drift);
  float micro = noise(p * 24. + drift * 1.7);
  return (.10 * broad + .049 * crossWave + mix(.09,.025,uSoftness) * detail + mix(.013,.001,uSoftness) * micro) * (.12 + uWave * 1.55);
}
float scatter(vec2 uv,float density,float depth) {
  uv.x *= uResolution.x / uResolution.y;
  vec2 point=uv*density;
  vec2 tile=floor(point);
  float result=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
    vec2 id=tile+vec2(float(x),float(y));
    float seed=hash(id+uVariant*5.7+depth*31.);
    vec2 center=id+vec2(hash(id+17.3),hash(id+4.8))*.82+.09;
    center+=vec2(sin(uTime*.31+seed*8.),cos(uTime*.19+seed*11.))*.055;
    vec2 delta=point-center;
    delta.x*=.64;
    float radius=mix(.055,.22,seed)*depth;
    float edge=.013+uSoftness*.095*depth;
    float dotMask=1.-smoothstep(max(0.,radius-edge),radius+edge,length(delta));
    float cluster=.45+.55*sin(id.y*.61+uTime*.12)*sin(id.x*.31+.7);
    result+=dotMask*(.45+seed*.55)*step(.14+cluster*.18,seed);
  }
  return result;
}
float stars(vec2 uv){
  uv.x*=uResolution.x/uResolution.y;
  vec2 cell=floor(uv*vec2(6.,9.));
  vec2 delta=fract(uv*vec2(6.,9.))-vec2(.2+hash(cell+3.)*.6,.2+hash(cell+6.)*.6);
  float chosen=step(.82,hash(cell+uVariant));
  float disk=1.-smoothstep(.015,.06,length(delta));
  float rays=exp(-abs(delta.x)*180.)*exp(-abs(delta.y)*14.)+exp(-abs(delta.y)*180.)*exp(-abs(delta.x)*14.);
  float diagonal=exp(-abs(delta.x-delta.y)*220.)*exp(-length(delta)*26.);
  return (disk+rays+diagonal*.45)*chosen*(.65+.35*sin(uTime*.7+hash(cell)*30.));
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 designUV=vec2((uv.x-.5)*uResolution.x/uResolution.y+.5,uv.y);
  vec2 screen = (gl_FragCoord.xy - uResolution * .5) / uResolution.y;
  vec3 eye = vec3(0., 4.6, 5.7);
  vec3 forward = normalize(vec3(0., -4.6, -5.7));
  vec3 right = vec3(1., 0., 0.);
  vec3 up = normalize(cross(right, forward));
  vec3 ray = normalize(forward * 1.8 + screen.x * right + screen.y * up);
  vec3 pos = eye + ray * (-eye.y / ray.y);
  vec2 p = pos.xz * 1.8;
  float h = surface(p);
  float e = .018;
  float dx = (surface(p + vec2(e, 0.)) - surface(p - vec2(e, 0.))) / (2. * e);
  float dz = (surface(p + vec2(0., e)) - surface(p - vec2(0., e))) / (2. * e);
  vec3 normal = normalize(vec3(-dx * 1.05, 1., -dz * 1.05));
  vec3 view = -ray;
  float angle = uAngle * .0174532925;
  float warm = smoothstep(.24, .48, uLight.r - uLight.b);
  if(uRealism>.5) {
    if(abs(uVariant-8.)<.1 || abs(uVariant-15.)<.1) warm=1.;
    if(abs(uVariant-7.)<.1) warm=.8;
  }
  vec3 light = normalize(vec3(cos(angle) * .65, mix(.72, .44, warm), -sin(angle) * mix(.68, .85, warm)));
  vec3 halfVector = normalize(view + light);
  float ndl = max(dot(normal, light), 0.);
  float ndv = max(dot(normal, view), 0.);
  float fresnel = .03 + .97 * pow(1. - ndv, 4.);

  float deepTexture = textureNoise(p * .9 + vec2(uTime * .025, 0.));
  float hueMix = clamp(.36 + h * 1.7 + ndl * .29 + (deepTexture - .5) * .28, 0., 1.);
  vec3 water = mix(uDeep, uWater, hueMix);
  water *= .72 + ndl * .40;
  vec3 reflected = reflect(ray, normal);
  vec3 sky = mix(uWater * .68, vec3(.60, .79, .81), clamp(reflected.y * .7 + .3, 0., 1.));
  water = mix(water, sky, clamp(fresnel * .9, 0., .4));

  // Narrow and broad lobes give moving glints on a visible, shaded water surface.
  float specAngle = max(dot(normal, halfVector), 0.);
  float narrow = pow(specAngle, 230.);
  float broad = pow(specAngle, 34.) * .10;
  float broken = .4 + .6 * textureNoise(p * 18. + vec2(uTime * .1));
  float spec = (narrow * 4.8 + broad) * uGlint * broken;
  float sparkle = pow(specAngle, 650.) * 1.8 * uGlint;
  float sunBand = exp(-pow((p.x - .25 + sin(p.y * .15) * .3) * .55, 2.));
  vec3 reflectionTint = mix(uLight, vec3(1., .61, .16), warm * .8);
  vec3 highlights = reflectionTint * (spec + sparkle) * mix(1., .12 + sunBand * 1.15, warm);

  vec2 causticUV = p * 2.1 + vec2(uTime * .045, -uTime * .035);
  float causticField = abs(sin(causticUV.x * 2. + sin(causticUV.y * 2.1 + h * 3.))
                         + sin(causticUV.y * 2.8 + cos(causticUV.x * 1.9)));
  float caustics = pow(1. - smoothstep(.03, .34, causticField), 2.) * uClarity * .105;
  water += vec3(.43, .82, .70) * caustics;

  float crest = sin(p.y * 1.18 + sin(p.x * .65) * 1.1 - uTime * .36);
  float foamNoise = textureNoise(p * 9. + vec2(uTime * .06, -uTime * .11));
  float cells = abs(noise(p * 36. + uTime * .03) - .5);
  float foamMask = smoothstep(.48, .85, crest * .67 + foamNoise * .61);
  float foam = foamMask * smoothstep(.12, .34, foamNoise + cells * .5) * uFoam;
  vec3 color = water + highlights;
  color = mix(color, mix(vec3(.61, .81, .82), uLight, .67), foam);

  // Retain the original illustration for an honest before/after comparison.
  float t=uTime*.12;
  float variant=uVariant;
  if (uRealism < .5) {
  if(abs(uKind-1.)<.1){
    float strata=.5+(.05+uWave*.4)*sin(uv.y*(80.+uDetail*120.)+sin(designUV.x*4.)+t);
    color=mix(mix(uDeep,uWater,strata),water,.72);
    vec2 glintUV=uv+vec2(cos(angle),sin(angle))*.07;
    float density=abs(variant-6.)<.1?34.:abs(variant-10.)<.1?40.:55.+uDetail*70.;
    float points=scatter(glintUV,density,1.05)+scatter(glintUV,density*1.8,.7)*.65;
    if(abs(variant-10.)<.1){
      color*=.6;
      points*=.3+.7*smoothstep(.25,.85,sin(uv.y*17.+.8)*.5+.5);
    }
    if(abs(variant-6.)<.1)points+=scatter(uv,17.,1.2)*.25;
    points*=.15+.85*smoothstep(.3,.7,textureNoise(p*.9+vec2(t*.07)));
    highlights=uLight*points*uGlint;
    color=mix(color,uLight,clamp(points*uGlint,0.,1.));
    if(uFoam>.01){
      float edge=.27+.08*sin(designUV.x*4.+t);
      float area=1.-smoothstep(edge-.09,edge+.13,uv.y);
      color=mix(color,uLight,area*uFoam*(.7+noise(p*12.)*.3));
    }
  }
  if(abs(uKind-2.)<.1){
    float star=stars(uv)*uGlint*1.2;
    highlights+=uLight*star;
    color+=uLight*star;
  }
  if(abs(uKind-3.)<.1){
    vec2 field=vec2(designUV.x*3.,uv.y*7.);
    float warp=textureNoise(field*1.3+vec2(t*.4,-t*.2));
    vec2 flow=field+vec2(sin(field.y*.8+t)*(.17+uWave*1.5)+warp,warp*.6);
    float currents=textureNoise(flow*vec2(1.9,1.5));
    float silk=1.-smoothstep(.02,.09+uSoftness*.045,abs(currents-.5));
    float fine=1.-smoothstep(.008,.045,abs(textureNoise(flow*3.1)-.54));
    float pools=textureNoise(field*.7+vec2(t*.2,0.));
    color=mix(mix(uDeep,uWater,.35+pools*.6),water,.3);
    highlights=mix(uWater,uLight,.7)*(silk*.54+fine*.11)*(.3+uGlint);
    color+=highlights;
  }
  if(abs(uKind-4.)<.1){
    vec2 field=vec2(designUV.x*9.,uv.y*12.);
    float grain=textureNoise(field*(3.+uDetail*6.)+vec2(t*.3,-t*.4));
    float edge=.38+sin(designUV.x*4.5+t*.6)*.12+sin(designUV.x*10.+t)*.035;
    if(abs(variant-5.)<.1)edge=.72+sin(designUV.x*5.+t)*.10;
    if(abs(variant-17.)<.1)edge=.54+sin(designUV.x*5.+t)*.08;
    float lower=1.-smoothstep(edge-.15,edge+.12,uv.y+(grain-.5)*.15);
    float mask=lower;
    if(abs(variant-1.)<.1){
      float bend=sin((uv.y-designUV.x*.22)*35.+sin(designUV.x*4.)+t);
      mask=max(lower*.9,smoothstep(.35,.84,bend)*.55);
    }
    if(abs(variant-5.)<.1){mask=1.-lower;mask=max(mask,scatter(uv,10.,1.6)*.32);}
    if(abs(variant-19.)<.1){
      float a=sin((uv.y-designUV.x*.5)*57.+t+grain*2.);
      float b=sin((uv.y+designUV.x*.35)*39.-t+grain*3.);
      mask=smoothstep(.2,.85,max(a,b));
    }
    if(abs(variant-20.)<.1){
      float lace=1.-smoothstep(.025,.14,abs(noise(field*5.+vec2(t))-.5));
      float bands=sin((uv.y-designUV.x*.3)*52.+t+grain*2.);
      mask=max(lace*.7,smoothstep(.45,.92,bands)*.85);
    }
    float pores=smoothstep(.25,.66,grain+cells*.3);
    float coverage=clamp(mask*(.3+pores*1.05)*uFoam*1.7,0.,.97);
    vec3 whiteWater=mix(vec3(.58,.78,.84),uLight,.64+grain*.36);
    color=mix(water+highlights*.55,whiteWater,coverage);
    highlights+=uLight*coverage*.15;
  }
  if(abs(uKind-5.)<.1){
    float frequency=140.+uDetail*700.;
    float wobble=sin(designUV.x*4.+uv.y*7.+t)*(.4+uWave*2.)+textureNoise(vec2(designUV.x*8.,uv.y*19.)+t*.15)*25.+cos(angle)*1.7;
    float band=sin(uv.y*frequency+wobble+t);
    float fine=sin(uv.y*frequency*2.43+wobble*1.5-t*.4)*.5+.5;
    float mask=smoothstep(-.1-uSoftness*.5,.7+uSoftness*.2,band+fine*.5);
    vec3 middle=mix(uWater,uLight,.28);
    color=mix(uDeep,middle,.28+noise(p*2.)*.25);
    if(abs(variant-7.)<.1){
      float stripes=smoothstep(.0,.19,band+fine*.3);
      color=mix(uWater,vec3(1.,.82,.10),stripes*.92);
      color=mix(uDeep,color,.76+noise(p)*.24);
    }
    if(abs(variant-8.)<.1){
      float swell=sin(uv.y*18.+sin(designUV.x*2.)*.5+t*.7);
      mask*=smoothstep(-.2,.6,swell);
      color=mix(uDeep,uWater,.25+smoothstep(-.6,.3,swell)*.3);
      color+=vec3(.65,.32,.035)*smoothstep(-.3,.8,swell)*.26;
    }
    if(abs(variant-15.)<.1){
      color=mix(uWater,middle,.4);
      mask=smoothstep(-.3,.5,band+fine*.5);
    }
    if(abs(variant-16.)<.1){mask*=.55;mask+=scatter(vec2(uv.x*.34,uv.y),18.,.8)*.6;}
    if(abs(variant-18.)<.1){
      color=mix(uDeep,middle,smoothstep(.1,.93,uv.y));
      mask*=smoothstep(.2,.85,uv.y)*.45+.08;
    }
    vec3 bandLight=uLight;
    if(abs(variant-8.)<.1||abs(variant-15.)<.1)bandLight=vec3(1.,.67,.16);
    highlights=bandLight*mask*uGlint*(abs(variant-15.)<.1?1.8:.85);
    color+=(water-mix(uDeep,uWater,.6))*.35;
    color+=highlights;
  }
  if(abs(uKind-6.)<.1){
    float line=.53+sin(designUV.x*2.8+.5)*(.045+uWave*.12)+sin(designUV.x*13.+t)*.006;
    float dist=uv.y-line;
    float lip=exp(-pow(dist/mix(.009,.027,uSoftness),2.));
    float body=exp(-pow((dist+.065)/(.06+uWave*.09),2.));
    color=mix(uWater*.7,uLight*.88,smoothstep(line-.1,line+.25,uv.y));
    color+=(water-mix(uDeep,uWater,.6))*.35;
    color=mix(color,uDeep,body*.75);
    color+=uWater*exp(-pow((dist+.04)/.03,2.))*.5;
    highlights=uLight*lip*uGlint*(.65+.25*cos(angle));
    color+=highlights;
    float surf=(1.-smoothstep(-.17,-.09,dist))*uFoam*(.3+textureNoise(p*15.)*.9);
    color=mix(color,uLight*.94,clamp(surf,0.,.9));
  }
  if(abs(uKind-7.)<.1){
    float horizontal=sin(uv.y*(550.+uDetail*800.)+sin(designUV.x*11.+t)*(.3+uWave*4.)+noise(p*3.)*2.);
    color=mix(uDeep,uWater,.6+horizontal*(.04+uWave*.45));
    highlights=uLight*pow(max(0.,horizontal),16.)*uGlint*.17;
    if(abs(variant-13.)<.1){
      float wash=smoothstep(.25,.65,textureNoise(vec2(designUV.x*5.,uv.y*13.)+t*.1));
      color=mix(color,uLight,wash*.85);
    }
    color+=highlights;
  }
  } else {
    // Observation-led approximation, not a measured or fluid-solver sea model.
    // Water is not self-luminous: a coherent normal field controls reflections.
    float calm = step(6.5,uKind);
    float shallow = step(2.5,uKind)*(1.-step(3.5,uKind));
    vec3 deep = pow(mix(uDeep,vec3(dot(uDeep,vec3(.2126,.7152,.0722))),.22),vec3(2.2));
    vec3 body = mix(deep,pow(uWater,vec3(2.2)),.18 + shallow*.2)*.34;
    // Broad sky regions provide orientation-dependent reflected contrast. These
    // are environment-light lobes, not bright lines painted onto the water.
    float skyElevation=clamp(reflected.y,0.,1.);
    float cloud=exp(-pow((skyElevation-.46)*5.,2.))*(.72+.28*sin(reflected.x*8.+reflected.z*3.));
    vec3 reflectedSky = mix(vec3(.12,.18,.23),vec3(.42,.57,.68),smoothstep(.03,.9,skyElevation));
    reflectedSky += vec3(.68,.71,.72)*cloud;
    reflectedSky = mix(reflectedSky,reflectedSky*vec3(1.,.79,.58),warm*.74)*2.4;
    float waterFresnel = .0204 + .9796*pow(1.-ndv,5.);
    color = body*(1.-waterFresnel) + reflectedSky*waterFresnel;
    // A bounded microfacet lobe replaces screen-space dots and painted stripes.
    float nh = max(dot(normal,halfVector),0.);
    float roughness = .09 + uSoftness*.09 + calm*.025;
    float a2 = pow(roughness,4.);
    float denom = nh*nh*(a2-1.)+1.;
    float distribution = a2/(3.14159265*denom*denom + .000001);
    float specularF = .0204 + .9796*pow(1.-max(dot(view,halfVector),0.),5.);
    float specular = distribution*specularF/(4.*max(.15,ndv)) * uGlint * .85;
    vec3 sunColor = mix(vec3(1.,.98,.91),vec3(1.,.72,.39),warm);
    highlights = sunColor*specular;
    color += highlights;
    // Weak subsurface contrast in clear water. This is a visual approximation;
    // a still reference alone cannot establish bottom depth or caustic geometry.
    float transmitted = smoothstep(-.09,.12,h) * shallow * uClarity;
    color += uWater*transmitted*.10;
    // Foam is born near a travelling crest, advects, then loses coverage.
    // This does not reproduce an overturning lip or volumetric spray.
    vec2 wavePosition=p*(.65+uDetail*.55);
    float phase = dot(wavePosition,vec2(.18,.98))*1.16-uTime*.94+sin(wavePosition.x*.43)*.22;
    float cycle = fract((1.5707963-phase)/6.2831853);
    float age = cycle*7.8;
    float birth = smoothstep(0.,.6,age);
    float decay = exp(-age*.55)*(1.-smoothstep(4.5,6.4,age));
    vec2 foamUV = p*vec2(6.2,8.4)+vec2(.12*uTime,-.48*uTime);
    float patch = textureNoise(foamUV + vec2(sin(p.y*2.)*.3,0.));
    float pores = noise(foamUV*3.7);
    float foamCoverage = birth*decay*smoothstep(.30,.66,patch + pores*.18)*uFoam;
    // A fixed world-space shoaling region limits whitewater to the near shore;
    // this is an assumed depth region, not surveyed bathymetry.
    foamCoverage *= smoothstep(-3.,1.,p.y);
    float breaker = step(3.5,uKind)*(1.-step(4.5,uKind));
    float lipFamily = step(5.5,uKind)*(1.-step(6.5,uKind));
    foamCoverage *= breaker*2.4 + lipFamily*.65 + (1.-breaker-lipFamily)*.28;
    vec3 foamColor = mix(vec3(.29,.36,.39),vec3(.83,.83,.76),ndl*.64+.2);
    color = mix(color,foamColor,clamp(foamCoverage,0.,.91));
    // No fabricated bright outline: a crest can brighten through its orientation.
    // A refracting, overturning wave still needs a proper geometric model.
    if (uLens > .5) {
      if(abs(uKind-1.)<.1) {
        // Lens illustration only: restrict synthetic kernels to glint-bearing areas.
        float glintRegion = smoothstep(.965,.997,nh);
        float depth = mix(.7,1.35,1.-uv.y);
        float bokeh = scatter(uv,26.+uDetail*24.,depth)*glintRegion*uGlint*.55;
        color += sunColor*bokeh;
        highlights += sunColor*bokeh;
      }
      if(abs(uKind-2.)<.1) {
        float diffraction = stars(uv)*smoothstep(.985,.999,nh)*uGlint*.35;
        color += sunColor*diffraction;
        highlights += sunColor*diffraction;
      }
    }
    color = pow(max(color,vec3(0.)),vec3(1./2.2));
    highlights = pow(max(highlights,vec3(0.)),vec3(1./2.2));
  }

  if (uMode > .5 && uMode < 1.5) color = vec3(.018, .045, .057) + highlights;
  if (uMode > 1.5) color = normal * .5 + .5;
  float vignette = 1. - .18 * pow(length((uv - .5) * vec2(.85, 1.)), 1.5);
  color *= vignette;
  // Soft highlight compression keeps bright reflection from losing all texture.
  color = color / max(1.,.25+max(max(color.r,color.g),color.b)*.75);
  color += (hash(gl_FragCoord.xy) - .5) / 210.;
  gl_FragColor = vec4(clamp(color, 0., 1.), 1.);
}
`;

const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(part => parseInt(part, 16) / 255);

export class WaterRenderer {
  constructor(canvas, { maxPixels = 760000 } = {}) {
    this.canvas = canvas;
    this.maxPixels = maxPixels;
    this.failed = false;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL unavailable');
    this.gl = gl;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Water shader: ${error}`);
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    this.program = program;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = Object.fromEntries(['Resolution', 'Time', 'Wave', 'Glint', 'Angle', 'Foam', 'Clarity', 'Mode', 'Kind', 'Variant', 'Detail', 'Softness', 'Realism', 'Lens', 'Deep', 'Water', 'Light'].map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.failed = true;
      canvas.dispatchEvent(new CustomEvent('renderer-lost'));
    });
  }

  resize(width, height, pixelRatio = 1) {
    const scale = Math.min(pixelRatio, Math.sqrt(this.maxPixels / Math.max(1, width * height)));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  draw(study, controls, time, mode = 0, { realismProfile = 'calibrated', lensEffects = false } = {}) {
    if (this.failed) return;
    const gl = this.gl, u = this.uniforms;
    gl.useProgram(this.program);
    gl.uniform2f(u.Resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.Time, time);
    gl.uniform1f(u.Wave, controls.wave / 100);
    gl.uniform1f(u.Glint, controls.glint / 100);
    gl.uniform1f(u.Angle, controls.angle);
    gl.uniform1f(u.Foam, controls.foam === undefined ? study.foam : controls.foam / 100);
    gl.uniform1f(u.Clarity, study.clarity);
    gl.uniform1f(u.Mode, mode);
    gl.uniform1f(u.Kind, study.kind || 0);
    gl.uniform1f(u.Variant, Number(study.number) || 0);
    gl.uniform1f(u.Detail, (controls.detail ?? 45) / 100);
    gl.uniform1f(u.Softness, (controls.softness ?? 15) / 100);
    gl.uniform1f(u.Realism, realismProfile === 'reference' ? 0 : 1);
    gl.uniform1f(u.Lens, lensEffects ? 1 : 0);
    gl.uniform3fv(u.Deep, rgb(study.deep));
    gl.uniform3fv(u.Water, rgb(study.water));
    gl.uniform3fv(u.Light, rgb(study.light));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

// Accessible compatibility view when WebGL is disabled. Uses the same controls.
export class CanvasWaterRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.failed = false;
    if (!this.context) throw new Error('Canvas unavailable');
  }

  resize(width, height, pixelRatio = 1) {
    const scale = Math.min(pixelRatio, 1.4);
    this.canvas.width = Math.max(1, Math.round(width * scale));
    this.canvas.height = Math.max(1, Math.round(height * scale));
  }

  draw(study, controls, time, mode = 0) {
    const ctx = this.context, w = this.canvas.width, h = this.canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, w * .4, h);
    gradient.addColorStop(0, mode === 1 ? '#061924' : mode === 2 ? '#729cb8' : study.water);
    gradient.addColorStop(1, mode === 1 ? '#061924' : mode === 2 ? '#94ccb1' : study.deep);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    const wave = 2 + controls.wave / 6;
    const angleOffset = Math.cos(controls.angle * Math.PI / 180) * w * .4;
    for (let row = -10; row < 85; row++) {
      const y = row * h / 75;
      const phase = row * 1.71;
      ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 6) {
        const yy = y + Math.sin(x / 58 + phase + time * .4) * wave + Math.sin(x / 19 + phase * 1.6 - time * .27) * wave * .23;
        if (x === -10) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = mode === 2 ? '#aed8bc' : study.light;
      ctx.lineWidth = .5 + (Math.sin(row * 6.2) * .5 + .5) * 1.2;
      ctx.globalAlpha = .025 + controls.glint / 100 * (.04 + (Math.sin(phase + time * .2) * .5 + .5) * .19);
      ctx.stroke();
      if (controls.glint > 0 && mode !== 2) {
        for (let j = 0; j < 7; j++) {
          const x = ((Math.sin(row * 13.7 + j * 38.2) * .5 + .5) * w + angleOffset + time * 2) % w;
          const yy = y + Math.sin(x / 58 + phase + time * .4) * wave;
          ctx.fillStyle = study.light;
          ctx.globalAlpha = controls.glint / 100 * Math.max(0, Math.sin(row * 3 + j + time * .8)) * .7;
          ctx.fillRect(x, yy, 1.5 + j * .6, 1.4);
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}

export function createRenderer(canvas, options) {
  try {
    return { renderer: new WaterRenderer(canvas, options), compatibility: false };
  } catch (error) {
    // A canvas cannot switch context types after context creation, so replace it.
    const replacement = document.createElement('canvas');
    replacement.id = canvas.id;
    replacement.className = canvas.className;
    replacement.setAttribute('aria-label', canvas.getAttribute('aria-label') || '海面光影示意');
    canvas.replaceWith(replacement);
    return { renderer: new CanvasWaterRenderer(replacement), compatibility: true };
  }
}
