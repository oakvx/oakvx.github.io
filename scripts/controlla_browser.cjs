#!/usr/bin/env node
/*
 * Controlla il sito in un browser vero (Playwright, solo in locale: non gira in CI).
 *
 *   node scripts/controlla_browser.cjs [--screenshot CARTELLA] [--solo /percorso/,/altro/]
 *
 * Serve il sito su http://localhost:8765 (avvia `python3 -m http.server` se la porta è libera),
 * visita ogni pagina di ENTRY_PAGES in scripts/check_site.py, in italiano e in inglese,
 * a 1440×900 e a 390×844 con touch, con le animazioni accese (le comparse vanno provate),
 * scorre fino in fondo e stampa i problemi in JSON.
 * Esce con 1 se ne trova almeno uno.
 *
 * Codici: js, console, http, trabocca, invisibile, h1, salto, piccolo, numerazione.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORTA = 8765;
const BASE = `http://localhost:${PORTA}/`;
const VISTE = [
    { nome: 'desktop', viewport: { width: 1440, height: 900 } },
    { nome: 'telefono', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
// open-meteo è bloccato in alcuni ambienti; l'API di GitHub ha un limite orario che il controllo stesso consuma
const IGNORA = /open-meteo|ERR_TUNNEL_CONNECTION_FAILED|api\.github\.com|rate limit exceeded/;

function pagineDaControllare() {
    const testo = fs.readFileSync(path.join(ROOT, 'scripts/check_site.py'), 'utf8');
    const blocco = testo.match(/ENTRY_PAGES = \(([\s\S]*?)\n\)/)[1];
    const file = [...blocco.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    const rotte = file.map(f => f.replace(/index\.html$/, ''));
    return [...rotte, ...rotte.map(r => 'en/' + r)];
}

function portaLibera() {
    return new Promise(ok => {
        const req = http.get(BASE, r => { r.resume(); ok(false); });
        req.on('error', () => ok(true));
    });
}

async function avviaServer() {
    if (!(await portaLibera())) return null;
    const p = spawn('python3', ['-m', 'http.server', String(PORTA)], { cwd: ROOT, stdio: 'ignore' });
    for (let i = 0; i < 50 && (await portaLibera()); i++) await new Promise(r => setTimeout(r, 100));
    return p;
}

// Gira nella pagina: raccoglie i problemi di struttura e di aspetto.
function esamina() {
    const W = innerWidth, out = [];
    const scorreDiLato = document.documentElement.scrollWidth > W + 1;
    const descr = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '');
    const nascosto = e => e.closest('[aria-hidden="true"], svg, canvas, .nastro, .indice, [hidden], .salta');
    for (const e of document.querySelectorAll('body *')) {
        if (nascosto(e)) continue;
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cs = getComputedStyle(e);
        // conta solo se la pagina scorre davvero di lato (un contenitore che taglia va bene)
        if (scorreDiLato && r.right > W + 2 && cs.position !== 'fixed') out.push({ codice: 'trabocca', dove: descr(e), valore: Math.round(r.right) });
        const testoProprio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        // le etichette in monospazio sono piccole di proposito, come .t-meta
        const mono = /Mono|monospace/.test(cs.fontFamily.split(',')[0]);
        if (testoProprio && !mono && !e.closest('.t-meta') && cs.visibility !== 'hidden' && +cs.opacity > 0 && parseFloat(cs.fontSize) < 13) {
            out.push({ codice: 'piccolo', dove: descr(e), valore: `${cs.fontSize} «${e.textContent.trim().slice(0, 30)}»` });
        }
    }
    for (const e of document.querySelectorAll('.rivela')) {
        if (!nascosto(e) && +getComputedStyle(e).opacity < .5) out.push({ codice: 'invisibile', dove: descr(e), valore: e.textContent.trim().slice(0, 40) });
    }
    const h1 = document.querySelectorAll('h1').length;
    if (h1 !== 1) out.push({ codice: 'h1', dove: 'pagina', valore: h1 });
    const titoli = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(e => !nascosto(e));
    for (let i = 1; i < titoli.length; i++) {
        const a = +titoli[i - 1].tagName[1], b = +titoli[i].tagName[1];
        if (b - a > 1) out.push({ codice: 'salto', dove: descr(titoli[i]), valore: `h${a}→h${b}` });
    }
    for (const e of document.querySelectorAll('.sezione-testa > .t-meta, .caso-capo > .t-meta')) {
        if (!/^\((?:[ivxlc]+)\)/.test(e.textContent.trim())) out.push({ codice: 'numerazione', dove: descr(e), valore: e.textContent.trim().slice(0, 20) });
    }
    // un problema per tipo e posto
    const visti = new Set();
    return out.filter(p => { const k = p.codice + p.dove; if (visti.has(k)) return false; visti.add(k); return true; });
}

async function controlla(contesto, vista, rotta, cartella) {
    const p = await contesto.newPage();
    const problemi = [];
    p.on('pageerror', e => problemi.push({ codice: 'js', valore: e.message }));
    p.on('console', m => { if (m.type() === 'error' && !IGNORA.test(m.text())) problemi.push({ codice: 'console', valore: m.text().slice(0, 120) }); });
    p.on('response', r => { if (r.status() >= 400 && !IGNORA.test(r.url())) problemi.push({ codice: 'http', valore: `${r.status()} ${r.url()}` }); });
    await p.goto(BASE + rotta, { waitUntil: 'load' });
    await p.waitForTimeout(500);
    const alto = await p.evaluate(() => document.documentElement.scrollHeight);
    const passo = vista.viewport.height * .7;
    for (let y = 0; y < alto; y += passo) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(90); }
    await p.waitForTimeout(700);
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(200);
    problemi.push(...(await p.evaluate(esamina)));
    if (cartella) await p.screenshot({ path: path.join(cartella, `${vista.nome}_${rotta.replace(/\W+/g, '_') || 'ingresso'}.png`), fullPage: true });
    await p.close();
    return problemi.map(x => ({ pagina: '/' + rotta, vista: vista.nome, ...x }));
}

async function main() {
    const args = process.argv.slice(2);
    const iShot = args.indexOf('--screenshot');
    const cartella = iShot >= 0 ? path.resolve(args[iShot + 1]) : null;
    if (cartella) fs.mkdirSync(cartella, { recursive: true });
    const iSolo = args.indexOf('--solo');
    let rotte = pagineDaControllare();
    if (iSolo >= 0) { const solo = args[iSolo + 1].split(',').map(s => s.replace(/^\//, '')); rotte = rotte.filter(r => solo.includes(r)); }

    const server = await avviaServer();
    const browser = await chromium.launch();
    const tutti = [];
    try {
        for (const vista of VISTE) {
            const { nome, ...opzioni } = vista;
            const contesto = await browser.newContext(opzioni);
            await contesto.addInitScript(() => {
                try {
                    sessionStorage.setItem('oakvx-ingresso', '1');
                    localStorage.setItem('lang', location.pathname.startsWith('/en/') ? 'en' : 'it');
                } catch {}
            });
            // quattro pagine alla volta
            for (let i = 0; i < rotte.length; i += 4) {
                const gruppo = await Promise.all(rotte.slice(i, i + 4).map(r => controlla(contesto, vista, r, cartella)));
                tutti.push(...gruppo.flat());
            }
            await contesto.close();
        }
    } finally {
        await browser.close();
        if (server) server.kill();
    }
    console.log(JSON.stringify(tutti, null, 1));
    console.error(`${tutti.length} problemi su ${rotte.length} pagine × ${VISTE.length} viste`);
    process.exit(tutti.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
