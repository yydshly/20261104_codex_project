import { EXTENSION_AXES, expansionPrompt, expansionText } from './extension-plans.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

export function buildExpansionBundle(effects) {
  return {
    version: 1,
    title: '海的切片 · 二十项效果的八十份扩展方案',
    effectCount: effects.length,
    planCount: effects.reduce((sum, effect) => sum + effect.extensions.length, 0),
    status: '创作方案，尚未生成对应成图或视频',
    referenceAuthor: '페빗 / PEBIT',
    effects: effects.map(effect => ({
      number: effect.number, id: effect.id, name: effect.name,
      source: effect.source, originalGoal: effect.goal,
      plans: effect.extensions.map(plan => ({ ...plan, prompt: expansionPrompt(effect, plan) })),
    })),
  };
}

export function mountExtensionPlans({ effects, getEffect, selectEffect, copy, download, initialAxis = 'detail', onAxisChange, reduceMotion }) {
  let axis = EXTENSION_AXES.some(item => item.id === initialAxis) ? initialAxis : 'detail';
  const selector = $('#extension-effect-select');
  const tablist = $('.extension-tabs');
  const panel = $('#extension-panel');

  function activePlan(effect = getEffect()) { return effect.extensions.find(plan => plan.axis === axis); }

  function render(effect = getEffect()) {
    const plan = activePlan(effect);
    selector.value = effect.id;
    $('#extension-source-summary').textContent = `起点特征：${effect.goal}`;
    $$('.extension-tabs [role=tab]').forEach(tab => {
      const selected = tab.dataset.axis === axis;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `extension-tab-${axis}`);
    panel.dataset.plan = plan.id;
    $('#extension-code').textContent = `${effect.number} / ${effect.name} → ${plan.name}`;
    $('#extension-title').textContent = plan.title;
    $('#extension-medium').textContent = plan.medium;
    $('#extension-target').textContent = plan.target;
    $('#extension-shot').textContent = plan.shot;
    $('#extension-deliverable').textContent = plan.deliverable;
    $('#extension-reference-image').src = effect.reference;
    $('#extension-reference-image').alt = `PEBIT 原帖第 ${effect.number} 张参考局部，扩展方案的光影起点`;
    $('#extension-reference-caption').textContent = `${effect.number} · 参考局部`;
    $('#extension-reference-link').href = effect.source;
    $('#extension-partners').replaceChildren();
    $('#extension-partners-row').hidden = !plan.partners?.length;
    for (const partnerId of plan.partners || []) {
      const partner = effects.find(item => item.id === partnerId);
      $('#extension-partners').append(node('span', 'partner-chip', `${partner.number} ${partner.name}`));
    }
    $('#extension-timeline').hidden = !plan.beats;
    $('#extension-beats').replaceChildren();
    if (plan.beats) {
      const timing = ['0–2 秒', '2–5 秒', '5–8 秒'];
      plan.beats.forEach((beat, index) => {
        const li = node('li'); li.append(node('span', 'beat-time', timing[index]), node('p', '', beat));
        $('#extension-beats').append(li);
      });
    }
    $('#extension-steps').replaceChildren(...plan.steps.map(step => node('li', '', step)));
    $('#extension-criteria').replaceChildren(...plan.criteria.map(criterion => node('li', '', criterion)));
    $('#extension-avoid').textContent = plan.avoid;
    $$('#extension-overview button[data-plan]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.plan === plan.id)));
  }

  function setAxis(next, focus = false) {
    if (!EXTENSION_AXES.some(item => item.id === next)) return;
    axis = next; render(); onAxisChange?.(axis);
    if (focus) $(`#extension-tab-${axis}`).focus();
  }

  for (const effect of effects) {
    const option = node('option', '', `${effect.number} ${effect.name}`); option.value = effect.id; selector.append(option);
    const row = node('div', 'extension-overview-row');
    const title = node('h4'); title.append(node('span', '', effect.number), document.createTextNode(effect.name));
    const goals = node('div');
    for (const plan of effect.extensions) {
      const button = node('button'); button.type = 'button'; button.dataset.plan = plan.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${effect.number} ${effect.name}，${plan.name}：${plan.title}`);
      button.append(node('small', '', plan.name), document.createTextNode(plan.title));
      button.addEventListener('click', () => {
        axis = plan.axis; onAxisChange?.(axis); selectEffect(effect.id);
        panel.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
        panel.focus({ preventScroll: true });
      });
      goals.append(button);
    }
    row.append(title, goals); $('#extension-overview').append(row);
  }

  for (const item of EXTENSION_AXES) {
    const button = node('button'); button.type = 'button'; button.id = `extension-tab-${item.id}`; button.dataset.axis = item.id;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-label', item.name); button.setAttribute('aria-controls', 'extension-panel');
    button.setAttribute('aria-selected', String(item.id === axis)); button.tabIndex = item.id === axis ? 0 : -1;
    const number = node('span', 'extension-axis-number', item.number); number.setAttribute('aria-hidden', 'true');
    const description = node('span', 'extension-axis-desc', item.description); description.id = `extension-description-${item.id}`;
    button.setAttribute('aria-describedby', description.id);
    button.append(node('span', 'extension-axis-name', item.name), number, description);
    button.addEventListener('click', () => setAxis(item.id)); tablist.append(button);
  }

  selector.addEventListener('change', event => selectEffect(event.target.value));
  $('#browse-extension-overview').addEventListener('click', () => {
    const directory = $('#extension-directory'); directory.open = true;
    directory.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    directory.querySelector('summary').focus({ preventScroll: true });
  });
  tablist.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = EXTENSION_AXES.findIndex(item => item.id === (event.target.closest('[data-axis]')?.dataset.axis || axis));
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? EXTENSION_AXES.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + EXTENSION_AXES.length) % EXTENSION_AXES.length;
    setAxis(EXTENSION_AXES[next].id, true);
  });

  $('#copy-extension-plan').addEventListener('click', () => copy(expansionText(getEffect(), activePlan()), '完整扩展方案已复制'));
  $('#copy-extension-prompt').addEventListener('click', () => copy(expansionPrompt(getEffect(), activePlan()), '当前方案的生成指令已复制'));
  $('#download-extension').addEventListener('click', () => {
    const effect = getEffect(), plan = activePlan(effect);
    const record = { version: 1, parent: { number: effect.number, id: effect.id, name: effect.name, reference: effect.source }, plan: { ...plan, prompt: expansionPrompt(effect, plan) }, note: '待制作方案，尚未生成对应成图或视频。' };
    download(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json;charset=utf-8' }), `ocean-expansion-${effect.number}-${plan.axis}.json`);
  });
  $('#download-all-extensions').addEventListener('click', () => download(new Blob([JSON.stringify(buildExpansionBundle(effects), null, 2)], { type: 'application/json;charset=utf-8' }), 'ocean-extension-plans-80.json'));
  return { render, get axis() { return axis; } };
}
