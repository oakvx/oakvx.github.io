import { config } from './config.js';
const root = document.documentElement;
const en = root.lang === 'en';
export const motion = matchMedia('(prefers-reduced-motion: reduce)');
export const remember = (key, value) => { try { sessionStorage.setItem(`gl-${key}`, value); } catch {} };
export const recall = key => { try { return sessionStorage.getItem(`gl-${key}`); } catch { return null; } };
export const still = () => motion.matches || root.dataset.motion === 'off';
const read = key => { try { return localStorage.getItem(`gl-${key}`); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(`gl-${key}`, value); } catch {} };
const now = document.querySelector('[data-clock]');
const date = document.querySelector('[data-date]');
const locale = en ? 'en-GB' : 'it-IT';
const clockFormat = new Intl.DateTimeFormat(locale, { hour:'2-digit', minute:'2-digit' });
const dateFormat = new Intl.DateTimeFormat(locale, { weekday:'short', day:'numeric', month:'short' });
function tick() {
  const t = new Date();
  now.textContent = clockFormat.format(t);
  now.dateTime = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
  date.textContent = dateFormat.format(t);
  date.dateTime = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}
tick(); setInterval(tick, 1000);
const toggle = document.querySelector('[data-motion]');
function setMotion(off) {
  root.dataset.motion = off ? 'off' : 'on';
  toggle.setAttribute('aria-pressed', String(off));
  toggle.textContent = off ? (en ? 'Resume animations' : 'Riattiva animazioni') : (en ? 'Pause animations' : 'Ferma animazioni');
  document.dispatchEvent(new Event('gl-motion'));
}
setMotion(read('motion') === 'off'); toggle.hidden = false;
toggle.onclick = () => { setMotion(root.dataset.motion !== 'off'); write('motion', root.dataset.motion); };
const theme = document.querySelector('[data-theme-choice]');
function setTheme(value) {
  if (['dark','light'].includes(value)) root.dataset.theme = value;
  else delete root.dataset.theme;
}
theme.value = ['light','dark'].includes(read('theme')) ? read('theme') : 'auto';
setTheme(theme.value); theme.onchange = () => { setTheme(theme.value); write('theme', theme.value); };
const menu = document.querySelector('#home-menu');
const home = document.querySelector('[data-home]');
home.hidden = false;
function openMenu() {
  if (menu.open) return;
  document.querySelector('dialog[open]')?.close();
  menu.showModal();
}
home.onclick = openMenu;
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() !== 'h' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,select,textarea,[contenteditable]')) return;
  event.preventDefault(); if (menu.open) menu.close(); else openMenu();
});
if (config.cvUrl) document.querySelector('[data-cv]')?.setAttribute('href', config.cvUrl);
if (config.linkedinUrl) document.querySelector('[data-linkedin]')?.setAttribute('href', config.linkedinUrl);
const audio = document.querySelector('[data-audio]');
let context;
audio.hidden = false;
audio.onclick = async () => {
  if (audio.getAttribute('aria-pressed') === 'true') { audio.setAttribute('aria-pressed', 'false'); return; }
  try { context ||= new AudioContext(); await context.resume(); audio.setAttribute('aria-pressed', 'true'); sound('click'); } catch { audio.setAttribute('aria-pressed', 'false'); }
};
export function sound(kind) {
  if (audio.getAttribute('aria-pressed') !== 'true' || context?.state !== 'running') return;
  const time = context.currentTime;
  const note = context.createOscillator(); const volume = context.createGain();
  note.type = 'sine'; note.frequency.setValueAtTime(kind === 'launch' ? 430 : 630, time);
  note.frequency.exponentialRampToValueAtTime(kind === 'launch' ? 780 : 540, time + .085);
  volume.gain.setValueAtTime(.001,time); volume.gain.exponentialRampToValueAtTime(.035,time+.015); volume.gain.exponentialRampToValueAtTime(.001,time+.11);
  note.connect(volume).connect(context.destination); note.start(time); note.stop(time+.12);
}
