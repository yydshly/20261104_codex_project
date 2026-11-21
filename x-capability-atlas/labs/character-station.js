function mountCharacterStation(root) {
  const stockSource = 'character-media/xiaojing.png';
  const finishes = {
    mist: { title: '薄雾青', colors: ['#ecf3da', '#8fbbae'] },
    sand: { title: '暖砂', color: '#e8ceb0' },
    pine: { title: '深松绿', colors: ['#6b9f90', '#203b40'] },
    clear: { title: '透明底' },
  };
  const framing = {
    shoulders: { scale: 1.045, shift: .035 },
    close: { scale: 1.24, shift: .11 },
  };

  const station = document.createElement('section');
  station.className = 'character-station';
  station.setAttribute('aria-labelledby', 'character-station-title');
  station.innerHTML = `<div class="character-stage">
    <div class="character-heading"><div><p class="character-kicker">02 / CHARACTER PORTRAIT</p><h2 id="character-station-title">小镜 · 头像成品</h2></div><span class="character-chip">1:1 PNG</span></div>
    <div class="character-picture"><canvas id="character-portrait" width="512" height="512" role="img" aria-label="按当前构图和背景绘制的头像"></canvas></div>
    <div class="character-chat-row">
      <div class="character-chat"><canvas id="character-chat" width="84" height="84" role="img" aria-label="当前头像在聊天中的圆形效果"></canvas><div><strong id="character-chat-name">小镜</strong><small>头像在聊天里的样子</small></div></div>
      <span class="character-chip">圆形 42 px</span>
    </div>
  </div><div class="character-panel">
    <p class="character-kicker">构图与导出</p><h3>制作头像</h3>
    <div class="character-source"><label for="character-local-input">载入本地图像</label><input id="character-local-input" type="file" accept="image/png,image/jpeg,image/webp"><button type="button" id="character-reset" hidden>还原小镜</button></div>
    <p class="character-status" id="character-source-status" role="status">正在读取小镜原图…</p>
    <fieldset class="character-options"><legend>构图</legend><div class="character-row"><button type="button" data-character-frame="shoulders" aria-pressed="true">头肩</button><button type="button" data-character-frame="close" aria-pressed="false">近景</button></div></fieldset>
    <label class="character-adjust" for="character-y">垂直位置 <output id="character-y-value" for="character-y">0%</output></label>
    <input id="character-y" type="range" min="-14" max="14" step="1" value="0">
    <fieldset class="character-options"><legend>背景</legend><div class="character-finishes">${Object.entries(finishes).map(([key, finish]) => `<button type="button" data-character-background="${key}" aria-pressed="${key === 'mist'}"><span aria-hidden="true"></span>${finish.title}</button>`).join('')}</div></fieldset>
    <div class="character-delivery"><div class="character-delivery-head"><label for="character-size">PNG 尺寸</label><select id="character-size"><option value="512">512 × 512</option><option value="1024">1024 × 1024</option></select></div>
      <button type="button" id="character-export" disabled>准备 PNG</button><a id="character-download" download hidden>下载 PNG ↓</a>
      <p class="character-status" id="character-export-status" role="status">导出会沿用预览中的背景和构图。</p>
    </div>
  </div>`;
  root.prepend(station);
  station.insertAdjacentHTML('afterend', `<section class="character-kit" aria-labelledby="character-kit-title">
    <div><p class="character-kicker">XIAOJING / READY TO USE</p><h3 id="character-kit-title">小镜角色素材包</h3><p>聊天头像、透明底头像、眨眼待机和点头回应来自同一个角色原图。</p></div>
    <div class="character-kit-actions"><a href="character-media/xiaojing-kit-v2.zip" download>下载完整素材包 ZIP ↓</a><a href="character-media/xiaojing-avatar-512.png" download>聊天头像 PNG ↓</a><a href="character-media/xiaojing-avatar-1024-alpha.png" download>透明头像 PNG ↓</a><a href="../#explore-03" target="_top">试用对话状态 ↗</a></div>
  </section>`);

  const find = selector => station.querySelector(selector);
  const preview = find('#character-portrait');
  const chat = find('#character-chat');
  const input = find('#character-local-input');
  const reset = find('#character-reset');
  const exportButton = find('#character-export');
  const download = find('#character-download');
  const sourceStatus = find('#character-source-status');
  const exportStatus = find('#character-export-status');
  const sizeSelect = find('#character-size');
  const yControl = find('#character-y');
  let frame = 'shoulders';
  let background = 'mist';
  let offsetY = 0;
  let source;
  let request = 0;
  let exportRevision = 0;
  let loading = false;
  let preparing = false;

  function draw(canvas) {
    const context = canvas.getContext('2d');
    const side = canvas.width;
    context.clearRect(0, 0, side, side);
    const finish = finishes[background];
    if (finish.color || finish.colors) {
      if (finish.colors) {
        const gradient = context.createRadialGradient(side * .47, side * .34, side * .035, side * .47, side * .34, side * .72);
        gradient.addColorStop(0, finish.colors[0]);
        gradient.addColorStop(1, finish.colors[1]);
        context.fillStyle = gradient;
      } else {
        context.fillStyle = finish.color;
      }
      context.fillRect(0, 0, side, side);
    }
    if (!source) return;
    const { scale, shift } = framing[frame];
    const cover = Math.max(side / source.naturalWidth, side / source.naturalHeight) * scale;
    const width = source.naturalWidth * cover;
    const height = source.naturalHeight * cover;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, (side - width) / 2, (side - height) / 2 + side * (shift + offsetY / 100), width, height);
  }

  function update() {
    station.dataset.background = background;
    find('#character-y-value').value = `${offsetY > 0 ? '+' : ''}${offsetY}%`;
    draw(preview);
    draw(chat);
  }

  function clearDownload() {
    exportRevision += 1;
    if (download.hasAttribute('href')) URL.revokeObjectURL(download.href);
    download.removeAttribute('href');
    download.hidden = true;
    exportStatus.textContent = '导出会沿用预览中的背景和构图。';
  }

  function readImage(url) {
    const image = new Image();
    image.src = url;
    return image.decode().then(() => image);
  }

  const stockImage = readImage(stockSource);
  async function setSource(file) {
    const currentRequest = ++request;
    const url = file && URL.createObjectURL(file);
    loading = true;
    exportButton.disabled = true;
    sourceStatus.textContent = '正在读取图像…';
    try {
      const image = url ? await readImage(url) : await stockImage;
      if (currentRequest !== request) return;
      source = image;
      reset.hidden = !file;
      find('#character-chat-name').textContent = file ? '本地图像' : '小镜';
      sourceStatus.textContent = file ? '图像仅在当前浏览器内处理。' : '原创小镜 · 透明原图';
      yControl.value = '0';
      offsetY = 0;
      clearDownload();
      update();
    } catch {
      if (currentRequest === request) sourceStatus.textContent = '图像无法读取。可以选择 PNG、JPEG 或 WebP。';
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (currentRequest === request) {
        loading = false;
        exportButton.disabled = !source || preparing;
      }
    }
  }

  for (const [key, setter] of [['frame', value => { frame = value; }], ['background', value => { background = value; }]]) {
    const options = [...station.querySelectorAll(`[data-character-${key}]`)];
    for (const option of options) {
      option.addEventListener('click', () => {
        if (option.getAttribute('aria-pressed') === 'true') return;
        setter(option.getAttribute(`data-character-${key}`));
        for (const button of options) button.setAttribute('aria-pressed', String(button === option));
        clearDownload();
        update();
      });
    }
  }

  yControl.addEventListener('input', () => {
    offsetY = Number(yControl.value);
    clearDownload();
    update();
  });
  sizeSelect.addEventListener('change', clearDownload);
  input.addEventListener('change', () => {
    const [file] = input.files;
    input.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      sourceStatus.textContent = '请选择 20 MB 以内的 PNG、JPEG 或 WebP。';
      return;
    }
    setSource(file);
  });
  reset.addEventListener('click', () => setSource());

  exportButton.addEventListener('click', async () => {
    if (!source || loading || preparing) return;
    clearDownload();
    const revision = exportRevision;
    preparing = true;
    exportButton.disabled = true;
    exportStatus.textContent = '正在编码 PNG…';
    try {
      const size = Number(sizeSelect.value);
      const output = document.createElement('canvas');
      output.width = output.height = size;
      draw(output);
      const blob = await new Promise(resolve => output.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG encoder returned no file');
      if (revision !== exportRevision) return;
      download.href = URL.createObjectURL(blob);
      download.download = `${reset.hidden ? 'xiaojing' : 'avatar'}-${frame}-${background}-${size}.png`;
      download.hidden = false;
      exportStatus.textContent = `已准备 ${size} × ${size} PNG。`;
    } catch {
      if (revision === exportRevision) exportStatus.textContent = 'PNG 导出失败，请重试。';
    } finally {
      preparing = false;
      exportButton.disabled = !source || loading;
    }
  });

  setSource();
}
