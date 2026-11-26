/* ==========================================================================
   Campo — sculture di punti in WebGL, senza librerie.
   Ogni [data-campo] elenca le sue forme in data-forme, separate da "|":
     scultura          superficie organica deformata, con anello e pulviscolo
     testo:404         testo campionato da Bodoni Moda corsivo
     immagine:/x.webp  silhouette di un'immagine con trasparenza (rilievo dalla luminanza)
   Tenere premuto (mouse, touch, Invio o Spazio sul pulsante [data-tieni])
   fa esplodere i punti e li ricompone nella forma successiva; un tocco breve
   passa alla forma successiva senza esplosione.
   Se WebGL manca resta visibile il ripiego .campo__ripiego.
   ========================================================================== */
(() => {
    'use strict';

    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduce.matches || root.classList.contains('paused');

    /* ---------- rumore 3D a valori, deterministico ---------- */
    const hash = (x, y, z) => {
        const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
        return h - Math.floor(h);
    };
    const smooth = t => t * t * (3 - 2 * t);
    function noise(x, y, z) {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
        const l = (a, b, t) => a + (b - a) * t;
        const n = (dx, dy, dz) => hash(ix + dx, iy + dy, iz + dz);
        return l(
            l(l(n(0, 0, 0), n(1, 0, 0), fx), l(n(0, 1, 0), n(1, 1, 0), fx), fy),
            l(l(n(0, 0, 1), n(1, 0, 1), fx), l(n(0, 1, 1), n(1, 1, 1), fx), fy),
            fz
        ) * 2 - 1;
    }
    const fbm = (x, y, z) => noise(x, y, z) * .55 + noise(x * 2.1, y * 2.1, z * 2.1) * .28 + noise(x * 4.3, y * 4.3, z * 4.3) * .17;

    /* Generatore pseudo-casuale con seme, così ogni visita mostra la stessa scultura. */
    function rng(seed) {
        let s = seed >>> 0;
        return () => {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /* Una forma: posizione + tono (vec4) e normale (vec3) per ogni punto. */
    function shape(n) {
        return { pos: new Float32Array(n * 4), nor: new Float32Array(n * 3), flat: false };
    }

    function scultura(n) {
        const s = shape(n), r = rng(7);
        for (let i = 0; i < n; i++) {
            const kind = r();
            let x, y, z, nx, ny, nz, tone;
            if (kind < .8) {
                // superficie: direzione uniforme, raggio deformato da rumore con distorsione di dominio
                const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u);
                nx = q * Math.cos(a); ny = u; nz = q * Math.sin(a);
                const w = fbm(nx * 1.2 + 3.1, ny * 1.2, nz * 1.2 - 1.7);
                const d = fbm(nx * 1.7 + w, ny * 1.7 - w, nz * 1.7 + w * .5);
                const carve = Math.pow(Math.abs(Math.sin(ny * 3.2 + w * 2.2)), 6) * .16;
                const rad = .92 + d * .42 - carve;
                x = nx * rad; y = ny * rad * 1.08; z = nz * rad;
                tone = .78 + r() * .22;
            } else if (kind < .93) {
                // anello sottile, inclinato
                const a = r() * Math.PI * 2, tube = (r() - .5) * .03, R = 1.52 + (r() - .5) * .025;
                const cx = Math.cos(a) * (R + tube), cz = Math.sin(a) * (R + tube), cy = (r() - .5) * .02;
                const tilt = .42;
                x = cx; y = cy * Math.cos(tilt) - cz * Math.sin(tilt); z = cy * Math.sin(tilt) + cz * Math.cos(tilt);
                nx = x; ny = y; nz = z;
                tone = .55 + r() * .3;
            } else {
                // pulviscolo intorno
                const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 1.8 + r() * 1.1;
                nx = q * Math.cos(a); ny = u; nz = q * Math.sin(a);
                x = nx * rad; y = ny * rad; z = nz * rad;
                tone = .18 + r() * .3;
            }
            const len = Math.hypot(nx, ny, nz) || 1;
            s.pos.set([x, y, z, tone], i * 4);
            s.nor.set([nx / len, ny / len, nz / len], i * 3);
        }
        return s;
    }

    function fromPixels(n, pixels, w, h, opts) {
        // pixels: array di [x, y, peso]
        const s = shape(n), r = rng(opts.seed || 11);
        s.flat = true;
        const span = opts.span || 2.3;
        const scale = span / Math.max(w, h);
        if (!pixels.length) return scultura(n);
        for (let i = 0; i < n; i++) {
            const p = pixels[(r() * pixels.length) | 0];
            const x = (p[0] + r() - .5 - w / 2) * scale;
            const y = -(p[1] + r() - .5 - h / 2) * scale;
            const lum = p[2];
            const z = (opts.relief ? (lum - .5) * opts.relief : 0) + (r() - .5) * (opts.depth || .12);
            const tone = opts.tone ? opts.tone(lum, r) : .7 + r() * .3;
            s.pos.set([x, y, z, tone], i * 4);
            const jx = (r() - .5) * .5, jy = (r() - .5) * .5, l = Math.hypot(jx, jy, 1);
            s.nor.set([jx / l, jy / l, 1 / l], i * 3);
        }
        return s;
    }

    async function testo(n, str) {
        try { await document.fonts.load('italic 700 200px "Nero Serif"'); } catch {}
        const c = document.createElement('canvas');
        const w = 900, h = 420;
        c.width = w; c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.fillStyle = '#fff';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        let size = 380;
        g.font = `italic 700 ${size}px "Nero Serif", "Bodoni 72", Didot, serif`;
        const m = g.measureText(str).width;
        if (m > w * .8) { size *= (w * .8) / m; g.font = `italic 700 ${size}px "Nero Serif", "Bodoni 72", Didot, serif`; }
        g.fillText(str, w / 2, h / 2 + size * .04);
        // ispessisce i filetti del Bodoni, altrimenti restano quasi senza punti
        g.lineWidth = size * .028; g.strokeStyle = '#fff'; g.lineJoin = 'round';
        g.strokeText(str, w / 2, h / 2 + size * .04);
        const data = g.getImageData(0, 0, w, h).data;
        const px = [];
        for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
            if (data[(y * w + x) * 4 + 3] > 140) px.push([x, y, .8]);
        }
        return fromPixels(n, px, w, h, { span: 3.2, depth: .22, seed: 5 });
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function immagine(n, src) {
        const img = await loadImage(src);
        const w = 220, h = Math.round(220 * img.naturalHeight / img.naturalWidth);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, w, h);
        const data = g.getImageData(0, 0, w, h).data;
        const px = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const k = (y * w + x) * 4;
            if (data[k + 3] < 110) continue;
            const lum = (data[k] * .299 + data[k + 1] * .587 + data[k + 2] * .114) / 255;
            // i bordi pesano di più: la silhouette resta leggibile
            const edge = x > 0 && y > 0 && x < w - 1 && y < h - 1 &&
                (data[k - 4 + 3] < 110 || data[k + 4 + 3] < 110 || data[k - w * 4 + 3] < 110 || data[k + w * 4 + 3] < 110);
            px.push([x, y, lum]);
            if (edge) { px.push([x, y, Math.max(lum, .9)]); px.push([x, y, Math.max(lum, .9)]); }
        }
        return fromPixels(n, px, w, h, {
            span: 2.5, relief: .5, depth: .08, seed: 3,
            tone: (lum, r) => .28 + Math.pow(lum, .8) * .8 + r() * .08
        });
    }

    function dispersione(n) {
        const s = shape(n), r = rng(19);
        for (let i = 0; i < n; i++) {
            const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u), rad = 2.4 + r() * 2.6;
            s.pos.set([q * Math.cos(a) * rad, u * rad, q * Math.sin(a) * rad, r() * .4], i * 4);
            s.nor.set([q * Math.cos(a), u, q * Math.sin(a)], i * 3);
        }
        return s;
    }

    /* ---------- shader ---------- */
    const VERT = `
        attribute vec4 aFrom; attribute vec4 aTo;
        attribute vec3 aNFrom; attribute vec3 aNTo;
        attribute float aSeed;
        uniform float uMorph, uTime, uHold, uSize, uAspect, uScale, uMouseOn, uBreath;
        uniform vec2 uMouse, uRot, uOffset;
        uniform vec3 uLight;
        varying float vLight; varying float vAccent; varying float vFade;
        mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c); }
        mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c); }
        vec3 swirl(vec3 p, float t){
            return vec3(sin(p.y * 1.7 + t) + sin(p.z * 2.3 - t * .7),
                        sin(p.z * 1.9 + t * .8) + sin(p.x * 2.1 + t * .5),
                        sin(p.x * 1.6 - t * .6) + sin(p.y * 2.4 + t * .9)) * .5;
        }
        void main(){
            float k = clamp(uMorph * 1.55 - aSeed * .55, 0.0, 1.0);
            k = k < .5 ? 4.0 * k * k * k : 1.0 - pow(-2.0 * k + 2.0, 3.0) * .5;
            vec3 p = mix(aFrom.xyz, aTo.xyz, k);
            vec3 n = normalize(mix(aNFrom, aNTo, k) + vec3(1e-4));
            float tone = mix(aFrom.w, aTo.w, k);
            float arc = sin(k * 3.14159);
            p += swirl(p * 1.3 + aSeed * 6.0, uTime * .6) * arc * .38;
            p += n * sin(uTime * .9 + aSeed * 6.2831 + p.y * 2.0) * .014 * uBreath;
            vec3 j = vec3(fract(aSeed * 13.17), fract(aSeed * 71.73), fract(aSeed * 37.31)) - .5;
            vec3 dir = normalize(p + j * .8 + vec3(1e-4));
            p += (dir * (.5 + aSeed * 1.6) + swirl(p * 2.0 + aSeed, uTime * 1.4) * .45) * uHold;
            mat3 R = rotY(uRot.y) * rotX(uRot.x);
            p = R * p; n = R * n;
            float persp = 3.4 / (3.4 - p.z);
            vec2 xy = p.xy * persp * uScale;
            xy.x /= uAspect;
            xy += uOffset;
            vec2 d = xy - uMouse;
            float dist = length(d * vec2(uAspect, 1.0));
            float push = uMouseOn * smoothstep(.3, 0.0, dist) * .08;
            xy += normalize(d + vec2(1e-5)) * push;
            gl_Position = vec4(xy, 0.0, 1.0);
            float lam = max(dot(n, uLight), 0.0);
            vLight = (.14 + .86 * pow(lam, 1.4)) * tone + push * 5.0;
            vAccent = step(.962, fract(aSeed * 91.7));
            vFade = clamp(persp - .55, .25, 1.0);
            gl_PointSize = uSize * persp * (.7 + tone * .5) * (1.0 + uHold * aSeed * .8);
        }`;
    const FRAG = `
        precision mediump float;
        uniform vec3 uBianco; uniform vec3 uCremisi; uniform float uGain;
        varying float vLight; varying float vAccent; varying float vFade;
        void main(){
            vec2 c = gl_PointCoord - .5;
            float r = length(c);
            if (r > .5) discard;
            float a = smoothstep(.5, .1, r);
            vec3 col = mix(uBianco, uCremisi, vAccent);
            float b = vLight * vFade * (1.0 + vAccent * .8);
            gl_FragColor = vec4(col * b * a * uGain, 1.0);
        }`;

    function compile(gl, type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
        return sh;
    }

    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

    /* ---------- un campo ---------- */
    async function avvia(box) {
        const canvas = box.querySelector('canvas') || box.appendChild(document.createElement('canvas'));
        canvas.setAttribute('aria-hidden', 'true');
        const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' });
        if (!gl) return;

        let n = Number(box.dataset.punti || 22000);
        if (innerWidth < 700) n *= .5;
        if ((navigator.hardwareConcurrency || 8) <= 4) n *= .65;
        if (navigator.deviceMemory && navigator.deviceMemory <= 2) n *= .6;
        n = Math.round(n);

        let prog;
        try {
            prog = gl.createProgram();
            gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
            gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        } catch (err) {
            console.warn('campo:', err);
            return;
        }
        gl.useProgram(prog);

        // forme
        const specs = (box.dataset.forme || 'scultura').split('|').map(s => s.trim()).filter(Boolean);
        const build = spec => {
            const [kind, ...rest] = spec.split(':');
            const arg = rest.join(':');
            if (kind === 'testo') return testo(n, arg);
            if (kind === 'immagine') return immagine(n, arg).catch(() => scultura(n));
            return Promise.resolve(scultura(n));
        };
        const first = await build(specs[0]);
        const forms = [first];
        const pending = specs.slice(1).map((spec, i) => build(spec).then(f => { forms[i + 1] = f; }));
        Promise.all(pending).catch(() => {});

        const seeds = new Float32Array(n);
        const sr = rng(23);
        for (let i = 0; i < n; i++) seeds[i] = sr();

        const buf = (data, size, name, usage = gl.STATIC_DRAW) => {
            const b = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, data, usage);
            const loc = gl.getAttribLocation(prog, name);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
            return b;
        };
        const start = calm() ? first : dispersione(n);
        const bFrom = buf(start.pos, 4, 'aFrom', gl.DYNAMIC_DRAW);
        const bTo = buf(first.pos, 4, 'aTo', gl.DYNAMIC_DRAW);
        const bNFrom = buf(start.nor, 3, 'aNFrom', gl.DYNAMIC_DRAW);
        const bNTo = buf(first.nor, 3, 'aNTo', gl.DYNAMIC_DRAW);
        buf(seeds, 1, 'aSeed');
        const upload = (b, data) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, data); };

        const U = {};
        ['uMorph', 'uTime', 'uHold', 'uSize', 'uAspect', 'uScale', 'uMouseOn', 'uBreath', 'uMouse', 'uRot', 'uOffset', 'uLight', 'uBianco', 'uCremisi', 'uGain']
            .forEach(k => { U[k] = gl.getUniformLocation(prog, k); });
        gl.uniform3fv(U.uBianco, hex('#E8E6E1'));
        gl.uniform3fv(U.uCremisi, hex('#C81035'));
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.clearColor(0, 0, 0, 0);

        const offset = (box.dataset.spostamento || '0,0').split(',').map(Number);
        const baseScale = Number(box.dataset.scala || .62);
        let W = 1, H = 1, dpr = 1, aspect = 1;
        const resize = () => {
            dpr = Math.min(devicePixelRatio || 1, 1.75);
            W = Math.max(1, box.clientWidth); H = Math.max(1, box.clientHeight);
            canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
            aspect = W / H;
            const wide = aspect > 1.15;
            gl.uniform1f(U.uAspect, aspect);
            gl.uniform1f(U.uScale, baseScale * Math.min(1, aspect * (wide ? 1 : 1.05)));
            gl.uniform2f(U.uOffset, wide ? offset[0] : 0, wide ? offset[1] : 0);
            const density = Math.sqrt((W * H) / n);
            gl.uniform1f(U.uSize, Math.max(1.2, Math.min(3.2, density * .38)) * dpr);
            gl.uniform1f(U.uGain, Number(box.dataset.luce || .5));
            draw();
        };

        // stato
        let target = 0, morph = calm() ? 1 : 0, morphing = !calm();
        let hold = 0, charge = 0, holding = false, fired = false;
        let mx = 0, my = 0, mouseOn = 0, mouseTarget = 0;
        let rotY = 0, rotX = 0, spin = 0, time = 0, last = performance.now();
        let visible = true, raf = 0;
        const stato = document.querySelector(`[data-campo-stato="${box.id}"]`);
        const nomi = ((root.lang || '').startsWith('en') && box.dataset.nomiEn ? box.dataset.nomiEn : box.dataset.nomi || '').split('|');
        const button = document.querySelector(`[data-tieni="${box.id}"]`);
        const area = box.dataset.area ? box.closest(box.dataset.area) : box;

        const annuncia = () => {
            if (!stato) return;
            const i = target % forms.length;
            stato.textContent = `${String(i + 1).padStart(2, '0')} / ${String(specs.length).padStart(2, '0')}${nomi[i] ? ' — ' + nomi[i] : ''}`;
        };
        annuncia();

        const next = () => {
            const avail = forms.filter(Boolean).length;
            if (avail < 2) return;
            let t = (target + 1) % specs.length;
            while (!forms[t]) t = (t + 1) % specs.length;
            // la forma di partenza è quella attuale, già ricomposta
            const from = forms[target];
            upload(bFrom, from.pos); upload(bNFrom, from.nor);
            upload(bTo, forms[t].pos); upload(bNTo, forms[t].nor);
            target = t;
            morph = calm() ? 1 : 0;
            morphing = !calm();
            annuncia();
            kick();
            if (calm()) draw();
        };

        function draw() {
            gl.uniform1f(U.uMorph, morph);
            gl.uniform1f(U.uTime, time);
            gl.uniform1f(U.uHold, hold);
            gl.uniform1f(U.uMouseOn, mouseOn);
            gl.uniform1f(U.uBreath, calm() ? 0 : 1);
            gl.uniform2f(U.uMouse, mx, my);
            gl.uniform2f(U.uRot, rotX, rotY);
            const lx = mx * 1.2, ly = my * 1.2 + .35;
            const l = Math.hypot(lx, ly, .9);
            gl.uniform3f(U.uLight, lx / l, ly / l, .9 / l);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, n);
        }

        function frame(now) {
            raf = 0;
            const dt = Math.min(.05, (now - last) / 1000);
            last = now;
            time += dt;
            if (morphing) {
                morph = Math.min(1, morph + dt / 1.9);
                if (morph >= 1) morphing = false;
            }
            if (holding) {
                charge = Math.min(1, charge + dt / 1.15);
                if (charge >= 1 && !fired) { fired = true; next(); }
            } else charge = Math.max(0, charge - dt * 2.5);
            const holdTarget = holding && !fired ? charge * charge : 0;
            hold += (holdTarget - hold) * Math.min(1, dt * (holding ? 7 : 3.5));
            if (button) button.style.setProperty('--carica', charge.toFixed(3));
            mouseOn += (mouseTarget - mouseOn) * Math.min(1, dt * 4);
            const flat = forms[target]?.flat;
            spin = flat ? 0 : spin + dt * .12;
            const wantY = (flat ? 0 : spin) + mx * (flat ? .35 : .55);
            const wantX = -my * (flat ? .22 : .35) + (flat ? 0 : .18);
            // per le forme piatte si torna al giro intero più vicino
            if (flat) rotY = ((rotY + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
            rotY += (wantY - rotY) * Math.min(1, dt * 2.2);
            rotX += (wantX - rotX) * Math.min(1, dt * 2.2);
            draw();
            if (visible && !document.hidden && !calm()) raf = requestAnimationFrame(frame);
        }
        const kick = () => { if (!raf && visible && !document.hidden && !calm()) { last = performance.now(); raf = requestAnimationFrame(frame); } };

        // interazioni
        const setMouse = e => {
            const r = canvas.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 2 - 1;
            my = -(((e.clientY - r.top) / r.height) * 2 - 1);
        };
        addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            const r = canvas.getBoundingClientRect();
            if (e.clientY < r.top || e.clientY > r.bottom) { mouseTarget = 0; return; }
            setMouse(e);
            mouseTarget = 1;
            kick();
        }, { passive: true });

        const press = () => {
            if (holding) return;
            holding = true; fired = false;
            button?.classList.add('attivo');
            dispatchEvent(new CustomEvent('nero:tieni', { detail: { attivo: true } }));
            kick();
        };
        const release = () => {
            if (!holding) return;
            holding = false;
            button?.classList.remove('attivo');
            dispatchEvent(new CustomEvent('nero:tieni', { detail: { attivo: false } }));
            if (!fired) next(); // tocco breve o pressione interrotta: passa comunque alla forma successiva
            fired = false;
            kick();
        };
        const ignore = e => e.target.closest('a, input, textarea, select, [data-tieni], button:not([data-tieni])');
        area?.addEventListener('pointerdown', e => {
            if (e.button !== 0 || ignore(e)) return;
            if (e.pointerType !== 'mouse') setMouse(e);
            press();
        });
        if (button) {
            button.addEventListener('pointerdown', e => { if (e.button === 0) { e.preventDefault(); press(); } });
            button.addEventListener('keydown', e => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); }
            });
            button.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } });
            button.addEventListener('click', e => e.preventDefault());
            button.addEventListener('contextmenu', e => e.preventDefault());
        }
        addEventListener('pointerup', release);
        addEventListener('pointercancel', release);
        addEventListener('blur', release);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(box);
        }
        document.addEventListener('visibilitychange', kick);
        addEventListener('nero:movimento', () => {
            if (calm()) { morph = 1; morphing = false; hold = 0; mouseOn = 0; draw(); }
            else kick();
        });
        new ResizeObserver(resize).observe(box);
        resize();
        box.classList.add('pronto');
        kick();
    }

    function init() {
        document.querySelectorAll('[data-campo]').forEach(box => {
            const go = () => avvia(box).catch(err => console.warn('campo:', err));
            // le scene sotto la piega partono quando si avvicinano
            if ('IntersectionObserver' in window && box.getBoundingClientRect().top > innerHeight * 1.5) {
                const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '400px' });
                io.observe(box);
            } else go();
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
