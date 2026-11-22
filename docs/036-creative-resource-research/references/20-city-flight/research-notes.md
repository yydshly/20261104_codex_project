# 第20条｜城市3D数据、Blender与Muse的资料核对

研究日期：2026-11-22。以下是阅读摘要与本项目判断，不是作者工程或工具运行结果。

## 来源状态

- [大阪城原帖](https://x.com/noel_ai_lab/status/2118672880980611565)与[东京站引用帖](https://x.com/Zimo41650079726/status/2117924797967642861)本轮直读403，正文沿用2026-11-12公开镜像sources/20.json。原帖回复教程未取得。
- [引用作者Zimo的日文过程文](https://note.com/zimo/n/n31d8d20c0b69)，发布2026-11-05，正文可读。先发现带AI翻译的英文页，再点Show original核对日文。作者描述小范围PLATEAU导入、改机位、Blender渲染→Muse Image→Muse Video；该流程对应引用的东京站，不自动套给大阪城。文章配图未在本轮逐项审看。文中的8GB环境和渲染耗时仅为作者记录，未复跑。
- [MLIT TOPIC8](https://www.mlit.go.jp/plateau/learning/tpc08-1/)：可用OBJ/FBX或转换CityGML进入Blender；教程列OBJ、MTL、纹理目录及单位/轴向。页面示例较旧，不把示例软件版本或2020数据集视作原帖版本。
- [MLIT开发图解](https://www.mlit.go.jp/plateau/learning/plateau-development-chart/)：地域/分块、坐标转换、局部原点等需要核对。没有在本轮解析任何真实城市分块。
- [MLIT LOD说明](https://www.mlit.go.jp/plateau/learning/tpc03-3/)：不同详细度表达能力有边界；模型与照片纹理不等同于所有细节均有真实几何。
- [MLIT影视场景上篇](https://www.mlit.go.jp/plateau/learning/tpc26-1/)：模型导入后还需材质、环境、光照和局部修饰；本条引用其边界，不采用教程中的特定参数作为原作参数。
- [MLIT影视相机/渲染下篇](https://www.mlit.go.jp/plateau/learning/tpc26-2/)：说明相机位置关键帧、曲线、逐帧渲染和后期，可作为直接3D路线的依据。本文不照搬其40mm、noise、采样等作小柚默认。
- [PLATEAU FAQ](https://www.mlit.go.jp/plateau/faq/)：数据形式、采集更新/抽象化和多种开放许可；未来应对具体数据条目核实，不将所有数据统称单一CC BY版本。
- [Meta Muse Agent说明](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)正文可读，用于区分任务编排Agent和图像/视频模型，不证明Blender兼容性、账号权限或本机可用性。
- [Muse Image/Video官方文](https://ai.meta.com/blog/introducing-muse-image-muse-video-msl/)官方搜索摘要可读，直接正文超时400；只核对产品角色，不报告当前配额、价格或精确控制能力。
- [Blender Follow Path手册](https://docs.blender.org/manual/en/latest/animation/constraints/relationship/follow_path.html)本轮正文402，不作为已读的具体操作证据。直接渲染方案使用上述MLIT可读教程的相机关键帧/渲染依据。

## 原视频观察与结论边界

大阪城取7处、东京站取6处，共13处暂停截图。大阪城0秒为模型式外观，后段出现水面、植被、人群、立面近景和广域俯瞰。东京站从白天转为夜景，圆形顶饰、钟面和立面外观变化。作者称钟表增加；本轮未做同面区域追踪或数量标注，不把每个圆形物判为新增钟表。片长不代表制作耗时，取样不能证明360度、一镜到底或单次生成。

## 对小柚的建议（推论，待执行）

先建立一处地标的小范围场景、起止构图和数据来源记录。需要几何控制时保留工程直接渲染，需要氛围配画时用底稿引导生成。生成静帧与视频分别验地标，环境通过后再合成小柚并单独验人物。两条候选路线的控制粒度不同，不能冒充严格模型A/B。

本轮没有数据下载/安装、Muse登录/调用、渲染、人物上传或小柚成片。个人消化和实作状态保持原样。

