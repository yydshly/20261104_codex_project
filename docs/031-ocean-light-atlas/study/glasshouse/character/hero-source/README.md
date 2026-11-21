# 静态人物的成熟人体源资产

本目录只包含从 MakeHuman / MPFB 官方取得的源输入、来源清单和少量下载元数据，不是用户人物的扫描或精确身份模型。原型仍需通过具体造型制作与网页成图检验。

## 当前可用

- `base.obj`：MakeHuman HM08 成熟人体拓扑，含 UV、body 与 helper 分组。原始 Y 向上、X 左右、Z 向前。OBJ 共有 19,158 个顶点；应用 target 时应保留原始顶点索引，之后再按 `g body` 保留人体表面，不能把 helper 作为皮肤导出。
- `asian-male-young.target.gz`：按 0 基顶点索引给出的 XYZ 位移。叠加到 base 后是年轻男性基础形状，不代表已符合用户原型。
- `caucasian-male-young.target.gz`：可选对照。`universal-male-young-averagemuscle-averageweight.target.gz` 是空白恒等目标，不添加形变。
- `targets/`：官方头脸、颊部、下颌、颈部和微笑目标，供小权重精修。权重需要看实际成图决定。
- `high-poly.obj`、`high-poly.mhclo`、`brown_eye.png`、`brown.mhmat`：官方匹配人体的眼球几何、配准和棕色虹膜。用 mhclo 的人体三角顶点插值与 offset 配准，不靠一个任意球体替代眼球。
- `rig.*.json`、`weights.*.json`：官方标准骨架与权重，可用于自然静态姿态；此阶段不扩展动作。
- `official-system/skins/young_asian_male/`：官方 UV 匹配的 2048×2048 RGB 皮肤贴图。
- `official-system/hair/short01/`：短黑发，前发稍上梳，含 OBJ、配准和 RGBA 贴图；`short04/` 为备用。
- `official-system/teeth/teeth_base/`：牙齿及匹配贴图。
- `official-system/clothes/toigo_wool_pants/`：独立灰色直筒长裤，作者 MargaretToigo（源文件署名 MRT），来自官方 `pants01` CC0 资产包。含 `pants_wool.obj`、对应 mhclo、灰色布料贴图和材质；1,372 个顶点、1,337 个面，带 UV。它是完整裤装网格，不是从裸身提取的表面壳，也不包含上衣。

转换到 Blender Z 向上、前向 -Y，可先在原始空间应用所有形变，然后映射 `(x,y,z)` → `(x,-z,y)`，再按目标身高归一并落地。基础 Asian male 的 body 原始 Y 范围约为 -8.1877 到 8.0953，比例约为 16.283 原始单位；最终按实际表面重新测量，不能直接用含 helper 的总边界决定人物身高。

## 来源与许可证

MakeHuman 官方资产声明：<https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md>。其中 base mesh、targets、纹理、衣服和 poses 明确为 CC0 1.0；程序代码另为 AGPL，不能混同。

- Base、宏目标、局部目标、骨骼数据：<https://github.com/makehumancommunity/mpfb2/tree/master/src/mpfb/data>
- 眼球与虹膜：<https://github.com/makehumancommunity/makehuman/tree/master/makehuman/data/eyes>
- 系统资产及逐项 CC0 表：<https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html>
- 独立裤装 CC0 表：<https://static.makehumancommunity.org/assets/assetpacks/pants01.html>；下载与 SHA-256 另见 `official-pants-manifest.json`。
- 官方系统包主站 DNS 无法解析后，使用该页面列明的 secondary mirror。`fetch-system-assets.py` 用 HTTP Range 只下载指定文件，没有下载整个 267 MB 压缩包，更没有上传用户图片。

准确源 URL、文件大小与 SHA-256 见 `SOURCES.json` 及 `official-system-manifest.json`。`download_assets_git.py` 仅为读过的官方路径定位参考（AGPL 代码），本项目没有执行它，也不将它当作 CC0 人物素材。
