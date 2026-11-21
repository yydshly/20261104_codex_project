const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = __dirname, W = 560, H = 560, FPS = 20, COUNT = 100, TAU = Math.PI * 2;
const count = W * H, size = count * 3, scale = W / 640;
function ff(args, input) {
  const r = cp.spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { input, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw Error(String(r.stderr));
  return r.stdout;
}
const base = ff(['-i', path.join(root, 'garden-base.png'), '-vf', `scale=${W}:${H}:flags=lanczos`, '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
const regions = [
  [195,414,100,86], [188,290,82,82], [237,520,84,70], [36,394,68,64],
  [318,349,49,49], [512,346,70,66], [629,462,68,59], [78,129,66,90],
  [93,214,73,64], [389,590,45,44], [328,448,42,39]
].map(([x,y,rx,ry]) => ({x:x*scale,y:y*scale,rx:rx*scale,ry:ry*scale}));
for (const r of regions) {
  r.samples=[];
  for (let y=Math.max(0,Math.floor(r.y-r.ry));y<=Math.min(H-1,Math.ceil(r.y+r.ry));y++) for(let x=Math.max(0,Math.floor(r.x-r.rx));x<=Math.min(W-1,Math.ceil(r.x+r.rx));x++) {
    const radial=Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry);
    if(radial>=1)continue;
    const t=Math.max(0,Math.min(1,(radial-0.62)/0.38));
    r.samples.push({p:y*W+x,dx:x-r.x,dy:y-r.y,w:1-t*t*(3-2*t)});
  }
}
const amplitudes=new Float32Array(count), offsets=new Float32Array(count);
for(let y=0;y<H;y++)for(let x=0;x<W;x++) {
  const p=y*W+x, depth=Math.pow(y/H,1.35);
  const sides=1-0.82*Math.exp(-Math.pow((x/W-0.59)/0.17,2));
  amplitudes[p]=(1.1+6.0*depth)*sides*scale;
  offsets[p]=-0.65*x/W-0.35*y/H;
}
function render(phase) {
  const dx=new Float32Array(count),dy=new Float32Array(count),out=Buffer.allocUnsafe(size);
  for(let p=0;p<count;p++) {
    const wind=phase+offsets[p];
    dx[p]=amplitudes[p]*(Math.sin(wind)+0.12*Math.sin(2*wind));
    dy[p]=amplitudes[p]*0.075*Math.sin(2*wind+0.3);
  }
  for(const r of regions) {
    const local=phase-0.65*r.x/W-0.35*r.y/H;
    const a=0.022*Math.sin(local),sn=Math.sin(a),cs=Math.cos(a);
    const strength=(2.5+3.1*r.y/H)*scale;
    const tx=strength*(Math.sin(local)+0.12*Math.sin(2*local));
    const ty=0.22*scale*Math.sin(2*local+0.3);
    // Petal groups move rigidly. Only stems and the feathered outer border bend.
    for(const q of r.samples) {
      const rigidX=tx+(cs-1)*q.dx+sn*q.dy;
      const rigidY=ty-sn*q.dx+(cs-1)*q.dy;
      dx[q.p]=dx[q.p]*(1-q.w)+rigidX*q.w;
      dy[q.p]=dy[q.p]*(1-q.w)+rigidY*q.w;
    }
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++) {
    const p=y*W+x,xx=Math.max(0,Math.min(W-1.001,x+dx[p])),yy=Math.max(0,Math.min(H-1.001,y+dy[p]));
    const x0=Math.floor(xx),y0=Math.floor(yy),fx=xx-x0,fy=yy-y0;
    const a=(y0*W+x0)*3,b=a+3,c=a+W*3,d=c+3;
    const light=1+0.010*Math.sin(phase-0.3)*(0.3+0.7*y/H);
    for(let ch=0;ch<3;ch++)out[p*3+ch]=Math.min(255,Math.max(0,Math.round(((base[a+ch]*(1-fx)+base[b+ch]*fx)*(1-fy)+(base[c+ch]*(1-fx)+base[d+ch]*fx)*fy)*light)));
  }
  return out;
}
const frames=Buffer.allocUnsafe(size*COUNT);
for(let i=0;i<COUNT;i++){render(TAU*i/COUNT).copy(frames,i*size);if(i%25===0)console.log(`Rendered ${i}/${COUNT}`);}
const input=['-f','rawvideo','-pix_fmt','rgb24','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0'];
const gif=path.join(root,'garden-breeze-preview.gif'),mp4=path.join(root,'garden-breeze-preview.mp4');
ff([...input,'-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',mp4],frames);
ff([...input,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',gif],frames);
ff(['-i',mp4,'-vf',"select='eq(n,0)+eq(n,25)+eq(n,50)+eq(n,75)',scale=280:280,tile=2x2",'-frames:v','1',path.join(root,'breeze-contact.jpg')]);
function mae(a,b){let s=0;for(let i=0;i<size;i++)s+=Math.abs(a[i]-b[i]);return s/size;}
const decoded=ff(['-i',gif,'-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
const at=n=>decoded.subarray(n*size,(n+1)*size);
let adj=0;for(let i=1;i<COUNT;i++)adj+=mae(at(i-1),at(i));
const encoded=fs.readFileSync(gif),idx=encoded.indexOf('NETSCAPE2.0');
const v={method:'Local programmatic breeze preview; no external AI video service used',frames:COUNT,fps:FPS,seconds:COUNT/FPS,width:W,height:H,endpointMAE:mae(frames.subarray(0,size),render(TAU)),decodedFrames:decoded.length/size,loopCount:encoded.readUInt16LE(idx+13),seamRatio:mae(at(COUNT-1),at(0))/(adj/(COUNT-1)),gifBytes:encoded.length};
fs.writeFileSync(path.join(root,'breeze-preview-validation.json'),JSON.stringify(v,null,2));console.log(JSON.stringify(v,null,2));
if(v.endpointMAE!==0||v.decodedFrames!==COUNT||v.loopCount!==0||v.seamRatio>1.7)throw Error('Loop validation failed');
