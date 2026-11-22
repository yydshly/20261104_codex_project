# 33 小柚的交付需要独立验收

[HeLi 中文原帖与原片](https://x.com/HeLi8866/status/2119091822530302352) · [Foreman 固定版说明](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/README.md) · [Agent Org Chart 工程模板](https://github.com/serenakeyitan/agent-org-chart/blob/afc8f7613d37cbfbb6322453b3d18b9c12878844/charts/engineering/chart.json) · [Grok Bot Profiles · PR Verifier](https://github.com/HAEGONG/grok-bot-profiles/blob/6f3d07e566008175486228a509bd8461e5efb85f/bots/development/pr-verifier/PROFILE.md) · [网页对应模块](http://127.0.0.1:5209/#33)

2026-11-22 核对第33条原板块媒体。原帖附件为 21.6 秒视频，平台提供原视频封面。网页中已验证从封面进入播放，时间从 0 秒走到 6.32 秒，720×900 正常解码。研究另取同媒体 9 帧，核对固定版仓库的 README、配置和验收代码。视频内的架构与数量按演示记录。[取样和版本索引](references/33-foreman/evidence.json)

## 一段动画里讲了三个问题

| 时间 | 画面 | 能用于判断什么 |
| --- | --- | --- |
| 约 4 秒 | Coding 卡片标 Spec Writer、Bug Repro、PR Producer、PR Verifier | 可以按规格、调查、制作、复核明确职责 |
| 约 7 秒 | 15 项目录，Agent Org Chart、Foreman、Grok Bot Profiles 分别排第 1、5、9 | 三个项目各自有仓库和文档 |
| 约 10 秒 | Foreman 弹出 /stalled，写 pr.open 闲置 14 分钟，随即出现改派与核验完成 | 告警与复核状态可被展示。实际改派、查看过的文件和检查过程缺直接运行证据 |
| 片尾 | 5 组、15 仓库，展示 12 分钟等数字 | 可记录演示叙事。缺账号基线、任务记录和耗时口径 |

原帖里的其余仓库链接继续保存在 [第33条原始笔记](notes/33.md)。核对重点是分工、巡查和独立验收。[原片](https://x.com/HeLi8866/status/2119091822530302352)

## 从三个仓库分别能借什么

1. **Agent Org Chart 写组织分工。** 固定版 Engineering 模板有 Engineering Manager 和 Engineer，后者向前者汇报，具体的 handoffs 为空。格式支持角色范围、汇报关系、交接条件和频道。小柚可以只登记协调、制作、复核和负责人四顶帽子，明确什么时候交哪份产物。[Agent Org Chart 工程模板](https://github.com/serenakeyitan/agent-org-chart/blob/afc8f7613d37cbfbb6322453b3d18b9c12878844/charts/engineering/chart.json) · [Agent Org Chart 字段说明](https://github.com/serenakeyitan/agent-org-chart/blob/afc8f7613d37cbfbb6322453b3d18b9c12878844/SCHEMA.md)
2. **Foreman 用证据追卡点。** 固定版看板一人一卡，等人优先于普通静默。状态能点回报告来源，抓取失败时标记上次观察过期。仓库截图顶部有 fixture 标记。将这个思路接到第31条，先看缺谁、缺什么、哪一版需要处理。[Foreman 固定版说明](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/README.md) · [Foreman 看板演示原图](https://raw.githubusercontent.com/Archive228/foreman/35b4e1d04453dd7536b05d1c7db00b697d31ee96/assets/board.png) · [第31条](http://127.0.0.1:5209/#31)
3. **Foreman 将规格与通过条件关联。** 规格正文、步骤和前置条件有固定摘要，执行记录绑定规格。通过判断查前置项、运行绑定和 approve 裁定是否存在且无验证错误。验证读入的 claim 与 verdict 分开，证据缺失或核验错误可记 Partial。该结果不能让规格状态变为通过。把这条原则迁到小柚，应另用候选版本和内容哈希绑定复核报告。[Foreman 固定版说明](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/README.md) · [Foreman 验证裁定逻辑](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/src/verify/gate.ts) · [Foreman 规格通过条件](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/src/spec/gate.ts) · [Foreman 读取 claim 与 verdict](https://github.com/Archive228/foreman/blob/35b4e1d04453dd7536b05d1c7db00b697d31ee96/src/verify/run.ts)
4. **Grok Bot Profiles 写独立复核职责。** PR Producer 交可审的具体产物。PR Verifier 用独立上下文读取 PR 与主证据，按测试、契约和回归给 PASS、BLOCK 或 HOLD，把最终合并交给人。它对缺失证据和有证据显示缺陷作不同处理。小柚可以把三条技术门槛替换成成片是否能交、制作约束是否满足、其他时间段有没有随返工劣化。[Grok Bot Profiles · PR Verifier](https://github.com/HAEGONG/grok-bot-profiles/blob/6f3d07e566008175486228a509bd8461e5efb85f/bots/development/pr-verifier/PROFILE.md) · [Grok Bot Profiles · PR Producer](https://github.com/HAEGONG/grok-bot-profiles/blob/6f3d07e566008175486228a509bd8461e5efb85f/bots/development/pr-producer/PROFILE.md)

## 小柚的一条 5 秒口播怎么交

| 阶段 | 负责方 | 必须交到下一环的东西 |
| --- | --- | --- |
| 开工 | 需求与协调 | 候选规格、原音版本、身份参考、决策人、通过口径 |
| 出片或返工 | 制作人 | 可打开的 MP4、版本、原音、参考图、已知问题 |
| 检查 | 独立复核者 | 查过的文件与版本、逐项证据、整段结论、退修或补证条件 |
| 签收 | 负责人 | 签具体候选的交付记录，附报告与相关创作决定 |

- **通过**需要候选能读、规格符合、有正常速度的视听检查。证据能关联同一版本。负责人可以据此确认观感。
- **退修**用于明确可重现的缺陷。例如 `00:02.40` 嘴型与原音有明显错拍，写可听见的字、发生时间与重验方式。
- **待核**用于必要证据暂缺或打不开。例如拿不到原音，先请素材负责人给指定版，再决定同步是否通过。
- **换版本**保留旧结论，新的候选重新登记和复核。单人完成时用独立的一轮看规格和文件，减少被制作过程里的自评带偏。

形式检查先核文件、时长、画幅、解码和音轨。再从开头到结尾看脸、口型、闪烁和字幕。如果只修一段，复验给定时间点并完整播放一遍，检查接缝和一致性。最后把三态与签收状态挂到第31条看板。第15条的文字、静帧、视频分段确认仍可用于较早环节。[单镜头验收卡](experiments/33-foreman/xiaoyou-acceptance-trial.md) · [第15条](http://127.0.0.1:5209/#15) · [第31条](http://127.0.0.1:5209/#31)

本轮完成桌面推演。没有安装或运行三个仓库，也没有生成或验收一条真实的小柚新片。下一次用本地素材量化退修能否被重现、报告是否指对版本、发现到修正用了多久。
