import { config } from './config.js';

export function connectQuality({ motion, still, recall, remember }) {
  const root = document.documentElement;
  const labels = root.lang === 'en' ? ['Quality','Reduced','Medium','High','Automatic limit:'] : ['Qualità','Ridotta','Media','Alta','Limite automatico:'];
  const levels = ['low','medium','high'];
  const rank = value => Math.max(0,levels.indexOf(value));
  const validated = value => levels.includes(value);
  let preference = recall('quality-choice');
  let limit = config.performanceGovernor && validated(recall('quality-cap')) ? rank(recall('quality-cap')) : 2;
  const weak = (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2);
  if (config.performanceGovernor && weak) limit = 0;
  if (!validated(preference)) preference = 'high';
  const caption = document.createElement('label');
  const select = document.createElement('select');
  const status = document.createElement('small');
  status.setAttribute('role','status'); status.className='quality-note';
  select.name = 'quality';
  levels.forEach((value,i) => select.add(new Option(labels[i+1],value)));
  select.value = preference;
  caption.append(`${labels[0]} `,select);
  document.querySelector('.settings-row')?.append(caption,status);
  let frame = 0, started = 0, frames = 0;
  function apply() {
    const effective = still() ? 'low' : levels[Math.min(rank(preference),limit)];
    if (root.dataset.quality !== effective) {
      root.dataset.quality=effective; document.dispatchEvent(new Event('gl-quality'));
    }
    status.textContent = effective !== preference ? `${labels[4]} ${labels[rank(effective)+1]}` : '';
    restart();
  }
  function restart() {
    cancelAnimationFrame(frame); frame=0; started=0; frames=0;
    if (config.performanceGovernor && !document.hidden && root.dataset.quality !== 'low') frame=requestAnimationFrame(sample);
  }
  function sample(now) {
    if (document.hidden || root.dataset.quality === 'low') {restart(); return;}
    if (!started) started=now;
    else frames++;
    if (now-started >= 2000) {
      if (frames*1000/(now-started) < 45) {
        limit = Math.max(0,rank(root.dataset.quality)-1);
        remember('quality-cap',levels[limit]); apply(); return;
      }
      started=now; frames=0;
    }
    frame=requestAnimationFrame(sample);
  }
  select.onchange = () => { preference=select.value; remember('quality-choice',preference); apply(); };
  document.addEventListener('visibilitychange',restart);
  document.addEventListener('gl-motion',apply);
  motion.addEventListener('change',apply);
  apply();
}
