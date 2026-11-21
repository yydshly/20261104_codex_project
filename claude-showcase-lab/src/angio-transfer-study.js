import { camera } from './demos/angio-projection.js';
import { film, spatialDiagram, targets, vesselLines } from './angio-demo-case.js';

const views = [
  { yaw: 35, pitch: 0, angle: 'LAO 35°', title: '看示范' },
  { yaw: -34, pitch: 0, angle: 'RAO 34°', title: '跟着找' },
  { yaw: 24, pitch: 30, angle: 'LAO 24° / CRA 30°', title: '自己认' },
];

function shotMarkup(view, index) {
  const viewNumber = index + 1;
  return `
    <figure data-match-card>
      <figcaption><span>0${viewNumber}</span> <strong>${view.title}</strong><small>${view.angle}</small></figcaption>
      <div class="lab-angio-match-image">
        <svg data-match-film viewBox="0 0 280 246" class="lab-angio-film" role="img"
          aria-label="第 ${viewNumber} 张模拟造影"${index === 2 ? ' hidden' : ''}></svg>
        <div data-match-targets role="group" aria-label="第 ${viewNumber} 张候选点"></div>
        ${index === 2 ? '<p data-match-locked>认对第二张后解锁</p>' : ''}
      </div>
    </figure>`;
}

export function createAngioTransferStudy() {
  const study = document.createElement('details');
  study.className = 'lab-angio-study';
  study.innerHTML = `
    <summary>第三课 · 同一条血管，三张图</summary>
    <div class="lab-angio-study-body lab-angio-angle">
      <p>先看第一张的<strong class="lab-angio-orange">橙色分支</strong>。记住它从共同分叉走出来后，在哪一段岔出小支。换到第二张和第三张，点你认为还在这条分支上的编号。</p>
      <div class="lab-angio-films lab-angio-match">${views.map(shotMarkup).join('')}</div>
      <p data-match-feedback role="status" hidden></p>
      <div data-match-replay class="lab-angio-replay lab-angio-match-review" hidden>
        <div>
          <h4>把三张图连起来看</h4>
          <p>选一张图或拖动进度，观察探测板的方向，以及同一条橙色分支怎样投到平面上。</p>
          <div class="lab-angio-match-controls" role="group" aria-label="回看三张投影">
            ${views.map((_, index) => `<button type="button" data-match-view="${index}" aria-pressed="false">第 ${index + 1} 张</button>`).join('')}
          </div>
          <label>回放进度 <input data-match-progress type="range" min="0" max="200" value="0"></label>
          <p data-match-view-label></p>
        </div>
        <div class="lab-angio-films lab-angio-match-replay">
          <figure>
            <figcaption>空间分支与探测板</figcaption>
            <svg data-match-space viewBox="0 0 280 246" role="img" aria-label="三维分支和探测板示意"></svg>
          </figure>
          <figure>
            <figcaption>同角度的二维投影</figcaption>
            <svg data-match-projection viewBox="0 0 280 246" role="img" aria-label="回放角度的二维投影"></svg>
          </figure>
        </div>
      </div>
      <button type="button" data-match-reset hidden>重新练习</button>
      <p class="lab-angio-study-note">本题使用简化的教学分支。<a href="#angio">AngioView 原版展台</a>提供可操作的冠脉解剖模型。</p>
    </div>`;

  const cards = [...study.querySelectorAll('[data-match-card]')];
  const films = [...study.querySelectorAll('[data-match-film]')];
  const markers = [...study.querySelectorAll('[data-match-targets]')];
  const feedback = study.querySelector('[data-match-feedback]');
  const locked = study.querySelector('[data-match-locked]');
  const replay = study.querySelector('[data-match-replay]');
  const progress = study.querySelector('[data-match-progress]');
  const viewLabel = study.querySelector('[data-match-view-label]');
  const spatial = study.querySelector('[data-match-space]');
  const projection = study.querySelector('[data-match-projection]');
  const viewButtons = [...study.querySelectorAll('[data-match-view]')];
  const reset = study.querySelector('[data-match-reset]');
  const cameras = views.map(({ yaw, pitch }) => camera(yaw, pitch, false));
  const candidatePoints = cameras.map(project => targets
    .map((point, branch) => ({ branch, position: project(point) }))
    .sort((a, b) => a.position[0] - b.position[0]));
  let stage;

  function showChoices(index) {
    markers[index].innerHTML = candidatePoints[index].map(({ position: [x, y] }, i) =>
      `<button type="button" data-match-choice="${i}" aria-label="选第 ${index + 1} 张的候选 ${i + 1}"
        style="left:${x / 2.8}%;top:${y / 2.46}%">${i + 1}</button>`
    ).join('');
  }

  function showReplay(position) {
    const index = Math.min(Math.floor(position / 100), 1);
    const amount = position / 100 - index;
    const from = views[index];
    const to = views[index + 1];
    const yaw = from.yaw + (to.yaw - from.yaw) * amount;
    const pitch = from.pitch + (to.pitch - from.pitch) * amount;
    const project = camera(yaw, pitch, false);
    const exact = position / 100;
    const active = Number.isInteger(exact) ? exact : -1;
    cards.forEach((card, i) => card.toggleAttribute('data-active', i === active));
    viewButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    viewLabel.textContent = active >= 0
      ? `第 ${active + 1} 张 · ${views[active].angle}`
      : `从第 ${index + 1} 张转向第 ${index + 2} 张`;
    progress.setAttribute('aria-valuetext', viewLabel.textContent);
    spatial.innerHTML = spatialDiagram(project);
    projection.innerHTML = film(project, true);
  }

  function start() {
    stage = 1;
    films[0].innerHTML = film(cameras[0], true);
    films[1].innerHTML = vesselLines(cameras[1], false);
    films[2].setAttribute('hidden', '');
    locked.hidden = false;
    markers[2].replaceChildren();
    showChoices(1);
    feedback.hidden = true;
    replay.hidden = true;
    reset.hidden = true;
    cards.forEach(card => card.removeAttribute('data-active'));
  }

  study.addEventListener('click', event => {
    const button = event.target.closest('[data-match-choice]');
    if (!button || !markers[stage]?.contains(button)) return;
    const choice = Number(button.dataset.matchChoice);
    const correct = candidatePoints[stage][choice].branch === 0;
    feedback.hidden = false;
    if (stage === 1) {
      if (!correct) {
        feedback.textContent = '再跟一下靠近共同分叉就有小支的那一条，然后重选第二张。';
        return;
      }
      feedback.textContent = '第二张找对了。现在换一个角度，试着独立找出同一条分支。';
      films[1].innerHTML = film(cameras[1], true);
      markers[1].replaceChildren();
      stage = 2;
      films[2].innerHTML = vesselLines(cameras[2], false);
      films[2].removeAttribute('hidden');
      locked.hidden = true;
      showChoices(2);
      markers[2].querySelector('button').focus();
      return;
    }

    const correctNumber = candidatePoints[2].findIndex(({ branch }) => branch === 0) + 1;
    feedback.textContent = correct
      ? '第三张也找对了。回放时留意橙色分支在每张图的位置。'
      : `第三张你选了 ${choice + 1} 号，橙色分支上的点是 ${correctNumber} 号。用回放跟着橙色分支从第一张看到第三张。`;
    films[2].innerHTML = film(cameras[2], true);
    markers[2].replaceChildren();
    stage = 3;
    replay.hidden = false;
    reset.hidden = false;
    progress.value = '200';
    showReplay(200);
    viewButtons[2].focus();
  });

  viewButtons.forEach((button, index) => button.addEventListener('click', () => {
    progress.value = String(index * 100);
    showReplay(index * 100);
  }));
  progress.addEventListener('input', () => showReplay(Number(progress.value)));
  reset.addEventListener('click', () => {
    start();
    markers[1].querySelector('button').focus();
  });
  start();
  return study;
}
