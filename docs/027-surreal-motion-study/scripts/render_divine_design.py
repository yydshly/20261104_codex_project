"""Annotate an unchanged original frame with a visual design reading."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
folder = ROOT / 'assets/divine-multiverse'
font = lambda size, bold=False: ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size)
canvas = Image.new('RGB', (1580, 1200), '#101820')
draw = ImageDraw.Draw(canvas)
draw.text((28, 20), '设计拆解：一个简单的大形，承接一座复杂的城市', font=font(36,True), fill='#f0f2e8')
draw.text((28, 76), '原片 5.00s 完整画幅 + 分析标注 / 设计机制为解读，不是作者公开参数', font=font(22), fill='#aab9bf')
image = Image.open(folder/'frame-05.00.jpg').convert('RGB').resize((540,960),Image.Resampling.LANCZOS)
canvas.paste(image,(28,132))
items = [
    ((.63,.22),'巨环的轮廓简单，尺度越出画框','远看先读出一个强烈大形，再靠近看多层环缘与板块。环顶被裁出画面，强化“这个世界超出视野”的感受。'),
    ((.50,.60),'街道提供明确的观看路径','两侧灯带朝远处亮点收束；下方的路把观众接入上方奇观。画面有入口、过程与落点。'),
    ((.15,.61),'两侧密集，中间留出安静空间','近城的重复结构提供复杂度；道路、天空与环内留白让视线有休息处。细节服从大形。'),
    ((.25,.48),'用局部明亮，组织整幅暗色','环缘偏亮、城市偏暗，暖色地平线与远处雾化分开层次。强光感不等于整幅高曝光，也未证实 HDR。'),
    ((.35,.88),'细小行人，让巨构的体量可感','人物与楼层给出熟悉尺寸。人物主要承担尺度，不必持续追踪某个主角。')
]
def wrap(text,x,y,width,size=25,fill='#b5c1c4'):
    line=''
    for ch in text:
        if draw.textlength(line+ch,font=font(size))>width:
            draw.text((x,y),line,font=font(size),fill=fill)
            line='';y+=size+14
        line+=ch
    if line: draw.text((x,y),line,font=font(size),fill=fill)

for i,(point,title,description) in enumerate(items,1):
    x=28+round(point[0]*540);y=132+round(point[1]*960)
    draw.ellipse((x-20,y-20,x+20,y+20),fill='#101820',outline='#dfeca1',width=3)
    draw.text((x,y-1),str(i),font=font(23,True),anchor='mm',fill='#dfeca1')
    tx=620;ty=144+(i-1)*190
    draw.text((tx,ty),f'0{i}',font=font(24,True),fill='#dfeca1')
    draw.text((tx+58,ty-2),title,font=font(27,True),fill='#edf0e5')
    wrap(description,tx+58,ty+47,830)
draw.text((28,1120),'对应制作顺序：大形与构图 → 层次和尺度 → 光色材质 → 展开空间的镜头 → 后期',font=font(25,True),fill='#dfeca1')
draw.text((28,1163),'来源：@EiiKwesiKay / The Divine Multiverse · 仅用于本研究的原片分析；未改动原帧曝光或饱和度',font=font(19),fill='#96a8b0')
canvas.save(folder/'design-breakdown.jpg',quality=94)
print(folder/'design-breakdown.jpg')
