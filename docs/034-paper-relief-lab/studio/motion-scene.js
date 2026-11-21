/* A deterministic layered stage. Joint targets and prop ownership share one clock. */
(function(root){
 'use strict';
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);},p=(t,a,b)=>ease((t-a)/(b-a)),mix=(a,b,u)=>a+(b-a)*u,point=(a,b,u)=>[mix(a[0],b[0],u),mix(a[1],b[1],u)];
 const K={ink:'#1b2528',blue:'#244f76',shade:'#18354d',paper:'#f7f2e6',skin:'#d3b58b',shadow:'#b38b67',red:'#c52940',coat:'#d4a13c',coatShade:'#b5802c',hair:'#202d2e'};
 const chapters=[{id:'waiting',name:'等待',start:0,end:3},{id:'finding',name:'发现',start:3,end:8},{id:'recognition',name:'相认',start:8,end:13},{id:'offering',name:'递篮',start:13,end:20}];
 function groundY(x){if(x<305)return 425-75*ease((x+40)/345);if(x<520)return 350-65*Math.sin((x-305)/215*Math.PI/2);if(x<735)return 285+87*((x-520)/215)**2;return mix(372,441,clamp((x-735)/108));}
 function keyPoint(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<keys[i][0])return point(keys[i-1][1],keys[i][1],p(t,keys[i-1][0],keys[i][0]));return keys.at(-1)[1];}
 // Acceleration belongs to the walk, while each stance foot stays on its own ground point.
 function travel(t,start,end){const u=clamp((t-start)/(end-start)),edge=.15;if(u<edge)return(u-edge/Math.PI*Math.sin(Math.PI*u/edge))/(2*(1-edge));if(u>1-edge)return 1-travel(start+(1-u)*(end-start),start,end);return(u-edge/2)/(1-edge);}
 function walk(t,start,end,x0,x1,steps,s0,s1){
  const u=travel(t,start,end),x=mix(x0,x1,u),s=mix(s0,s1,u),stride=(x1-x0)/steps,phase=u*steps,k=Math.min(steps-1,Math.floor(phase)),q=u>=1?1:phase-k;
  const target=n=>n>=steps-2?x1+(n===steps-2?-16:15)*s1:x0+(n+1.5)*stride;
  const feet=[0,1].map(i=>{let fx=x0+(i?15:-16)*s0,lift=0;const last=k-1-((k-1-i+2)%2);if(last>=0)fx=target(last);if(k%2===i){const from=fx;fx=mix(from,target(k),ease(q));lift=Math.sin(Math.PI*q)**2*7.5;}return[fx,groundY(fx)-lift+i*1.1];});
  return{x,scale:s,feet,moving:p(t,start,start+.5)*(1-p(t,end-.5,end)),phase};
 }
 const blink=(t,times)=>Math.max(0,...times.map(at=>Math.max(0,1-Math.abs(t-at)/.095)));
 function expression(t,older){const warmth=p(t,older?9.8:11.35,older?11.1:12.45),settle=p(t,19.1,19.8);return{smile:mix(warmth*.8,.65,settle),brow:p(t,8.55,9.25)*(1-p(t,10.1,11.0))*.7,blink:blink(t,older?[1.8,7.65,12.25,17.8]:[8.4,11.1,15.8,19.4]),gaze:older?-.2+1.5*p(t,2.6,3.35)*(1-p(t,7.7,8.8))+.65*p(t,16.3,17.6)*(1-p(t,19.0,19.8)):-.15+.8*p(t,16.4,17.7)*(1-p(t,19.1,19.8))};}
 function balance(pose,length){for(let i=0;i<2;i++){const dx=pose.hip[0]+(i?7:-10)*pose.scale-pose.feet[i][0],height=Math.sqrt(Math.max(0,(length*pose.scale*.992)**2-dx*dx));pose.hip[1]=Math.max(pose.hip[1],pose.feet[i][1]-height);}return pose;}
 function sample(time){
  const t=Math.max(0,Math.min(20,time)),bend=p(t,3.35,4.85)*(1-p(t,5.9,7.65)),ready=p(t,14.45,15.4),lift=p(t,16.35,17.5),basket={x:mix(819,774,lift),y:mix(421,355,lift),scale:.87};
  const handle=[basket.x-2*basket.scale,basket.y-36*basket.scale],support=[basket.x-22,basket.y+30];
  const step1=p(t,13.35,14.25),step2=p(t,14.35,15.2),breath=.45*Math.sin(t*1.65)*(1-bend)*(1-ready);
  const hip=[749-15*(step1+step2)+5*lift-7*bend,369+35*bend+mix(13,2,lift)*ready+breath];
  let near=keyPoint(t,[[0,[771,381]],[3.65,[771,381]],[5.05,[780,440]],[5.4,[780,440]],[5.98,[790,382]],[6.15,[790,382]],[6.65,[811,408]],[6.7,[811,408]],[7.05,[794,370]],[7.65,[771,381]],[13.3,[771,381]],[14.5,[748,379]],[15.75,[817.26,389.68]]]);
  if(t>=15.75)near=handle;
  const wave=keyPoint(t,[[0,[724,381]],[3.3,[724,381]],[4.55,[719,411]],[5.9,[719,411]],[7.4,[724,381]],[9.0,[724,381]],[9.65,[706,343]],[10.35,[691,316]],[10.75,[695,310]],[11.2,[691,314]],[11.65,[694,309]],[12.1,[696,318]],[13.1,[716,375]],[15.1,[713,380]],[16.7,[737,382]]]);
  const far=point(wave,support,p(t,16.65,17.6));
  const father={role:'father',hip,scale:1.08,angle:.57*bend+ready*mix(.4,.16,lift)-.025*p(t,8.9,9.9)*(1-p(t,12,13)),look:-1+2*p(t,2.65,3.35)-2*p(t,8.35,9.05)+2*p(t,14.2,15.0),tilt:.02+.38*p(t,2.75,4.2)*(1-p(t,6.8,8.15))-.12*p(t,8.55,9.4)*(1-p(t,14.4,15.5))+.12*ready-.08*p(t,19.1,19.8),near,far,feet:[[727-30*step1,442-6*Math.sin(Math.PI*step1)**2],[770-30*step2,442-6*Math.sin(Math.PI*step2)**2]],expression:expression(t,true),nearTurn:0,grip:p(t,5.05,5.4)*(1-p(t,6.65,6.9)),wave:p(t,9.3,9.7)*(1-p(t,12.1,12.7)),supporting:t>=17.6};
  const walking=t<13.2?walk(t,6.1,11.75,-40,561,14,.91,.91):walk(t,13.2,16.35,561,843,8,.91,1.08),gx=walking.x,gy=groundY(gx),scale=walking.scale,moving=walking.moving;
  const raised=p(t,11.85,12.6),lower=p(t,13.25,14.1),offer=p(t,16.75,18.1),settle=p(t,19.2,20),turn=p(t,14.9,16.25),swing=Math.sin(walking.phase*Math.PI)*moving;
  const dg=point([gx+24*scale+swing*3,gy-79*scale],[gx+49*scale,gy-139*scale],raised*(1-lower));
  const dhand=point(dg,[790,339],offer),released=p(t,18.4,18.95);
  const daughter={role:'daughter',visible:t>=6.1,hip:[gx,gy-(73-7*moving)*scale-Math.sin(walking.phase*Math.PI)**2*1.2*moving],scale,angle:-.035*moving-.055*offer,look:1-2*p(t,15.1,16.35),tilt:.025+.14*p(t,16.55,17.8)-.14*settle,near:point(dhand,[814,373],settle),far:[gx+mix(-22,21,turn)*scale-swing*5,gy-77*scale],feet:walking.feet,expression:expression(t,false),nearTurn:turn,grip:1-p(t,18.35,18.6),released:released>0};
  balance(father,70.5);balance(daughter,78);
  const leaf1={owner:t<5.05?'ground':t<6.7?'father':t<7.08?'falling':'basket',grip:t<5.05?[780,440]:father.near,release:[811,408],drop:p(t,6.7,7.08)};
  const leaf2={owner:t<6.1?'hidden':t<18.4?'daughter':t<18.95?'falling':'basket',grip:daughter.near,release:[790,339],drop:released};
  return{time:t,chapter:Math.min(3,chapters.findIndex(c=>t<c.end)<0?3:chapters.findIndex(c=>t<c.end)),father,daughter,basket,handle,support,leaf1,leaf2};
 }
 function joint(a,b,l1,l2,bend=1){const dx=b[0]-a[0],dy=b[1]-a[1],distance=Math.hypot(dx,dy)||.001,d=Math.max(.001,Math.min(distance,l1+l2-.001)),along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));return[a[0]+dx/distance*along-dy/distance*height*bend,a[1]+dy/distance*along+dx/distance*height*bend];}
 function transform(pose,local){const c=Math.cos(pose.angle),s=Math.sin(pose.angle);return[pose.hip[0]+(local[0]*c-local[1]*s)*pose.scale,pose.hip[1]+(local[0]*s+local[1]*c)*pose.scale];}
 function armRig(pose,side){const turn=pose.nearTurn||0,shoulder=transform(pose,[side==='near'?mix(11,-15,turn):mix(-18,12,turn),-63]),hand=pose[side],lengths=(side==='far'?[44,43]:[41.5,41.5]).map(n=>n*pose.scale),bend=pose.role==='daughter'?(side==='near'?mix(1,-1,turn):1):(side==='near'?1:-1);return{shoulder,hand,lengths,elbow:joint(shoulder,hand,...lengths,bend)};}
 const Base=root.PaperRelief||class{};
 class MotionScene extends Base {
  constructor(canvas){super(canvas);this.paused=true;this.visible=false;this.scene='pond';this.shot=1;this._backdrop=true;super.drawRawScene();this._backdrop=false;this.backgroundInk=this.ic.getImageData(0,0,1000,630);this.backgroundHeight=this.hc.getImageData(0,0,1000,630);this.blurCtx.clearRect(0,0,1000,630);this.blurCtx.filter='blur(.65px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';this.surface.render(this.backgroundInk.data,this.blurCtx.getImageData(0,0,1000,630).data,this.params,this.bc);this.patch=document.createElement('canvas');this.box={x:660,y:220,w:275,h:265};this.patch.width=this.box.w;this.patch.height=this.box.h;this.lastPose=null;this.renderAt(0);}
  getStoryCamera(){return{scale:1,x:0,y:0};}
  snapshot(){return this.canvas.toDataURL('image/png');}
  father(...args){if(!this._backdrop)super.father(...args);}
  daughter(...args){if(!this._backdrop)super.daughter(...args);}
  creekBasket(...args){if(!this._backdrop)super.creekBasket(...args);}
  creekLeaf(...args){if(!this._backdrop)super.creekLeaf(...args);}
  offeringContact(){if(!this._backdrop)super.offeringContact();}
  groundContact(...args){if(!this._backdrop)super.groundContact(...args);}
  transform(pose,local){return transform(pose,local);}
  faceRig(at,scale,look,tilt,older,feeling){this.group(at[0],at[1],scale,tilt,()=>{
   const f=feeling,turn=Math.abs(look),dir=look<0?-1:1,eye=look*6.5,shadow=older?'#bc9874':'#c6a17b';
   this.fill('M-7 8L5 8L5 23Q-2 25 -9 20Z',K.shadow,.25);
   // The bun belongs behind the head, including while she turns through a front view.
   if(!older){this.ellipse(-look*14,7,5,6,K.hair,null,1,.29);this.cut(`M${-look*15} 4q3 -2 5 1`,.6);}
   // A cheek plane, lower eyelid and quiet mouth survive at the actual scene scale.
   this.fill('M-11 -12C-12 -23 1 -27 9 -20Q15 -14 12 -4L12 5Q9 15 1 16Q-9 15 -12 3Z',K.skin,.29);
   this.fill(`M${-dir*10} -9Q${-dir*12} 5 ${-dir*3} 12L${dir*2} 16Q${-dir*9} 15 ${-dir*12} 3Z`,shadow,.26);
   this.fill(`M${dir*11*turn} -6Q${dir*14*turn} -1 ${dir*16*turn} 1L${dir*12*turn} 4L${dir*9*turn} 3Z`,K.skin,.29);
   this.line(`M${dir*13*turn} 4l${-dir*2} .5`,K.shadow,.55,.2);
   this.fill('M-12 -9Q-14 -25 0 -26Q14 -26 14 -12L10 -10Q2 -17 -7 -10L-8 2L-12 0Z',K.hair,.3);
   if(older){
    this.fill(`M-15 -16Q-15 -27 -2 -29Q11 -29 15 -18L${look*17} -13Q1 -18 -14 -12Z`,K.hair,.3);
    this.cut('M-11 -20Q-2 -26 9 -21M-10 -17L3 -21',.65);
    this.line(`M${-look*8-1} -8l-.5 7M${-look*8+1} -7l-.5 6`,K.paper,.65,.08);
    this.line(`M${eye-3} 3l-2 1.5M${eye-4} 6l-1 1M${eye-3} -12q3 -1 6 0`,K.shadow,.48,.2);
   }else{
    this.line('M-8 -17Q-3 -23 5 -20M-7 -14Q-3 -18 1 -17',K.paper,.5,.08);
   }
   this.ellipse(-look*8.5,2,2.2,3.5,K.shadow,null,1,.26);
   this.line(`M${-look*9} 0q${look*3} -1 ${look*2} 3`,K.skin,.65,.28);
   const eyeY=-3+f.gaze*.7,opening=(1-f.blink)*(1-f.smile*.32);
   this.line(`M${eye-2.5} ${-7-f.brow*2}q2.5 ${-1+f.smile*.4} 5.5 .3`,K.ink,older?.65:.6,.2);
   this.line(`M${eye-2} ${eyeY}q2.6 ${-1.5*opening} 5 0`,K.ink,.64,.2);
   if(opening>.15)this.ellipse(eye+1+look*.6,eyeY+.55,.6,.9*opening,K.ink,null,1,.23);
   this.line(`M${eye-1} ${eyeY+2.4}q2 .8 4 -.3`,K.shadow,.45,.2);
   if(turn<.68){const other=-look*3-6;this.line(`M${other} ${eyeY}q2 ${-opening} 4 0M${other} -7q2 -1 4 0`,K.ink,.5,.2);}
   const mouth=look*5;
   this.line(`M${mouth-3} ${9-f.smile*.8}Q${mouth} ${10+f.smile*3} ${mouth+3.5} ${9-f.smile*.8}`,K.ink,.58,.22);
   this.line(`M${mouth-1} 13q2 .5 3 -.5`,K.shadow,.45,.2);
   if(f.smile>.25)this.line(`M${mouth+dir*5} 7l${dir} 2`,K.shadow,.45,.2);
  });}
  gesture(at,scale,angle,mode,grip=1){this.group(at[0],at[1],scale,angle,()=>{
   const shapes={pinch:`M-8 -3Q-4 -5 -1 -4L${4+3*(1-grip)} ${-2-3*(1-grip)}Q7 -1 3 0L0 0Q4 2 3 4Q1 5 -2 2Q-5 4 -8 1Z`,hold:'M-8 -3Q-4 -6 0 -4Q6 -4 5 0L3 4Q1 6 -1 3L-2 0Q-4 3 -7 1Z',support:'M-9 -3Q-3 -5 2 -2L8 -3Q11 -2 7 0L2 3Q-3 5 -8 1Z',wave:'M-8 -3Q-4 -5 -1 -3L4 -6Q6 -7 5 -4L2 -1L8 -2Q10 -2 8 0L3 1L9 2Q11 3 8 4L2 3L6 6Q7 8 4 6L-1 4Q-6 5 -8 1Z',relax:'M-8 -3Q-3 -5 0 -2L5 1Q7 3 5 3L1 1L4 5Q5 7 3 6L0 3L2 7Q2 9 0 7L-3 3Q-7 3 -8 0Z'};
   this.fill(shapes[mode]||shapes.relax,K.skin,.29);
   this.line(mode==='pinch'?'M-3 -1L0 0M-3 1L0 2':mode==='hold'?'M-3 -2q4 -1 4 2M-4 1l3 1':mode==='support'?'M-4 0L3 0':'M-4 0L0 2M-2 -2L1 0',K.shadow,.5,.2);
  });}
  arm(pose,side,color,mode){
   const {shoulder,hand,elbow}=armRig(pose,side),angle=Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0]),handAngle=mode==='wave'?mix(angle,-.95,pose.wave):mode==='support'?.02:mode==='hold'?-.15:angle,wrist=[hand[0]-Math.cos(handAngle)*7*pose.scale,hand[1]-Math.sin(handAngle)*7*pose.scale];
   this.sleeve(shoulder,elbow,wrist,8*pose.scale,5.7*pose.scale,3.5*pose.scale,color);
   this.line(`M${shoulder[0]+2} ${shoulder[1]+5}Q${elbow[0]+1} ${elbow[1]-2} ${wrist[0]} ${wrist[1]}`,K.paper,.8,.08);
   this.line(`M${elbow[0]-3} ${elbow[1]-2}l4 2M${wrist[0]-2} ${wrist[1]-2}l3 1`,K.paper,.65,.08);
   this.gesture(hand,.92*pose.scale,handAngle,mode,pose.grip);
  }
  legs(pose,isDaughter){
   for(let i=1;i>=0;i--){const hip=[pose.hip[0]+(i?7:-10)*pose.scale,pose.hip[1]],foot=pose.feet[i],knee=joint(hip,foot,(isDaughter?38.5:35)*pose.scale,(isDaughter?39.5:35.5)*pose.scale,isDaughter?1:i?-1:1);this.sleeve(hip,knee,foot,8.3*pose.scale,6.5*pose.scale,4*pose.scale,i?'#283231':K.ink);this.line(`M${hip[0]+3} ${hip[1]+8}Q${knee[0]+3} ${knee[1]} ${foot[0]+2} ${foot[1]-8}`,K.paper,.7,.08);this.line(`M${knee[0]-3} ${knee[1]-2}l4 2`,K.paper,.65,.08);this.group(foot[0],foot[1],pose.scale,0,()=>{this.fill('M-6 -4Q0 -6 5 -2L10 1Q13 3 10 5Q0 7 -11 4L-11 1Z',K.ink,.3);this.cut('M-9 3Q0 5 8 3',.65);});}
  }
  body(pose,isDaughter){
   this.legs(pose,isDaughter);this.arm(pose,'far',isDaughter?K.coatShade:K.shade,isDaughter?'relax':pose.supporting?'support':pose.wave>0?'wave':'relax');
   this.group(pose.hip[0],pose.hip[1],pose.scale,pose.angle,()=>{
    if(isDaughter){this.fill('M12 -49L34 -43L37 -10L17 -9Z','#465b57',.25,K.ink,.7);this.line('M20 -45Q20 -60 29 -55L31 -43',K.ink,1.5,.25);}
    this.fill('M-18 -72Q-8 -79 3 -73Q15 -69 15 -55L13 -25L15 -1Q-4 6 -22 -2L-24 -31Q-29 -56 -18 -72Z',isDaughter?K.coat:K.blue,.3);
    this.fill('M-24 -55Q-19 -34 -11 -24L-9 0L-22 -3L-25 -33Z',isDaughter?K.coatShade:K.shade,.3);
    this.fill('M3 -69Q12 -65 14 -53L12 -24L14 -2L5 1L6 -27Z',isDaughter?'#c39234':'#20476b',.28);
    this.cut('M-17 -63Q-10 -52 -9 -44M-20 -35Q-14 -19 -12 -8M-18 -5Q-3 0 11 -5M4 -58L7 -39',.95);
    this.fill('M-15 -71Q-3 -65 7 -72L9 -66Q-4 -60 -18 -66Z',isDaughter?'#a23941':K.red,.3);
    if(!isDaughter)this.fill('M-12 -65L-16 -46L-10 -48L-6 -64Z',K.red,.3);
    if(isDaughter){this.line('M-2 -57L-4 -5M-16 -10L-8 -9M-19 -16L-17 -13M6 -12L9 -11',K.paper,.75,.08);for(let i=0;i<3;i++)this.ellipse(-1,-37+i*10,.8,.8,'#8e682a',null,1,.2);}else{this.line('M-4 -55L-5 -12M-16 -16L-11 -15M4 -11L9 -10',K.paper,.65,.08);for(let i=0;i<3;i++)this.ellipse(-2,-36+i*10,.7,.8,'#142e43',null,1,.2);}
   });
   this.faceRig(this.transform(pose,[-5,-87]),pose.scale,pose.look,pose.tilt,!isDaughter,pose.expression);
  }
  leafAtGrip(grip,scale=.32){const angle=.1,dx=(-2*Math.cos(angle)-17*Math.sin(angle))*scale,dy=(-2*Math.sin(angle)+17*Math.cos(angle))*scale;this.creekLeaf(grip[0]-dx,grip[1]-dy,scale,angle,K.red,0);}
  renderAt(time){
   if(!this.backgroundInk)return;const started=performance.now(),s=sample(time);this.lastTime=s.time;this.shot=s.chapter+1;this.ic.putImageData(this.backgroundInk,0,0);this.hc.putImageData(this.backgroundHeight,0,0);
   if(s.daughter.visible){this.groundContact(s.daughter.hip[0],groundY(s.daughter.hip[0])+4,25*s.daughter.scale);this.body(s.daughter,true);this.arm(s.daughter,'near',K.coat,s.leaf2.owner==='daughter'?'pinch':'relax');if(s.daughter.hip[0]<320)this.creekTree();}
   this.groundContact((s.father.feet[0][0]+s.father.feet[1][0])/2,445,32);this.body(s.father,false);
   if(s.leaf1.owner==='ground')this.leafAtGrip([780,440]);
   this.creekBasket(s.basket.x,s.basket.y,s.basket.scale,0);
   this.arm(s.father,'near',K.blue,s.leaf1.owner==='father'?'pinch':s.time>=15.75?'hold':'relax');
   // Draw contact hands after the basket so its handle cannot cover the fingers.
   if(s.father.supporting)this.gesture(s.support,.92*s.father.scale,.02,'support');
   if(s.leaf1.owner==='father')this.leafAtGrip(s.father.near);
   if(s.leaf1.owner==='falling')this.leafAtGrip(point(s.leaf1.release,[s.basket.x-8.92,s.basket.y+1.18],s.leaf1.drop),mix(.32,.25,s.leaf1.drop));
   if(s.leaf1.owner==='basket')this.creekLeaf(s.basket.x-8,s.basket.y-3,.25,.1,K.red,0);
   if(s.leaf2.owner==='daughter')this.leafAtGrip(s.daughter.near,.36);
   if(s.leaf2.owner==='falling'){const target=[s.basket.x+7.93,s.basket.y+2.85],g=point(s.leaf2.release,target,s.leaf2.drop);this.leafAtGrip(g,mix(.36,.29,s.leaf2.drop));}
   if(s.leaf2.owner==='basket')this.creekLeaf(s.basket.x+9,s.basket.y-2,.29,.1,K.red,0);
   this.blurCtx.clearRect(0,0,1000,630);this.blurCtx.filter='blur(.65px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';
   const colors=this.ic.getImageData(0,0,1000,630).data,heights=this.blurCtx.getImageData(0,0,1000,630).data;
   this.ctx.drawImage(this.base,0,0);const regions=[this.box];if(s.daughter.visible){const x=Math.max(0,Math.floor(s.daughter.hip[0]-60*s.daughter.scale)),right=Math.min(1000,Math.ceil(s.daughter.hip[0]+95*s.daughter.scale)),y=Math.max(0,Math.floor(groundY(s.daughter.hip[0])-205*s.daughter.scale)),bottom=Math.min(630,Math.ceil(groundY(s.daughter.hip[0])+18));if(right>x)regions.push({x,y,w:right-x,h:bottom-y});}for(const region of regions){this.patch.width=region.w;this.patch.height=region.h;this.surface.render(colors,heights,this.params,this.patch.getContext('2d'),region);this.ctx.drawImage(this.patch,region.x,region.y);}this.lastRegions=regions;this.lastPose=s;this.renderStats.motionMs=performance.now()-started;return s;
  }
 }
 root.StoryMotion={sample,chapters,joint,armRig,MotionScene,duration:20};
})(typeof window!=='undefined'?window:globalThis);
