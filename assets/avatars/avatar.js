/* Connect the local GIFs to the site's motion preferences; no dependencies. */
(() => {
    'use strict';

    const root = document.documentElement;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const pictures = [...document.querySelectorAll('[data-avatar]')];

    function sync() {
        const paused = document.hidden || reducedMotion.matches ||
            ['paused', 'calm', 'motion-paused'].some(name => root.classList.contains(name)) ||
            root.dataset.motion === 'paused';

        pictures.forEach(picture => {
            const img = picture.querySelector('img');
            const src = paused ? img.dataset.avatarStill : img.dataset.avatarAnimated;
            if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        });

    }

    new MutationObserver(sync).observe(root, {
        attributes: true,
        attributeFilter: ['class', 'data-motion']
    });
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
})();
