"""Compare the retained title scene at equal CSS viewport and explicit quality."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
measure='''async () => {
  const frames=[];let previous=performance.now();const end=previous+6000;
  await new Promise(resolve=>{function tick(now){frames.push(now-previous);previous=now;if(now<end)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
  frames.sort((a,b)=>a-b);const state=__qa.snapshot();
  const gl=document.querySelector('canvas').getContext('webgl2');const extension=gl.getExtension('WEBGL_debug_renderer_info');
  return {frames:frames.length,averageMs:frames.reduce((a,b)=>a+b,0)/frames.length,p95Ms:frames[Math.floor(frames.length*.95)],drawCalls:state.drawCalls??state.renderer.calls,triangles:state.triangles??state.renderer.triangles,pixelRatio:state.pixelRatio??devicePixelRatio,userAgent:navigator.userAgent,gpu:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):'unavailable',assets:state.assets??null,contextLost:gl.isContextLost()};
}'''
report={'viewport':{'width':1280,'height':800},'deviceScaleFactor':1,'sampleSeconds':6,'warmupSeconds':3,'scene':'title state, same island layout and three crabs','notes':'drawCalls and triangles report the main pass; v2 adds one water draw (8880 triangles) per water update, capped at 24Hz, at 45% CSS resolution. Standard comparisons use the same pixel ratio. Auto adapts the 3D canvas resolution; its text and HUD retain CSS resolution. Short samples from one software-rendered browser are not general device benchmarks.','results':{}}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for name,suffix,quality in [('v1-standard','before-upgrade/?qa','standard'),('v2-standard','?qa','standard'),('v1-auto','before-upgrade/?qa','auto'),('v2-auto','?qa','auto')]:
        context=browser.new_context(viewport=report['viewport'],device_scale_factor=1)
        context.add_init_script('localStorage.setItem("tidelight.settings.v1",'+json.dumps(json.dumps({'quality':quality,'sound':False,'reduced':False,'feel':'full'}))+')')
        page=context.new_page();page.goto('http://127.0.0.1:5267/'+suffix)
        page.wait_for_function('window.__qa');page.wait_for_timeout(3000)
        page.wait_for_function('!document.querySelector("canvas").getContext("webgl2").isContextLost()')
        report['results'][name]=page.evaluate(measure)
        context.close()
    browser.close()
(ROOT/'evidence'/'v2'/'performance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(report,ensure_ascii=False))
