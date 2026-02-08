(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // ========================================
  // HEADER SCROLL
  // ========================================
  
  const header = document.querySelector('.header');

  // Keep CSS var in sync for sticky offsets
  const syncHeaderHeightVar = () => {
    const h = header?.offsetHeight ?? 84;
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };
  syncHeaderHeightVar();
  window.addEventListener('resize', syncHeaderHeightVar, { passive: true });
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


    // ========================================
  // SCROLLYTELLING (DEMO) — mobile-first, messaggi progressivi + tabs + controlli
  // ========================================

  const scrollySection = document.querySelector('[data-scrolly]');
  if (scrollySection) {
    const tablist = scrollySection.querySelector('.scrolly__tabs[role="tablist"]');
    const tabs = Array.from(scrollySection.querySelectorAll('.scrolly__tabs .scrolly-step[role="tab"]'));
    const chatMsgs = Array.from(scrollySection.querySelectorAll('.scrolly-msg'));
    const chatPanel = scrollySection.querySelector('#scrolly-panel');
    const calendarToast = scrollySection.querySelector('#scrollyCalendarToast');
    const scrollTrack = scrollySection.querySelector('.scrolly__scroll');
    const stickyStage = scrollySection.querySelector('.scrolly__sticky');

    const isMobile = () => window.matchMedia?.('(max-width: 979px)')?.matches ?? (window.innerWidth < 980);

    const syncStageHeightVar = () => {
      if (!stickyStage) return;
      // altezza reale del blocco sticky (iPhone + controlli)
      // NB: getBoundingClientRect() segue meglio i layout con scale/transform; aggiungo un piccolo buffer per shadow/bezel.
      const rect = stickyStage.getBoundingClientRect();
      const h = Math.ceil(rect.height) + 12;
      scrollySection.style.setProperty('--scrolly-stage-h', `${h}px`);

      // Padding di uscita: serve per evitare compenetrazioni quando si scrolla oltre l’ultimo step
      // (il container resta “alto” abbastanza e lo sticky si stacca in modo pulito)
      const exitPad = Math.max(420, Math.min(1200, Math.round(h * 0.90)));
      scrollySection.style.setProperty('--scrolly-exit-pad', `${exitPad}px`);
    };



const phoneWrap = scrollySection.querySelector('.scrolly__device--phone');

// Mobile-first: riduce automaticamente la scala del device per lasciare “aria” agli step sotto
// (evita che il telefono occupi tutto il viewport e nasconda le card mentre scorri)
const getPhoneBaseDims = () => {
  if (!phoneWrap) return { baseW: 375, baseH: 812 };

  const deviceEl = phoneWrap.querySelector('.synkris-device');
  const cs = getComputedStyle(phoneWrap);
  const currentScale = parseFloat(cs.getPropertyValue('--device-scale')) || 1;

  // Fallback da CSS vars se presenti
  let baseW = parseFloat(cs.getPropertyValue('--device-w')) || 375;
  let baseH = parseFloat(cs.getPropertyValue('--device-h')) || 812;

  // Se troviamo il device reale, deriviamo le dimensioni “vere” (outer box del mockup)
  if (deviceEl) {
    const rect = deviceEl.getBoundingClientRect();
    const w = rect.width / currentScale;
    const h = rect.height / currentScale;
    if (Number.isFinite(w) && w > 200) baseW = w;
    if (Number.isFinite(h) && h > 400) baseH = h;

    // Aggiorna le CSS vars: così il wrapper (che sta nel flow) combacia col device reale
    phoneWrap.style.setProperty('--device-w', `${baseW.toFixed(2)}px`);
    phoneWrap.style.setProperty('--device-h', `${baseH.toFixed(2)}px`);
  }

  return { baseW, baseH };
};

const applyPhoneScale = () => {
  if (!phoneWrap) return;

  // Solo sulle view strette: su desktop lasciamo le regole CSS
  if (window.innerWidth >= 980) {
    phoneWrap.style.removeProperty('--device-scale');
    // Mantieni comunque le dimensioni corrette del wrapper
    getPhoneBaseDims();
    return;
  }

  const { baseW, baseH } = getPhoneBaseDims();

  // Target: il telefono dovrebbe stare dentro ~58vh, lasciando spazio agli step
  const targetPhonePx = Math.min(640, Math.max(420, window.innerHeight * 0.58));
  const stageWidth = (phoneWrap.parentElement?.clientWidth ?? window.innerWidth);

  const scaleH = targetPhonePx / baseH;
  const scaleW = Math.min(stageWidth, 460) / baseW;

  const scale = Math.max(0.58, Math.min(0.92, scaleH, scaleW));
  phoneWrap.style.setProperty('--device-scale', scale.toFixed(3));
};

applyPhoneScale();
    syncStageHeightVar();
    requestAnimationFrame(syncStageHeightVar);
let phoneScaleRaf = 0;
window.addEventListener('resize', () => {
  if (phoneScaleRaf) cancelAnimationFrame(phoneScaleRaf);
  phoneScaleRaf = requestAnimationFrame(() => { applyPhoneScale(); syncStageHeightVar(); });
});

    const controls = scrollySection.querySelector('[data-scrolly-controls]');
    const btnPrev = controls?.querySelector('[data-scrolly-action="prev"]');
    const btnNext = controls?.querySelector('[data-scrolly-action="next"]');
    const stepLabel = scrollySection.querySelector('#scrollyStepLabel');

    // Mobile: sentinels (invisibili) per mantenere 1 step visibile alla volta senza rompere IntersectionObserver
    const ensureSentinels = () => {
      if (!scrollTrack) return;
      if (!isMobile()) return;

      // evita doppia creazione
      if (scrollTrack.querySelector('.scrolly-sentinel')) return;

      const frag = document.createDocumentFragment();
      tabs.forEach((_, i) => {
        const s = document.createElement('div');
        s.className = 'scrolly-sentinel';
        s.dataset.step = String(i);
        s.setAttribute('aria-hidden', 'true');
        frag.appendChild(s);
      });

      // “Tail” sentinel: mantiene attivo l’ultimo step anche quando scrolli oltre l’ultimo passaggio
      // (zona di uscita/padding in basso).
      const tail = document.createElement('div');
      tail.className = 'scrolly-sentinel scrolly-sentinel--tail';
      tail.dataset.step = String(tabs.length - 1);
      tail.setAttribute('aria-hidden', 'true');
      frag.appendChild(tail);

      scrollTrack.appendChild(frag);
    };

    ensureSentinels();

    const updateEndingState = () => {
      if (!isMobile()) {
        scrollySection.classList.remove('is-ending');
        return;
      }
      const r = scrollySection.getBoundingClientRect();
      // Quando siamo vicini al fondo della sezione, lo sticky dei tab può compenetrarsi con lo stage che si “stacca”.
      // In quel tratto disattiviamo lo sticky dei tab via CSS (.scrolly.is-ending …).
      const threshold = Math.min(window.innerHeight * 0.90, window.innerHeight - 80);
      scrollySection.classList.toggle('is-ending', r.bottom <= threshold);
    };

    updateEndingState();
    window.addEventListener('scroll', updateEndingState, { passive: true });
    window.addEventListener('resize', () => { ensureSentinels(); syncStageHeightVar(); updateEndingState(); }, { passive: true });

    let currentStep = 0;

    const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

    const scrollChatToBottom = () => {
      if (!chatPanel) return;
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior });
    };

    const revealMsg = (msgEl) => {
      msgEl.removeAttribute('hidden');

      if (prefersReducedMotion) return;

      msgEl.classList.add('is-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => msgEl.classList.remove('is-enter'));
      });
    };

    const hideMsg = (msgEl) => {
      msgEl.setAttribute('hidden', '');
      msgEl.classList.remove('is-enter');
    };

    const updateCalendarToast = (activeIndex) => {
      if (!calendarToast) return;
      const shouldShow = prefersReducedMotion ? true : activeIndex >= 2; // step 3 (1-index) => idx 2 (0-index)
      calendarToast.classList.toggle('is-visible', shouldShow);
      calendarToast.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    };

    const updateControlsUI = (activeIndex) => {
      if (stepLabel) stepLabel.textContent = `${activeIndex + 1}/${tabs.length} step`;

      const atStart = activeIndex <= 0;
      const atEnd = activeIndex >= tabs.length - 1;

      if (btnPrev) btnPrev.disabled = atStart;
      if (btnNext) btnNext.disabled = atEnd;
    };

    const updateTabsUI = (activeIndex) => {
      tabs.forEach((tabEl, i) => {
        const isActive = i === activeIndex;
        tabEl.classList.toggle('is-active', isActive);
        tabEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tabEl.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      if (chatPanel) {
        const activeTab = tabs[activeIndex];
        if (activeTab?.id) chatPanel.setAttribute('aria-labelledby', activeTab.id);
      }

      updateControlsUI(activeIndex);
      updateCalendarToast(activeIndex);
    };

    const updateMessagesUI = (activeIndex, progressive) => {
      if (!progressive) {
        chatMsgs.forEach((msgEl) => msgEl.removeAttribute('hidden'));
        return;
      }

      chatMsgs.forEach((msgEl) => {
        const from = Number(msgEl.getAttribute('data-show-from') ?? '0');
        const shouldShow = activeIndex >= from;
        const isHidden = msgEl.hasAttribute('hidden');

        if (shouldShow && isHidden) revealMsg(msgEl);
        if (!shouldShow && !isHidden) hideMsg(msgEl);
      });
    };

    const setActiveStep = (idx, opts = {}) => {
      const activeIndex = clamp(idx, 0, tabs.length - 1);

      // Evita lavoro ripetuto quando l'observer "ribatte" sullo stesso step
      if (opts.source === 'scroll' && activeIndex === currentStep) return;

      const prevIndex = currentStep;
      currentStep = activeIndex;

      const progressive = opts.progressive ?? !prefersReducedMotion;

      updateTabsUI(activeIndex);
      updateMessagesUI(activeIndex, progressive);

      // Auto-scroll solo quando "si va avanti"
      if (progressive && activeIndex >= prevIndex) {
        scrollChatToBottom();
      }
    };

    const scrollStepIntoView = (index) => {
      // Mobile: scrolla sul sentinel (non sul tab, che può essere hidden)
      if (scrollTrack && isMobile()) {
        const s = scrollTrack.querySelector(`.scrolly-sentinel[data-step="${index}"]`);
        if (s) {
          s.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'center'
          });
          return;
        }
      }

      const el = tabs[index];
      if (!el) return;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    };

    // Click / keyboard activation (tabs)
    tabs.forEach((tabEl, i) => {
      tabEl.addEventListener('click', () => {
        setActiveStep(i, { source: 'ui' });
      });

      tabEl.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          setActiveStep(i, { source: 'ui' });
        }
      });
    });

    // Arrow navigation (manual activation: frecce spostano focus, Enter/Space attivano)
    if (tablist) {
      tablist.addEventListener('keydown', (ev) => {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(ev.key)) return;

        const currentFocusIndex = tabs.findIndex((t) => t === document.activeElement);
        if (currentFocusIndex < 0) return;

        ev.preventDefault();

        let nextIndex = currentFocusIndex;
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') nextIndex = clamp(currentFocusIndex + 1, 0, tabs.length - 1);
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') nextIndex = clamp(currentFocusIndex - 1, 0, tabs.length - 1);
        if (ev.key === 'Home') nextIndex = 0;
        if (ev.key === 'End') nextIndex = tabs.length - 1;

        tabs[nextIndex]?.focus();
      });
    }

    // Controls (prev/next/restart)
    const go = (delta) => {
      const nextIdx = clamp(currentStep + delta, 0, tabs.length - 1);
      setActiveStep(nextIdx, { source: 'ui' });
      scrollStepIntoView(nextIdx);
    };

    btnPrev?.addEventListener('click', () => go(-1));
    btnNext?.addEventListener('click', () => go(1));

    // Init
    if (tabs.length === 0) return;

    if (prefersReducedMotion) {
      setActiveStep(0, { source: 'init', progressive: false });
      scrollChatToBottom();
    } else {
      setActiveStep(0, { source: 'init', progressive: true });

      // Scroll-driven activation (robusto: evita step “saltati” su wheel scroll e rende la selezione deterministica)
      const getScrollTargets = () => {
        if (scrollTrack && isMobile()) {
          const sent = Array.from(scrollTrack.querySelectorAll('.scrolly-sentinel'));
          if (sent.length) return sent;
        }
        return tabs;
      };

      const pickActiveFromScroll = () => {
        const focusY = window.innerHeight * (isMobile() ? 0.42 : 0.45);
        const targets = getScrollTargets();

        let bestIndex = currentStep;
        let bestDist = Infinity;

        targets.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;

          const cy = r.top + (r.height / 2);
          const dist = Math.abs(cy - focusY);

          if (dist < bestDist) {
            bestDist = dist;
            bestIndex = Number(el.getAttribute('data-step') ?? el.dataset.step ?? '0');
          }
        });

        return clamp(bestIndex, 0, tabs.length - 1);
      };

      let rafScroll = 0;
      const onScrollPick = () => {
        if (rafScroll) return;
        rafScroll = requestAnimationFrame(() => {
          rafScroll = 0;

          const r = scrollySection.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;

          setActiveStep(pickActiveFromScroll(), { source: 'scroll', progressive: true });
        });
      };

      window.addEventListener('scroll', onScrollPick, { passive: true });
      window.addEventListener('resize', onScrollPick, { passive: true });

      // Se l’utente arriva alla sezione via anchor, settiamo subito lo step corretto
      requestAnimationFrame(onScrollPick);
    }
  }

})();
