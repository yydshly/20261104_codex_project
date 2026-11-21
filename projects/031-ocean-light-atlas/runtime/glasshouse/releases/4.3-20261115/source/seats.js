import { ROCK_SEAT, seatNearby } from './rock-seat.js';

export const ROOM_FLOOR=1.55;
export const ROOM_RUG=Object.freeze({x:-5,z:3.1,width:4.55,depth:3.5,thickness:.004,top:ROOM_FLOOR+.003});

// Dimensions are shared by the visible armchair and its fitted body pose.
export const ROOM_SEAT=Object.freeze({
 id:'room-armchair',name:'扶手椅',indoor:true,node:'chair',stop:'roomSeat',x:-2.12,z:4.45,yaw:Math.PI,
 forward:{x:0,z:-1},ground:1.55,top:1.94,width:.88,depth:.70,
 approach:{x:-2.12,z:3.45},stand:{x:-2.12,z:3.93},pelvisBack:.50,
 relaxedLean:-.13,footSpread:.14,handSpread:.41,handForward:.22,armTop:2.29,
 back:{z:4.72,y:2.33,height:.78,depth:.14,tilt:.14},
 durations:{turn:1.45,align:1.55,lower:3.4,watch:9,rise:3.1,exit:1.55}
});
// A fitted place at the south end of the sofa: one forearm on the armrest,
// the other hand on the thigh, feet slightly staggered on the room floor.
export const SOFA_SEAT=Object.freeze({
 id:'room-sofa',name:'沙发',kind:'sofa',slot:'south',indoor:true,node:'sofaApproach',stop:'sofaSeat',
 x:-7.95,z:4.30,yaw:Math.PI/2,forward:{x:1,z:0},ground:1.55,top:1.96,
 width:1.16,depth:.60,approach:{x:-6.80,z:4.30},stand:{x:-7.38,z:4.30},pelvisBack:.55,pelvisClearance:.126,
 relaxedLean:-.18,footSpread:.145,footForward:[.035,-.025],
 hands:[{spread:.14,forward:.20,armTop:null,heightOffset:.085},{spread:.44,forward:.21,armTop:2.29,elbowSpread:.36}],
 back:{x:-8.215,y:2.34,height:.86,depth:.20,tilt:.18},
 bounds:{minX:-8.45,maxX:-7.58,minZ:.75,maxZ:4.95},
 interaction:{frontMin:.60,frontMax:1.70,lateral:.82,minZ:.95,maxZ:4.80},
 durations:{turn:1.5,align:1.7,lower:3.65,watch:9,rise:3.25,exit:1.7}
});
const sofaAt=(slot,z,hands)=>Object.freeze({...SOFA_SEAT,slot,z,node:slot==='north'?'sofaNorth':'sofaMiddle',approach:{x:SOFA_SEAT.approach.x,z},stand:{x:SOFA_SEAT.stand.x,z},hands});
export const SOFA_SEATS=[
 sofaAt('north',1.40,[{spread:.44,forward:.21,armTop:2.29,elbowSpread:.36},{spread:.14,forward:.20,armTop:null,heightOffset:.085}]),
 sofaAt('middle',2.90,[{spread:.14,forward:.20,armTop:null,heightOffset:.085},{spread:.14,forward:.20,armTop:null,heightOffset:.085}]),
 SOFA_SEAT
];
const distance=(p,s)=>Math.hypot(p.x-s.approach.x,p.z-s.approach.z);
export const nearestSofaSeat=position=>SOFA_SEATS.reduce((a,b)=>distance(position,a)<=distance(position,b)?a:b);
export const SEATS=[ROCK_SEAT,ROOM_SEAT,...SOFA_SEATS];
export function nearbySeat(position){return SEATS.filter(seat=>seatNearby(position,seat)).sort((a,b)=>distance(position,a)-distance(position,b))[0]||null;}
