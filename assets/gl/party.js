import { config } from './config.js';
import { visibleFrames } from './frames.js';
const panel = document.querySelector('.console');
if (config.partyMode && panel) {
  const en = document.documentElement.lang === 'en';
  const note = document.createElement('p');
  note.className='party-note'; note.setAttribute('role','status'); document.body.append(note);
  const canvas = document.createElement('canvas');
  canvas.className='party-canvas'; canvas.hidden=true; canvas.setAttribute('aria-hidden','true'); document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const keys=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const colors=['#00a7e1','#e36ba1','#84ad2a','#b278e1','#efa244'];
  let position=0, active=false, particles=[], time=0, previous=0;
  function hide() {canvas.hidden=true; panel.removeAttribute('data-party-moving');}
  function toggle(on) {
    active=on; time=0;
    note.textContent = on ? (en?'Party mode · Esc to stop':'Modalità party · Esc per uscire') : '';
    document.dispatchEvent(new Event('gl-quality'));
  }
  function size() {
    canvas.width=innerWidth; canvas.height=innerHeight;
    particles = Array.from({length:42}, (_,i) => ({x:Math.random(),y:Math.random(),speed:.055+Math.random()*.08,size:4+Math.random()*6,color:colors[i%colors.length]}));
  }
  if(ctx) visibleFrames(panel,(now,delta) => {
    time+=delta;
    if (now-previous<30 && !canvas.hidden) return;
    previous=now;
    if (canvas.hidden) size();
    canvas.hidden=false; panel.setAttribute('data-party-moving',''); ctx.clearRect(0,0,canvas.width,canvas.height);
    const count=document.documentElement.dataset.quality === 'medium' ? 18 : particles.length;
    for (let i=0;i<count;i++) {
      const p=particles[i]; ctx.save();
      ctx.translate(p.x*canvas.width + Math.sin(i+time/400)*13, (p.y+time*p.speed/1000)%1*canvas.height);
      ctx.rotate(i+time/700); ctx.fillStyle=p.color; ctx.fillRect(0,0,p.size,p.size*.55); ctx.restore();
    }
  },{enabled:()=>active && document.documentElement.dataset.quality!=='low',pause:hide});
  addEventListener('resize', () => { if (!canvas.hidden) size(); });
  document.addEventListener('keydown', event => {
    if (event.key==='Escape' && active && !document.querySelector('dialog[open]')) {event.preventDefault();toggle(false);return;}
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]') || event.target.closest?.('textarea,input,select,[contenteditable]')) return;
    const key = event.key.length===1 ? event.key.toLowerCase() : event.key;
    position=key===keys[position] ? position+1 : key===keys[0] ? 1 : 0;
    if (position===keys.length) {position=0;toggle(!active);}
  },true);
}
