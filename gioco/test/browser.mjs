// Test nel browser: server statico interno + Chromium (Playwright preinstallato).
// Uso: node gioco/test/browser.mjs [scenario…]   (senza argomenti: tutti gli scenari)
// Ogni scenario in gioco/test/scenari/<nome>.mjs esporta:
//   default async (page, aiuto) => {}   e, opzionali, prepara(page) e query (stringa aggiunta all'URL).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const qui = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(qui, '../..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };

function server() {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(radice, p);
    if (!file.startsWith(radice) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': TIPI[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => s.listen(0, '127.0.0.1', () => ok(s)));
}

const nomi = process.argv.slice(2);
// i file che iniziano con _ sono aiuti condivisi, non scenari
const tutti = fs.readdirSync(path.join(qui, 'scenari')).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).map((f) => f.slice(0, -4)).sort();
const scelti = nomi.length ? nomi : tutti;

const srv = await server();
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
let falliti = 0;

for (const nome of scelti) {
  const mod = await import(pathToFileURL(path.join(qui, 'scenari', nome + '.mjs')).href);
  const context = await browser.newContext({ viewport: { width: 960, height: 600 } });
  // GitHub non si chiama mai davvero: risposta fissa (gli scenari possono sovrascriverla)
  await context.route('https://api.github.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"total_count":1250}' }));
  const page = await context.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push('pageerror: ' + e.message));
  // gli errori di rete del browser ("Failed to load resource") non sono errori del codice
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errori.push('console.error: ' + m.text());
    // errori WebGL (es. feedback loop): il browser salta il disegno, quindi sono bug veri
    if (m.text().includes('GL_INVALID') && !errori.some((e) => e.includes('GL_INVALID'))) errori.push('webgl: ' + m.text());
  });
  const aiuto = {
    base,
    leggi: () => page.evaluate(() => window.__gioco.leggi()),
    esegui: (fn, ...args) => page.evaluate(fn, ...args),
    attendi: async (cond, ms = 5000, arg) => {
      const t0 = Date.now();
      for (;;) {
        if (await page.evaluate(cond, arg)) return;
        if (Date.now() - t0 > ms) throw new Error('attesa scaduta: ' + cond.toString().slice(0, 120));
        await page.waitForTimeout(50);
      }
    },
    aspetta: (ms) => page.waitForTimeout(ms),
  };
  try {
    if (mod.prepara) await mod.prepara(page, aiuto);
    // gli scenari di gioco girano in modalità leggera; quelli sulla resa grafica esportano `pesante`
    await page.goto(`${base}/gioco/?avvia=gioco&debug&lang=it${mod.pesante ? '' : '&leggero'}${mod.query || ''}`);
    await page.waitForFunction(() => window.__gioco && window.__gioco.leggi, null, { timeout: 30000 });
    await mod.default(page, aiuto);
    if (errori.length) throw new Error(errori.join('\n'));
    console.log('OK ' + nome);
  } catch (e) {
    falliti++;
    console.log('FALLITO ' + nome + '\n  ' + String(e && e.stack || e).split('\n').slice(0, 6).join('\n  '));
  }
  await context.close();
}
await browser.close();
srv.close();
process.exit(falliti ? 1 : 0);
