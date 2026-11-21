# 潮光：四个 Skill 的实际用法

本次选择携带实现与生成工具的 Skill。它们提供的是可复用资产生产能力和海面代码；模型构思、游戏规则与适配由本项目编写。未进行同预算模型对照，不能据此宣称时间节省或模型能力上限提升。

## 体验顺序

1. `npm run dev` 后打开 http://127.0.0.1:5267/research.html ，拖动同机位对照滑块。
2. 打开 `gallery.html`，旋转四个真实 GLB，拖动特效帧，试听旧方波与新金属音色。
3. 开启完整新航程。WASD 移动、J 攻击、Space 冲刺、Q 共鸣、E 修复信标。Q 初始满能量，普通有效命中每次回充 22 点；消耗 100 点，范围 4.6，伤害 2，首领硬直 1.4 秒，其余 0.9 秒，范围内弹丸被消除。
4. 三章经两次装备选择到结局。`before-upgrade/` 保留上次完整三章产品；`baseline/` 是更早的单场原型。`?preview=1&chapter=2` 是预设装备的只读场景预览，不写入航程存档。

## 选择与采用

| 遇到的问题 | Skill 提供的实现 | 本次接入与自己的工作 | 交付与验收 |
| --- | --- | --- | --- |
| 基础几何缺少可独立使用的造型资产 | create-3d-assets：MeshBuilder、SolidMesh、Manifold CSG、AO 与 AssetValidator | 原创机械海港造型，切爪口、炮管与灯室；转成线性顶点色、Y-up GLB，再由 GLTFLoader 装载 | 4 个 GLB，974 / 1094 / 496 / 1198 三角形；封闭且绕序一致，AO 检查通过 |
| 强技能没有独特的释放过程 | create-vfx：EmitterStack、Flipbook、Easing、结构与时间连续性检查 | 设计潮汐与金色撞击；预生成随机参数，四阶段分层；14 面片对象池，单事件驱动播放 | 两套 24 帧图集，192px / 帧、24fps、6×4，透明边缘 1px，末帧透明 |
| 方波提示缺少材质区分 | create-sfx：SoundSynthesizer 模态、材质共振、瞬态和立体声函数 | 为命中、格挡、拾取、信标等编写参数，归零端点；Web Audio 解码、事件音量、声像、压缩总线 | 10 个运行音效 + 1 个旧声参数重建，48kHz PCM16 双声道，峰值约 −3dBFS |
| 单色水面缺少波动与反光 | 3d-ultra-realistic-water：完整 ocean.mjs，波场、细节烘焙与水面 shader | 调小波长、降低水位、接同波场小船浮动；新增 45% CSS 分辨率独立通道，最多 24Hz 更新 | 实际游戏海面，原模块保留，适配在 harbor-assets.js；记录新增开销 |

Q 的伤害、破甲、打断、消弹与能量规则是本项目增加的玩法，不能全部归功于 create-vfx。模型只有整体代码摆动，没有骨骼动画。水面没有接入上游平面反射、尾流和整套后期。名称中的 ultra-realistic 是上游 Skill 名，不表示本游戏达到写实画质。

## 固定来源

- asset-maker 的三项 Skill：[Be1l-ai/asset-maker](https://github.com/Be1l-ai/asset-maker/tree/d095bc28e9a8e4cfe58996cbaf3a0ee9cbe4e46e)，commit `d095bc28e9a8e4cfe58996cbaf3a0ee9cbe4e46e`。原本机工具代码在 `tools/asset-maker/`，未随公开提交分发；公开包保留上游地址和固定版本。
- 水面：[zafmy/threejs-Skills](https://github.com/zafmy/threejs-Skills/tree/5ea1661a0e05d82b054553daaa6baf6d0233c33c/agent-skills/3d/3d-ultra-realistic-water)，commit `5ea1661a0e05d82b054553daaa6baf6d0233c33c`。原实现是 `vendor/ocean.mjs`。
- 四项来源定位、已记录指纹与实际符号见 `skill-sources/v2/manifest.json`；全文快照只保留于原本机环境。原先八项通用说明保存在上一轮记录中。

发布核验确认水面模块为 MIT，完整许可在 `vendor/ocean-LICENSE.txt`；Three.js 许可在 `vendor/LICENSE`。asset-maker 仓库未声明许可证，因此其工具包、复制模板与 Skill 全文不随公开提交分发。生成配方、项目造型与现有生成资源保留，公开网页提供来源、版本与指纹。详见 `THIRD-PARTY-NOTICES.md`。引导图仍为研究阶段原图。

## 重新生成

浏览器运行无需 Python。重建资产需要本地 Python 3.12 独立环境，下面是在游戏目录中的 PowerShell 命令：

```powershell
uv venv --python 3.12 .runtime/asset-env
uv pip install --python .runtime/asset-env/Scripts/python.exe numpy==2.5.1 scipy==1.18.0 Pillow==12.3.0 trimesh==5.2.0 manifold3d==3.5.4 aggdraw==1.4.1
./build-assets.ps1 -Seed 27
```

原本机研究环境已建立，无需重复安装。公开源码不含 `tools/asset-maker`；重新生成前需自行从上游获取固定版本并确认适用使用条件。正常游玩不依赖该工具包。配方分别在 `asset-recipes/build_models.py`、`build_vfx.py`、`build_audio.py`。脚本将 `generate.py` 副本、预览和带依赖版本、参数、SHA-256、验证结果的 manifest 写入 `assets/forged/{models,vfx,sfx}/`。seed 控制随机噪声与特效采样；模型造型主要由固定几何参数决定，换 seed 不会自动重新设计。

每个配方也可单独执行：

```powershell
.runtime/asset-env/Scripts/python.exe -X utf8 asset-recipes/build_models.py --seed 27
.runtime/asset-env/Scripts/python.exe -X utf8 asset-recipes/build_vfx.py --seed 27
.runtime/asset-env/Scripts/python.exe -X utf8 asset-recipes/build_audio.py --seed 27
```

`-X utf8` 解决上游脚手架读取中文文档时 Windows GBK 编码失败的问题。上游示例 API 与当前实现有出入，本次按实际类签名编写配方。模型检查后调整了悬空足部与配色，不能只靠首次生成结果或自动网格检查判断视觉质量。

## 给 AI 的用法示例

模型：使用 create-3d-assets 的 MeshBuilder / SolidMesh 为现有机械海港做一台带通孔炮管的炮台，沿用青铜与青绿配色。要求 CSG 炮口、底盘旋转轮廓、地面 AO、GLB Y-up 导出、三视图预览、少于 3000 三角形、封闭性验证。接入现有 cannon 槽位，保持碰撞和预警范围。

特效：使用 create-vfx 的 EmitterStack / Flipbook 做青色潮汐冲击波，闪光、扩散、烟雾、余烬四阶段，24 帧、192px、透明边缘。接到现有 pulse 事件，不让特效决定伤害。交付配方、图集、预览与 manifest，并运行结构及动画检查。

音效：使用 create-sfx 的材质模态，为金属命中、甲壳格挡、玻璃拾取分别合成声音。48kHz PCM16 双声道，峰值留 3dB、端点归零。绑定现有 hit / guard / pickup 事件，提供可直接试听文件，别只输出声音描述。

海面：阅读 3d-ultra-realistic-water 后复用配套 ocean.mjs。保留当前码头尺度与碰撞，解释哪些模块实际使用，控制波长与太阳方向；用同一 CPU 波函数驱动船。给出与现有平面水面的同视口性能对照，并记录额外通道与分辨率。

## 验证与范围

- `npm test`：22 项边界测试，包括破甲、硬直、能量回充、范围消弹、旧存档迁移。
- `python verify-browser.py`：34 项产品流程检查。新增真实按键 Q、实际扣血、图集与声音、手机按钮验证。QA 场景接口仅在 `?qa` 暴露。
- `python playthrough.py`：从新航程正常键盘通关，读取 QA 状态作寻路，不调用 fixture 修改状态。21.48 秒、7 次共鸣、0 重试；程序已知目标，不代表玩家时长。Web Audio 输出已捕获并按墙钟偏移与视频合成。
- 同 seed 重建后 23 个 GLB/WAV/PNG 字节哈希一致；报告 `evidence/v2/reproducibility.json`。审计三组资产均通过。
- `python measure-performance.py`：旧版/新版标准与自动画质各取 6 秒。自动比例均为 0.6，旧版 21.49ms，新版 23.23ms，约 43FPS。新版主体 103 次绘制，海面每次更新另加 1 次绘制与 8880 三角形，45% CSS 分辨率、上限 24Hz。软件渲染短样本不能代表真机表现。

同机位截图使用 1280×800、标准画质、减少动态、标题状态，截取三维画布区域，保留可见游戏界面。截图供形态对照；动态海面请进入游戏或观看录像。真机触控、实体手柄、听感偏好、普通玩家学习与长期重玩价值尚未验证。
