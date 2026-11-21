# 角色工坊：接入与验收

本项目先展示 Lucca Cerf 的原帖效果，再解释技术原理、应用价值、扩展方向，最后操作一个独立的本地角色。

## 已经完成的实际演示

Codex 编写 `scripts/build-character.py`，调用现有的 Blender 4.5.14 LTS，创建原创骑士、20 根骨骼、显式顶点权重、Idle / Walk / Slash 三段动画，并导出可编辑的 `.blend`、带动画的 `.glb` 和 `.fbx`。浏览器使用 Three.js 加载 GLB，可切换动画、慢放、拖动进度、显示骨架、拆分装备、切换配色和视角。

这次没有调用 Tripo 或 Seedance，也没有建立 Blender MCP 连接；实际执行使用 Blender 后台 Python 脚本。骨架为自定义骨架，未使用 Rigify。装甲采用分段刚性权重，不能作为复杂人体自动蒙皮质量的证明。Walk 是原地循环，仍需脚掌锁定和 Root Motion 的进一步打磨。FBX 已导出，尚未在 Unity 验证。

## 下一轮如何接入原帖工具

1. Codex：保留现有客户端，通过 MCP 使用 Blender 工具。
2. Blender：现有工作区的 `.atlas-render-runtime/blender-4.5.14-windows-x64/blender.exe` 已实际运行。本项目不需要再次安装 Blender。
3. Blender MCP：按社区项目文档安装并启用插件，再注册到 Codex。先做读取场景、截图、创建和保存测试。

```powershell
uvx mcp-for-blender install-addon
codex mcp add blender -- "C:\Users\yun68\.local\bin\uvx.exe" mcp-for-blender
```

在 Blender 插件设置中启用 MCP for Blender，并启动侧栏服务。默认本机连接是 localhost:9876。重启 Codex 后验证工具可用。生成、复杂绑定和渲染应拆成小任务，必要时调整 Codex 对应 MCP 配置的工具超时。

4. Tripo CLI：Node.js 20+。先确定账号站点，不依据语言猜测账号区域。

```powershell
npm install -g tripo-cli
# 中国站 developers.tripo3d.com：
tripo login --region cn
# 国际站 developers.tripo3d.ai：
tripo login --region ov
# 只运行与账号对应的一条登录命令，完成浏览器授权后：
tripo doctor
```

先生成一个 T-pose / A-pose 人形身体，武器和盔甲单独生成。保留任务 ID、输入参考、生成参数、下载模型和实际积分记录。超时先查已有任务，不直接重复生成。

5. 动作参考：第一轮可以使用已有参考视频。使用 Seedance 时，另配对应服务的 API 授权和模型权限。提交、查询、保存到本地，再放入 Blender 参考平面。视频参考不等于自动动作捕捉。
6. Rigify：对齐骨架，生成控制器，蒙皮到最终骨架。检查无权重顶点、关节折叠和装备穿插，再制作动画。复杂生成模型的网格清理、权重修正是重点验证对象。
7. Unity：导入 FBX，配置 Humanoid Avatar，核对骨骼映射、材质和三个动画片段。检查根节点运动方式、循环接缝、武器挂点、碰撞和目标设备性能。

## 用相同效果做对照

固定角色比例、三个动作、时长和观察视角。把程序化样例替换成 Tripo 生成资产，逐项记录：

| 项目 | 观察或记录 |
| --- | --- |
| 几何资产 | 关节拓扑、断裂片、材质与贴图完整性 |
| 绑定 | 无权重顶点、膝肘弯曲、肩髋变形 |
| 待机 | 呼吸、身体重心、装备是否漂移 |
| 行走 | 脚掌接地、脚滑、循环首尾姿势、Root Motion |
| 挥剑 | 蓄力和击出节拍、手与剑柄的固定关系、盾牌穿模 |
| 交付 | GLB / FBX 动作是否齐全、Unity Avatar 是否有效 |
| 成本 | 每次生成积分、人工修正耗时、失败或返工的原因 |

当前 GLB 静态验证记录保存在 `assets/validation-report.json`。它验证骨骼、权重和动作数据，不替代视觉质量或游戏验收。

## 官方与项目来源

- 原帖：https://x.com/luccacerf/status/2120305718939021566
- Codex MCP：https://learn.chatgpt.com/docs/extend/mcp
- MCP for Blender：https://github.com/ahujasid/mcp-for-blender
- Tripo CLI：https://developers.tripo3d.ai/en/docs/cli
- Blender glTF：https://docs.blender.org/manual/en/4.5/addons/import_export/scene_gltf2.html
- Three.js GLTFLoader：https://threejs.org/docs/pages/GLTFLoader.html
- Three.js AnimationMixer：https://threejs.org/docs/pages/AnimationMixer.html
- Seedance 视频接口：https://docs.byteplus.com/en/docs/modelark/create-video-generation-task-api
- Unity 动画导入：https://docs.unity3d.com/6000.0/Documentation/Manual/ConfiguringtheAvatar.html
