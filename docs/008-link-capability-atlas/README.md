# 能力图鉴 · 16 个链接的能力与价值解析

01–15 保留原始帖子编号，第 16 条单独解析已收录的 Gitruck 有声剪辑补充。整理生成影像、教育 3D、Agent 工作流和知识系统。首页可直接播放原创温室巡检宣传片，`#deliverables` 集中展示可下载的本地作品及对应工作台。原作展台分为口播与镜头、头像成品、知识可视化、可听资讯四组。

在本目录运行 `python preview.py`，打开 `http://127.0.0.1:5187/`。展台播放 `assets/originals/` 里的原始素材，并在本页加载 Papermorph 第 12 章和 Mono Radio 2026-11-06 节目。外部链接用于查出处。课件和电台的来源、授权和本地调整见各自目录的说明。

`acceptance.html` 保存 2026-11-21 的逐条实际验收、可播放预览及本轮导出文件。各条注明运行范围。第 01 条新增原生拼贴 GIF 与同旁白对照片。第 08 条可跑完八种规则配置。第 13 条用 IndexedDB 持久保存笔记，并同步同源窗口。`labs/character-media/xiaojing-kit-v2.zip` 包含三张表情、原生 GIF、分镜与现有成片。

本地预览支持在音视频中跳转时间。`assets/originals/media/asset-manifest.json` 记录媒体的原始地址、大小和校验值。`assets/originals/index.js` 是页面使用的本地路径索引。

说明在 `content-01-05.js`、`content-06-10.js` 和 `content-11-15.js` 中，原作者的媒体和作品链接集中在 `showcase-sources.js`。编号链接使用 `#case-01` 到 `#case-16`，打开时自动展开对应条目。旧版实践锚点会转到相应的原作分组。

`research.js` 保存各条实现原理、来源和实验入口。`#explore-01` 到 `#explore-16` 对应同编号的案例。实验代码位于 `labs/`，可在展台内操作，也可单独打开。

每项实验在导航下标出可下载的产物。加色微课和图鉴电台新一期都可带走单文件离线 HTML。第 07 条的温室项目可用同一份字幕稿校对两种画幅，也可导入本地视频和 WebVTT。第 12 条的验收报告可载入第 14 条核查引文，定位后人工登记结论，再将核查报告 JSON 载入第 13 条整理成笔记。第 13 条可用自己的索引 JSON 恢复笔记，第 15 条可用旧报告重算保存的方案和基准。

第 04 条在 `labs/camera-media/` 播放温室宣传短片、五个横竖屏镜头和对应分镜。`labs/build-greenhouse.py` 用 Blender 4.5 逐帧渲染，分别使用 `--width 1280 --height 720` 和 `--width 720 --height 1280`。`labs/build-greenhouse-audio.py` 生成原创配乐，`labs/package-greenhouse.py` 用 FFmpeg 和 Pillow 剪辑并写出媒体清单。三个脚本均支持 `--help`，Blender 脚本的参数放在 `--` 后面。

横版和五个竖屏单镜头齐备后，运行 `python labs/build-verdant-vertical.py` 生成 16 秒竖版及封面，并更新两版共用的镜头时间线。第 04 和 01 条的成片齐备后，运行 `python labs/build-verdant-release.py` 重建字幕与温室交付 ZIP。归档内的 VTT 来自第 07 条内置温室项目，横竖两版均可用这份字幕继续编辑。

第 01 条的成片位于 `labs/collage-media/`。五秒配画与交互共用 `labs/collage-motion.js`，可用 `node labs/build-collage.cjs` 重建。`python labs/build-collage-edit.py` 使用这段配画和第 04 条的竖屏镜头，生成旁白相同的两支 11 秒竖版及有声同屏版。已有两支竖版时，可加 `--delivery-only` 复用原音轨，生成同屏版、独立旁白 M4A 和无内嵌字幕的拼贴版。第 07 条的内置巡检口播项目与可单独下载的 WebVTT 取自同一组字幕时间码。完整构建使用 FFmpeg 和 Windows 上的 Microsoft Huihui Desktop 中文语音，五秒配画另需 Node.js 和 `@resvg/resvg-js`。

第 02、03 条共用 `labs/character-media/xiaojing.png`。这是内置 Image Gen 生成的透明角色原图，生成指令见同目录 `prompt.txt`。`python labs/build-character-loop.py` 使用 OpenCV、NumPy、Pillow 与 FFmpeg 生成带底色与透明底头像、待机眨眼、点头回应和角色素材 ZIP。用 `--keep-nod` 可直接复用已有的点头成片。

第 05 条的 R3F 互动课件位于 `labs/stoma-3d/viewer/`，Remotion 讲解片位于 `labs/stoma-media/`。两边使用 `labs/stoma-3d/public/assets/` 的 GLB。`build_scene.py` 在 Blender 中生成 V1。用安装了 `mcp-for-blender==2.2.7` 的 Python 运行 `verify_mcp.py <Blender 可执行文件>`，会在独立 Blender 进程中通过 MCP 修改形变、导出 V2 并保存核验 JSON。在 `labs/stoma-3d/` 运行 `npm ci`、`npm run build` 更新网页，运行 `build-narration.ps1` 后用 `npm run render`、`npm run still` 和 `npm run still:before` 更新影片和同帧对照图。每次改模型后需要重新导出并构建网页、重渲影片。

也可直接下载 `labs/leaf-classroom.html` 进行离线课堂互动。`python labs/build-leaf-classroom.py` 将 `labs/leaf-lesson-sheet.svg` 的三个原观察视图与测量标线嵌入课堂页。

第 06 条的 12° / 28° 对照片和 18° 飞越片位于 `labs/galaxy-media/`。`python labs/build-galaxy-compare.py` 使用飞越片的渲染器，固定随机种子与镜头路线，分别计算两种张角的星点与尘带，再输出 8 秒双栏成片和封面。浏览器使用轻量模型导出自定义 1600 × 900 对照 PNG。两种渲染均用于构图示意。

第 08 条可重新打开自己下载的审核报告 JSON。按保存的样本和规则重算后，可导出逐条核对 CSV，或继续调整规则作对照。

第 10 条的旁白和 VTT 共用 `labs/lesson.html` 中的台词与时间码。`python labs/build-rgb-narration.py` 使用 Windows 中文语音和 FFmpeg 重建音轨。`python labs/build-rgb-lesson.py` 重建首页和课堂可直接下载的单文件 HTML，内含原始 MP3、讲解时间线和纯黄练习。

## 公开网页

[在线解析与效果](https://yydshly.github.io/20261104_codex_project/008-link-capability-atlas/) · [逐项验收](https://yydshly.github.io/20261104_codex_project/008-link-capability-atlas/acceptance.html) · [子项目研究摘要](../projects/008-link-capability-atlas/README.md)

共 16 个链接，口径为 15 条 X 原帖与 Gitruck 有声口播剪辑补充。原生生图/GIF、镜头与剪辑、共享 3D、工作流与知识库各自提供来源、能力与价值说明。首页沿用已生成的理解总览图，并注明图中覆盖原始十五条。
