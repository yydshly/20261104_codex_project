import * as THREE from 'three';

const V=()=>new THREE.Vector3(),margin=.16;
function visible(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
export function createCameraGuard({roots,moving=[]}){
 const dynamic=new Set(moving),entries=[];
 for(const root of roots)root.traverse(object=>{
  if(!object.isMesh)return;
  object.updateWorldMatrix(true,false);object.geometry.computeBoundingBox();
  entries.push({object,local:object.geometry.boundingBox.clone(),box:object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).expandByScalar(margin),moving:dynamic.has(object)||dynamic.has(object.parent)});
 });
 const ray=new THREE.Ray(),hit=V(),lastDirection=V();let sample={adjusted:false,blocker:null},adjustments=0,lastBlocker=null;
 function fraction(from,to){
  const distance=from.distanceTo(to);if(distance<.001)return {value:1,blocker:null};
  ray.set(from,to.clone().sub(from).multiplyScalar(1/distance));let value=1,blocker=null;
  for(const entry of entries){
   if(!visible(entry.object)||entry.box.containsPoint(from))continue;
   if(!ray.intersectBox(entry.box,hit))continue;
   const f=Math.max(0,(from.distanceTo(hit)-.025)/distance);
   if(f<value){value=f;blocker=entry.object.name||'pavilion geometry';}
  }
  return {value,blocker};
 }
 function viewFraction(anchor,low,to){
  const a=fraction(anchor,to),b=fraction(low,to);return a.value<b.value?a:b;
 }
 return {
  update(camera,controls,root){
   for(const e of entries)if(e.moving){e.object.updateWorldMatrix(true,false);e.box.copy(e.local).applyMatrix4(e.object.matrixWorld).expandByScalar(margin);}
   const anchor=root.clone().add(new THREE.Vector3(0,1.05,0)),low=root.clone().add(new THREE.Vector3(0,.48,0));
   const desired=camera.position.clone(),offset=desired.clone().sub(anchor),initial=viewFraction(anchor,low,desired);
   let result=desired,blocker=initial.blocker;
   if(initial.value<.998){
    adjustments++;lastBlocker=blocker;
    if(offset.length()*initial.value>=2.0){
     result=anchor.clone().lerp(desired,Math.max(0,initial.value-.012));camera.position.copy(result);camera.lookAt(controls.target);
     lastDirection.copy(camera.position).sub(anchor).normalize();
     sample={adjusted:true,blocker,adjustments,lastBlocker,distance:Number(camera.position.distanceTo(anchor).toFixed(3)),clear:viewFraction(anchor,low,camera.position).value>.99};return sample;
    }
    let best=Infinity;
    for(const elevation of [0,.55])for(const angle of [0,.35,-.35,.7,-.7,1.05,-1.05,1.4,-1.4,1.8,-1.8,2.3,-2.3,Math.PI]){
     const candidate=anchor.clone().add(offset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle));candidate.y+=elevation;
     const test=viewFraction(anchor,low,candidate),distance=candidate.distanceTo(anchor);
     const available=distance*test.value;if(available<1.3)continue;
     const alignment=lastDirection.lengthSq()?candidate.clone().sub(anchor).normalize().angleTo(lastDirection):0;
     const score=Math.abs(angle)+elevation*.8+(1-test.value)*12+alignment*.22;
     if(score<best){best=score;result=anchor.clone().lerp(candidate,Math.max(0,test.value-.012));}
    }
    if(!Number.isFinite(best))result=anchor.clone().lerp(desired,Math.max(.04,initial.value-.02));
    camera.position.copy(result);camera.lookAt(controls.target);
   }
   lastDirection.copy(camera.position).sub(anchor).normalize();
   sample={adjusted:initial.value<.998,blocker,adjustments,lastBlocker,distance:Number(camera.position.distanceTo(anchor).toFixed(3)),clear:viewFraction(anchor,low,camera.position).value>.99};
   return sample;
  },
  get sample(){return sample;}
 };
}
