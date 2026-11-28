// Genera le immagini social 1200x630 (assets/social-<chiave>-<lingua>.png) con Playwright.
// Uso: PLAYWRIGHT_PATH=$(npm root -g)/playwright node scripts/genera_social.mjs
// Con un Chromium già sul disco: CHROMIUM=<percorso di chrome> (come per scripts/cv/genera_cv.cjs)
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const SITO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = p => pathToFileURL(path.join(SITO, p)).href;
const FIRMA = { it: 'Gabriele Lucia, detto oakvx', en: 'Gabriele Lucia, a.k.a. oakvx' };

// chiave: [etichetta it, etichetta en, titolo it, titolo en, sotto it, sotto en] (<em> = cremisi corsivo)
const PAGINE = {
    crediti: ['(N.2) NOTE', '(N.2) NOTES', 'Chi ha fatto <em>cosa.</em>', 'Who made <em>what.</em>', 'Licenze e provenienza dei materiali', 'Licences and origin of the materials'],
    privacy: ['(N.1) NOTE', '(N.1) NOTES', 'Cosa so di te. <em>Quasi niente.</em>', 'What I know about you. <em>Almost nothing.</em>', 'Niente cookie, niente statistiche', 'No cookies, no analytics'],
    'com-era': ['(N.3) NOTE', '(N.3) NOTES', 'Prima del nero, <em>c’era l’azzurro.</em>', 'Before the black, <em>there was blue.</em>', 'Il sito fino al 26 novembre 2026', 'The site until 26 November 2026'],
    contatti: ['(09) CONTATTI', '(09) CONTACT', 'Dimmi cosa ti serve. <em>Ti dico se posso.</em>', 'Tell me what you need. <em>I’ll tell you if I can.</em>'],
    lavori: ['(02) TUTTI I LAVORI', '(02) ALL WORK', 'Tutto quello che ho fatto. <em>Anche le cose piccole.</em>', 'Everything I’ve built. <em>Including the small stuff.</em>'],
    metodo: ['(05) METODO', '(05) METHOD', 'Non ho un manifesto. <em>Ho dei repository.</em>', 'I don’t have a manifesto. <em>I have repositories.</em>'],
    servizi: ['(06) SERVIZI', '(06) SERVICES', 'Cosa faccio. <em>E cosa ti arriva.</em>', 'What I do. <em>And what you get.</em>'],
    sicurezza: ['(07) SICUREZZA', '(07) SECURITY', 'La sicurezza non è un bollino. <em>È un elenco di scelte.</em>', 'Security isn’t a badge. <em>It’s a list of choices.</em>'],
    stile: ['(08) STILE', '(08) STYLE', 'Quattro colori, tre caratteri. <em>E una pistola.</em>', 'Four colours, three typefaces. <em>And a pistol.</em>'],
    'fuori-orario': ['(04) FUORI ORARIO', '(04) AFTER HOURS', 'Fuori <em>orario.</em>', 'After <em>hours.</em>'],
    magazzino: ['(M) MAGAZZINO', '(M) WAREHOUSE', 'Il Magazzino. <em>Roba da giocare, non da guardare.</em>', 'The Warehouse. <em>Stuff to play, not to look at.</em>'],
    blackjack: ['(M.1) MAGAZZINO', '(M.1) WAREHOUSE', 'Black<em>jack.</em>', 'Black<em>jack.</em>', 'Contro il banco, con gettoni finti', 'Against the dealer, with fake chips'],
    briscola: ['(M.2) MAGAZZINO', '(M.2) WAREHOUSE', 'Bris<em>cola.</em>', 'Bris<em>cola.</em>', 'Carte siciliane, uno contro uno', 'Sicilian cards, one on one'],
    scopa: ['(M.3) MAGAZZINO', '(M.3) WAREHOUSE', 'Sco<em>pa.</em>', 'Sco<em>pa.</em>', 'Settebello, primiera, fino a 11', 'Settebello, primiera, first to 11'],
    'scala-40': ['(M.4) MAGAZZINO', '(M.4) WAREHOUSE', 'Scala <em>40.</em>', 'Scala <em>40.</em>', 'Due mazzi, quattro jolly', 'Two decks, four jokers'],
    middleman: ['(02.7) PROGETTO', '(02.7) PROJECT', 'middleMan<em>PS4</em>', 'middleMan<em>PS4</em>', 'Ricerca su PS4, ogni affermazione con la sua etichetta', 'PS4 research, every claim tagged'],
    piko: ['(02.5) PROGETTO', '(02.5) PROJECT', 'piko<em>.</em>', 'piko<em>.</em>', 'Un agente locale che chiede il permesso', 'A local agent that asks first'],
    yag: ['(02.6) PROGETTO', '(02.6) PROJECT', 'yag<em>.</em>', 'yag<em>.</em>', 'Un gateway AI in C17', 'An AI gateway in C17'],
};

const html = (etichetta, titolo, sotto) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:S;src:url(${url('assets/nero/fonts/fraunces.woff2')});font-weight:100 900}
@font-face{font-family:S;src:url(${url('assets/nero/fonts/fraunces-italic.woff2')});font-style:italic;font-weight:100 900}
@font-face{font-family:A;src:url(${url('assets/nero/fonts/archivo.woff2')});font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:M;src:url(${url('assets/cascadia-code.woff2')});font-weight:200 700}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#050505;color:#E8E6E1;position:relative;overflow:hidden}
.m{text-transform:uppercase;position:absolute;font:400 16px M;letter-spacing:.08em;color:rgb(232 230 225/.55)}
.dot{position:absolute;right:64px;top:119px;width:14px;height:14px;border-radius:50%;background:#C81035}
h1{position:absolute;left:60px;right:64px;bottom:150px;font:400 108px/.95 S;letter-spacing:-.035em;font-variation-settings:"opsz" 36}
h1.l{font-size:84px}
em{font-style:italic;color:#C81035}
.r{position:absolute;left:64px;right:64px;top:520px;border-top:1px solid rgb(232 230 225/.14)}
.s{position:absolute;left:64px;top:540px;font:400 26px A;color:rgb(232 230 225/.75)}
</style>
<p class="m" style="left:64px;top:58px">${etichetta}</p><p class="m" style="right:64px;top:58px">OAKVX.GITHUB.IO</p><i class="dot"></i>
<h1 class="${titolo.length > 40 ? 'l' : ''}">${titolo}</h1><div class="r"></div><p class="s">${sotto}</p><p class="m" style="right:64px;top:550px;font-size:15px">2026</p>`;

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [chiave, v] of Object.entries(PAGINE)) {
    for (const [i, lingua] of ['it', 'en'].entries()) {
        const sotto = v[4] ? v[4 + i] : FIRMA[lingua];
        const tmp = path.join(os.tmpdir(), `social-${chiave}-${lingua}.html`);
        fs.writeFileSync(tmp, html(v[i], v[2 + i], sotto));
        await page.goto(pathToFileURL(tmp).href);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(SITO, `assets/social-${chiave}-${lingua}.png`) });
    }
}
await browser.close();
console.log('ok', Object.keys(PAGINE).length * 2, 'immagini');
