(() => {
    "use strict";
    const translations = {
        "it": {
            "resume": "Riprendi animazioni",
            "menuClose": "Chiudi menu",
            "copySuccess": "Email copiata.",
            "copyError": "Copia non disponibile. Scrivimi dal pulsante email.",
            "term.help": "help     Tutti i comandi\nwhoami   Chi sono\nls       Progetti\nskills   Tecnologie e competenze\nemail    Il mio indirizzo email\ngithub   Apri il mio profilo GitHub\nclear    Pulisci il terminale",
            "term.skills": "Web        HTML / CSS / JavaScript\nBackend    Node.js / PHP\nDati       PostgreSQL / MySQL / T-SQL\nGrafica    Social / interfacce\nAutomazione PLC / SQL Server",
            "term.unknown": "Comando non trovato. Digita help.",
            "term.github": "Profilo GitHub aperto in una nuova scheda.",
            "term.projects": "Progetti:"
        },
        "en": {
            "about.metaTitle": "About me — Gabriele Lucia / oakvx",
            "about.metaDescription": "Gabriele Lucia’s story: web development, Erasmus in Seville, automation in Sassuolo and Computer Engineering at UNIMORE.",
            "brat-animator.metaTitle": "Brat Animator — Gabriele Lucia / oakvx",
            "brat-animator.metaDescription": "Brat Animator: a browser-based lyric video editor. LRC, Canvas, timing and MP4/WebM export. A project by Gabriele Lucia.",
            "synk.metaTitle": "Synk — Gabriele Lucia / oakvx",
            "synk.metaDescription": "Synk: conversational automation, a Node.js backend, PostgreSQL and web monitoring. A project by Gabriele Lucia.",
            "beautify.metaTitle": "Beautify — Gabriele Lucia / oakvx",
            "beautify.metaDescription": "Beautify: a PHP and MySQL multi-salon CRM with booking, roles, inventory and analytics. Gabriele Lucia’s final diploma project.",
            "skip": "Skip to content",
            "navAbout": "About me",
            "navProjects": "Projects",
            "navContact": "Contact",
            "navLabel": "Main navigation",
            "languageLabel": "Language",
            "menuOpen": "Open menu",
            "pause": "Pause animations",
            "backTop": "Back to top",
            "location": "Sassuolo, Italy",
            "internal.homeLabel": "gl. / Gabriele Lucia, home",
            "internal.menu": "Menu",
            "internal.contents": "On this page",
            "internal.contactTitle": "Email me.",
            "internal.contactIntro": "Let’s continue by email.",
            "internal.emailAction": "Email me",
            "internal.allProjects": "All projects",
            "internal.documentation": "Documentation",
            "internal.footerRole": "Software development and graphic design",
            "internal.breadcrumb": "Breadcrumb",
            "about.aboutPortraitAlt": "Portrait of Gabriele Lucia",
            "brat-animator.coverAlt": "Brat Animator 4.0 interface with timeline, video preview and style controls",
            "synk.coverAlt": "Synkris: promotional material for the Synk project",
            "beautify.coverAlt": "Original Beautify logo",
            "brat-animator.kind": "Lyric video editor",
            "synk.kind": "Appointments via WhatsApp",
            "beautify.kind": "Multi-salon CRM",
            "about.projectNavLabel": "Personal projects",
            "about.graphicAlt": "Brat Animator 4.0 interface with demonstration text",
            "brat-animator.stackNav": "Technologies",
            "synk.stackNav": "Technologies",
            "beautify.stackNav": "Technologies",
            "about.aboutTitle": "I build websites and web apps, and I do graphic design.",
            "about.aboutLead": "I’m a junior software developer and graphic designer from Sassuolo. I study Computer Engineering at UNIMORE.",
            "about.aboutFact0Label": "Base",
            "about.aboutFact0Value": "Sassuolo, Italy",
            "about.aboutFact1Label": "Education",
            "about.aboutFact1Value": "IT & Telecommunications diploma",
            "about.aboutFact2Label": "University",
            "about.aboutFact2Value": "Computer Engineering · UNIMORE",
            "about.contentsinizio": "School",
            "about.contentssiti-web": "Websites for local businesses",
            "about.contentsgrafica": "Graphic design",
            "about.contentssiviglia": "Erasmus in Seville",
            "about.contentsautomazione": "Format SRL",
            "about.contentsoggi": "Now",
            "about.contentsProjects": "Projects",
            "about.contentsInterests": "Outside work",
            "about.aboutCuriosity": "I got into programming out of curiosity. I wanted to understand how software worked and try to build something of my own.",
            "about.aboutProblemSolving": "Over time I became more interested in problem solving: understanding what isn’t working, finding a solution and seeing the result in the program I’m building.",
            "about.aboutFirstProject": "My diploma project",
            "about.inizioDate": "2021 — 2026",
            "about.inizioHeading": "School",
            "about.inizioParagraph0": "I attended IIS A. Volta in Sassuolo, where I earned my IT & Telecommunications diploma in 2026. For my final project I built Beautify, a web CRM with PHP and MySQL.",
            "about.siti-webDate": "2023 — 2026",
            "about.siti-webHeading": "Websites for local businesses",
            "about.siti-webParagraph0": "From September 2023 to June 2026 I worked as a freelance web developer and SEO consultant around Sassuolo and Scandiano. I built websites for workshops, beauty salons and tool shops.",
            "about.siti-webParagraph1": "I handled interfaces, deployment and search engine indexing, and helped set up business social accounts.",
            "about.aboutStudyCaption": "Brat Animator 4.0 / actual interface, demonstration text",
            "about.graficaHeading": "Graphic design",
            "about.graficaParagraph0": "I also work in graphic design, creating visuals for social media and designing interfaces. It’s the visual side of my work, alongside software development.",
            "about.sivigliaDate": "MAY — JUN 2025",
            "about.sivigliaHeading": "Erasmus in Seville",
            "about.sivigliaParagraph0": "During Erasmus+ I worked at Starbotica in Seville. I took part in IT and educational activities in an international environment, using English and Spanish every day.",
            "about.sivigliaParagraph1": "IT support covered Windows environments, Active Directory accounts, local networks and peripherals. I worked on hardware and software troubleshooting and technical documentation.",
            "about.sivigliaParagraph2": "Above all, the experience made me more independent. Working in a new setting helped me adapt and improve my language skills.",
            "about.automazioneDate": "AUG — SEP 2026",
            "about.automazioneHeading": "Format SRL",
            "about.automazioneParagraph0": "At Format SRL in Sassuolo I worked as a software and automation apprentice. I supported PLC programming and software development for industrial systems.",
            "about.automazioneParagraph1": "I wrote T-SQL scripts on Microsoft SQL Server for data backup, management and archiving. In this setting I studied how PLC logic, application software and databases connect.",
            "about.aboutBrowserProject": "Brat Animator, in the browser",
            "about.oggiHeading": "Now",
            "about.oggiParagraph0": "I study Computer Engineering at the University of Modena and Reggio Emilia. I continue experimenting with my projects.",
            "about.oggiParagraph1": "I’m interested in web development, databases and automation. In my personal projects I also work on browser tools, such as Brat Animator.",
            "about.projectbeautifyStack": "Final diploma project · PHP / MySQL",
            "about.projectbeautifyText": "I designed the database and developed the backend of a CRM for customers, appointments, operators and services.",
            "about.projectsynkStack": "Node.js / PostgreSQL",
            "about.projectsynkText": "I developed the backend, data layer and monitoring interface of a WhatsApp-integrated application.",
            "about.projectbrat-animatorStack": "JavaScript / Canvas / WebCodecs",
            "about.projectbrat-animatorText": "A lyric video editor I built to animate LRC text and export the result from the browser.",
            "about.personalProjectsTitle": "Projects",
            "about.langItalian": "Italian",
            "about.langNative": "Native",
            "about.langEnglish": "English",
            "about.langSpanish": "Spanish",
            "about.langGreek": "Greek",
            "about.langChinese": "Chinese",
            "about.interestsTitle": "Outside work",
            "about.interestsText": "I enjoy exploring new technologies, experimenting with personal projects and learning foreign languages. I’m curious by nature and interested in understanding how things work.",
            "brat-animator.caseSummary": "LRC lyrics, an editable timeline and Canvas rendering, brought together in an editor that exports video directly from the browser.",
            "brat-animator.caseHeroCTA": "Launch the app",
            "brat-animator.caseRoleLabel": "My role",
            "brat-animator.caseRoleLabelValue": "Application development",
            "brat-animator.caseStackLabel": "Stack",
            "brat-animator.caseStackLabelValue": "JavaScript / Canvas",
            "brat-animator.caseFocusLabel": "Focus",
            "brat-animator.caseFocusLabelValue": "Timing, motion, export",
            "brat-animator.caseTypeLabel": "Project",
            "brat-animator.caseTypeLabelValue": "Browser-based tool · v4.0",
            "brat-animator.caseArtNote": "Brat Animator 4.0 / actual app with demonstration text",
            "brat-animator.casePageOverview": "The project",
            "brat-animator.casePageStory": "How it works",
            "brat-animator.casePageBuild": "Code structure",
            "brat-animator.bratStartTitle": "The project",
            "brat-animator.bratStartText": "I brought LRC import, LRCLIB search, timing edits, styling and export into a static editor. Text and media are processed in the browser.",
            "brat-animator.brat-animator-storyHeading": "How it works",
            "brat-animator.brat-animator-story-testoTitle": "Starting with text",
            "brat-animator.brat-animator-story-testoText0": "The editor imports timestamped LRC lyrics and can search LRCLIB. Lines and timing remain editable.",
            "brat-animator.brat-animator-story-fotogrammiTitle": "From timing to frames",
            "brat-animator.brat-animator-story-fotogrammiText0": "The timeline connects words and characters to time. Canvas 2D draws the text with the styling and animations selected in the editor.",
            "brat-animator.brat-animator-story-videoTitle": "Exporting video",
            "brat-animator.brat-animator-story-videoText0": "WebCodecs and an MP4 muxer allow fast video-only export in compatible browsers. MediaRecorder provides real-time recording and can include loaded audio.",
            "brat-animator.bratCoreTitle": "LRC parsing",
            "brat-animator.bratCoreText": "LRC parsing, Enhanced LRC timestamps, editable rows and project-format migration.",
            "brat-animator.bratTimingTitle": "Timeline and timing",
            "brat-animator.bratTimingText": "A shared word and character timeline; Unicode segmentation and audio-energy analysis to guide estimates.",
            "brat-animator.bratMediaTitle": "Media recognition",
            "brat-animator.bratMediaText": "Media-type recognition and detection of YouTube references used for preview.",
            "brat-animator.bratExportTitle": "Browser capabilities",
            "brat-animator.bratExportText": "WebCodecs checks for fast MP4 export. Available capabilities determine the export path.",
            "brat-animator.bratEngineTitle": "Code structure",
            "brat-animator.bratEngineText": "Repository modules separate LRC parsing, timing, media recognition and export capability checks.",
            "brat-animator.bratOutputTitle": "Export and storage",
            "brat-animator.bratOutputText": "WebCodecs handles fast video-only export; MediaRecorder records in real time and can include audio. Projects use localStorage for state and IndexedDB for uploaded media.",
            "brat-animator.bratFast": "Video-only export when supported. Availability depends on browser capabilities.",
            "brat-animator.bratRealtime": "Real-time recording, with local audio or a compatible direct media URL when enabled.",
            "brat-animator.stackTool0Role": "EDITOR LOGIC",
            "brat-animator.stackTool0Usage": "Coordinates LRC parsing, timestamps, the timeline and style controls. Modules separate text, timing, media and export.",
            "brat-animator.stackTool1Role": "FRAME RENDERING",
            "brat-animator.stackTool1Usage": "Turns the word timeline into animated frames, using the lyric video’s styling, positioning and effects.",
            "brat-animator.stackTool2Role": "VIDEO ENCODING",
            "brat-animator.stackTool2Usage": "Powers fast, video-only export. The app checks browser support before making this path available.",
            "brat-animator.stackTool3Role": "REAL-TIME RECORDING",
            "brat-animator.stackTool3Usage": "Provides real-time export and can include local audio or audio from a compatible direct media URL.",
            "brat-animator.stackTool4Role": "BROWSER STORAGE",
            "brat-animator.stackTool4Usage": "Stores uploaded media blobs. Project state is saved in localStorage.",
            "brat-animator.stackTitle": "Technologies",
            "synk.caseSummary": "From a WhatsApp message to a booking: the backend interprets the request, retains conversation state and coordinates the steps towards the calendar.",
            "synk.caseHeroCTA": "Explore the system",
            "synk.caseRoleLabel": "My role",
            "synk.caseRoleLabelValue": "Backend, database, web interface",
            "synk.caseStackLabel": "Stack",
            "synk.caseStackLabelValue": "Node.js / PostgreSQL",
            "synk.caseFocusLabel": "Focus",
            "synk.caseFocusLabelValue": "Conversational automation",
            "synk.caseTypeLabel": "Project",
            "synk.caseTypeLabelValue": "Web application",
            "synk.caseArtNote": "Synkris / supplied promotional material",
            "synk.casePageOverview": "The project",
            "synk.casePageStory": "How it works",
            "synk.casePageBuild": "My work",
            "synk.synkStartTitle": "The project",
            "synk.synkStartText": "Synk connects WhatsApp message recognition with automated appointment management. A web interface lets users monitor activity.",
            "synk.synk-storyHeading": "How it works",
            "synk.synk-story-messaggioTitle": "The message",
            "synk.synk-story-messaggioText0": "The core receives the conversation message, normalises text and checks for duplicates. Chat context makes it possible to resume an existing booking flow.",
            "synk.synk-story-intentoTitle": "Understanding the request",
            "synk.synk-story-intentoText0": "Regex, scores and fuzzy word matching distinguish bookings, edits, cancellations and information requests. The flow collects the service, professional, date and time.",
            "synk.synk-story-intentoText1": "The code also includes configurable classification through Ollama. Application rules and conversation state guide the booking steps.",
            "synk.synk-story-prenotazioneTitle": "Availability and confirmation",
            "synk.synk-story-prenotazioneText0": "Availability accounts for service duration, business hours, breaks and the professional’s unavailability. A soft hold temporarily reserves the selection during the flow.",
            "synk.synk-story-prenotazioneText1": "PostgreSQL stores conversations, bookings and holds. Calls to the Calendar module create, update or cancel events. The core also includes reminders and confirmation requests.",
            "synk.synk-story-prenotazioneText2": "This description follows the supplied Synkris core. Calendar integration and booking normalisation are called through external modules that were not included in the analysed file.",
            "synk.synkLayer01Title": "Message recognition",
            "synk.synkLayer01Text": "Regex and custom logic to interpret incoming messages.",
            "synk.synkLayer02Title": "Backend",
            "synk.synkLayer02Text": "The backend handles automated appointment management.",
            "synk.synkLayer03Title": "Monitoring",
            "synk.synkLayer03Text": "Persistent data and an interface dedicated to system activity.",
            "synk.synkBuildTitle": "My work",
            "synk.synkBuildText": "I developed the Node.js backend, PostgreSQL data layer and web monitoring interface.",
            "synk.stackTool0Role": "BACKEND",
            "synk.stackTool0Usage": "Connects message recognition with automated appointment management. I developed this backend.",
            "synk.stackTool1Role": "TEXT MATCHING",
            "synk.stackTool1Usage": "Work alongside custom logic to recognise incoming WhatsApp messages.",
            "synk.stackTool2Role": "RELATIONAL DATABASE",
            "synk.stackTool2Usage": "I built the persistence layer that supports the appointment workflow and web monitoring.",
            "synk.stackTitle": "Technologies",
            "beautify.caseSummary": "A CRM for multiple salons: customers, services, availability and appointments share the same context. My final diploma project, developed in PHP and MySQL.",
            "beautify.caseHeroCTA": "Explore the data",
            "beautify.caseRoleLabel": "My role",
            "beautify.caseRoleLabelValue": "Primary technical role",
            "beautify.caseStackLabel": "Stack",
            "beautify.caseStackLabelValue": "PHP / MySQL",
            "beautify.caseFocusLabel": "Focus",
            "beautify.caseFocusLabelValue": "CRUD & relational data",
            "beautify.caseTypeLabel": "Project",
            "beautify.caseTypeLabelValue": "Final diploma project",
            "beautify.caseArtNote": "Beautify / original project logo",
            "beautify.casePageOverview": "The project",
            "beautify.casePageStory": "How it works",
            "beautify.casePageBuild": "My work",
            "beautify.beautifyStartTitle": "The project",
            "beautify.beautifyStartText": "Beautify manages customers, appointments, users and services across multiple salons. It includes public booking, inventory and analytics, with separate sections for owners and employees.",
            "beautify.beautify-storyHeading": "How it works",
            "beautify.beautify-story-saloneTitle": "A salon and its users",
            "beautify.beautify-story-saloneText0": "After login, the session identifies the active salon. Users can belong to multiple salons; owner and employee roles determine which sections they can access.",
            "beautify.beautify-story-disponibilitaTitle": "Finding a time",
            "beautify.beautify-story-disponibilitaText0": "The public booking flow selects a salon, service and date. PHP logic calculates slots using duration, opening windows and staff capacity.",
            "beautify.beautify-story-disponibilitaText1": "Shared checks between the agenda and public booking compare occupied time intervals. The supplied version proposes slots every 30 minutes and applies a minimum lead time of 15 minutes.",
            "beautify.beautify-story-gestioneTitle": "Managing data",
            "beautify.beautify-story-gestioneText0": "The PHP backend uses mysqli for customers, services, appointments and settings. Queries include the active salon to separate each business’s data.",
            "beautify.beautify-story-gestioneText1": "The CRM includes customer history, inventory and analytics. The database also contains user-to-salon associations and account recovery tables.",
            "beautify.beautifyBackendTitle": "PHP, server side",
            "beautify.beautifyBackendText": "The backend handles the CRM’s application workflows. My work includes creating, reading, updating and deleting data.",
            "beautify.beautifyDatabaseTitle": "MySQL, data side",
            "beautify.beautifyDatabaseText": "The schema links salons, customers, services and appointments, with associations between users and salons. Queries include the active salon.",
            "beautify.beautifyBuildTitle": "My work",
            "beautify.beautifyBuildText": "I developed the PHP backend and MySQL database, including CRUD workflows, salon context and shared availability checks for the agenda and public booking.",
            "beautify.stackTool0Role": "SERVER-SIDE LOGIC",
            "beautify.stackTool0Usage": "I developed the backend with mysqli, sessions, permissions and CRUD operations. Pages are server-rendered; forms send GET and POST requests.",
            "beautify.stackTool1Role": "DATA & RELATIONSHIPS",
            "beautify.stackTool1Usage": "The schema links salons, customers, services and appointments. User-to-salon associations support multiple businesses with distinct roles.",
            "beautify.stackTitle": "Technologies",
            "home.hello": "Hi, I’m",
            "home.subtitle": "Junior developer & graphic designer",
            "home.role1": "Web development.",
            "home.role2": "Design and interfaces.",
            "home.description": "I’m Gabriele, a developer and graphic designer from Sassuolo. I build web applications, social graphics and interfaces. I study Computer Engineering at UNIMORE.",
            "home.write": "Get in touch",
            "home.copy": "Copy my email",
            "home.explore": "Explore projects",
            "home.projectsTitle": "Selected projects.",
            "home.bratKind": "Lyric video editor",
            "home.bratText": "An editor I built to animate LRC text and export lyric videos directly from the browser.",
            "home.bratAlt": "Brat Animator 4.0: timeline, text editor and video preview",
            "home.case": "Explore the project",
            "home.synkAlt": "Synkris: promotional material for the Synk project",
            "home.synkCredit": "Synkris / supplied material",
            "home.synkKind": "Appointments via WhatsApp",
            "home.synkText": "Backend, data layer and monitoring interface for a WhatsApp-integrated application.",
            "home.beautifyKind": "Final diploma project",
            "home.beautifyText": "A multi-salon CRM for customers, appointments, staff and services. PHP backend and MySQL database.",
            "home.beautifyAlt": "Original Beautify logo",
            "home.beautifyCredit": "Original project logo",
            "home.pathTitle": "Background",
            "home.pathIntro": "Web development, graphic design, databases and automation. My journey, from school to personal projects.",
            "home.story": "My story",
            "home.path1": "IT & Telecommunications · Sassuolo",
            "home.path2Title": "Freelance web development",
            "home.path2": "Websites, interfaces and SEO for local businesses",
            "home.path3Date": "MAY — JUN 2025",
            "home.path3Title": "Erasmus+ in Seville",
            "home.path3": "Starbotica · IT support and educational activities",
            "home.path4Date": "AUG — SEP 2026",
            "home.path4": "Software and automation · PLC / SQL Server",
            "home.path5": "Computer Engineering",
            "home.tools": "Tools and languages",
            "home.native": "Native",
            "home.contactTitle": "Get in touch.",
            "home.credits": "Credits",
            "term.label": "Interactive terminal",
            "term.log": "Terminal output",
            "term.identity": "Junior developer & graphic designer.\nSassuolo, Italy.\nComputer Engineering @ UNIMORE.",
            "term.start": "Type help to get started.",
            "term.input": "Terminal command",
            "term.run": "Run command",
            "term.commands": "Quick commands",
            "term.caption": "A little about me, from the command line.",
            "resume": "Resume animations",
            "menuClose": "Close menu",
            "copySuccess": "Email copied.",
            "copyError": "Copy unavailable. Use the email button to get in touch.",
            "term.help": "help     All commands\nwhoami   About me\nls       Projects\nskills   Technologies and skills\nemail    My email address\ngithub   Open my GitHub profile\nclear    Clear the terminal",
            "term.skills": "Web        HTML / CSS / JavaScript\nBackend    Node.js / PHP\nData       PostgreSQL / MySQL / T-SQL\nDesign     Social / interfaces\nAutomation PLC / SQL Server",
            "term.unknown": "Command not found. Type help.",
            "term.github": "GitHub profile opened in a new tab.",
            "term.projects": "Projects:"
        }
    };
    Object.assign(translations.en, {
        'header.email': 'Email me',
        'home.waterReplay': 'Restart the chameleon cycle',
        'home.replayHint': 'Restart',
        'home.projectIndexLabel': 'Project index',
        'not-found.title': 'Page not found.',
        'not-found.description': 'The page you are looking for does not exist or has moved. Let’s start again here.',
        'not-found.home': 'Back to home',
        'not-found.projects': 'Explore projects',
        'credits.title': 'Materials credits',
        'credits.intro': 'Licences, sources and details for materials used in this portfolio.',
        'credits.typography': 'Typography and local icons',
        'credits.photo': 'Personal photography',
        'credits.projects': 'Project materials',
        'credits.graphics': 'Portfolio graphics',
        'credits.archivoUse': 'is used for text, headings and social cards. The file is a subset of the characters used by the portfolio, preserving Italian accents, punctuation and the original variable axes; glyph shapes and metrics are unchanged.',
        'credits.licenseLabel': 'Licence:',
        'credits.distributionLabel': 'Original distribution:',
        'credits.cascadiaUse': 'is used for the terminal, dates and technical details. The subset preserves ASCII characters, Italian accents and punctuation in use, without changing glyph shapes, metrics or the variable axis. The derived font’s internal name is',
        'credits.reservedName': 'in keeping with the original’s reserved name.',
        'credits.deviconUse': 'Technology icons are served locally from',
        'credits.sourceLabel': 'Source:',
        'credits.trademarkNotice': 'The trademarks identify the respective tools and belong to their owners.',
        'credits.photoProvided': 'is a personal photograph supplied by Gabriele Lucia, resized to 900 × 1200 px and encoded as WebP.',
        'credits.photoVariantsIntro': 'The variants',
        'credits.photoVariantsDetails': 'measure 360 × 480, 450 × 600 and 675 × 900 px respectively, for responsive delivery.',
        'credits.photoAvatar': 'is a 240 × 240 px crop of the same photograph.',
        'credits.photoUntouched': 'The original files and avatar have not been retouched.',
        'credits.photoCutoutIntro': 'For the About hero, the variant',
        'credits.photoCutoutDetails': '(640 × 800 px, 4:5 aspect ratio) was created with background removal authorised by the author using ImageGen.',
        'credits.photoResponsiveIntro': 'The responsive variants',
        'credits.photoResponsiveDetails': 'measure 320 × 400 and 480 × 600 px and retain transparency. The source remains the existing personal photograph; no new profile photo was supplied.',
        'credits.bratCapture': 'a real 1440 × 1000 px screenshot of Brat Animator 4.0, captured on 18 October 2026 from',
        'credits.repositoryLabel': 'Repository:',
        'credits.bratDemo': 'The original demo text entered in the editor is “gabriele lucia”, “codice e grafica”, “demo portfolio”. No music or private content was uploaded. The interface was not reconstructed or retouched.',
        'credits.synkSource': 'comes from materials supplied by the author, archive',
        'credits.synkEntry': ', entry',
        'credits.synkDetails': 'The original 1867 × 949 px promotional image was proportionally resized to 1600 × 813 px and encoded as WebP. It is supplied promotional material, not a screenshot of a production management system. The credit “Synkris / supplied material” remains visible next to the image.',
        'credits.beautifySource': 'the original logo supplied in the archive',
        'credits.beautifyEntry': ', entry',
        'credits.beautifyDetails': 'No authentic application screenshot was available, so the logo is used. The original file is unmodified; its presentation on a dark background may invert its color via CSS.',
        'credits.smallVariantsIntro': 'The variants',
        'credits.smallVariantsAnd': 'and',
        'credits.smallVariantsDetails': 'are proportional resizes of the corresponding images, with no content changes.',
        'credits.materialsOwnership': 'These materials belong to Gabriele Lucia / oakvx or were supplied for the portfolio. Their public availability does not grant a general reuse licence. Image sources, dimensions and checksums are listed in',
        'credits.materialsPrivate': 'Original archives, data, credentials and application configurations are not published.',
        'credits.chameleon': 'The chameleon is an original inline SVG drawing for the portfolio, built in code from flat geometric shapes, outlines, five-band fills and a block shadow. Walking, watering can, tail, eyelid and tongue are animated as poses. The name and water share the same SVG; Canvas with local Archivo measures and samples each glyph. A single requestAnimationFrame loop coordinates the scene, with no raster images or animation libraries.',
        'credits.surfaces': 'The irregular surfaces of pills, buttons, chips and the compact index use six border-radius variations and four original SVG filters with feTurbulence and feDisplacementMap. The filters apply only to background shapes and shadows, keeping text and icons sharp.',
        'credits.identity': 'The gl. monogram, five-color bands, frames and PNG social cards are original portfolio compositions. The social cards are generated using only the two local fonts and geometric shapes via scripts/build-social.py; they use no external photography or marks. No stickers, GIFs, illustrations or fonts from the previous setup are loaded.'
    });
    const root = document.documentElement;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    $$('[data-k]').forEach(element => {
        translations.it[element.dataset.k] = element.textContent;
    });
    $$('[data-k-alt]').forEach(element => {
        translations.it[element.dataset.kAlt] = element.alt;
    });
    $$('[data-k-aria]').forEach(element => {
        translations.it[element.dataset.kAria] = element.getAttribute('aria-label');
    });
    const storage = {
        get(key) {
            try {
                return localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch {}
        }
    };
    const requestedLanguage = new URLSearchParams(location.search).get('lang');
    const savedLanguage = storage.get('lang');
    let language = ['it', 'en'].includes(requestedLanguage) ? requestedLanguage : ['it', 'en'].includes(savedLanguage) ? savedLanguage : navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'it';
    const t = key => translations[language][key] ?? translations.it[key] ?? key;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = storage.get('oakvx-motion') === 'paused';
    let motionEnabled = !paused && !reducedMotion.matches;
    const email = 'gabrielelucia07@gmail.com';
    let terminalApi;

    let stopTyping = () => {};

    function extrusions() {
        $$('[data-extrude]').forEach(element => {
            $$('.extrusion-layer', element).forEach(layer => layer.remove());
            const original = element.firstElementChild;
            if (!original) return;
            const colors = ['--b', '--g', '--y', '--o', '--r'];
            for (let index = 5; index > 0; index--) {
                const layer = document.createElement('span');
                layer.className = 'extrusion-layer';
                layer.setAttribute('aria-hidden', 'true');
                layer.style.setProperty('--layer', index);
                layer.style.setProperty('--layer-color', `var(${colors[index - 1]})`);
                const clone = original.cloneNode(true);
                [clone, ...$$('*', clone)].forEach(node => {
                    [...node.attributes].forEach(attribute => {
                        if (attribute.name.startsWith('data-') || attribute.name === 'id') node.removeAttribute(attribute.name);
                    });
                });
                layer.append(clone);
                element.append(layer);
            }
        });
    }

    function updateMotionButton() {
        const button = $('[data-motion-toggle]');
        if (!button) return;
        button.setAttribute('aria-pressed', String(!motionEnabled));
        const text = $('[data-k]', button);
        if (text) text.textContent = t(motionEnabled ? 'pause' : 'resume');
    }

    function changeLanguage(nextLanguage, remember = false) {
        language = nextLanguage;
        root.lang = language;
        root.dataset.copyLocale = language;
        $$('[data-k]').forEach(element => {
            const value = t(element.dataset.k);
            if (element.textContent !== value) element.textContent = value;
        });
        $$('[data-k-alt]').forEach(element => {
            element.alt = t(element.dataset.kAlt);
        });
        $$('[data-k-aria]').forEach(element => {
            element.setAttribute('aria-label', t(element.dataset.kAria));
        });
        $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
        const seoElement = $('#seo-translations');
        if (seoElement) {
            const seo = JSON.parse(seoElement.textContent)[language];
            document.title = seo.title;
            $('meta[name="description"]')?.setAttribute('content', seo.description);
            $('link[rel="canonical"]')?.setAttribute('href', seo.canonical);
            for (const prefix of ['og', 'twitter']) {
                for (const key of ['title', 'description', 'image']) {
                    $(`meta[${prefix === 'og' ? 'property' : 'name'}="${prefix}:${key}"]`)?.setAttribute('content', seo[key]);
                }
                $(`meta[${prefix === 'og' ? 'property' : 'name'}="${prefix}:${prefix === 'og' ? 'image:alt' : 'image:alt'}"]`)?.setAttribute('content', seo.image_alt);
            }
            $('meta[property="og:url"]')?.setAttribute('content', seo.canonical);
            $('meta[property="og:locale"]')?.setAttribute('content', language === 'it' ? 'it_IT' : 'en_GB');
        }
        if (remember) {
            storage.set('lang', language);
            const url = new URL(location.href);
            if (language === 'en') url.searchParams.set('lang', 'en');
            else url.searchParams.delete('lang');
            history.replaceState(null, '', url);
        }
        $$('a[href]').forEach(link => {
            const raw = link.getAttribute('href');
            if (!raw || raw.startsWith('#')) return;
            const url = new URL(raw, document.baseURI);
            if (url.origin !== location.origin || !(/\/$|\.html$/.test(url.pathname))) return;
            if (language === 'en') url.searchParams.set('lang', 'en');
            else url.searchParams.delete('lang');
            link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
        });
        extrusions();
        updateMotionButton();
        terminalApi?.translate();
    }

    function navigation() {
        const header = $('.site-header');
        const button = $('[data-menu-toggle]');
        const nav = $('#navigation');
        if (!button || !nav) return;
        const setOpen = open => {
            header.classList.toggle('menu-open', open);
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
        };
        button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
        nav.addEventListener('click', event => {
            if (event.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                button.focus();
            }
        });
        header.addEventListener('focusout', event => {
            if (!header.contains(event.relatedTarget)) setOpen(false);
        });
        matchMedia('(min-width: 1100px)').addEventListener('change', event => {
            if (event.matches) setOpen(false);
        });
    }

    function pageTransitions() {
        if (!Element.prototype.animate) return;
        const key = 'oakvx-page-transition';
        const curtain = document.createElement('div');
        curtain.className = 'page-transition';
        curtain.hidden = true;
        curtain.setAttribute('aria-hidden', 'true');
        for (let index = 0; index < 5; index++) curtain.append(document.createElement('i'));
        document.body.append(curtain);
        const bands = [...curtain.children];
        let animations = [];
        let destination = null;
        let timer = 0;
        let sequence = 0;
        const read = () => {
            try {
                const value = JSON.parse(sessionStorage.getItem(key));
                sessionStorage.removeItem(key);
                return value;
            } catch {
                return null;
            }
        };
        const reset = () => {
            sequence++;
            clearTimeout(timer);
            animations.forEach(animation => animation.cancel());
            animations = [];
            curtain.hidden = true;
            destination = null;
        };
        const navigate = () => {
            if (!destination) return;
            const url = destination;
            destination = null;
            clearTimeout(timer);
            try {
                sessionStorage.setItem(key, JSON.stringify({
                    url,
                    time: Date.now()
                }));
            } catch {}
            location.assign(url);
            timer = setTimeout(reset, 1500);
        };
        const play = entering => {
            const current = ++sequence;
            curtain.hidden = false;
            animations = bands.map((band, index) => {
                band.style.transformOrigin = entering ? 'right' : 'left';
                return band.animate([{
                        transform: `scaleX(${entering ? 1 : 0})`
                    },
                    {
                        transform: `scaleX(${entering ? 0 : 1})`
                    }
                ], {
                    duration: entering ? 220 : 180,
                    delay: index * 18,
                    easing: 'cubic-bezier(.76,0,.24,1)',
                    fill: 'both'
                });
            });
            return Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => current === sequence);
        };
        const entry = read();
        if (motionEnabled && entry?.url === location.href && Date.now() - entry.time < 5000) {
            try {
                play(true).then(current => {
                    if (current) reset();
                });
            } catch {
                reset();
            }
        }
        document.addEventListener('click', event => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest?.('a[href]');
            if (!link || link.hasAttribute('download') || link.hasAttribute('data-no-transition') || link.relList.contains('external')) return;
            const target = link.getAttribute('target');
            if (target && target.toLowerCase() !== '_self') return;
            const url = new URL(link.href);
            if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
            if (url.pathname === location.pathname && url.search === location.search) return;
            if (/\.[^/]+$/.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return;
            if (!motionEnabled || document.hidden) return;
            event.preventDefault();
            if (destination) return;
            reset();
            destination = url.href;
            timer = setTimeout(navigate, 400);
            try {
                play(false).then(current => {
                    if (current) navigate();
                });
            } catch {
                navigate();
            }
        });
        document.addEventListener('oakvx:motion', () => {
            if (!motionEnabled) {
                navigate();
                reset();
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                navigate();
                reset();
            }
        });
        addEventListener('pagehide', reset);
        addEventListener('pageshow', event => {
            if (event.persisted) reset();
        });
    }

    function waterName() {
        const scene = $('[data-water-scene]');
        if (!scene) return;
        const svg = $('[data-water-name]', scene);
        const hero = scene.closest('.hero');
        const replay = $('[data-water-replay]', scene);
        const actor = $('[data-chameleon-actor]', svg);
        const body = $('[data-chameleon-body]', actor);
        const can = $('[data-water-can]', actor);
        const tail = $('[data-tail]', actor);
        const legs = [$('[data-legs-a]', actor), $('[data-legs-b]', actor)];
        const eyelid = $('[data-eyelid]', actor);
        const tongue = $('[data-tongue]', actor);
        const pupil = $('[data-pupil]', actor);
        const jet = $('[data-cycle-jet]', svg);
        const jetPath = $('[data-cycle-jet-path]', jet);
        const ripple = $('[data-cycle-ripple]', jet);
        const splashes = $$('[data-cycle-splash]', jet);
        const drain = $('[data-cycle-drain]', svg);
        const drainPath = $('[data-drain-thread]', drain);
        const drainDrops = $$('[data-drain-drop]', drain);
        const mobile = matchMedia('(max-width: 699px)');
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const ctx = canvas.getContext('2d', {
            willReadFrequently: true
        });
        const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
        const number = n => Math.round(n * 1000) / 1000;
        const set = (element, name, value) => {
            value = String(value);
            const cache = element._waterValues || (element._waterValues = {});
            if (cache[name] !== value) {
                element.setAttribute(name, value);
                cache[name] = value;
            }
        };
        const words = $$('[data-cycle-word]', svg).map(element => ({
            element,
            glyphs: []
        }));
        const glyphs = $$('[data-water-glyph]', svg).map((element, index) => {
            const d = element.dataset;
            const word = words.find(word => word.element.dataset.cycleWord === d.word);
            const glyph = {
                element,
                index,
                char: d.char,
                word,
                textX: +d.textX,
                box: {
                    x: +d.inkX,
                    y: +d.inkY,
                    width: +d.inkWidth,
                    height: +d.inkHeight
                },
                impactX: +d.impactX,
                drainX: +d.drainX,
                drainY: +d.drainY,
                period: +d.period,
                amplitude: +d.amplitude,
                profile: [],
                layers: $$('[data-water-layer]', element).map((group, layerIndex) => ({
                    group,
                    index: layerIndex,
                    target: +group.dataset.target,
                    first: $('[data-wave-a]', group),
                    second: $('[data-wave-b]', group),
                    meniscus: $('[data-meniscus]', group)
                })),
                bubbles: $$('[data-cycle-bubble]', element),
                glint: $('[data-cycle-glint]', element),
                surface: 0
            };
            word.glyphs.push(glyph);
            return glyph;
        });
        let ready = false;
        let onScreen = hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight;
        let frame = 0;
        let lastStamp = 0;
        let elapsed = 0;
        let layout;
        let quality = 0;
        let fpsTime = 0;
        let fpsFrames = 0;
        let notified = false;
        const notifyReady = () => {
            if (!notified) {
                notified = true;
                document.dispatchEvent(new Event('oakvx:water-ready'));
            }
        };
        const sampleGlyph = glyph => {
            if (!ctx) return;
            ctx.font = '800 expanded 200px Archivo';
            ctx.letterSpacing = '0px';
            const metrics = ctx.measureText(glyph.char);
            if (ctx.font.includes('200px') && metrics.actualBoundingBoxAscent > 0) {
                glyph.box = {
                    x: glyph.textX - metrics.actualBoundingBoxLeft,
                    y: 200 - metrics.actualBoundingBoxAscent,
                    width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
                    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
                };
            }
            ctx.clearRect(0, 0, 512, 512);
            ctx.fillStyle = '#fff';
            ctx.fillText(glyph.char, 40, 250);
            const pixels = ctx.getImageData(0, 0, 512, 512).data;
            const b = glyph.box;
            const left = Math.max(0, Math.floor(40 + b.x - glyph.textX));
            const right = Math.min(511, Math.ceil(left + b.width + 1));
            const top = Math.max(0, Math.floor(b.y + 50));
            const bottom = Math.min(511, Math.ceil(top + b.height + 1));
            const mid = Math.round((top + bottom) / 2);
            const runs = [];
            let start = -1;
            for (let x = left; x <= right; x++) {
                const ink = pixels[(mid * 512 + x) * 4 + 3] > 100;
                if (ink && start < 0) start = x;
                if ((!ink || x === right) && start >= 0) {
                    runs.push([start, x - 1]);
                    start = -1;
                }
                for (let y = top; y <= bottom; y++) {
                    if (pixels[(y * 512 + x) * 4 + 3] > 100) {
                        glyph.profile.push({
                            x: glyph.textX + x - 40,
                            y: y - 50
                        });
                        break;
                    }
                }
            }
            if (runs.length) {
                const run = runs[runs.length - 1];
                glyph.impactX = glyph.textX + (run[0] + run[1]) / 2 - 40;
            }
        };
        const fit = () => {
            const width = scene.clientWidth;
            const padding = parseFloat(getComputedStyle(scene).paddingTop);
            const pageRect = scene.getBoundingClientRect();
            words.forEach(word => {
                const left = Math.min(...word.glyphs.map(glyph => glyph.box.x));
                const right = Math.max(...word.glyphs.map(glyph => glyph.box.x + glyph.box.width));
                const top = Math.min(...word.glyphs.map(glyph => glyph.box.y));
                const bottom = Math.max(...word.glyphs.map(glyph => glyph.box.y + glyph.box.height));
                word.box = {
                    x: left,
                    y: top,
                    width: right - left,
                    height: bottom - top
                };
            });
            const [first, second] = words;
            first.scale = 1;
            first.x = -first.box.x;
            first.y = mobile.matches ? -first.box.y : 0;
            second.scale = mobile.matches ? first.box.width / second.box.width : 1;
            second.x = mobile.matches ? -second.box.x * second.scale : first.box.width + 2 - second.box.x;
            second.y = mobile.matches ? first.box.height + 20 - second.box.y * second.scale : 0;
            layout = mobile.matches ? {
                x: 0,
                y: 0,
                width: first.box.width,
                height: first.box.height + 20 + second.box.height * second.scale
            } : {
                x: 0,
                y: Math.min(first.box.y, second.box.y),
                width: first.box.width + second.box.width + 2,
                height: Math.max(first.box.y + first.box.height, second.box.y + second.box.height) - Math.min(first.box.y, second.box.y)
            };
            layout.unit = width / layout.width;
            layout.actorPx = mobile.matches ? clamp(width * .17, 56, 82) : clamp(width * .095, 72, 150);
            layout.actorScale = layout.actorPx / layout.unit / 200;
            layout.pageLeft = pageRect.left;
            layout.pageTop = pageRect.top + padding;
            layout.sceneTop = pageRect.top;
            layout.paddingTop = padding;
            layout.barY = layout.y + layout.height + 28 / layout.unit;
            words.forEach(word => set(word.element, 'transform', `translate(${number(word.x)} ${number(word.y)}) scale(${number(word.scale)})`));
            svg.setAttribute('viewBox', `${layout.x} ${layout.y} ${layout.width} ${layout.height}`);
            svg.style.aspectRatio = `${layout.width} / ${layout.height}`;
            scene.classList.add('water-name-ready');
            replay.style.width = `${layout.actorPx}px`;
            replay.style.height = `${layout.actorPx * .7}px`;
            jetPath.setAttribute('d', 'M0 0V100');
            jetPath.setAttribute('pathLength', '1');
            jetPath.setAttribute('stroke-dasharray', '1');
            jetPath.removeAttribute('vector-effect');
            jetPath.setAttribute('stroke-width', 3 / layout.unit);
            ripple.setAttribute('d', 'M-8 0Q0 4 8 0');
            drainPath.setAttribute('d', 'M0 0V100');
            drainPath.setAttribute('pathLength', '1');
            drainPath.setAttribute('stroke-dasharray', '1');
            drainPath.removeAttribute('vector-effect');
            drainPath.setAttribute('stroke-width', 1.2 / layout.unit);
            [...splashes, ...drainDrops].forEach(drop => drop.setAttribute('r', 1.6 / layout.unit));
        };
        const globalPoint = (glyph, x, y) => ({
            x: x * glyph.word.scale + glyph.word.x,
            y: y * glyph.word.scale + glyph.word.y
        });
        const floorAt = (x, word) => {
            let nearest = {
                distance: Infinity,
                y: 55
            };
            for (const glyph of glyphs.filter(glyph => !mobile.matches || !word || glyph.word === word))
                for (const column of glyph.profile.length ? glyph.profile : [{
                        x: glyph.box.x + glyph.box.width / 2,
                        y: glyph.box.y
                    }]) {
                    const point = globalPoint(glyph, column.x, column.y);
                    const distance = Math.abs(point.x - x);
                    if (distance < nearest.distance) nearest = {
                        distance,
                        y: point.y
                    };
                }
            return nearest.y;
        };
        const schedule = glyph => {
            if (!mobile.matches) return 1.75 + glyph.index * (3.95 / 12);
            return glyph.index < 8 ? 1.75 + glyph.index * .14 : 4.83 + (glyph.index - 8) * .14;
        };
        const easeOut = p => {
            p = clamp(p);
            const q = p - 1;
            return 1 + 1.35 * q * q * q + .35 * q * q;
        };
        const drawGlyph = (glyph, t, phase, hold, still) => {
            const b = glyph.box;
            const start = schedule(glyph);
            const draining = phase === 'drain';
            const drainProgress = clamp((t - 12.5 - (glyphs.length - 1 - glyph.index) * .12) / 2.06);
            const common = still || phase === 'hold' ? 1 : phase === 'empty' || phase === 'pause' ? 0 : draining ? 1 : clamp((t - start) / 1.8);
            let top = b.y + b.height;
            for (const layer of glyph.layers) {
                const lag = glyph.layers.length === 1 ? 0 : (4 - layer.index) * .08;
                const p = phase === 'fill' ? clamp((t - start - lag) / (1.8 - lag)) : common;
                const fill = phase === 'fill' ? easeOut(p) : p;
                const empty = b.y + b.height + glyph.amplitude * 2 + 12;
                const final = b.y + b.height * (1 - layer.target);
                const y = draining ? final + Math.pow(drainProgress, 2) * (b.height + glyph.amplitude * 2 + 16) : empty + (final - empty) * fill;
                set(layer.group, 'transform', `translate(0 ${number(y)})`);
                if (!still && (phase === 'empty' || phase === 'pause' || draining && drainProgress >= 1)) {
                    top = Math.min(top, y);
                    continue;
                }
                const settled = still || phase === 'hold' ? .38 : draining ? .4 * (1 - drainProgress) + .08 : 1 - .6 * p;
                const time = still ? 0 : t;
                const period = glyph.period;
                const speed = phase === 'hold' ? 18 : 36;
                const offset = (time * (speed + layer.index * 2) + glyph.index * 5 + layer.index * 13) % period;
                const amplitude = glyph.amplitude * settled;
                const first = `matrix(${number(period / 100)} 0 0 ${number(amplitude)} ${number(b.x - period - offset)} 0)`;
                const firstSurface = y - Math.sin((glyph.impactX - b.x + offset) / period * Math.PI * 2) * amplitude;
                let surface = firstSurface;
                set(layer.first, 'transform', first);
                set(layer.meniscus, 'transform', first);
                set(layer.meniscus, 'opacity', p > 0 && p < 1 || phase === 'hold' || still ? .78 : 0);
                if (quality < 2) {
                    const secondPeriod = period * .73;
                    const secondOffset = (time * 28 + glyph.index * 3 + layer.index * 7) % secondPeriod;
                    set(layer.second, 'transform', `matrix(${number(secondPeriod / 100)} 0 0 ${number(amplitude * .55)} ${number(b.x - secondPeriod + secondOffset)} .4)`);
                    surface = Math.min(surface, y + .4 - Math.sin((glyph.impactX - b.x - secondOffset) / secondPeriod * Math.PI * 2) * amplitude * .55);
                }
                set(layer.second, 'opacity', quality < 2 ? 1 : 0);
                top = Math.min(top, surface);
            }
            glyph.surface = Math.min(top, b.y + b.height - 1);
            glyph.bubbles.forEach((bubble, index) => {
                if (still || phase !== 'hold' || quality === 2 || quality === 1 && index > 1) {
                    set(bubble, 'opacity', 0);
                    return;
                }
                const progress = (hold * .44 + index * .193 + glyph.index * .037) % 1;
                const y = b.y + b.height * (1 - progress * .86);
                const drift = Math.sin(progress * Math.PI * 2 + index) * Math.min(4, b.width * .06);
                set(bubble, 'transform', `translate(${number(drift)} ${number(y)})`);
                set(bubble, 'opacity', number(Math.sin(progress * Math.PI) * .68));
            });
            const glint = still || phase !== 'hold' ? 0 : (hold - .4 - glyph.index * .18) / .6;
            set(glyph.glint, 'opacity', glint > 0 && glint < 1 ? number(Math.sin(glint * Math.PI)) : 0);
            if (glint > 0 && glint < 1) set(glyph.glint, 'transform', `translate(${number((glint * 2 - 1) * (b.width + 30))} 0)`);
        };
        const pose = (glyph, angle, seated = false) => {
            const s = layout.actorScale;
            const r = angle * Math.PI / 180;
            const spout = {
                x: 145 + 45 * Math.cos(r) + 5 * Math.sin(r),
                y: 40 + 45 * Math.sin(r) - 5 * Math.cos(r)
            };
            const target = globalPoint(glyph, glyph.impactX, glyph.box.y);
            const x = seated ? globalPoint(glyph, glyph.box.x + glyph.box.width * .6, glyph.box.y).x - 97 * s : target.x - spout.x * s;
            const foot = x + 97 * s;
            const floor = floorAt(foot, glyph.word);
            return {
                x,
                y: floor - 116 * s,
                foot,
                floor,
                spout,
                glyph
            };
        };
        const render = (t, still = false) => {
            if (!layout) return;
            t %= 18;
            const phase = still ? 'hold' : t < 1.5 ? 'empty' : t < 7.5 ? 'fill' : t < 12.5 ? 'hold' : t < 16 ? 'drain' : 'pause';
            const hold = still ? 0 : t - 7.5;
            scene.dataset.cyclePhase = still ? 'static' : phase;
            scene.dataset.cycleTime = String(number(t));
            scene.dataset.quality = ['full', 'fewer-bubbles', 'one-wave'][quality];
            glyphs.forEach(glyph => drawGlyph(glyph, t, phase, hold, still));
            const last = glyphs[glyphs.length - 1];
            let position = pose(last, 0, true);
            let walking = false;
            let angle = 0;
            let pouring = false;
            let visit = last;
            if (!still && phase === 'fill') {
                let index = glyphs.findLastIndex(glyph => t >= schedule(glyph));
                if (index < 0) {
                    const end = pose(glyphs[0], 0);
                    const p = clamp((t - 1.5) / .25);
                    position = {
                        ...end,
                        x: end.x - (1 - p) * layout.actorScale * 260
                    };
                    walking = true;
                } else {
                    visit = glyphs[index];
                    const next = glyphs[index + 1];
                    const nextStart = next ? schedule(next) : 7.5;
                    const span = nextStart - schedule(visit);
                    const local = t - schedule(visit);
                    const travel = next ? clamp((local - Math.max(.08, span - .08)) / .08) : 0;
                    angle = next && travel > 0 ? 35 * (1 - travel) : 35 * clamp(local / .055);
                    position = pose(visit, angle);
                    pouring = local > .04 && !travel && t < schedule(visit) + 1.8;
                    if (travel && next) {
                        const destination = pose(next, 0);
                        position = {
                            ...position,
                            x: position.x + (destination.x - position.x) * travel,
                            y: position.y + (destination.y - position.y) * travel
                        };
                        position.y = floorAt(position.x + 97 * layout.actorScale, visit.word) - 116 * layout.actorScale;
                        walking = true;
                    }
                }
            } else if (!still && phase === 'empty') {
                position = pose(glyphs[0], 0);
                position.x -= layout.actorScale * 300;
            } else if (!still && phase === 'pause') {
                const p = clamp((t - 16) / 1.6);
                const from = pose(last, 0, true);
                position = {
                    ...from,
                    x: from.x + (-layout.actorScale * 250 - from.x) * p
                };
                position.y = floorAt(position.x + 97 * layout.actorScale, last.word) - 116 * layout.actorScale;
                walking = true;
            }
            const rowTransfer = !still && mobile.matches && t > 4.53 && t < 4.83;
            if (rowTransfer) {
                const p = (t - 4.53) / .3;
                position = p < .5 ? pose(glyphs[7], 0) : pose(glyphs[8], 0);
                set(actor, 'opacity', number(Math.abs(p * 2 - 1)));
                pouring = false;
            } else set(actor, 'opacity', still || phase === 'hold' || phase === 'drain' || phase === 'fill' || phase === 'pause' && t < 17.6 ? 1 : 0);
            const s = layout.actorScale;
            set(actor, 'transform', `translate(${number(position.x)} ${number(position.y)}) scale(${number(s)})`);
            set(can, 'transform', `rotate(${number(angle)} 145 80)`);
            set(tail, 'transform', `rotate(${number(pouring ? -8 : 0)} 50 78)`);
            const step = walking && Math.floor(t * 8) % 2;
            set(legs[0], 'opacity', step ? 0 : 1);
            set(legs[1], 'opacity', step ? 1 : 0);
            set(body, 'transform', `translate(0 ${walking ? number(Math.sin(t * Math.PI * 8) * 2) : 0})`);
            const blink = !still && phase === 'hold' && (hold > 1.15 && hold < 1.36 || hold > 4.1 && hold < 4.3);
            set(eyelid, 'opacity', blink ? 1 : 0);
            const flick = !still && phase === 'hold' ? clamp((hold - 2.9) / .4) : 0;
            const tongueScale = flick > 0 && flick < 1 ? Math.sin(flick * Math.PI) : 0;
            set(tongue, 'opacity', tongueScale > 0 ? 1 : 0);
            set(tongue, 'transform', `translate(139 58) scale(${number(tongueScale)} 1) translate(-139 -58)`);
            set(pupil, 'transform', phase === 'drain' ? 'translate(0 2.2)' : 'translate(0 0)');
            const hitX = position.x * layout.unit;
            const hitY = (position.y - layout.y) * layout.unit + layout.paddingTop;
            replay.style.transform = `translate(${number(hitX)}px,${number(hitY)}px)`;
            set(jet, 'opacity', pouring ? 1 : 0);
            if (pouring) {
                const startX = position.x + position.spout.x * s;
                const startY = position.y + position.spout.y * s;
                const target = globalPoint(visit, visit.impactX, visit.surface);
                const endY = Math.max(startY + 2 / layout.unit, target.y);
                set(jetPath, 'transform', `translate(${number(startX)} ${number(startY)}) scale(1 ${number((endY - startY) / 100)})`);
                set(jetPath, 'stroke-dashoffset', number(1 - clamp((t - schedule(visit) - .04) / .045)));
                const pulse = (t * 6) % 1;
                set(ripple, 'transform', `translate(${number(startX)} ${number(endY)}) scale(${number((.4 + pulse) / layout.unit)} ${number(.6 / layout.unit)})`);
                set(ripple, 'opacity', number(1 - pulse));
                splashes.forEach((drop, index) => {
                    const p = (t * 4.4 + index / 3) % 1;
                    const dx = (index - 1) * 9 * p / layout.unit;
                    const dy = (-12 * p + 18 * p * p) / layout.unit;
                    set(drop, 'transform', `translate(${number(startX + dx)} ${number(endY + dy)})`);
                    set(drop, 'opacity', number(Math.sin(p * Math.PI) * .8));
                });
            }
            const dripping = !still && t >= 14.5 && t < 16;
            set(drain, 'opacity', dripping ? number(Math.min(1, (16 - t) / .22)) : 0);
            if (dripping) {
                const first = glyphs[0];
                const start = globalPoint(first, first.drainX, first.drainY);
                const length = Math.max(8, layout.barY - start.y);
                set(drainPath, 'transform', `translate(${number(start.x)} ${number(start.y)}) scale(1 ${number(length / 100)})`);
                set(drainPath, 'stroke-dashoffset', number(1 - clamp((t - 14.5) / .2)));
                drainDrops.forEach((drop, index) => {
                    const p = ((t - 14.5) * 2 + index / 4) % 1;
                    set(drop, 'transform', `translate(${number(start.x)} ${number(start.y + length * p * p)})`);
                    set(drop, 'opacity', number(Math.sin(p * Math.PI)));
                });
            }
            if (phase === 'hold') notifyReady();
        };
        const changing = enabled => {
            actor.style.willChange = enabled ? 'transform' : '';
            glyphs.forEach(glyph => glyph.layers.forEach(layer => layer.group.style.willChange = enabled ? 'transform' : ''));
        };
        const stop = (still = false) => {
            cancelAnimationFrame(frame);
            frame = 0;
            lastStamp = 0;
            scene.dataset.cycleRunning = 'false';
            changing(false);
            if (still && ready) {
                render(9, true);
                notifyReady();
            }
        };
        const tick = stamp => {
            frame = 0;
            if (!ready || !motionEnabled || document.hidden || !onScreen) return;
            const dt = lastStamp ? Math.min(.12, Math.max(0, (stamp - lastStamp) / 1000)) : 0;
            lastStamp = stamp;
            elapsed += dt;
            fpsTime += dt;
            fpsFrames++;
            if (fpsTime >= 1.5) {
                const fps = fpsFrames / fpsTime;
                scene.dataset.fps = String(number(fps));
                if (mobile.matches && fps < 50 && quality < 2) quality++;
                fpsTime = 0;
                fpsFrames = 0;
            }
            scene.dataset.cycleIteration = String(Math.floor(elapsed / 18));
            render(elapsed);
            frame = requestAnimationFrame(tick);
        };
        const sync = () => {
            replay.disabled = !ready || !motionEnabled;
            if (!ready) return;
            if (!motionEnabled) {
                stop(true);
                return;
            }
            if (document.hidden || !onScreen) {
                stop();
                return;
            }
            if (!frame) {
                changing(true);
                scene.dataset.cycleRunning = 'true';
                lastStamp = performance.now();
                frame = requestAnimationFrame(tick);
            }
        };
        replay.addEventListener('click', () => {
            if (!ready || !motionEnabled) return;
            stop();
            elapsed = 0;
            render(0);
            sync();
        });
        document.addEventListener('oakvx:motion', sync);
        document.addEventListener('visibilitychange', sync);
        if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
            onScreen = entries[0].isIntersecting;
            sync();
        }, {
            threshold: 0
        }).observe(hero);
        const initialise = async () => {
            try {
                await document.fonts.load('800 expanded 200px Archivo', 'gabrielelucia');
                glyphs.forEach(sampleGlyph);
                fit();
                ready = true;
                if ('ResizeObserver' in window) {
                    let width = scene.clientWidth;
                    new ResizeObserver(() => {
                        if (Math.abs(scene.clientWidth - width) > 1) {
                            width = scene.clientWidth;
                            fit();
                            render(elapsed, !motionEnabled);
                        }
                    }).observe(scene);
                }
                mobile.addEventListener('change', () => {
                    fit();
                    render(elapsed, !motionEnabled);
                });
                render(motionEnabled ? 0 : 9, !motionEnabled);
                sync();
            } catch {
                stop();
                replay.disabled = true;
                notifyReady();
            }
        };
        initialise();
    }

    function copying() {
        const buttons = $$('[data-copy-email]');
        if (!buttons.length) return;
        const status = document.createElement('p');
        status.className = 'copy-status';
        status.setAttribute('role', 'status');
        document.body.append(status);
        let timer;
        buttons.forEach(button => button.addEventListener('click', async () => {
            let success = false;
            try {
                await navigator.clipboard.writeText(email);
                success = true;
            } catch {
                const field = document.createElement('textarea');
                field.value = email;
                field.className = 'clipboard-field';
                field.setAttribute('readonly', '');
                document.body.append(field);
                field.select();
                try {
                    success = document.execCommand('copy');
                } catch {}
                field.remove();
                button.focus({
                    preventScroll: true
                });
            }
            clearTimeout(timer);
            status.textContent = t(success ? 'copySuccess' : 'copyError');
            status.classList.add('show');
            timer = setTimeout(() => status.classList.remove('show'), 2800);
        }));
    }

    function terminal() {
        const shell = $('.terminal');
        if (!shell) return;
        const output = $('.terminal-output', shell);
        const form = $('.terminal-form', shell);
        const input = $('input', form);
        const commands = ['help', 'whoami', 'ls', 'skills', 'email', 'github', 'clear'];
        const history = [];
        let historyIndex = 0;
        let timer;
        let interrupted = false;
        let autoTyping = false;
        let initial = true;
        const line = (text, className = '') => {
            const p = document.createElement('p');
            p.textContent = text;
            p.className = className;
            output.append(p);
            return p;
        };
        const link = (label, href) => {
            const p = document.createElement('p');
            const a = document.createElement('a');
            a.textContent = label;
            a.href = href;
            if (href.startsWith('https:')) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            p.append(a);
            output.append(p);
        };
        const identity = () => {
            line('Gabriele Lucia');
            line(t('term.identity'));
        };
        const initialOutput = () => {
            output.replaceChildren();
            line('// oakvx / portfolio', 'muted');
            line('oakvx@portfolio:~ $ whoami', 'terminal-prompt');
            identity();
            line(t('term.start'), 'muted');
        };
        const run = (raw, automatic = false) => {
            const command = raw.trim().toLowerCase();
            if (!command) return;
            initial = false;
            if (automatic || command === 'clear') output.replaceChildren();
            if (command === 'clear') return;
            line(`oakvx@portfolio:~ $ ${raw.trim()}`, 'terminal-prompt');
            switch (command) {
                case 'help':
                    line(t('term.help'));
                    break;
                case 'whoami':
                    identity();
                    break;
                case 'skills':
                    line(t('term.skills'));
                    break;
                case 'email':
                    link(email, `mailto:${email}`);
                    break;
                case 'ls':
                    line(t('term.projects'));
                    link('01  Brat Animator ↗', `projects/brat-animator/${language === 'en' ? '?lang=en' : ''}`);
                    link('02  Synk ↗', `projects/synk/${language === 'en' ? '?lang=en' : ''}`);
                    link('03  Beautify ↗', `projects/beautify/${language === 'en' ? '?lang=en' : ''}`);
                    break;
                case 'github':
                    if (!automatic) window.open('https://github.com/oakvx', '_blank', 'noopener,noreferrer');
                    link('github.com/oakvx ↗', 'https://github.com/oakvx');
                    break;
                default:
                    line(t('term.unknown'));
            }
            while (output.children.length > 70) output.firstElementChild.remove();
            output.scrollTop = output.scrollHeight;
        };
        stopTyping = () => {
            interrupted = true;
            clearTimeout(timer);
            if (autoTyping) input.value = '';
            autoTyping = false;
        };
        shell.addEventListener('pointerdown', stopTyping, {
            once: true
        });
        shell.addEventListener('focusin', stopTyping, {
            once: true
        });
        input.addEventListener('input', stopTyping);
        input.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
                input.value = history[historyIndex] ?? '';
            } else if (event.key === 'Tab' && input.value) {
                const matches = commands.filter(command => command.startsWith(input.value.toLowerCase()));
                if (matches.length === 1) {
                    event.preventDefault();
                    input.value = matches[0];
                }
            }
        });
        form.addEventListener('submit', event => {
            event.preventDefault();
            stopTyping();
            const command = input.value;
            if (!command.trim()) return;
            history.push(command);
            historyIndex = history.length;
            input.value = '';
            run(command);
        });
        $$('[data-command]', shell).forEach(button => button.addEventListener('click', () => {
            stopTyping();
            run(button.dataset.command);
        }));
        terminalApi = {
            translate() {
                stopTyping();
                initialOutput();
                initial = true;
            }
        };
        const type = (index = 0) => {
            if (interrupted || !motionEnabled || document.hidden) return;
            autoTyping = true;
            input.value = 'whoami'.slice(0, index);
            if (index <= 6) timer = setTimeout(() => type(index + 1), 100);
            else {
                input.value = '';
                autoTyping = false;
                run('whoami', true);
            }
        };
        const startTyping = () => {
            if (motionEnabled && !interrupted) timer = setTimeout(type, 160);
        };
        if ($('[data-water-scene]')) document.addEventListener('oakvx:water-ready', startTyping, {
            once: true
        });
        else startTyping();
    }

    function scrollAndReveal() {
        const hero = $('.hero');
        const timeline = $('.timeline');
        const items = $$('.timeline-item');
        let frame = 0;
        const render = () => {
            frame = 0;
            const available = root.scrollHeight - innerHeight;
            root.style.setProperty('--progress', available > 0 ? Math.min(1, scrollY / available) : 1);
            if (timeline) {
                const rect = timeline.getBoundingClientRect();
                const amount = Math.min(1, Math.max(0, (innerHeight * .78 - rect.top) / (rect.height - 35)));
                timeline.style.setProperty('--timeline', motionEnabled ? amount : 1);
                items.forEach(item => item.classList.toggle('reached', !motionEnabled || item.getBoundingClientRect().top < innerHeight * .78));
            }

        };
        const schedule = () => {
            if (!frame && !document.hidden) frame = requestAnimationFrame(render);
        };
        addEventListener('scroll', schedule, {
            passive: true
        });
        addEventListener('resize', schedule, {
            passive: true
        });
        document.addEventListener('oakvx:motion', render);
        render();
        if (!('IntersectionObserver' in window)) return;
        const native = CSS.supports('animation-timeline', 'view()');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.target === hero) {
                    hero.classList.toggle('offscreen', !entry.isIntersecting);
                    if (!entry.isIntersecting) {
                        stopTyping();
                    }
                } else if (entry.isIntersecting && (!entry.target.classList.contains('native-reveal') || entry.intersectionRatio >= .35)) {
                    entry.target.classList.remove('pending');
                    entry.target.classList.remove('native-reveal');
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: [.03, .35]
        });
        if (hero) observer.observe(hero);
        $$('.reveal').forEach(element => {
            if (element.getBoundingClientRect().top >= innerHeight && motionEnabled) {
                element.classList.add(native ? 'native-reveal' : 'pending');
                observer.observe(element);
            }
        });
    }

    function setMotion() {
        motionEnabled = !paused && !reducedMotion.matches;
        root.classList.toggle('motion-enabled', motionEnabled);
        root.classList.toggle('motion-paused', !motionEnabled);
        root.dataset.motion = motionEnabled ? 'running' : 'paused';
        if (!motionEnabled) {
            document.body.classList.remove('hero-intro');
            stopTyping();

            $$('.reveal').forEach(element => element.classList.remove('pending', 'native-reveal'));
        }
        updateMotionButton();
        document.dispatchEvent(new Event('oakvx:motion'));
    }

    changeLanguage(language);
    root.classList.add('js');
    setMotion();
    navigation();
    pageTransitions();
    copying();
    terminal();
    waterName();
    if ('requestIdleCallback' in window) requestIdleCallback(scrollAndReveal, {
        timeout: 1200
    });
    else setTimeout(scrollAndReveal, 120);
    $$('[data-lang]').forEach(button => button.addEventListener('click', () => changeLanguage(button.dataset.lang, true)));
    $('[data-motion-toggle]')?.addEventListener('click', () => {
        paused = motionEnabled;
        storage.set('oakvx-motion', paused ? 'paused' : 'running');
        setMotion();
    });
    reducedMotion.addEventListener('change', setMotion);
    document.addEventListener('visibilitychange', () => {
        root.classList.toggle('document-hidden', document.hidden);
        if (document.hidden) {
            stopTyping();
        }
    });
})();