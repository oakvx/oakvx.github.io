/* Corsia del Magazzino 3D: elenco delle casse, posti, scorrimento della telecamera, polistirolo,
   pose del magazziniere annoiato e accensione dei neon. Funzioni pure (test in
   test/sito/magazzino-corsia.test.mjs); la scena in magazzino3d.js le applica.
   Coordinate: x lungo lo scaffale (a destra aumenta), y in alto, la cassa ha l'origine al centro della base. */
(() => {
    'use strict';

    const LARGHEZZA_CASSA = .52, PROFONDITA_CASSA = .38, ALTEZZA_CASSA = .34, PASSO = .72, Y_RIPIANO_ALTO = 1.02;

    // le casse: sei giochi pronti (ripiano basso), sette ancora negli scatoloni (ripiano alto, chiuse)
    const CASSE = [
        { id: 'blackjack', codice: 'A-01', nome: 'Blackjack', nomeEn: 'Blackjack', emblema: 'fiche', aperta: true, href: 'blackjack/', livello: 0 },
        { id: 'briscola', codice: 'A-02', nome: 'Briscola', nomeEn: 'Briscola', emblema: 'carta-asso', aperta: true, href: 'briscola/', livello: 0 },
        { id: 'scopa', codice: 'A-03', nome: 'Scopa', nomeEn: 'Scopa', emblema: 'scopa', aperta: true, href: 'scopa/', livello: 0 },
        { id: 'scala-40', codice: 'A-04', nome: 'Scala 40', nomeEn: 'Scala 40', emblema: 'scala', aperta: true, href: 'scala-40/', livello: 0 },
        { id: 'gioco-3d', codice: 'C-01', nome: 'Il gioco 3D', nomeEn: 'The 3D game', emblema: 'cubo-occhio', aperta: true, href: '../gioco/', livello: 0 },
        { id: 'terminale', codice: 'C-02', nome: 'Il terminale', nomeEn: 'The terminal', emblema: 'monitor', aperta: true, href: '../chi-sono/#term-titolo', livello: 0 },
        { id: 'roulette', codice: 'B-01', nome: 'Roulette', nomeEn: 'Roulette', emblema: 'ruota', aperta: false, href: null, livello: 1 },
        { id: 'texas', codice: 'B-02', nome: 'Texas hold’em', nomeEn: 'Texas hold’em', emblema: 'cappello', aperta: false, href: null, livello: 1 },
        { id: 'solitario', codice: 'B-03', nome: 'Solitario', nomeEn: 'Solitaire', emblema: 'carta-sola', aperta: false, href: null, livello: 1 },
        { id: 'sudoku', codice: 'B-04', nome: 'Sudoku', nomeEn: 'Sudoku', emblema: 'blocco-sudoku', aperta: false, href: null, livello: 1 },
        { id: 'campo-minato', codice: 'B-05', nome: 'Campo minato', nomeEn: 'Minesweeper', emblema: 'mina', aperta: false, href: null, livello: 1 },
        { id: 'dama', codice: 'B-06', nome: 'Dama', nomeEn: 'Draughts', emblema: 'pedina', aperta: false, href: null, livello: 1 },
        { id: 'forza-4', codice: 'B-07', nome: 'Forza 4', nomeEn: 'Four in a row', emblema: 'disco-forza-4', aperta: false, href: null, livello: 1 }
    ];

    /** Dove sta la cassa i: stesso passo per tutte, il livello decide l'altezza. */
    function postoCassa(i) {
        const c = CASSE[i];
        const indice = CASSE.slice(0, i).filter(x => x.livello === c.livello).length;
        return { x: indice * PASSO, y: c.livello === 0 ? 0 : Y_RIPIANO_ALTO };
    }

    // il bancone del magazziniere sta a sinistra della prima cassa, l'ultima cassa chiude a destra
    const X_BANCONE = -2.1;
    const X_FINE = Math.max(...CASSE.map((_, i) => postoCassa(i).x)) + .45;

    /** Quanto può scorrere il centro della telecamera, data la larghezza visibile sul piano degli scaffali. */
    function limitiCamera(larghezzaVista) {
        const totale = X_FINE - X_BANCONE;
        if (larghezzaVista >= totale) { const m = (X_FINE + X_BANCONE) / 2; return { min: m, max: m }; }
        return { min: X_BANCONE + larghezzaVista / 2, max: X_FINE - larghezzaVista / 2 };
    }

    /** La cassa aperta più vicina alla x della telecamera: l'unica che si può selezionare. */
    function cassaVicina(x) {
        let migliore = -1, d = Infinity;
        CASSE.forEach((c, i) => { if (!c.aperta) return; const dx = Math.abs(postoCassa(i).x - x); if (dx < d) { d = dx; migliore = i; } });
        return migliore;
    }

    // piccolo generatore riproducibile (mulberry32)
    function rnd(seme) {
        let a = seme >>> 0;
        return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }

    /** Pallini di polistirolo fermi dentro la cassa (coordinate della cassa). */
    function riempimento(seme) {
        const r = rnd(seme * 977 + 13), out = [];
        for (let i = 0; i < 130; i++) {
            out.push({ pos: [(r() - .5) * (LARGHEZZA_CASSA - .07), .06 + r() * (ALTEZZA_CASSA - .08), (r() - .5) * (PROFONDITA_CASSA - .07)], giro: r() * 6.28 });
        }
        return out;
    }

    /** Pochi pallini che si alzano piano e ricadono nella cassa; t va da 0 a 1 in circa 1,2 s. */
    function puffo(t, seme) {
        const r = rnd(seme * 131 + 7), s = Math.min(1, Math.max(0, t)) * 1.2, g = 1.6, out = [];
        for (let i = 0; i < 40; i++) {
            const x0 = (r() - .5) * (LARGHEZZA_CASSA - .08), z0 = (r() - .5) * (PROFONDITA_CASSA - .08), y0 = ALTEZZA_CASSA - .01 + r() * .02;
            const vy = .3 + r() * .25, vx = (r() - .5) * .16, vz = (r() - .5) * .12, sv = 2 * vy / g, se = Math.min(s, sv);
            out.push({ pos: [x0 + vx * se, y0 + vy * se - .5 * g * se * se, z0 + vz * se], giro: r() * 6.28 + s * (r() - .5) * 3 });
        }
        return out;
    }

    const arrotonda = x => Math.round(x * 1e6) / 1e6;
    /** Pose del magazziniere annoiato: gomito sul bancone, faccia sulla mano, un respiro lento ogni 8 s. */
    function poseAnnoiato(ms) {
        const k = Math.sin(2 * Math.PI * ms / 8000);
        const p = { spallaS: .55 + .015 * k, gomitoS: -1.0, polsoS: .1, spallaD: -.5, gomitoD: 3.1 + .02 * k, polsoD: .1, collo: .3 + .03 * k };
        for (const c in p) p[c] = arrotonda(p[c]);
        return p;
    }

    /** Occhi pesanti: a metà quasi sempre, chiusi per un battito lento ogni 3–6 s. */
    function occhiAnnoiato(ms) {
        const periodo = 4500, n = Math.floor(ms / periodo), fase = ms - n * periodo;
        const inizio = 3500 + (n * 977) % 500;
        return fase >= inizio && fase < inizio + 450 ? 'chiusi' : 'mezzi';
    }

    /** Luminosità (0..1) di quattro tubi al neon che si accendono a scatti uno dopo l'altro; t in secondi. */
    const AVVIO_NEON = [.15, .45, .7, 1.0];
    function accensione(t) {
        return AVVIO_NEON.map(a => {
            const u = t - a;
            if (u < 0) return 0;
            if (u < .06) return 1;
            if (u < .12) return 0;
            if (u < .18) return 1;
            if (u < .3) return 0;
            return 1;
        });
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.corsia = { CASSE, postoCassa, limitiCamera, cassaVicina, riempimento, puffo, poseAnnoiato, occhiAnnoiato, accensione, LARGHEZZA_CASSA, PROFONDITA_CASSA, ALTEZZA_CASSA, PASSO, Y_RIPIANO_ALTO, X_BANCONE, X_FINE };
})();
