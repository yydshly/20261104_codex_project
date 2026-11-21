"""Three local motion PREVIEWS. No remote video model, audio or reconstructed scene.

Sea: explicitly approximate parameter-surface render with a static road cutout.
Reflection: isolated existing reflected figure, translated/scaled over inpainted water.
Day/night: aligned AI-edited lighting endpoints, spatial compositing boundary.
"""
from pathlib import Path
import json, math, hashlib
import cv2
import numpy as np
import imageio.v2 as imageio
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/effect-motion'; OUT.mkdir(exist_ok=True)
W,H=768,432
FPS=18; FRAMES=126
FONT=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',15)
def load(name):
    return cv2.resize(np.asarray(Image.open(ROOT/name).convert('RGB')),(W,H),interpolation=cv2.INTER_AREA)
def smooth(x):
    x=np.clip(x,0,1); return x*x*(3-2*x)
def stamp(a,title,phase):
    im=Image.fromarray(a); d=ImageDraw.Draw(im)
    d.rectangle((0,H-36,W,H),fill=(10,17,22))
    d.text((13,H-28),title+'  /  '+phase,font=FONT,fill=(220,232,229))
    return np.asarray(im)
metadata=[]
def export(slug,render,method,limits):
    path=OUT/(slug+'.mp4'); contacts=[]
    writer=imageio.get_writer(path,fps=FPS,codec='libx264',quality=8,macro_block_size=16,ffmpeg_log_level='error')
    for i in range(FRAMES):
        a=render(i/(FRAMES-1)); writer.append_data(a)
        if i in (0,FRAMES//2,FRAMES-1): contacts.append(Image.fromarray(a))
    writer.close()
    contacts[0].save(OUT/(slug+'-poster.jpg'),quality=93)
    sheet=Image.new('RGB',(W*3,H))
    for j,im in enumerate(contacts): sheet.paste(im,(W*j,0))
    sheet.resize((1536,288),Image.Resampling.LANCZOS).save(OUT/(slug+'-contact.jpg'),quality=93)
    reader=imageio.get_reader(path)
    count=reader.count_frames(); reader.close()
    metadata.append({'file':str(path.relative_to(ROOT)).replace('\\','/'),'width':W,'height':H,'fps':FPS,'frames':count,'seconds':count/FPS,'audio':False,'method':method,'limits':limits,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    print(slug,count,'frames',flush=True)

# 1. A real changing parametric geometry, not global image zoom.
sea=load('assets/original-keyframes/effect-sea-wall-v1.png')
mask=np.zeros((H,W),np.uint8)
poly=np.array([(0,.40),(.07,.47),(.15,.52),(.20,.565),(.24,.59),(.32,.64),(.40,.70),(.50,.80),(.70,1),(0,1)])*[W,H]
cv2.fillPoly(mask,[poly.astype(np.int32)],255)
mask=cv2.GaussianBlur(mask,(3,3),0).astype(np.float32)/255
yy,xx=np.mgrid[:H,:W]
sky=np.empty((H,W,3),np.float32)
for c,(top,bottom) in enumerate(zip([73,96,129],[254,170,91])):
    sky[:,:,c]=top+(bottom-top)*np.clip(yy/(H*.6),0,1)
glow=np.exp(-((xx-W*.20)**2+(yy-H*.49)**2)/(W*.21)**2)
sky+=glow[:,:,None]*np.array([30,11,-2])
sky=np.uint8(np.clip(sky,0,255));cv2.circle(sky,(int(W*.20),int(H*.49)),7,(255,241,186),-1,cv2.LINE_AA)
ds=np.linspace(0,53,47);zs=np.geomspace(8,240,75)-8
def project(d,z,p):
    angle=max(.0001,1.50*p); arc=np.clip(d-8,0,23); theta=angle*arc/23
    extra=np.maximum(d-31,0); radius=23/angle
    x=np.minimum(d,8)+radius*np.sin(theta)+extra*np.cos(angle)
    y=radius*(1-np.cos(theta))+extra*np.sin(angle)
    return W*.20+W*.70*(x+5.5)/(z+8),H*.56+W*.70*(3-y)/(z+8)
def sea_frame(t):
    p=float(smooth((t-.08)/.78));a=sky.copy()
    d,z=np.meshgrid(ds,zs); px,py=project(d,z,p)
    # Far-to-near painter order for this monotonic non-overhanging surface.
    for iz in range(len(zs)-2,-1,-1):
        for j in range(len(ds)-2,-1,-1):
            q=np.array([[px[iz,j],py[iz,j]],[px[iz,j+1],py[iz,j+1]],[px[iz+1,j+1],py[iz+1,j+1]],[px[iz+1,j],py[iz+1,j]]])
            if q[:,0].min()>W or q[:,0].max()<0 or q[:,1].min()>H or q[:,1].max()<0: continue
            wave=.5+.5*math.sin(ds[j]*2.9+zs[iz]*.47-t*9)
            light=.55+.45*math.cos(p*1.5*min(max((ds[j]-8)/23,0),1))
            c=np.array([17,92,107])*light+np.array([10,26,25])*wave
            cv2.fillConvexPoly(a,np.clip(q,-20000,20000).astype(np.int32),tuple(map(int,c)),cv2.LINE_AA)
    # Fine continuous ripples along the curved water, with sparse gold highlights.
    for iz,z0 in enumerate(np.linspace(2,190,82)):
        d0=np.linspace(0,53,160); z0=z0+.15*np.sin(d0*1.8+t*7)
        rx,ry=project(d0,z0,p);q=np.clip(np.stack([rx,ry],axis=1),-20000,20000).astype(np.int32)
        cv2.polylines(a,[q],False,(50,133,145) if iz%6 else (140,157,120),1,cv2.LINE_AA)
    if p>.35:
        for k in range(14):
            fx,fy=project(29+k%4*2,27+(k*7+t*15)%84,p)
            if 0<fx<W and 0<fy<H-36:
                size=3+k%3
                cv2.ellipse(a,(int(fx),int(fy)),(size*2,size),-20,0,360,(7,52,64),-1,cv2.LINE_AA)
                cv2.fillConvexPoly(a,np.array([[fx+size,fy],[fx+size*3,fy-size*2],[fx+size*3,fy+size]]).astype(np.int32),(7,52,64),cv2.LINE_AA)
    a=np.uint8(a*(1-mask[:,:,None])+sea*mask[:,:,None])
    return stamp(a,'海面弯起 · 参数曲面草模','平海 → 弯起 → 水墙')
export('sea-wall-mesh-v1',sea_frame,'NumPy参数曲面投影、程序水纹与鱼群；原图道路静态遮罩合成。','固定相机与骑行者；非原图三维重建，未实现沿路推进和头顶鱼群。')

# 2. Isolate the actual existing reflection, keep the real person untouched.
reflection=load('assets/original-keyframes/effect-ahead-reflection-v1.png')
coords=np.array([(1270,447),(1291,448),(1315,502),(1332,505),(1333,447),(1355,447),(1345,531),(1333,594),(1327,610),(1323,637),(1309,646),(1294,638),(1290,618),(1299,605),(1280,584),(1277,546),(1287,509)])*[W/1672,H/941]
rm=np.zeros((H,W),np.uint8);cv2.fillPoly(rm,[coords.astype(np.int32)],255)
rm=cv2.dilate(rm,np.ones((3,3),np.uint8))
rx,ry,rw,rh=cv2.boundingRect(rm)
sprite=reflection[ry:ry+rh,rx:rx+rw].copy();alpha=cv2.GaussianBlur(rm[ry:ry+rh,rx:rx+rw],(3,3),0)/255
bg=cv2.inpaint(reflection,rm,9,cv2.INPAINT_TELEA)
Image.fromarray(bg).save(OUT/'reflection-clean-local.jpg',quality=95)
def reflection_frame(t):
    p=float(smooth((t-.13)/.69));a=bg.astype(np.float32).copy()
    h=round(H*(.34-.12*p));w=round(rw*h/rh)
    x=round(W*(.17+.61*p))-w//2;y=round(H*(.60-.12*p))
    sp=cv2.resize(sprite,(w,h));al=cv2.resize(alpha,(w,h))*.83
    for row in range(min(h,H-36-y)):
        off=round(1.6*math.sin(row*.15+t*8));left=x+off;right=min(W,left+w)
        if left>=0 and right>left:
            m=al[row,:right-left,None];a[y+row,left:right]=a[y+row,left:right]*(1-m)+sp[row,:right-left]*m
    return stamp(np.uint8(np.clip(a,0,255)),'异步倒影 · 图层位移预演','岸上人物不动，倒影先行并停下')
export('reflection-offset-v1',reflection_frame,'原图倒影手工遮罩、局部补水面、独立位置/尺度插值、水纹扰动。','人物姿态沿用原图，尚无走路骨骼、回头与真实镜像透视；水面补绘有近似。')

# 3. Register lighting endpoint images before the spatial day/night blend.
day=load('assets/effect-motion/city-day-source-v1.png');night=load('assets/effect-motion/city-night-source-v1.png')
sift=cv2.SIFT_create(nfeatures=2200)
region=np.zeros((H,W),np.uint8);region[int(H*.22):int(H*.8)]=255
kd,dd=sift.detectAndCompute(cv2.cvtColor(day,cv2.COLOR_RGB2GRAY),region)
kn,dn=sift.detectAndCompute(cv2.cvtColor(night,cv2.COLOR_RGB2GRAY),region)
matches=cv2.BFMatcher().knnMatch(dn,dd,k=2);good=[a for a,b in matches if a.distance<.72*b.distance]
registration={'matches':len(good),'applied':False}
if len(good)>20:
    mat,inliers=cv2.findHomography(np.float32([kn[m.queryIdx].pt for m in good]),np.float32([kd[m.trainIdx].pt for m in good]),cv2.RANSAC,2.5)
    if mat is not None:
        corners=np.float32([[[0,0],[W,0],[W,H],[0,H]]]); delta=np.max(np.linalg.norm(cv2.perspectiveTransform(corners,mat)-corners,axis=2))
        if delta<24 and int(inliers.sum())>20:
            night=cv2.warpPerspective(night,mat,(W,H),borderMode=cv2.BORDER_REFLECT)
            registration.update(applied=True,inliers=int(inliers.sum()),maxCornerDisplacement=float(delta))
Image.fromarray(day).save(OUT/'city-day-aligned.jpg',quality=95)
Image.fromarray(night).save(OUT/'city-night-aligned.jpg',quality=95)
def day_frame(t):
    p=float(smooth((t-.06)/.86)); boundary=(-.22+1.44*p)*W
    m=smooth((boundary-(xx+.22*(yy-H/2)))/16+.5)[:,:,None]
    a=np.uint8(day*(1-m)+night*m)
    return stamp(a,'昼夜分界 · 光照图层合成','边界扫过立面、灯光和水面')
export('day-night-sweep-v1',day_frame,'内置image_gen编辑昼/夜端点、SIFT配准、带柔边的空间遮罩合成。','不是物理太阳与阴影模拟；端点几何和人群可能有细节漂移，无声音。')
record={'date':'2026-11-13','type':'local_motion_previsualization','script':'scripts/render_effect_motion_studies.py','videos':metadata,'dayNightRegistration':registration,'sourceGenerationRecord':'reference/effect-motion-light-generation-20261113.json','notAIgeneratedVideo':True}
(ROOT/'reference/effect-motion-studies-20261113.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
