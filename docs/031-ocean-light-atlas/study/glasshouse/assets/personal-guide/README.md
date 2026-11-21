# 你的0597人物：单人绑定版

## 当前4.3：局部手部与袖口修整，保留自己的头部

海边入口`?seaside=1`采用`personal-guide-hands43.glb`，清单`manifest-hands43.json`；[当前网页记录](../../seaside-review.html)。从3.6自有头部源制作，只提取本地MIT Rocketbox adult10手面，重新拟合腕部、袖口与袖管末端，不采用供体头部/身体。手部许可见`../rocket-guide/LICENSE.txt`；用户原外观权利独立。身体主体与21面部形态保持，手指为放松形体，尚无独立抓握表演。

当前27,153,676字节、43,889制作顶点/86,348三角面，80关节/5身体动作/21面部形态；SHA-256 `bee62731b932e907f66eca8e58dc42daf8565f2501f77ab9e71cd20c3a0336f1`。原41999顶点中保留37479个；保留点在22个原形态中的位置误差为0，实际GLB导出的头部点集与3.6相同。原始/default/facial文件没有覆盖。源`../../character/build-hands43.py`、可编辑`../../character/personal-0597/personal-guide-hands43.blend`。坐姿的掌面朝向、接触适配和脚底仍依赖网页运行时，不是新GLB内置的坐姿动作。

近景仍能看到袖管衔接与原服装生成痕迹，不宣称整体人物美术已经完成。

## 3.6保留：自有头部的面部变形与中文讲解

[实际网页与录屏](../../facial-review.html)，实时`?detail=facial&portrait=face&pose=still`。用户明确要求保留我们自己的0597头部，仅参考微软结构与驱动方式。此版本继承原脸型、发型、眼镜、身体和西装，未导入微软或MakeHuman脸部几何；3.5换头路线停止，原始、默认及历史资产均保留。

`personal-guide-facial.glb`：16,662,052字节，41,999制作网格顶点、83,330三角面，80节点、原5段身体动作、21个面部形态。SHA-256：`69927e9fb807a1e63d9d901166c2167d740d2efd8997cdf08295b2c095969f94`。制作源`../../character/build-own-face.py`，可编辑`../../character/personal-0597/personal-guide-facial.blend`。共享原嘴部61个边界顶点，补唇缘开口、口腔、牙齿和舌部，局部采样原贴图颜色；双眼眨眼、四向视线、张口与多种唇形为自有网格上的形态键。没有用另一张脸宣称修好了原脸。

网页的`facial-performance.js`使用音频`currentTime`驱动唇形，支持自动/手动眨眼、视线、固定讲解播放/暂停/恢复/停止。中文样例`speech/terrace-intro.wav`为22050Hz/16bit/单声道、约11.115737秒，本机Windows Kangkang生成；WAV SHA-256 `347998eb988efd846d0b37e1a2e5522cd74c1fafd8a64996df0aa42df2d4e5da`。JSON保存67个近似口型时间段与实测能量。原生口型事件为0；按停顿与已知拼音估计时间，没有ASR或逐音素强制对齐，不称精准中文口型。当前无自由对话/麦克风识别，音色也不是情绪或克隆配音。

`import-validation-facial.json`记录21形态与5动作×9采样，形态有效且不带动1.4m以下身体，鞋底误差约0.00000371m。结构测试设`SEA_PERSONAL_MANIFEST=manifest-facial.json`；导入验证加`--personal --facial`；网页`npm run verify:face`检查实际眼睑/嘴部位移、音频时钟、暂停/恢复/停止、下载与手机。录屏与报告`../../../screenshots/face36-speaking.mp4`、face36-checks.json/face36-poses.json。当前仍需精修闭眼、眼角/嘴角、唇齿、肤质与同步自然度；保留身体动作不代表全部变形已验收。

## 3.5微软成熟头部历史稿：用户已停止换头方向

[实际网页对照](../../head-review.html)，实时`?detail=head&portrait=face&pose=still`。本轮根据用户指出的旧微软演示，采用本机Rocketbox Male Adult 10成熟头部、眼睛/眉毛/头发/皮肤及原面部权重，保留0597身体与深蓝西装。这是一张不同的脸，不声称还原原0597面貌。默认文件、原四人文件及先前候选均保留。

`personal-guide-head.glb`：15,236,576字节、16,517制作网格顶点、32,662三角面，80节点/5段身体动作。SHA-256：`167bed9f770a7174473759947d89934c8d5839657d5eb119fdb14769fabfa0c3`。制作源`../../character/build-rocket-head.py`，可编辑`../../character/personal-0597/personal-guide-head.blend`。从供体Idle首帧拟合，移除供体红夹克领口，延伸颈部至原衣领内、保留原白衬衫；归一化最多4个权重。头部MIT许可全文`HEAD-LICENSE.txt`，动作许可同源，0597身体和衣服权利独立。外观及权重来源见`manifest-head.json`。

本机原微软模型有面部骨骼与权重，0个形态键；新头部确有眼球各122顶点、下颌322、上/下唇36/32、上眼睑各27、外眉各22等有效权重。独立导入后下颌2mm位移实际移动网格约2mm，属于机械验证。当前没有语音、口型/视素、自动眨眼/视线或表情驱动；官方Headbox的15口型/FACS/ARKit模板未接入。保留身体动作不能等同于能说话。

独立导入记录`import-validation-head.json`，45个动作采样有效且最低鞋底误差约0.00000371m，不声称任意动作/台阶无穿插。结构测试设`SEA_PERSONAL_MANIFEST=manifest-head.json`，Blender验证加`--personal --head`，网页`npm run verify:head`。真实三视角及入口/下载/冻结/手机记录为`../../../screenshots/head35-checks.json`、`head35-review-checks.json`。颈部UV拉伸、肤色协调和衣领仍需精修，身体/手指沿用旧版，整体美术未验收。

## 3.4眼周重建候选：静态检查，尚未通过整体视觉验收

最新[实际网页对照](../../orbit-review.html)，入口`?detail=orbit&portrait=face&pose=still`。只重建眼眶与眼镜，身体/双手为3.2，没有混入3.3手部修改。原四人、默认单人和3.3候选保持。

`personal-guide-orbit.glb`为11,105,708字节、74,948三角面、37,724 Blender网格顶点，保留80骨架节点及原5段动作。SHA-256：`252069a40c80cecd70bc188968822ee374eba4804b62fd027de44443965a7cbc`。制作源`../../character/rebuild-orbit.py`，可编辑`../../character/personal-0597/personal-guide-orbit.blend`。连接原皮肤142个边界点，以两个96点眼眶开口连接球形眼球；镜圈、鼻桥、镜腿建模后绑定Head。眼周用原贴图采样顶点颜色，头部取消过强生成法线/镜面。旧镜框的窄凹槽使用邻近皮肤重建，不声称手工角色重拓扑或面部表演绑定。

眼神仍偏僵，脸侧和眼角仍有修补痕迹；衣领、胸饰、双手及衣服变形没有在这轮完成。没有新增眨眼、表情、独立手指动画或换装。静态机位、脚部接触和网页材质调整不包含在下载GLB中。

独立导入`import-validation-orbit.json`包含45个动画采样，80节点/5动作、顶点有限，最大鞋底误差约0.00000371m，不代表任意动作均无穿模。结构测试设`SEA_PERSONAL_MANIFEST=manifest-orbit.json`；Blender验证`verify-rocket-import.py -- --personal --orbit`。真实网页静止、入口、手机390宽和下载校验为`../../../screenshots/orbit34-review-checks.json`。沿用用户外观与MIT动作的来源区分。

## 3.3近景修整候选：尚未通过视觉验收

默认`manifest.json`仍指向上轮`personal-guide.glb`。本轮候选为`personal-guide-detail.glb`及`manifest-detail.json`，可在玻璃屋加`?detail=1`实际查看、操作和下载；`?detail=before`加载保留的上轮清单。正面/侧面/手部的真实网页对照见`../../portrait-review.html`。

局部修整增加眼白、虹膜、瞳孔和贴合原曲面的眼睑，按前后表面分离部分旧镜框，再加入细镜框；保留原脸型、头发、鼻口和主体服装。手部几何取自本项目已有的Microsoft/Rocketbox Male Adult 10，MIT许可；删除黏连手部，拟合腕部、过渡权重、袖口和袖管末端。`MOTION-LICENSE.txt`中的Microsoft MIT条款也适用于此次手部几何，不能据此把用户面貌和完整外观标为MIT。

本轮最初产生过眼周补片、腕部接缝和材质颜色问题，已返修。当前眼神仍偏僵、镜腿/眼角有残留，肩腋、衣领与胸前图案也保留原生成痕迹。五段动作和操控可验证，不等于近景质量达标，所以候选没有替换默认资产。没有新增眨眼、口型、独立手指动作或换装。

制作源`../../character/refine-personal-guide.py`；可编辑`../../character/personal-0597/personal-guide-detail.blend`。默认的源文件和原四人物GLB均保留。候选检查用`SEA_PERSONAL_DETAIL=1 npm run verify:personal`，结构测试可设`SEA_PERSONAL_MANIFEST=manifest-detail.json`，Blender重导入加`--personal --detail`。网页上的近景机位及地面适配不包含在下载GLB中。

## 上轮默认资产

用户于2026-11-14选择继续制作0597模型。现默认玻璃屋入口使用此单人版本；`?hero=rocket10`保留红色夹克成品，`?hero=generated0597&study=1`保留原四人物文件对照，`?hero=personal0597&study=1`检查整理后单人的静态形体。

## 使用

「自己走动」或WASD/方向键控制人物；手机使用方向按钮。支持站立呼吸、走路、挥手、转头看海和演示手势。「开始导览」沿屋内、岸边、露台行走。人物视线、跟随、自由环视和近看模式沿用现有控制。暂停同时停止动作与位移。

「下载当前人物GLB」提供此单人模型的网格、贴图、骨骼与五段基础动作。网页的地面、台阶适配和相机逻辑不在GLB文件中。

3.1继续沿用此GLB，仅调整网页运行时：岩石加入人物碰撞及导航绕行，相机避开岩石/建筑/滑门，行走加入加减速，台阶缩短步幅并柔和停步落脚。手机控制面板改为下半屏展开。原始0597文件、当前单人GLB、骨骼和五段基础动作均未因此改写。

3.2继续保留此文件与哈希。网页运行时修正原生成材质的2倍镜面颜色、金属因子及法线强度，并调整全场景光照；木板和沙地上的接触暗部跟随真实鞋底位置。这些材质、光照、相机与地面适配不包含在下载GLB中，不能据此声称模型眼部、手指或衣服几何已经重做。

## 这次实际做了什么

- 从用户原始0597 GLB中选择第二个正面人物。分离区间经过原文件的空隙，没有切穿身体，原四人物文件与哈希保持不变。
- 保留原脸、西装、眼镜、鞋、UV与颜色贴图。单人原399,312三角面，减为47,916三角面；几何减面并非专业手工重拓扑。颜色保留4096像素，法线与材质数据图缩为2048像素，打包约9.6MB。
- 减面时对头脸、手和鞋保留更高密度，减少衣身的大量细碎三角形。场景的时间步长上限由50ms调整到100ms，避免10–20FPS时人物与海面无意变为慢动作；这不等于真实手机性能保证。
- 按该人物比例建立骨架并绑定蒙皮，热权重后隔离头脸、手与左右裤腿，限制每顶点最多4个有效权重并归一化。骨架包含80个节点，当前以主要身体骨骼驱动网格，没有宣称完整面部或手指表演。
- 从Microsoft/Rocketbox的已核查动作，按来源站姿与此人物的新休止姿态转换旋转，烘焙Idle、Walk、Wave、Point、LookAround五段动作；原Rocketbox人物网格没有被导入交付文件。
- 基础动作按实际鞋底高度校正，网页再按此人的鞋底顶点重新建立台阶接触范围。实际肩肘、裤腿、上下台阶和相机应继续以网页画面验收。

## 来源与边界

模型外观来自用户提供的`0597b54ff20068bcd556b1e005aed56d.glb`，原始生成服务条款未独立复核，不将该模型外观标为MIT或CC0。动作及骨架参考来自[Microsoft/Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox)，MIT许可保留在`MOTION-LICENSE.txt`。来源动作、原始文件哈希与前期处理记录沿用`../rocket-guide/`和`../user-model-0597/`。

本版保留原生成模型的眼部细节、表情和手指形状，没有新增眨眼、口型、独立手指动作或换装。西装肩部、肘部和衣摆采用实时蒙皮，没有布料物理；更复杂的大幅动作仍需要继续修整权重/拓扑。模型完成绑定和基础动作不等于最终人物美术已通过用户验收。

制作源：`../../character/prepare-personal-0597.py`、`build-personal-guide.py`；可编辑工作文件：`../../character/personal-0597/personal-guide.blend`（包含贴图）。`manifest.json`保留资产哈希与动作记录，`import-validation.json`为导出后独立重导入检查。

在项目目录运行`npm run verify:personal`，顺序验证基础动作、完整导览、下载、直接操控、台阶与手机。结构与蒙皮检查包含在`npm test`中；二者均不能替代最终视觉判断。
