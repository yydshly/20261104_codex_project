# 第三方来源与发布范围

此项目研究游戏开发 Skill 的实际能力与价值。公开包包含项目编写的游戏、资源配方、生成产物、研究文本、运行记录与引导图；不等同于把所研究的所有上游仓库再次分发。

## 运行时源码

- Three.js r187 及其 GLTFLoader、BufferGeometryUtils、SkeletonUtils：MIT，许可证见 `vendor/LICENSE`。
- `vendor/ocean.mjs`：来自 zafmy/threejs-Skills 的固定提交 5ea1661a0e05d82b054553daaa6baf6d0233c33c；MIT，Copyright (c) 2026 Meng To。完整许可证见 `vendor/ocean-LICENSE.txt`。模块原样保留，海港适配在本项目 `harbor-assets.js` 中。

## 资产生产工具

create-3d-assets、create-vfx、create-sfx 来自 Be1l-ai/asset-maker 固定提交 d095bc28e9a8e4cfe58996cbaf3a0ee9cbe4e46e。核对该提交的完整文件树后，未找到仓库许可证声明。

因此公开提交与静态包不包含其 `asset_pipeline` 工具包、复制的示例模板或 Skill 全文。来源链接、固定版本、实际调用符号和已记录指纹保留，供读者追溯。模型造型、生成配方、特效参数、合成声音与游戏接入由本项目编写；发布的是现有生成产物，而非工具包源码。

源码中的资产配方仍依赖上游工具：如需本机重建，应自行从上游获取相应版本，并按其授权条件使用；本项目不授予该工具包的额外权利。正常游玩不需要该 Python 工具包。

## 历史研究快照与图表

Skill 原文快照保留于原本机研究环境，不随公开包分发。公开网页提供上游链接与来源清单；研究摘要采用本项目的整理文字。

引导图沿用已经生成的 2240×4480 图，字节保持不变。图中“本机评估 / 上游再分发授权待确认”是研究阶段状态。发布核验已确认海面 MIT，并从公开包排除无许可证声明的工具包与上游全文；当前发布范围见 `publication/source-rights.json`。

本研究仍未运行同模型、同需求的独立 A/B，不能据此声称开发更快、返工更少或玩家更喜欢。
