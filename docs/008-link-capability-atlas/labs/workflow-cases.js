(() => {
  const cases = {
    '07': ['字幕制作台', '剪辑交付', '用温室宣传片、巡检口播或自己的视频校对字幕，再下载通过检查的 WebVTT。'],
    '08': ['简报审核工作台', '发布验收', '导入候选稿或重开已有报告，按同一批样本对照两套审核配置。'],
    '09': ['图鉴电台', '音频编辑', '听温室巡检、双版口播和小镜动图的制作现场。节目、章节、字幕和播报包共用音轨时间。'],
  };
  const params = new URLSearchParams(location.search);
  const requested = params.get('case');
  const caseId = Object.hasOwn(cases, requested) ? requested : '07';
  const byId = id => document.getElementById(id);
  const element = (tag, text, css) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (css) node.className = css;
    return node;
  };

  function vttTime(seconds) {
    const milliseconds = Math.round(seconds * 1000);
    const hours = String(Math.floor(milliseconds / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor(milliseconds / 60000) % 60).padStart(2, '0');
    const wholeSeconds = String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0');
    return `${hours}:${minutes}:${wholeSeconds}.${String(milliseconds % 1000).padStart(3, '0')}`;
  }

  function makeVtt(cues) {
    return `WEBVTT\n\n${cues.map(([start, end, text]) => `${vttTime(start)} --> ${vttTime(end)}\n${text}`).join('\n\n')}\n`;
  }

  byId('back-link').href = `../#case-${caseId}`;
  byId('case-kicker').textContent = `${caseId} / ${cases[caseId][1]}`;
  byId('case-title').textContent = cases[caseId][0];
  byId('case-intro').textContent = cases[caseId][2];
  byId(`case-${caseId}`).hidden = false;
  document.title = `${cases[caseId][0]} · 能力图鉴`;

  if (caseId === '07') initPipeline();
  if (caseId === '08') initHarness();
  if (caseId === '09') initRadio();

  function initPipeline() {
    const projectInput = byId('caption-project');
    const titleInput = byId('caption-title');
    const cueList = byId('caption-cues');
    const retry = byId('retry-pipeline');
    const report = byId('pipeline-status');
    const stagesNode = byId('pipeline-stages');
    const artifact = byId('caption-artifact');
    const download = byId('download-vtt');
    const fix = byId('fix-timing');
    const film = byId('caption-film');
    const monitor = byId('caption-monitor');
    const sourceDownload = byId('caption-source-download');
    const previewPlay = byId('preview-play');
    const previewSeek = byId('preview-seek');
    const previewMute = byId('preview-mute');
    const previewSubtitles = byId('preview-subtitles');
    const captionTimeline = byId('caption-timeline');
    const previewFormat = byId('caption-format');
    const videoStatus = byId('caption-video-status');
    const vttStatus = byId('caption-vtt-status');
    const videoInput = byId('caption-local-video');
    const vttInput = byId('caption-local-vtt');
    const addCue = byId('caption-add-cue');
    const overlapSample = byId('load-overlap');
    const localLimit = 300;
    const maxCueLength = 500;
    const emptyTitle = '本地字幕项目';
    const projects = {
      greenhouse: {
        title: 'VERDANT R04 温室巡检',
        duration: 16,
        media: 'camera-media/film.mp4',
        poster: 'camera-media/film.jpg',
        key: 'capability-atlas.caption-workbench.greenhouse.v1',
        cues: [
          [.45, 2.95, '温室巡检车，穿行于种植行之间。'],
          [3.208, 6.1, '贴近地面，沿通道跟随巡检车。'],
          [6.417, 9.3, '镜头推近，看清双目传感器。'],
          [9.583, 12.45, '定格绕拍，从侧面观察车身结构。'],
          [12.792, 15.75, 'VERDANT R04 · 温室巡检概念车'],
        ],
      },
      collage: {
        ...window.atlasCollageCaption,
        title: '巡检口播 · 拼贴版',
        media: 'collage-media/compare-br-clean.mp4',
        poster: 'collage-media/compare-br-clean.jpg',
        aspect: 'portrait',
        key: 'capability-atlas.caption-workbench.collage.v1',
      },
      galaxy: {
        title: '一眼看懂旋臂张角',
        duration: 8,
        key: 'capability-atlas.caption-workbench.v1',
        cues: [
          [0, 2.4, '固定同一批星点。'],
          [2.4, 5.4, '只改变旋臂张角。'],
          [5.4, 8, '比较旋臂是紧卷还是舒展。'],
        ],
      },
      local: { title: emptyTitle, duration: 8, cues: [[0, 2.4, '']] },
    };
    const labels = { title: '检查交付标题', copy: '检查字幕文案', timing: '检查时间码', output: '编译 WebVTT' };
    const dependencies = ['title', 'copy', 'timing'];
    const sessionDrafts = new Map();
    let project;
    let duration;
    let cueInputs = [];
    let counts;
    let state;
    let downloadUrl;
    let downloadSignature;
    let previewCues = [];
    let timelineButtons = [];
    let previewTime = 0;
    let animation = null;
    let fallbackStartedAt = null;
    let mediaFailed = false;
    let showSubtitles = true;
    let videoSelection = 0;
    let vttSelection = 0;
    let localDraft;

    const seconds = value => {
      const milliseconds = Math.round(value * 1000);
      return Number.isSafeInteger(milliseconds) ? milliseconds / 1000 : NaN;
    };
    const usesFilm = () => Boolean(project?.media && !mediaFailed);
    const isLocal = () => project === projects.local;
    const clockLabel = value => duration >= 3600 ? vttTime(value) : vttTime(value).slice(3);
    const normalizeCopy = text => text.replace(/\r\n?/g, '\n').split('\n').filter(line => line.trim()).join('\n').trim();

    function field(id, caption, input) {
      const label = element('label', caption);
      input.id = id;
      label.htmlFor = id;
      label.append(input);
      return label;
    }

    function buildCueInputs(cues) {
      cueList.replaceChildren();
      return cues.map(([start, end, text], index) => {
        const row = element('li');
        const number = index + 1;
        const heading = element('div', undefined, 'cue-heading');
        const clockFields = element('div', undefined, 'inline-fields');
        const times = [start, end].map((value, edge) => {
          const input = element('input');
          input.type = 'number';
          input.min = '0';
          input.max = String(duration);
          input.step = '0.001';
          input.value = String(value);
          const id = edge === 0 && index === 1 ? 'caption-start' : `caption-${number}-${edge ? 'end' : 'start'}`;
          const caption = edge ? '出点' : '入点';
          const timeField = element('div', undefined, 'cue-time-field');
          const mark = element('button', '取当前时间', 'text-button');
          mark.type = 'button';
          mark.setAttribute('aria-label', `第 ${number} 句${caption}取当前播放时间`);
          mark.onclick = () => {
            const time = usesFilm() ? film.currentTime : previewTime;
            input.value = String(seconds(Math.min(duration, time)));
            inputChanged();
          };
          input.oninput = inputChanged;
          timeField.append(field(id, `${caption}（秒）`, input), mark);
          clockFields.append(timeField);
          return input;
        });
        const copy = element(isLocal() ? 'textarea' : 'input');
        if (isLocal()) copy.rows = 2;
        else copy.type = 'text';
        copy.value = text;
        copy.maxLength = isLocal() ? maxCueLength : 90;
        copy.oninput = inputChanged;
        const copyId = `caption-${number}-copy`;
        const copyLabel = element('label', `第 ${number} 句`);
        copyLabel.htmlFor = copyId;
        copy.id = copyId;
        const locate = element('button', '定位', 'text-button');
        locate.type = 'button';
        locate.setAttribute('aria-label', `定位第 ${number} 句入点`);
        locate.onclick = () => seekTo(times[0].valueAsNumber);
        const actions = element('div', undefined, 'cue-heading-actions');
        actions.append(locate);
        if (isLocal()) {
          const remove = element('button', '移除', 'text-button');
          remove.type = 'button';
          remove.disabled = cues.length === 1;
          remove.setAttribute('aria-label', `移除第 ${number} 句`);
          remove.onclick = () => {
            const remaining = draftCues();
            remaining.splice(index, 1);
            updateCueList(remaining);
            cueInputs[Math.min(index, cueInputs.length - 1)][2].focus();
            inputChanged();
          };
          actions.append(remove);
        }
        heading.append(copyLabel, actions);
        row.append(heading, copy, clockFields);
        cueList.append(row);
        return [...times, copy];
      });
    }

    const draftCues = () => cueInputs.map(fields => fields.map(field => field.value));

    function updateCueList(cues) {
      cueInputs = buildCueInputs(cues);
      byId('caption-cue-count').textContent = `${cueInputs.length} 句`;
      addCue.disabled = cues.length >= localLimit;
    }

    function saveDraft() {
      const draft = { title: titleInput.value, cues: draftCues() };
      if (isLocal()) {
        localDraft = draft;
        return;
      }
      sessionDrafts.set(project.key, draft);
      try {
        localStorage.setItem(project.key, JSON.stringify(draft));
      } catch {
        byId('caption-storage').textContent = '当前环境只保留本页的编辑。';
      }
    }

    function readDraft() {
      if (isLocal() && localDraft) return localDraft;
      if (isLocal()) return { title: project.title, cues: project.cues };
      if (sessionDrafts.has(project.key)) return sessionDrafts.get(project.key);
      try {
        const draft = JSON.parse(localStorage.getItem(project.key));
        if (typeof draft?.title === 'string' && draft.cues?.length === project.cues.length && draft.cues.every(row => Array.isArray(row) && row.length === 3 && row.every(value => typeof value === 'string'))) {
          return draft;
        }
      } catch {
        byId('caption-storage').textContent = '当前环境只保留本页的编辑。';
      }
      return { title: project.title, cues: project.cues };
    }

    const signatures = () => {
      const cues = cueInputs.map(([start, end, copy]) => [seconds(start.valueAsNumber), seconds(end.valueAsNumber), normalizeCopy(copy.value)]);
      return {
        title: titleInput.value.trim().replace(/\s+/g, ' '),
        copy: JSON.stringify(cues.map(cue => cue[2])),
        timing: JSON.stringify([duration, ...cues.map(cue => cue.slice(0, 2))]),
        cues,
      };
    };
    const isCurrent = (key, inputs) => state[key]?.signature === inputs[key];
    const exportSignature = inputs => JSON.stringify(dependencies.map(key => inputs[key]));

    function verify(key, inputs) {
      if (key === 'title') return inputs.title ? { ok: true, message: inputs.title } : { ok: false, message: '请输入交付标题。' };
      if (key === 'copy') {
        const empty = inputs.cues.findIndex(cue => !cue[2]);
        return empty < 0 ? { ok: true, message: `${inputs.cues.length} 句文案已填写。` } : { ok: false, message: `第 ${empty + 1} 句缺少字幕文案。` };
      }
      for (const [index, [start, end]] of inputs.cues.entries()) {
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > duration || start >= end) {
          return { ok: false, message: `第 ${index + 1} 句需要在 0–${duration} 秒内，且出点晚于入点。` };
        }
        if (index && start < inputs.cues[index - 1][1]) {
          return { ok: false, message: `第 ${index} 句与第 ${index + 1} 句的时间码顺序冲突。` };
        }
      }
      return { ok: true, message: `${inputs.cues.length} 句时间码顺序正确。` };
    }

    function packageVtt(inputs) {
      const safeText = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      const vtt = makeVtt(inputs.cues.map(([start, end, copy]) => [start, end, safeText(copy)]));
      state.output = { signature: exportSignature(inputs), ok: true, message: `${inputs.cues.length} 条字幕已编译。`, vtt };
      counts.output++;
    }

    function setPlayLabel(playing) {
      previewPlay.textContent = playing ? '暂停' : '播放';
    }

    function cancelClock() {
      if (animation !== null) cancelAnimationFrame(animation);
      animation = null;
    }

    function stopPreview() {
      cancelClock();
      fallbackStartedAt = null;
      if (usesFilm()) film.pause();
      setPlayLabel(false);
    }

    function setPreviewTime(time) {
      previewTime = Math.max(0, Math.min(duration, time));
      previewSeek.value = String(previewTime);
      byId('preview-time').textContent = `${clockLabel(previewTime)} / ${clockLabel(duration)}`;
      const active = previewCues.findIndex(([start, end, text]) => start <= previewTime && previewTime < end && text);
      const content = showSubtitles && active >= 0 ? previewCues[active][2] : '';
      const caption = byId('preview-caption');
      if (caption.textContent !== content) caption.textContent = content;
      caption.hidden = !content;
      for (const button of timelineButtons) {
        const current = String(Number(button.dataset.cue) === active);
        if (button.getAttribute('aria-current') !== current) button.setAttribute('aria-current', current);
      }
      captionTimeline.style.setProperty('--playhead', `${100 * previewTime / duration}%`);
    }

    function advancePreview(timestamp) {
      const now = usesFilm() ? film.currentTime : (timestamp - fallbackStartedAt) / 1000;
      setPreviewTime(now);
      if (now >= duration || (usesFilm() && film.paused)) stopPreview();
      else animation = requestAnimationFrame(advancePreview);
    }

    function seekTo(time) {
      if (!Number.isFinite(time)) return;
      setPreviewTime(time);
      if (usesFilm()) film.currentTime = previewTime;
      else if (fallbackStartedAt !== null) fallbackStartedAt = performance.now() - previewTime * 1000;
    }

    function renderTimeline(cues) {
      timelineButtons = [];
      for (const [index, [start, end, copy]] of cues.entries()) {
        if (!(start >= 0 && end <= duration && end > start)) continue;
        const button = element('button', String(index + 1), 'caption-segment');
        button.type = 'button';
        button.dataset.cue = String(index);
        button.style.left = `${100 * start / duration}%`;
        button.style.width = `${100 * (end - start) / duration}%`;
        button.title = `${clockLabel(start)} → ${clockLabel(end)}  ${copy}`;
        button.setAttribute('aria-label', `定位第 ${index + 1} 句，${button.title}`);
        button.onclick = () => seekTo(start);
        timelineButtons.push(button);
      }
      captionTimeline.replaceChildren(...timelineButtons);
    }

    function refreshDuration() {
      previewSeek.max = String(duration);
      byId('caption-preview-tag').textContent = `${duration} 秒 · ${usesFilm() ? '实际成片' : '时间轴'}`;
      for (const [start, end] of cueInputs) start.max = end.max = String(duration);
    }

    previewPlay.onclick = async () => {
      if (usesFilm()) {
        if (!film.paused) { film.pause(); return; }
        if (previewTime >= duration) seekTo(0);
        const currentProject = project;
        try { await film.play(); }
        catch {
          if (project === currentProject && usesFilm()) byId('caption-preview-state').textContent = '暂时无法开始播放。可以拖动时间轴校对字幕。';
        }
        return;
      }
      if (fallbackStartedAt !== null) { stopPreview(); return; }
      fallbackStartedAt = performance.now() - (previewTime >= duration ? 0 : previewTime) * 1000;
      setPlayLabel(true);
      animation = requestAnimationFrame(advancePreview);
    };
    previewSeek.oninput = () => seekTo(Number(previewSeek.value));
    previewMute.onclick = () => { film.muted = !film.muted; };
    previewSubtitles.onclick = () => {
      showSubtitles = !showSubtitles;
      previewSubtitles.setAttribute('aria-pressed', String(showSubtitles));
      setPreviewTime(previewTime);
    };

    film.addEventListener('volumechange', () => previewMute.setAttribute('aria-pressed', String(film.muted)));
    film.addEventListener('play', () => {
      if (!usesFilm()) return;
      cancelClock();
      setPlayLabel(true);
      animation = requestAnimationFrame(advancePreview);
    });
    for (const event of ['pause', 'ended']) film.addEventListener(event, () => {
      if (!usesFilm() || !film.paused) return;
      cancelClock();
      setPlayLabel(false);
    });
    for (const event of ['seeked', 'timeupdate']) film.addEventListener(event, () => {
      if (usesFilm() && film.readyState >= 1 && film.currentSrc === film.src) setPreviewTime(film.currentTime);
    });
    film.addEventListener('loadedmetadata', () => {
      const currentDuration = seconds(film.duration);
      if (!usesFilm() || film.currentSrc !== film.src || !(currentDuration > 0)) return;
      monitor.dataset.aspect = film.videoHeight > film.videoWidth ? 'portrait' : 'landscape';
      if (duration !== currentDuration) {
        duration = currentDuration;
        if (isLocal()) project.duration = currentDuration;
        refreshDuration();
        renderPipeline();
      }
      seekTo(previewTime);
    });
    film.addEventListener('error', () => {
      if (!usesFilm() || !film.error) return;
      cancelClock();
      mediaFailed = true;
      monitor.dataset.media = 'draft';
      film.hidden = previewMute.hidden = true;
      byId('caption-media-error').hidden = false;
      refreshDuration();
      setPlayLabel(false);
    });

    function renderPipeline() {
      const inputs = signatures();
      const exportCurrent = state.output?.signature === exportSignature(inputs)
        && dependencies.every(key => isCurrent(key, inputs) && state[key].ok);
      stagesNode.replaceChildren(...Object.keys(labels).map(key => {
        const current = key === 'output' ? exportCurrent : isCurrent(key, inputs);
        const result = state[key];
        const item = element('li');
        item.dataset.stage = key;
        item.dataset.state = current ? (result.ok ? 'pass' : 'fail') : 'pending';
        const resultText = current ? result.message : result ? '输入有更新，待校验。' : key === 'output' ? '等待三项检查通过。' : '等待检查。';
        const status = current ? (result.ok ? '通过' : '需修正') : '待处理';
        item.append(element('b', labels[key]), element('small', `${status} · 执行 ${counts[key]} 次`), element('p', resultText));
        return item;
      }));
      retry.disabled = exportCurrent;
      artifact.hidden = !exportCurrent;
      const [, firstEnd] = inputs.cues[0];
      const [secondStart, secondEnd] = inputs.cues[1] ?? [];
      fix.hidden = !(secondStart < firstEnd && firstEnd < secondEnd);
      if (downloadUrl && (!exportCurrent || downloadSignature !== state.output.signature)) {
        URL.revokeObjectURL(downloadUrl);
        downloadUrl = undefined;
        download.removeAttribute('href');
        download.setAttribute('aria-disabled', 'true');
      }
      previewCues = inputs.cues;
      renderTimeline(previewCues);
      setPreviewTime(previewTime);
      byId('caption-preview-state').textContent = exportCurrent ? '已校验，画面字幕和下载使用同一组时间码。' : '草稿预览。校验通过后可下载新的 WebVTT。';
      if (!exportCurrent) return;
      byId('artifact-title').textContent = inputs.title;
      byId('artifact-vtt').textContent = state.output.vtt;
      if (!downloadUrl) {
        downloadUrl = URL.createObjectURL(new Blob([state.output.vtt], { type: 'text/vtt;charset=utf-8' }));
        downloadSignature = state.output.signature;
        download.href = downloadUrl;
        download.download = `${inputs.title.replace(/[^\p{L}\p{N}._ -]/gu, '-').replace(/^[. ]+|[. ]+$/g, '') || 'captions'}-字幕.vtt`;
        download.removeAttribute('aria-disabled');
      }
    }

    function run(onlyAffected) {
      const inputs = signatures();
      const executed = [];
      for (const key of dependencies) {
        if (onlyAffected && isCurrent(key, inputs) && state[key].ok) continue;
        state[key] = { signature: inputs[key], ...verify(key, inputs) };
        counts[key]++;
        executed.push(labels[key]);
      }
      const ready = dependencies.every(key => state[key].ok);
      if (ready) {
        packageVtt(inputs);
        executed.push(labels.output);
      }
      const retained = dependencies.filter(key => !executed.includes(labels[key])).map(key => labels[key]);
      report.textContent = `本轮执行 ${executed.join('、')}。${retained.length ? `沿用 ${retained.join('、')}。` : ''}${ready ? '字幕可下载。' : '请修正检查中标出的内容。'}`;
      renderPipeline();
    }

    function inputChanged() {
      if (isLocal() && !project.media) {
        duration = project.duration = Math.max(8, ...cueInputs.map(([, end]) => seconds(end.valueAsNumber) || 0));
        refreshDuration();
      }
      saveDraft();
      renderPipeline();
      report.textContent = retry.disabled ? '当前字幕已通过检查，可以下载。' : '输入已更新。校验时会复用仍有效的检查结果。';
    }
    byId('run-pipeline').onclick = () => run(false);
    retry.onclick = () => run(true);
    fix.onclick = () => { cueInputs[1][0].value = cueInputs[0][1].value; inputChanged(); run(true); };
    overlapSample.onclick = () => {
      const firstEnd = cueInputs[0][1].valueAsNumber;
      cueInputs[1][0].value = Number.isFinite(firstEnd) && firstEnd > 0 ? String(seconds(Math.max(0, firstEnd - .6))) : '0';
      inputChanged();
      run(true);
    };
    titleInput.oninput = inputChanged;

    function showPreviewMedia() {
      mediaFailed = false;
      const greenhousePortrait = project === projects.greenhouse && previewFormat.value === 'portrait';
      const media = greenhousePortrait ? 'camera-media/film-vertical.mp4' : project.media;
      const poster = greenhousePortrait ? 'camera-media/film-vertical.jpg' : project.poster;
      const aspect = greenhousePortrait ? 'portrait' : project.aspect ?? 'landscape';
      monitor.dataset.aspect = aspect;
      byId('caption-media-error').hidden = true;
      monitor.dataset.media = media ? 'film' : 'draft';
      byId('caption-monitor-title').textContent = media ? '成片预览' : '字幕草稿预览';
      film.hidden = previewMute.hidden = sourceDownload.hidden = !media;
      if (media) {
        if (poster) film.poster = poster;
        else film.removeAttribute('poster');
        film.src = media;
        film.setAttribute('aria-label', isLocal() ? project.filename : `${project.title} · ${aspect === 'portrait' ? '竖屏' : '横屏'}`);
        sourceDownload.href = media;
        sourceDownload.download = project.filename ?? '';
        sourceDownload.textContent = isLocal() ? '下载所选视频' : project === projects.collage ? '下载无内嵌字幕 MP4' : '下载原片 MP4';
      } else {
        film.removeAttribute('src');
        film.removeAttribute('poster');
        sourceDownload.removeAttribute('href');
      }
      film.load();
      refreshDuration();
    }

    previewFormat.onchange = () => {
      stopPreview();
      showPreviewMedia();
    };

    function changeProject() {
      stopPreview();
      project = projects[projectInput.value];
      duration = project.duration;
      previewTime = 0;
      counts = { title: 0, copy: 0, timing: 0, output: 0 };
      state = {};
      const draft = readDraft();
      titleInput.value = draft.title;
      updateCueList(draft.cues);
      byId('caption-local').hidden = addCue.hidden = !isLocal();
      overlapSample.hidden = isLocal();
      byId('caption-storage').textContent = isLocal() ? '本地草稿仅保留在当前页面，关闭前请导出。' : '草稿保存在当前浏览器。';
      byId('caption-format-choice').hidden = project !== projects.greenhouse;
      showPreviewMedia();
      run(false);
    }

    addCue.onclick = () => {
      const cues = draftCues();
      if (cues.length >= localLimit) return;
      const position = cues.findIndex(([start]) => start !== '' && Number(start) > previewTime);
      const index = position < 0 ? cues.length : position;
      const start = seconds(Math.max(previewTime, Number(cues[index - 1]?.[1] || 0)));
      const nextStart = Number(cues[index]?.[0] ?? (project.media ? duration : start + 2.4));
      const end = seconds(Math.min(start + 2.4, nextStart));
      if (start >= end) {
        report.textContent = '当前位置到下一句或片尾之间没有可用时段。请移到字幕之间的空档，再添加。';
        return;
      }
      cues.splice(index, 0, [start, end, '']);
      updateCueList(cues);
      cueInputs[index][2].focus();
      inputChanged();
    };

    function parseWebVtt(text) {
      const blocks = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trimEnd().split(/\n(?:[ \t]*\n)+/);
      const header = blocks.shift().split('\n');
      if (!/^WEBVTT(?:[ \t].*)?$/.test(header[0]) || header.some(line => line.includes('-->'))) {
        throw new Error('请使用含 WEBVTT 文件头的字幕文件。');
      }
      const timestamp = '(?:\\d{2,}:)?\\d{2}:\\d{2}\\.\\d{3}';
      const timing = new RegExp(`^(${timestamp})[ \\t]+-->[ \\t]+(${timestamp})(?:[ \\t]+.*)?$`);
      function parseTimestamp(value) {
        const [whole, ms] = value.split('.');
        const [s, m, h = 0] = whole.split(':').map(Number).reverse();
        const total = ((h * 60 + m) * 60 + s) * 1000 + Number(ms);
        return m < 60 && s < 60 && Number.isSafeInteger(total) ? total / 1000 : NaN;
      }
      const cues = [];
      for (const block of blocks) {
        const lines = block.split('\n');
        if (/^NOTE(?:[ \t]|$)/.test(lines[0])) continue;
        const line = lines[0].includes('-->') ? 0 : 1;
        if (/^(?:STYLE|REGION)[ \t]*$/.test(lines[0]) && !lines[1]?.includes('-->')) continue;
        const match = lines[line]?.trim().match(timing);
        if (!match) throw new Error(`第 ${cues.length + 1} 句的时间码格式无效。`);
        const start = parseTimestamp(match[1]);
        const end = parseTimestamp(match[2]);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
          throw new Error(`第 ${cues.length + 1} 句需要有效的入点和出点，且出点晚于入点。`);
        }
        const fragment = new VTTCue(start, end, lines.slice(line + 1).join('\n')).getCueAsHTML();
        fragment.querySelectorAll('rt').forEach(node => node.remove());
        const copy = normalizeCopy(fragment.textContent);
        if (!copy || copy.length > maxCueLength) {
          throw new Error(`第 ${cues.length + 1} 句需要 1–${maxCueLength} 个字符的正文。`);
        }
        cues.push([start, end, copy]);
        if (cues.length > localLimit) throw new Error(`单个项目最多支持 ${localLimit} 句字幕。`);
      }
      if (!cues.length) throw new Error('没有找到带时间码的字幕。');
      return cues;
    }

    const fileTitle = file => file.name.replace(/\.[^.]+$/, '').trim().slice(0, titleInput.maxLength) || emptyTitle;

    vttInput.onchange = async () => {
      const [file] = vttInput.files;
      vttInput.value = '';
      if (!file) return;
      const selection = ++vttSelection;
      vttStatus.textContent = '正在读取字幕…';
      try {
        if (file.size > 1024 * 1024) throw new Error('WebVTT 文件最多支持 1 MB。');
        let content;
        try {
          content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
        } catch {
          throw new Error('无法读取字幕。请保存为 UTF-8 后重新导入。');
        }
        if (selection !== vttSelection) return;
        const cues = parseWebVtt(content);
        const title = localDraft?.title ?? emptyTitle;
        localDraft = { title: title === emptyTitle ? fileTitle(file) : title, cues };
        if (!projects.local.media) projects.local.duration = Math.max(8, ...cues.map(([, end]) => end));
        if (isLocal()) {
          duration = projects.local.duration;
          titleInput.value = localDraft.title;
          updateCueList(cues);
          refreshDuration();
          run(true);
        }
        vttStatus.textContent = `已导入 ${file.name}，共 ${cues.length} 句。导出采用纯文本字幕。`;
      } catch (error) {
        if (selection === vttSelection) vttStatus.textContent = `导入失败。原稿已保留。${error.message}`;
      }
    };

    function readVideoDuration(url) {
      return new Promise((resolve, reject) => {
        const probe = element('video');
        const timeout = setTimeout(() => finish(NaN), 12000);
        function finish(value) {
          clearTimeout(timeout);
          probe.onloadedmetadata = probe.onerror = null;
          probe.removeAttribute('src');
          probe.load();
          if (Number.isFinite(value) && value > 0) resolve(value);
          else reject(new Error('无法读取视频时长。请尝试可在浏览器中播放的 MP4 或 WebM。'));
        }
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => finish(seconds(probe.duration));
        probe.onerror = () => finish(NaN);
        probe.src = url;
        probe.load();
      });
    }

    videoInput.onchange = async () => {
      const [file] = videoInput.files;
      videoInput.value = '';
      if (!file) return;
      const selection = ++videoSelection;
      const url = URL.createObjectURL(file);
      videoStatus.textContent = '正在读取视频…';
      try {
        const length = await readVideoDuration(url);
        if (selection !== videoSelection) {
          URL.revokeObjectURL(url);
          return;
        }
        const local = projects.local;
        const previous = local.media;
        const draft = localDraft ?? local;
        const cues = localDraft ? draft.cues : [[0, Math.min(length, 2.4), '']];
        localDraft = { title: draft.title === emptyTitle ? fileTitle(file) : draft.title, cues };
        Object.assign(local, { media: url, filename: file.name, duration: length });
        if (isLocal()) changeProject();
        if (previous) URL.revokeObjectURL(previous);
        videoStatus.textContent = `已载入 ${file.name}，片长 ${length} 秒。`;
      } catch (error) {
        URL.revokeObjectURL(url);
        if (selection === videoSelection) videoStatus.textContent = `载入失败。当前项目已保留。${error.message}`;
      }
    };

    projectInput.onchange = changeProject;
    const initialProject = params.get('project');
    if (Object.hasOwn(projects, initialProject)) projectInput.value = initialProject;
    changeProject();
  }

  function initHarness() {
    const download = byId('download-harness-report');
    const csvDownload = byId('download-harness-csv');
    const mismatchFilter = byId('harness-mismatches');
    const rows = byId('harness-rows');
    const jsonInput = byId('harness-json');
    const fileInput = byId('harness-import');
    const dataStatus = byId('harness-data-status');
    const maxDatasetChars = 131072;
    let inputRevision = 0;
    const materials = {
      galaxy: { name: '银河实验说明 v2', approved: true, version: 'v2', lines: ['可固定随机种子', '可单独调整旋臂张角'] },
      meeting: { name: '内部聊天摘记 v2', approved: false, version: 'v2', lines: ['上线日期已经确认'] },
      archive: { name: '页面归档 v1', approved: true, version: 'v1', lines: ['旧入口仍然可用'] },
      lesson: { name: '微课说明 v2', approved: true, version: 'v2', lines: ['预测后可以调光', '进度条可以跳到练习'] },
    };
    const samples = [
      { claim: '可固定随机种子', reference: 'galaxy', expected: true },
      { claim: '模型已匹配真实星表', reference: 'galaxy', expected: false },
      { claim: '上线日期已经确认', reference: 'meeting', expected: false },
      { claim: '旧入口仍然可用', reference: 'archive', expected: false },
      { claim: '预测后可以调光', reference: 'lesson', expected: true },
      { claim: '提交预测后就能调整光强', reference: 'lesson', expected: true },
      { claim: '获得一张新的发布许可', reference: 'missing', expected: false },
    ];
    const rules = [
      { id: 'guard-authority', name: '来源权限', reason: '来源仅供内部参考', test: source => source.approved },
      { id: 'guard-evidence', name: '逐句证据', reason: '摘记中未找到逐字匹配', test: (source, sample) => source.lines.includes(sample.claim) },
      { id: 'guard-freshness', name: '版本', reason: '来源版本与目标版本不一致', test: (source, sample, dataset) => source.version === dataset.expectedSourceVersion },
    ];
    const baseRule = { id: 'source-exists', name: '引用资料存在' };
    const example = {
      title: '审核图鉴短简报',
      expectedSourceVersion: 'v2',
      sources: Object.entries(materials).map(([id, source]) => ({ id, ...source })),
      samples,
    };
    const exampleText = JSON.stringify(example, null, 2);
    const shortText = (value, limit) => typeof value === 'string' && value.length <= limit && value.trim().length > 0;

    function readDataset(text) {
      let data;
      try {
        data = JSON.parse(text.replace(/^\uFEFF/, ''));
      } catch {
        throw new Error('JSON 无法解析。请检查引号、逗号和括号。');
      }
      let restoredRules;
      if (data?.dataset !== undefined) {
        if (data.schemaVersion !== 2) throw new Error('请使用本工作台导出的 v2 对照报告。');
        const savedRules = data.candidate?.rules;
        if (!Array.isArray(savedRules) || savedRules.length > rules.length + 1 || savedRules[0]?.id !== baseRule.id) {
          throw new Error('报告缺少有效的方案 B 规则配置。');
        }
        const ids = savedRules.slice(1).map(rule => rule?.id);
        restoredRules = new Set(ids);
        if (restoredRules.size !== ids.length || ids.some(id => !rules.some(rule => rule.id === id))) {
          throw new Error('报告含有重复或未知的护栏编号。');
        }
        data = data.dataset;
      }
      if (!shortText(data?.title, 100) || !shortText(data.expectedSourceVersion, 60)) {
        throw new Error('请填写 title 和 expectedSourceVersion。');
      }
      if (!Array.isArray(data.sources) || data.sources.length > 50 || !Array.isArray(data.samples) || !data.samples.length || data.samples.length > 100) {
        throw new Error('请提供 sources 数组和 1 至 100 条 samples，来源上限为 50 条。');
      }
      const indexed = new Map();
      const sources = data.sources.map((source, index) => {
        if (!shortText(source?.id, 80) || !shortText(source.name, 160) || !shortText(source.version, 60) || typeof source.approved !== 'boolean' ||
            !Array.isArray(source.lines) || source.lines.length > 50 || !source.lines.every(line => shortText(line, 500))) {
          throw new Error(`第 ${index + 1} 条来源需填写 id、name、version、布尔值 approved 和摘记数组 lines。`);
        }
        if (indexed.has(source.id)) throw new Error(`第 ${index + 1} 条来源的 id 重复。`);
        const entry = { id: source.id, name: source.name, version: source.version, approved: source.approved, lines: source.lines };
        indexed.set(entry.id, entry);
        return entry;
      });
      const items = data.samples.map((sample, index) => {
        if (!shortText(sample?.claim, 500) || !shortText(sample.reference, 80) || typeof sample.expected !== 'boolean') {
          throw new Error(`第 ${index + 1} 条样本需填写 claim、reference 和布尔值 expected。`);
        }
        return { claim: sample.claim, reference: sample.reference, expected: sample.expected };
      });
      const input = { title: data.title, expectedSourceVersion: data.expectedSourceVersion, sources, samples: items };
      if (JSON.stringify(input).length > maxDatasetChars) throw new Error('样本内容超过编辑器上限。请减少来源摘记或候选稿。');
      return { input, indexed, restoredRules };
    }

    function evaluate(sample, source, activeRules, dataset) {
      let checks = 1;
      if (!source) return { allow: false, checks, reason: '找不到引用资料' };
      for (const rule of activeRules) {
        checks++;
        if (!rule.test(source, sample, dataset)) return { allow: false, checks, reason: rule.reason };
      }
      return { allow: true, checks, reason: activeRules.length ? '通过所选规则' : '找到引用资料' };
    }

    function measure(results, items) {
      return results.reduce((total, result, index) => {
        const expected = items[index].expected;
        total.correct += Number(result.allow === expected);
        total.falseAccept += Number(result.allow && !expected);
        total.falseReject += Number(!result.allow && expected);
        total.checks += result.checks;
        return total;
      }, { samples: results.length, correct: 0, falseAccept: 0, falseReject: 0, checks: 0 });
    }

    function scoreCard(label, stats) {
      const card = element('div', undefined, 'score');
      card.dataset.variant = label.startsWith('A') ? 'a' : 'b';
      card.append(element('b', label), element('strong', `${stats.correct} / ${stats.samples}`), element('span', `误放 ${stats.falseAccept} · 误拦 ${stats.falseReject}`), element('span', `实际检查 ${stats.checks} 次`));
      return card;
    }

    function clearReport() {
      byId('harness-search').hidden = true;
      for (const anchor of [download, csvDownload]) {
        if (anchor.href.startsWith('blob:')) URL.revokeObjectURL(anchor.href);
        anchor.removeAttribute('href');
        anchor.setAttribute('aria-disabled', 'true');
      }
    }

    function offerDownload(anchor, contents, type) {
      anchor.href = URL.createObjectURL(new Blob([contents], { type: `${type};charset=utf-8` }));
      anchor.removeAttribute('aria-disabled');
    }

    function writeCsv(items) {
      const records = [['序号', '候选稿', '来源编号', '来源名称', '预期', 'A 判定', 'A 理由', 'A 检查次数', 'B 判定', 'B 理由', 'B 检查次数', 'B 误判']];
      const verdict = allow => allow ? '放行' : '拦截';
      for (const [index, { claim, reference, source, expectedAllow, baseline, candidate }] of items.entries()) {
        const mismatch = candidate.allow === expectedAllow ? '—' : candidate.allow ? '误放' : '误拦';
        records.push([index + 1, claim, reference, source?.name ?? '', verdict(expectedAllow), verdict(baseline.allow), baseline.reason,
          baseline.checks, verdict(candidate.allow), candidate.reason, candidate.checks, mismatch]);
      }
      const cell = value => {
        let text = String(value);
        if (/^[\s\x00-\x1f]*[=+\-@＝＋－＠]/u.test(text)) text = `'${text}`;
        return `"${text.replaceAll('"', '""')}"`;
      };
      return '\uFEFF' + records.map(record => record.map(cell).join(',')).join('\r\n') + '\r\n';
    }

    function filterRows() {
      let visible = 0;
      for (const row of rows.children) {
        row.hidden = mismatchFilter.checked && row.dataset.match === 'true';
        if (!row.hidden) visible++;
      }
      byId('harness-row-count').textContent = visible
        ? `显示 ${visible} / ${rows.children.length} 条 · 导出包含全部记录`
        : '本轮方案 B 没有误判。';
    }

    function runHarness(parsed, search) {
      clearReport();
      try {
        parsed ??= readDataset(jsonInput.value);
      } catch (error) {
        dataStatus.textContent = error.message;
        byId('harness-status').textContent = '数据集需要修正。下方保留上轮结果。';
        byId('harness-dataset').open = true;
        return;
      }
      const { input, indexed, restoredRules } = parsed;
      if (restoredRules) for (const rule of rules) byId(rule.id).checked = restoredRules.has(rule.id);
      const items = input.samples;
      const active = rules.filter(rule => byId(rule.id).checked);
      const baseline = items.map(sample => evaluate(sample, indexed.get(sample.reference), [], input));
      const candidate = items.map(sample => evaluate(sample, indexed.get(sample.reference), active, input));
      const baselineTotals = measure(baseline, items);
      const candidateTotals = measure(candidate, items);
      byId('harness-sample-count').textContent = `${items.length} 条样本`;
      const summary = `「${input.title}」 · ${input.sources.length} 个来源 · ${items.length} 条样本。`;
      dataStatus.textContent = `${restoredRules ? '已恢复候选稿与护栏，并重新计算' : '已运行'}${summary}`;
      byId('harness-scores').replaceChildren(scoreCard('A · 基线', baselineTotals), scoreCard('B · 选中护栏', candidateTotals));
      rows.replaceChildren(...items.map((sample, index) => {
        const item = element('li');
        item.dataset.match = String(candidate[index].allow === sample.expected);
        const material = element('div');
        const source = indexed.get(sample.reference);
        material.append(element('strong', sample.claim), element('small', `${source?.name || '来源编号不存在'} · 预期${sample.expected ? '放行' : '拦截'}`));
        if (source) {
          const evidence = element('details', undefined, 'evidence');
          const excerpts = element('ul');
          excerpts.append(...source.lines.map(line => element('li', line)));
          evidence.append(element('summary', '核对原始摘记'), excerpts);
          material.append(evidence);
        }
        const verdict = (label, result) => {
          const node = element('div', `${label} · ${result.allow ? '放行' : '拦截'}`, 'verdict');
          node.dataset.match = String(result.allow === sample.expected);
          node.append(element('small', result.reason));
          return node;
        };
        item.append(material, verdict('A', baseline[index]), verdict('B', candidate[index]));
        return item;
      }));
      filterRows();
      byId('harness-status').textContent = `方案 B 已启用 ${active.length} 道护栏。${active.length ? `本轮核对${active.map(rule => rule.name).join('、')}。` : '两组现在使用同样的规则。'}`;
      const report = {
        schemaVersion: 2,
        scenario: input.title,
        expectedSourceVersion: input.expectedSourceVersion,
        dataset: input,
        baseline: { rules: [baseRule], totals: baselineTotals },
        candidate: { rules: [baseRule, ...active.map(({ id, name }) => ({ id, name }))], totals: candidateTotals },
        items: items.map((sample, index) => ({
          claim: sample.claim,
          reference: sample.reference,
          source: indexed.get(sample.reference) ?? null,
          expectedAllow: sample.expected,
          baseline: baseline[index],
          candidate: candidate[index],
        })),
      };
      if (search) {
        report.search = search;
        byId('harness-search-rows').replaceChildren(...search.runs.map(run => {
          const row = element('tr');
          row.dataset.selected = String(run.mask === search.selectedMask);
          const name = run.rules.map(rule => rule.name).join('、') || '只查来源存在';
          const label = run.mask === search.selectedMask ? name + ' · 选中' : name;
          row.append(element('td', label), element('td', `${run.totals.correct} / ${run.totals.samples}`),
            ...['falseAccept', 'falseReject', 'checks'].map(key => element('td', run.totals[key])));
          return row;
        }));
        byId('harness-search').hidden = false;
        byId('harness-status').textContent = `已试跑 ${search.runs.length} 种配置，选中 ${active.length} 道护栏。当前样本正确 ${candidateTotals.correct} / ${items.length}，误放 ${candidateTotals.falseAccept}，误拦 ${candidateTotals.falseReject}。`;
      }
      offerDownload(download, JSON.stringify(report, null, 2) + '\n', 'application/json');
      offerDownload(csvDownload, writeCsv(report.items), 'text/csv');
      if (restoredRules) putDatasetInEditor(input);
    }

    function putDatasetInEditor(input) {
      const formatted = JSON.stringify(input, null, 2);
      jsonInput.value = formatted.length <= maxDatasetChars ? formatted : JSON.stringify(input);
    }

    byId('run-harness').onclick = () => { inputRevision++; runHarness(); };
    byId('search-harness').onclick = () => {
      inputRevision++;
      try {
        const parsed = readDataset(jsonInput.value);
        const runs = Array.from({ length: 2 ** rules.length }, (_, mask) => {
          const active = rules.filter((rule, index) => mask & (1 << index));
          const results = parsed.input.samples.map(sample => evaluate(sample, parsed.indexed.get(sample.reference), active, parsed.input));
          return { mask, rules: active.map(({ id, name }) => ({ id, name })), totals: measure(results, parsed.input.samples) };
        });
        const ranked = [...runs].sort((a, b) => a.totals.falseAccept - b.totals.falseAccept ||
          b.totals.correct - a.totals.correct || a.totals.checks - b.totals.checks || a.rules.length - b.rules.length);
        const winner = ranked[0];
        parsed.restoredRules = new Set(winner.rules.map(rule => rule.id));
        runHarness(parsed, { selection: 'fewest false accepts, most correct, fewest checks, fewest rules', selectedMask: winner.mask, runs });
      } catch (error) {
        dataStatus.textContent = error.message;
        byId('harness-dataset').open = true;
      }
    };
    mismatchFilter.onchange = filterRows;
    byId('reset-harness').onclick = () => { inputRevision++; for (const rule of rules) byId(rule.id).checked = true; runHarness(); };
    byId('restore-harness-samples').onclick = () => { inputRevision++; jsonInput.value = exampleText; fileInput.value = ''; runHarness(); };
    jsonInput.oninput = () => {
      inputRevision++;
      clearReport();
      dataStatus.textContent = '样本已修改。选择「用同一批样本对照」查看新结果。';
      byId('harness-status').textContent = '样本已改变。下方显示上轮结果。';
    };
    fileInput.onchange = async () => {
      const [file] = fileInput.files;
      if (!file) return;
      const revision = ++inputRevision;
      fileInput.value = '';
      if (file.size > 16 * 1024 * 1024) {
        dataStatus.textContent = '请选择 16 MB 以内的 JSON 文件。';
        return;
      }
      let source;
      try { source = await file.text(); } catch {
        if (revision === inputRevision) dataStatus.textContent = '无法读取文件。可将内容粘贴到编辑框。';
        return;
      }
      if (revision !== inputRevision) return;
      let parsed;
      try { parsed = readDataset(source); } catch (error) {
        dataStatus.textContent = `载入失败。当前样本与规则已保留。${error.message}`;
        return;
      }
      if (!parsed.restoredRules) putDatasetInEditor(parsed.input);
      runHarness(parsed);
    };
    for (const rule of rules) byId(rule.id).onchange = () => {
      inputRevision++;
      clearReport();
      byId('harness-status').textContent = '配置已改变。下方显示上轮结果，重新对照后可下载新报告。';
    };
    jsonInput.value = exampleText;
    runHarness();
  }

  function initRadio() {
    const audio = byId('tour-audio');
    const episodes = [window.atlasRadioIssue, {
      title: '图鉴三站导览', label: '图鉴三站', slug: 'workflow-tour', audio: 'workflow-tour.mp3', duration: 46.929,
      chapters: [
        { name: '纸片拼贴', scene: 'collage', case: '01', start: 0 },
        { name: '银河飞越', scene: 'galaxy', case: '06', start: 12.594 },
        { name: '颜色微课', scene: 'rgb', case: '10', start: 29.629 },
      ],
      cues: [
        [0, '第一站，纸片拼贴。把任务拆成三张卡片。'],
        [6.652, '调整入场顺序，观察哪一张最先吸引注意力。'],
        [12.594, '第二站，银河飞越。固定星点，只改变旋臂张角。'],
        [20.056, '把镜头移向太阳，再回到俯视。比较视角和形状各自发生了什么变化。'],
        [29.629, '第三站，颜色微课。先猜红光加绿光会变成什么颜色。'],
        [37.546, '关掉蓝光，读取中心像素。验证完毕，就能把规则用到新的颜色上。'],
      ],
    }].filter(Boolean);
    const selector = byId('radio-episode');
    const art = byId('radio-scene-image');
    const mediaError = byId('tour-media-error');
    let episode;
    let buttons = [];
    let transcript = [];
    let displayedChapter;
    let exportedDuration;
    const duration = () => episode.package || !Number.isFinite(audio.duration) || audio.duration <= episode.cues.at(-1)[0]
      ? episode.duration : audio.duration;

    function updateDownloads() {
      const end = duration();
      if (end === exportedDuration) return;
      for (const [type, entries] of [
        ['captions', episode.cues],
        ['chapters', episode.chapters.map(({ start, name }) => [start, name])],
      ]) {
        const anchor = byId(`download-tour-${type}`);
        const vtt = makeVtt(entries.map(([start, text], index) => [start, entries[index + 1]?.[0] ?? end, text]));
        if (anchor.href.startsWith('blob:')) URL.revokeObjectURL(anchor.href);
        anchor.href = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt;charset=utf-8' }));
        anchor.download = `${episode.slug}.${type}.vtt`;
      }
      exportedDuration = end;
    }

    const clock = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    function jumpButton(list, label, start) {
      const button = element('button', label);
      button.type = 'button';
      button.append(element('time', clock(start)));
      button.onclick = () => {
        if (audio.error) return;
        audio.currentTime = start;
        sync();
      };
      const row = element('li');
      row.append(button);
      list.append(row);
      return button;
    }
    const syncMediaStatus = () => { mediaError.hidden = !audio.error; };

    function sync() {
      const now = audio.currentTime;
      const chapterIndex = Math.max(0, episode.chapters.findLastIndex(chapter => chapter.start <= now));
      const chapter = episode.chapters[chapterIndex];
      const cueIndex = episode.cues.findLastIndex(([time]) => time <= now);
      const cue = episode.cues[cueIndex]?.[1] ?? episode.title;
      if (chapter !== displayedChapter) {
        displayedChapter = chapter;
        byId('radio-display').dataset.scene = chapter.art ? 'photo' : chapter.scene;
        art.hidden = !chapter.art;
        if (chapter.art) {
          art.src = chapter.art;
          art.alt = chapter.alt;
        } else {
          art.removeAttribute('src');
        }
        byId('radio-chapter').textContent = `${String(chapterIndex + 1).padStart(2, '0')} / ${chapter.name}`;
        byId('radio-scene-link').href = `../#explore-${chapter.case}`;
      }
      if (byId('radio-caption').textContent !== cue) byId('radio-caption').textContent = cue;
      byId('radio-time').textContent = `${clock(now)} / ${clock(duration())}`;
      for (const [list, active] of [[buttons, chapterIndex], [transcript, cueIndex]]) {
        for (const [index, button] of list.entries()) button.setAttribute('aria-current', String(index === active));
      }
    }

    function setDownload(id, path) {
      const anchor = byId(id);
      anchor.hidden = !path;
      if (path) {
        anchor.href = path;
        anchor.download = path.split('/').at(-1);
      } else {
        anchor.removeAttribute('href');
      }
    }

    function selectEpisode() {
      episode = episodes[Number(selector.value)];
      exportedDuration = undefined;
      displayedChapter = undefined;
      byId('radio-chapters').replaceChildren();
      byId('tour-transcript').replaceChildren();
      buttons = episode.chapters.map((chapter, index) => {
        const button = jumpButton(byId('radio-chapters'), `${String(index + 1).padStart(2, '0')} · ${chapter.name}`, chapter.start);
        button.dataset.chapter = String(index + 1);
        return button;
      });
      transcript = episode.cues.map(([start, line]) => jumpButton(byId('tour-transcript'), line, start));
      byId('radio-program-label').textContent = episode.label;
      byId('radio-runtime').textContent = `中文 · ${clock(episode.duration)}`;
      byId('radio-credits').textContent = episode.package ? '原创台本、合成旁白与节目提示音。章节配图取自对应的成品。' : '原创台本与合成旁白。配图为本站绘制的 SVG。';
      byId('radio-package-info').textContent = episode.portable
        ? '离线播放器内嵌音轨、章节配图与文字稿。用浏览器打开下载的 HTML 即可播放。ZIP 提供可分开使用的素材。'
        : episode.package ? '整期包包含 MP3、封面、字幕、章节与可复用的文字稿。' : '字幕和章节对应当前播放的音轨。';
      setDownload('download-tour-audio', episode.audio);
      setDownload('download-tour-cover', episode.cover);
      setDownload('download-tour-offline', episode.portable);
      setDownload('download-tour-package', episode.package);
      const cover = byId('radio-episode-cover');
      cover.hidden = !episode.cover;
      if (episode.cover) cover.src = episode.cover;
      else cover.removeAttribute('src');
      audio.src = episode.audio;
      audio.load();
      updateDownloads();
      syncMediaStatus();
      sync();
    }
    selector.replaceChildren(...episodes.map(({ title }, index) => {
      const option = element('option', title);
      option.value = index;
      return option;
    }));
    selector.onchange = selectEpisode;
    for (const event of ['loadedmetadata', 'timeupdate', 'seeking', 'seeked']) audio.addEventListener(event, sync);
    for (const event of ['loadedmetadata', 'error', 'emptied']) audio.addEventListener(event, syncMediaStatus);
    audio.addEventListener('durationchange', updateDownloads);
    selectEpisode();
  }
})();
