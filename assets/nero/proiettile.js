/* ==========================================================================
   Proiettile: la transizione tra le pagine.
   Al clic su un link interno una pistola (3D su computer, assente altrove)
   spara: il proiettile attraversa lo schermo, dietro lascia un fascio di luce
   con dentro "oakvx.", il fascio copre la pagina e la successiva si apre da lì.
   Qui ci sono le regole e i tempi (funzioni pure, testate in test/sito/).
   ========================================================================== */
(function () {
    'use strict';

    const USCITA_MS = 900;
    const ARRIVO_MS = 600;

    // avanzamento 0..1 di un intervallo [da, a]
    const tratto = (ms, da, a) => Math.min(1, Math.max(0, (ms - da) / (a - da)));

    /** Il clic su questo link deve far partire lo sparo? */
    function vaFatta(evento, link, pagina, calmo) {
        if (calmo || evento.defaultPrevented) return false;
        if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
        if (link.target && link.target !== '_self') return false;
        if (link.download) return false;
        let dest, qui;
        try { dest = new URL(link.href); qui = new URL(pagina.href); } catch { return false; }
        if (!/^https?:$/.test(dest.protocol) || dest.origin !== qui.origin) return false;
        // stessa pagina (magari con un'ancora): si scorre e basta
        if (dest.pathname === qui.pathname && dest.search === qui.search) return false;
        return true;
    }

    /** La pistola 3D vale il peso solo su un computer vero. */
    function usaPistola(ambiente) {
        return !!(ambiente.puntatoreFine && ambiente.larghezza >= 900 && ambiente.webgl && !ambiente.calmo);
    }

    /** Stato della sequenza d'uscita al tempo ms (ogni valore 0..1). */
    function fase(ms) {
        return {
            pistola: Math.min(tratto(ms, 0, 180), 1 - tratto(ms, 600, USCITA_MS)),
            sparo: tratto(ms, 150, 260),
            proiettile: tratto(ms, 180, 480),
            fascio: tratto(ms, 180, 520),
            copertura: tratto(ms, 480, USCITA_MS)
        };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.proiettile = Object.assign(OAKVX.proiettile || {}, { vaFatta, usaPistola, fase, USCITA_MS, ARRIVO_MS });

    /* ---------------------------------------------------------------- DOM */
    let livello = null;

    function creaLivello() {
        if (livello) return livello;
        livello = document.createElement('div');
        livello.className = 'sparo';
        livello.setAttribute('aria-hidden', 'true');
        const scritta = Array.from({ length: 14 }, () => 'oakvx.').join(' ');
        livello.innerHTML =
            '<span class="sparo__fascio"><span class="sparo__scritta">' + scritta + '</span></span>' +
            '<span class="sparo__lampo"></span>' +
            '<span class="sparo__proiettile"></span>';
        document.body.append(livello);
        return livello;
    }

    /** Disegna lo stato f = fase(ms) a partire dalla volata {x, y} in pixel. */
    function disegna(f, volata) {
        const el = creaLivello();
        el.style.setProperty('--x0', volata.x + 'px');
        el.style.setProperty('--y', volata.y + 'px');
        el.style.setProperty('--s', (f.sparo > 0 && f.sparo < 1 ? Math.sin(f.sparo * Math.PI) : 0).toFixed(3));
        el.style.setProperty('--p', f.proiettile.toFixed(4));
        el.style.setProperty('--f', f.fascio.toFixed(4));
        el.style.setProperty('--c', f.copertura.toFixed(4));
    }

    Object.assign(OAKVX.proiettile, { creaLivello, disegna });
})();
