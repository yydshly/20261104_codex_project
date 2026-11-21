export const BEDS=[
  {x:-6.5,z:-12.8,rx:3.1,rz:2.4},
  {x:8,z:-17.8,rx:2.8,rz:2.3},
  {x:-11,z:-25,rx:3.2,rz:1.8},
  {x:11,z:-29.2,rx:3.1,rz:2.6},
];
export const BOLLARDS=[{x:2.6,z:-9.8},{x:-.9,z:-16},{x:3,z:-25.2},{x:-2.6,z:-30.5}];

export function plantingLayout(){
  let seed=7129;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const shrubs=[],grasses=[],flowers=[];
  BEDS.forEach((bed,index)=>{
    for(let i=0;i<6;i++){
      const angle=i/6*Math.PI*2+.24*index,r=.45+.1*random();
      shrubs.push({x:bed.x+Math.cos(angle)*bed.rx*r,z:bed.z+Math.sin(angle)*bed.rz*r,height:.8+random()*.45,crown:1.15+random()*.5,angle:random()*Math.PI*2});
    }
    for(let i=0;i<9;i++){
      const angle=i/9*Math.PI*2+.20,r=.70+.1*random(),item={x:bed.x+Math.cos(angle)*bed.rx*r,z:bed.z+Math.sin(angle)*bed.rz*r,height:.35+random()*.30,angle:random()*Math.PI*2};
      grasses.push(item);
      if(i%2===0)flowers.push({...item,x:item.x+.14,height:.35+random()*.22,type:index%2});
    }
  });
  return {shrubs,grasses,flowers};
}
