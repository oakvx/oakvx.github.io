'use strict';
(() => {
  const root = document.documentElement;
  if (root.dataset.paperEngine === 'ready') return;

  const reduced = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  let storedPaused = false;
  try { storedPaused = localStorage.getItem('gl-ascii-paused') === 'true'; } catch {}
  // The shared status also includes reduced motion. Do not latch that preference
  // as a user pause when this script starts while the OS preference is enabled.
  let sharedPaused = storedPaused || (root.dataset.motionPaused === 'true' && !reduced.matches);
  let pageActive = true;
  let observer = null;
  const entries = new Map();
  const active = new Map();
  const revealTargets = [...document.querySelectorAll('[data-paper-reveal]')]
    .filter(element => !element.parentElement?.closest('[data-paper-reveal]'));
  const liveTargets = [...document.querySelectorAll('[data-paper-live]')];

  revealTargets.forEach((element, index) => {
    entries.set(element, { reveal: true, live: false, visible: false, seen: false, index });
  });
  liveTargets.forEach(element => {
    const state = entries.get(element) || { reveal: false, visible: false, seen: false, index: 0 };
    state.live = true;
    entries.set(element, state);
  });

  // Nothing is hidden before enhancement. This flag only releases old reveal
  // styling; entrance effects are transient WAAPI effects on visible content.
  root.dataset.paperEngine = 'ready';
  const enabled = () => !!observer && pageActive && !document.hidden && !reduced.matches && !sharedPaused;

  function cancelEntry(element) {
    const animation = active.get(element);
    if (!animation) return;
    active.delete(element);
    animation.cancel();
  }

  function cancelEntries() {
    [...active.keys()].forEach(cancelEntry);
  }

  function enter(element, state) {
    if (!state.reveal || state.seen || !state.visible) return;
    state.seen = true;
    if (!enabled() || typeof element.animate !== 'function') return;
    const computed = typeof window.getComputedStyle === 'function'
      ? window.getComputedStyle(element) : element.style;
    const transform = computed.transform && computed.transform !== 'none' ? computed.transform : '';
    const parsedOpacity = Number.parseFloat(computed.opacity);
    const opacity = Number.isFinite(parsedOpacity) ? parsedOpacity : 1;
    const direction = state.index % 2 ? 1 : -1;
    try {
      const animation = element.animate([
        { opacity: Math.min(opacity, .45), transform: `translate3d(0, 18px, 0) rotate(${direction * 1.5}deg) ${transform}`.trim() },
        { opacity, transform: transform || 'none' }
      ], {
        duration: 620,
        delay: (state.index % 3) * 45,
        easing: 'cubic-bezier(.16, 1, .3, 1)',
        fill: 'none'
      });
      if (!animation || typeof animation.cancel !== 'function') return;
      active.set(element, animation);
      const release = () => {
        if (active.get(element) === animation) active.delete(element);
      };
      animation.onfinish = release;
      animation.oncancel = release;
    } catch {
      // A missing/partial WAAPI implementation leaves the underlying content
      // untouched and readable. Continuous decorations can still use CSS.
    }
  }

  function sync() {
    const running = enabled();
    root.dataset.paperMotion = running ? 'on' : 'off';
    if (!running) cancelEntries();
    for (const [element, state] of entries) {
      if (state.live) element.classList.toggle('paper-inview', running && state.visible);
      if (state.visible) enter(element, state);
    }
  }

  if (typeof window.IntersectionObserver === 'function') {
    try {
      observer = new window.IntersectionObserver(changes => {
        for (const change of changes) {
          const state = entries.get(change.target);
          if (!state) continue;
          state.visible = change.isIntersecting;
          if (!state.visible) cancelEntry(change.target);
        }
        sync();
      // Enter beyond the viewport edge so the short reveal remains visible
      // while reading, even if scrolling pauses after the first few pixels.
      }, { threshold: 0, rootMargin: '0px 0px -72px 0px' });
      entries.forEach((_, element) => observer.observe(element));
    } catch {
      observer?.disconnect();
      observer = null;
    }
  }

  document.addEventListener('portfolio:motion', event => {
    sharedPaused = typeof event.detail?.paused === 'boolean'
      ? event.detail.paused : root.dataset.motionPaused === 'true';
    sync();
  });
  document.addEventListener('portfolio:language', cancelEntries);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { pageActive = false; sync(); });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); });
  if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', sync);
  else if (typeof reduced.addListener === 'function') reduced.addListener(sync);
  sync();
})();
