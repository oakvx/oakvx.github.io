(() => {
    const matrix = document.querySelector('[data-git-matrix]');
    const status = document.querySelector('[data-git-status]');
    if (!matrix || !status) return;

    const accounts = ['oakvx', 'oakvxish'];
    const cacheKey = 'oakvx-public-commit-total-v1';
    const cacheTtl = 60 * 60 * 1000;

    // Griglia più fitta = resa più morbida, con anti-aliasing reale.
    const columns = 96;
    const rows = 34;
    const cellPx = 12; // risoluzione del canvas interno usato per campionare i pixel

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

    // Rumore di sfondo deterministico ma senza pattern a righe/diagonali evidenti.
    function noiseAt(row, col) {
        const h = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
        return (h - Math.floor(h)) < 0.08;
    }

    function rasterize(text) {
        const canvas = document.createElement('canvas');
        canvas.width = columns * cellPx;
        canvas.height = rows * cellPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (text) {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let fontSize = Math.floor(canvas.height * 0.74);
            const setFont = size => { ctx.font = '900 ' + size + 'px Archivo, Arial, sans-serif'; };
            setFont(fontSize);
            while (ctx.measureText(text).width > canvas.width * 0.92 && fontSize > 12) {
                fontSize -= 2;
                setFont(fontSize);
            }
            ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize * 0.02);
        }
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    function drawNumber(value) {
        const text = value === '' ? '' : String(value);
        const data = rasterize(text);
        const canvasWidth = columns * cellPx;

        function brightnessAt(col, row) {
            let sum = 0, count = 0;
            for (let y = 0; y < cellPx; y++) {
                for (let x = 0; x < cellPx; x++) {
                    const px = ((row * cellPx + y) * canvasWidth + (col * cellPx + x)) * 4;
                    sum += data[px];
                    count++;
                }
            }
            return sum / count / 255;
        }

        const fragment = document.createDocumentFragment();
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const dot = document.createElement('span');
                dot.className = 'fo-git__dot';
                const b = brightnessAt(column, row);
                if (b > 0.05) {
                    dot.classList.add('is-digit');
                    if (b > 0.5) dot.classList.add('is-lit');
                    dot.style.opacity = Math.min(1, 0.2 + b * 0.9).toFixed(2);
                } else if (noiseAt(row, column)) {
                    dot.classList.add('is-noise', 'is-lit');
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
        drawNumber(total.toLocaleString(locale()));
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
    drawNumber(cache ? cache.total.toLocaleString(locale()) : '');

    // Ridisegna con il font vero quando è pronto, per evitare un primo render col fallback.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (currentTotal !== null) render(currentTotal); });
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
