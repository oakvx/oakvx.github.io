/* One native dialog, original links as fallback, no custom focus trap. */
(() => {
    'use strict';
    if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
    const root = document.documentElement;
    const site = new URL('../../', document.currentScript.src);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const words = {
        it: { contact: 'Scrivimi', email: 'Invia email', copy: 'Copia indirizzo', cancel: 'Annulla', open: 'Apri il progetto', code: 'Vedi il codice' },
        en: { contact: 'Get in touch', email: 'Send email', copy: 'Copy address', cancel: 'Cancel', open: 'Open project', code: 'View code' }
    };
    const icon = path => '<svg class="btn__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+path+'</svg>';
    const dialog = document.createElement('dialog');
    dialog.className = 'site-dialog';
    dialog.setAttribute('aria-labelledby', 'site-dialog-title');
    dialog.innerHTML = '<h2 class="site-dialog__title" id="site-dialog-title"></h2><div class="site-dialog__actions"></div><p class="site-dialog__status" role="status" aria-live="polite"></p>';
    const title = dialog.querySelector('h2'), actions = dialog.querySelector('.site-dialog__actions'), status = dialog.querySelector('[role="status"]');
    function action(tag, classes, graphic, key) {
        const node = document.createElement(tag);
        if (tag === 'button') node.type = 'button';
        node.className = classes;
        node.dataset.dialogAction = key;
        node.innerHTML = icon(graphic)+'<span></span>';
        return node;
    }
    const open = action('a','btn','<path d="M14 3h7v7m0-7-11 11M10 3H3v18h18v-7"/>','open');
    const copy = action('button','btn btn--ghost','<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 4H4v12"/>','copy');
    const code = action('a','btn btn--ghost','<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10m12-10v2c0 4-12 1-12 5"/>','code');
    const cancel = action('button','btn btn--ghost btn--cancel','<path d="m6 6 12 12M6 18 18 6"/>','cancel');
    cancel.insertAdjacentHTML('beforeend','<span class="btn__key" aria-hidden="true">ESC</span>');
    actions.append(open, cancel);
    document.body.append(dialog);
    let opener, mode = 'contact', projectTitle = '', address = '', closing = false, version = 0;
    const labels = () => {
        const text = words[root.lang === 'en' ? 'en' : 'it'];
        title.textContent = mode === 'contact' ? text.contact : projectTitle;
        open.querySelector('span').textContent = mode === 'contact' ? text.email : text.open;
        open.querySelector('svg').innerHTML = mode === 'contact' ? '<path d="M3 6h18v12H3zM3 6l9 7 9-7"/>' : '<path d="M14 3h7v7m0-7-11 11M10 3H3v18h18v-7"/>';
        copy.querySelector('span').textContent = text.copy;
        code.querySelector('span').textContent = text.code;
        cancel.querySelector('span').textContent = text.cancel;
    };
    function finish(value = 'cancel') {
        if (dialog.open) dialog.close(value);
    }
    function close() {
        if (!dialog.open || closing) return;
        if (calm() || document.hidden) return finish();
        closing = true;
        dialog.classList.add('is-closing');
    }
    dialog.addEventListener('animationend', event => { if (event.target === dialog && event.animationName === 'site-dialog-out') finish(); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    cancel.addEventListener('click', close);
    dialog.addEventListener('close', () => {
        version++;
        closing = false;
        dialog.classList.remove('is-closing');
        root.classList.remove('has-site-dialog');
        if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    copy.addEventListener('click', async () => {
        const ticket = version;
        const result = await window.portfolioActions.copyEmail(address, false);
        if (dialog.open && ticket === version) status.textContent = result.message;
    });
    new MutationObserver(() => { if (closing && calm()) finish(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(labels).observe(root, { attributes: true, attributeFilter: ['lang'] });
    reduced.addEventListener('change', () => { if (closing && calm()) finish(); });
    document.addEventListener('visibilitychange', () => { if (closing && document.hidden) finish(); });
    const metadata = new Map();
    function projectData(url) {
        const key = url.origin+url.pathname;
        if (!metadata.has(key)) metadata.set(key, fetch(url.href).then(response => {
            if (!response.ok) throw new Error('Project unavailable');
            return response.text();
        }).then(html => {
            const template = document.createElement('template');
            template.innerHTML = html;
            const hero = template.content.querySelector('.page-hero');
            const name = hero?.querySelector('h1')?.textContent.trim().replace(/\.$/,'');
            const repo = [...(hero?.querySelectorAll('.project-actions a[href]') || [])].find(link => {
                const target = new URL(link.getAttribute('href'),url);
                return ['github.com','gitlab.com','codeberg.org'].includes(target.hostname) && target.pathname.split('/').filter(Boolean).length >= 2;
            });
            return { name, repo: repo ? { href: new URL(repo.getAttribute('href'),url).href, target: repo.target, rel: repo.rel } : null };
        }).catch(() => null));
        return metadata.get(key);
    }
    function projectURL(link) {
        const url = new URL(link.href, location.href);
        const prefix = site.pathname+'projects/';
        return url.origin === location.origin && url.pathname.startsWith(prefix) && /^\w[\w-]*\/(?:index\.html)?$/.test(url.pathname.slice(prefix.length)) && !url.hash && url.pathname !== location.pathname ? url : null;
    }
    function mark(link) {
        if (!link || dialog.contains(link)) return;
        const project = projectURL(link);
        if (project || link.protocol === 'mailto:') link.setAttribute('aria-haspopup','dialog');
        if (project) projectData(project);
    }
    document.querySelectorAll('a[href]').forEach(link => { if (projectURL(link) || link.protocol === 'mailto:') link.setAttribute('aria-haspopup','dialog'); });
    document.addEventListener('focusin', event => mark(event.target.closest?.('a[href]')));
    document.addEventListener('pointerover', event => mark(event.target.closest?.('a[href]')), { passive: true });
    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download')) return;
        if (dialog.contains(link)) { finish(link === code ? 'code' : 'open'); return; }
        const url = new URL(link.href, location.href), project = projectURL(link);
        const contact = url.protocol === 'mailto:' && typeof window.portfolioActions?.copyEmail === 'function';
        if (!contact && !project) return;
        if (dialog.open) return;
        mode = contact ? 'contact' : 'project';
        opener = link;
        const ticket = ++version;
        projectTitle = link.closest('[data-proj]')?.querySelector('.proj__name')?.textContent.trim() || link.querySelector('h2')?.textContent.trim() || link.textContent.trim().replace(/^\d+\s+|\s*[↗.]$/g,'');
        status.textContent = '';
        copy.remove(); code.remove();
        if (contact) {
            try { address = decodeURIComponent(url.pathname); } catch { address = url.pathname; }
            actions.insertBefore(copy,cancel);
        }
        open.href = link.href;
        for (const attribute of ['target','rel']) {
            if (link.hasAttribute(attribute)) open.setAttribute(attribute,link.getAttribute(attribute));
            else open.removeAttribute(attribute);
        }
        labels();
        try { dialog.showModal(); } catch { return; }
        event.preventDefault();
        root.classList.add('has-site-dialog');
        open.focus({ preventScroll: true });
        if (project) projectData(project).then(data => {
            if (!dialog.open || version !== ticket || mode !== 'project' || !data) return;
            if (data.name) projectTitle = data.name;
            if (data.repo) {
                code.href = data.repo.href;
                if (data.repo.target) code.target = data.repo.target;
                else code.removeAttribute('target');
                code.rel = data.repo.rel || 'noopener noreferrer';
                actions.insertBefore(code,cancel);
            }
            labels();
        });
    });
    labels();
})();
