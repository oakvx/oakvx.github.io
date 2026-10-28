/* Compagno fisso: reagisce a scroll, click, fondo pagina e inattività. */
(() => {
    'use strict';
    try { if (sessionStorage.getItem('companion-hidden') === '1') return; } catch (e) {}
    const BASE = document.currentScript.src.replace(/companion\.js.*$/, '');
    const EXT = { drunkwandering: 'webp', flyspinning: 'webp', showingoff: 'webp' };
    const file = p => `${BASE}${p}.${EXT[p] || 'gif'}`;
    const still = p => `${BASE}${p}-still.webp`;
    const root = document.documentElement;
    const paused = () => document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches ||
        root.classList.contains('calm') || root.classList.contains('paused') || root.classList.contains('motion-paused') || root.dataset.motion === 'paused';

    const box = document.createElement('div');
    box.className = 'companion';
    box.innerHTML = '<button type="button" class="companion__pic" aria-label="Cambia posa dell’avatar"><img width="512" height="512" alt="" decoding="async"></button>' +
        '<button type="button" class="companion__x" aria-label="Nascondi l’avatar">×</button><span class="companion__bubble" aria-hidden="true"></span>';
    document.body.appendChild(box);
    const img = box.querySelector('img'), bubble = box.querySelector('.companion__bubble');
    let pose = '', lock = 0, bubbleT, pointerTarget = null, activeTimer;
    const canFollowPointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const visitedKey = 'companion-visited-links';
    const readVisited = () => { try { return new Set(JSON.parse(localStorage.getItem(visitedKey) || '[]')); } catch (e) { return new Set(); } };
    let visitedLinks = readVisited();
    const linkKey = link => { try { const u = new URL(link.href, location.href); return u.origin === location.origin ? u.pathname + u.search + u.hash : ''; } catch (e) { return ''; } };
    const isVisited = link => { const key = linkKey(link); return !!key && visitedLinks.has(key); };

    const show = (p) => {
        if (p === pose) return;
        pose = p;
        img.dataset.avatarAnimated = file(p);
        img.dataset.avatarStill = still(p);
        img.src = paused() ? still(p) : file(p);
    };
    new MutationObserver(() => { if (pose) img.src = paused() ? still(pose) : file(pose); })
        .observe(root, { attributes: true, attributeFilter: ['class', 'data-motion'] });
    document.addEventListener('visibilitychange', () => { if (pose) img.src = paused() ? still(pose) : file(pose); });

    const say = txt => {
        bubble.textContent = txt; bubble.classList.add('is-on');
        clearTimeout(bubbleT); bubbleT = setTimeout(() => bubble.classList.remove('is-on'), 2600);
    };

    let idleT, restT, scrollT, scrolling = false;
    const rest = () => { if (Date.now() < lock || (canFollowPointer && pointerTarget)) return; show(atBottom() ? 'dancing' : 'standing'); };
    if (canFollowPointer) {
        box.classList.add('is-pointer');
    }
    const interactive = node => node && node.closest('a[href],button:not(:disabled),[role="button"],summary,[data-cycle]');
    const setPointerState = (target, state) => {
        pointerTarget = target;
        box.dataset.state = state || 'rest';
        if (state === 'active') show('angrystomping');
        else if (state === 'visited') show('laughing');
        else if (state === 'hover') show('showingoff');
        else if (!lock) rest();
    };
    if (canFollowPointer) {
        addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
            const x = Math.max(0, Math.min(innerWidth - box.offsetWidth, event.clientX + 12));
            const y = Math.max(0, Math.min(innerHeight - box.offsetHeight, event.clientY + 10));
            box.style.setProperty('--cursor-x', `${x}px`); box.style.setProperty('--cursor-y', `${y}px`);
            box.classList.add('has-pointer');
            const target = interactive(document.elementFromPoint(event.clientX, event.clientY));
            if (target !== pointerTarget) setPointerState(target, target ? (target.matches('a[href]') && isVisited(target) ? 'visited' : 'hover') : 'rest');
        }, { passive: true });
        addEventListener('pointerdown', event => {
            const target = interactive(event.target);
            if (!target) return;
            setPointerState(target, 'active');
            clearTimeout(activeTimer);
            activeTimer = setTimeout(() => setPointerState(target, target.matches('a[href]') && isVisited(target) ? 'visited' : 'hover'), 700);
        }, { passive: true });
        addEventListener('pointerup', () => {
            clearTimeout(activeTimer);
            if (pointerTarget) setPointerState(pointerTarget, pointerTarget.matches('a[href]') && isVisited(pointerTarget) ? 'visited' : 'hover');
        }, { passive: true });
        document.addEventListener('click', event => {
            const link = event.target.closest('a[href]');
            const key = link && linkKey(link);
            if (!key) return;
            visitedLinks.add(key);
            if (visitedLinks.size > 120) visitedLinks = new Set([...visitedLinks].slice(-120));
            try { localStorage.setItem(visitedKey, JSON.stringify([...visitedLinks])); } catch (e) {}
            if (link === pointerTarget) setPointerState(link, 'visited');
        }, true);
    }
    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 80;
    const wake = () => {
        clearTimeout(idleT);
        if (pose === 'sleeping') { show('almostfalling'); say('...ero sveglio'); lock = Date.now() + 1400; clearTimeout(restT); restT = setTimeout(rest, 1500); }
        idleT = setTimeout(() => { lock = 0; if (!pointerTarget) show('sleeping'); }, 25000);
    };

    const toys = ['laughing', 'showingoff', 'discofever', 'flyspinning', 'angrystomping', 'dancing', 'idlewainting'];
    const lines = { laughing: 'ahah', showingoff: 'guarda qua', discofever: 'si balla', flyspinning: 'wheee', angrystomping: 'uffa', dancing: '♪', idlewainting: 'aspetto' };
    let last = '';
    box.querySelector('.companion__pic').addEventListener('click', () => {
        let p; do { p = toys[Math.floor(Math.random() * toys.length)]; } while (p === last);
        last = p; lock = Date.now() + 4200; show(p); say(lines[p]);
        clearTimeout(restT); restT = setTimeout(rest, 4300); wake();
    });
    box.querySelector('.companion__x').addEventListener('click', () => {
        box.hidden = true;
        try { sessionStorage.setItem('companion-hidden', '1'); } catch (e) {}
    });

    addEventListener('scroll', () => {
        wake();
        if (paused()) return;
        if (!scrolling && Date.now() >= lock) { scrolling = true; show('drunkwandering'); }
        clearTimeout(scrollT);
        scrollT = setTimeout(() => { scrolling = false; rest(); }, 900);
    }, { passive: true });
    ['pointerdown', 'keydown', 'mousemove'].forEach(ev => addEventListener(ev, () => { if (pose === 'sleeping') wake(); }, { passive: true }));

    show('standing');
    idleT = setTimeout(() => { lock = 0; if (!pointerTarget) show('sleeping'); }, 25000);
})();
