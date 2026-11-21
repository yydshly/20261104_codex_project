(() => {
  const sources = window.atlasShowcases;
  const originals = window.atlasOriginals || { media: {}, projects: {} };
  const stage = document.querySelector('#effects');
  const works = document.querySelector('#effect-works');
  const question = document.querySelector('#effect-question');
  const guide = document.querySelector('#effect-guide');
  const choices = [...document.querySelectorAll('[data-effect]')];
  const evidence = {
    1: '无声 B-roll 素材', 2: '作者成品', 3: '作者成片', 4: '官方样片', 5: '作者成片', 6: '作者成片',
    7: '原项目实验曲线', 8: '论文对照结果', 9: '可操作原作', 10: '可操作原作', 11: '官方脚本预览',
    12: '官方操作录屏', 13: '仓库清单', 14: '作者公开输出', 15: '作者仿真成片', 16: '有声剪辑补充案例',
  };
  const groups = {
    motion: {
      question: '一句话怎样变成观众看得懂的画面？',
      guide: '先播 Gitruck 的有声剪后成片，听人声怎样接着讲，画面怎样切到图解和特写。下方是狗哥的四段无声拼贴素材和 Flow 的官方镜头参考。',
      cases: ['oralcut', 1, 4],
    },
    avatar: {
      question: '三位不同人物，怎样看起来属于同一套头像？',
      guide: '并排看三张原图。白底留白、头肩裁切和柔光保持统一，发型、眼镜和胡须仍让角色彼此可辨。作者只公开了成品，参考照未随帖发布。',
      cases: [2],
    },
    course: {
      question: '空间知识怎样被看见，又怎样让人亲手验证？',
      guide: '先播银河飞越，观察镜头和标注怎样建立空间感。再在旁边的 Papermorph 原课里拖动平面或改方程，观察交点怎样跟着变。',
      cases: [6, 10],
    },
    workflow: {
      question: '一篇资讯怎样变成可听、可跳段的节目？',
      guide: '在本页播放 Mono Radio 的原节目，再从新闻标题跳到下一段，观察声音、字幕和画面怎样一起跳转。',
      cases: [9],
    },
  };
  let activeGroup;

  function makeLink(label, url) {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = label;
    if (url.startsWith('https:')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    return link;
  }

  function makeImage(item) {
    const image = document.createElement('img');
    image.alt = item.alt;
    if (item.width) image.width = item.width;
    if (item.height) image.height = item.height;
    image.decoding = 'async';
    image.src = originals.media[item.url];
    return image;
  }

  function makeMedia(item) {
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = item.alt;
    const path = originals.media[item.url];
    const fallback = makeLink('到出处查看此素材 ↗', item.url);
    fallback.className = 'media-fallback';
    if (!path) {
      figure.append(caption, fallback);
      return figure;
    }
    fallback.hidden = true;
    let media;
    let display;
    let playback;
    if (item.type === 'video') {
      media = document.createElement('video');
      media.controls = true;
      media.playsInline = true;
      media.preload = 'none';
      media.loop = Boolean(item.loop);
      media.width = item.width;
      media.height = item.height;
      media.setAttribute('aria-label', item.alt);
      const poster = item.preview || originals.media[item.poster];
      if (poster) media.poster = poster;
      media.src = path;
      display = media;
      playback = document.createElement('button');
      playback.type = 'button';
      playback.className = 'source-play';
      function updatePlaybackButton() {
        const label = media.paused || media.ended ? '播放原片' : '暂停原片';
        playback.textContent = label;
        playback.setAttribute('aria-label', `${label}：${item.alt}`);
      }
      updatePlaybackButton();
      playback.addEventListener('click', () => {
        if (media.paused || media.ended) {
          media.play().catch(error => {
            if (error.name !== 'AbortError') fallback.hidden = false;
          });
        } else {
          media.pause();
        }
      });
      for (const event of ['play', 'pause', 'ended']) media.addEventListener(event, updatePlaybackButton);
    } else {
      media = makeImage(item);
      display = makeLink('', path);
      display.target = '_blank';
      display.rel = 'noopener';
      display.setAttribute('aria-label', `打开大图：${item.alt}`);
      display.append(media);
    }
    media.addEventListener('error', () => {
      display.hidden = true;
      if (playback) playback.hidden = true;
      fallback.hidden = false;
    });
    figure.append(display, caption);
    if (playback) figure.append(playback);
    figure.append(fallback);
    return figure;
  }

  function appendGallery(target, source) {
    if (!source.media?.length) return;
    const gallery = document.createElement('div');
    gallery.className = 'source-gallery';
    gallery.dataset.columns = source.media.length;
    if (source === sources[1].comparison) {
      gallery.addEventListener('play', event => {
        for (const other of gallery.querySelectorAll('video')) {
          if (other !== event.target) other.pause();
        }
      }, true);
    }
    target.append(gallery);
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      gallery.append(...source.media.map(makeMedia));
    }, { rootMargin: '220px' });
    observer.observe(target);
    return observer;
  }

  function render(target, id, featured = false) {
    const comparison = id === 'oralcut';
    const source = comparison ? sources[1].comparison : sources[id];
    if (!source) return;
    const number = String(id).padStart(2, '0');
    const type = document.createElement('span');
    type.className = 'evidence-type';
    type.textContent = comparison ? '补充原作 · 有声剪辑对照' : `${number} · ${evidence[id]}`;
    const heading = document.createElement(featured ? 'h4' : 'h3');
    heading.className = 'work-title';
    heading.textContent = source.label;
    const description = document.createElement('p');
    description.textContent = source.caption;
    const actions = document.createElement('div');
    actions.className = 'showcase-actions';
    const project = originals.projects[id];
    if (project) {
      const fullView = makeLink(`${project.action} ↗`, project.fullPath || project.path);
      fullView.target = '_blank';
      fullView.rel = 'noopener';
      actions.append(fullView);
    }
    actions.append(makeLink(project ? '作者网站 ↗' : `${source.action || '在 X 查看原帖'} ↗`, source.url));
    if (source.originalUrl) actions.append(makeLink('X 介绍帖 ↗', source.originalUrl));
    for (const link of source.links || []) actions.append(makeLink(`${link.label} ↗`, link.url));
    if (featured && !comparison) actions.append(makeLink(`看第 ${number} 条拆解 ↓`, `#case-${number}`));
    const lab = window.atlasResearch.labFor(id);
    if (lab) {
      const tryLink = makeLink('在本站探索 ↓', `#explore-${lab}`);
      tryLink.className = 'showcase-lab-link';
      actions.append(tryLink);
    }
    target.append(type, heading, description, actions);

    if (project) {
      const frame = document.createElement('iframe');
      frame.className = `source-player source-player-${id}`;
      frame.title = project.title;
      frame.loading = 'lazy';
      frame.src = project.path;
      frame.allowFullscreen = true;
      target.append(frame);
      const credit = makeLink(project.credit, project.notice);
      credit.className = 'source-credit';
      target.append(credit);
    }
    return appendGallery(target, source);
  }

  let stageObservers = [];
  function selectGroup(key) {
    if (activeGroup === key) return;
    activeGroup = key;
    const group = groups[key];
    for (const choice of choices) choice.setAttribute('aria-current', String(choice.dataset.effect === key));
    question.textContent = group.question;
    guide.textContent = group.guide;
    works.dataset.layout = key;
    for (const observer of stageObservers) observer.disconnect();
    stageObservers = [];
    works.replaceChildren();
    for (const id of group.cases) {
      const article = document.createElement('article');
      article.className = id === 'oralcut' ? 'effect-work effect-oralcut' : 'effect-work';
      works.append(article);
      const observer = render(article, id, true);
      if (observer) stageObservers.push(observer);
    }
  }

  function navigate() {
    const old = location.hash.match(/^#practice(?:-(motion|avatar|course|workflow))?$/);
    if (old) history.replaceState(null, '', `#effect-${old[1] || 'motion'}`);
    const selected = choices.find(choice => choice.hash === location.hash);
    if (!selected) return;
    selectGroup(selected.dataset.effect);
    stage.scrollIntoView({ block: 'start' });
  }

  window.addEventListener('hashchange', navigate);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#effect-"]');
    if (link?.hash === location.hash) navigate();
  });

  window.renderAtlasShowcase = render;
  selectGroup('motion');
  requestAnimationFrame(navigate);
})();
