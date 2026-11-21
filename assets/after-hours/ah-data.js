/* ==========================================================================
   AFTER HOURS — data
   Tutti i contenuti provengono dalla pagina "Fuori orario" di oakvx.github.io
   (bio in quattro lingue, pilastri, lingue, GitHub, console moddate, giochi,
   progetti pubblicati, parola del giorno) e dalla scrivania "Strumenti".
   Nessun contenuto inventato.
   ========================================================================== */

window.AH = window.AH || {};

/* ---------- interfaccia: stringhe del canale (IT = it.po di HBC) -------- */
AH.STR = {
  it: {
    options: "Opzioni",
    view: "Vista:",
    grid: "Griglia",
    list: "Lista",
    cursor: "Puntatore:",
    cursorWii: "Wii Remote",
    cursorNative: "Sistema",
    sortBy: "Ordina applicazioni per:",
    name: "Nome",
    date: "Data",
    ok: "Ok",
    back: "Indietro",
    open: "Apri",
    link: "Link",
    about: "Informazioni",
    exit: "Ritorna al Menu di Sistema",
    shutdown: "Spegni",
    version: "Versione: %s",
    author: "Autore: %s",
    theme: "Tema: %s",
    localTime: "Ora locale %s",
    page: "Pagina %s di %s",
    noApps: "Nessuna applicazione",
    scrollHint: "Rotellina, trascina o ↑ ↓ per scorrere",
    powerOff: "Puoi spegnere la televisione.",
    powerOn: "Accendi",
    skipHint: "Premi un tasto per saltare l'introduzione",
    aboutTitle: "Informazioni",
    aboutText:
      "AFTER HOURS è il canale dove finisce quello che resta aperto quando stacco: i progetti personali di Gabriele Lucia (oakvx), le console che ha modificato, i giochi dello scaffale, le lingue e le curiosità.\n\n" +
      "L'interfaccia è una ricostruzione fedele dell'Homebrew Channel 1.1.3 per Nintendo Wii di Team Twiizers (fail0verflow), distribuito con licenza GPL-2.0: misure, tempi e comportamenti vengono dai suoi sorgenti. Le texture del canale originale non sono ridistribuite: acqua, bollicine, piastre, pulsanti e puntatore sono ricostruiti in CSS, Canvas e SVG.\n\n" +
      "Tema: Dark Water (palette campionata dal tema di default).\nFont: Droid Sans e Droid Sans Bold (Apache-2.0).",
    openSection: "Apri l'applicazione",
  },
  en: {
    options: "Options",
    view: "View:",
    grid: "Grid",
    list: "List",
    cursor: "Cursor:",
    cursorWii: "Wii Remote",
    cursorNative: "System",
    sortBy: "Sort applications by:",
    name: "Name",
    date: "Date",
    ok: "Ok",
    back: "Back",
    open: "Open",
    link: "Link",
    about: "About",
    exit: "Exit to System Menu",
    shutdown: "Shutdown",
    version: "Version: %s",
    author: "Author: %s",
    theme: "Theme: %s",
    localTime: "Local time %s",
    page: "Page %s of %s",
    noApps: "No applications",
    scrollHint: "Wheel, drag or ↑ ↓ to scroll",
    powerOff: "You may now turn off the television.",
    powerOn: "Power on",
    skipHint: "Press any key to skip the introduction",
    aboutTitle: "About",
    aboutText:
      "AFTER HOURS is the channel where whatever stays open after hours ends up: Gabriele Lucia's personal projects (oakvx), the consoles he modded, the games on his shelf, languages and curiosities.\n\n" +
      "The interface is a faithful reconstruction of Team Twiizers' Homebrew Channel 1.1.3 for the Nintendo Wii (fail0verflow), released under the GPL-2.0: measurements, timings and behaviour come from its sources. The original channel textures are not redistributed here: water, bubbles, plates, buttons and pointer are rebuilt with CSS, Canvas and SVG.\n\n" +
      "Theme: Dark Water (palette sampled from the default theme).\nFont: Droid Sans and Droid Sans Bold (Apache-2.0).",
    openSection: "Launch application",
  },
};

/* ---------- le otto applicazioni ---------------------------------------- */

AH.apps = [
  /* ------------------------------------------------------------------ 01 */
  {
    id: "about",
    name: "ABOUT ME",
    short: "Fuori orario, in quattro lingue.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    /* ordine di pubblicazione del contenuto nella pagina originale */
    order: 1,
    icon: { img: "/assets/avatars/showingoff-still.webp", fit: "cover", pos: "50% 32%", glyph: null },
    long:
      "Fuori orario scrivo codice che non serve a niente in particolare, soprattutto perché mi piace capire come funzionano le cose. Ogni tanto rifaccio da zero qualcosa che già andava bene, solo perché nel frattempo avevo capito un modo migliore di farla.\n\n" +
      "Il computer resta acceso un po’ più del dovuto. Di solito è così che vanno le cose.\n\n" +
      "Quattro cose che restano aperte quando stacco: progetti personali, interfacce, lingue, curiosità.",
    section: `
      <p class="lead">Cosa resta aperto quando stacco.</p>
      <p>Fuori orario scrivo codice che non serve a niente in particolare, soprattutto perché mi piace capire
        come funzionano le cose. Ogni tanto rifaccio da zero qualcosa che già andava bene, solo perché nel
        frattempo avevo capito un modo migliore di farla.</p>
      <p>Il computer resta acceso un po’ più del dovuto. Di solito è così che vanno le cose.</p>

      <h3>Quattro cose che restano aperte</h3>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">01 / 04 · Tempo libero</p>
          <p class="e-title">Progetti personali</p>
          <p class="e-text">Quasi sempre nascono da un’idea piccola, e finiscono per diventare uno strumento vero,
            con qualche funzione in più di quanto servisse.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">02 / 04 · Dettagli</p>
          <p class="e-title">Interfacce</p>
          <p class="e-text">Sistemo colori, spaziature e piccoli movimenti finché il codice e la grafica non
            sembrano fatti dalla stessa persona.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">03 / 04 · Lingue</p>
          <p class="e-title">Italiano, inglese, spagnolo, greco</p>
          <p class="e-text">Una madrelingua e tre lingue allenate in momenti diversi, per motivi diversi.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">04 / 04 · Curiosità</p>
          <p class="e-title">Una domanda tira l’altra</p>
          <p class="e-text">Parto da una domanda semplice su come funziona qualcosa, e finisco per leggere molto
            più di quanto servisse davvero.</p>
        </div>
      </div>

      <h3>Quando un’idea mi piace davvero</h3>
      <div class="entry">
        <div class="e-thumb"><img src="/assets/avatars/discofever-still.webp" alt=""></div>
        <div class="e-thumb"><img src="/assets/avatars/idlewainting-still.webp" alt=""></div>
        <div class="e-thumb"><img src="/assets/avatars/showingoff-still.webp" alt=""></div>
      </div>
      <p class="word-meta" style="margin-top:-4px">Quando un’idea mi piace davvero, la porto fino in fondo.</p>

      <h3>Stato</h3>
      <dl class="facts">
        <div class="f"><dt>Canale</dt><dd>fuori-orario · attivo</dd></div>
        <div class="f"><dt>Rifinitura</dt><dd>ancora una piccola rifinitura</dd></div>
        <div class="f"><dt>Autore</dt><dd>Gabriele Lucia / oakvx</dd></div>
      </dl>
      <p style="margin-top:14px"><a class="pill-link" href="mailto:gabrielelucia07@gmail.com">Scrivimi ↗</a>
        <a class="pill-link" href="../chi-sono/">Chi sono ↗</a></p>
    `,
    links: [{ label: "Chi sono", href: "../chi-sono/" }],
  },

  /* ------------------------------------------------------------------ 02 */
  {
    id: "projects",
    name: "PROJECTS",
    short: "Tre idee diventate abbastanza complete da avere una pagina.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 2,
    icon: { img: "/assets/work/brat-editor.webp", fit: "cover", pos: "50% 20%", glyph: null },
    long:
      "Qualche progetto in più. Tre idee nate per imparare qualcosa, diventate abbastanza complete da meritare una pagina tutta loro.\n\n" +
      "Brat Animator — un editor nel browser che trasforma testi LRC in lyric video animati.\n" +
      "Synk — parte dalla chat, capisce il motivo del messaggio e tiene appuntamenti e dati dell’attività collegati a Google Calendar e alla dashboard.\n" +
      "Beautify — un gestionale multisalone per clienti, servizi, appuntamenti e disponibilità.",
    section: `
      <p class="lead">Progetti pubblicati</p>
      <p>Qualche progetto in più. Tre idee nate per imparare qualcosa, diventate abbastanza complete da meritare
        una pagina tutta loro.</p>

      <div class="entry">
        <div class="e-thumb"><img src="/assets/work/brat-editor.webp" alt="Interfaccia di Brat Animator"></div>
        <div class="e-body">
          <p class="e-kicker">01 / Canvas · JavaScript</p>
          <p class="e-title">Brat Animator</p>
          <p class="e-text">Un editor nel browser che trasforma testi LRC in lyric video animati.</p>
          <p class="e-links"><a class="pill-link" href="../projects/brat-animator/">Apri il progetto ↗</a></p>
        </div>
      </div>

      <div class="entry">
        <div class="e-thumb"><img src="/assets/work/synk-cover.webp" alt="Materiale promozionale di Synk"></div>
        <div class="e-body">
          <p class="e-kicker">02 / Node.js</p>
          <p class="e-title">Synk</p>
          <p class="e-text">Parte dalla chat: capisce il motivo del messaggio e tiene appuntamenti e dati
            dell’attività collegati a Google Calendar e alla dashboard.</p>
          <p class="e-links"><a class="pill-link" href="../projects/synk/">Apri il progetto ↗</a></p>
        </div>
      </div>

      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/beautify-logo.svg" alt="Logo di Beautify"></div>
        <div class="e-body">
          <p class="e-kicker">03 / PHP + MySQL · Progetto di diploma</p>
          <p class="e-title">Beautify</p>
          <p class="e-text">Un gestionale multisalone per clienti, servizi, appuntamenti e disponibilità.</p>
          <p class="e-links"><a class="pill-link" href="../projects/beautify/">Apri il progetto ↗</a></p>
        </div>
      </div>
    `,
    links: [{ label: "Projects", href: "../#progetti" }],
  },

  /* ------------------------------------------------------------------ 03 */
  {
    id: "consoles",
    name: "CONSOLES",
    short: "Le console che ho modificato.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 3,
    icon: { img: "/assets/fuori-orario/3ds-cutout.png", fit: "contain", pos: "50% 50%", glyph: null },
    long:
      "Oltre il codice, un banco di lavoro: le console che ho modificato.\n\n" +
      "Nintendo 3DS (tre esemplari), Wii U, Wii, PlayStation 4. La Wii è anche il motivo per cui esiste questo canale.",
    section: `
      <p class="lead">Oltre il codice · Banco di lavoro</p>
      <p>Le console che ho modificato.</p>

      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/3ds-cutout.png" alt="Nintendo 3DS"></div>
        <div class="e-body">
          <p class="e-kicker">×3</p>
          <p class="e-title">Nintendo 3DS</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/wii-u.png" alt="Wii U"></div>
        <div class="e-body">
          <p class="e-kicker">Nintendo</p>
          <p class="e-title">Wii U</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/wii.png" alt="Wii"></div>
        <div class="e-body">
          <p class="e-kicker">Nintendo</p>
          <p class="e-title">Wii</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/ps4-cutout.png" alt="PlayStation 4"></div>
        <div class="e-body">
          <p class="e-kicker">Sony</p>
          <p class="e-title">PlayStation 4</p>
        </div>
      </div>

      <p class="word-meta" style="margin-top:12px">×3 sul 3DS: uno per ogni persona a cui l’ho consigliato.</p>
    `,
    links: [],
  },

  /* ------------------------------------------------------------------ 04 */
  {
    id: "games",
    name: "GAMES",
    short: "I preferiti dello scaffale.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 4,
    icon: { img: "/assets/fuori-orario/rayman-legends.jpg", fit: "cover", pos: "50% 45%", glyph: null },
    long:
      "I preferiti dello scaffale.\n\n" +
      "Rayman Legends — tra i miei giochi preferiti.\n" +
      "Yo-kai Watch 2: Bony Spirits — mi piace tutta la saga, ma il mio preferito è il 2.\n" +
      "Just Dance 2017 — mi piacciono tutti, ma è quello a cui sono più affezionato.",
    section: `
      <p class="lead">I preferiti · Scaffale</p>
      <p>Tre giochi che restano installati.</p>

      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/rayman-legends.jpg" alt="Rayman Legends"></div>
        <div class="e-body">
          <p class="e-kicker">RL</p>
          <p class="e-title">Rayman Legends</p>
          <p class="e-text">Tra i miei giochi preferiti.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/yokai-watch-2.png" alt="Yo-kai Watch 2: Bony Spirits"></div>
        <div class="e-body">
          <p class="e-kicker">2</p>
          <p class="e-title">Yo-kai Watch 2: Bony Spirits</p>
          <p class="e-text">Mi piace tutta la saga, ma il mio preferito è il 2.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/fuori-orario/just-dance-2017.jpg" alt="Just Dance 2017"></div>
        <div class="e-body">
          <p class="e-kicker">17</p>
          <p class="e-title">Just Dance 2017</p>
          <p class="e-text">Mi piacciono tutti, ma è quello a cui sono più affezionato.</p>
        </div>
      </div>
    `,
    links: [],
  },

  /* ------------------------------------------------------------------ 05 */
  {
    id: "languages",
    name: "LANGUAGES",
    short: "Italiano, inglese, spagnolo, greco.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 5,
    icon: { img: null, fit: "cover", pos: "50% 50%", glyph: "it en es el" },
    long:
      "Quattro lingue, quattro modi di dire la stessa cosa.\n\n" +
      "L’inglese lo uso tutti i giorni, lo spagnolo l’ho messo alla prova vivendo un po’ a Siviglia, il greco l’ho scelto per curiosità. Se mi scrivi in una di queste, provo a risponderti nella stessa, errori compresi.",
    section: `
      <p class="lead">Scrivimi nella tua lingua</p>
      <p>Si apre una mail già pronta nella lingua che scegli. Rispondo nella stessa.</p>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">Italiano · madrelingua</p>
          <p class="e-title">01 / 04</p>
          <p class="e-text">Fuori orario scrivo codice che non serve a niente in particolare, soprattutto perché mi
            piace capire come funzionano le cose. Ogni tanto rifaccio da zero qualcosa che già andava bene, solo
            perché nel frattempo avevo capito un modo migliore di farla.<br><br>
            Con le lingue funziona più o meno così: l’inglese lo uso tutti i giorni, lo spagnolo l’ho messo alla
            prova vivendo un po’ a Siviglia, il greco l’ho scelto per curiosità. Se mi scrivi in una di queste,
            provo a risponderti nella stessa, errori compresi.</p>
          <p class="e-links"><a class="pill-link" href="mailto:gabrielelucia07@gmail.com?subject=Ciao%20dal%20tuo%20portfolio&body=Ciao%20Gabriele%2C%0A%0A">Scrivi in italiano ↗</a></p>
        </div>
      </div>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">English · C1</p>
          <p class="e-title">02 / 04</p>
          <p class="e-text">Outside work hours I write code with no real purpose, mostly because I like understanding
            how things work. Every now and then I rebuild something that already worked, just because I’d figured
            out a better way to do it.<br><br>
            Languages work the same way: I use English every day, I put my Spanish to the test living in Seville for
            a while, and I picked up Greek out of curiosity. If you write to me in any of these, I’ll try to answer
            in the same one, mistakes included.</p>
          <p class="e-links"><a class="pill-link" href="mailto:gabrielelucia07@gmail.com?subject=Hello%20from%20your%20portfolio&body=Hi%20Gabriele%2C%0A%0A">Write in English ↗</a></p>
        </div>
      </div>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">Español · B1</p>
          <p class="e-title">03 / 04</p>
          <p class="e-text">Fuera de horario escribo código que no tiene un propósito concreto, sobre todo porque me
            gusta entender cómo funcionan las cosas. De vez en cuando rehago algo que ya funcionaba, solo porque
            mientras tanto había encontrado una manera mejor de hacerlo.<br><br>
            Con los idiomas pasa algo parecido: uso inglés todos los días, puse a prueba mi español viviendo una
            temporada en Sevilla, y aprendí griego por curiosidad. Si me escribes en uno de estos, intento
            responderte en el mismo, errores incluidos.</p>
          <p class="e-links"><a class="pill-link" href="mailto:gabrielelucia07@gmail.com?subject=Hola%20desde%20tu%20portfolio&body=Hola%20Gabriele%2C%0A%0A">Escribe en español ↗</a></p>
        </div>
      </div>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">Ελληνικά · B1</p>
          <p class="e-title">04 / 04</p>
          <p class="e-text">Εκτός ωραρίου γράφω κώδικα χωρίς συγκεκριμένο σκοπό, κυρίως επειδή μου αρέσει να
            καταλαβαίνω πώς λειτουργούν τα πράγματα. Κάπου κάπου ξαναφτιάχνω κάτι που ήδη δούλευε, απλώς επειδή
            στο μεταξύ είχα βρει έναν καλύτερο τρόπο να το κάνω.<br><br>
            Με τις γλώσσες γίνεται κάτι παρόμοιο: χρησιμοποιώ αγγλικά κάθε μέρα, δοκίμασα τα ισπανικά μου ζώντας
            για ένα διάστημα στη Σεβίλλη, και έμαθα ελληνικά από περιέργεια. Αν μου γράψεις σε μία από αυτές,
            προσπαθώ να σου απαντήσω στην ίδια, με όποιο λάθος.</p>
          <p class="e-links"><a class="pill-link" href="mailto:gabrielelucia07@gmail.com?subject=%CE%93%CE%B5%CE%B9%CE%B1%20%CE%B1%CF%80%CF%8C%20%CF%84%CE%BF%20portfolio%20%CF%83%CE%BF%CF%85&body=%CE%93%CE%B5%CE%B9%CE%B1%20%CF%83%CE%BF%CF%85%20Gabriele%2C%0A%0A">Γράψε στα ελληνικά ↗</a></p>
        </div>
      </div>

      <h3>Livelli</h3>
      <dl class="facts">
        <div class="f"><dt>Italiano</dt><dd>madrelingua</dd></div>
        <div class="f"><dt>Inglese</dt><dd>C1</dd></div>
        <div class="f"><dt>Spagnolo</dt><dd>B1 · un periodo a Siviglia</dd></div>
        <div class="f"><dt>Greco</dt><dd>B1 · per curiosità</dd></div>
        <div class="f"><dt>Cinese</dt><dd>A2</dd></div>
      </dl>
    `,
    links: [{ label: "Scrivimi", href: "mailto:gabrielelucia07@gmail.com" }],
  },

  /* ------------------------------------------------------------------ 06 */
  {
    id: "github",
    name: "GITHUB",
    short: "Commit, dal primo giorno.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 6,
    icon: { img: null, fit: "cover", pos: "50% 50%", glyph: "git" },
    long:
      "Commit, dal primo giorno.\n\n" +
      "Commit pubblici GitHub attribuiti a @oakvx e @oakvxish: open source fin dal primo commit.",
    section: `
      <p class="lead">GitHub / oakvx + oakvxish</p>
      <p>Commit, dal primo giorno. Commit pubblici GitHub attribuiti a
        <strong>@oakvx</strong> e <strong>@oakvxish</strong>.</p>

      <h3>Profili</h3>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/icons/git.svg" alt=""></div>
        <div class="e-body">
          <p class="e-kicker">Profilo principale</p>
          <p class="e-title">github.com/oakvx</p>
          <p class="e-links"><a class="pill-link" href="https://github.com/oakvx" target="_blank" rel="noopener noreferrer">Apri GitHub ↗</a></p>
        </div>
      </div>
      <div class="entry">
        <div class="e-thumb contain"><img src="/assets/icons/git.svg" alt=""></div>
        <div class="e-body">
          <p class="e-kicker">Secondo profilo</p>
          <p class="e-title">github.com/oakvxish</p>
          <p class="e-links"><a class="pill-link" href="https://github.com/oakvxish" target="_blank" rel="noopener noreferrer">Apri GitHub ↗</a></p>
        </div>
      </div>

      <h3>Commit, dal primo giorno.</h3>
      <p class="word" data-ah-commits aria-live="polite">—</p>
      <p class="word-meta" data-ah-git-status>Leggo i commit pubblici GitHub…</p>
    `,
    links: [{ label: "GitHub", href: "https://github.com/oakvx" }],
  },

  /* ------------------------------------------------------------------ 07 */
  {
    id: "tools",
    name: "TOOLS",
    short: "Cosa so fare.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 7,
    icon: { img: null, fit: "cover", pos: "50% 50%", glyph: "tools" },
    long:
      "Tre aree di lavoro, dalla scrivania di “Strumenti del mestiere”.\n\n" +
      "Sviluppo web (HTML, CSS, JavaScript, SEO e pubblicazione), backend e dati (Node.js, PHP, PostgreSQL, MySQL, T-SQL su SQL Server), grafica e interfacce (contenuti per i social, progettazione di interfacce, testi animati su Canvas).",
    section: `
      <p class="lead">Strumenti del mestiere</p>
      <p>Codice e grafica, tutto a fuoco. Tre aree di lavoro.</p>

      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">01 · WEB</p>
          <p class="e-title">Sviluppo web</p>
          <p class="e-text">Siti e applicazioni web: interfacce, pubblicazione e indicizzazione sui motori di ricerca.<br>
            HTML · CSS · JavaScript · SEO e pubblicazione · pagine social aziendali.<br>
            <em>In pratica:</em> siti per officine, centri estetici e utensilerie, dal 2023 al 2026.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">02 · DAT</p>
          <p class="e-title">Backend e dati</p>
          <p class="e-text">Logica lato server e database relazionali, dai CRUD all’automazione.<br>
            Node.js · PHP · PostgreSQL · MySQL · T-SQL su SQL Server.<br>
            <em>In pratica:</em> Synk, Beautify, Format SRL.</p>
        </div>
      </div>
      <div class="entry">
        <div class="e-body">
          <p class="e-kicker">03 · GFX</p>
          <p class="e-title">Grafica e interfacce</p>
          <p class="e-text">La parte visiva del lavoro, che affianco allo sviluppo software.<br>
            Contenuti per i social · progettazione di interfacce · testi animati su Canvas.<br>
            <em>In pratica:</em> Brat Animator, pagine social.</p>
        </div>
      </div>

      <h3>Con cosa lavoro</h3>
      <p class="word-meta">HTML · CSS · JavaScript · Node.js · PHP · PostgreSQL · MySQL · Git</p>

      <h3>Domande frequenti</h3>
      <dl class="facts">
        <div class="f"><dt>Dove</dt><dd>Sassuolo, in provincia di Modena.</dd></div>
        <div class="f"><dt>Studio</dt><dd>Ingegneria Informatica all’Università di Modena e Reggio Emilia (UNIMORE).</dd></div>
        <div class="f"><dt>Lingue</dt><dd>Italiano (madrelingua), inglese C1, spagnolo B1, greco B1, cinese A2.</dd></div>
        <div class="f"><dt>Estero</dt><dd>A maggio e giugno 2025, con l’Erasmus+, alla Starbotica di Siviglia: supporto IT e attività didattiche, in inglese e spagnolo.</dd></div>
        <div class="f"><dt>Contatti</dt><dd><a href="mailto:gabrielelucia07@gmail.com">gabrielelucia07@gmail.com</a></dd></div>
      </dl>
      <p style="margin-top:14px"><a class="pill-link" href="../#strumenti">La scrivania completa ↗</a></p>
    `,
    links: [{ label: "Strumenti", href: "../#strumenti" }],
  },

  /* ------------------------------------------------------------------ 08 */
  {
    id: "curiosity",
    name: "CURIOSITY",
    short: "Una domanda tira l’altra.",
    coder: "Gabriele Lucia (oakvx)",
    version: null,
    order: 8,
    icon: { img: null, fit: "cover", pos: "50% 50%", glyph: "?" },
    long:
      "Parto da una domanda semplice su come funziona qualcosa, e finisco per leggere molto più di quanto servisse davvero.\n\n" +
      "Parola del giorno.",
    section: `
      <p class="lead">Adesso · Parola del giorno</p>
      <p class="e-kicker" data-ah-word-lang></p>
      <p class="word" data-ah-word></p>
      <p class="word-meta" data-ah-word-meaning></p>

      <h3>Curiosità</h3>
      <p>Parto da una domanda semplice su come funziona qualcosa, e finisco per leggere molto più di quanto
        servisse davvero.</p>
      <p>Quando un’idea mi piace davvero, la porto fino in fondo. Mi piace esplorare nuove tecnologie,
        sperimentare con progetti personali e imparare lingue straniere.</p>

      <h3>Dove finisce</h3>
      <dl class="facts">
        <div class="f"><dt>Progetti</dt><dd>tre progetti con una pagina tutta loro</dd></div>
        <div class="f"><dt>Banco</dt><dd>quattro console modificate</dd></div>
        <div class="f"><dt>Scaffale</dt><dd>tre giochi che restano installati</dd></div>
        <div class="f"><dt>Lingue</dt><dd>italiano, inglese, spagnolo, greco</dd></div>
      </dl>
      <p style="margin-top:14px"><a class="pill-link" href="../#percorso">Il percorso completo ↗</a></p>
    `,
    links: [{ label: "Percorso", href: "../#percorso" }],
  },
];

/* raccoglie il testo del dettaglio (per il memo del dialogo) */
AH.longText = function (app) {
  return app.long;
};

/* Funzioni già presenti sul sito: parola quotidiana (Europe/Rome) e conteggio
 * commit dei due profili, con la stessa chiave cache e gli stessi endpoint. */
AH.enhanceSection = function (root) {
  var english = document.documentElement.lang === "en";
  var word = root.querySelector("[data-ah-word]");
  if (word) {
    var words=[['es','trastear','','armeggiare, smanettare','to tinker, to fiddle about'],
 ['el','περιέργεια','periérgeia','curiosità','curiosity'],
 ['es','madrugada','','le ore piccole, l’alba','the small hours, early dawn'],
 ['el','κώδικας','kódikas','codice','code'],
 ['es','sobremesa','','il tempo passato a tavola a chiacchierare dopo mangiato','the time spent chatting at the table after a meal'],
 ['el','νύχτα','nýchta','notte','night'],
 ['es','estrenar','','usare o inaugurare per la prima volta','to use or wear for the first time'],
 ['el','παιχνίδι','paichnídi','gioco','game'],
 ['es','desvelarse','','perdere il sonno','to lose sleep, to stay awake'],
 ['el','ουράνιο τόξο','uránio tóxo','arcobaleno','rainbow'],
 ['es','ensimismado','','assorto nei propri pensieri','lost in thought'],
 ['el','ησυχία','isychía','quiete, silenzio','quiet, stillness'],
 ['es','merienda','','la merenda del pomeriggio','the afternoon snack'],
 ['el','ταξίδι','taxídi','viaggio','journey']];
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    var date = {};
    parts.forEach(function (p) { date[p.type] = p.value; });
    var day = Math.floor(Date.UTC(+date.year, +date.month - 1, +date.day) / 864e5);
    var w = words[day % words.length];
    word.textContent = w[1]; word.lang = w[0];
    root.querySelector("[data-ah-word-lang]").textContent = w[0] === "es" ? "ES" : "ΕΛ";
    root.querySelector("[data-ah-word-meaning]").textContent = (w[2] ? w[2] + " · " : "") + w[english ? 4 : 3];
  }
  var total = root.querySelector("[data-ah-commits]");
  if (!total) return;
  var status = root.querySelector("[data-ah-git-status]");
  var key = "oakvx-public-commit-total-v1", cache = null;
  function render(n) { total.textContent = n.toLocaleString(english ? "en-US" : "it-IT"); }
  try { cache = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  if (cache && Number.isSafeInteger(cache.total)) render(cache.total);
  if (cache && Date.now() - cache.updated < 3600000) {
    status.textContent = english ? "Public totals updated" : "Totale pubblico aggiornato";
    return;
  }
  Promise.all(["oakvx", "oakvxish"].map(function (account) {
    return fetch("https://api.github.com/search/commits?" + new URLSearchParams({q: "author:" + account + " is:public", per_page: "1"}), {headers: {Accept: "application/vnd.github+json"}})
      .then(function (r) { if (!r.ok) throw new Error("GitHub API"); return r.json(); })
      .then(function (data) { if (data.incomplete_results || !Number.isSafeInteger(data.total_count)) throw new Error("Incomplete total"); return data.total_count; });
  })).then(function (counts) {
    var n = counts[0] + counts[1];
    render(n);
    status.textContent = english ? "Public totals updated" : "Totale pubblico aggiornato";
    try { localStorage.setItem(key, JSON.stringify({total: n, updated: Date.now()})); } catch (e) {}
  }).catch(function () { status.textContent = english ? "Public totals unavailable" : "Totale pubblico non disponibile"; });
};
