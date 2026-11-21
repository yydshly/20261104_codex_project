"""Refine V1 without replacing its assets: partial foot-layer constraints,
continuous upper-body interpolation, closer horizontal and portrait framings.
These are 2D approximations, not anatomical IK or motion capture.
"""
from pathlib import Path
import json,math,hashlib,subprocess
import numpy as np
import cv2
from PIL import Image,ImageDraw,ImageFont
import imageio.v2 as imageio
import imageio_ffmpeg
import render_dance_walk as base
ROOT=base.ROOT;OUT=base.OUT;FPS=25;N=240
gx,gy=base.gx,base.gy
upper=np.clip((350-gy)/100,0,1)[:,:,None]
def pose(b):
    k=min(15,int(b));p=b-k;frames=base.caches[base.sequence[k],base.sequence[k+1]]
    lo=frames[round(base.smooth(p)*15)]
    delay=.24 if k in (8,9) else .10
    hi=frames[round(base.smooth(max(0,p-delay)/(1-delay))*15)]
    sp=lo*(1-upper)+hi*upper
    # Torso yields on weak beats, while the lowest boot region stays on ground.
    bounce=np.float32(4*math.sin(math.pi*p))
    body_weight=np.clip((490-gy)/200,0,1)
    sway=np.float32(2.2*math.sin(math.tau*p))*np.clip((380-gy)/230,0,1)
    return cv2.remap(sp,gx+sway,gy+bounce*body_weight,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
def support(sp,near=None):
    a=sp[:,:,3];ys,xs=np.where(a>.40)
    bottom=int(ys.max());ys,xs=np.where((a>.40)&(gy>=bottom-4))
    if near is not None:
        ok=np.abs(xs-near)<40
        if np.any(ok):xs=xs[ok]
    return float(np.median(xs)),float(bottom)
pin=None;pinbeat=-1;foot_stats=[];paths=[];frames_contacts=[]
def scene(i):
    global pin,pinbeat
    b=i/15;k=int(b);p=b-k;t=i/FPS
    x=270+32.5*(b+.035*math.sin(math.tau*p));height=base.HH*(.365-.075*x/base.WW);scale=height/453
    sp=pose(b);fx,fy=support(sp, pin['local'] if pin and pinbeat==k else None)
    if pinbeat!=k:
        pinbeat=k;pin={'world':x+(fx-base.SW/2)*scale,'local':fx}
    # Plant briefly, then release gently into toe-off. Local deformation only.
    desired=(pin['world']-x)/scale+base.SW/2
    correction=float(np.clip(desired-fx,-23,23))
    hold=1 if p<=.40 else 1-base.smooth((p-.40)/.28)
    if p>=.68:hold=0
    weight=np.exp(-((gx-fx)/44)**2)*np.clip((gy-390)/90,0,1)*hold
    sp=cv2.remap(sp,gx-np.float32(correction)*weight,gy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    fx2,fy2=support(sp,desired if hold>.8 else fx)
    floor=base.HH*(.575-.13*x/base.WW)
    # Baseline is measured from alpha rather than assumed constant.
    foot_offset=(493-fy2)*scale
    hop=(2.5*max(0,math.sin(math.pi*p)) if k>=12 else 0)
    a=base.plate.astype(np.float32).copy()
    shade=np.zeros((base.HH,base.WW),np.uint8)
    cv2.ellipse(shade,(round(x+(fx2-base.SW/2)*scale),round(floor+1)),(25,4),0,0,360,58,-1,cv2.LINE_AA)
    a*=1-cv2.GaussianBlur(shade,(13,5),0)[:,:,None]/255
    base.paste(a,sp,x,base.HH*(.67-.20*x/base.WW),height*.73,True,t)
    base.paste(a,sp,x,floor+foot_offset-hop,height,False,t)
    foot_stats.append({'frame':i,'beat':k+1,'hold':round(hold,3),'layerCorrection':round(correction*hold,3),'estimatedPlantErrorPx':round(abs(x+(fx2-base.SW/2)*scale-pin['world']),3) if hold==1 else None})
    paths.append(x)
    return np.uint8(np.clip(a,0,255)),x,floor
def reframe(a,x,floor,portrait=False):
    if portrait:
        cw,ch=384,512;W,H=720,960;cx=x+20
    else:
        cw,ch=896,504;W,H=1280,720;cx=x+145
    l=round(np.clip(cx-cw/2,0,base.WW-cw));u=round(np.clip(floor-ch*.82,0,base.HH-ch))
    out=cv2.resize(a[u:u+ch,l:l+cw],(W,H),interpolation=cv2.INTER_CUBIC)
    out[:18 if not portrait else 14]=0;out[-18 if not portrait else -14:]=0
    return out
slugs=['dance-walk-100bpm-local-v2','dance-walk-100bpm-portrait-v2']
writers=[imageio.get_writer(OUT/(s+'-silent.mp4'),fps=FPS,codec='libx264',quality=8,macro_block_size=16,ffmpeg_log_level='error') for s in slugs]
for i in range(N):
    a,x,floor=scene(i)
    for j,writer in enumerate(writers):
        out=reframe(a,x,floor,j==1);writer.append_data(out)
        if i==45:Image.fromarray(out).save(OUT/(slugs[j]+'-poster.jpg'),quality=95)
        if j==0 and i in [0,45,90,135,180,225]:frames_contacts.append(Image.fromarray(out))
for writer in writers:writer.close()
records=[]
for j,s in enumerate(slugs):
    final=OUT/(s+'.mp4')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(OUT/(s+'-silent.mp4')),'-i',str(OUT/'dance-walk-100bpm-original.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',str(final)],capture_output=True,check=True)
    reader=imageio.get_reader(final);n=reader.count_frames();meta=reader.get_meta_data();reader.close()
    records.append({'file':str(final.relative_to(ROOT)).replace('\\','/'),'frames':n,'seconds':n/FPS,'size':list(meta['size']),'audio':meta.get('audio_codec'),'sha256':hashlib.sha256(final.read_bytes()).hexdigest()})
sheet=Image.new('RGB',(1536,576));font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',14)
for j,im in enumerate(frames_contacts):
    im=im.resize((512,288),Image.Resampling.LANCZOS);d=ImageDraw.Draw(im);d.rectangle((0,263,512,288),fill=(10,18,22));d.text((12,268),f'第 {j*3+1} 拍 · V2 近景',font=font,fill=(226,236,227));sheet.paste(im,((j%3)*512,(j//3)*288))
sheet.save(OUT/'dance-walk-v2-contact.jpg',quality=94)
held=[v['estimatedPlantErrorPx'] for v in foot_stats if v['estimatedPlantErrorPx'] is not None]
record={'date':'2026-11-14','type':'local_layered_animation_revision','outputs':records,'bpm':100,'beats':16,'framesPerBeat':15,'continuousForward':all(a<b for a,b in zip(paths,paths[1:])),'changes':['躯干回弹改为局部变形，前12拍不再整体离地。','前0.4拍添加足部图层定位约束，随后逐渐释放。','第9/10拍上身停顿改为连续过渡，减少边界突变。','横版角色占比增大，另导出720×960全身近景。'],'plantMeasurement':{'type':'alpha-silhouette estimate, not physical validation','samples':len(held),'medianErrorPx':float(np.median(held))},'limits':['局部足部约束不是骨骼IK，无法修复全部滑步、穿插与形变。','近景会暴露原有静态姿态插值的不足。','仍使用原创占位配乐；未确认用户记忆中的歌曲。','现有素材未形成连续闭眼表演，沉醉与释放的表情仍待验证。'],'sourceAssets':'reference/dance-walk-assets-20261113.json','music':'reference/dance-walk-music-20261113.json','script':'scripts/render_dance_walk_v2.py'}
(ROOT/'reference/dance-walk-v2-20261114.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'outputs':records,'continuousForward':record['continuousForward'],'medianEstimatedPlantError':record['plantMeasurement']['medianErrorPx']},ensure_ascii=False),flush=True)
