const $ = id => document.getElementById(id);
const skills = [
  { id: 'game-design-theory', title: '规则与成长', heading: '让每章结束都有下一步', requirement: '采用核心循环、阶段奖励、明确因果与挑战渐进的要求。', problem: '上一版只有单场清敌与点灯，胜利后缺少成长和后续目标。', value: '把动作连接成战斗、拾取、修复、选择装备、挑战下一章的完整循环。升级改变后续属性，三章增加不同的观察与应对。', evidence: ['第一章近战，第二章远近组合，第三章双阶段首领。','两次三选一，伤害、生命或冲刺参数发生真实变化。','首领保护期与收招期使用不同判定，文字提示对应规则。'], code: 'content.js', play: 'index.html' },
  { id: 'game-engine', title: '状态与性能', heading: '重试、续玩与画面各有明确边界', requirement: '采用输入、更新、渲染分工，以及 delta time、碰撞、对象复用和性能诊断要求。', problem: '单场状态需要扩成跨关卡航程，重新载入时容易重复奖励或残留弹幕；静态画面绘制开销偏高。', value: '建立可序列化的关卡入口检查点，升级只结算一次。模拟使用固定步长，渲染通过批处理、缓存阴影和画质档位控制开销。', evidence: ['存档校验拒绝未知版本和不合法的关卡、装备与记录。','重试重新创建本关敌人、弹丸与掉落，保留前章装备。','同场景保留原型与产品的绘制次数、帧时间和画质记录。'], code: 'campaign.js', play: 'index.html' },
  { id: 'game-ui-design', title: '页面流程', heading: '把玩家会经过的屏幕补齐', requirement: '采用完整界面清单、各屏主要行动、结果结算与边界状态的要求。', problem: '只展示战斗 HUD，无法回答失败后去哪、升级怎么选、刷新后怎么继续。', value: '围绕短篇动作游戏选择必需页面，让每次结束都落到明确行动，开场、失败、关间和最终结局形成可操作的流程。', evidence: ['标题提供新航程与检查点继续，章节说明给出当前目标。','升级说明直接显示属性变化，失去体力与时间耗尽分别解释。','结局显示总分、累计行动时间与受伤次数，并可重新游玩。'], code: 'game.js', play: 'index.html' },
  { id: 'game-ui-ux', title: '输入适配', heading: '界面切换时，输入也要正确交接', requirement: '采用安全区、布局容器、弹窗焦点、输入归属与界面状态更新要求。', problem: '触屏取消可能留下按住状态，设置弹窗可能把焦点放到背后的控件，手机横竖屏可能挤压操作区。', value: '以同一组游戏意图接收键鼠、触屏与手柄。触控取消和失焦会复位输入，原生模态设置保持焦点，转屏保留当前航程。', evidence: ['浏览器实际派发双指触控，移动与挥击可以同时保持。','touchCancel 后摇杆与攻击状态均清零，窗口失焦自动暂停。','竖屏、横屏、键盘 Tab 和 44px 以上主要触控目标已检查。'], code: 'game.js', play: 'index.html?preview=1&chapter=1' },
  { id: 'threejs-game-ui-designer', title: '世界与 HUD', heading: '玩家看见的目标，跟世界状态一致', requirement: '采用生存信息优先、游戏化 HUD、完整菜单状态与世界风格统一的要求。', problem: '状态面板容易变成与战场无关的信息卡，生命、目标、冷却与首领阶段缺少清楚的轻重。', value: '生命与潮汐时间、灯芯与目标、冲刺冷却分别占据稳定位置。首领有阶段与血条，集齐灯芯后才出现信标交互。', evidence: ['HUD 读取权威状态，拾取、受伤、升级与关卡切换同步更新。','信标灯光、可交互提示和结算状态共用同一完成条件。','桌面与手机实帧保留在验证目录，可检查文字与遮挡。'], code: 'scene.js', play: 'index.html?preview=1&chapter=2' },
  { id: 'game-feel', title: '命中反馈', heading: '反馈说明发生了什么', requirement: '采用响应、可预测特殊动作、动作与音效协调，以及反馈强度匹配的要求。', problem: '空挥、命中、甲壳挡住、受伤和拾取具有不同含义，单纯增加粒子无法说明这些区别。', value: '用模拟产生的语义事件驱动反馈，空挥有挥刀动作，命中有短暂停顿、闪白与撞击声，甲壳挡住有单独提示，冲刺轨迹和无敌窗口保持确定。', evidence: ['命中停顿 45ms，受击无敌 1.2s，参数集中在 content.js。','粒子池有固定上限，简洁与减少动态模式保留危险预警。','浏览器记录输入事件到动作帧提交间隔，物理端到端延迟尚待测量。'], code: 'scene.js', play: 'index.html?preview=1&chapter=0' },
];
const questions = { 'game-design-theory':'玩法没形成循环，关卡和奖励缺少递进', 'game-engine':'输入、碰撞、状态、画面或性能需要组织', 'game-developer':'在 Unity / Unreal 实现系统、物理、网络或优化', 'game-ui-design':'开场、战斗、成长、失败与结算页面缺漏', 'game-ui-ux':'手机、安全区、弹窗焦点或输入交接出问题', 'threejs-game-ui-designer':'Three.js 世界、HUD 与菜单需要统一', 'game-feel':'移动、命中、受伤或冲刺反馈不清楚', 'higgsfield-websites':'通过 Higgsfield 生成素材、构建与部署网站或游戏' };

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} ${response.status}`);
  return response.json();
}
let sources = [];
function selectSkill(index) {
  const skill = skills[index];
  const source = sources.find(source => source.name === skill.id);
  [...$('skill-tabs').children].forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
  $('skill-detail').setAttribute('aria-labelledby', `skill-${index}`);
  $('skill-detail').innerHTML = `<div class="detail-main"><span class="skill-name">${skill.id}</span><h3>${skill.heading}</h3><p>${skill.problem}</p><p class="value">${skill.value}</p><div class="detail-links"><a href="${skill.play}">去游戏里体验</a><a href="${source?.source || '#sources'}">查看 Skill 原文</a></div></div><div class="detail-evidence"><h4>本轮采用的要求</h4><p>${skill.requirement}</p><h4>对应产物与检查</h4><ul>${skill.evidence.map(text => `<li>${text}</li>`).join('')}</ul><div class="detail-links"><a href="${skill.code}">对应实现 ${skill.code}</a><a href="${source?.source || '#sources'}">上游原文</a></div></div>`;
}
$('skill-tabs').innerHTML = skills.map((skill, index) => `<button role="tab" id="skill-${index}" aria-controls="skill-detail" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${skill.title}</button>`).join('');
[...$('skill-tabs').children].forEach((button, index) => {
  button.onclick = () => selectSkill(index);
  button.onkeydown = event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? skills.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + skills.length) % skills.length;
    selectSkill(next); $('skill-tabs').children[next].focus();
  };
});
selectSkill(0);
try {
  const [manifest, browser, run, performance] = await Promise.all([
    loadJson('skill-sources/manifest.json'), loadJson('evidence/browser-verification.json'), loadJson('evidence/playthrough.json'), loadJson('evidence/performance.json'),
  ]);
  sources = manifest;
  selectSkill(0);
  $('test-count').textContent = `${18 + browser.passed} 项`;
  $('completion').textContent = run.completed ? '已通关' : '待完成';
  $('proof-summary').innerHTML = `<p><strong>18 项规则测试</strong><br>覆盖重试、暂停、输入优先级、拾取、升级、存档校验、弹道、首领与胜负边界。</p><p><strong>${browser.passed} 项浏览器检查</strong><br>实际打开页面、操作控件与触控事件，记录 ${browser.runtimeErrors.length} 个未处理运行错误。</p><p><strong>一轮完整键盘实玩</strong><br>完成三章，用时 ${run.wallSeconds.toFixed(1)} 秒，重试 ${run.retries} 次，受伤 ${run.final.totals.damage} 次。操作程序已知规则与目标位置。</p>`;
  $('video-caption').textContent = `正常键盘与菜单操作完成三章，用时 ${run.wallSeconds.toFixed(1)} 秒。视频包含战斗、拾取、两次装备选择和最终信标修复。`;
  const baseline = performance.results.baseline;
  const standard = performance.results.standard || performance.results.product;
  const automatic = performance.results.auto;
  $('performance-data').innerHTML = `<div class="perf-row"><span></span><span>旧版原型</span><span>产品标准画质</span></div><div class="perf-row"><span>每帧绘制调用</span><b>${baseline.drawCalls}</b><b>${standard.drawCalls}</b></div><div class="perf-row"><span>平均帧时间</span><span>${baseline.averageMs.toFixed(1)} ms</span><span>${standard.averageMs.toFixed(1)} ms</span></div>${automatic ? `<div class="perf-row"><span>自动画质</span><span>画布比例 ${automatic.pixelRatio}</span><span>${automatic.averageMs.toFixed(1)} ms</span></div>` : ''}<div class="perf-meta">${performance.viewport.width} × ${performance.viewport.height} CSS 视口 · 每项 ${performance.sampleSeconds} 秒样本<br>SwiftShader 软件渲染 · 自动模式以三维画布清晰度换取流畅度</div>`;
  $('source-table').querySelector('tbody').innerHTML = manifest.map(source => `<tr><td><code>${source.name}</code></td><td>${questions[source.name]}</td><td><span class="usage ${source.usage === 'used' ? '' : 'catalog'}">${source.usage === 'used' ? '实际采用' : '目录收录'}</span></td><td><a href="${source.source}">GitHub 原文</a> · <a href="${source.source}">上游原文</a></td></tr>`).join('');
} catch (error) {
  $('proof-summary').textContent = '验证记录未能载入，可通过下方链接查看原始文件。';
  $('test-count').textContent = '记录待载入';
  console.error(error);
}
