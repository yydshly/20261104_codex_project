import * as THREE from 'three';
import {GROUND_Y,FLOOR_HEIGHT,bayType,floorProfile} from './courtyard-layout.js';

export function buildResidentialBuildings({world,buildings,block,material,stuccoFinish,windows,registerMaterial}){
  const planters=[],cloths=[],signs=[],stats={openWindows:0,balconies:0,terraces:0,planters:0,seating:0,clothes:0,entries:0};
  const at=(m,x,y,z,angle=0)=>m.clone().multiply(new THREE.Matrix4().makeTranslation(x,y,z)).multiply(new THREE.Matrix4().makeRotationY(angle));
  const random=(a,b,c)=>{const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return v-Math.floor(v);};
  material('cladding','#a68f74',{roughness:.87});material('podium','#bcb6a6',{roughness:.95});material('reveal','#bdb8ac',{roughness:.96});material('planter','#93816a',{roughness:.87});material('equipment','#b6b8ad',{metalness:.25,roughness:.65});
  for(const key of ['cladding','podium','reveal','planter'])stuccoFinish(material(key));
  for(let i=0;i<12;i++){
    material('frame'+i,i%3===0?'#635d51':'#424b49',{metalness:.48,roughness:.39});
    // Material registry is shared with the instanced box batches.
    registerMaterial('window'+i,windows.material(i));
    registerMaterial('window-room'+i,windows.material(i,{profile:2}));
  }
  registerMaterial('window-pane',windows.material(0,{profile:1}));
  registerMaterial('window-lobby',windows.material(10,{profile:3}));

  function planter(m,x,y,z,width=.65){
    block('planter',width,.26,.32,x,y+.13,z,m);block('soil',width-.065,.025,.255,x,y+.253,z,m);
    for(const dx of [-1,1])block('planter',.025,.04,.34,x+dx*(width/2-.01),y+.26,z,m);
    for(const dz of [-1,1])block('planter',width,.04,.025,x,y+.26,z+dz*.15,m);
    planters.push({matrix:at(m,x,y+.25,z),height:.40,width:width*.94});stats.planters++;
  }
  function seating(m,x,y,z){
    for(const dx of [-.16,.16])for(const dz of [-.16,.16])block('rail',.022,.42,.022,x+dx,y+.21,z+dz,m);
    block('wood',.38,.035,.38,x,y+.43,z,m);block('wood',.38,.29,.032,x,y+.62,z-.16,m);
    const tableX=x+.83;
    block('wood',.44,.035,.40,tableX,y+.64,z,m);for(const dx of [-.16,.16])for(const dz of [-.14,.14])block('rail',.022,.63,.022,tableX+dx,y+.315,z+dz,m);
    stats.seating++;
  }
  function drying(m,x,y,z,seed){
    for(const dx of [-.72,.72])block('rail',.022,1.55,.022,x+dx,y+.775,z,m);
    block('rail',1.48,.025,.025,x,y+1.55,z,m);
    cloths.push({matrix:at(m,x-.32,y+1.53,z),type:seed>.5?0:1},{matrix:at(m,x+.32,y+1.53,z+.015),type:2});stats.clothes+=2;
  }
  function railing(m,width,y,front,depth=1.2){
    block('rail',width,.045,.045,0,y+1.08,front+depth,m);block('rail',width,.025,.028,0,y+.13,front+depth,m);
    const count=Math.max(10,Math.round(width/.18));for(let i=0;i<=count;i++)block('rail',.022,.95,.022,-width/2+i*width/count,y+.60,front+depth,m);
    for(const side of [-1,1]){block('rail',.032,.045,depth,side*width/2,y+1.08,front+depth/2,m);block('rail',.028,1.0,.028,side*width/2,y+.58,front+.025,m);}
  }
  function windowFrame(m,center,base,front,width,low,high,frameKey){
    for(const x of [center-width/2,center+width/2])block(frameKey,.050,high-low,.075,x,base+(high+low)/2,front-.265,m);
    for(const y of [base+low,base+high])block(frameKey,width,.05,.075,center,y,front-.265,m);
  }
  function entry(m,x,front,label){
    const y=GROUND_Y;
    block('podium',2.75,.16,1.3,x,y+.04,front+.42,m);block('podium',2.65,.17,1.2,x,y+2.62,front+.45,m);
    for(const dx of [-1.20,1.20])block('cladding',.16,2.50,.22,x+dx,y+1.25,front+.26,m);
    block('frame',.055,2.25,.055,x,y+1.15,front-.25,m);
    const c=document.createElement('canvas');c.width=256;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#6e6656';ctx.fillRect(0,0,256,96);ctx.fillStyle='#e8e1cc';ctx.font='500 52px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(label).padStart(2,'0'),128,49);
    const map=new THREE.CanvasTexture(c),mat=new THREE.MeshStandardMaterial({map,emissiveMap:map,emissive:'#fff0cf',emissiveIntensity:.06,roughness:.72});signs.push(mat);
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(.52,.20),mat);plate.applyMatrix4(at(m,x+1.02,y+1.8,front+.021));world.add(plate);stats.entries++;
  }

  function facade(w,front,key,m,{floor=0,style=0,home=false,columns=Math.max(2,Math.round(w/3.8)),label=1,terrace=false}={}){
    const bay=w/columns,base=GROUND_Y+floor*FLOOR_HEIGHT;
    for(let col=0;col<columns;col++){
      const center=-w/2+(col+.5)*bay;
      if(home&&floor===3&&Math.abs(center)-bay/2<2.81)continue;
      const type=bayType(style,col),isEntry=!home&&floor===0&&col===Math.floor(columns/2);
      const balcony=!terrace&&!isEntry&&(type==='balcony'||type==='loggia');
      const wide=type==='picture',slender=type==='vertical';
      const opening=isEntry?1.8:balcony?Math.min(2.45,bay-.55):slender?1.12:wide?Math.min(2.5,bay-.65):Math.min(2.08,bay-.65);
      const low=isEntry?.05:balcony||terrace?.15:slender?.48:.79,high=isEntry?2.42:2.43;
      const jamb=(bay-opening)/2,accent=col%4===2?'cladding':floor===0?'podium':key;
      for(const side of [-1,1])block(accent,jamb,high-low,.48,center+side*(opening/2+jamb/2),base+(high+low)/2,front-.24,m);
      block(accent,bay,low,.48,center,base+low/2,front-.24,m);block(accent,bay,FLOOR_HEIGHT-high,.48,center,base+(high+FLOOR_HEIGHT)/2,front-.24,m);
      const seed=random(floor+style*7,col+label,19),windowStyle=Math.floor(random(col,floor,label)*12),frameKey='frame'+windowStyle;
      const open=!isEntry&&!balcony&&!terrace&&!slender&&seed>.78;
      block(isEntry?'window-lobby':open?'window-room'+windowStyle:'window'+windowStyle,opening,high-low,.025,center,base+(high+low)/2,front-.30,m);
      windowFrame(m,center,base,front,opening,low,high,frameKey);
      if(open){
        const leafWidth=opening/2,height=high-low;
        block('window-pane',leafWidth-.04,height-.05,.012,center-leafWidth/2,base+(high+low)/2,front-.274,m);
        const hinge=at(m,center+opening/2,base+(high+low)/2,front-.27,.46);
        block('window-pane',leafWidth-.04,height-.05,.012,-leafWidth/2,0,0,hinge);
        for(const xx of [-leafWidth,0])block(frameKey,.036,height,.04,xx,0,0,hinge);
        for(const yy of [-height/2,height/2])block(frameKey,leafWidth,.035,.04,-leafWidth/2,yy,0,hinge);
        stats.openWindows++;
      }else if(!slender){
        const divisions=wide?3:2;for(let split=1;split<divisions;split++)block(frameKey,.04,high-low,.065,center-opening/2+opening*split/divisions,base+(high+low)/2,front-.265,m);
      }
      block('sill',opening+.10,.065,.38,center,base+low-.03,front-.22,m);
      block('slab',bay-.015,.09,.12,center,base-.025,front-.015,m);
      if(type==='loggia'){
        for(const side of [-1,1])block('reveal',.14,2.65,.65,center+side*(opening/2+.10),base+1.325,front+.12,m);
        block('reveal',opening+.35,.12,.75,center,base+2.68,front+.12,m);
      }
      if(balcony){
        const bw=Math.min(bay-.24,2.88),balconyTransform=at(m,center,0,0),life=Math.floor(seed*7);
        block('slab',bw,.14,1.32,center,base-.025,front+.60,m);railing(balconyTransform,bw,base,front);stats.balconies++;
        if(life===0||life===1||life===4)planter(m,center+.67,base+.05,front+.94,life===4?.90:.65);
        if(life===1||life===2)seating(m,center-.65,base+.05,front+.58);
        if(life===3)drying(m,center,base+.05,front+.54,seed);
        if(life===5){block('equipment',.62,.40,.27,center+.55,base+.28,front+.11,m);for(let j=0;j<5;j++)block('frame',.53,.015,.018,center+.55,base+.12+j*.065,front+.255,m);}
      }
      if(isEntry)entry(m,center,front,label);
    }
  }

  buildings.forEach((b,index)=>{
    const group=new THREE.Matrix4().makeRotationY(b.yaw);group.setPosition(b.x,0,b.z);const key='stucco-'+b.name;stuccoFinish(material(key,b.color));
    let top;
    for(let floor=0;floor<b.floors;floor++){
      const p=floorProfile(b,floor),m=at(group,p.x,0,p.z),base=GROUND_Y+floor*FLOOR_HEIGHT;top={p,m};
      block(key,p.w-1.20,FLOOR_HEIGHT,p.d-1.20,0,base+FLOOR_HEIGHT/2,0,m);
      block(key,p.w,FLOOR_HEIGHT,.25,0,base+FLOOR_HEIGHT/2,-p.d/2+.125,m);
      facade(p.w,p.d/2,key,m,{floor,style:b.style??index,label:index+1,columns:p.columns,terrace:p.terrace});
      for(const side of [-1,1])facade(p.d,0,key,at(m,side*p.w/2,0,0,side*Math.PI/2),{floor,style:(b.style??index)+1,label:index+1});
      if(p.terrace){
        block('slab',b.w+.14,.16,b.d+.14,0,base-.04,0,group);
        railing(group,b.w-.18,base,b.d/2-1.2);stats.terraces++;
        for(const side of [-1,1]){
          const edge=at(group,side*(b.w/2-.09),0,0,side*Math.PI/2);
          railing(edge,b.d-.18,base,-1.2);
        }
        for(const x of [-b.w/2+1,b.w/2-1])planter(group,x,base+.05,b.d/2-.45,.90);
        seating(group,-b.w/2+1.5,base+.05,0);
      }
    }
    const {p,m}=top,roof=GROUND_Y+b.floors*FLOOR_HEIGHT;
    block('slab',p.w+.16,.16,p.d+.16,0,roof-.02,0,m);
    for(const sign of [-1,1]){block(key,p.w,.62,.16,0,roof+.24,sign*(p.d/2-.03),m);block(key,.16,.62,p.d,sign*(p.w/2-.03),roof+.24,0,m);}
    if(index%2===0){block('reveal',2.7,1.7,2.4,-p.w*.18,roof+.85,-1,m);block('slab',2.9,.12,2.6,-p.w*.18,roof+1.7,-1,m);}
    else for(let i=0;i<3;i++)block('equipment',.9,.4,1.1,-1.3+i*1.3,roof+.25,-1.6,m);
  });

  stuccoFinish(material('home','#d8d1c1'));
  const home=new THREE.Matrix4().makeRotationY(Math.PI);home.setPosition(0,0,-3.65);
  for(let floor=0;floor<6;floor++)facade(28,0,'home',home,{floor,style:2,home:true,label:0});
  block('home',28,8.70,.20,0,-4.50,-2.95);block('home',28,5.9,.20,0,5.90,-2.95);
  for(const side of [-1,1]){
    block('home',11.18,2.95,.20,side*8.41,1.475,-2.95);
    block('home',3.18,2.95,.20,side*4.41,1.475,-3.55);
  }
  return {planters,cloths,stats,setEvening(night){signs.forEach(m=>m.emissiveIntensity=night?.75:.06);}};
}
