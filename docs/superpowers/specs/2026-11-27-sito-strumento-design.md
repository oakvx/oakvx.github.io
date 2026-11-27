# Sito "Strumento": banco di lavoro, tono cinico, transizione a proiettile

Seconda iterazione del sito "Nero". Il gioco in `/gioco/` non si tocca.

## Perché

oakvx trova il sito attuale corretto ma non abbastanza bello né abbastanza suo: lo vuole **diverso**.
Fra tre bozze (Galleria, Laboratorio, Rivista) ha scelto la **Laboratorio**, a due condizioni:
niente diciture forzate e un tono preciso. Il sito deve trasmettere una persona brava che non ha bisogno
di dimostrarlo: **cinico ma simpatico, leggero, nonchalant, un po' gatekeeper** (solo come atteggiamento).

## Obiettivi

1. **Banco di lavoro come linguaggio visivo**: griglia sottile su tutto il sito, la scultura di punti
   come oggetto centrale (con cerchio di misura e mirino cremisi), numeri dal vivo accanto all'oggetto,
   progetti in colonne separate da filetti. Coerente su tutte le pagine.
2. **Testi riscritti in tutto il sito** nel nuovo tono, tenendo tutti i fatti veri (vedi "Tono").
3. **Transizione tra pagine a proiettile**: una pistola 3D vera spara, il proiettile attraversa lo schermo,
   dietro lascia un fascio di luce con dentro "oakvx.", il fascio copre la pagina e si apre sulla successiva.

## Non-obiettivi

- Nessuna etichetta da laboratorio: niente "lab", "exp.01", "obj.01", "esperimenti". I progetti si chiamano col loro nome.
- Nessun contenuto davvero bloccato: "gatekeeper" è solo tono.
- Nessun sito a pagina unica: si resta su pagine statiche (vedi Approcci).
- Nessun suono.

## Anti-obiettivi (fallimento anche se funziona)

- Testi cringe: entusiasmo da LinkedIn, autocelebrazione, spiegoni, battute forzate.
- Aspetto da dashboard: riquadri-widget, grafici colorati, troppi numeri.
- Pistola da videogioco o violenta: niente bersagli, persone, sangue, rinculo esagerato. È un gesto secco ed elegante.
- Navigazione rallentata: la transizione non deve far aspettare più di circa un secondo, e non deve mai bloccare.

## Vincoli

- GitHub Pages statico, nessun bundler, nessuna dipendenza di runtime nuova oltre a three.js già presente.
- Italiano nell'HTML, inglese generato in `/en/` da `scripts/build_static.py` con il dizionario `assets/nero/i18n-en.js`; la CI rigenera e confronta.
- Palette invariata (nero #050505, bianco caldo #E8E6E1, cremisi #C81035, grafite #292929), niente vetro.
- Font invariati: Fraunces, Archivo, Cascadia Code.
- `prefers-reduced-motion` e "Ferma animazioni" spengono transizione e animazioni; tutto resta usabile da tastiera e senza WebGL.
- Misure fluide con l'unità `--u = min(1vw, 1.9vh)` già introdotta (PR #20).

## Approcci considerati

1. **Evolvere il sito attuale** (scelto). Restano pagine, build IT/EN, controlli e componenti; cambiano stile,
   testi e transizioni. La pistola è 3D in tempo reale, caricata in sottofondo. Contro: la pagina si ricarica,
   quindi la pistola compare solo all'uscita; all'arrivo c'è solo il fascio che si apre.
2. **Sito a pagina unica**: transizione continua senza ricarica, ma va rifatta navigazione, generazione inglese e SEO. Scartato: troppo rischio per un guadagno poco visibile.
3. **Pistola pre-registrata** in video: leggera e identica ovunque, ma è un filmato, non un oggetto illuminato; peso simile. Scartato.

oakvx ha scelto la 1.

## Decisioni prese con oakvx

- Direzione B "Laboratorio", senza diciture da laboratorio.
- Tono cinico ma simpatico, leggero, nonchalant, gatekeeper solo come atteggiamento.
- Transizione: pistola **3D vera** (asset scaricato), proiettile, fascio con "oakvx.".
- Approccio 1.

## Proposte del builder (da confermare leggendo)

### Linguaggio visivo

- **Griglia**: linee a 1px, `rgb(232 230 225 / .05)`, passo 120px su desktop e 80px su mobile, allineata alle colonne;
  fissa sotto il contenuto (non scorre con la pagina) per dare l'idea di un piano di lavoro.
- **Mirino**: piccole croci a 1px agli incroci principali e il mirino cremisi sulla scultura in home; i bordi dei blocchi
  hanno angoli segnati (quattro tacche) invece di riquadri pieni.
- **Apertura della home**: a sinistra "oakvx" grande in Archivo compresso (come nella bozza B), a destra un pannello stretto
  di numeri dal vivo: commit di questo sito con piccolo istogramma, follower TikTok @oakvx.sh, ora di Sassuolo, ultimo commit.
  Al centro la scultura con cerchio di misura e mirino. Nessuna cornice da widget: solo filetti e testo mono.
- **Progetti**: colonne separate da filetti verticali che arrivano fino al fondo della sezione, con immagine in scala di grigi
  che si colora al passaggio. Restano le pagine dei casi studio con i loro momenti interattivi, ristilizzate nello stesso linguaggio.
- **Annotazioni**: brevi note mono accanto agli oggetti (frecce sottili, una riga), usate con parsimonia: massimo due per schermata.
- La sezione "Questo sito" e le card TikTok diventano parte del pannello di numeri e di Fuori orario nello stesso stile.

### Tono (esempi, da tarare sui testi veri)

Regole: frasi corte, prima persona, ironia asciutta che punta a se stesso o alla situazione, mai al visitatore;
nessun superlativo; i fatti restano esatti.

- Home, sotto il nome: «Faccio siti e software. Funzionano. Il resto lo vedi da solo.»
- Lavori: «Quattro progetti. Ne avrei altri, ma questi reggono.»
- Chi sono: «Ho iniziato smontando programmi per vedere cosa c'era dentro. Non ho ancora smesso, e nessuno me l'ha chiesto.»
- Contatti: «Scrivimi. Rispondo. Non subito, ma rispondo.»
- 404: «Qui non c'è niente. Non l'ho perso io.»
- Fuori orario: «Quello che faccio quando nessuno guarda. Più o meno sempre.»

### Transizione a proiettile

- **Asset**: "Service Pistol" di Poly Haven (Mateusz Sadek, CC0, fotoscansione, circa 27.500 poligoni). Si scarica la versione glTF 1k
  e si ricomprimono le texture (diffusa, normale, ARM) in WebP per stare sotto circa 1,2 MB totali. Va in `assets/nero/pistola/`
  con nota in `assets/CREDITS.html` e un `LEGGIMI` con fonte e licenza.
- **Motore**: three.js già presente in `gioco/vendor/three/` (con `GLTFLoader`), importato dinamicamente da lì: nessuna copia.
- **Caricamento**: solo su desktop (puntatore fine, schermo ≥ 900px), con WebGL, senza movimento ridotto; parte dopo il `load`
  quando il browser è inattivo, oppure al primo passaggio su un link interno. Se al clic non è pronto, si usa la versione solo-fascio.
- **Coreografia all'uscita** (circa 900 ms, poi navigazione):
  1. 0 ms: un livello trasparente a tutto schermo; la pistola entra dal bordo sinistro, di profilo, canna verso destra, illuminata di taglio.
  2. ~180 ms: sparo: lampo bianco-caldo alla volata, rinculo breve e asciutto.
  3. 180–480 ms: il proiettile (punto luminoso con alone) attraversa lo schermo da sinistra a destra all'altezza della canna;
     dietro di sé lascia un fascio di luce orizzontale che contiene "oakvx." in Archivo compresso maiuscolo, stirato lungo il fascio.
  4. 480–900 ms: il fascio si allarga verticalmente fino a coprire lo schermo (bianco caldo che vira al nero), la pistola esce.
- **All'arrivo**: la pagina nuova parte coperta da una banda orizzontale con "oakvx." che si apre verso l'alto e il basso (circa 600 ms).
- **Mobile e senza 3D**: stessa sequenza senza pistola: lampo sul bordo, proiettile, fascio, apertura.
- Sostituisce il sipario attuale (`.velo`), compreso il numero e il titolo della pagina di arrivo (che spariscono: il fascio dice già tutto).

## Lasciato al builder

Valori di animazione, griglia e spaziature; come dividere il lavoro fra `nero.css`, `nero.js` e un nuovo modulo per la pistola;
quali testi riscrivere per primi; strumenti per comprimere le texture; dettagli di accessibilità coerenti con quanto già fatto.

## Come verificare

- `python3 scripts/build_static.py` e `python3 scripts/check_site.py` passano; `node --test 'gioco/test/unit/*.test.mjs'` passa.
- Screenshot a 1440×900, 1920×1080, 2560×1440 e 390×844 di ogni pagina.
- Registrazione a fotogrammi della transizione su desktop e su mobile; transizione assente con movimento ridotto.
- Peso aggiunto per pagina misurato: pistola caricata solo su desktop e dopo il `load`.
