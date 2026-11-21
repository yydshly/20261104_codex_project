const $ = id => document.getElementById(id);
$('comparison-slider').addEventListener('input', event => {
  const value = Number(event.target.value);
  $('before-layer').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  $('compare-line').style.left = `${value}%`;
});
document.querySelectorAll('audio').forEach(player => player.addEventListener('play', () => {
  document.querySelectorAll('audio').forEach(other => { if (other !== player) other.pause(); });
}));
const json = async path => { const response = await fetch(path); if (!response.ok) throw new Error(path); return response.json(); };
try {
  const [sources, checks, run, performance, repeat] = await Promise.all([
    json('skill-sources/v2/manifest.json'),json('evidence/v2/browser-verification.json'),json('evidence/v2/playthrough.json'),json('evidence/v2/performance.json'),json('evidence/v2/reproducibility.json'),
  ]);
  document.querySelectorAll('[data-source]').forEach(link => { link.href = sources.find(source => source.name === link.dataset.source).source; });
  $('verified').textContent = `${22 + checks.passed} 项`;
  $('test-summary').textContent = `22 项规则测试、${checks.passed} 项浏览器检查通过，${checks.runtimeErrors.length} 个未处理运行错误。包括资源加载、Q 实际伤害与声音、手机操作、存档与完整产品流程。`;
  $('repeat-summary').textContent = `同一配方重复生成后，${repeat.comparedFiles} 个 GLB / WAV / PNG 文件中 ${repeat.changed.length} 个字节哈希发生变化。原始结果保存在可重建性报告中。`;
  $('run-summary').textContent = `三章实玩 ${run.wallSeconds.toFixed(1)} 秒，重试 ${run.retries} 次，释放共鸣 ${run.final.totals.pulses} 次。录像包含游戏音频；程序已知目标位置，用时不代表普通玩家。`;
  const a = performance.results['v1-auto'], b = performance.results['v2-auto'];
  $('performance-summary').textContent = `自动画质同样降至 ${b.pixelRatio} 画布比例时，升级前平均 ${a.averageMs.toFixed(1)}ms / 帧，升级后 ${b.averageMs.toFixed(1)}ms / 帧。新版增加海面通道，效果提升伴随额外开销；完整条件见原始报告。`;
} catch (error) {
  $('verified').textContent = '记录未载入';
  $('test-summary').textContent = '验证记录载入失败，请打开下方原始记录链接。';
  console.error(error);
}
