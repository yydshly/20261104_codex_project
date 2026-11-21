import {createRun,takeAction,activeUnit,living,reachable,attackPreview,WEAPONS,actionReady,hexDistance,tileAt,canSee} from '../model.js';
export function recommendation(s,strategy='road'){
 const u=activeUnit(s);if(!u)return {type:'end'};const enemies=living(s,'enemy').filter(e=>canSee(s,e));
 if(u.side==='enemy'||u.morale===-3)return {type:'ai'};
 if(u.bleed&&actionReady(s,u,'bandage'))return {type:'skill',skill:'bandage',target:u.id};
 if(u.fatigue>u.maxFatigue*.62&&u.ap===9)return {type:'recover'};
 if(u.weapon==='crossbow'&&!u.loaded&&actionReady(s,u,'reload'))return {type:'skill',skill:'reload'};
 if(u.id==='alrik'&&living(s,'ally').some(e=>e.morale<0&&hexDistance(e,u)<=3)&&actionReady(s,u,'rally'))return {type:'skill',skill:'rally'};
 const main=WEAPONS[u.weapon].ranged&&enemies.some(e=>hexDistance(e,u)===1)?'dagger':'strike';
 const options=[];for(const skill of [main,...(u.weapon==='bow'?['aim']:[])])for(const t of enemies){const p=attackPreview(s,u,t,skill);if(p.valid){const expected=(p.hpDamage[0]+p.hpDamage[1])/2*p.chance/100,kill=t.hp<=p.hpDamage[1]?12:0,priority=t.id==='leader'?(strategy==='north'?20:10):0;options.push({type:'skill',skill,target:t.id,score:expected/Math.max(1,p.ap)*5+kill+priority});}}
 if(options.length)return options.sort((a,b)=>b.score-a.score)[0];
 if(!enemies.length)return {type:'end'};
 const target=strategy==='north'&&enemies.some(e=>e.id==='leader')?enemies.find(e=>e.id==='leader'):[...enemies].sort((a,b)=>hexDistance(u,a)-hexDistance(u,b))[0],ranged=WEAPONS[u.weapon].ranged;
 const paths=reachable(s,u).filter(p=>!p.danger).map(p=>{const d=hexDistance(p,target),before=hexDistance(u,target),close=ranged?Math.abs(d-4):d;let score=close*8+p.cost*.15-tileAt(s,p).height*2;if(p.r===5&&p.q>s.cart.q&&p.q<=s.cart.q+2)score+=3;if(!ranged&&d===1&&u.ap-p.cost>=WEAPONS[u.weapon].ap)score-=10;return {...p,score,before};}).sort((a,b)=>a.score-b.score);
 if(paths.length&&(ranged?Math.abs(hexDistance(paths[0],target)-4)<Math.abs(hexDistance(u,target)-4):hexDistance(paths[0],target)<hexDistance(u,target)))return {type:'move',q:paths[0].q,r:paths[0].r};
 if(u.weapon==='spear'&&enemies.some(e=>hexDistance(e,u)<=3)&&actionReady(s,u,'spearwall'))return {type:'skill',skill:'spearwall'};
 if(u.shield&&!u.shieldwall&&actionReady(s,u,'shield'))return {type:'skill',skill:'shield'};
 return {type:'end'};
}
export function simulate(seed=20261121,approach='road',gear={}){let s=createRun(seed);s.approach=approach;for(const [id,equipment] of Object.entries(gear))Object.assign(s.gear[id],equipment);s=takeAction(s,{type:'start'});let actions=0;for(;actions<1000&&s.phase==='battle';actions++){const a=recommendation(s,approach);const next=takeAction(s,a);if(next===s){console.log('STALL',s.active,a);break;}s=next;}return {phase:s.phase,round:s.round,actions,alive:living(s,'ally').length,result:s.result,log:s.log.slice(0,3),state:s};}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('simulate.mjs')){for(const approach of ['road','north','south']){const r=simulate(20261121,approach);console.log(JSON.stringify({...r,state:undefined}));}}
