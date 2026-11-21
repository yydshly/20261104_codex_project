# 栖境 · 环境与情绪实验室

本地独立子项目，用中文网页整理我们围绕 Quack 的讨论：环境构造情绪，结合连贯变化与操作回应，形成在场感与沉浸式体验。

## 预览

在本目录运行 `npm start`，打开 http://127.0.0.1:5217/ 。也可运行 `./preview.ps1`；更换端口使用 `./preview.ps1 -Port 5218`。不需要安装依赖。网页使用 ES modules，应通过 HTTP 预览。

当前「林间小屋」：打开 http://127.0.0.1:5217/reading.html?v=12 。第一、第三人称共享同一人物，在房间、庭院和池塘连续活动，支持阅读动作链与户外喝茶。自然录音随位置变化，MiniMax 朗读跟随书的位置。最近场景修复与验收见 [坐姿接触记录](docs/seat-contact-fix.md)；早期往返与听感见 [连通空间记录](docs/reading-v7-live-review.md)。

「项目方法与复用手记」：打开 http://127.0.0.1:5217/reading-notes.html 。包含核心理解、连通空间总览、池塘与阅读角对照、人物动作和接触方法、素材账本、复用条件、场景卡及分版本验收索引。首页与场景页均可进入。

## 页面内容

- 双视角连通空间：`reading.html?v=12`；自然录音与 MiniMax 朗读使用同一个位置声场。
- 制作与复用手记：以池塘和阅读角为案例，将设计命题、各自的实现与来源、模块复用边界和新场景模板连在一起。
- 我们的理解：环境 → 情绪 → 在场感与沉浸，明确每个环节承担的作用。
- 对我们的价值：进入状态、低负担关系、可感知的经历积累。
- 六个场景方向：暮色池塘、雨窗书桌、生活花园、山顶观星站、双人小屋、微型生态瓶。每个方向说明适用时刻、目标感受、空间、声音、交互、积累、价值与第一版范围。
- 构造原理：主场景与声音、光线、动态、交互、时间共同工作，使用共享状态协调反馈。
- 制作顺序：场景卡 → 独立模型与材质 → 动作与声音 → 可操作的共同状态。

## 可以操作

首页当前为 v5 实时三维池塘，采用真实比例的纹理绿头鸭模型，以及 CC0 植物、扫描岩石和湿泥地表资产。拖动环顾，进入场景后可缩放；点水面让鸭子转向并游近，呼唤触发头颈与喙的短响应及一次鸭叫。风力和阵风同时影响植被、水面与声音。暮色/夜间切换改变光线与声景。详见 [实时架构](docs/runtime-architecture.md)。

- 首页池塘：自然泥岸、真实植物模型、扫描苔藓石、远处小屋、纹理绿头鸭与实时反射水面；可开关萤火与辅助尾流、持续动态。旧码头已移除。
- 声音默认关闭，点击“开启声音”后播放真实溪水、池塘蛙鸣与虫鸣录音。切换时段调整两层混音，音量可调。音轨已制作成交叉淡化循环；不是原作者音频。
- 六个方向均使用独立生成的完整场景美术，配合细微局部动态和制作提案；键盘方向键也可选择。页面下方的记录、多人和生态规则为扩展方向，尚未实现为完整产品。
- 构造原理的六个标签可以切换，阅读各元素的作用与例子。
- 尊重系统减少动态偏好，隐藏页面暂停持续绘制。

## 文件

- `index.html`：页面内容与语义结构。
- `style.css` / `art.css`：自适应布局、正式场景展示与全屏样式。
- `data.js`：六个方向、六项原理、三段体验路径。
- `app.js`：页面交互、内容切换与声音控制。
- `pond-world.js`：首页实时三维场景、相机与共享状态。
- `pond-lighting.js`：HDR/PMREM 环境光、基于真实深度的接触阴影、窗光辉光与色调映射。
- `pond-materials.js`：本地 CC0 扫描材质的色彩、法线与粗糙度纹理。
- `pond-environment-v5.js`：载入并实例化 CC0 植被与扫描岩石，组合湿泥岸线、远处小屋及风动。
- `pond-duck-v5.js`：载入纹理绿头鸭，控制轻微头颈形变、浮动及交互；复用 `pond-duck-3d.js` 的行为控制器，旧程序鸭不参与渲染。
- `pond-water-3d.js`：当前 v5 水面，包含几何长波、实时反射、浅岸吸收近似、点击涟漪、个体水线与定向尾流。
- `pond-environment-3d.js` / `docs/runtime-v4-source/`：保留的旧版环境与源码记录；当前环境入口使用 v5。
- `pond-audio.js`：环境录音与跟随动作的空间音效。
- `art-scene.js`：六方向美术画面载入与分层动态。
- `vendor/`：本地 Three.js r187 运行模块及 MIT 许可。
- `assets/art/`：7 张 1536 × 1024 场景画面（池塘含两种光照）与透明鸭子素材。
- `assets/audio/`：自然录音原件与网页使用的 WAV 循环片段。
- `assets/materials/` / `assets/lighting/`：PBR 扫描材质、湿泥地表与 HDR 环境光，许可与哈希随附。
- `assets/models/duck-v5/`：绿头鸭 GLB、来源许可、资产检查图及规格；当前模型为 8,439 三角面、1 张 1024² 底色纹理。
- `assets/models/environment-v5/runtime/`：运行用植物与岩石 GLB；上级目录保留官方源文件、许可与哈希，网页不载入 `.blend` 制作源。
- `assets/materials/sources-v5-ground.json`：新增 CC0 湿泥地表纹理的官方来源与校验值。
- `scene.js`：保留的早期程序绘制版本，当前页面不再使用。
- `server.mjs`：仅绑定本机 `127.0.0.1` 的静态预览服务。

## 来源与说明

参考起点：[Daniil 的 Quack 演示](https://x.com/daniildesigns/status/2120195320768303141)。帖文提到自然声音和随时段、季节变化的生成式音乐，视频展示独立声音控制与音乐盒式可视化。本项目未复用作者的代码、美术、音频。

六方向美术画面由 ImageGen 生成，精确提示词与素材说明见 `docs/art-direction-v2.md` 和 `docs/art-prompts-*.json`。首页池塘采用独立三维资产与实时着色器；这些静态概念图不参与首页三维画面的生成。

v5 绿头鸭来自 **3Dima** 的 [Realistic Mallard Duck - Game Ready Asset](https://sketchfab.com/3d-models/realistic-mallard-duck-game-ready-asset-dd33cd2e30944a4aae2de1a06a828f4f)，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本地使用保留完整归属的公开转载精简版，制作了通用 GLB 格式准备与轻微交互形变。原模型是静态资产，**没有骨骼或原生动画**；动作由现有行为控制器、连续顶点权重和水面采样驱动。详情见 [鸭子来源说明](assets/models/duck-v5/README.md)。

树、蕨草、灌木、苔藓石和湿泥地表来自 [Poly Haven](https://polyhaven.com/)，许可为 [CC0](https://polyhaven.com/license)。模型在本机从官方制作源转换，保留纹理与叶片透明度，按近远景控制几何成本。详情见 [环境 v5](docs/environment-v5.md)、`assets/models/environment-v5/sources.json` 和 `assets/materials/sources-v5-ground.json`。

当前是资产路线与实时表现的升级，尚未达到逼真终版。鸭子的近景细节受精简网格与 1K 底色纹理限制；水面仍是几何波、法线、反射和吸收近似，未实现完整流体、真实场景折射或动物与水的物理耦合。也未实现多人服务。

旧版记录继续保留：v4 重做连续鸭身和软皮肤动作、树干/叶片/林下坡地、木屋屋瓦与窗内细节；加入扫描材质、HDR 环境照明、深度接触阴影与低强度辉光。详见 `docs/duck-v4.md`、`docs/environment-v4.md`、`docs/water-v4.md`。当前 v5 延续光照、行为与五点浮力接口，并替换环境和鸭子的显示资产；水面更新见 [水面 v5](docs/water-v5.md)。

本轮讨论过视频方案，因扩展性瓶颈而取消；未执行计划中的 360 ChatArt 积分任务。用于准备动画的绿幕鸭子图保留但没有用于页面。

溪水录音：Siddharth Patil / Ksd5，CC0，[Swale](https://commons.wikimedia.org/wiki/File:Swale.ogg)。池塘录音：Glaneur de sons，[Nature sounds ambience in a Dordogne pond](https://commons.wikimedia.org/wiki/File:Nature_sounds_ambience_in_a_Dordogne_pond.ogg)，[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。循环版本做了裁切、降采样与交叉淡化，详见 `docs/audio-sources.json`；署名也展示在网页底部。

页面中的价值判断、六个方向和制作流程是本次设计归纳与提案；情绪路径表达设计意图，不代表已经验证对每个人都有效。记录方向未连接任何真实日记或私人资料库。

静态站点不依赖外部 CDN、账户、密钥或后台服务。未创建部署，未访问或修改 ReflectFlow。

## 检查

运行 `npm run check` 检查当前及保留模块的 JavaScript 语法；`npm test` 依次运行 `verify-runtime.mjs`、`verify-duck-v5.mjs`、`verify-water-v5.mjs`，检查旧接口兼容、真实鸭子几何与尺寸、动作/浮力、已移除码头不留障碍、个体水线和尾流生命周期。当前版本浏览器核验见 [verification-v5.md](docs/verification-v5.md)；[v4 核验](docs/verification-v4.md)及更早记录继续保留。Node 检查不替代实际画面与动态效果验收。


## 当前入口与项目手记

- `index.html`：观察池塘、核心理解与六个扩展方向；六方向为美术提案。
- `reading.html?v=12`：同一空间中的阅读房间、庭院茶角与池塘。第一、第三人称共用玩家人物；陪伴 NPC 已移除。
- `reading-notes.html`：2026-11-21 整理的项目参考，按理解、方法、人物、来源、复用与验收组织；含可编辑复制的场景卡。

保留自然环境录音与既有三页 MiniMax 朗读。网页播放本地音频，不需要运行时生成服务。

## 当前人物与动作

保留 Rocketbox Male Adult 10 原模型，新增同一官方库的坐姿和文档动作；由场景状态串起“坐下—拿书—阅读翻页—放书—起身”。双视角共享动作与道具，声音跟随人物和书的位置。人物动作、视线与手脚接触均是有范围的实时近似，尚非完整手指、衣料或软垫物理。

- [自主人物与双视角](docs/reading-self-player.md)
- [户外持物、喝茶与脚凳验收](docs/self-acceptance.md)
- [落座、眼位与室内拿书修复](docs/seat-book-fix.md)
- [同源动作来源、设计与适配](docs/reading-motion-chain.md)
- [最近场景修复：实际座椅与蒙皮接触](docs/seat-contact-fix.md)

接触修复后的最新连续实录位于 `docs/seat-contact-review/experience.mp4`，不是此前的动作链录像。实际网格核对覆盖 134 个采样时刻，最大残余重叠约 0.75 mm（回归阈值 2 mm）；不代表所有动作或角度均无穿插。

`npm run test:connected` 检查连续空间、真实人物及新动作文件、持书接触、实际座椅网格、声音与位置混音。开发验收脚本依赖工作区现有 Playwright 与 Chrome；网页运行仍使用本地 Three.js 和静态资产。

历史的[陪伴 NPC 探索](docs/reading-terrace-companion.md)仅留档。当前主体始终是用户自己控制的人物。
