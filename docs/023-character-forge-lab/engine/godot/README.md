# Emberfall · Godot 原生试炼场

以官方 KayKit CC0 Knight 资产构建的第三人称战斗原型，使用真实骨骼动画和 Godot 物理。

## 直接运行

在当前工作区双击 `play.cmd`。它调用随项目下载的官方 Godot 4.5.2 便携版，只为子进程设置本项目中的用户数据目录，不改变系统配置。双击 `open-editor.cmd` 可进入编辑器，也可在已安装的 Godot 4.5+ 中打开 `project.godot`。

独立 Windows 试玩包在 `../windows`：运行 `Play-Emberfall.cmd`。包中 `Emberfall.exe` 是官方 Godot 编辑器二进制的副本，作为便携运行时加载 `Emberfall.pck`；这不是用独立发布模板编译的精简发行版。

## 操作

| 操作 | 输入 |
| --- | --- |
| 移动 | WASD，相对于当前镜头 |
| 奔跑 | Shift |
| 三连击 | 左键或 J，动作过程中可缓冲下一击 |
| 闪避 | 空格，消耗体力并带短暂无敌帧 |
| 格挡 | 按住右键或 K，消耗体力并减伤 |
| 镜头 | 中键拖动，滚轮缩放 |
| 重置 | R，或结算面板按钮 |

目标是击破三个水晶。水晶发出红色预警后放出扩散冲击波；可以闪避穿过、离开波面，或格挡减伤。击破三个水晶后播放 Victory；生命耗尽播放 Death。角色、目标、生命、体力和特效均可重置。

## 资产与脚本

- `assets/hero.glb`：+Y 向上、+Z 正面，41 根骨骼，包含专业贴图、剑盾和 16 段动画。控制器将模型旋转 180°，对齐 Godot 的 -Z 前方。
- `assets/character.json`：来源、许可、尺寸、动画映射和哈希。
- `scripts/hero_controller.gd`：加速移动、旋转、动画切换、连击与闪避状态、体力和伤害。
- `scripts/arena.gd`：训练场、物理碰撞、冲击波、水晶损伤、特效、镜头、UI 和结算。
- `scripts/smoke_test.gd`：在真实 Godot 中自动回放并检查关键游戏行为。
- `validation/gameplay-report.json`：19 项检查报告。

## 验证范围

已在本机 Godot 4.5.2 headless 完成资产导入和实际游戏逻辑/物理运行验证。覆盖骨骼与动画、落地、行走奔跑、三连击伤害、闪避和无敌帧、格挡、冲击波、胜利、死亡和重置。

这些自动检查不等于原生 GPU 画面的人工验收。不同设备性能、原生窗口中的手感和镜头遮挡仍应在实际游玩中继续检查。没有声称已通过 Unity、移动端或其他引擎验收。

## 许可

角色：Kay Lousberg，KayKit Adventurers Character Pack 1.0，CC0。具体来源和许可随包保存。Godot：MIT，官方许可证在 Windows 试玩包内。原创游戏逻辑和场景脚本在本项目中保留可编辑源代码。
