import { useCallback, useEffect, useRef, useState } from 'react';

export const wrap = (value, length) => ((value % length) + length) % length;
export const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export function useStageSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 980, height: 400 });

  useEffect(() => {
    const stage = ref.current;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ width, height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

export function useSequence({ ref, length, initial = 0, pull, dragDirection = 1, onTargetChange }) {
  const [position, setPosition] = useState(initial);
  const clock = useRef({ position: initial, target: initial, frame: 0, last: 0 });
  const pointer = useRef(null);
  const dragged = useRef(false);
  const wheelTimer = useRef();

  const animateTo = useCallback((target) => {
    const motion = clock.current;
    const previous = Math.round(motion.target);
    motion.target = target;
    const next = Math.round(target);
    if (next !== previous) onTargetChange?.(wrap(next, length));
    if (motion.frame) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = (now) => {
      const elapsed = motion.last ? Math.min(50, now - motion.last) : 16;
      motion.position += (motion.target - motion.position) * (1 - Math.exp(-elapsed * 0.008));
      if (reduced || Math.abs(motion.target - motion.position) < 0.002) {
        motion.position = motion.target;
        motion.frame = 0;
        motion.last = 0;
      } else {
        motion.last = now;
        motion.frame = requestAnimationFrame(frame);
      }
      setPosition(motion.position);
    };
    motion.frame = requestAnimationFrame(frame);
  }, [length, onTargetChange]);

  const step = (delta) => {
    clearTimeout(wheelTimer.current);
    animateTo(Math.round(clock.current.target) + delta);
  };

  const select = (index) => {
    const target = Math.round(clock.current.target);
    const distance = wrap(index - target + length / 2, length) - length / 2;
    step(distance);
  };

  useEffect(() => {
    const stage = ref.current;
    const onWheel = (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      clearTimeout(wheelTimer.current);
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 180 : 1;
      if (!raw) return;
      const current = clock.current;
      animateTo(current.target + clamp(raw * unit / 170, -1.2, 1.2));
      wheelTimer.current = setTimeout(() => animateTo(Math.round(current.target)), 150);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', onWheel);
      clearTimeout(wheelTimer.current);
      cancelAnimationFrame(clock.current.frame);
      clock.current.frame = 0;
      clock.current.last = 0;
    };
  }, [animateTo, ref]);

  const release = (event) => {
    if (!pointer.current || pointer.current.id !== event.pointerId) return;
    pointer.current = null;
    if (dragged.current) animateTo(Math.round(clock.current.target));
  };

  return {
    position,
    active: wrap(Math.round(position), length),
    select,
    step,
    bind: {
      onPointerDown(event) {
        if (!event.isPrimary || event.button !== 0) return;
        clearTimeout(wheelTimer.current);
        dragged.current = false;
        pointer.current = { id: event.pointerId, x: event.clientX, start: clock.current.target };
      },
      onPointerMove(event) {
        const start = pointer.current;
        if (!start || start.id !== event.pointerId) return;
        const offset = event.clientX - start.x;
        if (!dragged.current && Math.abs(offset) < 6) return;
        if (!dragged.current) event.currentTarget.setPointerCapture(event.pointerId);
        dragged.current = true;
        animateTo(start.start + dragDirection * offset / pull);
      },
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
      onPointerLeave(event) {
        if (!dragged.current) release(event);
      },
      onClickCapture(event) {
        if (!dragged.current || event.detail === 0) return;
        event.stopPropagation();
        dragged.current = false;
      },
      onKeyDown(event) {
        if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
          step(['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1);
        }
      },
    },
  };
}
