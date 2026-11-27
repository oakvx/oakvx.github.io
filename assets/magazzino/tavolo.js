/* Tavolo comune dei giochi del Magazzino: avversari, tavolo, mano, azioni, annunci.
   Ogni carta giocabile è un <button>: si gioca col tocco, col clic, con Invio o Spazio;
   le frecce spostano il fuoco nella mano. Il gioco decide le regole, il tavolo mostra. */
(() => {
    'use strict';

    function monta(radice, { onGioca, onAzione, onTavolo } = {}) {
        const doc = radice.ownerDocument || window.document;
        const lingua = () => (doc.documentElement && doc.documentElement.lang === 'en') ? 'en' : 'it';
        const D = () => window.OAKVX.disegno;
        const el = (tag, classe, attr = {}) => {
            const e = doc.createElement(tag);
            if (classe) e.className = classe;
            for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v);
            return e;
        };

        const avversari = el('div', 'tavolo__avversari');
        const centro = el('div', 'tavolo__centro');
        const messaggio = el('p', 'tavolo__messaggio');
        const mano = el('div', 'tavolo__mano', { role: 'group', 'aria-label': lingua() === 'en' ? 'Your hand' : 'La tua mano' });
        const azioni = el('div', 'tavolo__azioni');
        const annuncio = el('p', 'tavolo__annuncio', { 'aria-live': 'polite' });
        radice.classList.add('tavolo');
        radice.replaceChildren(avversari, centro, messaggio, mano, azioni, annuncio);

        const bottoneCarta = (c, classe, etichetta) => {
            const b = el('button', classe, { type: 'button', 'aria-label': etichetta || D().nome(c, lingua()) });
            b.innerHTML = D().carta(c);
            b.dataset.carta = c.id;
            return b;
        };
        const dorsi = (n, tipo) => {
            const g = el('span', 'tavolo__dorsi', { 'aria-hidden': 'true' });
            for (let i = 0; i < Math.min(n, 13); i++) { const s = el('span', 'tavolo__dorso'); s.innerHTML = D().dorso(tipo); g.append(s); }
            return g;
        };

        // le frecce spostano il fuoco tra le carte della mano
        mano.addEventListener('keydown', e => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const b = mano.querySelectorAll('button');
            const i = Array.prototype.indexOf.call(b, doc.activeElement);
            if (i < 0) return;
            e.preventDefault();
            b[(i + (e.key === 'ArrowRight' ? 1 : b.length - 1)) % b.length].focus();
        });

        function mostra(v) {
            const tipo = v.dorso || 'siciliane';
            avversari.replaceChildren(...(v.avversari || []).map(a => {
                const r = el('div', 'tavolo__avversario');
                const n = el('span', 'tavolo__nome t-meta'); n.textContent = a.nome + (a.punti != null ? ` · ${a.punti}` : '');
                r.append(n, dorsi(a.carte || 0, tipo));
                return r;
            }));

            const voci = v.tavolo || [];
            centro.replaceChildren(...voci.map((x, i) => {
                const gruppo = Array.isArray(x) ? x : [x];
                const selezionata = (v.tavoloSelezionate || []).includes(i);
                if (onTavolo) {
                    const b = gruppo.length === 1 ? bottoneCarta(gruppo[0], 'tavolo__carta') : el('button', 'tavolo__gruppo', { type: 'button', 'aria-label': gruppo.map(c => D().nome(c, lingua())).join(', ') });
                    if (gruppo.length > 1) for (const c of gruppo) { const s = el('span', 'tavolo__carta'); s.innerHTML = D().carta(c); b.append(s); }
                    b.setAttribute('aria-pressed', selezionata ? 'true' : 'false');
                    b.addEventListener('click', () => onTavolo(i));
                    return b;
                }
                const g = el('span', gruppo.length > 1 ? 'tavolo__gruppo' : 'tavolo__posto', { role: 'img', 'aria-label': gruppo.map(c => D().nome(c, lingua())).join(', ') });
                for (const c of gruppo) { const s = el('span', 'tavolo__carta'); s.innerHTML = D().carta(c); g.append(s); }
                return g;
            }));
            if (v.mazzo != null) {
                const m = el('span', 'tavolo__mazzo t-meta'); m.textContent = String(v.mazzo);
                centro.append(m);
            }

            messaggio.textContent = v.messaggio || '';

            const scelte = v.selezionate || [];
            mano.replaceChildren(...(v.mano || []).map((c, i) => {
                const b = bottoneCarta(c, 'tavolo__carta tavolo__carta--mano');
                if (scelte.includes(i)) { b.classList.add('scelta'); b.setAttribute('aria-pressed', 'true'); }
                if (v.manoAttiva === false) b.setAttribute('disabled', '');
                b.addEventListener('click', () => { if (v.manoAttiva !== false && onGioca) onGioca(i); });
                return b;
            }));

            azioni.replaceChildren(...(v.azioni || []).map(a => {
                const b = el('button', 'tavolo__azione', { type: 'button' });
                b.textContent = a.etichetta;
                if (!a.attiva) b.setAttribute('disabled', '');
                b.addEventListener('click', () => { if (a.attiva && onAzione) onAzione(a.nome); });
                return b;
            }));
        }

        function annuncia(testo) { annuncio.textContent = testo; }

        return { mostra, annuncia };
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.tavolo = { monta };
})();
