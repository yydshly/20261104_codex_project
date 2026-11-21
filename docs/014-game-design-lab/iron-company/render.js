import {BOARD,TERRAIN,WEAPONS,MORALE,HEROES,ARMORS,APPROACHES,tileAt,cellKey,living,activeUnit,reachable,attackPreview,canSee,hexDistance} from './model.js';
export const ASSETS={warband:'./assets/warband.png',alternates:'./assets/alternates.png',terrain:'./assets/terrain.png',props:'./assets/props.png'};
const S=34,YS=.8,TAU=Math.PI*2;
const hash=(x,y)=>{const v=Math.sin(x*129.3+y*81.7)*43758.5453;return v-Math.floor(v);};
export class Battlefield{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.images={};this.time=0;this.effects=[];this.zoom=1;this.pan={x:0,y:0};this.width=900;this.height=500;this.dpr=1;this.screenPositions={};this.map=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.ready=Promise.all(Object.entries(ASSETS).map(([k,src])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[k]=img;resolve();};img.onerror=()=>resolve();img.src=src;})));
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
 }
 resize(){const r=this.canvas.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);}
 point(q,r,height=0){return {x:65+Math.sqrt(3)*S*(q+.5*(r&1)),y:80+S*1.5*r*YS-height*15};}
 transform(){this.scale=Math.min((this.width-20)/980,(this.height-24)/550)*this.zoom;this.ox=(this.width-980*this.scale)/2+this.pan.x;this.oy=(this.height-550*this.scale)/2+this.pan.y;}
 toScreen(p){return {x:this.ox+p.x*this.scale,y:this.oy+p.y*this.scale};}
 cellAt(x,y,s){let found=null,distance=Infinity;for(let r=0;r<BOARD.rows;r++)for(let q=0;q<BOARD.cols;q++){const p=this.toScreen(this.point(q,r,tileAt(s,{q,r}).height)),d=Math.hypot((x-p.x),(y-p.y)/YS);if(d<distance){distance=d;found={q,r};}}return distance<S*this.scale?found:null;}
 hex(c,x,y,size=S,stroke=null,fill=null){c.beginPath();for(let i=0;i<6;i++){const a=(60*i-30)*Math.PI/180,px=x+Math.cos(a)*size,py=y+Math.sin(a)*size*YS;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 label(text,x,y,size=12,color='#ead9b3',align='center'){const c=this.c;c.font=`${size}px "Microsoft YaHei",sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#171c13d9';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
 atlas(image,index,cols,rows,x,y,w,h,flip=false){if(!image)return;const c=this.c;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(image,index%cols*image.width/cols,Math.floor(index/cols)*image.height/rows,image.width/cols,image.height/rows,-w/2,-h,w,h);c.restore();}
 buildMap(s){
  const out=document.createElement('canvas');out.width=980;out.height=550;const c=out.getContext('2d'),tex=this.images.terrain;
  c.fillStyle='#555c3c';c.fillRect(0,0,980,550);
  if(tex){const sample=document.createElement('canvas');sample.width=sample.height=512;const sc=sample.getContext('2d');for(let row=0;row<2;row++)for(let col=0;col<2;col++){sc.save();sc.translate(col?512:0,row?512:0);sc.scale(col?-1:1,row?-1:1);sc.drawImage(tex,0,0,512,512,0,0,256,256);sc.restore();}this.groundTile=sample;const pattern=c.createPattern(sample,'repeat');c.fillStyle=pattern;c.fillRect(0,0,980,550);}
  for(let r=0;r<BOARD.rows;r++)for(let q=0;q<BOARD.cols;q++){
   const tile=tileAt(s,{q,r}),p=this.point(q,r,tile.height),t=TERRAIN[tile.kind];
   if(tile.height>0){this.hex(c,p.x,p.y+12,S+.4,null,'#695f3c');this.hex(c,p.x,p.y+7,S+.3,null,'#8a7950');}
   c.save();this.hex(c,p.x,p.y,S+.4);c.clip();
   if(tex&&tile.kind!=='grass'){const index=t.art,sw=tex.width/3,sh=tex.height/2,offsetX=hash(q,r)*110,offsetY=hash(r,q+3)*110;c.drawImage(tex,index%3*sw+offsetX,Math.floor(index/3)*sh+offsetY,sw-120,sh-120,p.x-S,p.y-S*YS,S*2,S*2*YS);}
   else if(!tex){c.fillStyle=['#6c7447','#8f7952','#8b8b70','#53613f','#3d5b57','#665a3e'][t.art];c.fill();}
   c.fillStyle=`rgba(32,38,14,${hash(q+7,r)*.06})`;c.fillRect(p.x-S,p.y-S*YS,S*2,S*2*YS);
   if(tile.kind==='bridge'){
    c.fillStyle='#65503a';c.fillRect(p.x-S,p.y-18,S*2,36);for(let i=0;i<8;i++){c.fillStyle=i%2?'#9c8252':'#ad915f';c.fillRect(p.x-S+i*9,p.y-17,8,34);c.fillStyle='#3e3c2b';c.fillRect(p.x-S+i*9+3,p.y-13,2,2);c.fillRect(p.x-S+i*9+3,p.y+11,2,2);}c.fillStyle='#4f422d';c.fillRect(p.x-S,p.y-21,S*2,4);c.fillRect(p.x-S,p.y+18,S*2,4);
   }
   c.restore();if(tile.height>0)this.hex(c,p.x,p.y,S,'#c8bb8a55');
  }
  this.map=out;
 }
 consume(events,s){for(const e of events||[]){const unit=s.units.find(u=>u.id===e.target)||s.cart,source=s.units.find(u=>u.id===e.source);this.effects.push({...e,start:this.time,at:unit?{q:unit.q,r:unit.r}:null,from:source?{q:source.q,r:source.r}:null,duration:e.type==='move'?Math.max(.18,(e.path.length-1)*.12):1.25});}this.effects=this.effects.slice(-35);}
 unitPoint(s,u){let p=this.point(u.q,u.r,tileAt(s,u).height);const motion=this.effects.findLast(e=>e.type==='move'&&e.target===u.id&&this.time-e.start<e.duration);if(motion&&!this.reduced){const f=(this.time-motion.start)/motion.duration*(motion.path.length-1),i=Math.min(motion.path.length-2,Math.floor(f)),a=motion.path[i],b=motion.path[i+1],pa=this.point(a.q,a.r,tileAt(s,a).height),pb=this.point(b.q,b.r,tileAt(s,b).height);p={x:pa.x+(pb.x-pa.x)*(f-i),y:pa.y+(pb.y-pa.y)*(f-i)};}return p;}
 draw(s,ui,dt){
  this.time+=Math.min(dt,.1);this.transform();const c=this.c;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);
  const fill=c.createLinearGradient(0,0,0,this.height);fill.addColorStop(0,'#5e6545');fill.addColorStop(1,'#383f2e');c.fillStyle=fill;c.fillRect(0,0,this.width,this.height);
  if(!this.map&&this.images.terrain)this.buildMap(s);
  c.save();c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
  if(this.groundTile){c.fillStyle=c.createPattern(this.groundTile,'repeat');c.fillRect(-1500,-1500,4000,4000);}
  if(this.map)c.drawImage(this.map,0,0);else{c.fillStyle='#606541';c.fillRect(0,0,980,550);}
  for(let r=0;r<11;r++){const p=this.point(7,r,-1);if(tileAt(s,{q:7,r}).kind==='water'&&!this.reduced){for(let n=0;n<3;n++){c.strokeStyle='#c1c5a33a';c.lineWidth=1;c.beginPath();const y=p.y-13+n*12+Math.sin(this.time*1.1+r)*2,x=p.x-14+Math.sin(this.time*.7+n+r)*5;c.moveTo(x,y);c.quadraticCurveTo(x+8,y-3,x+18,y);c.stroke();}}}
  if(ui.grid){for(let r=0;r<11;r++)for(let q=0;q<15;q++){const p=this.point(q,r,tileAt(s,{q,r}).height);this.hex(c,p.x,p.y,S,'#d5d5ad30');}}
  for(let q=s.cart.q+1;q<=12;q++){const p=this.point(q,5,0);c.save();c.translate(p.x,p.y);c.strokeStyle='#dbc98780';c.lineWidth=2;c.beginPath();c.moveTo(-4,-4);c.lineTo(2,0);c.lineTo(-4,4);c.stroke();c.restore();}
  const exit=this.point(12,5);this.hex(c,exit.x,exit.y,S-3,'#ecdaa870','#ddc98718');
  const actor=activeUnit(s),isPlayer=actor?.side==='ally'&&actor.morale>-3;
  if(isPlayer&&ui.skill==='move'&&!ui.busy){for(const p of reachable(s,actor)){const at=this.point(p.q,p.r,tileAt(s,p).height);this.hex(c,at.x,at.y,S-2,'#c0cf945d','#9eb9791b');}}
  if(ui.hover&&isPlayer){const dest=ui.skill==='move'?reachable(s,actor).find(p=>p.q===ui.hover.q&&p.r===ui.hover.r):null;if(dest){const points=[actor,...dest.path].map(p=>this.point(p.q,p.r,tileAt(s,p).height));c.strokeStyle=dest.danger?'#d59a6e':'#e9dfa0';c.setLineDash([5,4]);c.lineWidth=2;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);const p=points.at(-1);this.hex(c,p.x,p.y,S-2,c.strokeStyle,'#d9d09825');}}
  for(const corpse of s.corpses){const at=this.point(corpse.q,corpse.r,tileAt(s,corpse).height);c.fillStyle='#713a2f99';c.beginPath();c.ellipse(at.x,at.y+3,25,11,.2,0,TAU);c.fill();c.save();c.globalAlpha=.7;c.translate(at.x,at.y+3);c.rotate(corpse.side==='ally'?-1.1:1.1);c.filter='saturate(.45) brightness(.75)';this.atlas(this.images.warband,corpse.portrait,4,2,0,0,60,38);c.restore();}
  const prepUnits=s.phase==='prep'?HEROES.map((h,i)=>({...h,side:'ally',weapon:s.gear[h.id].weapon,...Object.fromEntries(['q','r'].map((k,j)=>[k,APPROACHES[s.approach].positions[i][j]])),maxHp:h.hp,body:ARMORS[s.gear[h.id].armor].body,maxBody:ARMORS[s.gear[h.id].armor].body,morale:0,shield:24})):living(s).filter(u=>canSee(s,u));
  const objects=[];for(let r=0;r<11;r++)for(let q=0;q<15;q++){const kind=tileAt(s,{q,r}).kind;if(kind==='tree'||kind==='rock')objects.push({kind,q,r});}
  objects.push({kind:'wagon',...s.cart});objects.push(...prepUnits.map(u=>({kind:'unit',...u})));objects.push({kind:'fence',q:12,r:6},{kind:'camp',q:12,r:3},{kind:'marker',q:1,r:4});objects.sort((a,b)=>a.r-b.r||(a.kind==='unit'?1:-1));this.screenPositions={};
  for(const object of objects){
   const p=object.kind==='unit'?this.unitPoint(s,object):this.point(object.q,object.r,tileAt(s,object).height);
   if(object.kind==='unit'){
    const u=object,selected=ui.inspect===u.id||s.active===u.id,hover=ui.hover?.q===u.q&&ui.hover?.r===u.r,preview=isPlayer&&u.side!==actor.side&&ui.skill!=='move'?attackPreview(s,actor,u,ui.skill):null;
    this.hex(c,p.x,p.y+4,S-7,selected?'#efdaa2':preview?.valid?'#e7a08a':u.side==='ally'?'#c2c8a359':'#a85c4b66',selected?'#d6c18d28':u.side==='ally'?'#445b5c55':'#6b382c44');
    c.fillStyle='#1b21158a';c.beginPath();c.ellipse(p.x,p.y,27,9,0,0,TAU);c.fill();
    const attack=this.effects.findLast(e=>['hit','miss','block'].includes(e.type)&&e.source===u.id&&this.time-e.start<.32),hit=this.effects.findLast(e=>e.type==='hit'&&e.target===u.id&&this.time-e.start<.3);let x=p.x;
    if(attack&&!this.reduced)x+=Math.sin((this.time-attack.start)/.32*Math.PI)*(u.side==='ally'?13:-13);if(hit&&!this.reduced)x+=Math.sin((this.time-hit.start)*70)*3;
    const alternate=u.portrait<4&&HEROES[u.portrait]?.choices[1]===u.weapon;
    c.save();if(hit)c.filter='brightness(1.65)';this.atlas(alternate?this.images.alternates:this.images.warband,u.portrait,4,alternate?1:2,x,p.y+3,64,82,u.side==='enemy');c.restore();
    const hp=Math.max(0,u.hp/u.maxHp);c.fillStyle='#24271e';c.fillRect(p.x-23,p.y+7,46,5);c.fillStyle=u.side==='ally'?'#a3b080':'#bc7663';c.fillRect(p.x-22,p.y+8,44*hp,3);c.fillStyle='#303937';c.fillRect(p.x-23,p.y+15,46,3);c.fillStyle='#a4b2b0';c.fillRect(p.x-22,p.y+15,44*(u.body/u.maxBody),2);
    if(u.morale<0||u.morale>0){c.fillStyle=u.morale>0?'#d6c478':u.morale===-3?'#bd7179':'#9c8b9e';c.beginPath();c.moveTo(p.x+21,p.y-69);c.lineTo(p.x+27,p.y-63);c.lineTo(p.x+21,p.y-57);c.lineTo(p.x+15,p.y-63);c.closePath();c.fill();}
    if(u.shieldwall){c.strokeStyle='#bbc9c5';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y-19,28,-.9,.9);c.stroke();}
    if(u.spearwall){c.strokeStyle='#d8d9a7';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(p.x-15+i*13,p.y-2);c.lineTo(p.x-11+i*13,p.y-20);c.stroke();}}
    if(u.bleed){c.fillStyle='#ab443c';c.beginPath();c.arc(p.x-27,p.y-7,4,0,TAU);c.fill();}if(u.injury){c.fillStyle='#e3cfa7';c.fillRect(p.x+24,p.y+6,7,3);c.fillRect(p.x+26,p.y+4,3,7);}
    if(selected||hover||s.phase==='prep'){c.font='12px Microsoft YaHei';c.fillStyle='#edddb1';c.strokeStyle='#252b1c';c.lineWidth=3;c.textAlign='center';c.strokeText(u.name,p.x,p.y-74);c.fillText(u.name,p.x,p.y-74);}
    this.screenPositions[u.id]=this.toScreen(p);
   }else if(object.kind==='wagon'){
    this.atlas(this.images.props,2,3,2,p.x,p.y+10,118,112);
    if(s.phase!=='prep'){c.fillStyle='#282e20';c.fillRect(p.x-29,p.y+15,58,6);c.fillStyle='#d9bf7b';c.fillRect(p.x-28,p.y+16,56*s.cart.hp/s.cart.maxHp,4);}this.screenPositions.wagon=this.toScreen(p);
   }else{const index={rock:0,tree:1,fence:3,camp:4,marker:5}[object.kind],w=object.kind==='tree'?120:object.kind==='camp'?105:80,h=object.kind==='tree'?155:object.kind==='camp'?90:75;this.atlas(this.images.props,index,3,2,p.x,p.y+5,w,h);}
  }
  c.restore();
  const shade=c.createRadialGradient(this.width*.5,this.height*.5,this.width*.22,this.width*.5,this.height*.5,this.width*.8);shade.addColorStop(0,'#18211200');shade.addColorStop(1,'#111b0e75');c.fillStyle=shade;c.fillRect(0,0,this.width,this.height);
  if(isPlayer&&ui.hover){const dest=ui.skill==='move'?reachable(s,actor).find(p=>p.q===ui.hover.q&&p.r===ui.hover.r):null;if(dest){const p=this.toScreen(this.point(dest.q,dest.r,tileAt(s,dest).height));this.label(`${dest.cost} AP · ${dest.fat} 疲劳${dest.danger?' · 借机攻击':''}`,p.x,p.y+35*this.scale,12,dest.danger?'#f0b49c':'#f1e8b9');}}
  for(const u of prepUnits){const p=this.screenPositions[u.id];if(!p)continue;if(ui.inspect===u.id&&s.phase==='battle')this.label(`${u.hp}/${u.maxHp}  ·  ${MORALE[u.morale+3]}`,p.x,p.y+32*this.scale,11,u.side==='ally'?'#e1d8b6':'#e2b4a5');}
  this.drawEffects(s);
 }
 drawEffects(s){const c=this.c;this.effects=this.effects.filter(e=>this.time-e.start<e.duration);for(const e of this.effects){const age=this.time-e.start,p=age/e.duration,to=this.screenPositions[e.target]||(e.at&&this.toScreen(this.point(e.at.q,e.at.r,0))),from=this.screenPositions[e.source]||(e.from&&this.toScreen(this.point(e.from.q,e.from.r,0)));if(!to)continue;c.save();c.globalAlpha=Math.max(0,1-p);
   const y=to.y-57*this.scale-age*22;let value=e.type==='hit'?`−${e.amount}${e.head?' 头部':''}`:e.type==='block'?'格挡':e.type==='miss'?'闪避':e.type==='bleed'?`流血 −${e.amount}`:e.type==='morale'?e.amount<0?'士气下降':'士气提升':e.type==='injury'?'负伤':e.type==='bandage'?'止血':e.type==='shield'?'盾牌 −12':null;
    if(value&&(!e.ranged||age>=.16))this.label(value,to.x,y,e.type==='hit'?18:13,e.type==='morale'?'#d4afcd':e.type==='block'?'#c3d2d0':e.type==='bandage'?'#dce6b4':'#f1c6a0');
   if(e.type==='hit'&&e.armor&&(!e.ranged||age>=.16))this.label(`护甲 −${e.armor}`,to.x,y+19,12,'#b6c8d1');
   if(!this.reduced&&from&&['hit','miss','block'].includes(e.type)&&age<.38){if(e.ranged){const flight=Math.min(1,age/.2),x=from.x+(to.x-from.x)*flight,yy=from.y-45*this.scale+(to.y-from.y)*flight-Math.sin(flight*Math.PI)*25*this.scale;c.strokeStyle='#f0dfb3';c.lineWidth=2;c.beginPath();c.moveTo(x-13,yy+1);c.lineTo(x,yy);c.stroke();}else{const a=age/.38;c.strokeStyle=e.type==='block'?'#e8d8af':'#eee5c5';c.lineWidth=3;c.beginPath();c.arc(to.x,to.y-35*this.scale,22*this.scale,-1.9+a*2,0+a*2);c.stroke();}for(let i=0;i<6;i++){const a=i*2.4,r=age*75*this.scale;c.fillStyle=e.type==='hit'?'#a64d3e':'#d8c696';c.fillRect(to.x+Math.cos(a)*r,to.y-28*this.scale+Math.sin(a)*r,3,3);}}
   c.restore();
  }
 }
}
