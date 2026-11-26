/* Menu d'ingresso: "Sito" chiude il menu e lascia la pagina richiesta, "Gioco" apre /gioco/.
   Il bootstrap in <head> decide se mostrarlo (una volta per sessione, mai ai crawler). */
(() => {
    'use strict';
    const root = document.documentElement;
    const KEY = 'oakvx-ingresso';
    if (!root.classList.contains('ingresso-attivo')) return;
    window.__oakvxIngresso = true;

    const lang = (root.dataset.lang || root.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
    const T = {
        it: {
            label: 'Scegli come visitare il portfolio',
            firma: 'junior web developer · Sassuolo',
            titolo: 'Ciao, sono oakvx.',
            intro: 'Faccio siti e interfacce, e penso che un\'interfaccia debba raccontare chi la possiede. Qui puoi scegliere: il sito, veloce e chiaro, con progetti, percorso e contatti. Oppure il gioco, dove c\'è un curatore al primo giorno di lavoro e nessuna regola è garantita.',
            sito: 'Sito', sitoNota: 'progetti, percorso, contatti',
            gioco: 'Gioco', giocoNota: '3D, da computer, circa 15 minuti',
            touch: 'Il gioco è pensato per computer con tastiera e mouse: da qui ti conviene il sito.'
        },
        en: {
            label: 'Choose how to visit the portfolio',
            firma: 'junior web developer · Sassuolo, Italy',
            titolo: 'Hi, I\'m oakvx.',
            intro: 'I build websites and interfaces, and I think an interface should tell you who owns it. You can choose: the site, fast and clear, with projects, path and contacts. Or the game, with a curator on their first day at work and no rule guaranteed.',
            sito: 'Site', sitoNota: 'projects, path, contacts',
            gioco: 'Game', giocoNota: '3D, desktop, about 15 minutes',
            touch: 'The game is made for a computer with keyboard and mouse: from here, the site will suit you better.'
        }
    }[lang];

    const ricorda = () => { try { sessionStorage.setItem(KEY, '1'); } catch {} };
    const sblocca = () => root.classList.remove('ingresso-attivo');

    if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') {
        sblocca();
        return;
    }

    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text) node.textContent = text;
        return node;
    };

    const dialog = el('dialog', 'ingresso');
    dialog.setAttribute('aria-labelledby', 'ingresso-titolo');
    dialog.setAttribute('aria-describedby', 'ingresso-intro');
    dialog.dataset.ingresso = '';

    const firma = el('p', 'ingresso__firma');
    firma.append(el('strong', '', 'oakvx'), el('span', '', T.firma));

    const corpo = el('div', 'ingresso__corpo');
    const titolo = el('h1', '', T.titolo);
    titolo.id = 'ingresso-titolo';
    const intro = el('p', 'ingresso__intro', T.intro);
    intro.id = 'ingresso-intro';

    const scelte = el('div', 'ingresso__scelte');
    scelte.setAttribute('role', 'group');
    scelte.setAttribute('aria-label', T.label);

    const sito = el('button', 'ingresso__scelta ingresso__scelta--sito');
    sito.type = 'button';
    sito.append(el('span', 'ingresso__nome', T.sito), el('span', 'ingresso__nota', T.sitoNota));

    const gioco = el('a', 'ingresso__scelta ingresso__scelta--gioco');
    gioco.href = `/gioco/?avvia=gioco&lang=${lang}`;
    gioco.append(el('span', 'ingresso__nome', T.gioco), el('span', 'ingresso__nota', T.giocoNota));

    scelte.append(sito, gioco);

    const avviso = el('p', 'ingresso__avviso', T.touch);
    avviso.hidden = !(matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches);

    corpo.append(titolo, intro, scelte, avviso);
    dialog.append(firma, corpo);

    const calmo = () => matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('paused') || root.classList.contains('calm');
    let chiuso = false;
    function entraNelSito() {
        if (chiuso) return;
        chiuso = true;
        ricorda();
        const fine = () => {
            dialog.close();
            dialog.remove();
            sblocca();
            dispatchEvent(new CustomEvent('ingresso:chiuso', { detail: { scelta: 'sito' } }));
        };
        if (calmo()) { fine(); return; }
        sblocca();
        dialog.classList.add('esce');
        setTimeout(fine, 420);
    }

    sito.addEventListener('click', entraNelSito);
    gioco.addEventListener('click', ricorda);
    dialog.addEventListener('cancel', event => { event.preventDefault(); entraNelSito(); });

    document.body.append(dialog);
    dialog.showModal();
    sito.focus({ preventScroll: true });
})();
