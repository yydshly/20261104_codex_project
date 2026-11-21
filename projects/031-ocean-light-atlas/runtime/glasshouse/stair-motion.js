// A stance leg must remain reachable while the body moves up the stair profile.
// This is shared by the real controller and geometric regression checks.
export function limitStairTravel(from,to,legs,height,{lowering=.24,margin=.085}={}){
 const dx=to.x-from.x,dz=to.z-from.z,travel=Math.hypot(dx,dz);
 if(travel<1e-8||!legs.length)return 1;
 const point=d=>({x:from.x+dx/travel*d,z:from.z+dz/travel*d});
 const reachable=p=>legs.every(leg=>Math.hypot(p.x+leg.hip.x-leg.target.x,height(p.x,p.z)+leg.hip.y-lowering-leg.target.y,p.z+leg.hip.z-leg.target.z)<=leg.length*.97);
 if(!reachable(from))return 0;
 const distance=Math.max(travel,margin),ahead=point(distance);
 if(reachable(ahead))return 1;
 let a=0,b=distance;for(let i=0;i<16;i++){const m=(a+b)/2;if(reachable(point(m)))a=m;else b=m;}
 return Math.min(1,a/travel,a/margin);
}

export function stairSwing(t,ascending){
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const apex=ascending?.35:.29;
 return {horizontal:ease((t-.12)/.84),up:ease(t/apex),down:ease((t-apex)/(1-apex)),apex};
}
