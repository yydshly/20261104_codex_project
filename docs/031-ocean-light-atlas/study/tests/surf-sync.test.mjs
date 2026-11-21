import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SURF_CYCLE, SURF_PHASE_GLSL, surfPhase, surfEnvelopes, sampleSurf } from '../glasshouse/surf-cycle.js';

test('visible nearshore lip, residual foam and audio share one phase, including the alongshore warp',async()=>{
 const source=await readFile(new URL('../glasshouse/water-system.js',import.meta.url),'utf8');
 assert.equal((source.match(/float phase=surfPhase\(a,d,time\)/g)||[]).length,2);
 assert(source.includes('${SURF_PHASE_GLSL}'));
 for(const n of Object.values(SURF_CYCLE))assert(SURF_PHASE_GLSL.includes(String(n)));
 const a=.29,d=.75,t=12.3;
 assert(Math.abs(surfPhase(a,d,t)-(d*2.12+t*.91+Math.sin(a*4.3)*.7+Math.sin(a*11.7-t*.09)*.19))<1e-12);
 const p=sampleSurf(2.8,11.4,t);assert.equal(p.phase,surfPhase(p.angle,p.distance,t));
 assert.deepEqual(sampleSurf(2.8,11.4,t),p,'a paused visual clock cannot advance the audio envelope');
 assert.notEqual(sampleSurf(2.8,11.4,t+.6).breaking,p.breaking);
});

test('crash follows crest, foam and retreat follow later, instead of an unrelated recorded wave peak',()=>{
 const crest=surfEnvelopes(Math.PI/2),foam=surfEnvelopes(Math.PI/2+.6),retreat=surfEnvelopes(Math.PI/2+1.4),quiet=surfEnvelopes(Math.PI*1.5);
 assert.equal(crest.crest,1);assert.equal(crest.breaking,1);assert.equal(foam.foam,1);assert.equal(retreat.retreat,1);
 assert(foam.wash>crest.wash);assert(quiet.breaking<crest.breaking*.1);
 for(let t=0;t<100;t+=.07){const s=sampleSurf(-1.5,9.9,t,.7);for(const k of ['crest','foam','retreat','breaking','wash'])assert(s[k]>=0&&s[k]<=1);}
});

test('steady surf texture is a documented local derivative; original recording remains intact',async()=>{
 const base=new URL('../glasshouse/assets/ambience/',import.meta.url),info=JSON.parse(await readFile(new URL('surf-texture43.json',base),'utf8'));
 const source=await readFile(new URL(info.source,base)),derived=await readFile(new URL('surf-texture43.ogg',base));
 assert.equal(createHash('sha256').update(source).digest('hex'),info.sourceSha256);assert.equal(derived.toString('ascii',0,4),'OggS');
 assert.equal(createHash('sha256').update(derived).digest('hex'),info.sha256);assert.equal(info.duration,11);assert.match(info.processing,/steady surf texture/);
});
