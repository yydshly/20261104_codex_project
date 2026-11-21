const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,W=640,H=640,FPS=20,COUNT=240,DURATION=COUNT/FPS,TAU=Math.PI*2,size=W*H*3;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function smooth(a,b,x){const t=clamp((x-a)/(b-a));return t*t*(3-2*t);}
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:384*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const source=ff(['-i',path.join(root,'forest-suspense-base-v15.png'),'-vf',`scale=${W}:${H}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const footAnchors=[[138,350],[501,350],[747,350],[1120,350],[136,733],[497,731],[746,733],[1120,732],[137,1151],[495,1151],[747,1154],[1121,1152]];
function loadSprites(name,type,cols=3,rows=2){
 const w=1280,h=1280,data=ff(['-i',path.join(root,name),'-vf',`scale=${w}:${h}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgba','-f','rawvideo','pipe:1']);
 let transparent=0;for(let i=3;i<data.length;i+=4)if(data[i]<5)transparent++;
 if(transparent/(w*h)<.30)throw Error(`${name} lacks transparent alpha`);
 const cells=[];
 for(let j=0;j<cols*rows;j++){
  const x0=Math.floor(j%cols*w/cols),x1=Math.floor((j%cols+1)*w/cols),y0=Math.floor(Math.floor(j/cols)*h/rows),y1=Math.floor((Math.floor(j/cols)+1)*h/rows);
  let l=x1,r=x0,t=y1,b=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*w+x)*4+3]>12){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  let ax=(l+r)/2,ay;
  if(type==='perch'){[ax,ay]=footAnchors[j];}
  else if(type==='bird'){
   let bt=y1,bb=y0;
   for(let y=y0;y<y1;y++)for(let x=Math.round(ax)-10;x<=Math.round(ax)+10;x++)if(data[(y*w+x)*4+3]>32){bt=Math.min(bt,y);bb=Math.max(bb,y);}
   ay=(bt+bb)/2;
  }else ay=t+75;
  cells.push({x0,x1,y0,y1,l,r,t,b,ax,ay,width:r-l+1});
 }
 return {data,w,h,cells,transparentFraction:transparent/(w*h)};
}
const crows=loadSprites('forest-crow-sprites-v15.png','bird'),foxes=loadSprites('forest-fox-sprites-v15.png','fox'),perches=loadSprites('forest-perch-sprites-v16.png','perch',4,3);
function shadowAtlas(sigma){
 const data=ff(['-i',path.join(root,'forest-crow-sprites-v15.png'),'-vf',`scale=1280:1280,format=rgba,colorchannelmixer=rr=0:gg=0:bb=0,gblur=sigma=${sigma}`,'-frames:v','1','-pix_fmt','rgba','-f','rawvideo','pipe:1']);
 return {...crows,data,cells:crows.cells.map(c=>({...c,l:Math.max(c.x0,c.l-60),r:Math.min(c.x1-1,c.r+60),t:Math.max(c.y0,c.t-60),b:Math.min(c.y1-1,c.b+60)}))};
}
const nearShadows=shadowAtlas(14),farShadows=shadowAtlas(40);
const foliage=new Float32Array(W*H),mask=new Float32Array(W*H),spatial=new Float32Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const p=y*W+x,i=p*3,r=source[i],g=source[i+1],b=source[i+2],lum=.2126*r+.7152*g+.0722*b,chroma=Math.max(r,g,b)-Math.min(r,g,b);
 foliage[p]=smooth(56,108,lum)*smooth(25,70,chroma);spatial[p]=TAU*(.65*x/W-.35*y/H);
}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 let v=1;for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)v=Math.min(v,foliage[clamp(y+oy,0,H-1)*W+clamp(x+ox,0,W-1)]);
 mask[y*W+x]=v*smooth(0,8,Math.min(x,y,W-1-x,H-1-y));
}
function sampleBase(x,y,ch){
 const u=clamp(x,0,W-1),v=clamp(y,0,H-1),x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(x0+1,W-1),y1=Math.min(y0+1,H-1),fx=u-x0,fy=v-y0;
 return(source[(y0*W+x0)*3+ch]*(1-fx)+source[(y0*W+x1)*3+ch]*fx)*(1-fy)+(source[(y1*W+x0)*3+ch]*(1-fx)+source[(y1*W+x1)*3+ch]*fx)*fy;
}
const cloudLight=new Float32Array(W*H),lighting=new Float32Array(size),haze=new Float32Array(W*H),pools=new Float32Array(W*H);
const material=new Float32Array(W*H),gaps=new Float32Array(W*H),rayField=new Float32Array(W*H),highlights=new Float32Array(W*H);
const waveSets=Array.from({length:8},()=>new Float32Array(W*H));
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const p=y*W+x,i=p*3,lum=.2126*source[i]+.7152*source[i+1]+.0722*source[i+2];
 material[p]=.42+.58*smooth(48,158,lum);gaps[p]=1-smooth(52,115,lum);highlights[p]=smooth(145,215,lum);
 const a=TAU*(.68*x/W+.14*y/H)+.8,b=TAU*(.17*x/W-.49*y/H)+1.6,c=TAU*(.93*x/W+.37*y/H)+2.1,d=.25*x+.19*y;
 waveSets[0][p]=Math.sin(a);waveSets[1][p]=Math.cos(a);waveSets[2][p]=Math.sin(b);waveSets[3][p]=Math.cos(b);waveSets[4][p]=Math.sin(c);waveSets[5][p]=Math.cos(c);waveSets[6][p]=Math.sin(d);waveSets[7][p]=Math.cos(d);
 const width=12+.023*y;
 rayField[p]=(.20*Math.exp(-Math.pow((x-130-.50*(y+60))/width,2))+.12*Math.exp(-Math.pow((x-218-.50*(y+60))/(width*.68),2)))*smooth(45,170,y)*(1-smooth(440,560,y));
 pools[p]=clamp(.83*Math.exp(-Math.pow((x-190)/28,2)-Math.pow((y-461)/13,2))+.96*Math.exp(-Math.pow((x-337)/31,2)-Math.pow((y-462)/13,2)));
}
function buildLight(t){
 const phase=TAU*t/DURATION,cs=Math.cos(phase),sn=Math.sin(phase),cs2=Math.cos(2*phase),sn2=Math.sin(2*phase),flutter=.65*sn,cw=Math.cos(flutter),sw=Math.sin(flutter);
 for(let p=0;p<W*H;p++){
  // Spatially different transmission values make a broad cloud shadow cross
  // the woodland, rather than changing the exposure of the entire frame.
  const cloud=.57*(waveSets[0][p]*cs-waveSets[1][p]*sn)+.28*(waveSets[2][p]*cs+waveSets[3][p]*sn)+.15*(waveSets[4][p]*cs2-waveSets[5][p]*sn2);
  const trans=.18+.82*smooth(-.34,.43,cloud);cloudLight[p]=trans;
  const speckle=.5+.5*(waveSets[6][p]*cw+waveSets[7][p]*sw),dapple=.95+.05*speckle;
  const direct=clamp(material[p]+.58*pools[p])*trans*dapple;
  const glint=.028*highlights[p]*trans*Math.pow(Math.max(0,waveSets[6][p]*cw+waveSets[7][p]*sw),8);
  const i=p*3;lighting[i]=.70+.34*direct+glint;lighting[i+1]=.76+.26*direct+.8*glint;lighting[i+2]=.86+.15*direct+.5*glint;
  haze[p]=rayField[p]*gaps[p]*trans;
 }
}
function rolloff(v){return v<=240?v:240+15*(1-Math.exp(-(v-240)/15));}
function actorLight(p,ch,type){
 const trans=cloudLight[p];
 if(type==='air')return [.87,.91,.96][ch]+[.13,.09,.04][ch]*trans;
 if(type==='ground'){const sun=.45+.55*pools[p];return [.70,.76,.86][ch]+[.34,.26,.15][ch]*trans*sun;}
 return [.76,.82,.91][ch]+[.24,.18,.09][ch]*trans;
}
function ambient(t){
 buildLight(t);const phase=TAU*t/DURATION,frame=Buffer.allocUnsafe(size);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const p=y*W+x,i=p*3,m=mask[p],s=spatial[p];
  const dx=m*.55*Math.sin(phase+s),dy=m*.24*Math.sin(phase+s+.42);
  for(let ch=0;ch<3;ch++){
   const value=m===0?source[i+ch]:sampleBase(x+dx,y+dy,ch);
   frame[i+ch]=clamp(Math.round(rolloff(value*lighting[i+ch]+haze[p]*[48,42,29][ch])),0,255);
  }
 }
 return frame;
}
function distSegment(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,q=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy));return Math.hypot(x-ax-q*dx,y-ay-q*dy);}
function foxVisibility(x,y){
 let v=smooth(117,149,x)*(1-smooth(465,502,x))*(1-smooth(476,486,y));
 // Foreground woody silhouettes remain in front of the running animal.
 v*=smooth(3.3,5.2,distSegment(x,y,246,432,261,470));
 v*=smooth(4.7,7,distSegment(x,y,390,421,391,459));
 v*=smooth(2.3,4.4,distSegment(x,y,391,459,411,468));
 const i=(clamp(Math.round(y),0,H-1)*W+clamp(Math.round(x),0,W-1))*3,lum=.2126*source[i]+.7152*source[i+1]+.0722*source[i+2];
 // Small luminous foreground leaves obscure the animal instead of being
 // overpainted by its body; dark leaf-litter remains visible below it.
 if(y<457)v*=1-.85*smooth(125,175,lum);
 return v;
}
function composite(frame,atlas,index,cx,cy,scale,angle=0,opacity=1,tint=1,visibility=null){
 const cell=atlas.cells[index],cos=Math.cos(angle),sin=Math.sin(angle),rad=Math.ceil(Math.max(Math.abs(cell.l-cell.ax),Math.abs(cell.r-cell.ax),Math.abs(cell.t-cell.ay),Math.abs(cell.b-cell.ay))*scale*Math.SQRT2+4);
 const left=Math.max(0,Math.floor(cx-rad)),right=Math.min(W-1,Math.ceil(cx+rad)),top=Math.max(0,Math.floor(cy-rad)),bottom=Math.min(H-1,Math.ceil(cy+rad));
 let painted=0;
 for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
  const dx=x-cx,dy=y-cy,u=cell.ax+(cos*dx+sin*dy)/scale,v=cell.ay+(-sin*dx+cos*dy)/scale;
  if(u<cell.l-1||u>cell.r+1||v<cell.t-1||v>cell.b+1)continue;
  const ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;let a=0,r=0,g=0,b=0;
  for(let oy=0;oy<2;oy++)for(let ox=0;ox<2;ox++){
   const xx=ix+ox,yy=iy+oy;if(xx<cell.x0||xx>=cell.x1||yy<cell.y0||yy>=cell.y1)continue;
   const p=(yy*atlas.w+xx)*4,w=(ox?fx:1-fx)*(oy?fy:1-fy)*atlas.data[p+3]/255;
   a+=w;r+=w*atlas.data[p];g+=w*atlas.data[p+1];b+=w*atlas.data[p+2];
  }
  if(a<.003)continue;const coverage=visibility?visibility(x,y):1,alpha=clamp(a*opacity*coverage);if(alpha<.003)continue;
  const pixel=y*W+x,p=pixel*3,channels=[r/a,g/a,b/a],kind=atlas===foxes?'ground':atlas===crows?'air':'canopy';
  for(let ch=0;ch<3;ch++)frame[p+ch]=clamp(Math.round(frame[p+ch]*(1-alpha)+rolloff(channels[ch]*tint*actorLight(pixel,ch,kind))*alpha),0,255);painted+=alpha;
 }
 return painted;
}
const birds=[
 {start:1.88,duration:2.60,foot:[108,137],view:1,height:25,p1:[222,82],p2:[490,-110],size:49,seed:.3},
 {start:2.08,duration:2.80,foot:[440,186],view:0,height:25,p1:[323,92],p2:[100,-110],size:51,seed:1.1},
 {start:2.26,duration:2.70,foot:[534,296],view:2,height:28,p1:[535,118],p2:[515,-130],size:46,seed:2.8},
 {start:2.20,duration:2.80,foot:[122,331],view:3,height:27,p1:[180,408],p2:[400,760],size:50,seed:.9},
 {start:2.00,duration:2.60,foot:[225,280],view:2,height:23,p1:[152,182],p2:[-120,30],size:43,seed:4.2},
 {start:2.42,duration:2.70,foot:[239,437],view:0,height:29,p1:[152,365],p2:[-115,255],size:49,seed:1.7},
 {start:2.50,duration:2.90,foot:[381,395],view:1,height:27,p1:[500,320],p2:[760,165],size:47,seed:3.3}
];
for(let i=0;i<birds.length;i++){
 const bird=birds[i];bird.p0=[bird.foot[0],bird.foot[1]-bird.height*.52];
 bird.perchScale=bird.height/(perches.cells[bird.view].ay-perches.cells[bird.view].t);
 bird.returnStart=7.20+i*.11;bird.returnDuration=2.1+(i%3)*.15;
}
function bezier(a,b,c,q){const r=1-q;return [r*r*a[0]+2*r*q*b[0]+q*q*c[0],r*r*a[1]+2*r*q*b[1]+q*q*c[1]];}
function flight(frame,bird,age,inbound=false){
 const duration=inbound?bird.returnDuration:bird.duration,q=Math.pow(clamp(age/duration),inbound?.82:1.12);
 const a=inbound?bird.p2:bird.p0,c=inbound?bird.p0:bird.p2,b=inbound?[bird.p1[0]+30,bird.p1[1]-30]:bird.p1,[cx,cy]=bezier(a,b,c,q);
 const vx=2*(1-q)*(b[0]-a[0])+2*q*(c[0]-b[0]),vy=2*(1-q)*(b[1]-a[1])+2*q*(c[1]-b[1]),angle=Math.atan2(vy,vx)+Math.PI/2;
 const near=inbound?1-q:q,pose=Math.floor((age*(3.6-.3*near)+bird.seed)*6)%6,scale=bird.size*(.64+.70*near)/400;
 const blend=inbound?smooth(duration-.25,duration-.10,age):1-smooth(.10,.28,age);
 let painted=composite(frame,crows,pose,cx,cy,scale,angle,1-blend,.88);
 if(blend>0){
  const stage=inbound&&age>duration-.07?4:8;
  painted+=composite(frame,perches,bird.view+stage,bird.foot[0]+cx-bird.p0[0],bird.foot[1]+cy-bird.p0[1],bird.perchScale,0,blend,.89);
 }
 return painted;
}
function castFlightShadows(frame,t){
 let total=0;
 for(const bird of birds){
  let age,inbound=false;
  if(t>=bird.start&&t<bird.start+bird.duration)age=t-bird.start;
  else if(t>=bird.returnStart&&t<bird.returnStart+bird.returnDuration){age=t-bird.returnStart;inbound=true;}
  else continue;
  const duration=inbound?bird.returnDuration:bird.duration,q=Math.pow(clamp(age/duration),inbound?.82:1.12),a=inbound?bird.p2:bird.p0,c=inbound?bird.p0:bird.p2,b=inbound?[bird.p1[0]+30,bird.p1[1]-30]:bird.p1,[cx,cy]=bezier(a,b,c,q);
  const vx=2*(1-q)*(b[0]-a[0])+2*q*(c[0]-b[0]),vy=2*(1-q)*(b[1]-a[1])+2*q*(c[1]-b[1]),angle=Math.atan2(vy,vx)+Math.PI/2,near=inbound?1-q:q;
  const pose=Math.floor((age*(3.6-.3*near)+bird.seed)*6)%6,scale=bird.size*(.64+.70*near)/400,altitude=inbound?smooth(0,.9,duration-age):smooth(0,.9,age),offset=5+26*altitude;
  const x=cx+.68*offset,y=cy+offset,opacity=.17*(1-.5*altitude);
  const receiver=(xx,yy)=>{const p=yy*W+xx;return cloudLight[p]*(.18+.82*material[p]);};
  total+=composite(frame,nearShadows,pose,x,y,scale,angle,opacity*(1-altitude),0,receiver);
  total+=composite(frame,farShadows,pose,x,y,scale,angle,opacity*altitude,0,receiver);
 }
 return total;
}
function render(t,stats={}){
 const frame=ambient(t);stats.foxPixels=0;stats.birds=0;stats.birdPixels=0;stats.perched=0;stats.airborne=0;
 stats.projectedBirdShadowPixels=castFlightShadows(frame,t);
 if(t>=1.28&&t<=2.96){
  const q=(t-1.28)/1.68,cx=116+388*q,foot=470-3*Math.sin(q*Math.PI),cy=foot-15+1.15*Math.sin(TAU*(t-1.28)*3.65),pose=Math.floor((t-1.28)*3.65*6)%6;
  // A low, soft contact shadow stays on the forest floor.
  for(let y=Math.floor(foot-2);y<=Math.ceil(foot+3);y++)for(let x=Math.floor(cx-23);x<=Math.ceil(cx+23);x++){
   if(x<0||x>=W||y<0||y>=H)continue;const a=.23*Math.exp(-Math.pow((x-cx)/20,2)-Math.pow((y-foot)/2.1,2))*foxVisibility(x,y),p=(y*W+x)*3;
   for(let ch=0;ch<3;ch++)frame[p+ch]=Math.round(frame[p+ch]*(1-a));
  }
  stats.foxPixels=composite(frame,foxes,pose,cx,cy,92/400,0,.98,.98,foxVisibility);
 }
 for(const bird of birds){
  let painted=0;
  if(t<bird.start||t>=bird.returnStart+bird.returnDuration){
   const stage=t>=bird.start-.18&&t<bird.start?4:0;
   painted=composite(frame,perches,bird.view+stage,bird.foot[0],bird.foot[1],bird.perchScale,0,1,.89);stats.perched++;
  }else if(t<bird.start+bird.duration){painted=flight(frame,bird,t-bird.start);if(painted>1)stats.airborne++;}
  else if(t>=bird.returnStart){painted=flight(frame,bird,t-bird.returnStart,true);if(painted>1)stats.airborne++;}
  if(painted>1){stats.birds++;stats.birdPixels+=painted;}
 }
 return frame;
}
if(process.argv.includes('--preview')){
 for(const [label,t] of [['light-a',0],['light-b',3],['light-c',6]])ff(['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-i','pipe:0','-frames:v','1',path.join(root,`forest-${label}-v17.png`)],render(t));
 console.log(JSON.stringify(birds.map(b=>({foot:b.foot,view:b.view,height:b.height,start:b.start,returnEnd:b.returnStart+b.returnDuration})),null,2));process.exit(0);
}
const frames=Buffer.allocUnsafe(size*COUNT),timeline=[];
for(let i=0;i<COUNT;i++){const s={time:i/FPS};render(i/FPS,s).copy(frames,i*size);timeline.push(s);if(i%40===0)console.log(`Rendered ${i}/${COUNT}`);}
const input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0'],gif=path.join(root,'forest-light-shadow-v17.gif'),mp4=path.join(root,'forest-light-shadow-v17.mp4');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],frames);
ff(['-i',mp4,'-vf',"select='eq(n,0)+eq(n,33)+eq(n,60)+eq(n,120)+eq(n,178)+eq(n,220)',scale=320:320,tile=3x2",'-frames:v','1',path.join(root,'forest-light-contact-v17.jpg')]);
ff(['-i',mp4,'-vf',"select='eq(n,0)'",'-frames:v','1',path.join(root,'forest-light-first-v17.png')]);
function mae(a,b){let sum=0;for(let i=0;i<size;i++)sum+=Math.abs(a[i]-b[i]);return sum/size;}
const decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size,at=i=>decoded.subarray(i*size,(i+1)*size);let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
const bytes=fs.readFileSync(gif),idx=bytes.indexOf('NETSCAPE2.0'),endpointStats={};
const metrics={width:W,height:H,fps:FPS,frames:count,seconds:DURATION,loopCount:idx<0?null:bytes.readUInt16LE(idx+13),endpointMAE:mae(frames.subarray(0,size),render(DURATION,endpointStats)),decodedSeamMAE:mae(at(count-1),at(0)),decodedMeanAdjacentMAE:adjacent/(count-1),maxVisibleBirds:Math.max(...timeline.map(t=>t.birds)),maxAirborneBirds:Math.max(...timeline.map(t=>t.airborne)),initialPerchedBirds:timeline[0].perched,perchContacts:birds.map(b=>({foot:b.foot,view:b.view})),maxFoxOpaqueEquivalentPixels:Math.max(...timeline.map(t=>t.foxPixels)),foxVisibleFrames:timeline.filter(t=>t.foxPixels>5).length,maxProjectedBirdShadowPixels:Math.max(...timeline.map(t=>t.projectedBirdShadowPixels)),endpointEvents:endpointStats,alpha:{crowTransparentFraction:crows.transparentFraction,perchTransparentFraction:perches.transparentFraction,foxTransparentFraction:foxes.transparentFraction},gifBytes:bytes.length};
metrics.seamRatio=metrics.decodedSeamMAE/metrics.decodedMeanAdjacentMAE;
const lightA=ambient(0),lightB=ambient(3);metrics.lightingOnlyQuarterCycleMAE=mae(lightA,lightB);
fs.writeFileSync(path.join(root,'forest-light-validation-v17.json'),JSON.stringify(metrics,null,2));fs.writeFileSync(path.join(root,'forest-light-timeline-v17.json'),JSON.stringify(timeline,null,2));console.log(JSON.stringify(metrics,null,2));
if(count!==COUNT||metrics.loopCount!==0||metrics.endpointMAE>.001||metrics.seamRatio>1.7||metrics.maxAirborneBirds<6||metrics.initialPerchedBirds!==7||metrics.foxVisibleFrames<15||endpointStats.perched!==7||endpointStats.airborne!==0||endpointStats.foxPixels!==0||metrics.maxProjectedBirdShadowPixels<=0||metrics.lightingOnlyQuarterCycleMAE<3)throw Error('Light-and-shadow loop validation failed');
