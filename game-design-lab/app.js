import { games, byId, intents } from './data.js';
import { scene, icon } from './art.js';
import { makeBrief, briefMarkdown } from './engine.js';
import { GameRoom } from './game-room.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => Number.isInteger(value) ? String(value) : value.toFixed(1);
const initialGame = new URL(location.href).searchParams.get('game');
let selected = Object.hasOwn(byId,initialGame) ? initialGame : 'dungeon';
let tab = 'mechanics', artMode = 'atmosphere';
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
const room = new GameRoom('#lab-content');
const storageKey = 'playform-design-v1';
let draft = { title: '雾岛旅团', primary: 'spire', secondary: 'brothers', intent: '策略推演' };
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if(stored && stored.version === 1) {
    draft = { title: typeof stored.title === 'string' ? stored.title.slice(0,60) : '', primary: Object.hasOwn(byId,stored.primary) ? stored.primary : draft.primary, secondary: Object.hasOwn(byId,stored.secondary) ? stored.secondary : draft.secondary, intent: intents.includes(stored.intent) ? stored.intent : draft.intent };
  }
} catch { storageAvailable = false; }

function renderGame() {
  const g = byId[selected];
  document.documentElement.style.setProperty('--accent',g.color);
  $('#hero-art').innerHTML = scene(selected,`${g.name}的原创概念插画`);
  $('#hero-game-name').textContent = g.name; $('#hero-feeling').textContent = g.feeling;
  $('#world-rail').innerHTML = games.map(x=>`<button type="button" data-game="${x.id}" aria-pressed="${x.id===selected}" style="--game-color:${x.color}">${icon(x.icon)}<span><strong>${x.name}</strong><small>${x.short}</small></span></button>`).join('');
  $('#game-navigation').innerHTML = games.map(x=>`<button type="button" data-game="${x.id}" aria-pressed="${x.id===selected}" style="--game-color:${x.color}">${icon(x.icon,17)}${x.name}</button>`).join('');
  $('#study-art').innerHTML = scene(selected,`${g.name}的原创美术分析示意图`);
  $('#study-name').textContent = g.name; $('#study-genre').textContent = g.genre; $('#study-question').textContent = g.question; $('#study-source').href = g.source;
  $('#lab-game').value = selected; $('#lab-purpose').textContent = g.prototype; $('#lab-scope').textContent = g.scope;
  $('#learning-icon').innerHTML = icon(g.icon,20);
  const questions = { spire:'你选择新牌时，是在追求更强的单张，还是解决牌组的具体问题？', valley:'设施节省下来的体力，是否让你想尝试新的活动？', dungeon:'你在何时愿意撤退？这个判断需要哪些明确的信息？', factory:'哪次升级没有增加产量？你能解释瓶颈移到了哪里吗？', brothers:'你会为了更高的报酬，让已经负伤的老队员再出发吗？' };
  $('#learning-question').textContent = questions[selected];
  renderInspector(); room.switch(selected); room.setMotionPaused(paused);
}
function setGame(id) {
  if(!Object.hasOwn(byId,id)) return;
  if(selected!==id) room.persist();
  selected=id; const url=new URL(location.href); url.searchParams.set('game',id); history.replaceState(null,'',url); renderGame();
}
function renderInspector() {
  const g=byId[selected], panel=$('#inspector-panel');
  document.querySelectorAll('[data-tab]').forEach(b=>{ const active=b.dataset.tab===tab; b.setAttribute('aria-selected',String(active)); b.tabIndex=active?0:-1; });
  panel.setAttribute('aria-labelledby',`tab-${tab}`);
  document.body.classList.toggle('silhouette',tab==='art'&&artMode==='silhouette');
  document.body.classList.toggle('structure',tab==='art'&&artMode==='structure');
  if(tab==='mechanics') panel.innerHTML=`<p class="mechanism-intro">${g.mechanism}</p><div class="loop-flow" aria-label="核心循环">${g.loop.map(x=>`<span class="loop-node">${x}</span>`).join('')}</div><div class="decision-list">${g.decisions.map(([a,b])=>`<div class="decision-row"><strong>${a}</strong><p>${b}</p></div>`).join('')}</div><p class="study-insight">${g.insight}</p>`;
  if(tab==='art') panel.innerHTML=`<p class="mechanism-intro">${g.art}。用左侧原创示意插画，切换观察轮廓、结构与氛围；原作画面见官方资料。</p><div class="art-controls" role="group" aria-label="插画观察模式">${[['atmosphere','氛围'],['silhouette','轮廓'],['structure','结构']].map(([id,label])=>`<button type="button" class="chip" data-art-mode="${id}" aria-pressed="${artMode===id}">${label}</button>`).join('')}</div><div class="decision-list">${g.artPoints.map(([a,b])=>`<div class="decision-row"><strong>${a}</strong><p>${b}</p></div>`).join('')}</div><a href="${g.craftSource}" target="_blank" rel="noopener noreferrer" class="craft-link">${g.craftLabel}</a>`;
  if(tab==='borrow') panel.innerHTML=`<p class="borrow-callout">${g.borrow}</p><div class="decision-list">${g.mvp.map((x,i)=>`<div class="decision-row"><strong>${['先做','再连接','验证'][i]}</strong><p>${x}</p></div>`).join('')}</div><div class="pitfall"><strong>制作取舍</strong>${g.pitfall}</div><a href="#lab" class="craft-link">进入「${g.short}」实验，检查这些选择</a>`;
}

function saveDraft() {
  try { localStorage.setItem(storageKey,JSON.stringify({version:1,...draft})); storageAvailable=true; }
  catch { storageAvailable=false; }
  $('#save-status').textContent=storageAvailable?'草案选择已保存在当前浏览器。':'当前浏览器无法保存草案，请使用导出保留。';
}
function renderBrief() {
  const b=makeBrief(draft);
  $('#brief-output').innerHTML=`
    <h3>${escape(b.title)}</h3>
    <p class="brief-subtitle">${escape(b.intent)} · ${escape(b.primary)}${b.secondary==='暂不叠加'?'':` × ${escape(b.secondary)}`}</p>
    <div class="brief-part"><h4>玩家反复面对的选择</h4><p>${escape(b.question)}</p></div>
    <div class="brief-part"><h4>先做扎实的主循环</h4><p class="brief-loop">${b.loop.map(escape).join(' · ')}</p></div>
    <div class="brief-part"><h4>让体验目标进入规则</h4><p>${escape(b.pace)}</p></div>
    <div class="brief-part"><h4>机制与美术方向</h4><p>${escape(b.mechanic)} ${escape(b.support)}</p><p style="color:#70816e;font-size:12px;margin-top:8px">${escape(b.art)}</p></div>
    <div class="brief-part"><h4>组合前，先处理这个关系</h4><p class="brief-tension">${escape(b.tension)}</p></div>
    <div class="brief-part"><h4>第一个可验证原型</h4><ul class="brief-tasks">${b.tasks.map(t=>`<li>${escape(t)}</li>`).join('')}</ul></div>
    <p class="brief-boundary">${escape(b.boundary)}</p>`;
}
function syncDraftForm() {
  $('#project-title').value=draft.title; $('#primary-game').value=draft.primary; $('#secondary-game').value=draft.secondary;
  document.querySelectorAll('[name="intent"]').forEach(input=>input.checked=input.value===draft.intent); renderBrief();
}
function download(format) {
  const b=makeBrief(draft), content=format==='json'?JSON.stringify({version:1,configuration:draft,brief:b},null,2):briefMarkdown(b);
  const blob=new Blob([content],{type:format==='json'?'application/json;charset=utf-8':'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=`${b.title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')}.${format==='json'?'json':'md'}`; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast(`已导出${format==='json'?' JSON 数据':' Markdown 草案'}。`);
}
let toastTimer;
function toast(text) { $('#toast').textContent=text; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800); }

$('#lab-game').innerHTML=games.map(g=>`<option value="${g.id}">${g.short} · ${g.name}</option>`).join('');
for(const id of ['primary-game','secondary-game']) $(`#${id}`).innerHTML=games.map(g=>`<option value="${g.id}">${g.name} · ${g.short}</option>`).join('');
$('#intent-options').innerHTML=intents.map(intent=>`<label class="intent-option"><input type="radio" name="intent" value="${intent}" ${intent===draft.intent?'checked':''}>${intent}</label>`).join('');
$('#comparison-body').innerHTML=games.map(g=>`<tr><td>${g.name}</td><td>${g.short}</td><td>${g.persistence}</td><td>${g.cost}</td></tr>`).join('');
$('#sources-list').innerHTML=games.map(g=>`<div class="source-item"><strong>${g.name}</strong><div><a href="${g.source}" target="_blank" rel="noopener noreferrer">官方介绍</a><a href="${g.craftSource}" target="_blank" rel="noopener noreferrer">${g.craftLabel}</a></div></div>`).join('');
$('#lab-reset').innerHTML=`${icon('reset',15)}重新开始`; $('#export-md').innerHTML=`${icon('download',16)}导出设计草案`;
$('#light-toggle').innerHTML=icon('moon',18);
$('#index-link').href='https://yydshly.github.io/20261104_codex_project/';
document.body.classList.toggle('still',paused); $('#motion-toggle').setAttribute('aria-pressed',String(paused)); $('#motion-toggle').textContent=paused?'开启动态':'暂停动态';
if(!storageAvailable) $('#save-status').textContent='当前浏览器无法恢复草案，可随时导出保留。';
syncDraftForm(); renderGame();
if(new URL(location.href).searchParams.get('view')!=='study')room.setFocused(true);
window.addEventListener('hashchange',()=>{if(location.hash==='#lab')room.setFocused(true);});
document.querySelectorAll('a[href="#lab"]').forEach(a=>a.addEventListener('click',()=>room.setFocused(true)));

document.addEventListener('click',event=>{
  const gameButton=event.target.closest('[data-game]'); if(gameButton) { const parent=gameButton.parentElement; setGame(gameButton.dataset.game); parent.querySelector(`[data-game="${selected}"]`)?.focus({preventScroll:true}); return; }
  const tabButton=event.target.closest('[data-tab]'); if(tabButton) { tab=tabButton.dataset.tab; renderInspector(); return; }
  const artButton=event.target.closest('[data-art-mode]'); if(artButton) { artMode=artButton.dataset.artMode; renderInspector(); $(`[data-art-mode="${artMode}"]`).focus({preventScroll:true}); }
});
document.addEventListener('change',event=>{if(event.target.id==='lab-game')setGame(event.target.value);});
$('#brief-form').addEventListener('submit',event=>event.preventDefault());
$('#brief-form').addEventListener('input',()=>{ draft={title:$('#project-title').value,primary:$('#primary-game').value,secondary:$('#secondary-game').value,intent:$('[name="intent"]:checked').value}; saveDraft(); renderBrief(); });
$('#lab-reset').addEventListener('click',()=>room.reset());
$('#use-in-brief').addEventListener('click',()=>{draft.primary=selected; saveDraft(); syncDraftForm(); $('#workbench').scrollIntoView({behavior:paused?'instant':'smooth'}); toast(`已将${byId[selected].name}设为主玩法参考。`);});
$('#export-md').addEventListener('click',()=>download('md')); $('#export-json').addEventListener('click',()=>download('json'));
$('#motion-toggle').addEventListener('click',()=>{ paused=!paused; document.body.classList.toggle('still',paused); $('#motion-toggle').textContent=paused?'开启动态':'暂停动态'; $('#motion-toggle').setAttribute('aria-pressed',String(paused)); room.setMotionPaused(paused); });
$('#light-toggle').addEventListener('click',()=>{ const night=document.body.classList.toggle('night'); $('#light-toggle').setAttribute('aria-pressed',String(night)); $('#light-toggle').innerHTML=icon(night?'sun':'moon',18); });
$('#hero-world').addEventListener('pointermove',event=>{ if(paused||event.pointerType==='touch') return; const rect=event.currentTarget.getBoundingClientRect(); $('#hero-art').style.setProperty('--tilt-y',`${(event.clientX-rect.left-rect.width/2)/rect.width*7}deg`); $('#hero-art').style.setProperty('--tilt-x',`${-(event.clientY-rect.top-rect.height/2)/rect.height*5}deg`); });
$('#hero-world').addEventListener('pointerleave',()=>{ $('#hero-art').style.setProperty('--tilt-y','0deg'); $('#hero-art').style.setProperty('--tilt-x','0deg'); });
document.querySelectorAll('[role="tablist"]').forEach(list=>list.addEventListener('keydown',event=>{ if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const tabs=[...list.querySelectorAll('[role="tab"]')]; let index=tabs.indexOf(document.activeElement); index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length; tabs[index].click(); tabs[index].focus(); }));
window.addEventListener('pagehide',()=>room.persist());
