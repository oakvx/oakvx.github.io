# La stanza (beta)

Prima stanza 3D del portfolio-gioco, servita in `/gioco/`. È a sé stante: non modifica la versione classica del sito e non passa da `scripts/build_static.py` (ha IT/EN interni, con `?lang=it|en`).

- `index.html`, `gioco.css`: pagina, HUD e pannelli (ingresso, pausa, scheda oggetto, fine). Il tasto "Versione classica" è sempre visibile.
- `contenuti.json`: tutti i testi IT/EN, le azioni e i link degli oggetti.
- `js/main.js`: scena Three.js, movimento, collisioni fatte a mano, post-processing (grana, vignetta, bagliore), ronzio dei neon con Web Audio.
- `vendor/three/`: Three.js r187 (licenza MIT in `LICENSE`), servito in locale tramite import map.

## La stanza

Sala d'attesa bianco clinico 8 × 8 m con neon. Oggetti: monitor con un mini lyric video (scheda Brat Animator), targa con nome e ruolo (scheda Chi sono), scatola sigillata come segnaposto per il "pezzo di Gabri".

## La regola: il corridoio elastico

La porta in fondo sembra a 5 m, ma arretra dell'88% di ogni metro che avanzi: servono circa 37 m (una cinquantina di passi). Il ritorno invece si accorcia: luci, piastrelle e targhette si ripetono ogni 4 m, quindi il giocatore viene spostato indietro di multipli di 4 m quando la stanza è fuori vista, senza che si noti. Arrivati alla porta, compare la fine della beta.

## Prova locale

```bash
python3 -m http.server 8000   # poi apri http://localhost:8000/gioco/
```

`?debug` espone `window.__stanza` (`leggi`, `guarda`, `vai`) per i test automatici.
