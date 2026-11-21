const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,W=640,H=640,FPS=20,COUNT=128,TAU=Math.PI*2,size=W*H*3;
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:384*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const source=ff(['-i',path.join(root,'autumn-canopy-native-v13.png'),'-vf',`scale=${W}:${H}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function smooth(a,b,x){const t=clamp((x-a)/(b-a));return t*t*(3-2*t);}
const foliage=new Float32Array(W*H),mask=new Float32Array(W*H),spatial=new Float32Array(W*H);
// Dark wood and low-chroma pale birch branches remain at their exact source
// coordinates. Motion is restricted to saturated, illuminated leaf surfaces.
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const p=y*W+x,i=p*3,r=source[i],g=source[i+1],b=source[i+2];
 const lum=.2126*r+.7152*g+.0722*b,chroma=Math.max(r,g,b)-Math.min(r,g,b);
 foliage[p]=smooth(56,108,lum)*smooth(25,70,chroma);
 spatial[p]=TAU*(.65*x/W-.35*y/H);
}
// Conservative erosion prevents moving leaf sampling from pulling stationary
// branch pixels into nearby foliage. Frame boundaries are also pinned.
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 let v=1;
 for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
  const xx=clamp(x+ox,0,W-1),yy=clamp(y+oy,0,H-1);v=Math.min(v,foliage[yy*W+xx]);
 }
 mask[y*W+x]=v*smooth(0,8,Math.min(x,y,W-1-x,H-1-y));
}
function motion(x,y,phase){
 const p=y*W+x,s=spatial[p],m=mask[p];
 // One coherent travelling breeze; shorter-period terms give the leaves a
 // slight flutter. There is no camera movement or global coordinate warp.
 return {dx:m*(1.75*Math.sin(phase+s)+.35*Math.sin(2*phase+1.7*s)),dy:m*(.75*Math.sin(phase+s+.42)+.20*Math.sin(3*phase-1.3*s))};
}
function sample(x,y,ch){
 const u=clamp(x,0,W-1),v=clamp(y,0,H-1),x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(x0+1,W-1),y1=Math.min(y0+1,H-1),fx=u-x0,fy=v-y0;
 return (source[(y0*W+x0)*3+ch]*(1-fx)+source[(y0*W+x1)*3+ch]*fx)*(1-fy)+(source[(y1*W+x0)*3+ch]*(1-fx)+source[(y1*W+x1)*3+ch]*fx)*fy;
}
function render(phase){
 const frame=Buffer.allocUnsafe(size);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const p=y*W+x,i=p*3,m=mask[p],s=spatial[p],{dx,dy}=motion(x,y,phase);
  if(m===0){frame[i]=source[i];frame[i+1]=source[i+1];frame[i+2]=source[i+2];continue;}
  const light=1+m*(.042*Math.sin(phase+s+.75)+.012*Math.sin(2*phase+2*s));
  for(let ch=0;ch<3;ch++)frame[i+ch]=clamp(Math.round(sample(x+dx,y+dy,ch)*light),0,255);
 }
 return frame;
}
const frames=Buffer.allocUnsafe(size*COUNT);
for(let i=0;i<COUNT;i++){render(TAU*i/COUNT).copy(frames,i*size);if(i%32===0)console.log(`Rendered ${i}/${COUNT}`);}
const input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0'];
const gif=path.join(root,'autumn-breeze-anchored-v14.gif'),mp4=path.join(root,'autumn-breeze-anchored-v14.mp4');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],frames);
ff(['-i',mp4,'-vf',"select='eq(n,0)+eq(n,32)+eq(n,64)+eq(n,96)',scale=320:320,tile=2x2",'-frames:v','1',path.join(root,'autumn-breeze-contact-v14.jpg')]);
function mae(a,b){let sum=0;for(let i=0;i<size;i++)sum+=Math.abs(a[i]-b[i]);return sum/size;}
const first=frames.subarray(0,size),quarter=frames.subarray(32*size,33*size),decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size,at=i=>decoded.subarray(i*size,(i+1)*size);
let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
let pinned=0,pinnedErrors=0,maxDisplacement=0;const regions=[];
for(let gy=0;gy<3;gy++)for(let gx=0;gx<3;gx++){
 let sum=0,active=0,pixels=0;
 for(let y=Math.floor(gy*H/3);y<Math.floor((gy+1)*H/3);y++)for(let x=Math.floor(gx*W/3);x<Math.floor((gx+1)*W/3);x++){
  const p=y*W+x,i=p*3,d=(Math.abs(first[i]-quarter[i])+Math.abs(first[i+1]-quarter[i+1])+Math.abs(first[i+2]-quarter[i+2]))/3;
  sum+=d;pixels++;if(d>1)active++;
  if(mask[p]===0){pinned++;for(let ch=0;ch<3;ch++)if(first[i+ch]!==quarter[i+ch])pinnedErrors++;}
  for(let t=0;t<16;t++){const {dx,dy}=motion(x,y,t*TAU/16);maxDisplacement=Math.max(maxDisplacement,Math.hypot(dx,dy));}
 }
 regions.push({row:gy+1,column:gx+1,meanRGBDifference:sum/pixels,activePixelFraction:active/pixels});
}
const bytes=fs.readFileSync(gif),idx=bytes.indexOf('NETSCAPE2.0');
const metrics={width:W,height:H,frames:count,fps:FPS,seconds:COUNT/FPS,loopCount:idx<0?null:bytes.readUInt16LE(idx+13),endpointMAE:mae(first,render(TAU)),decodedSeamMAE:mae(at(count-1),at(0)),decodedMeanAdjacentMAE:adjacent/(count-1),cameraTranslationPixels:0,globalShear:0,protectedStationaryPixelCount:pinned,protectedStationaryPixelErrors:pinnedErrors,maximumSampledLeafDisplacementPixels:maxDisplacement,nineRegionActivity:regions,gifBytes:bytes.length};
metrics.seamRatio=metrics.decodedSeamMAE/metrics.decodedMeanAdjacentMAE;
fs.writeFileSync(path.join(root,'autumn-breeze-validation-v14.json'),JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics,null,2));
if(count!==COUNT||metrics.loopCount!==0||metrics.endpointMAE>.001||metrics.seamRatio>1.7||pinnedErrors!==0||maxDisplacement>3||regions.some(r=>r.activePixelFraction<.08))throw Error('Anchored breeze validation failed');
