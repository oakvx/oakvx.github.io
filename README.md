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
- `assets/polaroid/site.js` e `oakvx.js`: testi alternativi e traduzioni.
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
