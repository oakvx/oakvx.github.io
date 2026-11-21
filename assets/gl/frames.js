import { motion, still } from './shell.js';

// A paused scene consumes no animation frames, even if it is still in the DOM.
export function visibleFrames(element, draw, { enabled = () => true, pause = () => {} } = {}) {
  if (!('IntersectionObserver' in window)) return;
  let visible = false, frame = 0, last = 0;
  const ready = () => visible && !document.hidden && !still() && enabled();
  function update() {
    if (ready()) {
      if (!frame) { last = 0; frame = requestAnimationFrame(loop); }
    } else {
      cancelAnimationFrame(frame); frame = 0; pause();
    }
  }
  function loop(now) {
    if (!ready()) { update(); return; }
    draw(now, last ? Math.min(now - last, 80) : 0);
    last = now;
    frame = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(element);
  for (const name of ['visibilitychange','gl-motion','gl-quality','gl-select']) document.addEventListener(name,update);
  motion.addEventListener('change',update);
}

export const whenIdle = task => 'requestIdleCallback' in window ? requestIdleCallback(task,{timeout:1400}) : setTimeout(task,500);
