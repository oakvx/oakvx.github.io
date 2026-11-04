# Portfolio oakvx — avatar distribuiti nel sito

Versione completa del repository `oakvx/oakvx.github.io`, basata sul commit
`3d4877780bd6082a94db4a12df933ea7c4c4ccfb` del ramo `main`.

## Posizioni delle cinque pose

| File | Posizione principale |
| --- | --- |
| `standing.gif` | Polaroid nella sezione iniziale |
| `sitting.gif` | Polaroid della sezione “Chi sono” nella home |
| `showingoff.png` | Accanto al titolo “Progetti selezionati” |
| `dancing.gif` | Sezione “Contatti” |
| `sleeping.gif` | Piè di pagina, sotto email e orologio |

La posa `showingoff` sostituisce anche il ritratto nella pagina `chi-sono/`
e le piccole icone del volto. La finestra `gabriele.gif` nel desktop mostra
la posa che balla. Ogni sezione ha la propria posa: non esiste un selettore
che raccolga le cinque pose.

## File modificati

- `index.html`: sostituzione delle fotografie e distribuzione delle pose.
- `chi-sono/index.html`: ritratto sostituito con l’avatar e preload aggiornato.
- `assets/avatars/`: quattro GIF originali, posa PNG, primi fotogrammi WebP,
  foglio di stile e gestione della pausa.
- `assets/polaroid/site.js` e `pages-en.js`: testi alternativi e traduzioni.
- `assets/CREDITS.html`: provenienza e descrizione dei nuovi materiali.
- Metadati Person di tutte le pagine: nuova immagine dell’avatar.

Il file ricevuto come `showingoff.gif` era un PNG statico. È stato salvato come
`showingoff.png` mantenendone esattamente i byte. Anche le quattro GIF sono
conservate senza modificare i fotogrammi o la velocità originale.

Le immagini `*-still.webp` sono copie statiche del primo fotogramma. Il comando
“Ferma animazioni”, la preferenza di sistema `prefers-reduced-motion` e il
passaggio della scheda in background fermano anche le GIF. Con movimento
ridotto, il tag `picture` seleziona la versione statica anche senza JavaScript.

## Avvio locale

Non servono installazione di pacchetti o build. Dalla cartella del sito:

```bash
python3 -m http.server 8000
```

Aprire `http://localhost:8000/`. Il sito rimane compatibile con GitHub Pages.

## Applicare il contenuto dello ZIP

La cartella `oakvx.github.io/` contiene il sito completo. Copiarne il contenuto
nella propria copia del repository, aggiungendo i nuovi file e sostituendo quelli
esistenti. Se si sovrappongono i file a una vecchia copia, eliminare da `assets/`
le precedenti fotografie `gabriele-avatar.webp` e `gabriele-portrait*.webp`,
che non sono più utilizzate e non sono incluse nello ZIP.

L’archivio non contiene la cartella `.git`. Non è stato effettuato alcun push
o deploy del sito pubblico.

## Aggiornamento: restyling hero, più pose, "Fuori orario"

- Nuove pose in `assets/avatars/`: idlewainting, laughing, angrystomping, almostfalling, discofever (GIF) e showingoff, drunkwandering, flyspinning (WebP animato, GIF originali da 3 MB convertite a ~1 MB). Ogni posa ha il suo `-still.webp`.
- `assets/avatars/poses.js`: "Scatta di nuovo" cambia posa nella hero; click su polaroid "chi sono" (sitting/laughing) e sulla finestra gabriele.gif (discofever/flyspinning/dancing).
- `assets/polaroid/hero.css`: niente font marker, polaroid con arcobaleno a mezzaluna, didascalia in mono con quadratino a strisce.
- Percorso: ogni tappa ha il suo avatar in piedi sulla linea (solo da 1000px in su).
- Nuova pagina `fuori-orario/`: slider IT/EN/ES/EL (scroll-snap, tab, frecce, tastiera, `#it #en #es #el`). Aggiunta a menu, footer e sitemap.

## Aggiornamento 2: avatar compagno, Fuori orario ovunque

- `assets/avatars/companion.js` + `pages.css`: avatar fisso in basso a sinistra su tutte le pagine. Barcollante mentre scorri, balla in fondo alla pagina, si addormenta dopo 25 s di inattività e si sveglia di soprassalto. Click = posa casuale con fumetto, × lo nasconde per la sessione. Rispetta "Ferma animazioni" e reduced-motion.
- Sottopagine (chi-sono, 3 progetti, crediti): un avatar per capitolo, cliccabile per cambiare posa (da 1100px in su).
- 404: avatar che barcolla sul "404", cliccabile.
- "Fuori orario" aggiunto a header e footer di tutte le pagine.

## Aggiornamento 3: puntatore

- `assets/cursor.css`: freccia bianca con ombra a cinque bande (la stessa dei bottoni), gialla su link e pulsanti. Solo CSS, nessun JavaScript, su tutte le pagine. I campi di testo mantengono il cursore di testo.

## Struttura condivisa

Tutte le pagine (home, chi-sono, progetti, fuori-orario, 404, crediti) usano lo
stesso sistema «Polaroid»: stessa testata, stesso menu mobile, stesso piè di
pagina e gli stessi token di colore.

- `assets/polaroid/site.css` e `site.js`: base comune a tutte le pagine. Le
  funzioni della home (hero, percorso, progetti, scrivania) si attivano solo se
  trovano il loro markup.
- `assets/polaroid/pages.css`: componenti delle pagine interne.
- `assets/polaroid/fuori-orario.css` e `fuori-orario.js`: parti proprie di
  Fuori orario.
- `assets/polaroid/pages-en.js`: inglese delle pagine interne (l’italiano sta
  nell’HTML, titoli e anteprime social nel blocco `#seo-translations`).
- Traduzioni: si usa `data-i18n`, `data-i18n-aria`, `data-i18n-alt`.
- Dove una pagina ha un proprio `#contatti` il pulsante «Scrivimi» scorre lì,
  altrimenti porta ai contatti della home.
