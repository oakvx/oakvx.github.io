# Sito "Nero" — direzione artistica e sistema

Riprogettazione completa del sito (tutte le pagine, IT ed EN generate). Il gioco in `/gioco/` resta com'è.

## Principio

Lusso attraverso la sottrazione, spettacolarità attraverso la precisione, tecnologia attraverso l'esperienza.
Il nero domina; il cremisi compare solo in tipografia selezionata, dettagli e interazioni.

## Palette

| Token | Valore | Uso |
| --- | --- | --- |
| `--nero` | `#050505` | fondo di tutto il sito |
| `--bianco` | `#E8E6E1` | testo, punti delle sculture |
| `--cremisi` | `#C81035` | una parola per titolo, numerali, stati attivi, 4% dei punti |
| `--grafite` | `#292929` | separatori secondari |

Niente gradienti decorativi, niente glassmorphism: superfici opache, una grana ferma al 5%, filetti a 1px.

## Tipografia

- **Bodoni Moda** (serif ad alto contrasto, dimensione ottica 96): titoli oversize, corsivo per l'accento.
- **Archivo** variabile: testo corrente; l'asse di larghezza (62–125) diventa materiale grafico
  (titolo compresso di Brat Animator, espanso di Spinotto Felice, strumenti che si allargano al passaggio).
- **Cascadia Code**: metadati, numerazioni editoriali, didascalie, terminale.

Gerarchie asimmetriche su griglia a 12 colonne: etichetta mono nelle prime 3 colonne, titolo dalla 4ª.

## Navigazione

- Testata minima: marchio, ora di Sassuolo, IT/EN, "Indice". Si ritira scorrendo verso il basso.
- Indice a tutto schermo con voci numerate 01–05 in Bodoni, casi studio e "Altrove" (gioco, GitHub, email),
  comando "Ferma animazioni". Focus intrappolato, Esc per chiudere.
- Segnapagina in basso a sinistra: numero, titolo, avanzamento in cremisi.
- Colophon uguale ovunque: "Scrivimi." oversize, email, copia, indice, firma `oakvx` in contorno.

## Motion: pochi momenti memorabili

1. **Scultura di punti (home)**: superficie organica deformata da rumore con anello e pulviscolo, illuminata dal cursore.
   Tenere premuto la fa esplodere e la ricompone nel Mii di oakvx.
2. **Autoritratto in punti (Chi sono)**: il Mii in sei pose, stessa interazione.
3. **Sipario tra le pagine** con numero e titolo della destinazione.
4. **Un momento per ogni caso studio**: righe LRC che diventano lyric video (Brat Animator), intent picker che sceglie
   una strada (Synk), calcolo degli orari liberi (Beautify), luce che rivela la schermata (Spinotto Felice).
5. Il resto è discreto: parole che salgono da una maschera, manifesto che si accende scorrendo, anteprime dei lavori
   che seguono il cursore inclinandosi con la velocità.

## Qualità

- Responsive su 12 colonne che collassano a una sotto i 900px.
- `prefers-reduced-motion` e "Ferma animazioni": niente sipario, rivelazioni o loop; le sculture restano ferme.
- WebGL con ripiego statico, punti ridotti su schermi piccoli e hardware modesto, disegno sospeso fuori schermo.
- Nessuna libreria: HTML, CSS, JavaScript e un piccolo motore WebGL.

## Cosa è cambiato rispetto alla versione precedente

- Rimossi dall'esperienza i sistemi "Polaroid", "Wii U" e "After Hours" (tema da console, suoni dell'interfaccia,
  avatar che accompagna lo scorrimento, finestre trascinabili): non compatibili con la nuova direzione. I file restano
  nel repository ma non sono più collegati dalle pagine.
- Conservati tutti i contenuti, il terminale `portfolio.sh`, il contatore dei commit, le email multilingue,
  il menu d'ingresso Sito/Gioco, la build IT/EN e i controlli.
- `fuori-orario/classic/` ora rimanda alla nuova pagina.
