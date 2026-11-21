"""Assemble three existing static design versions into an explicitly labelled GIF."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'assets/gif-studies'
OUT.mkdir(parents=True, exist_ok=True)
font = lambda size, bold=False: ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc',size)
entries = [
    ('V1','近处巨拱，强调压迫感','巨拱的体量强烈，路线的存在感较弱。',2800),
    ('V2','显露路线，巨拱偏小','S形道路连接目的地，天空留白增多。',2800),
    ('V3','远处巨构，保留进入感','保留路线，增强远处巨拱的体量。',3600)
]
frames=[]
for version,title,note,duration in entries:
    canvas=Image.new('RGB',(640,1040),'#101820')
    draw=ImageDraw.Draw(canvas)
    draw.text((20,12),'暮色阶梯城 · 原创设计迭代',font=font(25,True),fill='#eef2e6')
    draw.text((20,48),'静态版本轮播 / 非场景运镜',font=font(17),fill='#a5b5bd')
    path=ROOT/f'assets/original-keyframes/twilight-terrace-city-arch-{version.lower()}.png'
    image=Image.open(path).convert('RGB')
    image.thumbnail((600,848),Image.Resampling.LANCZOS)
    canvas.paste(image,((640-image.width)//2,80))
    draw.text((20,941),f'{version} / {title}',font=font(24,True),fill='#dfeca1')
    draw.text((20,980),note,font=font(20),fill='#c1cdd0')
    draw.text((20,1015),'内置 image_gen 静态图 · GIF仅用于对照设计变化',font=font(13),fill='#91a4ae')
    frames.append(canvas)
# A shared palette limits flashing across cuts. The images are never geometrically morphed.
palette_source=Image.new('RGB',(640,1040*len(frames)))
for i,frame in enumerate(frames): palette_source.paste(frame,(0,1040*i))
palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
quantized=[frame.quantize(palette=palette,dither=Image.Dither.FLOYDSTEINBERG) for frame in frames]
target=OUT/'terrace-city-design-iterations.gif'
quantized[0].save(target,save_all=True,append_images=quantized[1:],duration=[e[3] for e in entries],loop=0,disposal=2,optimize=False)
frames[0].save(OUT/'terrace-city-design-iterations-poster.png')
with Image.open(target) as gif:
    durations=[]
    for i in range(gif.n_frames):
        gif.seek(i);durations.append(gif.info.get('duration',0))
    metadata={'width':gif.width,'height':gif.height,'frame_count':gif.n_frames,'duration_ms':sum(durations),'frame_durations_ms':durations}
record={'createdOn':'2026-11-13','type':'labelled_static_design_version_sequence','method':'Pillow assembly from existing V1/V2/V3 PNGs; shared 256-color palette; no new generative images or motion','scope':'GIF demonstrates design iteration only; it is not camera motion, a 3D render or a continuous scene','gif':target.relative_to(ROOT).as_posix(),'sources':[f'assets/original-keyframes/twilight-terrace-city-arch-{e[0].lower()}.png' for e in entries],**metadata,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(ROOT/'reference/terrace-city-design-gif.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
