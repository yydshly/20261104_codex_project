import './induction.css';

const fieldColors = ['#4e9ce5', '#b081f7'];
const traceColors = ['#ffc56e', '#6fe7df'];
const historyLength = 210;

// Normalized flux through a coil as an axial magnet passes its center.
function axialFlux(position) {
  return (1 + (position / .32) ** 2) ** -1.5;
}

function speedComparison() {
  return `
    <section class="induction-lab__comparison" aria-labelledby="induction-comparison-title">
      <span class="induction-lab__eyebrow">对照实验 01 · 磁铁速度</span>
      <h3 id="induction-comparison-title">同一块磁铁，快推和慢推有什么区别？</h3>
      <p>两次都让同一磁极朝前，从左到右匀速穿过同一个 150 匝线圈。第一次速度固定为 1×。拖动滑块，只改变第二次的速度。</p>
      <label class="induction-lab__speed">第二次速度
        <input type="range" data-speed-ratio min="1" max="3" step=".25" value="2">
        <output data-speed-value aria-live="off">2×</output>
      </label>
      <div class="induction-lab__peaks" aria-label="感应电动势绝对峰值（相对单位）">
        <span class="induction-lab__voltage">第一次峰值 <output data-base-peak></output></span>
        <span class="induction-lab__current">第二次峰值 <output data-test-peak aria-live="off"></output></span>
        <span>相对单位</span>
      </div>
      <svg class="induction-lab__plot" viewBox="0 0 440 166" role="img" aria-label="两个速度下的感应电动势。横轴为磁铁位置，纵轴为带正负的电动势。">
        <path class="induction-lab__axes" d="M28 74H424M226 12V136"/>
        <text x="12" y="24">+</text><text x="12" y="78">0</text><text x="12" y="130">−</text>
        <path data-base-curve stroke="#ffc56e"/><path data-test-curve stroke="#6fe7df" stroke-dasharray="5 3"/>
        <text x="28" y="154">接近线圈</text><text x="226" y="154" text-anchor="middle">线圈中心</text><text x="424" y="154" text-anchor="end">离开线圈</text>
      </svg>
      <details>
        <summary>为什么速度会改变峰值？</summary>
        <p>磁铁越快，同样的磁通变化就发生在越短的时间里。按法拉第定律，感应电动势是每匝磁通的变化率乘以匝数再取负。在这个模型里，磁铁经过中心前后，磁通由增转减，电动势的正负也跟着反转。 <a href="https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law" target="_blank" rel="noopener noreferrer">法拉第定律</a></p>
      </details>
    </section>`;
}

function bindSpeedComparison(root) {
  const speed = root.querySelector('[data-speed-ratio]');
  const speedValue = root.querySelector('[data-speed-value]');
  const baseCurve = root.querySelector('[data-base-curve]');
  const testCurve = root.querySelector('[data-test-curve]');
  const testPeak = root.querySelector('[data-test-peak]');
  const step = .001;
  const samples = Array.from({ length: 101 }, (_, index) => {
    const position = index / 50 - 1;
    return -(axialFlux(position + step) - axialFlux(position - step)) / (2 * step * 4);
  });
  const peak = Math.max(...samples.map(Math.abs));
  const scale = 59 / (peak * Number(speed.max));

  function pathAt(multiplier) {
    return samples.map((value, index) =>
      `${index ? 'L' : 'M'}${(28 + index * 3.96).toFixed(2)} ${(74 - value * multiplier * scale).toFixed(2)}`
    ).join(' ');
  }

  function update() {
    const multiplier = Number(speed.value);
    speedValue.value = `${multiplier}×`;
    testPeak.value = (peak * multiplier).toFixed(2);
    testCurve.setAttribute('d', pathAt(multiplier));
  }

  baseCurve.setAttribute('d', pathAt(1));
  root.querySelector('[data-base-peak]').value = peak.toFixed(2);
  speed.addEventListener('input', update);
  update();
}

function canvasContext(canvas) {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(bounds.height * pixelRatio));
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext('2d');
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { context, width: bounds.width, height: bounds.height };
}

function travelWidth(width) {
  return Math.min(224, width * .33);
}

function renderField(canvas, position, polarity, turns, current) {
  const { context, width, height } = canvasContext(canvas);
  if (!width || !height) return;
  const center = width / 2;
  const axis = height * .51;
  const magnetX = center + position * travelWidth(width);
  const magnetWidth = Math.min(90, width * .24);
  const magnetHeight = 26;
  const glow = context.createRadialGradient(center, axis, 12, center, axis, width * .65);
  glow.addColorStop(0, '#172f50');
  glow.addColorStop(1, '#0a1426');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = '#243650';
  context.lineWidth = .7;
  context.beginPath();
  for (let x = center % 24; x < width; x += 24) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (let y = axis % 24; y < height; y += 24) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();
  context.strokeStyle = '#587092';
  context.setLineDash([4, 5]);
  context.beginPath();
  context.moveTo(14, axis);
  context.lineTo(width - 14, axis);
  context.moveTo(center, 24);
  context.lineTo(center, height - 20);
  context.stroke();
  context.setLineDash([]);

  const fieldGradient = context.createLinearGradient(magnetX - 110, axis, magnetX + 110, axis);
  fieldGradient.addColorStop(0, fieldColors[polarity > 0 ? 0 : 1]);
  fieldGradient.addColorStop(1, fieldColors[polarity > 0 ? 1 : 0]);
  context.strokeStyle = fieldGradient;
  context.lineWidth = 1.05;
  // In a meridional plane, an ideal dipole's field lines satisfy r = L sin²(θ).
  for (let line = 0; line < 12; line += 1) {
    const radius = (34 + line * 12 + line ** 2 * 2.2) * Math.min(width / 520, 1);
    context.globalAlpha = .78 - line * .045;
    context.beginPath();
    for (let point = 0; point <= 96; point += 1) {
      const angle = point / 96 * 2 * Math.PI;
      const sine = Math.sin(angle);
      const distance = radius * sine ** 2;
      const x = magnetX + distance * Math.cos(angle);
      const y = axis + distance * sine;
      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.globalAlpha = 1;

  const coilLoops = Math.round(5 + turns / 30);
  const coilRadius = Math.min(57, width * .19);
  const coilSpan = Math.min(76, width * .24);
  const currentGlow = Math.min(1, Math.abs(current));
  context.lineWidth = 1.6;
  context.strokeStyle = `rgba(255, 177, 103, ${.48 + currentGlow * .45})`;
  context.shadowColor = '#f49e5e';
  context.shadowBlur = currentGlow * 13;
  for (let loop = 0; loop < coilLoops; loop += 1) {
    const x = center + (loop / (coilLoops - 1) - .5) * coilSpan;
    context.beginPath();
    context.ellipse(x, axis, 10, coilRadius, -.12, 0, Math.PI * 2);
    context.stroke();
  }
  context.shadowBlur = 0;

  context.save();
  context.beginPath();
  context.roundRect(magnetX - magnetWidth / 2, axis - magnetHeight / 2, magnetWidth, magnetHeight, 6);
  context.clip();
  context.fillStyle = fieldColors[polarity > 0 ? 0 : 1];
  context.fillRect(magnetX - magnetWidth / 2, axis - magnetHeight / 2, magnetWidth / 2, magnetHeight);
  context.fillStyle = fieldColors[polarity > 0 ? 1 : 0];
  context.fillRect(magnetX, axis - magnetHeight / 2, magnetWidth / 2, magnetHeight);
  context.restore();
  context.fillStyle = '#091525';
  context.font = 'bold 12px ui-monospace, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(polarity > 0 ? 'S' : 'N', magnetX - magnetWidth / 4, axis);
  context.fillText(polarity > 0 ? 'N' : 'S', magnetX + magnetWidth / 4, axis);
}

function renderTrace(canvas, history) {
  const { context, width, height } = canvasContext(canvas);
  if (!width || !height) return;
  const inset = 11;
  const baseline = height / 2;
  context.fillStyle = '#0a1426';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#263951';
  context.lineWidth = .75;
  context.beginPath();
  for (let x = inset; x < width; x += 24) {
    context.moveTo(x, inset);
    context.lineTo(x, height - inset);
  }
  for (let row = -2; row <= 2; row += 1) {
    const y = baseline + row * (height - inset * 2) / 4;
    context.moveTo(inset, y);
    context.lineTo(width - inset, y);
  }
  context.stroke();

  history.forEach((signal, index) => {
    context.strokeStyle = traceColors[index];
    context.lineWidth = index === 0 ? 2 : 1.45;
    context.beginPath();
    signal.forEach((value, sample) => {
      const x = inset + sample / (historyLength - 1) * (width - inset * 2);
      const y = baseline - Math.tanh(value) * (baseline - inset);
      if (sample === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  });
}

function instrumentPanel() {
  const ticks = Array.from({ length: 13 }, (_, i) => {
    const angle = (i - 6) * 9;
    return `<line x1="94" x2="94" y1="19" y2="${i % 3 === 0 ? 29 : 25}" transform="rotate(${angle} 94 101)"/>`;
  }).join('');
  return `
    <aside class="induction-lab__instruments" aria-label="实时仪表">
      <span class="induction-lab__eyebrow">02 / 实时读数</span>
      <h4>检流计</h4>
      <svg viewBox="0 0 188 120" class="induction-lab__meter" aria-hidden="true">
        <path d="M27.66 52.8 A82 82 0 0 1 160.34 52.8"/>
        <g>${ticks}</g>
        <text x="18" y="66">−</text><text x="90" y="14">0</text><text x="162" y="66">+</text>
        <line data-needle x1="94" y1="101" x2="94" y2="26"/>
        <circle cx="94" cy="101" r="4"/>
      </svg>
      <dl>
        <div><dt>感应电动势</dt><dd><output data-voltage aria-live="off">0.00</output></dd></div>
        <div><dt>感应电流</dt><dd><output data-current aria-live="off">0.00</output></dd></div>
        <div><dt>每匝磁通</dt><dd><output data-flux aria-live="off">0.00</output></dd></div>
      </dl>
      <p>相对单位 · 按当前模型计算</p>
    </aside>`;
}

function fluxPanel() {
  const curve = Array.from({ length: 101 }, (_, i) => {
    return `${i ? 'L' : 'M'}${(12 + i * 3.26).toFixed(2)} ${(66 - axialFlux(i / 50 - 1) * 47).toFixed(2)}`;
  }).join(' ');
  return `
    <section class="induction-lab__flux-panel" aria-label="磁通随磁铁位置变化">
      <div class="induction-lab__scope-label">
        <span class="induction-lab__eyebrow">04 / 磁通与位置</span>
        <span>圆点是磁铁当前位置</span>
      </div>
      <svg viewBox="0 0 350 132" role="img" aria-label="磁通与位置曲线，磁铁经过线圈中心时磁通的绝对值最大">
        <path class="induction-lab__axes" d="M12 66H338M175 13V113"/>
        <path data-flux-curve d="${curve}"/>
        <line data-flux-marker x1="175" x2="175" y1="13" y2="113"/>
        <circle data-flux-point cx="175" cy="19" r="4"/>
        <text x="12" y="125">左</text><text x="175" y="125" text-anchor="middle">线圈中心</text><text x="338" y="125" text-anchor="end">右</text>
      </svg>
    </section>`;
}

export function mountInduction(root, { createScene } = {}) {
  const bench = Boolean(createScene);
  root.innerHTML = `
    <section class="induction-lab${bench ? ' induction-lab--bench' : ''}" aria-label="电磁感应实验">
      <header class="induction-lab__header">
        <div>
          <span class="induction-lab__eyebrow">FIELD STUDY / 04</span>
          <h3>${bench ? '磁铁穿过线圈' : '电磁感应实验台'}</h3>
        </div>
        <span class="induction-lab__tag">教学模型</span>
      </header>
      <div class="induction-lab__apparatus">
      <div class="induction-lab__scene" data-scene>
        <canvas data-field aria-hidden="true"></canvas>
        ${bench ? `
          <div class="induction-lab__scene-bar">
            <span>01 / 磁铁与线圈</span>
            <div role="group" aria-label="观察视角">
              <button type="button" data-view="angled" aria-pressed="true">斜视</button>
              <button type="button" data-view="side" aria-pressed="false">侧视</button>
              <button type="button" data-view="top" aria-pressed="false">俯视</button>
              <button type="button" data-view="axis" aria-pressed="false">沿轴</button>
            </div>
          </div>` : ''}
        <span class="induction-lab__guide" data-scene-guide>${bench ? '拖磁铁沿轴移动 · 拖空白处旋转 · 滚轮缩放' : '左右拖动磁铁穿过线圈'}</span>
      </div>
      ${bench ? instrumentPanel() : ''}
      </div>
      <div class="induction-lab__controls">
        <div class="induction-lab__buttons" role="group" aria-label="实验控制">
          <button type="button" data-auto aria-pressed="true">自动往复</button>
          <button type="button" data-flip>反转磁极</button>
          ${bench ? '<button type="button" data-lines aria-pressed="true">磁铁场线</button>' : ''}
          <button type="button" data-reset>重置</button>
        </div>
        <label>磁铁位置 <input type="range" data-position min="-100" max="100" value="0"></label>
        <label>线圈匝数 <input type="range" data-turns min="30" max="300" step="10" value="150"> <output data-turns-value>150</output></label>
        ${bench ? '<label>往复速度 <input type="range" data-auto-speed min=".5" max="2" step=".25" value="1"> <output data-auto-speed-value>1×</output></label>' : ''}
      </div>
      <div class="induction-lab__charts">
      <div class="induction-lab__scope">
        <div class="induction-lab__scope-label">
          <span class="induction-lab__eyebrow">${bench ? '03 / 实时示波器' : '实时示波器'}</span>
          <span class="induction-lab__voltage">感应电动势 ${bench ? '' : '<output data-voltage aria-live="off">0.00</output>'}</span>
          <span class="induction-lab__current">感应电流 ${bench ? '' : '<output data-current aria-live="off">0.00</output>'}</span>
        </div>
        <canvas data-trace role="img" aria-label="最近 7 秒的感应电动势和感应电流曲线"></canvas>
      </div>
      ${bench ? fluxPanel() : ''}
      </div>
      <p class="induction-lab__note">场线显示磁铁的理想偶极场。读数由简化模型计算，采用相对单位。</p>
      ${bench ? speedComparison() : ''}
      ${bench ? `
        <section class="induction-lab__comparison induction-lab__extensions" aria-labelledby="induction-extensions">
          <span class="induction-lab__eyebrow">扩展方向</span>
          <h3 id="induction-extensions">可以接着做哪些实验</h3>
          <dl>
            <div><dt>同条件比较</dt><dd>把线圈角度、磁铁和导线材料加入可保存的实验条件。每次只改一项，叠加波形，记录峰值和方向。原版的导体管落磁实验可作为下一套装置。</dd></div>
            <div><dt>接真实仪器</dt><dd>导入电压、磁铁位置和时间的数据，在同一张图上对照实测与模型，检查峰值和过零时刻的差异。</dd></div>
            <div><dt>从线圈到发电机</dt><dd>把往复磁铁换成旋转线圈，观察转速怎样改变交流频率，再接不同负载看电流和输出功率。</dd></div>
          </dl>
          <a href="https://electromagnetism.wasmer.app/" target="_blank" rel="noopener noreferrer">对照作者原版 ↗</a>
        </section>` : ''}
    </section>`;

  if (bench) bindSpeedComparison(root);

  const field = root.querySelector('[data-field]');
  const trace = root.querySelector('[data-trace]');
  const autoButton = root.querySelector('[data-auto]');
  const positionInput = root.querySelector('[data-position]');
  const turnsInput = root.querySelector('[data-turns]');
  const turnsOutput = root.querySelector('[data-turns-value]');
  const voltageOutput = root.querySelector('[data-voltage]');
  const currentOutput = root.querySelector('[data-current]');
  const fluxOutput = root.querySelector('[data-flux]');
  const fluxCurve = root.querySelector('[data-flux-curve]');
  const fluxPoint = root.querySelector('[data-flux-point]');
  const fluxMarker = root.querySelector('[data-flux-marker]');
  const needle = root.querySelector('[data-needle]');
  const autoSpeedInput = root.querySelector('[data-auto-speed]');
  const autoSpeedOutput = root.querySelector('[data-auto-speed-value]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const history = [Array(historyLength).fill(0), Array(historyLength).fill(0)];
  const startPosition = bench ? -.78 : 0;
  let position = startPosition;
  let target = position;
  let polarity = 1;
  let turns = 150;
  let voltage = 0;
  let current = 0;
  let phase = 0;
  let sampleTime = 0;
  let auto = !motion.matches;
  let previous = 0;
  let frame = 0;
  let activePointer = null;
  let sceneView;

  function setAuto(enabled) {
    auto = enabled;
    autoButton.setAttribute('aria-pressed', String(auto));
    if (auto) phase = Math.asin(Math.max(-1, Math.min(1, position / .9)));
  }

  function resetTrace() {
    history.forEach((signal) => signal.fill(0));
    voltage = 0;
    current = 0;
    renderTrace(trace, history);
  }

  function moveMagnet(nextPosition) {
    target = nextPosition;
    positionInput.value = String(Math.round(target * 100));
  }

  function dragMagnet(event) {
    const bounds = field.getBoundingClientRect();
    moveMagnet(Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / travelWidth(bounds.width))));
  }

  const viewButtons = [...root.querySelectorAll('[data-view]')];
  if (bench) {
    try {
      sceneView = createScene(root.querySelector('[data-scene]'), {
        onMove: moveMagnet,
        onGrab: () => { setAuto(false); moveMagnet(position); },
        onOrbit: () => viewButtons.forEach(button => button.setAttribute('aria-pressed', 'false')),
      });
      field.hidden = true;
    } catch {
      root.querySelector('[data-scene]').classList.add('induction-lab__scene--fallback');
      root.querySelector('[data-scene-guide]').textContent = '二维视图 · 左右拖动磁铁穿过线圈';
    }
  }
  viewButtons.forEach(button => button.addEventListener('click', () => {
    sceneView?.setView(button.dataset.view);
    viewButtons.forEach(view => view.setAttribute('aria-pressed', String(view === button)));
  }));
  const lineToggle = root.querySelector('[data-lines]');
  lineToggle?.addEventListener('click', () => {
    const visible = lineToggle.getAttribute('aria-pressed') !== 'true';
    lineToggle.setAttribute('aria-pressed', String(visible));
    sceneView.setFieldVisible(visible);
  });
  if (lineToggle && !sceneView) lineToggle.hidden = true;
  autoSpeedInput?.addEventListener('input', () => {
    autoSpeedOutput.value = `${autoSpeedInput.value}×`;
  });

  moveMagnet(startPosition);
  setAuto(auto);
  autoButton.addEventListener('click', () => setAuto(!auto));
  root.querySelector('[data-flip]').addEventListener('click', () => { polarity *= -1; });
  root.querySelector('[data-reset]').addEventListener('click', () => {
    position = startPosition;
    moveMagnet(startPosition);
    polarity = 1;
    turns = 150;
    turnsInput.value = '150';
    turnsOutput.value = '150';
    if (autoSpeedInput) {
      autoSpeedInput.value = '1';
      autoSpeedOutput.value = '1×';
    }
    setAuto(!motion.matches);
    resetTrace();
  });
  positionInput.addEventListener('input', () => {
    setAuto(false);
    target = Number(positionInput.value) / 100;
  });
  turnsInput.addEventListener('input', () => {
    turns = Number(turnsInput.value);
    turnsOutput.value = turnsInput.value;
  });
  field.addEventListener('pointerdown', (event) => {
    if (activePointer !== null || event.button !== 0) return;
    setAuto(false);
    activePointer = event.pointerId;
    field.setPointerCapture(activePointer);
    dragMagnet(event);
  });
  field.addEventListener('pointermove', (event) => {
    if (event.pointerId === activePointer) dragMagnet(event);
  });
  field.addEventListener('lostpointercapture', (event) => {
    if (event.pointerId === activePointer) activePointer = null;
  });

  function animate(now) {
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    if (auto) {
      phase += dt * 1.35 * Number(autoSpeedInput?.value ?? 1);
      target = Math.sin(phase) * .9;
    }

    const oldPosition = position;
    position += (target - position) * (1 - Math.exp(-dt * 16));
    voltage = dt ? -polarity * (turns / 150) * (axialFlux(position) - axialFlux(oldPosition)) / (dt * 4) : 0;
    current += (voltage / (1 + turns / 420) - current) * (1 - Math.exp(-dt * 11));

    if (auto) positionInput.value = String(Math.round(target * 100));
    if (sceneView) sceneView.render(position, polarity, turns, current);
    else renderField(field, position, polarity, turns, current);
    sampleTime += dt;
    if (sampleTime >= 1 / 30) {
      sampleTime %= 1 / 30;
      history[0].push(voltage);
      history[1].push(current);
      history.forEach((signal) => signal.shift());
      renderTrace(trace, history);
      voltageOutput.value = (Math.abs(voltage) < .005 ? 0 : voltage).toFixed(2);
      currentOutput.value = (Math.abs(current) < .005 ? 0 : current).toFixed(2);
      if (bench) {
        const flux = polarity * axialFlux(position);
        const plotX = (175 + position * 163).toFixed(2);
        fluxOutput.value = flux.toFixed(2);
        fluxCurve.setAttribute('transform', polarity > 0 ? '' : 'translate(0 132) scale(1 -1)');
        fluxMarker.setAttribute('x1', plotX);
        fluxMarker.setAttribute('x2', plotX);
        fluxPoint.setAttribute('cx', plotX);
        fluxPoint.setAttribute('cy', (66 - flux * 47).toFixed(2));
        needle.setAttribute('transform', `rotate(${52 * Math.tanh(current)} 94 101)`);
      }
    }
    if (field.isConnected) frame = requestAnimationFrame(animate);
  }

  resetTrace();
  frame = requestAnimationFrame(animate);
  return () => {
    cancelAnimationFrame(frame);
    sceneView?.dispose();
  };
}
