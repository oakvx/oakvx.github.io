/* Connect the local GIFs to the site's motion preferences; no dependencies. */
(() => {
    'use strict';

    const root = document.documentElement;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const pictures = [...document.querySelectorAll('[data-avatar]')];
    const visible = new WeakSet();
    pictures.forEach(picture => {
        const box = picture.getBoundingClientRect();
        if (box.width && box.height && box.bottom > 0 && box.top < innerHeight) visible.add(picture);
    });

    function sync() {
        const paused = document.hidden || reducedMotion.matches ||
            ['paused', 'calm', 'motion-paused', 'is-navigating'].some(name => root.classList.contains(name)) ||
            root.dataset.motion === 'paused';

        pictures.forEach(picture => {
            const img = picture.querySelector('img');
            const src = paused || !visible.has(picture) ? img.dataset.avatarStill : img.dataset.avatarAnimated;
            if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        });

    }

    new MutationObserver(sync).observe(root, {
        attributes: true,
        attributeFilter: ['class', 'data-motion']
    });
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
            sync();
        });
        pictures.forEach(picture => observer.observe(picture));
    } else pictures.forEach(picture => visible.add(picture));
    sync();
})();
