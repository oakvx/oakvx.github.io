# Gioco v3: "Turno di notte" — design

Data: 2026-11-26 · Stato: da approvare · Sostituisce il gioco v2 in `/gioco/`

## Perché

Il gioco v2 ha un buon motore (finestre/portali, fisica, atmosfere per stanza) ma un giro senza senso: stanze scollegate, portali usati una volta, missioni pretestuose (la panca, il magazzino, la scatola "non toccare"), e finali che rimandano a pagine del sito. oakvx vuole che il gioco:

- mostri **tutti** i progetti a chi lo gioca una volta sola (pubblico principale: **recruiter e aziende**);
- diverta chiunque perché è **intelligente**: chi chiude deve pensare "ma questo quanto tempo libero ha";
- sia **immersivo**: tutto dentro il gioco, nessuna finestra che porta al sito;
- abbia più **suoni**, sia più **mind bending**, con la **meccanica delle finestre integrata negli spazi liminali** e usata ovunque;
- abbia un'estetica **low poly nello spirito dei vecchi giochi Valve** (cemento, luce fredda, oggetti fisici), con spazi liminali;
- contenga **un'area di oakvx** dove lui mette la sua musica, le passioni, le sue cose (requisito fisso).

## Obiettivi

1. Un giro principale di **10–15 minuti** che attraversa obbligatoriamente ogni stanza-progetto.
2. Una stanza per ogni progetto principale, dove il progetto **si gioca** (enigma ispirato a come funziona) e **si legge** (testi nello spazio).
3. Le due finestre (ciano `#39c6d9`, magenta `#d95bb3`) si ottengono nel primo minuto e servono in ogni ala.
4. Spazi liminali non euclidei: stanze più grandi dentro che fuori, corridoi che si ripetono, passaggi che cambiano alle spalle.
5. Musica liminale lentissima, rilassata e inquietante, che **si distorce a ogni cambio di stanza**; effetti sonori ovunque (passi per materiale, urti, leve, porte, finestre).
6. La stanza di oakvx si riempie **senza toccare il codice**: un file JSON e una cartella di file.

## Non obiettivi

- Rifare il sito (è un progetto separato, dopo questo).
- Versione touch/mobile del gioco (resta l'avviso: "da computer").
- Doppiaggio: il curatore resta a sottotitoli (il supporto a `voce/` esistente rimane, vuoto).
- Salvataggi a metà giro: una partita dura 15 minuti.

## Anti-obiettivi (fallimento anche se "funziona")

- Un recruiter che non vede un progetto perché era nascosto o perché è rimasto bloccato.
- Un enigma che blocca più di 90 secondi.
- Link che portano fuori dal gioco prima della fine.
- Una copia di Half-Life, Portal o delle Backrooms: niente nomi, loghi, personaggi, livelli, armi, colori (arancio/blu) o texture riconoscibili. Prendiamo il genere e il sapore, tutto il resto è originale.
- Musica fastidiosa: deve inquietare piano, non spaventare.

## Vincoli

- Sito statico su GitHub Pages: niente bundler, niente dipendenze; JavaScript a moduli ES; Three.js r187 già in `gioco/vendor/three/`.
- La CI controlla ogni `.js` con `node --check`; i test unitari nuovi girano con `node --test` (nessuna dipendenza).
- Testi IT/EN per tutto; impostazione "calmo" e `prefers-reduced-motion` rispettati.
- Commit con autore `oakvx <oakvx7@gmail.com>`, senza righe di attribuzione; branch `gioco-v3`.
- Contenuti dei progetti presi dal README del profilo GitHub (`oakvx/oakvx`), sezioni comprese.

## La cornice

Il curatore resta: è la voce che tiene insieme il giro. Ora fa il **turno di notte** nell'edificio di oakvx, un impianto in cemento che "è" il suo profilo GitHub: ogni ala è una sezione del README, ogni porta ha un hash di commit come numero. Il curatore legge un copione che l'edificio continua a riscrivere; lui va nel panico, l'edificio no. Il visitatore porta "le due finestre", lo strumento che apre varchi sui pannelli.

Idee peculiari (scelte mie, nello stile di oakvx):

- **L'edificio è un repository.** Porte numerate con hash brevi; il cartello negli spazi liminali dice "stanza 1.847 di 2.500" usando il contatore vero dei commit.
- **Il Mii di oakvx in low poly** compare negli spazi liminali, sempre mentre gira un angolo; alla fine lo trovi seduto nella sua stanza.
- **"Evidence or it didn't happen"** diventa una meccanica: in middleManPS4 vedi solo ciò che hai illuminato con la lampada delle prove.
- **Brat Animator in stile Windows 7**: la stanza è un desktop gigante, le finestre del desktop sono i pannelli.
- **La galleria contiene te**: lo schermo del portfolio mostra la stanza dall'alto con te dentro.

## Il giro

```
INGRESSO ─► PERCORSO ─► SMISTAMENTO (Backend & App Logic)
                          ├─ YAG
                          ├─ PIKO
                          ├─ BRAT ANIMATOR       (5 lampade: esci quando sono tutte accese)
                          ├─ SYNK
                          └─ BEAUTIFY
            ─► TRANSITO A (atrio, corridoio allagato) ─► MIDDLEMAN (Reverse Engineering)
            ─► TRANSITO B (cisterna, chiocciola) ─► GALLERIA (Design & Web)
            ─► SCRIVANIA (Cosa so fare) ─► COMMIT (attività GitHub)
            ─► TRANSITO C (supermercato, nave, ballatoio) ─► STANZA DI OAKVX (Fuori orario)
            ─► CONTATTI ─► fine
```

Segreto: dal PERCORSO una porta che compare solo guardando indietro porta subito nella stanza di oakvx (e ritorno).

### Stanze

| Stanza | Cosa si legge | Cosa si gioca |
| --- | --- | --- |
| Ingresso | chi è oakvx (una riga), comandi | prendere le finestre dal bancone, primo varco tra due pannelli |
| Percorso | le tappe del README: IIS Volta 2021–26 (Beautify diploma), freelance 2023–26, Erasmus+ Siviglia 2025, Format SRL ago–set 2026, UNIMORE 2026 → | corridoio più lungo dentro che fuori; ogni tappa una porta con l'anno |
| Smistamento | sezione "Backend & App Logic" | hub con 5 porte; lampade che si accendono a progetto completato |
| YAG | gateway AI in C17, adattatori OpenAI/Anthropic, routing per modello, limiti, console React | porti il cubo-chiave (chiave client LAN) al varco di autenticazione; la stessa porta d'uscita porta a un backend diverso secondo il piedistallo su cui metti il cubo; serve il backend 2 |
| Piko | agente Windows locale con Ollama, piano scritto, azione solo dopo approvazione | un agente-fantasma mostra un piano a terra; leva APPROVA/RIFIUTA; il piano 1 finisce in un pozzo, il 2 apre la porta |
| Brat Animator | editor di lyric video nel browser, Canvas 2D, WebCodecs, IndexedDB, PWA, 7.css | desktop Windows 7 gigante; le parole del testo sono piattaforme che compaiono a tempo di musica; una leva-timeline ferma o riavvolge il tempo |
| Synk | prenotazioni on-premise, WhatsApp, Google Calendar, vincolo GiST contro le doppie prenotazioni, outbox, saga di compensazione | pavimento-calendario: metti tre cubi-prenotazione su fasce libere; due prenotazioni sovrapposte si respingono (rosso); a calendario pieno il muro "sincronizza" e apre |
| Beautify | progetto di maturità, CRM multisalone PHP/MySQL, dati separati per salone, disponibilità condivisa | tre saloni identici e separati: ciò che sposti in uno non compare negli altri; usi le finestre per portare l'appuntamento nel salone libero |
| Transiti A/B/C | (atmosfera) | gli spazi liminali di v2 (atrio, corridoio allagato, cisterna, chiocciola, supermercato, nave, ballatoio) con pannelli e enigmi di finestre: attraversare l'acqua, salire senza scale, lanciare cubi |
| middleManPS4 | toolkit di analisi PS4: payload, ELF/Orbis, Ghidra, rete passiva; solo diagnostica in lettura | stanza buia; la lampada delle prove (tasto F) rivela etichette e pannelli; solo i pannelli "provati" accettano finestre |
| Galleria | Design & Web: portfolio, Spinotto Felice (demo fittizia, crediti Alberto Pecchini), Top Gun Fly School (demo non ufficiale), sito Synkris | 4 vetrine; schermo che mostra la stanza dall'alto con te dentro; leva tema chiaro/scuro di Spinotto Felice che cambia la luce della stanza |
| Scrivania | strumenti per area (Web, Backend & AI, Dati, Reverse engineering, Sistemi), principi | terminale `portfolio.sh` in cui si scrive davvero; il comando `apri` apre la porta |
| Commit | contatore pubblico dei commit (account `oakvx` e `oakvxish`), repo recenti | parete di quadrati che compone il numero dal vivo |
| Stanza di oakvx | lingue (IT madrelingua, EN C1, ES B1, EL B1, ZH A2), console (tre 3DS modificati, Wii U, Wii, PS4), musica, cose sue | jukebox che suona i suoi brani, poster, mensola, Mii seduto; tutto da `dati/stanza-oakvx.json` |
| Contatti | email, "aperto a: stage, freelance, progetti interessanti" | schermata finale: Scrivimi (mailto), Copia email, Torna al sito, Rigioca |

## Regole di gioco

- **Aiuti.** Ogni enigma registra l'ultimo progresso. A 45 s senza progresso il curatore dà un indizio; a 90 s la soluzione compare nella stanza (sagome delle finestre sui pannelli giusti, cubo evidenziato, comando scritto sul monitor). I timer si fermano in pausa.
- **Lampade.** Lo smistamento si apre in uscita con 5 lampade accese; ogni stanza-progetto accende la sua quando l'enigma è risolto.
- **Recupero.** Chi cade nel vuoto o resta incastrato torna al punto di controllo della stanza attuale (non all'inizio del gioco).
- **Un finale.** Niente più cinque finali. Il finale è la stanza dei contatti; il riepilogo indica il tempo e i segreti trovati (3: porta del percorso, Mii in tutti i transiti, comando nascosto del terminale).
- **Leggere.** Interagire (E) con un'esposizione apre un **cartiglio** in sovrimpressione senza uscire dal gioco e senza link; E di nuovo o allontanarsi lo chiude.

## Suono

- **Musica liminale** (Web Audio generativo, nessun file): 40–48 BPM, accordi radi, pad lenti, campanelli lontani, leggero fruscio di nastro. Ogni ala ha la sua tonalità. **A ogni cambio di stanza**: 1,2 s di "nastro che rallenta" (calo di intonazione, filtro passa-basso che si chiude, saturazione), poi ritorno. Con "calmo" la distorsione è dimezzata e senza oscillazione di intonazione.
- Nelle stanze-progetto la musica cede il posto a un letto sonoro proprio (Brat: battito che guida le piattaforme; Synk: notifiche; middleManPS4: rumore di rete).
- **Effetti**: passi diversi per materiale (cemento, metallo, piastrelle, moquette, acqua, legno), urti dei cubi proporzionali alla velocità, leve, porte pesanti, ronzio delle lampade, apertura/chiusura/attraversamento delle finestre, errore, lampada accesa, notifica del curatore.
- La stanza di oakvx usa i **suoi file audio**; senza file, il jukebox suona una melodia generata.

## Estetica

Low poly a facce piatte, texture procedurali su canvas (come oggi), originali: cemento con macchie, intonaco in due colori (zoccolo scuro, parte alta chiara), metallo verniciato e graffiato, piastrelle consumate, moquette, legno scuro. Luce: neon freddi negli impianti, sodio caldo nei transiti, lampada calda nella stanza di oakvx. Post-processing: si toglie la sfocatura "sognante", si aggiunge leggera quantizzazione del colore e grana. Oggetti fisici con spigoli vivi. I cubi hanno un hash stampato sul lato.

## Stanza di oakvx: com'è fatta

Riferimenti dati da oakvx il 2026-11-26 (due foto, non incluse nel repo):

1. **La stanza**: mansarda di notte con il **tetto di vetro a falde** e travi di legno scuro, **pioggia** che scorre sui vetri e cielo blu temporalesco, **due faretti** caldi appesi alle travi. In fondo un **letto basso con coperta verde** e cuscini chiari, incassato in una **libreria piena** (libri, scatole, una **TV a tubo catodico** su uno scaffale). Pareti blu polvere con piccoli motivi chiari sparsi; **moquette a onde arancio e ocra** con piccole stelle; **termosifone** in ghisa bianco, **boccione dell'acqua**, **finestrella ad arco** con davanzale giallo; a destra una **porta scura con scaletta a gradini** incassata nel muro.
2. **L'atmosfera**: foto di una fotocamera digitale del **2008** in un soggiorno qualunque (flash frontale, colori slavati, rumore JPEG, **data gialla in basso a destra**). Entrando nella stanza il post-processing passa in "modalità 2008": flash (centro più chiaro, angoli scuri), saturazione bassa, leggera blocchettatura, grana e la data `GG/MM/2008` in giallo nell'angolo (giorno e mese di oggi). Con "calmo" niente blocchettatura animata.

Nella stanza: il **jukebox è la TV a tubo catodico** (mostra titolo del brano e una barra), i **poster** sono le cornici sulla parete blu, la **mensola** è la libreria, le **note** sono biglietti sul letto, il **Mii** è seduto sul letto. Suono: pioggia sul vetro (sempre), ronzio della TV.

## Stanza di oakvx: come si riempie

- `gioco/dati/stanza-oakvx.json` con: `brani` (titolo, file in `gioco/oakvx/musica/`, nota), `poster` (immagine in `gioco/oakvx/poster/`, didascalia IT/EN), `mensola` (oggetti tra un elenco di forme low poly già pronte: console, cassetta, libro, pianta, tazza, cuffie, con etichetta), `note` (biglietti con testo IT/EN), `lingue`.
- File mancanti o JSON rotto non rompono il gioco: gli elementi non validi si saltano e in console compare un avviso.
- `gioco/oakvx/LEGGIMI.md` spiega come aggiungere le cose.

## Contatore dei commit

Come `assets/github-stats.js`: API di ricerca commit di GitHub per `oakvx` e `oakvxish`, somma, cache di un'ora in `localStorage`. Senza rete o con limite superato: "2.500+".

## Approcci considerati

1. **Rifare il giro sul motore attuale (scelto).** Il motore regge già finestre, fisica, acqua, atmosfere, stanze a moduli. Si aggiungono varchi fissi (per il non euclideo), musica, passi, nuovi materiali e si riscrivono le stanze. Costo contenuto, rischio basso.
2. Nuovo motore con una libreria di fisica (Rapier) e un editor di livelli. Più potente, ma introduce dipendenze e build, contro il vincolo del sito statico; settimane in più.
3. Ritoccare v2 (spostare stanze, togliere la panca, collegare i finali). Economico ma non risolve il problema: i progetti resterebbero nascosti e i portali marginali.

## Lasciato a chi costruisce

Coordinate e misure esatte delle stanze, forme dei mobili, testi definitivi del curatore (tono di v2, nome "oakvx"), timbri precisi dei suoni, purché rispettino quanto sopra.
