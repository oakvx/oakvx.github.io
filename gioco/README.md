# Il gioco (v3): "Turno di notte"

Servito in `/gioco/`. Ci si arriva dal menu d'ingresso del sito ("Gioco") o da `/gioco/` (menu Sito/Gioco).
Il curatore fa il turno di notte nell'edificio di oakvx: un impianto in cemento, intonaco e mattoni che "è" il suo
profilo GitHub. Il giro dura 10–15 minuti e passa da tutte le stanze: chi gioca una volta vede tutti i progetti.
Le stanze sono unite da porte vere: la stanza dopo si vede già dalla soglia, senza dissolvenze.

Progetto e piano: `docs/superpowers/specs/2026-11-26-gioco-v3-design.md`, `docs/superpowers/plans/2026-11-26-gioco-v3.md`;
resa realistica e cisterna infinita: `docs/superpowers/specs/2026-11-26-gioco-qualita-design.md`, `docs/superpowers/plans/2026-11-26-gioco-qualita.md`.

## Il giro

| Stanza | File | Cosa si gioca |
| --- | --- | --- |
| Ingresso | `stanze/ingresso.js` | si prendono le due finestre al bancone; la prima prova passa oltre un vetro |
| Percorso | `stanze/percorso.js` | due tratti impilati e cuciti da un passaggio: 12 m di ingombro, il doppio da camminare; la prima e l'ultima tappa |
| Smistamento (Backend & App Logic) | `stanze/smistamento.js` | cinque porte con hash di commit, cinque lampade; l'uscita si apre a lampade accese |
| YAG | `stanze/yag.js` | cubo-chiave, varco di autenticazione con limiti operativi, piedistalli che scelgono il backend |
| Piko | `stanze/piko.js` | un agente-fantasma propone un piano: approva o rifiuta; uno finisce nel pozzo |
| Brat Animator | `stanze/brat.js` | desktop gigante, parole del testo come ponte a tempo di musica, leva-timeline |
| synk | `stanze/synk.js` | pavimento-calendario: tre prenotazioni senza sovrapposizioni, saga di compensazione |
| Beautify | `stanze/beautify.js` | tre saloni separati dietro le vetrine; l'appuntamento va nel salone libero |
| Transito A · Erasmus a Siviglia | `stanze/piscina.js` | l'acqua trascina all'indietro: si passa con le finestre; in fondo la tappa 2025 |
| middleManPS4 | `stanze/middleman.js` | al buio; la lampada delle prove (F) rivela etichette e pannelli |
| Transito B · Format | `stanze/cisterna.js` | cisterna infinita: celle che si ripetono senza fine; si segue il ronzio fino allo squarcio di realtà, a mezz'aria, e ci si sale con le finestre; la tappa 2026 |
| Galleria (Design & Web) | `stanze/galleria.js` | quattro vetrine; lo schermo del portfolio ti inquadra dall'alto; leva del tema |
| Scrivania (Cosa so fare) | `stanze/scrivania.js` | terminale `portfolio.sh` in cui si scrive davvero; `apri` apre la porta |
| Commit | `stanze/commit.js` | parete di quadrati che compone il numero dei commit, dal vivo |
| Transito C · freelance | `stanze/supermercato.js` | corsie che si ripetono: si esce con una finestra sul pannello alto; la tappa 2023 → 2026 |
| Stanza di oakvx (Fuori orario) | `stanze/oakvx.js` | la mansarda sotto la pioggia, in "modalità 2008"; la TV suona i suoi brani |
| Contatti | `stanze/contatti.js` | l'ultima stanza; la schermata finale con tempo e segreti |

Segreti (3): la porta del percorso che compare guardando indietro, i tre Mii negli spazi liminali, un comando nascosto nel terminale.
Se resti fermo su un enigma, a 45 s il curatore dà un indizio e a 90 s la soluzione compare nella stanza.

## Comandi

WASD o frecce, Spazio per saltare, mouse per guardare, E per prendere e interagire, clic sinistro/destro per le
due finestre, F per la lampada delle prove (in middleManPS4), Esc per la pausa. Nella pausa: "Torna al punto di ripresa".

## Struttura

| File | Ruolo |
| --- | --- |
| `js/menu.js` | menu Sito/Gioco, lingua, audio, import differito del gioco |
| `js/gioco.js` | renderer, post-processing (anche la "modalità 2008"), giocatore, cubi, eventi, punti di ripresa, cartigli, finale |
| `js/portali.js` | le due finestre del giocatore |
| `js/engine/passaggi.js` | passaggi fissi non euclidei (`posa(x, y, z, ry)` per le matrici) |
| `js/engine/varchi.js` | porte tra stanze lontane, coordinate delle porte dei progetti, guscio delle stanze-progetto |
| `js/engine/proiezione.js` | matematica condivisa di finestre e passaggi |
| `js/engine/liminale.js` | cartello "stanza N di 2.500" e Mii che gira l'angolo |
| `js/engine/mondo.js`, `materiali.js`, `arredi.js`, `fisica.js`, `acqua.js` | stanze, materiali PBR, arredi (anche il Mii), fisica, acqua |
| `js/engine/asset.js`, `oggetti.js`, `asset/` | caricatore degli asset con progresso e ripiego; oggetti scansionati nelle stanze |
| `js/audio.js`, `suoni/`, `js/musica.js` | effetti da campioni CC0 di Kenney (passi per materiale, urti, leve, porte; ripiego generato se un file manca) e musica liminale generativa che si distorce ai cambi di stanza |
| `js/narratore.js`, `dati/narratore.json` | il curatore: righe con ID e mappa `eventi` (evento → righe) |
| `js/logica/*.js` | logica pura, testata con `node --test`: giro e aiuti, passi, armonia, YAG, Piko, Brat, calendario, saloni, prove, terminale, commit, stanza di oakvx |
| `contenuti.json` | testi IT/EN di interfaccia e stanze (`stanze.<nome>`), cartigli, azioni |

Contratto di una stanza: `export function costruisci(m, g)` che può restituire `{ debug: { … } }`. In `g` ci sono, tra l'altro,
`puntoControllo`, `cartiglio`, `lampada`, `aiuti`, `segreto`, `fine`, `passaggi`, `musica`, `commit`, `modoTesto`, `modo2008`, `atmosfera`.

## Resa realistica

Materiali PBR con mappatura nel mondo (`engine/materiali.js`, `pbrMondo`), luce d'ambiente e riflessi da panorami HDR
(uno per area: `hdr` nella definizione della stanza), un faro d'ombra per stanza (`ombra`), tone mapping ACES nel
post-processing e oggetti scansionati (`engine/oggetti.js`). Gli asset (texture, panorami, modelli `.glb`) sono CC0 di
Poly Haven, in `asset/` con l'elenco in `asset/elenco.json`: fonti e licenze in `asset/LEGGIMI.md`; per riscaricarli
`NODE_USE_ENV_PROXY=1 node gioco/strumenti/scarica-asset.mjs`. Se un asset non arriva (30 s) il gioco va avanti con i
materiali semplici. `?leggero` (usato dai test di gioco) toglie ombre, panorami e oggetti e abbassa la risoluzione.

## La cisterna infinita

Una griglia 5 × 5 di celle da 18 m attorno al giocatore; uscito dalla cella centrale, `g.trasla(dx, dz)` lo riporta
indietro di nascosto con cubi e finestre, e una cella logica tiene il conto di dove si trova davvero
(`logica/cisterna.js`: variazioni per cella e posizione dello squarcio, deterministiche dal seme). Lo squarcio è a
5–7 celle dall'ingresso; il seme cambia a ogni partita, `?seme=n` lo fissa. Debug: `stanza('cisterna').stato()`
(`cella`, `squarcio`, `attivo`), `vaiCella(x, z)`, `risolvi()`.

## La stanza di oakvx

Si riempie da `dati/stanza-oakvx.json` e dai file in `oakvx/` (musica, poster): istruzioni in `oakvx/LEGGIMI.md`.

## Test

```bash
node --test 'gioco/test/unit/*.test.mjs'     # logica pura (gira anche nella CI del sito)
node gioco/test/browser.mjs                  # tutti gli scenari nel browser (Playwright preinstallato)
node gioco/test/browser.mjs yag brat         # solo alcuni
GIOCO_FPS=50 node gioco/test/browser.mjs giro-completo   # anche la soglia di FPS (su una macchina con GPU)
```

`?debug` espone `window.__gioco` (`leggi`, `vai`, `vaiA`, `guarda`, `mira`, `spara`, `tasto`, `interagisci`, `evento`,
`gioca`, `stanza(nome)`, `avanzaAiuti`, `salta`, …). `?avvia=gioco` salta il menu. Le foto dei test finiscono in `gioco/test/out/` (ignorata da git).

Three.js r187 è in `vendor/three/` (licenza MIT). Nessun bundler: moduli ES, controllati in CI con `node --check`.
