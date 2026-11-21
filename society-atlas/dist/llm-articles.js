/* Original introductory explanations for the LLM knowledge map.
 * Scope: common autoregressive language models based on decoder-only Transformers.
 * Examples and diagrams are constructed teaching material, not measured model traces.
 */
(() => {
  'use strict';
  const section = (title,text) => ({title,text});
  const step = (title,text) => ({title,text});
  const refs = {
    tokenizer:{title:'Hugging Face 官方课程 · Tokenizers：文本、词元与编号',url:'https://huggingface.co/learn/llm-course/en/chapter2/4'},
    tokenTraining:{title:'Hugging Face 官方课程 · 分词器与训练语料',url:'https://huggingface.co/learn/llm-course/en/chapter6/1'},
    embeddings:{title:'Google 机器学习速成课 · Embeddings',url:'https://developers.google.com/machine-learning/crash-course/embeddings'},
    transformer:{title:'Vaswani 等 · Attention Is All You Need（原始论文）',url:'https://arxiv.org/html/1706.03762v7'},
    llm:{title:'Google 机器学习速成课 · Transformer 与大语言模型',url:'https://developers.google.com/machine-learning/crash-course/llm/transformers'},
    causal:{title:'Hugging Face 官方课程 · 训练自回归语言模型',url:'https://huggingface.co/learn/llm-course/en/chapter7/6'},
    decoding:{title:'Hugging Face 官方讲解 · 自回归生成与解码方法',url:'https://huggingface.co/blog/how-to-generate'},
    generation:{title:'Hugging Face Transformers 文档 · 生成与采样参数',url:'https://huggingface.co/docs/transformers/en/main_classes/text_generation'},
    tuning:{title:'Google 机器学习速成课 · 微调与提示',url:'https://developers.google.com/machine-learning/crash-course/llm/tuning'},
    preference:{title:'Ouyang 等 · Training language models to follow instructions with human feedback',url:'https://arxiv.org/abs/2203.02155'},
    dpo:{title:'Rafailov 等 · Direct Preference Optimization（原始论文）',url:'https://arxiv.org/abs/2305.18290'},
    validation:{title:'Google 机器学习速成课 · 训练、验证与测试数据',url:'https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets'}
  };
  window.LLM_ARTICLES = {
    'llm-tokens': {
      id:'llm-tokens',domain:'ai',llmNode:'representation',title:'一句话怎样变成模型可以计算的东西？',eyebrow:'大语言模型 · 文本表示',
      lead:'从文字进入模型，要经过几次不同的转换：切成 token，为片段分配编号，再把编号映射为向量，并让计算能够使用顺序信息。把这些环节分开，才能理解为什么“字数”“token 数”和“模型看到了什么”是不同问题。',
      scope:'本页讲常见文本语言模型的输入表示；不同分词器、词表和位置处理方法会有差异。图中的切分、编号与向量均为构造示意。',
      sections:[
        section('Token 是处理单位，未必是一个词','分词器按既定规则和词表，把文本变成一串可识别的片段，通常称为 token。一个片段可能对应一个词、词的一部分、字符或字节组合；空格和标点也可能参与其中。同一句话换一个分词器，切分结果可能不同。因此，中文字符数不能直接当作 token 数，页面里的分块示意也不代表某款模型的实际切分。'),
        section('编号用来辨认，向量用来计算','词表为片段提供编号，例如教学词表可以把“苹果”记作 17。编号只是标识，17 并不表示它比编号 8 的词更重要。模型通常通过嵌入层取出对应的一组数，也就是向量，再进行后续运算。这些数可以在训练中调整；向量的某一维通常不能直接命名为一个人类概念，也不能把一组数当作词义的完整定义。'),
        section('顺序和上下文继续改变表示','把“猫追狗”换成“狗追猫”，即使出现相同片段，关系也改变了。Transformer 需要利用位置信息，使计算能够区分序列中的位置或相对关系，具体实现可以不同。随后各层还会结合上下文更新每个位置的表示；入口处的词元向量与经过多层处理的上下文表示，是不同阶段的结果。')
      ],
      example:{title:'构造示意：编号不是含义的分数',text:'假设教学词表把“苹果”分配为 17，把“公司”分配为 42。两者编号相差 25 并不说明含义有多远。只有进入特定的向量表示与计算之后，才可以讨论怎样比较它们；比较结果仍取决于模型和使用情境。'},
      takeaway:'先分清四件事：token 决定按什么单位处理，编号负责标识，向量承载计算表示，位置与上下文让表示能够表达关系。',
      visual:{kind:'flow',steps:[step('文字','原始字符与标点'),step('Token 与编号','按分词器规则切分，再查词表'),step('向量与位置','进入数值计算，并使用顺序信息'),step('上下文表示','经过模型层，结合周围可见内容更新')]},
      related:['llm-vectors','llm-attention','llm-generation'],
      crossLinks:[{href:'#article/comp-data',title:'走向计算机：信息怎样表示？',reason:'词元与编号是信息表示的一种具体约定；理解编码，可以分清内容与表示形式。'},{href:'#domain/information?direction=description',title:'走向信息组织：怎样辨认资料？',reason:'给对象一个标识，与描述它的内容和适用条件，解决的是不同问题。'}],
      sources:[refs.tokenizer,refs.tokenTraining,refs.embeddings,refs.transformer]
    },
    'llm-attention': {
      id:'llm-attention',domain:'ai',llmNode:'context',title:'模型怎样把前后文联系起来？',eyebrow:'大语言模型 · 上下文与注意力',
      lead:'一个词的作用要放在具体句子中理解。注意力机制让某个位置的表示，能够按计算得到的权重汇集其他可见位置的信息。它是 Transformer 中组织信息的一种运算；“注意力”这个名称不表示模型拥有人的注意、意图或意识。',
      scope:'本页侧重常见自回归 Transformer 的因果自注意力。双向编码器、交叉注意力和其他结构有不同的可见范围；图中权重并非真实模型测量。',
      sections:[
        section('先比较，再汇集信息','可以把一次注意力计算理解为：当前位置带着一个查询，和可见位置的键进行匹配，再按得到的权重汇集它们的值。在模型里，查询、键和值都是由向量经过学习到的变换产生的，并不是人工写好的问题与答案。不同位置和不同层的权重可以变化；权重大小也不能直接当作某个词对最终答案的完整因果解释。'),
        section('因果遮罩限制“现在能看见什么”','在这里讨论的自回归模型中，某个位置用于预测后续 token 时，只能利用该位置及更早的位置，不能偷看尚未出现的答案。因果遮罩把不允许的连接排除。训练文本虽然已经给出，也要保持这项限制，才能构造与生成任务相对应的预测问题。其他类型模型可能使用不同遮罩，不能把这种可见范围推广到所有语言模型。'),
        section('Transformer 不只是一张注意力图','多头注意力提供多组信息汇集通道；前馈网络对各位置的表示继续变换，残差连接和归一化等结构帮助多层计算协作。层层处理后，模型得到用于后续预测的表示。一个上下文窗口能容纳多少输入，与模型能否准确利用其中细节也需要分开：材料被放进去，并不保证相关关系一定被正确处理。')
      ],
      example:{title:'构造示意：同一个“苹果”，不同的可见线索',text:'比较“我切开了这个苹果”和“发布会上介绍了苹果的新设备”。图解用人工设置的权重突出不同线索，帮助观察上下文怎样改变解释。它省略了实际分词、多层表示和多头计算，不能用来读取某个真实模型的思考过程。'},
      takeaway:'注意力把可见内容按计算得到的权重组合起来；遮罩决定能连接哪些位置，多层网络继续处理这些表示。',
      visual:{kind:'flow',steps:[step('带位置的表示','每个 token 已成为可计算的向量'),step('匹配与遮罩','计算关联，并排除不可见位置'),step('加权汇集','按权重组合值向量'),step('多层变换','与其他网络部件协作，形成后续预测所需表示')]},
      related:['llm-tokens','llm-vectors','llm-probability','ai-context'],
      crossLinks:[{href:'#article/info-retrieval',title:'走向信息检索：先找哪些资料？',reason:'检索在模型外寻找候选材料，注意力在输入表示中汇集信息；把两层分开才能定位问题。'},{href:'#article/education-evidence',title:'走向证据判断：图中看到了什么？',reason:'一幅关联图可以展示计算或观察，但解释为什么产生答案还需要额外证据。'}],
      sources:[refs.transformer,refs.llm]
    },
    'llm-training': {
      id:'llm-training',domain:'ai',llmNode:'training',title:'模型是怎样从文本中学到预测方式的？',eyebrow:'大语言模型 · 数据、损失与训练',
      lead:'训练要把一个宽泛目标变成能计算、能反复调整的过程。对于常见自回归语言模型，可以从“根据前文预测下一个 token”开始，沿着样本、预测分布、损失、参数更新和验证，理解模型能力怎样逐步形成。',
      scope:'这里解释自回归语言模型预训练的基本流程；其他训练目标、数据配方和优化工程未被这张简图穷尽。示意流程不是训练规模或效果的承诺。',
      sections:[
        section('文本同时提供前文和预测目标','一段已有文本可以产生许多训练位置：每个位置看到允许使用的前文，并把原文中的下一个 token 作为目标。模型输出的是候选 token 的概率分布；目标 token 得到的概率很低时，通常会产生较大的预测损失。这一训练目标提供了可计算的反馈，但它不等于逐条核查文本事实，也不保证学到的所有关联都可靠。'),
        section('损失把预测与参数更新连接起来','训练系统汇总选定位置和样本的损失，通过反向传播计算参数变化对损失的影响，再由优化算法更新参数。这个过程反复进行，逐步改变模型处理输入的方式。真实训练通常把多个样本或位置组织起来计算，也可能累积梯度；“预测、比较、更新”是一张关系图，不表示每输出一个 token 就必须立即更新一次参数。'),
        section('训练可以并行计算，生成仍有先后依赖','训练时，目标文本已经存在，因果遮罩允许许多位置在同一批计算中分别做预测，而不让它们看到各自的未来答案。生成时，下一个 token 尚未确定，需要依赖已经选出的内容继续预测。普通推理一般使用固定参数，不会因为聊天里出现一句新话就自动训练；训练数据是否被另行收集使用，是另一个系统流程。'),
        section('训练表现还要经受新材料的检验','在训练文本上表现改善，可能来自可迁移的规律，也可能包含对常见模式甚至具体内容的记忆。保留用于验证或测试的材料，可以检查模型在未用于该轮参数拟合的输入上表现怎样。数据重复、覆盖不足和使用场景变化都影响判断，因此理解训练还要连接泛化、数据质量与评估，不能只盯住一个不断下降的训练损失。')
      ],
      example:{title:'构造示意：从一个片段建立预测任务',text:'教学文本是“雨停了，我们出门”。在一个示意位置，模型看到“雨停了，我们”，任务是为后续片段分配概率。原文后续提供训练目标，但一次预测的对错只说明这次任务的表现；训练会汇集许多这样的信号，不能据此判断模型已经理解所有关于天气的事实。'},
      takeaway:'训练连接数据、目标、损失与参数更新；生成使用训练后的参数处理新输入，是否能迁移还要看新的评估条件。',
      visual:{kind:'flow',steps:[step('准备文本与目标','切分样本，并规定各位置可见的前文'),step('预测与计算损失','比较目标 token 与预测概率'),step('计算梯度并更新','汇集信号，调整模型参数'),step('验证与再调整','用另留材料检查泛化和数据问题')]},
      related:['llm-optimization','llm-probability','llm-generation','llm-posttraining'],
      crossLinks:[{href:'#domain/information?direction=provenance',title:'走向资料来源：训练材料怎样形成？',reason:'数据从哪里来、版本是什么、包含哪些重复或缺漏，都影响模型接触到的信号。'},{href:'#article/comp-testing',title:'走向软件验证：怎样检验未见情境？',reason:'训练目标与实际使用目标可能不同，需要把声称的能力转成具体检查条件。'}],
      sources:[refs.causal,refs.transformer,refs.validation]
    },
    'llm-generation': {
      id:'llm-generation',domain:'ai',llmNode:'generation',title:'一整段回答，怎样从下一小步生长出来？',eyebrow:'大语言模型 · 逐步生成与采样',
      lead:'常见自回归语言模型先根据当前上下文，为下一个 token 的候选分配概率，再按解码规则选出一个，把它接回上下文，继续下一步。长回答由这样一连串相互依赖的步骤形成；理解这条链，也能看清随机性和错误怎样进入输出。',
      scope:'这里展示自回归生成的基本依赖关系，省略缓存、批处理和推测解码等加速机制。图中的候选、分数与概率均为教学构造，不是模型实测。',
      sections:[
        section('上下文改变，下一步的分布也会改变','模型先处理已有输入，计算每个候选 token 的分数，再把它们转成概率。选出的 token 会影响后续输入，因此同一个开头可能沿不同分支继续。停止也需要规则，例如遇到结束标记、指定终止内容或长度限制。这里的逐步依赖描述了生成结构，并不表示系统预先存着一整段答案，也不表示所有部署实现都只做最朴素的逐步计算。'),
        section('解码规则决定怎样从候选里选','贪心解码每步选择概率最高的候选；采样则按分布抽取，较低概率的候选也可能出现。温度在采样前调整分数的相对差异：较低的正温度通常让分布更集中，较高温度通常让它更分散。还可以用其他规则限制候选集合。温度不是创造力或正确率的刻度，改变它也不会补入缺失资料。'),
        section('续写概率并不是事实为真的概率','某个名字、日期或说法在当前上下文中容易被接出来，只说明模型对这个后续片段的偏好，并不直接给出这项主张在现实中为真的概率。一段流畅文本又包含许多不同主张，不能由单步概率代表整段可信度。遇到事实问题，还需要对应来源、适用条件和独立核查；调低随机性也可能稳定地产生同一个错误。')
      ],
      example:{title:'构造示意：同一开头的多个候选',text:'假设“下班后，我想去”后面有“散步”“吃饭”“图书馆”三个教学候选。切换分布的集中程度，只展示选择机会如何变化；这些片段未按真实分词器切分，也没有调用模型。它无法告诉我们谁真的去了哪里，更不表示哪个选项在现实中更正确。'},
      takeaway:'把“模型给候选多少概率”“系统怎样选候选”和“输出是否符合事实”分开，就能更准确地理解生成。',
      visual:{kind:'flow',steps:[step('已有上下文','问题、材料与此前生成的内容'),step('下一步分布','为候选 token 计算分数与概率'),step('解码选择','按贪心或采样等规则选择'),step('接回并继续','新 token 成为后续上下文，直到停止')]},
      related:['llm-probability','llm-attention','ai-generation','info-retrieval'],
      crossLinks:[{href:'#domain/education?direction=evidence',title:'走向证据判断：一句话由什么支持？',reason:'生成解释的是文字怎样形成；证据判断继续检查其中的事实与推论。'},{href:'#domain/information?direction=retrieval',title:'走向信息检索：为上下文补什么材料？',reason:'把相关资料找出来，可以改变回答所依据的输入条件，但仍需检查使用是否正确。'}],
      sources:[refs.decoding,refs.generation,refs.llm]
    },
    'llm-posttraining': {
      id:'llm-posttraining',domain:'ai',llmNode:'adaptation',title:'学会续写之后，怎样变成更好用的助手？',eyebrow:'大语言模型 · 后训练与系统适配',
      lead:'能延续文本，与能按要求解释、遵守约束并完成任务，并不是同一个目标。预训练之后，可以用示范、反馈或偏好信号继续训练模型，也可以在使用时提供指令、资料和工具。它们改变系统行为的方式不同，适合放在同一张关系图中比较。',
      scope:'本页概括常见适配方式；实际模型可采用不同顺序、数据与算法。后训练不只有这些方法，对齐也不意味着错误或安全问题已经被彻底解决。',
      sections:[
        section('监督微调：用示范调整回答方式','预训练从大量材料中形成广泛的语言与任务模式，监督微调则用选定的输入和目标回答继续训练。例如，为说明问题、回答格式或任务步骤提供示范，使模型更常生成符合要求的内容。它会调整被训练的参数，具体可以是全部或部分参数。示范的质量和覆盖范围仍然重要；学会一种格式，也不等于每次填入的事实都可靠。'),
        section('偏好优化：比较哪些回答更合适','人或其他评估过程可以对多个回答给出偏好，训练再利用这些比较信号，调整模型产生某类回答的倾向。一条路线是先学习奖励模型，再用强化学习优化；也有直接利用偏好数据的方法。偏好反映评价标准、样本与评估者，不能当作普遍真理。更受偏爱的表达可能更清楚、更合用，但关键事实仍要单独检验。'),
        section('提示、检索与工具：在使用时组织条件','给模型一段指令、几条例子或检索得到的资料，通常是在改变这一次的输入；连接工具，则让外部软件负责查找、计算或执行。它们本身不等于更新模型参数，但可以与后训练配合。选择哪一种方式，要看问题出在行为习惯、材料缺失还是执行能力；即使采取了多种方式，系统也需要持续评估实际结果。')
      ],
      example:{title:'构造示意：让助手回答馆藏问题',text:'若希望回答统一列出书名与作者，可以提供格式示例或做相关微调；若要知道今天哪本书可借，需要取用当前馆藏数据；若要实际预约，还需要连接预约工具与权限。这三种需要可能同时出现，不能因为输出看起来相似，就认定背后采用了同一种机制。'},
      takeaway:'先辨认要改变的是参数中的行为倾向、本次输入的材料，还是外部系统的行动能力，再理解相应方法。',
      visual:{kind:'compare',steps:[step('预训练','从广泛材料学习预测与处理模式'),step('监督与偏好训练','用示范或反馈继续调整模型行为'),step('提示与检索','在使用时提供指令、例子或资料'),step('工具与评估','连接实际操作，并检查任务是否完成')]},
      related:['llm-training','ai-context','ai-agent','info-retrieval'],
      crossLinks:[{href:'#domain/education?direction=feedback',title:'走向反馈：评价标准从哪里来？',reason:'反馈要指出目标与差异；比较人的反馈与机器训练，也要说明两者的机制差别。'},{href:'#domain/computing?direction=comp-systems',title:'走向软件系统：模型之外还要接什么？',reason:'数据获取、工具执行和结果确认属于完整产品的协作，不能只靠参数更新完成。'}],
      sources:[refs.tuning,refs.preference,refs.dpo]
    }
  };
})();
