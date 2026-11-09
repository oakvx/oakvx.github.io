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
- [Sistema di pagine](#sistema-di-pagine)
- [Internazionalizzazione](#internazionalizzazione)
- [Avatar e movimento ridotto](#avatar-e-movimento-ridotto)
- [Contatore commit GitHub](#contatore-commit-github)
- [Sviluppo locale](#sviluppo-locale)
- [Build e controlli](#build-e-controlli)
- [Crediti](#crediti)

## Stack

| Area | Scelta |
| --- | --- |
| Markup, stile, script | HTML5, CSS3, JavaScript ES (vanilla) |
| Hosting | GitHub Pages (`.nojekyll`, nessuna build Jekyll) |
| Font | Archivo e Cascadia Code, self-hosted in `.woff2` (licenza OFL inclusa) |
| Strumenti | Python 3 (generazione e controlli, solo libreria standard), Node.js 22 in CI |
| Accessibilità | `prefers-reduced-motion`, testi alternativi, nomi accessibili, comando "Ferma animazioni" |
| SEO | Metadati Person, anteprime social per pagina e lingua, `sitemap.xml`, `robots.txt` |

## Struttura del repository

```text
index.html                 home (italiano)
chi-sono/                  pagina "Chi sono"
fuori-orario/              pagina "Fuori orario" (slider IT/EN/ES/EL)
projects/                  case study: autoofficina, beautify, brat-animator, synk
en/                        pagine inglesi GENERATE: non modificare a mano
404.html
assets/
  polaroid/                sistema di pagine condiviso: site.css/js, pages.css, hero.css,
                           fuori-orario.css/js, pages-en.js
  avatars/                 pose (GIF, WebP animato, primi fotogrammi -still.webp), poses.js,
                           companion.js
  cursor.css               puntatore solo CSS
  github-stats.js          contatore di commit pubblici
  CREDITS.html             provenienza dei materiali
scripts/
  build_static.py          genera en/ e sitemap.xml
  check_site.py            controlli statici
  extract-translations.cjs utility Node per le traduzioni
.github/workflows/site-check.yml
```

## Sistema di pagine

Tutte le pagine (home, chi-sono, progetti, fuori-orario, 404, crediti) condividono lo stesso sistema "Polaroid": testata, menu mobile, piè di pagina e token di colore.

- `assets/polaroid/site.css` e `site.js` sono la base comune. Le funzioni della home (hero, percorso, progetti, scrivania) si attivano solo se trovano il proprio markup.
- `assets/polaroid/pages.css` contiene i componenti delle pagine interne; `fuori-orario.css/js` quelli della pagina omonima.
- Dove una pagina ha un proprio `#contatti`, il pulsante «Scrivimi» scorre lì; altrimenti porta ai contatti della home.
- Navigazione di `fuori-orario/`: scroll-snap con tab, frecce e tastiera; hash `#it`, `#en`, `#es`, `#el`.

## Internazionalizzazione

- L'italiano vive nell'HTML sorgente. Titoli e anteprime social sono nel blocco `#seo-translations`.
- Le traduzioni inglesi stanno in `assets/polaroid/site.js` (home) e `pages-en.js` (pagine interne), referenziate con `data-i18n`, `data-i18n-aria` e `data-i18n-alt`.
- `scripts/build_static.py` genera da HTML e dizionari le copie inglesi indicizzabili in `en/` e aggiorna `sitemap.xml`. **Dopo ogni modifica a contenuti o traduzioni va rieseguito**, altrimenti la CI fallisce.

## Avatar e movimento ridotto

- Ogni sezione ha la propria posa; non esiste un selettore globale. `assets/avatars/poses.js` gestisce il cambio posa (hero, polaroid "chi sono", finestra desktop).
- `assets/avatars/companion.js` è l'avatar fisso in basso a sinistra: reagisce allo scroll, balla a fine pagina, si addormenta dopo 25 s di inattività; il click sceglie una posa casuale, × lo nasconde per la sessione.
- Ogni posa ha una copia statica `*-still.webp` (primo fotogramma). Le animazioni si fermano con il comando "Ferma animazioni", con `prefers-reduced-motion` e quando la scheda va in background. Con movimento ridotto l'elemento `<picture>` seleziona la versione statica anche senza JavaScript.
- Le GIF originali sono conservate senza modificare fotogrammi o velocità; le pose più pesanti sono servite come WebP animato.
- `assets/cursor.css`: puntatore interamente CSS, senza JavaScript; i campi di testo mantengono il cursore di testo.

## Contatore commit GitHub

`assets/github-stats.js` mostra in "Fuori orario" il totale dei commit pubblici degli account `oakvx` e `oakvxish`, disegnato come matrice di punti 72×40 con numeri in pixel art.

- Interroga `GET https://api.github.com/search/commits?q=author:<account> is:public&per_page=1` per ciascun account e somma `total_count`; scarta i risultati con `incomplete_results`.
- Chiamate **non autenticate**, quindi soggette ai limiti di frequenza della Search API. Per questo il totale è messo in cache in `localStorage` (chiave `oakvx-public-commit-total-v1`, TTL 1 ora) e, in caso di errore, il nuovo tentativo avviene dopo 5 minuti.
- Ridisegna la matrice al cambio di `lang` e annuncia lo stato tramite regione per screen reader.

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

Provenienza e descrizione dei materiali: [`assets/CREDITS.html`](assets/CREDITS.html). Font con licenza OFL (`Archivo-OFL.txt`, `CascadiaCode-OFL.txt`). Grafiche e avatar sono opera dell'autore.
