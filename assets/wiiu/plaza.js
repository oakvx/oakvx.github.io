/* Piazza dei repository, in stile WaraWara Plaza.
   La lista ordinata nel markup è il contenuto e funziona senza questo script.
   Qui aggiungiamo solo scenografia: una piazza proiettata in prospettiva, Mii che si
   radunano attorno alle icone (più il repo è attivo, più gente), fumetti con dati veri
   del repository e una lente "liquid glass" attorno alle miniature.

   Struttura:
     1. utilità e preferenze di movimento
     2. camera e proiezione (mondo 3D → schermo)
     3. lente liquid glass (mappa di spostamento SVG generata al volo)
     4. dati: gruppi (un repo = un gruppo) e Mii
     5. simulazione dei Mii (stati con transizioni morbide)
     6. disegno: piazza, ombre, Mii
     7. fumetti (DOM, testo tradotto dal markup)
     8. icone e avatar (DOM proiettato)
     9. dati live da GitHub (stelle, date, repo nuovi)
    10. input, ciclo e ciclo di vita                                            */
(() => {
    'use strict';

    /* ------------------------------------------------------------ 1. utilità */
    const section = document.querySelector('[data-plaza]');
    const stage = section?.querySelector('[data-plaza-stage]');
    if (!section || !stage || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const root = document.documentElement;
    const list = stage.querySelector('[data-work-list]');
    const head = section.querySelector('.plaza__head');
    const me = stage.querySelector('.plaza__me');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 767px)');
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const english = () => (root.lang || 'it').toLowerCase().startsWith('en');

    const TAU = Math.PI * 2;
    const MII_H = 1.76; // altezza di un Mii in unità mondo
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
    const smooth = t => t * t * (3 - 2 * t);
    function rng(seed) {
        let a = seed >>> 0;
        return () => {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const hash = text => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
    const pickWith = (r, items) => items[Math.floor(r() * items.length)];
    const hexRGB = hex => hex.replace('#', '').match(/../g).map(p => parseInt(p, 16));
    // mescola un colore verso il bianco (amt > 0) o verso il nero (amt < 0)
    function shade(hex, amt) {
        const [r, g, b] = hexRGB(hex), t = amt < 0 ? 0 : 255, k = Math.abs(amt);
        return `rgb(${Math.round(r + (t - r) * k)},${Math.round(g + (t - g) * k)},${Math.round(b + (t - b) * k)})`;
    }
    const alpha = (hex, a) => { const [r, g, b] = hexRGB(hex); return `rgba(${r},${g},${b},${a})`; };

    canvas.className = 'plaza__crowd';
    canvas.setAttribute('aria-hidden', 'true');
    stage.prepend(canvas);
    const bubbleLayer = document.createElement('div');
    bubbleLayer.className = 'plaza__bubbles';
    bubbleLayer.setAttribute('aria-hidden', 'true');
    stage.append(bubbleLayer);
    section.setAttribute('data-plaza-ready', '');

    /* -------------------------------------------------- 2. camera e proiezione
       Mondo: x → destra, y → alto (0 = suolo), z → lontano. Una sola rotazione
       (pitch): la piazza si esplora traslando, come sul Wii U.                  */
    const cam = { x: 0, y: 6.4, z: -15, pitch: .3, tx: 0, tz: -15, baseZ: -15 };
    let W = 0, H = 0, DPR = 1, F = 900, CX = 0, CY = 0, cp = 1, sp = 0;
    const setPitch = p => { cam.pitch = p; cp = Math.cos(p); sp = Math.sin(p); };
    function view(x, y, z) {
        const dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
        return { vx: dx, vy: dy * cp + dz * sp, vz: -dy * sp + dz * cp };
    }
    function project(x, y, z) {
        const v = view(x, y, z);
        if (v.vz < .4) return null;
        return { x: CX + F * v.vx / v.vz, y: CY - F * v.vy / v.vz, s: F / v.vz, vz: v.vz };
    }
    const NEAR = .5;
    function segment(a, b) {
        let va = view(a[0], a[1], a[2]), vb = view(b[0], b[1], b[2]);
        if (va.vz < NEAR && vb.vz < NEAR) return null;
        const cut = (p, q) => { const t = (NEAR - p.vz) / (q.vz - p.vz); return { vx: lerp(p.vx, q.vx, t), vy: lerp(p.vy, q.vy, t), vz: NEAR }; };
        if (va.vz < NEAR) va = cut(va, vb); else if (vb.vz < NEAR) vb = cut(vb, va);
        return [CX + F * va.vx / va.vz, CY - F * va.vy / va.vz, CX + F * vb.vx / vb.vz, CY - F * vb.vy / vb.vz];
    }

    /* ------------------------------------------------- 3. lente liquid glass
       Chromium accetta un filtro SVG in backdrop-filter: generiamo una mappa di
       spostamento per un quadrato arrotondato, nulla al centro e forte sul bordo,
       così la cornice di vetro piega la piazza che sta dietro. Gli altri browser
       tengono il vetro smerigliato del CSS con lo stesso riflesso speculare.   */
    const refract = !!navigator.userAgentData?.brands?.some(b => /chrom/i.test(b.brand));
    const SVGNS = 'http://www.w3.org/2000/svg';
    const defs = document.createElementNS(SVGNS, 'svg');
    defs.setAttribute('class', 'plaza__defs');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('width', '0');
    defs.setAttribute('height', '0');
    section.append(defs);
    let lensSize = 0;
    function buildLens(size) {
        if (!refract || size === lensSize) return;
        lensSize = size;
        const S = size, R = Math.round(S * .27), B = Math.max(6, Math.round(S * .085));
        const map = document.createElement('canvas');
        map.width = map.height = S;
        const mx = map.getContext('2d'), img = mx.createImageData(S, S), d = img.data;
        const half = S / 2;
        const sd = (x, y) => {
            const qx = Math.abs(x) - (half - R), qy = Math.abs(y) - (half - R);
            return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - R;
        };
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
            const x = i + .5 - half, y = j + .5 - half, dist = sd(x, y), o = (j * S + i) * 4;
            let ox = 0, oy = 0;
            if (dist < 0 && -dist < B) {
                const gx = sd(x + .5, y) - sd(x - .5, y), gy = sd(x, y + .5) - sd(x, y - .5);
                const len = Math.hypot(gx, gy) || 1;
                // profilo convesso: piega forte vicino al bordo, svanisce verso la miniatura
                const m = Math.pow(1 + dist / B, 1.7);
                ox = -gx / len * m; oy = -gy / len * m;
            }
            d[o] = 128 + ox * 127; d[o + 1] = 128 + oy * 127; d[o + 2] = 128; d[o + 3] = 255;
        }
        mx.putImageData(img, 0, 0);
        defs.innerHTML = `<filter id="plaza-lens" x="0" y="0" width="${S}" height="${S}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation=".6" result="soft"/>
            <feImage href="${map.toDataURL()}" x="0" y="0" width="${S}" height="${S}" preserveAspectRatio="none" result="map"/>
            <feDisplacementMap in="soft" in2="map" scale="${(B * 2.1).toFixed(1)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
        section.classList.add('plaza--refract');
    }

    /* ------------------------------------------------------ 4. gruppi e Mii */
    const PALETTE = {
        skin: ['#ffdcc0', '#f6c79e', '#e8b081', '#c98d5d', '#a06a42', '#7a4c2d'],
        hair: ['#2b211c', '#3d2a1e', '#5a3720', '#8a5129', '#b7843f', '#d9b56b', '#8d8d8d', '#1d1d24', '#6b2f22'],
        // i dodici colori preferiti dei Mii
        shirt: ['#d8352d', '#f0782a', '#f2c933', '#89c23b', '#21883f', '#2c5bc4', '#3daee3', '#ee6aa7', '#7c4ab8', '#7b4a2a', '#f4f4f4', '#3a3a40'],
        pants: ['#3b4a66', '#4a4f5c', '#2f3a52', '#5b6577', '#6b5845']
    };
    const LANG_COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', Python: '#3572a5', PHP: '#4f5d95', Java: '#b07219', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600', Shell: '#89e051', Go: '#00add8', Rust: '#dea584', Markdown: '#083fa1' };

    let groups = [], miis = [], centre = null, walkers = null;
    let iconSize = 168, entered = false, entranceT = -1;

    // Folla proporzionale all'attività reale del repository (come sul Wii U,
    // dove la folla attorno a un gioco misurava quanto se ne parlava).
    function crowdFor(item) {
        const stars = +item.dataset.stars || 0, size = +item.dataset.size || 0;
        const days = (Date.now() - Date.parse(item.dataset.pushed || 0)) / 864e5;
        const recent = days < 14 ? 2 : days < 60 ? 1 : 0;
        return clamp(Math.round(2 + stars * 1.2 + Math.log10(size + 1) + recent), 2, 10);
    }

    // su schermi meno larghi la piazza si stringe invece di rimpicciolire le icone
    const squeeze = () => Math.round(clamp((innerWidth / Math.max(innerHeight, 1)) / 1.7, .62, 1) * 20) / 20;
    let layoutSqueeze = 0;
    function layoutSlots(n, mobile) {
        layoutSqueeze = squeeze();
        const slots = [];
        if (mobile) {
            // zig-zag in profondità: ogni icona ha la sua fila, così non si coprono
            for (let i = 0; i < n; i++) slots.push({ x: (i % 2 ? 1 : -1) * 1.85, z: 1.4 + i * 3.4 });
            return slots;
        }
        // arco attorno al centro, con profondità alternate come nella piazza originale;
        // gli slot centrali (i più in vista) vanno ai progetti aggiornati più di recente
        const order = [];
        for (let k = 0; k < n; k++) order.push(k);
        order.sort((a, b) => Math.abs(a - (n - 1) / 2) - Math.abs(b - (n - 1) / 2) || a - b);
        const width = Math.min(11, 2.2 * n) * squeeze();
        order.forEach(k => {
            const u = n === 1 ? 0 : k / (n - 1) * 2 - 1;
            const deep = k % 2 === (n % 2 ? 0 : 1);
            slots.push({ x: u * width, z: (deep ? 6.2 : 1.6) + (1 - u * u) * 3.2 });
        });
        return slots;
    }

    function makeMii(group, r, extra = {}) {
        const friend = group.kind === 'centre';
        const look = {
            skin: pickWith(r, PALETTE.skin),
            hair: pickWith(r, PALETTE.hair),
            style: Math.floor(r() * 7),
            shirt: group.tint && r() < .28 ? group.tint : pickWith(r, PALETTE.shirt),
            pants: friend ? '#f0872c' : pickWith(r, PALETTE.pants),
            scale: .9 + r() * .16,
            brow: (r() - .5) * .5,
            blush: r() < .45,
            eyes: r() < .2 ? 1 : 0,
            seed: r() * 100
        };
        if (look.shirt === '#f4f4f4' && look.pants === '#f4f4f4') look.pants = PALETTE.pants[0];
        const a = r() * TAU, rr = Math.sqrt(r()) * group.radius;
        const m = {
            group, look, id: miis.length,
            x: group.x + Math.cos(a) * rr, z: group.z + Math.sin(a) * rr * .8, y: 0,
            tx: 0, tz: 0, speed: 1, moving: 0, gait: 0, phase: r() * TAU,
            state: 'idle', timer: .5 + r() * 4, face: 0, faceT: 0, back: 0, backT: 0,
            sit: 0, sitT: 0, wave: 0, waveT: 0, cheer: 0, cheerT: 0, hop: -1, talk: 0,
            blink: 2 + r() * 4, gaze: null, delay: 0, bubble: null, sx: 0, sy: 0, sr: 0, ...extra
        };
        m.tx = m.x; m.tz = m.z;
        // il Mii guarda verso l'icona del suo gruppo, come i veri Mii in piazza
        m.faceT = clamp((group.x - m.x) * .4, -.7, .7);
        return m;
    }

    function readGroups() {
        const items = [...list.querySelectorAll(':scope > .repo')];
        const mobile = narrow.matches;
        const slots = layoutSlots(items.length, mobile);
        const old = new Map(groups.map(g => [g.el, g]));
        groups = items.map((el, i) => {
            const prev = old.get(el);
            const lang = el.dataset.lang || '';
            const g = {
                kind: 'repo', el, i,
                icon: el.querySelector('.repo__icon'),
                name: el.querySelector('.repo__name'),
                posts: el.querySelector('.repo__posts'),
                x: slots[i].x, z: slots[i].z,
                h: mobile ? 3 : 3.55 + (i % 3) * .12,
                size: mobile ? 2.3 : 2.75,
                tint: getComputedStyle(el).getPropertyValue('--lang').trim() || LANG_COLORS[lang] || '#8a99a8',
                bob: prev?.bob ?? (hash(el.dataset.repo || String(i)) % 628) / 100,
                n: Math.max(1, Math.round(crowdFor(el) * (mobile ? .55 : 1))),
                hover: prev?.hover || false, cheerAt: -1,
                screen: prev?.screen || null, k: 1, light: prev?.light ?? 315
            };
            g.radius = (mobile ? .9 : 1.25) + g.n * (mobile ? .1 : .14);
            return g;
        });
        centre = { kind: 'centre', x: mobile ? 1.2 : 0, z: mobile ? -.2 : -.6, radius: mobile ? 1.1 : 1.9, tint: null, n: mobile ? 2 : 4, posts: null };
        walkers = { kind: 'walk', x: 0, z: mobile ? 8 : 5, radius: mobile ? 4 : 10, tint: null, n: mobile ? 3 : 8, posts: null };
    }

    function populate() {
        readGroups();
        miis = [];
        const all = [...groups, centre, walkers];
        all.forEach(g => {
            const r = rng(hash((g.el?.dataset.repo || g.kind) + ':' + g.n));
            for (let k = 0; k < g.n; k++) {
                const m = makeMii(g, r);
                // nessuno sotto l'avatar: il centro è di Gabriele
                if (g.kind === 'centre') { const a = (k / g.n) * TAU + .4; m.x = g.x + Math.cos(a) * g.radius; m.z = g.z + .9 + Math.abs(Math.sin(a)) * g.radius * .5; }
                if (g.kind === 'walk') { m.x = (r() - .5) * 18; m.z = -1 + r() * 11; }
                m.tx = m.x; m.tz = m.z;
                miis.push(m);
            }
        });
        miis.forEach((m, i) => m.id = i);
        section.dataset.plazaFigures = miis.length;
    }

    // all'arrivo in vista i Mii entrano correndo da fuori scena, come all'accensione del Wii U
    function stageEntrance() {
        const r = rng(7);
        miis.forEach(m => {
            const side = m.group.x < -.5 ? -1 : m.group.x > .5 ? 1 : (r() < .5 ? -1 : 1);
            const fx = m.x, fz = m.z;
            m.x = side * (narrow.matches ? 7.5 : 17) + side * r() * 3;
            m.z = fz + (r() - .5) * 3 - 1;
            m.tx = fx; m.tz = fz;
            m.state = 'run'; m.speed = 3 + r() * .8; m.delay = .05 + r() * 1.1 + Math.abs(fx) * .02;
            m.timer = 9;
        });
        entranceT = 0;
        section.classList.add('is-entering');
        groups.forEach((g, i) => g.el.style.setProperty('--pop-delay', `${(.12 + i * .08).toFixed(2)}s`));
    }

    /* ------------------------------------------------------ 5. simulazione */
    let pointer = { x: 0, y: 0, inside: false };
    let time = 0;
    const lookAt = (m, x) => clamp((x - m.x) * .35, -.85, .85);
    function newTarget(m) {
        const g = m.group, a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * g.radius;
        if (g.kind === 'walk') {
            // i passanti attraversano la piazza da un gruppo all'altro
            const dest = groups.length ? groups[Math.floor(Math.random() * groups.length)] : g;
            m.tx = dest.x + Math.cos(a) * (dest.radius || 2) * 1.3; m.tz = dest.z + Math.sin(a) * (dest.radius || 2) * .9;
        } else if (g.kind === 'centre') {
            m.tx = g.x + Math.cos(a) * g.radius; m.tz = g.z + .7 + Math.abs(Math.sin(a)) * g.radius * .55;
        } else {
            m.tx = g.x + Math.cos(a) * rr; m.tz = g.z + Math.sin(a) * rr * .8;
        }
        m.state = 'walk'; m.speed = .7 + Math.random() * .6; m.timer = 12;
    }
    function chooseNext(m) {
        m.sitT = 0; m.waveT = 0;
        const r = Math.random();
        if (r < .34) { m.state = 'idle'; m.timer = 1.5 + Math.random() * 4; }
        else if (r < .5) { m.state = 'look'; m.timer = 2 + Math.random() * 3; m.gaze = Math.random() * 2 - 1; }
        else if (r < .65) { m.state = 'sit'; m.timer = 4 + Math.random() * 6; m.sitT = 1; }
        else if (r < .72) { m.state = 'wave'; m.timer = 1.6; m.waveT = 1; }
        else if (r < .78) { m.state = 'hop'; m.hop = 0; m.timer = .6; }
        else newTarget(m);
    }
    function cheer(m, delay) {
        if (m.state === 'run' || m.bubble) return;
        m.state = 'cheer'; m.timer = 1.25 + delay; m.delay = delay; m.sitT = 0; m.cheerT = 1; m.hop = -delay / .42;
    }

    function updateMii(m, dt) {
        if (m.delay > 0 && m.state === 'run') { m.delay -= dt; return; }
        m.timer -= dt;
        let vx = 0, vz = 0;
        if (m.state === 'walk' || m.state === 'run') {
            const dx = m.tx - m.x, dz = m.tz - m.z, d = Math.hypot(dx, dz);
            if (d < .12 || m.timer <= 0) {
                if (m.state === 'run') { m.state = 'idle'; m.timer = .4 + Math.random() * 1.6; m.faceT = lookAt(m, m.group.x ?? 0); }
                else chooseNext(m);
            } else {
                const sp = m.speed * smooth(clamp(d / .5, .25, 1));
                vx = dx / d * sp; vz = dz / d * sp;
            }
        } else if (m.timer <= 0) {
            if (m.state === 'cheer') { m.cheerT = 0; m.state = 'idle'; m.timer = .8 + Math.random() * 2; }
            else if (m.state === 'talk') { m.talk = 0; newTarget(m); }
            else if (m.state === 'idle' || m.state === 'look') { Math.random() < .55 ? newTarget(m) : chooseNext(m); }
            else newTarget(m);
        }
        m.x += vx * dt; m.z += vz * dt;
        const spd = Math.hypot(vx, vz);
        m.moving = damp(m.moving, spd > .05 ? 1 : 0, 10, dt);
        m.gait = damp(m.gait, clamp(spd / 1.1, 0, 1.4), 8, dt);
        // passo agganciato alla distanza percorsa: niente piedi che scivolano
        m.phase += spd * dt / (m.state === 'run' ? .62 : .5) * Math.PI;

        // dove guarda: direzione di marcia, l'icona sotto il puntatore, il puntatore, un'occhiata a caso
        if (spd > .05) { m.faceT = clamp(vx / spd, -1, 1) * .9; m.backT = vz / spd > .62 ? 1 : 0; }
        else {
            m.backT = 0;
            const hovered = groups.find(g => g.hover);
            if (hovered && Math.hypot(hovered.x - m.x, hovered.z - m.z) < 7) m.faceT = lookAt(m, hovered.x);
            else if (pointer.inside && Math.hypot(pointer.x - m.sx, pointer.y - m.sy) < 220) m.faceT = clamp((pointer.x - m.sx) / 140, -.85, .85);
            else if (m.state === 'look') m.faceT = Math.sin(time * .9 + m.look.seed) * .8 * (m.gaze || 1);
        }
        m.face = damp(m.face, m.faceT, 7, dt);
        m.back = damp(m.back, m.backT, 9, dt);
        m.sit = damp(m.sit, m.state === 'sit' ? 1 : 0, 6, dt);
        m.wave = damp(m.wave, m.state === 'wave' || (m.state === 'talk' && m.waveT) ? 1 : 0, 7, dt);
        m.cheer = damp(m.cheer, m.state === 'cheer' ? 1 : 0, 9, dt);
        m.talk = m.state === 'talk' ? 1 : 0;

        // saltelli: singolo (hop) o ripetuti (cheer), con piccola anticipazione
        m.y = 0;
        if (m.state === 'hop' || m.state === 'cheer') {
            m.hop += dt / .42;
            if (m.hop > 0) {
                const p = m.hop % 1;
                m.y = Math.sin(p * Math.PI) * (m.state === 'cheer' ? .34 : .42);
                if (m.state === 'hop' && m.hop >= 1) { m.y = 0; chooseNext(m); }
            }
        } else if (m.gait > .05) m.y = Math.abs(Math.sin(m.phase)) * .045 * m.gait;

        m.blink -= dt;
        if (m.blink < -.12) m.blink = 1.8 + Math.random() * 4.5;
    }

    // separazione leggera: i Mii non si compenetrano
    function separate(dt) {
        for (let i = 0; i < miis.length; i++) {
            const a = miis[i];
            if (a.delay > 0) continue;
            for (let j = i + 1; j < miis.length; j++) {
                const b = miis[j];
                const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz;
                if (d2 > .36 || d2 < 1e-6) continue;
                const d = Math.sqrt(d2), push = (.6 - d) * .5 * Math.min(1, dt * 8);
                const ux = dx / d * push, uz = dz / d * push;
                if (a.state !== 'sit') { a.x -= ux; a.z -= uz; }
                if (b.state !== 'sit') { b.x += ux; b.z += uz; }
            }
        }
    }

    /* ------------------------------------------------------------- 6. disegno */
    const spriteCache = {};
    function radial(key, rgb, inner) {
        if (spriteCache[key]) return spriteCache[key];
        const S = 128, c = document.createElement('canvas');
        c.width = c.height = S;
        const x = c.getContext('2d'), g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
        g.addColorStop(0, `rgba(${rgb},${inner})`);
        g.addColorStop(.55, `rgba(${rgb},${inner * .45})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        x.fillStyle = g; x.fillRect(0, 0, S, S);
        return spriteCache[key] = c;
    }
    function blob(sprite, x, y, rx, ry, a) {
        if (rx < .6) return;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, x - rx, y - ry, rx * 2, ry * 2);
        ctx.globalAlpha = 1;
    }
    const tintSprites = new Map();
    function tintSprite(hex) {
        if (!tintSprites.has(hex)) tintSprites.set(hex, radial('t' + hex, hexRGB(hex).join(','), .55));
        return tintSprites.get(hex);
    }

    const clouds = Array.from({ length: 6 }, (_, i) => ({ x: -22 + i * 8.5, z: 2 + (i * 7.3) % 20, r: 4 + (i * 1.7) % 3.5, v: .35 + (i % 3) * .15 }));
    let horizon = 0;

    function drawPlaza(dt) {
        horizon = CY - F * Math.tan(cam.pitch);
        const top = clamp(horizon, -1, H);
        // cielo: parte dal colore della pagina, così la sezione si fonde con le altre
        const sky = ctx.createLinearGradient(0, 0, 0, Math.max(top, 1));
        sky.addColorStop(0, '#edf4f8'); sky.addColorStop(1, '#fbfdfe');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, Math.max(top, 0) + 1);
        // colline lontane, appena accennate
        if (top > 20) {
            ctx.beginPath(); ctx.moveTo(0, top + 1);
            for (let x = 0; x <= W; x += 18) ctx.lineTo(x, top - 9 - Math.sin(x * .004 + 1.3) * 7 - Math.sin(x * .013 + 4) * 3.5 - Math.sin(x * .0011 + cam.x * .02) * 5);
            ctx.lineTo(W, top + 1); ctx.closePath();
            ctx.fillStyle = 'rgba(176,212,230,.45)'; ctx.fill();
        }
        // pavimento
        const floor = ctx.createLinearGradient(0, top, 0, H);
        floor.addColorStop(0, '#f5fafc'); floor.addColorStop(.35, '#e3eff6'); floor.addColorStop(1, '#d2e5ef');
        ctx.fillStyle = floor; ctx.fillRect(0, top, W, H - top);
        // reticolo a rombi: il dettaglio che rende riconoscibile la piazza
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.beginPath();
        const HALF = 40, step = 1.6;
        for (let c = -2 * HALF; c <= 2 * HALF; c += step) {
            const a = segment([-HALF, 0, c + HALF], [HALF, 0, c - HALF]);
            if (a) { ctx.moveTo(a[0], a[1]); ctx.lineTo(a[2], a[3]); }
            const b = segment([-HALF, 0, -HALF - c], [HALF, 0, HALF - c]);
            if (b) { ctx.moveTo(b[0], b[1]); ctx.lineTo(b[2], b[3]); }
        }
        ctx.stroke();
        // pozzo di luce al centro + aloni colorati sotto ogni comunità
        const c0 = project(0, 0, centre.z);
        if (c0) blob(radial('glow', '255,255,255', 1), c0.x, c0.y, 9 * c0.s, 9 * c0.s * Math.max(.2, sp * 1.1), .75);
        groups.forEach(g => {
            const p = project(g.x, 0, g.z);
            if (p) blob(tintSprite(g.tint), p.x, p.y, g.radius * 1.5 * p.s, g.radius * 1.5 * p.s * Math.max(.22, sp * 1.1), g.hover ? .5 : .26);
        });
        // ombre delle nuvole che scorrono sul pavimento: danno la scala
        const cloud = radial('cloud', '86,128,156', 1);
        clouds.forEach(c => {
            if (!calm()) { c.x += c.v * dt; if (c.x > 26) c.x = -26; }
            const p = project(c.x, 0, c.z);
            if (p) blob(cloud, p.x, p.y, c.r * p.s, c.r * p.s * Math.max(.22, sp), .07);
        });
    }

    function drawFog() {
        const top = clamp(horizon, 0, H);
        const fog = ctx.createLinearGradient(0, top - 6, 0, top + H * .16);
        fog.addColorStop(0, 'rgba(251,253,254,1)'); fog.addColorStop(1, 'rgba(251,253,254,0)');
        ctx.fillStyle = fog; ctx.fillRect(0, top - 6, W, H * .16 + 6);
        const low = ctx.createLinearGradient(0, H * .86, 0, H);
        low.addColorStop(0, 'rgba(237,244,248,0)'); low.addColorStop(1, 'rgba(237,244,248,1)');
        ctx.fillStyle = low; ctx.fillRect(0, H * .86, W, H * .14 + 1);
    }

    /* Un Mii in unità locali: piedi in (0,0), altezza totale 100.
       Proporzioni Wii U: testa enorme (~40%), corpo a pera, niente collo.
       Ogni parte ha un gradiente morbido al posto del contorno. */
    function gradients(m) {
        if (m.grad) return m.grad;
        const L = m.look;
        const shirt = ctx.createLinearGradient(-16, -58, 14, -24);
        shirt.addColorStop(0, shade(L.shirt, .22)); shirt.addColorStop(.55, L.shirt); shirt.addColorStop(1, shade(L.shirt, -.24));
        const skin = ctx.createRadialGradient(-7, -86, 2, -2, -78, 26);
        skin.addColorStop(0, shade(L.skin, .35)); skin.addColorStop(.55, L.skin); skin.addColorStop(1, shade(L.skin, -.16));
        const hair = ctx.createLinearGradient(-14, -102, 16, -66);
        hair.addColorStop(0, shade(L.hair, .28)); hair.addColorStop(.5, L.hair); hair.addColorStop(1, shade(L.hair, -.3));
        const pants = ctx.createLinearGradient(-10, -30, 10, 0);
        pants.addColorStop(0, shade(L.pants, .15)); pants.addColorStop(1, shade(L.pants, -.25));
        return m.grad = { shirt, skin, hair, pants, sleeve: shade(L.shirt, -.08), shoe: '#3f4450', hand: L.skin, browC: shade(L.hair, -.25), skinD: shade(L.skin, -.3) };
    }
    function rrect(x, y, w, h, r) {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function hairPath(style, hx, hy, rx, ry, t, back) {
        const part = t * 5;
        ctx.beginPath();
        if (back) {
            ctx.ellipse(hx, hy - 1, rx + 1.4, ry + 1.2, 0, Math.PI * .92, Math.PI * 2.08);
            ctx.quadraticCurveTo(hx + rx * .3, hy + (style === 4 ? 30 : 13), hx - rx * .3, hy + (style === 4 ? 30 : 13));
            ctx.closePath();
            return;
        }
        if (style === 2) {
            // spettinato a punte
            ctx.moveTo(hx - rx - 1.5, hy + 3);
            const spikes = [[-1.05, -.35], [-.98, -.8], [-.62, -1.05], [-.28, -1.22], [.08, -1.14], [.44, -1.24], [.8, -1.0], [1.02, -.7], [1.08, -.25]];
            spikes.forEach(([sx, sy], k) => {
                const ix = hx + sx * rx + part * .4, iy = hy + sy * ry;
                const ox = hx + sx * rx * 1.12 + part * .5 + (k % 2 ? 2 : -1), oy = hy + sy * ry * 1.14 - 3;
                ctx.lineTo(ox, oy); ctx.lineTo(ix, iy + 3);
            });
            ctx.lineTo(hx + rx + 1.5, hy + 3);
            ctx.lineTo(hx + rx - 3, hy - 4);
            for (let k = 4; k >= -4; k--) ctx.lineTo(hx + k * rx * .2 + part, hy - 7 + (k % 2 ? 4 : 0));
            ctx.lineTo(hx - rx + 3, hy - 3);
            ctx.closePath();
            return;
        }
        const side = style === 3 ? 13 : style === 4 ? 22 : 4;
        ctx.moveTo(hx - rx - 1.3, hy + side);
        ctx.ellipse(hx, hy - 2, rx + 1.4, ry + 1.4, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(hx + rx + 1.3, hy + side);
        if (style === 3 || style === 4) {
            ctx.lineTo(hx + rx - 3.5, hy + side);
            ctx.lineTo(hx + rx - 4, hy - 6);
            ctx.lineTo(hx - rx + 4, hy - 6);
            ctx.lineTo(hx - rx + 3.5, hy + side);
        } else if (style === 1) {
            // ciuffo laterale
            ctx.lineTo(hx + rx - 3, hy - 2);
            ctx.quadraticCurveTo(hx + part, hy - 3, hx - rx * .35 + part, hy - 11);
            ctx.quadraticCurveTo(hx - rx * .7, hy - 9, hx - rx + 3, hy - 1);
        } else if (style === 6) {
            ctx.lineTo(hx + rx - 2, hy - 8);
            ctx.quadraticCurveTo(hx + part, hy - 16, hx - rx + 2, hy - 8);
        } else {
            ctx.lineTo(hx + rx - 3.5, hy + 3);
            ctx.lineTo(hx + rx - 4, hy - 7);
            ctx.quadraticCurveTo(hx + part, hy - 13, hx - rx + 4, hy - 7);
            ctx.lineTo(hx - rx + 3.5, hy + 3);
        }
        ctx.closePath();
    }

    function drawMii(m, p) {
        const L = m.look, h = p.s * MII_H * L.scale;
        if (h < 6) return;
        const G = gradients(m), u = h / 100;
        const t = m.face, back = m.back > .5, sit = m.sit, gait = m.gait;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(u, u);

        if (h < 20) {
            // livello di dettaglio ridotto per i Mii più lontani
            ctx.fillStyle = G.pants; rrect(-9, -26 + sit * 12, 18, 26 - sit * 12, 5); ctx.fill();
            ctx.fillStyle = G.shirt; rrect(-14, -56 + sit * 16, 28, 32, 11); ctx.fill();
            ctx.fillStyle = G.skin; ctx.beginPath(); ctx.ellipse(0, -75 + sit * 16, 19.5, 20.5, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = G.hair; hairPath(L.style, 0, -75 + sit * 16, 19.5, 20.5, t, back); ctx.fill();
            ctx.restore();
            return;
        }

        const drop = sit * 17;
        const bob = -Math.abs(Math.sin(m.phase)) * 2.2 * gait + (m.state === 'idle' || m.state === 'look' ? Math.sin(time * 2.1 + L.seed) * .45 : 0);
        const bodyW = 1 - Math.abs(t) * .16;
        const sY = -55 + drop + bob, hipY = -27 + drop + bob;
        const hx = t * 3.2, hy = -75 + drop + bob - m.cheer * 1.5;
        const rx = 19.5, ry = 20.5;

        if (!back && L.style === 4) { ctx.fillStyle = G.hair; rrect(hx - rx - 2.5, hy - 8, rx * 2 + 5, 38, 12); ctx.fill(); }

        // gambe
        for (const s of [-1, 1]) {
            const ph = Math.sin(m.phase + (s > 0 ? Math.PI : 0));
            if (sit > .5) {
                // seduto con le gambe in avanti
                ctx.fillStyle = G.pants; rrect(s * 6 - 4.6, hipY - 2, 9.2, 13, 4.5); ctx.fill();
                ctx.fillStyle = G.shoe; ctx.beginPath(); ctx.ellipse(s * 7, hipY + 12, 6, 4.6, 0, 0, TAU); ctx.fill();
                continue;
            }
            const side = Math.abs(t), swing = ph * .5 * side * gait;
            const lift = Math.max(0, ph) * 4.5 * gait * (1 - side * .6);
            ctx.save();
            ctx.translate(s * 5.4 * bodyW, hipY);
            ctx.rotate(-swing * Math.sign(t || 1));
            ctx.fillStyle = G.pants; rrect(-4.4, -2, 8.8, 27 - lift - drop * .1 + (-bob), 4.4); ctx.fill();
            ctx.fillStyle = G.shoe; ctx.beginPath(); ctx.ellipse(t * 2.5, 25 - lift - bob, 5.6, 3.4, 0, 0, TAU); ctx.fill();
            ctx.restore();
        }

        // braccia: dietro il busto, con la mano in vista
        for (const s of [-1, 1]) {
            const ph = Math.sin(m.phase + (s > 0 ? 0 : Math.PI));
            let out = .17 + m.cheer * 2.45 + (s > 0 ? m.wave * (2.45 + Math.sin(time * 13) * .28) : 0);
            out += ph * .12 * gait * s;
            const len = 21 * (1 - Math.abs(ph) * .1 * gait * (1 - Math.abs(t)));
            ctx.save();
            ctx.translate(s * 11.6 * bodyW, sY + 4);
            ctx.rotate(-s * out);
            ctx.fillStyle = G.sleeve; rrect(-3.6, -2, 7.2, len, 3.6); ctx.fill();
            ctx.fillStyle = G.hand; ctx.beginPath(); ctx.arc(0, len, 4.2, 0, TAU); ctx.fill();
            ctx.restore();
        }

        // bacino e busto a pera
        ctx.fillStyle = G.pants; rrect(-13.6 * bodyW, hipY - 6, 27.2 * bodyW, 9, 4); ctx.fill();
        ctx.fillStyle = G.shirt;
        ctx.beginPath();
        ctx.moveTo(-9.5 * bodyW, sY);
        ctx.bezierCurveTo(-13 * bodyW, sY + 1, -16 * bodyW, hipY - 10, -14.5 * bodyW, hipY - 2);
        ctx.quadraticCurveTo(0, hipY + 1.5, 14.5 * bodyW, hipY - 2);
        ctx.bezierCurveTo(16 * bodyW, hipY - 10, 13 * bodyW, sY + 1, 9.5 * bodyW, sY);
        ctx.quadraticCurveTo(0, sY - 3, -9.5 * bodyW, sY);
        ctx.fill();
        // ombra della testa sul busto
        ctx.fillStyle = 'rgba(30,40,60,.16)';
        ctx.beginPath(); ctx.ellipse(hx * .5, sY + 2.5, 10, 3, 0, 0, TAU); ctx.fill();

        // orecchie e testa
        ctx.fillStyle = G.skin;
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + s * (rx - .8) - t * 3.5, hy + 2, 3.4, 4.8, 0, 0, TAU); ctx.fill(); }
        ctx.beginPath(); ctx.ellipse(hx, hy, rx, ry, 0, 0, TAU); ctx.fill();

        if (!back) {
            const fx = hx + t * 5.6, ey = hy + 1.5;
            const happy = m.cheer > .4 || (m.wave > .5 && m.state !== 'talk') || L.eyes === 1 && m.state === 'sit';
            // sopracciglia
            ctx.strokeStyle = G.browC; ctx.lineCap = 'round'; ctx.lineWidth = 1.8;
            ctx.beginPath();
            for (const s of [-1, 1]) {
                const lift = happy ? -1.2 : 0;
                ctx.moveTo(fx + s * 4.6, ey - 7.2 + lift + s * L.brow * .5); ctx.lineTo(fx + s * 10, ey - 8 + lift - L.brow);
            }
            ctx.stroke();
            // occhi: ovali scuri con riflesso, chiusi a mezzaluna quando è contento
            const open = m.blink < 0 ? .12 : 1;
            for (const s of [-1, 1]) {
                const ex = fx + s * 7.2;
                if (happy) {
                    ctx.lineWidth = 1.9; ctx.strokeStyle = '#2a2420';
                    ctx.beginPath(); ctx.arc(ex, ey + 1.2, 2.7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
                } else {
                    ctx.fillStyle = '#2a2420';
                    ctx.beginPath(); ctx.ellipse(ex, ey, 2.5, 3.5 * open, 0, 0, TAU); ctx.fill();
                    if (open > .5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + .8 + t * .4, ey - 1.2, .95, 0, TAU); ctx.fill(); }
                }
            }
            // guance
            if (L.blush || happy) {
                ctx.fillStyle = 'rgba(255,120,120,.26)';
                for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 11 - t * 1.5, ey + 7.5, 3.6, 2.1, 0, 0, TAU); ctx.fill(); }
            }
            // naso
            ctx.strokeStyle = G.skinD; ctx.lineWidth = 1.2; ctx.globalAlpha = .55;
            ctx.beginPath(); ctx.arc(fx + t * 1.4, ey + 6.2, 1.7, Math.PI * .15, Math.PI * .85); ctx.stroke();
            ctx.globalAlpha = 1;
            // bocca
            const mx = fx + t * .8, my = ey + 11.2;
            if (m.talk) {
                const o = .35 + .65 * Math.abs(Math.sin(time * 11 + L.seed));
                ctx.fillStyle = '#7b2e2e'; ctx.beginPath(); ctx.ellipse(mx, my + .5, 3.3, 1 + 2.6 * o, 0, 0, TAU); ctx.fill();
            } else if (happy) {
                ctx.fillStyle = '#7b2e2e'; ctx.beginPath(); ctx.moveTo(mx - 4.4, my - .6); ctx.quadraticCurveTo(mx, my + 7, mx + 4.4, my - .6); ctx.closePath(); ctx.fill();
            } else {
                ctx.strokeStyle = '#9b4a43'; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.arc(mx, my - 3.4, 4.3, Math.PI * .22, Math.PI * .78); ctx.stroke();
            }
        }

        // capelli davanti, con un riflesso
        ctx.fillStyle = G.hair; hairPath(L.style, hx, hy, rx, ry, t, back); ctx.fill();
        if (L.style === 5 && !back) { ctx.beginPath(); ctx.arc(hx - t * 2, hy - ry - 4, 7.5, 0, TAU); ctx.fill(); }
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.ellipse(hx - 2, hy - 3, rx - 3.5, ry - 3, 0, Math.PI * 1.2, Math.PI * 1.45); ctx.stroke();

        ctx.restore();
        m.sx = p.x; m.sy = p.y + (hy - 4) * u; m.sr = Math.max(10, 24 * u);
    }

    function drawScene(dt) {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        drawPlaza(dt);
        const shadow = radial('shadow', '52,88,112', 1);
        // ombre di icone e Mii prima di tutto il resto
        groups.forEach(g => {
            const p = project(g.x, 0, g.z);
            if (p) { const r = g.size * .42 * p.s * (1 - Math.sin(time * .9 + g.bob) * .06); blob(shadow, p.x, p.y, r, r * Math.max(.22, sp * 1.05), .18); }
        });
        const drawn = [];
        for (const m of miis) {
            if (m.delay > 0 && m.state === 'run') continue;
            const v = view(m.x, m.y, m.z);
            if (v.vz < NEAR) continue;
            const g = project(m.x, 0, m.z);
            if (g) { const r = .44 * g.s * m.look.scale * (1 - m.y * .9); blob(shadow, g.x, g.y, r, r * Math.max(.22, sp * 1.05), .26); }
            drawn.push({ m, vz: v.vz });
        }
        drawn.sort((a, b) => b.vz - a.vz);
        for (const { m } of drawn) { const p = project(m.x, m.y, m.z); if (p) drawMii(m, p); }
        drawFog();
    }

    /* -------------------------------------------------------------- 7. fumetti */
    const bubbles = [];
    const pool = [];
    const maxBubbles = () => narrow.matches ? 2 : 4;
    let nextBubble = 1.4;
    function relativeDate(iso) {
        const days = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 864e5));
        const en = english();
        if (days === 0) return en ? 'Updated today!' : 'Aggiornato oggi!';
        if (days === 1) return en ? 'Updated yesterday' : 'Aggiornato ieri';
        if (days < 45) return en ? `Updated ${days} days ago` : `Aggiornato ${days} giorni fa`;
        const months = Math.round(days / 30);
        return en ? `Updated ${months} months ago` : `Aggiornato ${months} mesi fa`;
    }
    function postsFor(g) {
        if (!g || g.kind !== 'repo') return [];
        const out = [...g.posts?.querySelectorAll('li') || []].map(li => li.textContent.trim()).filter(Boolean);
        const stars = +g.el.dataset.stars || 0;
        if (stars > 0) out.push(english() ? `★ ${stars} ${stars === 1 ? 'star' : 'stars'} on GitHub` : `★ ${stars} ${stars === 1 ? 'stella' : 'stelle'} su GitHub`);
        if (g.el.dataset.pushed) out.push(relativeDate(g.el.dataset.pushed));
        return out;
    }
    function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
    function anchorOf(m) { return project(m.x, m.y + MII_H * m.look.scale + .28, m.z); }
    function spawnBubble(m, force) {
        const g = m.group, posts = postsFor(g);
        if (!posts.length) return false;
        const a = anchorOf(m);
        if (!a || a.y < 40 || a.x < 20 || a.x > W - 20) return false;
        const text = posts[Math.floor(Math.random() * posts.length)];
        const w = Math.min(240, 34 + text.length * 7.1), h = 54;
        const box = { x: a.x - w / 2, y: a.y - h - 10, w, h };
        if (!force) {
            if (box.y < (head?.offsetTop || 0) + (head?.offsetHeight || 0) * .6) return false;
            for (const gr of groups) if (gr.screen && rectsOverlap(box, gr.screen)) return false;
            for (const b of bubbles) if (rectsOverlap(box, b.box)) return false;
        } else if (bubbles.length >= maxBubbles()) dropBubble(bubbles[0]);
        const el = pool.pop() || Object.assign(document.createElement('div'), { className: 'plaza__bubble', innerHTML: '<p><b></b><span></span></p>' });
        el.querySelector('b').textContent = g.name?.textContent.trim() || '';
        el.querySelector('span').textContent = text;
        el.style.setProperty('--tilt', `${((Math.random() - .5) * 5).toFixed(1)}deg`);
        el.style.setProperty('--tint', g.tint);
        el.classList.remove('is-out');
        bubbleLayer.append(el);
        const b = { m, el, t: 0, ttl: 4.6 + Math.random() * 2.2, box, w: el.offsetWidth, h: el.offsetHeight };
        bubbles.push(b);
        m.bubble = b; m.state = 'talk'; m.timer = b.ttl; m.sitT = 0; m.waveT = force ? 1 : 0;
        if (force) m.wave = .2;
        return true;
    }
    function dropBubble(b) {
        const i = bubbles.indexOf(b);
        if (i < 0) return;
        bubbles.splice(i, 1);
        b.m.bubble = null;
        if (b.m.state === 'talk') b.m.timer = 0;
        b.el.classList.add('is-out');
        setTimeout(() => { b.el.remove(); pool.push(b.el); }, 260);
    }
    function updateBubbles(dt) {
        nextBubble -= dt;
        if (nextBubble <= 0 && entranceT < 0 && bubbles.length < maxBubbles()) {
            nextBubble = 1.2 + Math.random() * 2.2;
            const candidates = miis.filter(m => m.group.kind === 'repo' && !m.bubble && m.state !== 'run' && m.state !== 'cheer' && m.delay <= 0);
            for (let k = 0; k < 6 && candidates.length; k++) {
                const m = candidates[Math.floor(Math.random() * candidates.length)];
                if (spawnBubble(m, false)) break;
            }
        }
        for (const b of [...bubbles]) {
            b.t += dt;
            if (b.t > b.ttl || b.m.state !== 'talk') { dropBubble(b); continue; }
            const a = anchorOf(b.m);
            if (!a) { dropBubble(b); continue; }
            const x = clamp(a.x - b.w / 2, 8, W - b.w - 8), y = a.y - b.h - 6;
            b.box = { x, y, w: b.w, h: b.h };
            b.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            b.el.style.setProperty('--tail', `${(a.x - x).toFixed(1)}px`);
        }
    }
    function clearBubbles() { [...bubbles].forEach(dropBubble); }

    /* ------------------------------------------------------ 8. icone e avatar */
    function fitCamera() {
        const mobile = narrow.matches;
        cam.y = mobile ? 12 : 7;
        cam.baseZ = mobile ? -8.5 : -15.5;
        setPitch(mobile ? .74 : .32);
        cam.x = cam.tx = 0; cam.z = cam.tz = cam.baseZ;
        const headBottom = (head?.offsetTop || 0) + (head?.offsetHeight || 0);
        const avail = { top: headBottom + 18, bottom: H - (mobile ? 40 : 70) };
        CX = W / 2;
        // fuoco: le icone ai lati devono stare nello schermo anche con la camera in movimento
        let f = H * 1.35;
        for (const g of groups) {
            const v = view(g.x, g.h, g.z), pad = mobile ? 70 : 96;
            if (Math.abs(v.vx) > .1) f = Math.min(f, (W / 2 - pad) * v.vz / (Math.abs(v.vx) + (mobile ? .4 : 1.1)));
        }
        F = Math.max(260, f);
        // verticale: centra la piazza nello spazio sotto il titolo, riducendo il fuoco se non ci sta
        for (let k = 0; k < 6; k++) {
            CY = 0;
            let top = Infinity, bottom = -Infinity;
            for (const g of groups) {
                const p = project(g.x, g.h + .2, g.z), q = project(g.x, 0, g.z - g.radius);
                if (!p) continue;
                top = Math.min(top, p.y - g.size * p.s * .62);
                bottom = Math.max(bottom, p.y + g.size * p.s * .5 + 46, q ? q.y + 12 : -Infinity);
            }
            const c = project(centre.x, 0, centre.z);
            if (c) bottom = Math.max(bottom, c.y + 14);
            const span = bottom - top, room = avail.bottom - avail.top;
            if (span > room && k < 5) { F *= Math.max(.7, room / span); continue; }
            CY = avail.top - top + Math.max(0, (room - span) * .3);
            break;
        }
        const front = groups.reduce((s, g) => { const p = project(g.x, g.h, g.z); return p ? Math.max(s, g.size * p.s) : s; }, 0);
        iconSize = Math.max(96, Math.round(front * 1.06));
        section.style.setProperty('--icon', `${iconSize}px`);
        buildLens(iconSize);
    }

    function placeDom(dt) {
        for (const g of groups) {
            const bob = calm() || g.hover ? 0 : Math.sin(time * .9 + g.bob) * .12;
            const p = project(g.x, g.h + bob, g.z);
            if (!p) continue;
            const k = clamp(g.size * p.s / iconSize, .3, 1.2);
            const x = p.x - iconSize / 2, y = p.y - iconSize / 2;
            g.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            if (Math.abs(k - g.k) > .002) { g.k = k; g.el.style.setProperty('--k', k.toFixed(3)); }
            // la scheda aperta sta sopra tutto, avatar compreso
            const open = g.hover || g.el.matches(':hover, :focus-within');
            g.el.style.zIndex = open ? '400' : String(200 - Math.round(p.vz * 4));
            const half = iconSize * k / 2;
            g.screen = { x: p.x - half - 8, y: p.y - half - 8, w: half * 2 + 16, h: half * 2 + 50 };
            // riflesso speculare rivolto verso il puntatore
            const target = pointer.inside ? (Math.atan2(pointer.x - p.x, -(pointer.y - p.y)) * 180 / Math.PI + 360) % 360 : 315;
            let diff = ((target - g.light + 540) % 360) - 180;
            g.light = (g.light + diff * (calm() ? 1 : 1 - Math.exp(-dt * 6)) + 360) % 360;
            g.el.style.setProperty('--light', `${g.light.toFixed(0)}deg`);
        }
        if (me) {
            const p = project(centre.x, 0, centre.z);
            if (p) {
                const size = MII_H * 1.1 / .78 * p.s;
                me.style.width = `${size.toFixed(1)}px`;
                me.style.transform = `translate3d(${(p.x - size / 2).toFixed(1)}px,${(p.y - size * .93).toFixed(1)}px,0)`;
                me.style.zIndex = String(200 - Math.round(p.vz * 4));
            }
        }
    }

    /* ------------------------------------------------- 9. dati live da GitHub */
    const CACHE = 'oakvx-plaza-repos-v2', LIMIT = 6, RECHECK = 5 * 60 * 1000;
    const cards = new Map([...list.querySelectorAll(':scope > .repo')].map(el => [el.dataset.repo.toLowerCase(), el]));
    let repoRequest = null, lastRepoCheck = 0;
    function recentRepos(value) {
        if (!Array.isArray(value)) return [];
        const unique = new Map();
        for (const r of value) {
            if (!r || typeof r.name !== 'string' || !/^[a-z0-9_.-]{1,100}$/i.test(r.name) || ['.', '..', 'oakvx.github.io-old'].includes(r.name.toLowerCase())) continue;
            if (typeof r.full_name !== 'string' || r.full_name.toLowerCase() !== 'oakvx/' + r.name.toLowerCase()) continue;
            if (r.private || r.fork || r.archived || r.disabled || r.visibility && r.visibility !== 'public' || !Number.isFinite(Number(r.size)) || Number(r.size) <= 0 || !Number.isFinite(Date.parse(r.pushed_at))) continue;
            const repo = { name: r.name, full_name: 'oakvx/' + r.name, html_url: 'https://github.com/oakvx/' + encodeURIComponent(r.name), description: typeof r.description === 'string' ? r.description : '', language: typeof r.language === 'string' ? r.language : '', stargazers_count: Math.max(0, Number(r.stargazers_count) || 0), size: Number(r.size), pushed_at: new Date(r.pushed_at).toISOString() };
            const previous = unique.get(r.name.toLowerCase());
            if (!previous || repo.pushed_at > previous.pushed_at) unique.set(r.name.toLowerCase(), repo);
        }
        return [...unique.values()].sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at) || a.name.localeCompare(b.name)).slice(0, LIMIT);
    }
    function updateRepoDates() {
        list.querySelectorAll('time.repo__updated').forEach(time => {
            const value = new Intl.DateTimeFormat(english() ? 'en-GB' : 'it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(time.dateTime));
            time.textContent = (english() ? 'Latest push: ' : 'Ultimo push: ') + value;
        });
    }
    function glyphFor(name) {
        const span = document.createElement('span');
        span.className = 'repo__thumb repo__thumb--glyph';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = name.replace(/[^a-z0-9]/gi, ' ').trim().split(/\s+|(?=[A-Z])/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
        return span;
    }
    function addRepo(repo) {
        const li = document.createElement('li');
        li.className = 'repo';
        li.dataset.proj = '';
        li.dataset.repo = repo.name;
        const color = LANG_COLORS[repo.language] || '#8a99a8';
        li.style.setProperty('--lang', color);
        li.innerHTML = '<figure class="repo__icon" data-print-work><a class="repo__glass" target="_blank" rel="noopener noreferrer"></a></figure><div class="repo__card"><p class="repo__name"></p><div class="repo__more"><div><p class="repo__kind"></p><p class="repo__meta mono"><span class="repo__lang"></span><span data-repo-stars></span><a target="_blank" rel="noopener noreferrer"></a></p></div></div></div><ul class="repo__posts" hidden></ul>';
        const glass = li.querySelector('.repo__glass');
        glass.href = repo.html_url;
        glass.append(glyphFor(repo.name));
        glass.setAttribute('aria-label', repo.name);
        li.querySelector('.repo__name').textContent = repo.name;
        li.querySelector('.repo__kind').textContent = repo.description || repo.language || 'GitHub';
        li.querySelector('.repo__lang').textContent = repo.language || '—';
        const link = li.querySelector('.repo__meta a');
        link.href = repo.html_url; link.textContent = `${repo.full_name} ↗`;
        if (repo.description) { const p = document.createElement('li'); p.textContent = repo.description; li.querySelector('.repo__posts').append(p); }
        cards.set(repo.name.toLowerCase(), li);
        bindItem(li);
        return li;
    }
    function applyRepos(repos) {
        const mine = recentRepos(repos);
        if (!mine.length) return false;
        const focused = document.activeElement, hadFocus = list.contains(focused), selected = mine.map(repo => {
            const li = cards.get(repo.name.toLowerCase()) || addRepo(repo);
            li.dataset.stars = repo.stargazers_count;
            li.dataset.size = repo.size;
            li.dataset.pushed = repo.pushed_at;
            const stars = li.querySelector('[data-repo-stars]');
            if (stars) stars.textContent = `★ ${repo.stargazers_count}`;
            let time = li.querySelector('.repo__updated');
            if (!time) { time = document.createElement('time'); time.className = 'repo__updated'; li.querySelector('.repo__meta').append(time); }
            time.dateTime = repo.pushed_at;
            return li;
        });
        list.replaceChildren(...selected);
        dispatchEvent(new CustomEvent('portfolio:contentchange'));
        updateRepoDates();
        const count = section.querySelector('[data-plaza-count]');
        if (count) count.textContent = String(selected.length);
        rebuild();
        if (selected.some(li => li.contains(focused))) focused.focus({ preventScroll: true });
        else if (hadFocus) selected[0].querySelector('a')?.focus({ preventScroll: true });
        return true;
    }
    async function refreshRepos() {
        if (repoRequest || document.hidden || !visible || suspended) return;
        lastRepoCheck = Date.now();
        const request = repoRequest = new AbortController(), timeout = setTimeout(() => request.abort(), 10000);
        try {
            const res = await fetch('https://api.github.com/users/oakvx/repos?per_page=100&sort=pushed&direction=desc', { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-cache', signal: request.signal });
            if (!res.ok) return;
            const repos = recentRepos(await res.json());
            if (!repos.length) return;
            applyRepos(repos);
            try { localStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), repos })); } catch {}
        } catch {} finally { clearTimeout(timeout); if (repoRequest === request) repoRequest = null; }
    }
    function maybeRefreshRepos() {
        if (visible && !document.hidden && !suspended && Date.now() - lastRepoCheck >= RECHECK) refreshRepos();
    }

    /* ------------------------------------------- 10. input, ciclo, ciclo di vita */
    function setHover(g, on) {
        if (!g || g.hover === on) return;
        g.hover = on;
        section.classList.toggle('is-focusing', groups.some(x => x.hover));
        if (on && !calm()) {
            // la folla del repo esulta, a onda dal più vicino all'icona
            miis.filter(m => m.group === g).forEach(m => cheer(m, Math.min(.35, Math.hypot(m.x - g.x, m.z - g.z) * .08)));
        }
    }
    function bindItem(li) {
        const find = () => groups.find(g => g.el === li);
        li.addEventListener('pointerenter', () => setHover(find(), true));
        li.addEventListener('pointerleave', () => { if (!li.contains(document.activeElement)) setHover(find(), false); });
        li.addEventListener('focusin', () => setHover(find(), true));
        li.addEventListener('focusout', event => { if (!li.contains(event.relatedTarget)) setHover(find(), false); });
        li.addEventListener('keydown', event => { if (event.key === 'Escape') { setHover(find(), false); li.querySelector('a')?.blur(); } });
        // pressione "liquida" sull'icona
        const glass = li.querySelector('.repo__glass');
        glass?.addEventListener('pointerdown', () => {
            if (calm()) return;
            glass.classList.remove('is-pressed'); void glass.offsetWidth; glass.classList.add('is-pressed');
        });
        glass?.addEventListener('animationend', () => glass.classList.remove('is-pressed'));
    }
    list.querySelectorAll(':scope > .repo').forEach(bindItem);

    function hitMii(x, y) {
        let best = null, bd = Infinity;
        for (const m of miis) {
            if (m.delay > 0 || !m.sr) continue;
            const d = Math.hypot(m.sx - x, m.sy - y);
            if (d < m.sr * 1.6 && d < bd) { bd = d; best = m; }
        }
        return best;
    }
    stage.addEventListener('pointermove', event => {
        const box = stage.getBoundingClientRect();
        pointer.x = event.clientX - box.left; pointer.y = event.clientY - box.top; pointer.inside = true;
        if (event.target.closest('.repo')) { stage.style.cursor = ''; return; }
        stage.style.cursor = hitMii(pointer.x, pointer.y) ? 'pointer' : '';
    });
    stage.addEventListener('pointerleave', () => { pointer.inside = false; stage.style.cursor = ''; });
    stage.addEventListener('click', event => {
        if (event.target.closest('.repo, a, button') || calm()) return;
        const box = stage.getBoundingClientRect();
        const m = hitMii(event.clientX - box.left, event.clientY - box.top);
        if (!m) return;
        if (m.group.kind === 'repo') { m.bubble && dropBubble(m.bubble); spawnBubble(m, true); }
        else { m.state = 'wave'; m.timer = 1.6; m.waveT = 1; m.faceT = 0; }
    });

    let visible = false, suspended = false, frame = 0, last = 0, slow = 0, skip = false;
    function step(dt) {
        time += dt;
        const rect = section.getBoundingClientRect();
        const progress = clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1);
        // la camera avanza piano mentre scorri e segue appena il puntatore
        cam.tz = cam.baseZ + (progress - .5) * (narrow.matches ? -1 : -1.8);
        cam.tx = pointer.inside ? clamp((pointer.x / W - .5) * 1.6, -.8, .8) : Math.sin(time * .07) * .5;
        cam.x = damp(cam.x, cam.tx, 1.6, dt);
        cam.z = damp(cam.z, cam.tz, 2.2, dt);
        if (entranceT >= 0) {
            entranceT += dt;
            if (entranceT > .5 && !section.dataset.greeted) { section.dataset.greeted = '1'; dispatchEvent(new CustomEvent('wiiu:plazagreet')); }
            if (entranceT > 2.6) { entranceT = -1; section.classList.remove('is-entering'); }
        }
        for (const m of miis) updateMii(m, dt);
        separate(dt);
        drawScene(dt);
        placeDom(dt);
        updateBubbles(dt);
    }
    function tick(now) {
        frame = 0;
        if (!visible || suspended || document.hidden || calm()) return;
        // se un frame costa troppo, scendiamo a 30 fps invece di scattare
        if (slow > 6) { skip = !skip; if (skip) { frame = requestAnimationFrame(tick); return; } }
        const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
        last = now;
        const t0 = performance.now();
        step(dt);
        const cost = performance.now() - t0;
        slow = cost > 11 ? slow + 1 : Math.max(0, slow - .25);
        frame = requestAnimationFrame(tick);
    }
    function still() {
        // immagine ferma: niente fumetti, Mii al loro posto
        clearBubbles();
        cam.x = cam.tx = 0; cam.z = cam.baseZ;
        drawScene(0);
        placeDom(0);
    }
    function sync() {
        const active = visible && !suspended && !document.hidden && !calm() && !root.classList.contains('is-navigating');
        section.dataset.plazaActive = String(active);
        if (active) {
            if (!entered) { entered = true; stageEntrance(); }
            if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
        } else {
            cancelAnimationFrame(frame); frame = 0; last = 0;
            if (calm() && entered && entranceT >= 0) { entranceT = -1; section.classList.remove('is-entering'); populate(); }
            if (W && H) still();
        }
    }
    function fit() {
        const box = stage.getBoundingClientRect();
        W = Math.round(box.width); H = Math.round(box.height);
        if (!W || !H) return;
        DPR = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        // passaggio desktop ↔ mobile: la piazza cambia disposizione
        if (layoutMobile !== narrow.matches || (!narrow.matches && layoutSqueeze !== squeeze())) { layoutMobile = narrow.matches; clearBubbles(); populate(); }
        fitCamera();
        if (!frame) still();
    }
    function rebuild() {
        clearBubbles();
        populate();
        layoutMobile = narrow.matches;
        groups.forEach(g => g.el.style.removeProperty('--pop-delay'));
        fit();
        if (calm() || !entered) return;
        miis.forEach(m => { m.state = 'idle'; m.timer = Math.random() * 2; });
    }

    let layoutMobile = narrow.matches;
    populate();
    new ResizeObserver(fit).observe(stage);
    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
        if (visible) maybeRefreshRepos();
    }, { rootMargin: '280px 0px' }).observe(section);
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(() => { clearBubbles(); updateRepoDates(); }).observe(root, { attributes: true, attributeFilter: ['lang'] });
    document.addEventListener('visibilitychange', () => { sync(); maybeRefreshRepos(); });
    reduced.addEventListener('change', sync);
    narrow.addEventListener('change', () => { if (layoutMobile !== narrow.matches) rebuild(); });
    addEventListener('pagehide', () => { suspended = true; repoRequest?.abort(); sync(); });
    addEventListener('pageshow', () => { suspended = false; sync(); maybeRefreshRepos(); });
    fit();
    // Keep the last successful public selection usable when GitHub is unavailable.
    const fallback = [...cards.values()].map(el => ({ name: el.dataset.repo, full_name: 'oakvx/' + el.dataset.repo, size: el.dataset.size, pushed_at: el.dataset.pushed, stargazers_count: el.dataset.stars }));
    applyRepos(fallback);
    try { const cached = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (cached) applyRepos(cached.repos); } catch {}
})();
