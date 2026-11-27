/* Blackjack del Magazzino. Regole: 6 mazzi francesi, rimescolati sotto il 25%; il banco sta su 17
   (anche morbido); blackjack paga 3:2; raddoppio sulle prime due carte; una divisione; niente assicurazione.
   Le regole sono funzioni pure (test in test/sito/magazzino-blackjack.test.mjs); in fondo c'è la pagina. */
(() => {
    'use strict';

    const MAZZI = 6, SOGLIA = Math.floor(MAZZI * 52 * .25);
    const punti = c => c.valore === 1 ? 11 : Math.min(10, c.valore);

    function punteggio(mano) {
        let totale = 0, assi = 0;
        for (const c of mano) { totale += punti(c); if (c.valore === 1) assi++; }
        while (totale > 21 && assi) { totale -= 10; assi--; }
        return { totale, morbido: assi > 0, blackjack: mano.length === 2 && totale === 21 };
    }

    const copia = s => JSON.parse(JSON.stringify(s));
    const pesca = s => s.sabot.shift();

    function nuova(seme, puntata, precedente) {
        const C = window.OAKVX.carte;
        const sabot = precedente && precedente.sabot && precedente.sabot.length >= SOGLIA
            ? precedente.sabot.slice()
            : C.mischia(C.mazzoFrancese({ mazzi: MAZZI }), C.generatore(seme));
        const s = { sabot, mani: [{ carte: [], puntata, finita: false, raddoppiata: false }], attiva: 0, banco: [], fase: 'giocatore', divisa: false };
        s.mani[0].carte.push(pesca(s)); s.banco.push(pesca(s)); s.mani[0].carte.push(pesca(s)); s.banco.push(pesca(s));
        // il banco guarda subito se ha blackjack; un blackjack chiude la mano
        if (punteggio(s.mani[0].carte).blackjack || punteggio(s.banco).blackjack) { s.mani[0].finita = true; s.fase = 'finita'; }
        return s;
    }

    function possibili(s) {
        if (s.fase !== 'giocatore') return [];
        const m = s.mani[s.attiva], out = ['carta', 'stai'];
        if (m.carte.length === 2) out.push('raddoppia');
        if (m.carte.length === 2 && !s.divisa && punti(m.carte[0]) === punti(m.carte[1])) out.push('dividi');
        return out;
    }

    function avanza(s) {
        while (s.attiva < s.mani.length && s.mani[s.attiva].finita) s.attiva++;
        if (s.attiva >= s.mani.length) { s.attiva = s.mani.length - 1; s.fase = 'banco'; }
        return s;
    }

    function azione(stato, a) {
        if (!possibili(stato).includes(a)) return stato;
        const s = copia(stato), m = s.mani[s.attiva];
        if (a === 'carta') {
            m.carte.push(pesca(s));
            if (punteggio(m.carte).totale >= 21) m.finita = true;
        } else if (a === 'stai') {
            m.finita = true;
        } else if (a === 'raddoppia') {
            m.puntata *= 2; m.raddoppiata = true;
            m.carte.push(pesca(s)); m.finita = true;
        } else if (a === 'dividi') {
            const seconda = { carte: [m.carte.pop()], puntata: m.puntata, finita: false, raddoppiata: false };
            s.mani.splice(s.attiva + 1, 0, seconda);
            s.divisa = true;
            m.carte.push(pesca(s)); seconda.carte.push(pesca(s));
            // assi divisi: una carta a testa e basta
            if (m.carte[0].valore === 1) { m.finita = true; seconda.finita = true; }
        }
        return avanza(s);
    }

    function banco(stato) {
        const s = copia(stato);
        const vive = s.mani.some(m => punteggio(m.carte).totale <= 21);
        while (vive && punteggio(s.banco).totale < 17) s.banco.push(pesca(s));
        s.fase = 'finita';
        return s;
    }

    function esito(s) {
        const b = punteggio(s.banco);
        const mani = s.mani.map(m => {
            const g = punteggio(m.carte), naturale = g.blackjack && !s.divisa;
            let resa;
            if (g.totale > 21) resa = 0;
            else if (naturale && !b.blackjack) resa = m.puntata * 2.5;
            else if (b.blackjack && !naturale) resa = 0;
            else if (naturale && b.blackjack) resa = m.puntata;
            else if (b.totale > 21 || g.totale > b.totale) resa = m.puntata * 2;
            else if (g.totale === b.totale) resa = m.puntata;
            else resa = 0;
            return { totale: g.totale, resa: Math.floor(resa) };
        });
        return { vincita: mani.reduce((a, m) => a + m.resa, 0), mani, banco: b.totale };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.blackjack = { punteggio, nuova, azione, banco, esito, possibili };

    /* ---------------------------------------------------------------- pagina */
    const doc = window.document;
    const radice = doc && doc.querySelector && doc.querySelector('[data-gioco="blackjack"]');
    if (!radice) return;

    const en = doc.documentElement.lang === 'en';
    const T = en ? {
        punta: n => `Bet ${n}`, carta: 'Hit', stai: 'Stand', raddoppia: 'Double', dividi: 'Split', ricarica: 'Refill chips',
        scegli: 'Place a bet to deal.', tocca: n => `Your move: ${n}.`, banco: 'Dealer', mano: (i, n) => `Hand ${i}: ${n}`,
        vinto: n => `You win ${n} chips.`, pari: 'Push: bet back.', perso: 'The dealer takes it.', bj: 'Blackjack.', zero: 'Out of chips. Refill and try again.',
        saldo: n => `Chips: ${n}`, puntata: n => `bet ${n}`,
        dice: { benvenuto: 'Evening. Place your bet.', fortuna: 'Good luck.', carta: 'Card or stand?', sballato: 'Bust.', banco: n => `Dealer has ${n}.`, bancoSballa: 'Dealer busts!', bj: 'Blackjack!', vinto: 'Well played.', perso: 'House wins.', pari: 'Push.', raddoppia: 'Doubling. One card.', dividi: 'Two hands, then.' }
    } : {
        punta: n => `Punta ${n}`, carta: 'Carta', stai: 'Stai', raddoppia: 'Raddoppia', dividi: 'Dividi', ricarica: 'Ricarica i gettoni',
        scegli: 'Punta per distribuire.', tocca: n => `Tocca a te: ${n}.`, banco: 'Banco', mano: (i, n) => `Mano ${i}: ${n}`,
        vinto: n => `Vinci ${n} gettoni.`, pari: 'Pareggio: la puntata torna a te.', perso: 'Vince il banco.', bj: 'Blackjack.', zero: 'Gettoni finiti. Ricarica e riprova.',
        saldo: n => `Gettoni: ${n}`, puntata: n => `puntata ${n}`,
        dice: { benvenuto: 'Buonasera. Fai la tua puntata.', fortuna: 'Buona fortuna.', carta: 'Carta o stai?', sballato: 'Sballato.', banco: n => `Il banco ha ${n}.`, bancoSballa: 'Il banco sballa!', bj: 'Blackjack!', vinto: 'Bella mano.', perso: 'Vince il banco.', pari: 'Pari.', raddoppia: 'Raddoppio. Una carta.', dividi: 'Allora due mani.' }
    };
    const PUNTATE = [10, 50, 100, 250];
    const dep = window.OAKVX.deposito.crea();
    const aggiornaSaldo = () => window.dispatchEvent(new CustomEvent('oakvx:gettoni'));
    let s = dep.riprendi('blackjack'), finale = '', esitoUltimo = null, occupato = false;
    if (s && (s.fase === 'finita' || s.fase === 'pronto')) s = { ...s, fase: 'pronto' };   // una mano chiusa non si ripaga
    if (s && !Array.isArray(s.mani)) s = null;                                             // salvataggi rovinati

    // decide le azioni e il messaggio dallo stato: la stessa logica per il tavolo 2D e la scena 3D
    function vista() {
        const inGioco = s && s.fase === 'giocatore';
        const azioni = inGioco
            ? ['carta', 'stai', 'raddoppia', 'dividi'].map(n => ({ nome: n, etichetta: T[n], attiva: possibili(s).includes(n) && (n === 'carta' || n === 'stai' || dep.saldo() >= s.mani[s.attiva].puntata) }))
            : dep.saldo() < PUNTATE[0] ? [{ nome: 'ricarica', etichetta: T.ricarica, attiva: true }]
            : PUNTATE.map(n => ({ nome: `punta-${n}`, etichetta: T.punta(n), attiva: dep.saldo() >= n }));
        const mani = s ? s.mani : [], attiva = s ? mani[s.attiva] : null;
        let messaggio = T.scegli;
        if (inGioco) messaggio = T.tocca(punteggio(attiva.carte).totale) + (mani.length > 1 ? ' · ' + mani.map((m, i) => T.mano(i + 1, punteggio(m.carte).totale)).join(' · ') : '');
        else if (finale) messaggio = finale;
        else if (dep.saldo() < PUNTATE[0]) messaggio = T.zero;
        return { inGioco, azioni, messaggio, attiva };
    }

    // applica un'azione alle regole e ai gettoni; restituisce le battute del mazziere
    function applica(nome) {
        const battute = [];
        esitoUltimo = null;
        if (nome.startsWith('punta-')) {
            const n = Number(nome.slice(6));
            if (!dep.scommetti(n)) return null;
            s = nuova(Date.now() >>> 0, n, s);
            finale = '';
            battute.push(T.dice.fortuna);
            if (s.fase === 'finita') chiudi(battute);
        } else if (nome === 'ricarica') {
            dep.ricarica();
        } else {
            if (!s || s.fase !== 'giocatore') return null;
            const m = s.mani[s.attiva];
            if ((nome === 'raddoppia' || nome === 'dividi') && !dep.scommetti(m.puntata)) return null;
            const prima = s;
            s = azione(s, nome);
            if (s === prima) return null;
            if (nome === 'raddoppia') battute.push(T.dice.raddoppia);
            if (nome === 'dividi') battute.push(T.dice.dividi);
            if (s.mani.some((x, i) => i <= s.attiva && x.finita && punteggio(x.carte).totale > 21) && nome === 'carta') battute.push(T.dice.sballato);
            if (s.fase === 'banco') { s = banco(s); chiudi(battute); }
        }
        aggiornaSaldo();
        dep.salva('blackjack', s);
        return battute;
    }

    function chiudi(battute) {
        const e = esito(s);
        if (e.vincita > 0) dep.paga(e.vincita);
        const puntato = s.mani.reduce((a, m) => a + m.puntata, 0);
        const bj = s.mani.length === 1 && punteggio(s.mani[0].carte).blackjack && e.vincita > puntato;
        finale = (bj ? T.bj + ' ' : '') + (e.vincita > puntato ? T.vinto(e.vincita - puntato) : e.vincita === puntato ? T.pari : T.perso);
        esitoUltimo = e.vincita > puntato ? 'vinto' : e.vincita === puntato ? 'pari' : 'perso';
        const b = punteggio(s.banco).totale;
        if (bj) battute.push(T.dice.bj);
        else if (s.mani.some(m => punteggio(m.carte).totale <= 21)) battute.push(b > 21 ? T.dice.bancoSballa : T.dice.banco(b));
        battute.push(esitoUltimo === 'vinto' ? T.dice.vinto : esitoUltimo === 'pari' ? T.dice.pari : T.dice.perso);
    }

    function webgl() { try { const c = doc.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
    const qui = doc.currentScript && doc.currentScript.src;

    /* --- tavolo 2D: senza WebGL o se la scena 3D non parte --- */
    function avvia2D() {
        radice.classList.remove('bj3d'); radice.replaceChildren();
        const tavolo = window.OAKVX.tavolo.monta(radice, { onAzione: nome => { if (applica(nome) !== null) { if (finale) tavolo.annuncia(finale); disegna(); } } });
        function disegna() {
            const v = vista(), coperta = v.inGioco;
            tavolo.mostra({
                dorso: 'francesi',
                avversari: [{ nome: T.banco + (s && !v.inGioco && s.banco.length ? ` · ${punteggio(s.banco).totale}` : ''), carte: 0 }],
                tavolo: s ? s.banco.map((c, i) => (coperta && i === 1 ? { coperta: true, id: 'coperta' } : c)) : [],
                mano: v.attiva ? v.attiva.carte : [], manoAttiva: false, messaggio: v.messaggio, azioni: v.azioni
            });
        }
        disegna();
    }

    /* --- scena 3D --- */
    async function avvia3D() {
        radice.classList.add('bj3d');
        radice.innerHTML = '<div class="bj3d__scena"></div><div class="bj3d__barra"><p class="bj3d__msg" aria-live="polite"></p><p class="bj3d__saldo t-meta"></p><div class="bj3d__azioni"></div></div>';
        const contenitore = radice.querySelector('.bj3d__scena'), msg = radice.querySelector('.bj3d__msg'), saldoEl = radice.querySelector('.bj3d__saldo'), azioniEl = radice.querySelector('.bj3d__azioni');
        const modulo = await import(new URL('blackjack3d.js', qui).href);
        const scena = await modulo.creaScena(contenitore);
        function bottoni() {
            const v = vista();
            msg.textContent = v.messaggio;
            const puntata = s && s.fase === 'giocatore' ? s.mani.reduce((a, m) => a + m.puntata, 0) : 0;
            saldoEl.textContent = T.saldo(dep.saldo().toLocaleString(en ? 'en-GB' : 'it-IT')) + (puntata ? ' · ' + T.puntata(puntata) : '');
            const fuoco = doc.activeElement && azioniEl.contains(doc.activeElement) ? doc.activeElement.textContent : null;
            azioniEl.replaceChildren(...v.azioni.map(a => {
                const b = doc.createElement('button'); b.type = 'button'; b.className = 'bj3d__azione'; b.textContent = a.etichetta;
                if (!a.attiva || occupato) b.disabled = true;
                b.addEventListener('click', () => gioca(a.nome));
                return b;
            }));
            if (fuoco) { const b = [...azioniEl.children].find(x => x.textContent === fuoco && !x.disabled) || [...azioniEl.children].find(x => !x.disabled); if (b) b.focus(); }
        }
        async function gioca(nome) {
            if (occupato) return;
            const battute = applica(nome);
            if (battute === null) return;
            occupato = true; bottoni();
            if (nome.startsWith('punta-') && battute.length) scena.parla(battute.shift());
            await scena.aggiorna(s, { coperta: s && s.fase === 'giocatore', saldo: dep.saldo(), esito: esitoUltimo });
            for (const b of battute) await scena.parla(b);
            if (s && s.fase === 'giocatore') scena.parla(T.dice.carta);
            occupato = false; bottoni();
        }
        await scena.aggiorna(s && s.fase === 'giocatore' ? s : null, { coperta: true, saldo: dep.saldo(), istantaneo: true });
        bottoni();
        scena.parla(s && s.fase === 'giocatore' ? T.dice.carta : T.dice.benvenuto);
    }

    if (webgl() && qui && !/[?&]tavolo=2d/.test(location.search)) avvia3D().catch(e => { console.warn('blackjack 3d non disponibile:', e); avvia2D(); });
    else avvia2D();
})();
