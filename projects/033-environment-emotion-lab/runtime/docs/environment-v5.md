# 池塘 v5：真实植被与扫描岸石

v5 使用公开授权的制作资产替换 v4 程序树、程序叶面、几何球石。入口为 `pond-environment-v5.js`，旧 `pond-environment-3d.js` 保留。接口是 `{ group, ready, stats, update, dispose }`；`ready` 在模型解码、材质配置与实例化完成后 resolve，资源载入失败时携带资产名字 reject。

## 官方资产

来源均为 [Poly Haven](https://polyhaven.com/)，许可均为 [CC0 1.0](https://polyhaven.com/license)。下载的是官方 Blender 源文件与 1K 扫描图，而不是第三方重新上传的模型。

| 资产 | 参与绘制的三角面 | 内容 | 来源 |
| --- | ---: | --- | --- |
| Island Tree 01 near | 39,391 | 树干和枝条；旧稀疏叶层不绘制 | [官方页面](https://polyhaven.com/a/island_tree_01) |
| Island Tree 01 far | 12,176 | 同源远景树干枝条，共享 near 材质 | 同上 |
| Island Tree 01 canopy | 113,670 | 保留全部 44,168 片原叶，近远树共用 | 同上 |
| Island Tree 02 near | 35,647 | 树干和枝条；旧稀疏叶层不绘制 | [官方页面](https://polyhaven.com/a/island_tree_02) |
| Island Tree 02 far | 11,999 | 同源远景树干枝条，共享 near 材质 | 同上 |
| Island Tree 02 canopy | 77,586 | 保留全部 29,781 片原叶，近远树共用 | 同上 |
| Fern 02 | 6,232 合计 | 4 株有锯齿和透明叶隙的蕨草 | [官方页面](https://polyhaven.com/a/fern_02) |
| Rock Moss Set 01 | 63,127 合计 | 6 块不同轮廓的扫描苔藓石 | [官方页面](https://polyhaven.com/a/rock_moss_set_01) |
| Shrub 03 | 8,287 合计 | 4 株林下植物 | [官方页面](https://polyhaven.com/a/shrub_03) |
| Shrub 02 | 27,254 合计 | 4 株真实米制的较高灌木 | [官方页面](https://polyhaven.com/a/shrub_02) |

运行资产在 `assets/models/environment-v5/runtime/`，10 个 GLB 合计 **95,312,168 字节（95.31 MB）**；far 与 canopy GLB 不重复打包纹理。原始来源、官方 MD5、本地 SHA-256 在上一级的 `sources.json`、`sources-shrub02.json`；运行文件字节数、哈希、顶点/三角面、材质、alpha 和布局快照在 `runtime/manifest.json`。原始 `.blend` 只作为可追溯制作源保存，网页不加载它们。

旧 near/far 容器内仍保留最初的稀疏叶几何，以维持原材质和贴图依赖；场景会过滤这些叶网格，**只实例化新的完整冠层，不会双重绘制**。当前包大小包含这部分未绘制数据；后续可离线重打包进一步减小下载量，无需牺牲叶片密度。

## 制作与实时表现

- 本机 Blender 4.5.9，通过 `--background --factory-startup --disable-autoexec` 读取官方源。树干枝条从官方 LOD1 减面；冠层单独识别每片连通叶面，以原 UV→3D 拟合成 2/4 三角面卡，逐片保留位置、方向和扫描轮廓。最终 GLB 连通分量为 44,168 与 29,781，和原叶数量完全一致；不再使用会大面积删叶的全冠层统一减面。
- 官方 glTF 下载包引用 JPEG，部分 Blender 旧材质节点导出后 alpha 也会变为全白。此次重新连接标准 PBR 与源 alpha 图，并验证运行 GLB 内 PNG 的 alpha 实际覆盖 0–255；不以 `alphaMode` 标签存在代替透明图验证。
- 合并 alpha 时进一步修正了颜色编码：`pack-source-foliage-alpha.py` 保留官方源 RGB 像素，只打包源 alpha，逐像素一致性记录在 `color-packing.json`。两树树干/枝条和扫描石的 5 张不透明 diffuse 也与官方原图逐像素、文件哈希一致。
- 叶片、蕨草与灌木采用 `alphaTest=.42`、`alphaToCoverage` 与双面材质。阴影材质复用相同贴图、alpha 阈值和风动顶点计算。
- 叶片的薄透光按叶面背向太阳、视线方向和天光计算，在 PBR 反射光累计阶段加入，并随昼夜衰减，不使用全局自发光掩盖背面发黑。
- 当前布局为 3 棵近树、12 棵背景树、6 棵幼树、360 株蕨草、71 株灌木、18 块扫描石。背景树与幼树关闭动态投影；相同模型几何和材质以 InstancedMesh 复用。中间后冠线移到 z≈-12，并降低到 5.2–6.2 米，衔接成片的林下植物。
- 原地形接口继续对应半径 5.5 / 3.8 的水域，局部泥岸伸入水面，扫描石分散成少量半淹小组。近景保留看向池水的通道，蕨草高度约 0.33–0.68 米；不沿圆周均匀摆放岸石。
- 木屋保留此前木板、瓦片、玻璃和窗光细节，移至远侧 `(6.4, -8.3)`，成为尺度线索。主画面由水、石、真实植被形成。
- 所有模型保持扫描原色，不整体染灰绿。地面使用官方 [Mud Forest](https://polyhaven.com/a/mud_forest) 深棕湿泥 PBR，按实测 2.3 米尺度铺设；来源在 `assets/materials/sources-v5-ground.json`。树根扫描底裙埋入土壤，植物使用精确顶点包围盒接地。

## 工具与验证

制作脚本：`fetch-environment-models.py`、`export-environment-models.py`、`pack-source-foliage-alpha.py`、`export-tree-leaf-cards.py`、`validate-environment-glb.py`，位于 `scripts/`。`build-environment-v5.py` 仅记录最初从旧模块提取木屋的迁移过程，不应重新运行覆盖后续视觉调整。

`node --check pond-environment-v5.js` 通过。10 个真实 GLB 的 Node 整合解析通过（纹理解码使用桩）：56 个 Mesh，854 个实例，3,412,886 个展开三角面；全部顶点与变换有限，22 个风动深度批次的 alpha 贴图及阈值一致。树叶绘制批次只有 113,670 / 77,586 三角面的新冠层，旧 65,000 / 18,000 叶层绘制数为 0。更新、销毁通过，并清理加载失败或卸载后的 ImageBitmap。

此结构统计不含水面反射、阴影与后期的重复 pass，不能当成实际每帧 GPU 三角面或 draw call。整合后的浏览器已确认冠层 GPU 无错误，最终构图、昼夜、移动端及帧率记录由主场景验收文档提供。
