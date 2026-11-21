(() => {
  'use strict';
  const atlas = window.CARRIER_ATLAS;
  if (!atlas) return;
  const $ = s => document.querySelector(s);
  const escape = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const character = atlas.character.image;
  let selected = 'sticker', experimentSize = 120;
  const knowledgeChecks = new Set();
  const current = () => atlas.carriers.find(c => c.id === selected);
  const cat = (className = '', alt = '傲娇白猫角色样品') => `<img class="${className}" src="${character}" alt="${escape(alt)}" width="480" height="480">`;
  function renderTabs() {
    $('#carrier-tabs').innerHTML = atlas.carriers.map(c => `<button type="button" role="tab" id="carrier-tab-${c.id}" data-carrier-select="${c.id}" aria-controls="carrier-panel" aria-selected="${selected === c.id}" tabindex="${selected === c.id ? '0' : '-1'}"><span>${c.no}<i class="${c.status}"></i></span><strong>${c.name}</strong></button>`).join('');
    $('#same-character-tabs').innerHTML = atlas.sameCharacter.map(id => {
      const c = atlas.carriers.find(c => c.id === id);
      return `<button type="button" data-carrier-select="${id}" aria-pressed="${selected === id}"><span>${c.name}</span><small>${c.catUse}</small></button>`;
    }).join('');
  }
  function scene(c) {
    if (c.id === 'pet' && window.DesktopPet) return window.DesktopPet.scene();
    if (window.CarrierProducts?.has(c.id)) return window.CarrierProducts.scene(c.id);
    if (c.id === 'sticker') return `<div class="carrier-chat-scene"><div class="carrier-scene-bar">聊天场景 <small>图片是消息本身</small></div><div class="carrier-chat-text">家里那只是不是又来催饭了？</div><div class="carrier-cat-message">${cat('', '作为聊天消息发送的“碗空了”表情')}</div><span class="carrier-scene-note">在对话里替你说一句话</span></div>`;
    if (c.id === 'knowledge') return `<div class="carrier-knowledge-scene"><div class="carrier-scene-bar">做事时查阅 <small>可操作检查卡示例</small></div><article class="carrier-knowledge-card"><span>CHARACTER DELIVERY / 01</span><h4>角色交付，先看这三件事。</h4>${[['认得出','斑纹、眼睛与配饰保持一致。'],['看得清','缩小后，文字和神态仍能辨认。'],['用得上','有明确场景，文件与命名可用。']].map(([title,desc],i)=>`<label><input type="checkbox" data-carrier-check="${i}" ${knowledgeChecks.has(i)?'checked':''}><span><strong>${title}</strong><small>${desc}</small></span></label>`).join('')}<p id="carrier-knowledge-progress">已核对 ${knowledgeChecks.size} / 3 项</p></article></div>`;
    if (c.id === 'lab') return `<div class="carrier-lab-scene"><div class="carrier-scene-bar">自己动手观察 <small>表情可读性实验</small></div><div class="carrier-lab-stage">${cat('carrier-experiment-image')}</div><label class="carrier-size-label" for="carrier-size-slider">改变显示尺寸 <output id="carrier-size-value">${experimentSize} px</output></label><input id="carrier-size-slider" type="range" min="48" max="190" step="1" value="${experimentSize}" aria-label="表情显示尺寸"><p>缩小后，你还能认出黑耳、鼻边斑和“碗空了”吗？</p></div>`;
    if (c.id === 'utility') return `<div class="carrier-utility-scene"><div class="carrier-scene-bar">输入条件，得到结果 <small>成本试算小样</small></div><div class="carrier-mini-calculator"><label for="carrier-demo-price">客户实付金额 <small>元 / 单</small></label><input id="carrier-demo-price" type="number" min="0" max="100000" step="0.01" value="99" inputmode="decimal"><p>示例固定条件：现金成本 12 元，总投入 140 分钟，费率为 0。</p><div><span>每小时现金结余</span><strong id="carrier-demo-hourly">37.3 <small>元 / 小时</small></strong></div><small>结余未计税费和固定经营开支。</small></div></div>`;
    return `<div class="carrier-physical-scene"><div class="carrier-scene-bar">陈列与携带场景 <small>立牌概念样机</small></div><div class="carrier-shelf"><div class="carrier-standee"><div class="carrier-standee-cutout">${cat('', '以白猫样品制作的立牌陈列概念')}</div><div class="carrier-standee-base"></div></div><div class="carrier-shelf-line"></div><span>桌上的一只傲娇猫</span></div><p class="carrier-physical-note">陈列方式示意，尺寸、结构和材料需经实际设计与打样。</p></div>`;
  }
  function renderPanel() {
    const c = current();
    $('#carrier-panel').setAttribute('aria-labelledby', `carrier-tab-${c.id}`);
    $('#carrier-panel').innerHTML = `<div class="carrier-panel-heading"><div><span class="micro-label">CARRIER ${c.no} / ${escape(c.kind)}</span><h3>${escape(c.name)}</h3></div><span class="carrier-status-badge ${c.status}">${c.statusLabel}</span></div><div class="carrier-detail-grid"><div class="carrier-scene">${scene(c)}</div><div class="carrier-information"><dl><div><dt>载体是什么</dt><dd>${escape(c.form)}</dd></div><div><dt>什么时候使用</dt><dd>${escape(c.scenario)}</dd></div><div><dt>承载什么价值</dt><dd>${escape(c.value)}</dd></div></dl><div class="carrier-meaning"><span>同一只猫，在这里的角色</span><strong>${escape(c.catUse)}</strong><p>${escape(c.example)}</p></div></div></div><div class="carrier-delivery-row"><div><h4>真正交付时要有什么</h4><ul>${c.delivery.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div><div><h4>怎样检验价值</h4><p>${escape(c.verify)}</p></div></div><div class="carrier-current-state"><b>当前完成状态</b><p>${escape(c.current)}</p></div><div class="carrier-actions">${actions(c)}</div>`;
    if (c.id === 'lab') $('#carrier-panel .carrier-experiment-image').style.width = `${experimentSize}px`;
  }
  function actions(c) {
    if (c.id === 'pet' && window.DesktopPet) return window.DesktopPet.actions();
    if (window.CarrierProducts?.has(c.id)) return window.CarrierProducts.actions(c.id);
    if (c.id === 'sticker') return `<a class="button primary" href="${character}" download="傲娇白猫-碗空了.png">下载已有 PNG ↓</a><button type="button" class="button secondary" data-case-id="pet">查看参考与设计对照 ↗</button>`;
    if (c.id === 'utility') return '<a class="button primary" href="#experiment">打开完整成本计算器 ↓</a>';
    if (c.id === 'knowledge') return '<button type="button" id="carrier-download-card" class="button primary">下载检查卡文字版 ↓</button>';
    return '<button type="button" class="button secondary" data-case-id="pet">查看角色来自哪里 ↗</button><a class="carrier-source-link" href="assets/case-studies/pet-after.png" target="_blank" rel="noopener">查看已有角色源图 ↗</a>';
  }
  function selectCarrier(id, jump = false, focus = false) {
    if (!atlas.carriers.some(c=>c.id===id)) return;
    selected = id; renderTabs(); renderPanel();
    if (jump) {
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());
      $('#carriers').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      $('#carrier-panel').focus({preventScroll:true});
    } else if (focus) $(`#carrier-tab-${id}`).focus();
  }
  document.addEventListener('click',event=>{
    const choose=event.target.closest('[data-carrier-select],[data-open-carrier]');
    if (choose) {
      const id=choose.dataset.carrierSelect||choose.dataset.openCarrier;
      const sameCharacter=choose.closest('#same-character-tabs')!==null;
      selectCarrier(id,Boolean(choose.dataset.openCarrier),choose.closest('#carrier-tabs')!==null);
      if(sameCharacter) $(`#same-character-tabs [data-carrier-select="${id}"]`).focus({preventScroll:true});
    }
    if (event.target.closest('#carrier-download-card')) downloadCard();
  });
  $('#carrier-tabs').addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
    event.preventDefault();const n=atlas.carriers.length,i=atlas.carriers.findIndex(c=>c.id===selected);
    const next=event.key==='Home'?0:event.key==='End'?n-1:(i+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+n)%n;
    selectCarrier(atlas.carriers[next].id,false,true);
  });
  $('#carrier-panel').addEventListener('input',event=>{
    if(event.target.id==='carrier-size-slider'){
      experimentSize=Number(event.target.value);$('#carrier-size-value').textContent=`${experimentSize} px`;$('#carrier-panel .carrier-experiment-image').style.width=`${experimentSize}px`;
    }
    if(event.target.id==='carrier-demo-price'){
      const input=event.target;
      $('#carrier-demo-hourly').innerHTML=input.value!==''&&input.validity.valid?`${((input.valueAsNumber-12)/(140/60)).toFixed(1)} <small>元 / 小时</small>`:'<small>请输入有效的非负金额</small>';
    }
  });
  $('#carrier-panel').addEventListener('change',event=>{
    if(!event.target.matches('[data-carrier-check]'))return;
    const i=Number(event.target.dataset.carrierCheck);if(event.target.checked)knowledgeChecks.add(i);else knowledgeChecks.delete(i);
    $('#carrier-knowledge-progress').textContent=`已核对 ${knowledgeChecks.size} / 3 项`;
  });
  function downloadCard(){
    const lines=['# 角色交付检查卡','','网页操作卡示例，非完整印刷卡组。','',...['认得出：斑纹、眼睛与配饰保持一致。','看得清：缩小后，文字和神态仍能辨认。','用得上：有明确场景，文件与命名可用。'].map((s,i)=>`- [${knowledgeChecks.has(i)?'x':' '}] ${s}`),'','勾选表示已核对，不代表自动判定通过。',''];
    const url=URL.createObjectURL(new Blob(['\uFEFF',lines.join('\n')],{type:'text/markdown;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='角色交付检查卡.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  $('#carrier-character-note').textContent=atlas.character.note;
  renderTabs();renderPanel();
  window.CarrierAtlas={open:selectCarrier};
})();
