# EMBERFALL · 遗迹试炼 / Character Forge Lab 02

当前首页是一个实际可玩的第三人称动作关卡，使用 KayKit 官方 CC0 骑士和专业动作。WASD 移动，Shift 奔跑，J / 左键三连击，空格闪避，F 格挡，右键拖动视角，Esc 暂停，R 重试。击破三座有冲击波反击的水晶即可完成试炼。「观看完整试炼」运行相同游戏逻辑，可随时手动接管。

```powershell
npm run dev
# 或指定预览端口：
node scripts/serve.mjs --host 127.0.0.1 --port 5220 --root dist
npm run verify
npm run package
npm run build
```

可直接运行 [Godot 原生项目](engine/godot/project.godot)，本机启动器为 [play.cmd](engine/godot/play.cmd)。完整交付见 [gameplay.md](docs/gameplay.md)、[引擎交接](docs/engine-handoff.md)和[资产来源](docs/asset-provenance.md)。Godot 4.5.2 的 19 项玩法检查已通过；浏览器核心逻辑有 20 项测试。GLB、FBX、导入整理后的 Blender 工作文件都在 `assets/game`，保留 CC0 许可。

浏览器已实际通关，记录为 19.4 秒、15 次命中、3 次闪避。见 [实玩验收](docs/browser-game-verification.md)与[通关截图](docs/game-victory.jpg)。当前完整工程包在 `deliverables/emberfall-game-ready-kit.zip`。用户物理 Esc 停止了界面控制，原生窗口人工验收和新版移动端实机检查尚未完成。

下面保留初版原理样例说明；原页面已移至 `study.html`。初版程序化骑士不再作为当前游戏的角色。

## 初版机制样例（留档）

一个独立的本地子项目，从 Lucca Cerf 的 AI 角色制作帖子出发，按「原效果 → 技术原理 → 应用价值 → 扩展方向 → 实际演示」展开。

## 运行

无需安装前端依赖，Three.js 0.187.0 和必需的加载器已保存在 `vendor/three`，并附原 MIT 许可。

```powershell
npm run dev
# 默认 http://127.0.0.1:5218
# 也可以明确指定端口：
node scripts/serve.mjs --host 127.0.0.1 --port 5220
```

服务器只允许绑定 127.0.0.1。GLB、脚本和页面均位于本子项目中。原作者视频及缩略图从 X 媒体地址播放，需要外网；载入失败时页面提供原帖入口。本地角色查看器使用本地素材。

## 页面与交互

- 原效果：Lucca Cerf 原帖约 25 秒视频、工具分工和来源。不到 3 小时是作者自述。
- 技术原理：五步交互面板，说明资产分件、工具调用、骨骼权重、动作迭代和导出验证。
- 应用价值：针对修改、复用、交接三个具体环节解释。
- 扩展方向：NPC 批量生成、视频动作捕捉、脚部 IK、Unity 集成，每项附下一次验证方式。
- 实际演示：原创青铜守卫，三个独立动画、暂停与进度、0.5/1/1.5 倍速、骨架、分件、盔甲开关、三种配色、三个视角及拖动缩放。
- 一分钟讲解：四张操作卡联动查看器，依次展示分件、骨骼、慢放行走和挥剑交付。

## 实际资产

`assets/forge-knight.blend`、`assets/forge-knight.glb`、`assets/forge-knight.fbx` 来自本次实际执行的 Blender 4.5.14 LTS Python 脚本。20 根骨骼、51 个网格部件、3,194 个三角面，含 Idle（3 秒）、Walk（1.2 秒）、Slash（2.4 秒）。

未调用 Tripo / Seedance；未建立 Blender MCP 连接；未使用 Rigify。此演示验证「脚本制作 → 骨骼和动画导出 → 浏览器播放」的流程。生成模型的拓扑与蒙皮质量、脚掌锁定和 Unity 导入仍需后续验证。完整接入计划在 [docs/workflow.md](docs/workflow.md)。

## 重建模型

使用现有工作区的便携版 Blender：

```powershell
& '..\.atlas-render-runtime\blender-4.5.14-windows-x64\blender.exe' --background --factory-startup --python scripts/build-character.py
& '..\.atlas-render-runtime\blender-4.5.14-windows-x64\blender.exe' --background --factory-startup --python scripts/render-preview.py
```

角色、装备、材质、骨骼和动画参数均在 `scripts/build-character.py`。分件视图是 GLB 静止绑定姿势的分组展示，不修改下载文件。

## 检查与构建

```powershell
npm run verify
npm run build
```

验证会解析 GLB 二进制，核对骨骼、归一化权重、关节索引、动画时长和变化通道，以及本地素材与目录链接。结果和资产 SHA-256 记录在 `assets/validation-report.json`。构建生成自包含的 `dist` 静态目录；没有发布到公网。

浏览器验证与当前限制见 [docs/verification.md](docs/verification.md)。已保存[展示页首屏](docs/exhibit-desktop.jpg)和[实际角色演示](docs/demo-desktop.jpg)截图。

## 来源

原作者 Lucca Cerf：[X 原帖](https://x.com/luccacerf/status/2120305718939021566)。原视频及缩略图属于原作者，页面保留出处并直接引用原始媒体地址。本项目的青铜守卫是独立制作的程序化角色，不是原帖角色模型。
