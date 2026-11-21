/** Read-only diagnostics for ?qa=1. Absent from the normal reading experience. */
export function startReadingQA(canvas,audio){
 const box=document.createElement('aside');box.id='readingQA';box.style.cssText='position:absolute;z-index:4;right:18px;top:58px;max-width:310px;padding:12px 15px;background:#1d251fe8;color:#f3edda;border:1px solid #d3d4be66;border-radius:8px;font:12px/1.8 monospace;white-space:pre-line';
 const report=document.createElement('output');report.id='qaReport';report.setAttribute('aria-live','off');box.append(report);
 const hide=document.createElement('button');hide.textContent='收起验收面板';hide.style.cssText='display:block;margin-top:6px;padding:3px 8px;background:#fff1;color:inherit;border:1px solid #fff4;border-radius:4px;font-size:11px';hide.onclick=()=>{box.hidden=true;};box.append(hide);document.querySelector('#room').append(box);
 let errors=0,started=performance.now(),samples=0,minFPS=Infinity,maxFPS=0,maxPeak=-120;
 const error=()=>{errors++;};window.addEventListener('error',error);window.addEventListener('unhandledrejection',error);
 const update=()=>{
  const d=canvas.dataset,s=audio.getState(),levels=audio.getLevels(),fps=Number(d.fps)||0;
  if(d.ready==='reading-3d'&&!document.hidden&&fps>0){samples++;minFPS=Math.min(minFPS,fps);maxFPS=Math.max(maxFPS,fps);}
  if(levels)maxPeak=Math.max(maxPeak,levels.peakDbfs);
  report.textContent=`验收 ${d.version||'载入中'} · ${Math.floor((performance.now()-started)/1000)} 秒\n场景 ${d.ready||'载入中'}\n位置 ${d.zone||'—'} · ${d.position||'—'}\n房门 ${d.doorOpen||'false'} · 连续步行 ${d.guided||'false'}\n树形 ${d.gardenTreeVariants||0} · 树 ${d.gardenTrees||0} · 灌木 ${d.gardenShrubs||0}\nGPU 错误 ${d.shaderErrors||0} · 页面错误 ${errors}\nFPS ${d.fps||'—'} · 采样 ${samples}\n绘制 ${d.drawCalls||'—'} · 三角形 ${d.drawTriangles||'—'}\n声音 ${s.enabled?'开':'关'} · 解码 ${s.ready?'正常':'待开启'}\nMiniMax ${s.narrating?'朗读第 '+(s.narrationPage+1)+' 页':'停止'}\n${levels?`RMS ${levels.rmsDbfs.toFixed(1)} · 峰值 ${levels.peakDbfs.toFixed(1)} dBFS\n环境声增益 ${levels.ducking.toFixed(2)} · 最高峰 ${maxPeak.toFixed(1)}`:'等待声音开启'}${d.lastShaderError?'\n着色器：'+d.lastShaderError.slice(0,180):''}`;
 };
 update();const timer=setInterval(update,1000);window.addEventListener('pagehide',()=>{clearInterval(timer);window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',error);},{once:true});
}
