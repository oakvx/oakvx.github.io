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
]

BOOT = """<script data-ingresso-bootstrap>(()=>{const r=document.documentElement;let seen=false;try{seen=sessionStorage.getItem('oakvx-ingresso')==='1'}catch{}const v=new URLSearchParams(location.search).get('ingresso'),bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);if(v==='1'||(v!=='0'&&!seen&&!bot)){r.classList.add('ingresso-attivo');setTimeout(()=>{if(!window.__oakvxIngresso)r.classList.remove('ingresso-attivo')},4000)}})();</script>"""

PREPAINT = """<script>(()=>{const r=document.documentElement;r.classList.add('js');let lang=null,paused=false;const bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|lighthouse/i.test(navigator.userAgent);try{lang=localStorage.getItem('lang');paused=localStorage.getItem('motion')==='paused'}catch{}const q=new URLSearchParams(location.search).get('lang');if(q==='it'||q==='en'){lang=q;try{localStorage.setItem('lang',q)}catch{}}if(!lang&&!bot&&(navigator.language||'').toLowerCase().startsWith('en'))lang='en';if(lang==='en'&&r.dataset.staticLang!=='en'&&r.dataset.langEnUrl&&!bot){location.replace(r.dataset.langEnUrl+location.hash);return}const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce||paused)r.classList.add('calm');if(paused)r.classList.add('paused');try{if(!reduce&&!paused&&sessionStorage.getItem('nero-sparo'))r.classList.add('sparo-arrivo')}catch{}})();</script>"""


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
        old = target.read_text()
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
{seo_block(old)}
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
