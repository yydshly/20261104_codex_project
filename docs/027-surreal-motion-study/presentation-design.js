'use strict';

(() => {
  const asText = (value) => Array.isArray(value) ? value.map(asText).join('；') : String(value ?? '');
  const escape = (value) => asText(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const items = (value) => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
  const row = (label, value) => value ? `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>` : '';
  const checkList = (label, value) => {
    const list = items(value);
    return list.length ? `<section><h4>${label}</h4><ul>${list.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></section>` : '';
  };

  // Normalized composition guides over the SAME keyframe, not successive video frames.
  const guides = {
    a: { anchor: [79,73], end: [80,36], regions: [[64,61,32,26],[22,8,116,73],[65,19,30,33]], labels: ['人与近拱的尺度','下一层拱廊','远门与连续路线'] },
    b: { anchor: [31,69], end: [130,29], regions: [[8,43,49,44],[45,15,100,67],[110,15,41,34]], labels: ['身体与脚下路面','近柱后的新路段','右上暖光落点'] },
    c: { anchor: [134,74], end: [124,24], regions: [[108,53,48,35],[57,24,95,61],[79,5,75,65]], labels: ['主体与弯道入口','遮挡后的桥段','完整曲路与远门'] },
    d: { anchor: [32,71], end: [135,40], regions: [[10,48,46,39],[43,6,109,77],[112,20,43,40]], labels: ['主体与湿地反光','连桥与楼群层次','可辨认的暖光入口'] },
    e: { anchor: [136,75], end: [43,27], regions: [[111,57,45,31],[40,18,111,68],[14,7,68,52]], labels: ['木板路与根系','根下雾谷的高差','林间光口与曲路'] },
    f: { anchor: [34,72], end: [134,36], regions: [[7,49,53,38],[42,11,111,71],[111,15,44,47]], labels: ['近冰纹与暗路','冰壁与裂谷纵深','晨光出口与连接路'] },
    g: { anchor: [135,65], end: [37,48], regions: [[109,47,47,41],[20,38,132,39],[5,5,150,78]], labels: ['骑行者与倒影','道路与反射的延伸','天空与镜面留白'] },
    h: { anchor: [36,72], end: [120,30], regions: [[15,53,46,35],[52,16,92,69],[86,5,69,55]], labels: ['主体与近处巨塔','塔后显露的高架','远塔群与连续路线'] },
    i: { anchor: [111,75], end: [81,35], regions: [[85,57,50,31],[26,5,111,77],[61,20,42,34]], labels: ['主体与第一重门框','下一重门框接替','远蓝口与后续门框'] },
    j: { anchor: [37,72], end: [132,28], regions: [[9,46,57,42],[49,23,93,63],[110,8,46,44]], labels: ['前俯姿态与风雪','下一段上行路','亮区与可达路线'] },
    k: { anchor: [133,71], end: [36,45], regions: [[108,49,46,38],[27,28,107,56],[13,18,49,47]], labels: ['孤身主体与远处暖点','接近中变清楚的门窗','暖站入口与停靠感'] },
    l: { anchor: [43,72], end: [124,44], regions: [[18,47,52,40],[46,7,109,80],[63,4,92,77]], labels: ['门槛与局部外景','门柱后的道路','开阔高原与天空'] }
  };
  const schematic = (frameId, frame, index, stage) => {
    const guide = guides[frameId];
    if (!frame?.image || !guide) return '';
    const [x,y,w,h] = guide.regions[index];
    const [sx,sy] = guide.anchor;
    const [ex,ey] = guide.end;
    const uid = 'pd-guide-' + frameId + '-' + index;
    return `<figure class="pd-schematic"><div class="pd-schematic-label">同一静态底图 · 构图意图</div><svg viewBox="0 0 160 90" role="img" aria-labelledby="${uid}-title"><title id="${uid}-title">${escape(stage.label)}：${escape(guide.labels[index])}。符号表达创作意图，不是新增抽帧。</title><defs><marker id="${uid}-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#e9efb2"/></marker></defs><image href="${escape(frame.image)}" width="160" height="90" preserveAspectRatio="xMidYMid slice"/><rect width="160" height="90" fill="#071118" opacity=".24"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#deed99" fill-opacity=".09" stroke="#e6edab" stroke-width=".9"/><path d="M${sx} ${sy} Q${sx} ${ey} ${ex} ${ey}" fill="none" stroke="#071118" stroke-width="2.2"/><path d="M${sx} ${sy} Q${sx} ${ey} ${ex} ${ey}" fill="none" stroke="#e9efb2" stroke-width=".9" stroke-dasharray="2.5 2" marker-end="url(#${uid}-arrow)"/><circle cx="${sx}" cy="${sy}" r="3.5" fill="#f4aa67" stroke="#101a21" stroke-width="1"/></svg><figcaption>${escape(guide.labels[index])}</figcaption></figure>`;
  };

  window.renderPresentationDesign = (frameId, container, frame) => {
    if (!container) return false;
    const design = window.PRESENTATION_DESIGNS?.[frameId];
    if (!design || typeof design !== 'object') {
      container.classList.remove('pd-host');
      return false;
    }
    const stages = Array.isArray(design.stages) ? design.stages : [];
    const abilities = Array.isArray(design.abilityRefs) ? design.abilityRefs : [];
    const headingId = 'pd-design-' + String(frameId).replace(/[^a-z\d_-]/gi, '');
    container.classList.add('pd-host');
    container.hidden = false;
    container.innerHTML = `
      <header class="pd-heading" aria-live="polite">
        <p class="eyebrow">PRESENTATION DESIGN / STATIC INTENT</p>
        <h3 id="${headingId}">展示重点：${escape(design.focus || '让主体与观看关系共同展示景观。')}</h3>
        ${design.feeling ? `<p class="pd-feeling"><span>目标感受</span>${escape(design.feeling)}</p>` : ''}
      </header>
      <p class="pd-scope">静态展示设计：尚未生成动态。下列阶段记录创作意图，不是新增抽帧、实际机位或已经发生的运动。</p>
      <dl class="pd-layers">
        ${row('主体动作', design.subject)}
        ${row('相机观看', design.camera)}
        ${row('环境变化', design.environment)}
        ${row('时间节律', design.rhythm)}
      </dl>
      <div class="pd-stage-heading"><h4>画面怎样逐步展开</h4><span>三个阶段 · 设计示意</span></div>
      <p class="pd-diagram-note">三个阶段复用同一张静态底图。橙点是主体锚点，虚线是视线引导意图，浅框是本阶段关注的空间；符号只表达构图关系，不表示真实机位、运动轨迹或新生成的连续帧。</p>
      <ol class="pd-stages" aria-label="展示过程的三个设计阶段">
        ${stages.map((stage, index) => `<li class="pd-stage"><div class="pd-stage-top"><span>${String(index + 1).padStart(2, '0')}</span><h4>${escape(stage.label || ['开场', '展开', '落点'][index] || '阶段')}</h4></div>${schematic(frameId, frame, index, stage)}<p class="pd-stage-intent">${escape(stage.intent || '')}</p><dl>${row('主体', stage.subject)}${row('相机', stage.camera)}${row('环境', stage.environment)}</dl></li>`).join('')}
      </ol>
      ${abilities.length ? `<div class="pd-abilities"><span>关联表现能力</span><div>${abilities.map((ability) => `<a class="text-link" href="#atlas"${ability.id ? ` data-pd-ability="${escape(ability.id)}"` : ''}>${escape(ability.title || ability.id || '查看能力')} ↗</a>`).join('')}</div></div>` : ''}
      ${(items(design.preserve).length || items(design.watchFor).length) ? `<details class="pd-checks"><summary>需要保留什么，怎样判断展示是否清楚</summary><div class="pd-check-columns">${checkList('继续保留', design.preserve)}${checkList('重点判断', design.watchFor)}</div></details>` : ''}
    `;
    return true;
  };
})();
