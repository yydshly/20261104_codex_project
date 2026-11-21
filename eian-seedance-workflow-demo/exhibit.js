(() => {
  const video = document.getElementById("study-video");
  const note = document.getElementById("player-note");
  const status = document.getElementById("player-status");
  const clips = Array.from(document.querySelectorAll("[data-clip][data-src]"));
  const cues = document.querySelectorAll("[data-seek]");
  if (!video || !note || !status || !clips.length) return;

  let activeClip = clips.find((button) => button.getAttribute("aria-pressed") === "true") || clips[0];
  let pendingSeek = null;

  function clipLabel() {
    return activeClip.dataset.clip === "all" ? "A / B / C 并排" : `${activeClip.dataset.clip} 组`;
  }

  function showUnavailable() {
    pendingSeek = null;
    status.textContent = `${clipLabel()}暂时无法播放，可用页面上的文件链接打开。`;
  }

  function applyPendingSeek() {
    if (!pendingSeek || video.readyState < 1 || !Number.isFinite(video.duration)) return;

    const { time, cue } = pendingSeek;
    pendingSeek = null;
    const position = cue
      ? Math.min(Math.max(time, 0), video.duration)
      : (time >= 0 && time <= video.duration ? time : 0);
    video.pause();
    video.currentTime = position;

    if (cue) {
      const observation = cue.dataset.observation?.trim();
      const timestamp = `${clipLabel()} · ${position.toFixed(2)} 秒`;
      status.textContent = observation ? `${timestamp} · ${observation}` : timestamp;
    }
  }

  clips.forEach((button) => {
    button.addEventListener("click", () => {
      if (button === activeClip) return;

      const previousTime = pendingSeek?.time ?? video.currentTime;
      pendingSeek = { time: previousTime };
      activeClip = button;
      clips.forEach((clip) => clip.setAttribute("aria-pressed", String(clip === button)));
      note.textContent = button.dataset.description || "";
      status.textContent = `已切换到 ${clipLabel()}。`;

      video.pause();
      if (button.dataset.poster) {
        video.poster = button.dataset.poster;
      } else {
        video.removeAttribute("poster");
      }
      video.src = button.dataset.src;
      video.load();
    });
  });

  cues.forEach((cue) => {
    cue.addEventListener("click", () => {
      const value = cue.dataset.seek.trim();
      const time = Number(value);
      if (!value || !Number.isFinite(time)) return;
      if (video.error) {
        showUnavailable();
        return;
      }

      video.pause();
      pendingSeek = { time, cue };
      applyPendingSeek();
      if (pendingSeek) status.textContent = `正在定位 ${clipLabel()}的画面。`;
    });
  });

  video.addEventListener("loadedmetadata", applyPendingSeek);
  video.addEventListener("error", showUnavailable);
  if (video.error) showUnavailable();
})();
