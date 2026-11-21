(() => {
  'use strict';
  const data = window.COZY_DATA;
  const $ = id => document.getElementById(id);
  const cases = data.cases;
  const byId = id => cases.find(item => item.id === id) || cases[0];
  const storageKey = 'cozy-emotion-lab:v1';
  const knownIds = new Set(cases.map(item => item.id));
  const ratios = { wide: { label: '16:9', width: 1600, height: 900 }, portrait: { label: '9:16', width: 1080, height: 1920 }, square: { label: '1:1', width: 1200, height: 1200 } };
  const focusPoints = { comfort: { wide: [50,50], portrait: [33,52], square: [45,50] }, hope: { wide: [50,50], portrait: [76,52], square: [68,50] }, delight: { wide: [50,50], portrait: [71,52], square: [62,50] } };
  const state = { active: 'comfort', product: 0, output: 'poster', ratio: 'wide', compare: 24, blind: false, saved: [], feelings: {}, notes: {}, captions: {}, targets: {}, settings: {} };
  let toastTimer, saveTimer, motionFrame = 0, motionTime = 0, playing = false, lastMotionTick = 0;
  let weatherFrame = 0, weatherVisible = false;
  let undoSession = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function restore() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (!value || value.version !== 1) return;
      if (knownIds.has(value.active)) state.active = value.active;
      if (Object.prototype.hasOwnProperty.call(ratios, value.ratio)) state.ratio = value.ratio;
      if (Array.isArray(value.saved)) state.saved = [...new Set(value.saved.filter(id => knownIds.has(id)))];
      for (const key of ['feelings', 'notes', 'captions', 'targets']) {
        for (const item of cases) {
          if (typeof value[key]?.[item.id] === 'string') state[key][item.id] = value[key][item.id].slice(0, key === 'notes' ? 600 : key === 'targets' ? 240 : key === 'captions' ? 64 : 10);
        }
      }
      for (const item of cases) {
        if (Array.isArray(value.settings?.[item.id]) && value.settings[item.id].length === 3) state.settings[item.id] = value.settings[item.id].map(number => Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0);
      }
    } catch { /* The page also works when storage is disabled. */ }
  }
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify({ ...state, blind: false, version: 1 })); }
      catch { /* Exports remain available without browser storage. */ }
    }, 160);
  }
  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3400);
  }
  function setPressed(selector, callback) {
    document.querySelectorAll(selector).forEach(button => {
      const selected = callback(button);
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function controls() { return state.settings[state.active] || byId(state.active).defaults.slice(); }
  function currentCaption() { return state.captions[state.active] ?? byId(state.active).caption; }
  function currentTarget() { return state.targets[state.active] ?? byId(state.active).target; }
  function renderProduct() {
    const item = data.productLayers[state.product];
    setPressed('[data-product]', button => Number(button.dataset.product) === state.product);
    $('product-content').innerHTML = `<span class="status-tag">${item.tag}</span><h3>${item.title}</h3><p>${item.body}</p><ul>${item.items.map(text => `<li>${text}</li>`).join('')}</ul><p class="product-foot">${item.foot}</p>`;
  }
  function renderCases() {
    $('case-grid').innerHTML = cases.map(item => `<article class="case-card ${item.id === state.active ? 'selected' : ''}" data-case="${item.id}">
      <button class="case-select" data-select="${item.id}" aria-pressed="${item.id === state.active}" aria-label="展开${item.name}案例：${item.short}"><div class="case-photo"><img src="${item.original}" alt="${item.sourceTitle}，${item.sourceType}" loading="lazy"><span class="reference-badge">公开原帖参考</span></div><div class="case-info"><span class="tiny-label">${item.number} / ${item.en}</span><h3>${item.name}<span class="case-arrow" aria-hidden="true">↗</span></h3><p>${item.short}</p></div></button>
      <div class="case-card-footer"><a href="${item.source}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a><button class="save-case" data-save="${item.id}" aria-pressed="${state.saved.includes(item.id)}" aria-label="${state.saved.includes(item.id) ? '取消收藏' : '收藏'}${item.name}参考">${state.saved.includes(item.id) ? '♥ 已收藏' : '♡ 收藏参考'}</button></div></article>`).join('');
    const item = byId(state.active);
    $('case-detail').innerHTML = `<div><span class="detail-number">CASE ${item.number} / 观察与解读</span><h3>${item.title}</h3><p>${item.fact}</p><p class="detail-transfer">${item.interpretation}</p></div><div><div class="detail-label">把关系提炼出来</div><p class="detail-rule">${item.relation}</p><p>${item.mechanism}</p><p class="detail-transfer">${item.transfer}</p><a class="text-link" href="#lab">用新题材亲手试一试 ↗</a></div>`;
  }
  function renderLab() {
    const item = byId(state.active);
    $('emotion-tabs').innerHTML = cases.map((scene, index) => `<button data-emotion="${scene.id}" class="${scene.id === state.active ? 'active' : ''}" aria-pressed="${scene.id === state.active}">${state.blind ? '样本 ' + String.fromCharCode(65 + index) : scene.name}</button>`).join('');
    $('lab-stage').dataset.emotion = item.id;
    $('lab-stage').classList.toggle('blind', state.blind);
    $('lab-base').src = item.image;
    $('lab-base').alt = state.blind ? '请观察这幅图像，记录你的第一感受' : `素材原图：${item.subject}`;
    $('lab-image').src = item.image;
    $('scene-en').textContent = item.en;
    $('scene-title').textContent = item.title;
    $('hotspots').innerHTML = item.cues.map((cue, index) => `<button class="hotspot" type="button" style="left:${item.cuePositions[index][0]}%;top:${item.cuePositions[index][1]}%" aria-label="画面线索 ${index + 1}：${cue}">${index + 1}<span class="hotspot-tip">${cue}</span></button>`).join('');
    $('hotspots').inert = state.blind;
    const settings = controls();
    $('control-list').innerHTML = item.controls.map((label, index) => `<div class="control-block"><label class="control-label" for="control-${index}">${label}<output id="control-value-${index}" for="control-${index}">${settings[index]}</output></label><input type="range" id="control-${index}" data-control="${index}" min="0" max="100" value="${settings[index]}"><p>${item.controlNotes[index]}</p></div>`).join('');
    $('control-list').hidden = state.blind;
    $('blind-toggle').textContent = state.blind ? '恢复画面提示 ◉' : '隐藏提示盲看 ◉';
    $('blind-toggle').setAttribute('aria-pressed', String(state.blind));
    $('lab-insight').textContent = state.blind ? '画面提示已隐藏。先记录自己的感受，再恢复提示讨论。已经接触过目标，因此这里用于个人观察。' : `${item.relation} 调整光色和裁切后，继续检查这段关系是否仍然清楚。`;
    updateTreatment();
    updatePerception();
    startWeather();
  }
  function updateTreatment() {
    const settings = controls();
    const stage = $('lab-stage');
    stage.style.setProperty('--warm', String(settings[0] / 100));
    stage.style.setProperty('--contrast', String(settings[1] / 100));
    stage.style.setProperty('--zoom', String(1 + settings[2] / 380));
    stage.style.setProperty('--split', `${state.compare}%`);
    $('compare-value').textContent = `${state.compare}%`;
    settings.forEach((value, index) => { const output = $(`control-value-${index}`); if (output) output.textContent = value; });
    if (reducedMotion) drawWeather(0);
  }
  function updatePerception() {
    const feeling = state.feelings[state.active];
    document.querySelectorAll('[data-feeling]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.feeling === feeling)));
    $('perception-status').textContent = !feeling ? '先感受，再选择。这里记录你的观察。' : state.blind ? `已记录你的感受：${feeling}。恢复提示后可以比较。` : `你的感受：${feeling}；演示意图：${byId(state.active).name}。这是一条个人观察，随研究记录导出。`;
  }
  function renderValues() {
    $('value-list').innerHTML = data.values.map(value => `<article class="value-row"><span class="value-n">${value.n}</span><div class="value-main"><h3>${value.title}</h3><p>${value.text}</p></div><div class="value-result"><span class="tiny-label">我们留下什么</span><b>${value.output}</b><p>${value.test}</p></div></article>`).join('');
  }
  function renderCreation() {
    const item = byId(state.active);
    $('create-scene').value = item.id;
    $('poster-image').src = item.image;
    $('poster-image').alt = `本项目原创 AI 示范图：${item.subject}`;
    $('caption-input').value = currentCaption();
    $('poster-caption').textContent = currentCaption();
    $('brief-target').value = currentTarget();
    $('observation').value = state.notes[state.active] || '';
    document.querySelector('.poster-kicker').textContent = `SMALL MOMENTS / ${item.number.padStart(3, '0')}`;
    $('storyboard').innerHTML = item.shots.map((shot, index) => `<div class="shot-row" data-shot="${index}"><span>${shot.time}</span><b>${shot.title}</b><p>${shot.note}</p></div>`).join('');
    $('prompt-content').innerHTML = `<h4>主情绪与关系</h4><p>${item.target}</p><p>${item.relation}</p><h4>图片提示词草案</h4><p>${item.prompt}</p><h4>避免倾向</h4><p class="avoid">${item.avoid}</p><h4>看到画面后怎么检查</h4><ul>${item.checks.map(check => `<li>${check}</li>`).join('')}</ul><p class="fine-print">这里是依据示范图整理的后续创作草案。最初实际提交给 Image Gen 的英文指令完整保存在 docs/generation-prompts.json；两者分别留存。</p>`;
    applyOutputMode();
  }
  function applyOutputMode() {
    stopMotion();
    setPressed('[data-output]', button => button.dataset.output === state.output);
    $('poster-options').hidden = state.output !== 'poster';
    $('storyboard').hidden = state.output !== 'motion';
    $('motion-player').hidden = state.output !== 'motion';
    $('brief-options').hidden = state.output !== 'brief';
    $('poster').dataset.ratio = state.output === 'motion' ? 'wide' : state.ratio;
    $('preview-format').textContent = state.output === 'motion' ? '8 SEC / 16:9' : ratios[state.ratio].label;
    $('poster-caption').style.opacity = '1';
    $('poster-image').style.transform = '';
    const focus = focusPoints[state.active][state.ratio];
    $('poster-image').style.objectPosition = `${focus[0]}% ${focus[1]}%`;
    setPressed('[data-ratio]', button => button.dataset.ratio === state.ratio);
    $('creation-note').textContent = state.output === 'poster' ? '海报使用生成原图。上方实验的调整参数会随研究记录导出，未自动烘焙到海报。' : state.output === 'motion' ? '预演用浏览器平移、缩放静态图像。分镜是后续 AI 视频制作的方案，尚未生成视频。' : '简报包含自定义目标、画面依据、当前调整参数、分镜、检查单与来源。修改后可重新导出。';
    if (state.output === 'motion') { motionTime = 0; updateMotion(0); }
  }
  function renderLibrary() {
    $('saved-count').textContent = String(state.saved.length);
    const selected = state.saved.map(byId);
    $('saved-items').innerHTML = selected.length ? selected.map(item => `<span>${item.number} / ${item.name}</span>`).join('') : '还没有收藏，回到案例区挑选一条。';
  }
  function renderSources() {
    $('sources-list').innerHTML = `<li><a href="${data.profile}" target="_blank" rel="noopener noreferrer">rosa / @cozyycabin · 主页 ↗</a><small>账号定位、公开资料与可见内容形式</small></li>` + cases.map(item => `<li><a href="${item.source}" target="_blank" rel="noopener noreferrer">${item.sourceTitle} ↗</a><small>${item.sourceType} · 观察日期 ${data.reviewed}</small></li>`).join('');
  }
  function selectCase(id) {
    if (!knownIds.has(id)) return;
    stopMotion();
    state.active = id;
    renderCases(); renderLab(); renderCreation();
    persist();
  }
  function saveCase(id) {
    if (!knownIds.has(id)) return;
    const selected = state.saved.includes(id);
    state.saved = selected ? state.saved.filter(item => item !== id) : [...state.saved, id];
    renderCases(); renderLibrary(); persist();
    toast(selected ? '已取消收藏，可随时重新加入。' : `已收藏“${byId(id).name}”参考，来源链接一并保留。`);
  }
  function exportFile(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function promptText() {
    const item = byId(state.active);
    return `用途：情绪向图片创作\n目标感受：${currentTarget()}\n主体关系：${item.relation}\n\n${item.prompt}\n\n避免：${item.avoid}`;
  }
  function briefMarkdown() {
    const item = byId(state.active);
    const settings = controls();
    return `# 情绪创作简报 · ${item.name}\n\n整理日期：${data.reviewed}\n\n## 用途与艺术意图\n\n${currentTarget()}\n\n## 我们的新题材\n\n${item.subject}\n\n海报文案：${currentCaption() || '无文案'}\n\n画幅：${ratios[state.ratio].label}\n\n## 参考观察\n\n${item.fact}\n\n情绪解读：${item.interpretation}\n\n## 保留的关系\n\n${item.relation}\n\n${item.mechanism}\n\n## 自己的迁移\n\n${item.transfer}\n\n## 图片提示词草案\n\n${promptText()}\n\n## 当前浏览器预演参数\n\n${item.controls.map((label, index) => `- ${label}：${settings[index]} / 100`).join('\n')}\n- 对比位置：${state.compare}%\n\n这些参数对应网页调色、裁切和图层效果，不是原始模型参数，也不是情绪评分。海报导出使用生成原图。\n\n## 八秒短片分镜草案\n\n${item.shots.map(shot => `- ${shot.time}：${shot.title}。${shot.note}`).join('\n')}\n\n视频为后续制作方案；本项目仅完成静态图与浏览器镜头预演，未生成 AI 视频或音轨。\n\n## 检查依据\n\n${item.checks.map(check => `- [ ] ${check}`).join('\n')}\n\n## 我的主观观察\n\n第一感受：${state.feelings[item.id] || '尚未记录'}\n\n${state.notes[item.id] || '尚未补充具体画面依据。'}\n\n## 出处与制作记录\n\n- 原帖：${item.source}\n- 账号：${data.profile}\n- 参考角色：情绪关系参考。原作权利属于相应权利人。\n- 示范图：本项目内置 Image Gen 生成，保存在 ${item.image}\n- 实际英文生成指令：docs/generation-prompts.json\n- 本简报的中文提示词为后续创作草案，与初始实际指令分别留存。\n- 作者现有付费产品、素材原创身份、收入与稳定传播表现尚未核实。\n`;
  }
  function libraryData() {
    return {
      schema: 'cozy-emotion-study/v1', exportedAt: new Date().toISOString(), reviewedAt: data.reviewed,
      scope: '公开帖子小样本研究；情绪是本项目解读；非作者产品清单或商业收益证明。',
      profile: data.profile,
      saved: state.saved.map(id => { const item = byId(id); return { id, name: item.name, source: item.source, fact: item.fact, interpretation: item.interpretation, relation: item.relation, mechanism: item.mechanism, transfer: item.transfer, firstFeeling: state.feelings[id] || null, observation: state.notes[id] || '', referenceImage: item.original }; }),
      observations: cases.map(item => ({ id: item.id, intendedEmotion: item.name, personalFeeling: state.feelings[item.id] || null, note: state.notes[item.id] || '', source: item.source })),
      currentPlan: { case: state.active, caption: currentCaption(), target: currentTarget(), aspect: ratios[state.ratio].label, previewSettings: Object.fromEntries(byId(state.active).controls.map((label, index) => [label, controls()[index]])), comparisonPercent: state.compare, generatedAsset: byId(state.active).image, markdown: briefMarkdown() },
      provenance: { originalPrompts: 'docs/generation-prompts.json', sourceManifest: 'docs/sources.json', aiVideoGenerated: false, audienceEffectValidated: false }
    };
  }
  function wrapCanvasText(context, text, maxWidth) {
    const lines = []; let line = '';
    for (const character of text) {
      if (character === '\n') { lines.push(line); line = ''; continue; }
      if (line && context.measureText(line + character).width > maxWidth) { lines.push(line); line = character; }
      else line += character;
    }
    if (line) lines.push(line);
    return lines;
  }
  async function downloadPoster() {
    const button = $('download-poster');
    button.disabled = true;
    const item = byId(state.active), caption = currentCaption(), ratio = ratios[state.ratio], ratioKey = state.ratio, focus = focusPoints[state.active][state.ratio];
    try {
      const image = new Image(); image.src = item.image; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = ratio.width; canvas.height = ratio.height;
      const context = canvas.getContext('2d');
      const { width, height } = canvas;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale, drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (width - drawWidth) * focus[0] / 100, (height - drawHeight) * focus[1] / 100, drawWidth, drawHeight);
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(6,21,12,.13)'); gradient.addColorStop(.35, 'rgba(6,21,12,0)'); gradient.addColorStop(1, 'rgba(13,33,22,.66)');
      context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      const margin = width * .07;
      context.fillStyle = '#fffdf1';
      context.font = `${Math.round(width * .017)}px "Segoe UI", sans-serif`;
      context.fillText(`SMALL MOMENTS / ${item.number.padStart(3, '0')}`, margin, height * .09);
      const fontSize = Math.round(width * (ratioKey === 'portrait' ? .065 : .041));
      context.font = `${fontSize}px "Noto Serif SC", "SimSun", serif`;
      const lines = wrapCanvasText(context, caption, width - margin * 2), lineHeight = fontSize * 1.7;
      const y = height * .85 - Math.max(0, lines.length - 1) * lineHeight;
      lines.forEach((line, index) => context.fillText(line, margin, y + index * lineHeight));
      context.fillStyle = '#dbe6ce'; context.font = `${Math.round(width * .009)}px "Segoe UI", sans-serif`;
      context.fillText('COZY EMOTION LAB · ORIGINAL AI STUDY', margin, height * .94);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG encoding failed');
      exportFile(`cozy-${item.id}-${ratio.label.replace(':', 'x')}.png`, blob);
      toast(`海报已生成：${width} × ${height} PNG。`);
    } catch { toast('图片尚未准备好，请稍后重试。'); }
    finally { button.disabled = false; }
  }
  function updateMotion(time) {
    const shots = byId(state.active).shots;
    const segment = time < 2 ? 0 : time < 5 ? 1 : 2;
    const shot = shots[segment], next = shots[Math.min(2, segment + 1)];
    const start = [0, 2, 5][segment], duration = [2, 3, 3][segment];
    const progress = Math.max(0, Math.min(1, (time - start) / duration));
    const eased = progress * progress * (3 - 2 * progress);
    const startPosition = shot.pos.split(' ').map(parseFloat), endPosition = next.pos.split(' ').map(parseFloat);
    $('poster-image').style.transform = `scale(${shot.scale + (next.scale - shot.scale) * eased})`;
    $('poster-image').style.objectPosition = `${startPosition[0] + (endPosition[0] - startPosition[0]) * eased}% ${startPosition[1] + (endPosition[1] - startPosition[1]) * eased}%`;
    $('poster-caption').style.opacity = String(Math.max(0, Math.min(1, (time - 4) / 1.5)));
    $('timeline').value = String(time);
    $('motion-time').textContent = `${time.toFixed(1)} / 8.0 秒`;
    $('shot-now').textContent = `${shot.time} · ${shot.title}`;
    document.querySelectorAll('[data-shot]').forEach(row => row.classList.toggle('active', Number(row.dataset.shot) === segment));
  }
  function motionTick(now) {
    if (!playing) return;
    if (lastMotionTick) motionTime = Math.min(8, motionTime + (now - lastMotionTick) / 1000);
    lastMotionTick = now; updateMotion(motionTime);
    if (motionTime >= 8) { stopMotion(); return; }
    motionFrame = requestAnimationFrame(motionTick);
  }
  function stopMotion() {
    playing = false; lastMotionTick = 0;
    cancelAnimationFrame(motionFrame);
    $('play-motion').textContent = motionTime >= 8 ? '重新播放 ↻' : '播放预演 ▷';
    $('motion-player').classList.remove('playing');
  }
  function toggleMotion() {
    if (playing) { stopMotion(); return; }
    if (motionTime >= 8) motionTime = 0;
    playing = true; lastMotionTick = 0;
    $('play-motion').textContent = '暂停预演 Ⅱ';
    $('motion-player').classList.add('playing');
    motionFrame = requestAnimationFrame(motionTick);
  }
  function drawWeather(now) {
    const canvas = $('weather'), context = canvas.getContext('2d');
    const width = canvas.width, height = canvas.height;
    context.clearRect(0, 0, width, height);
    if (state.active !== 'comfort') return;
    const density = controls()[1] / 100;
    const count = Math.round(density * 82);
    context.strokeStyle = 'rgba(210,233,238,.40)'; context.lineWidth = Math.max(1, width / 850);
    const t = reducedMotion ? 0 : now / 1000;
    for (let index = 0; index < count; index++) {
      const speed = 60 + (index * 47 % 110);
      const x = ((index * 137.11) % width);
      const y = ((index * 93.71 + t * speed) % (height + 35)) - 20;
      context.beginPath(); context.moveTo(x, y); context.lineTo(x - 3, y + 10 + index % 9); context.stroke();
    }
  }
  function weatherTick(now) {
    if (!weatherVisible || document.hidden || state.active !== 'comfort') { weatherFrame = 0; return; }
    drawWeather(now); weatherFrame = requestAnimationFrame(weatherTick);
  }
  function startWeather() {
    cancelAnimationFrame(weatherFrame); weatherFrame = 0;
    if (reducedMotion) { drawWeather(0); return; }
    if (weatherVisible && !document.hidden && state.active === 'comfort') weatherFrame = requestAnimationFrame(weatherTick);
    else drawWeather(0);
  }
  function resizeWeather() {
    const canvas = $('weather'), bounds = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * dpr)); canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    drawWeather(0);
  }
  function wireEvents() {
    document.addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      if (button.dataset.product !== undefined) { state.product = Number(button.dataset.product); renderProduct(); }
      if (button.dataset.select) selectCase(button.dataset.select);
      if (button.dataset.emotion) selectCase(button.dataset.emotion);
      if (button.dataset.save) saveCase(button.dataset.save);
      if (button.dataset.feeling) { state.feelings[state.active] = button.dataset.feeling; updatePerception(); persist(); }
      if (button.dataset.output) { state.output = button.dataset.output; applyOutputMode(); }
      if (button.dataset.ratio) { state.ratio = button.dataset.ratio; applyOutputMode(); persist(); }
    });
    $('control-list').addEventListener('input', event => {
      const index = event.target.dataset.control; if (index === undefined) return;
      state.settings[state.active] = controls().slice();
      state.settings[state.active][Number(index)] = Number(event.target.value);
      updateTreatment(); persist();
    });
    $('compare').addEventListener('input', event => { state.compare = Number(event.target.value); updateTreatment(); });
    $('reset-controls').addEventListener('click', () => { state.settings[state.active] = byId(state.active).defaults.slice(); state.compare = 24; $('compare').value = '24'; renderLab(); persist(); toast('已恢复这个案例的初始预演参数。'); });
    $('blind-toggle').addEventListener('click', () => { state.blind = !state.blind; renderLab(); });
    $('create-scene').addEventListener('change', event => selectCase(event.target.value));
    $('caption-input').addEventListener('input', event => { state.captions[state.active] = event.target.value; $('poster-caption').textContent = event.target.value; persist(); });
    $('brief-target').addEventListener('input', event => { state.targets[state.active] = event.target.value; persist(); });
    $('observation').addEventListener('input', event => { state.notes[state.active] = event.target.value; persist(); });
    $('download-poster').addEventListener('click', downloadPoster);
    $('download-brief').addEventListener('click', () => { exportFile(`cozy-${state.active}-brief.md`, briefMarkdown(), 'text/markdown;charset=utf-8'); toast('创作简报已导出，包含来源与当前观察。'); });
    $('download-library').addEventListener('click', () => { exportFile('cozy-emotion-study.json', JSON.stringify(libraryData(), null, 2), 'application/json;charset=utf-8'); toast(`研究记录已导出，含 ${state.saved.length} 条收藏与当前方案。`); });
    $('reset-session').addEventListener('click', () => {
      if (undoSession) {
        Object.assign(state, undoSession); undoSession = null;
        $('reset-session').textContent = '重新开始体验';
        toast('已恢复刚才的试用记录。');
      } else {
        undoSession = JSON.parse(JSON.stringify(state));
        Object.assign(state, { active:'comfort', product:0, output:'poster', ratio:'wide', compare:24, blind:false, saved:[], feelings:{}, notes:{}, captions:{}, targets:{}, settings:{} });
        $('reset-session').textContent = '撤销重新开始';
        toast('已重新开始。可点击“撤销重新开始”恢复刚才的记录。');
      }
      $('compare').value = String(state.compare);
      renderProduct(); renderCases(); renderLab(); renderCreation(); renderLibrary(); persist();
    });
    $('copy-prompt').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(promptText()); toast('图片提示词已复制。'); }
      catch { document.querySelector('.prompt-details').open = true; toast('浏览器未允许剪贴板访问，完整提示词已展开，可手动复制。'); }
    });
    $('play-motion').addEventListener('click', toggleMotion);
    $('timeline').addEventListener('input', event => { stopMotion(); motionTime = Number(event.target.value); updateMotion(motionTime); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); startWeather(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { weatherVisible = entries[0].isIntersecting; startWeather(); }, { rootMargin: '60px' }).observe($('lab-stage'));
      const navLinks = [...document.querySelectorAll('.site-header nav a')];
      const sectionObserver = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id)); }, { rootMargin: '-12% 0px -60% 0px' });
      ['product', 'cases', 'lab', 'create'].forEach(id => sectionObserver.observe($(id)));
    } else { weatherVisible = true; startWeather(); }
    if ('ResizeObserver' in window) new ResizeObserver(resizeWeather).observe($('lab-stage'));
    else window.addEventListener('resize', resizeWeather);
  }
  restore(); renderProduct(); renderCases(); renderLab(); renderValues(); renderCreation(); renderLibrary(); renderSources(); wireEvents(); resizeWeather();
})();
