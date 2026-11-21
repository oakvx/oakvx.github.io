import { config } from './config.js';
const plaza = document.querySelector('.plaza');
const en = document.documentElement.lang === 'en';
const format = new Intl.DateTimeFormat(en ? 'en-GB' : 'it-IT', {dateStyle:'medium', timeStyle:'short'});
let cached;
function repositories() {
  cached ??= (async () => {
    if (!config.plazaLive) return new Map();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch('https://api.github.com/users/oakvx/repos?per_page=100', {signal:controller.signal});
      if (!response.ok) return new Map();
      const rows = await response.json();
      return new Map(rows.filter(repo => typeof repo.name === 'string').map(repo => [repo.name.toLowerCase(), repo.pushed_at]));
    } catch { return new Map(); }
    finally { clearTimeout(timeout); }
  })();
  return cached;
}
for (const item of plaza.querySelectorAll('details')) {
  item.addEventListener('toggle', async () => {
    if (!item.open) return;
    for (const other of plaza.querySelectorAll('details[open]')) if (other !== item) other.open = false;
    const pushed = (await repositories()).get(item.dataset.repo.toLowerCase());
    if (!item.open || !pushed || !Number.isFinite(Date.parse(pushed))) return;
    const time = document.createElement('time'); time.dateTime = pushed;
    time.textContent = format.format(new Date(pushed));
    item.querySelector('[data-repo-push]').replaceChildren(en ? 'Last push: ' : 'Ultimo push: ', time);
  });
}

import './plaza-walk.js';

if (config.plazaDaylight) {
  function daylight() {
    const hour = new Date().getHours();
    plaza.dataset.daylight = hour >= 6 && hour < 9 ? 'dawn' : hour >= 9 && hour < 17 ? 'day' : hour >= 17 && hour < 21 ? 'dusk' : 'night';
  }
  daylight();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) daylight(); });
  setInterval(() => { if (!document.hidden) daylight(); }, 60_000);
}
