'use strict';
(() => {
  const controls = document.querySelector('[data-home-controls]');
  if (!controls) return;
  const buttons = [...controls.querySelectorAll('[data-home-filter]')];
  const panels = [...document.querySelectorAll('[data-home-panel]')];
  const counter = document.querySelector('[data-home-count]');
  controls.hidden = false;
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.homePanel !== button.dataset.homeFilter; });
    counter.textContent = String(index + 1).padStart(2, '0') + '/04';
  }));
  const copy = document.querySelector('[data-home-copy]');
  const status = document.querySelector('[data-home-copy-status]');
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const english = document.documentElement.lang === 'en';
      try {
        await navigator.clipboard.writeText('gabrielelucia07@gmail.com');
        status.textContent = english ? 'Email copied.' : 'Email copiata.';
      } catch {
        status.textContent = english ? 'gabrielelucia07@gmail.com — select and copy.' : 'gabrielelucia07@gmail.com — seleziona e copia.';
      }
    });
    document.addEventListener('portfolio:language', () => { status.textContent = ''; });
  }
})();
