# 静态人物候选：尚未适配原型

当前原型目标仍是用户提供的短发、圆框眼镜、深蓝套头卫衣、灰裤和白鞋。2.5 现有稿已被用户否定；本目录中的成品角色仅作实际网页中的质量和适配路线比较，不是本人形象的最终还原。

## 实际接入的成品资产

- `male_adult_10.glb`：Microsoft / Rocketbox，Male Adult 10，原始红色运动夹克。用于比较头发、成人比例和服装完成度；面貌、发型、服装均未适配原型。
- `male_adult_17.glb`：Microsoft / Rocketbox，Male Adult 17，原始蓝白连帽上衣。用于比较帽子、肩袖、衣身与褶皱；面貌、拉链、配色与原型不同。

源库：https://github.com/microsoft/Microsoft-Rocketbox 。MIT许可全文保留于 `LICENSE-Rocketbox.txt`；下载URL、文件长度和SHA-256在 `rocketbox-downloads.json`。作者原始FBX及贴图保留于 `rocketbox/Male_Adult_10` 与 `Male_Adult_17`。

`../../character/prepare-hero-candidates.py` 使用原作者模型和80骨骼，将手臂调整为静态站姿、重新链接作者漫反射/法线贴图并归一到1.78米。材质粗糙度是本项目近似值，不称为完整扫描PBR。无新增动作或换装。GLB字节与哈希、实际骨架数见 `prepared-candidates.json`，Blender导入记录见 `rocketbox/blender-source-inspection.json`。

在实际浏览器分别检查了露台与中性光。成品的衣服结构和纹理有可用的比较价值，但仍有早期游戏资产的风格与面部质感局限；不能仅因有成品模型、贴图和骨架就认定达到原型品质。下一步需要按原型评估专用角色美术制作，不能将两个人的脸和衣服直接拼接当作完成。

## 筛选中未采用的资料

- Ready Player Me / Visage：仅核查公开源码目录与MIT许可；README所指男性示例返回404，未取得或接入对应男性角色。`LICENSE-Visage.txt` 不代表取得了某个未下载模型的许可。
- dmitryzinatulin《Man in Hoodie》：https://sketchfab.com/3d-models/man-in-hoodie-35659cad051247e4b66f5c4d1ca13ea8 ，CC BY 4.0；本目录只有公开元数据与作者预览图，未下载或接入3D文件。
- shadowdarkdemon2《Stylized 3D Character》：https://sketchfab.com/3d-models/free-3d-stylized-3d-character-ee033db06c434142b32111239492a64d ，CC BY 4.0；只有公开元数据与作者预览图。作者注明无骨架，涂鸦服装也不匹配原型，未接入。

用户原型图未上传至任何外部生成服务。本轮没有购买素材，没有把外部人物的面貌当作用户本人还原，没有用平面人物贴片替代三维模型。
