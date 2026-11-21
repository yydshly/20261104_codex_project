"""Extract dense full-frame reference samples for qualitative action observation.

No motion is generated and no physical cadence or speed is inferred.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets' / 'motion-study'
FFMPEG = shutil.which('ffmpeg')
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=0,zscale=p=bt709:t=bt709:m=bt709:r=full,format=yuvj420p'
CASES = [('grassland-special', 120, '自行车：姿态与观看关系'), ('chasing', 60, '自行车：近景姿态与临边路线'), ('vortex-road', 60, '摩托：车身姿态、路线与背景')]
OUTPUT.mkdir(parents=True, exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 23)
small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 18)
record = {'date':'2026-11-12', 'purpose':'原片动作观察；不生成运动，不量化真实踏频或车速。', 'sampling':'每隔12个源帧取1帧；60fps名义时间间隔0.20秒；每条12帧。', 'preview':'完整画幅，HLG→BT.709 SDR近似预览，再等比例缩小。', 'limits':'这些离散样本不能单独证明稳定踩踏周期；有遮挡、取景变化与生成式形变。慢放与原速原片需共同核对。', 'cases':[]}
for case_id, start, title in CASES:
    target = OUTPUT / case_id
    target.mkdir(exist_ok=True)
    source = ROOT / 'assets' / case_id / 'reference.mp4'
    indexes = [start + 12*i for i in range(12)]
    select = '+'.join(f'eq(n,{n})' for n in indexes)
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-i', str(source), '-vf', f"select='{select}',{TONE},scale=480:270", '-fps_mode', 'vfr', '-frames:v', '12', '-q:v', '2', str(target/'sample-%02d.jpg')],check=True)
    sheet = Image.new('RGB',(1960, 1044),'#101820')
    draw = ImageDraw.Draw(sheet)
    draw.text((16,12),f'{case_id} · {title}',font=font,fill='#eef3ed')
    draw.text((16,50),'原片完整画幅 / 每 0.20 秒一个样本 / SDR 分析预览 / 不是逐帧或踏频测量',font=small,fill='#b3bec7')
    frames=[]
    for i,n in enumerate(indexes):
        picture=target/f'sample-{i+1:02d}.jpg'
        x=16+(i%4)*486
        y=88+(i//4)*312
        with Image.open(picture) as img:
            sheet.paste(img,(x,y))
        draw.text((x+4,y+275),f'{n/60:.2f}s · 源帧 {n}',font=small,fill='#ddec9c')
        frames.append({'nominal_time':n/60,'frame_index':n,'path':picture.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(picture.read_bytes()).hexdigest()})
    sheet_path=OUTPUT/f'{case_id}-action-sequence.jpg'
    sheet.save(sheet_path,quality=94)
    record['cases'].append({'id':case_id,'source':source.relative_to(ROOT).as_posix(),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'contact_sheet':sheet_path.relative_to(ROOT).as_posix(),'frames':frames})
(ROOT/'reference'/'motion-observation-method.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Created 3 full-frame action contact sheets and 36 samples; no cadence measurement.')
