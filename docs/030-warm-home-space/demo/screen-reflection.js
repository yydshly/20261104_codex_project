import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

export function buildScreenReflection(parent){
  const shader={name:'AntiReflectiveTVGlass',uniforms:{color:{value:new THREE.Color('#c2c7cb')},tDiffuse:{value:null},textureMatrix:{value:new THREE.Matrix4()},pixel:{value:new THREE.Vector2(1/768,1/512)}},
    vertexShader:`uniform mat4 textureMatrix;
      varying vec4 reflectionUv; varying vec3 worldNormal; varying vec3 worldPosition;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){
        reflectionUv=textureMatrix*vec4(position,1.0);
        worldPosition=(modelMatrix*vec4(position,1.0)).xyz;
        worldNormal=normalize(mat3(modelMatrix)*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform vec3 color;uniform vec2 pixel;
      varying vec4 reflectionUv;varying vec3 worldNormal;varying vec3 worldPosition;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      void main(){
        #include <logdepthbuf_fragment>
        vec2 uv=reflectionUv.xy/reflectionUv.w;
        vec3 reflected=texture2D(tDiffuse,uv).rgb*.40;
        reflected+=texture2D(tDiffuse,uv+vec2(pixel.x,0.)).rgb*.15;
        reflected+=texture2D(tDiffuse,uv-vec2(pixel.x,0.)).rgb*.15;
        reflected+=texture2D(tDiffuse,uv+vec2(0.,pixel.y)).rgb*.15;
        reflected+=texture2D(tDiffuse,uv-vec2(0.,pixel.y)).rgb*.15;
        float angle=clamp(dot(normalize(cameraPosition-worldPosition),normalize(worldNormal)),0.,1.);
        float fresnel=.055+.945*pow(1.-angle,5.);
        gl_FragColor=vec4(vec3(.0015,.0018,.0021)+reflected*color*min(.70,fresnel*1.6),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`};
  const mirror=new Reflector(new THREE.PlaneGeometry(1.727,.971),{textureWidth:768,textureHeight:512,multisample:2,clipBias:.001,color:'#c2c7cb',shader});
  mirror.name='live-tv-reflection';mirror.position.set(0,.008,.026);mirror.castShadow=false;mirror.receiveShadow=false;parent.add(mirror);
  const update=mirror.onBeforeRender;
  mirror.onBeforeRender=function(renderer,scene,camera,...rest){
    // SSAO's normal/depth passes must never overwrite the reflected colour.
    if(scene.overrideMaterial)return;
    const exterior=scene.userData.exteriorScene,render=renderer.render;
    // Reflect the same exterior/interior pair into the television's target.
    // The shared depth buffer keeps courtyard geometry behind the room walls.
    if(exterior)renderer.render=function(target,reflectionCamera){
      if(target!==scene)return render.call(this,target,reflectionCamera);
      const autoClear=this.autoClear;this.autoClear=false;
      try{render.call(this,exterior,reflectionCamera);render.call(this,scene,reflectionCamera);}
      finally{this.autoClear=autoClear;}
    };
    try{update.call(this,renderer,scene,camera,...rest);}
    finally{renderer.render=render;}
    const canvas=document.querySelector('#scene');if(canvas.dataset.reflection!=='live-planar')canvas.dataset.reflection='live-planar';
  };
  return mirror;
}
