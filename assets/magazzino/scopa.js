/* Scopa del Magazzino, carte siciliane, uno contro uno. Tre carte a testa, quattro in tavola.
   Se c'è una carta di pari valore la presa singola è obbligatoria; l'ultimo che prende si porta il resto (non è scopa).
   Punti: carte (più di 20), denari (più di 5), settebello, primiera, una per scopa. Si gioca a 11.
   Regole e avversario sono funzioni pure (test in test/sito/magazzino-scopa.test.mjs); in fondo c'è la pagina. */
(() => {
    'use strict';

    const PRIMIERA = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };
    const SEMI = ['denari', 'coppe', 'spade', 'bastoni'];
    const copia = s => JSON.parse(JSON.stringify(s));

    function prese(tavolo, carta) {
        const pari = tavolo.filter(c => c.valore === carta.valore);
        if (pari.length) return pari.map(c => [c]);
        const out = [], n = tavolo.length;
        for (let m = 1; m < (1 << n); m++) {
            if ((m & (m - 1)) === 0) continue;                    // le prese di una carta sole sono già escluse sopra
            let somma = 0; const g = [];
            for (let i = 0; i < n; i++) if (m & (1 << i)) { somma += tavolo[i].valore; g.push(tavolo[i]); }
            if (somma === carta.valore) out.push(g);
        }
        return out;
    }

    function primiera(carte) {
        let tot = 0;
        for (const seme of SEMI) {
            const migliore = Math.max(0, ...carte.filter(c => c.seme === seme).map(c => PRIMIERA[c.valore]));
            if (!migliore) return 0;                              // senza un seme la primiera non si fa
            tot += migliore;
        }
        return tot;
    }

    function conteggio(s) {
        const [a, b] = s.prese;
        const pa = primiera(a), pb = primiera(b);
        const den = carte => carte.filter(c => c.seme === 'denari').length;
        return [0, 1].map(i => {
            const mie = s.prese[i], sue = s.prese[1 - i];
            const r = {
                carte: mie.length > sue.length ? 1 : 0,
                denari: den(mie) > den(sue) ? 1 : 0,
                settebello: mie.some(c => c.seme === 'denari' && c.valore === 7) ? 1 : 0,
                primiera: (i === 0 ? pa > pb : pb > pa) ? 1 : 0,
                scope: s.scope[i]
            };
            r.totale = r.carte + r.denari + r.settebello + r.primiera + r.scope;
            return r;
        });
    }

    function distribuisci(s) { for (let i = 0; i < 3; i++) { s.mani[0].push(s.mazzo.shift()); s.mani[1].push(s.mazzo.shift()); } }

    function nuova(seme, punteggi = [0, 0], chiInizia = 0) {
        const C = window.OAKVX.carte, rnd = C.generatore(seme);
        let mazzo;
        do { mazzo = C.mischia(C.mazzoSiciliano(), rnd); } while (mazzo.slice(0, 4).filter(c => c.valore === 10).length >= 3);   // tre re in tavola: si rimescola
        const s = { mazzo, tavolo: mazzo.splice(0, 4), mani: [[], []], prese: [[], []], scope: [0, 0], turno: chiInizia, chiInizia, ultimoAPrendere: null, fase: 'gioco', punteggi: punteggi.slice(), ultimaMossa: null };
        distribuisci(s);
        return s;
    }

    function gioca(stato, indice, presaScelta) {
        if (stato.fase !== 'gioco') return stato;
        const carta = stato.mani[stato.turno][indice];
        if (!carta) return stato;
        const opzioni = prese(stato.tavolo, carta);
        let presa = null;
        if (opzioni.length === 1 && !presaScelta) presa = opzioni[0];
        else if (opzioni.length) {
            if (!presaScelta) return stato;
            const voluta = [...presaScelta].sort().join('|');
            presa = opzioni.find(o => o.map(c => c.id).sort().join('|') === voluta);
            if (!presa) return stato;
        }
        const s = copia(stato), chi = s.turno;
        s.mani[chi].splice(indice, 1);
        const ultimaGiocata = !s.mazzo.length && !s.mani[0].length && !s.mani[1].length;
        if (presa) {
            const via = new Set(presa.map(c => c.id));
            s.tavolo = s.tavolo.filter(c => !via.has(c.id));
            s.prese[chi].push(carta, ...presa);
            s.ultimoAPrendere = chi;
            const scopa = !s.tavolo.length && !ultimaGiocata;
            if (scopa) s.scope[chi]++;
            s.ultimaMossa = { chi, carta, presa, scopa };
        } else {
            s.tavolo.push(carta);
            s.ultimaMossa = { chi, carta, presa: null, scopa: false };
        }
        s.turno = 1 - chi;
        if (!s.mani[0].length && !s.mani[1].length) {
            if (s.mazzo.length) distribuisci(s);
            else {
                if (s.ultimoAPrendere != null) s.prese[s.ultimoAPrendere].push(...s.tavolo);
                s.tavolo = [];
                const c = conteggio(s);
                s.punteggi = [s.punteggi[0] + c[0].totale, s.punteggi[1] + c[1].totale];
                s.fase = Math.max(...s.punteggi) >= 11 && s.punteggi[0] !== s.punteggi[1] ? 'finita' : 'contata';
            }
        }
        return s;
    }

    /** { indice, presa } per chi è di turno: punta a scope, settebello, sette e denari; scartando evita di lasciare una scopa. */
    function mossaComputer(stato, livello = 'normale', rnd = Math.random) {
        const mano = stato.mani[stato.turno], tavolo = stato.tavolo;
        const ultima = !stato.mazzo.length && mano.length === 1 && !stato.mani[1 - stato.turno].length;
        const scelte = [];
        mano.forEach((c, indice) => {
            const op = prese(tavolo, c);
            if (op.length) for (const p of op) {
                const tutte = [c, ...p];
                let v = 10 + tutte.length;
                v += tutte.filter(x => x.seme === 'denari').length * 2;
                v += tutte.filter(x => x.valore === 7).length * 3;
                if (tutte.some(x => x.seme === 'denari' && x.valore === 7)) v += 20;
                if (p.length === tavolo.length && !ultima) v += 30;
                scelte.push({ indice, presa: p.map(x => x.id), v });
            } else {
                const somma = tavolo.reduce((a, x) => a + x.valore, 0) + c.valore;
                let v = -c.valore / 10;
                if (c.valore === 7) v -= 8;
                if (c.seme === 'denari') v -= 3;
                if (somma <= 10) v -= 15;                           // l'altro potrebbe fare scopa
                scelte.push({ indice, presa: null, v });
            }
        });
        if (livello !== 'difficile' && rnd() < .3) { const x = scelte[Math.floor(rnd() * scelte.length)]; return { indice: x.indice, presa: x.presa }; }
        const m = scelte.reduce((a, x) => (x.v > a.v ? x : a));
        return { indice: m.indice, presa: m.presa };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.scopa = { prese, primiera, conteggio, nuova, gioca, mossaComputer };

    /* ---------------------------------------------------------------- pagina */
    const doc = window.document;
    const radice = doc && doc.querySelector && doc.querySelector('[data-gioco="scopa"]');
    if (!radice) return;

    const en = doc.documentElement.lang === 'en';
    const D = window.OAKVX.disegno, lingua = en ? 'en' : 'it';
    const T = en ? {
        tu: 'You', pc: 'Computer', nuova: 'New game', prossima: 'Next hand', facile: 'Normal', difficile: 'Hard',
        tocca: 'Your turn: tap a card.', scegli: 'More than one take: tap the cards on the table, then the card again.', aspetta: 'The computer is thinking.',
        gioca: c => `The computer plays the ${c}`, prende: ' and takes', scopa: ' Scopa!', posa: '.',
        smazzata: (a, b) => `Hand over: you ${a}, computer ${b}.`, fine: (a, b) => a > b ? `You win, ${a} to ${b}.` : `The computer wins, ${b} to ${a}.`
    } : {
        tu: 'Tu', pc: 'Computer', nuova: 'Nuova partita', prossima: 'Prossima smazzata', facile: 'Normale', difficile: 'Difficile',
        tocca: 'Tocca a te: tocca una carta.', scegli: 'Più prese possibili: tocca le carte in tavola, poi di nuovo la tua carta.', aspetta: 'Il computer ci pensa.',
        gioca: c => `Il computer gioca il ${c.toLowerCase()}`, prende: ' e prende', scopa: ' Scopa!', posa: '.',
        smazzata: (a, b) => `Smazzata finita: tu ${a}, computer ${b}.`, fine: (a, b) => a > b ? `Hai vinto, ${a} a ${b}.` : `Vince il computer, ${b} a ${a}.`
    };
    const dep = window.OAKVX.deposito.crea();
    const calmo = () => doc.documentElement.classList.contains('calm');
    let livello = 'difficile', s = dep.riprendi('scopa') || nuova(Date.now() >>> 0), nota = '', scelta = null, segnate = [], attesa = 0;
    const tavolo = window.OAKVX.tavolo.monta(radice, { onGioca, onAzione, onTavolo });

    function salva() { dep.salva('scopa', s); }
    function turnoComputer() {
        if (s.fase !== 'gioco' || s.turno !== 1) return;
        clearTimeout(attesa);
        attesa = setTimeout(() => {
            const m = mossaComputer(s, livello), c = s.mani[1][m.indice];
            s = gioca(s, m.indice, m.presa);
            const u = s.ultimaMossa;
            nota = T.gioca(D.nome(c, lingua)) + (u && u.presa ? T.prende + ' ' + u.presa.map(x => D.nome(x, lingua).toLowerCase()).join(', ') + '.' + (u.scopa ? T.scopa : '') : T.posa);
            tavolo.annuncia(nota);
            salva(); disegna(); turnoComputer();
        }, calmo() ? 150 : 1000);
    }
    function onGioca(i) {
        if (s.fase !== 'gioco' || s.turno !== 0) return;
        const carta = s.mani[0][i], op = prese(s.tavolo, carta);
        if (op.length > 1 && !(scelta === i && segnate.length)) { scelta = i; segnate = []; nota = T.scegli; disegna(); return; }
        const nuovo = gioca(s, i, op.length > 1 ? segnate : undefined);
        if (nuovo === s) { nota = T.scegli; disegna(); return; }
        s = nuovo; scelta = null; segnate = []; nota = s.ultimaMossa && s.ultimaMossa.scopa ? T.scopa.trim() : '';
        salva(); disegna(); turnoComputer();
    }
    function onTavolo(j) {
        if (scelta == null) return;
        const id = s.tavolo[j].id;
        segnate = segnate.includes(id) ? segnate.filter(x => x !== id) : [...segnate, id];
        disegna();
    }
    function onAzione(nome) {
        if (nome === 'nuova') s = nuova(Date.now() >>> 0);
        if (nome === 'prossima') s = nuova(Date.now() >>> 0, s.punteggi, 1 - s.chiInizia);
        if (nome === 'livello') livello = livello === 'difficile' ? 'normale' : 'difficile';
        nota = ''; scelta = null; segnate = [];
        salva(); disegna(); turnoComputer();
    }
    function disegna() {
        const [a, b] = s.punteggi;
        let messaggio;
        if (s.fase === 'finita') messaggio = T.fine(a, b);
        else if (s.fase === 'contata') messaggio = T.smazzata(a, b);
        else messaggio = (nota ? nota + ' ' : '') + (s.turno === 0 ? (scelta == null ? T.tocca : '') : T.aspetta);
        const azioni = [{ nome: 'nuova', etichetta: T.nuova, attiva: true }, { nome: 'livello', etichetta: livello === 'difficile' ? T.difficile : T.facile, attiva: true }];
        if (s.fase === 'contata') azioni.unshift({ nome: 'prossima', etichetta: T.prossima, attiva: true });
        tavolo.mostra({
            dorso: 'siciliane',
            avversari: [{ nome: `${T.pc} · ${b}`, carte: s.mani[1].length }],
            tavolo: s.tavolo,
            tavoloSelezionate: s.tavolo.map((c, j) => (segnate.includes(c.id) ? j : -1)).filter(j => j >= 0),
            mazzo: s.mazzo.length || null,
            mano: s.mani[0],
            selezionate: scelta == null ? [] : [scelta],
            manoAttiva: s.fase === 'gioco' && s.turno === 0,
            messaggio: s.fase === 'gioco' ? `${T.tu} ${a} · ${messaggio}` : messaggio,
            azioni
        });
    }
    disegna();
    turnoComputer();
})();
