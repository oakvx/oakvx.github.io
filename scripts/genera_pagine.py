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
    ('assets/CREDITS.html', 'credits', '../', '/assets/CREDITS.html', '06', 'foot.credits', 'Crediti dei materiali', False, ''),
    ('metodo/index.html', 'metodo', '../', '/metodo/', '05', 'nav.method', 'Metodo', False, ''),
    ('lavori/index.html', 'lavori', '../', '/lavori/', '02', 'nav.archive', 'Tutti i lavori', False, ''),
    ('projects/piko/index.html', 'piko', '../../', '/projects/piko/', '02.5', 'seg.piko', 'piko', False, ''),
    ('projects/yag/index.html', 'yag', '../../', '/projects/yag/', '02.6', 'seg.yag', 'yag', False, ''),
    ('projects/middleman/index.html', 'middleman', '../../', '/projects/middleman/', '02.7', 'seg.middleman', 'middleManPS4', False, ''),
]

# Metadati delle pagine nate dopo il primo sito: titolo e descrizione nelle due lingue.
SEO_NUOVE = {
    '/metodo/': ('Metodo | Gabriele Lucia (oakvx)', 'Come lavora Gabriele Lucia: i principi che tornano in ogni suo progetto, con le prove prese dal codice.',
                 'Method | Gabriele Lucia (oakvx)', 'How Gabriele Lucia works: the principles that show up in every project, with evidence from the code.', 'home'),
    '/lavori/': ('Tutti i lavori | Gabriele Lucia (oakvx)', 'Tutti i progetti di Gabriele Lucia: casi studio, strumenti, ricerca ed esperimenti, con stato e tecnologie.',
                 'All work | Gabriele Lucia (oakvx)', 'Every project by Gabriele Lucia: case studies, tools, research and experiments, with status and technologies.', 'home'),
    '/projects/piko/': ('piko: un agente locale che chiede il permesso | Gabriele Lucia', 'piko osserva l’app in primo piano, scrive un piano con un modello locale e agisce solo dopo l’approvazione. Windows, Python, Tauri.',
                        'piko: a local agent that asks first | Gabriele Lucia', 'piko looks at the foreground app, writes a plan with a local model and acts only after approval. Windows, Python, Tauri.', 'home'),
    '/projects/yag/': ('yag: un gateway AI in C17 | Gabriele Lucia', 'Yet Another Gateway: autenticazione, instradamento e traduzione fra OpenAI, Responses e Anthropic in un binario C17.',
                       'yag: an AI gateway in C17 | Gabriele Lucia', 'Yet Another Gateway: authentication, routing and translation between OpenAI, Responses and Anthropic in one C17 binary.', 'home'),
    '/projects/middleman/': ('middleManPS4: ricerca con le affermazioni etichettate | Gabriele Lucia', 'Un laboratorio di ricerca su PS4: payload in C, analisi offline in Python e una regola sola, ogni affermazione porta un’etichetta.',
                             'middleManPS4: research with tagged claims | Gabriele Lucia', 'A PS4 research lab: C payloads, offline Python analysis and one rule, every claim carries a tag.', 'home'),
}


def seo_nuova(route: str) -> str:
    import json as _j
    it_t, it_d, en_t, en_d, img = SEO_NUOVE[route]
    url = 'https://oakvx.github.io' + route
    url_en = 'https://oakvx.github.io/en' + route
    e = lambda x: x.replace('&', '&amp;').replace('"', '&quot;')
    trad = {'it': {'title': it_t, 'description': it_d, 'canonical': url, 'image': f'https://oakvx.github.io/assets/social-{img}-it.png', 'image_alt': 'Gabriele Lucia / oakvx'},
            'en': {'title': en_t, 'description': en_d, 'canonical': url_en, 'image': f'https://oakvx.github.io/assets/social-{img}-en.png', 'image_alt': 'Gabriele Lucia / oakvx'}}
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
        f'<meta property="og:image" content="https://oakvx.github.io/assets/social-{img}-it.png">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{e(it_t)}">',
        f'<meta name="twitter:description" content="{e(it_d)}">',
        f'<meta name="twitter:image" content="https://oakvx.github.io/assets/social-{img}-it.png">',
        '<script type="application/json" id="seo-translations">' + _j.dumps(trad, ensure_ascii=False) + '</script>',
    ])

BOOT = """<script data-ingresso-bootstrap>(()=>{const r=document.documentElement;let seen=false;try{seen=sessionStorage.getItem('oakvx-ingresso')==='1'}catch{}const v=new URLSearchParams(location.search).get('ingresso'),bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);if(v==='1'||(v!=='0'&&!seen&&!bot)){r.classList.add('ingresso-attivo');setTimeout(()=>{if(!window.__oakvxIngresso)r.classList.remove('ingresso-attivo')},4000)}})();</script>"""

PREPAINT = """<script>(()=>{const r=document.documentElement;r.classList.add('js');let lang=null,paused=false;const bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);try{lang=localStorage.getItem('lang');paused=localStorage.getItem('motion')==='paused'}catch{}const q=new URLSearchParams(location.search).get('lang');if(q==='it'||q==='en'){lang=q;try{localStorage.setItem('lang',q)}catch{}}if(!lang&&!bot&&(navigator.language||'').toLowerCase().startsWith('en'))lang='en';if(lang==='en'&&r.dataset.staticLang!=='en'&&r.dataset.langEnUrl&&!bot){location.replace(r.dataset.langEnUrl+location.hash);return}const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce||paused)r.classList.add('calm');if(paused)r.classList.add('paused');try{const e=Date.now()-Number(sessionStorage.getItem('nero-sparo'));if(!reduce&&!paused&&e>=0&&e<3000)r.classList.add('sparo-arrivo')}catch{}})();</script>"""


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
    testata = (HERE / 'testata.html').read_text()
    colophon = (HERE / 'colophon.html').read_text()
    for file, body, R, route, num, tkey, titolo, campo, extra in PAGES:
        target = SITE / file
        target.parent.mkdir(parents=True, exist_ok=True)
        old = target.read_text() if target.exists() and route not in SEO_NUOVE else ''
        en = re.search(r'<html[^>]*data-lang-en-url="([^"]+)"', old)
        en_url = en.group(1) if en else '/en' + route
        a = R + 'assets/'
        if file.startswith('assets/'):
            a = ''
        scripts = [f'<script src="{a}nero/proiettile.js" defer></script>', f'<script src="{a}nero/nero.js" defer></script>']
        if campo:
            scripts.append(f'<script src="{a}nero/campo.js" defer></script>')
        if extra:
            scripts.append(f'<script src="{a}{extra}" defer></script>')
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
<link rel="preload" href="{a}nero/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{a}nero/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{a}nero/nero.css">
{chr(10).join(scripts)}
{seo_nuova(route) if route in SEO_NUOVE else seo_block(old)}
</head>
"""
        part = lambda s: (s.replace('%R%', R).replace('%ROUTE%', route).replace('%N%', num)
                          .replace('%TKEY%', tkey).replace('%TITOLO%', titolo))
        content = (HERE / 'corpi' / f'{body}.html').read_text()
        for k, v in commit.items():
            content = content.replace(k, v)
        if file.startswith('assets/'):
            content = content  # i link dei crediti sono già relativi a /assets/
        html = head + f'<body data-pagina="{body}">\n' + part(testata) + '\n' + part(content) + '\n' + part(colophon) + \
            f'\n<script src="{a}ingresso/ingresso.js" defer></script>\n</body>\n</html>\n'
        target.write_text(html)
        print('wrote', file)


if __name__ == '__main__':
    main()
