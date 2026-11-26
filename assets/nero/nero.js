/* ==========================================================================
   oakvx — sistema "Nero": comportamento condiviso da tutte le pagine.
   Niente librerie. Ogni modulo parte solo se trova il proprio markup.
   L'italiano sta nell'HTML; le pagine inglesi sono generate in /en/ da
   scripts/build_static.py, quindi qui servono solo i testi dinamici (DYN).
   ========================================================================== */
(() => {
    'use strict';

    const root = document.documentElement;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const EMAIL = 'gabrielelucia07@gmail.com';
    const lang = (root.lang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';

    const DYN = {
        it: {
            pause: 'Ferma animazioni',
            resume: 'Riprendi animazioni',
            menuOpen: 'Indice',
            menuClose: 'Chiudi',
            copied: 'Indirizzo copiato',
            copyFail: 'Copia non riuscita: gabrielelucia07@gmail.com',
            open: 'Apri',
            hold: 'Tieni',
            help: 'help     tutti i comandi\nwhoami   chi sono\nls       progetti\nskills   tecnologie e competenze\nlingue   lingue che parlo\nemail    il mio indirizzo\ngithub   il mio profilo GitHub\nclear    pulisci il terminale',
            identity: 'Junior developer & graphic designer.\nSassuolo, Italia.\nIngegneria Informatica @ UNIMORE.',
            skills: 'Web          HTML / CSS / JavaScript\nBackend      Node.js / PHP\nDati         PostgreSQL / MySQL / T-SQL\nGrafica      social / interfacce\nAutomazione  PLC / SQL Server',
            languages: 'italiano     madrelingua\ninglese      C1\nspagnolo     B1\ngreco        B1\ncinese       A2',
            unknown: 'Comando non trovato. Digita help.',
            projects: 'Progetti:',
            coffee: '418 Sono una teiera. Chiedilo a oakvx di persona.',
            slotFree: n => n === 1 ? '<em>1</em> orario libero' : `<em>${n}</em> orari liberi`,
            slotNone: 'Nessun orario libero',
            slotPick: (h, d) => `Prenotato alle ${h}, per ${d} minuti. (Simulazione: nulla viene salvato.)`,
            lightOn: 'Spegni la luce',
            lightOff: 'Accendi la luce'
        },
        en: {
            pause: 'Pause animations',
            resume: 'Resume animations',
            menuOpen: 'Index',
            menuClose: 'Close',
            copied: 'Address copied',
            copyFail: 'Copy failed: gabrielelucia07@gmail.com',
            open: 'Open',
            hold: 'Hold',
            help: 'help     all commands\nwhoami   about me\nls       projects\nskills   technologies and skills\nlingue   languages I speak\nemail    my address\ngithub   my GitHub profile\nclear    clear the terminal',
            identity: 'Junior developer & graphic designer.\nSassuolo, Italy.\nComputer Engineering @ UNIMORE.',
            skills: 'Web          HTML / CSS / JavaScript\nBackend      Node.js / PHP\nData         PostgreSQL / MySQL / T-SQL\nDesign       social / interfaces\nAutomation   PLC / SQL Server',
            languages: 'Italian      native\nEnglish      C1\nSpanish      B1\nGreek        B1\nChinese      A2',
            unknown: 'Command not found. Type help.',
            projects: 'Projects:',
            coffee: '418 I’m a teapot. Ask oakvx in person.',
            slotFree: n => n === 1 ? '<em>1</em> free slot' : `<em>${n}</em> free slots`,
            slotNone: 'No free slots',
            slotPick: (h, d) => `Booked at ${h}, for ${d} minutes. (Simulation: nothing is saved.)`,
            lightOn: 'Turn the light off',
            lightOff: 'Turn the light on'
        }
    };
    const t = key => DYN[lang][key];

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches || root.classList.contains('paused');
    const finePointer = matchMedia('(pointer: fine) and (hover: hover)');

    /* ----------------------------------------------------------------------
       Lingua: i link IT/EN puntano alle pagine reali e ricordano la scelta.
       ---------------------------------------------------------------------- */
    function initLingue() {
        const itUrl = root.dataset.langItUrl || location.pathname;
        const enUrl = root.dataset.langEnUrl;
        $$('[data-lang-switch]').forEach(a => {
            const target = a.dataset.langSwitch;
            if (target === 'it') a.href = itUrl + location.hash;
            if (target === 'en' && enUrl) a.href = enUrl + location.hash;
            if (target === lang) a.setAttribute('aria-current', 'true');
            a.addEventListener('click', () => { try { localStorage.setItem('lang', target); } catch {} });
        });
    }

    /* ----------------------------------------------------------------------
       Ora locale di Sassuolo
       ---------------------------------------------------------------------- */
    function initOra() {
        const nodes = $$('[data-ora]');
        if (!nodes.length) return;
        const fmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
        const tick = () => {
            const now = fmt.format(new Date());
            nodes.forEach(n => { n.textContent = now; });
        };
        tick();
        setInterval(tick, 15000);
    }

    /* ----------------------------------------------------------------------
       Testata che si ritira scorrendo, segnapagina con avanzamento.
       ---------------------------------------------------------------------- */
    function initScorrimento() {
        const testata = $('[data-testata]');
        const barra = $('.segnapagina');
        let last = scrollY, ticking = false;
        const update = () => {
            ticking = false;
            const y = scrollY;
            if (testata && !root.classList.contains('indice-aperto')) {
                testata.classList.toggle('sopra', y > 40);
                testata.classList.toggle('nascosta', y > 280 && y > last + 4);
                if (y < last - 4 || y < 280) testata.classList.remove('nascosta');
            }
            if (barra) {
                const max = document.documentElement.scrollHeight - innerHeight;
                barra.style.setProperty('--avanzamento', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
            }
            last = y;
        };
        addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
        testata?.addEventListener('focusin', () => testata.classList.remove('nascosta'));
    }

    /* ----------------------------------------------------------------------
       Indice a tutto schermo: focus intrappolato, Esc per chiudere.
       ---------------------------------------------------------------------- */
    function initIndice() {
        const button = $('[data-apri-indice]');
        const panel = $('[data-indice]');
        if (!button || !panel) return;
        const label = $('[data-burger-label]', button);
        const outside = $$('body > *:not([data-indice]):not([data-testata]):not(.velo):not(.cursore)');
        let open = false;

        const here = location.pathname.replace(/index\.html$/, '');
        $$('a', panel).forEach(a => {
            const url = new URL(a.href, location.href);
            if (url.origin === location.origin && url.pathname.replace(/index\.html$/, '') === here && !url.hash) a.setAttribute('aria-current', 'page');
        });

        const set = value => {
            open = value;
            root.classList.toggle('indice-aperto', open);
            button.setAttribute('aria-expanded', String(open));
            if (label) label.textContent = open ? t('menuClose') : t('menuOpen');
            panel.toggleAttribute('inert', !open);
            panel.setAttribute('aria-hidden', String(!open));
            outside.forEach(el => el.toggleAttribute('inert', open));
            if (open) {
                $('[data-testata]')?.classList.remove('nascosta');
                document.body.style.overflow = 'hidden';
                setTimeout(() => $('a', panel)?.focus({ preventScroll: true }), calm() ? 0 : 350);
            } else {
                document.body.style.overflow = '';
            }
        };
        panel.hidden = false;
        set(false);
        button.addEventListener('click', () => {
            set(!open);
            if (!open) button.focus();
        });
        panel.addEventListener('click', e => {
            const a = e.target.closest('a');
            if (a && a.hash && new URL(a.href, location.href).pathname === location.pathname) set(false);
        });
        addEventListener('keydown', e => {
            if (!open) return;
            if (e.key === 'Escape') { set(false); button.focus(); }
            if (e.key === 'Tab') {
                const items = [button, ...$$('a, button', panel)].filter(el => el.offsetParent !== null);
                const first = items[0], lastEl = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
                else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
            }
        });
    }

    /* ----------------------------------------------------------------------
       Animazioni: comando per fermarle (ricordato), oltre a prefers-reduced-motion.
       ---------------------------------------------------------------------- */
    function initMovimento() {
        const buttons = $$('[data-motion-toggle]');
        const sync = () => {
            const paused = root.classList.contains('paused');
            buttons.forEach(b => {
                b.setAttribute('aria-pressed', String(paused));
                const l = $('[data-motion-label]', b) || b;
                l.textContent = paused ? t('resume') : t('pause');
            });
        };
        buttons.forEach(b => b.addEventListener('click', () => {
            const paused = !root.classList.contains('paused');
            root.classList.toggle('paused', paused);
            root.classList.toggle('calm', paused || reduce.matches);
            try { localStorage.setItem('motion', paused ? 'paused' : 'on'); } catch {}
            dispatchEvent(new CustomEvent('nero:movimento', { detail: { paused } }));
            sync();
        }));
        reduce.addEventListener?.('change', () => {
            root.classList.toggle('calm', reduce.matches || root.classList.contains('paused'));
            dispatchEvent(new CustomEvent('nero:movimento', { detail: { paused: calm() } }));
        });
        sync();
    }

    /* ----------------------------------------------------------------------
       Velo: sipario tra una pagina e l'altra, con numero e titolo di arrivo.
       ---------------------------------------------------------------------- */
    function initVelo() {
        const velo = document.createElement('div');
        velo.className = 'velo';
        velo.setAttribute('aria-hidden', 'true');
        velo.innerHTML = '<div class="velo__testo"><span class="velo__n t-meta"></span><span class="velo__titolo"></span></div>';
        document.body.append(velo);
        const n = $('.velo__n', velo), titolo = $('.velo__titolo', velo);

        // Arrivo
        let arrivo = null;
        try { arrivo = JSON.parse(sessionStorage.getItem('nero-velo') || 'null'); sessionStorage.removeItem('nero-velo'); } catch {}
        if (root.classList.contains('velo-entra')) {
            if (arrivo && !calm()) {
                n.textContent = arrivo.n || '';
                titolo.textContent = arrivo.titolo || '';
                velo.classList.add('scopre');
                velo.addEventListener('animationend', e => { if (e.target === velo) velo.className = 'velo'; }, { once: false });
            }
            root.classList.remove('velo-entra');
        }

        document.addEventListener('click', e => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = e.target.closest('a[href]');
            if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noVelo !== undefined) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
            if (url.pathname === location.pathname && url.search === location.search) return; // ancora nella stessa pagina
            if (calm()) return;
            e.preventDefault();
            const dest = {
                n: a.dataset.veloN || '',
                titolo: a.dataset.velo || (a.querySelector('[data-velo-nome]')?.textContent || a.textContent).trim().split('\n')[0].slice(0, 40)
            };
            n.textContent = dest.n;
            titolo.textContent = dest.titolo;
            try { sessionStorage.setItem('nero-velo', JSON.stringify(dest)); } catch {}
            velo.className = 'velo copre';
            setTimeout(() => { location.href = url.href; }, 820);
        });

        // Ritorno dalla cache del browser: il velo non deve restare chiuso.
        addEventListener('pageshow', e => { if (e.persisted) velo.className = 'velo'; });
    }

    /* ----------------------------------------------------------------------
       Cursore: punto + anello, con etichette contestuali.
       ---------------------------------------------------------------------- */
    function initCursore() {
        if (!finePointer.matches) return;
        const c = document.createElement('div');
        c.className = 'cursore';
        c.setAttribute('aria-hidden', 'true');
        c.innerHTML = '<span class="cursore__anello"><span class="cursore__etichetta"></span></span><span class="cursore__punto"></span>';
        document.body.append(c);
        root.classList.add('cursore-attivo');
        const ring = $('.cursore__anello', c), dot = $('.cursore__punto', c), label = $('.cursore__etichetta', c);
        let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
        const loop = () => {
            const k = calm() ? 1 : .18;
            rx += (x - rx) * k; ry += (y - ry) * k;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            raf = Math.abs(x - rx) + Math.abs(y - ry) > .1 ? requestAnimationFrame(loop) : 0;
        };
        addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            x = e.clientX; y = e.clientY;
            c.classList.add('visibile');
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
        document.addEventListener('pointerleave', () => c.classList.remove('visibile'));
        document.addEventListener('pointerover', e => {
            const el = e.target.closest?.('a, button, [data-cursore], input, label');
            const text = el?.closest('[data-cursore]')?.dataset.cursore;
            c.classList.toggle('su-link', !!el);
            c.classList.toggle('con-etichetta', !!text);
            if (text) label.textContent = lang === 'en' ? ({ Apri: 'Open', Avanti: 'Next', Luce: 'Light' }[text] || text) : text;
        });
        addEventListener('nero:tieni', e => {
            c.classList.toggle('tiene', e.detail.attivo);
            if (e.detail.attivo) label.textContent = t('hold');
        });
    }

    /* ----------------------------------------------------------------------
       Rivelazioni: parole mascherate e blocchi che salgono.
       ---------------------------------------------------------------------- */
    function splitWords(el) {
        if (el.dataset.splitFatto) return;
        el.dataset.splitFatto = '1';
        let i = 0;
        const walk = node => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === 3) {
                    const parts = child.textContent.split(/(\s+)/);
                    const frag = document.createDocumentFragment();
                    parts.forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
                        const w = document.createElement('span');
                        w.className = 'parola';
                        const inner = document.createElement('span');
                        inner.textContent = part;
                        inner.style.setProperty('--i', i++);
                        w.append(inner);
                        frag.append(w);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && !child.matches('br')) {
                    walk(child);
                }
            });
        };
        walk(el);
    }

    function initRivela() {
        $$('[data-split]').forEach(splitWords);
        const targets = $$('[data-split], .rivela, .rivela-maschera, .linea-entra');
        if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('visto')); return; }
        // Un elemento ritagliato del tutto (clip-path) non risulta mai visibile all'observer:
        // per le maschere si osserva il genitore.
        const owners = new Map();
        const io = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            (owners.get(entry.target) || [entry.target]).forEach(el => el.classList.add('visto'));
            io.unobserve(entry.target);
        }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
        targets.forEach(el => {
            const watch = el.matches('.rivela-maschera, .linea-entra') ? el.parentElement : el;
            if (!owners.has(watch)) owners.set(watch, []);
            owners.get(watch).push(el);
            io.observe(watch);
        });
    }

    /* Manifesto: ogni parola si accende quando attraversa il centro dello schermo. */
    function initParoleScorrevoli() {
        const blocks = $$('[data-scorri-parole]');
        if (!blocks.length) return;
        const words = [];
        blocks.forEach(block => {
            const walk = node => [...node.childNodes].forEach(child => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
                        const s = document.createElement('span');
                        s.className = 'p-scorri';
                        s.textContent = part;
                        words.push(s);
                        frag.append(s);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1) walk(child);
            });
            walk(block);
        });
        let ticking = false;
        const update = () => {
            ticking = false;
            const mid = innerHeight * .62;
            words.forEach(w => {
                const r = w.getBoundingClientRect();
                const d = (mid - r.top) / (innerHeight * .35);
                w.style.setProperty('--luce', Math.max(.16, Math.min(1, d)).toFixed(3));
            });
        };
        addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        addEventListener('resize', update);
        update();
    }

    /* Lettere del titolo d'apertura: entrano, poi reagiscono al cursore. */
    function initApertura() {
        const sec = $('.apertura');
        if (!sec) return;
        const word = $('[data-lettere]', sec);
        if (word && !word.dataset.fatto) {
            word.dataset.fatto = '1';
            const text = word.textContent.trim();
            word.textContent = '';
            [...text].forEach((ch, i) => {
                const s = document.createElement('span');
                s.className = 'apertura__lettera';
                s.textContent = ch;
                s.style.setProperty('--i', i);
                word.append(s);
            });
        }
        requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.add('pronta')));
        if (!finePointer.matches) return;
        const letters = $$('.apertura__lettera', sec);
        let raf = 0, mx = 0, my = 0;
        sec.addEventListener('pointermove', e => {
            mx = e.clientX; my = e.clientY;
            if (raf || calm()) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                letters.forEach(l => {
                    const r = l.getBoundingClientRect();
                    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                    const dx = mx - cx, dy = my - cy;
                    const dist = Math.hypot(dx, dy);
                    const f = Math.max(0, 1 - dist / 520);
                    l.style.transform = `translate(${(-dx * f * .05).toFixed(1)}px, ${(-dy * f * .04).toFixed(1)}px) skewX(${(dx * f * -.012).toFixed(2)}deg)`;
                    l.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
                });
            });
        });
        sec.addEventListener('pointerleave', () => letters.forEach(l => { l.style.transform = ''; }));
    }

    /* ----------------------------------------------------------------------
       Indice dei lavori: anteprima che segue il cursore, inclinata dalla velocità.
       ---------------------------------------------------------------------- */
    function initAnteprime() {
        const list = $('[data-anteprime]');
        if (!list || !finePointer.matches || !matchMedia('(min-width: 901px)').matches) return;
        const box = document.createElement('div');
        box.className = 'anteprima';
        box.setAttribute('aria-hidden', 'true');
        const tag = document.createElement('span');
        tag.className = 'anteprima__etichetta t-meta';
        box.append(tag);
        const items = $$('.lavoro', list);
        const imgs = items.map(item => {
            const src = $('.lavoro__img', item);
            const img = new Image();
            img.src = src?.currentSrc || src?.src || '';
            img.alt = '';
            if (src?.classList.contains('contiene')) img.className = 'contiene';
            box.append(img);
            return img;
        });
        document.body.append(box);
        let x = 0, y = 0, bx = 0, by = 0, vx = 0, raf = 0, active = false;
        const loop = () => {
            const k = calm() ? 1 : .14;
            const nx = bx + (x - bx) * k, ny = by + (y - by) * k;
            vx = nx - bx; bx = nx; by = ny;
            const skew = Math.max(-12, Math.min(12, vx * .6));
            box.style.transform = `translate(${bx + 28}px, ${by - box.offsetHeight / 2}px) rotate(${skew * .25}deg) skewX(${-skew}deg)`;
            raf = active || Math.abs(vx) > .05 ? requestAnimationFrame(loop) : 0;
        };
        list.addEventListener('pointermove', e => {
            x = e.clientX; y = e.clientY;
            if (!raf) raf = requestAnimationFrame(loop);
        });
        items.forEach((item, i) => {
            const link = $('.lavoro__link', item);
            const show = () => {
                active = true;
                imgs.forEach((im, j) => im.classList.toggle('attiva', i === j));
                tag.textContent = $('.lavoro__n', item)?.textContent + ' — ' + ($('.lavoro__tipo', item)?.textContent || '');
                box.classList.add('visibile');
                list.classList.add('ha-anteprima');
                if (!raf) raf = requestAnimationFrame(loop);
            };
            link.addEventListener('pointerenter', e => { if (!bx) { bx = x = e.clientX; by = y = e.clientY; } show(); });
        });
        list.addEventListener('pointerleave', () => {
            active = false;
            box.classList.remove('visibile');
            list.classList.remove('ha-anteprima');
        });
    }

    /* ----------------------------------------------------------------------
       Copia dell'indirizzo email
       ---------------------------------------------------------------------- */
    let avvisoTimer;
    function avviso(msg) {
        let el = $('.avviso');
        if (!el) {
            el = document.createElement('p');
            el.className = 'avviso';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.append(el);
        }
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add('visibile'));
        clearTimeout(avvisoTimer);
        avvisoTimer = setTimeout(() => el.classList.remove('visibile'), 2600);
    }
    function initCopia() {
        $$('[data-copia-email]').forEach(b => b.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(EMAIL);
                avviso(t('copied'));
            } catch {
                avviso(t('copyFail'));
            }
        }));
    }

    /* ----------------------------------------------------------------------
       Metadati che si "decifrano" al passaggio del mouse.
       ---------------------------------------------------------------------- */
    function initDecifra() {
        const glyphs = '01<>/_-+=*#%&§$';
        $$('[data-decifra]').forEach(el => {
            const original = el.textContent;
            let raf = 0;
            const run = () => {
                if (calm()) return;
                cancelAnimationFrame(raf);
                const start = performance.now();
                const step = now => {
                    const p = Math.min(1, (now - start) / 520);
                    const shown = Math.floor(p * original.length);
                    el.textContent = original.split('').map((ch, i) => i < shown || ch === ' ' ? ch : glyphs[(Math.random() * glyphs.length) | 0]).join('');
                    if (p < 1) raf = requestAnimationFrame(step); else el.textContent = original;
                };
                raf = requestAnimationFrame(step);
            };
            (el.closest('a, button') || el).addEventListener('pointerenter', run);
        });
    }

    /* ----------------------------------------------------------------------
       Immagini dei casi studio: leggero zoom legato allo scorrimento.
       ---------------------------------------------------------------------- */
    function initParallasse() {
        const figs = $$('.caso-figura');
        if (!figs.length) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            if (calm()) { figs.forEach(f => f.style.setProperty('--scala', 1)); return; }
            figs.forEach(f => {
                const r = f.getBoundingClientRect();
                const p = Math.max(0, Math.min(1, 1 - (r.top + r.height) / (innerHeight + r.height)));
                f.style.setProperty('--scala', (1.12 - p * .12).toFixed(4));
            });
        };
        addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    /* ----------------------------------------------------------------------
       Terminale portfolio.sh
       ---------------------------------------------------------------------- */
    function initTerminale() {
        const out = $('[data-term-out]');
        const form = $('[data-term-form]');
        if (!out || !form) return;
        const input = $('input', form);
        const base = form.dataset.base || '../';
        const history = [];
        let h = 0;
        const line = text => { const p = document.createElement('p'); p.textContent = text; out.append(p); };
        const link = (label, href) => {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.textContent = label; a.href = href;
            if (href.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            p.append(a); out.append(p);
        };
        const run = raw => {
            const cmd = raw.trim().toLowerCase();
            if (!cmd) return;
            if (cmd === 'clear') { out.replaceChildren(); return; }
            const p = document.createElement('p');
            p.innerHTML = '<b>oakvx@portfolio:~$</b> ';
            p.append(document.createTextNode(raw.trim()));
            out.append(p);
            switch (cmd) {
                case 'help': line(t('help')); break;
                case 'whoami': line('Gabriele Lucia — oakvx'); line(t('identity')); break;
                case 'skills': line(t('skills')); break;
                case 'lingue': case 'languages': line(t('languages')); break;
                case 'email': link(EMAIL, 'mailto:' + EMAIL); break;
                case 'github': link('github.com/oakvx', 'https://github.com/oakvx'); break;
                case 'ls':
                    line(t('projects'));
                    link('01  Brat Animator', base + 'projects/brat-animator/');
                    link('02  Synk', base + 'projects/synk/');
                    link('03  Beautify', base + 'projects/beautify/');
                    link('04  Spinotto Felice', base + 'projects/autoofficina/');
                    break;
                case 'coffee': case 'caffe': case 'caffè': case 'sudo make coffee': line(t('coffee')); break;
                default: line(t('unknown'));
            }
            while (out.children.length > 80) out.firstElementChild.remove();
            out.scrollTop = out.scrollHeight;
        };
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (input.value.trim()) { history.push(input.value); h = history.length; }
            run(input.value);
            input.value = '';
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp' && history.length) { h = Math.max(0, h - 1); input.value = history[h]; e.preventDefault(); }
            if (e.key === 'ArrowDown' && history.length) { h = Math.min(history.length, h + 1); input.value = history[h] ?? ''; e.preventDefault(); }
        });
        $$('[data-cmd]').forEach(b => b.addEventListener('click', () => { run(b.dataset.cmd); input.focus({ preventScroll: true }); }));
    }

    /* Solo quando un elemento è visibile, e solo se l'utente non ha chiesto calma. */
    function quandoVisibile(el, onShow, onHide) {
        if (!('IntersectionObserver' in window)) { onShow(); return; }
        new IntersectionObserver(([entry]) => (entry.isIntersecting ? onShow : onHide)()).observe(el);
    }

    /* ----------------------------------------------------------------------
       Brat Animator: righe LRC che diventano fotogrammi, parola per parola.
       ---------------------------------------------------------------------- */
    function initLyric() {
        const box = $('[data-lyric]');
        if (!box) return;
        const lines = $$('.lyric__lrc li', box);
        const stage = $('.lyric__riga', box);
        const clock = $('[data-lyric-tempo]', box);
        const track = $('.lyric__traccia', box);
        const data = lines.map(li => ({ at: parseFloat(li.dataset.t), words: li.dataset.parole.split(' ') }));
        const total = 6;
        let start = 0, raf = 0, current = -1;
        const render = time => {
            let idx = data.length - 1;
            for (let i = 0; i < data.length; i++) if (time < data[i].at) { idx = i - 1; break; }
            idx = Math.max(0, idx);
            if (idx !== current) {
                current = idx;
                lines.forEach((li, i) => li.classList.toggle('attiva', i === idx));
                stage.replaceChildren(...data[idx].words.map(w => { const s = document.createElement('span'); s.textContent = w; return s; }));
            }
            const next = data[idx + 1]?.at ?? total;
            const span = (next - data[idx].at) / (data[idx].words.length + 1);
            [...stage.children].forEach((s, i) => s.classList.toggle('on', time >= data[idx].at + span * i));
            track.style.setProperty('--t', (time / total).toFixed(4));
            const sec = Math.floor(time), cs = Math.floor((time - sec) * 100);
            clock.textContent = `00:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
        };
        const loop = now => {
            const time = ((now - start) / 1000) % total;
            render(time);
            raf = requestAnimationFrame(loop);
        };
        const play = () => { if (calm() || raf) return; start = performance.now(); raf = requestAnimationFrame(loop); };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };
        data.forEach(d => {
            const b = document.createElement('b');
            b.style.left = (d.at / total * 100) + '%';
            track.append(b);
        });
        render(calm() ? 5.9 : 0);
        quandoVisibile(box, play, stop);
        addEventListener('nero:movimento', () => { if (calm()) { stop(); render(5.9); } else play(); });
    }

    /* ----------------------------------------------------------------------
       Synk: l'intent picker sceglie una strada diversa a ogni messaggio.
       ---------------------------------------------------------------------- */
    function initFlusso() {
        const box = $('[data-flusso]');
        if (!box) return;
        const vie = $$('.flusso__vie li', box);
        const bolle = $$('[data-bolla]', box);
        let i = 0, timer = 0;
        const show = n => {
            vie.forEach((v, j) => v.classList.toggle('scelta', j === n));
            bolle.forEach((b, j) => { b.hidden = j !== n; });
        };
        const step = () => { i = (i + 1) % vie.length; show(i); };
        show(0);
        quandoVisibile(box, () => { if (!calm() && !timer) timer = setInterval(step, 2600); }, () => { clearInterval(timer); timer = 0; });
        vie.forEach((v, j) => {
            v.tabIndex = 0;
            const pick = () => { clearInterval(timer); timer = 0; i = j; show(j); };
            v.addEventListener('pointerenter', pick);
            v.addEventListener('focus', pick);
        });
        addEventListener('nero:movimento', () => { if (calm()) { clearInterval(timer); timer = 0; } });
    }

    /* ----------------------------------------------------------------------
       Beautify: calcolo degli orari liberi, come nella prenotazione pubblica
       (slot ogni 30 minuti, intervalli occupati, durata del servizio).
       ---------------------------------------------------------------------- */
    function initOrari() {
        const box = $('[data-orari]');
        if (!box) return;
        const grid = $('.orari__griglia', box);
        const esito = $('.orari__esito', box);
        const nota = $('[data-orari-nota]', box);
        const open = 9 * 60, close = 19 * 60, step = 30;
        const busy = [[9 * 60 + 30, 10 * 60 + 30], [12 * 60, 13 * 60 + 30], [15 * 60, 15 * 60 + 30], [16 * 60 + 30, 18 * 60]];
        const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        let duration = 60;
        const render = () => {
            grid.replaceChildren();
            let free = 0;
            for (let m = open; m < close; m += step) {
                const end = m + duration;
                const occupied = busy.some(([a, b]) => m >= a && m < b);
                const fits = !occupied && end <= close && !busy.some(([a, b]) => m < b && end > a);
                const el = document.createElement(fits ? 'button' : 'span');
                el.className = 'orario ' + (occupied ? 'occupato' : fits ? 'libero' : 'passato');
                el.textContent = fmt(m);
                if (fits) {
                    free++;
                    el.type = 'button';
                    el.addEventListener('click', () => { nota.textContent = t('slotPick')(fmt(m), duration); });
                } else el.setAttribute('aria-disabled', 'true');
                grid.append(el);
            }
            esito.innerHTML = free ? t('slotFree')(free) : t('slotNone');
        };
        $$('[data-durata]', box).forEach(b => b.addEventListener('click', () => {
            duration = Number(b.dataset.durata);
            $$('[data-durata]', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            nota.textContent = '';
            render();
        }));
        render();
    }

    /* ----------------------------------------------------------------------
       Spinotto Felice: una luce segue il puntatore; l'interruttore la accende.
       ---------------------------------------------------------------------- */
    function initLuce() {
        const box = $('[data-luce]');
        if (!box) return;
        const sw = $('[data-interruttore]');
        const label = sw && $('[data-interruttore-testo]', sw);
        let tx = 50, ty = 45, x = 50, y = 45, raf = 0;
        const loop = () => {
            x += (tx - x) * .12; y += (ty - y) * .12;
            box.style.setProperty('--x', x.toFixed(2) + '%');
            box.style.setProperty('--y', y.toFixed(2) + '%');
            raf = Math.abs(tx - x) + Math.abs(ty - y) > .05 ? requestAnimationFrame(loop) : 0;
        };
        box.addEventListener('pointermove', e => {
            const r = box.getBoundingClientRect();
            tx = (e.clientX - r.left) / r.width * 100;
            ty = (e.clientY - r.top) / r.height * 100;
            if (calm()) { x = tx; y = ty; }
            if (!raf) raf = requestAnimationFrame(loop);
        });
        const set = on => {
            box.classList.toggle('accesa', on);
            sw?.setAttribute('aria-pressed', String(on));
            if (label) label.textContent = on ? t('lightOn') : t('lightOff');
        };
        sw?.addEventListener('click', () => set(!box.classList.contains('accesa')));
        box.addEventListener('click', () => { if (!finePointer.matches) set(!box.classList.contains('accesa')); });
        set(calm());
    }

    function init() {
        initLingue();
        initOra();
        initScorrimento();
        initIndice();
        initMovimento();
        initVelo();
        initCursore();
        initApertura();
        initRivela();
        initParoleScorrevoli();
        initAnteprime();
        initCopia();
        initDecifra();
        initParallasse();
        initTerminale();
        initLyric();
        initFlusso();
        initOrari();
        initLuce();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
