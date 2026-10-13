'use strict';
(() => {
  const roots = [...document.querySelectorAll('[data-scroll-story]')];
  if (!roots.length) return;
  const desktop = window.matchMedia('(min-width: 901px) and (min-height: 701px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  let frame = null;
  const stories = roots.map(root => ({
    root, nav: root.querySelector('.scroll-chapters'),
    links: [...root.querySelectorAll('[data-story-link]')], enhanced: false,
    steps: [...root.querySelectorAll('[data-story-step]')].map(step => ({ step, visual: step.querySelector('[data-story-visual]') }))
  }));
  function update() {
    frame = null;
    const height = window.innerHeight;
    const motionEnabled = !reduced.matches && document.documentElement.dataset.motionPaused !== 'true';
    // Complete geometry reads before style writes.
    const headerBottom = header ? header.getBoundingClientRect().bottom : 90;
    const samples = stories.map(story => ({ story,
      anchor: Math.min(height - 40, Math.max(headerBottom, story.enhanced ? story.nav.getBoundingClientRect().bottom : headerBottom) + 16),
      rects: story.steps.map(item => item.step.getBoundingClientRect()),
      visualRects: story.steps.map(item => item.visual.getBoundingClientRect()) }));
    for (const { story, anchor, rects, visualRects } of samples) {
      let active = 0;
      // A chapter changes only when it reaches the space below the chapter bar.
      // Each visual stays inside its own article, regardless of the active label.
      rects.forEach((rect, index) => { if (rect.top <= anchor) active = index; });
      const id = story.steps[active].step.dataset.storyStep;
      const changed = story.root.dataset.scene !== id;
      story.root.dataset.scene = id;
      story.root.style.setProperty('--story-anchor', anchor.toFixed(1) + 'px');
      story.steps.forEach((item, index) => {
        const rect = rects[index];
        const progress = Math.max(0, Math.min(1, (height - rect.top) / Math.max(height + rect.height, 1)));
        // Continue the entrance through the reading area, rather than finishing at the viewport edge.
        const entry = Math.max(0, Math.min(1, (height * .92 - visualRects[index].top) / Math.max(height * .68, 1)));
        const remaining = motionEnabled ? 1 - entry : 0;
        const direction = index % 2 ? 1 : -1;
        const drift = motionEnabled ? (.5 - progress) * 48 : 0;
        // Transform the artwork inside the figure: sticky geometry and topic ownership stay fixed.
        item.visual.style.setProperty('--story-enter', motionEnabled ? entry.toFixed(4) : '1');
        item.visual.style.setProperty('--story-drift', drift ? drift.toFixed(2) + 'px' : '0px');
        item.visual.style.setProperty('--story-x', (remaining * 24 * direction).toFixed(2) + 'px');
        item.visual.style.setProperty('--story-y', (remaining * 48 + drift).toFixed(2) + 'px');
        item.visual.style.setProperty('--story-rotate', (remaining * 3 * direction).toFixed(2) + 'deg');
        item.visual.style.setProperty('--story-scale', (1 - remaining * .12).toFixed(4));
        item.visual.style.setProperty('--story-opacity', (1 - remaining * .7).toFixed(4));
        item.step.style.setProperty('--story-read', motionEnabled ? progress.toFixed(4) : '1');
        item.visual.classList.toggle('is-active', index === active);
        item.visual.style.setProperty('--scene-progress', progress.toFixed(4));
      });
      story.root.classList.add('story-motion-ready');
      story.links.forEach(link => {
        if (link.dataset.storyLink === id) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
      if (changed) document.dispatchEvent(new CustomEvent('portfolio:scene'));
    }
  }
  function queue() {
    if (document.hidden || frame !== null) return;
    frame = window.requestAnimationFrame(update);
  }
  function configure() {
    const enhanced = desktop.matches && !reduced.matches;
    let changed = false;
    for (const story of stories) {
      if (story.enhanced === enhanced) continue;
      story.enhanced = enhanced;
      changed = true;
      story.root.classList.toggle('story-enhanced', enhanced);
    }
    if (changed) document.dispatchEvent(new CustomEvent('portfolio:scene'));
    queue();
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', configure, { passive: true });
  window.addEventListener('pageshow', configure);
  window.addEventListener('pagehide', () => { if (frame !== null) window.cancelAnimationFrame(frame); frame = null; });
  document.addEventListener('portfolio:language', queue);
  document.addEventListener('portfolio:motion', queue);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (frame !== null) window.cancelAnimationFrame(frame); frame = null; }
    else queue();
  });
  desktop.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  if (document.fonts?.ready) document.fonts.ready.then(queue);
  configure();
})();
