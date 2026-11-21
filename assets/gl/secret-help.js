import { config } from './config.js';
if (config.secretHelp) {
  const en = document.documentElement.lang === 'en';
  let typed='', timeout=0;
  const popup=document.createElement('dialog');
  popup.setAttribute('aria-labelledby','help-title');
  popup.innerHTML=`<form method="dialog"><button>${en?'Close':'Chiudi'} ×</button></form><h2 id="help-title">${en?'Secret commands':'Comandi segreti'}</h2><ul class="secret-keys"><li><kbd>H</kbd> — ${en?'open HOME':'apri HOME'}</li><li><kbd>help</kbd> — ${en?'show this guide':'mostra questa guida'}</li>${config.partyMode?`<li><kbd>↑ ↑ ↓ ↓ ← → ← → B A</kbd> — ${en?'party mode on the home page':'modalità party nella home'}</li>`:''}<li><kbd>Esc</kbd> — ${en?'close a panel or stop the party':'chiudi un pannello o ferma la festa'}</li></ul>`;
  document.body.append(popup);
  let previousFocus;
  popup.addEventListener('close',()=>previousFocus?.focus());
  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.key.length!==1 || event.target.closest?.('input,textarea,select,[contenteditable]')) return;
    if (!typed) previousFocus=document.activeElement;
    typed=(typed+event.key.toLowerCase()).slice(-4);
    clearTimeout(timeout); timeout=setTimeout(()=>{typed='';},1500);
    if (typed!=='help') return;
    typed='';
    const current=document.querySelector('dialog[open]');
    if (current===popup) return;
    current?.close(); popup.showModal();
  },true);
}
