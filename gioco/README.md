# Il gioco (v3): "Turno di notte"

Servito in `/gioco/`. Ci si arriva dal menu d'ingresso del sito ("Gioco") o da `/gioco/` (menu Sito/Gioco).
Il curatore fa il turno di notte nell'edificio di oakvx: un impianto in cemento low poly che "è" il suo
profilo GitHub. Il giro dura 10–15 minuti e passa da tutte le stanze: chi gioca una volta vede tutti i progetti.

Progetto e piano: `docs/superpowers/specs/2026-11-26-gioco-v3-design.md`, `docs/superpowers/plans/2026-11-26-gioco-v3.md`.

## Il giro

| Stanza | File | Cosa si gioca |
| --- | --- | --- |
| Ingresso | `stanze/ingresso.js` | si prendono le due finestre al bancone; la prima prova passa oltre un vetro |
| Percorso | `stanze/percorso.js` | quattro tratti impilati e cuciti da passaggi: 12 m di ingombro, quasi 50 da camminare; le tappe del percorso |
| Smistamento (Backend & App Logic) | `stanze/smistamento.js` | cinque porte con hash di commit, cinque lampade; l'uscita si apre a lampade accese |
| YAG | `stanze/yag.js` | cubo-chiave, varco di autenticazione con limiti operativi, piedistalli che scelgono il backend |
| Piko | `stanze/piko.js` | un agente-fantasma propone un piano: approva o rifiuta; uno finisce nel pozzo |
| Brat Animator | `stanze/brat.js` | desktop gigante, parole del testo come ponte a tempo di musica, leva-timeline |
| synk | `stanze/synk.js` | pavimento-calendario: tre prenotazioni senza sovrapposizioni, saga di compensazione |
| Beautify | `stanze/beautify.js` | tre saloni separati dietro le vetrine; l'appuntamento va nel salone libero |
| Transito A | `stanze/atrio.js`, `stanze/piscina.js` | l'acqua trascina all'indietro: si passa con le finestre |
| middleManPS4 | `stanze/middleman.js` | al buio; la lampada delle prove (F) rivela etichette e pannelli |
| Transito B | `stanze/cisterna.js`, `stanze/spirale.js` | niente scaletta: alla pedana alta si arriva con le finestre |
| Galleria (Design & Web) | `stanze/galleria.js` | quattro vetrine; lo schermo del portfolio ti inquadra dall'alto; leva del tema |
| Scrivania (Cosa so fare) | `stanze/scrivania.js` | terminale `portfolio.sh` in cui si scrive davvero; `apri` apre la porta |
| Commit | `stanze/commit.js` | parete di quadrati che compone il numero dei commit, dal vivo |
| Transito C | `stanze/supermercato.js`, `stanze/nave.js`, `stanze/ballatoio.js` | corsie che si ripetono: si esce con una finestra sul pannello alto |
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
| `js/engine/mondo.js`, `materiali.js`, `arredi.js`, `fisica.js`, `acqua.js` | stanze, tavolozza low poly, arredi (anche il Mii), fisica, acqua |
| `js/audio.js`, `js/musica.js` | effetti (passi per materiale, urti, leve, porte) e musica liminale generativa che si distorce ai cambi di stanza |
| `js/narratore.js`, `dati/narratore.json` | il curatore: righe con ID e mappa `eventi` (evento → righe) |
| `js/logica/*.js` | logica pura, testata con `node --test`: giro e aiuti, passi, armonia, YAG, Piko, Brat, calendario, saloni, prove, terminale, commit, stanza di oakvx |
| `contenuti.json` | testi IT/EN di interfaccia e stanze (`stanze.<nome>`), cartigli, azioni |

Contratto di una stanza: `export function costruisci(m, g)` che può restituire `{ debug: { … } }`. In `g` ci sono, tra l'altro,
`puntoControllo`, `cartiglio`, `lampada`, `aiuti`, `segreto`, `fine`, `passaggi`, `musica`, `commit`, `modoTesto`, `modo2008`, `atmosfera`.

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
