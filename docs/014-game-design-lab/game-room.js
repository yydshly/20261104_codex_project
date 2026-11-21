import { cardArtwork } from './card-art.js';
import { dungeonOverlayMarkup,dungeonControlsMarkup } from './dungeon-view.js';
import { RUN_CREATORS,RUN_ACTIONS,FARM,FACTORY,TOOL_NAMES,BUILD_TOOLS,RUN_CARDS,cardInfo,DUNGEON_SKILLS,dungeonSkillAllowed,CONTRACTS_V2,battleUnits,attackPreview,tickFarm,tickFactory } from './play-engine.js';
import { PlayRenderer,PLAY_ASSETS } from './play-renderer.js';
import { references } from './reference.js';
const html=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={spire:'尖塔 · 战士的短篇旅程',valley:'春日农场 · 从一袋种子开始',dungeon:'地牢 · 四人的归途',factory:'铁与齿轮 · 自动化工场',brothers:'佣兵团 · 荒原上的合同'};
const hints={spire:'点击攻击牌，再选择敌人；也可以把卡拖到敌人身上。',valley:'WASD / 方向键移动 · 1–7 切工具 · 空格使用 · E 交互 · 点击地块自动走近',dungeon:'看高亮角色轮到谁，选择技能，再点击角色或敌人；位置圆点表示射程。',factory:'点击或拖动铺设 · R 旋转 · 右键拆除 · 机械臂从背后取、向前方放',brothers:'先看当前队员，再选择绿色可达格；切换攻击后选择红色范围内的敌人。'};
const command=(cmd,label,disabled=false,extra='')=>`<button type="button" class="room-button" data-cmd="${cmd}" ${disabled?'disabled':''} ${extra}>${label}</button>`;
const stat=(label,value)=>`<div class="room-stat"><span>${label}</span><strong>${html(value)}</strong></div>`;
function toolIcon(key){
  const handle='<path d="m7 23 3 1L22 5l-3-2Z" fill="#a87840"/><path d="m7 23 2 0L20 5l-1-1Z" fill="#d2aa67"/>';
  const shapes={
    hoe:handle+'<path d="m15 3 3-2 10 5-1 4-5-2-1 4-4-2 2-5Z" fill="#bac8cc"/><path d="m22 8 5 2v3l-7-3Z" fill="#6b858f"/>',
    seed:'<path d="M8 5h17v22H7V8Z" fill="#bd9a61"/><path d="M8 5h17v5H7Z" fill="#eed29c"/><path d="M14 22v-8h3v8Z" fill="#5d8748"/><path d="M15 15h-5v-5h5Zm2-3h5v5h-5Z" fill="#93b361"/>',
    water:'<path d="M7 12h16v14H6Z" fill="#72a3b2"/><path d="M9 9h10v5H9Z" fill="#abc2c6"/><path d="m22 15 7-4 2 4-9 7Z" fill="#a4b9bd"/><path d="M3 13h5v11H3Z" fill="#4f798a"/><path d="M27 20h2v4h-2Zm3 3h2v3h-2Z" fill="#bbdded"/>',
    harvest:'<path d="M11 13h13v10h-4v5h-6v-4h-3Z" fill="#e4c294"/><path d="M15 14V7h-5V3h7v7h3V2h5v7h-5v5Z" fill="#80a84f"/>',
    axe:handle+'<path d="m15 3 5-2 10 6-3 7-9-4Z" fill="#ccd3cf"/><path d="m23 5 7 2-3 7-4-2Z" fill="#80939a"/>',
    pick:handle+'<path d="M8 4h14l9 9-2 2-8-6H10L2 15 1 12Z" fill="#aabdc1"/><path d="M9 4h15v3H9Z" fill="#e3e7d8"/>',
    sprinkler:'<path d="M14 7h4v19h-4Z" fill="#a3bec3"/><path d="M5 10h22v4H5Z" fill="#c6d3c9"/><path d="M10 24h13v5H8v-3Z" fill="#638e91"/><path d="M3 6h3v4H3Zm23 0h3v4h-3Z" fill="#8db8cb"/>'
  };
  return `<svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">${shapes[key]}</svg>`;
}
export class GameRoom{
  constructor(root){
    this.root=document.querySelector(root);this.states={};this.ui={selectedCard:null,skill:null,actor:null,mode:'move',hover:null,zoom:1};this.id=null;this.input={};this.last=0;this.lastHud=0;this.lastSave=0;this.aiAt=0;this.sound=false;this.fullscreen=false;this.dragging=false;this.lastPaint=null;this.notice='';this.speed=1;this.needsDraw=true;
    this.root.innerHTML=`<div class="game-room"><nav class="room-games" aria-label="切换试玩"><button type="button" data-game="dungeon">四人的归途</button><button type="button" data-game="spire">短篇尖塔</button><button type="button" data-game="valley">春日农场</button><button type="button" data-game="factory">自动化工场</button><button type="button" data-game="brothers">荒原佣兵</button></nav><details class="original-reference"><summary>原作实机对照与规则依据<span>看清参考了什么，再进入试玩</span></summary><div class="reference-body"></div></details><div class="room-heading"><div><span class="room-kicker">PLAY / FORM · 原创玩法样章</span><h3 class="room-name"></h3></div><div class="room-top-buttons">${command('sound','音效关闭')}${command('save','保存进度')}${command('export','导出存档')}${command('reset','重新开始')}${command('focus','研究笔记 · Esc')}</div></div><div class="room-stats"></div><div class="room-stage"><canvas class="play-canvas" tabindex="0" aria-label="游戏场景，点击进入操作"></canvas><div class="room-selection"></div><div class="chapter-overlay"></div><div class="room-objective"></div></div><div class="room-hint"></div><div class="live-notice" role="status"></div><div class="room-controls"></div><div class="touch-pad" aria-label="移动控制"><button type="button" data-direction="up" aria-label="向上">W</button><button type="button" data-direction="left" aria-label="向左">A</button><button type="button" data-direction="down" aria-label="向下">S</button><button type="button" data-direction="right" aria-label="向右">D</button>${command('farmUse','使用工具')}${command('interact','交互')}</div><div class="room-journal"><details><summary>行动记录</summary><ol class="room-log"></ol></details><span class="room-save-state">进度自动保存在本浏览器</span></div></div>`;
    this.box=this.root.querySelector('.game-room');this.canvas=this.root.querySelector('canvas');this.renderer=new PlayRenderer(this.canvas);this.box.style.setProperty('--character-atlas',`url("${PLAY_ASSETS.characters}")`);
    this.bind();this.frame=timestamp=>{this.update(timestamp);this.frameId=requestAnimationFrame(this.frame);};this.frameId=requestAnimationFrame(this.frame);
  }
  load(id){
    if(this.states[id])return this.states[id];let state=RUN_CREATORS[id]();
    try{const data=JSON.parse(localStorage.getItem(id==='dungeon'?`playform-run-v3-${id}`:`playform-run-v2-${id}`)||'null');if(data?.version===(id==='dungeon'?3:2)&&data.run?.kind===id&&typeof data.run.seed==='number'&&Array.isArray(data.run.events)&&JSON.stringify(data).length<500000){const run=data.run,valid=id==='valley'?run.player&&run.soil&&Array.isArray(run.trees):id==='factory'?run.entities&&run.items:id==='spire'?Array.isArray(run.deck)&&Array.isArray(run.hand):id==='dungeon'?Array.isArray(run.party)&&Array.isArray(run.queue):Array.isArray(run.roster)&&Array.isArray(run.queue);if(valid&&(id!=='dungeon'||run.chapter===3&&Array.isArray(run.path)&&Number.isInteger(run.stage)))state=run;}}
    catch{}this.states[id]=state;return state;
  }
  switch(id){
    if(this.id===id){this.hud();return;}this.persist();this.id=id;this.load(id);this.ui={selectedCard:null,skill:null,actor:null,mode:'move',hover:null,zoom:1};this.input={};this.box.dataset.kind=id;this.box.querySelectorAll('.room-games [data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===id)));this.box.querySelector('.room-name').textContent=names[id];this.box.querySelector('.room-hint').textContent=hints[id];this.canvas.setAttribute('aria-label',`${names[id]}。${hints[id]}`);this.root.querySelector('.touch-pad').hidden=id!=='valley';
    const r=references[id];this.needsDraw=true;this.box.querySelector('.reference-body').innerHTML=`<figure><img src="${r.image}" alt="${r.caption}" loading="lazy"><figcaption>${r.caption} · <a href="${r.source}" target="_blank" rel="noopener noreferrer">原作资料</a></figcaption></figure><div>${r.rules.map(([label,text])=>`<p><strong>${label}</strong>${text}</p>`).join('')}</div>`;
    const scope=document.querySelector('#lab-scope');if(scope)scope.textContent=r.scope;this.aiAt=performance.now()+700;this.renderer.fx=[];this.normalize();this.hud();this.renderer.resize();
  }
  reset(){if(!this.id)return;this.states[this.id]=RUN_CREATORS[this.id]();this.ui.selectedCard=null;this.ui.skill=null;this.ui.actor=null;this.input={};this.aiAt=performance.now()+900;this.renderer.fx=[];this.normalize();this.hud();this.persist();}
  normalize(){
    const s=this.states[this.id];if(!s)return;
    if(this.id==='dungeon'&&s.active!==this.ui.actor){this.ui.actor=s.active;const actor=s.party.find(p=>p.id===s.active);this.ui.skill=actor?.skills.find(k=>DUNGEON_SKILLS[k].from.includes(actor.rank))||actor?.skills[0]||null;}
  }
  act(a){
    if(this.id==='dungeon'&&['skill','move','pass','retreat'].includes(a.type)&&performance.now()<(this.busyUntil||0))return;
    const old=this.states[this.id],next=RUN_ACTIONS[this.id](old,a);this.states[this.id]=next;
    if(this.id==='spire'&&['card','reward','node','end'].includes(a.type))this.ui.selectedCard=null;
    this.normalize();if(next!==old){if(this.id==='dungeon'&&a.type==='skill')this.busyUntil=performance.now()+360;this.renderer.consume(next.events);for(const event of next.events||[])this.playSound(event.type);}this.aiAt=performance.now()+900;this.hud();this.persist();
  }
  persist(){if(!this.id||!this.states[this.id])return;try{localStorage.setItem(this.id==='dungeon'?`playform-run-v3-${this.id}`:`playform-run-v2-${this.id}`,JSON.stringify({version:this.id==='dungeon'?3:2,run:this.states[this.id]}));this.box.querySelector('.room-save-state').textContent='进度已保存在本浏览器';}catch{this.box.querySelector('.room-save-state').textContent='无法自动保存，可使用“导出存档”保留';}}
  update(timestamp){
    const dt=Math.min(.05,(timestamp-(this.last||timestamp))/1000);this.last=timestamp;if(!this.id)return;
    const rect=this.box.getBoundingClientRect(),visible=rect.bottom>0&&rect.top<innerHeight&&!document.hidden;
    let s=this.states[this.id];if(visible){
      if(this.id==='valley'){const before=s.revision;s=tickFarm(s,dt,this.input);this.states[this.id]=s;if(s.revision!==before){this.renderer.consume(s.events);for(const e of s.events)this.playSound(e.type);}}
      if(this.id==='factory')tickFactory(s,dt*this.speed);
      if(timestamp>=this.aiAt){const enemy=this.id==='spire'?s.phase==='enemy':this.id==='dungeon'?s.phase==='combat'&&s.active?.startsWith('foe'):this.id==='brothers'?s.phase==='battle'&&s.active?.startsWith('e'):false;if(enemy){this.act({type:'enemyStep'});s=this.states[this.id];}}
      if(timestamp-this.lastHud>240){this.hud(false);this.lastHud=timestamp;}if(timestamp-this.lastSave>3500){this.persist();this.lastSave=timestamp;}
    }
    if(visible||this.needsDraw){this.renderer.draw(this.id,s,this.ui,dt);this.needsDraw=false;}
  }
  setMotionPaused(value){this.renderer.reduced=value;}
  stats(){const s=this.states[this.id];if(this.id==='valley')return stat('日期',`春 ${s.day} 日`)+stat('金币',`${s.gold}g`)+stat('体力',`${s.energy}/270`)+stat('水量',`${s.water}/40`)+stat('种子',s.seeds)+stat('背包作物',s.parsnips)+stat('出货箱',s.shipping);if(this.id==='spire')return stat('生命',`${s.hp}/${s.maxHp}`)+stat('能量',`${s.energy}/3`)+stat('格挡',s.block)+stat('力量',s.strength)+stat('牌组',s.deck.length)+stat('金币',s.gold);if(this.id==='factory')return stat('开采矿石',s.oreMined)+stat('制成齿轮',s.gearsMade)+stat('入箱齿轮',`${s.delivered}/10`)+stat('煤炭',s.bag.coal)+stat('模拟时长',`${Math.floor(s.time)}s`);if(this.id==='dungeon')return stat('修道院',`${s.stage}/5`)+stat('回合',s.round)+stat('火光',s.torch)+stat('火把',s.torches)+stat('食物',s.food)+stat('战利品',s.loot);const actor=battleUnits(s).find(p=>p.id===s.active);return stat('金币',s.coins)+stat('口粮',s.food)+stat('合同',s.contracts)+stat('回合',s.round)+stat('当前',actor?.name||'营地')+stat('AP',actor?`${actor.ap}/9`:'—')+stat('疲劳',actor?`${actor.fatigue}/${actor.maxFatigue}`:'—');}
  hud(controls=true){
    if(!this.id)return;const s=this.states[this.id];const statsMarkup=this.stats();if(this.statsMarkup!==statsMarkup){this.box.querySelector('.room-stats').innerHTML=statsMarkup;this.statsMarkup=statsMarkup;}this.box.dataset.phase=s.phase;this.box.querySelector('.live-notice').textContent=s.notice;const overlay=this.box.querySelector('.chapter-overlay');const markup=this.id==='dungeon'?dungeonOverlayMarkup(s):'';if(this.overlayMarkup!==markup){overlay.innerHTML=markup;this.overlayMarkup=markup;}
    const objective=this.box.querySelector('.room-objective');const goals={spire:['本次旅程',`完成三节点 · 当前位置 ${Math.min(s.floor+(s.phase==='map'?1:0),3)}/3`,s.phase==='combat'?'敌人的意图显示在头顶，留下格挡应付下一次攻击。':'战后选牌、营火休息或升级，生命与牌组持续保留。'],valley:['春日的第一笔收入',s.totalSold?`已出货 ${s.totalSold} 株 · 收入 ${s.totalSold*35}g`:`已种 ${Object.values(s.soil||{}).filter(t=>t.crop).length} 株 · 背包 ${s.parsnips||0} 株`,s.totalSold?'第一笔收入达成。扩大种植，放置洒水器照料四邻格。':'开垦 → 播种 → 每天浇水 → 四夜成熟 → 出货并睡觉'],factory:['重启废弃工场',`交付齿轮 ${Math.min(s.delivered||0,10)} / 10`,(s.delivered||0)>=10?'订单已完成。继续扩建，尝试解决下一处堵塞。':'补齐橙色框的传送带，观察矿石 → 铁板 → 齿轮 → 箱子'],brothers:['养活你的佣兵团',`已完成 ${s.contracts||0} 份合同`,s.phase==='camp'?'选一份合同。检查金币、口粮与队员伤势，再决定出发。':'绿格移动，红格攻击；命中率、护甲与疲劳影响战局。']};const goal=goals[this.id];objective.innerHTML=goal?`<small>${goal[0]}</small><strong>${goal[1]}</strong><span>${goal[2]}</span>`:'';
    const notice=document.querySelector('#lab-notice');if(notice&&notice.textContent!==s.notice)notice.textContent=s.notice;
    const log=this.box.querySelector('.room-log');const logText=(s.log||[]).map(line=>`<li>${html(line)}</li>`).join('');if(log.innerHTML!==logText)log.innerHTML=logText;
    if(controls){const active=document.activeElement,focus=active&&this.box.contains(active)?active.getAttribute('data-focus'):null;this.box.querySelector('.room-controls').innerHTML=this.controls();if(focus)this.box.querySelector(`[data-focus="${focus}"]:not(:disabled)`)?.focus({preventScroll:true});}
    if(this.id==='factory'){
      const e=s.entities[s.selected],p=this.box.querySelector('.machine-inspector');if(p)p.innerHTML=e?`<strong>${BUILD_TOOLS[e.type]} · ${e.x},${e.y}</strong><span>${e.status} · 矿 ${e.inventory.ore} / 板 ${e.inventory.plate} / 齿轮 ${e.inventory.gear}${['furnace','generator'].includes(e.type)?` / 燃料 ${e.fuel.toFixed(1)}`:''}</span>`:'<strong>点设备查看库存和状态</strong><span>出口阻塞、缺料、缺燃料和缺电，会真实地停止加工。</span>';
    }
    this.box.querySelector('.room-selection').textContent=this.id==='spire'&&this.ui.selectedCard!==null?'选中攻击牌，请点击敌人':this.id==='dungeon'&&s.phase==='combat'?`${s.party.find(p=>p.id===s.active)?.name||'敌人'}的行动`:this.id==='valley'?TOOL_NAMES[s.tool]:this.id==='factory'?`${BUILD_TOOLS[s.tool]} · 朝${['右','下','左','上'][s.direction]}`:this.id==='brothers'&&s.phase==='battle'?(this.ui.mode==='move'?'移动模式':'攻击模式'):'';
  }
  cardButton(code,index,reward=false){
    const s=this.states.spire,c=cardInfo(code),selected=index===this.ui.selectedCard&&!reward,description=[c.damage?`造成 ${c.damage} 伤害`:'',c.block?`获得 ${c.block} 格挡`:'',c.vulnerable?`${c.vulnerable} 回合易伤`:'',c.draw?`抽 ${c.draw} 张牌`:'',c.strength?`力量 +${c.strength}`:'',c.duplicate?'复制加入弃牌堆':''].filter(Boolean).join('，');
    return `<button type="button" class="real-card ${c.type==='攻击'?'attack-card':c.type==='能力'?'power-card':'skill-card'} ${selected?'selected':''}" data-cmd="${reward?'reward':'card'}" ${reward?`data-card="${code}"`:`data-index="${index}" data-focus="card-${index}" draggable="true"`} ${!reward&&(s.phase!=='combat'||c.cost>s.energy)?'disabled':''}><span class="real-card-energy">${c.cost}</span><strong>${c.name}</strong><span class="card-art">${cardArtwork(code)}</span><small>${c.type}</small><p>${description}。</p></button>`;
  }
  controls(){
    const s=this.states[this.id];
    if(this.id==='valley')return `<div class="farm-hotbar">${Object.entries(TOOL_NAMES).map(([key,label],i)=>`<button type="button" data-cmd="tool" data-tool="${key}" aria-pressed="${s.tool===key}" title="快捷键 ${i+1}"><span class="pixel-tool tool-${key}">${toolIcon(key)}</span><small>${i+1} · ${label}</small></button>`).join('')}</div><div class="station-actions">${command('station','回屋休息',false,'data-station="home"')}${command('station','放入出货箱',false,'data-station="shipping"')}${command('station','商店买种子 · 20g',false,'data-station="shop"')}${command('station','去池塘装水',false,'data-station="water"')}<p>防风草：四天生长 · 基础售价 35g · 洒水器只浇四邻格</p></div>`;
    if(this.id==='spire'){
      if(s.phase==='map')return `<div class="map-choices"><p>第 ${s.floor+1} / 3 节点 · 选择路线</p>${s.floor===0?command('node','进入第一场战斗',false,'data-node="battle"'):s.floor===1?command('node','普通战斗 · 获得奖励',false,'data-node="battle"')+command('node','营火 · 休息或升级',false,'data-node="camp"')+command('node','精英战斗 · 更高风险',false,'data-node="elite"'):command('node','迎战石像首领',false,'data-node="boss"')}</div>`;
      if(s.phase==='camp')return `<div class="camp-choices"><p>休息恢复 24 点生命，或选择一张牌升级。</p>${command('rest','在营火休息')}<div class="upgrade-choices">${s.deck.map((code,index)=>code.endsWith('+')?'':command('upgrade',cardInfo(code).name+' 升级',false,`data-index="${index}"`)).join('')}</div></div>`;
      if(s.phase==='reward')return `<div class="reward-title">选择一张奖励牌，实际加入牌组</div><div class="real-hand reward-real-hand">${s.rewards.map((code,i)=>this.cardButton(code,i,true)).join('')}</div>${command('reward','跳过奖励',false,'data-card="skip"')}`;
      if(['lost','complete'].includes(s.phase))return `<div class="game-result"><h4>${s.phase==='complete'?'短篇爬塔完成':'本次旅程结束'}</h4><p>${html(s.notice)}</p>${command('reset','重新出发')}</div>`;
      return `<div class="real-hand">${s.hand.map((code,index)=>this.cardButton(code,index)).join('')}</div><div class="turn-controls"><span>抽牌堆 ${s.draw.length} · 弃牌堆 ${s.discard.length} · ${s.phase==='enemy'?'敌人逐个行动中':'选择卡牌，再指定目标'}</span><div class="target-strip">${s.enemies.filter(e=>e.hp>0).map(e=>command('target',`${e.kind==='slime'?'史莱姆':e.kind==='cultist'?'邪教徒':'守卫'} ${e.hp}`,s.phase!=='combat',`data-target="${e.id}"`)).join('')}</div>${command('end','结束回合',s.phase!=='combat')}</div>`;
    }
    if(this.id==='factory')return `<div class="factory-hotbar">${Object.entries(BUILD_TOOLS).map(([key,label])=>`<button type="button" data-cmd="tool" data-tool="${key}" aria-pressed="${s.tool===key}">${label}${s.parts[key]!==undefined?`<small>${s.parts[key]}</small>`:''}</button>`).join('')}</div><div class="factory-bottom"><div class="machine-inspector"></div><div>${command('rotate','旋转 · R')}${command('fuel','给选中设备加煤')}${command('speed',`模拟速度 ${this.speed}×`)}${command('run',s.running?'暂停模拟':'继续运行')}${command('demo','布置完整示例')}</div></div>`;
    if(this.id==='dungeon')return dungeonControlsMarkup(s,this.ui);
    if(s.phase==='lost')return `<div class="game-result"><h4>佣兵团解散</h4><p>${html(s.notice)}</p>${command('reset','重新组建')}</div>`;
    if(s.phase==='victory')return `<div class="game-result"><h4>战斗胜利 · 合同结算</h4><p>${html(s.notice)}</p>${command('claim','带幸存队员回营')}</div>`;
    if(s.phase==='camp')return `<div class="contract-selection">${CONTRACTS_V2.map(c=>`<button type="button" data-cmd="start" data-contract="${c.id}"><strong>${c.name}</strong><span>${c.enemies} 名敌人 · 报酬 ${c.pay}</span><small>进入战场后逐步决出结果</small></button>`).join('')}</div><div class="expedition-footer">${command('rest','营地休整 · 工资与口粮')}${command('hire','招募新兵 · 90g',s.coins<90||s.roster.filter(p=>!p.dead).length>=4)}<p>阵亡：${s.roster.filter(p=>p.dead).map(p=>p.name).join('、')||'暂无'}。战斗结果会保留到下一份合同。</p></div>`;
    const actor=battleUnits(s).find(p=>p.id===s.active),player=actor&&!actor.id.startsWith('e');
    return `<div class="tactical-toolbar"><div class="active-hero"><strong>${actor?.name||''} · ${player?'我方行动':'敌方行动'}</strong><span>${actor?`生命 ${actor.hp}/${actor.maxHp} · 护甲 ${actor.armour} · ${actor.role==='archer'?'弓：射程 5':actor.role==='spear'?'长矛：射程 2':'剑：射程 1'}`:''}</span></div>${command('mode','移动',!player,`data-mode="move" aria-pressed="${this.ui.mode==='move'}"`)}${command('mode','攻击',!player,`data-mode="attack" aria-pressed="${this.ui.mode==='attack'}"`)}${command('shield','盾墙 · 4 AP',!player||actor.ap<4)}${command('recover','恢复 · 9 AP',!player||actor.ap<9)}${command('wait','等待',!player)}${command('end','结束行动',!player)}${command('retreat','撤退')}</div><div class="target-strip">${s.enemies.filter(e=>!e.dead).map(e=>{const p=actor?attackPreview(s,actor,e):null;return command('target',`${e.name} · ${p?.chance||0}%`,!player||!p?.valid,`data-target="${e.id}"`);}).join('')}</div><p class="tactical-help">移动通常 2 AP / 4 疲劳，高地和灌木增加消耗。攻击消耗 4 或 6 AP / 12 疲劳；命中率受盾墙、包围、高低差与伤势影响。</p>`;
  }
  target(id){const s=this.states[this.id];if(this.id==='spire'&&this.ui.selectedCard!==null)this.act({type:'card',index:this.ui.selectedCard,target:id});else if(this.id==='dungeon'&&this.ui.skill)this.act({type:'skill',skill:this.ui.skill,target:id});else if(this.id==='brothers')this.act({type:'attack',target:id});}
  selectCard(index){const s=this.states.spire,code=s.hand[index];if(!code)return;const c=cardInfo(code);if(c.damage&&!c.all){this.ui.selectedCard=index;this.hud();}else this.act({type:'card',index});}
  coordinates(event){const r=this.canvas.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};}
  canvasAction(event,drag=false){
    const p=this.coordinates(event),s=this.states[this.id],hit=this.renderer.targetAt(p.x,p.y);
    if(this.id==='valley'){if(drag)return;const world=this.renderer.toWorld(p.x,p.y);this.act({type:'walk',x:Math.floor(world.x/FARM.tile),y:Math.floor(world.y/FARM.tile)});}
    else if(this.id==='factory'){const world=this.renderer.toWorld(p.x,p.y),x=Math.floor(world.x/FACTORY.tile),y=Math.floor(world.y/FACTORY.tile),key=`${x},${y}`;if(drag&&this.lastPaint===key)return;this.lastPaint=key;this.act({type:'place',x,y,erase:event.button===2});}
    else if(this.id==='brothers'){
      const hex=this.renderer.hexAt(p.x,p.y),onHex=hex?s.enemies.find(e=>!e.dead&&e.q===hex.q&&e.r===hex.r):null;
      if(this.ui.mode==='attack'&&hit?.id.startsWith('e'))this.target(hit.id);else if(onHex)this.target(onHex.id);else if(hex&&this.ui.mode==='move')this.act({type:'move',...hex});
    }else if(hit)this.target(hit.id);
  }
  handle(commandElement){
    const cmd=commandElement.dataset.cmd;if(commandElement.disabled)return;
    if(cmd==='focus'){this.setFocused(!this.fullscreen);return;}
    if(cmd==='sound'){this.sound=!this.sound;commandElement.textContent=this.sound?'音效开启':'音效关闭';if(this.sound)this.playSound('seed');return;}
    if(cmd==='speed'){this.speed=this.speed===1?2:this.speed===2?4:1;this.hud();return;}
    if(cmd==='save'){this.persist();return;}
    if(cmd==='export'){this.persist();const blob=new Blob([JSON.stringify({version:this.id==='dungeon'?3:2,run:this.states[this.id]},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`playform-${this.id}-save.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
    if(cmd==='reset'){this.reset();return;}
    if(cmd==='card'){this.selectCard(Number(commandElement.dataset.index));return;}
    if(cmd==='skill'){this.ui.skill=commandElement.dataset.skill;this.hud();return;}
    if(cmd==='mode'){this.ui.mode=commandElement.dataset.mode;this.hud();return;}
    if(cmd==='target'){this.target(commandElement.dataset.target);return;}
    if(cmd==='rank'){this.act({type:'move',direction:Number(commandElement.dataset.direction)});return;}
    if(cmd==='farmUse'){this.act({type:'use'});return;}
    this.act({type:cmd,tool:commandElement.dataset.tool,node:commandElement.dataset.node,card:commandElement.dataset.card,index:Number(commandElement.dataset.index),station:commandElement.dataset.station,contract:commandElement.dataset.contract});
  }
  setFocused(value){this.fullscreen=value;this.box.classList.toggle('focused-game',value);document.body.classList.toggle('game-focused',value);this.box.querySelector('[data-cmd="focus"]').textContent=value?'研究笔记 · Esc':'返回游戏';document.querySelectorAll('#top,#games,#workbench,#sources,.site-header,.site-footer,.skip-link,.lab-toolbar,.lab-bottom,.learning-note,.lab-section .section-heading').forEach(e=>e.inert=value);if(!value){document.querySelector('#games').scrollIntoView({behavior:'instant'});document.querySelector('#tab-mechanics').focus({preventScroll:true});}requestAnimationFrame(()=>this.renderer.resize());}
  bind(){
    this.box.addEventListener('click',event=>{const button=event.target.closest('[data-cmd]');if(button){event.stopPropagation();this.handle(button);}});
    this.canvas.addEventListener('pointerdown',event=>{this.canvas.focus({preventScroll:true});this.dragging=true;this.lastPaint=null;this.canvasAction(event);if(this.id==='factory')this.canvas.setPointerCapture(event.pointerId);});
    this.canvas.addEventListener('pointermove',event=>{const p=this.coordinates(event);if(this.id==='valley'||this.id==='factory'){const world=this.renderer.toWorld(p.x,p.y),t=this.id==='valley'?FARM.tile:FACTORY.tile;this.ui.hover={x:Math.floor(world.x/t),y:Math.floor(world.y/t)};}else if(this.id==='brothers')this.ui.hover=this.renderer.hexAt(p.x,p.y);else this.ui.hover=this.renderer.targetAt(p.x,p.y);if(this.dragging&&this.id==='factory')this.canvasAction(event,true);});
    window.addEventListener('pointerup',()=>{this.dragging=false;this.lastPaint=null;this.input={};});this.canvas.addEventListener('pointerleave',()=>this.ui.hover=null);this.canvas.addEventListener('contextmenu',event=>event.preventDefault());
    this.box.addEventListener('dragstart',event=>{const card=event.target.closest('[data-cmd="card"]');if(card){this.ui.selectedCard=Number(card.dataset.index);event.dataTransfer.setData('text/plain',card.dataset.index);}});this.canvas.addEventListener('dragover',event=>{if(this.id==='spire')event.preventDefault();});this.canvas.addEventListener('drop',event=>{event.preventDefault();if(this.id==='spire'){const p=this.coordinates(event),hit=this.renderer.targetAt(p.x,p.y);if(hit)this.target(hit.id);}});
    const keyDirections={w:'up',ArrowUp:'up',a:'left',ArrowLeft:'left',s:'down',ArrowDown:'down',d:'right',ArrowRight:'right'};
    window.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.fullscreen){this.handle(this.box.querySelector('[data-cmd="focus"]'));return;}if(!this.id||(!this.fullscreen&&!this.box.contains(document.activeElement))||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
      if(this.id==='valley'&&keyDirections[event.key]){event.preventDefault();this.input[keyDirections[event.key]]=true;return;}
      if(event.repeat)return;if(this.id==='valley'){if(/^[1-7]$/.test(event.key)){this.act({type:'tool',tool:Object.keys(TOOL_NAMES)[Number(event.key)-1]});}if(event.code==='Space'){event.preventDefault();this.act({type:'use'});}if(event.key.toLowerCase()==='e')this.act({type:'interact'});}
      if(this.id==='dungeon'&&/^[1-3]$/.test(event.key)){const actor=this.states.dungeon.party.find(p=>p.id===this.states.dungeon.active),skill=actor?.skills[Number(event.key)-1];if(skill){this.ui.skill=skill;this.hud();}return;}
      if(this.id==='factory'&&event.key.toLowerCase()==='r'){event.preventDefault();this.act({type:'rotate'});}if(this.id==='spire'&&/^[1-9]$/.test(event.key))this.selectCard(Number(event.key)-1);
    });
    window.addEventListener('keyup',event=>{if(keyDirections[event.key])this.input[keyDirections[event.key]]=false;});window.addEventListener('blur',()=>{this.input={};this.persist();});window.addEventListener('pagehide',()=>this.persist());
    for(const button of this.root.querySelectorAll('[data-direction]')){if(button.dataset.cmd)continue;button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);this.input[button.dataset.direction]=true;});button.addEventListener('pointerup',()=>this.input={});button.addEventListener('pointercancel',()=>this.input={});}
  }
  playSound(type){if(!this.sound)return;try{this.audio ||= new (window.AudioContext||window.webkitAudioContext)();if(this.audio.state==='suspended')this.audio.resume();const context=this.audio,gain=context.createGain(),osc=context.createOscillator(),start=context.currentTime;gain.gain.setValueAtTime(.045,start);gain.gain.exponentialRampToValueAtTime(.001,start+.18);gain.connect(context.destination);osc.connect(gain);osc.type=['playerAttack','enemyAttack','chop'].includes(type)?'triangle':'sine';osc.frequency.setValueAtTime(type==='water'?760:type==='harvest'?640:type==='coin'?880:type==='heal'?540:170,start);osc.frequency.exponentialRampToValueAtTime(type==='harvest'?960:70,start+.17);osc.start(start);osc.stop(start+.2);}catch{}}
}
