const $ = id => document.getElementById(id);
const overviewDialog = $('overview-dialog');
const zoomImage = $('overview-zoom-image');
let overviewTrigger = null;
let previousOverflow = '';
function openOverview(event) {
  event.preventDefault();
  overviewTrigger = event.currentTarget;
  previousOverflow = document.body.style.overflow;
  overviewDialog.showModal();
  document.body.style.overflow = 'hidden';
  zoomImage.style.width = '100%';
  $('map-viewport').scrollTo(0, 0);
}
$('open-overview').addEventListener('click', openOverview);
$('overview-image-link').addEventListener('click', openOverview);
$('map-close').addEventListener('click', () => overviewDialog.close());
$('map-fit').addEventListener('click', () => { zoomImage.style.width = '100%'; });
$('map-original').addEventListener('click', () => { zoomImage.style.width = '2240px'; });
function changeZoom(scale) {
  zoomImage.style.width = `${Math.max(300, Math.min(4480, zoomImage.getBoundingClientRect().width * scale))}px`;
}
$('map-plus').addEventListener('click', () => changeZoom(1.25));
$('map-minus').addEventListener('click', () => changeZoom(0.8));
overviewDialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  overviewTrigger?.focus();
});
$('comparison-slider').addEventListener('input', event => {
  const value = Number(event.target.value);
  $('before-layer').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  $('compare-line').style.left = `${value}%`;
});
document.querySelectorAll('audio').forEach(player => player.addEventListener('play', () => {
  document.querySelectorAll('audio').forEach(other => { if (other !== player) other.pause(); });
}));
const json = async path => { const response = await fetch(path); if (!response.ok) throw new Error(path); return response.json(); };
try {
  const [sources, checks, run, performance, repeat] = await Promise.all([
    json('skill-sources/v2/manifest.json'),json('evidence/v2/browser-verification.json'),json('evidence/v2/playthrough.json'),json('evidence/v2/performance.json'),json('evidence/v2/reproducibility.json'),
  ]);
  document.querySelectorAll('[data-source]').forEach(link => { link.href = sources.find(source => source.name === link.dataset.source).source; });
  $('verified').textContent = `${22 + checks.passed} 项`;
  $('test-summary').textContent = `第二轮原记录：22 项规则测试、${checks.passed} 项游戏浏览器检查通过，${checks.runtimeErrors.length} 个未处理运行错误；另有 9 项当时的展示检查。检查覆盖资源加载、Q 实际伤害与声音、手机操作、存档与产品流程，不代表玩家偏好或 Skill 的独立增益。`;
  $('repeat-summary').textContent = `同一配方重复生成后，${repeat.comparedFiles} 个 GLB / WAV / PNG 文件中 ${repeat.changed.length} 个字节哈希发生变化。原始结果保存在可重建性报告中。`;
  $('run-summary').textContent = `三章实玩 ${run.wallSeconds.toFixed(1)} 秒，重试 ${run.retries} 次，释放共鸣 ${run.final.totals.pulses} 次。录像包含游戏音频；程序已知目标位置，用时不代表普通玩家。`;
  const a = performance.results['v1-auto'], b = performance.results['v2-auto'];
  $('performance-summary').textContent = `自动画质同样降至 ${b.pixelRatio} 画布比例时，升级前平均 ${a.averageMs.toFixed(1)}ms / 帧，升级后 ${b.averageMs.toFixed(1)}ms / 帧。新版增加海面通道，效果提升伴随额外开销；完整条件见原始报告。`;
} catch (error) {
  $('verified').textContent = '记录未载入';
  $('test-summary').textContent = '验证记录载入失败，请打开下方原始记录链接。';
  console.error(error);
}

const originalQuestions = {
  'game-design-theory': '玩法规则、核心循环与挑战递进',
  'game-engine': '网页原型、更新渲染分工与碰撞',
  'game-developer': 'Unity / Unreal 引擎系统开发',
  'game-ui-design': '完整界面流程与信息组织',
  'game-ui-ux': '手机、手柄、安全区与输入交接',
  'threejs-game-ui-designer': 'Three.js 世界、HUD 与菜单',
  'game-feel': '移动、命中、受伤与冲刺反馈',
  'higgsfield-websites': 'Higgsfield 素材生成与部署',
};
function link(label, href) {
  const element = document.createElement('a');
  element.textContent = label; element.href = href;
  return element;
}
function textNode(tag, value) {
  const element = document.createElement(tag); element.textContent = value; return element;
}
async function showImplementationSources() {
  const sources = await json('skill-sources/v2/manifest.json');
  const cards = sources.map(source => {
    const card = document.createElement('article'); card.className = 'source-card';
    card.append(textNode('h4', source.name));
    card.append(textNode('p', source.repository.replace('https://github.com/', '')));
    const revision = document.createElement('p');
    revision.append('固定 commit：', textNode('code', source.commit)); card.append(revision);
    const applied = textNode('p', `实际采用：${source.applied.join('、')}`); card.append(applied);
    const links = document.createElement('div'); links.className = 'links';
    links.append(link('固定版本原文 ↗', source.source), link('来源与已记录指纹', 'skill-sources/v2/manifest.json'));
    card.append(links); return card;
  });
  $('implementation-sources').replaceChildren(...cards);
}
async function showOriginalSources() {
  const sources = await json('skill-sources/manifest.json');
  const rows = sources.map(source => {
    const row = document.createElement('tr');
    row.append(textNode('td', source.name), textNode('td', originalQuestions[source.name]), textNode('td', source.usage === 'used' ? '采用建议' : '仅目录收录'));
    const links = document.createElement('td');
    links.append(link('上游原文', source.source), ' · ', link('来源清单', 'skill-sources/manifest.json'));
    row.append(links); return row;
  });
  $('original-sources').replaceChildren(...rows);
}
showImplementationSources().catch(error => {
  $('implementation-sources').replaceChildren(textNode('p','来源载入失败，请打开下方的四项来源清单。'));
  console.error(error);
});
showOriginalSources().catch(error => {
  const row = document.createElement('tr'); const cell = textNode('td','原清单载入失败，请打开下方第一轮来源清单。');
  cell.colSpan = 4; row.append(cell); $('original-sources').replaceChildren(row); console.error(error);
});
