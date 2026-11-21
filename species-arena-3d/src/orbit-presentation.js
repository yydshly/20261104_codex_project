import './orbit-presentation.css';

const toggle = document.getElementById('orbit-presentation-toggle');
const viewer = document.getElementById('orbit-viewer');
const playButton = document.getElementById('orbit-play');

const controls = document.createElement('div');
controls.className = 'presentation-controls';
controls.hidden = true;
controls.innerHTML = `
  <button type="button" id="orbit-presentation-play" title="空格键">播放 / 暂停</button>
  <button type="button" id="orbit-presentation-exit" title="Esc 键">退出纯画面</button>
`;
viewer.append(controls);

const play = document.getElementById('orbit-presentation-play');
const close = document.getElementById('orbit-presentation-exit');
let presenting = false;
let hideTimer;

function showControls() {
  controls.dataset.idle = 'false';
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { controls.dataset.idle = 'true'; }, 2000);
}

function setPresentation(active) {
  presenting = active;
  document.body.classList.toggle('orbit-presenting', active);
  controls.hidden = !active;
  if (active) {
    viewer.tabIndex = -1;
    viewer.focus({ preventScroll: true });
    showControls();
  } else {
    clearTimeout(hideTimer);
    viewer.removeAttribute('tabindex');
    toggle.focus({ preventScroll: true });
  }
}

toggle.addEventListener('click', () => setPresentation(true));
close.addEventListener('click', () => setPresentation(false));
play.addEventListener('click', () => playButton.click());
viewer.addEventListener('pointermove', () => {
  if (presenting) showControls();
});
document.addEventListener('keydown', event => {
  if (!presenting || event.defaultPrevented) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setPresentation(false);
  } else if (event.code === 'Space' && !event.repeat && !event.target.closest?.('button')) {
    event.preventDefault();
    playButton.click();
  }
});
