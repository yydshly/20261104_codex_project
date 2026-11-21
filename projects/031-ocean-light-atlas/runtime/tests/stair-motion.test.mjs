import test from 'node:test';
import assert from 'node:assert/strict';
import { limitStairTravel } from '../glasshouse/stair-motion.js';
import { rootHeight } from '../glasshouse/walk-surface.js';

test('the recorded ascent cannot pull the planted leg beyond reach',()=>{
  // Actual 0597 stair frame: the old controller reached z=8.768 while the
  // supporting ankle was still on the lower tread at z=9.185. IK then raised
  // the shoe by a whole riser, despite reporting a positive sole clearance.
  const hip=[-1.6121954148,1.6258000737,8.7860005277];
  const knee=[-1.6107428571,1.2299123671,8.7881710945];
  const ankle=[-1.6102,1.0814,9.1491];
  const distance=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
  const leg={hip:{x:hip[0]+1.5,y:hip[1]+.2-.972,z:hip[2]-8.768},target:{x:-1.61,y:.8599994423,z:9.1850868993},length:distance(hip,knee)+distance(knee,ankle)};
  const from={x:-1.5,z:8.95},to={x:-1.5,z:8.768},height=(x,z)=>rootHeight(x,z)+.004;
  const reach=p=>Math.hypot(p.x+leg.hip.x-leg.target.x,height(p.x,p.z)+leg.hip.y-.24-leg.target.y,p.z+leg.hip.z-leg.target.z);
  assert(reach(to)>leg.length,'reproduces the original unreachable target');
  const fraction=limitStairTravel(from,to,[leg],height);
  assert(fraction>0&&fraction<1,'the body waits for the trailing foot');
  const allowed={x:from.x,z:from.z+(to.z-from.z)*fraction};
  assert(reach(allowed)<=leg.length*.97+1e-5,'preserves reach with a bent support knee');
});
