# 一粒米的来处 · 《悯农》四幕 GIF
日期：2026-11-16。[打开故事页](https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/minnong.html?verse=1&play=1&revision=native-gif-complete) · [完整故事 GIF](../assets/minnong-story/gif/complete-story.gif) · [四景总览](../reports/minnong-story/four-scenes.png) · [故事长图](../assets/minnong-story/story-long.png)。

四张故事画稿、四个单幕 GIF 和带诗句的完整 GIF 已完成。使用内置图像生成绘制完整人物和过渡姿态，再本地合成与编码。没有调用 ChatArt/Kling，没有外部服务积分消费。当前工具返回静态画帧，GIF 是这些画帧的本地编码结果，并非图像工具直接输出的动态文件。

## 连续故事

这是据诗意创作的父子故事，每句对应一景，人物、红边白碗、条纹布巾、藤篮和稻田贯穿其中。

| 诗句 | 故事动作 | 实际 GIF |
| --- | --- | --- |
| 锄禾日当午 | 孩子捧水等待，父亲抬锄、落锄、收势 | [第一幕](../assets/minnong-story/gif/01.gif)，18编码帧，2.76秒 |
| 汗滴禾下土 | 父亲擦汗后望向孩子，水碗递近，汗落向土 | [第二幕](../assets/minnong-story/gif/02.gif)，9编码帧，2.36秒 |
| 谁知盘中餐 | 父亲托碗，孩子接稳，父亲松手 | [第三幕](../assets/minnong-story/gif/03.gif)，9编码帧，2.36秒 |
| 粒粒皆辛苦 | 孩子拈起落米，移向父亲掌心 | [第四幕](../assets/minnong-story/gif/04.gif)，9编码帧，2.36秒 |

原始独立绘制姿态分别为17、8、8、8张，编码包含末帧保持。单幕为1024×683；完整故事为1024×780、42编码帧、9.64秒，约7.4MB，带四句诗。GIF均不循环，网页可精确暂停、续播和重看，连看四幕后停在最后一幕；支持每幕及完整故事下载。静态海报直接取动画首帧，切入时构图一致。长图为1200×4110。

## 视觉与动作方法

原演示只作风格和媒介参考：朱红、黑墨、赭黄、橄榄绿，纸白刻线、纤维纸面和稀疏留白。保留自己的父子故事与场景，没有复制原演示构图。当前人物保留少量肤色和表情，比原演示的小剪影更偏叙事插画。

内置工具生成四幅完整画稿后，分别生成清洁背景、完整人物/整组前景关键姿态及过渡姿态。肩肘、手腕、衣袖和道具同时画在同一幅姿态里。第一幕以双脚位置对齐完整人物；其余三幕采用整组前景固定变换。Canvas只负责透明图层提取、整体定位、背景合成和第二幕一滴汗的辅助细节。没有分段肢体旋转或纸偶关节。

本地自动运动补间试验产生手部、锄头拖影，已排除。交付GIF直接使用绘制帧，保留停顿和逐帧节奏。仍存在帧间细线、锄头轮廓和桌面木纹变化；后三幕只有8个绘制姿态，连贯度仍有提升空间。功能检查通过不代表已达到原演示艺术质量，待用户实际验看。

GIF播放使用已随项目保存并附MIT许可的gifuct-js解码器。只在播放时加载当前GIF，逐帧解码并使用有界工作画布，不预存全部RGBA大图。切幕会暂停，回来保留进度；加载失败时保留画稿并允许重试。完整故事GIF只在用户选择下载时请求。

## 来源、复现与检查

- [四景画稿生成记录](../assets/minnong-story/generation.json)
- [动作帧准确提示词与素材角色](../assets/minnong-story/native-generation.json)
- [实际时长、帧数、大小、SHA256](../reports/minnong-native/delivery.json)
- [真实GIF播放核验](../reports/minnong-native/playback-checks.json)
- [页面与移动布局核验](../reports/minnong-story/page-checks.json)
- [故事配置](../stories/minnong-story/story.json)

本地服务运行后，依次执行：
```
node reports/minnong-native/render.mjs
node reports/minnong-native/render-pairs.mjs
node reports/minnong-native/render-story.mjs
python reports/minnong-native/encode-final.py
node reports/minnong-story/prepare.mjs
npm run check
npm run story:check
node reports/minnong-native/check-playback.mjs
```

模型版本与种子没有返回，保持未知。图像编辑由内置图像工具完成；本地代码仅作图层合成、检查和格式编码。

旧纸偶版在minnong-legacy.html，自动补间研究稿未接入当前故事。此前240积分外部视频方案已取消；motion-1.txt到motion-4.txt及process-video.py/build-film.py仅是未执行的历史方案。
