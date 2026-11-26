/* Homepage loader: shown on the first visit of the session, removed as soon as fonts are ready. */
(() => {
    'use strict';

    const root = document.documentElement;
    if (!root.hasAttribute('data-home')) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const stopped = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    let finished = false;
    let loaderTimer = 0;

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(loaderTimer);
        root.classList.remove('home-loading');
        const loader = document.querySelector('[data-home-loader]');
        if (loader) setTimeout(() => loader.remove(), 140);
    }

    addEventListener('wiiu:motionchange', () => { if (stopped()) finish(); });
    new MutationObserver(() => { if (stopped()) finish(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    reduced.addEventListener('change', () => { if (stopped()) finish(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
    addEventListener('pagehide', finish);

    if (root.classList.contains('home-loading')) {
        const elapsed = performance.now() - Number(root.dataset.homeBoot || 0);
        loaderTimer = setTimeout(finish, Math.max(0, 650 - elapsed));
        Promise.all([
            new Promise(resolve => setTimeout(resolve, Math.max(0, 280 - elapsed))),
            (document.fonts?.ready || Promise.resolve()).catch(() => {})
        ]).then(finish);
    } else finish();
})();
