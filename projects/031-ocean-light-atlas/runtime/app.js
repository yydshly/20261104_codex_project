import { STUDIES, cleanControls, makePrompt } from './studies.js';
import { createRenderer } from './water-renderer.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const STORAGE_KEY = 'ocean-light-atlas:v1';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let study = STUDIES[0];
let controls = { ...study.controls };
let paused = reduceMotion.matches;
let mode = 0;
let method = 'ai';
let time = 18.7;
let labVisible = true;
let lastFrame = 0;
let lastDraw = 0;
let toastTimer;
let saveTimer;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved?.version === 1) {
    study = STUDIES.find(item => item.id === saved.study) || study;
    controls = cleanControls(saved.controls, study.controls);
  }
} catch { /* The page also works with storage disabled. */ }

const viewport = $('#viewport');
let { renderer, compatibility } = createRenderer($('#ocean'));
let canvas = renderer.canvas;

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, study: study.id, controls })); }
    catch { /* Storage is optional. */ }
  }, 150);
}

function draw() { renderer.draw(study, controls, time, mode); }

function resize() {
  const { width, height } = viewport.getBoundingClientRect();
  renderer.resize(width, height, Math.min(window.devicePixelRatio || 1, 1.5));
  draw();
}

function setRendererStatus() {
  $('#render-caption').textContent = compatibility ? '原创二维兼容预览 · 光影示意' : '原创程序化海面 · 光影示意';
}

function recoverRenderer() {
  const replacement = canvas.cloneNode(false);
  canvas.replaceWith(replacement);
  const result = createRenderer(replacement);
  renderer = result.renderer;
  compatibility = result.compatibility;
  canvas = renderer.canvas;
  canvas.addEventListener('renderer-lost', recoverRenderer, { once: true });
  setRendererStatus();
  resize();
  toast('已恢复海面预览');
}
canvas.addEventListener('renderer-lost', recoverRenderer, { once: true });

function updateControls() {
  for (const [key, value] of Object.entries(controls)) {
    const input = $(`#${key}`);
    input.value = value;
    input.style.setProperty('--range', `${value / Number(input.max) * 100}%`);
    $(`#${key}-value`).textContent = `${value}${key === 'angle' ? '°' : '%'}`;
  }
  $('#view-coordinates').textContent = `AZ ${controls.angle}° · WIND ${controls.wave}%`;
}

function createPalette() {
  const palette = $('#palette');
  palette.replaceChildren();
  for (const hex of study.colors) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch';
    swatch.style.background = hex;
    swatch.title = `复制颜色 ${hex}`;
    swatch.setAttribute('aria-label', `复制颜色 ${hex}`);
    swatch.addEventListener('click', () => copyText(hex, `已复制颜色 ${hex}`));
    palette.append(swatch);
  }
  $('#palette-name').textContent = study.name;
}

function selectStudy(id, moveToLab = false) {
  study = STUDIES.find(item => item.id === id) || STUDIES[0];
  controls = { ...study.controls };
  mode = 0;
  syncStudy();
  persist();
  if (moveToLab) {
    viewport.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    toast(`已载入「${study.name}」`);
  }
}

function syncStudy() {
  $('#study-select').value = study.id;
  $('#study-title').textContent = study.name;
  $('#study-poem').textContent = study.poem;
  $('#image-index').textContent = `${study.number} / ${study.en}`;
  canvas.setAttribute('aria-label', `动态海面光影示意：${study.name}。可使用右侧参数调节。`);
  $$('.study-card').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.study === study.id)));
  updateControls();
  updatePlayback();
  updateMode();
  createPalette();
  updateRecipe();
  draw();
}

function updateMode() {
  $$('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mode) === mode)));
  $('#view-label').hidden = mode === 0;
  $('#view-label').textContent = mode === 1 ? '高光分布 · 观察光怎样落在波纹上' : '波面结构 · 不同颜色表示局部朝向';
  draw();
}

function notesForMethod() {
  if (method === 'photo') return study.photo;
  if (method === 'web') return [
    study.technique,
    `本页用移动高度场表现波纹，计算局部法线与光照的关系。「波纹起伏」改变坡度，「反光强度」改变高光亮度，「光线方向」旋转入射光，「流动速度」控制时间推进。`,
    '先看「波面结构」理解表面朝向，再看「只看反光」观察高光分布，最后切回完整海面，检查颜色与明暗是否协调。',
  ];
  return [];
}

function currentCopyText() {
  if (method === 'ai') return makePrompt(study, controls);
  return `${study.name} / ${method === 'photo' ? '真实拍摄' : '网页实现'}\n\n${notesForMethod().map((text, index) => `${index + 1}. ${text}`).join('\n\n')}`;
}

function updateRecipe() {
  const caption = { ai: 'PROMPT / 可复制的画面指令', photo: 'FIELD GUIDE / 实拍观察与制作', web: 'HOW IT WORKS / 网页效果的组成' };
  $('#method-caption').textContent = caption[method];
  $('#recipe-chip').textContent = study.name;
  const isAI = method === 'ai';
  const textarea = $('#prompt-text');
  textarea.hidden = !isAI;
  textarea.value = makePrompt(study, controls);
  const notes = $('#method-notes');
  notes.replaceChildren();
  if (!isAI) {
    const list = document.createElement('ol');
    for (const text of notesForMethod()) {
      const item = document.createElement('li');
      item.textContent = text;
      list.append(item);
    }
    notes.append(list);
  }
  $('#prompt-hint').textContent = isAI ? '根据上方预设与参数实时整理' : method === 'photo' ? '按现场光线与设备调整' : '原创视觉近似，可切换图层观察';
  $('#copy-prompt').replaceChildren(document.createTextNode(isAI ? '复制提示词 ' : '复制制作要点 '));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  $('#copy-prompt').append(arrow);
}

function setMethod(next, focus = false) {
  method = next;
  $$('.method-tabs [role=tab]').forEach(tab => {
    const active = tab.dataset.method === method;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (focus && active) tab.focus();
  });
  $('#method-panel').setAttribute('aria-labelledby', `tab-${method}`);
  updateRecipe();
}

async function copyText(text, message) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    // Visible selectable fallback also works for browsers without clipboard access.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('aria-label', '待复制的内容');
    field.style.cssText = 'position:fixed;left:16px;bottom:16px;width:min(460px,calc(100% - 32px));height:120px;z-index:30;background:#fbfcf7;color:#173b43;border:1px solid #72998d;padding:14px';
    document.body.append(field);
    field.focus();
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Keep text selected. */ }
    if (copied) { field.remove(); toast(message); }
    else {
      toast('内容已选中，请按 Ctrl+C 或使用系统复制');
      field.addEventListener('blur', () => field.remove(), { once: true });
    }
  }
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function togglePause() {
  paused = !paused;
  updatePlayback();
}

function updatePlayback() {
  $('#pause').setAttribute('aria-pressed', String(paused));
  $('#pause').setAttribute('aria-label', paused ? '播放海面动画' : '暂停海面动画');
  $('#pause-text').textContent = paused ? '播放' : '暂停';
  $('#pause-icon').textContent = paused ? '▷' : 'Ⅱ';
  $('#live-label').textContent = paused || controls.speed === 0 ? 'STILL OCEAN' : 'LIVE OCEAN';
  $('#live-dot').classList.toggle('paused', paused || controls.speed === 0);
}

for (const item of STUDIES) {
  const option = document.createElement('option');
  option.value = item.id;
  option.textContent = `${item.number}  ${item.name}`;
  $('#study-select').append(option);

  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'study-card';
  card.dataset.study = item.id;
  card.setAttribute('aria-pressed', 'false');
  card.setAttribute('aria-label', `${item.name}：${item.description}。在实验台中查看`);
  card.innerHTML = `<div class="study-image" style="--preview:${item.water}"><canvas width="320" height="460" aria-hidden="true"></canvas><span class="study-number">${item.number}</span><span class="study-arrow" aria-hidden="true">↗</span></div><h3>${item.name}</h3><p class="study-en">${item.en}</p><p class="study-desc">${item.description}</p>`;
  card.addEventListener('click', () => selectStudy(item.id, true));
  $('#study-grid').append(card);
}

// One reusable offscreen renderer makes five still previews, avoiding five live contexts.
function renderThumbnails() {
  const offscreen = document.createElement('canvas');
  const previewResult = createRenderer(offscreen, { maxPixels: 160000 });
  const preview = previewResult.renderer;
  preview.resize(320, 460);
  STUDIES.forEach((item, index) => {
    preview.draw(item, item.controls, 18.7 + index * 2.1);
    const target = $(`.study-card[data-study="${item.id}"] canvas`);
    target.getContext('2d').drawImage(preview.canvas, 0, 0, 320, 460);
  });
  preview.gl?.getExtension('WEBGL_lose_context')?.loseContext();
}

$('#study-select').addEventListener('change', event => selectStudy(event.target.value));
$$('[data-control]').forEach(input => input.addEventListener('input', () => {
  controls[input.dataset.control] = Number(input.value);
  updateControls();
  updatePlayback();
  updateRecipe();
  draw();
  persist();
}));
$$('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = Number(button.dataset.mode); updateMode(); }));
$$('[data-inspect]').forEach(button => button.addEventListener('click', () => {
  mode = Number(button.dataset.inspect);
  updateMode();
  viewport.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
}));
$('#reset').addEventListener('click', () => { controls = { ...study.controls }; mode = 0; syncStudy(); updatePlayback(); persist(); toast('已恢复当前光影预设'); });
$('#pause').addEventListener('click', togglePause);
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(event.target.tagName) && !event.target.isContentEditable) {
    event.preventDefault();
    togglePause();
  }
});
$$('[data-method]').forEach(button => button.addEventListener('click', () => setMethod(button.dataset.method)));
$('.method-tabs').addEventListener('keydown', event => {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  const methods = ['ai', 'photo', 'web'];
  const focused = methods.indexOf(event.target.closest('[data-method]')?.dataset.method || method);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (focused + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
  setMethod(methods[next], true);
});
$('#copy-prompt').addEventListener('click', () => copyText(currentCopyText(), method === 'ai' ? '提示词已复制，可以开始创作了' : '制作要点已复制'));

$('#export').addEventListener('click', () => {
  const button = $('#export');
  button.disabled = true;
  try {
    draw();
    canvas.toBlob(blob => {
      button.disabled = false;
      if (!blob) { toast('画面保存失败，请再试一次'); return; }
      download(blob, `ocean-${study.id}-${['complete', 'highlights', 'normals'][mode]}.png`);
      toast('海面画面已导出为 PNG');
    }, 'image/png');
  } catch {
    button.disabled = false;
    toast('当前浏览器无法导出画面');
  }
});

$('#save-recipe').addEventListener('click', () => {
  const recipe = {
    title: `海的切片 · ${study.name}`,
    version: 1,
    study: study.id,
    parameters: { ...controls },
    colors: study.colors,
    prompt: makePrompt(study, controls),
    photography: study.photo,
    implementation: study.technique,
    reference: 'https://x.com/_pebit_/status/2121174301319831916',
    note: '五类效果为原创整理；程序化效果用于视觉示意，不是原作者照片或完整流体模拟。',
  };
  download(new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json;charset=utf-8' }), `ocean-recipe-${study.id}.json`);
  toast('配色、参数与创作提示词已导出');
});

reduceMotion.addEventListener('change', event => {
  if (event.matches) { paused = true; updatePlayback(); }
});

if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
else window.addEventListener('resize', resize);
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { labVisible = entries[0].isIntersecting; }).observe(viewport);

function frame(stamp) {
  const delta = lastFrame ? Math.min((stamp - lastFrame) / 1000, .1) : 0;
  lastFrame = stamp;
  if (!paused && labVisible && !document.hidden && !renderer.failed && controls.speed > 0) {
    time += delta * controls.speed / 100 * 1.8;
    if (stamp - lastDraw >= 33) { draw(); lastDraw = stamp; }
  }
  requestAnimationFrame(frame);
}

syncStudy();
updatePlayback();
setRendererStatus();
resize();
renderThumbnails();
requestAnimationFrame(frame);
document.body.dataset.ready = 'true';
