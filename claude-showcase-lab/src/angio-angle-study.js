import { camera } from './demos/angio-projection.js';
import { film, markerGap, spatialDiagram } from './angio-demo-case.js';

const choices = [
  { name: 'RAO 10°', yaw: -10, pitch: 0 },
  { name: 'LAO 35°', yaw: 35, pitch: 0 },
  { name: 'CRA 12°', yaw: 0, pitch: 12 },
];
export function createAngioAngleStudy() {
  const study = document.createElement('details');
  study.className = 'lab-angio-study';
  study.innerHTML = `
    <summary>第二课 · 哪个角度能把重叠的分支分开？</summary>
    <div class="lab-angio-study-body lab-angio-angle">
      <p>正位影像里的虚线圈住了两条几乎重合的分支。从三个角度里选一个，让它们在标记处尽量分开。</p>
      <div class="lab-angio-films">
        <figure>
          <figcaption><span>01</span> 初始正位 · AP</figcaption>
          <svg class="lab-angio-film" viewBox="0 0 280 246" role="img" aria-label="初始正位。两条分支在虚线圈内几乎重合。"></svg>
        </figure>
        <figure>
          <figcaption><span>02</span> <strong data-angle-caption>第二视角</strong></figcaption>
          <div class="lab-angio-preview">
            <p data-angle-empty>选择下面的角度，查看第二张投影。</p>
            <svg data-angle-film class="lab-angio-film" viewBox="0 0 280 246" role="img" aria-label="选定角度的模拟造影" hidden></svg>
          </div>
        </figure>
      </div>
      <form>
        <fieldset class="lab-angio-angle-choices">
          <legend>选择第二个角度</legend>
          ${choices.map(({ name }, i) => `<label><input type="radio" name="second-view" value="${i}" required> ${name}</label>`).join('')}
        </fieldset>
        <button type="submit">核对角度并看回放</button>
        <p data-angle-feedback role="status" hidden></p>
      </form>
      <section data-angle-replay class="lab-angio-replay" aria-label="三维投影回放" hidden>
        <div>
          <h4>三维投影回放</h4>
          <p>橙色和青色是同样的两条分支。虚线表示两处标记沿观察方向投到探测板上的路径。拖动进度，观察第二视角的投影。</p>
          <p class="lab-angio-gap">标记处间距 <output data-angle-gap aria-live="off"></output> 图上单位</p>
          <div class="lab-angio-replay-controls">
            <button type="button" data-angle-play>重播转动</button>
            <label>转动进度 <input data-angle-progress type="range" min="0" max="100" value="100"></label>
          </div>
        </div>
        <svg data-angle-space viewBox="0 0 280 246" role="img" aria-label="两条分支在三维空间的位置和射向探测板的投影路径"></svg>
      </section>
      <p class="lab-angio-study-note">此题采用简化的空间分支，间距只比较图上的两个标记点。也可以到 <a href="#angio">AngioView 原版展台</a>，用解剖模型观察更多角度和分支。</p>
    </div>`;

  const form = study.querySelector('form');
  const initial = study.querySelector('.lab-angio-film');
  const second = study.querySelector('[data-angle-film]');
  const caption = study.querySelector('[data-angle-caption]');
  const placeholder = study.querySelector('[data-angle-empty]');
  const feedback = study.querySelector('[data-angle-feedback]');
  const replay = study.querySelector('[data-angle-replay]');
  const space = study.querySelector('[data-angle-space]');
  const progress = study.querySelector('[data-angle-progress]');
  const gap = study.querySelector('[data-angle-gap]');
  const baseView = camera(0, 0, false);
  const bestGap = Math.max(...choices.map(({ yaw, pitch }) => markerGap(camera(yaw, pitch, false))));
  let selected;
  let frame;

  function showProjection(fraction, reveal) {
    const yaw = selected.yaw * fraction;
    const pitch = selected.pitch * fraction;
    const project = camera(yaw, pitch, false);
    caption.textContent = fraction === 1 ? selected.name
      : fraction === 0 ? 'AP · 正位'
        : `${yaw ? (yaw > 0 ? 'LAO' : 'RAO') : 'CRA'} ${Math.abs(yaw || pitch).toFixed(0)}°`;
    second.innerHTML = film(project, reveal);
    if (reveal) {
      gap.value = markerGap(project).toFixed(1);
      space.innerHTML = spatialDiagram(project);
    }
  }

  initial.innerHTML = film(baseView, false);
  form.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    selected = choices[Number(new FormData(form).get('second-view'))];
    second.removeAttribute('hidden');
    placeholder.hidden = true;
    feedback.hidden = true;
    replay.hidden = true;
    progress.value = '100';
    showProjection(1, false);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!selected) return;
    cancelAnimationFrame(frame);
    const selectedGap = markerGap(camera(selected.yaw, selected.pitch, false));
    const outcome = selectedGap === bestGap
      ? '这组角度里，两个标记在这个视角分得最开。'
      : '两个标记已经分开。试试其他角度，比较哪一个分得更开。';
    feedback.textContent = `标记处间距从 ${markerGap(baseView).toFixed(1)} 增到 ${selectedGap.toFixed(1)} 图上单位。${outcome}`;
    feedback.hidden = false;
    replay.hidden = false;
    progress.value = '100';
    showProjection(1, true);
  });

  progress.addEventListener('input', () => {
    cancelAnimationFrame(frame);
    showProjection(Number(progress.value) / 100, true);
  });

  study.querySelector('[data-angle-play]').addEventListener('click', () => {
    cancelAnimationFrame(frame);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progress.value = progress.value === '0' ? '100' : '0';
      showProjection(Number(progress.value) / 100, true);
      return;
    }
    const start = performance.now();
    function advance(now) {
      if (!study.isConnected || !study.open) return;
      const fraction = Math.min((now - start) / 1250, 1);
      progress.value = String(Math.round(fraction * 100));
      showProjection(fraction, true);
      if (fraction < 1) frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
  });
  return study;
}
