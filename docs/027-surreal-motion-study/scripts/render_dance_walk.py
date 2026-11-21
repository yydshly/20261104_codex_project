"""Music-first local dance-walk choreography study, explicitly not AI video.

100 BPM => 0.6 s/beat => exactly 15 frames/beat at 25 FPS.
Original 16-beat score and actor pose keys share this same time grid.
"""
from pathlib import Path
import json,math,subprocess,hashlib
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont
import imageio.v2 as imageio
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/dance-walk'
WW,HH=1600,900;W,H=1280,720;FPS=25;BEAT=.6;N=240;SW,SH=352,512
plate=np.asarray(Image.open(ROOT/'assets/reflection-short/plate-v1.png').convert('RGB').resize((WW,HH),Image.Resampling.LANCZOS))
sheet=np.asarray(Image.open(OUT/'dance-poses-v1.png').convert('RGBA'))
poses=[]
for i in range(8):
    cell=sheet[(i//4)*sheet.shape[0]//2:(i//4+1)*sheet.shape[0]//2,(i%4)*sheet.shape[1]//4:(i%4+1)*sheet.shape[1]//4]
    ys,xs=np.where(cell[:,:,3]>55)
    if len(xs)==0:raise RuntimeError('Pose alpha empty')
    crop=cell[max(0,ys.min()-2):ys.max()+3,max(0,xs.min()-2):xs.max()+3]
    s=min(453/crop.shape[0],326/crop.shape[1]);cw,ch=round(crop.shape[1]*s),round(crop.shape[0]*s)
    crop=cv2.resize(crop,(cw,ch),interpolation=cv2.INTER_AREA)/255
    a=np.zeros((SH,SW,4),np.float32);a[493-ch:493,(SW-cw)//2:(SW-cw)//2+cw]=crop
    a[:,:,3]=np.clip((a[:,:,3]-.03)/.97,0,1);a[:,:,:3]*=a[:,:,3,None];poses.append(a)
gx,gy=np.meshgrid(np.arange(SW,dtype=np.float32),np.arange(SH,dtype=np.float32))
def smooth(t):t=float(np.clip(t,0,1));return t*t*(3-2*t)
def morph(a,b,n=16):
    def grey(x):return np.uint8(np.clip(cv2.cvtColor(x[:,:,:3],cv2.COLOR_RGB2GRAY)*255+x[:,:,3]*25,0,255))
    ab=cv2.calcOpticalFlowFarneback(grey(a),grey(b),None,.5,5,31,5,7,1.5,0)
    ba=cv2.calcOpticalFlowFarneback(grey(b),grey(a),None,.5,5,31,5,7,1.5,0)
    frames=[]
    for v in np.linspace(0,1,n):
        v=np.float32(v)
        x=cv2.remap(a,gx-v*ab[:,:,0],gy-v*ab[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        y=cv2.remap(b,gx-(1-v)*ba[:,:,0],gy-(1-v)*ba[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        frames.append(x*(1-v)+y*v)
    return frames
sequence=[0,1,2,3,4,5,2,3,4,1,6,1,7,2,5,0,1]
caches={}
for a,b in zip(sequence,sequence[1:]):
    if (a,b) not in caches:caches[a,b]=morph(poses[a],poses[b])
upper=np.clip((350-gy)/110,0,1)[:,:,None]
def pose_at(b):
    k=min(15,int(b));p=b-k;key=(sequence[k],sequence[k+1]);frames=caches[key]
    lo=frames[round(smooth(p)*(len(frames)-1))]
    # Upper gestures arrive fractionally behind feet; torso pauses at beat nine.
    delay=.16 if k not in (8,9) else .35
    hi=frames[round(smooth(max(0,p-delay)/(1-delay))*(len(frames)-1))]
    if k==8:hi=poses[4]
    a=lo*(1-upper)+hi*upper
    sway=np.float32(2.8*math.sin(2*math.pi*p))*np.clip((390-gy)/250,0,1)
    return cv2.remap(a,gx+sway,gy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
def paste(a,sp,x,y,height,reflection=False,t=0):
    scale=height/453;tw,th=round(SW*scale),round(SH*scale)
    s=cv2.resize(sp,(tw,th),interpolation=cv2.INTER_LINEAR)
    if reflection:
        s=s[::-1].copy();top=round(y-(SH-493)*scale)
        yy,xx=np.mgrid[:th,:tw].astype(np.float32)
        s=cv2.remap(s,xx+1.4*np.sin(yy*.12+t*3),yy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        s[:,:,:3]*=np.array([.66,.79,.91],np.float32)*.53;s[:,:,3]*=.53
    else:top=round(y-493*scale)
    left=round(x-tw/2);l=max(0,left);r=min(WW,left+tw);u=max(0,top);d=min(HH,top+th)
    if l>=r or u>=d:return
    c=s[u-top:d-top,l-left:r-left];m=c[:,:,3,None]
    a[u:d,l:r]=a[u:d,l:r]*(1-m)+c[:,:,:3]*255
trajectory=[]
def frame(i):
    b=i/15;t=i/FPS;k=int(b);phase=b-k
    # Strictly positive forward displacement: d(b+.05 sin(2πb))/db >= .685.
    x=270+32.5*(b+.05*math.sin(math.tau*phase));height=HH*(.365-.075*x/WW)
    floor=HH*(.575-.13*x/WW)
    hop=(7 if k>=12 else 3.3)*max(0,math.sin(math.pi*phase))
    sp=pose_at(b);a=plate.astype(np.float32).copy()
    shade=np.zeros((HH,WW),np.uint8);cv2.ellipse(shade,(round(x),round(floor+1)),(34,5),0,0,360,44,-1,cv2.LINE_AA)
    a*=1-cv2.GaussianBlur(shade,(17,7),0)[:,:,None]/255
    paste(a,sp,x,HH*(.67-.20*x/WW),height*.73,True,t)
    paste(a,sp,x,floor-hop,height,False,t)
    # Optical tracking crop follows continuous world travel, full body retained.
    cw,ch=1184,666;cx=np.clip(x+300,cw/2,WW-cw/2);cy=HH*.46
    l=round(cx-cw/2);u=round(cy-ch/2)
    a=cv2.resize(np.uint8(np.clip(a,0,255))[u:u+ch,l:l+cw],(W,H),interpolation=cv2.INTER_CUBIC)
    a[:22]=0;a[-22:]=0
    trajectory.append({'frame':i,'time':round(t,3),'beat':k+1,'poseKey':sequence[k]+1,'worldX':round(x,3)})
    return a
def export_v1():
    silent=OUT/'dance-walk-100bpm-local-v1-silent.mp4'
    writer=imageio.get_writer(silent,fps=FPS,codec='libx264',quality=8,macro_block_size=16,ffmpeg_log_level='error')
    contacts=[]
    for i in range(N):
        a=frame(i);writer.append_data(a)
        if i%30==0:contacts.append(Image.fromarray(a))
        if i==38:Image.fromarray(a).save(OUT/'dance-walk-100bpm-local-v1-poster.jpg',quality=95)
    writer.close()
    contact=Image.new('RGB',(1536,432));font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',14)
    for j,im in enumerate(contacts):
        im=im.resize((384,216),Image.Resampling.LANCZOS);d=ImageDraw.Draw(im);d.rectangle((0,193,384,216),fill=(9,17,21));d.text((9,197),f'第 {j*2+1} 拍 / {j*1.2:.1f}s',font=font,fill=(227,237,227));contact.paste(im,((j%4)*384,(j//4)*216))
    contact.save(OUT/'dance-walk-100bpm-local-v1-contact.jpg',quality=94)
    final=OUT/'dance-walk-100bpm-local-v1.mp4'
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(silent),'-i',str(OUT/'dance-walk-100bpm-original.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',str(final)],capture_output=True,check=True)
    reader=imageio.get_reader(final);count=reader.count_frames();meta=reader.get_meta_data();reader.close()
    forward=all(a['worldX']<b['worldX'] for a,b in zip(trajectory,trajectory[1:]))
    plan=json.loads((ROOT/'reference/dance-walk-plan-20261113.json').read_text(encoding='utf-8'))
    for node in plan['nodes']:node['frame']=round(node['timeSeconds']*FPS)
    record={'date':'2026-11-13','type':'local_music_driven_layered_animation','file':str(final.relative_to(ROOT)).replace('\\','/'),'seconds':count/FPS,'frames':count,'width':W,'height':H,'fps':FPS,'bpm':100,'beats':16,'framesPerBeat':15,'audioCodec':meta.get('audio_codec'),'continuousForwardTravelVerified':forward,'beatNodes':plan['nodes'],'sourceAssets':'reference/dance-walk-assets-20261113.json','music':'reference/dance-walk-music-20261113.json','script':'scripts/render_dance_walk.py','sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'limits':['八个静态姿态作光流插值，局部肢体形变、穿插与脚底滑移仍存在。','关键姿态与音乐共用拍点，未实现物理脚底锁定或动作捕捉。','跟拍感来自固定背景的追踪裁切；不是三维摄影机绕拍。','原创本地合成配乐，无对白；不是现成电影配乐或AI视频。']}
    (ROOT/'reference/dance-walk-local-v1-20261113.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'file':str(final),'seconds':count/FPS,'frames':count,'audio':meta.get('audio_codec'),'forward':forward},ensure_ascii=False),flush=True)

if __name__=='__main__':
    export_v1()
