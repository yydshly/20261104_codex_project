window.createShuRoadLocationPlayer = function createShuRoadLocationPlayer({
  audio, clips, trims = window.shuRoadAudioTrims, onChange = () => {}
}) {
  function buildTrack(src, sourceDuration, trim) {
    const start = Number.isFinite(trim?.start) ? Math.max(0, trim.start) : 0;
    const end = Number.isFinite(trim?.end) ? Math.min(sourceDuration, trim.end) : sourceDuration;
    if (end - start < 0.1) {
      return { src, start: 0, end: sourceDuration, duration: sourceDuration, skip: [], trimEnd: false };
    }
    const skip = [];
    for (const [from, to] of trim?.skip ?? []) {
      if (Number.isFinite(from) && Number.isFinite(to) && from > start && to < end
        && to - from >= 0.08 && (!skip.length || from >= skip.at(-1)[1])) skip.push([from, to]);
    }
    const cut = skip.reduce((total, [from, to]) => total + to - from, 0);
    return { src, start, end, duration: end - start - cut, skip, trimEnd: end < sourceDuration - 0.01 };
  }

  const tracks = clips.map((clip, index) => {
    const duration = Number(clip.poemSeconds);
    if (!clip.poem || !Number.isFinite(duration) || duration <= 0) {
      throw new TypeError(`Missing poem audio or duration for landmark ${index + 1}`);
    }
    const descriptionDuration = Number(clip.descriptionSeconds);
    return {
      poem: buildTrack(clip.poem, duration, trims?.[index]?.poem),
      description: clip.description && Number.isFinite(descriptionDuration) && descriptionDuration > 0
        ? buildTrack(clip.description, descriptionDuration, trims?.[index]?.description)
        : null,
      descriptionText: clip.descriptionText
    };
  });
  if (!tracks.length) throw new TypeError('At least one narrated landmark is required');

  const visited = new Set();
  const heard = new Set();
  const recited = new Set();
  const described = new Set();
  const progress = {
    poem: { position: 0, ended: false },
    description: { position: 0, ended: false }
  };
  let index = -1;
  let phase = 'poem';
  let loaded = null;
  let pendingSeek = null;
  let unlocked = false;
  let enabled = true;
  let running = false;
  let describeAfterPoem = true;
  let audioError = '';
  let playRequest = 0;
  let boundaryTimer = null;

  const currentTrack = () => tracks[index]?.[phase];
  const guideComplete = () => index >= 0 && progress.poem.ended
    && (!tracks[index].description || progress.description.ended);

  function currentPosition(clipPhase = phase) {
    const track = tracks[index]?.[clipPhase];
    const { ended, position } = progress[clipPhase];
    if (clipPhase !== phase || !track || ended || loaded !== track || pendingSeek !== null || !Number.isFinite(audio.currentTime)) {
      return position;
    }
    return Math.max(track.start, Math.min(audio.currentTime, track.end));
  }

  // Keep UI and camera cues on a continuous speech clock while the media skips source silence.
  function elapsedTime(clipPhase = phase) {
    const track = tracks[index]?.[clipPhase];
    if (!track) return 0;
    const position = currentPosition(clipPhase);
    const skipped = track.skip.reduce((total, [from, to]) => total + Math.max(0, Math.min(position, to) - from), 0);
    return Math.max(0, Math.min(position - track.start - skipped, track.duration));
  }

  function sourceTime(track, elapsed) {
    let position = track.start + Math.max(0, elapsed);
    for (const [from, to] of track.skip) {
      if (position < from) break;
      position += to - from;
    }
    return Math.min(position, track.end);
  }

  function snapshot() {
    const location = tracks[index];
    const track = currentTrack();
    const elapsed = elapsedTime();
    const duration = track?.duration ?? 0;
    return {
      index, running, ended: progress[phase].ended, unlocked, enabled, audioError,
      hasArrival: Boolean(location),
      canExplain: Boolean(location?.description),
      explaining: Boolean(location) && phase === 'description',
      complete: guideComplete(),
      visitedCount: visited.size,
      heardCount: heard.size,
      elapsed, duration,
      phase: location ? phase : 'description',
      phaseElapsed: elapsed,
      phaseDuration: duration,
      phaseSourceTime: currentPosition(),
      poemElapsed: elapsedTime('poem'),
      poemDuration: location?.poem.duration ?? 0,
      descriptionDuration: location?.description?.duration ?? 0,
      descriptionText: location?.descriptionText
    };
  }

  function applySeek() {
    const track = currentTrack();
    if (!track || loaded !== track || pendingSeek === null || audio.readyState < 1) return;
    const limit = Number.isFinite(audio.duration) ? audio.duration : track.end;
    audio.currentTime = Math.min(pendingSeek, limit);
    pendingSeek = null;
  }

  function pause() {
    progress[phase].position = currentPosition();
    running = false;
    playRequest++;
    stopBoundaryTimer();
    audio.pause();
  }

  function fail(error) {
    pause();
    if (error?.name === 'NotAllowedError') {
      unlocked = false;
      audioError = '浏览器需要一次操作才能播放，请点「重试语音」。';
    } else {
      audioError = '语音暂时无法播放，请点「重试语音」。';
    }
    onChange();
  }

  function play() {
    const track = currentTrack();
    const { ended, position } = progress[phase];
    if (!track || running || ended || !unlocked || !enabled) return;
    const requestedIndex = index;
    const requestedPhase = phase;
    const request = ++playRequest;
    running = true;
    audioError = '';
    try {
      if (loaded !== track || audio.error) {
        loaded = track;
        pendingSeek = position;
        audio.src = track.src;
        audio.load();
      }
      applySeek();
      if ('preservesPitch' in audio) audio.preservesPitch = false;
      else if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
      audio.playbackRate = phase === 'poem' ? 0.92 : 1.04;
      Promise.resolve(audio.play()).then(() => {
        if (request !== playRequest || !running) return;
        if (requestedPhase === 'poem') heard.add(requestedIndex);
        scheduleBoundary();
      }, error => {
        if (request === playRequest && running) fail(error);
      });
    } catch (error) {
      fail(error);
    }
  }

  function selectPhase(nextPhase) {
    if (phase === nextPhase) return;
    pause();
    phase = nextPhase;
    pendingSeek = loaded === currentTrack() ? progress[phase].position : null;
    audioError = '';
  }

  function restartIfEnded() {
    if (!progress[phase].ended) return;
    progress[phase].ended = false;
    progress[phase].position = currentTrack().start;
    pendingSeek = progress[phase].position;
  }

  function arrive(nextIndex) {
    if (!Number.isInteger(nextIndex) || !tracks[nextIndex]) return false;
    visited.add(nextIndex);
    if (nextIndex === index) return false;
    pause();
    index = nextIndex;
    describeAfterPoem = true;
    const location = tracks[index];
    progress.poem.ended = recited.has(index);
    progress.poem.position = progress.poem.ended ? location.poem.end : location.poem.start;
    progress.description.ended = described.has(nextIndex);
    progress.description.position = progress.description.ended ? location.description.end : (location.description?.start ?? 0);
    phase = progress.poem.ended && location.description && !progress.description.ended ? 'description' : 'poem';
    pendingSeek = loaded === currentTrack() ? progress[phase].position : null;
    audioError = '';
    play();
    onChange();
    return true;
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    play();
    onChange();
  }

  function toggle() {
    if (running) {
      enabled = false;
      pause();
    } else if (index < 0) {
      enabled = !unlocked || !enabled;
      unlocked = true;
    } else if (guideComplete()) {
      replay();
      return;
    } else {
      unlocked = true;
      enabled = true;
      if (phase === 'description' && progress.description.ended) {
        selectPhase('poem');
      }
      restartIfEnded();
      play();
    }
    onChange();
  }

  function replay(nextIndex = index) {
    if (!Number.isInteger(nextIndex) || !tracks[nextIndex]) return false;
    const location = tracks[nextIndex];
    pause();
    index = nextIndex;
    visited.add(index);
    phase = 'poem';
    unlocked = true;
    enabled = true;
    describeAfterPoem = true;
    progress.poem.ended = false;
    progress.poem.position = location.poem.start;
    progress.description.ended = false;
    progress.description.position = location.description?.start ?? 0;
    pendingSeek = loaded === location.poem ? location.poem.start : null;
    play();
    onChange();
    return true;
  }

  function explain() {
    if (!tracks[index]?.description) return false;
    if (phase === 'description' && running) {
      enabled = false;
      pause();
    } else {
      selectPhase('description');
      unlocked = true;
      enabled = true;
      restartIfEnded();
      play();
    }
    onChange();
    return true;
  }

  function poem() {
    if (index < 0) return false;
    selectPhase('poem');
    unlocked = true;
    enabled = true;
    describeAfterPoem = !described.has(index);
    restartIfEnded();
    play();
    onChange();
    return true;
  }

  function seek(seconds) {
    const track = currentTrack();
    if (!track || !Number.isFinite(seconds)) return;
    const { duration } = track;
    if (seconds >= duration && running) pause();
    progress[phase].position = sourceTime(track, Math.min(seconds, duration));
    progress[phase].ended = seconds >= duration;
    pendingSeek = loaded === track ? progress[phase].position : null;
    applySeek();
    onChange();
  }

  function reset() {
    pause();
    index = -1;
    phase = 'poem';
    describeAfterPoem = true;
    loaded = null;
    progress.poem.position = 0;
    progress.poem.ended = false;
    progress.description.position = 0;
    progress.description.ended = false;
    pendingSeek = null;
    audioError = '';
    visited.clear();
    heard.clear();
    recited.clear();
    described.clear();
    audio.removeAttribute('src');
    audio.load();
    onChange();
  }

  function finishTrack(track) {
    if (!running || !track || loaded !== track) return;
    stopBoundaryTimer();
    audio.pause();
    progress[phase].position = track.end;
    pendingSeek = null;
    running = false;
    progress[phase].ended = true;
    playRequest++;
    if (phase === 'poem') {
      heard.add(index);
      recited.add(index);
      if (enabled && describeAfterPoem && tracks[index].description && !progress.description.ended) {
        selectPhase('description');
        play();
      }
    } else {
      described.add(index);
    }
    onChange();
  }

  function stopBoundaryTimer() {
    if (boundaryTimer === null) return;
    clearTimeout(boundaryTimer);
    boundaryTimer = null;
  }

  function scheduleBoundary() {
    stopBoundaryTimer();
    const track = currentTrack();
    if (!running || !track || loaded !== track || pendingSeek !== null || audio.paused
      || audio.seeking || !Number.isFinite(audio.currentTime)) return;
    const position = audio.currentTime;
    if (track.trimEnd && position + 0.008 >= track.end) {
      finishTrack(track);
      return;
    }
    const gap = track.skip.find(([, to]) => position < to);
    if (gap && position + 0.006 >= gap[0]) {
      audio.currentTime = gap[1];
      return; // The seeked event schedules the next boundary.
    }
    const next = gap?.[0] ?? (track.trimEnd ? track.end : null);
    if (next !== null) {
      const rate = audio.playbackRate || 1;
      boundaryTimer = setTimeout(scheduleBoundary, Math.max(8, (next - position) * 1000 / rate));
    }
  }

  audio.addEventListener('loadedmetadata', applySeek);
  audio.addEventListener('playing', () => {
    if (running && phase === 'poem' && loaded === currentTrack() && !audio.paused) heard.add(index);
    scheduleBoundary();
  });
  audio.addEventListener('timeupdate', scheduleBoundary);
  audio.addEventListener('seeked', scheduleBoundary);
  audio.addEventListener('ended', () => {
    if (audio.ended) finishTrack(currentTrack());
  });
  audio.addEventListener('error', () => {
    if (running && loaded === currentTrack() && audio.error) fail(audio.error);
  });

  return { arrive, unlock, toggle, replay, explain, poem, seek, snapshot, reset };
};
