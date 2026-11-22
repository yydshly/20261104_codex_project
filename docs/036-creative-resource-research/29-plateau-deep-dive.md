# 第29条 · PLATEAU 城市模型

## 判断

可以作为小柚的城市片头、转场和口播配画。它提供可反复取景的街区几何，适合中远景。屋顶、钟面、栏杆、绿化等要进入近景时，先确认目标建筑的模型和纹理。首试东京站周边 5 秒缓横移，先让三维直渲染成立，再考虑生成式润色。

## 数据从哪里来

- @tanglele0318 原帖只说没看见京都，引用 @bei351009016 的分块介绍。该介绍附的 30 秒视频由 An Xuan 发布。公开发布帖与引用附件的视频 ID 相同。
- 日本国土交通省推动的 Project PLATEAU 按城市及年份发布标准 CityGML。随数据可查地物几何与属性。常用图层包括建筑、道路、地形，具体版本还可能有桥梁、水系、植被和土地利用。官方也配送 3D Tiles 和 MVT。
- CodePawl 用五个城市的 2020 年官方 OBJ 再整理，按约 1.1×0.9 公里网格分块。固定版索引共有东京23区671、大阪36、横滨23、名古屋35、札幌32，合计797；东京外四城主要是中心区。京都没有进入这套包，但在官方目录可选，官方链接指向京都市 2025 年度数据。

[原帖](https://x.com/tanglele0318/status/2119078444268982627) · [原视频帖](https://x.com/anxuanng/status/2118780114913927353) · [CodePawl 数据说明](https://huggingface.co/datasets/codepawl/plateau-city-glb) · [官方开放目录](https://www.mlit.go.jp/plateau/open-data/)

## 现场看到了什么

原片前段从楼群切到街区全景。中段贴近高楼时，可见真实比例轮廓、较软的立面和空白体块。后段俯视显出路网，拉远可见河道和数据覆盖边缘。浏览器实测切到东京自由相机，再切大阪，各自能加载附近 GLB。适合远景的楼群布局和近景细节的差距可直接看到。

| 候选地点 | 固定版工程档 | 平面坐标系 | 网页实看 |
| --- | --- | --- | --- |
| 东京站周边 | 53394611，11.6 MB | EPSG:6677 | 较密楼群与部分贴图立面 |
| 大阪城周边 | 52350422，2.49 MB | EPSG:6674 | 地形、道路和较简化的体块 |

候选块由地点近似坐标落入块范围得到。块内有贴图只说明部分数据带纹理。仍需对要拍的地标逐栋确认，特别是块边界与跨块遮挡。 [固定版索引](https://huggingface.co/datasets/codepawl/plateau-city-glb/raw/881710936a18413a4070e618abbb0b813d1fc30a/tiles.json) · [东京站候选模型](https://huggingface.co/datasets/codepawl/plateau-city-glb/blob/881710936a18413a4070e618abbb0b813d1fc30a/engine/tokyo-53394611/tokyo-53394611.glb) · [大阪城候选模型](https://huggingface.co/datasets/codepawl/plateau-city-glb/blob/881710936a18413a4070e618abbb0b813d1fc30a/engine/osaka-52350422/osaka-52350422.glb)

## 怎样接入航拍

1. 用官方目录或包内 `tiles.json` 确定城市、数据年度、网格、地物和可用 LOD。官方建筑 LOD1 多是简化体块。LOD2 可能区分屋顶和墙面，有来源时带贴图。CodePawl 的 `lods/` 则是网页距离减面档。
2. Blender 试用 `engine/` GLB。第三方文档该档未用 meshopt 或量化。网页用 `objects/` 时需要 meshopt 解码；KTX2 版本配相应加载器。原始 CityGML 可按官方指南转换，也可选择合适的已转换档。
3. 拼块时保留同城原点和 `offset_m`。GLB 本地米制坐标为 X 东、Y 上、Z 南。Blender 的 Z 向上，所以先核对导入轴的单位和方向，再把偏移变成目标坐标。只加镜头能看到的邻块。保存机位、朝向、焦距、运动与太阳位置。
4. 先渲染中远景，再看需求决定要不要生成。第20条的大阪城作者说用 Blender 静帧交 Muse 视频。Zimo 的东京站步骤更细，先取约一公里分块，换到正面出底稿，经 Muse Image 改写静帧后用 Muse Video。报告出现钟面增加。两位作者使用的数据版本和是否取自本包仍待确认。
5. 接小柚时，校人脸光向与城市阴影、视平线、焦距感和运动视差。背景灯光和颜色可换，路网、地标外形和相邻街区连续性要复看。保留官方与 CodePawl 来源、年份、处理说明及叠加素材许可。生成式渲染可明确标为三维或 AI 画面。

[官方 Blender 教程](https://www.mlit.go.jp/plateau/learning/tpc08-1/) · [官方场景教程](https://www.mlit.go.jp/plateau/learning/tpc26-2/) · [第20条研究](./index.html#20) · [Zimo 过程文](https://note.com/zimo/n/n31d8d20c0b69) · [PLATEAU 署名规则](https://www.mlit.go.jp/plateau/site-policy/)

## 验证范围

已核对原片 7 帧、分块索引和两项浏览器 GLB 预览。未用本机 Blender 导入或出片。小柚方案可从下列验收卡接着做。 [小柚城市背景 5 秒试验卡](experiments/29-plateau/xiaoyou-city-background-trial.md) · [取样和版本记录](references/29-plateau/evidence.json)
