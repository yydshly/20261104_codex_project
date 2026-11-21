# Emberfall 游戏资源交接

本包包含可运行的网页源代码、原工作流说明页、游戏角色资源、可编辑的 Godot 工程、验证脚本与测试，以及资源许可。它是源码与资源交接包，不包含 Godot 编辑器、官方运行时可执行文件或发布模板。

## 网页运行

解压后进入 `emberfall-game-ready-kit`，使用 Node.js 运行：

```powershell
npm run dev
```

按终端显示的本机 URL 打开网页。前端库已放在 `vendor`，不需要重新下载依赖。`play.html` 为试玩入口，`study.html` 保留原工作流说明。

## 角色资源与许可

模型、贴图、基础骨架和基础动画来自 **Kay Lousberg / KayKit Adventurers Character Pack 1.0** 免费档，采用 **CC0-1.0**，允许个人与商业项目使用。Codex 负责整理和游戏集成，没有将这些专业资产声称为 AI 原创。

| 文件 | 用途 |
| --- | --- |
| `assets/game/hero.glb` | 网页与 Godot 共用的角色，贴图已内嵌，含 16 段动画 |
| `assets/game/hero.fbx` | 供支持 FBX 的工具和引擎导入；Blender 再导入已验证，Unity 尚未验收 |
| `assets/game/hero.blend` | 从免费 GLB 导入整理后保存的可编辑衍生工作文件，**不是作者付费 SOURCE 档** |
| `assets/game/original.glb` | 官方原始免费角色副本，保留完整动画与装备供追溯 |
| `assets/game/character.json` | 来源、归一化尺寸、骨骼挂点、动作原名与映射 |
| `assets/game/LICENSE-KayKit.txt` | 随资产保留的原许可 |

完整来源与修改记录见 `docs/asset-provenance.md`。资产验证及哈希见 `assets/game/asset-validation.json`。

## Godot 复用

1. 使用已安装的 **Godot 4.5+** 打开 `engine/godot/project.godot`。首次打开会重新生成 `.godot` 导入缓存，缓存没有放入交接包。
2. 直接运行工程主场景 `main.tscn`。完整操作和场景说明见 `engine/godot/README.md`。
3. 复用角色时，把 `engine/godot/assets/hero.glb`、`character.json` 和许可复制到目标工程。该 GLB 与网页角色逐字节一致。
4. 角色源坐标为 **+Y 向上、+Z 正面、总高 1.85 米、地面为 0、scale=1**。已有 Godot 控制器在模型层做了 180° 朝向适配，以配合 Godot 的 -Z 前方；复制到自己的控制器时避免重复旋转。
5. 需要的核心动作是 `Idle`、`Walk`、`Run`、`Attack1/2/3`、`Block`、`BlockHit`、`Hit`、`Death`、`Dodge`、`Victory`。剑和盾已附到 `handslot.r` / `handslot.l`，无需重新摆放。
6. 动画已整理为原地动作，世界移动交给角色控制器。`Dodge` 是 0.4 秒闪步 / 躲闪，**不是翻滚**。如果改成 Root Motion，应同步调整位移逻辑，避免角色双重移动。

Godot 自带入口脚本若提示找不到运行时，请直接从已安装的编辑器打开 `project.godot`，或按 `engine/godot/README.md` 指定本机 Godot。包内没有下载工具目录。

## 包结构核对

压缩包中 `PACKAGE-CONTENTS.json` 记录各文件大小及 SHA-256。打包脚本还会核对网页入口、本地页面引用、角色骨骼与动作，以及网页和 Godot 角色文件一致性。ZIP 创建后会执行 CRC 校验。

`tests` 与 `scripts` 一并包含在包中，`package.json` 中本地验证命令所依赖的脚本路径也会自动检查。解压后可以运行 `npm run verify` 复查游戏规则和资源结构。

页面中的 `deliverables/emberfall-game-ready-kit.zip` 下载链接指向本生成产物，压缩包不会递归包含自身。清单明确标为 `SELF_ARCHIVE_NOT_NESTED`；解压后运行下面的打包命令即可重新生成这个下载链接对应的 ZIP。其余本地页面引用均须包含在交接包中。

```powershell
# 只核对结构，不生成 ZIP：
node scripts/package-game.mjs --check
# 生成 deliverables/emberfall-game-ready-kit.zip：
node scripts/package-game.mjs
```

打包白名单排除了构建副本 `dist`、`tools`、`node_modules`、`.godot` 与 `userdata` / `editor_data` 缓存、下载源目录、旧压缩包、日志和 Blender 自动版本备份。验证 JSON 会保留。它不会递归清理任何目录。
