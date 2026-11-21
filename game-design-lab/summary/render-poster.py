"""Render the text-led reference map as PNG and a self-contained SVG.

This is editorial layout with official reference images, not generated game art.
Chinese text uses a local CJK font so the downloadable image is deterministic.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
from html import escape
import base64, io, json, os

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'summary/content.json').read_text(encoding='utf-8'))
W,H=2400,2000
canvas=Image.new('RGB',(W,H),'#10191f'); draw=ImageDraw.Draw(canvas)
font_paths=[Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts/msyh.ttc',Path('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc'),Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')]
font_path=next((p for p in font_paths if p.exists()),None)
if font_path is None: raise RuntimeError('A CJK font is required for the overview poster.')
bold_path=font_path.with_name('msyhbd.ttc') if font_path.name=='msyh.ttc' else font_path
if not bold_path.exists():bold_path=font_path
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', '<title>五款游戏，五种设计方向</title><desc>五款游戏的原作画面、核心循环、美术特点、参考意义、扩展提案与验证问题。</desc>', '<rect width="2400" height="2000" fill="#10191f"/>']
def font(size,bold=False):return ImageFont.truetype(str(bold_path if bold else font_path),size)
def rect(x,y,w,h,fill,r=0):
    draw.rounded_rectangle((x,y,x+w,y+h),radius=r,fill=fill)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>')
def text(x,y,value,size=26,color='#edf1ef',bold=False):
    f=font(size,bold);draw.text((x,y),value,font=f,fill=color,anchor='lt')
    # SVG uses a text-before-edge baseline to preserve editable, selectable text.
    svg.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" dominant-baseline="text-before-edge">{escape(value)}</text>')
def wrap(value,width,size,bold=False):
    lines=[];line='';f=font(size,bold)
    for char in value:
        if char=='\n':lines.append(line);line='';continue
        if line and draw.textlength(line+char,font=f)>width:
            if char in '，。、；：？！）》」』' and len(line)>1:
                lines.append(line[:-1]);line=line[-1]+char
            else:lines.append(line);line=char
        else:line+=char
    if line:lines.append(line)
    return lines
def para(x,y,value,width=374,size=26,color='#c5d1d5',leading=40,bold=False,max_lines=None):
    lines=wrap(value,width,size,bold)
    if max_lines and len(lines)>max_lines:raise ValueError(f'Poster overflow: {value}: {len(lines)} > {max_lines}')
    for i,line in enumerate(lines):text(x,y+i*leading,line,size,color,bold)
    return y+len(lines)*leading
def photo(x,y,w,h,path):
    source=Image.open(path).convert('RGB');im=ImageOps.fit(source,(w,h),method=Image.Resampling.LANCZOS)
    canvas.paste(im,(x,y));out=io.BytesIO();im.save(out,format='JPEG',quality=94)
    uri='data:image/jpeg;base64,'+base64.b64encode(out.getvalue()).decode()
    svg.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" xlink:href="{uri}"/>')

text(80,60,'PLAY / FORM     ·     游戏设计参考地图',23,'#a4b6be')
text(80,112,DATA['title'],76,'#f3f5ee',True)
text(82,222,'理解乐趣怎样产生，借鉴机制与表达，再寻找自己的变化。',30,'#b9c8ce')
text(2040,82,DATA['date'],25,'#b9c8ce')
rect(80,282,2240,2,'#34434c')
for i,g in enumerate(DATA['games']):
    x=80+i*452;y=320;width=432
    rect(x,y,width,1400,'#1a272e',12);rect(x,y,width,5,g['color'])
    text(x+24,y+31,g['name'],36,'#f0f3ec',True)
    text(x+24,y+90,g['en'],20,'#9bafb9')
    photo(x+24,y+141,384,216,ROOT/'assets'/g['image'])
    text(x+24,y+371,'原作官方实机画面 · 局部',19,'#91a5ae')
    text(x+24,y+422,g['direction'],36,g['color'],True)
    text(x+24,y+478,g['genre'],24,'#e0e6e3')
    rect(x+24,y+531,384,1,'#35454e')
    text(x+24,y+555,'核心循环',21,g['color'],True)
    loop=' → '.join(g['loop'][:2])+'\n'+' → '.join(g['loop'][2:])
    para(x+24,y+596,loop,size=26,color='#edf1ec',leading=40,max_lines=2)
    text(x+24,y+704,'参考意义',21,g['color'],True)
    para(x+24,y+744,g['meaning'],size=25,leading=39,max_lines=3)
    text(x+24,y+886,'美术语言',21,g['color'],True)
    para(x+24,y+926,g['art'],size=25,leading=39,max_lines=3)
    text(x+24,y+1065,'扩展提案 · 待验证',21,g['color'],True)
    para(x+24,y+1105,g['extension'],size=25,color='#edf1ec',leading=39,max_lines=4)
    text(x+24,y+1284,'先验证一个问题',21,g['color'],True)
    para(x+24,y+1324,g['validate'],size=24,color='#c5d1d5',leading=36,max_lines=2)

text(80,1760,'把参考变成自己的设计',31,'#f3f5ee',True)
text(650,1763,'选一个主循环    →    做清楚反馈    →    加入独特变化    →    小样验证',29,'#bfcdd2')
text(80,1838,'这轮的教训',23,'#ffb68a',True)
text(290,1832,'功能齐全 ≠ 值得玩。先验证选择是否有趣、结果是否可读、玩家是否愿意再来一次。',29,'#edf1ec')
text(80,1904,'参考意义与扩展方向为我们的分析，不是原作功能或市场预测。详细提案、验证问题与来源见配套网页。',23,'#a6b8c1')
text(80,1950,'原作画面来源：官方 Steam 商店。名称、截图及相关权利归各自权利人。',19,'#8299a5')
svg.append('</svg>')
(ROOT/'assets/design-map.svg').write_text('\n'.join(svg),encoding='utf-8')
canvas.save(ROOT/'assets/design-map.png',optimize=True)
print(f'Overview: {W}×{H} PNG + self-contained SVG. Font: {font_path.name}')
