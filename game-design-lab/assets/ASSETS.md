# 实机原型素材与提示词记录

本轮使用内置 `image_gen.imagegen` 生成新美术，再以 Canvas 精灵图裁取、位移、受击闪光和粒子组成实时场景。未使用 CLI/API 后备路径。所有项目使用的最终图片均已复制到本目录，离线构建会嵌入这些文件。

## 新生成的素材

| 文件 | 内容 | 在游戏中的用途 |
| --- | --- | --- |
| [characters-v2.png](characters-v2.png) | 4 列 × 3 行透明角色图集 | 第一行手绘卡牌角色和敌人；第二行哥特墨线英雄和骸骨；第三行中世纪半身佣兵与匪徒。 |
| [environments-v2.png](environments-v2.png) | 三条全宽场景背景 | 上方为青绿幻想遗迹，中间为哥特地牢，下方为俯视荒野战场。 |
| [machines-v2.png](machines-v2.png) | 2 列 × 2 行透明工业机器图集 | 采矿机、石炉、蓝色组装机与蒸汽发电机，以相同俯视光照制作。 |
| [farm-v2.png](farm-v2.png) | 4 列 × 2 行像素建筑与方向人物图集 | 农舍、种子摊、橡树、石块，以及同一农夫的下、上、左、右朝向。 |

下面保留本轮生成所用的提示词规格，便于继续生成兼容素材。布局、方向和透明背景是运行时切分使用的约束。

### 角色图集提示词

Use case: stylized-concept. Production game sprite atlas, TRUE transparent background, exactly 4 columns and 3 rows, twelve evenly spaced cells in a square canvas. Every character isolated in its cell with generous padding; no text, labels, UI, checkerboard, or background. Row one: expressive hand-painted card roguelike sprites, Slay the Spire 1 visual reference, newly designed masked red-cloaked swordsman facing right, green slime facing left, feather-cloaked cultist facing left, ancient stone guardian facing left. Row two: strong black ink shapes, angular gothic comic silhouettes and desaturated ochre/crimson highlights, Darkest Dungeon 1 visual reference; crusader facing right, hooded healer facing right, plague-masked alchemist facing right, skeletal swordsman facing left. Row three: detailed hand-painted medieval tabletop busts, Battle Brothers visual reference, no legs; helmeted shield mercenary, hooded female archer, bearded chainmail spearman, battered-shield bandit facing left. Complete uncropped sprites, consistent scale per row, readable at game size.

### 场景图集提示词

Use case: stylized-concept. Square background atlas, exactly three full-width equal-height horizontal strips, no separators, text, UI, people or monsters. Each strip is a playable panorama with the floor in the lower quarter. Top: newly designed Slay the Spire 1 inspired hand-painted dungeon clearing, ruined stone arches, teal moss, vines, distant misty ravine, flat storybook shapes and paper texture. Middle: original Darkest Dungeon 1 inspired gothic crypt, crowquill ink, heavy black outlines and shadow masses, skull niches, sparse orange torches and desaturated blue-gray/brown. Bottom: Battle Brothers inspired overhead oblique miniature terrain, ochre grass, bare earth, sparse rocks and bushes at edges, traversable center and no painted grid. Deliberately different visual grammar per band; no logos or watermark.

### 工业机器图集提示词

Use case: stylized-concept. Production 2D factory machinery atlas, exactly two columns by two rows, true transparent background, generous padding. Newly designed Factorio-like weathered pre-rendered 3D-to-2D sprites with a consistent elevated three-quarter top-down camera around 55 degrees and light from upper left. Top left: yellow-gray mining drill, cutter, motor, belts, hydraulic pipes and ore hopper. Top right: squat stone smelting furnace, glowing door, chimney and iron frame. Bottom left: blue assembling machine, copper pipes, gears, green status lamp and robotic manipulator. Bottom right: steam generator with copper turbine, boiler, pressure gauges and exhaust. Complete objects, readable silhouettes; no landscape, labels, floor plane, grid, people or checkerboard.

### 农场图集提示词

Use case: stylized-concept. Polished 16-bit farming videogame atlas, TRUE transparent background, exactly four columns by two rows, eight isolated complete sprites centered in equal cells. Crisp pixel art with Stardew Valley style color vocabulary, rich selective shading, no text or interface. Top row: timber farmhouse with red-orange roof, centered door, glowing windows, porch and flower pots; rustic seed shop with green roof and seed sacks; mature oak with layered foliage and roots; mossy blue-gray boulders. Bottom row: the same full-body farmer in down, up, left and right directions, straw hat, blue overalls, amber shirt, brown boots and brown hair, equal scale and baseline. No smooth vector shapes, antialiasing, checkerboard or background.

## 原作实机对照

以下是官方页面的原作画面，用于展示与分析参考依据；试玩场景使用上面的新生成素材和独立代码。

- [reference-spire.jpg](reference-spire.jpg)：[《杀戮尖塔》官方商店](https://store.steampowered.com/app/646570/Slay_the_Spire/)，官方截图缩略图。
- [reference-valley.jpg](reference-valley.jpg)：[《星露谷物语》官方商店](https://store.steampowered.com/app/413150/Stardew_Valley/)。
- [reference-dungeon.jpg](reference-dungeon.jpg)：[《暗黑地牢》官方商店](https://store.steampowered.com/app/262060/Darkest_Dungeon/)。
- [reference-factory.jpg](reference-factory.jpg)：[《异星工厂》官方商店](https://store.steampowered.com/app/427520/Factorio/)。
- [reference-brothers.jpg](reference-brothers.jpg)：[《战场兄弟》官方商店](https://store.steampowered.com/app/365360/Battle_Brothers/)。

原作截图、名称及相关权利属于各自权利人。原作机制的具体资料链接与本轮近似范围还保存在 [reference.js](../reference.js) 和研究摘要中。


## v3 程序美术补充

`card-art.js` 的九种卡牌插画为本项目直接编写的 SVG 路径；地牢飞弹、枪火、圣光、治疗光束、工具挥动与土壤纹理由 Canvas 绘制。此轮沿用前述四张生成图集，没有生成新的位图素材。新版实际截图保存在 `projects/014-game-design-lab/assets/*-v3.png`。

## 设计总结总览图

`design-map.png` 与 `design-map.svg` 是本轮生成的 2400 × 2000 设计信息图。使用五张既有的原作官方截图、`summary/content.json` 的总结文字与 `summary/render-poster.py` 的确定排版；没有调用图像生成模型。`experiment-brothers.png` 是我们机制实验的实际界面截图，用于复盘，网页已标明与原作实机的区别。
