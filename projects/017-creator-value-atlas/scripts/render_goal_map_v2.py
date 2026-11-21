"""A goal-first relationship map, distinct from the detailed inventory poster."""
from pathlib import Path
from html import escape
import re
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
W, M, GAP = 3600, 110, 34
CW = W - M*2
INK, GREEN, MUTED = '#203d37', '#2f6955', '#576b62'
BG, LINE, AMBER = '#f2f5f0', '#cedbcf', '#98652e'
fonts, ops, checks = {}, [], []
md = ImageDraw.Draw(Image.new('RGB',(1,1)))

def ft(size,bold=False):
    key=(size,bold)
    if key not in fonts:
        fonts[key]=ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc',size)
    return fonts[key]

def rect(x,y,w,h,fill,r=20,stroke=None):ops.append(('rect',(x,y,w,h,fill,r,stroke)))
def txt(x,y,s,size=40,color=INK,bold=False):ops.append(('text',(x,y,s,size,color,bold)))
def rule(x1,y1,x2,y2,color=LINE,width=3):ops.append(('line',(x1,y1,x2,y2,color,width)))
def arrow(x,y,color=GREEN,down=False):
    if down:
        rule(x,y,x,y+37,color,5);rule(x,y+37,x-13,y+22,color,5);rule(x,y+37,x+13,y+22,color,5)
    else:
        rule(x,y,x+24,y,color,5);rule(x+24,y,x+11,y-12,color,5);rule(x+24,y,x+11,y+12,color,5)

def wrap(s,w,size=40,bold=False):
    lines=[]
    for p in s.split('\n'):
        line=''
        for token in re.findall(r'[A-Za-z0-9_/.+−%–：-]+|.',p):
            if line and md.textlength(line+token,font=ft(size,bold))>w:
                lines.append(line.rstrip());line=token.lstrip()
            else:line+=token
        lines.append(line.rstrip())
    return lines

def para(x,y,s,w,size=40,color=MUTED,bold=False,lh=None):
    lh=lh or round(size*1.5)
    for v in wrap(s,w,size,bold):txt(x,y,v,size,color,bold);y+=lh
    return y

def section(y,k,title,note=None):
    txt(M,y,k,31,GREEN,True);txt(M+95,y-7,title,58,INK,True)
    y+=82
    if note:y=para(M+95,y,note,CW-95,35,lh=52)+15
    return y+18

def cards(y,items,cols=3,size=39):
    w=(CW-(cols-1)*GAP)/cols
    heights=[]
    for tag,title,blocks in items:
        heights.append(35+48+len(wrap(title,w-78,46,True))*64+22+sum(len(wrap(b,w-78,size))*round(size*1.5)+22 for b in blocks)+25)
    h=max(heights)
    for i,(tag,title,blocks) in enumerate(items):
        x=M+i*(w+GAP)
        rect(x,y,w,h,'#ffffff',24,LINE)
        py=y+34
        txt(x+38,py,tag,29,GREEN,True);py+=48
        py=para(x+38,py,title,w-76,46,INK,True,64)+22
        for b in blocks:py=para(x+38,py,b,w-76,size)+22
        assert py<y+h, (title,py,y+h)
        checks.append({'title':title,'bottom':py-y,'height':h})
    return y+h+GAP

# Main question, explicitly above the field used as a research sample.
rect(0,0,W,455,INK,0)
txt(M,52,'重新对齐研究目标  /  观源 · 2026.11.21',34,'#c9dfc7',True)
txt(M,126,'把平台、领域和博主整理好，能成为有价值的产品吗？',83,'#ffffff',True)
para(M,265,'我们要让使用者知道：去哪里找、找谁、看什么、为什么值得，\n以及怎样把这些信息用于学习、研究、推广或合作。',CW,45,'#e1ece4',lh=68)
y=503
rect(M,y,CW,155,'#dfeade',24)
txt(M+35,y+24,'独立游戏 = 第一个深入研究的领域样板',52,INK,True)
txt(M+35,y+102,'它用来检验“整理方法能否帮助具体任务”；游戏制作与发行计划，是这个样板里的应用延伸。',36,MUTED)
y+=205

y=section(y,'01','你的问题，怎样一步步变成我们的研究','保留问题之间的关系，说明每次扩展是在回答什么。')
stages=[
 ('你先问','Monid 与博主采集','由此引出：采集到的信息，怎样经过整理形成价值？'),
 ('接着问','这种产品有没有价值','研究用途、筛选依据，以及整理成果能否帮助别人。'),
 ('然后提出','平台 × 领域 × 博主','形成信息组织框架：在哪里、哪个方向、谁有相关作品。'),
 ('再选样板','先把独立游戏做深','加入大作者、小众专业作者、中文资料与学习顺序。'),
 ('最后做应用','发行复盘、对比和计划','检验作者经验能否变成决策材料和可执行任务。')
]
sw=(CW-4*GAP)/5
sh=330
for i,(tag,title,body) in enumerate(stages):
    x=M+i*(sw+GAP)
    rect(x,y,sw,sh,'#ffffff',22,LINE)
    txt(x+27,y+23,tag,29,GREEN,True)
    py=para(x+27,y+78,title,sw-54,42,INK,True,57)+19
    py=para(x+27,py,body,sw-54,34,lh=50)
    assert py<=y+sh-10,(title,py,y+sh)
    if i<4:arrow(x+sw+5,y+sh/2)
y+=sh+45

y=section(y,'02','研究骨架：信息经过什么处理，才对使用者有用')
chain=[('平台入口','哪里更容易找到目标内容'),('细分领域','把宽泛兴趣拆成具体问题'),('作者与代表作','谁做过、哪份资料能证明'),('价值与适用条件','擅长什么、为什么值得看'),('按任务交付','给出候选、理由和使用顺序')]
ch=220
for i,(title,body) in enumerate(chain):
    x=M+i*(sw+GAP)
    rect(x,y,sw,ch,'#dfeade',22)
    txt(x+25,y+25,title,43,INK,True)
    para(x+25,y+102,body,sw-50,35,INK,lh=51)
    if i<4:arrow(x+sw+5,y+ch/2)
y+=ch+28
y=para(M,y,'判断原则：体量、专业程度、受众匹配、合作效果分别看证据；大作者也可能很垂直，小作者也可能跨主题。\nMonid 等工具位于采集环节；分类、作品核对、用途判断、更新和使用反馈，构成后续整理工作。',CW,36,MUTED,lh=54)+37

y=section(y,'03','我们已经做的内容，分别与目标有什么关联','研究资料并不是并列堆积；每一层都要回答一个使用问题。')
y=cards(y,[
 ('第一层 · 发现','“去哪里找？”',[
  '已整理：12 个平台与分发入口、12 个一级领域。',
  '与目标的关系：为不同目的、语言和内容形式提供检索入口。',
  '当前边界：各领域深度不同，独立游戏最深入；分类不等于市场已充分覆盖。']),
 ('第二层 · 识别','“哪些人值得关注？”',[
  '已整理：全站 42 位作者样本；独立游戏 28 位，其中 12 位中文作者，配 56 份代表资料。',
  '与目标的关系：用擅长方向、作品和出处解释关注理由，而非只列账号。',
  '当前边界：多数体量、受众画像和合作条件待核。']),
 ('第三层 · 使用','“找到后，怎样用？”',[
  '已整理：5 条学习路线；5 个中文发行案例的横比；单人低预算发行模板。',
  '与目标的关系：从作者经验提炼学习顺序、方法取舍、成本与避坑。',
  '当前边界：这证明已有可使用的资料组织方式，真实效果与付费价值仍待验证。'])
])

y=section(y,'04','独立游戏样板内部，其实存在两种不同的用途','区分用途，才能看清现有资料支持哪些任务，以及推广合作还缺什么。')
y=cards(y,[
 ('用途 A · 当前资料较完整','学习与经验研究',[
  '使用者的问题：我想学设计、做原型，或理解别人怎样发行。',
  '现有资料：GMTK、Maddy、麦扣等人的作品与教学；亚恒、夜神、叶千落、传传、蓝桃的项目复盘。',
  '交付：值得读的资料、前置知识、阅读顺序、案例条件，以及可借用的方法。']),
 ('用途 B · 尚需系统补充','推广作者发现与合作匹配',[
  '使用者的问题：我的具体游戏，适合找哪些作者介绍或传播？',
  '需要补齐：同类型游戏评测、实况和垂直内容作者；近期作品、观众匹配、公开联系入口与可确认的合作条件。',
  '交付：有依据的候选名单与匹配理由，之后再通过真实沟通核实条件和效果。'])
],cols=2,size=40)
rect(M,y,CW,155,'#eee6d5',24)
txt(M+34,y+24,'当前最关键的缺口',41,AMBER,True)
para(M+34,y+87,'已收录的开发者、教程作者和发行经验作者，可以帮助我们学习与判断；尚不能据此确认“谁适合为某款游戏做推广、成本多少、效果如何”。',CW-68,36,INK,lh=53)
y+=198

y=section(y,'05','用三个例子，把“资料”与“研究目的”直接连起来')
examples=[
 ('想学游戏手感','Maddy 的 Celeste 容错与手感资料','选择学习材料，回原型练习','已有资料支持'),
 ('想设计低预算宣发','亚恒等人的真实发行复盘＋五案横比','借用方法、分清成本，再编排计划','已有资料支持'),
 ('想找到适合推广新游的人','需要补同类型评测 / 实况作者及合作信息','先给出匹配候选，再验证合作条件','后续待补与验证')
]
ew=[690,1160,1030,CW-690-1160-1030]
for i,row in enumerate(examples):
    rh=185
    x=M
    for j,(s,w) in enumerate(zip(row,ew)):
        rect(x,y,w,rh,'#ffffff' if i%2==0 else '#e7eee4',0,LINE)
        para(x+25,y+29,s,w-50,36,INK if j==0 else MUTED,bold=j==0,lh=53)
        x+=w
    y+=rh
y+=40

y=section(y,'06','方向：围绕具体用途，把创作者资料变成可验证的交付','以下是对现有研究的方向归纳，尚未形成付费与盈利结论。')
y=cards(y,[
 ('产品是什么','有证据、有用途的专题情报',[
  '基础层：领域地图、作者与代表作、关注理由、来源和更新日期。',
  '任务层：学习资料包、研究横比，或推广合作候选及匹配理由。',
  '候选价值：减少查找与核对时间，帮助作选择；价值需要实际使用证明。']),
 ('下一步验证什么','先验证一个明确的用户任务',[
  '若服务学习：观察能否更快找到合适资料、看懂顺序、完成练习。',
  '若服务推广：补齐评测 / 实况作者样本，观察候选是否匹配，合作条件能否确认。',
  '分别记录使用结果、缺失信息、维护工时与付费意愿，避免混用两种用途的验收标准。']),
 ('怎样考虑商业化','先有有效交付，再谈收费形式',[
  '候选形式：专题整理与更新、定制筛选与研究；合作条件充分确认后，再考虑执行服务。',
  '验证：用户是否重复使用、是否愿意付费，采集、复核、更新与获客投入能否覆盖。',
  '扩展：先把独立游戏样板的一个用途跑通，再复制到其他细分领域。'])
])

rect(M,y,CW,225,INK,24)
txt(M+36,y+30,'整条研究主线',38,'#c9dfc7',True)
txt(M+36,y+99,'找到信息 → 理解作者与作品 → 判断任务匹配 → 帮助选择与行动 → 验证产品价值',49,'#ffffff',True)
y+=270
y=para(M,y,'资料范围：2026.11.21 项目现有网页与 109 条去重来源。作者样本并非完整市场，关注理由与路线属于编辑判断。\n本图用于说明研究目标、已有成果与缺口的关系；没有新增推广名单、商业询价、实际发信、投放或付费验证。',CW,30,MUTED,lh=47)+65
H=int(y)

im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t de">',
 '<title id="t">创作者情报产品研究：目标、成果与缺口关系图</title>',
 '<desc id="de">从用户最初的问题梳理平台、领域、作者与作品的组织框架，说明独立游戏样板如何验证资料用途，并区分已有学习经验资料与待补的推广合作信息。</desc>',
 f'<rect width="100%" height="100%" fill="{BG}"/><g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">']
for kind,args in ops:
    if kind=='rect':
        x,y,w,h,fill,r,stroke=args
        d.rounded_rectangle((round(x),round(y),round(x+w),round(y+h)),r,fill,stroke,width=2)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>')
    elif kind=='line':
        x1,y1,x2,y2,color,width=args
        d.line((x1,y1,x2,y2),fill=color,width=width)
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>')
    else:
        x,y,s,size,color,bold=args
        assert md.textlength(s,font=ft(size,bold))+x<=W-M+5,(s,x)
        d.text((round(x),round(y)),s,font=ft(size,bold),fill=color,anchor='lt')
        svg.append(f'<text x="{x}" y="{y+size*.88}" font-size="{size}" fill="{color}" font-weight="{700 if bold else 400}">{escape(s)}</text>')
svg.append('</g></svg>')
stem='research-goal-map-v2-20261121'
png=OUT/(stem+'.png')
im.save(png,optimize=True)
(OUT/(stem+'.svg')).write_text('\n'.join(svg),encoding='utf8')
im.resize((1400,round(H*1400/W)),Image.Resampling.LANCZOS).save(OUT/(stem+'-preview.jpg'),quality=90)
(OUT/(stem+'-audit.json')).write_text(json.dumps({'width':W,'height':H,'cards':checks,'examples':len(examples)},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'png':str(png),'size':[W,H],'bytes':png.stat().st_size},ensure_ascii=False))
