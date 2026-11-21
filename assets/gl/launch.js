import { config } from './config.js';
const keyFor = url => new URL(url, location.href).pathname.match(/\/projects\/(brat-animator|synk|beautify|autoofficina)\/$/)?.[1];
const tileKey = key => ({'brat-animator':'brat',autoofficina:'spinotto'})[key] || key;
const find = key => document.querySelector(`[data-project-heading="${tileKey(key)}"]`) ||
  document.querySelector(`dialog[open] [data-preview="${tileKey(key)}"] .preview-art`) ||
  document.querySelector(`[data-tile="${tileKey(key)}"]`);
const home = url => ['/','/en/'].includes(new URL(url, location.href).pathname);

export function connectLaunch(still) {
  if ('onpageswap' in window && 'onpagereveal' in window) {
    const connect = (transition, from, to) => {
      if (!transition) return;
      const key = home(from) ? keyFor(to) : home(to) ? keyFor(from) : null;
      if (!config.launch || still() || !key) { transition.skipTransition(); return; }
      const element = find(key);
      if (!element) return;
      // A BFCache restore must not keep a stale transition name.
      element.style.viewTransitionName = `gl-project-${key}`;
      transition.finished.finally(() => element.style.removeProperty('view-transition-name')).catch(() => {});
    };
    addEventListener('pageswap', event => {
      if (event.activation) connect(event.viewTransition, location.href, event.activation.entry.url);
    });
    addEventListener('pagereveal', event => {
      const from = window.navigation?.activation?.from?.url;
      if (from) connect(event.viewTransition, from, location.href);
    });
    return;
  }
  if (!config.launch) return;
  document.addEventListener('click', event => {
    const a = event.target.closest('a[data-tile], a[data-launch], a.brand');
    if (!a || event.defaultPrevented || still() || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || a.origin !== location.origin || (!keyFor(a.href) && !home(a.href))) return;
    event.preventDefault();
    const animation = document.body.animate([{opacity:1},{opacity:.35}], {duration:180,fill:'forwards',easing:'ease-in'});
    animation.onfinish = () => { location.assign(a.href); };
    addEventListener('pageshow', () => animation.cancel(), {once:true});
  });
}
