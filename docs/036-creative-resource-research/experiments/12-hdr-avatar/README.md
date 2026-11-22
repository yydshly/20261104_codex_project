# 12｜小柚SDR/HDR对照试验

状态：原作与PNG结构已核对；小柚转换、HDR显示和平台保留未验证。

- [完整分析](../../12-hdr-avatar-deep-dive.md)
- [只读PNG结构结果](png-structure-review.json)
- [原媒体观察](original-media-review.json)
- [本次浏览器能力](browser-capability-review.json)
- [两站界面差异](tool-interface-review.json)
- [运行记录模板](trial-record.template.json)
- [对照验收表](comparison.template.csv)

首轮使用同一小柚SDR母版，只另做一个局部HDR候选。脸、品牌色、裁切尽量不变，记录实际像素处理、格式、输入/输出哈希、工具/版本和时间费用。先检查结构、圆裁和48/64像素边缘，再在HDR和普通显示环境分别看；截图不代替HDR母版或物理亮度。

头像与视频各走独立记录；视频可先选约5秒含脸、亮物、暗部和字幕的自有片。两工具对X兼容和上传入口的说法不同，平台返回文件与实际播放另验，不以本地转换代替。

模板复制为独立试验记录，保留原件。未测值留null；文件、HDR显示、平台保留、内容收益和个人消化分别标记。更换X头像可能触发蓝标复核，本轮没有账号修改、上传或发布。

inspect_public_png.py仅解析固定公开PNG URL，原媒体不另存，输出只含结构和校验。它不是小柚转换器；CRC和色彩声明检查不代表HDR显示通过。

