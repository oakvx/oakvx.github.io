/* Native document transitions and progressive, original channel interactions. */
(() => {
    'use strict';
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const script = document.currentScript;
    const site = new URL('../../', script.src);
    const stored = (key, value) => { try { if (value === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, value); } catch {} return null; };
    const stopped = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const route = value => { try { return new URL(value, location.href).pathname.replace(/index\.html$/, ''); } catch { return ''; } };
    const project = value => route(value).match(/\/projects\/(synk|beautify|brat-animator|autoofficina)\//)?.[1];
    const home = value => route(value) === site.pathname;
    let chosen = null;

    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.download || link.target === '_blank') return;
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || route(url) === route(location.href)) return;
        chosen = { url: url.href, tile: link.closest('[data-proj]')?.querySelector('[data-print-work]') || link.closest('[data-channel]') };
    }, true);

    function names(element, name, transition) {
        if (!element) return;
        element.style.viewTransitionName = name;
        transition.ready.catch(() => {});
        transition.finished.finally(() => element.style.removeProperty('view-transition-name'));
    }
    function direction(activation, fallback) {
        if (activation?.navigationType === 'traverse') {
            if (Number.isFinite(activation.from?.index) && Number.isFinite(activation.entry?.index)) return activation.entry.index < activation.from.index ? 'back' : 'forward';
            return 'back';
        }
        return fallback || 'forward';
    }
    addEventListener('pageswap', event => {
        const transition = event.viewTransition;
        if (!transition) return;
        if (stopped() || location.protocol === 'file:') return transition.skipTransition();
        root.classList.add('is-navigating');
        transition.finished.finally(() => root.classList.remove('is-navigating'));
        const to = event.activation?.entry?.url || chosen?.url;
        if (!to) return;
        const slug = home(location.href) ? project(to) : home(to) ? project(location.href) : null;
        const detail = { from: location.href, to, direction: direction(event.activation), kind: slug ? 'project' : 'page', slug };
        stored('wiiu-navigation', JSON.stringify(detail));
        root.dataset.navDirection = detail.direction;
        root.dataset.navKind = detail.kind;
        if (slug) names(home(location.href) ? chosen?.tile || document.querySelector('[data-project="'+slug+'"] [data-print-work]') : document.querySelector('.page-hero'), 'project-'+slug, transition);
    });
    addEventListener('pagereveal', event => {
        const transition = event.viewTransition;
        if (!transition) return;
        if (stopped() || location.protocol === 'file:') return transition.skipTransition();
        root.classList.add('is-navigating');
        let previous;
        try { previous = JSON.parse(stored('wiiu-navigation') || 'null'); } catch {}
        const activation = window.navigation?.activation;
        const from = activation?.from?.url || previous?.from;
        const slug = project(location.href) && home(from) ? project(location.href) : home(location.href) ? project(from) : null;
        const backwards = direction(activation, home(location.href) && project(from) ? 'back' : previous?.direction);
        root.dataset.navDirection = backwards;
        root.dataset.navKind = slug ? 'project' : 'page';
        transition.types?.add?.(backwards);
        if (slug) names(home(location.href) ? document.querySelector('[data-project="'+slug+'"] [data-print-work]') : document.querySelector('.page-hero'), 'project-'+slug, transition);
        transition.ready.catch(() => {});
        transition.finished.finally(() => {
            root.classList.remove('is-navigating');
            delete root.dataset.navKind;
            delete root.dataset.navDirection;
            dispatchEvent(new CustomEvent('wiiu:opened'));
        });
        dispatchEvent(new CustomEvent('wiiu:transition', { detail: { direction: backwards, kind: slug ? 'project' : 'page', slug } }));
    });

    function boot() {
        const channels = [...document.querySelectorAll('[data-channel]')];
        let selected = channels[0] || document.querySelector('main a[href]');
        channels.forEach(channel => {
            const choose = () => {
                selected = channel;
                channels.forEach(item => item.classList.toggle('is-selected', item === channel));
            };
            channel.addEventListener('focus', choose);
            channel.addEventListener('pointerenter', choose);
        });
        document.querySelector('[data-channel-open]')?.addEventListener('click', () => selected?.click());
        document.querySelector('[data-channel-back]')?.addEventListener('click', () => history.length > 1 ? history.back() : location.assign(site.href));
        const syncDock = () => {
            const language = root.lang === 'en' ? 'en-GB' : 'it-IT';
            document.querySelectorAll('[data-dock-date]').forEach(item => item.textContent = new Date().toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' }));
            document.querySelectorAll('[data-network-status]').forEach(item => item.textContent = navigator.onLine ? 'Online' : 'Offline');
        };
        syncDock();
        addEventListener('online', syncDock); addEventListener('offline', syncDock);
        new MutationObserver(syncDock).observe(root, { attributes: true, attributeFilter: ['lang'] });
        setInterval(() => { if (!document.hidden) syncDock(); }, 60000);
        if (channels.length && !stored('wiiu-menu-seen')) {
            stored('wiiu-menu-seen', '1');
            if (!stopped()) document.querySelector('[data-channel-menu]')?.classList.add('is-first-entry');
            dispatchEvent(new CustomEvent('wiiu:greet'));
        }
        const fine = matchMedia('(hover:hover) and (pointer:fine)');
        channels.forEach(channel => {
            let frame = 0;
            channel.addEventListener('pointermove', event => {
                if (!fine.matches || stopped() || frame) return;
                frame = requestAnimationFrame(() => {
                    frame = 0;
                    const box = channel.getBoundingClientRect();
                    channel.style.setProperty('--tilt-x', ((.5-(event.clientY-box.top)/box.height)*3).toFixed(2)+'deg');
                    channel.style.setProperty('--tilt-y', (((event.clientX-box.left)/box.width-.5)*3).toFixed(2)+'deg');
                });
            }, { passive: true });
            channel.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame=0; channel.style.removeProperty('--tilt-x'); channel.style.removeProperty('--tilt-y'); });
        });
        let previousState = '';
        const syncMotion = () => {
            const state = String(stopped()) + document.hidden;
            if (state === previousState) return;
            previousState = state;
            root.classList.toggle('is-background', document.hidden);
            if (stopped()) document.getAnimations().forEach(animation => animation.cancel());
            dispatchEvent(new CustomEvent('wiiu:motionchange', { detail: { stopped: stopped() || document.hidden } }));
        };
        new MutationObserver(syncMotion).observe(root, { attributes: true, attributeFilter: ['class'] });
        reduced.addEventListener('change', syncMotion);
        document.addEventListener('visibilitychange', syncMotion);
        syncMotion();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
