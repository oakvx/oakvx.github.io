/* Wii Menu behavior for the portfolio home. */
(() => {
    'use strict';

    const root = document.documentElement;
    if (!root.hasAttribute('data-home')) return;

    const menu = document.querySelector('[data-channel-menu]');
    if (!menu) return;

    const pages = [...menu.querySelectorAll('[data-home-channel-page]')];
    const track = menu.querySelector('[data-home-wii-channel-track]');
    const previousPage = menu.querySelector('[data-home-wii-page-prev]');
    const nextPage = menu.querySelector('[data-home-wii-page-next]');
    const pageStatus = menu.querySelector('[data-home-wii-page-status]');
    const hoverLabel = menu.querySelector('[data-home-wii-hover-label]');
    const clock = menu.querySelector('[data-home-wii-clock]');
    const dateLabel = menu.querySelector('[data-home-wii-date]');
    const clockAssets = new URL('../wii-boot/original/native/clock/', document.currentScript.src);
    const dialog = document.querySelector('[data-home-wii-options]');
    const optionsLink = menu.querySelector('[data-home-wii-options-open]');
    const closeOptions = dialog?.querySelector('[data-home-wii-options-close]');
    const motionOption = dialog?.querySelector('[data-home-wii-motion]');
    const soundOption = dialog?.querySelector('[data-home-wii-sound]');
    const languageOptions = [...(dialog?.querySelectorAll('[data-home-wii-language]') || [])];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const stopped = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const locale = () => root.lang === 'en' ? 'en-GB' : 'it-IT';
    const clockPositions = ['0.5%', '19.5385%', '34.7692%', '50%', '69.0385%'];
    let currentPage = 0;
    let finished = false;
    let loaderTimer = 0;
    let clockTimer = 0;
    let opener = null;

    function updatePageStatus() {
        if (pageStatus) pageStatus.textContent = root.lang === 'en' ? `Page ${currentPage + 1} of ${pages.length}` : `Pagina ${currentPage + 1} di ${pages.length}`;
    }

    function showPage(index) {
        if (!pages.length) return;
        const next = Math.max(0, Math.min(pages.length - 1, index));
        const focusedOnHiddenPage = pages.some((page, pageIndex) => pageIndex !== next && page.contains(document.activeElement));
        const focusWasPrevious = document.activeElement === previousPage;
        const focusWasNext = document.activeElement === nextPage;
        currentPage = next;
        if (track) track.style.transform = `translateX(-${currentPage * 25}%)`;
        pages.forEach((page, pageIndex) => {
            const active = pageIndex === currentPage;
            page.toggleAttribute('inert', !active);
            if (active) page.removeAttribute('aria-hidden');
            else page.setAttribute('aria-hidden', 'true');
        });
        if (previousPage) previousPage.hidden = currentPage === 0;
        if (nextPage) nextPage.hidden = currentPage === pages.length - 1;
        updatePageStatus();
        setHover(null);
        if (focusedOnHiddenPage) pages[currentPage].querySelector('[data-channel]')?.focus({ preventScroll: true });
        if (focusWasNext && nextPage?.hidden) previousPage?.focus({ preventScroll: true });
        if (focusWasPrevious && previousPage?.hidden) nextPage?.focus({ preventScroll: true });
    }

    function labelFor(control) {
        if (!control) return '';
        if (control.matches('[data-channel]')) return control.querySelector('h2')?.textContent.trim() || '';
        return control.getAttribute('aria-label') || '';
    }

    function setHover(control) {
        if (!hoverLabel) return;
        const label = labelFor(control);
        hoverLabel.textContent = label;
        hoverLabel.classList.toggle('is-visible', !!label);
    }

    menu.addEventListener('pointerover', event => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        setHover(event.target.closest?.('.channel-tile,.home-wii-control'));
    }, { passive: true });
    menu.addEventListener('pointerout', event => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        const control = event.target.closest?.('.channel-tile,.home-wii-control');
        const next = event.relatedTarget?.closest?.('.channel-tile,.home-wii-control');
        if (control && control !== next) setHover(next);
    }, { passive: true });
    previousPage?.addEventListener('click', () => showPage(currentPage - 1));
    nextPage?.addEventListener('click', () => showPage(currentPage + 1));
    menu.addEventListener('focusin', event => setHover(event.target.closest?.('.channel-tile,.home-wii-control')));
    menu.addEventListener('focusout', event => {
        const next = event.relatedTarget?.closest?.('.channel-tile,.home-wii-control');
        if (next) setHover(next);
        else if (!menu.contains(event.relatedTarget)) setHover(null);
    });

    function updateClock() {
        clearTimeout(clockTimer);
        if (!clock || !dateLabel || document.hidden) return;
        const now = new Date();
        const value = new Intl.DateTimeFormat(locale(), {
            timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(now);
        const digits = [...value].slice(0, 5);
        clock.setAttribute('aria-label', `${root.lang === 'en' ? 'Current time' : 'Ora attuale'} ${value}`);
        clock.replaceChildren(...digits.map((digit, index) => {
            const glyph = document.createElement('span');
            const image = digit === ':' ? 'colon' : digit;
            glyph.className = 'home-wii-clock-glyph';
            glyph.setAttribute('aria-hidden', 'true');
            glyph.style.setProperty('--wii-clock-left', clockPositions[index]);
            glyph.style.setProperty('--wii-clock-image', `url("${new URL(`${image}.png`, clockAssets).href}")`);
            return glyph;
        }));
        dateLabel.dateTime = now.toISOString();
        dateLabel.textContent = new Intl.DateTimeFormat(locale(), {
            timeZone: 'Europe/Rome', weekday: 'short', day: '2-digit', month: '2-digit'
        }).format(now);
        const untilMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        clockTimer = setTimeout(updateClock, untilMinute + 50);
    }

    const optionText = {
        it: { stop: 'Ferma animazioni', resume: 'Riprendi animazioni', soundOn: 'Attiva audio', soundOff: 'Disattiva audio' },
        en: { stop: 'Pause animations', resume: 'Resume animations', soundOn: 'Turn sound on', soundOff: 'Turn sound off' }
    };
    function syncOptions() {
        if (!dialog) return;
        const english = root.lang === 'en';
        const words = optionText[english ? 'en' : 'it'];
        const paused = root.classList.contains('paused');
        const soundEnabled = document.querySelector('[data-sound]')?.getAttribute('aria-pressed') === 'true';
        languageOptions.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.homeWiiLanguage === (english ? 'en' : 'it'))));
        if (motionOption) {
            motionOption.textContent = paused ? words.resume : words.stop;
            motionOption.setAttribute('aria-pressed', String(paused));
        }
        if (soundOption) {
            soundOption.textContent = soundEnabled ? words.soundOff : words.soundOn;
            soundOption.setAttribute('aria-pressed', String(soundEnabled));
            soundOption.disabled = !document.querySelector('[data-sound]') || document.querySelector('[data-sound]').disabled;
        }
    }

    if (dialog && optionsLink && typeof dialog.showModal === 'function') {
        optionsLink.addEventListener('click', event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = optionsLink;
            syncOptions();
            try { dialog.showModal(); closeOptions?.focus({ preventScroll: true }); } catch {}
        });
        closeOptions?.addEventListener('click', () => dialog.close('back'));
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close('backdrop'); });
        dialog.addEventListener('close', () => {
            if (opener?.isConnected) opener.focus({ preventScroll: true });
            opener = null;
        });
        languageOptions.forEach(button => button.addEventListener('click', () => {
            const target = document.querySelector(`.lang [data-lang="${button.dataset.homeWiiLanguage}"]`);
            if (target) target.click();
        }));
        motionOption?.addEventListener('click', () => {
            document.querySelector('[data-motion]')?.click();
            syncOptions();
        });
        soundOption?.addEventListener('click', () => {
            document.querySelector('[data-sound]')?.click();
            syncOptions();
        });
        new MutationObserver(() => { syncOptions(); updatePageStatus(); }).observe(root, { attributes: true, attributeFilter: ['class', 'lang'] });
        const mainSettings = [...document.querySelectorAll('[data-motion],[data-sound]')];
        mainSettings.forEach(control => new MutationObserver(syncOptions).observe(control, { attributes: true, attributeFilter: ['aria-pressed', 'disabled'] }));
        addEventListener('wiiu:motionchange', syncOptions);
        addEventListener('wiiu:soundchange', syncOptions);
    }

    const clearEntry = () => menu.classList.remove('home-enter');
    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(loaderTimer);
        root.classList.remove('home-loading');
        const loader = document.querySelector('[data-home-loader]');
        if (loader) setTimeout(() => loader.remove(), 140);
        clearEntry();
    }

    addEventListener('wii-boot:ready', finish);
    addEventListener('wiiu:motionchange', () => { if (stopped()) finish(); });
    new MutationObserver(() => { if (stopped()) finish(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    reduced.addEventListener('change', () => { if (stopped()) finish(); });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearEntry();
            clearTimeout(clockTimer);
            if (!finished) finish();
        } else updateClock();
    });
    addEventListener('pagehide', () => {
        clearEntry();
        clearTimeout(clockTimer);
        if (!finished) finish();
    });

    showPage(0);
    root.classList.add('wii-menu-ready');
    updateClock();
    syncOptions();
    if (root.classList.contains('home-loading')) {
        const elapsed = performance.now() - Number(root.dataset.homeBoot || 0);
        loaderTimer = setTimeout(finish, Math.max(0, 650 - elapsed));
        Promise.all([
            new Promise(resolve => setTimeout(resolve, Math.max(0, 280 - elapsed))),
            (document.fonts?.ready || Promise.resolve()).catch(() => {})
        ]).then(finish);
    } else finish();
})();
