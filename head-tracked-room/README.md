# 视差窗口

完整的项目目标、原作资料核对、场景演进、交互原理、已实现范围、改进方向和素材出处汇总于[项目研究与共识网页](http://127.0.0.1:5178/research.html)，在演示页右上角也可进入。网页源文件为 `research.html`，随应用一起构建。

[公开研究网页](https://yydshly.github.io/20261104_codex_project/013-spatial-window/) · [公开交互演示](https://yydshly.github.io/20261104_codex_project/013-spatial-window/play.html?scene=workshop) · [第 013 项研究摘要](../projects/013-spatial-window/README.md)

公开版用 `npm.cmd run publish` 构建到 `docs/013-spatial-window/`，沿用仓库 GitHub Pages 的 main /docs 配置。研究首页使用已有三栏引导图，图像原件保持一致。公开演示中的举钟人物使用随项目提供的 VRoid 样例，本机开发版本仍使用下述本地 MMD 模型。

Windows 上的视差桌面。默认场景「桌上平板」参考 [Doui Lab 的演示视频](https://x.com/DouiLabApps/status/2119414517126107169) 的拍摄构图：木桌上有斜立的平板、触控笔、电脑和灯。平板屏幕里是另一间房，人物托着显示本地时间的翻页钟，粉色蝴蝶结叠在屏内的虚拟黑边上。可切到「举钟来客」直接看屏内，也可以切换到「桌沿来客」「雨夜留灯」和「窗边桌面」等旧场景。

「举钟来客」使用 (c) Kizuna AI 的[官方初版 MMD 模型](https://kizunaai.com/download/)，由 Project A.I. 制作，森倉円设计，Tda 监修，トミタケ建模。原始模型和贴图只在本机使用，不随构建打包。搬到另一台电脑时，从官网「初期ビジュアル」条目下载模型，保留原包中的说明，并将解压后的 `kizunaai` 目录放到项目的 `.local-assets/kizunaai/`，使 `kizunaai.pmx` 位于该目录下。

「桌沿来客」的人物使用 © pixiv Inc. / VRoid Project 的 [AvatarSample_C](https://hub.vroid.com/characters/1248981995540129234/models/8640547963669442173)，按 [VRoid 预设模型使用条件](https://vroid.pixiv.help/hc/en-us/articles/4402394424089) 随项目提供。模型文件存放于 `public/visitor/AvatarSample_C.vrm`，扶窗、握牌与眨眼由应用在运行时控制。

## 运行

安装 Node.js 18 或以上。在项目目录用 PowerShell 运行：

```powershell
npm.cmd install
npm.cmd run dev
```

用 Chrome 或 Edge 打开 [本地演示](http://127.0.0.1:5178/)。

1. 墨水屏按电脑的当前时间和时区显示时钟、星期及月历，并高亮今天。天气默认显示北京。点右下角「天气与视角」，用城市名或拼音更换，选择会记在当前浏览器里。雨夜场景固定呈现雨景，墨水屏的天气数据随所选城市更新。
2. 鼠标移到画面两侧可以直接体验视差。在「视角设置」或「天气与视角」开启摄像头并允许访问后，正对屏幕等状态显示「正在追踪」，然后把头向左右平移。右下角按钮可以全屏。
3. 「人物展台」可导入网格和贴图都内嵌、未压缩的 GLB 2.0，文件上限 50 MB，模型使用 Y 轴向上。可用按钮或滑块转动模型。「月面邮局」和「观测舱原型」展示各自的出框效果。

导入的模型和摄像头帧都在浏览器内处理。天气搜索和更新需要联网，天气数据由 [Open-Meteo](https://open-meteo.com/) 提供。时钟、月历和视差可离线使用。

## 原理

MediaPipe 检测两眼的位置，以启动时的几帧作为正面基准，并用脸框宽度估计相对距离。Three.js 把屏幕当作固定的矩形窗口，由估计出的视点计算非对称投影。近处物体和远处物体因此移动不同的幅度。普通摄像头给出的是相对位置估计，效果随镜头视野、观看距离和光线而变化。

「桌上平板」把同一个视点换算到平板屏幕所在的平面，从该角度渲染屏内房间，再把结果画在外层平板的屏幕上。机身、支架和其他桌面物件都在外层空间里，屏内的墙、地板和人物仍随观看角度变化。

虚拟窗框在画布内留出一圈可绘制区域。「举钟来客」的黑边固定在屏幕平面上，墙和地板在它后面，头饰伸到它前面。渲染时用同一套深度关系决定遮挡，左右移动只改变从窗口看进去的视角。

- [MediaPipe Face Detector](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector)
- [BlazeFace Short Range 模型文件](https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite)
- 展台示例为 Poly 创作的 [Astronaut](https://poly.google.com/view/dLHpzNdygsg)，由 [Google model-viewer](https://github.com/google/model-viewer/blob/master/packages/shared-assets/models/Astronaut.glb) 提供，采用 [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) 许可。展台调整了它的摆放位置、比例和灯光，GLB 文件保持原样。
- 外层桌面和显示器素材来自 Poly Haven 的 [Wood Table 001](https://polyhaven.com/a/wood_table_001) 和 [Mossy Rock](https://polyhaven.com/a/mossy_rock)，采用 CC0。

用 `npm.cmd run build` 构建，用 `npm.cmd run preview` 在同一端口预览构建结果。切换前先停止开发服务器。

## 窗边桌面美术素材

样板房照片由内置 ImageGen 生成，保存在 `public/window-desk/room.png`。桌面和远处房间使用不同的投影平面。墨水屏外壳、支架、阴影和信息由程序实时绘制。

夜景 `public/window-desk/rain-night.png` 由内置 ImageGen 参考白天样板房生成。缓慢移动的雨滴由着色器绘制在窗玻璃区域，并遵循系统的减少动态效果设置。

<details>
<summary>生成提示词</summary>

**雨夜留灯**

Use case: photorealistic-natural, edit the attached daytime interior reference into the matching evening view for a rain-night ambient desktop. Preserve the same camera, exact wide 16:9 framing, level view across the same walnut desk, the position of the far tabletop edge around 68 percent image height, the same window mullions and linen curtain on the left half of the window, the foreground plant at right. Outside it is now a deep rainy blue-grey night in an ordinary residential garden, faintly discernible wet trees and 1–2 softly defocused warm house lights, with detailed fine wet droplets, sparse vertical rain runnels and dark reflections confined to the glass panes. Inside, a real small frosted mushroom lamp on the left glows softly, illuminates a half-open used book placed at the left margin and makes a softly graduated golden reflection on the walnut wood, drifts across the near part of the linen curtain. Keep the left lamp recognizable and a little more visible inside the left crop if possible. The center and center-right of the wooden desk should remain physically open and bare for a separate e-ink appliance to be composited later by the app; do not depict a screen, display, clock, calendar, text or logo. Keep a broad portion of the desk in foreground, honest contact shadows and warm surface grain, quiet imperfect lived-in room, low-key natural apartment photography. The amber pool of light on the left must be immediately legible at small image sizes; retain enough shadow detail to read the window and desk as a coherent room. Natural filmic highlight falloff, realistic believable ordinary home, no neon, no candles, no fantasy, no cinematic blue-orange filter, no people, no clutter.

**窗边桌面**

Use case: photorealistic-natural. A genuine-looking wide 16:9 candid photograph from seated eye height looking straight across a warm solid dark walnut desk in an actual lived-in modern apartment, cloudy spring late afternoon. The camera is level, straight vertical lines and natural 40mm lens, realistic dynamic range. A generous clear expanse of walnut tabletop spans the entire frame at bottom, with the far edge of the table meeting the background approximately 72 percent down the image; the center of the desk from 25 to 78 percent across is completely clear for a separate physical device. On the far left edge only, a small frosted mushroom table lamp and a modest book stack, cropped a little, their natural soft shadows visible. On the far right, a slightly out-of-focus leafy plant in a simple stone pot near the far right edge. Background: a large tall real apartment window across the middle and right, gauzy off-white linen curtains, rain-dark trees and soft apartment garden greenery clearly visible outside, slightly out of focus. Left back wall is warm muted plaster, ordinary home proportions. Diffuse cool daylight from the window and a warm muted lamp glow. Warm walnut and soft daylight palette, rich but understated natural wood grain, highly realistic interior photography, subtle imperfections and no dramatic staging. Single unified scene. No people, no computer, no screen, no clock, no central object on tabletop, no text, no symbols, no logos, no compositing. Keep horizon and perspective plausible at close seated distance, like an ordinary real room seen through a clean glass window.

</details>

## 晨间桌美术素材

立绘和远景由内置 ImageGen 生成，保存在 `public/morning-desk`。时钟、月历和天气文字由应用实时绘制。

<details>
<summary>生成提示词</summary>

- `sasuke.png` — Use case: illustration-story. Create one polished full-body character cutout for a desktop ninja-themed daily information diorama: Sasuke Uchiha from Naruto Shippuden, recognizable black spiky hair, thoughtful composed face, gray high-collared short-sleeved top, dark navy trousers and purple rope belt. Calm standing three-quarter pose turned slightly toward screen right, holding a closed neutral scroll at his hip. Both hands and both sandal-clad feet visible. Contemporary premium hand-painted cel animation art with clean drawn contours, nuanced warm amber rim light from upper left and cool indigo shadows. Tall portrait composition, character fills the frame with only a small safety margin. Actual transparent alpha background. Single character, no cast shadow, no ground, no props other than the closed scroll, no text, no UI, no logo. Render crisp and carefully proportioned, not chibi.
- `naruto.png` — Use case: illustration-story. Create one polished full-body character cutout for a desktop ninja-themed daily information diorama: Naruto Uzumaki from Naruto Shippuden, recognizable spiky blond hair, blue eyes, whisker marks, Leaf forehead protector and orange-and-black ninja jacket and trousers. Warm alert smile, relaxed standing three-quarter pose turned slightly toward screen left, one hand raised at chest level in a relaxed greeting, both sandal-clad feet visible. Contemporary premium hand-painted cel animation art with clean drawn contours, nuanced warm amber rim light from upper left and cool indigo shadows. Tall portrait composition, character fills the frame with only a small safety margin. Actual transparent alpha background. Single character, no cast shadow, no ground, no extra props, no text, no UI, no logo. Render crisp and carefully proportioned, not chibi.
- `veranda.png` — Use case: illustration-story. Wide landscape background plate for an interactive desktop miniature inspired by anime ninja villages: at early golden dawn, looking straight ahead through a wide open wood veranda at distant village rooftops nestled among wooded mountains, pale drifting clouds, maple trees with muted burnt orange leaves on the sides, dark timber posts framing the vista, quiet cinematic Japanese animated background painting. Low-key warm amber sunlight and cool ink-blue shadows, textured but restrained and softly atmospheric, premium crafted matte painting. Symmetric frontal architecture but naturally varied mountains. Keep the central and lower third visually subdued for separate foreground elements. Single clean wide landscape, no people, no text or symbols, no letters, no watermarks, no interface or panels.

</details>
