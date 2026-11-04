/* gl. — sito con tessere chiare (home e pagine interne). Nessuna libreria: tutto qui, una funzione per cosa.
   Le funzioni che servono solo alla home si accendono se trovano il loro markup. */
(() => {
    'use strict';

    const root = document.documentElement;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = t => t * t * (3 - 2 * t);
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const TAU = Math.PI * 2;
    const EMAIL = 'gabrielelucia07@gmail.com';
    document.addEventListener('visibilitychange', () => root.classList.toggle('is-background', document.hidden));
    const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = root.classList.contains('paused');
    const isCalm = () => paused || reduceMQ.matches;

    /* ----------------------------------------------------------------------
       Testi: l'italiano sta nell'HTML, qui l'inglese e le frasi dinamiche
       ---------------------------------------------------------------------- */
    const EN = {
"cta.channelTitle":"Email me.","cta.channelDescription":"It starts with an email.",

"channel.journey.title":"Journey","channel.journey.description":"The stops, from the start to today.","channel.projects.title":"Projects","channel.projects.description":"Ideas that became software.","channel.tools.title":"Toolkit","channel.tools.description":"Skills and small experiments.","channel.about.title":"About me","channel.about.description":"The person behind the code.","channel.contact.title":"Contact","channel.contact.description":"A new project starts here.","channel.after.title":"After hours","channel.after.description":"The things I do out of curiosity.","channel.menuLabel":"Portfolio channels","dock.label":"Channel controls","dock.open":"Open","dock.back":"Back","dock.openLabel":"Open the selected channel","dock.backLabel":"Back: to the previous page",

        skip: 'Skip to content',
        brandLabel: 'gl. Gabriele Lucia / oakvx, home',
        navLabel: 'Main navigation',
        langLabel: 'Language',
        menuLabel: 'Menu',
        'nav.path': 'Journey',
        'nav.projects': 'Projects',
        'nav.tools': 'Toolkit',
        'nav.about': 'About me',
        'nav.afterHours': 'After hours',
        'nav.cta': 'Email me',
        'nav.contact': 'Contact',
        'loader.label': 'Opening the portfolio',
        'loader.hint': 'do not shake',
        'hero.hello': 'Hi, I’m',
        'hero.place': 'Sassuolo, Italy',
        'hero.photoAlt': 'Gabriele Lucia’s animated avatar, standing in a light blue channel tile',
        'hero.shutter': 'Take it again',
        'avatar.changePose': 'Change avatar pose',
        'hero.role': 'Web development. <em>Design and interfaces.</em>',
        'hero.desc': 'I’m Gabriele, a developer and graphic designer from Sassuolo. I build web applications, social graphics and interfaces. I study Computer Engineering at UNIMORE.',
        'hero.write': 'Get in touch',
        'hero.copy': 'Copy my email',
        'stretch.label': 'Code plus design plus data equals Gabriele',
        'stretch.code': 'Code',
        'stretch.design': 'Design',
        'stretch.data': 'Data',
        'about.label': 'About me',
        'about.title': 'I got into programming <em>out of curiosity.</em>',
        'about.photoAlt': 'Gabriele Lucia’s animated avatar, sitting',
        'about.caption': 'me, sitting',
        'about.p1': 'I wanted to understand how software worked and try to build something of my own.',
        'about.p2': 'Over time I became more interested in problem solving: understanding what isn’t working, finding a solution and seeing the result in the program I’m building.',
        'about.punch': 'Code and design <b aria-hidden="true">→</b> <em>two sides of the same work.</em>',
        'about.f1': 'Base',
        'about.f1v': 'Sassuolo, Italy',
        'about.f2': 'Education',
        'about.f2v': 'IT & Telecommunications diploma',
        'about.f3': 'University',
        'about.f3v': 'Computer Engineering · UNIMORE',
        'about.story': 'My story',
        'journey.label': 'My journey',
        'journey.title': 'Every stop <em>rounds off a corner.</em>',
        'journey.intro': 'From school to university: websites for local businesses, an Erasmus in Seville, industrial automation.',
        'journey.now': 'today',
        'journey.s1': 'IT & Telecommunications · Sassuolo',
        'journey.s2t': 'Freelance web development',
        'journey.s2': 'Websites, interfaces and SEO for local businesses',
        'journey.s3d': 'may — jun 2025',
        'journey.s3t': 'Erasmus+ in Seville',
        'journey.s3': 'Starbotica · IT support and educational activities',
        'journey.s4d': 'aug — sep 2026',
        'journey.s4': 'Software and automation · PLC / SQL Server',
        'journey.s5': 'Computer Engineering',
        'work.title': 'My <em>repositories.</em>',
        'work.intro': 'All my public GitHub projects, gathered in a plaza. The bigger the crowd, the more active the repository.',
        'work.hint': 'Hover an icon · click a Mii to make it talk',
        'work.wip': 'work in progress',
        'work.r1k': 'Lyric video editor',
        'work.r1': 'Animates synced lyrics (LRC, TTML, SRT…) in the brat style and exports the video straight from the browser, no backend.',
        'work.r1a': 'Version 5.0: simple and advanced editor!',
        'work.r1b': 'Now it reads TTML, YAML and WebVTT too',
        'work.r1c': 'I export MP4 and WebM without a server',
        'work.r2k': 'Showcase website · demo',
        'work.r2': 'A showcase website template filled in for a made-up business: electric car accessories, in light and dark theme.',
        'work.r2a': 'Light theme and dark theme!',
        'work.r2b': 'Spinotto Felice isn’t real',
        'work.r2c': 'One template, reusable for any business',
        'work.r3n': 'This portfolio',
        'work.r3k': 'Personal website · oakvx.github.io',
        'work.r3': 'The site you’re looking at: a console-style theme, page transitions and no external libraries.',
        'work.r3a': 'You’re right here, in this plaza!',
        'work.r3b': 'No libraries: just HTML, CSS and JS',
        'work.r3c': 'Every Mii is drawn by code',
        'work.r4k': 'Landing page · unofficial website',
        'work.r4': 'A page for an ultralight flight school in Reggio Emilia, written in a single HTML file. Demo project.',
        'work.r4a': 'Flying over Reggio Emilia!',
        'work.r4b': 'All in one single HTML file',
        'work.r4c': 'Unofficial website, just a demo',
        'work.r5n': 'GitHub profile',
        'work.r5k': 'Profile README · oakvx',
        'work.r5': 'My profile page, inspired by an early-2010s console home screen. Just Markdown and images drawn from scratch.',
        'work.r5a': 'Welcome to my profile!',
        'work.r5b': 'Markdown only: no CSS, no JS',
        'work.r6k': 'Coming soon · freshly opened repository',
        'work.r6': 'A repository that’s still empty. For now the plaza is saving its spot.',
        'work.r6a': 'Something’s coming…',
        'work.r6b': 'Freshly created repository!',
        'desk.label': 'Tools of the trade',
        'desk.title': 'What I <em>do.</em>',
        'desk.intro': 'A small desktop: skills, frequently asked questions and a terminal that really answers.',
        'desk.hint': 'drag the windows by their title bar',
        'desk.m1': 'File',
        'desk.m2': 'Edit',
        'desk.m3': 'View',
        'desk.wall1': 'Code and design,',
        'desk.wall2': 'all in focus.',
        'desk.icons': 'Desktop icons',
        'desk.f.skills': 'skills.html',
        'desk.f.tools': 'tools',
        'desk.close.skills': 'Close skills.html',
        'desk.close.term': 'Close portfolio.sh',
        'desk.close.faq': 'Close FAQ.md',
        'desk.close.photo': 'Close gabriele.gif',
        'desk.close.tools': 'Close tools',
        'desk.kicker': 'Three areas of work',
        'desk.photoAlt': 'Gabriele Lucia’s animated avatar, dancing',
        'desk.items': '8 items',
        'skills.1t': 'Web development',
        'skills.1': 'Websites and web apps: interfaces, deployment and search engine indexing.',
        'skills.1b': 'SEO and deployment',
        'skills.1c': 'Business social pages',
        'skills.practice': 'in practice',
        'skills.1p': 'Sites for workshops, beauty salons and tool shops, from 2023 to 2026',
        'skills.cta': 'Let’s talk',
        'skills.back': 'develops in 10 minutes<br>do not shake',
        'skills.flip': 'Flip the card',
        'skills.2t': 'Backend and data',
        'skills.2': 'Server-side logic and relational databases, from CRUD to automation.',
        'skills.2c': 'T-SQL on SQL Server',
        'skills.3t': 'Design and interfaces',
        'skills.3': 'The visual side of my work, alongside software development.',
        'skills.3a': 'Social media content',
        'skills.3b': 'Interface design',
        'skills.3c': 'Animated text on Canvas',
        'skills.3p': 'Brat Animator, social pages',
        'skills.langs': 'Languages: Italian (native) · English C1 · Spanish B1 · Greek B1 · Chinese A2',
        'term.log': 'Terminal output',
        'term.identity': 'Junior developer & graphic designer.\nSassuolo, Italy.\nComputer Engineering @ UNIMORE.',
        'term.start': 'Type help to get started.',
        'term.input': 'Terminal command',
        'term.run': 'Run command',
        'term.commands': 'Quick commands',
        faq: '<h4># Where are you based?</h4><p>In Sassuolo, in the province of Modena, Italy.</p><hr><h4># What do you study?</h4><p>Computer Engineering at the University of Modena and Reggio Emilia (UNIMORE).</p><hr><h4># Which languages do you speak?</h4><p>Italian (native), English C1, Spanish B1, Greek B1, Chinese A2.</p><hr><h4># Have you worked abroad?</h4><p>Yes: in May and June 2025, on Erasmus+, at Starbotica in Seville. IT support and educational activities, in English and Spanish.</p><hr><h4># What do you work with?</h4><p>HTML, CSS, JavaScript, Node.js, PHP, PostgreSQL, MySQL, T-SQL and Git.</p><hr><h4># And outside work?</h4><p>I enjoy exploring new technologies, experimenting with personal projects and learning foreign languages.</p><hr><h4># How do I reach you?</h4><p>Email me at <a href="mailto:gabrielelucia07@gmail.com">gabrielelucia07@gmail.com</a>.</p>',
        'cta.label': 'Contact',
        'cta.title': 'Got a project to <em>bring into focus?</em>',
        'cta.intro': 'Drop me a line and let’s continue by email.',
        'cta.channel': 'Send me an email',
        'cta.channelLabel': '[ email me ]',
        'cta.copy': 'Copy email',
        'foot.navLabel': 'Footer links',
        'foot.credits': 'Credits',
        'foot.design': 'Design by',
        'foot.top': 'Back to top'
    };
    /* Le pagine interne caricano pages-en.js: il loro inglese si aggiunge senza toccare quello della home */
    if (window.OAKVX_EN) for (const k in window.OAKVX_EN) if (!(k in EN)) EN[k] = window.OAKVX_EN[k];

    const DYN = {
        it: {
            title: 'Gabriele Lucia (oakvx) | Developer e Graphic Designer',
            description: 'Gabriele Lucia, developer e graphic designer a Sassuolo. Applicazioni web, grafica per social e interfacce. Studio Ingegneria Informatica a UNIMORE.',
            pause: 'Ferma animazioni',
            resume: 'Riprendi animazioni',
            menuOpen: 'Apri menu',
            menuClose: 'Chiudi menu',
            copied: 'Email copiata.',
            copyFail: 'Copia non riuscita: l’indirizzo è gabrielelucia07@gmail.com',
            help: 'help     Tutti i comandi\nwhoami   Chi sono\nls       Progetti\nskills   Tecnologie e competenze\nemail    Il mio indirizzo email\ngithub   Il mio profilo GitHub\nclear    Pulisci il terminale',
            identity: 'Junior developer & graphic designer.\nSassuolo, Italia.\nIngegneria Informatica @ UNIMORE.',
            skills: 'Web         HTML / CSS / JavaScript\nBackend     Node.js / PHP\nDati        PostgreSQL / MySQL / T-SQL\nGrafica     Social / interfacce\nAutomazione PLC / SQL Server',
            unknown: 'Comando non trovato. Digita help.',
            projects: 'Progetti:',
            locale: 'it-IT'
        },
        en: {
            title: 'Gabriele Lucia (oakvx) | Developer & Graphic Designer',
            description: 'Gabriele Lucia, developer and graphic designer in Sassuolo, Italy. Web applications, social graphics and interfaces. Computer Engineering student at UNIMORE.',
            pause: 'Pause animations',
            resume: 'Resume animations',
            menuOpen: 'Open menu',
            menuClose: 'Close menu',
            copied: 'Email copied.',
            copyFail: 'Copy failed: the address is gabrielelucia07@gmail.com',
            help: 'help     All commands\nwhoami   About me\nls       Projects\nskills   Technologies and skills\nemail    My email address\ngithub   My GitHub profile\nclear    Clear the terminal',
            identity: 'Junior developer & graphic designer.\nSassuolo, Italy.\nComputer Engineering @ UNIMORE.',
            skills: 'Web         HTML / CSS / JavaScript\nBackend     Node.js / PHP\nData        PostgreSQL / MySQL / T-SQL\nDesign      Social / interfaces\nAutomation  PLC / SQL Server',
            unknown: 'Command not found. Type help.',
            projects: 'Projects:',
            locale: 'en-GB'
        }
    };

    let lang = root.dataset.lang === 'en' ? 'en' : 'it';
    const t = key => DYN[lang][key] ?? key;
    const originals = new WeakMap();
    const keep = (el, slot, value) => {
        let o = originals.get(el);
        if (!o) originals.set(el, o = {});
        if (!(slot in o)) o[slot] = value;
        return o[slot];
    };
    const onLang = [];
    /* Le pagine interne portano titolo, descrizione e anteprime social nelle due lingue in un blocco JSON */
    let SEO = null;
    try {
        SEO = JSON.parse(document.getElementById('seo-translations')?.textContent || 'null');
    } catch {}

    function applyLang(next, save) {
        lang = next;
        root.lang = next;
        root.dataset.lang = next;
        const en = next === 'en';
        $$('[data-i18n]').forEach(el => {
            const it = keep(el, 'text', el.textContent);
            const v = EN[el.dataset.i18n];
            el.textContent = en && v != null ? v : it;
        });
        $$('[data-i18n-html]').forEach(el => {
            const it = keep(el, 'html', el.innerHTML);
            const v = EN[el.dataset.i18nHtml];
            el.innerHTML = en && v != null ? v : it;
        });
        $$('[data-i18n-aria]').forEach(el => {
            const it = keep(el, 'aria', el.getAttribute('aria-label'));
            const v = EN[el.dataset.i18nAria];
            el.setAttribute('aria-label', en && v != null ? v : it);
        });
        $$('[data-i18n-alt]').forEach(el => {
            const it = keep(el, 'alt', el.getAttribute('alt'));
            const v = EN[el.dataset.i18nAlt];
            el.setAttribute('alt', en && v != null ? v : it);
        });
        $$('[data-langlink]').forEach(a => {
            const base = keep(a, 'href', a.getAttribute('href'));
            if (!en) return a.setAttribute('href', base);
            const [path, hash] = base.split('#');
            a.setAttribute('href', `${path}?lang=en${hash ? `#${hash}` : ''}`);
        });
        $$('button[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === next)));
        const seo = SEO && SEO[next];
        if (seo) {
            document.title = seo.title;
            $('meta[name="description"]')?.setAttribute('content', seo.description);
            $('link[rel="canonical"]')?.setAttribute('href', seo.canonical);
            for (const [attr, prefix] of [['property', 'og'], ['name', 'twitter']]) {
                for (const key of ['title', 'description', 'image']) $(`meta[${attr}="${prefix}:${key}"]`)?.setAttribute('content', seo[key]);
                $(`meta[${attr}="${prefix}:image:alt"]`)?.setAttribute('content', seo.image_alt);
            }
            $('meta[property="og:url"]')?.setAttribute('content', seo.canonical);
            $('meta[property="og:locale"]')?.setAttribute('content', en ? 'en_GB' : 'it_IT');
        } else {
            document.title = t('title');
            $('meta[name="description"]')?.setAttribute('content', t('description'));
        }
        root.classList.remove('i18n-pending');
        if (save) {
            try {
                localStorage.setItem('lang', next);
            } catch {}
            const url = new URL(location.href);
            if (en) url.searchParams.set('lang', 'en');
            else url.searchParams.delete('lang');
            history.replaceState(history.state, '', url);
        }
        onLang.forEach(fn => fn());
    }

    /* ----------------------------------------------------------------------
       Scorrimento e ridimensionamento: un solo ascoltatore per tutti
       ---------------------------------------------------------------------- */
    const onScroll = [];
    const onResize = [];
    let ticking = false;
    addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            onScroll.forEach(fn => fn());
        });
    }, {
        passive: true
    });
    let resizeTimer;
    addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => onResize.forEach(fn => fn()), 120);
    });
    const hdrH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 73;

    function measureHeader() {
        const h = $('[data-header]')?.offsetHeight;
        if (h && root.style.getPropertyValue('--hdr') !== `${h}px`) root.style.setProperty('--hdr', `${h}px`);
    }

    /* ----------------------------------------------------------------------
       Geometria: un poligono regolare che rotola e diventa un cerchio
       ---------------------------------------------------------------------- */
    const nEff = nf => {
        const base = Math.floor(nf);
        return base + smooth(clamp((nf - base - .25) / .5));
    };
    const gd = x => Math.atan(Math.sinh(x));

    // raggio del poligono (lati nf, apotema a, raggio R) nella direzione psi; 0 = verso il basso
    function shapeR(psi, n, a, R, circT) {
        const per = TAU / n;
        const u = psi - per * Math.round(psi / per);
        const r = a / Math.cos(u);
        return r + (R - r) * circT;
    }

    function shapePoints(n, a, R, circT, steps) {
        const pts = [];
        for (let i = 0; i < steps; i++) {
            const psi = -Math.PI + TAU * i / steps;
            const r = shapeR(psi, n, a, R, circT);
            pts.push([r * Math.sin(psi), r * Math.cos(psi)]);
        }
        return pts;
    }

    const toPath = pts => `M${pts.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;

    /* ----------------------------------------------------------------------
       Orologio di Sassuolo, data della scrivania e timbro della Polaroid
       ---------------------------------------------------------------------- */
    function initClock() {
        const full = $$('[data-clock]');
        const short = $$('[data-clock-short]');
        const dDate = $('[data-desk-date]');
        const dTime = $('[data-desk-time]');
        const offsetFmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Rome',
            timeZoneName: 'shortOffset'
        });
        const tick = () => {
            const now = new Date();
            const time = new Intl.DateTimeFormat('it-IT', {
                timeZone: 'Europe/Rome',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(now);
            const off = offsetFmt.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'GMT+1';
            full.forEach(el => el.textContent = `Sassuolo · ${time} ${off}`);
            short.forEach(el => el.textContent = time.slice(0, 5));
            if (dTime) dTime.textContent = time.slice(0, 5);
            if (dDate) dDate.textContent = new Intl.DateTimeFormat(t('locale'), {
                timeZone: 'Europe/Rome',
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            }).format(now).replace(/\./g, '');
        };
        tick();
        setInterval(tick, 1000);
        onLang.push(tick);
    }

    function stampText() {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Rome',
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date()).map(p => [p.type, p.value]));
        return `'${parts.year} ${parts.month} ${parts.day}`;
    }

    /* ----------------------------------------------------------------------
       Email, avviso, menu, pausa
       ---------------------------------------------------------------------- */
    const toastEl = $('[data-toast]');
    let toastTimer;

    function toast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
    }

    async function copyEmail(input, notify = true) {
        const address = typeof input === 'string' ? input : EMAIL;
        const host = document.activeElement?.closest('dialog[open]') || document.body;
        const feedback = ok => {
            const message = ok ? t('copied') : t('copyFail');
            if (notify) toast(message);
            return { ok, message };
        };
        try {
            await navigator.clipboard.writeText(address);
            return feedback(true);
        } catch {
            const field = document.createElement('textarea');
            field.value = address;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
            const active = document.activeElement;
            host.append(field);
            field.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch {}
            field.remove();
            active?.focus({ preventScroll: true });
            return feedback(ok);
        }
    }
    window.portfolioActions = Object.freeze({ copyEmail });

    function initMenu() {
        const btn = $('[data-burger]');
        const menu = $('[data-menu]');
        const label = $('[data-burger-label]');
        if (!btn || !menu) return;
        const set = open => {
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
            root.classList.toggle('menu-open', open);
            label.textContent = t(open ? 'menuClose' : 'menuOpen');
            if (open) $('a', menu)?.focus();
        };
        btn.addEventListener('click', () => set(menu.hidden));
        menu.addEventListener('click', e => {
            if (e.target.closest('a')) set(false);
        });
        addEventListener('keydown', e => {
            if (e.key === 'Escape' && !menu.hidden && !document.querySelector('dialog[open]')) {
                set(false);
                btn.focus();
            }
        });
        matchMedia('(min-width: 1200px)').addEventListener('change', e => {
            if (e.matches) set(false);
        });
        onLang.push(() => label.textContent = t(menu.hidden ? 'menuOpen' : 'menuClose'));
        label.textContent = t('menuOpen');
    }

    const onCalm = [];

    function initMotion() {
        const btn = $('[data-motion]');
        const label = $('[data-motion-label]');
        if (!btn || !label) {
            root.classList.toggle('calm', isCalm());
            return;
        }
        const sync = () => {
            root.classList.toggle('paused', paused);
            root.classList.toggle('calm', isCalm());
            btn.setAttribute('aria-pressed', String(paused));
            label.textContent = t(paused ? 'resume' : 'pause');
            btn.title = label.textContent;
        };
        btn.addEventListener('click', () => {
            paused = !paused;
            try {
                localStorage.setItem('motion', paused ? 'paused' : 'on');
            } catch {}
            sync();
            onCalm.forEach(fn => fn());
        });
        reduceMQ.addEventListener('change', () => {
            sync();
            onCalm.forEach(fn => fn());
        });
        onLang.push(sync);
        sync();
    }

    /* ----------------------------------------------------------------------
       Caricamento: conta fino a 100 e si apre in due
       ---------------------------------------------------------------------- */
    function runLoader(done) {
        const el = $('[data-loader]');
        if (!el || !root.classList.contains('has-loader') || isCalm()) {
            el?.remove(); root.classList.remove('has-loader'); done(); return;
        }
        try { sessionStorage.setItem('gl-loader', '1'); } catch {}
        const finish = () => {
            el.classList.add('is-out'); root.classList.remove('has-loader'); done();
            el.addEventListener('transitionend', () => el.remove(), { once: true });
            if (isCalm()) el.remove();
        };
        (document.fonts?.ready || Promise.resolve()).then(finish);
    }

    function initHero() {
        const shot = $('[data-hero-shot]');
        const eject = $('[data-eject]', shot);
        const print = $('[data-print]', shot);
        const photo = $('.print__photo', print);
        const stamp = $('[data-stamp]', print);
        const img = $('img', photo);
        const name = $('.name');
        let tileAnimation;
        stamp.textContent = stampText();
        const popTile = () => {
            tileAnimation?.cancel();
            eject.classList.remove('is-clipped');
            if (isCalm() || document.hidden) return;
            tileAnimation = print.animate([
                { opacity: .4, transform: 'translateY(12px) scale(.92)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ], { duration: parseFloat(getComputedStyle(root).getPropertyValue('--dur-3'))*1000, easing: getComputedStyle(root).getPropertyValue('--spring').trim() });
        };
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) tileAnimation?.cancel();
        });

        let started = false;
        const start = () => {
            if (started) return;
            started = true;
            root.classList.add('hero-on');
            popTile();
        };
        const ready = img.complete ? Promise.resolve() : (img.decode?.() ?? Promise.resolve()).catch(() => {});
        heroStart = () => Promise.race([ready, new Promise(r => setTimeout(r, 1800))]).then(start);

        $('[data-shutter]').addEventListener('click', () => {
            stamp.textContent = stampText();
            popTile();
        });
        onCalm.push(() => {
            if (isCalm()) popTile();
        });

    }
    let heroStart = () => Promise.resolve();

    /* ----------------------------------------------------------------------
       Codice + Grafica + Dati = Gabriele: le parole si allargano entrando
       ---------------------------------------------------------------------- */
    function initStretch() {
        const row = $('[data-stretch]');
        if (!row) return;
        const words = $$(':scope > span', row);
        let deltas = [];
        const measure = () => {
            words.forEach(w => w.style.transform = '');
            const total = row.clientWidth;
            const widths = words.map(w => w.offsetWidth);
            const gap = parseFloat(getComputedStyle(row).fontSize) * .28;
            const packed = widths.reduce((s, w) => s + w, 0) + gap * (words.length - 1);
            let x = (total - packed) / 2;
            deltas = words.map((w, i) => {
                const d = x - w.offsetLeft;
                x += widths[i] + gap;
                return d;
            });
            update();
        };
        const update = () => {
            if (isCalm()) {
                words.forEach(w => w.style.transform = '');
                return;
            }
            const r = row.getBoundingClientRect();
            const p = clamp((innerHeight - r.top) / (innerHeight * .75));
            const s = 1 - easeOut(p);
            words.forEach((w, i) => w.style.transform = `translate3d(${(deltas[i] * s).toFixed(1)}px,0,0)`);
        };
        onScroll.push(update);
        onResize.push(measure);
        onLang.push(measure);
        onCalm.push(update);
        document.fonts?.ready.then(measure);
        measure();
    }

    /* ----------------------------------------------------------------------
       Comparse
       ---------------------------------------------------------------------- */
    function initReveal() {
        const items = $$('[data-reveal]');
        if (!('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('is-in'));
        const groups = new Map();
        items.forEach(el => {
            const n = groups.get(el.parentElement) || 0;
            groups.set(el.parentElement, n + 1);
            el.style.setProperty('--rd', 'calc('+(n % 4)+' * var(--dur-1) / 4)');
        });
        const io = new IntersectionObserver(entries => entries.forEach(en => {
            if (!en.isIntersecting) return;
            en.target.classList.add('is-in');
            io.unobserve(en.target);
        }), {
            rootMargin: '0px 0px -8% 0px',
            threshold: .1
        });
        // Read all positions together before changing reveal classes.
        const positions = items.map(el => el.getBoundingClientRect());
        items.forEach((el, index) => {
            const r = positions[index];
            if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
            else io.observe(el);
        });
    }

    function initCurrentNav() {
        const links = $$('.hdr__nav a[href^="#"]');
        const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
        const io = new IntersectionObserver(entries => entries.forEach(en => {
            const a = map.get(en.target.id);
            if (a) a.classList.toggle('is-current', en.isIntersecting);
        }), {
            rootMargin: '-45% 0px -50% 0px'
        });
        map.forEach((_, id) => {
            const s = document.getElementById(id);
            if (s) io.observe(s);
        });
    }

    /* ----------------------------------------------------------------------
       4 · Percorso: tappe e indicatore di visibilità
       ---------------------------------------------------------------------- */
    function initJourney() {
        const stops = $$('[data-journey] .stop');
        if (!('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            entry.target.classList.toggle('is-on', entry.isIntersecting);
        }), { threshold: .55 });
        stops.forEach((stop, index) => { stop.style.setProperty('--stop-index', index); observer.observe(stop); });
    }

    function initWork() {
        const section = $('[data-work]');
        const list = $('[data-work-list]');
        if (!section || !list || section.hasAttribute('data-plaza')) return;
        const items = $$('[data-proj]', section);
        const previous = $('[data-work-prev]', section), next = $('[data-work-next]', section), count = $('[data-work-count]', section);
        const step = () => (items[1]?.offsetLeft || 0) - (items[0]?.offsetLeft || 0) || list.clientWidth;
        const update = () => {
            const i = clamp(Math.round(list.scrollLeft / step()), 0, items.length - 1);
            count.textContent = `${String(i+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
            previous.disabled = list.scrollLeft < 4;
            next.disabled = list.scrollLeft >= list.scrollWidth - list.clientWidth - 4;
        };
        previous.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: isCalm() ? 'auto' : 'smooth' }));
        next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: isCalm() ? 'auto' : 'smooth' }));
        list.addEventListener('scroll', update, { passive: true });
        onResize.push(update); update();
    }

    function initDesk() {
        const screen = $('[data-desk]');
        if (!screen) return;
        const wins = $$('[data-win]', screen);
        const icons = $$('[data-open]', screen);
        const byName = name => wins.find(w => w.dataset.win === name);
        const mq = matchMedia('(min-width: 1240px)');
        let z = 10,
            floating = false,
            first = true;

        const front = w => {
            w.style.zIndex = String(++z);
            wins.forEach(o => o.classList.toggle('is-front', o === w));
        };
        const syncIcons = () => icons.forEach(b => b.classList.toggle('is-open', !byName(b.dataset.open).hidden));

        const setFloating = () => {
            floating = mq.matches;
            screen.classList.toggle('is-floating', floating);
            if (floating && first) {
                first = false;
                byName('tools').hidden = true;
                front(byName('skills'));
            }
            if (!floating) wins.forEach(w => {
                w.hidden = false;
                w.style.left = w.style.top = w.style.zIndex = '';
            });
            syncIcons();
        };

        screen.addEventListener('pointerdown', e => {
            const win = e.target.closest('[data-win]');
            if (!win || !floating) return;
            front(win);
            const bar = e.target.closest('[data-drag]');
            if (!bar || e.target.closest('button') || e.button > 0) return;
            e.preventDefault();
            const sr = screen.getBoundingClientRect();
            const wr = win.getBoundingClientRect();
            const ox = e.clientX - wr.left;
            const oy = e.clientY - wr.top;
            bar.setPointerCapture(e.pointerId);
            win.classList.add('is-dragging');
            const move = ev => {
                const x = clamp(ev.clientX - sr.left - ox, 90 - wr.width, sr.width - 90);
                const y = clamp(ev.clientY - sr.top - oy, 30, sr.height - 40);
                win.style.left = `${(x / sr.width * 100).toFixed(2)}%`;
                win.style.top = `${(y / sr.height * 100).toFixed(2)}%`;
            };
            const up = () => {
                bar.removeEventListener('pointermove', move);
                bar.removeEventListener('pointerup', up);
                bar.removeEventListener('pointercancel', up);
                win.classList.remove('is-dragging');
            };
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
            bar.addEventListener('pointercancel', up);
        });

        const close = w => {
            w.hidden = true;
            syncIcons();
            icons.find(b => b.dataset.open === w.dataset.win)?.focus();
        };
        screen.addEventListener('click', e => {
            const x = e.target.closest('[data-close]');
            if (x) close(x.closest('[data-win]'));
            const icon = e.target.closest('[data-open]');
            if (icon) {
                const w = byName(icon.dataset.open);
                w.hidden = false;
                front(w);
                w.focus({
                    preventScroll: true
                });
                syncIcons();
            }
            const flip = e.target.closest('[data-flip]');
            if (flip) {
                const card = flip.closest('.card');
                const on = card.classList.toggle('is-flipped');
                flip.setAttribute('aria-pressed', String(on));
            }
        });
        screen.addEventListener('keydown', e => {
            if (e.key !== 'Escape' || !floating) return;
            const w = e.target.closest('[data-win]');
            if (w) close(w);
        });

        mq.addEventListener('change', setFloating);
        setFloating();
        initTerminal();
    }

    function initTerminal() {
        const out = $('[data-term-out]');
        const form = $('[data-term-form]');
        if (!out || !form) return;
        const input = $('input', form);
        const history = [];
        let hIndex = 0;
        const line = (text, cls = '') => {
            const p = document.createElement('p');
            p.textContent = text;
            if (cls) p.className = cls;
            out.append(p);
        };
        const link = (label, href) => {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.textContent = label;
            a.href = href;
            if (href.startsWith('https:')) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            p.append(a);
            out.append(p);
        };
        const q = () => lang === 'en' ? '?lang=en' : '';
        const run = raw => {
            const cmd = raw.trim().toLowerCase();
            if (!cmd) return;
            if (cmd === 'clear') return out.replaceChildren();
            const p = document.createElement('p');
            p.className = 'term__prompt';
            p.innerHTML = '<b>oakvx@portfolio</b>:~ $ ';
            p.append(document.createTextNode(raw.trim()));
            out.append(p);
            switch (cmd) {
                case 'help':
                    line(t('help'));
                    break;
                case 'whoami':
                    line('Gabriele Lucia');
                    line(t('identity'));
                    break;
                case 'skills':
                    line(t('skills'));
                    break;
                case 'email':
                    link(EMAIL, `mailto:${EMAIL}`);
                    break;
                case 'ls':
                    line(t('projects'));
                    link('01  Brat Animator ↗', `projects/brat-animator/${q()}`);
                    link('02  Synk ↗', `projects/synk/${q()}`);
                    link('03  Beautify ↗', `projects/beautify/${q()}`);
                    break;
                case 'github':
                    link('github.com/oakvx ↗', 'https://github.com/oakvx');
                    break;
                case 'sudo make coffee':
                case 'coffee':
                case 'caffe':
                case 'caffè':
                    line(lang === 'en' ? '☕  418 I’m a teapot. Ask Gabriele in person.' : '☕  418 Sono una teiera. Chiedilo a Gabriele di persona.');
                    break;
                default:
                    line(t('unknown'));
            }
            while (out.children.length > 80) out.firstElementChild.remove();
            out.scrollTop = out.scrollHeight;
        };
        form.addEventListener('submit', e => {
            e.preventDefault();
            const v = input.value;
            if (v.trim()) {
                history.push(v);
                hIndex = history.length;
            }
            run(v);
            input.value = '';
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp' && history.length) {
                hIndex = Math.max(0, hIndex - 1);
                input.value = history[hIndex];
                e.preventDefault();
            } else if (e.key === 'ArrowDown' && history.length) {
                hIndex = Math.min(history.length, hIndex + 1);
                input.value = history[hIndex] ?? '';
                e.preventDefault();
            }
        });
        $$('[data-cmd]').forEach(b => b.addEventListener('click', () => run(b.dataset.cmd)));
    }

    /* ----------------------------------------------------------------------
       7 · Marchio del piè di pagina
       ---------------------------------------------------------------------- */
    function initMark() {
        const mark = $('[data-mark]');
        if (!mark) return;
        const path = $('[data-mark-o]', mark);
        const R = 50;
        let raf = 0,
            visible = false,
            t0 = performance.now();
        const shapeAt = phase => {
            // 0 → .5 si arrotonda, .5 → .72 resta «o», .72 → 1 torna quadrato
            let m;
            if (phase < .5) m = smooth(phase / .5);
            else if (phase < .72) m = 1;
            else m = 1 - smooth((phase - .72) / .28);
            const n = nEff(4 + 8 * smooth(clamp(m / .8)));
            const circT = smooth(clamp((m - .7) / .3));
            const a = R * Math.cos(Math.PI / n);
            const spin = (1 - circT) * (phase * 360);
            path.setAttribute('d', toPath(shapePoints(n, a, R, circT, 160)));
            path.setAttribute('transform', `rotate(${spin.toFixed(2)})`);
        };
        const frame = now => {
            raf = 0;
            if (!visible || isCalm()) return;
            shapeAt(((now - t0) / 9000) % 1);
            raf = requestAnimationFrame(frame);
        };
        const kick = () => {
            if (isCalm()) return shapeAt(.6);
            if (visible && !raf) raf = requestAnimationFrame(frame);
        };
        new IntersectionObserver(([en]) => {
            visible = en.isIntersecting;
            kick();
        }).observe(mark);
        onCalm.push(kick);
        shapeAt(.6);
    }

    /* ----------------------------------------------------------------------
       Avvio
       ---------------------------------------------------------------------- */
    function init() {
        measureHeader();
        onResize.push(measureHeader);
        if (lang === 'en') applyLang('en', false);
        else root.classList.remove('i18n-pending');

        $$('button[data-lang]').forEach(b => b.addEventListener('click', () => {
            if (b.dataset.lang !== lang) applyLang(b.dataset.lang, true);
        }));
        $$('[data-copy-email]').forEach(b => b.addEventListener('click', copyEmail));

        /* Testata, menu, orologio, lingua, piè di pagina e comparse sono di tutte le pagine;
           hero, percorso, progetti, scrivania e contatti esistono solo nella home. */
        const isHome = !!$('[data-hero-shot]');
        initClock();
        initMenu();
        initMotion();
        if (isHome) {
            initHero();
            initStretch();
            initJourney();
            initWork();
            initDesk();
        }
        initMark();
        initCurrentNav();
        root.classList.add('ready');
        initReveal();
        runLoader(() => {
            if (isHome) heroStart();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
