(() => {
  const find = id => document.getElementById(id);
  const stepButtons = [...document.querySelectorAll('.step')];
  const beatStarts = stepButtons.map(button => Number(button.dataset.time));
  const cues = JSON.parse(find('lesson-cues').textContent);
  const beams = ['r', 'g', 'b'].map(channel => find(`beam-${channel}`));
  const sliders = ['r', 'g', 'b'].map(channel => find(`adjust-${channel}`));
  const play = find('play');
  const seek = find('seek');
  const voice = find('lesson-narration');
  const mute = find('lesson-mute');
  const duration = Number(seek.max);
  const next = find('lesson-next');
  const prediction = find('prediction');
  const resultDownload = find('lesson-result');
  let time = 0;
  let beat = -1;
  let phrase = -1;
  let playing = false;
  let useSilentClock = false;
  let playRequest = 0;
  let previousFrame = null;
  let animation = 0;
  let predictedMix = null;

  const clamp01 = value => Math.min(1, Math.max(0, value));
  const bright = value => Math.round(clamp01(value) * 255);
  const toHex = channel => channel.toString(16).padStart(2, '0').toUpperCase();
  const colorHex = values => `#${values.map(toHex).join('')}`;
  const targetColor = '#FFFF00';

  function showMix(values) {
    const [red, green, blue] = values;
    const hex = colorHex(values);
    beams[0].setAttribute('fill', `rgb(${red}, 0, 0)`);
    beams[1].setAttribute('fill', `rgb(0, ${green}, 0)`);
    beams[2].setAttribute('fill', `rgb(0, 0, ${blue})`);
    find('swatch').style.backgroundColor = hex;
    find('rgb-value').textContent = `RGB(${values.join(', ')})`;
    find('hex-value').textContent = hex;
  }

  function readMix() {
    return sliders.map(slider => Number(slider.value));
  }

  function showExercise() {
    const values = readMix();
    showMix(values);
    sliders.forEach((slider, index) => { slider.nextElementSibling.textContent = values[index]; });
    if (find('adjust').disabled) return;
    const correct = colorHex(values) === targetColor;
    const feedback = find('mix-result');
    const message = correct ? '取样点已达到 #FFFF00。红和绿都到最大，蓝为零。' : '观察取样值，让它接近目标 #FFFF00。';
    if (feedback.textContent !== message) feedback.textContent = message;
  }

  function showFrame() {
    const currentPhrase = Math.max(0, cues.findLastIndex(cue => cue.start <= time));
    const cue = cues[currentPhrase];
    if (currentPhrase !== phrase) {
      phrase = currentPhrase;
      find('cue-id').textContent = `讲解 ${phrase + 1} / ${cues.length}`;
      find('cue-title').textContent = cue.title;
      find('cue-copy').textContent = cue.copy;
    }
    const currentBeat = cue.step;
    if (currentBeat !== beat) {
      beat = currentBeat;
      find('scene-label').textContent = `0${beat + 1} / ${stepButtons[beat].textContent.trim().slice(3)}`;
      find('challenge').hidden = beat !== 2;
      find('lesson-progress').textContent = `第 ${beat + 1} / 3 步`;
      next.hidden = beat === 2;
      next.textContent = beat === 0 ? '下一步 · 叠加光' : '开始练习 · 预测颜色';
      stepButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === beat)));
    }
    seek.value = time;
    find('time').textContent = `${time.toFixed(1)} / ${duration} 秒`;
    if (beat === 2) {
      showExercise();
    } else {
      showMix([Math.round(100 + 155 * clamp01((time - 1.7) / 3.1)), bright((time - 8.1) / 2.8), bright((time - 15.3) / 3.3)]);
    }
  }

  function stop() {
    playRequest++;
    if (!voice.paused) voice.pause();
    playing = false;
    previousFrame = null;
    cancelAnimationFrame(animation);
    play.textContent = time >= duration ? '▶ 重播讲解' : '▶ 播放讲解';
  }

  function syncAudio() {
    if (useSilentClock) return;
    time = Math.min(duration, voice.currentTime);
    showFrame();
  }

  function tick(now) {
    if (!playing) return;
    if (useSilentClock) {
      if (previousFrame !== null) time = Math.min(duration, time + (now - previousFrame) / 1000);
      previousFrame = now;
      showFrame();
    } else {
      syncAudio();
    }
    if (time === duration && (useSilentClock || voice.ended)) stop();
    else animation = requestAnimationFrame(tick);
  }

  function startSilent(continuePlaying) {
    stop();
    useSilentClock = true;
    find('lesson-audio-status').textContent = '暂时无法播放旁白，仍可继续看文字和图解。';
    mute.hidden = true;
    if (!continuePlaying) return;
    playing = true;
    play.textContent = 'Ⅱ 暂停图解';
    animation = requestAnimationFrame(tick);
  }

  voice.addEventListener('timeupdate', syncAudio);
  voice.addEventListener('seeked', syncAudio);
  voice.addEventListener('loadedmetadata', () => { if (time > 0) voice.currentTime = time; });
  voice.addEventListener('ended', () => { syncAudio(); stop(); });
  voice.addEventListener('error', () => startSilent(playing));
  mute.addEventListener('click', () => {
    voice.muted = !voice.muted;
    mute.setAttribute('aria-pressed', String(voice.muted));
    mute.textContent = voice.muted ? '取消静音' : '静音';
  });
  play.addEventListener('click', () => {
    if (playing) return stop();
    if (time >= duration) jump(0);
    if (useSilentClock || voice.error) return startSilent(true);
    playing = true;
    play.textContent = 'Ⅱ 暂停讲解';
    const request = ++playRequest;
    voice.play().then(() => {
      if (request === playRequest) animation = requestAnimationFrame(tick);
    }).catch(() => {
      if (request === playRequest) startSilent(true);
    });
  });

  function jump(nextTime) {
    stop();
    time = nextTime;
    if (!useSilentClock && voice.readyState) voice.currentTime = nextTime;
    showFrame();
  }

  seek.addEventListener('input', () => jump(Number(seek.value)));
  stepButtons.forEach(button => button.addEventListener('click', () => jump(Number(button.dataset.time))));
  next.addEventListener('click', () => {
    jump(beatStarts[beat + 1]);
    if (beat === 2) prediction.querySelector('input').focus();
  });

  prediction.addEventListener('submit', event => {
    event.preventDefault();
    const answer = new FormData(prediction).get('answer');
    predictedMix = answer;
    const message = answer === 'rg' ? '预测正确。试着把蓝通道降到零。' : '先按你的预测调光，看看得到的颜色，再与目标比较。';
    find('prediction-result').textContent = message;
    find('answers').disabled = true;
    find('check').disabled = true;
    find('adjust').disabled = false;
    find('reset').hidden = false;
    resultDownload.hidden = false;
    showExercise();
    sliders[0].focus();
  });

  sliders.forEach(slider => slider.addEventListener('input', showExercise));
  find('reset').addEventListener('click', () => {
    prediction.reset();
    find('answers').disabled = false;
    find('check').disabled = false;
    find('adjust').disabled = true;
    find('reset').hidden = true;
    resultDownload.hidden = true;
    predictedMix = null;
    find('prediction-result').textContent = '';
    find('mix-result').textContent = '';
    sliders.forEach(slider => { slider.value = 255; });
    showExercise();
    prediction.querySelector('input').focus();
  });

  function saveFile(text, type, filename) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  resultDownload.addEventListener('click', () => {
    if (predictedMix === null) return;
    const answers = { rg: '红 + 绿', rb: '红 + 蓝', gb: '绿 + 蓝' };
    const mix = readMix();
    const hex = colorHex(mix);
    const record = [
      '# 同一像素，三束光 · 练习记录', '',
      `- 目标颜色 · ${targetColor}`,
      `- 初次预测 · ${answers[predictedMix]}（${predictedMix === 'rg' ? '正确' : '待验证'}）`,
      `- 当前取样 · RGB(${mix.join(', ')}) / ${hex}`,
      `- 实验结果 · ${hex === targetColor ? '已调到纯黄' : '尚未达到目标'}`, '',
    ].join('\n');
    saveFile(record, 'text/markdown;charset=utf-8', 'rgb-lesson-record.md');
  });

  const offlineButton = find('lesson-offline');
  if (offlineButton) {
    const offlineFile = find('lesson-file');
    const cleanLesson = document.documentElement.cloneNode(true);
    const stylesheet = find('lesson-styles').href;
    const behavior = find('lesson-runtime').src;
    cleanLesson.querySelector('.back').remove();
    cleanLesson.querySelector('#lesson-delivery').remove();

    async function loadAsset(url, binary = false) {
      const response = await fetch(url);
      if (!response.ok) throw Error(`Could not load ${url}`);
      return binary ? response.blob() : response.text();
    }

    function embedAudio(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }

    offlineButton.addEventListener('click', async () => {
      const status = find('lesson-export-status');
      offlineButton.disabled = true;
      status.textContent = '正在整理离线文件。';
      try {
        const [css, js, audio] = await Promise.all([loadAsset(stylesheet), loadAsset(behavior), loadAsset(voice.src, true).then(embedAudio)]);
        const page = cleanLesson.cloneNode(true);
        page.querySelector('#lesson-narration').src = audio;
        const style = document.createElement('style');
        style.textContent = css;
        page.querySelector('#lesson-styles').replaceWith(style);
        const script = document.createElement('script');
        script.textContent = js;
        page.querySelector('#lesson-runtime').remove();
        page.querySelector('body').append(script);
        if (offlineFile.hasAttribute('href')) URL.revokeObjectURL(offlineFile.href);
        const file = new Blob([`<!doctype html>\n${page.outerHTML}`], { type: 'text/html;charset=utf-8' });
        offlineFile.href = URL.createObjectURL(file);
        offlineFile.hidden = false;
        status.textContent = '已生成离线课件。用浏览器打开即可练习。';
      } catch {
        status.textContent = '生成离线课件失败，请重试。';
      } finally {
        offlineButton.disabled = false;
      }
    });
  }

  showFrame();
})();
