# 17｜2.5D与相机原理：官方资料核对摘要

核对日期：2026-11-22。以下资料解释可选方法，不证明作者用了这些具体实现。Three.js与W3C正文可读；Blender5.0条目核对官方搜索摘要，正文直读返回402。W3C页面为工作草案，本文只提炼透视/平面概念。

- [Three.js Cameras](https://threejs.org/manual/pages/cameras.html)：透视相机使近物显得较大；FOV、画幅比例与裁剪范围影响可见区域。near/far是裁剪范围，不是从图片估出的真实景深或几何。
- [Three.js Creating a scene](https://threejs.org/manual/pages/creating-a-scene.html)：场景、相机和渲染器都需要；2.5D不等于不需要计算或渲染，只是可减少完整模型的工作。
- [Blender5.0 Mesh Plane](https://docs.blender.org/manual/en/5.0/modeling/meshes/import_images_as_planes.html)：可把图片作为纹理放在平面上，多图可分别成平面；图片平面不会自动产生被遮挡的背面或完整体积。
- [W3C CSS Transforms2透视](https://www.w3.org/TR/css-transforms-2/#perspective)：Z位置和透视可产生远近大小差异，共同3D上下文影响层间遮挡。网页深度效果也不自动等于重建了完整物体。

本研究的应用推断：人物/中景/背景分层，小幅运镜建立空间感；大幅侧转、绕背、复杂遮挡需要额外资产或真实几何。手工深度顺序不是精确场景测量。截图与文字无法恢复作者的工程、相机参数或真实深度图。

Tesseract：原帖未给具体产品链接、版本或项目；定向搜索未找到可确认的作者一手入口，保持未识别，不把同名OCR/机器人项目当成视频工具。
