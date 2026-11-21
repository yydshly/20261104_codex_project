# 座椅穿模修复 · 2026-11-16

用户指出的问题成立。原坐姿只校准了骨骼目标点，未覆盖蒙皮臀腿与坐垫的真实接触。实际网格检查发现 13 个采样点进入坐垫，最深约 3.44 cm；拿放书与坐下起身时还存在动态接触问题。

本次使用原座椅的真实 CC0 网格生成坐垫表面数据 `reading-seat-surface.js`，由 `reading-seat-contact.js` 查询。人物完成骨骼动作后，用实际蒙皮的臀腿采样点修正骨盆支撑高度，并重新计算脚部支撑、手臂及持物接触，避免只修骨骼而漏掉衣物表面。保留了完整人物网格，没有通过遮挡或隐藏臀腿掩盖重叠。

坐下起身同时修正了两项基础问题：骨盆高度现在在真实站立高度与坐姿支撑高度之间插值；双脚分阶段从脚凳移动到落脚点，不再先收进座椅内部。坐下时，脚部目标在世界坐标中提前对齐，随后降低重心。相机继续跟随实际眼位。

独立于运行时表面数据的检查，直接对人物蒙皮和原始座椅三角网格做射线核对，覆盖坐姿呼吸、伸手抬书、阅读、翻页、放书、起身和再次坐下，共 134 个采样时刻。最大残余重叠约 **0.75 mm**，低于 2 mm 的回归阈值。它是有范围的采样验证，不等同于完整布料碰撞或所有动作、角度均无穿插的保证。

- [实际网格检查](seat-contact-review/mesh-report.json)
- [靠背检查](seat-contact-review/back-report.json)
- [实际浏览器报告](seat-contact-review/report.json)
- [修复后的阅读侧面](seat-contact-review/08-native-reading.png)
- [修复后的起身](seat-contact-review/02-stand-weight-transfer.png)
- [连续实时画面与应用声音](https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/docs/seat-contact-review/experience.mp4)

实际浏览器复查了室内整条链、第一与第三人称、自然环境声和 MiniMax 持书朗读，页面及着色器错误为 0。保留原人物模型和素材来源。运行时接触数据可由 `node scripts/bake-seat-surface.mjs` 从实际座椅重建；`npm run test:connected` 已加入独立网格接触回归。
