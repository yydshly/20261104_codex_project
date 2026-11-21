# 原生 GPU 验收边界

本机官方 Godot 4.5.2 Windows 二进制的 `--help` 明确列出：`windows` 显示驱动可使用 Vulkan / D3D12 / OpenGL；`headless` 显示驱动只支持 `dummy`。`--headless` 等价于 `--display-driver headless --audio-driver Dummy`。

实际执行了以下无窗口探针，没有启动可见原生窗口：

```powershell
Godot_v4.5.2-stable_win64_console.exe --headless --rendering-method gl_compatibility --path engine/warlord --script res://scripts/offscreen_capture.gd
```

结果保存在 `engine/warlord/validation/offscreen-probe.json`：显示驱动为 `headless`，配置的渲染方式为 `gl_compatibility`，但 GPU 适配器名称为空，`nativeGpuFrameCaptured` 为 `false`。显式填写渲染方式没有为 Windows headless 驱动创建 GPU 显示上下文；本轮没有生成并冒充原生 GPU 截图。

因此原生自动检查只证明导入、骨架、动画、玩法和物理状态。实际 GPU 长时间运行、帧率、材质和战斗画面通过浏览器单独检查；浏览器结果也不等于原生 GPU 已通过验收。原生窗口的人工验收仍需用户允许显示窗口后进行。

源码提供 `offscreen_capture.gd`，可在未来获准使用真实显示驱动时捕获实际 viewport；当前自动工作流只执行其能力探针分支。

V5 新增的世界脚锁、重击重植和披风 capsule 约束使用 `SkeletonModifier3D`，已有独立的真实引擎检查；最终报告分别绑定模型 SHA 与实际运行时代码 SHA。它们能核对骨骼位置、离地释放、动画倍速与重复重置，但没有测量原生 GPU 帧时或验证着色画面。`meshes/generate_lods=true` 只说明 Godot 的导入 LOD 生成已启用，不代表原生 GPU 上的 LOD 切换、画质或帧率已经人工验收。

浏览器长时间测试单独记录未经游戏 delta 上限裁剪的 RAF 间隔、实际 draw calls、分辨率与资源计数，并与测试时的模型 SHA 绑定。RAF 帧率体现该浏览器环境的呈现节奏，并非隔离的 GPU 执行时间；如果上下文使用软件渲染，也不能把结果解释为物理显卡性能。未提供真实采样时，预算脚本只输出面数、primitive 与纹理容量估算，不产生虚构 FPS。

参考：[Godot 4.5 命令行文档](https://docs.godotengine.org/en/4.5/tutorials/editor/command_line_tutorial.html)、[RenderingServer 适配器与 headless 说明](https://docs.godotengine.org/en/4.5/classes/class_renderingserver.html#class-renderingserver-method-get-video-adapter-name)。
