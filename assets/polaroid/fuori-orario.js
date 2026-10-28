(()=>{const t=document.querySelector('[data-fo-track]');if(!t)return;
const tabs=[...document.querySelectorAll('[data-fo-go]')],n=tabs.length;let cur=0;
const mark=i=>{cur=i;tabs.forEach((b,k)=>b.setAttribute('aria-selected',String(k===i)))};
const go=i=>{i=(i+n)%n;t.scrollTo({left:t.clientWidth*i,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});mark(i)};
tabs.forEach((b,k)=>b.addEventListener('click',()=>go(k)));
document.querySelector('[data-fo-prev]').addEventListener('click',()=>go(cur-1));
document.querySelector('[data-fo-next]').addEventListener('click',()=>go(cur+1));
let raf;t.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const i=Math.round(t.scrollLeft/t.clientWidth);if(i!==cur)mark(i)})},{passive:true});
t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}});
addEventListener('resize',()=>{t.scrollLeft=t.clientWidth*cur});
if(location.hash){const k=['#it','#en','#es','#el'].indexOf(location.hash);if(k>-1)setTimeout(()=>go(k),50)}
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
