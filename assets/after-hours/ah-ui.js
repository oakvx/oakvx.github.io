/* SPDX-License-Identifier: GPL-2.0-only
 * AFTER HOURS — responsive DOM interface, 2026.
 * Adapted from the supplied Homebrew Channel browser port; water and boot
 * retain their separate renderers. See COPYING and NOTICE.md.
 */
window.AH = window.AH || {};
AH.App = (() => {
  'use strict';
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(any-pointer: fine) and (any-hover: hover)');
  const s = {lang:'it',view:'browser',mode:'grid',sort:'name',cursor:'wii',page:0,focus:0,app:null,busy:false,intro:true};
  const poses = {about:'showingoff',projects:'discofever',consoles:'flyspinning',games:'dancing',languages:'idlewainting',github:'sitting',tools:'standing',curiosity:'almostfalling'};
  const shorts = {about:'After hours, in four languages.',projects:'Three ideas that grew into complete projects.',consoles:'The consoles I have modified.',games:'The favourites on my shelf.',languages:'Italian, English, Spanish, Greek.',github:'Commits, from day one.',tools:'What I work with.',curiosity:'One question leads to another.'};
  const dom = {};
  let dialog, returnFocus, returnApp, dialogBack, selected = 'about', poseIndex = 0, clockTimer;
  let frame = 0, lastPaint = -Infinity, waterScale = 1, wasStatic = false;
  const pointer = {x:-200,y:-200,on:false,dirty:false};
  function read(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key,value); } catch {} }
  function text(it,en) { return s.lang === 'en' ? en : it; }
  function T(key) { return AH.STR[s.lang]?.[key] ?? AH.STR.it[key] ?? key; }
  function esc(value) { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function node(tag, cls, content) { const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e; }
  function icon(name) {
    const paths={home:'<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>',options:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',back:'<path d="m14 5-7 7 7 7"/>',next:'<path d="m10 5 7 7-7 7"/>',pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="m8 4 12 8-12 8Z"/>',power:'<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',sound:'<path d="M3 9h4l5-4v14l-5-4H3Z"/><path d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',external:'<path d="M14 3h7v7m0-7L10 14M11 5H4v15h15v-7"/>'};
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.home)+'</svg>';
  }
  function avatar(pose, cls='', animated=false) {
    const pic=node('span','mii '+cls);pic.setAttribute('aria-hidden','true');
    const img=node('img');img.src='/assets/avatars/'+pose+'-still.webp';img.width=144;img.height=144;img.alt='';img.decoding='async';
    if(animated)img.dataset.poseMotion=pose;pic.append(img);return pic;
  }
  function button(label, onClick, cls='btn', glyph) {
    const b=node('button',cls);b.type='button';
    if(glyph)b.innerHTML=icon(glyph);
    b.append(node('span','btn-label',label));if(onClick)b.addEventListener('click',onClick);return b;
  }
  function link(label,href,cls='btn',external=false) {
    const a=node('a',cls,label);a.href=localLink(href);if(external){a.target='_blank';a.rel='noopener noreferrer';}return a;
  }
  function localLink(href) {
    const u=new URL(href,location.href);
    if(u.origin===location.origin&&/^https?:$/.test(u.protocol)){
      let path=u.pathname;
      if(path.startsWith('/en/assets/'))path=path.slice(3);
      if(s.lang==='en'&&!path.startsWith('/en/'))path='/en'+(path.startsWith('/')?path:'/'+path);
      if(s.lang==='it'&&path.startsWith('/en/'))path=path.slice(3)||'/';
      u.pathname=path;
      u.searchParams.delete('lang');
    }
    return u.href;
  }
  function appList() { return AH.apps.slice().sort(s.sort==='date'?(a,b)=>a.order-b.order:(a,b)=>a.name.localeCompare(b.name,s.lang)); }
  function pageSize() { return s.mode==='list'?5:AH.apps.length; }
  function pageCount() { return Math.max(1,Math.ceil(AH.apps.length/pageSize())); }
  function short(app) { return s.lang==='en'?shorts[app.id]||app.short:app.short; }
  function banner(app) {
    const e=node('span','icon icon--'+app.id),ic=app.icon||{};
    if(ic.img){const img=node('img','ic-img');img.src=ic.img;img.alt='';img.width=384;img.height=144;img.decoding='async';img.style.objectFit=ic.fit||'cover';img.style.objectPosition=ic.pos||'50% 50%';e.append(img);}
    else if(app.id==='languages')e.innerHTML='<span class="ic-langs"><b>IT</b><b>EN</b><b>ES</b><b lang="el">ΕΛ</b></span>';
    else if(app.id==='github')e.innerHTML='<img class="ic-mark" src="/assets/icons/git.svg" width="48" height="48" alt=""><span class="ic-code">/oakvx</span>';
    else if(app.id==='tools')e.innerHTML='<span class="ic-tools"><img src="/assets/icons/javascript.svg" width="32" height="32" alt=""><img src="/assets/icons/nodejs.svg" width="32" height="32" alt=""><img src="/assets/icons/php.svg" width="42" height="32" alt=""></span><span class="ic-code">&lt;/&gt;</span>';
    else e.append(node('span','ic-glyph','?'));
    e.append(node('span','ic-scrim'));return e;
  }
  function selectTile(tile, focus=false) {
    if(!tile)return;dom.ui.querySelectorAll('.tile.is-focus').forEach(e=>e.classList.remove('is-focus'));
    tile.classList.add('is-focus');selected=tile.dataset.app;
    const app=AH.apps.find(a=>a.id===selected);s.focus=[...dom.grid.children].indexOf(tile);
    dom.selection.textContent=app.name;dom.selectionHint.textContent=short(app);
    if(focus){tile.focus({preventScroll:true});tile.scrollIntoView({block:'nearest',inline:'nearest'});}
  }
  function renderBrowser(focus=false) {
    const list=appList(),size=pageSize();s.page=Math.max(0,Math.min(s.page,pageCount()-1));
    dom.grid.replaceChildren();dom.grid.className='browser browser--'+s.mode;
    const visible=list.slice(s.page*size,(s.page+1)*size);
    visible.forEach((app,i)=>{
      const tile=button('',()=>openDetail(app),'plate tile');tile.replaceChildren();tile.dataset.app=app.id;tile.style.setProperty('--i',i);
      tile.setAttribute('aria-haspopup','dialog');
      const cover=node('span','tile__cover');cover.setAttribute('aria-hidden','true');cover.append(banner(app),avatar(poses[app.id],'tile__mii'));
      const copy=node('span','tile__copy'),name=node('span','tile__name',app.name),description=node('span','tile__desc',short(app)),open=node('span','tile__open',text('Apri','Open'));
      name.id='tile-title-'+app.id;description.id='tile-description-'+app.id;open.id='tile-open-'+app.id;copy.append(name,description);
      tile.append(cover,copy,open);
      tile.addEventListener('focus',()=>selectTile(tile));tile.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')selectTile(tile);});
      dom.grid.append(tile);
    });
    const chosen=[...dom.grid.children].find(e=>e.dataset.app===selected)||dom.grid.firstElementChild;selectTile(chosen,focus);
    dom.previous.disabled=s.page===0;dom.next.disabled=s.page>=pageCount()-1;dom.page.textContent=(s.page+1)+' / '+pageCount();
    dom.gridToggle.setAttribute('aria-pressed',String(s.mode==='grid'));dom.listToggle.setAttribute('aria-pressed',String(s.mode==='list'));
    dom.live.textContent=text('Pagina ','Page ')+(s.page+1)+text(' di ',' of ')+pageCount()+'. '+visible.map(a=>a.name).join(', ');
    syncChrome();
  }
  function setMode(mode, focus=false) { s.mode=mode;s.page=0;save('ah-mode',mode);renderBrowser(focus); }
  function changePage(delta) { const n=s.page+delta;if(n<0||n>=pageCount())return;s.page=n;renderBrowser(true); }
  function labeledIcon(name,it,en,action) { const b=button('',action,'system-button',name);b.dataset.labelIt=it;b.dataset.labelEn=en;return b; }
  function syncChrome() {
    dom.ui.querySelectorAll('[data-label-it]').forEach(e=>{const label=s.lang==='en'?e.dataset.labelEn:e.dataset.labelIt;e.setAttribute('aria-label',label);e.title=label;});
    dom.ui.querySelectorAll('[data-language]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.language===s.lang)));
    dom.classic.href=localLink('classic/');dom.classic.textContent=text('Versione classica','Classic version');
    dom.profile.title=text('Cambia posa del Mii di Gabriele','Change Gabriele’s Mii pose');dom.profile.setAttribute('aria-label',dom.profile.title);
    dom.motion.innerHTML=icon(root.classList.contains('paused')?'play':'pause');
    const label=root.classList.contains('paused')?text('Riprendi animazioni','Resume animations'):text('Ferma animazioni','Pause animations');dom.motion.setAttribute('aria-label',label);dom.motion.title=label;dom.motion.setAttribute('aria-pressed',String(root.classList.contains('paused')));
    dom.hint.textContent=matchMedia('(pointer: coarse)').matches?text('Tocca un’applicazione per iniziare.','Tap an application to begin.'):text('Frecce per scegliere · Invio per aprire · Esc per tornare','Arrows to select · Enter to open · Esc to go back');
    dom.tagline.textContent=text('Ancora una piccola rifinitura.','Just one more small refinement.');
    document.querySelector('.skip').textContent=text('Vai al contenuto','Skip to content');
    const labels={Home:text('Menu HOME','HOME menu'),'1':T('options'),'2':text('Cambia vista','Change view'),'-':text('Pagina precedente','Previous page'),'+':text('Pagina successiva','Next page'),Escape:T('back')};
    document.querySelectorAll('[data-wii-key]').forEach(b=>b.setAttribute('aria-label',b.textContent+' — '+labels[b.dataset.wiiKey]));
    syncRemote();
  }
  function syncRemote() {
    document.querySelectorAll('[data-wii-key]').forEach(b=>{
      const key=b.dataset.wiiKey;
      b.disabled=key==='Escape'?!dialog:key==='-'?!!dialog||s.page===0:key==='+'?!!dialog||s.page>=pageCount()-1:['1','2'].includes(key)?!!dialog:false;
      if(key==='2')b.setAttribute('aria-pressed',String(s.mode==='list'));
      if(key==='Home')b.setAttribute('aria-pressed',String(!!dialog));
    });
  }
  function setLanguage(lang) {
    if(s.lang===lang)return;
    const destination=lang==='en'?root.dataset.langEnUrl:root.dataset.staticLang==='en'?root.dataset.langItUrl:null;
    if(destination){
      save('lang',lang);
      const url=new URL(destination,location.href);if(location.hash&&!url.hash)url.hash=location.hash;
      location.assign(url.href);return;
    }
    s.lang=lang;root.lang=lang;root.dataset.lang=lang;save('lang',lang);
    try{const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}catch{}
    if(dialog)closeDialog(false);renderBrowser();updateClock();
  }
  function buildShell() {
    dom.ui.replaceChildren();dom.ui.className='ui';dom.ui.setAttribute('role','region');dom.ui.tabIndex=-1;
    const header=node('header','channel-header'),brand=node('div','channel-brand');
    dom.profile=button('',cyclePose,'profile-mii');dom.profile.replaceChildren(avatar('showingoff','',true));
    const title=node('div','brand-copy');title.innerHTML='<p class="eyebrow">Gabriele Lucia / oakvx</p><h1 class="wordmark">after <b>hours</b><span class="wordmark__dot" aria-hidden="true"></span></h1>';
    brand.append(dom.profile,title);
    const tools=node('div','system-tools');
    dom.clock=node('time','channel-clock');
    const langs=node('div','channel-languages');langs.setAttribute('role','group');langs.setAttribute('aria-label','Lingua / Language');
    ['it','en'].forEach(lang=>{const b=button(lang.toUpperCase(),()=>setLanguage(lang),'language-button');b.dataset.language=lang;langs.append(b);});
    const home=labeledIcon('home','Menu HOME','HOME menu',openHome),options=labeledIcon('options','Opzioni','Options',openOptions);
    dom.motion=labeledIcon('pause','Ferma animazioni','Pause animations',toggleMotion);dom.motion.dataset.motion='';
    const sound=button('',null,'system-button sound','sound');sound.dataset.sound='';sound.setAttribute('aria-pressed','false');sound.append(node('span','sr-only',text('Attiva audio','Turn sound on')));sound.lastChild.dataset.soundLabel='';
    dom.gridToggle=labeledIcon('grid','Vista griglia','Grid view',()=>setMode('grid'));dom.listToggle=labeledIcon('list','Vista lista','List view',()=>setMode('list'));
    const view=node('div','view-switch');view.setAttribute('role','group');view.setAttribute('aria-label','Vista / View');view.append(dom.gridToggle,dom.listToggle);
    tools.append(dom.clock,langs,view,options,dom.motion,sound,home);header.append(brand,tools);
    const stage=node('main','channel-stage');stage.id='channel-content';stage.tabIndex=-1;
    dom.grid=node('div','browser');dom.grid.setAttribute('role','group');dom.grid.setAttribute('aria-label','Applicazioni / Applications');stage.append(dom.grid);
    const footer=node('footer','channel-footer'),selection=node('div','channel-selection');
    const friends=node('div','mii-friends');friends.setAttribute('aria-hidden','true');['sitting','laughing','almostfalling'].forEach(pose=>friends.append(avatar(pose)));
    const selectedCopy=node('div','selection-copy');dom.selection=node('strong');dom.selectionHint=node('span');selectedCopy.append(dom.selection,dom.selectionHint);selection.append(friends,selectedCopy);
    const pager=node('nav','page-nav');pager.setAttribute('aria-label','Pagine / Pages');
    dom.previous=labeledIcon('back','Pagina precedente','Previous page',()=>changePage(-1));dom.next=labeledIcon('next','Pagina successiva','Next page',()=>changePage(1));dom.page=node('span','page-label');pager.append(dom.previous,dom.page,dom.next);
    dom.classic=link('','classic/','classic-link');footer.append(selection,pager,dom.classic);
    const caption=node('div','channel-caption');dom.tagline=node('span');dom.hint=node('span');caption.append(dom.tagline,dom.hint);
    const remote=document.querySelector('.touch-remote');remote.classList.add('remote');dom.remote=remote;
    dom.ui.append(header,stage,footer,caption,remote);dom.stage=stage;
    dom.live=node('p','sr-only');dom.live.setAttribute('aria-live','polite');document.body.append(dom.live);
    document.querySelector('.skip').href='#channel-content';
    updateClock();renderBrowser();
  }
  function cyclePose() {
    const choices=['showingoff','dancing','laughing','almostfalling','discofever'];poseIndex=(poseIndex+1)%choices.length;
    dom.profile.replaceChildren(avatar(choices[poseIndex],'',true));syncMotion();
  }
  function updateClock() {
    const now=new Date();dom.clock.dateTime=now.toISOString();dom.clock.textContent=new Intl.DateTimeFormat(s.lang==='en'?'en-GB':'it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit'}).format(now);dom.clock.title='Europe/Rome';
  }
  function startDialog(view, title, pose, backView=null) {
    if(!dialog){returnFocus=document.activeElement;returnApp=view==='detail'?selected:null;dialog=node('dialog','dlg');dialog.setAttribute('aria-labelledby','ah-dialog-title');document.body.append(dialog);
      dialog.addEventListener('cancel',e=>{e.preventDefault();goBack();});
      dialog.addEventListener('close',()=>{const old=dialog;if(!old)return;const appToRestore=returnApp;dialog=null;dom.ui.append(dom.remote);old.remove();s.view='browser';s.app=null;dialogBack=null;if(appToRestore)selected=appToRestore;renderBrowser();
        const restore=appToRestore?dom.grid.querySelector('[data-app="'+appToRestore+'"]'):returnFocus?.isConnected?returnFocus:dom.grid.querySelector('[data-app="'+selected+'"]');restore?.focus({preventScroll:true});syncMotion();refreshPointer();});
    }
    s.view=view;dialogBack=backView;s.busy=false;dialog.replaceChildren();
    const head=node('header','dlg-head');head.append(avatar(pose,'dlg-mii'));
    const copy=node('div');copy.append(node('p','eyebrow','AFTER HOURS'));const h=node('h2','dlg-title',title);h.id='ah-dialog-title';copy.append(h);head.append(copy);dialog.append(head);
    const body=node('div','dlg-body');body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label',title);dialog.append(body);const foot=node('footer','dlg-actions');dialog.append(foot,dom.remote);syncRemote();
    if(!dialog.open){dialog.showModal();window.dispatchEvent(new CustomEvent('wiiu:opened'));}
    requestAnimationFrame(()=>{dialog?.querySelector('[autofocus]')?.focus({preventScroll:true});refreshPointer();});
    return {body,foot};
  }
  function backButton(foot,action=goBack) { const b=button(T('back'),action,'btn btn--secondary','back');b.autofocus=true;foot.append(b);return b; }
  function closeDialog(restore=true) { if(!dialog)return;const d=dialog;if(!restore)returnFocus=null;d.close(); }
  function openDetail(app) {
    s.app=app;selected=app.id;const {body,foot}=startDialog('detail',app.name,poses[app.id]);
    const intro=node('div','app-intro');intro.append(banner(app),node('p','app-author','Gabriele Lucia / oakvx'));body.append(intro);
    const memo=node('div','memo');memo.lang='it';app.long.split(/\n\n+/).forEach(p=>memo.append(node('p','',p)));body.append(memo);
    const first=app.links?.[0];if(first)foot.append(link(T('link'),first.href,'btn',/^https?:/.test(first.href)));
    const open=button(T('open'),()=>openSection(app),'btn btn--primary');open.autofocus=true;foot.append(open);const back=backButton(foot,()=>closeDialog());back.autofocus=false;
    syncMotion();
  }
  function prepareContent(section) {
    section.querySelectorAll('a[href]').forEach(a=>{if(a.href.startsWith(location.origin))a.href=localLink(a.href);if(a.target==='_blank')a.rel='noopener noreferrer';});
    section.querySelectorAll('img').forEach(img=>{img.decoding='async';img.loading='lazy';});
    section.querySelectorAll('.entry').forEach(e=>{if(e.querySelectorAll('.e-thumb').length>1)e.classList.add('entry--poses');});
  }
  function openSection(app) {
    s.app=app;const {body,foot}=startDialog('section',app.name,poses[app.id]);dialog.classList.add('dlg--reading');
    const content=node('article','section section-inner');content.lang='it';content.innerHTML=app.section||'';prepareContent(content);body.append(content);AH.enhanceSection(content);
    backButton(foot,()=>closeDialog());syncMotion();
  }
  function openOptions() {
    const {body,foot}=startDialog('options',T('options'),'standing');
    function choice(title,items,value,change) {
      const group=node('fieldset','option-group');group.append(node('legend','',title));const row=node('div','option-choices');group.append(row);
      items.forEach(([id,label])=>{const b=button(label,()=>{change(id);row.querySelectorAll('button').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));},'btn option-choice');b.setAttribute('aria-pressed',String(id===value));row.append(b);});body.append(group);
    }
    choice(T('view'),[['grid',T('grid')],['list',T('list')]],s.mode,m=>setMode(m));
    choice(T('cursor'),[['wii',T('cursorWii')],['native',T('cursorNative')]],window.wiiuPointer?(wiiuPointer.enabled?'wii':'native'):s.cursor,v=>{s.cursor=v;save('ah-cursor',v);window.wiiuPointer?.setEnabled(v==='wii');hidePointer();});
    choice(T('sortBy'),[['name',T('name')],['date',T('date')]],s.sort,v=>{s.sort=v;s.page=0;save('ah-sort',v);renderBrowser();});
    foot.append(button(T('ok'),()=>closeDialog(),'btn btn--primary'));backButton(foot,()=>closeDialog());
  }
  function openHome() {
    const {body,foot}=startDialog('home','HOME','showingoff');
    const intro=node('div','home-intro');intro.append(avatar('dancing','',true),node('p','',text('Ancora una piccola rifinitura.','Just one more small refinement.')));body.append(intro);
    const actions=node('div','home-actions');actions.append(button(T('about'),openAbout,'btn','options'),link(T('exit'),'../','btn'),button(T('shutdown'),powerOff,'btn','power'));body.append(actions);backButton(foot,()=>closeDialog());syncMotion();
  }
  function openAbout() {
    const {body,foot}=startDialog('about',T('aboutTitle'),'laughing','home');
    const p=node('p','lead',text('Il canale personale di Gabriele Lucia / oakvx.','Gabriele Lucia / oakvx’s personal channel.'));body.append(p);
    body.append(node('p','',text('Progetti, console, giochi, lingue e curiosità: quello che resta aperto quando stacco.','Projects, consoles, games, languages and curiosity: whatever stays open after hours.')));
    body.append(node('p','',text('Interfaccia ispirata a Homebrew Channel, con acqua e bolle procedurali, controlli adattati al browser e le pose personali di Gabriele. Codice GPL-2.0-only; font Droid Sans Apache-2.0.','Inspired by Homebrew Channel, with procedural water and bubbles, browser controls and Gabriele’s personal avatar poses. GPL-2.0-only code; Apache-2.0 Droid Sans fonts.')));
    const links=node('p','about-links');links.append(link(text('Crediti e licenze','Credits and licenses'),'../assets/CREDITS.html','pill-link'),link(text('Versione classica','Classic version'),'classic/','pill-link'));body.append(links);backButton(foot,openHome);
  }
  function powerOff() {
    const {body,foot}=startDialog('off',T('shutdown'),'sleeping');dialog.classList.add('dlg--off');body.append(node('p','lead',T('powerOff')));
    foot.append(button(T('powerOn'),()=>{closeDialog();playIntro(true);},'btn btn--primary','power'));
  }
  function goBack() { if(!dialog)return;if(dialogBack==='home')openHome();else closeDialog(); }
  function moveFocus(delta) { const tiles=[...dom.grid.children];const idx=tiles.indexOf(document.activeElement);selectTile(tiles[Math.max(0,Math.min(tiles.length-1,(idx<0?s.focus:idx)+delta))],true); }
  function onKey(e) {
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(s.intro){if(!['Tab','Shift','Control','Alt','Meta'].includes(e.key)){e.preventDefault();AH.ChannelBoot.skip();}return;}
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(dialog){
      if(e.key==='Home'&&s.view==='home'){e.preventDefault();closeDialog();}
      else if(e.key==='Backspace'){e.preventDefault();goBack();}
      else if(['detail','section','about'].includes(s.view)&&['ArrowUp','ArrowDown','PageUp','PageDown'].includes(e.key)&&!e.target.closest('a')){e.preventDefault();dialog.querySelector('.dlg-body').scrollBy(0,(e.key==='ArrowUp'?-50:e.key==='ArrowDown'?50:e.key==='PageUp'?-250:250));}
      return;
    }
    const tile=e.target.closest('.tile');
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&(tile||e.target===dom.stage||e.target===dom.ui||e.target===document.body)){
      e.preventDefault();hidePointer();const cols=s.mode==='list'?1:getComputedStyle(dom.grid).gridTemplateColumns.split(' ').length;
      if(s.mode==='list'&&['ArrowLeft','ArrowRight'].includes(e.key))changePage(e.key==='ArrowRight'?1:-1);
      else moveFocus(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='ArrowUp'?-cols:cols);return;
    }
    if(e.target.closest('a,button')&&['Enter',' '].includes(e.key))return;
    switch(e.key){case '1':e.preventDefault();openOptions();break;case '2':e.preventDefault();setMode(s.mode==='grid'?'list':'grid',true);break;case 'Home':e.preventDefault();openHome();break;case 'PageUp':case '-':e.preventDefault();changePage(-1);break;case 'PageDown':case '+':case '=':e.preventDefault();changePage(1);break;case 'Enter':case ' ':e.preventDefault();dom.grid.querySelector('[data-app="'+selected+'"]')?.click();break;}
  }
  function hidePointer() { pointer.on=false;dom.cursor.classList.remove('on');root.classList.remove('ah-pointer');AH.Water.setPointer(-200,-200,false); }
  function refreshPointer() {
    if(!pointer.on)return;
    try{if(dom.cursor.matches(':popover-open'))dom.cursor.hidePopover();dom.cursor.showPopover();}catch{hidePointer();return;}
    dom.cursor.classList.add('on');root.classList.add('ah-pointer');pointer.dirty=true;schedule();
  }
  function onPointer(e) {
    if(window.wiiuPointer){
      hidePointer();
      if(wiiuPointer.enabled&&e.pointerType==='mouse'&&fine.matches&&!s.intro){AH.Water.setPointer(e.clientX/waterScale,e.clientY/waterScale,true);schedule();}
      return;
    }
    if(e.pointerType!=='mouse'||!fine.matches||s.cursor!=='wii'||s.intro||!dom.cursor.showPopover||e.target.closest('input,textarea,[contenteditable="true"]')){hidePointer();return;}
    pointer.x=e.clientX;pointer.y=e.clientY;pointer.dirty=true;
    if(!pointer.on){pointer.on=true;refreshPointer();}
    dom.cursor.classList.toggle('is-selecting',!!e.target.closest('a,button'));schedule();
  }
  function moving() { return !document.hidden&&!root.classList.contains('paused')&&!reduced.matches&&!s.intro; }
  function schedule() { if(!frame&&!document.hidden)frame=requestAnimationFrame(tick); }
  function tick(now) {
    frame=0;
    if(pointer.dirty){dom.cursor.style.transform='translate3d('+pointer.x+'px,'+pointer.y+'px,0)';AH.Water.setPointer(pointer.x/waterScale,pointer.y/waterScale,pointer.on);pointer.dirty=false;}
    const active=moving();
    if(active&&now-lastPaint>=1000/30||!active&&!wasStatic){AH.Water.frame(active?now/1000:0,active?Math.min(.05,(now-lastPaint)/1000)||1/30:0);lastPaint=now;wasStatic=!active;}
    if(active||pointer.dirty)schedule();
  }
  function syncMotion() {
    const still=!moving();root.classList.toggle('ah-still',still);
    document.querySelectorAll('img[data-pose-motion]').forEach(img=>{const pose=img.dataset.poseMotion,ext={showingoff:'webp',flyspinning:'webp'}[pose]||'gif';const src='/assets/avatars/'+pose+(still?'-still.webp':'.'+ext);if(img.getAttribute('src')!==src)img.src=src;});
    wasStatic=false;syncChrome();schedule();
  }
  function toggleMotion() { const paused=root.classList.toggle('paused');root.classList.toggle('calm',paused);save('motion',paused?'paused':'running');syncMotion();window.dispatchEvent(new CustomEvent('wiiu:motionchange')); }
  function layout() { waterScale=Math.max(.45,Math.min(innerWidth/852,innerHeight/480));AH.Water.resize(innerWidth/waterScale,innerHeight/waterScale,waterScale);wasStatic=false;schedule(); }
  function playIntro(skip=false) {
    s.intro=true;s.channelState='CHANNEL_BOOT';dom.ui.inert=true;hidePointer();syncMotion();
    AH.ChannelBoot.start({screen:dom.screen.parentNode,lang:s.lang,ready(){s.intro=false;s.channelState='HOMEBREW_INTERFACE';dom.ui.inert=false;renderBrowser();syncMotion();}});
    if(skip)AH.ChannelBoot.skip();
  }
  function init() {
    if(dom.ui)return;
    let lang;try{lang=root.dataset.staticLang||new URLSearchParams(location.search).get('lang');}catch{}
    s.lang=['it','en'].includes(lang)?lang:read('lang',(navigator.language||'').startsWith('en')?'en':'it');if(!['it','en'].includes(s.lang))s.lang='it';
    if(!root.dataset.staticLang&&s.lang==='en'&&root.dataset.langEnUrl){
      try{const current=new URL(location.href),destination=new URL(root.dataset.langEnUrl,location.href);current.searchParams.delete('lang');destination.search=current.searchParams.toString();destination.hash=current.hash;if(destination.pathname!==current.pathname){save('lang','en');location.replace(destination.href);return;}}catch{}
    }
    root.lang=s.lang;root.dataset.lang=s.lang;
    for(const [key,values] of Object.entries({mode:['grid','list'],sort:['name','date'],cursor:['wii','native']})){const value=read('ah-'+key,s[key]);if(values.includes(value))s[key]=value;}
    dom.screen=document.getElementById('screen');dom.ui=document.getElementById('ui');dom.cursor=document.getElementById('cursor');
    dom.cursor.setAttribute('popover','manual');dom.cursor.inert=true;document.body.append(dom.cursor);
    AH.Water.init(document.getElementById('water'));buildShell();layout();
    document.addEventListener('keydown',onKey);document.addEventListener('pointermove',onPointer,{passive:true});
    document.addEventListener('pointerdown',e=>{if(s.intro){AH.ChannelBoot.skip();return;}if(e.pointerType!=='mouse')hidePointer();});
    document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hidePointer();});
    document.addEventListener('keydown',e=>{if(e.key==='Tab')hidePointer();});
    document.addEventListener('click',e=>{const b=e.target.closest('button,.pill-link');if(!b||reduced.matches||root.classList.contains('paused'))return;b.classList.remove('is-press');requestAnimationFrame(()=>b.classList.add('is-press'));});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;hidePointer();}else updateClock();syncMotion();});
    addEventListener('resize',layout,{passive:true});reduced.addEventListener('change',syncMotion);fine.addEventListener('change',hidePointer);
    document.querySelectorAll('[data-wii-key]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.wiiKey;if(key==='Escape'){goBack();return;}if(key==='Home'&&dialog){closeDialog();return;}onKey({key,target:dom.ui,preventDefault(){},ctrlKey:false,metaKey:false,altKey:false});}));
    clockTimer=setInterval(()=>{if(!document.hidden)updateClock();},30000);
    addEventListener('pagehide',()=>{clearInterval(clockTimer);cancelAnimationFrame(frame);hidePointer();});
    addEventListener('pageshow',e=>{if(e.persisted){clockTimer=setInterval(()=>{if(!document.hidden)updateClock();},30000);syncMotion();}});
    if(window.__oakvxBootWaiting){
      dom.ui.inert=true;syncMotion();
      const resume=()=>{
        removeEventListener('wii-boot:prepare',resume);removeEventListener('wii-boot:ready',resume);
        s.intro=false;s.channelState='HOMEBREW_INTERFACE';dom.ui.inert=false;renderBrowser();syncMotion();
      };
      addEventListener('wii-boot:prepare',resume,{once:true});addEventListener('wii-boot:ready',resume,{once:true});
    }else playIntro();
  }
  return {init,state:s,_skip(){AH.ChannelBoot.skip();}};
})();
// Loaded at the end of the body so the shared sound controller can bind next.
AH.App.init();
