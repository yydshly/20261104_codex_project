// Original tactical slice. Reference structures and deliberate approximations: README.md.
export const BOARD={cols:15,rows:11};
export const MORALE=['溃逃','崩溃','动摇','稳定','振奋'];
export const TERRAIN={grass:{name:'草地',cost:2,art:0},road:{name:'道路',cost:2,art:1},hill:{name:'高地',cost:2,art:2},scrub:{name:'灌木',cost:3,art:3,cover:15},water:{name:'深水',cost:99,art:4},mud:{name:'浅滩',cost:4,art:5},bridge:{name:'木桥',cost:2,art:1},rock:{name:'岩石',cost:99,art:2},tree:{name:'树木',cost:99,art:3}};
export const WEAPONS={
 sword:{name:'武装剑与盾',cost:0,range:1,ap:4,fat:10,damage:[30,40],pierce:.2,armor:1,accuracy:10,skills:['strike','shield','riposte','rally','bandage']},
 mace:{name:'钉头锤与盾',cost:35,range:1,ap:4,fat:14,damage:[26,36],pierce:.35,armor:1.2,accuracy:0,skills:['strike','stun','shield','rally','bandage']},
 spear:{name:'短矛与盾',cost:0,range:1,ap:4,fat:12,damage:[26,36],pierce:.25,armor:.9,accuracy:20,skills:['strike','spearwall','shield','bandage']},
 pike:{name:'双手长枪',cost:30,range:2,ap:6,fat:15,damage:[38,48],pierce:.3,armor:1.1,accuracy:10,skills:['strike','push','bandage']},
 bow:{name:'猎弓',cost:0,range:6,ap:4,fat:15,damage:[29,39],pierce:.35,armor:.65,ranged:true,skills:['strike','aim','dagger','bandage']},
 crossbow:{name:'弩',cost:40,range:6,ap:3,fat:10,damage:[40,55],pierce:.5,armor:.9,ranged:true,skills:['strike','reload','dagger','bandage']},
 axe:{name:'双手战斧',cost:0,range:1,ap:6,fat:22,damage:[52,68],pierce:.3,armor:1.35,accuracy:0,skills:['strike','split','swing','bandage']},
 hammer:{name:'双手战锤',cost:40,range:1,ap:6,fat:25,damage:[40,55],pierce:.25,armor:1.9,accuracy:0,skills:['strike','shatter','bandage']},
 club:{name:'木棍与圆盾',cost:0,range:1,ap:4,fat:13,damage:[23,33],pierce:.15,armor:1,skills:['strike','shield']},
 handaxe:{name:'手斧与圆盾',cost:0,range:1,ap:4,fat:14,damage:[28,38],pierce:.25,armor:1.2,skills:['strike','split','shield']},
 falchion:{name:'弯刀与盾',cost:0,range:1,ap:4,fat:12,damage:[32,43],pierce:.25,armor:1.15,skills:['strike','shield','rally']}
};
export const SKILLS={
 strike:{name:'攻击',icon:'sword',desc:'使用武器攻击。命中率受距离、地形、盾牌、士气和包围影响。'},
 aim:{name:'瞄准射击',icon:'aim',ap:6,fat:20,bonus:15,desc:'消耗 6 AP，命中 +15%。不能在近战缠斗中射击。'},
 dagger:{name:'拔刀近战',icon:'dagger',ap:4,fat:10,desc:'弓弩手的备用短刀。射程 1，伤害 20–28。'},
 shield:{name:'盾墙',icon:'shield',ap:4,fat:20,desc:'到自己下次行动前，近战防御 +25，远程防御 +20。盾牌必须完好。'},
 spearwall:{name:'矛墙',icon:'spear',ap:4,fat:25,desc:'到下次行动前，迎击进入相邻格的敌人。命中会阻止移动，最多迎击两次。'},
 riposte:{name:'还击架势',icon:'riposte',ap:4,fat:20,desc:'到下次行动前，闪开一次相邻近战攻击后自动反击。'},
 rally:{name:'鼓舞',icon:'flag',ap:5,fat:22,desc:'鼓舞三格内的队友，通过意志检定后士气提升一级。队长更擅长鼓舞。'},
 reload:{name:'装填弩矢',icon:'reload',ap:4,fat:8,desc:'装填后才能再次射击。装填与射击共需 7 AP。'},
 bandage:{name:'包扎',icon:'bandage',ap:4,fat:0,desc:'消耗 1 份绷带，停止自己或相邻队友的流血。不恢复生命。'},
 split:{name:'劈盾',icon:'axe',ap:6,fat:20,desc:'对相邻目标的盾牌造成 12 点损伤，不造成生命伤害。'},
 swing:{name:'横扫',icon:'swing',ap:6,fat:30,desc:'攻击周围所有相邻单位，伤害为 85%。会伤及队友。'},
 shatter:{name:'破甲重击',icon:'hammer',ap:6,fat:30,desc:'伤害为 70%，对护甲的伤害翻倍。'},
 stun:{name:'震慑',icon:'mace',ap:4,fat:22,desc:'伤害为 60%；命中后使目标失去下一次行动。'},
 push:{name:'逼退',icon:'push',ap:4,fat:15,desc:'攻击相邻敌人，伤害为 50%。命中后将其推到后方空格。'}
};
export const HEROES=[
 {id:'alrik',name:'阿尔里克',title:'老兵队长',portrait:0,hp:60,skill:69,ranged:35,defense:14,resolve:62,initiative:105,choices:['sword','mace'],bio:'曾替三个领主守过边境。他更在意有多少人能跟着自己回家。'},
 {id:'oswin',name:'奥斯温',title:'民兵长矛手',portrait:1,hp:54,skill:61,ranged:35,defense:9,resolve:48,initiative:115,choices:['spear','pike'],bio:'第一次当佣兵，但已经知道：守住身边的人，比追杀更重要。'},
 {id:'mira',name:'米拉',title:'林地猎人',portrait:2,hp:46,skill:48,ranged:67,defense:6,resolve:45,initiative:125,choices:['bow','crossbow'],bio:'擅长读风和选择射界。她不喜欢把生命交给一把钝刀。'},
 {id:'hagen',name:'哈根',title:'破阵斧手',portrait:3,hp:66,skill:66,ranged:25,defense:8,resolve:55,initiative:94,choices:['axe','hammer'],bio:'盔甲上的凹痕，比他讲过的故事还多。'}
];
export const ARMORS={light:{name:'轻装',body:45,head:25,weight:10,cost:0},medium:{name:'战斗护甲',body:80,head:45,weight:22,cost:20},heavy:{name:'重甲',body:115,head:65,weight:36,cost:50}};
export const APPROACHES={road:{name:'沿路护送',desc:'四人围绕商车出发，正面守住木桥。',positions:[[3,5],[4,4],[2,5],[3,6]]},north:{name:'北岸绕袭',desc:'靠近石桥和高地，威胁弩手；商车侧翼较薄弱。',positions:[[3,3],[4,2],[3,2],[4,3]]},south:{name:'南侧包抄',desc:'斧手靠近浅滩，绕击匪首；泥地消耗更多 AP。',positions:[[3,6],[4,6],[2,6],[4,8]]}};
export const cellKey=(q,r)=>`${q},${r}`;
export function hexDistance(a,b){const aq=a.q-(a.r-(a.r&1))/2,bq=b.q-(b.r-(b.r&1))/2,dq=aq-bq,dr=a.r-b.r;return (Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2;}
export function neighbors(q,r){return (r&1?[[1,0],[0,-1],[1,-1],[-1,0],[0,1],[1,1]]:[[1,0],[-1,-1],[0,-1],[-1,0],[-1,1],[0,1]]).map(([x,y])=>({q:q+x,r:r+y})).filter(p=>p.q>=0&&p.q<BOARD.cols&&p.r>=0&&p.r<BOARD.rows);}
const copy=s=>structuredClone(s);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
const dice=(s,lo,hi)=>lo+Math.floor(random(s)*(hi-lo+1));
function log(s,text,type='info'){s.notice=text;s.log.unshift({text,type,round:s.round});s.log=s.log.slice(0,70);}
function event(s,type,extra={}){s.events.push({type,...extra});}
export function terrainMap(){
 const map={};for(let r=0;r<BOARD.rows;r++)for(let q=0;q<BOARD.cols;q++)map[cellKey(q,r)]={kind:'grass',height:0};
 const put=(q,r,kind,height=0)=>map[cellKey(q,r)]={kind,height};
 for(let q=0;q<15;q++)put(q,5,'road');
 for(let r=0;r<11;r++)put(7,r,'water',-1);
 put(7,2,'hill',1);put(7,5,'bridge');put(7,8,'mud',-1);put(6,8,'mud');put(8,8,'mud');
 for(const [q,r] of [[6,1],[7,1],[8,1],[8,2],[9,2],[10,2],[8,3],[9,3],[10,3],[11,2],[11,3]])if(q!==7)put(q,r,'hill',1);
 for(const [q,r] of [[5,1],[5,2],[4,1],[10,7],[10,8],[11,8],[12,7],[4,8],[5,9],[8,9],[3,0],[11,5]])put(q,r,'scrub');
 for(const [q,r] of [[5,3],[6,6],[9,0],[11,9],[2,8],[13,2]])put(q,r,'rock',1);
 for(const [q,r] of [[2,1],[4,0],[9,9],[12,1],[13,8],[1,7]])put(q,r,'tree');
 return map;
}
export function createRun(seed=20261121){return {version:1,kind:'iron-company',phase:'prep',seed,round:0,revision:0,approach:'road',gear:Object.fromEntries(HEROES.map(h=>[h.id,{weapon:h.choices[0],armor:'medium'}])),supplies:3,budget:300,purse:300,units:[],terrain:terrainMap(),cart:{id:'wagon',name:'商车',side:'ally',q:4,r:5,hp:90,maxHp:90,progress:0},active:null,queue:[],waited:[],events:[],log:[],notice:'签下合同之前，决定装备、护甲和出发路线。',seen:{},corpses:[],stats:{kills:0,routed:0,damage:0},reinforced:false,withdrawing:false};}
export function prepCost(s){return HEROES.reduce((n,h)=>n+WEAPONS[s.gear[h.id].weapon].cost+ARMORS[s.gear[h.id].armor].cost,0)+s.supplies*12;}
function makeUnit(base,side,q,r,weapon,armor){const a=typeof armor==='string'?ARMORS[armor]:armor,w=WEAPONS[weapon],shield=['sword','mace','spear','club','handaxe','falchion'].includes(weapon)?24:0;return {...base,side,q,r,weapon,hp:base.hp,maxHp:base.hp,body:a.body,maxBody:a.body,head:a.head,maxHead:a.head,weight:a.weight,shield,maxShield:shield,maxFatigue:Math.round(112-a.weight*.65),fatigue:0,ap:9,morale:0,bleed:0,stun:0,injury:null,dead:false,escaped:false,shieldwall:false,spearwall:0,riposte:false,loaded:true,pressureRound:0};}
function start(s){
 s.phase='battle';s.preparationCost=prepCost(s);s.purse=s.budget-s.preparationCost;s.round=0;s.cart={id:'wagon',name:'商车',side:'ally',q:4,r:5,hp:90,maxHp:90,progress:0};
 s.units=HEROES.map((h,i)=>makeUnit(h,'ally',...APPROACHES[s.approach].positions[i],s.gear[h.id].weapon,s.gear[h.id].armor));
 const foe=(id,name,portrait,q,r,weapon,hp,skill,resolve,body=40)=>makeUnit({id,name,title:'劫匪',portrait,hp,skill,ranged:62,defense:5,resolve,initiative:105},'enemy',q,r,weapon,{body,head:25,weight:15});
 s.units.push(foe('leader','红巾匪首',7,10,4,'falchion',60,64,62,90),foe('marksman','山岗弩手',6,10,2,'crossbow',38,48,34,35),foe('raider','掠袭斧手',5,8,6,'handaxe',46,56,32,55),foe('thug','渡口打手',4,8,5,'club',38,54,25,30),foe('guard','匪首亲卫',1,9,3,'spear',44,58,42,55));
 s.queue=[];s.waited=[];s.seen={};s.corpses=[];s.stats={kills:0,routed:0,damage:0};s.reinforced=false;s.withdrawing=false;log(s,'护送商车穿过渡口，或击溃所有拦路劫匪。击倒匪首可动摇敌方士气，并阻止第四回合的增援。');advance(s);updateVisibility(s);
}
export const living=(s,side)=>s.units.filter(u=>!u.dead&&!u.escaped&&(!side||u.side===side));
export const activeUnit=s=>s.units.find(u=>u.id===s.active);
export function occupant(s,q,r){return living(s).find(u=>u.q===q&&u.r===r)||(s.cart.hp>0&&s.cart.q===q&&s.cart.r===r?s.cart:null);}
export const tileAt=(s,p)=>s.terrain[cellKey(p.q,p.r)];
export function isEngaged(s,u){return living(s).some(t=>t.side!==u.side&&hexDistance(t,u)===1);}
export function canSee(s,u){return u.side==='ally'||Boolean(s.seen[u.id]);}
function cube(p){const x=p.q-(p.r-(p.r&1))/2,z=p.r;return {x,y:-x-z,z};}
function cubeRound(p){let x=Math.round(p.x),y=Math.round(p.y),z=Math.round(p.z);const dx=Math.abs(x-p.x),dy=Math.abs(y-p.y),dz=Math.abs(z-p.z);if(dx>dy&&dx>dz)x=-y-z;else if(dy>dz)y=-x-z;else z=-x-y;return {q:x+(z-(z&1))/2,r:z};}
export function lineCells(a,b){const n=hexDistance(a,b),ac=cube(a),bc=cube(b),cells=[];for(let i=1;i<n;i++){const t=i/n;cells.push(cubeRound({x:ac.x+(bc.x-ac.x)*t+1e-6,y:ac.y+(bc.y-ac.y)*t+1e-6,z:ac.z+(bc.z-ac.z)*t-2e-6}));}return cells;}
function updateVisibility(s){for(const enemy of living(s,'enemy'))if(living(s,'ally').some(h=>hexDistance(h,enemy)<=7&&!lineCells(h,enemy).some(p=>tileAt(s,p)?.kind==='tree')))s.seen[enemy.id]=true;}
export function movementCost(s,u,from,to){const tile=tileAt(s,to);return TERRAIN[tile.kind].cost+(tile.height>tileAt(s,from).height?1:0)+(u.injury==='leg'?1:0);}
export function reachable(s,u,limit=u?.ap??0){
 if(!u||u.dead||u.escaped)return [];const start=cellKey(u.q,u.r),best=new Map([[start,0]]),queue=[{q:u.q,r:u.r,cost:0,fat:0,path:[],danger:false}],out=[];
 while(queue.length){queue.sort((a,b)=>a.cost-b.cost);const p=queue.shift();if(p.cost>best.get(cellKey(p.q,p.r)))continue;
  for(const n of neighbors(p.q,p.r)){if(occupant(s,n.q,n.r))continue;const cost=p.cost+movementCost(s,u,p,n),fat=p.fat+(tileAt(s,n).kind==='mud'?8:4),key=cellKey(n.q,n.r);if(cost>limit||u.fatigue+fat>u.maxFatigue||cost>=(best.get(key)??Infinity))continue;
   const danger=p.danger||living(s).some(e=>e.side!==u.side&&hexDistance(e,p)===1&&hexDistance(e,n)>1);const next={...n,cost,fat,path:[...p.path,n],danger};best.set(key,cost);queue.push(next);out.push(next);
  }
 }return out.filter(p=>p.cost===best.get(cellKey(p.q,p.r)));
}
export function actionInfo(u,key='strike'){const w=WEAPONS[u.weapon],spec=SKILLS[key]||SKILLS.strike;return {...spec,key,ap:spec.ap??w.ap,fat:spec.fat??w.fat,range:key==='dagger'||key==='split'||key==='stun'||key==='push'?1:w.range,ranged:['strike','aim'].includes(key)&&w.ranged,damage:key==='dagger'?[20,28]:w.damage};}
export function actionReady(s,u,key){if(!u||u.dead||u.escaped||u.morale===-3)return false;const a=actionInfo(u,key);if(u.ap<a.ap||u.fatigue+a.fat>u.maxFatigue)return false;if(key==='shield'&&(!u.shield||u.shieldwall))return false;if(key==='spearwall'&&u.spearwall>0||key==='riposte'&&u.riposte)return false;if(key==='reload'&&(u.weapon!=='crossbow'||u.loaded))return false;if(key==='bandage'&&s.supplies<=0)return false;if(a.ranged&&(isEngaged(s,u)||u.weapon==='crossbow'&&!u.loaded))return false;return true;}
export function attackPreview(s,u,t,key='strike'){
 const a=u?actionInfo(u,key):null;if(!u||!t||t.dead||t.escaped||!a)return {valid:false,reason:'没有可攻击的目标',chance:0};
 const distance=hexDistance(u,t),same=t.side===u.side;if(key==='bandage')return {valid:Boolean(t.bleed)&&distance<=1&&same&&actionReady(s,u,key),chance:100,reason:!t.bleed?'目标没有流血':distance>1?'走到队友身边才能包扎':'停止流血',ap:a.ap,fat:a.fat};
 if(same)return {valid:false,chance:0,reason:'选择敌方目标'};
 if(!actionReady(s,u,key))return {valid:false,chance:0,reason:a.ranged&&isEngaged(s,u)?'近战缠斗中无法射击':u.weapon==='crossbow'&&!u.loaded&&a.ranged?'先装填弩矢':u.ap<a.ap?'AP 不足':'疲劳或装备条件不符'};
 if(distance>a.range||distance===0)return {valid:false,chance:0,reason:`射程 ${a.range} · 当前距离 ${distance}`};
 if(key==='split')return {valid:Boolean(t.shield),chance:100,reason:t.shield?'盾牌耐久 −12':'目标没有盾牌',ap:a.ap,fat:a.fat};
 const terrain=tileAt(s,t),cells=a.ranged?lineCells(u,t):[],block=cells.some(p=>['tree','rock'].includes(tileAt(s,p)?.kind)&&tileAt(s,p).height>=tileAt(s,u).height);
 if(block)return {valid:false,chance:0,reason:'岩石或树木挡住射界'};
 const mods=[],w=WEAPONS[u.weapon];let chance=a.ranged?u.ranged:u.skill;mods.push(['基础',chance]);
 const adjust=(name,value)=>{if(value){mods.push([name,value]);chance+=value;}};
 adjust('武器',key==='dagger'?0:w.accuracy||0);adjust('瞄准',a.bonus||0);
 const shield=t.shield>0?15:0;adjust('目标防御',-(t.defense||0));adjust('盾牌',-shield);adjust('盾墙',t.shieldwall?-(a.ranged?20:25):0);
 const height=tileAt(s,u).height-terrain.height;adjust('高低差',Math.sign(height)*10);
 let cover=0,surround=0;
 if(a.ranged){cover=(TERRAIN[terrain.kind].cover||0)+(cells.some(p=>occupant(s,p.q,p.r))?20:0);adjust('遮挡',-cover);adjust('距离',-Math.max(0,distance-3)*4);}
 else{surround=Math.max(0,living(s,u.side).filter(h=>hexDistance(h,t)===1).length-1)*5;adjust('包围',surround);}
 adjust('己方士气',u.morale===1?7:u.morale*5);adjust('目标士气',t.morale===1?-7:-(t.morale||0)*5);adjust('手臂负伤',u.injury==='arm'?-10:0);adjust('疲劳',u.fatigue>u.maxFatigue*.8?-10:0);
 const factor=key==='swing'?.85:key==='shatter'?.7:key==='stun'?.6:key==='push'?.5:1,damage=a.damage.map(n=>Math.round(n*factor)),armorMult=key==='shatter'?w.armor*2:w.armor,pierce=key==='dagger'?.35:w.pierce;
 return {valid:true,chance:clamp(chance,5,95),mods,damage,hpDamage:damage.map(n=>Math.max(Math.round(n*pierce),Math.round(n-(t.body||0)*.7))),armorDamage:damage.map(n=>Math.min(t.body||0,Math.round(n*armorMult))),cover,surround,ap:a.ap,fat:a.fat,distance,shield,reason:''};
}
function moraleCheck(s,u,severity,positive=false){
 if(u.dead||u.escaped)return;const aura=living(s,u.side).some(e=>e.id==='leader'&&hexDistance(e,u)<=3)?10:0,threshold=clamp(u.resolve+aura+(u.morale<0?u.morale*5:0)-severity,5,95),passed=dice(s,1,100)<=threshold,old=u.morale;
 if(positive&&passed)u.morale=Math.min(1,u.morale+1);if(!positive&&!passed)u.morale=Math.max(-3,u.morale-1);
 if(old!==u.morale){event(s,'morale',{target:u.id,amount:u.morale-old});log(s,`${u.name}的士气变为「${MORALE[u.morale+3]}」${u.morale===-3?'，将尝试逃离战场':''}。`,u.morale<old?'bad':'good');}
}
function kill(s,u,source){
 if(u.dead)return;u.hp=0;u.dead=true;s.corpses.push({id:u.id,q:u.q,r:u.r,portrait:u.portrait,side:u.side});event(s,'death',{target:u.id,source:source?.id});
 if(u.side==='enemy')s.stats.kills++;log(s,`${u.name}阵亡。`,u.side==='ally'?'bad':'good');
 for(const p of living(s)){if(p.side===u.side&&(hexDistance(p,u)<=5||u.id==='leader')){moraleCheck(s,p,u.id==='leader'?35:15);if(u.id==='leader')moraleCheck(s,p,25);}else if(p.side!==u.side&&hexDistance(p,u)<=4)moraleCheck(s,p,0,true);}
}
function hit(s,u,t,key='strike',free=false){
 const info=actionInfo(u,key),checkTarget=key==='swing'&&t.side===u.side?{...t,side:u.side==='ally'?'enemy':'ally'}:t,preview=free?attackPreview(s,{...u,ap:99,fatigue:0,morale:Math.max(-2,u.morale)},checkTarget,key):attackPreview(s,u,checkTarget,key);
 if(!preview.valid)return false;if(!free){u.ap-=info.ap;u.fatigue+=info.fat;if(info.ranged&&u.weapon==='crossbow')u.loaded=false;}
 if(key==='split'){t.shield=Math.max(0,t.shield-12);event(s,'shield',{source:u.id,target:t.id,amount:12});log(s,`${u.name}劈击${t.name}的盾牌：耐久 −12${t.shield===0?'，盾牌破碎！':'。'}`);return true;}
 const roll=dice(s,1,100);
 if(roll>preview.chance){const blocked=t.shield>0&&roll<=preview.chance+preview.shield+(t.shieldwall?25:0);if(blocked)t.shield=Math.max(0,t.shield-1);event(s,blocked?'block':'miss',{source:u.id,target:t.id,skill:key,roll,chance:preview.chance});log(s,`${u.name} → ${t.name}：${blocked?'被盾挡住':'闪避'}（掷 ${roll} / 命中 ${preview.chance}%）。`);if(t.riposte&&!info.ranged&&hexDistance(u,t)===1&&!free){t.riposte=false;hit(s,t,u,'strike',true);}return false;}
 const weapon=WEAPONS[u.weapon],head=dice(s,1,100)<=25,armorKey=head?'head':'body',oldArmor=t[armorKey]||0,raw=dice(s,...preview.damage),armorMult=key==='shatter'?weapon.armor*2:weapon.armor,armorDamage=Math.min(oldArmor,Math.round(raw*armorMult)),pierce=key==='dagger'?.35:weapon.pierce,hpDamage=Math.max(1,Math.round(raw*pierce),Math.round(raw-oldArmor*.7));
 t[armorKey]=Math.max(0,oldArmor-armorDamage);const actual=Math.round(hpDamage*(head?1.5:1));t.hp=Math.max(0,t.hp-actual);u.side==='ally'&&(s.stats.damage+=actual);event(s,'hit',{source:u.id,target:t.id,amount:actual,armor:armorDamage,head,skill:key,ranged:info.ranged,roll,chance:preview.chance});
 log(s,`${u.name}命中${t.name}${head?'头部':''}：护甲 −${armorDamage}，生命 −${actual}（${roll}/${preview.chance}%）。`,u.side==='ally'?'good':'bad');
 if(t.id==='wagon'){if(!t.hp)settle(s,false,'商车被摧毁，合同失败。');return true;}
 if(!t.hp){kill(s,t,u);return true;}
 if(actual>=t.maxHp*.2){moraleCheck(s,t,10);if(!t.injury){t.injury=info.ranged?'arm':dice(s,0,1)?'leg':'arm';event(s,'injury',{target:t.id});log(s,`${t.name}${t.injury==='leg'?'腿部负伤：移动额外消耗 1 AP':'手臂负伤：命中 −10'}。`,'bad');}if(['sword','axe','falchion'].includes(u.weapon))t.bleed=3;}
 if(key==='stun')t.stun=1;
 if(key==='push'&&hexDistance(u,t)===1){const destination=neighbors(t.q,t.r).filter(p=>!occupant(s,p.q,p.r)&&TERRAIN[tileAt(s,p).kind].cost<90&&hexDistance(p,u)===2).sort((a,b)=>hexDistance(b,u)-hexDistance(a,u))[0];if(destination){const from={q:t.q,r:t.r};Object.assign(t,destination);event(s,'move',{target:t.id,path:[from,destination]});}}
 return true;
}
function move(s,u,path){
 const traveled=[{q:u.q,r:u.r}],startAP=u.ap,startFatigue=u.fatigue;
 for(const to of path){if(u.dead||u.escaped||occupant(s,to.q,to.r))break;const cost=movementCost(s,u,u,to),fat=tileAt(s,to).kind==='mud'?8:4;if(u.ap<cost||u.fatigue+fat>u.maxFatigue)break;
  let stopped=false;
  for(const enemy of living(s).filter(e=>e.side!==u.side&&hexDistance(e,u)===1&&hexDistance(e,to)>1&&e.morale>-3)){log(s,`${u.name}离开${enemy.name}的控制区，触发借机攻击。`,'bad');if(hit(s,enemy,u,'strike',true)){stopped=true;break;}}
  if(u.dead||stopped)break;
  for(const enemy of living(s).filter(e=>e.side!==u.side&&e.spearwall>0&&hexDistance(e,to)===1&&hexDistance(e,u)>1&&e.fatigue+6<=e.maxFatigue)){enemy.spearwall--;enemy.fatigue+=6;log(s,`${enemy.name}的矛墙迎击！`);const old={q:u.q,r:u.r};Object.assign(u,to);const success=hit(s,enemy,u,'strike',true);Object.assign(u,old);if(success){stopped=true;break;}}
  if(u.dead||stopped)break;u.ap-=cost;u.fatigue+=fat;Object.assign(u,to);traveled.push(to);
 }
 if(traveled.length>1){event(s,'move',{target:u.id,path:traveled});log(s,`${u.name}移动 ${traveled.length-1} 格，消耗 ${startAP-u.ap} AP、${u.fatigue-startFatigue} 疲劳。`);updateVisibility(s);}else log(s,`${u.name}的移动被拦下。`,'bad');
}
function moveWagon(s){
 if(s.withdrawing)return;let moved=0;const traveled=[{q:s.cart.q,r:5}];
 for(let i=0;i<2;i++){if(living(s,'enemy').some(e=>e.morale>-3&&hexDistance(e,s.cart)<=1)){log(s,'敌人贴近商车，车夫不敢前进。','bad');break;}
  if(!living(s,'ally').some(u=>u.morale>-3&&hexDistance(u,s.cart)<=2)){log(s,'商车等待护卫：至少一名队员需要在两格内。');break;}
  const next={q:s.cart.q+1,r:5};if(occupant(s,next.q,next.r)){log(s,'商车前路被占据。让出道路后，车夫会在回合结束时前进。');break;}
  Object.assign(s.cart,next);s.cart.progress++;moved++;traveled.push(next);if(s.cart.q>=12){settle(s,true,'商车安全抵达东岸，合同完成。');return;}
 }if(moved){event(s,'move',{target:'wagon',path:traveled});log(s,`商车向东前进 ${moved} 格。`,'good');}
}
function settle(s,win,reason){
 if(['victory','defeat'].includes(s.phase))return;s.phase=win?'victory':'defeat';s.active=null;s.queue=[];const survivors=s.units.filter(u=>u.side==='ally'&&!u.dead),wages=survivors.length*18,bounty=s.units.find(u=>u.id==='leader')?.dead?90:0,pay=win?450:0,repair=survivors.reduce((n,u)=>n+Math.ceil((u.maxBody-u.body+u.maxHead-u.head)*.12),0);
 const survivalBonus=win&&survivors.length===4?60:0,casualtyCost=(4-survivors.length)*80,settlement=pay+(win?bounty:0)+survivalBonus-wages-repair-casualtyCost;
 const preparation=s.preparationCost??prepCost(s);
 s.result={win,reason,survivors:survivors.length,fallen:s.units.filter(u=>u.side==='ally'&&u.dead).map(u=>u.name),injured:survivors.filter(u=>u.injury).map(u=>u.name),wages,pay,bounty:win?bounty:0,survivalBonus,casualtyCost,preparation,repair,net:settlement-preparation,rounds:s.round};s.purse+=settlement;log(s,reason,win?'good':'bad');event(s,'end',{win});
}
function outcome(s){if(s.phase!=='battle')return true;if(!living(s,'ally').length){settle(s,false,s.withdrawing?'幸存者撤离了战场。合同没有完成。':'佣兵团失去战斗能力。');return true;}if(!living(s,'enemy').some(e=>e.morale>-3)){for(const e of living(s,'enemy')){e.escaped=true;s.stats.routed++;}settle(s,true,'拦路劫匪已被击溃，渡口畅通。');return true;}return false;}
function advance(s){
 if(outcome(s))return;
 for(let safety=0;safety<80;safety++){
  if(!s.queue.length){if(s.round){moveWagon(s);if(s.phase!=='battle')return;}s.round++;if(s.round>14){settle(s,false,'夜幕降临，商队放弃了渡口。');return;}
   if(s.round===4&&!s.reinforced&&living(s,'enemy').some(e=>e.id==='leader')){s.reinforced=true;const base={title:'增援劫匪',portrait:4,hp:32,skill:50,ranged:35,defense:3,resolve:22,initiative:100};s.units.push(makeUnit({...base,id:'reinforce-a',name:'闻哨而来的劫匪'},'enemy',14,7,'club','light'),makeUnit({...base,id:'reinforce-b',name:'迟来的掠夺者'},'enemy',14,8,'club','light'));log(s,'第四回合：匪首的增援抵达东岸！','bad');event(s,'reinforcement');}
   s.waited=[];s.queue=living(s).map(u=>({id:u.id,score:u.initiative-u.weight-u.fatigue+dice(s,0,5)})).sort((a,b)=>b.score-a.score).map(u=>u.id);for(const u of living(s)){u.ap=9;u.fatigue=Math.max(0,u.fatigue-15);}updateVisibility(s);
  }
  const id=s.queue.shift(),u=s.units.find(p=>p.id===id);if(!u||u.dead||u.escaped)continue;
  u.shieldwall=false;u.spearwall=0;u.riposte=false;
  if(u.bleed){u.hp=Math.max(0,u.hp-3);u.bleed--;event(s,'bleed',{target:id,amount:3});log(s,`${u.name}流血，生命 −3。`,'bad');if(!u.hp){kill(s,u);if(outcome(s))return;continue;}}
  if(u.stun){u.stun--;u.ap=0;log(s,`${u.name}被眩晕，跳过行动。`);continue;}
  const surrounded=living(s).filter(e=>e.side!==u.side&&hexDistance(u,e)===1).length;if(surrounded>=3&&u.pressureRound!==s.round){u.pressureRound=s.round;moraleCheck(s,u,15);}
  s.active=id;return;
 }
 settle(s,false,'战斗无法继续，请重新整备。');
}
export function takeAction(current,a){
 const s=copy(current);s.events=[];s.revision++;
 if(s.phase==='prep'){
  if(a.type==='gear'&&s.gear[a.id]&&HEROES.find(h=>h.id===a.id)?.choices.includes(a.weapon))s.gear[a.id].weapon=a.weapon;
  if(a.type==='armor'&&s.gear[a.id]&&ARMORS[a.armor])s.gear[a.id].armor=a.armor;
  if(a.type==='approach'&&APPROACHES[a.approach])s.approach=a.approach;
  if(a.type==='supplies')s.supplies=clamp(s.supplies+a.amount,0,8);
  if(a.type==='start'&&prepCost(s)<=s.budget)start(s);return s;
 }
 if(s.phase!=='battle')return current;
 const u=activeUnit(s);if(!u)return current;
 if(a.type==='ai')return aiStep(s);
 if(u.side!=='ally'||u.morale===-3)return current;
 if(a.type==='withdraw'){s.withdrawing=true;for(const p of living(s,'ally'))p.morale=-3;log(s,'全队撤离：队员将向西侧边缘移动，脱离近战仍可能受到借机攻击。','bad');return s;}
 if(a.type==='end'){u.ap=0;advance(s);return s;}
 if(a.type==='recover'&&u.ap===9){u.fatigue=Math.floor(u.fatigue/2);u.ap=0;log(s,`${u.name}休息一个行动，疲劳减半。`);advance(s);return s;}
 if(a.type==='wait'&&!s.waited.includes(u.id)){s.waited.push(u.id);s.queue.push(u.id);advance(s);return s;}
 if(a.type==='move'){const destination=reachable(s,u).find(p=>p.q===a.q&&p.r===a.r);if(!destination)return current;move(s,u,destination.path);outcome(s);return s;}
 if(a.type==='skill'){
  const key=a.skill;if(!WEAPONS[u.weapon].skills.includes(key)||!actionReady(s,u,key))return current;const info=actionInfo(u,key);
  if(['shield','spearwall','riposte','reload','rally'].includes(key)){
   u.ap-=info.ap;u.fatigue+=info.fat;if(key==='shield')u.shieldwall=true;if(key==='spearwall')u.spearwall=2;if(key==='riposte')u.riposte=true;if(key==='reload')u.loaded=true;
   if(key==='rally')for(const p of living(s,u.side).filter(p=>hexDistance(p,u)<=3))moraleCheck(s,p,-Math.floor(u.resolve*.35),true);
   event(s,'stance',{target:u.id,skill:key});log(s,`${u.name}使用「${info.name}」。`,'good');return s;
  }
  const t=s.units.find(p=>p.id===a.target)||a.target==='wagon'&&s.cart;if(!t)return current;
  if(key==='bandage'){if(hexDistance(u,t)>1||t.side!==u.side||!t.bleed)return current;u.ap-=info.ap;s.supplies--;t.bleed=0;event(s,'bandage',{source:u.id,target:t.id});log(s,`${u.name}为${t.name}止住了流血。`,'good');return s;}
  if(key==='swing'){
   if(!living(s).some(t=>t.side!==u.side&&hexDistance(u,t)===1))return current;u.ap-=info.ap;u.fatigue+=info.fat;
   for(const t of living(s).filter(p=>p.id!==u.id&&hexDistance(p,u)===1))hit(s,u,t,key,true);
  }else if(!attackPreview(s,u,t,key).valid)return current;else hit(s,u,t,key);
  updateVisibility(s);outcome(s);return s;
 }
 return current;
}
export function aiStep(current){
 const s=current,u=activeUnit(s);if(s.phase!=='battle'||!u)return s;
 if(u.morale===-3){
  const enemies=living(s).filter(t=>t.side!==u.side),distance=enemies.length?Math.min(...enemies.map(t=>hexDistance(t,u))):20;
  if(!s.withdrawing&&distance>=3&&dice(s,1,100)<=u.resolve){u.morale=-1;log(s,`${u.name}重新稳住了阵脚。`);if(u.side==='ally')return s;}
  else{const paths=reachable(s,u).sort((a,b)=>{const ax=u.side==='ally'?a.q:14-a.q,bx=u.side==='ally'?b.q:14-b.q;return ax-bx||Math.min(...enemies.map(t=>hexDistance(t,b)))-Math.min(...enemies.map(t=>hexDistance(t,a)));});if(u.q===(u.side==='ally'?0:14)){u.escaped=true;s.stats.routed+=u.side==='enemy'?1:0;event(s,'escape',{target:u.id});log(s,`${u.name}逃离战场。`);}else if(paths.length)move(s,u,paths[0].path);advance(s);return s;}
 }
 if(u.side!=='enemy')return s;
 const foes=living(s,'ally');if(!foes.length){outcome(s);return s;}
 const weapon=WEAPONS[u.weapon];
 if(u.id==='leader'&&living(s,'enemy').some(p=>p.morale<0&&hexDistance(p,u)<=3)&&actionReady(s,u,'rally')){u.ap-=5;u.fatigue+=22;living(s,'enemy').filter(p=>hexDistance(p,u)<=3).forEach(p=>moraleCheck(s,p,-20,true));event(s,'stance',{target:u.id,skill:'rally'});return s;}
 if(weapon.ranged&&u.weapon==='crossbow'&&!u.loaded&&u.ap>=4){u.ap-=4;u.fatigue+=8;u.loaded=true;event(s,'stance',{target:u.id,skill:'reload'});return s;}
 const skill=weapon.ranged&&isEngaged(s,u)?'dagger':'strike';
 if(u.weapon==='handaxe'){const shielded=foes.find(t=>hexDistance(t,u)===1&&t.shield>0&&t.shieldwall);if(shielded&&actionReady(s,u,'split')){hit(s,u,shielded,'split');return s;}}
 const options=[...foes,...(['thug','reinforce-a','reinforce-b'].includes(u.id)?[s.cart]:[])].map(t=>({t,p:attackPreview(s,u,t,skill)})).filter(o=>o.p.valid).sort((a,b)=>(b.p.chance+(b.t.id==='wagon'?15:0)+(b.t.maxHp-b.t.hp)*.25)-(a.p.chance+(a.t.id==='wagon'?15:0)+(a.t.maxHp-a.t.hp)*.25));
 if(options.length){hit(s,u,options[0].t,skill);outcome(s);return s;}
 if(u.fatigue>u.maxFatigue*.7&&u.ap===9){u.fatigue=Math.floor(u.fatigue/2);u.ap=0;log(s,`${u.name}喘息恢复体力。`);advance(s);return s;}
 const target=['thug','reinforce-a','reinforce-b'].includes(u.id)?s.cart:[...foes].sort((a,b)=>hexDistance(a,u)-hexDistance(b,u)+(a.portrait===2?-1:0)-(b.portrait===2?-1:0))[0];
 const before=hexDistance(u,target),paths=reachable(s,u);
 const score=p=>{const distance=hexDistance(p,target);let value=weapon.ranged?Math.abs(distance-4)*4-tileAt(s,p).height*5:distance*6-tileAt(s,p).height*2;value+=(p.cost||0)*.15+(p.danger?25:0);if(living(s,'ally').some(h=>h.spearwall>0&&hexDistance(h,p)===1))value+=25;
  if(weapon.ranged){const virtual={...u,q:p.q,r:p.r,ap:99,fatigue:0},virtualState={...s,units:s.units.map(unit=>unit.id===u.id?virtual:unit)},shots=foes.map(t=>attackPreview(virtualState,virtual,t)).filter(p=>p.valid),best=shots.sort((a,b)=>b.chance-a.chance)[0];if(best)value-=12+best.chance*.12+(u.ap-(p.cost||0)>=weapon.ap?12:0);else value+=12;}
  return value;};paths.sort((a,b)=>score(a)-score(b));
 if(paths.length&&score(paths[0])<score({...u,cost:0})-.2){move(s,u,paths[0].path);return s;}
 if(u.shield&&!u.shieldwall&&actionReady(s,u,'shield')){u.ap-=4;u.fatigue+=20;u.shieldwall=true;event(s,'stance',{target:u.id,skill:'shield'});return s;}
 u.ap=0;advance(s);return s;
}
