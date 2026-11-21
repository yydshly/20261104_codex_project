"""9s local layered-animation rough cut, not AI video or reconstructed 3D.

AI assets: clean background + six transparent poses. Local: pose morphs,
independent reflection, ripple mapping, reframing, synthesized stereo sound.
"""
from pathlib import Path
import json, math, hashlib, subprocess, wave
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio.v2 as imageio
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/reflection-short';OUT.mkdir(exist_ok=True)
W,H=1280,720;FPS=24;SECONDS=9;N=FPS*SECONDS
SW,SH=320,512
def smooth(v):
    v=np.clip(v,0,1);return v*v*(3-2*v)
plate=np.asarray(Image.open(OUT/'plate-v1.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS))
sheet=np.asarray(Image.open(OUT/'poses-v1.png').convert('RGBA'))
poses=[]
for i in range(6):
    x0=(i%3)*sheet.shape[1]//3;x1=(i%3+1)*sheet.shape[1]//3
    y0=(i//3)*sheet.shape[0]//2;y1=(i//3+1)*sheet.shape[0]//2
    tile=sheet[y0:y1,x0:x1].copy();a=tile[:,:,3]
    ys,xs=np.where(a>45)
    if not len(xs):raise RuntimeError('Empty transparent pose '+str(i))
    crop=tile[max(0,ys.min()-2):ys.max()+3,max(0,xs.min()-2):xs.max()+3]
    factor=min(452/crop.shape[0],290/crop.shape[1]);tw,th=round(crop.shape[1]*factor),round(crop.shape[0]*factor)
    crop=cv2.resize(crop,(tw,th),interpolation=cv2.INTER_AREA)
    normal=np.zeros((SH,SW,4),np.float32)
    normal[492-th:492,(SW-tw)//2:(SW-tw)//2+tw]=crop/255
    normal[:,:,3]=np.clip((normal[:,:,3]-.035)/.965,0,1)
    # Premultiplication keeps transparent edges from leaking dark RGB halos.
    normal[:,:,:3]*=normal[:,:,3,None]
    poses.append(normal)
    aout=normal.copy();aout[:,:,:3]/=np.maximum(aout[:,:,3,None],.001)
    Image.fromarray(np.uint8(np.clip(aout*255,0,255))).save(OUT/f'pose-{i+1}.png')

gy,gx=np.mgrid[:SH,:SW].astype(np.float32)
def morph_cache(i,j,steps=20):
    a,b=poses[i],poses[j]
    # Silhouette-weighted grey flow: approximate local pose interpolation.
    def grey(v):return np.uint8(np.clip(cv2.cvtColor(v[:,:,:3],cv2.COLOR_RGB2GRAY)*255+v[:,:,3]*35,0,255))
    ab=cv2.calcOpticalFlowFarneback(grey(a),grey(b),None,.5,5,35,5,7,1.5,0)
    ba=cv2.calcOpticalFlowFarneback(grey(b),grey(a),None,.5,5,35,5,7,1.5,0)
    frames=[]
    for t in np.linspace(0,1,steps):
        t=np.float32(t)
        wa=cv2.remap(a,gx-t*ab[:,:,0],gy-t*ab[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        wb=cv2.remap(b,gx-(1-t)*ba[:,:,0],gy-(1-t)*ba[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        frames.append(wa*(1-t)+wb*t)
    return frames
walk=morph_cache(0,1,24);stop=morph_cache(0,2,14)
turn=morph_cache(2,3,24);lean=morph_cache(2,4,20);startle=morph_cache(4,5,20)
def sample(cache,p):return cache[round(float(np.clip(p,0,1))*(len(cache)-1))]
def walking(t):return sample(walk,.5-.5*math.cos(t*math.tau*1.12))
yy,xx=np.mgrid[:H,:W].astype(np.float32)
water=np.clip((yy-(H*.66-.19*xx))/18,0,1)

def person_state(t,mirror=False):
    if t<2.6:
        p=float(smooth(t/2.6));x=.15+.15*p;h=.35-.026*p;pose=walking(t)
    elif mirror and t<5.5:
        p=float(smooth((t-2.6)/2.9));x=.30+.25*p;h=.324-.080*p;pose=walking(t)
    else:
        x=.55 if mirror else .30;h=.244 if mirror else .324
        if mirror:
            pose=sample(turn,smooth((t-5.5)/1.0))
        elif t<2.95:
            pose=sample(stop,smooth((t-2.6)/.35))
        elif t<6.6:pose=poses[2]
        elif t<7.45:pose=sample(lean,smooth((t-6.6)/.85))
        else:
            p=float(smooth((t-7.45)/.72));pose=sample(startle,p);x-=.023*p
    return x,h,pose

def composite(a,sprite,x,foot,height,mirror=False,time=0):
    # Normalized asset baseline is y=492. Mirror the projected actor vertically.
    scale=height/452;tw=max(2,round(SW*scale));th=max(2,round(SH*scale))
    s=cv2.resize(sprite,(tw,th),interpolation=cv2.INTER_LINEAR)
    if mirror:
        s=s[::-1].copy();top=round(foot-(SH-492)*scale)
        sy,sx=np.mgrid[:th,:tw].astype(np.float32)
        s=cv2.remap(s,sx+1.3*np.sin(sy*.12+time*3),sy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
        s[:,:,:3]*=np.array([.72,.83,.95],np.float32);s[:,:,3]*=.78;s[:,:,:3]*=.78
    else:top=round(foot-492*scale)
    left=round(x-tw/2)
    l=max(left,0);r=min(left+tw,W);u=max(top,0);d=min(top+th,H)
    if r<=l or d<=u:return
    c=s[u-top:d-top,l-left:r-left];alpha=c[:,:,3,None]
    a[u:d,l:r]=a[u:d,l:r]*(1-alpha)+c[:,:,:3]*255

def render(t):
    ripple=(.7*np.sin(yy*.065+t*1.3)+.35*np.sin(yy*.13-t*2))*water
    a=cv2.remap(plate,xx+ripple,yy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    xr,hr,pr=person_state(t,False);xm,hm,pm=person_state(t,True)
    # Slightly separated bank and water contact planes; cinematic approximation.
    realfoot=H*(.575-.13*xr);reflectionroot=H*(.67-.20*xm)
    if t<2.6:realfoot+=math.sin(t*math.tau*2.24)*.7
    shadow=np.zeros((H,W),np.uint8)
    cv2.ellipse(shadow,(round(xr*W),round(realfoot+2)),(round(hr*H*.13),4),0,0,360,55,-1,cv2.LINE_AA)
    a*=1-cv2.GaussianBlur(shadow,(13,7),0)[:,:,None]/255
    composite(a,pm,xm*W,reflectionroot,hm*H*.91,True,t)
    composite(a,pr,xr*W,realfoot,hr*H,False,t)
    if 5.5<t<7:
        q=(t-5.5)/1.5
        cv2.ellipse(a,(round(xm*W),round(reflectionroot+4)),(round(14+q*36),round(3+q*7)),0,0,360,(102,119,126),1,cv2.LINE_AA)
    # Two cuts and a gentle optical crop; never claimed to be a new 3D viewpoint.
    if t<2.6:zoom=1+.018*t/2.6;cx,cy=.43,.51
    elif t<6.6:zoom=1.10+.025*(t-2.6)/4;cx,cy=.43,.55
    else:zoom=1.27+.015*(t-6.6)/2.4;cx,cy=.43,.53
    cw,ch=round(W/zoom),round(H/zoom);l=round(cx*W-cw/2);u=round(cy*H-ch/2)
    l=max(0,min(W-cw,l));u=max(0,min(H-ch,u))
    a=cv2.resize(np.uint8(np.clip(a,0,255))[u:u+ch,l:l+cw],(W,H),interpolation=cv2.INTER_CUBIC)
    # Restrained grading and letterbox; no explanatory captions in the story.
    a=np.uint8(np.clip(a.astype(np.float32)*[1.015,1.0,.985],0,255));a[:28]=0;a[-28:]=0
    if t<1.65:
        im=Image.fromarray(a);layer=Image.new('RGBA',(W,H));d=ImageDraw.Draw(layer)
        opacity=round(200*float(smooth(t/.4))*(1-float(smooth((t-1.05)/.6))))
        font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',25)
        d.text((W-185,54),'倒影先行',font=font,fill=(223,227,218,opacity))
        a=np.asarray(Image.alpha_composite(im.convert('RGBA'),layer).convert('RGB')).copy()
    return a

silent=OUT/'reflection-story-local-v1-silent.mp4'
writer=imageio.get_writer(silent,fps=FPS,codec='libx264',quality=8,macro_block_size=16,ffmpeg_log_level='error')
contact=[];indices=[18,74,106,155,174,204]
for i in range(N):
    a=render(i/FPS);writer.append_data(a)
    if i in indices:contact.append(Image.fromarray(a))
writer.close();contact[0].save(OUT/'reflection-story-local-v1-poster.jpg',quality=95)
contact_sheet=Image.new('RGB',(1536,576))
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',15)
labels=['同步行走','人停下','倒影继续','倒影回头','低头确认','后退反应']
for i,im in enumerate(contact):
    im=im.resize((512,288),Image.Resampling.LANCZOS);d=ImageDraw.Draw(im)
    d.rectangle((0,262,512,288),fill=(9,17,21));d.text((10,267),labels[i],font=font,fill=(220,233,230))
    contact_sheet.paste(im,((i%3)*512,(i//3)*288))
contact_sheet.save(OUT/'reflection-story-local-v1-contact.jpg',quality=94)

# Original synthesized sound only; no fetched sound or licensed music.
SR=44100;rng=np.random.default_rng(731);tt=np.arange(SR*SECONDS)/SR
noise=rng.normal(0,1,len(tt)).astype(np.float32)
air=np.convolve(noise,np.ones(260)/260,mode='same')*.24
water_sound=np.convolve(noise,np.ones(26)/26,mode='same')*.018*(1+.25*np.sin(tt*1.7))
base=air+water_sound
stereo=np.stack([base,base*.97],axis=1)
step_times=[.48,.93,1.38,1.83,2.28,3.0,3.45,3.90,4.35,4.80,5.25,7.78]
for k,when in enumerate(step_times):
    n=int(SR*.17);s=np.arange(n)/SR
    impulse=(rng.normal(0,1,n)*np.exp(-s*45)*.032+np.sin(math.tau*105*s)*np.exp(-s*28)*.045)
    offset=int(when*SR);end=min(offset+n,len(tt));pan=.38 if k<5 else .68
    for c,gain in enumerate([1-pan,pan]):stereo[offset:end,c]+=impulse[:end-offset]*gain
env=np.exp(-((tt-5.8)/.8)**2)*.009
tone=env*(np.sin(math.tau*138*tt)+.35*np.sin(math.tau*147*tt))
stereo+=tone[:,None]
fade=np.minimum(np.clip(tt/.35,0,1),np.clip((SECONDS-tt)/.55,0,1))
stereo*=fade[:,None];peak=float(np.max(np.abs(stereo)))
if peak>.90:stereo*=.90/peak
wav=OUT/'reflection-story-local-v1-sound.wav'
with wave.open(str(wav),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(np.int16(stereo*32767).tobytes())
final=OUT/'reflection-story-local-v1.mp4'
args=[imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(silent),'-i',str(wav),'-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',str(final)]
subprocess.run(args,check=True,capture_output=True)
reader=imageio.get_reader(final);count=reader.count_frames();meta=reader.get_meta_data();reader.close()
record={'date':'2026-11-13','title':'倒影先行','type':'local_layered_animation_rough_cut','output':str(final.relative_to(ROOT)).replace('\\','/'),'width':W,'height':H,'fps':FPS,'frames':count,'seconds':count/FPS,'audio':{'type':'original_local_synthesis','sampleRate':SR,'channels':2,'codec':'AAC','peakBeforeEncoding':float(np.max(np.abs(stereo))),'soundtrack':'本地合成水声、风声、脚步、低音提示，无对白'},'sourceAssets':'reference/reflection-short-assets-20261113.json','storyPlan':'reference/reflection-short-plan-20261113.json','script':'scripts/render_reflection_short.py','sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'limits':['六个静态姿态通过光流近似插值，存在局部形变和步态滑动。','背景固定，镜头变化来自同一机位裁切；不是三维运镜。','镜像接触与透视为人工近似，不是准确反射模拟。','这是一段本地分层动画粗剪，不是AI生成视频或写实最终成片。']}
(ROOT/'reference/reflection-short-local-v1-20261113.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'output':str(final),'frames':count,'seconds':count/FPS,'audio':meta.get('audio_codec'),'bytes':final.stat().st_size},ensure_ascii=False),flush=True)
