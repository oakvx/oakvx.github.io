/* Wii PAL startup. One native dialog preserves the real page underneath. */
(async () => {
  'use strict';
  const root=document.documentElement, params=new URLSearchParams(location.search);
  const base=new URL('.',document.currentScript.src), key='oakvx-wii-launched';
  const debug=['menu','preview'].includes(params.get('wii'))?params.get('wii'):null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const controller=new AbortController(), events={signal:controller.signal}, timers=new Set();
  const states={health:'HEALTH_SAFETY',menu:'WII_MENU',preview:'DISC_PREVIEW',wip:'CHANNEL_RUNNING'};
  let state='PORTFOLIO_RUNNING', disposed=false, busy=false, el, content, stage, audio;
  let scale=1, transition=0, animation, clockTimer, resizeFrame=0, handoffFrame=0, discRead=false, discIntro=null;
  let hover=null, stack=[], menuReturn=null, volume=.6, motionObserver, healthReady=false;
  let channels, screens, button, image, channelArt, arrow, systemScreen;
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());
  const part=name=>Number(parts.find(p=>p.type===name).value), today=new Date(part('year'),part('month')-1,part('day'),12);
  let model={screen:'health',page:0,settingsPage:0,settingId:'nickname',sdPage:0,channelId:'oakvx',storageKind:'channels',storageTab:'wii',boardDate:today,calendarDate:today,wipTitle:'',volume};
  const calm=()=>reduced.matches||root.classList.contains('paused')||root.classList.contains('calm');
  function remember(){window.__oakvxWiiLaunched=true;try{sessionStorage.setItem(key,'1');sessionStorage.setItem('wiiu-home-seen','1');}catch{}}
  function ready(reason){
    clearTimeout(window.__wiiBootTimer);window.__oakvxBootWaiting=false;
    root.classList.remove('wii-boot-pending','wii-boot-active','wii-boot-background-paused','home-loading');
    document.querySelectorAll('[data-home-loader]').forEach(n=>n.remove());
    dispatchEvent(new CustomEvent('wii-boot:ready',{detail:{reason}}));
  }
  function replay(){try{sessionStorage.removeItem(key);}catch{}const url=new URL(location.href);url.searchParams.delete('nowii');url.searchParams.delete('skipwii');url.searchParams.set('wii','menu');url.href===location.href?location.reload():location.assign(url.href);}
  const api={replay};
  for(const [name,get] of Object.entries({state:()=>state,screen:()=>model.screen,channel:()=>model.channelId,page:()=>model.page,sdPage:()=>model.sdPage,settingsPage:()=>model.settingsPage}))Object.defineProperty(api,name,{get});
  window.OAKVX_WII=api;
  let seen=!!window.__oakvxWiiLaunched;try{seen ||= sessionStorage.getItem(key)==='1';}catch{}
  const bypass=params.has('nowii')||params.has('skipwii');if(bypass)remember();
  if(bypass||/bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(navigator.userAgent)&&!debug||seen&&!debug&&!window.WII_BOOT_CONFIG?.force||window.__oakvxBootExpired&&!debug){ready(bypass?'skip':'session');return;}
  if(!window.HTMLDialogElement?.prototype.showModal){ready('unsupported');return;}
  function later(ms,fn){const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn();},ms);timers.add(id);return id;}
  function cancelTransition(){transition++;discIntro?.cancel();discIntro=null;timers.forEach(clearTimeout);timers.clear();cancelAnimationFrame(handoffFrame);handoffFrame=0;animation?.cancel();animation=null;el?.querySelectorAll('.wb-zoom').forEach(n=>n.remove());el?.classList.remove('wb-health-leaving');busy=false;}
  function fit(){resizeFrame=0;if(!stage)return;scale=Math.max(.1,Math.min(innerWidth/960,(innerHeight-56)/540));stage.style.transform=`translate(-50%,-50%) scale(${scale})`;el.classList.toggle('wb-portrait',innerHeight>innerWidth);}
  function announce(message){const live=el?.querySelector('#wb-live');if(live)live.textContent=message;}
  function clock(){
    if(disposed||document.hidden)return;
    const date=new Date(),time=content?.querySelector('#wb-clock'),label=content?.querySelector('#wb-date');
    if(time){
      const value=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
      const centers=[-54,-24,0,24,54];time.setAttribute('role','img');time.setAttribute('aria-label',value);
      time.innerHTML=[...value].map((digit,index)=>`<span class="wb-clock-glyph ${digit===':'?'wb-clock-colon':''}" aria-hidden="true" style="--wb-clock-x:${centers[index]}px;--wb-clock-image:url('${new URL(`original/native/clock/${digit===':'?'colon':digit}.png`,base).href}')"></span>`).join('');
    }
    if(label)label.textContent=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',weekday:'short',day:'2-digit',month:'2-digit'}).format(date);
  }
  function focus(selector){content?.querySelector(selector)?.focus({preventScroll:true});}
  const hot=()=>[...content.querySelectorAll('button:not([disabled])')].filter(n=>!n.closest('[inert]')&&n.getBoundingClientRect().width&&getComputedStyle(n).visibility!=='hidden');
  function snapshot(){
    const active=content.contains(document.activeElement)?document.activeElement:null;
    let focusSelector=active?.dataset.action?Object.entries(active.dataset).map(([key,value])=>`[data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${CSS.escape(value)}"]`).join(''):null;
    if(focusSelector&&content.querySelectorAll(focusSelector).length!==1)focusSelector=null;
    return{...model,focusSelector,focusIndex:hot().indexOf(active)};
  }
  function music(){
    const screen=model.screen,channel=channels.find(c=>c.id===model.channelId);
    const track=screen==='health'?'':screen==='preview'&&channel.audio?`channels/${channel.id}/audio.mp3`:['health','home','remote','preview','wip'].includes(screen)?'':'menu';
    audio.music(track);
  }
  function render(restoreIndex){
    if(disposed)return;state=states[model.screen]||'SYSTEM_SCREEN';el.dataset.view=model.screen;model.volume=volume;hover=null;
    el.querySelector('.wb-web-controls [data-action="home"]').hidden=model.screen==='health';
    content.innerHTML=model.screen==='health'?health():model.screen==='menu'?menuMarkup():model.screen==='preview'?previewMarkup():systemScreen(model,base,calm());
    content.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;if(img.parentElement){img.parentElement.classList.add('wb-image-unavailable');img.parentElement.dataset.fallback=img.closest('[data-channel]')?.getAttribute('aria-label')||channels.find(c=>c.id===model.channelId)?.name||'Wii';}},{once:true}));
    const disc=content.querySelector('[data-action="disc"]');if(disc)disc.setAttribute('aria-label','Canale Disco · OAKVX Gabriele Lucia');
    motion();clock();music();
    if(typeof restoreIndex==='string')focus(restoreIndex);
    else if(Number.isInteger(restoreIndex)&&restoreIndex>=0)hot()[restoreIndex]?.focus({preventScroll:true});
    else if(model.screen==='menu')focus(`[data-channel="${model.channelId}"]`);
    else if(model.screen==='health')focus('[data-action="continue"]');
    else if(model.screen==='preview')focus('[data-action="wii-menu"]');
    else hot()[0]?.focus({preventScroll:true});
    if(!content.contains(document.activeElement))content.focus({preventScroll:true});
    announce(model.screen==='menu'?'Menu Wii. Seleziona un canale.':content.querySelector('h1')?.textContent||channels.find(c=>c.id===model.channelId)?.name||'');
  }
  function health(){return `<section class="wb-health"><h1 class="wb-sr">ATTENZIONE - SALUTE E SICUREZZA</h1><p class="wb-sr">Prima di iniziare a giocare, leggi attentamente il manuale di istruzioni della console, dove trovi importanti informazioni per la tua salute e sicurezza. Anche online, alla pagina: www.nintendo.com/healthsafety/</p>${image(base,'native/health/italian-body.png','wb-health-native')}<button type="button" class="wb-health-continue wb-hot" data-action="continue" ${healthReady?'':'disabled'}>${image(base,'native/health/italian-prompt.png')}<span class="wb-sr">Premi A per proseguire.</span></button></section>`;}
  function menuMarkup(){return `<section class="wb-menu" aria-label="Menu Wii"><div class="wb-grid-viewport"><div class="wb-grid-track" style="transform:translateX(-${model.page*960}px)">${Array.from({length:4},(_,page)=>`<div class="wb-grid" ${page!==model.page?'inert aria-hidden="true"':''}>${Array.from({length:12},(_,index)=>{const c=channels[page*12+index];return c?`<button type="button" class="wb-tile wb-hot" data-action="${c.id==='oakvx'?'disc':'channel'}" data-channel="${c.id}" aria-label="${c.name}${c.id==='oakvx'?' · OAKVX':''}"><span class="wb-tile-face">${channelArt(c,base,false,calm())}</span></button>`:'<div class="wb-tile wb-empty" aria-hidden="true"><span>Wii</span></div>';}).join('')}</div>`).join('')}</div></div>${model.page?arrow('page-prev','left','Pagina precedente'):''}${model.page<3?arrow('page-next','right','Pagina successiva'):''}<div class="wb-bottombar"><svg class="wb-bar-curve" viewBox="0 0 960 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 3H174C235 3 250 27 315 27H645C710 27 725 3 786 3H960V120H0Z" fill="#ced1d7" stroke="#39b7e7" stroke-width="2"/></svg><button type="button" class="wb-circle-btn wb-wii wb-hot" data-action="screen" data-target="options" aria-label="Opzioni Wii">${image(base,'ui/wii-button.png')}</button><button type="button" class="wb-sd wb-hot" data-action="screen" data-target="sd" aria-label="Menu scheda SD">${image(base,'ui/sd.png')}</button><div class="wb-clockbox"><div class="wb-clock" id="wb-clock"></div><div class="wb-date" id="wb-date"></div></div><button type="button" class="wb-circle-btn wb-mail wb-hot" data-action="screen" data-target="board" aria-label="Bacheca Wii">${image(base,'ui/mail-button.png')}</button><span class="wb-menu-page" aria-label="Pagina ${model.page+1} di 4">${model.page+1}/4</span></div><span class="wb-hover-label" aria-hidden="true"></span></section>`;}
  function previewMarkup(){
    const c=channels.find(c=>c.id===model.channelId);
    const oakvx=`<div class="wb-oakvx-banner"><div class="wb-oakvx-orbit" aria-hidden="true"></div><div class="wb-oakvx-title"><p><b>gl.</b> Gabriele Lucia presenta</p><h1>OAKVX</h1><span>Un mondo da esplorare.</span><small>Developer &amp; Graphic Designer</small></div><div class="wb-oakvx-character"><div class="wb-oakvx-platform" aria-hidden="true"></div><img class="wb-oakvx-avatar" src="${new URL('../avatars/showingoff-still.webp',base).href}" alt="Il Mii di Gabriele"></div><p class="wb-oakvx-tagline">Codice. Design. Un po’ di me.</p><span class="wb-oakvx-edition">PORTFOLIO INTERATTIVO</span></div>`;
    const drive=`<div class="wb-drive-scene" aria-hidden="true"><div class="wb-drive-shadow"></div><div class="wb-drive-console"><span class="wb-drive-mark">gl.</span><span class="wb-drive-power"></span></div><div class="wb-drive-slot"><span class="wb-drive-light"></span></div><div class="wb-disc-path"><div class="wb-inserting-disc"><img src="${new URL('oakvx-disc.svg',base).href}" alt=""></div></div></div><p class="wb-drive-status">Inserimento del disco…</p>`;
    return `<section class="wb-preview" aria-label="${c.name}"><div class="wb-banner-area" id="wb-banner"><div class="wb-reading" id="wb-reading" hidden>${c.id==='oakvx'?drive:''}</div><div class="wb-game" id="wb-game">${c.id==='oakvx'?oakvx:`<h1 class="wb-sr">${c.name}</h1>${channelArt(c,base,true,calm())}`}</div></div>${arrow('channel-prev','left','Canale precedente')}${arrow('channel-next','right','Canale successivo')}<div class="wb-buttonbar">${button('Menu Wii','wii-menu')}${button('Avvia','start')}</div></section>`;
  }
  // Advance on actual animation completion: inserting, reading, then the title.
  // Each run owns its animations so leaving the channel cannot unlock a later one.
  function playDiscIntro(finish){
    const preview=content.querySelector('.wb-preview'),reading=content.querySelector('#wb-reading'),game=content.querySelector('#wb-game');
    const running=new Set();let active=true;
    const cancel=()=>{active=false;running.forEach(a=>a.cancel());running.clear();};
    const complete=()=>{if(!active)return;cancel();discIntro=null;preview.dataset.discPhase='ready';finish();};
    const sync=()=>{if(calm()){complete();return;}running.forEach(a=>{if(a.playState==='finished')return;document.hidden?a.pause():a.play();});};
    discIntro={cancel,sync};preview.dataset.discPhase='inserting';
    reading.hidden=false;game.hidden=true;preview.setAttribute('aria-busy','true');
    if(calm()||!reading.animate){complete();return;}
    const play=async(node,frames,options)=>{
      if(!active)return false;
      const a=node.animate(frames,{fill:'both',easing:'cubic-bezier(.22,.61,.36,1)',...options});running.add(a);
      if(document.hidden)a.pause();
      try{await a.finished;return active;}catch{return false;}
    };
    (async()=>{
      const disc=reading.querySelector('.wb-inserting-disc');
      if(!await play(disc,[
        {transform:'translateX(0) perspective(900px) rotateY(0deg)',offset:0},
        {transform:'translateX(0) perspective(900px) rotateY(0deg)',offset:.15,easing:'ease-in-out'},
        {transform:'translateX(0) perspective(900px) rotateY(68deg)',offset:.37},
        {transform:'translateX(0) perspective(900px) rotateY(68deg)',offset:.42,easing:'ease-in-out'},
        {transform:'translateX(480px) perspective(900px) rotateY(68deg)',offset:1}
      ],{duration:2400,easing:'linear'}))return;
      preview.dataset.discPhase='reading';reading.querySelector('p').textContent='Lettura del disco…';announce('Disco inserito. Lettura di OAKVX.');
      if(!await play(reading.querySelector('.wb-drive-light'),[{opacity:.35},{opacity:1},{opacity:.35},{opacity:1}],{duration:800}))return;
      preview.dataset.discPhase='banner';game.hidden=false;reading.querySelector('p').textContent='OAKVX è pronto.';
      const entered=await Promise.all([
        play(reading,[{opacity:1},{opacity:0}],{duration:300}),
        play(game,[{opacity:0},{opacity:1}],{duration:700}),
        play(game.querySelector('.wb-oakvx-title'),[{transform:'translateY(18px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:650,delay:90}),
        play(game.querySelector('.wb-oakvx-character'),[{transform:'translateY(20px) scale(.92)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}],{duration:720,delay:100})
      ]);
      if(entered.every(Boolean))complete();
    })().catch(()=>{if(active)complete();});
  }
  function navigate(screen,options={}){
    if(disposed||state==='PORTFOLIO_LAUNCHING'||!Object.hasOwn(screens,screen))return false;
    if(screen==='menu'){toMenu();return true;}if(screen==='preview'){openChannel(model.channelId);return true;}
    if(model.screen==='menu')menuReturn=snapshot();
    if(!options.replace)stack.push(snapshot());
    const restartAvailable=['preview','wip'].includes(model.screen);
    cancelTransition();model.screen=screen;Object.assign(model,options.values);if(screen==='home')model.restartAvailable=restartAvailable;render();return true;
  }
  function back(){
    if(disposed||state==='PORTFOLIO_LAUNCHING')return;if(model.screen==='preview'){toMenu();return;}
    const previous=stack.pop();if(!previous){toMenu();return;}cancelTransition();model=previous;
    if(model.screen==='preview'&&model.channelId==='oakvx'&&!discRead){openChannel('oakvx');return;}
    render(previous.focusSelector??previous.focusIndex);audio.effect('back');
  }
  function toMenu(){if(disposed||state==='PORTFOLIO_LAUNCHING')return;cancelTransition();stack=[];if(menuReturn)model={...menuReturn};model.screen='menu';render(menuReturn?.focusSelector??menuReturn?.focusIndex);audio.effect('channel-back');}
  function openChannel(id,fromTile){
    const c=channels.find(c=>c.id===id);if(!c||disposed||state==='PORTFOLIO_LAUNCHING')return false;
    if(model.screen==='menu'){if(model.page===0)focus(`[data-channel="${id}"]`);menuReturn=snapshot();if(model.page===0)menuReturn.channelId=id;}
    const source=fromTile?.cloneNode(true),rect=fromTile?.getBoundingClientRect(),stageRect=stage.getBoundingClientRect();
    cancelTransition();stack=[];model.channelId=id;model.screen='preview';render();busy=true;state='DISC_CHANNEL_SELECTED';
    const token=transition,reading=id==='oakvx'&&!discRead,start=content.querySelector('[data-action="start"]');start.disabled=true;
    content.querySelectorAll('.wb-page-arrow').forEach(node=>{node.disabled=true;});
    const finish=()=>{if(token!==transition||disposed)return;discRead ||= reading;busy=false;state='DISC_PREVIEW';const preview=content.querySelector('.wb-preview');preview.removeAttribute('aria-busy');if(id==='oakvx')preview.dataset.discPhase='ready';content.querySelector('#wb-reading').hidden=true;content.querySelector('#wb-game').hidden=false;start.disabled=false;content.querySelectorAll('.wb-page-arrow').forEach(node=>{node.disabled=false;});focus('[data-action="start"]');announce(c.name+' pronto. Premi Avvia.');};
    if(source&&!calm()&&source.animate){
      source.inert=true;source.classList.add('wb-zoom');source.removeAttribute('data-action');source.setAttribute('aria-hidden','true');
      const x=(rect.x-stageRect.x)/scale,y=(rect.y-stageRect.y)/scale,w=rect.width/scale,h=rect.height/scale;
      Object.assign(source.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});stage.append(source);
      animation=source.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${-x}px,${-y}px) scale(${960/w},${401.44737/h})`,opacity:0}],{duration:28/60*1000,easing:'cubic-bezier(.333333,0,.666667,1)',fill:'forwards'});
      animation.finished.then(()=>{source.remove();animation=null;}).catch(()=>{});
    }
    if(reading)playDiscIntro(finish);else later(calm()?40:fromTile?28/60*1000:20/60*1000,finish);audio.effect('channel-open');return true;
  }
  function wip(title){navigate('wip',{values:{wipTitle:title}});audio.effect('select');}
  function enter(event){
    if(model.screen!=='health'||!healthReady||busy)return;
    window.wiiuSound?.activate(event);busy=true;state='HEALTH_EXIT';el.classList.add('wb-health-leaving');
    later(calm()?0:31/60*1000,()=>{busy=false;el.classList.remove('wb-health-leaving');model.screen='menu';render();audio.effect('wii-start');});
  }
  function dispose(){if(disposed)return;disposed=true;cancelTransition();controller.abort();motionObserver?.disconnect();clearInterval(clockTimer);cancelAnimationFrame(resizeFrame);audio?.dispose();el?.close();el?.remove();window.wiiuSound?.setScene('portfolio');}
  function reveal(reason){
    if(disposed)return;dispose();state='PORTFOLIO_RUNNING';remember();ready(reason);
    const destination=document.querySelector('#main, #channel-content, main');if(destination){const hadTab=destination.hasAttribute('tabindex');if(!hadTab)destination.tabIndex=-1;destination.focus({preventScroll:true});if(!hadTab)destination.addEventListener('blur',()=>destination.removeAttribute('tabindex'),{once:true});}
  }
  function launch(){
    if(disposed||busy||model.screen!=='preview')return;if(model.channelId!=='oakvx'){wip(channels.find(c=>c.id===model.channelId).name);return;}
    cancelTransition();state='PORTFOLIO_LAUNCHING';busy=true;audio.music('');audio.effect('start');el.classList.add('wb-launching');
    later(calm()?0:280,()=>{
      root.classList.remove('home-loading','wii-boot-background-paused');
      document.querySelectorAll('[data-home-loader]').forEach(n=>n.remove());
      dispatchEvent(new CustomEvent('wii-boot:prepare'));stage.style.visibility='hidden';
      if(calm()){reveal('start');return;}
      // Give the destination (including After Hours) a painted frame before
      // fading the full overlay. A transparent native backdrop avoids a cut
      // when the finished dialog is removed.
      handoffFrame=requestAnimationFrame(()=>{
        handoffFrame=requestAnimationFrame(()=>{
          handoffFrame=0;if(disposed)return;
          el.classList.add('wb-revealing');later(440,()=>reveal('start'));
        });
      });
    });
  }
  function changePage(delta){
    if(model.screen!=='menu'||busy)return;
    model.page=Math.max(0,Math.min(3,model.page+delta));
    const track=content.querySelector('.wb-grid-track');track.style.transform=`translateX(-${model.page*960}px)`;
    [...track.children].forEach((node,index)=>{node.inert=index!==model.page;node.setAttribute('aria-hidden',String(node.inert));});
    for(const [direction,action,label] of [['left','page-prev','Pagina precedente'],['right','page-next','Pagina successiva']]){
      let node=content.querySelector(`[data-action="${action}"]`);
      if(!node){content.querySelector('.wb-menu').insertAdjacentHTML('beforeend',arrow(action,direction,label));node=content.querySelector(`[data-action="${action}"]`);}
      node.hidden=direction==='left'?model.page===0:model.page===3;
    }
    const label=content.querySelector('.wb-hover-label');label.textContent='';label.classList.remove('is-visible');
    const pageLabel=content.querySelector('.wb-menu-page');pageLabel.textContent=`${model.page+1}/4`;pageLabel.setAttribute('aria-label',`Pagina ${model.page+1} di 4`);
    focus(`[data-action="page-${delta>0?'prev':'next'}"]`);audio.effect('page');announce(`Pagina ${model.page+1} di 4`);
  }
  function moveDate(days){model.boardDate=new Date(model.boardDate.getFullYear(),model.boardDate.getMonth(),model.boardDate.getDate()+days,12);render();audio.effect('calendar-scroll');}
  function showHome(){if(!['health','home','remote'].includes(model.screen)){navigate('home');audio.effect('home-in');}else if(['home','remote'].includes(model.screen))back();}
  function handle(node,event){
    const action=node.dataset.action,d=node.dataset;if(node.disabled)return;if(busy&&!['back','wii-menu','skip','sound'].includes(action))return;
    if(action==='continue')enter(event);
    else if(action==='disc'||action==='channel')openChannel(d.channel,node);
    else if(action==='start')launch();else if(action==='wii-menu')toMenu();else if(action==='back'||action==='resume')back();else if(action==='skip')reveal('skip');
    else if(action==='sound'){const sound=window.wiiuSound;sound?.setEnabled(!sound.getState().enabled,event);audio.effect('select');}
    else if(action==='home')showHome();else if(action==='restart')openChannel(model.channelId);
    else if(action==='screen'){if(d.target==='settings')model.settingsPage=0;navigate(d.target);audio.effect('select');}
    else if(action==='page-next'||action==='page-prev')changePage(action==='page-next'?1:-1);
    else if(action==='channel-next'||action==='channel-prev')openChannel(channels[(channels.findIndex(c=>c.id===model.channelId)+(action==='channel-next'?1:channels.length-1))%channels.length].id);
    else if(action==='settings-next'||action==='settings-prev'){model.settingsPage=Math.max(0,Math.min(2,model.settingsPage+(action==='settings-next'?1:-1)));render();focus(`[data-action="${action}"]`);audio.effect('page');}
    else if(action==='setting'){navigate('setting',{values:{settingId:d.id}});audio.effect('select');}
    else if(action==='wip')wip(d.title);
    else if(action==='storage'){navigate('storage',{values:{storageKind:d.kind,storageTab:d.kind==='gamecube'?'a':'wii'}});audio.effect('select');}
    else if(action==='storage-tab'){model.storageTab=d.id;render();focus(`[data-action="storage-tab"][data-id="${d.id}"]`);audio.effect('select');}
    else if(action==='data-item'){navigate('data-item',{values:{channelId:d.id}});audio.effect('select');}
    else if(action==='sd-next'||action==='sd-prev'||action==='sd-page'){model.sdPage=Math.max(0,Math.min(19,action==='sd-page'?Number(d.id):model.sdPage+(action==='sd-next'?1:-1)));render();focus(action==='sd-page'?`[data-action="sd-page"][data-id="${d.id}"]`:`[data-action="${model.sdPage===19?'sd-prev':model.sdPage===0?'sd-next':action}"]`);audio.effect('page');}
    else if(action==='day-next'||action==='day-prev')moveDate(action==='day-next'?1:-1);
    else if(action==='month-next'||action==='month-prev'){model.calendarDate=new Date(model.calendarDate.getFullYear(),model.calendarDate.getMonth()+(action==='month-next'?1:-1),1,12);render();focus(`[data-action="${action}"]`);audio.effect('calendar-scroll');}
    else if(action==='calendar-day'){
      const chosen=new Date(model.calendarDate.getFullYear(),model.calendarDate.getMonth(),Number(d.id),12),previous=stack.pop();
      cancelTransition();model={...(previous||model),screen:'board',boardDate:chosen,calendarDate:new Date(chosen.getFullYear(),chosen.getMonth(),1,12)};render(previous?.focusIndex);audio.effect('select');
    }
    else if(action==='volume'){volume=Math.max(0,Math.min(1,volume+Number(d.delta)));audio.setVolume(volume);render();focus(`[data-action="volume"][data-delta="${d.delta}"]`);audio.effect('select');}
  }
  function motion(){
    if(!el)return;const stopped=calm()||document.hidden;el.classList.toggle('wb-calm',stopped);if(stopped&&animation)animation.finish();discIntro?.sync();
    content?.querySelectorAll('[data-wb-motion]').forEach(img=>{
      if(stopped){if(img._wbTimer){clearTimeout(img._wbTimer);timers.delete(img._wbTimer);img._wbTimer=null;}img._wbLoop=false;}
      const source=stopped?img.dataset.still:img._wbLoop?img.dataset.loop:img.dataset.animated;
      if(img.src!==source)img.src=source;
      if(!stopped&&img.dataset.loop&&!img._wbLoop&&!img._wbTimer)img._wbTimer=later(Number(img.dataset.loopDelay),()=>{
        img._wbTimer=null;if(!content.contains(img)||calm()||document.hidden)return;img._wbLoop=true;img.src=img.dataset.loop;
      });
    });
  }
  try{
    const data=window.OAKVX_WII_CONTENT,soundModule=window.OAKVX_WII_AUDIO;
    if(!data||!soundModule)throw new Error('Wii screen or audio module unavailable');
    ({channels,screens,button,image,channelArt,arrow,systemScreen}=data);if(window.__oakvxBootExpired&&!debug){ready('fallback');return;}
    const english=root.lang==='en';
    el=document.createElement('dialog');el.id='wii-boot';el.lang=english?'en':'it';el.setAttribute('aria-label',english?'Wii console · OAKVX startup':'Console Wii · Avvio OAKVX');
    const skipLabel=english?'Skip intro · go to portfolio':'Salta intro · vai al portfolio';
    const controlsLabel=english?'Website controls':'Controlli del sito';
    const rotateHint=english?'Rotate your phone for a larger view.':'Ruota il telefono per una visuale più grande.';
    el.innerHTML=`<div class="wb-stage" lang="it"><div id="wb-content" tabindex="-1"></div></div><div class="wb-web-controls" lang="${root.lang}" aria-label="${controlsLabel}">${button(english?'Audio: off':'Audio: disattivato','sound')}${button('HOME','home')}${button(skipLabel,'skip',{},'wb-skip-action')}</div><p class="wb-rotate-hint" lang="${root.lang}">${rotateHint}</p><p class="wb-sr" id="wb-live" lang="it" aria-live="polite"></p>`;
    el.querySelector('[data-action="skip"]').lang=root.lang;
    stage=el.querySelector('.wb-stage');content=el.querySelector('#wb-content');document.body.append(el);
    if(getComputedStyle(stage).position!=='absolute')throw new Error('Wii stylesheet unavailable');
    root.classList.add('wii-boot-active','wii-boot-background-paused');root.classList.remove('wii-boot-pending');clearTimeout(window.__wiiBootTimer);
    window.wiiuSound?.setScene('wii');audio=soundModule.createWiiAudio(base,window.wiiuSound,sound=>{const toggle=el.querySelector('[data-action="sound"]');toggle.textContent=!sound.available?(english?'Audio unavailable':'Audio non disponibile'):sound.enabled?(english?'Audio: on':'Audio: attivato'):(english?'Audio: off':'Audio: disattivato');toggle.setAttribute('aria-pressed',String(sound.enabled));toggle.disabled=!sound.available;});audio.setVolume(volume);
    if(debug)model.screen='menu';render();fit();el.showModal();focus(model.screen==='health'?'[data-action="continue"]':'[data-action="disc"]');
    if(!debug)later(calm()?0:(31+60)/60*1000,()=>{healthReady=true;const b=content.querySelector('[data-action="continue"]');if(b){b.disabled=false;b.focus({preventScroll:true});}});
    clockTimer=setInterval(clock,30000);motionObserver=new MutationObserver(motion);motionObserver.observe(root,{attributes:true,attributeFilter:['class']});
    el.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(target)handle(target,e);},events);
    el.addEventListener('cancel',e=>{e.preventDefault();['menu','health'].includes(model.screen)?reveal('skip'):back();},events);
    const updateHover=target=>{const control=target?.closest('.wb-hot'),label=content.querySelector('.wb-hover-label');if(control!==hover){hover=control;if(control)audio.effect('hover');}if(label){label.textContent=control?.dataset.channel?channels.find(c=>c.id===control.dataset.channel)?.name:'';label.classList.toggle('is-visible',!!label.textContent);}};
    el.addEventListener('pointerover',e=>{if(e.pointerType==='mouse')updateHover(e.target);},{...events,passive:true});el.addEventListener('focusin',e=>updateHover(e.target),events);
    el.addEventListener('pointerleave',()=>updateHover(null),events);
    addEventListener('keydown',e=>{
      if(disposed||e.ctrlKey||e.metaKey||e.altKey)return;e.stopImmediatePropagation();
      if(e.key==='Escape'){e.preventDefault();['health','menu'].includes(model.screen)?reveal('skip'):back();}
      else if(e.key==='Home'||e.key==='h'||e.key==='H'){e.preventDefault();showHome();}
      else if(e.key==='a'||e.key==='A'){e.preventDefault();if(model.screen==='health')enter(e);else document.activeElement?.closest('#wii-boot button')?.click();}
      else if((e.key==='Enter'||e.key===' ')&&model.screen==='health'){e.preventDefault();enter(e);}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();const controls=hot(),current=document.activeElement?.getBoundingClientRect();if(!current){controls[0]?.focus();return;}
        const x=current.x+current.width/2,y=current.y+current.height/2,dx=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0,dy=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;
        controls.map(node=>{const r=node.getBoundingClientRect(),xx=r.x+r.width/2-x,yy=r.y+r.height/2-y;return{node,along:xx*dx+yy*dy,across:Math.abs(xx*dy-yy*dx)};}).filter(n=>n.along>2).sort((a,b)=>(a.along+a.across*4)-(b.along+b.across*4))[0]?.node.focus({preventScroll:true});
      }else if(e.key==='+'||e.key==='-'){e.preventDefault();if(model.screen==='menu')changePage(e.key==='+'?1:-1);else if(model.screen==='sd')handle({dataset:{action:e.key==='+'?'sd-next':'sd-prev'}},e);}
    },{...events,capture:true});
    addEventListener('resize',()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(fit);},{...events,passive:true});reduced.addEventListener('change',motion,events);
    document.addEventListener('visibilitychange',()=>{motion();if(!document.hidden)clock();},events);
    addEventListener('pagehide',()=>{cancelTransition();clearInterval(clockTimer);audio.music('');},events);
    addEventListener('pageshow',e=>{if(e.persisted&&!disposed){clearInterval(clockTimer);clockTimer=setInterval(clock,30000);if(state==='PORTFOLIO_LAUNCHING')reveal('restore');else{toMenu();clock();}}},events);
    Object.assign(api,{toPreview:()=>openChannel('oakvx'),toMenu,openChannel:id=>openChannel(id),openScreen:screen=>navigate(screen),launch,skip:()=>reveal('skip')});if(debug==='preview')openChannel('oakvx');
  }catch(error){dispose();ready('error');console.error('Wii startup could not load:',error);}
})();
