const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=__dirname,W=640,H=640,size=W*H*3,FPS='100/7',Q=160;
function ff(args,input){const r=cp.spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{input,maxBuffer:128*1024*1024});if(r.status!==0)throw Error(String(r.stderr));return r.stdout;}
const sheet=path.join(root,'mirror-native-sheet-v7.png');
const probe=cp.spawnSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',sheet],{encoding:'utf8'});
const dim=JSON.parse(probe.stdout).streams[0],cw=Math.floor(dim.width/3),ch=Math.floor(dim.height/3);
const keys=[];
function makePattern(patch){
  const result=Buffer.allocUnsafe(size);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const tx=x%(2*Q),ty=y%(2*Q);
    const sx=tx<Q?tx:2*Q-1-tx,sy=ty<Q?ty:2*Q-1-ty;
    const src=(sy*Q+sx)*3,dst=(y*W+x)*3;
    result[dst]=patch[src];result[dst+1]=patch[src+1];result[dst+2]=patch[src+2];
  }
  return result;
}
for(let i=0;i<9;i++){
  const x=(i%3)*cw+2,y=Math.floor(i/3)*ch+2;
  const patch=ff(['-i',sheet,'-vf',`crop=${cw-4}:${ch-4}:${x}:${y},scale=${Q}:${Q}:flags=lanczos`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
  keys.push(makePattern(patch));
}
function mae(a,b){let s=0;for(let j=0;j<size;j++)s+=Math.abs(a[j]-b[j]);return s/size;}
const distances=keys.map(a=>keys.map(b=>mae(a,b)));
let bestCost=Infinity,bestOrder;
function visit(order,remaining,cost){
  if(cost>=bestCost)return;
  const prev=order.at(-1);
  if(!remaining.length){const total=cost+distances[prev][0];if(total<bestCost){bestCost=total;bestOrder=order.slice();}return;}
  for(const next of remaining)visit([...order,next],remaining.filter(v=>v!==next),cost+distances[prev][next]);
}
visit([0],[1,2,3,4,5,6,7,8],0);
const frames=[];
for(let i=0;i<9;i++){
  const a=keys[bestOrder[i]],b=keys[bestOrder[(i+1)%9]],middle=Buffer.allocUnsafe(size);
  frames.push(a);
  for(let j=0;j<size;j++)middle[j]=(a[j]+b[j]+1)>>1;
  frames.push(middle);
}
const raw=Buffer.concat(frames),input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',FPS,'-i','pipe:0'];
const mp4=path.join(root,'mirror-floral-v7.mp4'),gif=path.join(root,'mirror-floral-v7.gif');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',mp4],raw);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],raw);
ff(['-i',gif,'-vf',"select='eq(n,0)+eq(n,4)+eq(n,8)+eq(n,12)',scale=320:320,tile=2x2",'-frames:v','1',path.join(root,'mirror-contact-v7.jpg')]);
ff(['-i',gif,'-frames:v','1',path.join(root,'mirror-first-v7.png')]);
const decoded=ff(['-i',gif,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']),count=decoded.length/size,at=i=>decoded.subarray(i*size,(i+1)*size);
let adjacent=0;for(let i=1;i<count;i++)adjacent+=mae(at(i-1),at(i));
function symmetry(frame,horizontal){let s=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const a=(y*W+x)*3,b=(horizontal?y*W+W-1-x:(H-1-y)*W+x)*3;for(let c=0;c<3;c++)s+=Math.abs(frame[a+c]-frame[b+c]);}return s/size;}
const bytes=fs.readFileSync(gif),idx=bytes.indexOf('NETSCAPE2.0');
const lumas=keys.map(frame=>{let s=0;for(let i=0;i<size;i+=3)s+=frame[i]*0.2126+frame[i+1]*0.7152+frame[i+2]*0.0722;return s/(W*H);});
const result={production:'Nine native AI floral keyframes, each mirrored on fixed horizontal and vertical axes and repeated 2x2. All tiles share the same variation at each time.',keyframes:9,keyframeOrder:bestOrder,frames:count,width:W,height:H,frameDurationMs:70,seconds:count*0.07,loopCount:bytes.readUInt16LE(idx+13),rawHorizontalSymmetryMAE:symmetry(keys[0],true),rawVerticalSymmetryMAE:symmetry(keys[0],false),decodedSeamMAE:mae(at(count-1),at(0)),decodedMeanAdjacentMAE:adjacent/(count-1),globalLumaRange:[Math.min(...lumas),Math.max(...lumas)],gifBytes:bytes.length};
result.seamRatio=result.decodedSeamMAE/result.decodedMeanAdjacentMAE;
fs.writeFileSync(path.join(root,'mirror-validation-v7.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(count!==18||result.loopCount!==0||result.rawHorizontalSymmetryMAE!==0||result.rawVerticalSymmetryMAE!==0||result.seamRatio>1.6)throw Error('Mirror loop validation failed');
