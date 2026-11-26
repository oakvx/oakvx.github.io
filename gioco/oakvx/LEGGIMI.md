# La stanza di oakvx: come riempirla

La mansarda in fondo al gioco si riempie da `gioco/dati/stanza-oakvx.json`, senza toccare il codice.
I file vanno in questa cartella (`gioco/oakvx/`); nel JSON si scrivono percorsi relativi a qui.
Se un file manca o una voce è scritta male, il gioco la salta e scrive un avviso nella console del browser.

Ogni testo può essere una stringa (uguale in tutte le lingue) oppure `{ "it": "...", "en": "..." }`.

## Musica (`brani`)

File in `musica/`, mp3 o ogg. Li suona la TV a tubo catodico sulla libreria: E per play/pausa,
il videoregistratore sotto per il brano successivo. Senza brani, la TV suona un carillon generato.

```json
{ "titolo": "Notte in mansarda", "file": "musica/notte.mp3", "nota": { "it": "registrata nel 2025", "en": "recorded in 2025" } }
```

## Poster (`poster`)

Immagini in `poster/`, jpg, png o webp, fino a 1024 px di lato. Vanno nelle cornici sulla parete blu (al massimo 6).

```json
{ "file": "poster/concerto.jpg", "didascalia": { "it": "Il primo concerto", "en": "My first concert" } }
```

## Mensola (`mensola`)

Oggetti sulla libreria (al massimo 12). La forma va scelta tra:
`console-portatile`, `console-casa`, `cassetta`, `libro`, `pianta`, `tazza`, `cuffie`, `vinile`.

```json
{ "forma": "vinile", "etichetta": "Il disco che ascolto di più" }
```

## Note (`note`) e lingue (`lingue`)

Le note sono biglietti sul letto (al massimo 4); le lingue sono cartoline appese vicino al letto.

```json
"note": [ { "it": "Ciao!", "en": "Hi!" } ],
"lingue": [ { "lingua": "Italiano", "livello": { "it": "madrelingua", "en": "native" } } ]
```
