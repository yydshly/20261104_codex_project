"""Build data.js and a portable offline HTML with all its local media."""
from pathlib import Path
import base64
import json
import mimetypes
import re

ROOT=Path(__file__).resolve().parent


def build():
    prompts=json.loads((ROOT/"prompts/generation.json").read_text(encoding="utf-8"))
    data={
      "source":"http[本机路径已省略]",
      "palette":[
        {"name":"钴蓝","hex":"#0A2E6E","role":"主调 / 结构 / 纵深"},
        {"name":"中国蓝","hex":"#1E56B3","role":"山体 / 节奏 / 活力"},
        {"name":"雾蓝","hex":"#5E8EC7","role":"远近 / 氛围 / 通透"},
        {"name":"瓷蓝","hex":"#A8C6E8","role":"水雾 / 柔和过渡"},
        {"name":"象牙白","hex":"#F7F5EE","role":"空间 / 云瀑 / 留白"},
        {"name":"浅沙色","hex":"#D8C7AA","role":"平衡 / 暖意"},
        {"name":"墨灰蓝","hex":"#6B7C8D","role":"树石 / 纹理"},
        {"name":"墨靛","hex":"#1E2637","role":"细节 / 对比 / 聚焦"}
      ],
      "rules":[
        {"title":"瓷质，承载形体","description":"高光、转折与接触阴影共同建立体积，让色彩沿着结构生长。","annotation":"观察山脊的蓝白褶皱：从体块到色彩，表面与形体相互支持。迁移时先保留新主体的轮廓。","x":47,"y":26},
        {"title":"流线，连接层次","description":"白色瀑布串起高低空间，建立持续的观看路径。","annotation":"白色瀑布贯通不同高差。建筑可用回廊，植物可用叶脉，不必每次照搬瀑布。","x":51,"y":47},
        {"title":"暖白，托住青蓝","description":"深蓝聚焦，淡蓝退远，让大面积浅色空间参与构图。","annotation":"外围空白与雾气让深蓝主体显得集中。留白的位置和形状应随新题材重组。","x":81,"y":24},
        {"title":"点景，建立尺度","description":"扁舟、树木与亭桥是空间参照，让小世界产生可感知的大小关系。","annotation":"小舟与山体形成大小对照。器物迁移可用微缩浮雕，植物迁移可改用露珠。","x":34,"y":80},
        {"title":"疏密，引导停留","description":"密集层叠与开阔水面交替，安排观众看见、转向和呼吸的位置。","annotation":"亭桥附近的细节形成停留点，前景水面与外围留白提供舒缓过渡。","x":67,"y":52}
      ],
      "studies":{
        "landscape":{
          "kicker":"01 / LANDSCAPE STUDY","title":"山水，成为一件瓷器。","lead":"把原作的空间关系重新组织为更明确的瓷质雕塑，先检查形体与材料是否成立。",
          "retained":"青蓝转折、白色瀑布、层叠体积、亭桥与扁舟的尺度关系。",
          "extension":"将地景进一步器物化，用连续釉面和柔光强调立体褶皱。",
          "review":"山体体积、桥亭和瀑布通路可辨。新稿釉光与装饰花纹更明显，画面密度高于原作。",
          "next":"减少表面花纹，降低强反光，扩大山体间的空隙，让水墨般的远近层次回来。",
          "alt":"新生成的蓝白瓷质山水，三段瀑布、桥亭、松树和小舟","width":1086,"height":1448,
          "motionName":"山水 · 水光微动","motionDescription":"只在三段瀑布与下方水面叠加流动高光；山体、亭桥、纹样和小舟保持固定。"},
        "teapot":{
          "kicker":"02 / OBJECT TRANSFER","title":"一把壶，容下山川。","lead":"让景观附着于器物，既有微缩山水，也保留一眼可辨的茶壶结构。",
          "retained":"釉质体积、青蓝重点、暖白通路，和微缩松树提供的大小关系。",
          "extension":"将层叠山体变成壶腹浮雕；高低变化顺着器身曲面组织。",
          "review":"壶嘴、把手、盖缝和落地重心清楚，浮雕主要留在器身。白色通路偏釉面沟槽，独立水感较弱。",
          "next":"保留器物轮廓，减少次要山纹；若加入水流，只在一处短通路试验，先验证边界。",
          "alt":"新生成的青花茶壶，壶嘴把手完整，壶腹为层叠山川浮雕","width":1448,"height":1086,
          "motionName":"茶器 · 蒸汽微动","motionDescription":"只在壶盖上方叠加轻缓上升的蒸汽提示；壶嘴、把手、浮雕与青蓝纹样保持固定。"},
        "lotus":{
          "kicker":"03 / BOTANICAL TRANSFER","title":"花瓣，也可以是地形。","lead":"让层叠与通路进入植物结构，检验离开山水题材后，材质语法还能保留多少。",
          "retained":"蓝白瓷质、花瓣的层叠体积、青蓝叶脉，以及外围暖色留白。",
          "extension":"用花瓣重述层叠，用叶脉承接流线；微小露珠替代亭桥等尺度参照。",
          "review":"莲花身份、花心、茎叶关系清楚，釉质与蓝白层次可见。露珠带来的尺度对照较弱，整体更接近瓷质植物。",
          "next":"在保持花瓣与茎叶识别的前提下，增强叶片通路的连续性；控制强高光，留出更多呼吸空间。",
          "alt":"新生成的蓝白瓷质莲花，有花心、弯曲花茎、两片叶子和细小露珠","width":1448,"height":1086,
          "motionName":"莲花 · 露珠光泽","motionDescription":"只在两颗露珠附近改变局部高光；花瓣、花心、叶脉和茎叶位置保持固定。"}
      },
      "videoPrompt":"先实际上传并指定合格的青花茶壶静帧为图像输入。以这张图作为外观与构图锚点，目标约6秒、单个连续固定镜头。茶壶的轮廓、壶嘴、把手、壶盖、浮雕层次、微缩松树数量、青蓝纹样和落地关系保持稳定。只让壶盖上方已有的极淡蒸汽缓慢上升、轻微舒展并消散，速度平缓、幅度很小。保持暖白留白、瓷质高光和照明稳定。不要结构呼吸、融化、纹样滑动、颜色闪烁、新增物体或镜头跳切。无音乐、无对白、无音效。无需强行循环。实际时长、画幅与模型参数按所选服务支持范围确认。此文本是下一轮试稿，尚未执行 AI 视频生成。"
    }
    for key,study in data["studies"].items():
        study.update(image=f"assets/generated/{key}.webp",original=f"assets/generated/{key}.png",motionFile=f"assets/generated/{key}-motion.mp4",prompt=prompts[key])
    if (ROOT/'prompts/ai-teapot-v2.txt').exists():
        data['videoPrompt']=(ROOT/'prompts/ai-teapot-v2.txt').read_text(encoding='utf-8')
    data_js="window.STUDY = "+json.dumps(data,ensure_ascii=False,indent=2)+";\n"
    (ROOT/"data.js").write_text(data_js,encoding="utf-8")
    ai_data=json.loads((ROOT/"ai-validation.json").read_text(encoding="utf-8")) if (ROOT/"ai-validation.json").exists() else None
    if ai_data:
        (ROOT/"ai-validation-data.js").write_text("window.AI_VALIDATION = "+json.dumps(ai_data,ensure_ascii=False,indent=2)+";\n",encoding="utf-8",newline="\n")
    html=(ROOT/"index.html").read_text(encoding="utf-8")
    html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:"<style>"+(ROOT/m.group(1)).read_text(encoding="utf-8")+"</style>",html)
    script_files=re.findall(r'<script src="([^"]+)" defer></script>',html)
    files=set()
    for value in re.findall(r'(?:src|href|poster|data-zoom)="([^"]+)"',html):
        if (ROOT/value).is_file() and value!="overview.html" and not value.endswith((".css",".js")): files.add(value)
    for study in data["studies"].values():
        files.update(study[k] for k in ["image","original","motionFile"])
    files.update(["assets/original/landscape-poster.webp","assets/original/palette-study.webp","assets/original/contact-sheet.jpg"])
    def include_paths(value):
        if isinstance(value,dict):
            for child in value.values(): include_paths(child)
        elif isinstance(value,list):
            for child in value:include_paths(child)
        elif isinstance(value,str) and value.startswith(("assets/","reports/","prompts/")) and (ROOT/value).is_file():files.add(value)
    if ai_data:include_paths(ai_data)
    inline={}
    for filename in sorted(files):
        mime=mimetypes.guess_type(filename)[0] or "application/octet-stream"
        inline[filename]="data:"+mime+";base64,"+base64.b64encode((ROOT/filename).read_bytes()).decode("ascii")
    for filename,url in inline.items():
        for attribute in ["src","href","poster","data-zoom"]:
            html=html.replace(f'{attribute}="{filename}"',f'{attribute}="{url}"')
    scripts="<script>window.INLINE_ASSETS="+json.dumps(inline,separators=(",",":"))+";</script>"+"".join("<script>"+(ROOT/name).read_text(encoding="utf-8").replace("</script","<\\/script")+"</script>" for name in script_files)
    html=re.sub(r'<script src="([^"]+)" defer></script>',"",html)
    html=html.replace("</body>",scripts+"</body>")
    html=html.replace('<a href="overview.html" download>保存离线单文件网页 ↓</a>','<button class="text-link" onclick="const a=document.createElement(\'a\');a.href=URL.createObjectURL(new Blob([\'<!doctype html>\'+document.documentElement.outerHTML],{typ[本机路径已省略]'text/html\'}));a.download=\'青白造境-离线网页.html\';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)">保存此离线网页 ↓</button>')
    (ROOT/"overview.html").write_text(html,encoding="utf-8")
    print(json.dumps({"offline_bytes":len(html.encode("utf-8")),"embedded_assets":len(inline),"data":"data.js"}))

if __name__=="__main__": build()
