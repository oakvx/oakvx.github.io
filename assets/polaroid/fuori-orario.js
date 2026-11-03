/* Language channels: same-document enhancement; native scroll is the fallback. */
(() => {
    const track = document.querySelector('[data-fo-track]');
    if (!track) return;
    const root = document.documentElement;
    const tabs = [...document.querySelectorAll('[data-fo-go]')], slides = [...track.children];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    let current = 0, transition, scrollFrame;
    function mark(index) {
        current = index;
        tabs.forEach((tab,i) => { tab.setAttribute('aria-selected',String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
        slides.forEach((slide,i) => { slide.inert = i !== index; });
    }
    function go(index, animate = true) {
        index = (index + tabs.length) % tabs.length;
        transition?.skipTransition();
        const update = () => { track.scrollTo({ left: track.clientWidth * index, behavior: 'auto' }); mark(index); };
        if (!animate || calm() || !document.startViewTransition || location.protocol === 'file:') { update(); return; }
        const main = document.querySelector('main');
        main.style.viewTransitionName = 'none';
        root.style.viewTransitionName = 'none';
        track.style.viewTransitionName = 'language-panel';
        root.dataset.sliderDirection = index < current ? 'back' : 'forward';
        transition = document.startViewTransition(update);
        transition.ready.catch(() => {});
        transition.finished.finally(() => { root.style.removeProperty('view-transition-name'); main.style.removeProperty('view-transition-name'); track.style.removeProperty('view-transition-name'); delete root.dataset.sliderDirection; });
    }
    tabs.forEach((tab,index) => {
        tab.id = 'language-tab-'+index;
        tab.setAttribute('aria-controls','language-panel-'+index);
        slides[index].id = 'language-panel-'+index;
        slides[index].setAttribute('role','tabpanel');
        slides[index].setAttribute('aria-labelledby',tab.id);
        tab.addEventListener('click',() => go(index));
        tab.addEventListener('keydown',event => {
            if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
            event.preventDefault();
            const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            tabs[target].focus(); go(target);
        });
    });
    document.querySelector('[data-fo-prev]').addEventListener('click',() => go(current-1));
    document.querySelector('[data-fo-next]').addEventListener('click',() => go(current+1));
    track.addEventListener('keydown',event => {
        if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    track.addEventListener('scroll',() => { cancelAnimationFrame(scrollFrame); scrollFrame=requestAnimationFrame(() => mark(Math.round(track.scrollLeft/track.clientWidth))); },{passive:true});
    addEventListener('resize',() => go(current,false));
    const initial = ['#it','#en','#es','#el'].indexOf(location.hash);
    go(initial < 0 ? 0 : initial,false);
})();

/* Parola del giorno */
(()=>{
const wc=document.querySelector('[data-fo-word]');
if(!wc)return;
const W=[['es','trastear','','armeggiare, smanettare','to tinker, to fiddle about'],
 ['el','περιέργεια','periérgeia','curiosità','curiosity'],
 ['es','madrugada','','le ore piccole, l’alba','the small hours, early dawn'],
 ['el','κώδικας','kódikas','codice','code'],
 ['es','sobremesa','','il tempo passato a tavola a chiacchierare dopo mangiato','the time spent chatting at the table after a meal'],
 ['el','νύχτα','nýchta','notte','night'],
 ['es','estrenar','','usare o inaugurare per la prima volta','to use or wear for the first time'],
 ['el','παιχνίδι','paichnídi','gioco','game'],
 ['es','desvelarse','','perdere il sonno','to lose sleep, to stay awake'],
 ['el','ουράνιο τόξο','uránio tóxo','arcobaleno','rainbow'],
 ['es','ensimismado','','assorto nei propri pensieri','lost in thought'],
 ['el','ησυχία','isychía','quiete, silenzio','quiet, stillness'],
 ['es','merienda','','la merenda del pomeriggio','the afternoon snack'],
 ['el','ταξίδι','taxídi','viaggio','journey']];
const lang=()=>document.documentElement.lang.toLowerCase().startsWith('en')?'en':'it';
const parts=()=>{const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o={};f.forEach(p=>o[p.type]=p.value);return o};
const render=()=>{
 const l=lang(),p=parts();
 const day=Math.floor(Date.UTC(+p.year,+p.month-1,+p.day)/864e5),w=W[day%W.length];
 wc.querySelector('[data-fo-word-lang]').textContent=w[0]==='es'?'ES':'ΕΛ';
 const el=wc.querySelector('[data-fo-word-text]');el.textContent=w[1];el.lang=w[0];
 wc.querySelector('[data-fo-word-roman]').textContent=w[2]||'\u00a0';
 wc.querySelector('[data-fo-word-meaning]').textContent=l==='en'?w[4]:w[3];
};
render();setInterval(render,20000);
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();

/* Insegna al neon: ogni lettera è un tubo; alcuni sfarfallano, uno è quasi morto */
(()=>{
const h=document.querySelector('.fo-neon');if(!h)return;
const flick=[2,7,9],dying=[4];
const wrap=()=>{
 if(h.querySelector('span'))return;
 const txt=h.textContent.replace(/\s+/g,' ').trim();if(!txt)return;
 h.setAttribute('aria-label',txt);h.textContent='';
 [...txt].forEach((ch,i)=>{
  const s=document.createElement('span');s.setAttribute('aria-hidden','true');
  s.textContent=ch===' '?'\u00a0':ch;
  if(flick.includes(i)){s.className='is-flick';s.style.setProperty('--d',(-i*1.3)+'s')}
  else if(dying.includes(i)){s.className='is-dying';s.style.setProperty('--d','-2s')}
  h.appendChild(s);
 });
};
wrap();
new MutationObserver(wrap).observe(h,{childList:true});
})();
