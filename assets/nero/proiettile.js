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

    // ease in-out cubica
    const cubica = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
            // il lampo: acceso di colpo a 150 ms, spento in una manciata di fotogrammi
            lampo: ms < 150 || ms > 260 ? 0 : Math.exp(-(ms - 150) / 47),
            // il proiettile è quasi istantaneo: la scia lo insegue
            proiettile: cubica(tratto(ms, 170, 450)),
            fumo: tratto(ms, 170, USCITA_MS),
            fascio: tratto(ms, 180, 520),
            copertura: tratto(ms, 480, USCITA_MS)
        };
    }

    /** Con la pistola 3D: il proiettile inciso esce dalla canna e vola verso chi guarda,
        sempre più grande, finché copre lo schermo. */
    const VOLO_MS = 1400;
    const SPARO_MS = 300;                       // la pistola entra con calma, poi spara
    function faseVolo(ms) {
        const t = tratto(ms, SPARO_MS + 20, 1300);
        return {
            pistola: Math.min(tratto(ms, 0, 280), 1 - tratto(ms, 850, 1200)),
            sparo: tratto(ms, SPARO_MS, SPARO_MS + 120),
            lampo: ms < SPARO_MS || ms > SPARO_MS + 110 ? 0 : Math.exp(-(ms - SPARO_MS) / 47),
            volo: t * t * t,                      // cubica in entrata: lento all'uscita, poi addosso
            fumo: tratto(ms, SPARO_MS + 20, VOLO_MS),
            copertura: tratto(ms, 1300, VOLO_MS)
        };
    }

    /** Rinculo: molla sotto-smorzata (polso che assorbe il colpo). Picco 1 a ~30 ms, rimbalzo ~-0,2. */
    const ZETA = .45, OMEGA = 41.2, OMEGA_D = OMEGA * Math.sqrt(1 - ZETA * ZETA);
    const molla = t => Math.exp(-ZETA * OMEGA * t) * Math.sin(OMEGA_D * t);
    const PICCO = molla(Math.atan(OMEGA_D / (ZETA * OMEGA)) / OMEGA_D);
    function rinculo(ms) {
        const t = (ms - SPARO_MS) / 1000;
        return t < 0 ? 0 : molla(t) / PICCO;
    }

    /** Carrello 0..1: arretra in 15 ms, torna in batteria entro 60 ms. */
    function carrello(ms) {
        const t = ms - SPARO_MS;
        if (t < 0 || t >= 60) return 0;
        if (t <= 15) return 1 - Math.pow(1 - t / 15, 2);
        return 1 - cubica((t - 15) / 45);
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
    OAKVX.proiettile = Object.assign(OAKVX.proiettile || {}, { vaFatta, usaPistola, fase, faseVolo, rinculo, carrello, cubica, arrivoValido, USCITA_MS, VOLO_MS, ARRIVO_MS });

    /* ---------------------------------------------------------------- DOM */
    let livello = null;

    function creaLivello() {
        if (livello) return livello;
        livello = document.createElement('div');
        livello.className = 'sparo';
        livello.setAttribute('aria-hidden', 'true');
        const scritta = Array.from({ length: 14 }, () => 'oakvx.').join(' ');
        livello.innerHTML =
            '<span class="sparo__fascio"></span>' +
            '<span class="sparo__scritta">' + scritta + '</span>' +
            '<span class="sparo__lampo"></span>' +
            '<span class="sparo__fumo"></span><span class="sparo__fumo"></span><span class="sparo__fumo"></span>' +
            '<span class="sparo__proiettile"></span>';
        document.body.append(livello);
        return livello;
    }

    /* Il fascio è un rettangolo a tutto schermo spostato e scalato con transform:
       niente ricalcolo dell'impaginazione a ogni fotogramma. */
    function rettangolo(el, sinistra, alto, larghezza, altezza, buio) {
        const W = innerWidth, H = innerHeight;
        el.style.setProperty('--tx', sinistra.toFixed(1) + 'px');
        el.style.setProperty('--ty', alto.toFixed(1) + 'px');
        el.style.setProperty('--sx', Math.max(0, larghezza / W).toFixed(5));
        el.style.setProperty('--sy', Math.max(0, altezza / H).toFixed(5));
        el.style.setProperty('--c', buio.toFixed(4));
    }

    /** Disegna lo stato f = fase(ms) a partire dalla volata {x, y} in pixel. */
    function disegna(f, volata) {
        const el = creaLivello();
        const W = innerWidth, H = innerHeight;
        const x0 = volata.x, y = volata.y;
        // scia sottile; quando copre diventa un'ombra scura che si allarga, non una banda bianca
        // la scia resta sottile e sfuma; a coprire la pagina è il buio (--c su .sparo::after)
        const altezza = 1.5 + f.fascio * H * .03;
        rettangolo(el, x0, y - altezza / 2, (W - x0 + W * .08) * f.proiettile, altezza, f.copertura);
        el.style.setProperty('--traccia', (1 - f.copertura).toFixed(4));
        el.style.setProperty('--x0', x0 + 'px');
        el.style.setProperty('--y', y + 'px');
        el.style.setProperty('--s', (f.lampo || 0).toFixed(3));
        el.style.setProperty('--fumo', (f.fumo || 0).toFixed(4));
        el.style.setProperty('--p', f.proiettile.toFixed(4));
        el.style.setProperty('--f', f.fascio.toFixed(4));
        el.style.setProperty('--d', Math.max(f.pistola, f.copertura).toFixed(4));
        el.style.setProperty('--testo', (f.fascio * (1 - f.copertura * 3)).toFixed(4));
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

    const ATTESA_PISTOLA_MS = 2500;

    function spara(href, giaAtteso = false) {
        if (inCorso) return;
        inCorso = true;
        if (!giaAtteso && promessa && !(pistola && pistola.pronta())) {
            // la pistola sta ancora scaricando: meglio un attimo di attesa che uno sparo senza pistola
            let partito = false;
            const via = () => { if (!partito) { partito = true; inCorso = false; spara(href, true); } };
            promessa.then(via);
            setTimeout(via, ATTESA_PISTOLA_MS);
            return;
        }
        const el = creaLivello();
        el.classList.remove('arrivo');
        el.classList.add('attivo');
        // le altre scene WebGL si fermano: per un secondo la GPU è tutta della pistola
        window.dispatchEvent(new CustomEvent('nero:sparo'));
        const conPistola = !!(pistola && pistola.pronta());
        const volata = conPistola ? pistola.volata() : { x: 0, y: Math.round(innerHeight * .46) };
        el.classList.toggle('con-pistola', conPistola); // il proiettile lo disegna la scena 3D
        const inizio = performance.now();
        const tempo = () => performance.now() - inizio;
        if (conPistola) pistola.spara(tempo);
        // con la pistola il proiettile 3D fa da transizione: niente scia orizzontale
        const durata = conPistola ? VOLO_MS : USCITA_MS;
        const statoA = ms => (conPistola ? { ...faseVolo(ms), proiettile: 0, fascio: 0 } : fase(ms));
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
            disegna(statoA(ms), conPistola && pistola.volataOra ? pistola.volataOra() : volata);
            if (ms < durata) requestAnimationFrame(passo); else vai();
        };
        requestAnimationFrame(passo);
        setTimeout(vai, durata + 200); // anche se la scheda smette di disegnare
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
            el.style.setProperty('--c', '1'); // il buio si apre dal centro: il proiettile è appena passato
            if (t < 1) requestAnimationFrame(passo);
            else { el.classList.remove('arrivo'); el.style.removeProperty('--a'); el.style.removeProperty('--c'); }
        };
        requestAnimationFrame(passo);
    }

    // tornando indietro dalla cache del browser la pagina non deve restare coperta
    function ripristina() {
        inCorso = false;
        if (!livello) return;
        livello.classList.remove('attivo', 'arrivo');
        ['--s', '--p', '--f', '--c', '--a', '--d', '--sx', '--sy', '--tx', '--ty', '--testo', '--traccia', '--fumo'].forEach(k => livello.style.removeProperty(k));
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
        // subito dopo la pagina: chi clicca presto deve trovarla pronta
        const dopo = () => setTimeout(caricaPistola, 0);
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
