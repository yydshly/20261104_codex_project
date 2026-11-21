# 游戏角色资产来源与整理

## 作者与许可

本项目新使用的角色、拓扑、UV、贴图、基础骨架与基础动作来自 **Kay Lousberg / KayKit** 的 **Adventurers Character Pack 1.0** 免费档。官方 README 声明完整骨骼、75 段动画与 CC0 许可，允许个人、教育与商业用途，无强制署名。项目仍主动保留作者署名与原许可。

- 官方仓库：https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
- 固定版本：`672074b73ba276876a19e8816ecdc5241817ab47`
- 原始文件：`addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb`
- 本地原始副本：`assets/game/original.glb`
- 原许可：`assets/game/LICENSE-KayKit.txt`
- 官方产品页：https://kaylousberg.itch.io/kaykit-adventurers

没有购买付费 EXTRA / SOURCE 档。`hero.blend` 是从免费 CC0 GLB 导入、整理并保存的可编辑衍生工作文件，不能称为作者原始 SOURCE 档。模型与基础动画没有声称由 AI 原创生成；Codex 负责资产整理、归一化、动作映射、接入游戏控制和验证。

## 本次实际整理

使用 `scripts/prepare-production-hero.mjs`：

1. 保留单手剑、徽章盾、头盔和披风。去掉同时重叠的其他盾、双手剑和副手剑。
2. 保留 16 段游戏可用动作，并重命名为统一控制器命名。原名、时长、循环属性见 `assets/game/character.json`。
3. 将完整角色（含头盔）归一到 1.85 米，保持 +Y 向上、+Z 正面，地面为 0。控制器运行时按 scale=1 使用。
4. 锁定骨架 root 的 X/Z 平移，并去掉闪避髋部起终点的线性 X/Z 漂移。保留垂直起伏、关节动作和姿态内运动，世界位移交给游戏控制器。
5. 剔除未用节点、几何、动画与二进制缓冲，得到内嵌贴图的 942,760 字节 GLB。角色包含 41 个骨骼关节、10 个网格和 5,274 个三角面。

`Dodge` 来自原作者 `Dodge_Forward`，是 0.4 秒前向闪步 / 低身躲闪，**不是翻滚**。世界闪避距离由控制器驱动。

## 游戏动作表

| 控制器名 | 原作者动作 | 时长 / 秒 |
| --- | --- | ---: |
| Idle | Idle | 1.0667 |
| Walk | Walking_A | 1.0667 |
| Run | Running_A | 0.8 |
| Attack1 | 1H_Melee_Attack_Chop | 1.0667 |
| Attack2 | 1H_Melee_Attack_Slice_Diagonal | 1.0 |
| Attack3 | 1H_Melee_Attack_Slice_Horizontal | 1.0667 |
| Block | Blocking | 1.0667 |
| BlockHit | Block_Hit | 1.0667 |
| Hit | Hit_A | 0.6667 |
| Death | Death_A | 0.8 |
| Dodge | Dodge_Forward | 0.4 |
| DodgeBack | Dodge_Backward | 0.4 |
| Victory | Cheer | 1.6667 |
| JumpStart | Jump_Start | 0.6 |
| JumpIdle | Jump_Idle | 1.0667 |
| JumpLand | Jump_Land | 0.6667 |

右手挂点为 `handslot.r`，左手挂点为 `handslot.l`。剑和盾已正确随这些骨骼挂接，运行时无需重新摆放道具。

## 验证与交付

`scripts/export-production-hero.py` 已实际通过 Blender 4.5.14 LTS 导入整理后的 GLB，评估 12 段主要动作，并保存 `hero.blend`、导出带动画和内嵌贴图的 `hero.fbx`。另实际渲染了待机、跑步、攻击的预览图片，目视核对纹理、装备和角色形状。

FBX 再次导入 Blender 验证通过：识别 41 根骨骼、16 个动作，贴图为内嵌。FBX 动作名称在 Blender 再导入后会带 `Rig|Rig|` 前缀（例如 `Rig|Rig|Attack1`）；GLB 维持短名 `Attack1`。引擎导入时应按格式处理名称，不硬编码 FBX 的完整前缀。

- `assets/game/character.json`：比例、动作、挂点、源文件与修改记录。
- `assets/game/blender-import-check.json`：Blender 动作导入与评估结果。
- `assets/game/asset-validation.json`：GLB 数据检查与文件 SHA-256。
- `assets/game/hero-preview.png`、`hero-run-preview.png`、`hero-attack-preview.png`：实际模型渲染。

本文件记录资产整理与 Blender 验证。Godot / 网页运行验证由项目对应交付记录说明。
