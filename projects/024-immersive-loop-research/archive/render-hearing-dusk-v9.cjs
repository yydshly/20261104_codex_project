const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,W=640,H=640,FPS=25,COUNT=120,TAU=Math.PI*2,size=W*H*3;
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:256*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const base=ff(['-i',path.join(root,'dusk-base-v9.png'),'-vf',`scale=${W}:${H}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const assetFile=path.join(root,'dusk-notes-v9.png');
const probe=cp.spawnSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',assetFile],{encoding:'utf8'});
const dims=JSON.parse(probe.stdout).streams[0],sw=dims.width,sh=dims.height;
const rgba=ff(['-i',assetFile,'-frames:v','1','-pix_fmt','rgba','-f','rawvideo','pipe:1']);
const sprites=[];
for(let n=0;n<4;n++){
  const l=(n%2)*Math.floor(sw/2),t=Math.floor(n/2)*Math.floor(sh/2),r=l+Math.floor(sw/2),b=t+Math.floor(sh/2);
  let minX=r,minY=b,maxX=l,maxY=t;
  for(let y=t;y<b;y++)for(let x=l;x<r;x++)if(rgba[(y*sw+x)*4+3]>96){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  minX=Math.max(l,minX-3);minY=Math.max(t,minY-3);maxX=Math.min(r-1,maxX+3);maxY=Math.min(b-1,maxY+3);
  const cw=maxX-minX+1,ch=maxY-minY+1,hh=160,ww=Math.max(8,Math.round(cw/ch*hh));
  if(cw<20||ch<20)throw Error('Missing paper cutout');
  const bytes=ff(['-i',assetFile,'-vf',`crop=${cw}:${ch}:${minX}:${minY},scale=${ww}:${hh}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgba','-f','rawvideo','pipe:1']);
  const premul=new Float32Array(ww*hh*4);
  for(let i=0;i<ww*hh;i++){
    const p=i*4,a=bytes[p+3]<12?0:bytes[p+3]/255;
    premul[p]=bytes[p]*a;premul[p+1]=bytes[p+1]*a;premul[p+2]=bytes[p+2]*a;premul[p+3]=a;
  }
  sprites.push({w:ww,h:hh,pixels:premul});
}
const notes=[
  {sprite:0,offset:0.10,rx:147,ry:53,cx:321,cy:207,height:48,roll:-0.13},
  {sprite:1,offset:0.72,rx:144,ry:57,cx:318,cy:202,height:49,roll:0.10},
  {sprite:2,offset:2.05,rx:157,ry:56,cx:315,cy:215,height:43,roll:0.09},
  {sprite:3,offset:3.42,rx:150,ry:64,cx:310,cy:205,height:46,roll:-0.06},
  {sprite:0,offset:4.40,rx:139,ry:55,cx:320,cy:213,height:39,roll:0.19}
];
let seed=2026111209;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const dust=Array.from({length:52},()=>({x:125+random()*350,y:110+random()*210,r:0.35+0.50*random(),phase:random()*TAU,k:1+Math.floor(random()*3),energy:0.15+0.6*random()}));
function state(note,phase){
  const t=phase+note.offset,depth=Math.sin(t);
  return {sprite:note.sprite,x:note.cx+note.rx*Math.cos(t)+8*Math.sin(2*t),y:note.cy+note.ry*Math.sin(t)+5*Math.sin(2*t+0.4),height:note.height*(0.90+0.14*depth),widthFactor:0.94+0.06*Math.cos(t+0.3),angle:note.roll+0.15*Math.sin(t+0.7)+0.035*Math.sin(2*t),depth,gain:0.91+0.07*depth};
}
function drawSprite(frame,s){
  const sp=sprites[s.sprite],sy=s.height/sp.h,sx=sy*s.widthFactor,c=Math.cos(s.angle),sn=Math.sin(s.angle);
  const ex=Math.ceil((Math.abs(c)*sp.w*sx+Math.abs(sn)*sp.h*sy)/2)+2;
  const ey=Math.ceil((Math.abs(sn)*sp.w*sx+Math.abs(c)*sp.h*sy)/2)+2;
  for(let y=Math.max(0,Math.floor(s.y-ey));y<=Math.min(H-1,Math.ceil(s.y+ey));y++)for(let x=Math.max(0,Math.floor(s.x-ex));x<=Math.min(W-1,Math.ceil(s.x+ex));x++){
    const dx=x-s.x,dy=y-s.y,u=(c*dx+sn*dy)/sx+sp.w/2,v=(-sn*dx+c*dy)/sy+sp.h/2;
    if(u<0||v<0||u>=sp.w-1||v>=sp.h-1)continue;
    const x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0;
    const a=(y0*sp.w+x0)*4,b=a+4,cc=a+sp.w*4,d=cc+4,p=(y*W+x)*3;
    const sample=ch=>(sp.pixels[a+ch]*(1-fx)+sp.pixels[b+ch]*fx)*(1-fy)+(sp.pixels[cc+ch]*(1-fx)+sp.pixels[d+ch]*fx)*fy;
    const alpha=sample(3);if(alpha<0.008)continue;
    for(let ch=0;ch<3;ch++)frame[p+ch]=Math.min(255,Math.round(sample(ch)*s.gain+frame[p+ch]*(1-alpha)));
  }
}
function softPoint(frame,x,y,r,energy){
  const ex=Math.ceil(r*4);
  for(let py=Math.max(0,Math.floor(y-ex));py<=Math.min(H-1,Math.ceil(y+ex));py++)for(let px=Math.max(0,Math.floor(x-ex));px<=Math.min(W-1,Math.ceil(x+ex));px++){
    const d2=(px-x)**2+(py-y)**2,p=(py*W+px)*3;
    const q=energy*(90*Math.exp(-d2/(r*r))+12*Math.exp(-d2/(r*r*5)));
    frame[p]=Math.min(255,frame[p]+q);frame[p+1]=Math.min(255,frame[p+1]+q*0.70);frame[p+2]=Math.min(255,frame[p+2]+q*0.38);
  }
}
function render(phase){
  const frame=Buffer.from(base),states=notes.map(n=>state(n,phase)).sort((a,b)=>a.depth-b.depth);
  // Soft distant shadows relate the levitating paper to the physical record.
  for(const s of states){
    const cx=s.x+12,cy=367+0.18*(s.y-205),rx=12+s.height*0.12,ry=4.5;
    for(let y=Math.max(0,Math.floor(cy-12));y<=Math.min(H-1,Math.ceil(cy+12));y++)for(let x=Math.max(0,Math.floor(cx-3*rx));x<=Math.min(W-1,Math.ceil(cx+3*rx));x++){
      const attenuation=1-0.055*Math.exp(-Math.pow((x-cx)/rx,2)-Math.pow((y-cy)/ry,2)),p=(y*W+x)*3;
      frame[p]=Math.round(frame[p]*attenuation);frame[p+1]=Math.round(frame[p+1]*attenuation);frame[p+2]=Math.round(frame[p+2]*attenuation);
    }
  }
  for(const p of dust){const pulse=0.25+0.75*(0.5+0.5*Math.cos(p.k*phase+p.phase))**3;softPoint(frame,p.x+2*Math.sin(phase+p.phase),p.y+2.7*Math.cos(phase+p.phase),p.r,p.energy*pulse);}
  for(const s of states)drawSprite(frame,s);
  return frame;
}
const frames=Buffer.allocUnsafe(size*COUNT);
for(let i=0;i<COUNT;i++){render(TAU*i/COUNT).copy(frames,i*size);if(i%30===0)console.log(`Rendered ${i}/${COUNT}`);}
const input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0'];
const gif=path.join(root,'hearing-dusk-v9.gif'),mp4=path.join(root,'hearing-dusk-v9.mp4');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],frames);
ff(['-i',gif,'-vf',"select='eq(n,0)+eq(n,30)+eq(n,60)+eq(n,90)',scale=320:320,tile=2x2",'-frames:v','1',path.join(root,'dusk-contact-v9.jpg')]);
ff(['-i',gif,'-frames:v','1',path.join(root,'dusk-first-v9.png')]);
function mae(a,b){let s=0;for(let j=0;j<size;j++)s+=Math.abs(a[j]-b[j]);return s/size;}
const decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size,at=i=>decoded.subarray(i*size,(i+1)*size);
let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
const b=fs.readFileSync(gif),idx=b.indexOf('NETSCAPE2.0');
const metrics={width:W,height:H,fps:FPS,frames:count,seconds:COUNT/FPS,nativePaperSprites:sprites.length,animatedNotes:notes.length,loopCount:b.readUInt16LE(idx+13),endpointMAE:mae(frames.subarray(0,size),render(TAU)),decodedSeamMAE:mae(at(count-1),at(0)),decodedMeanAdjacentMAE:adjacent/(count-1),gifBytes:b.length};
metrics.seamRatio=metrics.decodedSeamMAE/metrics.decodedMeanAdjacentMAE;
fs.writeFileSync(path.join(root,'dusk-validation-v9.json'),JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics,null,2));
if(count!==COUNT||metrics.loopCount!==0||metrics.endpointMAE>0.001||metrics.seamRatio>1.7)throw Error('Loop validation failed');
