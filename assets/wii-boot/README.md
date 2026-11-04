# Wii PAL 4.3E · Avvio OAKVX

L'avvio interattivo fornito in `oakvx-wii-boot.zip` precede il portfolio
una volta per sessione del browser. Il disco OAKVX apre l'anteprima e Start
mostra la pagina richiesta senza redirect, conservando lingua, query e frammento.
Salta intro chiude l'avvio immediatamente. ESC torna al menu dall'anteprima
e salta dal menu. Tutti i dieci canali sono navigabili; quelli Nintendo aprono
un WIP identificato dal nome del canale, con ritorno funzionante.

L'integrazione è vanilla HTML/CSS/JavaScript e usa un dialogo nativo.
Non crea voci nella history e non introduce un secondo AudioContext.
I suoni restano affidati al controller e alla preferenza audio del portfolio.
Clock e data usano Europe/Rome. Il puntatore condiviso segue il mouse senza interpolazione;
touch, tastiera, pausa e movimento ridotto rimangono disponibili.
Il layout rimane 16:9, centrato e scalato uniformemente: quattro colonne e tre
righe anche su telefono verticale. Controlli web e suggerimento di rotazione
restano fuori dallo schermo Wii.

Il menu di After Hours mantiene i Mii e tutte le funzioni esistenti. All'ingresso
diretto con avvio globale, viene preparato dietro la dissolvenza senza una seconda
introduzione. Navigando normalmente dopo il lancio rimane il suo ingresso locale.
Il loader della homepage viene soppresso solo durante questo avvio.

Il bootstrap nelle dieci pagine pubbliche ha un timeout di sicurezza: in caso di
errore di caricamento, il sito viene sbloccato invece di restare nascosto.
Senza JavaScript e per i crawler viene presentato direttamente il contenuto.
La preferenza di sessione usa sessionStorage con gestione degli errori.

Per verificare: `?wii=menu`, `?wii=preview`. Per saltare: `?nowii` o `?skipwii`.
`window.OAKVX_WII` espone stato, `toPreview()`, `toMenu()`, `launch()`, `skip()`
e `replay()`; replay conserva gli altri parametri e il frammento.
Sono disponibili anche `openChannel(id)` e `openScreen(id)`; ID sconosciuti
restituiscono `false`. Registri: `OAKVX_WII_CONTENT.channels`, `.settings`, `.screens`.
I ritorni conservano pagina e controllo attivo, anche dopo cambi di canale.
Alla prima apertura OAKVX mostra il disco, lo allinea e lo inserisce nel vano
illuminato della console (2,4 s). Solo quando è completamente all'interno inizia
la lettura (0,8 s), seguita dall'ingresso del banner del gioco (0,82 s): marchio
gl., titolo OAKVX e Mii esistente del portfolio. Avvia rimane disabilitato fino
alla conclusione effettiva delle animazioni, senza un timeout che le interrompa.
Il disco inserito rimane riconosciuto tornando dal Menu Wii. Uscire durante
l'inserimento annulla la sequenza; il successivo ingresso la ripete. Anche il
ritorno da HOME rispetta questo vincolo. Una scheda nascosta sospende la sequenza;
movimento ridotto e pausa mostrano direttamente il banner pronto. Nessun disco
continua a ruotare nel banner finale. Test e fotogrammi della sequenza:
`rtk node scripts/check-wii-disc.cjs`, `output/playwright/wii-reconstruction/disc/`.
Il passaggio da Avvia usa una chiusura di 280 ms, due frame di preparazione
della destinazione e una dissolvenza dell'intero overlay di 440 ms. Il fondale
nativo è trasparente: chiudere il dialogo non produce uno stacco nero. Con
movimento ridotto il passaggio è immediato. Verifica dedicata:
`rtk node scripts/check-wii-handoff.cjs` (home, After Hours, mobile ridotto).
Provenienza dei banner: [NOTICE.md](NOTICE.md).

Quattro pagine Wii; Opzioni Wii, tre pagine delle impostazioni e dodici voci;
Gestione dati, Canali, Dati salvati Wii/GameCube e supporti; SD virtuale vuota
con venti pagine; bacheca, calendario, lettura, creazione e rubrica; HOME,
impostazioni telecomando e riavvio. Operazioni sui dati, hardware e servizi
Nintendo terminano in WIP. Gli spazi vuoti non sono controlli interattivi.

Le nove miniature e le anteprime Nintendo usano texture e BRLYT/BRLAN italiane
renderizzate offline a 30 fps, con immagine statica per movimento ridotto/pausa.
Audio delle anteprime estratto dai rispettivi sound.bin. Avviso,
cifre, cornici e icone provengono dalle risorse PAL 4.3E. Font originale
Wii NTLG PGothic, sottoinsieme WOFF2 della collezione Opera WiiNTLG-Regular.ttc.
Il puntatore attivo è la stessa manina Macrowave del portfolio e di After Hours,
gestita da `wiiuPointer`: rimane sopra il dialogo e durante la dissolvenza.
Dimensioni e hotspot restano uguali; i controlli touch non generano un cursore.
L'opzione Wii Remote/Sistema di After Hours è condivisa tra tutte le pagine.
Provenienza, hash e trasformazioni: `original/manifest.json` e
`original/native/asset-map.json`. Il banner/disco OAKVX è personalizzato.

Premi A abilita l'audio in assenza di preferenza; silenzio salvato rispettato.
L'unico AudioContext rimane di wiiuSound; la scena Wii sospende musica e toni
del portfolio. Menu, bacheca, impostazioni e SD condividono il loop di sistema.
Mute, pausa, scheda nascosta e chiusura fermano le sorgenti. La chiusura libera
richieste, buffer, timer, listener e osservatori del modulo Wii.
Errori delle immagini mostrano il nome del canale; errori audio non bloccano
la navigazione. Moduli/CSS mancanti restituiscono il portfolio; il watchdog
gestisce lo script mancante. Senza JavaScript il portfolio resta disponibile.

Servire dist su http://127.0.0.1:8005, poi `rtk node scripts/check-wii-menu.cjs`.
PORTFOLIO_ORIGIN consente un'altra origine. Risultati, screenshot e registrazioni:
`output/playwright/wii-reconstruction/`; regressioni d'integrazione:
`output/playwright/boot-integration/review/`. Le quattro incompatibilità statiche
preesistenti di After Hours sono registrate come baseline.
Verifica finale: 394 controlli browser superati, 149 hash di risorse verificati;
zero nuovi errori statici. Report completo: `output/playwright/wii-reconstruction/REVIEW.md`.

Le risorse originali non certificano equivalenza pixel per pixel. Zoom,
caricamento del disco, transizioni di sistema, calendario, gestione dati e varie
schermate secondarie sono ricostruzioni web. Il ramo senza dati di Nintendo e
Concorsi Mii è ricostruito dalle tracce disponibili, senza servizi online.
Una registrazione sincronizzata della console PAL italiana rimane necessaria
per certificare integralmente tempi e sequenze delle animazioni.
