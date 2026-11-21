const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,W=560,H=560,size=W*H*3,FPS='100/7';
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:128*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const sheet=path.join(root,'sea-native-sheet-v10.png');
const probe=cp.spawnSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',sheet],{encoding:'utf8'});
const dims=JSON.parse(probe.stdout).streams[0];
const cw=Math.floor(dims.width/3),ch=Math.floor(dims.height/3);
const keys=[];
for(let i=0;i<9;i++){
  const x=(i%3)*cw+2,y=Math.floor(i/3)*ch+2;
  keys.push(ff(['-i',sheet,'-vf',`crop=${cw-4}:${ch-4}:${x}:${y},scale=${W}:${H}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']));
}
function mae(a,b){let s=0;for(let j=0;j<size;j++)s+=Math.abs(a[j]-b[j]);return s/size;}
// All frames are near variants of one scene, not narrative events. Choose a
// closed nearest-variant route so no single transition becomes a reset.
const distances=keys.map(a=>keys.map(b=>mae(a,b)));
let bestCost=Infinity,bestOrder;
function visit(order,remaining,cost){
  if(cost>=bestCost)return;
  const prev=order.at(-1);
  if(!remaining.length){const c=cost+distances[prev][0];if(c<bestCost){bestCost=c;bestOrder=order.slice();}return;}
  for(const next of remaining)visit([...order,next],remaining.filter(v=>v!==next),cost+distances[prev][next]);
}
visit([0],[1,2,3,4,5,6,7,8],0);
const frames=[];
for(let k=0;k<9;k++){
  const a=keys[bestOrder[k]],b=keys[bestOrder[(k+1)%9]];
  for(let step=0;step<4;step++){
    const alpha=step/4;
    const frame=Buffer.allocUnsafe(size);
    for(let j=0;j<size;j++)frame[j]=Math.round(a[j]*(1-alpha)+b[j]*alpha);
    frames.push(frame);
  }
}
const raw=Buffer.concat(frames),input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',FPS,'-i','pipe:0'];
const mp4=path.join(root,'shallow-sea-v10.mp4'),gif=path.join(root,'shallow-sea-v10.gif');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',mp4],raw);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],raw);
ff(['-i',gif,'-vf',"select='eq(n,0)+eq(n,8)+eq(n,16)+eq(n,24)',scale=280:280,tile=2x2",'-frames:v','1',path.join(root,'sea-contact-v10.jpg')]);
const decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size;
const at=i=>decoded.subarray(i*size,(i+1)*size);
let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
const bytes=fs.readFileSync(gif),pos=bytes.indexOf('NETSCAPE2.0');
const meanLuma=b=>{let s=0;for(let j=0;j<size;j+=3)s+=0.2126*b[j]+0.7152*b[j+1]+0.0722*b[j+2];return s/(W*H);};
const lumas=frames.map(meanLuma);
const result={method:'Original shallow-sea artwork: nine native AI-generated neighboring light-refraction keyframes, locally assembled with four temporal samples per transition. Camera, shell identities and sand ridges serve as stable anchors.',keyframes:9,keyframeOrder:bestOrder,frames:count,width:W,height:H,frameDurationMs:70,seconds:count*0.07,loopCount:bytes.readUInt16LE(pos+13),decodedSeamMAE:mae(at(count-1),at(0)),meanAdjacentMAE:adjacent/(count-1),globalLumaRange:[Math.min(...lumas),Math.max(...lumas)],gifBytes:bytes.length};
result.seamRatio=result.decodedSeamMAE/result.meanAdjacentMAE;
fs.writeFileSync(path.join(root,'sea-validation-v10.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(count!==36||result.loopCount!==0||result.seamRatio>1.6)throw Error('Loop validation failed');
