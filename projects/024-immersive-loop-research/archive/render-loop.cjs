const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const out = __dirname;
const W = 640, H = 640, FPS = 20, COUNT = 80;
function ff(args, input) {
  const r = cp.spawnSync('ffmpeg', ['-hide_banner','-loglevel','error','-y',...args], { input, maxBuffer: 128*1024*1024 });
  if(r.status !== 0) throw new Error(String(r.stderr));
  return r.stdout;
}
const still = ff(['-i',path.join(out,'garden-base.png'),'-vf',`scale=${W}:${H}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const size=W*H*3, field=new Float32Array(W*H*4);
for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
  const i=(y*W+x)*4;
  const corridor=1-0.84*Math.exp(-Math.pow((x/W-0.59)/0.17,2));
  const anchored=Math.pow(Math.sin(Math.PI*y/(H-1)),0.9);
  const m=corridor*anchored;
  const spatial=x/155+y/235;
  field[i]=3.3*m*Math.cos(spatial);
  field[i+1]=3.3*m*Math.sin(spatial);
  field[i+2]=0.65*m*Math.sin(x/108-y/175);
  field[i+3]=0.65*m*Math.cos(x/108-y/175);
}
let rng=20261112;
function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;}
const lights=Array.from({length:66},()=>({x:W*(0.09+0.82*random()),y:H*(0.12+0.61*random()),r:0.55+0.75*random(),phase:random()*Math.PI*2,k:random()>0.73?2:1,drift:1+3*random(),strength:0.40+0.60*random()}));
function render(phase){
  const frame=Buffer.allocUnsafe(size);
  const sn=Math.sin(phase),cs=Math.cos(phase),sn2=Math.sin(2*phase),cs2=Math.cos(2*phase);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const fi=(y*W+x)*4;
    let xx=x+field[fi]*sn+field[fi+1]*cs;
    let yy=y+field[fi+2]*sn2+field[fi+3]*cs2;
    xx=Math.max(0,Math.min(W-1.001,xx));yy=Math.max(0,Math.min(H-1.001,yy));
    const x0=Math.floor(xx),y0=Math.floor(yy),fx=xx-x0,fy=yy-y0;
    const a=(y0*W+x0)*3,b=a+3,c=a+W*3,d=c+3,p=(y*W+x)*3;
    const local=1+0.012*sn*(1-y/H);
    for(let ch=0;ch<3;ch++)frame[p+ch]=Math.min(255,Math.max(0,Math.round(((still[a+ch]*(1-fx)+still[b+ch]*fx)*(1-fy)+(still[c+ch]*(1-fx)+still[d+ch]*fx)*fy)*local)));
  }
  for(const light of lights){
    const lx=light.x+light.drift*Math.sin(phase+light.phase),ly=light.y+2*Math.cos(phase+light.phase);
    const intensity=(0.035+0.965*Math.pow((1+Math.cos(light.k*phase+light.phase))/2,4))*light.strength;
    const range=Math.ceil(light.r*4);
    for(let y=Math.max(0,Math.floor(ly-range));y<=Math.min(H-1,Math.ceil(ly+range));y++)for(let x=Math.max(0,Math.floor(lx-range));x<=Math.min(W-1,Math.ceil(lx+range));x++){
      const dist=(x-lx)**2+(y-ly)**2;
      const glow=(Math.exp(-dist/(light.r*light.r*0.75))*155+Math.exp(-dist/(light.r*light.r*6))*29)*intensity;
      const p=(y*W+x)*3;
      frame[p]=Math.min(255,frame[p]+glow);frame[p+1]=Math.min(255,frame[p+1]+glow*0.77);frame[p+2]=Math.min(255,frame[p+2]+glow*0.38);
    }
  }
  return frame;
}
const frames=Buffer.allocUnsafe(size*COUNT);
for(let f=0;f<COUNT;f++){render(2*Math.PI*f/COUNT).copy(frames,f*size);if(f%20===0)process.stdout.write(`Rendered ${f}/${COUNT}\n`);}
const mp4=path.join(out,'garden-loop.mp4');
ff(['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff(['-i',mp4,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(out,'garden-loop.gif')]);
ff(['-i',mp4,'-vf',"select='eq(n,0)+eq(n,20)+eq(n,40)+eq(n,60)',scale=320:320,tile=4x1",'-frames:v','1',path.join(out,'contact-sheet.jpg')]);
function mae(a,b){let s=0;for(let i=0;i<size;i++)s+=Math.abs(a[i]-b[i]);return s/size;}
const first=frames.subarray(0,size),last=frames.subarray(size*(COUNT-1));
let consecutive=0;for(let f=1;f<COUNT;f++)consecutive+=mae(frames.subarray((f-1)*size,f*size),frames.subarray(f*size,(f+1)*size));
const metrics={frames:COUNT,fps:FPS,durationSeconds:COUNT/FPS,periodicEndpointMAE:mae(first,render(2*Math.PI)),seamMAE:mae(first,last),meanConsecutiveMAE:consecutive/(COUNT-1),motionAcrossHalfCycleMAE:mae(first,frames.subarray(size*40,size*41)),gifBytes:fs.statSync(path.join(out,'garden-loop.gif')).size};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(metrics,null,2));
console.log(JSON.stringify(metrics,null,2));
