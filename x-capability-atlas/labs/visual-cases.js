(() => {
  const details = {
    '02': {
      title: '小镜 · 角色头像工作台',
      lead: '同一张参考图做微笑、惊讶和担忧。看完原图对照，再去头像工作台检查小尺寸的辨识度。',
      principle: '表情实验每次都从同一原图编辑，固定构图、镜框、发夹和发型，只改眉眼和嘴角。下方头像台用原图调整裁切和底色；SVG 对照可单独开关身份线索。',
      links: [['表情与动作测试提示词', 'character-media/expression-test-prompts.txt'], ['小镜生成提示词', 'character-media/prompt.txt'], ['Oogie 原帖', 'https://x.com/oggii_0/status/2118216706459914578'], ['Images 2.5 官方说明', 'https://openai.com/index/introducing-chatgpt-images-2-5/']],
      setup: avatarLab,
    },
    '03': {
      title: '小镜 · 对话状态',
      lead: '在同一画幅里看眨眼、点头、逐帧变化和循环首尾。下方可看现有版本放进聊天界面的效果。',
      principle: '三种做法共用第 02 条原图。现有版局部形变，首尾帧完全一致。分镜版把模型绘制的六格裁开并编码。原生版是从 ChatGPT Images 播放器下载的文件，两支各有 12 帧，首尾都存在像素差异。',
      links: [['表情与动作复测记录', 'character-media/expression-test-prompts.txt'], ['原动作样片', 'https://x.com/songguoxiansen/status/2118177108573016517'], ['ChatGPT GIF 功能', 'https://help.openai.com/en/articles/11084440-images-in-chatgpt#create-and-edit-a-gif'], ['GIF 输出文档', 'https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output']],
      setup: motionLab,
    },
    '04': {
      title: '温室巡检 · 运镜工作台',
      lead: '在同一时间点切换 16 秒宣传片的横竖版，再拆开五个镜头看构图与节奏。',
      principle: '两版共用 Blender 场景、剪辑点和配乐，分别渲染各自的机位与构图。对照「空间建立」，横屏交代两侧种植区，竖屏用通道纵深带出巡检路线。再跳到「传感器推近」，比较竖屏里车身的占比。单镜头区可以看各画幅的原片和对应分镜。',
      links: [['Flow 官方镜头指南', 'https://blog.google/innovation-and-ai/products/flow-video-tips/'], ['五种镜头示例', 'https://x.com/FlowbyGoogle/status/2118082696119541769']],
      setup: cameraLab,
    },
    '05': {
      title: '叶片气孔 · 课件制作台',
      lead: '先用离线课堂观察三种开合状态，再在制作台调整孔径、机位和帧号，导出讲解帧。',
      principle: '制作工具各自控制交付的一层。本页用原生 SVG 与 JavaScript 演示分工。场景预览接收交互输入，讲解帧用固定帧号算状态，资产编辑改共享参数，设计规则和过渡效果作用于界面。导出按钮保存右侧显示的讲解帧，保留帧号、时间和示意孔径。',
      links: [['R3F 渲染循环', 'https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts'], ['Remotion 帧号接口', 'https://www.remotion.dev/docs/use-current-frame'], ['Blender MCP 组件', 'https://github.com/ahujasid/mcp-for-blender#components']],
      setup: productionLab,
    },
  };
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const requested = new URLSearchParams(location.search).get('case') || '';
  const id = Object.hasOwn(details, requested) ? requested : '02';
  const current = details[id];
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smooth = amount => amount * amount * (3 - 2 * amount);
  let portraitSerial = 0;

  $('#case-number').textContent = `${id} / 本地探索 · 视觉制作`;
  $('#title').textContent = current.title;
  $('#lead').textContent = current.lead;
  $('#back').href = `../#case-${id}`;
  $('#principle-text').textContent = current.principle;
  for (const [label, url] of current.links) $('#source-links').append(sourceLink(label, url));
  document.title = `${current.title} · 能力图鉴`;
  current.setup();
  window.mountXiaojingReview?.($('#experiment'), id);

  function sourceLink(label, url) {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = `${label} ↗`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function portrait({ hair = true, glasses = true, clip = true, crop = false, warm = false, tilt = 0, blink = 1 } = {}) {
    const key = `p${++portraitSerial}`;
    const view = crop ? '38 25 184 184' : '0 0 260 260';
    const hairShape = hair
      ? 'M67 125C50 101 55 59 77 39c24-25 78-27 105-5 27 21 29 57 12 95l-10-5-7-39c-23-2-44-14-51-28-8 25-32 41-49 50l-3 22Z'
      : 'M65 119C49 84 61 44 97 28c39-17 76-7 96 20 16 20 19 43 5 72l-13-18-9-19-18 9-28-17-29 17-20-8-9 29Z';
    const eyeHeight = Math.max(.8, 7 * blink);
    const lighting = warm ? ['#ffe1b9', '#c06c71', '#693d64'] : ['#e5e0ff', '#8b80c2', '#34456b'];
    return `<svg viewBox="${view}" role="img" aria-label="自绘角色小镜">
      <defs>
        <radialGradient id="${key}bg" cx=".35" cy=".29" r=".78"><stop stop-color="${lighting[0]}"/><stop offset=".58" stop-color="${lighting[1]}"/><stop offset="1" stop-color="${lighting[2]}"/></radialGradient>
        <radialGradient id="${key}skin" cx=".39" cy=".3" r=".76"><stop stop-color="#fff0cf"/><stop offset=".68" stop-color="#efae8b"/><stop offset="1" stop-color="#cb786f"/></radialGradient>
        <linearGradient id="${key}hair" x2=".74" y2="1"><stop stop-color="${hair ? '#3e777d' : '#b47777'}"/><stop offset=".46" stop-color="${hair ? '#264f62' : '#775064'}"/><stop offset="1" stop-color="#222c49"/></linearGradient>
        <linearGradient id="${key}coat" x2=".45" y2="1"><stop stop-color="#527b82"/><stop offset="1" stop-color="#192f48"/></linearGradient>
        <radialGradient id="${key}blush"><stop stop-color="#dd7f7b" stop-opacity=".72"/><stop offset="1" stop-color="#dd7f7b" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="260" height="260" fill="url(#${key}bg)"/>
      <g fill="none" stroke="#fff8ee"><circle cx="130" cy="115" r="89" opacity=".27"/><circle cx="130" cy="115" r="99" opacity=".13"/><path d="M15 174C79 212 159 60 251 70" opacity=".18"/><path d="M23 194C113 229 182 76 260 93" opacity=".11"/></g>
      <g fill="#fff5df"><circle cx="50" cy="56" r="2.1" opacity=".66"/><circle cx="212" cy="71" r="2.5" opacity=".86"/><circle cx="203" cy="179" r="1.5" opacity=".54"/><path d="M28 113l3-7 2 7 7 2-7 2-2 7-3-7-6-2ZM221 130l2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" opacity=".44"/></g>
      <ellipse cx="132" cy="251" rx="94" ry="16" fill="#22233f" opacity=".42"/>
      <path d="M36 260c3-29 17-49 44-60l30-12h39l30 12c27 11 41 31 45 60Z" fill="url(#${key}coat)"/>
      <path d="M111 177h37v24c-8 10-25 10-37 0Z" fill="#cb8474"/><path d="M106 193q22 18 48 0l4 10-29 29-28-27Z" fill="#d9ddc6"/>
      <path d="m82 205 24-13 23 40-34-11 1 21m82-37-24-13-25 40 34-11-1 21m-98-8-5 26m139-26 5 26" fill="none" stroke="#81a4a6" stroke-opacity=".52" stroke-width="1.5"/>
      <g transform="rotate(${tilt} 130 156) translate(0 ${Math.abs(tilt) / 3})">
        <path d="M62 122C51 92 60 53 86 39c25-19 67-23 94 0 29 22 33 59 23 102-3 22-19 42-35 46l-24-10-43 5c-24-5-38-30-39-60Z" fill="#26374d"/>
        <path d="M73 112c-17-9-20 9-12 23 4 7 10 10 17 7m108-30c17-9 20 9 12 23-4 7-10 10-17 7" fill="#d28b7c" stroke="#ad6768" stroke-width="1.2"/>
        <path d="M77 90c7-29 24-43 52-43s50 15 55 43l3 38c-4 34-23 55-45 63q-12 5-24 0c-22-8-42-29-45-63Z" fill="url(#${key}skin)"/>
        <path d="${hairShape}" fill="url(#${key}hair)"/>
        <path d="M66 93c5-38 29-61 68-62m-53 61c16-9 33-25 43-43m20-13c22 4 38 19 47 38" fill="none" stroke="#e0f9eb" stroke-opacity=".21" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M97 109q10-6 21-1m24 0q11-5 21 1" fill="none" stroke="#695052" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="106" cy="126" rx="5" ry="${eyeHeight}" fill="#35273d"/><ellipse cx="154" cy="126" rx="5" ry="${eyeHeight}" fill="#35273d"/>
        ${blink > .42 ? '<path d="M104 124h1m47 0h1" stroke="#fff9ee" stroke-width="2" stroke-linecap="round"/>' : ''}
        <ellipse cx="92" cy="145" rx="15" ry="9" fill="url(#${key}blush)"/><ellipse cx="168" cy="145" rx="15" ry="9" fill="url(#${key}blush)"/>
        <path d="M130 127q-1 11-5 17 4 4 10 0m-18 14q13 8 26-1" fill="none" stroke="#a85e67" stroke-width="1.9" stroke-linecap="round"/>
        ${glasses ? '<g stroke="#583e75" stroke-width="3" stroke-linecap="round"><rect x="88" y="114" width="34" height="25" rx="8" fill="#e0d0ff" fill-opacity=".17"/><rect x="138" y="114" width="34" height="25" rx="8" fill="#e0d0ff" fill-opacity=".17"/><path d="M122 123q8-5 16 0m-51-3-11-3m97 3 11-3" fill="none"/></g><path d="m93 121 5-3m45 3 5-3" stroke="#fff0f9" stroke-opacity=".73" stroke-width="1.3" stroke-linecap="round"/>' : ''}
        ${clip ? '<path d="M160 77l19 8m-22-1 19 8" stroke="#b7615d" stroke-width="5" stroke-linecap="round"/><path d="M160 76l19 8m-22-1 19 8" stroke="#ffbe7b" stroke-width="3.4" stroke-linecap="round"/>' : ''}
      </g></svg>`;
  }

  async function paintPortrait(context, markup, size) {
    const svg = markup.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" `);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      context.clearRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function clearStudioFile(link) {
    if (link.hasAttribute('href')) URL.revokeObjectURL(link.href);
    link.removeAttribute('href');
    link.hidden = true;
  }

  function publishStudioFile(link, file, name, label) {
    clearStudioFile(link);
    const url = URL.createObjectURL(file);
    link.href = url;
    link.download = name;
    link.textContent = label;
    link.hidden = false;
    return url;
  }

  function canvasPng(canvas) {
    return new Promise((resolve, reject) => canvas.toBlob(file => {
      if (file) resolve(file);
      else reject(new Error('Canvas PNG encoding failed'));
    }, 'image/png'));
  }

  function gifPalette(frames) {
    const colorKey = (r, g, b) => ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bins = new Map();
    for (const frame of frames) {
      for (let i = 0; i < frame.length; i += 4) {
        const r = frame[i];
        const g = frame[i + 1];
        const b = frame[i + 2];
        const key = colorKey(r, g, b);
        const entry = bins.get(key);
        if (entry) {
          entry[0]++;
          entry[1] += r;
          entry[2] += g;
          entry[3] += b;
        } else bins.set(key, [1, r, g, b]);
      }
    }
    const sorted = [...bins].sort((left, right) => right[1][0] - left[1][0]);
    const average = ([count, r, g, b]) => [r, g, b].map(value => Math.round(value / count));
    const colors = sorted.slice(0, 256).map(([, entry]) => average(entry));
    const indices = new Uint8Array(32768);
    sorted.forEach(([key, entry], position) => {
      if (position < colors.length) {
        indices[key] = position;
        return;
      }
      const rgb = average(entry);
      let closest = Infinity;
      colors.forEach((candidate, index) => {
        const distance = (rgb[0] - candidate[0]) ** 2 + (rgb[1] - candidate[1]) ** 2 + (rgb[2] - candidate[2]) ** 2;
        if (distance < closest) {
          indices[key] = index;
          closest = distance;
        }
      });
    });
    const table = new Uint8Array(256 * 3);
    colors.forEach((color, index) => table.set(color, index * 3));
    return { table, lookup: (r, g, b) => indices[colorKey(r, g, b)] };
  }

  function encodeMotionGif(frames, size, delayMs) {
    const { table, lookup } = gifPalette(frames);
    const bytes = [...new TextEncoder().encode('GIF89a')];
    const word = value => bytes.push(value & 255, value >> 8);
    word(size);
    word(size);
    bytes.push(0xf7, 0, 0, ...table);
    bytes.push(0x21, 0xff, 11, ...new TextEncoder().encode('NETSCAPE2.0'), 3, 1, 0, 0, 0);
    for (const frame of frames) {
      bytes.push(0x21, 0xf9, 4, 4);
      word(Math.round(delayMs / 10));
      bytes.push(0, 0, 0x2c, 0, 0, 0, 0);
      word(size);
      word(size);
      bytes.push(0, 8);
      const data = [];
      let bits = 0;
      let bitCount = 0;
      const code = value => {
        bits |= value << bitCount;
        bitCount += 9;
        while (bitCount >= 8) {
          data.push(bits & 255);
          bits >>>= 8;
          bitCount -= 8;
        }
      };
      // Reset the GIF dictionary before its codes need a tenth bit.
      for (let pixel = 0; pixel < frame.length / 4; pixel++) {
        if (pixel % 250 === 0) code(256);
        const i = pixel * 4;
        code(lookup(frame[i], frame[i + 1], frame[i + 2]));
      }
      code(257);
      if (bitCount) data.push(bits);
      for (let offset = 0; offset < data.length; offset += 255) {
        const block = data.slice(offset, offset + 255);
        bytes.push(block.length, ...block);
      }
      bytes.push(0);
    }
    bytes.push(0x3b);
    return new Blob([Uint8Array.from(bytes)], { type: 'image/gif' });
  }

  function avatarLab() {
    $('#experiment').innerHTML = `<div class="visual-shell" data-case="02"><details class="character-study"><summary>拆开看 · 角色识别线索</summary><section class="workspace studio-grid" aria-label="角色识别线索对照">
      <div class="pane studio-stage">
        <div class="studio-head"><div><p class="studio-kicker">角色资产 / XIAOJING</p><h2>头像对照</h2></div><span class="studio-chip">1∶1 方形</span></div>
        <div class="comparison"><figure class="portrait"><div id="avatar-before"></div><figcaption><strong>身份参考</strong><span>冷色 · 头肩</span></figcaption></figure><figure class="portrait"><div id="avatar-after"></div><figcaption><strong>当前版本</strong><span id="avatar-style"></span></figcaption></figure></div>
        <div class="studio-context"><div><p class="studio-kicker">聊天场景</p><h3>42 px 实际使用尺寸</h3></div><div class="studio-chat" aria-label="原始与当前头像的聊天界面预览"><div><span id="avatar-small-before"></span><span>参考头像</span></div><div><span id="avatar-small-after"></span><span>小镜<span class="studio-chat-text">我在听，继续说吧。</span></span></div></div></div>
      </div>
      <div class="pane studio-inspector">
        <div class="studio-head"><div><p class="studio-kicker">规格与识别</p><h2>头像设置</h2></div><span class="studio-chip" id="avatar-status" role="status"></span></div>
        <fieldset class="group"><legend>使用场景</legend><div class="studio-segments"><button type="button" data-avatar-preset="chat">聊天近景</button><button type="button" data-avatar-preset="profile">个人页头肩</button></div></fieldset>
        <fieldset class="group studio-options"><legend>画面规格</legend>
          <label><input id="avatar-warm" type="checkbox" checked><span>暖色背景<small>关闭可切换冷色</small></span></label>
          <label><input id="avatar-crop" type="checkbox" checked><span>脸部近景<small>关闭可查看头肩构图</small></span></label>
        </fieldset>
        <fieldset class="group studio-options"><legend>角色线索</legend>
          <label><input id="avatar-hair" type="checkbox" checked><span>青色斜刘海</span></label>
          <label><input id="avatar-glasses" type="checkbox" checked><span>紫色方框眼镜</span></label>
          <label><input id="avatar-clip" type="checkbox" checked><span>橙色双发夹</span></label>
        </fieldset>
        <div class="studio-export"><div class="studio-export-title"><h3>交付头像</h3><label for="avatar-size" class="studio-format-label">分辨率</label><select id="avatar-size"><option value="512">512 × 512</option><option value="1024">1024 × 1024</option></select></div><div class="group-buttons"><button id="avatar-export" class="primary" type="button">生成 PNG</button><button id="avatar-reset" type="button">恢复线索</button><a id="avatar-download" class="studio-file" hidden></a></div><p class="hint" id="avatar-export-status" role="status">生成后可下载对应当前构图的头像。</p></div>
      </div>
    </section></details></div>`;
    mountCharacterStation($('#experiment .visual-shell'));
    $('#avatar-before').innerHTML = portrait();
    $('#avatar-small-before').innerHTML = portrait();
    const options = ['warm', 'crop', 'hair', 'glasses', 'clip'];
    const outputSize = $('#avatar-size');
    const exportButton = $('#avatar-export');
    const exportStatus = $('#avatar-export-status');
    const download = $('#avatar-download');
    let revision = 0;
    function invalidate() {
      revision++;
      clearStudioFile(download);
      exportStatus.textContent = '生成后可下载对应当前构图的头像。';
    }
    function draw() {
      const selected = Object.fromEntries(options.map(option => [option, $(`#avatar-${option}`).checked]));
      $('#avatar-after').innerHTML = portrait(selected);
      $('#avatar-small-after').innerHTML = portrait(selected);
      $('#avatar-style').textContent = `${selected.warm ? '暖色' : '冷色'} · ${selected.crop ? '近景' : '头肩'}`;
      const count = ['hair', 'glasses', 'clip'].filter(option => selected[option]).length;
      $('#avatar-status').textContent = `${count} / 3 线索`;
      for (const button of all('[data-avatar-preset]')) {
        const chat = button.dataset.avatarPreset === 'chat';
        button.setAttribute('aria-pressed', String(selected.warm === chat && selected.crop === chat));
      }
      invalidate();
    }
    for (const option of options) $(`#avatar-${option}`).addEventListener('change', draw);
    outputSize.addEventListener('change', invalidate);
    for (const button of all('[data-avatar-preset]')) button.addEventListener('click', () => {
      $('#avatar-warm').checked = $('#avatar-crop').checked = button.dataset.avatarPreset === 'chat';
      draw();
    });
    $('#avatar-reset').addEventListener('click', () => {
      for (const option of options.slice(2)) $(`#avatar-${option}`).checked = true;
      draw();
    });
    exportButton.addEventListener('click', async () => {
      const size = Number(outputSize.value);
      const snapshot = revision;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      exportButton.disabled = true;
      exportStatus.textContent = `正在生成 ${size} × ${size} PNG。`;
      try {
        await paintPortrait(canvas.getContext('2d'), $('#avatar-after').innerHTML, size);
        const file = await canvasPng(canvas);
        if (revision !== snapshot) return;
        publishStudioFile(download, file, `xiaojing-avatar-${size}.png`, '下载头像 PNG');
        exportStatus.textContent = `${size} × ${size} · ${Math.ceil(file.size / 1024)} KB · PNG`;
      } catch {
        if (revision === snapshot) exportStatus.textContent = '生成 PNG 失败，请重试。';
      } finally {
        exportButton.disabled = false;
      }
    });
    draw();
  }

  function motionLab() {
    const clips = {
      idle: { title: '小镜在等你', label: '待机 · 眨眼', copy: '小镜保持自然视线，眨眼后回到原来的姿态。发夹、眼镜和衣领的位置稳定。', duration: '4.00', cues: [[0, '睁眼'], [1.334, '闭眼'], [1.67, '恢复']] },
      nod: { title: '小镜在听', label: '回应 · 点头', copy: '她短暂停一下，轻轻点头，再回到开始的姿态。衣领和肩线稳定，眼镜和发夹随头部移动。', duration: '2.50', cues: [[0, '倾听'], [.92, '点头'], [2.20, '回稳']] },
    };
    $('#experiment').innerHTML = `<div class="visual-shell" data-case="03"><section class="character-loop" aria-labelledby="character-loop-title">
      <div class="character-loop-monitor"><video id="character-loop-video" src="character-media/xiaojing-nod.mp4" poster="character-media/xiaojing-nod.jpg" controls loop playsinline muted preload="metadata" aria-label="小镜在听 · 点头动作成片"></video></div>
      <div class="character-loop-copy"><p class="studio-kicker">成片 / XIAOJING COMPANION</p><h2 id="character-loop-title"></h2><p id="character-loop-description"></p>
        <div class="character-state-buttons" role="group" aria-label="选择对话状态">${Object.entries(clips).map(([id, clip]) => `<button type="button" data-character-clip="${id}" aria-pressed="${id === 'nod'}">${clip.label}</button>`).join('')}</div>
        <div class="character-loop-chapters" id="character-loop-chapters" role="group" aria-label="检查三个关键姿态"></div>
        <div class="character-state-demo"><button type="button" id="character-reply">播放一次回应，再回到待机</button><p id="character-state-status" role="status">可切换成片或定位关键姿态。</p></div>
        <div class="group-buttons"><a class="studio-file" id="character-clip-gif" download>下载 360 px GIF ↓</a><a class="studio-file" id="character-clip-mp4" download>下载 600 px MP4 ↓</a><a class="studio-file" href="character-media/xiaojing-kit-v2.zip" download>下载完整角色包 ZIP ↓</a></div><p class="character-loop-meta" id="character-loop-meta"></p>
        <a class="character-loop-source" href="../#explore-02" target="_top">制作同一角色的头像 ↗</a></div>
    </section><details class="character-study"><summary>拆开看 · 帧数与循环接缝</summary><section class="workspace studio-grid" aria-label="循环编辑器">
      <div class="pane studio-stage">
        <div class="studio-head"><div><p class="studio-kicker">状态动效 / XIAOJING</p><h2>动作预览</h2></div><span class="studio-chip" id="motion-index"></span></div>
        <div class="studio-motion-stage"><div class="motion-hero" id="motion-character" aria-label="当前帧"></div><div class="studio-motion-label"><strong>我在听</strong><span>伴偶对话状态</span></div></div>
        <div class="studio-transport"><button id="motion-play" class="primary" type="button">播放循环</button><button id="motion-step" type="button">下一帧</button><label class="studio-sr" for="motion-seek">定位帧</label><input id="motion-seek" type="range" min="0" value="0"></div>
        <div class="studio-filmstrip" id="motion-filmstrip" aria-label="关键采样帧"></div>
      </div>
      <div class="pane studio-inspector">
        <div class="studio-head"><div><p class="studio-kicker">时间与接缝</p><h2>动作设置</h2></div><span class="studio-chip" id="motion-duration"></span></div>
        <fieldset class="group"><legend>播放预设</legend><div class="studio-segments"><button type="button" data-motion-preset="soft">自然点头</button><button type="button" data-motion-preset="quick">快速回应</button><button type="button" data-motion-preset="seam">查看接缝</button></div></fieldset>
        <label class="range-label" for="motion-frames">帧数 <output id="motion-frames-value"></output></label><input id="motion-frames" type="range" min="6" max="24" value="12">
        <label class="range-label" for="motion-hold">每帧时长 <output id="motion-hold-value"></output></label><input id="motion-hold" type="range" min="40" max="250" step="10" value="100">
        <fieldset class="group studio-options"><legend>循环收尾</legend><label><input id="motion-closed" type="checkbox" checked><span>末帧回到初始姿态</span></label></fieldset>
        <div class="studio-seam"><figure class="endpoint"><div id="motion-end"></div><figcaption>末帧</figcaption></figure><span aria-hidden="true">↻</span><figure class="endpoint"><div id="motion-start"></div><figcaption>首帧</figcaption></figure><p class="status" id="motion-status" role="status"></p></div>
        <div class="studio-export"><div class="studio-export-title"><h3>交付动图</h3><span class="studio-chip">192 px · GIF</span></div><div class="group-buttons"><button id="motion-export" class="primary" type="button">生成循环 GIF</button><a id="motion-download" class="studio-file" hidden></a></div><p class="hint" id="motion-export-status" role="status">按当前帧数与时长生成。</p><details id="motion-encoded-result" hidden><summary>播放编码后的文件</summary><img id="motion-encoded" alt="编码后的小镜点头循环" width="112" height="112"></details></div>
      </div>
    </section></details></div>`;
    const preview = $('#character-loop-video');
    const stateButtons = all('[data-character-clip]');
    const chapters = $('#character-loop-chapters');
    const stateStatus = $('#character-state-status');
    let currentClip = 'nod';
    let playbackRevision = 0;
    let replyInProgress = false;

    function showClip(id) {
      const clip = clips[id];
      if (currentClip !== id) {
        currentClip = id;
        preview.src = `character-media/xiaojing-${id}.mp4`;
      }
      $('#character-loop-title').textContent = clip.title;
      $('#character-loop-description').textContent = clip.copy;
      $('#character-loop-meta').textContent = `${clip.duration} 秒 · 方形 · 无声`;
      preview.setAttribute('aria-label', `${clip.title} · ${clip.label}成片`);
      for (const button of stateButtons) button.setAttribute('aria-pressed', String(button.dataset.characterClip === id));
      for (const format of ['gif', 'mp4']) $(`#character-clip-${format}`).href = `character-media/xiaojing-${id}.${format}`;
      chapters.innerHTML = clip.cues.map(([time, title]) => `<button type="button" data-character-seek="${time}"><span>${time.toFixed(2).padStart(5, '0')} s</span>${title}</button>`).join('');
    }

    function cancelReply() {
      playbackRevision++;
      replyInProgress = false;
      preview.loop = true;
      stateStatus.textContent = '可切换成片或定位关键姿态。';
    }

    function playState(message) {
      const revision = ++playbackRevision;
      stateStatus.textContent = message;
      preview.play().catch(() => {
        if (playbackRevision !== revision) return;
        cancelReply();
        stateStatus.textContent = '暂时无法自动播放，可使用视频上的播放按钮。';
      });
    }

    for (const button of stateButtons) button.addEventListener('click', () => {
      const wasPlaying = !preview.paused;
      cancelReply();
      showClip(button.dataset.characterClip);
      if (wasPlaying) playState(`正在循环播放${clips[currentClip].label}。`);
    });
    chapters.addEventListener('click', event => {
      const cue = event.target.closest('[data-character-seek]');
      if (!cue) return;
      cancelReply();
      preview.pause();
      preview.currentTime = Number(cue.dataset.characterSeek);
    });
    $('#character-reply').addEventListener('click', () => {
      showClip('nod');
      replyInProgress = true;
      preview.loop = false;
      preview.currentTime = 0;
      playState('正在播放点头回应，随后进入待机。');
    });
    preview.addEventListener('ended', () => {
      if (!replyInProgress) return;
      replyInProgress = false;
      preview.loop = true;
      showClip('idle');
      playState('点头结束，已回到眨眼待机。');
    });
    showClip('nod');
    const count = $('#motion-frames');
    const hold = $('#motion-hold');
    const closed = $('#motion-closed');
    const seek = $('#motion-seek');
    const play = $('#motion-play');
    const strip = $('#motion-filmstrip');
    const exportButton = $('#motion-export');
    const exportStatus = $('#motion-export-status');
    const download = $('#motion-download');
    const encodedResult = $('#motion-encoded-result');
    const encoded = $('#motion-encoded');
    const presets = { soft: [12, 100, true], quick: [10, 60, true], seam: [12, 100, false] };
    let revision = 0;
    let timer = 0;
    let frame = 0;
    let lastTick = 0;
    function pose(index) {
      const progress = index / (Number(count.value) - 1);
      const tilt = 10 * Math.sin(Math.PI * progress) + (closed.checked ? 0 : 14 * progress);
      const blink = 1 - .95 * Math.exp(-((progress - .54) ** 2) / .01);
      return { tilt, blink };
    }
    function drawFrame() {
      $('#motion-character').innerHTML = portrait({ crop: true, ...pose(frame) });
      seek.value = frame;
      $('#motion-index').textContent = `帧 ${frame + 1} / ${count.value}`;
      for (const thumb of strip.children) thumb.setAttribute('aria-current', String(Number(thumb.dataset.frame) === frame));
    }
    function update() {
      revision++;
      encoded.removeAttribute('src');
      encodedResult.hidden = true;
      encodedResult.open = false;
      clearStudioFile(download);
      exportStatus.textContent = '按当前帧数与时长生成。';
      const last = Number(count.value) - 1;
      frame = clamp(frame, 0, last);
      seek.max = last;
      $('#motion-frames-value').textContent = count.value;
      $('#motion-hold-value').textContent = `${hold.value} ms`;
      $('#motion-duration').textContent = `${(Number(count.value) * Number(hold.value) / 1000).toFixed(2)} 秒`;
      $('#motion-start').innerHTML = portrait({ crop: true, ...pose(0) });
      $('#motion-end').innerHTML = portrait({ crop: true, ...pose(last) });
      const seam = Math.round(Math.abs(pose(last).tilt - pose(0).tilt));
      $('#motion-status').textContent = seam ? `首尾相差 ${seam}° · 回放有跳变` : '首尾角度对齐 · 0°';
      $('#motion-status').dataset.warning = String(seam > 0);
      strip.replaceChildren();
      const samples = Math.min(Number(count.value), 6);
      for (let sample = 0; sample < samples; sample++) {
        const index = Math.round(sample * last / (samples - 1));
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.dataset.frame = index;
        thumb.innerHTML = `${portrait({ crop: true, ...pose(index) })}<span>帧 ${index + 1}</span>`;
        thumb.addEventListener('click', () => { stop(); frame = index; drawFrame(); });
        strip.append(thumb);
      }
      for (const button of all('[data-motion-preset]')) {
        const [frames, delay, smoothEnd] = presets[button.dataset.motionPreset];
        button.setAttribute('aria-pressed', String(Number(count.value) === frames && Number(hold.value) === delay && closed.checked === smoothEnd));
      }
      drawFrame();
    }
    function stop() {
      cancelAnimationFrame(timer);
      timer = 0;
      play.textContent = '播放循环';
    }
    function tick(time) {
      if (time - lastTick >= Number(hold.value)) {
        const framesPassed = Math.floor((time - lastTick) / Number(hold.value));
        frame = (frame + framesPassed) % Number(count.value);
        lastTick += framesPassed * Number(hold.value);
        drawFrame();
      }
      timer = requestAnimationFrame(tick);
    }
    play.addEventListener('click', () => {
      if (timer) return stop();
      lastTick = performance.now();
      timer = requestAnimationFrame(tick);
      play.textContent = '暂停循环';
    });
    $('#motion-step').addEventListener('click', () => {
      stop();
      frame = (frame + 1) % Number(count.value);
      drawFrame();
    });
    seek.addEventListener('input', () => { stop(); frame = Number(seek.value); drawFrame(); });
    for (const control of [count, hold, closed]) control.addEventListener('input', () => { stop(); update(); });
    for (const button of all('[data-motion-preset]')) button.addEventListener('click', () => {
      stop();
      [count.value, hold.value, closed.checked] = presets[button.dataset.motionPreset];
      frame = 0;
      update();
    });
    exportButton.addEventListener('click', async () => {
      const size = 192;
      const delay = Number(hold.value);
      const snapshot = revision;
      const markups = Array.from({ length: Number(count.value) }, (_, index) => portrait({ crop: true, ...pose(index) }));
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      exportButton.disabled = true;
      exportStatus.textContent = '正在把当前设置编码为 GIF。';
      try {
        const frames = [];
        for (const markup of markups) {
          await paintPortrait(context, markup, size);
          frames.push(context.getImageData(0, 0, size, size).data);
        }
        if (revision !== snapshot) return;
        const file = encodeMotionGif(frames, size, delay);
        encoded.src = publishStudioFile(download, file, 'xiaojing-loop.gif', '下载循环 GIF');
        encodedResult.hidden = false;
        exportStatus.textContent = `${frames.length} 帧 × ${delay} ms · ${Math.ceil(file.size / 1024)} KB`;
      } catch {
        if (revision === snapshot) exportStatus.textContent = '生成 GIF 失败，请重试。';
      } finally {
        exportButton.disabled = false;
      }
    });
    update();
  }

  function cameraLab() {
    mountCameraStudio($('#experiment'));
  }

  function productionLab() {
    const library = [
      ['design', 'UI UX Pro Max', '切换配色方案', '给同一个教学卡一组统一色彩和边框规则。', 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill'],
      ['audit', 'Impeccable', '修正文字对比', '先读前景和背景对比值，再修正难读的小字。', 'https://github.com/pbakaus/impeccable'],
      ['layout', 'Frontend Design', '把问题放到首位', '为课堂用途改信息顺序，先提出问题，再展示测量值。', 'https://github.com/anthropics/skills/tree/main/skills/frontend-design'],
      ['motion', 'Motion', '比较过渡与跳变', '用同一个开合目标对照平滑过渡和即时跳变。', 'https://motion.dev/docs/react-motion-component'],
      ['fiber', 'R3F', '旋转交互视角', '改变浏览器机位，立刻重画左边的教学视图。', 'https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts'],
      ['remotion', 'Remotion', '切换讲解帧', '固定每秒 24 帧，帧号决定右边的开合进度。', 'https://www.remotion.dev/docs/use-current-frame'],
      ['blender', 'Blender MCP', '修改共享孔径', '把资产编辑拆成可读参数，修改一次，让两侧都重新计算。', 'https://github.com/ahujasid/mcp-for-blender#components'],
    ];
    $('#experiment').innerHTML = `<div class="visual-shell" data-case="05"><section class="pane studio-lesson-sheet" aria-labelledby="lesson-sheet-title">
      <div class="studio-head"><div><p class="studio-kicker">成品 / CLASSROOM CARD</p><h2 id="lesson-sheet-title">气孔开合观察卡</h2></div><span class="studio-chip">16:9 · 1600 × 900</span></div>
      <a href="leaf-lesson-sheet.png" target="_blank" rel="noopener" aria-label="放大查看气孔开合观察卡"><img src="leaf-lesson-sheet.png" width="1600" height="900" alt="在同一示意比例下并排比较气孔闭合、开始开启、进一步开启的孔隙宽度"></a>
      <div class="studio-lesson-actions"><p>离线课堂沿用这三幅图。先在图上选择，再揭晓孔隙位置。</p><div class="group-buttons"><a class="studio-file" href="stoma-3d/viewer/">打开 3D 课件 ↗</a><a class="studio-file" href="leaf-classroom.html" target="_blank" rel="noopener">打开互动课堂 ↗</a><a class="studio-file" href="leaf-classroom.html" download>下载离线 HTML ↓</a><a class="studio-file" href="leaf-lesson-sheet.png" download>下载投影 PNG ↓</a><a class="studio-file" href="leaf-lesson-sheet.svg" download>下载可编辑 SVG ↓</a></div></div>
    </section><section class="workspace studio-grid" aria-label="气孔课件制作台">
      <div class="pane studio-stage">
        <div class="studio-head"><div><p class="studio-kicker">标本 01 / LEAF STOMA</p><h2>显微观察台</h2></div><span class="studio-chip">共享模型</span></div>
        <div class="scene-grid"><figure class="scene"><div class="studio-scene-head"><strong>学生探究</strong><span>实时</span></div><div id="production-live"></div><figcaption id="production-live-label"></figcaption></figure><figure class="scene"><div class="studio-scene-head"><strong>投影讲解</strong><span>定帧</span></div><div id="production-frame"></div><figcaption id="production-frame-label"></figcaption></figure></div>
        <div class="mini-card" id="production-card" data-style="lab" data-contrast="weak"><p class="studio-kicker">课堂提问卡</p><strong id="production-card-title"></strong><p id="production-card-copy"></p><p id="production-contrast"></p></div>
      </div>
      <div class="pane studio-inspector">
        <div class="studio-head"><div><p class="studio-kicker">资产与帧</p><h2>课件设置</h2></div><span class="studio-chip">24 fps</span></div>
        <label class="range-label" for="production-max">共享孔径上限 <output id="production-max-value"></output></label><input id="production-max" type="range" min="15" max="58" value="50">
        <label class="range-label" for="production-open">交互开合 <output id="production-open-value"></output></label><input id="production-open" type="range" min="0" max="100" value="60">
        <label class="range-label" for="production-angle">交互机位 <output id="production-angle-value"></output></label><input id="production-angle" type="range" min="-30" max="30" value="0">
        <label class="range-label" for="production-index">讲解帧号 <output id="production-index-value"></output></label><input id="production-index" type="range" min="0" max="48" value="24">
        <div class="studio-segments studio-keyframes" aria-label="讲解关键帧"><button type="button" data-production-frame="0">闭合</button><button type="button" data-production-frame="12">开启中</button><button type="button" data-production-frame="24">最大开合</button><button type="button" data-production-frame="48">回到闭合</button></div>
        <div class="studio-export"><div class="studio-export-title"><h3>交付课件</h3><span class="studio-chip">SVG / JSON</span></div><div class="group-buttons"><button type="button" class="primary" id="production-export">准备课件文件</button><a id="production-download" class="studio-file" hidden></a><a id="production-json-download" class="studio-file" hidden></a></div><p class="hint" id="production-export-status" role="status">保存右侧讲解帧，另附可复用的场景参数。</p><details class="leaf-settings"><summary>导入已保存的场景 JSON</summary><label for="production-import">选择场景设置文件</label><input type="file" id="production-import" accept=".json,application/json" aria-describedby="production-import-status"><p class="hint" id="production-import-status" role="status">文件在本页读取。导入后可继续调整和导出。</p></details></div>
      </div>
    </section><section class="library studio-tools" aria-label="七种制作工具的分工"><div class="studio-head"><div><p class="studio-kicker">制作流程</p><h2>七种工具作用在哪一层</h2></div><p class="status" id="production-effect" role="status">选择一个动作，在上方观察变化。</p></div><div id="production-tools"></div><details class="studio-data"><summary>查看当前场景参数</summary><pre id="production-json" class="code" aria-label="当前场景参数"></pre></details></section></div>`;

    const max = $('#production-max');
    const open = $('#production-open');
    const angle = $('#production-angle');
    const frame = $('#production-index');
    const card = $('#production-card');
    const download = $('#production-download');
    const jsonDownload = $('#production-json-download');
    const exportStatus = $('#production-export-status');
    const importInput = $('#production-import');
    const importStatus = $('#production-import-status');
    let questionFirst = false;
    let easingEnabled = false;
    let previousOpening;
    let settingsRevision = 0;
    let importRequest = 0;
    const toolList = $('#production-tools');

    function cellScene(gap, rotation, frameIndex = null) {
      const offset = gap / 2;
      const overlay = frameIndex !== null;
      const key = overlay ? 'frame' : 'live';
      const caption = overlay ? `定帧讲解 · 第 ${frameIndex} 帧 · ${(frameIndex / 24).toFixed(2)} 秒` : '气孔开合';
      const chloroplasts = [[-36,-49,-24],[-49,-36,-18],[-53,-22,-5],[-55,18,14],[-51,34,24],[-39,48,30],[-28,54,38]].map(([x,y,angle]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="7" transform="rotate(${angle} ${x} ${y})" fill="#a9ce61" stroke="#57865e" stroke-width="1"/>`).join('');
      const command = `<path d="M-29-66C-67-61-79 12-54 48c14 20 36 23 54 10C-32 43-36-43 0-59c-7-7-20-9-29-7Z" fill="url(#${key}-cell)" stroke="#b6dc80" stroke-width="1.5"/><path d="M-29-59C-62-51-68 13-46 44c9 12 22 15 33 13" fill="none" stroke="#e3f1a9" stroke-opacity=".56" stroke-width="1.6"/><ellipse cx="-48" cy="0" rx="10" ry="15" fill="#66976c" stroke="#a9d985" stroke-width="1.1"/><ellipse cx="-49" cy="-1" rx="4" ry="6" fill="#cadb98" opacity=".6"/>${chloroplasts}`;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="290" height="228" viewBox="0 0 290 228" role="img" aria-label="两侧保卫细胞之间的气孔示意">
        <title>${caption}，示意孔径 ${gap.toFixed(1)} 单位</title>
        <defs><radialGradient id="${key}-scope"><stop stop-color="#376651"/><stop offset=".72" stop-color="#234b45"/><stop offset="1" stop-color="#122f34"/></radialGradient><linearGradient id="${key}-cell" x2=".8" y2="1"><stop stop-color="#c9e68d"/><stop offset=".48" stop-color="#77ac75"/><stop offset="1" stop-color="#3f7664"/></linearGradient></defs>
        <rect width="290" height="228" rx="9" fill="url(#${key}-scope)"/>
        <g fill="#83aa77" fill-opacity=".12" stroke="#7ca782" stroke-opacity=".24" stroke-width="1.3"><path d="M-12 24Q24 6 65 22L83 59Q67 82 36 83L-12 68Z"/><path d="M-11 71Q38 95 52 124Q40 150-9 151Z"/><path d="M-8 154Q42 146 70 169L73 201Q31 225-8 202Z"/><path d="M304 25Q260 6 223 21L208 53Q216 78 253 84L301 72Z"/><path d="M304 77Q249 92 238 120Q252 151 302 153Z"/><path d="M302 157Q248 144 218 172L221 200Q262 225 303 200Z"/><path d="M76 2Q103 20 108 43Q139 47 160 35Q176 14 203 8Z"/><path d="M66 228Q76 198 104 185Q144 192 172 181Q206 196 217 228Z"/></g>
        <circle cx="145" cy="111" r="87" fill="none" stroke="#d4efc1" stroke-opacity=".22" stroke-dasharray="2 4"/>
        <g transform="translate(145 110) rotate(${rotation})">
          <ellipse cx="0" cy="1" rx="${offset + 2}" ry="53" fill="#10282f"/>
          <g id="${key}-left" transform="translate(${-offset} 0)">${command}</g>
          <g id="${key}-right" transform="translate(${offset} 0)"><g transform="scale(-1 1)">${command}</g></g>
          <path d="M${-offset} 8V20m0-6H${offset}m0-6V20" fill="none" stroke="#ffe99c" stroke-width="1.6"/>
        </g>
        <rect x="10" y="8" width="270" height="27" rx="5" fill="#173737" fill-opacity=".83"/>
        <text x="18" y="26" fill="#e3f1c7" font-size="12.5" font-family="sans-serif" font-weight="bold">${caption}</text>
        <path d="M14 204H30" stroke="#ffe99c" stroke-width="1.5"/>
        <text x="36" y="208" fill="#f4f3e6" font-size="12" font-family="sans-serif">示意孔径 ${gap.toFixed(1)} 单位</text>
        <text x="276" y="208" text-anchor="end" fill="#a7cdb3" font-size="10.5" font-family="sans-serif">保卫细胞示意</text>
      </svg>`;
    }
    const contrastSets = {
      lab: { strong: ['#3d2c59', '#f0ebfa'], weak: ['#817697', '#ede5f8'] },
      field: { strong: ['#4d5725', '#f3f5d9'], weak: ['#8a8767', '#f5f1d2'] },
    };
    function luminance(hex) {
      const parts = hex.match(/\w{2}/g).map(value => Number.parseInt(value, 16) / 255)
        .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return .2126 * parts[0] + .7152 * parts[1] + .0722 * parts[2];
    }
    function renderCard(gap) {
      const [fg, bg] = contrastSets[card.dataset.style][card.dataset.contrast];
      const ratio = (luminance(bg) + .05) / (luminance(fg) + .05);
      card.style.color = fg;
      card.style.backgroundColor = bg;
      $('#production-card-title').textContent = questionFirst ? '气孔打开时，空气从哪里通过？' : `气孔宽度 ${gap.toFixed(1)} 单位`;
      $('#production-card-copy').textContent = questionFirst ? `测量值 ${gap.toFixed(1)} 单位` : '比较两侧保卫细胞与中间开口。';
      $('#production-contrast').textContent = `小字对比度 ${ratio.toFixed(2)} : 1 · ${ratio >= 4.5 ? '达到 4.5 : 1' : '低于 4.5 : 1'}`;
    }
    function render(animate = false) {
      settingsRevision++;
      clearStudioFile(download);
      clearStudioFile(jsonDownload);
      exportStatus.textContent = '保存右侧讲解帧，另附可复用的场景参数。';
      const aperture = Number(max.value);
      const liveGap = aperture * Number(open.value) / 100;
      const frameIndex = Number(frame.value);
      const frameGap = aperture * Math.sin(Math.PI * frameIndex / 48);
      $('#production-live').innerHTML = cellScene(liveGap, Number(angle.value));
      $('#production-frame').innerHTML = cellScene(frameGap, -11, frameIndex);
      if (animate && easingEnabled && previousOpening !== undefined && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        for (const [id, multiplier] of [['live-left', -.5], ['live-right', .5]]) {
          $(`#${id}`).animate([
            { transform: `translateX(${multiplier * previousOpening}px)` },
            { transform: `translateX(${multiplier * liveGap}px)` },
          ], { duration: 380, easing: 'ease-out' });
        }
      }
      previousOpening = liveGap;
      $('#production-live-label').textContent = `交互视图 · 孔径 ${liveGap.toFixed(1)}`;
      $('#production-frame-label').textContent = `第 ${frameIndex} 帧 · 孔径 ${frameGap.toFixed(1)}`;
      $('#production-max-value').textContent = `${aperture} 单位`;
      $('#production-open-value').textContent = `${open.value}%`;
      $('#production-angle-value').textContent = `${angle.value}°`;
      $('#production-index-value').textContent = `${frameIndex} / 48`;
      for (const button of all('[data-production-frame]')) button.setAttribute('aria-pressed', String(Number(button.dataset.productionFrame) === frameIndex));
      $('#production-json').textContent = JSON.stringify({
        sharedModel: { apertureLimit: aperture },
        live: { open: Number(open.value) / 100, angle: Number(angle.value) },
        render: { fps: 24, frame: frameIndex, aperture: Number(frameGap.toFixed(1)) },
        lessonCard: { palette: card.dataset.style, contrast: card.dataset.contrast, questionFirst, easingEnabled },
      }, null, 2);
      renderCard(liveGap);
    }
    const actions = {
      design() { card.dataset.style = card.dataset.style === 'lab' ? 'field' : 'lab'; return card.dataset.style === 'field' ? '切到暖黄野外记录配色。' : '切到冷紫实验室配色。'; },
      audit() { card.dataset.contrast = card.dataset.contrast === 'weak' ? 'strong' : 'weak'; return card.dataset.contrast === 'strong' ? '加深文字，查看对比值是否过线。' : '恢复原小字颜色，查看对比值。'; },
      layout() { questionFirst = !questionFirst; return questionFirst ? '先展示课堂问题，再展示测量值。' : '先展示测量值，再补充解释。'; },
      motion() { easingEnabled = !easingEnabled; open.value = Number(open.value) > 50 ? 22 : 80; return easingEnabled ? '以缓动过渡到新的开合值。' : '关闭过渡，直接跳到新的开合值。'; },
      fiber() { angle.value = Number(angle.value) === 24 ? -24 : 24; return '左侧按新机位重画，右侧帧保持固定。'; },
      remotion() { frame.value = Number(frame.value) === 8 ? 24 : 8; return '右侧按新帧号重新计算，左侧交互值保持。'; },
      blender() { max.value = Number(max.value) === 32 ? 50 : 32; return '共享资产孔径上限已修改，两个视图一起更新。'; },
    };
    for (const [key, tool, action, explanation, url] of library) {
      const item = document.createElement('article');
      const name = document.createElement('h3');
      const copy = document.createElement('p');
      name.append(sourceLink(tool, url));
      copy.textContent = explanation;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.effect = key;
      button.textContent = action;
      button.addEventListener('click', () => {
        $('#production-effect').textContent = actions[key]();
        render(key === 'motion');
      });
      item.append(name, copy, button);
      toolList.append(item);
    }
    for (const control of [max, open, angle, frame]) control.addEventListener('input', () => render(control === open));
    for (const button of all('[data-production-frame]')) button.addEventListener('click', () => {
      frame.value = button.dataset.productionFrame;
      render();
    });
    $('#production-export').addEventListener('click', () => {
      const file = new Blob([$('#production-frame svg').outerHTML], { type: 'image/svg+xml' });
      const data = new Blob([$('#production-json').textContent], { type: 'application/json' });
      publishStudioFile(download, file, `leaf-frame-${frame.value}.svg`, `下载第 ${frame.value} 帧 SVG`);
      publishStudioFile(jsonDownload, data, 'leaf-lesson-settings.json', '下载场景 JSON');
      exportStatus.textContent = `已准备第 ${frame.value} 帧和当前场景设置。`;
    });
    const inRange = (value, input) => Number.isInteger(value) && value >= Number(input.min) && value <= Number(input.max);
    importInput.addEventListener('change', async () => {
      const [file] = importInput.files;
      importInput.value = '';
      if (!file) return;
      const request = ++importRequest;
      const revision = settingsRevision;
      importStatus.textContent = '正在读取场景设置。';
      try {
        if (file.size > 16 * 1024) throw Error('文件大小须在 16 KiB 以内。');
        const text = await file.text();
        if (request !== importRequest) return;
        if (revision !== settingsRevision) {
          importStatus.textContent = '场景已更新，请重新选择要导入的文件。';
          return;
        }
        const { sharedModel, live, render: savedFrame, lessonCard } = JSON.parse(text) ?? {};
        const liveOpening = Math.round(live?.open * 100);
        if (!inRange(sharedModel?.apertureLimit, max) || !inRange(liveOpening, open)
          || typeof live?.open !== 'number' || Math.abs(live.open * 100 - liveOpening) > .0001
          || !inRange(live?.angle, angle) || !inRange(savedFrame?.frame, frame) || savedFrame.fps !== 24
          || !Object.hasOwn(contrastSets, lessonCard?.palette) || !Object.hasOwn(contrastSets[lessonCard.palette], lessonCard.contrast)
          || typeof lessonCard.questionFirst !== 'boolean' || typeof lessonCard.easingEnabled !== 'boolean') {
          throw Error('请选择本工作台导出的场景设置 JSON。');
        }
        max.value = sharedModel.apertureLimit;
        open.value = liveOpening;
        angle.value = live.angle;
        frame.value = savedFrame.frame;
        card.dataset.style = lessonCard.palette;
        card.dataset.contrast = lessonCard.contrast;
        questionFirst = lessonCard.questionFirst;
        easingEnabled = lessonCard.easingEnabled;
        render();
        importStatus.textContent = `已恢复第 ${frame.value} 帧、孔径、机位和提问卡设置。`;
      } catch (error) {
        if (request !== importRequest) return;
        importStatus.textContent = error instanceof SyntaxError ? 'JSON 无法读取，当前场景已保留。' : `${error.message} 当前场景已保留。`;
      }
    });
    render();
  }
})();
