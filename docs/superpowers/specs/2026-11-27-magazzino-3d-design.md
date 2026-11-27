# Magazzino 3D — design

Data: 27 novembre 2026 · Branch: `sito-nero` · Pagina `/magazzino/`

## Perché
Il Magazzino oggi è un elenco di casse in HTML. oakvx lo vuole come un posto vero in 3D, in coerenza con il blackjack 3D e il mazziere di carta. Non deve ricordare la serranda con i poster di pzkko.it (la sua identità): l'idea è un magazzino vero, come dice il nome.

## Cosa
- **Ingresso al buio.** Si entra in un magazzino spento: una lampada industriale appesa con un cordino. Si tira il cordino (clic, tocco, Invio, o il bottone «Accendi la luce») e i tubi al neon si accendono a scatti, uno dopo l'altro. Nella stessa sessione, dalla seconda visita le luci sono già accese. Con movimento ridotto sono sempre accese.
- **Corsia con scaffali d'acciaio.** Una fila di scaffali su due livelli, vista di fronte; la telecamera scorre in orizzontale (trascinamento, frecce, bottoni). Sotto ci sono pavimento di cemento, un carrello a mano, cartoni e una lampada.
- **Casse tutte uguali, ognuna con il suo simbolo.** La cassa di legno è sempre la stessa; sopra ha un emblema in 3D e davanti il codice e il nome stampati a stencil.
  - Giochi già pronti, sul ripiano basso: Blackjack = una fiche; Scopa = una scopa; Scala 40 = una scala a pioli; Briscola = una carta con un asso; Il gioco in 3D = un cubetto con un occhio; Il terminale = un piccolo monitor.
  - Giochi «in arrivo», sul ripiano alto, con la cassa chiusa e il nastro «IN ARRIVO»: Roulette = una ruota; Texas hold'em = un cappello da cowboy; Solitario = una carta sola; Sudoku = un blocco 3×3; Campo minato = una mina; Dama = una pedina; Forza 4 = un disco con quattro puntini.
- **Casse che si aprono, alla Animation Throwdown.** Selezionando una cassa il coperchio si solleva, esce uno sbuffo di polistirolo (pallini bianchi) e dentro si vede l'oggetto del gioco (le fiches, le carte…). Un clic sulla cassa già aperta, o il bottone «Gioca», porta al gioco con la transizione della pistola.
- **Il magazziniere di cartoncino**, stesso stile e stessa costruzione del mazziere (fermacampioni, due bocche), con berretto, gilet marrone e targhetta «MAGAZZINO». Sta a un bancone con un registro e commenta la cassa selezionata con una battuta breve, in tono tranquillo.
- **Barra in HTML sotto la scena**: nome del gioco, riga di descrizione, bottoni precedente/successivo e «Gioca» (link vero). L'elenco di tutte le casse resta sotto la scena, come oggi.

## Non-obiettivi
- Camminata libera in prima persona, audio, fisica reale del polistirolo.
- Modelli per ogni emblema da scaricare: gli emblemi sono costruiti con forme semplici.
- Nuovi giochi.

## Vincoli
- Vanilla, nessun bundler; three.js da `/gioco/vendor/three` con l'import map già presente; `GLTFLoader` come per la pistola.
- Asset Poly Haven (CC0) convertiti con `gltf-transform` (quantizzati, texture WebP, 1k): scaffali, lampada industriale appesa, carrello a mano, cartone; peso totale sotto i 3 MB. Crediti in `assets/CREDITS.html`.
- Cassa e emblemi costruiti nel codice (texture su canvas), così tutte le casse sono davvero identiche.
- Telefono: risoluzione ridotta, ombre leggere, niente più di 200 pallini di polistirolo. Senza WebGL resta l'elenco HTML di oggi.
- Accessibilità: la scena è decorativa (`aria-hidden`); selezione e «Gioca» passano dalla barra HTML e dall'elenco, navigabili da tastiera; annunci in `aria-live`.
- Commit `oakvx <oakvx7@gmail.com>`, senza firme.

## Approcci considerati
1. **Corsia con scaffali, casse che si aprono, magazziniere di cartoncino** — scelto da oakvx.
2. Carroponte con gancio che prende la cassa — scartato (meno immersivo).
3. Plastico a casa delle bambole — scartato.

## Decisioni
- Emblemi: Scopa e Scala 40 sono giochi di parole sul nome (la scopa, la scala). Tutti gli emblemi sono scelti da me, oakvx può cambiarli.
- Il gioco in 3D e il terminale restano nello scaffale C come «già qui» e si aprono come gli altri.
- Pose, layout delle casse, scorrimento della telecamera e lancio dei pallini sono funzioni pure, testate.

## Lasciato al builder
Colori e disegno degli stencil, durata esatta delle animazioni, battute del magazziniere (brevi, tono tranquillo, mai su etichette).
