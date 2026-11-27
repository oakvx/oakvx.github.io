# Gioco: resa realistica, passaggi a vista, cisterna infinita — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Togliere le dissolvenze tra stanze (porte con vista sulla stanza dopo), passare tutte le stanze a una resa realistica con asset CC0 (PBR, HDR, ombre, modelli scansionati) e trasformare la cisterna in uno spazio infinito con uno squarcio di realtà come uscita.

**Architecture:** Si resta sul motore di v3 (Three.js r187 senza bundler). Le porte usano `Passaggi` e `collega()` già esistenti. Un caricatore di asset (`engine/asset.js`) porta texture PBR, panorami HDR e modelli `.glb` da `gioco/asset/`, con ripiego se mancano. La cisterna diventa una cella ripetuta 5 × 5 con ricentraggio invisibile, governata da logica pura testabile (`logica/cisterna.js`).

**Tech Stack:** JavaScript ES modules, Three.js r187 (+ addon `GLTFLoader`, `HDRLoader`/`RGBELoader` copiati da `three@0.187.0`), asset CC0 ambientCG e Poly Haven, `@gltf-transform/cli` solo in locale per ottimizzare i modelli, `node:test`, Playwright preinstallato.

**Spec:** `docs/superpowers/specs/2026-11-26-gioco-qualita-design.md`

## Global Constraints

- Niente bundler; ogni `.js` passa `node --check`; i moduli di `js/logica/` non importano Three.js.
- Solo asset **CC0** da ambientCG e Poly Haven; ogni asset elencato in `gioco/asset/elenco.json` con fonte, id e licenza.
- Texture a **1K**; peso totale di `gioco/asset/` + `gioco/suoni/` **≤ 60 MB**.
- Almeno **40 FPS** in qualità bassa su portatile con grafica integrata a 1080p (verificabile solo con GPU: `GIOCO_FPS=40`).
- Nessun cambio di stanza con dissolvenza (`#velo.on`), tranne le cadute nel vuoto e "Torna al punto di ripresa".
- Il Mii resta stilizzato; desktop di Brat, muro dei commit, monitor e TV restano grafici; modalità 2008 resta.
- Tutti gli scenari esistenti restano verdi; il runner fallisce su errori WebGL (`GL_INVALID`).
- Commit a nome `oakvx <oakvx7@gmail.com>`, senza righe di attribuzione; branch `gioco-realistico`; PR senza firma di Claude.

## Review Focus

- Nella cisterna, con le finestre aperte o un cubo in mano, il ricentraggio non deve rompere nulla: finestre, cubi e giocatore si spostano insieme. → test in Task 11.
- Rete lenta: la barra di avvio mostra il progresso vero e il gioco non resta bloccato su un asset che non arriva (timeout per asset 15 s, poi ripiego). → test in Task 3.
- Un asset che risponde 404 o è corrotto: la stanza si costruisce con il materiale semplice, solo un avviso in console. → test in Task 3.
- Qualità "bassa": niente ombre sui piccoli oggetti, mappa d'ombra 1024; "alta": 2048. → test in Task 4.
- Guardando da una porta la stanza dopo che ha a sua volta una porta (catena): al massimo 2 passaggi disegnati, il resto nebbia, nessun errore WebGL. → test in Task 1.

---

## Fase 1 — Passaggi a vista

### Task 1: Le otto dissolvenze diventano porte

**Files:**
- Modify: `gioco/js/stanze/{piscina,middleman,cisterna,galleria,scrivania,commit,supermercato,oakvx,contatti,percorso}.js`, `gioco/js/gioco.js` (debug `varchi()`)
- Test: `gioco/test/scenari/varchi-aperti.mjs`

**Interfaces:**
- Consumes: `collega(g, id, a, b, opz)`, `apertura(lungo, w, h)`, `nicchia(m, [x,y0,z,ry], w, h)` da `engine/varchi.js`; `g.passaggi.attiva(id, on)`.
- Produces: ogni stanza coinvolta espone in `debug.varchi` un array `{ id, da: string, a: string, lato: [x,y0,z,ry] }`; `__gioco.varchi()` restituisce l'unione. Coppie e coordinate (`[x, y0, z, ry]`, ry = verso l'interno della stanza):

| id | da (lato A) | a (lato B) |
| --- | --- | --- |
| `piscina-middleman` | piscina `[70, 0, 19, -π/2]` | middleman `[110, 0, 0, 0]` |
| `middleman-cisterna` | middleman nicchia `[120, 2, 16, -π/2]` | cisterna `[300, 0, 18, π/2]` (provvisorio fino al Task 11) |
| `cisterna-galleria` | cisterna pedana `[336, 3, 33, -π/2]` (provvisorio fino al Task 11) | galleria `[162.5, 0, 0, 0]` |
| `galleria-scrivania` | galleria `[162.5, 0, 20, π]` | scrivania `[206, 0, 0, 0]` |
| `scrivania-commit` | scrivania `[206, 0, 12, π]` (attivo solo dopo `apri`) | commit `[240, 0, 0, 0]` |
| `commit-supermercato` | commit `[250, 0, 7, -π/2]` | supermercato `[452, 0, 0, 0]` |
| `supermercato-oakvx` | supermercato `[477.5, 0, 32, π]` | camera `[902.5, 0, 0, 0]` |
| `oakvx-contatti` | camera `[900, 0, 8.9, π/2]` | contatti `[945, 0, 0, 0]` |

  La porta segreta del percorso arriva in camera su `[905.5, 0, 0, 0]` (in un'apertura vera, non più a mezz'aria). Tutte le `m.zona(...)` + `g.teletrasporta(...)` di queste uscite si cancellano.

- [ ] **Step 1: Scenario `varchi-aperti.mjs`**: per ogni voce di `__gioco.varchi()` (sbloccando prima la scrivania con `stanza('scrivania').risolvi()`): `vai` a 1,5 m davanti al lato A e cammina verso la porta; durante il tragitto controlla ogni 50 ms che `#velo` non abbia la classe `on`; attendi `leggi().stanza === a`; poi cammina all'indietro fino a `leggi().stanza === da`. In più, davanti a `galleria-scrivania`, verifica che non ci siano errori WebGL dopo 2 s di sguardo sulla porta (catena di passaggi).
- [ ] **Step 2:** `node gioco/test/browser.mjs varchi-aperti` → FAIL (`__gioco.varchi` non esiste).
- [ ] **Step 3:** Implementa le aperture con nicchia nelle stanze di destinazione e di partenza, i `collega` della tabella e `__gioco.varchi()`; aggiorna `transiti.mjs`, `giro-completo.mjs`, `fine.mjs`, `scrivania.mjs`, `galleria.mjs`, `commit.mjs` se camminavano verso le vecchie zone.
- [ ] **Step 4:** `node gioco/test/browser.mjs varchi-aperti transiti giro-completo fine scrivania galleria commit oakvx` → tutti OK.
- [ ] **Step 5: Commit** `git commit -m "Replace fade teleports with open doors that show the next room"`

---

## Fase 2 — Resa realistica

### Task 2: Asset CC0 scaricati, ottimizzati ed elencati

**Files:**
- Create: `gioco/strumenti/scarica-asset.mjs`, `gioco/asset/elenco.json`, `gioco/asset/LEGGIMI.md`, `gioco/asset/texture/<id>/{diff,nor,arm}.jpg`, `gioco/asset/hdr/<id>.hdr`, `gioco/asset/modelli/<id>.glb`
- Create: `gioco/vendor/three/addons/{GLTFLoader.js,HDRLoader.js oppure RGBELoader.js}` e le loro dipendenze interne, da `three@0.187.0`
- Test: `gioco/test/unit/asset.test.mjs`

**Interfaces:**
- Produces: `elenco.json` = `{ texture: { [id]: { fonte, idFonte, licenza: 'CC0', file: { diff, nor, arm } } }, hdr: { [id]: { fonte, idFonte, licenza, file } }, modelli: { [id]: { fonte, idFonte, licenza, file, altezza: number /* m */ } } }`. Insieme minimo (gli id interni sono i nomi usati dal codice):
  - texture: `cemento`, `intonaco`, `piastrelle`, `piastrelle-piscina`, `metallo`, `lamiera`, `legno-scuro`, `parquet`, `moquette`, `mattoni`, `tufo`;
  - hdr: `interno-neutro`, `interno-caldo`, `notte`;
  - modelli: quelli elencati nella spec.
- `scarica-asset.mjs` (Node, solo in locale): legge una tabella id interno → id Poly Haven / ambientCG, scarica le versioni 1K (API `api.polyhaven.com/files/<id>`, file da `dl.polyhaven.org`; ambientCG `ambientcg.com/api/v2/full_json`), converte i modelli gltf in `.glb` con `npx @gltf-transform/cli optimize --texture-size 1024`, scrive `elenco.json`. L'ARM di ambientCG si compone da AO/Roughness/Metalness con `sharp` (npm) se non c'è già.

- [ ] **Step 1: Test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const base = new URL('../../asset/', import.meta.url);
const elenco = JSON.parse(fs.readFileSync(new URL('elenco.json', base)));
const peso = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? peso(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
test('tutti CC0 e tutti i file esistono', () => {
  for (const tipo of ['texture', 'hdr', 'modelli']) for (const [id, a] of Object.entries(elenco[tipo])) {
    assert.equal(a.licenza, 'CC0', id);
    const file = tipo === 'texture' ? Object.values(a.file) : [a.file];
    for (const f of file) assert.ok(fs.existsSync(new URL(f, base)), `${id}: manca ${f}`);
  }
});
test('insieme minimo di texture e panorami', () => {
  for (const id of ['cemento', 'intonaco', 'piastrelle', 'piastrelle-piscina', 'metallo', 'lamiera', 'legno-scuro', 'parquet', 'moquette', 'mattoni', 'tufo']) assert.ok(elenco.texture[id], id);
  for (const id of ['interno-neutro', 'interno-caldo', 'notte']) assert.ok(elenco.hdr[id], id);
});
test('peso totale entro 60 MB', () => {
  const tot = peso(new URL('.', base).pathname) + peso(new URL('../suoni/', base).pathname);
  assert.ok(tot <= 60 * 1024 * 1024, (tot / 1048576).toFixed(1) + ' MB');
});
```

- [ ] **Step 2:** `node --test 'gioco/test/unit/*.test.mjs'` → FAIL (`elenco.json` mancante).
- [ ] **Step 3:** Scrivi ed esegui `scarica-asset.mjs`; copia gli addon da `node_modules/three/examples/jsm/` (versione 0.187.0) in `vendor/three/addons/` e sistema gli import relativi (`'three'` resta tramite import map); scrivi `asset/LEGGIMI.md` (fonti, licenza, come rigenerare).
- [ ] **Step 4:** test → PASS; `du -sh gioco/asset` riportato nel messaggio di commit.
- [ ] **Step 5: Commit** `git commit -m "Add CC0 PBR textures, HDR panoramas and scanned models from ambientCG and Poly Haven"`

### Task 3: Caricatore di asset con progresso e ripiego

**Files:**
- Create: `gioco/js/engine/asset.js`
- Modify: `gioco/js/gioco.js` (crea il caricatore, aspetta gli asset prima di "Clic per entrare", `g.asset`), `gioco/index.html` / `gioco.css` (barra di progresso in `#avvio`)
- Test: `gioco/test/scenari/asset-mancanti.mjs`, `gioco/test/scenari/asset-lenti.mjs`

**Interfaces:**
- Consumes: `elenco.json` (Task 2).
- Produces: `creaCaricatore({ base = 'asset/', timeout = 15000 }) -> { elenco(): Promise<object>, texture(id): Promise<{ map, normalMap, aoMap, roughnessMap, metalnessMap } | null>, hdr(id): Promise<THREE.Texture | null>, modello(id): Promise<THREE.Group | null>, progresso(): { fatti: number, totali: number }, suProgresso(fn) }` — ogni richiesta che fallisce o supera il timeout risolve `null` e scrive `console.warn('asset: ' + id)`; le texture ARM si espongono come `aoMap`, `roughnessMap`, `metalnessMap` sulla stessa texture; i modelli tornano clonati (`.clone(true)`) a ogni chiamata, con `castShadow`/`receiveShadow` impostati. `g.asset` è il caricatore.

- [ ] **Step 1: Scenario `asset-mancanti.mjs`**: `page.route('**/gioco/asset/**', r => r.fulfill({ status: 404 }))` tranne `elenco.json`; il gioco arriva a `leggi().stato === 'avvio'` con `#avvio-entra` visibile, nessun errore in console (solo `warn`).
- [ ] **Step 2: Scenario `asset-lenti.mjs`**: route che ritarda tutti i file in `asset/` di 300 ms; durante il caricamento il testo della barra di avvio cambia almeno 3 volte e arriva a `n/n`.
- [ ] **Step 3:** FAIL → **Step 4:** implementa → **Step 5:** OK (insieme a `avvio`, `foto`).
- [ ] **Step 6: Commit** `git commit -m "Add an asset loader with a real progress bar and fallbacks"`

### Task 4: Renderer, materiali PBR, luce HDR e ombre

**Files:**
- Modify: `gioco/js/engine/materiali.js`, `gioco/js/engine/mondo.js`, `gioco/js/gioco.js` (renderer, post-processing, ombre, qualità), `gioco/js/engine/arredi.js` (battiscopa, cornici, plafoniere, cartelli con modanature)
- Test: `gioco/test/scenari/resa.mjs`

**Interfaces:**
- Consumes: `g.asset.texture(id)`, `g.asset.hdr(id)` (Task 3).
- Produces:
  - `creaMateriali(renderer, asset)` → stessi nomi di oggi (`pavimento`, `muro`, `soffitto`, `cemento`, `intonaco`, `intonacoA(y0)`, `metallo`, `piastrelle`, `moquette`, `legnoScuro`, `pannello`, `proibito`, …) più `piastrellePiscina`, `lamiera`, `parquet`, `mattoni`, `tufo`, ora `MeshStandardMaterial` con mappatura in coordinate mondo per colore, normali e ARM (base tangente per asse dominante; densità `1 / metro`). Finché la texture non è arrivata il materiale ha solo colore medio, poi si aggiorna da solo.
  - Renderer: `toneMapping = THREE.ACESFilmicToneMapping` (o AgX), `outputColorSpace = SRGBColorSpace`, `shadowMap.enabled = true`, `shadowMap.type = PCFSoftShadowMap`; il post-processing non applica più la gamma e non quantizza.
  - Stanze: nuovi campi in `m.stanza({ …, hdr: 'interno-neutro'|'interno-caldo'|'notte', ombra: { tipo: 'spot'|'direzionale', pos: [x,y,z], bersaglio: [x,y,z], intensita } })`; `gioco.js` imposta `scene.environment` al panorama della stanza attuale (sfumando l'intensità) e sposta l'unica luce con ombre sulla stanza attuale.
  - Qualità: "bassa" → mappa d'ombra 1024, ombre solo su architettura e modelli marcati `grande`; "alta" → 2048, ombre su tutto.
- [ ] **Step 1: Scenario `resa.mjs`**: in ingresso, dopo il caricamento, `__gioco.resa()` restituisce `{ toneMapping: 'ACESFilmic'|'AgX', ombre: true, mappaOmbra: 1024 }` in qualità bassa e `2048` dopo aver cambiato `#imp-qual` in "alta"; `__gioco.materiali()` contiene `piastrellePiscina`, `mattoni`, `tufo`; foto di ingresso con luminanza media tra 0,15 e 0,85.
- [ ] **Step 2:** FAIL → **Step 3:** implementa → **Step 4:** OK, e restano verdi `foto`, `avvio`, `passaggi`, `ingresso`.
- [ ] **Step 5: Commit** `git commit -m "Switch to physically based materials, HDR lighting and shadows"`

### Task 5–9: Le stanze, area per area

Stesso schema per ogni task: materiali nuovi, dettagli architettonici, modelli, `hdr` e `ombra` nella definizione della stanza, foto di controllo. Ogni stanza espone `debug.stato().modelli` (numero di modelli caricati e presenti in scena).

| Task | Stanze | hdr | Modelli (Poly Haven) |
| --- | --- | --- | --- |
| 5 | ingresso, percorso, smistamento | interno-neutro | `metal_office_desk`, `power_box_01`, `industrial_wall_lamp`, `utility_box_01` |
| 6 | yag, piko, brat, synk, beautify | interno-neutro | `metal_toolbox`, `drawer_cabinet`, `modern_arm_chair_01`, `bar_chair_round_01`, `potted_plant_01`, `side_table_01` |
| 7 | piscina, middleman, supermercato | interno-neutro / notte | `planter_pot_clay`, `cardboard_box_01`, `portable_searchlight`, `utility_box_02` |
| 8 | galleria, scrivania, commit, contatti | interno-caldo | `modern_arm_chair_01`, `potted_plant_02`, `metal_office_desk`, `desk_lamp_arm_01`, `binder_notebook`, `sofa_02`, `side_table_01` |
| 9 | camera di oakvx | notte | `old_bed_frame`, `vintage_cabinet_01`, `book_encyclopedia_set_01`, `portable_cassette_player`, `boombox`, `potted_plant_04` |

**Files (per ogni task):** Modify le stanze della riga; Create `gioco/test/scenari/foto-<area>.mjs` (`area` = `ingresso`, `progetti`, `transiti`, `design`, `camera`).

- [ ] **Step 1: Scenario `foto-<area>.mjs`**: per ogni stanza della riga `vaiA`, attendi `stanza(n).stato().modelli >= k` (k = numero di modelli della riga usati in quella stanza, almeno 1), salva `gioco/test/out/<stanza>.png`, luminanza media tra 0,12 e 0,85, nessun errore WebGL.
- [ ] **Step 2:** FAIL (stato().modelli assente) → **Step 3:** rifai la stanza → **Step 4:** scenario OK e restano verdi gli scenari di gioco di quelle stanze (`yag`, `piko`, `brat`, `synk`, `beautify`, `middleman`, `galleria`, `scrivania`, `commit`, `oakvx`, `fine`, `transiti`); guarda le foto.
- [ ] **Step 5: Commit** `git commit -m "Realistic look: <area>"`

---

## Fase 3 — Cisterna infinita

### Task 10: Logica della cisterna infinita

**Files:**
- Create: `gioco/js/logica/cisterna.js`
- Test: `gioco/test/unit/cisterna.test.mjs`

**Interfaces:**
- Produces:
  - `export const LATO = 18` (metri di una cella)
  - `cellaDi(x, z, origine = [0, 0]) -> [cx, cz]` (intere, `Math.floor`)
  - `ricentra(x, z, origine = [0, 0]) -> [dx, dz]` — lo spostamento (multiplo di `LATO`) che riporta il punto nella cella centrale; `[0, 0]` se è già dentro
  - `creaSeme(n: number) -> () => number` — generatore pseudo-casuale deterministico (mulberry32)
  - `variazioni(cx, cz, seme: number) -> { lampada: 'accesa'|'spenta'|'tremola', crepa: boolean, gocce: boolean, acqua: number /* 0.3..0.7 */ }` — deterministica per (cx, cz, seme)
  - `posizioneSquarcio(seme: number) -> [cx, cz]` con distanza di Chebyshev da (0,0) tra 5 e 7
  - `verso(cx, cz, squarcio: [number, number]) -> [number, number]` — direzione unitaria dalla cella allo squarcio (per lampade e suono)

- [ ] **Step 1: Test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { LATO, cellaDi, ricentra, variazioni, posizioneSquarcio, verso } from '../../js/logica/cisterna.js';
test('celle e ricentraggio', () => {
  assert.deepEqual(cellaDi(1, 1), [0, 0]);
  assert.deepEqual(cellaDi(-0.1, LATO + 0.1), [-1, 1]);
  assert.deepEqual(ricentra(LATO + 2, 3), [-LATO, 0]);
  assert.deepEqual(ricentra(5, 5), [0, 0]);
  assert.deepEqual(ricentra(-1, -LATO - 1), [LATO, 2 * LATO]);
});
test('variazioni deterministiche', () => {
  assert.deepEqual(variazioni(3, -2, 42), variazioni(3, -2, 42));
  const tutte = new Set(Array.from({ length: 50 }, (_, i) => variazioni(i, i * 3, 7).lampada));
  assert.ok(tutte.size >= 2);
  for (let i = 0; i < 30; i++) { const a = variazioni(i, -i, 1).acqua; assert.ok(a >= 0.3 && a <= 0.7); }
});
test('squarcio tra 5 e 7 celle', () => {
  for (let s = 1; s < 60; s++) {
    const [cx, cz] = posizioneSquarcio(s);
    const d = Math.max(Math.abs(cx), Math.abs(cz));
    assert.ok(d >= 5 && d <= 7, `${s}: ${cx},${cz}`);
  }
  const [x, z] = verso(0, 0, [6, 0]);
  assert.ok(Math.abs(x - 1) < 1e-9 && Math.abs(z) < 1e-9);
});
```

- [ ] **Step 2:** FAIL → **Step 3:** implementa → **Step 4:** PASS.
- [ ] **Step 5: Commit** `git commit -m "Add the infinite cistern logic"`

### Task 11: La cisterna infinita e lo squarcio di realtà

**Files:**
- Modify: `gioco/js/stanze/cisterna.js` (riscritto), `gioco/js/stanze/middleman.js` e `galleria.js` (coordinate dei varchi), `gioco/js/portali.js` (`sposta(dx, dz)`), `gioco/js/gioco.js` (`g.trasla(dx, dz)` che sposta giocatore, cubi e finestre), `gioco/contenuti.json`, `gioco/dati/narratore.json`
- Test: `gioco/test/scenari/cisterna-infinita.mjs`

**Interfaces:**
- Consumes: `LATO`, `cellaDi`, `ricentra`, `variazioni`, `posizioneSquarcio`, `verso`, `creaSeme` (Task 10); materiali `mattoni`, `tufo`, `metallo` e modelli `modular_industrial_pipes_01`, `industrial_pipe_lamp` (Task 2–4); `collega`, `nicchia` (Task 1); `miiLiminale`, `cartelloStanza` (v3).
- Produces:
  - Cella centrale con origine `[300, 0]` (x 300..318, z 0..18), griglia visiva 5 × 5 (copie della cella condividono geometrie e materiali); `Portali.sposta(dx, dz)` trasla le due finestre piazzate; `g.trasla(dx, dz)` trasla giocatore, cubi, finestre e `zPrima`/`zPass` senza contare attraversamenti.
  - Logica: la cella logica corrente `[lcx, lcz]` si aggiorna a ogni ricentraggio; le variazioni delle copie si ricalcolano dalle loro celle logiche.
  - Squarcio: in `posizioneSquarcio(seme)` (seme casuale a ogni partita, fisso con `?debug&seme=n`). Crepa verticale glitchata (shader proprio, niente ciano/magenta) a 3 m d'altezza tra due colonne, con dietro il passaggio `cisterna-galleria` (lato A); pannelli sulle due colonne di quella cella per salire con le finestre. Il passaggio si attiva solo quando la cella logica corrente è quella dello squarcio.
  - Suono: ronzio dello squarcio (campione `computerNoise` dei pacchetti Kenney già scaricati, o generato) con volume e filtro in funzione della distanza in celle.
  - Aiuti: indizio a 45 s ("segui il ronzio"), soluzione a 90 s (scia di luce sull'acqua verso lo squarcio); Mii nella cella accanto allo squarcio; cartello "stanza N di 2.500" con N che cambia con la cella.
  - Debug: `stato() -> { cella: [lcx, lcz], squarcio: [cx, cz], attivo: boolean }`, `vaiCella(cx, cz)`, `risolvi()` (porta il giocatore davanti allo squarcio, già in alto).

- [ ] **Step 1: Scenario `cisterna-infinita.mjs`** (con `query: '&seme=7'`):
  1. da middleman si entra in cisterna (porta del Task 1);
  2. camminando 100 m verso +x la posizione x resta in [300, 318] mentre `stato().cella[0]` cresce di almeno 5;
  3. `stato().squarcio` è a distanza di Chebyshev 5–7;
  4. con una finestra piazzata su una colonna e il cubo in mano, dopo un ricentraggio la finestra è ancora attraversabile e il cubo ancora tenuto;
  5. `risolvi()` e cammina nello squarcio → `leggi().stanza === 'galleria'`;
  6. nessun errore WebGL.
- [ ] **Step 2:** FAIL → **Step 3:** implementa → **Step 4:** OK, e restano verdi `transiti`, `giro-completo`, `varchi-aperti`, `middleman`, `galleria`.
- [ ] **Step 5: Commit** `git commit -m "Make the cistern endless, with a reality tear as the way out"`

### Task 12: Chiusura

**Files:**
- Modify: `gioco/README.md`, `gioco/test/scenari/giro-completo.mjs`, `gioco/test/scenari/transiti.mjs`
- Test: suite completa

- [ ] **Step 1:** Aggiorna il giro completo (cisterna con `risolvi()`, porte al posto delle zone) e `transiti.mjs`.
- [ ] **Step 2:** README: resa realistica, asset e licenze (`asset/LEGGIMI.md`), cisterna infinita, debug `seme`, comandi invariati.
- [ ] **Step 3:** `node --test 'gioco/test/unit/*.test.mjs' && node gioco/test/browser.mjs` → tutto verde; `python3 scripts/build_static.py && python3 scripts/check_site.py` → OK; `du -sh gioco/asset gioco/suoni` ≤ 60 MB.
- [ ] **Step 4: Commit** `git commit -m "Document the realistic look and the endless cistern"` e PR su `main` (senza firma di Claude).
