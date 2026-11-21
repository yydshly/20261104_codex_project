/** Collects real, unclamped RAF intervals while the ordinary battle runs. */
export function createCombatBenchmark({ reportElement, statusElement, button, getRenderer }) {
  let report = null, active = false, seconds = 0, nextSample = 0, visibleBefore = false;
  const errors = [];
  window.addEventListener('error', event => { if (active) errors.push(String(event.message)); });
  window.addEventListener('unhandledrejection', event => { if (active) errors.push(String(event.reason?.message || event.reason)); });
  document.addEventListener('visibilitychange', () => { visibleBefore = false; });
  function start({ assetSha256, scenario, durationSeconds = 120 }) {
    active = true; seconds = 0; nextSample = 0; visibleBefore = false; errors.length = 0;
    const renderer = getRenderer(), context = renderer.getContext(), gpuInfo = context.getExtension('WEBGL_debug_renderer_info');
    report = { schema: 'chixiao-browser-benchmark-v1', assetSha256, startedAt: new Date().toISOString(),
      requestedDurationSeconds: durationSeconds, scenario, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, pixelRatio: renderer.getPixelRatio() },
      gpu: { api: context.getParameter(context.VERSION), renderer: gpuInfo ? context.getParameter(gpuInfo.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER) },
      frameTimesMs: [], rendererSamples: [], roundsCompleted: 0, sessionWins: 0, errors };
    reportElement.hidden = true; reportElement.textContent = ''; button.disabled = true;
    statusElement.textContent = `持续连战检查中：0 / ${report.requestedDurationSeconds} 秒`;
  }
  function frame(wallDeltaMs, visible) {
    if (!active) return;
    if (!visible || !visibleBefore) { visibleBefore = visible; return; }
    seconds += wallDeltaMs / 1000; report.frameTimesMs.push(Number(wallDeltaMs.toFixed(3)));
    if (seconds >= nextSample) {
      nextSample = Math.floor(seconds) + 1;
      const info = getRenderer().info;
      report.rendererSamples.push({ seconds: Number(seconds.toFixed(3)), calls: info.render.calls, triangles: info.render.triangles,
        geometries: info.memory.geometries, textures: info.memory.textures, programs: info.programs?.length || 0,
        jsHeapBytes: performance.memory?.usedJSHeapSize || null });
      statusElement.textContent = `持续连战检查中：${Math.min(report.requestedDurationSeconds, Math.floor(seconds))} / ${report.requestedDurationSeconds} 秒`;
    }
    if (seconds >= report.requestedDurationSeconds) {
      active = false; report.endedAt = new Date().toISOString(); report.visibleDurationSeconds = Number(seconds.toFixed(3));
      reportElement.textContent = JSON.stringify(report); reportElement.hidden = false; button.disabled = false; button.textContent = `重新执行 ${report.requestedDurationSeconds} 秒连战检查`;
      statusElement.textContent = `检查已完成：${report.roundsCompleted} 轮，${report.frameTimesMs.length} 个真实帧间隔`;
    }
  }
  function abort(reason) {
    if (!active) return;
    active=false; report.endedAt=new Date().toISOString(); report.visibleDurationSeconds=Number(seconds.toFixed(3)); report.aborted=reason;
    reportElement.textContent=JSON.stringify(report); reportElement.hidden=false; button.disabled=false;
    statusElement.textContent=`检查已停止：${reason}`;
  }
  return { start, frame, abort, get active() { return active; }, round(status) { if (active) { report.roundsCompleted++; if (status === 'won') report.sessionWins++; } } };
}
