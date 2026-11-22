# 第21条｜GIF在解释片中的位置

核对日期：2026-11-22。本文件为本项目阅读摘要与待验证判断，不是完整官方原文快照。

## 来源与作品

- [berryxia原帖](https://x.com/berryxia/status/2118701761909420187)和[leon2mcp引用帖](https://x.com/leon2mcp/status/2118697711818215444)本轮直读403，正文使用2026-11-12公开镜像sources/21.json。前者评价GIF成本，后者报告用@renoiseai做3条仿晚点风格短片及粗略花费/耗时。引用帖没有逐镜GIF/模型/素材说明或账单。
- 三条原始MP4均经浏览器取样，各7处，共21处。只读ffprobe探测均有1080×1920 H.264视频、AAC双声道音轨，名义帧率30/1。没有保存或转码原视频，也没有听审、转录或核验片中新闻与商业数字。
- 插画、重点词、图表、字幕是可见成片结构；无法从外观判定某一镜头来自GIF、静图动效或视频生成。带LatePost标识的仿风格示例不作为晚点官方出品证明。

## 官方资料

1. [OpenAI图像生成指南的GIF段落](https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output)：本轮正文核对。当前Image API的GIF输出可设2–16帧、20–2000ms逐帧延迟（10ms取整），默认9帧/200ms，静态参考通过编辑端点传入；尺寸/总像素预算另有限制。只用于说明当前官方能力边界，不代表引用作者的Renoise任务、当前图像工具或账号设置。
2. [MDN GIF格式](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#gif_graphics_interchange_format)：常规GIF为索引色，每色表最多256项，透明索引为全透明；照片和半透明边缘需检查。不能把256色简化为任意多帧文件总共绝不超过256色。
3. [GIF89a规格](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)：正文可读，说明色表、图像块与控制扩展。标准GIF不是常规音视频容器；音轨由成片层处理。未对作者不存在的源GIF做解析。
4. [web.dev视频性能](https://web.dev/learn/performance/video-performance)：区分容器与编码/音视频流，说明静音视频也可承载GIF式循环。是否更小应实测；本文不把官方示例的压缩比例套到本项目。
5. [Renoise当前Agent介绍](https://renoise.ai/features/renoise-agent)：正文可读，介绍脚本/镜头计划、多模型选型及剪辑等工作。此为当前平台自述，不证明11月6日三条片子的具体模型、参数、收费或成功率。
6. [W3C暂停/停止机制](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)：正文可读。网页持续动画与其他内容并列时，提供可控停止/静态方式有助阅读。本文没有执行网页标准审计。

## 本项目推论与边界

可先比较静图/代码动效、短GIF与视频生成三种上游配画，再接入同一小柚口播、字图和剪辑。8帧×200ms为1.6秒单轮候选，不是原帖参数，也未生成。必须记录从脚本到最终可用镜头的总工时、费用和失败；没有对照就不写省钱百分比。

未完成：源GIF取得、逐镜生成链还原、声音听审、事实核验、小柚三方案输出、格式体积/加载对比、费用/工时验证。reproduced和个人digested保持原状态。

