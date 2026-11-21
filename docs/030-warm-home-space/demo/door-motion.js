// Metres, shared by the animated leaf and navigation collision.
export const doorShape={hingeX:1.52,z:5.94,width:1.34,maxAngle:Math.PI*.515};
export function doorEndpoint(angle){return {x:doorShape.hingeX-doorShape.width*Math.cos(angle),z:doorShape.z-doorShape.width*Math.sin(angle)};}
export function doorBlocks(x,z,angle,radius=.19){
  const a={x:doorShape.hingeX,z:doorShape.z},b=doorEndpoint(angle),dx=b.x-a.x,dz=b.z-a.z;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<radius+.038;
}
export function inDoorSweep(x,z,radius=.19){
  const dx=doorShape.hingeX-x,dz=doorShape.z-z;
  return dx>=-radius-.025&&dz>=-radius-.025&&Math.hypot(dx,dz)<doorShape.width+radius+.06;
}
