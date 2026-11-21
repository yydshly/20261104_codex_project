export const GROUND_Y=-8.85;
export const FLOOR_HEIGHT=2.95;
export const BUILDINGS=[
  {name:'west-court',x:-10,z:-37,w:16,d:9,floors:7,yaw:0,color:'#ded9ca',terrace:'center',style:0},
  {name:'east-court',x:12,z:-43,w:17,d:10,floors:6,yaw:0,color:'#d5d4c8',terrace:'edge',style:1},
  {name:'west-wing',x:-25,z:-20,w:23,d:9,floors:5,yaw:Math.PI/2,color:'#d4d1c3'},
  {name:'east-wing',x:25,z:-25,w:24,d:9,floors:7,yaw:-Math.PI/2,color:'#e1dacb',style:2},
  {name:'north-west',x:-17,z:-72,w:24,d:11,floors:7,yaw:0,color:'#cecec5'},
  {name:'north-east',x:17,z:-78,w:23,d:11,floors:8,yaw:0,color:'#d6d4c9',style:3},
  {name:'north-background',x:2,z:-106,w:25,d:12,floors:9,yaw:0,color:'#c8cbc8',style:1},
];
export const TREES=[
  {x:-5.5,z:-12,height:10.6,crown:8.6,angle:.4},
  {x:6.8,z:-16,height:11.4,crown:8.8,angle:2.0},
  {x:-11,z:-22,height:7.4,crown:6.2,angle:3.7},
  {x:10,z:-28,height:8.6,crown:7.0,angle:1.4},
  {x:-15.7,z:-27.3,height:7.7,crown:6.2,angle:4.5},
  {x:15,z:-32,height:8.2,crown:6.6,angle:2.6},
  {x:-3.4,z:-25,height:6.7,crown:5.8,angle:.8},
  {x:3,z:-34,height:7.8,crown:6.0,angle:4.1},
  {x:-6,z:-49,height:8.5,crown:7.0,angle:1.8},
  {x:8,z:-56,height:8.0,crown:6.6,angle:3.1},
];

export function footprint(building){
  const turned=Math.abs(Math.sin(building.yaw))>.5;
  const width=turned?building.d:building.w,depth=turned?building.w:building.d;
  return {minX:building.x-width/2,maxX:building.x+width/2,minZ:building.z-depth/2,maxZ:building.z+depth/2};
}

const stacks=[['balcony','paired','loggia','picture'],['picture','balcony','paired','loggia'],['paired','balcony','vertical','balcony'],['loggia','picture','balcony','paired']];
export function bayType(style,column){return stacks[style%stacks.length][column%4];}
export function floorProfile(building,floor){
  const columns=Math.max(2,Math.round(building.w/3.8)),bay=building.w/columns;
  if(building.terrace&&floor===building.floors-1){
    const centered=building.terrace==='center',removed=centered?2:1;
    return {w:building.w-removed*bay,d:building.d-(centered?1.5:1.1),x:centered?0:bay/2,z:centered?-.75:-.55,columns:columns-removed,terrace:true};
  }
  return {w:building.w,d:building.d,x:0,z:0,columns,terrace:false};
}
