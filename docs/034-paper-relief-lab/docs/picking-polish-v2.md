# 《采一枚新芽》第二轮完善

2026-11-21。[打开当前故事](https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/picking.html) · [从逐步采叶进入](https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/picking.html?mode=guided) · [六方向入口](https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/directions.html?case=brand)。

这轮继续完善第一段采叶，没有制作炒制、分装和入杯的主体动作。

## 画面与节奏

收叶原来只有几个跨度较大的姿态。新增两组、共8幅完整人物过渡画稿，按实际手位和目光重新排序，补在持叶移向肩部、再抬到篓口之间。采叶画面从24幅增加到32幅，实际GIF为33个编码帧（含末尾停留），仍约14秒。没有用拆分手臂或关节旋转替代人物动作。

前20幅画稿从已确认的旧PNG直接复用，保持像素一致；旁白原文件未变。新旧浏览器合成画面在未变化区域有至多两个RGB色阶的舍入差异，素材检查对此作了独立限定，不把文件检查当成审美结论。

## 观看与操作

- 默认“听看故事”，点击后连贯播放，进入页面时仍保持安静。
- 选择“亲手采叶”后由用户在拈住、摘下、收叶前继续；重新开始会保留当前观看方式。
- 四个阶段现在可以单独听看，段落结束后停住；可以点同一时刻重听，也可以继续后面的故事。
- 暂停时保留当前动作与字幕，切换方向或隐藏页面后不会自行重新出声。
- 载入失败时保留画稿、说明状态并提供重试，恢复后仍需用户点击才播放。
- 动作状态改由[配置](../picking/motion.json)读取，增加画帧后不会沿用旧的第23帧判断收叶完成。

## 素材与检查

- [准确图像生成指令与参考角色](../assets/directions/picking/v2/generation.json)
- [32幅姿态与完整图层对齐记录](../assets/directions/picking/v2/poses.json)
- [当前GIF](../assets/directions/picking/v2/story.gif)
- [编码时序与松手位置](../reports/picking-v2/gif.json)
- [素材与时序检查](../reports/picking-v2/asset-checks.json)
- [浏览器交互检查](../reports/picking-v2/ui-checks.json)

新增画稿使用内置image_gen生成，Canvas合成完整画面并在本地编码GIF。本轮没有重新请求MiniMax，也没有调用外部视频生成服务。原24姿态GIF与此前试看包保留。

目前仍有版画逐帧的线纹变化及局部姿态跳变。补帧改善了收叶路径，但不等同于连续视频或六个方向都已达到成品画质；没有新增真实用户试看反馈。
