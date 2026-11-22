# 13｜来源与实现范围

日期：2026-11-22。此文件是本项目笔记，不是原站全文存档。

## 作者来源
https://x.com/tapehead_lab/status/2118659661394035007
本轮直读403；现有sources/13.json为2026-11-12镜像。作者说少用视频生成，自制工具由Opus5.5协助完成；署名Suno V6、Seedance2.5、MiniMax H3与Claude Opus5.5。工具名称按作者用语保留，不当作本机已接入能力。
原片取样14处，150.66秒可见tapehead.lab导演署名。未取得工程/代码、源资产、生成任务或音乐拍点，不推定具体框架或每镜模型。

## 官方概念资料：候选方法，非作者实现
https://www.remotion.dev/docs/use-current-frame ：帧从0计，局部时间受父级时间位置影响。
https://www.remotion.dev/docs/sequence ：时间线可指定起点、长度与裁切。
https://www.remotion.dev/docs/interpolate ：可将时间/帧映射到动画属性，处理边界与曲线。
https://www.remotion.dev/docs/visualize-audio ：按音频位置取得频谱，裁切/偏移需要统一；频谱不等于自动节拍真值。
本轮读的是2026-11-22页面，不声称文档永久版本固定，也未安装或运行Remotion。

## 本项目代码
timeline-state.js / timeline-demo.js / timeline-demo.html为本轮独立的文字与几何原理演示，没有外部包、作者素材、原曲或小柚图片。示例为10秒、30fps、120 BPM刻度，无音频，无MP4导出。仅验证逻辑与浏览器布局状态；不算原MV或小柚复现。

