import * as THREE from './vendor/three.module.js';
import {ROOM_SEAT_SURFACE as surface} from './reading-seat-surface.js';

/** Surface contact for the acquired cushion, using the player's actual skin. */
export function createSeatContact(model){
 const probes=[],point=new THREE.Vector3();
 const sin=Math.sin(surface.heading),cos=Math.cos(surface.heading);
 model.updateWorldMatrix(true,true);
 model.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;
  const indices=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight,cells=new Set();
  for(let i=0;i<weights.count;i++){
   let weight=0;for(let k=0;k<4;k++)if(/Pelvis|Thigh/.test(mesh.skeleton.bones[indices.getComponent(i,k)]?.name))weight+=weights.getComponent(i,k);
   if(weight<.65)continue;
   mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);
   const key=[point.x,point.y,point.z].map(x=>Math.round(x/.025)).join(',');
   if(cells.has(key))continue;cells.add(key);probes.push({mesh,index:i});
  }
 });
 function heightAt(x,z,field=surface.heights){
  const dx=x-surface.origin[0],dz=z-surface.origin[2];
  const u=((dx*cos-dz*sin)-surface.minX)/surface.step,v=((dx*sin+dz*cos)-surface.minZ)/surface.step;
  const i=Math.floor(u),j=Math.floor(v);if(i<0||j<0||i>=surface.nx-1||j>=surface.nz-1)return null;
  const h=[field[j*surface.nx+i],field[j*surface.nx+i+1],field[(j+1)*surface.nx+i],field[(j+1)*surface.nx+i+1]];
  if(h.some(x=>x===null)){const valid=h.filter(x=>x!==null);return valid.length>=2?Math.min(...valid):null;}
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h[0],h[1],u-i),THREE.MathUtils.lerp(h[2],h[3],u-i),v-j);
 }
 return{heightAt,measure(){
  let penetration=0,checked=0,minimumGap=Infinity;
  for(const p of probes){p.mesh.getVertexPosition(p.index,point).applyMatrix4(p.mesh.matrixWorld);if(point.y<.35||point.y>.95)continue;
   const height=heightAt(point.x,point.z);if(height===null)continue;
   const bottom=surface.bottoms?heightAt(point.x,point.z,surface.bottoms):null;if(bottom!==null&&point.y<bottom-.002)continue;
   const gap=point.y-height;minimumGap=Math.min(minimumGap,gap);penetration=Math.max(penetration,-gap);checked++;
  }
  return{penetration,minimumGap:Number.isFinite(minimumGap)?minimumGap:null,checked,totalProbes:probes.length};
 }};
}
