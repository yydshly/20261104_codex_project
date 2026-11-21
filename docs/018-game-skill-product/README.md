# 潮光 · 海港守灯人 / 游戏 Skill 研究

完整三章浏览器动作游戏，实际接入四个带工具与实现的游戏开发 Skill，配套两轮研究、贡献归属、效果展示与证据回顾。

[在线研究与引导图](https://yydshly.github.io/20261104_codex_project/018-game-skill-product/research.html#overview) · [在线完整游戏](https://yydshly.github.io/20261104_codex_project/018-game-skill-product/) · [018 完整研究摘要](../projects/018-game-skill-product/README.md)

当前网页已整理为研究回顾，区分两轮采用、实际效果、贡献归属与价值证据。同模型、同需求的独立对照尚未运行，目前只有协议；首次开发耗时、完整返工次数与效率收益仍为未知。

- [一张图看研究全貌](assets/research/research-overview-v3.png) · [可编辑 SVG](assets/research/research-overview-v3.svg)
- [研究过程、贡献边界、价值与代价](research.html)
- [独立对照协议：尚未运行](ab-experiment/PROTOCOL.md)

- [效果对照与价值记录](research.html)：同机位滑块、音效对照、实际贡献与性能代价。
- [完整游戏](index.html)：WASD / 方向键移动，J 攻击，Space 冲刺，Q 潮汐共鸣，E 点灯，P / Esc 暂停。
- [资源展台](gallery.html)：旋转四个 GLB，检查特效 24 帧，试听全部声音。
- [完整用法与重建命令](SKILL-USAGE.md)
- [来源、固定版本与指纹](skill-sources/v2/manifest.json)
- [带游戏声音的完整实玩录像](evidence/v2/full-playthrough.mp4)
- [上一版三章游戏](before-upgrade/) · [上一轮采用判断](research-v1.html)

在此目录执行 `npm run dev`，打开 http://127.0.0.1:5267/research.html 。运行时不需外部账号、CDN 或 Python。

本次实际使用 asset-maker 的 create-3d-assets、create-vfx、create-sfx 生产四个模型、两套图集、十个游戏声音与一个对照声音，并复用 3d-ultra-realistic-water 的海面模块。Q 真实破甲、打断和消弹，命中回充。模型造型、Q 玩法规则与运行适配由本项目编写；具体贡献边界见用法文档。

暮港、雾礁与风暴灯塔包含近战、远程、掩体、双阶段首领、两次装备选择、检查点、失败重试与结局。手机有独立 Q 按钮；`?preview=1&chapter=2` 可查看预设首领场景，不写航程存档。

22 项规则测试与 34 项浏览器检查通过，一次正常键盘通关 21.48 秒、7 次共鸣、0 重试。相同 seed 重建的 23 个 GLB/WAV/PNG 哈希一致。自动画质短样本中旧版 21.49ms / 帧，新版 23.23ms / 帧；数据来自 SwiftShader，真机与普通玩家体验待测。没有独立模型对照，不宣称节省时间或提高模型上限。

海面模块已核对为 MIT，许可保留于 vendor/ocean-LICENSE.txt；Three.js 许可在 vendor/LICENSE。asset-maker 未声明仓库许可证，公开提交与静态包排除其工具包、复制模板和 Skill 全文，保留项目配方、生成产物、来源与指纹。完整范围见 THIRD-PARTY-NOTICES.md。引导图中的本机评估状态为研究阶段记录，原图未改动。

## 总览图与页面整理

总览图为 2240×4480 PNG，并保留嵌入真实游戏截图的 SVG。网页支持放大、原始尺寸、滚动查看与下载。原始依据和 SHA-256 记录在 `assets/research/overview-manifest.json`；正文提供完整文字、来源、实玩录像、前后试听及原始报告。

`python scripts/build-research-map.py` 生成矢量图；`node scripts/render-research-map.mjs <Node模块目录>` 使用 Sharp 导出 PNG。本机默认使用 Codex 提供的依赖路径，外部环境可显式传入包含 Sharp 的模块目录。没有使用 AI 生成图像替代实帧。

当前结论：确认本次资源与代码复用，主要可见效果集中在视听表现；重复生产的效率、返工减少、玩家偏好与整体游戏开发收益未实测。Q 的伤害、破甲、打断、消弹、回充，以及三章产品功能，不作为这四项 Skill 的独有收益。版本前后截图不等同于同模型独立 A/B。

第一轮和资源接入阶段页面分别归档为 `research-v1.html`、`research-v2.html`；本次页面交互检查记录在 `evidence/v3/research-verification.json`。本轮整理未修改游戏判定或资源生成配方。

## 发布与复现

`node build.mjs` 生成 `docs/018-game-skill-product` 的公开静态包，采用明确的文件范围，不复制上游 SDK 与全文快照。直接游玩无需资源生成工具；公开源码的配方重建需要自行从上游取得相应工具版本，并按适用条件使用。
