# Tesseract 的能力与价值 · 研究档案 004

研究核心是 Tesseract 的可编辑工程、剪辑、二维动画、三维场景与音轨能力，以及对讲解制作、修改和交付的价值。齿轮、见全、车床和发动机为本轮实测案例。

[在线能力研究与实测作品](https://yydshly.github.io/20261104_codex_project/004-tesseract-capabilities/) · [研究摘要](../projects/004-tesseract-capabilities/README.md) · [研究总库](../README.md)

2026-11-21 整理为完整研究档案，按八个入口保留可体验成果、四部成片、八阶段探索过程、制作原理与工具分工、十二类能力、价值判断、待验证试验及资料长图。已有产物、官方能力和价值假设分别标注。源片和下载文件位于 `public/media/`，报告样式位于 `src/research.css`。

使用 Node.js 18 或以上版本。首次运行执行 `npm ci`，再执行 `npm run dev`，打开 http://127.0.0.1:5184/ 。执行 `npm run build` 生成 `dist/`，可用 `npm run preview` 检查构建结果。开发服务和构建预览共用端口，运行其中一个即可。

发布运行 `npm run build:pages`。Vite 使用相对基路径，`publish.mjs` 将构建产物、公开素材与研究摘要复制到 `../docs/004-tesseract-capabilities/`。GitHub Pages 沿用 `main` 分支的 `/docs`。原有 3200 × 6804 研究长图用于网页引导、总库索引及分享元数据。

发动机是网页内的 Three.js 示意模型。四个冲程共用一条 720° 时间轴，连杆保持定长，气门按理想化冲程开合。支持暂停、拖动角度、旋转视角和切换剖面。点击「听讲解」可播放 MiniMax 中文旁白，章节选择器与装配动作和四冲程同步。操作手动控制时，旁白暂停。模型参数和气体颜色用于教学，实体制作练习见网页研究记录。

`public/media/` 收录原片、可编辑工程和字幕。`public/engine-2d.html` 提供单独的二维示意。页面运行无需连接第三方服务。

《发动机装配与四冲程》成片时长 67.2 秒，含 MiniMax 中文旁白、七个章节和可切换的中文字幕。Tesseract 源工程保留了可编辑模型、镜头、关键帧、文字和分段音轨。
