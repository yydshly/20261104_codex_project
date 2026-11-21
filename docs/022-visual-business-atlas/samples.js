window.STICKERLAB = {
  version: '2026-11-12',
  basePath: 'assets/stickers',
  packs: [
    {
      id: 'pet', label: '宠物 · 橘猫奶盖', title: '把日常情绪，交给一只记得住的猫。', kicker: '01 / PERSONAL EXPRESSION',
      value: '固定橘色花纹、白嘴套和青绿色围巾，用四个高频场景展示专属角色如何进入日常聊天。真实定制时，应替换为客户宠物的辨识特征。',
      color: '#e8c59b', avatar: '喵', chatName: '和朋友的日常', directionIds: ['pet'],
      identity: '三道额纹、白嘴套、青绿围巾，跨动作保持一致。',
      usefulness: '收到、示爱、开饭、睡前告别，覆盖完整的日常表达。',
      next: '可扩展到客户宠物照定制、生日纪念图和宠物门店加购。',
      origin: '原创虚构宠物角色。没有使用客户照片，不代表已完成照片还原定制。',
      stickers: [
        { id: 'received', label: '收到啦', action: '点头确认', message: '明天出门记得带伞，可能会下雨。', use: '温柔确认信息，适合家人和朋友。' },
        { id: 'hug', label: '贴贴', action: '抱心轻轻挤压', message: '今天有点累，想被安慰一下。', use: '表达关心与亲密，适合熟悉的人。' },
        { id: 'meal', label: '开饭啦', action: '抬爪期待开饭', message: '饭已经做好了，你快过来。', use: '有明确行动语境的家庭招呼。' },
        { id: 'night', label: '晚安', action: '闭眼呼吸', message: '今天辛苦啦，早点休息。', use: '结束晚间对话，语气柔和。' }
      ]
    },
    {
      id: 'couple', label: '情侣 · 两个人的日常', title: '把亲密关系里的小回应，做得更具体。', kicker: '02 / RELATIONSHIP & RITUAL',
      value: '固定两个人的发型和服装，围绕安慰、想念、报平安与日常示爱设计。客户可定制的价值是“像我们”和“我们真的会说这句话”。',
      color: '#ecd4ce', avatar: '♡', chatName: '两个人的日常', directionIds: ['couple'],
      identity: '黑色短发与桃色外套、栗色头发与青绿上衣，区分两个角色。',
      usefulness: '每张都对应一个具体关系动作，避免只有姿势没有语义。',
      next: '可扩展到昵称版、纪念日、婚礼请柬和家庭形象。',
      origin: '原创成年卡通人物。未使用真实肖像，当前样品展示互动表达方式。',
      stickers: [
        { id: 'hug', label: '抱抱', action: '轻轻拥抱', message: '今天工作不太顺利，有点难过。', use: '用安慰的动作回应对方的情绪。' },
        { id: 'miss', label: '想你了', action: '抱枕想念', message: '今天晚上我们好像又要晚点才能见。', use: '在分开时表达想念。' },
        { id: 'home', label: '到家啦', action: '挥手报平安', message: '到了给我说一声，路上注意安全。', use: '明确回应安全到家这件事。' },
        { id: 'love', label: '今天也爱你', action: '两个人一起比心', message: '普通的一天，也想听你说句喜欢。', use: '创造轻量的日常仪式。' }
      ]
    },
    {
      id: 'shop', label: '小店 · 吐司店长', title: '让营业回复，有温度，也说得清楚。', kicker: '03 / CUSTOMER SERVICE',
      value: '用同一个吐司角色，把订单确认、打包、感谢和打烊告别统一起来。表情传递服务语气，具体订单、时间与售后条款仍应由文字说明。',
      color: '#d9e3ca', avatar: '店', chatName: '吐司小店 · 客服演示', directionIds: ['mascot', 'reply'],
      identity: '焦糖面包边、奶油色脸、青绿围裙和一颗浅色纽扣。',
      usefulness: '每一张都放进实际服务节点，减少生硬的重复回复。',
      next: '可扩展到行业回复包、节日换装和门店月度内容。',
      origin: '原创虚构小店角色与演示对话，不代表真实店铺、成交记录或客服系统。',
      stickers: [
        { id: 'confirm', label: '收到，安排', action: '点头接单', message: '你好，我预订的两份面包还是老时间来取。', use: '确认已看到消息，具体安排再用文字核对。' },
        { id: 'packing', label: '正在打包', action: '合上纸盒', message: '我快到店门口了，麻烦帮我打包一下。', use: '反馈正在处理的状态，不虚构到达时间。' },
        { id: 'thanks', label: '谢谢支持', action: '抱心鞠躬', message: '今天的面包很好吃，下次还来。', use: '在交付后表达感谢。' },
        { id: 'closed', label: '明天见', action: '举牌挥手', message: '今天先不去了，明天过来看看。', use: '自然结束对话，保留亲切的服务语气。' }
      ]
    }
  ]
};
