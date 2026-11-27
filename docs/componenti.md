# Componenti del sito

Un repertorio piccolo, usato sempre allo stesso modo. Prima di inventare un blocco nuovo, controlla qui.

## Regole

- **Numerazione delle sezioni:** numeri romani minuscoli tra parentesi, `(i)`, `(ii)`, `(iii)`, dentro il `.t-meta` della testata di sezione. Vale per pagine e casi studio. Le voci dentro un elenco usano `01`, `02`.
- **Fine pagina:** ogni pagina finisce con `a.prossimo` (il link grande alla pagina successiva), poi il colophon.
- **Controllo:** `node scripts/controlla_browser.cjs` segnala numerazioni fuori regola, titoli che saltano livello, testi troppo piccoli, comparse rimaste invisibili e sbordature.

## Elenchi

| Componente | Quando si usa | Markup |
|---|---|---|
| `moduli` | Regole o caratteristiche: titolo e testo su una riga, ordine non importante | `ul.moduli > li.modulo` con `span.modulo__n.t-meta` (01, 02…) |
| `passi` | Una sequenza nel tempo: prima questo, poi quello | `ol.passi > li.passo` con `span.passo__n` (i., ii.…) |
| `aperte` | Tre o quattro fatti brevi affiancati | `div.aperte > article.aperta` con `p.t-meta` (01, 02…) |
| `capitolo` | Blocchi lunghi con un numero romano grande | `article.capitolo` con `.capitolo__num`, `.capitolo__testa h2`, `.capitolo__corpo` |
| `gelatine` | Le tecnologie, a quadratini | `%TECNOLOGIE%` / `%TECNOLOGIE_SITO%` nel corpo |

## Pagine

| Pagina | Componenti |
|---|---|
| Ingresso | aree, archivio, sezioni numerate (i)–(vi) |
| Chi sono | capitolo, moduli (come lavoro), gelatine, aperte (passioni), passi solo nel percorso |
| Fuori orario | aperte, oggetti, giochi, profili |
| Metodo | capitolo (regole), passi (come va un progetto) |
| Lavori | archivio |
| Servizi | servizio (quattro aree), moduli (insieme) |
| Sicurezza | aperte (questo sito), capitolo (progetti), moduli (cosa non prometto) |
| Stile | palette, caratteri, moduli, gelatine |
| Contatti | elenco contatti, passi (tre righe da scrivere, in ordine) |
| Casi studio | caso-apertura, caso-capo, moduli, passi (processo), risultato |
