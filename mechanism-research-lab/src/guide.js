const audio = document.getElementById('engine-narration');
const start = document.getElementById('guide-start');
const chapterSelect = document.getElementById('guide-chapter');
const transcript = document.getElementById('guide-transcript');

export async function initGuide({ begin, show, stage }) {
  const response = await fetch(new URL('./media/engine-chapters.json', document.baseURI));
  if (!response.ok) throw new Error('发动机讲解章节加载失败');
  const chapters = await response.json();
  chapterSelect.replaceChildren(...chapters.map((chapter, index) => new Option(chapter.title, index)));
  chapterSelect.disabled = false;
  start.disabled = false;

  let request = 0;
  let active = false;
  let current = -1;
  let stageVisible = false;

  function update() {
    const time = audio.currentTime * 1000;
    const index = Math.max(0, chapters.findLastIndex(chapter => time >= chapter.start));
    const chapter = chapters[index];
    const progress = Math.min(1, (time - chapter.start) / (chapter.end - chapter.start));
    if (current !== index) {
      current = index;
      chapterSelect.value = String(index);
      transcript.textContent = chapter.text;
    }
    if (active && (stageVisible || audio.paused)) show(index, progress);
  }

  function tick() {
    update();
    if (active && !audio.paused) request = requestAnimationFrame(tick);
  }

  function jumpToStage() {
    const rect = stage.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight) stage.scrollIntoView({ block: 'center' });
  }

  function renderButton() {
    start.firstChild.textContent = audio.paused ? '听讲解 ' : '暂停讲解 ';
    start.lastElementChild.textContent = audio.paused ? '▷' : 'Ⅱ';
  }

  function activate() {
    if (active) return;
    active = true;
    begin();
  }

  start.addEventListener('click', () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    activate();
    jumpToStage();
    audio.play().catch(() => { transcript.textContent = '请使用下方音频播放器开始讲解。'; });
  });
  chapterSelect.addEventListener('change', () => {
    activate();
    audio.currentTime = chapters[Number(chapterSelect.value)].start / 1000;
    update();
  });
  audio.addEventListener('play', () => {
    activate();
    renderButton();
    cancelAnimationFrame(request);
    request = requestAnimationFrame(tick);
  });
  audio.addEventListener('seeking', () => {
    activate();
    update();
  });
  audio.addEventListener('pause', () => {
    cancelAnimationFrame(request);
    renderButton();
    update();
  });
  audio.addEventListener('ended', renderButton);
  new IntersectionObserver(([entry]) => {
    stageVisible = entry.isIntersecting;
    if (stageVisible && active) update();
  }).observe(stage);
  update();
  return () => {
    active = false;
    audio.pause();
    cancelAnimationFrame(request);
  };
}
