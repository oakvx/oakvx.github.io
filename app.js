(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // ========================================
  // HEADER SCROLL
  // ========================================
  
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ========================================
  // MOBILE NAVIGATION - CORRETTO
  // ========================================

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  const navOverlay = document.getElementById('navOverlay');

  const setNavOpen = (open) => {
    if (!nav || !navToggle || !navOverlay) return;

    if (open) {
      nav.classList.add('is-open');
      navOverlay.classList.add('is-visible');
    } else {
      nav.classList.remove('is-open');
      navOverlay.classList.remove('is-visible');
    }

    navToggle.setAttribute('aria-expanded', String(open));

    if (open) {
      const firstLink = nav.querySelector('a');
      setTimeout(() => firstLink?.focus?.(), 100);
    }
  };

  if (navToggle && nav) {
    // Toggle on button click
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.contains('is-open');
      setNavOpen(!isOpen);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNavOpen(false);
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      
      const isClickInsideNav = nav.contains(e.target);
      const isClickOnToggle = navToggle.contains(e.target);
      
      if (!isClickInsideNav && !isClickOnToggle) {
        setNavOpen(false);
      }
    });

    // Close on nav link click
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        setNavOpen(false);
      });
    });
  }

  // Close nav on overlay click
  if (navOverlay) {
    navOverlay.addEventListener('click', () => setNavOpen(false));
  }

  // ========================================
  // SMOOTH SCROLL
  // ========================================

  document.addEventListener('click', (e) => {
    const anchor = e.target?.closest?.('a[href^="#"]');
    if (!anchor || anchor.classList.contains('skip-link')) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href === '#!') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // Offset for fixed header
    const headerHeight = header?.offsetHeight || 72;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    // Update URL
    try {
      history.pushState(null, '', href);
    } catch (_) {}

    // Close mobile nav
    setNavOpen(false);
  });

  // ========================================
  // ACTIVE SECTION HIGHLIGHT
  // ========================================

  const navLinks = Array.from(nav?.querySelectorAll('a[href^="#"]') ?? []);
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      const section = href ? document.querySelector(href) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!prefersReducedMotion && 'IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = sections.find((s) => s.section === entry.target);
          if (!item) return;

          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            item.link.classList.add('is-active');
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((s) => observer.observe(s.section));
  }

  // ========================================
  // SCROLL REVEAL
  // ========================================

  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));

  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealElements.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // ========================================
  // FAQ ACCORDION
  // ========================================

  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      
      faqItems.forEach((other) => {
        if (other !== item && other.open) {
          other.open = false;
        }
      });
    });
  });

  // ========================================
  // CONTACT FORM
  // ========================================

  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  const showStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status';
    if (type === 'success') statusEl.style.color = 'var(--success)';
    if (type === 'error') statusEl.style.color = 'var(--error)';
  };

  const clearStatus = () => {
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      statusEl.style.color = '';
    }
  };

  const setFieldInvalid = (fieldEl, invalid) => {
    if (!fieldEl) return;
    fieldEl.classList.toggle('is-invalid', invalid);
  };

  const validateForm = () => {
    if (!form) return { valid: true, firstInvalid: null };

    const fields = [
      { 
        id: 'nome', 
        rule: (v) => v.trim().length >= 2
      },
      { 
        id: 'salone', 
        rule: (v) => v.trim().length >= 2
      },
      { 
        id: 'citta', 
        rule: (v) => v.trim().length >= 2
      },
      { 
        id: 'telefono', 
        rule: (v) => /^[\d\s+()-]{6,}$/.test(v.trim())
      },
      { 
        id: 'email', 
        rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      },
      { 
        id: 'messaggio', 
        rule: (v) => v.trim().length >= 10
      }
    ];

    let valid = true;
    let firstInvalid = null;

    fields.forEach(({ id, rule }) => {
      const input = document.getElementById(id);
      const wrapper = input?.closest('.form-field');
      const value = input?.value ?? '';
      const isValid = rule(value);

      setFieldInvalid(wrapper, !isValid);

      if (!isValid) {
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    return { valid, firstInvalid };
  };

  // Clear validation on input
  if (form) {
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        const wrapper = input.closest('.form-field');
        if (wrapper?.classList.contains('is-invalid')) {
          setFieldInvalid(wrapper, false);
        }
        clearStatus();
      });
    });
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const { valid, firstInvalid } = validateForm();

      if (!valid) {
        showStatus('Per favore, controlla i campi evidenziati e riprova.', 'error');
        firstInvalid?.focus?.();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn?.innerHTML;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Invio in corso...</span>';
      }

      clearStatus();

      try {
        const formAction = form.getAttribute('action');
        
        if (!formAction || formAction.includes('YOUR_FORM_ID')) {
          throw new Error('Form endpoint non configurato. Sostituisci YOUR_FORM_ID con il tuo ID Formspree.');
        }

        const formData = new FormData(form);
        
        const response = await fetch(formAction, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          showStatus('✓ Richiesta inviata con successo! Ti ricontatteremo presto.', 'success');
          form.reset();
          
          document.querySelectorAll('.form-field.is-invalid').forEach((field) => {
            field.classList.remove('is-invalid');
          });

          setTimeout(() => {
            statusEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);

        } else {
          const data = await response.json();
          if (data.errors) {
            const errorMsg = data.errors.map(e => e.message).join(', ');
            throw new Error(errorMsg);
          } else {
            throw new Error('Errore durante l\'invio. Riprova.');
          }
        }

      } catch (error) {
        console.error('Form submission error:', error);
        showStatus(
          error.message || 'Si è verificato un errore. Riprova o contattaci direttamente.',
          'error'
        );
      } finally {
        if (submitBtn && originalBtnText) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // ========================================
  // WHATSAPP FAB
  // ========================================

  const waFab = document.querySelector('.wa-fab');
  if (waFab) {
    const handleWaFabScroll = () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > 300) {
        waFab.classList.add('is-visible');
      } else {
        waFab.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', handleWaFabScroll, { passive: true });
    handleWaFabScroll();
  }

  // ========================================
  // FOOTER YEAR
  // ========================================

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ========================================
  // CONSOLE
  // ========================================

  console.log(
    '%cSynkris%c\n💜 Assistente WhatsApp per saloni\nFatto con cura in Italia',
    'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;',
    'font-size: 14px; color: #a78bfa; margin-top: 8px;'
  );

})();
