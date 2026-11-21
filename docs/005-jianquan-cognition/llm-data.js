/* A bounded map of common autoregressive language models, not all AI. */
(() => {
  'use strict';
  const read=(title,href,reason)=>({title,href,reason});
  const stage=(title,text,links)=>({title,text,links});
  window.LLM_DATA={
    title:'大语言模型',
    lead:'从文字怎样进入模型，到能力怎样形成、答案怎样生成，沿着一张地图逐层展开。',
    scope:'这张图聚焦常见的自回归 Transformer 语言模型。它是 AI 的一个具体方向；多模态、其他模型结构和完整工程实践仍有更多分支。',
    depths:[{id:'intro',label:'先认识'},{id:'mechanism',label:'拆机制与基础'},{id:'boundary',label:'看应用与边界'}],
    nodes:[
      {id:'representation',title:'文字怎样表示',short:'文字表示',question:'字符、token、向量分别是什么？',contains:['分词与 token','词表与编号','嵌入向量','位置信息'],foundation:'llm-vectors',
        intro:stage('先看文字如何变成模型的输入','从一个短句出发，把文字片段、编号和计算用的向量区分开。',[read('文字、token 与向量','#article/llm-tokens','看清表示链条，也知道分词示意的局限。')]),
        mechanism:stage('再理解“用一组数表示”是什么意思','不必先掌握矩阵推导，可以先用二维例子认识方向和相似度。',[read('向量与相似度','#article/llm-vectors','补上嵌入表示所需的直观数学基础。'),read('表示怎样随上下文变化','#article/llm-attention','从初始表示走到带上下文的表示。')]),
        boundary:stage('把表示放回寻找信息的任务','向量可以参与寻找相近内容；语义相近还需要与适用、可信分开。',[read('相似与需要，是同一件事吗','#article/info-retrieval','连接到信息组织，理解检索还需要哪些条件。')]),
        neighbor:read('软件与计算 · 数据表示','#domain/computing?direction=comp-data','文字和图像都要选择一种可处理的表示；这里可以补更广的计算基础。'),frontier:'已展开 token 和向量的直观机制；具体分词算法、嵌入训练和位置编码公式仍需专业资料。'},
      {id:'context',title:'上下文怎样关联',short:'关联上下文',question:'同一个词，为什么随语境变化？',contains:['自注意力','多头与多层','因果遮罩','上下文窗口'],foundation:'llm-vectors',
        intro:stage('先看同一个词的两种上下文','改变“苹果”前面的文字，观察图解中哪些线索参与表示。',[read('注意力怎样连接上下文','#article/llm-attention','区分语境关联与人的注意力，也看见因果遮罩的限制。')]),
        mechanism:stage('从权重理解信息怎样组合','先补向量，再认识加权组合；图解只展示一个位置的一次组合。',[read('向量与加权组合','#article/llm-vectors','理解权重作用于什么，避免把权重当作完整解释。'),read('回到注意力与 Transformer','#article/llm-attention','继续看多层、多头和前馈计算各自在图中的位置。')]),
        boundary:stage('关联得到，不代表永久保存或全部用对','把当前输入、产品外部记忆、训练参数分开看。',[read('展开提示词与上下文工程','#map/context?node=selection&depth=intro','从模型可见的输入，继续看任务说明、材料选取和跨轮更新。'),read('上下文、记忆与训练','#article/ai-context','认识一次对话能参考的信息与跨会话保存的区别。')]),
        neighbor:read('信息组织 · 描述与关联','#domain/information?direction=relations','模型里的表示关系之外，人也需要给资料建立明确、有理由的主题关系。'),frontier:'已解释上下文关系和因果限制；完整矩阵推导、位置编码、缓存与长上下文策略尚未展开。'},
      {id:'generation',title:'回答怎样生成',short:'逐步生成',question:'下一片段怎样被选出来？',contains:['条件概率','下一 token 预测','采样与温度','停止条件'],foundation:'llm-probability',
        intro:stage('先把一次生成展开','输入已有片段，得到候选分布，选择下一个片段，再继续。',[read('从候选分布到一句回答','#article/llm-generation','动一动温度设置，比较同一组候选的分布变化。')]),
        mechanism:stage('理解概率前，先看它的条件','模型输出的是给定上下文中的候选分布；改变条件，分布也可以变化。',[read('条件概率与分布','#article/llm-probability','补上“更可能接在后面”究竟是什么意思。'),read('上下文怎样参与预测','#article/llm-attention','把生成端的候选分布接回输入侧的信息关联。')]),
        boundary:stage('把生成倾向与事实依据分开','低温度让分布更集中，不会自动使每一条事实可靠。',[read('生成与证据','#article/ai-generation','认识流畅回答为什么仍然需要核查。'),read('沿案例看来源与判断','#roam/ai-errors','回到一个具体问题，连接信息来源和证据。')]),
        neighbor:read('教育与传播 · 证据判断','#domain/education?direction=evidence','从概率性的表达走到事实判断，需要看主张与证据之间的关系。'),frontier:'已展示简化候选分布与温度；束搜索、截断采样、推理时计算与完整解码实现未展开。'},
      {id:'training',title:'能力怎样形成',short:'训练与学习',question:'模型里的参数从哪里来？',contains:['训练数据','预测目标','损失','梯度与更新'],foundation:'llm-optimization',
        intro:stage('先认识训练与使用的不同','训练利用样例和目标调整参数，使用模型时则利用已有参数处理输入。',[read('数据怎样改变模型','#article/llm-training','沿训练循环理解数据、预测、损失和参数的关系。')]),
        mechanism:stage('再看“错多少”怎样变成更新方向','先用一个可手算的小例子理解损失与梯度，再回到语言模型。',[read('损失、梯度与优化','#article/llm-optimization','补上参数更新的直观数学基础。'),read('概率为什么进入训练目标','#article/llm-probability','理解实际下一个片段获得的概率与预测目标的关系。')]),
        boundary:stage('把学过的样例与新情境分开','训练目标改善，不等于所有任务、群体与输入条件都表现良好。',[read('泛化与过拟合','#topic/generalization','认识熟悉样例与未见情境之间的差别。'),read('数据质量与覆盖','#topic/data-quality','继续追问训练数据包含了什么，又遗漏了什么。')]),
        neighbor:read('软件与计算 · 验证与可靠性','#domain/computing?direction=comp-testing','训练后的系统也要在明确条件下检查，观察与预期的差异。'),frontier:'已展开训练目标与优化直觉；完整反向传播、分布式训练、数据工程与计算预算尚未展开。'},
      {id:'adaptation',title:'怎样适应任务',short:'适配与系统',question:'训练、提示、检索、工具各改了什么？',contains:['监督微调','偏好优化','提示与检索','工具与流程'],foundation:'llm-optimization',
        intro:stage('先把不同改变方式并排看','有的方法改变参数，有的方法补充本次输入，有的方法连接外部执行。',[read('预训练之后，还会改变什么','#article/llm-posttraining','理解监督微调、偏好训练以及提示与检索的区别。')]),
        mechanism:stage('追问改变发生在哪里','先看参数更新，再看材料进入上下文；两条路径可能组合使用。',[read('展开 RAG 的知识结构','#map/rag?node=context&depth=intro','从检索到的资料怎样进入上下文，继续看资料准备、筛选与依据核验。'),read('参数怎样被更新','#article/llm-training','把微调放回训练的一般过程。'),read('检索怎样补充本次材料','#article/retrieval','把检索放回完整系统，避免混同为模型重新学会。')]),
        boundary:stage('把模型放回工具与人的协作','适配后的输出仍需要任务评估、权限和结果核验。',[read('展开 Agent 的完整知识结构','#map/agent?node=goals&depth=intro','从模型的适配走向目标、工具、状态与控制的整体关系。'),read('模型怎样借助工具行动','#article/ai-agent','理解提议、执行与检查的分工。'),read('评估结果怎样对应任务','#topic/accuracy-context','区分某个测试上的表现和真实使用条件。')]),
        neighbor:read('信息组织 · 检索','#domain/information?direction=retrieval','模型得到什么材料，取决于描述、索引、筛选和版本等环节。'),frontier:'已比较常见适配方式；不同偏好算法、参数高效微调和工具协议细节未展开。'},
      {id:'evaluation',title:'能力怎样检验',short:'评估与边界',question:'看起来会了，在哪些条件下才算可靠？',contains:['任务与指标','错误类型','泛化','来源与证据'],foundation:'llm-probability',
        intro:stage('先把“好用”说成具体条件','明确任务、输入和成功标准，才能讨论分数或案例说明了什么。',[read('分数与使用情境','#topic/accuracy-context','从摘要例子区分可读性与关键事实是否保留。')]),
        mechanism:stage('继续拆开指标背后的错误','同一准确率可能遮住不同错误；理解分母与条件，再比较结果。',[read('不同错误与指标','#topic/false-positives','用可手算的例子，看清总分之外遗漏了什么。'),read('概率与事实判断','#article/llm-probability','避免把候选概率、模型评分和现实事实概率混为一谈。')]),
        boundary:stage('把判断接回真实材料和变化','模型、输入和材料会变化；留下结论的条件，继续检查。',[read('观察、解释与判断','#article/education-evidence','知道材料支持了什么，还有什么只是推测。'),read('变化之后，为什么还要检验','#topic/robustness','理解旧测试不能覆盖所有新条件。')]),
        neighbor:read('教育与传播 · 证据判断','#domain/education?direction=evidence','检验模型与判断日常信息，都需要分清观察、解释与结论。'),frontier:'已提供评估的认知入口；标准化基准、统计检验、红队与行业评测还需专门展开。'}
    ],
    foundations:[
      {id:'llm-probability',title:'概率与条件',why:'用于理解候选分布、预测目标，以及“可能”所依赖的条件。'},
      {id:'llm-vectors',title:'向量与相似度',why:'用于理解文字表示、信息组合与相近程度。'},
      {id:'llm-optimization',title:'损失与优化',why:'用于理解训练怎样得到更新信号、逐步改变参数。'}
    ]
  };
})();
