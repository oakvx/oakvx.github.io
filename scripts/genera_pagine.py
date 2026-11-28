#!/usr/bin/env python3
"""Genera le pagine italiane del sito a partire dai sorgenti in scripts/pagine/
(testata.html, colophon.html e corpi/*.html),
conservando i metadati SEO (title, meta, canonical, JSON-LD, seo-translations)
delle pagine esistenti."""
import re
import json
import subprocess
from collections import Counter
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
HERE = SITE / 'scripts' / 'pagine'

PAGES = [
    # file, corpo, R, route, numero, chiave titolo, titolo, campo, extra script
    ('index.html', 'index', './', '/', '01', 'nav.home', 'Ingresso', True, ''),
    ('chi-sono/index.html', 'chi-sono', '../', '/chi-sono/', '03', 'nav.about', 'Chi sono', True, ''),
    ('projects/brat-animator/index.html', 'brat', '../../', '/projects/brat-animator/', '02.1', 'seg.brat', 'Brat Animator', False, ''),
    ('projects/synk/index.html', 'synk', '../../', '/projects/synk/', '02.2', 'seg.synk', 'Synk', False, ''),
    ('projects/beautify/index.html', 'beautify', '../../', '/projects/beautify/', '02.3', 'seg.beautify', 'Beautify', False, ''),
    ('projects/autoofficina/index.html', 'autoofficina', '../../', '/projects/autoofficina/', '02.4', 'seg.spinotto', 'Spinotto Felice', False, ''),
    ('fuori-orario/index.html', 'fuori-orario', '../', '/fuori-orario/', '04', 'nav.after', 'Fuori orario', False, 'github-stats.js'),
    ('fuori-orario/classic/index.html', 'classic', '../../', '/fuori-orario/classic/', '04', 'nav.after', 'Fuori orario', False, ''),
    ('404.html', '404', '/', '/404.html', '—', 'seg.404', 'Pagina non trovata', True, ''),
    ('crediti/index.html', 'crediti', '../', '/crediti/', 'N.2', 'foot.credits', 'Crediti dei materiali', False, ''),
    ('privacy/index.html', 'privacy', '../', '/privacy/', 'N.1', 'foot.privacy', 'Privacy', False, ''),
    ('com-era/index.html', 'com-era', '../', '/com-era/', 'N.3', 'foot.before', 'Com’era', False, ''),
    ('metodo/index.html', 'metodo', '../', '/metodo/', '05', 'nav.method', 'Metodo', False, ''),
    ('lavori/index.html', 'lavori', '../', '/lavori/', '02', 'nav.archive', 'Tutti i lavori', False, ''),
    ('projects/piko/index.html', 'piko', '../../', '/projects/piko/', '02.5', 'seg.piko', 'piko', False, ''),
    ('projects/yag/index.html', 'yag', '../../', '/projects/yag/', '02.6', 'seg.yag', 'yag', False, ''),
    ('projects/middleman/index.html', 'middleman', '../../', '/projects/middleman/', '02.7', 'seg.middleman', 'middleManPS4', False, ''),
    ('servizi/index.html', 'servizi', '../', '/servizi/', '06', 'nav.services', 'Servizi', False, ''),
    ('sicurezza/index.html', 'sicurezza', '../', '/sicurezza/', '07', 'nav.security', 'Sicurezza', False, ''),
    ('stile/index.html', 'stile', '../', '/stile/', '08', 'nav.style', 'Stile', False, ''),
    ('contatti/index.html', 'contatti', '../', '/contatti/', '09', 'nav.contact', 'Contatti', False, ''),
    ('magazzino/index.html', 'magazzino', '../', '/magazzino/', 'M', 'nav.warehouse', 'Magazzino', False, 'magazzino/magazzino.css magazzino/deposito.js magazzino/corsia.js magazzino/magazzino.js'),
    ('magazzino/scala-40/index.html', 'magazzino-scala40', '../../', '/magazzino/scala-40/', 'M.4', 'gm.scala40', 'Scala 40', False, 'magazzino/magazzino.css magazzino/carte.js magazzino/disegno.js magazzino/deposito.js magazzino/tavolo.js magazzino/scala40.js'),
    ('magazzino/scopa/index.html', 'magazzino-scopa', '../../', '/magazzino/scopa/', 'M.3', 'gm.scopa', 'Scopa', False, 'magazzino/magazzino.css magazzino/carte.js magazzino/disegno.js magazzino/deposito.js magazzino/tavolo.js magazzino/scopa.js'),
    ('magazzino/briscola/index.html', 'magazzino-briscola', '../../', '/magazzino/briscola/', 'M.2', 'gm.briscola', 'Briscola', False, 'magazzino/magazzino.css magazzino/carte.js magazzino/disegno.js magazzino/deposito.js magazzino/tavolo.js magazzino/briscola.js'),
    ('magazzino/blackjack/index.html', 'magazzino-blackjack', '../../', '/magazzino/blackjack/', 'M.1', 'gm.blackjack', 'Blackjack', False, 'magazzino/magazzino.css magazzino/carte.js magazzino/disegno.js magazzino/deposito.js magazzino/tavolo.js magazzino/regia.js magazzino/blackjack.js'),
]

ORIGIN = 'https://oakvx.github.io'

# L'entità Person è la stessa in ogni pagina: definita qui una volta sola, viene
# scritta nel JSON-LD delle pagine nuove e sostituita in quelle già esistenti.
PERSON = {
    '@type': 'Person',
    '@id': ORIGIN + '/#person',
    'name': 'Gabriele Lucia',
    'alternateName': 'oakvx',
    'url': ORIGIN + '/chi-sono/',
    'image': ORIGIN + '/assets/avatars/showingoff-still.webp',
    'sameAs': [
        'https://github.com/oakvx',
        'https://github.com/oakvxish',
        'https://www.tiktok.com/@oakvx.sh',
        'https://www.tiktok.com/@uvst.oakvx',
        'https://www.instagram.com/oakvx/',
    ],
    'jobTitle': 'Developer e graphic designer',
    'homeLocation': {'@type': 'Place', 'name': 'Sassuolo', 'address': {
        '@type': 'PostalAddress', 'addressLocality': 'Sassuolo', 'addressRegion': 'MO', 'addressCountry': 'IT'}},
    'affiliation': {'@type': 'CollegeOrUniversity', 'name': 'Università degli Studi di Modena e Reggio Emilia',
                    'alternateName': 'UNIMORE', 'url': 'https://www.unimore.it/'},
    'knowsLanguage': ['it', 'en', 'es', 'el', 'zh'],
}
WEBSITE = {'@type': 'WebSite', '@id': ORIGIN + '/#website', 'url': ORIGIN + '/', 'name': 'Gabriele Lucia / oakvx',
           'alternateName': 'oakvx', 'inLanguage': ['it', 'en'], 'publisher': {'@id': ORIGIN + '/#person'}}

# Metadati delle pagine nate dopo il primo sito: titolo e descrizione nelle due lingue.
SEO_NUOVE = {
    '/crediti/': ('Crediti dei materiali | Gabriele Lucia (oakvx)', 'Font, immagini, modelli 3D e materiali dei progetti: licenze e provenienza di tutto quello che si vede nel sito di Gabriele Lucia.',
                  'Materials credits | Gabriele Lucia (oakvx)', 'Fonts, images, 3D models and project materials: licences and origin of everything on Gabriele Lucia’s site.', 'crediti'),
    '/privacy/': ('Privacy | Gabriele Lucia (oakvx)', 'Il sito di Gabriele Lucia non usa cookie né statistiche: cosa resta nel browser, quali servizi vedono la visita e cosa succede se gli scrivi.',
                  'Privacy | Gabriele Lucia (oakvx)', 'Gabriele Lucia’s site uses no cookies and no analytics: what stays in your browser, which services see your visit and what happens if you write.', 'privacy'),
    '/com-era/': ('Com’era: il sito prima del nero | Gabriele Lucia (oakvx)', 'Il sito di Gabriele Lucia fino al 26 novembre 2026, ricostruito dal codice di quel giorno e fotografato, su una tavola da disegno da ingrandire.',
                  'As it was: the site before the black | Gabriele Lucia (oakvx)', 'Gabriele Lucia’s site until 26 November 2026, rebuilt from that day’s code and photographed, on a drawing sheet you can zoom.', 'com-era'),
    '/metodo/': ('Metodo | Gabriele Lucia (oakvx)', 'Come lavora Gabriele Lucia: i principi che tornano in ogni suo progetto, con le prove prese dal codice.',
                 'Method | Gabriele Lucia (oakvx)', 'How Gabriele Lucia works: the principles that show up in every project, with evidence from the code.', 'metodo'),
    '/lavori/': ('Portfolio: tutti i lavori | Gabriele Lucia (oakvx)', 'Tutti i progetti di Gabriele Lucia: casi studio, strumenti, ricerca ed esperimenti, con stato e tecnologie.',
                 'Portfolio: all work | Gabriele Lucia (oakvx)', 'Every project by Gabriele Lucia: case studies, tools, research and experiments, with status and technologies.', 'lavori'),
    '/projects/piko/': ('piko: un agente locale che chiede il permesso | Gabriele Lucia', 'piko osserva l’app in primo piano, scrive un piano con un modello locale e agisce solo dopo l’approvazione. Windows, Python, Tauri.',
                        'piko: a local agent that asks first | Gabriele Lucia', 'piko looks at the foreground app, writes a plan with a local model and acts only after approval. Windows, Python, Tauri.', 'piko'),
    '/projects/yag/': ('yag: un gateway AI in C17 | Gabriele Lucia', 'Yet Another Gateway: autenticazione, instradamento e traduzione fra OpenAI, Responses e Anthropic in un binario C17.',
                       'yag: an AI gateway in C17 | Gabriele Lucia', 'Yet Another Gateway: authentication, routing and translation between OpenAI, Responses and Anthropic in one C17 binary.', 'yag'),
    '/servizi/': ('Servizi: siti web, software e grafica | Gabriele Lucia', 'Cosa fa Gabriele Lucia, developer a Sassuolo, per chi gli scrive: siti web, software e backend, grafica e social, assistenza informatica.',
                  'Services: websites, software and graphics | Gabriele Lucia', 'What Gabriele Lucia, a developer in Sassuolo, Italy, does for the people who write to him: websites, software and backend, graphics, IT support.', 'servizi'),
    '/sicurezza/': ('Sicurezza | Gabriele Lucia (oakvx)', 'Come Gabriele Lucia tratta dati e sicurezza nei suoi progetti, con le prove dal codice, e cosa non promette.',
                    'Security | Gabriele Lucia (oakvx)', 'How Gabriele Lucia handles data and security in his projects, with evidence from the code, and what he does not promise.', 'sicurezza'),
    '/stile/': ('Stile: la guida grafica del sito | Gabriele Lucia', 'La guida grafica di questo sito: palette nero e cremisi, caratteri Fraunces, Archivo e Cascadia Code, griglia, componenti e movimento.',
                'Style: the design guide of this site | Gabriele Lucia', 'The style guide of this site: a black and crimson palette, Fraunces, Archivo and Cascadia Code type, grid, components and motion.', 'stile'),
    '/magazzino/blackjack/': ('Blackjack online gratis con gettoni finti | oakvx', 'Blackjack gratis nel browser contro il banco, con gettoni finti: sei mazzi, il banco sta su 17, il blackjack paga 3 a 2.',
                    'Free online blackjack with fake chips | oakvx', 'Free blackjack in the browser against the dealer, with fake chips: six decks, dealer stands on 17, blackjack pays 3 to 2.', 'blackjack'),
    '/magazzino/briscola/': ('Briscola online gratis contro il computer | oakvx', 'Gioca a briscola online gratis con le carte siciliane, uno contro il computer: 120 punti in palio, vince chi ne fa più di 60. Senza registrarsi.',
                    'Free online Briscola against the computer | oakvx', 'Play Briscola online for free with Sicilian cards, one on one against the computer: 120 points at stake, more than 60 wins. No sign-up.', 'briscola'),
    '/magazzino/scopa/': ('Scopa online gratis contro il computer | oakvx', 'Gioca a scopa online gratis con le carte siciliane: settebello, primiera e scope, si va a 11 contro il computer. Senza registrarsi.',
                    'Free online Scopa against the computer | oakvx', 'Play Scopa online for free with Sicilian cards: settebello, primiera and sweeps, first to 11 against the computer. No sign-up.', 'scopa'),
    '/magazzino/scala-40/': ('Scala 40 online gratis contro il computer | oakvx', 'Scala 40 gratis nel browser contro il computer: due mazzi, quattro jolly, si apre con 40 punti. Senza registrarsi.',
                    'Free online Scala 40 against the computer | oakvx', 'Free Scala 40 in the browser against the computer: two decks, four jokers, open with 40 points. No sign-up.', 'scala-40'),
    '/magazzino/': ('Giochi di carte gratis nel browser | Magazzino di oakvx', 'Il Magazzino di oakvx: carte siciliane, blackjack con gettoni finti e classici da giocare nel browser. Gratis, senza registrarsi.',
                    'Free card games in the browser | oakvx Warehouse', 'The oakvx Warehouse: Sicilian cards, blackjack with fake chips and classics to play in the browser. Free, no sign-up.', 'magazzino'),
    '/contatti/': ('Contatti | Gabriele Lucia (oakvx), developer a Sassuolo', 'Come scrivere a Gabriele Lucia (oakvx) per un sito, un programma o un logo: email, GitHub e TikTok. Risponde in italiano, inglese, spagnolo, greco e cinese.',
                   'Contact | Gabriele Lucia (oakvx), developer in Italy', 'How to reach Gabriele Lucia (oakvx) about a website, a program or a logo: email, GitHub and TikTok. He replies in Italian, English, Spanish, Greek and Chinese.', 'contatti'),
    '/projects/middleman/': ('middleManPS4: laboratorio di ricerca su PS4 | Gabriele Lucia', 'Un laboratorio di ricerca su PS4: payload in C, analisi offline in Python e una regola sola, ogni affermazione porta un’etichetta.',
                             'middleManPS4: a PS4 research lab | Gabriele Lucia', 'A PS4 research lab: C payloads, offline Python analysis and one rule, every claim carries a tag.', 'middleman'),
}

# Dati strutturati delle pagine nuove: tipo di pagina, briciole (nome italiano e
# percorso; build_static.py traduce i nomi) ed eventuale oggetto principale.
SCHEMA_NUOVE = {
    '/crediti/': {'tipo': 'WebPage', 'briciole': [('Crediti dei materiali', '/crediti/')]},
    '/privacy/': {'tipo': 'WebPage', 'briciole': [('Privacy', '/privacy/')]},
    '/com-era/': {'tipo': 'WebPage', 'briciole': [('Com’era', '/com-era/')]},
    '/metodo/': {'tipo': 'WebPage', 'briciole': [('Metodo', '/metodo/')]},
    '/lavori/': {'tipo': 'CollectionPage', 'briciole': [('Tutti i lavori', '/lavori/')]},
    '/servizi/': {'tipo': 'WebPage', 'briciole': [('Servizi', '/servizi/')],
                  'servizi': ['Siti web', 'Software e backend', 'Grafica e social', 'Assistenza informatica']},
    '/sicurezza/': {'tipo': 'WebPage', 'briciole': [('Sicurezza', '/sicurezza/')]},
    '/stile/': {'tipo': 'WebPage', 'briciole': [('Stile', '/stile/')]},
    '/contatti/': {'tipo': 'ContactPage', 'briciole': [('Contatti', '/contatti/')]},
    '/projects/piko/': {'tipo': 'WebPage', 'briciole': [('piko', '/projects/piko/')],
                        'progetto': ('piko', 'https://github.com/oakvx/piko', ['Python'])},
    '/projects/yag/': {'tipo': 'WebPage', 'briciole': [('yag', '/projects/yag/')],
                       'progetto': ('yag', 'https://github.com/oakvx/yag', ['C'])},
    '/projects/middleman/': {'tipo': 'WebPage', 'briciole': [('middleManPS4', '/projects/middleman/')],
                             'progetto': ('middleManPS4', 'https://github.com/oakvx/middleManPS4', ['C', 'Python'])},
    '/magazzino/': {'tipo': 'CollectionPage', 'briciole': [('Magazzino', '/magazzino/')]},
    '/magazzino/blackjack/': {'tipo': 'WebPage', 'briciole': [('Magazzino', '/magazzino/'), ('Blackjack', '/magazzino/blackjack/')],
                              'gioco': ('Blackjack', 'Gioco di carte')},
    '/magazzino/briscola/': {'tipo': 'WebPage', 'briciole': [('Magazzino', '/magazzino/'), ('Briscola', '/magazzino/briscola/')],
                             'gioco': ('Briscola', 'Gioco di carte')},
    '/magazzino/scopa/': {'tipo': 'WebPage', 'briciole': [('Magazzino', '/magazzino/'), ('Scopa', '/magazzino/scopa/')],
                          'gioco': ('Scopa', 'Gioco di carte')},
    '/magazzino/scala-40/': {'tipo': 'WebPage', 'briciole': [('Magazzino', '/magazzino/'), ('Scala 40', '/magazzino/scala-40/')],
                             'gioco': ('Scala 40', 'Gioco di carte')},
}


def json_ld(graph: list) -> str:
    dati = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':'))
    return '<script type="application/ld+json">' + dati.replace('</', '<\\/') + '</script>'


def schema_nuova(route: str, title: str, description: str, image: str, image_alt: str) -> str:
    conf = SCHEMA_NUOVE[route]
    url = ORIGIN + route
    persona = {'@id': ORIGIN + '/#person'}
    pagina = {
        '@type': conf['tipo'], '@id': url + '#webpage', 'url': url, 'name': title, 'description': description,
        'inLanguage': 'it', 'isPartOf': {'@id': ORIGIN + '/#website'}, 'author': persona,
        'primaryImageOfPage': {'@id': url + '#primaryimage'}, 'breadcrumb': {'@id': url + '#breadcrumb'},
    }
    graph = [PERSON, WEBSITE, pagina,
             {'@type': 'ImageObject', '@id': url + '#primaryimage', 'url': image, 'contentUrl': image,
              'width': 1200, 'height': 630, 'caption': image_alt, 'inLanguage': 'it'}]
    briciole = [('Home', '/')] + conf['briciole']
    graph.append({'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': nome, 'item': ORIGIN + percorso}
        for i, (nome, percorso) in enumerate(briciole, 1)]})
    if 'progetto' in conf:
        nome, repo, linguaggi = conf['progetto']
        pagina['mainEntity'] = pagina['about'] = {'@id': url + '#project'}
        graph.append({'@type': 'CreativeWork', '@id': url + '#project', 'name': nome, 'description': description,
                      'creator': persona, 'url': url, 'mainEntityOfPage': {'@id': url + '#webpage'},
                      'hasPart': {'@id': url + '#source'}})
        graph.append({'@type': 'SoftwareSourceCode', '@id': url + '#source', 'name': nome + ' — codice sorgente',
                      'url': repo, 'codeRepository': repo, 'programmingLanguage': linguaggi,
                      'creator': persona, 'isPartOf': {'@id': url + '#project'}})
    if 'gioco' in conf:
        nome, genere = conf['gioco']
        pagina['mainEntity'] = {'@id': url + '#game'}
        graph.append({'@type': 'VideoGame', '@id': url + '#game', 'name': nome, 'description': description,
                      'url': url, 'genre': genere, 'gamePlatform': 'Web browser', 'applicationCategory': 'GameApplication',
                      'operatingSystem': 'Any', 'isAccessibleForFree': True, 'inLanguage': 'it', 'author': persona})
    if 'servizi' in conf:
        pagina['about'] = [{'@type': 'Service', 'name': nome, 'provider': persona} for nome in conf['servizi']]
    if route == '/contatti/':
        pagina['mainEntity'] = persona
    return json_ld(graph)


def seo_nuova(route: str) -> str:
    import json as _j
    it_t, it_d, en_t, en_d, img = SEO_NUOVE[route]
    url = 'https://oakvx.github.io' + route
    url_en = 'https://oakvx.github.io/en' + route
    e = lambda x: x.replace('&', '&amp;').replace('"', '&quot;')
    it_alt = it_t.split(' | ')[0] + ' — Gabriele Lucia / oakvx'
    en_alt = en_t.split(' | ')[0] + ' — Gabriele Lucia / oakvx'
    it_img = f'https://oakvx.github.io/assets/social-{img}-it.png'
    trad = {'it': {'title': it_t, 'description': it_d, 'canonical': url, 'image': it_img, 'image_alt': it_alt},
            'en': {'title': en_t, 'description': en_d, 'canonical': url_en, 'image': f'https://oakvx.github.io/assets/social-{img}-en.png', 'image_alt': en_alt}}
    return '\n'.join([
        '<meta name="referrer" content="strict-origin-when-cross-origin">',
        f'<title>{e(it_t)}</title>',
        f'<meta name="description" content="{e(it_d)}">',
        '<meta name="author" content="Gabriele Lucia">',
        '<meta name="robots" content="index, follow, max-image-preview:large">',
        f'<link rel="canonical" href="{url}">',
        f'<link rel="alternate" hreflang="it" href="{url}">',
        f'<link rel="alternate" hreflang="en" href="{url_en}">',
        f'<link rel="alternate" hreflang="x-default" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Gabriele Lucia / oakvx">',
        f'<meta property="og:title" content="{e(it_t)}">',
        f'<meta property="og:description" content="{e(it_d)}">',
        f'<meta property="og:url" content="{url}">',
        '<meta property="og:locale" content="it_IT">',
        '<meta property="og:locale:alternate" content="en_GB">',
        f'<meta property="og:image" content="{it_img}">',
        f'<meta property="og:image:secure_url" content="{it_img}">',
        '<meta property="og:image:type" content="image/png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{e(it_alt)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{e(it_t)}">',
        f'<meta name="twitter:description" content="{e(it_d)}">',
        f'<meta name="twitter:image" content="{it_img}">',
        f'<meta name="twitter:image:alt" content="{e(it_alt)}">',
        schema_nuova(route, it_t, it_d, it_img, it_alt),
        '<script type="application/json" id="seo-translations">' + _j.dumps(trad, ensure_ascii=False) + '</script>',
    ])

BOOT = """<script data-ingresso-bootstrap>(()=>{const r=document.documentElement;let seen=false;try{seen=sessionStorage.getItem('oakvx-ingresso')==='1'}catch{}const v=new URLSearchParams(location.search).get('ingresso'),bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);if(v==='1'||(v!=='0'&&!seen&&!bot)){r.classList.add('ingresso-attivo');setTimeout(()=>{if(!window.__oakvxIngresso)r.classList.remove('ingresso-attivo')},1500)}})();</script>"""

PREPAINT = """<script>(()=>{const r=document.documentElement;r.classList.add('js');let lang=null,paused=false;const bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);try{lang=localStorage.getItem('lang');paused=localStorage.getItem('motion')==='paused'}catch{}const q=new URLSearchParams(location.search).get('lang');if(q==='it'||q==='en'){lang=q;try{localStorage.setItem('lang',q)}catch{}}if(!lang&&!bot&&(navigator.language||'').toLowerCase().startsWith('en'))lang='en';if(lang==='en'&&r.dataset.staticLang!=='en'&&r.dataset.langEnUrl&&!bot){location.replace(r.dataset.langEnUrl+location.hash);return}const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce||paused)r.classList.add('calm');if(paused)r.classList.add('paused');try{const e=Date.now()-Number(sessionStorage.getItem('nero-sparo'));if(!reduce&&!paused&&e>=0&&e<3000)r.classList.add('sparo-arrivo')}catch{}})();</script>"""


def aggiorna_persona(tag: str) -> str:
    """Sostituisce il nodo Person di un JSON-LD esistente con PERSON."""
    corpo = re.search(r'>(.*)</script>', tag, re.S).group(1)
    dati = json.loads(corpo)
    graph = dati.get('@graph', [])
    if not any(nodo.get('@type') == 'Person' for nodo in graph):
        return tag
    dati['@graph'] = [PERSON if nodo.get('@type') == 'Person' else nodo for nodo in graph]
    return json_ld(dati['@graph'])


def seo_block(old: str) -> str:
    head = old.split('</head>')[0]
    items = []
    for m in re.finditer(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*>|<script type="application/(?:ld\+)?json"[^>]*>.*?</script>', head, re.S):
        tag = m.group(0)
        low = tag.lower()
        if low.startswith('<meta'):
            if 'charset' in low or 'name="viewport"' in low or 'color-scheme' in low or 'theme-color' in low:
                continue
        if low.startswith('<link'):
            rel = re.search(r'rel="([^"]+)"', low)
            if not rel or rel.group(1) not in ('canonical', 'alternate'):
                continue
        if low.startswith('<script type="application/ld+json"'):
            tag = aggiorna_persona(tag)
        items.append(tag)
    return '\n'.join(items)


def commit_sito():
    run = lambda *a: subprocess.run(['git', *a], cwd=SITE, capture_output=True, text=True, check=True).stdout.strip()
    date = run('log', '--format=%ad', '--date=short').split('\n')
    giorni = Counter(date)
    ultimo = run('log', '-1', '--format=%s')
    mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
    it = lambda d: f"{int(d[8:])} {mesi[int(d[5:7]) - 1]} {d[:4]}"
    primo = min(giorni)
    record = max(giorni.items(), key=lambda kv: kv[1])
    dati = {'totale': len(date), 'giorni': dict(sorted(giorni.items())), 'ultimo': ultimo}
    return {
        '%COMMIT_TOTALE%': str(len(date)), '%COMMIT_PRIMO%': it(primo), '%COMMIT_GIORNI%': str(len(giorni)),
        '%COMMIT_RECORD%': f"{record[1]} · {it(record[0])}", '%COMMIT_ULTIMO%': ultimo.replace('&', '&amp;').replace('<', '&lt;'),
        '%COMMIT_JSON%': json.dumps(dati, ensure_ascii=False).replace('</', '<\\/'),
    }


def main():
    commit = commit_sito()
    testata = (HERE / 'testata.html').read_text(encoding='utf-8')
    tecnologie = (HERE / 'tecnologie.html').read_text(encoding='utf-8')
    tecnologie_sito = (HERE / 'tecnologie-sito.html').read_text(encoding='utf-8')
    colophon = (HERE / 'colophon.html').read_text(encoding='utf-8')
    for file, body, R, route, num, tkey, titolo, campo, extra in PAGES:
        target = SITE / file
        target.parent.mkdir(parents=True, exist_ok=True)
        old = target.read_text(encoding='utf-8') if target.exists() and route not in SEO_NUOVE else ''
        en = re.search(r'<html[^>]*data-lang-en-url="([^"]+)"', old)
        en_url = en.group(1) if en else '/en' + route
        a = R + 'assets/'
        if file.startswith('assets/'):
            a = ''
        scripts = [f'<script src="{a}nero/proiettile.js" defer></script>', f'<script src="{a}nero/gelatina.js" defer></script>', f'<script src="{a}nero/nero.js" defer></script>']
        if campo:
            scripts.append(f'<script src="{a}nero/campo.js" defer></script>')
        for x in extra.split():
            if x.endswith('.css'):
                scripts.insert(0, f'<link rel="stylesheet" href="{a}{x}">')
            else:
                scripts.append(f'<script src="{a}{x}" defer></script>')
        head = f"""<!doctype html>
<html lang="it" data-lang-en-url="{en_url}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script type="importmap">{{"imports":{{"three":"/gioco/vendor/three/three.module.js"}}}}</script>
{BOOT}
<link rel="stylesheet" href="{a}ingresso/ingresso.css">
{PREPAINT}
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#050505">
<link rel="icon" href="{a}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{a}favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="{a}apple-touch-icon.png">
<link rel="preload" href="{a}nero/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{a}nero/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{a}nero/nero.css">
{chr(10).join(scripts)}
{seo_nuova(route) if route in SEO_NUOVE else seo_block(old)}
</head>
"""
        part = lambda s: (s.replace('%R%', R).replace('%ROUTE%', route).replace('%N%', num)
                          .replace('%TKEY%', tkey).replace('%TITOLO%', titolo)
                          .replace('%TECNOLOGIE_SITO%', tecnologie_sito).replace('%TECNOLOGIE%', tecnologie))
        content = (HERE / 'corpi' / f'{body}.html').read_text(encoding='utf-8')
        for k, v in commit.items():
            content = content.replace(k, v)
        if file.startswith('assets/'):
            content = content  # i link dei crediti sono già relativi a /assets/
        html = head + f'<body data-pagina="{body}">\n' + part(testata) + '\n' + part(content) + '\n' + part(colophon) + \
            f'\n<script src="{a}ingresso/ingresso.js" defer></script>\n</body>\n</html>\n'
        target.write_text(html, encoding='utf-8', newline='\n')
        print('wrote', file)


if __name__ == '__main__':
    main()
