import { config } from './config.js';
import { motion, still } from './shell.js';
if (config.pointerCompanion) {
  const pointer = document.createElement('span');
  pointer.className = 'pointer-companion'; pointer.hidden = true; pointer.setAttribute('aria-hidden','true');
  pointer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 19 4 13a1.5 1.5 0 0 1 2-2l2 2V4a1.5 1.5 0 0 1 3 0v6l1-1 2 1 1 1 2-1 2 2v3l-2 5H9z"/></svg>';
  document.body.append(pointer);
  let raf = 0, x=0, y=0, goalX=0, goalY=0;
  function hide() { cancelAnimationFrame(raf); raf=0; pointer.hidden=true; }
  function follow() {
    x += (goalX-x)*.38; y += (goalY-y)*.38;
    pointer.style.transform=`translate3d(${x}px,${y}px,0)`;
    if (Math.abs(goalX-x)+Math.abs(goalY-y)>.7) raf=requestAnimationFrame(follow);
    else raf=0;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || document.hidden || still() || document.documentElement.dataset.quality !== 'high' || document.querySelector('dialog[open]')) {hide(); return;}
    goalX=event.clientX+13; goalY=event.clientY+13;
    const control = event.target.closest?.('button,a,summary,select');
    pointer.dataset.state = event.buttons ? 'press' : control ? 'hover' : 'idle';
    if (pointer.hidden) { x=goalX; y=goalY; pointer.hidden=false; }
    if (!raf) raf=requestAnimationFrame(follow);
  }, {passive:true});
  document.addEventListener('pointerdown', event => { if (event.pointerType==='mouse') pointer.dataset.state='press'; });
  document.addEventListener('pointerup', () => { pointer.dataset.state='hover'; });
  for (const event of ['keydown','visibilitychange','gl-motion','gl-quality']) document.addEventListener(event,hide);
  motion.addEventListener('change',hide);
  document.documentElement.addEventListener('pointerleave',hide);
}
