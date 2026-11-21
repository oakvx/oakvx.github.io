import { config } from './config.js';
import { motion, still } from './shell.js';

const plaza = document.querySelector('.plaza');
if (config.plazaWalk && 'IntersectionObserver' in window) {
  const start = () => stage(plaza);
  if ('requestIdleCallback' in window) requestIdleCallback(start, {timeout:1600});
  else setTimeout(start, 700);
}

function stage(plaza) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.className = 'plaza-walk'; canvas.setAttribute('aria-hidden','true');
  plaza.querySelector('.plaza-head').append(canvas);
  const actors = [...plaza.querySelectorAll('summary img')].map((image, i) => ({image, x:.14 + i*.18, dir:i%2 ? -1 : 1, pace:.038+i*.004, pause:0}));
  let visible = false, frame = 0, last = 0, width = 0, height = 0, pointer;
  function size() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpi = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpi); canvas.height = Math.round(height*dpi);
    ctx.setTransform(dpi,0,0,dpi,0,0);
  }
  function draw(time, delta) {
    if (!width || !height) return;
    ctx.clearRect(0,0,width,height);
    const spriteSize = 36;
    const medium = document.documentElement.dataset.quality === 'medium';
    for (const [i, actor] of actors.entries()) {
      if (medium && i > 2) break;
      if (!actor.image.complete || !actor.image.naturalWidth) continue;
      if (actor.pause > 0) actor.pause -= delta;
      else actor.x += actor.dir*actor.pace*delta;
      if (actor.x < .12 || actor.x > .88) {
        actor.x = Math.max(.12, Math.min(.88, actor.x));
        actor.dir *= -1; actor.pause = .7 + .15*i;
      }
      const x = actor.x*width;
      const near = pointer != null && Math.abs(pointer-x)<53;
      const hop = actor.pause>0 || !delta ? 0 : Math.sin(time/82+i)*1.7;
      const y = height-16-(i%2)*10;
      ctx.fillStyle = 'rgba(32, 65, 82, .18)';
      ctx.beginPath(); ctx.ellipse(x,y,11,3,0,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.translate(x+(near ? Math.sign(pointer-x)*2 : 0),y-spriteSize/2+hop);
      ctx.rotate((near ? Math.sign(pointer-x) : actor.dir)*.1);
      ctx.drawImage(actor.image,-spriteSize/2,-spriteSize/2,spriteSize,spriteSize);
      ctx.restore();
    }
  }
  function ready() { return visible && !document.hidden && !still() && document.documentElement.dataset.quality !== 'low'; }
  function loop(time) {
    frame = 0;
    if (!ready()) return;
    const elapsed = time-last;
    if (elapsed >= 32) { draw(time,Math.min(elapsed/1000,.055)); last=time; }
    frame = requestAnimationFrame(loop);
  }
  function update() {
    canvas.hidden = still() || document.documentElement.dataset.quality === 'low'; plaza.toggleAttribute('data-plaza-scene', !canvas.hidden);
    if (ready()) { if (!frame) { size(); last=performance.now(); frame=requestAnimationFrame(loop); } }
    else { cancelAnimationFrame(frame); frame = 0; }
  }
  const observer = new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;update();});
  observer.observe(canvas);
  const resize = new ResizeObserver(size); resize.observe(canvas);
  document.addEventListener('visibilitychange',update);
  document.addEventListener('gl-motion',update);
  document.addEventListener('gl-quality',update);
  motion.addEventListener('change',update);
  canvas.addEventListener('pointermove',e => { pointer=e.offsetX; },{passive:true});
  canvas.addEventListener('pointerleave',() => {pointer=undefined;});
  update();
}
