import * as THREE from 'three';

// Fold only the navy rear coat hem for the fitted sitting pose. Classification
// uses the existing albedo + body region; grey trousers and skin are excluded.
// Runtime corrective and cloth weights; the user's GLB stays untouched.
export function createSeatCoat({meshes,bone}){
 const controls=[];let vertices=0;
 for(const mesh of meshes){
  const map=mesh.material.map,uv=mesh.geometry.attributes.uv;if(!map?.image||!uv)continue;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(map.image,0,0,512,512);const pixels=ctx.getImageData(0,0,512,512).data;
  const geometry=mesh.geometry,position=geometry.attributes.position,weights=geometry.attributes.skinWeight,indices=geometry.attributes.skinIndex,pelvis=mesh.skeleton.bones.indexOf(bone('Pelvis'));
  if(pelvis<0)continue;
  const delta=new Float32Array(position.count*3);let changed=0,weightChanges=0;
  // The original body geometry is in the same metric Y-up coordinates as the
  // GLB scene. Transform a world-up displacement into mesh-local coordinates.
  const localUp=new THREE.Vector3(0,1,0).transformDirection(mesh.matrixWorld.clone().invert());
  for(let i=0;i<position.count;i++){
   const p=mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
   if(p.y<.68||p.y>.91||Math.abs(p.x)>.24||p.z>-.015||p.z<-.23)continue;
   const x=Math.max(0,Math.min(511,Math.floor(uv.getX(i)*512))),y=Math.max(0,Math.min(511,Math.floor(uv.getY(i)*512))),at=(y*512+x)*4;
   const [r,g,b]=pixels.subarray(at,at+3);
   if(!(b>r*1.18&&b>g*1.06&&b<160))continue;
   const rear=THREE.MathUtils.smoothstep(-p.z,.015,.06),blend=rear*(1-THREE.MathUtils.smoothstep(p.y,.80,.90));
   const lift=Math.max(0,.795-p.y)*rear;
   if(blend>.001){
    const values=new Map();for(let j=0;j<4;j++){const index=indices.getComponent(i,j);values.set(index,(values.get(index)||0)+weights.getComponent(i,j)*(1-blend));}values.set(pelvis,(values.get(pelvis)||0)+blend);
    const top=[...values].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((a,p)=>a+p[1],0);
    for(let j=0;j<4;j++){indices.setComponent(i,j,top[j]?.[0]||0);weights.setComponent(i,j,(top[j]?.[1]||0)/sum);}
    weightChanges++;
   }
   delta.set(localUp.clone().multiplyScalar(lift).toArray(),i*3);if(lift>.0001)changed++;
  }
  if(weightChanges)weights.needsUpdate=indices.needsUpdate=true;
  if(!changed)continue;
  geometry.morphAttributes.position??=[];
  if(!geometry.morphTargetsRelative)for(let i=0;i<position.count;i++)for(let j=0;j<3;j++)delta[i*3+j]+=position.getComponent(i,j);
  const target=new THREE.BufferAttribute(delta,3);target.name='runtimeSeatCoat';const index=geometry.morphAttributes.position.length;geometry.morphAttributes.position.push(target);
  if(geometry.morphAttributes.normal)geometry.morphAttributes.normal.push(new THREE.BufferAttribute(new Float32Array(position.count*3),3));
  mesh.morphTargetDictionary??={};mesh.morphTargetDictionary.runtimeSeatCoat=index;mesh.morphTargetInfluences??=[];mesh.morphTargetInfluences[index]=0;
  mesh.material.needsUpdate=true;controls.push({mesh,index});vertices+=changed;
 }
 return {vertices,set(amount){for(const {mesh,index} of controls)mesh.morphTargetInfluences[index]=amount;}};
}
