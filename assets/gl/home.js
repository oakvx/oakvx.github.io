import { boot, tilt } from './signature.js';
import { recall, remember, still, sound } from './shell.js';
const tiles = [...document.querySelectorAll('[data-tile]')];
const previews = [...document.querySelectorAll('[data-preview]')];
const sheet = document.querySelector('[data-sheet]');
const pad = document.querySelector('.tiles');
const desktop = matchMedia('(min-width: 1024px)');
let index = 0;
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
  if (changed && !still() && desktop.matches) previews[next].animate([{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
  remember('selection', tiles[next].dataset.tile);
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
  const delta = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns}[event.key];
  if (!delta) return;
  event.preventDefault(); select((index+delta+tiles.length)%tiles.length,true);
});

tilt(tiles);
boot(tiles);
