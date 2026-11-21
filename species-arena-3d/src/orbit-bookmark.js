const magnetModels = new Set(['blender', 'blender-wing']);

export function readOrbitBookmark(search, heroIds, duration) {
  const params = new URLSearchParams(search);
  const requestedHero = params.get('hero');
  const requestedComparison = params.get('compare');
  const requestedTime = Number(params.get('t'));
  const mission = params.get('mission') === 'relay' ? 'relay' : null;
  const model = params.get('model');

  return {
    heroId: heroIds.includes(requestedHero) ? requestedHero : null,
    compareId: !mission && heroIds.includes(requestedComparison) && requestedComparison !== requestedHero ? requestedComparison : null,
    time: Number.isFinite(requestedTime) ? Math.min(duration, Math.max(0, requestedTime)) : 0,
    mission,
    model: magnetModels.has(model) ? model : null,
  };
}

export function makeOrbitBookmark({ heroId, compareId, time, mission, model }, base = window.location.href) {
  const url = new URL('./orbit.html', base);
  url.searchParams.set('hero', heroId);
  url.searchParams.set('t', String(Number(time.toFixed(2))));
  if (mission === 'relay') url.searchParams.set('mission', mission);
  else if (compareId && compareId !== heroId) url.searchParams.set('compare', compareId);
  if (magnetModels.has(model)) url.searchParams.set('model', model);
  return url.href;
}
