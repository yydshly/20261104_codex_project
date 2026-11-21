const canvas = document.querySelector("#galaxy");
const film = document.querySelector("#galaxy-film");
const filmVersions = {
  comparison: { file: "galaxy-pitch-compare", title: "银河旋臂张角对照", description: "左边 12° 紧卷，右边 28° 舒展。两边共用随机种子和镜头路线。", duration: 8, download: "下载对照片 MP4 ↓", chapters: [[0, "俯瞰旋臂"], [3, "掠过尘带"], [6, "贴近银盘"]] },
  flight: { file: "galaxy-flight", title: "银河旋臂飞越", description: "固定 18° 张角。从俯瞰进入斜视，再贴近银盘侧缘。", duration: 12, download: "下载飞越成片 MP4 ↓", chapters: [[0, "银河旋臂"], [3.6, "掠过旋臂"], [7.7, "倾向银盘"]] },
};
const filmButtons = [...document.querySelectorAll("[data-film]")];
const filmChapters = document.querySelector("#film-chapters");
let activeFilm;
let chapterButtons = [];

function updateFilmChapter() {
  const current = filmVersions[activeFilm].chapters.findLastIndex(([seconds]) => seconds <= film.currentTime + .001);
  chapterButtons.forEach((button, index) => button.setAttribute("aria-current", String(index === current)));
}

function selectFilm(id) {
  if (activeFilm === id) return;
  const version = filmVersions[id];
  const source = `galaxy-media/${version.file}.mp4`;
  if (activeFilm) {
    film.poster = `galaxy-media/${version.file}.jpg`;
    film.src = source;
  }
  activeFilm = id;
  film.setAttribute("aria-label", `${version.title}，无声，带片内章节文字`);
  filmButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.film === id)));
  document.querySelector("#film-title").textContent = version.title;
  document.querySelector("#film-description").textContent = version.description;
  document.querySelector("#film-spec").textContent = `${version.duration} 秒 · 1920 × 1080 · 24 fps · 无声`;
  const download = document.querySelector("#film-download");
  download.href = source;
  download.textContent = version.download;
  chapterButtons = version.chapters.map(([seconds, title]) => {
    const button = document.createElement("button");
    const clock = document.createElement("time");
    clock.dateTime = `PT${seconds}S`;
    clock.textContent = `${seconds.toFixed(1)} 秒`;
    button.type = "button";
    button.setAttribute("aria-controls", "galaxy-film");
    button.append(clock, title);
    button.addEventListener("click", () => {
      film.currentTime = seconds;
      updateFilmChapter();
      film.play().catch(() => {});
    });
    return button;
  });
  filmChapters.replaceChildren(...chapterButtons);
  updateFilmChapter();
}

filmButtons.forEach(button => button.addEventListener("click", () => selectFilm(button.dataset.film)));
film.addEventListener("timeupdate", updateFilmChapter);
film.addEventListener("loadedmetadata", updateFilmChapter);
selectFilm("comparison");
const ctx = canvas.getContext("2d");
const timeInput = document.querySelector("#time");
const timeOutput = document.querySelector("#time-value");
const playButton = document.querySelector("#play");
const pitchInput = document.querySelector("#pitch");
const countInput = document.querySelector("#count");
const seedInput = document.querySelector("#seed");
const pitchOutput = document.querySelector("#pitch-value");
const countOutput = document.querySelector("#count-value");
const sceneOutput = document.querySelector("#scene");
const sceneButtons = [...document.querySelectorAll("[data-time]")];
const pitchButtons = [...document.querySelectorAll("[data-pitch]")];
const layers = Object.fromEntries(["arms", "disk", "core", "guides"].map(
  name => [name, document.getElementById(name)]
));
const defaults = { pitch: 18, count: 11000, seed: 6 };
const TAU = 2 * Math.PI;
const radians = value => value * Math.PI / 180;
const formatNumber = new Intl.NumberFormat("zh-CN");
const sun = { x: .5334 * Math.cos(.48), y: .5334 * Math.sin(.48), z: 0 };
const cameraPath = [
  { time: 0, label: "俯视", x: 0, y: 0, tilt: 14, azimuth: -90, zoom: 1 },
  { time: 2, label: "推进银心", x: .05, y: .02, tilt: 42, azimuth: -105, zoom: 2.1 },
  { time: 4.5, label: "掠过旋臂", x: .34, y: -.29, tilt: 53, azimuth: -56, zoom: 2.35 },
  { time: 6.6, label: "抵达太阳附近", x: sun.x, y: sun.y, tilt: 38, azimuth: -58, zoom: 2.15 },
  { time: 8.5, label: "侧视银盘", x: 0, y: 0, tilt: 81, azimuth: -82, zoom: 1.06 },
  { time: 10, label: "拉回全景", x: 0, y: 0, tilt: 14, azimuth: -90, zoom: 1 },
];
const palettes = {
  arms: ["#4a72b6", "#779be8", "#a4caff", "#a98acd", "#efaaca", "#f8eafc"],
  disk: ["#2c3a62", "#4c4f7c", "#6d6198", "#656b9f", "#8589b2", "#c5b5d0"],
  core: ["#746178", "#a47f78", "#dca97c", "#edc18c", "#fbe1b7", "#fff6d7"],
};
let stars;
let starPitch = defaults.pitch;
let starSeed = defaults.seed;
let time = 0;
let playing = false;
let previousTime = 0;
let lastDraw = 0;
let animation = 0;
let drawRequest = 0;
let field;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function spread(random) {
  return (random() + random() + random() + random() - 2) * 1.73;
}

function armAngle(radius, arm, pitch) {
  return Math.log(radius / .35) / Math.tan(radians(pitch)) + arm * Math.PI / 2 + .42;
}

function makeStars(seed, pitch, count) {
  const random = seededRandom(seed);
  const groups = Object.fromEntries(Object.keys(palettes).map(
    layer => [layer, palettes[layer].map(() => [])]
  ));
  const bar = radians(27);
  const barCos = Math.cos(bar);
  const barSin = Math.sin(bar);
  for (let i = 0; i < count; i++) {
    const sample = random();
    let layer;
    let x;
    let y;
    let z;
    if (sample < .58) {
      layer = "arms";
      const radius = .15 + .86 * random() ** .78;
      const angle = armAngle(radius, i % 4, pitch) + spread(random) * (.025 + radius * .075);
      x = radius * Math.cos(angle);
      y = radius * Math.sin(angle);
      z = spread(random) * .027;
    } else if (sample < .82) {
      layer = "disk";
      const radius = .10 + .98 * random() ** .58;
      const angle = TAU * random();
      x = radius * Math.cos(angle);
      y = radius * Math.sin(angle);
      z = spread(random) * (sample < .80 ? .043 : .14);
    } else {
      layer = "core";
      const barX = spread(random) * .18;
      const barY = spread(random) * .065;
      x = barX * barCos - barY * barSin;
      y = barX * barSin + barY * barCos;
      z = spread(random) * .046;
    }
    const brightness = Math.min(5, Math.floor(random() ** 1.8 * 6));
    groups[layer][brightness].push(x, y, z);
  }
  return groups;
}

function interpolate(left, right, progress) {
  return left + (right - left) * progress;
}

function cameraAt(seconds) {
  const nextIndex = cameraPath.findIndex(frame => frame.time > seconds);
  if (nextIndex === -1) return cameraPath.at(-1);
  const from = cameraPath[nextIndex - 1];
  const to = cameraPath[nextIndex];
  const progress = (seconds - from.time) / (to.time - from.time);
  const smooth = progress * progress * (3 - 2 * progress);
  return {
    x: interpolate(from.x, to.x, smooth),
    y: interpolate(from.y, to.y, smooth),
    tilt: interpolate(from.tilt, to.tilt, smooth),
    azimuth: interpolate(from.azimuth, to.azimuth, smooth),
    zoom: interpolate(from.zoom, to.zoom, smooth),
    label: progress < .5 ? from.label : to.label,
  };
}

function drawScene(ctx, field, camera, sample = stars, pitch = starPitch) {
  const { width, height } = field;
  const azimuth = radians(camera.azimuth);
  const tilt = radians(camera.tilt);
  const azSin = Math.sin(azimuth);
  const azCos = Math.cos(azimuth);
  const tiltSin = Math.sin(tilt);
  const tiltCos = Math.cos(tilt);
  const scale = Math.min(width, height) * .41 * camera.zoom;
  const centerX = width / 2;
  const centerY = height * .53;
  const point = [0, 0];
  const project = (x, y, z) => {
    const dx = x - camera.x;
    const dy = y - camera.y;
    const plane = dx * azCos + dy * azSin;
    const depth = plane * tiltSin + z * tiltCos;
    const projected = scale * 2.8 / Math.max(.8, 2.8 - depth);
    point[0] = centerX + (-dx * azSin + dy * azCos) * projected;
    point[1] = centerY + (plane * tiltCos - z * tiltSin) * projected;
    return point;
  };

  ctx.fillStyle = field.background;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#313c59";
  for (const [x, y] of field.backgroundStars) ctx.fillRect(x, y, 1, 1);

  if (layers.core.checked) {
    const [glowX, glowY] = project(0, 0, 0);
    const radius = scale * .55;
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, radius);
    glow.addColorStop(0, "#d9955a53");
    glow.addColorStop(.42, "#774c8136");
    glow.addColorStop(1, "#6e477700");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.globalCompositeOperation = "lighter";
  for (const layer of ["disk", "arms", "core"]) {
    if (!layers[layer].checked) continue;
    sample[layer].forEach((positions, index) => {
      ctx.fillStyle = palettes[layer][index];
      ctx.globalAlpha = layer === "disk" ? .20 + index * .07 : .22 + index * .11;
      const size = index > 3 ? 1.55 + (camera.zoom - 1) * .24 : .88;
      for (let i = 0; i < positions.length; i += 3) {
        const [x, y] = project(positions[i], positions[i + 1], positions[i + 2]);
        if (x < 0 || x > width || y < 0 || y > height) continue;
        ctx.fillRect(x, y, size, size);
      }
    });
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  if (layers.guides.checked) {
    ctx.strokeStyle = "#bdeba872";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let step = 0; step <= 120; step++) {
        const radius = .21 + .80 * step / 120;
        const angle = armAngle(radius, arm, pitch);
        const [x, y] = project(radius * Math.cos(angle), radius * Math.sin(angle), 0);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  const [sunX, sunY] = project(sun.x, sun.y, sun.z);
  if (sunX > 9 && sunX < width - 9 && sunY > 40 && sunY < height - 9) {
    ctx.fillStyle = "#fff2a6";
    ctx.strokeStyle = "#fff2a6";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 4.5, 0, TAU);
    ctx.stroke();
    ctx.fillRect(sunX - 1, sunY - 1, 2, 2);
    const labelX = sunX > width - 92 ? sunX - 32 : sunX + 10;
    ctx.font = "12px 'Microsoft YaHei', sans-serif";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0a1020";
    ctx.strokeText("太阳", labelX, sunY - 8);
    ctx.fillText("太阳", labelX, sunY - 8);
  }
}

function draw() {
  if (!stars || !field) return;
  const camera = cameraAt(time);
  drawScene(ctx, field, camera);
  if (sceneOutput.textContent !== camera.label) sceneOutput.textContent = camera.label;
}

function scheduleDraw() {
  if (drawRequest) return;
  drawRequest = requestAnimationFrame(() => {
    drawRequest = 0;
    draw();
  });
}

function makeField(ctx, width, height) {
  const background = ctx.createRadialGradient(width * .48, height * .48, 0, width * .5, height * .49, Math.max(width, height) * .66);
  background.addColorStop(0, "#121a33");
  background.addColorStop(.66, "#080f21");
  background.addColorStop(1, "#050915");
  const random = seededRandom(31415);
  const backgroundStars = Array.from({ length: 125 }, () => [random() * width, random() * height]);
  return { width, height, background, backgroundStars };
}

function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  field = makeField(ctx, width, height);
  scheduleDraw();
}

function updateModel() {
  starSeed = Math.min(9999, Math.max(1, Math.round(Number(seedInput.value)) || defaults.seed));
  const count = Number(countInput.value);
  starPitch = Number(pitchInput.value);
  stars = makeStars(starSeed, starPitch, count);
  pitchOutput.value = starPitch + "°";
  countOutput.value = formatNumber.format(count);
  scheduleDraw();
}

function updateTimeline() {
  timeInput.value = time.toFixed(2);
  timeOutput.value = time.toFixed(1) + " s";
  for (const button of sceneButtons) {
    button.setAttribute("aria-pressed", String(Math.abs(Number(button.dataset.time) - time) < .051));
  }
}

function stop() {
  playing = false;
  cancelAnimationFrame(animation);
  playButton.textContent = time >= 10 ? "重播飞越" : "播放飞越";
}

function advance(timestamp) {
  if (!playing) return;
  if (!previousTime) previousTime = timestamp;
  time = Math.min(10, time + Math.min(.1, (timestamp - previousTime) / 1000));
  previousTime = timestamp;
  if (timestamp - lastDraw >= 32 || time >= 10) {
    lastDraw = timestamp;
    updateTimeline();
    draw();
  }
  if (time >= 10) stop();
  else animation = requestAnimationFrame(advance);
}

function seek(seconds) {
  time = seconds;
  stop();
  updateTimeline();
  scheduleDraw();
}

playButton.addEventListener("click", () => {
  if (playing) {
    stop();
    return;
  }
  if (time >= 10) time = 0;
  playing = true;
  previousTime = 0;
  lastDraw = 0;
  playButton.textContent = "暂停飞越";
  animation = requestAnimationFrame(advance);
});
timeInput.addEventListener("input", () => seek(Number(timeInput.value)));
for (const button of sceneButtons) button.addEventListener("click", () => seek(Number(button.dataset.time)));
for (const button of pitchButtons) button.addEventListener("click", () => {
  pitchInput.value = button.dataset.pitch;
  updateModel();
});
for (const input of [pitchInput, countInput]) input.addEventListener("input", updateModel);
seedInput.addEventListener("change", () => {
  seedInput.value = String(Math.min(9999, Math.max(1, Math.round(Number(seedInput.value)) || defaults.seed)));
  updateModel();
});
for (const checkbox of Object.values(layers)) checkbox.addEventListener("change", scheduleDraw);

function downloadFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function freezeFrame() {
  time = Number(time.toFixed(2));
  stop();
  updateTimeline();
  draw();
  return time;
}

const exportStatus = document.querySelector("#galaxy-export-status");
const exportPng = document.querySelector("#galaxy-png");
const exportComparison = document.querySelector("#galaxy-compare-png");
const comparisonDownload = document.querySelector("#galaxy-comparison-download");
const comparisonImage = document.querySelector("#galaxy-comparison-image");
let comparisonUrl;
exportPng.addEventListener("click", () => {
  if (!field || !stars) return;
  const seconds = freezeFrame();
  const { width, height } = field;
  const output = document.createElement("canvas");
  output.width = Math.round(width * 2);
  output.height = Math.round(height * 2);
  const outputCtx = output.getContext("2d");
  outputCtx.scale(2, 2);
  drawScene(outputCtx, makeField(outputCtx, width, height), cameraAt(time));
  const name = `galaxy-seed-${starSeed}-${starPitch}deg-${seconds.toFixed(2)}s.png`;
  exportPng.disabled = true;
  output.toBlob(blob => {
    exportPng.disabled = false;
    if (!blob) {
      exportStatus.textContent = "生成 PNG 失败，请重试。";
      return;
    }
    downloadFile(blob, name);
    exportStatus.textContent = `已生成 ${seconds.toFixed(2)} 秒的 PNG · ${output.width} × ${output.height}。`;
  }, "image/png");
});

exportComparison.addEventListener("click", () => {
  if (!stars) return;
  const seconds = freezeFrame();
  const seed = starSeed;
  const count = Number(countInput.value);
  const camera = cameraAt(seconds);
  const angles = [starPitch === 12 ? 28 : 12, starPitch].sort((a, b) => a - b);
  const output = document.createElement("canvas");
  output.width = 1600;
  output.height = 900;
  const board = output.getContext("2d");
  const panel = document.createElement("canvas");
  panel.width = 764;
  panel.height = 730;
  const panelContext = panel.getContext("2d");
  const panelField = makeField(panelContext, panel.width, panel.height);
  board.fillStyle = "#0b1221";
  board.fillRect(0, 0, output.width, output.height);
  board.fillStyle = "#f1f5fb";
  board.font = '700 32px "Microsoft YaHei", sans-serif';
  board.fillText("银河旋臂张角 · 同帧对照", 26, 47);
  board.fillStyle = "#b4c6df";
  board.font = '21px "Microsoft YaHei", sans-serif';
  board.fillText(`种子 ${seed}  /  ${formatNumber.format(count)} 个示意点  /  ${seconds.toFixed(2)} 秒 · ${camera.label}`, 26, 82);
  angles.forEach((angle, index) => {
    const x = 26 + index * 784;
    const sample = angle === starPitch ? stars : makeStars(seed, angle, count);
    drawScene(panelContext, panelField, camera, sample, angle);
    board.drawImage(panel, x, 112);
    board.strokeStyle = "#405775";
    board.strokeRect(x - .5, 111.5, panel.width + 1, panel.height + 1);
    board.fillStyle = "#d9efae";
    board.font = '700 24px "Microsoft YaHei", sans-serif';
    board.fillText(`${angle}°${angle === starPitch ? " · 当前张角" : " · 参考张角"}`, x, 875);
  });
  board.fillStyle = "#b4c6df";
  board.font = '18px "Microsoft YaHei", sans-serif';
  board.textAlign = "right";
  board.fillText("程序化示意 · 未用观测星表标定", 1574, 875);
  exportComparison.disabled = true;
  output.toBlob(blob => {
    exportComparison.disabled = false;
    if (!blob) {
      exportStatus.textContent = "生成对照图失败，请重试。";
      return;
    }
    if (comparisonUrl) URL.revokeObjectURL(comparisonUrl);
    comparisonUrl = URL.createObjectURL(blob);
    comparisonDownload.href = comparisonUrl;
    comparisonDownload.download = `galaxy-${angles.join('-')}deg-seed-${seed}-${seconds.toFixed(2)}s.png`;
    comparisonImage.src = comparisonUrl;
    comparisonImage.alt = `${angles.join('° 与 ')}° 的两幅银河构图，共用 ${seconds.toFixed(2)} 秒的镜头视角。`;
    document.querySelector("#galaxy-comparison-caption").textContent = `种子 ${seed} · ${formatNumber.format(count)} 个示意点 · ${seconds.toFixed(2)} 秒 · ${camera.label}`;
    document.querySelector("#galaxy-comparison-output").hidden = false;
    document.querySelector("#galaxy-comparison-jump").hidden = false;
    exportStatus.textContent = `已生成 ${angles.join('° / ')}° 对照图 · 1600 × 900。可在下方预览和下载。`;
  }, "image/png");
});

document.querySelector("#galaxy-settings").addEventListener("click", () => {
  const seconds = freezeFrame();
  const settings = {
    version: 1,
    model: { seed: starSeed, pitchDegrees: starPitch, pointCount: Number(countInput.value) },
    layers: Object.fromEntries(Object.entries(layers).map(([name, checkbox]) => [name, checkbox.checked])),
    camera: { timeSeconds: seconds, keyframes: cameraPath },
    viewport: field ? { width: field.width, height: field.height } : null,
    scope: "结构与镜头示意，非观测数据",
  };
  downloadFile(new Blob([JSON.stringify(settings, null, 2) + "\n"], { type: "application/json" }), "galaxy-settings.json");
  exportStatus.textContent = `已生成 ${starPitch}°、种子 ${starSeed} 的参数记录。`;
});

function validSettings(settings) {
  const { model, layers: visibility, camera } = settings ?? {};
  return settings?.version === 1 && Number.isInteger(model?.seed) && model.seed >= 1 && model.seed <= 9999
    && Number.isInteger(model.pitchDegrees) && model.pitchDegrees >= 8 && model.pitchDegrees <= 34
    && Number.isInteger(model.pointCount) && model.pointCount >= 3000 && model.pointCount <= 18000 && model.pointCount % 1000 === 0
    && Object.keys(layers).every(name => typeof visibility?.[name] === "boolean")
    && Number.isFinite(camera?.timeSeconds) && camera.timeSeconds >= 0 && camera.timeSeconds <= 10;
}

const importControl = document.querySelector("#galaxy-import");
importControl.addEventListener("change", async () => {
  const [file] = importControl.files;
  if (!file) return;
  importControl.disabled = true;
  try {
    if (file.size > 32 * 1024) throw new Error("Oversized settings");
    const settings = JSON.parse(await file.text());
    if (!validSettings(settings)) throw new Error("Invalid settings");
    seedInput.value = settings.model.seed;
    pitchInput.value = settings.model.pitchDegrees;
    countInput.value = settings.model.pointCount;
    for (const [name, checkbox] of Object.entries(layers)) checkbox.checked = settings.layers[name];
    updateModel();
    seek(settings.camera.timeSeconds);
    exportStatus.textContent = `已载入 ${starPitch}°、种子 ${starSeed} 的构图，时间停在 ${time.toFixed(2)} 秒。`;
  } catch {
    exportStatus.textContent = "无法载入。请选择从本工作台导出的参数 JSON。";
  } finally {
    importControl.value = "";
    importControl.disabled = false;
  }
});

document.querySelector("#reset").addEventListener("click", () => {
  pitchInput.value = defaults.pitch;
  countInput.value = defaults.count;
  seedInput.value = defaults.seed;
  for (const checkbox of Object.values(layers)) checkbox.checked = true;
  seek(0);
  updateModel();
});
new ResizeObserver(resize).observe(canvas);
resize();
updateModel();
