"""Typeset a single research map using existing assets; preserve all source files."""
from pathlib import Path
import json
import hashlib
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'exports/research-map-20261121.png'
OUT.parent.mkdir(exist_ok=True)
W,H=3200,5700
BG='#0b141c'; PANEL='#14232d'; EDGE='#29404d'; TEXT='#e9efed'; MUTED='#afc1c6'
GREEN='#c8d99a'; TEAL='#86c5be'; BLUE='#9fc6e7'; GOLD='#efc58c'; PURPLE='#c5b4dc'
im=Image.new('RGB',(W,H),BG); draw=ImageDraw.Draw(im)
FONT=Path(r'C:\Windows\Fonts\msyh.ttc'); BOLD=Path(r'C:\Windows\Fonts\msyhbd.ttc')
fonts={}
def ft(size,bold=False):
    key=(size,bold)
    if key not in fonts: fonts[key]=ImageFont.truetype(str(BOLD if bold else FONT),size)
    return fonts[key]
boxes=[]
def wrap(s,font,width):
    result=[]
    for paragraph in s.split('\n'):
        line=''
        for ch in paragraph:
            if line and draw.textlength(line+ch,font=font)>width:
                result.append(line);line=ch
            else:line+=ch
        result.append(line)
    return result
def txt(x,y,s,size=32,color=TEXT,width=None,bold=False,leading=1.45):
    font=ft(size,bold); lines=wrap(s,font,width) if width else s.split('\n')
    step=round(size*leading)
    for line in lines:
        draw.text((x,y),line,font=font,fill=color);y+=step
    boxes.append((x,y-step,len(lines),s[:24]))
    return y
def panel(x,y,w,h,fill=PANEL,outline=EDGE):
    draw.rounded_rectangle((x,y,x+w,y+h),radius=18,fill=fill,outline=outline,width=2)
def heading(y,num,title,sub=''):
    draw.line((110,y,3090,y),fill=EDGE,width=3)
    txt(110,y+23,num,28,TEAL,bold=True)
    txt(190,y+11,title,52,bold=True)
    if sub:txt(190,y+87,sub,28,MUTED,width=2880)
def photo(path,x,y,w,h):
    with Image.open(ROOT/path) as src:
        src=ImageOps.contain(src.convert('RGB'),(w,h),Image.Resampling.LANCZOS)
        draw.rectangle((x,y,x+w,y+h),fill='#080e13')
        im.paste(src,(x+(w-src.width)//2,y+(h-src.height)//2))
def pill(x,y,label,color=TEAL):
    width=round(draw.textlength(label,font=ft(23,True)))+30
    draw.rounded_rectangle((x,y,x+width,y+40),radius=8,fill='#20333e')
    txt(x+15,y+3,label,23,color,bold=True)
    return width

# Header and reusable working framework.
txt(110,67,'RESEARCH MAP  /  研究截至 2026.11.14 · 状态核对 2026.11.21',27,TEAL,bold=True)
txt(110,124,'奇幻影像与世界构造 · 研究总图',91,bold=True)
txt(110,260,'核心沉淀：用规则构造空间，用人物与镜头组织体验，用光色与节奏强化感受。',39,GREEN,width=2980,bold=True)
txt(110,328,'从参考拆解到原创探索：保留证据、提炼关系、记录配方，并用实际输出校准理解。',30,MUTED)
metrics=[('7','研究主轴'),('40','已整理表现手法'),('1','用户通过的AI成片'),('3','世界规则候选')]
for i,(n,label) in enumerate(metrics):
    x=110+i*752;panel(x,398,724,125)
    txt(x+24,414,n,55,GREEN,bold=True);txt(x+112,443,label,28,MUTED)
steps=['原片与出处','固定关系与变量','场景与世界探索','动作／镜头／声音','输出验收与修正']
for i,s in enumerate(steps):
    x=110+i*606;panel(x,552,556,80,fill='#10202b')
    txt(x+24,569,s,29,TEAL,width=510,bold=True)
    if i<4:txt(x+567,563,'→',36,MUTED)
txt(110,645,'证据起点：25条历史帖子快照，重点核对3条代表原片；另有巨构参考。历史传播数字未用于证明效果因果。',24,MUTED,width=2980)

# Seven axes and one synthesis cell.
heading(684,'01','研究方向：把吸引力拆成可讨论、可检查的关系')
axes=[
('光色与氛围','曝光、饱和度、HDR、冷暖、雾与材质','看亮暗主次与色彩角色'),
('反向思维','倒悬、逆雨、倒影先行、影桥、折叠','改一条规则，保留正常参照'),
('空间与构图','巨构、小主体、卷曲、路线、遮挡','让尺度、层次和入口可读'),
('动作与情绪','骑行、落脚、重心、闭眼与舞步','用重量、轻重与反应承载感受'),
('相机与观看路径','跟随、接近、转向、视差、逐步显露','安排观众先看见什么'),
('时间与声音节律','踩踏、行进、掠过、音乐、停顿','区分速度、频率与声画关系'),
('世界一致性','共同规则、区域、高差、水路、通行','让不同图片能够相互解释'),
('共同验收问题','规则是否可读？关系是否连续？','输出是否有实际证据支持？')]
for i,(title,body,goal) in enumerate(axes):
    x=110+(i%4)*752;y=790+(i//4)*224;panel(x,y,724,204)
    txt(x+24,y+19,f'{i+1:02d}  {title}' if i<7 else title,34,GREEN if i==7 else TEXT,bold=True)
    txt(x+24,y+80,body,28,MUTED,width=675)
    txt(x+24,y+142,goal,27,TEAL,width=675)

# Representative effects: existing evidence images, with state and transferable value.
heading(1280,'02','代表效果：好在哪里，能为我们留下什么？','“价值”指可提炼的关系与用途；不把单个样本当成稳定实现的能力。')
cases=[
 ('弯曲海岸与小骑行者','assets/grassland-special/frame-00.10.jpg','原片观察 @hi_personality',BLUE,'异常空间＋熟悉尺度＋前进路线','价值：提炼空间奇观的可读关系。','边界：开场已弯曲，未证明由平变卷。'),
 ('暮色阶梯城与巨拱','assets/original-keyframes/twilight-terrace-city-arch-v3.png','原创图／GIF试验',GOLD,'远处巨构＋通向它的路线','价值：研究接近、视差与空间揭示。','边界：单图重投影未达到预期推进感。'),
 ('镜面浅海与倒悬城','assets/original-keyframes/mirror-sea-inverted-garden-city-v1.png','原创静态探索',PURPLE,'倒悬实体＋水中倒影＋尺度参照','价值：用反常关系提出世界规则。','边界：重力、生态与生活尚未推导。'),
 ('迈上影子的第一步','assets/original-keyframes/shadow-bridge-first-step-v1.png','原创静态修订',PURPLE,'脚、悬空影子和支撑关系同框','价值：让异常与人的身体发生联系。','边界：静帧不证明真实承托或运动。'),
 ('折叠地图长成山脉','assets/original-keyframes/folded-map-connection-v2.png','原创静态修订',PURPLE,'纸脊接山脊，墨线接河水','价值：通过连续触点表达形态转化。','边界：阶段草案尚非连续折叠动画。'),
 ('倒影先行','assets/original-keyframes/effect-ahead-reflection-v1.png','静态／9秒本地粗剪',GOLD,'正常对应中出现位置与时间差','价值：研究异常察觉和人物反应。','边界：粗剪仍有形变、滑步与反射近似。'),
 ('沉醉前行的舞步','assets/dance-video/chatart-20261114/dance-walk-poster.jpg','用户确认通过',GREEN,'姿态、落脚、跟拍与音乐共同呈现','价值：完成从首帧到成片的验证样本。','边界：精准BPM与逐拍同步未量化。'),
 ('树冠湖泊','assets/style-worlds/canopy-lake-v1.png','世界规则候选',TEAL,'森林承担地面功能，湖泊位于高处','价值：从单张奇观推导上下层空间。','边界：跨图地标、水路与高差待建立。')]
for i,(title,path,status,color,relation,value,limit) in enumerate(cases):
    x=110+(i%4)*752;y=1430+(i//4)*655;panel(x,y,724,630)
    txt(x+22,y+17,title,34,bold=True,width=680)
    photo(path,x+18,y+80,688,345)
    pill(x+22,y+441,status,color)
    txt(x+22,y+493,relation,27,TEXT,width=680)
    txt(x+22,y+538,value,25,TEAL,width=680)
    txt(x+22,y+580,limit,23,MUTED,width=680)
txt(110,2743,'十种效果谱系：海墙｜云穿街｜四季并置｜倒影先行｜逆雨｜建筑垂落｜尺度跃迁｜山体半透明｜景物层片｜昼夜分界',26,MUTED,width=2980)

# Exposure, saturation and HDR: use the same genuine saved teaching frames.
heading(2805,'03','HDR、高曝光与调色：分别增强什么？','同一海岸帧的SDR教学对照；基准已是作者调色后的预览，不是未调色原片。')
comparisons=[
 ('基准 SDR 预览','assets/color-study/baseline-sdr.png','用于比较相同位置的亮暗与颜色。'),
 ('额外曝光 +1 EV','assets/color-study/exposure-plus-one-ev.png','价值：提高整体可读性与明亮感。'),
 ('饱和度 ×1.4','assets/color-study/saturation-1p4.png','价值：强化色彩分区与颜色强度。')]
for i,(title,path,note) in enumerate(comparisons):
    x=110+i*1004;panel(x,2950,972,438)
    txt(x+20,2967,title,32,bold=True)
    photo(path,x+16,3023,940,295)
    txt(x+20,3332,note,26,TEAL,width=930)
lightcards=[
 ('高曝光的价值','抬高中暗部亮度，让环境更易读、画面更通透。','代价：高光可能剪切、层次变薄；亮度提升本身不增加空间深度。'),
 ('HDR的价值','在匹配的信号与显示链路下，为局部高光留下亮度余量，同时组织中暗部层次。','云边、窗灯、反光可成为注意力锚点；效果依赖母版、映射与屏幕。'),
 ('调色与饱和度的价值','通过冷暖、局部对比、色相和强度，让材质、区域与情绪更统一。','饱和度过强会损伤色彩细节；HDR也不等于整体更亮或颜色更艳。')]
for i,(title,value,limit) in enumerate(lightcards):
    x=110+i*1004;panel(x,3410,972,270,fill='#12252b')
    txt(x+24,3428,title,35,GREEN,bold=True)
    yy=txt(x+24,3490,value,29,TEXT,width=920)
    txt(x+24,yy+10,limit,25,MUTED,width=920)
panel(110,3703,2980,205,fill='#1b2930')
txt(138,3724,'HDR机制示意',31,TEAL,bold=True)
txt(138,3780,'中暗部层次',27,MUTED)
draw.rounded_rectangle((440,3782,1180,3825),radius=10,fill='#526e79')
txt(1220,3778,'＋',35,TEXT)
draw.rounded_rectangle((1310,3782,2280,3825),radius=10,fill='#e8d4a5')
txt(2330,3780,'局部高光余量',27,GOLD)
txt(138,3850,'本PNG为SDR信息图，不能演示真实HDR显示；示意条不对应固定亮度倍率或实测峰值。',27,GREEN,width=2910)
txt(110,3930,'已归档依据：作者确认HDR与DaVinci；分析副本带BT.2020／HLG信令。具体调色参数与HDR母版未取得。',27,MUTED,width=2980)

# World organization: all sixteen images have a role, not claimed as connected geography.
heading(4025,'04','把16张图整理成世界：规则候选 → 区域作用 → 待确认的联系')
worlds=[
 ('树冠成为地面','核心：树冠湖泊','内部：根系峡谷／洞穴湿地／巨蕨森林','候选规则：森林承托上层表面，根系连接上下层。','待补：同一地标、高差、承托关系和水路。'),
 ('低处归水，生活抬高','核心：半淹藏书楼','内部：雾中水街／山间水寺／月下庭院','候选规则：低处由水占据，通行与重要内容抬高。','待补：稳定水位、入口与可通行区域。'),
 ('沙漠在上，城市向下','核心：半埋环城','内部：峡谷阶梯／岩壁巨门','候选规则：地表归沙漠，城市向地下展开。','待补：尺度、层级起终点及生活依据。')]
for i,(title,core,inside,rule,gap) in enumerate(worlds):
    x=110+i*1004;panel(x,4135,972,300)
    txt(x+24,4154,title,38,GREEN,bold=True)
    txt(x+24,4220,core,29,TEXT,width=920)
    txt(x+24,4267,inside,27,MUTED,width=920)
    txt(x+24,4320,rule,26,TEAL,width=920)
    txt(x+24,4380,gap,25,MUTED,width=920)
txt(110,4460,'其余归属：城市生活体系4图（交通／居住／种植／基础设施）＋独立视觉母题1图（盐湖孤塔）。',29,TEXT,width=2980)
txt(110,4512,'3核心＋8内部空间＋4城市生活体系＋1母题＝16图全部保留。规则为事后整理的候选，跨图连续性尚未验证。',27,MUTED,width=2980)

# Core deposits: reusable knowledge, not counts of implemented functions.
heading(4610,'05','核心沉淀：下一次创作可以带走什么？')
deposits=[
 ('关系词典','异常几何＋正常参照；转化触点；尺度、遮挡与视线组织。'),
 ('可变参数','主体、比例、密度、留白、视角、曝光、色彩与运动强度。'),
 ('执行材料','原片与抽帧、关键帧、提示词、配乐小样、制作脚本及输出记录。'),
 ('验收方法','规则可读性、接触与重心、跨图对应、连续运动和声音关系。'),
 ('证据分层','区分原片事实、机制解释、创作提案、用户通过与待验证迁移。'),
 ('失败边界','单图补景、姿态插值、接地与精确卡点；记录偏差，定向修正。')]
for i,(title,body) in enumerate(deposits):
    x=110+(i%3)*1004;y=4720+(i//3)*174;panel(x,y,972,154)
    txt(x+24,y+17,title,33,TEAL,bold=True)
    txt(x+24,y+70,body,27,TEXT,width=920)
panel(110,5095,2980,245,fill='#172a2c')
txt(138,5118,'已做到',31,GREEN,bold=True)
txt(325,5120,'原片研究与同帧实验；12场景／36阶段；10种效果；4风格母图＋16地点；局部预演；一条用户通过的成片。',28,TEXT,width=2720)
txt(138,5210,'仍待验证',31,GOLD,bold=True)
txt(325,5212,'跨图空间连续性、跨题材迁移、重复生成稳定性、精准动作与音乐关系；完整3D世界与产品尚未实现。',28,TEXT,width=2720)
txt(110,5382,'当前下一项：森林四图的空间关系与冲突标注——先确认共同地标、水路、高差和入口，再决定缺哪些画面。',31,GREEN,width=2980,bold=True)
txt(110,5490,'依据：原片与作者回复核验记录、光色教学实验、创作原件及制作记录、用户反馈。40项是研究条目，非40项已实现功能。',25,MUTED,width=2980)
txt(110,5550,'网页：127.0.0.1:4186/#overview   ｜   完整研究记录：reference/research-summary-20261114.json   ｜   研究总图 v1',24,MUTED,width=2980)

assert max(b[1] for b in boxes)<H-40
im.save(OUT,optimize=True,dpi=(180,180))
preview=im.copy();preview.thumbnail((1120,1995));preview.save(OUT.with_name('research-map-web-20261121.webp'),quality=88)
manifest={'date':'2026-11-21','artifact':str(OUT.relative_to(ROOT)).replace('\\','/'),'size':[W,H],'method':'Pillow typesetting and layout of existing source images; no new AI images; originals unchanged.','colorMode':'RGB SDR; HDR section is explanatory only.','sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),'sources':[c[1] for c in cases]+[c[1] for c in comparisons],'contentSources':['reference/research-summary-20261114.json','reference/world-construction-20261114.json','reference/color-study-method.json','reference/author-workflow.md','reference/status-audit-20261121.json'],'layoutTextRuns':len(boxes)}
(ROOT/'reference/research-map-20261121.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'output':str(OUT),'size':[W,H],'bytes':OUT.stat().st_size},ensure_ascii=True))
