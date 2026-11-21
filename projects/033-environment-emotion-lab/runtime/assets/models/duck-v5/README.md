# 真实纹理绿头鸭资产与归属

**Realistic Mallard Duck - Game Ready Asset**，作者 **3Dima**（[作者主页](https://sketchfab.com/Hdjusj)）。

- 原始作品：[Sketchfab 模型页](https://sketchfab.com/3d-models/realistic-mallard-duck-game-ready-asset-dd33cd2e30944a4aae2de1a06a828f4f)。
- 许可：[Creative Commons Attribution 4.0 International / CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。允许使用、修改与再分发；需要保留作者、来源、许可链接及修改说明，不表示作者认可本项目。
- 核验日期：2026-11-12。官方 Sketchfab `/v3/models/dd33cd2e30944a4aae2de1a06a828f4f` 元数据快照在同目录；其中许可明确为 CC BY 4.0。
- 实际下载来源：[crisleyhguimaraes/space-ship 的公开 CC-BY 转载](https://github.com/crisleyhguimaraes/space-ship/blob/main/public/models/duck.glb)。[该仓库的作者归属](https://github.com/crisleyhguimaraes/space-ship/blob/main/docs/ASSETS.md) 和 GLB 内嵌 `asset.extras` 均指向上述原作者、原作品与同一许可。
- 下载的 Git blob SHA：`5ffde9f47ca8a5e0cb186494400dd78ec25fcab7`。
- 文件 SHA-256：`eba344f92bf3c699bfc5441400b826ee458a5ac85970cf91e1487c56b326eecb`。

## 实测规格

| 文件/项目 | 内容 |
| --- | --- |
| `mallard-3dima-ccby.glb` | 公开转载文件原样保留，300,480 字节 |
| `mallard-preview.glb` | 为通用浏览器与 Blender 解压后的资产，2,551,640 字节；实时场景使用此文件 |
| 网格 | 1 个，8,439 三角面 |
| 材质 | 1 个，底色纹理；无独立法线或粗糙度纹理 |
| 纹理 | 1 张 1024 × 1024；原文件为内嵌 WebP，准备版无损转为 PNG |
| 骨骼 / 原生动画 | 0 / 0；这是静态模型，不能将它描述为已有绑定与动画 |
| 原作官方页 | 12,128 三角面；本地转载版本已由转载方精简与压缩 |
| 场景尺寸 | 运行时总长 0.75 米、宽 0.30 米，脚和下腹浸入水面 |

本项目对转载文件只解压 Meshopt、将量化属性转为浮点、将 WebP 无损转为 PNG，保留网格和 UV。运行时归一尺寸和朝向，并以连续权重实现幅度有限的头颈转动和喙响应。原作者未提供这些动作；它们由本项目补充。此文件没有摄影级法线细节，近距离特写仍受到 1K 纹理与精简网格限制。

## 2026-11-15 喙动作修复

原 GLB 文件保持不变。运行时将原网格按下喙区域与嘴缝切分，插值保留源 UV 和法线；下喙独立转动，增加两片简化的深色口腔内侧面。头颈继续使用连续权重。动作由实际 `quack` 事件触发，并参考当前 0.59 秒鸭叫录音的响度包络，结束后闭合；环境动态暂停时，主动呼唤仍有短暂开合反馈。

源文件仍是 1 个静态网格、8,439 三角面，运行时显示为主体、下喙和两片内侧面。原作者没有提供此绑定或动画；本项目的分割、内侧面和行为属于修改内容，复用时保留本说明。

## 视觉核验

本机 Blender 4.5.14 LTS 已实际导入并用 Cycles 渲染：

- `preview-quarter.png`
- `preview-side.png`
- `preview-rear.png`

运行时只加载 3D 资产；这些静态渲染是资产检查图，不参与池塘画面。渲染脚本是本项目编写的 `preview_model.py`，运行时使用 `--factory-startup --disable-autoexec`。没有执行下载素材中的脚本。

## 其他候选的下载状态

官方免费模型 `Duck_Walk (Free)`，作者 Nyilonelycompany，[原作页面](https://sketchfab.com/3d-models/duck-walk-free-415584bc3224484fba20a482592e2157)，CC BY 4.0，20,828 三角面、2 张纹理、1 段动画。官方元数据已保存，但没有下载其模型文件。

上述两只鸭子的 Sketchfab 官方 `/download` 接口均实测返回 `401 Authentication credentials were not provided`。未绕过登录，也没有购买。当前采用的是许可允许再分发且具备完整归属的公开绿头鸭转载。

## 网页使用时的署名

推荐保留以下署名及链接：

> Duck model: “Realistic Mallard Duck - Game Ready Asset” by 3Dima, CC BY 4.0. Model optimized by the source mirror; format preparation and gentle interactive deformation by this project.

应链接原作页面和 CC BY 4.0 许可，不应仅链接转载仓库。
