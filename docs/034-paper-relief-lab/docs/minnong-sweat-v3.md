# 第二幕 · 接水碗精修样片

2026-11-16。[打开第二幕](https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/minnong.html?verse=2&revision=sweat-contact-v3)，点击“重听本幕”。[实际GIF](../assets/minnong-story/sweat-v3/02.gif) · [手部与全景检查图](../reports/minnong-sweat-v3/contact.png)。

## 改动与依据

此前第二幕约5秒停留在擦汗，真正接碗与回应只有约1.6秒；旧擦汗画帧和后补交接画帧之间，人物站位也不完全一致。本轮以同一人物对和落脚位置为基准，内置图像工具重绘五组、共20个完整人物姿态，再按实际接触关系选出16个。没有按生成顺序全部拼接，已松手的姿态不会再倒回共同托碗。

现在擦汗、目光回应约占前1.9秒；伸手到接稳回应约4.25秒。父亲先转向碗并伸手，掌心托到底部，双方共同托碗约1.1秒，孩子先松一只手，再收回另一只手。父亲接稳后，双方才抬眼回应。

GIF原生时长4.64秒、17编码帧，含16个独立绘制姿态；有声页面按约6.63秒的本幕节奏播放。整段仍约25.4秒。旁白只将第二幕的一句改为已有MiniMax原声中的“孩子把水碗又递近了一点”，其余三幕的原始PCM段落、章节时间轴和单幕GIF字节已逐项核对一致，没有新增语音生成请求。

## 实际验证

- [第二幕实际播放](../reports/minnong-sweat-v3/contact-checks.json)：16个绘制姿态均观察到，共同支撑、逐步松手与单幕结束正常，最长观察停帧约0.57秒。
- [完整有声故事](../reports/minnong-narrated/checks.json)：原速四幕播放、音频时钟、字幕、暂停续播、拖动进度与移动布局通过。
- [范围与落脚检查](../reports/minnong-sweat-v3/scope-and-support.json)：其余三幕GIF和原始PCM一致，章节时序一致。暗色鞋底末端像素测量中，孩子鞋底纵向跨度由约8.55像素降至约1.49像素（1536宽母版）。这是含墨线变化的图像代理指标，不等同于人体生物力学结论。

## 来源与复现

[准确提示词、输入角色、选帧记录](../assets/minnong-story/sweat-v3/generation.json) · [源帧顺序与整体配准](../reports/minnong-sweat-v3/02-timeline.json) · [GIF字节与SHA256](../reports/minnong-sweat-v3/delivery.json) · [声音精剪记录](../assets/minnong-story/audio-v3/editing.json)。

画面由内置image_gen绘制完整人物，手、袖口、肩肘与碗一起生成；本地代码仅提取透明前景、按鞋底进行整组配准、合成背景与编码GIF。模型版本和种子未返回。五组原始PNG都已保存在项目目录，未采用的姿态保留在原图中。

当前版仍有碗沿、衣纹和墨线的帧间变化；父亲鞋底暗线的横向像素跨度约8像素，也尚未完全消除。此次是接触顺序、停顿与人物回应的精修样片，主观自然度仍待实际验看。
