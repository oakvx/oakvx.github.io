#!/usr/bin/env node
/*
 * Fotogrammi fermi della sequenza della pistola, per controllarla a occhio.
 *
 *   node scripts/fotogrammi_pistola.cjs CARTELLA [ms,ms,...]
 *
 * Serve il sito su http://localhost:8765 (avvia `python3 -m http.server` se serve), apre /servizi/
 * a 1440×900 e a 390×844, carica la pistola e salva un PNG per ogni tempo della sequenza.
 */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'http://localhost:8765/';
const TEMPI = [280, 300, 305, 315, 340, 400, 700, 1100, 1350];

const libera = () => new Promise(ok => { const r = http.get(BASE, x => { x.resume(); ok(false); }); r.on('error', () => ok(true)); });

async function main() {
    const cartella = path.resolve(process.argv[2] || 'fotogrammi');
    const tempi = process.argv[3] ? process.argv[3].split(',').map(Number) : TEMPI;
    fs.mkdirSync(cartella, { recursive: true });
    let server = null;
    if (await libera()) {
        server = spawn('python3', ['-m', 'http.server', '8765'], { cwd: ROOT, stdio: 'ignore' });
        for (let i = 0; i < 50 && (await libera()); i++) await new Promise(r => setTimeout(r, 100));
    }
    const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
        for (const [w, h] of [[1440, 900], [390, 844]]) {
            const mobile = w < 600;
            const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
            await c.addInitScript(() => { try { sessionStorage.setItem('oakvx-ingresso', '1'); localStorage.setItem('lang', 'it'); } catch {} });
            const p = await c.newPage();
            p.on('pageerror', e => console.error('errore:', e.message));
            await p.goto(BASE + 'servizi/');
            await p.evaluate(async () => {
                window.__pistola = await window.OAKVX.proiettile.caricaPistola();
                document.querySelector('.sparo').classList.add('attivo');
            });
            for (const ms of tempi) {
                await p.evaluate(ms => window.__pistola.fotogramma(ms), ms);
                const file = path.join(cartella, `pistola_${w}_${String(ms).padStart(4, '0')}.png`);
                await p.screenshot({ path: file, timeout: 30000 });
                console.log(file);
            }
            await c.close();
        }
    } finally {
        await browser.close();
        if (server) server.kill();
    }
}

main().catch(e => { console.error(e); process.exit(1); });
