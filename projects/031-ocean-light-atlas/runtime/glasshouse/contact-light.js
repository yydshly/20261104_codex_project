import * as THREE from 'three';
import { supportHeight } from './walk-surface.js';

// A small, geometry-attached ambient contact approximation. Direct sunlight
// still uses the real shadow map. No dark billboard floats under the actor.
export function createContactLight(materials){
  const uniforms={contactFeet:{value:[new THREE.Vector4(0,-100,0,0),new THREE.Vector4(0,-100,0,0)]},contactAxes:{value:[new THREE.Vector2(0,1),new THREE.Vector2(0,1)]},contactStrength:{value:1}};
  for(const material of new Set(materials)){
    const compile=material.onBeforeCompile,cache=material.customProgramCacheKey.bind(material);
    material.onBeforeCompile=function(shader,...args){
      compile.call(this,shader,...args);Object.assign(shader.uniforms,uniforms);
      shader.vertexShader=`varying vec3 vContactWorld;\n${shader.vertexShader}`.replace('#include <project_vertex>',`#include <project_vertex>
        vec4 contactWorld=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          contactWorld=instanceMatrix*contactWorld;
        #endif
        vContactWorld=(modelMatrix*contactWorld).xyz;`);
      shader.fragmentShader=`varying vec3 vContactWorld;
        uniform vec4 contactFeet[2];uniform vec2 contactAxes[2];uniform float contactStrength;
        float footOcclusion(){
          float shade=0.;
          for(int i=0;i<2;i++){
            vec2 d=vContactWorld.xz-contactFeet[i].xz;
            vec2 axis=contactAxes[i],side=vec2(axis.y,-axis.x);
            float along=dot(d,axis)/.19,across=dot(d,side)/.095;
            float tight=exp(-2.*(along*along+across*across));
            float soft=exp(-.65*(along*along+across*across));
            float level=1.-smoothstep(.012,.08,abs(vContactWorld.y-contactFeet[i].y));
            shade+=(tight*.31+soft*.14)*level*contactFeet[i].w;
          }
          return min(.55,shade)*contactStrength;
        }
        ${shader.fragmentShader}`.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
          float contactUp=clamp(inverseTransformDirection(normal,viewMatrix).y,0.,1.);
          float contactShade=footOcclusion()*contactUp;
          reflectedLight.indirectDiffuse*=1.-contactShade;
          reflectedLight.directDiffuse*=1.-contactShade*.45;`);
    };
    material.customProgramCacheKey=()=>cache()+'|foot-contact-v1';material.needsUpdate=true;
  }
  let sample=[];
  return {
    update(avatar){
      sample=avatar.contactFeet().map((foot,i)=>{
        const ground=supportHeight(foot.center.x,foot.center.z),height=Math.max(0,foot.center.y-ground);
        const weight=1-THREE.MathUtils.smoothstep(height,.045,.24);
        uniforms.contactFeet.value[i].set(foot.center.x,ground,foot.center.z,weight);
        uniforms.contactAxes.value[i].copy(foot.axis);
        return {height:Number(height.toFixed(4)),weight:Number(weight.toFixed(3))};
      });
    },
    setEnabled(enabled){uniforms.contactStrength.value=Number(enabled);},
    get sample(){return sample;}
  };
}
