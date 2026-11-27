/* Carte del Magazzino: mazzi, generatore a seme e mischiata. Funzioni pure.
   Carta: { id, seme, valore }. Siciliane 1–10 (8 fante, 9 cavallo, 10 re); francesi 1–13; jolly valore 0. */
(() => {
    'use strict';

    const SICILIANE = ['denari', 'coppe', 'spade', 'bastoni'];
    const FRANCESI = ['cuori', 'quadri', 'fiori', 'picche'];

    /** mulberry32: piccolo, veloce, riproducibile. Restituisce numeri in [0,1). */
    function generatore(seme) {
        let a = seme >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /** Fisher–Yates su una copia. */
    function mischia(carte, rnd) {
        const m = carte.slice();
        for (let i = m.length - 1; i > 0; i--) {
            const j = Math.floor(rnd() * (i + 1));
            [m[i], m[j]] = [m[j], m[i]];
        }
        return m;
    }

    function mazzoSiciliano() {
        return SICILIANE.flatMap(seme => Array.from({ length: 10 }, (_, i) => ({ id: `${seme}-${i + 1}`, seme, valore: i + 1 })));
    }

    function mazzoFrancese({ mazzi = 1, jolly = 0 } = {}) {
        const out = [];
        for (let m = 0; m < mazzi; m++) {
            for (const seme of FRANCESI) for (let v = 1; v <= 13; v++) out.push({ id: `${seme}-${v}-${m}`, seme, valore: v });
        }
        for (let j = 0; j < jolly; j++) out.push({ id: `jolly-${j}`, seme: 'jolly', valore: 0 });
        return out;
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.carte = { generatore, mischia, mazzoSiciliano, mazzoFrancese, SICILIANE, FRANCESI };
})();
