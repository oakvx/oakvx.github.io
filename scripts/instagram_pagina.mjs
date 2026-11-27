// Apre il profilo pubblico Instagram con Playwright, legge follower, seguiti e post
// dalla descrizione della pagina ("1,234 Followers, 56 Following, 78 Posts - ...") e
// aggiorna instagram:oakvx in assets/social/manuale.json. Salva sempre uno screenshot.
// Se Instagram mostra il muro di login o i numeri non si leggono, non tocca niente ed esce con 0.
// Uso: PLAYWRIGHT_PATH=$(npm root -g)/playwright node scripts/instagram_pagina.mjs [screenshot.png]
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const SITO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANUALE = path.join(SITO, 'assets', 'social', 'manuale.json');
const CHIAVE = 'instagram:oakvx';

const MOLTIPLICATORI = { k: 1e3, m: 1e6, b: 1e9 };
function numero(testo) {
    const m = String(testo).trim().replace(/,/g, '').match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/i);
    if (!m) return null;
    return Math.round(parseFloat(m[1]) * (m[2] ? MOLTIPLICATORI[m[2].toLowerCase()] : 1));
}

// "1,234 Followers, 56 Following, 78 Posts - See Instagram photos..." (anche in italiano)
export function leggiConteggi(descrizione) {
    const d = String(descrizione || '');
    const cerca = (...nomi) => {
        const m = d.match(new RegExp(`([\\d.,]+\\s*[kmb]?)\\s+(?:${nomi.join('|')})\\b`, 'i'));
        return m ? numero(m[1]) : null;
    };
    const r = { follower: cerca('followers?', 'follower'), seguiti: cerca('following', 'seguiti'), post: cerca('posts?', 'post') };
    return Object.values(r).every(v => v !== null) ? r : null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
    const shot = process.argv[2] || 'instagram.png';
    const browser = await chromium.launch();
    const page = await (await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 900 } })).newPage();
    let esito = 'nessuna modifica';
    try {
        const r = await page.goto('https://www.instagram.com/oakvx/', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(4000);
        console.log('HTTP', r && r.status(), '→', page.url());
        console.log('Titolo:', await page.title());
        const descrizioni = await page.evaluate(() => [...document.querySelectorAll('meta[property="og:description"],meta[name="description"]')].map(m => m.content));
        console.log('Descrizione:', descrizioni.join(' | ').slice(0, 300) || '(nessuna)');
        const conteggi = descrizioni.map(leggiConteggi).find(Boolean);
        const login = /\/accounts\/login/.test(page.url());
        if (login) console.log('Instagram chiede il login: nessun conteggio pubblico.');
        if (conteggi) {
            const manuale = JSON.parse(fs.readFileSync(MANUALE, 'utf8'));
            const vecchio = manuale[CHIAVE] || {};
            if (['follower', 'seguiti', 'post'].every(k => vecchio[k] === conteggi[k])) esito = 'conteggi invariati';
            else {
                manuale[CHIAVE] = { ...conteggi, aggiornato: new Date().toISOString().slice(0, 10) };
                fs.writeFileSync(MANUALE, JSON.stringify(manuale, null, 1) + '\n');
                esito = 'aggiornato ' + JSON.stringify(manuale[CHIAVE]);
            }
        } else console.log('Conteggi non leggibili dalla pagina.');
    } catch (e) {
        console.log('Errore:', e.message.split('\n')[0]);
    }
    await page.screenshot({ path: shot }).catch(() => {});
    await browser.close();
    console.log(esito);
}
