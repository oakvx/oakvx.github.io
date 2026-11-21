/* PAL menu contents. Classic script also supports local file:// previews. */
(() => {
'use strict';
const channels = [
  { id: 'oakvx', name: 'Canale Disco', subtitle: 'OAKVX · Gabriele Lucia' },
  { id: 'mii', name: 'Canale Mii', banner: true, audio: true },
  { id: 'photo', name: 'Canale Foto', banner: true, audio: true },
  { id: 'shop', name: 'Canale Wii Shop', banner: true, audio: true },
  { id: 'forecast', name: 'Canale Meteo', banner: true, audio: true },
  { id: 'news', name: 'Canale Notizie', banner: true, audio: true },
  { id: 'internet', name: 'Canale Internet', banner: true, audio: true },
  { id: 'votes', name: 'Canale Vota Anche Tu', banner: true, audio: true },
  { id: 'nintendo', name: 'Canale Nintendo', banner: true, audio: true },
  { id: 'contest', name: 'Canale Concorsi Mii', banner: true, audio: true }
];
const bannerIntro = {mii:60,photo:40,shop:790,forecast:18,news:120,internet:566,votes:300,nintendo:600,contest:122};
const channelAudio=Object.freeze({
  mii:{loop:false},photo:{loop:false},forecast:{loop:false},news:{loop:false},internet:{loop:false},votes:{loop:false},
  shop:{loop:true,loopStart:.001625,loopEnd:8.00184375},
  nintendo:{loop:true,loopStart:8.604656084656085,loopEnd:10.012940287226002},
  contest:{loop:true,loopStart:6.1696875,loopEnd:9.64784375}
});
const screens=Object.freeze(Object.fromEntries([
  'health','menu','preview','options','settings','setting','data','saves','storage','data-item',
  'sd','board','calendar','message','create','memo','address','home','remote','wip'
].map(id=>[id,Object.freeze({id})])));
const settings = [
  { id: 'nickname', name: 'Nickname console Wii', choices: ['OAKVX'] },
  { id: 'datetime', name: 'Data e ora', choices: ['Data', 'Ora'] },
  { id: 'screen', name: 'Schermo', choices: ['Posizione schermo', 'Rapporto schermo', 'Tipo di TV', 'Protezione schermo'] },
  { id: 'sound', name: 'Suono', choices: ['Mono', 'Stereo', 'Surround'] },
  { id: 'parental', name: 'Filtro famiglia', choices: ['Impostazioni filtro famiglia'] },
  { id: 'sensor', name: 'Barra sensore', choices: ['Posizione barra sensore', 'Sensibilità'] },
  { id: 'internet', name: 'Internet', choices: ['Impostazioni di collegamento', 'Informazioni console Wii', 'Accordo / Contatto'] },
  { id: 'wiiconnect24', name: 'WiiConnect24', choices: ['Sì / No', 'Connessione durante standby', 'Illuminazione slot disco'] },
  { id: 'language', name: 'Lingua', choices: ['Italiano', 'English', 'Deutsch', 'Français', 'Español', 'Nederlands'] },
  { id: 'country', name: 'Paese', choices: ['Italia'] },
  { id: 'update', name: 'Aggiornamento console Wii', choices: ['Avvia aggiornamento'] },
  { id: 'format', name: 'Formattazione console Wii', choices: ['Formatta'] }
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const attrs = values => Object.entries(values).map(([key,value]) => ` data-${key}="${escapeHTML(value)}"`).join('');
function button(label, action, values = {}, cls = '') {
  return `<button type="button" class="wb-btn wb-hot ${cls}" data-action="${action}"${attrs(values)}>${escapeHTML(label)}</button>`;
}
function image(base, path, cls = '', alt = '') {
  if(path==='ui/mail-button.png')return `<span class="wb-native-mail">${image(base,'native/ui/mail-button-base.png')}${image(base,'native/ui/mail-symbol.png','wb-mail-symbol')}</span>`;
  const native={'ui/wii-button.png':'native/ui/wii-button.png','ui/sd.png':'native/ui/sd.png'};
  path=native[path]||path;
  return `<img src="${new URL('original/' + path, base).href}" class="${cls}" alt="${escapeHTML(alt)}" draggable="false">`;
}
function channelArt(channel, base, large = false, calm = false) {
  const id = channel.id;
  if (id === 'oakvx') return `<div class="wb-channel-art wb-art-oakvx" aria-hidden="true"><img src="${new URL('oakvx-disc.svg',base).href}" class="wb-disc-mini" alt=""><span class="wb-oakvx-wordmark">OAKVX </span><span class="wb-oakvx-caption">Gabriele Lucia</span></div>`;
  const media=(still,live,loop)=>{
    const url=file=>new URL(`original/channels/${id}/${file}.webp`,base).href;
    return `<img src="${url(calm?still:live)}" data-wb-motion data-still="${url(still)}" data-animated="${url(live)}" ${loop?`data-loop="${url(loop)}" data-loop-delay="${bannerIntro[id]/60*1000}"`:''} alt="" draggable="false">`;
  };
  if (large && channel.banner) return `<div class="wb-original-banner">${media('poster','banner','loop')}</div>`;
  if (large && channel.poster) return `<div class="wb-static-banner">${image(base, `channels/${id}/poster.webp`)}</div>`;
  return `<div class="wb-channel-art wb-art-${id}${large?' wb-art-large':''}">${media('thumbnail','icon')}</div>`;
}
function arrow(action, direction, label, extra = {}) {
  return `<button type="button" class="wb-page-arrow ${direction} wb-hot" data-action="${action}"${attrs(extra)} aria-label="${label}"></button>`;
}
function frame(title, body, footer = button('Indietro', 'back')) {
  return `<section class="wb-system"><header class="wb-system-header"><h1>${escapeHTML(title)}</h1><span>Wii</span></header><div class="wb-system-content">${body}</div><footer class="wb-system-footer">${footer}</footer></section>`;
}
const screenButton = (label, target, cls = '') => button(label, 'screen', { target }, cls);
function systemScreen(model, base, calm) {
  const { screen, settingsPage, settingId, storageKind, storageTab, sdPage, boardDate, calendarDate, wipTitle, channelId } = model;
  const selectedChannel = channels.find(c => c.id === channelId) || channels[0];
  const dateLabel = date => new Intl.DateTimeFormat('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
  switch (screen) {
    case 'options': return frame('Opzioni Wii', `<div class="wb-options">${screenButton('Gestione dati','data','wb-option-data')}${screenButton('Impostazioni console Wii','settings','wb-option-settings')}</div>`);
    case 'settings': return frame(`Impostazioni console Wii ${settingsPage + 1}`, `<span class="wb-version">4.3E</span><div class="wb-settings-list">${settings.slice(settingsPage * 4, settingsPage * 4 + 4).map(item => button(item.name, 'setting', { id:item.id })).join('')}</div>${settingsPage ? arrow('settings-prev','left','Pagina impostazioni precedente') : ''}${settingsPage < 2 ? arrow('settings-next','right','Pagina impostazioni successiva') : ''}`, `${button('Indietro','back')}<span class="wb-page-number">${[0,1,2].map(i=>`<span class="${i===settingsPage?'active':''}">${i+1}</span>`).join('')}</span>`);
    case 'setting': {
      const item = settings.find(s => s.id === settingId);
      return frame(item.name, `<div class="wb-setting-choices ${item.choices.length > 4 ? 'wb-choices-grid' : ''}">${item.choices.map(choice => button(choice, 'wip', { title: item.name + ' · ' + choice })).join('')}</div>`);
    }
    case 'data': return frame('Gestione dati', `<div class="wb-data-choices">${screenButton('Dati salvati','saves','wb-option-saves')}${button('Canali','storage',{kind:'channels'},'wb-option-channels')}</div>`);
    case 'saves': return frame('Dati salvati', `<div class="wb-data-choices">${button('Wii','storage',{kind:'wii'},'wb-option-wii')}${button('Nintendo GameCube','storage',{kind:'gamecube'},'wb-option-gamecube')}</div>`);
    case 'storage': {
      const tabs = storageKind === 'gamecube' ? [['a','SLOT A'],['b','SLOT B']] : [['wii','Console Wii'],['sd','Scheda SD']];
      const entries = storageKind === 'channels' && storageTab === 'wii' ? channels.slice(6) : [];
      return frame(storageKind === 'channels' ? 'Canali' : 'Dati salvati', `<div class="wb-storage-tabs">${tabs.map(([id,name])=>`<button type="button" class="wb-hot ${storageTab===id?'active':''}" data-action="storage-tab" data-id="${id}" aria-pressed="${storageTab===id}">${name}</button>`).join('')}</div><div class="wb-storage-grid">${Array.from({length:15},(_,i)=>entries[i]?`<button type="button" class="wb-storage-item wb-hot" data-action="data-item" data-id="${entries[i].id}" aria-label="${entries[i].name}">${channelArt(entries[i],base,false,calm)}</button>`:'<div class="wb-storage-item"></div>').join('')}</div><p class="wb-blocks">${entries.length ? 'Canali presenti nella simulazione' : 'Nessun dato salvato'}</p>`);
    }
    case 'data-item': return frame(selectedChannel.name, `<div class="wb-data-preview">${channelArt(selectedChannel,base,false,calm)}</div><div class="wb-data-actions">${['Sposta','Copia','Cancella'].map(name=>button(name,'wip',{title: selectedChannel.name + ' · ' + name})).join('')}</div>`);
    case 'sd': return `<section class="wb-sd-screen"><div class="wb-sd-grid">${Array.from({length:12},()=>'<div class="wb-sd-empty"></div>').join('')}</div>${sdPage ? arrow('sd-prev','left','Pagina SD precedente') : ''}${sdPage < 19 ? arrow('sd-next','right','Pagina SD successiva') : ''}<footer><button type="button" class="wb-circle-btn wb-wii wb-hot" data-action="back" aria-label="Menu Wii">${image(base,'ui/wii-button.png')}</button><div class="wb-sd-footer-label"><p aria-label="Pagina ${sdPage+1} di 20">${sdPage+1} / 20</p><h1>Menu scheda SD</h1></div>${button('?','wip',{title:'Menu scheda SD · Guida'},'wb-sd-help')}</footer></section>`;
    case 'board': return `<section class="wb-board"><header><h1>Bacheca Wii</h1><p>${escapeHTML(dateLabel(boardDate))}</p></header><div class="wb-board-posts">${screenButton('OAKVX\nBenvenuto nel tuo menu Wii','message','wb-letter')}</div>${arrow('day-prev','left','Giorno precedente')}${arrow('day-next','right','Giorno successivo')}<footer>${screenButton('Menu Wii','menu')}${screenButton('Calendario','calendar')}${screenButton('Crea messaggio','create')}</footer></section>`;
    case 'calendar': {
      const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
      const offset = (new Date(year,month,1).getDay()+6)%7, count = new Date(year,month+1,0).getDate();
      return frame('Calendario', `<div class="wb-calendar-heading">${button('‹','month-prev')}<h2>${new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(calendarDate)}</h2>${button('›','month-next')}</div><div class="wb-calendar"><div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>${'<span></span>'.repeat(offset)}${Array.from({length:count},(_,i)=>`<button type="button" class="wb-hot ${i+1===boardDate.getDate()&&month===boardDate.getMonth()&&year===boardDate.getFullYear()?'active':''}" data-action="calendar-day" data-id="${i+1}">${i+1}</button>`).join('')}</div>`);
    }
    case 'message': return frame('Bacheca Wii', `<article class="wb-message"><h2>OAKVX</h2><p>Benvenuto nel tuo menu Wii.</p><p>Seleziona il Canale Disco e premi Avvia per entrare nel portfolio di Gabriele Lucia.</p>${button('Rispondi','wip',{title:'Bacheca Wii · Rispondi'})}${button('Cancella','wip',{title:'Bacheca Wii · Cancella messaggio'})}</article>`);
    case 'create': return frame('Crea messaggio', `<div class="wb-create">${screenButton('Promemoria','memo')}${screenButton('Messaggio','address')}${screenButton('Rubrica','address')}</div>`);
    case 'memo': return frame('Promemoria', `<div class="wb-memo"><p>Scrivi un promemoria</p>${button('Inserisci testo','wip',{title:'Promemoria · Tastiera Wii'})}</div>`, `${button('Indietro','back')}${button('Pubblica','wip',{title:'Bacheca Wii · Pubblica promemoria'})}`);
    case 'address': return frame('Rubrica', `<p class="wb-empty-message">Non è registrato nessun amico Wii.</p>${button('Registra','wip',{title:'Rubrica · Registra amico Wii'},'wb-register')}`);
    case 'home': return `<section class="wb-home"><header><h1>Menu HOME</h1>${button('Ⓐ Chiudi','resume',{},'wb-home-close')}</header><div class="wb-home-actions">${button('Menu Wii','wii-menu')}${model.restartAvailable?button('Riavvia','restart'):button('Riavvia','restart').replace('type="button"','type="button" disabled')}</div>${button('Manuale di istruzioni elettronico','wip',{title:selectedChannel.name+' · Manuale di istruzioni'},'wb-home-guide')}<div class="wb-remotes">${[1,2,3,4].map(i=>`<div class="${i===1?'connected':''}"><span>G${i}</span><span class="wb-battery">${image(base,i===1?'ui/power-full.png':'ui/power-empty.png')}</span></div>`).join('')}</div><footer>${image(base,'ui/remote.png','wb-home-remote')}${screenButton('Impostazioni telecomando Wii','remote')}</footer></section>`;
    case 'remote': return frame('Impostazioni telecomando Wii', `<div class="wb-remote-options"><h2>Volume</h2><div>${button('−','volume',{delta:-.1})}<meter min="0" max="1" value="${model.volume}" aria-label="Volume audio Wii"></meter>${button('+','volume',{delta:.1})}</div><h2>Rumble</h2>${button('Sì','wip',{title:'Telecomando Wii · Rumble'})}${button('No','wip',{title:'Telecomando Wii · Rumble'})}<h2>Collegamento</h2>${button('Ricollega','wip',{title:'Telecomando Wii · Ricollega'})}</div>`);
    case 'wip': return frame(wipTitle, `<div class="wb-wip"><div class="wb-wip-mark">Wii</div><h2>${escapeHTML(wipTitle)}</h2><p lang="en">Work in progress</p><p>Questa funzione è in preparazione.</p></div>`,button('Indietro','back'));
    default: return '';
  }
}
window.OAKVX_WII_CONTENT=Object.freeze({channels,channelAudio,settings,screens,escapeHTML,button,image,channelArt,arrow,frame,systemScreen});
})();
