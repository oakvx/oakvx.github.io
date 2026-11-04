/* Decoration only: native links, dialogs and document transitions own navigation. */
(() => {
    'use strict';
    const scene = document.querySelector('[data-plaza]');
    if (!scene) return;
    const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion:reduce)');
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const timers = new Map();
    let selected = null;
    const select = item => {
        if (item === selected) return;
        selected?.classList.remove('is-pointer-selected');
        selected = item;
        selected?.classList.add('is-pointer-selected');
    };
    // The pointer already publishes at most once per frame; no additional rAF.
    addEventListener('wiiu:pointermove',event => {
        const {active,x,y} = event.detail;
        const target = active ? document.elementFromPoint(x,y)?.closest('.proj') : null;
        select(target && scene.contains(target) ? target : null);
    });
    const reset = () => {
        timers.forEach((timer,item)=>{clearTimeout(timer);item.classList.remove('is-rippling');});
        timers.clear();
    };
    scene.addEventListener('click',event => {
        const link = event.target.closest('a[href]'), item = link?.closest('.proj');
        if (!item || event.defaultPrevented || calm() || document.hidden) return;
        const box = item.querySelector('.proj__print').getBoundingClientRect();
        const position = (value,start,size) => Math.max(0,Math.min(100,(value-start)/size*100))+'%';
        item.style.setProperty('--project-ripple-x',event.detail ? position(event.clientX,box.left,box.width) : '50%');
        item.style.setProperty('--project-ripple-y',event.detail ? position(event.clientY,box.top,box.height) : '50%');
        item.classList.add('is-rippling');
        clearTimeout(timers.get(item));
        timers.set(item,setTimeout(()=>{item.classList.remove('is-rippling');timers.delete(item);},350));
    });
    addEventListener('wiiu:motionchange',()=>{if(calm())reset();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){reset();select(null);}});
    addEventListener('pagehide',()=>{reset();select(null);});
})();
