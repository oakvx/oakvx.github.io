/* Home enhancement only: real pages, original link navigation and existing tilt. */
(() => {
    'use strict';
    const root = document.documentElement;
    if (!root.hasAttribute('data-home')) return;
    const menu = document.querySelector('[data-channel-menu]');
    const pages = [...menu.querySelectorAll('[data-home-channel-page]')];
    const channels = [...menu.querySelectorAll('[data-channel]')];
    const indicators = [...document.querySelectorAll('[data-home-page]')];
    const arrow = document.querySelector('[data-home-page-next]');
    const reduced = matchMedia('(prefers-reduced-motion:reduce)');
    const fine = matchMedia('(hover:hover) and (pointer:fine)');
    const stopped = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    let current = 0, finished = false, loaderTimer = 0;
    function labels() {
        const en = root.lang === 'en';
        document.querySelector('[data-home-pages]').setAttribute('aria-label',en?'Channel pages':'Pagine dei canali');
        document.querySelector('[data-home-shortcuts]').setAttribute('aria-label',en?'Quick access to channels':'Accesso rapido ai canali');
        indicators.forEach((button,i)=>button.setAttribute('aria-label',en?`Page ${i+1} of ${pages.length}`:`Pagina ${i+1} di ${pages.length}`));
        const label = current === 0 ? (en?'Next channel page':'Pagina successiva dei canali') : (en?'Previous channel page':'Pagina precedente dei canali');
        arrow.setAttribute('aria-label',label);
        arrow.querySelector('[data-home-next-label]').textContent=label;
        arrow.dataset.direction=current===0?'next':'back';
    }
    const clearEntry = () => menu.classList.remove('home-enter');
    function showPage(index) {
        clearEntry();
        const focusedInPage = pages.some(page=>page.contains(document.activeElement));
        current=(index+pages.length)%pages.length;
        pages.forEach((page,i)=>page.hidden=i!==current);
        indicators.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
        const first=pages[current].querySelector('[data-channel]');
        channels.forEach(channel=>channel.classList.toggle('is-selected',channel===first));
        if(focusedInPage)first.focus({preventScroll:true});
        root.setAttribute('data-home-paged','');labels();
    }
    indicators.forEach((button,i)=>button.addEventListener('click',()=>showPage(i)));
    arrow.addEventListener('click',()=>showPage(current===0?1:0));
    document.querySelector('[data-home-pages]').addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();
        const page=event.key==='Home'?0:event.key==='End'?pages.length-1:current+(event.key==='ArrowRight'?1:-1);
        showPage(page);indicators[current].focus();
    });
    // The shared dock already opens its focused/hovered channel. Keep its handler.
    document.querySelector('[data-channel-open]')?.addEventListener('click',()=>{
        const selected=pages[current].querySelector('.is-selected') || pages[current].querySelector('[data-channel]');
        selected.focus({preventScroll:true});
    },true);
    channels.forEach(channel=>{
        channel.addEventListener('pointermove',event=>{
            channel.dataset.homeMouse=String(event.pointerType==='mouse'&&fine.matches&&!stopped());
        },{passive:true,capture:true});
        channel.addEventListener('pointerleave',()=>delete channel.dataset.homeMouse);
    });
    const resetTilt = () => channels.forEach(channel=>delete channel.dataset.homeMouse);
    addEventListener('keydown',resetTilt,{capture:true});
    fine.addEventListener('change',resetTilt);
    function finish() {
        if(finished)return;
        finished=true;clearTimeout(loaderTimer);root.classList.remove('home-loading');
        const loader=document.querySelector('[data-home-loader]');
        if(loader)setTimeout(()=>loader.remove(),140);
        if(root.dataset.homeFirst==='true'&&!stopped()&&!document.hidden)menu.classList.add('home-enter');
    }
    menu.addEventListener('animationend',event=>{
        if(event.animationName==='home-channel-enter'&&event.target===event.target.parentElement?.lastElementChild)clearEntry();
    });
    addEventListener('wiiu:motionchange',()=>{
        if(stopped()){clearEntry();resetTilt();if(!finished)finish();}
    });
    new MutationObserver(()=>{if(stopped()){clearEntry();resetTilt();if(!finished)finish();}}).observe(root,{attributes:true,attributeFilter:['class']});
    reduced.addEventListener('change',()=>{if(stopped()){clearEntry();resetTilt();if(!finished)finish();}});
    new MutationObserver(labels).observe(root,{attributes:true,attributeFilter:['lang']});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){clearEntry();resetTilt();if(!finished)finish();}});
    addEventListener('pagehide',()=>{clearEntry();resetTilt();if(!finished)finish();});
    showPage(0);
    if(root.classList.contains('home-loading')) {
        const elapsed=performance.now()-Number(root.dataset.homeBoot || 0);
        loaderTimer=setTimeout(finish,Math.max(0,650-elapsed));
        Promise.all([
            new Promise(resolve=>setTimeout(resolve,Math.max(0,280-elapsed))),
            (document.fonts?.ready || Promise.resolve()).catch(()=>{})
        ]).then(finish);
    } else finish();
})();
