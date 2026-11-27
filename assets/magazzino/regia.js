/* Regia del blackjack 3D: pose del mazziere di carta, volo delle carte, posti sul panno, pile di fiches.
   Funzioni pure (test in test/sito/magazzino-regia.test.mjs); la scena in blackjack3d.js le applica.
   Coordinate: y in alto, il tavolo è una mezzaluna con il lato dritto verso il mazziere (z = -0,9)
   e l'arco verso chi gioca; il giocatore guarda verso -z. */
(() => {
    'use strict';

    const liscia = t => t * t * (3 - 2 * t);
    const tra = (a, b, t) => a + (b - a) * t;

    // angoli dei perni (fermacampioni), in radianti, attorno all'asse che esce dal cartoncino
    const RIPOSO = { spallaS: .35, gomitoS: -1.25, polsoS: .25, spallaD: -.35, gomitoD: 1.15, polsoD: -.1, collo: 0 };
    const GESTI = {
        prendi: { ...RIPOSO, spallaD: .25, gomitoD: 2.05, polsoD: .35, collo: -.08 },     // la destra va al mazzo
        lancia: { ...RIPOSO, spallaD: -1.05, gomitoD: .35, polsoD: -.55, collo: .06 },    // e la lancia sul panno
        gira: { ...RIPOSO, spallaD: -.15, gomitoD: 1.55, polsoD: .9, collo: -.12 },       // gira la carta coperta
        paga: { ...RIPOSO, spallaS: .9, gomitoS: -.55, spallaD: -.95, gomitoD: .55, collo: .1 }
    };

    /** Angoli dei perni per un gesto al tempo t (0..1): va e torna, il punto più ampio a metà. */
    function posa(nome, t) {
        const g = GESTI[nome];
        if (!g) return { ...RIPOSO };
        const k = t < .5 ? liscia(t * 2) : liscia((1 - t) * 2);
        const out = {};
        for (const p in RIPOSO) out[p] = tra(RIPOSO[p], g[p], k);
        return out;
    }

    /** Volo di una carta: arco alto almeno 0,3 a metà, la faccia si scopre mentre vola. */
    function voloCarta(t, da, a) {
        const k = liscia(Math.min(1, Math.max(0, t)));
        const pos = da.map((x, i) => tra(x, a[i], k));
        pos[1] += 1.28 * t * (1 - t);                    // 0,32 sopra la retta a metà volo
        if (t === 0) pos[1] = da[1];
        if (t === 1) pos[1] = a[1];
        const giro = t <= .2 ? 0 : t >= .8 ? 1 : liscia((t - .2) / .6);
        return { pos, giro: t === 0 ? 0 : t === 1 ? 1 : giro, inclina: Math.sin(Math.PI * t) * .4 };
    }

    const LARGO = .13;                                  // passo fra le carte di una mano
    /** Dove si posa la carta i della mano n (su "mani" mani) per il banco o il giocatore. */
    function postoCarta(chi, mano, indice, mani = 1) {
        if (chi === 'banco') return [-.2 + indice * LARGO, .004 + indice * .0012, -.42];
        const centro = (mano - (mani - 1) / 2) * .78;
        return [centro - .1 + indice * LARGO, .004 + indice * .0012, .45 - indice * .015];
    }

    const RAGGIO = 1.9, CENTRO_Z = -.9;
    const dentroTavolo = (x, z) => z >= CENTRO_Z && Math.hypot(x, z - CENTRO_Z) <= RAGGIO;

    /** Pile di fiches a sinistra del giocatore: tagli grandi prima, al massimo 20 per pila. */
    function pileFiches(saldo) {
        let resto = Math.max(0, Math.floor(saldo));
        const pile = [];
        for (const valore of [500, 100, 25, 10, 5, 1]) {
            let n = Math.floor(resto / valore);
            resto -= n * valore;
            while (n > 0) { const q = Math.min(20, n); pile.push({ valore, quante: q }); n -= q; }
        }
        // griglia: 4 colonne verso il centro, righe verso chi gioca; se una riga esce dal tavolo si stringe
        pile.forEach((p, i) => {
            const riga = Math.floor(i / 4), col = i % 4;
            let x = -1.05 + col * .13, z = .15 + riga * .14;
            while (!dentroTavolo(x, z) && x < -.2) x += .13;
            p.x = x; p.z = z;
        });
        return pile;
    }

    /** Bocca del mazziere mentre parla: aperta e chiusa ogni 110 ms. */
    const bocca = ms => (Math.floor(ms / 110) % 2 === 0 ? 'aperta' : 'chiusa');

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.regia = { posa, voloCarta, postoCarta, pileFiches, dentroTavolo, bocca, RIPOSO, RAGGIO, CENTRO_Z };
})();
