const collageMotion = (() => {
  const duration = 5;
  const fps = 12;
  const layers = [
    { id: 'problem', start: .42, length: .62, dx: -260, dy: -105, rotation: -22 },
    { id: 'branches', start: 1.1, length: .52, dx: 290, dy: -34, rotation: 12 },
    { id: 'task-a', start: 1.72, length: .51, dx: -158, dy: 108, rotation: -18 },
    { id: 'task-b', start: 2.15, length: .51, dx: 0, dy: 350, rotation: -9 },
    { id: 'task-c', start: 2.58, length: .51, dx: 168, dy: 95, rotation: 14 },
    { id: 'seal', start: 3.22, length: .53, dx: 130, dy: 236, rotation: 26 },
  ];

  function pose(layer, time, mode = 'sequence') {
    const steppedTime = Math.floor((time + 1e-9) * fps) / fps;
    const start = mode === 'sequence' ? layer.start : .42;
    const progress = Math.max(0, Math.min(1, (steppedTime - start) / layer.length));
    const remaining = (1 - progress) ** 3;
    return {
      visible: progress > 0,
      transform: `translate(${layer.dx * remaining} ${layer.dy * remaining}) rotate(${layer.rotation * remaining} 180 320)`,
      phase: progress === 0 ? 'waiting' : progress === 1 ? 'done' : 'active',
    };
  }

  return { duration, fps, layers, pose };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = collageMotion;
