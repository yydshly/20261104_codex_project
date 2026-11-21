// Interpolate around the focus, never straight through the actor. The angular
// speed limit also prevents abrupt flips at a route corner or a seat change.
export function orbitOffset(current,target,dt,{rate=1.8,maxTurn=.72}={}){
 const radius=v=>Math.max(.5,Math.hypot(v.x,v.y,v.z));
 const a=radius(current),b=radius(target),yaw=Math.atan2(current.x,current.z),toYaw=Math.atan2(target.x,target.z);
 const difference=Math.atan2(Math.sin(toYaw-yaw),Math.cos(toYaw-yaw));
 const alpha=1-Math.exp(-dt*rate),turn=Math.max(-maxTurn*dt,Math.min(maxTurn*dt,difference*alpha));
 const pitch=Math.asin(Math.max(-.95,Math.min(.95,current.y/a))),toPitch=Math.asin(Math.max(-.95,Math.min(.95,target.y/b)));
 const angle=pitch+(toPitch-pitch)*alpha,r=a+(b-a)*alpha;
 return {x:Math.sin(yaw+turn)*Math.cos(angle)*r,y:Math.sin(angle)*r,z:Math.cos(yaw+turn)*Math.cos(angle)*r};
}
