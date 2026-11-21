import { featureCount, groups, scenes } from './catalog.js';
import { W, H } from './paint.js';
import { storm, swallow, gutter, ant } from './rain.js';
import { bee, snow, ocean } from './habitats.js';
import * as life from './field-life.js';
import * as land from './field-land.js';

const painters = { storm, swallow, gutter, ant, bee, snow, ocean, ...life, ...land };
const sceneIndexById = new Map(scenes.map(({ id }, index) => [id, index]));
const route = document.querySelector('#scene-list');
const catalog = document.querySelector('#catalog-groups');
const stage = document.querySelector('#stage');
const canvas = document.querySelector('#scene-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const title = document.querySelector('#scene-name');
const slider = document.querySelector('#scene-value');
const description = document.querySelector('#scene-description');
const motion = document.querySelector('#motion');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const routeButtons = [];
let activeIndex = 0;
let progress = 0;
let time = .7;
let frameId = 0;
let previousFrame = 0;
let paused = reduceMotion.matches;

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function number(index) {
  return String(index + 1).padStart(2, '0');
}

scenes.slice(0, featureCount).forEach((scene, index) => {
  if (index === 0 || index === 4) {
    route.append(element('p', index === 0 ? '01—04 / 一场雨' : '05—07 / 三次远行', 'route-group'));
  }
  const button = element('button', '', 'scene-button');
  button.type = 'button';
  button.append(
    element('span', number(index), 'scene-number'),
    element('span', scene.name),
    element('span', scene.kind, 'scene-kind'),
  );
  button.addEventListener('click', () => {
    openScene(index);
    if (matchMedia('(max-width: 700px)').matches) revealStage();
  });
  routeButtons.push(button);
  route.append(button);
});

const more = element('div', '', 'more-scenes');
const moreLabel = element('label', `${number(featureCount)}—${number(scenes.length - 1)} / 更多世界`, 'route-group');
const moreSelect = element('select', '');
moreLabel.htmlFor = 'more-scenes';
moreSelect.id = moreLabel.htmlFor;
const placeholder = element('option', '选择一个场景');
placeholder.disabled = true;
placeholder.value = '';
moreSelect.append(placeholder);
moreSelect.addEventListener('change', () => {
  openScene(sceneIndexById.get(moreSelect.value));
  if (matchMedia('(max-width: 700px)').matches) revealStage();
});
more.append(moreLabel, moreSelect);
route.append(more);

groups.forEach((group, index) => {
  const card = element('article', '', 'catalog-card');
  const heading = element('h3', group.name);
  heading.prepend(element('small', number(index)));
  const list = document.createElement('ul');
  const options = document.createElement('optgroup');
  options.label = group.name;
  for (const id of group.items) {
    const sceneIndex = sceneIndexById.get(id);
    const scene = scenes[sceneIndex];
    const row = document.createElement('li');
    const link = element('a', scene.name);
    link.href = `#${id}`;
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      openScene(sceneIndex);
      revealStage();
    });
    row.append(link, element('small', number(sceneIndex)));
    if (sceneIndex >= featureCount) {
      const option = element('option', `${number(sceneIndex)}　${scene.name}`);
      option.value = id;
      options.append(option);
    }
    list.append(row);
  }
  if (options.childElementCount) moreSelect.append(options);
  card.append(heading, list);
  catalog.append(card);
});

function revealStage() {
  stage.scrollIntoView({ block: 'start' });
  title.focus({ preventScroll: true });
}

function paint() {
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  ctx.save();
  painters[scenes[activeIndex].id](ctx, time, progress);
  ctx.restore();
}

function resize() {
  const resolution = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * resolution));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * resolution));
  paint();
}

function animate(now) {
  if (!previousFrame) previousFrame = now;
  const elapsed = now - previousFrame;
  if (elapsed >= 30) {
    time += Math.min(elapsed, 65) / 1000;
    previousFrame = now;
    paint();
  }
  frameId = requestAnimationFrame(animate);
}

function setPaused(value) {
  paused = value;
  motion.textContent = paused ? '播放动画' : '暂停动画';
  motion.setAttribute('aria-label', '暂停场景动画');
  motion.setAttribute('aria-pressed', String(paused));
  cancelAnimationFrame(frameId);
  previousFrame = 0;
  if (!paused) frameId = requestAnimationFrame(animate);
}

function updateControl() {
  const scene = scenes[activeIndex];
  progress = slider.valueAsNumber / 100;
  const noteIndex = progress < .34 ? 0 : progress < .67 ? 1 : 2;
  const note = scene.notes[noteIndex];
  if (description.textContent !== note) description.textContent = note;
  slider.setAttribute('aria-valuetext', `${slider.value}%，${note}`);
  paint();
}

function openScene(index, updateUrl = true) {
  const scene = scenes[index];
  if (!scene) return;
  if (index !== activeIndex) time = .7;
  activeIndex = index;
  routeButtons.forEach((button, i) => {
    button.setAttribute('aria-current', String(i === index));
  });
  moreSelect.value = index < featureCount ? '' : scene.id;
  setText('scene-id', `场景 ${number(index)} / ${scene.kind}`);
  setText('scene-en', scene.english);
  title.textContent = scene.name;
  setText('control-name', scene.control);
  setText('range-start', scene.ends[0]);
  setText('range-end', scene.ends[1]);
  setText('route-note', index < 4 ? `一场雨 · 第 ${index + 1} / 4 幕` : `继续探索 · ${index + 1} / ${scenes.length}`);
  slider.value = scene.value;
  previous.disabled = index === 0;
  next.disabled = index === scenes.length - 1;
  updateControl();
  if (updateUrl && location.hash !== `#${scene.id}`) history.pushState(null, '', `#${scene.id}`);
}

function openFromUrl() {
  if (location.hash === '#catalog') return;
  const index = sceneIndexById.get(location.hash.slice(1)) ?? 0;
  openScene(index, false);
}

title.tabIndex = -1;
setText('scene-count', `${number(scenes.length - 1)} 幕`);
slider.addEventListener('input', updateControl);
motion.addEventListener('click', () => setPaused(!paused));
previous.addEventListener('click', () => openScene(activeIndex - 1));
next.addEventListener('click', () => openScene(activeIndex + 1));
reduceMotion.addEventListener('change', (event) => setPaused(event.matches));
window.addEventListener('hashchange', openFromUrl);
new ResizeObserver(resize).observe(canvas);
resize();
if (location.hash === '#catalog') openScene(0, false);
else openFromUrl();
setPaused(paused);
