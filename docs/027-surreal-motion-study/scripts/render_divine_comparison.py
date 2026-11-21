"""Lay out three unchanged decoded frames with time labels for reference comparison."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
folder = root / 'assets/divine-multiverse'
font = lambda size: ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', size)
canvas = Image.new('RGB', (1152, 840), '#101820')
draw = ImageDraw.Draw(canvas)
draw.text((24, 13), '巨环在开场已存在，观看过程让城市逐渐展开', font=font(28), fill='#eff2e7')
draw.text((24, 58), 'The Divine Multiverse · 原片完整画幅抽帧 · 未追加曝光或饱和度', font=font(18), fill='#b4c0c0')
for x, time, title, note in [(24,'00.10','0.10s / 奇观已成立','环形巨构、街道与小人同框'),(400,'05.00','5.00s / 持续接近','近景变化更大，远处目标稳定'),(776,'10.00','10.00s / 空间更开阔','近楼退出，更多屋顶显露')]:
    pic = Image.open(folder / f'frame-{time}.jpg').convert('RGB')
    pic = pic.resize((352,626),Image.Resampling.LANCZOS)
    canvas.paste(pic,(x,98))
    draw.text((x,735),title,font=font(22),fill='#e1eca4')
    draw.text((x,770),note,font=font(18),fill='#c2cbcc')
draw.text((24,810),'来源：@EiiKwesiKay 原帖 · 2026-11-13 核对 · 运动机制为视觉分析，非精确三维测量',font=font(16),fill='#9dacad')
canvas.save(folder/'three-frame-comparison.jpg',quality=94)
print(folder/'three-frame-comparison.jpg')
