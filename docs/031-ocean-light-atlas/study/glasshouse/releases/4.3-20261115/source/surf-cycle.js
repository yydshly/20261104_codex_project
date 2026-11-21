import { coastRadius } from './coast.js';

// One phase definition for the visible nearshore lip, wash and their audio.
export const SURF_CYCLE=Object.freeze({k:2.12,rate:.91,along:.7,alongFrequency:4.3,warpFrequency:11.7,warpRate:.09,warp:.19});
const c=SURF_CYCLE;
export const SURF_PHASE_GLSL=`float surfPhase(float a,float d,float t){return d*${c.k}+t*${c.rate}+sin(a*${c.alongFrequency})*${c.along}+sin(a*${c.warpFrequency}-t*${c.warpRate})*${c.warp};}`;
export const surfPhase=(angle,distance,time)=>distance*c.k+time*c.rate+Math.sin(angle*c.alongFrequency)*c.along+Math.sin(angle*c.warpFrequency-time*c.warpRate)*c.warp;
export function surfEnvelopes(phase){
 const crest=Math.max(0,Math.sin(phase))**6,foam=Math.max(0,Math.sin(phase-.6))**4,retreat=Math.max(0,Math.sin(phase-1.4))**2;
 return {crest,foam,retreat,breaking:.04+.96*crest,wash:.55*foam+.45*retreat};
}
export function sampleSurf(x,z,time,wave=.36){
 const a=Math.atan2((z-14)/22,(x+16)/30),scale=Math.hypot(Math.cos(a)*30,Math.sin(a)*22),d=.75,r=coastRadius(a)+d/scale;
 const phase=surfPhase(a,d,time),envelope=surfEnvelopes(phase);
 return {angle:a,distance:d,phase,...envelope,energy:.55+wave*.75,source:{x:-16+Math.cos(a)*30*r,y:.10,z:14+Math.sin(a)*22*r}};
}
