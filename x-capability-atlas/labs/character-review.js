(() => {
  const media = 'character-media/';
  const reference = {label: '同一参考图', file: 'xiaojing.png', detail: '对照镜框、右侧发夹、发型和脸型。'};
  const stock = {
    blink: {label: '现有本地眨眼', file: 'xiaojing-idle.gif'},
    nod: {label: '现有本地点头', file: 'xiaojing-nod.gif'},
  };
  const portraits = [
    {label: '微笑', file: 'xiaojing-expression-smile.png', detail: '嘴角和脸颊上提；镜框、发夹与原图接近。'},
    {label: '惊讶', file: 'xiaojing-expression-surprise.png', detail: '眼睛睁大、嘴巴张圆；下巴看起来略长。'},
    {label: '担忧', file: 'xiaojing-expression-concern.png', detail: '眉心抬起，嘴角略下压；轮廓和配件较稳定。'},
  ];
  const generated = {
    blink: {label: '模型分镜版 · 眨眼', file: 'xiaojing-blink-generated.gif', sheet: 'xiaojing-blink-sheet.png', finding: '眼镜和发夹的位置基本稳定；最后一帧的眼睛还没完全睁开，回到首帧会轻跳。'},
    nod: {label: '模型分镜版 · 点头', file: 'xiaojing-nod-generated.gif', sheet: 'xiaojing-nod-sheet.png', finding: '低头时镜框随头一起动，角色仍可辨认。发梢和脸部轮廓会略变，最后回正也比眨眼更容易察觉一跳。'},
  };
  const native = {
    blink: {label: 'ChatGPT Images 原生眨眼', file: 'xiaojing-blink-native.gif', finding: '眼睑开合连贯，镜框和发夹样式保持一致。头部与肩线仍有轻微位移，末帧切回首帧时更容易看到一跳。'},
    nod: {label: 'ChatGPT Images 原生点头', file: 'xiaojing-nod-native.gif', finding: '眼镜和发夹随头部一起动，仍能认出小镜。抬回时有一步偏快。首尾比另一候选更接近，镜框位置仍有细小变化。'},
  };

  function mountPortraitReview(root) {
    const panel = document.createElement('section');
    panel.className = 'character-review';
    panel.setAttribute('aria-labelledby', 'expression-review-title');
    panel.innerHTML = `<header><div><p class="review-kicker">02 / 参考图实验</p><h2 id="expression-review-title">换个表情，还是小镜吗？</h2><p>三次编辑都从同一张原图开始。先看完整头像，再放大看眼镜、发夹和下颌。</p></div><button type="button" aria-pressed="false">放大五官</button></header><div class="review-grid"></div>`;
    const grid = panel.querySelector('.review-grid');
    panel.querySelector('button').onclick = event => toggleDetail(event.currentTarget, grid);
    for (const portrait of [reference, ...portraits]) {
      const card = document.createElement('figure');
      card.innerHTML = `<div class="review-portrait"><img width="1254" height="1254"></div><figcaption><strong></strong><a download>PNG ↓</a><span class="review-caption-note"></span></figcaption>`;
      const img = card.querySelector('img');
      img.src = media + portrait.file;
      img.alt = `小镜 · ${portrait.label}`;
      card.querySelector('strong').textContent = portrait.label;
      card.querySelector('span').textContent = portrait.detail;
      card.querySelector('a').href = img.src;
      grid.append(card);
    }
    root.prepend(panel);
  }

  function toggleDetail(button, grid) {
    const zoomed = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(zoomed));
    grid.dataset.detail = String(zoomed);
  }

  async function readGif(source) {
    const bytes = source instanceof File ? await source.arrayBuffer() : await fetch(media + source).then(response => {
      if (!response.ok) throw new Error('读取文件失败');
      return response.arrayBuffer();
    });
    if (!/^GIF8[79]a$/.test(new TextDecoder().decode(bytes.slice(0, 6)))) throw new Error('请选择有效的 GIF 文件');
    const decoder = new ImageDecoder({type: 'image/gif', data: bytes});
    const frames = [];
    let duration = 0;
    try {
      await decoder.tracks.ready;
      const count = decoder.tracks.selectedTrack?.frameCount ?? 0;
      if (count < 2 || count > 120) throw new Error('请使用 2–120 帧的 GIF');
      for (let frameIndex = 0; frameIndex < count; frameIndex++) {
        const {image} = await decoder.decode({frameIndex});
        try {
          if (image.displayWidth > 1536 || image.displayHeight > 1536) throw new Error('GIF 画幅最大为 1536 像素');
          const scale = Math.min(1, 420 / Math.max(image.displayWidth, image.displayHeight));
          const bitmap = await createImageBitmap(image, {
            resizeWidth: Math.max(1, Math.round(image.displayWidth * scale)),
            resizeHeight: Math.max(1, Math.round(image.displayHeight * scale)),
            resizeQuality: 'high',
          });
          frames.push({bitmap, start: duration});
          duration += image.duration > 0 ? image.duration / 1000 : 100;
        } finally {
          image.close();
        }
      }
      return {frames, duration};
    } catch (error) {
      for (const frame of frames) frame.bitmap.close();
      throw error;
    } finally {
      decoder.close();
    }
  }

  function paint(canvas, frame) {
    const context = canvas.getContext('2d');
    const image = frame.bitmap;
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }

  function mountMotionReview(root) {
    const panel = document.createElement('section');
    panel.className = 'character-review';
    panel.setAttribute('aria-labelledby', 'gif-review-title');
    panel.innerHTML = `<header><div><p class="review-kicker">03 / 动作检查</p><h2 id="gif-review-title">看眼镜、发夹和循环首尾</h2><p>拖进度条看相近的动作阶段，或用原速播放感受节奏。</p></div><div class="review-tools"><button type="button" data-move="blink" aria-pressed="true">眨眼</button><button type="button" data-move="nod" aria-pressed="false">点头</button><button type="button" data-detail aria-pressed="false">放大五官</button></div></header>
      <div class="review-tools review-variants" role="group" aria-label="选择右侧对照版本"><span>右侧对照</span><button type="button" data-variant="native" aria-pressed="true">原生 GIF</button><button type="button" data-variant="sheet" aria-pressed="false">分镜版</button><button type="button" data-variant="import" aria-pressed="false" hidden>导入样本</button></div>
      <div class="review-grid motion">${[0, 1].map(() => `<figure><div class="review-canvas"><canvas width="420" height="420" hidden></canvas><img width="420" height="420" alt="" hidden><p class="review-empty"></p></div><figcaption><strong></strong><span></span><a data-clip download hidden>GIF ↓</a><a data-sheet download hidden>原始分镜 ↓</a></figcaption></figure>`).join('')}</div>
      <div class="review-controls"><button type="button" data-play disabled>原速循环</button><button type="button" data-frame disabled>下一帧</button><input type="range" min="0" max="1000" value="0" aria-label="同步循环进度" disabled><output>0%</output><button type="button" data-seam aria-expanded="false" disabled>首尾对照</button></div>
      <p class="review-status" role="status"></p><p class="review-finding"></p><div class="review-seam" hidden></div>
      <details class="review-import"><summary>比较自己的 GIF</summary><label>载入当前动作的 GIF<input type="file" accept="image/gif,.gif"></label><p>文件只在当前页面读取。加载后可以逐帧查看。</p></details>`;
    root.prepend(panel);
    const grid = panel.querySelector('.review-grid');
    const columns = [...grid.querySelectorAll('figure')];
    const play = panel.querySelector('[data-play]');
    const step = panel.querySelector('[data-frame]');
    const seamButton = panel.querySelector('[data-seam]');
    const slider = panel.querySelector('input[type="range"]');
    const output = panel.querySelector('output');
    const status = panel.querySelector('.review-status');
    const finding = panel.querySelector('.review-finding');
    const seams = panel.querySelector('.review-seam');
    const input = panel.querySelector('input[type="file"]');
    const variants = [...panel.querySelectorAll('[data-variant]')];
    const imported = new Map();
    let motion = 'blink';
    let variant = 'native';
    let generation = 0;
    let clips = [];
    let animation;
    let phase = 0;
    let sources = [];

    function pause() {
      cancelAnimationFrame(animation);
      animation = undefined;
      play.textContent = '原速循环';
    }

    function showPhase(value, elapsed) {
      phase = value;
      slider.value = String(Math.round(value * 1000));
      output.value = `${Math.round(value * 100)}%`;
      clips.forEach((clip, index) => {
        if (!clip) return;
        const time = elapsed === undefined ? value * clip.duration : elapsed % clip.duration;
        const frameIndex = clip.frames.findLastIndex(item => item.start <= time);
        const frame = clip.frames[frameIndex];
        if (clip.visible === frame) return;
        paint(columns[index].querySelector('canvas'), frame);
        clip.visible = frame;
        columns[index].querySelector('figcaption span').textContent = `第 ${frameIndex + 1}/${clip.frames.length} 帧 · ${(clip.duration / 1000).toFixed(2)} 秒`;
      });
    }

    function closeClips(items) {
      for (const clip of items) for (const frame of clip?.frames ?? []) frame.bitmap.close();
    }

    function rawPreview(column, source) {
      const img = column.querySelector('img');
      img.src = source.url ?? media + source.file;
      img.alt = source.label;
      img.hidden = false;
      column.querySelector('.review-empty').hidden = true;
    }

    async function loadMotion(validatedImport) {
      const request = ++generation;
      pause();
      closeClips(clips);
      clips = [];
      const localSample = imported.get(motion);
      if (variant === 'import' && !localSample) variant = 'native';
      for (const button of variants) {
        button.hidden = button.dataset.variant === 'import' && !localSample;
        button.setAttribute('aria-pressed', String(button.dataset.variant === variant));
      }
      const right = variant === 'import' ? localSample : (variant === 'sheet' ? generated : native)[motion];
      sources = [stock[motion], right];
      finding.textContent = sources[1].finding ?? '';
      play.disabled = step.disabled = slider.disabled = seamButton.disabled = true;
      seams.hidden = true;
      seamButton.setAttribute('aria-expanded', 'false');
      seams.replaceChildren();
      showPhase(0);
      status.textContent = '正在读取 GIF 帧…';
      sources.forEach((source, index) => {
        const column = columns[index];
        column.querySelector('canvas').hidden = true;
        const img = column.querySelector('img');
        img.hidden = true;
        img.removeAttribute('src');
        const empty = column.querySelector('.review-empty');
        empty.hidden = false;
        empty.textContent = '正在读取';
        column.querySelector('strong').textContent = source.label;
        column.querySelector('span').textContent = '';
        const link = column.querySelector('[data-clip]');
        const sheet = column.querySelector('[data-sheet]');
        sheet.hidden = !source?.sheet;
        if (source?.sheet) sheet.href = media + source.sheet;
        link.hidden = !source;
        link.href = source.url ?? media + source.file;
      });
      if (!window.ImageDecoder || !await ImageDecoder.isTypeSupported('image/gif')) {
        if (request !== generation) return;
        sources.forEach((source, index) => { if (source) rawPreview(columns[index], source); });
        status.textContent = '当前浏览器可播放 GIF。逐帧检查需要支持 ImageDecoder 的浏览器。';
        return;
      }
      const results = await Promise.allSettled(sources.map((source, index) => {
        return index === 1 && validatedImport ? validatedImport : readGif(source.input ?? source.file);
      }));
      const loaded = results.map(result => result.status === 'fulfilled' ? result.value : undefined);
      if (request !== generation) {
        closeClips(loaded);
        return;
      }
      clips = loaded;
      const active = clips.some(Boolean);
      play.disabled = step.disabled = slider.disabled = seamButton.disabled = !active;
      clips.forEach((clip, index) => {
        const column = columns[index];
        if (clip) {
          column.querySelector('canvas').hidden = false;
          column.querySelector('.review-empty').hidden = true;
        } else {
          column.querySelector('.review-empty').textContent = results[index].reason?.message ?? '读取失败';
        }
      });
      showPhase(0);
      if (!clips[0] || !clips[1]) {
        status.textContent = active ? '当前只能读取一侧的 GIF 帧。' : '未能读取 GIF 的帧，可下载原文件播放。';
      } else {
        status.textContent = {
          native: '右侧是从 ChatGPT Images 下载的 GIF 原件。拖动按各自进度对齐，播放保留各自帧时长。',
          sheet: '右侧由模型画六格，再逐格编码成 GIF。',
          import: '右侧是本地导入的 GIF。拖动按各自进度对齐，播放保留各自帧时长。',
        }[variant];
      }
    }

    panel.querySelectorAll('[data-move]').forEach(button => {
      button.onclick = () => {
        if (motion === button.dataset.move) return;
        motion = button.dataset.move;
        panel.querySelectorAll('[data-move]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
        loadMotion();
      };
    });
    for (const button of variants) {
      button.onclick = () => {
        if (variant === button.dataset.variant) return;
        variant = button.dataset.variant;
        loadMotion();
      };
    }
    panel.querySelector('[data-detail]').onclick = event => toggleDetail(event.currentTarget, grid);
    slider.oninput = () => { pause(); showPhase(Number(slider.value) / 1000); };
    step.onclick = () => {
      pause();
      const clip = clips[1] ?? clips[0];
      const index = clip.frames.findLastIndex(item => item.start <= phase * clip.duration);
      const next = clip.frames[(index + 1) % clip.frames.length];
      showPhase((next.start + .001) / clip.duration);
    };
    play.onclick = () => {
      if (animation !== undefined) { pause(); return; }
      const base = clips[1] ?? clips[0];
      const start = performance.now() - phase * base.duration;
      play.textContent = '暂停';
      const draw = now => {
        const elapsed = now - start;
        showPhase(elapsed % base.duration / base.duration, elapsed);
        animation = requestAnimationFrame(draw);
      };
      animation = requestAnimationFrame(draw);
    };
    seamButton.onclick = () => {
      pause();
      const open = seams.hidden;
      seamButton.setAttribute('aria-expanded', String(open));
      seams.hidden = !open;
      if (!open) return;
      seams.replaceChildren();
      clips.forEach((clip, index) => {
        if (!clip) return;
        const article = document.createElement('article');
        article.innerHTML = '<h3></h3><div class="review-endpoints"><figure><canvas width="240" height="240"></canvas><figcaption>末帧</figcaption></figure><figure><canvas width="240" height="240"></canvas><figcaption>下一圈首帧</figcaption></figure></div>';
        article.querySelector('h3').textContent = sources[index].label;
        const [last, first] = article.querySelectorAll('canvas');
        paint(last, clip.frames.at(-1));
        paint(first, clip.frames[0]);
        seams.append(article);
      });
    };
    input.onchange = async () => {
      const file = input.files[0];
      input.value = '';
      if (!file) return;
      if (file.size > 15 * 1024 * 1024) {
        status.textContent = 'GIF 超过 15 MB。当前对照保留。';
        return;
      }
      const target = motion;
      const request = generation;
      let validated;
      if (window.ImageDecoder && await ImageDecoder.isTypeSupported('image/gif')) {
        try {
          validated = await readGif(file);
        } catch (error) {
          if (request === generation) status.textContent = `${error.message}。当前对照保留。`;
          return;
        }
      } else {
        status.textContent = '导入并检查帧需要支持 ImageDecoder 的浏览器。';
        return;
      }
      if (request !== generation) {
        closeClips([validated]);
        return;
      }
      const previous = imported.get(target);
      if (previous) URL.revokeObjectURL(previous.url);
      imported.set(target, {label: '本地导入样本', input: file, url: URL.createObjectURL(file)});
      variant = 'import';
      loadMotion(validated);
    };
    window.addEventListener('pagehide', event => {
      if (event.persisted) return;
      generation++;
      pause();
      closeClips(clips);
      for (const source of imported.values()) URL.revokeObjectURL(source.url);
    });
    loadMotion();
  }

  window.mountXiaojingReview = (root, id) => {
    if (id === '02') mountPortraitReview(root);
    if (id === '03') mountMotionReview(root);
  };
})();
