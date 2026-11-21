import { EFFECTS, GROUPS, CONTROL_NAMES, CONTROL_LIMITS, cleanControls, makePrompt, makeRecipe, SOURCE } from './effects.js';
import { createRenderer } from './water-renderer.js';
import { makeZip } from './zip.js';
import { mountExtensionPlans } from './extension-view.js';
import { EXTENSION_AXES } from './extension-plans.js';
import { mountReferenceStudies } from './reference-studies.js';
import { mountRealityStudies } from './reality-view.js';
import { realityForEffect, DEMO_DIRECTION } from './reality-comparisons.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const STORE = 'ocean-light-atlas:v3-real-sea';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sizes = { wallpaper: [1080, 1920], landscape: [1920, 1080], strip: [90, 1200] };
let effect = EFFECTS[0], controls = { ...effect.controls }, paramsById = {}, reviewById = {};
let method = 'build', mode = 0, group = GROUPS[0], paused = reduceMotion.matches, time = 18.7, extensionAxis = 'detail';
let realismProfile = 'calibrated', lensEffects = false;
let visible = true, lastFrame = 0, lastDraw = 0, toastTimer, saveTimer, exportBusy = false;
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || localStorage.getItem('ocean-light-atlas:v2') || 'null');
  if (saved?.version === 2 || saved?.version === 3) {
    effect = EFFECTS.find(item => item.id === saved.selected) || effect;
    if (EXTENSION_AXES.some(item => item.id === saved.extensionAxis)) extensionAxis = saved.extensionAxis;
    for (const item of EFFECTS) {
      if (saved.parameters?.[item.id]) paramsById[item.id] = cleanControls(saved.parameters[item.id], item.controls);
      // Old illustration reviews are not evidence for the new renderer. Its storage remains intact.
      if (saved.version === 3 && Array.isArray(saved.reviews?.[item.id])) reviewById[item.id] = saved.reviews[item.id].filter(i => [0, 1, 2].includes(i));
    }
    controls = { ...(paramsById[effect.id] || effect.controls) };
    if (saved.version === 3) { realismProfile = saved.realismProfile === 'reference' ? 'reference' : 'calibrated'; lensEffects = saved.lensEffects === true; }
  }
} catch { /* Optional browser-local state. */ }
const queryEffect = new URLSearchParams(location.search).get('effect');
if (EFFECTS.some(item => item.id === queryEffect)) { effect = EFFECTS.find(item => item.id === queryEffect); controls = { ...(paramsById[effect.id] || effect.controls) }; }
const queryDirection = new URLSearchParams(location.search).get('direction');
if (EXTENSION_AXES.some(item => item.id === queryDirection)) extensionAxis = queryDirection;

const viewport = $('#viewport');
let { renderer, compatibility } = createRenderer($('#ocean'), { maxPixels: 650000 });
let canvas = renderer.canvas;

function toast(text, duration = 2700) {
  clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), duration);
}
function persist() {
  paramsById[effect.id] = { ...controls };
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify({ version: 3, selected: effect.id, parameters: paramsById, reviews: reviewById, extensionAxis, realismProfile, lensEffects })); } catch { /* Local state is optional. */ } }, 100);
}
function draw() { renderer.draw(effect, controls, time, mode, {realismProfile,lensEffects}); }
function resize() {
  const box = viewport.getBoundingClientRect(); renderer.resize(box.width, box.height, Math.min(devicePixelRatio || 1, 1.4));
  $('#render-size').textContent = `${canvas.width} × ${canvas.height}`; draw();
}
function attachRenderer() {
  $('#render-status').textContent = compatibility ? '兼容预览' : '待对照验收';
  canvas.addEventListener('renderer-lost', () => {
    const replacement = canvas.cloneNode(false); canvas.replaceWith(replacement);
    const next = createRenderer(replacement, { maxPixels: 650000 }); renderer = next.renderer; compatibility = next.compatibility; canvas = renderer.canvas;
    attachRenderer(); resize(); toast('制作画面已恢复');
  }, { once: true });
}
function updatePlayback() {
  $('#pause').textContent = paused ? '▷ 播放' : 'Ⅱ 暂停';
  $('#pause').setAttribute('aria-label', paused ? '播放海面动画' : '暂停海面动画');
  $('#pause').setAttribute('aria-pressed', String(paused));
  $('#live-label').textContent = paused || controls.speed === 0 ? 'STILL' : 'LIVE';
  $('#live-dot').classList.toggle('paused', paused || controls.speed === 0);
}
function updateSliders() {
  for (const [key, value] of Object.entries(controls)) {
    $(`#${key}`).value = value;
    $(`#${key}`).style.setProperty('--range', `${value / CONTROL_LIMITS[key][1] * 100}%`);
    $(`#${key}-value`).textContent = `${value}${key === 'angle' ? '°' : '%'}`;
  }
}
function updateMode() {
  $$('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mode) === mode)));
  $('#mode-note').hidden = mode === 0;
  $('#mode-note').textContent = mode === 1 ? '反光层 · 检查亮点或亮带的组织' : '波面结构 · 颜色表示基础波面的局部朝向';
  draw();
}
function updateCriteria() {
  const checked = reviewById[effect.id] || [];
  $('#criteria').replaceChildren();
  const activeCriteria = realismProfile === 'calibrated' ? realityForEffect(effect.id).acceptance : effect.criteria;
  activeCriteria.forEach((criterion, index) => {
    const label = document.createElement('label'); label.className = 'criterion';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = checked.includes(index);
    input.addEventListener('change', () => {
      const values = new Set(reviewById[effect.id] || []); input.checked ? values.add(index) : values.delete(index);
      reviewById[effect.id] = [...values]; updateReviewStatus(); persist();
    });
    const text = document.createElement('span'); text.textContent = criterion;
    label.append(input, text); $('#criteria').append(label);
  });
  updateReviewStatus();
}
function updateReviewStatus() {
  const count = (reviewById[effect.id] || []).length;
  $('#manual-status').textContent = `${count} / 3 项已人工确认`;
  $('#render-status').textContent = compatibility ? '兼容预览' : count === 3 ? '已人工确认' : '待对照验收';
}
function updatePalette() {
  $('#palette').replaceChildren();
  effect.colors.forEach(color => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'swatch'; button.style.background = color;
    button.title = color; button.setAttribute('aria-label', `复制颜色 ${color}`); button.addEventListener('click', () => copy(color, `已复制 ${color}`)); $('#palette').append(button);
  });
}
function methodText() {
  if (method === 'ai') return makePrompt(effect, controls);
  if (method === 'photo') return `${effect.name}\n\n画面目标：${effect.goal}\n\n拍摄方法：${effect.photo}\n\n验收：${effect.criteria.join('；')}\n\n避免：${effect.avoid.join('；')}`;
  const recipe = makeRecipe(effect, controls, {realismProfile,lensEffects});
  return `${effect.name}\n\n画面目标：${realismProfile === 'calibrated' ? realityForEffect(effect.id).transfer : effect.goal}\n\n${recipe.steps.map((step, i) => `${i + 1}. ${step}`).join('\n\n')}\n\n网页实现：${recipe.implementation}\n\n验收：${recipe.acceptance.join('；')}\n\n${recipe.provenance}`;
}
function updateMethod() {
  const ai = method === 'ai';
  $('#method-content').hidden = ai; $('#prompt-text').hidden = !ai; $('#prompt-text').value = makePrompt(effect, controls);
  $('#method-content').replaceChildren();
  const reality = realityForEffect(effect.id), calibrated = realismProfile === 'calibrated';
  $('#recipe-summary').textContent = calibrated ? reality.transfer : effect.goal; $('#recipe-name').textContent = `${effect.number} / ${effect.name}`;
  const captions = { build: 'BUILD / 从画面特征反推制作', ai: 'PROMPT / 围绕结果写的画面指令', photo: 'PHOTOGRAPHY / 观察、取景与曝光' };
  $('#method-caption').textContent = captions[method];
  if (method === 'build') {
    const list = document.createElement('ol');
    (calibrated ? reality.changes : effect.steps).forEach(step => { const li = document.createElement('li'); li.textContent = step; list.append(li); });
    const technique = document.createElement('p'); technique.textContent = calibrated ? `已实施：${reality.implemented.join('；')} 仍缺少：${reality.remaining.join('；')}` : `网页制作：${effect.technique}`; $('#method-content').append(list, technique);
  } else if (method === 'photo') {
    for (const text of [effect.photo, `构图以这项结果为准：${effect.goal}`, `检查重点：${effect.criteria.join('；')}。`]) { const p = document.createElement('p'); p.textContent = text; $('#method-content').append(p); }
  }
  $('#method-hint').textContent = ai ? '随当前效果与参数更新，可交给图像工具' : method === 'photo' ? '拍摄建议按现场光线与设备调整' : '先形成主结构，再补细节，最后按标准对照';
  $('#copy-text').textContent = method === 'ai' ? '复制提示词 ↗' : method === 'photo' ? '复制实拍方法 ↗' : '复制制作路径 ↗';
}
function setMethod(next, focus = false) {
  method = next;
  $$('[data-method]').forEach(tab => { const selected = tab.dataset.method === method; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if (selected && focus) tab.focus(); });
  $('#method-panel').setAttribute('aria-labelledby', `tab-${method}`); updateMethod();
}
function sync() {
  $('#effect-select').value = effect.id; $('#outcome-number').textContent = effect.number; $('#outcome-name').textContent = effect.name;
  $('#selection-position').textContent = `${effect.number} / 20`; $('#goal').textContent = effect.goal; $('#use-case').textContent = effect.use;
  $('#demo-direction-copy').textContent = DEMO_DIRECTION.principle;
  $('#demo-record-target').textContent = effect.goal;
  $('#demo-record-clue').textContent = effect.photo;
  $('#demo-record-conditions').textContent = DEMO_DIRECTION.conditionNote;
  $('#source-link').href = effect.source; $('#reference-image').src = effect.reference; $('#reference-image').alt = `PEBIT 原帖第 ${effect.number} 张参考条带：${effect.name}`;
  $('#reference-caption').replaceChildren(document.createTextNode(`PEBIT · 原帖第 ${effect.number} 张`), document.createElement('br'), document.createTextNode('完整条带 · 保留原比例'));
  $('#image-index').textContent = `${effect.number} / ${effect.en}`; $('#render-name').textContent = effect.name;
  $('#avoid').textContent = effect.avoid.join('；'); canvas.setAttribute('aria-label', `${effect.number} ${effect.name}的当前制作画面`);
  const reality = realityForEffect(effect.id);
  $('#review-observed').textContent = realismProfile === 'calibrated' ? reality.implemented.join('；') : effect.visualReview.observed;
  $('#review-observed').previousElementSibling.textContent = realismProfile === 'calibrated' ? '本轮实际调整 · 尚待验收' : '原版首轮条带观察 · 2026-11-13';
  $('#review-next').textContent = realismProfile === 'calibrated' ? reality.remaining.join('；') : effect.visualReview.next;
  $$('.effect-card').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.effect === effect.id)));
  $('#foam').closest('label').hidden = ![1, 4, 6].includes(effect.kind);
  $('#angle').closest('label').hidden = realismProfile === 'reference' && [3, 7].includes(effect.kind);
  $('#realism-profile').value = realismProfile;
  $('#lens-effects').checked = lensEffects;
  $('#lens-effects').disabled = realismProfile === 'reference';
  $('#calibration-note').textContent = realismProfile === 'reference' ? '原版艺术化制作稿：保留原有圆斑、星芒与配色组织，方便对比；不作为真实海况证明。' : '依据机构实拍调整的研究稿：反光跟随波面，泡沫近似推进与衰减。尚非真实流体；卷浪、飞沫和水底焦散仍有差距。';
  updateSliders(); updateCriteria(); updatePalette(); updateMethod(); updatePlayback(); updateMode();
  extensionsView.render(effect);
}
function selectEffect(id, scroll = false) {
  paramsById[effect.id] = { ...controls };
  effect = EFFECTS.find(item => item.id === id) || EFFECTS[0]; controls = { ...(paramsById[effect.id] || effect.controls) }; mode = 0; sync(); persist();
  if (scroll) $('#expansions').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
}
function filterEffects() {
  const query = $('#search').value.trim().toLowerCase(); let count = 0;
  $$('.effect-card').forEach(card => {
    const item = EFFECTS.find(effect => effect.id === card.dataset.effect);
    const expansionWords = item.extensions.map(plan => `${plan.name} ${plan.title} ${plan.target}`).join(' ');
    const matches = (group === GROUPS[0] || group === item.group) && `${item.number} ${item.name} ${item.en} ${item.goal} ${item.group} ${item.use} ${expansionWords}`.toLowerCase().includes(query);
    card.hidden = !matches; if (matches) count++;
  });
  $('#empty-state').hidden = count !== 0; $('#visible-count').textContent = `${count} / 20 项效果 · 原帖顺序`;
  $$('#filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === group)));
}
async function copy(text, success) {
  try { if (!navigator.clipboard?.writeText) throw new Error(); await navigator.clipboard.writeText(text); toast(success); }
  catch {
    const field = document.createElement('textarea'); field.value = text; field.setAttribute('aria-label', '待复制内容');
    field.style.cssText = 'position:fixed;bottom:15px;left:15px;z-index:60;width:min(500px,calc(100% - 30px));height:140px;background:#fafbf5;color:#173b43;padding:15px'; document.body.append(field); field.focus(); field.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* Leave selected. */ }
    if (ok) { field.remove(); toast(success); } else { toast('内容已选中，请用系统复制'); field.addEventListener('blur', () => field.remove(), { once: true }); }
  }
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
let outputRenderer;
function getOutputRenderer() {
  if (!outputRenderer) {
    const output = createRenderer(document.createElement('canvas'), { maxPixels: 4200000 });
    if (output.compatibility) throw new Error('这套成图导出需要支持 WebGL 的浏览器');
    outputRenderer = output.renderer;
  }
  return outputRenderer;
}
function renderOutput(item, values, atTime, size) {
  const output = getOutputRenderer(); output.resize(size[0], size[1], 1); output.draw(item, values, atTime, 0, {realismProfile,lensEffects});
  return new Promise((resolve, reject) => output.canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png'));
}
function setBusy(busy) { exportBusy = busy; $('#export').disabled = busy; $('#batch-export').disabled = busy; }
async function exportCurrent() {
  if (exportBusy) return;
  const item = effect, values = { ...controls }, size = sizes[$('#output-size').value], atTime = time;
  setBusy(true);
  try { const blob = await renderOutput(item, values, atTime, size); download(blob, `ocean-${item.number}-${item.id}-${size.join('x')}.png`); toast(`已导出 ${size.join(' × ')} 成图 PNG`); }
  catch (error) { toast(error.message === '这套成图导出需要支持 WebGL 的浏览器' ? error.message : '图像导出失败，请重试'); }
  finally { setBusy(false); }
}
async function exportAll() {
  if (exportBusy) return;
  setBusy(true); const sizeKey = $('#output-size').value, size = sizes[sizeKey];
  const snapshots = EFFECTS.map(item => ({ item, values: { ...(paramsById[item.id] || item.controls) } }));
  const entries = [], manifest = [];
  try {
    for (const { item, values } of snapshots) {
      $('#batch-export').textContent = `正在制作 ${item.number} / 20…`; toast(`正在导出 ${item.number} / 20 · ${item.name}`, 60000);
      const atTime = 18.7 + Number(item.number) * .37;
      const blob = await renderOutput(item, values, atTime, size);
      const name = `${item.number}-${item.id}`;
      const recipe = { ...makeRecipe(item, values, {realismProfile,lensEffects}), output: { width: size[0], height: size[1], time: atTime, method: 'original-procedural-webgl-or-canvas' }, manualReview: reviewById[item.id] || [] };
      entries.push({ name: `images/${name}.png`, data: blob }, { name: `recipes/${name}.json`, data: JSON.stringify(recipe, null, 2) });
      manifest.push({ number: item.number, name: item.name, image: `images/${name}.png`, recipe: `recipes/${name}.json`, reference: item.source });
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    entries.push({ name: 'manifest.json', data: JSON.stringify({ version: 2, count: 20, size, items: manifest }, null, 2) });
    entries.push({ name: 'README.txt', data: `海的切片 · 二十项效果素材包\n\n包含20张本项目程序化制作的PNG与20份制作配方。尺寸：${size.join(' × ')}。\n参考摄影作者：페빗 / PEBIT\n原帖：${SOURCE}\n\n图像为原创程序化制作，不是原作者摄影文件。配方包含目标、逐项验收标准、制作步骤、参数、配色与提示词。请依据参考与验收标准继续校准，不以导出成功代替视觉达标。\n` });
    download(await makeZip(entries), `ocean-effects-20-${sizeKey}.zip`); toast('20 张成图与 20 份配方已打包导出', 4500);
  } catch (error) { toast(error.message === '这套成图导出需要支持 WebGL 的浏览器' ? error.message : '素材包导出未完成，请重试'); }
  finally { setBusy(false); $('#batch-export').textContent = '导出 20 项素材包 ↗'; }
}

for (const item of EFFECTS) {
  const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.number} ${item.name}`; $('#effect-select').append(option);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'effect-card'; button.dataset.effect = item.id; button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', `${item.number} ${item.name}：${item.goal}`);
  const thumb = document.createElement('div'); thumb.className = 'thumb';
  const img = document.createElement('img'); img.src = item.reference; img.alt = `原帖第 ${item.number} 张参考局部`; img.loading = Number(item.number) > 10 ? 'lazy' : 'eager';
  const number = document.createElement('span'); number.className = 'number'; number.textContent = item.number;
  const arrow = document.createElement('span'); arrow.className = 'arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
  thumb.append(img, number, arrow);
  const title = document.createElement('h3'); title.textContent = item.name; const description = document.createElement('p'); description.className = 'card-group'; description.textContent = item.group;
  button.append(thumb, title, description); button.addEventListener('click', () => selectEffect(item.id, true)); $('#effect-grid').append(button);
}
for (const item of GROUPS) {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.group = item; button.setAttribute('aria-pressed', String(item === group)); button.textContent = item;
  const count = document.createElement('small'); count.textContent = item === GROUPS[0] ? '20' : EFFECTS.filter(effect => effect.group === item).length; button.append(count);
  button.addEventListener('click', () => { group = item; filterEffects(); }); $('#filters').append(button);
}
for (const [key, label] of Object.entries(CONTROL_NAMES)) {
  const wrapper = document.createElement('label'); wrapper.htmlFor = key;
  const row = document.createElement('span'); row.textContent = label;
  const output = document.createElement('output'); output.id = `${key}-value`; output.htmlFor = key; row.append(output);
  const input = document.createElement('input'); input.type = 'range'; input.id = key; input.min = CONTROL_LIMITS[key][0]; input.max = CONTROL_LIMITS[key][1]; input.value = controls[key];
  input.addEventListener('input', () => { controls[key] = Number(input.value); reviewById[effect.id] = []; updateSliders(); updateCriteria(); updateMethod(); updatePlayback(); draw(); persist(); });
  wrapper.append(row, input); $('#sliders').append(wrapper);
}
$('#search').addEventListener('input', filterEffects);
$('#effect-select').addEventListener('change', event => selectEffect(event.target.value));
$('#previous-effect').addEventListener('click', () => selectEffect(EFFECTS[(EFFECTS.indexOf(effect) + 19) % 20].id));
$('#next-effect').addEventListener('click', () => selectEffect(EFFECTS[(EFFECTS.indexOf(effect) + 1) % 20].id));
$('#reset').addEventListener('click', () => { controls = { ...effect.controls }; reviewById[effect.id] = []; mode = 0; sync(); persist(); toast('已恢复这一项的制作参数'); });
$('#realism-profile').addEventListener('change', event => { realismProfile = event.target.value; reviewById = {}; sync(); persist(); });
$('#lens-effects').addEventListener('change', event => { lensEffects = event.target.checked; reviewById[effect.id] = []; updateCriteria(); draw(); persist(); });
$('#pause').addEventListener('click', () => { paused = !paused; updatePlayback(); });
$$('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = Number(button.dataset.mode); updateMode(); }));
$$('[data-method]').forEach(button => button.addEventListener('click', () => setMethod(button.dataset.method)));
$('.tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); const methods = ['build', 'ai', 'photo']; const index = methods.indexOf(event.target.closest('[data-method]')?.dataset.method || method);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3; setMethod(methods[next], true);
});
$('#copy-text').addEventListener('click', () => copy(methodText(), '当前制作内容已复制'));
$('#export').addEventListener('click', exportCurrent); $('#batch-export').addEventListener('click', exportAll);
$('#save-recipe').addEventListener('click', () => { const recipe = { ...makeRecipe(effect, controls, {realismProfile,lensEffects}), manualReview: reviewById[effect.id] || [], outputSize: sizes[$('#output-size').value] }; download(new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json;charset=utf-8' }), `ocean-recipe-${effect.number}-${effect.id}.json`); toast('目标、实拍出处、分类与当前制作参数已导出'); });
$('#expand-reference').addEventListener('click', () => { $('#dialog-image').src = effect.reference; $('#dialog-image').alt = `PEBIT 原帖第 ${effect.number} 张完整参考条带`; $('#dialog-title').textContent = `${effect.number} / ${effect.name}`; $('#dialog-goal').textContent = effect.goal; $('#dialog-source').href = effect.source; $('#reference-dialog').showModal(); });
$('#close-reference').addEventListener('click', () => $('#reference-dialog').close());
$('#reference-dialog').addEventListener('click', event => { if (event.target === $('#reference-dialog')) { const box = event.target.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.target.close(); } });
reduceMotion.addEventListener('change', event => { if (event.matches) { paused = true; updatePlayback(); } });
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport); else addEventListener('resize', resize);
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(viewport);
function frame(stamp) {
  const delta = lastFrame ? Math.min((stamp - lastFrame) / 1000, .1) : 0; lastFrame = stamp;
  if (!paused && visible && !document.hidden && !renderer.failed && controls.speed > 0 && !exportBusy) {
    time += delta * controls.speed / 100 * 1.8;
    if (stamp - lastDraw > 40) { draw(); lastDraw = stamp; }
  }
  requestAnimationFrame(frame);
}
const extensionsView = mountExtensionPlans({ effects: EFFECTS, getEffect: () => effect, selectEffect, copy, download, initialAxis: extensionAxis, onAxisChange: axis => { extensionAxis = axis; persist(); }, reduceMotion });
mountReferenceStudies({effects:EFFECTS,selectEffect,download});
mountRealityStudies({onSelectEffect:id=>selectEffect(id,true)});
attachRenderer(); sync(); filterEffects(); resize(); requestAnimationFrame(frame); document.body.dataset.ready = 'true';
