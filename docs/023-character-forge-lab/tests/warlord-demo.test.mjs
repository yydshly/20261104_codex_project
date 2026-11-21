import test from 'node:test';import assert from 'node:assert/strict';
import {WarlordSession} from '../src/warlord-logic.js';import {showcaseControls} from '../src/warlord-demo.js';
for(const fps of [30,60,120])test(`legal-input hero showcase absorbs a counter and demonstrates Q/E/R before winning at ${fps}fps`,()=>{
  const session=new WarlordSession(),memory={};session.start();let empowerment=false,airborne=false;
  for(let i=0;i<fps*35&&session.status==='playing';i++){const input=showcaseControls(session,1/fps,memory);session.tick(1/fps,input);for(const e of session.drainEvents()){empowerment ||= e.type==='empowered';airborne ||= e.type==='airborne';}}
  assert.equal(session.status,'won');assert(session.shieldAbsorbed>=14);assert(session.skillUses.E>=1&&session.skillUses.Q>=1&&session.skillUses.R>=1);assert(empowerment&&airborne);assert(session.health>0);
});
