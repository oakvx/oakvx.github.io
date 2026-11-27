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
            lightOff: 'Accendi la luce',
            locale: 'it-IT',
            commitDay: (n, d) => `${n} commit · ${d}`,
            commitChart: (n, g) => `${n} commit in ${g} giorni di lavoro`,
            commitLive: 'aggiornato da GitHub',
            commitOffline: 'GitHub non risponde: dati dell’ultima pubblicazione',
            following: 'seguiti',
            posts: 'post',
            likes: 'mi piace',
            videos: 'video',
            private: 'profilo privato',
            waiting: 'in attesa del primo controllo',
            changed: t => `ultimo cambiamento ${t}`,
            ago: (n, u) => `${n} ${u} fa`,
            units: { m: ['minuto', 'minuti'], h: ['ora', 'ore'], d: ['giorno', 'giorni'] },
            now: 'adesso'
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
            lightOff: 'Turn the light on',
            locale: 'en-GB',
            commitDay: (n, d) => `${n} commit${n === 1 ? '' : 's'} · ${d}`,
            commitChart: (n, g) => `${n} commits over ${g} working days`,
            commitLive: 'updated from GitHub',
            commitOffline: 'GitHub is not answering: data from the last publish',
            following: 'following',
            posts: 'posts',
            likes: 'likes',
            videos: 'videos',
            private: 'private profile',
            waiting: 'waiting for the first check',
            changed: t => `last change ${t}`,
            ago: (n, u) => `${n} ${u} ago`,
            units: { m: ['minute', 'minutes'], h: ['hour', 'hours'], d: ['day', 'days'] },
            now: 'just now'
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
        const outside = $$('body > *:not([data-indice]):not([data-testata]):not(.sparo):not(.cursore)');
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
        const via = () => requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.add('pronta')));
        // con il menu d'ingresso aperto le lettere aspettano: salgono mentre il menu si alza
        if (root.classList.contains('ingresso-attivo')) {
            let partito = false;
            const parti = () => { if (!partito) { partito = true; setTimeout(via, calm() ? 0 : 420); } };
            addEventListener('ingresso:esce', parti, { once: true });
            addEventListener('ingresso:chiuso', parti, { once: true });
        } else via();
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


    /* ----------------------------------------------------------------------
       Commit di questo sito: totale e istogramma per giorno, in diretta da GitHub
       (API pubblica, risultato in cache per un'ora). Senza rete restano i dati
       incisi nella pagina al momento della pubblicazione.
       ---------------------------------------------------------------------- */
    const dataBreve = d => new Date(d + 'T12:00:00').toLocaleDateString(t('locale'), { day: 'numeric', month: 'short', year: 'numeric' });

    function initCommitSito() {
        const box = $('[data-commit-sito]');
        if (!box) return;
        const grafico = $('[data-commit-grafico]', box);
        const stato = $('[data-commit-stato]', box);
        const CACHE = 'oakvx-commit-sito-v1';
        let statici = null;
        try { statici = JSON.parse($('#commit-sito-dati')?.textContent || 'null'); } catch {}

        const disegna = (dati, live) => {
            const giorni = dati.giorni || {};
            const date = Object.keys(giorni).sort();
            if (!date.length) return;
            const primo = new Date(date[0] + 'T12:00:00');
            const oggi = new Date(); oggi.setHours(12, 0, 0, 0);
            const max = Math.max(...Object.values(giorni));
            const frag = document.createDocumentFragment();
            let n = 0;
            for (const d = new Date(primo); d <= oggi; d.setDate(d.getDate() + 1)) {
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const c = giorni[k] || 0;
                const bar = document.createElement('span');
                bar.className = 'cantiere__barra' + (c ? '' : ' vuota');
                bar.style.setProperty('--h', c ? Math.max(.04, c / max).toFixed(3) : 0);
                bar.style.setProperty('--i', n++);
                if (c) bar.title = t('commitDay')(c, dataBreve(k));
                frag.append(bar);
            }
            grafico.replaceChildren(frag);
            const record = Object.entries(giorni).sort((a, b) => b[1] - a[1])[0];
            const set = (sel, v) => { const el = $(sel, box); if (el) el.textContent = v; };
            set('[data-commit-totale]', dati.totale.toLocaleString(t('locale')));
            set('[data-commit-primo]', dataBreve(date[0]));
            set('[data-commit-da]', dataBreve(date[0]));
            set('[data-commit-giorni]', String(date.length));
            set('[data-commit-record]', `${record[1]} · ${dataBreve(record[0])}`);
            if (dati.ultimo) set('[data-commit-ultimo]', dati.ultimo);
            grafico.setAttribute('aria-label', t('commitChart')(dati.totale, date.length));
            if (stato) stato.textContent = live === true ? t('commitLive') : live === false ? t('commitOffline') : '';
            dispatchEvent(new CustomEvent('nero:commit', { detail: dati }));
        };

        const leggi = async () => {
            const giorni = {};
            let totale = 0, ultimo = '';
            for (let page = 1; page <= 10; page++) {
                const res = await fetch(`https://api.github.com/repos/oakvx/oakvx.github.io/commits?per_page=100&page=${page}`, { headers: { Accept: 'application/vnd.github+json' } });
                if (!res.ok) throw new Error('GitHub ' + res.status);
                const lista = await res.json();
                if (page === 1 && lista[0]) ultimo = lista[0].commit.message.split('\n')[0];
                for (const c of lista) {
                    const quando = new Date(c.commit.author?.date || c.commit.committer?.date);
                    const k = `${quando.getFullYear()}-${String(quando.getMonth() + 1).padStart(2, '0')}-${String(quando.getDate()).padStart(2, '0')}`;
                    giorni[k] = (giorni[k] || 0) + 1;
                }
                totale += lista.length;
                if (lista.length < 100) break;
            }
            return { totale, giorni, ultimo };
        };

        if (statici) disegna(statici);
        if ('IntersectionObserver' in window) {
            const vis = new IntersectionObserver(([e]) => { if (e.isIntersecting) { box.classList.add('visto-grafico'); vis.disconnect(); } }, { threshold: .2 });
            vis.observe(grafico);
        } else box.classList.add('visto-grafico');
        let cache = null;
        try { cache = JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch {}
        if (cache && Date.now() - cache.quando < 3600e3) { disegna(cache.dati, true); return; }
        const parti = () => leggi()
            .then(dati => {
                disegna(dati, true);
                try { localStorage.setItem(CACHE, JSON.stringify({ quando: Date.now(), dati })); } catch {}
            })
            .catch(() => { if (cache) disegna(cache.dati, false); else if (stato) stato.textContent = t('commitOffline'); });
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); parti(); } }, { rootMargin: '600px' });
            io.observe(box);
        } else parti();
    }

    /* ----------------------------------------------------------------------
       Profili social: conteggi da assets/social/social.json (scritto ogni ora
       dalla GitHub Action) e contenuti scelti in assets/social/scelte.json.
       ---------------------------------------------------------------------- */
    function fa(iso) {
        const min = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
        if (min < 1) return t('now');
        const [n, u] = min < 60 ? [min, 'm'] : min < 2880 ? [Math.round(min / 60), 'h'] : [Math.round(min / 1440), 'd'];
        return t('ago')(n, t('units')[u][n === 1 ? 0 : 1]);
    }

    function contaFino(el, valore) {
        const fmt = v => Math.round(v).toLocaleString(t('locale'));
        if (calm() || !('IntersectionObserver' in window)) { el.textContent = fmt(valore); return; }
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const step = now => {
                const p = Math.min(1, (now - start) / 1400);
                el.textContent = fmt(valore * (1 - Math.pow(1 - p, 4)));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
        io.observe(el);
    }

    async function initSocial() {
        const box = $('[data-social]');
        if (!box) return;
        const base = new URL('assets/social/', new URL($('script[src*="nero/nero.js"]').src, location.href).href.replace(/assets\/nero\/nero\.js.*$/, ''));
        let dati = {}, scelte = {};
        try { dati = (await (await fetch(new URL('social.json', base), { cache: 'no-cache' })).json()).account || {}; } catch {}
        try { scelte = await (await fetch(new URL('scelte.json', base), { cache: 'no-cache' })).json(); } catch {}
        // conteggi scritti a mano (Instagram): valgono solo se c'è il numero di follower
        try {
            const manuale = await (await fetch(new URL('manuale.json', base), { cache: 'no-cache' })).json();
            for (const [chiave, v] of Object.entries(manuale)) {
                if (!v || typeof v !== 'object' || v.follower == null) continue;
                const [piattaforma, handle] = chiave.split(':');
                dati[chiave] = { piattaforma, handle, ...(dati[chiave] || {}), ...v, aggiornato: v.aggiornato ? v.aggiornato + 'T12:00:00' : null, storia: dati[chiave]?.storia || [] };
            }
        } catch {}
        const asset = p => new URL(p.replace(/^assets\/social\//, ''), base).href;

        $$('.profilo', box).forEach(card => {
            // una card senza nessun conteggio disponibile resta nascosta
            if (!$$('[data-scegli]', card).some(b => dati[b.dataset.scegli]?.follower != null)) { card.hidden = true; return; }
            const campo = k => $(`[data-campo-profilo="${k}"]`, card);
            const mostra = chiave => {
                const [piattaforma, handle] = chiave.split(':');
                const a = dati[chiave] || {};
                card.dataset.account = chiave;
                $$('[data-scegli]', card).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scegli === chiave)));
                campo('nome').textContent = a.nome || handle;
                campo('handle').textContent = '@' + handle;
                campo('link').href = piattaforma === 'instagram' ? `https://www.instagram.com/${handle}/` : `https://www.tiktok.com/@${handle}`;
                if (a.follower != null) contaFino(campo('follower'), a.follower); else campo('follower').textContent = '—';
                const pezzi = piattaforma === 'instagram'
                    ? [[a.seguiti, t('following')], [a.post, t('posts')]]
                    : [[a.seguiti, t('following')], [a.miPiace, t('likes')], [a.video, t('videos')]];
                campo('dati').replaceChildren(...pezzi.filter(([v]) => v != null).map(([v, l]) => {
                    const s = document.createElement('span');
                    const b = document.createElement('b');
                    b.textContent = v.toLocaleString(t('locale'));
                    s.append(b, ' ' + l);
                    return s;
                }));
                if (a.privato) { const s = document.createElement('span'); s.textContent = t('private'); campo('dati').append(s); }
                campo('stato').textContent = a.aggiornato ? t('changed')(fa(a.aggiornato)) : t('waiting');
                // andamento dei follower
                const storia = (a.storia || []).map(([q, v]) => [new Date(q).getTime(), v]);
                const path = $('.profilo__storia path', card);
                if (storia.length > 1) {
                    const t0 = storia[0][0], t1 = Math.max(Date.now(), storia.at(-1)[0]);
                    const vs = storia.map(p => p[1]), lo = Math.min(...vs), hi = Math.max(...vs);
                    const x = q => ((q - t0) / (t1 - t0 || 1)) * 100;
                    const y = v => 38 - ((v - lo) / (hi - lo || 1)) * 30;
                    let d = `M0 ${y(storia[0][1]).toFixed(2)}`;
                    storia.forEach(([q, v], i) => { if (i) d += ` H${x(q).toFixed(2)} V${y(v).toFixed(2)}`; });
                    d += ` H100`;
                    path.setAttribute('d', d);
                } else path.setAttribute('d', '');
                // contenuti scelti
                const lista = scelte[chiave] || [];
                const sc = campo('scelte');
                sc.hidden = !lista.length;
                sc.replaceChildren(...lista.map(it => {
                    const el = document.createElement(it.link ? 'a' : 'figure');
                    el.className = 'profilo__scelta-contenuto';
                    if (it.link) { el.href = it.link; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
                    const img = new Image();
                    img.src = asset(it.immagine); img.alt = it.titolo || ''; img.loading = 'lazy';
                    const cap = document.createElement('span');
                    cap.className = 't-meta';
                    cap.textContent = [it.tipo, it.titolo].filter(Boolean).join(' · ');
                    el.append(img, cap);
                    return el;
                }));
            };
            $$('[data-scegli]', card).forEach(b => {
                const a = dati[b.dataset.scegli];
                const av = $('.profilo__avatar', b);
                if (a?.avatar) { av.textContent = ''; av.style.backgroundImage = `url("${asset(a.avatar)}")`; }
                b.addEventListener('click', () => mostra(b.dataset.scegli));
            });
            mostra(card.dataset.account);
        });
    }


    /* ----------------------------------------------------------------------
       Scroll morbido con inerzia (solo rotella, solo puntatore fine).
       Lo scroll resta quello nativo: tastiera, barra e ancore funzionano come sempre.
       ---------------------------------------------------------------------- */
    function initScorriMorbido() {
        if (!finePointer.matches) return;
        let target = scrollY, current = scrollY, raf = 0, attivo = false;
        const max = () => document.documentElement.scrollHeight - innerHeight;
        const loop = () => {
            current += (target - current) * .1;
            if (Math.abs(target - current) < .4) { current = target; raf = 0; attivo = false; }
            else raf = requestAnimationFrame(loop);
            window.scrollTo({ top: current, behavior: 'instant' });
        };
        addEventListener('wheel', e => {
            if (calm() || e.ctrlKey || e.defaultPrevented) return;
            if (root.classList.contains('indice-aperto') || root.classList.contains('ingresso-attivo')) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if (e.target.closest?.('.term__out, .profilo__scelte, dialog, textarea, select')) return;
            e.preventDefault();
            if (!attivo) current = target = scrollY;
            const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
            target = Math.max(0, Math.min(max(), target + d));
            attivo = true;
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: false });
        // tastiera, barra di scorrimento, ancore: si riparte da dove si trova davvero la pagina
        addEventListener('scroll', () => { if (!attivo) current = target = scrollY; }, { passive: true });
        addEventListener('keydown', () => { if (attivo) { cancelAnimationFrame(raf); raf = 0; attivo = false; } });
    }

    /* ----------------------------------------------------------------------
       Uscita dall'apertura: scorrendo, le lettere si separano a velocità diverse
       e la scultura arretra nel buio.
       ---------------------------------------------------------------------- */
    function initUscita() {
        const sec = $('.apertura');
        if (!sec) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            const p = calm() ? 0 : Math.min(1, Math.max(0, scrollY / (sec.offsetHeight * .85)));
            sec.style.setProperty('--uscita', p.toFixed(4));
        };
        addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        addEventListener('nero:movimento', update);
        update();
    }

    /* ----------------------------------------------------------------------
       Nastro: una riga di testo che scorre e si inclina con la velocità dello scroll.
       ---------------------------------------------------------------------- */
    function initNastro() {
        $$('[data-nastro]').forEach(box => {
            const riga = $('.nastro__riga', box);
            const pezzo = $('.nastro__pezzo', riga);
            if (!riga || !pezzo) return;
            // abbastanza copie da coprire due schermi
            const copie = Math.max(2, Math.ceil((innerWidth * 2) / Math.max(1, pezzo.offsetWidth)));
            for (let i = 1; i < copie; i++) riga.append(pezzo.cloneNode(true));
            let x = 0, v = 0, lastY = scrollY, raf = 0, visibile = false;
            const w = () => pezzo.offsetWidth;
            const loop = () => {
                const dy = scrollY - lastY;
                lastY = scrollY;
                v += (dy - v) * .12;
                x -= .45 + Math.abs(v) * .35;
                if (-x >= w()) x += w();
                const skew = Math.max(-14, Math.min(14, v * -.5));
                riga.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
                raf = visibile && !calm() && !document.hidden ? requestAnimationFrame(loop) : 0;
            };
            const kick = () => { if (!raf && visibile && !calm()) raf = requestAnimationFrame(loop); };
            quandoVisibile(box, () => { visibile = true; kick(); }, () => { visibile = false; });
            document.addEventListener('visibilitychange', kick);
            addEventListener('nero:movimento', () => { if (calm()) riga.style.transform = ''; else kick(); });
        });
    }


    /* ----------------------------------------------------------------------
       Numeri dal vivo nell'apertura: commit (dagli stessi dati della sezione
       "Questo sito"), follower TikTok (da social.json), ultimo commit.
       ---------------------------------------------------------------------- */
    function initVivi() {
        const box = $('.apertura__vivi');
        if (!box) return;
        const set = (k, v) => { const el = $(`[data-vivo="${k}"]`, box); if (el && v != null) el.textContent = v; };
        const commit = dati => {
            set('commit', dati.totale.toLocaleString(t('locale')));
            if (dati.ultimo) set('ultimo', dati.ultimo);
            const barre = $('[data-vivo="barre"]', box);
            const oggi = new Date(); oggi.setHours(12, 0, 0, 0);
            const giorni = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date(oggi); d.setDate(d.getDate() - i);
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                giorni.push(dati.giorni?.[k] || 0);
            }
            const max = Math.max(1, ...giorni);
            barre.replaceChildren(...giorni.map(n => { const i = document.createElement('i'); i.style.height = (n / max * 100).toFixed(1) + '%'; return i; }));
        };
        try { const s = JSON.parse($('#commit-sito-dati')?.textContent || 'null'); if (s) commit(s); } catch {}
        addEventListener('nero:commit', e => commit(e.detail));
        const base = new URL('assets/social/', new URL($('script[src*="nero/nero.js"]').src, location.href).href.replace(/assets\/nero\/nero\.js.*$/, ''));
        fetch(new URL('social.json', base), { cache: 'no-cache' })
            .then(r => r.json())
            .then(d => { const n = d.account?.['tiktok:oakvx.sh']?.follower; if (n != null) set('tiktok', n.toLocaleString(t('locale'))); })
            .catch(() => {});
    }

    function init() {
        initLingue();
        initOra();
        initScorrimento();
        initIndice();
        initMovimento();
        window.OAKVX?.proiettile?.avvia?.();
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
        initCommitSito();
        initVivi();
        initSocial();
        initScorriMorbido();
        initUscita();
        initNastro();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
