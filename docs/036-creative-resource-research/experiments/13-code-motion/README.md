# 13｜小柚素材与代码包装试验

状态：本地代码原理演示已运行；作者工具、小柚素材、真实音频和视频输出未复现。

- [完整分析](../../13-code-motion-mv-deep-dive.md)
- [10秒可交互原理演示](timeline-demo.html)
- [演示验证记录](demo-review.json)
- [逻辑边界检查](timeline-logic-check.json)
- [原片14处取样](original-video-review.json)
- [素材模板](asset-manifest.template.json)
- [事件表模板](cue-sheet.template.csv)
- [生产记录](production-record.template.json)
- [两版对照表](comparison.template.csv)

演示代码为本项目原生JS/SVG，不依赖外部包。timeline-state.js决定帧状态，timeline-demo.js负责界面播放和参数替换。10秒/30fps/示意120 BPM不是原片参数，页面无人物资产、无音乐、无MP4导出；返回同帧只证明本地布局状态一致。

后续选同一5至10秒稳定小柚素材和可使用音频，人工标5至8个真实事件。先做一种转场与少量重复，再只换文案/配色做第二版。图层、关键帧、字体、版本、参数、哈希、原片和导出分别留档。

检查身份/口型、透明边缘、字体/长字、脸与字幕遮挡、事件偏移、首末帧和音画导出。耗时包括配置、修正、审片与导出，未测保持null。模板请复制为独立试验记录，不覆盖来源与本模板。

作者工具复现、小柚生产实作、音画/导出和个人消化分别记录；代码预演不自动升级这些状态。

