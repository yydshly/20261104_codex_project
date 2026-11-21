import { drawPoemFrame, lineCues, preparePoemFrame, scenes } from './haiku-workshop-art.js';
import { makeGeneratedScene } from './haiku-generated-art.js';
import { maxThemeLength, validateScenePlan } from './haiku-scene-plan.js';
import { makePoemSound } from './haiku-workshop-sound.js';
import './haiku-workshop.css';

const videoType = 'video/webm';
const clipLengths = [3, 4, 6, 9, 12];
const defaultDuration = clipLengths[0];
const draftKey = 'haiku-workshop-draft-v1';
const generationAvailable = import.meta.env.MODE !== 'pages';

export function mountHaikuWorkshop(root) {
  const shots = Object.entries(scenes).map(([key, scene], index) => ({
    key, scene, index, lines: [...scene.lines], duration: defaultDuration,
  }));
  root.innerHTML = `
    <section class="haiku-workshop" aria-labelledby="haiku-workshop-title">
      <div class="haiku-workshop__header">
        <p>06 / 诗句与镜头</p>
        <h3 id="haiku-workshop-title">纸上短诗</h3>
        <span>${generationAvailable ? '从一句主题开始，让 AI 写诗并设计一个手绘镜头。' : '编辑示例诗句、调整镜头长度，播放并导出自己的纸上短片。'}</span>
        <p class="haiku-workshop__save" data-poem-save role="status">编辑后自动保存在此浏览器。</p>
      </div>
      <div class="haiku-workshop__grid">
        <form class="haiku-workshop__generator" data-poem-generator>
          <label for="haiku-theme">写一句主题</label>
          <div>
            <input id="haiku-theme" name="theme" type="text" placeholder="例如，雨停后的城市，安静一点" maxlength="${maxThemeLength}" required>
            <button type="submit">${generationAvailable ? '生成并播放' : '本机工坊生成'}</button>
          </div>
          <p data-generation-status role="status">${generationAvailable ? '纸纹、手绘笔触和方形画幅。生成的诗句可以再编辑。' : '这是公开演示版。生成新主题需要在本机启动工坊；下方示例可以直接编辑、播放和导出。'}</p>
          ${generationAvailable ? '' : '<p><a href="https://github.com/yydshly/20261104_codex_project/tree/main/claude-showcase-lab#本地运行" target="_blank" rel="noopener noreferrer">查看本机运行方法 ↗</a></p>'}
        </form>
        <section class="haiku-workshop__storyboard" aria-label="分镜">
          <div class="haiku-workshop__storyboard-label">
            <h4>示例短片 · 从暮到晓</h4>
            <button type="button" data-generated-shot aria-pressed="false" hidden></button>
          </div>
          <ol>
            ${shots.map(({ index, scene }) => `<li>
              <button type="button" data-poem-shot="${index}" aria-pressed="false">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${scene.name}</strong>
                <small data-shot-length></small>
              </button>
            </li>`).join('')}
          </ol>
        </section>
        <div class="haiku-workshop__preview">
          <canvas width="720" height="720" role="img" aria-label="短诗动画预览"></canvas>
          <div class="haiku-workshop__timeline">
            <button type="button" data-poem-play>播放全片</button>
            <label>时间轴 <input type="range" data-poem-time min="0" step=".01" value="0"></label>
            <output data-poem-clock aria-live="off"></output>
          </div>
          <p class="haiku-workshop__frame-label" data-poem-frame></p>
        </div>
        <div class="haiku-workshop__editor">
          <fieldset>
            <legend data-poem-title>诗句</legend>
            ${lineCues.map((_, i) => `<label>第 ${i + 1} 句 <input data-poem-line maxlength="24"></label>`).join('')}
            <button type="button" data-poem-example>恢复本幕示例诗</button>
            <label>本幕片长
              <select data-poem-length>${clipLengths.map(length => `<option value="${length}">${length} 秒</option>`).join('')}</select>
            </label>
          </fieldset>
          <section aria-label="当前镜头节奏" class="haiku-workshop__beats">
            <h4>本幕节奏</h4>
            <ol data-poem-beats></ol>
          </section>
          <div class="haiku-workshop__export">
            <label>播放与导出
              <select data-poem-scope><option value="film">整部短片</option><option value="shot">当前一幕</option></select>
            </label>
            <label class="haiku-workshop__sound"><input type="checkbox" data-poem-sound checked> 场景声音</label>
            <button type="button" data-poem-export>导出整片 WebM</button>
            <a data-poem-download download="从暮到晓.webm" hidden>下载视频 ↓</a>
          </div>
          <p class="haiku-workshop__status" data-poem-status role="status"></p>
        </div>
      </div>
    </section>`;

  const find = selector => root.querySelector(selector);
  const canvas = find('canvas');
  const ctx = canvas.getContext('2d');
  const play = find('[data-poem-play]');
  const timeline = find('[data-poem-time]');
  const clock = find('[data-poem-clock]');
  const frameLabel = find('[data-poem-frame]');
  const settings = find('fieldset');
  const title = find('[data-poem-title]');
  const lengthInput = find('[data-poem-length]');
  const soundInput = find('[data-poem-sound]');
  const scope = find('[data-poem-scope]');
  const lineInputs = [...root.querySelectorAll('[data-poem-line]')];
  const shotButtons = [...root.querySelectorAll('[data-poem-shot]')];
  const beats = find('[data-poem-beats]');
  const exportButton = find('[data-poem-export]');
  const download = find('[data-poem-download]');
  const status = find('[data-poem-status]');
  const generator = find('[data-poem-generator]');
  const themeInput = find('#haiku-theme');
  const generateButton = generator.querySelector('button');
  const generationStatus = find('[data-generation-status]');
  const generatedButton = find('[data-generated-shot]');
  const saveStatus = find('[data-poem-save]');
  const supportsSound = typeof AudioContext !== 'undefined';
  const supportsExport = typeof MediaRecorder !== 'undefined'
    && typeof canvas.captureStream === 'function' && MediaRecorder.isTypeSupported(videoType);

  let selected = shots[0];
  let visibleShot;
  let entries;
  let duration;
  let time = 0;
  let poster = true;
  let frame;
  let playing = false;
  let recording;
  let downloadUrl;
  let disposed = false;
  let audioContext;
  let sound;
  let soundMix;
  let generation;
  let generatedShot;
  const soundBuffers = new Map();

  soundInput.checked = supportsSound;

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        version: 1,
        theme: themeInput.value,
        shots: shots.map(shot => ({ key: shot.key, lines: shot.lines, duration: shot.duration })),
        generated: generatedShot && {
          plan: generatedShot.plan, lines: generatedShot.lines, duration: generatedShot.duration,
        },
        selected: selected === generatedShot ? 'generated' : selected.key,
        scope: scope.value,
      }));
      saveStatus.textContent = '草稿已保存在此浏览器，刷新后可继续编辑。';
    } catch {
      saveStatus.textContent = '浏览器暂时无法保存草稿，请先导出需要保留的短片。';
    }
  }

  function restoreDraft() {
    const validLines = lines => Array.isArray(lines) && lines.length === 3
      && lines.every(line => typeof line === 'string' && line.length <= 24);
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) ?? 'null');
      if (draft?.version !== 1) return;
      for (const shot of shots) {
        const saved = draft.shots?.find(entry => entry.key === shot.key);
        if (saved && validLines(saved.lines) && clipLengths.includes(saved.duration)) {
          shot.lines = saved.lines;
          shot.duration = saved.duration;
        }
      }
      const generated = draft.generated;
      if (generated && validateScenePlan(generated.plan) && validLines(generated.lines)
        && clipLengths.includes(generated.duration)) {
        generatedShot = {
          ...generated, scene: makeGeneratedScene(generated.plan),
        };
        generatedButton.textContent = `生成稿 · ${generated.plan.title}`;
        generatedButton.hidden = false;
      }
      if (typeof draft.theme === 'string') themeInput.value = draft.theme.slice(0, maxThemeLength);
      selected = draft.selected === 'generated' && generatedShot
        ? generatedShot : shots.find(shot => shot.key === draft.selected) ?? shots[0];
      scope.value = draft.scope === 'shot' ? 'shot' : 'film';
      if (selected === generatedShot) scope.value = 'shot';
      saveStatus.textContent = '已恢复此浏览器的草稿，可继续编辑。';
    } catch {
      saveStatus.textContent = '草稿读取失败，当前展示示例。';
    }
  }

  function buildTimeline() {
    const sequence = scope.value === 'film' ? shots : [selected];
    duration = 0;
    entries = sequence.map(shot => {
      const start = duration;
      duration += shot.duration;
      return { shot, start, end: duration };
    });
    timeline.max = String(duration);
  }

  function currentEntry() {
    return entries.find(entry => time < entry.end) ?? entries.at(-1);
  }

  function showEditor() {
    visibleShot = selected;
    title.textContent = `编辑「${selected.scene.name}」`;
    lengthInput.value = String(selected.duration);
    lineInputs.forEach((input, i) => { input.value = selected.lines[i]; });
    beats.replaceChildren(...selected.scene.beats.map((beat, i) => {
      const row = document.createElement('li');
      const cue = document.createElement('span');
      cue.textContent = `${(lineCues[i] * selected.duration).toFixed(1)} 秒`;
      row.append(cue, ' ', beat);
      return row;
    }));
    if (selected.scene.description) {
      const description = document.createElement('li');
      description.textContent = selected.scene.description;
      beats.append(description);
    }
    shotButtons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === selected.index));
      button.querySelector('[data-shot-length]').textContent = `${shots[i].duration} 秒`;
    });
    canvas.setAttribute('aria-label', `「${selected.scene.name}」的方形动画预览`);
    generatedButton.setAttribute('aria-pressed', String(selected === generatedShot));
  }

  function render() {
    const { shot, start } = currentEntry();
    selected = shot;
    if (selected !== visibleShot) showEditor();
    const fraction = poster ? 1 : (time - start) / shot.duration;
    drawPoemFrame(ctx, shot.scene, shot.lines, fraction);
    timeline.value = String(time);
    clock.value = `${time.toFixed(1)} / ${duration} 秒`;
    const prefix = shot === generatedShot ? 'AI 生成稿' : `${String(shot.index + 1).padStart(2, '0')} / ${shots.length}`;
    const caption = `${prefix} · ${shot.scene.name}${poster ? ' · 定格预览' : ''}`;
    if (frameLabel.textContent !== caption) frameLabel.textContent = caption;
  }

  function syncControls() {
    const locked = Boolean(recording);
    settings.disabled = playing || locked;
    soundInput.disabled = !supportsSound || playing || locked;
    scope.disabled = playing || locked;
    play.disabled = locked;
    timeline.disabled = locked;
    exportButton.disabled = locked || playing || Boolean(generation) || !supportsExport;
    themeInput.disabled = generateButton.disabled = !generationAvailable || locked || Boolean(generation);
    generatedButton.disabled = locked;
    shotButtons.forEach(button => { button.disabled = locked; });
    if (playing) play.textContent = '暂停';
    else if (time >= duration) play.textContent = '从头播放';
    else if (poster && time > 0) play.textContent = '从此幕播放';
    else if (time === 0) play.textContent = scope.value === 'film' ? '播放全片' : '播放本幕';
    else play.textContent = '继续播放';
  }

  function stopPlayback() {
    cancelAnimationFrame(frame);
    if (sound) {
      sound.stop();
      sound.disconnect();
      sound = undefined;
    }
    playing = false;
  }

  function prepareAudio() {
    if (!soundInput.checked) return;
    audioContext ??= new AudioContext();
    audioContext.resume().catch(() => {});
    const buffers = entries.map(({ shot }) => {
      const track = shot.scene.sound ?? shot.key;
      const key = `${track}:${shot.duration}`;
      if (!soundBuffers.has(key)) soundBuffers.set(key, makePoemSound(audioContext, track, shot.duration));
      return soundBuffers.get(key);
    });
    if (buffers.length === 1) return buffers[0];
    const key = entries.map(({ shot }) => `${shot.key}:${shot.duration}`).join('|');
    if (soundMix?.key !== key) {
      const sampleRate = buffers[0].sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const samples = buffer.getChannelData(0);
      buffers.forEach((clip, i) => samples.set(clip.getChannelData(0), entries[i].start * sampleRate));
      soundMix = { key, buffer };
    }
    return soundMix.buffer;
  }

  function start(buffer, output) {
    if (time >= duration) time = 0;
    poster = false;
    render();
    if (buffer && output) {
      sound = audioContext.createBufferSource();
      sound.buffer = buffer;
      sound.connect(output);
      sound.start(0, time);
    }
    const origin = performance.now() - time * 1000;
    playing = true;
    syncControls();
    function tick(now) {
      time = Math.min(duration, (now - origin) / 1000);
      render();
      if (time < duration) {
        frame = requestAnimationFrame(tick);
        return;
      }
      stopPlayback();
      syncControls();
      if (recording?.recorder.state === 'recording') recording.recorder.stop();
    }
    frame = requestAnimationFrame(tick);
  }

  function prepareFrames() {
    entries.forEach(({ shot }) => preparePoemFrame(shot.scene, shot.lines));
  }

  function clearDownload() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = undefined;
    download.removeAttribute('href');
    download.hidden = true;
  }

  function showExportSettings() {
    clearDownload();
    const film = scope.value === 'film';
    exportButton.textContent = film ? '导出整片 WebM' : '导出本幕 WebM';
    if (!supportsExport) {
      status.textContent = '此浏览器支持预览。导出需要支持 WebM 录制的浏览器。';
      return;
    }
    const label = film ? `全片 ${shots.length} 幕` : selected.scene.name;
    const audio = soundInput.checked ? '带场景声音' : '无声';
    status.textContent = `${label} · ${duration} 秒 · 720 × 720 · ${audio}`;
  }

  function chooseShot(shot) {
    stopPlayback();
    selected = shot;
    buildTimeline();
    time = entries.find(entry => entry.shot === shot).start;
    poster = true;
    render();
    syncControls();
    if (scope.value === 'shot') showExportSettings();
    saveDraft();
  }

  function openGeneratedShot() {
    scope.value = 'shot';
    chooseShot(generatedShot);
  }

  function playPreview() {
    prepareFrames();
    let buffer;
    try {
      buffer = prepareAudio();
    } catch {
      status.textContent = '场景声音启动失败，可以继续预览画面。';
    }
    start(buffer, audioContext?.destination);
  }

  function finishRecording(job, failed) {
    if (recording !== job) return;
    recording = undefined;
    job.stream.getTracks().forEach(track => track.stop());
    if (disposed) return;
    stopPlayback();
    syncControls();
    if (failed || !job.chunks.length) {
      status.textContent = '视频生成失败，请重试。';
      return;
    }
    downloadUrl = URL.createObjectURL(new Blob(job.chunks, { type: job.recorder.mimeType || videoType }));
    download.href = downloadUrl;
    download.download = `${job.title}.webm`;
    download.hidden = false;
    status.textContent = `「${job.title}」${job.duration} 秒视频已生成，可以下载。`;
  }

  exportButton.addEventListener('click', () => {
    if (recording || playing || generation) return;
    clearDownload();
    let stream;
    try {
      prepareFrames();
      const buffer = prepareAudio();
      const output = buffer && audioContext.createMediaStreamDestination();
      const exportTitle = scope.value === 'film' ? '从暮到晓' : selected.scene.name;
      time = 0;
      poster = false;
      render();
      stream = canvas.captureStream(30);
      output?.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      const recorder = new MediaRecorder(stream, { mimeType: videoType, videoBitsPerSecond: 3000000 });
      const job = { stream, recorder, title: exportTitle, duration, chunks: [] };
      recorder.addEventListener('dataavailable', event => {
        if (event.data.size) job.chunks.push(event.data);
      });
      recorder.addEventListener('error', () => finishRecording(job, true), { once: true });
      recorder.addEventListener('stop', () => finishRecording(job, false), { once: true });
      recorder.start();
      recording = job;
      status.textContent = `正在录制 ${duration} 秒短片，请保持此页打开。`;
      start(buffer, output);
    } catch {
      if (recording) {
        const job = recording;
        if (job.recorder.state === 'recording') job.recorder.stop();
        finishRecording(job, true);
      } else {
        stream?.getTracks().forEach(track => track.stop());
        stopPlayback();
        syncControls();
      }
      status.textContent = '当前浏览器无法录制这段视频。';
    }
  });

  play.addEventListener('click', () => {
    if (playing) {
      stopPlayback();
      syncControls();
      return;
    }
    playPreview();
  });

  timeline.addEventListener('input', () => {
    stopPlayback();
    poster = false;
    time = timeline.valueAsNumber;
    render();
    syncControls();
  });

  shotButtons.forEach((button, index) => button.addEventListener('click', () => chooseShot(shots[index])));
  generatedButton.addEventListener('click', openGeneratedShot);
  scope.addEventListener('change', () => {
    chooseShot(scope.value === 'film' && selected === generatedShot ? shots[0] : selected);
    if (scope.value === 'film') showExportSettings();
  });
  soundInput.addEventListener('change', showExportSettings);
  themeInput.addEventListener('input', saveDraft);

  lengthInput.addEventListener('change', () => {
    const previous = currentEntry();
    const fraction = (time - previous.start) / selected.duration;
    selected.duration = Number(lengthInput.value);
    buildTimeline();
    const start = entries.find(entry => entry.shot === selected).start;
    time = start + fraction * selected.duration;
    showEditor();
    render();
    syncControls();
    showExportSettings();
    saveDraft();
  });

  lineInputs.forEach((input, i) => input.addEventListener('input', () => {
    selected.lines[i] = input.value;
    poster = true;
    render();
    showExportSettings();
    saveDraft();
  }));

  find('[data-poem-example]').addEventListener('click', () => {
    selected.lines = [...selected.scene.lines];
    showEditor();
    poster = true;
    render();
    showExportSettings();
    saveDraft();
  });

  generator.addEventListener('submit', async event => {
    event.preventDefault();
    if (!generationAvailable) return;
    const theme = themeInput.value.trim();
    if (!theme) {
      generationStatus.textContent = '先写一句你想画的主题。';
      themeInput.focus();
      return;
    }
    if (generation || recording) return;

    const controller = new AbortController();
    generation = controller;
    generationStatus.textContent = '正在写诗和构图，生成后会自动播放。';
    syncControls();
    if (soundInput.checked) {
      try {
        audioContext ??= new AudioContext();
        audioContext.resume().catch(() => {});
      } catch {
        // The canvas can play even if the browser blocks audio.
      }
    }

    try {
      const response = await fetch('/api/haiku/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
        signal: controller.signal,
      });
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('请通过本机工坊服务打开网页，再试一次。');
      }
      const plan = await response.json();
      if (!response.ok) throw new Error(plan.error || '生成失败，请重试。');
      if (!validateScenePlan(plan)) throw new Error('镜头方案不完整，请再生成一次。');
      if (disposed) return;

      generatedShot = { plan, scene: makeGeneratedScene(plan), duration: 6, lines: [...plan.lines] };
      generatedButton.textContent = `生成稿 · ${plan.title}`;
      generatedButton.hidden = false;
      generationStatus.textContent = `已生成「${plan.title}」，可逐句编辑或导出视频。`;
      openGeneratedShot();
      playPreview();
      canvas.scrollIntoView({ block: 'center' });
    } catch (error) {
      if (!controller.signal.aborted) generationStatus.textContent = error.message || '生成失败，请重试。';
    } finally {
      generation = undefined;
      if (!disposed) syncControls();
    }
  });

  restoreDraft();
  buildTimeline();
  time = entries.find(entry => entry.shot === selected).start;
  render();
  syncControls();
  showExportSettings();

  return () => {
    disposed = true;
    generation?.abort();
    stopPlayback();
    clearDownload();
    if (recording?.recorder.state === 'recording') recording.recorder.stop();
    recording?.stream.getTracks().forEach(track => track.stop());
    audioContext?.close().catch(() => {});
  };
}
