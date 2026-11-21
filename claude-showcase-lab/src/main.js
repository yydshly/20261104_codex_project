import './style.css';
import { createAngioDirections, createAngioStudy } from './angio-study.js';
import { createAngioAngleStudy } from './angio-angle-study.js';
import { createAngioTransferStudy } from './angio-transfer-study.js';
import { renderChessStyleStudy } from './chess-style-study.js';
import { renderExhibitOverview } from './exhibit-overview.js';
import { renderResearchNotes, researchProjects } from './research-notes.js';
import { archive, exhibits } from './exhibits.js';

const defaultExhibit = exhibits.find((item) => item.id === 'wildfire');
const groups = [
  { title: '可操作的作者原版', type: 'live' },
  { title: '可操作的社区实现', type: 'community' },
  { title: '作者视频', type: 'video' },
];

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="lab-header">
    <div class="lab-wrap lab-masthead">
      <a class="lab-brand" href="#overview">
        <span class="lab-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span>效果研究室</span>
      </a>
      <span class="lab-edition">CLAUDE SHOWCASE <span aria-hidden="true">/</span> VOL. 01</span>
      <nav class="lab-top-nav" aria-label="研究室入口">
        <a class="lab-top-link lab-top-overview" href="#overview" data-exhibit="overview">六项总览</a>
        <a class="lab-top-link" href="https://x.com/claudeai/status/2111177834127601902" target="_blank" rel="noopener noreferrer">原始作品串 <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>
  <main class="lab-wrap">
    <section class="lab-intro" aria-labelledby="lab-title">
      <div>
        <p class="lab-eyebrow"><span></span> Claude 社区作品</p>
        <h1 id="lab-title">六个优秀产品的效果与复用研究</h1>
        <p class="lab-intro-text">从实际产品效果理解实现原理，记录可复用能力与扩展方向。保留作者原版、研究演示和创作成果。</p>
      </div>
      <div class="lab-index-mark" aria-hidden="true">
        <span>RESEARCH<br>PROJECTS</span><b>06</b>
      </div>
    </section>
    <div class="lab-layout">
      <aside class="lab-sidebar">
        <div class="lab-nav-group">
          <div class="lab-nav-heading"><span>我们的六个演示</span><span>06</span></div>
          <nav class="lab-nav" aria-label="本地演示">
            ${researchProjects(exhibits).map(item => `
              <a class="lab-nav-item" href="#${item.demo.route}" data-exhibit="${item.demo.route}">
                <span class="lab-nav-number">${item.number}</span>
                <span class="lab-nav-label"><strong>${item.demo.title}</strong><small>本地体验与研究笔记</small></span>
                <span class="lab-nav-arrow" aria-hidden="true">→</span>
              </a>`).join('')}
          </nav>
        </div>
        ${groups.map(({ title, type }) => {
          const items = exhibits.filter(({ source }) => source.type === type);
          return `<div class="lab-nav-group">
            <div class="lab-nav-heading"><span>${title}</span><span>${String(items.length).padStart(2, '0')}</span></div>
            <nav class="lab-nav" aria-label="${title}">
              ${items.map((item) => `
                <a class="lab-nav-item" href="#${item.id}" data-exhibit="${item.id}">
                  <span class="lab-nav-number">${item.number}</span>
                  <span class="lab-nav-label"><strong>${item.title}</strong><small>${item.label}</small></span>
                  <span class="lab-nav-arrow" aria-hidden="true">↗</span>
                </a>`).join('')}
            </nav>
          </div>`;
        }).join('')}
        <details class="lab-nav-group lab-archive">
          <summary>旧版回看 · 6 个本地效果</summary>
          <nav class="lab-nav" aria-label="旧版回看">
            ${Object.entries(archive).map(([id, item]) => `
              <a class="lab-nav-item lab-archive-item" href="#${id}/local" data-exhibit="${id}/local">${item.title}</a>
            `).join('')}
          </nav>
        </details>
      </aside>
      <article class="lab-exhibit" aria-labelledby="lab-exhibit-title">
        <header class="lab-exhibit-head"></header>
        <div class="lab-demo" id="lab-demo"></div>
        <section class="lab-extension" aria-labelledby="lab-extension-title"></section>
      </article>
    </div>
  </main>
  <footer class="lab-wrap lab-footer">
    <span>效果研究室 <span aria-hidden="true">/</span> Claude 社区作品</span>
    <span>原作展台与复用说明</span>
  </footer>
`;

const demo = app.querySelector('.lab-demo');
const head = app.querySelector('.lab-exhibit-head');
const extension = app.querySelector('.lab-extension');
const archiveMenu = app.querySelector('.lab-archive');
const intro = app.querySelector('.lab-intro');
const layout = app.querySelector('.lab-layout');
const sidebar = app.querySelector('.lab-sidebar');
let activeRoute;
let disposeDemo;

function mountSource(host, item) {
  const { source } = item;
  if (source.type !== 'video') {
    const frame = document.createElement('iframe');
    frame.className = 'lab-source-frame';
    frame.title = item.title;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    frame.setAttribute('allow', 'clipboard-write; fullscreen');
    frame.referrerPolicy = 'no-referrer';
    frame.src = source.url;
    const hint = document.createElement('p');
    hint.className = 'lab-media-error';
    hint.append('可直接操作下方原站。若嵌入加载受限，请', Object.assign(document.createElement('a'), {
      href: source.url, textContent: '在新标签打开', target: '_blank', rel: 'noopener noreferrer',
    }));
    host.append(hint, frame);
    return;
  }

  const video = document.createElement('video');
  video.className = 'lab-source-video';
  video.setAttribute('aria-label', `${item.title} · 作者原片`);
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = source.poster;
  video.width = source.width;
  video.height = source.height;
  video.src = source.url;

  const fallback = document.createElement('p');
  fallback.className = 'lab-media-error';
  fallback.hidden = true;
  fallback.append('当前网络未能载入原片。', Object.assign(document.createElement('a'), {
    href: source.url, textContent: '在新标签播放原片 ↗', target: '_blank', rel: 'noopener noreferrer',
  }));

  const toolbar = document.createElement('div');
  toolbar.className = 'lab-media-toolbar';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  const updateToggle = () => { toggle.textContent = video.paused ? '播放原片' : '暂停原片'; };
  updateToggle();
  video.addEventListener('play', updateToggle);
  video.addEventListener('pause', updateToggle);
  video.addEventListener('ended', updateToggle);
  const showPlaybackError = () => { fallback.hidden = false; };
  video.addEventListener('error', showPlaybackError);
  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => { if (video.error) showPlaybackError(); });
    else video.pause();
  });
  toolbar.append(toggle);
  host.append(toolbar, video, fallback);
  return () => video.pause();
}

async function showExhibit() {
  const [id, mode] = location.hash.slice(1).split('/');
  const overview = !id || id === 'overview' && !mode;
  const item = exhibits.find((entry) => entry.id === id) ?? defaultExhibit;
  const local = item.id === id && mode === 'local' ? archive[id] : undefined;
  const play = item.id === id && mode === 'play' ? item.play : undefined;
  const version = local ?? play;
  const route = overview ? 'overview' : version ? `${item.id}/${mode}` : item.id;
  if (location.hash && location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
  if (activeRoute === route) return;
  activeRoute = route;
  disposeDemo?.();
  disposeDemo = undefined;
  for (const video of demo.querySelectorAll('video')) video.pause();
  demo.querySelectorAll('.lab-angio-study').forEach(study => { study.open = false; });

  for (const link of app.querySelectorAll('[data-exhibit]')) {
    if (link.dataset.exhibit === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  intro.hidden = overview;
  sidebar.hidden = overview;
  layout.classList.toggle('lab-layout--overview', overview);
  demo.classList.toggle('lab-demo--overview', overview);
  extension.hidden = overview;

  if (overview) {
    head.innerHTML = `
      <p class="lab-section-index"><span>06</span> CLAUDE 社区作品</p>
      <div class="lab-exhibit-title-row"><h2 id="lab-exhibit-title" tabindex="-1">六个优秀产品的效果与复用研究</h2></div>
      <p class="lab-interaction">研究山火分析、手绘国际象棋、手写字体、电磁感应实验、冠脉造影教学与俳句动画。从原版效果出发，理解规则、数据与呈现如何配合，再通过六个演示验证可复用的做法。</p>
      <p class="lab-interaction">这里汇总已完成的效果与我们的理解，并标明后续扩展和当前范围。原版链接、源码记录、绘画对照和动画短片均保留。</p>
      <button type="button" class="lab-future-jump lab-overview-jump" aria-controls="lab-overview-table">查看对照表与演示入口 ↓</button>
    `;
    demo.innerHTML = renderExhibitOverview(exhibits);
    head.querySelector('.lab-overview-jump').addEventListener('click', () => {
      const table = demo.querySelector('#lab-overview-table');
      table.focus({ preventScroll: true });
      table.scrollIntoView({ block: 'start' });
    });
    head.querySelector('h2').focus();
    return;
  }

  const host = document.createElement('div');
  host.className = 'lab-demo-host';
  demo.replaceChildren(host);

  if (version) {
    if (local) archiveMenu.open = true;
    head.innerHTML = `
      <p class="lab-section-index"><span>${item.number}</span> ${play ? '本地演示' : '旧版回看'}</p>
      <div class="lab-exhibit-title-row">
        <h2 id="lab-exhibit-title" tabindex="-1">${version.title}</h2>
        <a class="lab-source" href="#${item.id}">看原版展台 →</a>
      </div>
      <p class="lab-interaction"><span class="lab-source-badge">${play ? play.label ?? '可玩 · 本地对弈' : '旧版 · 本地效果'}</span> ${version.caption}</p>
    `;
    extension.innerHTML = renderResearchNotes(item, exhibits);
    host.innerHTML = `<p class="lab-archive-status" role="status">正在载入${version.title}…</p>`;
    try {
      const mount = await version.load();
      if (!host.isConnected) return;
      host.replaceChildren();
      const sheet = play && item.future?.sample;
      disposeDemo = sheet ? mount(host, { sheet }) : mount(host);
      if (play && item.id === 'angio') {
        host.append(createAngioStudy(), createAngioAngleStudy(), createAngioTransferStudy());
        extension.append(createAngioDirections());
      }
      if (play) head.querySelector('h2').focus();
    } catch (error) {
      if (!host.isConnected) return;
      host.innerHTML = `<p class="lab-archive-status" role="alert">${version.title}载入失败，请刷新页面重试。</p>`;
      console.error(error);
    }
    return;
  }

  const isLive = item.source.type !== 'video';
  const isAngio = item.id === 'angio';
  const sourceLabel = { live: '可操作 · 作者在线版', community: '可操作 · 社区实现', video: '仅有作者视频' }[item.source.type];
  const externalLink = isLive ? item.source.url : item.original;
  const externalLabel = isLive ? '全屏打开原站' : '打开原帖';
  const primaryDemo = item.play ? { route: `${item.id}/play`, title: item.play.title } : item.overview?.demo;
  head.innerHTML = `
    <p class="lab-section-index"><span>${item.number}</span> ${item.area}</p>
    <div class="lab-exhibit-title-row">
      <h2 id="lab-exhibit-title" tabindex="-1">${item.title}</h2>
      <a class="lab-source" href="${externalLink}" target="_blank" rel="noopener noreferrer">${externalLabel} <span aria-hidden="true">↗</span></a>
    </div>
    <p class="lab-interaction"><span class="lab-source-badge" data-live="${isLive}">${sourceLabel}</span> ${item.source.caption}
      ${item.future ? `<button type="button" class="lab-future-jump" aria-controls="lab-future">${item.future.sample ? '棋盘样张与路线图' : '原理与路线图'} ↓</button>` : ''}
      ${isAngio ? '<button type="button" class="lab-future-jump" aria-controls="lab-angio-directions">医学产品扩展方向 ↓</button>' : ''}
    </p>
    ${primaryDemo ? `<a class="lab-play-link" href="#${primaryDemo.route}">试玩${primaryDemo.title} →</a>` : ''}
  `;
  extension.innerHTML = `
    <div class="lab-extension-title">
      <div><p class="lab-section-index"><span>→</span> USE &amp; REUSE</p><h3 id="lab-extension-title">实际用途与复用</h3></div>
      <div class="lab-resource-links">
        ${item.related ? `<a href="#${item.related.id}">${item.related.label} →</a>` : ''}
        ${item.resource ? `<a href="${item.resource.url}" target="_blank" rel="noopener noreferrer">${item.resource.label} ↗</a>` : ''}
        <a href="${item.original}" target="_blank" rel="noopener noreferrer">来源说明 ↗</a>
      </div>
    </div>
    <div class="lab-extension-grid">
      <div><h4>${isLive ? '现在能做什么' : '原片展示什么'}</h4><p>${item.use}</p></div>
      <div><h4>可复用范围</h4><p>${item.reuse}</p></div>
    </div>
    ${item.future ? `
      <section class="lab-future" id="lab-future" aria-labelledby="lab-future-title" tabindex="-1">
        <div class="lab-future-heading">
          <h4 id="lab-future-title">扩展方向 · ${item.future.title}</h4>
          <span class="lab-source-badge">${item.play ? '已可试玩' : '后续按需'}</span>
        </div>
        ${item.future.sample ? renderChessStyleStudy(item.future.sample) : item.future.diagram ? `
          <figure class="lab-future-figure">
            <img src="${import.meta.env.BASE_URL}${item.future.diagram}" alt="${item.future.diagramAlt}" loading="lazy" decoding="async">
            <figcaption><a href="${import.meta.env.BASE_URL}${item.future.diagram}" target="_blank" rel="noopener noreferrer">查看路线图大图 ↗</a></figcaption>
          </figure>
        ` : ''}
        <p>${item.future.current}</p>
        <ol>${item.future.steps.map(({ title, description }) => `<li><strong>${title}</strong><br>${description}</li>`).join('')}</ol>
        ${item.future.followup ? `<p>${item.future.followup}</p>` : ''}
        ${item.play ? `<a class="lab-play-link" href="#${item.id}/play">${item.future.sample ? '用这套棋子开一局' : `试玩${item.play.title}`} →</a>` : ''}
        <div class="lab-resource-links">
          ${item.future.sources.map(({ label, url }) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}
        </div>
      </section>
    ` : ''}
  `;
  if (isAngio) {
    demo.prepend(createAngioStudy(), createAngioAngleStudy(), createAngioTransferStudy());
    extension.append(createAngioDirections());
  }
  head.querySelectorAll('.lab-future-jump').forEach(button => button.addEventListener('click', () => {
    const section = extension.querySelector(`#${button.getAttribute('aria-controls')}`);
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start' });
  }));

  host.classList.add('lab-source-host');
  disposeDemo = mountSource(host, item);
  head.querySelector('h2').focus();
}

window.addEventListener('hashchange', showExhibit);
showExhibit();
