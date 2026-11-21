# 同源动作驱动的阅读动作链

日期：2026-11-16。保留现有 Microsoft Rocketbox Male Adult 10 人物、蒙皮和材质；只新增动画素材及控制代码。原人物 GLB 的 SHA-256 仍为 `03a215c373c12f4c9cc7e3e417cb2cc42cd3415b77b85588cdf13cc2a5d935e6`。

## 动作来源与加工

源文件来自 [Microsoft Rocketbox 官方动作目录](https://github.com/microsoft/Microsoft-Rocketbox/tree/master/Assets/Animations/all_animations_max_motextr_static)，沿用 MIT 许可。下载范围为坐姿呼吸、中性、放松、环顾，以及文档拿取、进入、持握、检查、退出，共 9 个 FBX；[源地址、大小和哈希](../assets/reading/motions/source/sources.json) 随项目保存。

使用现有人物原始绑定骨架，将 121 骨的动作源转换到角色使用的 80 根命名骨骼，统一比例、四元数方向及水平位移。导出只包含骨骼和动画的 `reading-mocap.glb`，约 2.74 MB，无新人物网格或贴图。具体片段与裁切范围见 [烘焙清单](../assets/reading/motions/manifest.json)。

当前以原生坐姿呼吸作为基础，叠加轻量放松和文档动作中的肩背、颈部变化。文档动作作为拿书、持书与翻页的上半身参考，针对现有椅子和书重新设计接触。坐下起身由同源站、坐姿与本项目的重心过渡组成；这些是场景适配，不能称作已经获得完整的原生“坐下读书”动捕。

## 完整链路

1. **坐下**：先完成椅前对齐和转身，再降低重心；落座前上身前倾，接触后靠稳。
2. **拿书**：先看向桌面，身体向桌边转移重心并探身，近侧手接近书边。伸手阶段书留在桌上；随后抬起，另一只手从下方接住。
3. **阅读**：书和手有克制的呼吸变化，保留同源素材的肩背运动；眼睛跟随书页区域，配合眨眼和轻微面部调整。
4. **翻页**：一只手稳定托书，另一只手抬起、扫过书页，再平滑回到托书位置。室内、户外书本均有实际翻页网格，持书翻页不再自动弹出遮挡画面的文字面板。
5. **放书**：托书返回对应桌面，再松手、收回身体。室内封面底部约 `0.781 m`、桌面约 `0.780 m`；户外封面底部约 `0.811 m`、桌面约 `0.810 m`。
6. **起身**：持书时点击起身、去池边、回房或按行走键，会先请求放书。书回到桌面并松手后，才开始收脚、前倾和起身，最后迈开。

## 代码职责与复用

| 文件 | 职责 |
| --- | --- |
| `reading-motion-layers.js` | 同源上半身动画的附加混合，不覆盖接触约束。 |
| `reading-player-ritual.js` | 伸手、抬书、阅读、翻页、放回、松手的状态与时序，手和书共用同一时钟。 |
| `reading-player.js` | 基础动作、重心适配、手脚接触及同一角色的双视角可见性。 |
| `reading-walk.js` | 落座、起身的分阶段位置与转向；持书时阻止直接起身。 |
| `reading-world.js` | 导航请求排队，书页、道具、视线和位置声源的协调。 |

第一与第三人称共享人物、道具和动作进度，切换不重播动作。第一人称继续跟随真实眼位，伸手时看向桌边，抬书后回到阅读方向；拖动仍可接管视线。自然录音、随机鸭叫和已有 MiniMax 音频保持使用，朗读声源跟随实际拿在手中的书。

复现素材流程：`python scripts/fetch-reading-motions.py`，随后用 Blender 后台运行 `scripts/bake-reading-motions.py`。运行时直接使用烘焙结果，不需要 Blender。原人物与转化前源素材的来源记录均保留。

## 验收证据与边界

最终实际浏览器检查见 [报告](reading-motion-review-final/report.json)，包括室内整条链、按 W 请求放书后起身、户外侧面和背面、真实翻页、两种视角及 MiniMax 持书朗读。连续视频是本场景实时 Canvas 录制，音频来自本应用输出总线；未采集麦克风或其他应用。

- [连续动作视频](https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/docs/reading-motion-review-final/experience.mp4)
- [自然环境声与 MiniMax 输出](reading-motion-review-final/sound.webm)
- [坐下接触](reading-motion-review-final/04-sitting-contact.png)
- [伸手取书](reading-motion-review-final/06-reach-book-stays-on-table.png)
- [抬书与双手接应](reading-motion-review-final/07-lift-and-support.png)
- [阅读](reading-motion-review-final/08-native-reading.png)
- [实际翻页](reading-motion-review-final/09-page-hand-contact.png)
- [第一人称](reading-motion-review-final/11-first-reading.png)
- [户外背面](reading-motion-review-final/15-outdoor-back.png)

自动检查加载真实同源动作文件，验证双手托书、翻页手往返连续性、脚底支撑和原有音频生命周期。取书接触另以近侧手远端指关节到书边的距离核对：室内约 1.36 cm，户外约 1.95 cm；该骨骼测量不等同于完整手指网格碰撞。椅背间隙检查基于实际摇椅网格，独立于截图。

细指抓握、布料碰撞与完整面部表演仍是简化实现。浏览器录像保留实际运行速度；采集机的帧率限制仍需单独优化，不能用动作片段接入成功宣称产品级流畅或所有角度均无穿插。

最终本机实测共 18 个节点，页面与着色器错误为 0；含声音录像长约 76.34 秒。制作手记中的视频已在独立 Chrome 实际播放，媒体无解码错误。原人物文件哈希保持一致。结构化结果见 [最终摘要](reading-motion-review-final/summary.json)，声音解码见 [电平分析](reading-motion-review-final/audio-analysis.txt)。

用户后续指出座椅接触问题，已补上实际坐垫表面约束与坐下起身脚部轨迹。最新结果以 [座椅穿模修复记录](seat-contact-fix.md) 为准；此前录像作为历史版本保留。
