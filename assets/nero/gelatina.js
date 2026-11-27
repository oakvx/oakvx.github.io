/* Gelatina: la fisica dei quadratini delle tecnologie. Funzioni pure, testate in test/sito/gelatina.test.mjs. */
(() => {
    'use strict';

    /** Un passo di molla smorzata verso il bersaglio (integrazione semi-implicita di Eulero).
        k = rigidezza, c = smorzamento: con 180 e 12 rimbalza un paio di volte e si ferma. */
    function passo(stato, bersaglio, dt, k = 180, c = 12) {
        const ax = k * (bersaglio.x - stato.x) - c * stato.vx;
        const ay = k * (bersaglio.y - stato.y) - c * stato.vy;
        const vx = stato.vx + ax * dt, vy = stato.vy + ay * dt;
        return { x: stato.x + vx * dt, y: stato.y + vy * dt, vx, vy };
    }

    /** Deformazione dalla velocità: si allunga nella direzione del moto (fino a +18%)
        e si stringe di traverso, così l'area resta la stessa. rot in gradi. */
    function forma(stato) {
        const v = Math.hypot(stato.vx, stato.vy);
        if (!v) return { sx: 1, sy: 1, rot: 0 };
        const sx = 1 + Math.min(.18, v / 4000);
        return { sx, sy: 1 / sx, rot: Math.atan2(stato.vy, stato.vx) * 180 / Math.PI };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.gelatina = { passo, forma };
})();
