import {BOARD,TERRAIN,WEAPONS,SKILLS,HEROES,ARMORS,APPROACHES,MORALE,createRun,prepCost,takeAction,activeUnit,living,occupant,tileAt,reachable,attackPreview,actionReady,actionInfo,canSee,hexDistance} from './model.js';
import {Battlefield,ASSETS} from './render.js';
import {skillIcon} from './icons.js';
const $=q=>document.querySelector(q);
const escapeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SAVE_KEY='grey-banner-blackwater-v1',HISTORY_KEY='grey-banner-blackwater-history-v1';
let state=createRun(),saveError=false;
function validSave(data){return data?.version===1&&data.kind==='iron-company'&&['prep','battle','victory','defeat'].includes(data.phase)&&Array.isArray(data.units)&&Array.isArray(data.log)&&Array.isArray(data.queue)&&data.terrain&&data.cart&&data.gear&&HEROES.every(h=>data.gear[h.id]&&h.choices.includes(data.gear[h.id].weapon)&&ARMORS[data.gear[h.id].armor]);}
try{const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(validSave(data))state=data;}catch{saveError=true;}
const ui={skill:'move',inspect:null,hover:null,grid:false,busy:false,speed:1,sound:false,inspector:false};
const renderer=new Battlefield($('#battlefield')),previewRenderer=new Battlefield($('#preview-canvas'));
document.documentElement.style.setProperty('--warband',`url("${ASSETS.warband}")`);
if(ASSETS.alternates)document.documentElement.style.setProperty('--alternates',`url("${ASSETS.alternates}")`);
let lastFrame=0,lastSave=0,aiAt=0,busyUntil=0,activeBefore=null,lastPhase=null,hudSignature='',inspectorSignature='',toastTimer,actionTimer,audioContext;
function portrait(u,extra=''){const index=u?.portrait??0,alt=index<4&&HEROES[index]?.choices[1]===u.weapon;return `<span class="portrait ${alt?'alternate':''} ${extra}" style="--col:${index%4};--row:${Math.floor(index/4)};--portrait:${index%4}" aria-hidden="true"></span>`;}
function button(cmd,text,disabled=false,extra=''){return `<button type="button" data-act="${cmd}" ${disabled?'disabled':''} ${extra}>${text}</button>`;}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));saveError=false;}catch{saveError=true;}$('#saved-status').textContent=saveError?'可导出存档保留':'进度已自动保存';}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
function showAction(message){const target=$('#action-toast');target.textContent=message;target.classList.add('visible');clearTimeout(actionTimer);actionTimer=setTimeout(()=>target.classList.remove('visible'),1600);}
function normalize(){const actor=activeUnit(state);if(actor?.id!==activeBefore){activeBefore=actor?.id;ui.inspect=actor?.id||null;ui.skill='move';}if(state.phase!=='battle')ui.hover=null;}
function dispatch(action){
 if(performance.now()<busyUntil&&state.phase==='battle'&&action.type!=='ai')return;
 const next=takeAction(state,action);if(next===state)return;state=next;
 if(state.phase==='battle'&&action.type==='skill'&&!['aim','strike','dagger','shatter','stun','push','swing','split','bandage'].includes(action.skill))ui.skill='move';
 renderer.consume(state.events,state);const important=state.events.find(e=>e.type==='death'||e.type==='reinforcement');if(important)showAction(important.type==='reinforcement'?'东岸出现了新的劫匪！':important.target==='leader'?'匪首倒下，敌军士气开始动摇':(state.units.find(u=>u.id===important.target)?.name||'队员')+'阵亡');let duration=0;for(const e of state.events){if(e.type==='move')duration=Math.max(duration,(e.path.length-1)*120);else if(['hit','miss','block','shield'].includes(e.type))duration=Math.max(duration,350);sound(e);}
 busyUntil=performance.now()+duration/ui.speed;ui.busy=duration>0;aiAt=performance.now()+Math.max(duration,600)/ui.speed;normalize();renderHUD();persist();
 if(state.phase!==lastPhase&&['victory','defeat'].includes(state.phase)){try{const history=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');history.unshift({date:new Date().toISOString(),result:state.result,gear:state.gear,approach:state.approach});localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,12)));}catch{}}
 lastPhase=state.phase;
}
function renderPrep(){
 $('#approaches').innerHTML=Object.entries(APPROACHES).map(([key,a])=>`<button type="button" data-prep="approach" data-value="${key}" aria-pressed="${state.approach===key}"><strong>${a.name}</strong><small>${a.desc}</small></button>`).join('');
 const focus=document.activeElement?.id;
 $('#loadouts').innerHTML=HEROES.map(h=>{const gear=state.gear[h.id],armor=ARMORS[gear.armor],weapon=WEAPONS[gear.weapon];return `<article class="loadout-card"><div class="loadout-top">${portrait({...h,weapon:gear.weapon})}<div><h3 title="${h.bio}">${h.name}</h3><span>${h.title}</span><span>生命 ${h.hp} · 意志 ${h.resolve}</span></div></div><label for="weapon-${h.id}">武器<select id="weapon-${h.id}" data-gear="weapon" data-id="${h.id}">${h.choices.map(key=>`<option value="${key}" ${gear.weapon===key?'selected':''}>${WEAPONS[key].name}${WEAPONS[key].cost?' +'+WEAPONS[key].cost+'克朗':''}</option>`).join('')}</select></label><label for="armor-${h.id}">护甲<select id="armor-${h.id}" data-gear="armor" data-id="${h.id}">${Object.entries(ARMORS).map(([key,a])=>`<option value="${key}" ${gear.armor===key?'selected':''}>${a.name} · ${a.cost}克朗</option>`).join('')}</select></label><div class="loadout-stats"><span>护甲 <b>${armor.body}/${armor.head}</b></span><span>先攻 <b>${h.initiative-armor.weight}</b></span><span>射程 <b>${weapon.range}</b></span></div></article>`;}).join('');
 if(focus&&document.getElementById(focus))document.getElementById(focus).focus({preventScroll:true});
 const cost=prepCost(state),remaining=state.budget-cost;
 $('#prep-budget').innerHTML=`<div class="budget-amount ${remaining<0?'over-budget':''}">${remaining} <small>可用克朗</small></div><div class="budget-breakdown">现有军费 ${state.budget} − 装备与补给 ${cost}</div>`;$('#supply-count').textContent=state.supplies;$('#launch').disabled=remaining<0;
}
function renderTimeline(){
 const order=[state.active,...state.queue].map(id=>state.units.find(u=>u.id===id)).filter(u=>u&&!u.dead&&!u.escaped).slice(0,15);
 $('#round-number').textContent=state.round;
 $('#initiative').innerHTML=order.map((u,i)=>`<button type="button" class="turn-token ${u.side} ${i===0?'current':''}" data-inspect="${u.id}" title="${canSee(state,u)?u.name:'未知敌人'}${i===0?' · 当前行动':''}" ${!canSee(state,u)?'disabled':''}>${canSee(state,u)?portrait(u):'<span>?</span>'}<small>${canSee(state,u)?u.name.slice(0,3):'未知'}</small></button>`).join('');
 const leader=state.units.find(u=>u.id==='leader');
 $('#mission-progress').innerHTML=`<div><span>商车 <b>${state.cart.hp}/${state.cart.maxHp}</b></span><span>护送 <b>${Math.min(state.cart.progress,8)}/8</b></span></div><div><span>击倒 <b>${state.stats.kills}</b> · 溃逃 <b>${state.stats.routed}</b></span><span>${leader?.dead?'匪首已倒下':state.round<4?'第四回合将有增援':'渡口仍在交战'}</span></div>`;
}
function renderCommands(){
 const actor=activeUnit(state),player=actor?.side==='ally'&&actor.morale>-3&&!state.withdrawing;
 const left=actor?`<div class="active-card">${portrait(actor)}<div class="active-data"><h2>${actor.name}</h2><p>${WEAPONS[actor.weapon].name} · ${MORALE[actor.morale+3]}</p><div class="ap-pips" aria-label="剩余 ${actor.ap} AP">${Array.from({length:9},(_,i)=>`<i class="${i<actor.ap?'on':''}"></i>`).join('')}</div><small>${actor.ap}/9 AP　疲劳 ${actor.fatigue}/${actor.maxFatigue}</small></div></div>`:'';
 if(!player){$('#commands').innerHTML=left+`<div><div class="enemy-turn"><i></i>${state.withdrawing?'队伍正在撤离':actor?.morale===-3?'溃逃，正在寻找退路':'敌方正在行动'}</div><p class="enemy-turn-note">${actor?.morale===-3?'士气崩溃后无法接受作战命令。':'观察敌人的位置和意图，提前安排下一次行动。'}</p></div><div class="turn-actions"></div>`;return;}
 const keys=WEAPONS[actor.weapon].skills;
 $('#commands').innerHTML=left+`<div class="skills-area"><div class="skill-buttons"><button type="button" class="skill-button" data-skill="move" aria-pressed="${ui.skill==='move'}" title="点击空地移动。鼠标悬停显示路径、AP 和借机攻击风险。">${skillIcon('move')}<span>移动</span><small>按地形消耗</small></button>${keys.map((key,i)=>{const a=actionInfo(actor,key),ready=actionReady(state,actor,key);return `<button type="button" class="skill-button" data-skill="${key}" aria-pressed="${ui.skill===key}" ${!ready?'disabled':''} title="${a.desc}"><kbd>${i+1}</kbd>${skillIcon(a.icon)}<span>${key==='strike'?(WEAPONS[actor.weapon].ranged?'射击':'攻击'):a.name}</span><small>${a.ap} AP · ${a.fat} 疲劳</small></button>`;}).join('')}</div><p class="skill-description" id="skill-description"></p></div><div class="turn-actions">${button('end','结束行动 <kbd>E</kbd>',false,'class="end-turn"')}${button('wait','等待 <kbd>W</kbd>',state.waited.includes(actor.id))}${button('recover','恢复 · 9 AP',actor.ap!==9)}</div>`;
 renderSkillDescription();
}
function renderSkillDescription(key=ui.skill){const p=$('#skill-description');if(!p)return;p.textContent=key==='move'?'鼠标悬停查看路径；点击空地移动，点击敌人使用普通攻击。离开近战可能触发借机攻击。':SKILLS[key]?.desc||'';}
function meter(label,value,max,kind){return `<div><label>${label}</label><span class="meter ${kind}"><i style="width:${Math.max(0,Math.min(100,value/max*100))}%"></i></span><strong>${value}/${max}</strong></div>`;}
function renderInspector(){
 if(state.phase!=='battle')return;
 const actor=activeUnit(state),hover=ui.hover&&occupant(state,ui.hover.q,ui.hover.r),target=hover&&(!hover.side||hover.id==='wagon'||canSee(state,hover))?hover:state.units.find(u=>u.id===ui.inspect),terrain=ui.hover&&tileAt(state,ui.hover);
 const signature=JSON.stringify([state.revision,target?.id,ui.hover,ui.skill]);if(signature===inspectorSignature)return;inspectorSignature=signature;
 let markup='';
 if(target){
  if(target.id==='wagon')markup=`<span class="inspect-eyebrow">护送目标</span><h2 class="inspect-title">冬粮商车</h2><p class="inspect-subtitle">前往东岸 · ${state.cart.progress}/8</p><div class="unit-bars">${meter('耐久',target.hp,target.maxHp,'hp')}</div><p class="inspect-prompt"><strong>车夫正在等待安全的道路</strong>每个回合结束前进最多两格。护卫须在两格内，敌人不能贴近，前方道路不能被占据。</p>`;
  else markup=`<span class="inspect-eyebrow">${target.side==='ally'?'灰旗佣兵团':'渡口劫匪'} · ${target.id===state.active?'当前行动':'观察目标'}</span><h2 class="inspect-title">${target.name}</h2><p class="inspect-subtitle">${WEAPONS[target.weapon].name}</p>${portrait(target,'target-portrait')}<div class="unit-bars">${meter('生命',target.hp,target.maxHp,'hp')}${meter('身体',target.body,target.maxBody,'armor')}${meter('头盔',target.head,target.maxHead,'armor')}${meter('疲劳',target.fatigue,target.maxFatigue,'fatigue')}</div><div class="unit-tags"><span class="${target.morale<0?'danger':''}">${MORALE[target.morale+3]}</span>${target.shield?`<span>盾 ${target.shield}/${target.maxShield}</span>`:''}${target.shieldwall?'<span>盾墙</span>':''}${target.spearwall?'<span>矛墙</span>':''}${target.riposte?'<span>还击架势</span>':''}${target.bleed?`<span class="danger">流血 ${target.bleed} 回合</span>`:''}${target.injury?`<span class="danger">${target.injury==='leg'?'腿部负伤':'手臂负伤'}</span>`:''}${target.stun?'<span class="danger">眩晕</span>':''}</div>`;
  if(actor?.side==='ally'&&target.side!==actor.side&&target.id!=='wagon'){
   const key=ui.skill==='move'?'strike':ui.skill,preview=attackPreview(state,actor,target,key);
   markup+=preview.valid?`<div class="attack-readout"><div class="chance-heading"><span>${SKILLS[key].name}</span><strong>${preview.chance}<small>%</small></strong></div><div class="attack-ranges">${key==='split'?'盾牌耐久 <b>−12</b>':`预计身体伤害 <b>${preview.hpDamage.join('–')}</b><br>预计护甲损伤 ${preview.armorDamage.join('–')}`}<br>消耗 ${preview.ap} AP · ${preview.fat} 疲劳</div>${preview.mods?`<div class="modifier-list">${preview.mods.map(([name,value])=>`<div class="${value<0?'negative':name!=='基础'?'positive':''}"><span>${name}</span><span>${value>0&&name!=='基础'?'+':''}${value}</span></div>`).join('')}</div>`:''}<p class="inspect-prompt">点击目标发动攻击。头部命中、伤势与士气可能进一步改变结果。</p></div>`:`<p class="inspect-prompt"><strong>当前不能攻击</strong>${preview.reason}</p>`;
  }
 }else{
  const leader=state.units.find(u=>u.id==='leader');markup=`<span class="inspect-eyebrow">合同目标</span><h2 class="inspect-title">护送过河</h2><p class="inspect-subtitle">击溃拦路者，也能完成合同</p><ul class="objective-list"><li class="${state.cart.progress>=8?'done':''}"><b>商车抵达东岸</b>当前进度 ${state.cart.progress}/8，耐久 ${state.cart.hp}/90。</li><li class="${leader?.dead?'done':'danger'}"><b>${leader?.dead?'红巾匪首已倒下':'匪首仍在指挥'}</b>${leader?.dead?'敌方的士气与增援受到打击。':'击倒他会触发敌方士气检定，第四回合前可阻止增援。'}</li><li><b>带你的人回家</b>${living(state,'ally').length} 人仍在场上。阵亡、伤势与装备损耗会进入结算。</li></ul><p class="inspect-prompt">悬停角色查看状态和命中构成；悬停地块查看移动代价。</p>`;
 }
 if(terrain)markup+=`<div class="terrain-readout"><b>${TERRAIN[terrain.kind].name}${terrain.height>0?' · 高地':''}</b>${TERRAIN[terrain.kind].cost>=90?'不能通行':`基础移动 ${TERRAIN[terrain.kind].cost} AP${terrain.height>0?'，上坡额外 1 AP':''}`}${terrain.kind==='scrub'?'<br>提供 15% 远程遮挡':''}${terrain.kind==='mud'?'<br>每步消耗 8 疲劳':''}</div>`;
 $('#inspector').innerHTML='<button type="button" class="inspector-close" data-ui="inspector" aria-label="关闭战况">×</button>'+markup;
}
function renderResult(){const r=state.result;if(!r)return;const allies=state.units.filter(u=>u.side==='ally');$('#result').innerHTML=`<article class="result-paper"><header><p class="eyebrow">黑水渡口 · ${r.win?'合同履行':'合同终止'}</p><h1>${r.win?'灰旗仍在风中':'归途比报酬更重'}</h1><p>${r.reason}</p></header><div class="result-metrics"><div><b>${r.survivors}/4</b>英雄生还</div><div><b>${state.stats.kills}</b>敌人阵亡</div><div><b>${state.stats.routed}</b>敌人溃逃</div><div><b>${r.rounds}</b>战斗回合</div></div><div class="result-details"><div><h2>他们的名字</h2><div class="result-roster">${allies.map(u=>`<div class="result-person ${u.dead?'fallen':''}">${portrait(u)}<b>${u.name}</b><small>${u.dead?'阵亡':u.injury?(u.injury==='leg'?'腿部负伤':'手臂负伤'):'幸存'}${!u.dead?`<br>生命 ${u.hp}/${u.maxHp}`:''}</small></div>`).join('')}</div></div><div><h2>商会账册</h2><div class="settlement"><div><span>合同报酬</span><b>+${r.pay}</b></div><div><span>匪首赏金</span><b>+${r.bounty}</b></div><div><span>全员生还奖励</span><b>+${r.survivalBonus||0}</b></div><div><span>整备支出</span><b>−${r.preparation||0}</b></div><div><span>幸存队员工资</span><b>−${r.wages}</b></div><div><span>阵亡抚恤</span><b>−${r.casualtyCost||0}</b></div><div><span>装备修复准备金</span><b>−${r.repair}</b></div><div class="net"><span>本次净收益</span><b>${r.net>0?'+':''}${r.net}</b></div></div></div></div><div class="result-actions"><button data-ui="restart" class="primary">重新整备，换一种打法</button><button data-ui="journal">重读战报</button></div><p class="result-note">你选择的装备、路线与这次战斗结果已保存在本机。每次重新整备会开始一份新的合同。</p></article>`;}
function renderHUD(){
 normalize();$('#game').dataset.phase=state.phase;$('#preparation').hidden=state.phase!=='prep';$('#battle').hidden=state.phase!=='battle';$('#result').hidden=!['victory','defeat'].includes(state.phase);$('#phase-label').textContent=state.phase==='prep'?'任务整备':state.phase==='battle'?`第 ${state.round} 回合`:'合同结算';
 if(state.phase==='prep')renderPrep();else if(state.phase==='battle'){renderTimeline();renderCommands();renderInspector();$('#last-event').textContent=state.notice;$('.mobile-recover').disabled=activeUnit(state)?.side!=='ally'||activeUnit(state)?.ap!==9;}else renderResult();
 $('#journal-lines').innerHTML=state.log.map(e=>`<li class="${e.type}"><small>回合 ${e.round}</small>${escapeText(e.text)}</li>`).join('')||'<li>远征尚未开始。</li>';
 $('#game').classList.toggle('is-busy',ui.busy);$('#inspector').classList.toggle('open',ui.inspector);
}
function chooseSkill(key){const actor=activeUnit(state);if(!actor||actor.side!=='ally'||actor.morale===-3||performance.now()<busyUntil)return;if(key==='move'){ui.skill=key;renderCommands();renderInspector();return;}if(!actionReady(state,actor,key)){toast('当前 AP、疲劳或装备条件不允许使用这个技能。');return;}
 if(['shield','spearwall','riposte','reload','rally'].includes(key)){dispatch({type:'skill',skill:key});return;}
 ui.skill=key;renderCommands();renderInspector();
}
function newContract(){if(state.result){/* The result is already archived on settlement. */}const previousGear=structuredClone(state.gear),previousApproach=state.approach;state=createRun((Date.now()&0xffffffff)>>>0);state.gear=previousGear;state.approach=previousApproach;ui.skill='move';ui.inspect=null;ui.hover=null;ui.busy=false;ui.inspector=false;busyUntil=0;activeBefore=null;renderer.effects=[];renderer.zoom=1;renderer.pan={x:0,y:0};hudSignature='';inspectorSignature='';renderHUD();persist();}
function exportSave(){persist();const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='grey-banner-blackwater-save.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出当前合同存档。');}
function uiAction(key){
 if(key==='help')$('#help-dialog').showModal();if(key==='journal')$('#journal-dialog').showModal();if(key==='export')exportSave();if(key==='restart'){$('dialog[open]')?.close();newContract();}
 if(key==='sound'){ui.sound=!ui.sound;$('#sound-button').textContent=ui.sound?'声音：开':'声音：关';if(ui.sound)sound({type:'stance'});}
 if(key==='grid'){ui.grid=!ui.grid;$('#grid-button').setAttribute('aria-pressed',String(ui.grid));}
 if(key==='zoomin')renderer.zoom=Math.min(2.5,renderer.zoom+.2);if(key==='zoomout')renderer.zoom=Math.max(.65,renderer.zoom-.2);if(key==='fit'){renderer.zoom=1;renderer.pan={x:0,y:0};}
 if(key==='inspector'){ui.inspector=!ui.inspector;$('#inspector').classList.toggle('open',ui.inspector);$('.inspect-toggle').setAttribute('aria-expanded',String(ui.inspector));}
 if(key==='speed'){ui.speed=ui.speed===1?2:1;$('#speed-button').textContent=`节奏 ${ui.speed}×`;}
}
document.addEventListener('click',e=>{
 const close=e.target.closest('[data-close]');if(close){document.getElementById(close.dataset.close).close();return;}
 const prep=e.target.closest('[data-prep]');if(prep){if(prep.dataset.prep==='approach')dispatch({type:'approach',approach:prep.dataset.value});else dispatch({type:'supplies',amount:Number(prep.dataset.amount)});return;}
 const tool=e.target.closest('[data-ui]');if(tool){uiAction(tool.dataset.ui);return;}
 const skill=e.target.closest('[data-skill]');if(skill&&!skill.disabled){chooseSkill(skill.dataset.skill);return;}
 const act=e.target.closest('[data-act]');if(act&&!act.disabled){dispatch({type:act.dataset.act});return;}
 const inspect=e.target.closest('[data-inspect]');if(inspect&&!inspect.disabled){ui.inspect=inspect.dataset.inspect;ui.hover=null;inspectorSignature='';renderInspector();}
});
document.addEventListener('change',e=>{const element=e.target;if(element.matches('[data-gear]'))dispatch(element.dataset.gear==='weapon'?{type:'gear',id:element.dataset.id,weapon:element.value}:{type:'armor',id:element.dataset.id,armor:element.value});});
$('#commands').addEventListener('pointerover',e=>{const skill=e.target.closest('[data-skill]');if(skill)renderSkillDescription(skill.dataset.skill);});$('#commands').addEventListener('pointerleave',()=>renderSkillDescription());
$('.header-tools a').href=(/\/iron-company\//.test(document.baseURI)?'../research.html':'./research.html')+'?game=brothers&view=study#games';
if(location.port==='5215')$('.header-tools a').href='/research?game=brothers&view=study#games';
const canvas=$('#battlefield');let pointer=null;
canvas.addEventListener('pointerdown',e=>{if(e.button===2){ui.skill='move';renderCommands();return;}canvas.setPointerCapture(e.pointerId);pointer={x:e.clientX,y:e.clientY,pan:{...renderer.pan},dragged:false};});
canvas.addEventListener('pointermove',e=>{
 if(pointer&&(pointer.dragged||Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>7)){pointer.dragged=true;renderer.pan={x:pointer.pan.x+e.clientX-pointer.x,y:pointer.pan.y+e.clientY-pointer.y};return;}
 const rect=canvas.getBoundingClientRect(),cell=renderer.cellAt(e.clientX-rect.left,e.clientY-rect.top,state);if(cell?.q!==ui.hover?.q||cell?.r!==ui.hover?.r){ui.hover=cell;renderInspector();}
});
canvas.addEventListener('pointerup',e=>{
 if(!pointer)return;const drag=pointer.dragged;pointer=null;if(drag||state.phase!=='battle'||performance.now()<busyUntil)return;const actor=activeUnit(state);if(!actor||actor.side!=='ally'||actor.morale===-3)return;
 const rect=canvas.getBoundingClientRect(),cell=renderer.cellAt(e.clientX-rect.left,e.clientY-rect.top,state);if(!cell)return;const target=occupant(state,cell.q,cell.r);
 if(target){if(target.id!=='wagon'&&!canSee(state,target))return;
  if(target.side===actor.side&&ui.skill!=='bandage'){ui.inspect=target.id;ui.hover=cell;renderInspector();return;}
  const key=ui.skill==='move'?'strike':ui.skill,preview=attackPreview(state,actor,target,key);if(!preview.valid){toast(preview.reason||'这个目标不适用当前技能。');return;}ui.skill=key;dispatch({type:'skill',skill:key,target:target.id});
 }else if(ui.skill==='move'){const path=reachable(state,actor).find(p=>p.q===cell.q&&p.r===cell.r);if(!path){toast(TERRAIN[tileAt(state,cell).kind].cost>=90?'这块地形无法通行。':'这里无法在当前 AP 和疲劳余量内到达。');return;}dispatch({type:'move',...cell});}else{ui.skill='move';renderCommands();}
});
canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('pointerleave',()=>{if(!pointer){ui.hover=null;renderInspector();}});canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();renderer.zoom=Math.max(.65,Math.min(2.5,renderer.zoom-e.deltaY*.001));},{passive:false});
window.addEventListener('keydown',e=>{
 if(['SELECT','INPUT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape'){if($('dialog[open]')){$('dialog[open]').close();return;}ui.skill='move';ui.inspector=false;$('#inspector').classList.remove('open');renderCommands();renderInspector();return;}
 if(state.phase!=='battle'||$('dialog[open]')||e.repeat)return;const actor=activeUnit(state);
 if(e.key.toLowerCase()==='f'){uiAction('grid');return;}if(!actor||actor.side!=='ally'||actor.morale===-3||performance.now()<busyUntil)return;
 if(/^[1-5]$/.test(e.key)){const key=WEAPONS[actor.weapon].skills[Number(e.key)-1];if(key)chooseSkill(key);}
 if(e.key.toLowerCase()==='e'){e.preventDefault();dispatch({type:'end'});}if(e.key.toLowerCase()==='w'){e.preventDefault();dispatch({type:'wait'});}
});
window.addEventListener('pagehide',persist);window.addEventListener('blur',persist);
function sound(e){if(!ui.sound)return;try{
 audioContext ||=new (window.AudioContext||window.webkitAudioContext)();const ac=audioContext;if(ac.state==='suspended')ac.resume();const gain=ac.createGain(),now=ac.currentTime;gain.connect(ac.destination);gain.gain.setValueAtTime(.06,now);gain.gain.exponentialRampToValueAtTime(.001,now+.22);
 if(['hit','block','death'].includes(e.type)){const buffer=ac.createBuffer(1,ac.sampleRate*.16,ac.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const noise=ac.createBufferSource(),filter=ac.createBiquadFilter();noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=e.type==='block'?2300:750;noise.connect(filter);filter.connect(gain);noise.start(now);}
 const osc=ac.createOscillator();osc.type=e.type==='block'?'triangle':'sine';osc.frequency.setValueAtTime(e.type==='block'?820:e.type==='morale'?320:e.type==='stance'?430:125,now);osc.frequency.exponentialRampToValueAtTime(e.type==='block'?410:70,now+.2);osc.connect(gain);osc.start(now);osc.stop(now+.22);
 }catch{}}
function frame(timestamp){
 const dt=Math.min(.06,(timestamp-(lastFrame||timestamp))/1000);lastFrame=timestamp;
 if(!document.hidden){const wasBusy=ui.busy;ui.busy=timestamp<busyUntil;$('#game').classList.toggle('is-busy',ui.busy);
  if(state.phase==='prep')previewRenderer.draw(state,{...ui,inspect:null,hover:null,skill:'move'},dt);else if(state.phase==='battle'){renderer.draw(state,ui,dt);const actor=activeUnit(state);if(timestamp>=aiAt&&!ui.busy&&!$('dialog[open]')&&actor&&(actor.side==='enemy'||actor.morale===-3))dispatch({type:'ai'});}
  if(timestamp-lastSave>4000){persist();lastSave=timestamp;}
 }
 requestAnimationFrame(frame);
}
normalize();lastPhase=state.phase;renderHUD();persist();requestAnimationFrame(frame);
Promise.all([renderer.ready,previewRenderer.ready]).then(()=>{$('#loading').hidden=true;if(Object.keys(renderer.images).length<4)toast('部分画面素材未能载入，请刷新后重试。');});
