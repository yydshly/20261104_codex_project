const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterLinks = [...document.querySelectorAll('#chapter-nav a')];
const search = document.querySelector('#research-search');
const searchStatus = document.querySelector('#search-status');
const emptyState = document.querySelector('#search-empty');
const sceneCards = [...document.querySelectorAll('.scene-card')];
const sceneButtons = [...document.querySelectorAll('[data-filter]')];
const sceneCount = document.querySelector('#scene-count');
const readingProgress = document.querySelector('#reading-progress');
const details = [...document.querySelectorAll('details')];
let selectedFilter = 'all';
let printDetails = [];

function filterScenes() {
  let count = 0;
  for (const card of sceneCards) {
    card.hidden = selectedFilter !== 'all' && !card.dataset.category.split(' ').includes(selectedFilter);
    if (!card.hidden) count++;
  }
  sceneCount.textContent = selectedFilter === 'all' ? '显示全部 11 个场景' : '显示 ' + count + ' 个场景';
  for (const button of sceneButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === selectedFilter));
  }
}

for (const button of sceneButtons) {
  button.addEventListener('click', () => {
    selectedFilter = button.dataset.filter;
    filterScenes();
  });
}

function clearHighlights() {
  for (const mark of document.querySelectorAll('mark[data-search]')) {
    const parent = mark.parentNode;
    mark.replaceWith(document.createTextNode(mark.textContent));
    parent.normalize();
  }
}

function highlightMatches(element, query) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const matches = [];
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.toLocaleLowerCase().includes(query)) matches.push(walker.currentNode);
  }
  for (const node of matches) {
    const value = node.textContent;
    const lower = value.toLocaleLowerCase();
    const fragment = document.createDocumentFragment();
    let start = 0;
    let matchAt = lower.indexOf(query);
    while (matchAt !== -1) {
      fragment.append(value.slice(start, matchAt));
      const mark = document.createElement('mark');
      mark.dataset.search = '';
      mark.textContent = value.slice(matchAt, matchAt + query.length);
      fragment.append(mark);
      start = matchAt + query.length;
      matchAt = lower.indexOf(query, start);
    }
    fragment.append(value.slice(start));
    node.replaceWith(fragment);
  }
}

function searchChapters() {
  clearHighlights();
  const query = search.value.trim().toLocaleLowerCase();
  let matches = 0;
  for (const chapter of chapters) {
    const matched = !query || chapter.textContent.toLocaleLowerCase().includes(query);
    chapter.hidden = !matched;
    const link = chapterLinks.find(item => item.hash === '#' + chapter.id);
    link.hidden = !matched;
    if (matched) {
      matches++;
      if (query) highlightMatches(chapter, query);
    }
  }
  emptyState.hidden = matches > 0;
  searchStatus.textContent = query
    ? '找到 ' + matches + ' / 15 个主题，可清空搜索恢复全文'
    : '15 个主题 · 按讨论与实现整理';
  if (query) {
    selectedFilter = 'all';
    filterScenes();
    for (const detail of details) detail.open = true;
  }
  updateReading();
}

search.addEventListener('input', searchChapters);
document.addEventListener('keydown', event => {
  const typing = event.target.matches('input, textarea, [contenteditable="true"]');
  if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    search.focus();
  }
  if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    searchChapters();
    search.blur();
  }
});

function updateReading() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.style.width = scrollable > 0 ? Math.min(100, window.scrollY / scrollable * 100) + '%' : '0%';
  const visible = chapters.filter(chapter => !chapter.hidden);
  let active = visible[0];
  for (const chapter of visible) {
    if (chapter.getBoundingClientRect().top <= 145) active = chapter;
  }
  for (const link of chapterLinks) {
    if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    updateReading();
    scrollQueued = false;
  });
}, { passive: true });
window.addEventListener('resize', updateReading);
document.addEventListener('toggle', updateReading, true);

const depthSlider = document.querySelector('#depth-slider');
const depthStage = document.querySelector('#depth-stage');
const depthOutput = document.querySelector('#depth-output');
function updateDepth() {
  const value = Number(depthSlider.value);
  depthStage.style.setProperty('--view', value / 100);
  const position = value === 0 ? '正面' : (value < 0 ? '左侧 ' : '右侧 ') + Math.abs(value) + '%';
  depthOutput.textContent = position;
  depthSlider.setAttribute('aria-valuetext', position);
}
depthSlider.addEventListener('input', updateDepth);
document.querySelector('#depth-reset').addEventListener('click', () => {
  depthSlider.value = 0;
  updateDepth();
});

document.querySelector('#print-page').addEventListener('click', () => window.print());
window.addEventListener('beforeprint', () => {
  printDetails = details.map(detail => detail.open);
  for (const detail of details) detail.open = true;
});
window.addEventListener('afterprint', () => {
  details.forEach((detail, index) => { detail.open = printDetails[index] ?? detail.open; });
});
updateDepth();
updateReading();
