/* Deposito del Magazzino: gettoni finti e partite salvate nel browser.
   Se localStorage non c'è o è bloccato, tutto continua in memoria. */
(() => {
    'use strict';

    const SALDO_INIZIALE = 1000;
    const CHIAVE_GETTONI = 'oakvx-gettoni-v1';
    const chiavePartita = gioco => `oakvx-partita-${gioco}-v1`;

    function crea(storage) {
        if (storage === undefined) { try { storage = window.localStorage; } catch { storage = null; } }
        const memoria = new Map();
        const leggi = k => {
            try { const v = storage?.getItem(k); if (v != null) return v; } catch {}
            return memoria.has(k) ? memoria.get(k) : null;
        };
        const scrivi = (k, v) => { memoria.set(k, v); try { storage?.setItem(k, v); } catch {} };
        const togli = k => { memoria['delete'](k); try { storage?.removeItem(k); } catch {} };

        const saldo = () => {
            const n = Number(leggi(CHIAVE_GETTONI));
            return leggi(CHIAVE_GETTONI) == null || !Number.isFinite(n) || n < 0 ? SALDO_INIZIALE : Math.floor(n);
        };
        const imposta = n => scrivi(CHIAVE_GETTONI, String(n));
        const valida = n => typeof n === 'number' && Number.isInteger(n) && n > 0;

        return {
            saldo,
            scommetti(n) {
                if (!valida(n) || n > saldo()) return false;
                imposta(saldo() - n);
                return true;
            },
            paga(n) { if (valida(n)) imposta(saldo() + n); },
            ricarica() { if (saldo() === 0) imposta(SALDO_INIZIALE); },
            salva(gioco, stato) { scrivi(chiavePartita(gioco), JSON.stringify(stato)); },
            riprendi(gioco) {
                const v = leggi(chiavePartita(gioco));
                if (v == null) return null;
                try { return JSON.parse(v); } catch { return null; }
            },
            dimentica(gioco) { togli(chiavePartita(gioco)); }
        };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.deposito = { crea, SALDO_INIZIALE };
})();
