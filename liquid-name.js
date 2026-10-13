'use strict';
(() => {
  const artwork = document.querySelector('[data-liquid-name]');
  if (!artwork) return;
  const body = artwork.querySelector('[data-water-body]');
  const back = artwork.querySelector('[data-water-back]');
  const surface = artwork.querySelector('[data-water-surface]');
  const stream = artwork.querySelector('[data-water-stream]');
  const bubbles = [...artwork.querySelectorAll('[data-water-bubble]')];
  if (!body || !back || !surface || !stream) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  let elapsed = 0;
  let lastTime = null;
  let visible = !('IntersectionObserver' in window);
  const paused = () => reduced.matches || document.documentElement.dataset.motionPaused === 'true';
  const running = () => visible && !document.hidden && !paused();

  function wave(level, phase, amplitude) {
    let path = '';
    for (let x = 670; x <= 1110; x += 10) {
      const y = level + Math.sin((x - 670) / 440 * Math.PI * 3 - phase) * amplitude
        + Math.sin((x - 670) / 440 * Math.PI * 5 + phase * .65) * amplitude * .3;
      path += (x === 670 ? 'M' : 'L') + x + ' ' + y.toFixed(2);
    }
    return path;
  }
  function render(progress, phase) {
    const eased = progress * progress * (3 - 2 * progress);
    const level = 198 - eased * 157;
    const front = wave(level, phase, 4.5);
    body.setAttribute('d', front + 'V225H670Z');
    back.setAttribute('d', wave(level - 4, phase + 1.3, 3.5) + 'V225H670Z');
    surface.setAttribute('d', front);
    stream.setAttribute('d', 'M924 0V' + level.toFixed(2));
    stream.setAttribute('opacity', String(progress > .04 && progress < .95 ? Math.sin(progress * Math.PI) * .7 : 0));
    bubbles.forEach((bubble, index) => {
      const travel = Math.max(168 - level, 1);
      bubble.setAttribute('cy', (168 - (phase * 12 + index * 27) % travel).toFixed(2));
      bubble.setAttribute('opacity', progress > .2 ? '1' : '0');
    });
  }
  function tick(now) {
    frame = null;
    if (!running()) return;
    if (lastTime !== null) elapsed += Math.min(now - lastTime, 64);
    lastTime = now;
    render(Math.max(0, Math.min(1, (elapsed - 180) / 4200)), elapsed * .0018);
    frame = window.requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    if (paused()) {
      elapsed = Math.max(elapsed, 4380);
      render(1, 0);
    } else if (running()) frame = window.requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    }, { threshold: 0 });
    observer.observe(artwork);
  }
  document.addEventListener('portfolio:motion', sync);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', () => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
  });
  if (!paused()) render(0, 0);
  sync();
})();
