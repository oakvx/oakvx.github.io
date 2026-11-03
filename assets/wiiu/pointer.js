/* Macrowave pointer. Native editing/selection; one scheduled frame, no interpolation. */
(() => {
    'use strict';
    const root = document.documentElement;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (typeof HTMLElement.prototype.showPopover !== 'function') return;
    const imageURL = new URL('pointer.png', document.currentScript.src);
    const native = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),button:disabled,[aria-disabled="true"],iframe,video[controls],audio[controls]';
    const interactive = 'a[href],button:not(:disabled),[role="button"]:not([aria-disabled="true"]),summary,[data-cycle]';
    const pointer = document.createElement('div');
    pointer.className = 'wiiu-pointer';
    pointer.setAttribute('aria-hidden', 'true');
    pointer.setAttribute('popover', 'manual');
    pointer.style.pointerEvents = 'none';
    pointer.innerHTML = '<span class="wiiu-pointer__hand"><span class="wiiu-pointer__image"></span></span><span class="wiiu-pointer__ripple"></span>';
    let loaded = false, available = false, visible = false, mouse = false;
    let x = 0, y = 0, frame = 0, raise = false, pressed = false, click = false;
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    // Future plaza figures can read viewport coordinates or subscribe once per frame.
    const state = Object.freeze({ get x() { return x; }, get y() { return y; }, get active() { return visible; } });
    Object.defineProperty(window, 'wiiuPointer', { value: state, configurable: true });
    const publish = () => dispatchEvent(new CustomEvent('wiiu:pointermove', { detail: { x, y, active: visible } }));
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    function hide() {
        mouse = visible = pressed = false;
        pointer.classList.remove('is-visible', 'is-pressed', 'is-clicked');
        root.classList.remove('wiiu-pointer-visible');
        publish();
    }
    function disable() {
        available = false;
        root.classList.remove('wiiu-pointer-ready');
        hide();
        if (pointer.matches(':popover-open')) pointer.hidePopover();
    }
    function enable() {
        if (!loaded || !fine.matches) return disable();
        try {
            if (!pointer.isConnected) document.body.append(pointer);
            if (!pointer.matches(':popover-open')) pointer.showPopover();
            if (getComputedStyle(pointer).width !== '32px' || getComputedStyle(pointer.querySelector('.wiiu-pointer__image')).backgroundImage === 'none') return disable();
            available = true;
            root.classList.add('wiiu-pointer-ready');
        } catch { disable(); }
    }
    function render() {
        frame = 0;
        if (!available || !mouse || document.hidden) return;
        if (raise) {
            raise = false;
            try { if (pointer.matches(':popover-open')) pointer.hidePopover(); pointer.showPopover(); }
            catch { disable(); return; }
        }
        const target = document.elementFromPoint(x, y);
        visible = !!target && !target.closest(native);
        pointer.style.transform = `translate3d(${x - 7}px,${y}px,0)`;
        pointer.classList.toggle('is-visible', visible);
        pointer.classList.toggle('is-hover', visible && !!target.closest(interactive));
        pointer.classList.toggle('is-pressed', visible && pressed);
        root.classList.toggle('wiiu-pointer-visible', visible);
        if (click) {
            click = false;
            pointer.classList.remove('is-clicked');
            if (visible && !calm()) {
                void pointer.offsetWidth;
                pointer.classList.add('is-clicked');
            }
        }
        publish();
    }
    addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') { hide(); return; }
        if (!available) return;
        mouse = true; x = event.clientX; y = event.clientY;
        schedule();
    }, { passive: true, capture: true });
    addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse') { hide(); return; }
        if (!available || event.button !== 0) return;
        mouse = true; x = event.clientX; y = event.clientY; pressed = click = true;
        schedule();
    }, { passive: true, capture: true });
    addEventListener('pointerup', () => { pressed = false; schedule(); }, { passive: true, capture: true });
    addEventListener('pointercancel', hide, { passive: true });
    document.addEventListener('pointerleave', hide);
    addEventListener('blur', hide);
    addEventListener('keydown', hide, { capture: true });
    addEventListener('pageswap', hide);
    addEventListener('pageshow', enable);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
    addEventListener('scroll', schedule, { passive: true, capture: true });
    const promote = event => {
        if (event.target === pointer || !available) return;
        if (event.target.matches?.('dialog[open],:popover-open')) { raise = true; schedule(); }
    };
    document.addEventListener('toggle', promote, true);
    new MutationObserver(records => {
        if (!available) return;
        if (records.some(record => record.target !== pointer &&
            (record.type === 'attributes' && record.target.matches('dialog[open]') ||
             [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('dialog[open]') || node.querySelector('dialog[open]')))))) {
            raise = true; schedule();
        }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    fine.addEventListener('change', enable);
    const image = new Image();
    image.src = imageURL.href;
    image.decode().then(() => { loaded = image.naturalWidth === 32 && image.naturalHeight === 32; enable(); }).catch(disable);
})();
