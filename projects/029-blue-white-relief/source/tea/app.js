(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const media = () => ({
    teapot: { src: window.BRAND_CONFIG.media.teapotVideo, poster: window.BRAND_CONFIG.media.teapotImage, title: window.BRAND_CONFIG.copy.teapotFilmTitle },
    landscape: { src: window.BRAND_CONFIG.media.landscapeVideo, poster: window.BRAND_CONFIG.media.landscapeImage, title: window.BRAND_CONFIG.copy.landscapeFilmTitle }
  });
  const resolve = path => (window.BRAND_ASSETS && window.BRAND_ASSETS[path]) || path;
  const hero = document.getElementById('hero-film');
  const landscape = document.getElementById('landscape-film');
  const videos = [hero, landscape];
  const toggleButtons = Array.from(document.querySelectorAll('[data-toggle-film]'));

  function updateVideoButton(video) {
    const button = toggleButtons.find(item => item.dataset.toggleFilm === video.id);
    if (!button) return;
    const playing = !video.paused && !video.ended;
    const label = playing ? '暂停影像' : video.ended ? '重播影像' : video === landscape ? '看山水流动' : '播放影像';
    button.querySelector('[data-film-label]').textContent = label;
    button.querySelector('[data-film-symbol]').textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', label + (video === hero ? '：茶器' : '：山水'));
  }

  function playSafely(video) {
    const pending = video.play();
    if (pending && pending.catch) pending.catch(() => updateVideoButton(video));
  }

  videos.forEach(video => {
    ['play', 'pause', 'ended', 'loadedmetadata', 'error'].forEach(event => video.addEventListener(event, () => updateVideoButton(video)));
    updateVideoButton(video);
  });
  toggleButtons.forEach(button => button.addEventListener('click', () => {
    const video = document.getElementById(button.dataset.toggleFilm);
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      playSafely(video);
    } else video.pause();
  }));
  hero.addEventListener('timeupdate', () => {
    const duration = hero.duration;
    document.getElementById('hero-progress').style.width = Number.isFinite(duration) && duration > 0 ? `${Math.min(100, hero.currentTime / duration * 100)}%` : '0%';
  });
  if (reducedMotion || (navigator.connection && navigator.connection.saveData)) {
    hero.autoplay = false;
    hero.pause();
  }

  if ('IntersectionObserver' in window) {
    let landscapeStarted = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) entry.target.pause();
        else if (entry.target === landscape && !landscapeStarted && !reducedMotion && !(navigator.connection && navigator.connection.saveData)) {
          landscapeStarted = true;
          playSafely(landscape);
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(video => observer.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });

  const dialog = document.getElementById('film-dialog');
  const dialogVideo = document.getElementById('dialog-film');
  const closeButton = dialog.querySelector('.dialog-close');
  let returnFocus;
  document.querySelectorAll('[data-open-film]').forEach(button => button.addEventListener('click', () => {
    const item = media()[button.dataset.openFilm];
    if (!item) return;
    returnFocus = button;
    videos.forEach(video => video.pause());
    document.getElementById('film-dialog-title').textContent = item.title;
    dialogVideo.poster = resolve(item.poster);
    dialogVideo.src = resolve(item.src);
    dialogVideo.load();
    dialog.showModal();
    document.body.classList.add('modal-open');
    closeButton.focus();
    playSafely(dialogVideo);
  }));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialogVideo.pause();
    document.body.classList.remove('modal-open');
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  });
  document.addEventListener('brand:updated', () => {
    if (dialog.open) dialog.close();
  });

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function selectTab(selected) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      selectTab(next);
      next.focus();
    });
  });
})();
