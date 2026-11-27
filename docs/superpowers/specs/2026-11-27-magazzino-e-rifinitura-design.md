# Magazzino e rifinitura del sito — design

Data: 27 novembre 2026 · Branch: `sito-nero` · Sito: oakvx.github.io (statico, GitHub Pages)

## Perché

oakvx vuole un sito "pieno zeppo di cose", come pzkko.it, ma suo. Oggi il sito è curato ma:
- alcune pagine sembrano di un altro sito (componenti e numerazioni diverse);
- i testi girano sempre sulle stesse quattro idee e suonano scritti, forzati;
- la pistola della transizione sembra un giocattolo: il proiettile non esce davvero dalla canna;
- manca una parte dove la gente si fermi a giocare.

Successo = chi entra ci resta: legge testi naturali, vede effetti credibili, e trova giochi a cui vuole giocare davvero (carte italiane, casinò finto, classici).

## Obiettivi

1. **Difetti e stile uniforme** su tutte le 19 pagine IT/EN.
2. **Testi riscritti**: meno ripetuti, più parlati, ogni frase con un'idea sua.
3. **Pistola realistica**: sparo credibile, proiettile che esce esattamente dalla canna.
4. **Tecnologie a quadratini gelatinosi**: le tecnologie che oakvx usa davvero, ognuna in uno squircle con animazione elastica.
5. **Magazzino**: una pagina a parte con giochi veri, prima contro il computer, poi con gli amici.

## Non-obiettivi

- Soldi veri, acquisti, registrazione, account, classifiche online (nella fase 1).
- Effetti fini a sé stessi nel Magazzino (webcam distorta, sculture da schiacciare): oakvx li ha scartati esplicitamente.
- Copiare pzkko o albertopecchini.it: niente testi, grafiche, nomi ($pzk), cercapersone 3D, ricette, mappe. Si prende solo il principio.

## Anti-obiettivi (fallimento anche se funziona)

- Giochi che nessuno vuole giocare, o avversari stupidi che si battono senza pensare.
- Testi che sembrano ancora "scritti da un copywriter" o da un'AI.
- Una pistola che continua a sembrare finta.
- Il Magazzino che rompe la parte seria del sito (deve essere una porta separata).
- Fatti inventati su oakvx.

## Vincoli

- Sito statico: HTML/CSS/JS vanilla, nessun bundler, nessun server. three.js è già in `/gioco/vendor/three`.
- Pagine IT generate da `scripts/genera_pagine.py` (testata, colophon, corpi in `scripts/pagine/`); EN generate da `scripts/build_static.py` col dizionario `assets/nero/i18n-en.js` (`data-i18n*`). CI rigenera e confronta.
- Controlli: `python3 scripts/check_site.py`, `node --test test/sito/*.test.mjs`.
- Palette #050505 / #E8E6E1 / #C81035 / #292929; Fraunces, Archivo, Cascadia Code; niente glassmorphism.
- Movimento ridotto e "Ferma animazioni" spengono tutto; tastiera e lettori di schermo devono funzionare; mobile prima di tutto per i giochi.
- Privacy: niente tracciamento. Ogni nuova chiamata esterna va dichiarata nella pagina Sicurezza.
- Commit: autore `oakvx <oakvx7@gmail.com>`, niente trailer o firme Claude, tanti commit piccoli.
- Tono: cinico ma simpatico, nonchalant; niente battute appiccicate a etichette e metadati; presentarsi come "oakvx".

## Approcci considerati per il Magazzino

1. **Motore carte comune + una pagina per gioco** — scelto da oakvx. Modulo condiviso (mazzi, mischiata con seme, turni, punteggi, avversari), una pagina leggera per gioco (`/magazzino/<gioco>/`). Link diretti funzionano, si testa una volta sola, il multigiocatore si aggiunge con un solo modulo.
2. **Un'unica app con tutti i giochi** — scartato: più pesante, diversa dal resto del sito, link diretti peggiori.
3. **Giochi già fatti ricolorati** — scartato: non sono suoi, regole italiane scarse, multigiocatore non agganciabile.

Multigiocatore: **prima contro il computer, poi con gli amici** (scelta di oakvx), gioco per gioco a partire dalla briscola.

## Parte A — Difetti e uniformità

Trovati con il passaggio nel browser (Playwright, 19 pagine × desktop/telefono):
- Contatti: i tre contatti sono minuscoli su desktop (regola `.pagina--contatti .scrivimi__elenco b` aggiunta per il telefono).
- Contatti: il blocco "Scrivimi" del colophon ripete la pagina → nasconderlo lì.
- Chi sono, Fuori orario, Contatti: manca il link finale grande ("prossimo") che hanno tutte le altre.
- Fuori orario: un `.rivela` resta invisibile dopo lo scroll.
- Metodo: salto di livello nei titoli (h1→h3).
- Numerazione sezioni: casi studio `(01)`, pagine `(i)` → una regola sola.
- Stessa funzione, componenti diversi (passi a gradini, moduli a righe, aperte a colonne, capitoli): fissare un repertorio piccolo e usarlo con criterio uguale ovunque.

Il builder ripete il passaggio nel browser alla fine e allega gli screenshot.

## Parte B — Testi

- Riscrivere i testi di tutte le pagine (IT e EN insieme) partendo dai fatti già presenti: niente fatti nuovi.
- Varietà: ogni pagina ha un'idea centrale diversa; vietato ripetere i giri ricorrenti (consegno quando lo userei io, non subito ma rispondo, garanzie scadute, ecc.) più di una volta nel sito.
- Parlato, frasi corte, niente strutture da slogan ("Non X. Y."), niente triadi forzate.
- oakvx chiede "qualche buzz in giro": ganci brevi e diversi sparsi nel sito, mai su etichette e metadati.
- Il builder consegna un elenco prima/dopo per pagina da far approvare a oakvx prima del commit finale.

## Parte C — Pistola realistica

File: `assets/nero/pistola.js` (scena three.js), `assets/nero/proiettile.js` (tempi e regole, testati).

Requisiti:
- Il proiettile nasce **dentro la canna**, sull'asse della canna (punta ricavata dalla geometria del modello, non a occhio), e ne esce allineato alla direzione della canna prima di curvare verso lo spettatore e ingrandirsi fino a coprire lo schermo.
- Sequenza fisica credibile, al rallentatore ma coerente: vampa alla volata (breve, 1–2 fotogrammi), gas e fumo leggero, carrello che arretra e torna, bossolo espulso di lato con rotazione, rilevamento della volata (muzzle rise) e ritorno smorzato, leggero scuotimento.
- Niente easing da cartone: curve ricavate da riferimenti reali (riprese ad alta velocità di pistole semiautomatiche: ordine e proporzioni dei movimenti), scritte come funzioni pure in `proiettile.js` e testate.
- Funziona su desktop e telefono (inquadratura verticale già sistemata), 60 fps su un telefono medio; fallback senza WebGL e con movimento ridotto invariati.
- Il builder documenta nel codice i riferimenti usati e mostra a oakvx fotogrammi chiave prima di chiudere.

## Parte D — Tecnologie a quadratini gelatinosi

- Una riga (o griglia su telefono) di squircle, ognuno con il logo di una tecnologia e colori propri, leggermente ruotati e sfalsati.
- Al passaggio del cursore lo squircle si "aggancia" e segue il puntatore con una molla, poi lo lascia e rimbalza come gelatina (deformazione scala X/Y opposta). Su touch: tocco = rimbalzo + nome.
- Tooltip con nome e a cosa serve, in tono oakvx.
- Solo tecnologie usate davvero (dai repo e dalle pagine): HTML, CSS, JavaScript, TypeScript, React, Python, FastAPI, Node.js, PHP, C, PostgreSQL, MySQL, SQLite, Docker, Tauri, three.js, Git, GitHub Actions, Playwright. Loghi da Simple Icons (CC0), crediti in `assets/CREDITS.html`.
- Posizione: Chi sono ("Con cosa lavoro" diventa questo) e Stile (con cosa è fatto il sito).
- Ispirazione: albertopecchini.it/studio; implementazione e grafica nostre.

## Parte E — Magazzino

### Ingresso
- Tasto "Magazzino" fisso nella testata (non una voce dell'indice), su tutte le pagine IT/EN.
- Pagina `/magazzino/`: deposito ordinato, scaffali numerati (A-01, A-02…), casse con etichette a stencil, dentro la palette del sito ma con tono più leggero. Ogni cassa: nome, una riga, "gioca".
- Saldo gettoni visibile in alto.

### Gettoni
- Moneta finita, salvata in `localStorage`, saldo iniziale 1.000, pulsante "ricarica" quando si va a zero. Nessun legame con soldi veri. Nome scelto dal builder (non `$pzk`).

### Giochi, in ordine
1. Blackjack (mazzo francese, gettoni)
2. Briscola (carte siciliane da 40, 1 contro 1, poi 2 contro 2)
3. Scopa (carte siciliane, scopa classica, conteggio carte/denari/settebello/primiera/scope)
4. Scala 40 (due mazzi francesi con jolly, apertura a 40)
5. Carioca, nella versione di oakvx: combinazioni coppia, tris, poker, tric trac, bomba e chiusura. Le regole esatte le descrive oakvx; finché non ci sono, la carioca resta fuori dal piano di esecuzione
Poi: roulette, Texas hold'em, solitario, sudoku, campo minato, dama, forza 4.

Il gioco 3D esistente (`/gioco/`) e il terminale di Chi sono si collegano dal Magazzino.

### Motore comune (`assets/magazzino/`)
- Mazzi (siciliano 40, francese 52 + jolly), mischiata con generatore a seme (partite riproducibili nei test), mano, tavolo, turni, punteggi.
- Avversari per gioco, con due livelli (normale, difficile): briscola e scopa euristiche (carichi, settebello, primiera, scope); scala 40 e carioca con ricerca di combinazioni.
- Regole e punteggi come funzioni pure, testate con `node --test`.
- Interfaccia: carte in SVG disegnate da noi (stile siciliano reinterpretato in nero e cremisi, spade ricurve come scimitarre; francese pulito), trascinamento e tocco, tastiera, annunci per lettori di schermo, animazioni di distribuzione e presa che rispettano il movimento ridotto.
- Testi e regole in IT/EN col sistema esistente; pagina "come si gioca" breve per ogni gioco.

### Fase 2 — con gli amici
- Un modulo di collegamento unico per tutti i giochi, codice partita da condividere, a partire dalla briscola.
- Tecnologia da decidere all'inizio della fase 2 (collegamento diretto tra browser con un servizio di incontro pubblico, oppure piccolo servizio esterno). Va dichiarato nella pagina Sicurezza.

## Lasciato al builder

- Nome dei gettoni, testi del Magazzino, disegno di casse e carte.
- Struttura interna dei moduli e dei test, purché regole e avversari siano funzioni pure testate.
- Dettagli delle curve della pistola, purché basate su riferimenti reali e documentate.
- Ordine dei commit (piccoli, uno per pezzo).

## Decisioni di oakvx

- Mazzo da 40: **carte siciliane**.
- Scopa e briscola si giocano con le **carte siciliane**.
- Carioca: è **un gioco a parte** (non una variante della scala 40 né della scopa), con **coppia, tris, poker, tric trac, bomba e chiusura**. Mazzo e regole li indica oakvx. Non ho trovato fonti pubblicate su questa variante: le regole (carte distribuite, cosa sono tric trac e bomba, come si chiude, punteggi) le scrive oakvx prima che la carioca entri nel piano.
