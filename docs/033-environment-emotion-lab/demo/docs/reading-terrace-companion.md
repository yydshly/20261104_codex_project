# 池边茶角与陪伴人物 · 2026-11-15

这轮把“看一处环境”向“与人在同一处环境里停留”推进。保留用户的第一人称，增加独立陪伴人物，经过原来的房门与小径走到庭院茶角，靠坐、喝茶、打招呼，再继续去池边或回屋。

## 这一版能做什么

- “去茶桌歇歇”沿真实路径行走，再平滑进入摇躺椅的靠坐视点；再次点击或使用行走键起身。
- 茶角有木台、遮雨棚、实木摇椅、脚凳、靠垫、边桌、茶壶和两只茶杯。棚下有柔和暖光，棚顶以下不再显示穿透的雨丝。
- 陪伴人物在茶角等候；走近时招手，平时呼吸与偶尔环顾。“打个招呼”可再次得到挥手回应，“一起看水”使人物转向池塘并环顾，随后回到安静状态。
- “喝一口茶”让一只茶杯靠近视点并放回原位，短暂冷却防止连点重叠。这一版尚未增加用户手部持杯动画。
- 复用现有位置声场、自然环境录音、随机鸭叫和 MiniMax 书页朗读，没有新增自动对白或语音接口调用。

## 素材与处理

人物：Microsoft Rocketbox 的通用角色 **Male Adult 10**，MIT 许可，模型、服装贴图、骨骼以及 Idle、Wave、LookAround 等动作均来自该库。复用工作区此前完成的同库动作烘焙 GLB；不是用户的私人面貌模型。原始来源：https://github.com/microsoft/Microsoft-Rocketbox 。本地记录和完整 MIT 许可见 `https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/companion/`。

摇椅：Poly Haven **Rockingchair 01**，CC0。来源：https://polyhaven.com/a/Rockingchair_01 。官方 glTF、二进制和 1K 贴图均保持独立文件，下载 URL 与贴图哈希见 `https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/terrace/sources.json`。

茶桌、脚凳、靠垫：复用原有 Poly Haven side_table_01、Ottoman_01、throw_pillows_01，CC0。木板与织物复用项目已有 Poly Haven 材质。木台、棚架、棚布与茶具由本项目以三维几何构造；不是外部成品模型。

## 共用的方法

`reading-space.js` 仍是空间、路径、碰撞与声场的共同坐标源。`reading-walk.js` 扩展室外靠坐与起身状态，避免页面切换或瞬移。`reading-terrace.js` 负责茶角模型与茶杯动作，`reading-companion.js` 负责人物动作混合、接近回应、转向与释放资源。

人物与家具参与室外光照和投影，也属于同一空间。陪伴的基础是可理解的距离、适当的回应与共同停留；这版是互动人物的起点，尚无自由对话、长期记忆、陪走或人物坐下表演。

## 验证

程序验收覆盖：房内至茶角的连续路径、室外靠坐、起身后落在可走位置、回房坐下；真实人物 GLB 与骨骼动作加载、接近招呼、重复招呼冷却、动作结束回到呼吸、人物尺寸与鞋底接地、资源释放。实际 GPU 与 UI 画面另外通过内置浏览器验收。

内置浏览器实际完成房间 → 茶角靠坐 → 喝茶 → 一起看水 → 起身 → 回房坐下。茶角靠坐坐标为 `(-5.500, 1.140, 7.300)`；打招呼实际进入 Wave，随后一起看水进入 LookAround；返回房间后为 `(-0.650, 1.460, 0.120)`，座位状态为 room，音频载入且开启，GPU 着色器错误为 0。图片记录：`terrace-companion.jpg`、`terrace-companion-greeting.jpg`、`terrace-tea-sip.jpg`、`terrace-return-reading.jpg`。这轮没有重新做主观听感结论；原有位置声场与 MiniMax 朗读的程序回归检查通过。
