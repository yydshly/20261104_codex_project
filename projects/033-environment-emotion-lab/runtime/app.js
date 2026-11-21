import { directions, principles, stages } from './data.js';
import { createScene } from './art-scene.js';
import { createPondWorld } from './pond-world.js';

const byId = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroStatus = byId('heroStatus');
const soundButton = byId('soundToggle');
let soundEnabled = false;
let activeDirection = 0;
let activePrinciple = 0;

function setAudioState({ enabled, error }) {
  soundEnabled = Boolean(enabled);
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  byId('soundLabel').textContent = soundEnabled ? '关闭声音' : '开启声音';
  if (error) heroStatus.textContent = `声音暂时未能开启：${error}。画面仍可继续体验。`;
}

const heroScene = createPondWorld(byId('heroCanvas'), {
  onInteraction: ({ title, detail }) => {
    heroStatus.textContent = `${title} · ${detail}`;
    byId('lampAction').textContent = heroScene.getState().fireflies ? '收起萤火' : '点亮萤火';
  },
  onAudioState: setAudioState,
});
const directionScene = createScene(byId('directionCanvas'), {
  onInteraction: ({ title, detail }) => { byId('directionStatus').textContent = `${title} · ${detail}`; },
});
heroScene.setOptions({ volume: 0.28, motion: !reducedMotion.matches });
directionScene.setOptions({ motion: !reducedMotion.matches });
byId('motionToggle').checked = !reducedMotion.matches;

soundButton.addEventListener('click', async () => {
  soundButton.disabled = true;
  try {
    await heroScene.setSound(!soundEnabled);
    if (soundEnabled) heroStatus.textContent = '环境声已开启。鸭子的叫声、拍水和阵风会跟随动作回应。';
    else heroStatus.textContent = '声音已关闭。你仍然可以观察光线、动态与操作回应。';
  } catch (error) {
    setAudioState({ enabled: false, error: error?.message || '浏览器暂不支持' });
  } finally { soundButton.disabled = false; }
});

document.querySelectorAll('[data-phase]').forEach((button) => {
  button.addEventListener('click', () => {
    const phase = button.dataset.phase;
    heroScene.setOptions({ phase });
    document.querySelectorAll('[data-phase]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    byId('phaseLabel').textContent = phase === 'night' ? 'NIGHT / 夜晚' : 'DUSK / 暮色';
    heroStatus.textContent = phase === 'night' ? '同一个地方，进入夜晚。观察天色、窗光与环境细节如何共同变化。' : '回到暮色。场景保持熟悉，光线带来不同的感受线索。';
  });
});
byId('detailsToggle').addEventListener('change', (event) => {
  heroScene.setOptions({ details: event.target.checked });
  byId('lampAction').disabled = !event.target.checked;
  heroStatus.textContent = event.target.checked ? '萤火与细微的水纹已加入。' : '萤火与辅助水纹已收起，留一处更安静的空间。';
});
byId('motionToggle').addEventListener('change', (event) => {
  heroScene.setOptions({ motion: event.target.checked });
  heroStatus.textContent = event.target.checked ? '缓慢动态已开启。环境在持续活动，操作反馈也保持短暂。' : '持续动态已关闭。你仍可点击物件，得到清楚的状态回应。';
});
byId('volume').addEventListener('input', (event) => {
  const value = Number(event.target.value);
  byId('volumeValue').textContent = `${value}%`;
  event.target.setAttribute('aria-valuetext', `${value}%`);
  heroScene.setOptions({ volume: value / 100 });
});
byId('duckAction').addEventListener('click', () => heroScene.trigger('duck'));
byId('randomDuckToggle').addEventListener('click',()=>{const enabled=!heroScene.getState().randomDuckCalls;heroScene.setOptions({randomDuckCalls:enabled});byId('randomDuckToggle').setAttribute('aria-pressed',String(enabled));byId('randomDuckToggle').textContent=enabled?'随机鸭叫 · 开':'随机鸭叫 · 关';heroStatus.textContent=enabled?'鸭子会隔一会儿自己叫一声；需要先开启声音。':'随机鸭叫已关闭，仍可手动呼唤。';});
byId('lampAction').addEventListener('click', () => heroScene.trigger('lamp'));
byId('windAction').addEventListener('click', () => heroScene.trigger('wind'));
byId('resetView').addEventListener('click', () => heroScene.trigger('reset'));
byId('windAmount').addEventListener('input', event => {
  const value=Number(event.target.value);heroScene.setOptions({wind:value/100});
  byId('windValue').textContent=`${value}%`;
});

const pathway = byId('pathway');
stages.forEach((stage, index) => {
  const article = document.createElement('article');
  article.className = 'pathway-step';
  const meta = document.createElement('div');
  meta.className = 'step-meta';
  const number = document.createElement('span');
  number.textContent = `0${index + 1}`;
  const label = document.createElement('span');
  label.textContent = stage.stage;
  meta.append(number, label);
  const title = document.createElement('h3');
  title.textContent = stage.title;
  const description = document.createElement('p');
  description.textContent = stage.description;
  article.append(meta, title, description);
  pathway.append(article);
});

const directionPicker = byId('directionPicker');
directions.forEach((direction, index) => {
  const button = document.createElement('button');
  button.className = 'direction-tab';
  button.id = `direction-${direction.id}`;
  button.type = 'button';
  button.role = 'tab';
  button.setAttribute('aria-controls', 'directionDetail');
  button.setAttribute('aria-selected', String(index === 0));
  button.tabIndex = index === 0 ? 0 : -1;
  const number = document.createElement('span');
  number.className = 'direction-index';
  number.textContent = direction.number;
  const content = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = direction.name;
  const scene = document.createElement('small');
  scene.textContent = `${direction.scene} · ${direction.tagline.replace(/[。！]$/, '')}`;
  content.append(title, scene);
  const arrow = document.createElement('span');
  arrow.className = 'direction-arrow';
  arrow.ariaHidden = 'true';
  arrow.textContent = '↗';
  button.append(number, content, arrow);
  button.addEventListener('click', () => selectDirection(index));
  button.addEventListener('keydown', (event) => navigateTabs(event, directions.length, index, selectDirection, '.direction-tab'));
  directionPicker.append(button);
});

function selectDirection(index) {
  activeDirection = index;
  const direction = directions[index];
  document.querySelectorAll('.direction-tab').forEach((tab, tabIndex) => {
    tab.setAttribute('aria-selected', String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });
  byId('directionDetail').setAttribute('aria-labelledby', `direction-${direction.id}`);
  byId('detailType').textContent = direction.name;
  byId('detailNumber').textContent = `${direction.number} / 06`;
  byId('detailScene').textContent = direction.scene;
  byId('detailTagline').textContent = direction.tagline;
  const facts = [
    ['适用时刻', direction.context], ['目标感受', direction.feeling],
    ['主场景', direction.composition], ['声音搭配', direction.sound],
    ['操作回应', direction.interaction], ['留下什么', direction.accumulation],
    ['实际价值', direction.value],
  ];
  byId('detailFacts').replaceChildren(...facts.map(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const definition = document.createElement('dd');
    definition.textContent = value;
    row.append(term, definition);
    return row;
  }));
  byId('detailFirst').textContent = direction.firstVersion;
  byId('detailQuestion').textContent = `值得验证：${direction.question}`;
  byId('directionStatus').textContent = `${direction.scene} · 画面已制作，以下为这个方向可以发展的交互与用途。`;
  byId('directionCanvas').setAttribute('aria-label', `${direction.scene}的完整场景美术。点击或按回车，可以感受局部回应。`);
  directionScene.setMode(direction.id);
}

const principleTabs = byId('principleTabs');
principles.forEach((principle, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.role = 'tab';
  button.id = `principle-${principle.id}`;
  button.textContent = principle.title;
  button.setAttribute('aria-controls', 'principlePanel');
  button.setAttribute('aria-selected', String(index === 0));
  button.tabIndex = index === 0 ? 0 : -1;
  button.addEventListener('click', () => selectPrinciple(index));
  button.addEventListener('keydown', (event) => navigateTabs(event, principles.length, index, selectPrinciple, '.principle-tabs button'));
  principleTabs.append(button);
});
function selectPrinciple(index) {
  activePrinciple = index;
  const principle = principles[index];
  document.querySelectorAll('.principle-tabs button').forEach((tab, tabIndex) => {
    tab.setAttribute('aria-selected', String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });
  byId('principlePanel').setAttribute('aria-labelledby', `principle-${principle.id}`);
  byId('principleTitle').textContent = `${principle.title}，如何参与构造体验？`;
  byId('principleRole').textContent = principle.role;
  byId('principleExample').textContent = principle.example;
}
function navigateTabs(event, length, index, select, selector) {
  let next = index;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + length) % length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = length - 1;
  else return;
  event.preventDefault();
  select(next);
  document.querySelectorAll(selector)[next].focus();
}

selectDirection(activeDirection);
selectPrinciple(activePrinciple);

const exhibit = document.querySelector('.scene-exhibit');
const immersiveButton = byId('immersiveToggle');
const panelButton = byId('panelToggle');
function setPanelVisible(visible) {
  exhibit.classList.toggle('controls-hidden', !visible);
  panelButton.textContent = visible ? '隐藏面板' : '显示面板';
  panelButton.setAttribute('aria-expanded', String(visible));
}
panelButton.addEventListener('click', () => setPanelVisible(exhibit.classList.contains('controls-hidden')));
function setImmersive(enabled) {
  exhibit.classList.toggle('is-expanded', enabled);
  if (!enabled) setPanelVisible(true);
  document.body.classList.toggle('scene-open', enabled);
  immersiveButton.textContent = enabled ? '退出场景 ×' : '进入场景 ↗';
  immersiveButton.setAttribute('aria-expanded', String(enabled));
  heroScene.setOptions({immersive:enabled});
}
immersiveButton.addEventListener('click', () => setImmersive(!exhibit.classList.contains('is-expanded')));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setImmersive(false); });

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('nav a').forEach((link) => {
      const active = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-12% 0px -60% 0px', threshold: 0 });
document.querySelectorAll('main > section[id]').forEach((section) => sectionObserver.observe(section));

reducedMotion.addEventListener('change', (event) => {
  byId('motionToggle').checked = !event.matches;
  heroScene.setOptions({ motion: !event.matches });
  directionScene.setOptions({ motion: !event.matches });
});
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { heroScene.dispose(); directionScene.dispose(); sectionObserver.disconnect(); }
});
