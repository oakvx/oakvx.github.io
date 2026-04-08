(() => {
    'use strict';
    const reduced = window.matchMedia?.('(prefers-reduced-motion:reduce)')?.matches ?? false;
    const desktopHeavy = (window.innerWidth || 0) >= 1100;

    /* ═══════════════════════════════════════════ CURSOR */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mx = 0,
        my = 0,
        fx = 0,
        fy = 0;

    if (cursor && follower && !reduced && desktopHeavy) {
        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
        });
        const tick = () => {
            fx += (mx - fx) * .12;
            fy += (my - fy) * .12;
            follower.style.left = fx + 'px';
            follower.style.top = fy + 'px';
            requestAnimationFrame(tick);
        };
        tick();
        document.querySelectorAll('a,button,[role="button"],input,textarea,select').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.cssText += 'width:15px;height:15px;';
                follower.style.cssText += 'width:46px;height:46px;border-color:rgba(114,40,187,.48);';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.cssText += 'width:8px;height:8px;';
                follower.style.cssText += 'width:30px;height:30px;border-color:rgba(114,40,187,.33);';
            });
        });
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    }

    /* ═══════════════════════════════════════════ HEADER */
    const header = document.getElementById('header');
    const onScroll = () => {
        header?.classList.toggle('is-scrolled', window.scrollY > 18);
        header?.classList.toggle('scrolled', window.scrollY > 18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {
        passive: true
    });

    /* ═══════════════════════════════════════════ HERO SCROLL */
    const hero = document.querySelector('.hero');
    const setHeroProgress = () => {
        if (!hero || reduced) return;
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const distance = Math.max(vh * 1.05, 1);
        const progress = Math.min(1, Math.max(0, (-rect.top) / distance));
        hero.style.setProperty('--hero-progress', progress.toFixed(3));
        hero.dataset.phase = progress > .66 ? '3' : progress > .33 ? '2' : '1';
    };
    setHeroProgress();
    window.addEventListener('scroll', setHeroProgress, {
        passive: true
    });
    window.addEventListener('resize', setHeroProgress, {
        passive: true
    });

    /* ═══════════════════════════════════════════ MOBILE NAV */
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('siteNav');
    const navOverlay = document.getElementById('navOverlay');
    const setNav = (open) => {
        nav?.classList.toggle('is-open', open);
        navOverlay?.classList.toggle('is-visible', open);
        navOverlay?.classList.toggle('is-open', open);
        navToggle?.setAttribute('aria-expanded', String(open));
        document.documentElement.classList.toggle('nav-open', open);
        if (open) setTimeout(() => nav?.querySelector('a')?.focus(), 100);
    };
    navToggle?.addEventListener('click', e => {
        e.stopPropagation();
        setNav(!nav.classList.contains('is-open'));
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setNav(false);
    });
    document.addEventListener('click', e => {
        if (nav?.classList.contains('is-open') && !nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
    });
    nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
    navOverlay?.addEventListener('click', () => setNav(false));

    /* ═══════════════════════════════════════════ SMOOTH SCROLL */
    document.addEventListener('click', e => {
        const a = e.target?.closest?.('a[href^="#"]');
        if (!a || a.classList.contains('skip-link')) return;
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 70);
        window.scrollTo({
            top,
            behavior: reduced ? 'auto' : 'smooth'
        });
        try {
            history.pushState(null, '', href);
        } catch (_) {}
        setNav(false);
    });

    /* ═══════════════════════════════════════════ ACTIVE NAV */
    if (!reduced && 'IntersectionObserver' in window) {
        const links = Array.from(nav?.querySelectorAll('a[href^="#"]') ?? []);
        links.forEach(link => {
            const sec = document.querySelector(link.getAttribute('href') ?? '');
            if (!sec) return;
            new IntersectionObserver(([e]) => {
                if (e.isIntersecting) {
                    links.forEach(l => l.classList.remove('is-active'));
                    link.classList.add('is-active');
                }
            }, {
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0
            }).observe(sec);
        });
    }

    /* ═══════════════════════════════════════════ SCROLL REVEAL */
    document.querySelectorAll('.stagger-group').forEach(group => {
        Array.from(group.children).forEach((child, index) => child.style.transitionDelay = `${index * 90}ms`);
    });

    const revEls = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!reduced && 'IntersectionObserver' in window) {
        const ro = new IntersectionObserver((entries, obs) => entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-visible');
            e.target.classList.add('visible');
            obs.unobserve(e.target);
        }), {
            threshold: 0.08,
            rootMargin: '0px 0px -42px 0px'
        });
        revEls.forEach(el => ro.observe(el));
    } else {
        revEls.forEach(el => {
            el.classList.add('is-visible');
            el.classList.add('visible');
        });
    }

    /* ═══════════════════════════════════════════ PARALLAX / TILT */
    const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
    const setParallax = () => {
        if (reduced || !desktopHeavy || !parallaxEls.length) return;
        const vh = window.innerHeight || 1;
        parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.parallax || '0.08');
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const progress = (vh / 2 - center) / vh;
            el.style.transform = `translate3d(0, ${progress * speed * 180}px, 0)`;
        });
    };
    setParallax();
    window.addEventListener('scroll', setParallax, {
        passive: true
    });
    window.addEventListener('resize', setParallax, {
        passive: true
    });

    /* lighter interactions: CSS hover only in v3 */

    /* ═══════════════════════════════════════════ FAQ */
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;
            document.querySelectorAll('.faq-item').forEach(o => {
                if (o !== item && o.open) o.open = false;
            });
        });
    });

    /* ═══════════════════════════════════════════ CONTACT FORM */
    const form = document.getElementById('contactForm');
    const stat = document.getElementById('formStatus');
    const setStat = (msg, type = 'info') => {
        if (!stat) return;
        stat.textContent = msg;
        stat.style.color = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : '';
    };
    const clrStat = () => {
        if (stat) {
            stat.textContent = '';
            stat.style.color = '';
        }
    };
    const validate = () => {
        if (!form) return {
            valid: true
        };
        const rules = [{
            id: 'nome',
            ok: v => v.trim().length >= 2
        }, {
            id: 'azienda',
            ok: v => v.trim().length >= 2
        }, {
            id: 'email',
            ok: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        }, {
            id: 'progetto',
            ok: v => v.trim().length >= 10
        }];
        let valid = true,
            first = null;
        rules.forEach(({
            id,
            ok
        }) => {
            const inp = document.getElementById(id);
            const wrap = inp?.closest('.form-field');
            const pass = ok(inp?.value ?? '');
            wrap?.classList.toggle('is-invalid', !pass);
            if (!pass) {
                valid = false;
                if (!first) first = inp;
            }
        });
        return {
            valid,
            firstInvalid: first
        };
    };
    form?.querySelectorAll('input,textarea,select').forEach(inp => inp.addEventListener('input', () => {
        inp.closest('.form-field')?.classList.remove('is-invalid');
        clrStat();
    }));
    form?.addEventListener('submit', async e => {
        e.preventDefault();
        const {
            valid,
            firstInvalid
        } = validate();
        if (!valid) {
            setStat('Controlla i campi evidenziati e riprova.', 'error');
            firstInvalid?.focus();
            return;
        }
        const btn = form.querySelector('button[type="submit"]'),
            orig = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span>Invio in corso…</span>';
        }
        clrStat();
        try {
            const action = form.getAttribute('action');
            if (!action || action.includes('YOUR_FORM_ID')) throw new Error('Sostituisci YOUR_FORM_ID con il tuo ID Formspree.');
            const res = await fetch(action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    Accept: 'application/json'
                }
            });
            if (res.ok) {
                setStat('✓ Richiesta inviata! Ti risponderemo entro 24 ore.', 'success');
                form.reset();
                form.querySelectorAll('.is-invalid').forEach(f => f.classList.remove('is-invalid'));
                setTimeout(() => stat?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                }), 100);
            } else {
                const d = await res.json();
                throw new Error(d.errors?.map(x => x.message).join(', ') || "Errore durante l'invio.");
            }
        } catch (err) {
            setStat(err.message || 'Si è verificato un errore. Riprova.', 'error');
        } finally {
            if (btn && orig) {
                btn.disabled = false;
                btn.innerHTML = orig;
            }
        }
    });

    /* ═══════════════════════════════════════════ LIVE SITE PREVIEWS */
    const previewBoxes = Array.from(document.querySelectorAll('.pol-live[data-live-src], [data-live-preview]'));
    const bootFrame = (box) => {
        if (!box || box.dataset.booted === '1') return;
        const frame = box.querySelector('.preview-live__frame') || box.querySelector('iframe');
        if (!frame) return;
        box.dataset.booted = '1';
        let settled = false;
        const done = (ok) => {
            if (settled) return;
            settled = true;
            box.classList.toggle('is-loaded', !!ok);
            box.classList.toggle('is-error', !ok);
        };
        const timer = window.setTimeout(() => done(false), 9000);
        frame.addEventListener('load', () => {
            window.clearTimeout(timer);
            window.setTimeout(() => done(true), 350);
        }, {
            once: true
        });
        frame.addEventListener('error', () => {
            window.clearTimeout(timer);
            done(false);
        }, {
            once: true
        });
        frame.src = frame.dataset.src || box.dataset.liveSrc || '';
    };
    if ('IntersectionObserver' in window) {
        const po = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            bootFrame(entry.target);
            obs.unobserve(entry.target);
        }), {
            rootMargin: '220px 0px',
            threshold: 0.01
        });
        previewBoxes.forEach(box => po.observe(box));
    } else {
        previewBoxes.forEach(bootFrame);
    }

    /* ═══════════════════════════════════════════ FOOTER YEAR */
    const yr = document.getElementById('year');
    if (yr) yr.textContent = String(new Date().getFullYear());

    console.log('%csynk%c ✦ Digital Studio — live showcase v9', 'font-size:26px;font-weight:800;font-family:Imbue,serif;letter-spacing:-.04em;color:#7228BB', 'font-size:12px;color:#9050D2');
})();