# 47 小游戏按玩法和分发选最轻的技术

[@CryY666666 原帖](https://x.com/CryY666666/status/2118957998651662765) · [Phaser 官方 Arcade Physics](https://docs.phaser.io/phaser/concepts/physics/arcade) · [Cocos Creator 发布微信小游戏](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-wechatgame.html) · [Unity 6 Web 兼容性](https://docs.unity3d.com/cn/6000.0/Manual/webgl-browsercompatibility.html) · [CrazyGames 技术要求](https://docs.crazygames.com/requirements/technical/) · [原帖快照](sources/47.json)

核对时间 2026-11-22。原帖只有文字。模块展示原文入口和摘要。先锁输入、场景复杂度、目标设备和上线渠道，再选最少依赖且能跑通的方式。

## 原帖与证据

原帖文字列四种路线。HTML5 + JavaScript 是浏览器技术组合，Phaser 是其上的 2D 框架，Cocos 和 Unity 提供独立引擎工具链。

未构建四套相同小样，也没有相同设备上的引擎性能对照。

## 具体分析

### 页面型轻玩法先试原生网页

一个场景的按钮、选择、计时可直接用 DOM 或 Canvas。玩法复杂后再把输入、状态、碰撞外移，避免无边界起步。

依据为 原帖 / 小柚场景。

### Phaser 解决网页 2D 通用部件

有多场景、序列帧、碰撞、摄像机或输入协调时，框架可减少自写底层。选用了框架仍需按目标包体验证。

依据为 Phaser 官方文档。

### Cocos 合于明确要打微信包

官方有微信小游戏构建和接入步骤。跨 Web 与微信也要分别核 API 差异、分包、SDK 和真机。

依据为 Cocos 官方发布文档。

### Unity 路线由真实 3D 需求决定

Unity 有 Web 构建。网页运行支持看具体版本、浏览器与设备。对单次点击的小样，复杂管线的包体和启动要留测试空间。

依据为 Unity 官方兼容性与 CrazyGames 技术要求。

### 只在原型达不到要求时升级

小柚首版从一个动作和可打开的网页开始，统一画质与玩法测首帧、第一次操作、输入错误和运行稳定性。

依据为 小柚验证表 / 第36条。

## 四条路线的采用条件

| 路线 | 什么时候采用 | 小柚先验什么 |
| --- | --- | --- |
| HTML5 + JS | 一关、一个动作、网页分享 | 首帧、手势、可重玩 |
| Phaser | 网页 2D 多场景、精灵或碰撞 | 触屏布局、纹理大小与状态切换 |
| Cocos Creator | 计划构建微信小程序环境里的小游戏 | 开发者工具与真机，平台 API |
| Unity | 已有 Unity 3D 管线或硬性复杂 3D | 压缩后的大小、启动时间与兼容性 |

## 小柚验证卡

同一个小柚反应玩法先做网页小样，设输入、反馈和重玩。

- 以同一批素材在目标手机记首次加载、首点、帧预算。必要时才对比 Phaser 或 Cocos。
- 记录哪条硬要求当前方案达不到，再做引擎迁移。
