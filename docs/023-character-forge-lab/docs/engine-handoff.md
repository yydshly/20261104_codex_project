<!-- WARLORD_V3_NATIVE_FINAL -->
## 赤霄 V3：独立原生 MOBA 工程

新版入口为 `engine/warlord/project.godot`，旧 `engine/godot` 已保留。`engine/warlord/play.cmd` 可使用工作区已有引擎或 PATH 中的 Godot 4.5+ 启动；脱离工作区时安装 Godot 后打开 project.godot 即可。独立源码包为 `engine/Warlord-Godot-sourcekit.zip`，不包含引擎 exe、`.godot` 和用户数据。

最终成年重戟角色、13 段动画与元数据已同步，GLB 为 17,657,628 字节，SHA-256 为 `9fa5b9cbbf011a4967b039f8b4a7d52330c8aa2ad7bdf09aa3808d5406ef077c`。官方 Godot 4.5.2 headless 导入成功，43/43 项实际玩法检查通过；记录位于 `engine/warlord/validation/gameplay-report.json`、`import.log` 和 `gameplay.log`。检查包括固定俯视镜头、角色与三名敌人的实际资产、三普攻缓冲与命中时窗、Q 扇扫强化、E 护盾与减速、R 位移与击飞领域、敌人追击预警、物理击退、死亡胜负和重置。

本阶段严格只用 CLI/headless；没有开启可视窗口或操作 UI，因此未验收该原生版本的 GPU 画面、手动操作手感或性能。旧版 GPU 启动记录仅适用于下文的旧工程，不能算作新版画面验收。

---
# 原生游戏引擎交付

本轮实际交付 Godot 4.5.2 项目和 Windows 便携试玩包。

## 入口

- Godot 可编辑项目：`engine/godot/project.godot`
- 当前工作区直接玩：`engine/godot/play.cmd`
- 当前工作区打开编辑器：`engine/godot/open-editor.cmd`
- 独立试玩：`engine/windows/Play-Emberfall.cmd`

Windows 包中 `Emberfall.exe` 是 Godot 官方完整编辑器二进制作为运行时的副本，配合导出的 `Emberfall.pck`。这样无需安装和额外下载全平台导出模板，代价是运行时体积较大。它不是使用精简发行模板重新编译的二进制。

独立源工程压缩包为 `engine/Emberfall-Godot-project.zip`，不含引擎二进制和 `.godot` 缓存。已解压到新的工作区目录，从零导入并复跑相同 19 项检查，全部通过。压缩包可在已安装的 Godot 4.5+ 中打开 `project.godot`；`play.cmd` 优先查找本工作区运行时，再查 PATH 中的 godot.exe / godot4.exe，没有找到则显示明确的导入提示。

## 已完成的游戏行为

1. 基于当前镜头的 WASD 移动，Shift 奔跑，胶囊碰撞体与地面/遗迹柱体碰撞。
2. 三段剑击连招，缓冲下一次攻击，在动作窗口结算扇形近战伤害。
3. 闪避位移、体力消耗、无敌帧；格挡消耗体力并减少 80% 伤害。
4. 三个水晶靶的生命、受击反馈、碎裂和预警冲击波。
5. 生命/体力 UI、胜利/死亡动画、结算与 R 重置。
6. Godot 中导入了实际 KayKit Knight GLB，41 根骨骼、16 段动画、专业贴图及已挂载的剑盾。

## 实际验证

`engine/godot/validation/gameplay-report.json` 记录了在真实 Godot headless 进程中的 19 项自动检查，全部通过：

- 专业模型及 41 骨骼导入、12 个核心游戏动画可用。
- 胶囊落地、行走与奔跑位移及动画选择。
- 三连击窗口依次造成 22 / 27 / 38 点伤害。
- 闪避位移、体力消耗、无敌期间拒绝伤害和结束后恢复受伤。
- 格挡 80% 减伤，扩散冲击波到达并造成伤害。
- 三个水晶销毁后 Victory，重置、死亡与死亡后重置。

`validation/import.log`、`runtime.log`、`gameplay.log` 和 `export-pack.log` 保存了引擎导入、运行和打包日志。首次沙箱运行因默认 AppData 写入受限失败，随后仅为引擎子进程使用项目内的数据目录，已完成成功运行。没有修改系统的 AppData 设置。

`validation/packed-runtime.log` 还记录了实际 PCK 在官方便携运行时中启动并运行 120 帧后正常退出（退出码 0）。`fresh-zip-import.log` 和 `fresh-zip-gameplay.log` 记录独立 ZIP 的新目录导入与复跑。

## 重跑命令

在子项目根目录的 PowerShell 中：

```powershell
$env:APPDATA = (Resolve-Path -LiteralPath 'tools/godot/editor_data').Path
& './tools/godot/Godot_v4.5.2-stable_win64_console.exe' --headless --path './engine/godot' --import
& './tools/godot/Godot_v4.5.2-stable_win64_console.exe' --headless --path './engine/godot' --script res://scripts/smoke_test.gd
```

这里只影响当前 PowerShell 进程及其子进程。启动脚本使用 `setlocal`，退出后恢复原环境。

## 下载完整性与来源

Godot 官方 Windows 下载页：
https://godotengine.org/download/archive/4.5.2-stable/

已下载的 77,480,943 字节压缩包 SHA512 与官方 `SHA512-SUMS.txt` 中的条目一致：

`b21115cf3620438e17959d13946bf9c7dceabb6ff71ed32a68996a21e08615edd2d1a3d25641bb3e260d084b31f500231aa59fcf026a5228bcc20ac4e8bade60`

角色许可和来源见 `assets/game/LICENSE-KayKit.txt`、`assets/game/character.json` 及 `docs/asset-provenance.md`。

## 边界

自动回放验证了原生引擎的数据、物理和游戏逻辑；尚未进行原生 GPU 窗口的人工视觉与手感验收。此包是可玩的训练场原型，不包含完整关卡、存档、商店或商业发行流程。Unity 导入、移动设备与主机平台没有在本轮原生项目里验证。

原生 GPU 启动检查已建立 NVIDIA RTX 4070 Laptop GPU / OpenGL 3.3 上下文并输出 `EMBERFALL_READY`，记录见 `engine/godot/validation/gpu-runtime.log`。用户随后以物理 Esc 停止 Computer Use，因此没有完成 CUA 画面与手动操作验收；不能把 GPU 初始化成功视为该部分验收通过。自有测试 console 会话已通过 Ctrl+C 结束，没有继续启动窗口或操作其他程序。
