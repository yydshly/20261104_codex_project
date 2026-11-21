function createImmortalMusic(source, onChange) {
  const audio = new Audio();
  const volume = .38;
  audio.preload = "none";
  audio.loop = true;
  audio.volume = volume;
  audio.src = source;

  let enabled = true, status = "ready", request = 0;

  function update(next, notify = false) {
    if (status === next && !notify) return;
    status = next;
    onChange?.({enabled, playing: status === "playing", status});
  }

  function failed(error, attempt) {
    if (attempt !== request) return;
    update(error?.name === "NotAllowedError" ? "blocked" :
      error?.name === "AbortError" ? "paused" : "error");
  }

  function start() {
    if (!enabled || status === "loading") return;
    if (audio.error) audio.load();
    if (!audio.paused) return;
    const attempt = ++request;
    audio.volume = .04;
    update("loading");
    try {
      Promise.resolve(audio.play()).then(() => {
        if (attempt !== request || audio.paused) return;
        update("playing");
        const began = performance.now();
        function fade(now) {
          if (attempt !== request || audio.paused) return;
          const progress = Math.min(1, (now - began) / 450);
          audio.volume = .04 + (volume - .04) * progress;
          if (progress < 1) requestAnimationFrame(fade);
        }
        requestAnimationFrame(fade);
      }, error => failed(error, attempt));
    } catch (error) {
      failed(error, attempt);
    }
  }

  function toggle() {
    if (enabled && (status === "loading" || status === "playing")) {
      ++request;
      enabled = false;
      audio.pause();
      update("paused");
      return;
    }
    enabled = true;
    start();
  }

  function select(nextSource) {
    ++request;
    audio.pause();
    audio.src = nextSource;
    update(enabled ? "ready" : "paused", true);
    start();
  }

  audio.addEventListener("pause", () => {
    if (audio.paused && status === "playing") update("paused");
  });
  audio.addEventListener("error", () => {
    ++request;
    if (enabled) update("error");
  });

  return {
    start,
    toggle,
    select,
    get playing() { return status === "playing" && !audio.paused },
    get enabled() { return enabled },
    get time() { return audio.currentTime }
  };
}
