# Magazzino e rifinitura — piano di esecuzione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rifinire il sito (difetti, testi, pistola realistica, tecnologie a quadratini gelatinosi) e aggiungere il Magazzino con giochi di carte veri contro il computer.

**Architecture:** Sito statico vanilla. Regole, fisica e avversari sono funzioni pure in script classici che si agganciano a `window.OAKVX` (testabili con `test/sito/carica.mjs`). Le pagine IT si generano da `scripts/pagine/` con `scripts/genera_pagine.py`, le EN da `scripts/build_static.py` più `assets/nero/i18n-en.js`. Il piano è in cinque parti (A–E): ognuna si pubblica da sola, nell'ordine.

**Tech Stack:** HTML/CSS/JS senza bundler, three.js (`/gioco/vendor/three`), Python 3 per generatore e controlli, `node --test`, Playwright (solo locale, per i controlli nel browser).

**Spec:** `docs/superpowers/specs/2026-11-27-magazzino-e-rifinitura-design.md`

## Global Constraints

- Palette `#050505` / `#E8E6E1` / `#C81035` / `#292929`; caratteri Fraunces, Archivo, Cascadia Code; niente glassmorphism.
- Ogni testo visibile ha `data-i18n*` e la traduzione in `assets/nero/i18n-en.js`; dopo ogni modifica: `python3 scripts/genera_pagine.py && python3 scripts/build_static.py && python3 scripts/check_site.py && node --test 'test/sito/*.test.mjs'`, tutto verde.
- Movimento ridotto e classe `paused` spengono animazioni; tutto resta usabile da tastiera e lettore di schermo.
- Niente tracciamento; ogni nuova chiamata esterna va scritta nella pagina Sicurezza (`scripts/pagine/corpi/sicurezza.html`, voce `sc.s2text`).
- Commit piccoli, autore `oakvx <oakvx7@gmail.com>`, nessun trailer o firma Claude: `git -c user.name=oakvx -c user.email=oakvx7@gmail.com commit -m "..."`. Push su `sito-nero`.
- Tono: cinico ma simpatico, nonchalant; niente battute su etichette e metadati; presentarsi come "oakvx"; nessun fatto inventato.
- Carte da 40 (briscola, scopa): **siciliane**. Carioca: fuori da questo piano finché oakvx non ne scrive le regole.

## Review Focus

1. **Telefono senza trascinamento:** ogni carta si gioca con un tocco (e con Invio da tastiera); il trascinamento è un di più. → test in Task E5.
2. **Ricarica a metà partita:** chi ricarica la pagina ritrova la partita. → `salva`/`riprendi` con test di andata e ritorno in Task E2.
3. **Gettoni a zero o puntata oltre il saldo:** la puntata viene rifiutata, il saldo non va mai sotto zero. → test in Task E2.
4. **localStorage bloccato** (navigazione privata, permessi): gettoni e partite funzionano in memoria senza errori. → test in Task E2.
5. **Scopa con più prese possibili:** il giocatore sceglie; se c'è una carta di pari valore la presa singola è obbligatoria. → test in Task E7.

---

## Parte A — Difetti e uniformità

### Task A1: Controllo nel browser come strumento del repo

**Files:**
- Create: `scripts/controlla_browser.cjs`
- Modify: `README` non serve; documentare l'uso in testa al file.

**Interfaces:**
- Produces: `node scripts/controlla_browser.cjs [--screenshot DIR]` — serve il sito da `http://localhost:8765` (lo avvia lui con `python3 -m http.server` se la porta è libera), visita tutte le pagine di `ENTRY_PAGES` di `scripts/check_site.py` (IT ed EN) a 1440×900 e 390×844 (mobile con touch), imposta `sessionStorage['oakvx-ingresso']='1'` e `localStorage.motion='paused'`, scorre fino in fondo e stampa un JSON di problemi; esce con 1 se ce n'è almeno uno.

- [ ] **Step 1:** Implementare i controlli, ognuno con un codice: `js` (pageerror), `console` (errori, escluso `open-meteo`), `http` (risposte ≥400, escluso `open-meteo`), `trabocca` (elemento non fixed con `right > innerWidth+2`, esclusi `[aria-hidden=true]`, `svg`, `canvas`, `.nastro`, `.indice`), `invisibile` (`.rivela` con opacità < .5 dopo lo scorrimento), `h1` (numero di h1 ≠ 1), `salto` (titolo che scende di più di un livello), `piccolo` (testo non `.t-meta` con font-size calcolato < 13px).
- [ ] **Step 2:** Eseguirlo. Expected: esce con 1 e riporta almeno `piccolo` su `/contatti/` desktop, `invisibile` su `/fuori-orario/`, `salto` su `/metodo/`.
- [ ] **Step 3:** Commit `Controllo del sito nel browser`.

### Task A2: Correggere i difetti trovati

**Files:**
- Modify: `assets/nero/nero.css` (riga finale `.pagina--contatti .scrivimi__elenco b { … }` e nuova regola colophon), `scripts/pagine/corpi/metodo.html`, `scripts/pagine/corpi/fuori-orario.html`, `scripts/pagine/corpi/chi-sono.html`, `scripts/pagine/corpi/contatti.html`

- [ ] **Step 1:** Contatti: sostituire la regola con `font-size: clamp(1.4rem, 8.2vw, 3.2rem)` e `overflow-wrap:anywhere`; aggiungere `body:has(.pagina--contatti) .colophon__testa, body:has(.pagina--contatti) .colophon__corpo { display:none }`.
- [ ] **Step 2:** Metodo: i cinque `h3` dentro `.capitolo__testa` diventano `h2` (stessa classe visiva: aggiungere a `.capitolo__testa h2` le regole di `.capitolo__testa h3`).
- [ ] **Step 3:** Fuori orario: trovare il `.rivela` segnalato da A1 e farlo comparire (di solito è fuori da qualsiasi osservatore perché dentro un contenitore che `initRivela` non osserva: va incluso).
- [ ] **Step 4:** Link finale `a.prossimo` su Chi sono (→ `../fuori-orario/`, 04), Fuori orario (→ `../metodo/`, 05), Contatti (→ `../`, 01, testo "Ricomincia dall'ingresso"), con la stessa struttura di `scripts/pagine/corpi/servizi.html` righe 77–80.
- [ ] **Step 5:** Eseguire generatore, build e `node scripts/controlla_browser.cjs`. Expected: 0 problemi.
- [ ] **Step 6:** Commit, uno per pagina toccata.

### Task A3: Un repertorio unico di componenti

**Files:**
- Modify: tutti i corpi in `scripts/pagine/corpi/`, `assets/nero/nero.css`
- Create: `docs/componenti.md` (tabella: componente → quando si usa)

Regole decise qui:
- Numerazione sezioni: ovunque romani minuscoli tra parentesi `(i)`, `(ii)`; i casi studio passano da `(01)` a `(i)`.
- Elenchi: `moduli` = elenco di regole o caratteristiche (titolo + testo su una riga); `passi` = sequenza ordinata nel tempo; `aperte` = 3–4 fatti brevi affiancati; `capitolo` = blocchi lunghi con numero romano grande. Nessun altro tipo nuovo.
- Ogni pagina finisce con `a.prossimo`, poi il colophon.

- [ ] **Step 1:** Scrivere `docs/componenti.md` con le regole sopra e l'elenco pagina → componenti attuali.
- [ ] **Step 2:** Convertire le sezioni che usano un componente per la funzione sbagliata (es. `passi` per elenchi non temporali in Servizi "Insieme" → `moduli`; Contatti "Bastano tre righe" resta `passi`).
- [ ] **Step 3:** Aggiungere a `controlla_browser.cjs` il controllo `numerazione`: ogni `.sezione-testa .t-meta` o `.caso-capo .t-meta` inizia con `(` + romano minuscolo + `)`. Eseguire: 0 problemi.
- [ ] **Step 4:** Screenshot desktop e mobile di tutte le pagine in `--screenshot`, mostrarli a oakvx. Commit per pagina.

## Parte B — Testi

### Task B1: Rilevatore di ripetizioni

**Files:**
- Create: `scripts/controlla_testi.py`, `test/testi/test_controlla_testi.py` (unittest, nessuna dipendenza)

**Interfaces:**
- Produces: `python3 scripts/controlla_testi.py` — estrae il testo visibile italiano dai corpi `scripts/pagine/corpi/*.html` (esclusi testata e colophon), normalizza (minuscole, senza punteggiatura) e segnala ogni sequenza di 5 parole presente in 2+ pagine, più i giri vietati in `GIRI = ["quando la userei io", "non subito ma rispondo", "garanzie scadute", "errori compresi", "più o meno"]` se compaiono più di una volta nel sito. Esce con 1 se trova qualcosa.

- [ ] **Step 1:** Test: `test_ripetizione_tra_pagine` (due corpi finti con la stessa sequenza di 5 parole → segnalata) e `test_giro_vietato_due_volte`.
- [ ] **Step 2:** `python3 -m unittest discover -s test/testi -q` → FAIL. Implementare. → PASS.
- [ ] **Step 3:** Eseguirlo sul sito e salvare l'elenco in `docs/testi/ripetizioni.md`. Commit.

### Task B2: Riscrittura, con approvazione di oakvx

**Files:**
- Create: `docs/testi/prima-dopo.md`
- Modify: corpi in `scripts/pagine/corpi/`, `scripts/pagine/colophon.html`, `assets/nero/i18n-en.js`

- [ ] **Step 1:** Per ogni pagina scrivere in `docs/testi/prima-dopo.md` una tabella chiave → prima → dopo (IT ed EN). Regole: solo fatti già presenti nel sito; frasi corte e parlate; niente "Non X. Y.", niente triadi; ogni pagina ha un'idea centrale sua; qualche gancio breve e diverso sparso, mai su etichette e metadati.
- [ ] **Step 2:** Fermarsi e mandare il file a oakvx. **Non applicare nulla senza il suo ok.**
- [ ] **Step 3:** Applicare le righe approvate (testo IT nel corpo, EN nel dizionario alla stessa chiave).
- [ ] **Step 4:** `python3 scripts/controlla_testi.py` → 0 segnalazioni; build e test verdi. Commit per pagina.

## Parte C — Pistola realistica

Oggi la volata è scritta a mano (`VOLATA = (.176, .057, 0)` in `assets/nero/pistola.js`) e il proiettile va in linea retta dalla volata alla camera (`volo.position.lerpVectors`), quindi non esce sull'asse della canna.

### Task C1: Traiettoria che parte lungo la canna

**Files:**
- Modify: `assets/nero/proiettile.js` (export in `OAKVX.proiettile`)
- Test: `test/sito/proiettile.test.mjs`

**Interfaces:**
- Produces: `traiettoria(v: number, partenza: [x,y,z], asse: [x,y,z] unitario, arrivo: [x,y,z]) -> [x,y,z]` — Bézier quadratica con controllo `partenza + asse * 0.35 * |arrivo − partenza|`.

- [ ] **Step 1:** Test:
```js
test('traiettoria: parte dalla volata, arriva alla camera, esce lungo la canna', () => {
    const a = [0, 0, 0], asse = [1, 0, 0], b = [0, 0, 5];
    assert.deepEqual(p.traiettoria(0, a, asse, b), a);
    assert.deepEqual(p.traiettoria(1, a, asse, b).map(n => +n.toFixed(9)), b);
    const q = p.traiettoria(0.001, a, asse, b), l = Math.hypot(...q);
    assert.ok(q[0] / l > 0.999);   // la tangente all'uscita è l'asse della canna
});
```
- [ ] **Step 2:** `node --test test/sito/proiettile.test.mjs` → FAIL. Implementare. → PASS. Commit.

### Task C2: Volata e asse ricavati dal modello

**Files:**
- Modify: `assets/nero/proiettile.js`, `assets/nero/pistola.js:190-201`
- Test: `test/sito/proiettile.test.mjs`

**Interfaces:**
- Produces: `centroCanna(punti: Array<[x,y,z]>, tolleranza = 0.004) -> [x,y,z]` — prende i punti con `x ≥ maxX − tolleranza`, restituisce `[maxX, centroY, centroZ]` (centro del rettangolo che li contiene).

- [ ] **Step 1:** Test con un anello finto: 16 punti su una circonferenza di raggio .01 centrata in (y=.05, z=.002) a x=.2, più rumore a x<.19 → risultato `[.2, .05, .002]` entro 1e-6.
- [ ] **Step 2:** FAIL → implementare → PASS.
- [ ] **Step 3:** In `pistola.js` sostituire `VOLATA` con `centroCanna` applicato ai vertici del carrello (gli indici di `geoCarrello`); l'asse locale della canna è `(1,0,0)`, trasformato in mondo con la rotazione di `perno`. Nel ciclo di `spara` sostituire `lerpVectors` con `traiettoria(f.volo, partenza, asseMondo, arrivo)`; il proiettile resta orientato lungo l'asse finché `f.volo < .12`, poi ruota verso la camera.
- [ ] **Step 4:** Commit.

### Task C3: Sequenza fisica credibile

**Files:**
- Modify: `assets/nero/proiettile.js` (`faseVolo`, `rinculo`, `carrello`, nuovo `bossolo`)
- Test: `test/sito/proiettile.test.mjs`

Riferimento: riprese ad alta velocità di semiautomatiche (documentare in un commento le fonti consultate). Ordine reale degli eventi, che i test fissano:
1. lampo e uscita del proiettile nello stesso istante `SPARO_MS`;
2. il carrello inizia ad arretrare dopo l'uscita del proiettile;
3. il carrello arriva in fondo prima che la canna raggiunga il massimo rilevamento;
4. il bossolo esce quando il carrello supera l'80% della corsa;
5. il lampo dura al massimo 2 fotogrammi (≤ 34 ms).

**Interfaces:**
- Produces: `bossolo(ms) -> number` 0..1 (0 finché non esce); `faseVolo(ms)` mantiene le chiavi `pistola, sparo, lampo, volo, fumo, copertura`.

- [ ] **Step 1:** Test `ordine degli eventi dello sparo` con le 5 condizioni sopra, campionando ogni millisecondo tra `SPARO_MS` e `SPARO_MS + 400`.
- [ ] **Step 2:** FAIL → ritoccare tempi e curve → PASS. Commit.

### Task C4: Fotogrammi a richiesta e verifica

**Files:**
- Modify: `assets/nero/pistola.js` (estrarre il corpo di `passo` in `posa(ms)`; esportare `fotogramma(ms)` che chiama `posa(ms)` e `disegna()` una volta)
- Create: `scripts/fotogrammi_pistola.cjs`

- [ ] **Step 1:** Refactor senza cambiare il comportamento di `spara`.
- [ ] **Step 2:** Lo script apre `/servizi/` a 1440×900 e 390×844 (swiftshader), carica la pistola con `OAKVX.proiettile.caricaPistola()`, rende `fotogramma(ms)` per ms ∈ {280, 300, 305, 315, 340, 400, 700, 1100, 1350} e salva PNG.
- [ ] **Step 3:** Controllare i fotogrammi: proiettile visibile davanti alla volata a 305 ms sull'asse della canna; vampa solo a 300–315; bossolo a destra dopo 315. Mandarli a oakvx. Commit.

## Parte D — Tecnologie a quadratini gelatinosi

### Task D1: Fisica della gelatina

**Files:**
- Create: `assets/nero/gelatina.js` (script classico, `OAKVX.gelatina`)
- Test: `test/sito/gelatina.test.mjs`

**Interfaces:**
- Produces: `passo(stato: {x,y,vx,vy}, bersaglio: {x,y}, dt: number, k = 180, c = 12) -> {x,y,vx,vy}` (molla smorzata, integrazione semi-implicita); `forma(stato) -> {sx, sy, rot}` con `sx = 1 + clamp(|v|/4000, 0, .18)` lungo la direzione del moto, `sy = 1/sx`, `rot` in gradi dalla direzione.

- [ ] **Step 1:** Test: dopo 2 s di passi da 1/60 verso (10,0) partendo da (0,0) → `|x − 10| < 0.01` e `|vx| < 0.05`; con `k=180, c=12` la x supera 10 almeno una volta (rimbalzo); `forma` di uno stato fermo → `{sx:1, sy:1}`.
- [ ] **Step 2:** FAIL → implementare → PASS. Commit.

### Task D2: Icone, markup e interazione

**Files:**
- Create: `assets/icons/tech/<slug>.svg`, `scripts/pagine/tecnologie.html`
- Modify: `scripts/genera_pagine.py` (segnaposto `%TECNOLOGIE%`), `scripts/pagine/corpi/chi-sono.html` (la sezione "Con cosa lavoro" usa `%TECNOLOGIE%`), `scripts/pagine/corpi/stile.html` (nuova sezione), `assets/nero/nero.js` (`initGelatina`), `assets/nero/nero.css`, `assets/CREDITS.html`, `scripts/genera_pagine.py` (aggiungere `nero/gelatina.js` agli script di tutte le pagine)

Tecnologie e slug Simple Icons (CC0, presi con `npm pack simple-icons` nello scratchpad): html5, css, javascript, typescript, react, python, fastapi, nodedotjs, php, c, postgresql, mysql, sqlite, docker, tauri, threedotjs, git, githubactions, playwright. Uno slug che non esiste nel pacchetto → monogramma di testo nello squircle.

- [ ] **Step 1:** Ogni voce è `<li><span class="gelatina" tabindex="0" role="img" aria-label="Nome: a cosa serve" style="--bg:…;--fg:…;--rot:…deg;--dy:…px">` con l'SVG inline e un tooltip `aria-hidden`. Squircle con `border-radius: 28%` e `clip-path` superellisse; rotazioni tra −8° e 8°, sfasamenti tra −4 e 4 px.
- [ ] **Step 2:** `initGelatina`: col puntatore sopra, lo squircle segue il cursore con `OAKVX.gelatina.passo` (bersaglio = 35% dello scarto dal centro, massimo 18 px) e si deforma con `forma`; all'uscita torna a casa rimbalzando. Touch: un tocco dà un impulso e mostra il nome per 1,5 s. Focus da tastiera: mostra il tooltip. Con `.calm` o `.paused`: niente movimento, solo il tooltip.
- [ ] **Step 3:** Testi dei tooltip con `data-i18n` ed EN; crediti Simple Icons in `assets/CREDITS.html`.
- [ ] **Step 4:** Generatore, build, check, `controlla_browser.cjs` verdi; screenshot su Chi sono e Stile. Commit per pezzo.

## Parte E — Magazzino (fase 1: contro il computer)

Struttura dei file:

```
assets/magazzino/
  carte.js        mazzi, generatore a seme, mischiata            OAKVX.carte
  deposito.js     gettoni e salvataggi su localStorage           OAKVX.deposito
  blackjack.js    regole + banco                                 OAKVX.blackjack
  briscola.js     regole + avversario                            OAKVX.briscola
  scopa.js        regole + avversario                            OAKVX.scopa
  scala40.js      regole + avversario                            OAKVX.scala40
  disegno.js      SVG delle carte siciliane e francesi          OAKVX.disegno
  tavolo.js       interfaccia comune (mano, tavolo, tocco, tastiera, annunci)
  magazzino.css
magazzino/index.html, magazzino/<gioco>/index.html  (generate)
scripts/pagine/corpi/magazzino*.html
test/sito/magazzino-*.test.mjs
```

Carta: `{ id: string, seme: 'denari'|'coppe'|'spade'|'bastoni'|'cuori'|'quadri'|'fiori'|'picche'|'jolly', valore: number }`. Siciliane: valori 1–10 (8 fante, 9 cavallo, 10 re). Francesi: 1–13, jolly con `valore: 0`.

### Task E1: Mazzi e generatore a seme

**Files:** Create `assets/magazzino/carte.js`; Test `test/sito/magazzino-carte.test.mjs`

**Interfaces:**
- Produces: `generatore(seme: number) -> () => number` (mulberry32, valori in [0,1)); `mischia(carte, rnd) -> nuovo array` (Fisher–Yates); `mazzoSiciliano() -> Carta[40]`; `mazzoFrancese({ mazzi = 1, jolly = 0 }) -> Carta[]`.

- [ ] **Step 1:** Test: 40 carte siciliane uniche, 10 per seme; `mazzoFrancese({mazzi:2, jolly:4}).length === 108`; stesso seme → stessa mischiata, semi diversi → mischiate diverse; `mischia` non modifica l'originale.
- [ ] **Step 2:** FAIL → implementare → PASS. Commit.

### Task E2: Deposito (gettoni e partite salvate)

**Files:** Create `assets/magazzino/deposito.js`; Test `test/sito/magazzino-deposito.test.mjs`

**Interfaces:**
- Produces: `crea(storage = window.localStorage)` → `{ saldo(): number, scommetti(n): boolean, paga(n): void, ricarica(): void, salva(gioco, stato): void, riprendi(gioco): object|null, dimentica(gioco): void }`. Chiavi: `oakvx-gettoni-v1`, `oakvx-partita-<gioco>-v1`. `SALDO_INIZIALE = 1000`. `ricarica()` funziona solo con saldo 0 e riporta a 1000.

- [ ] **Step 1:** Test: saldo iniziale 1000; `scommetti(1500)` → false e saldo invariato; `scommetti(0)` e numeri negativi o non interi → false; `paga` aggiunge; `ricarica` con saldo > 0 non fa nulla; `salva`/`riprendi` restituisce un oggetto uguale; con uno storage i cui metodi lanciano eccezioni, tutto funziona in memoria.
- [ ] **Step 2:** FAIL → implementare → PASS. Commit.

### Task E3: Pagina Magazzino e tasto in testata

**Files:**
- Create: `scripts/pagine/corpi/magazzino.html`, `assets/magazzino/magazzino.css`
- Modify: `scripts/pagine/testata.html` (tasto `<a class="testata__magazzino" href="%R%magazzino/">Magazzino</a>` prima di `.lingue`), `scripts/genera_pagine.py` (`PAGES`: `('magazzino/index.html','magazzino','../','/magazzino/','M','nav.warehouse','Magazzino',False,'magazzino/deposito.js')`; `SEO_NUOVE`; il campo `extra` accetta più percorsi separati da spazio), `scripts/build_static.py` (`PAGE_FILES`, `SITEMAP_FILES`), `scripts/check_site.py` (`ENTRY_PAGES`), `assets/nero/i18n-en.js`

- [ ] **Step 1:** Generatore: `extra.split()` → uno `<script>` per percorso, `<link rel="stylesheet">` per i `.css`.
- [ ] **Step 2:** Corpo: apertura "Magazzino", saldo gettoni (`data-gettoni`), scaffali A (carte: Blackjack, Briscola, Scopa, Scala 40), B (presto: roulette, Texas hold'em, solitario, sudoku, campo minato, dama, forza 4 — casse chiuse con "in arrivo"), C (già qui: il gioco 3D `/gioco/`, il terminale di Chi sono). Ogni cassa: codice scaffale (A-01…), nome a stencil, una riga, link "gioca". Aspetto deposito dentro la palette del sito.
- [ ] **Step 3:** Testi IT/EN, SEO, build e controlli verdi, screenshot. Commit.

### Task E4: Carte in SVG

**Files:** Create `assets/magazzino/disegno.js`; Test `test/sito/magazzino-disegno.test.mjs`

**Interfaces:**
- Produces: `carta(c: Carta) -> string` (SVG 200×300 con `<title>` "Asso di denari", "Re di cuori", ecc.); `dorso(tipo: 'siciliane'|'francesi') -> string`; `nome(c, lingua: 'it'|'en') -> string`.

- [ ] **Step 1:** Test: ogni carta dei due mazzi produce un SVG valido (inizia con `<svg`, contiene `<title>`); `nome({seme:'spade',valore:9},'it') === 'Cavallo di spade'`; `nome({seme:'cuori',valore:12},'en') === 'Queen of hearts'`.
- [ ] **Step 2:** FAIL → implementare. Siciliane disegnate da zero: denari a sole, coppe, spade ricurve a scimitarra, bastoni nodosi; figure stilizzate, nero/osso/cremisi. Niente scansioni di editori. → PASS.
- [ ] **Step 3:** Pagina di prova `magazzino/carte/` non in sitemap con tutte le carte; screenshot a oakvx. Commit.

### Task E5: Tavolo comune

**Files:** Create `assets/magazzino/tavolo.js`; Test `test/sito/magazzino-tavolo.test.mjs`

Ogni pagina di gioco ha sotto il tavolo una sezione breve "Come si gioca" (IT/EN) con le regole fissate nel suo task.

**Interfaces:**
- Produces: `OAKVX.tavolo.monta(radice: Element, { onGioca(indice), onAzione(nome) })` → `{ mostra(vista), annuncia(testo) }`. `vista = { mano: Carta[], avversari: [{nome, carte: number}], tavolo: Carta[], azioni: [{nome, etichetta, attiva}], messaggio }`. Le carte della mano sono `<button>` (Invio/Spazio = gioca, frecce = sposta il focus); trascinamento sul tavolo opzionale; `annuncia` scrive in una regione `aria-live="polite"`.

- [ ] **Step 1:** Test con il DOM finto di `carica.mjs` (estendere con `createElement`, `addEventListener`, `dispatchEvent` se mancano): `mostra` crea un bottone per carta; un `click` sul secondo chiama `onGioca(1)`.
- [ ] **Step 2:** FAIL → implementare → PASS. Animazioni di distribuzione e presa con classi CSS, spente con `.calm`/`.paused`. Commit.

### Task E6: Blackjack

**Files:** Create `assets/magazzino/blackjack.js`, `scripts/pagine/corpi/magazzino-blackjack.html`; registrare `/magazzino/blackjack/`; Test `test/sito/magazzino-blackjack.test.mjs`

Regole fissate: 6 mazzi francesi senza jolly, rimescolati sotto il 25%; il banco sta su 17 (anche morbido); blackjack paga 3:2; raddoppio sulle prime due carte; una divisione (niente ridivisione); niente assicurazione.

**Interfaces:**
- Produces: `punteggio(mano) -> { totale, morbido, blackjack }`; `nuova(seme, puntata) -> Stato`; `azione(stato, 'carta'|'stai'|'raddoppia'|'dividi') -> Stato`; `banco(stato) -> Stato`; `esito(stato) -> { vincita: number }` (puntata restituita compresa).

- [ ] **Step 1:** Test: `punteggio([A,K])` → 21 blackjack; `[A,A,9]` → 21 morbido; `[K,Q,5]` → 25; il banco con 16 pesca, con A+6 sta; blackjack del giocatore con puntata 100 → vincita 250; pareggio → 100; raddoppio non permesso dopo la terza carta.
- [ ] **Step 2:** FAIL → implementare → PASS.
- [ ] **Step 3:** Pagina col tavolo comune, gettoni dal deposito, partita salvata a ogni mossa. Commit.

### Task E7: Briscola e scopa

**Files:** Create `assets/magazzino/briscola.js`, `assets/magazzino/scopa.js`, corpi `magazzino-briscola.html`, `magazzino-scopa.html`; registrare `/magazzino/briscola/`, `/magazzino/scopa/`; Test `test/sito/magazzino-briscola.test.mjs`, `test/sito/magazzino-scopa.test.mjs`

Briscola: carte siciliane, 1 contro 1 (il 2 contro 2 arriva dopo questo piano), 3 carte in mano, briscola scoperta sotto il mazzo. Ordine di presa A,3,10,9,8,7,6,5,4,2; punti A=11, 3=10, re=4, cavallo=3, fante=2; vince chi supera 60 su 120.
Scopa: carte siciliane, 1 contro 1, 3 carte a testa, 4 in tavola; se c'è una carta di pari valore la presa singola è obbligatoria; l'ultimo che prende si porta il resto (non vale scopa); punti: carte (>20), denari (>5), settebello, primiera (7=21, 6=18, A=16, 5=15, 4=14, 3=13, 2=12, figure=10), una per scopa; partita a 11.

**Interfaces:**
- Briscola produce: `nuova(seme) -> Stato`, `gioca(stato, indice) -> Stato`, `presa(cartaA, cartaB, semeBriscola) -> 0|1` (indice di chi prende, A ha giocato per prima), `punti(carte) -> number`, `mossaComputer(stato, livello: 'normale'|'difficile') -> indice`.
- Scopa produce: `nuova(seme) -> Stato`, `prese(tavolo, carta) -> Carta[][]`, `gioca(stato, indice, presaScelta?) -> Stato`, `conteggio(stato) -> { carte, denari, settebello, primiera, scope, totale }` per giocatore, `mossaComputer(stato, livello) -> { indice, presa }`.

- [ ] **Step 1:** Test briscola: un 3 batte un re dello stesso seme; una briscola qualunque batte un asso non di briscola; seme diverso senza briscola → prende chi ha giocato prima; il mazzo intero vale 120 punti; il computer "difficile" non gioca un carico (A o 3) quando può prendere con una carta liscia.
- [ ] **Step 2:** Test scopa: con 7 in tavola e tavolo [7, 3, 4] giocando un 7 l'unica presa è [7]; tavolo [2,5,3] giocando un 5 → prese [[5]]; tavolo [2,3,4] giocando un 5 → [[2,3]] (non [5]); presa che svuota il tavolo = scopa, tranne all'ultima mano; primiera calcolata sulle carte migliori per seme; il computer con un settebello in tavola prendibile lo prende.
- [ ] **Step 3:** FAIL → implementare → PASS.
- [ ] **Step 4:** Pagine con il tavolo comune; per la scopa, se `prese` restituisce più opzioni, si scelgono toccando le carte sul tavolo. Commit per gioco.

### Task E8: Scala 40

**Files:** Create `assets/magazzino/scala40.js`, corpo `magazzino-scala40.html`; registrare `/magazzino/scala-40/`; Test `test/sito/magazzino-scala40.test.mjs`

Regole fissate: 2 mazzi francesi + 4 jolly (108 carte), 13 carte a testa, 2–4 giocatori (fase 1: tu + 1–3 computer). Combinazioni: tris/poker (stesso valore, semi diversi), scala (stesso seme, ≥3 consecutive, asso basso A-2-3 o alto Q-K-A, niente giro). Jolly sostituisce qualsiasi carta, al massimo uno per combinazione. Apertura con ≥40 punti (A=11 in tris o scala alta, A=1 in A-2-3, figure 10, numeri il loro valore, jolly vale la carta che sostituisce). Dallo scarto si pesca solo se si è già aperto o se la carta serve per aprire subito. Si chiude scartando l'ultima carta. Penalità: carte in mano (A=11, figure 10, jolly 25); eliminato chi arriva a 101.

**Interfaces:**
- Produces: `combinazione(carte) -> { tipo: 'tris'|'poker'|'scala', punti } | null`; `apertura(gruppi: Carta[][]) -> { valida, punti }`; `nuova(seme, giocatori) -> Stato`; `pesca(stato, da: 'mazzo'|'scarto')`, `cala(stato, gruppi)`, `attacca(stato, carta, gruppo)`, `scarta(stato, indice)`; `penalita(mano) -> number`; `mossaComputer(stato) -> Mossa[]`.

- [ ] **Step 1:** Test: [5♠,5♥,5♦] tris da 15; [Q♥,K♥,A♥] scala da 31; [A♥,2♥,3♥] scala da 6; [K♥,A♥,2♥] → null; due jolly nella stessa combinazione → null; [10♠,J♠,Q♠]+[K♣,K♦,K♥] = 60 → apertura valida; 39 punti → non valida; penalità di [A, K, jolly] = 46.
- [ ] **Step 2:** FAIL → implementare (ricerca delle combinazioni per il computer: prima tutte le scale e i tris possibili, poi la scelta che massimizza i punti calati) → PASS.
- [ ] **Step 3:** Pagina col tavolo comune, carte trascinabili e selezionabili a tocchi per formare i gruppi. Commit.

### Task E9: Chiusura della fase 1

- [ ] **Step 1:** Pagina Sicurezza: aggiungere che il Magazzino salva gettoni e partite solo nel browser.
- [ ] **Step 2:** `node scripts/controlla_browser.cjs` su tutte le pagine nuove, IT ed EN, desktop e telefono → 0 problemi. Partita completa giocata a mano su ogni gioco col telefono emulato; screenshot a oakvx.
- [ ] **Step 3:** Push su `sito-nero`; aggiornare la descrizione della PR #25.

## Dopo questo piano

- **Carioca:** gioco a parte; si pianifica quando oakvx ne scrive regole e mazzo.
- **Fase 2, con gli amici:** un modulo di collegamento unico con codice partita, a partire dalla briscola; la tecnologia si sceglie all'inizio della fase 2 e va dichiarata in Sicurezza.
- Giochi dello scaffale B (roulette, Texas hold'em, solitario, sudoku, campo minato, dama, forza 4): un piano breve ciascuno, riusando `carte.js`, `deposito.js` e `tavolo.js`.
