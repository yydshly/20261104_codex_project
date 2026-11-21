(() => {
  const viewport = document.querySelector('#viewport');
  const geometry = document.querySelector('#geometry');
  const slope = document.querySelector('#slope');
  const offset = document.querySelector('#offset');
  const slopeValue = document.querySelector('#slope-value');
  const offsetValue = document.querySelector('#offset-value');
  const prediction = document.querySelector('#prediction');
  const feedback = document.querySelector('#feedback');
  const play = document.querySelector('#play');
  const narration = document.querySelector('#narration');
  const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [
    { m: 0.6, h: 0.6, yaw: 0.62, pitch: 0.51, text: '斜率不同：要同时满足 A 和 B，必须让 0 = 0.6x + 0.6。此时 x = −1，y 可以任意变化，因此交出一条直线。' },
    { m: 0, h: 0.8, yaw: 0.66, pitch: 0.39, text: '斜率相同，高度不同：平面 A 的 z 恒为 0，平面 B 的 z 恒为 0.8，找不到同时属于两张平面的点。' },
    { m: 0, h: 0, yaw: 0.58, pitch: 0.54, text: '斜率和高度都相同：两张平面的方程都是 z = 0。平面上的每个点都属于两者，因此它们完全重合。' },
  ];
  const state = { yaw: chapters[0].yaw, pitch: chapters[0].pitch, reveal: false, chapter: 0 };
  const chapterDuration = 6000;
  let pointer = null;
  let playback = null;

  function relation(m, h) {
    if (m !== 0) return 'line';
    return h === 0 ? 'coincident' : 'parallel';
  }

  function format(value) {
    const rounded = Math.abs(value) < 0.005 ? 0 : Math.round(value * 100) / 100;
    return String(rounded).replace('-', '−');
  }

  function render() {
    const m = slope.valueAsNumber;
    const h = offset.valueAsNumber;
    const result = relation(m, h);
    const root = result === 'line' ? -h / m : null;
    const half = root !== null && Math.abs(root) < 4.7 ? Math.max(2.55, Math.abs(root) + 0.35) : 2.55;
    const height = Math.abs(m) * half + Math.abs(h);
    const scale = Math.min(56, 131 / (half * 1.35), 106 / (0.62 * half + 0.68 * height));
    const cosYaw = Math.cos(state.yaw);
    const sinYaw = Math.sin(state.yaw);
    const cosPitch = Math.cos(state.pitch);
    const sinPitch = Math.sin(state.pitch);

    function project([x, y, z]) {
      const across = x * cosYaw - y * sinYaw;
      const away = x * sinYaw + y * cosYaw;
      return [210 + across * scale, 141 - (z * cosPitch + away * sinPitch) * scale];
    }

    function path(points, closed = false) {
      const projected = points.map(point => project(point).map(value => value.toFixed(2)).join(' '));
      return `M${projected.join(' L')}${closed ? ' Z' : ''}`;
    }

    function line(start, end, color, opacity = 1, width = 1, dashes = '') {
      return `<path d="${path([start, end])}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}"${dashes ? ` stroke-dasharray="${dashes}"` : ''}/>`;
    }

    function plane(z, color, visibleAnswer = false) {
      const vertices = [[-half, -half], [half, -half], [half, half], [-half, half]];
      let html = `<path d="${path(vertices.map(([x, y]) => [x, y, z(x)]), true)}" fill="${color}" fill-opacity=".20" stroke="${color}" stroke-opacity=".95" stroke-width="${visibleAnswer ? 2.6 : 1.35}"/>`;
      for (let i = -2; i <= 2; i++) {
        const q = i * half / 3;
        html += line([q, -half, z(q)], [q, half, z(q)], color, 0.34);
        html += line([-half, q, z(-half)], [half, q, z(half)], color, 0.34);
      }
      return html;
    }

    const axisExtent = half + 0.32;
    let html = line([-axisExtent, 0, 0], [axisExtent, 0, 0], '#847b9e', 0.73, 1, '4 4');
    html += line([0, -axisExtent, 0], [0, axisExtent, 0], '#847b9e', 0.73, 1, '4 4');
    html += line([0, 0, -2.1], [0, 0, 2.1], '#847b9e', 0.73, 1, '4 4');

    if (result === 'coincident' && state.reveal) {
      html += plane(() => 0, '#dcef89', true);
    } else {
      const a = plane(() => 0, '#a98dff');
      const b = plane(x => m * x + h, '#66dcca');
      html += h >= 0 ? a + b : b + a;
    }
    if (state.reveal && result === 'line' && Math.abs(root) <= half) {
      html += line([root, -half - 0.1, 0], [root, half + 0.1, 0], '#dcef89', 0.28, 7);
      html += line([root, -half - 0.1, 0], [root, half + 0.1, 0], '#dcef89', 1, 3);
    }
    for (const [name, point] of [['x', [axisExtent, 0, 0]], ['y', [0, axisExtent, 0]], ['z', [0, 0, 2.1]]]) {
      const [x, y] = project(point);
      html += `<text x="${x.toFixed(2)}" y="${(y - 4).toFixed(2)}" fill="#dcd6f0" font-family="monospace" font-size="12" text-anchor="middle">${name}</text>`;
    }
    geometry.innerHTML = html;
    geometry.setAttribute('aria-label', `平面 A 的方程 z = 0。平面 B 的斜率 ${format(m)}、高度偏移 ${format(h)}。`);
    slopeValue.value = format(m);
    offsetValue.value = format(h);
  }

  function setChapter(index, reveal) {
    const chapter = chapters[index];
    state.chapter = index;
    state.reveal = reveal;
    state.yaw = chapter.yaw;
    state.pitch = chapter.pitch;
    slope.value = chapter.m;
    offset.value = chapter.h;
    prediction.reset();
    feedback.textContent = '';
    narration.textContent = chapter.text;
    chapterButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    render();
  }

  function stopPlayback() {
    if (!playback) return;
    cancelAnimationFrame(playback.frame);
    playback = null;
    play.textContent = '▶ 播放讲解';
  }

  function advance(now) {
    if (!playback) return;
    const elapsed = now - playback.start;
    const chapter = Math.floor(elapsed / chapterDuration);
    if (chapter >= chapters.length) {
      stopPlayback();
      return;
    }
    if (chapter !== state.chapter) setChapter(chapter, true);
    if (!reducedMotion.matches) {
      const progress = (elapsed % chapterDuration) / chapterDuration;
      state.yaw = chapters[chapter].yaw + Math.sin(progress * Math.PI) * 0.57;
      render();
    }
    playback.frame = requestAnimationFrame(advance);
  }

  play.addEventListener('click', () => {
    if (playback) {
      stopPlayback();
      return;
    }
    setChapter(0, true);
    play.textContent = 'Ⅱ 停止讲解';
    playback = { start: performance.now(), frame: requestAnimationFrame(advance) };
  });

  for (const [index, button] of chapterButtons.entries()) {
    button.addEventListener('click', () => {
      stopPlayback();
      setChapter(index, true);
    });
  }

  function explore() {
    stopPlayback();
    state.reveal = false;
    prediction.reset();
    feedback.textContent = '';
    narration.textContent = '参数已更新。先观察场景，再提交你的判断。';
    chapterButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    render();
  }
  slope.addEventListener('input', explore);
  offset.addEventListener('input', explore);

  prediction.addEventListener('submit', event => {
    event.preventDefault();
    stopPlayback();
    const guess = new FormData(prediction).get('relation');
    const m = slope.valueAsNumber;
    const h = offset.valueAsNumber;
    const result = relation(m, h);
    let reason;
    if (result === 'line') {
      const root = -h / m;
      reason = `两张平面交于直线 x = ${format(root)}，z = 0，y 可取任意值。`;
      reason += Math.abs(root) >= 4.7 ? '交线位于当前显示范围之外。' : '图中用亮绿标出了交线。';
    } else if (result === 'parallel') {
      reason = `斜率为 0，高度却是 ${format(h)}，所以两张平面平行且分离。`;
    } else {
      reason = '斜率和高度偏移都是 0，所以两张平面完全重合。';
    }
    feedback.textContent = `${guess === result ? '猜对了。' : '再看一下。'}${reason}`;
    state.reveal = true;
    render();
  });

  function rotate(yaw, pitch) {
    stopPlayback();
    state.yaw += yaw;
    state.pitch = Math.max(0.12, Math.min(1.34, state.pitch + pitch));
    render();
  }

  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || pointer) return;
    viewport.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  viewport.addEventListener('pointermove', event => {
    if (pointer?.id !== event.pointerId) return;
    rotate((event.clientX - pointer.x) * 0.012, (event.clientY - pointer.y) * 0.01);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  viewport.addEventListener('lostpointercapture', event => {
    if (pointer?.id === event.pointerId) pointer = null;
  });

  viewport.addEventListener('keydown', event => {
    const increments = { ArrowLeft: [-0.13, 0], ArrowRight: [0.13, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] };
    if (event.key === 'Home') {
      event.preventDefault();
      stopPlayback();
      state.yaw = chapters[0].yaw;
      state.pitch = chapters[0].pitch;
      render();
    } else if (Object.hasOwn(increments, event.key)) {
      event.preventDefault();
      rotate(...increments[event.key]);
    }
  });

  render();
})();
