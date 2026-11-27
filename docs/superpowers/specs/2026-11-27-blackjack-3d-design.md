# Blackjack 3D — design

Data: 27 novembre 2026 · Branch: `sito-nero` · Parte del Magazzino

## Perché
oakvx vuole che i giochi del Magazzino sembrino veri, non lo stile minimale del sito: "deve sembrare di giocare con una persona vera". Si parte dal blackjack, in 3D con three.js. Scopa e briscola verranno dopo (anche in SVG).

## Cosa
- **Tavolo vero**: mezzaluna di panno verde con la stampa ("BLACKJACK PAGA 3 A 2", "IL BANCO STA SU 17", cerchio delle puntate), bordo imbottito in pelle scura, legno. Luce calda dall'alto, ombre. Telecamera seduta al posto del giocatore.
- **Mazziere di carta a fermacampioni**: pezzi piatti ritagliati (busto con camicia, gilet e papillon; testa; braccio, avambraccio e mano per lato) uniti da fermacampioni d'ottone visibili. Ogni pezzo ruota attorno al suo perno (spalla, gomito, polso, collo). La mano sinistra tiene il mazzo, la destra prende la carta e la lancia. Due bocche (chiusa/aperta) alternate quando parla; occhi che sbattono; dondolio leggero da fermo. Pezzi disegnati da noi (canvas/SVG), niente immagini generate.
- **Carte**: volano dalla mano del mazziere, ruotano in aria, atterrano con ombra e un piccolo rimbalzo; la carta coperta del banco si gira quando tocca al banco. Facce = carte francesi già disegnate per il Magazzino (`assets/magazzino/disegno.js`) rese in texture.
- **Fiches**: pile 3D con il saldo; puntando scivolano nel cerchio; a fine mano tornano al giocatore (vincita) o vanno al banco.
- **Fumetto**: le battute del mazziere ("Carta?", "Banco a 17", "Blackjack!") in un fumetto HTML vicino alla testa, mentre la bocca si apre e chiude.
- **Regole**: quelle di `assets/magazzino/blackjack.js`, invariate e già testate. Cambia solo la scena.

## Non-obiettivi
- Scopa, briscola, scala 40 in 3D (dopo).
- Modelli umani realistici, lip-sync vero, audio.

## Vincoli
- Vanilla, nessun bundler; three.js da `/gioco/vendor/three` con l'import map già presente nelle pagine.
- Telefono: risoluzione ridotta, ombre più leggere, deve restare fluido. Senza WebGL resta il tavolo 2D attuale.
- Movimento ridotto: carte e fiches compaiono al loro posto, il mazziere non dondola.
- Accessibilità: i bottoni (Punta, Carta, Stai, Raddoppia, Dividi) restano HTML; annunci in `aria-live`.
- Commit come `oakvx <oakvx7@gmail.com>`, senza firme.

## Approcci considerati
1. **3D three.js con mazziere di carta a fermacampioni** — scelto da oakvx.
2. Illustrazione 2D SVG/CSS — scartato per il blackjack (oakvx lo vuole in 3D), possibile per la scopa.
3. Foto/render di sfondo con carte sopra — scartato: il mazziere non si muove.

## Decisioni
- Mazzo Kenney "Playing Cards Pack" (CC0) valutato e scartato: è in stile pixel art e il download automatico è bloccato. Si usano le nostre carte francesi.
- Pose del mazziere e volo delle carte come funzioni pure (testate); la scena le applica.

## Lasciato al builder
Disegno dei pezzi del mazziere, palette del panno, durata esatta delle animazioni (fluide, mai lente: una carta ~0,45 s).
