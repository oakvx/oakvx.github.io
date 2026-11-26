# Il gioco (v2, beta): il curatore e le finestre

Servito in `/gioco/`. Apre un menu con due scelte: **Sito** (la versione classica, invariata) e **Gioco**. Il motore 3D si scarica solo dopo aver scelto "Gioco". Testi IT/EN con `?lang=it|en`. La versione classica non viene toccata e non passa da `scripts/build_static.py`.

## Scelte tecniche

Il piano proponeva TypeScript, Vite e Rapier. Restiamo su JavaScript a moduli ES senza bundler, con Three.js r187 in `vendor/three/` (licenza MIT, con l'addon `RoundedBoxGeometry`) e fisica a scatole scritta a mano, perché:

- il sito è già pubblicato su GitHub Pages senza build e la CI controlla i `.js` con `node --check`;
- le finestre devono aprire varchi nei muri e teletrasportare corpi: con una fisica propria la regola è una riga, con Rapier servirebbero filtri di collisione per ogni passaggio.

## Struttura

| File | Ruolo |
| --- | --- |
| `index.html`, `gioco.css` | menu, HUD, sottotitoli, pausa con impostazioni, schede, finali |
| `contenuti.json` | testi di interfaccia, oggetti, archivio, finali (IT/EN) |
| `dati/narratore.json` | battute del curatore con ID (`N-001`…); `voce` elenca gli ID che hanno un audio in `voce/<lingua>/<ID>.mp3` |
| `js/menu.js` | lingua, audio, scelta Sito/Gioco, import differito del gioco |
| `js/gioco.js` | renderer, post-processing, giocatore, cubi, interazioni, finali, salvataggio locale |
| `js/engine/` | `materiali.js` (texture procedurali, mappatura in coordinate mondo), `mondo.js` (stanze, pareti con aperture e pannelli, battiscopa, cornici, plafoniere, blocchi arrotondati, ombre di contatto, zone), `arredi.js` (didascalie, recinti con cordone, cartelli di sala, griglie), `fisica.js` (AABB, gravità per stanza) |
| `js/portali.js` | finestre a pixel: camera virtuale, piano di taglio obliquo, ricorsione limitata, teletrasporto con velocità e orientamento, reindirizzamenti |
| `js/narratore.js` | coda delle battute, sottotitoli, copione sfogliato nel panico, logica degli eventi |
| `js/audio.js` | ronzio, pad, fruscio, suoni delle finestre (Web Audio) |
| `js/stanze/` | un modulo per stanza: `sala`, `bivio`, `laboratorio`, `archivio`, `magazzino`, `fuorimappa`, `corridoio` |

Le stanze emettono eventi (`stanza:*`, `porta:*`, `gesto`, `portale:*`, `indietro`, `fermo:*`…) e solo il narratore decide cosa dire.

## Finali

| Come | Finale | Rivela |
| --- | --- | --- |
| Arrivare all'archivio oltre la balconata (servono le finestre) | Il dipendente modello | percorso e contatti |
| Prendere la scatola che brilla nel magazzino (porta destra, gravità bassa) | Il magazzino | Brat Animator |
| Aprire una finestra sul pannello dietro la colonna | Fuori mappa | Synk e reverse engineering |
| Tornare dal bivio alla sala tre volte | Il corridoio infinito | Beautify |
| Restare fermi a lungo | L'attesa | musica e Fuori orario |

I finali visti restano in `localStorage` (`gioco-finali`) e il curatore se ne accorge alla partita dopo.

## Comandi

WASD o frecce, Spazio per saltare, mouse per guardare, E per prendere e interagire, clic sinistro/destro per le due finestre (dopo la pedana del laboratorio), Esc per la pausa (campo visivo, sensibilità, sottotitoli, qualità delle finestre, riduzione delle oscillazioni).

## Prova locale

```bash
python3 -m http.server 8000   # poi apri http://localhost:8000/gioco/
```

`?debug` espone `window.__gioco` (`leggi`, `vai`, `guarda`, `spara`, `tasto`, `interagisci`, `evento`, `salta`) e `window.__corridoio` per i test automatici. `?avvia=gioco` salta il menu.
