// Menu iniziale: lingua, scelta Sito/Gioco. Il motore 3D si scarica solo dopo "Gioco".
const $ = (id) => document.getElementById(id);

const stato = {
  dati: null,
  T: null,
  lingua: 'it',
  ascoltatori: new Set(),
  audio: localStorage.getItem('gioco-audio') !== 'off',
  audioAscoltatori: new Set(),
};

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches;

function linguaIniziale() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'it' || q === 'en') return q;
  const salvata = localStorage.getItem('gioco-lingua');
  if (salvata === 'it' || salvata === 'en') return salvata;
  return document.referrer.includes('/en/') || (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'it';
}

function applicaLingua(l) {
  stato.lingua = l;
  stato.T = stato.dati[l];
  const T = stato.T;
  document.documentElement.lang = l;
  document.title = T.titolo;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const v = T[el.dataset.t];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('#classica, [data-classica]').forEach((a) => { a.href = T.classicaUrl; });
  const btn = $('lingua');
  btn.textContent = l === 'it' ? 'EN' : 'IT';
  btn.setAttribute('aria-label', l === 'it' ? 'Switch to English' : 'Passa all\'italiano');
  aggiornaAudioLabel();
  aggiornaAvviso();
  stato.ascoltatori.forEach((fn) => fn(l));
}

let erroreWebgl = false;
function aggiornaAvviso() {
  const T = stato.T;
  const box = $('avviso');
  let msg = '';
  if (erroreWebgl) msg = T.erroreWebgl;
  else if (touchOnly) msg = T.avvisoTouch;
  else if (reduceMotion) msg = T.avvisoMotion;
  box.textContent = msg;
  box.hidden = !msg;
}

function aggiornaAudioLabel() {
  const b = $('audio');
  b.textContent = stato.audio ? stato.T.audioOn : stato.T.audioOff;
  b.setAttribute('aria-pressed', String(stato.audio));
}

$('audio').addEventListener('click', () => {
  stato.audio = !stato.audio;
  localStorage.setItem('gioco-audio', stato.audio ? 'on' : 'off');
  aggiornaAudioLabel();
  stato.audioAscoltatori.forEach((fn) => fn(stato.audio));
});

$('lingua').addEventListener('click', () => {
  const nuova = stato.lingua === 'it' ? 'en' : 'it';
  localStorage.setItem('gioco-lingua', nuova);
  const url = new URL(location.href);
  url.searchParams.set('lang', nuova);
  history.replaceState(null, '', url);
  applicaLingua(nuova);
});

// contesto condiviso con il gioco
export const ctx = {
  get T() { return stato.T; },
  get lingua() { return stato.lingua; },
  get audio() { return stato.audio; },
  suLingua(fn) { stato.ascoltatori.add(fn); },
  suAudio(fn) { stato.audioAscoltatori.add(fn); },
  segnalaErrore() { erroreWebgl = true; aggiornaAvviso(); },
  debug: new URLSearchParams(location.search).has('debug'),
};

let caricando = false;
async function avviaGioco() {
  if (caricando) return;
  caricando = true;
  document.body.classList.remove('in-menu');
  $('menu').hidden = true;
  $('avvio').hidden = false;
  try {
    const modulo = await import('./gioco.js');
    await modulo.avvia(ctx);
  } catch (e) {
    console.error(e);
    erroreWebgl = true;
    document.body.classList.add('in-menu');
    $('avvio').hidden = true;
    $('menu').hidden = false;
    aggiornaAvviso();
    caricando = false;
  }
}

$('scelta-gioco').addEventListener('click', avviaGioco);

(async () => {
  const r = await fetch('contenuti.json');
  stato.dati = await r.json();
  applicaLingua(linguaIniziale());
  if (new URLSearchParams(location.search).get('avvia') === 'gioco') avviaGioco();
})();
