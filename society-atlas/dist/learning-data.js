/* Worked examples, transfer tasks and the exact scope of their sources. */
(() => {
  'use strict';
  window.LEARNING_PATHS = {
    testing: {
      sector:'software',direction:'testing',board:'knowledge',title:'测试与质量',question:'网页显示暂无记录，先查哪里？',
      search:'网页显示暂无记录 网页显示没有数据 空列表 接口 认证失败 HTTP 请求 响应码 软件测试',
      lead:'从相同的界面表现里分辨请求失败与成功后无数据。',
      first:{prompt:'两个账号打开同一个订单列表。一个看得到订单，另一个只显示「暂无记录」。你会先找哪份证据？',choices:[
        {label:'对照两个账号的列表请求和响应',feedback:'请求和响应能把界面表现往前追一步，先区分有没有成功读取数据。'},
        {label:'只检查页面有没有画出列表',feedback:'这能描述表面现象。相同的空列表提示可能对应成功、请求失败或展示逻辑错误。',concept:'locate'}],correct:0,concept:'evidence'},
      map:[['页面表现','记录账号、操作步骤和实际看到的提示。'],['请求与响应','对照同一接口的状态码和响应内容，标出第一处差异。'],['回查与复现','带上账号状态和请求记录，确认差异出现的条件。']],
      sample:[['甲的订单查询','200 · 返回 12 条'],['乙的订单查询','401 · 请求缺少有效认证凭据']],
      explanation:'复现单可以写「同样打开订单列表，甲收到 200 和 12 条订单。乙收到 401，页面仍显示暂无记录。请复核乙的登录状态与失败提示」。这一组证据指向要先查的环节。',
      transfer:{prompt:'换成预约列表。甲请求成功，状态码是 200，响应体为 []。乙的响应是 401。两个页面都显示「暂无记录」。哪段复现说明更准确？',choices:[
        {label:'两个账号都没有预约，后端查询正常',feedback:'这只描述了页面，乙的请求状态给出了另一条证据。',concept:'evidence'},
        {label:'甲本次查询成功并返回空结果，乙应先查认证',feedback:'你按请求证据分开了两个情境。空数组说明本次返回的结果，401 指向有效认证凭据。'}],correct:1,concept:'evidence'},
      proof:'写下哪条记录说明甲是空结果，哪条说明乙的请求先遇到了认证问题。',
      scope:'本路线覆盖一次列表故障的复现和证据判断。真实系统还要核对接口约定、查询范围和运行日志。',
      sources:[
        {title:'RFC 9110 §15.3.1 · 200 OK',url:'https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.1',supports:'200 表示请求成功。练习中的空数组是虚构接口返回的响应内容。'},
        {title:'RFC 9110 §15.5.2 · 401 Unauthorized',url:'https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2',supports:'401 表示请求缺少适用于目标资源的有效认证凭据。具体凭据问题仍需复现。'}]
    },
    quality: {
      sector:'manufacturing',direction:'quality',board:'economy',title:'质量与检验',question:'哪条产线应该优先复核？',
      search:'制造 质量 检验 不合格率 抽样 分母 样本量 产线 质量与检验',
      lead:'从不合格件数走到样本比例，再判断比较能说明多少。',
      first:{prompt:'同一检验规则下，甲线抽查 60 件，有 6 件不符合要求。乙线抽查 15 件，有 3 件不符合要求。你会先怎样比较？',choices:[
        {label:'只看件数，甲线 6 件所以比例更高',feedback:'两条线的抽查量不同。把每组不合格件数与该组抽查数配对，再计算比例。',concept:'denominator'},
        {label:'分别算 6 ÷ 60 和 3 ÷ 15',feedback:'这批样本里甲线为 10%，乙线为 20%。再核对两组的产品与抽查条件。'}],correct:1,concept:'comparison'},
      map:[['对齐分母','各自使用实际抽查的件数。'],['检查对照条件','查产品规格、时段和检查口径。'],['限定结论','先写样本表现和复核线索，再决定怎样验证。']],
      sample:[['甲线','6 / 60 · 10%'],['乙线','3 / 15 · 20%']],
      explanation:'复核单可以写「这次乙线的样本不合格比例较高，先查抽查条件与产品构成。用相同规格和口径复查，再判断差异是否持续」。',
      transfer:{prompt:'换一批零件。甲线 4 / 80，乙线 3 / 30。两条线的产品规格构成不同。你会怎样写这次结论？',choices:[
        {label:'甲线 5%，乙线 10%。乙线样本比例较高，下一步按同规格复查',feedback:'分母和计算对应上了。你也保留了规格差异这个需要进一步核对的条件。'},
        {label:'乙线问题件数更少，所以质量更好',feedback:'只看件数会遗漏抽查数和规格构成。先算各组样本比例，再核对可比条件。',concept:'denominator'},
        {label:'乙线工艺一定导致了更多不合格',feedback:'样本比例提示回查方向。规格构成不同，需要更多证据才能把差异归因到工艺。',concept:'comparison'}],correct:0,concept:'comparison'},
      proof:'写下两条线的样本比例，并说明为什么还要按规格复查。',
      scope:'本路线覆盖样本比例与优先复核。控制图、抽样方案、工程公差与正式放行需要另学。',
      sources:[{title:'NIST 工程统计手册 §6.3.3.2 · 比例控制图',url:'https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc332.htm',supports:'样本不合格比例等于样本中不合格件数除以抽查总数。练习中的比例用于学习怎样提出复核线索。'}]
    },
    assessment: {
      sector:'education',direction:'assessment',board:'care',title:'作答评价与反馈',question:'学生选对了，怎么判断能否解释？',
      search:'教育 作答评价与反馈 学生选对 分数 理解 评价标准 解释理由 学习迁移',
      lead:'用作答里的依据给反馈，再用一道新题检查能不能自己解释。',
      first:{prompt:'一名学习者选对了 1/2 比 2/5 大，但理由写的是「2 大于 1，所以 1/2 大」。哪种反馈更贴近学习目标？',choices:[
        {label:'请在同样长的纸条上画出两种分数，再解释为什么',feedback:'选择正确，理由还需要核对。用同一个整体作图，可以看到学习者如何比较两种分数。'},
        {label:'选对了，直接记录已经会解释',feedback:'选项和理由提供的是两条不同的证据。这里的理由没有说明分数为什么这样比较。',concept:'evidence'}],correct:0,concept:'comparison'},
      map:[['确定目标','把选对大小和能说明理由分开。'],['看作答证据','找出作答已经说清的地方和仍需确认的条件。'],['换例复查','换一组数字，沿用同一标准，让学习者独立解释。']],
      sample:[['原作答','选对大小，理由只比较了数字'],['反馈任务','画同样长的纸条，说明比较依据']],
      explanation:'反馈可以写「大小选对了。请画两个同样大的整体，解释为什么一半比五分之二大」。下一题换成 3/4 和 5/8，请学习者自己用图或等值分数说明。',
      transfer:{prompt:'换到 3/4 与 5/8。甲写「3/4 = 6/8，比 5/8 多 1/8」，乙选对但只写「4 小于 8」。按同一个理由标准，该怎样反馈？',choices:[
        {label:'两人都选对，可以给同样的反馈',feedback:'甲说明了等值转换，乙的理由还不能说明为什么。两人需要的下一步不同。',concept:'evidence'},
        {label:'甲给出了等值依据，邀请乙画同一个整体或化成八等份',feedback:'你用了可观察的作答证据，并为仍待确认的理由设计了下一步。'}],correct:1,concept:'comparison'},
      proof:'用自己的话写清甲展示了什么，乙还需要补哪一步。',
      scope:'本路线覆盖一次课堂作答的反馈与换例检查。长期掌握需要跨时间、跨任务继续观察。',
      sources:[{title:'美国教育科学研究院 WWC · 组织教学与学习实践指南，建议 7',url:'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',supports:'建议让学习者回答需要解释原理的问题。站内分数题、自检标准和教学顺序属于教学设计。'}]
    }
  };
})();
