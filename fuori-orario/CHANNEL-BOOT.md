# AFTER HOURS — channel launch

## Ambito: il menu non è stato rifatto

Intervento limitato alla precedente `playIntro()` in `assets/after-hours/ah-ui.js`,
al suo instradamento iniziale degli input e al caricamento di due nuovi file:

- `ah-boot.js`: animazione procedurale Canvas 2D, indipendente dall'interfaccia.
- `ah-boot.css`: stile del solo overlay di avvio e del pulsante Salta.

`after-hours.css` e `ah-water.js` sono identici, byte per byte, ai file presenti
prima di questo intervento. Non sono stati modificati layout, icone, puntatore,
font, bolle, dettaglio applicazione, opzioni o animazioni di selezione.
`renderBrowser()` continua a essere l'unico renderer del menu.

## Analisi dei riferimenti in movimento

Sono stati cercati e scaricati riferimenti video, poi esaminati in sequenza:

- Registrazione Wii del banner: https://www.youtube.com/watch?v=HvL9TzMil_w
  Mostra onde a livelli sovrapposti, bande superficiali che scorrono con fasi
  differenti e bolle chiare, non lo sfondo scuro della lista applicazioni.
- Registrazione animata dell'intero ingresso, nella variante capovolta:
  https://github.com/quatric/hbc-upside-down/blob/main/preview/banner_intro.gif
  È stata usata come verifica temporale secondaria, tenendo esplicitamente conto
  del ribaltamento: non come riferimento per la direzione finale dell'acqua.
- Fonte primaria per direzione, composizione e tempi dell'originale:
  https://github.com/fail0verflow/hbc/blob/master/channel/banner/banner/mkbanner.py
  Layout 810×456, piano dell'acqua da −320 a 0 fra i frame 0 e 160; periodi
  differenti per wavea/waveb e linee di superficie; titolo e flash al frame 244,
  flash concluso al frame 256; sequenza iniziale conclusa al frame 360 (60 fps).

Alcuni risultati video intitolati «Channel Intro» o «Banner» erano copertine
musicali statiche o mostravano soltanto il loop già avviato: non sono stati
usati per dedurre la salita iniziale. Nessun video, audio o texture del
riferimento è incluso nel sito o nel pacchetto di aggiornamento.

L'avvio del banner precede l'interfaccia applicazioni: non è il semplice
wordmark sovrapposto allo sfondo del browser. La versione web collega queste
due parti automaticamente, senza introdurre una seconda schermata Wii Menu.

## Sequenza implementata

| Tempo nominale | Stato visivo |
|---|---|
| 0–0,4 s | Ingresso nel banner: spazio chiaro originale e acqua blu in basso; nessuna app visibile |
| 0,4–2,67 s | Salita progressiva dell'acqua su più livelli; creste, bande e bolle con moti indipendenti |
| 2,67–4,07 s | Acqua assestata nella zona superiore; onde e bolle continuano, titolo ancora assente |
| 4,07–4,27 s | Breve flash singolo e apparizione di AFTER HOURS all'interno dell'acqua |
| 4,27–6 s | Titolo presente; onde, fasce e bolle continuano la sequenza |
| 6–6,72 s | Il renderer esistente costruisce il menu sotto l'overlay; dissolvenza dell'intera composizione |
| dopo 6,72 s | Overlay rimosso, nessun ciclo o replay; solo interfaccia originale |

Le onde non sono immagini spostate né transizioni CSS: contorni, riempimenti,
ribbon superficiali, clipping del titolo e bolle sono ridisegnati in Canvas
con `requestAnimationFrame`. La salita usa interpolazione morbida; i livelli
hanno frequenze, ampiezze e direzioni diverse. Il titolo rimane nella
composizione acquatica e non vola nell'angolo come nell'intro precedente.

Le forme sono ricostruzioni procedurali, non una copia delle texture del
banner. Il nuovo nome è disposto su due righe AFTER / HOURS, mantenendo una
gerarchia regolare/grassetto e la posizione centrale del titolo originale.

## Stati e lifecycle

`AH.App.state.channelState` espone due stati:

1. `CHANNEL_BOOT`: il menu non è montato; `#ui` è inert; il nuovo renderer
   possiede il solo overlay. Gli input possono saltare l'intro, ma non aprire
   un'app per errore con lo stesso gesto.
2. `HOMEBREW_INTERFACE`: al completamento, `renderBrowser()` viene chiamato
   una sola volta. L'overlay termina la dissolvenza e viene eliminato.

Un solo ciclo rAF del boot, un solo canvas del boot, nessuna duplicazione del
menu. ResizeObserver, listener e ciclo del boot sono rimossi alla fine.
Aprire dettagli, cambiare pagina, usare HOME o le opzioni non riavvia il boot.
Il rientro da Spegni mantiene il comportamento precedente di riaccensione breve.

## Controlli, accessibilità e prestazioni

- Pulsante nativo «Salta introduzione» utilizzabile con mouse, touch e Tab.
- Tastiera per saltare; le combinazioni del browser Ctrl/Command/Alt restano libere.
- Nessun audio automatico, nessuna richiesta di permessi, nessun video runtime.
- Con `prefers-reduced-motion: reduce`: acqua e titolo fermi nella composizione
  finale, nessuna salita né flash; passaggio breve al menu (circa 0,73 s).
- Il passaggio a movimento ridotto durante l'animazione la conclude rapidamente.
- Canvas adattivo a desktop, 4:3, telefono e rotazione; DPR massimo 2.
- Il tempo dell'animazione si arresta quando la pagina è nascosta.
- Misura nel sandbox Chromium 1280×720: intervallo mediano frame 16,7 ms,
  95° percentile 33,4 ms. Non è un benchmark su hardware fisico mobile.

## Verifica eseguita

- Registrata l'intera sequenza reale su desktop e smartphone, inclusa la
  transizione e il menu finale; catturati anche i diversi stadi.
- Nessuna app presente nel DOM prima del completamento dei sei secondi.
- Screenshot del menu prima/dopo con stesso seed, stesso istante dell'acqua
  e movimento congelato: **0 pixel differenti**; uguali struttura degli elementi,
  geometrie e stili computati. Le vecchie proprietà inline transitorie dell'intro
  sono escluse dal confronto strutturale: il nuovo ingresso non le applica.
- SHA-256 invariati per foglio stile del menu e motore dell'acqua del menu.
- Test su 1280×720, 1024×768, 390×844 touch e 844×390 touch.
- Otto selezioni/dettagli/ritorni per viewport, HOME e opzioni: nessun replay
  dell'intro, nessun errore JavaScript.
- Testati salto da tastiera/touch, reduced-motion iniziale e cambiato a runtime,
  resize durante il boot e assenza di elementi audio/video.

Risultati leggibili: `tests/channel-boot/results.json`, `capture-report.json`
e `performance.json`. Il test funzionale generale attende ora la fine del nuovo
boot invece di assumere la durata della vecchia intro.

## Distribuzione

I nuovi file sono vanilla HTML/CSS/JS, utilizzabili direttamente su GitHub Pages.
Il nuovo renderer e il suo stile sono GPL-2.0-only, come il codice dell'interfaccia;
vedere `assets/after-hours/COPYING` e `NOTICE.md`.

Le modifiche sono nel workspace e nell'anteprima: nessun push o deploy remoto
è stato effettuato.
