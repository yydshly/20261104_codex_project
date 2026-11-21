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
strength=.16
header=54;footer=43
for index in range(frame_count):
    u=index/(frame_count-1)
    # Soft acceleration/deceleration; a stable heading, no roll or global zoom.
    eased=u*u*(3-2*u)
    advance=np.float32(strength*eased)
    sx=xs.copy();sy=ys.copy()
    for _ in range(6):
        local_depth=cv2.remap(depth,sx,sy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        factor=1-advance*local_depth
        sx=cx+(xs-cx)*factor
        sy=cy+(ys-cy)*factor
    view=cv2.remap(rgb,sx,sy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
    canvas=Image.new('RGB',(W,H+header+footer),'#101820')
    canvas.paste(Image.fromarray(view),(0,header))
    draw=ImageDraw.Draw(canvas)
    draw.text((14,8),'暮色阶梯城 · 沿路接近巨拱',font=font(20,True),fill='#eef2e6')
    draw.text((14,34),'本地分层视差预演',font=font(12),fill='#a9bdc4')
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
target=OUT/'terrace-city-approach-local.gif'
indexed[0].save(target,save_all=True,append_images=indexed[1:],duration=durations,loop=0,disposal=1,optimize=True)
frames[0].save(OUT/'terrace-city-approach-local-poster.png')
Image.fromarray(np.uint8(np.clip(depth,0,1)*255)).save(OUT/'terrace-city-approximate-depth.png')
sheet=Image.new('RGB',(W*3,(H+header+footer)),'#101820')
for col,index in enumerate([0,25,49]):sheet.paste(frames[index],(W*col,0))
sheet.save(OUT/'terrace-city-approach-local-contact.jpg',quality=93)
with Image.open(target) as gif:
    actual_duration=0
    for i in range(gif.n_frames):gif.seek(i);actual_duration+=gif.info.get('duration',0)
    actual={'width':gif.width,'height':gif.height,'frames':gif.n_frames,'duration_ms':actual_duration}
record={'createdOn':'2026-11-13','type':'local_single_image_2_5d_scene_previsualization','source':source_path.relative_to(ROOT).as_posix(),'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'gif':target.relative_to(ROOT).as_posix(),'method':'Hand-authored approximate depth layers and inverse perspective remapping; Pillow GIF assembly; no remote generation service','remoteServiceUsed':False,'generatedVideoUsed':False,'cameraDesign':{'motion':'steady forward approach along avenue; stable heading','movement_seconds':movement_seconds,'inverse_depth_advance':strength,'vanishing_point_normalized':[.58,.435]},'limits':['Single-image 2.5D previsualization, not reconstructed 3D or AI-generated video','Cannot reveal genuinely hidden architecture from a single source image','People and environmental states are not independently animated','Loops by returning to the start; not claimed as seamless'],**actual,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(ROOT/'reference/terrace-city-approach-local-gif.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
