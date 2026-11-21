/* Foundations used by the LLM map, not a complete mathematics curriculum.
 * Explanations are original summaries; all numerical examples are constructed.
 * Source concepts checked against primary documentation on 2026-11-05.
 */
(() => {
  'use strict';
  const section = (title, text) => ({ title, text });
  const step = (title, text) => ({ title, text });
  const source = (title, url) => ({ title, url });
  const refs = {
    language: source('Google · 语言模型估计什么概率', 'https://developers.google.com/machine-learning/crash-course/llm'),
    embeddings: source('Google · 嵌入空间与静态表示', 'https://developers.google.com/machine-learning/crash-course/embeddings/embedding-space'),
    similarity: source('Google · 距离、夹角与嵌入相似度', 'https://developers.google.com/machine-learning/clustering/dnn-clustering/supervised-similarity'),
    contextual: source('Google · 学习嵌入与上下文表示', 'https://developers.google.com/machine-learning/crash-course/embeddings/obtaining-embeddings'),
    gradient: source('Google · 梯度下降的步骤与计算', 'https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent'),
    learningRate: source('Google · 学习率、批次与更新', 'https://developers.google.com/machine-learning/crash-course/linear-regression/hyperparameters'),
    generalization: source('Google · 训练表现与泛化', 'https://developers.google.com/machine-learning/crash-course/overfitting/generalization'),
    logLoss: source('Google · 概率预测与对数损失', 'https://developers.google.com/machine-learning/crash-course/logistic-regression/loss-regularization')
  };

  window.LLM_FOUNDATIONS = {
    'llm-probability': {
      id: 'llm-probability', domain: 'ai', foundation: true, llmNode: 'generation',
      title: '下一段文字的概率，究竟在说什么？',
      eyebrow: '随用随补的基础 · 条件概率与分布',
      lead: '读懂语言模型的生成过程，先认识一个问题：在已经给出的文字之后，各种后续片段分别有多大可能？这是一组带条件的预测。知道条件是什么、概率分给哪些候选，就能看懂生成图中的柱条，也能避免把它误读成“回答正确的把握”。',
      sections: [
        section('先说条件，再说概率', '“接下来出现什么”必须与前面已经出现的内容放在一起理解。写成 P（下一个 token｜已有上下文），竖线右边表示已给定的条件。问题、提示与已生成的文字都可能改变这个条件，因此同一个候选片段在不同上下文中可以得到不同概率。这描述的是模型对文字延续的估计，并没有自动判断现实中发生了什么。'),
        section('一组候选，共同构成分布', '对一次下一 token 的预测，模型把概率分配给词表中的候选；完整分布中的数值非负、总和为 1。图里为了便于观察，可能只画几个较大的候选，所以可见柱条未必加起来等于 100%。生成程序随后按约定的方法选择一个候选，再把它加入上下文。概率较大的候选更受当前模型偏好，但采用采样时也不保证每次都选中它。'),
        section('文字延续的概率，需要与事实判断分开', '假设某个日期片段得到很高的预测概率，这首先表示它在当前模型和上下文下更容易成为下一段文字。要说“这个日期有多少把握是真的”，还需要定义事实问题、获得核查依据，并检验这种把握是否可靠。常见写法、错误前提和过时材料都可能影响文字预测。观察分布能帮助理解生成行为，核查主张仍要回到来源与适用条件。')
      ],
      example: {
        title: '构造示意：给三个候选分配概率',
        text: '假设一个玩具词表只有“水、茶、汤”三个候选，给定“我想喝”后，分布为 0.6、0.3、0.1，合计为 1。若固定这组分布独立抽取 100 次，期望次数分别是 60、30、10，实际次数可以不同。把前文改成“这杯红”，分布可以随之改变。这些候选与数字仅说明计算关系，未使用实际分词器或模型，也不表示现实中的饮品偏好。'
      },
      takeaway: '看概率时先问：给定了什么条件，预测的是哪种事件？下一 token 的预测概率与一句话的事实可靠性，需要分别理解。',
      visual: { kind: 'flow', steps: [
        step('固定上下文', '先明确模型本次已经看到的内容'),
        step('得到候选分布', '完整候选集的概率相加为 1'),
        step('按规则选取', '选最大值或采样会带来不同延续'),
        step('更新条件', '选中的片段加入上下文，再预测下一步')
      ] },
      related: ['llm-generation', 'llm-training', 'ai-generation'],
      crossLinks: [
        { href: '#domain/education?direction=evidence', title: '连接证据判断：预测支持了什么结论？', reason: '先分清模型输出的数字在描述什么，再判断能否把它当作事实依据。' },
        { href: '#domain/information?direction=provenance', title: '连接信息来源：到哪里核查主张？', reason: '需要确认一个日期或名称时，还要追查资料的出处、版本与适用对象。' }
      ],
      sources: [refs.language, refs.logLoss]
    },
    'llm-vectors': {
      id: 'llm-vectors', domain: 'ai', foundation: true, llmNode: 'representation',
      title: '一串数字，怎样帮助模型处理文字？',
      eyebrow: '随用随补的基础 · 向量、相似度与表示',
      lead: '向量可以先理解为按固定顺序排列的一组数字。语言模型需要可计算的表示，因此会把 token 编号连接到向量，再让这些向量随上下文发生变换。先看懂“编号、表示、相似度”各自的作用，就能继续理解嵌入与注意力。',
      sections: [
        section('编号用于找到表示，向量参与后续计算', 'token 编号帮助系统区分词表中的项目，编号相邻并不代表含义相近。嵌入层可以按照编号取得一组可训练的数值，让后续网络进行计算。在同一模型的同一表示空间中，向量具有约定的维数与坐标顺序。这里的“维度”表示数字的位置，不必把每一维都解释成一个清楚的日常属性。'),
        section('相似度依赖表示和比较方法', '有了向量，可以用距离、夹角等方法比较它们。比如余弦相似度关注方向，欧氏距离还会受到数值尺度影响；采用哪种方法，要结合表示如何训练与任务需要。靠得近可以帮助找相似用法或相关资料，却不保证两句话表达同一个事实。跨模型得到的向量，通常也不能直接放在一起比较数值。'),
        section('从初始嵌入，走向带上下文的表示', '同一个 token 可以先取得相同的初始嵌入，再结合位置与可见上下文经过多层计算，形成不同的中间表示。注意力是连接上下文信息的一种机制，并非只查一次相似词表。例如“苹果”出现在果盘与设备话题里，周围信息会影响后续处理。训练学出的表示通常分散承载多种特征，不能把整串数字当作逐项可读的词典解释。')
      ],
      example: {
        title: '构造算例：在二维坐标里比较距离',
        text: '手工给三个项目 A、B、C 分配坐标（1，1）、（2，1）、（5，4）。按欧氏距离，A 到 B 是 1，A 到 C 是 5，因此在这个设定中 B 更接近 A。这里没有给项目赋予真实语义，坐标也不是模型学出的嵌入；它只展示“选择表示与比较规则之后，接近程度才能被计算”。实际表示是否有用，需要另用任务结果检验。'
      },
      takeaway: '先用编号找到向量，再理解向量怎样随上下文变化。距离与相似度提供计算线索，语义和事实判断仍取决于模型、任务与证据。',
      visual: { kind: 'flow', steps: [
        step('token 编号', '辨认词表中的项目，不按编号大小理解含义'),
        step('初始嵌入', '取出一组学得的数值，作为处理的起点'),
        step('上下文变换', '结合位置与可见内容，更新中间表示'),
        step('服务具体任务', '用于预测、匹配等任务，并检验效果')
      ] },
      related: ['llm-tokens', 'llm-attention', 'llm-training'],
      crossLinks: [
        { href: '#domain/computing?direction=comp-data', title: '连接数据表示：信息怎样进入计算机？', reason: '向量是信息表示的一种方式，先了解编码与表示的作用能帮助分清编号和特征。' },
        { href: '#domain/information?direction=retrieval', title: '连接信息检索：相似内容怎样被找到？', reason: '向量可以参与寻找相关资料；找到相似材料以后，还要检查是否适用。' }
      ],
      sources: [refs.embeddings, refs.contextual, refs.similarity]
    },
    'llm-optimization': {
      id: 'llm-optimization', domain: 'ai', foundation: true, llmNode: 'training',
      title: '模型怎样沿着误差，一点点调整自己？',
      eyebrow: '随用随补的基础 · 损失、梯度与更新',
      lead: '训练需要一个可以计算的改进方向：先用损失衡量预测与训练目标的差异，再计算参数改变会怎样影响损失，最后按优化方法调整参数。这个过程能改变模型的行为，但“训练分数更好”仍需要与“在实际任务中更有用”分别检验。',
      sections: [
        section('损失把训练目标变成一个数', '损失函数约定了什么预测需要被调整，以及偏差有多大。以自回归语言模型的常见预训练目标为例，训练文本中实际出现的下一 token 是目标；模型给它的预测概率越低，对应的负对数损失越大。训练会在许多位置与样本上汇总这种差异。训练文本本身也可能包含错误，因此学好这个目标，不等于已经核验了其中的每项事实。'),
        section('梯度提供局部方向，步长影响更新', '梯度把损失对各个参数的局部变化率组织起来。最简单的梯度下降沿负梯度方向走一小步，学习率控制步子的尺度。步子太大可能越过较低区域，太小则可能进展缓慢。实际大模型通常使用更复杂的优化方法，并按批次汇总信息；每一步损失也未必都下降。理解这个局部调整思想，就能继续阅读反向传播与优化器。'),
        section('更新参数以后，还要检验目标之外的表现', '在训练样本上降低损失，说明模型更符合该目标和这批数据；还要用未参与训练的材料观察泛化，用具体任务检查可靠性。若评价只奖励语言流畅，就不能据此推出事实正确；若数据没有覆盖某种情境，也不能保证迁移过去仍有效。因而优化、数据选择与评价标准需要一起理解，损失曲线只提供其中一部分证据。')
      ],
      example: {
        title: '构造算例：只调整一个数字',
        text: '设玩具损失 L＝（w－3）²。w＝1 时，损失为 4，梯度为 2×（1－3）＝－4。若学习率为 0.25，一步更新得到 w＝1－0.25×（－4）＝2，损失降到 1。若在同一起点用 1.5，更新会到 w＝7，损失反而变为 16。这个单参数平方损失只用于展示步长与局部更新，不是大语言模型的实际损失，也不是学习率建议。'
      },
      takeaway: '损失定义改进目标，梯度与优化方法决定怎样调整，独立评价检验改进能否用到真实任务。把这三件事分清，才知道训练结果支持了什么。',
      visual: { kind: 'flow', steps: [
        step('给出训练目标', '明确这批样本希望模型预测什么'),
        step('计算损失', '把预测与目标的差异变成数值'),
        step('计算并应用更新', '利用梯度和优化方法调整参数'),
        step('另做评价', '检查未见材料与实际任务中的表现')
      ] },
      related: ['llm-training', 'llm-probability', 'llm-posttraining'],
      crossLinks: [
        { href: '#domain/computing?direction=comp-testing', title: '连接软件验证：改好了，怎样确认？', reason: '训练指标与实际使用表现都需要具体检查条件，避免用一个分数代替全部目标。' },
        { href: '#domain/education?direction=feedback', title: '连接反馈与修正：依据什么改变？', reason: '人的学习与参数优化是不同机制，但都值得追问反馈针对什么目标、有没有遗漏重要方面。' }
      ],
      sources: [refs.gradient, refs.learningRate, refs.logLoss, refs.generalization]
    }
  };
})();
