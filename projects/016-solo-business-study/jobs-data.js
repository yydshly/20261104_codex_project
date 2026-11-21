// Static research data, prepared from the saved 2026-11-21 audit. No live collection.
window.STUDY_JOBS = {
  "window": {
    "start": "2026-11-14T14:34:00+08:00",
    "end": "2026-11-21T14:34:00+08:00",
    "label": "2026.11.14 14:34 — 11.21 14:34",
    "timezone": "Asia/Shanghai（UTC+8）",
    "observedDate": "2026-11-21",
    "kind": "一次公开来源快照"
  },
  "scope": {
    "audience": "居住中国大陆的开发者",
    "included": "软件、前后端、移动端、数据、基础设施/DevOps/SRE、ML、安全工程；含动手做技术的负责人。",
    "excluded": "纯管理、销售、人工测试、非编程内容制作、线下与混合办公。",
    "definition": "仅将公开地域条件有明确兼容文字、时间符合窗口且职业范围吻合的条目计为核心机会。",
    "limitations": [
      "这是一次当前公开岗位快照；已下架的历史条目不在快照里，不能据此估计全市场周新增量。",
      "地域文字兼容不等于雇主确认可雇佣/签约中国大陆居民，也不等于岗位真实性、招聘进度或个人资历已核实。",
      "本轮没有投递、联系雇主、登录或绕过验证码；中国签约已确认数为 0，含义是未完成雇主确认，不是已证实全部不能雇佣。",
      "Ashby 日期为最近发布；聚合职位板日期可能是转载/重发，不能一律称为首次新增。",
      "Automattic / PostHog 缺少可核日期；Elastic 列表未取得；均保留未知，不能填 0。",
      "电鸭有 4 篇七天边界相对时间未解；Remote OK / WWR 未证明完整七天历史。",
      "匿名多岗合集缺少雇主标识，疑似重复只能标记，不能算出精确去重岗位总数。"
    ],
    "unknownLabel": "未知／未取得，不能按 0 处理",
    "confirmedLabel": "0 项完成雇主中国签约确认（本轮未联系雇主）"
  },
  "summary": {
    "companiesSelected": 15,
    "companiesReadable": 14,
    "companiesDateAuditable": 12,
    "currentPublicEntries": 1060,
    "recentAllRolePublicationEntries": 103,
    "corporateEligible": 5,
    "coreGeographicOpportunities": 9,
    "communityEligible": 2,
    "supplementalBoardEligible": 2,
    "specialProjects": 1,
    "confirmedChinaContracts": 0,
    "verdict": "暂不做面向中国开发者的岗位聚合＋付费提醒。",
    "headline": "本轮找到 9 项地域文字符合的机会，尚无雇主中国签约确认。",
    "explanation": "核心 9 项＝企业 5＋电鸭 2＋补充职位板 2；DMA 外包另列。供给偏少、资历差异大，分类和核验成本高；免费原始入口仍可访问，单靠整理提醒尚无付费成立证据。",
    "decisionKind": "基于此样本的产品判断，非整个远程招聘市场的结论",
    "cards": [
      {
        "value": 15,
        "label": "企业样本",
        "detail": "14 家列表可读；12 家日期可核"
      },
      {
        "value": 1060,
        "label": "当前企业发布条目",
        "detail": "全部职能的当前存量；不是可投开发岗"
      },
      {
        "value": 103,
        "label": "近周标记发布条目",
        "detail": "全部职能，含最近重发/地区版本"
      },
      {
        "value": 9,
        "label": "地域文字符合机会",
        "detail": "企业 5＋电鸭 2＋补充板 2"
      },
      {
        "value": 0,
        "label": "已确认中国签约",
        "detail": "未联系雇主；不表示全部不能签约"
      }
    ]
  },
  "companies": [
    {
      "name": "GitLab",
      "current": 246,
      "recent": 38,
      "eligible": 0,
      "sourceUrl": "https://about.gitlab.com/jobs/",
      "method": "Greenhouse 公开 Job Board JSON；复核岗位详情",
      "difficulty": "低—中",
      "dateBasis": "first_published：来源首次发布",
      "notes": "三个近周开发岗分别限制英国、加拿大或加/英/美；不能凭 all-remote 品牌宣传归入中国可申请。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Canonical",
      "current": 318,
      "recent": 4,
      "eligible": 1,
      "sourceUrl": "https://canonical.com/careers/all",
      "method": "Greenhouse 公开 Job Board JSON；复核岗位详情",
      "difficulty": "低—中",
      "dateBasis": "first_published：来源首次发布",
      "notes": "地域文字符合的一项为应届毕业生岗；要求 2026/2027 首次大学学位毕业、英文沟通及国际出行能力。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Grafana Labs",
      "current": 140,
      "recent": 20,
      "eligible": 0,
      "sourceUrl": "https://grafana.com/careers/",
      "method": "Greenhouse 公开 Job Board JSON；复核岗位职责",
      "difficulty": "低—中",
      "dateBasis": "first_published：来源首次发布",
      "notes": "近周 20 条含 9 个工程管理岗和 2 个偏售前 Field Engineer；按本轮职业范围排除，开发者 IC 为 0。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Automattic",
      "current": 6,
      "recent": null,
      "eligible": null,
      "sourceUrl": "https://automattic.com/work-with-us/jobs/",
      "method": "官网公开嵌入数据；技术岗详情 HTML",
      "difficulty": "中",
      "dateBasis": "未公开可核发布日期",
      "notes": "6 条当前公开记录中有 2 个技术岗，但正文与嵌入数据均未见发布日期；近周数量未知，不能记为 0。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": false,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Elastic",
      "current": null,
      "recent": null,
      "eligible": null,
      "sourceUrl": "https://www.elastic.co/careers",
      "method": "官网指向 jobs.elastic.co；基本 HTTP 只取得动态应用壳",
      "difficulty": "高（本轮基本 HTTP 路径）",
      "dateBasis": "未取得",
      "notes": "未获得完整岗位列表；当前及近周数量均为未知，不能解释为没有岗位。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": false,
      "listReadable": false,
      "chinaContractConfirmed": false
    },
    {
      "name": "Supabase",
      "current": 80,
      "recent": 4,
      "eligible": 4,
      "sourceUrl": "https://supabase.com/careers",
      "method": "Ashby 有文档的公开 JSON；岗位正文及公开申请表",
      "difficulty": "低（获取）／中（地域判断）",
      "dateBasis": "publishedAt：最近发布，未证实原始首发",
      "notes": "4 项正文均明确全球招聘；公开申请表问护照国和居住国，未见更窄限制；未向雇主确认中国签约或薪资发放。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "n8n",
      "current": 68,
      "recent": 15,
      "eligible": 0,
      "sourceUrl": "https://n8n.io/careers/",
      "method": "Ashby 有文档的公开 JSON；岗位正文",
      "difficulty": "低（获取）／中（分类）",
      "dateBasis": "publishedAt：最近发布，未证实原始首发",
      "notes": "近周条目主要为设计、销售、续约/客户成功、管理；一项 Forward Deployed Engineer 为 EMEA Hybrid，无完全远程开发者交集。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "PostHog",
      "current": 9,
      "recent": null,
      "eligible": null,
      "sourceUrl": "https://posthog.com/careers",
      "method": "公开渲染页面及可读 HTML 详情",
      "difficulty": "中—高",
      "dateBasis": "未见可核日期元数据",
      "notes": "9 条当前公开记录可读；无可见日期或 datePosted/publishedAt 等元数据，近周数量未知。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": false,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Railway",
      "current": 17,
      "recent": 0,
      "eligible": 0,
      "sourceUrl": "https://railway.com/careers",
      "method": "17 个公开详情 HTML；JobPosting JSON-LD",
      "difficulty": "中",
      "dateBasis": "datePosted：详情结构化日期",
      "notes": "最近日期为 2026-10-16，部分常年招聘记录可追溯至 2022；当前仍开放的存量不能计作近周新供给。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Sourcegraph",
      "current": 8,
      "recent": 2,
      "eligible": 0,
      "sourceUrl": "https://sourcegraph.com/jobs",
      "method": "官网确认 sourcegraph91 招聘板；Greenhouse 公开 JSON",
      "difficulty": "低",
      "dateBasis": "first_published；不把 updated_at 当首发",
      "notes": "8 条公开条目含人才库；近周为美国限定的技术咨询岗和管理岗，无本轮合格开发岗。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "DuckDuckGo",
      "current": 10,
      "recent": 1,
      "eligible": 0,
      "sourceUrl": "https://jobs.ashbyhq.com/duck-duck-go",
      "method": "Ashby 公开招聘板数据",
      "difficulty": "低—中",
      "dateBasis": "publishedAt：最近发布",
      "notes": "近周只有 Product Partnerships，超出开发者职业范围。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Docker",
      "current": 50,
      "recent": 5,
      "eligible": 0,
      "sourceUrl": "https://jobs.ashbyhq.com/docker",
      "method": "Ashby 公开招聘板数据",
      "difficulty": "低—中",
      "dateBasis": "publishedAt：最近发布",
      "notes": "近周为产品管理、财务、续约及 Developer Success 主管等，无符合范围的动手开发 IC。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Zapier",
      "current": 9,
      "recent": 1,
      "eligible": 0,
      "sourceUrl": "https://jobs.ashbyhq.com/zapier",
      "method": "Ashby 公开招聘板数据",
      "difficulty": "低—中",
      "dateBasis": "publishedAt：最近发布",
      "notes": "近周只有 Legal Counsel，超出开发者职业范围。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Mattermost",
      "current": 10,
      "recent": 0,
      "eligible": 0,
      "sourceUrl": "https://job-boards.greenhouse.io/mattermost",
      "method": "Greenhouse 公开招聘板数据",
      "difficulty": "低—中",
      "dateBasis": "first_published：来源首次发布",
      "notes": "本窗口没有首次发布记录；不等于当前没有岗位。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    },
    {
      "name": "Tailscale",
      "current": 89,
      "recent": 13,
      "eligible": 0,
      "sourceUrl": "https://job-boards.greenhouse.io/tailscale",
      "method": "Greenhouse 公开招聘板数据；岗位职责核对",
      "difficulty": "低—中",
      "dateBasis": "first_published：来源首次发布",
      "notes": "近周 Forward Deployed 岗偏客户引导、支持、咨询，未见软件实现职责；其余偏管理、设计、销售。",
      "currentLabel": "当前公开发布条目（全部职能）",
      "recentLabel": "窗口内标记发布（全部职能）",
      "eligibleLabel": "窗口内技术岗：地域文字符合",
      "dateAuditable": true,
      "listReadable": true,
      "chinaContractConfirmed": false
    }
  ],
  "communities": [
    {
      "id": "v2ex-remote",
      "name": "V2EX · remote",
      "sourceUrl": "https://www.v2ex.com/feed/remote.json",
      "method": "官方 JSON Feed＋公开原帖",
      "current": 50,
      "recent": 5,
      "candidates": 4,
      "eligible": 0,
      "pending": 4,
      "excluded": 0,
      "countUnit": "recent 为帖子；candidates 为技术招聘发布条目，二者不可混用",
      "difficulty": "获取低／分类与地域核实中",
      "dateBasis": "date_published；不把修改日期算新发布",
      "coverage": "Feed 最早为 2026-09-21，越过窗口起点；覆盖该节点 Feed 可见的 5 篇窗口内帖子。",
      "notes": [
        "4 个技术远程广告条目均缺少明确支持中国大陆居住的证据；未知不等于不能申请。",
        "人工测试、非编程的 AI 视频/内容制作条目按职业范围排除。"
      ]
    },
    {
      "id": "v2ex-jobs",
      "name": "V2EX · jobs",
      "sourceUrl": "https://www.v2ex.com/feed/jobs.json",
      "method": "官方 JSON Feed＋公开原帖",
      "current": 50,
      "recent": 20,
      "candidates": 20,
      "eligible": 0,
      "pending": 16,
      "excluded": 4,
      "countUnit": "recent 为节点帖子；candidates 为筛出的招聘发布条目，不是人数或已去重岗位",
      "difficulty": "获取低／匿名多岗合集解释高",
      "dateBasis": "date_published；不把修改日期算新发布",
      "coverage": "Feed 最早为 2026-11-06，越过窗口起点；覆盖该节点 Feed 可见的 20 篇窗口内帖子。",
      "notes": [
        "技术条目来自一篇 26 岗合集中的 17 个技术标题、另一全栈帖的 2 个标题、一个后端帖。",
        "4 个限制冲突条目含两条重复 UTC−5 至 UTC+5（中国 UTC+8 不在范围）、台湾、欧洲运维；是否接受异地错峰未核实。",
        "原帖 1258720 在网页工具不可读，但当前官方 Feed 含完整合集正文。"
      ]
    },
    {
      "id": "eleduck",
      "name": "电鸭 · 最新公开帖",
      "sourceUrl": "https://eleduck.com/?sort=new",
      "method": "官方 RSS＋内置浏览器最新排序第 1–4 页＋候选详情",
      "current": 100,
      "recent": 90,
      "candidates": 12,
      "eligible": 2,
      "pending": 9,
      "excluded": null,
      "special": 1,
      "detailsRead": 10,
      "boundaryUnresolved": 4,
      "recentExact": false,
      "countUnit": "100 为审阅列表卡片；90 为确定在窗内，另 4 篇七天边界时间不明、6 篇已八天前",
      "difficulty": "RSS 低／完整周覆盖及详情判断中—高",
      "dateBasis": "列表/详情相对日期；7 天边界无法取得全部精确时刻",
      "coverage": "最新 RSS 的 25 条仅覆盖约两天且正文截断；人工列表抵达八天前。不能报完整精确一周帖数。",
      "notes": [
        "12 个活跃技术远程候选中，普通地域文字符合 2 项、专项业务复核 1 项，另 9 项未确认。",
        "10 篇候选详情已读；IT 远程支持仅 RSS/列表样本，n8n/Dify 详情出现验证码，停止未绕过。",
        "已关闭 MVP 全栈、混合办公/已关闭合伙人与线下项目另记，不计活跃全远程供给。"
      ]
    },
    {
      "id": "remoteok",
      "name": "Remote OK · 公开 API 样本",
      "sourceUrl": "https://remoteok.com/api",
      "method": "当前公开 API 快照；候选回查雇主原页",
      "current": 98,
      "recent": 91,
      "candidates": 23,
      "eligible": 1,
      "pending": 2,
      "excluded": 20,
      "recentExact": false,
      "countUnit": "条目；当前 API 可见样本，不代表全市场或完整七天历史",
      "difficulty": "获取低／雇主地域与任务性质复核中",
      "dateBasis": "职位板发布；不等于雇主原始首发",
      "coverage": "只读当前可见 API 样本；存在早于窗口的旧/置顶记录，不能据此证明全周无遗漏。",
      "notes": [
        "唯一地域文字符合项 Askable 已回查雇主页，为按验收任务计费的合约，非固定工资职位。",
        "23 个技术候选中 1 项符合、2 项待核、20 项排除；不能拿页面 Remote 标签作中国签约证明。"
      ]
    },
    {
      "id": "wwr",
      "name": "We Work Remotely · RSS 样本",
      "sourceUrl": "https://weworkremotely.com/remote-jobs.rss",
      "method": "官方 RSS 当前快照；候选详情与雇主地域条件",
      "current": 98,
      "recent": 90,
      "recentUniqueUrls": 89,
      "candidates": 20,
      "eligible": 1,
      "pending": 4,
      "excluded": 15,
      "recentExact": false,
      "countUnit": "RSS 发布条目；近周 90 条对应 89 个不同 URL，非完整历史",
      "difficulty": "获取低／职业、地域与转载判断中",
      "dateBasis": "RSS pubDate；不等于雇主原始首发",
      "coverage": "仅当前可见 RSS；未证明连续历史或分页覆盖完整。早于窗口的旧/置顶条目不能证明全周完整。",
      "notes": [
        "1 项完全重复额外行是非开发者的 Instacart BI Manager；不影响合格技术机会计数。",
        "唯一地域文字符合项 Elvoro 是维护生产 Python/媒体 API 的项目合约，计划扩大为全职。"
      ]
    }
  ],
  "opportunities": {
    "core": [
      {
        "id": "job-1",
        "group": "企业官网",
        "source": "Canonical",
        "company": "Canonical",
        "title": "Graduate Software Engineer, Open Source and Linux, Canonical Ubuntu",
        "url": "https://job-boards.greenhouse.io/canonical/jobs/8379825",
        "boardUrl": null,
        "date": "2026-11-16T21:39:36+08:00",
        "dateBasis": "来源首次发布",
        "locationEvidence": "Location: This is a Globally remote role.",
        "conditions": "2026/2027 首次大学学位毕业生；英文沟通、国际线下活动；全职。",
        "type": "full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": false,
        "formNote": null
      },
      {
        "id": "job-2",
        "group": "企业官网",
        "source": "Supabase",
        "company": "Supabase",
        "title": "Multigres Deployment Engineer",
        "url": "https://jobs.ashbyhq.com/supabase/f035bda1-b5d3-4c5b-8736-b9c335fe1c3b",
        "boardUrl": null,
        "date": "2026-11-20T05:07:22.705+08:00",
        "dateBasis": "最近发布，未证实原始首发",
        "locationEvidence": "We hire globally. We believe you can do your best work from anywhere.",
        "conditions": "软件/平台工程 IC；全职。",
        "type": "full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": true,
        "formNote": "公开表单问护照国及居住国（自由文本）；未见更窄地域限制；未填写或提交。"
      },
      {
        "id": "job-3",
        "group": "企业官网",
        "source": "Supabase",
        "company": "Supabase",
        "title": "Storage Platform Engineer",
        "url": "https://jobs.ashbyhq.com/supabase/463d8cd7-3092-44eb-b80e-8d21008e569e",
        "boardUrl": null,
        "date": "2026-11-19T20:56:25.99+08:00",
        "dateBasis": "最近发布，未证实原始首发",
        "locationEvidence": "We hire globally. We believe you can do your best work from anywhere.",
        "conditions": "软件/平台工程 IC；全职。",
        "type": "full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": true,
        "formNote": "公开表单问护照国及居住国（自由文本）；未见更窄地域限制；未填写或提交。"
      },
      {
        "id": "job-4",
        "group": "企业官网",
        "source": "Supabase",
        "company": "Supabase",
        "title": "Red Team Lead",
        "url": "https://jobs.ashbyhq.com/supabase/4ee6b96f-cc38-4531-aadd-7ff0f8e87e25",
        "boardUrl": null,
        "date": "2026-11-20T21:04:20.56+08:00",
        "dateBasis": "最近发布，未证实原始首发",
        "locationEvidence": "We hire globally. We believe you can do your best work from anywhere.",
        "conditions": "需动手做安全工作的 player-coach 负责人；全职。",
        "type": "full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": true,
        "formNote": "公开表单问护照国及居住国（自由文本）；未见更窄地域限制；未填写或提交。"
      },
      {
        "id": "job-5",
        "group": "企业官网",
        "source": "Supabase",
        "company": "Supabase",
        "title": "Software Engineer - Postgres Tooling",
        "url": "https://jobs.ashbyhq.com/supabase/2184cfbd-927e-4d3c-b34a-f2301d3e8281",
        "boardUrl": null,
        "date": "2026-11-20T01:48:28.617+08:00",
        "dateBasis": "最近发布，未证实原始首发",
        "locationEvidence": "We hire globally. We believe you can do your best work from anywhere.",
        "conditions": "软件/平台工程 IC；全职。",
        "type": "full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": true,
        "formNote": "公开表单问护照国及居住国（自由文本）；未见更窄地域限制；未填写或提交。"
      },
      {
        "id": "job-6",
        "group": "电鸭社区",
        "source": "Eleduck",
        "company": "SmartDeer",
        "title": "后端工程师（偏全栈能力）",
        "url": "https://eleduck.com/posts/K7fabv",
        "boardUrl": null,
        "date": "3天前",
        "dateBasis": "相对日期，2026-11-21 下午观察",
        "locationEvidence": "北京优先，长期远程IC合作",
        "conditions": "SmartDeer；北京优先、长期远程 IC 合作；每周约 40 小时、工作日 10–19 点；未联系雇主。",
        "type": "as published; remote role or independent-contractor cooperation",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": false,
        "formNote": null
      },
      {
        "id": "job-7",
        "group": "电鸭社区",
        "source": "Eleduck",
        "company": "未披露",
        "title": "Agent应用研发工程师",
        "url": "https://eleduck.com/posts/oQfRE8",
        "boardUrl": null,
        "date": "2天前",
        "dateBasis": "相对日期，2026-11-21 下午观察",
        "locationEvidence": "远程或深圳办公，可买社保公积金",
        "conditions": "公司名未披露；可远程或深圳办公、可买社保公积金；当前仍有投递按钮；未联系雇主。",
        "type": "as published; remote role or independent-contractor cooperation",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": false,
        "formNote": null
      },
      {
        "id": "job-8",
        "group": "补充职位板",
        "source": "Remote OK, employer page verified",
        "company": "Askable",
        "title": "Software Engineer, AI Coding Tasks",
        "url": "https://www.askable.com/experts/roles/senior-software-engineer",
        "boardUrl": "https://remoteok.com/remote-jobs/remote-software-engineer-ai-coding-tasks-askable-1137808",
        "date": "2026-11-19T13:56:01+08:00",
        "dateBasis": "职位板发布，非雇主原始首发",
        "locationEvidence": "Remote, any location",
        "conditions": "2 年以上经验、每周至少 10 小时；按通过验收的任务付款，非固定工资雇佣。",
        "type": "task-based contract",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": false,
        "formNote": null
      },
      {
        "id": "job-9",
        "group": "补充职位板",
        "source": "WWR",
        "company": "Elvoro",
        "title": "Elvoro: AI Creative Engineer (Social Media)",
        "url": "https://weworkremotely.com/remote-jobs/elvoro-ai-creative-engineer-social-media",
        "boardUrl": null,
        "date": "2026-11-18T08:12:31+08:00",
        "dateBasis": "职位板发布，非雇主原始首发",
        "locationEvidence": "Location: Remote, Worldwide",
        "conditions": "维护生产 Python 代码及媒体/发布 API；FFmpeg、MoviePy、Pillow、GCS、GitHub Actions；项目合约、拟转全职。",
        "type": "project-based contract, planned expansion to full-time",
        "status": "地域文字符合；中国签约未确认",
        "chinaContractConfirmed": false,
        "applicationFormChecked": false,
        "formNote": null
      }
    ],
    "special": [
      {
        "id": "dma-special",
        "group": "单列专项外包",
        "source": "电鸭",
        "company": "未披露，个人合作",
        "title": "Windows底层/DMA上位机全栈工程师",
        "url": "https://eleduck.com/posts/pqfAq0",
        "date": "2天前",
        "dateBasis": "相对日期，2026-11-21 下午观察",
        "locationEvidence": "页面标上海，远程按模块合作",
        "conditions": "预算未定、按模块或分成；涉及驱动和反作弊适配，业务性质需另核；不作优先推荐。",
        "status": "地域文字可兼容，业务需另核；不计入核心 9 项",
        "chinaContractConfirmed": false
      }
    ],
    "notice": "9 项只表示本次公开文字的地域兼容；一概不标为“已确认中国可雇佣”。"
  },
  "duplicates": {
    "warning": "没有精确的跨源去重总量；疑似重复不作确定合并。",
    "eligibleCrossSourceConfirmedDuplicatesFound": 0,
    "noMatchIsNotProofOfDistinctness": true,
    "items": [
      {
        "source": "V2EX",
        "kind": "疑似重复",
        "count": 6,
        "unit": "组",
        "detail": "合集与独立帖在标题/薪资上相似，疑似多出 6 个发布条目；匿名雇主无岗位 ID，不能确定为同岗。"
      },
      {
        "source": "WWR",
        "kind": "确定同 URL 重复",
        "count": 1,
        "unit": "额外行",
        "detail": "Instacart Business Intelligence Manager II；属于非开发条目，90 个近周发布行对应 89 个 URL。"
      },
      {
        "source": "Remote OK ＋ WWR",
        "kind": "确定跨板重复",
        "count": 1,
        "unit": "组",
        "detail": "Netlify Staff Software Engineer (Interfaces)；因雇主申请国家限制而排除，不在核心 9 项。"
      },
      {
        "source": "GitLab",
        "kind": "确定同内部 ID 的地区版本",
        "count": 1,
        "unit": "组",
        "detail": "CX Platform Engineer：加拿大窗口内条目与美国较早条目共用 internal_job_id 6552189002；不能当成两个新全球机会。"
      },
      {
        "source": "补充职位板",
        "kind": "疑似地区版本",
        "count": null,
        "unit": "未定",
        "detail": "Dropbox Atlassian Cloud Administrator 名称/地区不同，但未确认共享雇主 ID，不合并。"
      }
    ],
    "v2exGroups": [
      "TTS algorithm 22-35K",
      "image/video algorithm 22-35K",
      "security 40-150K",
      "fullstack 15-28K",
      "AI fullstack UTC-5..+5 30-40K",
      "backend 18-25K"
    ]
  },
  "lessons": [
    {
      "title": "获取容易，不代表中国可申请",
      "text": "公开 ATS JSON 和 Feed 能降低取数成本；真正稀缺的是地域、签约、发布日期、职业范围与当前状态的可靠判断。"
    },
    {
      "title": "对齐日期语义再谈“每周新增”",
      "text": "first_published、最近发布、RSS 转载日期、页面修改日期含义不同；存量与新供给应分开。"
    },
    {
      "title": "匿名合集不能准确去重",
      "text": "同标题/薪资只能形成疑似组；只有可追溯雇主 ID、原始 URL 等证据才适合确定合并。"
    },
    {
      "title": "先停止岗位提醒的付费产品假设",
      "text": "本样本核心供给少且类型分散，还没有“只为聚合＋提醒付费”的证据；暂不进入开发。"
    },
    {
      "title": "后续研究应改变证据，而不是扩大页面数",
      "text": "若重启，应先取得雇主对中国签约的确认、目标用户最近实际付费行为及稳定连续供给；这些都尚未完成。"
    }
  ],
  "sources": [
    {
      "title": "本轮最终审计数据",
      "kind": "本地最终证据",
      "url": "./evidence/jobs-audit.json",
      "note": "最终汇总、定义与所有 9 条机会；本页统计以此为准。",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/results.json",
      "sha256": "3393d73ea446ad3ae1872610d5ec8c24073e32a3922e126ebdb6a42159b9e42e"
    },
    {
      "title": "本轮文字结果",
      "kind": "本地最终证据",
      "url": "./evidence/jobs-audit.txt",
      "note": "便于人工阅读的同一审计汇总。",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/results.txt",
      "sha256": "b0934867d1cf88749dac90a896cdddb79b08d423ce079ee1d8e24620ff8ad27f"
    },
    {
      "title": "15 家企业合并表",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/companies-consolidated.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/companies-consolidated.json",
      "sha256": "00869e12c8281f16857e1c92dbaad02489087240263d8488d9ef850468f66b56"
    },
    {
      "title": "企业 A 组记录与口径",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/a/README.md",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/a/README.md",
      "sha256": "bfe426a121c0de02af109367e6e246850fe7064f38c6f8c0a006382a8a72977c"
    },
    {
      "title": "企业 B 组审计",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/b/audit-b.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/b/audit-b.json",
      "sha256": "96edbb9e0ef99cdd42446393a867a03c026ca9934889024187356e945270b67e"
    },
    {
      "title": "其余企业审计",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/root/company-summary.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/root/company-summary.json",
      "sha256": "e30bc3ca57d052c05c9c9a47e593044945751131479a0a0b321fed309227917c"
    },
    {
      "title": "V2EX / 电鸭完整分组汇总",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/communities/summary.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/communities/summary.json",
      "sha256": "2892a8387e015db194a602aed5c123def0bac990e932003904a1364b7b36a305"
    },
    {
      "title": "V2EX 候选逐条判断",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/communities/v2ex-candidate-records.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/communities/v2ex-candidate-records.json",
      "sha256": "ae4aa9440ca48e12bdc3e35d43e0e62739386c43a82df264f030b7e10e2eda94"
    },
    {
      "title": "电鸭候选逐条判断",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/communities/eleduck-candidate-records.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/communities/eleduck-candidate-records.json",
      "sha256": "4c852bc83b1a8545ff6cda3c7171b8500e65469e5b68244a2e79027e83569b77"
    },
    {
      "title": "Remote OK 分组审计",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/a/remoteok-audit.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/a/remoteok-audit.json",
      "sha256": "31661965e72412013e627845740bb831e92aea971456cf3f6f3cfdf4e8d7ea8a"
    },
    {
      "title": "WWR 分组审计",
      "kind": "本地分组证据",
      "url": "./evidence/job-audit/b/wwr-audit.json",
      "originalEvidencePath": "artifacts/job-supply-audit-20261121/b/wwr-audit.json",
      "sha256": "4b1af0ae3f85ba3906617294abc98451677819093f3ccee2ae585a817df84743"
    },
    {
      "title": "GitLab · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://about.gitlab.com/jobs/",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Canonical · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://canonical.com/careers/all",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Grafana Labs · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://grafana.com/careers/",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Automattic · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://automattic.com/work-with-us/jobs/",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Elastic · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://www.elastic.co/careers",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Supabase · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://supabase.com/careers",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "n8n · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://n8n.io/careers/",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "PostHog · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://posthog.com/careers",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Railway · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://railway.com/careers",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Sourcegraph · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://sourcegraph.com/jobs",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "DuckDuckGo · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://jobs.ashbyhq.com/duck-duck-go",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Docker · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://jobs.ashbyhq.com/docker",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Zapier · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://jobs.ashbyhq.com/zapier",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Mattermost · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://job-boards.greenhouse.io/mattermost",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "Tailscale · 官方入口",
      "kind": "当时核对的公开来源",
      "url": "https://job-boards.greenhouse.io/tailscale",
      "note": "外链用于追溯；本页未在制作时重新在线核查。"
    },
    {
      "title": "V2EX · remote",
      "kind": "当时核对的公开来源",
      "url": "https://www.v2ex.com/feed/remote.json",
      "note": "Feed 最早为 2026-09-21，越过窗口起点；覆盖该节点 Feed 可见的 5 篇窗口内帖子。"
    },
    {
      "title": "V2EX · jobs",
      "kind": "当时核对的公开来源",
      "url": "https://www.v2ex.com/feed/jobs.json",
      "note": "Feed 最早为 2026-11-06，越过窗口起点；覆盖该节点 Feed 可见的 20 篇窗口内帖子。"
    },
    {
      "title": "电鸭 · 最新公开帖",
      "kind": "当时核对的公开来源",
      "url": "https://eleduck.com/?sort=new",
      "note": "最新 RSS 的 25 条仅覆盖约两天且正文截断；人工列表抵达八天前。不能报完整精确一周帖数。"
    },
    {
      "title": "Remote OK · 公开 API 样本",
      "kind": "当时核对的公开来源",
      "url": "https://remoteok.com/api",
      "note": "只读当前可见 API 样本；存在早于窗口的旧/置顶记录，不能据此证明全周无遗漏。"
    },
    {
      "title": "We Work Remotely · RSS 样本",
      "kind": "当时核对的公开来源",
      "url": "https://weworkremotely.com/remote-jobs.rss",
      "note": "仅当前可见 RSS；未证明连续历史或分页覆盖完整。早于窗口的旧/置顶条目不能证明全周完整。"
    }
  ],
  "evidenceFile": "./evidence/jobs-audit.json",
  "preparedFromLocalEvidenceOnly": true,
  "onlineRecheckedForThisPage": false,
  "originalEvidenceFile": "artifacts/job-supply-audit-20261121/results.json",
  "evidenceCopy": {
    "verified": "SHA256 source/copy equality",
    "files": 11,
    "sourceUnchanged": true,
    "notes": "Copied public audit evidence only; original files unchanged. Machine absolute paths removed from exported source references."
  }
};
