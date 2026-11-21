import { autopilot } from './warlord-logic.js';

/** A readable legal-input sequence: absorb a counter, sweep, two strikes, leap. */
export function showcaseControls(session, dt, memory = {}) {
  if(session.status!=='playing')return {};
  const alive=session.enemies.filter(e=>!e.dead), enemy=alive.sort((a,b)=>Math.hypot(a.x-session.position.x,a.z-session.position.z)-Math.hypot(b.x-session.position.x,b.z-session.position.z))[0];
  if(!enemy)return {};
  const dx=enemy.x-session.position.x,dz=enemy.z-session.position.z,distance=Math.hypot(dx,dz),point={x:enemy.x,z:enemy.z};
  const controls={x:distance>2.05?dx:0,z:distance>2.05?dz:0,aimX:point.x,aimZ:point.z};session.setAim(point.x,point.z);
  if(!memory.counterSeen) {
    if(distance<2.75 && session.cooldowns.E<=0)session.skill('E');
    if(session.shieldAbsorbed>0 || session.time>5)memory.counterSeen=true;
    else return controls;
  }
  if(!memory.sweepShown) {
    if(session.skill('Q',point))memory.sweepShown=true;
    return controls;
  }
  memory.strikeClock=(memory.strikeClock||0)-dt;
  if((memory.strikes||0)<2) {
    if(distance<2.6 && memory.strikeClock<=0) {
      if(!memory.strikes && session.attack(point)){memory.strikes=1;memory.strikeClock=.2;}
      else if(memory.strikes===1 && session.action==='Attack1' && session.actionTime>=.18){session.attack(point);if(session.queued)memory.strikes=2;}
    }
    return controls;
  }
  if(!memory.leapShown) {
    if(session.time>=4.6 && session.canCommit()) {
      const cluster=alive.filter(e=>Math.hypot(e.x-enemy.x,e.z-enemy.z)<3.3);
      const target={x:cluster.reduce((sum,e)=>sum+e.x,0)/cluster.length,z:cluster.reduce((sum,e)=>sum+e.z,0)/cluster.length};
      if(session.skill('R',target))memory.leapShown=true;
    }
    return controls;
  }
  return autopilot(session,dt,memory);
}
