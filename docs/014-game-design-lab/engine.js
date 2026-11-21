import { byId } from './data.js';

export function makeBrief({ title = '', primary = 'spire', secondary = 'valley', intent = '策略推演' }) {
  const a = byId[primary] || byId.spire, b = byId[secondary] || byId.valley;
  const same = a.id === b.id;
  const pair = new Set([a.id,b.id]);
  let tension = '先验证主循环，再加入辅助机制。观察辅助机制有没有带来新的选择，或只是增加操作。';
  if (pair.has('valley') && (pair.has('dungeon') || pair.has('brothers'))) tension = '温暖经营与永久损失的情绪预期可能冲突。可以把危险设计为自愿出发，并为日常生活保留恢复空间。';
  else if (pair.has('factory') && pair.has('valley')) tension = '效率目标可能挤压自由生活。让自动化释放时间，同时保留装饰、探索和关系等非效率目标。';
  else if (pair.has('spire') && pair.has('brothers')) tension = '单局重来与长期队员养成需要明确边界。可以让牌组在任务内变化，队员经历在任务间保留。';
  else if (pair.has('factory') && pair.has('dungeon')) tension = '持续扩张与高压损耗需要不同节奏。把危险放在资源远征中，让基地承担整备和理解系统的空间。';
  if (same) tension = '两个位置选择了同一款游戏。先把一种体验做扎实；需要新关系时，再引入另一种机制。';
  const pacing = {
    '策略推演': '在关键行动前显示必要信息，允许停下来比较方案；反馈要能解释选择为何奏效。',
    '放松经营': '让目标可自选、失误可恢复，把进展留在世界里；效率挑战作为自愿参与的活动。',
    '紧张冒险': '用明确预警逐步提高风险，在继续与撤退之间制造取舍，并安排整备与恢复的间隙。',
    '自由创造': '降低改造和重试成本，提供可观察的反馈，让玩家通过组合、试错形成自己的方案。'
  };
  const bridge = {
    spire: '在关键节点提供三选一奖励，让已有方案随过程改变',
    valley: '让一次劳动留下可见进展，并把成果保留到下一天',
    dungeon: '让深入与撤退争夺同一种有限补给，预告两者代价',
    factory: '增加一项能释放操作时间的自动化设施，显示输入与产出',
    brothers: '让一名有名字的成员，把一次任务的损伤带回下一次整备'
  };
  const chosenIntent = Object.hasOwn(pacing,intent) ? intent : '策略推演';
  const brief = { title: title.trim().slice(0,60) || '我的游戏设计草案', intent: chosenIntent, pace: pacing[chosenIntent], primary: a.name, secondary: same ? '暂不叠加' : b.name, question: a.question, loop: a.loop, mechanic: a.borrow, art: a.art, support: same ? '保持单一主循环。' : `借鉴${b.name}：${b.borrow}`, tension, tasks: [a.mvp[0],a.mvp[1],same?a.mvp[2]:bridge[b.id]], boundary: '这是依据研究内容生成的原型提案，玩法可行性、平衡与玩家体验需要实际测试。' };
  return brief;
}
export function briefMarkdown(b) {
  return `# ${b.title}\n\n- 体验目标：${b.intent}\n- 主参考：${b.primary}\n- 辅助参考：${b.secondary}\n\n## 核心选择\n\n${b.question}\n\n## 核心循环\n\n${b.loop.join(' → ')}\n\n## 体验节奏\n\n${b.pace}\n\n## 借鉴与美术\n\n${b.mechanic}\n\n${b.support}\n\n美术方向：${b.art}\n\n## 需要处理的矛盾\n\n${b.tension}\n\n## 第一个可验证原型\n\n${b.tasks.map(t=>`- ${t}`).join('\n')}\n\n${b.boundary}\n`;
}
