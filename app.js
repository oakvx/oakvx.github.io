(() => {
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // ====== Header shadow on scroll ======
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ====== Mobile nav toggle + overlay ======
  const toggleBtn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');
  const overlay = document.querySelector('[data-nav-overlay]');

  const setNavOpen = (open) => {
    if (!toggleBtn || !nav) return;

    nav.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');

    document.body.classList.toggle('nav-open', open);
    if (overlay) overlay.hidden = !open;

    if (open) {
      const firstLink = nav.querySelector('a[href^="#"]');
      firstLink?.focus?.();
    }
  };

  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      setNavOpen(!nav.classList.contains('is-open'));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    });

    // Close when clicking outside nav (desktop safe)
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      const within = nav.contains(e.target) || toggleBtn.contains(e.target);
      if (!within) setNavOpen(false);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => setNavOpen(false));
  }

  // ====== Smooth scroll for internal anchors (with reduced-motion support) ======
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;
    if (a.classList.contains('skip-link')) return;

    const href = a.getAttribute('href');
    if (!href || href === '#' || href === '#!') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

    // Keep URL hash in sync (nice for sharing)
    try { history.pushState(null, '', href); } catch (_) {}

    // Close menu on mobile
    setNavOpen(false);
  });

  // ====== Active section highlight in nav ======
  const navLinks = Array.from(nav?.querySelectorAll('a[href^="#"]') ?? []);
  const sectionMap = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      const section = href ? document.querySelector(href) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!prefersReducedMotion && 'IntersectionObserver' in window && sectionMap.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const item = sectionMap.find((x) => x.section === entry.target);
        if (!item) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          item.link.classList.add('is-active');
        }
      });
    }, { root: null, threshold: 0.55 });

    sectionMap.forEach((x) => io.observe(x.section));
  }

  // ====== Scroll reveal ======
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  // Stagger micro-animation (small, premium) — disabled with prefers-reduced-motion
  if (!prefersReducedMotion) {
    const bySection = new Map();
    revealEls.forEach((el) => {
      const key = el.closest('section')?.id || 'root';
      const list = bySection.get(key) || [];
      list.push(el);
      bySection.set(key, list);
    });

    bySection.forEach((list) => {
      list.forEach((el, i) => {
        const delay = Math.min(i * 60, 240);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
      });
    });
  }


  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ====== FAQ accordion (keeps <details> accessible) ======
  const faqItems = Array.from(document.querySelectorAll('.faq__item'));
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  // ====== Contact form: lightweight client-side validation ======
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  const setFieldInvalid = (fieldEl, invalid) => {
    if (!fieldEl) return;
    fieldEl.classList.toggle('is-invalid', invalid);
  };

  const validate = () => {
    if (!form) return { ok: true, firstInvalid: null };

    const fields = [
      { id: 'nome', rule: (v) => v.trim().length >= 2 },
      { id: 'salone', rule: (v) => v.trim().length >= 2 },
      { id: 'citta', rule: (v) => v.trim().length >= 2 },
      { id: 'telefono', rule: (v) => v.trim().length >= 6 },
      { id: 'email', rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
      { id: 'messaggio', rule: (v) => v.trim().length >= 10 },
    ];

    let firstInvalid = null;
    let ok = true;

    fields.forEach(({ id, rule }) => {
      const input = document.getElementById(id);
      const wrapper = input?.closest('.field');
      const value = input?.value ?? '';
      const isValid = rule(value);

      setFieldInvalid(wrapper, !isValid);
      if (!isValid && !firstInvalid) firstInvalid = input;
      if (!isValid) ok = false;
    });

    return { ok, firstInvalid };
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const { ok, firstInvalid } = validate();

      if (!ok) {
        if (statusEl) statusEl.textContent = 'Controlla i campi evidenziati e riprova.';
        firstInvalid?.focus?.();
        return;
      }

      // Placeholder: nessun backend. Qui puoi integrare un invio reale.
      if (statusEl) statusEl.textContent = 'Richiesta inviata. Ti contattiamo a breve.';

      form.reset();
      document.querySelectorAll('.field.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    });
  }

  // ====== WhatsApp floating CTA (mobile only) ======
  const waFab = document.querySelector('.wa-fab');
  if (waFab) {
    const rawNumber = (waFab.getAttribute('data-wa-number') || '').replace(/\s+/g, '');
    const text = waFab.getAttribute('data-wa-text') || '';
    const number = rawNumber.replace(/^\+/, '');
    const href = number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : '#contatti';
    waFab.setAttribute('href', href);
  }

  // ====== Footer year ======
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();