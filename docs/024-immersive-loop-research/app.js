'use strict';
(() => {
  const archive = window.RESEARCH_ARCHIVE;
  if (!archive) throw new Error('研究索引未加载，请检查 data/archive-data.js。');
  const records = archive.records;
  const byId = new Map(records.map(r => [r.id, r]));
  const experiments = records.filter(r => r.kind !== 'reference');
  const selected = new Set();
  const viewer = document.getElementById('viewer');
  let activeTheme = '代表精选', search = '', toastTimer;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fileHref = path => {
    if (archive.publication?.assetBase && path.startsWith('archive/')) return archive.publication.assetBase + path.split('/').map(encodeURIComponent).join('/');
    return path.split('/').map(encodeURIComponent).join('/');
  };
  const bytes = value => value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : `${(value / 1024).toFixed(0)} KB`;
  const seconds = value => Number(value).toFixed(2).replace(/\.?0+$/, '');
  const mediaSummary = (record, m = record.mediaInfo) => {
    return `${m.format} · ${m.width}×${m.height} · ${m.frames} 帧${m.seconds ? ` · ${seconds(m.seconds)} 秒` : ' · 静态'} · ${bytes(m.bytes)}`;
  };
  const statusPill = r => `<span class="status-pill ${esc(r.status)}">${esc(r.statusLabel)}</span>`;
  const evidence = ids => `<div class="evidence-links">${ids.map(id => `<button data-open="${esc(id)}">${esc(byId.get(id)?.version || id)}</button>`).join('')}</div>`;
  function toast(message) {
    const element = document.getElementById('toast');
    clearTimeout(toastTimer); element.textContent = message; element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 2300);
  }
  function referenceCard(r) {
    return `<article class="reference-card"><button class="reference-visual" data-open="${esc(r.id)}" aria-label="播放${esc(r.title)}"><img src="${fileHref(r.poster)}" alt="${esc(r.title)}" loading="lazy"><span class="play-circle" aria-hidden="true">▶</span></button><div class="reference-copy"><span class="mini-label">${esc(r.version)} / 作者参考</span><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p><a class="text-link" href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a></div></article>`;
  }
  function effectCard(r) {
    return `<article class="effect-card" data-card="${esc(r.id)}"><button class="effect-visual" data-open="${esc(r.id)}" aria-label="${r.gif ? '播放' : '查看'}${esc(r.version)} ${esc(r.title)}"><img src="${fileHref(r.poster)}" alt="${esc(r.title)}的静态预览" loading="lazy"><span class="version-chip">${esc(r.version)}</span><span class="play-circle" aria-hidden="true">${r.gif ? '▶' : '↗'}</span><span class="media-stamp">${r.gif ? `${seconds(r.mediaInfo.seconds)}s / GIF` : 'STILL / 1 FRAME'}</span></button><div class="card-body"><div class="card-title-line"><h3>${esc(r.title)}</h3><span>${esc(r.theme)}</span></div><p class="method-line">${esc(r.method)}</p><p class="card-summary">${esc(r.summary)}</p>${statusPill(r)}<blockquote class="card-feedback">${esc(r.feedback)}</blockquote></div><div class="card-footer"><button class="plain-button" data-open="${esc(r.id)}">${r.gif ? '播放效果' : '查看静态测试'}与记录 ↗</button><label class="compare-toggle"><input type="checkbox" data-compare="${esc(r.id)}" ${selected.has(r.id) ? 'checked' : ''} aria-label="将${esc(r.version)}加入对照">加入对照</label></div></article>`;
  }
  function renderGallery() {
    const filtered = experiments.filter(r => (activeTheme === '全部探索' || activeTheme === '代表精选' && archive.representatives.includes(r.id) || r.theme === activeTheme) &&
      [r.version, r.title, r.summary, r.feedback, r.method, r.lesson, ...r.tags].join(' ').toLowerCase().includes(search));
    document.getElementById('experiment-grid').innerHTML = filtered.map(effectCard).join('');
    document.getElementById('results-count').textContent = `显示 ${filtered.length} / ${experiments.length} 轮探索`;
    document.getElementById('empty-state').hidden = filtered.length > 0;
    document.querySelectorAll('[data-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === activeTheme)));
  }
  function syncCompare() {
    const ids = [...selected];
    document.getElementById('compare-tray').hidden = ids.length === 0;
    document.getElementById('compare-selection').textContent = ids.length ? `已选 ${ids.length}/2　${ids.map(id => byId.get(id).version).join(' / ')}` : '';
    document.getElementById('compare-open').disabled = ids.length !== 2;
    document.querySelectorAll('[data-compare]').forEach(box => { box.checked = selected.has(box.dataset.compare); });
  }
  function mediaMarkup(r, mode) {
    mode ||= r.gif ? 'gif' : 'image';
    if (mode.startsWith('visual-')) {
      const visual = r.media[Number(mode.slice(7))];
      return `<img src="${fileHref(visual.path)}" alt="${esc(visual.label)}：${esc(visual.name)}">`;
    }
    if (mode === 'video') return `<video src="${fileHref(r.assets.video)}" poster="${fileHref(r.poster)}" autoplay muted loop controls playsinline aria-label="${esc(r.title)}的同源视频预览"></video>`;
    const path = mode === 'attempt' ? r.assets.attemptImage : mode === 'gif' ? r.assets.gif : r.assets.image;
    return `<img src="${fileHref(path)}" alt="${esc(r.title)}${mode === 'attempt' ? '：实际返回的单帧 PNG' : mode === 'gif' ? '：实际 GIF 效果' : '：静态画面'}">`;
  }
  function mediaDescription(r, mode) {
    if (mode.startsWith('visual-')) {
      const visual = r.media[Number(mode.slice(7))];
      return `${visual.format === 'GIF' ? mediaSummary(r, visual.mediaInfo) : '静态素材'} · ${visual.label} · ${visual.name}`;
    }
    if (mode === 'video') return r.kind === 'reference' ? 'MP4 · 作者原帖媒体' : 'MP4 · 与主版 GIF 同源的程序动画导出';
    if (mode === 'attempt') return `${mediaSummary(r, r.attemptInfo)} · 动画请求实际返回的文件`;
    return `${mode === 'image' && r.gif ? '静态底图 / 关键帧素材' : mediaSummary(r)}${r.kind === 'reference' ? ' · 作者原作的展示副本' : mode === 'gif' ? ' · 本地合成动画' : ' · 静态图，不是动画'}`;
  }
  function player(r) {
    const mode = r.gif ? 'gif' : 'image';
    return `<div data-player="${esc(r.id)}" data-mode="${mode}" data-paused="false"><div class="viewer-media">${mediaMarkup(r, mode)}</div><div class="media-controls">${r.gif ? `<button data-mode="gif" data-record="${esc(r.id)}" class="active">实际 GIF</button>` : `<button data-mode="image" data-record="${esc(r.id)}" class="active">起始静态图</button>`}${r.video ? `<button data-mode="video" data-record="${esc(r.id)}">${r.kind === 'reference' ? '原帖 MP4' : '同源 MP4'}</button>` : ''}${r.attemptImage ? `<button data-mode="attempt" data-record="${esc(r.id)}">实际返回 PNG</button>` : ''}${r.gif ? `<button data-pause="${esc(r.id)}">停止动画</button><a href="${fileHref(r.assets.gif)}" download>下载主版 GIF ↓</a>` : `<a href="${fileHref(r.assets.image)}" download>下载静态图 ↓</a>`}</div><p class="media-description">${esc(mediaDescription(r, mode))}</p></div>`;
  }
  function visualGallery(r) {
    return `<details class="record-visuals"><summary>底图、过程图与其他版本（${r.media.length}）</summary><div class="visual-grid">${r.media.map((m, i) => `<button data-mode="visual-${i}" data-record="${esc(r.id)}" aria-pressed="false" aria-label="${m.format === 'GIF' ? '播放' : '查看'} ${esc(m.name)}"><img src="${fileHref(m.thumbnail)}" alt="${esc(m.label)}" loading="lazy"><span>${esc(m.label)}${m.format === 'GIF' ? ' ▶' : ''}</span><small>${esc(m.name)}</small></button>`).join('')}</div><p class="section-footnote">点击缩略图在上方查看完整素材。GIF 变体可直接播放。</p></details>`;
  }
  function promptPanel(r) {
    if (!r.prompts.length) return '';
    return `<details class="record-prompts"><summary>展开记录中的提示词（${r.prompts.length}）</summary><p class="section-footnote">以下为已存记录中的原文，用于复盘；提示词与执行结果应分别判断。</p>${r.prompts.map(p => `<article><a href="${fileHref(p.source)}" target="_blank" rel="noopener">${esc(p.source.split('/').pop())} · ${esc(p.field)} ↗</a><pre>${esc(p.text)}</pre></article>`).join('')}</details>`;
  }
  function recordFiles(r) {
    const files = [...r.files];
    if (r.assets.image) files.unshift({label: '静态素材', name: r.image, path: r.assets.image});
    if (r.assets.contact) files.push({label: '逐帧检查图', name: r.contact, path: r.assets.contact});
    return `<details class="record-files"><summary>素材、脚本与校验原文件（${files.length}）</summary>${r.kind === 'reference' ? '<p class="section-footnote">关联 JSON 含本轮创作与参考观察记录，不是作者的提示词或制作配方。</p>' : ''}${files.map(f => `<a href="${fileHref(f.path)}" target="_blank" rel="noopener"><span>${esc(f.label)}</span>${esc(f.name)}</a>`).join('')}</details>`;
  }
  function cleanupPlayers() {
    viewer.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  }
  function showRecord(id) {
    const r = byId.get(id); if (!r) return;
    cleanupPlayers();
    viewer.innerHTML = `<div class="modal-head"><div><p>${esc(r.version)} / ${esc(r.theme)}</p><h2>${esc(r.title)}</h2></div><button class="close-viewer" data-close aria-label="关闭效果详情">×</button></div><div class="single-view"><div class="viewer-media-wrap">${player(r)}</div><div class="viewer-info">${statusPill(r)}<h3>${esc(r.scope)}</h3><p>${esc(r.summary)}</p><p class="method-line">制作方式：${esc(r.method)}</p><div class="feedback-block"><small>${esc(r.feedbackType)}</small><blockquote>“${esc(r.feedback)}”</blockquote></div><span class="lesson-label">本轮复盘</span><p>${esc(r.lesson)}</p><ul class="detail-list">${r.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>${r.sourceUrl ? `<a class="text-link" href="${esc(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">作者原帖 ↗</a>` : ''}${recordFiles(r)}</div></div>`;
    viewer.querySelector('.viewer-media-wrap').insertAdjacentHTML('beforeend', visualGallery(r));
    viewer.querySelector('.viewer-info .record-files').insertAdjacentHTML('beforebegin', promptPanel(r));
    viewer.scrollTop = 0; if (!viewer.open) viewer.showModal();
  }
  function showCompare(ids, item) {
    const pair = ids.map(id => byId.get(id)); if (pair.length !== 2 || pair.some(r => !r)) return;
    cleanupPlayers();
    viewer.innerHTML = `<div class="modal-head"><div><p>${pair.map(r => esc(r.version)).join(' / ')}</p><h2>${esc(item?.title || '两版效果对照')}</h2></div><button class="close-viewer" data-close aria-label="关闭版本对照">×</button></div>${item ? `<div class="comparison-note"><strong>${esc(item.question)}</strong><br>${esc(item.finding)}</div>` : ''}<div class="comparison-view">${pair.map(r => `<article><h3>${esc(r.version)}　${esc(r.title)}</h3>${player(r)}<p class="method-line">${esc(r.method)}</p>${statusPill(r)}<blockquote class="card-feedback">“${esc(r.feedback)}”</blockquote><p class="lesson-copy">${esc(r.lesson)}</p><button class="plain-button" data-open="${esc(r.id)}">查看完整记录 ↗</button></article>`).join('')}</div>`;
    viewer.scrollTop = 0; if (!viewer.open) viewer.showModal();
  }
  function renderInventory(query = '') {
    const matches = archive.inventory.filter(f => `${f.name} ${f.role} ${f.recordIds.map(id => byId.get(id).version).join(' ')}`.toLowerCase().includes(query));
    document.getElementById('inventory-body').innerHTML = matches.map(f => `<tr><td><a href="${fileHref(f.path)}" target="_blank" rel="noopener">${esc(f.name)}</a></td><td><div class="evidence-links">${f.recordIds.map(id => `<button data-open="${esc(id)}">${esc(byId.get(id).version)}</button>`).join('')}</div></td><td>${esc(f.role)}</td><td>${bytes(f.bytes)}</td><td title="${esc(f.sha256)}">${esc(f.sha256.slice(0, 16))}…</td></tr>`).join('');
  }
  document.getElementById('hero-stats').innerHTML = `<b>${archive.summary.referenceGroups}</b> 组作者参考　/　<b>${archive.summary.explorationStages}</b> 轮探索　/　<b>${archive.summary.sourceFileCount}</b> ${archive.publication ? '个公开文件' : '个源文件'}`;
  document.getElementById('reference-grid').innerHTML = records.filter(r => r.kind === 'reference').map(referenceCard).join('');
  const themes = ['代表精选', '全部探索', ...new Set(experiments.map(r => r.theme))];
  document.getElementById('filters').innerHTML = themes.map(theme => `<button class="filter" data-theme="${esc(theme)}" aria-pressed="${theme === activeTheme}">${esc(theme)}${theme === '全部探索' ? ` ${experiments.length}` : theme === '代表精选' ? ` ${archive.representatives.length}` : ''}</button>`).join('');
  const research = archive.researchSummary;
  document.getElementById('research-intro').innerHTML = `<h3>${esc(research.question)}</h3><p>${esc(research.overview)}</p><p class="research-understanding">${esc(research.understanding)}</p>`;
  document.getElementById('direction-grid').innerHTML = research.directions.map((d,i) => `<article><span class="mini-label">0${i+1} / 研究方向</span><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></article>`).join('');
  document.getElementById('value-grid').innerHTML = research.values.map(v => `<article><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></article>`).join('');
  document.getElementById('extension-grid').innerHTML = research.extensions.map(v => `<article><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p><small>扩展设想 · 尚未验证</small></article>`).join('');
  document.getElementById('research-boundary').textContent = research.boundary;
  document.getElementById('comparison-grid').innerHTML = archive.comparisons.map((c, i) => `<button class="comparison-card" data-comparison="${i}"><div class="comparison-top"><span>${esc(byId.get(c.left).version)} — ${esc(byId.get(c.right).version)}</span><span aria-hidden="true">↗</span></div><h3>${esc(c.title)}</h3><p>${esc(c.question)}</p></button>`).join('');
  document.getElementById('findings-grid').innerHTML = archive.findings.map((f, i) => `<article class="finding"><span class="finding-index">0${i + 1}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p>${evidence(f.evidence)}</article>`).join('');
  document.getElementById('workflow-intro').innerHTML = `<p>${esc(archive.workflow.constants)}</p><small>${esc(archive.workflow.note)}</small>`;
  document.getElementById('workflow-grid').innerHTML = archive.workflow.steps.map((s, i) => `<article class="workflow-step"><span class="mini-label">STEP 0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><p class="step-output">${esc(s.output)}</p>${evidence(s.evidence)}</article>`).join('');
  const capabilityLabels = {verified:'已完成', 'not-generated':'未完成', documentation:'文档与入口', constraint:'执行约束'};
  document.getElementById('capability-grid').innerHTML = archive.capabilities.map(c => `<article class="capability"><small>${capabilityLabels[c.state] || c.state}</small><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">官方文档 ↗</a>` : evidence(c.evidence)}</article>`).join('');
  const next = archive.nextTest;
  document.getElementById('next-test').innerHTML = `<div><p class="eyebrow">NEXT TEST / 尚未执行</p><h3>${esc(next.title)}</h3><p>${esc(next.text)}</p><a class="text-link" href="${fileHref('archive/' + next.file)}" target="_blank" rel="noopener">查看已保存的测试要求 ↗</a></div><div><span class="next-test-badge">${esc(next.status)}</span><ul>${next.checks.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>`;
  document.getElementById('source-summary').innerHTML = `${archive.summary.sourceFileCount} 个${archive.publication ? '公开研究' : '源'}文件 · ${(archive.summary.sourceBytes / 1048576).toFixed(1)} MB<br>${archive.publication ? '网页按需读取固定版本的仓库素材；公开文本已整理。' : '独立副本，已逐文件校验；原目录未修改。'}`;
  document.getElementById('inventory-count').textContent = `${archive.summary.sourceFileCount} FILES / SHA256`;
  const coverage = archive.coverage;
  document.getElementById('coverage-panel').innerHTML = `<div><strong>${coverage.stageLinkedFiles} / ${coverage.sourceFileCount}</strong><span>源文件已关联版本</span></div><div><strong>${coverage.inPageGifCount} / ${coverage.gifFileCount}</strong><span>GIF 可在页内播放（含参考与预览）</span></div><div><strong>${coverage.supplementaryVisualCount}</strong><span>底图、过程图与变体可页内查看</span></div><div><strong>${coverage.recordedPromptCount}</strong><span>记录中的提示词可展开阅读</span></div>`;
  document.getElementById('coverage-scope').textContent = `${coverage.scopeNote} 最近复核：${coverage.reviewDate}。`;
  renderGallery(); renderInventory();
  document.getElementById('search').addEventListener('input', e => { search = e.target.value.trim().toLowerCase(); renderGallery(); });
  document.getElementById('file-search').addEventListener('input', e => renderInventory(e.target.value.trim().toLowerCase()));
  document.getElementById('compare-clear').addEventListener('click', () => { selected.clear(); syncCompare(); });
  document.getElementById('compare-open').addEventListener('click', () => { if (selected.size === 2) showCompare([...selected]); });
  document.addEventListener('change', e => {
    if (!e.target.matches('[data-compare]')) return;
    const id = e.target.dataset.compare;
    if (e.target.checked) {
      if (selected.size >= 2) { e.target.checked = false; toast('一次选择两个版本；可先移除已选版本。'); return; }
      selected.add(id);
    } else selected.delete(id);
    syncCompare();
  });
  document.addEventListener('click', e => {
    const target = e.target.closest('button, [data-close]'); if (!target) return;
    if (target.hasAttribute('data-close')) { viewer.close(); return; }
    if (target.dataset.open) { showRecord(target.dataset.open); return; }
    if (target.dataset.theme) { activeTheme = target.dataset.theme; renderGallery(); return; }
    if (target.dataset.comparison !== undefined) { const c = archive.comparisons[Number(target.dataset.comparison)]; showCompare([c.left, c.right], c); return; }
    if (target.dataset.mode && target.dataset.record) {
      const r = byId.get(target.dataset.record), container = viewer.querySelector(`[data-player="${r.id}"]`);
      container.querySelectorAll('video').forEach(v => v.pause());
      container.dataset.mode = target.dataset.mode; container.dataset.paused = 'false';
      container.querySelector('.viewer-media').innerHTML = mediaMarkup(r, target.dataset.mode);
      container.querySelectorAll('button[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === target.dataset.mode));
      viewer.querySelectorAll(`.visual-grid button[data-record="${r.id}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === target.dataset.mode)));
      const visual = target.dataset.mode.startsWith('visual-') ? r.media[Number(target.dataset.mode.slice(7))] : null;
      container.querySelector('.viewer-media').classList.toggle('asset-view', Boolean(visual && visual.format !== 'GIF'));
      const pause = container.querySelector('[data-pause]'); if (pause) { pause.hidden = !['gif', 'video'].includes(target.dataset.mode) && visual?.format !== 'GIF'; pause.textContent = '停止动画'; }
      container.querySelector('.media-description').textContent = mediaDescription(r, target.dataset.mode);
      const oldLink = container.querySelector('.active-asset-link'); if (oldLink) oldLink.remove();
      if (visual) {
        container.querySelector('.media-controls').insertAdjacentHTML('beforeend', `<a class="active-asset-link" href="${fileHref(visual.path)}" download>下载当前素材 ↓</a>`);
        viewer.scrollTop = 0;
      }
      return;
    }
    if (target.dataset.pause) {
      const r = byId.get(target.dataset.pause), container = viewer.querySelector(`[data-player="${r.id}"]`), paused = container.dataset.paused !== 'true';
      container.dataset.paused = String(paused);
      const video = container.querySelector('video');
      target.textContent = paused ? (video ? '继续播放' : '重新播放') : '停止动画';
      if (video) { if (paused) video.pause(); else video.play().catch(() => {}); }
      else {
        const visual = container.dataset.mode.startsWith('visual-') ? r.media[Number(container.dataset.mode.slice(7))] : null;
        container.querySelector('.viewer-media').innerHTML = paused ? `<img src="${fileHref(visual?.thumbnail || r.poster)}" alt="${esc(r.title)}：动画已停止，显示静态预览">` : mediaMarkup(r, container.dataset.mode);
      }
    }
  });
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => { cleanupPlayers(); viewer.innerHTML = ''; });
})();
