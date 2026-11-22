export const CONFIG = Object.freeze({fps:30,durationFrames:300,bpm:120});
export const CHAPTERS = Object.freeze([
  {from:0,end:90,name:'引入',copies:1,line:'一张素材，也能组织节奏'},
  {from:90,end:210,name:'展开',copies:3,line:'重复、位移与文字分层'},
  {from:210,end:300,name:'收束',copies:1,line:'把变化写进时间线'}
]);
export function getFrameState(input){
  const n=Number(input);
  const frame=Math.max(0,Math.min(CONFIG.durationFrames-1,Number.isFinite(n)?Math.floor(n):0));
  const chapter=CHAPTERS.find(c=>frame>=c.from&&frame<c.end);
  const beatFrames=CONFIG.fps*60/CONFIG.bpm;
  const pulse=1-(frame%beatFrames)/beatFrames;
  const localFrame=frame-chapter.from;
  const p=Math.min(localFrame/24,1);
  const enter=1-(1-p)**3;
  return {frame,seconds:frame/CONFIG.fps,chapter:chapter.name,localFrame,copies:chapter.copies,line:chapter.line,beat:Math.floor(frame/beatFrames)+1,pulse,enter};
}

