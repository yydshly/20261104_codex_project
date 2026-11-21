// Creative capability atlas; observed, static and proposed evidence are distinct.
window.CAPABILITY_ATLAS = {
  "meta": {
    "title": "画面、动作与相机：可组合的表现能力。",
    "lead": "把原片已经呈现的关系、静态关键帧已探索的方向，以及可以继续扩展的控制项放进同一张能力地图。每项记录能改变什么、可能形成什么感受，以及依据在哪里。",
    "scope": "当前沉淀研究与静态场景，不生成运动或产品演示。动态条目是创作设计目标，尚不等于已稳定实现的控制能力。",
    "statusLegend": {
      "observed": "原片观察：已有画面或时间样本支持；具体算法和物理参数仍可能未知。",
      "static": "静态已探索：原创关键帧或同帧教学图已经呈现；动态连续性尚未验证。",
      "proposed": "扩展待验证：可继续研究的创作设想，尚未由本项目的运动样片验证。"
    }
  },
  "dimensions": [
    {
      "id": "space",
      "title": "画面与空间组织",
      "intro": "决定第一眼能读出怎样的世界，以及主体、路线和奇观如何占据画面。",
      "entries": [
        {
          "id": "scale-contrast",
          "title": "小主体与巨大环境",
          "effect": "用熟悉的人车尺寸衬托环境的异常规模，可形成宏大与惊叹。",
          "controls": "主体画面占比、地标尺寸、近景参照物、环境留白。",
          "evidence": "grassland special 0.10 秒：左下小骑行者与巨大海湾、崖壁和建筑同框。",
          "status": "observed",
          "extension": "可迁移到巨根、冰壁、风塔、废墟；需保留主体可读性。",
          "links": [
            {
              "label": "原片空间拆解",
              "href": "#coast"
            },
            {
              "label": "原创场景对比",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "curved-enclosure",
          "title": "弧形、环抱与卷曲空间",
          "effect": "让环境包围行动路线，可能产生凹深、失重或被世界围住的观感。",
          "controls": "弯曲方向、包围程度、路面与背景的连接方式、重力参照。",
          "evidence": "grassland special 0.10 秒已有弧形海湾；vortex road 3.00 秒道路、城市和螺旋天空共同构成异常空间。新参考 The Divine Multiverse 0.10 秒已有巨大环形结构，未观察到从平地卷起。",
          "status": "observed",
          "extension": "扩展到螺旋高架、冰川环壁、上下倒置街区；地面由平变卷的动画仍未确认。",
          "links": [
            {
              "label": "弯曲海岸",
              "href": "#coast"
            },
            {
              "label": "漩涡原片",
              "href": "#sources"
            },
            {
              "label": "巨环城市对照",
              "href": "#comparison"
            }
          ]
        },
        {
          "id": "depth-layers",
          "title": "近中远层次与遮挡",
          "effect": "让复杂世界具有可读深度，也可组织从局部到全貌的发现。",
          "controls": "前景遮挡面积、中景路线、远景清晰度、层间尺度差。",
          "evidence": "grassland special 0.10 秒草坡、海湾和对岸分层；chasing 2.00 秒近立面、屋顶与下方城市同时可见。新参考 The Divine Multiverse 的街道、近楼、远城与上方巨环形成层次。",
          "status": "observed",
          "extension": "可增加近树、门柱、冰檐或雾层，比较框景与遮挡过多的取舍。",
          "links": [
            {
              "label": "原片动作抽帧",
              "href": "#motion"
            },
            {
              "label": "静态关键帧",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "route-destination",
          "title": "路线、引导线与视觉终点",
          "effect": "让观众知道主体往哪走，并期待远处会出现什么。",
          "controls": "路线曲率、消失方向、灯带密度、终点位置与亮度。",
          "evidence": "vortex road 3.00 秒：车道、护栏和红色光轨朝远处组织；grassland special 6.87 秒前方小径更清楚。",
          "status": "observed",
          "extension": "路线可通向暖灯站、雾中巨门或开放天空；终点不必总在画面正中。",
          "links": [
            {
              "label": "原片回放",
              "href": "#motion"
            },
            {
              "label": "场景与布局",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "layout-balance",
          "title": "轴线、对角、曲线与留白",
          "effect": "用不同布局改变庄严、贴近、开放或漂浮的观看倾向。",
          "controls": "对称程度、主体落点、路线方向、空白区域和重心。",
          "evidence": "原创 A 为近乎对称的直轴；B 为左下主体与右上落点；C 为曲路、左上框景与云海留白。 新补G探索低地平线与大留白，I探索重复矩形门框，K探索暖光落点，L探索门内外框景。",
          "status": "static",
          "extension": "可在同类世界中继续研究横向展开、偏置落点、低地平线或封闭画框。",
          "links": [
            {
              "label": "A/B/C 布局组",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "spatial-constraints",
          "title": "路线宽度、高差与行动约束",
          "effect": "让空间具有可想象的行动后果，可能影响紧张、自由与安全感。",
          "controls": "可骑行宽度、可见落差、护栏、主体是否依赖路面。",
          "evidence": "chasing 1.00–3.20 秒：骑行者依赖屋顶路线，下方城市高差持续可见。",
          "status": "observed",
          "extension": "可比较开阔路径、临边通道或可飞离边缘的主体；情绪会随行动能力改变。",
          "links": [
            {
              "label": "临边原片分析",
              "href": "#motion"
            }
          ]
        }
      ]
    },
    {
      "id": "action",
      "title": "主体动作",
      "intro": "研究身体和车辆在做什么。动作的可读性、力度与重复方式，需要放在时间里看。",
      "entries": [
        {
          "id": "pedal-pattern",
          "title": "踩踏姿态与可见重复",
          "effect": "重复的身体活动可为画面提供生命感与行动节律。",
          "controls": "膝脚姿态、动作幅度、重复稳定性、停踩与恢复。",
          "evidence": "grassland special 2.00–4.20 秒密集样本中，膝、脚与身体姿态反复变化；没有测得可靠踏频。",
          "status": "observed",
          "extension": "扩展轻踩、积极踩踏和短暂停踩，但要检查脚、曲柄与车轮的连续性。",
          "links": [
            {
              "label": "动作密集抽帧",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "body-lean",
          "title": "放松与前俯姿态",
          "effect": "姿态可表达轻松、专注或用力的观感。",
          "controls": "躯干前倾、肩部高度、手臂弯曲、身体紧绷程度。",
          "evidence": "chasing 1.00–3.20 秒，主体持续保持前俯骑姿，人车与屋顶路面关系可读。",
          "status": "observed",
          "extension": "同类构图可探索直立放松、前俯推进或起身用力；姿态不等于真实运动强度。",
          "links": [
            {
              "label": "chasing 原片观察",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "motorcycle-lean",
          "title": "摩托倾身与过弯关系",
          "effect": "车身、身体与道路弯曲配合，可形成操控、转向与失衡的观看感受。",
          "controls": "倾身方向、弯道曲率、姿态变化时机、路线可读性。",
          "evidence": "vortex road 1.00–3.20 秒是摩托行进，身体和车身姿态随道路关系变化；不适用自行车踩踏分析。",
          "status": "observed",
          "extension": "可研究轻倾、连续弯或转弯后回正，避免把全部扭转归给相机。",
          "links": [
            {
              "label": "摩托原片观察",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "coasting",
          "title": "轻踩、滑行与动作放松",
          "effect": "从主动踩踏转为滑行，可作为舒展、凝视或接近目的地的表现。",
          "controls": "停踩时机、脚部位置、身体放松程度、滑行持续段。",
          "evidence": "当前三条原片记录尚未独立确认清楚的停踩滑行段。",
          "status": "proposed",
          "extension": "可用于盐湖、巨树栈道或暖灯站；需让持续前进与脚部暂停同时可信。",
          "links": [
            {
              "label": "动作与情绪组合",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "effort-phases",
          "title": "用力、恢复与站立踩踏",
          "effect": "身体起伏与动作段落可表达阻力、坚持和突破。",
          "controls": "坐姿或站姿、发力幅度、短段用力、恢复的时机。",
          "evidence": "当前已核对的样本不足以确认稳定的站立踩踏、发力或恢复周期。",
          "status": "proposed",
          "extension": "可扩展逆风通道、缓坡与风雪段；关注身体、车把、重心和路面的协调。",
          "links": [
            {
              "label": "风雪等创作组合",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "interaction-actions",
          "title": "转向、避让与通过门槛",
          "effect": "让主体对环境作出反应，使世界从背景变成可行动的空间。",
          "controls": "转向幅度、触发位置、前方障碍、反应与恢复的时间。",
          "evidence": "现有素材支持沿路行进与观看关系变化；明确避让、跳跃和落地尚未独立核验。",
          "status": "proposed",
          "extension": "可研究绕柱、穿门、跨小坎或短暂回望；每次保留清楚的动作起因和结果。",
          "links": [
            {
              "label": "原片与动作边界",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "subject-locomotion",
          "title": "步行、跑动、攀爬与飞行替换",
          "effect": "通过不同的身体行动和载具约束，扩展轻松、用力、临边或自由移动的表现。",
          "controls": "主体类型、接触面、步态与姿态、行动限制、与路线的关系。",
          "evidence": "当前独立核对的是两条自行车和一条摩托片段；其他主体动作尚未在本项目验证。",
          "status": "proposed",
          "extension": "可迁移到步行、跑动、攀爬或飞行，但需重新判断动作与空间的配合，不能直接继承骑车的情绪。",
          "links": [
            {
              "label": "原片主体动作",
              "href": "#motion"
            }
          ]
        }
      ]
    },
    {
      "id": "camera",
      "title": "相机与观看关系",
      "intro": "先描述画面呈现的景别、方位与相对变化；真实器材、焦距和运动路径不由抽帧唯一确定。",
      "entries": [
        {
          "id": "shot-scale",
          "title": "远景展示与近景代入",
          "effect": "远看让世界占主导，接近让身体与路线更可读。",
          "controls": "人物画面占比、环境保留量、相对距离变化。",
          "evidence": "grassland special 0.10→2.00 秒，人车从很小变得显著更大。",
          "status": "observed",
          "extension": "可扩展保持远景、缓慢接近、先近后远或局部揭示；需区分推进、变焦和主体接近。",
          "links": [
            {
              "label": "景别与空间变化",
              "href": "#coast"
            }
          ]
        },
        {
          "id": "viewing-azimuth",
          "title": "侧面、侧后与背后",
          "effect": "观看方位改变观众是在看行动者，还是跟着行动者看前方。",
          "controls": "主体朝向、可见身体侧面、前方路线占比、转到背后的过程。",
          "evidence": "grassland special 开场接近侧面远景，2.00 秒侧后关系增强，6.87 秒更接近背后。",
          "status": "observed",
          "extension": "可研究侧向并行、侧后跟随、正后方或迎面接近；方位设计不代表已具备环绕镜头控制。",
          "links": [
            {
              "label": "观看关系拆解",
              "href": "#coast"
            }
          ]
        },
        {
          "id": "camera-height",
          "title": "低位、平视与高位斜看",
          "effect": "观看高度可强化压迫、身体感、路线可读性或世界全貌。",
          "controls": "地平线位置、可见路面、俯仰角度、人物与背景的遮挡。",
          "evidence": "原创 B 采用较低的侧后近景；C、E、F 等关键帧探索了较高斜视及路面与高差同框。",
          "status": "static",
          "extension": "可拓展贴路低位、高位巡游或从高到低的观看变化；动态连续性尚未制作。",
          "links": [
            {
              "label": "静态观看位置对比",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "relative-follow",
          "title": "跟随稳定性与相对速度",
          "effect": "人物相对稳定时，周围世界的变化更容易被读成持续前进。",
          "controls": "主体在画面中的漂移、跟随距离、近景流动与相对接近。",
          "evidence": "三原片均围绕行进主体展开；grassland special 2.00–4.20 秒人物大小也会变化，并非固定距离跟拍。",
          "status": "observed",
          "extension": "可比较稳定跟随、逐渐落后、追近或侧向超越；避免把镜头速度与真实车速混同。",
          "links": [
            {
              "label": "相对运动观察",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "occlusion-reveal",
          "title": "遮挡、穿过与空间揭示",
          "effect": "让新的空间信息在行动中显露，可能形成期待、发现与释放。",
          "controls": "前景遮挡物、显露时机、揭示前后的景别和亮暗关系。",
          "evidence": "grassland special 2.00→6.87 秒，新的草坡与前方路径显露，主建筑逐步退出取景。The Divine Multiverse 0.10→10.00 秒近楼退出，更多屋顶与远城显露；没有呈现穿过巨环。",
          "status": "observed",
          "extension": "可扩展穿门后开阔、绕柱见远景或雾层渐开；静态起止图不能证明揭示节奏。",
          "links": [
            {
              "label": "时间展开分析",
              "href": "#coast"
            },
            {
              "label": "雾中巨门组合",
              "href": "#motion"
            },
            {
              "label": "新参考前后抽帧",
              "href": "#comparison"
            }
          ]
        },
        {
          "id": "frame-rotation",
          "title": "侧倾与世界旋向",
          "effect": "画面方向和空间参照发生变化，可引出失重或被吸入的观感。",
          "controls": "地平线倾斜、道路与背景相对方向、转动幅度和恢复。",
          "evidence": "vortex road 1.00–3.20 秒道路、城市和天空的相对关系持续变化；实际相机滚转未知。",
          "status": "observed",
          "extension": "可研究克制侧倾、随弯倾转、反向背景旋动或回正；先保留可辨路线。",
          "links": [
            {
              "label": "vortex road 回放",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "travel-paths",
          "title": "横移、环绕与升降",
          "effect": "让观众从主体侧面、周围或上方认识空间，探索并列、环绕揭示或逐步展开的观看方式。",
          "controls": "移动方向、路径曲率、绕行角度、相机高度变化、主体是否保持画面落点。",
          "evidence": "现有素材支持观看关系变化，未确认作者实际使用横移轨道、完整环绕或独立升降镜头。",
          "status": "proposed",
          "extension": "可比较平行侧跟、绕主体看世界、越过遮挡升高看全貌；保持主体与路线可读。",
          "links": [
            {
              "label": "原片观看关系",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "approach-vs-zoom",
          "title": "推进、后退与变焦的区别",
          "effect": "围绕接近、远离和环境保留量研究不同的画面展开方式。",
          "controls": "相机位置变化、画面视野、主体占比、前后景相对变化；各项分开记录。",
          "evidence": "grassland special 的主体大小明显改变，但不能唯一分离推近、变焦、人物运动或生成形变。",
          "status": "proposed",
          "extension": "把推进、后退、纯视野变化作为不同创作目标，避免把所有放大都叫推镜头。",
          "links": [
            {
              "label": "空间与镜头边界",
              "href": "#coast"
            }
          ]
        },
        {
          "id": "focus-depth",
          "title": "焦点、景深与清晰度层次",
          "effect": "通过谁清楚、谁模糊以及焦点转移，让注意力从主体移到目的地或相反。",
          "controls": "清晰区域、模糊程度、焦点落点、转移时机；与景别和相对运动分开研究。",
          "evidence": "当前项目尚未独立验证原片是否采用焦点转移，也没有复原镜头光学或景深参数。",
          "status": "proposed",
          "extension": "可研究背景保持可读、主体优先、从人车转向远方地标等注意力变化。",
          "links": [
            {
              "label": "关键帧的清晰度关系",
              "href": "#keyframes"
            }
          ]
        }
      ]
    },
    {
      "id": "look",
      "title": "光色、材质与天气",
      "intro": "组织亮暗、颜色与空气感，让同一空间呈现不同气氛；静态外观与真实渲染实现分开记录。",
      "entries": [
        {
          "id": "brightness-hierarchy",
          "title": "曝光与亮度主次",
          "effect": "通过主体、环境和高光的相对亮度组织第一眼注意力。",
          "controls": "整体增益、阴影与中间调、亮部上限、局部明暗关系。",
          "evidence": "已有同一海岸帧的 +1 EV 教学变体；显示草坡、人物与云层一起变亮的结果。",
          "status": "static",
          "extension": "可研究局部提亮、亮点落位和暗环境中的主体分离；教学增量不是作者曝光设置。",
          "links": [
            {
              "label": "同帧曝光对照",
              "href": "#color"
            }
          ]
        },
        {
          "id": "warm-cool",
          "title": "冷暖分区与情绪色调",
          "effect": "让不同区域各有角色，可形成温暖目的地、冷环境或强烈奇幻感。",
          "controls": "主色与点缀色、冷暖面积、暖光位置、色温关系。",
          "evidence": "chasing 2.00 秒粉橙天空与蓝紫屋顶、暖窗分区清楚；vortex road 3.00 秒红蓝关系强烈。",
          "status": "observed",
          "extension": "可拓展暖环境中的冷出口、低饱和冷调或单点暖光；色彩感受依赖整体搭配。",
          "links": [
            {
              "label": "三原片光色",
              "href": "#sources"
            },
            {
              "label": "调色分析",
              "href": "#color"
            }
          ]
        },
        {
          "id": "saturation-range",
          "title": "饱和度、色相与色域",
          "effect": "增强颜色区分，也会影响材质感与画面负担。",
          "controls": "颜色偏离中性程度、局部饱和度、主次色、输出色域。",
          "evidence": "已有同一帧 ×1.4 饱和度教学实验，记录了颜色越界与裁切的副作用。",
          "status": "static",
          "extension": "可比较高饱和奇幻、克制配色或局部彩色强调；不能把越艳等同于越有效。",
          "links": [
            {
              "label": "同帧饱和度对照",
              "href": "#color"
            }
          ]
        },
        {
          "id": "material-light-response",
          "title": "湿反光、透亮与粗糙材质",
          "effect": "材质的亮暗与纹理关系可让世界更湿润、冰冷、柔和或坚硬。",
          "controls": "反射区域、纹理尺度、粗糙观感、边缘透亮与高光位置。",
          "evidence": "原创 D 探索湿路倒影，E 探索树皮与木板，F 探索冰层透亮；均为静态生成画面。",
          "status": "static",
          "extension": "可扩展镜面盐湖、磨砂冰、金属或半透明表面；尚未实现对应物理材质或实时反射。",
          "links": [
            {
              "label": "D/E/F 静态场景",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "atmosphere-weather",
          "title": "雾、雨、光束与风雪",
          "effect": "空气层和天气可分开空间，也可表达安静、阻力、神秘或开阔。",
          "controls": "可见距离、雾层深浅、雨雪密度、光束方向、近远遮挡。",
          "evidence": "原创D呈现雨雾，E呈现林间光与雾谷，F呈现冰谷薄雾，新补J呈现风雪；均为静态画面，天气运动未验证。",
          "status": "static",
          "extension": "可扩展逆风雪、雾层开合、尘埃或叶影；天气不能遮掉主体和路线。",
          "links": [
            {
              "label": "场景外观探索",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "hdr-headroom",
          "title": "HDR 与高光余量",
          "effect": "让发光区域与普通表面保持更宽的显示亮度关系。",
          "controls": "色彩管理、输出格式、映射、目标显示链路与高光设计。",
          "evidence": "三份原片变体带 BT.2020/HLG 信令；作者确认 HDR 与 DaVinci 调色。SDR 抽帧不能展示真实峰值。",
          "status": "observed",
          "extension": "可在明确交付环境后研究 HDR；普通 PNG/JPEG 增亮不等于真实 HDR，也不能恢复丢失细节。",
          "links": [
            {
              "label": "HDR 证据与机制",
              "href": "#color"
            },
            {
              "label": "作者回复",
              "href": "#sources"
            }
          ]
        }
      ]
    },
    {
      "id": "rhythm",
      "title": "时间与视觉节律",
      "intro": "把身体、路线、观看关系和环境事件的时间尺度分开，研究它们怎样配合。",
      "entries": [
        {
          "id": "action-recurrence",
          "title": "身体动作的重复与停顿",
          "effect": "重复可提供行动脉搏，停顿或变化可形成段落。",
          "controls": "动作周期的可见性、均匀程度、重复次数、停顿位置。",
          "evidence": "grassland special 2.00–4.20 秒可见膝脚姿态反复变化；尚未形成可靠的完整周期计数。",
          "status": "observed",
          "extension": "可探索均匀、渐密、断续或停踩，但不能由 0.20 秒离散图直接给真实 RPM。",
          "links": [
            {
              "label": "密集动作样本",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "apparent-travel",
          "title": "前进与速度变化的观感",
          "effect": "持续前进可形成探索动力，变化可带来推进或放松。",
          "controls": "单位时间内的路线变化、主体与地标关系、快慢段落。",
          "evidence": "三原片都围绕车辆前进组织；空间尺度与生成一致性不足，未换算真实速度。",
          "status": "observed",
          "extension": "可拓展轻缓、冲刺、减速接近或匀速巡游；踩踏频率与车速应分别设计。",
          "links": [
            {
              "label": "原片原速回放",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "foreground-events",
          "title": "近景掠过与环境事件间隔",
          "effect": "草、门柱、灯带等反复经过，可以形成不依赖踩踏的视觉拍点。",
          "controls": "近景密度、物体间隔、路线与观看位置、经过频率。",
          "evidence": "chasing 1.00–3.20 秒屋顶物体显露和遮挡变化；vortex road 同段引导线与护栏关系持续变化。",
          "status": "observed",
          "extension": "可拓展重复门洞、路灯、树干或窗格；环境拍点、主体动作和音乐节拍不必相同。",
          "links": [
            {
              "label": "环境节律观察",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "camera-tempo",
          "title": "接近、转向与显露的时序",
          "effect": "相同空间可通过观看节奏呈现平稳、急迫或逐渐发现的感受。",
          "controls": "接近发生的时段、视角转变速度、停留与揭示先后。",
          "evidence": "grassland special 0.10→2.00 秒明显相对接近，后续逐渐转到背后并显露路线。",
          "status": "observed",
          "extension": "可扩展先远后近、先遮后露或先快后稳；不将这些描述当作已知相机动画曲线。",
          "links": [
            {
              "label": "相对接近与跟随",
              "href": "#coast"
            }
          ]
        },
        {
          "id": "emotional-phases",
          "title": "积累、变化与释放段落",
          "effect": "让短片具有一次可读的感受变化，而非持续堆积刺激。",
          "controls": "平稳段、动作变化点、空间揭示点、结尾停留。",
          "evidence": "已有三原片观察支持提出段落解释；本项目尚未独立验证具体情绪曲线。",
          "status": "proposed",
          "extension": "可研究从封闭到开阔、用力后恢复、冷环境到暖目的地等结构。",
          "links": [
            {
              "label": "动作与情绪组合",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "loop-seam",
          "title": "持续观看与首尾循环",
          "effect": "首尾关系可影响重复观看是否自然，或是否需要明确结尾。",
          "controls": "起止主体位置、朝向、背景关系、动作相位和声音衔接。",
          "evidence": "三条参考开头与结尾在主体或背景关系上不同，本项目未确认无缝循环。",
          "status": "proposed",
          "extension": "可研究自然结束、淡出或真正的首尾接缝；约7秒只是时长，不代表已经可循环。",
          "links": [
            {
              "label": "原片与边界",
              "href": "#sources"
            }
          ]
        }
      ]
    },
    {
      "id": "sound-edit",
      "title": "声音与剪辑扩展",
      "intro": "这组是可继续研究的维度。当前没有完成音乐听辨、BPM 或声画卡点核对。",
      "entries": [
        {
          "id": "music-event-alignment",
          "title": "音乐节拍与视觉事件",
          "effect": "重拍与过门洞、过弯或显露奇观的配合，可能强化期待和落点。",
          "controls": "音乐段落、重拍位置、视觉事件时刻、呼应或错开。",
          "evidence": "目前尚未核验三原片的 BPM、重拍或同步关系。",
          "status": "proposed",
          "extension": "可研究动作、环境事件和音乐三者的对位，也可刻意错开以保留松弛感。",
          "links": [
            {
              "label": "时间变量说明",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "environmental-sound",
          "title": "环境声与空间气氛",
          "effect": "雨、风、树叶、回声等声音可补充温度、距离和空间感。",
          "controls": "声源种类、远近层次、密度、响度和静默区域。",
          "evidence": "D/E/F 静态图提供雨夜、森林和冰谷的环境方向，尚未为其制作或验证环境音。",
          "status": "proposed",
          "extension": "可拓展雨打路面、树叶沙沙、空旷风声或门洞回声；避免所有声源同时突出。",
          "links": [
            {
              "label": "静态场景方向",
              "href": "#keyframes"
            }
          ]
        },
        {
          "id": "body-vehicle-sound",
          "title": "身体与车辆声音",
          "effect": "链条、轮胎、呼吸或发动机等声音，可影响身体感与动力感。",
          "controls": "声源选择、重复节律、与动作的相位、声音距离。",
          "evidence": "三原片尚未完成对应声音的独立听辨；vortex road 的车辆是摩托。",
          "status": "proposed",
          "extension": "自行车可研究踩踏与滑行差异，摩托可研究动力与转弯的呼应；不要混用机械来源。",
          "links": [
            {
              "label": "主体与车辆类型",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "sound-contrast",
          "title": "声画一致与反差",
          "effect": "声音可以贴合画面，也可用反差形成陌生、安慰或悬念。",
          "controls": "明亮或低沉音色、密集或稀疏、环境声与音乐的比例。",
          "evidence": "尚未对原片音色情绪作可靠归类，也未完成反差声音实验。",
          "status": "proposed",
          "extension": "可研究宏大画面配稀疏声音、危险环境配平静声场等关系，结果需实际观看判断。",
          "links": [
            {
              "label": "情绪解释与待验证项",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "reveal-audio-shape",
          "title": "揭示前后的声音变化",
          "effect": "从遮蔽到开阔时的声音密度、空间感或短暂留白，可能加强释放。",
          "controls": "揭示前的积累、通过门槛的时刻、揭示后的停留与声场变化。",
          "evidence": "雾中巨门等属于扩展场景方向；本项目尚未制作其声音或运动。",
          "status": "proposed",
          "extension": "可把视觉显露与声音进入、减弱或留白配合，避免直接套用固定高潮公式。",
          "links": [
            {
              "label": "雾中巨门等组合",
              "href": "#motion"
            }
          ]
        },
        {
          "id": "cutting-continuity",
          "title": "连续展开与剪辑节奏",
          "effect": "镜头持续与切换方式影响空间连贯、身体代入和信息密度。",
          "controls": "单段持续时长、切点、景别关系、动作衔接与过渡方式。",
          "evidence": "原片研究集中于同一主体与路线的时间展开，尚未核验隐藏转场，也未做多镜头剪辑实验。",
          "status": "proposed",
          "extension": "可拓展连续观看、少量景别切换或揭示式转场；先记录是否损害路线与空间理解。",
          "links": [
            {
              "label": "原片时间展开",
              "href": "#coast"
            },
            {
              "label": "研究范围",
              "href": "#motion"
            }
          ]
        }
      ]
    }
  ],
  "combinations": [
    {
      "title": "自由与舒展",
      "items": [
        "开阔留白",
        "轻踩与滑行设想",
        "较远、稳定的观看关系",
        "稀疏环境事件",
        "克制声音"
      ],
      "feeling": "希望让观众放松地前进，适合盐湖或开阔天空方向。",
      "status": "proposed"
    },
    {
      "title": "宏大与惊叹",
      "items": [
        "小主体与巨物尺度",
        "近中远层次",
        "远景展示",
        "逐渐显露新空间",
        "清楚的视觉落点"
      ],
      "feeling": "先读到世界尺度，再跟随主体进入；静态尺度已有依据，完整情绪段落尚待验证。",
      "status": "proposed"
    },
    {
      "title": "推进与代入",
      "items": [
        "可读的前俯身体",
        "较近侧后观看",
        "连续路线",
        "近景掠过",
        "动作与环境节律分开设计"
      ],
      "feeling": "希望感到自己正跟着行动者前进，原片提供姿态与观看关系的参照。",
      "status": "proposed"
    },
    {
      "title": "紧张与受控失重",
      "items": [
        "可见高差或曲路",
        "主体对路线的依赖",
        "倾身与转向设想",
        "克制画面侧倾",
        "保留前进方向"
      ],
      "feeling": "用空间约束和方向变化形成紧张，同时维持路线可读。",
      "status": "proposed"
    },
    {
      "title": "重复与催眠",
      "items": [
        "重复门洞或灯带",
        "主体画面占比较稳",
        "规律的环境经过",
        "稳定动作设想",
        "音乐对位待研究"
      ],
      "feeling": "希望形成期待下一个重复事件的观看牵引，而非单纯加快画面。",
      "status": "proposed"
    },
    {
      "title": "抵抗、发现与释放",
      "items": [
        "前俯用力或持续前进设想",
        "封闭与遮挡",
        "远处亮出口",
        "由密到疏的事件结构",
        "声音段落待研究"
      ],
      "feeling": "可向风雪通道、暮色暖灯站或雾中巨门扩展；动作和情绪结果仍未验证。",
      "status": "proposed"
    }
  ],
  "limits": [
    "这是一份创作表现能力谱系，不是模型或三维引擎的已实现功能清单。设计变量能否稳定控制，需要另行验证。",
    "原片观察主要来自三条已核对代表作及密集抽帧；其余历史条目的描述不能自动升级为同等证据。",
    "静态图可以呈现空间、姿态与光色方向，不能证明踩踏、镜头、天气、声音或循环在时间上成立。",
    "真实踏频、车速、焦距、相机轨迹和音乐BPM尚未知；相对大小、近景流动与画面侧倾不能互相替代。",
    "HDR信令与作者回复支持使用HDR的判断，普通SDR图不能展示真实峰值亮度或还原母版参数。",
    "情绪描述是视觉解释或创作目标，受动作、场景、声音及个人体验共同影响，尚未建立单一因素的因果结论。"
  ]
};
