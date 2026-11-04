(() => {
    const matrix = document.querySelector('[data-git-matrix]');
    const status = document.querySelector('[data-git-status]');
    if (!matrix || !status) return;

    const accounts = ['oakvx', 'oakvxish'];
    const cacheKey = 'oakvx-public-commit-total-v1';
    const cacheTtl = 60 * 60 * 1000;

    // Original 5 × 7 pixel numerals, on a soft field of rounded squares.
    const columns = 72;
    const rows = 40;
    const glyphs = {
        '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
        '1': ['010', '110', '010', '010', '010', '010', '111'],
        '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
        '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
        '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
        '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
        '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
        '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
        '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
        '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
        '.': ['0', '0', '0', '0', '0', '1', '1'],
        ',': ['00', '00', '00', '00', '01', '01', '10'],
        'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
        'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
        '—': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
    };

    let currentTotal = null;

    function locale() {
        return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en-US' : 'it-IT';
    }

    function setStatus(key) {
        status.dataset.k = key;
        status.classList.toggle('sr-only', key === 'fo.gitLoading' || key === 'fo.gitUpdated');
        const english = locale().startsWith('en');
        status.textContent = english
            ? ({
                'fo.gitLoading': 'Loading public GitHub commits…',
                'fo.gitUpdated': 'Public totals updated',
                'fo.gitError': 'Public totals unavailable'
            }[key] || '')
            : ({
                'fo.gitLoading': 'Leggo i commit pubblici GitHub…',
                'fo.gitUpdated': 'Totale pubblico aggiornato',
                'fo.gitError': 'Totale pubblico non disponibile'
            }[key] || '');
    }

    function noiseAt(row, col) {
        const h = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
        return h - Math.floor(h);
    }

    function displayTotal(total) {
        const unit = total >= 1000000 ? 1000000 : total >= 10000 ? 1000 : 1;
        const value = (total / unit).toLocaleString(locale(), { maximumFractionDigits: unit === 1 ? 0 : 1 });
        return value + (unit === 1000000 ? 'M' : unit === 1000 ? 'K' : '');
    }

    function drawNumber(value) {
        const shapes = [...value].map(character => glyphs[character]).filter(Boolean);
        const textWidth = shapes.reduce((width, shape) => width + shape[0].length + 2, -2);
        const pixels = new Set();
        let x = Math.floor((columns - textWidth) / 2);
        const y = Math.floor((rows - 7) / 2);
        shapes.forEach(shape => {
            shape.forEach((line, row) => [...line].forEach((pixel, column) => {
                if (pixel === '1') pixels.add((y + row) * columns + x + column);
            }));
            x += shape[0].length + 2;
        });
        matrix.style.setProperty('--git-columns', columns);
        const fragment = document.createDocumentFragment();
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const dot = document.createElement('span');
                dot.className = 'fo-git__dot';
                const noise = noiseAt(row, column);
                if (pixels.has(row * columns + column)) {
                    dot.classList.add('is-digit', 'is-lit');
                    dot.style.opacity = noise > .65 ? '.88' : '1';
                } else if (noise < .16) {
                    dot.classList.add('is-noise');
                    if (noise < .045) dot.classList.add('is-lit');
                }
                fragment.append(dot);
            }
        }
        matrix.replaceChildren(fragment);
    }

    function render(total) {
        currentTotal = total;
        matrix.setAttribute('aria-label', locale().startsWith('en')
            ? total.toLocaleString(locale()) + ' public commits across @oakvx and @oakvxish'
            : total.toLocaleString(locale()) + ' commit pubblici tra @oakvx e @oakvxish');
        drawNumber(displayTotal(total));
    }

    async function fetchAccountTotal(account) {
        const query = new URLSearchParams({
            q: 'author:' + account + ' is:public',
            per_page: '1'
        });
        const response = await fetch('https://api.github.com/search/commits?' + query, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!response.ok) throw new Error('GitHub API: ' + response.status);
        const data = await response.json();
        if (data.incomplete_results || !Number.isSafeInteger(data.total_count)) {
            throw new Error('GitHub returned an incomplete total');
        }
        return data.total_count;
    }

    async function fetchTotal() {
        const counts = await Promise.all(accounts.map(fetchAccountTotal));
        return counts.reduce((sum, count) => sum + count, 0);
    }

    function readCache() {
        try {
            const value = JSON.parse(localStorage.getItem(cacheKey));
            return Number.isSafeInteger(value?.total) && Number.isFinite(value?.updated)
                ? value
                : null;
        } catch {
            return null;
        }
    }

    function writeCache(total) {
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ total, updated: Date.now() }));
        } catch {}
    }

    let refreshTimer;
    async function refresh() {
        setStatus('fo.gitLoading');
        try {
            const total = await fetchTotal();
            render(total);
            writeCache(total);
            setStatus('fo.gitUpdated');
            refreshTimer = setTimeout(refresh, cacheTtl);
        } catch {
            setStatus('fo.gitError');
            refreshTimer = setTimeout(refresh, 5 * 60 * 1000);
        }
    }

    const cache = readCache();
    if (cache) render(cache.total);
    else drawNumber('—');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            matrix.classList.add('is-entered');
            observer.disconnect();
        }, { threshold: .15 });
        observer.observe(matrix);
    }

    new MutationObserver(() => {
        if (currentTotal !== null) render(currentTotal);
        if (status.dataset.k) setStatus(status.dataset.k);
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    const age = cache ? Date.now() - cache.updated : cacheTtl;
    if (age < cacheTtl) {
        setStatus('fo.gitUpdated');
        refreshTimer = setTimeout(refresh, cacheTtl - age);
    } else {
        refresh();
    }
})();
