import { FARM,FACTORY,HEX,DIRECTIONS,reachableHexes,attackPreview,battleUnits,spireIntent,factoryPower,DUNGEON_SKILLS,dungeonSkillAllowed,dungeonIntent } from './play-engine.js';

export const PLAY_ASSETS={characters:'./assets/characters-v2.png',environments:'./assets/environments-v2.png',machines:'./assets/machines-v2.png',farm:'./assets/farm-v2.png'};
const TAU=Math.PI*2;
const renderKey=(x,y)=>`${x},${y}`;
const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
export class PlayRenderer {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=1000;this.height=480;this.time=0;this.images={};this.hits=[];this.positions={};this.fx=[];this.transform={x:0,y:0,scale:1};this.reduced=false;
    this.ready=Promise.all(Object.entries(PLAY_ASSETS).map(([key,url])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[key]=img;resolve();};img.onerror=()=>resolve();img.src=url;})));
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
  }
  resize(){const rect=this.canvas.getBoundingClientRect();this.width=rect.width||1000;this.height=rect.height||480;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.dpr=dpr;}
  dispose(){this.resizeObserver.disconnect();}
  text(text,x,y,size=14,color='#f5efe0',align='center',serif=false){const c=this.ctx;c.font=`${size}px ${serif?'Georgia, SimSun':'Microsoft YaHei, sans-serif'}`;c.textAlign=align;c.textBaseline='middle';c.lineWidth=Math.max(.8,size/10);c.strokeStyle='#12141999';if(!['#59442a','#745232'].includes(color))c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
  rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(x,y,w,h);}
  line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  circle(x,y,r,color){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill();}
  round(x,y,w,h,r,fill,stroke){const c=this.ctx;c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
  background(row){const img=this.images.environments;if(img){const sh=img.height/3;this.ctx.drawImage(img,0,sh*row,img.width,sh,0,0,this.width,this.height);}else this.rect(0,0,this.width,this.height,['#354b4a','#151c23','#647044'][row]);}
  sprite(col,row,x,y,w,h,{flip=false,dead=false,hit=false,alpha=1}={}){
    const c=this.ctx,img=this.images.characters;c.save();c.globalAlpha=alpha;if(dead)c.filter='grayscale(1) brightness(.45)';if(hit)c.filter='brightness(2)';
    c.translate(x,y);if(flip)c.scale(-1,1);
    if(img)c.drawImage(img,col*img.width/4,row*img.height/3,img.width/4,img.height/3,-w/2,-h,w,h);
    else {c.fillStyle='#bcc1a0';c.fillRect(-w/5,-h*.7,w*.4,h*.7);}
    c.restore();
  }
  worldPoint(x,y){return {x:this.transform.x+x*this.transform.scale,y:this.transform.y+y*this.transform.scale};}
  toWorld(x,y){return {x:(x-this.transform.x)/this.transform.scale,y:(y-this.transform.y)/this.transform.scale};}
  targetAt(x,y){return [...this.hits].reverse().find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);}
  consume(events){
    for(const e of events||[]){const p=this.positions[e.target]||this.positions[e.source]||(e.x!==undefined?this.worldPoint((e.x+.5)*(this.kind==='factory'?FACTORY.tile:FARM.tile),(e.y+.5)*(this.kind==='factory'?FACTORY.tile:FARM.tile)):{x:this.width/2,y:this.height/2});this.fx.push({...e,x:p.x,y:p.y-50,start:this.time,duration:e.type==='daybreak'?1.1:1});}
    this.fx=this.fx.slice(-25);
  }
  actorOffset(id){if(this.reduced)return {x:0,y:0,hit:false};let x=0,y=0,hit=false;for(const f of this.fx){const age=this.time-f.start;if(age>.42)continue;if(f.source===id&&['playerAttack','enemyAttack'].includes(f.type)){const target=this.positions[f.target];x+=(target&&target.x<(this.positions[id]?.x||0)?-1:1)*Math.sin(age/.42*Math.PI)*65;}if(f.target===id&&['playerAttack','enemyAttack','dot'].includes(f.type)){hit=age<.14;x+=Math.sin(age*65)*8*(1-age/.42);}}return {x,y,hit};}
  draw(id,s,ui,dt){this.time+=Math.min(dt,.1);this.kind=id;this.hits=[];this.positions={};const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);if(id==='valley')this.farm(s,ui);if(id==='factory')this.factory(s,ui);if(id==='spire')this.spire(s,ui);if(id==='dungeon')this.dungeon(s,ui);if(id==='brothers')this.brothers(s,ui);this.effects();}
  effects(){const c=this.ctx;this.fx=this.fx.filter(f=>this.time-f.start<f.duration);for(const f of this.fx){const age=this.time-f.start,p=age/f.duration;if(this.kind==='dungeon')this.dungeonSpellFx(f,age);if(f.type==='daybreak'){this.rect(0,0,this.width,this.height,`rgba(245,225,173,${Math.sin(p*Math.PI)*.65})`);continue;}const value=f.amount!==undefined?`${f.type==='heal'||f.type==='stress'?'+':'−'}${f.amount}`:f.type==='miss'?'闪避':f.type==='affliction'?'精神折磨':f.type==='virtue'?'英勇':f.type==='door'?'濒死之门':f.type==='stunned'?'眩晕':null;c.save();c.globalAlpha=1-p;if(value)this.text(value,f.x,f.y-age*45,f.crit?27:21,f.type==='heal'?'#b4ee91':f.type==='stress'?'#e5b4ed':f.type==='miss'?'#e4debf':'#ffd9b9','center',true);if(!this.reduced&&['playerAttack','enemyAttack','chop','hoe','water','harvest','build'].includes(f.type)){for(let i=0;i<9;i++){const angle=i*2.4,dist=p*42;this.circle(f.x+Math.cos(angle)*dist,f.y+45+Math.sin(angle)*dist,3*(1-p),f.type==='water'?'#b8e6f4':f.type==='harvest'?'#eed780':'#e0b486');}if(['playerAttack','enemyAttack'].includes(f.type)&&!['plague','blast','pistol','light'].includes(f.skill))this.line(f.x-34+p*35,f.y+60-p*40,f.x+35-p*15,f.y+10+p*10,'#fff2df',3*(1-p));}c.restore();}}

  farm(s,ui){
    const c=this.ctx,t=FARM.tile,scale=1.25,worldW=FARM.width*t,worldH=FARM.height*t;
    const ox=Math.max(this.width-worldW*scale,Math.min(0,this.width/2-s.player.x*t*scale)),oy=Math.max(this.height-worldH*scale,Math.min(0,this.height/2-(s.player.y-2.5)*t*scale));this.transform={x:ox,y:oy,scale};
    c.save();c.translate(ox,oy);c.scale(scale,scale);c.imageSmoothingEnabled=false;
    for(let y=0;y<FARM.height;y++)for(let x=0;x<FARM.width;x++){
      const px=x*t,py=y*t,n=noise(x,y);this.rect(px,py,t,t,n>.5?'#75a843':'#72a343');
      for(let i=0;i<9;i++){this.rect(px+Math.floor(noise(x+i,y+1)*29),py+Math.floor(noise(x,y+i+2)*29),1+(i%2),2,['#62983b','#8ab84d','#94bd54'][i%3]);}if(n>.94){this.rect(px+10,py+16,2,2,'#f0dca2');this.rect(px+18,py+9,2,2,'#d8c8e2');}
      if((y===7&&x>=6&&x<=20)||(x===7&&y>=7&&y<=10)||(y>=8&&y<=17&&x>=6&&x<=18)){this.rect(px,py,t,t,n>.5?'#c8a466':'#c5a062');for(let j=0;j<6;j++)this.rect(px+Math.floor(noise(x+j,y+3)*30),py+Math.floor(noise(y+j,x+9)*30),j%2+1,1,['#a88953','#ddbc7c','#b7955b'][j%3]);if(x===6||x===18||y===17){for(let j=0;j<6;j++){const gx=x===6?px+j%3*2:x===18?px+26+j%3*2:px+j*5,gy=y===17?py+26+j%2*3:py+j*5;this.rect(gx,gy,2,4,'#7ba347');}}}
      if(x>=25&&x<=34&&y>=3&&y<=8){this.rect(px,py,t,t,'#549da4');this.rect(px,py+((this.time*9+x*8+y*7)%27),14,2,'#a2c7b390');}
    }
    // Pond shore, garden fences, home and shop are solid landmarks in the same world.
    for(let x=24;x<=35;x++){this.rect(x*t,2*t+25,t,7,'#8d9c63');this.rect(x*t,9*t,t,6,'#8d9c63');}
    for(let y=9;y<19;y++){for(const x of [5,19]){this.rect(x*t+8,y*t+7,5,26,'#8c6844');this.rect(x*t+5,y*t+12,11,5,'#b79256');if(y!==10)this.rect(x*t+9,y*t+24,4,17,'#7f5b3d');}}
    this.pixelHouse(3*t,2*t,7*t,5*t,false);this.pixelHouse(14*t,2*t,5*t,4*t,true);
    const bin=FARM.stations.shipping;this.rect(bin.x*t-5,bin.y*t+4,45,25,'#86572f');this.rect(bin.x*t-8,bin.y*t,51,9,'#c89c57');this.rect(bin.x*t+14,bin.y*t+7,4,19,'#af7941');
    this.text('出货箱',(bin.x+.5)*t,(bin.y+.4)*t,9,'#f4dca1');
    for(const [key,soil] of Object.entries(s.soil)){const [x,y]=key.split(',').map(Number),px=x*t,py=y*t;this.rect(px+1,py+1,t-2,t-2,soil.watered?'#705235':'#987044');for(let i=0;i<3;i++)this.rect(px+3,py+5+i*8,t-6,2,soil.watered?'#5e4630':'#805835');if(soil.crop)this.pixelCrop(px+16,py+24,soil.growth);}
    for(const p of s.placed){const x=(p.x+.5)*t,y=(p.y+.5)*t;this.circle(x,y,7,'#6b9293');this.rect(x-2,y-12,4,22,'#c8cebe');this.rect(x-10,y-4,20,4,'#b4c5b1');}
    const objects=s.trees.map(p=>({type:'tree',x:p[0],y:p[1]})).concat(s.rocks.map(p=>({type:'rock',x:p[0],y:p[1]})),[{type:'player',x:s.player.x-.5,y:s.player.y-.5}]).sort((a,b)=>a.y-b.y);
    for(const o of objects){if(o.type==='tree')this.pixelTree((o.x+.5)*t,(o.y+.75)*t);else if(o.type==='rock'){const x=o.x*t,y=o.y*t;if(!this.farmSprite(3,0,x-4,y-8,40,42)){this.rect(x+5,y+8,22,17,'#6e7776');this.rect(x+8,y+4,15,8,'#a2aaa0');}}else this.pixelFarmer(s.player.x*t,s.player.y*t,s.player);}
    if(s.path.length){c.fillStyle='#fbf3c280';for(const p of s.path)this.circle(p.x*t,p.y*t,2,'#f4e7b6a0');}
    if(ui.hover){const {x,y}=ui.hover;if(x>=0&&y>=0&&x<FARM.width&&y<FARM.height){c.strokeStyle='#fff2b9';c.lineWidth=1.5;c.strokeRect(x*t+1,y*t+1,t-2,t-2);}}
    c.restore();
    const darkness=s.time>1080?Math.min(.65,(s.time-1080)/600):0;if(darkness)this.rect(0,0,this.width,this.height,`rgba(16,31,66,${darkness})`);
    if(s.weather==='雨'&&!this.reduced){c.strokeStyle='#c4e0e566';c.lineWidth=1;for(let i=0;i<55;i++){const x=(i*83+this.time*22)%this.width,y=(i*53+this.time*260)%this.height;this.line(x,y,x-4,y+12,'#c1dce366');}}
    this.round(15,15,160,49,5,'#f3dda6eb','#9c704d');this.text(`春 ${s.day} 日 · ${s.weather}`,29,31,13,'#59442a','left');const hour=Math.floor(s.time/60),minute=Math.floor(s.time%60/10)*10;this.text(`${hour%24}:${String(minute).padStart(2,'0')}`,29,51,12,'#745232','left');
    this.positions.player=this.worldPoint(s.player.x*t,s.player.y*t);
    if(ui.hover){const soil=s.soil[renderKey(ui.hover.x,ui.hover.y)];if(soil){const info=soil.crop?`防风草 · ${soil.growth>=4?'已成熟，可以收获':`生长 ${soil.growth}/4 · ${soil.watered?'已浇水':'今天未浇水'}`}`:'已开垦 · 可以播种';this.round(14,this.height-44,250,28,3,'#f0dba6ed','#9e744d');this.text(info,26,this.height-30,11,'#59442a','left');}}
  }
  farmSprite(col,row,x,y,w,h){const img=this.images.farm;if(!img)return false;const sy=row?img.height*.54:0,sh=img.height*(row?.46:.52);this.ctx.drawImage(img,col*img.width/4,sy,img.width/4,sh,x,y,w,h);return true;}
  pixelHouse(x,y,w,h,shop){if(this.farmSprite(shop?1:0,0,x-5,y-38,w+10,h+38))return;this.rect(x,y,w,h,'#b99357');}
  pixelTree(x,y){if(this.farmSprite(2,0,x-45,y-99,90,107))return;this.rect(x-5,y-26,10,32,'#7a5236');this.circle(x,y-50,28,'#579c50');}
  pixelCrop(x,y,growth){if(growth===0){this.rect(x-5,y-3,10,4,'#b8a06a');this.rect(x-2,y-5,3,3,'#e4d292');return;}this.rect(x-2,y-8-growth*2,4,11,'#539b3b');this.rect(x-10,y-13,9,5,'#5b9e3e');this.rect(x+1,y-19,8,6,'#82b648');if(growth>=3){this.rect(x-6,y-6,12,10,'#c7b789');this.rect(x-4,y+4,8,4,'#dbc597');}if(growth===4){this.rect(x-8,y-7,16,11,'#e3cea2');this.rect(x-4,y+4,8,6,'#f0d9a9');}}
  pixelFarmer(x,y,p){
    const step=Math.sin(p.walk*3)*1.3;this.rect(x-8,y+2,16,4,'#223f3b60');if(!this.farmSprite([1,3,0,2][p.face],1,x-24,y-51+step,48,56))this.rect(x-8,y-24,16,25,'#d99b52');
    const action=this.fx.findLast(f=>['hoe','chop','water','seed','harvest','build'].includes(f.type)&&this.time-f.start<.4);
    if(action&&!this.reduced){const c=this.ctx,age=(this.time-action.start)/.4,dir=[-Math.PI/2,0,Math.PI/2,Math.PI][p.face];c.save();c.translate(x,y-17);c.rotate(dir+(1-age)*1.4-.7);this.rect(4,-2,26,4,'#b58449');this.rect(25,-8,5,14,action.type==='water'?'#7eafbc':'#c4c8b4');if(action.type==='water')for(let i=0;i<6;i++)this.rect(28+i*3,6+i*2+age*8,2,3,'#c3e8e6');c.restore();}
  }

  factory(s,ui){
    const c=this.ctx,t=FACTORY.tile,scale=Math.min(this.width/(FACTORY.width*t),this.height/(FACTORY.height*t))*(ui.zoom||1),ox=(this.width-FACTORY.width*t*scale)/2,oy=(this.height-FACTORY.height*t*scale)/2;this.transform={x:ox,y:oy,scale};this.rect(0,0,this.width,this.height,'#42473a');c.save();c.translate(ox,oy);c.scale(scale,scale);
    for(let y=0;y<FACTORY.height;y++)for(let x=0;x<FACTORY.width;x++){const n=noise(x,y);this.rect(x*t,y*t,t,t,n>.5?'#66684e':'#60644d');for(let i=0;i<5;i++){const size=1+noise(x+i,y)*3;this.rect(x*t+noise(x+1,y+i)*t,y*t+noise(y,x+i)*t,size,size,'#9b95672b');}c.strokeStyle='#222b2926';c.lineWidth=.5;c.strokeRect(x*t,y*t,t,t);if(x>=1&&x<=4&&y>=4&&y<=7)for(let i=0;i<8;i++){this.circle(x*t+noise(x+i,7+y)*t,y*t+noise(y+i,x)*t,2+noise(i+x,y)*3,['#909ca0','#75888f','#596e78'][i%3]);}}
    const poles=Object.values(s.entities).filter(e=>['pole','generator'].includes(e.type));for(const p of poles)for(const q of poles)if(p.x<q.x&&Math.hypot(p.x-q.x,p.y-q.y)<=9){this.line((p.x+.5)*t,(p.y+.5)*t-25,(q.x+.5)*t,(q.y+.5)*t-25,'#302b20',2.5);this.line((p.x+.5)*t,(p.y+.5)*t-27,(q.x+.5)*t,(q.y+.5)*t-27,'#c2a76b',.7);}
    const power=factoryPower(s);
    for(const e of Object.values(s.entities).sort((a,b)=>a.y-b.y)){
      const x=(e.x+.5)*t,y=(e.y+.5)*t;
      if(e.type==='belt'){c.save();c.translate(x,y);c.rotate(e.dir*Math.PI/2);this.rect(-t/2,-13,t,26,'#282f2e');this.rect(-t/2,-10,t,20,'#77704a');const off=s.running?(this.time*23)%10:0;for(let n=-4;n<5;n++){const bx=n*10+off;this.line(bx-5,-8,bx,0,'#3e4336',3);this.line(bx,0,bx-5,8,'#3e4336',3);}this.rect(-t/2,-14,t,3,'#a49c64');this.rect(-t/2,11,t,3,'#a49c64');c.restore();}
      else if(e.type==='inserter'){c.save();c.translate(x,y);c.rotate(e.dir*Math.PI/2);this.circle(0,0,8,'#313d3a');const angle=e.flash>0?Math.PI*(1-e.flash/.35):Math.PI;const ax=Math.cos(angle)*t*.82,ay=Math.sin(angle)*t*.25;this.line(0,0,ax*.55,ay-7,'#2a2f2e',9);this.line(0,0,ax*.55,ay-7,'#d5ae47',5);this.line(ax*.55,ay-7,ax,ay,'#383d33',8);this.line(ax*.55,ay-7,ax,ay,'#d2ac45',4);this.circle(ax,ay,4,'#b6c1a3');c.restore();}
      else if(e.type==='pole'){this.line(x,y+12,x,y-30,'#514631',5);this.line(x-14,y-24,x+14,y-24,'#b6aa78',4);this.circle(x-9,y-29,3,'#9aa7a6');this.circle(x+9,y-29,3,'#9aa7a6');}
      else if(e.type==='chest'){this.rect(x-17,y-14,34,30,'#6f4d2d');this.rect(x-17,y-16,34,9,'#9a7243');for(const offset of [-10,9])this.rect(x+offset,y-16,3,33,'#49453b');}
      else {const img=this.images.machines,index={drill:0,furnace:1,assembler:2,generator:3}[e.type];if(img&&index!==undefined)c.drawImage(img,(index%2)*img.width/2,Math.floor(index/2)*img.height/2,img.width/2,img.height/2,x-t*.77,y-t*.91,t*1.54,t*1.54);else this.rect(x-18,y-18,36,36,'#8e9b8a');if(e.type==='furnace'&&e.status==='冶炼中')this.circle(x,y+9,4+Math.sin(this.time*7),'#f2b45b');if(['drill','assembler'].includes(e.type)&&!power(e)){this.text('ϟ',x,y-28,24,'#ffb66e');}if(e.type==='generator'&&s.running){for(let i=0;i<3;i++){const age=(this.time*.4+i/3)%1;this.circle(x+12-age*13,y-26-age*40,5+age*8,`rgba(188,191,171,${.22*(1-age)})`);}}}
      if(s.selected===renderKey(e.x,e.y)){c.strokeStyle='#f4dc9c';c.lineWidth=2;c.strokeRect(e.x*t+1,e.y*t+1,t-2,t-2);}
    }
    for(const [key,item] of Object.entries(s.items)){const e=s.entities[key];if(!e)continue;const [dx,dy]=DIRECTIONS[e.dir],x=(e.x+.5+dx*(item.progress-.5))*t,y=(e.y+.5+dy*(item.progress-.5))*t;this.item(item.kind,x,y);}
    if(!s.entities['5,5']){c.strokeStyle='#e9b657';c.lineWidth=2;c.setLineDash([5,4]);c.strokeRect(5*t+2,5*t+2,t-4,t-4);c.setLineDash([]);this.text('补齐',5.5*t,4.7*t,12,'#ffe0a4');}
    if(ui.hover){const {x,y}=ui.hover;c.strokeStyle='#e8d8a4';c.lineWidth=2;c.strokeRect(x*t+1,y*t+1,t-2,t-2);const [dx,dy]=DIRECTIONS[s.direction];this.line((x+.5)*t,(y+.5)*t,(x+.5+dx*.3)*t,(y+.5+dy*.3)*t,'#ffe6a4',4);}
    c.restore();
  }
  item(kind,x,y){if(kind==='ore'){this.ctx.beginPath();this.ctx.moveTo(x-7,y+4);this.ctx.lineTo(x-5,y-5);this.ctx.lineTo(x+3,y-7);this.ctx.lineTo(x+8,y);this.ctx.lineTo(x+4,y+6);this.ctx.fillStyle='#a2b0ad';this.ctx.fill();}else if(kind==='plate'){this.rect(x-8,y-5,16,10,'#b9c1b0');this.line(x-7,y-5,x+6,y-5,'#e2e4cc',2);}else {const c=this.ctx;c.save();c.translate(x,y);c.rotate(this.time);for(let i=0;i<8;i++){c.rotate(TAU/8);this.rect(-2,-9,4,5,'#bfa77b');}this.circle(0,0,6,'#c4b28a');this.circle(0,0,2.5,'#3b4540');c.restore();}}

  lifeBar(p,x,y,width=91,stress=false){const c=this.ctx;this.rect(x-width/2,y,width,7,'#161715');this.rect(x-width/2+1,y+1,(width-2)*Math.max(0,p.hp/p.maxHp),5,p.id?.startsWith('foe')||p.id?.startsWith('e')?'#aa544a':'#a0b97e');if(stress){for(let i=0;i<10;i++)this.rect(x-width/2+i*width/10,y+13,width/10-2,4,i<p.stress/10?'#bf9ca8':'#25262c');}this.text(`${p.hp}/${p.maxHp}`,x,y+stress*15+21,11,'#e4d8c7');}
  spire(s,ui){
    this.background(0);const c=this.ctx,W=this.width,H=this.height,scale=Math.min(W/1080,H/390),floor=H*.86;
    this.rect(0,0,W,H,'#0c172516');
    const px=W*.24,offset=this.actorOffset('player'),h=245*scale,w=190*scale;
    this.positions.player={x:px,y:floor};this.sprite(0,0,px+offset.x,floor,w,h,{hit:offset.hit});this.lifeBar({id:'player',hp:s.hp,maxHp:s.maxHp},px,floor+6,105*scale);
    this.text(`格挡 ${s.block} · 力量 ${s.strength}`,px,floor+43,12,'#ecdfb6');
    for(let i=0;i<s.enemies.length;i++){
      const e=s.enemies[i],x=W*(s.enemies.length===1?.73:.61+i*.22),y=floor,col=e.kind==='slime'?1:e.kind==='cultist'?2:3;
      this.positions[e.id]={x,y};const off=this.actorOffset(e.id);this.sprite(col,0,x+off.x,y,w,h,{dead:e.hp===0,hit:off.hit,alpha:e.hp===0?.15:1});
      if(e.hp>0){const intent=spireIntent(s,e);this.round(x-66*scale,y-h-35,132*scale,30*scale,5,'#1c2420d9','#d6bc88');this.text(intent.type==='attack'?`⚔ ${intent.amount}`:intent.type==='buff'?'仪式 · 力量':'格挡 14',x,y-h-20,14*scale,'#ffe0aa');this.lifeBar(e,x,y+6,105*scale);if(e.vulnerable)this.text(`易伤 ${e.vulnerable}`,x,y+42,12,'#edb5aa');
        const hit={id:e.id,x:x-w*.48,y:y-h,w:w*.96,h:h};this.hits.push(hit);
        if(ui.selectedCard!==null||ui.hover?.id===e.id){c.strokeStyle='#ffe4a0';c.lineWidth=2;c.beginPath();c.ellipse(x,y+2,w*.42,12*scale,0,0,TAU);c.stroke();}
      }
    }
    if(s.phase==='map'||s.phase==='camp'){
      const gradient=c.createLinearGradient(0,0,0,H);gradient.addColorStop(0,'#071b2180');gradient.addColorStop(1,'#0a1c25b0');this.rect(0,0,W,H,gradient);this.text(s.phase==='map'?'选择下一条爬塔路线':'炉火仍然温暖',W/2,H*.32,28*scale,'#f1dfb6','center',true);
      for(let i=0;i<3;i++){const x=W*(.35+i*.15),y=H*.53;this.circle(x,y,24*scale,i<s.floor?'#b4a174':'#546771');this.text(['战斗','营火','首领'][i],x,y+42*scale,15*scale);if(i<2)this.line(x+27*scale,y,W*(.35+(i+1)*.15)-27*scale,y,'#c5bfa177',2);}
    }
  }
  dungeonSpellFx(f,age){
    if(this.reduced)return;const c=this.ctx,from=this.positions[f.source],to=this.positions[f.target],scale=Math.min(this.width/1120,this.height/400);
    if(f.type==='torch'&&age<.7){const glow=c.createRadialGradient(this.width/2,this.height*.6,20,this.width/2,this.height*.6,this.width*.7);glow.addColorStop(0,`rgba(241,173,65,${.2*(1-age/.7)})`);glow.addColorStop(1,'#e9a54700');this.rect(0,0,this.width,this.height,glow);}
    if(f.type!=='playerAttack'||!from||!to||age>.65)return;
    const sx=from.x,sy=from.y-100*scale,tx=to.x,ty=to.y-105*scale;
    c.save();
    if(['plague','blast'].includes(f.skill)){
      const flight=Math.min(1,age/.22),x=sx+(tx-sx)*flight,y=sy+(ty-sy)*flight-Math.sin(flight*Math.PI)*75*scale,color=f.skill==='plague'?'#acd276':'#bba1db';
      if(flight<1){this.circle(x,y,6*scale,color);this.circle(x-8,y+3,3*scale,'#dfe5bd');}
      else{c.globalAlpha=(1-age/.65)*.7;for(let i=0;i<9;i++){const a=i*2.4,r=(age-.2)*100*scale;this.circle(tx+Math.sin(a)*r,ty+Math.cos(a)*r*.6,10*scale,color);}}
    }
    if(['pistol','grape'].includes(f.skill)&&age<.25){c.globalAlpha=1-age/.25;this.line(sx,sy,tx,ty,'#f7d5a4',2);for(let i=0;i<8;i++){const a=i*Math.PI/4,r=16*scale;this.line(sx,sy,sx+Math.cos(a)*r,sy+Math.sin(a)*r,'#ffe7b4',2);}}
    if(f.skill==='light'){c.globalAlpha=1-age/.65;const beam=c.createLinearGradient(tx,0,tx,ty+45);beam.addColorStop(0,'#fbe8ab00');beam.addColorStop(1,'#fbe8ab99');this.rect(tx-15*scale,0,30*scale,ty+45,beam);this.line(tx-18*scale,ty,tx+18*scale,ty,'#fff3c2',4);}
    c.restore();
  }
  dungeon(s,ui){
    this.background(1);const c=this.ctx,W=this.width,H=this.height,compact=W<650,combat=s.phase==='combat',scale=Math.min(W/1120,H/400),floor=H*(compact?.68:.69),h=215*scale,w=155*scale;
    // Moving light, dust and fog give the painted room depth without obscuring combat.
    const flicker=.08+Math.sin(this.time*6)*.016,glow=c.createRadialGradient(W*.1,H*.43,0,W*.1,H*.43,W*.4);glow.addColorStop(0,`rgba(231,120,40,${flicker+s.torch/800})`);glow.addColorStop(1,'#e9712800');this.rect(0,0,W,H,glow);
    if(s.encounter==='sanctum'){
      c.save();c.globalAlpha=.5;this.line(W*.77,0,W*.77,H*.19,'#897c5c',3);c.fillStyle='#6b5b41';c.beginPath();c.moveTo(W*.73,H*.2);c.quadraticCurveTo(W*.77,H*.08,W*.81,H*.2);c.lineTo(W*.82,H*.28);c.lineTo(W*.72,H*.28);c.closePath();c.fill();this.line(W*.72,H*.28,W*.82,H*.28,'#b49a67',4);c.restore();
    }
    for(let i=0;i<25;i++){const x=(i*97+this.time*(3+i%3))%W,y=(i*61+Math.sin(this.time*.3+i)*9)%H;this.circle(x,y,noise(i,3)*1.5,'#b4aa8b24');}
    const figures=[...s.party,...s.enemies];
    for(const p of figures){const x=p.id.startsWith('foe')?W*(.61+p.rank*.095):W*(.4-p.rank*.095);this.positions[p.id]={x,y:floor};}
    const attack=this.fx.findLast(f=>['playerAttack','enemyAttack','stress','heal'].includes(f.type)&&this.time-f.start<.52&&f.source);
    if(attack&&!this.reduced)this.rect(0,0,W,H,'#00000030');
    const paint=(p,enemy=false)=>{
      if(enemy&&!combat&&s.phase!=='reward')return;
      let {x}=this.positions[p.id],y=floor,ph=h,pw=w;
      if(!combat&&s.phase!=='reward'){x=W*(.17+p.rank*.19);y=H*.91;ph=Math.min(H*.43,h*.8);pw=ph*.68;this.positions[p.id]={x,y};}
      const off=this.actorOffset(p.id),eligible=combat&&dungeonSkillAllowed(s,ui.skill,p.id),hover=ui.hover?.id===p.id,active=s.active===p.id;
      if(p.dead){if(enemy&&p.corpse&&combat){this.sprite(3,1,x,y,80*scale,70*scale,{dead:true});this.text('尸体',x,y+17,Math.max(8,11*scale),'#998b7a');this.hits.push({id:p.id,x:x-40*scale,y:y-75*scale,w:80*scale,h:90*scale});if(eligible)this.line(x-25*scale,y+4,x+25*scale,y+4,'#df9374',2);}return;}
      const breathe=this.reduced?0:Math.sin(this.time*1.9+p.rank)*1.5;
      c.save();if(eligible){c.shadowBlur=hover?20:9;c.shadowColor=enemy?'#e16d4a':'#91bb7a';}if(attack&&(attack.source===p.id||attack.target===p.id)&&!this.reduced){pw*=1.04;ph*=1.04;}
      this.sprite(enemy?(p.role==='cultist'||p.role==='necromancer'?2:3):({crusader:0,healer:1,plague:2,rogue:0}[p.role]),enemy?(p.role==='cultist'||p.role==='necromancer'?0:1):p.role==='rogue'?0:1,x+off.x,y+breathe,pw,ph,{hit:off.hit,alpha:!combat?.72:eligible||active?1:.85});c.restore();
      if(combat){this.dungeonMarker(s,p,x,y,pw,ph,ui);this.hits.push({id:p.id,x:x-pw*.45,y:y-ph,w:pw*.9,h:ph+30});
        if(eligible){const color=enemy?'#e69a73':'#acd297';c.strokeStyle=color;c.lineWidth=hover?3:1.5;c.beginPath();c.ellipse(x,y+2,pw*.37,8*scale,0,0,TAU);c.stroke();}
        if(enemy){const intent=dungeonIntent(s,p);this.text(compact?(p.stun?'眩晕':p.role==='cultist'?'◈12':p.role==='necromancer'?'丧钟':'⚔3–6'):intent,x,y+(compact?33:61*scale),Math.max(8,11*scale),p.stun?'#c4c3a4':p.role==='cultist'||p.role==='necromancer'?'#d1a5c8':'#c9ae93');}
      }
    };
    s.party.forEach(p=>paint(p));s.enemies.forEach(p=>paint(p,true));
    const dark=c.createRadialGradient(W/2,H*.5,W*.12,W/2,H*.5,W*.68);dark.addColorStop(0,'#00000000');dark.addColorStop(1,`rgba(0,0,0,${.35+(100-s.torch)/230})`);this.rect(0,0,W,H,dark);
    if(combat){
      this.text(s.battleName,W/2,20,compact?12:16,'#e8d1a4','center',true);
      const order=[s.active,...s.queue].map(id=>figures.find(p=>p.id===id)).filter(p=>p&&!p.dead).slice(0,8),cw=compact?39:58,ox=(W-order.length*cw)/2;
      order.forEach((p,i)=>{const x=ox+i*cw;this.round(x+2,35,cw-4,27,2,i===0?'#79613bbf':'#111117cc',i===0?'#e4c58a':'#61554777');this.text(p.name.slice(0,compact?2:3),x+cw/2,49,compact?9:11,p.id.startsWith('foe')?'#d6a092':'#d5cba8');});
      if(!compact)this.text(`第 ${s.round} 回合`,W-24,22,12,'#b8a17f','right');
      const target=figures.find(p=>p.id===ui.hover?.id),skill=DUNGEON_SKILLS[ui.skill];
      if(target&&skill&&dungeonSkillAllowed(s,ui.skill,target.id)){
        const bonus=(s.relic?1:0)+s.resolveBonus,label=skill.heal?`治疗 ${skill.heal.join('–')}`:skill.guard?'减伤 45% · 压力 −5':`${skill.accuracy-5}% 命中 · ${skill.damage[0]+bonus}–${skill.damage[1]+bonus} 伤害`;
        this.round(W/2-125,73,250,28,2,'#161319ee','#a88956');this.text(`${target.name} · ${label}`,W/2,87,compact?10:12,'#eddbb5');
      }
    }
    if(!this.reduced){for(const f of this.fx){const age=this.time-f.start;if(age>.65)continue;const from=this.positions[f.source],to=this.positions[f.target];if(!from||!to)continue;
      if(f.type==='heal'){const beam=c.createLinearGradient(to.x,to.y-h,to.x,to.y);beam.addColorStop(0,'#a6eaa000');beam.addColorStop(1,`rgba(169,228,142,${.22*(1-age/.65)})`);this.rect(to.x-w*.3,to.y-h,w*.6,h,beam);}
      if(f.type==='stress'){for(let i=0;i<3;i++)this.line(to.x-18+i*17,to.y-h-8,to.x-12+i*17,to.y-h-28,'#d3a5dd88',2);}
    }}
  }
  dungeonMarker(s,p,x,y,w,h,ui){
    const scale=Math.min(this.width/1120,this.height/400),c=this.ctx,active=s.active===p.id,enemy=p.id.startsWith('foe'),size=Math.max(9,13*scale);
    this.text(this.width<650?p.name.slice(0,2):p.name,x,y-h+15*scale,size,active?'#ffe0a4':'#d6c5ab');
    if(active){c.fillStyle='#d2ac66';c.beginPath();c.moveTo(x,y+2);c.lineTo(x-6,y+11);c.lineTo(x+6,y+11);c.closePath();c.fill();}
    const bw=Math.max(24,w*(this.width<650?.5:.65)),by=y+7;this.rect(x-bw/2,by,bw,6,'#100e13');this.rect(x-bw/2+1,by+1,(bw-2)*p.hp/p.maxHp,4,enemy?'#a85445':'#9caa73');this.text(this.width<650?String(p.hp):p.hp+'/'+p.maxHp,x,by+16,Math.max(8,10*scale),'#dfd1b5');if(!enemy){for(let i=0;i<10;i++)this.rect(x-bw/2+i*bw/10,by+25,bw/10-2,3,i<p.stress/10?'#b78c9d':'#3b3239');}
    if(!enemy)this.text(this.width<650?`◈${p.stress}`:`压力 ${p.stress}`,x,y+(this.width<650?42:49),Math.max(8,10*scale),p.stress>=70?'#d399aa':'#ae9d9d');
    if(p.door)this.text('濒死之门',x,y-h+9,size,'#f1a18b');if(p.affliction)this.text('精神折磨',x,y-h+9,size,'#cd9eb5');if(p.virtue)this.text('英勇',x,y-h+9,size,'#e9ce85');
    const conditions=[p.blight?`腐蚀 ${p.blight}`:'',p.bleed?`流血 ${p.bleed}`:'',p.stun?'眩晕':'',p.guard?'守护':''].filter(Boolean).join(' · ');if(conditions&&this.width>=650)this.text(conditions,x,y-h+30*scale,Math.max(8,10*scale),'#c4d4a1');
  }


  hexPoint(q,r){const size=HEX.size;return {x:Math.sqrt(3)*size*(q+.5*(r&1)),y:size*1.5*r};}
  hexPolygon(x,y,size=HEX.size-1,fill,stroke){const c=this.ctx;c.beginPath();for(let i=0;i<6;i++){const angle=(60*i-30)*Math.PI/180,px=x+Math.cos(angle)*size,py=y+Math.sin(angle)*size;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke();}}
  brothers(s,ui){
    this.background(2);const c=this.ctx,W=this.width,H=this.height,size=HEX.size,worldW=10.5*Math.sqrt(3)*size,worldH=8*1.5*size,scale=Math.min(W/(worldW+55),H/(worldH+10)),ox=(W-worldW*scale)/2+size*scale,oy=(H-worldH*scale)/2+size*1.1*scale;this.transform={x:ox,y:oy,scale};
    c.save();c.translate(ox,oy);c.scale(scale,scale);
    const actor=battleUnits(s).find(p=>p.id===s.active),reachable=actor&&!actor.id.startsWith('e')&&ui.mode==='move'?reachableHexes(s,actor):[];
    for(let r=0;r<HEX.rows;r++)for(let q=0;q<HEX.cols;q++){
      const p=this.hexPoint(q,r),terrain=s.terrain[`${q},${r}`];this.hexPolygon(p.x,p.y,size-1,terrain==='hill'?'#b5a16c35':terrain==='rock'?'#555d5255':'#6c73570d','#e0d4a526');if(reachable.some(h=>h.q===q&&h.r===r))this.hexPolygon(p.x,p.y,size-3,'#9db88725','#bdd19b7a');if(ui.hover?.q===q&&ui.hover?.r===r)this.hexPolygon(p.x,p.y,size-2,'#f2d7982b','#f4d698');
      if(terrain==='rock'){c.fillStyle='#72776b';c.beginPath();c.moveTo(p.x-20,p.y+12);c.lineTo(p.x-17,p.y-13);c.lineTo(p.x+3,p.y-23);c.lineTo(p.x+24,p.y-3);c.lineTo(p.x+17,p.y+14);c.fill();this.line(p.x-17,p.y-13,p.x+3,p.y-23,'#a9aa93',3);}if(terrain==='bush'){for(let i=0;i<6;i++)this.circle(p.x+Math.sin(i*2)*14,p.y+Math.cos(i*2)*10,8,'#65764a');}if(terrain==='hill')this.text('高地',p.x,p.y-14,10,'#dfd1a1');
    }
    c.restore();
    const units=(s.phase==='camp'?s.roster.filter(p=>!p.dead).map((p,i)=>({...p,q:2+i*1.5,r:3})):battleUnits(s)).sort((a,b)=>a.r-b.r);
    for(const p of units){const point=this.hexPoint(p.q,p.r),x=ox+point.x*scale,y=oy+point.y*scale,off=this.actorOffset(p.id),w=76*scale,h=90*scale;this.positions[p.id]={x,y};if(p.dead){this.sprite(p.id.startsWith('e')?3:p.role==='archer'?1:p.role==='spear'?2:0,2,x,y+16*scale,w*.9,h*.5,{dead:true,alpha:.45});continue;}
      if(p.id===s.active){c.save();c.translate(x,y);c.scale(scale,scale);this.hexPolygon(0,0,size-2,'#a5c2a12b','#d3dfaa');c.restore();}
      const hitPreview=actor&&ui.mode==='attack'?attackPreview(s,actor,p):null;if(hitPreview?.valid){c.save();c.translate(x,y);c.scale(scale,scale);this.hexPolygon(0,0,size-3,'#a8593b2b','#e2a57d');c.restore();}
      this.sprite(p.id.startsWith('e')?3:p.role==='archer'?1:p.role==='spear'?2:0,2,x+off.x,y+5*scale,w,h,{hit:off.hit});this.lifeBar(p,x,y+15*scale,50*scale);this.rect(x-25*scale,y+26*scale,50*scale,3*scale,'#17252c');this.rect(x-25*scale,y+26*scale,50*scale*Math.max(0,p.armour/p.maxArmour),3*scale,'#94b3c8');this.text(p.name,x,y-82*scale,12*scale,'#f1e1bc');if(p.shield)this.text('盾墙',x,y-66*scale,11*scale,'#d2dba9');this.hits.push({id:p.id,x:x-w*.43,y:y-h*.9,w:w*.86,h:h*1.25});
    }
    if(s.phase==='camp'){this.round(W/2-135,18,270,36,5,'#28271eea','#b9a470');this.text('佣兵营地 · 选择合同进入战场',W/2,36,14,'#ead5a8');}
  }
  hexAt(x,y){const p=this.toWorld(x,y);let best=null,dist=Infinity;for(let r=0;r<HEX.rows;r++)for(let q=0;q<HEX.cols;q++){const at=this.hexPoint(q,r),d=Math.hypot(at.x-p.x,at.y-p.y);if(d<dist){dist=d;best={q,r};}}return dist<HEX.size?best:null;}
}
