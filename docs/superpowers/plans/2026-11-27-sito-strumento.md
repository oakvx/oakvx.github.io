# Sito "Strumento" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare il sito "Nero" in un banco di lavoro (griglia, scultura con mirino, numeri dal vivo), riscrivere i testi nel tono cinico ma simpatico e sostituire il sipario con una transizione a proiettile sparato da una pistola 3D.

**Architecture:** Si evolve il sito statico esistente. Le pagine italiane si generano da sorgenti in `scripts/pagine/` con `scripts/genera_pagine.py` (oggi il generatore vive fuori dal repository: il primo task lo porta dentro). Lo stile resta in `assets/nero/nero.css`, il comportamento in `assets/nero/nero.js`; la transizione vive in due file nuovi: `assets/nero/proiettile.js` (logica pura + DOM del fascio) e `assets/nero/pistola.js` (scena three.js caricata a richiesta).

**Tech Stack:** HTML, CSS, JavaScript vanilla, three.js da `gioco/vendor/three/` (con `GLTFLoader`), Python 3 stdlib per generazione e controlli, `node --test` per i test della logica.

**Spec:** `docs/superpowers/specs/2026-11-27-sito-strumento-design.md`

## Global Constraints

- Palette: nero `#050505`, bianco caldo `#E8E6E1`, cremisi `#C81035`, grafite `#292929`. Niente vetro, niente gradienti decorativi.
- Font: Fraunces, Archivo (asse di larghezza 62–125), Cascadia Code. Nessun font nuovo.
- Nessuna etichetta da laboratorio: vietate le parole "lab", "exp.", "obj.", "esperimenti" nei testi e nelle classi visibili.
- Tono: frasi corte, prima persona, ironia su di sé o sulla situazione, mai sul visitatore; nessun superlativo; fatti esatti.
- Frase della home: «Faccio siti, software e grafica. Di solito funzionano al primo colpo. Di solito.»
- Ogni testo visibile ha la sua chiave in `assets/nero/i18n-en.js`; dopo ogni modifica `python3 scripts/build_static.py` deve finire senza chiavi mancanti.
- Movimento ridotto o "Ferma animazioni" (`html.calm` / `html.paused`) spengono transizione e animazioni.
- Pistola solo con puntatore fine, larghezza ≥ 900px e WebGL; peso dell'asset ≤ 1,2 MB.
- Transizione d'uscita ≤ 950 ms prima della navigazione; arrivo ≈ 600 ms.
- **Un commit per ogni passo che cambia qualcosa** (l'utente vuole il maggior numero possibile di commit), mai commit vuoti. Autore `oakvx <oakvx7@gmail.com>`, nessuna riga di attribuzione a Claude.
- Branch `sito-nero`, PR #20 verso `main`.

## Review Focus

- Clic con Ctrl/Cmd, tasto centrale o `target="_blank"`: nessuna transizione, apertura normale del link.
- Ritorno con il tasto Indietro (bfcache): la pagina non resta coperta dal fascio.
- Pistola non ancora caricata al clic: parte subito la versione solo-fascio, senza attese.
- Link alla stessa pagina con ancora (`#lavori`, `#contatti`): nessuna transizione, scorrimento normale.
- Testo "oakvx." nel fascio su schermi stretti (390px): resta leggibile e non va a capo.

---

### Task 1: Portare il generatore delle pagine nel repository

**Files:**
- Create: `scripts/genera_pagine.py` (dal generatore attuale), `scripts/pagine/testata.html`, `scripts/pagine/colophon.html`, `scripts/pagine/corpi/*.html` (index, chi-sono, brat, synk, beautify, autoofficina, fuori-orario, classic, 404, credits)
- Modify: `README.md` (sezione "Sistema di pagine": come si rigenerano le pagine)

**Interfaces:**
- Produces: `python3 scripts/genera_pagine.py` riscrive le 10 pagine italiane da `scripts/pagine/`; i segnaposto restano `%R%`, `%ROUTE%`, `%N%`, `%TKEY%`, `%TITOLO%`, `%COMMIT_*%`.

- [ ] **Step 1:** Copia generatore e sorgenti attuali (`gen.py`, `testata.html`, `colophon.html`, `body/*.html`) nei percorsi sopra; nel generatore `HERE` diventa `scripts/pagine` e `SITE` la radice del repository.
- [ ] **Step 2:** Run `python3 scripts/genera_pagine.py && git status --short -- '*.html'` — Expected: nessuna pagina modificata (output identico a quello attuale).
- [ ] **Step 3:** Run `python3 scripts/build_static.py && python3 scripts/check_site.py` — Expected: `OK: ...`.
- [ ] **Step 4:** Commit "Move the page generator and its sources into the repository".
- [ ] **Step 5:** Aggiorna il README, commit "Document how the pages are generated".

### Task 2: Test della logica del sito con node --test

**Files:**
- Create: `test/sito/carica.mjs` (helper: carica uno script classico in un contesto `vm` con `window` finto e restituisce `window.OAKVX`)
- Modify: `.github/workflows/site-check.yml` (passo `node --test 'test/sito/*.test.mjs'`)

**Interfaces:**
- Produces: `carica(percorso, finestra = {}) -> Promise<object>` che esegue il file e restituisce `finestra.OAKVX`.

- [ ] **Step 1:** Scrivi `carica.mjs` e un test fumo `test/sito/fumo.test.mjs` che carica `assets/nero/i18n-en.js` e verifica `typeof window.OAKVX_EN === 'object'` (per questo file il helper restituisce l'intero `window`).
- [ ] **Step 2:** Run `node --test 'test/sito/*.test.mjs'` — Expected: 1 pass.
- [ ] **Step 3:** Commit "Add a node test harness for the site scripts".
- [ ] **Step 4:** Aggiungi il passo alla CI, commit "Run the site tests in CI".

### Task 3: Asset della pistola

**Files:**
- Create: `assets/nero/pistola/service_pistol.gltf`, `service_pistol.bin`, `textures/*.webp`, `assets/nero/pistola/LEGGIMI.md`
- Modify: `scripts/pagine/corpi/credits.html`, `assets/nero/i18n-en.js` (chiave `cr.pistol`)

- [ ] **Step 1:** Scarica la versione glTF 1k di `service_pistol` dall'API di Poly Haven (`https://api.polyhaven.com/files/service_pistol`), in una cartella temporanea nuova.
- [ ] **Step 2:** Converti le tre texture (diff, nor_gl, arm) in WebP 1024px qualità 82 e aggiorna gli URI nel `.gltf`. Run `du -ch assets/nero/pistola | tail -1` — Expected: ≤ 1,2M.
- [ ] **Step 3:** Commit "Add the Poly Haven service pistol, textures recompressed to WebP".
- [ ] **Step 4:** Scrivi `LEGGIMI.md` (fonte, autore Mateusz Sadek, CC0, modifiche), commit "Document the pistol asset source and licence".
- [ ] **Step 5:** Voce nei crediti IT/EN, rigenera e controlla, commit "Credit the pistol in the materials page".

### Task 4: Logica della transizione (pura, testata)

**Files:**
- Create: `assets/nero/proiettile.js`, `test/sito/proiettile.test.mjs`

**Interfaces:**
- Produces, in `window.OAKVX.proiettile`:
  - `vaFatta(evento: {button, metaKey, ctrlKey, shiftKey, altKey, defaultPrevented}, link: {href, target, download, origine, pagina}, pagina: {href, origine}, calmo: boolean) -> boolean`
  - `usaPistola(ambiente: {puntatoreFine: boolean, larghezza: number, webgl: boolean, calmo: boolean}) -> boolean`
  - `fase(ms: number) -> {pistola: number, sparo: number, proiettile: number, fascio: number, copertura: number}` (ciascuno 0..1)
  - costanti `USCITA_MS = 900`, `ARRIVO_MS = 600`

- [ ] **Step 1: Test che falliscono**

```js
test('vaFatta: link interno a un’altra pagina', () => assert.equal(p.vaFatta(ev(), link('/chi-sono/'), pag('/'), false), true));
test('vaFatta: Ctrl, tasto centrale, _blank, download, altra origine, stessa pagina con ancora, calmo → false', ...);
test('usaPistola: solo puntatore fine, ≥ 900px, webgl, non calmo', ...);
test('fase(0): tutto 0; fase(180).sparo > 0; fase(480).proiettile === 1; fase(900).copertura === 1', ...);
```

- [ ] **Step 2:** Run `node --test test/sito/proiettile.test.mjs` — Expected: FAIL (file assente).
- [ ] **Step 3:** Implementa le funzioni. Fasi dello spec: sparo 150–260 ms, proiettile 180–480 ms, fascio 180–520 ms, copertura 480–900 ms, pistola entra 0–180 ms ed esce 600–900 ms.
- [ ] **Step 4:** Run — Expected: PASS. Commit "Add the bullet transition timing and link rules, with tests".

### Task 5: Fascio di luce senza pistola (sostituisce il sipario)

**Files:**
- Modify: `assets/nero/proiettile.js` (parte DOM), `assets/nero/nero.js` (rimuove `initVelo`, chiama `OAKVX.proiettile.avvia()`), `assets/nero/nero.css` (rimuove `.velo*`, aggiunge `.sparo*`), `scripts/genera_pagine.py` (script `proiettile.js` in testa a tutte le pagine; `velo-entra` → `sparo-arrivo` nello script pre-paint)

**Interfaces:**
- Consumes: `vaFatta`, `fase`, costanti (Task 4).
- Produces: `OAKVX.proiettile.avvia({ pistola?: { spara(tempo: (ms)=>void): void, pronta(): boolean } })`; `OAKVX.proiettile.collegaPistola(pistola)`; evento `nero:sparo` con `{ fase }`.

- [ ] **Step 1:** DOM: livello fisso `.sparo` con lampo (`.sparo__lampo`), proiettile (`.sparo__proiettile`) e fascio (`.sparo__fascio`) che contiene "oakvx." in Archivo compresso maiuscolo, ripetuto quanto serve sulla lunghezza; il fascio si allarga fino a coprire con bianco caldo che vira al nero. Commit "Draw the light beam layer for page changes".
- [ ] **Step 2:** Clic intercettato con `vaFatta`, animazione guidata da `fase()` con `requestAnimationFrame`, navigazione a `USCITA_MS`, `sessionStorage['nero-sparo'] = '1'`. Commit "Fire the beam on internal link clicks".
- [ ] **Step 3:** Arrivo: con `html.sparo-arrivo` la pagina parte coperta da una banda che si apre in `ARRIVO_MS`; sicurezza CSS a 1,6 s; `pageshow` persistente scopre subito. Commit "Open new pages from inside the beam".
- [ ] **Step 4:** Rimuovi il vecchio sipario da JS e CSS. Commit "Remove the old curtain".
- [ ] **Step 5:** Verifica nel browser: clic su un lavoro in home a 1440×900 e 390×844, fotogrammi a 100, 300, 600, 850 ms; con `reducedMotion: 'reduce'` nessun livello `.sparo` visibile. Run check_site — Expected: OK.

### Task 6: Pistola 3D

**Files:**
- Create: `assets/nero/pistola.js`
- Modify: `scripts/genera_pagine.py` (nessun tag: `proiettile.js` importa `pistola.js` dinamicamente)

**Interfaces:**
- Consumes: `usaPistola`, `collegaPistola` (Task 4–5); `gioco/vendor/three/three.module.js`, `gioco/vendor/three/addons/loaders/GLTFLoader.js`.
- Produces: modulo ES che esporta `async function creaPistola(contenitore: HTMLElement) -> { spara(tempo: (ms)=>void): void, pronta(): boolean, distruggi(): void }`.

- [ ] **Step 1:** Scena: camera ortografica-ish di profilo, canna verso destra all'altezza `46%` dello schermo, luce di taglio calda + riempimento freddo debole, materiale PBR dell'asset, canvas trasparente sopra la pagina dentro `.sparo`. Commit "Set up the pistol scene".
- [ ] **Step 2:** Animazione `spara`: entrata da sinistra 0–180 ms, rinculo 8° e −3% in 60 ms con ritorno in 200 ms, uscita 600–900 ms, letta da `fase()`. Commit "Animate the pistol entrance, recoil and exit".
- [ ] **Step 3:** Caricamento pigro in `proiettile.js`: se `usaPistola(...)`, `import('./pistola.js')` dopo `load` + `requestIdleCallback` (o al primo `pointerenter` su un link interno). Commit "Load the pistol lazily on desktop".
- [ ] **Step 4:** Il proiettile parte dalla volata calcolata dalla scena (`pistola.volata() -> {x, y}` in pixel, aggiungi all'interfaccia) invece che dal bordo. Commit "Fire the bullet from the muzzle".
- [ ] **Step 5:** Verifica: fotogrammi della sequenza a 1440×900; peso trasferito della home prima del `load` invariato (pannello Network di Playwright: nessuna richiesta a `pistola/` prima dell'evento `load`).

### Task 7: Linguaggio visivo "banco di lavoro"

**Files:**
- Modify: `assets/nero/nero.css`, `scripts/pagine/*`

- [ ] **Step 1:** Griglia fissa su `body::after` (1px, `rgb(232 230 225 / .05)`, passo 120px desktop, 80px sotto 900px). Commit "Lay a fixed working grid under every page".
- [ ] **Step 2:** Tacche d'angolo: utility `.tacche` (quattro angoli a 1px, 10px di lato) sostituisce i bordi pieni di `.term`, `.lyric`, `.flusso`, `.orari`, `.profilo`, `.tecnologie`. Un commit per componente ("Mark the corners of the terminal", ...).
- [ ] **Step 3:** Croci agli incroci principali della griglia nelle aperture delle pagine (pseudo-elementi, max 4 per schermata). Commit "Add crosshair marks to the page openings".

### Task 8: Apertura della home

**Files:**
- Modify: `scripts/pagine/corpi/index.html`, `assets/nero/nero.css`, `assets/nero/nero.js`, `assets/nero/i18n-en.js`

**Interfaces:**
- Consumes: dati commit (`initCommitSito`) e `assets/social/social.json` già esistenti.
- Produces: pannello `.strumenti-vivi` con `[data-vivo="commit"]`, `[data-vivo="tiktok"]`, `[data-vivo="ora"]`, `[data-vivo="ultimo"]`.

- [ ] **Step 1:** "oakvx" in Archivo compresso grande a sinistra (sostituisce il corsivo); frase della home dai Global Constraints. Commit "Set the home title in condensed Archivo".
- [ ] **Step 2:** Cerchio di misura e mirino cremisi centrati sulla scultura (`data-spostamento` del campo allineato). Commit "Frame the sculpture with a measuring ring and crosshair".
- [ ] **Step 3:** Pannello a destra con i quattro valori vivi e mini istogramma dei commit (riusa i dati di `initCommitSito`, nessuna nuova richiesta). Commit "Add the live numbers column to the home opening".
- [ ] **Step 4:** Al massimo due annotazioni mono con freccia sottile ("tieni premuto", "la luce segue il cursore"). Commit "Annotate the sculpture".
- [ ] **Step 5:** Screenshot 1440×900, 1920×1080, 390×844 — Expected: nessuna sovrapposizione fra titolo, pannello e annotazioni.

### Task 9: Lavori in colonne

**Files:**
- Modify: `scripts/pagine/corpi/index.html`, `assets/nero/nero.css`, `assets/nero/nero.js` (le anteprime che seguono il cursore si tolgono: l'immagine è nella colonna)

- [ ] **Step 1:** Quattro colonne separate da filetti verticali fino al fondo della sezione; immagine in scala di grigi che si colora al passaggio; sotto i 900px una colonna. Commit "Lay out the work as ruled columns".
- [ ] **Step 2:** Rimuovi `initAnteprime` e il relativo CSS. Commit "Drop the cursor-following previews".
- [ ] **Step 3:** Archivio dei repository nello stesso stile a colonne. Commit "Restyle the repository archive as columns".

### Task 10: Testi nel nuovo tono, pagina per pagina

**Files:**
- Modify: `scripts/pagine/**`, `assets/nero/i18n-en.js`, `assets/ingresso/ingresso.js` (testi del menu d'ingresso), `assets/nero/nero.js` (DYN: terminale, stati)

Un commit per ciascun punto, con la traduzione inglese nello stesso commit; dopo ognuno `genera_pagine.py`, `build_static.py`, `check_site.py`:

- [ ] Menu, testata e colophon («Scrivimi. Rispondo. Non subito, ma rispondo.»). Commit "Rewrite the navigation and footer copy".
- [ ] Home (frase dei Global Constraints; lavori: «Quattro progetti. Ne avrei altri, ma questi reggono.»). Commit "Rewrite the home copy".
- [ ] Chi sono («Ho iniziato smontando programmi per vedere cosa c'era dentro. Non ho ancora smesso, e nessuno me l'ha chiesto.»). Commit "Rewrite the about page copy".
- [ ] Brat Animator. Commit "Rewrite the Brat Animator case study copy".
- [ ] Synk. Commit "Rewrite the Synk case study copy".
- [ ] Beautify. Commit "Rewrite the Beautify case study copy".
- [ ] Spinotto Felice. Commit "Rewrite the Spinotto Felice case study copy".
- [ ] Fuori orario («Quello che faccio quando nessuno guarda. Più o meno sempre.»). Commit "Rewrite the after hours copy".
- [ ] 404 («Qui non c'è niente. Non l'ho perso io.»). Commit "Rewrite the 404 copy".
- [ ] Menu d'ingresso e terminale. Commit "Rewrite the entry menu and terminal copy".
- [ ] Controllo: `grep -riE '\b(lab|exp\.|obj\.|esperiment)' scripts/pagine assets/nero/i18n-en.js` — Expected: nessun risultato.

### Task 11: Pagine interne nel linguaggio nuovo

**Files:**
- Modify: `assets/nero/nero.css`, `scripts/pagine/corpi/*`

- [ ] Casi studio: apertura con griglia, croci e scheda tecnica in colonna. Commit "Bring the case study openings onto the grid".
- [ ] Chi sono: ritratto in punti con cerchio di misura come la home. Commit "Frame the about portrait like the home sculpture".
- [ ] Fuori orario: console come oggetti sul piano, card TikTok con tacche. Commit "Bring after hours onto the grid".
- [ ] 404 e crediti. Commit "Bring the 404 and credits onto the grid".

### Task 12: Chiusura

- [ ] Aggiorna README e lo spec di design con lo stato finale. Commit "Document the workbench redesign".
- [ ] Rigenera le anteprime social se i titoli sono cambiati. Commit "Refresh the social cards".
- [ ] Verifica completa: `node --test 'test/sito/*.test.mjs'`, `node --test 'gioco/test/unit/*.test.mjs'`, `python3 scripts/build_static.py`, `python3 scripts/check_site.py`, screenshot di ogni pagina ai quattro formati, sequenza della transizione su desktop e mobile.
- [ ] Push su `sito-nero` e aggiornamento della descrizione della PR #20.
