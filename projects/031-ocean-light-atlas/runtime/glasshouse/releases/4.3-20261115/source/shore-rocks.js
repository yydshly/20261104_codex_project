import * as THREE from 'three';
import { ROCKS } from './scene-layout.js';

export function createShoreRocks(){
 const group=new THREE.Group();group.name='Rounded shore rocks with shared collision layout';
 const size=256,pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const hash=Math.sin(x*127.1+y*311.7)*43758.5453,grain=hash-Math.floor(hash);
  const vein=Math.sin(x*.095+Math.sin(y*.067)*2)*Math.sin(y*.074+x*.019);
  const value=Math.round(229+vein*7+(grain-.5)*27-(grain<.045?24:0));const at=(y*size+x)*4;
  pixels[at]=value;pixels[at+1]=value;pixels[at+2]=value-2;pixels[at+3]=255;
 }
 const texture=new THREE.DataTexture(pixels,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,2);texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
 const bump=texture.clone();bump.colorSpace=THREE.NoColorSpace;bump.needsUpdate=true;
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,map:texture,bumpMap:bump,bumpScale:.004});
 for(const r of ROCKS){
  const geometry=new THREE.SphereGeometry(1,24,16),position=geometry.attributes.position,colors=[];
  const base=new THREE.Color('#9d9587'),dark=new THREE.Color('#696c64');
  for(let i=0;i<position.count;i++){
   const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
   const wear=1+.040*Math.sin(x*3.8+z*2.1+r.shape)*Math.sin(y*3.5+z*2.8)+.023*Math.sin(z*7.1-x*3.2+r.shape);
   const capWear=.005*Math.sin(x*8+r.shape)*Math.sin(z*9)*Math.min(1,Math.max(0,(Math.hypot(x,z)-.45)*3));
   position.setXYZ(i,x*r.rx*wear,r.seat?(y>.5?.25+capWear:-.23+(y+1)/1.5*.48):y*r.ry*wear,z*r.rz*wear);
   const grain=.5+.5*Math.sin(x*41+y*31+z*57+r.shape)*Math.sin(z*33-x*27);
   const weather=.5+.5*Math.sin(x*6.4+z*4.2+r.shape)*Math.cos(y*4.6-z*3.2);
   const color=base.clone().lerp(dark,Math.max(0,.32-weather*.15+(y<-.25?.18:0))).multiplyScalar(.92+grain*.12);
   colors.push(color.r,color.g,color.b);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingBox();
  const mesh=new THREE.Mesh(geometry,material);mesh.name=r.id;mesh.position.set(r.x,r.y,r.z);mesh.rotation.y=r.angle;
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.collision='shore-rock';group.add(mesh);
 }
 return group;
}
