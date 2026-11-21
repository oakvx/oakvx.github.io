import { config } from './config.js';
import { motion, still } from './shell.js';
if (config.parallax) {
  const backdrop = document.createElement('div');
  backdrop.className = 'parallax'; backdrop.setAttribute('aria-hidden','true');
  backdrop.innerHTML = '<i></i><i></i><i></i>'; document.body.prepend(backdrop);
  const layers = [...backdrop.children];
  let frame = 0, x = 0, y = 0;
  function reset() { cancelAnimationFrame(frame); frame=0; layers.forEach(layer => layer.style.removeProperty('transform')); }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || document.hidden || still() || document.documentElement.dataset.quality !== 'high') return;
    x = event.clientX/innerWidth-.5; y = event.clientY/innerHeight-.5;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      layers.forEach((layer,i) => { const amount = (i+1)*13; layer.style.transform = `translate3d(${x*amount}px,${y*amount}px,0)`; });
    });
  }, {passive:true});
  for (const event of ['visibilitychange','gl-motion','gl-quality','keydown']) document.addEventListener(event,reset);
  motion.addEventListener('change',reset);
  document.documentElement.addEventListener('pointerleave',reset);
}
