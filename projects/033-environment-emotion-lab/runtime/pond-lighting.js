import * as THREE from './vendor/three.module.js';
import { HDRLoader } from './vendor/addons/loaders/HDRLoader.js';
import { EffectComposer } from './vendor/addons/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/addons/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from './vendor/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/addons/postprocessing/OutputPass.js';

export function createPondLighting(renderer,scene,camera,canvas){
  let disposed=false, envTarget=null;
  let resolveReady,rejectReady;
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
  const pmrem=new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  new HDRLoader().load('./assets/lighting/mossy-forest-1k.hdr',texture=>{
    if(disposed){texture.dispose();resolveReady();return;}
    texture.mapping=THREE.EquirectangularReflectionMapping;
    envTarget=pmrem.fromEquirectangular(texture);
    scene.environment=envTarget.texture;
    scene.environmentRotation.set(0,-.8,0);
    texture.dispose();pmrem.dispose();canvas.dataset.lighting='hdr-ready';resolveReady();
  },undefined,error=>{
    pmrem.dispose();
    if(disposed){resolveReady();return;}
    canvas.dataset.lighting='hdr-unavailable';
    rejectReady(new Error('池塘森林环境光载入失败',{cause:error}));
  });

  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4,depthTexture:new THREE.DepthTexture(1,1,THREE.UnsignedIntType)});
  const composer=new EffectComposer(renderer,target);
  const renderPass=new RenderPass(scene,camera);
  // Reconstruct AO normals from the main render's actual depth. This preserves
  // wind-bent leaves / duck skin / displaced water and avoids a second scene pass.
  const ao=new GTAOPass(scene,camera,512,512,{depthTexture:target.depthTexture},{radius:.48,thickness:.42,distanceExponent:1.2,distanceFallOff:1,samples:8});
  const renderAO=ao.render.bind(ao);
  ao.render=(renderer,writeBuffer,readBuffer,...rest)=>{
    const depth=readBuffer.depthTexture;
    ao.depthTexture=depth;
    ao.gtaoMaterial.uniforms.tDepth.value=depth;
    ao.pdMaterial.uniforms.tDepth.value=depth;
    ao.depthRenderMaterial.uniforms.tDepth.value=depth;
    renderAO(renderer,writeBuffer,readBuffer,...rest);
  };
  ao.blendIntensity=.25;
  ao.updatePdMaterial({radius:5,samples:8,rings:2});
  const bloom=new UnrealBloomPass(new THREE.Vector2(512,512),.22,.55,1.12);
  const output=new OutputPass();
  composer.addPass(renderPass);composer.addPass(ao);composer.addPass(bloom);composer.addPass(output);

  // A real sky volume remains correctly positioned in water reflections and camera rotations.
  const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{uNight:{value:0},uSun:{value:new THREE.Vector3(-.65,.33,-.55).normalize()}},
    vertexShader:`varying vec3 direction;void main(){direction=position;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 direction;uniform float uNight;uniform vec3 uSun;
      void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.,1.);float glow=pow(max(0.,dot(d,uSun)),12.);
      vec3 horizon=mix(vec3(.53,.63,.59),vec3(.026,.058,.09),uNight);
      vec3 zenith=mix(vec3(.20,.36,.45),vec3(.008,.019,.045),uNight);
      vec3 c=mix(horizon,zenith,pow(h,.52));c+=vec3(.48,.26,.09)*glow*(1.-uNight);
      c=mix(c,horizon,1.-smoothstep(-.12,.03,d.y));gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  });
  const sky=new THREE.Mesh(new THREE.SphereGeometry(85,32,16),skyMaterial);sky.name='Atmospheric sky';scene.add(sky);
  return {
    ready,
    update(night,lightDirection){
      if(lightDirection)skyMaterial.uniforms.uSun.value.copy(lightDirection).normalize();
      skyMaterial.uniforms.uNight.value=night;
      scene.environmentIntensity=THREE.MathUtils.lerp(.9,.18,night);
      bloom.strength=THREE.MathUtils.lerp(.035,.09,night);
      renderer.toneMappingExposure=THREE.MathUtils.lerp(.92,1.05,night);
    },
    render(dt){renderer.info.autoReset=false;renderer.info.reset();composer.render(dt);},
    resize(width,height){
      const dpr=Math.min(devicePixelRatio||1,1.5);
      composer.setPixelRatio(dpr);composer.setSize(width,height);
      ao.setSize(Math.max(1,Math.round(width*dpr*.6)),Math.max(1,Math.round(height*dpr*.6)));
      ao.enabled=width>=600;
    },
    dispose(){disposed=true;scene.environment=null;envTarget?.dispose();pmrem.dispose();ao.gtaoMaterial.dispose();ao.blendMaterial.dispose();composer.passes.forEach(p=>p.dispose?.());composer.dispose();sky.geometry.dispose();skyMaterial.dispose();sky.removeFromParent();},
  };
}
