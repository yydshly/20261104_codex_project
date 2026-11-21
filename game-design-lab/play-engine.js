// Spatial, turn-based rules for the second version of the playable studies.
// References and deliberate scale changes live in reference.js.
export const FARM = {
  width: 36, height: 23, tile: 32,
  trees: [[2,11],[4,15],[19,10],[21,15],[29,17],[32,11],[17,19],[3,20],[25,20],[30,2]],
  rocks: [[5,12],[18,12],[20,19],[26,16],[13,18]],
  stations: { home:{x:6,y:7}, shipping:{x:11,y:6}, shop:{x:16,y:6}, water:{x:25,y:9} }
};
export const TOOL_NAMES = { hoe:'锄头',seed:'防风草种子',water:'浇水壶',harvest:'收获',axe:'斧头',pick:'镐子',sprinkler:'洒水器' };
const copy = s => structuredClone(s);
const bounded = (n,lo,hi) => Math.max(lo,Math.min(hi,n));
const keyOf = (x,y) => `${x},${y}`;
export function roll(s) { s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0; return s.seed/4294967296; }
function integer(s,min,max) { return min+Math.floor(roll(s)*(max-min+1)); }
function say(s,message) { s.notice=message; s.log=[message,...(s.log||[])].slice(0,8); }
function effect(s,type,details={}) { s.events.push({type,...details}); }
function actionState(s) { const next=copy(s);next.events=[];next.revision=(s.revision||0)+1;return next; }
function shuffleRun(values,s) { const items=[...values];for(let i=items.length-1;i>0;i--){const j=integer(s,0,i);[items[i],items[j]]=[items[j],items[i]];}return items; }

// FARM: walkable tile world, facing tools, watering and four-night crop growth.
export function farmBlocked(s,x,y) {
  if(x<0||y<0||x>=FARM.width||y>=FARM.height)return true;
  if(x>=25&&x<=34&&y>=3&&y<=8)return true;
  if(x>=3&&x<=9&&y>=2&&y<=6)return true;
  if(x>=14&&x<=18&&y>=2&&y<=5)return true;
  return s.trees.some(p=>p[0]===x&&p[1]===y)||s.rocks.some(p=>p[0]===x&&p[1]===y);
}
export function farmPath(s,tx,ty,adjacent=false) {
  const sx=Math.floor(s.player.x),sy=Math.floor(s.player.y), queue=[[sx,sy]], seen=new Set([keyOf(sx,sy)]),prev=new Map();
  let found=null;
  for(let cursor=0;cursor<queue.length;cursor++){
    const [x,y]=queue[cursor];
    if(adjacent?Math.abs(x-tx)+Math.abs(y-ty)<=1:x===tx&&y===ty){found=[x,y];break;}
    for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
      const nx=x+dx,ny=y+dy,k=keyOf(nx,ny);
      if(seen.has(k)||farmBlocked(s,nx,ny))continue;
      seen.add(k);prev.set(k,[x,y]);queue.push([nx,ny]);
    }
  }
  if(!found)return null;
  const path=[];let cell=found;
  while(cell[0]!==sx||cell[1]!==sy){path.unshift({x:cell[0]+.5,y:cell[1]+.5});cell=prev.get(keyOf(...cell));}
  return path;
}
export function createFarmRun() {
  return {kind:'valley',seed:141,revision:0,events:[],log:[],day:1,time:360,energy:270,water:40,gold:500,seeds:15,parsnips:0,harvested:0,shipping:0,totalSold:0,wood:0,stone:0,sprinklers:1,weather:'晴',soil:{},placed:[],trees:copy(FARM.trees),rocks:copy(FARM.rocks),treeHits:{},player:{x:8.5,y:9.5,face:2,walk:0},path:[],pending:null,tool:'hoe',notice:'WASD 移动；选择锄头，在面前开垦。也可点击地面，人物会走近后使用工具。'};
}
function farmStation(s,station) {
  if(station==='home'){
    const income=s.shipping*35;s.gold+=income;s.totalSold+=s.shipping;s.shipping=0;
    for(const [key,soil] of Object.entries(s.soil)){
      if(soil.crop&&soil.watered)soil.growth=Math.min(4,soil.growth+1);
      soil.watered=false;
    }
    s.day++;s.time=360;s.energy=270;s.weather=[3,7,11].includes(s.day)?'雨':'晴';
    for(const [key,soil] of Object.entries(s.soil)){
      const [x,y]=key.split(',').map(Number);
      soil.watered=s.weather==='雨'||s.placed.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1);
    }
    effect(s,'daybreak');say(s,`春 ${s.day} 日，${s.weather}。${income?`昨夜出货收入 ${income}g。`:''}防风草需要四个得到浇水的夜晚成熟。`);
  } else if(station==='shipping') {
    if(!s.parsnips){say(s,'背包里还没有可出货的防风草。成熟后先收获，再放入出货箱。');return;}
    s.shipping+=s.parsnips;s.parsnips=0;say(s,`已放入出货箱，今晚休息后按每株 35g 结算。箱中 ${s.shipping} 株。`);effect(s,'coin');
  } else if(station==='shop') {
    if(s.gold<20){say(s,'一袋防风草种子售价 20g，金币不足。');return;}
    s.gold-=20;s.seeds++;say(s,'购买 1 袋防风草种子，花费 20g。');effect(s,'coin');
  } else if(station==='water') {s.water=40;say(s,'在池塘装满了浇水壶，可以使用 40 次。');effect(s,'water');}
}
function useFarmTool(s,x,y) {
  const key=keyOf(x,y),soil=s.soil[key];
  if(Math.hypot(s.player.x-(x+.5),s.player.y-(y+.5))>1.75){say(s,'走近目标后才能使用工具。');return;}
  s.player.face=Math.abs(x+.5-s.player.x)>Math.abs(y+.5-s.player.y)?(x+.5>s.player.x?1:3):(y+.5>s.player.y?2:0);
  if(s.tool==='axe'||s.tool==='pick'){
    const list=s.tool==='axe'?s.trees:s.rocks,index=list.findIndex(p=>p[0]===x&&p[1]===y);
    if(index<0){say(s,'当前工具只能清理对应的树木或石块。');return;}
    if(s.energy<2){say(s,'体力不足，回屋休息后再来。');return;}
    s.energy-=2;s.treeHits[key]=(s.treeHits[key]||0)+1;effect(s,'chop',{x,y});
    if(s.treeHits[key]>=(s.tool==='axe'?3:2)){list.splice(index,1);if(s.tool==='axe')s.wood+=8;else s.stone+=4;say(s,s.tool==='axe'?'树木倒下，获得 8 木材，原位置可以通行。':'石块已清理，获得 4 石料。');}else say(s,'工具击中了目标，再使用几次即可清理。');return;
  }
  if(farmBlocked(s,x,y)){say(s,'这里不能耕作。池塘可以用来装水，房屋门口可以休息。');return;}
  if(s.placed.some(p=>p.x===x&&p.y===y)){say(s,'这块地上放置了洒水器。');return;}
  if(s.tool==='hoe'){
    if(soil){say(s,'这块地已经开垦。');return;}if(s.energy<2){say(s,'体力不足。');return;}
    s.energy-=2;s.soil[key]={crop:null,growth:0,watered:false};say(s,'翻开了土地。切换种子播种，再用浇水壶照料。');effect(s,'hoe',{x,y});
  } else if(s.tool==='seed'){
    if(!soil){say(s,'先用锄头开垦这块地。');return;}if(soil.crop){say(s,'这块地已经种下作物。');return;}if(!s.seeds){say(s,'种子用完了，可以去商店购买。');return;}
    s.seeds--;soil.crop='parsnip';soil.growth=0;if(s.weather==='雨')soil.watered=true;say(s,'种下防风草，不消耗体力。每日浇水，四天后收获。');effect(s,'seed',{x,y});
  } else if(s.tool==='water'){
    if(!soil){say(s,'这块地还没有开垦。');return;}if(soil.watered){say(s,'今天已经浇过水。');return;}if(s.water<1||s.energy<2){say(s,s.water<1?'浇水壶空了，去池塘边装水。':'体力不足，回屋休息。');return;}
    soil.watered=true;s.water--;s.energy-=2;effect(s,'water',{x,y});say(s,'土地湿润了。没有浇水的作物会暂停生长。');
  } else if(s.tool==='harvest'){
    if(!soil?.crop||soil.growth<4){say(s,'只有成熟作物才能收获，防风草需要四个浇水的夜晚。');return;}
    s.parsnips++;s.harvested++;soil.crop=null;soil.growth=0;effect(s,'harvest',{x,y});say(s,'收获 1 株防风草！带到出货箱，次日获得 35g。');
  } else if(s.tool==='sprinkler'){
    if(!s.sprinklers){say(s,'研究补给中的洒水器已用完。');return;}if(soil?.crop){say(s,'先选择没有作物的位置。');return;}
    s.sprinklers--;s.placed.push({x,y});say(s,'放置基础洒水器，每天早晨浇灌上下左右四格。');effect(s,'build',{x,y});
  }
}
export function farmRunAction(current,a) {
  const s=actionState(current);
  if(a.type==='tool'&&Object.hasOwn(TOOL_NAMES,a.tool)){s.tool=a.tool;return s;}
  if(a.type==='use'){const dirs=[[0,-1],[1,0],[0,1],[-1,0]],d=dirs[s.player.face];useFarmTool(s,a.x??Math.floor(s.player.x)+d[0],a.y??Math.floor(s.player.y)+d[1]);return s;}
  if(a.type==='interact'){
    const near=Object.entries(FARM.stations).find(([,p])=>Math.hypot(p.x+.5-s.player.x,p.y+.5-s.player.y)<2.2);
    if(near)farmStation(s,near[0]);else say(s,'走到房门、出货箱、商店或池塘标记旁，再按 E 交互。');return s;
  }
  if(a.type==='station'||a.type==='walk'){
    const target=a.type==='station'?FARM.stations[a.station]:{x:a.x,y:a.y};if(!target)return current;
    const path=farmPath(s,target.x,target.y,a.type==='walk');
    if(!path){say(s,'道路被树木、石块或水面挡住了。');return s;}
    s.path=path;s.pending=a.type==='station'?{station:a.station}:{x:a.x,y:a.y};
    if(!path.length){if(s.pending.station)farmStation(s,s.pending.station);else useFarmTool(s,a.x,a.y);s.pending=null;}
  }
  return s;
}
export function tickFarm(current,dt,input={}) {
  const s={...current,player:{...current.player},path:[...current.path],events:[]};
  dt=Math.min(dt,.05);s.time+=dt*(10/7);
  let dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);
  if(dx||dy){s.path=[];s.pending=null;const norm=Math.hypot(dx,dy);dx/=norm;dy/=norm;}
  else if(s.path.length){const p=s.path[0],dist=Math.hypot(p.x-s.player.x,p.y-s.player.y);if(dist<dt*3.3){s.player.x=p.x;s.player.y=p.y;s.path.shift();}else {dx=(p.x-s.player.x)/dist;dy=(p.y-s.player.y)/dist;}}
  if(dx||dy){
    s.player.face=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);s.player.walk+=dt*9;
    const nx=s.player.x+dx*dt*3.3,ny=s.player.y+dy*dt*3.3;
    if(!farmBlocked(s,Math.floor(nx),Math.floor(s.player.y)))s.player.x=nx;
    if(!farmBlocked(s,Math.floor(s.player.x),Math.floor(ny)))s.player.y=ny;
  }
  if(!s.path.length&&s.pending){const pending=s.pending;s.pending=null;const next=actionState(s);if(pending.station)farmStation(next,pending.station);else useFarmTool(next,pending.x,pending.y);return next;}
  if(s.time>=1560){const next=actionState(s);farmStation(next,'home');next.gold=Math.max(0,next.gold-100);say(next,'凌晨 2 点仍未休息，已被送回家并支付 100g；新的一天开始。');return next;}
  return s;
}

// CARD COMBAT: target selection, intentions, vulnerability, draw/discard, map and camp.
export const RUN_CARDS={
  strike:{name:'打击',cost:1,damage:6,upgrade:3,type:'攻击',text:'造成 6 点伤害。'},
  defend:{name:'防御',cost:1,block:5,upgrade:3,type:'技能',text:'获得 5 点格挡。'},
  bash:{name:'痛击',cost:2,damage:8,upgrade:2,vulnerable:2,type:'攻击',text:'造成 8 点伤害，施加 2 回合易伤。'},
  pommel:{name:'剑柄打击',cost:1,damage:9,upgrade:1,draw:1,type:'攻击',text:'造成 9 点伤害，抽 1 张牌。'},
  shrug:{name:'耸肩无视',cost:1,block:8,upgrade:3,draw:1,type:'技能',text:'获得 8 点格挡，抽 1 张牌。'},
  cleave:{name:'顺劈斩',cost:1,damage:8,upgrade:3,all:true,type:'攻击',text:'对所有敌人造成 8 点伤害。'},
  inflame:{name:'燃烧',cost:1,strength:2,upgrade:1,type:'能力',text:'本场战斗获得 2 点力量。'},
  anger:{name:'愤怒',cost:0,damage:6,upgrade:2,duplicate:true,type:'攻击',text:'造成 6 点伤害，将一张复制加入弃牌堆。'},
  ironwave:{name:'铁斩波',cost:1,damage:5,block:5,upgrade:2,type:'攻击',text:'获得 5 格挡，造成 5 伤害。'}
};
export function cardInfo(code) {const upgraded=code.endsWith('+'),key=code.replace('+',''),base=RUN_CARDS[key];return {...base,key,upgraded,name:base.name+(upgraded?'+':''),damage:base.damage?base.damage+(upgraded?base.upgrade:0):0,block:base.block?base.block+(upgraded?base.upgrade:0):0,strength:base.strength?base.strength+(upgraded?1:0):0,vulnerable:base.vulnerable?base.vulnerable+(upgraded?1:0):0};}
function runDraw(s,n) {for(let i=0;i<n;i++){if(!s.draw.length&&s.discard.length){s.draw=shuffleRun(s.discard,s);s.discard=[];}if(s.draw.length)s.hand.push(s.draw.shift());}}
export function spireIntent(s,e) {
  if(e.kind==='cultist'&&s.turn===1)return {type:'buff',amount:3,label:'仪式：每回合力量 +3'};
  if(e.kind==='guardian'&&s.turn%3===0)return {type:'defend',amount:14,label:'防御：14 格挡'};
  const amount=(e.kind==='slime'?5:e.kind==='cultist'?6:12)+(e.strength||0);
  return {type:'attack',amount,label:`攻击 ${amount}${e.kind==='guardian'?' ×1':''}`};
}
export function createSpireRun(){return {kind:'spire',seed:176,revision:0,events:[],log:[],phase:'map',floor:0,hp:80,maxHp:80,gold:99,block:0,strength:0,energy:3,turn:1,deck:[...Array(5).fill('strike'),...Array(4).fill('defend'),'bash'],draw:[],discard:[],exhaust:[],hand:[],enemies:[],rewards:[],notice:'选择地图节点进入战斗。攻击牌先选中，再点击敌人；技能牌直接使用。'};}
function startSpireFight(s,elite=false){
  s.phase='combat';s.energy=3;s.block=0;s.strength=0;s.turn=1;s.enemyIndex=0;s.discard=[];s.exhaust=[];s.hand=[];s.draw=shuffleRun(s.deck,s);
  const enemy=(id,kind,hp)=>({id,kind,hp,maxHp:hp,block:0,strength:0,vulnerable:0,ritual:0});
  s.enemies=s.floor===3?[enemy('guardian','guardian',74)]:elite?[enemy('guardian','guardian',58)]:s.floor===1?[enemy('slime-a','slime',22),enemy('slime-b','slime',18)]:[enemy('cultist','cultist',48)];
  runDraw(s,5);say(s,'观察每个敌人的意图，再决定攻守顺序。易伤会让受到的攻击伤害提高 50%。');
}
function spireWin(s){s.hp=Math.min(s.maxHp,s.hp+6);s.gold+=20+integer(s,0,10);s.phase=s.floor>=3?'complete':'reward';s.rewards=shuffleRun(['pommel','shrug','cleave','inflame','anger','ironwave'],s).slice(0,3);say(s,s.phase==='complete'?'守卫倒下，短篇爬塔完成！燃烧之血恢复 6 点生命。':'战斗胜利，燃烧之血恢复 6 点生命。选择一张奖励牌，或跳过保持牌组精简。');effect(s,'victory');}
export function spireRunAction(current,a){
  const s=actionState(current);
  if(a.type==='node'&&s.phase==='map'){
    s.floor++;
    if(a.node==='camp'&&s.floor===2){s.phase='camp';say(s,'营火：休息恢复 30% 最大生命，或锻造升级一张牌。');}else startSpireFight(s,a.node==='elite');return s;
  }
  if(s.phase==='camp'){
    if(a.type==='rest'){const heal=Math.floor(s.maxHp*.3);s.hp=Math.min(s.maxHp,s.hp+heal);s.phase='map';say(s,`休息恢复 ${heal} 生命，选择最后的首领节点。`);}
    if(a.type==='upgrade'&&s.deck[a.index]&&!s.deck[a.index].endsWith('+')){s.deck[a.index]+='+';s.phase='map';say(s,'卡牌已升级，进入牌组；下一场战斗会真正抽到升级版本。');}return s;
  }
  if(s.phase==='reward'&&a.type==='reward'){
    if(a.card!=='skip'&&!s.rewards.includes(a.card))return current;if(a.card!=='skip')s.deck.push(a.card);s.phase='map';say(s,'奖励已处理。选择下一条路线，牌组与生命会持续保留。');return s;
  }
  if(s.phase==='enemy'&&a.type==='enemyStep'){
    const enemy=s.enemies[s.enemyIndex++];
    if(enemy&&enemy.hp>0){
      enemy.block=0;const intent=spireIntent(s,enemy);
      if(intent.type==='buff'){enemy.ritual=3;say(s,'邪教徒开启仪式，之后每个回合都会增加力量。');effect(s,'buff',{target:enemy.id});}
      else if(intent.type==='defend'){enemy.block=intent.amount;say(s,'石像守卫摆出防御姿态，获得 14 格挡。');}
      else {const damage=Math.max(0,intent.amount-s.block);s.block=Math.max(0,s.block-intent.amount);s.hp=Math.max(0,s.hp-damage);effect(s,'enemyAttack',{source:enemy.id,target:'player',amount:damage});say(s,`敌人攻击 ${intent.amount}，你实际失去 ${damage} 生命。`);}
      enemy.strength+=enemy.ritual;if(enemy.vulnerable>0)enemy.vulnerable--;
    }
    if(s.hp<=0){s.phase='lost';say(s,'旅者倒下。重新出发时，尝试先处理正在准备高伤害的敌人。');}
    else if(s.enemyIndex>=s.enemies.length){s.phase='combat';s.turn++;s.energy=3;s.block=0;s.hand=[];runDraw(s,5);}
    return s;
  }
  if(s.phase!=='combat')return current;
  if(a.type==='end'){s.discard.push(...s.hand);s.hand=[];s.phase='enemy';s.enemyIndex=0;say(s,'敌方开始行动。未使用的手牌进入弃牌堆。');return s;}
  if(a.type==='card'){
    const code=s.hand[a.index];if(!code)return current;const c=cardInfo(code);if(c.cost>s.energy){say(s,'能量不足。');return s;}
    const target=s.enemies.find(e=>e.id===a.target&&e.hp>0);
    if(c.damage&&!c.all&&!target){say(s,'请点击仍然存活的敌人作为攻击目标。');return s;}
    s.energy-=c.cost;s.hand.splice(a.index,1);s.block+=c.block;s.strength+=c.strength;
    if(c.damage){
      for(const e of c.all?s.enemies.filter(e=>e.hp>0):[target]){const damage=Math.floor((c.damage+s.strength)*(e.vulnerable>0?1.5:1)),loss=Math.max(0,damage-e.block);e.block=Math.max(0,e.block-damage);e.hp=Math.max(0,e.hp-loss);e.vulnerable+=c.vulnerable||0;effect(s,'playerAttack',{source:'player',target:e.id,amount:loss});}
    }
    if(c.type!=='能力')s.discard.push(code);if(c.duplicate)s.discard.push(code);runDraw(s,c.draw||0);
    say(s,`使用「${c.name}」${c.block?`，格挡 +${c.block}`:''}${c.strength?`，力量 +${c.strength}`:''}${c.draw?`，抽 ${c.draw} 张牌`:''}。`);
    if(s.enemies.every(e=>e.hp===0))spireWin(s);
  }
  return s;
}

// FACTORY: adjacency, belts with real items, pickup/drop inserters, power and buffers.
export const FACTORY={width:22,height:12,tile:46};
export const BUILD_TOOLS={select:'选择',belt:'传送带',inserter:'机械臂',drill:'采矿机',furnace:'石炉',assembler:'组装机',pole:'电线杆',generator:'蒸汽机',chest:'箱子',erase:'拆除'};
export const DIRECTIONS=[[1,0],[0,1],[-1,0],[0,-1]];
export function entityAt(s,x,y){return s.entities[keyOf(x,y)];}
function machine(type,x,y,dir=0){return {type,x,y,dir,progress:0,inventory:{ore:0,plate:0,gear:0,coal:0},fuel:0,status:'等待',flash:0};}
export function createFactoryRun(){
  const s={kind:'factory',seed:214,revision:0,events:[],log:[],time:0,running:true,tool:'belt',direction:0,selected:null,entities:{},items:{},oreMined:0,gearsMade:0,delivered:0,parts:{belt:60,inserter:12,drill:3,furnace:3,assembler:3,pole:8,generator:2,chest:5},bag:{ore:0,plate:0,gear:0,coal:40},notice:'初始产线在橙色框处缺一段传送带。选传送带点击补齐，矿石才能真正送到石炉。'};
  const add=(type,x,y,dir=0)=>s.entities[keyOf(x,y)]=machine(type,x,y,dir);
  add('drill',2,5);for(const x of [3,4,6,10,11,12,16,17])add('belt',x,5);
  add('inserter',7,5);add('furnace',8,5);s.entities['8,5'].fuel=12;
  add('inserter',9,5);add('inserter',13,5);add('assembler',14,5);add('inserter',15,5);add('inserter',18,5);add('chest',19,5);
  add('generator',9,2);s.entities['9,2'].fuel=60;for(const x of [3,11,17])add('pole',x,3);
  return s;
}
export function factoryPower(s){
  const generators=Object.values(s.entities).filter(e=>e.type==='generator'&&e.fuel>0),poles=Object.values(s.entities).filter(e=>e.type==='pole'),powered=new Set(generators.map(e=>keyOf(e.x,e.y)));
  let changed=true;while(changed){changed=false;for(const p of poles){const key=keyOf(p.x,p.y);if(powered.has(key))continue;if([...generators,...poles.filter(q=>powered.has(keyOf(q.x,q.y)))].some(q=>Math.hypot(q.x-p.x,q.y-p.y)<=9)){powered.add(key);changed=true;}}}
  return e=>generators.some(g=>Math.hypot(e.x-g.x,e.y-g.y)<=6)||poles.some(p=>powered.has(keyOf(p.x,p.y))&&Math.hypot(e.x-p.x,e.y-p.y)<=5);
}
function outputKind(e){return e.type==='drill'?'ore':e.type==='furnace'?'plate':e.type==='assembler'?'gear':null;}
function takeItem(s,x,y){
  const key=keyOf(x,y),e=s.entities[key];if(!e)return null;
  if(e.type==='belt'&&s.items[key]&&s.items[key].progress>=.55){const item=s.items[key].kind;delete s.items[key];return item;}
  const kind=outputKind(e);if(kind&&e.inventory[kind]>0){e.inventory[kind]--;return kind;}return null;
}
function canTake(s,x,y){const e=entityAt(s,x,y);if(!e)return false;if(e.type==='belt')return Boolean(s.items[keyOf(x,y)]?.progress>=.55);const k=outputKind(e);return Boolean(k&&e.inventory[k]>0);}
function peekItem(s,x,y){const e=entityAt(s,x,y);return e?.type==='belt'?s.items[keyOf(x,y)]?.kind:outputKind(e||{});}
function accepts(s,x,y,kind){const e=entityAt(s,x,y);if(!e)return false;if(e.type==='belt')return !s.items[keyOf(x,y)];if(e.type==='chest')return true;if(e.type==='furnace')return kind==='ore'&&e.inventory.ore<8;if(e.type==='assembler')return kind==='plate'&&e.inventory.plate<12;return false;}
function putItem(s,x,y,kind){const e=entityAt(s,x,y);if(e.type==='belt')s.items[keyOf(x,y)]={kind,progress:0};else {e.inventory[kind]++;if(e.type==='chest'&&kind==='gear')s.delivered++;}}
export function factoryRunAction(current,a){
  const s=actionState(current);
  if(a.type==='tool'&&Object.hasOwn(BUILD_TOOLS,a.tool)){s.tool=a.tool;return s;}
  if(a.type==='rotate'){s.direction=(s.direction+1)%4;say(s,'放置方向已顺时针旋转 90°。机械臂从背后取物，向箭头方向放下。');return s;}
  if(a.type==='run'){s.running=!s.running;return s;}
  if(a.type==='demo'){const demo=createFactoryRun();demo.entities['5,5']=machine('belt',5,5);say(demo,'完整示例产线已布置。观察矿石、铁板和齿轮经过每个真实相邻的环节。');return demo;}
  if(a.type==='fuel'){
    const e=s.entities[s.selected];if(!e||!['furnace','generator'].includes(e.type)){say(s,'先选择石炉或蒸汽机，再添加燃料。');return s;}
    const amount=Math.min(5,s.bag.coal);s.bag.coal-=amount;e.fuel+=amount*4;say(s,`添加 ${amount} 份煤，燃料储量上升。`);return s;
  }
  if(a.type==='place'){
    const x=a.x,y=a.y;if(x<0||y<0||x>=FACTORY.width||y>=FACTORY.height)return current;
    const key=keyOf(x,y),existing=s.entities[key];
    if(s.tool==='select'){s.selected=key;say(s,existing?`选中${BUILD_TOOLS[existing.type]}：${existing.status}。旋转可改变下一次放置方向。`:'这里是空地，可以放置设备。');return s;}
    if(s.tool==='erase'||a.erase){
      if(existing){s.parts[existing.type]++;for(const [kind,n] of Object.entries(existing.inventory))s.bag[kind]=(s.bag[kind]||0)+n;const item=s.items[key];if(item)s.bag[item.kind]++;delete s.entities[key];delete s.items[key];say(s,'设备与内部物料已回收到背包。');}return s;
    }
    if(existing){s.selected=key;if(existing.type==='belt'&&s.tool==='belt'){existing.dir=s.direction;say(s,'传送带方向已修改。');}else say(s,'该格已被设备占用，可选择拆除后重建。');return s;}
    if(!s.parts[s.tool]){say(s,'这种设备的研究补给用完了，可以拆除已有设备回收。');return s;}
    s.parts[s.tool]--;s.entities[key]=machine(s.tool,x,y,s.direction);s.selected=key;effect(s,'build',{x,y});say(s,`已放置${BUILD_TOOLS[s.tool]}，方向${['右','下','左','上'][s.direction]}。`);
  }
  return s;
}
export function tickFactory(s,dt){
  if(!s.running)return s;dt=Math.min(.1,dt);s.time+=dt;const powered=factoryPower(s);
  // Belts move simultaneously from a snapshot; a destination cannot accept two items.
  const moved=new Set();for(const [key,item] of Object.entries({...s.items})){
    if(moved.has(key))continue;const belt=s.entities[key];if(!belt||belt.type!=='belt'){delete s.items[key];continue;}
    item.progress=Math.min(1,item.progress+dt*1.65);if(item.progress<1)continue;
    const [dx,dy]=DIRECTIONS[belt.dir],nextKey=keyOf(belt.x+dx,belt.y+dy),next=s.entities[nextKey];
    if(next?.type==='belt'&&!s.items[nextKey]){s.items[nextKey]={kind:item.kind,progress:0};delete s.items[key];moved.add(nextKey);}
  }
  for(const e of Object.values(s.entities)){
    e.flash=Math.max(0,e.flash-dt);const power=powered(e);
    if(e.type==='generator'){e.fuel=Math.max(0,e.fuel-dt*.025);e.status=e.fuel>0?'正在发电':'缺少燃料';continue;}
    if(e.type==='pole'){e.status=power?'已接电':'未连接电源';continue;}
    if(e.type==='inserter'){
      if(!power){e.status='缺电';continue;}e.progress+=dt;if(e.progress<.38)continue;e.progress=0;
      const [dx,dy]=DIRECTIONS[e.dir],sx=e.x-dx,sy=e.y-dy,tx=e.x+dx,ty=e.y+dy,kind=peekItem(s,sx,sy);
      if(canTake(s,sx,sy)&&kind&&accepts(s,tx,ty,kind)){takeItem(s,sx,sy);putItem(s,tx,ty,kind);e.flash=.35;e.status=`搬运${kind==='ore'?'矿石':kind==='plate'?'铁板':'齿轮'}`;}else e.status=canTake(s,sx,sy)?'出口阻塞或目标不接收':'等待取物';continue;
    }
    if(e.type==='drill'){
      if(!power){e.status='缺电';continue;}if(!(e.x>=1&&e.x<=4&&e.y>=4&&e.y<=7)){e.status='下方没有矿层';continue;}
      e.progress+=dt;if(e.progress>=1.1&&e.inventory.ore<5){e.progress=0;e.inventory.ore++;s.oreMined++;}e.status=e.inventory.ore>=5?'输出阻塞':'开采中';
      const [dx,dy]=DIRECTIONS[e.dir];if(e.inventory.ore&&accepts(s,e.x+dx,e.y+dy,'ore')){e.inventory.ore--;putItem(s,e.x+dx,e.y+dy,'ore');}continue;
    }
    if(e.type==='furnace'){
      if(e.fuel<=0){e.status='缺少燃料';continue;}if(!e.inventory.ore){e.status='等待铁矿石';continue;}if(e.inventory.plate>=8){e.status='铁板输出阻塞';continue;}
      e.progress+=dt;e.status='冶炼中';if(e.progress>=1.6){e.progress=0;e.inventory.ore--;e.inventory.plate++;e.fuel=Math.max(0,e.fuel-.25);e.flash=.3;}continue;
    }
    if(e.type==='assembler'){
      if(!power){e.status='缺电';continue;}if(e.inventory.plate<2){e.status='需要 2 块铁板';continue;}if(e.inventory.gear>=8){e.status='齿轮输出阻塞';continue;}
      e.progress+=dt;e.status='组装中';if(e.progress>=1.2){e.progress=0;e.inventory.plate-=2;e.inventory.gear++;s.gearsMade++;e.flash=.3;}continue;
    }
    if(e.type==='belt')e.status=s.items[keyOf(e.x,e.y)]?'正在运输':'等待物料';
    if(e.type==='chest')e.status=`已收集 ${e.inventory.gear} 齿轮`;
  }
  return s;
}

// A complete short expedition: route decisions, persistent attrition and a boss.
export const DUNGEON_SKILLS={
  smite:{name:'惩击',from:[0,1],to:[0,1],damage:[7,11],accuracy:90,icon:'⚔',detail:'前排重击。清除尸体后，后排敌人会向前补位。'},
  stun:{name:'震慑打击',from:[0,1],to:[0,1],damage:[2,4],stun:1,accuracy:85,icon:'✦',detail:'使目标跳过下一次行动。'},
  guard:{name:'信念壁垒',from:[0,1,2,3],ally:true,guard:1,to:[0,1,2,3],icon:'⛨',detail:'目标所受伤害降低 45%，压力 −5，持续到其下次行动。'},
  slice:{name:'切开伤口',from:[0,1,2],to:[0,1],damage:[5,9],bleed:2,accuracy:90,icon:'†',detail:'附加流血 2，每次目标行动时结算并衰减。'},
  pistol:{name:'手枪射击',from:[1,2,3],to:[1,2,3],damage:[4,8],accuracy:90,icon:'⌖',detail:'越过前排，直接攻击后排威胁。'},
  grape:{name:'霰弹轰击',from:[1,2],to:[0,1,2],damage:[3,5],all:true,accuracy:85,icon:'⋮',detail:'同时攻击前三个位置的全部活着的敌人。'},
  plague:{name:'瘟疫手雷',from:[2,3],to:[2,3],damage:[1,3],blight:4,accuracy:95,icon:'☣',detail:'后排敌人受到腐蚀 4。优先处理施压的祭司。'},
  blast:{name:'致盲毒气',from:[2,3],to:[2,3],damage:[0,1],stun:1,accuracy:95,icon:'✧',detail:'打断后排敌人的下一次行动。'},
  incision:{name:'切割',from:[0,1,2],to:[0,1],damage:[4,7],bleed:2,accuracy:90,icon:'╱',detail:'敌人前移后，瘟疫医生也能攻击前排。'},
  heal:{name:'神圣恩典',from:[2,3],to:[0,1,2,3],ally:true,heal:[5,8],icon:'✚',detail:'治疗单个英雄。生命恢复后可离开濒死之门。'},
  light:{name:'炫目圣光',from:[1,2,3],to:[0,1,2],damage:[1,3],stun:1,accuracy:90,light:8,icon:'☀',detail:'眩晕敌人，同时恢复 8 点火光。'},
  comfort:{name:'群体慰藉',from:[2,3],to:[0,1,2,3],ally:true,heal:[2,4],all:true,icon:'✣',detail:'同时治疗所有存活英雄。'}
};
export const DUNGEON_ROUTE=[
  [{id:'gate',name:'坍塌的门厅',type:'battle',icon:'⚔',desc:'骸骨卫兵守住入口，低语祭司躲在后排。',cost:'战斗 · 教会遗址入口'}],
  [{id:'shrine',name:'残存的圣坛',type:'event',icon:'✦',desc:'以火把净化圣坛：全队恢复 8 生命、压力 −12。',cost:'消耗 1 支火把'}, {id:'cache',name:'封死的库房',type:'event',icon:'▣',desc:'撬开棺匣：获得 100 金币与 2 食物，全队压力 +10。',cost:'贪欲会留下痕迹'}],
  [{id:'library',name:'禁书回廊',type:'battle',icon:'☣',desc:'两名祭司在后方吟诵。先打断，再集中火力。',cost:'战斗 · 后排威胁'}, {id:'armory',name:'旧军械室',type:'battle',icon:'⛨',desc:'装甲卫兵拦住去路。持续伤害比硬拼更有效。',cost:'战斗 · 前排重压'}],
  [{id:'hearth',name:'最后的篝火',type:'event',icon:'♨',desc:'全队恢复 30% 生命、压力 −18。首领就在前方。',cost:'消耗 3 食物'}, {id:'watch',name:'静默的守夜',type:'event',icon:'◈',desc:'省下食物，整理装备。火光 +15，获得 1 次全队增伤。',cost:'下一场战斗伤害 +2'}],
  [{id:'sanctum',name:'敲钟人的密室',type:'boss',icon:'♜',desc:'击倒敲钟人。他会复苏骸骨，低光照时钟声更加致命。',cost:'最终战 · 可以在进入前撤离'}]
];
function hero(id,name,role,hp,speed,rank,skills){return {id,name,role,hp,maxHp:hp,speed,rank,skills,stress:0,affliction:false,virtue:false,door:false,dead:false,blight:0,bleed:0,stun:0,guard:0};}
export function createDungeonRun(){
  return {kind:'dungeon',chapter:3,seed:885,revision:0,events:[],log:[],phase:'explore',stage:0,path:[],room:0,round:0,torch:80,torches:4,food:7,loot:0,campUsed:false,queue:[],active:null,enemies:[],kills:0,relic:null,resolveBonus:0,bossDefeated:false,encounter:'gate',battleName:'坍塌的门厅',party:[hero('crusader','雷诺','crusader',33,1,0,['smite','stun','guard']),hero('rogue','迪斯','rogue',25,5,1,['slice','pistol','grape']),hero('plague','阿黛','plague',24,7,2,['plague','blast','incision']),hero('healer','朱妮','healer',26,4,3,['heal','light','comfort'])],notice:'任务：穿过废弃修道院，击败敲钟人，再带幸存者回家。先从门厅进入。'};
}
function dungeonCompactParty(s){s.party.filter(p=>!p.dead).sort((a,b)=>a.rank-b.rank).forEach((p,i)=>p.rank=i);}
function dungeonDamage(s,target,damage){
  if(target.dead){if(target.corpse){target.corpseHp=(target.corpseHp??5)-damage;if(target.corpseHp<=0){target.corpse=false;for(const enemy of s.enemies)if(enemy.rank>target.rank)enemy.rank--;target.rank=-1;effect(s,'corpse',{target:target.id});}}return;}
  damage=Math.max(0,damage);if(target.guard)damage=Math.ceil(damage*.55);
  if(target.id.startsWith('foe')){target.hp=Math.max(0,target.hp-damage);if(target.hp===0){target.dead=true;target.corpse=true;target.corpseHp=5;s.kills++;if(target.role==='necromancer')s.bossDefeated=true;}return;}
  if(target.door&&damage>0){if(roll(s)<.33){target.dead=true;target.hp=0;dungeonCompactParty(s);effect(s,'death',{target:target.id});say(s,`${target.name}在濒死之门遭受致命一击。`);}return;}
  target.hp=Math.max(0,target.hp-damage);if(target.hp===0){target.door=true;addStress(s,target,20);effect(s,'door',{target:target.id});}
}
function addStress(s,target,amount){
  if(target.dead)return;target.stress=Math.max(0,target.stress+amount);
  if(target.stress>=100&&!target.affliction&&!target.virtue){if(roll(s)<.25){target.virtue=true;target.stress=45;effect(s,'virtue',{target:target.id});}else{target.affliction=true;effect(s,'affliction',{target:target.id});}}
  if(target.stress>=200){if(target.door){target.dead=true;target.hp=0;dungeonCompactParty(s);}else{target.hp=0;target.door=true;}target.stress=170;}
}
function findDungeonActor(s,id){return [...s.party,...s.enemies].find(p=>p.id===id);}
export function dungeonIntent(s,p){
  if(p.stun)return '眩晕 · 跳过行动';
  if(p.role==='cultist')return `低语 · ${s.torch<25?18:12} 压力`;
  if(p.role==='necromancer')return s.round%3===0&&s.enemies.some(e=>e.dead&&e.role!=='necromancer')?'复苏 · 唤醒骸骨':`丧钟 · 全队 ${s.torch<25?12:7} 压力`;
  return p.role==='bulwark'?'重斩 · 5–8 伤害':'劈砍 · 3–6 伤害';
}
function dungeonOutcome(s){
  if(s.party.every(p=>p.dead)){s.phase='lost';s.active=null;s.loot=0;say(s,'修道院吞没了最后一束光。全队覆灭，战利品遗失。');return true;}
  if(s.enemies.length&&(s.enemies.every(e=>e.dead)||(s.encounter==='sanctum'&&s.bossDefeated))){s.phase='reward';s.active=null;s.queue=[];s.lastSpoils=s.encounter==='sanctum'?220:70+s.room*15;s.loot+=s.lastSpoils;s.rewards=['provisions','recovery',s.relic?'gold':'relic'];say(s,`战斗胜利，获得 ${s.lastSpoils} 金币。选择要带走的补给。`);effect(s,'victory');return true;}return false;
}
function dungeonAdvance(s){
  if(dungeonOutcome(s))return;
  if(!s.queue.length){s.round++;s.torch=Math.max(0,s.torch-4);if(s.round>8)s.party.filter(p=>!p.dead).forEach(p=>addStress(s,p,5));s.queue=[...s.party,...s.enemies].filter(p=>!p.dead).map(p=>({id:p.id,initiative:p.speed+integer(s,1,8)})).sort((a,b)=>b.initiative-a.initiative).map(p=>p.id);}
  const id=s.queue.shift(),actor=findDungeonActor(s,id);if(!actor||actor.dead){dungeonAdvance(s);return;}
  if(actor.blight||actor.bleed){const dot=actor.blight+actor.bleed;dungeonDamage(s,actor,dot);actor.blight=Math.max(0,actor.blight-1);actor.bleed=Math.max(0,actor.bleed-1);effect(s,'dot',{target:id,amount:dot});if(dungeonOutcome(s))return;if(actor.dead){dungeonAdvance(s);return;}}
  if(actor.stun){actor.stun--;effect(s,'stunned',{target:id});dungeonAdvance(s);return;}
  actor.guard=0;s.active=id;
}
export function dungeonSkillAllowed(s,skillId,targetId){
  const actor=findDungeonActor(s,s.active),skill=DUNGEON_SKILLS[skillId],target=findDungeonActor(s,targetId);
  if(s.phase!=='combat'||!actor||actor.id.startsWith('foe')||!skill||!actor.skills.includes(skillId)||!skill.from.includes(actor.rank)||!target||(target.dead&&!target.corpse))return false;
  const ally=!target.id.startsWith('foe');return Boolean(skill.ally)===ally&&skill.to.includes(target.rank);
}
function dungeonRecover(s,health,stress){s.party.filter(p=>!p.dead).forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+health);p.door=p.hp===0;addStress(s,p,-stress);});}
function dungeonEnter(s,node){
  s.path.push(node.id);s.stage++;s.campUsed=false;s.encounter=node.id;s.battleName=node.name;s.torch=Math.max(0,s.torch-8);
  if(node.type==='event'){
    if(node.id==='shrine'){s.torches--;dungeonRecover(s,8,12);s.eventText='火焰拂去圣像上的灰烬。每个人都想起了还在等待自己的人。';}
    if(node.id==='cache'){s.loot+=100;s.food+=2;s.party.forEach(p=>addStress(s,p,10));s.eventText='棺匣里没有尸骨，只有前一支远征队留下的物资。你们没有谈起他们。';}
    if(node.id==='hearth'){s.food-=3;s.party.filter(p=>!p.dead).forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+Math.ceil(p.maxHp*.3));p.door=p.hp===0;addStress(s,p,-18);});s.eventText='食物与短暂的温暖让队伍再次站起。远处，第一声钟鸣响了。';}
    if(node.id==='watch'){s.torch=Math.min(100,s.torch+15);s.resolveBonus=2;s.eventText='无人入睡。你们磨好刀刃，约定最后一战中互相照应。';}
    s.phase='event';say(s,node.desc);effect(s,'torch');return;
  }
  s.room++;s.phase='combat';s.round=0;s.queue=[];s.active=null;
  const foe=(id,name,role,hp,speed,rank)=>hero('foe-'+id,name,role,hp,speed,rank,[]);
  s.enemies=node.id==='gate'?[foe('guard','骸骨卫兵','skeleton',22,2,0),foe('raider','骸骨袭击者','skeleton',17,4,1),foe('cultist','低语祭司','cultist',16,5,2)]:node.id==='library'?[foe('guard','书库守卫','skeleton',24,2,0),foe('raider','残破骸骨','skeleton',15,3,1),foe('cultist','低语祭司','cultist',18,5,2),foe('scribe','失明抄写员','cultist',16,4,3)]:node.id==='armory'?[foe('guard','铁甲守卫','bulwark',34,1,0),foe('raider','骸骨斧手','skeleton',22,3,1),foe('cultist','低语祭司','cultist',16,5,2)]:[foe('guard','钟楼守卫','skeleton',18,2,0),foe('raider','不眠侍者','skeleton',14,3,1),foe('bell','敲钟人','necromancer',48,4,2)];
  dungeonAdvance(s);say(s,`踏入${node.name}。先观察敌人下方的意图，再选择技能与高亮目标。`);
}
export function dungeonRunAction(current,a){
  const s=actionState(current);
  if(a.type==='torch'&&s.torches>0&&!['lost','complete','escaped'].includes(s.phase)){s.torches--;s.torch=Math.min(100,s.torch+25);say(s,'点燃火把，光照 +25。低于 25 时，敌人的精神攻击更强。');effect(s,'torch');return s;}
  if(a.type==='camp'&&s.phase==='explore'&&!s.campUsed&&s.food>=2){s.food-=2;s.campUsed=true;dungeonRecover(s,6,10);say(s,'使用 2 食物短暂休整：全队生命 +6、压力 −10。本路段只能休整一次。');effect(s,'heal',{amount:6});return s;}
  if(a.type==='reward'&&s.phase==='reward'&&s.rewards.includes(a.card)){
    if(a.card==='provisions'){s.food+=3;s.torches++;say(s,'收起 3 食物与 1 支火把。');}
    if(a.card==='recovery'){dungeonRecover(s,7,8);say(s,'使用急救物资：全队生命 +7、压力 −8。');}
    if(a.card==='relic'){s.relic='殉道者的印记';say(s,'获得殉道者的印记：全队伤害 +1，之后的战斗持续生效。');}
    if(a.card==='gold'){s.loot+=100;say(s,'带走额外的 100 金币。');}
    s.phase=s.bossDefeated?'complete':'explore';if(s.phase==='complete')say(s,`钟声止息。${s.party.filter(p=>!p.dead).length} 人生还，带回 ${s.loot} 金币。`);return s;
  }
  if(a.type==='continue'&&s.phase==='event'){s.phase='explore';say(s,'沿着地图继续。密室里的钟声越来越近。');return s;}
  if((a.type==='enter'||a.type==='route')&&s.phase==='explore'){
    const nodes=DUNGEON_ROUTE[s.stage]||[],node=a.node?nodes.find(n=>n.id===a.node):nodes[0];if(!node||node.id==='shrine'&&!s.torches||node.id==='hearth'&&s.food<3)return current;dungeonEnter(s,node);return s;
  }
  if(a.type==='retreat'&&['explore','event','reward'].includes(s.phase)){s.phase='escaped';s.active=null;say(s,`你们选择回家。保留 ${s.loot} 金币，${s.party.filter(p=>!p.dead).length} 位英雄生还。`);return s;}
  if(s.phase!=='combat')return current;
  const actor=findDungeonActor(s,s.active);if(!actor)return current;
  if(a.type==='retreat'){
    if(actor.id.startsWith('foe'))return current;
    if(roll(s)<.75){s.phase='escaped';s.party.forEach(p=>addStress(s,p,15));say(s,'成功撤退，幸存队员压力 +15，保留已获得的战利品。');}else{say(s,'撤退失败，消耗当前角色的行动。');dungeonAdvance(s);}return s;
  }
  if(a.type==='enemyStep'&&actor.id.startsWith('foe')){
    const targets=s.party.filter(p=>!p.dead).sort((a,b)=>a.rank-b.rank);if(!targets.length)return s;
    const target=actor.role==='cultist'?[...targets].sort((a,b)=>b.stress-a.stress)[0]:targets[integer(s,0,Math.min(1,targets.length-1))];
    if(actor.role==='necromancer'){
      const fallen=s.enemies.find(e=>e.dead&&e.role!=='necromancer');
      if(s.round%3===0&&fallen){fallen.dead=false;fallen.corpse=false;fallen.hp=10;const formation=[fallen,...s.enemies.filter(e=>e!==fallen&&(!e.dead||e.corpse)).sort((a,b)=>a.rank-b.rank)];formation.forEach((e,i)=>e.rank=i);say(s,'敲钟人复苏了一具骸骨。击杀敲钟人即可结束战斗！');effect(s,'heal',{source:actor.id,target:fallen.id,amount:10});}
      else {const pressure=s.torch<25?12:7;targets.forEach(p=>{addStress(s,p,pressure);dungeonDamage(s,p,2);effect(s,'stress',{source:actor.id,target:p.id,amount:pressure});});say(s,`丧钟震荡全队：生命 −2、压力 +${pressure}。`);}
    }else if(actor.role==='cultist'){const amount=12+(s.torch<25?6:0);addStress(s,target,amount);say(s,`${actor.name}向${target.name}施加 ${amount} 压力。`);effect(s,'stress',{source:actor.id,target:target.id,amount});}
    else if(roll(s)<.82){const damage=actor.role==='bulwark'?integer(s,5,8):integer(s,3,6);dungeonDamage(s,target,damage);addStress(s,target,s.torch<25?7:2);say(s,`${actor.name}攻击${target.name}，造成 ${damage} 伤害。`);effect(s,'enemyAttack',{source:actor.id,target:target.id,amount:damage});}
    else {say(s,`${actor.name}的攻击被闪避。`);effect(s,'miss',{target:target.id});}
    dungeonAdvance(s);return s;
  }
  if(actor.id.startsWith('foe'))return current;
  if(a.type==='pass'){addStress(s,actor,-3);say(s,`${actor.name}稳住心神，压力 −3，结束本次行动。`);dungeonAdvance(s);return s;}
  if(a.type==='move'){
    const target=s.party.find(p=>!p.dead&&p.rank===actor.rank+a.direction);if(!target)return current;[actor.rank,target.rank]=[target.rank,actor.rank];say(s,`${actor.name}与${target.name}交换站位，消耗行动。`);effect(s,'move',{target:actor.id});dungeonAdvance(s);return s;
  }
  if(a.type==='skill'){
    if(!dungeonSkillAllowed(s,a.skill,a.target))return current;
    const skill=DUNGEON_SKILLS[a.skill];
    if(actor.affliction&&roll(s)<.12){say(s,`${actor.name}因精神折磨拒绝了行动。`);s.party.forEach(p=>addStress(s,p,3));dungeonAdvance(s);return s;}
    const target=findDungeonActor(s,a.target),targets=skill.all?(skill.ally?s.party:s.enemies).filter(p=>!p.dead&&skill.to.includes(p.rank)):[target];let results=[];
    for(const t of targets){
      if(skill.heal){const amount=integer(s,...skill.heal);t.hp=Math.min(t.maxHp,t.hp+amount);t.door=t.hp===0;effect(s,'heal',{source:actor.id,target:t.id,amount});results.push(`${t.name} +${amount}`);}
      else if(skill.guard){t.guard=1;addStress(s,t,-5);effect(s,'buff',{target:t.id});results.push(`${t.name}获得守护`);}
      else if(roll(s)*100<skill.accuracy-5){const crit=roll(s)<.06,amount=(integer(s,...skill.damage)+(s.relic?1:0)+s.resolveBonus)*(crit?2:1);dungeonDamage(s,t,amount);if(!t.dead){t.blight+=skill.blight||0;t.bleed+=skill.bleed||0;t.stun=Math.max(t.stun,skill.stun||0);}effect(s,'playerAttack',{source:actor.id,target:t.id,amount,crit,skill:a.skill});results.push(`${t.name} −${amount}${crit?' 暴击':''}${skill.stun?' 眩晕':''}${skill.blight?' 腐蚀+4':''}${skill.bleed?' 流血+2':''}`);if(crit)addStress(s,actor,-6);}
      else{effect(s,'miss',{target:t.id});results.push(`${t.name} 闪避`);}
    }
    if(skill.light)s.torch=Math.min(100,s.torch+skill.light);say(s,`${actor.name} · ${skill.name}：${results.join(' / ')}。`);dungeonAdvance(s);
  }
  return s;
}


// BATTLE BROTHERS: hex terrain, action points, fatigue, armour, hit rolls and AI.
export const HEX={cols:10,rows:7,size:34};
export function hexDistance(a,b){const aq=a.q-(a.r-(a.r&1))/2,bq=b.q-(b.r-(b.r&1))/2,dr=a.r-b.r,dq=aq-bq;return (Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2;}
export function hexNeighbors(q,r){return (r&1?[[1,0],[0,-1],[1,-1],[-1,0],[0,1],[1,1]]:[[1,0],[-1,-1],[0,-1],[-1,0],[-1,1],[0,1]]).map(([dq,dr])=>({q:q+dq,r:r+dr})).filter(p=>p.q>=0&&p.q<HEX.cols&&p.r>=0&&p.r<HEX.rows);}
export const CONTRACTS_V2=[{id:'escort',name:'道路匪徒',pay:90,enemies:3},{id:'bandits',name:'清剿营地',pay:150,enemies:4},{id:'ruins',name:'旧堡守军',pay:240,enemies:5}];
function merc(id,name,role,hp,armour,skill,wage){return {id,name,role,hp,maxHp:hp,armour,maxArmour:armour,skill,wage,fatigue:0,maxFatigue:80,ap:9,initiative:role==='archer'?110:90,shield:false,dead:false,q:2,r:3};}
export function createBrothersRun(){return {kind:'brothers',seed:644,revision:0,events:[],log:[],phase:'camp',coins:150,food:8,contracts:0,contract:'escort',round:0,active:null,queue:[],waited:[],enemies:[],terrain:{'4,2':'rock','4,4':'rock','5,2':'hill','5,3':'hill','6,3':'hill','3,5':'bush','6,1':'bush'},roster:[merc('m1','阿洛','sword',45,55,73,8),merc('m2','米娅','archer',34,30,70,7),merc('m3','林恩','spear',40,40,72,5),merc('m4','奥斯','sword',42,45,69,6)],notice:'选择合同，进入真正的六角格战场。每人每回合 9 AP；移动、攻击和盾墙各有代价。'};}
export function battleUnits(s){return [...s.roster,...s.enemies];}
function atHex(s,q,r){return battleUnits(s).find(p=>!p.dead&&p.q===q&&p.r===r);}
function enemySides(a,b){return a.id.startsWith('e')!==b.id.startsWith('e');}
function hexTerrain(s,p){return s.terrain[keyOf(p.q,p.r)]||'grass';}
function movementCost(s,from,to){return 2+(hexTerrain(s,to)==='bush'?1:0)+(hexTerrain(s,to)==='hill'&&hexTerrain(s,from)!=='hill'?1:0);}
export function reachableHexes(s,actor){
  const queue=[{q:actor.q,r:actor.r,cost:0,path:[]}],best=new Map([[keyOf(actor.q,actor.r),0]]),found=[];
  for(let cursor=0;cursor<queue.length;cursor++)for(const next of hexNeighbors(queue[cursor].q,queue[cursor].r)){
    const old=queue[cursor],cost=old.cost+movementCost(s,old,next),key=keyOf(next.q,next.r);
    if(cost>actor.ap||hexTerrain(s,next)==='rock'||atHex(s,next.q,next.r)||cost>=(best.get(key)??Infinity))continue;
    best.set(key,cost);const item={...next,cost,path:[...old.path,next]};queue.push(item);found.push(item);
  }
  return found.filter(p=>p.cost===best.get(keyOf(p.q,p.r)));
}
export function attackPreview(s,actor,target){
  const distance=hexDistance(actor,target),range=actor.role==='archer'?5:actor.role==='spear'?2:1,cost=actor.role==='archer'||actor.role==='spear'?6:4;
  const surround=battleUnits(s).filter(p=>!p.dead&&!enemySides(p,actor)&&p.id!==actor.id&&hexDistance(p,target)===1).length;
  const elevation=(hexTerrain(s,actor)==='hill'?10:0)-(hexTerrain(s,target)==='hill'?10:0);
  const chance=bounded(actor.skill+elevation+surround*5-(target.shield?25:5)-(actor.hp<actor.maxHp/2?10:0)-(actor.role==='archer'?Math.max(0,distance-2)*4:0),5,95);
  const blocked=actor.role==='archer'&&Object.entries(s.terrain).some(([key,type])=>{if(type!=='rock')return false;const [q,r]=key.split(',').map(Number);return hexDistance(actor,{q,r})+hexDistance({q,r},target)===distance;});
  return {range,cost,chance,valid:!target.dead&&enemySides(actor,target)&&distance<=range&&!blocked&&actor.ap>=cost&&actor.fatigue+12<=actor.maxFatigue,damage:actor.role==='archer'?[17,25]:actor.role==='spear'?[20,28]:[24,34],blocked};
}
function mercenaryHit(s,actor,target,opportunity=false){
  const p=attackPreview(s,actor,target);if(!opportunity){actor.ap-=p.cost;actor.fatigue+=12;}
  if(roll(s)*100<p.chance){const damage=integer(s,...p.damage),absorbed=Math.min(target.armour,Math.floor(damage*.7));target.armour-=absorbed;const loss=damage-absorbed;target.hp=Math.max(0,target.hp-loss);effect(s,enemySides(actor,s.roster[0])?'enemyAttack':'playerAttack',{source:actor.id,target:target.id,amount:loss,armour:absorbed});say(s,`${actor.name}${opportunity?'借机':''}命中${target.name}：护甲 −${absorbed}，生命 −${loss}（命中率 ${p.chance}%）。`);if(target.hp===0){target.dead=true;effect(s,'death',{target:target.id});}}
  else {effect(s,'miss',{target:target.id});say(s,`${actor.name}攻击落空（命中率 ${p.chance}%），仍消耗行动与疲劳。`);}
}
function brothersOutcome(s){
  if(s.roster.every(p=>p.dead)){s.phase='lost';s.active=null;say(s,'最后一名佣兵倒下，佣兵团解散。');return true;}
  if(s.enemies.length&&s.enemies.every(p=>p.dead)){s.phase='victory';s.active=null;const contract=CONTRACTS_V2.find(c=>c.id===s.contract),wages=s.roster.filter(p=>!p.dead).reduce((sum,p)=>sum+p.wage,0),repair=s.roster.filter(p=>!p.dead).reduce((sum,p)=>sum+Math.ceil((p.maxArmour-p.armour)*.2),0);s.coins+=contract.pay-wages-repair;s.food=Math.max(0,s.food-1);s.contracts++;say(s,`合同完成：报酬 ${contract.pay} − 工资 ${wages} − 修理 ${repair} = ${contract.pay-wages-repair} 金币。阵亡永久保留。`);effect(s,'victory');return true;}return false;
}
function brothersNext(s){
  if(brothersOutcome(s))return;
  if(!s.queue.length){s.round++;s.waited=[];s.queue=battleUnits(s).filter(p=>!p.dead).sort((a,b)=>(b.initiative-b.fatigue)-(a.initiative-a.fatigue)).map(p=>p.id);for(const p of battleUnits(s).filter(p=>!p.dead)){p.ap=9;p.fatigue=Math.max(0,p.fatigue-15);p.shield=false;}}
  const nextId=s.queue.shift(),actor=battleUnits(s).find(p=>p.id===nextId);if(!actor||actor.dead){brothersNext(s);return;}s.active=actor.id;
}
function moveMerc(s,actor,path){
  const traversed=[];for(const next of path){
    const cost=movementCost(s,actor,next);if(actor.ap<cost||actor.fatigue+4>actor.maxFatigue||atHex(s,next.q,next.r))break;
    const engaged=battleUnits(s).filter(p=>!p.dead&&enemySides(p,actor)&&hexDistance(p,actor)===1);
    for(const enemy of engaged){if(hexDistance(enemy,next)>1)mercenaryHit(s,enemy,actor,true);if(actor.dead)break;}
    if(actor.dead)break;actor.ap-=cost;actor.fatigue+=4;actor.q=next.q;actor.r=next.r;traversed.push(next);
  }
  if(traversed.length){effect(s,'walk',{target:actor.id,path:traversed});say(s,`${actor.name}移动到新位置，剩余 ${actor.ap} AP，疲劳 ${actor.fatigue}/${actor.maxFatigue}。`);}brothersOutcome(s);
}
export function brothersRunAction(current,a){
  const s=actionState(current);
  if(s.phase==='camp'||s.phase==='victory'){
    if(a.type==='claim'){s.phase='camp';s.roster.filter(p=>!p.dead).forEach(p=>p.armour=p.maxArmour);return s;}
    if(a.type==='hire'){if(s.coins<90||s.roster.filter(p=>!p.dead).length>=4){say(s,'招募需要 90 金币，最多四名在役队员。');return s;}s.coins-=90;const n=s.roster.length+1;s.roster.push(merc(`m${n}`,`新兵${n}`,'sword',36,35,66,4));say(s,'新兵加入；阵亡成员仍保留在名册里，新成员会增加后续工资。');return s;}
    if(a.type==='rest'){const wages=s.roster.filter(p=>!p.dead).reduce((n,p)=>n+p.wage,0);if(s.coins<wages||s.food<1){say(s,'休整需要一天工资和 1 口粮。');return s;}s.coins-=wages;s.food--;s.roster.filter(p=>!p.dead).forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+12);p.armour=Math.min(p.maxArmour,p.armour+20);});say(s,'休整恢复生命并修补护甲，阵亡成员无法复活。');return s;}
    if(a.type==='start'){
      const contract=CONTRACTS_V2.find(c=>c.id===a.contract)||CONTRACTS_V2[0];s.contract=contract.id;s.phase='battle';s.round=0;s.queue=[];s.waited=[];
      const positions=[[2,3],[1,4],[2,4],[2,2]];s.roster.filter(p=>!p.dead).forEach((p,i)=>{[p.q,p.r]=positions[i];p.fatigue=0;p.ap=9;p.shield=false;});
      s.enemies=Array.from({length:contract.enemies},(_,i)=>({...merc(`e${i}`,['劫掠者','游弓手','长矛匪徒','老兵','匪首'][i],i===1?'archer':i===2?'spear':'sword',30+(contract.id==='ruins'?8:0),20+(contract.id==='ruins'?18:0),60,0),q:7+(i%2),r:1+i}));
      brothersNext(s);say(s,'战斗开始。绿色网格是当前队员可到达的位置；先移动接敌，再选择攻击。');return s;
    }
    return s;
  }
  if(s.phase!=='battle')return current;
  const actor=battleUnits(s).find(p=>p.id===s.active);if(!actor)return current;
  if(a.type==='retreat'){s.phase='camp';s.coins=Math.max(0,s.coins-s.roster.filter(p=>!p.dead).reduce((n,p)=>n+p.wage,0));s.roster.filter(p=>!p.dead).forEach(p=>p.hp=Math.max(1,p.hp-integer(s,2,7)));say(s,'撤退后支付工资，幸存队员带着伤势回营，没有合同报酬。');return s;}
  if(a.type==='enemyStep'&&actor.id.startsWith('e')){
    const targets=s.roster.filter(p=>!p.dead),inRange=targets.filter(t=>attackPreview(s,actor,t).valid).sort((a,b)=>a.hp-b.hp);
    if(inRange.length){mercenaryHit(s,actor,inRange[0]);if(!brothersOutcome(s)&&actor.ap<4)brothersNext(s);return s;}
    const closest=targets.sort((a,b)=>hexDistance(actor,a)-hexDistance(actor,b))[0];
    const moves=reachableHexes(s,actor).filter(p=>p.path.length===1).sort((a,b)=>hexDistance(a,closest)-hexDistance(b,closest));
    if(moves.length&&actor.ap>=2&&actor.fatigue+4<=actor.maxFatigue&&hexDistance(moves[0],closest)<hexDistance(actor,closest)){moveMerc(s,actor,moves[0].path);if(s.phase==='battle'&&actor.ap<2)brothersNext(s);}else brothersNext(s);return s;
  }
  if(actor.id.startsWith('e'))return current;
  if(a.type==='move'){const target=reachableHexes(s,actor).find(p=>p.q===a.q&&p.r===a.r);if(target){moveMerc(s,actor,target.path);}else say(s,'无法到达：注意占位、石块、地形与剩余 AP。');return s;}
  if(a.type==='attack'){const target=s.enemies.find(p=>p.id===a.target);if(!target||!attackPreview(s,actor,target).valid){say(s,'目标不在武器射程内，或 AP、疲劳不足。');return s;}mercenaryHit(s,actor,target);brothersOutcome(s);return s;}
  if(a.type==='shield'){if(actor.ap<4||actor.fatigue+20>actor.maxFatigue){say(s,'盾墙需要 4 AP 与 20 疲劳余量。');return s;}actor.ap-=4;actor.fatigue+=20;actor.shield=true;say(s,`${actor.name}架起盾墙，敌方命中率降低；直到下一回合刷新。`);effect(s,'buff',{target:actor.id});return s;}
  if(a.type==='recover'){if(actor.ap<9){say(s,'恢复需要完整的 9 AP。');return s;}actor.fatigue=Math.floor(actor.fatigue/2);actor.ap=0;say(s,`${actor.name}恢复体力，当前疲劳减半。`);brothersNext(s);return s;}
  if(a.type==='wait'){if(!s.waited.includes(actor.id)){s.waited.push(actor.id);s.queue.push(actor.id);brothersNext(s);}else say(s,'这个回合已经等待过一次。');return s;}
  if(a.type==='end'){actor.ap=0;brothersNext(s);return s;}
  return s;
}

export const RUN_CREATORS={spire:createSpireRun,valley:createFarmRun,dungeon:createDungeonRun,factory:createFactoryRun,brothers:createBrothersRun};
export const RUN_ACTIONS={spire:spireRunAction,valley:farmRunAction,dungeon:dungeonRunAction,factory:factoryRunAction,brothers:brothersRunAction};
