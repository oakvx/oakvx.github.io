/* Pagina del Magazzino: la scena 3D (magazzino3d.js) con la barra in HTML, la tastiera e le battute del
   magazziniere. Senza WebGL, o se la scena non parte, resta l'elenco delle casse che c'è già nella pagina. */
(() => {
    'use strict';

    const doc = window.document;
    const sezione = doc && doc.querySelector && doc.querySelector('[data-magazzino-3d]');
    if (!sezione) return;
    const qui = doc.currentScript && doc.currentScript.src;
    const en = doc.documentElement.lang === 'en';
    const lingua = en ? 'en' : 'it';

    const BATTUTE = en ? {
        luce: 'Finally. The light.',
        idle: ['Come and play. It’s free anyway.', 'Go on, pick one. I’m not going anywhere.', 'Nothing to pay. Think about it.', 'Those boxes won’t open themselves.'],
        chiusa: 'That one’s still packed. Come back later.',
        casse: {
            blackjack: 'The dealer is in no hurry. Neither am I.', briscola: 'Briscola. Keep an eye on the trump.', scopa: 'Everyone wants the settebello.',
            'scala-40': 'Forty to open. Always forty.', 'gioco-3d': 'The 3D one. About a quarter of an hour.', terminale: 'Talk to the machine. I don’t talk much.'
        }
    } : {
        luce: 'Eh. Finalmente la luce.',
        idle: ['Venite a giocare. Tanto è gratis.', 'Scegliete pure. Io sto qui.', 'Non si paga niente. Pensateci.', 'Le casse non si aprono da sole.'],
        chiusa: 'Quella è ancora imballata. Torna dopo.',
        casse: {
            blackjack: 'Il banco non ha fretta. Io nemmeno.', briscola: 'Briscola. Occhio alla briscola.', scopa: 'Il settebello lo vogliono tutti.',
            'scala-40': 'Quaranta per aprire. Sempre quaranta.', 'gioco-3d': 'Quello in 3D. Un quarto d’ora, circa.', terminale: 'Parla con la macchina. Io parlo poco.'
        }
    };

    function webgl() { try { const c = doc.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
    if (!webgl() || !qui || /[?&]tavolo=2d/.test(location.search)) return;

    // il testo di ogni cassa si legge dall'elenco in HTML, già nella lingua giusta
    const dalla = {};
    doc.querySelectorAll('[data-cassa]').forEach(li => {
        dalla[li.dataset.cassa] = { nome: (li.querySelector('.cassa__nome') || {}).textContent || '', riga: (li.querySelector('.cassa__riga') || {}).textContent || '' };
    });

    const scenaEl = sezione.querySelector('.mg3d__scena'), nomeEl = sezione.querySelector('.mg3d__nome'), rigaEl = sezione.querySelector('.mg3d__riga');
    const prec = sezione.querySelector('[data-prec]'), succ = sezione.querySelector('[data-succ]'), gioca = sezione.querySelector('[data-gioca]'), cordino = sezione.querySelector('[data-cordino]');
    const nav = sezione.querySelector('.mg3d__nav');
    const CHIAVE = 'oakvx-magazzino-luce';
    let giaAcceso = false;
    try { giaAcceso = sessionStorage.getItem(CHIAVE) === '1'; } catch {}
    const calmo = () => doc.documentElement.classList.contains('calm');

    (async () => {
        const [{ creaMagazzino }] = await Promise.all([import(new URL('magazzino3d.js', qui).href)]);
        sezione.hidden = false;
        const K = window.OAKVX.corsia, CASSE = K.CASSE;
        const aperte = CASSE.map((c, i) => (c.aperta ? i : -1)).filter(i => i >= 0);
        const scena = await creaMagazzino(scenaEl, { acceso: giaAcceso, lingua });

        const mostraNav = acceso => { cordino.hidden = acceso; nav.hidden = !acceso; };
        mostraNav(scena.acceso());
        let ultimaBattuta = 0, parlando = false;
        const dice = async t => { if (parlando) return; parlando = true; ultimaBattuta = Date.now(); try { await scena.parla(t); } finally { parlando = false; } };

        function mostra(i) {
            const c = CASSE[i], d = dalla[c.id] || {};
            nomeEl.textContent = d.nome || (en ? c.nomeEn : c.nome);
            rigaEl.textContent = d.riga || '';
            gioca.href = new URL(c.href, location.href).href;
            gioca.hidden = false;
            gioca.setAttribute('aria-label', (en ? 'Play ' : 'Gioca a ') + nomeEl.textContent);
        }
        scena.su('seleziona', i => { mostra(i); setTimeout(() => { if (scena.selezionata() === i) dice(BATTUTE.casse[CASSE[i].id]); }, 500); });
        scena.su('gioca', () => { gioca.click(); });
        scena.su('chiusa', () => { dice(BATTUTE.chiusa); });

        const vai = verso => {
            const k = aperte.indexOf(scena.selezionata());
            scena.seleziona(aperte[Math.min(aperte.length - 1, Math.max(0, (k < 0 ? (verso > 0 ? -1 : aperte.length) : k) + verso))]);
        };
        prec.addEventListener('click', () => vai(-1));
        succ.addEventListener('click', () => vai(1));
        sezione.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); vai(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); vai(-1); }
        });

        async function accendi() {
            cordino.disabled = true;
            await scena.accendi();
            try { sessionStorage.setItem(CHIAVE, '1'); } catch {}
            mostraNav(true);
            rigaEl.textContent = '';
            nomeEl.textContent = en ? 'Pick a crate' : 'Scegli una cassa';
            gioca.hidden = true;
            succ.focus({ preventScroll: true });
            dice(BATTUTE.luce);
        }
        cordino.addEventListener('click', accendi);
        // un clic sulla scena al buio accende: la scena lo segnala accendendosi
        const aspettaLuce = setInterval(() => { if (scena.acceso() && nav.hidden) { clearInterval(aspettaLuce); try { sessionStorage.setItem(CHIAVE, '1'); } catch {} mostraNav(true); nomeEl.textContent = en ? 'Pick a crate' : 'Scegli una cassa'; gioca.hidden = true; dice(BATTUTE.luce); } }, 200);
        if (scena.acceso()) { nomeEl.textContent = en ? 'Pick a crate' : 'Scegli una cassa'; gioca.hidden = true; setTimeout(() => dice(BATTUTE.idle[0]), 900); }

        // ogni tanto il magazziniere dice qualcosa, senza alzare la testa
        setInterval(() => {
            if (doc.hidden || parlando || !scena.acceso() || Date.now() - ultimaBattuta < 12000) return;
            const r = scenaEl.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) return;
            dice(BATTUTE.idle[Math.floor(Math.random() * BATTUTE.idle.length)]);
        }, 3000);
    })().catch(e => { console.warn('magazzino 3d non disponibile:', e); });
})();
