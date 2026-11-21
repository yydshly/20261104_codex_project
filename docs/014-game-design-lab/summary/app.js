(() => {
  'use strict';
  const data=JSON.parse(document.querySelector('#summary-data').textContent);
  const assets=JSON.parse(document.querySelector('#summary-assets')?.textContent||'{}');
  const asset=name=>assets[name]||'./assets/'+name;
  for(const img of document.querySelectorAll('[data-inline-asset]'))img.src=asset(img.dataset.inlineAsset);
  for(const link of document.querySelectorAll('[data-inline-href]'))link.href=asset(link.dataset.inlineHref);
  const games=data.games, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  let current=games[0], view='play', step=0;
  const text=(selector,value)=>{$(selector).textContent=value;};
  function paragraph(value){const p=document.createElement('p');p.textContent=value;return p;}
  function heading(value){const h=document.createElement('h4');h.textContent=value;return h;}
  function renderText(){
    const target=$('#detail-text');target.replaceChildren();
    if(view==='art'){
      target.append(paragraph(current.art));
      const list=document.createElement('ul');
      for(const point of current.artPoints){const li=document.createElement('li');li.textContent=point;list.append(li);}
      target.append(heading('美术怎样支持体验'),list);
    }else if(view==='meaning'){
      target.append(paragraph(current.transfer),heading('值得保留'),paragraph(current.meaning),heading('避免走偏'),paragraph(current.risk));
    }else target.append(paragraph(current.mechanic),heading('值得带走的理解'),paragraph(current.meaning));
    for(const button of $$('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));
  }
  function renderStep(){
    for(const button of $$('[data-step]'))button.setAttribute('aria-pressed',String(Number(button.dataset.step)===step));
    text('#loop-note',current.loopNotes[step]);
  }
  function selectGame(id){
    const game=games.find(g=>g.id===id);if(!game)return;
    current=game;step=0;
    for(const button of $$('[data-game]')){const active=button.dataset.game===id;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
    $('#game-detail').style.setProperty('--accent',game.color);$('#game-detail').setAttribute('aria-labelledby','tab-'+id);
    $('#detail-image').src=asset(game.image);$('#detail-image').alt=game.name+'官方实机截图';
    $('#image-source').href=(game.sources.find(s=>/画面/.test(s.label))||game.sources[0]).url;
    text('#detail-genre',game.genre);text('#detail-name',game.name);text('#detail-question',game.question);
    const loop=$('#loop-buttons');loop.replaceChildren();
    game.loop.forEach((value,i)=>{const b=document.createElement('button');b.type='button';b.dataset.step=String(i);b.textContent=value;loop.append(b);});
    renderText();renderStep();
    const copy=$('.detail-copy');copy.removeAttribute('data-switching');requestAnimationFrame(()=>copy.setAttribute('data-switching',''));
    try{const url=new URL(location.href);url.searchParams.set('game',id);history.replaceState(null,'',url);}catch{}
  }
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-game]');if(tab)selectGame(tab.dataset.game);
    const link=event.target.closest('[data-select]');if(link)selectGame(link.dataset.select);
    const angle=event.target.closest('[data-view]');if(angle){view=angle.dataset.view;renderText();}
    const node=event.target.closest('[data-step]');if(node){step=Number(node.dataset.step);renderStep();}
  });
  $('.game-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    const i=games.findIndex(g=>g.id===current.id);
    const next=event.key==='Home'?0:event.key==='End'?games.length-1:(i+(event.key==='ArrowRight'?1:-1)+games.length)%games.length;
    selectGame(games[next].id);$('#tab-'+games[next].id).focus();
  });
  const dialog=$('#poster-dialog');let zoom=1;
  const nativeZoom=()=>{
    const scroller=$('.viewer-scroll'),style=getComputedStyle(scroller);
    return 2400/Math.max(200,scroller.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight));
  };
  const maxZoom=()=>Math.max(3,Math.ceil(nativeZoom()));
  function applyZoom(){
    $('#viewer-image').style.width=(zoom*100)+'%';
    $('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=maxZoom();
    $('#zoom-reset').title='当前缩放 '+Math.round(zoom*100)+'% · 点击适应窗口';
  }
  $('#open-poster').addEventListener('click',()=>{zoom=1;applyZoom();dialog.showModal();});
  $('#close-poster').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  $('#zoom-in').addEventListener('click',()=>{zoom=Math.min(maxZoom(),zoom+.5);applyZoom();});
  $('#zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.5);applyZoom();});
  $('#zoom-reset').addEventListener('click',()=>{zoom=1;applyZoom();$('.viewer-scroll').scrollTo(0,0);});
  $('#zoom-native').addEventListener('click',()=>{zoom=Math.max(1,nativeZoom());applyZoom();$('#viewer-image').style.width='2400px';});
  $('#print-page').addEventListener('click',()=>window.print());
  const requested=new URLSearchParams(location.search).get('game');selectGame(games.some(g=>g.id===requested)?requested:'spire');
})();
