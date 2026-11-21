# Fase 3 — navigazione, HOME e Piazza

| Contenuto | Desktop 1440 × 960 | Tablet 768 × 940 | Mobile 360 × 800 |
|---|---|---|---|
| Home | [Desktop](desktop.jpg) | [Tablet](tablet.jpg) | [Mobile](mobile.jpg) |
| Piazza | [Desktop](piazza-desktop.jpg) | [Tablet](piazza-tablet.jpg) | [Mobile](piazza-mobile.jpg) |

[Overlay HOME](home-menu.jpg) · [404 inglese](404.jpg) · [Video MP4](navigation.mp4). Il video mostra frecce e Tab, HOME e Contatti, i segnalini animati, due fumetti e la 404. Video e screenshot della Piazza usano una risposta GitHub 403 simulata per mostrare il fallback. Le descrizioni e i link sono statici anche senza JavaScript; il valore dell’ultimo push non è inventato.

## Matrice browser

| Ambiente | View Transitions | Tilt | Boot | Fallback |
|---|---|---|---|---|
| Chromium 153, Linux headless | Nativa in navigazione Brat, verificato `pagereveal` con nome condiviso durante il prototipo | Mouse verificato durante il prototipo | Primo avvio, salto, sessione e reduced-motion verificati | Navigazione verificata rimuovendo i due hook nativi e anche senza JS |
| Safari desktop | Non testato su Safari reale | Non testato | Non testato | Non testato |
| Safari iOS | Non testato su iPhone/iPad | Il tilt è intenzionalmente solo mouse; il touch apre la scheda | Non testato | Non testato |
| Firefox | Non testato su Firefox reale | Non testato | Non testato | Non testato |

Il sandbox Linux non dispone di Safari o di un simulatore iOS. L’installazione Playwright di Firefox/WebKit non è riuscita per il blocco in uscita dei CDN dei browser; nemmeno la variante Gecko distribuita su GitHub è scaricabile dal CDN degli asset. Chromium con API disattivate, viewport mobile ed emulazione touch non sono sostituti di quei test.

**Procedura sui browser da verificare:** in una scheda indipendente aprire la preview, registrare browser/OS e durata/skip del boot, ricaricare (nessun secondo boot), provare hover e clic Brat, tornare con Indietro, quindi ripetere con movimento ridotto. Controllare se si vede l’espansione condivisa o solo la dissolvenza. Su iOS verificare il tap, il pulsante Caso studio e la chiusura del pannello; il tap non deve attivare il tilt.

**Test locali di regressione:** roving focus e Tab verso le CTA; H, Esc e focus confinato al dialogo; copia negli appunti; Piazza con risposta API 200 simulata, timeout/403 gestito tramite fallback (403 verificato), un’unica richiesta per documento; bottom sheet da touch; 404 inglese e ritorno; apertura di un fumetto senza JS. `build_static.py` e `check_site.py` verificano anche shell, Piazza e collegamenti.

**Asset e opzioni:** vedi [decisioni sui file senza licenza dichiarata](../../asset-decisions.md). `plazaLive`, `plazaWalk` e `plazaDaylight` sono flag indipendenti in `assets/gl/config.js`. Il canvas è decorativo; i personaggi selezionabili sono controlli HTML. Governo FPS, modalità qualità e gli altri extra non sono stati aggiunti in questa fase.
