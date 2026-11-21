window.HUMAN_CASES = {
  version: '2026-11-12',
  evidence: '设计演示：参考图和需求均为模拟；左版沿用现有通用样品，右版按本轮参考与约束新生成。没有真实客户反馈或成交结果。',
  cases: [
    {
      id: 'pet', label: '宠物 · 像它，也像它的性格', number: '01', title: '同样是讨饭，保留这只猫的傲娇。',
      brief: '它不太撒娇。饭点会把空碗推过来，半眯着眼看我。我想一眼认出它，也看出它在催饭。',
      briefLabel: '模拟主人需求', reference: 'assets/case-studies/pet-reference.jpg', referenceAlt: 'AI模拟参考：白猫、单侧黑耳、鼻边黑斑和青绿项圈，旁边有空食碗',
      referenceNote: 'AI 生成的虚构宠物照片，用于演示参考约束。',
      before: 'assets/stickers/pet/meal.png', beforeTitle: '开饭啦', beforeNote: '现有通用橘猫：表达开饭和期待，未使用本轮参考。',
      after: 'assets/case-studies/pet-after.png', afterTitle: '碗空了', afterNote: '本轮参考定向样品：用指定外形、空碗与克制神态表达催饭。',
      scenario: '晚上七点，准备叫家人喂猫。希望传达“它又来催饭了”，语气带一点熟悉的调侃。',
      observations: ['白色短毛、单侧黑耳与鼻边黑斑', '青绿色项圈和浅色食碗', '情绪来自需求描述：克制、傲娇、轻微催促'],
      judgments: [
        { from: '客户需要“我家那只”的辨识度', decision: '优先锁定黑耳、鼻边斑与项圈，不沿用通用橘猫的配色。', visible: '看外形：对照照片核对斑纹和配饰。' },
        { from: '它会推空碗，表达比较克制', decision: '选择推碗、半眯眼和侧看，收住大笑、张嘴和兴奋挥爪。', visible: '看情绪：能否读出“催你一下”的神态。' },
        { from: '主人想带一点熟悉的调侃', decision: '把泛用招呼“开饭啦”改为陈述“碗空了”。', visible: '看用词：让宠物像在用自己的方式开口。' }
      ],
      contribution: '人的贡献是从许多细节中选出最能被主人识别的几项，并确认什么程度的夸张仍然像它。',
      questions: ['外形特征能否对应参考？', '神态是否符合“傲娇催饭”？', '主人在饭点愿不愿意发送？'],
      confirmation: '真实定制需换成主人授权的照片与行为描述，再请主人确认“像不像”。当前不证明真实照片还原效果。',
      pack: 'pet'
    },
    {
      id: 'couple', label: '情侣 · 从热闹拥抱到安静陪伴', number: '02', title: '同样是安慰，把回应调到对方需要的音量。',
      brief: '我累的时候不太想被逗开心，只想有人安静陪着。希望表情像我们：她戴圆眼镜、穿姜黄开衫，他穿深蓝外套。',
      briefLabel: '模拟情侣需求', reference: 'assets/case-studies/couple-reference.jpg', referenceAlt: 'AI模拟参考：戴圆眼镜和姜黄开衫的成年女性，与短发深蓝外套的成年男性',
      referenceNote: 'AI 生成的虚构成年人物照片，不是真实客户肖像。',
      before: 'assets/stickers/couple/hug.png', beforeTitle: '抱抱', beforeNote: '现有通用双人样品：用拥抱表达安慰，未使用本轮人物参考。',
      after: 'assets/case-studies/couple-after.png', afterTitle: '我陪着你', afterNote: '本轮参考定向样品：保留两人的外形线索，以安静靠肩与递杯表达陪伴。',
      scenario: '对方说：“今天好累，我现在不太想说话。”两版都能表达关心；这次要比较哪版更符合对方明确说出的需要。',
      observations: ['短卷发、圆框眼镜与姜黄开衫', '男方短直发和深蓝外套', '情绪需求由本人描述，不从照片推断'],
      judgments: [
        { from: '对方需要安静陪着，不急于开心', decision: '降低动作幅度，让两人坐在一起、轻靠肩膀，保留平静神态。', visible: '看姿态：安慰的力度是否与需要相符。' },
        { from: '希望看到属于两个人的形象', decision: '保留圆眼镜、短卷发和服装配色，使两个角色容易区分。', visible: '看身份：外形依据有没有进入成品。' },
        { from: '此刻需要回应，而不是解决问题', decision: '选择“我陪着你”，用杯子和陪坐传达支持，减少庆祝符号。', visible: '看语言：是否留给对方不说话的空间。' }
      ],
      contribution: '人的贡献是询问和确认对方真正需要的回应，并决定动作、表情和文字的分寸。照片主要提供身份依据。',
      questions: ['两个人的特征能否区分？', '是否表达了平静陪伴？', '收到的人会不会觉得被理解？'],
      confirmation: '模拟需求不能替代真实沟通。本人需要确认形象、称呼和情绪表达；不能只凭一张照片猜测关系或感受。',
      pack: 'couple'
    },
    {
      id: 'shop', label: '小店 · 亲切回应与准确承诺', number: '03', title: '同样是回复消息，把“看到了”和“确定有货”分清。',
      brief: '我们卖手工吐司，用青绿色纸袋。顾客问有没有货时，我还要去查库存。想回复亲切一点，但不能让人以为已经留好了。',
      briefLabel: '模拟店主需求', reference: 'assets/case-studies/shop-reference.jpg', referenceAlt: 'AI模拟参考：金黄色方形厚吐司和青绿色烘焙纸袋，袋上有浅色圆形封签',
      referenceNote: 'AI 生成的虚构商品与包装照片，不代表真实店铺。',
      before: 'assets/stickers/shop/confirm.png', beforeTitle: '收到，安排', beforeNote: '现有通用样品：适合已经确认的安排；在单纯询问库存时可能让人误解。',
      after: 'assets/case-studies/shop-after.png', afterTitle: '我确认一下', afterNote: '本轮参考定向样品：借用吐司和包装色，以查看记录的动作回应待确认状态。',
      scenario: '顾客问：“今天还有两份吐司吗？能不能帮我留一下？”此时库存尚未核实。比较哪版更容易让顾客理解真实处理状态。',
      observations: ['厚方吐司的金黄外壳与浅色内部', '青绿色纸袋和浅色封签', '业务事实：库存未核实，还不能承诺留货'],
      judgments: [
        { from: '顾客在问库存，还没有确认结果', decision: '把“收到，安排”换成“我确认一下”，保留核实步骤。', visible: '看承诺：顾客会不会误以为已经留好。' },
        { from: '需要让人看出正在处理', decision: '角色查看空白记录单，使用思考动作；不画完成打包的盒子或成功符号。', visible: '看动作：是否表达“查一下”，而非“已完成”。' },
        { from: '角色需要属于这家店', decision: '从实物提取吐司轮廓，将包装青绿色转为围裙配色。', visible: '看品牌：形象是否能与产品和包装联系起来。' }
      ],
      contribution: '人的贡献是理解真实经营步骤，核实事实与承诺边界，再把友好语气与准确信息放在同一张表情里。',
      questions: ['是否能对应商品与包装？', '是否清楚表达“待确认”？', '顾客会不会误认为已经留货？'],
      confirmation: '表情只能回应语气和状态。确认库存、价格、取货时间和售后条件仍需店主核实，并用准确文字说明。',
      pack: 'shop'
    }
  ]
};
