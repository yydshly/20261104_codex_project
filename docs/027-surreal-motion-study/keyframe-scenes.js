// Additional independent scene concepts; original arcade layouts remain in keyframe-data.js.
window.KEYFRAME_SCENE_STUDY = {
  "meta": {
    "title": "换一个世界，看不同的氛围。",
    "theme": "场景扩展 · 雨夜霓虹峡谷、巨树悬空栈道、冰川裂谷。保持单个骑行者与清楚的路线，比较三种环境的情绪与空间组织。",
    "common": "本组刻意改变环境、材质、照明和布局。奶油色上衣与橙色自行车只作为大致的视觉锚点；人物、配件和空间细节并非严格一致。这是三个独立场景提案，不是连续帧或单变量实验。",
    "scope": "本组交付三张原创静态关键帧；原拱廊布局组仍可切换查看。运动、视频与产品演示继续等待评阅后决定。",
    "comparisonTitle": "三种场景，分别靠什么吸引人？"
  },
  "frames": [
    {
      "id": "d",
      "label": "D",
      "title": "雨夜霓虹峡谷",
      "tagline": "冷雨、湿地与巨型楼群，带来沉浸的都市探索感。",
      "image": "assets/original-keyframes/keyframe-d-neon-canyon.png",
      "alt": "原创关键帧D：单个骑行者在左下方的湿润高架路上，巨大内倾楼群、空中连桥和雨雾向右侧暖光入口展开。",
      "mood": "神秘、沉浸、有被巨型城市包围的感觉。青蓝雨雾统领环境，少量粉色与暖光形成注意力落点。",
      "composition": "侧后方中远景；骑行者在左下，湿路向右侧暖入口弯去。近处深色立面、空中连桥与远处淡化楼群形成多个空间层次。",
      "technique": "画面利用湿地倒影重复光线、深浅雾层分离楼群，并让稀疏的亮线与路缘共同引导视线。发光感来自局部明暗和冷暖关系，不是把整张图统一提亮；雨和反射均为生成图中的静态内容。",
      "borrowed": "参考 chasing 的近景主体、城市高差与冷暖分区，以及 vortex road 中道路亮线朝远处组织注意力的方式。没有复用其楼群、路面或天空像素。",
      "original": "改为雨夜的内倾巨型城市与湿润高架路，加入跨空连桥和少量立面灯带，构造新的城市空间。",
      "tradeoff": "沉浸感和材质最强，暗部信息也最多。雨丝、灯带与反射过密时可能抢走主体；应重点看缩小后人车和路线是否仍清楚。",
      "inspect": "先看你是否能迅速找到骑行者，再顺着湿路找到右侧暖光入口。楼群的深浅变化能否让你感到空间延伸，而不是一面花墙？",
      "comparison": {
        "subjectScale": "中等大小，左下人车轮廓清楚。",
        "viewpoint": "较低的侧后方；高楼与连桥占据上方。",
        "route": "湿路由下方铺开，向右侧暖光入口弯曲。",
        "color": "青蓝与灰黑为主，粉色灯带点缀，暖光集中在路径和入口。",
        "composition": "近暗远亮、层叠连桥与内倾楼群，形成向内包围的城市峡谷。"
      },
      "prompt": "Use case: stylized-concept. Asset: one original static cinematic keyframe for a research website comparing different fantasy scenes. Create ONE complete 16:9 widescreen landscape image, ideally 2048x1152. Scene D: an impossible rainy-night vertical metropolis, a vast neon urban canyon between staggered monumental building slabs, some colossal upper structures curving and leaning inward far overhead to hint that the entire city wraps upward into the mist. A single coherent wet elevated cycling promenade runs from the lower foreground toward an amber-lit opening far away; broad continuous surface, small safe edge parapets. Exactly one cyclist in a cream jacket, charcoal trousers, riding a burnt-orange bicycle, normal anatomy and two wheels. Cyclist in lower-left third in a medium-wide three-quarter rear view, clearly identifiable but much smaller than the architecture. Strong diagonal depth, a close dark cropped foreground wall on left, mid-distance bridges and offset slabs, distant towers soften into volumetric rain mist. Lighting is cinematic cyan-blue and restrained magenta neon strips reflected in wet stone, with a small warm amber destination. Readable dark values, carefully bounded luminous light sources, rich cold-warm hierarchy, not an overexposed neon mess. Minimal futuristic facade lights, no advertising copy. Mood: immersive, mysterious, energetic invitation to continue, not horror. High-end painterly cinematic environment concept art with believable wet material and atmospheric perspective, coherent large shapes, original architectural design. Borrow only general visual ideas of a small moving subject, giant world, readable route, near/mid/far layers; do not copy a known image, film set or character. Static image, no motion blur, no drawn arrows, no UI, no text, no logos, no watermark, no panels, no extra people, traffic, cars, aircraft, multiple bicycles, broken path, floating rider, coast, stone arch corridor or cloud-sea temple. This is a new subject and environment, not a recolor of the arcade scene."
    },
    {
      "id": "e",
      "label": "E",
      "title": "巨树悬空栈道",
      "tagline": "让熟悉的树林变成巨大世界，路线沿根系延伸。",
      "image": "assets/original-keyframes/keyframe-e-giant-forest.png",
      "alt": "原创关键帧E：骑行者在右下木栈道上，栈道沿巨型树根跨越雾谷，弯向左上方的金色林间光口。",
      "mood": "安静、温暖、充满生命力。巨大根系与湿润雾谷带来奇幻尺度，林间暖光让前方显得可亲近。",
      "composition": "较高的斜俯视；骑行者在右下，木栈道沿巨根向左上弯去。左前景树干和蕨叶框景，谷底留出可读的纵深。",
      "technique": "用熟悉的小人物与粗大根系建立尺度差，以连续木板、栏杆和曲线串起路线。前景较深、远谷偏冷、上方暖光与雾层共同分开空间；光束与雾为静态生成的视觉表现。",
      "borrowed": "借鉴 grassland special 的“小主体＋巨大环境”、近中远层次与可辨路线。将弯曲空间的组织方法迁移到树根和栈道，保留探索感。",
      "original": "以活树、根系、木板和林间光口替换石质拱廊与云海；自然结构成为路线的支撑和主要奇观。",
      "tradeoff": "情绪最柔和，路线也直观；植物与树皮纹理丰富，容易变得繁杂。暖光应服务于前进方向，人物不能被枝叶淹没。",
      "inspect": "能否一眼读懂栈道如何沿巨根跨过雾谷？把人物暂时忽略后，再看回来，是否更能感到树根异常巨大？",
      "comparison": {
        "subjectScale": "右下骑行者清楚，巨树与根系仍主导整体尺度。",
        "viewpoint": "高位斜俯视；同时看见栈道、根系和谷底。",
        "route": "从右下沿巨根向左上弯曲，连续木板与栏杆帮助辨认。",
        "color": "青绿与深褐为主，金色光束集中在左上前方，谷底偏冷。",
        "composition": "巨根作为桥，近树框景，雾谷留白，路线穿过多层树干。"
      },
      "prompt": "Use case: stylized-concept. Asset: one original static cinematic keyframe for a website comparing fantasy scene directions. Create ONE complete 16:9 landscape image, ideally 2048x1152, no collage. Scene E: a primeval cathedral-scale forest of impossibly gigantic living trees, vast buttress roots bridging an open deep emerald mist-filled ravine. A clear broad wood-plank cycling boardwalk is carefully built along the top of one enormous gently curving root, with slim simple low wooden edge rails. This continuous rideable route enters the lower-right foreground, bends toward the center through giant trunks and disappears into a soft warm sunlit canopy opening at upper-left distance. Exactly one small cyclist in a cream jacket and charcoal trousers riding a burnt-orange bicycle, clearly human with coherent posture and two wheels, seen from rear above in the lower-right/mid-right area. High oblique wide viewpoint showing the top of the route and the huge drop beside it; one close trunk or a fern silhouette frames the far-left edge without blocking the cyclist. Distinct near roots, middle boardwalk and far canopy layers. Humid moss, rough ancient bark, delicate ferns, a few soft suspended motes only. Mood: serene, alive, enchanted, invitation to explore. Green-blue cool forest shade, pale golden late afternoon shafts through leaves, selective warm rim light on path, readable shadows, restrained saturation, detailed organic materials, high-end cinematic painterly environment concept art, no fairy-tale cartoon. Massive scale is communicated by the tiny cyclist and immense roots, not by a random giant creature. No architecture resembling stone arches, no houses, city, sea, waterfalls dominating composition, aircraft, animals, extra people, duplicated bicycles, unreadable disconnected path, text, labels, UI, logos, watermark or panels. Static original keyframe, no promised actual moving camera, no motion blur."
    },
    {
      "id": "f",
      "label": "F",
      "title": "冰川裂谷",
      "tagline": "用明亮冰壁、暗色道路和远处晨光，建立清澈的空间感。",
      "image": "assets/original-keyframes/keyframe-f-glacier-rift.png",
      "alt": "原创关键帧F：骑行者位于左下暗石路上，蓝色冰壁环抱裂谷，上方冰檐框景，路线通向右侧粉金色晨光。",
      "mood": "清澈、辽阔、静谧。冰川的蓝色层次与远处柔和暖光形成冷冽而有方向的探索感。",
      "composition": "较高的侧后方广角取景；骑行者在左下，暗色石路弯向右侧远方。左侧巨大冰壁与右上冰檐包围空间，中部裂谷拉开高差。",
      "technique": "通过暗路与浅冰的明暗分离保持路线可读，以冰层纹理、局部蓝色亮区和远处雾化表现冰的厚度与空间。暖灯串起路径，右侧晨光提供落点；未实现物理透射材质、实时三维或 HDR 显示。",
      "borrowed": "借鉴 grassland special 的环抱空间、高差与小主体尺度关系，并保留 vortex road 中路线朝主要视觉终点收束的思路。原作海岸和旋转天空都未直接使用。",
      "original": "创建冰川裂谷、暗色石质通道与晨光出口，以冰壁和冰檐重新组织包围感，保留宽阔连续路面。",
      "tradeoff": "画面最明亮、路线的明暗分区最直观。冰面大面积浅色，继续加曝光可能削弱纹理；也要判断环境是否过于平静。",
      "inspect": "能否不靠箭头读出石路连续通向远方？冰壁与道路的亮暗分离，是否让巨大空间比单纯增亮更清楚？",
      "comparison": {
        "subjectScale": "左下人车可读，相对于巨大冰壁仍显得很小。",
        "viewpoint": "偏高的侧后方广角；桥面、冰壁与裂谷同时可见。",
        "route": "暗色通道由左下弯向右侧晨光，暖色路径灯连续引导。",
        "color": "浅青、钴蓝与淡紫为主，少量琥珀灯与粉金晨光。",
        "composition": "冰壁环抱、右上冰檐框景，暗色路径在浅色环境中收束。"
      },
      "prompt": "Use case: stylized-concept. Asset: one original cinematic static keyframe for a fantasy scene comparison website. Generate ONE complete 16:9 widescreen landscape image, ideally 2048x1152, not a collage. Scene F: an immense luminous blue glacial rift whose translucent sculpted ice cliffs curl inward and upward like the walls of a frozen amphitheater; one huge natural ice overhang partly frames the upper-right edge. The glacial walls are fantastically tall with fine layered strata, the route remains horizontal and plausible. A broad dark basalt cycling causeway enters the lower-left foreground, sweeps gently across mid-frame toward a distant golden-pink dawn gap on the right. The continuous dark path has low safety edges with sparse inset amber guide lights; contrast makes the way forward clearly readable against pale cyan ice. Exactly one small cyclist in a cream jacket and charcoal trousers riding a burnt-orange bicycle, viewed from behind-left, located low left of center with normal posture and coherent wheels. Wide moderately elevated three-quarter viewpoint, several spatial layers of close ice, middle causeway, distant glacier gap and faint mountains; delicate suspended cold mist emphasizes depth. Mood: still, crystalline, expansive, wonder rather than danger. Pale cyan and cobalt ice, lavender shaded crevasses, restrained warm dawn on the horizon and small path lights; soft diffused illumination with readable ice texture and no blank clipped white highlights. High-end cinematic painterly environmental concept art with believable translucent ice and basalt, precise hierarchy, original natural forms. No city, timber forest, stone arch corridor, cloud sea temple, giant portals with glyphs, water flooding the path, people besides the one cyclist, animals, vehicles, duplicated bikes, broken or vertical riding surface, text, arrows, interface, labels, logos, watermark or panels. Not motion, not actual HDR delivery. A self-contained new scene that borrows only scale contrast, a clear route and cold-warm visual organization."
    }
  ]
};
window.KEYFRAME_GROUPS = [
  { id: 'scene-expansion', label: '新场景 · D / E / F', study: window.KEYFRAME_SCENE_STUDY },
  { id: 'arcade-layouts', label: '拱廊布局 · A / B / C', study: window.KEYFRAME_STUDY }
];
