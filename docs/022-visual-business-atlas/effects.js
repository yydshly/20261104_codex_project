(() => {
  'use strict';
  const lab = window.STICKERLAB;
  if (!lab) return;
  const $ = s => document.querySelector(s);
  const escape = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motion.matches;
  let packId = 'pet';
  let stickerId = 'received';
  let sent = [];
  const pack = () => lab.packs.find(p => p.id === packId);
  const sticker = () => pack().stickers.find(s => s.id === stickerId);
  const path = (p, s, ext) => `${lab.basePath}/${p.id}/${s.id}.${ext}`;
  const meta = (p, s) => window.STICKER_FILES?.packs?.[p.id]?.stickers?.find(x => x.id === s.id);
  function image(p, s, className = '', lazy = false) {
    return `<img class="${className}" src="${path(p, s, playing ? 'gif' : 'png')}" data-gif="${path(p, s, 'gif')}" data-png="${path(p, s, 'png')}" alt="${escape(s.label)}：${escape(s.action)}" ${lazy ? 'loading="lazy"' : ''} width="240" height="240">`;
  }
  function renderHero() {
    const samples = [['pet', 'hug'], ['couple', 'love'], ['shop', 'packing'], ['pet', 'night']];
    $('#hero-real-grid').innerHTML = samples.map(([pid, sid]) => {
      const p = lab.packs.find(p => p.id === pid), s = p.stickers.find(s => s.id === sid);
      return `<button type="button" data-effect-pack="${pid}" data-effect-sticker="${sid}" class="hero-real-card ${pid}">${image(p, s)}<span>${escape(p.label.split(' · ')[0])} / ${escape(s.label)}</span><b aria-hidden="true">↗</b></button>`;
    }).join('');
  }
  function renderTabs() {
    $('#sample-tabs').innerHTML = lab.packs.map(p => `<button type="button" role="tab" id="sample-tab-${p.id}" aria-controls="sample-panel" aria-selected="${p.id === packId}" tabindex="${p.id === packId ? '0' : '-1'}" data-sample-pack="${p.id}"><span style="background:${p.color}">${escape(p.avatar)}</span>${escape(p.label)}<small>4 张</small></button>`).join('');
  }
  function renderChat() {
    const p = pack(), s = sticker();
    $('#chat-messages').innerHTML = `<div class="chat-date">场景：${escape(s.use)}</div><div class="chat-line incoming"><span class="mini-avatar">友</span><p>${escape(s.message)}</p></div>${sent.map(item => `<div class="chat-line outgoing"><div class="chat-sticker-message">${image(p, item)}</div><span class="mini-avatar sender" style="background:${p.color}">${escape(p.avatar)}</span></div>`).join('')}`;
    $('#current-sticker-name').textContent = s.label;
    const m = meta(p, s);
    $('#download-gif').href = path(p, s, 'gif');
    $('#download-gif').download = `${p.label}-${s.label}.gif`;
    $('#download-gif').setAttribute('aria-label', `下载 GIF：${s.label}${m ? `，${Math.ceil(m.gifBytes / 1024)} KB` : ''}`);
    $('#download-png').href = path(p, s, 'png');
    $('#download-png').download = `${p.label}-${s.label}.png`;
    $('#download-png').setAttribute('aria-label', `下载透明 PNG：${s.label}`);
  }
  function renderPack() {
    const p = pack();
    $('#sample-panel').setAttribute('aria-labelledby', `sample-tab-${p.id}`);
    $('#pack-kicker').textContent = p.kicker;
    $('#pack-title').textContent = p.title;
    $('#pack-value').textContent = p.value;
    $('#sample-origin').textContent = p.origin;
    $('#chat-name').textContent = p.chatName;
    $('#chat-avatar').textContent = p.avatar;
    $('#chat-avatar').style.background = p.color;
    $('#sample-grid').innerHTML = p.stickers.map(s => {
      const m = meta(p, s);
      return `<button type="button" class="sticker-choice" data-sticker="${s.id}" aria-pressed="${s.id === stickerId}" aria-label="预览表情：${escape(s.label)}"><span class="sticker-image">${image(p, s)}</span><span class="sticker-choice-label">${escape(s.label)}<small>${escape(s.action)}</small></span><span class="sticker-file-meta">GIF${m ? ` · ${Math.ceil(m.gifBytes / 1024)} KB` : ''}<b>↗</b></span></button>`;
    }).join('');
    const files = window.STICKER_FILES?.packs?.[p.id]?.stickers;
    $('#sample-spec').innerHTML = `<span><b>${p.stickers.length}</b> 张独立动图</span><span><b>240 × 240</b> GIF</span><span><b>480 × 480</b> 透明 PNG</span><span><b>${files?.[0]?.frameCount || 4}</b> 幅动作帧 / 张</span>`;
    $('#sample-value-grid').innerHTML = [['辨识度在哪里', p.identity], ['为什么用得上', p.usefulness], ['可以扩展什么', p.next]].map(([t, v], i) => `<article><span>0${i + 1}</span><div><h4>${t}</h4><p>${escape(v)}</p></div></article>`).join('');
    $('#sample-related').innerHTML = `<button type="button" class="case-related-button" data-case-id="${p.id}">看这个方向的设计对照 ↗</button>` + p.directionIds.map(id => { const d = window.ATLAS.directions.find(d => d.id === id); return `<button type="button" data-detail="${id}">${escape(d.title)} ↗</button>`; }).join('');
    $('#download-pack').href = `${lab.basePath}/${p.id}-stickers.zip`;
    $('#download-pack').download = `${p.label}-表情包.zip`;
    renderChat();
  }
  function setPack(id, sid, jump = false) {
    const p = lab.packs.find(p => p.id === id);
    if (!p) return;
    packId = id;
    stickerId = p.stickers.some(s => s.id === sid) ? sid : p.stickers[0].id;
    sent = [sticker()];
    renderTabs(); renderPack();
    if (jump) {
      document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
      $('#showcase').scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth' });
      $('#sample-panel').focus({ preventScroll: true });
    }
  }
  function updatePlayback() {
    document.querySelectorAll('img[data-gif]').forEach(img => { img.src = playing ? img.dataset.gif : img.dataset.png; });
    $('#toggle-animation').textContent = playing ? '暂停动图' : '播放动图';
    $('#toggle-animation').setAttribute('aria-pressed', String(playing));
  }
  $('#toggle-animation').addEventListener('click', () => { playing = !playing; updatePlayback(); });
  motion.addEventListener('change', event => { playing = !event.matches; updatePlayback(); });
  $('#toggle-background').addEventListener('click', () => {
    const dark = $('#sample-panel').classList.toggle('dark-preview');
    $('#toggle-background').setAttribute('aria-pressed', String(dark));
    $('#toggle-background').textContent = dark ? '恢复浅色底' : '深色底检查';
  });
  $('#sample-tabs').addEventListener('click', event => { const b = event.target.closest('[data-sample-pack]'); if (b) { setPack(b.dataset.samplePack); $(`#sample-tab-${packId}`).focus(); } });
  $('#sample-tabs').addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = lab.packs.findIndex(p => p.id === packId);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    setPack(lab.packs[next].id); $(`#sample-tab-${packId}`).focus();
  });
  $('#sample-grid').addEventListener('click', event => {
    const b = event.target.closest('[data-sticker]'); if (!b) return;
    stickerId = b.dataset.sticker;
    sent = [sticker()];
    $('#sample-grid').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === b)));
    renderChat();
  });
  $('#send-sample').addEventListener('click', () => { sent = [...sent, sticker()].slice(-3); renderChat(); });
  document.addEventListener('click', event => {
    const b = event.target.closest('[data-effect-pack]');
    if (b) setPack(b.dataset.effectPack, b.dataset.effectSticker, true);
  });
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement && event.target.dataset.gif) {
      event.target.classList.add('asset-unavailable');
      event.target.alt = '表情文件读取失败，请检查 assets/stickers 是否完整';
    }
  }, true);
  renderHero(); setPack('pet'); updatePlayback();
  window.StickerLab = { openPack: setPack, isPlaying: () => playing };
})();
