# 官方GIF能力核对摘要

核对日期：2026-11-22。来源：[OpenAI图像生成指南：GIF输出](https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output)。

- 图片生成与图片编辑端点均可请求GIF输出；静态参考图引导动画使用编辑端点。
- frame_count支持2至16帧，默认9；frame_duration_ms支持20至2000ms，按10ms取整，默认200。
- 尺寸应为auto或符合模型预算的16倍数；帧数、尺寸与数量受总请求像素预算约束。
- 返回完整动画；GIF不支持流式、部分图像或自定义压缩设置。
- 这是当前API能力说明，不证明作者旧客户端、当前Codex图像工具或本账号已开放同样字段。
- 生成帧数、每帧延迟与MP4编码fps分别核对；没有原始GIF就不反推其参数。

本文件为核对摘要，未复制整篇指南。未调用生成接口。
