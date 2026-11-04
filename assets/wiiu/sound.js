/* One optional audio control/context for original UI tones and registered music. */
(() => {
    'use strict';
    const button = document.querySelector('[data-sound]');
    if (!button) return;
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const Audio = window.AudioContext || window.webkitAudioContext;
    let enabled = false, gesture = false, context, lastTone = 0, hovered = null;
    let leaving = false, suspendTimer = 0, resuming = false, previous = '';
    const voices = new Set();
    const subscribers = new Set();
    try { enabled = localStorage.getItem('wiiu-sound') === 'on'; } catch {}
    const stopped = () => document.hidden || reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const allowed = () => !!Audio && enabled && gesture && !stopped() && !leaving;
    const state = () => Object.freeze({ context, enabled, active: allowed() && context?.state === 'running', leaving });
    function publish() {
        const value = state(), key = [value.enabled, value.active, value.leaving, context?.state].join('|');
        if (key === previous) return;
        previous = key;
        subscribers.forEach(listener => listener(value));
    }
    Object.defineProperty(window, 'wiiuSound', { value: Object.freeze({
        getState: state,
        subscribe(listener) { subscribers.add(listener); listener(state()); return () => subscribers.delete(listener); }
    }) });
    function sync() {
        const english = root.lang === 'en';
        const label = !Audio ? (english ? 'Sound unavailable' : 'Audio non disponibile') : enabled ? (english ? 'Turn sound off' : 'Disattiva audio') : (english ? 'Turn sound on' : 'Attiva audio');
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', label); button.title = label;
        button.querySelector('[data-sound-label]').textContent = label;
        button.disabled = !Audio;
        if (!allowed()) {
            voices.forEach(voice => { try { voice.stop(); } catch {} });
            voices.clear();
            publish(); // Music schedules its 600 ms release before suspension.
            if (context?.state === 'running' && !suspendTimer) suspendTimer = setTimeout(() => {
                suspendTimer = 0;
                if (!allowed() && context?.state === 'running') context.suspend().catch(() => {});
            }, leaving ? 0 : 650);
        } else unlock();
    }
    function unlock() {
        if (!allowed()) return;
        clearTimeout(suspendTimer); suspendTimer = 0;
        try {
            if (!context) {
                context = new Audio();
                context.addEventListener('statechange', () => { publish(); if (!allowed()) sync(); });
            }
            if (context.state === 'suspended' && !resuming) {
                resuming = true;
                context.resume().then(() => { resuming = false; sync(); }).catch(() => { resuming = false; publish(); });
            }
            publish();
        } catch { publish(); }
    }
    function tone(kind) {
        if (!enabled || !gesture || stopped() || !Audio || performance.now() - lastTone < 100) return;
        unlock();
        if (context?.state !== 'running') return;
        const settings = { hover: [650,.045], click: [480,.065], open: [820,.085] }[kind];
        const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(settings[0], now);
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.016, now + .005);
        gain.gain.exponentialRampToValueAtTime(.0001, now + settings[1]);
        oscillator.connect(gain); gain.connect(context.destination);
        voices.add(oscillator);
        oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(now); oscillator.stop(now + settings[1] + .005); lastTone = performance.now();
    }
    function markGesture(event) {
        if (!event.isTrusted) return;
        gesture = true;
        unlock();
    }
    document.addEventListener('pointerdown', markGesture, { passive: true });
    document.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') markGesture(event); });
    button.addEventListener('click', event => {
        gesture = event.isTrusted || gesture; enabled = !enabled;
        try { localStorage.setItem('wiiu-sound', enabled ? 'on' : 'off'); } catch {}
        sync(); unlock(); if (enabled) tone('click');
    });
    document.addEventListener('click', event => {
        if (event.target.closest('[data-sound]')) return;
        if (event.target.closest('a[href],button,[role="button"],summary')) tone('click');
    });
    document.addEventListener('pointerover', event => {
        if (event.pointerType !== 'mouse' || !matchMedia('(pointer:fine)').matches) return;
        const control = event.target.closest('a[href],button,[role="button"],summary');
        if (control && control !== hovered) { hovered = control; tone('hover'); }
    }, { passive: true });
    addEventListener('wiiu:opened', () => tone('open'));
    addEventListener('wiiu:motionchange', sync); document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    addEventListener('pagehide', () => { leaving = true; sync(); });
    addEventListener('pageshow', () => { leaving = false; sync(); });
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class','lang'] });
    sync();
})();
