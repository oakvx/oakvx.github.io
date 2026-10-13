'use strict';

(() => {
  const root = document.documentElement;
  const english = {
    skip: "Skip to content",
    navLabel: "Main navigation",
    navProjects: "Projects",
    navJourney: "Experience",
    navAbout: "About me",
    navHistory: "Background",
    navContact: "Contact",
    navSkills: "Skills",
    languageLabel: "Language",
    themeLabel: "Theme",
    themeAuto: "Auto",
    themeLight: "Light",
    themeDark: "Dark",
    menuOpen: "Open menu",
    mobileNavLabel: "Mobile navigation",
    heroEyebrow: "Developer & graphic designer",
    heroLine1: "Gabriele",
    heroLine2: "Lucia",
    heroDescription: "Developer and graphic designer based in Sassuolo, Italy. I build web applications, create social graphics and design interfaces, and study Computer Engineering at UNIMORE.",
    heroProjects: "View projects",
    location: "Sassuolo, Italy",
    focus: "Full stack + automation",
    projectsTitle: "Projects",
    synkOpen: "Explore the Synk project",
    synkMessage: "Can we book an appointment?",
    flowIntent: "intent",
    flowLogic: "logic",
    flowData: "data",
    flowResult: "Appointment management",
    synkAnnotation: "ILLUSTRATIVE DIAGRAM",
    synkKind: "WhatsApp appointments",
    synkDescription: "An application that recognises WhatsApp messages and manages appointments. I developed the Node.js backend, PostgreSQL data layer and monitoring interface.",
    synkDetails: "Synk project details",
    beautifyOpen: "Explore the Beautify project",
    crmAppointments: "Appointments",
    crmCustomer: "Customer",
    crmService: "Service / operator",
    beautifyAnnotation: "ILLUSTRATIVE INTERFACE",
    beautifyKind: "Web CRM",
    beautifyDescription: "My final diploma project: a CRM for customers, appointments, operators and services. I developed the PHP backend and MySQL database.",
    beautifyDetails: "Beautify project details",
    dataModeling: "Data modeling",
    githubMore: "View GitHub",
    journeyTitle: "Experience &\neducation",
    formatDate: "AUG — 04 SEP 2026",
    experienceTag: "EXPERIENCE",
    formatRole: "Software & Automation Apprentice",
    formatDescription: "Supported PLC programming and software development for industrial automation. Wrote T-SQL scripts for backup, data management and archiving on SQL Server.",
    starboticaDate: "MAY — JUN 2025",
    starboticaPlace: "· Seville, Spain",
    starboticaDescription: "Support for Windows environments, Active Directory accounts, local networks and peripherals. Hardware and software troubleshooting and technical documentation in an international team.",
    universityDate: "2026 — IN PROGRESS",
    educationTag: "EDUCATION",
    universityTitle: "Computer Engineering",
    universityType: "· B.Sc., part-time",
    diplomaTitle: "IT & Telecommunications",
    diplomaPlace: "· Sassuolo, diploma",
    skillsTitle: "Skills",
    webTitle: "Web development",
    automationTitle: "Automation",
    automationSkills: "PLC–software–database integration",
    automationProcesses: "Process automation",
    automationBackup: "Backup & data archiving",
    otherTitle: "Other tools",
    technicalDocs: "Technical documentation",
    languagesTitle: "LANGUAGES",
    italian: "Italian",
    native: "Native",
    english: "English",
    spanish: "Spanish",
    greek: "Greek",
    chinese: "Chinese",
    webExplanation: "HTML and CSS build structure and the interface; JavaScript handles the DOM and interactions. On the server I use Node.js and PHP for application logic, APIs and CRUD workflows.",
    databaseExplanation: "I model data and relationships and query them with SQL. PostgreSQL in Synk, MySQL in Beautify, and T-SQL on SQL Server during my automation experience.",
    automationExplanation: "I connect software, PLCs and databases. At Format SRL I supported PLC programming and wrote T-SQL scripts for data backup, management and archiving.",
    otherExplanation: "Git and GitHub to version and share code. Java, C# and C++ round out my programming foundations, alongside troubleshooting and technical documentation.",
    contactTitle: "Contact",
    contactDescription: "You can contact me by email.",
    contactCTA: "Email me",
    backTop: "Back to top ↑"
  };

  const pageConfig = JSON.parse(document.querySelector('#page-translations')?.textContent || '{}');
  const pageLocale = ['it', 'en'].includes(pageConfig.locale) ? pageConfig.locale : null;
  Object.assign(english, pageConfig.en || {});
  Object.assign(english, { bratOpen: 'Explore Brat Animator', bratDescription: "A browser-based lyric video editor with LRC import, text animation and MP4/WebM export.", readProject: "View project" });
  const italian = {};
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
  const altNodes = [...document.querySelectorAll('[data-i18n-alt]')];
  if (!pageLocale) {
    textNodes.forEach(element => {
      italian[element.getAttribute('data-i18n')] = [...element.childNodes].map(node => node.nodeName === 'BR' ? '\n' : node.textContent).join('');
    });
    ariaNodes.forEach(element => { italian[element.getAttribute('data-i18n-aria')] = element.getAttribute('aria-label'); });
    altNodes.forEach(element => { italian[element.getAttribute('data-i18n-alt')] = element.getAttribute('alt'); });
  }

  const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* The site also works without storage. */ } };
  const storedLanguage = readPreference('gl-language');
  let language = pageLocale || (storedLanguage === 'it' || storedLanguage === 'en' ? storedLanguage : navigator.language.toLowerCase().startsWith('en') ? 'en' : 'it');
  const themeSelect = document.querySelector('#theme-select');
  const storedTheme = readPreference('gl-theme');
  themeSelect.value = ['light', 'dark'].includes(storedTheme) ? storedTheme : 'auto';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');

  function setText(element, text) {
    const fragments = String(text).split('\n');
    element.replaceChildren();
    fragments.forEach((fragment, index) => {
      if (index) element.append(document.createElement('br'));
      element.append(document.createTextNode(fragment));
    });
  }

  function updateMenuLabel() {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', language === 'it' ? open ? 'Chiudi menu' : 'Apri menu' : open ? 'Close menu' : 'Open menu');
  }

  function setLanguage(next, persist = true) {
    language = pageLocale || next;
    root.lang = language;
    // Localized HTML already contains its final text and SEO metadata.
    if (!pageLocale) {
      const dictionary = language === 'en' ? english : italian;
      textNodes.forEach(element => { if (dictionary[element.getAttribute('data-i18n')] !== undefined) setText(element, dictionary[element.getAttribute('data-i18n')]); });
      ariaNodes.forEach(element => { if (dictionary[element.getAttribute('data-i18n-aria')] !== undefined) element.setAttribute('aria-label', dictionary[element.getAttribute('data-i18n-aria')]); });
      altNodes.forEach(element => { if (dictionary[element.getAttribute('data-i18n-alt')] !== undefined) element.setAttribute('alt', dictionary[element.getAttribute('data-i18n-alt')]); });
      document.title = pageConfig.title?.[language] || 'Gabriele Lucia / oakvx — Developer & Graphic Designer';
      const description = pageConfig.description?.[language] || (language === 'it' ? 'Gabriele Lucia, developer e graphic designer a Sassuolo. Applicazioni web, grafica per social, interfacce e progetti personali.' : 'Gabriele Lucia, developer and graphic designer in Sassuolo, Italy. Web applications, social graphics, interfaces and personal projects.');
      document.querySelector('meta[name="description"]').content = description;
      document.querySelector('meta[property="og:description"]').content = description;
      document.querySelector('meta[property="og:title"]').content = document.title;
    }
    document.querySelectorAll('[data-lang]').forEach(control => {
      const current = control.dataset.lang === language;
      if (control.matches('a[href]')) {
        control.removeAttribute('aria-pressed');
        if (current) control.setAttribute('aria-current', 'page');
        else control.removeAttribute('aria-current');
      } else control.setAttribute('aria-pressed', String(current));
    });
    document.dispatchEvent(new CustomEvent('portfolio:language', { detail: language }));
    updateMenuLabel();
    if (persist) savePreference('gl-language', language);
  }

  function updateThemeColor() {
    const dark = themeSelect.value === 'dark' || (themeSelect.value === 'auto' && systemTheme.matches);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#240612' : '#f7f7ef';
  }

  function setTheme(theme) {
    if (theme === 'auto') delete root.dataset.theme;
    else root.dataset.theme = theme;
    savePreference('gl-theme', theme);
    updateThemeColor();
  }

  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
    updateMenuLabel();
  }

  document.querySelectorAll('[data-lang]').forEach(control => control.addEventListener('click', event => {
    if (control.matches('a[href]')) {
      // Keep normal links, modifier clicks, browser history and no-JS navigation.
      const plainClick = !event.defaultPrevented && (event.button == null || event.button === 0) && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      if (plainClick && ['it', 'en'].includes(control.dataset.lang) && (!control.target || control.target === '_self')) savePreference('gl-language', control.dataset.lang);
      return;
    }
    if (!pageLocale) setLanguage(control.dataset.lang);
  }));
  themeSelect.addEventListener('change', () => setTheme(themeSelect.value));
  systemTheme.addEventListener('change', updateThemeColor);
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
    updateMenuLabel();
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  setLanguage(language, false);
  updateThemeColor();
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    root.classList.add('js');
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    reducedMotion.addEventListener('change', event => {
      if (event.matches) { observer.disconnect(); document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible')); }
    });
  }
})();
