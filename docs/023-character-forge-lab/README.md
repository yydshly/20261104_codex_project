# 023 · 角色素材与游戏质感研究

从“Codex能否复现角色建模与动画流程”出发，做出原创重戟战士赤霄与实际可操作战斗，并整理从素材、绑定、动画到游戏接入的实现方法。研究的关键发现是：人物资产与游戏系统需要分别制作、分别验收；代码能把战斗组织起来，优秀角色仍需要专门的美术与动画生产。

[在线研究与引导图](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/) · [亲自操作赤霄](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/play.html) · [13.9秒实战与迭代对照](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/#effects) · [提示词工作台](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/#prompts)

## 实现了什么

- 以Quaternius CC0成年人体与通用动作为基础，制作原创盔甲、重戟和辅助骨，完成13段导出动作及材质、脚锁、披风接触修正。
- 在Three.js中实现移动、普攻连段、横扫、真实护盾、跳劈、命中反馈，以及三名会追击、反击、受击和死亡的动态守卫；另提供使用同一GLB的Godot可编辑工程。
- 留下13.9秒真实WebGL战斗录像、多个迭代截图、资产来源、原始性能记录、实现脚本与交付检查。网页包含8条历史需求、13个新整理且未执行的制作模板，以及12个来源。
- 网页以“实现、实际效果、价值”三块摘要开篇，继续展开流程、工具配置、提示词、常见问题和三条待研究素材路线。

## 效果是什么

可以先看录像中的脸部近景、护盾、横扫、普攻和跳劈，再进入演武亲自操作；这是一套实际游戏规则驱动的技术样例。生成汇总图使用已有实录作为参考，不是新的角色资产或升级后的游戏画面。

**现有脸部、甲片结构、材质层次与发力节奏仍未达到商业吕布或《英雄联盟》英雄的成品水准。** 100骨骼、266,728三角面、13动作和检查数量说明资产结构与覆盖范围，不能证明美术质量。

![沿用本轮生成的角色素材与游戏质感汇总图，包含实际效果参考、已验证能力、价值、制作流程和待研究方向](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/docs/character-research-overview.png)

引导图原样复用，1672×941，SHA-256：`3233230c348cd00cfbded0b82eb4af09a90a5ce2426701878a2e2a4c36cb344d`。生成提示词与制作记录随网页公开。

## 价值与可扩展方向

| 已积累的能力 | 用途与价值 | 下一步 |
| --- | --- | --- |
| 素材、动作与引擎之间的交付合同 | 换角色时复用玩法框架，明确比例、动作名、挂点和命中时序 | 先替换一个人物，核对游戏尺寸与变形 |
| 可操作战斗与原始实录 | 同一场景比较角色观感、动作重量和运行效果 | 固定镜头比较跑步与一次无特效重击 |
| 提示词、源码、许可与证据链 | 降低沟通与追查成本，区分实现错误和美术差距 | 对照成熟授权资产改制、AI候选加专业后期、完整原创制作三条路线 |

三条素材路线尚未执行，不是已生成结果；效率、成本节约与商业收入没有测量。真正的下一步是让一个人物、一次跑步与一次重击先通过独立视觉验收，再扩展技能、换装和NPC。

## 技术、来源与验证边界

实际路径为Codex编排、本机Blender Python、CC0基体与动作、项目原创装备，以及Three.js / Godot接入。没有调用Fable、Tripo或Seedance生成任务，也没有实际连接Blender MCP；网页中的相关配置属于待接入说明。

历史证据日期为2026-11-12；公开整理日期为2026-11-21。保留当时Web 56项、Godot 43项玩法加16项约束检查记录，并公开三轮性能数据。末轮RTX 4070 Laptop、1280×720、DPR 1、120秒连战为50.896 FPS，无超过100ms帧，不能宣传稳定60 FPS。Godot导入与headless检查不代表原生GPU画面通过；物理手机、Unity/Unreal和联机也未验收。

研究起点：[Lucca Cerf原帖](https://x.com/luccacerf/status/2120305718939021566)。角色来源：[Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html)与[Animation Library](https://quaternius.com/packs/universalanimationlibrary.html)，原许可随资产保留。没有使用王者荣耀或英雄联盟的商业角色模型、贴图、动作或音效。原作者逐字提示词未获得，网页不会把新编模板当作作者原话。

## 公开文件与复用

[公开源码目录](https://github.com/yydshly/20261104_codex_project/tree/main/docs/023-character-forge-lab)提供Web全部运行资产、研究源码、历史版本、制作脚本、检查记录、许可、实际录像和Godot源工程。最终GLB为19,074,680字节，SHA-256：`1f3fc19564ebfd7bf1ae8e9c27ed9f3e041c55bfde18f1c43f35e4bab2ea7838`。

[Godot完整工程ZIP](https://yydshly.github.io/20261104_codex_project/023-character-forge-lab/engine/Warlord-Godot-sourcekit.zip)包含同一角色与脚本，11,811,277字节。最终75 MB Blender工作文件与138 MB本地完整交付ZIP保留在本地，公开页面明确列出范围，不挂失效下载。GLB可导入Blender继续编辑；研发脚本依赖阶段输入，不能对最终模型反复运行来“一键提高品质”。

在公开目录运行`npm run dev`可启动本机静态预览，无需前端依赖安装；`npm run verify`执行发布文件、研究事实与玩法/动作约束检查。`docs/local-package-reference.json`保留原完整本地工程的命令参考，公开版单独提供可运行命令。

发布脚本：`node projects/023-character-forge-lab/publish.mjs --source <本地character-forge-lab绝对路径>`。复核：`node projects/023-character-forge-lab/verify.mjs`。GitHub Pages沿用`main /docs`；`publication-manifest.json`记录每个文件字节数、哈希与引导图原样一致性。
