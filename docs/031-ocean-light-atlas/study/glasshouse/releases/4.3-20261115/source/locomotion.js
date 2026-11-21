// Acceleration is bounded in metres / second squared, independent of frame rate.
export function createLocomotion(){
 let x=0,z=0;
 return {
  reset(){x=z=0;},
  get speed(){return Math.hypot(x,z);},
  step(wishX,wishZ,maximum,dt){
   if(dt<=0)return {x,z,speed:Math.hypot(x,z)};
   const length=Math.hypot(wishX,wishZ),targetX=length?wishX/length*maximum:0,targetZ=length?wishZ/length*maximum:0;
   const dx=targetX-x,dz=targetZ-z,distance=Math.hypot(dx,dz),change=(length?6.2:8.5)*dt;
   if(distance<=change){x=targetX;z=targetZ;}else{x+=dx/distance*change;z+=dz/distance*change;}
   return {x,z,speed:Math.hypot(x,z)};
  },
  blocked(actualX,actualZ,dt){if(dt>0){x=actualX/dt;z=actualZ/dt;}}
 };
}
