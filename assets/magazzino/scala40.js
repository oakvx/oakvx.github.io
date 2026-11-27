/* Scala 40 del Magazzino. Due mazzi francesi e quattro jolly (108 carte), 13 carte a testa, da 2 a 4 giocatori.
   Combinazioni: tris o poker (stesso valore, semi diversi) e scale (stesso seme, almeno 3 consecutive,
   asso basso A-2-3 o alto Q-K-A, niente giro). Un jolly al massimo per combinazione.
   Si apre con almeno 40 punti; dallo scarto si pesca solo se si è aperti o se quella carta serve ad aprire subito.
   Si chiude scartando l'ultima carta. Penalità: carte in mano (asso 11, figure 10, jolly 25); fuori a 101.
   Regole e avversario sono funzioni pure (test in test/sito/magazzino-scala40.test.mjs); in fondo c'è la pagina. */
(() => {
    'use strict';

    const ORDINE_SEMI = ['cuori', 'quadri', 'fiori', 'picche', 'jolly'];
    const pv = v => v === 1 ? 11 : Math.min(10, v);
    const eJolly = c => c.seme === 'jolly';
    const copia = s => JSON.parse(JSON.stringify(s));
    const ordina = mano => mano.sort((a, b) => ORDINE_SEMI.indexOf(a.seme) - ORDINE_SEMI.indexOf(b.seme) || a.valore - b.valore);

    function combinazione(carte) {
        if (carte.length < 3) return null;
        const jolly = carte.filter(eJolly), nat = carte.filter(c => !eJolly(c));
        if (jolly.length > 1 || !nat.length) return null;
        if (nat.every(c => c.valore === nat[0].valore)) {
            if (carte.length > 4 || new Set(nat.map(c => c.seme)).size !== nat.length) return null;
            return { tipo: carte.length === 4 ? 'poker' : 'tris', punti: pv(nat[0].valore) * carte.length };
        }
        if (!nat.every(c => c.seme === nat[0].seme)) return null;
        for (const alto of [false, true]) {
            const v = nat.map(c => (c.valore === 1 && alto ? 14 : c.valore)).sort((a, b) => a - b);
            if (new Set(v).size !== v.length) continue;
            let lo = v[0], hi = v[v.length - 1];
            if (hi - lo + 1 - v.length > jolly.length) continue;
            let avanzo = carte.length - (hi - lo + 1);
            if (avanzo < 0) continue;
            while (avanzo > 0 && hi < 14) { hi++; avanzo--; }
            while (avanzo > 0 && lo > 1) { lo--; avanzo--; }
            if (avanzo > 0 || (lo === 1 && hi === 14)) continue;
            let punti = 0;
            for (let x = lo; x <= hi; x++) punti += x === 14 ? 11 : x === 1 ? 1 : Math.min(10, x);
            return { tipo: 'scala', punti };
        }
        return null;
    }

    function apertura(gruppi) {
        let punti = 0;
        for (const g of gruppi) { const c = combinazione(g); if (!c) return { valida: false, punti: 0 }; punti += c.punti; }
        return { valida: punti >= 40, punti };
    }

    const penalita = mano => mano.reduce((a, c) => a + (eJolly(c) ? 25 : pv(c.valore)), 0);

    /* ------------------------------------------------ ricerca delle combinazioni in una mano */
    function candidati(mano) {
        const out = [], jolly = mano.filter(eJolly), nat = mano.filter(c => !eJolly(c));
        const j = jolly[0];
        const perValore = {};
        for (const c of nat) (perValore[c.valore] ||= {})[c.seme] ||= c;
        for (const semi of Object.values(perValore)) {
            const cc = Object.values(semi);
            const sotto = (arr, n, da = 0, acc = []) => { if (acc.length === n) { out.push(acc.slice()); return; } for (let i = da; i < arr.length; i++) { acc.push(arr[i]); sotto(arr, n, i + 1, acc); acc.pop(); } };
            for (const n of [3, 4]) if (cc.length >= n) sotto(cc, n);
            if (j) { for (const n of [2, 3]) if (cc.length >= n) { const prima = out.length; sotto(cc, n); for (let i = prima; i < out.length; i++) out[i] = [...out[i], j]; } }
        }
        for (const seme of ['cuori', 'quadri', 'fiori', 'picche']) {
            const perV = {};
            for (const c of nat) if (c.seme === seme && !perV[c.valore]) perV[c.valore] = c;
            if (perV[1]) perV[14] = perV[1];
            for (let a = 1; a <= 12; a++) {
                let usato = false; const g = [];
                for (let v = a; v <= 14; v++) {
                    if (perV[v]) g.push(perV[v]);
                    else if (j && !usato && g.length) { g.push(j); usato = true; }
                    else break;
                    if (g.length >= 3 && combinazione(g)) out.push(g.slice());
                }
            }
        }
        return out.filter(g => combinazione(g));
    }

    /** I gruppi disgiunti che valgono più punti (con un limite di tempo). */
    function migliori(mano, deveUsare) {
        const cand = candidati(mano).map(g => ({ g, ids: new Set(g.map(c => c.id)), p: combinazione(g).punti })).sort((a, b) => b.p - a.p).slice(0, 120);
        let meglio = { gruppi: [], punti: 0 }, passi = 0;
        const giro = (i, presi, usati, punti) => {
            if (++passi > 20000) return;
            const usaQuella = !deveUsare || usati.has(deveUsare);
            if (usaQuella && (punti > meglio.punti)) meglio = { gruppi: presi.map(x => x.g), punti };
            for (let k = i; k < cand.length; k++) {
                const c = cand[k];
                if ([...c.ids].some(id => usati.has(id))) continue;
                if (usati.size + c.ids.size >= mano.length) continue;          // resta sempre una carta da scartare
                presi.push(c); c.ids.forEach(id => usati.add(id));
                giro(k + 1, presi, usati, punti + c.p);
                presi.pop(); c.ids.forEach(id => usati['delete'](id));
            }
        };
        giro(0, [], new Set(), 0);
        return meglio;
    }

    /* ------------------------------------------------ partita */
    function prossimoVivo(s, da) {
        for (let k = 1; k <= s.mani.length; k++) { const i = (da + k) % s.mani.length; if (!s.eliminati[i]) return i; }
        return da;
    }

    function nuova(seme, giocatori = 2, punteggi, eliminati, chiInizia = 0) {
        const C = window.OAKVX.carte;
        const mazzo = C.mischia(C.mazzoFrancese({ mazzi: 2, jolly: 4 }), C.generatore(seme));
        const elim = eliminati ? eliminati.slice() : Array(giocatori).fill(false);
        const mani = Array.from({ length: giocatori }, () => []);
        for (let r = 0; r < 13; r++) for (let i = 0; i < giocatori; i++) if (!elim[i]) mani[i].push(mazzo.shift());
        mani.forEach(ordina);
        return { seme, mazzo, scarti: [mazzo.shift()], mani, aperto: Array(giocatori).fill(false), tavolo: [], turno: elim[chiInizia] ? 0 : chiInizia, chiInizia,
                 fase: 'pesca', presoDaScarto: null, punteggi: punteggi ? punteggi.slice() : Array(giocatori).fill(0), eliminati: elim, rimescoli: 0, ultima: null };
    }

    function pesca(stato, da) {
        if (stato.fase !== 'pesca') return stato;
        const chi = stato.turno;
        if (da === 'scarto') {
            const cima = stato.scarti[stato.scarti.length - 1];
            if (!cima) return stato;
            if (!stato.aperto[chi]) {
                const m = migliori([...stato.mani[chi], cima], cima.id);
                if (m.punti < 40) return stato;
            }
            const s = copia(stato);
            s.mani[chi].push(s.scarti.pop()); ordina(s.mani[chi]);
            s.presoDaScarto = cima.id; s.fase = 'gioca'; s.ultima = { chi, tipo: 'pesca', da };
            return s;
        }
        const s = copia(stato);
        if (!s.mazzo.length) {
            const cima = s.scarti.pop();
            s.mazzo = window.OAKVX.carte.mischia(s.scarti, window.OAKVX.carte.generatore((s.seme >>> 0) + ++s.rimescoli));
            s.scarti = cima ? [cima] : [];
            if (!s.mazzo.length) { s.fase = 'chiusa'; return s; }
        }
        s.mani[chi].push(s.mazzo.shift()); ordina(s.mani[chi]);
        s.presoDaScarto = null; s.fase = 'gioca'; s.ultima = { chi, tipo: 'pesca', da };
        return s;
    }

    function prendiDallaMano(s, chi, ids) {
        const out = [];
        for (const id of ids) { const i = s.mani[chi].findIndex(c => c.id === id); if (i < 0) return null; out.push(s.mani[chi].splice(i, 1)[0]); }
        return out;
    }

    function cala(stato, gruppi) {
        if (stato.fase !== 'gioca' || !gruppi.length) return stato;
        const chi = stato.turno, s = copia(stato);
        const carte = [];
        for (const g of gruppi) { const c = prendiDallaMano(s, chi, g); if (!c) return stato; carte.push(c); }
        if (!s.mani[chi].length) return stato;                                  // una carta deve restare per chiudere
        if (!s.aperto[chi] ? !apertura(carte).valida : !carte.every(g => combinazione(g))) return stato;
        for (const g of carte) s.tavolo.push({ carte: g, di: chi });
        s.aperto[chi] = true; s.ultima = { chi, tipo: 'cala', gruppi: carte.length };
        return s;
    }

    function attacca(stato, cartaId, gruppo) {
        if (stato.fase !== 'gioca' || !stato.aperto[stato.turno] || !stato.tavolo[gruppo]) return stato;
        const chi = stato.turno, s = copia(stato);
        const [c] = prendiDallaMano(s, chi, [cartaId]) || [];
        if (!c || !s.mani[chi].length) return stato;
        const nuovo = [...s.tavolo[gruppo].carte, c];
        if (!combinazione(nuovo)) return stato;
        s.tavolo[gruppo].carte = nuovo; s.ultima = { chi, tipo: 'attacca' };
        return s;
    }

    function scarta(stato, indice) {
        if (stato.fase !== 'gioca') return stato;
        const chi = stato.turno, carta = stato.mani[chi][indice];
        if (!carta) return stato;
        if (stato.presoDaScarto && (!stato.aperto[chi] || stato.mani[chi].some(c => c.id === stato.presoDaScarto))) return stato;
        const s = copia(stato);
        s.scarti.push(s.mani[chi].splice(indice, 1)[0]);
        s.presoDaScarto = null; s.ultima = { chi, tipo: 'scarta', carta };
        if (!s.mani[chi].length) {
            s.mani.forEach((m, i) => { if (i !== chi && !s.eliminati[i]) s.punteggi[i] += penalita(m); });
            s.punteggi.forEach((p, i) => { if (p >= 101) s.eliminati[i] = true; });
            s.vincitoreSmazzata = chi;
            s.fase = s.eliminati.filter(x => !x).length <= 1 ? 'finita' : 'chiusa';
            return s;
        }
        s.turno = prossimoVivo(s, chi); s.fase = 'pesca';
        return s;
    }

    function prossima(stato, seme) {
        return nuova(seme, stato.mani.length, stato.punteggi, stato.eliminati, prossimoVivo(stato, stato.chiInizia));
    }

    /** Le mosse di chi è di turno: prima la pesca, poi calate, attacchi e scarto. */
    function mossaComputer(s) {
        const chi = s.turno, mano = s.mani[chi];
        if (s.fase === 'pesca') {
            const cima = s.scarti[s.scarti.length - 1];
            let da = 'mazzo';
            if (cima && !eJolly(cima)) {
                if (!s.aperto[chi]) { if (migliori([...mano, cima], cima.id).punti >= 40) da = 'scarto'; }
                else if (s.tavolo.some(g => combinazione([...g.carte, cima])) || candidati([...mano, cima]).some(g => g.some(c => c.id === cima.id))) da = 'scarto';
            }
            return [{ tipo: 'pesca', da }];
        }
        if (s.fase !== 'gioca') return [];
        const mosse = [];
        let t = s;
        const m = migliori(t.mani[chi], t.presoDaScarto);
        if (m.gruppi.length && (t.aperto[chi] || m.punti >= 40)) {
            const dopo = cala(t, m.gruppi.map(g => g.map(c => c.id)));
            if (dopo !== t) { mosse.push({ tipo: 'cala', gruppi: m.gruppi.map(g => g.map(c => c.id)) }); t = dopo; }
        }
        if (t.aperto[chi]) {
            let trovato = true;
            while (trovato && t.mani[chi].length > 1) {
                trovato = false;
                for (const c of t.mani[chi]) {
                    const g = t.tavolo.findIndex(x => combinazione([...x.carte, c]));
                    if (g >= 0) { mosse.push({ tipo: 'attacca', carta: c.id, gruppo: g }); t = attacca(t, c.id, g); trovato = true; break; }
                }
            }
        }
        const resto = t.mani[chi];
        const utili = new Set(candidati(resto).flat().map(c => c.id));
        let idx = 0, peggio = -Infinity;
        resto.forEach((c, i) => {
            if (c.id === t.presoDaScarto) return;
            const v = (eJolly(c) ? -100 : pv(c.valore)) - (utili.has(c.id) ? 30 : 0);
            if (v > peggio) { peggio = v; idx = i; }
        });
        mosse.push({ tipo: 'scarta', indice: idx });
        return mosse;
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.scala40 = { combinazione, apertura, penalita, candidati, migliori, nuova, pesca, cala, attacca, scarta, prossima, mossaComputer };

    /* ---------------------------------------------------------------- pagina */
    const doc = window.document;
    const radice = doc && doc.querySelector && doc.querySelector('[data-gioco="scala-40"]');
    if (!radice) return;

    const en = doc.documentElement.lang === 'en';
    const D = window.OAKVX.disegno, lingua = en ? 'en' : 'it';
    const T = en ? {
        tu: 'You', pc: i => `Computer ${i}`, mazzo: 'Draw from the deck', scarto: 'Take the discard', gruppo: 'Make a group', cala: 'Lay down', annulla: 'Undo groups',
        scarta: 'Discard', nuova: 'New game', prossima: 'Next hand', giocatori: n => `Players: ${n}`,
        pesca: 'Your turn: draw a card.', gioca: 'Pick cards: group them and lay them down, tap a group on the table to add one, or discard one to end your turn.',
        apri: n => `To open you need 40 points: you have ${n} in the groups ready.`, aspetta: 'The computers are playing.',
        chiusa: (i, p) => `${i === 0 ? 'You close' : 'Computer ' + i + ' closes'} the hand. Penalties: ${p}.`, fine: v => v === 0 ? 'You win the game.' : `Computer ${v} wins the game.`,
        no: 'Not allowed.'
    } : {
        tu: 'Tu', pc: i => `Computer ${i}`, mazzo: 'Pesca dal mazzo', scarto: 'Prendi lo scarto', gruppo: 'Forma un gruppo', cala: 'Cala', annulla: 'Annulla gruppi',
        scarta: 'Scarta', nuova: 'Nuova partita', prossima: 'Prossima smazzata', giocatori: n => `Giocatori: ${n}`,
        pesca: 'Tocca a te: pesca una carta.', gioca: 'Scegli le carte: formale in gruppi e calale, tocca un gruppo in tavola per attaccarne una, o scartane una per chiudere il turno.',
        apri: n => `Per aprire servono 40 punti: nei gruppi pronti ne hai ${n}.`, aspetta: 'Giocano i computer.',
        chiusa: (i, p) => `${i === 0 ? 'Chiudi tu' : 'Chiude il computer ' + i}. Penalità: ${p}.`, fine: v => v === 0 ? 'Hai vinto la partita.' : `Vince il computer ${v}.`,
        no: 'Non si può.'
    };
    const dep = window.OAKVX.deposito.crea();
    const calmo = () => doc.documentElement.classList.contains('calm');
    let giocatori = 2, s = dep.riprendi('scala-40') || nuova(Date.now() >>> 0, giocatori), scelte = [], pronti = [], nota = '', attesa = 0;
    const tavolo = window.OAKVX.tavolo.monta(radice, { onGioca, onAzione, onTavolo });

    const salva = () => dep.salva('scala-40', s);
    function turniComputer() {
        if ((s.fase !== 'pesca' && s.fase !== 'gioca') || s.turno === 0) return;
        clearTimeout(attesa);
        attesa = setTimeout(() => {
            for (const m of mossaComputer(s)) {
                if (m.tipo === 'pesca') s = pesca(s, m.da);
                if (m.tipo === 'cala') s = cala(s, m.gruppi);
                if (m.tipo === 'attacca') s = attacca(s, m.carta, m.gruppo);
                if (m.tipo === 'scarta') s = scarta(s, m.indice);
            }
            if (s.ultima && s.ultima.tipo === 'scarta') tavolo.annuncia(`${T.pc(s.ultima.chi)}: ${D.nome(s.ultima.carta, lingua)}`);
            salva(); disegna(); turniComputer();
        }, calmo() ? 120 : 650);
    }
    function onGioca(i) {
        if (s.turno !== 0 || s.fase !== 'gioca') return;
        const inPronti = new Set(pronti.flat());
        const id = s.mani[0].filter(c => !inPronti.has(c.id))[i].id;
        scelte = scelte.includes(id) ? scelte.filter(x => x !== id) : [...scelte, id];
        nota = ''; disegna();
    }
    function onTavolo(j) {
        if (s.turno !== 0) return;
        if (j === 0) { if (s.fase === 'pesca') { const t = pesca(s, 'scarto'); nota = t === s ? T.no : ''; s = t; } }
        else if (s.fase === 'gioca' && scelte.length === 1) {
            const t = attacca(s, scelte[0], j - 1); nota = t === s ? T.no : ''; if (t !== s) scelte = []; s = t;
        }
        salva(); disegna();
    }
    function onAzione(nome) {
        if (nome === 'mazzo' || nome === 'scarto') { const t = pesca(s, nome); nota = t === s ? T.no : ''; s = t; }
        if (nome === 'gruppo' && scelte.length >= 3) { pronti.push(scelte); scelte = []; }
        if (nome === 'annulla') { pronti = []; }
        if (nome === 'cala') { const t = cala(s, pronti); nota = t === s ? T.no : ''; if (t !== s) pronti = []; s = t; }
        if (nome === 'scarta' && scelte.length === 1) {
            const i = s.mani[0].findIndex(c => c.id === scelte[0]);
            const t = scarta(s, i); nota = t === s ? T.no : ''; if (t !== s) { scelte = []; pronti = []; } s = t;
        }
        if (nome === 'nuova') { s = nuova(Date.now() >>> 0, giocatori); scelte = []; pronti = []; nota = ''; }
        if (nome === 'prossima') { s = prossima(s, Date.now() >>> 0); nota = ''; }
        if (nome === 'giocatori') { giocatori = giocatori === 4 ? 2 : giocatori + 1; s = nuova(Date.now() >>> 0, giocatori); scelte = []; pronti = []; }
        salva(); disegna(); turniComputer();
    }
    function disegna() {
        const mio = s.turno === 0, inPronti = new Set(pronti.flat());
        const mano = s.mani[0].filter(c => !inPronti.has(c.id));
        const indiciScelti = mano.map((c, i) => (scelte.includes(c.id) ? i : -1)).filter(i => i >= 0);
        let messaggio;
        if (s.fase === 'finita') messaggio = T.fine(s.vincitoreSmazzata);
        else if (s.fase === 'chiusa') messaggio = T.chiusa(s.vincitoreSmazzata ?? 0, s.punteggi.map((p, i) => `${i === 0 ? T.tu : T.pc(i)} ${p}`).join(', '));
        else if (!mio) messaggio = T.aspetta;
        else if (s.fase === 'pesca') messaggio = T.pesca;
        else messaggio = !s.aperto[0] && pronti.length ? T.apri(apertura(pronti.map(g => g.map(id => s.mani[0].find(c => c.id === id)))).punti) : T.gioca;
        const cima = s.scarti[s.scarti.length - 1];
        const azioni = s.fase === 'chiusa' ? [{ nome: 'prossima', etichetta: T.prossima, attiva: true }]
            : s.fase === 'finita' ? [] : mio && s.fase === 'pesca' ? [{ nome: 'mazzo', etichetta: T.mazzo, attiva: true }, { nome: 'scarto', etichetta: T.scarto, attiva: !!cima }]
            : mio ? [{ nome: 'gruppo', etichetta: T.gruppo, attiva: scelte.length >= 3 }, { nome: 'cala', etichetta: T.cala, attiva: pronti.length > 0 }, { nome: 'annulla', etichetta: T.annulla, attiva: pronti.length > 0 }, { nome: 'scarta', etichetta: T.scarta, attiva: scelte.length === 1 && !pronti.length }] : [];
        azioni.push({ nome: 'nuova', etichetta: T.nuova, attiva: true }, { nome: 'giocatori', etichetta: T.giocatori(s.mani.length), attiva: true });
        tavolo.mostra({
            dorso: 'francesi',
            avversari: s.mani.slice(1).map((m, i) => ({ nome: `${T.pc(i + 1)} · ${s.punteggi[i + 1]}${s.eliminati[i + 1] ? ' ✕' : ''}`, carte: m.length })),
            tavolo: [cima ? [cima] : [], ...s.tavolo.map(g => g.carte), ...pronti.map(g => g.map(id => s.mani[0].find(c => c.id === id)))],
            mazzo: s.mazzo.length,
            mano: s.mani[0].filter(c => !inPronti.has(c.id)),
            selezionate: indiciScelti,
            manoAttiva: mio && s.fase === 'gioca',
            messaggio: `${T.tu} ${s.punteggi[0]} · ${nota ? nota + ' ' : ''}${messaggio}`,
            azioni
        });
    }
    disegna();
    turniComputer();
})();
