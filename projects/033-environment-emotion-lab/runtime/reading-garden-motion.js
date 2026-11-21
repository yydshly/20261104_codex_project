/** Seeded, continuous weather and mass-conserving window drops. No short loop clock. */
export const MAX_GLASS_DROPS=48;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fract=x=>x-Math.floor(x);
function hash(x){return fract(Math.sin(x*127.1+311.7)*43758.5453123);}
export function weatherNoise(t,seed=0){const i=Math.floor(t),f=fract(t),u=f*f*f*(f*(f*6-15)+10);return hash(i+seed)*(1-u)+hash(i+seed+1)*u;}
export function gardenWeatherAt(time){
 const broad=weatherNoise(time*.045,17),passing=weatherNoise(time*.18,91);
 return{wind:.24+broad*.38+passing*.19,cloud:.955+weatherNoise(time*.021,53)*.045,
  directionX:.80+(weatherNoise(time*.031,11)-.5)*.30,directionZ:.34+(weatherNoise(time*.027,73)-.5)*.30};
}

export function instanceBreezeAt(time,x,z){const phase=x*.21+z*.37;return[weatherNoise(time*.14-x*.18,z*.16+4)*2-1,weatherNoise(time*.31+phase,phase+13)*2-1];}

export function gardenWindShader({foliage=false,shrub=false}={}){
 return `
 uniform float uGardenTime,uGardenGust;
 uniform vec2 uGardenDirection;
 attribute vec2 aGardenSway;
 float gardenHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float gardenNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(gardenHash(i),gardenHash(i+vec2(1.,0.)),f.x),mix(gardenHash(i+vec2(0.,1.)),gardenHash(i+1.),f.x),f.y);}
 `;
}
export function gardenWindDisplacement({foliage=false,shrub=false}={}){
 return `
 vec3 gardenOrigin=instanceMatrix[3].xyz;
 float gardenPhase=dot(gardenOrigin.xz,vec2(.21,.37));
 float gardenTip=pow(clamp(position.y*${shrub?'1.25':'.125'},0.,1.),1.7);
 float gardenPassing=aGardenSway.x;
 float gardenBranch=aGardenSway.y*(.7+clamp(position.y*.05,0.,.3));
 float gardenSway=(gardenPassing*.75+gardenBranch*.25)*gardenTip*uGardenGust*${shrub?'.045':'.14'};
 transformed.xz+=uGardenDirection*gardenSway;
 ${foliage?`float gardenLeaf=gardenNoise(vec2(uGardenTime*2.1+position.x*13.+gardenPhase,position.z*9.+position.y*3.))*2.-1.;
 transformed.x+=gardenLeaf*gardenTip*uGardenGust*${shrub?'.009':'.011'};
 transformed.z+=gardenLeaf*gardenTip*uGardenGust*.005;`:''}
 `;
}

export function createWindowDrops(seed=73421){
 let randomState=seed>>>0,lastTime=null,spawnWait=0;
 let merges=0,spawned=0,departed=0,mergedAreaError=0;
 const drops=[];
 function random(){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
 function spawn(initial=false){
  if(drops.length>=MAX_GLASS_DROPS)return;
  const r=.0019+random()*.0026+(initial&&random()>.86?.0026:0);
  drops.push({x:.025+random()*.95,y:initial?.03+random()*.94:.08+random()*.90,r,
   speed:0,age:0,pin:2+random()*22,seed:random()*91,trail:0});spawned++;
 }
 for(let i=0;i<36;i++)spawn(true);
 function merge(){
  for(let i=0;i<drops.length;i++)for(let j=drops.length-1;j>i;j--){
   const a=drops[i],b=drops[j],dx=a.x-b.x,dy=(a.y-b.y)*.72;
   if(dx*dx+dy*dy>(a.r+b.r)**2*.73)continue;
   const aa=a.r*a.r,bb=b.r*b.r,total=aa+bb;
   a.x=(a.x*aa+b.x*bb)/total;a.y=(a.y*aa+b.y*bb)/total;
   a.r=Math.sqrt(total);a.speed=Math.max(a.speed,b.speed);a.pin=Math.min(a.pin,b.pin);a.trail=Math.max(a.trail,b.trail);
   mergedAreaError=Math.max(mergedAreaError,Math.abs(a.r*a.r-total));drops.splice(j,1);merges++;
  }
 }
 return{
  step(time,raining=1){
   const dt=lastTime===null?0:clamp(time-lastTime,0,.08);lastTime=time;
   if(dt===0)return;
   const wet=clamp(raining,0,1);
   spawnWait-=dt*wet;
   if(spawnWait<=0&&wet>.05){spawn(false);spawnWait=.45-Math.log(Math.max(.001,random()))*.85;}
   for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;
    const sliding=d.r>.0052||d.age>d.pin&&d.r>.0035;
    const desired=sliding?clamp((d.r-.0025)*12,.008,.12):0;
    d.speed+=(desired-d.speed)*(1-Math.exp(-dt*2.2));
    d.y-=d.speed*dt;
    d.x+=(weatherNoise(time*.8,d.seed)-.5)*d.speed*dt*.08;
    d.trail+=(Math.min(.065,d.speed*.75)-d.trail)*(1-Math.exp(-dt*3));
    // A dry pane slowly loses pinned drops; moving drops leave at the sill.
    d.r=Math.max(0,d.r+dt*wet*(.000012+weatherNoise(time*.04,d.seed)*.000008)-dt*(1-wet)*.000025);
    if(d.y<-d.r*2||d.r<.0008){drops.splice(i,1);departed++;}
   }
   merge();
  },
  write(body,trail){
   for(let i=0;i<MAX_GLASS_DROPS;i++){
    const d=drops[i];if(!d){body[i].set(-2,-2,0,0);trail[i].set(0,0,0,0);continue;}
    body[i].set(d.x,d.y,d.r,d.r*(1.1+Math.min(1.1,d.speed*10)));
    trail[i].set(d.trail,d.speed,d.seed,clamp(d.r/.007,0,1));
   }
  },
  snapshot(){return{drops:drops.map(d=>({...d})),merges,spawned,departed,mergedAreaError};}
 };
}
