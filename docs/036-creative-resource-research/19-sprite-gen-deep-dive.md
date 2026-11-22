# 19｜sprite-gen：把短动图整理成小柚回应资产

研究日期：2026-11-22。已核对4段原媒体13处与1张原图、固定提交的14份文档/源码；未运行sprite-gen或制作小柚动图。

对小柚最可用的是建立短回应资产库：先锁定一张基准图，再按“眨眼、点头、收到、谢谢”等单独状态制作、筛选与交付。复用价值来自角色一致性、可读动作、干净边缘、稳定锚点和明确播放规则。它可补充聊天回应、帖子动图和网页待机，仍不能替代写实口播的声音、口型或连续全身表演。

## 来源与观察边界

原帖是作者将游戏精灵工具用于表情包的个人尝试。两段原帖动图分别展示侧身步行和16格表情；引用帖另有转身短片与表情合集，静图则是项目README截图。各媒体没有完整任务映射、同条件对照或计时账单，不能据此确认具体流水线、模型胜负或稳定成功率。当前项目提交晚于原帖，当前能力与原作方法分开记录。

2026-11-22核对2026-11-12公开镜像快照，本轮X原帖直读403。用浏览器原生视频时间轴对4段MP4取13处暂停截图，readyState=4后保存；另看988×1442原始静图。截图1280×720，含黑色播放器留边，秒数为currentTime近似定位，不作逐帧标定。原帖第二动图元数据1280×1424，实际播放器解码1150×1280，分别记录。未下载原媒体、取得原GIF/透明帧或运行生成。

### 原帖第一段：约1秒侧身走路

蓝发、浅色帽子和衣服的Q版角色朝画面左侧，四处取样可见手臂、腿、头发和尾部姿态变化；画布背景近白。看起来是短步行展示，但本轮没有接地、双脚交替、速度和循环接缝量测，不能判为可直接用于游戏的步行资产。

### 原帖第二段：16个情绪格同时变化

4×4布局中有“嗨呀、收到、哈哈哈、爱你、晚安、谢谢你、加油、对不起”等标签。约0.5秒可见闭眼、鞠躬、举手、歪头等不同动作。它是一张多表情展示合集，不是同一个动作的16个连续帧；小柚需要按格再按时间分别整理。

### 引用帖：转身短片与另一套表情合集

2.52秒短片取样见角色从正面到背面再回正面；1.08秒动图也是16格，各格表情和手势有变化。作者用它们表达对另一种做法的不满，但缺少同输入、同动作、同模型配置和相同挑选规则，不据此量化哪套更好。

### 第三张静图：项目介绍，不是生成配方

静图是sprite-gen中文README截图，写明Grok Imagine让角色动起来、sprite-gen提取透明循环、HyperFrames组装展示。它不是小柚参考图、作者原始帧表或生成任务日志；不能把仓库宣传图当作本帖两段动图的已核实制作过程。

## 具体结论

### 作者的“更好”是体验反馈，先保留对照缺口

原帖说找到sprite-gen后效果改善、耗时更长；引用帖吐槽图像模型的动图结果。这不是受控比较：动作、布局、输出尺寸、生成次数和挑选过程都不齐。可记录两类展示的表现形式，不能写成某模型必输、工具必胜或已经省钱。

依据：原帖/引用正文与4段媒体；没有匹配的输入、任务日志与费用。

### 先锁一张基准图，再分清表情状态与时间帧

同一角色的16种表情是16个状态，各状态内才有顺序帧。把16格从左到右播放会把“收到”跳成“爱你”等不同动作。基准图固定发色、帽饰、服装、比例和方向，单个状态再明确起止姿势、锚点、帧数、时长及播放规则；提示词中的身份约束仍要逐帧检查。

依据：原帖2的4×4表情合集；atlas-workflow要求先锁定base；states-and-frames分开状态与帧数。

### 两条流水线各有生成来源，GIF只是一种交付

A路线让图像提供方按动作生成帧行，再提取透明帧、合成图集；B路线由视频模型产生运动，再抽帧、清理和选择循环。当前README主展示明确由Grok Imagine生成运动、sprite-gen提取、HyperFrames合成。不能把所有动态效果归为本地算法，也不能从本帖外观断言作者走了A或B。

依据：固定提交README、atlas-workflow、video文档；原帖没有任务映射。

### 白底视频不等于透明贴纸，交付必须单独验边缘

本帖X交付为MP4，画面近白，无法验证原始透明通道。小柚用于聊天或网页叠放时，应看真正带alpha的帧/PNG图集或合适动图导出，在黑、白和彩色背景核对发丝、衣服浅色区、色键溢色和裁切边缘。输出格式也要按实际平台测试，不能用一段白底预览替代。

依据：实际媒体解码与README透明帧/图集说明；没有本帖原始RGBA资产。

### 动作要按运动验收，循环和播一次分别判断

图集提取通过、脸看着相似，不代表动画连贯。当前文档要求看每状态contact sheet和动态预览；loop=true需检查末帧回首帧，非循环需看开始/中间/结束。提高fps只改变播放速度，不会补出缺失动作。图像帧行的失败运动要求重生成，视频路线另有裁切/修复规则；走跑默认仍属实验性，不能用统一补帧规则掩盖问题。

依据：qa-motion、states-and-frames；本帖步行未做接地或循环QA。

### 真正可复用的交付是图像加清单和播放策略

图集消费者读取manifest.frame_layout中的矩形，并保留状态时序与loop策略，不能只猜等宽网格。核对export_aseprite源码可见它把矩形、每帧duration和state tag映射成Aseprite兼容JSON，既不重编码PNG，也不生成可编辑.aseprite文件；loop仍要由消费者处理。表情动图与网页状态切换因此需各自验证。

依据：engine-export文档与export_aseprite.py静态阅读；未运行Phaser、Flame或作者项目。

### 固定版本、生成入口和工时，别把开源当作零成本

本轮固定提交bb3be7b1，包元数据4.3.0晚于11月5日原帖。中文README仍写CPython3.10+，pyproject实际要求>=3.11，Pillow>=13,<14及NumPy>=2.2.6,<3；未来安装应核对实际发行包。视频路线另需ffmpeg、img2webp及相应账户，部分修复涉及RIFE。provider命令可能消费额度；当前源码许可Apache-2.0，素材和生成服务条件仍需分别核对。未检查本机兼容性。

依据：pyproject、LICENSE、capabilities.py和video文档；本轮仅阅读，未安装、登录或调用。

### 先把小柚变成两种可用回应，再扩成表情库

建议从眨眼待机循环与一次点头回应开始，共用一张可使用的基准图、画幅和锚点。逐个验脸/饰物、动作可读性、边缘、接缝或末态，实际界面小尺寸也要看清。通过后再扩“收到、谢谢、加油”，用于帖子、评论回应或网页状态。它补充轻互动素材，写实口播、音频口型和连续表演仍需另一路线；互动收益尚未量测。

依据：本项目待执行资产规格、交付QA与成本记录；没有小柚生成样例。

## 小柚资产与验收

| 资产/规则 | 内容 | 验收 |
|---|---|---|
| 角色基准 | 一张可使用的完整角色图；脸、发饰、服装、比例、朝向固定 | 先确认基准，逐帧核对关键身份特征；不以提示词代替验收 |
| blink_idle循环 | 同一画幅/锚点，睁眼→闭眼→睁眼；候选4帧4fps | 连续看多轮；检查眼部形变、整体抖动和末首接缝 |
| nod_ack一次回应 | 中立→低头→回正→停留；候选4帧6fps，应用播一次 | 动作可读、回正稳定；触发一次结束，不反复点头 |
| 透明帧与预览 | 保留RGBA帧/图集；按目标平台另出预览与实际文件 | 黑/白/彩底查发丝、浅衣、溢色、残影和裁切 |
| 帧清单与播放 | 矩形、每帧时长/fps、状态名、loop与末态策略 | 按明确矩形取帧；本地与目标界面都回放，不猜网格 |
| QA与成本 | 保留版本、实际提供方、输入、每状态结果、失败和总工时 | 未测试留空；不过关写原因，不只留下最好一帧 |

## 首轮试验（尚未执行）

后续用一张小柚基准制作眨眼循环与一次点头回应，验证短回应能否保持身份、可读且方便复用。本轮只准备研究和模板。

1. 先检查角色基准并选一条路线，记录版本与实际生成入口。
2. 一次只做一个状态，保留原始输出、失败和挑选过程。
3. 提取/整理后逐帧看身份、手部、裁切和锚点，再连续回放。
4. 在黑白彩底验边缘；循环看接缝，一次动作看回正与结束。
5. 导出实际平台文件；网页按清单或动图回放，触发一次点头后回待机。
6. 汇总生成/人工/导出总时间和费用，两个状态可用后再扩表情。

[双状态规格](experiments/19-sprite-gen/asset-plan.example.json) · [QA表](experiments/19-sprite-gen/qa.template.csv) · [版本/工时/费用记录](experiments/19-sprite-gen/trial-record.template.json) · [原作核对](experiments/19-sprite-gen/original-media-review.json)

## 尚缺证据

- 原帖没有每个附件对应的输入、模型设置、sprite-gen版本、路线或提示词。
- 没有同条件A/B、逐帧身份/接地/接缝量测，不能证明模型胜负或游戏可用步行。
- 没有原始GIF/透明帧/图集清单，平台MP4不能验证原始alpha、帧数和体积。
- 当前README与包元数据的Python门槛不一致；本机安装和生成入口未验。
- 没有小柚两状态输出、真实目标平台回放、工时/费用或互动收益数据。

## 来源

- [momoai_daily原帖](https://x.com/momoai_daily/status/2118303168325144791)
- [作者引用帖](https://x.com/momoai_daily/status/2118226982404260240)
- [sprite-gen固定版中文README](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/README.zh-Hans.md)
- [原媒体13处核对](experiments/19-sprite-gen/original-media-review.json)
- [图像帧行流程](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/atlas-workflow.md)
- [动作状态与帧数](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/states-and-frames.md)
- [运动QA规则](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/qa-motion.md)
- [引擎导出边界](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/engine-export.md)
- [Aseprite兼容导出源码](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/sprite_gen/compose/export_aseprite.py)
- [生成调用与能力表源码](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/sprite_gen/workflow/capabilities.py)
- [实际包版本与依赖](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/pyproject.toml)
- [视频生成入口](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/video.md)
- [用户流程与默认值](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/user-workflow.md)
- [源码许可证](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/LICENSE)
- [环境视频无缝循环另一路线](https://github.com/aldegad/sprite-gen/blob/bb3be7b127d46de237e0b4e03f026be4fd207da6/docs/seamless-video-loop.md)
- [资料时间与校验](references/19-sprite-gen/capture.json)

