# 第30条 · WorldForge 免费、交付和商用核对

## 判断

WorldForge 值得参考它的场景预设、任务回收和素材库。小柚第一版场景背景更适合走授权明确的静帧空镜。当前源码的 Lyra 路线能产出漫游视频，公开权重限内部科研。如果要求可改机位、可重打灯或交工程，用第25条原创场景与第29条可核授权的城市底模。

## 免费怎么理解

第30条指向 `designfuchen/worldforge`。长文封面把生图、视频、配音标 0 元。正文说明作者已经有 Google AI Ultra，免费指工作台不按产物收积分。仓库 MIT。工作台负责预设、队列、预览与回传，模型和推理算力另算。所读提交 `60a5323c3952e1ccad31dfc45d4aec4e13d9da4b` 与原帖同日。原生 SwiftUI 要 Apple Silicon，另有本地 Web 控制端和自有 GPU 后端说明。当前 Windows 项目没有进行安装或兼容性验证。 [作者长文](https://x.com/i/article/2119323974454648832) · [仓库固定版](https://github.com/designfuchen/worldforge/tree/60a5323c3952e1ccad31dfc45d4aec4e13d9da4b) · [MIT 许可](https://github.com/designfuchen/worldforge/blob/60a5323c3952e1ccad31dfc45d4aec4e13d9da4b/LICENSE)

| 节点 | 费用怎么产生 | 如何核对 |
| --- | --- | --- |
| 工作台 | 开源代码可用。查阅的生成、素材库和回收路径未见工作台付费 | 区分应用许可与第三方资源账单 |
| 准备云端 | 可能已有付费订阅或另购 CU。权重下载、存储及加载需要资源 | 看账户权益、可用余额和分配到的机器 |
| 生成 | Colab 在运行时消耗 CU，重试和首帧生成也随会话实际计入。使用自有显卡就看时间、电和存储 | 以账户起末用量和真实可用件数计 |
| 下载 | 输出文件由云端拉回本地工作台，读到的路径没有单独导出收费 | 核实际文件、分辨率、回传等待和会话时间 |
| 本地后期 | 插帧、倍速、放大、编码耗本机时间 | 区分原生分辨率与后期放大 |

Google Colab FAQ 说明，免费托管环境没有正 CU 余额时，SSH 远控和绕开 Notebook、主要使用 Web UI 属于受限用法。付费方案和正余额可解除这类限制，GPU 类型和运行时长仍受资源影响。Google AI Ultra 权益按计划和地区变化，作者所写的硬件与 30 TB 云盘是其口径。当前未获取用户账户价格或账单。 [Colab FAQ](https://research.google.com/colaboratory/faq.html) · [Google AI 计划](https://one.google.com/about/google-ai-plans/) · [本地回收源码](https://github.com/designfuchen/worldforge/blob/60a5323c3952e1ccad31dfc45d4aec4e13d9da4b/forge_local/app.py#L329-L376)

## 能拿到什么

核对 6 张原图。暖金站台、雨窗暖灯与冷色街景可用于拆构图和灯光。八帧图里镜头沿桥接近并穿过石拱，远处有浮岛和大树。帧条可以观察选定画面，完整连续性、离屏后的结构和渲染速度待实际生成。

固定版 Lyra worker 返回 `world.mp4`、`input_frame.png`。拿到投影序列且选项开启时，还可返回 `warp.mp4` 与 `split_3dgs.mp4`。两个辅助文件都是视频。上游 Lyra 另有以视频重建高斯场景并输出 `reconstructed_scene.ply` 的步骤，本次没有在 WorldForge 交付清单里看到这一步。 [WorldForge 输出代码](https://github.com/designfuchen/worldforge/blob/60a5323c3952e1ccad31dfc45d4aec4e13d9da4b/remote/lyra_worker.py#L531-L573) · [NVIDIA 上游重建](https://github.com/nv-tlabs/lyra/blob/main/Lyra-2/README.md)

## 商用要查到实际模型

- WorldForge 软件是 MIT。Lyra 的 Apache 2.0 源码和权重是两份许可。Lyra 2.0 公开权重仅授予非生产内部科研用途，模型不得用来制作供销售或分发的作品。NVIDIA 不主张输出所有权，模型用途条款仍适用。有对应商业用途时须另取许可。
- 预设中的 Qwen-Image-2.1-Turbo 是 Qwen Research License，商业使用另需许可。源码显示未提供有效首帧时，部分视频或 Lyra 任务可能先用 Qwen 等模型合成首帧。实际用到的模型要写进成片资料。
- 可优先检查 Z-Image-Turbo、FLUX.1 schnell，或需要运动时检查 Wan 2.1 I2V 的对应 Apache 2.0 发布。第三方托管服务、附加 LoRA、输入图、字体、标志、人像或音频等分别确认适用许可。

[NVIDIA 权重许可](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-internal-scientific-research-and-development-model-license/) · [NVIDIA 商业授权](https://www.nvidia.com/en-us/research/inquiries/) · [Qwen 许可](https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/066a07d/LICENSE) · [首帧源码](https://github.com/designfuchen/worldforge/blob/60a5323c3952e1ccad31dfc45d4aec4e13d9da4b/remote/forge_server.py#L1219-L1247) · [Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) · [FLUX.1 schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) · [Wan I2V](https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P-Diffusers)

## 小柚先试什么

先用现有工作流做一张自有雨窗空镜，锁窗框、桌面和小柚的人物位置，使用冷窗光和暖台灯。将同一段口播合成后检查人物边缘、光向和竖屏字幕。静帧通过后，再确认是否需要一个 5 秒背景微动或改成可编辑工程。试验记录包含工具版本、许可、实际算力、回传、返工、通过件数。小柚样片及真实账单待实作。 [试验记录](experiments/30-worldforge/xiaoyou-background-trial.md) · [证据索引](references/30-worldforge/evidence.json)
