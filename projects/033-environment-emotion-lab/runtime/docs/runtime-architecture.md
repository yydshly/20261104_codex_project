# 池塘：从展示画面到实时场景

本轮不执行付费视频生成。视频计划已撤回，未消耗计划中的 360 ChatArt 积分。

## 为什么没有用视频作为场景核心

视频能给出自然运动，但位置、时序、遮挡和光照已经绑定在画面里。后续改变鸭子的路线、加入动物、调整风力、让动作与声音同步时，单纯视频循环会成为瓶颈。

当前首页为 v5 Three.js / WebGL 三维场景。相机可以环顾；小屋、纹理绿头鸭、植物和扫描岸石都是独立几何对象。v5 用外部真实资产替换了旧程序鸭和程序植被，旧码头移除，小屋移至远岸。六方向区域保留先前美术，供概念和方向说明使用。

## 当前结构

| 模块 | 职责 | 可扩展的状态 |
| --- | --- | --- |
| `pond-world.js` | 等待资产就绪、时间、相机、交互命中、共享日夜/风力、生命周期 | 天气、时段、场景对象 |
| `pond-lighting.js` | HDR/PMREM、主渲染深度重建 AO、辉光和最终色彩转换 | 昼夜光强、画幅质量 |
| `pond-materials.js` | 本地 PBR 纹理与许可记录 | 色彩、法线、粗糙度 |
| `pond-environment-v5.js` | CC0 植物与扫描石模型、湿泥地形、远处小屋、叶面风动与阴影 | 近远资产、植被分布、风力、灯光 |
| `pond-water-3d.js` | v5 几何长波与细波、实时反射、浅岸吸收近似、涟漪、个体水线与尾流 | 风力、波纹来源、个体尺寸、昼夜水色 |
| `pond-duck-v5.js` | 载入真实比例纹理绿头鸭、轻微头颈/喙形变、浮力与行为接口 | 巡游、停留、呼唤、目标位置、资产状态 |
| `pond-duck-3d.js` | v5 复用的行为控制器与五点浮力；原程序鸭网格从 v5 场景树移除 | 速度、航向、状态转移、泳域；旧码头限制可关闭 |
| `pond-audio.js` | 环境录音混音、位置声像、动作音效与静音 | 环境/动作总线、风强、事件强度 |

同一个 `call` 时间轴使鸭子先有头颈与喙的短响应，并发出一次 `quack`，再转向并游近。游动速度决定尾流事件；点击的三维水面位置同时成为波纹中心和接近目标。阵风共享给叶面、水面与声音。

环境与鸭子均返回 `ready` Promise，主场景等待模型和光照就绪后开始持续运动。鸭子保留 `object3D / update / interact / getState / setSurfaceSampler / dispose`；状态附带实际模型 `length=.75`、`width=.30` 及资产载入状态。每帧先更新水面，再用 `sampleHeight(x,z)` 的中心、前后和左右五点采样更新鸭子浮高与低幅倾斜，随后将鸭子状态交给 `water.setSwimmer`。尾流保留发出时的航向和体形。

水域 X/Z 半径为 5.5 / 3.8 米，鸭子继续使用较保守的 3.45 / 2.1 米椭圆泳域及内缩余量。v5 关闭旧码头约束；泥岸场景不会留下旧码头的隐形障碍。

## 资产与许可

- 绿头鸭是 3Dima 的 [Realistic Mallard Duck](https://sketchfab.com/3d-models/realistic-mallard-duck-game-ready-asset-dd33cd2e30944a4aae2de1a06a828f4f)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。当前本地转载精简版为 1 个网格、8,439 三角面、1 张 1024² 底色纹理。原文件没有骨骼和动画；本项目的格式准备及动作修改与原作者归属分别记录在 [资产说明](../assets/models/duck-v5/README.md)。
- 植物、扫描苔藓石和湿泥地表来自 Poly Haven 官方源，采用 [CC0](https://polyhaven.com/license)。`assets/models/environment-v5/runtime/` 为网页 GLB，制作源 `.blend` 不参与运行；纹理来源、哈希和透明度检查随资产保留。详见 [环境 v5](environment-v5.md) 与 `assets/materials/sources-v5-ground.json`。
- `pond-environment-3d.js`、`docs/runtime-v4-source/` 和 v4 文档保留历史实现；当前入口不再使用旧程序环境。

## 制作边界

- 鸭子采用真实比例和羽色纹理的静态模型；巡游状态由既有控制器驱动，头颈和喙用连续顶点权重作低幅形变。没有冒用外部骨骼动画，也没有把行走动画当游泳。近景质量仍受精简网格与 1K 底色纹理限制。
- 水面使用几何长波、像素细波、有限传播波纹及反射渲染，未实现完整流体求解。浅岸颜色是水底吸收近似，个体接触层是法线与少量遮蔽；没有真实场景折射、流体力反馈或羽毛湿润模拟。鸭子浸水深度由模型归一位置与采样浮高共同决定。
- 风动作用于导入模型的叶面、蕨草和灌木，透明叶隙参与阴影；近远模型与实例复用控制成本。它是顶点风动，不是逐叶空气动力学。
- 自然环境声与鸭叫来自公开授权录音；短拍水、水滴和风声为合成音。用户关闭声音后所有事件保持静音。
- 原图仍在 `assets/art/`；准备视频时生成的 `duck-animation-source.png` 未接入运行场景，未提交任何 ChatArt 视频任务。

v5 改变了资产路线，但还不是逼真终版。后续更精细的绑定资产可以继续使用当前行为、浮力与声音接口；天气也可以驱动现有共享参数。

`npm run check` 覆盖 v5 环境/鸭子及保留模块；`npm test` 串联原运行检查、真实鸭子 GLB 几何与生命周期检查、v5 水面检查。当前浏览器与视觉核验见 [verification-v5.md](verification-v5.md)；[v4 记录](verification-v4.md)保留。自动检查通过只表示相应行为和数据约束成立，不表示画面已经达到目标质量。

Three.js r187 来自工作区已安装的 npm 包，运行所需模块已复制到 `vendor/`，MIT 许可保存在 `vendor/THREE-LICENSE.txt`。本地 Water 示例增加反射目标的释放入口，并在覆盖材质的辅助通道中跳过反射。AO 直接使用主渲染深度，保留叶片/鸭身变形，避免二次绘制场景与阴影。官方依据：[WebGLRenderer](https://threejs.org/docs/#WebGLRenderer)、[Three.js 水面示例](https://threejs.org/examples/?q=water#webgl_shaders_ocean)。
