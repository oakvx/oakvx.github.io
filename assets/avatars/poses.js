/* Saluti del Mii e cambio posa sugli avatar con data-cycle. */
(() => {
    'use strict';
    const BASE = document.currentScript.src.replace(/poses\.js.*$/, '');
    const EXT = { drunkwandering: 'webp', flyspinning: 'webp', showingoff: 'webp' };
    const file = p => `${BASE}${p}.${EXT[p] || 'gif'}`;
    const still = p => `${BASE}${p}-still.webp`;

    function setPose(picture, pose) {
        const img = picture.querySelector('img');
        const src = picture.querySelector('source');
        img.dataset.avatarAnimated = file(pose);
        img.dataset.avatarStill = still(pose);
        if (src) src.setAttribute('srcset', still(pose));
        picture.dataset.avatarPose = pose;
        const paused = document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches ||
            document.documentElement.classList.contains('calm') || document.documentElement.dataset.motion === 'paused';
        img.setAttribute('src', paused ? still(pose) : file(pose));
    }

    const hero = document.querySelector('[data-hero-shot] [data-avatar]');
    addEventListener('wiiu:greet', () => {
        if (hero && !document.documentElement.classList.contains('calm')) setPose(hero, 'showingoff');
    });
    addEventListener('wiiu:plazagreet', () => {
        const avatar = document.querySelector('[data-plaza] .work__avatar');
        if (avatar && !document.documentElement.classList.contains('calm')) setPose(avatar, 'showingoff');
    });
    document.querySelectorAll('[data-cycle]').forEach(el => {
        const picture = el.matches('picture') ? el : el.querySelector('picture');
        const poses = el.dataset.cycle.split(',');
        let i = Math.max(0, poses.indexOf(picture.dataset.avatarPose));
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        const next = () => { i = (i + 1) % poses.length; setPose(picture, poses[i]); };
        el.addEventListener('click', next);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
    });
})();
