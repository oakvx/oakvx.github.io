# oakvx — home «Polaroid»

Ciao Gabriele, questa è la tua home rifatta: i contenuti sono quelli del tuo
sito, la struttura si ispira a neutomni.com e lo stile viene dalla tua scheda
social (nero, cinque strisce, Archivo larghissimo con l'ombra arcobaleno),
portato verso le Polaroid degli anni Settanta.

## Come vederla

- **Doppio clic su `index.html`**: funziona, link alle pagine interne compresi.
- **Meglio con un server**, come sarà online: dalla cartella
  `npx serve .` oppure `python -m http.server 8080`, poi http://localhost:8080/

## Cosa c'è di nuovo

| File | Cosa |
| --- | --- |
| `index.html` | la home nuova (sostituisce la vecchia) |
| `assets/polaroid/site.css` | stile della home: colori, Polaroid, sezioni, larghezze |
| `assets/polaroid/site.js` | tutto il movimento e l'inglese, senza librerie |
| `assets/polaroid/permanent-marker.woff2` | il carattere scritto a mano delle didascalie (Apache 2.0, licenza accanto) |

Il resto (`chi-sono/`, `projects/`, `404.html`, `oakvx.css`, `oakvx.js`,
immagini, font) è il tuo `dist` di prima. Le pagine interne hanno ancora lo
stile vecchio. In ogni pagina c'è solo uno script di una riga in fondo che fa
funzionare i link quando apri i file con un doppio clic.

## Le sezioni

1. **Caricamento**: «sviluppo in corso» fino a 100, poi «gl.» si strappa a metà.
   Solo alla prima visita della sessione; mai con «riduci movimento».
2. **Testata**: il nome come nella scheda social; la Polaroid esce dalla
   fessura e si sviluppa, con il timbro della data di oggi. Il tasto rosso la
   rifà uscire.
3. **Codice + Grafica + Dati = Gabriele**.
4. **Chi sono**, su carta crema.
5. **Percorso**: un quadrato a strisce rotola su una strada a gobbe (archi di
   catenaria, il trucco della ruota quadrata) e tappa dopo tappa diventa una
   ruota. Canvas, in `initJourney()`.
6. **Progetti**: da 1000 px in su le foto escono dalla macchina e si
   sviluppano mentre scorri; sotto, un carosello che si scorre di lato.
7. **Strumenti**: un vecchio computer con le finestre trascinabili (da
   1240 px): competenze con schede che si girano, il tuo terminale,
   FAQ.md, gabriele.png, strumenti/.
8. **Contatti**: un quadrato-macchina che rotola e diventa un obiettivo;
   cliccandolo si apre l'email.
9. **Piè di pagina**: «oakvx» con la «o» che passa da quadrato a cerchio.

## Da sapere

- **Italiano e inglese** come prima: italiano nell'HTML, inglese nel
  dizionario `EN` in cima a `site.js`; `?lang=en` e la scelta salvata.
- **Calma**: con «riduci movimento» del sistema o il tasto di pausa in alto,
  percorso e progetti diventano statici e le animazioni si fermano.
- **Senza JavaScript** la pagina si legge tutta.
- **Testi**: tutti presi dal tuo sito (home, chi sono, oakvx.js). Niente
  prezzi, testimonianze o «disponibile per lavoro»: se li vuoi, li aggiungi tu.
- **Da Neutomni** è presa solo l'idea della struttura: codice, immagini e
  testi sono nuovi.
- Prova a scrivere `caffè` nel terminale.


## Pubblicazione su GitHub Pages

Carica **il contenuto di questa cartella**, non la cartella stessa, nella radice del repository `oakvx.github.io` sul branch configurato per Pages. `index.html`, `robots.txt` e `sitemap.xml` devono essere nella stessa radice. Verifica `https://oakvx.github.io/sitemap.xml` dopo la pubblicazione, quindi invia la sitemap a Google Search Console. La versione inglese è attivata tramite JavaScript (`?lang=en`): per una SEO multilingua ancora più robusta servono pagine HTML statiche in inglese.
