/** Sparse vocalizations use active scene time. No timers or background catch-up. */
export function createDuckCallSchedule({random=Math.random}={}){
 let enabled=false,active=false,remaining=Infinity,calls=0;
 const interval=(min,max)=>min+Math.max(0,Math.min(1,Number(random())||0))*(max-min);
 const first=()=>interval(6,12),next=()=>interval(18,42);
 return{
  setEnabled(value){value=Boolean(value);if(value===enabled)return;enabled=value;active=false;remaining=enabled?first():Infinity;},
  noteManualCall(){if(enabled)remaining=next();},
  update(delta,{allowed=false,busy=false}={}){
   if(!enabled)return false;
   if(!allowed){if(active)remaining=first();active=false;return false;}
   active=true;if(busy){remaining=Math.max(remaining,4);return false;}
   remaining-=Math.max(0,Math.min(.1,Number(delta)||0));
   if(remaining>0)return false;remaining=next();calls++;return true;
  },
  getState:()=>({enabled,secondsUntilCall:enabled?remaining:null,automaticCalls:calls}),
 };
}
