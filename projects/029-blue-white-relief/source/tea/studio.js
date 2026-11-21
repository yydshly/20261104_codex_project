(() => {
  'use strict';
  const api = window.BrandTemplate;
  let config = api.copy(window.BRAND_DEFAULTS);
  let ready = false;
  let timer;
  const frame = document.getElementById('brand-preview');
  const errorBox = document.getElementById('studio-error');
  const status = document.getElementById('studio-status');
  const fields = document.getElementById('fields');
  const groupDefinitions = [
    ['品牌与系列', true, [
      ['brand.name', '品牌名称'], ['brand.latin', '英文名称'], ['brand.seal', '印章文字（换行排字）', 'textarea'],
      ['brand.tagline', '品牌短句'], ['campaign.name', '系列名称'], ['campaign.season', '上新主题'],
      ['campaign.subtitle', '系列副标题'], ['campaign.edition', '期号'], ['brand.notice', '页脚说明', 'textarea']
    ]],
    ['首屏主视觉', true, [
      ['copy.heroTop', '标题第一行'], ['copy.heroBottom', '标题第二行'], ['copy.heroLead', '首屏介绍', 'textarea'],
      ['copy.heroPlay', '影像按钮文字'], ['copy.heroLearn', '系列按钮文字'], ['copy.artCaption', '画面注释'],
      ['copy.heroFoot', '首屏底部短句'], ['copy.sealTop', '圆章上行'], ['copy.sealBottom', '圆章下行']
    ]],
    ['配色与访问链接', false, [
      ['theme.paper', '底色', 'color'], ['theme.light', '浅底', 'color'], ['theme.ink', '文字', 'color'],
      ['theme.accent', '强调色', 'color'], ['theme.deep', '深色区', 'color'],
      ['link.label', '商品或咨询按钮文字'], ['link.url', '商品或咨询链接（留空则隐藏）', 'url']
    ]],
    ['系列细节与山水故事', false, [
      ['copy.collectionTop', '系列标题上行'], ['copy.collectionBottom', '系列标题下行'], ['copy.collectionIntro', '系列介绍', 'textarea'], ['copy.collectionSide', '竖排短句'],
      ...[1, 2, 3].flatMap(i => [[`copy.detail${i}Label`, `细节 ${i} 标记`], [`copy.detail${i}Title`, `细节 ${i} 标题`], [`copy.detail${i}Body`, `细节 ${i} 介绍`]]),
      ['copy.storyTop', '山水标题上行'], ['copy.storyBottom', '山水标题下行'], ['copy.storyLead', '山水引言'], ['copy.storyBody', '山水介绍', 'textarea'],
      ['copy.storyNoteLabel', '山水竖排标记'], ['copy.storyNote', '山水旁注', 'textarea'], ['copy.storyPlay', '山水影像按钮文字']
    ]],
    ['茶席场景与结尾', false, [
      ['copy.ritualTitle', '茶席标题', 'textarea'], ['copy.ritualIntro', '茶席介绍', 'textarea'],
      ...[1, 2, 3].flatMap(i => [[`copy.scene${i}Name`, `场景 ${i} 名称`], [`copy.scene${i}Title`, `场景 ${i} 标题`, 'textarea'], [`copy.scene${i}Body`, `场景 ${i} 介绍`, 'textarea'], [`copy.scene${i}Steps`, `场景 ${i} 短句`]]),
      ['copy.poemCaption', '茶席竖排短句'], ['copy.poemText', '茶席大字', 'textarea'], ['copy.closingTitle', '结尾标题'], ['copy.closingIntro', '结尾介绍'],
      ['copy.downloadLabel', '下载按钮文字'], ['copy.closingPlay', '结尾影像按钮'], ['copy.teapotFilmTitle', '茶器大幅影像标题'], ['copy.landscapeFilmTitle', '山水大幅影像标题']
    ]]
  ];
  function makeField([path, label, type = 'text']) {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';
    wrapper.append(document.createTextNode(label));
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    if (type === 'textarea') input.rows = 3;
    input.dataset.field = path;
    input.id = 'field-' + path.replace('.', '-');
    input.value = api.get(config, path);
    input.maxLength = type === 'textarea' ? 1200 : 200;
    wrapper.append(input);
    return wrapper;
  }
  groupDefinitions.forEach(([title, open, definitions]) => {
    const group = document.createElement('details');
    group.className = 'field-group';
    group.open = open;
    const summary = document.createElement('summary');
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'group-body';
    const colors = document.createElement('div');
    colors.className = 'color-grid';
    definitions.forEach(definition => (definition[2] === 'color' ? colors : body).append(makeField(definition)));
    if (colors.childElementCount) body.prepend(colors);
    group.append(summary, body);
    fields.append(group);
  });
  [['product.name', '商品名称'], ['product.spec', '规格'], ['product.price', '价格（包含货币单位）'], ['product.intro', '商品介绍', 'textarea']].forEach(definition => document.getElementById('product-inputs').append(makeField(definition)));
  const uploads = [
    ['media.teapotImage', '茶器主视觉', false], ['media.teapotVideo', '茶器动态', true],
    ['media.landscapeImage', '山水静帧', false], ['media.landscapeVideo', '山水动态', true]
  ];
  uploads.forEach(([path, name, video]) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'upload-field';
    wrapper.textContent = name;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = video ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/webp,image/gif';
    input.dataset.upload = path;
    const state = document.createElement('span');
    state.className = 'asset-state';
    state.dataset.assetState = path;
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'asset-reset';
    reset.textContent = '恢复模板素材';
    reset.addEventListener('click', () => {
      api.put(config, path, api.get(window.BRAND_DEFAULTS, path));
      input.value = '';
      syncFields();
      refresh();
    });
    wrapper.append(input, state, reset);
    document.getElementById('media-inputs').append(wrapper);
  });
  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  }
  function syncFields() {
    document.querySelectorAll('[data-field]').forEach(input => {
      const value = api.get(config, input.dataset.field);
      if (input.type === 'checkbox') input.checked = value;
      else input.value = value;
    });
    document.querySelectorAll('[data-asset-state]').forEach(node => {
      const value = api.get(config, node.dataset.assetState);
      node.textContent = !value ? '未添加' : value.startsWith('data:') ? '已添加本地素材 · 随配置和网页一起导出' : '使用模板已有素材';
    });
  }
  function refresh() {
    const errors = api.validate(config);
    document.getElementById('preview-brand').textContent = `${config.brand.name} · ${config.campaign.name}`;
    if (errors.length) {
      status.textContent = '预览保留上一版：' + errors[0];
      return;
    }
    showError('');
    if (ready) frame.contentWindow.postMessage({ channel: 'brand-template', type: 'apply', config }, '*');
    status.textContent = '修改已预览。请保存配置，或导出一份完整网页。';
  }
  document.getElementById('editor-form').addEventListener('input', event => {
    const input = event.target;
    if (!input.dataset.field) return;
    const previousName = config.brand.name;
    api.put(config, input.dataset.field, input.type === 'checkbox' ? input.checked : input.value);
    if (input.dataset.field === 'brand.name' && config.brand.seal.replace(/\s/g, '') === previousName.replace(/\s/g, '')) {
      config.brand.seal = Array.from(config.brand.name).slice(0, 4).join('\n');
      document.getElementById('field-brand-seal').value = config.brand.seal;
    }
    clearTimeout(timer);
    timer = setTimeout(refresh, 160);
  });
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('文件读取失败，请重新选择。'));
      reader.readAsDataURL(file);
    });
  }
  function checkMedia(data, video) {
    return new Promise((resolve, reject) => {
      const element = video ? document.createElement('video') : new Image();
      const finish = success => {
        clearTimeout(timeout);
        if (video) { element.removeAttribute('src'); element.load(); }
        if (success) resolve(); else reject(new Error('这份素材无法在当前浏览器中读取，请换一份图片或 MP4/WebM 视频。'));
      };
      const timeout = setTimeout(() => finish(false), 12000);
      element.addEventListener(video ? 'loadedmetadata' : 'load', () => finish(true), { once: true });
      element.addEventListener('error', () => finish(false), { once: true });
      if (video) element.preload = 'metadata';
      element.src = data;
    });
  }
  document.querySelectorAll('[data-upload]').forEach(input => input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const video = input.dataset.upload.endsWith('Video');
    if (file.size > (video ? 40 : 20) * 1024 * 1024) { showError(video ? '视频请控制在40MB以内。' : '图片请控制在20MB以内。'); return; }
    status.textContent = '正在读取本地素材…';
    try {
      const data = await readFile(file);
      if (!api.validMedia(data, video)) throw new Error('请使用 PNG、JPEG、WebP、GIF 图片，或 MP4/WebM 视频。');
      await checkMedia(data, video);
      api.put(config, input.dataset.upload, data);
      syncFields();
      refresh();
    } catch (error) { showError(error.message); status.textContent = '素材未替换，已保留之前的内容。'; }
    finally { input.value = ''; }
  }));
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function validConfig() {
    const value = api.normalize(config);
    const errors = api.validate(value);
    if (errors.length) throw new Error(errors.join('\n'));
    return value;
  }
  document.getElementById('save-config').addEventListener('click', () => {
    // A draft may intentionally have an incomplete optional product section.
    download(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json;charset=utf-8' }), `${api.filename(config.brand.name)}-上新配置.json`);
    status.textContent = '配置已导出，可稍后导入继续编辑；替换的本地素材也已包含。';
  });
  document.getElementById('export-page').addEventListener('click', () => {
    try {
      const value = validConfig();
      const html = api.compile(window.BRAND_PAGE_TEMPLATE, value);
      download(new Blob([html], { type: 'text/html;charset=utf-8' }), `${api.filename(value.brand.name)}-${api.filename(value.campaign.name)}.html`);
      showError('');
      status.textContent = '完整网页已导出，图片与视频已内嵌，可直接离线打开。';
    } catch (error) { showError(error.message); }
  });
  const importInput = document.getElementById('config-file');
  document.getElementById('import-config').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('配置文件过大，请使用100MB以内的配置。');
      const imported = api.normalize(JSON.parse(await file.text()));
      // Drafts are importable so that unfinished product information can be completed.
      const structural = api.validate({ ...imported, product: { ...imported.product, enabled: false } });
      if (structural.length) throw new Error(structural.join('\n'));
      config = imported;
      syncFields();
      refresh();
    } catch (error) { showError('未导入，当前内容已保留。' + error.message); }
    finally { importInput.value = ''; }
  });
  document.getElementById('load-preset').addEventListener('click', () => {
    config = api.copy(window.BRAND_PRESETS[document.getElementById('preset-select').value]);
    syncFields();
    refresh();
  });
  function setViewport(phone) {
    document.querySelector('.preview-panel').classList.toggle('phone', phone);
    document.getElementById('desktop-view').setAttribute('aria-pressed', String(!phone));
    document.getElementById('mobile-view').setAttribute('aria-pressed', String(phone));
  }
  document.getElementById('desktop-view').addEventListener('click', () => setViewport(false));
  document.getElementById('mobile-view').addEventListener('click', () => setViewport(true));
  function showPreview(active) {
    document.body.classList.toggle('showing-preview', active);
    document.getElementById('show-editor').setAttribute('aria-pressed', String(!active));
    document.getElementById('show-preview').setAttribute('aria-pressed', String(active));
  }
  document.getElementById('show-editor').addEventListener('click', () => showPreview(false));
  document.getElementById('show-preview').addEventListener('click', () => showPreview(true));
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.channel !== 'brand-template') return;
    if (event.data.type === 'ready') { ready = true; refresh(); }
    if (event.data.type === 'error') showError(event.data.message);
  });
  syncFields();
  frame.srcdoc = api.compile(window.BRAND_PAGE_TEMPLATE, config);
})();
