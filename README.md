# oakvx.github.io

<p>
  <a href="https://github.com/oakvx/oakvx.github.io/actions/workflows/site-check.yml"><img alt="Site checks" src="https://img.shields.io/github/actions/workflow/status/oakvx/oakvx.github.io/site-check.yml?style=flat-square&label=site%20checks"></a>
  <a href="https://github.com/oakvx/oakvx.github.io/commits"><img alt="Ultimo commit" src="https://img.shields.io/github/last-commit/oakvx/oakvx.github.io?style=flat-square"></a>
  <img alt="Linguaggio principale" src="https://img.shields.io/github/languages/top/oakvx/oakvx.github.io?style=flat-square">
  <img alt="Dimensione repository" src="https://img.shields.io/github/repo-size/oakvx/oakvx.github.io?style=flat-square">
  <img alt="Hosting: GitHub Pages" src="https://img.shields.io/badge/hosting-GitHub%20Pages-64748B?style=flat-square">
  <img alt="Lingue: IT / EN" src="https://img.shields.io/badge/lingue-IT%20%2F%20EN-64748B?style=flat-square">
</p>

Sito portfolio statico di Gabriele Lucia, pubblicato su GitHub Pages: <https://oakvx.github.io/>. HTML, CSS e JavaScript vanilla, **nessun bundler e nessuna dipendenza di runtime**. Bilingue (IT/EN) con pagine inglesi generate e verificate in CI.

## Indice

- [Stack](#stack)
- [Struttura del repository](#struttura-del-repository)
- [Menu d'ingresso](#menu-dingresso)
- [Sistema di pagine](#sistema-di-pagine)
- [Internazionalizzazione](#internazionalizzazione)
- [Sculture di punti e movimento ridotto](#sculture-di-punti-e-movimento-ridotto)
- [Contatore commit GitHub](#contatore-commit-github)
- [Sviluppo locale](#sviluppo-locale)
- [Build e controlli](#build-e-controlli)
- [Crediti](#crediti)

## Stack

| Area | Scelta |
| --- | --- |
| Markup, stile, script | HTML5, CSS3, JavaScript ES (vanilla), WebGL 1 senza librerie |
| Hosting | GitHub Pages (`.nojekyll`, nessuna build Jekyll) |
| Font | Fraunces (display), Archivo variabile con asse di larghezza (testo), Cascadia Code (metadati), self-hosted in `.woff2` con licenze OFL |
| Strumenti | Python 3 (generazione e controlli, solo libreria standard), Node.js 22 in CI |
| Accessibilità | `prefers-reduced-motion`, comando "Ferma animazioni", focus visibile, menu con focus intrappolato, ripieghi senza WebGL |
| SEO | Metadati Person, anteprime social per pagina e lingua, `sitemap.xml`, `robots.txt` |

## Struttura del repository

```text
index.html                 home (italiano)
chi-sono/                  pagina "Chi sono"
fuori-orario/              pagina "Fuori orario" (classic/ rimanda alla nuova)
projects/                  casi studio: autoofficina, beautify, brat-animator, synk
gioco/                     il gioco in 3D (indipendente dal sito)
en/                        pagine inglesi GENERATE: non modificare a mano
404.html
assets/
  nero/                    sistema "Nero": nero.css, nero.js, campo.js (WebGL),
                           i18n-en.js (dizionario inglese), fonts/
  ingresso/                menu d'ingresso Sito/Gioco
  avatars/                 pose del Mii (GIF, WebP, primi fotogrammi -still.webp)
  work/, fuori-orario/     immagini dei progetti e di Fuori orario
  github-stats.js          contatore di commit pubblici
  CREDITS.html             provenienza dei materiali
  polaroid/, wiiu/, after-hours/
                           sistemi della versione precedente, non più collegati dalle pagine
scripts/
  build_static.py          genera en/ e sitemap.xml
  check_site.py            controlli statici
  extract-translations.cjs legge DYN da nero.js e il dizionario da i18n-en.js
.github/workflows/site-check.yml
```

## Menu d'ingresso

Alla prima pagina aperta in una sessione compare un menu a tutto schermo ("Ciao, sono oakvx.") con due scelte: **Sito** chiude il menu e lascia la pagina richiesta, **Gioco** apre `/gioco/`. Vive in `assets/ingresso/` (`ingresso.css`, `ingresso.js`), con un piccolo bootstrap in `<head>` in tutte le pagine pubbliche.

- Una volta per sessione (`sessionStorage`, chiave `oakvx-ingresso`); mai ai crawler; senza JavaScript la pagina si vede subito.
- Se lo script non parte entro 4 s la pagina viene sbloccata comunque.
- Esc equivale a "Sito". Per provarlo: `?ingresso=1`; per saltarlo: `?ingresso=0`.

## Sistema di pagine

Le pagine italiane si **generano** da `scripts/pagine/`: `testata.html` e `colophon.html` sono uguali per tutte, `corpi/*.html` contiene il corpo di ciascuna. Dopo una modifica:

```bash
python3 scripts/genera_pagine.py   # riscrive le pagine italiane, conservando i metadati SEO
python3 scripts/build_static.py    # rigenera en/ e sitemap.xml
```

Tutte le pagine (home, chi-sono, casi studio, fuori-orario, 404, crediti) usano lo stesso sistema "Nero": nero `#050505`, bianco caldo `#E8E6E1`, accento cremisi `#C81035`, grafite `#292929`. Direzione e regole sono descritte in `docs/superpowers/specs/2026-11-26-sito-nero-design.md`.

- `assets/nero/nero.css` contiene token, tipografia, testata, indice, colophon e le composizioni di ogni pagina. Ogni caso studio ha la propria impaginazione (`[data-progetto]`).
- `assets/nero/nero.js` gestisce lingua, ora di Sassuolo, indice a tutto schermo, sipario tra le pagine, cursore, rivelazioni, anteprime dei lavori, copia dell'email, terminale `portfolio.sh` e i momenti interattivi dei casi studio (lyric video, flusso di Synk, orari di Beautify, luce di Spinotto Felice). Ogni modulo parte solo se trova il proprio markup.
- Testata, indice e colophon stanno una volta sola in `scripts/pagine/`.
- Il sipario usa `sessionStorage` (`nero-velo`) per mostrare numero e titolo della pagina di arrivo.
- Le misure fluide usano l'unità `--u = min(1vw, 1.9vh)`: su un monitor largo e basso seguono l'altezza, così titoli e spazi restano in proporzione; oltre 1680px il contenuto resta centrato.
- Esperienza in home: scroll morbido con inerzia (solo rotella), apertura che si scompone scorrendo (`--uscita`), nastro di testo legato alla velocità dello scroll; scegliendo "Sito" nel menu d'ingresso la scultura si ricompone e le lettere salgono. Tutto si spegne con movimento ridotto o "Ferma animazioni".

## Internazionalizzazione

- L'italiano vive nell'HTML sorgente. Titoli e anteprime social sono nel blocco `#seo-translations`.
- Le traduzioni inglesi stanno in `assets/nero/i18n-en.js`, referenziate con `data-i18n`, `data-i18n-html`, `data-i18n-aria` e `data-i18n-alt`; i testi creati da JavaScript sono nel blocco `DYN` di `nero.js`.
- `scripts/build_static.py` genera da HTML e dizionario le copie inglesi indicizzabili in `en/` e aggiorna `sitemap.xml`. **Dopo ogni modifica a contenuti o traduzioni va rieseguito**, altrimenti la CI fallisce.
- Il cambio lingua porta alla pagina reale nell'altra lingua e ricorda la scelta (`localStorage`, chiave `lang`).

## Sculture di punti e movimento ridotto

- `assets/nero/campo.js` disegna nuvole di punti in WebGL: la scultura organica della home (generata dal codice), il Mii in sei pose in "Chi sono" (letto dai `*-still.webp`) e il 404. Le forme si dichiarano in `data-forme`.
- Tenere premuto (mouse, touch, Invio o Spazio sul pulsante) fa esplodere i punti e li ricompone nella forma successiva; un tocco breve cambia forma senza esplosione.
- Numero di punti e risoluzione si riducono su schermi piccoli e dispositivi modesti; il disegno si ferma fuori schermo e con la scheda in background. Senza WebGL resta un ripiego statico.
- Con `prefers-reduced-motion` o "Ferma animazioni" (chiave `motion` in `localStorage`) spariscono sipario, rivelazioni e animazioni continue; le sculture restano ferme ma cambiano ancora forma.

## Contatore commit GitHub

`assets/github-stats.js` mostra in "Fuori orario" il totale dei commit pubblici degli account `oakvx` e `oakvxish`, disegnato come matrice di punti 72×40 con numeri in pixel art.

- Interroga `GET https://api.github.com/search/commits?q=author:<account> is:public&per_page=1` per ciascun account e somma `total_count`; scarta i risultati con `incomplete_results`.
- Chiamate **non autenticate**, quindi soggette ai limiti di frequenza della Search API. Per questo il totale è messo in cache in `localStorage` (chiave `oakvx-public-commit-total-v1`, TTL 1 ora) e, in caso di errore, il nuovo tentativo avviene dopo 5 minuti.
- Ridisegna la matrice al cambio di `lang` e annuncia lo stato tramite regione per screen reader.

## Commit del sito e profili social

- **Commit del sito** (home, sezione "Questo sito"): totale, giorni di lavoro e istogramma per giorno dei commit di questo repository. `nero.js` li legge dall'API pubblica di GitHub (`/repos/oakvx/oakvx.github.io/commits`, cache di un'ora in `localStorage`, chiave `oakvx-commit-sito-v1`); senza rete restano i valori scritti nella pagina alla pubblicazione.
- **Profili social** (Fuori orario): TikTok @oakvx.sh e @uvst.oakvx si aggiornano da soli. La GitHub Action [`social.yml`](.github/workflows/social.yml) esegue ogni ora `scripts/social.mjs`, che legge solo i conteggi pubblici e l'avatar e aggiorna `assets/social/social.json`; il commit parte solo quando un valore cambia, e se una piattaforma non risponde resta l'ultimo valore valido.
- Instagram @oakvx non mostra i conteggi senza accesso, quindi si aggiorna a mano in `assets/social/manuale.json` (follower, seguiti, post, data). Finché `follower` è `null` la card Instagram resta nascosta.
- Le storie e i video da mostrare nelle card si scelgono a mano in `assets/social/scelte.json`: per ogni account un elenco di `{ "tipo", "titolo", "immagine", "link" }`, con le immagini in `assets/social/scelte/`.

## Sviluppo locale

Nessun pacchetto da installare:

```bash
python3 -m http.server 8000
```

Aprire `http://localhost:8000/`. Il sito resta compatibile con GitHub Pages.

## Build e controlli

```bash
python3 scripts/build_static.py   # rigenera en/ e sitemap.xml
python3 scripts/check_site.py     # nessuna dipendenza aggiuntiva
```

`check_site.py` verifica: sintassi JavaScript, link e immagini locali, testi alternativi e nomi accessibili dei controlli, metadati SEO, sitemap e presenza delle pagine IT/EN.

La CI ([`site-check.yml`](.github/workflows/site-check.yml), su push, pull request e avvio manuale, permessi `contents: read`) esegue gli stessi controlli e inoltre rigenera `en/` e `sitemap.xml`, fallendo se `git status` mostra differenze: le pagine generate devono essere committate.

## Crediti

Provenienza e descrizione dei materiali: [`assets/CREDITS.html`](assets/CREDITS.html). Font con licenza OFL (`assets/nero/fonts/Fraunces-OFL.txt`, `assets/nero/fonts/Archivo-OFL.txt`, `assets/CascadiaCode-OFL.txt`). Grafiche, avatar e sculture di punti sono opera dell'autore.
