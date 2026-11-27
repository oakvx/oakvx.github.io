# Blackjack 3D — piano di esecuzione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Il blackjack del Magazzino in una scena three.js: tavolo vero, mazziere di carta a fermacampioni che distribuisce e parla, carte e fiches animate.

**Architecture:** Le regole restano in `assets/magazzino/blackjack.js`. Un nuovo script classico `assets/magazzino/regia.js` contiene le funzioni pure (pose del mazziere, volo delle carte, posti sul tavolo, pile di fiches). Un modulo ES `assets/magazzino/blackjack3d.js` costruisce la scena e la anima leggendo le funzioni di `regia.js`. Il controllore della pagina in `blackjack.js` usa la scena 3D se c'è WebGL, altrimenti il tavolo 2D.

**Tech Stack:** three.js (import map `three`), canvas 2D per le texture, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-27-blackjack-3d-design.md`

## Global Constraints
- Nessuna dipendenza nuova; three.js da `/gioco/vendor/three/three.module.js`.
- Una carta vola in ~0,45 s; il mazziere parla al massimo 1,6 s per battuta.
- Telefono: `setPixelRatio(min(dpr, 1.5))`, ombre 1024; senza WebGL tavolo 2D.
- Movimento ridotto (`.calm`): niente voli, niente dondolio, carte al loro posto.
- Commit `oakvx <oakvx7@gmail.com>`, niente firme.

## Review Focus
1. Mano finita mentre un'animazione è in corso: i bottoni restano spenti finché la scena non ha finito. → Task 3.
2. Ricarica a metà mano: la scena si ricostruisce con le carte già al loro posto, senza voli. → Task 3.
3. Ridimensionare la finestra o ruotare il telefono: tavolo e mazziere restano inquadrati. → Task 2.
4. Divisione: le due mani del giocatore stanno affiancate e leggibili. → Task 1 (`postoCarta`).
5. Saldo alto (es. 12.000): le pile di fiches non escono dal tavolo. → Task 1 (`pileFiches`).

---

### Task 1: Regia (funzioni pure)
**Files:** Create `assets/magazzino/regia.js`; Test `test/sito/magazzino-regia.test.mjs`
**Produces (`OAKVX.regia`):**
- `posa(nome: 'riposo'|'prendi'|'lancia'|'gira'|'paga', t: 0..1) -> { spallaS, gomitoS, polsoS, spallaD, gomitoD, polsoD, collo }` angoli in radianti; `t=0` e `t=1` di ogni posa tornano a `riposo` tranne `riposo` stessa.
- `voloCarta(t, da:[x,y,z], a:[x,y,z]) -> { pos:[x,y,z], giro: 0..1, inclina }` arco con picco a metà (altezza ≥ 0,25), `giro` = quanto è girata la faccia (0 dorso, 1 faccia).
- `postoCarta(chi: 'banco'|'giocatore', mano: n, indice: i, mani: totale) -> [x,y,z]` sul panno; mani divise affiancate senza sovrapporsi.
- `pileFiches(saldo) -> [{ valore, quante, x, z }]` tagli 500/100/25/10/5/1, al massimo 20 fiches per pila, tutte dentro il tavolo.
- `bocca(ms) -> 'aperta'|'chiusa'` alternanza ogni 110 ms mentre parla.
- [ ] Test (fallisce) → implementazione → test verde → commit.

### Task 2: Scena three.js
**Files:** Create `assets/magazzino/blackjack3d.js` (modulo ES, export `creaScena(contenitore) -> Promise<Scena>`)
**Produces:** `Scena = { aggiorna(stato, { coperta, puntata, saldo, istantaneo }) -> Promise<void>, parla(testo) -> Promise<void>, distruggi() }`
- Tavolo: panno con texture canvas (stampa, cerchio), bordo imbottito, legno; luce calda e ombre.
- Mazziere di carta: pezzi su piani con texture canvas, gerarchia busto → spalla → braccio → gomito → avambraccio → polso → mano; fermacampioni d'ottone; testa con 2 bocche e occhi che sbattono; dondolio.
- Carte: piani a due facce (faccia da `OAKVX.disegno.carta` in canvas, dorso), ombra; `aggiorna` anima solo le carte nuove (dal mazzo in mano al mazziere al `postoCarta`), gira la coperta, sposta fiches.
- Fumetto HTML sopra la testa; `parla` muove la bocca con `regia.bocca`.
- Resize e telefono.
- [ ] Verifica con screenshot desktop e telefono e fotogrammi di una carta in volo → commit.

### Task 3: Controllore e pagina
**Files:** Modify `assets/magazzino/blackjack.js` (pagina), `scripts/pagine/corpi/magazzino-blackjack.html`, `assets/magazzino/magazzino.css`, `scripts/genera_pagine.py` (script modulo)
- Se c'è WebGL: contenitore 3D a tutta larghezza, bottoni HTML sotto il tavolo, fumetto; altrimenti il tavolo 2D di oggi.
- Ogni azione: regole → `scena.aggiorna` (await) → bottoni riattivati; battute del mazziere su distribuzione, banco, esito.
- Ricarica: `aggiorna(stato, { istantaneo: true })`.
- [ ] Partita intera nel browser (desktop e telefono), `controlla_browser.cjs` pulito, test verdi → commit, push.
