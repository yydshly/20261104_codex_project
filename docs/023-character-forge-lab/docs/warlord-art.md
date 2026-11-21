# 赤霄 / CHIXIAO：V5 角色美术

V5 将脸部与护甲作为可见造型重新加工。角色继续采用成年重甲战戟战士的方向，使用原创暗钢叠甲、黄铜护边、红色披风和不对称战戟。基础人体与通用动作来自 Quaternius 的 CC0 资源，角色造型、装备、纹样及动作加工在本项目完成。

## 本轮实际美术变化

- **脸部雕形**：在现有蒙皮头部上定向调整眉骨、颧骨、鼻翼、鼻梁、下颌与颈部体块，保留成年人体比例。重新绘制皮肤颜色、眼窝与颌部的克制色差、闭口及细微粗糙度；保留收窄眼睑内的虹膜。颈部肤色边界下移到衣领内，修正原来的锯齿色块边。
- **肩甲**：替换原来的圆球形肩罩，重新制作有外展尖缘的曲面冠板、错层叠甲、薄金属包边和铆接点。原创兽面浮雕放在独立嵌板上，让眉、眼、鼻与颊部纹样具有实际几何层次。
- **腿甲与靴**：球形膝甲改为有中脊的尖形护膝，胫甲沿小腿体块收束；方块靴改为完整封闭皮靴内胆与五段重叠的弧形足甲，封闭趾尖和鞋底。
- **战戟**：重做主刃、反钩和枪尖的截面，区分平整刃面、薄磨削带与刃脊。重绘现有刃面颜色、金属粗糙度和细法线，减少粗网纹、圆管式刃口和发光玩具感。
- **材质**：延续现有 PBR 贴图集合，主护甲、金属、红布和皮肤使用实际图像贴图。V5 重绘现有皮肤及刃面图像，没有用新增贴图数量替代造型加工。暗钢、黄铜、抛光刃口、织物及皮肤保留不同的反射和粗糙度关系。

这些修改写入真实网格与材质数据，并保留现有蒙皮。制作阶段的 3/4、正面和脸部近景经过 Blender 实际渲染目检；这些工作预览与实际浏览器战斗画面分别标注。

## 骨骼、动作与挂点合同

角色维持 **100 根骨骼、13 个动作**：原人体与武器 70 根、披风 20 根、两条丝缨共 10 根。V5 造型阶段保留披风、丝缨及既有动作数据，后续动作校正继续在同一骨架上串联。

GLB 以 **+Z 朝前、+Y 朝上**；Blender 使用原生 Z 轴向上，导出器负责坐标转换。`CrimsonWarlord_Rig` 承载人体、护甲、布料和武器；`Halberd_Control` 控制同一根刚性戟柄，`HalberdGrip` 与 `HalberdTip` 用于武器挂载和真实轨迹采样。运行时无需 Blender IK 约束。

| 动作 | 时长（秒） | 接触或事件 |
| --- | ---: | --- |
| Idle | 2.00 | 循环 |
| Walk | 1.10 | 循环 |
| Run | 0.80 | 循环 |
| Attack1 | 0.72 | 0.23 秒命中 |
| Attack2 | 0.82 | 0.30 秒命中 |
| Attack3 | 1.00 | 0.40 秒命中 |
| Sweep | 1.08 | 0.42 秒命中 |
| Guard | 0.32 | 护身姿态 |
| LeapSlam | 1.28 | 0.18 秒起跳，0.92 秒落地 |
| Hit | 0.55 | 受击 |
| Death | 1.20 | 倒地与终止姿态 |
| Dodge | 0.40 | 闪避 |
| Victory | 1.60 | 收戟庆祝 |

动作时序继续与玩法规则对齐。游戏控制角色的世界位移、闪避距离和跳跃弧线；动画提供局部蓄势、腰胯发力、落地压身和收势，避免重复叠加 root 位移。

## 制作与验证文件

- 运行与编辑资产：`assets/warlord/warlord.glb`、`warlord.blend`、`metadata.json`。
- V5 造型脚本：`scripts/sculpt-warlord-v5.py`；渲染脚本：`scripts/render-warlord-v5-art.py`。
- 本机造型中间工程：`assets/warlord-v5/art.blend`；阶段报告：`art-report.json`。
- 造型工作预览：`assets/warlord-v5/art-three-quarter.png`、`art-front.png`、`art-face.png`。
- 动作与布料校正：`scripts/motion-warlord-v5.py`；最终逐帧几何检查见 `assets/warlord/collision.json`，材质补丁和关键帧保真报告也保存在该目录。

`art-report.json` 确认 V5 造型阶段保留 100 骨、13 动作和输入工程的图像总数。中间工程的网格对象数量不代表最终运行网格或绘制调用数量，运行资产合并、LOD 与性能结果应以最终验收为准。

## 来源与许可

- 人体：Quaternius [Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html)，Standard Free 中的 `Superhero_Male_FullBody.gltf`。
- 移动与受击动作：Quaternius [Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html)。
- 重击、格挡等动作来源：Quaternius [Universal Animation Library 2](https://quaternius.com/packs/universalanimationlibrary2.html)。
- 来源包附有 CC0 1.0 许可，原许可保存为 `LICENSE-BASE.txt`、`LICENSE-UAL1.txt`、`LICENSE-UAL2.txt`。
- 护甲、兽面纹样、战戟、披风、配色、辅助骨、双手武器编排与本轮雕形/贴图加工属于本项目的原创制作。未导入《王者荣耀》的角色模型、贴图、动作或音效文件，也未使用付费来源包。

来源压缩包仅在当前本地工作区保留，不随运行目录重复分发。解压工程后如需从最早基体重建，请从上述官方链接另行下载 Standard Free 包，并按基础构建脚本的路径放入 `assets/warlord/source`。直接运行或编辑已交付 GLB / blend 不需要重新下载来源包。

## 验收边界

赤霄是一个原创、风格化的独立游戏角色。吕布式重甲战士的轮廓、重武器气质和技能分工是参考方向；当前成果没有等同于商业吕布英雄经过专业团队手工雕刻、专属拓扑、绘制贴图、布料模拟与面部表演打磨后的品质。

本轮已经真实改变脸部、装备截面、材质和动作数据。最终质量以目标镜头中的实际战斗画面判断；贴图、骨骼或面数本身不能证明成品品质。更完整的动作/碰撞边界见[精修记录](warlord-refinement.md)，运行画面见[浏览器验收](warlord-browser-verification.md)。

<!-- V5_RUNTIME_DATA_START -->
最终运行 GLB 为19.07MB（十进制），100骨/13动作，28mesh、29primitive、266728三角面；几何LOD1/LOD2分别97638/43299面，合计另10.33MB。五主材质颜色1024²、法线和ORM512²，HeroSkin粗糙度已在真实GLB验证。最终SHA为`1f3fc19564ebfd7bf1ae8e9c27ed9f3e041c55bfde18f1c43f35e4bab2ea7838`。

13动作/1300帧布料几何检查和全部3900动作通道保真通过；运行时胶囊近似不代表任意混合姿态严格无穿插。末轮120秒连战14胜/0错误，平均50.9 FPS，未出现>100ms停顿；首轮为73.2 FPS并有卡顿，完整结果与限制见[浏览器验收](warlord-browser-verification.md)。

[实际连招录像](chixiao-v5-combat.mp4)同时展示近景和战斗；[Godot源码包全新导入证据](../engine/warlord/validation/sourcekit-fresh-import.json)核对59项原生检查、25张重建纹理、骨骼动作及代码指纹。
<!-- V5_RUNTIME_DATA_END -->
