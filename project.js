'use strict';

(() => {
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...group.querySelectorAll('[role="tabpanel"]')];
    const select = (index, focus = false) => {
      tabs.forEach((tab, current) => {
        const selected = current === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[current].hidden = !selected;
      });
      if (focus) { tabs[index].focus({ preventScroll: true }); tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(next, true); }
      });
    });
  });

  const playButton = document.querySelector('[data-demo-play]');
  if (!playButton) return;
  const output = document.querySelector('#motion-output');
  const progress = document.querySelector('#motion-progress');
  const time = document.querySelector('#motion-time');
  const modes = [...document.querySelectorAll('[data-motion-mode]')];
  const originalText = 'brat animator demo.';
  const words = originalText.split(' ');
  const duration = 5000;
  let mode = 'typewriter';
  let position = 0;
  let playing = false;
  let interacted = false;
  let frame = 0;
  let startedAt = 0;

  function updateButton() {
    const italian = document.documentElement.lang === 'it';
    playButton.querySelector('[data-i18n]').textContent = playing ? italian ? 'Metti in pausa' : 'Pause' : italian ? 'Riproduci' : 'Play';
    playButton.lastElementChild.textContent = playing ? 'Ⅱ' : '▷';
    playButton.setAttribute('aria-pressed', String(playing));
  }

  function paint() {
    progress.value = String(Math.round(position * 1000));
    time.textContent = `00:0${Math.min(5, Math.floor(position * 5))} / 00:05`;
    output.replaceChildren();
    output.style.opacity = '1';
    if (!interacted) { output.textContent = originalText; output.style.opacity = '.35'; return; }
    if (mode === 'typewriter') {
      output.textContent = originalText.slice(0, Math.ceil(position * originalText.length));
      return;
    }
    words.forEach((word, index) => {
      const element = document.createElement('span');
      element.className = 'motion-word';
      element.textContent = word;
      const reveal = Math.max(0, Math.min(1, position * words.length - index));
      element.style.opacity = String(mode === 'words' ? reveal > 0 ? 1 : 0 : .22 + reveal * .78);
      element.style.transform = mode === 'words' && reveal === 0 ? 'translateY(8px)' : 'translateY(0)';
      output.append(element);
    });
  }

  function stop() {
    playing = false;
    cancelAnimationFrame(frame);
    updateButton();
  }

  function tick(now) {
    position = Math.min(1, (now - startedAt) / duration);
    paint();
    if (position >= 1) { stop(); return; }
    frame = requestAnimationFrame(tick);
  }

  playButton.addEventListener('click', () => {
    if (playing) { stop(); return; }
    interacted = true;
    if (position >= 1) position = 0;
    playing = true;
    startedAt = performance.now() - position * duration;
    updateButton();
    frame = requestAnimationFrame(tick);
  });
  progress.addEventListener('input', () => {
    interacted = true;
    position = Number(progress.value) / 1000;
    if (playing) startedAt = performance.now() - position * duration;
    paint();
  });
  modes.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.motionMode;
    modes.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    paint();
  }));
  document.addEventListener('portfolio:language', updateButton);
  document.addEventListener('portfolio:motion', event => { if (event.detail?.paused && playing) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  window.addEventListener('pagehide', stop, { once: true });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches && playing) stop(); });
  paint();
  updateButton();
})();
