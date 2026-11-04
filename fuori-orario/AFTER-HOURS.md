# AFTER HOURS — 1:1 recreation of the Wii Homebrew Channel (v1.1.3)

Documento di lavoro: analisi dei riferimenti, architettura e note di licenza.

---

## FASE 1 — Reference analysis

Fonti usate (verificabili, non ricordi):

1. **Screenshot ufficiali WiiBrew** — `wiibrew.org/wiki/Homebrew_Channel` (sezione *Screenshots*):
   `Homebrew_Channel_apps.png` (schermata principale, modalità griglia), `Homebrew_Channel_options.png`
   (dialogo *Options*), `Homebrew_Channel_menu.png` (menu HOME), `Homebrew_Channel_app_launch_example.png`
   (schermata informativa applicazione).
2. **Codice sorgente HBC 1.1.x** — repo `github.com/fail0verflow/hbc` (GPL-2.0). Le misure qui sotto non sono
   stimate a occhio: sono lette dalle costanti del programma (`browser.c`, `dialogs.c`, `m_main.c`,
   `widgets.c`, `bubbles.c`, `config.h`, `font.c`) e dalle dimensioni delle texture del tema di default
   (`channelapp/data/*.png`).
3. **Tema di default** "Dark Water by drmr": tavolozza campionata da `background_wide.png`
   (campionamento pixel dei valori RGB, non copia del file).

### Schermo virtuale

| Modalità | Viewport logico | Colonne griglia | Fonte |
|---|---|---|---|
| Widescreen 16:9 | 852 × 480 | 4 | `view_width = 852`, `browser_switch_mode()` |
| 4:3 | 640 × 480 | 3 | `view_width = 640`, `browser_switch_mode()` |

### Geometria della schermata principale (unità Wii, y verso il basso)

| Elemento | Valore | Fonte |
|---|---|---|
| Icona applicazione | 128 × 48 | standard HBC (`icon.png`) |
| Piastra griglia | 144 × 64 (icona a 8,8) | `apps_grid.png`, `APP_ENTRY_ICON_X/Y = 8` |
| Piastra lista | 432 × 64 | `apps_list.png` |
| Testo lista — nome | x=156, y=8, font 20 bold | `APP_ENTRY_TEXT1_*`, `font.c` |
| Testo lista — descrizione | x=156, y=54, font 16 bold, allineato al descender | `APP_ENTRY_TEXT2_*` |
| Griglia: origine | x = (W − 144·col)/2, y = 64; passo 144 / 64 | `browser_gen_view()` |
| Righe per pagina | 5 (max 20 app in 16:9, 15 in 4:3) | `#define ROWS 5` |
| Frecce pagina | 64 × 64, sinistra x=24, destra x=W−24−64, y=192 | `browser_theme_reinit()` |
| Icone stato rete/gecko | 32 × 32, y=412, a destra con margine 32 | `browser_theme_reinit()` |
| Wordmark canale | 320 × 64 in (0, 416) | `view_theme_reinit()`, `logo.png` |
| Transizione pagina | 20 step, x = 156·(cos−1) per le frecce, ±W/2 per le righe, **stagger per riga** (π/14 di passo) | `browser_gen_view()` |

### Schermate

* **Dialogo applicazione** — pannello 520 × 360 a `y = 44`, centrato. Titolo centrato (32,16) 20 bold;
  icona a (32,48); versione e autore a x=176, y=72 (`Versione:` sopra, `Autore:` sotto); blocco descrizione
  a (32,104), 520−64 di larghezza, font 16 regolare, con frecce di scorrimento 32×8; tre pulsanti
  132 × 48 in basso a y=296 con gap (520−3·132)/4 = 31.
* **Options** — stesso pannello. Titolo; etichetta `Periferica:` a (32,60) con 2×2 pulsanti 200×48
  a (52,64) (268,64) (52,128) (268,128); etichetta `Ordina applicazioni per:` a (32,212) con due pulsanti
  a (52,216) e (268,216); `Ok` (32,296) e `Indietro` (288,296).
* **Menu HOME** (`m_main.c`) — pulsanti 340 × 48 centrati, y = 80 / 128 / 176 / 224 (passo 48+32).
  In alto a sinistra una riga di stato, in alto a destra versione del canale e versione IOS (16 bold).
* **Fade dei dialoghi** (`dialog_fade()`) — il pannello entra da `y = viewport` verso `y = 44` con easing
  sinusoidale in 20 step, mentre la maschera scura (`#101010` α 0xA0) sfuma.
* **Testi**: Droid Sans / Droid Sans Bold, 16 px (label, memo, descrizioni) e 20 px (titoli, nomi, pulsanti).
  Il canale originale usa esattamente questi due file TTF (Apache-2.0).
* **Pulsanti disabilitati**: overlay bianco al 33% (`WIDGET_DISABLED_COLOR = 0xFFFFFF54`).
* **Bollicine** (`bubbles.c`): 3 sprite 64×64, scala 0.4–1.0, velocità 1.2–5.2 px/frame, oscillazione
  sinusoidale con ampiezza 3.0+ e passo 2π/(64…128) rad/frame; numero variabile fra 4 e 20 secondo
  l'ora del giorno (minimo alle 04:00, massimo alle 16:00); scoppiano al passaggio del puntatore
  generando 5–10 bollicine figlie.
* **Puntatore** (`cursors.c`): texture 96×96 con **hotspot al centro**, ombra offset (+2,+4), rotazione
  libera; si nasconde quando non c'è IR (nella versione web: quando si usa la tastiera o il touch).

### Tavolozza acqua (campionata da `background_wide.png`)

```
y=0%   #1876a5     y=25%  #12587c     y=50%  #0a3044
y=8%   #166d99     y=33%  #104f6e     y=67%  #04161e
y=16%  #14628a     y=42%  #0e445f     y=83%  #000203 → y=100% #000000
```

### Cosa NON è nell'originale (e quindi non è stato aggiunto)

Glassmorphism, card, sidebar, player audio, notifiche, ombre "moderne", gradienti neon, icone a linea
animate, hover con scale/spring. L'unico movimento è: bollicine, pulsazioni della piastra selezionata,
transizioni a coseno/seno, fade delle maschere.

---

## Architettura della riedizione

```
fuori-orario/
├── index.html                 interfaccia console (AFTER HOURS)
├── classic/index.html         archivio della versione precedente della pagina (contenuti intatti)
├── AFTER-HOURS.md             questo documento
└── ../assets/after-hours/
    ├── after-hours.css        piastre, dialoghi, tipografia, layout in unità Wii
    ├── ah-data.js             contenuti reali del portfolio + stringhe interfaccia IT/EN
    ├── ah-water.js            acqua procedurale (gradiente, caustiche, raggi, bollicine)
    ├── ah-ui.js               schermate, puntatore, input, macchina a stati
    └── fonts/droid*.woff2     Droid Sans / Droid Sans Bold (subset, Apache-2.0)
```

* Unità: la schermata è disegnata in **unità Wii** e scalata con la variabile CSS `--u`
  (`calc(N * var(--u))`), così il testo resta nitido e la composizione identica.
* Tutto il resto è DOM + Canvas 2D, zero dipendenze.
* L'acqua è **ricostruita proceduralmente** (gradiente multi-stop campionato, caustiche da rumore,
  fasci di luce, bollicine con fisica dell'originale): nessuna immagine del tema viene ridistribuita.

## FASE 8 — Contenuti

Le otto applicazioni sostituiscono le app homebrew; ogni voce contiene **solo** informazioni presenti
nella pagina *Fuori orario* (bio, quattro pilastri, lingue, GitHub, console moddate, giochi preferiti,
progetti pubblicati, parola del giorno, competenze e FAQ della scrivania) e nei relativi link già
presenti nel sito. Nessun dato è inventato.

## Licenza / crediti

* Homebrew Channel © Team Twiizers / fail0verflow — **GPL-2.0**, `https://github.com/fail0verflow/hbc`.
  Da lì derivano le misure, i tempi e i comportamenti reimplementati, e i due font Droid Sans
  (Apache-2.0). Nessun file grafico del tema è ridistribuito: piastre, pulsanti, dialoghi, bollicine e
  puntatore sono ricostruiti in CSS/Canvas/SVG.
* AFTER HOURS è un'opera autonoma che *cita* l'interfaccia del canale; il marchio Nintendo/Wii e il
  logo Homebrew Channel appartengono ai rispettivi titolari e non sono usati qui.

---

## Inventario e isolamento delle modifiche

La pagina precedente è conservata in `classic/index.html` (percorsi relativi
adeguati alla sottocartella). Home, `/chi-sono/`, `/projects/*` e gli asset
condivisi non sono modificati.

| Contenuto preesistente | Destinazione |
|---|---|
| Bio e quattro pilastri | ABOUT ME |
| Brat Animator, Synk, Beautify, Format SRL | PROJECTS |
| 3DS, Wii U, Wii, PS4 | CONSOLES |
| Rayman Legends, Yo-kai Watch 2, Just Dance 2017 | GAMES |
| Bio IT/EN/ES/EL, mail precompilate, livelli (anche cinese A2) | LANGUAGES |
| oakvx + oakvxish, conteggi commit pubblici | GITHUB |
| Strumenti, competenze, FAQ della scrivania | TOOLS |
| Curiosità e parola del giorno | CURIOSITY |

Dipendenze precedenti: `github-stats.js`, `polaroid/fuori-orario.js`,
`avatars/{avatar,poses,companion}.js`, `wiiu/{sound,music,pointer,dialogs}.js`
e il sistema CSS/i18n condiviso. Restano nella versione classica e nelle altre
pagine. Nella console non vengono caricati per evitare due gestori di input,
due puntatori e stili incompatibili. Il conteggio GitHub usa gli stessi due
account, endpoint e cache oraria; la parola quotidiana riusa l'elenco esistente
e il calcolo della data Europe/Rome. Audio e companion della vecchia interfaccia
restano accessibili nella versione classica, non si sovrappongono al canale.

## Registro delle dieci fasi

1. **Riferimenti:** screenshot WiiBrew, sorgente HBC e dimensioni del tema;
   misure riportate nelle tabelle sopra.
2. **Intro:** acqua, comparsa del wordmark, movimento alla posizione finale e
   ingresso del browser. Nessun asset video Nintendo distribuito.
3. **Ambiente:** Canvas 2D con palette campionata, due strati di caustiche,
   raggi sfumati, tre sprite procedurali di bollicine e scoppio al puntatore.
4. **Browser:** griglia iniziale (come `xml.c:394`), 4/3 colonne, lista a cinque
   righe, pagine successive, piastre e tipografia in coordinate Wii.
5. **Puntatore:** mano e ombra SVG, hotspot centrale, hover; nascosto su touch
   e durante la navigazione da tastiera.
6. **Dettagli:** pannello 520×360, browser oscurato dietro al pannello, autore,
   versione solo se disponibile, descrizione scorrevole, Link/Apri/Indietro.
7. **Navigazione:** HOME, informazioni, opzioni, ordinamento, cambio vista,
   frecce pagina, spegnimento/riaccensione locale, mouse e tastiera.
8. **Contenuti:** otto app, testi e collegamenti del portfolio; mantenuti
   mail, progetti, profili GitHub, livelli e parola quotidiana.
9. **Responsive:** schermo logico 852×480 oppure 640×480 senza ritagli;
   lettura dei contenuti dopo Apri adattata al telefono. Su touch, una riga
   esterna allo schermo espone i tasti fisici HOME/1/2/−/+/B, senza aggiungere
   schermate o menu. In orizzontale lo schermo lascia spazio a questi tasti.
10. **Verifica:** confronto manuale di griglia, lista, dialoghi e menu con le
    immagini di riferimento; verifiche automatiche Chromium descritte sotto.

### Verifica eseguita

Viewport: 1280×720, 1024×768, 390×844 touch, 844×390 touch.
Per ciascuno: otto cicli selezione → dettaglio → Apri → scorrimento → Indietro;
gradi di colonne e contenimento nello schermo; lista con cinque app nella
prima pagina e tre nella seconda; opzioni, HOME, informazioni e resize con
scheda aperta. Nessun errore JS né 404 sulle risorse locali nei test.

La verifica del conteggio commit usa risposte API simulate e controlla la
somma, senza inserire valori fittizi nel sito. I valori reali dipendono dalla
GitHub API pubblica; in caso di errore o rate limit compare uno stato
"Totale pubblico non disponibile" oppure il valore in cache. La parola del
giorno viene calcolata localmente, senza servizi esterni.

### Precisione e limiti della verifica

Le geometrie principali sono ancorate ai sorgenti. Le texture sono
ricostruzioni procedurali e il wordmark è composto con il nuovo nome:
**non è certificata un'identità pixel-per-pixel**. L'intro è una ricostruzione
web, non una sequenza convalidata frame per frame contro un'acquisizione
video della versione Wii. I test non sostituiscono una verifica su dispositivi
fisici né una prova Safari/Firefox. La schermata di lettura dopo Apri e i tasti
touch sono adattamenti al portfolio/browser, non schermate presenti su Wii.

### Licenza aggiornata

Il codice dell'interfaccia in `ah-ui.js`, `ah-water.js` e `after-hours.css`
è distribuito sotto **GPL-2.0-only**, includendo `COPYING`, attribuzioni e
sorgenti completi non minificati. Per i font è incluso il testo Apache-2.0.
Vedere `assets/after-hours/NOTICE.md`; questa precisazione prevale sulla
precedente descrizione generica di "opera autonoma".

### Uso e pubblicazione

Nessuna build: pubblicare i file mantenendo i percorsi relativi. Aprire
`/fuori-orario/` tramite un server HTTP o GitHub Pages.

Tastiera: **1** opzioni, **2** lista/griglia, **HOME** menu, **←↑↓→** selezione
(o scorrimento descrizione), **Invio/Spazio** conferma, **Esc/Bksp** indietro,
**+/−** oppure **PageDown/PageUp** pagina. Tab resta disponibile sui pulsanti.
Mouse: selezione diretta, rotellina/trascinamento per leggere.

Le modifiche sono locali al workspace: non è stato effettuato alcun push né
pubblicazione sul sito GitHub Pages dell'autore.

## Aggiornamento — avvio del canale

La precedente intro a wordmark è stata sostituita da un renderer Canvas separato
con salita dell'acqua, onde multilivello, titolo, completamento e transizione.
Vedere **[CHANNEL-BOOT.md](CHANNEL-BOOT.md)** per analisi dei video, keyframe,
stati `CHANNEL_BOOT` / `HOMEBREW_INTERFACE`, registrazioni e verifiche.
Questa nota aggiorna i precedenti riferimenti alla vecchia intro; il menu non
è stato modificato da questo intervento.
