'use strict';
(() => {
  const bank = window.portfolioAsciiFrames;
  const button = document.querySelector('[data-ascii-toggle]');
  if (!bank || !button) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('gl-ascii-paused') === 'true'; } catch {}
  let timer = null;
  let tick = 0;
  const animals = [...document.querySelectorAll('[data-ascii]')].map((element, index) => ({
    element, pre: element.querySelector('pre'), kind: element.dataset.ascii,
    visible: !('IntersectionObserver' in window), offset: index * 7, frame: -1
  })).filter(item => item.pre && bank[item.kind]);
  const paused = () => userPaused || reduced.matches;
  const visible = item => item.visible;
  function label() {
    const en = document.documentElement.lang === 'en';
    button.textContent = paused() ? (en ? 'Motion paused' : 'Animazioni in pausa') : (en ? 'Pause animations' : 'Ferma animazioni');
    if (userPaused && !reduced.matches) button.textContent = en ? 'Resume animations' : 'Riprendi animazioni';
    if (reduced.matches) button.textContent = en ? 'Reduced motion enabled' : 'Movimento ridotto attivo';
    button.setAttribute('aria-pressed', String(paused()));
    button.disabled = reduced.matches;
  }
  function draw() {
    tick++;
    for (const item of animals) {
      if (!visible(item)) continue;
      const step = tick + item.offset;
      const frame = item.kind === 'owl' ? (step % 31 === 28 || step % 31 === 29 ? 1 : 0) : step % bank[item.kind].length;
      if (frame !== item.frame) { item.pre.textContent = bank[item.kind][frame]; item.frame = frame; }
    }
  }
  function sync() {
    document.documentElement.dataset.motionPaused = String(paused());
    const active = !paused() && !document.hidden;
    for (const item of animals) item.element.classList.toggle('ascii-playing', active && visible(item));
    const shouldRun = active && animals.some(visible);
    if (shouldRun && timer === null) timer = window.setInterval(draw, 180);
    if (!shouldRun && timer !== null) { window.clearInterval(timer); timer = null; }
    if (paused()) for (const item of animals) { item.pre.textContent = bank[item.kind][0]; item.frame = 0; }
    label();
    document.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused: paused() } }));
  }
  if ('IntersectionObserver' in window) {
    const byElement = new Map(animals.map(item => [item.element, item]));
    const observer = new window.IntersectionObserver(entries => {
      for (const entry of entries) byElement.get(entry.target).visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.05 });
    animals.forEach(item => observer.observe(item.element));
  }
  button.hidden = false;
  button.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('gl-ascii-paused', String(userPaused)); } catch {}
    sync();
  });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('portfolio:language', label);
  document.addEventListener('portfolio:scene', sync);
  window.addEventListener('pagehide', () => { if (timer !== null) window.clearInterval(timer); timer = null; });
  window.addEventListener('pageshow', sync);
  sync();
})();
