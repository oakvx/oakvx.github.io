import "./brat-demo.js";
import { boot, tilt } from './signature.js';
import { recall, remember, still, sound } from './shell.js';
const tiles = [...document.querySelectorAll('[data-tile]')];
const previews = [...document.querySelectorAll('[data-preview]')];
const sheet = document.querySelector('[data-sheet]');
const pad = document.querySelector('.tiles');
const desktop = matchMedia('(min-width: 1024px)');
let index = 0;
let previewAnimation;
let trigger;
function select(next, focus = false) {
  const changed = index !== next;
  index = next;
  tiles.forEach((tile, i) => {
    tile.tabIndex = i === next ? 0 : -1;
    if (i === next) tile.setAttribute('aria-current', 'true');
    else tile.removeAttribute('aria-current');
    previews[i].hidden = i !== next;
  });
  if (focus) tiles[next].focus();
  if (changed) {
    previewAnimation?.cancel();
    if (!still() && desktop.matches) previewAnimation = previews[next].animate?.([{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
  }
  remember('selection', tiles[next].dataset.tile);
  if (changed) document.dispatchEvent(new CustomEvent('gl-select', {detail:tiles[next]}));
}
select(Math.max(0, tiles.findIndex(tile => tile.dataset.tile === recall('selection'))));
document.documentElement.dataset.enhanced = '';
for (const [i,tile] of tiles.entries()) {
  tile.addEventListener('focus', () => select(i));
  tile.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && !pad.contains(document.activeElement)) select(i); });
  tile.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    select(i);
    if (!desktop.matches && event.detail > 0) {
      event.preventDefault(); trigger = tile;
      const copy = previews[i].cloneNode(true); copy.hidden = false;
      sheet.querySelector('[data-sheet-content]').replaceChildren(copy); sheet.showModal(); sound('click');
    } else sound('launch');
  });
}
sheet.addEventListener('close', () => trigger?.focus());
desktop.addEventListener('change', () => { if (desktop.matches && sheet.open) sheet.close(); });
pad.addEventListener('keydown', event => {
  const columns = getComputedStyle(pad).gridTemplateColumns.split(' ').length;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault(); select(event.key === 'Home' ? 0 : tiles.length - 1, true); return;
  }
  const delta = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns}[event.key];
  if (!delta) return;
  event.preventDefault();
  const current = tiles.indexOf(document.activeElement);
  if (current >= 0) select(Math.min(tiles.length - 1, Math.max(0, current + delta)),true);
});

document.addEventListener('gl-motion', () => previewAnimation?.cancel());

tilt(tiles);
boot(tiles);
