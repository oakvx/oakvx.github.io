/* Briscola del Magazzino, carte siciliane, uno contro uno. Tre carte in mano, briscola scoperta in fondo al mazzo.
   Ordine di presa: A, 3, re, cavallo, fante, 7, 6, 5, 4, 2. Punti: A 11, 3 10, re 4, cavallo 3, fante 2. Vince chi supera 60.
   Regole e avversario sono funzioni pure (test in test/sito/magazzino-briscola.test.mjs); in fondo c'è la pagina. */
(() => {
    'use strict';

    const FORZA = [2, 4, 5, 6, 7, 8, 9, 10, 3, 1];          // dalla più debole alla più forte
    const forza = c => FORZA.indexOf(c.valore);
    const PUNTI = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
    const valore = c => PUNTI[c.valore] || 0;
    const punti = carte => carte.reduce((a, c) => a + valore(c), 0);

    /** 0 se vince la carta giocata per prima (a), 1 se vince b. */
    function presa(a, b, semeBriscola) {
        if (b.seme === a.seme) return forza(b) > forza(a) ? 1 : 0;
        return b.seme === semeBriscola ? 1 : 0;
    }

    const copia = s => JSON.parse(JSON.stringify(s));

    function nuova(seme) {
        const C = window.OAKVX.carte;
        const mazzo = C.mischia(C.mazzoSiciliano(), C.generatore(seme));
        const mani = [[], []];
        for (let i = 0; i < 3; i++) { mani[0].push(mazzo.shift()); mani[1].push(mazzo.shift()); }
        const briscola = mazzo.shift();
        mazzo.push(briscola);                                     // scoperta, sotto il mazzo: è l'ultima a essere pescata
        return { mazzo, briscola, semeBriscola: briscola.seme, mani, prese: [[], []], tavolo: [], turno: 0, fase: 'gioco', ultimaPresa: null };
    }

    function gioca(stato, indice) {
        if (stato.fase !== 'gioco' || !stato.mani[stato.turno][indice]) return stato;
        const s = copia(stato), chi = s.turno;
        const [carta] = s.mani[chi].splice(indice, 1);
        s.tavolo.push({ carta, chi });
        if (s.tavolo.length < 2) { s.turno = 1 - chi; return s; }
        const [a, b] = s.tavolo;
        const vince = presa(a.carta, b.carta, s.semeBriscola) === 0 ? a.chi : b.chi;
        s.prese[vince].push(a.carta, b.carta);
        s.ultimaPresa = { carte: [a.carta, b.carta], chi: vince };
        s.tavolo = [];
        if (s.mazzo.length) { s.mani[vince].push(s.mazzo.shift()); s.mani[1 - vince].push(s.mazzo.shift()); }
        s.turno = vince;
        if (!s.mani[0].length && !s.mani[1].length) s.fase = 'finita';
        return s;
    }

    /** Indice della carta da giocare per chi è di turno. 'difficile' segue sempre le regole qui sotto;
        'normale' ogni tanto sbaglia apposta. */
    function mossaComputer(stato, livello = 'normale', rnd = Math.random) {
        const mano = stato.mani[stato.turno], B = stato.semeBriscola;
        if (livello !== 'difficile' && rnd() < .3) return Math.floor(rnd() * mano.length);
        const liscio = c => valore(c) * 3 + (c.seme === B ? 10 + forza(c) : 0) + forza(c) / 100;
        const migliore = (carte, costo) => carte.reduce((m, c) => (costo(c) < costo(m) ? c : m));
        let scelta;
        if (!stato.tavolo.length) {
            scelta = migliore(mano, liscio);
        } else {
            const x = stato.tavolo[0].carta;
            const vincenti = mano.filter(c => presa(x, c, B) === 1);
            const stessoSeme = vincenti.filter(c => c.seme === x.seme);
            const briscole = vincenti.filter(c => c.seme === B && x.seme !== B);
            if (stessoSeme.length) scelta = migliore(stessoSeme, c => -valore(c) + forza(c) / 100);   // prende e incassa
            else if (briscole.length && valore(x) >= 10) scelta = migliore(briscole, c => valore(c) * 2 + forza(c) / 100);
            else if (briscole.length && valore(x) >= 2) {
                const basse = briscole.filter(c => !valore(c));
                scelta = basse.length ? migliore(basse, forza) : migliore(mano, liscio);
            } else scelta = migliore(mano, c => valore(c) * 3 + (c.seme === B ? 10 : 0) + forza(c) / 100);
        }
        return mano.indexOf(scelta);
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.briscola = { presa, punti, nuova, gioca, mossaComputer };

    /* ---------------------------------------------------------------- pagina */
    const doc = window.document;
    const radice = doc && doc.querySelector && doc.querySelector('[data-gioco="briscola"]');
    if (!radice) return;

    const en = doc.documentElement.lang === 'en';
    const D = window.OAKVX.disegno, lingua = en ? 'en' : 'it';
    const T = en ? {
        tu: 'You', pc: 'Computer', nuova: 'New game', facile: 'Normal', difficile: 'Hard', tocca: 'Your turn: tap a card.',
        aspetta: 'The computer is thinking.', gioca: c => `The computer plays the ${c}.`, prendi: n => `You take it (${n} points).`, prende: n => `The computer takes it (${n} points).`,
        briscola: c => `Trump: ${c}. Cards left: `, fine: (a, b) => a > 60 ? `You win, ${a} to ${b}.` : a === 60 ? 'Sixty each: a draw.' : `The computer wins, ${b} to ${a}.`
    } : {
        tu: 'Tu', pc: 'Computer', nuova: 'Nuova partita', facile: 'Normale', difficile: 'Difficile', tocca: 'Tocca a te: tocca una carta.',
        aspetta: 'Il computer ci pensa.', gioca: c => `Il computer gioca il ${c.toLowerCase()}.`, prendi: n => `Prendi tu (${n} punti).`, prende: n => `Prende il computer (${n} punti).`,
        briscola: c => `Briscola: ${c.toLowerCase()}. Nel mazzo: `, fine: (a, b) => a > 60 ? `Hai vinto, ${a} a ${b}.` : a === 60 ? 'Sessanta a testa: pari.' : `Vince il computer, ${b} a ${a}.`
    };
    const dep = window.OAKVX.deposito.crea();
    const calmo = () => doc.documentElement.classList.contains('calm');
    let livello = 'difficile', s = dep.riprendi('briscola') || nuova(Date.now() >>> 0), nota = '', attesa = 0;
    const tavolo = window.OAKVX.tavolo.monta(radice, { onGioca, onAzione });

    function salva() { dep.salva('briscola', s); }
    function dopoPresa(prima) {
        if (s.ultimaPresa && s.ultimaPresa !== prima && !s.tavolo.length) {
            const n = punti(s.ultimaPresa.carte);
            nota = s.ultimaPresa.chi === 0 ? T.prendi(n) : T.prende(n);
            tavolo.annuncia(nota);
        }
    }
    function turnoComputer() {
        if (s.fase !== 'gioco' || s.turno !== 1) return;
        clearTimeout(attesa);
        attesa = setTimeout(() => {
            if (s.fase !== 'gioco' || s.turno !== 1) return;
            const i = mossaComputer(s, livello), c = s.mani[1][i], prima = s.ultimaPresa;
            s = gioca(s, i);
            nota = T.gioca(D.nome(c, lingua));
            const giocata = nota;
            dopoPresa(prima);
            if (nota !== giocata) { nota = giocata + ' ' + nota; tavolo.annuncia(nota); } else tavolo.annuncia(nota);
            salva(); disegna(); turnoComputer();
        }, calmo() ? 150 : 900);
    }
    function onGioca(i) {
        if (s.fase !== 'gioco' || s.turno !== 0) return;
        const prima = s.ultimaPresa;
        s = gioca(s, i); nota = '';
        dopoPresa(prima);
        salva(); disegna(); turnoComputer();
    }
    function onAzione(nome) {
        clearTimeout(attesa);
        if (nome === 'nuova') { s = nuova(Date.now() >>> 0); nota = ''; }
        if (nome === 'livello') livello = livello === 'difficile' ? 'normale' : 'difficile';
        salva(); disegna(); turnoComputer();
    }
    function disegna() {
        const fine = s.fase === 'finita';
        const a = punti(s.prese[0]), b = punti(s.prese[1]);
        const messaggio = fine ? T.fine(a, b) : (nota ? nota + ' ' : '') + (s.turno === 0 ? T.tocca : T.aspetta);
        tavolo.mostra({
            dorso: 'siciliane',
            avversari: [{ nome: `${T.pc} · ${b}`, carte: s.mani[1].length }],
            tavolo: [...(s.mazzo.length ? [s.briscola] : []), ...(s.tavolo.length ? s.tavolo.map(t => t.carta) : s.ultimaPresa ? [s.ultimaPresa.carte] : [])],
            mazzo: s.mazzo.length ? T.briscola(D.nome(s.briscola, lingua)) + s.mazzo.length : null,
            mano: s.mani[0],
            manoAttiva: !fine && s.turno === 0,
            messaggio: fine ? messaggio : `${T.tu} ${a} · ` + messaggio,
            azioni: [{ nome: 'nuova', etichetta: T.nuova, attiva: true }, { nome: 'livello', etichetta: livello === 'difficile' ? T.difficile : T.facile, attiva: true }]
        });
    }
    disegna();
    turnoComputer();
})();
