/* ==========================================================================
   Proiettile: la transizione tra le pagine.
   Al clic su un link interno una pistola (3D su computer, assente altrove)
   spara: il proiettile attraversa lo schermo, dietro lascia un fascio di luce
   con dentro "oakvx.", il fascio copre la pagina e la successiva si apre da lì.
   Qui ci sono le regole e i tempi (funzioni pure, testate in test/sito/).
   ========================================================================== */
(function () {
    'use strict';

    // indirizzo di questo file, per trovare pistola.js accanto
    const QUI = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '';

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

    /** Il segnale lasciato dall'uscita vale solo se è appena stato scritto (ms dell'orologio). */
    const VALIDITA_MS = 3000;
    function arrivoValido(valore, adesso) {
        const t = Number(valore);
        if (!valore || !Number.isFinite(t)) return false;
        const eta = adesso - t;
        return eta >= 0 && eta < VALIDITA_MS;
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.proiettile = Object.assign(OAKVX.proiettile || {}, { vaFatta, usaPistola, fase, arrivoValido, USCITA_MS, ARRIVO_MS });

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
        el.style.setProperty('--d', Math.max(f.pistola, f.copertura).toFixed(4));
    }

    Object.assign(OAKVX.proiettile, { creaLivello, disegna });

    /* ------------------------------------------------------------ uscita */
    let pistola = null;
    let inCorso = false;
    const CHIAVE = 'nero-sparo';

    function collegaPistola(p) { pistola = p; }

    function calmo() {
        return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('paused');
    }

    function spara(href) {
        if (inCorso) return;
        inCorso = true;
        const el = creaLivello();
        el.classList.remove('arrivo');
        el.classList.add('attivo');
        // le altre scene WebGL si fermano: per un secondo la GPU è tutta della pistola
        window.dispatchEvent(new CustomEvent('nero:sparo'));
        const conPistola = !!(pistola && pistola.pronta());
        const volata = conPistola ? pistola.volata() : { x: 0, y: Math.round(innerHeight * .46) };
        const inizio = performance.now();
        const tempo = () => performance.now() - inizio;
        if (conPistola) pistola.spara(tempo);
        let andato = false;
        const vai = () => {
            if (andato) return;
            andato = true;
            try { sessionStorage.setItem(CHIAVE, String(Date.now())); } catch {}
            location.href = href;
            // navigazione fermata, risposta senza pagina o download: la pagina torna usabile
            setTimeout(() => { if (document.visibilityState !== 'hidden') ripristina(); }, 4000);
        };
        const passo = () => {
            const ms = tempo();
            disegna(fase(ms), volata);
            if (ms < USCITA_MS) requestAnimationFrame(passo); else vai();
        };
        requestAnimationFrame(passo);
        setTimeout(vai, USCITA_MS + 200); // anche se la scheda smette di disegnare
    }

    /* ------------------------------------------------------------ arrivo */
    function apri() {
        const root = document.documentElement;
        let arrivato = false;
        try { arrivato = arrivoValido(sessionStorage.getItem(CHIAVE), Date.now()); sessionStorage.removeItem(CHIAVE); } catch {}
        if (!root.classList.contains('sparo-arrivo')) return;
        if (!arrivato || calmo()) { root.classList.remove('sparo-arrivo'); return; }
        const el = creaLivello();
        el.classList.add('arrivo');
        el.style.setProperty('--y', Math.round(innerHeight / 2) + 'px');
        el.style.setProperty('--a', '0');
        root.classList.remove('sparo-arrivo');
        const inizio = performance.now();
        const passo = () => {
            const t = Math.min(1, (performance.now() - inizio) / ARRIVO_MS);
            const a = 1 - Math.pow(1 - t, 3);
            el.style.setProperty('--a', a.toFixed(4));
            if (t < 1) requestAnimationFrame(passo);
            else { el.classList.remove('arrivo'); el.style.removeProperty('--a'); }
        };
        requestAnimationFrame(passo);
    }

    // tornando indietro dalla cache del browser la pagina non deve restare coperta
    function ripristina() {
        inCorso = false;
        if (!livello) return;
        livello.classList.remove('attivo', 'arrivo');
        ['--s', '--p', '--f', '--c', '--a', '--d'].forEach(k => livello.style.removeProperty(k));
    }

    /* ------------------------------------------------- pistola a richiesta */
    function webgl() {
        try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
    }

    let promessa = null;
    function caricaPistola() {
        if (promessa || !QUI) return promessa;
        promessa = import(new URL('pistola.js', QUI).href)
            .then(m => m.creaPistola(creaLivello()))
            .then(p => { collegaPistola(p); return p; })
            .catch(err => { console.warn('pistola:', err); return null; });
        return promessa;
    }

    function preparaPistola() {
        const ok = usaPistola({
            puntatoreFine: matchMedia('(pointer: fine) and (hover: hover)').matches,
            larghezza: innerWidth,
            webgl: webgl(),
            calmo: calmo()
        });
        if (!ok) return;
        const dopo = () => ('requestIdleCallback' in window ? requestIdleCallback(caricaPistola, { timeout: 3000 }) : setTimeout(caricaPistola, 1200));
        if (document.readyState === 'complete') dopo(); else addEventListener('load', dopo, { once: true });
        // chi punta subito un link non deve aspettare l'inattività
        document.addEventListener('pointerover', e => {
            const a = e.target.closest && e.target.closest('a[href]');
            if (a && !a.hasAttribute('data-no-velo') && new URL(a.href, location.href).origin === location.origin) caricaPistola();
        }, { passive: true });
    }

    function avvia() {
        apri();
        preparaPistola();
        addEventListener('pageshow', e => { if (e.persisted) ripristina(); });
        document.addEventListener('click', e => {
            const a = e.target.closest && e.target.closest('a[href]');
            if (!a || a.hasAttribute('data-no-velo')) return;
            const link = { href: a.href, target: a.getAttribute('target') || '', download: a.hasAttribute('download') };
            if (!vaFatta(e, link, { href: location.href }, calmo())) return;
            e.preventDefault();
            spara(a.href);
        });
    }

    Object.assign(OAKVX.proiettile, { avvia, spara, collegaPistola, caricaPistola });
})();
