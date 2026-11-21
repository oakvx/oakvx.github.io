# Baseline prima del redesign — 2026-11-21

Commit `cc416126f1113328e9735dee62fe7c9a8d17b876`, home IT servita in locale da `python3 -m http.server 8080`. Una navigazione Lighthouse 13.6.0 (profilo mobile predefinito, throttling simulato), Headless Chrome 153.0.8010.0: **Performance 62, Accessibilità 100, SEO 100**. LCP **4,1 s**, TBT **560 ms**, CLS **0**. Non sono dati sul campo.

Profiler Chrome DevTools (CDP `devtools.timeline`): desktop 1440×900, cache di una nuova pagina nello stesso browser, attesa di 3,5 s dopo DOMContentLoaded, senza input. 4.297 eventi, nessun `RunTask` ≥50 ms nel trace desktop non rallentato. Questo non misura la fluidità delle interazioni e non è confrontabile direttamente col TBT mobile simulato.

## Confronto dopo il prototipo

Stesso URL locale, browser, versione Lighthouse e procedura; una singola navigazione per il dato riportato.

| Metrica | Prima | Prototipo |
|---|---:|---:|
| Lighthouse Performance mobile | 62 | 100 |
| Lighthouse Accessibilità mobile | 100 | 100 |
| Lighthouse SEO mobile | 100 | 100 |
| LCP | 4,1 s | 1,3 s |
| TBT | 560 ms | 0 ms |
| CLS | 0 | 0 |
| RunTask ≥50 ms, trace desktop | 0 | 0 |

Trace desktop: 2.215 eventi nel prototipo. Questi valori sono una verifica locale, non un risultato garantito su GitHub Pages o su dispositivi reali. Il trace non è un benchmark FPS; sequenza e transizione sono documentate separatamente dalla registrazione.
