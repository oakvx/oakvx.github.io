import { config } from './config.js';
import { still } from './shell.js';
const consolePanel = document.querySelector('.console');
if (config.signalCable && consolePanel) {
  const cable = document.createElementNS('http://www.w3.org/2000/svg','svg');
  cable.setAttribute('class','signal-cable'); cable.setAttribute('viewBox','0 0 120 46');
  cable.setAttribute('aria-hidden','true');
  cable.innerHTML = '<path d="M114 34H80Q70 34 64 24L59 16Q53 7 43 7H6"/><circle cx="6" cy="7" r="4"/><circle cx="114" cy="34" r="4"/>';
  consolePanel.append(cable);
  let signal;
  document.addEventListener('gl-select', () => {
    if (still() || document.hidden || innerWidth < 1024 || document.documentElement.dataset.quality === 'low') return;
    signal?.cancel();
    signal = cable.animate?.([{opacity:0,transform:'translateX(10px) scaleX(.86)'},{opacity:1,offset:.32},{opacity:0,transform:'translateX(-10px) scaleX(1)'}],{duration:300,easing:'ease-out'});
  });
  for (const event of ['gl-motion','gl-quality','visibilitychange']) document.addEventListener(event, () => signal?.cancel());
}
