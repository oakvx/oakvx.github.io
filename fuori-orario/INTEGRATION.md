# AFTER HOURS nel portfolio

Integrato da `AFTER-HOURS-site.zip` il 4 novembre 2026 nella cartella `dist`.
Il canale è disponibile su `/fuori-orario/`; la precedente pagina completa
rimane su `/fuori-orario/classic/`. HOME permette di tornare al portfolio
mantenendo la lingua. In Informazioni sono disponibili crediti e versione classica.

Sono inclusi tutti i moduli dedicati, l'introduzione Canvas, i font Droid Sans
e le licenze fornite. La pagina non richiede build né dipendenze aggiuntive.
Attribuzioni e condizioni: `../assets/after-hours/NOTICE.md` e `COPYING`.

Adattamenti locali: collegamento Progetti corretto; ritorno da Informazioni a HOME
corretto; preferenza di movimento del portfolio rispettata; logo Beautify leggibile
sul fondo scuro; salto al contenuto utilizzabile anche nell'interfaccia JavaScript.
Il fallback senza JavaScript mantiene tutti i contenuti e nasconde il telecomando.

Verifica: 351 controlli superati in Chrome su 1280×720, 1024×768, 390×844,
844×390 e 320×720, con interfaccia italiana e inglese. Verificati gli otto cicli
apertura/dettaglio/lettura/ritorno, liste e paginazione, opzioni, HOME, spegnimento
e riaccensione, introduzione normale e salto, movimento ridotto e pausa,
destinazioni locali, immagini, dati GitHub simulati nei soli test, gestione degli
errori API e fallback senza JavaScript. Nessun errore JavaScript o risorsa locale
mancante durante le prove. I valori GitHub pubblicati continuano a provenire
dall'API pubblica e dalla sua cache, senza valori inventati.

Il controllo statico comprende le nove pagine principali, 585 riferimenti locali
e 115 riferimenti aggiuntivi della versione classica e dei contenuti dinamici.
Anteprime, esiti e copie precedenti dei file modificati si trovano in
`output/playwright/afterhours-integration/` nella radice del repository.

Homepage, laptop e gli altri file già presenti in `dist` sono conservati;
gli unici file condivisi aggiornati sono la pagina crediti e le sue stringhe inglesi.
I sorgenti esterni a `dist` e l'indice Git non sono stati modificati dall'integrazione.

## Sfondo senza bande

Acqua e introduzione ora coprono l'intero viewport, anche sotto il telecomando
touch. Menu e puntatore mantengono le proporzioni originali e coordinate coerenti;
il titolo dell'introduzione si adatta senza deformazioni. Rimosso il margine nero
del televisore; il gradiente termina in blu scuro.
Superati 52 controlli dedicati su sei formati da 320×720 a 2560×1080, con DPR 2,
e nuovamente tutti i 351 controlli funzionali. Anteprime in
`output/playwright/afterhours-integration/no-bars-review.html`.

## Menu adattivo e Mii personali

Il menu usa ora una griglia CSS adattiva e dimensioni leggibili, senza scalare
l'intera interfaccia come un'immagine. Ogni applicazione mantiene contenuti e
destinazioni originali e ha una posa personale del Mii di Gabriele; altre pose
accompagnano intestazione, barra inferiore, HOME e schermate interne.
Il pulsante del Mii nell'intestazione permette di cambiare posa.

Dialoghi HTML nativi con `showModal()`, scorrimento naturale, ESC e ritorno alla
tessera iniziale. Il puntatore manuale Popover resta nel livello superiore.
Viste, ordinamento, lingua e scelta del cursore vengono conservati con accesso
protetto a localStorage. I controlli touch seguono la finestra attiva e disabilitano
le azioni non disponibili. I pulsanti audio e movimento riutilizzano le preferenze
e il motore sonoro del portfolio; nessuna duplicazione dell'AudioContext.

Movimenti e pose animate si fermano con pausa, movimento ridotto e tab nascosta.
L'acqua rimane a schermo intero, con DPR massimo 2 e rendering limitato a 30 FPS.
Il codice dell'interfaccia mantiene la licenza GPL-2.0-only.

988 verifiche superate in Chrome su sette formati da 320×720 a 2560×1080:
applicazioni e destinazioni, dialoghi nativi, tastiera, touch, focus, impostazioni,
audio, pausa, puntatore, funzionamento senza JavaScript e storage non disponibile.
Audit axe A/AA del menu e della lettura a 390 e 1280 px senza violazioni.
Rapporto, anteprime e copie dei file precedenti:
`output/playwright/homebrew-review/` nella radice del repository.
