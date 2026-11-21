const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,N=1024,W=704,H=396,FPS=20,COUNT=128,TAU=Math.PI*2,size=W*H*3;
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:256*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const source=ff(['-i',path.join(root,'autumn-canopy-native-v13.png'),'-vf',`scale=${N}:${N}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
function fft(re,im,inverse=false){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
  for(let len=2;len<=n;len<<=1){
    const angle=(inverse?TAU:-TAU)/len,cr=Math.cos(angle),ci=Math.sin(angle);
    for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){
      const a=i+j,b=a+len/2,tr=wr*re[b]-wi*im[b],ti=wr*im[b]+wi*re[b];
      re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;
      const next=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=next;
    }}
  }
  if(inverse)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}
}
function fft2(re,im,inverse=false){
  const rr=new Float64Array(N),ii=new Float64Array(N);
  for(let y=0;y<N;y++){rr.set(re.subarray(y*N,(y+1)*N));ii.set(im.subarray(y*N,(y+1)*N));fft(rr,ii,inverse);re.set(rr,y*N);im.set(ii,y*N);}
  for(let x=0;x<N;x++){for(let y=0;y<N;y++){rr[y]=re[y*N+x];ii[y]=im[y*N+x];}fft(rr,ii,inverse);for(let y=0;y<N;y++){re[y*N+x]=rr[y];im[y*N+x]=ii[y];}}
}
// Periodic-plus-smooth boundary correction preserves the native texture while
// avoiding a visible reset where its opposite edges meet during global flow.
const texture=new Float32Array(N*N*3);
for(let ch=0;ch<3;ch++){
  const re=new Float64Array(N*N),im=new Float64Array(N*N);
  for(let y=0;y<N;y++){const d=source[(y*N+N-1)*3+ch]-source[y*N*3+ch];re[y*N]+=d;re[y*N+N-1]-=d;}
  for(let x=0;x<N;x++){const d=source[((N-1)*N+x)*3+ch]-source[x*3+ch];re[x]+=d;re[(N-1)*N+x]-=d;}
  fft2(re,im);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const p=y*N+x,den=2*Math.cos(TAU*x/N)+2*Math.cos(TAU*y/N)-4;
    if(p===0){re[p]=0;im[p]=0;}else{re[p]/=den;im[p]/=den;}
  }
  fft2(re,im,true);
  for(let p=0;p<N*N;p++)texture[p*3+ch]=Math.max(0,Math.min(255,source[p*3+ch]-re[p]));
}
function wrap(v){return((v%N)+N)%N;}
function coordinates(x,y,phase){
  const xx=x*1.48+128*Math.cos(phase),yy=y*1.48+96*Math.sin(phase);
  // A closed, continuous whole-field orbit with gentle composed shears.
  // The low spatial gradients keep branches and leaves recognizable.
  const u1=xx+48*Math.sin(TAU*yy/N+phase);
  const v1=yy+36*Math.sin(TAU*u1/N-phase);
  const u=u1+24*Math.sin(TAU*v1/N+phase);
  const v=v1+16*Math.sin(TAU*u/N+2*phase);
  return{u:wrap(u),v:wrap(v)};
}
function render(phase){
  const frame=Buffer.allocUnsafe(size);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const {u,v}=coordinates(x,y,phase),x0=Math.floor(u),y0=Math.floor(v),x1=(x0+1)%N,y1=(y0+1)%N,fx=u-x0,fy=v-y0;
    const a=(y0*N+x0)*3,b=(y0*N+x1)*3,c=(y1*N+x0)*3,d=(y1*N+x1)*3,p=(y*W+x)*3;
    const light=0.99+0.018*Math.sin(TAU*(u+v)/N+phase);
    for(let ch=0;ch<3;ch++)frame[p+ch]=Math.max(0,Math.min(255,Math.round(((texture[a+ch]*(1-fx)+texture[b+ch]*fx)*(1-fy)+(texture[c+ch]*(1-fx)+texture[d+ch]*fx)*fy)*light)));
  }
  return frame;
}
const frames=Buffer.allocUnsafe(size*COUNT);
for(let i=0;i<COUNT;i++){render(TAU*i/COUNT).copy(frames,i*size);if(i%24===0)console.log(`Rendered ${i}/${COUNT}`);}
const input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0'];
const gif=path.join(root,'autumn-canopy-whole-v13.gif'),mp4=path.join(root,'autumn-canopy-whole-v13.mp4');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],frames);
ff(['-i',mp4,'-vf',"select='eq(n,0)+eq(n,32)+eq(n,64)+eq(n,96)',scale=352:198,tile=2x2",'-frames:v','1',path.join(root,'autumn-canopy-contact-v13.jpg')]);
function mae(a,b){let s=0;for(let i=0;i<size;i++)s+=Math.abs(a[i]-b[i]);return s/size;}
const decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size,at=i=>decoded.subarray(i*size,(i+1)*size);
let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
const activity=[];let globallyChanged=0;
const first=frames.subarray(0,size),quarter=frames.subarray((COUNT/4)*size,(COUNT/4+1)*size);
for(let gy=0;gy<3;gy++)for(let gx=0;gx<3;gx++){
  let sum=0,pixels=0,changed=0;
  for(let y=Math.floor(gy*H/3);y<Math.floor((gy+1)*H/3);y++)for(let x=Math.floor(gx*W/3);x<Math.floor((gx+1)*W/3);x++){
    const p=(y*W+x)*3,d=(Math.abs(first[p]-quarter[p])+Math.abs(first[p+1]-quarter[p+1])+Math.abs(first[p+2]-quarter[p+2]))/3;
    sum+=d;pixels++;if(d>8){changed++;globallyChanged++;}
  }
  activity.push({row:gy+1,column:gx+1,meanRGBDifference:sum/pixels,changedPixelFraction:changed/pixels});
}
const bytes=fs.readFileSync(gif),idx=bytes.indexOf('NETSCAPE2.0');
const metrics={width:W,height:H,fps:FPS,frames:count,seconds:COUNT/FPS,loopCount:bytes.readUInt16LE(idx+13),endpointMAE:mae(first,render(TAU)),decodedSeamMAE:mae(at(count-1),at(0)),decodedMeanAdjacentMAE:adjacent/(count-1),wholeFrameChangedFraction:globallyChanged/(W*H),nineRegionActivity:activity,gifBytes:bytes.length};
metrics.seamRatio=metrics.decodedSeamMAE/metrics.decodedMeanAdjacentMAE;
fs.writeFileSync(path.join(root,'autumn-canopy-validation-v13.json'),JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics,null,2));
if(count!==COUNT||metrics.loopCount!==0||metrics.endpointMAE>0.001||metrics.seamRatio>1.7||activity.some(r=>r.changedPixelFraction<0.75))throw Error('Global-motion loop validation failed');
