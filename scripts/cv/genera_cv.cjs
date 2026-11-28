// Rigenera assets/cv/gabriele-lucia-cv.pdf da scripts/cv/cv.html.
// Serve playwright (o playwright-core) con un Chromium installato:
//   npx playwright install chromium
//   node scripts/cv/genera_cv.cjs
// Se playwright-core sta altrove: NODE_PATH=<cartella>/node_modules node scripts/cv/genera_cv.cjs
// Per un Chromium già presente sul disco: CHROMIUM=<percorso di chrome> node scripts/cv/genera_cv.cjs

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
    try { ({ chromium } = require('playwright-core')); } catch {
        console.error('Manca playwright: installa "playwright" oppure imposta NODE_PATH verso un playwright-core.');
        process.exit(1);
    }
}

const radice = path.resolve(__dirname, '..', '..');
const sorgente = path.join(__dirname, 'cv.html');
const uscita = path.join(radice, 'assets', 'cv', 'gabriele-lucia-cv.pdf');

(async () => {
    const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
    const page = await browser.newPage();
    await page.goto(pathToFileURL(sorgente).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    await page.pdf({ path: uscita, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await browser.close();
    console.log('Scritto ' + path.relative(radice, uscita));
})();
