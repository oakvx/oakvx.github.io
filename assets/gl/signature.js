import { config } from './config.js';
import { motion, recall, remember, still } from './shell.js';

export function boot(tiles) {
  const seen = recall('boot');
  remember('boot', '1');
  if (!config.boot || seen || still() || document.documentElement.dataset.quality === 'low' || document.hidden || location.hash) return;
  const origin = { x:innerWidth / 2, y:innerHeight / 2 };
  const targets = tiles.map(tile => tile.querySelector('.tile-icon').getBoundingClientRect());
  const stage = document.createElement('dialog');
  stage.className = 'boot';
  stage.setAttribute('aria-label', 'GL Menu');
  const en = document.documentElement.lang === 'en';
  stage.innerHTML = `<div class="boot-center"><span class="boot-light"></span><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path pathLength="1" d="M16 11a5 5 0 1 0 0 8v2c0 4-5 5-8 2M16 10v10m6-13v12q0 3 3 3"/></svg><div class="boot-meter"></div><button autofocus>${en ? 'Skip intro' : 'Salta introduzione'}</button></div>`;
  const orbs = tiles.map(tile => {
    const orb = tile.querySelector('.tile-icon').cloneNode(true);
    orb.classList.add('boot-orb', tile.dataset.tile); orb.setAttribute('aria-hidden','true');
    stage.append(orb);
    return { orb, x:origin.x - 23, y:origin.y - 23, vx:0, vy:0 };
  });
  document.body.append(stage);
  stage.showModal();
  const started = performance.now();
  let last = started, frame = 0, closed = false;
  const timer = setTimeout(() => finish(true), 1510);
  const controller = new AbortController();
  const { signal } = controller;
  function finish(greet = false) {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(frame); clearTimeout(timer); controller.abort();
    stage.close(); stage.remove();
    if (!greet || still() || document.hidden) return;
    const hello = document.createElement('p');
    hello.className = 'boot-hello'; hello.setAttribute('aria-hidden','true');
    hello.textContent = en ? 'Hi, I’m Gabriele!' : 'Ciao, sono Gabriele!';
    document.querySelector('.top').append(hello);
    setTimeout(() => hello.remove(), 2400);
  }
  stage.addEventListener('click', () => finish(), { signal });
  document.addEventListener('keydown', event => { event.preventDefault(); event.stopImmediatePropagation(); finish(); }, {capture:true,signal});
  motion.addEventListener('change', () => finish(), {signal});
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); }, {signal});
  addEventListener('resize', () => finish(), {signal});
  function step(now) {
    const t = now - started;
    if (t >= 1510) { finish(true); return; }
    const dt = Math.min((now - last) / 1000, .026);
    last = now;
    for (const [i, sprite] of orbs.entries()) {
      const local = t - 470 - i * 27;
      if (local < 0) continue;
      const angle = (i / orbs.length) * Math.PI * 2;
      const burst = local < 160;
      const x = burst ? origin.x + Math.cos(angle) * 89 - 23 : targets[i].left;
      const y = burst ? origin.y + Math.sin(angle) * 70 - 23 : targets[i].top;
      sprite.vx += ((x - sprite.x) * 200 - sprite.vx * 23) * dt;
      sprite.vy += ((y - sprite.y) * 200 - sprite.vy * 23) * dt;
      sprite.x += sprite.vx * dt; sprite.y += sprite.vy * dt;
      sprite.orb.style.opacity = String(Math.min(1, local / 120));
      sprite.orb.style.transform = `translate3d(${sprite.x}px,${sprite.y}px,0) scale(${Math.min(1, .55 + local / 350)})`;
    }
    frame = requestAnimationFrame(step);
  }
  frame = requestAnimationFrame(step);
}

export function tilt(tiles) {
  if (!config.tilt) return;
  for (const tile of tiles) {
    let rect, frame, point;
    const hit = tile.parentElement;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; rect = null;
      delete tile.dataset.tilting;
      for (const prop of ['--rx','--ry','--shine-x','--shine-y']) tile.style.removeProperty(prop);
    };
    hit.addEventListener('pointermove', event => {
      if (still() || document.hidden || document.documentElement.dataset.quality !== 'high' || event.pointerType !== 'mouse') return;
      rect ||= hit.getBoundingClientRect();
      point = [event.clientX,event.clientY];
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const unit = n => Math.max(0,Math.min(n,1));
        const x = unit((point[0]-rect.left)/rect.width);
        const y = unit((point[1]-rect.top)/rect.height);
        tile.dataset.tilting = '';
        tile.style.setProperty('--rx', `${(.5-y)*16}deg`);
        tile.style.setProperty('--ry', `${(x-.5)*16}deg`);
        tile.style.setProperty('--shine-x', `${x*100}%`);
        tile.style.setProperty('--shine-y', `${y*100}%`);
      });
    }, {passive:true});
    hit.addEventListener('pointerleave', reset);
    motion.addEventListener('change', reset);
    for (const event of ['gl-motion','gl-quality','visibilitychange']) document.addEventListener(event, reset);
    addEventListener('scroll', reset, {passive:true});
    addEventListener('resize', reset);
  }
}
