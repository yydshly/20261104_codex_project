# GitHub 项目研究总库

整理值得深入研究的 GitHub 项目，记录它们解决的问题、值得借鉴的做法和复现中的发现。按编号浏览研究摘要，再进入子项目查看原仓库、详细笔记、截图和可用的 Web 演示。

## 研究索引

| 编号 | 子项目 | 原库 | 研究摘要 | 图片导览 | Web 演示 |
| --- | --- | --- | --- | --- | --- |
| 001 | [交互效果实验室](projects/001-interaction-effects-lab/README.md) | [MotionSites](https://motionsites.ai/) · [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) · [Apache ECharts](https://github.com/apache/echarts) · [React Flow](https://github.com/xyflow/xyflow) | 汇总 16 个源参考、可操作复现与产品扩展，覆盖内容浏览、商品展示、材质反馈和业务交互。以共享款式与面料串联五步家具体验，沉淀原理、提示词与可继续组合的模块。 | [原理引导图](#interaction-effects-guide) | [在线总览与演示](https://yydshly.github.io/20261104_codex_project/001-interaction-effects-lab/) |

项目按收录顺序从 `001` 开始编号。新条目按编号追加，已分配的编号保持固定。索引摘要用一两句话写清研究对象和关注点。完成验证后，可补上一条主要发现。

## 项目引导图

<a id="interaction-effects-guide"></a>

### 001 · 交互效果实验室

这张图汇总了从源库参考、本地复现到产品扩展的探索过程。16 个案例分为内容浏览与叙事、商品展示与对比、材质与场景反馈、配置查询与编辑四类，每项保留源参考、可操作演示和实现提示词。

![交互效果实验室引导图，汇总 16 个案例、源库入口、交互原理与五步家具流程](interaction-effects-lab/public/demo-assets/overview/principles-poster.jpg)

图中的家具链路依次为选椅子、360° 查看、切换灯光、配置报价和查找展厅，用同一份款式与面料选择串联多个交互。可以单独取用一个效果，也可以参考这条链路组合自己的产品流程。

后续可接入真实商品、价格与展厅库存，并按需求组合面料比较、规格帮助、报价分析和样品审批。当前报价与库存使用示例数据，分析和审批保留独立演示入口。[进入在线体验](https://yydshly.github.io/20261104_codex_project/001-interaction-effects-lab/) · [查看详细研究与扩展方向](projects/001-interaction-effects-lab/README.md)

## 收录新项目

1. 复制[子项目模板](projects/_template/README.md)到 `projects/<编号>-<英文短名>/README.md`，写明上游仓库、研究问题和复现记录。
2. 把封面和截图放在子项目的 `assets/`，用相对路径引用。填写替代文字，并用一句图注说明读者应关注的细节。根索引可链接封面。
3. 在上方索引补上对应条目，「原库」列填写上游仓库或官方入口。在索引下方添加引导图、案例范围、复用价值与扩展方向的说明。有在线演示时，再填入可访问的地址。

## Web 演示

首个静态演示就绪后，可将 GitHub Pages 的发布源设为 `main` 分支的 `/docs`。每个演示使用自己的 `docs/<编号>-<英文短名>/index.html`，把构建产物与静态资源放在该目录内。资源使用相对路径，或将构建基路径设为 `/20261104_codex_project/<编号>-<英文短名>/`。

启用后，演示地址的格式为 `https://yydshly.github.io/20261104_codex_project/<编号>-<英文短名>/`。[GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
