"""Local 2.5D forward-view GIF from V3; no remote service or generated video.

Depth is a hand-authored composition approximation, not reconstructed geometry.
The image is reprojected at different rates; hidden scene content is not invented.
"""
from pathlib import Path
import hashlib
import json
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/gif-studies'
OUT.mkdir(parents=True,exist_ok=True)
source_path=ROOT/'assets/original-keyframes/twilight-terrace-city-arch-v3.png'
W=420
source=Image.open(source_path).convert('RGB')
H=round(source.height*W/source.width)
source=source.resize((W,H),Image.Resampling.LANCZOS)
rgb=np.asarray(source)
ys,xs=np.mgrid[0:H,0:W].astype(np.float32)
nx=xs/W; ny=ys/H
cx=np.float32(W*.58);cy=np.float32(H*.435)
# The ground inverse-depth increases toward the viewer. Walls receive almost
# constant depth in each compositional mass, keeping their internal lines steady.
depth=np.clip((ny-.435)/.565,0,1).astype(np.float32)
depth*=.94
def overlay_polygon(points,value,feather=8):
    global depth
    mask=Image.new('L',(W,H),0)
    draw=ImageDraw.Draw(mask)
    draw.polygon([(round(x*W),round(y*H)) for x,y in points],fill=255)
    mask=cv2.GaussianBlur(np.asarray(mask,dtype=np.float32)/255,(0,0),feather)
    depth=depth*(1-mask)+np.float32(value)*mask

# Whole framing masses receive one depth rather than cutting their upper parts
# off at a horizon row. Smooth depth transitions avoid folds in the remapping.
overlay_polygon([(0,.16),(.03,.17),(.03,.20),(.08,.21),(.13,.25),(.13,.35),(.18,.44),(.25,.46),(.305,.50),(.31,.66),(.33,1),(0,1)],.72,13)
overlay_polygon([(.93,.44),(1,.42),(1,1),(.80,1),(.77,.73),(.88,.63)],.68,13)
depth=cv2.GaussianBlur(depth,(0,0),12)
arch_outline=[(.35,.39),(.35,.30),(.37,.22),(.42,.17),(.49,.14),(.58,.125),(.67,.14),(.74,.18),(.79,.24),(.82,.31),(.82,.405),(.75,.405),(.75,.31),(.73,.25),(.69,.21),(.64,.19),(.58,.18),(.53,.19),(.48,.22),(.44,.27),(.43,.39)]
overlay_polygon(arch_outline,.045,1.5)

font=lambda n,b=False:ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if b else 'C:/Windows/Fonts/msyh.ttc',n)
frames=[]
movement_seconds=5
frame_count=50
strength=.34
focal=np.float32(W*1.18)
# Reproject a depth cloud with a moving camera. Distinct near planes exit the
# view; yaw and lateral motion follow the first bend rather than scaling a card.
z=10.0/np.maximum(depth,.01)
z=np.where(depth<.015,1000,z).astype(np.float32)
px=(xs-cx)*z/focal
py=(ys-cy)*z/focal
flat_rgb=rgb.reshape(-1,3)
def point_view(advance,lateral,yaw):
    xx=px-lateral
    zz=z-advance
    rx=np.cos(yaw)*xx-np.sin(yaw)*zz
    rz=np.sin(yaw)*xx+np.cos(yaw)*zz
    ux=np.rint(cx+focal*rx/rz).astype(np.int32).ravel()
    uy=np.rint(cy+focal*py/rz).astype(np.int32).ravel()
    rz=rz.ravel()
    # Splat each projected sample into a small footprint, with a z buffer.
    target_z=np.full(W*H,np.inf,dtype=np.float32)
    addresses=[];indices=[];depths=[]
    base_indices=np.arange(W*H)
    for oy,ox in [(0,0),(0,1),(1,0),(1,1),(-1,0),(0,-1)]:
        tx=ux+ox;ty=uy+oy
        valid=(tx>=0)&(tx<W)&(ty>=0)&(ty<H)&(rz>1)
        addr=ty[valid]*W+tx[valid]
        addresses.append(addr);indices.append(base_indices[valid]);depths.append(rz[valid])
        np.minimum.at(target_z,addr,rz[valid])
    output=np.zeros((W*H,3),np.uint8)
    for addr,idx,d in zip(addresses,indices,depths):
        visible=d<=target_z[addr]+.015
        output[addr[visible]]=flat_rgb[idx[visible]]
    missing=np.isinf(target_z).reshape(H,W).astype(np.uint8)*255
    output=output.reshape(H,W,3)
    # Newly disoccluded narrow strips are locally filled. They are approximate,
    # not recovered hidden architecture; record this limitation explicitly.
    return cv2.inpaint(output,missing,5,cv2.INPAINT_TELEA)
header=54;footer=43
for index in range(frame_count):
    u=index/(frame_count-1)
    # Soft acceleration/deceleration; a stable heading, no roll or global zoom.
    eased=u*u*(3-2*u)
    advance=np.float32(3.4*eased)
    lateral=np.float32(-.55*np.sin(np.pi*.85*eased))
    yaw=np.float32(np.deg2rad(-2.0*np.sin(np.pi*eased)+.65*eased))
    view=point_view(advance,lateral,yaw)
    if index==0: view=rgb.copy()
    canvas=Image.new('RGB',(W,H+header+footer),'#101820')
    canvas.paste(Image.fromarray(view),(0,header))
    draw=ImageDraw.Draw(canvas)
    draw.text((14,8),'暮色阶梯城 · S形动线推进',font=font(20,True),fill='#eef2e6')
    draw.text((14,34),'本地视差预演 V2 · 转向与前景退出',font=font(12),fill='#a9bdc4')
    draw.rectangle((0,H+header,W,H+header+2),fill='#28363d')
    draw.text((12,H+header+10),'基于单张V3图推演 · 非真实三维运镜',font=font(13),fill='#b5c6ce')
    frames.append(canvas)

# One palette for the entire clip avoids independent frame-color changes.
palette_sheet=Image.new('RGB',(W,(H+header+footer)*6))
for i,index in enumerate([0,10,20,30,40,49]):palette_sheet.paste(frames[index],(0,i*(H+header+footer)))
palette=palette_sheet.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
indexed=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in frames]
durations=[100 for i in range(frame_count)]
durations[0]+=500;durations[-1]+=700
target=OUT/'terrace-city-approach-local-v2.gif'
indexed[0].save(target,save_all=True,append_images=indexed[1:],duration=durations,loop=0,disposal=1,optimize=True)
frames[0].save(OUT/'terrace-city-approach-local-v2-poster.png')
Image.fromarray(np.uint8(np.clip(depth,0,1)*255)).save(OUT/'terrace-city-approximate-depth.png')
sheet=Image.new('RGB',(W*3,(H+header+footer)),'#101820')
for col,index in enumerate([0,25,49]):sheet.paste(frames[index],(W*col,0))
sheet.save(OUT/'terrace-city-approach-local-v2-contact.jpg',quality=93)
with Image.open(target) as gif:
    actual_duration=0
    for i in range(gif.n_frames):gif.seek(i);actual_duration+=gif.info.get('duration',0)
    actual={'width':gif.width,'height':gif.height,'frames':gif.n_frames,'duration_ms':actual_duration}
record={'createdOn':'2026-11-13','type':'local_single_image_2_5d_scene_previsualization','source':source_path.relative_to(ROOT).as_posix(),'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'gif':target.relative_to(ROOT).as_posix(),'method':'Hand-authored approximate depth layers and inverse perspective remapping; Pillow GIF assembly; no remote generation service','remoteServiceUsed':False,'generatedVideoUsed':False,'cameraDesign':{'motion':'steady forward approach along avenue; stable heading','movement_seconds':movement_seconds,'inverse_depth_advance':strength,'vanishing_point_normalized':[.58,.435]},'limits':['Single-image 2.5D previsualization, not reconstructed 3D or AI-generated video','Cannot reveal genuinely hidden architecture from a single source image','People and environmental states are not independently animated','Loops by returning to the start; not claimed as seamless'],**actual,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
record['cameraDesign']={'motion':'depth-cloud forward reprojection, lateral shift and S-bend heading cue','movement_seconds':5,'forward_scene_units':3.4,'lateral_scene_units':.55,'yaw_degrees':'-2 to +0.65; design values, not measured physical camera'}
record['method']='Local depth-cloud z-buffer reprojection; foreground planes move more than distant landmark; narrow disocclusions filled locally'
record['limits'].append('Newly exposed strips are locally inpainted approximations, not recovered hidden architecture')
(ROOT/'reference/terrace-city-approach-local-v2-gif.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
