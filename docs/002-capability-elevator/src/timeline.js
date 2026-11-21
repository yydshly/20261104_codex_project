const clamp = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function createTimeline(tour) {
  const { floors, fps, holdSeconds, travelSeconds, finaleSeconds } = tour;
  if (!Array.isArray(floors) || floors.length === 0 || !Number.isInteger(fps) || fps < 1) {
    throw new Error('tour.json 需要至少一层楼和一个正整数帧率。');
  }
  for (const value of [holdSeconds, travelSeconds, finaleSeconds]) {
    if (!Number.isFinite(value) || value <= 0) throw new Error('各段时长必须大于零。');
  }

  let cursor = 0;
  const stops = floors.map((floor, index) => {
    const hold = floor.holdSeconds ?? holdSeconds;
    if (!Number.isFinite(hold) || hold <= 0) throw new Error('楼层停留时间必须大于零。');
    const start = cursor;
    const end = start + hold;
    cursor = end + (index === floors.length - 1 ? 0 : travelSeconds);
    return { start, end };
  });
  const lastFloor = floors.length - 1;
  const finaleStart = stops[lastFloor].end;
  const duration = finaleStart + finaleSeconds;

  function at(seconds) {
    const time = Math.max(0, Math.min(duration, seconds));
    const frame = { time, progress: time / duration, reveal: 0 };
    if (time >= finaleStart) {
      return { ...frame, floorIndex: lastFloor, lift: lastFloor, door: 1,
        reveal: ease((time - finaleStart) / (finaleSeconds * 0.72)), phase: 'finale' };
    }
    const index = stops.findLastIndex(({ start }) => time >= start);
    const stop = stops[index];
    if (time <= stop.end) return { ...frame, floorIndex: index, lift: index, door: 1, phase: 'stop' };
    const travel = (time - stop.end) / travelSeconds;
    const lift = index + ease((travel - 0.19) / 0.62);
    const door = travel < 0.2 ? 1 - ease(travel / 0.2) : ease((travel - 0.80) / 0.2);
    return { ...frame, floorIndex: Math.round(lift), lift, door, phase: 'travel' };
  }

  return { stops, finaleStart, duration, fps, frames: Math.ceil(duration * fps - 1e-8), at };
}
