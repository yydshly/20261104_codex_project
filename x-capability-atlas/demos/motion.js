(() => {
  const clip = window.motionExample;
  const video = document.querySelector('video');
  const buttons = [...document.querySelectorAll('[data-version]')];
  const jump = document.querySelector('.jump');
  const status = document.querySelector('.status');
  const cut = document.querySelector('.time-track span');
  const playhead = document.querySelector('.time-track i');
  let version = 'a';
  let pendingTime = 0;

  cut.style.left = `${100 * clip.start / clip.duration}%`;
  cut.style.width = `${100 * (clip.end - clip.start) / clip.duration}%`;
  jump.querySelector('span').textContent = `${clip.start.toFixed(2)} s`;

  function update() {
    const current = video.readyState ? video.currentTime : pendingTime;
    const cutting = version === 'b' && current >= clip.start && current < clip.end;
    playhead.style.left = `${Math.min(100, 100 * current / clip.duration)}%`;
    status.textContent = `${version.toUpperCase()} 版 · ${cutting ? '正在播放 B-roll' : '口播主画面'}`;
  }

  function seek(seconds) {
    pendingTime = seconds;
    if (video.readyState) video.currentTime = Math.min(seconds, video.duration);
    update();
  }

  function select(next, seconds, resume) {
    if (next !== version) {
      pendingTime = seconds;
      version = next;
      video.src = `media/talk-${version}.mp4`;
      video.poster = version === 'b' ? 'media/cutaway-poster.webp' : 'media/talk-poster.webp';
      video.setAttribute('aria-label', version === 'a' ? 'A 版，只有口播主画面' : 'B 版，在同一配音上插入 B-roll');
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.version === version));
    } else {
      seek(seconds);
    }
    if (resume) video.play().catch(() => {});
    update();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => select(button.dataset.version, video.readyState ? video.currentTime : pendingTime, !video.paused));
  }
  jump.addEventListener('click', () => select('b', clip.start, true));
  video.addEventListener('loadedmetadata', () => seek(pendingTime));
  video.addEventListener('timeupdate', update);
  video.addEventListener('error', () => { status.textContent = '视频未能加载，可在「台本和素材」里下载 MP4。'; });
})();
