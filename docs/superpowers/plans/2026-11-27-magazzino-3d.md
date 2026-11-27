# Magazzino 3D — piano di esecuzione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** `/magazzino/` diventa un magazzino in 3D: ingresso al buio con cordino della luce, corsia di scaffali, casse tutte uguali con emblema e stencil, polistirolo quando si aprono, magazziniere di cartoncino.

**Architecture:** Funzioni pure in `assets/magazzino/corsia.js` (`OAKVX.corsia`: elenco casse, posti, scorrimento, polistirolo, accensione dei neon). Scena in `assets/magazzino/magazzino3d.js` (modulo ES), che riusa il pupazzo di `blackjack3d.js` (ora esportato e parametrizzato). Controllore in `assets/magazzino/magazzino.js` (script classico): barra HTML, tastiera, link, ripiego senza WebGL.

**Tech Stack:** three.js + `GLTFLoader` (import map `three`), `gltf-transform` per gli asset, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-27-magazzino-3d-design.md`

## Global Constraints
- Asset sotto i 3 MB in totale, texture WebP 1k; crediti in `assets/CREDITS.html`.
- Telefono: `setPixelRatio ≤ 1.5`, ombre 1024, polistirolo ≤ 200 pallini.
- Senza WebGL o con movimento ridotto: elenco HTML, luci accese, niente sbuffo.
- Commit `oakvx <oakvx7@gmail.com>`, niente firme.

## Review Focus
1. Selezione da tastiera e da barra HTML senza mouse. → Task 2/4.
2. Tocco su telefono: un tocco seleziona e apre, «Gioca» porta al gioco. → Task 4.
3. Casse «in arrivo» non navigabili ma visibili. → Task 1.
4. Ridimensionamento e rotazione del telefono. → Task 3.
5. Seconda visita nella stessa sessione: luci già accese. → Task 4.

### Task 1: Funzioni pure (`corsia.js`)
**Produces (`OAKVX.corsia`):**
- `CASSE`: 13 voci `{ id, codice, nome, emblema, aperta, href, livello }`; aperte: blackjack, briscola, scopa, scala-40, gioco-3d, terminale (livello 0); chiuse: roulette, texas, solitario, sudoku, campo-minato, dama, forza-4 (livello 1).
- `postoCassa(i) -> {x, y}`: stesso passo per tutti, livello 0 a y=0, livello 1 più in alto; nessuna sovrapposizione.
- `limitiCamera(larghezzaVista) -> {min, max}`; `cassaVicina(x) -> indice` tra le aperte.
- `riempimento(seme) -> [{pos, giro}]` pallini fermi dentro la cassa (≤ 160); `puffo(t, seme) -> [{pos, giro}]` pochi pallini (≤ 60) che si alzano piano e ricadono, deterministici col seme.
- `poseAnnoiato(ms) -> pose` (come `OAKVX.regia.posa`: gomito sul bancone, faccia sulla mano, respiro lento) e `occhiAnnoiato(ms) -> 'mezzi'|'chiusi'` (mezzi quasi sempre, chiusi per un battito lento ogni 3–6 s).
- `accensione(t) -> number[]` luminosità 0..1 di 4 neon che si accendono a scatti, tutti a 1 dopo 1,4 s.
- [ ] Test (falliscono) → implementazione → verde → commit.

### Task 2: Asset
**Files:** Create `scripts/prepara_modelli_magazzino.sh`, `assets/magazzino/modelli/*.glb`; Modify `assets/CREDITS.html` (+ chiavi EN).
- Scarica da Poly Haven: `steel_frame_shelves_01`, `hanging_industrial_lamp`, `hand_truck`, `cardboard_box_01`; converti (quantize, WebP 1k, dedup, prune).
- [ ] Peso totale < 3 MB, crediti con autore e licenza → commit.

### Task 3: Scena
**Files:** Modify `assets/magazzino/blackjack3d.js` (esporta `creaMazziere(opz)`, `tela`, `grana`, `pezzo`, `fermacampione`); Create `assets/magazzino/magazzino3d.js` (`creaMagazzino(contenitore, opzioni) -> Promise<Scena>`).
- Cassa unica (assi, listelli, angolari, stencil, nastro per le chiuse), 13 emblemi, coperchio che si solleva piano, polistirolo dentro, oggetto appoggiato nel polistirolo.
- Il mazziere diventa parametrizzabile (colori, berretto, targhetta, occhi `mezzi`) per fare il magazziniere.
- Scaffali/lampada/carrello/cartone dai GLB; neon e cordino; bancone con registro e magazziniere.
- Interfaccia: `seleziona(i)`, `apri(i)`, `parla(testo)`, `accendi()`, `su(cb)` per eventi.
- [ ] Screenshot desktop e telefono: buio, luce accesa, cassa aperta → commit.

### Task 4: Controllore e pagina
**Files:** Create `assets/magazzino/magazzino.js`; Modify `scripts/pagine/corpi/magazzino.html`, `assets/magazzino/magazzino.css`, `scripts/genera_pagine.py`, `assets/nero/i18n-en.js`.
- Barra HTML (precedente/successivo/Gioca), tastiera (frecce, Invio), clic sulla cassa selezionata → `OAKVX.proiettile.spara(href)`.
- Elenco HTML delle casse sempre sotto la scena; ripiego completo senza WebGL.
- [ ] `controlla_browser.cjs` pulito, test verdi, prova a mano su telefono emulato → commit, push.
