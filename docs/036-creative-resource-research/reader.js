(() => {
  'use strict';
  const data = window.RESEARCH_DATA;
  const detailedById = window.CASE_ANALYSES || {'01': window.DEEP_ANALYSIS};
  const byId = new Map(data.map(item => [item.id, item]));
  const $ = id => document.getElementById(id);
  const esc = text => String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const storeKey = 'xiaoyou-research-lab-personal-v1';
  let personal = {};
  let storageAvailable = true;
  try { personal = JSON.parse(localStorage.getItem(storeKey) || '{}'); }
  catch { storageAvailable = false; }
  if (!personal || typeof personal !== 'object' || Array.isArray(personal)) personal = {};
  let view = byId.has(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  let current = view === 'overview' ? '01' : view;
  let summaryImageUrl = null;
  let summaryRequest = null;
  const groups = [...new Set(data.map(item => item.group))];
  groups.forEach(group => { const option = new Option(group, group); $('group').add(option); });

  function save() {
    personal[current] = {notes:$('personal-notes').value, digested:$('digested').checked, updated_at:new Date().toISOString()};
    try { localStorage.setItem(storeKey, JSON.stringify(personal)); storageAvailable = true; }
    catch { storageAvailable = false; }
    $('save-state').textContent = storageAvailable ? '已保存在本浏览器' : '浏览器未允许持久保存，请导出个人记录';
    outline();
  }

  function filteredItems() {
    const query = $('search').value.trim().toLowerCase();
    const group = $('group').value;
    return data.filter(item => (!group || item.group === group) && (!query || [item.title,item.subject,item.handle,item.summary,item.takeaway].join(' ').toLowerCase().includes(query)));
  }

  function outline() {
    const filtered = filteredItems();
    let lastGroup = '';
    $('outline').innerHTML = filtered.map(item => {
      const heading = item.group !== lastGroup ? `<h2 class="outline-group">${esc(item.group)}</h2>` : '';
      lastGroup = item.group;
      return `${heading}<a class="entry" href="#${item.id}" ${view === item.id ? 'aria-current="page"' : ''}><span class="entry-num">${item.id}</span><span>${esc(item.title)}</span>${personal[item.id]?.digested ? '<span class="entry-done" aria-label="个人已消化">✓</span>' : ''}</a>`;
    }).join('') || '<p class="prior">没有匹配条目，试试其他词。</p>';
    $('result-count').textContent = `${filtered.length} / 48 条 · 保留原清单顺序`;
    $('digest-count').textContent = `个人消化 ${data.filter(item => personal[item.id]?.digested === true).length} / 48`;
    if (view === 'overview') renderOverview(filtered);
  }

  function domain(url) { try { return new URL(url).hostname; } catch { return '外部来源'; } }

  function playbackSummary(caseId) {
    const report = window.PLAYBACK_DATA;
    if (!report) return '';
    const result = caseId ? report.cases.find(entry => entry.case_id === caseId) : report.summary;
    if (!result) return '';
    const images = result.image_assets_total ? `原图、动图与封面 ${result.image_assets_loaded} / ${result.image_assets_total} 本机已加载` : '';
    const videos = result.raw_mp4_total ? `原始视频与 MP4 动图 ${result.raw_mp4_played} / ${result.raw_mp4_total} 本机已实播` : '';
    if (!images && !videos) return '';
    const pending = result.raw_mp4_pending;
    const targets = !caseId && pending ? `<span>待补齐模块：${report.summary.pending_case_ids.map(id => `<a href="#${id}">${id}</a>`).join('、')}</span>` : '';
    return `<aside class="playback-summary ${pending ? 'has-pending' : ''}" aria-label="本机媒体核对记录"><p>${[images,videos].filter(Boolean).map(text => `<span>${esc(text)}</span>`).join('')}</p>${pending ? `<p><strong>${pending} 段尚不能在本页播放</strong>${targets}</p>` : ''}<small>这些是本机预览时的核对记录。公开页面的播放取决于上游服务和访问环境。</small></aside>`;
  }

  function renderOverview(filtered) {
    const studyProgress = window.RESEARCH_PROGRESS || {};
    const reviewed = studyProgress.source_reviewed_ids || [];
    const remaining = data.length - reviewed.length;
    $('overview').innerHTML = `
      <p class="case-kicker">六组主题 · 保留原始顺序</p><h2 class="overview-title">48 条资料总览</h2>
      <p class="overview-intro">总图列出六个大模块、各自的小模块与原链接编号。展开下方任一小模块，可以查看该组原作和逐条分析。</p>
      <figure class="overview-summary">
        <a href="summaries/research-overview.png" target="_blank" rel="noopener" aria-describedby="overview-summary-caption">
          <img src="summaries/research-overview.png" width="1440" height="2670" alt="48 条创作资源研究总览。图中列出六个大模块、各自的小模块和每条来源编号，以及可复用做法、效果验收和投入前要核对的条件。">
        </a>
        <figcaption id="overview-summary-caption">点击图片放大。下方提供对应的小模块和链接入口。</figcaption>
      </figure>
      ${playbackSummary()}
      <section class="analysis-progress" aria-label="内容研究进度"><h3>内容分析进度</h3><p><strong>${reviewed.length} / ${data.length}</strong> 条已完成首轮深入研究 · <strong>${studyProgress.reproduced_count || 0} / ${data.length}</strong> 条已完成原案例复现验收</p><p>${remaining ? `还有 ${remaining} 条待深入研究。 ` : ''}个人消化请在各条笔记中记录。</p></section>
      <div class="overview-stats"><div><strong>48</strong><span>按原顺序收录</span></div><div><strong>06</strong><span>主题分组</span></div><div><strong>${String(data.filter(item => (item.media_groups || []).some(group => group.media?.length)).length).padStart(2,'0')}</strong><span>带图像或视频</span></div></div>
      <p class="overview-scope">未附媒体的原帖展示文字。原帖视频通过官方播放器或公开源地址加载。</p>
      ${renderOverviewGroups(filtered) || '<p>没有匹配条目。</p>'}`;
  }

  function renderOverviewGroups(filtered) {
    const visibleIds = new Set(filtered.map(item => item.id));
    const expandTopics = filtered.length < data.length;
    return window.RESEARCH_TOPICS.map(({group, value, topics}, index) => {
      const visibleTopics = topics.map(topic => ({
        ...topic, rows: topic.ids.filter(id => visibleIds.has(id)).map(id => byId.get(id))
      })).filter(topic => topic.rows.length);
      if (!visibleTopics.length) return '';
      const count = visibleTopics.reduce((total, topic) => total + topic.rows.length, 0);
      return `
        <section class="overview-group">
          <div class="group-heading"><h3><span>${String(index + 1).padStart(2, '0')}</span>${esc(group)}</h3><span>${count} 条 · ${visibleTopics.length} 个小模块</span></div>
          <p class="overview-group-value">${esc(value)}</p>
          ${visibleTopics.map(({title, focus, ids, rows}) => `
            <details class="overview-topic"${expandTopics ? ' open' : ''}>
              <summary>
                <span><strong>${esc(title)}</strong><span class="overview-topic-focus">${esc(focus)}</span></span>
                <span class="overview-topic-ids">${ids.length === 1 ? ids[0] : `${ids[0]}–${ids[ids.length - 1]}`}</span>
              </summary>
              <div class="resource-grid">${rows.map(item => `<a class="resource-card" href="#${item.id}">${overviewPreview(item)}<div class="resource-meta"><span>${item.id} / @${esc(item.handle)}</span><span>${esc(item.previous_priority)}</span></div><h4>${esc(item.title)}</h4><p>${esc(mediaDescription(item))}</p><span class="resource-more">先看原作，再展开分析 →</span></a>`).join('')}</div>
            </details>`).join('')}
        </section>`;
    }).join('');
  }

  function list(values, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${(values || []).map(value => `<li>${esc(typeof value === 'string' ? value : value.detail || value.title || JSON.stringify(value))}</li>`).join('')}</${tag}>`;
  }

  function allMedia(item) { return (item.media_groups || []).flatMap(group => group.media || []); }

  function mediaDescription(item) {
    const media = allMedia(item);
    const videos = media.filter(entry => entry.type === 'video').length;
    const gifs = media.filter(entry => entry.type === 'gif').length;
    const photos = media.filter(entry => entry.type === 'photo').length;
    const parts = [videos ? `${videos} 段视频` : '', gifs ? `${gifs} 段动图` : '', photos ? `${photos} 张图片` : ''].filter(Boolean);
    return parts.length ? parts.join(' · ') : (item.article_title ? '文章预览 · 原帖未附直接演示' : '文字原帖 · 未附图片或视频');
  }

  function overviewPreview(item) {
    const cover = allMedia(item).find(media => media.type === 'photo' || media.poster);
    if (!cover) return `<div class="text-cover"><span>${item.article_title ? '文章' : '文字原帖'}</span><p>${esc(item.source_excerpt || item.title)}</p></div>`;
    const source = cover.type === 'photo' ? cover.url : cover.poster;
    return `<div class="work-cover"><img src="${esc(source)}" alt="${esc(item.title)}的原作预览" loading="lazy" decoding="async"><span>${cover.type === 'video' ? '视频 ▶' : cover.type === 'gif' ? '动图 ▶' : '图片'}</span></div>`;
  }

  function mediaFigure(media, group, index, eager) {
    const caption = media.caption || `${media.type === 'photo' ? '图片' : media.type === 'gif' ? '动图' : '视频'} ${index + 1}`;
    const src = esc(media.url);
    const duration = media.duration > 0 ? ` · ${Math.round(media.duration)} 秒` : '';
    const isImage = media.type === 'photo' || (media.type === 'gif' && /\.gif(?:\?|$)/i.test(media.url));
    const wide = media.width / media.height > 1.75 ? 'wide' : '';
    const videoSources = [...new Set([media.url, ...(media.alternatives || []).filter(alt => alt.type === 'video/mp4').sort((a,b) => b.bitrate-a.bitrate).map(alt => alt.url)])];
    return `<figure class="work-figure ${isImage ? 'photo-figure' : 'video-figure'} ${wide}">
      ${isImage ? `<button type="button" class="image-enlarge" data-image="${src}" data-caption="${esc(caption)} · @${esc(group.author || '')}" aria-label="放大${esc(caption)}"><img src="${src}" alt="${esc(caption)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${media.width ? `width="${Number(media.width)}"` : ''} ${media.height ? `height="${Number(media.height)}"` : ''}><span>放大查看 ↗</span></button>` : `<video controls playsinline preload="metadata" ${media.type === 'gif' ? 'loop muted autoplay' : ''} ${media.poster ? `poster="${esc(media.poster)}"` : ''} ${media.width ? `width="${Number(media.width)}"` : ''} ${media.height ? `height="${Number(media.height)}"` : ''} aria-label="${esc(caption)}">${videoSources.map(url => `<source src="${esc(url)}" type="video/mp4">`).join('')}浏览器不支持播放该视频。</video>`}
      <figcaption>${esc(caption)}${duration}<a href="${src}" target="_blank" rel="noopener noreferrer">原始媒体 ↗</a></figcaption>
      <p class="media-error" hidden>媒体暂时未加载成功，可点上方原始媒体链接查看。</p>
    </figure>`;
  }

  function originalVideoFigure(media, group, index, count) {
    const isArticle = group.kind === 'article';
    const caption = isArticle ? (media.caption || `文章内媒体 ${index + 1}`) : `片段 ${index + 1}${media.caption ? ` · ${media.caption}` : ''}`;
    const type = media.type === 'gif' ? '动图（MP4）' : '视频（MP4）';
    const duration = Number(media.duration) > 0 ? `${Math.round(Number(media.duration) * 1000) / 1000} 秒` : '时长未提供';
    const streamSize = media.url.match(/\/(\d+)x(\d+)\//);
    const width = streamSize ? Number(streamSize[1]) : Number(media.width);
    const height = streamSize ? Number(streamSize[2]) : Number(media.height);
    const dimensions = width && height ? ` · ${width} × ${height}` : '';
    const sourceUrl = (isArticle ? group.source_url : group.post_url || group.source_url) || media.source_url;
    const sourceName = isArticle ? '原文章' : '原帖';
    const wide = media.width / media.height > 1.75 ? 'wide' : '';
    return `<figure class="work-figure video-figure original-video-figure ${isArticle ? 'article-video-figure' : 'secondary-video-figure'} ${wide}" data-media-id="${esc(media.id || '')}" data-media-index="${index + 1}">
      <video controls playsinline preload="none" src="${esc(media.url)}" ${media.type === 'gif' ? 'loop muted' : ''} ${media.poster ? `poster="${esc(media.poster)}"` : ''} ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} aria-label="${esc(caption)}的原视频"></video>
      <div class="original-video-toolbar"><button type="button" class="original-video-play" aria-label="播放原视频：${esc(caption)}">播放原视频</button><span class="original-video-status" role="status">尚未播放</span></div>
      <figcaption><span>${esc(caption)} · ${type} · ${duration}${dimensions}</span><a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">查看${sourceName} ↗</a></figcaption>
      <p class="media-error" hidden>原视频暂时未加载成功。<a href="${esc(media.url)}" target="_blank" rel="noopener noreferrer">打开原始视频</a>或通过上方入口查看${sourceName}。</p>
    </figure>`;
  }

  function officialVideo(group, item, count) {
    const postUrl = group.post_url || group.source_url || item.url;
    const postId = postUrl.match(/\/status\/(\d+)/)?.[1];
    if (!postId) return `<p class="media-error">此视频的原帖嵌入入口尚未取得。<a href="${esc(group.source_url)}" target="_blank" rel="noopener noreferrer">查看原始出处 ↗</a></p>`;
    return `<div class="x-official-embed" data-post-id="${postId}" data-video-count="${count}" data-state="pending"><p class="x-embed-status" role="status">正在载入 X 官方原帖播放器…</p><div class="x-embed-target"></div><p class="x-embed-source"><span>${count > 1 ? `该来源共 ${count} 段；下方可逐段播放后续原视频` : '该来源含 1 段视频或动图'}</span><a href="${esc(postUrl)}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a></p></div>`;
  }

  function showcase(item) {
    const groupsWithMedia = (item.media_groups || []).filter(group => group.media?.length);
    const articleGroups = (item.media_groups || []).filter(group => group.article_title);
    const illustrations = detailedById[item.id]?.showcase_illustrations || [];
    return `<section class="work-showcase" aria-labelledby="showcase-heading">
      <div class="showcase-heading"><h3 id="showcase-heading">原帖展示</h3><span>${esc(mediaDescription(item))}</span></div>
      ${groupsWithMedia.length ? groupsWithMedia.map((group,groupIndex) => {
        const media = group.media;
        const videos = media.filter(entry => entry.type === 'video' || (entry.type === 'gif' && !/\.gif(?:\?|$)/i.test(entry.url)));
        const images = media.filter(entry => !videos.includes(entry));
        const visible = images.slice(0,6);
        const more = images.slice(6);
        const label = group.label || (group.kind === 'quote' ? '引用帖中的作品' : group.kind === 'article' ? '文章中的展示' : group.kind === 'repository' ? '仓库中的演示补充' : '原帖附件');
        const videoDisplay = !videos.length ? '' : group.kind === 'article' ? `<div class="media-gallery ${videos.length === 1 ? 'single' : ''}">${videos.map((entry,index) => originalVideoFigure(entry,group,index,videos.length)).join('')}</div>` : `${officialVideo(group,item,videos.length)}${videos.length > 1 ? `<p class="secondary-media-heading">后续 ${videos.length - 1} 段原视频</p><div class="media-gallery ${videos.length === 2 ? 'single' : ''}">${videos.slice(1).map((entry,index) => originalVideoFigure(entry,group,index+1,videos.length)).join('')}</div>` : ''}`;
        return `<section class="media-source-group"><div class="media-source-heading"><h4>${esc(label)}</h4><a href="${esc(group.source_url || item.url)}" target="_blank" rel="noopener noreferrer">${group.author ? `@${esc(group.author)}` : '查看出处'} ↗</a></div>${group.article_title ? `<p class="article-name">${esc(group.article_title)}</p>` : ''}${videoDisplay}${images.length ? `<div class="media-gallery ${images.length === 1 ? 'single' : ''}">${visible.map((entry,index) => mediaFigure(entry,group,index,groupIndex===0&&index<3)).join('')}</div>` : ''}${more.length ? `<details class="more-media"><summary>展开其余 ${more.length} 项展示</summary><div class="media-gallery">${more.map((entry,index) => mediaFigure(entry,group,index+6,false)).join('')}</div></details>` : ''}</section>`;
      }).join('') : `<div class="text-post-preview"><span class="case-kicker">${articleGroups.length ? '文章原帖' : '文字原帖'}</span>${articleGroups.map(group => `<h4>${esc(group.article_title)}</h4>`).join('')}<blockquote>${esc(item.source_excerpt || item.title)}</blockquote><p>这条原帖没有直接附带可播放视频或图片。</p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">阅读完整原帖 ↗</a></div>`}
      ${illustrations.length ? `<section class="media-source-group" aria-label="原视频封面与仓库原图"><div class="media-source-heading"><h4>原视频封面与仓库原图</h4></div><div class="media-gallery single">${illustrations.map((image, index) => mediaFigure({...image, type: 'photo'}, {author: image.author}, index, true)).join('')}</div></section>` : ''}
      <p class="showcase-note">${illustrations.length ? '封面来自原帖视频。仓库原图作为补充，来源见各图标注。' : '以上为原帖、引用帖或文章中取得的媒体；展示来源不代表本项目已经复现或核验其效果。'}</p>
    </section>`;
  }

  function bindMedia() {
    $('case').querySelectorAll('.original-video-figure').forEach(figure => {
      const video = figure.querySelector('video');
      const button = figure.querySelector('.original-video-play');
      const status = figure.querySelector('.original-video-status');
      const playLabel = button.getAttribute('aria-label');
      button.addEventListener('click', () => {
        if (!video.paused) { video.pause(); return; }
        if (video.error) video.load();
        if (video.ended) video.currentTime = 0;
        video.play().catch(() => { status.textContent = '尚未开始播放，请使用视频控制栏重试'; });
      });
      video.addEventListener('playing', () => { status.textContent = '正在播放原视频'; button.textContent = '暂停'; button.setAttribute('aria-label', playLabel.replace('播放原视频', '暂停原视频')); });
      video.addEventListener('waiting', () => { status.textContent = '正在缓冲…'; });
      video.addEventListener('pause', () => { status.textContent = video.ended ? '播放完毕' : '已暂停'; button.textContent = video.ended ? '重新播放' : '继续播放'; button.setAttribute('aria-label', playLabel); });
      video.addEventListener('ended', () => { status.textContent = '播放完毕'; button.textContent = '重新播放'; button.setAttribute('aria-label', playLabel); });
      video.addEventListener('error', () => { status.textContent = '原视频加载失败'; button.disabled = false; });
      video.addEventListener('timeupdate', () => {
        if (video.currentTime > 0.2 && video.readyState >= 2 && video.videoWidth > 0) figure.dataset.played = 'true';
        figure.dataset.playedTime = String(Math.max(Number(figure.dataset.playedTime || 0), video.currentTime));
      });
    });
    $('case').querySelectorAll('.work-figure img, .work-figure video').forEach(element => {
      element.addEventListener('error', () => {
        const figure = element.closest('figure');
        if (figure) figure.querySelector('.media-error').hidden = false;
      });
      element.addEventListener('loadedmetadata', () => { const error = element.closest('figure')?.querySelector('.media-error'); if (error) error.hidden = true; });
      if (element.tagName === 'VIDEO' && !element.canPlayType('video/mp4; codecs="avc1.42E01E"')) {
        const error = element.closest('figure')?.querySelector('.media-error');
        if (error) { error.textContent = '当前浏览器不支持此 MP4 编码。请在 Chrome 或 Edge 中打开本网页播放；封面和原始媒体链接仍可查看。'; error.hidden = false; }
        element.dataset.codecUnsupported = 'true';
      }
    });
  }

  function reviewEvidence(review) {
    if (!review.frame_evidence?.length) return '';
    return `<details class="review-frames"><summary>${esc(review.evidence_label || `查看 ${review.frame_evidence.length} 个原片取样画面`)}</summary><div class="media-gallery">${review.frame_evidence.map(frame => {
      const label = Number.isFinite(frame.seconds) ? `原演示 · ${Number(frame.seconds).toFixed(2)} 秒` : frame.label || '原图';
      const caption = `${label} · ${frame.caption}`;
      return `<figure class="work-figure photo-figure"><button type="button" class="image-enlarge" data-image="${esc(frame.file)}" data-caption="${esc(caption)}" aria-label="放大${esc(label)}"><img src="${esc(frame.file)}" alt="${esc(caption)}" loading="lazy"><span>放大对照 ↗</span></button><figcaption>${esc(caption)}</figcaption><p class="media-error" hidden>对照图暂未载入，可查看上方原作。</p></figure>`;
    }).join('')}</div></details>`;
  }

  function deepAnalysis(item) {
    const deep = detailedById[item.id];
    if (!deep) return '';
    const experiment = deep.first_experiment || {};
    const review = deep.visual_review;
    return `<section class="deep-analysis" aria-labelledby="deep-heading">
      <div class="deep-heading"><h3 id="deep-heading">第 ${item.id} 条深入分析</h3><span>${esc(deep.status)}</span></div>
      <p class="deep-conclusion">${esc(deep.conclusion)}</p>
      <nav class="analysis-sections" aria-label="分析细节目录"><button type="button" data-analysis-target=".visual-review">原作观察与截图</button><button type="button" data-analysis-target=".findings-heading">具体分析结论</button>${deep.tool_demo ? `<button type="button" data-analysis-target=".tool-demo">${esc(deep.tool_demo_nav || '工具示例实测')}</button>` : ''}${deep.asset_spec?.length ? `<button type="button" data-analysis-target=".asset-spec">${esc(deep.asset_spec_nav || '母版清单与提示词')}</button>` : ''}<button type="button" data-analysis-target=".experiment">小柚验证步骤</button><button type="button" data-analysis-target=".remaining-gaps">尚缺哪些证据</button></nav>
      ${review ? `<section class="visual-review"><h4>${esc(review.heading || "先对照原片：看到了什么")}</h4><p class="review-method">${esc(review.method)}</p><div class="review-observations">${(review.observations || []).map(observation => `<section><h5>${esc(observation.title)}</h5><p>${esc(observation.detail)}</p></section>`).join('')}</div>${reviewEvidence(review)}${review.limits?.length ? `<div class="review-limits">${list(review.limits)}</div>` : ''}</section>` : ''}
      <h4 class="deep-subhead findings-heading">具体分析结论 · ${deep.key_findings?.length || 0} 项</h4><div class="findings">${(deep.key_findings || []).map(finding => `<section><h4>${esc(finding.title)}</h4><p>${esc(finding.detail)}</p>${finding.evidence ? `<small>${esc(typeof finding.evidence === 'string' ? finding.evidence : JSON.stringify(finding.evidence))}</small>` : ''}</section>`).join('')}</div>
      ${deep.tool_demo ? `<section class="tool-demo"><h4>${esc(deep.tool_demo.heading)}</h4><p>${esc(deep.tool_demo.description)}</p>${list(deep.tool_demo.checks)}<div class="deep-sources">${deep.tool_demo.artifacts.map(file => `<a href="${esc(file.url)}" target="_blank" rel="noopener noreferrer">${esc(file.label)} ↗</a>`).join('')}</div></section>` : ''}
      ${deep.asset_spec?.length ? `<section class="asset-spec"><h4>${esc(deep.asset_spec_heading || '小柚母版应交付哪些资产')}</h4><div class="table-scroll"><table><thead><tr>${(deep.asset_spec_columns || ['资产','内容','入库前检查']).map(label => `<th>${esc(label)}</th>`).join('')}</tr></thead><tbody>${deep.asset_spec.map(row => `<tr><th scope="row">${esc(row.asset)}</th><td>${esc(row.content)}</td><td>${esc(row.check)}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      ${deep.prompt_template ? `<section class="prompt-template"><h4>候选提示词 · 尚未执行</h4><pre>${esc(deep.prompt_template)}</pre></section>` : ''}
      ${deep.role_card_choices?.length ? `<section class="reference-choices"><h4>小柚按镜头选哪种参考</h4><div class="table-scroll"><table><thead><tr><th>镜头</th><th>参考输入</th><th>保留什么</th><th>怎么检查</th></tr></thead><tbody>${deep.role_card_choices.map(choice => `<tr><th scope="row">${esc(choice.shot)}</th><td>${esc(choice.reference)}</td><td>${esc(choice.keep)}</td><td>${esc(choice.check)}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
      ${deep.routes?.length ? `<h4 class="deep-subhead">两条路线怎么选</h4><div class="route-grid">${deep.routes.map(route => `<section class="route-card"><h4>${esc(route.name)}</h4><p>${esc(route.when)}</p>${list(route.steps,true)}${route.limits?.length ? `<div class="route-limits">${list(route.limits)}</div>` : ''}</section>`).join('')}</div>` : ''}
      <section class="experiment"><h4>小柚的首轮验证</h4><p>${esc(experiment.goal)}</p><h5>准备材料</h5>${list(experiment.inputs)}<h5>执行步骤</h5>${list(experiment.steps,true)}<h5>验收时看什么</h5>${list(experiment.checks)}</section>
      ${deep.gaps?.length ? `<section class="remaining-gaps"><h4>继续核实的问题</h4>${list(deep.gaps)}</section>` : ''}
      <div class="deep-sources"><h4>深入分析的依据</h4>${(deep.sources || []).map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a>`).join('')}</div>
    </section>`;
  }

  function researchSummary(item) {
    const card = detailedById[item.id]?.summary_card;
    if (!card) return '';
    return `<section class="research-summary" aria-labelledby="summary-heading"><div class="summary-heading"><h3 id="summary-heading">第 ${item.id} 条研究总结图</h3><a href="${esc(card.svg)}" download>下载矢量图 ↧</a></div><p>一图查看研究源、内容、原作效果和对小柚的价值。点击图片可放大；小柚实作状态见图内标注。</p><figure class="work-figure"><button type="button" class="image-enlarge" data-caption="第 ${item.id} 条研究总结 · ${esc(card.title)}" aria-label="放大第 ${item.id} 条研究总结图" disabled><img data-summary-src="${esc(card.image)}" alt="${esc(card.alt)}" width="${Number(card.width)}" height="${Number(card.height)}"><span>放大研究总结图 ↗</span></button><figcaption>总结图更新：${esc(card.updated_date)} · 原作取样与小柚待验证项分别标明。</figcaption><p class="media-error" hidden>总结图暂未加载成功，可通过上方入口下载查看。</p></figure></section>`;
  }

  function bindSummary() {
    summaryRequest?.abort();
    if (summaryImageUrl) { URL.revokeObjectURL(summaryImageUrl); summaryImageUrl = null; }
    const img = $('case').querySelector('[data-summary-src]');
    if (!img) return;
    summaryRequest = new AbortController();
    const button = img.closest('button');
    const error = img.closest('figure').querySelector('.media-error');
    img.addEventListener('load', () => { error.hidden = true; });
    // Explicit SVG typing also supports an already-running older static server.
    fetch(img.dataset.summarySrc, {signal: summaryRequest.signal})
      .then(response => { if (!response.ok) throw new Error('Summary unavailable'); return response.text(); })
      .then(svg => {
        if (!img.isConnected) return;
        summaryImageUrl = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
        img.src = summaryImageUrl;
        button.dataset.image = summaryImageUrl;
        button.disabled = false;
      })
      .catch(reason => { if (reason.name !== 'AbortError' && img.isConnected) error.hidden = false; });
  }

  function render() {
    const item = byId.get(current);
    const deep = detailedById[item.id];
    const review = deep?.visual_review;
    const reviewLabel = review?.text_only ? '原文与参考资料已核对' : '原作与参考资料已核对';
    const sections = [['principle','工作原理'],['takeaway','可以怎么用'],['limit','适用条件与证据边界'],['next','下一步']];
    const primaryLinks = item.primary_references.map(ref => `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.id)} 项目文档</a> · <a href="${esc(ref.file)}">本地快照</a></li>`).join('');
    const outLinks = item.links.map(url => `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(domain(url))} — ${esc(url)}</a></li>`).join('');
    $('case').innerHTML = `
      <p class="case-kicker">${esc(item.group)} / ${item.id}</p>
      <h2>${esc(item.title)}</h2>
      <div class="source-line"><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">@${esc(item.author)} · 查看原帖 ↗</a><span>原优先级：${esc(item.previous_priority)}</span></div>
      <nav class="case-sections" aria-label="本条阅读入口"><button type="button" data-analysis-target=".work-showcase">查看原图 / 视频</button>${deep?.summary_card ? '<button type="button" class="summary-entry" data-analysis-target=".research-summary">查看研究总结图</button>' : ''}<button type="button" class="analysis-entry" data-analysis-target="${deep ? '.deep-analysis' : '.analysis-body'}">${deep ? `查看分析细节 · ${deep.key_findings?.length || 0} 项结论＋验证步骤` : '查看文字初析 · 媒体内容待细查'}</button><p>${deep ? '原作展示在前，总结图与详细分析在后。' : '本条目前只有文字初析，尚未完成原作与技术资料的深入对照。'}</p></nav>
      ${deep?.source_correction ? `<section class="source-correction" role="note"><strong>来源性质核对</strong><p>${esc(deep.source_correction)}</p></section>` : ''}
      ${playbackSummary(item.id)}
      ${showcase(item)}
      ${researchSummary(item)}
      <details class="analysis-body" ${deep ? 'open' : ''}><summary><span>第 ${item.id} 条${deep ? '分析细节' : '文字初析'}</span><small>${deep?.visual_review ? '原作观察、技术结论、小柚验证步骤与证据来源' : '文字初析 · 尚未完成媒体细查'}</small></summary>
      <div class="phase" aria-label="研究阶段"><span class="done">文字已解析</span><span ${review ? 'class="done"' : ''}>${review ? reviewLabel : '媒体内容待细查'}</span><span>小柚实作待验证</span></div>
      <p class="lead">${esc(item.summary)}</p>
      ${deepAnalysis(item)}
      ${deep ? '<details class="first-pass"><summary>首轮文字解析、旧判断及关联资料</summary>' : ''}
      ${sections.map(([key,title]) => `<section class="analysis-section"><h3>${title}</h3><p>${esc(item[key])}</p></section>`).join('')}
      <section class="analysis-section correction"><h3>旧判断修正</h3><p>${esc(item.correction)}</p></section>
      <details class="prior"><summary>查看原清单判断</summary><p>${esc(item.title)} · ${esc(item.previous_priority)}<br>${esc(item.previous_note)}</p></details>
      ${deep ? `<a class="deep-link" href="${esc(deep.document_file || '01-h3-motion-deep-dive.md')}">阅读本条专项拆解与验证方案 →</a>` : ''}
      <section class="analysis-section"><h3>关联条目</h3><div class="related">${item.related.map(id => `<a href="#${id}">${id} ${esc(byId.get(id).title)}</a>`).join('')}</div></section>
      <section class="sources"><h3>来源与后续入口</h3><p>文字通过 FxTwitter 镜像读取。${deep ? "本条已完成原始展示与资料首轮对照；实际生成尚未验证。" : "视频和图片尚未逐项完成细查。"}${item.article_title ? `本帖含长文：${esc(item.article_title)}。` : ''}</p><ul><li><a href="${esc(item.capture)}">帖文文字与引用快照</a> · <a href="notes/${item.id}.md">独立解析笔记</a></li>${primaryLinks}${outLinks}</ul></section>${deep ? '</details>' : ''}</details>`;
    bindMedia();
    bindSummary();
    window.renderXEmbeds($('case'));
    $('position').textContent = `${item.id} / 48 · 顺序阅读`;
    $('prev').disabled = current === '01';
    $('next').disabled = current === '48';
    const saved = personal[current] || {};
    $('personal-notes').value = typeof saved.notes === 'string' ? saved.notes : '';
    $('digested').checked = saved.digested === true;
    $('save-state').textContent = storageAvailable ? '个人记录仅存于本浏览器' : '请用导出按钮保存个人记录';
    document.title = `${item.id} ${item.subject} · 创作资源研究`;
    outline();
  }

  function move(offset) { location.hash = String(Number(current) + offset).padStart(2, '0'); }
  $('prev').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('search').addEventListener('input', outline);
  $('group').addEventListener('change', outline);
  $('personal-notes').addEventListener('input', save);
  $('digested').addEventListener('change', save);
  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({project:'小柚创作资源逐条研究',schema_version:1,exported_at:new Date().toISOString(),items:personal},null,2)],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'xiaoyou-personal-notes.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('case').addEventListener('click', event => {
    const jump = event.target.closest('[data-analysis-target]');
    if (jump) {
      const target = $('case').querySelector(jump.dataset.analysisTarget);
      if (!target) return;
      const analysis = target.closest('details.analysis-body');
      if (analysis) analysis.open = true;
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
      target.scrollIntoView({behavior:'instant',block:'start'});
      return;
    }
    const button = event.target.closest('[data-image]');
    if (!button) return;
    $('lightbox').classList.toggle('summary-lightbox', Boolean(button.closest('.research-summary')));
    $('lightbox-image').src = button.dataset.image;
    $('lightbox-image').alt = button.dataset.caption;
    $('lightbox-caption').textContent = button.dataset.caption;
    $('lightbox').showModal();
  });
  $('lightbox-close').addEventListener('click', () => $('lightbox').close());
  function renderRoute() {
    const id = location.hash.slice(1);
    view = byId.has(id) ? id : 'overview';
    $('overview').hidden = view !== 'overview';
    $('study').hidden = view === 'overview';
    if (view === 'overview') { document.title = '48 条资料总览 · 创作资源研究'; outline(); }
    else { current = view; render(); }
  }
  window.addEventListener('hashchange', () => {
    renderRoute();
    const target = view === 'overview' ? $('overview') : $('case');
    if (view !== 'overview') target.focus({preventScroll:true});
    if (window.innerWidth <= 650) target.scrollIntoView({behavior:'instant',block:'start'});
    else window.scrollTo({top:0,behavior:'instant'});
  });
  renderRoute();
})();
